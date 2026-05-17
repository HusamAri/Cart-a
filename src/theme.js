// Carta — color scheme: system (default) | light | dark
export const THEME_STORAGE_KEY = 'carta-theme';

export function getThemePref() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch (_) {}
  return 'system';
}

export function setThemePref(pref) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch (_) {}
  applyTheme();
}

export function effectiveColorScheme() {
  const p = getThemePref();
  if (p === 'dark') return 'dark';
  if (p === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Syncs html[data-color-scheme], dataset.themePref, and theme-color meta. */
export function applyTheme() {
  const e = effectiveColorScheme();
  const pref = getThemePref();
  document.documentElement.setAttribute('data-color-scheme', e);
  document.documentElement.dataset.themePref = pref;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', e === 'dark' ? '#0e1411' : '#1B2A22');
  window.dispatchEvent(new CustomEvent('carta-theme-change', { detail: { effective: e, pref } }));
}

export function cycleThemePref() {
  const order = ['system', 'light', 'dark'];
  const p = getThemePref();
  const i = Math.max(0, order.indexOf(p));
  setThemePref(order[(i + 1) % order.length]);
}

/** Re-run after boot script; attach system preference listener. */
export function initTheme() {
  applyTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemePref() === 'system') applyTheme();
  });
}

/** Visual glyph for toolbar (pref mode, not effective). */
export function themePrefGlyph(pref) {
  if (pref === 'system') return '◐';
  if (pref === 'light') return '☀';
  return '☾';
}
