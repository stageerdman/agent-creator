import { test } from "node:test";
import assert from "node:assert/strict";
import { buildClaudeArgs } from "./claudeArgs.mjs";
import { parseStreamLine, extractContextUsage } from "./streamEvents.mjs";
import { resolveBinary } from "./resolveBinary.mjs";

const base = { systemPrompt: "sys", message: "hello" };

test("args: `-p -- <message>` is always last, even for a message starting with `-`", () => {
  const args = buildClaudeArgs({ ...base, message: "--- not a flag", resumeSessionId: "s1", model: "m", stream: true });
  assert.deepEqual(args.slice(-3), ["-p", "--", "--- not a flag"]);
  assert.equal(args.indexOf("--"), args.length - 2);
});

test("args: built-in tools off and dontAsk on, in both shapes", () => {
  for (const stream of [true, false]) {
    const args = buildClaudeArgs({ ...base, stream });
    assert.equal(args[args.indexOf("--tools") + 1], "");
    assert.equal(args[args.indexOf("--permission-mode") + 1], "dontAsk");
    assert.equal(args[args.indexOf("--system-prompt") + 1], "sys");
    assert.ok(!args.includes("--append-system-prompt"));
  }
});

test("args: streaming needs stream-json + partial messages + verbose; one-shot uses json", () => {
  const stream = buildClaudeArgs({ ...base, stream: true });
  assert.equal(stream[stream.indexOf("--output-format") + 1], "stream-json");
  assert.ok(stream.includes("--include-partial-messages") && stream.includes("--verbose"));
  const once = buildClaudeArgs(base);
  assert.equal(once[once.indexOf("--output-format") + 1], "json");
  assert.ok(!once.includes("--include-partial-messages"));
});

test("args: empty resume/model/effort are dropped, set ones are passed", () => {
  const none = buildClaudeArgs({ ...base, resumeSessionId: "", model: undefined, effort: null });
  for (const flag of ["--resume", "--model", "--effort"]) assert.ok(!none.includes(flag), flag);
  const all = buildClaudeArgs({ ...base, resumeSessionId: "s1", model: "haiku", effort: "low" });
  assert.equal(all[all.indexOf("--resume") + 1], "s1");
  assert.equal(all[all.indexOf("--model") + 1], "haiku");
  assert.equal(all[all.indexOf("--effort") + 1], "low");
});

test("stream: content_block_delta text becomes a delta; other lines are ignored", () => {
  const delta = { type: "stream_event", event: { type: "content_block_delta", delta: { type: "text_delta", text: "Hi" } } };
  assert.deepEqual(parseStreamLine(JSON.stringify(delta)), { kind: "delta", text: "Hi" });
  assert.equal(parseStreamLine(""), null);
  assert.equal(parseStreamLine("not json"), null);
  assert.equal(parseStreamLine(JSON.stringify({ type: "system", subtype: "init" })), null);
  assert.equal(parseStreamLine(JSON.stringify({ type: "stream_event", event: { type: "message_start" } })), null);
});

test("stream: the result event carries text, session id, error flag and usage", () => {
  const result = {
    type: "result",
    result: "Hello!",
    session_id: "abc",
    is_error: false,
    usage: { input_tokens: 10, cache_creation_input_tokens: 5, cache_read_input_tokens: 100, output_tokens: 7 },
    modelUsage: { "claude-x": { contextWindow: 200000 } },
  };
  assert.deepEqual(parseStreamLine(JSON.stringify(result)), {
    kind: "result", text: "Hello!", sessionId: "abc", isError: false, contextTokens: 122, contextWindow: 200000,
  });
});

test("usage: missing fields count as 0 (older CLI)", () => {
  assert.deepEqual(extractContextUsage({}), { contextTokens: 0, contextWindow: 0 });
  assert.deepEqual(extractContextUsage({ usage: { output_tokens: 3 } }), { contextTokens: 3, contextWindow: 0 });
});

test("resolveBinary: first known dir that has it wins, else the bare name", () => {
  const dirs = ["/a", "/b"];
  assert.equal(resolveBinary("claude", { dirs, exists: (p) => p === "/b/claude" }), "/b/claude");
  assert.equal(resolveBinary("claude", { dirs, exists: () => false }), "claude");
});
