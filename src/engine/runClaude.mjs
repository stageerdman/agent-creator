// One-shot call shape. Port of masters-wheel claude_cli.rs::run_claude:
// `--output-format json`, no tools, one reply back. For internal jobs
// (titles, scores, extraction). Callers ask for plain labeled lines
// (`RATING: 3`) rather than JSON content and parse them defensively.

import { buildClaudeArgs } from "./claudeArgs.mjs";
import { runCliProcess } from "./cliProcess.mjs";
import { ClaudeCliError, failure } from "./errors.mjs";
import { resolveBinary } from "./resolveBinary.mjs";
import { readResult } from "./streamEvents.mjs";
import { createLogger, newTraceId } from "../log/logger.mjs";

const log = createLogger("engine");

// Resolves to { text, sessionId }.
export async function runClaude(
  { message, systemPrompt = "", resumeSessionId, model, effort },
  { signal, traceId = newTraceId(), binary = resolveBinary("claude"), spawn } = {},
) {
  const args = buildClaudeArgs({ systemPrompt, message, resumeSessionId, model, effort, stream: false });
  log.info("runClaude", "start", { traceId, binary, model });

  const lines = [];
  try {
    const { code, stderr } = await runCliProcess({ binary, args, onLine: (line) => lines.push(line), signal, spawn });
    if (code !== 0) throw failure(stderr);
    const result = readResult(parseJson(lines.join("\n")));
    if (result.isError || !result.text) throw failure("", result.text);
    log.info("runClaude", "done", { traceId, sessionId: result.sessionId });
    return { text: result.text, sessionId: result.sessionId };
  } catch (error) {
    log.error("runClaude", "failed", { traceId, error });
    throw error;
  }
}

function parseJson(stdout) {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new ClaudeCliError("bad-output", `Couldn't parse Claude's reply: ${error.message}`, { cause: error });
  }
}
