/**
 * Bootstrap do jogo: maquina de estados de telas, HUD, i18n e ligacao com o
 * game loop. Porte da camada de UI da POC (que era JSX/DCLogic) para DOM
 * direto, sem framework.
 */
import './styles.css';
import config from './config/fases.json';
import { dict, LANGS, DEFAULT_LANG } from './i18n/index.js';
import { load, save, loadInt, loadBool, saveBool } from './storage.js';
import { loadImages, assetUrl } from './game/assets.js';
import { AudioEngine } from './game/audio.js';
import { Input } from './game/input.js';
import { Game } from './game/loop.js';
import { WinAnimation } from './game/winanim.js';

const $ = (id) => document.getElementById(id);

const state = {
  screen: 'menu',
  lang: load('lang', DEFAULT_LANG),
  name: load('name', ''),
  muted: loadBool('muted', false),
  musicOn: loadBool('music', true),
  fxOn: loadBool('fx', true),
  adsRemoved: loadBool('ads', false),
  lastScore: loadInt('last', 0),
  highScore: loadInt('high', 0),
  finalScore: 0,
  gameWon: false
};

const audio = new AudioEngine();
audio.muted = state.muted;
audio.musicOn = state.musicOn;
audio.fxOn = state.fxOn;

const input = new Input();
const images = loadImages();

const canvas = $('cv');
const winAnim = new WinAnimation($('winFrame'), $('winBg'));
let game = null;

/* ---------- i18n ---------- */

const t = () => dict(state.lang);
const pad = (n) => String(n).padStart(6, '0');

/**
 * URL das paginas legais no GitHub Pages (epico 10).
 *
 * A de privacidade e' a MESMA informada a Play Console e ao AdMob - se este
 * endereco mudar, atualize tambem la, senao a ficha da loja fica com link
 * quebrado (motivo de reprovacao na revisao).
 *
 * O ingles mora em index.html; os demais idiomas em <lang>.html.
 */
const LEGAL_BASE = 'https://besaleel.github.io/BANANA-KING-COUNTERATTACKS';

function legalUrl(kind) {
  const page = state.lang === 'en' ? 'index.html' : state.lang + '.html';
  return `${LEGAL_BASE}/${kind}/${page}`;
}

function applyI18n() {
  const d = t();
  $('tagline').textContent = d.tagline;
  $('inpName').placeholder = d.namePh;
  $('btnPlay').textContent = d.play;
  $('linkTerms').textContent = d.terms;
  $('lastScore').textContent = d.lastScore + ': ' + state.lastScore;
  $('linkRemoveAds').textContent = d.removeAds;
  $('adPlaceholder').textContent = d.adPh;
  $('vicTitle').textContent = d.victoryTitle;
  $('vicSub').textContent = d.victorySub;
  $('vicSoon').textContent = d.soon;
  // a tela final pode estar aberta na troca de idioma: reescreve com o placar
  // ja apurado (nao recalcula recorde - `is-new` continua valendo)
  $('winTitle').textContent = d.gameWonTitle;
  $('winPhrase').textContent = d.winPhrase;
  $('winScoreLabel').textContent = d.winFinalScore;
  const bestEl = $('winBest');
  bestEl.textContent = bestEl.classList.contains('is-new')
    ? d.winNewBest
    : d.winBest + ' ' + pad(state.highScore);
  $('btnWinAgain').textContent = d.again;
  $('btnWinMenu').textContent = d.menu;
  // Sem `game` (antes da primeira partida) o alvo e' a fase 02, que e' o que
  // esta tela ofereceria depois de vencer a 01. Antes caia num rotulo "FASE"
  // solto, sem numero.
  const nextN = game ? Math.min(game.phase + 1, config.fases.length) : 2;
  $('btnVicNext').textContent = d.nextPhase + ' ' + String(nextN).padStart(2, '0');
  $('btnVicMenu').textContent = d.menu;
  $('overTitle').textContent = d.overTitle;
  $('overSub').textContent = d.overSub;
  $('btnOverAgain').textContent = d.tryAgain;
  $('btnOverMenu').textContent = d.menu;
  $('pauseTitle').textContent = d.pauseTitle;
  $('pauseNote').textContent = d.pauseNote;
  $('btnResume').textContent = d.resume;
  $('btnRestart').textContent = d.restart;
  $('adTitle').textContent = d.adTitle;
  $('adDesc').textContent = d.adDesc;
  $('adNote').textContent = d.adNote;
  $('btnBuy').textContent = d.buy;
  $('btnCancelAds').textContent = d.cancel;
  $('termsTitle').textContent = d.termsTitle;
  $('termsBody').textContent = d.termsBody;
  $('linkPrivacyUrl').textContent = d.privacyLink;
  $('linkTermsUrl').textContent = d.termsLink;
  $('linkPrivacyUrl').href = legalUrl('privacy');
  $('linkTermsUrl').href = legalUrl('terms');
  $('btnCloseTerms').textContent = d.close;
  updateToggleLabels();
}

