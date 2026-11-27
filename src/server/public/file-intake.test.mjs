import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../../creator/index.mjs";
import { createApp } from "../app.mjs";
import { chunks, createIntake, dropSource, httpApi, toEntries, walkEntries } from "./file-intake.js";

// The real server and store, in a temp home: the intake's whole path to the DNA.
const home = await mkdtemp(join(tmpdir(), "agent-creator-intake-"));
const server = createApp({}, { store: createAgentStore({ home }) }).listen(0);
const base = `http://localhost:${server.address().port}`;
after(async () => {
  server.close();
  await rm(home, { recursive: true, force: true });
});
const api = httpApi((url, init) => fetch(base + url, init));

// A fake FileSystemEntry tree like WebKit's: { "notes": { "a.md": 3 } }.
function entry(name, node, parent = "") {
  const fullPath = `${parent}/${name}`;
  if (typeof node === "number") return { isFile: true, name, fullPath, file: (ok) => ok({ name, size: node }) };
  const children = Object.entries(node).map(([child, value]) => entry(child, value, fullPath));
  return {
    isDirectory: true, name, fullPath,
    createReader() {
      const batches = chunks(children, 2);   // readEntries hands out batches, then []
      return { readEntries: (ok) => ok(batches.shift() ?? []) };
    },
  };
}

function recorder() {
  const events = [];
  return { events, emit: (name, detail) => events.push([name, detail]), names: () => events.map(([name]) => name) };
}

test("nested folders are walked to any depth, every batch, with paths inside the drop", async () => {
  const drop = [entry("course", { "week 1": { "a.md": 3, "b.md": 4, deep: { "c.pdf": 5 } }, "intro.txt": 1 }), entry("bio.pdf", 9)];
  const files = await walkEntries(drop);
  assert.deepEqual(files.map((f) => [f.relativePath, f.size]).sort(), [
    ["bio.pdf", 9], ["course/intro.txt", 1], ["course/week 1/a.md", 3], ["course/week 1/b.md", 4], ["course/week 1/deep/c.pdf", 5],
  ]);
});

test("hidden files and folders are left out; picked files keep their folder path", async () => {
  const walked = await walkEntries([entry("notes", { ".git": { HEAD: 1 }, ".DS_Store": 6, "a.md": 2 })]);
  assert.deepEqual(toEntries(walked), [{ path: "notes/a.md", size: 2 }]);
  const picked = [{ name: "a.md", size: 2, webkitRelativePath: "notes/a.md" }, { name: ".DS_Store", size: 6, webkitRelativePath: "notes/.DS_Store" }];
  assert.deepEqual(toEntries(picked), [{ path: "notes/a.md", size: 2 }]);
});

test("a drop without entry support falls back to its plain files", async () => {
  const gather = dropSource({ items: [{}], files: [{ name: "x.md", size: 1 }] });
  assert.deepEqual(toEntries(await gather()), [{ path: "x.md", size: 1 }]);
});

test("an intake lands every file in a new agent's DNA with real size and added time, never the chat", async () => {
  const { events, emit, names } = recorder();
  const picked = Array.from({ length: 5 }, (_, i) => ({ name: `${i}.md`, size: 10 + i, webkitRelativePath: `notes/${i}.md` }));
  await createIntake({ api, emit, batch: 2 }).take("pick", () => picked);

  assert.deepEqual(names(), ["start", "progress", "progress", "progress", "done"]);
  assert.deepEqual(events[0][1], { source: "pick" });
  assert.deepEqual(events.slice(1, 4).map(([, d]) => d), [{ sent: 2, total: 5 }, { sent: 4, total: 5 }, { sent: 5, total: 5 }]);
  const done = events.at(-1)[1];
  assert.equal(done.added.length, 5);
  assert.deepEqual(done.dna.map((d) => [d.id, d.sizeBytes, d.topic]), picked.map((f, i) => [f.webkitRelativePath, 10 + i, "notes"]));
  assert.ok(done.dna.every((d) => Date.parse(d.addedAt) > Date.now() - 60_000));

  const saved = await (await fetch(`${base}/api/agents/${done.agentId}`)).json();
  assert.equal(saved.files.length, 5);
  assert.equal(saved.sessionId, null, "no chat turn was made");
  const listed = await (await fetch(`${base}/api/agents`)).json();
  assert.ok(listed.some((a) => a.id === done.agentId), "a files-only agent shows on the home");
});

test("nothing usable → 'no files found' and no agent is made", async () => {
  const before = (await (await fetch(`${base}/api/agents`)).json()).length;
  const { events, emit } = recorder();
  let made = 0;
  await createIntake({ api: { ...api, createAgent: () => { made++; return api.createAgent(); } }, emit }).take("drop", () => [{ name: ".DS_Store", size: 1 }]);
  assert.deepEqual(events.at(-1), ["error", { message: "no files found" }]);
  assert.equal(made, 0);
  assert.equal((await (await fetch(`${base}/api/agents`)).json()).length, before);
});

test("a second intake while one runs is refused as busy; the first one still finishes", async () => {
  const { emit, names, events } = recorder();
  const intake = createIntake({ api, emit });
  const first = intake.take("drop", () => [{ name: "a.md", size: 1 }]);
  await intake.take("drop", () => [{ name: "b.md", size: 1 }]);
  assert.deepEqual(events[1], ["error", { message: "busy" }]);
  await first;
  assert.equal(names().at(-1), "done");
  assert.equal(intake.isBusy(), false);
});

test("a server refusal becomes intake:error with the server's words", async () => {
  const { events, emit } = recorder();
  const refusing = { createAgent: async () => "000000000000", addFiles: api.addFiles };
  await createIntake({ api: refusing, emit }).take("pick", () => [{ name: "a.md", size: 1 }]);
  assert.equal(events.at(-1)[0], "error");
  assert.match(events.at(-1)[1].message, /000000000000/);
});
