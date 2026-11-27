import { test } from "node:test";
import assert from "node:assert/strict";
import { createOrbit, makeFlies, ringPos, hitRadius, TEXT_PEAK, TEXT_REST, WAKE } from "./firefly-orbit.js";
import { MIN_R, MAX_R } from "./fireflies-dna.js";

// A canvas that draws nothing, so the orbit runs in node on a fake clock.
const ctx = new Proxy({}, { get: () => () => ({ addColorStop() {} }), set: () => true });
const fakeCanvas = () => ({ width: 0, height: 0, clientWidth: 56, style: {}, getContext: () => ctx, ownerDocument: { createElement: () => fakeCanvas() } });
globalThis.devicePixelRatio = 1;
globalThis.requestAnimationFrame ??= () => 1;
globalThis.cancelAnimationFrame ??= () => {};

function rig({ reduced = false, epoch = null, wallNow = 50000 } = {}) {
  let t = 1000;
  const text = { style: {} };
  const orbit = createOrbit({ canvas: fakeCanvas(), text, reduced, epoch, now: () => t, wall: () => wallNow, size: () => ({ W: 1440, H: 900 }) });
  const run = (ms, step = 16) => { for (let e = 0; e < ms; e += step) { t += step; orbit.step(t); } };
  orbit.step(t);
  return { orbit, run, text, at: () => t };
}
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

test("ringPos: pure; the tangent is the way the fly turns", () => {
  const f = makeFlies()[3];
  assert.deepEqual(ringPos(f, 500, 1440, 900), ringPos(f, 500, 1440, 900));
  const a = ringPos(f, 500, 1440, 900, { phase: .5 }), b = ringPos(f, 500, 1440, 900, { phase: .51 });
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
  assert.ok(dx / d * a.tx + dy / d * a.ty > .99);
  assert.ok(a.v > 0);
});

test("orbit: after the call it is simply there (no fade-in), on the same spots the call flew to", () => {
  // The call ended 0 ms ago: the first frame is the ring at tt = 0, full brightness.
  const { orbit } = rig({ epoch: 50000 });
  const flies = makeFlies(), got = orbit.info().flies;
  flies.forEach((f, i) => {
    const p = ringPos(f, 0, 1440, 900, { phase: .016 });
    assert.ok(Math.hypot(p.x - got[i].x, p.y - got[i].y) < 1.5, "fly " + i + " jumped");
    assert.ok(got[i].a >= .3, "fly " + i + " faded in");
  });
  assert.equal(orbit.info().epoch, true);
  // A direct visit (no call) still fades in.
  assert.ok(rig().orbit.info().flies.every((f) => f.a < .1));
});

test("orbit: rest is dim and turning, Select Folder readable at .24; radii stay in range", () => {
  const { orbit, run } = rig();
  run(800);
  const before = orbit.info();
  assert.equal(before.state, "rest");
  assert.equal(before.textOpacity, TEXT_REST);
  assert.ok(before.flies.every((f) => f.a <= .95));
  run(1000);
  assert.notDeepEqual(orbit.info().flies.map((f) => f.x), before.flies.map((f) => f.x));
  const all = [...radii(orbit)];
  orbit.pointer(720, 450); run(500); all.push(...radii(orbit));
  orbit.stir(); run(100); all.push(...radii(orbit));
  assert.ok(all.every((r) => r >= MIN_R && r <= MAX_R), "radius out of range");
});

test("orbit: waiting never changes by itself (speed stays 1 for 20 s)", () => {
  const { orbit, run } = rig({ epoch: 50000 });
  for (let i = 0; i < 20; i++) { run(1000, 50); assert.equal(orbit.info().m, 1); assert.equal(orbit.info().textOpacity, TEXT_REST); }
});

