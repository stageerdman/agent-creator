import { test } from "node:test";
import assert from "node:assert/strict";
import { fileSummary } from "./fileSummary.mjs";

const file = (path, feeds = []) => ({ path, name: path.split("/").at(-1), feeds });

test("fileSummary: a short list names every file and its routable feeds; removed files are hidden", () => {
  const summary = fileSummary([
    file("a.md", ["rag", "skill:x"]), file("b.pdf"), { ...file("gone.md"), removed: true },
  ]);
  assert.equal(summary, "<files>\n- a.md → rag\n- b.pdf → not routed yet\n</files>");
  assert.equal(fileSummary([{ ...file("gone.md"), removed: true }]), "");
});

test("fileSummary: a long list becomes folders with counts per type and per feed", () => {
  const files = [file("books/a.pdf", ["rag"]), file("books/b.pdf"), file("books/c.MD", ["rag", "instructions"]), file("top.txt")];
  const lines = fileSummary(files, 3).split("\n");
  assert.match(lines[1], /^4 files, too many/);
  assert.deepEqual(lines.slice(2, -1), [
    "- books/ : 3 files (2 pdf, 1 md) → rag 2, not routed yet 1, instructions 1",
    "- (top level) : 1 files (1 txt) → not routed yet 1",
  ]);
});

test("fileSummary: too many folders collapse to top folders", () => {
  const files = ["x/1/a.md", "x/2/b.md", "x/3/c.md", "y/d.md"].map((path) => file(path));
  const rows = fileSummary(files, 2).split("\n").slice(2, -1);
  assert.deepEqual(rows.map((row) => row.split(" :")[0]), ["- x/", "- y/"]);
});
