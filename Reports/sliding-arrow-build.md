# Sliding arrow: build notes (Jony)

Branch `studio/make-one-arrow-that-slides-out-with-the-950a945e`. Commits: b90356c (the arrow), 844dd7b (the check), plus the narrow-screen fix commit that adds this file.

## The cause

The old check said "top 386 both ways", and that was true. But the thing your eye follows is the arrow's **ink**, not the tab's box.

1. **The arrow was a text character (› / ‹).** Text sits on a font baseline, so its ink landed about 1.5px below the middle of the tab. The offset is different in every font: Chrome, WebKit and SF in the Mac app each put it somewhere else.
2. **The mirror shifted it.** The glyph's box isn't symmetric, so flipping it moved the ink about 0.7px inside the tab. The open arrow looked like a different arrow.
3. **The closed arrow looked different after closing.** On every close, focus goes back to the handle, and a `:focus-visible` rule showed the "Open Sketcher" label. So "closed again" didn't look like "closed".
4. **The Mac app runs its own copy of the code.** `scripts/stage-mac-app.mjs` bundles a copy of `src` when the app is built, so an old app keeps the old arrow. Always open it from Start, which rebuilds it.
5. **Found this round:** on narrow screens the open arrow stopped 44px from the right edge (`min-width`), but the tab is 48px wide. Its last 4px ran off the screen.

## What changed

- `src/server/public/new-agent.html`: the arrow is now a drawn 20×20 SVG chevron (path `M9.25 6.5 14.75 12 9.25 17.5`) centred in the 48px tab. Open mirrors it with `scaleX(-1)` around its own centre (`transform-origin: 50% 50%`), so only the direction changes. The label shows on `:hover` only. The keyboard focus ring stays: a 1px lime outline after a keyboard or JS close, not after a mouse click.
- `src/server/public/left-side.js`: there is still ONE `#handle`. It rides the panel's edge with the same transition: 0.28s `cubic-bezier(.2,.8,.2,1)` to open, 0.22s `cubic-bezier(.4,0,1,1)` to close. `edgeX()` now stops it one real tab width (48px, hover label left out) short of the screen edge, so it fits on narrow screens.
- `checks/left-side-check.cjs` step 10, in Chrome and WebKit, at 1200×820 and 390×700:
  - It reads `getBoundingClientRect()` top, bottom and centre Y for the handle and its glyph, plus the arrow's real ink from a 3× screenshot. It does this closed, open and closed again, and all must match within ±0.5px.
  - It samples every frame of the slide: same transition as the panel, the top never changes, and the arrow rides the panel's edge.
  - It also checks: only X changes, aria-expanded false/true/false, width ≥ 44, one arrow and no close button, Esc closes, the 56px right gap on narrow screens, and that the open arrow is entirely on screen.
  - `ARROW_ONLY=<agentId>` runs step 10 by itself.

## Measured (last full run, ALL PASS)

| | handle top / bottom / cy | glyph top / bottom / cy | ink cy in tab (middle = 24) | left |
|---|---|---|---|---|
| Chrome 1200×820: closed, open, closed again | 386 / 434 / 410 every time | 400 / 420 / 410 every time | 24.17, 24.00, 24.17 | 0, 440, 0 |
| WebKit 1200×820: closed, open, closed again | 386 / 434 / 410 every time | 400 / 420 / 410 every time | 24, 24, 24 | 0, 440, 0 |
| Chrome 390×700: closed, open, closed again | 326 / 374 / 350 every time | 340 / 360 / 350 every time | 24, 24, 24 | 0, 342, 0 |
| WebKit 390×700: closed, open, closed again | 326 / 374 / 350 every time | 340 / 360 / 350 every time | 24, 24, 24 | 0, 342, 0 |

- Ink top is 18.67 everywhere. Ink bottom is 29.33 (29.67 for Chrome desktop closed, which is antialiasing).
- Ink centre X is 20 closed and 19.83–20 open, so the flip happens in place.
- During the slide, top stayed fixed at 386 (or 326) across about 49 frames each way. Open, the right edge is 488 on desktop and 390 on narrow, so the whole arrow is on screen.
- `npm test`: 269 pass, 1 skipped, 0 fail.

## Screenshots

`Reports/sliding-arrow/`: `{chrome,webkit}-{desktop,narrow}-closed.png`, `-open.png`, and `-side-by-side.png`. Each side-by-side image has a red hairline through the handle's middle, and both chevrons sit on it.

## Side note for Columbo

On narrow screens the closed tab overlaps the start of the menu's "nothing yet" hint (x 43–48). That's outside this task.
