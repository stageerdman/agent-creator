# Final walk in the installed app

Branch `studio/walk-every-block-in-the-installed-app-an-a32bfa51` at 5f93f22. Walked on 2026-11-25.

**How I walked:** I rebuilt and reinstalled `/Applications/Agent Creator.app` from this branch (`npm run build:app`, 4.37 MiB). Then I drove the installed app's own page (`http://localhost:3517/`, served by the running app) with headless WebKit, the same engine as the app window. The scripts are in `.scratch/final-walk.mjs` and `.scratch/final-walk-2.mjs`, which git ignores. The Sketcher answered live (a real model, about 12 s per turn). Talk for a user-made agent gives one marked demo line. Real Finder drags, real key presses and looking at the window by eye could not be done here (see Not verified).

**Verdict:** Not ready to sign off. Eraser's six cuts are not applied. Two logic bugs are new: the menu is empty for every agent you make, and "First words" can never show.

## Passed

- **Tests:** `npm test` gives 120 tests: 119 pass, 0 fail, 1 skipped (the live test).
- **Install check:** `node scripts/check-mac-install.mjs` passes all 9 checks. Spotlight finds the app (2 checks), there's no Chrome in the bundle or in how it starts, it's 4.6 MB, the page is served, the 6 demo agents are there, the native shell runs and the window is on screen at 1200x860.
- **(1) The 7 native-shell regressions** are fixed in the code and in the installed build:
  - NF-1 Finder drop: `src-tauri/src/main.rs:62` `.disable_drag_drop_handler()`.
  - NV-5 launch flash: the window is built hidden (`main.rs:63` `.visible(false)`), then `window.show()` (`main.rs:68`).
  - NF-2 min size: `main.rs:60` `.min_inner_size(640.0, 640.0)`.
  - NV-4 old macOS: `tauri.conf.json:20` `minimumSystemVersion: "13.3"`.
  - NV-3 dark canvas: `app.css:25` `--canvas: #121212`.
  - NV-2 close mark: `components.js:37` `closeBtn` with the inline SVG.
  - NV-1 Tab: `tab-focus.js` is loaded by `app.js` and has its own test.
- **(2) Sketch:** the Profile pane has Name, Description and Instructions. The only switches are Profile and DNA (`#rs-profile`, `#rs-dna`). There's no "Persona" text anywhere in `#sketch` and no "Talk to [Name]" section. The keep card reads "Yours. You can keep changing it. Say hello in Talk, at the top."
- **(3) Studying bar:** there's no study pill and no "Studying" text in the top bar (`block-a.js:112`). "Studying · 251 of 298" still shows as the status mark on a Home card (`block-a.js:134`) and in DNA under "Looks up" (`components.js:195-209`). Both are per-agent progress, which the Sketch rework moved there on purpose (comment at `block-a.js:112`). I count these as pass.
- **(4) Files into the DNA:**
  - Picking the folder `notes/` (with `notes/a.md` and `notes/week/b.txt`) through `#dna-pick-folder` lists `notes/week/b.txt` and `notes/a.md` in DNA, under the "Files" layer, each marked "new · 5 B · Not routed yet".
  - Picking `a.md` through `#dna-pick-files` adds it too.
  - Nothing appears in the creator chat (`#log` unchanged).
  - The drop overlay reads "Drop · your files stay on this Mac / They go into the DNA · tell the Sketcher what each is for".
  - DNA layers in order: Instructions, Made from, Files, Looks up.
- **(5) Magic pass, the parts I could see:**
  - **First sketch washes in:** a class trace during the live turn showed `filling` and `first-sketch` on the field at 12.5 s, `first-sketch` cleared at about 12.9 s, and `name-arrive` on the top-bar name at 13.06 s. The name ("Red Pen") arrives about 550 ms after the wash, as designed.
  - The chips fill the box and never send.
  - The chat ends with the divider "First sketch · Instructions ↗".
  - **Keep inks the face:** after Keep, `.face.fill-in` = 1 and the Talk tab has `.beckon`. The beckon goes away once Talk is opened.
  - **"Say hello":** on a new talk, the Talk composer's placeholder is "Say hello to Walk…".
  - **No page errors** in any of the walks.

## Small issues (UI or copy, for Jony)

1. **X1 keyframe clash:** `@keyframes magic-card-settle` is defined twice (`magic.css:310` and `magic.css:636`). Keep one.
2. **X2 duplicate motions:** `magic-fade` (`magic.css:612`) and `magic-toast-rise` (`magic.css:661`) are still both there. Keep the one motion Eraser chose.
3. **X3 Palette second home:** Palette is still a menu item (`block-a.js:124`) and a whole view: `block-e.js:285-382`, `E.closePalette()` at `block-b.js:60`, CSS at `app.css:611-631`. The export sheet still lists "Palette (only you see it)" (`block-f.js:55`). Remove all of them, as Eraser's cut says.
4. **X4 still error toasts:** there's no `is-error` anywhere, so error toasts still rise. Make error toasts still.
5. **X5 click wins:** `firstSketch` (`app.js:674-692`) has no pointerdown or keydown listener, so a click during the wash doesn't end it at once.
6. **X6 leftovers:**
   - `.talk-views .dot` is still in `app.css:734`.
   - A second, inline `matchMedia` at `app.js:474`; `reducedMotion()` (`app.js:669`) is the one to use.
   - A stray space in `index.html:32` (`aria-controls="sketch" >`).
