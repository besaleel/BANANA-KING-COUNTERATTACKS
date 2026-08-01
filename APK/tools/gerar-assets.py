"""
Converte os assets de PNG cru para WebP (epico 6.1 do backlog).

Uso:  python APK/tools/gerar-assets.py
Fonte: PROJECT/assets/ (arte original)  ->  saida: APK/public/assets/ (.webp)

Duas economias distintas:
  1. RESOLUCAO - os sprites estao em 1024x1024 mas sao desenhados em ~60px
     (render.js: naves 60x46, heroi 66x66, Trasho 96x82) com DPR limitado a 2x.
  2. FORMATO - WebP no lugar de PNG.

Resultado medido em 31/07/2026: 18,6 MB -> 0,7 MB nos arquivos convertidos;
o diretorio inteiro caiu de 26 MB para 1,8 MB.

>> Por que os alvos dos sprites sao maiores que o "necessario":
   reduzir 1024->200 e DEPOIS comprimir com lossy degrada muito mais do que
   cada operacao isolada. Medido no heroi (PSNR sobre pixels opacos, na
   resolucao de exibicao):

       so resize 1024->200 .......... 48,1 dB
       so WebP q95, sem resize ...... 47,7 dB
       resize 200 + WebP q95 ........ 32,2 dB   <- ruim
       resize 320 + WebP q92 ........ 36,6 dB   <- adotado

   Por isso os alvos ficaram em ~4x o tamanho de exibicao, nao 2x. O custo
   e' de poucos KB e evita artefato visivel na borda do sprite.

Alpha e' preservado (WebP suporta), entao sprites recortados continuam
recortados. Backgrounds e frames de vitoria sao opacos.

Faixa de qualidade final (PSNR sobre pixels opacos): 36,6 a 44,7 dB.
"""
import os, sys, glob
from PIL import Image

import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = str(ROOT / 'PROJECT' / 'assets')
DST = str(ROOT / 'APK' / 'public' / 'assets')

# tamanho logico maximo em que cada asset aparece na tela (de render.js)
# alvo = logico * 2 (DPR max) * 1.25 (margem) -> arredondado
PLAN = {
    # backgrounds: preenchem o frame 480x854 inteiro
    **{f'background-fase{i:02d}.png': dict(target=(960, 1286), q=82, alpha=False)
       for i in range(1, 11)},

    # frames da vitoria final: tela cheia, 768x1376 -> mantem quase tudo
    **{f'win_Walk-Frame-{n}-Phone.png': dict(target=(768, 1376), q=84, alpha=False)
       for n in (1, 2, 5)},

    # sprites de gameplay (desenhados 60x46 / 66x66 / 96x82)
    **{f'nave-inimiga-{i:02d}.png': dict(target=(288, 288), q=92, alpha=True)
       for i in range(6)},
    'banana-king-no-espaco.png':           dict(target=(320, 320), q=92, alpha=True),
    'banana-king-no-espaco-espelhado.png': dict(target=(320, 320), q=92, alpha=True),
    'vilao-Trasho.png':                    dict(target=(384, 384), q=92, alpha=True),
    'vilao-Trasho-espelhado.png':          dict(target=(384, 384), q=92, alpha=True),

    # UI: logo do menu ocupa ate 280px de largura -> 2.5x
    'logo-transparente.png': dict(target=(700, 700), q=95, alpha=True),
}

# O favicon do web app continua PNG (compatibilidade maxima), mas reduzido:
# o original de 1024x1024 pesava 851 KB dentro do APK sem necessidade nenhuma
# - o icone do launcher Android NAO vem daqui, e sim dos mipmaps gerados em
# android/app/src/main/res/. 192px cobre qualquer uso de favicon.
FAVICON = dict(src='icon.png', size=(192, 192))

# logo.png fica so em PROJECT/assets: nao e' referenciado pelo app (o menu usa
# logo-transparente) e serve de base para o icone 512x512 da loja (epico 11).

def convert(name, target, q, alpha):
    src = os.path.join(SRC, name)
    if not os.path.exists(src):
        return None
    im = Image.open(src)
    im = im.convert('RGBA' if alpha else 'RGB')
    before_dim = im.size
    im.thumbnail(target, Image.LANCZOS)   # so reduz, nunca amplia
    out = os.path.join(DST, os.path.splitext(name)[0] + '.webp')
    im.save(out, 'WEBP', quality=q, method=6)
    return dict(name=name, before=os.path.getsize(src), after=os.path.getsize(out),
                dim_before=before_dim, dim_after=im.size, out=os.path.basename(out))

def copy_favicon():
    """Reduz e copia o favicon, mantendo PNG."""
    src = os.path.join(SRC, FAVICON['src'])
    if not os.path.exists(src):
        return None
    im = Image.open(src).convert('RGBA')
    before = os.path.getsize(src)
    im.thumbnail(FAVICON['size'], Image.LANCZOS)
    out = os.path.join(DST, FAVICON['src'])
    im.save(out, 'PNG', optimize=True)
    return dict(name=FAVICON['src'], before=before, after=os.path.getsize(out),
                dim_before=(1024, 1024), dim_after=im.size, out=FAVICON['src'])


def copy_svgs():
    """SVG e' vetorial: copiado sem conversao (converter so pioraria)."""
    n = 0
    for f in glob.glob(os.path.join(SRC, '*.svg')):
        base = os.path.basename(f)
        # so o que o app referencia (tela de vitoria de fase)
        if base != 'gorila-frente-banana-01.svg':
            continue
        with open(f, 'rb') as fh:
            data = fh.read()
        with open(os.path.join(DST, base), 'wb') as fh:
            fh.write(data)
        n += 1
    return n


if __name__ == '__main__':
    os.makedirs(DST, exist_ok=True)
    rows, tb, ta = [], 0, 0
    for name, cfg in PLAN.items():
        r = convert(name, cfg['target'], cfg['q'], cfg['alpha'])
        if not r:
            print('AUSENTE:', name); continue
        rows.append(r); tb += r['before']; ta += r['after']
    fav = copy_favicon()
    if fav:
        rows.append(fav); tb += fav['before']; ta += fav['after']
    print(f'SVG copiados sem conversao: {copy_svgs()}')
    rows.sort(key=lambda r: -r['before'])
    print(f"{'asset':40} {'antes':>9} {'depois':>9} {'reducao':>8}  dimensao")
    for r in rows:
        red = 100 * (1 - r['after'] / r['before'])
        print(f"{r['name']:40} {r['before']/1024:8.0f}K {r['after']/1024:8.0f}K "
              f"{red:7.1f}%  {r['dim_before'][0]}x{r['dim_before'][1]} -> {r['dim_after'][0]}x{r['dim_after'][1]}")
    print(f"\nTOTAL convertido: {tb/1024/1024:.1f} MB -> {ta/1024/1024:.1f} MB "
          f"({100*(1-ta/tb):.1f}% menor)")
