import { test } from "node:test";
import assert from "node:assert/strict";
import { chunkFitOf, cleanTextOf, structureOf } from "./structure.mjs";
import { EXCERPT_PIECE_CHARS, GAP_MARK, excerptOf } from "./excerpt.mjs";

const sentence = "A plain sentence about the subject at hand. ";
const paragraph = (chars) => sentence.repeat(Math.ceil(chars / sentence.length)).slice(0, chars).trim();
const wellShaped = Array.from({ length: 12 }, () => paragraph(400)).join("\n\n");

test("chunk fit: paragraphs of a sane size fit fully", () => {
  assert.equal(chunkFitOf(wellShaped), 100);
});

test("chunk fit: a wall of text sliced mid-paragraph fits nowhere", () => {
  assert.equal(chunkFitOf(paragraph(5000)), 0);
});

test("chunk fit: one oversized chunk the chunker would not slice is too big", () => {
  assert.equal(chunkFitOf(paragraph(2500)), 0);
});

test("chunk fit: a short file in one chunk is fine, tiny chunks among many are not", () => {
  assert.equal(chunkFitOf("Just a short note."), 100);
  const tinyFirst = ["Tiny heading", paragraph(1490)].join("\n\n");
  assert.equal(chunkFitOf(tinyFirst), 50);
});

test("clean text: page numbers, rules and running headers count against it", () => {
  assert.equal(cleanTextOf("Real words in a line.\nMore real words here."), 100);
  const noisy = ["THE BOOK", "Real words in a line.", "12", "-----", "THE BOOK", "More real words here."].join("\n");
  const score = cleanTextOf(noisy);
  assert.ok(score > 50 && score < 100, `score ${score}`);
});

test("structure: knowledge files average chunk fit and clean text; persona and skill files only clean text", () => {
  const wall = paragraph(5000);
  assert.deepEqual(structureOf(wall, "knowledge"), { score: 50, chunkFit: 0, clean: 100 });
  assert.deepEqual(structureOf(wall, "knowledge, skill"), { score: 50, chunkFit: 0, clean: 100 });
  assert.deepEqual(structureOf(wall, "persona"), { score: 100, chunkFit: null, clean: 100 });
  assert.deepEqual(structureOf(wall, "skill"), { score: 100, chunkFit: null, clean: 100 });
});

test("excerpt: a short file is shown whole", () => {
  assert.equal(excerptOf("  short text  "), "short text");
});

test("excerpt: a long file is head, middle and tail", () => {
  const text = `HEAD${"x".repeat(10000)}MID${"y".repeat(10000)}TAIL`;
  const pieces = excerptOf(text).split(GAP_MARK);
  assert.equal(pieces.length, 3);
  assert.ok(pieces[0].startsWith("HEAD"));
  assert.ok(pieces[1].includes("MID"));
  assert.ok(pieces[2].endsWith("TAIL"));
  assert.ok(pieces.every((piece) => piece.length === EXCERPT_PIECE_CHARS));
});
