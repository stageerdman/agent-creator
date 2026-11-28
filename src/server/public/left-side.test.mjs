// The Left Side's pure helpers: Reports/left-side-magic.md §7, checks 1–11.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  gatheredFiles, flightGap, planRefresh, wholeDue, blinkAllowed, lookBack, closeFlash, showCreate, isKept, timings, blinkLevel,
  isReady, parseEvents, markSize, SIT_MS, HINT_AFTER, markGrow, dotsOf, kept,
  menuSectionOf, glowLevel, sortLeave, streamChat, GLOW_MS, TOOK_MS, SORT_GAP, STILL_BLINK,
  flightPlan, sendArcAt, answerHold, BLOOM_MS, ANSWER_MS, RISE_MS, SEND_BOW, MIN_FLIGHT,
} from './left-side.js';
import { readFileSync } from 'node:fs';
const HTML = readFileSync(new URL('./new-agent.html', import.meta.url), 'utf8');
const SRC = readFileSync(new URL('./left-side.js', import.meta.url), 'utf8');
const rule = sel => { const i = HTML.indexOf(sel + ' {'); assert.ok(i >= 0, `no rule for ${sel}`); return HTML.slice(i, HTML.indexOf('}', i)); };

/* ---- chat fireflies: Reports/chat-firefly-motion.md §2–4 ---- */
test('CF1. the send flight: none with Reduce Motion, off screen or too short; else 220–380 ms, still by 600', () => {
  const from = { x: 400, y: 700 }, to = { x: 410, y: 400 };
  assert.equal(flightPlan({ from, to, reduced: true }), null);
  assert.equal(flightPlan({ from, to, visible: false }), null);
  assert.equal(flightPlan({ from, to: { x: 410, y: 690 } }), null);   // 14 px
  assert.equal(flightPlan({ from, to: null }), null);
  for (const d of [MIN_FLIGHT, 60, 200, 300, 2000]) {
    const p = flightPlan({ from: { x: 0, y: d }, to: { x: 0, y: 0 } });
    assert.ok(p.dur >= 220 && p.dur <= 380, `d=${d}: ${p.dur}`);
    assert.equal(p.landAt, p.dur); assert.equal(p.settleAt, p.dur + BLOOM_MS); assert.ok(p.settleAt <= 600);
    assert.equal(p.bow, SEND_BOW);
  }
  assert.equal(flightPlan({ from: { x: 0, y: 200 }, to: { x: 0, y: 0 } }).dur, 320);   // 160 + .8 × 200
  assert.equal(flightPlan({ from: { x: 0, y: 10 }, to: { x: 0, y: 1000 } }).dur, 380);
});

test('CF2. the arc starts at the box, lands on the line and bows 10 px to the left at its middle', () => {
  const from = { x: 300, y: 600 }, to = { x: 300, y: 200 };
  assert.deepEqual(sendArcAt(from, to, 0), from);
  assert.deepEqual(sendArcAt(from, to, 1), to);
  const mid = sendArcAt(from, to, .5);
  assert.equal(mid.x, 300 - SEND_BOW); assert.equal(mid.y, 400);
  for (let i = 1; i < 12; i++) assert.ok(sendArcAt(from, to, i / 12).x < 300, 'always left of the straight line');
});

test('CF3. the answering flash: a short rise then eased back, a plain 320 ms step with Reduce Motion', () => {
  assert.equal(answerHold(false), RISE_MS);
  assert.equal(answerHold(true), ANSWER_MS);
  assert.ok(RISE_MS + 240 <= 400, 'back in the loop within 400 ms');
});

