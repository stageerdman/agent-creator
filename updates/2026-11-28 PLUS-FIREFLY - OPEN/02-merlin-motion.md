# PLUS-FIREFLY · 02 · Motion spec: the + becomes a firefly (Merlin)

Journey: UJ1 · step 1 (start a new agent from Start).
Builds on: `01-columbo-report.md` (its 8 limits are kept, see the checklist at the end).
For: Jony (`src/server/public/firefly-gather.js`, its test, and the `#plus` bits of `agent-home.html`).

## The moment in one line

The + **folds in on itself into one lime dot**, holds a breath where it
was, then **flies off as one of the others** and takes a slot in the ring.
Nothing else: no burst, ripple, trail, glow ring or sound.

What it means: *the thing you pressed was the first light to answer.*
What the user feels: "it heard me", then "my click became part of the ring".

## Why a fold (and not a shrink or a pop)

I tried five readings of "+ turns into a light": a seed closing, a star
collapsing, a candle wick catching, a cross-stitch pulled tight, a firefly
folding its wings before it lifts. The last one wins and it is also the
lightest to build: **the four arms of the + draw back into the centre while
the dot lights there**. The eye sees the arms *go into* the dot, so the dot
reads as the + itself, not as something that replaced it. A uniform shrink
reads as "it got smaller and went away"; a pop reads as a show.

## Timeline (D = 1000 ms; all times are fractions of D so `durationMs` still scales)

```
t (ms)   0        140   200                    700           1000      1250
         |---fold--|hold|--------- flight -------|-- on ring ---|          |
 + glyph ████▓▓▒▒░░                                   (hidden from frame 1)
 + tile  ░░░░░░░░░░░░░░░░ fades with the page (40 → 320 ms, same as #root)
 dot       ·•●●●●●●●  lifts → bends → swirls in → becomes the ring's own dot
 others   (spawn 30–250, leave 100–320, arrive 560–860 — unchanged)
 /new                                                         ^ D (unchanged)   ^ timer (unchanged)
```

| Phase | Time | What happens | Easing |
|---|---|---|---|
| **Frame 1** | t = 0 (the first `draw`) | Canvas paints the + glyph exactly where the real one was. In **the same callback**, the real glyph (`#plus svg`) is set to `opacity: 0`. Never a frame with neither, never a frame with both visibly different. | – |
| **Fold** | 0 → 140 ms (`.14 D`) | Each arm's length (from centre) goes 6 px → 0. Stroke width stays 1.6 px, round caps (so at the end it is a 1.6 px dot, no blink). Stroke colour goes from the glyph's colour at the press to `--fly` in the first 60 ms (it is already `--fly` if the mouse was on it; after ⌘N it was `--quiet`). Glyph alpha 1 → 0 over 80 → 140 ms. | arms: `easeInOut` (the module's own) |
| **Light** | 0 → 120 ms, overlapping the fold | The FLY sprite grows in the centre with the **same flash every fly uses**: `flash(t - spawn)` with `spawn = 0`. So by 120 ms it is at full light, as the arms finish going in. | the existing `flash()` |
| **Hold** | 140 → 200 ms (`leave = .20 D`) | The dot stays at the + centre with the same "breath of lift" every fly has before leaving (`y -= (t - spawn) * .012`, ≈ 2 px). The eye is still here (Columbo D1: the first ~200 ms). | existing |
| **Flight** | 200 → 700 ms (`arrive = .70 D`) | The normal path: the same quadratic bend, the same wobble, the same `inOutQuad` progress, the same glow-to-ring-dot turn over the second half (`own` fly). 500 ms of travel, which matches the others (they travel ~460–540 ms). | existing `drawFly` |
| **On the ring** | 700 → D and beyond | It rides its slot like any `own` fly; at D the run resolves as today and the kept canvas draws the ring until the page goes. | existing |

**Arrival at `.70 D` is on purpose:** the others arrive between `.56 D`
(nearest the +) and `.86 D` (furthest). `.70` is the middle of that window,
so it is never first and never last, and it is the time the code already
uses for the "lit from the plus" slot flies.

**Total time:** unchanged. `D`, the `D + 250` timer, the `#root` fade and
the `epoch` all stay exactly as they are. The + work ends at `.70 D`, well
inside the second.

## Which slot it joins

- Before the greedy "each slot takes the nearest point" pass in
  `planFlights`, **reserve for the + fly the slot whose mid position
  (`mid[s]`, the one already computed) is nearest the + centre**. It is
  that slot's `own` fly. The page point that would have won that slot is
  now an ordinary merging fly (it still flies to its nearest slot).
- Why the nearest: its path is then the short, gentle one, the same kind of
  path the page flies beside it take, so it moves *with* its neighbours and
  is not the odd one crossing the screen.
- Sprite: always `FLY` (never `WARM`); size `19` (the middle of the 16–22
  range). Same `flash`, same alpha rule. It is not brighter or bigger.

### Near-empty home (slots no page point reached)

Today those slots are lit by flies born at the + centre at `spawn: 0`,
which makes the + glow in a cluster on the first frame and drowns the fold.
Change only their `spawn` to `.20 D` (when the + fly lifts; `leave` becomes
`spawn + .07 D`, `arrive` stays `.70 D`). Reading: the + folds alone, then
as it lifts the rest of the ring's light follows it out. No other change.

## Data shape (so it stays one path, not two)

The + fly is a normal entry in `flies`, made in `planFlights` when it gets a
`plus` box:

```js
{ id, x0: px, y0: py, spawn: 0, leave: .20 * D, arrive: .70 * D,
  wob: rand() * 6.283, size: 19, slot: <reserved>, own: true, plus: true }
```

The only extra drawing is in `drawFly`: `if (f.plus && t < .14 * D)` draw
the shrinking + strokes on top of the sprite (two `ctx` line strokes, with
`source-over` so the strokes are flat colour, not added light; restore
`lighter` after). Everything after 140 ms is the existing code. No second
animation loop, no CSS keyframes on the +, no Web Animation on the glyph.

Pass the glyph's starting colour in (read once at the start:
`getComputedStyle(plusEl).color`), and `--fly` from
`getComputedStyle(document.documentElement).getPropertyValue('--fly')`,
falling back to `#D8F26A`.

