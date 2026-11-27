/* firefly-orbit.js: the tree. A waiting ring of 30 dim fireflies around an empty middle.
 *
 *   import { createOrbit } from '/firefly-orbit.js';
 *   const orbit = createOrbit({ canvas, text, reduced, epoch });   // epoch: wall ms the call from home ended
 *   orbit.start();                          // its own requestAnimationFrame loop
 *   orbit.pointer(x, y) / orbit.pointer(null)   // the lean (hover on the middle)
 *   orbit.focus(true|false)                 // keyboard focus on the middle: the same lean
 *   orbit.hold(true)                        // Finder is open: the lean holds; hold(false) lets go slowly
 *   orbit.stir() / calm() / endStir()       // a drag over the window, a drop with nothing in it, a drag-leave
 *   const hand = orbit.release()            // the signal: the 30 live fireflies are handed to the field
 *   orbit.restore()                         // a failed save: the ring comes back at rest (600 ms)
 *
 * One flow (Reports/one-flow-magic-moment.md §4, §5, §7): the home's call flies into the ring slots
 * (firefly-gather.js uses ringPos with the same epoch), so the ring here simply goes on. Nothing in
 * the ring changes by itself: no fade-in after a call, no hint, no speed-up. Only a gift changes it.
 * Rules kept: every drawn radius is clamp(r, MIN_R, MAX_R); under Reduce Motion nothing moves,
 * only brightness changes, and the canvas is drawn only when something changes.
 */

import { MIN_R, MAX_R, flash } from './fireflies-dna.js';

export const FLY = '#D8F26A';
export const TEXT_PEAK = .36;     // "Select Folder" while leaning (hover, focus, Finder open)
export const TEXT_REST = .24;     // and at rest: without the word the ring reads as a spinner
export const WAKE = .8;           // the signal's brightness
export const WAKE_MS = 120;
export const LOOSEN = .06;        // the ring opens 6% at the signal
export const RINGS = [            // count, radius (x U), own speed range (deg/s)
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

/* The 30 fireflies, fixed from one seed so every visit (and every check) sees the same ring. */
export function makeFlies() {
  const r = rng(hash('firefly-orbit')), u = (a, b) => a + (b - a) * r();
  const out = [];
  RINGS.forEach((ring, ri) => {
    for (let i = 0; i < ring.n; i++) {
      const first = ri === 0 && i === 0;
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
        h: 0,
      });
    }
  });
  return out;
}

/* Where fly f is on the ring, pure. tt: ms since the epoch (negative during the call); phase: the
   turned time in s (tt / 1000 while the ring turns at its own speed). Also the unit tangent (the way
   it is moving) and its speed in px/ms. The call aims here, so it lands already moving with the ring. */
export function ringPos(f, tt, W, H, { phase = tt / 1000, loosen = 0, reduced = false } = {}) {
  const U = Math.min(W, H), cx = W / 2, cy = H / 2;
  const ang = reduced ? f.angle : f.angle + f.omega * phase;
  let dist = f.R * U;
  if (!reduced) dist += 3 * Math.sin(tt / f.breathP * TAU + f.breathPh);
  dist *= 1 + loosen;
  let x = cx + Math.cos(ang) * dist, y = cy + Math.sin(ang) * dist;
  if (!reduced) { x += Math.sin(tt / 8000 * TAU + f.seedA) * 1.5; y += Math.cos(tt / 8000 * TAU + f.seedB) * 1.5; }
  return { x, y, tx: -Math.sin(ang), ty: Math.cos(ang), v: reduced ? 0 : f.omega * dist / 1000 };
}

