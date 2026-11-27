# FIREFLIES WANDER: the motion recipe (Merlin)

For Jony (build) and Eraser (sign-off). It answers
`Reports/fireflies-wander-behaviours.md`. Every number below was run in a
prototype (1,500 flies × 4 start times, 30 s each, at 60 fps, field
1060 × 900, pad 32). Those runs are where the measured numbers come from.

## The meaning, in one line

A firefly in a field on a summer evening isn't on a string. It **drifts,
curves, stops to hover, then drifts on**, and its light comes and goes on
its own clock. Here, a fly crossing the field means *"your file is in
here, alive"*. Slow means *"and nothing is wrong"*.

## The interface

```js
export function wanderAt(id, t, area, reduced = false) → { x, y, glow }
// id: file id (path)   t: ms (the same clock paint() gets)
// area: { w, h, pad } px   x, y: absolute px inside the area
```

- `reduced === true` returns the home spot with no glow:
  `{ x: pad + s.x·(w − 2·pad), y: pad + s.y·(h − 2·pad), glow: 0 }` with `s = spotOf(id)`.
  This is the same spot `fieldLayout` gives today.
- Otherwise the result depends only on `(id, t, area)`. There's no state
  and no history, and the same inputs always give the same output.

## The recipe

There are four layers, each a closed formula. Seed them once per id with
`rng(hash('wander:' + id))`, then cache the params in the `params` Map as
`flyParams` is today. Take the random draws **in the order listed**, so
the seeding is the same for every build.

### 1. The roam path: two slow sways per axis, plus one loop

The fly's place in the unit square is X, Y ∈ [−1, 1]. `τ` is the fly's own
"wander time", defined in layer 2.

| part | X amplitude | Y amplitude | period (per fly, uniform) | phase |
|---|---|---|---|---|
| long sway | .46 | .46 | 120–180 s, drawn separately for X and Y | 0–2π, each |
| medium sway | .30 | .30 | 66–96 s, drawn separately for X and Y | 0–2π, each |
| loop (a circle) | .16 · cos L | .16 · sin L | 30–44 s, random sign (clockwise or not) | 0–2π |

```
X = .46·sin(2π τ/PX1 + φX1) + .30·sin(2π τ/PX2 + φX2) + .16·cos(L)
Y = .46·sin(2π τ/PY1 + φY1) + .30·sin(2π τ/PY2 + φY2) + .16·sin(L)
L = 2π τ/PL + φL        (PL is negative for a clockwise loop)
```

Why it looks real:
- X and Y periods never match, so the path never closes into a visible
  figure-eight or circle. Repeats are minutes apart and never exact.
- The **loop** gives the "soft loops" people expect. It also keeps a fly
  moving when both sways turn at the same time. Without it, some flies
  barely moved for 20 s (I measured this).
- The amplitudes add up to .92, so the path never leaves the square.

### 2. Pauses: a time warp, not a stop

```
τ = sp · ( t − k1·(Q1/2π)·sin(2π t/Q1 + ψ1) − k2·(Q2/2π)·sin(2π t/Q2 + ψ2) )
k1 = .50   Q1 = 9–15 s     ψ1 = 0–2π
k2 = .25   Q2 = 23–35 s    ψ2 = 0–2π
sp = .45–.65   (this fly's own pace)
```

The speed factor is `sp·(1 − .5·cos(…) − .25·cos(…))`. It always stays
between `.25·sp` and `1.75·sp`, so it is never zero and never negative.
The fly **slows smoothly into a hover and eases out of it**. It never
stops dead and never reverses. The heading doesn't change during a slow
phase, so a hover never twists. Two clocks that don't match make the
pauses irregular instead of a steady breathing beat.

### 3. Soft bounds: ease back from the edges

```
C = 1.3     N = .94 / sin(C·.92)
X' = N·sin(C·X)     Y' = N·sin(C·Y)
x = pad + (w − 2·pad)·(.5 + .5·X')
y = pad + (h − 2·pad)·(.5 + .5·Y')
```

- The sine curve flattens toward the edges, so a fly **slows down as it
  nears an edge and curves back**. It never touches or slides along an
  edge.
- It also spreads the flies out: the bunch in the middle that a sum of
  sines gives becomes an even field. Measured share of fly-time in ten
  columns from left to right: `4 10 11 13 13 13 12 11 9 4 %`. The middle
  is full, the edges are thinner, and nothing piles up.
- A fly never gets closer than ~3 % of the inner size to the edge. That
  is `pad + 25 px` on a 1060 × 900 field; I measured 57 px from the
  window edge. That keeps flies out from under the menu, since the area's
  right edge is the menu's left edge.
