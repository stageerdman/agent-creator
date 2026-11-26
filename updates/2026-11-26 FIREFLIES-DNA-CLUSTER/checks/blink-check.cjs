// Eraser's blink check: does each file blink on its own beat, as the eye sees it?
// Judged on the brightness of the whole #preview canvas, every animation frame. Hooks are only cross-checked.
// Usage: node blink-check.cjs <absolute path to fireflies-dna.html> [chrome|webkit]
// Needs playwright-core (npm install --no-save playwright-core). One browser at a time.
const pw = require('playwright-core');
const path = require('path');
const PAGE = 'file://' + path.resolve(process.argv[2]);
const which = process.argv[3] || 'chrome';
const out = [];
const ok = (c, msg) => { out.push((c ? 'ok   ' : 'FAIL ') + msg); return c; };
const note = msg => out.push('     ' + msg);

// In the page: every frame, the summed brightness of #preview, the number of bright dot centres,
// and (for the cross-check only) each file's latest blink from the hook.
const RECORDER = () => {
  const cv = document.getElementById('preview'), g = cv.getContext('2d', { willReadFrequently: true });
  window.__blink = { frames: [], on: false };
  const look = () => {
    const w = cv.width, h = cv.height, px = g.getImageData(0, 0, w, h).data, L = new Float32Array(w * h);
    let sum = 0;
    for (let i = 0; i < w * h; i++) { L[i] = (.3 * px[i * 4] + .59 * px[i * 4 + 1] + .11 * px[i * 4 + 2]) * px[i * 4 + 3] / 255; sum += L[i]; }
    const R = Math.max(2, Math.round(w / 224 * 3)); let n = 0;
    for (let y = R; y < h - R; y++) for (let x = R; x < w - R; x++) {
      const v = L[y * w + x]; if (v < 20) continue; let top = true;
      for (let dy = -R; dy <= R && top; dy++) for (let dx = -R; dx <= R; dx++) {
        if (!dx && !dy) continue; const u = L[(y + dy) * w + x + dx];
        if (u > v || (u === v && (dy < 0 || (dy === 0 && dx < 0)))) { top = false; break; }
      }
      if (top) n++;
    }
    return { sum, n };
  };
  const loop = t => {
    if (window.__blink.on) { const p = look(); window.__blink.frames.push({ t, sum: p.sum, n: p.n, hook: dna.getFiles().map(f => [f.name, f.lastBlink]) }); }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

// Sharp rises: brightness climbs more than 25 % of the window's range within 150 ms.
// The rise's time is the frame before its steepest step (where the flash starts; a flash's attack is
// steepest at its start, and the darkest frame can lag when it rides on another file's fading tail).
function rises(frames, from, to, range) {
  const res = []; let lastAt = -1e9;
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i]; if (f.t < from || f.t > to) continue;
    let lo = i; for (let j = i; j >= 0 && f.t - frames[j].t <= 150; j--) if (frames[j].sum < frames[lo].sum) lo = j;
    if (f.sum - frames[lo].sum > .25 * range && f.t - lastAt > 400) {
      let k = lo + 1; for (let m = lo + 1; m <= i; m++) if (frames[m].sum - frames[m - 1].sum > frames[k].sum - frames[k - 1].sum) k = m;
      res.push(frames[k - 1].t); lastAt = f.t;
    }
  }
  return res;
}
// The moment the eye sees all `want` dots on screen (first frame with that many dot centres).
const landedAt = (frames, want) => { const f = frames.find(f => f.n >= want); return f ? f.t : NaN; };
const rangeOf = (frames, from, to) => { const s = frames.filter(f => f.t >= from && f.t <= to).map(f => f.sum); return Math.max(...s) - Math.min(...s); };
const hookBlinks = frames => { const m = {}; for (const f of frames) for (const [name, b] of f.hook) if (b != null) (m[name] = m[name] || new Set()).add(b); return Object.fromEntries(Object.entries(m).map(([k, v]) => [k, [...v]])); };
const r0 = v => Math.round(v);

// The page's own rule, to say what the gap should be for this agent's period.
const YEAR_S = 365 * 86400;
const step = ms => { const s = ms / 1000; return .2 * Math.min(1, s) + .6 * Math.min(1, Math.log(1 + s) / Math.log(1 + YEAR_S)); };

