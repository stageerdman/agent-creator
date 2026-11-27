// The Left Side's pure helpers: Reports/left-side-magic.md §7, checks 1–11.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  gatheredFiles, flightGap, planRefresh, wholeDue, blinkAllowed, lookBack, timings, blinkLevel,
  saysReady, parseEvents, markSize, SIT_MS, HINT_AFTER, markGrow, dotsOf, kept,
} from './left-side.js';

test('M4. the likeness grows as it fills: half size at nothing, full when whole, rising at every step', () => {
  assert.equal(markGrow(0, 0), 1);
  assert.equal(markGrow(0, 40), .5);
  assert.equal(markGrow(40, 40), 1);
  assert.equal(markGrow(60, 40), 1);
  let last = 0;
  for (let c = 0; c <= 40; c++) { const f = markGrow(c, 40); assert.ok(f > last, `step ${c}`); last = f; }
  // lit area ∝ f² × the logo's own (flat to falling, ~24 → 21.7 units² from 10 to 40 dots): still rises
  assert.ok(markGrow(20, 40) ** 2 * 23.8 > markGrow(10, 40) ** 2 * 24);
  assert.ok(markGrow(40, 40) ** 2 * 21.7 > markGrow(20, 40) ** 2 * 23.8);
  assert.equal(dotsOf([]), 0);
  assert.ok(dotsOf(Array.from({ length: 200 }, () => ({ sizeBytes: 1e6 }))) <= PLACED);
});
import { createDna, PLACED } from './fireflies-dna.js';
import { wanderAt, wanderParams } from './creation-screen.js';

const fakeCanvas = () => { const ctx = new Proxy({}, { get: () => () => ({ addColorStop() {} }), set: () => true }); return { width: 0, height: 0, clientWidth: 56, getContext: () => ctx }; };
const KB = 1024;
const file = (i, state = 'unprocessed', sizeBytes = 100 * KB) => ({ id: `f/${i}.md`, name: `f/${i}.md`, sizeBytes, addedAt: 1000 + i, topic: 't' + (i % 3), state });
const files = (n, processed = 0, size) => Array.from({ length: n }, (_, i) => file(i, i < processed ? 'processed' : 'unprocessed', size));

test('1. share 0 → 0 files, one processed → at least 1, all → every live file', () => {
  assert.equal(gatheredFiles(files(10, 0)).shown, 0);
  assert.ok(gatheredFiles(files(10, 1)).shown >= 1);
  const all = files(10, 10); all.push(file(99, 'removed'));
  assert.equal(gatheredFiles(all).shown, 10);
});

test('2. processing one by one never lowers shown', () => {
  let prev = { shown: 0, live: 0 }, last = 0;
  for (let p = 0; p <= 40; p++) {
    const r = gatheredFiles(files(40, p, (p % 7 + 1) * 300 * KB), prev);
    assert.ok(r.shown >= last, `at ${p}: ${r.shown} < ${last}`);
    last = r.shown; prev = { shown: r.shown, live: r.live };
  }
  assert.equal(last, 40);
});

test('3. adding unprocessed files never lowers shown; a removal may', () => {
  const a = gatheredFiles(files(10, 5));
  const b = gatheredFiles(files(30, 5), { shown: a.shown, live: a.live });
  assert.ok(b.shown >= a.shown);
  const fewer = files(10, 5).map((f, i) => i < 4 ? { ...f, state: 'removed' } : f);
  const c = gatheredFiles(fewer, { shown: a.shown, live: a.live });
  assert.ok(c.shown <= a.shown);
});

test('4. at share 1 the prefix draws the same likeness as all files', () => {
  const all = files(25, 25, 700 * KB);
  const r = gatheredFiles(all);
  const strip = i => ({ placed: i.placed, glow: i.glow, dots: i.dots.map(d => d.fileId + d.color) });
  assert.deepEqual(strip(createDna(fakeCanvas(), { name: 'Ada', files: r.prefix }).info()), strip(createDna(fakeCanvas(), { name: 'Ada', files: all }).info()));
});

test('5. 200 files of 100 KB: 15 / 30 / 60 placed dots at 25 / 50 / 100 %', () => {
  for (const [p, want] of [[50, 15], [100, 30], [200, 60]]) {
    const r = gatheredFiles(files(200, p));
    const placed = createDna(fakeCanvas(), { name: 'Ada', files: r.prefix }).info().placed;
    assert.ok(Math.abs(placed - want) <= 1, `${p}: ${placed} ≠ ${want}`);
  }
});

