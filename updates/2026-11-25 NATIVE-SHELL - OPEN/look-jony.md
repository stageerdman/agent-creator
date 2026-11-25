# NATIVE-SHELL look: do the six blocks still look the same?

*Jony, 2026-11-25. Baseline: `blocks-jony.md` and `design-jony-block-A.md` to
`-F.md` in `updates/2026-11-25 FULL-UX - OPEN/`, plus `app.css` / `magic.css`.
Flow findings are in `walk-columbo.md` (NF-1, NF-2), and I don't log them
again here. For Eraser (sign-off).*

## How I looked

- **Engines side by side.** I captured the same key screens in **WebKit** (the
  engine behind the app's WKWebView) and in **Chromium** (the old Chrome
  `--app` build). Both ran against a fresh server, at 1200 × 832 in light
  mode and at 800 × 832 (narrow) in dark mode. I took 13 screens per run:
  Home, A2 door, the C15 drop overlay (fired from inside the page), B1 laid
  out, B3 studying, D talk, D3 Where from, C1 What Rex knows, E4 face sheet,
  E5 Palette, F1 Export, F2 clash and the A3 delete sheet. I compared them in
  pairs. I also read computed styles (fonts, radii, shadows, `--line`,
  `--raised`, CSS support) and tested where Tab lands.
- **Shell chrome.** I checked the title bar, window size and background
  against `src-tauri/src/main.rs` and `tauri.conf.json`.
