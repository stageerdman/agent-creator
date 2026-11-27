import { test } from "node:test";
import assert from "node:assert/strict";
import { createOrbit, makeFlies, entriesOfFiles, entriesOfDrop, isHidden, hitRadius, TEXT_PEAK } from "./firefly-orbit.js";
import { MIN_R, MAX_R } from "./fireflies-dna.js";

// A canvas that draws nothing, so the orbit runs in node on a fake clock.
const ctx = new Proxy({}, { get: () => () => ({ addColorStop() {} }), set: () => true });
const fakeCanvas = () => ({ width: 0, height: 0, clientWidth: 56, style: {}, getContext: () => ctx, ownerDocument: { createElement: () => fakeCanvas() } });
globalThis.devicePixelRatio = 1;
globalThis.document ??= { createElement: () => fakeCanvas() };   // the DNA logo makes its own sprites

function rig({ reduced = false } = {}) {
  let t = 1000;
  const text = { style: {} }, logo = fakeCanvas();
  const orbit = createOrbit({ canvas: fakeCanvas(), text, logo, reduced, now: () => t, size: () => ({ W: 1440, H: 900 }) });
  const run = (ms, step = 16) => { for (let e = 0; e < ms; e += step) { t += step; orbit.step(t); } };
  orbit.step(t);
  return { orbit, run, text, logo, at: () => t };
}
const flush = () => new Promise((r) => setTimeout(r, 0));
const radii = (o) => o.info().flies.map((f) => f.r);

test("orbit: 30 seeded fireflies in three rings, the first straight up", () => {
  const a = makeFlies(), b = makeFlies();
  assert.equal(a.length, 30);
  assert.deepEqual([0, 1, 2].map((r) => a.filter((f) => f.ring === r).length), [7, 10, 13]);
  assert.deepEqual(a.map((f) => f.angle), b.map((f) => f.angle));
  assert.equal(a[0].angle, -Math.PI / 2);
  assert.ok(a.every((f) => f.r0 >= 2.5 && f.r0 <= 4.4 && f.a0 >= .3 && f.a0 <= .42));
  assert.equal(hitRadius(900), 90);
  assert.equal(hitRadius(400), 56);
});

test("orbit: rest is dim and turning; radii stay between MIN_R and MAX_R in every state", async () => {
  const { orbit, run } = rig();
  run(800);
  const before = orbit.info();
  assert.equal(before.state, "rest");
  assert.ok(before.flies.every((f) => f.a <= .95));
  run(1000);
  assert.notDeepEqual(orbit.info().flies.map((f) => f.x), before.flies.map((f) => f.x));
  const all = [...radii(orbit)];
  orbit.pointer(720, 450); run(500); all.push(...radii(orbit));
  orbit.stir(); run(100); all.push(...radii(orbit));
  orbit.answer(Promise.resolve({ name: "A", files: [] })); run(300); all.push(...radii(orbit));
  assert.ok(all.every((r) => r >= MIN_R && r <= MAX_R), "radius out of range");
});

test("orbit: hover shows the faint word (peak .36), 5 fireflies lean in, leaving fades it out", () => {
  // Reduce Motion here only so no twinkle muddies the count; the lean set is the same code.
  const still = rig({ reduced: true });
  const rest = still.orbit.info().flies.map((f) => f.a);
  still.orbit.pointer(720, 450); still.run(500);
  assert.equal(still.orbit.info().flies.filter((f, i) => f.a > rest[i] + .29).length, 5);
  const { orbit, run } = rig();
  run(700);
  orbit.pointer(720, 450); run(500);
  const lean = orbit.info();
  assert.equal(lean.state, "lean");
  assert.equal(lean.textOpacity, TEXT_PEAK);
  orbit.pointer(720 + 95, 450); run(50);              // inside the 12 px band: still leaning
  assert.equal(orbit.info().state, "lean");
  orbit.pointer(100, 100); run(700);
  assert.equal(orbit.info().textOpacity, 0);
  assert.equal(orbit.info().state, "rest");
});

test("orbit: a drag stirs (m 1.6, no word); it ends 150 ms after the last dragover", () => {
  const { orbit, run } = rig();
  orbit.pointer(720, 450); run(500);
  for (let i = 0; i < 6; i++) { orbit.stir(); run(50, 10); }
  const s = orbit.info();
  assert.equal(s.state, "stir");
  assert.ok(Math.abs(s.m - 1.6) < .02);
  run(500);
  assert.equal(s.textOpacity < TEXT_PEAK, true);
  run(400);
  assert.equal(orbit.info().state, "lean");
});

