// Pure readers for the Claude Code CLI's JSON output. Port of the event
// match in masters-wheel assistant.rs::ask_agent and its
// extract_context_usage, without the MCP tool_use/tool_result side events.

// One stdout line of `--output-format stream-json` → what it means to us:
// { kind: "delta", text } | { kind: "result", ... } | null (ignore).
export function parseStreamLine(line) {
  if (!line.trim()) return null;
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    return null; // non-JSON noise from the CLI is skipped, as in the Rust loop
  }
  if (event.type === "stream_event") return parseDelta(event.event);
  if (event.type === "result") return readResult(event);
  return null;
}

function parseDelta(inner) {
  const text = inner?.type === "content_block_delta" ? inner.delta?.text : undefined;
  return typeof text === "string" ? { kind: "delta", text } : null;
}

// The `result` event (stream-json) or the whole reply (json) is the
// authoritative answer — never the concatenated deltas.
export function readResult(event) {
  const { contextTokens, contextWindow } = extractContextUsage(event);
  return {
    kind: "result",
    text: typeof event.result === "string" ? event.result : "",
    sessionId: typeof event.session_id === "string" ? event.session_id : "",
    isError: event.is_error === true,
    contextTokens,
    contextWindow,
  };
}

// With --resume, usage covers the whole conversation so far: input + both
// cache splits of that same prompt + this turn's output = what the next turn
// starts from. The window comes from the (normally single) modelUsage entry.
// 0/0 means the CLI didn't report usage.
export function extractContextUsage(event) {
  const usage = event.usage ?? {};
  const count = (key) => (Number.isFinite(usage[key]) ? usage[key] : 0);
  const contextTokens =
    count("input_tokens") + count("cache_creation_input_tokens") + count("cache_read_input_tokens") + count("output_tokens");
  const firstModel = Object.values(event.modelUsage ?? {})[0];
  const contextWindow = Number.isFinite(firstModel?.contextWindow) ? firstModel.contextWindow : 0;
  return { contextTokens, contextWindow };
}
