# NATIVE-SHELL walk: do the six blocks still click the same?

*Columbo, 2026-11-25. Baseline: `journeys-columbo.md` and
`walkthrough-columbo.md` in `updates/2026-11-25 FULL-UX - OPEN/` (the
Chrome `--app` build, which passed the walk 33/33). For Jony (look) and
Eraser (sign-off).*

## How I walked it

1. **Installed app.** `node scripts/check-mac-install.mjs` opened
   `/Applications/Agent Creator.app`. All 9 checks passed: native shell
   process, a 1200×860 window on screen, 6 demo agents served, the only
   child process is `node src/server/main.mjs`, and no Chrome.
2. **Scripted walk in the window's engine.** I ran
   `BROWSER=webkit node scripts/walk-full-ux.mjs http://localhost:3517/`,
   pointed at the server **of the installed app** (port 3517). Result:
   **33/33 ok, no page errors.** No new fails, so no regression in the
   scripted steps.
3. **Hand checks.** My sandbox can't send clicks, keys or file drags into
   a native window, and it can't take screen shots of it (no
   accessibility or screen-recording access). So for the things a native
   WebKit shell changes, I checked what the shell does (`src-tauri/src/main.rs`,
   `tauri.conf.json`, Tauri/wry behaviour) against what the screens need
   (`src/server/public/*.js`). Every hand row below says how it was checked.
   **Assumption:** WebKit under Playwright behaves like the app's WKWebView
   for anything inside the page. It doesn't cover what the shell adds around
   the page: native drag and drop, the window size limits, menus and quitting.
4. **Quit and reopen.** The app closed after the walk (its server on 3517
   was gone). I opened it again with the install check: window back, **6
   demo agents** served.

Marks: **same** = it works as before · **changed** = it works, but not as
before · **broken** = the step can't be done.

## Walk table

