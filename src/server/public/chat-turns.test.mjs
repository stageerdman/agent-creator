// The in-chat Create card, Esc to stop and typing while Sketcher thinks
// (Reports/create-card-esc-queue-behaviours.md). Pure helpers, plus checks on the page's wiring.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { streamChat, stopTurns, escAction, cardLine, giveBack, showCreate } from './left-side.js';
const HTML = readFileSync(new URL('./new-agent.html', import.meta.url), 'utf8');
const SRC = readFileSync(new URL('./left-side.js', import.meta.url), 'utf8');
const sse = events => events.map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join('');
const fnBody = name => { const i = SRC.indexOf(`function ${name}(`); assert.ok(i >= 0, `no ${name}`); return SRC.slice(i, SRC.indexOf('\n  }\n', i)); };

test('T1. no standalone Create button anywhere: Create lives only in the chat card', () => {
  assert.doesNotMatch(HTML, /sketcher-create/);
  assert.doesNotMatch(SRC, /sketcher-create|create\.hidden|create\.addEventListener/);
  assert.doesNotMatch(HTML, /<button[^>]*>\s*(Create|Keep)\s*</, 'no Create or Keep button in the page markup');
  assert.equal(SRC.match(/b\.textContent = 'Create'/g).length, 2, 'the card button, and its reset after a failed create');
  assert.equal(SRC.match(/\/save`/g).length, 1, 'one way to create');
});

test('T2. the card comes only from the server ready flag, after the answer, never once kept', async () => {
  const run = async events => { let ready = false; await streamChat({ fetch: async () => new Response(sse(events)), id: 'x', message: 'hi', onReady: () => { ready = true; } }); return ready; };
  assert.equal(await run([['delta', { text: 'Shall I create her?' }], ['ready', { type: 'ready', ready: true }], ['done', { say: 'Shall I create her?', ready: true }]]), true);
  assert.equal(await run([['done', { say: 'Shall I create her? Press Create.', ready: false }]]), false, 'words never bring a card');
  assert.equal(showCreate(true, true), false);
  // In the page: offerCreate is called only after the stream ended, and only behind showCreate.
  assert.equal(SRC.match(/offerCreate\(/g).length, 2, 'defined once, called once');
  // ...and after the fresh agent is pulled, so the card names the agent as this turn left it.
  assert.match(SRC, /await streamChat\([^\n]*\);\n\s+if \(showCreate\(ready, wasKept\)\) \{ await pull\(\); offerCreate\(t\.reply\); \}/);
  // Only the newest card is live; kept → every card goes quiet (also on a DNA refresh that says kept).
  assert.match(fnBody('offerCreate'), /^function offerCreate\(after\) \{\n\s+quietCards\(\);/);
  assert.match(fnBody('offerCreate'), /after\.after\(card\)/, 'right under the AI message that asks');
  assert.match(fnBody('keep'), /wasKept = true; store\['left\.kept\.' \+ id\] = '1'; quietCards\(\);/);
  assert.match(fnBody('keep'), /if \(b\.disabled\) return;/, 'one click, one request');
  assert.match(SRC, /store\['left\.kept\.' \+ id\] = '1'; quietCards\(\); \}/);
});

test('T3. the card line: short, names the agent, never blank', () => {
  assert.equal(cardLine('Ada'), 'Ready to create Ada?');
  assert.equal(cardLine(''), 'Ready to create this agent?');
  assert.equal(cardLine('  '), 'Ready to create this agent?');
  assert.equal(cardLine(undefined), 'Ready to create this agent?');
});

test('T4. typing while Sketcher thinks: the box is never locked; a queued line waits until its turn starts', async () => {
  assert.doesNotMatch(SRC, /\bbusy\b/);
  assert.doesNotMatch(SRC, /box\.disabled|box\.readOnly|form\.inert|aria-busy/);
  let queued = 0; const texts = [];
  const say = await streamChat({ fetch: async () => new Response(sse([['queued', {}], ['delta', { text: 'Next.' }], ['done', { say: 'Next.' }]])), id: 'x', message: 'and one more', onQueued: () => queued++, onText: t => texts.push(t) });
  assert.equal(queued, 1); assert.deepEqual(texts, ['Next.']); assert.equal(say, 'Next.');
  // In the page: a send while a turn runs is dim ('queued'); begin() clears it (first words, or the turn ahead ends).
  assert.match(SRC, /if \(turns\.length === 1\) begin\(t\); else mine\.classList\.add\('queued'\);/);
  assert.match(SRC, /const onQueued = \(\) => \{ if \(!t\.reply\) mine\.classList\.add\('queued'\); \};/);
  assert.match(fnBody('begin'), /t\.mine\.classList\.remove\('queued'\)/);
  assert.match(fnBody('finish'), /if \(turns\[0\]\) begin\(turns\[0\]\)/);
  assert.match(HTML, /#sketcher-log > \.you\.queued, #sketcher-log > \.you\.unsent \{ opacity: \.55; \}/);
});

test('T5. Esc: stop while a turn runs or waits, close when idle, nothing when the panel is shut', async () => {
  assert.equal(escAction({ open: true, running: true }), 'stop');
  assert.equal(escAction({ open: true, running: false }), 'close');
  assert.equal(escAction({ open: false, running: true }), null);
  assert.equal(escAction(), null);
  let call;
  const fetch = async (url, init) => { call = { url, method: init.method }; return new Response(JSON.stringify({ stopped: 2 })); };
  assert.equal(await stopTurns({ fetch, id: 'a b' }), 2);
  assert.deepEqual(call, { url: '/api/agents/a%20b/stop', method: 'POST' });
  assert.equal(await stopTurns({ fetch: async () => new Response('{"stopped":0}'), id: 'x' }), 0);
  await assert.rejects(stopTurns({ fetch: async () => new Response('{}', { status: 404 }), id: 'x' }));
  assert.match(SRC, /const act = escAction\(\{ open, running: turns\.length > 0 \}\); if \(!act\) return;/);
  assert.match(SRC, /if \(act === 'stop'\) stop\(\); else closePanel\(\);/);
  assert.equal(SRC.match(/await stopTurns\(\{/g).length, 1, 'one way to stop');
  assert.equal(SRC.match(/\/stop`/g).length, 1);
});

