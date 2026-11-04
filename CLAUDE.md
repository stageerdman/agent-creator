# agent-creator

Turns a folder of raw material about one person — course transcripts, books,
interviews, whatever that person has written or said — into two agent
capabilities for them: (1) a high-fidelity clone of their personality and
principles, callable as a perspective skill, and (2) a large, well-structured
knowledge base of their material for RAG retrieval, so the agent can pull up
the actual source instead of relying on a compressed summary.

Part 1 is solved by adopting, **verbatim**, the open-source
[女娲.skill / nuwa-skill](https://github.com/alchaincyf/nuwa-skill) (MIT ©
Huashu/花叔): `SKILL.md`, `references/`, and `scripts/` at this repo's root are
a direct copy — see `SKILL.md`'s provenance note for exactly what was and
wasn't changed. Part 2, the structured knowledge base for RAG, is not in
nuwa-skill's scope and is this project's open work; see
`updates/2026-11-04 INIT - OPEN/update v1.md`. How we interact with the
distilled agent and how source data gets created/ingested are both expected
to be adjusted later — nothing about that is locked in yet.

This file is compiled from the global modules in `~/.ai-control/modules/`
(STRUCTURE, CODING, WORKFLOW — UX is skipped, this project has no user-facing
surface). Rebuild it with the `rebuild-claude-md` routine when the modules
change. Keep project-specific rules in the last section.

---

## Structure

Every project carries the standard AI Control scaffold:
- `.project` — the project marker: the `modules:` it uses, its `secrets:`, and `claude_md_generated`.
- `CLAUDE.md` — this file, compiled from the global modules.
- `.gitignore` — always covers `.env`.
- `.env` — this project's secrets (never committed). Currently not created — see `.project` (`secrets: none`).
- `updates/` — one folder per update.
- `issues.txt` — running list of known issues and TODOs.

The `updates/` folder: each update is `updates/YYYY-MM-DD <NAME> - OPEN/` while
in progress, flipped to `- CLOSED/` when done (reopen by flipping back). Inside:
- **`update vX.md`** — the version-X plan (`X` starts at 1): goal, phased
  roadmap, and live status (what's done, decisions made, what's next). Bump to
  v2, v3… on a substantial rework.
- **`wiki.md`** — durable decisions and lessons this update taught: principles,
  what works and what doesn't. Knowledge, not status.
- **Optional extra files** — logs and any isolated research-spike code.

Per-ecosystem conventions: follow each stack's own norms. Keep small projects
flat; add folders only as the project grows into them — don't scaffold a
`sources/`, `output/`, or vector-store directory for the knowledge-base phase
before that phase's design is actually decided.

**Modular by default:** structure everything so any piece can be understood and
fixed in isolation, with its own bounded context — clear boundaries, minimal
cross-coupling.

## Coding

- **Modularize for isolated context.** Write code so any part can be picked up,
  understood, and fixed on its own. Draw clear module boundaries with small,
  explicit interfaces; keep cross-module coupling low so a change stays contained.
- **Keep it minimal.** Build only what's truly needed — no abstraction, config,
  or layers on speculation. Prefer reuse over duplication, but don't
  over-generalize before there's a second real caller.
- **Test what matters.** Cover core logic, risky paths, and anything that would
  silently regress; skip tests for trivial glue. Phases in a roadmap mostly end
  with tests that lock in what they built. (`scripts/quality_check.py` is this
  project's existing version of that for a generated SKILL.md.)
- **Idiomatic to the ecosystem.** Match the conventions, naming, and idioms of
  the stack and surrounding code. Read the neighbors before writing; follow the
  ecosystem's standard tooling for formatting, linting, and layout.

## Workflow

- **Commit AND push after every change.** No change left uncommitted or
  unpushed. Each working change is its own small, focused commit — one logical
  unit — pushed to the remote immediately. Never commit secrets (`.env` stays in
  `.gitignore`). Everything lives on GitHub.
- **Roadmaps and phases.** Any non-trivial update starts with a roadmap broken
  into phases, recorded in the update's `update vX.md`. Most phases end with
  tests that lock in what they built. Track status as you go.
- **Research spikes.** For a new API, unfamiliar library, or genuinely new
  design, run a throwaway spike outside the main code, inside the update folder,
  in an isolated environment. Capture findings in the update's `wiki.md`.
- **Act as an orchestrator.** Prefer delegating to focused agents over doing
  everything inline: decompose, fan out, synthesize. (The vendored SKILL.md
  already does exactly this for the distillation pipeline itself — 6 parallel
  research agents, then independent validation agents.)
- **Verify before moving on.** Verify by running the actual thing, not just a
  green test, before you commit and move to the next phase.

---

## Project-specific rules

- **`SKILL.md`, `references/`, and `scripts/` at the repo root are vendored
  from upstream nuwa-skill, not authored here.** Don't casually edit the
  methodology itself (the phases, the triple-verification rules, the
  checkpoints) — if it needs to change, that's a deliberate decision to
  record in an update's `wiki.md`, not a drive-by edit. Pulling upstream
  improvements later is also a deliberate, reviewed action, not automatic.
- **No generated person-skill exists yet.** When distilling the first real
  person, follow the vendored SKILL.md's own Phase 0.5 convention
  (`.claude/skills/[person]-perspective/`) rather than inventing a new layout.
  Do this before investing in the knowledge-base/RAG phase — it's the real
  test of whether the vendored approach fits as-is.
- **The knowledge-base/RAG half of the goal is intentionally unscoped.** No
  chunking strategy, embedding model, vector store, or retrieval interface has
  been picked. Don't assume a stack when touching this area — that's an open
  decision for the next update, not a default to reach for.
- **Source material a person provides (course PDFs, transcripts, private
  recordings) is personal/sensitive even though it isn't a credential.**
  Don't commit raw source dumps to the repo without checking with the user —
  treat them like the secrets they're adjacent to.
