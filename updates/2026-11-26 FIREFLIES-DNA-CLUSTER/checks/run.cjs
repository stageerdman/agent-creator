const pw = require('playwright-core');
const path = require('path');
const fs = require('fs');
// Eraser's clutter check of the 56 px cluster playground.
// Run from the repo root: node "updates/2026-11-26 FIREFLIES-DNA-CLUSTER/checks/run.cjs" [chrome|webkit]
// Needs playwright-core (npm install --no-save playwright-core). Screenshots go to .tmp-test/shots-cluster (git-ignored).
const ROOT = path.resolve(__dirname, '../../..');
const FILE = path.join(ROOT, 'playground/fireflies-dna.html');
const PAGE = 'file://' + FILE;
const SHOTS = path.join(ROOT, '.tmp-test/shots-cluster');
fs.mkdirSync(SHOTS, { recursive: true });
const which = process.argv[2] || 'chrome';
const out = [];
const ok = (c, msg) => out.push((c ? 'ok   ' : 'FAIL ') + msg);

function hue(hex) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0;
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}
const hueGap = (a, b) => { const d = Math.abs(hue(a) - hue(b)); return Math.min(d, 360 - d); };
const MB = 1048576;
const dotsFor = b => Math.max(1, Math.ceil(b / MB));
const facts = [];                                  // measured numbers, printed at the end for the sign-off
const idle = async (pg, max = 9000) => {
  const t = Date.now();
  while (Date.now() - t < max) { if (await pg.evaluate(() => window.dna.queueIdle())) return true; await pg.waitForTimeout(40); }
  return false;
};
// Group a lit log into runs of the same file, in the order they lit.
const runsOf = log => {
  const r = [];
  for (const e of log) { const L = r[r.length - 1]; if (L && L.id === e.fileId) { L.n++; L.ts.push(e.litAt); } else r.push({ id: e.fileId, n: 1, ts: [e.litAt] }); }
  r.forEach(x => { x.first = x.ts[0]; x.last = x.ts[x.ts.length - 1]; });
  return r;
};
const increasing = log => log.every((e, i) => !i || e.litAt > log[i - 1].litAt);

// Update 2 pixel probe, injected before the page runs. Every frame it copies the avatar and records:
//   frac: the share of "old" dots (not in __exclude) whose core is bright (alpha >= 128; rest is ~31, a flash ~235),
//   haze: the brightest pixel in empty space (not near any dot, its landing path or its flash growth).
const PROBE = `(() => {
  window.__samples = []; window.__exclude = new Set();
  const seg = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy; let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * dx, py - ay - t * dy); };
  const loop = () => {
    requestAnimationFrame(loop);
    const src = document.querySelector('[data-role="avatar"]'); if (!src || !window.dna || !src.width) return;
    const w = src.width, k = w / 56;
    const c = window.__pc || (window.__pc = document.createElement('canvas')); if (c.width !== w) c.width = c.height = w;
    const g = c.getContext('2d', { willReadFrequently: true }); g.clearRect(0, 0, w, w); g.drawImage(src, 0, 0);
    const D = g.getImageData(0, 0, w, w).data;
    const A = (x, y) => { x = Math.round(x * k); y = Math.round(y * k); return x < 0 || y < 0 || x >= w || y >= w ? 0 : D[(y * w + x) * 4 + 3]; };
    const peak = (x, y) => { let m = 0; for (let dy = -1.5; dy <= 1.5; dy += .5) for (let dx = -1.5; dx <= 1.5; dx += .5) m = Math.max(m, A(x + dx, y + dy)); return m; };
    const ds = window.dna.getDots(), old = ds.filter(d => !window.__exclude.has(d.fileId));
    let br = 0; for (const d of old) if (peak(d.x, d.y) >= 128) br++;
    let haze = 0;
    for (let y = 1; y < 56; y += 2) for (let x = 1; x < 56; x += 2) {
      let near = false;
      for (const d of ds) if (seg(x, y, d.x, d.y, 28 + (d.x - 28) * 1.3, 28 + (d.y - 28) * 1.3) < d.r * 1.3 + 3) { near = true; break; }
      if (!near) haze = Math.max(haze, A(x, y));
    }
    window.__samples.push({ t: performance.now(), frac: old.length ? br / old.length : 0, haze });
  };
  requestAnimationFrame(loop);
})();`;
const drain = pg => pg.evaluate(() => window.__samples.splice(0));
// Wait until an idle beat has peaked and faded, so the next beat is at least ~1.4 s away.
async function beatEnd(pg, max = 7000) {
  const t = Date.now(); let seen = false, peak = 0;
  while (Date.now() - t < max) {
    for (const s of await drain(pg)) { peak = Math.max(peak, s.frac); if (s.frac >= .8) seen = true; else if (seen && s.frac < .2) return peak; }
    await pg.waitForTimeout(30);
  }
  return seen ? peak : 0;
}

