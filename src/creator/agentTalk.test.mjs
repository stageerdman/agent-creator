import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "./agentStore.mjs";
import { createAgents } from "./agents.mjs";
import { saysReady, splitReply } from "./creatorReply.mjs";
import { agentIdentity, buildTalkPrompt, usedOf } from "./talkPrompt.mjs";
import { createFakeEmbedder } from "./knowledge/fakeEmbedder.mjs";

const home = await mkdtemp(join(tmpdir(), "agent-creator-talk-"));
after(() => rm(home, { recursive: true, force: true }));

// An engine that records the prompt and answers with a fixed reply.
const echoEngine = (reply) => {
  const seen = [];
  return { seen, askAgent: async (input) => (seen.push(input), { text: reply, sessionId: "s" }) };
};

test("saysReady trusts only a real true in the block, never the words", () => {
  assert.equal(saysReady(splitReply('Done. <draft>{"ready":true}</draft>').patch), true);
  assert.equal(saysReady(splitReply('<draft>{"ready":"true"}</draft>').patch), false);
  assert.equal(saysReady(splitReply("It is ready, press Keep.").patch), false);
});

test("agentIdentity: the written system prompt, else persona and instructions", () => {
  assert.equal(agentIdentity({ systemPrompt: " Be brief. ", draft: { persona: "x", instructions: "y" } }), "Be brief.");
  assert.equal(agentIdentity({ systemPrompt: "", draft: { persona: "Calm.", instructions: " " } }), "Calm.");
});

test("buildTalkPrompt numbers retrieved passages by file; usedOf accepts their file names", () => {
  const excerpts = [{ file: "a.md", text: "one " }, { file: "b.md", text: "two" }];
  const prompt = buildTalkPrompt({ systemPrompt: "Be.", draft: {}, excerpts });
  assert.match(prompt, /<knowledge>\n.*\n\n\[1\] \(from a\.md\)\none\n\n\[2\] \(from b\.md\)\ntwo\n<\/knowledge>/);
  assert.match(prompt, /<used>/, "the used rule comes with passages alone");
  assert.equal(buildTalkPrompt({ systemPrompt: "Be.", draft: {} }), "Be.");
  assert.deepEqual(usedOf({ files: ["b.md", "x.md"] }, { excerpts }), [{ kind: "file", name: "b.md" }]);
});

test("talk reads the kept copies of knowledge and skill files; no copy, unrouted or removed ones are left out", async () => {
  const store = createAgentStore({ home });
  const { id } = await store.createAgent();
  await store.saveDraft(id, {
    files: [
      { path: "a.md", feeds: ["rag"], text: "ok" },
      { path: "b.bin", feeds: ["rag"], text: "binary" },
      { path: "lost.md", feeds: ["skill:k1"], text: "ok" }, // its copy was never written
      { path: "big.md", feeds: ["skill:k1"], text: "ok" },
      { path: "rules.md", feeds: ["instructions"], text: "ok" },
      { path: "old.md", feeds: ["rag"], text: "ok", removed: true },
    ],
  });
  for (const [path, text] of [["a.md", "alpha"], ["big.md", "z".repeat(150_000)], ["rules.md", "r"], ["old.md", "o"]]) {
    await store.writeText(id, `sources/${path}.txt`, text);
  }
  await store.writeText(id, "knowledge.md", "## a.md\n\nmerged alpha");
  await store.markSaved(id); // only a created agent talks
  const engine = echoEngine("Hi.");
  const agents = createAgents({ store, engine, embedder: createFakeEmbedder(), readOriginal: () => assert.fail("talk never reads an original") });
  await agents.embedKnowledge(id);
  assert.deepEqual(await agents.talk(id, "alpha"), { say: "Hi.", used: [] });
  const prompt = engine.seen[0].systemPrompt;
  assert.match(prompt, /<knowledge>[\s\S]*\[1\] \(from a\.md\)\nalpha/, "knowledge comes as a retrieved passage");
  assert.ok(!prompt.includes('<file name="a.md">'), "knowledge is never inlined whole");
  assert.match(prompt, /<file name="big\.md">\nz{100000}\n<\/file>/, "skill copies are cut to the per-file cap");
  assert.ok(!prompt.includes("merged alpha"), "the built knowledge.md would repeat the passages");
  for (const name of ["b.bin", "lost.md", "rules.md", "old.md"]) assert.ok(!prompt.includes(name), name);
  assert.equal(engine.seen[0].resumeSessionId, undefined, "a talk is never resumed");
});

test("a file dropped into knowledge still answers after its original is gone", async () => {
  const store = createAgentStore({ home });
  const { id } = await store.createAgent();
  const originals = new Map([["/u/notes.md", Buffer.from("the moon is cheese")]]);
  const readOriginal = async (path) => originals.get(path) ?? Promise.reject(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
  const engine = echoEngine("Cheese.");
  const agents = createAgents({ store, engine, embedder: createFakeEmbedder(), readOriginal });
  const { section } = await agents.assign(id, "knowledge", [{ path: "notes.md", size: 18, source: "/u/notes.md" }]);
  assert.equal(section[0].text, "ok");
  originals.clear(); // the user moved or deleted it
  assert.deepEqual(await agents.embedKnowledge(id), [{ type: "embedded", file: "notes.md" }]);
  await agents.keep(id);
  await agents.talk(id, "what is the moon?");
  assert.match(engine.seen[0].systemPrompt, /\(from notes\.md\)\nthe moon is cheese/);
});