- **Limit (same as Columbo's).** I can't take screenshots of the native
  window itself. I assume Playwright's WebKit on this Mac draws page content
  the way WKWebView does, because both use the same system WebKit, CoreText
  and fonts. Anything the shell adds around the page I checked from the code.

Marks: **same** = looks as designed and as before · **changed** = looks
different from before, still usable · **broken** = can't be seen or reached.

## Shared across all blocks

| Element | Mark | Note |
|---|---|---|
| Font: `system-ui` 15 px body, 17 px / 600 title | same | Same computed family, sizes and weights. SF Pro in both. Some lines sit 1 px higher in WebKit, which you can't see. |
| Corner radii (cards 16 px, sheets, pills, composer) | same | Identical computed values. |
| Shadows | same | Cards have none in either engine. The sheet shadow looks the same. |
| Blur / backdrop | same | `app.css` and `magic.css` use no `backdrop-filter`. The sheet scrim is a flat tint in both. |
| `--line` / `--raised` (`color-mix`) | same | Works in this WebKit. See NV-4 for older macOS. |
| Light colors, accent `#2d6cdf`, warm and error text | same | Matched pixel for pixel. |
| Dark colors | **changed** | NV-3: the page `Canvas` is `#1e1e1e` in WebKit and was `#121212` in Chrome. Cards and the segmented control get a little lighter too. |
| Close mark `✕` (sheets, C7 / D3 passage, D5 fix panel, E5 Palette) | **changed** | NV-2: the glyph comes from a different fallback font and is drawn about half as large. |
| Focus rings (`:focus-visible` 2 px accent) | **broken** for Tab | NV-1: the ring itself draws the same, but Tab never reaches a button, so keyboard users don't see it. |
| Scrollbars | same | Both use the macOS overlay scrollbars. There are no custom scrollbars. |
| Motion (`magic.css`) and reduced motion | same (code) | Keyframes and timings are plain CSS that WebKit supports. `prefers-reduced-motion` is read from macOS in both. I didn't time it on screen. |
| Emoji / faces (SVG avatars, `↑`, `+`, `▸`) | same | Identical. |
| Window title bar | same (code) | Standard macOS title bar with `Agent Creator`, then the page's own 52 px top bar. Chrome `--app` also had a title bar above the page. `document.title` is `Agent Creator` in both. |
| Top padding / first-screen spacing | same | The top bar is 52 px, the grid starts at the same y, and the card positions match. |
| Window background before first paint | changed? (code, not seen) | NV-5: no window background color is set. |
| Narrow layout (< 860 px) | same when drawn | At 800 px the one switch `[ Chat \| Sketch \| What Rex knows ]` draws correctly in WebKit (light and dark). The window can't get that narrow: NF-2. |

## Block A: Home, first run, delete, launch

| Element (design doc) | Mark | Note |
|---|---|---|
| A1 Home grid of cards, face, name, line, `Last:` | same | Pixel match. |
| A1 `new here` in warm text | same | |
| A1 `+ New agent` dashed card, `one line, or drop a folder` | same | |
| A1 Sketches rows, dashed face circles | same | |
| A1 keyboard: "Tab order: cards → sketch rows → New agent" | **broken** | NV-1. Arrow keys between cards still work (the page handles them). |
| A2 `Who should this agent be? One line is enough.` with the three examples | same | |
| A2 door `Or bring their references`, dashed | same | Its drop highlight can't be triggered from Finder (NF-1). |
| A2 composer focused with accent ring | same | Focus is set by script, so the ring shows. |
| C15 overlay `Drop · your files stay on this Mac` (dashed accent, tint) | same when drawn | Fired from inside the page, it draws identically. From Finder it never shows (NF-1). |
| A3 delete sheet: error-colored `Delete`, `Cancel` default focus | same | "Return = Cancel; the user must click or Tab to delete": in WebKit, Tab doesn't reach `Delete`, so only a click deletes (NV-1). |

## Block B: bring references, lay out, study

| Element | Mark | Note |
|---|---|---|
| B1 references bubble `References · Ines Duarte – The Quiet Deal / 312 files · 38.4 GB` | same | |
| B1 Sketcher text and `Set aside` | same | |
| B3 study header `Studying · … · 0 of 298`, `Stop` link, stand-in strip | same | Strip colors and radius match. |
| Sketch fields (placeholder `Appears after your first message`) | same | |
| Disabled `Keep` (pale accent outline) | same | |
| Door drop / folder drop look | n/a | NF-1 |

## Block C: What [Name] knows

| Element | Mark | Note |
|---|---|---|
| `Only you see this. Rex doesn't.` first line | same | |
| Map rows: level word (Sharp green, Rough warm, Blank muted), topic, `N refs ▸` | same | Rows are about 1 px shorter in WebKit (font metrics). You can't see it. |
| `Add a reference for this` links | same | |
| Likeness `✓` / `–` with source links | same | |
| Segmented `Sketch \| What Rex knows` | same (light), changed (dark) | NV-3 |
| C7 passage `✕` | changed | NV-2 |

## Block D: Talk

| Element | Mark | Note |
|---|---|---|
| User bubbles (accent, white text, radius) | same | |
| Agent lines with face, `Rex's own view · no reference` | same | |
| `Where from ·` link and `Not Rex` underline | same | |
| D3 passage panel `Used in this answer`, quote bar, `<mark>` highlight | same | The highlight was `<mark>` before too, so it isn't a regression. |
| D3 / D5 panel close `✕` | **changed** | NV-2: drawn about 7 px instead of about 12 px. |
| Past talks list, search field, selected row | same | |
| Composer with round send button | same | |

## Block E: grow, remove, face, palette

| Element | Mark | Note |
|---|---|---|
| E4 `Rex's face` sheet: three faces, accent ring on the chosen one | same | The two drawn faces show as dark blobs in **both** engines. This was already like this, so I don't log it as a regression. |
| E4 `Draw three more · Use a photo…`, dashed `or drop a photo here` | same | Dropping is NF-1. |
| E4 `Cancel` / disabled `Use` | same | |
| E5 Palette header `Palette · what Rex is mixed from · 186 references, 4 traits  ✕` | **changed** | NV-2 (`✕`). |
| E5 mix strip and `stand-in look` | same | |
| E5 trait radios (5 dots, accent fill) | same | Native radios look the same in both. |
| E2 / E3 marks (`was Blank`, `was Sharp · now Rough`, Undo) | same (from Columbo's walk shots) | No WebKit-only CSS involved. |

## Block F: export, import

| Element | Mark | Note |
|---|---|---|
| F1 Export sheet: face, `Packed` table, `Stays here`, `One file: …`, `Desktop · Change…` | same | |
| F1 `Cancel` / `Export` primary | same | |
| F2 clash sheet `You already have Marcus.` | same | |
| F2 drag `.agent.zip` overlay `Drop · import this agent` | n/a | NF-1 |
| Sheet scrim and white sheet, 16 px radius | same | |
| Sheet buttons reachable by Tab | **broken** | NV-1 |

## Visual regressions

- **NV-1 · A, D, E, F (every screen) · Focus rings / keyboard · high.**
  Design: "Arrow keys move between cards; Return opens. Tab order: cards →
  sketch rows → New agent" (design-jony-block-A.md, Accessibility). Also
  "`Cancel` has default focus (Return = Cancel; the user must click or Tab
  to delete)" (A3). And `app.css`: `:focus-visible { outline: 2px solid
  var(--accent) }`.
  Now: in WebKit, Tab skips every `<button>`. From Home, six Tab presses
  never left `<body>`. In Chromium they moved card → `Last:` → card…, each
  with the 2 px accent ring. Only text fields get Tab focus. WKWebView
  follows the macOS setting *Keyboard navigation* (off by default), like
  Safari's "Press Tab to highlight each item". So by default a keyboard-only
  user can't reach the mode switch, cards, sheet buttons, `Delete`, `Keep`
  or `✕`. Arrow keys on Home and Esc still work, because the page handles
  them.
  Possible fix (for Uncle Bob to check): turn on `tabsToLinks` / full
  keyboard access in the WKWebView config, if wry exposes it, or have the
  page handle Tab itself for its own controls.
- **NV-2 · C, D, E (sheets, C7 / D3 passage, D5 fix panel, E5 Palette) ·
  close mark `✕` · low.**
  Design: `Palette · what Rex is mixed from · 186 references, 4 traits ✕`
  (block E). "`✕` / Esc → Past talks" (block D).
  Now: `✕` (U+2715) isn't in SF. WebKit draws it with a different fallback
  font than Chrome, at about 7 px instead of about 12 px, a small light ×
  in a 32 px button. The button target hasn't changed, but the mark is
  easy to miss, especially at `--muted` opacity.
  Possible fix: an inline SVG cross or a font that has the glyph.
- **NV-3 · all blocks, dark mode · page and surface tone · low.**
  Design: `app.css` builds every surface from `Canvas`
  (`--raised: color-mix(in srgb, currentcolor 3%, Canvas)`). Block C: "the
  60% text is checked ≥ 4.5:1 on the C8 surface in light and dark."
  Now: WebKit's dark `Canvas` is `#1e1e1e`, where Chrome's was `#121212`.
  Every dark surface is one step lighter (cards `#252525` instead of
  `#191919`), and the selected segment stands out less from its track.
  Contrast still passes: 70% white on `#252525` is well above 4.5:1. It
  now matches native macOS dark windows, so I'd keep it. I'm logging it
  only so the sign-off knows it changed.