async function withPage(reduced, fn) {
  for (let a = 1; a <= 3; a++) {
    const br = which === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch({ channel: 'chrome' });
    const mark = out.length;
    try {
      const ctx = await br.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
      const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
      await pg.goto(PAGE); await pg.waitForTimeout(600);
      for (let k = 0; k < 50; k++) { const x = await pg.$('#files .x'); if (!x) break; await x.click().catch(() => {}); }   // remove the samples like a hand would
      await pg.waitForTimeout(1500);
      await pg.evaluate(RECORDER);
      await fn(pg);
      ok(errs.length === 0, `${which}: no page errors ${errs.join(' | ')}`);
      return;
    } catch (e) {
      out.length = mark; note(`${which}: browser dropped out (try ${a}): ${e.message.split('\n')[0]}`); if (a === 3) throw e;
    } finally { await br.close().catch(() => {}); }
  }
}

const on = pg => pg.evaluate(() => { window.__blink.frames = []; window.__blink.on = true; return performance.now(); });
const off = pg => pg.evaluate(() => { window.__blink.on = false; return window.__blink.frames; });
const now = pg => pg.evaluate(() => performance.now());

// Two files a.txt then b.txt; how = 'sec' (added 1 s apart), 'day' (b's addedAt = a + 1 day), 'same' (one moment).
async function pair(pg, how, tag, reduced) {
  const T = await pg.evaluate(() => Date.now());
  const t0 = await on(pg);
  let tB;
  if (how === 'same') { await pg.evaluate(T => dna.addFiles([{ name: 'alpha/a.txt', sizeBytes: 3e6, addedAt: T }, { name: 'beta/b.txt', sizeBytes: 3e6, addedAt: T }]), T); tB = await now(pg); }
  else {
    if (how === 'sec') await pg.evaluate(() => dna.addFile({ name: 'alpha/a.txt', bytes: 3e6 }));
    else await pg.evaluate(T => dna.addFiles([{ name: 'alpha/a.txt', sizeBytes: 3e6, addedAt: T }]), T);
    await pg.waitForTimeout(1000);
    if (how === 'sec') await pg.evaluate(() => dna.addFile({ name: 'beta/b.txt', bytes: 3e6 }));
    else await pg.evaluate(T => dna.addFiles([{ name: 'beta/b.txt', sizeBytes: 3e6, addedAt: T + 86400e3 }]), T);
    tB = await now(pg);
  }
  await pg.waitForTimeout(3500 + 7000);
  const frames = await off(pg);
  const info = await pg.evaluate(() => ({ period: dna.blinkPeriod(), files: dna.getFiles() }));
  const from = tB + 3500, to = tB + 10500;
  const range = rangeOf(frames, from, to);
  const rs = rises(frames, from, to, range);
  const gaps = rs.slice(1).map((t, i) => r0(t - rs[i]));
  const hb = hookBlinks(frames);
  const allHook = Object.values(hb).flat().sort((a, b) => a - b);
  const match = rs.map(t => Math.min(...allHook.map(h => Math.abs(h - t))));
  const [fa, fb] = [info.files.find(f => f.name === 'alpha/a.txt'), info.files.find(f => f.name === 'beta/b.txt')];
  const dph = Math.abs(fb.blinkPhase - fa.blinkPhase);
  note(`${tag}: period ${info.period} ms; phases a=${fa.blinkPhase} b=${fb.blinkPhase}; addedAt gap ${fb.addedAt - fa.addedAt} ms; ${frames.length} frames`);
  note(`${tag}: canvas range ${r0(range)}; rises at ${rs.map(t => r0(t - from)).join(', ')} ms; gaps ${gaps.join(', ')}`);
  if (reduced) {
    ok(rs.length === 0 && range < .02 * Math.max(...frames.map(f => f.sum)), `${tag}: Reduce Motion → no blink on canvas (${rs.length} rises, range ${(100 * range / Math.max(...frames.map(f => f.sum))).toFixed(2)} % of brightness)`);
    ok(allHook.length === 0, `${tag}: Reduce Motion → hook shows no blink either (${allHook.length})`);
    return;
  }
  ok(match.length && Math.max(...match) <= 50, `${tag}: every canvas rise is a hook blink within 50 ms (worst ${r0(Math.max(...match))} ms)`);
  if (how === 'same') {
    ok(dph === 0, `${tag}: same moment → same phase`);
    const same = (hb['alpha/a.txt'] || []).filter(t => (hb['beta/b.txt'] || []).includes(t)).length;
    ok(same >= 2 && same === (hb['alpha/a.txt'] || []).length, `${tag}: a and b blink in the same frame (${same} of ${(hb['alpha/a.txt'] || []).length} beats)`);
    ok(rs.length >= 2 && gaps.every(g => Math.abs(g - info.period) <= 60), `${tag}: canvas shows one rise per beat, ${info.period} ms apart (gaps ${gaps.join(', ')})`);
    return;
  }
  const want = r0(Math.min(dph, 1 - dph) * info.period);
  const exp = how === 'sec' ? 634 : 1150;
  const short = gaps.length ? Math.min(...gaps) : NaN;
  ok(rs.length >= 4, `${tag}: two blinks per beat on canvas (${rs.length} rises in 7 s)`);
  ok(Math.abs(short - want) <= 50 && Math.abs(short - exp) <= 60, `${tag}: pairs ${short} ms apart (rule says ${want}, brief says ~${exp})`);
  const other = gaps.filter(g => Math.abs(g - short) > 60);
  ok(other.every(g => Math.abs(g - (info.period - short)) <= 60), `${tag}: the other gap is the rest of the beat (${other.join(', ')} ≈ ${info.period - short})`);
  if (how === 'sec') ok(Math.abs(step(fb.addedAt - fa.addedAt) - dph) < .01 || Math.abs(1 - step(fb.addedAt - fa.addedAt) - dph) < .01, `${tag}: hook phase gap ${dph.toFixed(3)} fits the log-squash rule (${step(fb.addedAt - fa.addedAt).toFixed(3)})`);
  // (c) on the pair: no file blinks before its landing + 1.5 s. Landing end = last frame a dot appeared.
  const landEnd = landedAt(frames, fa.dots + fb.dots); void t0;
  const firstHook = { a: Math.min(...(hb['alpha/a.txt'] || [Infinity])), b: Math.min(...(hb['beta/b.txt'] || [Infinity])) };
  ok(firstHook.b - landEnd >= 1450, `${tag}: b's first blink ${r0(firstHook.b - landEnd)} ms after its last dot landed (≥ 1500)`);
}

