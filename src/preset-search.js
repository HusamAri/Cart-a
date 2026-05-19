// Carta — filter trusted preset catalog (client-side).

import { getTrustedCatalogEntries, PRESET_TAG_IDS } from './menu-presets.js';
import { turkNorm } from './nutrient-db.js';

export { PRESET_TAG_IDS };

/**
 * @param {{ query?: string, tags?: string[] }} opts
 * @returns {import('./menu-presets.js').TrustedCatalogEntry[]}
 */
export function searchTrustedCatalog({ query = '', tags = [] } = {}) {
  const q = turkNorm(String(query || '').trim());
  const activeTags = (tags || []).filter((t) => PRESET_TAG_IDS.includes(t));
  let list = getTrustedCatalogEntries();

  if (activeTags.length) {
    list = list.filter((e) => activeTags.some((t) => e.tags.includes(t)));
  }
  if (!q) return list;

  return list.filter((e) => {
    const blob = turkNorm([e.name, e.nameEn, e.nameEs, ...(e.tags || []), ...(e.searchAliases || [])].join(' '));
    return blob.includes(q) || q.split(/\s+/).every((w) => w.length < 2 || blob.includes(w));
  });
}