- **NV-4 · all blocks · borders, raised surfaces, narrow query on macOS
  12–13 with an old Safari · medium (not seen, code).**
  Design: hairlines `--line` and raised cards `--raised` on every screen,
  and the narrow one-switch layout at `width < 860px`.
  Now: the app's floor is macOS 12 (`minimumSystemVersion`). The window
  uses the *system* WebKit, which only updates with Safari. `color-mix()`
  needs Safari 16.2 and the `(width < 860px)` range syntax needs 16.4.
  On an un-updated Monterey or Ventura, every border and raised card fill
  disappears, and `isNarrow()` (`app.js:758`) is never true. Chrome brought
  its own engine, so this never happened before. On this Mac (current
  WebKit) everything renders. Possible fix: raise `minimumSystemVersion`
  to 13.3, or add plain `rgba` fallbacks and a `max-width` query.
- **NV-5 · launch (A4) · window background · low (code, not seen).**
  Design: launch goes straight to Home (A4). Nothing should flash.
  Now: `main.rs` sets no window background color, so in dark mode the
  window may show white for a moment before the page paints. Chrome
  `--app` painted its own dark background first.
  Possible fix: set the window background to the theme color.

Not logged again, but they also change the look: **NF-1** (no door
highlight, no C15 / import overlay from Finder) and **NF-2** (the narrow
layout can't be reached). Both draw correctly when triggered.
