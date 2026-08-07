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

/** Cria as `cols` naves de uma fileira, conforme a definicao vinda da config. */
function makeRowShips(rowDef, rowIndex, baseline) {
  const ships = [];
  for (let c = 0; c < baseline.cols; c++) {
    ships.push({
      row: rowIndex, col: c,
      lv: rowDef.lv, hp: rowDef.lv,
      img: rowDef.img,
      flash: 0,
      w: 60, h: 46
    });
  }
  return ships;
}

/**
 * Monta o estado inicial de uma fase.
 *
 * As 4 fileiras de `fase.rows` entram em tela; `fase.reinforcements` fica
 * guardado na stage e so e' materializado depois, uma fileira por descida
 * (ver Game.spawnReinforcement).
 *
 * @param {object} fase entrada de fases.json
 * @param {object} baseline bloco `baseline` de fases.json
 * @param {Array|null} bananas estado da barreira a preservar (SS4.4);
 *        null cria uma barreira nova completa.
 */
export function createStage(fase, baseline, bananas = null) {
  const ships = [];
  fase.rows.forEach((r, ri) => ships.push(...makeRowShips(r, ri, baseline)));

  const pending = fase.reinforcements || [];

  return {
    ships,
    // `total` alimenta a aceleracao por baixas (formationAccel) e precisa
    // contar TODAS as naves da fase, inclusive as que ainda vao chegar - senao
    // a chegada de uma camada faria `alive/total` passar de 1 e a formacao
    // desaceleraria abaixo da velocidade base da fase.
    total: ships.length + pending.length * baseline.cols,
    rows: fase.rows.map((_, i) => ({
      x: 0,
      dir: i % 2 === 0 ? 1 : -1,
      y: baseline.rowY0 + i * baseline.rowGap
    })),
    /** Fileiras ainda nao materializadas, consumidas do inicio para o fim. */
    pendingRows: pending.slice(),
    bananas: bananas || Array.from(
      { length: baseline.bananaCount },
      (_, i) => ({ i, hp: baseline.bananaHp })
    ),
    bananaY: H - 290
  };
}

/**
 * Materializa a proxima fileira de reforco LOGO ABAIXO DO VILAO, na altura em
 * que a formacao comeca a fase (`rowY0`).
 *
 * A camada e' VISIVEL desde o primeiro frame, de proposito. A versao anterior a
 * fazia nascer acima da borda da tela para o jogador "ver o reforco chegando",
 * e isso produziu um travamento em jogo: com a formacao ja limpa nao sobra
 * fileira viva para tocar a borda, entao o bloco nunca desce e a camada que
 * nasceu fora da tela nunca entra - o jogador fica olhando uma tela vazia. Aqui
 * a nave nova aparece de imediato, sob o vilao, como se ele estivesse mandando
 * a proxima onda: nao depende de nenhuma descida para se tornar visivel.
 *
 * @returns {boolean} true se uma fileira foi adicionada.
 */
export function spawnReinforcementRow(stage, baseline) {
  const def = stage.pendingRows.shift();
  if (!def) return false;

  // A camada nova entra EM FASE com uma fileira viva (copia `x` e `dir` dela).
  // Nascer em `x: 0` com `dir` alternado a punha no centro ja prestes a tocar a
  // borda: disparava a descida seguinte quase de imediato, que trazia a proxima
  // camada, e todas entravam nos primeiros ~2 s em efeito domino.
  const ref = stage.rows.find(r => stage.ships.some(s => stage.rows[s.row] === r));
  const ri = stage.rows.length;
  stage.rows.push({
    x: ref ? ref.x : 0,
    dir: ref ? ref.dir : 1,
    y: baseline.rowY0            // sob o vilao, onde a formacao comeca a fase
  });
  stage.ships.push(...makeRowShips(def, ri, baseline));
  return true;
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