test('T6. a stopped turn reads calmly: kind cancelled → a quiet "Stopped" note, no dot, never red', async () => {
  const err = await streamChat({ fetch: async () => new Response(sse([['delta', { text: 'As a corporate' }], ['error', { kind: 'cancelled', message: 'killed' }]])), id: 'x', message: 'hi' }).catch(e => e);
  assert.equal(err.kind, 'cancelled');
  const other = await streamChat({ fetch: async () => new Response(sse([['error', { kind: 'internal' }]])), id: 'x', message: 'hi' }).catch(e => e);
  assert.equal(other.kind, 'internal');
  assert.match(SRC, /if \(err && err\.kind === 'cancelled'\) stopped\(t\);/);
  const body = fnBody('stopped');
  assert.match(body, /line\('note', 'Stopped'/);
  assert.match(body, /classList\.remove\('wait', 'answer', 'settle'\)/, 'the thinking dot goes');
  assert.doesNotMatch(body, /err/, 'not an error');
  assert.match(body, /box\.value = giveBack\(box\.value, \[t\.message\]\)/, 'words that never ran go back in the box');
  assert.doesNotMatch(HTML, /\.note[^{]*\{[^}]*#FF6B5E/);
});

test('T7. words never get lost: they go back after what is in the box, one per line', () => {
  assert.equal(giveBack('', ['she hates small talk']), 'she hates small talk');
  assert.equal(giveBack('half typed', ['one', 'two']), 'half typed\none\ntwo');
  assert.equal(giveBack('trailing  \n', ['x']), 'trailing\nx');
});
