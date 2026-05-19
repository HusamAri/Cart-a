// Recipe paste + Excel import (Barceló R15-COC cost breakdown sheets, SAP TSV, plain text).

import { normalizeRecipeUnit, PASTE_RECIPE_UNITS } from './recipe-units.js';

export { PASTE_RECIPE_UNITS };

const SKIP_LINE = /^(ingredients?|amount|avg\.?\s*uts\.?|price|subtotal|total\s*cost|dish\s*name|materials?\s*used|basic\s*preparation|unit\s*cost|rrp\b|material\b|short\s*text|base\s*unit|unit\s*price|#|%|₺)/i;

const HEADER_CELLS = new Set([
  'ingredients', 'amount', 'avg. uts.', 'avg uts', 'price', 'subtotal', 'total cost',
  'dish name', 'material', 'short text', 'unit cost per dish',
]);

/** @typedef {{ name: string, amount: string, unit: string, sap_code?: string|null }} ParsedIngredientRow */

/**
 * @param {unknown} raw
 * @returns {number|null}
 */
export function parseFlexibleNumber(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  let t = String(raw).replace(/^\ufeff/, '').trim().replace(/\s/g, '');
  if (!t || t.startsWith('#')) return null;
  if (/^\d{1,3}(\.\d{3})*,\d+$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(,\d{3})*\.\d+$/.test(t)) t = t.replace(/,/g, '');
  else if (/^\d+,\d+$/.test(t)) t = t.replace(',', '.');
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

export function normPasteAmount(s) {
  const n = parseFlexibleNumber(s);
  if (n != null) return String(n);
  return String(s ?? '').trim().replace(',', '.');
}

/** Map SAP / hotel Excel units to Carta recipe units. */
export function normalizeExcelRecipeUnit(u) {
  const raw = String(u || '').trim();
  if (!raw) return 'g';
  const key = raw.toLocaleLowerCase('tr-TR').replace(/\./g, '');
  const map = {
    kg: 'kg', kilogram: 'kg', kilo: 'kg',
    g: 'g', gr: 'g', gram: 'g',
    mg: 'mg',
    l: 'l', lt: 'l', litre: 'l', liter: 'l',
    ml: 'ml', cl: 'cl', dl: 'dl',
    pce: 'ad', adet: 'ad', ad: 'ad', piece: 'ad', pc: 'ad',
    stk: 'ad', st: 'ad',
  };
  if (map[key]) return map[key];
  return normalizeRecipeUnit(raw);
}

function isUnitLike(cell) {
  const u = normalizeExcelRecipeUnit(cell);
  return PASTE_RECIPE_UNITS.has(u) || /^(kg|g|mg|ml|l|lt|litre|pce|adet|ad)$/i.test(String(cell || '').trim());
}

function normCell(v) {
  return String(v ?? '').replace(/^\ufeff/, '').trim();
}

function shouldSkipIngredientName(name) {
  const n = normCell(name);
  if (!n) return true;
  const low = n.toLowerCase();
  if (HEADER_CELLS.has(low)) return true;
  if (SKIP_LINE.test(n)) return true;
  if (/^total\b/i.test(n)) return true;
  return false;
}

/**
 * Barceló sheet row: [sap?, name, amount, ?, unit, price?, subtotal?]
 * @param {string[]} cells
 * @returns {ParsedIngredientRow|null}
 */
export function parseBarceloIngredientCells(cells) {
  const p = cells.map((c) => normCell(c));
  if (!p.length) return null;

  if (p.length >= 3 && shouldSkipIngredientName(p[0]) && !shouldSkipIngredientName(p[1])) {
    // name, amount, unit
    const amount = parseFlexibleNumber(p[1]);
    if (amount != null && amount > 0 && isUnitLike(p[2])) {
      return { name: p[0], amount: String(amount), unit: normalizeExcelRecipeUnit(p[2]) };
    }
  }

  if (p.length >= 5) {
    const name = p[1] || p[0];
    const amount = parseFlexibleNumber(p[2]);
    const unitRaw = p[4] || p[3];
    if (!shouldSkipIngredientName(name) && amount != null && amount > 0 && isUnitLike(unitRaw)) {
      const sap = /^\d{5,}$/.test(p[0]) ? p[0] : null;
      /** @type {ParsedIngredientRow} */
      const row = {
        name,
        amount: String(amount),
        unit: normalizeExcelRecipeUnit(unitRaw),
      };
      if (sap) row.sap_code = sap;
      return row;
    }
  }

  if (p.length >= 4) {
    const name = p[1] || p[0];
    const amount = parseFlexibleNumber(p[2]);
    const unitRaw = p[3] || p[4];
    if (!shouldSkipIngredientName(name) && amount != null && amount > 0 && isUnitLike(unitRaw)) {
      return { name, amount: String(amount), unit: normalizeExcelRecipeUnit(unitRaw) };
    }
  }

  return null;
}

export function isValidPasteRow(r) {
  const a = parseFlexibleNumber(r.amount);
  const u = normalizeRecipeUnit(r.unit);
  return !!(r.name && String(r.name).trim() && a != null && a > 0 && PASTE_RECIPE_UNITS.has(u));
}

/**
 * @param {string} text
 * @returns {{ rows: ParsedIngredientRow[], warnings: string[], format?: string }}
 */
export function parsePastedIngredients(text) {
  const rows = [];
  const warnings = [];
  let format = 'plain';
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const rawLine of lines) {
    if (rawLine.startsWith('#') || rawLine.startsWith('//')) continue;
    const line = rawLine.replace(/^[-*•]\s*/, '').trim();
    if (!line) continue;
    if (SKIP_LINE.test(line) && !line.includes('\t')) continue;

    if (line.includes('\t')) {
      const p = line.split('\t').map((x) => x.trim());
      const bar = parseBarceloIngredientCells(p);
      if (bar) {
        rows.push(bar);
        format = 'barcelo-tsv';
        continue;
      }
      if (p.length >= 3) {
        const a0 = parseFlexibleNumber(p[0]);
        const a2 = parseFlexibleNumber(p[2]);
        if (a0 != null && isUnitLike(p[1]) && p[2] && !isUnitLike(p[2])) {
          rows.push({ amount: normPasteAmount(p[0]), unit: normalizeExcelRecipeUnit(p[1]), name: p.slice(2).join(' ').trim() });
          format = 'tsv-amount-unit-name';
          continue;
        }
        if (a2 != null && isUnitLike(p[1])) {
          rows.push({ amount: normPasteAmount(p[2]), unit: normalizeExcelRecipeUnit(p[1]), name: p[0] });
          format = 'tsv-name-unit-amount';
          continue;
        }
        if (a0 != null && !isUnitLike(p[1])) {
          rows.push({ amount: normPasteAmount(p[0]), unit: 'g', name: p.slice(1).join(' ').trim() });
          continue;
        }
      }
      if (p.length === 2 && /^\d/.test(p[0])) {
        rows.push({ amount: normPasteAmount(p[0]), unit: 'g', name: p[1] });
        continue;
      }
      warnings.push(rawLine);
      continue;
    }

    let m = line.match(/^(\d+(?:[.,]\d+)?(?:e[+-]?\d+)?)\s*(şişe|şişeler|sis|sise|bottle)\s+(.+)$/iu);
    if (m && m[3].trim()) {
      rows.push({ amount: normPasteAmount(m[1]), unit: 'sis', name: m[3].trim() });
      continue;
    }
    m = line.match(/^(\d+(?:[.,]\d+)?)\s*(g|kg|mg|ml|cl|dl|l|yk|tk|ck|sb|cb|sis|kd|ad|pce)\s+(.+)$/i);
    if (m && m[3].trim()) {
      rows.push({ amount: normPasteAmount(m[1]), unit: normalizeExcelRecipeUnit(m[2]), name: m[3].trim() });
      continue;
    }
    m = line.match(/^(\d+(?:[.,]\d+)?)\s*(?:adet|ad|x|pce)\s+(.+)$/i);
    if (m && m[2].trim()) {
      rows.push({ amount: normPasteAmount(m[1]), unit: 'ad', name: m[2].trim() });
      continue;
    }
    m = line.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/i);
    if (m) {
      const rest = m[2].trim();
      if (!rest || shouldSkipIngredientName(rest)) {
        warnings.push(rawLine);
        continue;
      }
      rows.push({ amount: normPasteAmount(m[1]), unit: 'g', name: rest });
      continue;
    }
    warnings.push(rawLine);
  }
  return { rows, warnings, format };
}

