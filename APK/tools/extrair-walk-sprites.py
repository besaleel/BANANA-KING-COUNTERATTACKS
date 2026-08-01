"""
Extrai o walk-cycle da vitoria final como sprites transparentes + um cenario limpo.

Motivacao (playtest humano da campanha completa): a animacao trocava cenas
inteiras 768x1376 e o personagem NAO caminhava - ele so alternava a pose no
mesmo lugar. Pior, os frames 1 e 5 sao praticamente a mesma pose (~1,7 % de
pixels diferentes, quase tudo ruido de compressao), entao a sequencia 1-2-5-2
valia como duas poses piscando: le como "pisando em falso", nao como caminhada.

Para o personagem atravessar a tela ele precisa estar SEPARADO do cenario.
Como a arte veio achatada, o recorte e' feito aqui:

  1. O cenario e' identico nos tres frames, entao a diferenca ENTRE frames
     isola o personagem sem precisar de chroma key. Medido: o bloco denso fica
     em x 60-460, y 466-1002 (o resto e' ruido esparso de compressao webp).
  2. So DENTRO desse recorte o fundo e' reconstruido - repetindo a coluna
     limpa imediatamente a esquerda do personagem, ja que ali o cenario e'
     composto de bandas horizontais chapadas (ceu, campo, sombra do chao).
     Fora do recorte o cenario original e' preservado intacto, inclusive as
     arvores, o sol e as montanhas da direita, que uma reconstrucao por linha
     nao saberia recriar - foi exatamente o que quebrou a primeira tentativa.
  3. O sprite de cada frame e' o que difere desse fundo reconstruido, com
     alpha binario e preenchimento de buracos para nao furar o personagem
     onde a cor dele coincide com a do ceu.

Saida em public/assets/: win_bg.webp (cenario sem personagem) e
win_walk-{1,2,5}.webp (sprites, todos no mesmo enquadramento).

Uso: python tools/extrair-walk-sprites.py
"""
import itertools
import os

import numpy as np
from PIL import Image

ASSETS = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets')
FRAMES = {
    1: 'win_Walk-Frame-1-Phone.webp',
    2: 'win_Walk-Frame-2-Phone.webp',
    5: 'win_Walk-Frame-5-Phone.webp',
}
ART_W, ART_H = 768, 1376
# Recorte do personagem (medido pela diferenca entre frames, com folga).
# x0 vai ate 20 - nao 52 - porque o braco e a sombra do gorila passam a
# esquerda de 52 em algumas linhas, e o que ficava de fora do recorte
# sobrevivia como borrao escuro no cenario reconstruido.
# y1 vai ate 1030 para incluir as ultimas linhas da sombra no chao, que ficavam
# de fora e sobravam como uma elipse solta no cenario reconstruido.
BOX = (20, 458, 470, 1030)   # x0, y0, x1, y1
# Faixa usada para refazer o fundo. Fica na borda ESQUERDA DA ARTE, nao na do
# recorte: o personagem chega a x=68 na altura do braco, entao amostrar junto
# ao recorte pegava o proprio gorila e manchava o cenario reconstruido.
EDGE = 16
TOL = 20
# Da silhueta (montanha e arvores, medida pela variacao horizontal na metade
# direita da arte) para baixo, a reconstrucao do fundo por bandas horizontais
# nao acompanha o cenario real e a paisagem vazava para dentro do sprite.
# Nessa faixa o personagem nunca passa de x~380, entao estreitar o recorte
# remove a paisagem sem encostar no gorila.
BANDA_CENARIO = (695, 1030)
BANDA_X_MAX = 360


def carregar():
    return {k: np.array(Image.open(os.path.join(ASSETS, f)).convert('RGB'), dtype=np.int16)
            for k, f in FRAMES.items()}


def montar_fundo(frames):
    """Cenario sem personagem: copia o frame original e refaz APENAS o retangulo
    do personagem, repetindo a cor de cada linha amostrada na borda esquerda da
    ARTE (x < EDGE), que fica livre do personagem em toda a faixa.

    Amostrar junto ao recorte nao servia: o gorila chega a x=68 na altura do
    braco, entao a amostra pegava o proprio personagem e deixava um borrao
    escuro atravessando o cenario."""
    x0, y0, x1, y1 = BOX
    base = frames[2].copy()
    borda = np.median(np.stack([f[y0:y1, :EDGE] for f in frames.values()]), axis=0)
    linha = np.median(borda, axis=1)                    # cor de cada linha
    base[y0:y1, x0:x1] = np.repeat(linha[:, None, :], x1 - x0, axis=1)
    return base.astype(np.uint8)


