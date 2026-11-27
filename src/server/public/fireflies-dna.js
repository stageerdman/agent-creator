/* fireflies-dna.js: every agent's logo. One cluster of fireflies, drawn from the agent's files.
 *
 *   import { createDna } from '/fireflies-dna.js';
 *   const logo = createDna(canvas, { name, files: agent.dna });   // files: [{ id, name, sizeBytes, addedAt, topic }]
 *   logo.draw(performance.now(), dtSeconds, reduceMotion);          // once per frame; returns true while still changing
 *   logo.notice();                                                   // hover or focus: all dots flash once
 *   logo.setFiles(nextFiles);                                        // new files land one by one, removed ones go at once
 *
 * Ported from playground/fireflies-dna.html (approved by Eraser on 502662e):
 * - one dot per started MB, up to 60 dots; past that, each extra MB only adds glow;
 * - each file blinks on its own beat, set by when it was added (1 s apart -> about 650 ms apart; long gaps log-squashed);
 * - dot size is fixed (2.5 to 6.0 px radius): there is no size option on purpose;
 * - files already there on a visit are lit at rest; only files that arrive later land, one dot at a time;
 * - Reduce Motion: no blink, no drift; new dots still light one by one, 60 ms apart, each just turns on.
 */

export const BOX = 56;            // the logo's own drawing box, in css px; a bigger logo is the same box zoomed
export const MIN_R = 2.5;         // the smallest dot's radius
export const MAX_R = 6.0;         // the biggest dot's radius
export const FLOOR = 2;           // dense clusters shrink every dot, but never below this
export const MB = 1048576;        // one dot holds one MB
export const PLACED = 60;         // up to 60 dots get a spot; more only add glow
export const STEP = 90;           // ms between landing dots
export const STEP_REDUCED = 60;   // the same under Reduce Motion
export const YEAR_S = 365 * 86400;

const MID = BOX / 2, GROW = 1.3, TOUCH = .25, GAP = 250, PER_FILE = 2500;

/* ---------- small maths ---------- */
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { return () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const easeOut = x => 1 - (1 - x) * (1 - x);
const clock = () => globalThis.performance ? performance.now() : Date.now();

/* The real firefly flash: rise 120 ms ease-out, fall 900 ms ease-in. */
export function flash(dt) { if (dt < 0 || dt > 1020) return 0; if (dt < 120) return easeOut(dt / 120); const x = (dt - 120) / 900; return 1 - x * x; }

/* The golden-angle spiral. A slot's place doesn't depend on how many dots there are, so a new dot never moves the others. */
function slot(i, seed) { const r = 10 * Math.sqrt(i + .5), t = i * 2.39996 + seed; return [Math.cos(t) * r, Math.sin(t) * r]; }

/* Topic hues, on the cool arc (110-280 deg), in order of first appearance. */
const FIRST_SLOTS = [0, .67, .33, 1, .5, .17, .83];
export function topicColor(k) {
  const fr = k < FIRST_SLOTS.length ? FIRST_SLOTS[k] : (.15 + k * .6180339887) % 1;
  const h = 110 + 170 * (.06 + .88 * fr), blue = Math.max(0, 1 - Math.abs(h - 235) / 45);
  return hslHex(h, 85, Math.min(80, 66 + 6 * blue));
}
function hslHex(h, s, l) {
  s /= 100; l /= 100; const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); };
  return '#' + f(0) + f(8) + f(4);
}

/* ---------- the rules, pure ---------- */
/* 1 dot per started MB. The last dot's size says how full it is (area follows the bytes). */
export const dotsFor = bytes => Math.max(1, Math.ceil(Math.max(0, +bytes || 0) / MB));
export function fills(bytes) {
  bytes = Math.max(0, +bytes || 0);
  const n = dotsFor(bytes), out = new Array(n).fill(1);
  out[n - 1] = bytes <= 0 ? 0 : Math.sqrt((bytes - (n - 1) * MB) / MB);
  return out;
}

/* A file's beat moves on from the previous file's by a step that grows with the real gap, log-squashed:
   together -> in step; 1 s -> ~0.22 of a beat; 1 day -> ~0.6; a year or more -> 0.8. Never a full beat. */
