/* firefly-gather.js: the home dissolves into fireflies that fly into the plus.
 *
 *   import { gatherToPlus, isGathering } from '/firefly-gather.js';
 *   await gatherToPlus(rootEl, plusEl, { durationMs: 1200 });
 *   location.href = '/new';
 *
 * Meaning: the plus calls, and the screen answers. The call spreads outward
 * from the plus, each part of the page it reaches turns into fireflies, and
 * they all swirl in on soft curves and become the plus. The plus glows once:
 * "here is where your new agent begins." Timing and feel: 02-merlin-motion.md.
 *
 * Rules this module keeps:
 * - It never blocks navigation. Any error resolves the promise at once, and a
 *   timer resolves it even if animation frames stop (hidden tab).
 * - One run at a time. A call while one is running returns the same promise.
 * - Reduced motion: a plain fade of 160 ms, no fireflies.
 * - Its own full-screen canvas, removed at the end. The faded UI is left
 *   faded (so nothing flashes back before /new paints) and is restored when
 *   the page comes back from the back/forward cache.
 * - The look is the original Fireflies one: same sprites, colours, flash().
 */

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

function hookRestore(win) {
  if (restoreHooked || typeof win.addEventListener !== 'function') return;
  restoreHooked = true;
  // Back to the home from /new: bring the UI back exactly as it was.
  win.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    while (leftFaded.length) { try { leftFaded.pop().cancel(); } catch { /* ignore */ } }
  });
}

export function gatherToPlus(rootEl, plusEl, options = {}) {
  if (running) return running;
  active = true;
  const run = new Promise(resolve => {
    let done = false, canvas = null, raf = 0, safety = 0;
    const win = globalThis;
    const finish = () => {
      if (done) return; done = true;
      try { if (raf && win.cancelAnimationFrame) win.cancelAnimationFrame(raf); } catch { /* ignore */ }
      clearTimeout(safety);
      try { canvas && canvas.remove(); } catch { /* ignore */ }
      active = false; running = null; resolve();
    };
    try {
      const D = Math.max(0, Number(options.durationMs ?? 1200) || 0);
      const reduced = options.reducedMotion ?? prefersReduced();
      const doc = win.document;
      hookRestore(win);

      if (reduced) {
        fadeOut(rootEl, REDUCED_FADE_MS, 0);
        safety = setTimeout(finish, REDUCED_FADE_MS);
        return;
      }

      const vw = win.innerWidth, vh = win.innerHeight, DPR = Math.min(2, win.devicePixelRatio || 1);
      const [px, py] = centreOf(plusEl, vw, vh);
      const pts = samplePoints(rootEl, { max: options.maxFlies ?? MAX_FLIES, points: options.points, vw, vh });
      const { FLY, WARM } = getSprites(doc);

      canvas = doc.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.width = Math.round(vw * DPR); canvas.height = Math.round(vh * DPR);
      Object.assign(canvas.style, { position: 'fixed', left: '0', top: '0', width: vw + 'px', height: vh + 'px', pointerEvents: 'none', zIndex: '2147483646' });
      const ctx = canvas.getContext('2d');
      (doc.body || doc.documentElement).appendChild(canvas);

      // The call spreads from the plus: near parts light first, far parts last.
      let far = 1; for (const [x, y] of pts) far = Math.max(far, Math.hypot(x - px, y - py));
      const flies = pts.map(([x, y], i) => {
        const dx = px - x, dy = py - y, dist = Math.hypot(dx, dy), k = dist / far, j = Math.random();
        const spawn = D * (.03 + .19 * k + .03 * j);                     // 36–300 ms at 1.2 s
        const arrive = D * clamp(.52 + .30 * Math.pow(k, .8) + .04 * (Math.random() - .5), .48, .84);
        // one shared turn for every path, so the streams swirl in together
        const bend = dist * (.16 + .2 * Math.random());
        const nx = dist ? -dy / dist : 0, ny = dist ? dx / dist : 0;
        return {
          x0: x, y0: y, cx: (x + px) / 2 + nx * bend, cy: (y + py) / 2 + ny * bend,
          spawn, leave: spawn + D * .07, arrive, img: i % 3 === 2 ? WARM : FLY,
          wob: Math.random() * 6.283, size: 16 + Math.random() * 6,
        };
      });

      // The real UI goes as the call reaches it: quick, gentle ease-in.
      fadeOut(rootEl, D * .28, D * .04);

      // The plus answers: it warms as fireflies land, then one soft pulse.
      if (plusEl && typeof plusEl.animate === 'function') {
        const off = 'drop-shadow(0 0 0 rgba(216,242,106,0))';
        plusEl.animate([
          { filter: off, transform: 'scale(1)', offset: 0 },
          { filter: 'drop-shadow(0 0 6px rgba(216,242,106,.55))', transform: 'scale(1)', offset: .62 },
          { filter: 'drop-shadow(0 0 14px rgba(246,255,214,.9))', transform: 'scale(1.08)', offset: .82 },
          { filter: 'drop-shadow(0 0 4px rgba(216,242,106,.35))', transform: 'scale(1)', offset: 1 },
        ], { duration: D, easing: 'linear' });
      }

      const t0 = win.performance ? win.performance.now() : Date.now();
      const draw = now => {
        if (done) return;
        try {
          const t = now - t0;
          ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, vw, vh);
          ctx.globalCompositeOperation = 'lighter';
          let landed = 0;
          for (const f of flies) {
            if (t < f.spawn) continue;
            if (t >= f.arrive) { landed++; continue; }
            const lit = flash(t - f.spawn);                       // it lights up where the UI was
            let x = f.x0, y = f.y0, size = f.size, alpha = .34 + .62 * lit;
            if (t > f.leave) {
              const u = easeInOut(clamp((t - f.leave) / (f.arrive - f.leave), 0, 1)), v = 1 - u;
              x = v * v * f.x0 + 2 * v * u * f.cx + u * u * px;
              y = v * v * f.y0 + 2 * v * u * f.cy + u * u * py;
              const w = Math.sin(t / 140 + f.wob) * 3 * v;          // a living wobble, gone at the end
              x += w; y -= w * .6;
              if (u > .82) { const e = (u - .82) / .18; size *= 1 - .6 * e; alpha *= 1 - .7 * e; }  // drawn in
            } else {
              y -= (t - f.spawn) * .012;                            // a breath of lift before it goes
            }
            ctx.globalAlpha = clamp(alpha, 0, 1);
            ctx.drawImage(f.img, x - size / 2, y - size / 2, size, size);
          }
          // the light gathering at the plus
          const fill = flies.length ? landed / flies.length : clamp(t / D, 0, 1);
          const pulse = flash(t - D * .82);
          const halo = 28 + 26 * fill + 30 * pulse;
          ctx.globalAlpha = clamp(.15 * fill + .55 * pulse, 0, .8);
          if (ctx.globalAlpha > .01) ctx.drawImage(FLY, px - halo / 2, py - halo / 2, halo, halo);
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
          if (t >= D) return finish();
          raf = win.requestAnimationFrame(draw);
        } catch { finish(); }
      };
      raf = win.requestAnimationFrame(draw);
      // Frames can stop (hidden tab, busy main thread). Navigation never waits on them.
      safety = setTimeout(finish, D + 250);
    } catch {
      finish();
    }
  });
  if (active) running = run;   // an instant error already finished it
  return run;
}
