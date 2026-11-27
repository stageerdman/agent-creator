# Knowledge quality & learning insight (P10)

Features `f-per-file-quality-usefulness-score` and
`f-p10-learning-insight-knowledge-quality-s` (steps of `f-p4-real-rag-knowledge-base`).

## Goal

Show the user what an agent learned from, and how well: every file it uses
gets a structure score and a usefulness score for this agent, and the
persona gets a capture rating against its sources. The user decides from
it what to keep or swap. Like the capability map (P12), the report is for
the user only: the agent never reads it.

## Where we start

Every used file has a text copy (`sourceText/memory.mjs`). The capability
map already reads "every used file with a copy, tagged with its role"
(`capability/capabilitySources.mjs`: `readUsable`, `fingerprintOf`) and
answers through `askWithBlock`. The chunker (`knowledge/chunk.mjs`) is what
Knowledge files are actually cut with.

## Scoring method (decided with Elon Engineer)

- **Structure, 0–100, in code, no AI** (repeatable, free, always fresh):
  - *chunk fit*: run the real chunker; share of chunks of a usable size
    (≥ 200 chars unless the whole file is one chunk, ≤ 1.2 × target) that
    end where a paragraph ends (not sliced mid-sentence).
  - *clean text*: share of characters in lines that are neither junk
    (under half letters: page numbers, rules, OCR noise) nor a repeat of an
    earlier line (running headers).
  - Knowledge files: the mean of both. Persona and skill files are never
    chunk-searched: clean text only.
- **Usefulness, 0–100, by AI**, one call per batch of 10 files, each seen as
  a head/middle/tail excerpt, judged against the agent's name, persona and
  instructions (or, before those exist, against what the files are about
  together). Anchors depend on the role: knowledge files on fit to the
  agent's topic, persona files on how first-hand the person's voice is;
  90 core · 60 relevant but thin/secondhand · 30 loosely related · 0 noise.
  One-line reason each. Cached per file by its fingerprint plus the
  agent's fingerprint, so only changed files are scored again. Scores drift
  about ±5–10 between runs: the screen shows bands, not exact numbers.
- **Persona capture, 0–100, by AI**, a separate call from the one that
  wrote the persona (self-grading is unreliable): samples of the persona
  sources against the generated persona, instructions and background.
  First: beliefs in the sources missing from the persona. Then four scores
  with a reason each: beliefs 30, voice 25, how they decide and work 25,
  honesty 20. Specific claims (names, numbers, dates) not found in the
  samples are listed as "unsupported in samples", never "invented".
  No letter grade.

## Design

- Module `src/creator/quality/`: `structure.mjs` (pure scores),
  `excerpt.mjs` (pure samples), `usefulnessPrompt.mjs`,
  `personaRatingPrompt.mjs` (pure prompts and readers),
  `qualityBuilder.mjs` (use case).
- `readUsable`/`fingerprintOf` get a second caller: they move to
  `sourceText/usable.mjs`.
- Saved as `quality.json`: per-file usefulness with its fingerprint, the
  agent fingerprint, and the persona rating with its fingerprint.
- `GET /api/agents/:id/quality` → `{ files, persona, progress, stale }`:
  `files` is every used file (role, state, structure live, usefulness with
  its own `stale`, or why it has no copy); `progress` is what it learned
  from (`files`, `readable`, `learned`, `scored`); `stale` says a build
  would change something. Never calls the engine.
- `POST /api/agents/:id/quality/build` → SSE `progress { done, total }*`,
  then `done { report }` or `error { kind }` (`bad-input`: no source with
  text; `bad-output`: no call gave a usable block).

## Phases

1. **Pure pieces** — move `readUsable`/`fingerprintOf`; `structure.mjs`,
   `excerpt.mjs` + tests.
2. **Prompts** — `usefulnessPrompt.mjs`, `personaRatingPrompt.mjs`
   (prompt, message, reader) + tests.
3. **Use case** — `qualityBuilder.mjs` (`buildQuality`, `getQuality`,
   caching) wired into `createAgents` + tests with a fake engine.
4. **HTTP & ship** — the two routes + server tests (incl. talk never sees
   the report), npm test, Start still works, features updated.

## Status

- [ ] Phase 1  - [ ] Phase 2  - [ ] Phase 3  - [ ] Phase 4
