/**
 * Dicionarios de strings nos 6 idiomas (SS10 da ESPECFICATION.md).
 * Os JSON sao importados estaticamente para que o Vite os embuta no bundle -
 * requisito offline-first: nada de fetch em runtime.
 */
import ptBR from './pt-BR.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import it from './it.json';
import de from './de.json';

export const DICTS = { pt: ptBR, en, es, fr, it, de };
export const LANGS = [
  { code: 'pt', label: 'Português (BR)' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' }
];

export const DEFAULT_LANG = 'pt';

export function dict(lang) {
  return DICTS[lang] || DICTS[DEFAULT_LANG];
}
