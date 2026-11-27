import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../agentStore.mjs";
import { BadInput, NotFound } from "../errors.mjs";
import { createSourceMemory } from "../sourceText/memory.mjs";
import { createFakeEmbedder } from "./fakeEmbedder.mjs";
import { createKnowledgeBase } from "./knowledgeBase.mjs";
import { createKnowledgeBuilder } from "./knowledgeBuilder.mjs";

const home = await mkdtemp(join(tmpdir(), "agent-creator-builder-"));
after(() => rm(home, { recursive: true, force: true }));

const store = createAgentStore({ home });
// Originals on "disk": absolute path → text.
const disk = { "/drop/tea.md": "Green tea steeps two minutes in water below boiling." };
const memory = createSourceMemory({
  store,
  readOriginal: async (path) => {
    if (!(path in disk)) throw new Error(`ENOENT ${path}`);
    return Buffer.from(disk[path]);
  },
});
const knowledge = createKnowledgeBase({ store, memory, embedder: createFakeEmbedder() });
const forget = async (id, paths) => {
  await memory.forgetCopies(id, paths);
  await knowledge.forget(id, paths);
};
const builder = createKnowledgeBuilder({ store, memory, knowledge, forget, now: () => new Date("2026-11-28T10:00:00Z") });

const source = (path, extra = {}) => ({ path, size: 1, feeds: ["rag"], text: "ok", ...extra });

// An agent whose files already have copies: { path: copy text }.
async function agentWith(copies, files = Object.keys(copies).map((path) => source(path))) {
  const { id } = await store.createAgent();
  await store.saveDraft(id, { files });
  for (const [path, text] of Object.entries(copies)) await store.writeText(id, `sources/${path}.txt`, text);
  return id;
}

const fileOf = async (id, path) => (await store.loadAgent(id)).files.find((file) => file.path === path);

test("build merges the searchable sources into knowledge.md, bakes them and reports the rest", async () => {
  const id = await agentWith({ "bread.md": "Sourdough needs a starter fed every day." }, [
    source("bread.md"),
    source("pic.png", { text: "binary" }),
  ]);
  await builder.adjustSource(id, "bread.md", { title: "Bread", note: "From grandma." });

  const result = await builder.build(id);
  assert.deepEqual(result.built, ["bread.md"]);
  assert.deepEqual(result.skipped, [{ path: "pic.png", reason: "binary" }]);
  assert.deepEqual(result.embeds, [{ type: "embedded", file: "bread.md" }]);
  assert.equal(result.text, "## Bread\n\n_Source: bread.md_\n\n> From grandma.\n\nSourdough needs a starter fed every day.\n");
  assert.equal(await store.readText(id, "knowledge.md"), result.text);
  assert.deepEqual(result.sources.map((s) => [s.path, s.state]), [["bread.md", "processed"], ["pic.png", "unprocessed"]]);
  assert.ok(result.dna, "answers with dna");
});

test("adjust: labels and an edited copy dim the source until the next build re-embeds it", async () => {
  const id = await agentWith({ "a.md": "alpha words here" });
  await builder.build(id);

  const { source: adjusted } = await builder.adjustSource(id, "a.md", { title: "Alpha", text: "beta words now" });
  assert.equal(adjusted.title, "Alpha");
  assert.equal(adjusted.state, "unprocessed", "changed since the build");
  assert.equal(adjusted.embed, null, "the old embedding is stale");
  assert.equal(await memory.readCopy(id, "a.md"), "beta words now");

  const rebuilt = await builder.build(id);
  assert.deepEqual(rebuilt.embeds, [{ type: "embedded", file: "a.md" }]);
  assert.match(rebuilt.text, /^## Alpha[\s\S]*beta words now/);
});

test("adjust refuses nothing to change, a blank text (saving nothing) and a non-source", async () => {
  const id = await agentWith({ "a.md": "alpha" }, [source("a.md"), source("rule.md", { feeds: ["system-prompt"] })]);
  await assert.rejects(builder.adjustSource(id, "a.md", {}), BadInput);
  await assert.rejects(builder.adjustSource(id, "a.md", { title: "T", text: "  " }), BadInput);
  assert.equal((await fileOf(id, "a.md")).title, undefined);
  await assert.rejects(builder.adjustSource(id, "rule.md", { title: "T" }), NotFound);
});

test("remove takes a source out of Knowledge: unsearchable at once, red until build, file kept", async () => {
  const id = await agentWith({ "a.md": "alpha words here" });
  await builder.build(id);

  const { sources } = await builder.removeSource(id, "a.md");
  assert.deepEqual(sources.map((s) => [s.path, s.state]), [["a.md", "removed"]]);
  assert.deepEqual(await knowledge.retrieve(id, "alpha words"), []);

  const rebuilt = await builder.build(id);
  assert.deepEqual(rebuilt.sources, []);
  assert.equal(rebuilt.text, "");
  assert.ok(await fileOf(id, "a.md"), "still in the agent's list");
});

test("swap: the new file takes the old one's place and labels, gets a copy; the old one leaves", async () => {
  const id = await agentWith({ "coffee.md": "Espresso is pressed hot." }, [source("coffee.md"), source("milk.md")]);
  await builder.adjustSource(id, "coffee.md", { title: "Drinks" });
  await builder.build(id);

  const { sources } = await builder.swapSource(id, "coffee.md", { path: "tea.md", size: 9, source: "/drop/tea.md" });
  assert.deepEqual(sources.map((s) => [s.path, s.title, s.text]), [["tea.md", "Drinks", "ok"], ["coffee.md", null, "ok"], ["milk.md", null, "ok"]]);
  assert.equal(sources[1].state, "removed", "baked, so red until build");
  assert.deepEqual(await knowledge.retrieve(id, "espresso pressed"), []);

  const rebuilt = await builder.build(id);
  assert.match(rebuilt.text, /## Drinks\n\n_Source: tea.md_/);
  assert.doesNotMatch(rebuilt.text, /Espresso/);
});

test("build drops a removed file baked nowhere else, copy and all", async () => {
  const id = await agentWith({ "old.md": "old text" }, [source("old.md", { removed: true, baked: ["rag"] })]);
  const result = await builder.build(id);
  assert.deepEqual(result.built, []);
  assert.equal(await fileOf(id, "old.md"), undefined);
  assert.equal(await memory.readCopy(id, "old.md"), "");
});
