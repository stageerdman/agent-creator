# THE LEFT SIDE: the magic recipe (Merlin)

## Summary

There are three moments and nothing else. Each is built from code we
already have:

1. **Coming to sit.** Each processed file's firefly leaves the loose mess
   and flies into the agent's mark (`createDna`), which forms in the middle
   of the left field. The mark grows only by real processed share, only
   forward. When the last file arrives, all its lights flash together once,
   like real fireflies that have found their tree.
2. **The handle.** When the agent exists, a small arrow slides out of the
   left edge and blinks once, like a firefly. That is its only call for
   attention, and it can happen at most twice per agent. Its name is
   **Sketcher**, the creator AI's name that is already on the word list. No
   new word is needed.
3. **Talking to Sketcher.** A glass panel slides out from the edge (280 ms)
   and goes back (220 ms). If the mark changed while the panel was open, it
   flashes once when the glass leaves, to say "look, here's what changed".

Under Reduce Motion nothing travels. Progress shows as dots turning on in
the mark, the arrow just appears, and the panel appears in place.

## 1. The person and the true job

They just handed over private material, and they are a little tense. Their
eyes are on the right (the name, the menu). The left catches the side of the
eye. What they really want to know is not "how many files are done". It is
**"Is this turning into someone?"** (behaviours B1, B2, D2).

In our world (the **portrait studio**, the user as **witness**), that is
the sitting: a portrait starts as loose material, and the likeness appears
only as the real work is done.

## 2. Things in the world that do the same job

| # | Source | What maps | Verdict |
|---|---|---|---|
| 1 | **Synchronous fireflies** (Southeast Asia): scattered flies gather on one display tree and, once there, flash as one | loose flies → one place → shared flash = "whole" | **Kept.** It's real, it's fireflies, and the flash *is* the finish. |
| 2 | **A sitter coming to sit** for a portrait: fidgeting, then settling into the pose | mess = not yet sitting; gathered = in pose | **Kept** as the frame: our world already is the portrait studio. |
| 3 | **A photo developing in the tray**: the image only darkens, never fades back | forward-only, still-frame readable | **Kept as the Reduce Motion version** (dots turn on in place, nothing travels). |
| 4 | Starling murmuration forming shapes | mess → shape | Dropped. A flock reshapes all the time, which reads as mood, not progress. |
| 5 | Iron filings snapping to a magnet | gather | Dropped. A snap is the wrong feeling (D2: "sudden jumps" are a fear). |
| 6 | Sand mandala / mosaic laid tile by tile | forward-only building | Dropped. It needs a grid, and our mark is a living cluster. |
| 7 | Bees returning to the hive at dusk | homecoming | Dropped. Close to #1 but without the shared flash, and it needs a hive image. |

## 3. The world, in one language

- **Loose light** (the mess): files not yet processed. They wander
  (`wanderAt`), alive but going nowhere.
- **Coming to sit:** a file is processed, so its firefly flies to the mark
  and joins it.
- **The likeness:** the agent's `createDna` mark, the same one it gets on
  home and the agent page. Before anything is processed it is one dim,
  steady dot in the middle: the empty sitter's chair (`createDna` already
  draws this when there are no files).
- **Whole:** every file has come to sit, and the lights flash once together.
- **Waiting:** the mess keeps wandering, and nothing pretends to work.
- **Mistakes and removals:** "no magic on deletion" (world rule). A
  removed file's dot leaves the mark at once (what `createDna.setFiles`
  already does). Red removed flies stay in the field as today.
