/**
 * Walk-cycle da tela de vitoria final (epico 5 do backlog).
 *
 * Os frames sao cenas inteiras que compartilham o mesmo cenario, entao a
 * animacao e' so a troca do `src` de um <img> em tela cheia. Nao usa o canvas
 * do gameplay: quando esta tela aparece o game loop ja parou, e um <img> com
 * `object-fit: cover` resolve o escalonamento em qualquer aparelho sem
 * calculo manual.
 *
 * As imagens sao pre-carregadas e mantidas em memoria (`cache`) porque a
 * troca de `src` a cada 125 ms com o arquivo ainda em disco faz o frame
 * piscar em branco no primeiro ciclo.
 */
import { WIN_FRAMES, assetUrl, ready } from './assets.js';

/** ~8 fps, conforme o epico 5. */
const FRAME_MS = 125;

export class WinAnimation {
  /** @param {HTMLImageElement} el <img> alvo, em tela cheia. */
  constructor(el) {
    this.el = el;
    this.cache = [];
    this.timer = 0;
    this.i = 0;
    this.preload();
  }

  /** Dispara o download dos frames e guarda as referencias. */
  preload() {
    if (this.cache.length) return;
    // frames repetidos na sequencia compartilham o mesmo Image
    const byFile = new Map();
    this.cache = WIN_FRAMES.map((f) => {
      let im = byFile.get(f);
      if (!im) {
        im = new Image();
        im.src = assetUrl(f);
        byFile.set(f, im);
      }
      return im;
    });
  }

  /**
   * Inicia o ciclo. Idempotente: chamar duas vezes nao acumula timers.
   * Mostra o primeiro frame imediatamente para a tela nunca aparecer vazia.
   */
  start() {
    this.stop();
    this.preload();
    this.i = 0;
    this.showCurrent();
    this.timer = setInterval(() => {
      this.i = (this.i + 1) % this.cache.length;
      this.showCurrent();
    }, FRAME_MS);
  }

  /** Para o ciclo e libera o timer (a tela saiu de vista). */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
  }

  /**
   * Aplica o frame atual. Se a imagem ainda nao decodificou, mantem o que
   * estava na tela em vez de piscar em branco - o proximo tick tenta de novo.
   */
  showCurrent() {
    const im = this.cache[this.i];
    if (ready(im)) this.el.src = im.src;
    else if (!this.el.src) this.el.src = im.src;
  }
}
