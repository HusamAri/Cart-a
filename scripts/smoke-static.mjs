#!/usr/bin/env node
/**
 * Static smoke checks (no browser, no Supabase).
 * Run: node scripts/smoke-static.mjs
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function exists(rel) {
  return fs.existsSync(path.join(root, rel.replace(/^\//, '')));
}

function collectHtml(dir) {
  const out = [];
  if (!fs.existsSync(path.join(root, dir))) return out;
  for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...collectHtml(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

for (const f of fs.readdirSync(path.join(root, 'src')).filter((x) => x.endsWith('.js'))) {
  const full = path.join(root, 'src', f);
  try {
    execSync(`node --check "${full}"`, { stdio: 'pipe' });
  } catch {
    errors.push(`Syntax error: src/${f}`);
  }
}

const htmlFiles = [...collectHtml('app'), ...['index.html', 'login.html', 'signup.html'].filter((f) => exists(f))];

for (const file of htmlFiles) {
  const c = fs.readFileSync(path.join(root, file), 'utf8');
  for (const m of c.matchAll(/from\s+['"](\/src\/[^'"]+)['"]/g)) {
    const rel = m[1].replace(/^\//, '');
    if (!exists(rel)) errors.push(`${file}: missing import ${m[1]}`);
  }
  for (const m of c.matchAll(/href="(\/app\/[^"#?]+\.html)"/g)) {
    const rel = m[1].replace(/^\//, '');
    if (!exists(rel)) errors.push(`${file}: broken link ${m[1]}`);
  }
}

const studio = fs.readFileSync(path.join(root, 'app/studio.html'), 'utf8');
for (const m of studio.matchAll(/\/assets\/[a-zA-Z0-9._-]+\.(png|jpg|webp|svg)/g)) {
  if (!exists(m[0])) errors.push(`studio.html: missing ${m[0]}`);
}

const layout = fs.readFileSync(path.join(root, 'src/studio-layout.js'), 'utf8');
for (const m of layout.matchAll(/href:\s*['"](\/app\/[^'"]+)['"]/g)) {
  if (!exists(m[1].replace(/^\//, ''))) errors.push(`studio-layout: broken nav ${m[1]}`);
}

const i18n = fs.readFileSync(path.join(root, 'src/i18n.js'), 'utf8');
for (const key of ['studio.context_aria_both', 'studio.context_aria_facility', 'ui.sidebar_expand']) {
  if (!i18n.includes(`'${key}'`)) errors.push(`i18n missing: ${key}`);
}

for (const legal of ['legal/privacy.html', 'legal/terms.html', 'legal/kvkk.html']) {
  if (!exists(legal)) errors.push(`Missing legal page: ${legal}`);
}

if (errors.length) {
  console.error('Smoke static FAILED:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`Smoke static OK (${htmlFiles.length} HTML files, src/*.js syntax)`);
