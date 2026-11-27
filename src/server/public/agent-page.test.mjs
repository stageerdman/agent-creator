// The agent page's pure rules: design/agent-page.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileLevels, dnaSections, usedLine, editHref, canTalk, streamTalk } from './agent-page.js';

test('G1. three words: skills with files are Good at; Knowledge and empty skills are Medium', () => {
  const lv = profileLevels({
    skills: [{ name: 'Tax returns', fileCount: 3 }, { name: 'Invoices', fileCount: 0 }],
    knowledge: [{ name: 'a.pdf', path: 'law/a.pdf' }, { name: 'b.pdf', path: 'law/b.pdf' }, { name: 'c.txt', path: 'c.txt' }, { name: 'gone', path: 'x/gone', state: 'removed' }],
  });
  assert.deepEqual(lv.good, ['Tax returns']);
  assert.deepEqual(lv.medium, ['law', 'c.txt', 'Invoices']);
  assert.equal(lv.not, 'Anything outside these');
  assert.deepEqual(profileLevels().good, []);
});

test('G2. DNA in order: instructions, made from, RAG files, quality', () => {
  const ds = dnaSections({
    instructions: '  Be kind.  ',
    dna: [{ name: 'a', state: 'processed' }, { name: 'b', state: 'processing' }, { name: 'c', state: 'removed' }],
    knowledge: [{ name: 'k.pdf' }],
  });
  assert.deepEqual(Object.keys(ds), ['instructions', 'madeFrom', 'rag', 'quality']);
  assert.equal(ds.instructions, 'Be kind.');
  assert.deepEqual(ds.madeFrom, ['a', 'b']);
  assert.deepEqual(ds.rag, ['k.pdf']);
  assert.equal(ds.quality, '1 of 2 files learned');
  assert.equal(dnaSections({ dna: [{ name: 'a', state: 'processed' }] }).quality, '1 of 1 file learned');
  assert.equal(dnaSections().quality, 'No files yet');
});

test('F14. the used line names each thing once, and is empty when nothing was used', () => {
  assert.equal(usedLine([{ kind: 'skill', name: 'Tax' }, { kind: 'file', name: 'a.pdf' }, { kind: 'file', name: 'a.pdf' }]), 'Used · Tax, a.pdf');
  assert.equal(usedLine([]), '');
  assert.equal(usedLine(undefined), '');
});

test('C9. edit goes back to the build screen; G4. only a created agent talks', () => {
  assert.equal(editHref('a b'), '/new?agent=a%20b');
  assert.equal(canTalk({ draft: { status: 'saved' } }), true);
  assert.equal(canTalk({ draft: { status: 'draft' } }), false);
  assert.equal(canTalk(null), false);
});

const sse = s => async () => new Response(s, { status: 200 });

test('G4. streamTalk reads deltas, then done with used', async () => {
  const seen = [];
  const out = await streamTalk({
    fetch: sse('event: delta\ndata: {"text":"Hi "}\n\nevent: delta\ndata: {"text":"**there**"}\n\nevent: done\ndata: {"say":"Hi **there**","used":[{"kind":"file","name":"a.pdf"}]}\n\n'),
    id: 'x', message: 'hello', onText: t => seen.push(t),
  });
  assert.equal(out.say, 'Hi **there**');
  assert.deepEqual(out.used, [{ kind: 'file', name: 'a.pdf' }]);
  assert.deepEqual(seen, ['Hi ', 'Hi **there**']);
});

test('G4. streamTalk throws on error, bad status and an empty answer', async () => {
  await assert.rejects(streamTalk({ fetch: sse('event: error\ndata: {"error":"boom"}\n\n'), id: 'x', message: 'm' }), /boom/);
  await assert.rejects(streamTalk({ fetch: async () => new Response('', { status: 500 }), id: 'x', message: 'm' }), /500/);
  await assert.rejects(streamTalk({ fetch: sse('event: done\ndata: {}\n\n'), id: 'x', message: 'm' }), /empty/);
});
