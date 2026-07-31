/**
 * Entidades do jogo e seus pools.
 * Todos os valores numericos vem de src/config/fases.json (baseline v1,
 * SS12.1 da ESPECFICATION.md) - nada de numero magico aqui.
 */
import { Pool } from './pool.js';

export const W = 480;
export const H = 854;

/* ---------- factories / resets ---------- */

const makeBullet = () => ({ alive: false, x: 0, y: 0, vx: 0, vy: 0 });
const resetBullet = (b) => { b.x = 0; b.y = 0; b.vx = 0; b.vy = 0; };

const makeCoco = () => ({ alive: false, x: 0, y: 0, vx: 0, vy: 0, r: 13, spin: 0 });
const resetCoco = (c) => { c.x = 0; c.y = 0; c.vx = 0; c.vy = 0; c.spin = 0; };

const makePart = () => ({ alive: false, x: 0, y: 0, vx: 0, vy: 0, a: 0, c: '#fff', s: 3 });
const resetPart = (p) => { p.x = 0; p.y = 0; p.vx = 0; p.vy = 0; p.a = 0; p.s = 3; };

const makeText = () => ({ alive: false, x: 0, y: 0, txt: '', a: 0 });
const resetText = (t) => { t.x = 0; t.y = 0; t.txt = ''; t.a = 0; };

const makePowerup = () => ({ alive: false, x: 0, y: 0, vy: 0, type: 'triple' });
const resetPowerup = (p) => { p.x = 0; p.y = 0; p.vy = 0; p.type = 'triple'; };

/** Cria o conjunto de pools de uma partida. */
export function createPools() {
  return {
    bullets: new Pool(makeBullet, resetBullet, 48),
    cocos: new Pool(makeCoco, resetCoco, 16),
    parts: new Pool(makePart, resetPart, 256),
    texts: new Pool(makeText, resetText, 24),
    powerups: new Pool(makePowerup, resetPowerup, 8)
  };
}

/**
 * Monta o estado inicial de uma fase.
 * @param {object} fase entrada de fases.json
 * @param {object} baseline bloco `baseline` de fases.json
 * @param {Array|null} bananas estado da barreira a preservar (SS4.4);
 *        null cria uma barreira nova completa.
 */
export function createStage(fase, baseline, bananas = null) {
  const ships = [];
  fase.rows.forEach((r, ri) => {
    for (let c = 0; c < baseline.cols; c++) {
      ships.push({
        row: ri, col: c,
        lv: r.lv, hp: r.lv,
        img: r.img,
        flash: 0,
        w: 60, h: 46
      });
    }
  });

  return {
    ships,
    total: ships.length,
    rows: fase.rows.map((_, i) => ({
      x: 0,
      dir: i % 2 === 0 ? 1 : -1,
      y: baseline.rowY0 + i * baseline.rowGap
    })),
    bananas: bananas || Array.from(
      { length: baseline.bananaCount },
      (_, i) => ({ i, hp: baseline.bananaHp })
    ),
    bananaY: H - 290
  };
}

/** Estado inicial do heroi. */
export function createHero() {
  return {
    x: W / 2, y: H - 150,
    w: 66, h: 52,
    face: 1,
    invuln: 0,
    shield: 0,
    weapon: null,
    weaponUntil: 0
  };
}

/** Posicao logica de uma nave a partir da fileira e coluna. */
export function shipPos(s, rows, baseline) {
  const half = (baseline.cols - 1) * baseline.colW / 2;
  const row = rows[s.row];
  return {
    x: W / 2 + row.x - half + s.col * baseline.colW,
    y: row.y
  };
}