/**
 * @param {unknown[][]} matrix
 * @param {string} [sheetName]
 * @returns {{ name: string, servings: number, ingredients: ParsedIngredientRow[] }|null}
 */
export function parseBarceloRecipeSheet(matrix, sheetName = '') {
  if (!matrix?.length) return null;

  const rows = matrix.map((r) => (Array.isArray(r) ? r.map(normCell) : []));
  const flat = rows.flat().join(' ').toLowerCase();
  if (/^material\b/i.test(rows[0]?.[0] || '') && /short\s*text/i.test(rows[0]?.[1] || '')) {
    return null;
  }
  if (!/ingredients/i.test(flat) && !/dish\s*name/i.test(flat)) {
    if (!sheetName || /^sheet\d*$/i.test(sheetName)) return null;
  }

  let name = normCell(sheetName);
  let servings = 1;

  for (let i = 0; i < Math.min(rows.length, 12); i++) {
    const row = rows[i];
    const a = normCell(row[0]).toLowerCase();
    if (a.includes('dish') && a.includes('name')) {
      const candidate = normCell(row[2]) || normCell(row[1]);
      if (candidate && !/dish|name/i.test(candidate)) name = candidate;
    }
    if (/no\.?\s*of\s*diners/i.test(row.join(' '))) {
      const p = parseFlexibleNumber(row[7] ?? row[8]);
      if (p != null && p >= 1) servings = Math.round(p);
    }
  }

  let headerRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const a = normCell(rows[i][0]).toLowerCase();
    const c = normCell(rows[i][2]).toLowerCase();
    if (a === 'ingredients' || (a.includes('ingredient') && c.includes('cost'))) {
      headerRow = i;
      break;
    }
  }

  let dataStart = headerRow >= 0 ? headerRow + 1 : 0;
  for (let i = headerRow >= 0 ? headerRow : 0; i < Math.min(rows.length, headerRow + 5); i++) {
    const c = normCell(rows[i][2]).toLowerCase();
    if (c === 'amount' || c.includes('amount')) {
      dataStart = i + 1;
      break;
    }
  }

  if (headerRow >= 0) {
    const portion = parseFlexibleNumber(rows[headerRow][7]);
    if (portion != null && portion >= 1) servings = Math.round(portion);
  }

  const ingredients = [];
  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.length ? row : [];
    const c0 = normCell(cells[2]).toLowerCase();
    if (c0.includes('total cost')) break;

    const parsed = parseBarceloIngredientCells(cells);
    if (parsed && isValidPasteRow(parsed)) {
      ingredients.push(parsed);
      continue;
    }
    const b = normCell(cells[1]);
    const amt = parseFlexibleNumber(cells[2]);
    if (b && amt != null && amt > 0 && !shouldSkipIngredientName(b)) {
      const unit = normalizeExcelRecipeUnit(cells[4] || 'kg');
      ingredients.push({ name: b, amount: String(amt), unit });
    }
  }

  if (!ingredients.length) return null;
  if (!name || /^sheet\d*$/i.test(name)) {
    name = sheetName && !/^sheet\d*$/i.test(sheetName) ? sheetName : 'Imported recipe';
  }
  return { name, servings, ingredients };
}