| # | Block | Step | Before (Chrome build) | Now (native build) | Mark | How checked |
|---|---|---|---|---|---|---|
| 1 | A | A1 Home: kept cards, `Sketches`, `+ New agent` | shown | shown | same | walk, WebKit |
| 2 | A | A1 Juno card says `new here` | shown | shown | same | walk |
| 3 | A | A2 `+ New agent` → `Who should this agent be?` + the door `Or bring their references` | shown | shown | same | walk |
| 4 | A | A2 composer focused, no ＋ while the door shows (X7) | yes | yes (same page code, focus is set by the page) | same | walk + code |
| 5 | A | A2.3 **drag files over the door**: solid accent border + C15 overlay `Drop · your files stay on this Mac` | overlay showed, door lit up | the page never gets the drag (see NF-1) | **broken** | code: shell + wry |
| 6 | A | A3 delete `Untitled sketch` via the agent menu → sheet `This can't be undone.` → Delete | in-page sheet, worked | in-page sheet, works (no `confirm()` used anywhere) | same | walk |
| 7 | A | A3 delete sheet: `Cancel` has default focus, Return = Cancel | yes | yes (page code, no change) | same | code |
| 8 | A | A4 launch → Home with 6 agents | yes | yes | same | install check |
| 9 | A | Quit, then reopen: 6 demo agents still there | yes | yes, 6 agents after reopening | same | install check, twice |
| 10 | B | B1 `Start UJ2 fresh` → click the door → pick → `312 files · 38.4 GB`, `Set aside · 4` | worked | works | same | walk |
| 11 | B | B1 **drop the Ines folder on the door** from Finder | dropped, laid out | nothing happens (NF-1) | **broken** | code |
| 12 | B | B1 path rule: `~/nowhere` → `Can't find ~/nowhere. Check the path.` | shown | shown | same | walk |
| 13 | B | B1 paste a path into the composer (⌘V) | pasted | should paste: Tauri 2 adds the standard Edit menu (⌘C/⌘V/⌘X/⌘A) on macOS and the shell sets no menu of its own | same (not seen by hand) | code |
| 14 | B | B2 one-sentence correction → `Split: 18 recordings moved`, `Set aside · 14` | shown | shown | same | walk |
| 15 | B | B3 `Start studying` → Study block | shown | shown | same | walk |
| 16 | B | B3 resumed line `Picked up where it left off · 251 of 297` on seeded Ines | shown | shown (the walk sees `Studying ·` or `Picked up…`) | same | walk |
| 17 | B | B4 `Skip time ▸` → `Finished studying` | shown | shown | same | walk |
| 18 | B | B6 Keep → card with the C8 box → `Talk to Ines` | worked | works | same | walk |
| 19 | C | C1 What Rex knows: map, Likeness `8 of 10`, References | shown | shown | same | walk |
| 20 | C | C2 refs expand → passage with `Behind:`, Esc back | worked | works | same | walk |
| 21 | D | D Talk to Rex from Home → `Past talks` | worked | works | same | walk |
| 22 | D | D streaming reply (fetch stream + TextDecoderStream) | streamed | streams, no page errors (WebKit supports it on the app's macOS 12+ floor) | same | walk |
| 23 | D | D3 Where from → passage `Used in this answer`, Esc closes | worked | works | same | walk |
| 24 | D | D5 `Not Rex` → fix panel → reply `from your talk` → ✕ → `Rex was redrawn` | worked | works | same | walk |
| 25 | D | D unknown question → `(Demo) Rex would answer here` | shown | shown | same | walk |
| 26 | D | D search past talks → `No talks with "zzzz"` | shown | shown | same | walk |
| 27 | D | Enter sends, Shift+Enter new line, Esc clears search / closes panel | yes | yes (page key handlers, `isComposing` guard kept) | same | walk + code |
| 28 | D | Copy an answer's text (⌘C) | copied | should copy (standard Edit menu, see row 13) | same (not seen by hand) | code |
| 29 | E | E1 `Add a reference for this` → pick → studying → `Finished studying · 1 reference studied` | worked | works | same | walk |
| 30 | E | E2 `was Blank`, `9 of 10 · was 8`, chat line | shown | shown | same | walk |
| 31 | E | E2 quiz → new talk, typed not sent → `Money Has Rules.pdf · p. 12` | worked | works | same | walk |
| 32 | E | E3 remove `Old seminar 2009.mp4` → `was Sharp · now Rough` → Undo | worked | works | same | walk |
| 33 | E | E3 remove the `Live Q&A` group → Undo | worked | works | same | walk |
| 34 | E | E4 face sheet: Draw three more, pick, Use → `Face: new face` | worked | works | same | walk |
| 35 | E | E4 **drop a photo on the face sheet** (`or drop a photo here`) | dropped | nothing happens (NF-1) | **broken** | code |
| 36 | E | E5 Palette: Directness 4 → 5, Esc back to the switch | worked | works | same | walk |
| 37 | E | E1 / X5 **drop files in Talk or Sketcher** → overlay `adds to Rex Hart` | overlay, then Sketcher | the page never gets the drag (NF-1) | **broken** | code |
| 38 | F | F1 Export Rex: list, `Exported · Rex Hart.agent.zip` | worked | works | same | walk |
| 39 | F | F1 second export → `Rex Hart 2.agent.zip` | shown | shown | same | walk |
| 40 | F | F1 Marcus: `none, only the Sketch` | shown | shown | same | walk |
| 41 | F | F2 `Marcus.agent.zip` (Demo pill) → clash, Replace line, Keep both → `Marcus 2` | worked | works | same | walk |
| 42 | F | F2 `Juno.agent.zip` clashes with the seeded Juno | shown | shown | same | walk |
| 43 | F | F2 `Old coach.agent.zip` → broken + Details | shown | shown | same | walk |
| 44 | F | F2 delete Juno, import `Juno.agent.zip` → `new here` | worked | works | same | walk |
| 45 | F | F2 **drag an `.agent.zip` onto the window** → `Drop · import this agent` | overlay, then the import sheet | nothing happens (NF-1); the Demo pill items still work | **broken** | code |
| 46 | F | F3 first open of Juno → First words `Paste the clause…` | shown | shown | same | walk |
| 47 | X | X3 **narrow window (< 860 px)**: one switch `[ Chat \| Sketch \| What [Name] knows ]`, `[ Chat \| Past talks ]` | reachable by making the window narrow | can't be reached: the window won't go below 900 px wide (NF-2) | **changed** | code: `min_inner_size(900, 640)` |
| 48 | X | Keyboard: ⌘1, ⌘2, ⌘↑, ⌘F, ⌘E, ⌘⇧I, ⌘N, ⌘⇧N | handled by the page | no clash expected: the default Tauri menu uses ⌘Q/⌘W/⌘H/⌘M, Edit keys and ⌃⌘F only | same (not seen by hand) | code |
| 49 | X | Reduced motion, light/dark (`matchMedia`) | followed macOS | follows macOS (WKWebView reads the same settings) | same (not seen by hand; Jony checks the look) | code |

## Reproduce the broken and changed rows

**Rows 5, 11, 35, 37, 45 (NF-1: drops from Finder do nothing)**
1. Open `/Applications/Agent Creator.app`.
2. Rows 5 and 11: `Demo` › `Start UJ2 fresh` (or `+ New agent`). Rows 35 and 37: Rex › `Sketcher`, either in the face sheet or in Talk. Row 45: anywhere.
3. In Finder, drag any file or folder (row 35: a photo; row 45: an
   `.agent.zip`) over the window, hold it over the door or the sheet, then
   let go.
4. Expected (before): the door lights up and the C15 overlay shows
   (`Drop · your files stay on this Mac` / `Claude reads them to study`, or
   `Drop · import this agent`). On drop, the files go in (B1 laid out,
   face choice, or import sheet).
5. Actual (from the code): there's no overlay and no drop. The shell
   leaves Tauri's own drag-and-drop handler on (the default, because
   `main.rs` never calls `disable_drag_drop_handler()`). On macOS, wry
   handles `draggingEntered` and `performDragOperation` itself when that
   handler is on. It returns "handled" and doesn't pass them to WebKit, so
   the page's `dragenter` and `drop` listeners (`components.js:291–300`)
   never fire. The cursor may still show a copy badge, which makes it worse:
   the drop looks accepted, but then nothing happens.
