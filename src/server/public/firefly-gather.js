/* firefly-gather.js: the + is a call; the home's light gathers into the waiting ring.
 *
 *   import { gatherToRing, isGathering } from '/firefly-gather.js';
 *   const { epoch } = await gatherToRing(rootEl, plusEl);          // D = 1000 ms
 *   sessionStorage['glade.call'] = JSON.stringify({ epoch, t: Date.now() });
 *   location.href = '/new';
 *
 * Meaning (Reports/one-flow-magic-moment.md §4): the call spreads outward from the plus, each part
 * of the page it reaches turns into fireflies, and they swirl into the 30 slots of the ring that
 * /new shows. 30 of them become the ring's flies; the rest merge into the nearest one. Nothing goes
 * into the plus, and the plus does not glow.
 *
 * Rules this module keeps:
 * - It never blocks navigation. Any error resolves at once ({ epoch: null }), and a timer resolves
 *   it even if animation frames stop (hidden tab).
 * - One run at a time. A call while one is running returns the same promise.
 * - Reduced motion: a plain fade of 160 ms, no fireflies; /new shows the ring at rest.
 * - Its own full-screen canvas, kept after the run and still drawing the ring until the page goes,
 *   so no frame shows neither. The faded UI and the ring are undone when the page comes back from
 *   the back/forward cache.
 * - The ring is drawn with firefly-orbit.js's own flies, places and sprite.
 */

import { makeFlies, ringPos, dnaSprite, clampR, inOutQuad } from './firefly-orbit.js';

export const MAX_FLIES = 400;
const REDUCED_FADE_MS = 160;

let running = null;          // the promise of the current run
let active = false;
let restoreHooked = false;
const leftFaded = [];        // animations to cancel if the page is shown again

export function isGathering() { return active; }

/* ---------- small maths (copied from glade-fireflies.html) ---------- */
const easeOut = x => 1 - (1 - x) * (1 - x);
const easeInOut = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
/* The real firefly flash: rise 120 ms ease-out, fall 900 ms ease-in. */
function flash(dt) { if (dt < 0 || dt > 1020) return 0; if (dt < 120) return easeOut(dt / 120); const x = (dt - 120) / 900; return 1 - x * x; }

