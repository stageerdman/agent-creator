// The field's hand-over from the orbit (Reports/one-flow-magic-moment.md §5–§7), on a fake canvas and clock.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FADE_IN, FAIL_MS, FIELD_CAP, FLY_MS, LEAVE_AFTER, LEAVE_SPREAD, POUR_FROM, POUR_MAX, SHINE_AFTER,
  asFile, createField, flightAt, flyerAlpha, leaveOrder, pourTake,
} from "./creation-screen.js";
import { WAKE } from "./firefly-orbit.js";

/* ---------- pure ---------- */

test("the left side of the ring leaves first, spread over 0–240 ms after the wake", () => {
  const order = leaveOrder([{ x: 500 }, { x: 100 }, { x: 300 }]);
  assert.deepEqual(order.map(o => o.i), [1, 2, 0]);
  assert.equal(order[0].delay, LEAVE_AFTER);
  assert.equal(order[2].delay, LEAVE_AFTER + LEAVE_SPREAD);
  assert.equal(order[1].delay, LEAVE_AFTER + LEAVE_SPREAD / 2);
});

test("a flight starts where the fly is, leaves along its tangent and ends on its spot", () => {
  const from = { x: 600, y: 400 }, tan = { x: 0, y: 1 }, to = { x: 100, y: 300 };
  assert.deepEqual(flightAt(from, tan, to, 0), from);
  const end = flightAt(from, tan, to, 1);
  assert.ok(Math.abs(end.x - to.x) < 1e-9 && Math.abs(end.y - to.y) < 1e-9);
  const early = flightAt(from, tan, to, .05);                 // moving the way it was moving: down, not back up
  assert.ok(early.y > from.y, "keeps going along the tangent first");
});

test("light: from the wake to rest dim over the last 600 ms; extras melt to nothing", () => {
  assert.equal(flyerAlpha(0), WAKE);
  assert.equal(flyerAlpha(.2), WAKE, "still bright before the settle");
  assert.ok(Math.abs(flyerAlpha(1) - .32) < 1e-9);
  assert.equal(flyerAlpha(1, { extra: true }), 0);
  assert.ok(flyerAlpha(.5, { extra: true }) < flyerAlpha(.5));
});

test("the pour waits for its start, then lights at most 24 a frame", () => {
  assert.equal(pourTake(1000, 100, 500), 0);
  assert.equal(pourTake(1000, 500, 500), POUR_MAX);
  assert.equal(pourTake(5, 900, 500), 5);
});

test("an entry becomes a file with the server's id (the path)", () => {
  assert.deepEqual(asFile({ path: "notes/a/b.md", size: 12 }), { id: "notes/a/b.md", name: "b.md", sizeBytes: 12, state: "unprocessed" });
});

/* ---------- the field, on a fake page ---------- */

function page({ reduced = false } = {}) {
  let clock = 1000, frames = [], timers = [];
  const draws = [];
  const ctx = new Proxy({}, { get: (o, k) => (k in o ? o[k] : k === "drawImage" ? (...a) => draws.push(a) : () => ({ addColorStop() {} })), set: (o, k, v) => { o[k] = v; return true; } });
  const win = {
    innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1,
    performance: { now: () => clock },
    requestAnimationFrame: fn => frames.push(fn),
    setTimeout: (fn, ms) => timers.push({ fn, at: clock + ms }),
    clearTimeout() {},
  };
  const doc = { defaultView: win, createElement: () => ({ getContext: () => ctx }) };
  const canvas = { ownerDocument: doc, getContext: () => ctx, width: 0, height: 0 };
  const field = createField(canvas, () => reduced);
  const frame = (ms = 16) => {
    clock += ms;
    const fs = frames; frames = [];
    fs.forEach(fn => fn(clock));
    const due = timers.filter(x => x.at <= clock); timers = timers.filter(x => x.at > clock); due.forEach(x => x.fn());
  };
  const run = ms => { const end = clock + ms; while (clock < end) frame(); };
  return { field, frame, run, draws, now: () => clock, pending: () => frames.length };
}

/* A hand like orbit.release(): 30 flies on a circle, circling slowly. */
function hand(t, n = 30) {
  const flies = Array.from({ length: n }, (_, i) => ({ i, ring: i % 3, r0: 3, a0: .36, r: 3 }));
  return {
    t, reduced: false, flies,
    at(i, t2) {
      const a = i / n * 6.2832 + (t2 - t) / 8000;
      return { x: 640 + Math.cos(a) * 200, y: 400 + Math.sin(a) * 200, tx: -Math.sin(a), ty: Math.cos(a), v: .02, r: 3, a: WAKE };
    },
  };
}
const files = (n, dir = "f") => Array.from({ length: n }, (_, i) => ({ path: `${dir}/${i}.md`, size: i }));