function updateToggleLabels() {
  const d = t();
  const music = d.music + ': ' + (state.musicOn ? d.on : d.off);
  const fx = d.fx + ': ' + (state.fxOn ? d.on : d.off);
  $('btnMusic').textContent = music;
  $('btnMusic2').textContent = music;
  $('btnFx').textContent = fx;
  $('btnFx2').textContent = fx;
  $('btnMute').textContent = state.muted ? '×' : '♪';
}

/* ---------- telas ---------- */

function show(screen) {
  state.screen = screen;
  $('scMenu').hidden = screen !== 'menu';
  $('scVictory').hidden = screen !== 'victory';
  $('scWin').hidden = screen !== 'win';
  $('scOver').hidden = screen !== 'gameover';
  $('hud').hidden = screen !== 'game';
  $('adsBar').hidden = state.adsRemoved || screen !== 'game';
  if (screen !== 'game') $('scPause').hidden = true;
  // o walk-cycle so roda enquanto a tela final esta visivel
  if (screen === 'win') winAnim.start();
  else winAnim.stop();
}

function setPaused(p) {
  if (!game || state.screen !== 'game') return;
  $('scPause').hidden = !p;
  if (p) {
    game.pause();
    // SS7.1: a pausa "salva a fase atual". Persistimos fase, placar e vidas
    // para retomar a campanha depois (o menu oferece Continuar).
    saveProgress();
  } else {
    game.resume();
  }
}

/** Grava o progresso da campanha (SS6.1, prefixo bkc_). */
function saveProgress() {
  if (!game) return;
  save('phase', game.phase);
  save('progScore', game.score);
  save('progLives', game.lives);
}

/** Limpa o progresso salvo (game over ou campanha concluida). */
function clearProgress() {
  save('phase', 0);
  save('progScore', 0);
  save('progLives', 0);
}

const isPaused = () => game ? game.paused : false;
audio.isPaused = isPaused;

/* ---------- HUD ---------- */

function renderHud(score, mult, lives, phase) {
  const d = t();
  $('hudPhase').textContent = d.phase + ' ' + String(phase).padStart(2, '0');
  $('hudScore').textContent = pad(score);
  $('hudCombo').textContent = mult > 1 ? 'x' + mult : '';
  const el = $('hudLives');
  if (el.childElementCount !== lives) {
    el.textContent = '';
    for (let i = 0; i < lives; i++) {
      const d2 = document.createElement('div');
      d2.className = 'life-icon';
      el.appendChild(d2);
    }
  }
}

/* ---------- fluxo do jogo ---------- */

function startGame(phase = 1) {
  audio.sfx('click');
  state.gameWon = false;
  const nm = ($('inpName').value || '').trim() || 'PLAYER 1';
  state.name = nm;
  save('name', nm);
  $('hudName').textContent = nm;

  show('game');
  if (!game) {
    game = new Game(canvas, {
      images, audio, input, config,
      hooks: { onHud: renderHud, onEnd: onGameEnd }
    });
    input.attachPointer(canvas);
  }
  game.start(phase);
  setFrameBackground(game.fase.background);
  renderHud(0, 1, 3, phase);
  saveProgress();
  audio.startMusic();
}