test('CF4. the glow belongs to #sketcher-form: rest, lit on focus (180 ms), two breaths, still with Reduce Motion', () => {
  assert.match(rule('#sketcher-form'), /box-shadow: 0 0 14px rgba\(216,242,106,\.06\)/);
  assert.match(rule('#sketcher-form'), /transition: box-shadow 280ms ease-in/);
  assert.match(rule('#sketcher-form:focus-within'), /0 0 18px rgba\(216,242,106,\.16\).*180ms ease-out/);
  assert.match(rule('#sketcher-form.breath:focus-within'), /4\.8s ease-in-out 600ms 2;/);
  assert.match(rule('#sketcher.still #sketcher-form'), /transition: none; animation: none/);
  assert.doesNotMatch(rule('#sketcher-box'), /animation/);   // the box's text and caret never change
  // Typing stops the breath; the box is never disabled, so Enter and typing are never blocked.
  assert.match(SRC, /box\.addEventListener\('input', \(\) => form\.classList\.remove\('breath'\)\)/);
  assert.doesNotMatch(SRC, /box\.disabled|box\.readOnly/);
});

test('CF5. one send path, one flying dot (removed on landing), the held lines shown in the landing frame', () => {
  assert.equal(SRC.match(/form\.addEventListener\('submit'/g).length, 1);
  assert.equal(SRC.match(/'send-fly'/g).length, 1);
  assert.match(SRC, /function land\(bloom = true\) \{[^}]*f\.dot\.remove\(\);[^}]*classList\.remove\('landing'\)/);
  assert.match(SRC, /land\(false\);\s+\/\/ only ever one dot/);
  assert.match(rule('.send-fly'), /pointer-events: none/);
  assert.match(rule('.send-fly'), /position: fixed/);
  assert.match(SRC, /dot\.setAttribute\('aria-hidden', 'true'\)/);
  assert.match(rule('#sketcher-log > .landing'), /opacity: 0/);
  assert.match(HTML, /@keyframes you-bloom \{ from \{ background: rgba\(216,242,106,\.30\); \} \}/);
  assert.match(rule('#sketcher-log > .you.bloom'), /200ms ease-out/);
});

