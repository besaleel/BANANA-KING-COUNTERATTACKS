/**
 * Carregamento de assets com caminhos padronizados (epico 2 do backlog).
 *
 * Toda imagem vive em APK/public/assets/ e e' referenciada por URL relativa
 * a partir do documento (`assets/...`), coerente tanto no `vite dev` quanto no
 * bundle empacotado pelo Capacitor. Isso elimina a incoerencia da POC, onde
 * support.js era relativo ao HTML e os assets relativos a raiz do repositorio
 * (contornada por servir-prototipo.py).
 */
export const ASSET_BASE = 'assets/';

const FILES = {
  hero: 'banana-king-no-espaco.webp',
  hero2: 'banana-king-no-espaco-espelhado.webp',
  vil: 'vilao-Trasho.webp',
  vil2: 'vilao-Trasho-espelhado.webp',
  n00: 'nave-inimiga-00.webp',
  n01: 'nave-inimiga-01.webp',
  n02: 'nave-inimiga-02.webp',
  n03: 'nave-inimiga-03.webp',
  n04: 'nave-inimiga-04.webp',
  n05: 'nave-inimiga-05.webp'
};

/**
 * Walk-cycle da vitoria final (epico 5).
 *
 * Sao cenas completas (768x1376, mesmo cenario), nao sprites recortados: a
 * animacao troca a imagem inteira. Os frames 3 e 4 existem nos assets mas
 * ficam de fora - foram renderizados em 937x1679 com o personagem em outra
 * escala e enquadramento, entao intercala-los com 1/2/5 produz um salto de
 * zoom em vez de um passo. A ordem 1-2-5-2 usa so os tres frames que
 * compartilham cenario (diferenca medida: ~1% dos pixels, restrita a faixa
 * y 467-1001, que e' o proprio personagem).
 */
export const WIN_FRAMES = [
  'win_Walk-Frame-1-Phone.webp',
  'win_Walk-Frame-2-Phone.webp',
  'win_Walk-Frame-5-Phone.webp',
  'win_Walk-Frame-2-Phone.webp'
];

/** Dispara o carregamento de todos os sprites de gameplay. */
export function loadImages() {
  const img = {};
  for (const k in FILES) {
    const im = new Image();
    im.src = ASSET_BASE + FILES[k];
    img[k] = im;
  }
  return img;
}

/** true quando a imagem ja pode ser desenhada sem erro. */
export function ready(im) {
  return !!(im && im.complete && im.naturalWidth);
}

/** URL de um asset avulso (logo, background, etc). */
export function assetUrl(file) {
  return ASSET_BASE + file;
}
