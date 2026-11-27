# FIREFLIES-BUILD: the build screen motion (Merlin)

Builds on `01-columbo-report.md` (B1–B17, W1–W7). Journey step
**UJ2 · 1, "Brings a folder, files or a path"**.

Everything reuses what the app already has:
- From `fireflies-dna.js`: `MIN_R`, `MAX_R` and `flash()`, plus `createDna()` for the end state. The file stays untouched.
- The DNA glow sprite and the firefly colour `#D8F26A` (`STILL` / `--fly`).
- The `glade.call` arrival fade that `new-agent.html` already has.
- The curves from `2026-11-26 AGENT-HOME/02-merlin-motion.md`.

Nothing is added to the screen. The only visible word is the user's own
**Select Folder**.

## 1. The moment, in one line

**The plus was a call. This screen is the glade waiting for an answer.
Your folder is the answer.**

- On home, the plus sends one light up (the call, already shipped).
- On `/new`, that light fades into a **waiting ring** of dim fireflies
  that circle an empty middle. A ring points to its centre, so the ring
  itself says "here" (Columbo, key insight 2).
- Hover the middle and the nearest fireflies **lean in** while
  **Select Folder** shows faintly.
- Drag something over the window and the whole ring **stirs**.
- Pick or drop, and every firefly flashes and speeds up. That is
  **the answer**.
- Then they spiral into the middle and leave the new agent's own DNA
  logo there: **first light**. It is the same logo the agent will wear on
  home, made from the files just handed over.

The names (waiting ring, lean, stir, answer, first light) are for the
team only. None of them appears on screen.

Why this world: it continues the call from home without a new metaphor.
Real *Photinus* fireflies work this way. One calls in the air, and the
answer is a flash from below. The end state is a logo the user will see
again on home, not a one-off effect, so the moment means "this is now
someone".

## 2. Shared pieces

### Sprite and colour

`spriteOf` is not exported, so copy it into `firefly-orbit.js`
**unchanged** and give it the colour `#D8F26A`:
- a 128 × 128 radial gradient;
- the core is the colour mixed 70 % toward white;
- the stops are `0 → core`, `.18 → rgba(c,.9)`, `.42 → rgba(c,.28)` and `1 → rgba(c,0)`.

Draw it the way DNA does, with `globalCompositeOperation = 'lighter'`,
`drawImage(sprite, x - r, y - r, 2r, 2r)` and `globalAlpha = a`. A dot's
**radius `r` is half the drawn size**, as in DNA.

**Radius rule (Eraser checks this):** every drawn `r` is
`clamp(r, MIN_R, MAX_R)`, so it stays between 2.5 and 6.0 in every state.

### Curves

| Name | JS | CSS |
|---|---|---|
| `outQuad` | `1-(1-x)²` | `cubic-bezier(.5, 1, .89, 1)` |
| `inQuad` | `x²` | `cubic-bezier(.11, 0, .5, 0)` |
| `inOutQuad` | `x<.5 ? 2x² : 1-2(1-x)²` | `cubic-bezier(.45, 0, .55, 1)` |
| `flash(dt)` | imported from `fireflies-dna.js` (120 ms up, 900 ms down) | — |

### One canvas, one loop

- Draw everything on the existing `canvas#field`: the orbit, the call
  fade and the gather.
- Move the `glade.call` drawing into the orbit's frame loop with **the
  same numbers**: at `(W/2, H*.36)`, size `18+12b`, alpha `.14+.8b`, fall
  900 ms, then a 600 ms fade. Keep its own 64 px sprite.
- Use `requestAnimationFrame` and cap `dt` at 50 ms, so a hidden tab
  doesn't jump.
- Under Reduce Motion, draw only when a state changes.

## 3. The waiting ring (rest)

Let `C = (W/2, H/2)` and `U = min(W, H)` (CSS px). The radii follow `U`
on resize, at once, with no animation.

| Ring | Fireflies | Radius | Own speed (each picks one, uniform) |
|---|---:|---|---|
| A (inner) | 7 | `.14U` | 6.0–9.0 °/s |
| B | 10 | `.23U` | 4.5–6.5 °/s |
| C (outer) | 13 | `.33U` | 3.0–4.5 °/s |

**30 fireflies.** On a 1440 × 900 window the rings sit at 126, 207 and
297 px. One inner lap takes about 50 s. The linear speed of every
firefly is about 13–25 px/s: calm, never a spin.

