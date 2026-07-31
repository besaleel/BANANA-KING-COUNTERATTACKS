/**
 * Object pooling generico (epico 2 do backlog).
 * Evita alocacao/GC em mobile para tiros, cocos, explosoes, particulas
 * e textos flutuantes.
 *
 * Uso:
 *   const p = new Pool(makeBullet, resetBullet, 64);
 *   const b = p.obtain(); ...
 *   p.sweep();            // recolhe tudo que tem alive === false
 */
export class Pool {
  /**
   * @param {() => object} factory cria uma instancia zerada
   * @param {(o: object) => void} [reset] limpa a instancia ao voltar ao pool
   * @param {number} [prealloc] quantidade pre-alocada
   */
  constructor(factory, reset, prealloc = 0) {
    this.factory = factory;
    this.reset = reset || null;
    this.free = [];
    this.active = [];
    for (let i = 0; i < prealloc; i++) this.free.push(factory());
  }

  /** Retira um objeto do pool e marca como ativo. */
  obtain() {
    const o = this.free.length ? this.free.pop() : this.factory();
    o.alive = true;
    this.active.push(o);
    return o;
  }

  /** Marca um objeto para reciclagem no proximo sweep(). */
  release(o) {
    o.alive = false;
  }

  /**
   * Devolve ao pool tudo que foi marcado com alive === false.
   * Compacta o array in-place (sem alocar novo array, ao contrario do
   * filter() usado na POC).
   */
  sweep() {
    const a = this.active;
    let w = 0;
    for (let i = 0; i < a.length; i++) {
      const o = a[i];
      if (o.alive) {
        a[w++] = o;
      } else {
        if (this.reset) this.reset(o);
        this.free.push(o);
      }
    }
    a.length = w;
  }

  /** Recicla todos os ativos de uma vez (troca de fase, morte, etc). */
  clear() {
    const a = this.active;
    for (let i = 0; i < a.length; i++) {
      if (this.reset) this.reset(a[i]);
      a[i].alive = false;
      this.free.push(a[i]);
    }
    a.length = 0;
  }

  get items() {
    return this.active;
  }

  get count() {
    return this.active.length;
  }
}
