# AGENT-HOME: the plus-button motion (Merlin)

Builds on `01-columbo-report.md` (B5, W1, W2, B13) and the restored
`src/server/public/glade-fireflies.html`. Every value below reuses what that
file already has: the `FLY` sprite, the flash curve (rise 120 ms ease-out,
fall 900 ms ease-in), `easeOut` / `easeInOut`, the soft arrival curve and
the Birth spot `(W/2, H*.36)`. Nothing new is invented that the glade
doesn't already know.

## 1. The moment, in one line

**Pressing the plus is a firefly's call.** One light flashes from the plus
button and rises in a short J-shaped curve into the dark. It goes to the
spot where agents are born, and the new page opens there. Nothing has been
made yet (W1): a call is a question, not an answer.

Why this world and not another:

- In real Photinus fireflies the male flashes **while rising**, and that
  draws a small "J" in the air. That's the call. The answer comes later,
  from the ground. So "plus" means "I'm calling for someone new", and
  `/new` is the quiet place where the answer will come. Later, when `/new`
  gets content, the agent's Birth is the answer. The world already tells
  that story.
- The light lands on the **Birth spot** `(W/2, H*.36)`, the same place
  where Maya forms in the original. So the transition quietly points to
  where the new agent will one day appear.
- Under half a second from press to new page (`480 ms`). It still feels
  good the 100th time, and a second press skips it.

Tested and dropped as the main world (they were too forced or too generic):
turning a notebook page (not this world), a seed planted (the plus would
mean "created", which breaks W1), a lantern carried to a new clearing (too
close to the call but heavier), a door opening / zoom into the plus
(template motion that any AI would suggest).

## 2. The motion spec (recommended)

### Curves (CSS equivalents of the page's own JS curves)

| Name in this spec | JS in glade-fireflies.html | CSS |
|---|---|---|
| `outQuad` | `easeOut = 1-(1-x)²` | `cubic-bezier(.5, 1, .89, 1)` |
| `inQuad` (flash fall) | `1 - x²` falling | `cubic-bezier(.11, 0, .5, 0)` |
| `inOutQuad` | `easeInOut` | `cubic-bezier(.45, 0, .55, 1)` |
| `flash(dt)` | `flash()` (120 ms up, 900 ms down) | use the JS function itself on canvas |

### Timeline on the home (plain click, motion allowed)

```
 ms    0    60   120        240  280   320        480
 plus  ████ lit (flash rise) ───────── holds ─── fade ──┤ navigate
 spark      ●──── J-curve rise to Birth spot ──────────●
 list  ▓▓▓▓▓▓▓▓ fade out ▓▓▓┤
 search  ▓▓▓▓▓▓▓▓ fade out ▓▓▓┤
 canvas ░░░░░ dims to .35 ░░░░░░░░░┤ (stays dim until nav)
```

| # | What | Start → end | Values | Curve |
|---|---|---|---|---|
| 1 | **Plus lights up** (the call) | 0 → 120 ms, then holds | plus glyph and border colour → `#F6FFD6` (the sprite core); `box-shadow: 0 0 18px rgba(216,242,106,.45)`; no scale | `outQuad` |
| 2 | **Glade hushes**: the other fireflies go quiet while one calls | 0 → 360 ms | `canvas#field` CSS `opacity` 1 → .35. Only the element's opacity; the drawing code and the firefly movement are untouched | `outQuad` |
| 3 | **List fades** | 0 → 240 ms | list column `opacity` 1 → 0. No move, no scale, no stagger | `inQuad` |
| 4 | **Search input fades** | 40 → 280 ms | search input `opacity` 1 → 0 | `inQuad` |
| 5 | **Spark leaves the plus** | 60 → 480 ms (420 ms) | one `FLY` sprite drawn on the **existing** canvas (see "Spark path"). Size 18 → 30 px, alpha .44 → .94 | position `inOutQuad`; size and alpha `outQuad` |
| 6 | **Plus lets go** (its light has left) | 320 → 480 ms | plus `opacity` 1 → 0 | `inQuad` |
| 7 | **Go** | 480 ms | `location.assign('/new')` | — |

