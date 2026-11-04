# Wiki — standing up agent-creator on top of nuwa-skill

Durable decisions and lessons from the INIT update, for whoever (human or AI)
touches this project next.

## "Copy completely" means the methodology, not the whole repo
The instruction was to literally copy nuwa-skill's approach, not to reinvent
it. But nuwa-skill-the-repo is two things bundled together: the methodology
(`SKILL.md` + `references/` + `scripts/`) and its own distribution/marketing
surface (`examples/` with 14 fully-researched public figures, `assets/`,
`promo/`, multi-language READMEs, `COMMUNITY.md`, `CONTRIBUTING.md`). Only the
first is "the approach we'll be using" — the second is nuwa-skill advertising
itself to its own GitHub audience. Vendoring the second would bloat this repo
with dozens of files and ~40 example-person research docs that have nothing
to do with agent-creator's actual task. Vendored only the methodology.

## A vendored file needs a provenance note, especially when parts of it stop applying
nuwa-skill's `SKILL.md` has a self-referential "版本检查" section that assumes
the file sits in its own standalone git clone with `origin` pointing at
upstream — so it can `git ls-remote origin` to check for new releases. Once
vendored into another project's repo, `origin` points somewhere else entirely
and that check is checking the wrong thing. Rather than silently delete the
section (which would be an undisclosed edit to "copy completely"), it's kept
but marked disabled-as-is with an explanation, and a top-of-file note
documents exactly what's unmodified vs. what's a necessary provenance edit.
This keeps the fork auditable: anyone can diff this file against upstream and
see only two intentional changes.

## Don't scaffold the RAG half before its design exists
STRUCTURE.md's "keep small projects flat" principle argues against creating
a `sources/`, `output/`, or vector-store folder now, before chunking strategy,
embedding model, and retrieval interface are decided (Phase 3, deliberately
left open). An empty scaffold for an undesigned system is worse than no
scaffold — it implies a decision that hasn't been made. [[rag-knowledge-base-design]]
is the memory to write once Phase 3 actually happens.

## "secrets: none" is a valid answer for phase 1
Same precedent as other AI Control projects (e.g. edutube's adoption): the
vendored pipeline runs entirely on Claude Code's own tools (WebSearch, file
reads), no API key needed yet. Recording `secrets: none` rather than creating
an empty `.env` keeps the project honest about what it currently needs. The
knowledge-base phase will very likely need one (embeddings API, vector-store
auth) — that's a `sync-secrets` task for whenever Phase 3 starts, not now.

## Nuwa's own pipeline is the orchestration pattern, not just the output format
`SKILL.md`'s Phase 1 (6 parallel research agents) and Phase 4 (independent
validation agents, never self-graded) are themselves instances of
WORKFLOW.md's "act as an orchestrator" / "verify by running the actual thing"
principles — already baked into the vendored methodology before this project
wrote a line of project-specific guidance. Worth noticing when extending it
for the knowledge-base phase: the same orchestrator-delegates-to-focused-agents
shape probably fits ingestion/chunking too.
