import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

/* A tiny fake page: just enough DOM for firefly-gather.js to run in Node. */
const ctx2d = new Proxy({}, {
  get: (o, k) => k in o ? o[k] : (k === "createRadialGradient" ? () => ({ addColorStop() {} }) : () => {}),
  set: (o, k, v) => { o[k] = v; return true; },
});
const body = { kids: [], appendChild(c) { this.kids.push(c); c.parentNode = this; return c; } };
let canvasesMade = 0;
let draws = 0;
function makeCanvas() {
  canvasesMade++;
  return {
    tagName: "CANVAS", style: {}, width: 0, height: 0, children: [],
    setAttribute() {}, getContext: () => new Proxy(ctx2d, { get: (o, k) => k === "drawImage" ? () => { draws++; } : o[k] }),
    remove() { body.kids = body.kids.filter(c => c !== this); },
  };
}
function el(tag, rect, kids = [], text = "") {
  const r = { left: rect[0], top: rect[1], width: rect[2], height: rect[3], right: rect[0] + rect[2], bottom: rect[1] + rect[3] };
  const node = {
    tagName: tag.toUpperCase(), children: kids, textContent: text, style: {}, value: "", anims: [],
    getBoundingClientRect: () => r,
    querySelectorAll: () => kids.flatMap(k => [k, ...k.querySelectorAll("*")]),
    querySelector: s => node.querySelectorAll("*").find(k => k.tagName === s.toUpperCase()) || null,
    animate(frames, opts) { const a = { opts, cancelled: false, cancel() { this.cancelled = true; } }; node.anims.push(a); return a; },
  };
  return node;
}
function homeWith(rows) {
  const list = [];
  for (let i = 0; i < rows; i++) {
    const y = 120 + i * 60;
    list.push(el("a", [340, y, 600, 56], [
      el("canvas", [340, y + 4, 48, 48]),
      el("span", [400, y + 6, 420, 24], [], "A very long agent name ".repeat(4)),
      el("span", [400, y + 30, 420, 20], [], "A short description of what it does"),
      el("span", [880, y + 16, 60, 20], [], "3 weeks"),
    ]));
  }
  return el("main", [0, 0, 1280, 820], [el("input", [440, 60, 400, 44]), ...list]);
}

globalThis.window = globalThis;
globalThis.innerWidth = 1280;
globalThis.innerHeight = 820;
globalThis.devicePixelRatio = 2;
globalThis.document = { body, documentElement: body, createElement: makeCanvas };
globalThis.getComputedStyle = () => ({ display: "block", visibility: "visible", opacity: "1" });
globalThis.matchMedia = () => ({ matches: false });
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 16);
globalThis.cancelAnimationFrame = id => clearTimeout(id);
globalThis.addEventListener = () => {};

const { gatherToRing, isGathering, samplePoints, planFlights, restoreHome, MAX_FLIES } = await import("./firefly-gather.js");
const { makeFlies, ringPos } = await import("./firefly-orbit.js");
const plus = () => el("a", [1180, 740, 44, 44]);
/* The real #plus: a tile with its 18 px glyph inside. */
const realPlus = (rect = [1180, 740, 44, 44]) => el("a", rect, [el("svg", [rect[0] + 13, rect[1] + 13, 18, 18])]);
const glyphOf = p => p.children[0];
const nextFrame = () => new Promise(r => setTimeout(r, 40));

beforeEach(() => { draws = 0; restoreHome(); });

test("the call resolves after about its duration with the ring's epoch, and the ring canvas stays", async () => {
  const t0 = performance.now(), w0 = Date.now();
  const run = gatherToRing(homeWith(10), plus(), { reducedMotion: false });
  const w1 = Date.now(); // setup (sprites, sampling) runs inside the call; on a busy machine it can take a while
  assert.equal(isGathering(), true);
  assert.equal(body.kids.length, 1, "one overlay canvas while it runs");
  const { epoch } = await run;
  const took = performance.now() - t0;
  assert.ok(took >= 950 && took < 1300, `took ${Math.round(took)} ms (D = 1000)`);
  assert.ok(epoch >= w0 + 1000 && epoch <= w1 + 1000 + 5, `epoch = the wall time the ring stands (got +${epoch - w0} ms)`);
  assert.equal(isGathering(), false);
  assert.equal(body.kids.length, 1, "no blank frame: the canvas still draws the ring until the page goes");
  const before = draws;
  await new Promise(r => setTimeout(r, 80));
  assert.ok(draws - before >= 30, "the ring is still drawn after the run");
  restoreHome();
  assert.equal(body.kids.length, 0, "back from the cache: the ring goes");
});

test("a second press during a run returns the same run, never a second canvas", async () => {
  const a = gatherToRing(homeWith(3), plus(), { durationMs: 1000, reducedMotion: false });
  const b = gatherToRing(homeWith(3), plus(), { durationMs: 1000, reducedMotion: false });
  assert.equal(a, b);
  assert.equal(body.kids.length, 1);
  await a;
  assert.equal(body.kids.length, 1);
});