6. **Not seen by hand.** I couldn't drag into the native window from my
   sandbox. Please confirm with one real Finder drag before fixing.

**Row 47 (NF-2: narrow layout can't be reached)**
1. Open the app and drag the window's right edge to the left.
2. Expected (before): below 860 px, Sketcher mode shows one switch
   `[ Chat | Sketch | What [Name] knows ]`, and Talk shows `[ Chat | Past talks ]`.
3. Actual: the window stops at 900 px (`main.rs`:
   `.min_inner_size(900.0, 640.0)`), so `isNarrow()` (`app.js:758`, `width < 860px`)
   is never true. Users of half-screen Split View on a 13" laptop (about 735 px)
   can't put the app there at all.

## Flow regressions

- **NF-1 · A, B, E, F · high** · Dragging files or folders from Finder into
  the native window does nothing: no door highlight, no C15 overlay, no drop,
  and no import from a dragged `.agent.zip`. The click-to-pick ways still work
  (door click, `Add references`, Demo pill), so no journey is fully blocked.
  But A2 says "Drop a folder" and the drop looks accepted, so this breaks the
  first-run promise. Found by reading the code, not by hand. Likely fix:
  `.disable_drag_drop_handler()` on the window builder (Uncle Bob to confirm).
- **NF-2 · X3 (A–F narrow) · medium** · The window can't get narrower than
  900 px, so the narrow one-switch layout (< 860 px) and half-screen Split View
  can't be reached. Likely fix: a minimum width under 860 px (for example 640).

Nothing else regressed. All 33 scripted steps pass in WebKit against the
installed app. Quitting and reopening keeps the 6 demo agents. The delete
sheet, the resumed line, streaming, Enter and Esc are the same as before.
Copy and paste, the keyboard shortcuts, reduced motion and light/dark are
the same in the code, but I didn't see them by hand.
