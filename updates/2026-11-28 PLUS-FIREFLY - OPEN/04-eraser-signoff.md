# PLUS-FIREFLY · 04 · Sign-off (Eraser)

Reviewed: Jony's commit `03d3471` (`firefly-gather.js`, `firefly-gather.test.mjs`, one line in
`agent-home.html`), checked against `02-merlin-motion.md` and `03-jony-build.md`.

## User goal
Press + on Start and get to /new, feeling that the thing I pressed answered.

## Step count
| # | Step | Before | After | Mark |
|---|------|--------|-------|------|
| 1 | Press + (or ⌘N) | yes | yes | Keep |
| 2 | Wait for the gather (D = 1000 ms) | yes | yes, the same 1000 ms | Keep (a second press skips it) |
| – | Anything new to read, choose or wait for | – | none | – |

**Step Count: 1 press, ≤ 1 s wait. Before: the same.** The change adds meaning to the step and adds
no new step.

## The five checks
1. **One clear moment, nothing extra.** There's exactly one `plus` fly (`planFlights`, `plus: true`).
   It folds in 0–140 ms (`foldPlus`, only while `t < .14 D`), holds until 200 ms and lands at 700 ms,
   in the middle of the others, so it's neither first nor last. There's no ring pulse, no halo and no
   extra sound. Fill-in flies for a near-empty home now wait until 200 ms, so nothing else lights up
   at the + while it folds. ✔
2. **One animation path, no leftovers.** The fold is drawn inside the existing `drawFly` on the same
   canvas and in the same rAF loop. There are no CSS keyframes and no Web Animation on the glyph.
   The old "Nothing goes into the plus, and the plus does not glow" comment is gone, and the header
   now describes the new rule. Every new helper is used (`parseColor`, `plusGlyph`, `FLY_RGB`,
   `foldPlus`). The older test "never into the plus" is still true: it checks where flies *land*
   (on the ring, not back at the +), and that still holds. ✔
3. **No slower to /new.** D is still 1000 ms, the `D + 250` safety timer is unchanged and the + fly
   lands at 700 ms, before D. The new work at the press is two `getComputedStyle` reads and one
   `getBoundingClientRect`. A test checks that the run still ends in 950–1300 ms. ✔
4. **Reduced Motion and a second press.** Under Reduced Motion, `#plus` fades with `#root` in the
   same 160 ms. There's no canvas, the glyph is left alone and the end time is the same. On a second
   press, `isGathering()` sends you straight to `/new`. The glyph and tile are hidden by opacity only,
   so the second click still reaches `#plus`. A held ⌘N now counts as one press (`e.repeat`), so key
   repeat can't skip the fold. ✔
5. **The + comes back on back/forward.** The glyph's opacity reset and the tile fade both go into
   `leftFaded`, and `pageshow` (persisted) calls `restoreHome()`, which cancels them. A test covers
   this, including under Reduced Motion. ✔

## Tests
`npm install` (`unpdf` was missing in this checkout), then `npm test`: **396 tests, 394 pass,
0 fail, 2 skipped (live).**

## Watch later (not blocking)
- If `foldPlus` ever throws *after* the first frame, the + fly is dropped while the glyph is already
  hidden. The tile is fading anyway, and at D the ring draws all 30 slots itself, so the user sees
  nothing wrong. Keep it in mind if the fold ever gets more complex.
- If the + ever moves away from the bottom-right corner, check again that the nearest slot still
  gives the + fly a travel time close to the others' (~500 ms).

## Verdict
**APPROVED.** 1 press, ≤ 1 s, the same as before. There's one moment, one path and nothing extra.

Signed — Eraser, 2026-11-28
