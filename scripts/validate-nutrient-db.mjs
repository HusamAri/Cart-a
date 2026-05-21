#!/usr/bin/env node
/**
 * Reference ingredient DB integrity (no network).
 * Run: node scripts/validate-nutrient-db.mjs
 */
import {
  NUTRIENT_DB,
  ALLERGEN_LABELS,
  INGREDIENT_ALIASES,
  INGREDIENT_I18N,
  turkNorm,
  nutrientCategoryId,
  lookupNutrient,
} from '../src/nutrient-db.js';

const ALLERGEN_IDS = Object.keys(ALLERGEN_LABELS);
const errors = [];
const pass = (id, msg) => console.log(`  ✓ ${id}: ${msg}`);

function fail(id, msg) {
  errors.push(`${id}: ${msg}`);
  console.log(`  ✗ ${id}: ${msg}`);
}

console.log('Nutrient reference DB validation\n');

const normToKeys = new Map();
for (const k of Object.keys(NUTRIENT_DB)) {
  const n = turkNorm(k);
  if (!normToKeys.has(n)) normToKeys.set(n, []);
  normToKeys.get(n).push(k);
}
for (const [n, keys] of normToKeys) {
  if (keys.length > 1) fail('dup:norm', `Duplicate turkNorm "${n}": ${keys.join(', ')}`);
}
if (!errors.some((e) => e.startsWith('dup:norm'))) pass('dup:norm', 'No duplicate normalized keys');

for (const [key, row] of Object.entries(NUTRIENT_DB)) {
  for (const a of row.allergens || []) {
    if (!ALLERGEN_IDS.includes(a)) fail('allergen:code', `${key}: unknown allergen "${a}"`);
  }
  const e = Number(row.ethanol) || 0;
  if (e > 0 && nutrientCategoryId(key, row) !== 'beverages') {
    fail('ethanol:cat', `${key}: ethanol=${e} but category is not beverages`);
  }
}

if (!errors.some((e) => e.startsWith('allergen:code'))) pass('allergen:code', 'All allergen codes are Codex catalog IDs');
if (!errors.some((e) => e.startsWith('ethanol:cat'))) pass('ethanol:cat', 'All alcoholic rows are beverage category');

for (const [alias, canon] of Object.entries(INGREDIENT_ALIASES)) {
  const hit = lookupNutrient(alias);
  if (!hit) fail('alias:resolve', `Alias "${alias}" → "${canon}" does not resolve`);
}
if (!errors.some((e) => e.startsWith('alias:resolve'))) pass('alias:resolve', 'INGREDIENT_ALIASES resolve via lookupNutrient');

for (const key of Object.keys(INGREDIENT_I18N)) {
  if (!NUTRIENT_DB[key]) fail('i18n:missing', `INGREDIENT_I18N key missing in NUTRIENT_DB: ${key}`);
}
if (!errors.some((e) => e.startsWith('i18n:missing'))) pass('i18n:missing', 'Every i18n row has a nutrient row');

const spiritChecks = [
  ['vodka', { ethanolMin: 20, halalBlock: true }],
  ['bira', { expectAllergens: ['gluten'] }],
  ['viski', { expectAllergens: ['gluten'] }],
  ['sarap (kırmızı)', { expectAllergens: ['sulphite'], ethanolMin: 5 }],
];
for (const [name, expect] of spiritChecks) {
  const hit = lookupNutrient(name);
  if (!hit) {
    fail('spot:' + name, 'lookup failed');
    continue;
  }
  if (expect.ethanolMin && (hit.ethanol || 0) < expect.ethanolMin) {
    fail('spot:' + name, `ethanol ${hit.ethanol} < ${expect.ethanolMin}`);
  }
  if (expect.expectAllergens) {
    for (const a of expect.expectAllergens) {
      if (!(hit.allergens || []).includes(a)) fail('spot:' + name, `missing allergen ${a}`);
    }
  }
}
if (!errors.some((e) => e.startsWith('spot:'))) pass('spot:spirits', 'Spot checks for vodka, beer, whisky, wine');

console.log('');
if (errors.length) {
  console.error(`FAILED (${errors.length}):\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log('Nutrient reference DB OK.');