Each firefly is fixed at load from one seeded RNG (mulberry32 seeded
with `hash('firefly-orbit')`), so checks see the same ring every time:
- **Angle:** evenly spaced in its ring, plus a jitter of `±.35 × (360°/n)`.
  The first inner firefly **A0 sits at exactly −90° (straight up) with no
  jitter**. That is right under the fading call light, so the call seems
  to drop into the ring and fly on as one of them.
- **Ring radius:** `ring ± .015U` jitter, plus a slow breath of ±3 px
  with a sine period of 7–11 s (each its own).
- **Drift:** the DNA drift (±1.5 px, 8 s sine, seeds `seedA` / `seedB`).
- **Direction:** all clockwise (angle grows, screen y points down). One
  direction stays calm, and mixed directions read as busy.
- **Rest radius `r0`:** 2.5–4.4 px, uniform. The ×1.3 burst peaks at 5.72,
  which stays under 6.0.
- **Rest alpha `a0`:** .30–.42, uniform. This is "dim": visible on the dark
  field, never bright.
- **Twinkle:** each has its own beat with a period of 5–9 s and a random
  phase. On each beat, `b = flash(t - beatAt)`. On average about 4 of the
  30 are mid-flash at once: alive, not busy.

```
alpha = min(.95, a0 + .30·b + .30·h + .15·s)        // h = lean, s = stir (below)
r     = clamp(r0 · (1 + .12·max(b, h)), MIN_R, MAX_R)
angle += ω · m · dt                                  // m = speed multiplier, 1 at rest
```

**Arrival:**
- The ring fades in as a whole from alpha ×0 to ×1 over **600 ms**
  (`outQuad`), starting at **0 ms**. This is the same with or without a
  call, so there is one rule.
- With a call, the orbit is already visible while the call light falls,
  so there is no blank moment (B1).
- Nothing is saved on arrival (W4).

## 4. The lean (hover on the middle)

- **Hit area:** a circle around `C` with radius `hitR = max(56, .10U)` (90
  px on a 900-high window). That is the empty space inside ring A
  (`.14U`), so aiming is easy.
- **Hysteresis:** the lean starts inside `hitR` and ends outside `hitR + 12`,
  so the pointer can't make it flicker on the edge.
- **Element:** the hit area is a real
  `<button id="pick" aria-label="Select Folder">`: a transparent circle of
  `2·hitR`, centred, with `cursor: pointer`. It holds the text. It is not
  a new control; it is the middle the user described.
