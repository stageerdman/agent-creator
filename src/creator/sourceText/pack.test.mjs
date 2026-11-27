import { test } from "node:test";
import assert from "node:assert/strict";
import { packSources } from "./pack.mjs";

const part = (path, length) => ({ path, text: "x".repeat(length) });
const lengths = ({ sources }) => sources.map((source) => source.text.length);

test("packSources: everything fits, nothing is cut", () => {
  const packed = packSources([part("a", 10), part("b", 20)], 100);
  assert.deepEqual(lengths(packed), [10, 20]);
  assert.deepEqual(packed.cut, []);
});

test("packSources: a short file hands its unused share to the long ones, order kept", () => {
  const packed = packSources([part("long1", 500), part("short", 10), part("long2", 500)], 100);
  assert.deepEqual(lengths(packed), [45, 10, 45]);
  assert.deepEqual(packed.cut, ["long1", "long2"]);
});

test("packSources: the total never passes the cap", () => {
  const packed = packSources([part("a", 7), part("b", 50), part("c", 50)], 31);
  assert.ok(lengths(packed).reduce((sum, n) => sum + n, 0) <= 31);
  assert.deepEqual(lengths(packed), [7, 12, 12]);
});

test("packSources: a part's other fields travel with it, cut or not", () => {
  const packed = packSources([{ ...part("a", 50), role: "knowledge" }, { ...part("b", 5), role: "persona" }], 20);
  assert.deepEqual(packed.sources.map((source) => source.role), ["knowledge", "persona"]);
});

test("packSources: no parts is nothing", () => {
  assert.deepEqual(packSources([], 100), { sources: [], cut: [] });
});