// 1. Static: no map, replay or timeline left in the code.
(() => {
  const html = fs.readFileSync(FILE, 'utf8');
  const bad = html.match(/replay|timeline|scrub|\bsky\b|#play|history|embedding|big map|data-ev|\bspeed\b|\bchain\b/gi) || [];
  ok(!bad.length, 'code: no map / replay / timeline leftovers ' + bad.join(','));
  ok(!/hidden/.test(html.replace(/overflow:\s*hidden|aria-hidden/g, '')), 'code: no hidden "maybe later" markup');
  // Update 2 clutter: no second way to trigger the animation.
  const evs = [...new Set([...html.matchAll(/addEventListener\(\s*'(\w+)'/g)].map(m => m[1]))];
  ok(evs.every(e => ['change', 'input', 'submit', 'click'].includes(e)) && !/mouse|pointer(enter|over|move|down|up)|focusin|onfocus|onhover|:hover[^{]*canvas/i.test(html), 'U2 code: no hover, pointer or focus trigger for the cluster (events: ' + evs.join(',') + ')');
  const flashSet = (html.match(/flashT\s*=[^=]/g) || []).length;
  ok(flashSet === 2, `U2 code: only two things start a flash, a dot landing and the idle beat (${flashSet} places)`);
})();

(async () => {
  const launch = () => which === 'webkit' ? pw.webkit.launch() : pw.chromium.launch({ channel: 'chrome' });
  let br = await launch();
  const open = async (opts = {}, probe = false) => {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, ...opts });
    const pg = await ctx.newPage();
    if (probe) await pg.addInitScript(PROBE);
    pg.setDefaultTimeout(5000);
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    pg.on('crash', () => console.log('PAGE CRASHED after:\n' + out.join('\n')));
    pg.on('close', () => console.log('page closed'));
    br.on('disconnected', () => console.log('browser disconnected'));
    pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
    await pg.goto(PAGE);
    await pg.waitForTimeout(600);
    return { ctx, pg, errs };
  };
  const dots = pg => pg.evaluate(() => window.dna.getDots());
  const shot = (pg, sel) => pg.evaluate(s => document.querySelector(s).toDataURL(), sel);

  // Headless Chrome here sometimes drops a tab mid-run. A block whose page drops is run again
  // (up to 3 times); the results of the dropped try are thrown away, never mixed in.
  const block = async (name, fn) => {
    const m = out.length, fm = facts.length;
    for (let k = 1; k <= 3; k++) {
      try { await fn(); return; } catch (e) {
        if (!/closed|crash|disconnect/i.test(e.message)) throw e;
        out.length = m; facts.length = fm; console.log(`retry ${name} (try ${k}: ${e.message.split('\n')[0]})`);
        if (!br.isConnected()) br = await launch();      // the whole browser went: start a fresh one
      }
    }
    ok(false, name + ': page dropped 3 times');
  };

  // 2. Normal motion
  await block('normal', async () => {
    const { ctx, pg, errs } = await open();
    await pg.screenshot({ path: `${SHOTS}/${which}-open.png` });
    await pg.locator('#row').screenshot({ path: `${SHOTS}/${which}-row.png` });

    // Layout: the avatar is 56 px in a row, the preview is the same cluster larger.
    const sz = await pg.evaluate(() => ['avatar', 'preview'].map(r => { const b = document.querySelector(`[data-role="${r}"]`).getBoundingClientRect(); return [b.width, b.height]; }));
    ok(sz[0][0] === 56 && sz[0][1] === 56, 'avatar is 56x56: ' + sz[0]);
    ok(sz[1][0] > 56, 'preview is larger: ' + sz[1]);

    // Controls: only files (add + remove), min/max size, and the name that stands in for the agent.
    const ctl = await pg.evaluate(() => [...document.querySelectorAll('button, input, select, textarea, [tabindex], a[href]')]
      .map(e => e.id || e.className || e.tagName));
    const other = ctl.filter(c => !['agentName', 'fname', 'go', 'fsize', 'minR', 'maxR', 'x'].includes(c));
    const nx = ctl.filter(c => c === 'x').length, nf = (await pg.evaluate(() => window.dna.getFiles())).length;
    ok(!other.length, 'controls: nothing beyond name, files, add, size, min, max ' + other.join(','));
    ok(nx === nf, `one remove per file (${nx} x for ${nf} files), no second way to remove`);
    ok(ctl.filter(c => c === 'go').length === 1, 'one Add button');

    // Sample set
    const files0 = await pg.evaluate(() => window.dna.getFiles());
    ok(files0.length >= 8, 'sample set loaded: ' + files0.length + ' files');

    // Update 2: 1 dot per MB (was: one dot per file). Inside the avatar box (with the 30 % flash growth), compact.
    let d = await dots(pg);
    const want0 = files0.reduce((s, f) => s + Math.max(1, Math.ceil(f.bytes / MB)), 0);
    ok(d.length === want0 && files0.every(f => f.dots === Math.max(1, Math.ceil(f.bytes / MB))), `sample set: dots = sum of ceil(MB) (${d.length} for ${files0.length} files)`);
    const inBox = ds => ds.every(p => p.x - 1.3 * p.r >= 0 && p.x + 1.3 * p.r <= 56 && p.y - 1.3 * p.r >= 0 && p.y + 1.3 * p.r <= 56);
    const extent = ds => { const xs = ds.flatMap(p => [p.x - p.r, p.x + p.r]), ys = ds.flatMap(p => [p.y - p.r, p.y + p.r]); return [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]; };
    ok(inBox(d), 'every dot (flash included) stays inside 0-56');
    const ex = extent(d);
    ok(ex[0] >= 30 && ex[1] >= 24, 'cluster fills the avatar (not a speck): ' + ex.map(v => v.toFixed(1)).join('x'));

    // Pixels: the avatar's 1 px outer ring stays dark over two seconds of motion.
    let edge = 0;
    for (let k = 0; k < 10; k++) {
      edge = Math.max(edge, await pg.evaluate(() => {
        // Read a copy, so the probe itself never touches the page's own canvas context.
        const src = document.querySelector('[data-role="avatar"]'), w = src.width;
        const c = window.__probe || (window.__probe = document.createElement('canvas'));
        c.width = c.height = w;
        const g = c.getContext('2d', { willReadFrequently: true }); g.clearRect(0, 0, w, w); g.drawImage(src, 0, 0);
        const px = [g.getImageData(0, 0, w, 1), g.getImageData(0, w - 1, w, 1), g.getImageData(0, 0, 1, w), g.getImageData(w - 1, 0, 1, w)];
        let m = 0; for (const p of px) for (let i = 3; i < p.data.length; i += 4) m = Math.max(m, p.data[i]); return m;
      }));
      await pg.waitForTimeout(200);
    }
    ok(edge < 40, 'avatar edge ring stays dark (max alpha ' + edge + '/255): nothing is cut off');

    // Size follows file size, inside the range.
    const R = await pg.evaluate(() => window.dna.getSizeRange());
    // Update 2: a bigger file gets more dots (was: a bigger dot); a file's full dots share one size, its last dot is no bigger.
    const byFile = new Map(); d.forEach(p => (byFile.get(p.fileId) || byFile.set(p.fileId, []).get(p.fileId)).push(p.r));
    const fullR = Math.max(...d.map(p => p.r));
    ok([...byFile.values()].every(rs => rs.slice(0, -1).every(r => Math.abs(r - fullR) < .02) && rs[rs.length - 1] <= fullR + .01), 'bigger file -> more dots; full dots one size, last dot no bigger');
    ok(d.every(p => p.r >= 2 - .01 && p.r <= R.max + .01), `every dot radius within the 2 px floor and ${R.max}`);
    await pg.evaluate(() => window.dna.setSizeRange(1, 9));
    const d19 = await dots(pg);
    ok(Math.max(...d19.map(p => p.r)) > Math.max(...d.map(p => p.r)) && Math.min(...d19.map(p => p.r)) < Math.min(...d.map(p => p.r)), 'wider range -> wider spread of sizes');
    ok(inBox(d19), 'range 1-9: still inside the box');

    // Min and max can't cross: hook and sliders.
    const sw = await pg.evaluate(() => window.dna.setSizeRange(7, 3));
    ok(sw.min === 3 && sw.max === 7, 'hook setSizeRange(7, 3) -> 3-7');
    await pg.locator('#minR').fill('8');
    let g = await pg.evaluate(() => window.dna.getSizeRange());
    ok(g.min <= g.max && g.min === 8, 'slider: min pushed to 8 pushes max: ' + JSON.stringify(g));
    await pg.locator('#maxR').fill('2');
    g = await pg.evaluate(() => window.dna.getSizeRange());
    ok(g.min <= g.max && g.max === 2, 'slider: max pulled to 2 pulls min: ' + JSON.stringify(g));
    const out1 = await pg.evaluate(() => [document.querySelector('#minR').nextElementSibling.textContent, document.querySelector('#maxR').nextElementSibling.textContent]);
    ok(out1[0] === out1[1], 'labels follow: ' + out1.join(' / '));
    await pg.evaluate(() => window.dna.setSizeRange(2.5, 6));

    // Topics share a colour; topics stay apart.
    d = await dots(pg);
    const byTopic = new Map(); d.forEach(p => { (byTopic.get(p.topic) || byTopic.set(p.topic, new Set()).get(p.topic)).add(p.color); });
    ok([...byTopic.values()].every(s => s.size === 1), 'same topic -> same colour (' + byTopic.size + ' topics)');
    const cols = [...byTopic.values()].map(s => [...s][0]);
    let gap = 360; for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) gap = Math.min(gap, hueGap(cols[i], cols[j]));
    ok(gap >= 40, `first ${cols.length} topics are >= 40 deg apart (min ${gap.toFixed(0)})`);
    const legend = await pg.$$eval('#topics li', l => l.length);
    ok(legend === byTopic.size, 'legend lists every topic once');
    for (const t of ['music', 'work', 'health']) await pg.evaluate(t => window.dna.addFile({ name: t + '/a.txt', bytes: 5000 }), t);
    await idle(pg);                                     // Update 2: files light one by one, so wait for the queue
    d = await dots(pg);
    const c7 = [...new Set(d.map(p => p.color))];
    let gap7 = 360; for (let i = 0; i < c7.length; i++) for (let j = i + 1; j < c7.length; j++) gap7 = Math.min(gap7, hueGap(c7[i], c7[j]));
    ok(c7.length === 7 && gap7 >= 20, `7 topics -> 7 colours >= 20 deg apart (min ${gap7.toFixed(0)})`);
    ok(inBox(d), 'more files: still inside the box');
    await pg.waitForTimeout(1200);
    await pg.locator('#row').screenshot({ path: `${SHOTS}/${which}-row-7topics.png` });
    for (const t of ['music', 'work', 'health']) await pg.evaluate(t => window.dna.removeFile(t + '/a.txt'), t);

    // Add / remove changes the cluster; others keep their place (only the zoom changes).
    const ang = p => Math.atan2(p.y - 28, p.x - 28);
    const before = await dots(pg), beforeAv = await shot(pg, '[data-role="avatar"]');
    ok(await pg.evaluate(() => window.dna.addFile({ name: 'recipes/new-pie.md', bytes: 80000 })) === true, 'hook add -> true');
    ok(await pg.evaluate(() => window.dna.addFile({ name: 'recipes/new-pie.md', bytes: 80000 })) === false, 'duplicate add -> false');
    let after = await dots(pg);
    ok(after.length === before.length + 1, 'add -> one more dot');
    ok(before.every((p, i) => Math.abs(ang(p) - ang(after[i])) < 1e-2), 'add: other dots keep their direction (zoom, no reshuffle)');
    await pg.evaluate(() => window.dna.removeFile('letters/to-aunt-ida.md'));
    const after2 = await dots(pg);
    ok(after2.length === before.length, 'remove -> one dot fewer');
    await pg.waitForTimeout(1500);
    ok(await shot(pg, '[data-role="avatar"]') !== beforeAv, 'avatar pixels changed');
    // UI path: Add button, then the x
    const n0 = (await pg.evaluate(() => window.dna.getFiles())).length;
    const sug = await pg.inputValue('#fname');
    await pg.click('.go');
    ok((await pg.evaluate(() => window.dna.getFiles())).length === n0 + 1 && (await pg.inputValue('#fname')) !== sug, 'UI Add works on first press and refills a suggestion');
    await pg.click('.files li:first-child .x');
    ok((await pg.evaluate(() => window.dna.getFiles())).length === n0, 'UI x removes the file');
    ok(/Removed/.test(await pg.textContent('#said')), 'status says Removed');

    // Two names, two clusters.
    const names = ['Juniper', 'Maya', 'Otto', 'Bea'];
    const sets = [];
    for (const n of names) { await pg.fill('#agentName', n); sets.push(await dots(pg)); await pg.waitForTimeout(900); await pg.locator('#row').screenshot({ path: `${SHOTS}/${which}-name-${n}.png` }); }
    let least = 1e9;
    for (let i = 0; i < sets.length; i++) for (let j = i + 1; j < sets.length; j++) {
      const m = sets[i].reduce((s, p, k) => s + Math.hypot(p.x - sets[j][k].x, p.y - sets[j][k].y), 0) / sets[i].length;
      least = Math.min(least, m);
    }
    ok(least >= 5, `four names -> four clusters (closest pair: dots ${least.toFixed(1)} px apart on average)`);
    ok(sets.every(inBox), 'every name: inside the box');
    await pg.fill('#agentName', 'Juniper');
    const back = await dots(pg);
    ok(JSON.stringify(back) === JSON.stringify(sets[0]), 'same name -> same cluster again');

    // Motion is on.
    const m1 = await shot(pg, '[data-role="avatar"]'); await pg.waitForTimeout(500);
    ok(m1 !== await shot(pg, '[data-role="avatar"]'), 'normal: the avatar moves');

    // Narrow
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.waitForTimeout(300);
    await pg.screenshot({ path: `${SHOTS}/${which}-narrow.png`, fullPage: true });
    ok(await pg.evaluate(() => document.documentElement.scrollWidth <= 391), 'narrow: no sideways scroll');

    ok(!errs.length, 'normal: console clean ' + errs.join(' | '));
    await ctx.close();
  });

  // 3. Reduced motion
  await block('reduce', async () => {
    const { ctx, pg, errs } = await open({ reducedMotion: 'reduce' });
    ok(await pg.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), 'reduce media query on');
    const a = await shot(pg, '[data-role="avatar"]'); await pg.waitForTimeout(700);
    const b = await shot(pg, '[data-role="avatar"]');
    ok(a === b && a.length > 1000, 'reduce: avatar is still (no drift, no flash) and drawn');
    await pg.click('.go'); await pg.waitForTimeout(100);
    const c = await shot(pg, '[data-role="avatar"]');
    ok(c !== b, 'reduce: a new file shows at once');
    await pg.waitForTimeout(1400);
    const e1 = await shot(pg, '[data-role="avatar"]'); await pg.waitForTimeout(400);
    ok(e1 === await shot(pg, '[data-role="avatar"]'), 'reduce: still again after the 1.2 s light');
    await pg.locator('#row').screenshot({ path: `${SHOTS}/${which}-reduce-row.png` });
    ok(!errs.length, 'reduce: console clean ' + errs.join(' | '));
    await ctx.close();
  });

  // 4. Update 2: pace, 1 dot per MB, density. Short pages (headless Chrome here can drop a tab after ~15 s).
  for (const mode of ['normal', 'reduce']) {
    const R = mode === 'reduce', tag = 'U2 ' + mode + ': ';
    const o = R ? { reducedMotion: 'reduce' } : {};

    // 4a. Count and order.
    await block(tag + 'count', async () => {
      const { ctx, pg, errs } = await open(o);
      const base = await pg.evaluate(() => window.dna.dotCount());
      const L0 = (await pg.evaluate(() => window.dna.litOrder())).length;
      const set = [
        { id: 'twenty', name: 'big/twenty-mb.mov', sizeBytes: 20 * MB }, { id: 'kb300', name: 'docs/small.pdf', sizeBytes: 300 * 1024 },
        { id: 'zero', name: 'docs/empty.txt', sizeBytes: 0 }, { id: 'one', name: 'docs/exactly-1mb.bin', sizeBytes: MB },
        { id: 'onep', name: 'docs/just-over.bin', sizeBytes: MB + 1 }, { id: 'f32', name: 'big/three-point-two.zip', sizeBytes: Math.round(3.2 * MB) }
      ];
      const want = set.map(f => dotsFor(f.sizeBytes));
      ok(await pg.evaluate(s => window.dna.addFiles(s), set) === set.length, tag + 'addFiles queues 6 files');
      const fl = await pg.evaluate(() => window.dna.getFiles());
      ok(set.every((f, i) => fl.find(x => x.id === f.id).dots === want[i]), tag + 'dots per file = max(1, ceil(MB)): 20 MB->20, 300 KB->1, 0 B->1, 1 MB->1, 1 MB+1 B->2, 3.2 MB->4');
      ok(await pg.evaluate(() => window.dna.dotCount()) === base + 29, tag + 'dotCount = sum (' + base + ' + 29)');
      ok(await pg.evaluate(s => window.dna.addFiles([s]), set[0]) === 0 && await pg.evaluate(() => window.dna.dotCount()) === base + 29, tag + 'duplicate id skipped, count unchanged');
      ok(await idle(pg), tag + 'queue goes idle');
      let all = await pg.evaluate(() => window.dna.litOrder()), log = all.slice(L0), runs = runsOf(log);
      ok(log.length === 29 && increasing(all), tag + '29 dots lit, litAt strictly increasing');
      ok(runs.length === set.length && runs.every((r, i) => r.id === set[i].id && r.n === want[i]), tag + 'lit grouped by file, in added order: ' + runs.map(r => r.id + '×' + r.n).join(' '));
      const gaps = runs.slice(1).map((r, i) => r.first - runs[i].last);
      ok(gaps.every(g => g >= 24), tag + 'no two files at the same time (min gap ' + Math.min(...gaps).toFixed(1) + ' ms)');

      // Normal pace for a normal drop of 2 files.
      let L = all.length;
      await pg.evaluate(s => window.dna.addFiles(s), [{ id: 'p3', name: 'pace/three.bin', sizeBytes: 3 * MB }, { id: 'p2', name: 'pace/two.bin', sizeBytes: 2 * MB }]);
      await idle(pg);
      all = await pg.evaluate(() => window.dna.litOrder()); runs = runsOf(all.slice(L));
      const steps = runs.flatMap(r => r.ts.slice(1).map((t, i) => t - r.ts[i])), gap = runs[1].first - runs[0].last;
      if (R) ok(runs.every(r => r.last - r.first < 1) && Math.abs(gap - 250) < 1, tag + `each file in one step (span ${(runs[0].last - runs[0].first).toFixed(3)} ms), 250 ms between files (${gap.toFixed(1)})`);
      else ok(steps.every(s => Math.abs(s - 90) < 1) && Math.abs(gap - 250) < 1, tag + `pace: 90 ms between dots, 250 ms between files (${steps.map(s => s.toFixed(0)).join(',')} / ${gap.toFixed(1)})`);
      facts.push(`${which} ${mode}: 2-file drop steps ${steps.map(s => s.toFixed(2)).join(',')} ms, gap ${gap.toFixed(1)} ms`);

      // A 40 MB file stays inside the 2.5 s cap.
      L = all.length;
      await pg.evaluate(s => window.dna.addFiles(s), [{ id: 'f40', name: 'big/forty.mov', sizeBytes: 40 * MB }]);
      await idle(pg);
      all = await pg.evaluate(() => window.dna.litOrder()); runs = runsOf(all.slice(L));
      const span = runs[0].last - runs[0].first;
      ok(runs.length === 1 && runs[0].n === 40 && (R ? span < 1 : span <= 2500 && span >= 2000), tag + `40 MB -> 40 dots in ${span.toFixed(1)} ms`);
      facts.push(`${which} ${mode}: 40 MB span ${span.toFixed(1)} ms`);

      // A long queue: 15 files, every one lit, in order.
      L = all.length;
      const many = Array.from({ length: 15 }, (_, i) => ({ id: 'q' + i, name: 'queue/f' + i + '.bin', sizeBytes: (1 + i % 3) * MB }));
      await pg.evaluate(s => window.dna.addFiles(s), many);
      await idle(pg);
      all = await pg.evaluate(() => window.dna.litOrder()); runs = runsOf(all.slice(L));
      const tot = runs[runs.length - 1].last - runs[0].first;
      ok(increasing(all) && runs.length === 15 && runs.every((r, i) => r.id === 'q' + i && r.n === 1 + i % 3), tag + `15 files queued: all lit, grouped, in order (${(tot / 1000).toFixed(2)} s)`);
      facts.push(`${which} ${mode}: 15-file queue ${(tot / 1000).toFixed(2)} s`);
      ok(!errs.length, tag + 'count/order console clean ' + errs.join(' | '));
      await ctx.close();
    });

    // 4b. Density at 56 px.
    for (const N of [12, 20, 40, 61, 90]) await block(tag + N, async () => {
      const { ctx, pg, errs } = await open(o);
      await pg.evaluate(() => { for (const f of window.dna.getFiles()) window.dna.removeFile(f.id); });
      const set = [
        { id: 'big', name: 'a/big.bin', sizeBytes: (N - 5) * MB }, { id: 'h', name: 'b/one-and-half.bin', sizeBytes: 1.5 * MB },
        { id: 's', name: 'c/small.pdf', sizeBytes: 300 * 1024 }, { id: 'z', name: 'd/empty.txt', sizeBytes: 0 }, { id: 't', name: 'a/tiny.txt', sizeBytes: 50 * 1024 }
      ];
      await pg.evaluate(s => window.dna.addFiles(s), set);
      await idle(pg);
      await pg.waitForTimeout(R ? 100 : 1600);
      const d = await dots(pg), cnt = await pg.evaluate(() => window.dna.dotCount());
      const minR = Math.min(...d.map(p => p.r));
      let gapMin = 1e9; for (let i = 0; i < d.length; i++) for (let j = i + 1; j < d.length; j++) gapMin = Math.min(gapMin, Math.hypot(d[i].x - d[j].x, d[i].y - d[j].y) - d[i].r - d[j].r);
      const inside = d.every(p => p.x - 1.3 * p.r >= 0 && p.x + 1.3 * p.r <= 56 && p.y - 1.3 * p.r >= 0 && p.y + 1.3 * p.r <= 56);
      const note = await pg.textContent('#note');
      ok(cnt === N && d.length === Math.min(N, 60), tag + `${N} dots: count ${cnt}, ${d.length} placed`);
      ok(gapMin > 0 && minR >= 2 - .005 && inside, tag + `${N} dots: no overlap (closest edge gap ${gapMin.toFixed(2)} px), smallest r ${minR.toFixed(2)} px (>= 2), inside 0-56 with flash`);
      if (N > 60) ok(/Past 60 dots/.test(note), tag + `${N} dots: the glow note shows`);
      else ok(!note, tag + `${N} dots: no glow note`);
      facts.push(`${which} ${mode}: N=${N} placed ${d.length}, r ${minR.toFixed(2)}–${Math.max(...d.map(p => p.r)).toFixed(2)} px, closest gap ${gapMin.toFixed(2)} px`);
      await pg.locator('#row').screenshot({ path: `${SHOTS}/${which}-u2-${mode}-N${N}.png` });
      ok(!errs.length, tag + `${N} dots: console clean ` + errs.join(' | '));
      await ctx.close();
    });
  }

  // 4c. Normal motion, pixels: no full-cluster flash on add, no haze, first beat at 400 ms on open.
  await block('pixels', async () => {
    const { ctx, pg, errs } = await open({}, true);
    const s0 = await drain(pg);
    const first = s0.find(s => s.frac >= .5);
    ok(first && first.t < 1100, `U2 pixels: first beat on open lights the cluster (${first ? first.t.toFixed(0) : '-'} ms after navigation)`);
    const idlePeak = await beatEnd(pg);
    ok(idlePeak >= .8, `U2 pixels: the idle beat lights the whole cluster (${(idlePeak * 100).toFixed(0)} % of dots bright), so the probe sees a flash`);
    const add = [{ id: 'n1', name: 'new/two.bin', sizeBytes: 2 * MB }, { id: 'n2', name: 'new/small.txt', sizeBytes: 300 * 1024 }, { id: 'n3', name: 'notes/three.bin', sizeBytes: 3 * MB }, { id: 'n4', name: 'notes/one.bin', sizeBytes: MB }];
    await pg.evaluate(a => { a.forEach(f => window.__exclude.add(f.id)); window.dna.addFiles(a); }, add);
    await idle(pg);
    await pg.waitForTimeout(1300);                 // the beat rests until 1.5 s after the last dot lands
    const s1 = await drain(pg);
    const arrPeak = Math.max(...s1.map(s => s.frac)), haze = Math.max(...s1.map(s => s.haze));
    ok(arrPeak < .25, `U2 pixels: no full-cluster flash while 4 files arrive (old dots bright at once: max ${(arrPeak * 100).toFixed(0)} %, ${s1.length} frames)`);
    ok(haze < 24, `U2 pixels: no extra glow in empty space while files arrive (max alpha ${haze}/255)`);
    const back = await beatEnd(pg);
    ok(back >= .8, 'U2 pixels: the idle beat comes back after the queue');
    facts.push(`${which} pixels: first beat at ${first ? first.t.toFixed(0) : '-'} ms; idle beat ${(idlePeak * 100).toFixed(0)} %; arrivals ${(arrPeak * 100).toFixed(0)} %; haze ${haze}`);
    ok(!errs.length, 'U2 pixels: console clean ' + errs.join(' | '));
    await ctx.close();
  });

  // 4d. Normal motion, pixels: hover/focus do not flash; rename gives the first beat at 400 ms.
  await block('rename', async () => {
    const { ctx, pg, errs } = await open({}, true);
    await beatEnd(pg);
    await pg.hover('#row'); await pg.focus('#agentName');
    await pg.waitForTimeout(800);
    const hv = Math.max(...(await drain(pg)).map(s => s.frac));
    ok(hv < .25, `U2 pixels: hover and focus on the row do not flash the cluster (max ${(hv * 100).toFixed(0)} %)`);
    await beatEnd(pg);
    const t0 = await pg.evaluate(() => { const e = document.querySelector('#agentName'); e.value = 'Maya'; e.dispatchEvent(new Event('input')); return performance.now(); });
    await pg.waitForTimeout(1200);
    const s = (await drain(pg)).filter(x => x.t > t0), f = s.find(x => x.frac >= .5);
    const dt = f ? f.t - t0 : -1;
    ok(f && dt >= 350 && dt <= 800, `U2 pixels: rename -> first beat lights the cluster ${dt.toFixed(0)} ms later (beat at 400 ms + 120 ms rise)`);
    facts.push(`${which} pixels: hover ${(hv * 100).toFixed(0)} %; rename beat ${dt.toFixed(0)} ms`);
    ok(!errs.length, 'U2 rename: console clean ' + errs.join(' | '));
    await ctx.close();
  });

  console.log(which + '\n' + out.join('\n'));
  console.log('\nfacts\n' + facts.join('\n'));
  console.log(`\n${out.filter(l => l.startsWith('ok')).length}/${out.length} passed`);
  await br.close();
  process.exit(out.some(l => l.startsWith('FAIL')) ? 1 : 0);
})();
