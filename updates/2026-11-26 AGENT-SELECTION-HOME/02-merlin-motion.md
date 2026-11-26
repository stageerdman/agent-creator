# AGENT-SELECTION-HOME: the fireflies-into-plus transition (Merlin)

Module: `src/server/public/firefly-gather.js`. Tests:
`src/server/public/firefly-gather.test.mjs`.

## What the moment means

Pressing plus is the start of something new (Columbo, B5: "the screen became
the new agent"). So the motion has one clear direction: **the plus calls, and
the whole screen answers.** The call spreads out from the plus. Each part of
the page it reaches (names, descriptions, ages, constellations, the search)
lights up as fireflies. Then they all fly in and become the plus. The plus
glows once: *this is where your new agent begins.* Then `/new` opens on the
same dark field.

This follows the real fireflies in our world. They answer a light, and they
gather. Nothing breaks or explodes, and nothing scatters with no direction.
That would read as a crash (W5).

## Timeline (default 1200 ms, every step scales with `durationMs`)

```
0 ms      press ── the call spreads out from the plus
36–300    parts light up as fireflies (near ones first, far ones last),
          each with the real flash() rise; a breath of lift
50–390    the real UI fades out under them (ease-in, 340 ms)
~120–1030 the fireflies fly on soft curves into the plus centre;
          all curves bend the same way, so the streams swirl in together
620–1030  arrivals: each firefly shrinks and dims as it is drawn in;
          the light at the plus grows with every arrival
960–1200  the plus answers: a quick glow and a 1.08 scale pulse,
          fully gone by the end (no pop when the overlay is removed)
1200      the promise resolves → the caller goes to /new
```

How it feels: a short intake of breath (the lift), one smooth pull (the
flight), and a soft "yes" (the glow). The middle part moves fastest, and the
start and end are gentle. Near fireflies arrive first and far ones last, so
the end is a stream, not one hard stop.

## The look (kept from `glade-fireflies.html`)

- The same sprites: `FLY` (#D8F26A, core #F6FFD6) and `WARM` (#C4E860) for
  every third firefly, drawn with additive (`lighter`) blending.
- The same `flash()` curve: a 120 ms rise and a 900 ms fall.
- No new colours and no new shapes. The glow on the plus uses the same fly
  green.

## Rules it keeps

- **Never blocks navigation.** If anything throws, the promise resolves at
  once. If frames stop (a hidden tab or a busy thread), a timer resolves it
  at `durationMs + 250`.
- **One run at a time.** A second call while it runs returns the same
  promise. No second canvas, no added time. `isGathering()` is true during
  the run.
- **Reduced motion:** the UI fades out in 160 ms. No fireflies, no canvas,
  no pulse.
- **Light to run.** At most 400 fireflies (`MAX_FLIES`). Only the visible
  part of the window is sampled, so 50 rows cost no more than 12. Finding the
  points takes about 1 ms. Measured in WebKit with 50 rows at 1280×820:
  1206–1217 ms total, slowest frame 18–21 ms, over 5 runs.
- **Its own canvas.** It is full-screen, `pointer-events: none` and
  `aria-hidden`, and it is removed at the end.
- **Back works.** The faded UI stays faded until the page changes, so nothing
  flashes back. If the home comes back from the back/forward cache
  (`pageshow`, `persisted`), the fade is undone and the home is exactly as it
  was.

## For Jony (wiring)

```js
import { gatherToPlus, isGathering } from '/firefly-gather.js';
plus.addEventListener('click', async e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // new tab: no motion
  e.preventDefault();
  if (isGathering()) return;            // second press: ignored
  await gatherToPlus(rootEl, plus);     // resolves even on error
  location.href = '/new';
});
```

- `rootEl` must hold everything that should dissolve. The constellations
  count only if their canvases are inside it. A **full-screen backdrop
  canvas** (larger than 40% of the window) is not sampled, since its pixels
  are not "parts". If constellations are drawn on one big canvas, pass their
  lights as `options.points: [{ x, y }, …]` (client coordinates). They are
  used first, up to half the cap. Also fade or include that canvas yourself.
- Don't put the plus inside `rootEl`. It must stay visible, because it is
  where the fireflies land.
- Esc to skip is optional. If you want it, go to `/new` straight away.
  Leaving the page stops the animation.

## Small ideas considered and cut

- Sound (a soft rising hush): cut. The home has no sound switch, and an
  unasked sound on a frequent action is noise.
- Trails behind each firefly: cut. They cost frames with 400 fireflies, and
  the wobble already gives life.
- Reading the real lit pixels of each constellation canvas: cut.
  `getImageData` on 50 canvases can stall the GPU in WebKit. A soft disc
  sample looks the same at this speed.
- A white "wash" flash at the end, like Birth: cut. It is too big for a
  frequent action, and it looks like a white flash before `/new` (W5).
- The fireflies staying as a cluster on `/new`: out of scope (that page is
  another item). It would be a nice follow-up: `/new` could start with a
  small glow where the plus was.