Order in words: the plus lights first. At the same moment the glade dims
and the list fades, so the eye goes to the one bright thing. Then the light
leaves the plus and rises. The plus fades last, and the page changes
just as the light arrives.

### Spark path (the J)

Drawn in the page's existing `frame()` loop, after the clusters, with
`globalCompositeOperation = 'lighter'` and the `FLY` sprite. It is not a
new element. It is one extra light in the canvas that is already there.

- `P0` = centre of the plus button (from `getBoundingClientRect`).
- `P3` = the Birth spot `(W/2, H*.36)`.
- `dx = P3.x - P0.x`, `dy = P3.y - P0.y` (dy is negative, so it rises).
- Cubic Bézier: `C1 = (P0.x + .10*dx, P0.y + 14)` gives the small dip at the
  bottom of the J. `C2 = (P3.x - .35*dx, P3.y - .25*dy)` gives the soft curl
  into the spot.
- `k = clamp((t - t0 - 60) / 420, 0, 1)`, position `= bezier(inOutQuad(k))`,
  `b = .38 + .62 * outQuad(k)`, size `= 18 + 12*b`, alpha `= .14 + .8*b`.
  These are the page's own flash formulas, held at the rising side, so the
  spark reaches full brightness on arrival.
- No trail, no particles.

### Arrival on `/new`

- **No white flash, ever:** `new-agent.html` sets the same background on
  **both** `html` and `body`. That means `html { background: #0B1410 }`,
  plus the body radial gradient copied from the original.
- Handoff: just before navigating, the home writes
  `sessionStorage['glade.call'] = JSON.stringify({ t: Date.now() })`.
  `/new` reads it, deletes it right away, and plays the arrival only if
  it is younger than 2000 ms. Direct visits, reloads and Back/Forward
  show the plain blank page.
- **The call fades:** at the Birth spot `(W/2, H*.36)` one `FLY` light starts
  at its peak (size 30, alpha .94). It falls with the real flash fall,
  `b = 1 - x²` over **900 ms**, with size `18+12b` and alpha `.14+.8b`. Then it
  goes from alpha .14 to 0 over **600 ms** (`inQuad`). Total 1500 ms.
  Nothing waits for it, and the page is usable at once. Draw it on the
  canvas `/new` already has. If Jony's `/new` has no canvas, the Fireflies
  background must still be one element (`canvas#field`, as in the
  original), not an extra one.
- If `/new` also shows ambient fireflies: the canvas starts at `opacity .35`
  and comes back to 1 over 600 ms (`outQuad`), starting at 200 ms. The
  glade wakes up after the call.
- Nothing else appears. Blank should read as "fresh", not "broken".

### Edge rules (these keep the moment honest)

- **Second press, Enter, Space or Esc during the 480 ms:** skip and navigate
  right away (B13, "skippable in feel"). Never play it twice.
- **Modifier clicks** (⌘/Ctrl/Shift/middle-click): no motion, browser
  default. Make the plus a real link, `<a href="/new" aria-label="New agent">`,
  so this works natively. Only a plain primary click is intercepted.
- **Keyboard:** Enter on the focused plus plays the same motion. Focus ring
  as in the original (`2px solid var(--fly)`).
- **Back button (bfcache):** on `pageshow` with `event.persisted`, cancel all
  running animations (`document.getAnimations().forEach(a => a.cancel())`),
  clear the spark, remove the leaving state and unlock the plus. Home
  must look exactly as before the press.
- **Nothing is saved** by the plus or the transition (W1).
- **Label:** `New agent` (already on the team word list, §6 of
  `2026-11-25 FULL-UX - OPEN/magic-merlin.md`). It goes in `aria-label`
  and `title`, and no visible text is added.
- **Sound:** none. The home has no sound switch, and we add no elements.

### Reduced motion (`prefers-reduced-motion: reduce`)

Use the page's existing `reduced` flag, which follows live changes too.

- The click navigates **at once (0 ms)**. No spark, no fades, no canvas dim.
- The plus may show its lit colour as an instant pressed state, with no
  transition.
- `/new`: no arrival light. Home doesn't write the `glade.call` flag, and
  `/new` ignores it under reduced motion anyway. The page is simply there
  on the same background.
