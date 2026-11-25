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
  Contents/MacOS/agent-creator   Rust (Tauri): finds node, starts the server,
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
