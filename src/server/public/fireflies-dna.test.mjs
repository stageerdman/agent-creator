import test from "node:test";
import assert from "node:assert/strict";
import * as dna from "./fireflies-dna.js";
import { phaseStep, dotsFor, fills, beatsOf, makeLook, layoutOf, glowLevel, createDna, MB, PLACED, MIN_R, MAX_R } from "./fireflies-dna.js";

// A canvas that draws nothing, so createDna runs in node.
const fakeCanvas = () => { const ctx = new Proxy({}, { get: () => () => ({ addColorStop() {} }), set: () => true }); return { width: 0, height: 0, clientWidth: 56, getContext: () => ctx }; };
globalThis.document ??= { createElement: () => fakeCanvas() };

test("files added 1 s apart blink about 650 ms apart", () => {
  const [a, b] = beatsOf([{ addedAt: 1000 }, { addedAt: 2000 }]);
  const diff = b - a;
  assert.ok(Math.abs(diff - phaseStep(1000)) < 1e-9);
  for (const period of [2400, 2900, 3400]) {
    const ms = diff * period;
    assert.ok(ms > 500 && ms < 780, `${ms} ms at a ${period} ms beat`);
  }
});

test("long gaps are log-squashed and never a full beat", () => {
  const day = phaseStep(86400e3), year = phaseStep(400 * 86400e3);
  assert.ok(day > .5 && day < .7, String(day));
  assert.ok(year <= .8 && year > day);
  assert.equal(phaseStep(0), 0);
  assert.equal(phaseStep(-5), 0);
});

test("addedAt may be an ISO string or ms, and order of input doesn't matter", () => {
  const iso = beatsOf([{ addedAt: "2026-01-01T00:00:01Z" }, { addedAt: "2026-01-01T00:00:00Z" }]);
  assert.equal(iso[1], 0);
  assert.ok(iso[0] > .2);
  const ms = beatsOf([{ addedAt: Date.parse("2026-01-01T00:00:00Z") }, { addedAt: Date.parse("2026-01-01T00:00:01Z") }]);
  assert.ok(Math.abs(ms[1] - iso[0]) < 1e-9);
});

test("one dot per started MB", () => {
  assert.deepEqual([0, 1, MB, MB + 1, null].map(dotsFor), [1, 1, 1, 2, 1]);
  assert.deepEqual(fills(MB), [1]);
  assert.equal(fills(0)[0], 0);
});

test("past 60 dots, extra MB only add glow", () => {
  for (const mb of [61, 500]) {
    const logo = createDna(fakeCanvas(), { name: "Big", files: [{ id: "a/x.bin", name: "a/x.bin", sizeBytes: mb * MB, addedAt: 0, topic: "a" }] });
    const i = logo.info();
    assert.equal(i.placed, PLACED);
    assert.ok(i.glow > 0 && i.glow <= .3);
    assert.equal(i.files[0].dots, mb);
  }
  assert.equal(glowLevel(0), 0);
});

test("dot size is fixed, 2.5 to 6.0, with no way to change it", () => {
  assert.equal(MIN_R, 2.5); assert.equal(MAX_R, 6.0);
  assert.ok(!Object.keys(dna).some((k) => /size|range|radius/i.test(k) && typeof dna[k] === "function"));
  const L = layoutOf([{ slot: 0, fill: 0, topic: "a" }, { slot: 1, fill: 1, topic: "a" }], makeLook("Two"));
  const rs = [...L.pts.values()].map((p) => p.r);
  assert.deepEqual(rs, [MIN_R, MAX_R]);
});

test("files on a visit are already lit; new ones land later", () => {
  const f = (id, t) => ({ id, name: id, sizeBytes: 3 * MB, addedAt: t, topic: "t" });
  const logo = createDna(fakeCanvas(), { name: "Juniper", files: [f("a", 0)] });
  assert.equal(logo.info().placed, 3);
  logo.setFiles([f("a", 0), f("b", 1000)]);
  assert.equal(logo.info().placed, 3, "nothing lands before the next frame");
  logo.draw(performance.now() + 5000, .016, true);
  assert.equal(logo.info().placed, 6);
  logo.setFiles([f("b", 1000)]);
  assert.equal(logo.info().placed, 3, "a removed file goes at once");
});

test("an agent with no files is calm: one still dot, nothing to animate", () => {
  const logo = createDna(fakeCanvas(), { name: "Empty", files: [] });
  assert.equal(logo.draw(performance.now(), .016, false), false);
  assert.equal(logo.info().placed, 0);
});
