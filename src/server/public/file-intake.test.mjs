import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../../creator/index.mjs";
import { createApp } from "../app.mjs";
import { createFakeEmbedder } from "../../creator/knowledge/fakeEmbedder.mjs";
import { chunks, createIntake, entriesOfDrop, entriesOfFiles, httpApi, isHidden } from "./file-intake.js";

// The real server and store, in a temp home: the intake's whole path to the DNA.
const home = await mkdtemp(join(tmpdir(), "agent-creator-intake-"));
const server = createApp({}, { store: createAgentStore({ home }), embedder: createFakeEmbedder() }).listen(0);
const base = `http://localhost:${server.address().port}`;
after(async () => {
  server.close();
  await rm(home, { recursive: true, force: true });
});
const api = httpApi((url, init) => fetch(base + url, init));

// A fake FileSystemEntry tree like WebKit's: { "notes": { "a.md": 3 } }; readEntries hands out batches of `per`.
function entry(name, node, parent = "", per = 2) {
  const fullPath = `${parent}/${name}`;
  if (typeof node === "number") return { isFile: true, name, fullPath, file: (ok) => ok({ name, size: node }) };
  const children = Object.entries(node).map(([child, value]) => entry(child, value, fullPath, per));
  return { isDirectory: true, name, fullPath, createReader() { const b = chunks(children, per); return { readEntries: (ok) => ok(b.shift() ?? []) }; } };
}
const dropOf = (...roots) => ({ items: roots.map((r) => ({ kind: "file", webkitGetAsEntry: () => r })) });
const pick = (files) => (found) => { const e = entriesOfFiles(files); found(e); return e; };

function recorder() {
  const events = [];
  return { events, emit: (name, detail) => events.push([name, detail]), names: () => events.map(([name]) => name) };
}

test("picks keep the folder's own name and leave hidden files out", () => {
  const files = [
    { webkitRelativePath: "Tony Course/Books/a.pdf", size: 10 },
    { webkitRelativePath: "Tony Course/.DS_Store", size: 1 },
    { webkitRelativePath: "Tony Course/.git/HEAD", size: 1 },
    { name: "loose.md", size: 3 },
  ];
  assert.deepEqual(entriesOfFiles(files), [{ path: "Tony Course/Books/a.pdf", size: 10 }, { path: "loose.md", size: 3 }]);
  assert.ok(isHidden("a/.b/c") && !isHidden("a/b.c"));
});

test("a dropped folder is walked to any depth, every batch, hidden left out; found tells each new part", async () => {
  const drop = dropOf(entry("course", { "week 1": { "a.md": 3, "b.md": 4, deep: { "c.pdf": 5 } }, "intro.txt": 1, ".git": { HEAD: 1 }, ".DS_Store": 6 }), entry("bio.pdf", 9));
  const parts = [];
  const list = await entriesOfDrop(drop, (e) => parts.push(e));
  assert.deepEqual(list.map((f) => [f.path, f.size]).sort(), [
    ["bio.pdf", 9], ["course/intro.txt", 1], ["course/week 1/a.md", 3], ["course/week 1/b.md", 4], ["course/week 1/deep/c.pdf", 5],
  ]);
  assert.ok(parts.length > 1, "entries are told as they are read, not all at the end");
  assert.deepEqual(parts.flat(), list);
  assert.deepEqual(await entriesOfDrop({ items: [{ kind: "string" }], files: [] }), []);
});

test("loose files without the entry API still answer, and found comes after the call returns", async () => {
  let entries = null, seen = null;
  entries = entriesOfDrop({ items: [{ kind: "file" }], files: [{ name: "note.md", size: 5 }] }, () => { seen = entries; });
  assert.equal(seen, null);
  assert.deepEqual(await entries, [{ path: "note.md", size: 5 }]);
  assert.equal(seen, entries);
});

test("a dropped file whose entry can't be read (WebKit, no disk path) still counts", async () => {
  const e = { isFile: true, name: "note.md", fullPath: "/note.md", file: (_ok, fail) => fail(new Error("NotFoundError")) };
  const item = { kind: "file", webkitGetAsEntry: () => e, getAsFile: () => ({ name: "note.md", size: 5 }) };
  assert.deepEqual(await entriesOfDrop({ items: [item] }), [{ path: "note.md", size: 5 }]);
});

