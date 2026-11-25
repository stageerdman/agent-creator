# NATIVE-SHELL: the .app as a light native Mac app, no Chrome

## Goal

The FULL-UX `.app` was a shell script that started the local Node server and
opened it in Google Chrome (`--app=`). The user does not accept a Chrome
thing. Rebuild the shell with **Tauri 2**: a small Rust binary that draws its
own native Mac window with macOS's own WebKit (WKWebView). No Chrome,
Chromium or Electron is bundled or started.

**Done when:**
- no Chrome or Chromium in the bundle or the launch path;
- the app opens as its own native Mac window;
- it is installed in `/Applications` and Spotlight finds it;
- Start opens the installed app;
- `npm test` and the UX walk script (33 steps) pass, and the walk also
  passes in WebKit, the engine the new window uses;
- the bundle is small (target: under 10 MB).

## Shape

```
Agent Creator.app
  Contents/MacOS/Agent Creator   Rust (Tauri): finds node, starts the server,
                                 opens a native window on it, stops the
                                 server on quit
  Contents/Resources/app/        the existing Node app (src/, package.json),
                                 tests stripped, unchanged otherwise
```

- **Engine and screens are reused as they are.** The engine is the Node
  module `src/engine/` (P1) with the creator (P2); every screen is
  `src/server/public/`. The shell only changes who draws the window.
- **The server dies with the shell.** The shell kills it on quit, and the
  server also exits when its stdin pipe from the shell closes, so a crashed
  shell leaves no orphan.
- **Port:** 3517 when free (the install check uses it), else any free port.
- **Node** is still the user's own (as before): `AGENT_CREATOR_NODE`, then
  the node the app was built with, then the usual install places.

## Decisions

- **Tailwind: not now.** The brief recommended Tailwind for styling. The
  screens already have their own hand-written design system (`app.css`,
  `magic.css`) that the six blocks were designed and signed off against.
  Porting it to Tailwind changes nothing the user asked for (Chrome is the
  problem, not the CSS), adds a CSS build step, and puts the signed-off
  look of all six blocks at risk. It can be done later as its own update.
- **No Tauri IPC, no plugins.** The window loads the local server's page,
  so the front end does not change and needs no capabilities.

## Roadmap

### Phase 1: Tauri shell
- `src-tauri/`: `main.rs` (app and window), `server.rs` (start, wait,
  stop), `node.rs` (find node), `alert.rs` (fatal-error dialog).
- `scripts/stage-mac-app.mjs`: copies the app code and draws the icons
  before `tauri build`.
- **Tests:** `cargo test` for finding node and picking a port.

### Phase 2: Build, install, Start
- `npm run build:app` builds with Tauri and installs into `/Applications`;
  `npm run start:app` (Start) opens the installed copy.
- `scripts/check-mac-install.mjs`: Spotlight, opens, page and data answer,
  native window on screen, and no Chrome in the bundle or process tree.
- **Check:** the check script passes against the installed app.

### Phase 3: Same six blocks
- The walk script can run in WebKit (`BROWSER=webkit`), the engine of the
  new window. All 33 steps pass in both.
- **Check:** `npm test` green, walk 33/33 in Chromium and WebKit.

## Status

- 2026-11-25: plan written (Uncle Bob). Phase 1 started.
- 2026-11-25: phases 1–3 done (Uncle Bob).
  - `npm run test:shell`: 6/6 Rust tests pass.
  - `npm run build:app`: the bundle is **4.3 MB** and needs no browser (the
    old one ran inside the system Google Chrome), installed at `/Applications/Agent Creator.app`.
  - `node scripts/check-mac-install.mjs`: all checks pass. Spotlight finds it
    by id and by name, the bundle has no Chrome, the page and the 6 demo
    agents load, the native window is on screen (1202×862), and the only
    child process is `node src/server/main.mjs`. After Quit, the server is
    gone too.
  - Walk: 33/33 in WebKit and 33/33 in Chromium, with no page errors.
  - `npm test`: 85 pass, 1 skipped (live).
- 2026-11-25: Magic UX checked the look and the clicks (Columbo walk, Jony
  look, Eraser sign-off). Flows: 33/33 in WebKit. **Sign-off OPEN:** 7
  regressions (2 high: NF-1 Finder drops do nothing, NV-1 Tab skips all
  buttons) went to Uncle Bob in `regressions-for-bob.md`.

## How to run

- Build and install: `npm run build:app`. Start runs `npm run start:app`,
  which builds, installs and opens the installed copy.
- Rust tests: `npm run test:shell`. It needs Rust/cargo, so it is kept out of
  `npm test`, which the studio runs.
- Install check: `node scripts/check-mac-install.mjs [shot.png]`. The
  screenshot needs screen-recording access and is skipped without it.

## Lessons

- **Own target dir.** The studio sets a cargo target dir shared by all
  checkouts. There `tauri-build` failed with `File exists (os error 17)`,
  because copying the `app/` resource ran into another project's `app`
  binary. Both scripts set `CARGO_TARGET_DIR` to this checkout's own
  `src-tauri/target`. `tauri build` runs cargo inside `src-tauri/`, so its
  value there is `target`, while `cargo test --manifest-path` runs from the
  root and needs `src-tauri/target`.
- **Resources must exist before compiling.** `tauri-build` checks resource
  paths even for `cargo test`, so `test:shell` stages the app first.
