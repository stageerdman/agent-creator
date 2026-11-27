# ONE FLOW: how + to first file should feel (Merlin)

Builds on `Reports/one-flow-plus-to-chaos-behaviours.md` (Columbo, B1 to
B14, W1 to W10, Q1 to Q5) and `Reports/creation-screen-magic-moments.md`.
It reuses what is already shipped: the 30 seeded orbit fireflies
(`makeFlies()`), the DNA sprite and colour `#D8F26A`, the curves
`outQuad`, `inQuad` and `inOutQuad`, `clampR` (`MIN_R` to `MAX_R`), the
field's seeded spots (`spotOf`, `fieldLayout`), `FADE_IN` (300 ms), the
slow drift and dim shine (fix 2), and the menu's existing 420 ms slide-in.

**No new button, label, word or step.** The only on-screen word in this
moment is the existing `Select Folder`.

## 1. The person and the true job

They arrive with a small decision made ("I'll make one for my course"),
often with Finder already open. The job is *"take my material, start my
agent, and show me you took it"*. The fireflies only earn their place if
they answer two silent questions: **where do I put it?** and **did you
take it?**

The hidden truth: a waiting ring and a loading spinner look the same.
What tells them apart is **rhythm**. A spinner speeds up or changes on its
own; a waiting thing stays slow, even and patient, and changes **only when
you give it something**. So the whole moment is built on one contrast:

> **Before your gift nothing changes. Your gift changes everything at once.**

## 2. Where else this job is done (and the test)