// (c) on pixels: one 20-dot file. While it lands and for 1.5 s after, no sharp rise; then it blinks.
async function landing(pg, tag) {
  const t0 = await on(pg);
  await pg.evaluate(() => dna.addFile({ name: 'land/twenty.bin', bytes: 20e6 }));
  await pg.waitForTimeout(9000);
  const frames = await off(pg);
  const want = (await pg.evaluate(() => dna.getFiles()))[0].dots;
  const landEnd = landedAt(frames, want);
  const range = rangeOf(frames, landEnd + 1500, frames[frames.length - 1].t);
  const rs = rises(frames, t0, frames[frames.length - 1].t, range);
  const early = rs.filter(t => t < landEnd + 1450);
  const hb = Object.values(hookBlinks(frames)).flat();
  note(`${tag}: ${Math.max(...frames.map(f => f.n))} dots, last landed at ${r0(landEnd - t0)} ms; rises at ${rs.map(t => r0(t - t0)).join(', ')} ms`);
  ok(early.length === 0, `${tag}: no blink while landing or in the 1.5 s after (${early.length} early rises)`);
  ok(rs.length >= 1 && rs[0] - landEnd >= 1450, `${tag}: first blink ${r0(rs[0] - landEnd)} ms after the last dot landed`);
  ok(hb.length && Math.min(...hb) - landEnd >= 1450, `${tag}: hook agrees (${r0(Math.min(...hb) - landEnd)} ms)`);
}

(async () => {
  for (const [how, label] of [['sec', '1 s apart'], ['day', '1 day apart'], ['same', 'same moment']])
    await withPage(false, pg => pair(pg, how, `${which} ${label}`, false));
  await withPage(false, pg => landing(pg, `${which} landing`));
  await withPage(true, pg => pair(pg, 'sec', `${which} reduce, 1 s apart`, true));
  console.log(out.join('\n'));
  console.log(out.some(l => l.startsWith('FAIL')) ? '\nRESULT: FAIL' : '\nRESULT: PASS');
})().catch(e => { console.log(out.join('\n')); console.error(e); process.exit(1); });