function onGameEnd(win, score, bonus) {
  state.finalScore = score;
  state.lastScore = score;
  // comparado ANTES de sobrescrever: a tela final destaca o recorde novo
  const isNewBest = score > state.highScore;
  state.highScore = Math.max(score, state.highScore);
  save('last', score);
  save('high', state.highScore);
  $('vicScore').textContent = 'SCORE ' + pad(score);
  $('overScore').textContent = 'SCORE ' + pad(score);

  // SS6: detalha os bonus na tela de vitoria
  const d = t();
  const lines = [];
  if (bonus?.phaseClear) lines.push(d.bonusPhase + ' +' + bonus.phaseClear);
  if (bonus?.lives) lines.push(d.bonusLives + ' +' + bonus.lives);
  $('vicBonus').textContent = lines.join('   ');
  $('vicBonus').hidden = lines.length === 0;
  $('lastScore').textContent = d.lastScore + ': ' + state.lastScore;

  // derrota ou campanha concluida encerram a corrida: nao ha o que retomar
  if (!win || bonus?.gameWon) clearProgress();

  // Epico 4: vitoria de fase oferece CONTINUAR para a proxima. A fase 10
  // (campanha concluida) sai para a tela de vitoria final do epico 5.
  state.gameWon = win && !!bonus?.gameWon;

  if (win) {
    if (state.gameWon) {
      fillWinScreen(score, isNewBest, lines);
    } else {
      $('vicTitle').textContent = d.victoryTitle;
      $('vicSub').textContent = d.victorySub;
      $('vicSoon').hidden = true;
      $('btnVicNext').textContent = d.nextPhase + ' ' +
        String((bonus?.phase ?? 1) + 1).padStart(2, '0');
      // pre-carrega o fundo da proxima fase para nao piscar na transicao
      preloadBackground((bonus?.phase ?? 1) + 1);
    }
  }

  // a vitoria final espera um pouco mais: da tempo do ultimo som terminar
  // antes de cortar para a cena de encerramento
  const delay = !win ? 1100 : (state.gameWon ? 1000 : 700);
  setTimeout(() => show(!win ? 'gameover' : (state.gameWon ? 'win' : 'victory')), delay);
}

/** Preenche a tela de vitoria final da campanha (epico 5). */
function fillWinScreen(score, isNewBest, bonusLines) {
  const d = t();
  $('winTitle').textContent = d.gameWonTitle;
  $('winPhrase').textContent = d.winPhrase;
  $('winScoreLabel').textContent = d.winFinalScore;
  $('winScore').textContent = pad(score);
  const best = $('winBest');
  best.textContent = isNewBest ? d.winNewBest : d.winBest + ' ' + pad(state.highScore);
  best.classList.toggle('is-new', isNewBest);
  // uma linha por bonus: em DE/FR os rotulos sao longos e emendam num so texto
  const bonusEl = $('winBonus');
  bonusEl.textContent = '';
  for (const line of bonusLines) {
    const div = document.createElement('div');
    div.textContent = line;
    bonusEl.appendChild(div);
  }
  bonusEl.hidden = bonusLines.length === 0;
  $('btnWinAgain').textContent = d.again;
  $('btnWinMenu').textContent = d.menu;
}

/** Avanca para a proxima fase preservando placar, vidas e barreira. */
function continuePhase() {
  if (!game) return;
  audio.sfx('click');
  if (!game.nextPhase()) return;      // ja era a ultima fase
  show('game');
  setFrameBackground(game.fase.background);
  renderHud(game.score, game.comboMult, game.lives, game.phase);
  saveProgress();
  audio.startMusic();
}

/** Aquece o cache do browser com o fundo da fase seguinte. */
function preloadBackground(phase) {
  const f = config.fases.find(x => x.id === phase);
  if (!f) return;
  const im = new Image();
  im.src = assetUrl(f.background);
}

function backToMenu() {
  audio.sfx('click');
  audio.stopMusic();
  if (game) { game.running = false; game.paused = false; }
  show('menu');
}

function setFrameBackground(file) {
  $('frame').style.backgroundImage = "url('" + assetUrl(file) + "')";
}

/* ---------- ligacao de eventos ---------- */

function buildLangSelect() {
  const sel = $('selLang');
  for (const l of LANGS) {
    const o = document.createElement('option');
    o.value = l.code;
    o.textContent = l.label;
    sel.appendChild(o);
  }
  sel.value = state.lang;
  sel.addEventListener('change', () => {
    state.lang = sel.value;
    save('lang', state.lang);
    applyI18n();
  });
}

