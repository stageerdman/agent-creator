# ROBBINS-MADANES CORPUS — rebuild tony-robbins-perspective + build knowledge.md

## Goal

Source folder: `/Users/stage/Library/CloudStorage/OneDrive-Personal/Library/Tony
Robbins/Tony Robbins Classroom/CORE 100&200 by Robbins Madaness` (23GB on disk,
mostly video/audio which is explicitly out of scope). Two **deliberately
decoupled** deliverables — they don't share batches, because they have
completely different cost profiles and different source subsets (v2 decision,
2026-11-05, see below):

1. **Rebuild `.claude/skills/tony-robbins-perspective/`**, replacing the
   existing instance (built from 3 books only, missing dimensions
   02-conversations and 04-external-views — see `updates/2026-11-04 INIT -
   OPEN/update v1.md` Phase 2). Old content is authorized to be deleted
   outright, not archived.
2. **Produce `knowledge.md`**: every file in the corpus, extracted to plain
   text and concatenated, for future RAG use. Stays local, **gitignored**
   — raw course material is sensitive per `CLAUDE.md`'s rule on source dumps
   (user confirmed 2026-11-05).

## v2 revision (2026-11-05): decouple personality source from knowledge.md source

Original v1 plan read the whole corpus module-by-module and fed both
deliverables from the same batches. User feedback: that's wrong on two
counts —

1. **knowledge.md should be near-zero cost.** It's a mechanical transform
   (extract text from every file, concatenate, add headers) — a script's
   job, not something that needs a model to read through. It doesn't need
   batching under the 500k rule at all.
2. **Personality shouldn't be built from the whole corpus — only from where
   Tony Robbins is actually speaking.** Most of this corpus is *about* his
   methodology (case studies run by other certified trainers, teleclass
   recaps, reading material), not him talking. Mixing that in would dilute
   fidelity, not add to it.

**File-naming investigation confirmed a clean, fully mechanical split** —
verified by reading sample content, not just filenames:

- Every module/lesson that has a named client (e.g. "Module 1: Leaving Home
  **- Scott**") pairs with a sibling folder suffixed **"- Teleclass"** (e.g.
  "Module 1: Leaving Home **- Teleclass**").
- The non-Teleclass folder's transcript (filenames like `*Transcript.doc`,
  `*FilmTranscript*.doc/pdf`) is the **on-camera film**: verified speaker
  tags are `T:`/`TR: Anthony Robbins` coaching the client directly (one
  sample even has an explicit legend: `TR Anthony Robbins / CM Cloe Madanes
  / L Lise`). **This is the personality source.**
- The "- Teleclass" folder's transcript is an **audio-only call** where a
  host (`M:` in the sample checked) recaps/analyzes the film for the class,
  referring to "Tony" in the third person — confirmed NOT his voice.
  **Knowledge.md only.**
- `page.md`/`reading.txt`/`note.md` files in either folder type are written
  curriculum copy (expository, not transcribed speech) — **knowledge.md
  only**, not treated as Tony's own words even when they sit next to a film
  transcript.

This is a filename-pattern match (`*transcript*` in path, minus any path
containing "teleclass"), checked against content on a handful of samples
across different modules — holds consistently.

## Source survey (measured 2026-11-05)

Excluding `.mp3`/`.mp4`/`.flv`/`.jpg`/`.DS_Store` and 76 empty `.lesson`
placeholders. 155 text-bearing files total (71 `.doc`, 14 `.pdf`, 39 `.md`,
21 `.txt`, 10 `.docx`), **729,736 words (~950K tokens) in total**.

Of those, the **personality subset is 32 files, 395,487 words (~515K
tokens)** — the non-Teleclass transcripts listed above. (One file, "Jim 2 -
Transcript.doc", extracted to only 5 words — likely a conversion issue;
flagged for a manual look, not blocking.)

