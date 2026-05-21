#!/usr/bin/env node
/**
 * Dashboard KPI regression checks (no auth, no paid APIs).
 * Run: node scripts/test-dashboard.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeRecipe, buildCostMap, computeDishCost, computeRecipeClimate, toGrams, deriveDietTags } from '../src/recipe-compute.js';
import { auditRecipeIngredients } from '../src/ingredient-resolve.js';
import { emissionIntensityKgCo2ePerKg } from '../src/carbon-factors.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dashPath = path.join(root, 'app/studio/dashboard.html');
const i18nPath = path.join(root, 'src/i18n.js');
const errors = [];
const pass = (id, msg) => console.log(`  ✓ ${id}: ${msg}`);

function fail(id, msg) {
  errors.push(`${id}: ${msg}`);
  console.log(`  ✗ ${id}: ${msg}`);
}

console.log('Dashboard regression tests\n');

// --- Static markup / CSS guards ---
const html = fs.readFileSync(dashPath, 'utf8');
const i18n = fs.readFileSync(i18nPath, 'utf8');

if (html.includes('<motion')) fail('html:invalid_tag', 'Invalid <motion> tag in dashboard.html');
else pass('html:invalid_tag', 'No malformed motion tags');

if (!html.includes('function ensureDashVisible')) fail('html:ensure_visible', 'Missing ensureDashVisible()');
else pass('html:ensure_visible', 'ensureDashVisible() present');

const regDecl = html.indexOf('let ingredientRegistry = null');
const awaitLoad = html.lastIndexOf('await load();');
if (regDecl < 0 || awaitLoad < regDecl) {
  fail('html:tdz_order', 'await load() must run after let ingredientRegistry declaration');
} else pass('html:tdz_order', 'ingredientRegistry declared before await load()');

if (!html.includes('dash.loading')) fail('html:loading_key', 'Missing dash.loading i18n hook');
else pass('html:loading_key', 'Loading state wired');

if (html.includes('@keyframes dashKpiIn') && html.match(/dashKpiIn[\s\S]*?opacity:\s*0/)) {
  fail('css:kpi_opacity', 'dashKpiIn still fades from opacity 0');
} else pass('css:kpi_opacity', 'KPI animation does not start invisible');

if (!html.includes('.dash-kpi {') || !html.match(/\.dash-kpi\s*\{[^}]*opacity:\s*1/)) {
  fail('css:kpi_base_opacity', '.dash-kpi missing opacity: 1 base');
} else pass('css:kpi_base_opacity', 'KPI tiles default to visible');

if (!i18n.includes("'dash.loading'")) fail('i18n:loading', 'dash.loading missing in i18n.js');
else pass('i18n:loading', 'EN/TR loading strings present');

// --- analyze() logic smoke (mirrors dashboard.html) ---
function analyze(rows, costMap, qFactor = 3) {
  const items = rows.map((r) => {
    const data = r.data || {};
    const comp = computeRecipe({ ingredients: data.ingredients || [], servings: data.servings || 1 });
    const cost = computeDishCost(data, costMap, qFactor);
    return { row: r, comp, cost };
  });
  const n = items.length;
  if (n === 0) return { empty: true };

  let sumKcal = 0;
  let foodN = 0;
  let drinkN = 0;

  for (const { row, comp } of items) {
    if (row.kind === 'drink') drinkN++;
    else foodN++;
    const k = comp?.perServing?.kcal || 0;
    sumKcal += k;
    const data = row.data || {};
    computeRecipeClimate({ ingredients: data.ingredients || [], servings: data.servings || 1 });
    for (const i of data.ingredients || []) {
      const grams = toGrams(i.amount, i.unit, i.name);
      if (grams) emissionIntensityKgCo2ePerKg(i.name);
    }
  }

  return { empty: false, n, foodN, drinkN, avgKcal: sumKcal / n };
}

const mockRows = [
  {
    kind: 'food',
    name: 'Test soup',
    data: {
      servings: 2,
      ingredients: [{ name: 'domates', amount: 200, unit: 'g' }],
    },
  },
  {
    kind: 'drink',
    name: 'Test drink',
    data: {
      servings: 1,
      ingredients: [{ name: 'su', amount: 250, unit: 'ml' }],
    },
  },
];

const empty = analyze([], buildCostMap([]));
if (!empty.empty) fail('logic:empty', 'Expected empty for zero recipes');
else pass('logic:empty', 'Empty workspace handled');

const st = analyze(mockRows, buildCostMap([]));
if (st.empty || st.n !== 2 || st.foodN !== 1 || st.drinkN !== 1) {
  fail('logic:counts', `Unexpected stats: ${JSON.stringify(st)}`);
} else {
  pass('logic:counts', `n=${st.n} food=${st.foodN} drink=${st.drinkN} avgKcal=${st.avgKcal.toFixed(0)}`);
}

if (!(st.avgKcal > 0)) fail('logic:kcal', 'avgKcal should be > 0 for mock recipes');
else pass('logic:kcal', 'Average kcal computed');

const vodka = computeRecipe({
  servings: 1,
  ingredients: [{ name: 'vodka', amount: 40, unit: 'ml' }],
});
if (vodka.dietTags.includes('halal') || vodka.dietTags.includes('vegan')) {
  fail('diet:vodka', `Spirit must not be halal/vegan: ${vodka.dietTags.join(',')}`);
} else pass('diet:vodka', 'Alcoholic spirit excludes halal and vegan tags');

const beer = computeRecipe({
  servings: 1,
  ingredients: [{ name: 'bira', amount: 330, unit: 'ml' }],
});
if (beer.dietTags.includes('halal')) fail('diet:beer', 'Beer must not be halal');
else pass('diet:beer', 'Beer excludes halal tag');

const tomato = deriveDietTags([{ name: 'domates', amount: 1, unit: 'ad' }], []);
if (!tomato.includes('vegan') || !tomato.includes('halal')) {
  fail('diet:tomato', `Plant ingredient should stay vegan+halal: ${tomato.join(',')}`);
} else pass('diet:tomato', 'Plant-only rows keep vegan and halal');

const fuzzy = auditRecipeIngredients([{ name: 'Absolut Vodka', amount: 40, unit: 'ml' }]);
if (!fuzzy.needsReview || fuzzy.lines[0]?.status !== 'contains') {
  fail('audit:fuzzy', 'Partial spirit name should need review');
} else pass('audit:fuzzy', 'Fuzzy spirit match flagged');

const miss = auditRecipeIngredients([{ name: 'zzzznonexistentxyz', amount: 1, unit: 'ad' }]);
if (!miss.hasUnmatched) fail('audit:miss', 'Unknown label should be unmatched');
else pass('audit:miss', 'Unknown ingredient flagged');

const exact = auditRecipeIngredients([{ name: 'vodka', amount: 40, unit: 'ml' }]);
if (exact.needsReview) fail('audit:exact', 'Canonical vodka should not need review');
else pass('audit:exact', 'Exact reference match needs no review');

console.log('');
if (errors.length) {
  console.error(`FAILED (${errors.length}):\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`All dashboard checks passed (${8} assertions).`);
