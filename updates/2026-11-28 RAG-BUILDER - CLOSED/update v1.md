# RAG builder: one knowledge file merged from many sources, with Build

Feature `f-rag-builder-one-knowledge-file-from-many` (step of
`f-p4-real-rag-knowledge-base`). Builds on RAG-KNOWLEDGE: every Knowledge
file (feed `rag`) already has a copy at `sources/<path>.txt` and its chunks
in `knowledge/index.json`.

## Goal

The agent's knowledge is one file, `knowledge.md`, merged from its
Knowledge sources. The user lists the sources, adjusts one (title, note,
edited text), swaps one for another file, or takes one out of Knowledge,
then presses **Build**: `knowledge.md` is rewritten from exactly the
sources that are really searchable, and those turn green (baked `rag`).

## Design (decided)

- `knowledge.md` = exactly what the agent can search: sources with a copy
  (`text: "ok"`) **and** proven embedded (`embed: "ok"`), in file-list order.
  Others are reported `skipped: [{ path, reason }]`. Talk stops inlining
  `knowledge.md` (it would repeat all knowledge); it retrieves passages.
- Adjust (`title`, `note` on the file; `text` rewrites the copy and clears
  `embed`) takes `rag` out of `baked`: changed since the build = dim.
- Swap: the new file joins at the old one's place in the list, gets `rag`
  and the old title/note; the old one leaves Knowledge (unassign).
- Remove from Knowledge = unassign the `rag` feed only: its chunks are
  forgotten and its `embed` mark cleared at once. Baked → red until Build;
  a file left feeding nothing and baked nowhere stays in the DNA list.
- Build = copySources → embedFiles → merge + write → bake `rag` for the
  built ones, drop `rag` from baked of the rest; a removed file baked
  nowhere any more is dropped (copy + chunks forgotten).
- Modules: `knowledge/merge.mjs` (pure), `sections.mjs` gains
  `unassignFile` + `rebuiltFeed` (pure), `fileList.mjs` (shared
  changeFiles, moved out of agentMaterial), `knowledge/knowledgeBuilder.mjs`
  (use cases), `routes/knowledge.mjs` (HTTP).

## API

- `GET    /api/agents/:id/knowledge/sources` → `{ sources: [{ path, name, size, state, text, embed, title, note }] }`
- `PATCH  /api/agents/:id/knowledge/sources?path=` `{ title?, note?, text? }` → `{ source, embeds }`
- `POST   /api/agents/:id/knowledge/sources/swap?path=` `{ file: { path, size, source? } }` → `{ sources, dna, embeds }`
- `DELETE /api/agents/:id/knowledge/sources?path=` → `{ sources, dna }`
- `POST   /api/agents/:id/knowledge/build` → `{ text, built, skipped, embeds, sources, dna }`
- `GET    /api/agents/:id/knowledge` (exists) → `{ text }`

## Phases

1. **Pure rules** — merge.mjs, unassignFile, rebuiltFeed + tests.
2. **Use cases** — fileList.mjs refactor, knowledgeBuilder (list, adjust,
   swap, remove, build), memory.editCopy; tests with the fake embedder.
3. **HTTP + talk** — routes, wiring in agents/app, talk no longer inlines
   knowledge.md; server tests.
4. **Ship** — npm test, Start still works, feature updated.

## Status

- [x] Phase 1  - [x] Phase 2  - [x] Phase 3  - [x] Phase 4
