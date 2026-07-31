/**
 * Persistencia local (SS6.1): localStorage com prefixo bkc_.
 * Funciona offline; toda leitura/escrita e' tolerante a falha (modo privado,
 * WebView com storage bloqueado).
 */
const PREFIX = 'bkc_';

export function load(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v === null ? fallback : v;
  } catch (_) {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, String(value));
  } catch (_) { /* ignora */ }
}

export function loadInt(key, fallback) {
  const n = parseInt(load(key, ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function loadBool(key, fallback) {
  const v = load(key, null);
  return v === null ? fallback : v === '1';
}

export function saveBool(key, value) {
  save(key, value ? 1 : 0);
}
