// Streaming call shape. Port of masters-wheel assistant.rs::ask_agent's
// spawn → NDJSON loop → result → error mapping, without Spaces, tags,
// training sessions, RAG or MCP (later phases).

import { buildClaudeArgs } from "./claudeArgs.mjs";
import { runCliProcess } from "./cliProcess.mjs";
import { failure } from "./errors.mjs";
import { resolveBinary } from "./resolveBinary.mjs";
import { parseStreamLine } from "./streamEvents.mjs";
import { createLogger, newTraceId } from "../log/logger.mjs";

const log = createLogger("engine");

// Resolves to the AgentReply { text, sessionId, contextTokens, contextWindow };
// `onDelta(text)` fires for each streamed piece as it arrives. Pass the
// returned sessionId back as `resumeSessionId` to continue the conversation.
export async function askAgent(
  { message, systemPrompt = "", resumeSessionId, model, effort },
  { onDelta = () => {}, signal, traceId = newTraceId(), binary = resolveBinary("claude"), spawn } = {},
) {
  const args = buildClaudeArgs({ systemPrompt, message, resumeSessionId, model, effort, stream: true });
  log.info("askAgent", "start", { traceId, binary, resume: Boolean(resumeSessionId), chars: message.length });

  let result = null;
  const onLine = (line) => {
    const event = parseStreamLine(line);
    if (event?.kind === "delta") onDelta(event.text);
    if (event?.kind === "result") result = event;
  };

  try {
    const { code, stderr } = await runCliProcess({ binary, args, onLine, signal, spawn });
    if (code !== 0 || !result || result.isError) throw failure(stderr, result?.text);
    log.info("askAgent", "done", { traceId, sessionId: result.sessionId, contextTokens: result.contextTokens });
    const { text, sessionId, contextTokens, contextWindow } = result;
    return { text, sessionId, contextTokens, contextWindow };
  } catch (error) {
    log.error("askAgent", "failed", { traceId, error });
    throw error;
  }
}
