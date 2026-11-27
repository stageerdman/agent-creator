// The real local model, end to end through the knowledge base. Downloads
// the model (~90 MB) on first run, so it only runs with CLAUDE_LIVE=1
// (`npm run test:live`) or EMBED_LIVE=1. Model folder: KNOWLEDGE_MODEL_DIR,
// else `<home>/models`.

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore, defaultHome } from "../agentStore.mjs";
import { createSourceMemory } from "../sourceText/memory.mjs";
import { createEmbedder } from "./embedder.mjs";
import { createKnowledgeBase } from "./knowledgeBase.mjs";

const live = process.env.CLAUDE_LIVE === "1" || process.env.EMBED_LIVE === "1";
const home = await mkdtemp(join(tmpdir(), "agent-creator-embed-live-"));
after(() => rm(home, { recursive: true, force: true }));

test("the real model embeds knowledge files and finds the right passage", { skip: !live && "set EMBED_LIVE=1" }, async () => {
  const store = createAgentStore({ home });
  const embedder = createEmbedder({ cacheDir: process.env.KNOWLEDGE_MODEL_DIR || join(defaultHome(), "models") });
  const knowledge = createKnowledgeBase({ store, memory: createSourceMemory({ store }), embedder });
  const { id } = await store.createAgent();
  const copies = {
    "life.md": "Tony believes that the quality of your life is the quality of your emotions.",
    "bread.md": "Sourdough needs a starter fed with flour and water every day.",
    "rust.md": "The Rust borrow checker prevents data races at compile time.",
  };
  await store.saveDraft(id, { files: Object.keys(copies).map((path) => ({ path, size: 1, feeds: ["rag"], text: "ok" })) });
  for (const [path, text] of Object.entries(copies)) await store.writeText(id, `sources/${path}.txt`, text);

  assert.deepEqual((await knowledge.embedFiles(id)).map((event) => event.type), ["embedded", "embedded", "embedded"]);
  const [best] = await knowledge.retrieve(id, "what does he say about emotions and life");
  assert.equal(best.file, "life.md");
  assert.equal(embedder.dims, JSON.parse(await store.readText(id, "knowledge/index.json")).chunks[0].vector.length);
});
