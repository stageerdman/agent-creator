import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "../agentStore.mjs";
import { createAgents } from "../agents.mjs";

const home = await mkdtemp(join(tmpdir(), "agent-creator-memory-"));
after(() => rm(home, { recursive: true, force: true }));

const store = createAgentStore({ home });
const copyOnDisk = (id, path) => join(home, "agents", id, "sources", `${path}.txt`);
const exists = (file) => stat(file).then(() => true, () => false);

// Originals by absolute path; reading one counts, so a test sees retries.
function fakeDisk(entries) {
  const files = new Map(Object.entries(entries).map(([path, text]) => [path, Buffer.from(text)]));
  const reads = [];
  const readOriginal = async (path) => {
    reads.push(path);
    return files.get(path) ?? Promise.reject(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
  };
  return { files, reads, readOriginal };
}

test("used files get a copy and a mark; unused, missing and binary ones say why", async () => {
  const { id } = await store.createAgent();
  const disk = fakeDisk({ "/d/a.md": "alpha", "/d/b.bin": "x\0y" });
  const agents = createAgents({ store, engine: {}, readOriginal: disk.readOriginal });
  await agents.addFiles(id, [{ path: "unused.md", source: "/d/a.md" }]);
  const { section } = await agents.assign(id, "knowledge", [
    { path: "docs/a.md", source: "/d/a.md" }, { path: "b.bin", source: "/d/b.bin" }, { path: "moved.md", source: "/d/moved.md" },
  ]);
  assert.deepEqual(section.map((file) => [file.path, file.text]), [["docs/a.md", "ok"], ["b.bin", "binary"], ["moved.md", null]]);
  assert.equal(await store.readText(id, "sources/docs/a.md.txt"), "alpha");
  assert.ok(!(await exists(copyOnDisk(id, "unused.md"))), "a file no feed uses is not copied");

  disk.reads.length = 0;
  disk.files.set("/d/moved.md", Buffer.from("back"));
  await agents.assign(id, "system-prompt", [{ path: "docs/a.md" }]);
  assert.deepEqual(disk.reads, ["/d/moved.md"], "only the file without a mark is tried again");
});

test("a gone file's copy goes at once; a removed one's at the rebuild", async () => {
  const { id } = await store.createAgent();
  const disk = fakeDisk({ "/d/x.md": "x", "/d/y.md": "y" });
  const agents = createAgents({ store, engine: {}, readOriginal: disk.readOriginal });
  await agents.assign(id, "knowledge", [{ path: "x.md", source: "/d/x.md" }, { path: "y.md", source: "/d/y.md" }]);
  await agents.markProcessed(id, "knowledge", ["y.md"]);

  assert.equal((await agents.removeFile(id, "x.md")).state, "gone");
  assert.ok(!(await exists(copyOnDisk(id, "x.md"))));
  assert.equal((await agents.removeFile(id, "y.md")).state, "removed");
  assert.ok(await exists(copyOnDisk(id, "y.md")), "still baked in, so still kept");
  await agents.rebuilt(id);
  assert.ok(!(await exists(copyOnDisk(id, "y.md"))));
});

test("putSource keeps uploaded content for a listed file, and refuses an unknown one", async () => {
  const { id } = await store.createAgent();
  const agents = createAgents({ store, engine: {} });
  await agents.addFiles(id, [{ path: "page/drop.md", size: 4 }]);
  assert.deepEqual(await agents.putSource(id, "./page/drop.md", Buffer.from("drop")), { path: "page/drop.md", text: "ok" });
  assert.equal(await store.readText(id, "sources/page/drop.md.txt"), "drop");
  assert.equal((await agents.get(id)).files[0].text, "ok");
  await assert.rejects(agents.putSource(id, "nope.md", Buffer.from("x")), { kind: "not-found" });
});
