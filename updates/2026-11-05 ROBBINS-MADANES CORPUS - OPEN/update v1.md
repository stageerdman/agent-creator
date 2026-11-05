# ROBBINS-MADANES CORPUS — rebuild tony-robbins-perspective + build knowledge.md

## Goal

Source folder: `/Users/stage/Library/CloudStorage/OneDrive-Personal/Library/Tony
Robbins/Tony Robbins Classroom/CORE 100&200 by Robbins Madaness` (23GB on disk,
mostly video/audio which is explicitly out of scope). Two deliverables:

1. **Rebuild `.claude/skills/tony-robbins-perspective/`** from this corpus,
   replacing the existing instance (currently built from 3 books only, missing
   dimensions 02-conversations and 04-external-views — see
   `updates/2026-11-04 INIT - OPEN/update v1.md` Phase 2). This corpus is case
   transcripts/teleclasses (Strategic Intervention methodology, co-created by
   Tony Robbins and Cloé Madanes), so it's a much stronger source for
   conversations/coaching-style than the books were, but it is **not** Tony
   Robbins' own unscripted voice throughout — many module transcripts are
   client case studies run by other certified trainers, not Robbins himself.
   This needs to be verified per-module during Phase 1 research and recorded
   honestly (contradictions/gaps are kept, not smoothed over, per this
   project's forked methodology).
2. **Produce `knowledge.md`**: a single merged, cleaned, structured file of
   all the corpus's text content, for future RAG use. Stays local,
   **gitignored** — raw course material is sensitive per `CLAUDE.md`'s rule
   on source dumps (user confirmed 2026-11-05).

User's explicit constraints on how this update runs (2026-11-05):
- No large single run. Work proceeds in small, independently resumable
  batches, each targeting **≤500k tokens**, so it can be stopped after any
  batch and picked up in a later session without re-doing work.
- Every batch's output is written to disk immediately (never left only in
  chat/context) — that's what makes a batch resumable.
- Old `tony-robbins-perspective` content is authorized to be deleted, not
  just archived — it's being replaced outright, same directory/skill name.

## Source survey (measured 2026-11-05)

Excluding `.mp3`/`.mp4`/`.flv`/`.jpg`/`.DS_Store` and 76 empty `.lesson`
placeholder files. Exact word counts (not sampled) via `pypdf`/`textutil`/doc
metadata, per top-level module folder:

| Module | Words |
|---|---|
| 3. Life Stages (B) | 105,150 |
| 1. Introduction to Strategic Intervention | 104,384 |
| Bonus Modules | 92,585 |
| 5. Individual Transformation | 81,730 |
| 4. Finding Marital Passion | 80,969 |
| 2. Life Stages (A) | 65,213 |
| 8. Resiliency in Crisis Overcoming Grief | 64,871 |
| 6. Overcoming Inner Conflicts | 51,409 |
| 7. Group Dynamics | 47,366 |
| 9. Advanced Negotiation Skills | 35,772 |
| Bonus Module URP Educator's Kit | 287 |
| **Total** | **729,736 words ≈ 950K tokens raw text** |

File types: 71 `.doc`, 14 `.pdf`, 39 `.md`, 21 `.txt`, 10 `.docx` = 155 files.

**Revised total cost estimate: ~2.8–3.5M tokens** for the whole update
(well under the original rough estimate of 8-12M — exact per-module counts
came in lower than the sampled extrapolation, and batching knowledge.md +
Phase-1 research extraction into the same read pass per module-group avoids
reading the corpus 6 separate times).

## Batching strategy

**Key efficiency decision**: nuwa-skill's 6 research dimensions are normally
filled by 6 agents each independently searching the web (no redundant reads,
since each hits different sources). In local-corpus mode, all 6 dimensions
can appear in the *same* transcript — the methodology's own local-corpus
section already says this ("一本书可能同时覆盖著作+对话+表达多个维度"). So
each module-group is read **once**, and that single pass produces both (a) a
cleaned `knowledge.md` chunk and (b) tagged excerpts appended into whichever
of the 6 `references/research/0X-*.md` files apply — instead of 6 separate
full-corpus passes.