7. **"what It is told":** before an agent has a name, the DNA heading reads "Instructions · what It is told", with a capital "It" mid-sentence. The source is `block-c.js:27` (`nameFor` returns "It"), used in `sketch.js:225`. Use "it" there, or leave the sub-line out until there's a name.
8. **The drop overlay names the wrong target during creation:** while you're making a new, unkept agent, the overlay says "for a new agent", but the drop goes into that same agent (`block-b.js:487` only makes a new agent on Home or for demo agents). The cause is `block-a.js:321`, which checks `!a.real`. It should say "into the DNA" (or "into [Name]'s DNA").
9. **The walk script is out of date:** `scripts/walk-full-ux.mjs` still waits for `#rs-knows`, `#rs-sketch`, `.refs-toggle`, "Sketch: persona updated" and "only you see this", all removed by the Sketch rework. Steps C, E1-E5, B3 and B6 fail for that reason only. Update it, or drop those steps.

## Fixes (Jony)

All 9 small issues fixed. No new features, no new motion. Big issues untouched.

1. **X1 keyframe clash:** fixed in `f10100b`. One `magic-card-settle` is left.
2. **X2 duplicate motions:** fixed in `f10100b`. One toast motion is left, the one Eraser chose.
3. **X3 Palette second home:** fixed in `f10100b`. The menu item, the view (`block-e.js` E5 and `E.escape`), `E.closePalette()`, the palette, trait and step CSS, and the export line are all gone.
4. **X4 still error toasts:** fixed in `f10100b`. `toast(…, {error:true})` adds `.is-error`. Only `.toast:not(.is-error)` rises.
5. **X5 click wins:** fixed in `e16ff12`. While the name waits (550 ms), one capture `pointerdown`/`keydown` listener ends the wash and shows the name at once, with no motion. The listener goes away when the timer fires.
6. **X6 leftovers:** `.talk-views .dot` was removed in `f10100b`. In `e16ff12`, `addChangeLine` now uses `reducedMotion()` and the stray space in `index.html` is gone.
7. **"what It is told":** fixed in `f10100b`. Before there's a name, the DNA sub-lines say "it" in lower case ("what it is told"). The own-view line reads "Its own view".
8. **Drop overlay target:** fixed in `f10100b`. The overlay now follows the same rule as `B.onDrop`. It says "for a new agent" only on Home or for a demo agent. Otherwise it says "into [Name]'s DNA" (or "into the DNA" before there's a name).
9. **Walk script:** fixed in `e16ff12`. Segments 2 (C, E1–E2) and 3 (E3–E5, Palette) are dropped, because the Sketch rework removed what they tested. B3 no longer opens `#rs-knows`, and B6 no longer waits for "only you see this". I didn't rerun the script because there's no browser here.

Checks: `npm test` 119 pass, 0 fail, 1 skipped (live). I rebuilt and reinstalled `/Applications/Agent Creator.app` with `npm run build:app`, and `node scripts/check-mac-install.mjs` passes every step.

## Big issues (logic, to send back to Uncle Bob)

1. **The menu is empty for every agent you make.** For a real agent, `hooks.menu` returns `[]` (`block-a.js:121`). `app.js:782` treats any array as a custom menu (`if (custom)`), so the menu opens as an empty box. The P2 list (+ New agent, the other agents, Delete) never shows. You can't delete, switch from the menu or start a new agent there while one of your own agents is open. Seen in the installed app (screenshot `.scratch/fw-menu.png`). Fix: return `null` for real agents, or check `custom?.length`.
2. **"First words" can never show for an agent you make.** `answerFor` always returns a `mock` reply for a real agent (`block-d.js:223`), and the First words mark needs `!reply.mock` (`block-d.js:210`). After two messages to a new agent, "First words" appeared 0 times. Imported demo agents still get First words through the first-open path (old walk F3 passes). Either wire Talk to a real answer, or decide that First words waits for live Talk and say so.
3. **Talks with an agent you make are lost on reload.** They are kept only in memory (`realTalks`, `block-d.js:204`) and never saved (`block-d.js:203` saves only `!a.real`). After reopening, Past talks says "Your talks with Walk will be here." Fine if Talk is still a demo line, but it should be a known limit, not a surprise.

## Not verified

- **Real Finder drag** onto the window (only the file picker and synthetic drag events were tested; the code path for drops is `components.js:291-330` and then `block-b.js:481`).
- **Real Tab** with macOS keyboard navigation on and off, in the app window.
- **Launch flash** and the **dark canvas**, judged by eye.
- **macOS older than 13.3** refusing to open the app.
- **The new Ready mark washing once:** Home's first render marks every Ready mark as already seen (`block-a.js:188`), so a wash only plays when a study finishes later. Keep was disabled on Ines after "Skip time" and no kept agent finished a study in the walk. By reading the code: `.is-new` is added once per agent id (`block-a.js:141,145`), and `magic.css:648` plays the wash.
- **A toast rising once:** no toast fired in the walk. The CSS has no duplicate keyframe names, but two toast motions exist (see Small issue 2).
- **"First words" on a real answer:** not reachable in this build (Big issue 2).

**Leftovers from this walk:** the live walk made two agents in the installed app's data, "Walk Test" (kept) and "Red Pen" (sketch). I couldn't delete them: the menu is empty (Big issue 1) and the server has no delete route. They can be deleted once Big issue 1 is fixed.