## The real + (what the DOM does)

- **The glyph** (`#plus svg`): `opacity: 0` set in the first `draw` callback
  (not at the click, not before the canvas paints). Put a cancel for it in
  `leftFaded` so `restoreHome()` brings it back.
- **The tile** (`#plus` itself, its soft background and any focus ring):
  fades with the page: `fadeOut(plusEl, D * .28, D * .04)`, the same call
  as `#root`. So for the first 40 ms the dot sits in its own tile, then the
  tile dissolves with everything else. It is in `leftFaded`, so it is
  restored too.
- **Hidden by opacity only.** No `display: none`, no `visibility: hidden`,
  no `pointer-events: none`: the + stays in place and clickable, so a second
  mouse click still reaches `#plus` and skips to /new (Columbo D4). The
  screen reader keeps "New agent" (W6).
- **No box** (`width` and `height` 0, or the centre is off screen): no +
  fly, no glyph hiding, the run is exactly today's. Navigation never waits
  on it.
- **An error in the + part** (no 2D context, a bad colour string): drop the
  + fly, leave the glyph visible, carry on. Never `finish(false)` because of
  the +.

## Reduced Motion

No canvas, no fold, no flight, no dot. **The whole `#plus` fades with
`#root`**: `fadeOut(plusEl, 160, 0)` next to the existing
`fadeOut(rootEl, 160, 0)`, same easing, same start, so it goes *with* the
page, not before it. Restored by `restoreHome()` like the rest.

## Second press, held key, Back

- **Second press:** unchanged (`isGathering()` → `/new` at once). It never
  starts a second run, never draws a second + fly, never brings the glyph
  back.
- **Held ⌘N (key repeat):** recommend `if (e.repeat) return;` as the first
  line of the keydown handler in `agent-home.html`. A held key is the same
  press, so it must not skip the fold half way (Columbo D3/W4). One line.
- **Back / forward cache:** `restoreHome()` cancels everything in
  `leftFaded`: the glyph's opacity, the tile's fade and `#root`'s fade.
  The + is back, visible, clickable and reachable by Tab, in its resting
  colour (or hover if the mouse is on it).

## What the test should prove (for Jony)

1. After the first frame, `#plus svg` has opacity 0 **and** the plan
   contains exactly one fly with `plus: true` at the + centre.
2. Before the first frame (the click itself) the glyph is still visible.
3. The + fly's `arrive` is inside the others' arrival window and not its
   minimum or maximum; with `D = 1000`, `arrive === 700`.
4. The run still resolves by `D` (frames) or `D + 250` (timer), same as
   before.
5. `restoreHome()` brings the glyph and tile back to full opacity.
6. Reduced Motion: no canvas, `#plus` gets the 160 ms fade, glyph is not
   touched separately.
7. A + with no box: no `plus` fly, glyph untouched, run resolves normally.

## Cut ideas (and why)

| Idea | Why cut |
|---|---|
| A tiny squash on press (the + dips 0.9× before folding) | Adds a beat before the answer; the fold *is* the press feedback. |
| The + spins a quarter turn as it folds (×) | Pretty, but it reads as "close / cancel". Wrong meaning on a "new" button. |
| A soft ring pulse where the + was | A glow ring. Columbo's limit 4; makes it special. |
| The + fly arrives first and the ring forms around it | Makes it a leader; people wait to see what it does (D2). |
| A faint trail behind the + fly | A trail = the odd one. The eye sticks on it. |
| A small chime on the fold | No sound in this moment: it happens on every new agent, and the gather has none. |
| The search text letters fold the same way | A second idea in the same second. One moment only. |
| Morphing the real SVG with CSS before handing to the canvas | Two animation paths and a hand-off frame where they could disagree. The canvas does it all. |

## Columbo's limits, checked

1. Total time the same: yes, + work ends at `.70 D`; D and the timer unchanged.
2. Answers at once: the fold starts in the first frame (≤ 16 ms after the press).
3. No blank: glyph hides in the same callback that first paints its canvas copy.
4. One of the others: same sprite, flash, size range, path and ring-dot turn; arrives mid-window; no extras.
5. Second press = go now; held key ignored (recommended one-liner).
6. Reduced Motion: plain 160 ms fade with the page.
7. Never blocks: no box or an error drops only the + fly.
8. Back brings the + back via `restoreHome()`.

## Hand-off

- **Jony:** build all of the above in `firefly-gather.js` (+ the test, + the
  keydown one-liner if you take it). Update the header comment: replace
  "Nothing goes into the plus, and the plus does not glow" with "The plus
  itself folds into the first firefly and flies to the ring as one of the
  others."
- **Eraser:** check it stays one moment: the fold is the only new thing you
  can see.
