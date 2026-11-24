# agent-creator

Turns a folder of raw material about one person — course transcripts, books,
interviews, whatever that person has written or said — into two agent
capabilities for them:

1. **A high-fidelity clone of their personality and principles** — a
   perspective skill that thinks and talks like them, not a chatbot wearing
   their name.
2. **A large, well-structured knowledge base of their material** — organized
   so an agent can retrieve (RAG) the actual source on a specific question,
   instead of relying on a compressed personality summary.

## Approach

Part 1 started as a verbatim adoption of the open-source
[女娲.skill / nuwa-skill](https://github.com/alchaincyf/nuwa-skill) (MIT ©
Huashu/花叔) — `SKILL.md`, `references/`, and `scripts/` at this repo's root —
then was deliberately forked on 2026-11-05 to produce an always-on
personality file, `instructions.md`, instead of a Claude-Code-triggered
skill per person. Its 6-phase pipeline — parallel multi-agent research,
triple-verified mental-model extraction, instructions.md construction,
independent quality validation, dual-agent refinement — still does what
part 1 needs. See `SKILL.md`'s provenance note at the top for exactly what
changed and `updates/2026-11-04 INIT - OPEN/wiki.md` for the full rationale.

Part 2 — the structured knowledge base for RAG — isn't in nuwa-skill's scope.
It's this project's open work; see
`updates/2026-11-04 INIT - OPEN/update v1.md` for the plan.

How source data gets created and ingested is still expected to be adjusted
as this project develops — nothing about that is locked in yet.

## Using this

Point Claude Code (or any Agent-Skills-compatible runtime) at this repo's
`SKILL.md` and say something like "distill [person]" — see the file itself
for the full flow, checkpoints, and anti-patterns. `scripts/` holds the
subtitle-download/cleaning and quality-check helpers the skill calls out to.

## The app and its AI engine

All AI work runs in the background through the AI CLI you already have
installed and logged in (Claude Code first). There's no API key. The engine
(`src/engine/`) is a zero-dependency Node port of masters-wheel's. `npm start`
serves a small local page on `PORT` where you can send a prompt and watch the
answer stream in. `npm test` runs the tests. See
`updates/2026-11-24 AI-ENGINE - OPEN/` for the plan and lessons.

## Project layout

Follows the AI Control standard (`.project`, `CLAUDE.md`, `updates/`,
`issues.txt`) — see `CLAUDE.md` for the full rules this project runs under.
