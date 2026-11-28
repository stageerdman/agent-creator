import { test } from "node:test";
import assert from "node:assert/strict";
import { createTurnLanes } from "./turnLanes.mjs";

// A turn that runs until it is released or aborted, like a thinking CLI.
function heldTurn() {
  let release;
  const started = Promise.withResolvers();
  const work = (signal) => {
    started.resolve();
    return new Promise((resolve, reject) => {
      release = resolve;
      signal.addEventListener("abort", () => reject(new Error("killed")), { once: true });
    });
  };
  return { work, started: started.promise, release: (value) => release(value) };
}

test("a message sent while a turn thinks waits, is told so, and runs right after", async () => {
  const lanes = createTurnLanes();
  const first = heldTurn();
  const order = [];
  let queued = 0;
  const a = lanes.run("x", first.work, { onQueued: () => queued++ }).then((v) => order.push(v));
  const b = lanes.run("x", async () => "b", { onQueued: () => queued++ }).then((v) => order.push(v));
  await first.started;
  assert.equal(queued, 1);
  assert.deepEqual(order, []);
  first.release("a");
  await Promise.all([a, b]);
  assert.deepEqual(order, ["a", "b"]);
});

test("stop cancels the running turn and the waiting ones as Stopped; the lane is free after", async () => {
  const lanes = createTurnLanes();
  const first = heldTurn();
  let secondRan = false;
  const a = lanes.run("x", first.work);
  const b = lanes.run("x", async () => (secondRan = true));
  await first.started;
  assert.equal(lanes.stop("x"), 2);
  await assert.rejects(a, { name: "Stopped", kind: "cancelled" });
  await assert.rejects(b, { name: "Stopped", kind: "cancelled" });
  assert.equal(secondRan, false);
  assert.equal(lanes.stop("x"), 0);
  assert.equal(await lanes.run("x", async () => "fresh"), "fresh");
});

test("lanes are per agent; a closed request cancels its own turn only", async () => {
  const lanes = createTurnLanes();
  const first = heldTurn();
  const closed = new AbortController();
  const a = lanes.run("x", first.work, { signal: closed.signal });
  assert.equal(await lanes.run("y", async () => "other agent"), "other agent");
  await first.started;
  closed.abort();
  await assert.rejects(a, { kind: "cancelled" });
});

test("a failing turn keeps its own error and does not block the next", async () => {
  const lanes = createTurnLanes();
  const failing = lanes.run("x", async () => {
    throw Object.assign(new Error("boom"), { kind: "failed" });
  });
  const next = lanes.run("x", async () => "next");
  await assert.rejects(failing, { kind: "failed" });
  assert.equal(await next, "next");
});
