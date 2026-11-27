import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeKnowledge } from "./merge.mjs";

test("mergeKnowledge: one section per source, in order, titled, sourced, note quoted", () => {
  const text = mergeKnowledge([
    { path: "notes/a.md", title: "Week one\nplan", note: "Use this first.\nIt is short.", text: "\nAlpha text.\n" },
    { path: "bio.pdf", text: "Bio text." },
  ]);
  assert.equal(text, [
    "## Week one plan", "", "_Source: notes/a.md_", "", "> Use this first.", "> It is short.", "", "Alpha text.", "",
    "## bio.pdf", "", "_Source: bio.pdf_", "", "Bio text.", "",
  ].join("\n"));
});

test("mergeKnowledge: no sources is an empty file", () => {
  assert.equal(mergeKnowledge([]), "");
});
