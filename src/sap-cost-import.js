// Parse SAP-style or generic Excel/CSV exports into cost_db-shaped rows.
// Heuristic column detection; Turkish / English / common SAP labels.

/**
 * @typedef {{ ingredient_name: string, per_100g: number, yield_pct: number, sap_code: string|null, as_of: string|null }} SapCostRow
 */

const ING_PATTERNS = [/ingredient|description|short text|material desc|malzeme|tanım|tanimi|ürün|urun|name(?!\s*code)/i, /^besin$/i];
const SAP_PATTERNS = [/matnr|material\s*number|^material$/i, /sap\s*code|^kod$/i, /^sku$/i];
const PRICE_AS_100G_PATTERNS = [/per\s*100\s*g|\/100g|100\s*gr|100g/i];
const PRICE_PATTERNS = [/moving|average|map|verpr|unit\s*price|birim fiyat|fiyat|price|amount|value|tutar|std\s*price/i];
const YIELD_PATTERNS = [/yield|verim|fire|\byield\s*%/i];
const PEINH_PATTERNS = [/price\s*unit|peinh|fiyat\s*birim/i];
const DATE_PATTERNS = [/as of|valid|geçer|gecer|tarih|datum|^\s*date\s*$/i];

function normCell(v) {
  if (v == null || v === '') return '';
  return String(v).replace(/^\ufeff/, '').trim();
}

function parseNumberFlexible(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'number' && isFinite(raw)) return raw;
  let t = normCell(raw).replace(/\s/g, '');
  if (!t) return null;
  if (/^\d{1,3}(\.\d{3})*,\d+$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(,\d{3})*\.\d+$/.test(t)) t = t.replace(/,/g, '');
  else if (/^\d+,\d+$/.test(t)) t = t.replace(',', '.');
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

function isFiniteNum(n) {
  return typeof n === 'number' && isFinite(n);
}

function pickCol(headers, patterns, idxFallback = -1) {
  for (let i = 0; i < headers.length; i++) {
    const h = normCell(headers[i]).toLowerCase();
    if (!h) continue;
    for (const p of patterns) {
      if (p.test(h)) return i;
    }
  }
  return idxFallback;
}

function parseDelimitedLine(line, delim) {
  if (delim === '\t') {
    return line.split('\t').map(c => normCell(c.replace(/^"|"$/g, '')));
  }
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (!inQ && c === delim) {
      out.push(normCell(cur));
      cur = '';
      continue;
    }
    cur += c;
  }
  out.push(normCell(cur));
  return out;
}

export function matrixFromCsvText(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => normCell(l));
  if (!lines.length) return [];
  const first = lines[0];
  let delim = ',';
  const cSemi = (first.match(/;/g) || []).length;
  const cComma = (first.match(/,/g) || []).length;
  const cTab = (first.match(/\t/g) || []).length;
  if (cTab >= cComma && cTab >= cSemi) delim = '\t';
  else if (cSemi > cComma) delim = ';';
  return lines.map(l => parseDelimitedLine(l, delim));
}

/**
 * @param {(string|number)[][]} matrix
 * @returns {{ rows: SapCostRow[], errors: string[], skipped: number }}
 */