/* ---------- the sprite (DNA's gradient, unchanged); the call draws with the same one ---------- */
export function dnaSprite(doc, hex = FLY) {
  const n = parseInt(hex.slice(1), 16), R = n >> 16, G = (n >> 8) & 255, B = n & 255, rgb = `${R},${G},${B}`;
  const core = `rgb(${R + (255 - R) * .7 | 0},${G + (255 - G) * .7 | 0},${B + (255 - B) * .7 | 0})`;
  const s = doc.createElement('canvas'); s.width = s.height = 128; const g = s.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, core); gr.addColorStop(.18, `rgba(${rgb},.9)`); gr.addColorStop(.42, `rgba(${rgb},.28)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return s;
}

/* ---------- the orbit ---------- */
export function createOrbit({ canvas, text = null, reduced = false, epoch = null, now = () => performance.now(), wall = () => Date.now(), size } = {}) {
  const win = globalThis, doc = canvas.ownerDocument || win.document;
  const ctx = canvas.getContext('2d');
  const sprite = dnaSprite(doc, FLY);
  const flies = makeFlies();
  const view = () => size ? size() : { W: win.innerWidth, H: win.innerHeight };
  const t0 = now();
  const called = epoch != null && Number.isFinite(+epoch);
  const E = called ? t0 - (wall() - +epoch) : t0;          // the epoch on this page's clock
  const S = {
    state: 'rest', reduced: !!reduced, last: null, phase: (t0 - E) / 1000,
    ptr: null, focused: false, held: false, leaning: false, nearSet: new Set(), nearKey: '', slowRelease: false,
    text: null, textNow: 0,
    stirTw: null, stirLast: -1e9, stirring: false, m: 1,
    fade: called || reduced ? null : tween(0, 1, 600, outQuad, t0),    // only a direct visit fades in; a call is already there
    raf: 0, lastSig: '', lastFrame: null,
  };
  const tauIn = 120, tauOut = 200, tauSlow = 300;

  function geometry() {
    const { W, H } = view(); const U = Math.min(W, H);
    return { W, H, U, cx: W / 2, cy: H / 2, hitR: hitRadius(U) };
  }
  function setText(to, ms, curve, t) {
    if (S.text && S.text.to === to) return;
    S.text = tween(valueOf(S.text, t), to, ms, curve, t);
  }
  /* Whether the middle is leaning in: pointer inside hitR (out past hitR + 12), focus, or held for Finder. */
  function updateLean(t, slow) {
    if (S.state !== 'rest') return;
    const g = geometry();
    let inside = false;
    if (S.ptr) { const d = Math.hypot(S.ptr.x - g.cx, S.ptr.y - g.cy); inside = S.leaning ? d <= g.hitR + 12 : d < g.hitR; }
    S.leaning = inside || S.focused || S.held;
    if (S.stirring) setText(0, 600, inQuad, t);
    else if (S.leaning) setText(TEXT_PEAK, 360, outQuad, t);
    else setText(TEXT_REST, slow ? 900 : 300, outQuad, t);
    S.slowRelease = !S.leaning && slow;
  }

  /* Where every firefly is drawn at time t, and how bright. */
  function frame(t, dtMs) {
    const g = geometry(), RM = S.reduced, tt = t - E;
    if (S.stirring && t - S.stirLast > 150) { S.stirring = false; S.stirTw = tween(valueOf(S.stirTw, t), 0, 400, inQuad, t); updateLean(t); }
    const s = valueOf(S.stirTw, t);
    S.m = RM ? 1 : 1 + .6 * s;
    S.phase += S.m * Math.min(50, Math.max(0, dtMs)) / 1000;     // a hidden window pauses, then goes on from the same angles
    const fade = S.fade ? valueOf(S.fade, t) : 1;
    const lean = S.leaning;
    const target = S.ptr && !S.focused ? S.ptr : { x: g.cx, y: g.cy };
    for (const f of flies) { const p = ringPos(f, tt, g.W, g.H, { phase: S.phase, reduced: RM }); f._x = p.x; f._y = p.y; }
    const key = RM ? `${target.x | 0},${target.y | 0},${lean}` : null;
    if (!RM || key !== S.nearKey) {
      S.nearKey = key;
      S.nearSet = new Set(lean ? [...flies].sort((a, b) => Math.hypot(a._x - target.x, a._y - target.y) - Math.hypot(b._x - target.x, b._y - target.y)).slice(0, 5) : []);
    }
    const out = [];
    for (const f of flies) {
      const want = S.nearSet.has(f) ? 1 : 0;
      const tau = want > f.h ? tauIn : (S.slowRelease ? tauSlow : tauOut);
      f.h += (want - f.h) * (1 - Math.exp(-dtMs / tau));
      if (Math.abs(want - f.h) < .002) f.h = want;
      // twinkle: each on its own beat, never under Reduce Motion
      let b = 0;
      if (!RM) {
        const beat = Math.floor(tt / f.beatP + f.beatPh);
        if (beat !== f.lastBeat) { if (f.lastBeat != null) f.beatAt = t; f.lastBeat = beat; }
        b = f.beatAt == null ? 0 : flash(t - f.beatAt);
      }
      const h = f.h;
      const a = Math.min(.95, f.a0 + .30 * b + .30 * h + .15 * s) * fade;
      const r = RM ? f.r0 : f.r0 * (1 + .12 * Math.max(b, h));
      let x = f._x, y = f._y;
      if (!RM && h > 0) { const dx = g.cx - x, dy = g.cy - y, d = Math.hypot(dx, dy) || 1; x += dx / d * 6 * h; y += dy / d * 6 * h; }
      out.push({ x, y, r: clampR(r), a: clamp01(a) });
    }
    return { g, out, s, tt };
  }

  function paint(fr) {
    const { W, H } = fr.g, dpr = Math.min(2, win.devicePixelRatio || 1);
    const pw = Math.round(W * dpr), ph = Math.round(H * dpr);
    if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; if (canvas.style) { canvas.style.width = W + 'px'; canvas.style.height = H + 'px'; } }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const d of fr.out) { if (d.a <= 0) continue; ctx.globalAlpha = d.a; ctx.drawImage(sprite, d.x - d.r, d.y - d.r, 2 * d.r, 2 * d.r); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  function clear() { const { W, H } = geometry(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, Math.max(canvas.width, W), Math.max(canvas.height, H)); }

  function step(t) {
    if (S.state !== 'rest') return S.lastFrame;
    const dtMs = S.last == null ? 16 : t - S.last; S.last = t;
    const fr = frame(t, dtMs);
    S.textNow = valueOf(S.text, t);
    if (text && text.style) text.style.opacity = String(Math.round(S.textNow * 1000) / 1000);
    S.lastFrame = fr;
    // Under Reduce Motion, draw only when something changes.
    const sig = S.reduced ? fr.out.map(d => d.a.toFixed(3)).join() + fr.g.W + 'x' + fr.g.H : null;
    if (!S.reduced || sig !== S.lastSig) { S.lastSig = sig; paint(fr); }
    return fr;
  }

  function loop() { S.raf = 0; const t = now(); step(t); if (S.state === 'rest') S.raf = win.requestAnimationFrame(loop); }

  /* The signal. The 30 live fireflies are handed over in this very call: from now on the field draws
     them, the orbit draws nothing. at(i, t) is where fly i would be if it kept circling at its own slow
     speed, woken (alpha -> WAKE over 120 ms) and loosened (+6%): the field flies it out from there. */
  function release() {
    if (S.state !== 'rest') return null;
    const t = now(), RM = S.reduced;
    const fr = S.lastFrame || frame(t, 0);
    S.state = 'released';
    if (S.raf) win.cancelAnimationFrame(S.raf); S.raf = 0;
    S.text = tween(valueOf(S.text, t), 0, 160, inQuad, t);
    const fadeOut = () => { const k = clamp01((now() - t) / 160); if (text && text.style) text.style.opacity = String(Math.round(S.textNow * (1 - inQuad(k)) * 1000) / 1000); if (k < 1 && S.state === 'released') win.requestAnimationFrame(fadeOut); };
    if (text && text.style) win.requestAnimationFrame(fadeOut);
    clear();
    const phase0 = S.phase, from = fr.out.map(d => ({ ...d }));
    const live = flies.map((f, i) => ({ i, ring: f.ring, r0: f.r0, a0: from[i].a, r: from[i].r }));
    return {
      t, reduced: RM, flies: live,
      /* where live fly i is at time t2 (page clock) while it is still in the ring */
      at(i, t2) {
        const f = flies[i], g = geometry(), k = outQuad(clamp01((t2 - t) / WAKE_MS));
        const p = ringPos(f, t2 - E, g.W, g.H, { phase: phase0 + (RM ? 0 : (t2 - t) / 1000), loosen: LOOSEN * k * (RM ? 0 : 1), reduced: RM });
        const dx = RM ? 0 : from[i].x - ringPos(f, t - E, g.W, g.H, { phase: phase0, reduced: RM }).x;
        const dy = RM ? 0 : from[i].y - ringPos(f, t - E, g.W, g.H, { phase: phase0, reduced: RM }).y;
        const lean = 1 - k;                                           // a lean (pushed toward the middle) lets go as they wake
        return { x: p.x + dx * lean, y: p.y + dy * lean, tx: p.tx, ty: p.ty, v: p.v, r: from[i].r, a: from[i].a + (WAKE - from[i].a) * k };
      },
    };
  }

  /* A failed save: the ring fades back in at rest, as if nothing was given. */
  function restore() {
    if (S.state === 'rest') return;
    const t = now();
    Object.assign(S, { state: 'rest', last: null, stirring: false, stirTw: null, leaning: false, held: false, lastSig: '', fade: tween(0, 1, 600, outQuad, t) });
    for (const f of flies) f.h = 0;
    S.text = null; setText(TEXT_REST, 600, outQuad, t);
    if (!S.raf) S.raf = win.requestAnimationFrame(loop);
  }

  setText(TEXT_REST, 300, outQuad, t0);

  const api = {
    start() { if (!S.raf && S.state === 'rest') S.raf = win.requestAnimationFrame(loop); return api; },
    stop() { if (S.raf) win.cancelAnimationFrame(S.raf); S.raf = 0; },
    step,
    setReduced(v) { S.reduced = !!v; S.lastSig = ''; },
    pointer(x, y) { S.ptr = x == null ? null : { x, y }; updateLean(now()); },
    focus(on) { S.focused = !!on; updateLean(now()); },
    hold(on) { const was = S.held; S.held = !!on; updateLean(now(), was && !on); },
    stir() {
      if (S.state !== 'rest') return;
      const t = now(); S.stirLast = t;
      if (!S.stirring) { S.stirring = true; S.stirTw = tween(valueOf(S.stirTw, t), 1, 240, outQuad, t); updateLean(t); }
    },
    /* A drop that brought no real file: the stir lets go over 900 ms. */
    calm() { if (S.state !== 'rest') return; const t = now(); S.stirring = false; S.stirTw = tween(valueOf(S.stirTw, t), 0, 900, inQuad, t); updateLean(t); },
    endStir() { if (!S.stirring) return; const t = now(); S.stirring = false; S.stirTw = tween(valueOf(S.stirTw, t), 0, 400, inQuad, t); updateLean(t); },
    busy() { return S.state !== 'rest'; },
    release, restore,
    info() {
      const fr = S.lastFrame || frame(now(), 0);
      return {
        state: S.state, m: Math.round(S.m * 1000) / 1000, epoch: called,
        flies: S.state !== 'rest' ? [] : fr.out.map(d => ({ x: Math.round(d.x * 10) / 10, y: Math.round(d.y * 10) / 10, r: Math.round(d.r * 100) / 100, a: Math.round(d.a * 1000) / 1000 })),
        textOpacity: Math.round(S.textNow * 1000) / 1000,
      };
    },
  };
  return api;
}
