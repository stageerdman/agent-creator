import { test } from "node:test";
import assert from "node:assert/strict";
import { addFiles, dnaOf, routeFiles } from "./files.mjs";
import { allocations, assignFiles, feedFor, markProcessed, rebuilt, removeFile, sectionFiles } from "./sections.mjs";

const skills = [{ id: "ab12cd34", name: "Coaching" }];
const fresh = () => addFiles([], [{ path: "notes/a.md", size: 3 }, { path: "notes/b.md" }, { path: "bio.pdf" }]).files;
const states = (files, feed) => sectionFiles(files, feed).map((file) => [file.path, file.state]);

test("allocations: one { file, section } per feed of each changed file, in changed order; no feed is none", () => {
  const files = assignFiles(routeFiles(fresh(), { "notes/a.md": "both", "bio.pdf": "none" }).files, "skill:ab12cd34", ["notes/a.md"]).files;
  assert.deepEqual(allocations(files, ["bio.pdf", "notes/a.md"]), [
    { file: "bio.pdf", section: "none" },
    { file: "notes/a.md", section: "knowledge" },
    { file: "notes/a.md", section: "system-prompt" },
    { file: "notes/a.md", section: "skill:ab12cd34" },
  ]);
});

test("feedFor: the menu's sections map to feeds; unknown ones fail fast", () => {
  assert.equal(feedFor("system-prompt"), "instructions");
  assert.equal(feedFor("knowledge"), "rag");
  assert.equal(feedFor("skill:ab12cd34", skills), "skill:ab12cd34");
  assert.throws(() => feedFor("persona"), { kind: "bad-input" });
  assert.throws(() => feedFor("skill:ffff0000", skills), { kind: "not-found" });
});

test("assigned files show unprocessed, turn processed once baked", () => {
  const assigned = assignFiles(fresh(), "rag", ["notes/a.md", "./bio.pdf"]);
  assert.deepEqual(assigned.changed, ["notes/a.md", "bio.pdf"]);
  assert.deepEqual(states(assigned.files, "rag"), [["notes/a.md", "unprocessed"], ["bio.pdf", "unprocessed"]]);

  const baked = markProcessed(assigned.files, "rag", ["bio.pdf", "notes/b.md"]);
  assert.deepEqual(states(baked, "rag"), [["notes/a.md", "unprocessed"], ["bio.pdf", "processed"]]);
  assert.deepEqual(states(baked, "instructions"), []);
  assert.deepEqual(dnaOf(baked).map((file) => file.state), ["unprocessed", "unprocessed", "processed"]);
  assert.deepEqual(assignFiles(baked, "rag", ["bio.pdf"]).changed, []);
});

test("assigning an unknown file fails as not found", () => {
  assert.throws(() => assignFiles(fresh(), "rag", ["ghost.md"]), { kind: "not-found" });
});

test("removing an unused file drops it; a baked one stays red until the rebuild", () => {
  const files = markProcessed(assignFiles(fresh(), "rag", ["notes/a.md", "bio.pdf"]).files, "rag", ["bio.pdf"]);
  const gone = removeFile(files, "notes/a.md");
  assert.equal(gone.state, "gone");
  assert.deepEqual(gone.files.map((file) => file.path), ["notes/b.md", "bio.pdf"]);

  const red = removeFile(gone.files, "bio.pdf");
  assert.equal(red.state, "removed");
  assert.deepEqual(states(red.files, "rag"), [["bio.pdf", "removed"]]);
  assert.equal(dnaOf(red.files).at(-1).state, "removed");
  assert.deepEqual(assignFiles(red.files, "rag", ["bio.pdf"]).changed, [], "a removed file is not reassigned");

  assert.deepEqual(rebuilt(red.files).map((file) => file.path), ["notes/b.md"]);
  assert.throws(() => removeFile(files, "ghost.md"), { kind: "not-found" });
});

test("dropping a removed file again brings it back", () => {
  const files = removeFile(markProcessed(assignFiles(fresh(), "rag", ["bio.pdf"]).files, "rag", ["bio.pdf"]), "bio.pdf").files;
  const back = addFiles(files, [{ path: "bio.pdf" }]);
  assert.deepEqual(back.added, ["bio.pdf"]);
  assert.equal(back.files.find((file) => file.path === "bio.pdf").removed, undefined);
});

test("a file routed elsewhere after baking shows red in its old section", () => {
  const files = markProcessed(assignFiles(fresh(), "rag", ["bio.pdf"]).files, "rag", ["bio.pdf"]);
  const moved = routeFiles(files, { "bio.pdf": "instructions" }).files;
  assert.deepEqual(states(moved, "rag"), [["bio.pdf", "removed"]]);
  assert.deepEqual(states(moved, "instructions"), [["bio.pdf", "unprocessed"]]);
  const again = rebuilt(moved);
  assert.deepEqual(states(again, "rag"), []);
  assert.deepEqual(states(again, "instructions"), [["bio.pdf", "processed"]]);
});

test("the creator's routing keeps skill feeds and skips removed files", () => {
  const files = assignFiles(fresh(), "skill:ab12cd34", ["notes/a.md"]).files;
  const routed = routeFiles(files, { "/": "rag" }).files;
  assert.deepEqual(routed[0].feeds, ["rag", "skill:ab12cd34"]);
  const removed = removeFile(markProcessed(routed, "rag", ["bio.pdf"]), "bio.pdf").files;
  assert.deepEqual(routeFiles(removed, { "/": "both" }).files.at(-1).feeds, []);
});
