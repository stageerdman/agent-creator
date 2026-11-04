# INIT — stand up agent-creator

## Goal

Given a folder of raw material about one person (course transcripts, books,
interviews, anything they've written or said), produce two things for that
person:

1. A high-fidelity clone of their **personality and principles** — a
   perspective skill you can actually talk to and get their take on a new
   problem, not a chatbot wearing their name.
2. A **large, well-structured knowledge base** of their material, organized
   so an agent can retrieve (RAG) the specific source on a question instead
   of relying on a compressed personality summary.

The explicit instruction for part 1 was: don't reinvent this — copy the
open-source [女娲.skill / nuwa-skill](https://github.com/alchaincyf/nuwa-skill)
approach completely, as the upstream project suggests using it, and adjust
later (both how we interact with the distilled agent, and how we create/feed
it source data). Part 2 has no prior art handed to us — it's open design work.

## Phased roadmap

### Phase 1 — Adopt the methodology (this update)
- [x] Read nuwa-skill's `SKILL.md`, `references/extraction-framework.md`,
      `references/skill-template.md`, `references/fidelity-scorecard.md` in
      full to understand the 6-phase pipeline (parallel multi-agent research
      → triple-verified mental-model extraction → SKILL.md construction →
      independent quality validation → dual-agent refinement) and its
      checkpoints/anti-patterns.
- [x] Vendor `SKILL.md`, `references/` (minus `about-author.md`), and
      `scripts/` into this repo verbatim, with only the two provenance edits
      SKILL.md's own "关于作者" / "版本检查" sections needed once living inside
      a different repo's git history (see the note at the top of `SKILL.md`).
      Deliberately did **not** copy upstream's `examples/` (14 bulk example
      people), `assets/`, `promo/`, multi-language READMEs, `COMMUNITY.md`,
      `CONTRIBUTING.md` — those are nuwa-skill's own distribution/marketing
      surface, not part of the methodology we need to run it.
- [x] Stand up the AI Control scaffold: `.project` (modules: STRUCTURE,
      CODING, WORKFLOW — no UX, no user-facing surface), `.gitignore`,
      `issues.txt`, `CLAUDE.md` compiled from those modules plus a
      project-specific section, `README.md`.
- [x] `secrets: none` for now — the vendored pipeline runs on Claude Code's
      own WebSearch/tooling, no API key needed yet.
- [x] Create GitHub repo (private), connect, first commit.

### Phase 2 — Prove it on a real person (next)
- [ ] Run the vendored SKILL.md end-to-end on one real person using the
      user's own course/book folder for them (local-corpus mode, per
      SKILL.md's "本地语料优先" path) — this is the real test of whether the
      as-is approach fits, before any adjustment or before investing in
      Phase 3.
- [ ] Note where the vendored approach rubs against local-corpus-only material
      (courses/books instead of public-figure research) — nuwa-skill assumes
      a public figure with 6 web-searchable dimensions; a course author's
      material may not cleanly map to all 6.

### Phase 3 — Design the knowledge-base / RAG half (open)
- [ ] Decide what "well-structured for retrieval" means here: chunking unit
      (per-lesson? per-concept?), metadata schema, embedding model, vector
      store, and how it's queried at agent-answer time.
- [ ] Decide how this relates to the vendored `references/research/` and
      `references/sources/` convention — same corpus, two different
      derived artifacts? Separate ingestion step?
- [ ] This is explicitly the part the user said we'd "adjust later" — don't
      pre-commit to a stack before Phase 2 shows what's actually needed.

### Phase 4 — Adjust interaction model (open)
- [ ] Revisit how a user actually talks to the finished agent (personality
      skill + knowledge base together) once Phase 2 and 3 exist — this was
      flagged explicitly as something to change, not keep as nuwa-skill's
      default chat-with-a-perspective-skill pattern.

## Status

Phase 1 done. Repo live on GitHub, private. Next: Phase 2 — pick a real
person from the user's existing resource folders and run the vendored
pipeline on them in local-corpus mode.
