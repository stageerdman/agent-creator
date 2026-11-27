import { test, after } from "node:test";
import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanPaths } from "./folderScan.mjs";

const base = await mkdtemp(join(tmpdir(), "agent-creator-scan-"));
after(() => rm(base, { recursive: true, force: true }));

async function tree(files) {
  for (const [rel, text] of Object.entries(files)) {
    await mkdir(join(base, rel, ".."), { recursive: true });
    await writeFile(join(base, rel), text);
  }
}
const paths = (files) => files.map((file) => file.path).sort();

await tree({
  "notes/a.md": "abc",
  "notes/deep/deeper/b.txt": "12345",
  "notes/.git/config": "x",
  "notes/.DS_Store": "x",
  "bio.pdf": "pdf!",
});
await symlink(join(base, "bio.pdf"), join(base, "notes", "link.pdf"));

test("finds every file in every subfolder, named from the dropped folder, hidden ones left out", async () => {
  const { files, skipped } = await scanPaths([join(base, "notes"), join(base, "bio.pdf")]);
  assert.deepEqual(paths(files), ["bio.pdf", "notes/a.md", "notes/deep/deeper/b.txt"]);
  const deep = files.find((file) => file.name === "b.txt");
  assert.deepEqual(deep, { path: "notes/deep/deeper/b.txt", name: "b.txt", size: 5, source: join(base, "notes/deep/deeper/b.txt") });
  assert.deepEqual(skipped, [{ path: "notes/link.pdf", reason: "link" }]);
});

test("streams the files in batches as it goes", async () => {
  const batches = [];
  const { files } = await scanPaths([join(base, "notes")], { batchSize: 1, onBatch: (batch) => batches.push(batch) });
  assert.equal(batches.length, 2);
  assert.deepEqual(batches.flat(), files);
});

test("bad roots fail fast as bad input", async () => {
  await assert.rejects(scanPaths([]), { kind: "bad-input" });
  await assert.rejects(scanPaths(["notes"]), { kind: "bad-input" });
  await assert.rejects(scanPaths([join(base, "missing")]), { kind: "bad-input" });
});

test("an unreadable subfolder is reported as skipped, the rest still found", async () => {
  await tree({ "locked/open.md": "x", "locked/shut/secret.md": "x" });
  await chmod(join(base, "locked/shut"), 0o000);
  try {
    const { files, skipped } = await scanPaths([join(base, "locked")]);
    assert.deepEqual(paths(files), ["locked/open.md"]);
    assert.deepEqual(skipped, [{ path: "locked/shut", reason: "EACCES" }]);
  } finally {
    await chmod(join(base, "locked/shut"), 0o755);
  }
});

test("an aborted scan stops", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(scanPaths([join(base, "notes")], { signal: controller.signal }), { name: "AbortError" });
});
