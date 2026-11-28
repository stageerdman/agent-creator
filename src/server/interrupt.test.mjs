// Esc and send-while-thinking over real HTTP, against an engine whose
// replies the test releases by hand (a thinking CLI that honours abort).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../creator/index.mjs";
import { createFakeEmbedder } from "../creator/knowledge/fakeEmbedder.mjs";
import { createApp } from "./app.mjs";
import { parseSse } from "./testing/sse.mjs";

const calls = [];
let onCall = () => {};
const engine = {
  askAgent: (input, { signal }) => new Promise((resolve, reject) => {
    const reply = (say) => resolve({ text: say, sessionId: "sess-1" });
    calls.push({ message: input.message, reply });
    signal?.addEventListener("abort", () => reject(Object.assign(new Error("killed"), { kind: "cancelled" })), { once: true });
    onCall();
  }),
  checkCli: async () => ({ ok: true }),
};
const nextCall = () => new Promise((resolve) => (onCall = resolve));

const home = await mkdtemp(join(tmpdir(), "agent-creator-interrupt-"));
const server = createApp(engine, { store: createAgentStore({ home }), embedder: createFakeEmbedder() }).listen(0);
const base = `http://localhost:${server.address().port}`;
after(async () => {
  server.close();
  await rm(home, { recursive: true, force: true });
});

const post = (path, body) => fetch(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body ?? {}) });
const chat = async (id, message) => parseSse(await (await post(`/api/agents/${id}/chat`, { message })).text());
const stop = async (id) => (await post(`/api/agents/${id}/stop`)).json();
const newAgent = async () => (await (await post("/api/agents")).json()).id;

test("stop ends the thinking turn as cancelled and saves nothing", async () => {
  const id = await newAgent();
  const asked = nextCall();
  const turn = chat(id, "make Tony");
  await asked;
  assert.deepEqual(await stop(id), { stopped: 1 });
  const events = await turn;
  assert.equal(events.at(-1).event, "error");
  assert.equal(events.at(-1).data.kind, "cancelled");
  const saved = await (await fetch(`${base}/api/agents/${id}`)).json();
  assert.deepEqual(saved.chat, []);
  assert.deepEqual(await stop(id), { stopped: 0 });
});

test("a message sent while thinking is queued, then runs after the first turn", async () => {
  const id = await newAgent();
  let asked = nextCall();
  const first = chat(id, "first");
  await asked;
  asked = nextCall();
  // Its headers arrive with the queued event, so it is in line before the first turn ends.
  const secondResponse = await post(`/api/agents/${id}/chat`, { message: "second" });
  const second = secondResponse.text().then(parseSse);
  calls.at(-1).reply("One.");
  const firstEvents = await first;
  assert.equal(firstEvents.at(-1).event, "done");
  await asked;
  assert.match(calls.at(-1).message, /second/);
  calls.at(-1).reply("Two.");
  const secondEvents = await second;
  assert.equal(secondEvents[0].event, "queued");
  assert.deepEqual(secondEvents.at(-1), { event: "done", data: { say: "Two.", sessionId: "sess-1", ready: false } });
  const saved = await (await fetch(`${base}/api/agents/${id}`)).json();
  assert.deepEqual(saved.chat.map((line) => line.text), ["first", "One.", "second", "Two."]);
});

test("stop on an unknown agent is a 404", async () => {
  assert.equal((await post("/api/agents/nope/stop")).status, 404);
});
