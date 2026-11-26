// Eraser's sign-off check for the real home and the Fireflies DNA logos, run against the app itself.
// Usage: node checks/real-home-check.cjs http://localhost:3506 [chrome|webkit]
// Needs playwright-core (npm install --no-save playwright-core).
//
// Part A uses the server's real agents, read only (GET pages; /new is never opened, so nothing is created).
// Part B swaps /api/agents for test agents in the browser only (page.route), so the real data is never touched:
//   blink pairs 1 s and 1 day apart, a same-moment control, big agents (60 / 61 / 200 MB), and an agent with no files.
// The blink part reuses blink-check.cjs's method: sum the canvas alpha every frame and count the rises.
const pw = require('playwright-core');
const base = process.argv[2] || 'http://localhost:3506';
const which = process.argv[3] || 'chrome';
const MB = 1048576;
let fails = 0;
const ok = (cond, label, extra = '') => { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + label + (extra ? '  ' + extra : '')); };

const T0 = Date.parse('2026-11-01T10:00:00Z');
const iso = ms => new Date(ms).toISOString();
const file = (name, mb, at) => ({ id: name, name, sizeBytes: Math.round(mb * MB), addedAt: iso(at), topic: 'notes' });
const agent = (id, name, createdAt, dna) => ({ id, name, description: 'Test agent ' + name, createdAt: iso(createdAt), updatedAt: iso(createdAt), dna, draft: { name, description: 'Test agent ' + name } });
const TEST = [
  agent('aaaaaaaaaa01', 'Pair one second', T0 + 9e6, [file('a/1', .1, T0), file('a/2', .1, T0 + 1000)]),
  agent('aaaaaaaaaa02', 'Pair one day', T0 + 8e6, [file('b/1', .1, T0), file('b/2', .1, T0 + 86400e3)]),
  agent('aaaaaaaaaa03', 'Pair same moment', T0 + 7e6, [file('c/1', .1, T0), file('c/2', .1, T0)]),
  agent('aaaaaaaaaa04', 'Sixty MB', T0 + 6e6, [file('d/1', 60, T0)]),
  agent('aaaaaaaaaa05', 'Sixty one MB', T0 + 5e6, [file('e/1', 61, T0)]),
  agent('aaaaaaaaaa06', 'Two hundred MB', T0 + 4e6, [file('f/1', 200, T0)]),
  agent('aaaaaaaaaa07', 'Three point two MB', T0 + 3e6, [file('g/1', 3.2, T0)]),
  agent('aaaaaaaaaa08', 'Sizes', T0 + 2e6, [file('h/1', 1, T0), file('h/2', 1 / MB, T0 + 1)]),
  agent('aaaaaaaaaa09', 'No files yet', T0 + 1e6, []),
];

async function open(browser, reduce, fake) {
  const page = await browser.newPage({ reducedMotion: reduce ? 'reduce' : 'no-preference', viewport: { width: 900, height: 1400 } });
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) page.errors.push(r.status() + ' ' + r.url()); });
  if (fake) await page.route('**/api/agents', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TEST) }));
  return page;
}
// Total alpha of a row's canvas (index i in window.dnaLogos order = row order).
const alphaOf = (page, i) => page.evaluate(i => {
  const cv = document.querySelectorAll('#rows canvas')[i]; if (!cv || !cv.width) return 0;
  const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let s = 0; for (let k = 3; k < d.length; k += 4) s += d[k]; return s;
}, i);
// blink-check.cjs's rises(): sample alpha every frame for ms, count upward jumps into a peak.
const trace = (page, i, ms) => page.evaluate(([i, ms]) => new Promise(done => {
  const cv = document.querySelectorAll('#rows canvas')[i], out = [], t0 = performance.now();
  const f = t => {
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let s = 0; for (let k = 3; k < d.length; k += 4) s += d[k];
    out.push([t - t0, s]); if (t - t0 < ms) requestAnimationFrame(f); else done(out);
  };
  requestAnimationFrame(f);
}), [i, ms]);
function rises(tr) {
  const v = tr.map(x => x[1]), lo = Math.min(...v), hi = Math.max(...v), mid = lo + (hi - lo) * .35, peaks = [];
  let up = false;
  for (let k = 1; k < v.length; k++) {
    if (!up && v[k] > mid && v[k] > v[k - 1]) { up = true; peaks.push(tr[k][0]); }
    if (up && v[k] < mid) up = false;
  }
  return peaks;
}

