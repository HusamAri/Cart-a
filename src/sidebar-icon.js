/** Sidebar nav icons — inline SVG, currentColor + gold accent, dark-mode safe. */
import { cartaIcon } from './carta-icon.js';

const SIDEBAR_ICONS = {
  nav_overview: `
    <rect x="4" y="7" width="9" height="9" rx="1.75" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="11" y="8" width="9" height="9" rx="1.75" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path class="sidebar-icon__accent" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M11 8h4"/>
  `,
  nav_dashboard: `
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M6 18V11"/>
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M12 18V6"/>
    <path class="sidebar-icon__accent" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M18 18V9"/>
  `,
  nav_builder: `
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 4v3"/>
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M8.5 20l3.5-13 3.5 13"/>
    <path class="sidebar-icon__accent" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M7 20h10"/>
  `,
  nav_menus: `
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" d="M7 4.5h10v16l-5-3.5L7 20.5V4.5z"/>
    <path class="sidebar-icon__accent" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M12 11v5"/>
  `,
  nav_pantry: `
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M5.5 16a6.5 6.5 0 0113 0"/>
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M12 9V6"/>
    <path class="sidebar-icon__accent" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M4.5 19.5h15"/>
    <circle class="sidebar-icon__accent" cx="12" cy="6" r="1" fill="currentColor" stroke="none"/>
  `,
  nav_presets: `
    <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="11" y="11" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect class="sidebar-icon__accent" x="13.5" y="13.5" width="3" height="3" rx="0.75" fill="none" stroke="currentColor" stroke-width="1.25"/>
  `,
  nav_cost: `
    <rect x="4" y="7" width="16" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path fill="none" stroke="currentColor" stroke-width="1.5" d="M4 11h16"/>
    <circle class="sidebar-icon__accent" cx="16" cy="14.5" r="1.25" fill="currentColor" stroke="none"/>
  `,
  nav_pricing: `
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" d="M7 8.5l8-4 4 4-8 4-4-4z"/>
    <circle class="sidebar-icon__accent" cx="14.5" cy="7.5" r="1.1" fill="currentColor" stroke="none"/>
  `,
  nav_matrix: `
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.25" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.25" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.25" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect class="sidebar-icon__accent" x="13.5" y="13.5" width="6.5" height="6.5" rx="1.25" fill="none" stroke="currentColor" stroke-width="1.5"/>
  `,
  nav_variance: `
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M4 16l5-7 4 4 7-9"/>
    <path class="sidebar-icon__accent" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M16 4h4v4"/>
  `,
  nav_audit: `
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M12 7v5l3.5 2"/>
    <circle class="sidebar-icon__accent" cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
  `,
  nav_capabilities: `
    <rect x="5" y="4" width="14" height="16" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path fill="none" stroke="currentColor" stroke-width="1.5" d="M5 9h14M10 4v16"/>
    <path class="sidebar-icon__accent" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M13 13h5M13 16h5"/>
  `,
  nav_surface: `
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 5v9m0 0l3-3M12 14l-3-3"/>
    <path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M6 15v4a1.5 1.5 0 001.5 1.5h9A1.5 1.5 0 0018 19v-4"/>
    <path class="sidebar-icon__accent" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M9 19.5h6"/>
  `,
};

/** @param {string} iconId @param {{ size?: number }} [opts] */
export function sidebarNavIcon(iconId, opts = {}) {
  const size = opts.size ?? 22;
  const inner = SIDEBAR_ICONS[iconId];
  if (inner) {
    return (
      `<span class="sidebar__icon">` +
      `<svg class="carta-icon sidebar-icon" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${inner}</svg>` +
      `</span>`
    );
  }
  return `<span class="sidebar__icon">${cartaIcon(iconId, { size })}</span>`;
}
