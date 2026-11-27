import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../agentStore.mjs";
import { emptyDraft } from "../draft.mjs";
import { buildTurnMessage } from "../creatorPrompt.mjs";
import { BadInput, BadOutput } from "../errors.mjs";
import { createSourceMemory } from "../sourceText/memory.mjs";
import { createCapabilityBuilder } from "./capabilityBuilder.mjs";
import { fingerprintOf, roleOf } from "../sourceText/usable.mjs";

const home = await mkdtemp(join(tmpdir(), "agent-creator-capability-"));
after(() => rm(home, { recursive: true, force: true }));

const store = createAgentStore({ home });
const memory = createSourceMemory({ store, readOriginal: async (path) => { throw new Error(`ENOENT ${path}`); } });

const engineSaying = (text) => {
  const seen = [];
  return { seen, askAgent: async (input, { onDelta }) => (seen.push(input), onDelta(text), { text, sessionId: "s" }) };
};
const builderWith = (engine) => createCapabilityBuilder({ store, engine, memory, now: () => new Date("2026-11-28T10:00:00Z") });

const source = (path, feeds, extra = {}) => ({ path, size: 1, feeds, text: "ok", ...extra });

async function agentWith(copies, files) {
  const { id } = await store.createAgent();
  await store.saveDraft(id, { files });
  for (const [path, text] of Object.entries(copies)) await store.writeText(id, `sources/${path}.txt`, text);
  return id;
}

const ANSWER = 'Strong on Dutch VAT. <capabilities>{"good": [{"text": "Dutch VAT for freelancers", "from": ["kb/vat.md", "ghost.md"]}], "medium": [{"text": "Invoicing in euros", "from": ["bio.md"]}], "notTrained": [{"text": "US payroll", "from": []}]}</capabilities>';

test("roleOf: what the agent does with a file", () => {
  assert.equal(roleOf(["rag"]), "knowledge");
  assert.equal(roleOf(["instructions", "skill:a", "skill:b"]), "persona, skill");
});

test("fingerprintOf: order does not matter, text and role do", () => {
  const a = { path: "a.md", text: "x", role: "knowledge" };
  const b = { path: "b.md", text: "y", role: "persona" };
  assert.equal(fingerprintOf([a, b]), fingerprintOf([b, a]));
  assert.notEqual(fingerprintOf([a]), fingerprintOf([{ ...a, text: "z" }]));
  assert.notEqual(fingerprintOf([a]), fingerprintOf([{ ...a, role: "persona" }]));
});

test("buildCapabilities reads every used copy with its role, saves the map, then it is fresh until a copy changes", async () => {
  const id = await agentWith({ "kb/vat.md": "VAT rules", "bio.md": "I invoice", "old.md": "gone" }, [
    source("kb/vat.md", ["rag"]), source("bio.md", ["instructions"]),
    source("old.md", ["rag"], { removed: true }), source("pic.png", ["rag"], { text: "binary" }), source("loose.md", []),
  ]);
  const engine = engineSaying(ANSWER);
  const builder = builderWith(engine);
  assert.deepEqual(await builder.getCapabilities(id), { map: null, stale: true });

  const result = await builder.buildCapabilities(id);

  assert.match(engine.seen[0].message, /<source name="kb\/vat.md" role="knowledge">\nVAT rules/);
  assert.match(engine.seen[0].message, /<source name="bio.md" role="persona">/);
  assert.doesNotMatch(engine.seen[0].message, /old.md|loose.md/);
  assert.equal(result.say, "Strong on Dutch VAT.");
  assert.deepEqual(result.map.good, [{ text: "Dutch VAT for freelancers", from: ["kb/vat.md"] }]);
  assert.deepEqual(result.map.sources, ["kb/vat.md", "bio.md"]);
  assert.equal(result.map.builtAt, "2026-11-28T10:00:00.000Z");
  assert.deepEqual(result.skipped, [{ path: "pic.png", reason: "binary" }]);
  assert.equal(result.stale, false);
  assert.deepEqual(await builder.getCapabilities(id), { map: result.map, stale: false });

  await store.writeText(id, "sources/bio.md.txt", "I invoice weekly");
  assert.equal((await builder.getCapabilities(id)).stale, true);
});

test("buildCapabilities: no usable source is BadInput, before any engine call; nothing to map is not stale", async () => {
  const id = await agentWith({}, [source("pic.png", ["rag"], { text: "binary" })]);
  const engine = engineSaying(ANSWER);
  await assert.rejects(builderWith(engine).buildCapabilities(id), BadInput);
  assert.equal(engine.seen.length, 0);
  assert.deepEqual(await builderWith(engine).getCapabilities(id), { map: null, stale: false });
});

test("buildCapabilities: an answer without a block saves nothing", async () => {
  const id = await agentWith({ "a.md": "text" }, [source("a.md", ["rag"])]);
  await assert.rejects(builderWith(engineSaying("Sorry, no.")).buildCapabilities(id), BadOutput);
  assert.equal(await store.readText(id, "capabilities.json"), "");
});

test("the creator's turn carries the map with its rule, and says when it is stale", () => {
  const map = { good: [{ text: "Dutch VAT", from: ["kb/vat.md"] }], medium: [], notTrained: [{ text: "US payroll", from: [] }] };
  const message = buildTurnMessage({ message: "hi", draft: emptyDraft(), capabilities: { map, stale: true } });
  assert.match(message, /<capability_map>\nGood at:\n- Dutch VAT \(from kb\/vat.md\)\n\nNot trained for:\n- US payroll\n<\/capability_map>/);
  assert.match(message, /never copy it into the name, persona or instructions/);
  assert.match(message, /may be out of date/);
  assert.doesNotMatch(buildTurnMessage({ message: "hi", draft: emptyDraft(), capabilities: { map: null, stale: true } }), /capability_map/);
});