| # | Source | What maps | Verdict |
|---|---|---|---|
| 1 | **Fireflies leaving a tree at dusk for the meadow.** In the evening they gather in a tree, blinking slowly; at some signal they drift out low over the grass and spread. | ring = gathered in the tree; gift = the signal; left-side cloud = spread over the grass, each one a file | **Kept (main).** It is the app's own world, needs no words, and the "same ones go out" truth is exactly W2 and rule 4. |
| 2 | **Bees leaving the hive to forage.** They circle the entrance, then fly out in lines toward the flowers. | ring = circling the hive; flying out = going to work on your files | Backup A. Strong "going to work", but lines of bees read busy, and it adds a second creature. |
| 3 | **Blowing a dandelion.** The clock holds still until your breath, then every seed lets go. | still until your gift; your act causes the release | Backup B. Perfect cause and effect, but seeds scatter *away* and get lost; ours must land and stay. Its gift (the user's act is the trigger, the release is instant) is kept. |
| 4 | **A school of fish turning together.** | one shared turn, no stop | Cut: no waiting state. Its gift (they all turn as one, each on its own path) is kept as the shared curve. |
| 5 | **Broadcast sowing by hand.** The sower's swing flings seed over the soil. | the throw = the drop | Cut: the hand is the hero, not the fireflies; and seed vanishes into soil. |
| 6 | **A carousel letting riders off.** It slows, they step off and walk away. | circling then leaving | Cut: slowing *before* leaving is a stop, and reads as "loading ended". |
| 7 | **Embers lifting from a fire.** | warm light rising | Cut: rising means "gone", the opposite of "taken and kept". |

## 3. The world: **"The glade goes out into the grass"**

- **The + is a call, not a door.** The home's light answers by gathering
  into the tree (the ring) in the middle. Nothing goes into the button.
- **The ring is the tree at dusk.** Slow, even, dim. It is waiting *for
  you*. It never speeds up or changes on its own.
- **Your file is the signal.** In the very next frame the fireflies wake
  (a soft brightening). Then the **same 30** leave the tree on curves that
  continue their circling, drift down and left, and settle into the grass
  as your files: dim, gently alive.
- **More files, more grass lights.** The ones that flew are the first
  files. Every further file lights where it lies, as it is read. The cloud
  grows while reading and stops when reading stops. That is the only
  progress sign.
- **One file:** one firefly lands and stays. The others go out with it
  and fade into the dark grass on the way. Calm, finished, nothing missing.

Team names (never on screen): **The call**, **The tree**, **The signal**,
**Into the grass**.

## 4. Beat 1 · The call: + to the orbit (about 1 s)

**Behaviours:** B1, B2, B3, B4, B8, B14, W6, W7.

**What happens:**

```
 ms     0        200            600       800     1000
 home   ░░ fades as the call reaches it (existing: D×.28 from D×.04) ░
 flies  · spawn near→far from + ·════ swirl into the RING slots ════╡
 ring                                    the 30 are the ring ═══════▶ (slow, as today)
 word                                              Select Folder ░░░╡ .24
```

- **Duration `D = 1000 ms`** (today 1200). The research line is "about a
  second before they can act"; and they can act from frame one (below).
- **Spawning is unchanged:** fireflies light where the home's ink was,
  near the + first, far last (`spawn`, `flash()`, the breath of lift).
- **The target changes:** no longer the +. Each firefly flies to a **slot
  on the ring**. The 30 orbit flies are seeded (`makeFlies()`), so for each
  slot the gather knows exactly where that orbit fly *will be* at its
  arrival time (its angle has kept turning at `omega`). It aims there,
  not at a fixed point, so it arrives already moving with the ring.
  - The home gives up to 400 fireflies. **30 of them become the orbit
    flies** (one per slot, the one whose path is shortest to it). The
    other ~370 each fly to the nearest slot and **merge into it**: in the
    last 18% of their path they shrink and fade (today's "drawn in"
    curve), like drops joining a bigger drop. The eye sees a swirl
    condensing into a calm ring.
  - Paths keep today's quadratic curve with one shared bend direction, so
    the streams swirl in together, ending in the ring's own direction of
    turn. `inOutQuad` on each path (as today).
- **No glow on the +.** Remove the plus warm-up, its pulse and the halo at
  the plus. Remove the orbit's "call dot" that fell at `H × .36`, and the
  orbit's own 600 ms fade-in when the call came: the ring is simply *there*,
  made of the flies you watched.
- **One screen, no blank frame.** The last frame of the gather is the
  first frame of the ring: same positions, same sprite, same brightness
  (`a0` .30 to .42, `r0` 2.5 to 4.4, clamped). How (one document, or
  handing positions and the time over to `/new`) is Jony's choice; the
  rule is that no frame shows neither.
- **`Select Folder` is there when the ring stands.** It fades in to `.24`
  (300 ms `outQuad`) at `D − 200 ms`, so it is readable the moment the
  ring has formed. Lean (hover, focus, Finder open) lifts it to the
  existing `.36` as today. This is the existing word, now visible at rest,
  because the research is clear: without it the ring is a spinner (W6).
- **They can act from frame one (B8).** Click and drop work during the
  whole call. A drop mid-call goes straight to Beat 2 (see §6).

**Waiting (B3, B4, W7):** the ring is exactly today's rest state: speeds
`w` 3 to 9 °/s, breathing, the 1.5 px wander, a rare twinkle per fly
(5 to 9 s apart). Nothing changes by itself, ever: no hint, no speed-up,
no timeout. When the window is hidden the loop pauses (rAF stops) and
picks up from the same angles when shown.

**What it means:** your home answered the call and gathered to wait for
your material.
**What they feel:** "Ooh", then "ready, it wants my folder".
**Weight:** light (retarget an existing gather; delete the plus glow).
**Builds:** Jony.

## 5. Beat 2 · The signal and into the grass (about 1.2 s)

**Behaviours:** B5, B6, B7, B8, B13, W1, W2, W3, W4, W5.

**What starts it:** the pick (`change` with entries) or the drop itself,
not the first file read (Q5). The reaction is in the **next frame**.

```
 ms      0   120                        900   1100   1500
 wake    ▲ brighten .3→.8 (outQuad) ╲ ··· settle to rest dim (.32) ···╡
 loosen  ═ ring radius +6% ═╡
 leave       ├─ left-most first, stagger 0–240 ms by angle ─┤
 flight      ●════ 780 ms inOutQuad, curve continues the turn ════● spot
 word    ╲ Select Folder → 0 (160 ms inQuad, as today)
 menu              ░░░ slides in (existing 420 ms), from 300 ms ░░░╡
 cloud                  · new files fade in at their spots (300 ms) · while reading
```

1. **0 to 120 ms · The signal (proof it was taken).** All 30 brighten
   from their rest alpha to `.8` (120 ms `outQuad`, the rise of `flash()`)
   and the ring loosens outward by 6% (120 ms `outQuad`). They keep
   circling at their **own slow speed**. No spin-up to `m = 6`: a speed-up
   is exactly what a spinner does, and there is no "working" phase to show
   now. `Select Folder` fades out (160 ms `inQuad`). The middle stops
   taking clicks.
2. **120 to 1140 ms · They go out.** Each fly leaves from **where it is,
   moving the way it was moving**: a cubic path whose first control point
   lies along its current tangent (the direction of turn) and whose end is
   its spot in the left field. No fly stops, turns back, or jumps.
   - **Order:** the flies on the left of the ring leave first, the right
     side last (stagger 0 to 240 ms by how far right they are). The ring
     peels off leftward like a flock leaving a tree: one direction,
     readable at a glance.
   - **Each flight:** 780 ms, `inOutQuad`, a living wobble of 2 px that
     goes to 0 at landing (like today's gather).
   - **Light:** from `.8` it settles to the field's dim rest look
     (`dotLook('unprocessed')`, about `.32`) over the last 600 ms
     (`inQuad`). This is the light rule taught in motion: they land and
     rest; light comes later, only when a file is really used.
   - **Size:** each keeps its own `r0` and lands at the field's dot size
     (both clamped).
3. **From landing on · Rest.** Each landed fly *is* the field firefly for
   its file: the same object takes on that file's drift and dim shine
   (fix 2). Shine starts no earlier than 1.5 s after landing, so the pour
   never twinkles.
4. **300 to 720 ms · The menu** slides in on the right, as today (420 ms,
   existing curve). No emblem, logo or icon anywhere (W1). The agent's
   name arrives in the menu header, alone (fix 9).

**Which fly becomes which file:** fly *i*, in leaving order, becomes file
*i* in read order. A picked folder is known at once, so every target is
real from the start. A drop is read as it goes: a fly whose file is not
known yet when it leaves flies toward a seeded spot in the field
(provisional, from its own index); when its file arrives, the end of its
path slides to the real spot over 400 ms `outQuad`. Mid-flight this reads
as a firefly changing its mind, not a jump.

**What the eye follows:** the **left edge of the ring breaking first**,
then the whole flock drifting down and left as one current. The leaders
land first, so the eye is pulled to the left field and sees the cloud
"start" right where they land. The menu comes in at the edge of vision,
after the eye has already moved left.

**What it means:** "I took it. These are your files now."
**What they feel:** "Oh! They're becoming my files." The doubter sees
the same lights they watched, so it can't be a fake.
**Weight:** medium (one cubic flight per orbit fly and an adopt step that
hands the 30 live objects to the field; everything else exists).
**Builds:** Jony.

## 6. Edge cases, all in the same language

- **Many files (B6, the 10,000 case).** Only the **30 orbit flies ever
  fly**. Every further file **lights in place** at its seeded spot (fade
  in, `FADE_IN` 300 ms `outQuad`) as its entry is read. Never more than
  **24 new lights per frame** (about 1,400 a second), so a batch of 500
  is a steady pour across about 20 frames, never a pop. The visible cloud
  stops at the field's cap (`FIELD_CAP`, today 3,000; Jony may lower it
  toward a few hundred if pixels show noise, Q4). Calm comes from three
  things:
  - the first 1.1 s belongs to the 30 flyers; the pour starts at their
    landing (from ~500 ms, under the leaders), so there is one story at a
    time;
  - the newcomers are as dim as the landed ones, and they don't shine
    until they settle, so the cloud thickens, it doesn't sparkle;
  - when the reading ends, any queued lights finish within 600 ms, then
    nothing new appears. **Growing = still reading. Still = done.** The
    pour never fakes progress and never runs past the work.
  - Reading runs in batches that each yield to the next frame (the drop
    reader already does), and saving runs in `postInBatches`. The
    animation never waits on either; Esc and the mouse keep working (W3).
- **One file (B7, Q1).** The leading fly becomes the file and lands. The
  other 29 leave with it, on the same paths, and **fade to 0 along their
  flight** (`inQuad` over the flight), so they melt into the dark grass
  near the file's spot. For *n* < 30 files, the first *n* in leaving
  order land and the rest fade the same way. The single firefly then
  drifts and shines like any other: finished, not empty.
- **A drop during the call (B8).** Taken at once. The 30 ring-bound flies
  start their Beat 2 flight **from wherever they are on their gather
  path**, keeping their current direction; the merging ones still
  condense into them and fade. No reaction is skipped or delayed.
- **A second folder during the hand-over (B13, Q3).** It waits its turn
  and is added by the creation screen once it owns dropping (its lights
  join the cloud the same way). Never lost (W4).
- **A drop with nothing in it, an empty folder, a cancelled picker (W5).**
  Nothing starts: the ring stays exactly as it was (today's `calm()` and
  hold-release). Beat 2 only begins on a pick with entries or a drop with
  real files.
- **A failed save.** No magic on errors: the landed and flying lights fade
  where they are (900 ms `inQuad`), the menu slides back out, and the ring
  fades back in at rest (600 ms), as if nothing was given. No red, no
  shake.
- **Esc during reading (W9, Q2).** Leaves at once to home, no exit motion,
  keeps nothing (Columbo's assumption).
- **Window hidden during reading.** Reading goes on; the animation pauses
  and on return shows the current state (no catch-up replay).

## 7. Reduce Motion (B14, W8)

- **Beat 1:** the home fades (existing 160 ms). The ring appears **at
  rest, in place**, at its normal dim brightness, with `Select Folder` at
  `.24`. Nothing flies or turns.
- **Beat 2:** on the pick or drop the 30 brighten to `.8` in place (the
  same 120 ms proof, brightness only), then a **300 ms cross-fade**: ring
  flies fade out where they are while the field dots fade in at their
  spots. The menu appears without its slide. Big folders: dots appear in
  place, same pacing, no fade-in motion beyond opacity.

## 8. Every idea from inside the world, and what survived

Kept:
1. The call flies into ring slots, not the + (Beat 1).
2. Gatherers aim where their orbit fly *will be*, so they arrive moving.
3. 370 extras merge into 30 like drops: a swirl condensing into calm.
4. Gather's last frame = ring's first frame (no blank, no fade-in).
5. `Select Folder` readable at rest the moment the ring stands.
6. The wake: a 120 ms brightening as the proof of "taken".
7. No spin-up: rhythm stays slow, so the ring was never a spinner.
8. Leaving along the tangent: no stop, no turn-back.
9. Left side of the ring leaves first: a flock peeling toward the field.
10. Lights settle to dim as they land: the light rule in motion.
11. Only 30 ever fly; everything else lights in place, paced.
12. Growing = reading, still = done (honest end within 600 ms).
13. One file: the others melt into the grass on the way.
14. No shine until settled, so the pour never twinkles.

Cut, and why:
- **A glow or pulse on the + at the end of the call.** It made the + the
  destination, the very thing we remove.
- **The DNA emblem forming between orbit and field.** An icon in between
  (W1, rule 1). The earlier report's "glade gathers into the emblem" and
  "Dusk" fast circling are superseded by this report.
- **Spin-up to `m = 6` while reading.** Turns the ring into a spinner
  after the fact, and nothing circles during reading any more.
- **A thin trail behind each flyer.** Pretty, but 30 trails are noise and
  cost a blur pass; the curve itself is readable.
- **The 370 home flies all flying on to the field.** Too many movers, a
  blizzard; and they are not files.
- **Flying every file (up to 3,000) from the ring.** Heavy and loud; the
  pour in place says the same thing honestly.
- **A soft "landing" pulse per file.** Repeats thousands of times; light
  must only mean "used".
- **A ripple through the ring on hover.** The existing lean already does
  this job.
- **A sound for the signal.** No sound switch on this screen (same as the
  creation screen).
- **A "Reading…" whisper under the cloud.** A status line (fix 7).
- **The ring slowly dimming over a long wait.** A change people didn't
  cause (W7).
- **The flock looping once round the middle before leaving.** A cut-scene;
  it delays the proof.

## 9. Backups

- **Backup A · Bees out of the hive.** Same timings, but flyers leave in
  three loose lines toward the field. Use only if the single current reads
  as a blur in pixels.
- **Backup B · The dandelion.** All 30 let go in the same frame (no
  stagger), radially, then curve left. Use only if the stagger makes
  the first 100 ms look like nothing happened.

## 10. Numbers at a glance (for the build and the checks)

| What | Value |
|---|---|
| Call duration `D` | 1000 ms |
| Call targets | 30 ring slots at arrival time; extras merge in last 18% |
| `Select Folder` at rest | `.24`, in at `D − 200` over 300 ms `outQuad`; lean `.36` |
| Signal (wake) | next frame; alpha → `.8` over 120 ms `outQuad`; radius +6% |
| Ring speed during signal | unchanged (`m = 1`) |
| Leave stagger | 0 to 240 ms, left side first |
| Flight | 780 ms `inOutQuad`, cubic, first control on the tangent, wobble 2 px → 0 |
| Settle to rest dim | last 600 ms of flight, `inQuad`, to `dotLook('unprocessed')` |
| Retarget when file arrives | 400 ms `outQuad` |
| Menu | from 300 ms, existing 420 ms slide |
| Further files | in place, `FADE_IN` 300 ms, ≤ 24 per frame, from ~500 ms |
| End of pour | ≤ 600 ms after reading ends |
| First shine after landing | ≥ 1.5 s |
| Extras when < 30 files | fade to 0 along flight, `inQuad` |
| Failed save | fade in place 900 ms, ring back at rest 600 ms |
| Reduce Motion | 120 ms brighten in place, 300 ms cross-fade |
| Flyers ever | 30. Everything else lights in place. |

## 11. Hand-off

- **Jony (build):** build §4 to §7 in `firefly-gather.js`,
  `firefly-orbit.js`, `new-agent.html` and `creation-screen.js`. The field
  must **adopt** the 30 live orbit objects (no redraw from scratch), and no
  frame may show the emblem or a blank. Remove the plus glow, the call
  dot, the orbit fade-in, the `m = 6` spin-up, the gather-into-emblem and
  the first-light wait before the split. You choose the field cap (Q4)
  and how the call and ring share one screen.
- **Eraser (sign-off):** check in pixels: no light reaches the + at any
  frame; a pick or drop changes the ring's brightness within one frame;
  the ring's speed does not rise; no frame between orbit and field shows
  an emblem, a blank or a jump > the flight path; with 10,000 files the
  cloud keeps growing while reading and is still within 600 ms after; one
  file leaves exactly one lit dot; Reduce Motion positions are identical
  1 s apart while waiting.
- **Columbo (captain):** `Select Folder` at rest `.24` follows your D1/D2
  finding; it changes an earlier choice (hover-only), so confirm it in
  the merge.
