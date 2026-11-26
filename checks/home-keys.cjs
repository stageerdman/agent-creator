// Jony's check of the home's keyboard paths: type + Enter opens the top match; ⌘N and a double plus reach /new.
// Usage: node checks/home-keys.cjs http://localhost:3505 [chrome|webkit]
// Needs playwright-core (npm install --no-save playwright-core).
const pw = require('playwright-core');
const base = process.argv[2] || 'http://localhost:3505';
const which = process.argv[3] || 'chrome';

(async () => {
  const browser = which === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const home = base + '/?demo=10';
  const mod = which === 'webkit' ? 'Meta' : 'Control';

  await page.goto(home); await page.waitForSelector('.row');
  const top = await page.evaluate(() => window.dnaLogos[1].name);
  await page.keyboard.type(top); await page.keyboard.press('Enter');
  await page.waitForURL(/\/agents\//, { timeout: 3000 });
  console.log('enter opened:', new URL(page.url()).pathname, 'title has', top);

  await page.goto(home); await page.waitForSelector('.row');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  console.log('enter on empty search stays home:', new URL(page.url()).pathname === '/');

  await page.goto(home); await page.waitForSelector('.row');
  const t0 = Date.now(); await page.keyboard.press(mod + '+n');
  await page.waitForURL(/\/new/, { timeout: 4000 });
  console.log(mod + '+N reached /new in', Date.now() - t0, 'ms');

  await page.goto(home); await page.waitForSelector('.row');
  const t1 = Date.now(); await page.click('#plus'); await page.waitForTimeout(150); await page.click('#plus');
  await page.waitForURL(/\/new/, { timeout: 4000 });
  console.log('double plus reached /new in', Date.now() - t1, 'ms');

  await page.goto(base + '/?demo=0'); await page.waitForTimeout(500);
  console.log('empty line:', await page.textContent('#quiet'));
  console.log('errors:', JSON.stringify(errors));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
