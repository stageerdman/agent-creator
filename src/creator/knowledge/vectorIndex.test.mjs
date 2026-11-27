import { test } from "node:test";
import assert from "node:assert/strict";
import { cosine, emptyIndex, filesIn, search, withFile, withoutFiles } from "./vectorIndex.mjs";

const index = withFile(
  withFile(emptyIndex("fake", 2), "a.md", [{ text: "east", vector: [1, 0] }, { text: "north-east", vector: [1, 1] }]),
  "b.md",
  [{ text: "north", vector: new Float32Array([0, 1]) }],
);

test("cosine: same direction 1, at right angles 0, a zero vector 0", () => {
  assert.equal(cosine([2, 0], [5, 0]), 1);
  assert.equal(cosine([1, 0], [0, 3]), 0);
  assert.equal(cosine([0, 0], [1, 1]), 0);
});

test("search gives the k closest chunks, best first, as plain JSON", () => {
  const hits = search(index, [0.1, 1], 2);
  assert.deepEqual(hits.map((hit) => hit.text), ["north", "north-east"]);
  assert.ok(hits[0].score > hits[1].score);
  assert.deepEqual(JSON.parse(JSON.stringify(index)).chunks[2].vector, [0, 1], "typed arrays are stored as plain arrays");
});

test("a file's new chunks replace its old ones; dropping removes only that file", () => {
  const replaced = withFile(index, "a.md", [{ text: "west", vector: [-1, 0] }]);
  assert.deepEqual(replaced.chunks.map((chunk) => chunk.text), ["north", "west"]);
  assert.deepEqual(filesIn(withoutFiles(replaced, ["a.md", "never.md"])), ["b.md"]);
  assert.equal(index.chunks.length, 3, "the original index is left as it was");
});
