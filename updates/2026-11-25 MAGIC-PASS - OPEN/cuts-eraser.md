# Eraser: cuts (MAGIC-PASS)

What I reviewed: the `src/server/public/` diff from `30ff7be` to `230e2db`
(Jony's five commits) and `build-notes-jony.md`, checked against
`magic-merlin.md`, `principles/magic-ux/design-rules.md` and
`world-and-words.md`.

## Goal

The person describes someone in one line, sees the portrait form, keeps
it and says hello. The magic should point where the next step is and
never add a step or a second way to do something.

## Step count: the creation arc (as built)

| # | Step | Mark | Why |
|---|---|---|---|
| 1 | Type one line (or pick a chip), Enter | Keep | the one thing only they can give |
| 2 | Watch Instructions form in DNA (opens there by itself) | Keep | Automated: Q1 removed the "open DNA" click |
| 3 | Read the name in the top bar | Keep | no action, just reading |
| 4 | Press **Keep** | Keep | consent: it makes the agent theirs |
| 5 | Press **Talk** (the tab beckons; no new button) | Keep | one way to Talk |
| 6 | Type hello, Enter | Keep | the meeting |

**Count: 6, target 6.** The arc adds no step. The beckon is a `::after`
on the existing `#mode-talk` tab with `pointer-events: none`, so it is not
a button. Home drop with no words (D2): drop, type one line, then the same
arc, so 7 steps, and that is the minimum.

## What passes

- Every new animation has a still form in the reduced-motion list
  (`magic.css`), and the name arrival and first-sketch timer check
  `reducedMotion()` in JS too. The first-sketch still form (2 px bar for
  2 s) is there.
- Removing the demo **(Demo) First words would be here.** line is right
  (W2). The real-agent mark stays dormant until Talk is real, which is
  honest.
- The old narrow-view `.dot` and the `aria-label="Sketch, updated"` path
  were fully replaced by `.switch-dot` (one way to say "changed over
  there"). `outlineFace` and the palette bloom are gone with no leftovers.
- Words: **First sketch**, **Say hello**, **from what you said**, **new**
  and **Already in [Name]'s DNA** don't clash with the settled list.
  "Talk to [Name]…" after the first message and "Say hello to [Name]…"
  before it is one composer with two moments, not two ways. (Columbo adds
  them to the FULL-UX word list, Merlin §9.)
- Screen readers (Jony's open point 5): no dedicated live line is needed.
  The change line, Keep card and toast are already polite. The Home
  **Ready** mark gets read when the person reaches the card, and a live
  announcement on Home would talk over their navigation. Skip accepted.

## Cuts (Jony applies)

### X1 · `magic.css`: the second `@keyframes magic-card-settle` overrides the Keep card's
- **Change:** delete the new `@keyframes magic-card-settle` (the one in
  the MAGIC-PASS section, `translateY(4px)`). Point `.card.just-kept` at
  the existing `magic-arrive` (`animation: magic-arrive 250ms ease-out both`).
- **Why:** two keyframes share a name, so the later one wins everywhere.
  The Keep card (`.agent-born .keep-card`) used to settle *down from
  above* (−8 px) and now rises from below. That's a quiet regression of
  the Keep moment, plus a duplicate.

### X2 · `magic.css`: two more keyframes that already exist
- **Change:** delete `@keyframes magic-fade` and use `magic-fade-in` for
  `.divider.first-words` and `#empty.is-leaving` (keep `reverse`). Delete
  `@keyframes magic-toast-rise` and use `magic-arrive` for `.toast`.
- **Why:** they're the same keyframes under new names. One motion should
  have one name, so the next person doesn't have to compare them.

### X3 · The **Palette** menu item and the E5 Palette view: a second home and a second way to change the agent
- **Change:** remove the `Palette` item (`block-a.js` `hooks.menu`) and
  the whole E5 Palette view in `block-e.js` (`paletteHost`, `openPalette`,
  `closePalette`, `paletteOpen`, `renderPalette`, `mix`, `TRAIT_COLOURS`,
  `setTrait` and the trait re-sketch path, plus `escape` if it only closes
  the palette). Remove the callers too: `E.closePalette()` in
  `block-b.js afterLoad`, `E.escape()` in `block-a.js` keydown, and the
  `paletteOf` re-render. Remove the now-unused CSS in `app.css`:
  `.palette-view`, `.palette-head`, `.palette-mix`, `.palette-names`,
  `.traits`, `.trait-*`, `.step .dot` rules (if nothing else uses them).
  **Keep** `paletteStrip`, `.palette-band` and `.stand-in`, because the
  study progress in `block-b.js` still uses them. Update or drop any test
  that opens the Palette.
- **Why:** DNA is the one home for "what it's made of" (Merlin §6, W3,
  SKETCH-REWORK). The Palette shows it a second time, and its trait radios
  rewrite the Instructions, which is a third way to change the agent next
  to the Sketcher chat and **Not [Name]**. It's also demo-only (`!a.real`),
  so real agents never see it: dead UI for the real product.

### X4 · `components.js toast()`: no motion on error toasts
- **Change:** give error toasts a class (`toast(text, action, { error: true })`
  → `class: "toast is-error"`) and let only `.toast:not(.is-error)` rise.
  There are two call sites: `Couldn't read the drop` (`components.js`) and
  `Couldn't add the files` (`block-c.js`).
- **Why:** errors stay still (E1, "no magic on errors"). The banner
  appears at once with no slide, and an error toast should do the same.
  The receipt keeps its rise.

### X5 · `app.js firstSketch`: a click has to win at once (W10)
- **Change:** while the 550 ms name timer is pending, any `pointerdown`
  or `keydown` should call `arrive()` at once, with no motion (one
  `{ once: true }` listener, removed when the timer fires).
- **Why:** Merlin §3 beat 3 and §8 say "if the user clicks anything, show
  it at once". Right now the top bar shows **New agent** for half a
  second even if they've already moved on.

### X6 · Leftovers (tidy, two lines)
- `app.css`: delete `.talk-views .dot { … }`, because nothing creates a
  `.dot` in the Talk views. It's the twin of the rule Jony already removed
  for `.views`.
- `app.js`: `addChangeLine` still has an inline
  `matchMedia("(prefers-reduced-motion: reduce)")`. Move `const
  reducedMotion` above it and use it, so there's one way to ask.
- `index.html`: the stray space in `aria-controls="sketch" >` on
  `#view-sketch`.

## Verdict

**RETURNED: 6 cuts.** The step count is lean (6 of 6) and nothing adds a
step. The cuts are clutter: a keyframe clash that changed the Keep moment,
duplicate motion names, a second home for the DNA with its own editing
controls, motion on errors, a click that doesn't win, and three leftover
lines. Reworking is Jony's. When it's done I check each cut, the tests and
the reinstall, and sign below.
