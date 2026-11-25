// Errors the creator module raises itself. `kind` mirrors ClaudeCliError so
// callers (the server's one error handler) can react without parsing text.
export class AgentNotFound extends Error {
  constructor(id) {
    super(`No agent with id "${id}".`);
    this.name = "AgentNotFound";
    this.kind = "not-found";
  }
}

// Input the creator can't use, e.g. a file with no path.
export class BadInput extends Error {
  constructor(message) {
    super(message);
    this.name = "BadInput";
    this.kind = "bad-input";
  }
}
