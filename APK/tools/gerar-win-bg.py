"""
Gera o cenario da tela de vitoria final: caminhada rumo ao sol poente.

Motivo: a arte anterior (win_bg.webp) tinha dois defeitos de composicao que
apareceram no playtest - uma EMENDA VERTICAL visivel em x=470 (61 % da largura,
onde duas imagens foram coladas) e o SOL escondido atras da floresta, na
direita, quase invisivel. Numa tela cuja ideia e' "caminhar rumo ao sol", o sol
precisa ser o destino: grande, centralizado no horizonte e desimpedido.

Saida: APK/public/assets/win_bg.webp (768x1376, mesma proporcao do frame
480x854 para o `object-fit: cover` nao cortar nada perceptivel).

Rode com:  python APK/tools/gerar-win-bg.py
Idempotente: rodar duas vezes produz o mesmo arquivo.
"""
import math
import random
import pathlib

from PIL import Image, ImageDraw

W, H = 768, 1376
OUT = pathlib.Path(__file__).resolve().parents[1] / "public" / "assets" / "win_bg.webp"

# Horizonte e sol, em fracao da altura. O sol fica ligeiramente ACIMA da linha
# do horizonte para leitura de "poente" (metade submersa le como nascente).
HORIZON = 0.615
SUN_CY = 0.615
SUN_R = 0.115 * W

# Paleta - a mesma familia da UI do jogo (roxo #2b1b3d, amarelo #ffd23f,
# laranja #ff8c42), para a tela final nao parecer de outro jogo.
SKY = [
    (0.00, (58, 34, 74)),     # roxo profundo no topo
    (0.22, (108, 52, 96)),    # roxo/magenta
    (0.40, (176, 76, 98)),    # rosa queimado
    (0.52, (233, 118, 78)),   # laranja
    (0.585, (255, 178, 92)),  # dourado junto ao horizonte
    (0.615, (255, 214, 138)), # halo do sol
]
GROUND_NEAR = (74, 52, 44)
GROUND_FAR = (96, 74, 52)


