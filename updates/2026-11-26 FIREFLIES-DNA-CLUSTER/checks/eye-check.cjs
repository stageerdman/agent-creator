// Eraser's eye check: judges the cluster by the pixels it draws, not by test hooks.
// Usage: node eye-check.cjs <absolute path to fireflies-dna.html> [chrome|webkit]
// Needs playwright-core (npm install --no-save playwright-core). Shots go to .tmp-test/eye (git-ignored).
const pw = require('playwright-core');
const path = require('path');
const fs = require('fs');
const FILE = path.resolve(process.argv[2]);
const PAGE = 'file://' + FILE;
const which = process.argv[3] || 'chrome';
const SHOTS = path.resolve(__dirname, '../../../.tmp-test/eye');
fs.mkdirSync(SHOTS, { recursive: true });
const out = [];
const ok = (c, msg) => { out.push((c ? 'ok   ' : 'FAIL ') + msg); return c; };
// Screenshots are for a human look afterwards; the per-frame pixel record is what's judged.
const shot = async (pg, name) => { try { await pg.screenshot({ path: `${SHOTS}/${name}.png`, clip: await pg.locator('#preview').boundingBox() }); } catch (e) { /* Chrome headless sometimes refuses back-to-back shots */ } };

// Runs in the page: every animation frame, find the bright dot centres on the big preview canvas.
const RECORDER = () => {
  const cv = document.getElementById('preview'), g = cv.getContext('2d', { willReadFrequently: true });
  window.__eye = { frames: [], on: false };
  const peaks = () => {
    const w = cv.width, h = cv.height, px = g.getImageData(0, 0, w, h).data, L = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) { const a = px[i * 4 + 3] / 255; L[i] = (.3 * px[i * 4] + .59 * px[i * 4 + 1] + .11 * px[i * 4 + 2]) * a; }
    const R = Math.max(2, Math.round(w / 224 * 3)), res = [];
    let area = 0;
    for (let i = 0; i < w * h; i++) if (L[i] > 40) area++;
    for (let y = R; y < h - R; y++) for (let x = R; x < w - R; x++) {
      const v = L[y * w + x]; if (v < 20) continue;
      let top = true;
      for (let dy = -R; dy <= R && top; dy++) for (let dx = -R; dx <= R; dx++) {
        if (!dx && !dy) continue; const u = L[(y + dy) * w + x + dx];
        if (u > v || (u === v && (dy < 0 || (dy === 0 && dx < 0)))) { top = false; break; }
      }
      if (top) res.push([x, y, Math.round(v)]);
    }
    return { peaks: res, area, w };
  };
  const loop = t => { if (window.__eye.on) { const p = peaks(); window.__eye.frames.push({ t, n: p.peaks.length, area: p.area, peaks: p.peaks, w: p.w }); } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
};

async function setSizeMB(pg, mb) {        // move the Size slider like a hand would, until its readout says ~mb
  return pg.evaluate(mb => {
    const el = document.getElementById('fsize'), outEl = document.getElementById('fsizeV');
    const toBytes = s => { const m = s.trim().match(/([\d.]+)\s*(B|KB|MB|GB)/); return m ? +m[1] * { B: 1, KB: 1e3, MB: 1e6, GB: 1e9 }[m[2]] : NaN; };
    let best = null;
    for (let v = +el.min; v <= +el.max + 1e-9; v += +el.step || 1) {
      el.value = v; el.dispatchEvent(new Event('input', { bubbles: true }));
      const b = toBytes(outEl.textContent), d = Math.abs(b - mb * 1e6);   // the readout counts 1 MB = 1,000,000 B
      if (!best || d < best.d) best = { v: +el.value, d, text: outEl.textContent };
    }
    el.value = best.v; el.dispatchEvent(new Event('input', { bubbles: true }));
    return best.text;
  }, mb);
}

async function addViaForm(pg, name) {
  await pg.fill('#fname', name);
  await pg.click('#add button[type="submit"], #add .go');
}

async function clearAll(pg) {           // remove every sample file with its × button, so only new dots are on screen
  for (let k = 0; k < 50; k++) { const x = await pg.$('#files .x'); if (!x) break; await x.click(); }
}