(async () => {
  const browser = which === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch({ channel: 'chrome' });
  console.log('== ' + which + ' against ' + base);

  /* ---------- A. The real home, real agents ---------- */
  let page = await open(browser, false, false);
  await page.goto(base + '/'); await page.waitForTimeout(2500);
  const real = await page.evaluate(async () => {
    const api = await (await fetch('/api/agents')).json();
    const rows = [...document.querySelectorAll('#rows > li')].map(li => ({
      href: li.querySelector('a.row')?.getAttribute('href'), canvas: !!li.querySelector('canvas'),
      name: li.querySelector('.name')?.textContent || '', desc: li.querySelector('.desc')?.textContent || '', age: li.querySelector('.age')?.textContent || '',
    }));
    const q = document.querySelector('#q').getBoundingClientRect(), f = document.querySelector('#find').getBoundingClientRect();
    const news = [...document.querySelectorAll('a[href="/new"], a[href^="/new?"], button, [role=button], form[action*="new"]')]
      .filter(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed').map(e => e.outerHTML.slice(0, 60));
    const text = document.body.innerText.toLowerCase();
    return { api: api.map(a => ({ id: a.id, createdAt: a.createdAt, files: (a.dna || []).length })), rows, logos: (window.dnaLogos || []).length,
      search: { type: document.querySelector('#q').type, placeholder: document.querySelector('#q').placeholder, centre: Math.round(f.left + f.width / 2), vw: innerWidth },
      news, oldWords: ['create agent', 'new agent button', 'get started', 'sketch'].filter(w => text.includes(w)),
      sizeControls: document.querySelectorAll('input[type=range], select, [name*=size i], [id*=size i]').length };
  });
  const order = real.api.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).map(a => '/agents/' + a.id);
  console.log('real agents:', real.api.length, 'files per agent:', JSON.stringify(real.api.map(a => a.files)));
  ok(real.rows.length === real.api.length && real.rows.length > 0, '1. one row per real agent', real.rows.length + ' rows');
  ok(JSON.stringify(real.rows.map(r => r.href)) === JSON.stringify(order), '1. rows newest first');
  ok(real.rows.every(r => r.canvas && r.name.trim() && r.age.trim()), '1. every row has logo, name and age');
  console.log('     rows:', JSON.stringify(real.rows.map(r => [r.name, r.desc.slice(0, 30), r.age])));
  ok(real.search.type === 'search' && real.search.placeholder === 'Search' && Math.abs(real.search.centre - real.search.vw / 2) <= 2, '1. search is a centred search field', JSON.stringify(real.search));
  ok(real.news.length === 1 && /id="plus"/.test(real.news[0]), '2. exactly one way to start a new agent (the plus)', JSON.stringify(real.news));
  ok(real.oldWords.length === 0, '2. no leftover old-home wording', JSON.stringify(real.oldWords));
  ok(real.logos === real.rows.length, '3. every home row face is a DNA logo', real.logos + ' logos');
  const lit = []; for (let i = 0; i < real.rows.length; i++) lit.push(await alphaOf(page, i));
  ok(lit.every(x => x > 0), '3. every real logo is visibly drawn', JSON.stringify(lit));
  ok(real.sizeControls === 0, '7. no size control on the home');
  // The plus: fireflies gather, then /new. Watch the gather, but stop it before /new loads (no agent is made by GET /new anyway).
  await page.route('**/new', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<p>new</p>' }));
  await page.click('#plus');
  await page.waitForTimeout(120);
  const gathering = await page.evaluate(() => document.querySelectorAll('canvas').length > document.querySelectorAll('#rows canvas').length || !!document.querySelector('.gather, [data-gather], .gathering'));
  await page.waitForURL('**/new', { timeout: 5000 }).catch(() => {});
  ok(gathering, '1. plus plays the fly-to-plus gather');
  ok(page.url().endsWith('/new'), '1. plus lands on /new', page.url());
  ok(page.errors.length === 0, 'A. no page errors', JSON.stringify(page.errors));
  await page.close();

  // Every agent page face is the DNA cluster too.
  page = await open(browser, false, false);
  const faces = [];
  for (const r of real.rows) {
    await page.goto(base + r.href); await page.waitForTimeout(900);
    faces.push(await page.evaluate(() => {
      const cv = document.querySelector('#logo'); const d = cv && cv.width ? cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data : [];
      let s = 0; for (let k = 3; k < d.length; k += 4) s += d[k];
      return { logos: (window.dnaLogos || []).length, canvases: document.querySelectorAll('canvas').length, imgs: document.querySelectorAll('img, svg').length, lit: s > 0,
        sizeControls: document.querySelectorAll('input[type=range], select, [name*=size i], [id*=size i]').length };
    }));
  }
  ok(faces.every(f => f.logos === 1 && f.canvases === 1 && f.imgs === 0 && f.lit), '3. every agent page face is one lit DNA logo, nothing else', JSON.stringify(faces));
  ok(faces.every(f => f.sizeControls === 0), '7. no size control on agent pages');
  ok(page.errors.length === 0, 'A. agent pages: no errors', JSON.stringify(page.errors));
  await page.close();

  /* ---------- B. Test agents (browser-only), motion on ---------- */
  page = await open(browser, false, true);
  await page.goto(base + '/'); await page.waitForTimeout(1500);
  const info = await page.evaluate(() => window.dnaLogos.map(x => ({ name: x.name, ...x.logo.info() })));
  const by = n => info.findIndex(x => x.name === n);
  // 4. blinks: per-file beat apart, then the eye (pixel rises) over two beats.
  const beat = (n) => { const x = info[by(n)]; return Math.round(Math.abs(x.files[1].blinkPhase - x.files[0].blinkPhase) * x.period); };
  const sec = beat('Pair one second'), day = beat('Pair one day'), same = beat('Pair same moment');
  ok(sec >= 300 && sec <= 900, '4. files 1 s apart blink ' + sec + ' ms apart');
  const dayPh = Math.abs(info[by('Pair one day')].files[1].blinkPhase - info[by('Pair one day')].files[0].blinkPhase);
  ok(dayPh > .4 && dayPh < .8, '4. a 1-day gap is squashed into one beat (phase step ' + dayPh + ', not 86 400 beats)');
  ok(same === 0, '4. control: files added together blink together');
  const per = Math.max(info[by('Pair one second')].period, info[by('Pair same moment')].period);
  const tSec = rises(await trace(page, by('Pair one second'), 2 * per + 300));
  const tSame = rises(await trace(page, by('Pair same moment'), 2 * per + 300));
  const tDay = rises(await trace(page, by('Pair one day'), 2 * per + 300));
  ok(tSec.length >= 2 * tSame.length - 1 && tSec.length > tSame.length, '4. the eye sees two blinks per beat for 1 s apart, one for the control',
    '1s rises ' + JSON.stringify(tSec.map(Math.round)) + ' / same ' + JSON.stringify(tSame.map(Math.round)) + ' / day ' + JSON.stringify(tDay.map(Math.round)));
  // 5. dots
  const placed = n => info[by(n)].placed, glow = n => info[by(n)].glow;
  ok(placed('Three point two MB') === 4, '5. 3.2 MB = 4 dots (one per started MB)', String(placed('Three point two MB')));
  ok(placed('Sixty MB') === 60 && glow('Sixty MB') === 0, '5. 60 MB = 60 dots, no glow');
  ok(placed('Sixty one MB') === 60 && glow('Sixty one MB') > 0, '5. 61 MB = still 60 dots, plus glow ' + glow('Sixty one MB'));
  ok(placed('Two hundred MB') === 60 && glow('Two hundred MB') > glow('Sixty one MB') && glow('Two hundred MB') <= .3, '5. 200 MB = still 60 dots, more glow (capped) ' + glow('Two hundred MB'));
  // 7. sizes
  const rs = info[by('Sizes')].dots.map(d => d.r).sort((a, b) => a - b);
  ok(rs[0] === 2.5 && rs[rs.length - 1] === 6, '7. dot size runs 2.5 (tiny file) to 6.0 (a full MB)', JSON.stringify(rs));
  const allR = info.flatMap(x => x.dots.map(d => d.r));
  ok(allR.every(r => r >= 2 && r <= 6), '7. no dot ever outside the floor 2.0 .. 6.0', Math.min(...allR) + '..' + Math.max(...allR));
  // 8. no files: one calm, visible, steady dot
  const nf = by('No files yet'); const a1 = await alphaOf(page, nf); await page.waitForTimeout(1500); const a2 = await alphaOf(page, nf);
  const peak = await page.evaluate(i => { const cv = document.querySelectorAll('#rows canvas')[i]; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let m = 0; for (let k = 3; k < d.length; k += 4) m = Math.max(m, d[k]); return m; }, nf);
  ok(a1 > 0 && a1 === a2, '8. no-files agent: one steady dot, no blink', 'alpha ' + a1 + ' then ' + a2);
  ok(peak >= 60, '8. the calm dot is visible to the eye, not near-blank', 'brightest pixel alpha ' + peak + '/255');
  ok(page.errors.length === 0, 'B. no page errors', JSON.stringify(page.errors));
  await page.close();

  /* ---------- 6. Reduce Motion: new dots light one by one, no pop ---------- */
  page = await open(browser, true, true);
  await page.goto(base + '/'); await page.waitForTimeout(1200);
  const rm = await page.evaluate(() => new Promise(done => {
    const x = window.dnaLogos.find(l => l.name === 'Sizes').logo, before = x.info();
    const t0 = performance.now(), steps = [], radii = new Map();
    let last = before.placed, sizeMoved = false;
    x.setFiles([...before.files.map(f => ({ id: f.id, name: f.id, sizeBytes: 1, addedAt: f.addedAt })),
      { id: 'h/3', name: 'h/3', sizeBytes: 6 * 1048576, addedAt: new Date().toISOString(), topic: 'notes' }]);
    const f = t => {
      const i = x.info();
      if (i.placed !== last) { steps.push([Math.round(t - t0), i.placed - last]); last = i.placed; }
      i.dots.forEach((d, k) => { if (radii.has(k) && radii.get(k) !== d.r) sizeMoved = true; radii.set(k, d.r); });
      if (t - t0 < 1500) requestAnimationFrame(f); else done({ before: before.placed, after: i.placed, steps, sizeMoved });
    };
    requestAnimationFrame(f);
  }));
  const gaps = rm.steps.slice(1).map((s, k) => s[0] - rm.steps[k][0]);
  ok(rm.after - rm.before === 6 && rm.steps.every(s => s[1] === 1), '6. Reduce Motion: 6 new dots arrive one at a time', JSON.stringify(rm.steps));
  ok(gaps.every(g => g >= 30 && g <= 120), '6. Reduce Motion: about 60 ms between dots', JSON.stringify(gaps));
  ok(!rm.sizeMoved, '6. Reduce Motion: no dot changes size while they land (no pop)');
  ok(page.errors.length === 0, '6. no page errors', JSON.stringify(page.errors));
  await page.close();

  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
