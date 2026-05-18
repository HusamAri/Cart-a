// Carta — Recipe compute (Atwater, unit conversion, allergens, diet tags)
import { NUTRIENT_DB, lookupNutrient, turkNorm } from './nutrient-db.js';
import { emissionIntensityKgCo2ePerKg } from './carbon-factors.js';

// ---- Atwater general factors (TGK Ek-10 §3.3) -----------------
// Energy = 4·P + 4·C + 9·F + 2·Fi + 7·ethanol  (kcal per gram)
export function atwaterKcal({ P=0, F=0, C=0, Fi=0, ethanol=0 } = {}) {
  return (4*P) + (4*C) + (9*F) + (2*Fi) + (7*ethanol);
}

// ---- Unit conversion ------------------------------------------
// Convert (amount, unit) to grams. unit can be Turkish or English shorthand.
// `name` lets us special-case density (oils, eggs, water).
export function toGrams(amount, unit, name = '') {
  const a = Number(amount) || 0;
  const u = String(unit||'').trim().toLowerCase();
  const n = turkNorm(name);

  // Direct mass
  if (u === 'g' || u === 'gr' || u === 'gram') return a;
  if (u === 'kg' || u === 'kilo' || u === 'kilogram') return a * 1000;
  if (u === 'mg') return a / 1000;

  // Volume (water-equivalent unless we know density)
  let densityGperMl = 1;  // water default
  if (n.includes('yag') || n.includes('zeytinyagi') || n.includes('zeytin yagi')) densityGperMl = 0.92;
  if (n.includes('bal'))    densityGperMl = 1.42;
  if (n.includes('sirke'))  densityGperMl = 1.01;
  if (n.includes('sut'))    densityGperMl = 1.03;
  if (n.includes('krema'))  densityGperMl = 0.99;

  if (u === 'ml' || u === 'mililitre') return a * densityGperMl;
  if (u === 'l' || u === 'lt' || u === 'litre') return a * 1000 * densityGperMl;

  // Kitchen units (Turkish)
  if (u === 'yk' || u === 'yemek kasigi' || u === 'tbsp') return a * 15 * densityGperMl;
  if (u === 'tk' || u === 'tatli kasigi' || u === 'tsp')  return a * 5 * densityGperMl;
  if (u === 'cay kasigi' || u === 'ck')                    return a * 2 * densityGperMl;
  if (u === 'sb' || u === 'su bardagi' || u === 'cup')     return a * 200 * densityGperMl;
  if (u === 'cb' || u === 'cay bardagi')                   return a * 100 * densityGperMl;
  // Wine service (ml → mass via beverage density)
  if (u === 'kd' || u === 'kadeh')                        return a * 150 * densityGperMl;
  if (u === 'sis' || u === 'sise' || u === 'şişe' || u === 'bottle') {
    return a * 750 * densityGperMl;
  }

  // Pieces (best-effort defaults)
  if (u === 'ad' || u === 'adet' || u === 'piece' || u === 'pc') {
    if (n.includes('yumurta'))   return a * 55;   // medium egg
    if (n.includes('limon'))     return a * 80;
    if (n.includes('elma'))      return a * 180;
    if (n.includes('domates'))   return a * 150;
    if (n.includes('soğan') || n.includes('sogan')) return a * 110;
    if (n.includes('biber'))     return a * 100;
    if (n.includes('sarımsak') || n.includes('sarimsak')) return a * 5; // clove
    return a * 100; // generic
  }

  // Unknown unit → assume grams
  return a;
}

// ---- Recipe-level compute -------------------------------------
// recipe.ingredients = [{ name, amount, unit }]
// Returns: { kcal, P, F, C, Fi, ethanol, perServing: {...}, allergens: [...], dietTags: [...] }
export function computeRecipe(recipe) {
  const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const servings = Math.max(1, Number(recipe.servings) || 1);

  let tot = { P:0, F:0, C:0, Fi:0, ethanol:0, mass:0 };
  const allergens = new Set();

  for (const i of ings) {
    const grams = toGrams(i.amount, i.unit, i.name);
    if (!grams) continue;
    const nut = lookupNutrient(i.name);
    if (!nut) continue;
    const scale = grams / 100;
    tot.P  += (nut.P  || 0) * scale;
    tot.F  += (nut.F  || 0) * scale;
    tot.C  += (nut.C  || 0) * scale;
    tot.Fi += (nut.Fi || 0) * scale;
    tot.ethanol += (nut.ethanol || 0) * scale;
    tot.mass += grams;
    (nut.allergens || []).forEach(a => allergens.add(a));
  }

  const kcal = atwaterKcal(tot);
  const perServing = {
    kcal:    kcal / servings,
    P:       tot.P / servings,
    F:       tot.F / servings,
    C:       tot.C / servings,
    Fi:      tot.Fi / servings,
    ethanol: tot.ethanol / servings,
    mass:    tot.mass / servings,
  };
  return {
    totals: { ...tot, kcal },
    perServing,
    allergens: [...allergens].sort(),
    dietTags: deriveDietTags(ings, [...allergens]),
  };
}

