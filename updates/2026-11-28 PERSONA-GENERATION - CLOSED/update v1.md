# Persona and context generation (P5)

Feature `f-p5-persona-context-generation` (step of `f-p4-real-rag-knowledge-base`).

## Where we start

Files routed to the "instructions" feed (the System prompt section, "for the
persona") already get a plain-text copy at `sources/<path>.txt`
(sourceText/memory.mjs). Nothing reads those copies yet: the Sketcher only
routes files by name and never sees what is inside.

## Design (decided)

- **One generation call through the P1 engine** (`engine.askAgent`, chat
  mode, no tools): the model gets the persona sources' text and answers
  with a short chat line plus one `<persona>{json}</persona>` block, parsed by
  the existing `splitReply` / `askWithBlock`. No build-job mode (file tools)
  is needed: the backend reads the copies and hands them over.
- **Output:** `name`, `persona`, `instructions` go into the draft through
  `applyPatch` (source "creator"); `context` (the person's background: facts,
  story, beliefs, the way they work, drawn only from the sources) is kept as
  `context.md` in the agent's folder. Talk puts it right after the agent's
  identity.
- **Hand edits win:** a field the user edited by hand is not overwritten;
  the answer lists it in `kept`. Hand-typed lines are sent so the model keeps
  them in what it does write.
- **Budget:** the sources are packed under a character cap (pure
  `packSources`): each file gets a fair share, short files give their unused
  share to the rest; a cut file is reported (`cut`). Files without a usable
  copy are reported (`skipped`) and never fail the run.
- **Baked:** the files used turn green in the System prompt section
  (`rebuiltFeed(files, "instructions", used)`).
- **Errors:** no usable source → `BadInput` (400). Engine errors pass through
  with their `kind`. A reply without a valid block → `BadOutput`-style error,
  nothing saved.
- `POST /api/agents/:id/persona/build` → SSE: `delta { text }` (as chat and
  talk), then `done { say, draft, changed, kept, context, used, cut, skipped,
  dna }` or `error { kind }` (`bad-input` for no usable source, since the
  stream is already open; an unknown agent is a plain 404 before it opens).
  `GET /api/agents/:id/context` → `{ text }`.

Module: `src/creator/persona/` — `pack.mjs` (pure), `personaPrompt.mjs`
(pure), `personaBuilder.mjs` (use case).

## Phases

1. **Pure pieces** — `pack.mjs` (`packSources`), `personaPrompt.mjs`
   (prompt, message, `readGenerated`) + tests.
2. **Use case** — `personaBuilder.mjs` (`buildPersona`, `getContext`) wired
   into `createAgents`; context in the talk prompt + tests with a fake engine.
3. **HTTP** — the two routes + server tests.
4. **Ship** — npm test, Start still works, features updated.

## Status

- [x] Phase 1  - [x] Phase 2  - [x] Phase 3  - [x] Phase 4

Shipped: 346 tests, 344 pass, 0 fail, 2 skipped by design. Routes in
`src/server/routes/persona.mjs`, server tests in `src/server/persona.test.mjs`.
