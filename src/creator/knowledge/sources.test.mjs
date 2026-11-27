import { test } from "node:test";
import assert from "node:assert/strict";
import { addFiles } from "../files.mjs";
import { assignFiles, markProcessed } from "../sections.mjs";
import { adjustSource, buildPlan, sourcesOf, swapSource, takeOut } from "./sources.mjs";

const AT = "2026-11-28T10:00:00.000Z";
// a.md and b.md in Knowledge and baked; a.md also feeds the instructions.
function baked() {
  const files = addFiles([], [{ path: "a.md" }, { path: "b.md" }, { path: "c.md" }], AT).files;
  const assigned = assignFiles(assignFiles(files, "rag", ["a.md", "b.md"]).files, "instructions", ["a.md"]).files;
  const marked = assigned.map((file) => (file.path === "c.md" ? file : { ...file, text: "ok", embed: "ok" }));
  return markProcessed(markProcessed(marked, "rag", ["a.md", "b.md"]), "instructions", ["a.md"]);
}
const view = (files) => sourcesOf(files).map(({ path, state, title, note, embed }) => ({ path, state, title, note, embed }));

test("adjustSource sets or clears title and note, and dims the source until the next Build", () => {
  const titled = adjustSource(baked(), "./a.md", { title: "  Plan ", note: "Read first." });
  assert.deepEqual(view(titled)[0], { path: "a.md", state: "unprocessed", title: "Plan", note: "Read first.", embed: "ok" });
  assert.deepEqual(titled[0].baked, ["instructions"]);
  const cleared = adjustSource(titled, "a.md", { note: "" });
  assert.deepEqual(view(cleared)[0], { path: "a.md", state: "unprocessed", title: "Plan", note: null, embed: "ok" });
  assert.throws(() => adjustSource(baked(), "a.md", { title: 3 }), { kind: "bad-input" });
  assert.throws(() => adjustSource(baked(), "c.md", { title: "x" }), { kind: "not-found" });
});

test("takeOut leaves Knowledge at once (red until Build) but stays in the list and its other feeds", () => {
  const files = takeOut(baked(), "a.md");
  assert.deepEqual(view(files)[0], { path: "a.md", state: "removed", title: null, note: null, embed: null });
  assert.deepEqual(files[0].feeds, ["instructions"]);
  assert.equal(files.length, 3);
  assert.throws(() => takeOut(files, "a.md"), { kind: "not-found" });
});

test("swapSource puts the new file in the old one's place with its title and note; the old one leaves", () => {
  const titled = adjustSource(baked(), "a.md", { title: "Plan", note: "Read first." });
  const { files, path } = swapSource(titled, "a.md", { path: "./new/a2.md", size: 9 }, AT);
  assert.equal(path, "new/a2.md");
  assert.deepEqual(files.map((file) => file.path), ["new/a2.md", "a.md", "b.md", "c.md"]);
  assert.deepEqual(view(files)[0], { path: "new/a2.md", state: "unprocessed", title: "Plan", note: "Read first.", embed: null });
  assert.deepEqual([files[1].feeds, files[1].title, files[1].embed], [["instructions"], undefined, undefined]);
  assert.equal(view(swapSource(baked(), "a.md", { path: "x.md" }, AT).files)[1].state, "removed", "baked, the old one shows red");
  const known = swapSource(baked(), "b.md", { path: "c.md" }, AT).files;
  assert.deepEqual(known.map((file) => file.path), ["a.md", "c.md", "b.md"], "a file already in the list moves to the old place");
  assert.throws(() => swapSource(baked(), "a.md", { path: "a.md" }, AT), { kind: "bad-input" });
  assert.throws(() => swapSource(baked(), "a.md", { path: "b.md" }, AT), { kind: "bad-input" });
  assert.throws(() => swapSource(baked(), "c.md", { path: "d.md" }, AT), { kind: "not-found" });
});

test("buildPlan merges only sources with a copy that are proven searchable, and says why not for the rest", () => {
  const files = assignFiles(baked(), "rag", ["c.md"]).files.map((file) =>
    (file.path === "b.md" ? { ...file, embed: "not-found" } : file));
  const binary = [...files, { path: "d.bin", name: "d.bin", feeds: ["rag"], text: "binary" }];
  assert.deepEqual(buildPlan(binary), {
    built: ["a.md"],
    skipped: [{ path: "b.md", reason: "not-found" }, { path: "c.md", reason: "no-copy" }, { path: "d.bin", reason: "binary" }],
  });
});