- **Coming back** (`/new?agent=…`): the likeness is already standing, lit
  at rest, with no replay (`createDna`'s "files there on a visit are lit at
  rest"). Nothing flashes a second time.
- **Sketcher:** the studio's creator, the one you talk to behind the handle.

## 4. The moments

### ★1 Coming to sit (the mess gathers into the likeness)

**Behaviours:** B1, B2, B8, B10, B11, B12; watch-outs W1, W8, W9; checks 1–5,
16, 17. **Journey:** UJ2 · 3–4.
**What the user feels:** "It's becoming someone. About half there." Then,
at the end, "That's mine."
**Weight:** light. Everything is existing code plus one small pure helper.
**Who builds it:** Jony (`src/server/public/left-side.js`).

#### Where the mark sits

- The field is `fw = max(160, innerWidth − MENU_W)` wide (as in
  `createField`). The mark is a square canvas centred in the field:
  **size L = clamp(0.4 × min(fw, innerHeight), 140, 240) css px**. At
  800 × 600 that is 168 px; at 1440 × 900 it is 240 px.
- It sits **under** the Sketcher panel, so closing the panel reveals it
  (fixed rule).
- It is drawn by **`createDna(canvas, { name, files })`** from
  `fireflies-dna.js`, with `draw(t, dt, reduced)` called every frame. The
  mark's canvas lies above the field canvas, with `pointer-events: none`.
  **Do not** wire `notice()` to hover or focus here. The mark is not a
  control (check 17).

#### How progress maps to how much has gathered

Use one pure helper in `left-side.js`, called something like
`gatheredFiles(files, opts)`:

```
live      = files whose state != 'removed'          (A1: the share's base)
sorted    = live sorted by addedAt (the same order createDna uses: timeOf, then list order)
processed = count of live with state === 'processed'
share s   = processed / live.length                 (0 if no files)
P         = min(PLACED, Σ dotsFor(sizeBytes))       (the final mark's placed dots, ≤ 60)
want      = s === 0 ? 0 : ceil(s × P)               (dots the mark should show)
k(s)      = s === 1 ? live.length
          : the smallest prefix length of `sorted` whose Σ dotsFor ≥ want
shown     = max(shownBefore, k(s))                  (forward only)
            — reset to k(s) only when a file was removed (the list got shorter)
logo.setFiles(sorted.slice(0, shown))
```

Why this works:
- **First step at once:** one processed file gives `want ≥ 1`, so one dot
  lands (D1, check 2).
- **Readable at 25 / 50 / 100 %:** about 15, 30, then 60 dots plus the
  extra glow (`glowLevel`) at whole. The growth is spread over the dots,
  not over the file count, so 200 tiny files don't fill the mark at 30 %
  (check 4).
- **The finished mark is the real identity:** at `s = 1` the prefix is
  every file in `createDna`'s own order, so slots, colours, beats and glow
  equal `createDna(canvas, { name, files: allFiles })` exactly (check 5).
- **Forward only:** `shown` never drops while files are only added or
  processed. New files have later `addedAt`, so they join the end of the
  order and never shuffle the prefix (W1, B11).
- **No fake progress:** nothing grows on a timer. `createDna`'s own queue
  (`STEP` 90 ms per dot, hurried for long queues) already spreads a big jump
  into a gathering, so there's no snap (W9, D2).

The mark's name (`makeLook(name)`) follows the agent's name. After a
rename, make a new `createDna` with the same prefix, all lit at rest. This
is what a visit does, so there is no replay.

#### The flight (the loose light coming to sit)

Each time the page learns of newly processed files (whatever DNA refresh
`createField.set(...)` already gets), do this:

| Step | Rule | Numbers |
|---|---|---|
| Pick the flyers | The newly processed files that are drawn in the field (in `fieldLayout`'s first `FIELD_CAP`) | at most **60 flyers per refresh** (= `PLACED`). The rest vanish from the field in the frame their flight batch starts. |
| Stagger | Flyers leave one after another, in `leaveOrder` order (left-most first) | gap = **clamp(8000 / q, 16, 90) ms**, where q is the flyers in this refresh. A batch is always in the air within 8 s. |
| From | Where the fly is wandering now: `wanderAt(id, t, area, false, wanderParams(id))` | tangent `tan` = normalised (`wanderAt` at t) − (`wanderAt` at t − 16 ms), so it leaves without stopping |
| To | The mark's centre plus a seeded offset: `s = spotOf('sit:' + id)`, point = centre + ((s.x − .5), (s.y − .5)) × 0.5 L | it lands inside the mark, never on one pinhead |
| Path | **`flightAt(from, tan, to, u)`** from `creation-screen.js` | `u = (t − leave) / FLY_MS`, **FLY_MS = 780 ms**, eased by `inOutQuad` inside `flightAt` |
| Light | First the **wake**: alpha rises from `dotLook('unprocessed').alpha` (.32) to `WAKE` (.8) over `WAKE_MS` (120 ms, `outQuad`). Then **`flyerAlpha(u, { start: WAKE, extra: true })`** | it melts into the mark as it arrives, the "merges like a drop" of the call |
| Look | The field's own dot: core r 1.8 px, halo r 5 px at alpha × .16 (as `createField.paint`) | no new sprite |
| The mark answers | **600 ms after the first flyer of the refresh leaves** (FLY_MS − 180), call `logo.setFiles(prefix)` with the new `shown` | `createDna` lands its dots from just outside in 300 ms, so the first dot appears as the first fly melts in |
| Field | A flown file is no longer drawn in the field. Removed (red) ones stay as today. | the mess visibly thins as the likeness fills |

Processed files that are **not drawn** (past `FIELD_CAP`) don't fly. They
only count in the share.

#### Whole (the shared flash)

- When `shown` reaches every live file **for the first time for this
  agent**, wait **1200 ms** after that `setFiles` (the last dots have
  landed), then call **`logo.notice()`** once. Every dot flashes together:
  rise 120 ms, fall 900 ms (`flash`).
- Remember it per agent: `localStorage['left.whole.' + agentId] = '1'`. It
  never plays again for that agent, not on reload, not after more files are
  added and processed. Later completions are silent.
- No sound, no text. The steady glow that `glowLevel` adds past 60 dots
  stays as the lasting sign of "whole".

#### Reduce Motion

- The mess: still dots at their home spots, via `wanderAt(…, reduced = true)`
  (already in `createField`).
- No flights. A newly processed file's field dot **disappears in the same
  frame** its refresh calls `logo.setFiles(prefix)`. Call it right away,
  without the 600 ms wait.
- The mark: `draw(t, dt, true)`. Each new dot just turns on, `STEP_REDUCED`
  (60 ms) apart, bright for 1200 ms, then rests at .75. There's no drift and
  no blink (all existing `createDna` behaviour).
- Whole: no flash (`notice(true)` already does nothing). The full mark is
  the statement.
- So two still screenshots at 25 % and 80 % look clearly different (D7,
  check 16).

### ★2 The handle (the arrow on the left)

**Behaviours:** B3, B6, B9; watch-out W3; checks 6–8. **Journey:** UJ2 · 3.
**What the user feels:** a small "aha, it pulls out", found within about
10 s, then never thought about again.
**Weight:** light (CSS plus one timer).
**Who builds it:** Jony.

- **Name:** it opens **Sketcher**, the creator AI's name already on the word
  list (FULL-UX `magic-merlin.md` §6). It is the same AI behind
  `POST /api/agents/:id/chat`, so it gets the same name. The `button` has
  `aria-label="Open Sketcher"` and `aria-expanded`. On hover or focus a small
  label **Sketcher** shows beside it (fade 120 ms; instant under Reduce
  Motion). There is no other text.
- **Look:** a tab 24 × 48 px glued to the left edge, right corners rounded
  8 px, with a "›" chevron in `FLY` (#D8F26A). At rest the chevron is at
  opacity .55. On hover or focus it goes to 1 and shifts 2 px right
  (120 ms, `outQuad`), with a visible focus ring. Its vertical centre is the
  mark's centre, so the door sits beside the likeness. It must never be
  less than 16 px from the window's top or bottom.
- **When it appears:** only once the agent exists (its first save, when
  there is something to talk to). Before that the left belongs to the ring
  and "Select Folder". It slides in from behind the edge, `translateX(−100%) → 0`,
  **400 ms, outQuad**, starting **900 ms after the signal** (`MENU_AT` 300
  plus the menu's slide). On a revisit (`/new?agent=…`) it is simply there.
- **The one blink** (the firefly's signal): when the slide ends, the
  chevron flashes once with **`flash(dt)`** from `fireflies-dna.js`
  (opacity .55 → 1 → .55; 120 ms rise, 900 ms fall). No pulse, no loop.
- **A second blink, only if the mess is waiting on the user:** if **25 s**
  pass with no processed file and Sketcher has never been opened, blink once
  more (D1, Q1: "a mess must lead somewhere"). Never more than **2 blinks
  per agent, ever** (`localStorage['left.hint.' + agentId]` holds the
  count), and **none after Sketcher was opened once**.
- **Reduce Motion:** no slide, it just appears. A blink becomes a plain step:
  opacity 1 for 1200 ms, then back to .55 with no ramp. That is light, not
  travel.
- **One way in:** this is the only control that opens Sketcher. There is no
  menu entry and no auto-open (Q6: no).

### ★3 Talking to Sketcher (the glass opens and closes)

**Behaviours:** B3, B4, B5, B7, B9, B14; watch-outs W2, W6, W7, W8; checks 9,
12–16. **Journey:** UJ2 · 3–4.
**What the user feels:** they step aside to talk to the creator, and the
likeness is still there behind the glass. When they come back, "oh, it
grew".
**Weight:** light. The only costly part is the blur; see the check below.
**Who builds it:** Jony.

- **Panel:** width **min(440 px, fw)**, full height, left edge merged with
  the window edge, right corners rounded 16 px. Glass is
  `backdrop-filter: blur(18px) saturate(1.2)` over
  `rgba(12, 14, 10, .64)`. Text must reach at least 4.5:1 contrast over the
  brightest fly behind it (W7). If the browser has no `backdrop-filter`,
  use `rgba(12, 14, 10, .92)` instead.
- **Open:** `translateX(−100%) → 0`, **280 ms**,
  `cubic-bezier(.2, .8, .2, 1)` (a quick start and a soft landing, the same
  feel as a fly settling). Focus goes to the message box when the slide
  starts, so typing never waits for the motion.
- **Close:** the back arrow "‹" at the top of the panel
  (`aria-label="Close Sketcher"`), with Esc as its key. It runs
  `0 → translateX(−100%)`, **220 ms**, `cubic-bezier(.4, 0, 1, 1)`. Focus
  goes back to the handle. Esc is handled by the panel first and never
  reaches the page's "go home" (W2).
- **The panel's words:** title **Sketcher**. While it answers, show the
  existing **Sketching…**. The input placeholder is **Tell Sketcher what
  [Name] is for**. When it's ready, it proposes **Create** (the user's
  word). Asking more is just typing, with no extra button.
- **The look-back flash:** if the mark landed any new dot while the panel
  was open, call **`logo.notice()`** once when the close slide ends ("here's
  what changed"). If nothing changed, nothing happens, so the 100th close is
  silent. It never happens under Reduce Motion (`notice(true)` already does
  nothing).
- **The field keeps living behind the glass.** Flights and the mark go on
  as normal. Never hold progress back for the close.
- **Reduce Motion:** the panel appears and disappears in place (0 ms, no
  fade) and focus moves the same way.

## 5. The 18 small ideas I considered, and the cut

| Idea | Kept? | Why |
|---|---|---|
| Processed flies fly into the mark (`flightAt`) | ✅ | It is the gathering itself, and it's honest. |
| Mark grows by dots, not by file count | ✅ | Readable at 25/50/100 % even with 200 tiny files. |
| The empty chair: one dim dot before anything is processed | ✅ | Free (`createDna` with no files). It tells the eye where the likeness will be, without faking progress. |
| The mess thins as flies leave | ✅ | Free, and it doubles the progress signal. |
| Shared flash at whole, once per agent | ✅ | True firefly behaviour, and it's `notice()`. |
| Arrow blinks once like a firefly | ✅ | The world's own signal, with no pulse loop. |
| A second blink only if waiting on the user | ✅ | Solves "the mess leads nowhere" without text. |
| Look-back flash on close, only if changed | ✅ | It shows what the chat did (W4) and is silent when nothing changed. |
| Reuse **Sketcher** as the name | ✅ | No new word, same AI, same name. |
| A firefly flies over and perches on the arrow | ❌ | Charming once, but it's a new behaviour and a second call for attention beside the wander. |
| A "talk to me" bubble by the arrow | ❌ | A second voice, clutter, and it nags. |
| Mess slowly drifts toward the centre as share grows | ❌ | It changes `wanderAt` and looks like progress without any real file. |
| A heartbeat pulse on the mark while processing | ❌ | It looks busy even when nothing happens (W9). |
| Light trails behind flights | ❌ | Heavy at 60 flights and noisy, with no added meaning. |
| Dots drifting back out on removal | ❌ | "No magic on deletion", and it would read as "work lost" (W1). Eraser judges the plain removal (Q5). |
| Refraction or ripple in the glass | ❌ | Heavy, and it hurts reading (W7). |
| A soft chime at whole | ❌ | The app has no sound (FULL-UX §8), and the user often isn't watching. |
| Auto-open Sketcher on first visit | ❌ | A second way in, and it covers the gathering they came to see (Q6). |
| Other names: "Easel", "Painter", "Studio" | ❌ | Sketcher already names this AI. Two names for one thing breaks the word rule. |

## 6. Backup worlds (one line each)

- **The developing print:** no flights at all. Mark dots turn on in place
  as files are processed (this is exactly our Reduce Motion path). Use it
  for everyone if the flights cost too much at 3,000 drawn flies.
- **The display tree, without flights:** mess flies near the mark slowly
  brighten as share grows, and at whole the mark flashes. It's softer, but
  progress is harder to read in still frames, so it's a second backup only.

## 7. Handover: checks Jony's tests must prove

Unit (`left-side.test.mjs`, pure helper `gatheredFiles`):
1. Share 0 gives 0 files. One processed file gives at least 1. All processed
   gives every live file.
2. As files go from unprocessed to processed one by one, `shown` never goes
   down.
3. Adding unprocessed files never lowers `shown`. Removing a file may lower
   it.
4. At share 1, `createDna(prefix).info()` equals `createDna(all).info()`
   (placed, glow, dots' colours).
5. With 200 files of 100 KB each, the placed dots at 25 / 50 / 100 % are
   15 / 30 / 60 (± 1).
6. Flight gap is `clamp(8000 / q, 16, 90)`. With 60 flyers, the last one
   leaves within 8000 ms. There are never more than 60 flyers per refresh.
7. `setFiles` is called 600 ms after the first flyer leaves, and at once
   under Reduce Motion.
8. The whole flash fires once per agent (the storage key) and never on a
   visit that starts already whole.
9. Handle blinks: at most 2 per agent, none after the first open, the second
   only after 25 s with 0 processed.
10. The look-back `notice()` fires only if the mark changed while the panel
    was open.
11. Under Reduce Motion: no flyers, field dots at `spotOf` home spots, the
    panel and handle have 0 ms transitions.

Browser (`checks/left-side-check.cjs`, pixels, not only state):
12. Screenshots of the mark's rect at 25 / 50 / 100 %: the count of bright
    blobs strictly increases, and the 100 % shot matches a fresh `createDna`
    of all files drawn reduced (pixel diff under 2 %).
13. Smooth frames (p95 under 20 ms) with 3,000 drawn flies and 60 flyers in
    the air, **also with the glass panel open** (the blur is the cost).
14. Reduce Motion: two frames 500 ms apart with no processing are identical,
    and the panel opens with no in-between frame.

## Sources

- `Reports/left-side-behaviours.md` (behaviours, watch-outs, checks, open
  questions Q1–Q6)
- `updates/2026-11-27 LEFT-SIDE - OPEN/update v1.md` (fixed rules, phases)
- `src/server/public/fireflies-dna.js` (`createDna`, `draw`, `setFiles`,
  `notice`, `flash`, `dotsFor`, `timeOf`, `PLACED`, `STEP_REDUCED`,
  `glowLevel`)
- `src/server/public/creation-screen.js` (`wanderAt`, `wanderParams`,
  `spotOf`, `fieldLayout`, `dotLook`, `flightAt`, `flyerAlpha`,
  `leaveOrder`, `FLY_MS`, `MENU_AT`, `MENU_W`, `FIELD_CAP`, `createField`)
- `src/server/public/firefly-orbit.js` (`FLY`, `WAKE`, `WAKE_MS`, `outQuad`,
  `inOutQuad`); `firefly-gather.js` (the merge-like-a-drop end of a flight,
  as a feel reference)
- `principles/magic-ux/design-rules.md`, `world-and-words.md`;
  `updates/2026-11-25 FULL-UX - OPEN/magic-merlin.md` §6 (Sketcher,
  Sketching…) and §8 (motion rules)
- Synchronous fireflies (Pteroptyx) gathering on display trees and flashing
  together: a well-known natural pattern, used here for its feeling only.
