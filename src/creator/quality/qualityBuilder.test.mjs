import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../agentStore.mjs";
import { emptyDraft } from "../draft.mjs";
import { BadInput, BadOutput } from "../errors.mjs";
import { createSourceMemory } from "../sourceText/memory.mjs";
import { createQualityBuilder, samplePieceOf } from "./qualityBuilder.mjs";
import { buildPersonaRatingPrompt } from "./personaRatingPrompt.mjs";

const home = await mkdtemp(join(tmpdir(), "agent-creator-quality-"));
after(() => rm(home, { recursive: true, force: true }));

const store = createAgentStore({ home });
const memory = createSourceMemory({ store, readOriginal: async (path) => { throw new Error(`ENOENT ${path}`); } });

const RATING = '<personaRating>{"missingBeliefs": ["Hates debt"], "beliefs": {"score": 20, "reason": "b"}, "voice": {"score": 20, "reason": "v"}, "work": {"score": 20, "reason": "w"}, "honesty": {"score": 15, "reason": "h"}, "unsupported": []}</personaRating>';
const namesIn = (message) => [...message.matchAll(/<file name="([^"]+)"/g)].map((match) => match[1]);
const scoring = (names) => `Scored. <usefulness>${JSON.stringify({ files: names.map((name) => ({ name, score: 80, reason: `fits ${name}` })) })}</usefulness>`;

// Answers every call well, unless `bad(input)` says this one is garbage.
function fakeEngine({ bad = () => false } = {}) {
  const seen = [];
  const answerTo = (input) => {
    if (bad(input)) return "Sorry, no.";
    return input.systemPrompt === buildPersonaRatingPrompt() ? `Rated. ${RATING}` : scoring(namesIn(input.message));
  };
  return { seen, askAgent: async (input) => (seen.push(input), { text: answerTo(input), sessionId: "s" }) };
}
const isPersonaCall = (input) => input.systemPrompt === buildPersonaRatingPrompt();
const builderWith = (engine) => createQualityBuilder({ store, engine, memory, now: () => new Date("2026-11-28T10:00:00Z") });

const source = (path, feeds, extra = {}) => ({ path, size: 1, feeds, text: "ok", ...extra });

async function agentWith(copies, files, draft = emptyDraft()) {
  const { id } = await store.createAgent();
  await store.saveDraft(id, { files, draft });
  for (const [path, text] of Object.entries(copies)) await store.writeText(id, `sources/${path}.txt`, text);
  return id;
}

test("samplePieceOf: the persona samples share one budget, within 200–2000 characters each", () => {
  assert.equal(samplePieceOf(1), 2000);
  assert.equal(samplePieceOf(20), 1000);
  assert.equal(samplePieceOf(500), 200);
});

test("buildQuality scores every file once, then only the file whose copy changed", async () => {
  const id = await agentWith({ "a.md": "Alpha text.", "b.md": "Beta text." }, [
    source("a.md", ["rag"]), source("b.md", ["rag"]), source("pic.png", ["rag"], { text: "binary" }),
  ], { ...emptyDraft(), name: "Tax helper" });
  const engine = fakeEngine();
  const builder = builderWith(engine);
  const progress = [];

  const report = await builder.buildQuality(id, { onProgress: (step) => progress.push(step) });

  assert.equal(engine.seen.length, 1);
  assert.deepEqual(progress, [{ done: 0, total: 1 }, { done: 1, total: 1 }]);
  const [a, b, pic] = report.files;
  assert.deepEqual(a.usefulness, { score: 80, reason: "fits a.md", stale: false });
  assert.ok(b.structure.score >= 0);
  assert.deepEqual(pic, { path: "pic.png", role: "knowledge", state: pic.state, structure: null, usefulness: null, noCopy: "binary" });
  assert.equal(report.persona, null);
  assert.equal(report.stale, false);
  assert.equal(report.builtAt, "2026-11-28T10:00:00.000Z");
  assert.deepEqual(await builder.getQuality(id), report);

  await builder.buildQuality(id);
  assert.equal(engine.seen.length, 1, "nothing changed: no call");

  await store.writeText(id, "sources/b.md.txt", "Beta text, longer now.");
  const before = await builder.getQuality(id);
  assert.deepEqual(before.files.map((file) => file.usefulness?.stale), [false, true, undefined]);
  assert.equal(before.stale, true);
  await builder.buildQuality(id);
  assert.deepEqual(namesIn(engine.seen[1].message), ["b.md"]);
});

test("buildQuality rates the persona in its own call; a changed background makes the rating stale", async () => {
  const draft = { ...emptyDraft(), name: "Ada", persona: "A careful engineer." };
  const id = await agentWith({ "bio.md": "I build engines." }, [source("bio.md", ["instructions"])], draft);
  await store.writeText(id, "context.md", "Born in London.");
  const engine = fakeEngine();
  const builder = builderWith(engine);

  const report = await builder.buildQuality(id);

  assert.equal(engine.seen.filter(isPersonaCall).length, 1);
  assert.match(engine.seen.find(isPersonaCall).message, /<sample name="bio.md">\nI build engines.[\s\S]*<background>\nBorn in London./);
  assert.equal(report.persona.score, 75);
  assert.deepEqual(report.persona.missingBeliefs, ["Hates debt"]);
  assert.equal(report.persona.stale, false);
  assert.equal("fingerprint" in report.persona, false);

  await store.writeText(id, "context.md", "Born in Paris.");
  assert.equal((await builder.getQuality(id)).persona.stale, true);
  await builder.buildQuality(id);
  assert.equal(engine.seen.length, 3, "only the persona is rated again");
  assert.ok(isPersonaCall(engine.seen[2]));
});

test("buildQuality: no usable source is BadInput, before any engine call", async () => {
  const id = await agentWith({}, [source("pic.png", ["rag"], { text: "binary" })]);
  const engine = fakeEngine();
  await assert.rejects(builderWith(engine).buildQuality(id), BadInput);
  assert.equal(engine.seen.length, 0);
});

test("buildQuality: no usable answer at all saves nothing; one bad batch keeps the rest", async () => {
  const id = await agentWith({ "a.md": "text" }, [source("a.md", ["rag"])]);
  await assert.rejects(builderWith(fakeEngine({ bad: () => true })).buildQuality(id), BadOutput);
  assert.equal(await store.readText(id, "quality.json"), "");

  const paths = Array.from({ length: 11 }, (_, index) => `f${String(index).padStart(2, "0")}.md`);
  const many = await agentWith(Object.fromEntries(paths.map((path) => [path, `About ${path}.`])), paths.map((path) => source(path, ["rag"])));
  const firstBatchBad = fakeEngine({ bad: (input) => namesIn(input.message).length === 10 });
  const report = await builderWith(firstBatchBad).buildQuality(many);
  assert.equal(firstBatchBad.seen.length, 2);
  assert.equal(report.progress.scored, 1);
  assert.equal(report.files.filter((file) => file.usefulness).length, 1);
  assert.equal(report.stale, true);
});
