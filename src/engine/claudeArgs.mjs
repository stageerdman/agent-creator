// The one seam between "what we want from the AI" and "how the Claude Code
// CLI is spelled". Port of the argument building in masters-wheel's
// claude_cli.rs::run_claude (one-shot) and assistant.rs::ask_agent
// (streaming), minus the MCP flags P1 doesn't use. Another CLI (Codex,
// Gemini) would be a second implementation of this one function.

const STREAM_FORMAT = [
  "--output-format", "stream-json",
  // All three are needed for token deltas; they arrive wrapped in
  // `stream_event` lines (masters-wheel wiki, pitfall 8).
  "--include-partial-messages", "--verbose",
];
const ONE_SHOT_FORMAT = ["--output-format", "json"];

function optional(flag, value) {
  return value ? [flag, value] : [];
}

export function buildClaudeArgs({ systemPrompt, message, resumeSessionId, model, effort, stream }) {
  return [
    ...(stream ? STREAM_FORMAT : ONE_SHOT_FORMAT),
    // --system-prompt replaces Claude Code's own prompt; --append-system-prompt
    // makes a persona say "I'm Claude Code" (pitfall 4).
    "--system-prompt", systemPrompt ?? "",
    "--permission-mode", "dontAsk",
    // Without --tools "" every reply carries ~20k tokens of built-in tool
    // schemas (pitfall 5).
    "--tools", "",
    ...optional("--resume", resumeSessionId),
    ...optional("--model", model),
    ...optional("--effort", effort),
    // `-p` takes no value; the prompt is positional and, with `--`, must be
    // last — a message starting with `-` is otherwise parsed as an option
    // (pitfall 1).
    "-p", "--", message,
  ];
}
