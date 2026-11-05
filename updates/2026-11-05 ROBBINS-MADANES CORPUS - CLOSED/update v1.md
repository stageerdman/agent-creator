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
| 0 | knowledge.md | One Python script extracts **all 155 files** (every type) to plain text and concatenates into `knowledge.md` with module/lesson headers + TOC. Pure script execution — no model reading of corpus content required. Not gated by the 500k rule; this is the entire knowledge.md deliverable in one shot. | ~10K (orchestration only) | **done** — 865,515 words in `knowledge.md`, 32/32 personality transcripts side-saved to `references/sources/transcripts/`. 1 file (Jim 2's transcript) is a dead "404 File not found" stub in the original source — unrecoverable, not an extraction bug. |
| P1 | Personality | Phase 0.5 (fresh skill scaffold, delete old content) + Phase 1 research pass over transcript group A (16 files, ~196K words): Introduction, Life Stages A/B, Finding Marital Passion, Group Dynamics, Individual Transformation, Overcoming Inner Conflicts, Resiliency, Advanced Negotiation, Bonus. Tag evidence into `references/research/0X-*-groupA.md`. | ~400K | **done** — 446,174 tokens used. 13 of 16 effectively distinct (1 broken/Jim 2, 2 duplicate bonus-preview films). Strong: conversations, expression-DNA, coaching-style. Moderate: writings, decisions. Thin/N/A as expected: timeline. Zero as expected: external-views. Found a genuine contradiction (anger as "fire to honor" vs. "the Crazy Eight" to eliminate) and a consent-override moment in a suicide-risk case. |
| P2 | Personality | Phase 1 research pass over transcript group B (16 files, ~200K words): Carol 2, Sukey, Asad & Bernie, Paul & Jenn, Ocean 2, Regina, Lyndsey, Karen & Warren, Beverley, Lise, Mike & Judy, Arantza & Alan, Shelia, Scott, Gary, Maggie. Tag evidence into `references/research/0X-*-groupB.md`. | ~350K | **done** — 481,660 tokens used. Strong: conversations, expression-DNA, decisions, coaching-style (all 8 sub-dims covered). Thin as expected: writings (~5 confirmed repeated beliefs). Zero as expected: external-views, timeline. Found a contradiction on rules/rigidity (Gary: honored; Beverley/Shelia: attacked) and a pattern where confrontation intensity tracks the client's *rationalization level*, not situation severity. |
| P1.5 | Personality | Phase 1.5 checkpoint: research-quality summary table shown to user. Decide here whether the *Awaken the Giant Within* supplement (batch P3) is needed. | ~15K | **done** — user chose to pull in the book supplement |
| P3 | Personality | Read *Awaken the Giant Within* in full (~260K tokens), cross-checked against groupA/groupB writings research. | ~300K | **done** — 309,025 tokens. 10 belief/model entries, 9 self-coined frameworks, 9 credited influences. Key finding: the Six Human Needs model (the most load-bearing doctrine across all 31 transcripts) **does not appear in this 1991 book at all** — evidence it was formalized later, not a lifelong constant. Also surfaces the meta-principle ("rules judged by whether they empower, not by origin") that *would* reconcile groupB's Gary-vs-Beverley rules contradiction — but since the transcripts never state it themselves, that on-camera contradiction is preserved as unresolved. Saved to `01-writings-book-supplement.md`. |
| P4 | Personality | Phase 2 synthesis (mental models, decision heuristics, expression DNA, values/anti-patterns, lineage, coaching style) — from the condensed research files, not raw corpus. | ~150K | **done** — done directly (no sub-agent needed, research files totaled only ~24K tokens). 7 mental models, 10 decision heuristics, full expression DNA + coaching style, 4 preserved core tensions. |
| P4.5 | Personality | Phase 2.5 checkpoint: confirm synthesis with user. | ~10K | **done** — user confirmed, and asked to drop the Honest Boundary section from the final file entirely (personal-use instance, not for distribution). |
| P5 | Personality | Phase 3: construct new `instructions.md` from `references/skill-template.md`. | ~100K | **done** — written directly. `scripts/quality_check.py`: 4/6 automated pass. The 2 remaining fails are expected: Expression DNA is a confirmed Chinese-only regex gap in the vendored script (content manually verified, same issue as the first Tony Robbins run); Honest Boundary fails correctly because it was deliberately omitted per above. See `wiki.md`. |
| P6 | Personality | Phase 4: independent validation (sanity/edge/voice tests + `quality_check.py`). | ~150K | **done** — 42,264 tokens. Independent agent (no access to research files, only `instructions.md`) answered 3 known-position questions (each correctly invoked the specific model it targeted: Model 7 horse-trading, Models 1/2/5 identity+decisions, Model 6 rules-by-function), 1 edge case (AI chatbots — correctly flagged as outside source material, extrapolated rather than invented), and a voice-check sample (distinctively in-character). No corrections needed; passed without an iteration cycle. |
| P7 | Personality | Phase 5: dual-agent refinement, checkpoint, apply. | ~150K | **done** — 84,581 tokens (2 parallel agents). Agent A (structural): flagged Step 2's research dimensions implying 5 model-backed lenses when only 2 have actual Core Mental Models behind them (annotated the other 2), and a RAG-KB boundary-condition gap (this person's situation vs. precedent in the corpus — two different fact sources, now split out explicitly). Agent B (role-play operability): added a "break character" handling rule (previously undefined — a real gap), added a generic-AI-drift recovery rule, collapsed a duplicated "never exits" statement into one place. All 5 fixes applied; `quality_check.py` re-run clean, no regressions (still 4/6, same 2 expected exceptions). |
| F | Both | Finalize: confirm `.gitignore` covers `knowledge.md` and staged sources, update this file's Status section, commit + push. | ~15K | **done** |

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

**Complete, 2026-11-05.** All batches (0, P1-P7, F) done. Deliverables:

1. `.claude/skills/tony-robbins-perspective/instructions.md` — rebuilt from
   31 real on-camera coaching transcripts (Strategic Intervention training
   films) plus *Awaken the Giant Within* as a writings supplement. 7 core
   mental models, 10 decision heuristics, full Expression DNA and Coaching
   Style sections, 4 preserved internal tensions, intellectual lineage.
   Honest Boundary section deliberately omitted per user request (personal
   use, not distribution — see `wiki.md` if this changes). Passed
   independent Phase 4 validation cleanly (no iteration needed) and a
   Phase 5 dual-agent refinement pass (5 concrete fixes applied).
2. `.claude/skills/tony-robbins-perspective/knowledge.md` — mechanical
   extraction of all 155 corpus files (865,515 words), local/gitignored,
   for future RAG use.

Total cost: ~2.17M tokens across the whole update (knowledge.md ~near-zero,
personality pipeline ~2.17M) — above the revised ~1.0-1.7M estimate mainly
because Phase 1 research (928K) ran ~24% over estimate and the book
supplement (309K) plus Phase 4/5 (127K) added real but reasonable cost.
Well within budget throughout; no batch was rushed to stay under the 500k
ceiling.

Open for later, not blocking: the one dead transcript file ("Jim 2"),
and whatever comes next for the knowledge-base/RAG design proper (chunking,
embeddings, retrieval) — `knowledge.md` is the raw input for that, not the
RAG system itself.
