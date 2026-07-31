/**
 * Audio procedural via Web Audio API - zero asset, offline por construcao
 * (SS8 da ESPECFICATION.md). Portado 1:1 da POC.
 * A decisao procedural x arquivos CC0 e' o epico 6 do backlog.
 */
export class AudioEngine {
  constructor() {
    this._ac = null;
    this._mus = null;
    this.muted = false;
    this.musicOn = true;
    this.fxOn = true;
    this.isPaused = () => false;
  }

  ac() {
    if (!this._ac) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this._ac = new Ctx();
    }
    if (this._ac.state === 'suspended') this._ac.resume();
    return this._ac;
  }

  tone(freq, dur, type, vol, slide) {
    if (this.muted || !this.fxOn) return;
    const ac = this.ac(), o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol || 0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  noise(dur, vol, low) {
    if (this.muted || !this.fxOn) return;
    const ac = this.ac(), t = ac.currentTime;
    const n = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = low || 1800;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol || 0.15, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(ac.destination);
    s.start(t);
  }

  sfx(name) {
    switch (name) {
      case 'laser': this.tone(880, 0.12, 'square', 0.05, -600); break;
      case 'boom': this.noise(0.25, 0.18, 1600); this.tone(160, 0.2, 'sawtooth', 0.06, -120); break;
      case 'banana': this.noise(0.35, 0.22, 900); this.tone(110, 0.3, 'triangle', 0.09, -70); break;
      case 'hit': this.tone(300, 0.4, 'sawtooth', 0.12, -260); this.noise(0.4, 0.2, 700); break;
      case 'power':
        this.tone(523, 0.09, 'square', 0.07);
        setTimeout(() => this.tone(659, 0.09, 'square', 0.07), 90);
        setTimeout(() => this.tone(784, 0.14, 'square', 0.07), 180);
        break;
      case 'click': this.tone(600, 0.05, 'square', 0.05); break;
      case 'win': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.22, 'square', 0.08), i * 160)); break;
      case 'lose': [392, 330, 262, 196].forEach((f, i) => setTimeout(() => this.tone(f, 0.3, 'sawtooth', 0.08), i * 200)); break;
      case 'tick': this.tone(220, 0.06, 'square', 0.04); break;
    }
  }

  startMusic() {
    if (this.muted || !this.musicOn || this._mus) return;
    const ac = this.ac();
    let step = 0;
    const bass = [110, 110, 131, 110, 87, 87, 98, 110];
    const arp = [220, 262, 330, 262, 220, 294, 349, 294];
    this._mus = setInterval(() => {
      if (this.isPaused()) return;
      const t = ac.currentTime;
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle'; o.frequency.value = bass[step % 8];
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g); g.connect(ac.destination);
      o.start(t); o.stop(t + 0.25);
      if (step % 2 === 0) {
        const o2 = ac.createOscillator(), g2 = ac.createGain();
        o2.type = 'square'; o2.frequency.value = arp[(step / 2) % 8];
        g2.gain.setValueAtTime(0.022, t);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o2.connect(g2); g2.connect(ac.destination);
        o2.start(t); o2.stop(t + 0.2);
      }
      step++;
    }, 250);
  }

  stopMusic() {
    if (this._mus) { clearInterval(this._mus); this._mus = null; }
  }
}