function wire() {
  $('inpName').value = state.name;

  $('btnPlay').addEventListener('click', () => startGame(1));
  $('btnVicNext').addEventListener('click', continuePhase);
  $('btnOverAgain').addEventListener('click', () => startGame(1));
  $('btnWinAgain').addEventListener('click', () => startGame(1));
  $('btnVicMenu').addEventListener('click', backToMenu);
  $('btnOverMenu').addEventListener('click', backToMenu);
  $('btnWinMenu').addEventListener('click', backToMenu);

  $('btnPause').addEventListener('click', () => { audio.sfx('click'); setPaused(true); });
  $('btnResume').addEventListener('click', () => { audio.sfx('click'); setPaused(false); });
  $('btnRestart').addEventListener('click', () => startGame(1));

  $('btnMute').addEventListener('click', () => {
    state.muted = !state.muted;
    audio.muted = state.muted;
    saveBool('muted', state.muted);
    if (state.muted) audio.stopMusic();
    else if (state.screen === 'game') audio.startMusic();
    updateToggleLabels();
  });

  const toggleMusic = () => {
    state.musicOn = !state.musicOn;
    audio.musicOn = state.musicOn;
    saveBool('music', state.musicOn);
    if (state.musicOn && state.screen === 'game') audio.startMusic();
    else audio.stopMusic();
    updateToggleLabels();
  };
  const toggleFx = () => {
    state.fxOn = !state.fxOn;
    audio.fxOn = state.fxOn;
    saveBool('fx', state.fxOn);
    updateToggleLabels();
  };
  $('btnMusic').addEventListener('click', toggleMusic);
  $('btnMusic2').addEventListener('click', toggleMusic);
  $('btnFx').addEventListener('click', toggleFx);
  $('btnFx2').addEventListener('click', toggleFx);

  $('linkRemoveAds').addEventListener('click', (e) => {
    e.preventDefault();
    audio.sfx('click');
    if (state.screen === 'game' && !isPaused()) setPaused(true);
    $('mdAds').hidden = false;
  });
  $('btnCancelAds').addEventListener('click', () => {
    audio.sfx('click');
    $('mdAds').hidden = true;
    setPaused(false);
  });
  $('btnBuy').addEventListener('click', () => {
    // Placeholder: a integracao real de Billing e' o epico 8.2 do backlog.
    audio.sfx('power');
    state.adsRemoved = true;
    saveBool('ads', true);
    $('mdAds').hidden = true;
    $('adsBar').hidden = true;
    setPaused(false);
  });

  $('linkTerms').addEventListener('click', (e) => {
    e.preventDefault();
    audio.sfx('click');
    $('mdTerms').hidden = false;
  });
  $('btnCloseTerms').addEventListener('click', () => {
    audio.sfx('click');
    $('mdTerms').hidden = true;
  });

  // No app nativo, `target=_blank` abriria DENTRO do WebView e prenderia o
  // usuario numa pagina sem barra de navegacao, sem botao de voltar. Abrimos
  // no navegador do sistema. No browser, o comportamento padrao ja e' correto.
  for (const id of ['linkPrivacyUrl', 'linkTermsUrl']) {
    $(id).addEventListener('click', async (e) => {
      audio.sfx('click');
      if (!window.Capacitor?.isNativePlatform?.()) return;   // browser: deixa passar
      e.preventDefault();
      const url = e.currentTarget.href;
      try {
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url });
      } catch (_) {
        // plugin ausente: cai no navegador externo pelo proprio sistema
        window.open(url, '_system');
      }
    });
  }

  input.attachKeyboard();
  input.onEscape = () => {
    if (state.screen === 'game') setPaused(!isPaused());
  };

  // auto-pausa ao perder o foco (SS7.1)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.screen === 'game' && !isPaused()) setPaused(true);
  });
}

/* ---------- pausa nativa (Capacitor) ---------- */

async function wireNative() {
  if (!window.Capacitor?.isNativePlatform?.()) return;
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive && state.screen === 'game' && !isPaused()) setPaused(true);
    });
  } catch (_) { /* plugin ausente: o jogo segue normalmente */ }
  try {
    const { ScreenOrientation } = await import('@capacitor/screen-orientation');
    await ScreenOrientation.lock({ orientation: 'portrait' });
  } catch (_) { /* trava tambem declarada no AndroidManifest */ }
}

/* ---------- init ---------- */

buildLangSelect();
wire();
applyI18n();
show('menu');
setFrameBackground(config.fases[0].background);
wireNative();
