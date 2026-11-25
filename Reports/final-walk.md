# Final walk in the installed app (DRAFT, in progress)

Branch `studio/walk-every-block-in-the-installed-app-an-a32bfa51` at 5f93f22.

## Done so far
- Rebuilt and reinstalled `/Applications/Agent Creator.app` from this branch (`npm run build:app`, 4.37 MiB).
- `node scripts/check-mac-install.mjs`: all 9 checks PASS (Spotlight x2, no Chrome in bundle, 4.6 MB, page served, 6 demo agents, native shell running, window on screen 1200x860, no Chrome in launch path).
- `npm test`: 120 tests, 119 pass, 0 fail, 1 skipped (live).
- Old walk `BROWSER=webkit node scripts/walk-full-ux.mjs http://localhost:3517/` (headless WebKit against the installed app's own server on 3517): Home, Talk, Not Rex, export/import, F3 First words, A2/A3, B1-B4 pass; the C/E1-E5/B3/B6 steps fail only because they wait for `#rs-knows`, `#rs-sketch`, `.refs-toggle`, "Sketch: persona updated", which the Sketch rework removed on purpose (walk script out of date). No page errors.

## Code findings so far (check 5, Eraser cuts): NONE of the six are applied
- X1: `magic.css:310` and `magic.css:636` both define `@keyframes magic-card-settle`.
- X2: `magic.css:612` `magic-fade` and `magic.css:661` `magic-toast-rise` still exist.
- X3: Palette menu item `block-a.js:124`; E5 Palette view `block-e.js:285-382`; `E.closePalette()` `block-b.js:60`; CSS `app.css:611-631`; export sheet still lists "Palette (only you see it)" `block-f.js:55`.
- X4: no `is-error` anywhere; error toasts still rise.
- X5: `app.js:673-692` firstSketch has no pointerdown/keydown "click wins" listener.
- X6: `app.css:734` `.talk-views .dot` still there; `app.js:474` inline matchMedia; `index.html:32` stray space `aria-controls="sketch" >`.

## Studying bar (check 3) note
- Top-bar study pill is gone (test P1). But "Studying · N of M" still shows on Home cards (`block-a.js:134`) and in DNA "Looks up" (`components.js:195-209`). Decide: these are study progress lines, not the top bar.
