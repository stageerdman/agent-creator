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
    return { api: api.map(a => ({ id: a.id, createdAt: a.createdAt, desc: ((a.draft && a.draft.description) || '').trim(), files: (a.dna || []).length })), rows, logos: (window.dnaLogos || []).length,
      search: { type: document.querySelector('#q').type, placeholder: document.querySelector('#q').placeholder, centre: Math.round(f.left + f.width / 2), vw: innerWidth },
      news, oldWords: ['create agent', 'new agent button', 'get started', 'sketch'].filter(w => text.includes(w)),
      sizeControls: document.querySelectorAll('input[type=range], select, [name*=size i], [id*=size i]').length };
  });
  const order = real.api.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).map(a => '/agents/' + a.id);
  console.log('real agents:', real.api.length, 'files per agent:', JSON.stringify(real.api.map(a => a.files)));
  if (!real.api.length) {
    const quiet = await page.evaluate(() => { const q = document.querySelector('#quiet'); return q && !q.hidden ? q.textContent : ''; });
    ok(/press \+/i.test(quiet), '1. no agents yet: the home says how to start', JSON.stringify(quiet));
  }
  ok(real.rows.length === real.api.length, '1. one row per real agent', real.rows.length + ' rows');
  ok(JSON.stringify(real.rows.map(r => r.href)) === JSON.stringify(order), '1. rows newest first');
  ok(real.rows.every(r => r.canvas && r.name.trim() && r.age.trim()), '1. every row has logo, name and age');
  const descs = real.api.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).map(a => a.desc);
  ok(JSON.stringify(real.rows.map(r => r.desc.trim())) === JSON.stringify(descs), '1. every row shows its agent\'s description');
  console.log('     rows:', JSON.stringify(real.rows.map(r => [r.name, r.desc.slice(0, 30), r.age])));
  ok(real.search.type === 'search' && real.search.placeholder === 'Search' && Math.abs(real.search.centre - real.search.vw / 2) <= 2, '1. search is a centred search field', JSON.stringify(real.search));
  ok(real.news.length === 1 && /id="plus"/.test(real.news[0]), '2. exactly one way to start a new agent (the plus)', JSON.stringify(real.news));
  ok(real.oldWords.length === 0, '2. no leftover old-home wording', JSON.stringify(real.oldWords));
  ok(real.logos === real.rows.length, '3. every home row face is a DNA logo', real.logos + ' logos');
  const lit = []; for (let i = 0; i < real.rows.length; i++) lit.push(await alphaOf(page, i));
  ok(lit.every(x => x > 0), '3. every real logo is visibly drawn', JSON.stringify(lit));
  ok(real.sizeControls === 0, '7. no size control on the home');
  // Real files: dots = sum of started MB per file, capped at 60; the rest is glow.
  const realDots = await page.evaluate(async () => {
    const api = await (await fetch('/api/agents')).json();
    return window.dnaLogos.map(l => { const a = api.find(x => x.id === l.id), i = l.logo.info();
      const want = (a.dna || []).reduce((s, f) => s + Math.max(1, Math.ceil((+f.sizeBytes || 0) / 1048576)), 0);
      return { name: l.name, want: Math.min(60, want), extra: Math.max(0, want - 60), placed: i.placed, glow: i.glow }; });
  });
  ok(realDots.every(d => d.placed === d.want && (d.extra > 0) === (d.glow > 0)), '5. real agents: one dot per started MB, max 60, rest as glow', JSON.stringify(realDots));
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
  // What the page actually does: record each file's real blink moments (lastBlink, page clock) frame by frame.
  const per = Math.max(...['Pair one second', 'Pair one day', 'Pair same moment'].map(n => info[by(n)].period));
  const seen = await page.evaluate(([names, ms]) => new Promise(done => {
    const logos = names.map(n => window.dnaLogos.find(l => l.name === n).logo), out = names.map(() => [[], []]), t0 = performance.now();
    const f = t => {
      logos.forEach((l, k) => l.info().files.forEach((fl, j) => { const b = fl.lastBlink; if (b != null && out[k][j][out[k][j].length - 1] !== b) out[k][j].push(b); }));
      if (t - t0 < ms) requestAnimationFrame(f); else done(out);
    };
    requestAnimationFrame(f);
  }), [['Pair one second', 'Pair one day', 'Pair same moment'], 2 * per + 500]);
  // For each blink of file 1, the distance to the nearest blink of file 2.
  const apart = ([a, b]) => a.length && b.length ? Math.round(Math.min(...a.map(x => Math.min(...b.map(y => Math.abs(x - y)))))) : null;
  const [eSec, eDay, eSame] = seen.map(apart);
  ok(eSec != null && eSec >= 300 && eSec <= 900, '4. on screen, files 1 s apart really blink ' + eSec + ' ms apart', 'blinks ' + JSON.stringify(seen[0].map(s => s.map(Math.round))));
  ok(eDay != null && eDay > 150 && eDay < per - 150, '4. on screen, the 1-day pair blinks ' + eDay + ' ms apart (period ' + per + ')');
  ok(eSame === 0, '4. on screen, the same-moment pair blinks in the same frame', String(eSame));
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
  const peakOf = i => page.evaluate(i => { const cv = document.querySelectorAll('#rows canvas')[i]; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let m = 0; for (let k = 3; k < d.length; k += 4) m = Math.max(m, d[k]); return m; }, i);
  const peak = await peakOf(nf);
  // Compare with an ordinary dot at rest (between blinks): the lowest brightest-pixel over a beat of the 3.2 MB agent.
  const restPeaks = []; for (let k = 0; k < 12; k++) { restPeaks.push(await peakOf(by('Three point two MB'))); await page.waitForTimeout(per / 12); }
  const rest = Math.min(...restPeaks);
  ok(a1 > 0 && a1 === a2, '8. no-files agent: one steady dot, no blink', 'alpha ' + a1 + ' then ' + a2);
  ok(peak >= rest, '8. the calm dot is at least as visible as a resting dot of a normal agent', 'calm ' + peak + '/255, resting dot ' + rest + '/255');
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
    // A still Reduce Motion row stops drawing; the home wakes it on hover, as it would for a live arrival.
    document.querySelectorAll('#rows a.row')[window.dnaLogos.findIndex(l => l.name === 'Sizes')].dispatchEvent(new PointerEvent('pointerenter'));
    const f = t => {
      const i = x.info();
      if (i.placed !== last) { steps.push([Math.round(t - t0), i.placed - last]); last = i.placed; }
      // Per dot (file id + nth dot of that file): its first size vs every later size.
      const nth = {}; i.dots.forEach(d => { const key = d.fileId + '#' + (nth[d.fileId] = (nth[d.fileId] || 0) + 1); if (!radii.has(key)) radii.set(key, { first: d.r, max: d.r, min: d.r, isNew: d.fileId === 'h/3' }); const e = radii.get(key); e.max = Math.max(e.max, d.r); e.min = Math.min(e.min, d.r); });
      if (t - t0 < 1500) requestAnimationFrame(f); else {
        const v = [...radii.values()];
        done({ before: before.placed, after: i.placed, steps, newGrows: v.filter(e => e.isNew && e.max > e.first).length,
          oldShift: Math.max(0, ...v.filter(e => !e.isNew).map(e => Math.round((e.max - e.min) * 100) / 100)) });
      }
    };
    requestAnimationFrame(f);
  }));
  const gaps = rm.steps.slice(1).map((s, k) => s[0] - rm.steps[k][0]);
  ok(rm.after - rm.before === 6 && rm.steps.every(s => s[1] === 1), '6. Reduce Motion: 6 new dots arrive one at a time', JSON.stringify(rm.steps));
  ok(gaps.every(g => g >= 30 && g <= 120), '6. Reduce Motion: about 60 ms between dots', JSON.stringify(gaps));
  ok(rm.newGrows === 0, '6. Reduce Motion: a new dot turns on at its size and never grows (no pop)');
  console.log('     info: older dots tighten by up to ' + rm.oldShift + ' px radius as the cluster fills (instant under Reduce Motion)');
  ok(page.errors.length === 0, '6. no page errors', JSON.stringify(page.errors));
  await page.close();

  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
