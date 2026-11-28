# PLUS-FIREFLY · 03 · Build notes (Jony)

Built Merlin's spec (`02-merlin-motion.md`) as written. The public interface did not change:
`gatherToRing(rootEl, plusEl)` still resolves `{ epoch }`, and `isGathering()` still returns a boolean.

## User goal
Press + and feel that *the thing I pressed* answered. The + is the first light; it becomes one
of the ring's fireflies. There's one moment and nothing extra.

## What changed

**`src/server/public/firefly-gather.js`**
- `plusGlyph()` reads the + once at the press: its box centre (the start point), its `svg`, the
  glyph scale (svg width / 18), the starting colour (`getComputedStyle(plusEl).color`) and `--fly`
  (falls back to `#D8F26A`). If there's no box, the centre is off screen or there's no svg, it returns
  `null` and the run is the same as before.
- `planFlights(..., { plus: true })` adds **one** normal fly with `plus: true` at the + centre:
  `spawn 0, leave .20 D, arrive .70 D, size 19, own`. It takes the ring slot whose mid position
  is nearest the +, and the greedy pass skips that slot. The + fly always uses the `FLY` sprite.
- Near-empty home: slots that no page point reached are now lit at `spawn .20 D` (they were at 0),
  so nothing else glows at the + while it folds.
- `drawFly` draws the existing path. Only during `t < .14 D` does `foldPlus()` draw the two shrinking
  strokes over the sprite: arms 6 px → 0 (`easeInOut`), colour → `--fly` by `.06 D`, alpha 1 → 0
  over `.08–.14 D`, `source-over`, then back to `lighter`. There is no second loop, no CSS keyframes
  and no Web Animation on the glyph.
- The real glyph is set to `opacity: 0` **inside the first `draw` callback**, after the canvas
  painted its copy. A cancel is pushed to `leftFaded`, so `restoreHome()` brings it back.
- The tile fades with the page: `fadeOut(plusEl, .28 D, .04 D)`, the same call as `#root`. The +
  is hidden by opacity only, so a second click still reaches `#plus`.
- Reduced Motion: `fadeOut(plusEl, 160, 0)` runs next to the `#root` fade. There's no canvas and
  the glyph isn't touched separately.
- An error while folding the + marks only the + fly as dropped. The glyph stays and the run goes on.
- The header comment now says: "The plus itself folds into the first firefly and flies to the
  ring as one of the others."

**`src/server/public/agent-home.html`**: one line. A held ⌘N (`e.repeat`) still prevents the
default but no longer clicks +, so key repeat cannot skip the fold halfway through.

## Kept (unchanged)
D = 1000 ms, the `D + 250` timer, the `#root` fade, `epoch`, one run at a time (a second press goes
straight to `/new`), a resolve on any error, and the kept ring canvas.

## Tests (`firefly-gather.test.mjs`, 7 new)
1. The plan has exactly one `plus` fly at the + centre, in the nearest slot, with `arrive === 700`.
   That is strictly inside the others' window. There are still 30 own flies, one per slot.
2. Near-empty home: the flies at the + centre other than the + fly spawn at 200.
3. The glyph is still visible right after the call. It is hidden after the first frame, the tile
   fades 280 ms after a 40 ms delay, and the run still ends in 950–1300 ms.
4. `restoreHome()` brings the glyph back and cancels the tile fade.
5. If frames never come, the glyph is never hidden and the timer still ends the run within 1000–1500 ms.
6. Reduced Motion: no canvas, a 160 ms fade on `#plus`, the glyph untouched, restored afterwards.
7. A + with no box: no fade and no glyph change, and the run resolves as before.

`npm test`: 396 tests, 394 pass, 0 fail, 2 skipped (live). I ran `npm install` first because
`unpdf` was missing.

## One choice I made myself
Merlin says "no box: exactly today's run". I applied the near-empty `spawn .20 D` change in every
case, without checking for the plus box. On Start the + always has a box, so the difference can't be
seen, and it saves a branch.
