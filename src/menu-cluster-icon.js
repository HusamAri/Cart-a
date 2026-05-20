/**
 * Menu cluster visual icons: SVG sprite ids in /assets/carta-icons.svg
 * (replaces free-text emoji; legacy emoji values are normalized on read).
 */
import { cartaIcon } from './carta-icon.js';

export const DEFAULT_MENU_CLUSTER_ICON = 'menu_fork_knife';

/** @type {{ id: string, i18n: string, label?: string }[]} */
export const MENU_CLUSTER_ICON_OPTIONS = [
  { id: 'menu_fork_knife', i18n: 'menus.icon_utensils' },
  { id: 'menu_sun', i18n: 'menus.icon_breakfast' },
  { id: 'menu_coffee', i18n: 'menus.icon_coffee' },
  { id: 'menu_glass', i18n: 'menus.icon_beverages' },
  { id: 'menu_wine', i18n: 'menus.icon_wine' },
  { id: 'menu_cocktail', i18n: 'menus.icon_cocktail' },
  { id: 'menu_beer', i18n: 'menus.icon_beer' },
  { id: 'menu_leaf', i18n: 'menus.icon_plant' },
  { id: 'menu_fish', i18n: 'menus.icon_seafood' },
  { id: 'menu_cake', i18n: 'menus.icon_dessert' },
  { id: 'menu_snack', i18n: 'menus.icon_snack' },
  { id: 'menu_cloche', i18n: 'menus.icon_banquet' },
  { id: 'menu_grill', i18n: 'menus.icon_grill' },
  { id: 'menu_layers', i18n: 'menus.icon_mixed' },
  { id: 'restaurant_menu', i18n: 'menus.icon_menu_card' },
  // Extended customization set (newly added icons in sprite).
  { id: 'nutrition', i18n: 'menus.icon_menu_card', label: 'Nutrition' },
  { id: 'grid_view', i18n: 'menus.icon_mixed', label: 'Grid' },
  { id: 'analytics', i18n: 'menus.icon_menu_card', label: 'Analytics' },
  { id: 'table_chart', i18n: 'menus.icon_menu_card', label: 'Table' },
  { id: 'auto_awesome', i18n: 'menus.icon_menu_card', label: 'Signature' },
  { id: 'photo_camera', i18n: 'menus.icon_menu_card', label: 'Photo menu' },
  { id: 'tune', i18n: 'menus.icon_menu_card', label: 'Custom' },
];

export const MENU_CLUSTER_ICON_IDS = MENU_CLUSTER_ICON_OPTIONS.map(o => o.id);

const KNOWN = new Set(MENU_CLUSTER_ICON_IDS);

const LEGACY_EMOJI_TO_ID = {
  '🍽': 'menu_fork_knife',
  '🍴': 'menu_fork_knife',
  '☕': 'menu_coffee',
  '🍷': 'menu_wine',
  '🍸': 'menu_cocktail',
  '🍹': 'menu_cocktail',
  '🥗': 'menu_leaf',
  '🥬': 'menu_leaf',
  '🐟': 'menu_fish',
  '🍰': 'menu_cake',
  '🎂': 'menu_cake',
  '🧁': 'menu_cake',
  '🌅': 'menu_sun',
  '🍳': 'menu_sun',
  '🌞': 'menu_sun',
  '🥂': 'menu_wine',
  '🫖': 'menu_coffee',
};

const HUE_BY_ICON = {
  menu_fork_knife: 'neutral',
  menu_layers: 'neutral',
  restaurant_menu: 'neutral',
  grid_view: 'neutral',
  table_chart: 'neutral',

  menu_sun: 'amber',
  menu_cake: 'amber',
  menu_snack: 'amber',

  menu_coffee: 'brown',
  menu_grill: 'brown',

  menu_glass: 'aqua',
  menu_wine: 'wine',
  menu_cocktail: 'wine',
  menu_beer: 'gold',

  menu_leaf: 'mint',
  menu_fish: 'ocean',
  menu_cloche: 'ocean',

  nutrition: 'mint',
  analytics: 'aqua',
  auto_awesome: 'gold',
  photo_camera: 'aqua',
  tune: 'violet',
};

function escHTML(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * @param {string|null|undefined} raw
 * @returns {string} sprite symbol id
 */
export function normalizeMenuClusterIcon(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return DEFAULT_MENU_CLUSTER_ICON;
  if (LEGACY_EMOJI_TO_ID[s]) return LEGACY_EMOJI_TO_ID[s];
  if (KNOWN.has(s)) return s;
  return DEFAULT_MENU_CLUSTER_ICON;
}

/**
 * @param {string|null|undefined} storedValue
 * @param {{ size?: number, className?: string, style?: string }} [opts]
 */
export function menuClusterIconHtml(storedValue, opts = {}) {
  const s = String(storedValue ?? '').trim();
  const size = opts.size ?? 20;
  const baseOpts = { size, className: opts.className, style: opts.style };
  if (!s) return cartaIcon(DEFAULT_MENU_CLUSTER_ICON, baseOpts);
  if (LEGACY_EMOJI_TO_ID[s]) return cartaIcon(LEGACY_EMOJI_TO_ID[s], baseOpts);
  if (KNOWN.has(s)) return cartaIcon(s, baseOpts);
  if (/^[a-z][a-z0-9_]+$/.test(s)) return cartaIcon(DEFAULT_MENU_CLUSTER_ICON, baseOpts);
  return `<span class="menu-cluster-ico-fallback" aria-hidden="true">${escHTML(s.slice(0, 8))}</span>`;
}

/**
 * Style token for icon-picker background tint.
 * @param {string|null|undefined} storedValue
 * @returns {'neutral'|'amber'|'brown'|'aqua'|'wine'|'gold'|'mint'|'ocean'|'violet'}
 */
export function menuClusterIconHue(storedValue) {
  const id = normalizeMenuClusterIcon(storedValue);
  return HUE_BY_ICON[id] || 'neutral';
}
