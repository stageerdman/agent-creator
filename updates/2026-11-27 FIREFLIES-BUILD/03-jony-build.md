# 03 — Jony: the + build screen, built

Built from `01-columbo-report.md` and `02-merlin-motion.md`. Branch `studio/build-the-fireflies-build-screen-into-th-cb40aa46`.

## User goal

Press +, give the new agent a folder, see it come alive. One gesture: click the middle, or drop anywhere.

## What was built

- **`src/server/public/firefly-orbit.js`** (new): the 30-firefly ring, rest, hover lean (5 flies lean in, faint word at peak .36 in the firefly colour), drag stir, answer (glow, speed-up to 6, hold for the save), first light, failed-save settle (900 ms), Reduce Motion. It reuses `MIN_R`, `MAX_R`, the glow and the colour from `fireflies-dna.js`, which is unchanged. It also reads what was given: `entriesOfFiles` for a pick and `entriesOfDrop` for a drop. Both return `[{ path, size }]`.
- **`src/server/public/new-agent.html`**: the screen, keeping the `glade.call` arrival fade from home. Clicking the middle opens the folder picker (`<input webkitdirectory>`). A drop works anywhere on the page. Both go to one `onChosen(entries)`: `POST /api/agents` gives `{ id }`, then `POST /api/agents/:id/files { files }`, then answer, then first light and the calm placeholder. Esc goes home in every state.
- **`src/server/public/firefly-orbit.test.mjs`**: 15 tests covering the ring, radii, hover, stir, answer, failed save, Reduce Motion, and pick and drop entries.
- **`src/server/app.mjs`**: `firefly-orbit` added to the list of served page scripts. This is a static file, not a route.

**No new routes. No Rust or Tauri change.** `main.rs` already had `.disable_drag_drop_handler()`, so HTML drops reach the page. The WebKit folder input opens the native Finder panel.

## One change outside my files — please look (Columbo, Eraser)

`src/creator/agents.mjs` `list()` used to hide any agent with an empty draft. An agent built only from a folder has files but no words, so it was hidden and Esc went home to a list without it. That breaks report B7, "the new agent is at the top". It now stays listed when it has files (`!isEmpty(draft) || files.length`). There is a test for it in `src/creator/agents.test.mjs`, and `src/server/agents.test.mjs` was adjusted.

## Decisions (simplest reasonable choice)

- **Paths keep the chosen folder's name** (Q5): `Recipes/soup.md`. So the DNA topic is that folder for every file, and a fresh agent shows in one colour. Flagging in case several colours were expected.
- **Dot-files and dot-folders are skipped** (`.DS_Store`, `.git`). A `.app` is taken as it is (Q4).
- **The answer starts at the first real file found**, so a huge folder never makes the ring wait. A drop with no files (an empty folder, a link, text) settles back calmly with no words.
- **An empty folder pick counts as cancel.** Cancel is detected by the input's `cancel` event, with a 400 ms window-focus fallback.
- **A failed save** deletes the half-made agent and the ring settles back over 900 ms, with no words.
- **A second pick or drop during the answer is ignored.**
- **Any drag stirs the ring.** Only a drop that has files answers.
- **Reduce Motion**: no call light and no orbit movement; radii and speed never change. Only brightness answers.
- **A dropped file whose entry can't be read** (WebKit, or a file with no disk path, such as some app drags) falls back to the item's own file, so it still counts.
- `window.orbit.info()` is a read-only view of the ring for checks (Eraser's `checks/build-screen-check.cjs` can use it): `state`, `flies[{r,…}]`, `textOpacity`.

## How to try it

- Browser: `npm start`, open `http://localhost:3504/`, press +, then click the middle and pick a folder, or drop a folder anywhere. Esc goes home.
- App: the studio's Start (`scripts/start-mac-app.sh`), then +.

## Where it was tested (commit cd55100)

- `npm test`: 133 pass, 1 skipped (the live CLI test).
- **Chrome and WebKit** (Playwright, dev server with a scratch home), all pass in both: ring of 30 at rest, radii 2.5–6, hover word .36 in `rgb(216, 242, 106)`, leave fades it, pick → answer → first light → "New agent", agent made with 2 files (hidden file left out), Esc home, cancel settles, drag stirs, drop → answer → first light, text drop settles, Reduce Motion: nothing moves, no speed-up, no page errors.
- **Installed build** (`npm run build:app` → `/Applications/Agent Creator.app`): `scripts/check-mac-install.mjs` all pass, with a native window on screen. Against the installed app's own server (WebKit, read-only so no agents were made in real data): + opens /new, ring of 30, the newest `firefly-orbit.js` served, the picker is a folder picker, Esc goes home, no errors.

## Not verified (risks)

- **I could not drive the native Finder panel or a real Finder drag inside the app window headlessly.** WKWebView should honour `webkitdirectory` (it opens a folder panel), and HTML drops reach the page because Tauri's own drop handler is off. This still needs one manual click and one manual drop in the installed app.
- Chrome's automatic `/favicon.ico` request 404s on every page in the app (there is no favicon). This is older than my work and harmless. My smoke run ignores it.
