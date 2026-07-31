/**
 * Renderizacao do playfield em canvas 2D logico 480x854.
 * Escala por devicePixelRatio limitado a 2x, imageSmoothingEnabled = false
 * (SS12 da ESPECFICATION.md).
 */
import { W, H, shipPos } from './entities.js';
import { ready } from './assets.js';

export class Renderer {
  constructor(canvas, images, baseline) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.img = images;
    this.baseline = baseline;
    this.scale = { sx: 1, sy: 1 };
    this.fit();
  }

  /** Recalcula o backing store do canvas conforme o tamanho em tela. */
  fit() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = this.cv.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (this.cv.width !== w || this.cv.height !== h) {
      this.cv.width = w;
      this.cv.height = h;
    }
    this.scale.sx = this.cv.width / W;
    this.scale.sy = this.cv.height / H;
  }

  draw(g) {
    const ctx = this.ctx, img = this.img, base = this.baseline;
    ctx.setTransform(this.scale.sx, 0, 0, this.scale.sy, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = false;

    // vilao (Trasho)
    const vw = 96;
    let vimg = img[Math.cos(g.vil.t * 0.55) > 0 ? 'vil' : 'vil2'];
    if (!ready(vimg)) vimg = img.vil;
    if (ready(vimg)) ctx.drawImage(vimg, g.vil.x - vw / 2, 52, vw, vw * 0.85);

    // naves da formacao
    for (const s of g.stage.ships) {
      const p = shipPos(s, g.stage.rows, base);
      if (s.flash > 0) {
        s.flash -= 0.016;
        ctx.filter = 'brightness(2.2)';
      } else {
        const dmg = 1 - s.hp / s.lv;
        ctx.filter = 'brightness(' + (1 - dmg * 0.45).toFixed(2) + ')';
      }
      const sp = img[s.img];
      if (ready(sp)) ctx.drawImage(sp, p.x - s.w / 2, p.y - s.h / 2, s.w, s.h * 1.15);
      ctx.filter = 'none';
    }

    // tiros do heroi
    ctx.fillStyle = '#ffd23f';
    for (const b of g.pools.bullets.items) ctx.fillRect(b.x - 2, b.y - 8, 4, 14);

    // cocos
    for (const c of g.pools.cocos.items) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.spin);
      ctx.fillStyle = '#5b3a1e';
      ctx.beginPath(); ctx.arc(0, 0, c.r, 0, 7); ctx.fill();
      ctx.fillStyle = '#8a5a2b';
      ctx.beginPath(); ctx.arc(-c.r * 0.3, -c.r * 0.3, c.r * 0.5, 0, 7); ctx.fill();
      ctx.fillStyle = '#3a2415';
      ctx.beginPath(); ctx.arc(-4, 2, 2.4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(4, 2, 2.4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 7, 2.4, 0, 7); ctx.fill();
      ctx.restore();
    }

    // barreira de bananas
    const bw = W / 8;
    for (const bn of g.stage.bananas) {
      if (bn.hp <= 0) continue;
      const x = bw * (bn.i + 1), y = g.stage.bananaY, hurt = bn.hp === 1;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = hurt ? '#c9a52f' : '#ffd23f';
      ctx.fillRect(-22, -4, 44, 10);
      ctx.fillRect(-18, -8, 36, 6);
      ctx.fillRect(-26, -2, 6, 8);
      ctx.fillRect(20, -2, 6, 8);
      ctx.fillStyle = '#3a2415';
      ctx.fillRect(-28, 0, 4, 5);
      ctx.fillRect(24, 0, 4, 5);
      if (hurt) {
        ctx.fillStyle = '#7a4a12';
        ctx.fillRect(-6, -6, 4, 10);
        ctx.fillRect(6, -3, 4, 8);
      }
      ctx.restore();
    }

    // power-ups
    ctx.textAlign = 'center';
    for (const p of g.pools.powerups.items) {
      if (p.type === 'banana') {
        // SS4.4: a banana bonus e' visualmente distinta dos power-ups de
        // combate (quadrados com letra) - o jogador precisa reconhecer de
        // longe que o que esta caindo restaura a barreira.
        drawBananaBonus(ctx, p.x, p.y, g.t);
        continue;
      }
      const col = POWERUP_COLORS[p.type] || '#ffffff';
      ctx.fillStyle = col;
      ctx.fillRect(p.x - 12, p.y - 12, 24, 24);
      ctx.fillStyle = '#1d0f30';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(p.type === 'life' ? '+1' : p.type[0].toUpperCase(), p.x, p.y + 5);
    }

    // heroi
    const hero = g.hero;
    if (!(hero.invuln > 0 && Math.floor(g.t * 10) % 2 === 0)) {
      const himg = (hero.face < 0 && ready(img.hero2)) ? img.hero2 : img.hero;
      if (ready(himg)) ctx.drawImage(himg, hero.x - hero.w / 2, hero.y - hero.h / 2 - 8, hero.w, hero.w);
      if (hero.shield > 0) {
        const alpha = hero.shield < 2 ? (Math.sin(g.t * 12) * 0.3 + 0.5) : 0.8;
        ctx.strokeStyle = 'rgba(159,227,255,' + alpha + ')';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(hero.x, hero.y, 46, 0, 7); ctx.stroke();
      }
      if (hero.weapon) {
        ctx.fillStyle = '#ffe98a';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText(hero.weapon === 'triple' ? 'x3' : '>>', hero.x, hero.y + 44);
      }
    }

    // particulas
    for (const p of g.pools.parts.items) {
      ctx.globalAlpha = Math.max(0, p.a);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.globalAlpha = 1;

    // textos flutuantes
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffe98a';
    for (const t of g.pools.texts.items) {
      ctx.globalAlpha = Math.max(0, t.a);
      ctx.fillText(t.txt, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }
}

const POWERUP_COLORS = {
  triple: '#ff8c42',
  rapid: '#ff6b57',
  shield: '#9fe3ff',
  life: '#7ed957'
};

/**
 * Banana bonus (SS4.4). Reusa o vocabulario visual das bananas da barreira -
 * mesmas cores e silhueta deitada - para o jogador ligar na hora o item ao
 * que ele restaura, mas maior, girando e com halo pulsante para nao se
 * confundir com os quadrados dos power-ups de combate.
 */
function drawBananaBonus(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);

  // halo pulsante
  const pulse = 0.55 + Math.sin(t * 8) * 0.25;
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#ffe98a';
  ctx.beginPath();
  ctx.arc(0, 0, 21, 0, 7);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.rotate(Math.sin(t * 3) * 0.35);

  // corpo da banana (mesma silhueta da barreira, ~30% maior)
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(-15, -3, 30, 8);
  ctx.fillRect(-12, -7, 24, 5);
  ctx.fillRect(-18, -1, 5, 6);
  ctx.fillRect(13, -1, 5, 6);
  // pontas escuras
  ctx.fillStyle = '#3a2415';
  ctx.fillRect(-20, 0, 3, 4);
  ctx.fillRect(17, 0, 3, 4);
  // brilho
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(-8, -5, 10, 3);

  ctx.restore();
}
