import { test } from "node:test";
import assert from "node:assert/strict";
import { ageLabel, sortAgents, filterAgents, nameOf, descOf } from "./agent-list.js";

const now = Date.parse("2026-11-26T12:00:00Z");
const ago = (ms) => new Date(now - ms).toISOString();
const S = 1e3, M = 60 * S, H = 60 * M, D = 24 * H;

test("ageLabel: whole numbers, rounded down, singular for 1", () => {
  assert.equal(ageLabel(ago(0), now), "just now");
  assert.equal(ageLabel(ago(59 * S), now), "just now");
  assert.equal(ageLabel(ago(60 * S), now), "1 min");
  assert.equal(ageLabel(ago(5 * M + 40 * S), now), "5 min");
  assert.equal(ageLabel(ago(3 * H + 59 * M), now), "3 h");
  assert.equal(ageLabel(ago(1 * D), now), "1 day");
  assert.equal(ageLabel(ago(2 * D + 23 * H), now), "2 days");
  assert.equal(ageLabel(ago(7 * D), now), "1 week");
  assert.equal(ageLabel(ago(3 * 7 * D), now), "3 weeks");
  assert.equal(ageLabel(ago(4 * 30 * D + D), now), "4 months");
  assert.equal(ageLabel(ago(2 * 365 * D + D), now), "2 years");
});

test("ageLabel: a future date or a bad one is 'just now', never a minus number", () => {
  assert.equal(ageLabel(new Date(now + 5 * M).toISOString(), now), "just now");
  assert.equal(ageLabel(undefined, now), "just now");
  assert.equal(ageLabel("nonsense", now), "just now");
});

const A = (id, createdAt, name = id, description = "") => ({ id, draft: { name, status: "saved", description }, createdAt, updatedAt: createdAt });

test("sortAgents: newest createdAt first; ties by id, stable across loads", () => {
  const list = [A("b", ago(D)), A("a", ago(M)), A("d", ago(H)), A("c", ago(H)), A("e", ago(30 * D))];
  assert.deepEqual(sortAgents(list).map((a) => a.id), ["a", "c", "d", "b", "e"]);
  assert.deepEqual(sortAgents(list.slice().reverse()).map((a) => a.id), ["a", "c", "d", "b", "e"]);
});

test("sortAgents: an old record without createdAt sorts by updatedAt", () => {
  const old = { id: "old", draft: { name: "Old" }, updatedAt: ago(2 * D) };
  assert.deepEqual(sortAgents([old, A("x", ago(3 * D)), A("y", ago(D))]).map((a) => a.id), ["y", "old", "x"]);
});

test("sortAgents: an old record's updatedAt that ties another's createdAt falls back to id, either order", () => {
  const t = ago(2 * D);
  const old = { id: "m-old", draft: { name: "Old" }, updatedAt: t };
  const list = [old, A("z", t), A("a", t), A("n", ago(H))];
  assert.deepEqual(sortAgents(list).map((a) => a.id), ["n", "a", "m-old", "z"]);
  assert.deepEqual(sortAgents(list.slice().reverse()).map((a) => a.id), ["n", "a", "m-old", "z"]);
});

test("filterAgents: one letter, full name, case, description words, no match, empty", () => {
  const list = [A("1", ago(M), "Marcus", "A stoic mentor"), A("2", ago(H), "Maya", "Design teacher"), A("3", ago(D), "Rex Hart", "Tough-love coach"), A("4", ago(2 * D), "Inès", "")];
  const ids = (q) => filterAgents(list, q).map((a) => a.id);
  assert.deepEqual(ids("m"), ["1", "2"]);
  assert.deepEqual(ids("ma"), ["1", "2"]);
  assert.deepEqual(ids("mar"), ["1"]);
  assert.deepEqual(ids("REX HART"), ["3"]);
  assert.deepEqual(ids("coach"), ["3"]);
  assert.deepEqual(ids("ines"), ["4"]);
  assert.deepEqual(ids("rxe"), []);
  assert.deepEqual(ids(""), ["1", "2", "3", "4"]);
  assert.deepEqual(ids("   "), ["1", "2", "3", "4"]);
});

test("nameOf/descOf: blank names read Untitled, missing descriptions are empty", () => {
  assert.equal(nameOf({ draft: { name: "  " } }), "Untitled");
  assert.equal(descOf({ draft: {} }), "");
});
