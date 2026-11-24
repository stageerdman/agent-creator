# Wiki — P1 AI engine via local CLI (research: what to copy from masters-wheel)

Source studied: `~/dev/masters-wheel` (the user's "Master's Circle"), read-only,
2026-11-24. Every claim below points at a real file there. CLI-flag behaviour
was hand-verified by masters-wheel's own updates (cited); it was not re-run
for this research.

## The engine in one picture

```
 UI (TS)                         Backend (Rust/Tauri command, spawn_blocking)              user's own CLI
 ───────                         ─────────────────────────────────────────────             ──────────────
 askAgent(jobId, msg, persona,   1 build system prompt                                     claude
   sessionId?) ───invoke───────▶   CORE_RULE + TOOL_RULE + <knowledge>top-8 chunks</knowledge>
                                    + <persona>instructions</persona> + CORE_RULE  ◀── RAG: embed(msg) → sqlite-vec KNN
                                 2 write temp --mcp-config (points at OWN binary,
                                    env MASTERS_WHEEL_MCP_SERVER=1)
                                 3 spawn  cwd=temp_dir()  ─────────────────────────────▶  -p --output-format stream-json
                                                                                           --include-partial-messages --verbose
                                                                                           --system-prompt <built>
                                                                                           --permission-mode dontAsk
                                                                                           --mcp-config f --strict-mcp-config
                                                                                           --allowedTools a,b,c  --tools ""
                                                                                           [--resume <sid>] [--model m --effort e]
                                                                                           -p -- <message>   (LAST)
                                 4 stderr drained on own thread                              │ spawns ▼
 onAskAgentProgress ◀──emit────  5 read stdout NDJSON line by line:                       our binary as stdio MCP server
   filter by jobId                  stream_event/content_block_delta → "ask-agent-progress" (rmcp, one file per tool)
                                    assistant tool_use / user tool_result → side events
 ◀──── AgentReply ─────────────  6 "result" event = final text + session_id + usage (authoritative)
   {text, sessionId,             7 exit≠0 or is_error → Err(stderr | result | generic)
    contextTokens, contextWindow}
 store sessionId on the chat → passed back as --resume next turn
```

Two call shapes exist:
- **Streaming chat** — `assistant.rs::ask_agent` (above).
- **One-shot** — `claude_cli.rs::run_claude` (`--output-format json`, `.output()`,
  no MCP, no tools) → `run_claude_once` command. Used for scorecards, roleplay
  roles, chat titles. Replies are *plain labeled lines* (`RATING: 3`), parsed
  defensively on the caller side — chosen over JSON on purpose (more reliable).

## Files to copy (masters-wheel → Agent Creator)

| masters-wheel file | Verdict | Notes |
|---|---|---|
| `src-tauri/src/util.rs` (`resolve_binary`) | **Copy verbatim** | Finder-launched apps have no shell PATH; checks `/opt/homebrew/bin`, `/usr/local/bin`. Add `~/.local/bin` and `~/.claude/local` (other Claude Code install spots). |
| `src-tauri/src/claude_cli.rs` | **Copy verbatim** | The one-shot primitive. This is P1's core. |
| `src-tauri/src/assistant.rs` → `ask_agent` streaming loop (lines ~297–445) | **Copy, strip** | Keep: spawn, stderr thread, NDJSON loop, `result` handling, `extract_context_usage`, error mapping. Delete: Spaces, tagged records, training session, `SEARCH_TOOL_NAME` side-event, bridge. |
| `assistant.rs::name_chat` | Copy later (P9) | Or just call `run_claude` with the title prompt — it duplicates `run_claude`. |
| `src/lib/assistant/askAgent.ts` | **Copy, strip args** | `invoke` + `listen("ask-agent-progress")`, caller filters by `jobId`. |
| `src-tauri/src/knowledge/*` (`extract`, `chunk`, `embedder`, `store`, `commands`, `paths`, `prompt`) | **Copy for P4**, not P1 | fastembed AllMiniLML6V2 (384-d, on-device) + sqlite-vec, one `knowledge.db` per agent, 1500-char chunks / 200 overlap, top-k 8. `prompt.rs`: take `build_augmented_system_prompt` + `CORE_RULE` only. |
| `src-tauri/src/mcp/*`, `main.rs` re-exec trick | **Skip for P1** | Only needed when the model must call *our* app's data as tools. The re-exec-own-binary pattern is the one to reuse if/when that day comes. |
| `roleplay.rs` `extract_label` / `extract_bullets_after` | Copy when first needed | Labeled-line parsers for one-shot replies. |

Cargo deps for P1: only `serde`, `serde_json`, `tauri`. (P4 adds `fastembed`,
`rusqlite[bundled]`, `sqlite-vec`, `pdf-extract`.)

If Agent Creator ends up Node/TS instead of Tauri: the port is ~80 lines of
`child_process.spawn(bin, args, {cwd: os.tmpdir()})` + `readline` over stdout;
the flag list and event handling stay identical.

## What to adapt for Agent Creator

1. **Two run modes, not one.** masters-wheel only ever does "persona replies,
   zero built-in tools". Agent Creator also needs **build jobs** (P2/P5: the
   `SKILL.md` distillation pipeline reads source folders and writes
   `instructions.md`). That mode needs `cwd = the agent's work folder`,
   `--allowedTools Read,Glob,Grep,Write,Edit` (+`Task` for parallel
   sub-agents), and **no** `--tools ""`. masters-wheel never hand-verified this
   mode (AGENTS-ENGINE wiki: "Caveat, not yet hand-verified") — spike it first.