export function phaseStep(gapMs) {
  const s = Math.max(0, +gapMs || 0) / 1000;
  return .2 * Math.min(1, s) + .6 * Math.min(1, Math.log(1 + s) / Math.log(1 + YEAR_S));
}
/* addedAt as ms epoch or an ISO string; unknown -> null (counts as added with the file before it). */
export function timeOf(v) {
  if (typeof v === 'number') return isFinite(v) ? v : null;
  const t = Date.parse(v); return isFinite(t) ? t : null;
}
/* Phases (0..1) for files, each chained from the file added just before it. Same order as given. */
export function beatsOf(files) {
  const order = files.map((f, i) => ({ i, t: timeOf(f.addedAt) }))
    .sort((a, b) => (a.t ?? -Infinity) - (b.t ?? -Infinity) || a.i - b.i);
  const out = new Array(files.length);
  let prev = null;
  for (const o of order) {
    out[o.i] = prev ? (prev.phase + phaseStep(o.t == null || prev.t == null ? 0 : o.t - prev.t)) % 1 : 0;
    prev = { phase: out[o.i], t: o.t ?? prev?.t ?? null };
  }
  return out;
}
/* The agent's own look, from its name only: spiral turn, outline, tilt and beat length (2.4 to 3.4 s). */
export function makeLook(name) {
  const r = rng(hash(String(name || '').trim() || 'Untitled'));
  return { seed: r() * 6.28, squash: .8 + r() * .12, tilt: r() * 6.28, period: 2.4 + r() };
}
/* Glow past 60 dots: steady, capped, never a pulse. */
export const glowLevel = extra => extra > 0 ? Math.min(.3, .06 * Math.log2(1 + extra)) : 0;

/* Where every dot rests. dots: [{ slot (0..59 or null = glow only), fill, topic }].
   Up to 12 dots: full size. Above 12: size x sqrt(12 / N). Then, if neighbours would touch or
   the cluster would leave the box, every dot shrinks toward the floor together (big stays bigger). */
export function layoutOf(dots, look) {
  const placed = dots.filter(d => d.slot != null), N = placed.length;
  const sq = 1 - (1 - look.squash) * Math.min(1, Math.pow(12 / Math.max(1, N), 2));
  const cs = Math.cos(look.tilt), sn = Math.sin(look.tilt), k = N > 12 ? Math.sqrt(12 / N) : 1;
  const P = placed.map(d => {
    const [u, v0] = slot(d.slot, look.seed), v = v0 * sq;
    return { d, ux: u * cs - v * sn, uy: u * sn + v * cs, r0: Math.max(FLOOR, (MIN_R + (MAX_R - MIN_R) * d.fill) * k) };
  });
  let scale = .62, q = 1;
  for (let it = 0; it < 80; it++) {
    const r = p => FLOOR + (p.r0 - FLOOR) * q;
    let sBox = Infinity, sNeed = 0;
    for (const p of P) { const far = Math.hypot(p.ux, p.uy); if (far > 0) sBox = Math.min(sBox, (MID - 1 - GROW * r(p)) / far); }
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const du = Math.hypot(P[i].ux - P[j].ux, P[i].uy - P[j].uy);
      sNeed = Math.max(sNeed, (r(P[i]) + r(P[j]) + TOUCH) / du);
    }
    if (sNeed <= sBox || q === 0) { scale = Math.max(sNeed, Math.min(.62, sBox)); if (sNeed > sBox) scale = sBox; break; }
    q = q < .02 ? 0 : q * .94;
  }
  const pts = new Map();
  for (const p of P) pts.set(p.d, { ux: p.ux, uy: p.uy, r: FLOOR + (p.r0 - FLOOR) * q });
  const extra = new Map(); let E = 0;
  for (const d of dots) if (d.slot == null) { E++; extra.set(d.topic, (extra.get(d.topic) || 0) + 1); }
  const level = glowLevel(E);
  return { scale, pts, glow: [...extra].map(([topic, n]) => ({ topic, a: level * n / E })), extra: E, level };
}