- **Text:** `Select Folder`.
  - Font: `15px/1 var(--font)` (the home's system stack), weight 500,
    `letter-spacing: .02em`, colour `var(--fly)` `#D8F26A`, centred on `C`.
  - **Opacity: 0 → .36.** That is about 2.9 : 1 against `#0B1410`: quiet,
    but readable when you look for it (W3 / B3).
  - Glow: `text-shadow: 0 0 6px rgba(216,242,106,.55), 0 0 18px rgba(216,242,106,.22)`.
  - No movement and no scale. Opacity only.
- **Nearby fireflies:** the **5 fireflies nearest the pointer** (or nearest
  `C` when the button has keyboard focus) lean in.
  - Their lean `h` goes to 1: alpha +.30, radius ×1.12, and they move
    **6 px toward `C`**.
  - The set is picked again every frame as the ring turns. One firefly
    drifts out, the next drifts in, so the five seem to come and look.
  - Each firefly eases its own `h`, so a swap fades and never pops.
- **Timing:**
  - In: text and `h` both take **360 ms**. The text uses `outQuad`. `h` uses
    exponential smoothing with τ = 120 ms.
  - Out: **600 ms**. The text uses `inQuad`. `h` uses τ = 200 ms.
  - No delay before the lean starts.
- **Keyboard:** Tab lands on `#pick`. Focus shows the same lean, plus a soft
  ring: `box-shadow: 0 0 0 1px rgba(216,242,106,.38)` on the circle. This is
  the home's soft focus language. Enter or Space opens Finder (B14).
- **While Finder is open,** the lean **holds** (text and the 5 fireflies),
  as if the ring is waiting for your answer. A second click does nothing.

## 5. The stir (dragging over the window)

- **Starts** on the first drag-enter of anything into the window: the
  browser's `dragenter`/`dragover`, or Tauri's native drag-enter/over.
- **Ends** **150 ms** after the last `dragover`, or at once on a native
  drag-leave. This timer stops the flicker when a drag crosses inner
  parts of the page (B13).
- **What changes:** the stir level `s` goes to 1. Every firefly gets alpha
  +.15, and the whole ring speeds up to **m = 1.6**.
  - In: **240 ms** `outQuad`.
  - Out: **400 ms** `inQuad`.
  - The meaning: the glade is awake and expecting.
- **What does not change:** "Select Folder" stays hidden during a drag,
  because it names the click. No outline, no box, no target. The drop
  works anywhere.

## 6. The answer (pick or drop) → first light

`t = 0` is the call to `onChosen(entries)` with **at least one entry**.
Pick and drop look exactly the same from here on.

```
 ms     0        200       500       800              1300  1500
 glow   ▲ all to full ─────────────── held ──────────────┤
 speed  ═══ m 1 → 6 (inOutQuad) ═╡ held 6 ═══════════════┤
 text   ▼ 160 ms out
 gather                           ●── spiral into C ──●
 logo                                       ░░ fades in ░░┤  notice() at 1300
```

| # | What | Time | Values | Curve |
|---|---|---|---|---|
| 1 | **Full glow** | 0 → 200 ms | Every firefly goes to alpha 1.0 and radius `r0 × 1.3` (≤ 5.72, clamped). Twinkle and lean stop. | `outQuad` |
| 2 | **Speed up** | 0 → 500 ms, then held | `m` goes from its current value (1, or 1.6 after a drop) to **6** (about 18–54 °/s). | `inOutQuad` |
| 3 | **Text leaves** | 0 → 160 ms | "Select Folder" opacity → 0. `#pick` stops reacting. Cursor is the default. | `inQuad` |
| 4 | **Gather** | 800 → 1300 ms | Each firefly's distance from `C` is `ρ0 · (1 - inQuad(k))`, with `k = (t-800)/500`, while it keeps turning at m = 6, so the ring spirals in. Alpha stays 1 until `k = .5`, then `1 - inQuad((k-.5)/.5)`. | as given |
| 5 | **First light** | 1100 → 1500 ms | The placeholder logo canvas (56 × 56 css px, centred on `C`) goes from CSS opacity 0 to 1. | `outQuad` |
| 6 | **It answers** | 1300 ms | `logo.notice()`: every dot of the new logo flashes once, exactly as the fireflies arrive. This is the DNA's own hover flash, reused. | `flash()` |
| 7 | **Rest** | 1500 ms | The orbit is gone and the canvas stops drawing it. Only the logo is left. | — |

**The work runs inside the answer:**
- `POST /api/agents`, then `POST /api/agents/:id/files`, then a
  `GET /api/agents` to read the new agent's `dna`.
- If they are not done by **800 ms**, the answer **holds** at step 2 (full
  glow, m = 6) until they finish, then plays steps 4–7.
- It never jumps ahead and never drops files (B8).
- A 10,000-file list is only paths and sizes. It must not block the frame
  loop.

**The placeholder ("first light"):**
- The logo is `createDna(canvas, { name: nameOf(agent), files: agent.dna })`.
  It uses the agent's own `dna` from the server, so it is **the same logo
  home will show**.
- If the GET fails, or `dna` is empty, use `files: []`. That draws the
  single calm DNA dot: the same code, a quieter result.
- Drawn at 56 px, the logo's dots are true DNA radii (2.5–6.0). It keeps
  drawing with its own `draw()` and its usual slow beat.
- Nothing else is on the screen: no words and no controls.
- `<main aria-label="New agent">` gets a visually hidden `role="status"` that
  reads "New agent" (a word already on the list, §6). It confirms the
  answer to screen reader users without adding a new word.
- Esc goes home, where the new agent is now at the top.

**During the answer:** clicks, a second pick, a second drop and
drag-overs are ignored (B12, Q8). Esc goes home at once (the agent
exists).

## 7. Settling back (Finder cancelled, a bad drop, a failed save)

This is one curve for every "nothing came":
- **Cancel in Finder:** the held lean lets go over **900 ms** (`inQuad`),
  slower than a normal 600 ms leave. If the pointer is still inside `hitR`,
  the lean simply stays.
- **A drop with no real file** (a link, text, or an empty folder that
  gives 0 entries): no burst. The stir lets go over **900 ms** (`inQuad`),
  and `m` goes back to 1 over the same time.
- **A failed save** after the answer started: every firefly goes from full
  glow back to its own rest alpha and radius over **900 ms**, and `m` goes
  from 6 to 1 (both `inQuad`). The ring is ready to try again.
  - Whether a plain quiet line is needed is Jony's call. No magic on
    errors.
  - If an agent was already created, Jony documents what happens to it in
    `03-jony-build.md`.

No error box, no shake, no red, no words. Afterwards the screen is
exactly the waiting ring again (B6, W2).

## 8. Reduce Motion

Use one live `matchMedia('(prefers-reduced-motion: reduce)')` flag that
also follows changes, and in the app the macOS setting through the
webview. **Nothing moves; only brightness changes.**

| State | Under Reduce Motion |
|---|---|
| Ring | Every firefly is drawn **still** at its seeded angle and radius. No orbit, breath, drift or twinkle. Alpha stays at `a0` and radius at `r0`. |
| Arrival | No call light (home doesn't write `glade.call`). The ring is simply there from the first frame. |
| Lean | Same text fade (opacity only). The 5 fireflies nearest the pointer get alpha +.30, and the set is fixed while the pointer stays still. No lean-in movement and no size change. |
| Stir | Alpha +.15 on every firefly. **No speed-up.** |
| Answer | 0–200 ms: alpha → 1, no size change. Hold until the work is done (at least to 600 ms). 600–1000 ms: the ring fades to 0 (`inQuad`) **in place**. 800–1100 ms: the logo opacity goes 0 → 1. No `notice()` (DNA ignores it under Reduce Motion anyway). |
| Settle | The same 900 ms brightness return. |

Eraser checks: under Reduce Motion, two frames 1 s apart give identical
firefly positions, and `r` never changes.

## 9. For the checks

Expose the state read-only, the same way as `window.dnaLogos`:
`window.orbit = { info() }` returns `{ state: 'rest'|'lean'|'stir'|'answer'|'settle'|'first-light', m, flies: [{ x, y, r, a }], textOpacity }`.

As the team rules say, Eraser still checks the pixels:
- the ring is visibly dim at rest;
- the text is faint (peak opacity .36) and in the firefly colour;
- every firefly is visibly bright during the answer.

## 10. Ideas considered

Kept (above): A0 starting under the call light; the 5 fireflies that
lean in and swap as the ring turns; the hold while Finder is open; the
stir; the answer's spiral in; the new agent's own logo as the
placeholder; `notice()` as the logo's first flash; one 900 ms settle for
every "nothing came".

Cut:
1. **A soft glow disc in the middle during a drag.** It reads as a drop
   target, a second target the brief forbids.
2. **"Select Folder" also shown during a drag.** It names the click, and
   "Folder" would make people fear loose files are refused (B9).
3. **Fireflies that follow the pointer anywhere.** It costs attention and
   pulls the eye away from the middle.
4. **Rings turning in opposite directions.** It looks mechanical and
   busy.
5. **A first-visit hint where the word shows once on its own.** Q3 is the
   user's call. It stays hover only.
6. **A small "no" flicker on a bad drop.** Any flash reads as success
   (W2). Silence is calmer.
7. **Counting files with fireflies** (one firefly per file during the
   answer). It is heavy on giant folders, and it is the inventory's job
   (Phase 3).
8. **The DNA logo landing dot by dot** (`setFiles` after an empty
   start). With thousands of files the queue runs for seconds and the
   screen never rests.
9. **A white wash flash** (Birth's). It belongs to Birth and would wear
   it out.
10. **A soft chime on the answer.** There is no sound switch here, and we
    add no controls.
11. **A zoom into the middle on the answer.** That is template motion,
    and Reduce Motion users get nothing from it.
12. **A trail behind fast fireflies.** It is decoration, and heavy at 30 ×
    60 fps.
13. **The ring breathing in and out as a whole.** It reads as "loading".
14. **Making the hit area grow on hover.** Something moves under the
    cursor while it aims.
15. **A text label on the placeholder ("Got it", "Reading…").** These
    are new words, and nothing is reading yet.
16. **Exit motion on Esc.** It delays leaving (B7).

## 11. Hand-off

- **Jony (build):**
  - Build everything in §2–§8 in `firefly-orbit.js` and `new-agent.html`.
  - Import `MIN_R`, `MAX_R`, `flash` and `createDna` from
    `fireflies-dna.js`, and copy the sprite gradient. Don't edit that
    file.
  - Add `firefly-orbit` to `PAGE_MODULES` in `src/server/app.mjs` if the
    page loads it as a module, as the other page modules are.
  - The call light moves into the shared loop with the same numbers.
  - The drag stir must also work from Tauri's native drag events in the
    installed build (W1).
- **Eraser (check):**
  - 30 still dim dots under Reduce Motion, and none of them moves.
  - Every `r` is between 2.5 and 6.0 in every state.
  - The text peak is ≤ .36 opacity, in `#D8F26A`, and appears only on
    hover or focus.
  - The stir shows no text and no target.
  - Pick and drop give the same timeline, and first light is reached in
    about 1.5 s (or right after the save finishes).
  - Cancel and a bad drop leave no agent and no message.
  - Esc goes home in every state.