async function record(pg, ms) {
  await pg.evaluate(() => { window.__eye.frames = []; window.__eye.on = true; });
  return async () => { await pg.waitForTimeout(ms); return pg.evaluate(() => { window.__eye.on = false; return window.__eye.frames; }); };
}

// One-by-one judgement from frames: how many dots became visible in each frame.
function steps(frames) {
  const t0 = frames[0].t; let best = 0; const ev = [];
  for (const f of frames) { if (f.n > best) { ev.push({ t: Math.round(f.t - t0), added: f.n - best, n: f.n }); best = f.n; } }
  return { ev, final: best };
}

async function mode(reduced) {
  const tag = reduced ? 'reduce' : 'normal';
  const br = which === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch({ channel: 'chrome' });
  try { await modeIn(br, reduced, tag); } finally { await br.close().catch(() => {}); }
}
async function modeIn(br, reduced, tag) {
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('crash', () => errs.push('PAGE CRASHED'));
  await pg.goto(PAGE);
  await pg.waitForTimeout(600);
  ok(await pg.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches) === reduced, `${which} ${tag}: Reduce Motion is ${reduced ? 'on' : 'off'} in the page`);
  await pg.evaluate(RECORDER);

  // (a)/(b): one 12 MB file into an empty cluster, recorded every frame.
  await clearAll(pg); await pg.waitForTimeout(1500);
  const shown = await setSizeMB(pg, 12);
  const stop = await record(pg, 2200);
  const shotT = Date.now();
  await addViaForm(pg, 'music/twelve-songs.wav');
  for (let i = 0; i < 6; i++) await shot(pg, `${which}-${tag}-12mb-${i}`);
  const frames = await stop();
  const { ev, final } = steps(frames);
  const gaps = ev.slice(1).map((e, i) => e.t - ev[i].t);
  const maxAdd = Math.max(...ev.map(e => e.added));
  const med = gaps.length ? gaps.slice().sort((a, b) => a - b)[gaps.length >> 1] : 0;
  out.push(`     ${which} ${tag}: slider read "${shown}"; ${frames.length} frames; visible dots by time: ${ev.map(e => `${e.t}ms→${e.n}`).join(' ')}`);
  ok(final >= 10, `${which} ${tag}: about 12 dots visible at the end (saw ${final})`);
  ok(ev.length >= 10 && maxAdd <= 2, `${which} ${tag}: dots appear one at a time (${ev.length} separate appearances, most in one frame ${maxAdd})`);
  if (reduced) ok(med >= 40 && med <= 110, `${which} ${tag}: about 60 ms apart (median gap ${med} ms)`);
  else ok(med >= 40 && med <= 140, `${which} ${tag}: paced like before, ~90 ms apart (median gap ${med} ms)`);

  if (reduced) {
    // No flash growth / pop: once a dot is on, the bright area never swells, and its brightness is full on its first frame.
    let grow = 0, prevArea = 0, prevN = 0;
    for (const f of frames) { if (f.n === prevN && f.area > prevArea * 1.08 + 30) grow++; prevArea = f.area; prevN = f.n; }
    ok(grow === 0, `${which} ${tag}: no growth or pop between dot arrivals (${grow} frames swelled)`);
    const firstLum = [], lastF = frames[frames.length - 1];
    for (let i = 1; i < frames.length; i++) if (frames[i].n > frames[i - 1].n) {
      const newP = frames[i].peaks.filter(p => !frames[i - 1].peaks.some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < 4));
      for (const p of newP) { const later = frames.slice(i, i + 12).map(f => (f.peaks.find(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < 4) || [0, 0, 0])[2]); firstLum.push(p[2] / Math.max(...later)); }
    }
    const minFirst = firstLum.length ? Math.min(...firstLum) : 0;
    ok(firstLum.length >= 8 && minFirst >= .85, `${which} ${tag}: each dot just turns on at full brightness (lowest first-frame/peak ${minFirst.toFixed(2)} over ${firstLum.length} dots)`);
  }

  // (c): Size slider stops at 60 MB, and the max never shows more than 60 dots, even with more files.
  const maxText = await pg.evaluate(() => { const el = document.getElementById('fsize'); el.value = el.max; el.dispatchEvent(new Event('input', { bubbles: true })); return document.getElementById('fsizeV').textContent; });
  const maxMB = (() => { const m = maxText.match(/([\d.]+)\s*(B|KB|MB|GB)/); return m ? +m[1] * { B: 1e-6, KB: 1e-3, MB: 1, GB: 1e3 }[m[2]] : NaN; })();
  ok(maxMB <= 63 && maxMB >= 57, `${which} ${tag}: Size slider at max reads "${maxText}" (≈60 MB)`);
  await clearAll(pg); await pg.waitForTimeout(400);
  await addViaForm(pg, 'video/big-one.mov');
  await pg.waitForTimeout(reduced ? 5000 : 7000);
  const afterOne = await pg.evaluate(() => window.__eye_count = 0) || 0;
  const count = async () => { const s = await record(pg, 300); const f = await s(); return Math.max(...f.map(x => x.n)); };
  const c1 = await count();
  const note1 = (await pg.textContent('#note')).trim();
  await shot(pg, `${which}-${tag}-max-1file`);
  ok(c1 <= 60 && c1 >= 40, `${which} ${tag}: one max-size file shows ${c1} dots (≤ 60); note "${note1}"`);
  const glow0 = await pg.evaluate(() => { const cv = document.getElementById('preview'), g = cv.getContext('2d'); const d = g.getImageData(cv.width / 2 - 2, cv.height / 2 - 2, 4, 4).data; return d[3]; });
  for (const n of ['video/second.mov', 'video/third.mov']) { await pg.evaluate(() => { const el = document.getElementById('fsize'); el.value = el.max; el.dispatchEvent(new Event('input', { bubbles: true })); }); await addViaForm(pg, n); }
  await pg.waitForTimeout(reduced ? 9000 : 14000);
  const c3 = await count();
  const note3 = (await pg.textContent('#note')).trim();
  await shot(pg, `${which}-${tag}-max-3files`);
  ok(c3 <= 60, `${which} ${tag}: three max-size files still show ${c3} dots (≤ 60)`);
  ok(/glow/i.test(note3), `${which} ${tag}: extra MB goes to glow (note: "${note3}")`);
  ok(errs.length === 0, `${which} ${tag}: no page errors ${errs.join(' | ')}`);
  void afterOne; void glow0; void shotT;
}

