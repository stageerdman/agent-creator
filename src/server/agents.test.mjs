import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { askAgent, checkCli } from "../engine/index.mjs";
import { fakeSpawn } from "../engine/testing/fakeSpawn.mjs";
import { createAgentStore } from "../creator/index.mjs";
import { createApp } from "./app.mjs";
import { parseSse } from "./testing/sse.mjs";

// The real engine and creator, with the CLI swapped for the fake and the
// agents kept in a temp folder.
let scenario = "creator-patch";
const prompts = [];
const engine = {
  askAgent: (input, options) => {
    prompts.push(input.message);
    return askAgent(input, { ...options, spawn: fakeSpawn(scenario) });
  },
  checkCli: () => checkCli({ binary: "claude", spawn: fakeSpawn("version") }),
};
const home = await mkdtemp(join(tmpdir(), "agent-creator-server-"));
const server = createApp(engine, { store: createAgentStore({ home }) }).listen(0);
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
  return { status: response.status, type: response.headers.get("content-type"), text: await response.text() };
};
const json = async (...args) => JSON.parse((await call(...args)).text);
const chat = async (id, message) => parseSse((await call("POST", `/api/agents/${id}/chat`, { message })).text);
const newAgent = async () => (await json("POST", "/api/agents")).id;

test("chat streams delta*, then draft, then done, and the block never shows", async () => {
  scenario = "creator-patch";
  const id = await newAgent();
  const events = await chat(id, '{"name":"Tony","persona":"You are loud."}');
  const names = events.map((e) => e.event);
  assert.deepEqual(names.slice(-2), ["draft", "done"]);
  assert.ok(names.slice(0, -2).every((n) => n === "delta"));
  const streamed = events.filter((e) => e.event === "delta").map((e) => e.data.text).join("");
  assert.equal(streamed.trim(), "Here's a first sketch.");
  assert.deepEqual(events.at(-2).data.changed, ["name", "persona"]);
  assert.deepEqual(events.at(-1).data, { say: "Here's a first sketch.", sessionId: "sess-1" });

  const saved = await json("GET", `/api/agents/${id}`);
  assert.equal(saved.draft.name, "Tony");
  assert.equal(saved.sessionId, "sess-1");
});

test("a hand edit reaches the prompt and survives a patch to other fields", async () => {
  scenario = "creator-patch";
  const id = await newAgent();
  await chat(id, '{"name":"Tony","persona":"You are loud."}');
  const edited = await json("PUT", `/api/agents/${id}/draft`, { persona: "You are calm." });
  assert.equal(edited.persona, "You are calm.");

  const events = await chat(id, '{"instructions":"Coach daily."}');
  assert.match(prompts.at(-1), /"persona": "You are calm\."/);
  assert.match(prompts.at(-1), /changed them: persona\./);
  assert.deepEqual(events.at(-2).data.draft, { name: "Tony", persona: "You are calm.", instructions: "Coach daily.", status: "draft" });
});

test("dropped files land in the DNA list, never the chat; the creator routes them", async () => {
  scenario = "creator-patch";
  const id = await newAgent();
  const added = await json("POST", `/api/agents/${id}/files`, { files: [{ path: "notes/deep/a.md", size: 3 }, { path: "bio.pdf" }] });
  assert.deepEqual(added.added, ["notes/deep/a.md", "bio.pdf"]);
  assert.equal((await json("GET", `/api/agents/${id}`)).sessionId, null);

  const events = await chat(id, '{"files":{"/":"rag","bio.pdf":"instructions"}}');
  assert.match(prompts.at(-1), /<files>\n- notes\/deep\/a\.md → not routed yet\n- bio\.pdf → not routed yet\n<\/files>/);
  assert.deepEqual(events.map((e) => e.event).slice(-2), ["files", "done"]);
  assert.deepEqual(events.at(-2).data.changed, ["notes/deep/a.md", "bio.pdf"]);
  const saved = await json("GET", `/api/agents/${id}`);
  assert.deepEqual(saved.files.map((f) => [f.path, f.feeds]), [["notes/deep/a.md", ["rag"]], ["bio.pdf", ["instructions"]]]);
});

test("a files body without paths is 400", async () => {
  const id = await newAgent();
  assert.equal((await call("POST", `/api/agents/${id}/files`, { files: [] })).status, 400);
  assert.equal((await call("POST", `/api/agents/${id}/files`, { files: [{ name: "x" }] })).status, 400);
  assert.equal((await call("POST", `/api/agents/${id}/files`, { files: [{ path: "./" }] })).status, 400);
});

test("a reply that changes nothing sends no draft event", async () => {
  scenario = "stream-ok";
  const id = await newAgent();
  const events = await chat(id, "hello");
  assert.deepEqual(events.map((e) => e.event), ["delta", "delta", "done"]);
});

test("Keep sets saved; a later hand edit sets it back to draft", async () => {
  const id = await newAgent();
  await json("PUT", `/api/agents/${id}/draft`, { name: "Kept one" });
  assert.equal((await json("POST", `/api/agents/${id}/save`)).status, "saved");
  assert.equal((await json("PUT", `/api/agents/${id}/draft`, { name: "Kept two" })).status, "draft");
});

