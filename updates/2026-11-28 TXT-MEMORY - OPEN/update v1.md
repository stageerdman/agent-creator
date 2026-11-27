# TXT memory: every source becomes .txt in the app's own memory

Feature `f-all-sources-become-txt-in-app-memory` (step 1 of P4 · Real RAG,
research: `updates/2026-11-27 REQUIREMENTS-AUDIT - OPEN/research-roadmap-columbo.md` A12).

## Goal

Every file an agent uses for its instructions, its knowledge (RAG) or a
skill is turned into plain text and kept as
`<home>/agents/<id>/sources/<relative path>.txt` (home = `~/.agent-creator`
or `AGENT_CREATOR_HOME`). The agent never depends on the original staying
where it was: talk reads the copy, never the original.

## Where today's code stands

- `files.mjs`: a file is `{ path, size, feeds, source? }`; `source` is the
  absolute place on disk, set only by `POST /scan` (folderScan.mjs).
- Browser drops send `{ path, size }` only (file-intake.js), no content.
- `agentTalk.mjs` reads `file.source` live on every talk: breaks the moment
  the original moves.

## Design

- `src/creator/sourceText/extract.mjs` (pure-ish, one job): bytes + file
  name → plain text, or a specific `CantExtract` reason. `.pdf` via `unpdf`
  (MIT, zero deps, pdf.js inside); anything else read as UTF-8 and refused
  when it has NUL bytes (binary). Same scope as masters-wheel's extract.rs
  (.txt/.md/.pdf), but any text file works, not only those extensions.
- `src/creator/sourceText/memory.mjs` (use case over the store): `keep(id)`
  writes a `.txt` for every used file (feeds non-empty, not removed) that
  has no copy yet and has a `source`; `put(id, path, bytes)` for content the
  page uploads; `forgetRemoved` on rebuild deletes copies of removed files.
  The file record gets `text: "ok" | <reason>` so the UI can show why a file
  has none (rule: nothing blocks without a visible reason).
- Called after every change that gives a file a feed: chat routing
  (agents.chat), section drop (assign), createSkill.
- Store: `deleteText(id, rel)` next to readText/writeText (same path guard).
- Talk reads `sources/<path>.txt` via the store, never `file.source`.
- HTTP: `PUT /api/agents/:id/sources?path=<rel>` raw body → `{ path, text }`
  so browser drops can hand over content (client wiring is a follow-up item).
- Mac app: stage-mac-app.mjs copies production `node_modules` (unpdf).

## Phases

1. **Extract** — extract.mjs + tests (txt, md, pdf fixture, binary refused,
   empty). *Tests lock it.*
2. **Memory** — store.deleteText, memory.mjs, wired into chat/assign/
   createSkill/rebuilt; tests: copy written, original deleted → talk still
   answers from it, removed + rebuilt → copy gone.
3. **Talk reads the copy** — agentTalk uses the store; tests updated.
4. **Upload route** — PUT sources; route test.
5. **Ship** — stage node_modules for the app, npm test, server answers on
   PORT, push, feature → shipped.

## Status

- [x] Phase 1  - [x] Phase 2  - [x] Phase 3  - [x] Phase 4  - [x] Phase 5

Shipped 2026-11-28. As built, memory.mjs is `copySources` / `putSource` /
`readCopy` / `forgetCopies`. Verified: npm test green, `npm run build:app`
bundles `node_modules/unpdf`, the bundled server answers /api/health.

Follow-ups (issues.txt): the page does not yet PUT dropped files' bytes
(browser drops without a disk path have no `text` mark and no copy until it
does); a copy made from disk is not refreshed when its original changes
(a PUT upload always replaces it).
