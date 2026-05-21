// Carta — ingredient match audit (reference DB + workspace registry)
import { lookupNutrientDetailed, turkNorm, ingredientLabel } from './nutrient-db.js';

/**
 * @typedef {{
 *   inputName: string,
 *   status: string,
 *   needsReview: boolean,
 *   matchedKey?: string|null,
 *   canonicalKey?: string|null,
 *   mapsTo?: string|null,
 * }} IngredientAuditLine
 */

/**
 * @param {{ name?: string, brand?: string }} ingredient
 * @param {{ registry?: import('./ingredient-registry.js').ReturnType<import('./ingredient-registry.js').createIngredientRegistry> }} [options]
 * @returns {IngredientAuditLine}
 */
export function auditIngredientLine(ingredient, options = {}) {
  const name = String(ingredient?.name || '').trim();
  const brand = ingredient?.brand ? String(ingredient.brand).trim() : null;
  if (!name) {
    return { inputName: '', status: 'empty', needsReview: false, matchedKey: null, canonicalKey: null };
  }

  const registry = options.registry;
  const n = turkNorm(name);

  if (registry) {
    const aliasTarget = registry.aliasToTarget?.get(n);
    const resolved = registry.resolve(name, { brand });
    if (resolved) {
      const canon = resolved.key;
      const inputNorm = turkNorm(name);
      const canonNorm = turkNorm(canon);
      const ref = lookupNutrientDetailed(name);
      const fuzzyRef = ref.match === 'contains';
      const renamed = inputNorm !== canonNorm;
      return {
        inputName: name,
        status: aliasTarget ? 'registry_alias' : `registry_${resolved.source || 'reference'}`,
        needsReview: !aliasTarget && (fuzzyRef || renamed),
        matchedKey: canon,
        canonicalKey: canon,
        mapsTo: aliasTarget?.maps_to || null,
      };
    }
    if (aliasTarget?.maps_to) {
      return {
        inputName: name,
        status: 'registry_alias_missing',
        needsReview: true,
        matchedKey: null,
        canonicalKey: aliasTarget.maps_to,
        mapsTo: aliasTarget.maps_to,
      };
    }
  }

  const { hit, match, matchedKey } = lookupNutrientDetailed(name);
  if (!hit) {
    return {
      inputName: name,
      status: 'unmatched',
      needsReview: true,
      matchedKey: null,
      canonicalKey: null,
    };
  }

  const inputNorm = turkNorm(name);
  const canonNorm = turkNorm(matchedKey);
  const needsReview = match === 'contains' || (match === 'alias' && inputNorm !== canonNorm) || inputNorm !== canonNorm;

  return {
    inputName: name,
    status: match,
    needsReview,
    matchedKey,
    canonicalKey: matchedKey,
  };
}

/**
 * @param {{ name?: string, brand?: string }[]} ingredients
 * @param {{ registry?: object, lang?: string }} [options]
 */
export function auditRecipeIngredients(ingredients, options = {}) {
  const lang = options.lang || 'tr';
  const lines = (ingredients || []).map((ing) => auditIngredientLine(ing, options));
  const unmatched = lines.filter((l) => l.status === 'unmatched' || l.status === 'registry_alias_missing');
  const fuzzy = lines.filter((l) => l.needsReview && !unmatched.includes(l));
  const needsReview = unmatched.length > 0 || fuzzy.length > 0;

  return {
    lines,
    unmatchedCount: unmatched.length,
    fuzzyCount: fuzzy.length,
    hasUnmatched: unmatched.length > 0,
    hasFuzzy: fuzzy.length > 0,
    needsReview,
    /** Human-readable lines for UI */
    messages: lines
      .filter((l) => l.needsReview && l.inputName)
      .map((l) => formatAuditMessage(l, lang)),
  };
}

/**
 * @param {IngredientAuditLine} line
 * @param {string} lang
 */
export function formatAuditMessage(line, lang = 'tr') {
  const label = line.canonicalKey || line.matchedKey || line.mapsTo;
  const canon = label ? ingredientLabel(label, lang) : '';
  if (line.status === 'unmatched' || line.status === 'registry_alias_missing') {
    return { key: 'recipes.match_unmatched', vars: { name: line.inputName } };
  }
  return { key: 'recipes.match_fuzzy', vars: { name: line.inputName, canonical: canon || label || '?' } };
}
