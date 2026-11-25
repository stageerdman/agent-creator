# Installing the macOS app (Uncle Bob, 2026-11-25)

> Superseded the same day: the Chrome launcher below was replaced by a Tauri
> shell (native WebKit window). See `updates/2026-11-25 NATIVE-SHELL - OPEN/`.
> The install, Spotlight and Start parts still hold.

## How it works now
- `npm run build:app` builds `dist/Agent Creator.app` **and** installs it into
  `/Applications` (falls back to `~/Applications`), then registers it with
  Launch Services (`lsregister -f`) and Spotlight (`mdimport`).
- Start (`run: npm run start:app`) builds, installs and opens the installed
  copy, and stays running until the app quits.
- Bundle id `app.agent-creator`; icon drawn by `scripts/make-mac-icon.mjs`
  (pure Node, writes PNG-based `.icns`).
- `node scripts/check-mac-install.mjs [shot.png]` checks the whole chain:
  Spotlight finds it (by bundle id and by name), it opens, page + demo data
  answer, the window is on screen; with a path it also renders the page.

## Lessons
- **Rosetta:** a shell-script app executable got started as x86_64, so Chrome
  ran under Rosetta and never opened its window. The launcher now re-runs
  itself with `arch -arm64` on Apple Silicon (plus `LSArchitecturePriority`).
- **Spotlight types a folder by the name it first sees.** Copying to
  `X.app.new` and renaming left it indexed as a plain folder; copy straight
  to the final name. Indexing takes a few seconds after the copy.
- **Sandbox:** inside an agent session the studio stops the system Google
  Chrome after ~10–30 s, even when the app is opened with `open`. The window
  did open on screen (1200×930, frontmost, Home with the six demo agents);
  the shutdown is the sandbox, not the app. Opened from Spotlight or Finder
  by the user, it is not affected.
