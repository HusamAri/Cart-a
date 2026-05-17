/** Inline SVG fragment referencing /assets/carta-icons.svg symbols (stroke, currentColor). */

export const CARTA_ICONS_URL = '/assets/carta-icons.svg';

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * @param {string} name - Symbol id in assets/carta-icons.svg
 * @param {{ size?: number, className?: string, style?: string, ariaHidden?: boolean, spriteUrl?: string }} [opts]
 */
export function cartaIcon(name, opts = {}) {
  const size = opts.size ?? 24;
  const cls = ['carta-icon', opts.className].filter(Boolean).join(' ');
  const styleAttr = opts.style ? ` style="${escAttr(opts.style)}"` : '';
  const aria = opts.ariaHidden !== false ? ' aria-hidden="true"' : '';
  const base = opts.spriteUrl != null ? opts.spriteUrl : CARTA_ICONS_URL;
  const href = `${base}#${name}`;
  return (
    `<svg class="${escAttr(cls)}" width="${size}" height="${size}"${styleAttr}${aria} focusable="false">` +
    `<use href="${escAttr(href)}"/>` +
    `</svg>`
  );
}
