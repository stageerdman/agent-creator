# Capability map (P12): good at / medium / not trained for

Feature `f-p12-agent-capability-map-good-at-medium` (step of `f-p4-real-rag-knowledge-base`).

## Goal

As soon as materials come in, the user is told plainly what the agent will
be good at, medium at, and not trained for: specific, niche lines drawn from
the material, never generic. The user can talk the map through with the
creator (the Sketcher). The map is for the user only: it never reaches the
agent's own prompt, context, description or instructions. When the agent
launches the screen shows it as a short card.

## Where we start

Every used file has a plain-text copy at `sources/<path>.txt`
(sourceText/memory.mjs, `file.text === "ok"`). The persona builder already
packs such copies under a character cap (`packSources`) and makes one
engine call that answers with a `<tag>{json}</tag>` block (`askWithBlock`).
The Sketcher sees file paths only, never content.

## Design (decided)

- **Sources:** every used file with a copy (not removed, any feed: Knowledge,
  System prompt, skills), each tagged with its role so the model knows what
  the agent will look things up in versus what shapes its voice.
- **One engine call** (chat mode, no tools) through `askWithBlock`, tag
  `capabilities`: a short chat line plus
  `{"good": [{"text", "from"}], "medium": [...], "notTrained": [...]}`.
  `from` lists the source paths a line rests on; unknown paths are dropped.
  A reply with no valid block, or no lines, is `BadOutput`; nothing saved.
- **Budget:** `packSources` is shared now, moved from `persona/pack.mjs` to
  `sourceText/pack.mjs` (second caller).
- **Saved** as `capabilities.json` in the agent's folder:
  `{ good, medium, notTrained, sources, fingerprint, builtAt }`. The
  fingerprint is a hash of the usable sources' paths and text, so a new,
  removed or edited copy makes the map `stale`.
- **"As soon as materials come in":** `GET` answers `{ map, stale }`; the
  screen builds when `stale` is true (after a drop, a scan, a route). The
  backend never spends an engine call on its own.
- **Creator chat:** each turn's `<turn_context>` carries a
  `<capability_map>` block (with its own rule line, since a resumed session
  never re-reads the system prompt): the Sketcher may talk it through, never
  copy it into name, persona or instructions.
- **Never in the agent:** talk, persona build and system-prompt writing do
  not read `capabilities.json`; a server test locks that in.
- `POST /api/agents/:id/capabilities/build` → SSE `delta { text }*`, then
  `done { say, map, stale, used, cut, skipped }` or `error { kind }`
  (`bad-input`: no source with text; `bad-output`: no valid block).
  `GET /api/agents/:id/capabilities` → `{ map | null, stale }`.

Module: `src/creator/capability/` — `capabilityPrompt.mjs` (pure),
`capabilityBuilder.mjs` (use case).

## Phases

1. **Pure pieces** — move `packSources` to `sourceText/`; `capabilityPrompt.mjs`
   (prompt, message, `readMap`) + tests.
2. **Use case** — `capabilityBuilder.mjs` (`buildCapabilities`,
   `getCapabilities`, fingerprint) wired into `createAgents`; the map in the
   creator's turn context + tests with a fake engine.
3. **HTTP** — the two routes + server tests, including "talk never sees it".
4. **Ship** — npm test, Start still works, features updated.

## Status

- [x] Phase 1  - [x] Phase 2  - [x] Phase 3  - [x] Phase 4

Final shape (backend): `src/creator/capability/` holds `capabilityPrompt.mjs`,
`capabilitySources.mjs` (roles, usable copies, fingerprint),
`capabilityBuilder.mjs` and `capabilityContext.mjs` (the creator-turn block);
`src/server/routes/capabilities.mjs` holds the two routes as designed.
`src/server/capabilities.test.mjs` locks in that talk never reads the map.
Still open, for the screen: call `GET` after materials change and build when
`stale`; show the map as a card at launch.
