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
 * O cenario e o personagem sao imagens SEPARADAS, geradas por
 * tools/extrair-walk-sprites.py a partir das cenas achatadas originais.
 *
 * A versao anterior trocava a cena inteira (768x1376) e nao convencia: o
 * personagem alternava a pose parado no mesmo ponto. Como os frames 1 e 5 sao
 * quase a mesma pose, a sequencia 1-2-5-2 valia como duas poses piscando -
 * lia como "pisando em falso", nao como caminhada. Com o personagem separado
 * do fundo, a pose alterna E ele atravessa a tela (a translacao fica no CSS,
 * ver .win-walker em styles.css), que e' o que faz a caminhada ler.
 *
 * Os frames 3 e 4 continuam de fora: foram renderizados em 937x1679, com o
 * personagem em outra escala, entao intercala-los produz um salto de zoom.
 */
export const WIN_BG = 'win_bg.webp';

/** Poses do ciclo, na ordem de exibicao. 1 = passo aberto, 2 = pes juntos. */
export const WIN_FRAMES = [
  'win_walk-1.webp',
  'win_walk-2.webp',
  'win_walk-5.webp',
  'win_walk-2.webp'
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
