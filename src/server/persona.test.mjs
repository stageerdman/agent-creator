import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../creator/index.mjs";
import { createApp } from "./app.mjs";
import { createFakeEmbedder } from "../creator/knowledge/fakeEmbedder.mjs";
import { parseSse } from "./testing/sse.mjs";

// The real creator over a temp store and real files; the engine answers `reply`.
let reply = "";
const engine = { askAgent: async (_input, { onDelta }) => (onDelta(reply), { text: reply, sessionId: "s" }) };
const home = await mkdtemp(join(tmpdir(), "agent-creator-persona-server-"));
const server = createApp(engine, { store: createAgentStore({ home: join(home, "store") }), embedder: createFakeEmbedder() }).listen(0);
const base = `http://localhost:${server.address().port}`;
after(async () => {
  server.close();
  await rm(home, { recursive: true, force: true });
});

const call = async (method, path, body) => {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, text: await response.text() };
};
const json = async (...args) => JSON.parse((await call(...args)).text);
const build = async (id) => parseSse((await call("POST", `/api/agents/${id}/persona/build`)).text);

async function agentWithPersona(path, text) {
  const source = join(home, "drop", path);
  await mkdir(join(source, ".."), { recursive: true });
  await writeFile(source, text);
  const { id } = await json("POST", "/api/agents");
  await json("POST", `/api/agents/${id}/sections/system-prompt/files`, { files: [{ path, size: text.length, source }] });
  return id;
}

const ANSWER = 'Wrote Ada. <persona>{"name": "Ada", "persona": "You are Ada.", "instructions": "Explain engines.", "context": "Born 1815."}</persona>';

test("build streams delta*, then done with the draft and context; GET context reads it back", async () => {
  reply = ANSWER;
  const id = await agentWithPersona("letters.md", "Dear Charles, the engine…");
  const events = await build(id);
  assert.ok(events.slice(0, -1).every((e) => e.event === "delta"));
  const done = events.at(-1);
  assert.equal(done.event, "done");
  assert.equal(done.data.say, "Wrote Ada.");
  assert.equal(done.data.draft.name, "Ada");
  assert.deepEqual(done.data.used, ["letters.md"]);
  assert.ok(done.data.dna);
  assert.deepEqual(await json("GET", `/api/agents/${id}/context`), { text: done.data.context });
  assert.match(done.data.context, /Born 1815\./);
});

test("no persona source, or a reply without a block, ends in an error event with its kind", async () => {
  const empty = (await json("POST", "/api/agents")).id;
  assert.deepEqual((await build(empty)).map((e) => [e.event, e.data.kind]), [["error", "bad-input"]]);

  reply = "Sorry, no.";
  const id = await agentWithPersona("notes.md", "Some notes.");
  assert.equal((await build(id)).at(-1).data.kind, "bad-output");
  assert.deepEqual(await json("GET", `/api/agents/${id}/context`), { text: "" });
});

test("unknown agents are 404", async () => {
  assert.equal((await call("POST", "/api/agents/0123456789ab/persona/build")).status, 404);
  assert.equal((await call("GET", "/api/agents/0123456789ab/context")).status, 404);
});
