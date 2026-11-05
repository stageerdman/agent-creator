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

### Phase 2 — Prove it on a real person (in progress)
- [x] Picked Tony Robbins as the test subject, local-corpus mode, scoped to
      PDF books only (no audio transcription). Source: user's own
      `Tony Robbins/Books` folder — 4 PDFs, 1 (`Notes from a Friend`) turned
      out to be scanned/image-only and was skipped (no text layer; OCR would
      be a separate deliberate step, not attempted).
- [x] Converted the 3 remaining books to plain text with `pypdf`. Raw text
      lives in `.claude/skills/tony-robbins-perspective/references/sources/`
      — **gitignored, not committed** (user's explicit call: these are
      copyrighted published books, treated as sensitive per this file's own
      rule on raw source dumps, even though the repo is private).
- [x] Ran Phase 0.5 (skill directory scaffold) and Phase 1's
      local-corpus-priority extraction: 3 parallel agents (one per book)
      extracted the 4 dimensions books can plausibly cover (writings,
      expression-DNA, decisions, timeline), then merged by hand into the
      canonical `references/research/0{1,3,5,6}-*.md` files, cross-referencing
      where multiple books corroborate the same belief/phrase and preserving
      contradictions (e.g. the embezzlement story is told with real
      self-criticism in `Awaken` Ch. 15 but purely triumphantly in both
      `Awaken` Ch. 2 and `Giant Steps`).
- [ ] Dimensions 02 (conversations) and 04 (external-views) have **zero**
      local-corpus coverage — books alone can't supply them. Per SKILL.md's
      own Phase 0A rule, supplementing via web search is a cost checkpoint
      that needs the user's go-ahead before running, not a default.
- [ ] Haven't yet run Phase 2 (mental-model extraction/verification) or
      Phase 3 (SKILL.md construction) — still at the Phase 1 research-file
      stage.
- [ ] Note where the vendored approach rubs against local-corpus-only material
      (courses/books instead of public-figure research) — nuwa-skill assumes
      a public figure with 6 web-searchable dimensions; a course author's
      material may not cleanly map to all 6. **Early finding**: books alone
      cleanly cover writings/expression/decisions/timeline but structurally
      cannot cover conversations (no unscripted material) or external-views
      (no outside critique) — confirms the methodology's own
      local-corpus-priority design (supplement only the missing dimensions)
      rather than requiring a rework.

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

Phase 1 done. Phase 2 in progress on Tony Robbins (local-corpus mode, books
only): Phase 1 research extraction done and merged (4 of 6 dimensions, the
ones local books can cover). Next decision point: whether to supplement the
2 missing dimensions (conversations, external-views) with web search — a
cost checkpoint per SKILL.md, needs the user's call — or proceed straight to
mental-model extraction/SKILL.md construction on the 4 covered dimensions
and treat the other 2 as an accepted gap for this skill.