test("the call flies into the 30 ring slots, never into the plus", () => {
  const ring = makeFlies(), D = 1000, vw = 1280, vh = 820;
  const pts = samplePoints(homeWith(10), { vw, vh });
  const flies = planFlights(pts, ring, { px: 1202, py: 762, vw, vh, D });
  const own = flies.filter(f => f.own);
  assert.equal(own.length, 30, "one orbit fly per slot");
  assert.deepEqual(own.map(f => f.slot).sort((a, b) => a - b), ring.map((_, i) => i));
  for (const f of flies) {
    assert.ok(f.slot >= 0 && f.slot < 30);
    const end = ringPos(ring[f.slot], f.arrive - D, vw, vh);
    assert.ok(Math.hypot(end.x - 640, end.y - 410) < .4 * 820, "ends on the ring around the middle");
    assert.ok(Math.hypot(end.x - 1202, end.y - 762) > 200, "not at the plus");
    assert.ok(f.arrive <= D, "lands before the ring stands");
  }
});

test("a near-empty home still makes a full ring (missing slots are lit from the plus)", () => {
  const flies = planFlights([[100, 100]], makeFlies(), { px: 1202, py: 762, vw: 1280, vh: 820, D: 1000 });
  assert.equal(flies.filter(f => f.own).length, 30);
});

test("reduced motion: no fireflies, resolves within 200 ms", async () => {
  const before = canvasesMade;
  const t0 = performance.now();
  const { epoch } = await gatherToRing(homeWith(10), plus(), { reducedMotion: true });
  const took = performance.now() - t0;
  assert.equal(epoch, null, "no flight to continue: /new shows the ring at rest");
  assert.ok(took <= 200, `took ${Math.round(took)} ms`);
  assert.equal(canvasesMade, before, "no overlay canvas");
  assert.equal(draws, 0);
  assert.equal(isGathering(), false);
});

test("reduced motion is read from matchMedia when not given", async () => {
  globalThis.matchMedia = () => ({ matches: true });
  const t0 = performance.now();
  await gatherToRing(homeWith(2), plus());
  assert.ok(performance.now() - t0 <= 200);
  globalThis.matchMedia = () => ({ matches: false });
});

test("if anything throws, it resolves at once and leaves nothing behind", async () => {
  const broken = { querySelectorAll() { throw new Error("boom"); }, animate() {} };
  let t0 = performance.now();
  await gatherToRing(broken, plus(), { reducedMotion: false });
  assert.ok(performance.now() - t0 < 50);
  assert.equal(isGathering(), false);
  assert.equal(body.kids.length, 0);

  t0 = performance.now();
  await gatherToRing(null, null, { reducedMotion: false });
  assert.ok(performance.now() - t0 < 50);
  assert.equal(isGathering(), false);
});

test("an error in a frame ends the run at once", async () => {
  const raf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = cb => setTimeout(() => cb(undefined), 16);  // NaN time
  const run = gatherToRing(homeWith(2), plus(), { durationMs: 1200, reducedMotion: false });
  globalThis.requestAnimationFrame = () => { throw new Error("no frames"); };
  const t0 = performance.now();
  await run;
  assert.ok(performance.now() - t0 < 300, "did not wait for the full duration");
  assert.equal(body.kids.length, 0);
  globalThis.requestAnimationFrame = raf;
});

test("when frames stop (hidden tab), a timer still resolves it", async () => {
  const raf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 0;   // frames never come
  const t0 = performance.now();
  const { epoch } = await gatherToRing(homeWith(2), plus(), { durationMs: 1000, reducedMotion: false });
  const took = performance.now() - t0;
  assert.ok(took >= 1000 && took < 1500, `took ${Math.round(took)} ms`);
  assert.ok(epoch > 0, "the ring's time still goes over to /new");
  globalThis.requestAnimationFrame = raf;
});

test("the firefly count is capped, even with 50 rows and extra points", () => {
  const extra = Array.from({ length: 1000 }, (_, i) => ({ x: i % 1280, y: 100 + (i % 600) }));
  const pts = samplePoints(homeWith(50), { points: extra });
  assert.equal(MAX_FLIES, 400);
  assert.ok(pts.length <= MAX_FLIES, `${pts.length} points`);
  assert.ok(pts.length > 100);
  for (const [x, y] of pts) assert.ok(x >= 0 && x <= 1280 && y >= 0 && y <= 820, "inside the window");
});

/* ---------- PLUS-FIREFLY: the + itself becomes a firefly ---------- */

