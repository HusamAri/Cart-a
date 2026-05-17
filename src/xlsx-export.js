// Carta — SpreadsheetML 2003 XML export (no dependencies, Excel-compatible)
// Output is a .xls file that Excel 2003+ opens natively.

function xmlEscape(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function xlsCell(value, type) {
  if (value === null || value === undefined || value === '') return '<Cell/>';
  const t = type || (typeof value === 'number' && isFinite(value) ? 'Number' : 'String');
  return `<Cell><Data ss:Type="${t}">${xmlEscape(value)}</Data></Cell>`;
}

function xlsRow(cells) {
  return `<Row>${cells.map(c => {
    if (c === null || c === undefined) return '<Cell/>';
    if (typeof c === 'object' && c !== null && 'v' in c) return xlsCell(c.v, c.t);
    return xlsCell(c);
  }).join('')}</Row>`;
}

/**
 * Build a SpreadsheetML 2003 workbook XML from sheets.
 * sheets: [{ name: 'Sheet1', rows: [[cell, cell, ...], ...] }]
 * Each cell can be a primitive (auto-typed) or {v: value, t: 'Number'|'String'}
 */
export function buildXlsWorkbook(sheets) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="hdr"><Font ss:Bold="1"/><Interior ss:Color="#EFEEEC" ss:Pattern="Solid"/></Style>
  <Style ss:ID="num"><NumberFormat ss:Format="#,##0.00"/></Style>
  <Style ss:ID="pct"><NumberFormat ss:Format="0.0%"/></Style>
 </Styles>
${sheets.map(s => `
 <Worksheet ss:Name="${xmlEscape(s.name || 'Sheet1')}">
  <Table>
${(s.rows || []).map(xlsRow).join('\n')}
  </Table>
 </Worksheet>`).join('')}
</Workbook>`;
  return xml;
}

export function downloadWorkbook(filename, sheets) {
  const xml = buildXlsWorkbook(sheets);
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xls') ? filename : filename + '.xls';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}
