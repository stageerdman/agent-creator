// The wander check: the field's fireflies really roam the left side, smoothly, with 10,000 files,
// are drawn where the wander says, stay pointer-free, and stand still under Reduce Motion.
// Usage: node checks/fireflies-wander-check.cjs http://localhost:3505 [chrome|webkit]
// Needs playwright-core (npm install --no-save playwright-core). Creates one agent: use a scratch home.
const pw = require('playwright-core');
const base = process.argv[2] || 'http://localhost:3505';
const which = process.argv[3] || 'chrome';
let fails = 0;
const ok = (cond, label, extra = '') => { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + label + (extra ? '  ' + extra : '')); };

// For ms of real time: the first 50 flies' drawn spots every 250 ms, every frame gap, and how many
// of those spots really have a lit pixel on the canvas (the drawing matches the wander).
const watch = (page, ms) => page.evaluate(ms => new Promise(done => {
  const cv = document.querySelector('canvas#flies'), ctx = cv.getContext('2d'), dpr = cv.width / innerWidth;
  const out = [], gaps = []; let lit = 0, probed = 0, last = performance.now();
  const t0 = last;
  const raf = t => {
    gaps.push(t - last); last = t;
    if (out.length % 8 === 0) {                       // probe right after this frame's paint
      const at = window.creation.info().field.at(t);
      for (const p of at.slice(0, 20)) {
        const d = ctx.getImageData(Math.round(p.x * dpr) - 2, Math.round(p.y * dpr) - 2, 5, 5).data;
        let a = 0; for (let k = 3; k < d.length; k += 4) a = Math.max(a, d[k]);
        probed++; if (a > 0) lit++;
      }
    }
    if (performance.now() - t0 < ms) requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  const tick = () => {
    out.push(window.creation.info().field.at());
    if (performance.now() - t0 < ms) setTimeout(tick, 250); else done({ out, gaps: gaps.slice(2), lit, probed });
  };
  tick();
}), ms);

(async () => {
  const browser = which === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch({ channel: 'chrome' });
  console.log('== ' + which + ' against ' + base);
  const page = await browser.newPage({ viewport: { width: 1200, height: 820 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('crash', () => console.log('page crashed'));
  page.on('framenavigated', f => { if (f === page.mainFrame()) console.log('navigated to ' + f.url()); });
  await page.goto(base + '/new'); await page.waitForTimeout(900);

  // 10,000 files dropped on the field
  await page.evaluate(() => {
    const dt = new DataTransfer();
    for (let k = 0; k < 10000; k++) dt.items.add(new File(['x'.repeat(1 + (k % 50))], `f${k}.md`));
    const at = { bubbles: true, cancelable: true, clientX: 300, clientY: 300, dataTransfer: dt };
    document.body.dispatchEvent(new DragEvent('dragenter', at)); document.body.dispatchEvent(new DragEvent('dragover', at));
    document.body.dispatchEvent(new DragEvent('drop', at));
  });
  const t0 = Date.now();
  let c;
  while (Date.now() - t0 < 40000) {
    c = await page.evaluate(() => window.creation.info());
    if (c.split && c.field.total >= 10000 && c.field.queued === 0 && c.field.flying === 0) break;
    await page.waitForTimeout(200);
  }
  ok(c.field.total === 10000 && c.field.drawn > 0 && c.field.moving, '10,000 files in, the field drawn and moving', `total ${c.field.total} drawn ${c.field.drawn}`);
  await page.waitForTimeout(800);

  /* 1. They roam the left side, smoothly, drawn where the wander says */
  // Real Chrome here is quit from outside about 25 s after launch, so watch 10 s and scale the bars (per 20 s: 20 px, 100 px).
  const secs = 10, per = secs / 20;
  const w = await watch(page, secs * 1000);
  const fw = 1200 - (await page.evaluate(() => innerWidth - document.querySelector('#menu').getBoundingClientRect().left));
  const n = w.out[0].length, dist = [], span = [];
  let inside = true;
  for (let i = 0; i < n; i++) {
    let d = 0, minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    for (let s = 0; s < w.out.length; s++) {
      const p = w.out[s][i];
      if (s) d += Math.hypot(p.x - w.out[s - 1][i].x, p.y - w.out[s - 1][i].y);
      minx = Math.min(minx, p.x); maxx = Math.max(maxx, p.x); miny = Math.min(miny, p.y); maxy = Math.max(maxy, p.y);
      if (p.x < 32 || p.x > fw - 32 || p.y < 32 || p.y > 820 - 32) inside = false;
    }
    dist.push(d); span.push(Math.hypot(maxx - minx, maxy - miny));
  }
  dist.sort((a, b) => a - b); span.sort((a, b) => a - b);
  ok(dist[0] > 20 * per, `every tracked fly flies over ${20 * per} px in ${secs} s (none stuck)`, `least ${dist[0].toFixed(0)} px`);
  ok(dist[n >> 1] > 100 * per, `the median fly roams over ${100 * per} px in ${secs} s`, `median ${dist[n >> 1].toFixed(0)} px, span median ${span[n >> 1].toFixed(0)} px`);
  ok(inside, 'every fly stays inside the left field, clear of the menu', `field width ${fw}`);
  ok(w.lit / w.probed > 0.9, 'the canvas draws a light where each wandering fly is', `${w.lit}/${w.probed}`);
  const g = w.gaps.slice().sort((a, b) => a - b), p95 = g[Math.floor(g.length * .95)], long = g.filter(x => x > 50).length;
  ok(p95 < 25 && long <= 3, 'smooth with 10,000 files: no long frames', `frames ${g.length}, p95 ${p95.toFixed(1)} ms, >50 ms: ${long}, max ${g[g.length - 1].toFixed(0)} ms`);

  /* 2. Not a control */
  const pe = await page.evaluate(() => getComputedStyle(document.querySelector('canvas#flies')).pointerEvents);
  ok(pe === 'none', 'the field takes no pointer (not draggable)', pe);

  /* 3. Reduce Motion: home spots, still */
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(500);
  const r = await page.evaluate(() => new Promise(done => {
    const a = window.creation.info().field.at(performance.now());
    const shot = () => document.querySelector('canvas#flies').toDataURL();
    const s1 = shot();
    setTimeout(() => done({ same: JSON.stringify(a) === JSON.stringify(window.creation.info().field.at(performance.now() + 3000)), still: s1 === shot(), moving: window.creation.info().field.moving }), 2000);
  }));
  ok(r.same && r.still && r.moving === false, 'Reduce Motion: every fly at its home spot, the canvas does not change', JSON.stringify(r));

  ok(errors.length === 0, 'no page errors', errors.join(' | '));
  await browser.close();
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
