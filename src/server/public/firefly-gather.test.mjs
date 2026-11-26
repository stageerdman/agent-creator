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
  return {
    tagName: tag.toUpperCase(), children: kids, textContent: text, style: {}, value: "",
    getBoundingClientRect: () => r,
    querySelectorAll: () => kids.flatMap(k => [k, ...k.querySelectorAll("*")]),
    animate() { return { cancel() {} }; },
  };
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

const { gatherToPlus, isGathering, samplePoints, MAX_FLIES } = await import("./firefly-gather.js");
const plus = () => el("a", [1180, 740, 44, 44]);

beforeEach(() => { draws = 0; });

test("the gather resolves after about its duration, draws fireflies and removes its canvas", async () => {
  const t0 = performance.now();
  const run = gatherToPlus(homeWith(10), plus(), { durationMs: 1200, reducedMotion: false });
  assert.equal(isGathering(), true);
  assert.equal(body.kids.length, 1, "one overlay canvas while it runs");
  await run;
  const took = performance.now() - t0;
  assert.ok(took >= 1150 && took < 1500, `took ${Math.round(took)} ms`);
  assert.equal(isGathering(), false);
  assert.equal(body.kids.length, 0, "overlay removed at the end");
  assert.ok(draws > 0, "fireflies were drawn");
});

test("a second press during a run returns the same run, never a second canvas", async () => {
  const a = gatherToPlus(homeWith(3), plus(), { durationMs: 1000, reducedMotion: false });
  const b = gatherToPlus(homeWith(3), plus(), { durationMs: 1000, reducedMotion: false });
  assert.equal(a, b);
  assert.equal(body.kids.length, 1);
  await a;
  assert.equal(body.kids.length, 0);
});

test("reduced motion: no fireflies, resolves within 200 ms", async () => {
  const before = canvasesMade;
  const t0 = performance.now();
  await gatherToPlus(homeWith(10), plus(), { reducedMotion: true });
  const took = performance.now() - t0;
  assert.ok(took <= 200, `took ${Math.round(took)} ms`);
  assert.equal(canvasesMade, before, "no overlay canvas");
  assert.equal(draws, 0);
  assert.equal(isGathering(), false);
});

test("reduced motion is read from matchMedia when not given", async () => {
  globalThis.matchMedia = () => ({ matches: true });
  const t0 = performance.now();
  await gatherToPlus(homeWith(2), plus());
  assert.ok(performance.now() - t0 <= 200);
  globalThis.matchMedia = () => ({ matches: false });
});

test("if anything throws, it resolves at once and leaves nothing behind", async () => {
  const broken = { querySelectorAll() { throw new Error("boom"); }, animate() {} };
  let t0 = performance.now();
  await gatherToPlus(broken, plus(), { reducedMotion: false });
  assert.ok(performance.now() - t0 < 50);
  assert.equal(isGathering(), false);
  assert.equal(body.kids.length, 0);

  t0 = performance.now();
  await gatherToPlus(null, null, { reducedMotion: false });
  assert.ok(performance.now() - t0 < 50);
  assert.equal(isGathering(), false);
});

test("an error in a frame ends the run at once", async () => {
  const raf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = cb => setTimeout(() => cb(undefined), 16);  // NaN time
  const run = gatherToPlus(homeWith(2), plus(), { durationMs: 1200, reducedMotion: false });
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
  await gatherToPlus(homeWith(2), plus(), { durationMs: 1000, reducedMotion: false });
  const took = performance.now() - t0;
  assert.ok(took >= 1000 && took < 1500, `took ${Math.round(took)} ms`);
  assert.equal(body.kids.length, 0);
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

test("only visible parts are sampled; a small page still gets enough fireflies", () => {
  const offscreen = el("main", [0, 0, 1280, 820], [el("span", [0, 2000, 200, 20], [], "below the fold")]);
  assert.equal(samplePoints(offscreen).length, 0);
  const one = samplePoints(homeWith(1));
  assert.ok(one.length >= 60, `${one.length} points`);
});
