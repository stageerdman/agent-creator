import { test, after } from "node:test";
import assert from "node:assert/strict";
import { askAgent, checkCli } from "../engine/index.mjs";
import { fakeSpawn } from "../engine/testing/fakeSpawn.mjs";
import { createApp } from "./app.mjs";

// The real engine, with the CLI swapped for the fake per scenario.
let scenario = "stream-ok";
const engine = {
  askAgent: (input, options) => askAgent(input, { ...options, spawn: fakeSpawn(scenario) }),
  checkCli: () => checkCli({ binary: "claude", spawn: fakeSpawn("version") }),
};
const server = createApp(engine).listen(0);
const base = `http://localhost:${server.address().port}`;
after(() => server.close());

const post = (body) =>
  fetch(`${base}/api/ask`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

function parseSse(text) {
  return text.trim().split("\n\n").map((block) => ({
    event: block.match(/^event: (.*)$/m)[1],
    data: JSON.parse(block.match(/^data: (.*)$/m)[1]),
  }));
}

test("POST /api/ask streams deltas then done with the session id", async () => {
  scenario = "stream-ok";
  const response = await post({ message: "hi" });
  assert.equal(response.headers.get("content-type"), "text/event-stream");
  const events = parseSse(await response.text());
  assert.deepEqual(events.map((e) => e.event), ["delta", "delta", "done"]);
  assert.equal(events.map((e) => e.data.text).slice(0, 2).join(""), "Echo: hi");
  assert.deepEqual(events[2].data, { text: "Echo: hi", sessionId: "sess-1", contextTokens: 15, contextWindow: 200000 });
});

test("POST /api/ask turns a CLI failure into an error event with its kind", async () => {
  scenario = "stream-fail";
  const events = parseSse(await (await post({ message: "hi" })).text());
  assert.equal(events.length, 1);
  assert.equal(events[0].event, "error");
  assert.equal(events[0].data.kind, "failed");
  assert.equal(events[0].data.message, "Not logged in");
});

test("POST /api/ask rejects an empty message with 400", async () => {
  const response = await post({ message: "  " });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /message/);
});

test("GET /api/health reports the CLI", async () => {
  const health = await (await fetch(`${base}/api/health`)).json();
  assert.deepEqual(health, { installed: true, binary: "claude", version: "9.9.9 (Claude Code)" });
});

test("GET / serves the page", async () => {
  const response = await fetch(`${base}/`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Agent Creator/);
});
