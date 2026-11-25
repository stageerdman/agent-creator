import { test } from "node:test";
import assert from "node:assert/strict";
import { addFiles, feedOf, routeFiles } from "./files.mjs";

const dropped = () =>
  addFiles([], [
    { path: "/notes/week 1.md", size: 120 },
    { path: "notes/deep/talk.txt", size: 9 },
    { path: "bio.pdf" },
  ]).files;

test("addFiles: nested paths are kept, cleaned, named; a repeat keeps its feeds", () => {
  const files = dropped();
  assert.deepEqual(files.map((f) => [f.path, f.name, f.size]), [
    ["notes/week 1.md", "week 1.md", 120],
    ["notes/deep/talk.txt", "talk.txt", 9],
    ["bio.pdf", "bio.pdf", null],
  ]);
  const routed = routeFiles(files, { "bio.pdf": "rag" }).files;
  const again = addFiles(routed, [{ path: "./bio.pdf" }, { path: "new.md" }]);
  assert.deepEqual(again.added, ["new.md"]);
  assert.deepEqual(again.files.find((f) => f.path === "bio.pdf").feeds, ["rag"]);
});

test("addFiles: a file without a path fails fast", () => {
  assert.throws(() => addFiles([], [{ name: "x" }]), TypeError);
});

test("routeFiles: own entry beats the deepest folder, which beats '/'", () => {
  const { files, changed } = routeFiles(dropped(), {
    "/": "rag",
    "notes/": "instructions",
    "notes/deep/": "both",
    "notes/week 1.md": "none",
  });
  assert.deepEqual(files.map((f) => f.feeds), [[], ["rag", "instructions"], ["rag"]]);
  assert.deepEqual(changed, ["notes/deep/talk.txt", "bio.pdf"]);
  assert.deepEqual(feedOf(files, "instructions").map((f) => f.path), ["notes/deep/talk.txt"]);
});

test("routeFiles: unknown routes and paths change nothing", () => {
  const files = dropped();
  const result = routeFiles(files, { "bio.pdf": "read it", "ghost.md": "rag" });
  assert.equal(result.files, files);
  assert.deepEqual(result.changed, []);
  assert.deepEqual(routeFiles(files, null).changed, []);
});
