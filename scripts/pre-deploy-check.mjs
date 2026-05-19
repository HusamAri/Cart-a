#!/usr/bin/env node
/**
 * Verifies critical static files exist before git push / Vercel deploy.
 * No network, no paid APIs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const required = [
  'src/menu-type-icon.js',
  'src/menu-structure.js',
  'src/menu-guest.js',
  'src/workspace-logo.js',
  'src/qr-menu.js',
  'src/capability-map.js',
  'assets/carta-icons.svg',
  'app/m/index.html',
  'app/studio/menus.html',
  'supabase/migrations/20260519200000_guest_menu_qr.sql',
  'supabase/migrations/20260519220000_menu_cluster_types.sql',
];

const errors = [];
for (const rel of required) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) errors.push(`Missing: ${rel}`);
}

const svg = fs.readFileSync(path.join(root, 'assets/carta-icons.svg'), 'utf8');
for (const id of ['menu_glass', 'qr_code', 'menu_layers']) {
  if (!svg.includes(`id="${id}"`)) errors.push(`SVG missing symbol: ${id}`);
}

if (errors.length) {
  console.error('Pre-deploy check FAILED:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`Pre-deploy check OK (${required.length} critical paths)`);
