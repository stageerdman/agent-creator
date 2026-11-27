import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../creator/index.mjs";
import { createApp } from "./app.mjs";
import { createFakeEmbedder } from "../creator/knowledge/fakeEmbedder.mjs";

// The real creator over a temp store and real files on disk; never the engine.
const home = await mkdtemp(join(tmpdir(), "agent-creator-knowledge-"));
const server = createApp({}, { store: createAgentStore({ home: join(home, "store") }), embedder: createFakeEmbedder() }).listen(0);
const base = `http://localhost:${server.address().port}`;
after(async () => {
  server.close();
  await rm(home, { recursive: true, force: true });
});

const json = async (method, path, body) => {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
};
const at = (path) => `?path=${encodeURIComponent(path)}`;
const states = (sources) => sources.map((source) => [source.path, source.state]);

// A file on disk, as the page sends it: { path, size, source }.
async function onDisk(path, text) {
  const source = join(home, "drop", path);
  await mkdir(join(source, ".."), { recursive: true });
  await writeFile(source, text);
  return { path, size: text.length, source };
}

async function agentWithKnowledge(...files) {
  const id = (await json("POST", "/api/agents")).body.id;
  await json("POST", `/api/agents/${id}/sections/knowledge/files`, { files });
  return `/api/agents/${id}/knowledge`;
}

test("list, adjust and build: knowledge.md holds the sources, they turn processed", async () => {
  const knowledge = await agentWithKnowledge(await onDisk("tea.md", "Green tea steeps two minutes."));
  assert.deepEqual(states((await json("GET", `${knowledge}/sources`)).body.sources), [["tea.md", "unprocessed"]]);

  const adjusted = await json("PATCH", `${knowledge}/sources${at("tea.md")}`, { title: "Tea", text: "Black tea steeps four minutes." });
  assert.equal(adjusted.status, 200);
  assert.equal(adjusted.body.source.title, "Tea");
  assert.deepEqual(adjusted.body.embeds, [{ type: "embedded", file: "tea.md" }], "the edited text is embedded again");

  const built = await json("POST", `${knowledge}/build`);
  assert.equal(built.status, 200);
  assert.deepEqual([built.body.built, built.body.skipped], [["tea.md"], []]);
  assert.match(built.body.text, /## Tea[\s\S]*Black tea steeps four minutes\./);
  assert.deepEqual(states(built.body.sources), [["tea.md", "processed"]]);
  assert.deepEqual((await json("GET", knowledge)).body, { text: built.body.text });
});

test("swap puts the new file in the old one's place; remove takes it out of Knowledge", async () => {
  const knowledge = await agentWithKnowledge(await onDisk("a.md", "Alpha."), await onDisk("b.md", "Beta."));
  const swapped = await json("POST", `${knowledge}/sources/swap${at("a.md")}`, { file: await onDisk("c.md", "Gamma.") });
  assert.equal(swapped.status, 200);
  assert.deepEqual(swapped.body.sources.map((s) => s.path), ["c.md", "b.md"]);
  assert.deepEqual(swapped.body.embeds, [{ type: "embedded", file: "c.md" }]);
  assert.ok(swapped.body.dna);

  const removed = await json("DELETE", `${knowledge}/sources${at("b.md")}`);
  assert.deepEqual(removed.body.sources.map((s) => s.path), ["c.md"]);
  assert.ok(removed.body.dna.some((file) => file.id === "b.md"), "the file stays in the agent");
});

test("bad requests are 400, unknown sources and agents 404", async () => {
  const knowledge = await agentWithKnowledge(await onDisk("x.md", "X."));
  assert.equal((await json("PATCH", `${knowledge}/sources`, { title: "T" })).status, 400);
  assert.equal((await json("PATCH", `${knowledge}/sources${at("x.md")}`, {})).status, 400);
  assert.equal((await json("POST", `${knowledge}/sources/swap${at("x.md")}`, {})).status, 400);
  assert.equal((await json("DELETE", `${knowledge}/sources${at("nope.md")}`)).status, 404);
  assert.equal((await json("GET", "/api/agents/0123456789ab/knowledge/sources")).status, 404);
  assert.equal((await json("POST", "/api/agents/0123456789ab/knowledge/build")).status, 404);
});