test("the + is one fly of the plan: at its centre, the slot nearest it, landing mid-window at .70 D", () => {
  const ring = makeFlies(), D = 1000, vw = 1280, vh = 820, px = 1202, py = 762;
  const pts = samplePoints(homeWith(10), { vw, vh });
  const flies = planFlights(pts, ring, { px, py, vw, vh, D, plus: true });
  const mine = flies.filter(f => f.plus);
  assert.equal(mine.length, 1, "exactly one + fly");
  const p = mine[0];
  assert.deepEqual([p.x0, p.y0], [px, py], "it starts where the + is");
  assert.equal(p.own, true);
  assert.equal(p.spawn, 0);
  assert.equal(p.leave, 200, "folds and holds for the first 200 ms");
  assert.equal(p.arrive, 700);
  const others = flies.filter(f => !f.plus).map(f => f.arrive);
  assert.ok(p.arrive > Math.min(...others) && p.arrive < Math.max(...others), "never first, never last");
  const mid = ring.map(f => ringPos(f, -.3 * D, vw, vh)), d = s => Math.hypot(mid[s].x - px, mid[s].y - py);
  assert.ok(ring.every((_, s) => d(p.slot) <= d(s)), "it joins the slot nearest it");
  const own = flies.filter(f => f.own).map(f => f.slot).sort((a, b) => a - b);
  assert.deepEqual(own, ring.map((_, i) => i), "still one orbit fly per slot");
  assert.equal(planFlights(pts, ring, { px, py, vw, vh, D }).filter(f => f.plus).length, 0, "no + fly unless asked");
});

test("a near-empty home: the rest of the ring's light follows the + out, after the fold", () => {
  const flies = planFlights([[100, 100]], makeFlies(), { px: 1202, py: 762, vw: 1280, vh: 820, D: 1000, plus: true });
  assert.equal(flies.filter(f => f.own).length, 30);
  for (const f of flies.filter(f => !f.plus && f.x0 === 1202 && f.y0 === 762)) assert.equal(f.spawn, 200, "nothing else lights at the + while it folds");
});

test("the glyph stays until the first frame, hides in it, and the run ends in the same total time", async () => {
  const p = realPlus(), g = glyphOf(p);
  const t0 = performance.now();
  const run = gatherToRing(homeWith(10), p, { reducedMotion: false });
  assert.notEqual(g.style.opacity, "0", "the click itself: the glyph is still there");
  await nextFrame();
  assert.equal(g.style.opacity, "0", "after the first frame its firefly has taken over");
  assert.equal(p.anims.length, 1, "the tile fades with the page");
  assert.deepEqual([p.anims[0].opts.duration, p.anims[0].opts.delay], [280, 40]);
  const { epoch } = await run;
  const took = performance.now() - t0;
  assert.ok(took >= 950 && took < 1300, `took ${Math.round(took)} ms (D = 1000, unchanged)`);
  assert.ok(epoch > 0);
  assert.equal(p.style.display, undefined, "hidden by opacity only, so a second click still reaches it");
});

test("back from the cache: the + glyph and tile are restored", async () => {
  const p = realPlus(), g = glyphOf(p);
  await gatherToRing(homeWith(3), p, { durationMs: 200, reducedMotion: false });
  assert.equal(g.style.opacity, "0");
  restoreHome();
  assert.notEqual(g.style.opacity, "0", "the glyph is back");
  assert.ok(p.anims.every(a => a.cancelled), "the tile fade is undone");
});

test("frames stop before the first one: the glyph is never hidden and the timer still ends it", async () => {
  const raf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 0;
  const p = realPlus(), g = glyphOf(p), t0 = performance.now();
  await gatherToRing(homeWith(2), p, { durationMs: 1000, reducedMotion: false });
  const took = performance.now() - t0;
  globalThis.requestAnimationFrame = raf;
  assert.ok(took >= 1000 && took < 1500, `took ${Math.round(took)} ms`);
  assert.notEqual(g.style.opacity, "0", "no frame painted its copy, so the real + never went");
});

test("reduced motion: the whole + fades with the page in 160 ms, the glyph is not touched", async () => {
  const p = realPlus(), g = glyphOf(p), before = canvasesMade;
  await gatherToRing(homeWith(3), p, { reducedMotion: true });
  assert.equal(canvasesMade, before, "no canvas");
  assert.equal(p.anims.length, 1);
  assert.deepEqual([p.anims[0].opts.duration, p.anims[0].opts.delay], [160, 0]);
  assert.equal(g.style.opacity, undefined);
  restoreHome();
  assert.ok(p.anims[0].cancelled, "and comes back");
});

test("a + with no box: no + fly, the glyph untouched, the run as before", async () => {
  const p = realPlus([0, 0, 0, 0]), g = glyphOf(p);
  const t0 = performance.now();
  const { epoch } = await gatherToRing(homeWith(3), p, { reducedMotion: false });
  assert.ok(epoch > 0 && performance.now() - t0 < 1300);
  assert.equal(g.style.opacity, undefined);
  assert.equal(p.anims.length, 0);
});

test("only visible parts are sampled; a small page still gets enough fireflies", () => {
  const offscreen = el("main", [0, 0, 1280, 820], [el("span", [0, 2000, 200, 20], [], "below the fold")]);
  assert.equal(samplePoints(offscreen).length, 0);
  const one = samplePoints(homeWith(1));
  assert.ok(one.length >= 60, `${one.length} points`);
});
