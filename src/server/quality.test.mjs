import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../creator/index.mjs";
import { createApp } from "./app.mjs";
import { createFakeEmbedder } from "../creator/knowledge/fakeEmbedder.mjs";
import { parseSse } from "./testing/sse.mjs";

// The real creator over a temp store and real files. The engine scores every
// file it is shown (unless `garbage`) and keeps every input it was given.
const REASON = "Explains Weber jets for this agent";
let garbage = false;
const inputs = [];
const namesIn = (message) => [...message.matchAll(/<file name="([^"]+)"/g)].map((match) => match[1]);
const scoring = (message) =>
  `Scored. <usefulness>${JSON.stringify({ files: namesIn(message).map((name) => ({ name, score: 75, reason: REASON })) })}</usefulness>`;
const answerTo = ({ message = "" }) => (garbage ? "Sorry, no." : message.includes("<file name=") ? scoring(message) : "Check the float level.");
const engine = {
  askAgent: async (input, { onDelta }) => {
    inputs.push(input);
    const text = answerTo(input);
    onDelta(text);
    return { text, sessionId: "s" };
  },
};
const home = await mkdtemp(join(tmpdir(), "agent-creator-quality-server-"));
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
const build = async (id) => parseSse((await call("POST", `/api/agents/${id}/quality/build`)).text);
const getReport = (id) => json("GET", `/api/agents/${id}/quality`);

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

test("build streams progress, then done with the report; GET reads it back, fresh", async () => {
  garbage = false;
  const id = await agentWithKnowledge("weber.md", "# Weber DCOE\n\nJets, floats and chokes.");
  const before = await getReport(id);
  assert.equal(before.files[0].usefulness, null, "not scored yet");
  assert.ok(before.files[0].structure.score >= 0, "structure needs no AI");
  assert.equal(before.stale, true);

  const events = await build(id);
  assert.deepEqual(events.slice(0, -1).map((e) => [e.event, e.data]), [["progress", { done: 0, total: 1 }], ["progress", { done: 1, total: 1 }]]);
  const done = events.at(-1);
  assert.equal(done.event, "done");
  assert.deepEqual(done.data.report.files[0].usefulness, { score: 75, reason: REASON, stale: false });
  assert.equal(done.data.report.stale, false);
  assert.deepEqual(await getReport(id), done.data.report);

  await dropKnowledge(id, "su.md", "SU carburettors use a piston.");
  assert.equal((await getReport(id)).stale, true, "a new source makes the report stale");
});

test("the scores never reach the agent itself when it talks", async () => {
  garbage = false;
  const id = await agentWithKnowledge("weber.md", "Jets, floats and chokes on the Weber DCOE.");
  await build(id);
  await json("PUT", `/api/agents/${id}/draft`, { name: "Mech" });
  await json("POST", `/api/agents/${id}/save`);

  const before = inputs.length;
  assert.equal((await parseSse((await call("POST", `/api/agents/${id}/talk`, { message: "Weber?" })).text)).at(-1).event, "done");
  const talked = inputs.slice(before);
  assert.equal(talked.length, 1);
  for (const { systemPrompt = "", message = "" } of talked) {
    const read = `${systemPrompt}\n${message}`;
    assert.ok(!read.includes(REASON), "no score reason in what the agent reads");
    assert.ok(!/usefulness|personaRating/.test(read));
  }
});

test("no source, or no usable answer, ends in an error event with its kind", async () => {
  const empty = (await json("POST", "/api/agents")).id;
  assert.deepEqual((await build(empty)).map((e) => [e.event, e.data.kind]), [["error", "bad-input"]]);

  garbage = true;
  const id = await agentWithKnowledge("notes.md", "Some notes.");
  assert.equal((await build(id)).at(-1).data.kind, "bad-output");
  assert.equal((await getReport(id)).builtAt, null, "nothing was saved");
  garbage = false;
});

test("unknown agents are 404", async () => {
  assert.equal((await call("POST", "/api/agents/0123456789ab/quality/build")).status, 404);
  assert.equal((await call("GET", "/api/agents/0123456789ab/quality")).status, 404);
});
