# FULL-UX build plan (Jony, Phase 4–6)

Working notes for building blocks A–F into the zero-dependency Node app.
Design sources: `blocks-jony.md` (§4 frame, §5 components C1–C15, §6 data
shapes, §7 demo set), `design-jony-block-A..F.md` (each ends with "Mock
data" + "Journey trace"), words in `magic-merlin.md` §6.

## What exists (P2, keep working, real CLI)
- `src/server/app.mjs` holds the route table (`routes` object, keys like
  `"GET /path"`), static files via `staticFile(name, type)`. `router.mjs` is
  only `matchRoute`. Mock routes: `src/server/routes/mock.mjs` exporting
  `mockRoutes()`, spread into the table in app.mjs (router.mjs has no table;
  say so in the summary). Every new public file needs a static route.
- `app.test.mjs` checks `/`, `/app.js`, `/sketch.js`, `/app.css`,
  `/magic.css` serve. Agent store writes to `~/.agent-creator` (or
  `AGENT_CREATOR_HOME`), never inside the .app.
- `public/app.js` (744 lines) = the P2 Sketcher: fields name/persona/
  instructions, autosave PUT `/api/agents/:id/draft`, Keep POST `/save`,
  chat SSE POST `/api/agents/:id/chat` (events delta/draft/done/error), offline
  banner, switcher menu, narrow view switch. Top-level await boot at the end
  (loads newest real agent). `sketch.js` = pure helpers (tested).
- `index.html` ids: switcher-btn, switcher-menu, view-chat/view-sketch,
  panes, chat-pane, chat-scroll, note, empty (chips), log, banner,
  composer, composer-lead (hidden, reserved for ＋), message, send, sketch,
  sketch-title, keep, keep-card (.keep-capability reserved), f-name,
  f-persona, f-instructions, capability-map (reserved).

## Architecture decided
- **Mock state** lives in the browser: fetched once from `GET /mock/agents`
  (and `GET /mock/agents/:id`, `GET /mock/imports`, `GET /mock/imports/:file`),
  then mutated in memory by clicks. `Reset demo` refetches. Server mock is
  read-only (brief).
- **Real agents** (from `/api/agents`) show on Home next to demo agents;
  their Sketcher is the real P2 chat. Talk for real agents = one marked
  demo line (flag F2).
- **Demo agents' Sketcher** replies are scripted (F7) but go through the
  same P2 rendering: app.js `runTurn` asks an adapter; for a mock agent the
  adapter yields scripted `delta/draft/done` events instead of fetch. Same
  for draft PUT / Keep (local).
- **Screens**: `#home` (A1), first run = P2 empty state + references door
  (A2), Sketcher mode = existing `#panes` with right pane switch
  `[ Sketch | What [Name] knows ]` + face slot, Talk mode = new `#talk`
  two-pane (talk log + Past talks / Where from / fix panel). Sheets (C10) in
  one `#sheet` host. Drop overlay (C15). Demo pill + popover (C14).
- Files: `components.js` (el, face C5, map line C6, passage panel C7, C8
  surface, study block C9, sheet C10, reference row C12, palette strip C13,
  demo pill C14, drop overlay C15, store + nav bus), `block-a.js` Home,
  first run door, delete sheet, opening rules, CLI missing · `block-b.js`
  references chip, laid out (B2) + correction, study sim (B3/B4, Skip time),
  B6/B7 keep card lines, scripted Sketcher for make · `block-c.js` What
  [Name] knows (C1–C4) · `block-d.js` Talk D1–D6 · `block-e.js` E1–E5 ·
  `block-f.js` F1–F3. Each new file gets a static route in app.mjs.
- No real file picker in a browser page for paths: "macOS open panel" in the
  prototype = a small mock picker sheet listing demo files (data-mock),
  plus real `<input type=file>` drop still accepted (names only).

## Packaging
`scripts/build-mac-app.sh`: rm -rf `dist/Agent Creator.app`; create
Contents/{MacOS,Resources}; copy `src/` + `package.json` to
Resources/app; Info.plist (CFBundleExecutable=launcher); launcher script
finds node (path recorded at build time + /opt/homebrew/bin, /usr/local/bin),
picks PORT (default 3517, not 3504), starts `node src/server/main.mjs`,
waits for `/api/health`, opens Chrome `--app=` if present else `open URL`,
then waits; trap kills node. npm script `build:app`.

## Tests
`src/server/mock.test.mjs`: routes return the six demo agents; hard rule
(every SourceRef passage contains the span text; Sharp lines have a sourced
answer, Blank lines an honest answer); map never inside `draft`.

## Done when
npm test passes · npm run build:app · open the .app, curl home · click
through every block (use a headless check if possible) · commit.
