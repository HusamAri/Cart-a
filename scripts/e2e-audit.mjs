#!/usr/bin/env node
/**
 * Public + static E2E audit (fetch-based; no Playwright required).
 * Usage: node scripts/e2e-audit.mjs [baseUrl]
 * Optional: CARTA_PROD_URL=https://cart-a.live node scripts/e2e-audit.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] || process.env.CARTA_BASE_URL || 'http://127.0.0.1:8765';
const prodUrl = process.env.CARTA_PROD_URL || 'https://cart-a.live';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PUBLIC_ROUTES = [
  { path: '/', name: 'landing', expectStatus: 200 },
  { path: '/app/login.html', name: 'login', expectStatus: 200 },
  { path: '/app/m/index.html', name: 'guest_menu_no_token', expectStatus: 200 },
  { path: '/app/m/index.html?t=invalid-token-test', name: 'guest_menu_bad_token', expectStatus: 200 },
];

const MODULE_ROUTES = [
  '/app/studio/menus.html',
  '/app/studio/recipes.html',
  '/app/studio/dashboard.html',
];

const REQUIRED_SVG_IDS = [
  'menu_glass', 'menu_beer', 'menu_snack', 'menu_layers', 'qr_code', 'link', 'dashboard',
];

const findings = [];
function pass(id, msg) { findings.push({ level: 'pass', id, msg }); }
function warn(id, msg) { findings.push({ level: 'warn', id, msg }); }
function fail(id, msg) { findings.push({ level: 'fail', id, msg }); }

const svgText = fs.readFileSync(path.join(root, 'assets/carta-icons.svg'), 'utf8');
for (const id of REQUIRED_SVG_IDS) {
  if (svgText.includes(`id="${id}"`)) pass(`svg:${id}`, `Sprite symbol ${id} present`);
  else fail(`svg:${id}`, `Missing symbol ${id} in carta-icons.svg`);
}

const capSrc = fs.readFileSync(path.join(root, 'src/capability-map.js'), 'utf8');
const capGaps = [
  ['guest_menu_publish', /guest|qr_publish|publish_guest/],
  ['workspace_logo', /logo|branding/],
  ['menu_type_set', /menu_type|set_menu_type/],
];
for (const [id, re] of capGaps) {
  if (re.test(capSrc)) pass(`cap:${id}`, 'Capability map mentions area');
  else warn(`cap:${id}`, 'Not in capability-map.js — agent parity gap');
}

async function fetchStatus(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const text = await res.text();
    return { status: res.status, text, url: res.url };
  } catch (err) {
    return { status: 0, text: '', url, error: String(err.message || err) };
  }
}

for (const route of PUBLIC_ROUTES) {
  const { status, text, error } = await fetchStatus(`${base}${route.path}`);
  if (error) fail(`route:${route.name}`, error);
  else if (status === route.expectStatus || (status >= 200 && status < 400)) {
    pass(`route:${route.name}`, `${route.path} → ${status}`);
  } else fail(`route:${route.name}`, `${route.path} → HTTP ${status}`);

  if (route.name === 'guest_menu_no_token' && /invalid|geçersiz|inválid/i.test(text)) {
    pass('guest:invalid_msg', 'Shows invalid link message');
  } else if (route.name === 'guest_menu_no_token') {
    warn('guest:invalid_msg', 'Could not confirm invalid-link copy in HTML');
  }
}

for (const routePath of MODULE_ROUTES) {
  const { text, url } = await fetchStatus(`${base}${routePath}`);
  if (url.includes('login') || text.includes('login.html')) {
    pass(`auth:${routePath}`, 'Unauthenticated fetch reaches login flow');
  } else {
    warn(`auth:${routePath}`, 'Module HTML returned without obvious login redirect');
  }
}

// Production drift check (local repo vs deployed)
const prodChecks = [
  { path: '/src/menu-type-icon.js', needle: 'menuTypeBadgeHtml', id: 'prod:menu_type_icon' },
  { path: '/src/menu-structure.js', needle: 'MENU_TYPE_KEYS', id: 'prod:menu_types' },
  { path: '/app/studio/menus.html', needle: 'menu-type-icon', id: 'prod:menus_type_ui' },
];
for (const check of prodChecks) {
  const { status, text } = await fetchStatus(`${prodUrl}${check.path}`);
  if (status !== 200) warn(check.id, `${prodUrl}${check.path} → HTTP ${status}`);
  else if (text.includes(check.needle)) pass(check.id, 'Deployed on production');
  else warn(check.id, 'Not on production yet — deploy to cart-a.live');
}

// Module graph: menus imports menu-type-icon
const menusHtml = fs.readFileSync(path.join(root, 'app/studio/menus.html'), 'utf8');
if (menusHtml.includes('menu-type-icon.js')) pass('menus:type_icon', 'Menus page imports menu-type-icon');
else fail('menus:type_icon', 'Missing menu-type-icon import');

if (menusHtml.includes('menuTypeBadgeHtml')) pass('menus:type_badge', 'Type badges wired in menus UI');
else fail('menus:type_badge', 'Type badges not found in menus.html');

const layoutJs = fs.readFileSync(path.join(root, 'src/studio-layout.js'), 'utf8');
if (layoutJs.includes('sidebarNavIcon') && !layoutJs.includes('sidebarNavSprite')) {
  pass('nav:svg_icons', 'Studio nav uses SVG cartaIcon');
} else {
  warn('nav:svg_icons', 'Studio nav may still use PNG sprite');
}

const summary = {
  prodUrl,
  base,
  at: new Date().toISOString(),
  counts: {
    pass: findings.filter((f) => f.level === 'pass').length,
    warn: findings.filter((f) => f.level === 'warn').length,
    fail: findings.filter((f) => f.level === 'fail').length,
  },
  findings,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.counts.fail > 0 ? 1 : 0);