/* ---------- the logo ---------- */
const sprites = new Map();
function spriteOf(hex) {
  let s = sprites.get(hex); if (s) return s;
  const n = parseInt(hex.slice(1), 16), R = n >> 16, G = (n >> 8) & 255, B = n & 255, rgb = `${R},${G},${B}`;
  const core = `rgb(${R + (255 - R) * .7 | 0},${G + (255 - G) * .7 | 0},${B + (255 - B) * .7 | 0})`;
  s = document.createElement('canvas'); s.width = s.height = 128; const g = s.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, core); gr.addColorStop(.18, `rgba(${rgb},.9)`); gr.addColorStop(.42, `rgba(${rgb},.28)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); sprites.set(hex, s); return s;
}
const topicFromName = name => { const i = name.indexOf('/'); return i > 0 ? name.slice(0, i).trim().toLowerCase() : 'other'; };
const STILL = '#D8F26A';   // the one calm dot of an agent with no files yet

export function createDna(canvas, { name = '', files = [] } = {}) {
  const ctx = canvas.getContext('2d');
  const look = makeLook(name);
  look.time = 1 - .4 / look.period;     // the first file blinks 400 ms in, so a fresh look is seen lit
  const topicSlot = new Map();
  const colorOf = topic => { if (!topicSlot.has(topic)) topicSlot.set(topic, topicSlot.size); return topicColor(topicSlot.get(topic)); };
  let list = [], queue = [], cur = null, nextStart = -1e9, layout = layoutOf([], look), shown = layout.scale;
  let lastNotice = -1e9, still = false;

  const allDots = () => list.flatMap(f => f.dots);
  const litDots = () => allDots().filter(d => d.litAt != null);
  function freeSlot() { const used = new Set(allDots().map(d => d.slot)); let i = 0; while (used.has(i)) i++; return i < PLACED ? i : null; }
  function relayout() { layout = layoutOf(litDots(), look); }
  function rebeat() { const ph = beatsOf(list); list.forEach((f, i) => { f.phase = ph[i]; }); }

  function makeFile(o) {
    const fname = String(o && o.name || '').trim();
    const id = String(o && o.id != null && o.id !== '' ? o.id : fname);
    const bytes = Math.max(0, +(o && o.sizeBytes) || 0);   // unknown size -> one small dot
    const topic = String(o && o.topic ? o.topic : topicFromName(fname)).trim().toLowerCase() || 'other';
    colorOf(topic);
    const dots = fills(bytes).map((fill, k) => { const j = rng(hash('fly:' + id + ':' + k)); return { fill, topic, slot: null, litAt: null, flashT: -1e9, seedA: j() * 6.28, seedB: j() * 6.28 }; });
    const f = { id, topic, addedAt: o && o.addedAt, dots, quietUntil: -1e9 };
    dots.forEach(d => { d.f = f; });
    return f;
  }
  const byTime = (a, b) => (timeOf(a.addedAt) ?? -Infinity) - (timeOf(b.addedAt) ?? -Infinity);

  /* On a visit, every file is already there: lit at rest, no landing. */
  /* Ids in a Set and slots handed out in order: a 10,000-file folder stays linear (no long frame). */
  const seenAtStart = new Set(); let nextSlot = 0;
  for (const f of [...files].sort(byTime).map(makeFile)) {
    if (seenAtStart.has(f.id)) continue;
    seenAtStart.add(f.id);
    list.push(f); f.dots.forEach(d => { d.litAt = -1e9; d.slot = nextSlot < PLACED ? nextSlot++ : null; });
  }
  rebeat(); relayout(); shown = layout.scale;

  /* Later files join the queue and land one dot at a time; the next file waits for the one before. */
  function setFiles(next) {
    const ids = new Set((next || []).map(o => String(o.id != null && o.id !== '' ? o.id : String(o.name || '').trim())));
    const gone = list.filter(f => !ids.has(f.id));
    if (gone.length) {   // goes at once: no magic on deletion
      list = list.filter(f => ids.has(f.id)); queue = queue.filter(f => ids.has(f.id));
      if (cur && !ids.has(cur.f.id)) cur = null;
      for (const d of litDots().sort((a, b) => a.litAt - b.litAt)) if (d.slot == null) { const s = freeSlot(); if (s == null) break; d.slot = s; }
    }
    const now = clock(), have = new Set(list.map(g => g.id));
    for (const f of [...(next || [])].sort(byTime).map(makeFile)) {
      if (have.has(f.id)) continue;
      have.add(f.id); f.queuedAt = now; list.push(f); queue.push(f);
    }
    rebeat(); relayout(); still = false;
  }

  function tick(now, reduced) {
    let changed = false;
    for (;;) {
      if (!cur) {
        if (!queue.length) break;
        const f = queue.shift(), n = f.dots.length;
        const hurry = Math.max(.12, 1 / (1 + Math.max(0, queue.length - 3) / 2));   // a long queue hurries, but every file still lands
        cur = { f, i: 0, step: Math.min(STEP, (PER_FILE - 100) / Math.max(1, n - 1)) * hurry, gap: Math.max(24, GAP * hurry), at: Math.max(nextStart, f.queuedAt) };
      }
      if (cur.at > now) break;
      const f = cur.f, d = f.dots[cur.i];
      d.litAt = cur.at; d.flashT = cur.at; d.slot = freeSlot(); cur.i++; changed = true;
      if (cur.i >= f.dots.length) { nextStart = d.litAt + cur.gap; f.quietUntil = d.litAt + 1500; cur = null; }
      else cur.at += reduced ? STEP_REDUCED : cur.step;
    }
    if (changed) relayout();
  }

  function paint(items) {
    const css = canvas.clientWidth || BOX, dpr = Math.min(2, globalThis.devicePixelRatio || 1), k = css / BOX;
    const px = Math.round(css * dpr); if (canvas.width !== px) { canvas.width = canvas.height = px; }
    ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0); ctx.clearRect(0, 0, BOX, BOX);
    ctx.globalCompositeOperation = 'lighter';
    for (const d of items) { ctx.globalAlpha = d.a; ctx.drawImage(d.img, d.x - d.s / 2, d.y - d.s / 2, d.s, d.s); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }

  /* One frame. t: performance.now(); dt: seconds since the last frame. Returns true while something
     still moves, so a Reduce Motion page can stop drawing once the logo is still. */
  function draw(t, dt, reduced) {
    tick(t, reduced);
    if (!list.length) {   // no files yet: one dim, steady dot. Calm, no blink.
      if (!still) { paint([{ x: MID, y: MID, s: 2 * MIN_R, a: .35, img: spriteOf(STILL) }]); still = true; }
      return false;
    }
    const ease = reduced ? 1 : Math.min(1, dt * 6);
    shown += (layout.scale - shown) * ease;   // a zoom, never a reshuffle
    const beats = new Set();
    if (!reduced) {
      const before = look.time; look.time += dt / look.period;
      for (const f of list) {
        if (Math.floor(look.time + f.phase) === Math.floor(before + f.phase)) continue;
        if ((cur && cur.f === f) || queue.includes(f) || t < f.quietUntil) continue;
        beats.add(f); f.beatAt = t;
      }
    }
    const items = [];
    for (const g of layout.glow) items.push({ x: MID, y: MID, s: BOX - 4, a: g.a, img: spriteOf(colorOf(g.topic)) });
    let busy = !!cur || queue.length > 0;
    for (const [d, p] of layout.pts) {
      d.rs = d.rs == null ? p.r : d.rs + (p.r - d.rs) * ease;
      const age = t - d.litAt;
      let ux = p.ux, uy = p.uy, a, s;
      if (reduced) {
        a = age < 1200 ? 1 : .75; s = 2 * d.rs;   // a new dot simply turns on, lit for a moment
        if (age < 1200) busy = true;
      } else {
        if (age < 300) { const m = 1.25 - .25 * easeOut(age / 300); ux *= m; uy *= m; }   // lands from just outside, in 300 ms
        else if (beats.has(d.f) && age > 1200) d.flashT = t + d.seedA * 4;                // up to ~25 ms apart, like the real thing
        ux += Math.sin(t / 8000 * 6.283 + d.seedA) * 1.5; uy += Math.cos(t / 8000 * 6.283 + d.seedB) * 1.5;
        const b = flash(t - d.flashT);
        a = .12 + .8 * b; s = 2 * d.rs * (1 + (GROW - 1) * b);
      }
      items.push({ x: MID + ux * shown, y: MID + uy * shown, s, a, img: spriteOf(colorOf(d.topic)) });
    }
    paint(items);
    return busy || !reduced;
  }

  /* Hover or focus: all dots flash once together. Never under Reduce Motion, never twice in 700 ms. */
  function notice(reduced = false) {
    const t = clock(); if (reduced || t - lastNotice < 700) return;
    lastNotice = t; for (const d of allDots()) if (d.litAt != null && t - d.litAt > 300) d.flashT = t;
  }

  /* Read-only, for checks: each file's beat (phase 0..1, lastBlink in page-clock ms) and the dots on show. */
  function info() {
    return {
      period: Math.round(look.period * 1000), placed: layout.pts.size, glow: layout.level,
      files: list.map(f => ({ id: f.id, topic: f.topic, dots: f.dots.length, addedAt: timeOf(f.addedAt), blinkPhase: Math.round(f.phase * 1000) / 1000, lastBlink: f.beatAt ?? null })),
      dots: [...layout.pts].map(([d, p]) => ({ fileId: d.f.id, r: Math.round(p.r * 100) / 100, color: colorOf(d.topic) }))
    };
  }

  return { draw, notice, setFiles, info };
}
