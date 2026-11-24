// Errors the creator module raises itself. `kind` mirrors ClaudeCliError so
// callers (the server's one error handler) can react without parsing text.
export class AgentNotFound extends Error {
  constructor(id) {
    super(`No agent with id "${id}".`);
    this.name = "AgentNotFound";
    this.kind = "not-found";
  }
}
