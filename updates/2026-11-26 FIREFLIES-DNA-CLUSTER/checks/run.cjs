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

// 1. Static: no map, replay or timeline left in the code.
(() => {
  const html = fs.readFileSync(FILE, 'utf8');
  const bad = html.match(/replay|timeline|scrub|\bsky\b|#play|history|embedding|big map|data-ev|\bspeed\b|\bchain\b/gi) || [];
  ok(!bad.length, 'code: no map / replay / timeline leftovers ' + bad.join(','));
  ok(!/hidden/.test(html.replace(/overflow:\s*hidden|aria-hidden/g, '')), 'code: no hidden "maybe later" markup');
})();

(async () => {
  const br = which === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch({ channel: 'chrome' });
  const open = async (opts = {}) => {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, ...opts });
    const pg = await ctx.newPage();
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

  // 2. Normal motion
  {
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

    // One dot per file, inside the avatar box (with the 30 % flash growth), compact.
    let d = await dots(pg);
    ok(d.length === files0.length, 'one dot per file');
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
    const pair = files0.map((f, i) => [f.bytes, d[i].r]).sort((a, b) => a[0] - b[0]);
    ok(pair.every((p, i) => !i || p[1] > pair[i - 1][1] || p[0] === pair[i - 1][0]), 'bigger file -> bigger dot');
    ok(pair.every(p => p[1] >= R.min - .01 && p[1] <= R.max + .01), `every dot radius within ${R.min}-${R.max}`);
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
  }

  // 3. Reduced motion
  {
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
  }

  console.log(which + '\n' + out.join('\n'));
  await br.close();
  process.exit(out.some(l => l.startsWith('FAIL')) ? 1 : 0);
})();