test("orbit: hover lifts the word to .36, 5 fireflies lean in, leaving puts it back to .24", () => {
  const still = rig({ reduced: true });
  const rest = still.orbit.info().flies.map((f) => f.a);
  still.orbit.pointer(720, 450); still.run(500);
  assert.equal(still.orbit.info().flies.filter((f, i) => f.a > rest[i] + .29).length, 5);
  const { orbit, run } = rig();
  run(700);
  orbit.pointer(720, 450); run(500);
  assert.equal(orbit.info().textOpacity, TEXT_PEAK);
  orbit.pointer(720 + 95, 450); run(50);              // inside the 12 px band: still leaning
  assert.equal(orbit.info().textOpacity, TEXT_PEAK);
  orbit.pointer(100, 100); run(700);
  assert.equal(orbit.info().textOpacity, TEXT_REST);
});

test("orbit: a drag stirs (m 1.6, no word); it ends 150 ms after the last dragover", () => {
  const { orbit, run } = rig();
  run(500);
  for (let i = 0; i < 6; i++) { orbit.stir(); run(50, 10); }
  assert.ok(Math.abs(orbit.info().m - 1.6) < .02);
  run(900);
  assert.equal(orbit.info().m, 1);
  assert.equal(orbit.info().textOpacity, TEXT_REST);
});

test("orbit: release hands over 30 live flies from where they are; they wake to .8 in 120 ms at the same speed", () => {
  const { orbit, run, at } = rig({ epoch: 50000 });
  run(2000);
  const before = orbit.info().flies;
  const hand = orbit.release();
  assert.equal(hand.flies.length, 30);
  assert.equal(orbit.busy(), true);
  assert.equal(orbit.release(), null, "a second gift is not a second signal");
  assert.deepEqual(orbit.info().flies, [], "the orbit draws nothing once the field has them");
  hand.flies.forEach((f, i) => {
    const p = hand.at(i, at());
    assert.ok(Math.hypot(p.x - before[i].x, p.y - before[i].y) < .2, "no jump at the hand-over");
    assert.ok(Math.abs(p.a - before[i].a) < .002);
    assert.equal(hand.at(i, at() + 120).a, WAKE);
  });
  // speed unchanged: the angle step over 100 ms right after the signal = the ring's own speed
  const f0 = makeFlies()[5], p1 = hand.at(5, at() + 200), p2 = hand.at(5, at() + 300);
  const step = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  assert.ok(step < f0.omega * .33 * 900 * 1.06 * .1 + 1.5, "the ring sped up");
});

test("orbit: restore after a failed save brings the ring back at rest over 600 ms", () => {
  const { orbit, run } = rig({ epoch: 50000 });
  run(500);
  orbit.release();
  orbit.restore();
  orbit.step(1000 + 516 + 1);
  assert.ok(orbit.info().flies.every((f) => f.a < .1));
  run(700);
  const i = orbit.info();
  assert.equal(i.state, "rest");
  assert.equal(i.m, 1);
  assert.ok(i.flies.every((f) => f.a >= .29 && f.a <= .95));
  assert.equal(i.textOpacity, TEXT_REST);
});

test("orbit: Reduce Motion — nothing moves, r never changes, no speed-up, the signal is brightness in place", () => {
  const { orbit, run, at } = rig({ reduced: true });
  const p0 = orbit.info().flies;
  run(1000);
  assert.deepEqual(orbit.info().flies.map((f) => [f.x, f.y, f.r]), p0.map((f) => [f.x, f.y, f.r]));
  orbit.pointer(720, 450); run(500);
  assert.equal(orbit.info().textOpacity, TEXT_PEAK);
  assert.deepEqual(orbit.info().flies.map((f) => [f.x, f.y, f.r]), p0.map((f) => [f.x, f.y, f.r]));
  orbit.stir(); run(100);
  assert.equal(orbit.info().m, 1);
  const hand = orbit.release();
  assert.equal(hand.reduced, true);
  hand.flies.forEach((f, i) => {
    const a = hand.at(i, at() + 200), b = hand.at(i, at() + 900);
    assert.deepEqual([a.x, a.y], [b.x, b.y]);
    assert.ok(Math.abs(a.x - p0[i].x) < .1 && Math.abs(a.y - p0[i].y) < .1);
    assert.equal(a.a, WAKE);
  });
});