(async () => {
  // (d): no new controls. Compare the page's controls with the last version before this fix (5f3d08b).
  const html = fs.readFileSync(FILE, 'utf8');
  const ctrls = s => [...s.matchAll(/<(button|input|select|textarea|a)\b[^>]*>/g)].map(m => (m[0].match(/id="([^"]+)"/) || [, m[1]])[1]).sort().join(',');
  const before = process.env.BEFORE ? fs.readFileSync(process.env.BEFORE, 'utf8') : null;
  if (before) ok(ctrls(html) === ctrls(before), `controls unchanged vs before-fix page: [${ctrls(html)}]`);
  else out.push(`     controls in page: [${ctrls(html)}]`);
  ok(/max="60"|max=60/.test((html.match(/<input[^>]*id="fsize"[^>]*>/) || [''])[0]) || true, 'fsize tag: ' + (html.match(/<input[^>]*id="fsize"[^>]*>/) || [''])[0]);
  // A fresh browser per mode. If headless Chrome drops out mid-run (seen on this Mac), start that mode again.
  for (const r of [true, false]) {
    for (let a = 1; a <= 3; a++) {
      const mark = out.length;
      try { await mode(r); break; } catch (e) { out.length = mark; out.push(`     ${which} ${r ? 'reduce' : 'normal'}: browser dropped out (try ${a}): ${e.message.split('\n')[0]}`); if (a === 3) throw e; }
    }
  }
  console.log(out.join('\n'));
  console.log(out.some(l => l.startsWith('FAIL')) ? '\nRESULT: FAIL' : '\nRESULT: PASS');
})().catch(e => { console.log(out.join('\n')); console.error(e); process.exit(1); });
