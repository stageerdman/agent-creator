// Errors the creator module raises itself. `kind` mirrors ClaudeCliError so
// callers (the server's one error handler) can react without parsing text.
export class NotFound extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFound";
    this.kind = "not-found";
  }
}

export class AgentNotFound extends NotFound {
  constructor(id) {
    super(`No agent with id "${id}".`);
    this.name = "AgentNotFound";
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