test("the 30 live flies fly out and land on their files: none are redrawn from scratch", () => {
  const p = page();
  p.field.adopt(hand(p.now()));
  p.field.feed(files(30).map(asFile));
  p.frame();
  assert.equal(p.field.info().flyers, 30);
  assert.equal(p.field.info().flying, 30, "all 30 are still in the air");
  assert.equal(p.field.info().lit, 0, "no field dot appears before its fly lands");
  p.run(LEAVE_AFTER + LEAVE_SPREAD + FLY_MS + 50);
  assert.equal(p.field.info().flying, 0, "all landed");
  assert.equal(p.field.info().lit, 30, "each landed fly is its file's dot");
});

test("only 30 ever fly; the rest light in place, at most 24 a frame, from ~500 ms", () => {
  const p = page();
  p.field.adopt(hand(p.now()));
  p.field.feed(files(1000).map(asFile));
  assert.equal(p.field.info().queued, 970);
  p.run(POUR_FROM - 40);
  assert.equal(p.field.info().queued, 970, "nothing pours before the flyers have the stage");
  let before = p.field.info().queued;
  for (let k = 0; k < 10; k++) {
    p.frame();
    const q = p.field.info().queued;
    assert.ok(before - q <= 24, `≤ 24 a frame (${before - q})`);
    before = q;
  }
  p.run(3000);
  assert.equal(p.field.info().queued, 0);
  assert.equal(p.field.info().lit, 1000);
});

test("10,000 files: fed in batches without a freeze, only FIELD_CAP drawn", () => {
  const p = page();
  p.field.adopt(hand(p.now()));
  const all = files(10000).map(asFile);
  const t0 = performance.now();
  for (let i = 0; i < all.length; i += 500) { p.field.feed(all.slice(i, i + 500)); p.frame(); }
  const fed = performance.now() - t0;
  assert.ok(fed < 400, `20 batches and frames take ${fed.toFixed(0)} ms`);
  assert.equal(p.field.info().total, 10000);
  assert.equal(p.field.info().queued <= FIELD_CAP - 30, true);
  p.run(4000);
  assert.equal(p.field.info().drawn, FIELD_CAP);
  const t1 = performance.now(); p.frame(); const one = performance.now() - t1;
  assert.ok(one < 16, `a frame of 3,000 dots takes ${one.toFixed(1)} ms`);
});

test("one file: the leading fly lands on it, the other 29 melt on the way", () => {
  const p = page();
  p.field.adopt(hand(p.now()));
  p.field.feed(files(1).map(asFile));
  p.run(LEAVE_AFTER + LEAVE_SPREAD + FLY_MS + 50);
  const i = p.field.info();
  assert.equal(i.flying, 0);
  assert.equal(i.lit, 1);
});

test("a file found mid-flight: that fly changes its mind and lands on it", () => {
  const p = page();
  p.field.adopt(hand(p.now()));
  p.run(LEAVE_AFTER + 200);
  p.field.feed(files(3).map(asFile));
  p.run(LEAVE_SPREAD + FLY_MS + 50);
  assert.equal(p.field.info().lit, 3);
});

test("no shine until well after landing: the pour never twinkles", () => {
  assert.ok(SHINE_AFTER >= 1500);
  assert.ok(SHINE_AFTER > FADE_IN);
});

test("a failed save: the lights fade where they are, then the field is empty", async () => {
  const p = page();
  p.field.adopt(hand(p.now()));
  p.field.feed(files(100).map(asFile));
  p.run(2000);
  const done = p.field.fail();
  p.run(FAIL_MS + 50);
  await done;
  assert.equal(p.field.info().total, 0);
  assert.equal(p.field.info().flyers, 0);
});

test("Reduce Motion: no flight, a 300 ms cross-fade in place", () => {
  const p = page({ reduced: true });
  p.field.adopt(hand(p.now()));
  p.field.feed(files(40).map(asFile));
  p.frame();
  assert.equal(p.field.info().flying, 30, "the ring flies are still there, brightening in place");
  p.run(LEAVE_AFTER + 320);
  assert.equal(p.field.info().flying, 0);
  p.run(400);
  assert.equal(p.field.info().lit, 40);
});
