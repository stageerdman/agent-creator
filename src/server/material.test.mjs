import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../creator/index.mjs";
import { createApp } from "./app.mjs";
import { parseSse } from "./testing/sse.mjs";

// The real creator over a temp store; these routes never reach the engine.
const home = await mkdtemp(join(tmpdir(), "agent-creator-material-"));
const server = createApp({}, { store: createAgentStore({ home: join(home, "store") }) }).listen(0);
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
const json = async (...args) => {
  const { status, text } = await call(...args);
  return { status, body: JSON.parse(text) };
};
const newAgent = async () => (await json("POST", "/api/agents")).body.id;
const states = (files) => files.map((file) => [file.path, file.state]);

test("scan streams files batches, then done; the files are on the agent", async () => {
  const id = await newAgent();
  const root = join(home, "drop", "notes");
  await mkdir(join(root, "deep"), { recursive: true });
  await writeFile(join(root, "a.md"), "aa");
  await writeFile(join(root, "deep", "b.md"), "bbb");
  const events = parseSse((await call("POST", `/api/agents/${id}/scan`, { paths: [root] })).text);
  assert.deepEqual(events.map((e) => e.event), ["files", "done"]);
  assert.deepEqual(events[0].data.files, [{ path: "notes/a.md", name: "a.md", size: 2 }, { path: "notes/deep/b.md", name: "b.md", size: 3 }]);
  assert.deepEqual([events[1].data.total, events[1].data.added.length, events[1].data.dna.length], [2, 2, 2]);
});

test("scan: bad paths are 400, unknown agent is 404, a missing folder is an error event", async () => {
  const id = await newAgent();
  assert.equal((await call("POST", `/api/agents/${id}/scan`, { paths: [] })).status, 400);
  assert.equal((await call("POST", "/api/agents/0123456789ab/scan", { paths: ["/tmp"] })).status, 404);
  const [event] = parseSse((await call("POST", `/api/agents/${id}/scan`, { paths: [join(home, "nothing")] })).text);
  assert.deepEqual([event.event, event.data.kind], ["error", "bad-input"]);
});

test("sections: drop onto one, list it, remove a file", async () => {
  const id = await newAgent();
  const drop = await json("POST", `/api/agents/${id}/sections/knowledge/files`, { files: [{ path: "a.md", size: 1 }] });
  assert.equal(drop.status, 200);
  assert.deepEqual(states(drop.body.files), [["a.md", "unprocessed"]]);
  assert.deepEqual(drop.body.changed, ["a.md"]);
  assert.deepEqual(states((await json("GET", `/api/agents/${id}/sections/knowledge/files`)).body.files), [["a.md", "unprocessed"]]);
  assert.deepEqual((await json("GET", `/api/agents/${id}/sections/system-prompt/files`)).body.files, []);

  const removed = await json("DELETE", `/api/agents/${id}/files?path=${encodeURIComponent("a.md")}`);
  assert.deepEqual([removed.body.path, removed.body.state, removed.body.dna], ["a.md", "gone", []]);
  assert.equal((await call("DELETE", `/api/agents/${id}/files?path=a.md`)).status, 404);
  assert.equal((await call("DELETE", `/api/agents/${id}/files`)).status, 400);
  assert.equal((await call("GET", `/api/agents/${id}/sections/persona/files`)).status, 400);
});

test("system prompt reads and saves; knowledge reads", async () => {
  const id = await newAgent();
  assert.deepEqual((await json("GET", `/api/agents/${id}/system-prompt`)).body, { text: "" });
  assert.deepEqual((await json("PUT", `/api/agents/${id}/system-prompt`, { text: "You are Ada." })).body, { text: "You are Ada." });
  assert.deepEqual((await json("GET", `/api/agents/${id}/system-prompt`)).body, { text: "You are Ada." });
  assert.equal((await call("PUT", `/api/agents/${id}/system-prompt`, {})).status, 400);
  assert.deepEqual((await json("GET", `/api/agents/${id}/knowledge`)).body, { text: "" });
  assert.equal((await call("GET", "/api/agents/0123456789ab/knowledge")).status, 404);
});

test("skills: create from files, list, read, edit; its section takes drops too", async () => {
  const id = await newAgent();
  const created = await json("POST", `/api/agents/${id}/skills`, { name: "Soup", files: [{ path: "soup.md", size: 4 }] });
  assert.equal(created.status, 200);
  const skillId = created.body.id;
  assert.deepEqual([created.body.name, created.body.body, states(created.body.files)], ["Soup", "# Soup\n", [["soup.md", "unprocessed"]]]);
  assert.deepEqual((await json("GET", `/api/agents/${id}/skills`)).body.skills.map((s) => [s.id, s.fileCount]), [[skillId, 1]]);

  await json("POST", `/api/agents/${id}/sections/skill%3A${skillId}/files`, { files: [{ path: "stew.md", size: 2 }] });
  assert.equal((await json("GET", `/api/agents/${id}/sections/skill:${skillId}/files`)).body.files.length, 2);

  const edited = await json("PUT", `/api/agents/${id}/skills/${skillId}`, { body: "Stir." });
  assert.deepEqual([edited.body.name, edited.body.body], ["Soup", "Stir."]);
  assert.equal((await json("GET", `/api/agents/${id}/skills/${skillId}`)).body.body, "Stir.");
  assert.equal((await call("GET", `/api/agents/${id}/skills/ffffffff`)).status, 404);
  assert.equal((await call("POST", `/api/agents/${id}/skills`, { name: " " })).status, 400);
});

test("a badly encoded path part matches no route", async () => {
  assert.equal((await call("GET", "/api/agents/%E0%A4%A/knowledge")).status, 404);
});
