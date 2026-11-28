# LAUNCH-GLASS: what Jony changed, for Eraser's check

Builds on `Reports/launch-and-glass.md` (Columbo). Journey steps UJ1 · open the app, UJ2 · 3 the Sketcher chat.

## User goal
Open the app and see one calm, final background from the first frame, the same on every screen.
Read the Sketcher chat easily while clearly seeing the likeness through it.

## One background
- **New:** `src/server/public/app-background.css`, the only place the screen background lives:
  `:root { --field: #0B1410; }` and `html { background: var(--field); }`. Served at `/app-background.css`
  (route in `src/server/app.mjs`).
- `agent-home.html`, `agent-page.html`, `new-agent.html` link it as the first thing in `<head>`, before
  their own `<style>` (a blocking stylesheet, so the first paint already has it).
- **Removed** from all three: their own `--field`/`--shadow` tokens, `html { background }`, the
  `html.glass` see-through override, and the `body` radial vignette.
- **Why the vignette went:** a native window can only paint one flat colour. With a vignette, the corners
  would still step from `#0B1410` to `#060B08` when the page paints. Flat means native colour = first
  paint = after scripts, exactly. It also ends the `height`/`min-height` edge jump between pages.
- **Mac window (Uncle Bob's task, his branch):** no `.transparent`, no vibrancy (`.effects`), no
  `GLASS_PAGE` init script, and `.background_color(Color(11, 20, 16, 255))`, the same `#0B1410`.
  `macOSPrivateApi` goes too. Until his commit is merged, the Mac app still has the old glass window.

## Only one glass
- `backdrop-filter` is now on `#sketcher` only. Removed it from the home search field
  (`agent-home.html .find input`) and the Talk box (`agent-page.html #talk-box`). On a solid page
  they blurred nothing. The Talk box is now solid `var(--field)`, so page text scrolling under it
  never shows through.
- The look-alikes listed in the report (`#menu`, `#sheet::backdrop`, the home rows' hover fill) are
  translucent fills on a solid page. They are not glass, and I left them alone.

## The glass chat (`new-agent.html`, `#sketcher`)
- Fill **.36 → .16**, blur **24 → 32px**, saturate **1.3 → 1.6** (the colour behind lifts it).
- Thin light edge: border `.08 → .12` plus an inset 1px top highlight `rgba(255,255,255,.16)`.
- Kept as they were: the .92 fallback without backdrop-filter, the .94 Reduce Transparency fill, no fill
  on `#sketcher-log`, each message's own `--ink` glass (.72), the box at .70, no shine behind Create,
  the send dot landing in the new message.
- Contrast, worst case (a fully lit lime dot right behind, ignoring the blur): message text #E8EFE0 on
  ink over the .16 glass is about **9:1**, and the dim "Sketching…" line (.72) is about **5.3:1**. Both
  pass AA. The title "Sketcher" sits on the clear glass, so it gets a soft dark text shadow.

## Tests (`src/server/app.test.mjs`)
- "every screen uses the one shared background token, and nothing else sets it"
- "only the Sketcher chat uses backdrop-filter, and it is clearly see-through" (fill ≤ .20, blur ≥ 24px)
- The full suite: 411 tests, 409 pass, 0 fail, 2 skipped.

## What to look at in the real window
Three cold opens, then switch home → agent → /new and back: the colour should never change. Then open the
chat over a lit likeness and check for a soft glow behind it, a visible edge, and words that read easily.
If the glass looks like "a dirty window", raise the blur before you raise the fill.
