# AI-ENGINE — P1: AI engine runs via the local CLI

## Goal

Agent Creator runs all of its AI work in the background through the AI CLI
the user already has installed and logged in (Claude Code first). There is no
API key. The engine is copied as closely as possible from masters-wheel
(`~/dev/masters-wheel`, research in this folder's `wiki.md`).

**Done when** the app can send a prompt to the local CLI and get a streamed
answer back, the tests pass, and the Start button opens the newest working
app.

This is feature P1. Later features build on this engine: P2 (create agents
by chatting), P5 (persona generation, which needs a "build job" mode with
file tools), P8 (chat with any agent), and P9 (chat history and titles).
P1 adds nothing for those features yet.

## Stack decision (2026-11-24)

masters-wheel runs its engine in Rust inside Tauri. Agent Creator has no app
yet, and this environment can only run `node`/`npm`, so a Rust build can't be
built or tested here. **The engine is ported to plain Node (ESM, zero
dependencies)**. Its logic matches the Rust code line for line: same flags,
same flag order, same NDJSON event handling, same three error sources. The
research wiki already gave this as the fallback ("~80 lines of
`child_process.spawn` + `readline`").

The engine lives in `src/engine/` and doesn't depend on HTTP, so a future
desktop shell can call it directly. For now a tiny local web server
(`src/server/`) is the app that Start opens.

## Roadmap

Each phase ends with tests that lock in what it built.

### Phase 0 — Research ✅
masters-wheel studied: the files to copy and 14 pitfalls are in `wiki.md`.

### Phase 1 — Scaffold + shared logger ✅
- `package.json` (no deps), `npm start`, `npm test` (`node --test`).
- `src/log/logger.mjs`: one JSON-lines logger used everywhere, with
  module, function and trace id on every line.
- `.project` gets `run:` and `test:` lines.
- **Tests:** the logger writes the context fields and respects `LOG_LEVEL`.

### Phase 2 — Pure engine core ✅
Copied from `util.rs`, `claude_cli.rs` and `assistant.rs`:
- `resolveBinary.mjs`: Homebrew paths plus `~/.local/bin` and
  `~/.claude/local`, falling back to the bare name.
- `claudeArgs.mjs`: the one seam that turns
  `{systemPrompt, message, resumeSessionId, model, effort, stream}` into
  CLI args. A second CLI (Codex, Gemini) would be a second implementation
  of this one function.
- `streamEvents.mjs`: parse one NDJSON line into a delta or a result, plus
  `extractContextUsage`.
- **Tests:** `-p -- <message>` is always last (a message starting with `-`
  stays a message), `--tools ""` and `dontAsk` are always present,
  stream-json gets `--include-partial-messages --verbose`, empty resume/model
  values are dropped, delta/result parsing works, usage sums the four token
  fields.

### Phase 3 — Process runners ✅
- `runClaude.mjs` (one-shot, `--output-format json`) and `askAgent.mjs`
  (streaming, `onDelta` callback). Both use `cwd = os.tmpdir()` so no
  CLAUDE.md leaks in, read stderr in parallel with stdout, check errors from
  all three sources (exit code, `is_error`, stderr), and cancel through an
  `AbortSignal` that kills the child (masters-wheel lacked this; pitfall 9).
- `ClaudeCliError` with a `kind` (`not-installed`, `failed`, `cancelled`,
  `bad-output`).
- `checkCli.mjs`: is `claude` installed (`--version`)?
- **Tests:** a fake CLI (a Node script that prints recorded NDJSON) covers
  streamed deltas, the final result winning over the deltas, a non-zero exit
  with stderr, `is_error`, a missing binary, and cancel.

### Phase 4 — Local app: server + minimal page ✅
- `GET /`: one page with a prompt box that shows the answer live as it streams.
- `POST /api/ask` → Server-Sent Events: `delta`*, then `done`
  `{text, sessionId, contextTokens, contextWindow}`, or `error`. The client
  sends `sessionId` back to continue the conversation (`--resume`).
  Closing the request cancels the CLI.
- `GET /api/health` → `{installed, binary, version}`.
- **Tests:** server integration against the fake CLI (SSE order, error
  event, health).

### Phase 5 — Live verification ✅
- Run the real `claude` through `/api/ask` on PORT and confirm deltas stream
  in and a session id comes back. Record what was learned in `wiki.md`.

## Status

- 2026-11-24: Phases 0–5 done; 26 tests pass. The live check found one real
  bug: without `--strict-mcp-config` the user's own MCP servers loaded into
  every call (120k tokens for "hi"). It is fixed and has a test; see
  `wiki.md` → "P1 build notes".
- Next (outside P1): the build-job mode spike for P2/P5.

## Not in P1 (on purpose)

- Persona wrapper (`CORE_RULE` + `<persona>`): this lands with P8 chat, where
  a persona exists. The engine already takes a `systemPrompt` input for it.
- Build-job mode (cwd = agent folder, file tools allowed): P2/P5, after a spike.
- RAG and MCP: P4 and later.
- A multi-CLI adapter: only once a second CLI is really needed.
