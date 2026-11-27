# DRAFT — working notes (Columbo audit, in progress)

## Facts found so far (main = 544f761)
- App on main: only 3 pages: src/server/public/agent-home.html, agent-page.html, new-agent.html
  (+ left-side.js, creation-screen.js, file-intake.js, fireflies-dna.js, firefly-gather.js, firefly-orbit.js).
- 793c876 (2026-11-26) DELETED index.html, app.js, app.css, magic.css, components.js, block-a..f.js,
  sketch.js, tab-focus.js -> FULL-UX Sketch (Profile/DNA switches), Talk (block-d), Know (C), Identity (E),
  Share/export (F) no longer exist on main. Many "shipped" features came from those screens.
- Glass gap: src-tauri/src/main.rs:56-68 builds an opaque window: no .transparent(true), no vibrancy;
  set_background_color(0x0B1410, alpha 0xff) at :67,:73-74. tauri.conf.json has no macOSPrivateApi/transparent.
- issues.txt open items: RAG unscoped; SKILL.md Chinese; demo Talk line (block-d, now deleted);
  eye-check flaky; per-file blink; ethics of real-person clones; FIREFLIES-DNA run.cjs flaky;
  CLUSTER run.cjs stale (8 fails); CHAT ready flag via words (fragile).

## Requirements collected (source -> requirement)
- CLAUDE.md/INIT: folder of material -> (1) personality clone instructions.md, (2) RAG KB. Tony Robbins instance exists. Raw sources never committed. RAG unscoped.
- ROBBINS: knowledge.md + instructions.md built, gitignored (CLOSED, offline deliverable).
- AI-ENGINE (P1): local claude CLI, no API key, streaming /api/ask SSE, /api/health, cancel, --strict-mcp-config.
- AGENT-CREATOR v1 (P2): chat with creator, live draft name/persona/instructions, hand edits win, autosave, Keep, agents in ~/.agent-creator, find again after restart, CLI offline state, narrow layout, draft block never shown.
- AGENT-CREATOR v2 (9 fixes on creation screen): F1 no file count; F7 no status lines (waiting/used/...); F9 no fireflies by name; F2 drift + dim shine, still under reduced motion; F3 no drag; F5 loose seeded clusters; F4 skill names shown; F6 tap cluster flies to spots w/ names & back; F8 click name to rename (Enter/blur keep, Esc revert, empty keeps old, persists).
- FULL-UX: all journeys UJ1-12 clickable w/ mocks as .app; P2 chat real; mocks never leak into agent.json.
- NATIVE-SHELL: Tauri, no Chrome, /Applications, Spotlight, Start opens installed app, <10MB, server dies with shell, 7 regressions (Finder drop, Tab focus, narrow window, close mark, dark tone, old-Safari CSS, launch flash).
- MAGIC-CONCEPTS: 3 concepts as HTML pages (glade/sea/neon) in update folder; plain-text twin; Talk never delays; reduced motion.
- Features (25): see mcp feature list. Key user asks: Sketch Profile switch (face,name,desc,good/medium/not trained); DNA switch (instructions->made from->RAG files->quality); build via chat/drag/pick nested folders, files never in chat, routed by path, creator doesn't read content; creation moment; P3-P12 planned; txt memory; RAG builder; per-file score; LEFT SIDE (mess->fireflies glow one by one->final DNA logo; left arrow pulls creator chat; access to files; ready -> Create/ask more; close window; GLASSY blur, 2 rounded right corners, merged left, back arrow; barely noticeable agent chat over DNA; show agent's skill/RAG use; creator allocates files on "move outstanding files to knowledge, X,Y for transcript"); AI souls not faces (DNA logo on every face, home constellation, search, plus); magic pass; Sketch Instructions only/no Talk section; remove Studying top bar; full UX .app; P2; P1.

## Still to read
MAGIC-PASS research-columbo (skim), SKETCH-REWORK update-plan, AGENT-HOME 00-roadmap, AGENT-SELECTION-HOME 00-roadmap,
FIREFLIES-DNA 00-roadmap, CLUSTER 00-roadmap, GLADE-HOME-CONCEPTS home-brief+roadmap, GLADE-HOME-V2 brief,
CREATION-SCREEN 00-roadmap, FIREFLIES-BUILD 00-roadmap, LEFT-SIDE update v1; Reports (19) skim for user asks.
Then: npm install --no-save playwright-core? (check), npm test, PORT=3505 npm start, screenshot pages in webkit, check chat markdown in left-side.js.