test("10,000 files are read in many small parts, each after a yield (no long task)", async () => {
  const tree = {}; for (let i = 0; i < 10000; i++) tree[`f${i}.md`] = 1;
  let parts = 0, biggest = 0;
  const list = await entriesOfDrop(dropOf(entry("big", tree, "", 100)), (e) => { parts++; biggest = Math.max(biggest, e.length); });
  assert.equal(list.length, 10000);
  assert.equal(parts, 100);
  assert.equal(biggest, 100);
});

test("an intake lands every file in a new agent's DNA with real size and added time, never the chat", async () => {
  const { events, emit, names } = recorder();
  const picked = Array.from({ length: 5 }, (_, i) => ({ name: `${i}.md`, size: 10 + i, webkitRelativePath: `notes/${i}.md` }));
  await createIntake({ api, emit, batch: 2 }).take("pick", pick(picked));

  assert.deepEqual(names(), ["start", "found", "progress", "progress", "progress", "done"]);
  assert.deepEqual(events[0][1], { source: "pick" });
  assert.equal(events[1][1].total, 5);
  assert.deepEqual(events.slice(2, 5).map(([, d]) => d), [{ sent: 2, total: 5 }, { sent: 4, total: 5 }, { sent: 5, total: 5 }]);
  const done = events.at(-1)[1];
  assert.equal(done.added.length, 5);
  assert.equal(done.agent.id, done.agentId);
  assert.deepEqual(done.dna.map((d) => [d.id, d.sizeBytes, d.topic]), picked.map((f, i) => [f.webkitRelativePath, 10 + i, "notes"]));
  assert.ok(done.dna.every((d) => Date.parse(d.addedAt) > Date.now() - 60_000));

  const saved = await (await fetch(`${base}/api/agents/${done.agentId}`)).json();
  assert.equal(saved.files.length, 5);
  assert.equal(saved.sessionId, null, "no chat turn was made");
  const listed = await (await fetch(`${base}/api/agents`)).json();
  assert.ok(listed.some((a) => a.id === done.agentId), "a files-only agent shows on the home");
});

test("a drop starts at its first real entry, not before", async () => {
  const { emit, names } = recorder();
  const drop = dropOf(entry("n", { "a.md": 1, "b.md": 2, "c.md": 3 }));
  await createIntake({ api, emit }).take("drop", (found) => entriesOfDrop(drop, found));
  assert.deepEqual(names().slice(0, 3), ["start", "found", "found"]);
  assert.equal(names().at(-1), "done");
});

test("nothing usable → no start, 'no files found' and no agent is made", async () => {
  const before = (await (await fetch(`${base}/api/agents`)).json()).length;
  const { events, emit, names } = recorder();
  let made = 0;
  await createIntake({ api: { ...api, createAgent: () => { made++; return api.createAgent(); } }, emit }).take("drop", pick([{ name: ".DS_Store", size: 1 }]));
  assert.deepEqual(names(), ["error"]);
  assert.deepEqual(events[0][1], { message: "no files found", started: false });
  assert.equal(made, 0);
  assert.equal((await (await fetch(`${base}/api/agents`)).json()).length, before);
});

test("a second intake while one runs is refused as busy; the first one still finishes", async () => {
  const { emit, names, events } = recorder();
  const intake = createIntake({ api, emit });
  const first = intake.take("drop", pick([{ name: "a.md", size: 1 }]));
  await intake.take("drop", pick([{ name: "b.md", size: 1 }]));
  assert.deepEqual(events.find(([n]) => n === "error"), ["error", { message: "busy", started: false }]);
  await first;
  assert.equal(names().at(-1), "done");
  assert.equal(intake.isBusy(), false);
});

test("a failed save says the server's words and leaves no agent behind", async () => {
  const { events, emit } = recorder();
  let removed = null;
  const failing = { ...api, addFiles: async () => { throw new Error("disk full"); }, removeAgent: async (id) => { removed = id; return api.removeAgent(id); } };
  await createIntake({ api: failing, emit }).take("pick", pick([{ name: "a.md", size: 1 }]));
  assert.deepEqual(events.at(-1), ["error", { message: "disk full", started: true }]);
  assert.ok(removed);
  assert.equal((await fetch(`${base}/api/agents/${removed}`)).status, 404);
});