def preencher_buracos(mask, vao_max=28):
    """Fecha vazios internos do personagem sem inchar o recorte.

    Preencher da primeira ate a ultima coluna marcada da linha era simples
    demais: na altura do braco erguido isso atravessava o vao entre o corpo e
    a taca, e o retangulo inteiro - com montanha e arvores dentro - entrava no
    sprite. Aqui so vaos menores que `vao_max` sao fechados, o que cobre o
    buraco real (cor do personagem coincidindo com a do ceu) e preserva o vao
    legitimo entre corpo e braco.
    """
    out = mask.copy()
    for y in range(mask.shape[0]):
        xs = np.flatnonzero(mask[y])
        if xs.size < 2:
            continue
        for i in range(len(xs) - 1):
            if xs[i + 1] - xs[i] <= vao_max:
                out[y, xs[i]:xs[i + 1] + 1] = True
    return out


def limpar_riscos(mask, espessura=14):
    """Apaga riscos horizontais finos - restos das bandas do ceu que sobrevivem
    ao teste de diferenca. O personagem tem dezenas de pixels de altura em
    qualquer coluna, entao exigir `espessura` linhas verticais consecutivas
    remove os riscos sem comer o gorila."""
    h = mask.shape[0]
    denso = mask.copy()
    for dy in range(1, espessura):
        denso[:h - dy] &= mask[dy:]
    out = np.zeros_like(mask)
    for dy in range(espessura):
        out[dy:] |= denso[:h - dy]
    return out & mask


def maior_componente(mask):
    """Mantem so o maior blob conexo - descarta pontinhos soltos que o ruido de
    compressao do webp deixa espalhados pelo ceu."""
    lab = np.zeros(mask.shape, np.int32)
    atual, tam = 0, {}
    h, w = mask.shape
    for sy in range(h):
        for sx in range(w):
            if not mask[sy, sx] or lab[sy, sx]:
                continue
            atual += 1
            pilha, n = [(sy, sx)], 0
            lab[sy, sx] = atual
            while pilha:
                cy, cx = pilha.pop()
                n += 1
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                        lab[ny, nx] = atual
                        pilha.append((ny, nx))
            tam[atual] = n
    if not tam:
        return mask
    return lab == max(tam, key=tam.get)


def extrair(frame, fundo):
    """Recorta o personagem de um frame.

    A mascara e' a diferenca contra `fundo` (cenario reconstruido por bandas
    horizontais), com o recorte ESTREITADO na faixa da montanha e das arvores -
    a unica onde o fundo por bandas nao reproduz o cenario e a paisagem entrava
    junto no sprite.

    Estreitar o recorte e' o que funciona ali. Tentei antes exigir tambem
    diferenca contra a mediana dos frames, mas onde as tres poses se sobrepoem
    a mediana E' o proprio gorila, e o teste apagava o corpo dele; aplicado so
    na faixa, cortava o personagem em dois e o filtro de componente conexo
    ficava so com as pernas.
    """
    x0, y0, x1, y1 = BOX
    by0, by1 = BANDA_CENARIO
    d_fundo = np.abs(frame - fundo.astype(np.int16)).max(axis=2)
    mask = np.zeros(d_fundo.shape, bool)
    janela = (slice(y0, y1), slice(x0, x1))           # so dentro do recorte
    mask[janela] = d_fundo[janela] > TOL
    mask[by0:by1, BANDA_X_MAX:] = False               # fora a paisagem
    mask = limpar_riscos(mask)
    mask = preencher_buracos(mask)
    mask = maior_componente(mask)
    rgba = np.dstack([frame.astype(np.uint8),
                      np.where(mask, 255, 0).astype(np.uint8)])
    return rgba, mask


def main():
    frames = carregar()
    fundo = montar_fundo(frames)

    sprites, masks = {}, {}
    for k, f in frames.items():
        sprites[k], masks[k] = extrair(f, fundo)

    # Enquadramento COMUM aos tres sprites: recortar cada um no proprio bbox
    # deslocaria o personagem a cada troca de frame e traria o tremor de volta.
    uni = np.zeros(masks[1].shape, bool)
    for m in masks.values():
        uni |= m
    ys, xs = np.where(uni)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    print('enquadramento comum: x %d-%d  y %d-%d  (%dx%d)'
          % (x0, x1, y0, y1, x1 - x0, y1 - y0))

    Image.fromarray(fundo).save(os.path.join(ASSETS, 'win_bg.webp'), quality=92)
    print('win_bg.webp')
    for k, rgba in sprites.items():
        # Lossy com qualidade alta: pixel art de poucas cores, o webp lossless
        # ficava em ~136 KB por frame contra ~20 KB aqui, sem diferenca visivel.
        # `exact` preserva as cores dos pixels transparentes, evitando halo na
        # borda do recorte.
        Image.fromarray(rgba[y0:y1, x0:x1]).save(
            os.path.join(ASSETS, 'win_walk-%d.webp' % k), quality=90, exact=True)
        print('win_walk-%d.webp  pixels=%d' % (k, int(masks[k].sum())))

    # Fracoes da arte original, para o CSS posicionar o sprite sem numero magico.
    print('\nCSS (fracao de %dx%d): left=%.4f top=%.4f w=%.4f h=%.4f'
          % (ART_W, ART_H, x0 / ART_W, y0 / ART_H,
             (x1 - x0) / ART_W, (y1 - y0) / ART_H))


if __name__ == '__main__':
    main()