Module folders bucketed into 5 roughly-even groups (~140-150K words /
~180-200K tokens raw each, leaving headroom under 500k once output is
included):

| Group | Modules | Words |
|---|---|---|
| G1 | 3. Life Stages (B) + 9. Advanced Negotiation Skills | 140,922 |
| G2 | 1. Introduction to Strategic Intervention + Bonus Module URP Educator's Kit + 7. Group Dynamics | 152,037 |
| G3 | Bonus Modules + 6. Overcoming Inner Conflicts | 143,994 |
| G4 | 5. Individual Transformation + 8. Resiliency in Crisis Overcoming Grief | 146,601 |
| G5 | 4. Finding Marital Passion + 2. Life Stages (A) | 146,182 |

## Batch ledger (resumability: read this table first in any new session;
run exactly one `pending` batch, mark it `done`, stop or continue)

| # | Phase | Scope | Est. tokens | Status |
|---|---|---|---|---|
| 0 | Mechanical extraction | Convert all `.doc`/`.docx`/`.pdf` to clean staged `.txt` with module/source metadata headers (local tools only — pypdf, textutil — near-zero model tokens). Not gated by the 500k rule. | ~20K | pending |
| 1 | Knowledge.md + Phase 1 research (dual-purpose read) | Group G1 | ~400K | pending |
| 2 | Knowledge.md + Phase 1 research | Group G2 | ~430K | pending |
| 3 | Knowledge.md + Phase 1 research | Group G3 | ~410K | pending |
| 4 | Knowledge.md + Phase 1 research | Group G4 | ~420K | pending |
| 5 | Knowledge.md + Phase 1 research | Group G5 | ~420K | pending |
| 6 | Phase 1.5 checkpoint | Research-quality summary table shown to user for confirm/adjust | ~20K | pending |
| 7 | knowledge.md finishing pass | Add TOC/front-matter/index across all 5 groups' content | ~60K | pending |
| 8 | Phase 2 | Synthesis: mental models, decision heuristics, expression DNA, values/anti-patterns, lineage, honest boundary, coaching style — from the 6 condensed research files, not raw corpus | ~150K | pending |
| 9 | Phase 2.5 checkpoint | Confirm synthesis with user | ~10K | pending |
| 10 | Phase 3 | Construct new `instructions.md` from `references/skill-template.md` | ~100K | pending |
| 11 | Phase 4 | Independent validation (sanity/edge/voice tests + `quality_check.py`) | ~150K | pending |
| 12 | Phase 5 | Dual-agent refinement, checkpoint, apply | ~150K | pending |
| 13 | Cleanup | Delete old instructions.md/research/sources content being replaced, finalize `.gitignore` for `knowledge.md` and staged sources, update this file's Status section, commit + push | ~20K | pending |

Total estimate: ~2.77M tokens across 14 batches; only batches 1-5 are "big"
(~400-430K each), everything else is small.

## Open questions carried into execution (not blocking the plan, flagged for
Phase 1 research to resolve with evidence)

- Which modules/transcripts are actually Tony Robbins' own voice vs. other
  certified Strategic Intervention trainers coaching the case-study clients?
  Record per-module in `references/research/`, don't assume uniformly.
- Dimension 04 (external-views) may still be thin — this corpus is
  Robbins-Madanes-authored training material, not outside critique of
  Robbins. Carry forward as an honest-boundary gap if so, same as the
  previous instance did.

## Status

Plan written 2026-11-05. No batches executed yet — user explicitly asked to
stop after planning. Next action: run batch 0 (mechanical extraction) when
given the go-ahead, then proceed batch-by-batch per the ledger above.
