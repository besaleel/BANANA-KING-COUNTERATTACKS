#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera os icones de launcher e as splash screens do Android a partir da arte
oficial do jogo, substituindo os placeholders que o Capacitor cria no
`npx cap add android` (o "X" azul em fundo branco).

Fonte da arte:
  - DEPLOY/store-assets/icon-512.png  -> icone (mesma identidade da ficha da
    Play Store, para o launcher nao divergir do que o usuario viu na loja)
  - PROJECT/assets/logo-transparente.png -> splash (precisa de alpha para
    compor sobre o fundo escuro do app)

Saida (APK/android/app/src/main/res/):
  - mipmap-*/ic_launcher.png            icone legado, quadrado
  - mipmap-*/ic_launcher_round.png      icone legado, circular (Android 7.1-)
  - mipmap-*/ic_launcher_foreground.png camada de frente do adaptive icon
  - values/ic_launcher_background.xml   cor de fundo do adaptive icon
  - drawable*/splash.png                splash em todas as densidades

Uso:
    python APK/tools/gerar-icones.py

Requer Pillow (`pip install Pillow`). Rode de novo sempre que a arte de
`icon-512.png` ou `logo-transparente.png` mudar; o resultado e' deterministico,
entao rodar duas vezes nao muda nada.
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow nao encontrado. Instale com: pip install Pillow")

RAIZ = Path(__file__).resolve().parents[2]
RES = RAIZ / "APK" / "android" / "app" / "src" / "main" / "res"

FONTE_ICONE = RAIZ / "DEPLOY" / "store-assets" / "icon-512.png"
FONTE_SPLASH = RAIZ / "PROJECT" / "assets" / "logo-transparente.png"

# Fundo da splash: mesmo `backgroundColor` do capacitor.config.json, para a
# splash emendar com a primeira tela do jogo sem piscar.
FUNDO = (20, 9, 31)  # #14091f

# Fundo do adaptive icon. A arte do `icon-512.png` ja vem com seu proprio fundo
# preto, entao a camada de tras usa o MESMO preto: o recorte da mascara cai
# sobre a moldura da arte e o icone continua parecendo uma peca so. Usar o roxo
# do jogo aqui deixaria um quadrado preto "flutuando" dentro do circulo.
FUNDO_ICONE = (0, 0, 0)  # #000000

# Densidades do launcher: (pasta, lado do icone legado, lado do foreground).
# O foreground e' 108dp contra 48dp do legado -> 2.25x em toda densidade.
DENSIDADES_ICONE = [
    ("mdpi", 48, 108),
    ("hdpi", 72, 162),
    ("xhdpi", 96, 216),
    ("xxhdpi", 144, 324),
    ("xxxhdpi", 192, 432),
]

# Splash: (pasta, largura, altura). O Android recorta a splash para preencher a
# tela, entao cada orientacao tem seu proprio conjunto.
DENSIDADES_SPLASH = [
    ("drawable", 480, 320),
    ("drawable-port-mdpi", 320, 480),
    ("drawable-port-hdpi", 480, 800),
    ("drawable-port-xhdpi", 720, 1280),
    ("drawable-port-xxhdpi", 960, 1600),
    ("drawable-port-xxxhdpi", 1280, 1920),
    ("drawable-land-mdpi", 480, 320),
    ("drawable-land-hdpi", 800, 480),
    ("drawable-land-xhdpi", 1280, 720),
    ("drawable-land-xxhdpi", 1600, 960),
    ("drawable-land-xxxhdpi", 1920, 1280),
]

# Fracao do foreground ocupada pela arte.
#
# O Android mascara o adaptive icon (circulo, squircle, gota...) e so garante os
# 72dp centrais dos 108dp -> 66%. A recomendacao usual e' encolher a arte ate
# esse limite, mas isso vale para logo solto sobre fundo liso. Aqui a arte JA
# tem moldura propria: encolhe-la deixaria uma ilha preta no meio do quadro.
#
# Entao a arte preenche o quadro inteiro (1.0) e quem absorve o recorte e' a
# moldura arredondada do proprio desenho.
ESCALA_FOREGROUND = 1.0

# Recorte aplicado a arte ANTES de virar foreground, em fracao do lado do
# `icon-512.png`: (esquerda, topo, direita, base).
#
# Por que recortar: o launcher exibe so os 72dp centrais dos 108dp, ou seja
# aplica um zoom de 1.5x. Sobre a arte inteira esse zoom corta o "BANANA KING"
# no meio das letras - fica pior do que nao ter texto. O texto tambem seria
# ilegivel a 48dp na tela.
#
# Entao o foreground usa so o personagem (gorila + disco voador, a faixa
# y ~ 0.10-0.68 da arte), que e' o elemento reconhecivel no tamanho de launcher.
# O icone legado e o da loja continuam com a arte completa, texto incluso.
RECORTE_FOREGROUND = (0.02, 0.06, 0.98, 0.66)

# Fracao da menor dimensao da tela ocupada pelo logo na splash.
ESCALA_SPLASH = 0.62