let sprites = null;
function sprite(doc, rgb, core) {
  const s = doc.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, core); gr.addColorStop(.12, `rgba(${rgb},.85)`); gr.addColorStop(.32, `rgba(${rgb},.25)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return s;
}
function getSprites(doc) {
  if (!sprites) sprites = {
    FLY: sprite(doc, '216,242,106', 'rgba(246,255,214,1)'),
    WARM: sprite(doc, '196,232,96', 'rgba(236,250,190,1)'),
  };
  return sprites;
}

function prefersReduced() {
  try { return !!globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

/* ---------- where the fireflies come from ---------- */

function visibleRect(r, vw, vh) {
  const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top);
  const x1 = Math.min(vw, r.right), y1 = Math.min(vh, r.bottom);
  if (x1 - x0 < 2 || y1 - y0 < 2) return null;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function isShown(win, el) {
  const cs = win.getComputedStyle ? win.getComputedStyle(el) : null;
  if (!cs) return true;
  return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) !== 0;
}

function textRects(doc, el) {
  try {
    const range = doc.createRange(); range.selectNodeContents(el);
    const list = Array.from(range.getClientRects()); range.detach && range.detach();
    if (list.length) return list;
  } catch { /* fall back to the element box */ }
  return [el.getBoundingClientRect()];
}

/* Leaf parts of the page that a person sees: text, constellation canvases,
 * the search field, icons. Each becomes a weighted box to sample from. */
function collectBoxes(rootEl, doc, win, vw, vh) {
  const boxes = [];
  const all = rootEl.querySelectorAll('*');
  for (let i = 0; i < all.length && boxes.length < 800; i++) {
    const el = all[i], tag = String(el.tagName || '').toLowerCase();
    const media = tag === 'canvas' || tag === 'svg' || tag === 'img' || tag === 'input' || tag === 'textarea';
    if (!media && el.children && el.children.length) continue;
    if (tag === 'path' || tag === 'circle' || tag === 'line') continue;   // svg parts: the svg itself counts
    const r0 = el.getBoundingClientRect();
    const r = visibleRect(r0, vw, vh); if (!r) continue;
    if (!isShown(win, el)) continue;
    if (tag === 'canvas') {
      // A full-screen backdrop canvas is not a part; callers pass its lights as options.points.
      if (r.w * r.h > vw * vh * .4) continue;
      boxes.push({ kind: 'glow', r, w: r.w * r.h * 1.4 });
    } else if (tag === 'input' || tag === 'textarea') {
      boxes.push({ kind: 'edge', r, w: (r.w + r.h) * 2 * 7 });
      if (el.value) boxes.push({ kind: 'line', r: { x: r.x + 14, y: r.y + r.h * .3, w: Math.min(r.w - 28, el.value.length * 8), h: r.h * .4 }, w: el.value.length * 60 });
    } else if (tag === 'svg' || tag === 'img') {
      boxes.push({ kind: 'glow', r, w: r.w * r.h });
    } else if ((el.textContent || '').trim()) {
      for (const lr of textRects(doc, el)) {
        const v = visibleRect(lr, vw, vh); if (!v) continue;
        // keep to the ink: the middle of the line box, not its leading
        boxes.push({ kind: 'line', r: { x: v.x, y: v.y + v.h * .22, w: v.w, h: v.h * .56 }, w: v.w * v.h });
      }
    }
  }
  return boxes;
}

function pointIn(b, rand) {
  const r = b.r;
  if (b.kind === 'edge') {        // along the rounded outline of a field
    const per = 2 * (r.w + r.h); let d = rand() * per;
    if (d < r.w) return [r.x + d, r.y];
    d -= r.w; if (d < r.h) return [r.x + r.w, r.y + d];
    d -= r.h; if (d < r.w) return [r.x + r.w - d, r.y + r.h];
    d -= r.w; return [r.x, r.y + r.h - d];
  }
  if (b.kind === 'glow') {        // a soft disc, denser in the middle, like a cluster
    const a = rand() * 6.283, k = Math.sqrt(rand()) * .45;
    return [r.x + r.w / 2 + Math.cos(a) * r.w * k, r.y + r.h / 2 + Math.sin(a) * r.h * k];
  }
  return [r.x + rand() * r.w, r.y + rand() * r.h];
}

/* Points to spawn fireflies at, in client coordinates, at most `max`. */
export function samplePoints(rootEl, opts = {}) {
  const win = globalThis, doc = globalThis.document;
  const max = Math.max(0, Math.floor(opts.max ?? MAX_FLIES));
  const vw = opts.vw ?? win.innerWidth, vh = opts.vh ?? win.innerHeight;
  const rand = opts.rand || Math.random;
  const extra = (opts.points || []).filter(p => p && p.x >= 0 && p.y >= 0 && p.x <= vw && p.y <= vh).map(p => [p.x, p.y]);
  const boxes = collectBoxes(rootEl, doc, win, vw, vh);
  const total = boxes.reduce((s, b) => s + b.w, 0);
  // about one firefly per 170 px² of ink, never so few it looks thin
  const want = clamp(Math.round(total / 170), boxes.length ? 60 : 0, max);
  const out = extra.slice(0, Math.floor(max / 2));
  const goal = Math.min(max, out.length + want);
  if (total > 0) {
    // every part gets at least one, the rest by weight
    const cum = []; let s = 0; for (const b of boxes) { s += b.w; cum.push(s); }
    for (let i = 0; i < boxes.length && out.length < goal; i++) out.push(pointIn(boxes[i], rand));
    while (out.length < goal) {
      const x = rand() * total; let lo = 0, hi = cum.length - 1;
      while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < x) lo = m + 1; else hi = m; }
      out.push(pointIn(boxes[lo], rand));
    }
  }
  return out.slice(0, max);
}

/* ---------- the run ---------- */

function centreOf(el, vw, vh) {
  try { const r = el.getBoundingClientRect(); if (r.width || r.height) return [r.left + r.width / 2, r.top + r.height / 2]; } catch { /* below */ }
  return [vw / 2, vh - 48];
}

function fadeOut(el, ms, delay) {
  if (!el) return null;
  if (typeof el.animate === 'function') {
    const a = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, delay, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
    leftFaded.push(a); return a;
  }
  el.style.transition = `opacity ${ms}ms ${delay}ms ease-in`; el.style.opacity = '0';
  leftFaded.push({ cancel() { el.style.opacity = ''; el.style.transition = ''; } });
  return null;
}

let kept = null;             // the ring canvas left standing after a run, until the page goes

/* Back to the home (the back/forward cache): the UI exactly as it was, no ring over it. */
export function restoreHome() {
  while (leftFaded.length) { try { leftFaded.pop().cancel(); } catch { /* ignore */ } }
  if (kept) { try { kept.stop(); } catch { /* ignore */ } kept = null; }
}

function hookRestore(win) {
  if (restoreHooked || typeof win.addEventListener !== 'function') return;
  restoreHooked = true;
  win.addEventListener('pageshow', e => { if (e.persisted) restoreHome(); });
  win.addEventListener('pagehide', () => { if (kept) kept.pause(); });
}

/* The + is a call: the home's light flies into the 30 slots of the ring that /new shows.
 * Resolves { epoch }: the wall-clock ms at which the ring stands (t = D). /new's orbit takes that
 * epoch, so its first frame is this run's last: same flies, same places, same sprite, same light.
 * The canvas is not removed at the end; it keeps drawing the ring until the page goes. */
export function gatherToRing(rootEl, plusEl, options = {}) {
  if (running) return running;
  active = true;
  const run = new Promise(resolve => {
    let done = false, canvas = null, raf = 0, safety = 0, epoch = null;
    const win = globalThis;
    const stopFrames = () => { try { if (raf && win.cancelAnimationFrame) win.cancelAnimationFrame(raf); } catch { /* ignore */ } raf = 0; };
    const drop = () => { stopFrames(); try { canvas && canvas.remove(); } catch { /* ignore */ } canvas = null; };
    const finish = ok => {
      if (done) return; done = true;
      clearTimeout(safety);
      if (!ok || !canvas) { drop(); epoch = ok ? epoch : null; }
      active = false; running = null; resolve({ epoch });
    };
    try {
      const D = Math.max(0, Number(options.durationMs ?? 1000) || 0);
      const reduced = options.reducedMotion ?? prefersReduced();
      const doc = win.document;
      hookRestore(win);
      if (kept) { kept.stop(); kept = null; }

      if (reduced) {
        // No flight: the home fades, /new shows the ring at rest.
        fadeOut(rootEl, REDUCED_FADE_MS, 0);
        safety = setTimeout(() => finish(true), REDUCED_FADE_MS);
        return;
      }

      const vw = win.innerWidth, vh = win.innerHeight, DPR = Math.min(2, win.devicePixelRatio || 1);
      const [px, py] = centreOf(plusEl, vw, vh);
      const pts = samplePoints(rootEl, { max: options.maxFlies ?? MAX_FLIES, points: options.points, vw, vh });
      const { FLY, WARM } = getSprites(doc);
      const DNA = dnaSprite(doc);
      const ring = makeFlies();

      canvas = doc.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.width = Math.round(vw * DPR); canvas.height = Math.round(vh * DPR);
      Object.assign(canvas.style, { position: 'fixed', left: '0', top: '0', width: vw + 'px', height: vh + 'px', pointerEvents: 'none', zIndex: '2147483646' });
      const ctx = canvas.getContext('2d');
      (doc.body || doc.documentElement).appendChild(canvas);

      const flies = planFlights(pts, ring, { px, py, vw, vh, D });
      for (const f of flies) f.img = f.id % 3 === 2 ? WARM : FLY;

      // The real UI goes as the call reaches it: quick, gentle ease-in.
      fadeOut(rootEl, D * .28, D * .04);

      const t0 = win.performance ? win.performance.now() : Date.now();
      epoch = Date.now() + D;
      const drawRing = tt => {
        for (const f of ring) {
          const p = ringPos(f, tt, vw, vh);
          const r = clampR(f.r0);
          ctx.globalAlpha = f.a0; ctx.drawImage(DNA, p.x - r, p.y - r, 2 * r, 2 * r);
        }
      };
      const draw = now => {
        raf = 0;
        if (!canvas) return;
        try {
          const t = now - t0;
          if (!Number.isFinite(t)) throw new Error('no time');
          ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, vw, vh);
          ctx.globalCompositeOperation = 'lighter';
          if (t >= D) drawRing(t - D);                               // the ring stands; /new goes on from here
          else for (const f of flies) drawFly(ctx, f, t, D, vw, vh, DNA);
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
          if (t >= D) finish(true);
          raf = win.requestAnimationFrame(draw);
        } catch { if (done) drop(); else finish(false); }
      };
      kept = {
        stop: drop,
        pause: stopFrames,
      };
      raf = win.requestAnimationFrame(draw);
      // Frames can stop (hidden tab, busy main thread). Navigation never waits on them.
      safety = setTimeout(() => finish(true), D + 250);
    } catch {
      finish(false);
    }
  });
  if (active) running = run;   // an instant error already finished it
  return run;
}

/* Who flies where (pure, so it can be tested). Each of the 30 ring slots takes the nearest spawn
 * point: that firefly becomes the orbit fly. Every other one flies to the nearest slot and merges
 * into it. Targets are the slot's place at the arrival time (tt = arrive - D), so they land moving. */
export function planFlights(pts, ring, { px, py, vw, vh, D, rand = Math.random }) {
  let far = 1; for (const [x, y] of pts) far = Math.max(far, Math.hypot(x - px, y - py));
  const flies = pts.map(([x, y], id) => {
    const k = Math.hypot(px - x, py - y) / far, j = rand();
    const spawn = D * (.03 + .19 * k + .03 * j);                        // the call spreads from the plus
    const arrive = D * clamp(.56 + .28 * Math.pow(k, .8) + .04 * (rand() - .5), .52, .86);
    return { id, x0: x, y0: y, spawn, leave: spawn + D * .07, arrive, wob: rand() * 6.283, size: 16 + rand() * 6, slot: -1, own: false };
  });
  // the 30: greedy, each slot the nearest free point (seen from where it will be at about .7 D)
  const mid = ring.map(f => ringPos(f, -.3 * D, vw, vh));
  const free = new Set(flies.map(f => f.id));
  ring.forEach((_, s) => {
    let best = -1, bd = Infinity;
    for (const id of free) { const f = flies[id], d = Math.hypot(f.x0 - mid[s].x, f.y0 - mid[s].y); if (d < bd) { bd = d; best = id; } }
    if (best >= 0) { free.delete(best); flies[best].slot = s; flies[best].own = true; }
  });
  // a slot no point reached (a near-empty home) is lit from the plus itself
  ring.forEach((_, s) => {
    if (flies.some(f => f.own && f.slot === s)) return;
    flies.push({ id: flies.length, x0: px, y0: py, spawn: 0, leave: D * .07, arrive: D * .7, wob: rand() * 6.283, size: 16, slot: s, own: true });
  });
  for (const f of flies) {
    if (!f.own) {
      let bd = Infinity;
      mid.forEach((m, s) => { const d = Math.hypot(f.x0 - m.x, f.y0 - m.y); if (d < bd) { bd = d; f.slot = s; } });
    }
    const rf = ring[f.slot], end = ringPos(rf, f.arrive - D, vw, vh);
    // one shared turn for every path, so the streams swirl in together
    const dx = end.x - f.x0, dy = end.y - f.y0, dist = Math.hypot(dx, dy), bend = dist * (.16 + .2 * rand());
    const nx = dist ? -dy / dist : 0, ny = dist ? dx / dist : 0;
    Object.assign(f, { rf, cx: (f.x0 + end.x) / 2 + nx * bend, cy: (f.y0 + end.y) / 2 + ny * bend });
  }
  return flies;
}

/* One firefly of the call at time t (ms since the press). */
function drawFly(ctx, f, t, D, vw, vh, DNA) {
  if (t < f.spawn) return;
  if (!f.own && t >= f.arrive) return;                                // merged into its slot
  const r = clampR(f.rf.r0);
  if (f.own && t >= f.arrive) {                                        // riding the ring, already the orbit fly
    const p = ringPos(f.rf, t - D, vw, vh);
    ctx.globalAlpha = f.rf.a0; ctx.drawImage(DNA, p.x - r, p.y - r, 2 * r, 2 * r); return;
  }
  const lit = flash(t - f.spawn);                                      // it lights up where the UI was
  let x = f.x0, y = f.y0, size = f.size, alpha = .34 + .62 * lit, u = 0;
  if (t > f.leave) {
    u = inOutQuad(clamp((t - f.leave) / (f.arrive - f.leave), 0, 1)); const v = 1 - u;
    const end = ringPos(f.rf, t - D, vw, vh);                           // the slot moves; the path bends to it
    const ex = end.x, ey = end.y;
    x = v * v * f.x0 + 2 * v * u * f.cx + u * u * ex;
    y = v * v * f.y0 + 2 * v * u * f.cy + u * u * ey;
    const w = Math.sin(t / 140 + f.wob) * 3 * v;                        // a living wobble, gone at the end
    x += w; y -= w * .6;
  } else {
    y -= (t - f.spawn) * .012;                                         // a breath of lift before it goes
  }
  if (!f.own) {
    if (u > .82) { const e = (u - .82) / .18; size *= 1 - .6 * e; alpha *= 1 - e; }   // merges, like a drop
    ctx.globalAlpha = clamp(alpha, 0, 1); ctx.drawImage(f.img, x - size / 2, y - size / 2, size, size); return;
  }
  // the orbit fly: the call's glow turns into the ring's own dot over the second half of its path
  const c = u <= .5 ? 0 : easeInOut((u - .5) / .5);
  if (c < 1) { ctx.globalAlpha = clamp(alpha * (1 - c), 0, 1); const s = size * (1 - c) + 2 * r * c; ctx.drawImage(f.img, x - s / 2, y - s / 2, s, s); }
  if (c > 0) { ctx.globalAlpha = f.rf.a0 * c; ctx.drawImage(DNA, x - r, y - r, 2 * r, 2 * r); }
}
