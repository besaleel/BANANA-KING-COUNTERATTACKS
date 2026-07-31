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
  hero: 'banana-king-no-espaco.png',
  hero2: 'banana-king-no-espaco-espelhado.png',
  vil: 'vilao-Trasho.png',
  vil2: 'vilao-Trasho-espelhado.png',
  n00: 'nave-inimiga-00.png',
  n01: 'nave-inimiga-01.png',
  n02: 'nave-inimiga-02.png',
  n03: 'nave-inimiga-03.png',
  n04: 'nave-inimiga-04.png',
  n05: 'nave-inimiga-05.png'
};

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