test("DELETE removes the agent: gone from the list and a 404 after; a second delete is 404", async () => {
  const id = await newAgent();
  await json("PUT", `/api/agents/${id}/draft`, { name: "Red Pen" });
  assert.deepEqual(await json("DELETE", `/api/agents/${id}`), { deleted: id });
  assert.ok((await json("GET", "/api/agents")).every((a) => a.id !== id));
  assert.equal((await call("GET", `/api/agents/${id}`)).status, 404);
  assert.equal((await call("DELETE", `/api/agents/${id}`)).status, 404);
});

test("the list hides empty agents and POST reuses the empty one", async () => {
  const empty = await newAgent();
  assert.equal(await newAgent(), empty);
  const list = await json("GET", "/api/agents");
  assert.ok(list.every((a) => a.id !== empty && a.draft.name && a.updatedAt));
  assert.deepEqual(list.map((a) => a.updatedAt), [...list.map((a) => a.updatedAt)].sort().reverse());
});

test("GET /api/agents items carry createdAt for the home's age and order", async () => {
  const id = await newAgent();
  await json("PUT", `/api/agents/${id}/draft`, { name: "Dated" });
  const row = (await json("GET", "/api/agents")).find((a) => a.id === id);
  assert.ok(row.createdAt && !Number.isNaN(Date.parse(row.createdAt)));
  assert.deepEqual(Object.keys(row).sort(), ["createdAt", "dna", "draft", "id", "updatedAt"]);
  assert.deepEqual(row.dna, []);
  await json("POST", `/api/agents/${id}/files`, { files: [{ path: "notes/a.md", size: 7 }] });
  const [file] = (await json("GET", "/api/agents")).find((a) => a.id === id).dna;
  assert.deepEqual([file.id, file.sizeBytes, file.topic], ["notes/a.md", 7, "notes"]);
  assert.ok(!Number.isNaN(Date.parse(file.addedAt)));
  assert.deepEqual(Object.keys(row.draft).sort(), ["description", "name", "status"]);
});

test("a home row opens a real page: /agents/:id is HTML, never raw JSON, even for an unknown id", async () => {
  const id = await newAgent();
  for (const path of [`/agents/${id}`, "/agents/nope", "/agents/home-01?demo=10"]) {
    const page = await call("GET", path);
    assert.equal(page.status, 200, path);
    assert.match(page.type, /text\/html/, path);
    assert.match(page.text, /<main/, path);
    assert.match(page.text, /isn’t here/, path);   // the calm unknown-agent line ships with the page
  }
});

test("the home's mock sets: 0, 1, 10, 50, in the API shape, always with createdAt", async () => {
  for (const n of [0, 1, 10, 50]) {
    const list = await json("GET", `/mock/home/${n}`);
    assert.equal(list.length, n);
    assert.ok(list.every((a) => a.id && a.draft.name && a.createdAt && a.updatedAt && "description" in a.draft));
    assert.ok(list.every((a) => Array.isArray(a.dna) && a.dna.every((f) => f.id && f.sizeBytes > 0 && f.topic && !Number.isNaN(Date.parse(f.addedAt)))));
  }
  const fifty = await json("GET", "/mock/home/50");
  assert.ok(fifty.some((a) => a.draft.status === "learning"));
  assert.ok(fifty.some((a) => a.draft.description === ""));
  assert.ok(fifty.some((a) => a.draft.name.length > 60 && !a.draft.name.includes(" ")));
  assert.ok(fifty.some((a) => a.draft.name.length > 60 && a.draft.name.includes(" ")));
  const old = fifty.find((a) => a.draft.name === "Old Tony");
  assert.equal(old.createdAt, old.updatedAt);             // no createdAt on the record: falls back
});

test("the home loads its modules: agent-list.js and firefly-gather.js", async () => {
  for (const name of ["agent-list", "firefly-gather"]) {
    const file = await call("GET", `/${name}.js`);
    assert.equal(file.status, 200);
    assert.match(file.type, /javascript/);
  }
  const home = await call("GET", "/");
  assert.match(home.text, /from '\.\/firefly-gather\.js'/);
  assert.match(home.text, /from '\.\/agent-list\.js'/);
});

test("a bad id is 404, an empty message is 400", async () => {
  assert.equal((await call("GET", "/api/agents/nope")).status, 404);
  assert.equal((await call("POST", "/api/agents/0123456789ab/chat", { message: "hi" })).status, 404);
  assert.equal((await call("POST", `/api/agents/${await newAgent()}/chat`, { message: " " })).status, 400);
});

test("a missing CLI is an error event with kind not-installed", async () => {
  const id = await newAgent();
  const broken = {
    askAgent: (input, options) => askAgent(input, { ...options, binary: "/nonexistent/claude" }),
    checkCli: engine.checkCli,
  };
  const other = createApp(broken, { store: createAgentStore({ home }) }).listen(0);
  try {
    const response = await fetch(`http://localhost:${other.address().port}/api/agents/${id}/chat`, {
      method: "POST",
      body: JSON.stringify({ message: "hi" }),
    });
    const [event] = parseSse(await response.text());
    assert.equal(event.event, "error");
    assert.equal(event.data.kind, "not-installed");
    assert.ok(event.data.traceId);
  } finally {
    other.close();
  }
});
