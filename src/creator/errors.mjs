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

// A file with no plain text in it (binary, empty, a broken PDF). `reason` is
// the short word the file record keeps so the screen can say why.
export class CantExtract extends Error {
  constructor(name, reason, cause) {
    super(`No text in ${name}: ${reason}.`, cause ? { cause } : undefined);
    this.name = "CantExtract";
    this.kind = "cant-extract";
    this.reason = reason;
  }
}

// The local embedding model can't run now (not downloaded yet and offline,
// or its runtime won't load). Passing: the next change tries again.
export class CantEmbed extends Error {
  constructor(reason, cause) {
    super(`Can't embed: ${reason}.`, cause ? { cause } : undefined);
    this.name = "CantEmbed";
    this.kind = "cant-embed";
    this.reason = reason;
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
