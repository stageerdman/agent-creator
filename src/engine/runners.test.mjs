import { test } from "node:test";
import assert from "node:assert/strict";
import { askAgent, runClaude, checkCli, ClaudeCliError } from "./index.mjs";
import { fakeSpawn } from "./testing/fakeSpawn.mjs";

const kind = (expected) => (error) => error instanceof ClaudeCliError && error.kind === expected;

test("askAgent streams deltas, then resolves with the result event", async () => {
  const deltas = [];
  const reply = await askAgent(
    { message: "--- starts with dashes" },
    { spawn: fakeSpawn("stream-ok"), onDelta: (text) => deltas.push(text) },
  );
  assert.deepEqual(deltas, ["Echo: ", "--- starts with dashes"]);
  assert.deepEqual(reply, { text: "Echo: --- starts with dashes", sessionId: "sess-1", contextTokens: 15, contextWindow: 200000 });
});

test("askAgent: non-zero exit reports stderr", async () => {
  await assert.rejects(askAgent({ message: "hi" }, { spawn: fakeSpawn("stream-fail") }), (error) =>
    kind("failed")(error) && error.message === "Not logged in");
});

test("askAgent: is_error reports the result text", async () => {
  await assert.rejects(askAgent({ message: "hi" }, { spawn: fakeSpawn("stream-is-error") }), (error) =>
    kind("failed")(error) && error.message === "Credit balance too low");
});

test("askAgent: no result event is a failure, not an empty reply", async () => {
  await assert.rejects(askAgent({ message: "hi" }, { spawn: fakeSpawn("stream-no-result") }), kind("failed"));
});

test("askAgent: a missing binary is not-installed", async () => {
  await assert.rejects(askAgent({ message: "hi" }, { binary: "/nonexistent/claude" }), kind("not-installed"));
});

test("askAgent: aborting kills a hung CLI and rejects as cancelled", async () => {
  const controller = new AbortController();
  const pending = askAgent(
    { message: "hi" },
    { spawn: fakeSpawn("hang"), signal: controller.signal, onDelta: () => controller.abort() },
  );
  await assert.rejects(pending, kind("cancelled"));
});

test("runClaude returns text and session id", async () => {
  assert.deepEqual(await runClaude({ message: "x" }, { spawn: fakeSpawn("once-ok") }), { text: "Echo: x", sessionId: "sess-1" });
});

test("runClaude: unparseable output is bad-output", async () => {
  await assert.rejects(runClaude({ message: "x" }, { spawn: fakeSpawn("once-bad-json") }), kind("bad-output"));
});

test("checkCli reports version, or not installed", async () => {
  assert.deepEqual(await checkCli({ binary: "claude", spawn: fakeSpawn("version") }), {
    installed: true, binary: "claude", version: "9.9.9 (Claude Code)",
  });
  assert.equal((await checkCli({ binary: "/nonexistent/claude" })).installed, false);
});