**Supplementary source on hand, reusable at zero extraction cost**: the
previous instance's extracted text of *Awaken the Giant Within*
(201,684 words) already sits at
`.claude/skills/tony-robbins-perspective/references/sources/books/Awaken_the_Giant_Within_-_Anthony_Robbins.txt`.
Held in reserve — pulled in only if the Phase 1.5 checkpoint shows a
dimension is thin (most likely dimension 01, "writings/systematic thought" —
dialogue transcripts don't naturally cover that).

## Revised total cost estimate: ~1.0–1.7M tokens

(Down from v1's ~2.8M and the original rough ~8–12M estimate.) Knowledge.md
construction is now near-free (mechanical script); the personality pipeline
reads ~515K tokens of raw transcript instead of ~950K tokens of full corpus.

## Batch ledger (resumability: read this table first in any new session; run
exactly one `pending` batch, mark it `done`, stop or continue)

| # | Track | Scope | Est. tokens | Status |
|---|---|---|---|---|
| 0 | knowledge.md | One Python script extracts **all 155 files** (every type) to plain text and concatenates into `knowledge.md` with module/lesson headers + TOC. Pure script execution — no model reading of corpus content required. Not gated by the 500k rule; this is the entire knowledge.md deliverable in one shot. | ~10K (orchestration only) | pending |
| P1 | Personality | Phase 0.5 (fresh skill scaffold, delete old content) + Phase 1 research pass over transcript group A (16 files, ~215K words / ~280K tokens): Introduction, Life Stages A, Life Stages B, Finding Marital Passion. Tag evidence into `references/research/0X-*.md`. | ~400K | pending |
| P2 | Personality | Phase 1 research pass over transcript group B (16 files, ~180K words / ~235K tokens): Individual Transformation, Overcoming Inner Conflicts, Group Dynamics, Resiliency in Crisis, Advanced Negotiation, Bonus Modules. | ~350K | pending |
| P1.5 | Personality | Phase 1.5 checkpoint: research-quality summary table shown to user. Decide here whether the *Awaken the Giant Within* supplement (batch P3) is needed. | ~15K | pending |
| P3 | Personality (optional) | Only if P1.5 shows a gap: read *Awaken the Giant Within* (~260K tokens), tag into the thin dimension(s). | ~300K | conditional |
| P4 | Personality | Phase 2 synthesis (mental models, decision heuristics, expression DNA, values/anti-patterns, lineage, honest boundary, coaching style) — from the condensed research files, not raw corpus. | ~150K | pending |
| P4.5 | Personality | Phase 2.5 checkpoint: confirm synthesis with user. | ~10K | pending |
| P5 | Personality | Phase 3: construct new `instructions.md` from `references/skill-template.md`. | ~100K | pending |
| P6 | Personality | Phase 4: independent validation (sanity/edge/voice tests + `quality_check.py`). | ~150K | pending |
| P7 | Personality | Phase 5: dual-agent refinement, checkpoint, apply. | ~150K | pending |
| F | Both | Finalize: confirm `.gitignore` covers `knowledge.md` and staged sources, update this file's Status section, commit + push. | ~15K | pending |

Only P1/P2 (and optional P3) are "big" batches; everything else is small.
Batch 0 can run independently of the personality track in any order.

## Open questions carried into execution

- The 5-word "Jim 2" transcript extraction — check if it's a scan/image-only
  page requiring a different extraction approach, or accept the loss of one
  file out of 32.
- Dimension 04 (external-views) will likely still be thin — this corpus is
  Robbins-Madanes-authored training material, not outside critique.  Carry
  forward as an honest-boundary gap, same as the previous instance did.

## Status

v2 plan written 2026-11-05 after user feedback on v1 (decouple the two
deliverables, use only Tony-led transcripts for personality). No batches
executed yet. Next action: run batch 0 (knowledge.md script) and/or batch P1
(personality research group A) when given the go-ahead — they're
independent, can run in either order.
