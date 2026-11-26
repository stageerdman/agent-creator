import { test } from "node:test";
import assert from "node:assert/strict";
import { addFiles, dnaOf, feedOf, routeFiles } from "./files.mjs";

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

test("addFiles: new files get the stamp; a repeat keeps its first one", () => {
  const first = addFiles([], [{ path: "a.md" }], "2026-11-01T10:00:00.000Z").files;
  const again = addFiles(first, [{ path: "a.md" }, { path: "b.md" }], "2026-11-02T10:00:00.000Z").files;
  assert.deepEqual(again.map((f) => [f.path, f.addedAt]), [
    ["a.md", "2026-11-01T10:00:00.000Z"],
    ["b.md", "2026-11-02T10:00:00.000Z"],
  ]);
});

test("dnaOf: oldest first, topic is the top folder, old files take the fallback", () => {
  const files = [
    { path: "Talks/day 1/a.mp4", name: "a.mp4", size: 5e7, feeds: [], addedAt: "2026-11-03T00:00:00.000Z" },
    { path: "bio.pdf", name: "bio.pdf", size: null, feeds: [] },
    { path: "notes/x.md", name: "x.md", size: 12, feeds: ["rag"], addedAt: "2026-11-02T00:00:00.000Z" },
  ];
  assert.deepEqual(dnaOf(files, "2026-11-01T00:00:00.000Z"), [
    { id: "bio.pdf", name: "bio.pdf", sizeBytes: null, addedAt: "2026-11-01T00:00:00.000Z", topic: "other" },
    { id: "notes/x.md", name: "x.md", sizeBytes: 12, addedAt: "2026-11-02T00:00:00.000Z", topic: "notes" },
    { id: "Talks/day 1/a.mp4", name: "a.mp4", sizeBytes: 5e7, addedAt: "2026-11-03T00:00:00.000Z", topic: "talks" },
  ]);
  assert.deepEqual(dnaOf(undefined, "2026-11-01T00:00:00.000Z"), []);
});

test("addFiles: a file without a path fails fast", () => {
  assert.throws(() => addFiles([], [{ name: "x" }]), { kind: "bad-input" });
  assert.throws(() => addFiles([], [{ path: "./" }]), { kind: "bad-input" });
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