- This matches the original: under reduced motion the glade's lights
  hold still and Birth shows its end state at once.

## 3. Other small touches (optional, keep tiny)

The list is for reading and aiming (W2). Each of these is optional. If any
of them makes text harder to read or moves something under the mouse,
drop it.

| Touch | Spec | Weight | Keep? |
|---|---|---|---|
| **List appears** | The whole list container goes from `opacity` 0 → 1 in **160 ms**, `outQuad`, once, on first render. No stagger, no translate. Rows are clickable from frame one. Reduced motion: none | tiny CSS | optional |
| **Filtering** | **No motion.** Rows appear and disappear instantly on every letter. A fade here would leave ghost rows under the mouse | — | rule |
| **Plus at rest / hover** | Hover or focus: glyph colour `--quiet` → `--fly` in **120 ms** `outQuad`. "A light, ready." No idle pulse | tiny CSS | optional |
| **Row hover** | Plain design (Jony's call). If the home still draws one cluster per agent, keep the original `world.notice(a)` on `pointerenter`/`focus` **unchanged**, with its 700 ms rate limit | reuse | only if already there |
| **Empty and no-match states** | No magic, per the team rule (no magic on errors/empty). Plain quiet line only | — | rule |

## 4. Backup (if the spark is too much in testing)

**"The hush" only:** keep steps 1–4 and 6, skip the spark (5), and
navigate at **280 ms**. On `/new`, no arrival light; the canvas
comes back from .35 → 1 over 600 ms. It's lighter and still belongs to the
world: the glade goes quiet, the new page wakes.

## 5. Ideas considered and cut

1. **Wash flash on navigate** (the `#wash` from Birth). Cut: it's Birth's
   signature. Using it here would say "something was created" (W1) and
   wear out the real moment.
2. **All fireflies swarm to the plus.** Cut: it changes the firefly movement
   (not allowed), it's heavy, and it's too much for a frequent action.
3. **An answering flash on `/new` about 2 s later** (the female's reply).
   Kept for later: it belongs to the future `/new` and Birth, when
   there's an agent to answer. On a blank page it would promise
   something that isn't there.
4. **A dim resting light that stays on `/new`.** Cut: it doesn't show on
   direct visits, so it would look like a dead pixel.
5. **A soft "thum" or chirp sound.** Cut: there's no sound switch on the
   home, and we add no elements.
6. **The plus rotates into ×.** Cut: generic, and × means "close".
7. **Zoom into the plus / iris wipe.** Cut: template motion, slower, and it
   means nothing here.
8. **A spark trail.** Cut: decoration, and a real J is seen, not drawn.
9. **Staggered row entrance.** Cut: rows move while you aim (W2).
10. **Rows fade or collapse while filtering.** Cut: ghost rows and jumps (W2).
11. **Matched letters glow in fly colour.** Cut: it makes reading harder and
    is decoration on search.
12. **Idle pulse on the plus when there are 0 agents.** Cut: it nags, and the
    quiet empty line already points there.
13. **A single firefly sitting in the empty list.** Cut: magic on an empty
    state, and it could read as "loading".
14. **The tab title animates ("…") during the transition.** Cut: meaningless.
15. **Cross-document View Transitions API.** Cut: not needed when the
    backgrounds match, and support varies in desktop WebViews.
16. **The spark grows into a cluster on arrival.** Cut: that is the Birth,
    and nothing was made.

## 6. Hand-off

- **Jony (build):** everything in §2, in `agent-home.html` and
  `new-agent.html`. The spark is drawn in the existing canvas loop. Fades
  use WAAPI or CSS classes with the curves above. Use the `reduced` flag,
  the `sessionStorage['glade.call']` handoff, the bfcache reset, and the
  link-based plus. §3 touches are optional. Leave `glade-fireflies.html`
  untouched.
- **Eraser (check):** plus to `/new` in ≤ 500 ms, and no white flash between
  pages. A second press skips. ⌘-click opens a new tab with no motion.
  Back restores the home exactly. Reduced motion navigates instantly with
  no light. Filtering has no motion. The firefly movement is unchanged.
