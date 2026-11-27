import { test } from "node:test";
import assert from "node:assert/strict";
import { addFiles } from "../files.mjs";
import { kindOf } from "./kinds.mjs";
import { sortFiles } from "./rules.mjs";

const library = () =>
  addFiles([], [
    { path: "books/dune.pdf" }, { path: "books/notes.md" }, { path: "books/cover.png" },
    { path: "talks/a.mp4" }, { path: "talks/b.MP3" }, { path: "readme.txt" },
  ], "2026-01-01T00:00:00.000Z").files;

const feedsOf = (files) => Object.fromEntries(files.map((file) => [file.path, file.feeds]));
const first = () => 0; // the sampler always takes the first remaining file

test("kindOf: names a kind by extension, any case; unknown is other", () => {
  assert.deepEqual(["a.PDF", "b.md", "c.docx", "d.mov", "e.m4a", "f.jpg", "g.xyz", "Makefile", ".env"].map(kindOf),
    ["pdf", "text", "document", "video", "audio", "image", "other", "other", "other"]);
});

test("rules: only PDF and MD go to knowledge; every other file loses rag", () => {
  const files = sortFiles(library(), { files: { "/": "both" } }).files;
  const sorted = sortFiles(files, { rules: [{ to: "rag", files: { types: ["pdf", ".MD"] }, only: true }] });
  assert.deepEqual(feedsOf(sorted.files), {
    "books/dune.pdf": ["rag"], "books/notes.md": ["rag"], "books/cover.png": ["instructions"],
    "talks/a.mp4": ["instructions"], "talks/b.MP3": ["instructions"], "readme.txt": ["instructions"],
  });
  assert.deepEqual(sorted.rules, [{ to: "rag", picked: 2, only: true }]);
  assert.equal(sorted.changed.length, 6);
});

test("rules: this book for the persona, the rest for RAG", () => {
  const { files, rules } = sortFiles(library(), {
    rules: [{ to: "instructions", files: { in: "books/dune.pdf" } }, { to: "rag", files: { rest: true } }],
  });
  assert.deepEqual(feedsOf(files)["books/dune.pdf"], ["instructions"]);
  assert.ok(files.filter((file) => file.path !== "books/dune.pdf").every((file) => file.feeds.join() === "rag"));
  assert.deepEqual(rules.map((rule) => rule.picked), [1, 5]);
});

test("rules: a sample is a count or a share, picked by the injected random, kept in list order", () => {
  const last = () => 0.999;
  const byCount = sortFiles(library(), { rules: [{ to: "instructions", sample: 2 }] }, last);
  assert.deepEqual(byCount.changed, ["books/dune.pdf", "readme.txt"]);
  const byShare = sortFiles(library(), { rules: [{ to: "instructions", files: { in: "books" }, sample: "10%" }] }, first);
  assert.deepEqual(byShare.changed, ["books/dune.pdf"], "a share is at least one file");
});

test("rules: kinds and folders combine; path routes run first; skill feeds and removed files stay", () => {
  const start = library().map((file) =>
    file.path === "talks/a.mp4" ? { ...file, feeds: ["skill:x"] } : file.path === "readme.txt" ? { ...file, removed: true } : file);
  const { files } = sortFiles(start, {
    files: { "talks/": "instructions" },
    rules: [{ to: "rag", files: { types: ["video", "text"], in: ["talks/", "/"] } }],
  });
  const feeds = feedsOf(files);
  assert.deepEqual(feeds["talks/a.mp4"], ["rag", "skill:x"]);
  assert.deepEqual(feeds["talks/b.MP3"], ["instructions"]);
  assert.deepEqual(feeds["books/notes.md"], ["rag"]);
  assert.deepEqual(feeds["readme.txt"], []);
});

test("rules: bad rules are skipped, nothing changes, the same list comes back", () => {
  const files = library();
  const sorted = sortFiles(files, { rules: [
    { to: "elsewhere" }, null, { to: "rag", sample: 0 }, { to: "rag", sample: "150%" },
    { to: "rag", files: { types: [] } }, { to: "rag", files: { types: ["epub"] } },
  ] });
  assert.equal(sorted.files, files);
  assert.deepEqual(sorted.changed, []);
  assert.deepEqual(sorted.rules, [{ to: "rag", picked: 0, only: false }]);
  assert.equal(sortFiles(files, { rules: "everything to rag" }).files, files);
});
