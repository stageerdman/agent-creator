import { test } from "node:test";
import assert from "node:assert/strict";
import { createLogger } from "./logger.mjs";

function capture(env = {}) {
  const lines = [];
  const logger = createLogger("engine", { write: (line) => lines.push(JSON.parse(line)), env });
  return { logger, lines };
}

test("every line carries module, fn and the caller's context", () => {
  const { logger, lines } = capture();
  logger.info("askAgent", "spawned", { traceId: "t1", pid: 42 });
  assert.equal(lines.length, 1);
  assert.deepEqual(
    { module: lines[0].module, fn: lines[0].fn, message: lines[0].message, traceId: lines[0].traceId, pid: lines[0].pid },
    { module: "engine", fn: "askAgent", message: "spawned", traceId: "t1", pid: 42 },
  );
});

test("errors are serialized with name, message and kind", () => {
  const { logger, lines } = capture();
  const error = Object.assign(new Error("boom"), { kind: "failed" });
  logger.error("runClaude", "call failed", { error });
  assert.deepEqual(lines[0].error, { name: "Error", message: "boom", kind: "failed" });
});

test("LOG_LEVEL drops lines below the threshold", () => {
  const { logger, lines } = capture({ LOG_LEVEL: "warn" });
  logger.info("f", "hidden");
  logger.warn("f", "shown");
  assert.deepEqual(lines.map((l) => l.message), ["shown"]);
});
