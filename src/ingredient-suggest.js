// Carta — ingredient name suggestions (Codex DB + optional workspace pantry)
import { suggestNutrients, turkNorm } from './nutrient-db.js';

/**
 * @param {string} query
 * @param {number} [limit]
 * @param {string[]} [pantryNames] — workspace cost ledger / custom lines
 */
export function suggestIngredientNames(query, limit = 10, pantryNames = []) {
  const q = String(query || '').trim();
  if (!q) return [];
  const nq = turkNorm(q);
  const out = [];
  const seen = new Set();

  const push = (name) => {
    const key = turkNorm(name);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(name);
  };

  for (const name of suggestNutrients(q, limit)) push(name);

  const pantryHits = [];
  for (const name of pantryNames) {
    const nk = turkNorm(name);
    if (!nk) continue;
    if (nk.startsWith(nq)) pantryHits.unshift(name);
    else if (nk.includes(nq)) pantryHits.push(name);
  }
  for (const name of pantryHits) {
    if (out.length >= limit) break;
    push(name);
  }

  return out.slice(0, limit);
}
