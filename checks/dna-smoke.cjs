// Jony's smoke check: the home and an agent page load, every face is a DNA logo, and its canvas is lit.
// Usage: node checks/dna-smoke.cjs http://localhost:3505 [chrome|webkit] [reduce|motion] [?demo=10]
// Needs playwright-core (npm install --no-save playwright-core).
const pw = require('playwright-core');
const base = process.argv[2] || 'http://localhost:3505';
const which = process.argv[3] || 'chrome';
const reduce = process.argv[4] === 'reduce';

(async () => {
  const browser = which === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(r.status() + ' ' + r.url()); });
  const lit = () => page.evaluate(() => [...document.querySelectorAll('canvas')].map(cv => {
    if (!cv.width) return 0; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let s = 0; for (let i = 3; i < d.length; i += 4) s += d[i]; return s;
  }));

  await page.goto(base + '/' + (process.argv[5] || '')); await page.waitForTimeout(2500);
  const home = await page.evaluate(() => (window.dnaLogos || []).map(x => ({ name: x.name, files: x.logo.info().files.length, dots: x.logo.info().dots.length, glow: x.logo.info().glow })));
  console.log(which, reduce ? 'reduce' : 'motion', 'home rows:', JSON.stringify(home));
  console.log('home canvases lit:', JSON.stringify(await lit()));
  console.log('plus buttons:', await page.locator('a[href="/new"], button').count());
  const first = await page.locator('.row').first().getAttribute('href');
  if (first) {
    await page.goto(base + first); await page.waitForTimeout(2500);
    console.log('agent page logos:', await page.evaluate(() => (window.dnaLogos || []).length), 'lit:', JSON.stringify(await lit()));
  }
  console.log('errors:', JSON.stringify(errors));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