test('CF6. the thinking dot lives on the wait line and is gone with the first words or an error', () => {
  assert.match(rule('#sketcher-log > .wait::before'), /animation: wait-glow 2\.6s ease-in-out infinite/);
  assert.match(HTML, /50% \{ opacity: \.8; box-shadow: 0 0 6px/);
  assert.match(rule('#sketcher.still #sketcher-log > .wait::before'), /animation: none; opacity: \.7/);
  assert.match(SRC, /reply\.classList\.remove\('wait', 'answer', 'settle'\)/);   // onText
  assert.match(SRC, /reply\.className = 'sketcher err'/);                         // error: no dot, no glow
  assert.match(SRC, /const reply = line\('sketcher wait', 'Sketching…'\)/);       // the words are real text
  assert.doesNotMatch(HTML, /\.err[^{]*::before/);
});

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

test('10b. a whole flash while the panel is open is held: ONE flash plays on close', () => {
  assert.equal(closeFlash({ held: true, changed: true }), true, 'held whole + changed: still one flash');
  assert.equal(closeFlash({ held: true, changed: false }), true);
  assert.equal(closeFlash({ held: false, changed: true }), true, 'the look-back');
  assert.equal(closeFlash({ held: false, changed: false }), false);
  assert.equal(closeFlash({ held: false, changed: true, reduced: true }), false);
});

test('Create shows only on the server ready flag, and never once the agent is or was created', () => {
  assert.equal(showCreate(true, false), true);
  assert.equal(showCreate(true, true), false);
  assert.equal(showCreate(false, false), false, 'no flag, no button, whatever Sketcher says');
  assert.equal(isKept({ draft: { status: 'saved' } }), true);
  assert.equal(isKept({ draft: { status: 'draft' } }), false);
  assert.equal(isKept(null), false);
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
  assert.ok(isReady('ready', { type: 'ready', ready: true }));
  assert.ok(isReady('done', { say: 'Hi', ready: true }));
  assert.ok(!isReady('done', { say: 'Hi', ready: false }));
  assert.ok(!isReady('done', { say: 'If that’s Ada, press Create.' }), 'words never bring the button');
  assert.ok(!isReady('delta', { text: 'ready', ready: true }));
  assert.ok(!isReady('ready', null));
  const store = {};
  assert.equal(kept(store, { id: 'a', draft: { status: 'draft' } }), false);
  assert.equal(kept(store, { id: 'a', draft: { status: 'saved' } }), true);
  store['left.kept.b'] = '1';
  assert.equal(kept(store, { id: 'b', draft: { status: 'draft' } }), true);
  const { events, rest } = parseEvents('event: delta\ndata: {"text":"Hi"}\n\nevent: done\ndata: {}\n\nevent: del');
  assert.deepEqual(events, [{ event: 'delta', data: { text: 'Hi' } }, { event: 'done', data: {} }]);
  assert.equal(rest, 'event: del');
});

test('F12. each sorted file names its menu section; none / missing → nowhere', () => {
  assert.equal(menuSectionOf('knowledge'), 'knowledge');
  assert.equal(menuSectionOf('transcript'), 'transcript');
  assert.equal(menuSectionOf('skill:writing'), 'skills');
  assert.equal(menuSectionOf('none'), null);
  assert.equal(menuSectionOf(undefined), null);
});

test('F13. a firefly glows from its own allocate: 0 before, lit inside GLOW_MS, out after; Reduce Motion a plain step', () => {
  assert.equal(glowLevel(-1, false), 0);
  assert.ok(glowLevel(GLOW_MS / 4, false) > 0);
  assert.equal(glowLevel(GLOW_MS, false), 0);
  assert.equal(glowLevel(10, true), 1);
  assert.equal(glowLevel(STILL_BLINK, true), 0);
  assert.ok(TOOK_MS > 0);
});

test('F12. a burst of sorted files leaves one by one, never before the glow', () => {
  const first = sortLeave(1000, -Infinity);
  assert.ok(first > 1000);
  const second = sortLeave(1000, first);
  assert.equal(second - first, SORT_GAP);
  assert.equal(sortLeave(5000, first), sortLeave(5000, -Infinity), 'a later burst is not held back by an old one');
});

test('F12/F13. streamChat: onAllocate once per allocate event, onChange on files', async () => {
  const sse = [
    ['delta', { text: 'Moving ' }], ['files', {}],
    ['allocate', { file: 'a.md', section: 'knowledge' }], ['allocate', { file: 'b.md', section: 'knowledge' }],
    ['allocate', { file: 'c.md' }], ['done', { say: 'Moving them.' }],
  ].map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join('');
  let sent;
  const fetch = async (url, init) => { sent = JSON.parse(init.body); return new Response(sse); };
  const changes = [], sorted = [];
  const say = await streamChat({ fetch, id: 'x', message: 'move outstanding files to knowledge', onChange: e => changes.push(e), onAllocate: a => sorted.push(a) });
  assert.equal(sent.message, 'move outstanding files to knowledge');
  assert.deepEqual(changes, ['files']);
  assert.deepEqual(sorted, [{ file: 'a.md', section: 'knowledge' }, { file: 'b.md', section: 'knowledge' }, { file: 'c.md', section: 'none' }]);
  assert.equal(say, 'Moving them.');
});

test('F10. streamChat: onReady once from the server flag (ready event and/or done.ready), never from words', async () => {
  const run = async events => {
    const body = events.map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join('');
    let n = 0; await streamChat({ fetch: async () => new Response(body), id: 'x', message: 'hi', onReady: () => n++ }); return n;
  };
  assert.equal(await run([['delta', { text: 'Hi' }], ['ready', { type: 'ready', ready: true }], ['done', { say: 'Hi', ready: true }]]), 1);
  assert.equal(await run([['done', { say: 'Hi', ready: true }]]), 1);
  assert.equal(await run([['done', { say: 'If that’s Ada, press Create.', ready: false }]]), 0);
  assert.equal(await run([['done', { say: 'If that’s Ada, press Create.' }]]), 0);
});
