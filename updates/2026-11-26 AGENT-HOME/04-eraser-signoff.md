# AGENT-HOME 04: Eraser sign-off

Checked: Jony's build at 51cad32 + 981dca6, in WebKit (Playwright, headless,
1280×820 and 800×600). My check script: `checks/check-eraser.mjs`.

## Verdict: RETURNED (round 1): 2 fixes for Jony, then I re-check

The home is lean. Both problems are breakages, not clutter. Nothing the user
asked for gets cut.

## User goal

Open the app, see every agent, find one by typing, open it or start a new one.

## Step count (most common paths)

| Path | Steps | Verdict |
|---|---|---|
| Open an agent | 1 click on its row (the list is already there) | Keep, but it is **broken**, see fix 1 |
| Find, then open an agent | type (search is already focused, filters on every letter) → 1 click | Keep. Already at the minimum: no click into the field, no Enter |
| New agent | 1 click on the plus → `/new` (480 ms) | Keep. A second press should skip the motion, but it **doesn't**, see fix 2 |
| Clear the search | Backspace, or WebKit's own clear-x (1 tap) | Keep. This is the platform's default, not something we added |

Target reached: 1 step per path. No path has a step to cut.

## The five checks

1. **Only the user's three parts: PASS.** The only controls are the rows,
   `#q` and `#plus`. There are 0 headers or footers, and no visible text
   outside the rows (the placeholder "Search" and the muted state line are
   the only words). Order is newest first. Each row has a name plus a short
   description on one line (50 px tall).
2. **No second way, no extras: PASS.** The plus is the only way to create.
   There is no count, no sort and no CTA. Only one note: WebKit draws its own
   clear-x inside `type="search"` when text is typed. I **keep** it: it is the
   platform convention and saves steps. Jony's build note ("no clear button")
   should say that only the browser's own one appears (fix 3, wording only).
3. **Fireflies look and movement: PASS.** `glade-fireflies.html` has the same
   blob hash at HEAD as at 45b0590, the restore I signed:
   `645922246274e3c5c695c59163e15824935d9245`. `git log` shows nothing has
   touched it since b309ffd. In `agent-home.html`, the colours, background
   gradient, sprite, `flash()` (120 ms up, 900 ms down), beat jitter
   (`seedA*4`), 1.5 px drift over 8 s, alpha `.1+.8b`, size `18+12b`,
   `slot()`/`radius()` and `notice()` with its 700 ms limit are all the same
   as the original's ready ("joined") fireflies.
4. **Plus transition to a blank `/new`: PASS, with one exception (fix 2).**
   Mid-call, the plus lights, the canvas dims (.47 at 200 ms on its way to
   .35) and the list fades. `/new` loads at 543 ms from the click. `/new` has
   no text and no controls, and the html background is `rgb(11,20,16)`, so
   there is no white flash. Esc skips (90 ms). Enter on the plus plays the
   call. ⌘-click opens a new tab with no motion. Back restores the home
   exactly (no classes, opacity 1 everywhere, rows back). With reduced
   motion it navigates in 62 ms and sets no flag. Filtering runs no
   animation.
5. **0 / 1 / 10 / 50 agents, long names, live search: PASS.** With 0 there
   is "No agents yet" and no overflow. With 50 at 1280×820 and 800×600, the
   page has no scroll, the list scrolls inside its column above the search,
   the plus stays inside the window, and every row is one line. Names of 200
   characters with and without spaces end in "…". Search: m → ma → mar gives
   2, 2, 1. Upper case matches. "marx" shows the calm no-match line, and
   Backspace brings the whole list back in the same order. No page errors.

## Fix list for Jony (round 1)

1. **A row click lands on raw JSON.** Clicking any row goes to
   `/agents/<id>`, which has no route. WebKit then shows
   `{"error":"Not found."}` on a transparent (white) page. The roadmap says
   "clicking a row opens that agent". Whatever page that becomes later, the
   one step the user takes most must not end on a broken page. Smallest
   fix: serve `/agents/:id` from a page on the same Fireflies background, as
   blank as `/new`, until Columbo wires the agent page. Don't add a new
   design here. If Columbo prefers to point rows at an existing agent view,
   that works too, as long as the click lands on a real page.
2. **A second press doesn't skip.** `body.leaving { pointer-events: none }`
   also blocks the plus. A real second click during the 480 ms hits `<html>`,
   so it waits the full 480 ms (measured: 536 ms). Merlin's spec and the
   code's own comment say a second press skips. Fix: let the plus keep
   receiving pointer events while leaving, for example
   `body.leaving .plus { pointer-events: auto; }`.
3. *(wording)* `03-jony-build.md`, "No … clear button": add that WebKit
   shows its own clear-x in the search field, and that it stays.

When these are done, I re-run `checks/check-eraser.mjs` and Jony's
`checks/check-agent-home.mjs`, check that Start opens the new home, and
sign below.

## Sign-off

Round 1 fixes landed at integration (Columbo, since Jony's fix branch never
moved past 59b7d34):

1. `GET /agents/:id` now serves `agent-page.html`: blank, on the same
   Fireflies background (`rgb(11,20,16)`), no new design. Test added in
   `app.test.mjs`.
2. `body.leaving .plus { pointer-events: auto; }`: a second press skips
   (measured 87 ms).
3. `03-jony-build.md` now says WebKit's own clear-x appears and stays.

Re-run in WebKit: `checks/check-eraser.mjs` all ok (23/23) and
`checks/check-agent-home.mjs` all ok (31/31); `npm test` 125 pass, 1 skip.
Nothing the user asked for was cut. **APPROVED.**
