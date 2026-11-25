import { test } from "node:test";
import assert from "node:assert/strict";
import { nextStop } from "./tab-focus.js";

const stops = ["a", "b", "c"];

test("nextStop moves forward and back, wrapping round", () => {
  assert.equal(nextStop(stops, "a", false), "b");
  assert.equal(nextStop(stops, "c", false), "a");
  assert.equal(nextStop(stops, "a", true), "c");
});

test("nextStop enters at the first (or last) stop from outside", () => {
  assert.equal(nextStop(stops, "body", false), "a");
  assert.equal(nextStop(stops, "body", true), "c");
  assert.equal(nextStop([], "body", false), null);
});
