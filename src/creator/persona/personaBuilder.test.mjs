import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../agentStore.mjs";
import { emptyDraft } from "../draft.mjs";
import { BadInput, BadOutput } from "../errors.mjs";
import { createSourceMemory } from "../sourceText/memory.mjs";
import { buildTalkPrompt } from "../talkPrompt.mjs";
import { createPersonaBuilder } from "./personaBuilder.mjs";

const home = await mkdtemp(join(tmpdir(), "agent-creator-persona-"));
after(() => rm(home, { recursive: true, force: true }));

const store = createAgentStore({ home });
const memory = createSourceMemory({ store, readOriginal: async (path) => { throw new Error(`ENOENT ${path}`); } });
const forgotten = [];
const forget = async (id, paths) => forgotten.push(...paths);

const engineSaying = (text) => {
  const seen = [];
  return { seen, askAgent: async (input, { onDelta }) => (seen.push(input), onDelta(text), { text, sessionId: "s" }) };
};
const builderWith = (engine, cap) => createPersonaBuilder({ store, engine, memory, forget, cap });

const source = (path, extra = {}) => ({ path, size: 1, feeds: ["instructions"], text: "ok", ...extra });

async function agentWith(copies, files, record = {}) {
  const { id } = await store.createAgent();
  await store.saveDraft(id, { files, ...record });
  for (const [path, text] of Object.entries(copies)) await store.writeText(id, `sources/${path}.txt`, text);
  return id;
}

const ANSWER = 'Wrote Ada from her letters. <persona>{"name": "Ada", "persona": "You are Ada.", "instructions": "Explain engines.", "context": "## Life\\nBorn 1815."}</persona>';

test("buildPersona writes the draft and context.md, bakes the sources used, reports the rest", async () => {
  const id = await agentWith({ "letters.md": "Dear Charles, the engine…" }, [source("letters.md"), source("pic.png", { text: "binary" }), source("kb.md", { feeds: ["rag"] })]);
  const engine = engineSaying(ANSWER);
  const said = [];

  const result = await builderWith(engine).buildPersona(id, { onSay: (text) => said.push(text) });

  assert.match(engine.seen[0].message, /<source name="letters.md">\nDear Charles/);
  assert.doesNotMatch(engine.seen[0].message, /kb.md/);
  assert.equal(result.say, "Wrote Ada from her letters.");
  assert.equal(said.join(""), "Wrote Ada from her letters. ");
  assert.deepEqual(result.changed, ["name", "persona", "instructions"]);
  assert.equal(result.draft.name, "Ada");
  assert.equal(result.context, "## Life\nBorn 1815.");
  assert.equal(await store.readText(id, "context.md"), result.context);
  assert.deepEqual(result.used, ["letters.md"]);
  assert.deepEqual(result.skipped, [{ path: "pic.png", reason: "binary" }]);
  assert.deepEqual(result.cut, []);
  const files = (await store.loadAgent(id)).files;
  assert.deepEqual(files.find((file) => file.path === "letters.md").baked, ["instructions"]);
  assert.deepEqual((await builderWith(engine).getContext(id)), { text: result.context });
});

test("buildPersona keeps a hand-edited field and cuts a source past the cap", async () => {
  const id = await agentWith({ "a.md": "x".repeat(50) }, [source("a.md")], {
    draft: { ...emptyDraft(), name: "Mine" }, handEdited: ["name"],
  });
  const result = await builderWith(engineSaying(ANSWER), 20).buildPersona(id);
  assert.equal(result.draft.name, "Mine");
  assert.deepEqual(result.kept, ["name"]);
  assert.deepEqual(result.changed, ["persona", "instructions"]);
  assert.deepEqual(result.cut, ["a.md"]);
  assert.deepEqual((await store.loadAgent(id)).handEdited, ["name"]);
});

test("buildPersona: no usable source is BadInput, before any engine call", async () => {
  const id = await agentWith({}, [source("pic.png", { text: "binary" })]);
  const engine = engineSaying(ANSWER);
  await assert.rejects(builderWith(engine).buildPersona(id), BadInput);
  assert.equal(engine.seen.length, 0);
});

test("buildPersona: an answer without a block saves nothing", async () => {
  const id = await agentWith({ "a.md": "text" }, [source("a.md")]);
  await assert.rejects(builderWith(engineSaying("Sorry, no.")).buildPersona(id), BadOutput);
  const record = await store.loadAgent(id);
  assert.equal(record.draft.name, "");
  assert.equal(await store.readText(id, "context.md"), "");
  assert.deepEqual(record.files[0].baked ?? [], []);
});

test("talk prompt puts the background right after the identity", () => {
  const prompt = buildTalkPrompt({ systemPrompt: "You are Ada.", draft: emptyDraft(), context: "Born 1815.\n" });
  assert.equal(prompt, "You are Ada.\n\n<background>\nBorn 1815.\n</background>");
});
