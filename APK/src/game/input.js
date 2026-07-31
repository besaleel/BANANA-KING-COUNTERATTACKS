/**
 * Entrada: arrasto (pointer) + teclado.
 * Todo o movimento e' aplicado em coordenadas logicas (480x854).
 */
import { W } from './entities.js';

export class Input {
  constructor() {
    this.keys = Object.create(null);
    this.pointerX = null;   // posicao logica desejada, ou null se sem toque
    this._handlers = [];
    this.onEscape = null;
  }

  attachKeyboard() {
    const onKey = (e) => {
      if (e.type === 'keydown' && e.key === 'Escape') {
        if (this.onEscape) this.onEscape();
        return;
      }
      this.keys[e.key] = e.type === 'keydown';
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    this._handlers.push(['keydown', window, onKey], ['keyup', window, onKey]);
  }

  /** Liga o arrasto ao canvas; converte clientX para o espaco logico. */
  attachPointer(canvas) {
    const toX = (e) => {
      const r = canvas.getBoundingClientRect();
      return (e.clientX - r.left) / r.width * W;
    };
    const down = (e) => {
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      this.pointerX = toX(e);
    };
    const move = (e) => {
      if (e.buttons || e.pointerType === 'touch') this.pointerX = toX(e);
    };
    const up = () => { this.pointerX = null; };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    this._handlers.push(
      ['pointerdown', canvas, down], ['pointermove', canvas, move],
      ['pointerup', canvas, up], ['pointercancel', canvas, up]
    );
  }

  detach() {
    for (const [type, target, fn] of this._handlers) target.removeEventListener(type, fn);
    this._handlers.length = 0;
  }
}