/** GHG proxy: kg CO2e for full recipe and per serving (literature-tier factors, not a full LCA). */
export function computeRecipeClimate(recipe) {
  const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const servings = Math.max(1, Number(recipe.servings) || 1);
  let totalKgCo2e = 0;
  for (const i of ings) {
    const grams = toGrams(i.amount, i.unit, i.name);
    if (!grams) continue;
    const intensity = emissionIntensityKgCo2ePerKg(i.name);
    totalKgCo2e += (grams / 1000) * intensity;
  }
  const perServing = totalKgCo2e / servings;
  return {
    totalKgCo2e,
    perServingKgCo2e: perServing,
    perServingGCo2e: perServing * 1000,
  };
}

// ---- Diet tags --------------------------------------------------
// Auto-derive vegan / vegetarian / halal / gluten-free / pork-free flags.
const MEAT_KEYS    = ['et','tavuk','dana','kuzu','hindi','jambon','sucuk','pastirma','salam','sosis','balik','somon','levrek','cipura','hamsi','karides','kalamar','midye','ton','et suyu'];
const ANIMAL_KEYS  = ['sut','peynir','tereyagi','yumurta','krema','yogurt','bal'];
const PORK_KEYS    = ['domuz','jambon','salam','sosis','prosciutto','bacon'];

export function deriveDietTags(ingredients, allergens = []) {
  const names = (ingredients || []).map(i => turkNorm(i.name || ''));
  const hasMeat   = names.some(n => MEAT_KEYS.some(k => n.includes(k)));
  const hasAnimal = names.some(n => ANIMAL_KEYS.some(k => n.includes(k)));
  const hasPork   = names.some(n => PORK_KEYS.some(k => n.includes(k)));
  const hasGluten = allergens.includes('gluten');

  const tags = [];
  if (!hasMeat && !hasAnimal) tags.push('vegan');
  else if (!hasMeat)          tags.push('vegetarian');
  if (!hasPork && !allergens.includes('alcohol')) tags.push('halal'); // simplified
  if (!hasGluten)             tags.push('gluten_free');
  return tags;
}

// ---- Cost compute ----------------------------------------------
// recipe: { servings, ingredients: [{ name, amount, unit }] }
// costMap: { [normalisedName]: { per_100g, yield_pct } }
// qFactorPct: workspace Q-factor (% added to cover waste/un-costed items)
// Returns { totalCost, perServing, missing: [names not in costMap] }
export function computeDishCost(recipe, costMap, qFactorPct = 0) {
  const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const servings = Math.max(1, Number(recipe.servings) || 1);
  const missing = [];
  let total = 0;
  for (const i of ings) {
    const grams = toGrams(i.amount, i.unit, i.name);
    if (!grams) continue;
    const key = turkNorm(i.name);
    const entry = costMap[key];
    if (!entry) { missing.push(i.name); continue; }
    const per100 = Number(entry.per_100g) || 0;
    const yld    = Number(entry.yield_pct) || 100;
    const perGram = (per100 / 100) * (100 / yld);
    total += perGram * grams;
  }
  const qAdj = total * (1 + (qFactorPct || 0) / 100);
  return {
    totalCost: qAdj,
    perServing: qAdj / servings,
    rawCost: total,
    qFactorPct,
    missing,
  };
}

// Suggested menu price for a target gross-profit % (target_gp = (price - cost) / price * 100)
// price = cost / (1 - target_gp/100)
export function suggestedPrice(perServingCost, targetGpPct, vatPct = 0) {
  if (!perServingCost) return 0;
  const gp = Math.max(0, Math.min(99, Number(targetGpPct) || 0));
  const net = perServingCost / (1 - gp / 100);
  return net * (1 + (vatPct || 0) / 100);
}

// Food cost % = cost / netPrice * 100   (netPrice excludes VAT)
export function foodCostPct(perServingCost, menuPrice, vatPct = 0) {
  if (!menuPrice) return null;
  const net = menuPrice / (1 + (vatPct || 0) / 100);
  return (perServingCost / net) * 100;
}

// Margin currency = netPrice - cost
export function marginCurrency(perServingCost, menuPrice, vatPct = 0) {
  if (!menuPrice) return null;
  const net = menuPrice / (1 + (vatPct || 0) / 100);
  return net - perServingCost;
}

// Build a cost lookup map from cost_db rows (keyed by turkNorm of ingredient_name)
export function buildCostMap(rows = []) {
  const map = {};
  for (const r of rows) {
    if (!r.ingredient_name) continue;
    map[turkNorm(r.ingredient_name)] = r;
  }
  return map;
}

// ---- Display helpers -------------------------------------------
export function formatNumber(v, digits = 0) {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return Number(v).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatMoney(v, currency = '₺', digits = 2) {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return `${currency} ${formatNumber(v, digits)}`;
}