2. **Persona/chat mode = masters-wheel as-is**: `cwd = temp_dir()`,
   `--system-prompt` (replace, not append), `--tools ""`, `dontAsk`.
3. **"Claude Code or similar"**: don't build a multi-CLI adapter yet (no
   second real caller). Keep the seam small: one function that turns
   `{system, message, resume, model, mode}` into `(binary, args)`. A Codex/
   Gemini adapter is a second implementation of that one function later.
4. **Add what masters-wheel lacks** (see pitfalls 8–10): a "is `claude`
   installed + logged in?" check at startup, cancel (kill the child), and
   cleanup of temp config files.
5. **Event naming**: one global event per stream kind + `jobId` filtering is
   fine; keep it.

## Pitfalls (each one was a real bug in masters-wheel)

1. **Message starting with `-` breaks the CLI** (`unknown option '---'`). All
   flags first, then `-p -- <message>` as the very last args. `--` anywhere
   else silently turns later flags into prompt text. (TRANSCRIPT-SAFETY wiki)
2. **`--bare` breaks auth** ("Not logged in") — don't use it. (AGENTS-ENGINE wiki)
3. **cwd leaks CLAUDE.md**: run from `temp_dir()`, or the persona answers with
   *this repo's* coding rules. Agent Creator's own CLAUDE.md would leak the same way.
4. **`--append-system-prompt` makes the persona say "I'm Claude Code".** Use
   `--system-prompt` (replaces) and wrap in `<persona>` + a CORE_RULE repeated
   at start *and* end ("never say you are Claude…").
5. **Forgetting `--tools ""`** = ~20k extra tokens of built-in tool schemas
   per reply (a 127k-token reply was reported live). `--mcp-config`/
   `--allowedTools` do NOT control built-ins; only `--tools` does.
6. **Blocking the UI thread**: do subprocess work in `spawn_blocking` — the
   app beachballed before this.
7. **Pipe deadlock**: drain stderr on its own thread while reading stdout.
8. **Stream needs all three**: `stream-json` + `--include-partial-messages` +
   `--verbose`; deltas arrive wrapped in `stream_event`. Treat the final
   `result` event as truth, never the concatenated deltas.
9. **No cancel / no timeout** on claude calls in masters-wheel — a hung CLI
   hangs the request forever. Copy `transcribe.rs`'s `run_killable` pattern.
10. **Temp `--mcp-config` files are never deleted**; use a per-call counter in
    the name (parallel calls raced on a pid-only name).
11. **"Let me check…" then stop**: models narrate a tool call and end the turn.
    Prompt must say "a sentence announcing intent is never a substitute for
    calling the tool".
12. **Large tool output** hits an undocumented CLI size wall → paginate tool
    results yourself (offset/limit), don't rely on `MAX_MCP_OUTPUT_TOKENS`.
13. **Errors come from 3 places** — exit code, `is_error` in `result`, stderr.
    Check all three; prefer stderr text, then result text, then a generic line.
14. Latency: ~2.3 s cold, ~1 s on `--resume` — fine for chat, not for anything snappy.

## P1 build notes (2026-11-24)

**Ported to Node, not Rust.** Agent Creator had no app and this environment
can only run `node`/`npm`, so the engine is plain ESM with zero
dependencies in `src/engine/`. Mapping from the Rust original:

| masters-wheel | Agent Creator |
|---|---|
| `util.rs::resolve_binary` | `src/engine/resolveBinary.mjs` (+ `~/.local/bin`, `~/.claude/local`) |
| arg building in `claude_cli.rs` / `assistant.rs` | `src/engine/claudeArgs.mjs` (the one CLI seam) |
| `ask_agent` event match + `extract_context_usage` | `src/engine/streamEvents.mjs` |
| `spawn_blocking` + stderr thread + `BufReader::lines` | `src/engine/cliProcess.mjs` (async spawn, parallel stderr, readline, AbortSignal kill) |
| `ask_agent` | `src/engine/askAgent.mjs` (`onDelta` callback instead of a Tauri event) |
| `run_claude` | `src/engine/runClaude.mjs` |
| `askAgent.ts` invoke + `listen("ask-agent-progress")` | `POST /api/ask` → SSE (one stream per request, so no jobId filter needed) |

**New lesson: `--strict-mcp-config` is required even with no MCP.**
masters-wheel always passed it alongside its own `--mcp-config`. Without it,
the CLI loads every MCP server the user has set up in Claude Code. Measured
live: `"hi"` cost **119,877** input tokens without the flag and **548** with
it. Locked in by a test in `src/engine/core.test.mjs`. This is the MCP-side
twin of pitfall 5 (`--tools ""` for built-ins).

**Verified live** against `claude` 2.1.322 through the running server:
deltas stream in, a message starting with `---` arrives intact, `--resume`
with the returned session id keeps memory across turns, and closing the
request mid-stream kills the CLI (logged as `kind: cancelled`).

**Testing seam:** `spawn` is injectable. `src/engine/testing/fakeClaude.mjs`
replays the CLI's real output shapes, so every runner and route test runs
offline in well under a second.