- Positions are fractions of the area. On resize the field stretches
  smoothly with the window: no jump and no re-seeding.

### 4. The glow: dim, rare, on its own clock

This is the same shape as today's `flyAt` shine, only less often:

```
every = 16–32 s (per fly)   at = 0–1 (where in its cycle)   SHINE_MS = 2400
u = (((t/every + at) % 1) + 1) % 1 · every
glow = u < SHINE_MS ? SHINE_MAX · sin²(π u / SHINE_MS) : 0      // SHINE_MAX = .22
```

- The peak is .22 at most: a swell, never a flash. With 200 flies, about
  20 are somewhere in a shine at any moment, and most of those are near
  its faint ends. Each fly runs on its own clock, so they never shine
  together.
- Keep the existing rule in paint: no glow in the first `SHINE_AFTER` ms
  after landing.
- Bright (used) and red (removed) flies **wander the same way** (open
  question Q1). The field stays one living thing, and their own colour
  and halo keep them readable.

## Measured result (C = 1.3, the numbers above)

| what | value |
|---|---|
| speed, px/s | median **9**, 10 %–90 %: **3–22**, 99 %: 34, top: 55 |
| time in a hover (< 4 px/s) | **17 %**: at any moment about 1 fly in 6 is hovering |
| hover length | median **3 s**, 90 %: 8 s |
| distance flown in 20 s | median **205 px**, 95 % of flies over 83 px, every fly over 20 px |
| farthest from start within 20 s | 95 % of flies over 58 px |
| heading change | median **2.7°/s**, 99 %: 16°/s, max 62°/s ≈ **1° per frame**. No sharp turn, ever |
| crossing the field | about 1–2 minutes from one side to the other. Every fly covers the whole field over a few minutes |

These speeds are for a 1000-px-wide field. They scale with the field
(smaller window, slower flies), which is fine.

## Cost limit

- **Pure O(1) per fly per frame:** about 12 `sin`/`cos` calls and no loops.
- **No state that grows per fly:** the params are made once per id
  (cached, like `params` today). No stored position, velocity or history.
  Coming back to the tab puts every fly where the formula says, with
  **no catch-up rush** (W8).
- Measured in Node: 10,000 calls ≈ **1.7 ms per frame**, and setting up
  10,000 params ≈ 1.4 ms once. Only `FIELD_CAP` = 3,000 are drawn, so
  that is about 0.5 ms per frame.

## Handover notes for Jony

1. **The landing:** a flight's end point is `wanderAt(id, landingT, area)`.
   At landing the fly moves at ≤ 55 px/s and the flight eases out, so the
   fly carries on with no snap. Use `t` for the target during `RETARGET`,
   as `flyAt` is used today.
2. **Paint:** for settled flies, use `wanderAt(...)` for x and y instead
   of `d.x + m.dx`. `area = { w: fw, h: H, pad: PAD }`.
3. **Remove** `DRIFT_MAX` and the sway half of `flyParams`/`flyAt` once
   nothing uses them. Keep `SHINE_MAX` and `SHINE_MS`.
4. **Reduced:** home spot, glow 0, still painted only on change.
5. **Not a control:** add no pointer events, cursor change or hover
   brightening. The canvas stays pointer-free.
6. Thresholds for the checks, with margin under the measured numbers:
   - every fly flies over 20 px in 20 s
   - the median fly flies over 120 px in 20 s
   - heading change ≤ 3° per 16.7 ms frame while speed > 4 px/s
   - x and y always inside `[pad, w − pad] × [pad, h − pad]`
   - `wanderAt(id, t, area, true)` is the same for any t and has glow 0
   - the same inputs give the same output

## Cut, and why

- **Random walk or noise with stored velocity:** needs per-fly state and
  catches up after a hidden tab. Breaks "same id + t, same place".
- **Bouncing off the edges:** looks trapped and screensaver-like (W6).
- **Flies drifting toward or away from the pointer:** that makes them
  look like controls (W1).
- **Shines synced to hovers, or glowing more while still:** nice in
  theory, but it couples two clocks and makes the shine predictable. Kept
  separate.
- **Real firefly sync-flashing:** reads as "the app is working" (W5).
- **A trail or afterglow:** costs a pass per frame and adds visual noise
  at the side of the eye.

## Open

- **Rare long slow stretches:** about 1 % of hovers last 17 s or more,
  usually near an edge. That fly still moves, just slowly. If Eraser sees
  one looking stuck, raise `sp` to .5–.7 first, not the warp.
- **1–5 files** (Q4): the same recipe. A few slow flies over the whole
  field should look like "a quiet evening", not "lost". Eraser should
  check.
