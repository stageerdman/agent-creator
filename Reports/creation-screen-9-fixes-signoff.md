# Sign-off: 9 fixes on the split creation screen

**Verdict: APPROVED**. Eraser, 2026-11-27.

Roadmap: `updates/2026-11-24 AGENT-CREATOR - OPEN/update v2.md`. Build: Jony,
`build-notes-9-fixes-jony.md`, commit `1878230`.

## The goal

When the user drops a folder, they see their agent and its parts calmly, with
nothing to read that the fireflies already show. They can see which files are
in each part and rename the agent where its name is.

## Step count for the common paths (all lean)

| Path | Steps | Notes |
|---|---|---|
| See which files are in Knowledge | 1 (tap the cluster) | Before: tap, then read a list that dropped down. Now the fireflies are the list. |
| Close it again | 1 (tap again) | Same target, no separate Close. |
| Rename the agent | 3 (click name, type, Enter/click away) | No dialog and no Save button; it saves by itself. Esc is the undo. |
| Tell skills apart | 0 | Names show all the time, no hover needed. |
| Understand file state | 0 | Dim, bright or red. No words to read. |

Nothing was removed that protects safety, data or money. Remove still keeps
its "not from your Mac" line with Undo.

## Start opens the newest build

- Ran `npm run start:app` (the Start button): the Tauri build finished and
  installed `/Applications/Agent Creator.app`, then opened it.
- The bundle it installs (`src-tauri/target/release/bundle/macos/Agent
  Creator.app/Contents/Resources/app/src/server/public/`) has the same
  `creation-screen.js` and `new-agent.html` as this branch, byte for byte
  (`git diff --no-index` is empty). The server sends no long-lived cache
  header for these files.

## Each fix against its "Done looks like" line

Checked in the running server (scratch home, `PORT=3505`) with
`checks/creation-screen-check.cjs` in **Chrome and WebKit**. I also ran my own
eye-level probe `checks/eraser-eye-probe.cjs`, which checks pixels, cursors,
layout and screenshots. I looked at every screenshot myself.

| # | Fix | How I checked | Result |
|---|---|---|---|
| 1 | No file count | No `#count` in the page. After 10,000 files and later drops, the visible text has no "N files" and no "a / b". Screenshots show nothing under the screen. | ✅ |
| 7 | No "waiting" or other status lines | After adding, processing, removing, Undo and a rebuild, the visible text has none of: waiting, used, out at next rebuild, processing, queued. A section with files shows no words at all, and an empty one shows only "nothing yet · drag files here". | ✅ |
| 9 | Nothing next to the name | `#emblem` is gone and the header holds only the name. Screenshots taken before, during and after drops show the name alone. | ✅ |
| 2 | Slow drift and a dim shine now and then | The field canvas pixels change over 3 s with no input. Menu dots move 0.2 to 2.9 px over 3 s: slow and small. Sampled the shine 30 times over 6 s: brightest was 0.35 and never all at once. A unit test shows only a few of 3,000 shine at any moment. With reduced motion there are 0 animations and the field is still. | ✅ |
| 3 | Can't be dragged | Pressed on a field firefly and dragged it to Knowledge: no drop zones, nothing moved, and the canvas has `pointer-events: none`. No grab or move cursor on any firefly. | ✅ |
| 5 | Loose, seeded cluster | Knowledge and System prompt dots sit in uneven clouds (different x and y, no row; see screenshot). The cluster has exactly the same shape after a reload. | ✅ |
| 4 | Skill names | Every `.sk-name` is visible at full opacity without hovering. A rename in the skill popup shows up next to the star at once. | ✅ |
| 6 | Tap flies them out, tap again flies them back | Each dot gets its own eased `flight` (cubic-bezier, 640 ms), staggered 0/30/60…180 ms. Afterwards each file name sits 10 to 14 px to the right of its own dot, in order, with one Remove. No list, drop-down or panel appears anywhere. A second tap returns them to the exact cluster. With reduced motion they snap into place, with 0 animations. | ✅ |
| 8 | Rename in place | Click the name, type, press Enter: it saves and stays after a reload. Clicking away also saves. Esc brings the old name back. An empty name keeps the old one. The `h1#name` is the only control on the screen that renames the agent. (The skill popup's name field renames a *skill*, which is a different thing.) | ✅ |

## Nothing new crept in

- No leftover counts or status words (fixes 1 and 7 above, checked on a full screen).
- Only one way to rename the agent.
- No drag: no pointer handlers on the field, no `#ghost`, no grab cursor.
- No list drop-down instead of the flight: the rows are the dots' own labels,
  and the probe finds no `select`, `ul`, `ol`, listbox, menu or details element.
- No page errors and no failed requests in either browser.

## Tests (all green)

- `node --test` on `creation-screen`, `firefly-gather`, `firefly-orbit` and `fireflies-dna` tests: **51/51 pass**.
- `npm test`: **189 pass, 0 fail**. 1 skip, the live test that needs the real CLI.
- `node checks/creation-screen-check.cjs http://localhost:3505 chrome --home <scratch>`: **ALL PASS**.
- Same with `webkit`: **ALL PASS**.
- `node checks/eraser-eye-probe.cjs http://localhost:3505 <shots dir>`: **ALL PASS** (11 checks).

## For Jony to watch later (not blocking)

- `new-agent.html` still has a css comment that mentions "the carried
  firefly". `#ghost` is gone, so the comment should go too.
- In `creation-screen-check.cjs`, the two reduced-motion lines are labelled
  "fix 9" but they test fixes 2 and 6. Relabel them so a future failure points
  at the right fix.
- The skills list grows downward and pushes the drop zones. Watch this once a
  user has 10 or more skills.
