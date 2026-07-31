/**
 * Game loop e regras de jogo - porte da POC
 * (PROJECT/Banana King - Fase 01.dc.html), sem DCLogic/support.js.
 *
 * Todos os numeros vem de src/config/fases.json (baseline v1, SS12.1 da spec).
 * Divergencia corrigida no porte: o fallback de drop de power-up era 12 na POC
 * (linha 361 do HTML); a spec fixa 4 % - item 3.4 do BACKLOG.
 *
 * FORA DE ESCOPO nesta rodada (epico 3 do backlog): nave destruida na barreira,
 * banana bonus, bonus de pontuacao, fases 02-10 jogaveis.
 */
import { W, H, createPools, createStage, createHero, shipPos } from './entities.js';
import { Renderer } from './render.js';

const DT_MAX = 0.033;      // SS12: dt limitado a 33 ms
const HUD_INTERVAL = 150;  // SS12: HUD re-render no maximo a cada 150 ms
const POWERUP_TYPES = ['triple', 'rapid', 'shield', 'life'];

export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} deps { images, audio, input, config, hooks }
   */
  constructor(canvas, deps) {
    this.canvas = canvas;
    this.img = deps.images;
    this.audio = deps.audio;
    this.input = deps.input;
    this.config = deps.config;
    this.baseline = deps.config.baseline;
    this.hooks = deps.hooks || {};

    this.renderer = new Renderer(canvas, this.img, this.baseline);
    this.pools = createPools();

    this.running = false;
    this.paused = false;
    this.raf = 0;
    this._last = 0;
    this._hudAt = 0;

    this.lives = 3;
    this.score = 0;
    this.phase = 1;

    this._onResize = () => this.renderer.fit();
    window.addEventListener('resize', this._onResize);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this._onResize);
    this.running = false;
  }

  /* ---------- ciclo de vida ---------- */

  /** Inicia uma partida nova a partir da fase indicada (placar zerado). */
  start(phase = 1) {
    this.lives = 3;
    this.score = 0;
    this.phase = phase;
    this._bananas = null;      // barreira nova em partida nova
    this.buildStage();
    this.running = true;
    this.paused = false;
    this.renderer.fit();
    this._last = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this._tick);
  }

  /**
   * (Re)monta a fase atual. A barreira e' preservada entre montagens
   * (SS4.4: nunca regenera sozinha) - `this._bananas` guarda o estado.
   */
  buildStage() {
    const fase = this.config.fases.find(f => f.id === this.phase) || this.config.fases[0];
    this.fase = fase;
    this.stage = createStage(fase, this.baseline, this._bananas);
    this._bananas = this.stage.bananas;
    this.hero = createHero();
    this.t = 0;
    this.fireAt = 0;
    this.combo = 0;
    this.over = false;
    this.vil = { x: W / 2, t: 0 };
    this.cocoAt = 1.8 + Math.random() * 1.5;
    for (const k in this.pools) this.pools[k].clear();
  }

  /**
   * Reinicia a fase mantendo placar e vidas (SS4.5).
   * A barreira NAO e' restaurada.
   */
  restartStage() {
    const bananas = this.stage.bananas;
    this._bananas = bananas;
    this.buildStage();
    this.hero.invuln = this.baseline.invulnS;
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; this._last = performance.now(); }

  /** Estado exposto ao HUD/UI. */
  get comboMult() {
    return 1 + Math.min(4, Math.floor(this.combo / 4));
  }

  /* ---------- loop ---------- */

  _tick = (now) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this._tick);
    if (this.paused) { this._last = now; return; }

    const dt = Math.min(DT_MAX, (now - this._last) / 1000);
    this._last = now;

    if (!this.over) {
      this.t += dt;
      this.update(dt);
    }
    this.renderer.draw(this);

    if (now - this._hudAt > HUD_INTERVAL) {
      this._hudAt = now;
      if (this.hooks.onHud) this.hooks.onHud(this.score, this.comboMult, this.lives, this.phase);
    }
  };

  /* ---------- update ---------- */

  update(dt) {
    const base = this.baseline;
    const hero = this.hero;
    const stage = this.stage;

    // --- heroi: teclado e arrasto ---
    if (this.input.keys['ArrowLeft']) { hero.x -= base.heroKeyboardSpeed * dt; hero.face = -1; }
    if (this.input.keys['ArrowRight']) { hero.x += base.heroKeyboardSpeed * dt; hero.face = 1; }
    if (this.input.pointerX !== null) {
      const nx = Math.max(40, Math.min(W - 40, this.input.pointerX));
      if (Math.abs(nx - hero.x) > 1) hero.face = nx > hero.x ? 1 : -1;
      hero.x = nx;
    }
    hero.x = Math.max(40, Math.min(W - 40, hero.x));

    if (hero.invuln > 0) hero.invuln -= dt;
    if (hero.weapon && this.t > hero.weaponUntil) hero.weapon = null;
    if (hero.shield > 0) hero.shield -= dt;

    // --- tiro automatico ---
    const rate = (hero.weapon === 'rapid' ? 0.5 : 1) * (base.fireRateMs / 1000);
    if (this.t >= this.fireAt) {
      this.fireAt = this.t + rate;
      this.audio.sfx('laser');
      if (hero.weapon === 'triple') {
        this.spawnBullet(hero.x, hero.y - 30, -70);
        this.spawnBullet(hero.x, hero.y - 30, 0);
        this.spawnBullet(hero.x, hero.y - 30, 70);
      } else {
        this.spawnBullet(hero.x, hero.y - 30, 0);
      }
    }

    for (const b of this.pools.bullets.items) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.y <= 60 || b.x <= 0 || b.x >= W) this.pools.bullets.release(b);
    }

    // --- vilao + cocos ---
    this.vil.t += dt;
    this.vil.x = W / 2 + Math.sin(this.vil.t * 0.55) * (W / 2 - 70);
    if (this.t >= this.cocoAt) {
      const factor = base.cocoFactorMin + Math.random() * (base.cocoFactorMax - base.cocoFactorMin);
      this.cocoAt = this.t + this.fase.cocoIntervalS * factor;
      const c = this.pools.cocos.obtain();
      c.x = this.vil.x + (Math.random() * 40 - 20);
      c.y = 130;
      c.vy = 130 + Math.random() * 55;
      c.vx = Math.random() * 40 - 20;
      c.r = 13;
      c.spin = Math.random() * 6;
    }
    for (const c of this.pools.cocos.items) {
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.spin += dt * 4;
    }

    // --- formacao ---
    const alive = stage.ships.length;
    const spd = this.fase.formationSpeed + (1 - alive / stage.total) * base.formationAccel;
    const half = (base.cols - 1) * base.colW / 2;
    stage.rows.forEach((row, ri) => {
      row.x += row.dir * spd * dt;
      let minC = Infinity, maxC = -Infinity;
      for (const s of stage.ships) {
        if (s.row !== ri) continue;
        if (s.col < minC) minC = s.col;
        if (s.col > maxC) maxC = s.col;
      }
      if (minC === Infinity) return;
      const left = W / 2 + row.x - half + minC * base.colW - 28;
      const right = W / 2 + row.x - half + maxC * base.colW + 28;
      if ((row.dir > 0 && right > W - 8) || (row.dir < 0 && left < 8)) {
        row.dir *= -1;
        // qualquer fileira que bate na borda desce o conjunto inteiro (SS4.2)
        for (const r2 of stage.rows) r2.y += this.fase.stepDown;
        this.audio.sfx('tick');
      }
    });

    // --- tiros x naves ---
    for (const b of this.pools.bullets.items) {
      if (!b.alive) continue;
      for (const s of stage.ships) {
        const p = shipPos(s, stage.rows, base);
        if (Math.abs(b.x - p.x) < s.w / 2 && Math.abs(b.y - p.y) < s.h / 2 + 6) {
          s.hp--;
          s.flash = 0.1;
          if (s.hp <= 0) {
            stage.ships.splice(stage.ships.indexOf(s), 1);
            this.combo++;
            const pts = s.lv * 100 * this.comboMult;
            this.score += pts;
            this.boom(p.x, p.y, '#ff8c42');
            this.audio.sfx('boom');
            this.spawnText(p.x, p.y, '+' + pts);
            if (Math.random() * 100 < base.powerupDropPct) {
              const pu = this.pools.powerups.obtain();
              pu.x = p.x; pu.y = p.y; pu.vy = 95;
              pu.type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
            }
          } else {
            this.audio.sfx('tick');
          }
          this.pools.bullets.release(b);
          break;
        }
      }
    }

    // --- cocos x bananas / heroi / chao ---
    const bw = W / 8;
    for (const c of this.pools.cocos.items) {
      if (!c.alive) continue;
      let consumed = false;
      if (c.y > stage.bananaY - 14 && c.y < stage.bananaY + 16) {
        for (const bn of stage.bananas) {
          if (bn.hp <= 0) continue;
          const bx = bw * (bn.i + 1);
          if (Math.abs(c.x - bx) < 26) {
            bn.hp--;
            if (bn.hp <= 0) { this.boom(bx, stage.bananaY, '#ffd23f'); this.audio.sfx('banana'); }
            else this.audio.sfx('tick');
            this.boom(c.x, c.y, '#8a5a2b', 5);
            this.pools.cocos.release(c);
            consumed = true;
            break;
          }
        }
      }
      if (consumed) continue;
      if (Math.abs(c.x - hero.x) < hero.w / 2 - 4 && Math.abs(c.y - hero.y) < hero.h / 2 + 4) {
        if (hero.shield > 0) {
          hero.shield = 0;
          this.boom(c.x, c.y, '#9fe3ff');
          this.audio.sfx('boom');
        } else if (hero.invuln <= 0) {
          this.pools.cocos.release(c);
          this.hitHero();
          return;   // hitHero pode remontar a fase; abandona o frame
        }
        this.pools.cocos.release(c);
        continue;
      }
      if (c.y >= H - 60) this.pools.cocos.release(c);
    }

    // --- power-ups ---
    for (const p of this.pools.powerups.items) {
      if (!p.alive) continue;
      p.y += p.vy * dt;
      if (Math.abs(p.x - hero.x) < hero.w / 2 + 8 && Math.abs(p.y - hero.y) < hero.h / 2 + 10) {
        this.audio.sfx('power');
        if (p.type === 'life') {
          if (this.lives < 3) this.lives++;
        } else if (p.type === 'shield') {
          hero.shield = base.powerupDurationS;
        } else {
          // triple e rapid ocupam o mesmo slot de arma (SS4.6)
          hero.weapon = p.type;
          hero.weaponUntil = this.t + base.powerupDurationS;
        }
        this.spawnText(p.x, p.y - 10, p.type.toUpperCase());
        this.pools.powerups.release(p);
      } else if (p.y >= H - 80) {
        this.pools.powerups.release(p);
      }
    }

    // --- particulas e textos ---
    for (const p of this.pools.parts.items) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 260 * dt;
      p.a -= dt * 1.6;
      if (p.a <= 0) this.pools.parts.release(p);
    }
    for (const tx of this.pools.texts.items) {
      tx.y -= 34 * dt;
      tx.a -= dt * 1.1;
      if (tx.a <= 0) this.pools.texts.release(tx);
    }

    // --- vitoria ---
    if (!stage.ships.length && !this.over) {
      this.endGame(true);
      this.sweepPools();
      return;
    }

    // clamp herdado da POC (linha 414): impede a formacao de afundar alem do
    // heroi. Vira caso de borda quando a regra da barreira do epico 3.1 entrar.
    for (const r of stage.rows) {
      if (r.y > hero.y - 20) r.y = hero.y - 20;
    }

    // --- nave encostando no heroi ---
    if (hero.invuln <= 0 && !this.over) {
      for (const s of stage.ships) {
        const p = shipPos(s, stage.rows, base);
        if (Math.abs(p.x - hero.x) < (s.w + hero.w) / 2 - 10 &&
            Math.abs(p.y - hero.y) < (s.h + hero.h) / 2 - 6) {
          this.hitHero();
          break;
        }
      }
    }

    this.sweepPools();
  }

  sweepPools() {
    this.pools.bullets.sweep();
    this.pools.cocos.sweep();
    this.pools.powerups.sweep();
    this.pools.parts.sweep();
    this.pools.texts.sweep();
  }

  /* ---------- helpers ---------- */

  spawnBullet(x, y, vx) {
    const b = this.pools.bullets.obtain();
    b.x = x; b.y = y; b.vx = vx; b.vy = -this.baseline.bulletSpeed;
  }

  spawnText(x, y, txt) {
    const t = this.pools.texts.obtain();
    t.x = x; t.y = y; t.txt = txt; t.a = 1;
  }

  boom(x, y, color, n) {
    const count = n || 14;
    for (let i = 0; i < count; i++) {
      const p = this.pools.parts.obtain();
      p.x = x; p.y = y;
      p.vx = Math.random() * 260 - 130;
      p.vy = Math.random() * 220 - 150;
      p.a = 1; p.c = color;
      p.s = 3 + Math.random() * 4;
    }
  }

  hitHero() {
    const hero = this.hero;
    this.combo = 0;
    this.boom(hero.x, hero.y, '#ff6b57', 22);
    this.audio.sfx('hit');
    this.lives--;
    if (this.lives <= 0) {
      this.endGame(false);
    } else {
      // SS4.5: a fase reinicia por completo, mantendo placar e vidas
      this.restartStage();
    }
  }

  endGame(win) {
    this.over = true;
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.audio.stopMusic();
    this.audio.sfx(win ? 'win' : 'lose');
    if (this.hooks.onEnd) this.hooks.onEnd(win, this.score);
  }
}
