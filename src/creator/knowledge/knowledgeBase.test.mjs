import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../agentStore.mjs";
import { CantEmbed } from "../errors.mjs";
import { createSourceMemory } from "../sourceText/memory.mjs";
import { createFakeEmbedder } from "./fakeEmbedder.mjs";
import { createKnowledgeBase } from "./knowledgeBase.mjs";

const home = await mkdtemp(join(tmpdir(), "agent-creator-knowledge-"));
after(() => rm(home, { recursive: true, force: true }));

const store = createAgentStore({ home });
const memory = createSourceMemory({ store });
const knowledgeFile = (path, extra = {}) => ({ path, size: 1, feeds: ["rag"], text: "ok", ...extra });

// An agent whose files already have copies: { path: copy text }.
async function agentWith(copies, files = Object.keys(copies).map((path) => knowledgeFile(path))) {
  const { id } = await store.createAgent();
  await store.saveDraft(id, { files });
  for (const [path, text] of Object.entries(copies)) await store.writeText(id, `sources/${path}.txt`, text);
  return id;
}

const embedOf = async (id) => Object.fromEntries((await store.loadAgent(id)).files.map((file) => [file.path, file.embed]));

test("knowledge copies are embedded, proven by search, and retrieved by meaning", async () => {
  const id = await agentWith({
    "bread.md": "Sourdough needs a starter fed with flour and water every day.",
    "rust.md": "The borrow checker prevents data races at compile time.",
  });
  const embedder = createFakeEmbedder();
  const knowledge = createKnowledgeBase({ store, memory, embedder });

  const events = await knowledge.embedFiles(id);
  assert.deepEqual(events, [{ type: "embedded", file: "bread.md" }, { type: "embedded", file: "rust.md" }]);
  assert.deepEqual(await embedOf(id), { "bread.md": "ok", "rust.md": "ok" });

  const [best] = await knowledge.retrieve(id, "how often is the starter fed with flour");
  assert.equal(best.file, "bread.md");
  assert.match(best.text, /Sourdough/);

  assert.deepEqual(await knowledge.embedFiles(id), [], "a marked file is not embedded again");
  assert.equal(embedder.calls.passages, 2);
});

test("only used Knowledge files with a copy are embedded; an empty copy is marked no-text", async () => {
  const id = await agentWith({ "a.md": "alpha words here", "blank.md": "  \n\n " }, [
    knowledgeFile("a.md"),
    knowledgeFile("blank.md"),
    knowledgeFile("rule.md", { feeds: ["system-prompt"] }),
    knowledgeFile("pic.png", { text: "binary" }),
    knowledgeFile("old.md", { removed: true }),
  ]);
  const knowledge = createKnowledgeBase({ store, memory, embedder: createFakeEmbedder() });
  assert.deepEqual(await knowledge.embedFiles(id), [{ type: "embedded", file: "a.md" }, { type: "embed-failed", file: "blank.md", reason: "no-text" }]);
  assert.deepEqual(await embedOf(id), { "a.md": "ok", "blank.md": "no-text", "rule.md": undefined, "pic.png": undefined, "old.md": undefined });
});

test("a file its own line can't find is left out and marked not-found", async () => {
  const id = await agentWith({ "a.md": "apples and pears" });
  const lost = { ...createFakeEmbedder(), embedQuery: async () => new Array(64).fill(0) };
  const knowledge = createKnowledgeBase({ store, memory, embedder: lost });
  assert.deepEqual(await knowledge.embedFiles(id), [{ type: "embed-failed", file: "a.md", reason: "not-found" }]);
  assert.deepEqual(await createKnowledgeBase({ store, memory, embedder: createFakeEmbedder() }).retrieve(id, "apples"), []);
});

test("a model that can't run fails every file unmarked, so the next try embeds them", async () => {
  const id = await agentWith({ "a.md": "alpha", "b.md": "beta" });
  const down = createKnowledgeBase({ store, memory, embedder: createFakeEmbedder({ fail: new CantEmbed("model-unavailable") }) });
  assert.deepEqual((await down.embedFiles(id)).map((event) => [event.file, event.reason]), [["a.md", "model-unavailable"], ["b.md", "model-unavailable"]]);
  assert.deepEqual(await embedOf(id), { "a.md": undefined, "b.md": undefined });

  const up = createKnowledgeBase({ store, memory, embedder: createFakeEmbedder() });
  assert.equal((await up.embedFiles(id)).length, 2);
});

test("an unexpected embedding error bubbles up with the file and agent", async () => {
  const id = await agentWith({ "a.md": "alpha" });
  const knowledge = createKnowledgeBase({ store, memory, embedder: createFakeEmbedder({ fail: new Error("onnx broke") }) });
  await assert.rejects(knowledge.embedFiles(id), (error) => error.message.includes("a.md") && error.message.includes(id) && error.cause.message === "onnx broke");
});

test("forget drops a file's chunks; a new copy clears the mark and is embedded again", async () => {
  const id = await agentWith({ "a.md": "alpha apples", "b.md": "beta bananas" });
  const knowledge = createKnowledgeBase({ store, memory, embedder: createFakeEmbedder() });
  await knowledge.embedFiles(id);
  await knowledge.forget(id, ["a.md"]);
  const index = JSON.parse(await store.readText(id, "knowledge/index.json"));
  assert.deepEqual([...new Set(index.chunks.map((chunk) => chunk.file))], ["b.md"]);

  await memory.putSource(id, "b.md", Buffer.from("cherries now"));
  assert.equal((await embedOf(id))["b.md"], undefined);
  assert.deepEqual(await knowledge.embedFiles(id), [{ type: "embedded", file: "b.md" }]);
  assert.match((await knowledge.retrieve(id, "cherries"))[0].text, /cherries/);
  assert.equal((await knowledge.retrieve(id, "cherries")).length, 1, "the old chunk of b.md was replaced");
});

test("an agent with no embedded knowledge never touches the model", async () => {
  const id = await agentWith({});
  const embedder = createFakeEmbedder();
  assert.deepEqual(await createKnowledgeBase({ store, memory, embedder }).retrieve(id, "anything"), []);
  assert.equal(embedder.calls.queries, 0);
});

test("embeds of one agent run one after another, so none overwrites the other", async () => {
  const id = await agentWith({ "a.md": "alpha" });
  const knowledge = createKnowledgeBase({ store, memory, embedder: createFakeEmbedder() });
  const [first, second] = await Promise.all([knowledge.embedFiles(id), knowledge.embedFiles(id)]);
  assert.equal(first.length + second.length, 1);
});
