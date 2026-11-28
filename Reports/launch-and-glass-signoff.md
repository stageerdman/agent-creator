# LAUNCH-GLASS sign-off (Eraser)

**Verdict: NOT YET CHECKED. There is no build to check.**

Checked 2026-11-28 on the team branch `studio/one-shared-background-style-no-flicking-0646e459` at `d99e6c0`. The only commit there is Columbo's research note. No build work has landed:
- Jony has no task for it.
- The build part of task 0646e459 has no owner. Pixel says it sits with Columbo, who can build it or hand it over.
- Uncle Bob's Rust step 1b09aa93 (side quest ac53ab60) is queued at 0%.

## Baseline (before): every background source still present

| # | Where | Still there |
|---|-------|-------------|
| 1 | `src-tauri/src/main.rs:75` `.transparent(true)`, `:80` `.effects(glass())`, `:82` `window.show()` before paint | yes |
| 2 | `src-tauri/src/main.rs:74,93-96` `GLASS_PAGE` JS adds `html.glass` after load | yes |
| 3 | `src-tauri/tauri.conf.json:12` `macOSPrivateApi: true` | yes |
| 4 | `agent-page.html:14,16` own `html` background + `html.glass` | yes |
| 5 | `agent-home.html:20,22` own `html` background + `html.glass` | yes |
| 6 | `new-agent.html:16,18` own `html`/`body` background | yes |
| 7 | `src/server/public/app-background.css` | missing |
| 8 | tests/checks that still use `html.glass`: `app.test.mjs:76-91`, `checks/left-side-check.cjs:280-288` | will need updating |

## What I'll check when the hash arrives

1. A search finds no `html`/`body` background rule outside `app-background.css`. Gone: `html.glass`, `GLASS_PAGE`, `.transparent(true)`, `.effects(glass())`. No JS touches the background after load.
2. `backdrop-filter` appears only on `#sketcher`. The look-alikes (`#menu`, `#sheet::backdrop`, Talk box, home row hover) have nothing see-through behind them.
3. The native window colour is `#0B1410`, the same as the page's first paint.
4. `npm test` has 0 failures.
5. Start rebuilds the app and installs it into Applications. Then 3 cold opens, watched from the first frame, switching home → agent page → /new → back: the background never changes.
6. The Sketcher chat over a busy /new: the page shows through, the blur is soft, there's a light edge, and the text meets AA at the brightest dot (including the dim "Sketching…" line and lime links). Reduce Transparency stays near-solid. The three earlier fixes still hold: each message has its own glass, there's no shine behind Create, and the send dot lands in the new message.
