# Sliding arrow: sign-off (Eraser)

## Verdict: APPROVED

Checked commit: **5d302a4** (branch `studio/one-arrow-that-slides-out-with-the-chat-7c71f1dc`, Jony's build per `Reports/sliding-arrow-build.md`).

Goal: the user opens and closes Sketcher with one arrow, which moves only sideways.

## How I checked

- Ran the real server with `npm start` (PORT 3506, scratch home), with no stub page and no route faking. Went to `/new`, dropped 4 files, and the Left Side handle slid in.
- Wrote my own probe (`.scratch/eraser-arrow.cjs`, not committed). It runs in Chrome and WebKit at 1200×820 and 390×700, at 2× pixel density. It reads `getBoundingClientRect()` of `#handle`, the `.chev` SVG and the chevron `path`: closed, open, then closed again. It samples the handle's top on about 50 frames during both slides, tries Esc, counts the handles and lists every button in the panel.
- Looked at a cropped screenshot of each state with my own eyes, centred on the handle's line.
- `npm test`: **269 pass, 1 skipped, 0 fail**.
- `node checks/left-side-check.cjs` against the real server with only the CLI faked (`checks/mock-engine-server.mjs`): **ALL PASS**, steps 1–10, Chrome and WebKit.

## Measured (my probe, CSS px)

| Browser / size | State | handle top / bottom / cy | SVG top / bottom / cy | chevron path top / bottom / cy | handle left |
|---|---|---|---|---|---|
| Chrome 1200×820 | closed | 386 / 434 / 410 | 400 / 420 / 410 | 405.42 / 414.58 / 410 | 0 |
| | open | 386 / 434 / 410 | 400 / 420 / 410 | 405.42 / 414.58 / 410 | 440 |
| | closed again | 386 / 434 / 410 | 400 / 420 / 410 | 405.42 / 414.58 / 410 | 0 |
| WebKit 1200×820 | closed | 386 / 434 / 410 | 400 / 420 / 410 | 405.42 / 414.58 / 410 | 0 |
| | open | 386 / 434 / 410 | 400 / 420 / 410 | 405.42 / 414.58 / 410 | 440 |
| | closed again | 386 / 434 / 410 | 400 / 420 / 410 | 405.42 / 414.58 / 410 | 0 |
| Chrome 390×700 | closed | 326 / 374 / 350 | 340 / 360 / 350 | 345.42 / 354.58 / 350 | 0 |
| | open | 326 / 374 / 350 | 340 / 360 / 350 | 345.42 / 354.58 / 350 | 342 (right 390) |
| | closed again | 326 / 374 / 350 | 340 / 360 / 350 | 345.42 / 354.58 / 350 | 0 |
| WebKit 390×700 | closed | 326 / 374 / 350 | 340 / 360 / 350 | 345.42 / 354.58 / 350 | 0 |
| | open | 326 / 374 / 350 | 340 / 360 / 350 | 345.42 / 354.58 / 350 | 342 (right 390) |
| | closed again | 326 / 374 / 350 | 340 / 360 / 350 | 345.42 / 354.58 / 350 | 0 |

- During the slide, the handle's top stayed at 386 (desktop) or 326 (narrow) on every sampled frame, opening and closing.
- Inside the tab, the chevron path sits at x 17.71–22.29 both closed and open. The flip happens in place, so only the direction changes.
- The left-side check's pixel-ink reading agrees: ink centre Y is 24.0–24.17 in a 48px tab in every state, within ±0.5px.

## Step count (the closing path)

1. Click (or tap, Enter, Space) the arrow: open. **Keep**
2. Click the same arrow, now at the panel's edge: close. **Keep**
- Esc closes too. It's the expected keyboard path, not a second control. **Keep**

Total: 2 steps for open and close, with one control. `#handle` count is 1. The only button in the panel is Create, which appears only on the ready flag. There's no close button. (The "Close" in `#sheet` belongs to the system-prompt/knowledge dialog, not to Sketcher.) Target 2, actual 2.

## What I saw

- Desktop, both browsers: the closed › and the open ‹ sit on the same line. The tab is the same size, only the side differs, and closed again looks just like closed (no label, no focus look after a mouse close).
- Narrow: the open ‹ sits fully on screen at the right edge (342–390), on the same line as the closed ›.

## Watch later (outside this item, not blocking)

- Narrow, closed: the 48px tab overlaps the start of the menu's "nothing yet · drag files here" hint (x 43–48). Jony noted this too. It's for Columbo to schedule.
- The macOS app bundles its own copy of `src`. I checked the browser builds from the real server, not the installed .app window. Start (`npm run start:app`) rebuilds the app from this same code.
