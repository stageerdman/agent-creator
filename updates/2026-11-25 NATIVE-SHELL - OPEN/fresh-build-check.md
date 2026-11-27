# Fresh build check: Start opens the newest app from main (2026-11-27, Bob)

The user said the app didn't show the latest work. This records which app Start
opens, what was stale, and the fresh build that replaced it.

## How Start works

`.project` → `run: npm run start:app` → `scripts/start-mac-app.sh`:
1. `npm run build:app`: `tauri build` stages `src/` into `dist/stage/app` and bundles
   `src-tauri/target/release/bundle/macos/Agent Creator.app`.
2. `scripts/install-mac-app.sh`: deletes `/Applications/Agent Creator.app`, copies the
   new build there, registers it with Launch Services and Spotlight.
3. Opens `/Applications/Agent Creator.app` and waits on it.

So there is one installed copy, rebuilt and replaced on every Start. Nothing to
change in the scripts.

## What was stale

- `/Users/stage/dev/agent-creator` (the main checkout, at 69d39c6) had an old
  `dist/stage/app`: no `left-side.js` in it, so the last build that finished
  there predates the Left Side. Its `src-tauri/target/release` held only cargo
  lock files, no bundle: a build there had not finished since.
- So `/Applications/Agent Creator.app` was a build from before the Left Side
  landed. That is the old app the user saw.

## The fresh build

- Built from main at `69d39c6cbf792562f86425fcd1cd7b4c030c2c08` (Fri Nov 27 19:59:50 2026 +0800),
  the same commit as `origin/main`.
- Built at: `src-tauri/target/release/bundle/macos/Agent Creator.app` (in the item's checkout).
- Installed at: `/Applications/Agent Creator.app` (the old copy deleted and replaced).
- Opened with `npm run start:app`, the same command Start runs. The open app answered on
  `http://localhost:3517/new` with the Left Side page (`mountLeftSide`).

## What was checked, on the bundled code (the server inside the .app)

- `npm test`: 226 pass, 0 fail, 1 skipped (the live test).
- `checks/left-side-check.cjs` (Chrome): ALL PASS. The Left Side is on `/new`, the handle
  slides in after a drop, the Sketcher panel opens and closes (click, Enter, Space, Esc, ‹),
  the likeness fills at 25/50/100 %, Reduce Motion, small screen, no page errors.
- `checks/sketcher-chat-check.cjs` (live `claude` CLI): PASS. One line made a draft, the
  agent got a name ("Coach Rook"), the dropped `talks/one.md` went to Knowledge
  (feeds: rag), the talk was still there after a reload.
- Keep wording: `left-side.js` shows Keep only when Sketcher says "press/tap/hit/click Keep"
  and never once the agent was kept (covered by the left-side unit tests); after Keep it says
  "Yours. You can keep changing it."
- `checks/dna-smoke.cjs` (WebKit, the app's engine): every home logo and the agent page
  logo is a lit Fireflies DNA canvas, no errors. (The Chrome run was closed from outside
  partway; the home part passed before that.) Fireflies DNA is the agents' logo in the
  app; `playground/fireflies-dna.html` is the standalone design page, not part of the app.

## Watch out for

- If an old Agent Creator window is still open when Start runs, macOS brings that old
  process to the front instead of starting the new one. Quit the app before pressing
  Start. This time the open app served the new code.
- Starting from the main checkout builds there. If that build doesn't finish, the old
  installed copy stays. The build itself works (about 90 s from cold, 30 s after that).
