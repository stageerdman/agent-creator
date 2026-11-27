/* firefly-orbit.js: the + build screen. A waiting ring of dim fireflies around an empty middle.
 *
 *   import { createOrbit } from '/firefly-orbit.js';
 *   const orbit = createOrbit({ canvas, text, logo, reduced, call });
 *   orbit.start();                          // its own requestAnimationFrame loop
 *   orbit.pointer(x, y) / orbit.pointer(null)   // the lean (hover on the middle)
 *   orbit.focus(true|false)                 // keyboard focus on the middle: the same lean
 *   orbit.hold(true)                        // Finder is open: the lean holds; hold(false) lets go slowly
 *   orbit.stir()                            // every dragover; it ends 150 ms after the last one
 *   orbit.calm()                            // a drop with no real file: the stir lets go over 900 ms
 *   orbit.answer(work)                      // work: Promise -> { name, dna } (the new agent) or rejects
 *
 * Motion and numbers: updates/2026-11-27 FIREFLIES-BUILD/02-merlin-motion.md (§ numbers below).
 * Rules kept: every drawn radius is clamp(r, MIN_R, MAX_R); under Reduce Motion nothing moves,
 * only brightness changes, and the canvas is drawn only when something changes.
 */

import { MIN_R, MAX_R, flash, createDna } from './fireflies-dna.js';

export const FLY = '#D8F26A';
export const TEXT_PEAK = .36;
export const RINGS = [            // §3: count, radius (x U), own speed range (deg/s)
  { n: 7, R: .14, w: [6.0, 9.0] },
  { n: 10, R: .23, w: [4.5, 6.5] },
  { n: 13, R: .33, w: [3.0, 4.5] },
];
const TAU = Math.PI * 2, DEG = Math.PI / 180;

