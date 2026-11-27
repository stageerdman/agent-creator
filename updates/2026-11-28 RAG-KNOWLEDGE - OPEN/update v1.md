# RAG knowledge: chunk → embed locally → per-agent store → retrieval

Feature `f-p4-real-rag-knowledge-base`. Builds on TXT memory
(`updates/2026-11-28 TXT-MEMORY - OPEN`): every used file already has a
plain-text copy at `sources/<path>.txt`. Ruling: research A11 in
`updates/2026-11-27 REQUIREMENTS-AUDIT - OPEN/research-roadmap-columbo.md`.
Modelled on `dev/masters-wheel/src-tauri/src/knowledge/`.

## Goal

A Knowledge file (feed `rag`) is *really embedded* when its copy was cut
into chunks (~1,500 chars, 200 overlap), each chunk embedded by a local
model and saved in the agent's own store, and a search with a line from the
file finds a chunk of that file. Only then the server sends
`{type:"embedded", file}`; otherwise `{type:"embed-failed", file, reason}`.
Talk puts the best chunks for the user's message first in the system prompt.

## Design (decided, see wiki.md)

- `src/creator/knowledge/chunk.mjs` — pure port of masters-wheel chunk.rs.
- `src/creator/knowledge/vectorIndex.mjs` — pure: cosine, top-k, add/drop
  a file's chunks on a plain `{ model, dims, chunks:[{file,text,vector}] }`.
- `src/creator/knowledge/embedder.mjs` — fastembed (npm), AllMiniLML6V2,
  384 dims, loaded lazily once, cache at `<home>/models`. Passed in, so
  tests use a fake.
- `src/creator/knowledge/knowledgeBase.mjs` — use case: `embedFiles(id)` →
  events, file mark `embed: "ok" | reason`; `retrieve(id, query, k)`;
  `forget(id, paths)`. Store file: `knowledge/index.json` via agentStore
  readText/writeText.
- Wiring: after copies are made for rag files (chat routing, section drop,
  putSource) → embed; SSE `embedded` / `embed-failed`; gone/rebuilt drop
  chunks; talk retrieves instead of inlining rag copies.

## Phases

1. **Spike + chunk** — spike/spike.mjs (done: 384 dims, right passage wins);
   chunk.mjs + tests.
2. **Index** — vectorIndex.mjs + tests (top-k order, drop, replace).
3. **Embed** — embedder.mjs + knowledgeBase.mjs; tests with a fake
   embedder (proof search, marks, failures); opt-in live test, real model.
4. **Wire** — material/chat/putSource/remove/rebuilt + SSE events + talk
   retrieval; route and talk tests.
5. **Ship** — deps in package.json, Mac app bundles them, npm test, Start
   still works, feature updated.

## Status

- [x] Spike  - [ ] Phase 1  - [ ] Phase 2  - [ ] Phase 3  - [ ] Phase 4  - [ ] Phase 5