/**
 * @param {object} XLSX
 * @param {object} wb
 * @param {string} sheetName
 * @returns {unknown[][]}
 */
function sheetToMatrix(XLSX, wb, sheetName) {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
}

async function loadXlsx() {
  const mod = await import('https://esm.sh/xlsx@0.18.5');
  return mod.default || mod;
}

/**
 * @param {File} file
 * @returns {Promise<{ recipes: { name: string, kind: string, data: object }[], warnings: string[], skippedSheets: string[] }>}
 */
export async function parseRecipeExcelFile(file) {
  const name = (file?.name || '').toLowerCase();
  const warnings = [];
  const skippedSheets = [];

  if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.xlsm')) {
    return { recipes: [], warnings: ['unsupported_file'], skippedSheets };
  }

  let XLSX;
  try {
    XLSX = await loadXlsx();
  } catch {
    return { recipes: [], warnings: ['xlsx_load_failed'], skippedSheets };
  }

  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: true });

  const recipes = [];
  for (const sn of wb.SheetNames) {
    const matrix = sheetToMatrix(XLSX, wb, sn);
    const parsed = parseBarceloRecipeSheet(matrix, sn);
    if (parsed) {
      recipes.push({
        name: parsed.name,
        kind: 'food',
        data: {
          servings: parsed.servings,
          ingredients: parsed.ingredients.map((ing) => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
          })),
        },
      });
    } else if (matrix.length > 0) {
      skippedSheets.push(sn);
    }
  }

  if (!recipes.length && wb.SheetNames.length === 1) {
    warnings.push('no_recipe_sheet');
  }

  return { recipes, warnings, skippedSheets };
}

/**
 * Paste TSV block from a single dish sheet (ingredient table only).
 * @param {string} text
 * @returns {{ rows: ParsedIngredientRow[], warnings: string[] }}
 */
export function parsePastedBarceloBlock(text) {
  const matrix = String(text || '').split(/\r?\n/).map((line) => line.split('\t').map(normCell));
  const parsed = parseBarceloRecipeSheet(matrix, '');
  if (parsed?.ingredients?.length) {
    return { rows: parsed.ingredients, warnings: [] };
  }
  return parsePastedIngredients(text);
}