/* ---------- small maths ---------- */
export function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rng(seed) { return () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const outQuad = x => 1 - (1 - x) * (1 - x);
export const inQuad = x => x * x;
export const inOutQuad = x => x < .5 ? 2 * x * x : 1 - 2 * (1 - x) * (1 - x);
export const clampR = r => Math.min(MAX_R, Math.max(MIN_R, r));
const clamp01 = x => Math.min(1, Math.max(0, x));
export const hitRadius = U => Math.max(56, .10 * U);

/* A timed move from one value to another; value(t) is pure. */
function tween(from, to, ms, curve, at) { return { from, to, ms, curve, at }; }
function valueOf(tw, t) { if (!tw) return 0; const k = tw.ms <= 0 ? 1 : clamp01((t - tw.at) / tw.ms); return tw.from + (tw.to - tw.from) * tw.curve(k); }
const doneAt = (tw, t) => !tw || t >= tw.at + tw.ms;

/* The 30 fireflies, fixed from one seed so every visit (and every check) sees the same ring. */
export function makeFlies() {
  const r = rng(hash('firefly-orbit')), u = (a, b) => a + (b - a) * r();
  const out = [];
  RINGS.forEach((ring, ri) => {
    for (let i = 0; i < ring.n; i++) {
      const first = ri === 0 && i === 0;          // A0: straight up, right under the fading call light
      const step = TAU / ring.n;
      out.push({
        ring: ri,
        angle: -Math.PI / 2 + i * step + (first ? 0 : (r() * 2 - 1) * .35 * step),
        R: ring.R + (r() * 2 - 1) * .015,
        omega: u(ring.w[0], ring.w[1]) * DEG,
        breathP: u(7000, 11000), breathPh: r() * TAU,
        seedA: r() * TAU, seedB: r() * TAU,
        r0: u(2.5, 4.4), a0: u(.30, .42),
        beatP: u(5000, 9000), beatPh: r(),
        h: 0, beatAt: -1e9,
      });
    }
  });
  return out;
}

/* ---------- sprites (DNA's gradient, copied unchanged; the call keeps its own 64 px one) ---------- */
function dnaSprite(doc, hex) {
  const n = parseInt(hex.slice(1), 16), R = n >> 16, G = (n >> 8) & 255, B = n & 255, rgb = `${R},${G},${B}`;
  const core = `rgb(${R + (255 - R) * .7 | 0},${G + (255 - G) * .7 | 0},${B + (255 - B) * .7 | 0})`;
  const s = doc.createElement('canvas'); s.width = s.height = 128; const g = s.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, core); gr.addColorStop(.18, `rgba(${rgb},.9)`); gr.addColorStop(.42, `rgba(${rgb},.28)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return s;
}
function callSprite(doc) {
  const s = doc.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(246,255,214,1)'); gr.addColorStop(.12, 'rgba(216,242,106,.85)'); gr.addColorStop(.32, 'rgba(216,242,106,.25)'); gr.addColorStop(1, 'rgba(216,242,106,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return s;
}

/* ---------- the orbit ---------- */
export function createOrbit({ canvas, text = null, logo = null, reduced = false, call = false, now = () => performance.now(), size } = {}) {
  const win = globalThis, doc = canvas.ownerDocument || win.document;
  const ctx = canvas.getContext('2d');
  const sprite = dnaSprite(doc, FLY), callImg = call ? callSprite(doc) : null;
  const flies = makeFlies();
  const view = () => size ? size() : { W: win.innerWidth, H: win.innerHeight };
  const S = {
    state: 'rest', reduced: !!reduced, t0: now(), last: null,
    ptr: null, focused: false, held: false, leaning: false, nearSet: new Set(), nearKey: '',
    text: null, textNow: 0,                     // the "Select Folder" opacity tween
    stirTw: null, stirLast: -1e9, stirring: false,
    m: 1, mTw: null, glowTw: null, ringOut: null,
    answerAt: 0, workAt: null, failed: false, gatherAt: null, dna: null, logoAt: null, noticed: false, lastSig: '',
    raf: 0, frames: [],
  };
  const tauIn = 120, tauOut = 200, tauSlow = 300;

  function geometry() {
    const { W, H } = view(); const U = Math.min(W, H);
    return { W, H, U, cx: W / 2, cy: H / 2, hitR: hitRadius(U) };
  }
  function setText(to, ms, curve, t) {
    const from = valueOf(S.text, t) || S.textNow;
    if (S.text && S.text.to === to) return;
    S.text = tween(from, to, ms, curve, t);
  }
  /* Whether the middle is leaning in: pointer inside hitR (out past hitR + 12), focus, or held for Finder. */
  function updateLean(t, slow) {
    if (S.state === 'answer' || S.state === 'first-light') return;
    const g = geometry();
    let inside = S.leaning;
    if (S.ptr) { const d = Math.hypot(S.ptr.x - g.cx, S.ptr.y - g.cy); inside = S.leaning ? d <= g.hitR + 12 : d < g.hitR; }
    else inside = false;
    const lean = inside || S.focused || S.held;
    if (lean !== S.leaning) S.leaning = lean;
    const showText = lean && !S.stirring;
    if (showText) setText(TEXT_PEAK, 360, outQuad, t);
    else setText(0, slow ? 900 : 600, inQuad, t);
    S.slowRelease = !lean && slow;
  }

  /* Where every firefly is drawn at time t, and how bright. Pure apart from easing each h and the angles. */
  function frame(t, dtMs) {
    const g = geometry(), RM = S.reduced, dt = Math.min(50, Math.max(0, dtMs)) / 1000;
    const arrive = RM ? 1 : outQuad(clamp01((t - S.t0) / 600));
    // stir level, speed and the answer's glow
    if (S.stirring && t - S.stirLast > 150) { S.stirring = false; S.stirTw = tween(valueOf(S.stirTw, t), 0, 400, inQuad, t); updateLean(t); }
    const s = valueOf(S.stirTw, t);
    if (S.mTw) S.m = valueOf(S.mTw, t); else S.m = 1 + .6 * s;
    const m = RM ? 1 : S.m;
    const G = valueOf(S.glowTw, t);
    // the gather (answer, non-RM) or the in-place fade (answer, RM)
    let k = 0, fade = 1;
    if (S.gatherAt != null && !RM) k = clamp01((t - S.gatherAt) / 500);
    if (S.ringOut) fade = 1 - valueOf(S.ringOut, t);
    // nearest 5 to the pointer (or to C under focus/hold), picked again every frame (fixed under RM while the pointer is still)
    const lean = S.leaning && S.state !== 'answer' && S.state !== 'first-light';
    const target = S.ptr && !S.focused ? S.ptr : { x: g.cx, y: g.cy };
    const out = [];
    for (const f of flies) {
      if (!RM && S.state !== 'first-light') f.angle += f.omega * m * dt;
      let dist = f.R * g.U;
      if (!RM) dist += 3 * Math.sin(t / f.breathP * TAU + f.breathPh);
      dist *= 1 - inQuad(k);
      let x = g.cx + Math.cos(f.angle) * dist, y = g.cy + Math.sin(f.angle) * dist;
      if (!RM) { x += Math.sin(t / 8000 * TAU + f.seedA) * 1.5; y += Math.cos(t / 8000 * TAU + f.seedB) * 1.5; }
      f._x = x; f._y = y;
    }
    const key = RM ? `${target.x | 0},${target.y | 0},${lean}` : null;
    if (!RM || key !== S.nearKey) {
      S.nearKey = key;
      S.nearSet = new Set(lean ? [...flies].sort((a, b) => Math.hypot(a._x - target.x, a._y - target.y) - Math.hypot(b._x - target.x, b._y - target.y)).slice(0, 5) : []);
    }
    let moving = false;
    for (const f of flies) {
      const want = S.nearSet.has(f) ? 1 : 0;
      const tau = want > f.h ? tauIn : (S.slowRelease ? tauSlow : tauOut);
      const before = f.h;
      f.h += (want - f.h) * (1 - Math.exp(-dtMs / tau));
      if (Math.abs(want - f.h) < .002) f.h = want;
      if (f.h !== before) moving = true;
      // twinkle: own beat, never under RM, stopped by the answer
      let b = 0;
      if (!RM && G === 0) {
        const beat = Math.floor((t / f.beatP) + f.beatPh);
        if (beat !== f.lastBeat) { if (f.lastBeat != null) f.beatAt = t; f.lastBeat = beat; }
        b = flash(t - f.beatAt);
      }
      const h = f.h;
      let a = Math.min(.95, f.a0 + .30 * b + .30 * h + .15 * s);
      let r = RM ? f.r0 : f.r0 * (1 + .12 * Math.max(b, h));
      a = a + (1 - a) * G;
      if (!RM) r = r + (f.r0 * 1.3 - r) * G;
      if (k > .5) a *= 1 - inQuad((k - .5) / .5);
      a *= arrive * fade;
      let x = f._x, y = f._y;
      if (!RM && h > 0 && k === 0) { const dx = g.cx - x, dy = g.cy - y, d = Math.hypot(dx, dy) || 1; x += dx / d * 6 * h; y += dy / d * 6 * h; }
      out.push({ x, y, r: clampR(r), a: clamp01(a) });
    }
    // the call from home, with its own numbers (falls 900 ms, fades 600 ms)
    let callDot = null;
    if (callImg) {
      const dc = t - S.t0;
      if (dc < 1500) {
        let cb, ca;
        if (dc < 900) { const q = dc / 900; cb = 1 - q * q; ca = .14 + .8 * cb; }
        else { const q = Math.min(1, (dc - 900) / 600); cb = 0; ca = .14 * (1 - q * q); }
        callDot = { x: g.cx, y: g.H * .36, s: 18 + 12 * cb, a: ca };
      }
    }
    return { g, out, callDot, moving, s, G, k };
  }

  function paint(fr) {
    const { W, H } = fr.g, dpr = Math.min(2, win.devicePixelRatio || 1);
    const pw = Math.round(W * dpr), ph = Math.round(H * dpr);
    if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; if (canvas.style) { canvas.style.width = W + 'px'; canvas.style.height = H + 'px'; } }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    if (S.state !== 'first-light') for (const d of fr.out) { if (d.a <= 0) continue; ctx.globalAlpha = d.a; ctx.drawImage(sprite, d.x - d.r, d.y - d.r, 2 * d.r, 2 * d.r); }
    if (fr.callDot) { ctx.globalAlpha = fr.callDot.a; ctx.drawImage(callImg, fr.callDot.x - fr.callDot.s / 2, fr.callDot.y - fr.callDot.s / 2, fr.callDot.s, fr.callDot.s); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }

  /* The answer's later steps, once the work is back: gather (or fade), first light, notice, rest. */
  function answerSteps(t) {
    if (S.state !== 'answer') return;
    if (S.failed) {   // §7: a failed save settles back over 900 ms
      S.failed = false; S.state = 'settle';
      S.glowTw = tween(valueOf(S.glowTw, t), 0, 900, inQuad, t);
      S.mTw = tween(S.m, 1, 900, inQuad, t);
      S.settleEnd = t + 900;
      return;
    }
    if (S.workAt == null) return;                   // hold: full glow, m = 6, until the save is back
    const RM = S.reduced;
    if (S.gatherAt == null) {
      S.gatherAt = Math.max(S.answerAt + (RM ? 600 : 800), S.workAt);
      if (RM) S.ringOut = tween(0, 1, 400, inQuad, S.gatherAt);
      S.logoAt = S.gatherAt + (RM ? 200 : 300);
    }
    if (logo && S.dna && t >= S.logoAt) {
      if (!S.logoObj) S.logoObj = createDna(logo, { name: S.dna.name, files: S.dna.files });
      const o = RM ? clamp01((t - S.logoAt) / 300) : outQuad(clamp01((t - S.logoAt) / 400));
      if (logo.style) logo.style.opacity = String(o);
    }
    if (!RM && !S.noticed && S.logoObj && t >= S.gatherAt + 500) { S.noticed = true; S.logoObj.notice(false); }
    if (t >= S.gatherAt + (RM ? 500 : 700)) { S.state = 'first-light'; if (logo && logo.style) logo.style.opacity = '1'; }
  }

  function step(t) {
    const dtMs = S.last == null ? 16 : t - S.last; S.last = t;
    answerSteps(t);
    if (S.state === 'settle' && t >= S.settleEnd) { S.state = 'rest'; S.glowTw = null; S.mTw = null; updateLean(t); }
    if (S.state === 'rest' || S.state === 'lean' || S.state === 'stir') S.state = S.stirring ? 'stir' : (S.leaning ? 'lean' : 'rest');
    const fr = frame(t, dtMs);
    S.textNow = valueOf(S.text, t);
    if (text && text.style) text.style.opacity = String(Math.round(S.textNow * 1000) / 1000);
    S.lastFrame = fr;
    // Under Reduce Motion, draw only when a state changes.
    const sig = S.reduced ? fr.out.map(d => d.a.toFixed(3)).join() + fr.g.W + 'x' + fr.g.H + S.state : null;
    if (!S.reduced || sig !== S.lastSig) { S.lastSig = sig; paint(fr); }
    let dt = Math.min(.05, dtMs / 1000);
    if (S.logoObj) S.logoObj.draw(t, dt, S.reduced);
    return fr;
  }

  function loop() { const t = now(); step(t); S.raf = win.requestAnimationFrame(loop); }

  const api = {
    start() { if (!S.raf) S.raf = win.requestAnimationFrame(loop); return api; },
    stop() { if (S.raf) win.cancelAnimationFrame(S.raf); S.raf = 0; },
    step,
    setReduced(v) { S.reduced = !!v; S.lastSig = ''; },
    pointer(x, y) { S.ptr = x == null ? null : { x, y }; updateLean(now()); },
    focus(on) { S.focused = !!on; updateLean(now()); },
    hold(on) { const was = S.held; S.held = !!on; updateLean(now(), was && !on); },
    stir() {
      if (S.state === 'answer' || S.state === 'first-light') return;
      const t = now(); S.stirLast = t;
      if (!S.stirring) { S.stirring = true; S.stirTw = tween(valueOf(S.stirTw, t), 1, 240, outQuad, t); updateLean(t); }
    },
    /* A drop that brought no real file: the stir lets go over 900 ms. */
    calm() {
      if (S.state === 'answer' || S.state === 'first-light') return;
      const t = now(); S.stirring = false; S.stirTw = tween(valueOf(S.stirTw, t), 0, 900, inQuad, t); updateLean(t);
    },
    endStir() {   // a native drag-leave: the stir ends at once (with its normal 400 ms fade)
      if (!S.stirring) return; const t = now(); S.stirring = false; S.stirTw = tween(valueOf(S.stirTw, t), 0, 400, inQuad, t); updateLean(t);
    },
    busy() { return S.state === 'answer' || S.state === 'first-light'; },
    /* The answer. work resolves to { name, files } for the new agent's logo, or rejects (a failed save). */
    answer(work) {
      if (api.busy()) return false;
      const t = now();
      Object.assign(S, { state: 'answer', answerAt: t, workAt: null, failed: false, gatherAt: null, ringOut: null, noticed: false, dna: null });
      S.stirring = false; S.leaning = false; S.held = false;
      S.glowTw = tween(0, 1, 200, outQuad, t);
      S.mTw = tween(S.m, S.reduced ? 1 : 6, 500, inOutQuad, t);
      S.text = tween(S.textNow, 0, 160, inQuad, t);
      S.lastSig = '';
      Promise.resolve(work).then(dna => { S.dna = dna || { name: '', files: [] }; S.workAt = now(); }, () => { S.failed = true; });
      return true;
    },
    info() {
      const fr = S.lastFrame || frame(now(), 0);
      return {
        state: S.state, m: Math.round((S.reduced ? 1 : S.m) * 1000) / 1000,
        flies: S.state === 'first-light' ? [] : fr.out.map(d => ({ x: Math.round(d.x * 10) / 10, y: Math.round(d.y * 10) / 10, r: Math.round(d.r * 100) / 100, a: Math.round(d.a * 1000) / 1000 })),
        textOpacity: Math.round(S.textNow * 1000) / 1000,
      };
    },
  };
  return api;
}

/* ---------- what a pick or a drop brought: [{ path, size }] ---------- */

/* Hidden files and dot-folders (.DS_Store, .git) are left out (Columbo Q4). */
export const isHidden = path => String(path).split('/').some(part => part.startsWith('.'));
const clean = p => String(p || '').replace(/^\/+/, '');

/* A folder pick: <input webkitdirectory> files. Paths start with the chosen folder's own name. */
export function entriesOfFiles(files) {
  const out = [];
  for (const f of files || []) {
    const path = clean(f.webkitRelativePath || f.name);
    if (path && !isHidden(path)) out.push({ path, size: +f.size || 0 });
  }
  return out;
}

/* A drop: read folders through webkitGetAsEntry, in batches, without blocking a frame. */
/* onFirst() fires once, at the first real file found, so the answer never waits for a giant folder. */
export async function entriesOfDrop(dataTransfer, onFirst = () => {}) {
  const items = [...(dataTransfer && dataTransfer.items || [])].filter(i => i.kind === 'file');
  const roots = items.map(i => (i.webkitGetAsEntry ? i.webkitGetAsEntry() : null));
  // Taken now, while the drop is live: a top-level file whose entry can't be read (WebKit, a file with no disk path) still counts.
  const loose = items.map(i => (i.getAsFile ? i.getAsFile() : null));
  const out = [];
  let told = false;
  // onFirst always runs after this call has returned its promise, even for loose files found at once.
  const push = e => { if (!e.path || isHidden(e.path)) return; out.push(e); if (!told) { told = true; queueMicrotask(onFirst); } };
  const fileOf = entry => new Promise(res => entry.file(res, () => res(null)));
  const readAll = dir => new Promise(res => {
    const reader = dir.createReader(), all = [];
    const more = () => reader.readEntries(batch => { if (!batch.length) return res(all); all.push(...batch); more(); }, () => res(all));
    more();
  });
  async function walk(entry, fallback = null) {
    if (!entry || entry.name.startsWith('.')) return;
    if (entry.isFile) { const f = (await fileOf(entry)) || fallback; if (f) push({ path: clean(entry.fullPath || entry.name), size: +f.size || 0 }); return; }
    if (entry.isDirectory) for (const child of await readAll(entry)) await walk(child);
  }
  if (roots.some(Boolean)) { for (let k = 0; k < roots.length; k++) await walk(roots[k], loose[k]); }
  else entriesOfFiles(dataTransfer && dataTransfer.files).forEach(push);   // no entry API: loose files only
  return out;
}
