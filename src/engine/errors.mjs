// One error type for everything that can go wrong talking to the AI CLI.
// `kind` lets callers (and the UI) react without parsing message text:
//   not-installed — the binary couldn't be started at all
//   failed        — the CLI ran and reported an error (exit code, is_error, stderr)
//   bad-output    — the CLI exited fine but its output wasn't what we expect
//   cancelled     — the caller aborted the call
export class ClaudeCliError extends Error {
  constructor(kind, message, options) {
    super(message, options);
    this.name = "ClaudeCliError";
    this.kind = kind;
  }
}

export const NO_REPLY = "Claude didn't return a reply.";

// Errors come from three places; prefer stderr, then the result text, then a
// generic line (masters-wheel wiki, pitfall 13).
export function failure(stderr, resultText) {
  return new ClaudeCliError("failed", stderr || resultText || NO_REPLY);
}
