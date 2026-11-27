import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../creator/index.mjs";
import { createApp } from "./app.mjs";
import { createFakeEmbedder } from "../creator/knowledge/fakeEmbedder.mjs";
import { parseSse } from "./testing/sse.mjs";

// The real creator over a temp store and real files; the engine answers `reply`
// and keeps every input it was given.
let reply = "";
const inputs = [];
const engine = { askAgent: async (input, { onDelta }) => (inputs.push(input), onDelta(reply), { text: reply, sessionId: "s" }) };
const home = await mkdtemp(join(tmpdir(), "agent-creator-capability-server-"));
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
const build = async (id) => parseSse((await call("POST", `/api/agents/${id}/capabilities/build`)).text);
const getMap = (id) => json("GET", `/api/agents/${id}/capabilities`);

async function dropKnowledge(id, path, text) {
  const source = join(home, "drop", id, path);
  await mkdir(join(source, ".."), { recursive: true });
  await writeFile(source, text);
  await json("POST", `/api/agents/${id}/sections/knowledge/files`, { files: [{ path, size: text.length, source }] });
}

async function agentWithKnowledge(path, text) {
  const { id } = await json("POST", "/api/agents");
  await dropKnowledge(id, path, text);
  return id;
}

const GOOD = "Tuning a 1960s Weber carburettor";
const ANSWER = `Strong on carburettors. <capabilities>{"good": [{"text": "${GOOD}", "from": ["weber.md"]}], "medium": ["Ignition timing"], "notTrained": [{"text": "Fuel injection", "from": []}]}</capabilities>`;

test("build streams delta*, then done with the map; GET reads it back, fresh", async () => {
  reply = ANSWER;
  const id = await agentWithKnowledge("weber.md", "Jets, floats and chokes on the Weber DCOE.");
  assert.deepEqual(await getMap(id), { map: null, stale: true }, "sources and no map yet");

  const events = await build(id);
  assert.ok(events.slice(0, -1).every((e) => e.event === "delta"));
  const done = events.at(-1);
  assert.equal(done.event, "done");
  assert.equal(done.data.say, "Strong on carburettors.");
  assert.deepEqual(done.data.map.good, [{ text: GOOD, from: ["weber.md"] }]);
  assert.deepEqual(done.data.map.medium, [{ text: "Ignition timing", from: [] }]);
  assert.deepEqual(done.data.used, ["weber.md"]);
  assert.equal(done.data.stale, false);
  assert.deepEqual(await getMap(id), { map: done.data.map, stale: false });

  await dropKnowledge(id, "su.md", "SU carburettors use a piston.");
  assert.equal((await getMap(id)).stale, true, "a new source makes the map stale");
});

test("the map never reaches the agent itself when it talks", async () => {
  reply = ANSWER;
  const id = await agentWithKnowledge("weber.md", "Jets, floats and chokes on the Weber DCOE.");
  await build(id);
  await json("PUT", `/api/agents/${id}/draft`, { name: "Mech" });
  await json("POST", `/api/agents/${id}/save`);

  reply = "Check the float level.";
  const before = inputs.length;
  assert.equal((await parseSse((await call("POST", `/api/agents/${id}/talk`, { message: "Weber?" })).text)).at(-1).event, "done");
  const talked = inputs.slice(before);
  assert.equal(talked.length, 1);
  for (const { systemPrompt = "", message = "" } of talked) {
    assert.ok(!`${systemPrompt}\n${message}`.includes(GOOD), "no map line in what the agent reads");
    assert.ok(!/notTrained|<capabilities>/.test(`${systemPrompt}\n${message}`));
  }
});

test("no source, or a reply without a block, ends in an error event with its kind", async () => {
  const empty = (await json("POST", "/api/agents")).id;
  assert.deepEqual((await build(empty)).map((e) => [e.event, e.data.kind]), [["error", "bad-input"]]);
  assert.deepEqual(await getMap(empty), { map: null, stale: false }, "nothing to map is never stale");

  reply = "Sorry, no.";
  const id = await agentWithKnowledge("notes.md", "Some notes.");
  assert.equal((await build(id)).at(-1).data.kind, "bad-output");
  assert.deepEqual(await getMap(id), { map: null, stale: true });
});

test("unknown agents are 404", async () => {
  assert.equal((await call("POST", "/api/agents/0123456789ab/capabilities/build")).status, 404);
  assert.equal((await call("GET", "/api/agents/0123456789ab/capabilities")).status, 404);
});
