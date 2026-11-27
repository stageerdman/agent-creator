import { test } from "node:test";
import assert from "node:assert/strict";
import { chunkText, TARGET_CHUNK_CHARS, OVERLAP_CHARS } from "./chunk.mjs";

const paragraph = (letter, length) => letter.repeat(length);

test("short text is one chunk; blank and empty text is none", () => {
  assert.deepEqual(chunkText("one\n\n  two  \n\n\n\nthree"), ["one\n\ntwo\n\nthree"]);
  assert.deepEqual(chunkText(" \n\n \n"), []);
  assert.deepEqual(chunkText(""), []);
});

test("paragraphs pack up to the target and the next chunk opens with the last 200 chars", () => {
  const text = [paragraph("a", 1000), paragraph("b", 600), paragraph("c", 100)].join("\r\n\r\n");
  const chunks = chunkText(text);
  assert.equal(chunks.length, 2);
  assert.equal(chunks[0], paragraph("a", 1000));
  assert.equal(chunks[1], `${paragraph("a", OVERLAP_CHARS)}\n\n${paragraph("b", 600)}\n\n${paragraph("c", 100)}`);
  assert.ok(chunks.every((chunk) => chunk.length <= TARGET_CHUNK_CHARS + OVERLAP_CHARS));
});

test("one huge paragraph is sliced, never cutting a multi-unit character", () => {
  const chunks = chunkText("😀".repeat(TARGET_CHUNK_CHARS * 2 + 10));
  assert.deepEqual(chunks.map((chunk) => Array.from(chunk).length), [TARGET_CHUNK_CHARS, TARGET_CHUNK_CHARS, 10]);
  assert.ok(chunks.every((chunk) => !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(chunk)));
});

test("the overlap never starts on half a surrogate pair", () => {
  // 1,601 code units: the last 200 start on the low half of an emoji.
  const chunks = chunkText(`${"😀".repeat(800)}x\n\n${paragraph("z", 1000)}`);
  assert.equal(chunks.length, 2);
  assert.ok(chunks[1].startsWith("😀"));
  assert.ok(chunks[1].endsWith(`x\n\n${paragraph("z", 1000)}`));
});
