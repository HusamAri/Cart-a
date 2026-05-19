#!/usr/bin/env node
/**
 * Log in locally and capture console errors on studio module pages.
 * Usage: CARTA_EMAIL=... CARTA_PASSWORD=... node scripts/check-studio-pages.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://127.0.0.1:8765';
const email = process.env.CARTA_EMAIL;
const password = process.env.CARTA_PASSWORD;

if (!email || !password) {
  console.error('Set CARTA_EMAIL and CARTA_PASSWORD');
  process.exit(1);
}

const pages = [
  '/app/studio/dashboard',
  '/app/studio/recipes',
  '/app/studio/menus',
  '/app/studio/cost',
  '/app/studio/ingredients',
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const errors = [];
page.on('pageerror', (err) => errors.push({ type: 'pageerror', text: err.message }));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push({ type: 'console', text: msg.text() });
});

await page.goto(`${base}/app/login.html`, { waitUntil: 'networkidle' });
await page.click('button[data-mode="password"]');
await page.fill('#email', email);
await page.fill('#password', password);
await page.click('#submitBtn');
await page.waitForURL(/\/app\//, { timeout: 30000 });

// Open first workspace if on picker
if (!page.url().includes('/studio')) {
  const card = page.locator('.ws-card, [data-ws-id], a.ws-card__link').first();
  if (await card.count()) {
    await card.click();
    await page.waitForURL(/\/studio/, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
  }
}

const results = [];

for (const path of pages) {
  errors.length = 0;
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const mainText = await page.locator('main.studio-page, main#main').innerText().catch(() => '');
  const hasSidebar = await page.locator('#studioSidebar').count();
  const listOrEmpty = await page.locator('#listOrEmpty, #dashRoot, #clusterList, #costTableWrap').count();
  results.push({
    path,
    url: page.url(),
    sidebar: hasSidebar > 0,
    mainLen: mainText.trim().length,
    markers: listOrEmpty,
    errors: [...errors],
  });
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
