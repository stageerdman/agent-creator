import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "./agentStore.mjs";
import { CHAT_KEEP, createAgents, shortDescription, summary, withTurn } from "./agents.mjs";
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

test("withTurn adds the user's line and Sketcher's, and keeps only the newest CHAT_KEEP", () => {
  assert.deepEqual(withTurn(undefined, "hi", "hello"), [{ who: "you", text: "hi" }, { who: "sketcher", text: "hello" }]);
  let chat = [];
  for (let i = 0; i < CHAT_KEEP; i++) chat = withTurn(chat, `q${i}`, `a${i}`);
  assert.equal(chat.length, CHAT_KEEP);
  assert.deepEqual(chat.at(-1), { who: "sketcher", text: `a${CHAT_KEEP - 1}` });
  assert.equal(chat[0].who, "you", "a cut never starts on an answer");
});

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

test("store: deleteAgent removes only that agent's folder; a missing or odd id is not-found", async () => {
  const dir = await mkdtemp(join(home, "h-"));
  const store = createAgentStore({ home: dir, now: ticking() });
  const gone = await store.createAgent();
  const kept = await store.createAgent();
  await store.deleteAgent(gone.id);
  assert.deepEqual(await readdir(join(dir, "agents")), [kept.id]);
  await assert.rejects(store.loadAgent(gone.id), { kind: "not-found" });
  await assert.rejects(store.deleteAgent(gone.id), { kind: "not-found" });
  await assert.rejects(store.deleteAgent(".."), { kind: "not-found" });
  assert.deepEqual(await readdir(join(dir, "agents")), [kept.id]);
});

test("store: texts live in the agent's folder, start empty and never escape it", async () => {
  const store = await freshStore();
  const { id } = await store.createAgent();
  assert.equal(await store.readText(id, "system-prompt.md"), "");
  await store.writeText(id, "skills/ab12cd34/SKILL.md", "# Soup");
  assert.equal(await store.readText(id, "skills/ab12cd34/SKILL.md"), "# Soup");
  for (const rel of ["../agent.json", "/etc/passwd", "a//b", ""]) {
    await assert.rejects(store.readText(id, rel), { kind: "bad-input" });
  }
  await assert.rejects(store.writeText("0123456789ab", "x.md", "x"), { kind: "not-found" });
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
  assert.deepEqual(turn, { say: "Hello!", patch: { name: "Tina" }, sessionId: "sess-1", ready: false });
  assert.equal(engine.calls[0].resumeSessionId, "old");
  assert.match(engine.calls[0].systemPrompt, /You are the Sketcher/);
  // A resumed session ignores a new system prompt, so the live draft rides in the message.
  assert.match(engine.calls[0].message, /^<turn_context>[^]*<current_draft[^]*The user says:\na coach$/);
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
  const chat = [{ who: "you", text: "a loud coach" }, { who: "sketcher", text: "Sketched." }];
  assert.deepEqual(await agents.get(id), { id, draft: turn.draft, sessionId: "sess-1", files: [], chat, talk: [], dna: [] });
});

test("agents: dropped files are stamped by the clock and show up as dna on the list and the view", async () => {
  const store = await freshStore();
  const agents = createAgents({ store, engine: scriptedEngine([]), now: () => new Date("2026-11-20T08:00:00Z") });
  const { id } = await agents.create();
  await agents.edit(id, { name: "Ada" });
  await agents.addFiles(id, [{ path: "talks/one.mp4", size: 2048 }]);
  const expected = [{ id: "talks/one.mp4", name: "one.mp4", sizeBytes: 2048, addedAt: "2026-11-20T08:00:00.000Z", topic: "talks", state: "unprocessed" }];
  assert.deepEqual((await agents.list())[0].dna, expected);
  assert.deepEqual((await agents.get(id)).dna, expected);
});

test("agents: dropped files join the DNA list, the creator routes them by path", async () => {
  const store = await freshStore();
  const engine = scriptedEngine(['Done. <draft>{"files":{"notes/":"rag","bio.pdf":"instructions"}}</draft>']);
  const agents = createAgents({ store, engine });
  const { id } = await agents.create();
  const { added } = await agents.addFiles(id, [{ path: "notes/a/b.md", size: 4 }, { path: "bio.pdf", size: 9 }]);
  assert.deepEqual(added, ["notes/a/b.md", "bio.pdf"]);
  // A record holding only files is not reused as an "empty" agent.
  assert.notEqual((await agents.create()).id, id);

  const turn = await agents.chat(id, "notes for lookups, the bio shapes who he is");
  assert.match(engine.calls[0].message, /<files>\n- notes\/a\/b\.md → not routed yet/);
  assert.deepEqual(turn.filesChanged, ["notes/a/b.md", "bio.pdf"]);
  assert.deepEqual(turn.changed, []);
  assert.deepEqual((await agents.get(id)).files.map((f) => f.feeds), [["rag"], ["instructions"]]);
});

