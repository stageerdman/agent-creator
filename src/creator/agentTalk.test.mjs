import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "./agentStore.mjs";
import { createAgents } from "./agents.mjs";
import { saysReady, splitReply } from "./creatorReply.mjs";
import { agentIdentity } from "./talkPrompt.mjs";

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

test("talk reads knowledge and skill files by source; binary, unreadable and unrouted ones are left out", async () => {
  const store = createAgentStore({ home });
  const { id } = await store.createAgent();
  const sources = { "/a": "alpha", "/bin": "x\0y", "/big": "z".repeat(150_000) };
  const readSource = async (path) => (path in sources ? sources[path] : Promise.reject(new Error("EACCES")));
  await store.saveDraft(id, {
    files: [
      { path: "a.md", feeds: ["rag"], source: "/a" },
      { path: "b.bin", feeds: ["rag"], source: "/bin" },
      { path: "gone.md", feeds: ["skill:k1"], source: "/missing" },
      { path: "big.md", feeds: ["skill:k1"], source: "/big" },
      { path: "rules.md", feeds: ["instructions"], source: "/a" },
      { path: "old.md", feeds: ["rag"], source: "/a", removed: true },
    ],
  });
  await store.markSaved(id); // only a created agent talks
  const engine = echoEngine("Hi.");
  const agents = createAgents({ store, engine, readSource });
  assert.deepEqual(await agents.talk(id, "hello"), { say: "Hi.", used: [] });
  const prompt = engine.seen[0].systemPrompt;
  assert.match(prompt, /<file name="a\.md">\nalpha/);
  assert.match(prompt, /<file name="big\.md">\nz{100000}\n<\/file>/, "cut to the per-file cap");
  for (const name of ["b.bin", "gone.md", "rules.md", "old.md"]) assert.ok(!prompt.includes(`"${name}"`), name);
  assert.equal(engine.seen[0].resumeSessionId, undefined, "a talk is never resumed");
});