def lerp(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def sky_color(f):
    """Cor do ceu na fracao vertical `f`, interpolando as paradas de SKY."""
    if f <= SKY[0][0]:
        return SKY[0][1]
    for (f0, c0), (f1, c1) in zip(SKY, SKY[1:]):
        if f <= f1:
            return lerp(c0, c1, (f - f0) / (f1 - f0))
    return SKY[-1][1]


def main():
    random.seed(7)   # determinismo: a arte precisa sair igual toda vez
    img = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)

    horizon_y = int(H * HORIZON)
    sun_cx, sun_cy = W // 2, int(H * SUN_CY)

    # --- ceu em faixas horizontais ---
    # Faixas de 4 px em vez de gradiente continuo: e' o que da o aspecto de
    # pixel art e combina com `image-rendering: pixelated` no CSS.
    band = 4
    for y in range(0, horizon_y, band):
        d.rectangle([0, y, W, y + band], fill=sky_color(y / H))

    # --- halo do sol: aneis concentricos, do mais claro ao ceu ---
    # O raio maximo do halo e' ~2x o disco. Passar muito disso (tentativa
    # anterior: 5x) transforma o brilho num domo que cobre metade do ceu e
    # engole o proprio disco.
    for i in range(24, 0, -1):
        r = SUN_R * (1 + i * 0.045)
        t = i / 24
        base = sky_color(sun_cy / H)
        col = lerp((255, 232, 172), base, t ** 0.5)
        d.ellipse([sun_cx - r, sun_cy - r, sun_cx + r, sun_cy + r], fill=col)

    # --- disco do sol ---
    d.ellipse([sun_cx - SUN_R, sun_cy - SUN_R, sun_cx + SUN_R, sun_cy + SUN_R],
              fill=(255, 240, 190))
    # nucleo levemente mais quente, deslocado para baixo
    r2 = SUN_R * 0.78
    d.ellipse([sun_cx - r2, sun_cy - r2 + 6, sun_cx + r2, sun_cy + r2 + 6],
              fill=(255, 248, 214))

    # --- nuvens: faixas finas atravessando o ceu ---
    # Cruzam o sol de proposito, para ele ficar integrado ao ceu e nao colado.
    for cy_f, x0_f, w_f, alpha in [
        (0.16, 0.05, 0.42, 0.30), (0.24, 0.55, 0.40, 0.26),
        (0.33, 0.12, 0.34, 0.24), (0.41, 0.48, 0.46, 0.22),
        (0.47, 0.05, 0.30, 0.20), (0.52, 0.58, 0.36, 0.18),
        (0.565, 0.20, 0.55, 0.16),
    ]:
        cy = int(H * cy_f)
        x0 = int(W * x0_f)
        x1 = x0 + int(W * w_f)
        base = sky_color(cy_f)
        col = lerp(base, (255, 236, 200), alpha)
        for k in range(3):
            yy = cy + k * 4
            pad = k * int(W * 0.03)
            d.rectangle([x0 + pad, yy, x1 - pad, yy + 3], fill=col)

    # --- floresta distante: silhueta simetrica nos dois lados ---
    # A arte antiga so tinha arvores a direita, o que criava o "buraco" visual
    # e a emenda. Aqui as duas margens sao arborizadas e o CENTRO fica aberto,
    # emoldurando o sol e o caminho do personagem.
    def treeline(y_base, color, density, hmin, hmax, gap_half_w):
        x = -10
        while x < W + 10:
            step = random.randint(*density)
            # deixa o miolo livre: o corredor por onde se ve o sol
            if abs(x - W / 2) > gap_half_w:
                th = random.randint(hmin, hmax)
                tw = max(6, int(th * 0.30))
                # Pinheiro em degraus: a largura afina do pe ate a ponta, e cada
                # degrau e' um retangulo. Da a silhueta serrilhada de pixel art,
                # em vez do triangulo liso de um `polygon` unico.
                steps = max(5, int(th / 9))
                for lvl in range(steps):
                    f = lvl / steps
                    ly = y_base - th * f
                    lw = tw * (1 - f) ** 0.78
                    sh = th / steps + 1
                    d.rectangle([x - lw, ly - sh, x + lw, ly], fill=color)
                # tronco curto sob a copa
                d.rectangle([x - 2, y_base - 4, x + 2, y_base + 5], fill=color)
            x += step

    # camada distante (mais clara, some no ceu)
    treeline(horizon_y + 6, (86, 62, 92), (16, 26), 34, 62, W * 0.30)
    # camada media
    treeline(horizon_y + 16, (62, 44, 74), (20, 32), 48, 88, W * 0.26)
    # camada proxima (quase preta)
    treeline(horizon_y + 30, (42, 30, 52), (26, 40), 66, 118, W * 0.22)

    # --- chao ---
    for y in range(horizon_y, H, band):
        t = (y - horizon_y) / max(1, H - horizon_y)
        d.rectangle([0, y, W, y + band], fill=lerp(GROUND_FAR, GROUND_NEAR, t))

    # --- reflexo/caminho de luz do sol no chao ---
    # Um corredor que se alarga em direcao ao observador: guia o olhar ate o
    # sol e marca por onde o personagem caminha.
    # Muitas passadas finas com queda suave (gaussiana) na horizontal: o brilho
    # se dissolve no chao sem deixar borda. Com 3 faixas largas as transicoes
    # apareciam como degraus retos e a cena lia "estrada asfaltada", nao luz.
    for y in range(horizon_y, H, 2):
        t = (y - horizon_y) / max(1, H - horizon_y)
        half = SUN_R * (0.34 + t * 2.7)
        base = lerp(GROUND_FAR, GROUND_NEAR, t)
        strength = 0.40 * (1 - t * 0.62)
        steps = 16
        for k in range(steps, 0, -1):
            fk = k / steps
            hw = half * fk
            # perfil suave: forte no eixo, quase nulo na borda
            a = strength * math.exp(-3.0 * (fk ** 2)) * 0.5
            if a <= 0.004:
                continue
            d.rectangle([sun_cx - hw, y, sun_cx + hw, y + 2],
                        fill=lerp(base, (255, 216, 146), min(0.5, a)))

    # --- capim em silhueta, so nas bordas inferiores ---
    # Enquadra a cena sem poluir a faixa central onde o personagem anda.
    for _ in range(220):
        gx = random.randint(0, W)
        if abs(gx - W / 2) < W * 0.18:
            continue
        gy = random.randint(horizon_y + 40, H)
        gh = random.randint(6, 20)
        shade = lerp(GROUND_NEAR, (30, 22, 20), random.random() * 0.6)
        d.line([(gx, gy), (gx + random.randint(-3, 3), gy - gh)], fill=shade, width=2)

    # --- escurecimento do topo, para o texto do titulo ganhar contraste ---
    # Faixa horizontal com queda linear, desenhada linha a linha. A versao com
    # `rectangle(outline=...)` deixava um artefato retangular visivel no canto
    # superior esquerdo, porque os retangulos concentricos nao fechavam.
    veil = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(veil)
    top_h = int(H * 0.26)
    for y in range(top_h):
        vd.line([(0, y), (W, y)], fill=int(86 * (1 - y / top_h) ** 1.4))
    img.paste(Image.new("RGB", (W, H), (26, 14, 40)), (0, 0), veil)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "WEBP", quality=88, method=6)
    print(f"gerado: {OUT}  ({OUT.stat().st_size / 1024:.1f} KB, {W}x{H})")
    print(f"sol no centro (x={sun_cx}, {SUN_CY:.0%} da altura), sem emenda vertical")


if __name__ == "__main__":
    main()