test("orbit: the answer glows, speeds to 6, holds for the save, then first light", async () => {
  const { orbit, run, logo } = rig();
  let done; const work = new Promise((r) => { done = r; });
  orbit.answer(work); run(600);
  const a = orbit.info();
  assert.equal(a.state, "answer");
  assert.equal(a.m, 6);
  assert.ok(a.flies.every((f) => f.a > .95));
  assert.equal(a.textOpacity, 0);
  run(1500);
  assert.equal(orbit.info().state, "answer", "holds until the save is back");
  assert.equal(orbit.answer(Promise.resolve()), false, "a second pick is ignored");
  done({ name: "Tony", files: [{ id: "a.md", name: "a.md", sizeBytes: 9, addedAt: "2026-11-27T00:00:00Z", topic: "other" }] });
  await flush(); run(800);
  assert.equal(orbit.info().state, "first-light");
  assert.equal(logo.style.opacity, "1");
  assert.deepEqual(orbit.info().flies, []);
});

test("orbit: a failed save settles back to the waiting ring over 900 ms", async () => {
  const { orbit, run } = rig();
  orbit.answer(Promise.reject(new Error("x"))); await flush(); run(100);
  assert.equal(orbit.info().state, "settle");
  run(1000);
  const i = orbit.info();
  assert.equal(i.state, "rest");
  assert.equal(i.m, 1);
  assert.ok(i.flies.every((f) => f.a <= .95));
});

test("orbit: Reduce Motion — nothing moves, r never changes, no speed-up, brightness still answers", async () => {
  const { orbit, run } = rig({ reduced: true });
  const p0 = orbit.info().flies;
  run(1000);
  assert.deepEqual(orbit.info().flies.map((f) => [f.x, f.y, f.r]), p0.map((f) => [f.x, f.y, f.r]));
  orbit.pointer(720, 450); run(500);
  const lean = orbit.info();
  assert.equal(lean.textOpacity, TEXT_PEAK);
  assert.deepEqual(lean.flies.map((f) => [f.x, f.y, f.r]), p0.map((f) => [f.x, f.y, f.r]));
  orbit.stir(); run(100);
  assert.equal(orbit.info().m, 1);
  orbit.answer(Promise.resolve({ name: "A", files: [] })); await flush(); run(300);
  const ans = orbit.info();
  assert.equal(ans.m, 1);
  assert.ok(ans.flies.every((f) => f.a > .95));
  assert.deepEqual(ans.flies.map((f) => [f.x, f.y, f.r]), p0.map((f) => [f.x, f.y, f.r]));
  run(1000);
  assert.equal(orbit.info().state, "first-light");
});

test("entries: picks keep the folder's own name, leave hidden files out", () => {
  const files = [
    { webkitRelativePath: "Tony Course/Books/a.pdf", size: 10 },
    { webkitRelativePath: "Tony Course/.DS_Store", size: 1 },
    { webkitRelativePath: "Tony Course/.git/HEAD", size: 1 },
    { name: "loose.md", size: 3 },
  ];
  assert.deepEqual(entriesOfFiles(files), [{ path: "Tony Course/Books/a.pdf", size: 10 }, { path: "loose.md", size: 3 }]);
  assert.ok(isHidden("a/.b/c") && !isHidden("a/b.c"));
});

test("entries: a dropped folder is walked in batches; onFirst fires once; a link brings nothing", async () => {
  const file = (name, size) => ({ isFile: true, name, fullPath: name, file: (ok) => ok({ size }) });
  const dir = (name, kids) => ({ isDirectory: true, name, createReader: () => { let left = [...kids]; return { readEntries: (ok) => ok(left.splice(0, 2)) }; } });
  const root = dir("Notes", [file("/Notes/a.md", 4), file("/Notes/.DS_Store", 1), dir(".git", [file("/Notes/.git/x", 1)]), file("/Notes/b.md", 5)]);
  let first = 0;
  const list = await entriesOfDrop({ items: [{ kind: "file", webkitGetAsEntry: () => root }] }, () => first++);
  assert.deepEqual(list, [{ path: "Notes/a.md", size: 4 }, { path: "Notes/b.md", size: 5 }]);
  assert.equal(first, 1);
  assert.deepEqual(await entriesOfDrop({ items: [{ kind: "string" }], files: [] }), []);
});
