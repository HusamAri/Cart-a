#!/usr/bin/env node
/** Regenerate src/locales/es.js from src/locales/es.json (browser ESM import). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = path.join(root, 'src/locales/es.json');
const jsPath = path.join(root, 'src/locales/es.js');

const es = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
fs.writeFileSync(jsPath, `export default ${JSON.stringify(es, null, 2)};\n`);
console.log(`Wrote ${path.relative(root, jsPath)} (${Object.keys(es).length} keys)`);
