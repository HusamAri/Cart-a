// Carta — recipe ingredient units (mass, volume, kitchen, service, count)

/** @typedef {{ id: string, units: string[] }} RecipeUnitGroup */

/** @type {RecipeUnitGroup[]} */
export const RECIPE_UNIT_GROUPS = [
  { id: 'mass', units: ['g', 'kg', 'mg'] },
  { id: 'volume', units: ['ml', 'cl', 'dl', 'l'] },
  { id: 'kitchen', units: ['yk', 'tk', 'ck'] },
  { id: 'glass', units: ['sb', 'cb', 'kd', 'sis'] },
  { id: 'count', units: ['ad'] },
];

export const RECIPE_UNIT_IDS = RECIPE_UNIT_GROUPS.flatMap((g) => g.units);

export const PASTE_RECIPE_UNITS = new Set(RECIPE_UNIT_IDS);

const UNIT_ALIASES = {
  g: ['g', 'gr', 'gram', 'grams', 'gramaj'],
  kg: ['kg', 'kilo', 'kilogram', 'kilogram'],
  mg: ['mg', 'miligram', 'miligram'],
  ml: ['ml', 'mililitre', 'mililitre', 'cc'],
  cl: ['cl', 'santilitre', 'santilitre', 'centilitre', 'centiliter'],
  dl: ['dl', 'desilitre', 'desilitre', 'decilitre', 'deciliter'],
  l: ['l', 'lt', 'litre', 'liter', 'litre'],
  yk: ['yk', 'yemek kasigi', 'yemek kaşığı', 'yemek kasigi', 'tbsp', 'tablespoon'],
  tk: ['tk', 'tatli kasigi', 'tatlı kaşığı', 'tatli kasigi', 'tsp', 'teaspoon'],
  ck: ['ck', 'cay kasigi', 'çay kaşığı', 'cay kasigi'],
  sb: ['sb', 'su bardagi', 'su bardağı', 'su bardagi', 'cup'],
  cb: ['cb', 'cay bardagi', 'çay bardağı', 'cay bardagi'],
  kd: ['kd', 'kadeh', 'wine glass', 'bardak'],
  sis: ['sis', 'sise', 'şişe', 'şişe', 'sise', 'bottle', 'şişeler'],
  ad: ['ad', 'adet', 'piece', 'pc', 'x'],
};

const ALIAS_TO_CANONICAL = new Map();
for (const [canonical, aliases] of Object.entries(UNIT_ALIASES)) {
  for (const a of aliases) {
    ALIAS_TO_CANONICAL.set(a.toLowerCase(), canonical);
  }
}

/** Normalize free-text / pasted unit to canonical id. Unknown → passed through lowercased. */
export function normalizeRecipeUnit(u) {
  const raw = String(u || 'g').toLowerCase().trim();
  if (!raw) return 'g';
  if (PASTE_RECIPE_UNITS.has(raw)) return raw;
  const hit = ALIAS_TO_CANONICAL.get(raw);
  if (hit) return hit;
  return raw;
}

/** Build <option> HTML for a unit &lt;select&gt; (caller runs applyTranslations). */
export function recipeUnitSelectHtml(selectedUnit, t) {
  const sel = normalizeRecipeUnit(selectedUnit || 'g');
  const groupLabel = (id) => escapeHtml(t(`recipes.unit_group_${id}`) || id);
  const unitLabel = (u) => escapeHtml(t(`recipes.unit_${u}`) || u);
  const orphan = !RECIPE_UNIT_IDS.includes(sel)
    ? `<option value="${escapeHtml(sel)}" selected>${escapeHtml(sel)}</option>`
    : '';
  return orphan + RECIPE_UNIT_GROUPS.map((g) => `
    <optgroup label="${groupLabel(g.id)}">
      ${g.units.map((u) => {
        const picked = sel === u ? ' selected' : '';
        return `<option value="${u}" data-i18n="recipes.unit_${u}"${picked}>${unitLabel(u)}</option>`;
      }).join('')}
    </optgroup>
  `).join('');
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
