# NATIVE-SHELL: fix list for Uncle Bob

*Eraser, 2026-11-25. Merged from `walk-columbo.md` (NF items) and
`look-jony.md` (NV items). The "before" record is `signoff-eraser.md` and
`cuts-eraser.md` in `updates/2026-11-25 FULL-UX - OPEN/` (the Chrome
`--app` build, signed off).*

**7 items: 2 high, 2 medium, 3 low.** High first. The IDs are the ones the
walk and the look check used, so you can find more detail there. The
"possible fix" lines come from Columbo and Jony. They're hints, not specs:
the fix is yours.

## What I merged and dropped

- **Merged:** Jony's "no door highlight / no C15 or import overlay from
  Finder" is NF-1, so it's one item. Jony's "narrow layout can't be
  reached" is NF-2, also one item. NV-4's narrow-query part is a different
  cause (old WebKit can't read the query), so it stays a separate item,
  but fixing NF-2 alone won't fix it.
- **Dropped (already like this before the move):** the E4 drawn faces
  showing as dark blobs (same in both engines), and the D3 `<mark>`
  highlight (it was `<mark>` before too).
- **Dropped (no visible change):** the 1 px line-height and row-height
  differences in WebKit.
- **Not on the list, but not seen by hand:** ⌘C/⌘V (walk rows 13, 28), the
  page shortcuts ⌘1 ⌘2 ⌘↑ ⌘F ⌘E ⌘⇧I ⌘N ⌘⇧N (row 48), and reduced
  motion / light-dark (row 49). The code says they're the same as before.
  I'll check them by hand on the re-check, along with the items below.
- **Closed from the old sign-off:** the FULL-UX gap "the window launch was
  never seen". The install check now opens the window on screen, so it's
  done.

## 1. NF-1 · Blocks A, B, E, F · high

**Files dragged from Finder into the window do nothing.**

Steps to reproduce:
1. Open `/Applications/Agent Creator.app`.
2. Go to any drop spot:
   - A2: `+ New agent`, the door `Or bring their references`.
   - B1: `Demo` › `Start UJ2 fresh`, the door.
   - E4: Rex › `Sketcher`, click the face → the face sheet's
     `or drop a photo here`.
   - E1 / X5: Rex › Talk (or Sketcher), anywhere in the window.
   - F2: Home, anywhere in the window.
3. From Finder, drag a file or folder over the spot (E4: a photo, F2: an
   `.agent.zip`), hold it, then let go.

Expected (before): while dragging, the door border turns solid accent and
the C15 overlay shows (`Drop · your files stay on this Mac` /
`Claude reads them to study`, with `for a new agent` on Home or
`adds to Rex Hart` inside an agent; for a `.agent.zip`,
`Drop · import this agent`). On drop: B1 lays the files out, E4 adds the
photo as a choice, E1 opens the Sketcher with the files, and F2 opens the
import sheet.

Actual: no highlight, no overlay, nothing happens on drop. The cursor may
still show a copy badge, so the drop looks accepted. Found by reading the
code (Tauri's own drag-and-drop handler is on, so wry takes the drag and
the page's `dragenter` / `drop` listeners in `components.js:291–300` never
fire). **Please confirm with one real Finder drag first.**

Why high: dropping a folder is 1 step. The click way (door → panel → find
the folder → Open) is 4, and A2 says "Drop a folder", so first run
breaks its own promise. The drop overlay is also where the privacy line
lives (X5).

Possible fix: `.disable_drag_drop_handler()` on the window builder in
`src-tauri/src/main.rs`.

## 2. NV-1 · Blocks A–F (every screen) · high

**Tab never reaches a button.**

Steps to reproduce:
1. Open the app on Home, with System Settings › Keyboard ›
   *Keyboard navigation* off (the macOS default).
2. Press Tab six times.
3. Also: open an agent menu › `Delete …` and press Tab inside the sheet.

Expected (before): Tab moves cards → sketch rows → `New agent`, each with
the 2 px accent focus ring (A1, UJ12). In the delete sheet `Cancel` has
focus, Return = Cancel, and Tab moves to `Delete`. Tab also reaches the
mode switch, `Keep`, sheet buttons and every `✕`.

Actual: focus never leaves `<body>` on Home. Only text fields take Tab
focus. A keyboard-only user can't reach the mode switch, cards, sheet
buttons, `Delete`, `Keep` or `✕`. Arrow keys on Home and Esc still work
because the page handles them. (Seen in WebKit under Playwright; WKWebView
follows the macOS setting the same way.)

Why high: keyboard users lose most of the app. Nothing is lost by
accident (Delete needs a click), but they can't finish a journey.

Possible fix: turn on tab-to-all-controls in the WKWebView config if wry
exposes it, or have the page move Tab between its own controls.

## 3. NF-2 · Narrow layout (X3), Blocks B, C, D, E · medium

**The window can't get narrow enough for the narrow layout.**

Steps to reproduce:
1. Open the app, open Rex › `Sketcher`.
2. Drag the window's right edge to the left as far as it goes.
3. Or put the app in half-screen Split View on a 13" laptop.

Expected (before): below 860 px, Sketcher shows one switch
`[ Chat | Sketch | What Rex knows ]`, and Talk shows `[ Chat | Past talks ]`
(X3, fixed and checked live in the FULL-UX sign-off). The app fits half a
13" screen (about 735 px).

Actual: the window stops at 900 px (`main.rs`:
`.min_inner_size(900.0, 640.0)`), so the narrow layout never shows and the
app can't go into half-screen Split View. The layout itself still draws
right at 800 px (Jony checked it).

Possible fix: a minimum width under 860 px (for example 640).

## 4. NV-4 · Blocks A–F · medium (not seen; from the code)

**On macOS 12–13 with an old Safari, every border and raised card fill
disappears, and the narrow layout never turns on.**

Steps to reproduce:
1. Install the app on macOS 12 or 13 with Safari older than 16.4 (the
   app's floor is `minimumSystemVersion` 12).
2. Open Home, then Rex › `Sketcher` at a narrow width.

Expected (before): hairlines (`--line`) and raised card fills (`--raised`)
on every screen; the narrow switch below 860 px. Chrome brought its own
engine, so the macOS version didn't matter.

Actual: the window uses the system WebKit. `color-mix()` needs Safari 16.2
and the `(width < 860px)` range query needs 16.4, so on an older WebKit the
borders and fills are gone and `isNarrow()` (`app.js:758`) is never true.
Fine on this Mac.

Possible fix: raise `minimumSystemVersion` to 13.3, or add plain `rgba`
fallbacks and a `max-width` query. If you pick the query change, do it in
`isNarrow()` too.

## 5. NV-2 · Blocks C, D, E · low

**The close mark `✕` is drawn about half as large.**

Steps to reproduce:
1. Open Rex › Talk, ask `How do I start a hard conversation?`, click a
   `Where from ·` source (D3). Look at the panel's `✕`.
2. Also: `Not Rex` (D5 fix panel), Rex › What Rex knows › a reference
   (C7), agent menu › `Palette` (E5).

Expected (before): a clear `✕` of about 12 px in its 32 px button.

Actual: about 7 px, light and easy to miss at `--muted`. The button size
is the same. `✕` (U+2715) isn't in SF, and WebKit picks a different
fallback font than Chrome.

Possible fix: an inline SVG cross, or a font that has the glyph.

## 6. NV-3 · Blocks A–F, dark mode · low

**Dark mode is one step lighter.**

Steps to reproduce:
1. Set macOS to Dark.
2. Open the app on Home, then Rex › `Sketcher` (look at the segmented
   switch).

Expected (before): page `#121212`, cards `#191919`.

Actual: page `#1e1e1e`, cards `#252525`, and the selected segment stands
out less from its track. WebKit's dark `Canvas` differs from Chrome's.
Contrast still passes.

Note: Jony would keep the new tone because it matches native macOS dark
windows. That's a design choice, not a fix. Uncle Bob: either pin the old
tone, or wait for Jony to record the new tone as the design. Either one
closes this item.

## 7. NV-5 · Block A (A4 launch) · low (not seen; from the code)

**The window may flash white before the page paints in dark mode.**

Steps to reproduce:
1. Set macOS to Dark.
2. Quit the app, then open it and watch the first moment.

Expected (before): launch goes straight to Home with nothing flashing (A4).
Chrome `--app` painted a dark background first.

Actual: `main.rs` sets no window background color, so a white window may
show for a moment.

Possible fix: set the window background to the theme color.

## How I'll re-check

When you send fixes back, I re-check only the listed items in the
installed app (`/Applications/Agent Creator.app`), then update this file
and `signoff-eraser.md`. NF-1 and NV-1 need a real hand check (a Finder
drag, Tab presses). My sandbox can't send those into a native window, so
please say in your reply who did the hand check and what they saw.