def carregar(caminho: Path) -> Image.Image:
    if not caminho.exists():
        sys.exit(f"Arte de origem nao encontrada: {caminho}")
    return Image.open(caminho).convert("RGBA")


def redimensionar(img: Image.Image, largura: int, altura: int) -> Image.Image:
    return img.resize((largura, altura), Image.LANCZOS)


def mascara_circular(img: Image.Image) -> Image.Image:
    """Recorta a imagem num circulo, para o `ic_launcher_round`."""
    from PIL import ImageDraw

    lado = img.size[0]
    # Desenha a mascara em 4x e reduz: antialias sem precisar de filtro extra.
    mascara = Image.new("L", (lado * 4, lado * 4), 0)
    ImageDraw.Draw(mascara).ellipse((0, 0, lado * 4 - 1, lado * 4 - 1), fill=255)
    mascara = mascara.resize((lado, lado), Image.LANCZOS)

    saida = img.copy()
    saida.putalpha(mascara)
    return saida


def recortar_personagem(fonte: Image.Image) -> Image.Image:
    """Recorta a arte na faixa do personagem, mantendo o quadro quadrado.

    O recorte de `RECORTE_FOREGROUND` e' mais largo do que alto; para o icone
    nao esticar, o resultado e' completado ate virar quadrado - centralizado na
    horizontal e ancorado no topo do recorte, que e' onde esta o personagem.
    """
    largura, altura = fonte.size
    esq, topo, dir_, base = RECORTE_FOREGROUND
    caixa = (
        round(largura * esq),
        round(altura * topo),
        round(largura * dir_),
        round(altura * base),
    )
    recorte = fonte.crop(caixa)

    lado = max(recorte.size)
    quadro = Image.new("RGBA", (lado, lado), (0, 0, 0, 255))
    quadro.paste(
        recorte,
        ((lado - recorte.size[0]) // 2, (lado - recorte.size[1]) // 2),
        recorte,
    )
    return quadro


def gerar_icones(fonte: Image.Image) -> None:
    personagem = recortar_personagem(fonte)

    for pasta, lado_legado, lado_fg in DENSIDADES_ICONE:
        destino = RES / f"mipmap-{pasta}"
        destino.mkdir(parents=True, exist_ok=True)

        # --- icone legado (quadrado) e round: a arte preenche o quadro ---
        legado = redimensionar(fonte, lado_legado, lado_legado)
        legado.save(destino / "ic_launcher.png")
        mascara_circular(legado).save(destino / "ic_launcher_round.png")

        # --- foreground do adaptive icon ---
        # Com ESCALA_FOREGROUND = 1.0 a arte cobre o quadro todo; o quadro
        # transparente so aparece se a escala for reduzida no futuro.
        fg = Image.new("RGBA", (lado_fg, lado_fg), (0, 0, 0, 0))
        lado_arte = round(lado_fg * ESCALA_FOREGROUND)
        arte = redimensionar(personagem, lado_arte, lado_arte)
        deslocamento = (lado_fg - lado_arte) // 2
        fg.paste(arte, (deslocamento, deslocamento), arte)
        fg.save(destino / "ic_launcher_foreground.png")

        print(f"  mipmap-{pasta}: {lado_legado}px legado + round, {lado_fg}px foreground")


def gerar_splash(fonte: Image.Image) -> None:
    for pasta, largura, altura in DENSIDADES_SPLASH:
        destino = RES / pasta
        destino.mkdir(parents=True, exist_ok=True)

        tela = Image.new("RGBA", (largura, altura), FUNDO + (255,))
        lado_logo = round(min(largura, altura) * ESCALA_SPLASH)
        logo = redimensionar(fonte, lado_logo, lado_logo)
        tela.paste(logo, ((largura - lado_logo) // 2, (altura - lado_logo) // 2), logo)

        # Splash nao precisa de alpha: achata em RGB para poupar bytes.
        tela.convert("RGB").save(destino / "splash.png")
        print(f"  {pasta}: {largura}x{altura}")


def gerar_cor_de_fundo() -> None:
    """Reescreve a cor do adaptive icon: o padrao do Capacitor e' branco."""
    caminho = RES / "values" / "ic_launcher_background.xml"
    cor = "#{:02X}{:02X}{:02X}".format(*FUNDO_ICONE)
    caminho.write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        "<resources>\n"
        f'    <color name="ic_launcher_background">{cor}</color>\n'
        "</resources>\n",
        encoding="utf-8",
    )
    print(f"  values/ic_launcher_background.xml: {cor}")


def main() -> None:
    print(f"Icone   <- {FONTE_ICONE.relative_to(RAIZ)}")
    gerar_icones(carregar(FONTE_ICONE))

    print(f"Splash  <- {FONTE_SPLASH.relative_to(RAIZ)}")
    gerar_splash(carregar(FONTE_SPLASH))

    print("Adaptive icon")
    gerar_cor_de_fundo()

    print("\nPronto. Reconstrua o AAB (DOC/MANUAIS/GERAR-AAB.md) para o icone entrar no pacote.")


if __name__ == "__main__":
    main()