export function sapMatrixToCostRows(matrix) {
  const errors = [];
  let skipped = 0;
  const out = [];
  if (!matrix.length) {
    errors.push('empty');
    return { rows: out, errors, skipped };
  }

  const headers = matrix[0].map(c => normCell(c));
  const hasHeader = headers.some(h =>
    ING_PATTERNS.some(p => p.test(h.toLowerCase()))
    || SAP_PATTERNS.some(p => p.test(h.toLowerCase()))
    || PRICE_PATTERNS.some(p => p.test(h.toLowerCase())),
  );
  const dataRows = hasHeader ? matrix.slice(1) : matrix;

  let iName = pickCol(headers, ING_PATTERNS);
  let iSap = pickCol(headers, SAP_PATTERNS);
  let iPrice100 = pickCol(headers, PRICE_AS_100G_PATTERNS);
  let iPrice = pickCol(headers, PRICE_PATTERNS);
  let iYield = pickCol(headers, YIELD_PATTERNS);
  let iPeinh = pickCol(headers, PEINH_PATTERNS);
  let iDate = pickCol(headers, DATE_PATTERNS);

  if (!hasHeader) {
    if (matrix[0].length >= 2) {
      iName = 0;
      iPrice = 1;
      iSap = matrix[0].length > 2 ? 2 : -1;
    }
  }

  if (iName < 0) {
    errors.push('no_ingredient_column');
    return { rows: out, errors, skipped };
  }
  if (iPrice100 < 0 && iPrice < 0) {
    errors.push('no_price_column');
    return { rows: out, errors, skipped };
  }

  const priceIsPer100g = iPrice100 >= 0;
  const priceCol = priceIsPer100g ? iPrice100 : iPrice;

  for (let r = 0; r < dataRows.length; r++) {
    const row = dataRows[r];
    const name = normCell(row[iName]);
    if (!name) {
      skipped++;
      continue;
    }
    const rawPrice = parseNumberFlexible(row[priceCol]);
    if (rawPrice == null || rawPrice <= 0) {
      skipped++;
      continue;
    }
    let peinh = iPeinh >= 0 ? parseNumberFlexible(row[iPeinh]) : null;
    if (peinh != null && peinh <= 0) peinh = null;

    let per100;
    if (priceIsPer100g) {
      per100 = rawPrice;
    } else if (peinh != null && isFiniteNum(peinh)) {
      const perKg = rawPrice / peinh;
      per100 = perKg / 10;
    } else {
      per100 = rawPrice;
    }

    let yld = 100;
    if (iYield >= 0) {
      const y = parseNumberFlexible(row[iYield]);
      if (y != null && y > 0 && y <= 100) yld = y;
    }

    let asOf = null;
    if (iDate >= 0 && row[iDate] != null && normCell(row[iDate])) {
      const d = normCell(row[iDate]);
      const excelSerial = parseNumberFlexible(d);
      if (excelSerial != null && excelSerial > 20000 && excelSerial < 100000) {
        const utc = Date.UTC(1899, 11, 30) + excelSerial * 86400000;
        asOf = new Date(utc).toISOString().slice(0, 10);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        asOf = d;
      }
    }

    const sap = iSap >= 0 ? normCell(row[iSap]) : '';
    out.push({
      ingredient_name: name,
      per_100g: Math.round(per100 * 100000) / 100000,
      yield_pct: yld,
      sap_code: sap || null,
      as_of: asOf,
    });
  }

  return { rows: out, errors, skipped };
}

/**
 * @param {File} file
 * @returns {Promise<{ rows: SapCostRow[], errors: string[], skipped: number }>}
 */
export async function parseSapCostFile(file) {
  const name = (file?.name || '').toLowerCase();
  const mime = (file?.type || '').toLowerCase();

  if (name.endsWith('.csv') || mime.includes('csv') || mime === 'text/plain') {
    const text = await file.text();
    const matrix = matrixFromCsvText(text);
    return sapMatrixToCostRows(matrix);
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.xlsm')
    || mime.includes('spreadsheet') || mime.includes('excel')) {
    const buf = await file.arrayBuffer();
    let XLSX;
    try {
      const mod = await import('https://esm.sh/xlsx@0.18.5');
      XLSX = mod.default || mod;
    } catch (e) {
      console.error(e);
      return { rows: [], errors: ['xlsx_load_failed'], skipped: 0 };
    }
    const wb = XLSX.read(buf, { type: 'array', cellDates: true });
    const sn = wb.SheetNames[0];
    if (!sn) return { rows: [], errors: ['no_sheet'], skipped: 0 };
    const sheet = wb.Sheets[sn];
    /** @type {any[][]} */
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
    return sapMatrixToCostRows(matrix);
  }

  return { rows: [], errors: ['unsupported_file'], skipped: 0 };
}