test('6. flight gap clamp(8000/q,16,90); 60 flyers leave within 8 s; never more than 60', () => {
  for (const q of [1, 10, 60, 89, 500, 1000]) assert.equal(flightGap(q), Math.min(90, Math.max(16, 8000 / q)));
  const sixty = planRefresh(Array.from({ length: 60 }, (_, i) => ({ id: 'a' + i, x: i })), { t: 0 });
  assert.ok(sixty.flyers.at(-1).leave - sixty.flyers[0].leave <= 8000);
  const many = planRefresh(Array.from({ length: 300 }, (_, i) => ({ id: 'b' + i, x: i })), { t: 0 });
  assert.equal(many.flyers.length, PLACED);
  assert.equal(many.vanish.length, 240);
});

test('7. the mark answers 600 ms after the first flyer leaves, at once under Reduce Motion', () => {
  const p = planRefresh([{ id: 'x', x: 10 }, { id: 'y', x: 5 }], { t: 5000 });
  assert.equal(p.setAt - Math.min(...p.flyers.map(f => f.leave)), SIT_MS);
  assert.equal(SIT_MS, 600);
  const r = planRefresh([{ id: 'x', x: 10 }], { t: 5000, reduced: true });
  assert.equal(r.setAt, 5000);
});

test('8. the whole flash: once per agent, never on a visit that starts whole', () => {
  const s = {};
  assert.equal(wholeDue(s, 'a', { shown: 3, live: 4 }), false);
  assert.equal(wholeDue(s, 'a', { shown: 4, live: 4 }), true);
  assert.equal(wholeDue(s, 'a', { shown: 4, live: 4 }), false);
  const t = {};
  assert.equal(wholeDue(t, 'b', { shown: 4, live: 4, atStart: true }), false);
  assert.equal(wholeDue(t, 'b', { shown: 4, live: 4 }), false);
});

test('9. handle blinks: at most 2, none after an open, the second only after 25 s with 0 processed', () => {
  const s = {};
  assert.equal(blinkAllowed(s, 'a', 'second', { processed: 0, waited: HINT_AFTER }), false, 'no second before a first');
  assert.equal(blinkAllowed(s, 'a', 'first'), true);
  assert.equal(blinkAllowed(s, 'a', 'second', { processed: 1, waited: HINT_AFTER }), false);
  assert.equal(blinkAllowed(s, 'a', 'second', { processed: 0, waited: HINT_AFTER - 1 }), false);
  assert.equal(blinkAllowed(s, 'a', 'second', { processed: 0, waited: HINT_AFTER }), true);
  assert.equal(blinkAllowed(s, 'a', 'first'), false, 'two is the most');
  const o = { 'left.opened.b': '1' };
  assert.equal(blinkAllowed(o, 'b', 'first'), false);
});

test('10. the look-back fires only if the mark changed while open', () => {
  assert.equal(lookBack(true, false), true);
  assert.equal(lookBack(false, false), false);
  assert.equal(lookBack(true, true), false);
});

test('11. Reduce Motion: no flyers, dots stay home, 0 ms transitions, the blink is a plain step', () => {
  assert.equal(planRefresh([{ id: 'x', x: 1 }], { reduced: true }).flyers.length, 0);
  const area = { w: 800, h: 600, pad: 32 }, P = wanderParams('f/1.md');
  assert.deepEqual(wanderAt('f/1.md', 0, area, true, P), wanderAt('f/1.md', 7777, area, true, P));
  assert.deepEqual(Object.values(timings(true)), [0, 0, 0, 0, 0]);
  assert.ok(Object.values(timings(false)).every(v => v > 0));
  assert.equal(blinkLevel(100, true), 1);
  assert.equal(blinkLevel(5000, true), .55);
});

test('the little ones: mark size, ready words, server events', () => {
  assert.equal(markSize(2000, 2000), 240);
  assert.equal(markSize(200, 200), 140);
  assert.equal(markSize(500, 900), 200);
  assert.ok(saysReady('Ada is ready. Press Keep.'));
  assert.ok(!saysReady('Tell me more about the readers.'));
  assert.ok(!saysReady('Ready when you are. What should it read first?'));
  assert.ok(!saysReady('Is it ready? Not yet.'));
  const store = {};
  assert.equal(kept(store, { id: 'a', draft: { status: 'draft' } }), false);
  assert.equal(kept(store, { id: 'a', draft: { status: 'saved' } }), true);
  store['left.kept.b'] = '1';
  assert.equal(kept(store, { id: 'b', draft: { status: 'draft' } }), true);
  const { events, rest } = parseEvents('event: delta\ndata: {"text":"Hi"}\n\nevent: done\ndata: {}\n\nevent: del');
  assert.deepEqual(events, [{ event: 'delta', data: { text: 'Hi' } }, { event: 'done', data: {} }]);
  assert.equal(rest, 'event: del');
});
