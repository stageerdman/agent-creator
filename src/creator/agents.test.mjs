import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "./agentStore.mjs";
import { createAgents } from "./agents.mjs";
import { creatorTurn } from "./creatorTurn.mjs";
import { emptyDraft } from "./draft.mjs";
import { ClaudeCliError } from "../engine/index.mjs";

const home = await mkdtemp(join(tmpdir(), "agent-creator-test-"));
after(() => rm(home, { recursive: true, force: true }));

// A clock that ticks one second per call, so updatedAt order is certain.
function ticking() {
  let t = Date.parse("2026-11-24T10:00:00Z");
  return () => new Date((t += 1000));
}
const freshStore = async () => createAgentStore({ home: await mkdtemp(join(home, "h-")), now: ticking() });

// An engine that replays a scripted reply and records what it was asked.
function scriptedEngine(deltas, { sessionId = "sess-1", text = deltas.join("") } = {}) {
  const calls = [];
  return {
    calls,
    async askAgent(input, { onDelta }) {
      calls.push(input);
      deltas.forEach(onDelta);
      return { text, sessionId };
    },
  };
}

test("store round trip: create, save, load, all under the given home", async () => {
  const store = await freshStore();
  const { id } = await store.createAgent();
  assert.match(id, /^[0-9a-f]{12}$/);
  const draft = { ...emptyDraft(), name: "Tony" };
  await store.saveDraft(id, { draft, sessionId: "s1" });
  const record = await store.loadAgent(id);
  assert.deepEqual(record.draft, draft);
  assert.equal(record.sessionId, "s1");
  assert.deepEqual(record.handEdited, []);
  assert.ok(record.updatedAt > record.createdAt);
});

test("store writes only under its home, one folder per agent", async () => {
  const dir = await mkdtemp(join(home, "h-"));
  const { id } = await createAgentStore({ home: dir }).createAgent();
  assert.deepEqual(await readdir(join(dir, "agents", id)), ["agent.json"]);
});

test("store: markSaved sets saved; a missing or odd id is a clear not-found", async () => {
  const store = await freshStore();
  const { id } = await store.createAgent();
  assert.equal((await store.markSaved(id)).draft.status, "saved");
  await assert.rejects(store.loadAgent("0123456789ab"), { kind: "not-found", message: /0123456789ab/ });
  await assert.rejects(store.loadAgent("../../etc"), { kind: "not-found" });
});

test("store: listAgents is newest first by updatedAt", async () => {
  const store = await freshStore();
  const first = await store.createAgent();
  const second = await store.createAgent();
  await store.saveDraft(first.id, { draft: { ...emptyDraft(), name: "A" } });
  const ids = (await store.listAgents()).map((r) => r.id);
  assert.deepEqual(ids, [first.id, second.id]);
});

test("store: an unreadable agent file is skipped, not fatal", async () => {
  const dir = await mkdtemp(join(home, "h-"));
  const store = createAgentStore({ home: dir, now: ticking() });
  const good = await store.createAgent();
  await mkdir(join(dir, "agents", "aaaaaaaaaaaa"), { recursive: true });
  await writeFile(join(dir, "agents", "aaaaaaaaaaaa", "agent.json"), "{ not json");
  assert.deepEqual((await store.listAgents()).map((r) => r.id), [good.id]);
});

test("creatorTurn streams without the block, trusts the final result, resumes the session", async () => {
  const engine = scriptedEngine(["Hi! <dr", 'aft>{"name":"Tony"}</draft>'], { text: 'Hello! <draft>{"name":"Tina"}</draft>' });
  const said = [];
  const turn = await creatorTurn(
    { message: "a coach", draft: emptyDraft(), handEdited: [], sessionId: "old" },
    { engine, onSay: (t) => said.push(t) },
  );
  assert.equal(said.join(""), "Hi! ");
  assert.deepEqual(turn, { say: "Hello!", patch: { name: "Tina" }, sessionId: "sess-1" });
  assert.equal(engine.calls[0].resumeSessionId, "old");
  assert.match(engine.calls[0].systemPrompt, /You are the Sketcher/);
});

test("creatorTurn lets engine errors out with their kind", async () => {
  const engine = { askAgent: async () => Promise.reject(new ClaudeCliError("not-installed", "no claude")) };
  await assert.rejects(creatorTurn({ message: "x", draft: emptyDraft(), handEdited: [] }, { engine }), { kind: "not-installed" });
});

test("agents: a chat turn applies the patch, autosaves it and keeps the session", async () => {
  const store = await freshStore();
  const agents = createAgents({ store, engine: scriptedEngine(['Sketched. <draft>{"name":"Tony","persona":"You are loud."}</draft>']) });
  const { id } = await agents.create();
  const turn = await agents.chat(id, "a loud coach");
  assert.deepEqual(turn.changed, ["name", "persona"]);
  assert.equal(turn.say, "Sketched.");
  assert.deepEqual(await agents.get(id), { id, draft: turn.draft, sessionId: "sess-1" });
});

test("agents: a reply with no block leaves the draft as it is", async () => {
  const store = await freshStore();
  const agents = createAgents({ store, engine: scriptedEngine(["Just chatting."]) });
  const { id } = await agents.create();
  await agents.edit(id, { name: "Tony" });
  const turn = await agents.chat(id, "hi");
  assert.deepEqual(turn.changed, []);
  assert.equal(turn.draft.name, "Tony");
});

test("agents: hand edits reach the prompt and only a patch to that field clears them", async () => {
  const store = await freshStore();
  const engine = scriptedEngine(['ok <draft>{"instructions":"Coach daily."}</draft>']);
  const agents = createAgents({ store, engine });
  const { id } = await agents.create();
  await agents.edit(id, { persona: "You are calm.", bogus: "x" });
  await agents.chat(id, "add a job");
  assert.match(engine.calls[0].systemPrompt, /"persona": "You are calm\."/);
  assert.match(engine.calls[0].systemPrompt, /changed them: persona\./);
  assert.match(engine.calls[0].systemPrompt, /typed these lines themselves[^]*- persona: You are calm\./);
  const record = await store.loadAgent(id);
  assert.equal(record.draft.persona, "You are calm.");
  assert.deepEqual(record.handEdited, ["persona"]);
  assert.deepEqual(record.handLines, { persona: ["You are calm."] });
});

test("agents: Keep, then any change makes it a draft again", async () => {
  const store = await freshStore();
  const agents = createAgents({ store, engine: scriptedEngine(['ok <draft>{"name":"Tina"}</draft>']) });
  const { id } = await agents.create();
  await agents.edit(id, { name: "Tony" });
  assert.equal((await agents.keep(id)).status, "saved");
  assert.equal((await agents.edit(id, { name: "Tony" })).status, "saved");
  assert.equal((await agents.edit(id, { name: "Toni" })).status, "draft");
  await agents.keep(id);
  assert.equal((await agents.chat(id, "rename")).draft.status, "draft");
});

test("agents: empty agents are hidden from the list and reused by create (R8)", async () => {
  const store = await freshStore();
  const agents = createAgents({ store, engine: scriptedEngine([]) });
  const empty = await agents.create();
  assert.deepEqual(await agents.create(), empty);
  assert.deepEqual(await agents.list(), []);
  await agents.edit(empty.id, { name: "Tony" });
  const fresh = await agents.create();
  assert.notEqual(fresh.id, empty.id);
  const list = await agents.list();
  assert.deepEqual(list.map((a) => a.draft), [{ name: "Tony", status: "draft" }]);
});
