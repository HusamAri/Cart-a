/**
 * Menu type → Carta SVG icon, default cluster glyph, and badge markup.
 */
import { normalizeMenuType } from './menu-structure.js';
import { cartaIcon } from './carta-icon.js';

/** @type {Record<string, string>} sprite symbol id */
export const MENU_TYPE_ICON_IDS = {
  food: 'menu_fork_knife',
  drinks: 'menu_glass',
  cocktail: 'menu_cocktail',
  wine: 'menu_wine',
  bar: 'menu_beer',
  buffet: 'menu_cloche',
  snack: 'menu_snack',
  breakfast: 'menu_sun',
  coffee: 'menu_coffee',
  mixed: 'menu_layers',
};

/** Suggested menu_clusters.icon when creating a menu of this type. */
export const MENU_TYPE_DEFAULT_CLUSTER_ICON = { ...MENU_TYPE_ICON_IDS };

/** CSS modifier on .menu-type-badge */
export const MENU_TYPE_BADGE_MOD = {
  food: 'menu-type-badge--food',
  drinks: 'menu-type-badge--drinks',
  cocktail: 'menu-type-badge--cocktail',
  wine: 'menu-type-badge--wine',
  bar: 'menu-type-badge--bar',
  buffet: 'menu-type-badge--buffet',
  snack: 'menu-type-badge--snack',
  breakfast: 'menu-type-badge--breakfast',
  coffee: 'menu-type-badge--coffee',
  mixed: 'menu-type-badge--mixed',
};

export function iconIdForMenuType(menuType) {
  const key = normalizeMenuType(menuType);
  return MENU_TYPE_ICON_IDS[key] || MENU_TYPE_ICON_IDS.mixed;
}

export function defaultClusterIconForMenuType(menuType) {
  return iconIdForMenuType(menuType);
}

/**
 * @param {string} menuType
 * @param {{ size?: number, className?: string }} [opts]
 */
export function menuTypeIconHtml(menuType, opts = {}) {
  return cartaIcon(iconIdForMenuType(menuType), {
    size: opts.size ?? 16,
    className: opts.className,
  });
}

/**
 * @param {string} menuType
 * @param {string} label - already translated type name
 * @param {{ size?: number, className?: string, showIcon?: boolean }} [opts]
 */
export function menuTypeBadgeHtml(menuType, label, opts = {}) {
  const type = normalizeMenuType(menuType);
  const mod = MENU_TYPE_BADGE_MOD[type] || MENU_TYPE_BADGE_MOD.mixed;
  const extra = opts.className ? ` ${opts.className}` : '';
  const icon = opts.showIcon === false
    ? ''
    : menuTypeIconHtml(type, { size: opts.size ?? 12, className: 'menu-type-badge__ic' });
  return `<span class="menu-type-badge ${mod}${extra}">${icon}<span class="menu-type-badge__label">${label}</span></span>`;
}
