# NATIVE-SHELL regressions — fixes (Bob)

For Eraser's re-check of `regressions-for-bob.md` (commit 514208a). Fixes in 854ddd0, plus 2302784.

| Item | Fix | Checked |
|---|---|---|
| NF-1 Finder drag | `.disable_drag_drop_handler()` in `src-tauri/src/main.rs` | **Hand check by the user** in the installed app: the overlay shows; dropping opens a new agent chat with the file on top. |
| NV-1 Tab to buttons | page-side Tab handler `src/server/public/tab-focus.js` (stays inside an `aria-modal` sheet) | **Hand check by the user**: Tab moves the focus ring across Home's buttons. They could not find a delete sheet, so the in-sheet part was not hand-checked. WebKit probe: Tab 1–6 go Talk to Rex Hart → Last: … → Talk to Marcus …, `:focus-visible` with a solid outline; Shift+Tab goes back. |
| NF-2 narrow layout | `min_inner_size(640, 640)` | not hand-checked |
| NV-4 macOS floor | `minimumSystemVersion` 13.3 (color-mix and range queries need Safari 16.4) | config only |
| NV-2 ✕ size | inline SVG cross `closeBtn()` in components.js | WebKit: 12×12 |
| NV-3 dark tone | pinned `--canvas` to #121212 (dark) / #fff | WebKit dark: html bg rgb(18,18,18) |
| NV-5 launch flash | window built hidden, background set by theme, then shown | not hand-checked |

## Found on the way (fixed in 2302784)

854ddd0 left Home **blank**: `app.js` imports `/tab-focus.js` but the server only served a fixed list of scripts, so it 404'd. All page scripts now come from one `PAGE_MODULES` list, and a test checks that every `/x.js` the page imports is served. `check-mac-install.mjs` did not catch this (it checks that the page is served, not that it boots); the WebKit walk did.

## Runs after the rebuild (`npm run build:app`)

- `npm test`: 88 pass, 1 skipped (live).
- `node scripts/check-mac-install.mjs`: all PASS (4.5 MB bundle, no Chrome, window on screen).
- `BROWSER=webkit node scripts/walk-full-ux.mjs`: 33/33 ok, no page errors.
- WebKit probe against the installed app's own server (:3517): Tab, ✕ size and dark tone as above.