test("agents: paths asked in chat are scanned in, then rules sort them; a bad path is reported", async () => {
  const root = await mkdtemp(join(home, "books-"));
  await writeFile(join(root, "notes.md"), "# notes");
  await writeFile(join(root, "talk.mp4"), "video");
  const missing = join(home, "no-such-folder");
  const block = { paths: [root, missing], rules: [{ to: "rag", files: { types: ["md"] }, only: true }] };
  const engine = scriptedEngine([`Reading them. <draft>${JSON.stringify(block)}</draft>`]);
  const agents = createAgents({ store: await freshStore(), engine, random: () => 0 });
  const { id } = await agents.create();
  const batches = [];
  const turn = await agents.chat(id, `take ${root}`, { onFiles: (files) => batches.push(files) });

  const folder = root.split("/").at(-1);
  assert.deepEqual(batches.flat().map((f) => f.path).sort(), [`${folder}/notes.md`, `${folder}/talk.mp4`]);
  assert.equal(turn.intake.added, 2);
  assert.equal(turn.intake.skipped.length, 1);
  assert.equal(turn.intake.skipped[0].path, missing);
  assert.deepEqual(turn.intake.rules, [{ to: "rag", picked: 1, only: true }]);
  const feeds = Object.fromEntries((await agents.get(id)).files.map((f) => [f.path, f.feeds]));
  assert.deepEqual(feeds[`${folder}/notes.md`], ["rag"]);
  assert.ok(!feeds[`${folder}/talk.mp4`].includes("rag"));
});

test("agents: a turn with no paths and no rules has no intake", async () => {
  const agents = createAgents({ store: await freshStore(), engine: scriptedEngine(['ok <draft>{"name":"Tina"}</draft>']) });
  const { id } = await agents.create();
  assert.equal((await agents.chat(id, "rename")).intake, null);
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
  assert.match(engine.calls[0].message, /"persona": "You are calm\."/);
  assert.match(engine.calls[0].message, /changed them: persona\./);
  assert.match(engine.calls[0].message, /typed these lines themselves[^]*- persona: You are calm\./);
  assert.match(engine.calls[0].message, /The user says:\nadd a job$/);
  assert.doesNotMatch(engine.calls[0].systemPrompt, /You are calm/);
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
  assert.deepEqual(list.map((a) => a.draft), [{ name: "Tony", status: "draft", description: "" }]);
});

test("agents: an agent built from a folder (files, no words) is on the list, not reused", async () => {
  const store = await freshStore();
  const agents = createAgents({ store, engine: scriptedEngine([]) });
  const { id } = await agents.create();
  await agents.addFiles(id, [{ path: "Recipes/soup.md", size: 30 }]);
  const list = await agents.list();
  assert.deepEqual(list.map((a) => [a.id, a.dna.length]), [[id, 1]]);
  assert.notEqual((await agents.create()).id, id);
});

test("agents: the list carries a short description from persona, else instructions", async () => {
  const store = await freshStore();
  const agents = createAgents({ store, engine: scriptedEngine([]) });
  const { id } = await agents.create();
  await agents.edit(id, { name: "Rex", instructions: "Coach hard calls. Ask one question." });
  assert.equal((await agents.list())[0].draft.description, "Coach hard calls.");
  await agents.edit(id, { persona: "A tough-love coach. Blunt." });
  assert.equal((await agents.list())[0].draft.description, "A tough-love coach.");
});

test("shortDescription: first sentence, cut near 80 characters", () => {
  assert.equal(shortDescription({}), "");
  assert.equal(shortDescription({ persona: "  ", instructions: "" }), "");
  assert.equal(shortDescription({ persona: "Calm, slow to answer" }), "Calm, slow to answer");
  assert.equal(shortDescription({ persona: "Version 2.5 of Rex. Second." }), "Version 2.5 of Rex.");
  const long = shortDescription({ persona: "word ".repeat(40) });
  assert.ok(long.length <= 80 && long.endsWith("…"));
});

test("summary() returns createdAt; an old record without it gets updatedAt", () => {
  const draft = { ...emptyDraft(), name: "Ada" };
  const fresh = summary({ id: "a", draft, createdAt: "2026-11-01T10:00:00.000Z", updatedAt: "2026-11-20T10:00:00.000Z" });
  assert.equal(fresh.createdAt, "2026-11-01T10:00:00.000Z");
  assert.equal(fresh.updatedAt, "2026-11-20T10:00:00.000Z");
  const old = summary({ id: "b", draft, updatedAt: "2026-10-02T09:00:00.000Z" });
  assert.equal(old.createdAt, "2026-10-02T09:00:00.000Z");
});

test("the list carries createdAt from the store", async () => {
  const store = await freshStore();
  const agents = createAgents({ store, engine: scriptedEngine([]) });
  const { id } = await agents.create();
  await agents.edit(id, { name: "Ada" });
  const [row] = await agents.list();
  const record = await store.loadAgent(id);
  assert.equal(row.createdAt, record.createdAt);
  assert.ok(row.createdAt < row.updatedAt);
});
