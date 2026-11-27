# 04 — Eraser: clutter check and sign-off

**Verdict: APPROVED (with one open performance item, not in Jony's files).**

Goal of the user, in one line: give the agent a folder, then see and shape what went into System prompt, Knowledge and Skills.

## Step count (most common paths)

| Path | Steps | Notes |
|---|---|---|
| Give a folder | 1 drop (or Select Folder → pick = 2) · then wait | Wait for 10,000 files: about 4.5 s to the split, with fireflies circling the whole time |
| Send files to a section | 1 drag onto a zone | Zones appear on their own while dragging. No choosing a section in a menu |
| Edit the system prompt / a skill | 1 click on the icon → type → 1 close | Saves by itself while typing, so there's no Save button. Close = Esc, Close or the backdrop |
| Read Knowledge | 1 click → 1 close | Read-only. It's built from the files |
| Remove a file | 1 click on the belt → 1 Remove | No "are you sure?" prompt. You get Undo instead |

Target and actual are the same, so there's nothing left to cut on the common paths.

## What I removed, and why

- **Two wordings for one empty state → one.** The belts said "nothing yet · drag a firefly here" and Skills said "nothing yet · drag files here". Now all three say **"nothing yet · drag files here"** (`src/server/public/creation-screen.js`, `EMPTY`; test updated). That is one state with one message, and it fits both kinds of drag.

## What I kept, and why

- **Close · Esc · backdrop** for a popup. These are three ways to do one action, but they're the normal habits for any dialog on the Mac, nothing new to learn. Taking one away would just break someone's habit.
- **Select Folder + drop anywhere.** Dropping is the fast way. Select Folder is for people who don't drag, plus keyboard users. (Already signed off in FIREFLIES-BUILD.)

## Clutter I looked for and did not find

- No second Remove. A used file that you remove turns red ("out at next rebuild") and **has no Remove left**.
- No extra open buttons. The menu shows exactly one open icon per text section (System prompt, Knowledge), and nothing else to press.
- Each file appears once in a belt's list, with one Remove.

## What I checked, per platform

Script: `checks/creation-screen-check.cjs` (Playwright; it uses a scratch home, not the user's agents).

| Check | Chrome | WebKit (Safari engine, same as the app window) |
|---|---|---|
| 10,000 files: counted, 3,000 drawn, "10,000 files · 3,000 shown" | PASS | PASS |
| Fireflies land batch by batch while circling (15 / 16 counts) | PASS | PASS |
| Fast circling (m = 6) until every file is in, first light only after 10,000 | PASS | PASS |
| **No freeze** (no frame over 250 ms) | **FAIL: one 1,100 ms frame** (p95 17 ms) | **FAIL: one 850 ms frame** (p95 18 ms) |
| All three zones appear on a Finder drag, the one under the pointer lights, they go when the drag leaves | PASS | PASS |
| Zones send files to System prompt / Knowledge / a new Skill; a carried firefly lands in Knowledge | PASS | PASS |
| Belt: dim per waiting file, bright per used file; click opens / closes the list | PASS | PASS |
| Remove: never-used file leaves; used file stays red, survives a reload, gone after a full rebuild; Undo works | PASS | PASS |
| Popups: system prompt autosaves and saves on close; Knowledge read-only; skill name + steps save | PASS | PASS |
| No page errors | PASS | PASS |

**Installed app:** `npm run build:app` built the app and installed it at `/Applications/Agent Creator.app` (this is the step Start runs before it opens the app). The built bundle contains this branch's `creation-screen.js`, including the new empty wording, so Start opens the newest build. The `npm test` check "Start builds, replaces the installed app, then opens that copy" passes. I did not click through the screen inside the app window: my tools can't drive it. The app window uses the same WebKit engine as the WebKit column above.

**`npm test`:** 182 tests, 181 pass, 1 skipped (it needs the live Claude CLI), 0 fail.

## Still open

1. **One long frame (~1 s) with a 10,000-file folder, just before first light.** This is not the scan: the drop handler takes 8–14 ms, and files keep landing smoothly. The pause comes when the agent's logo is built with all 10,000 files (`createDna` in `src/server/public/fireflies-dna.js:169-172`). For every file it rescans the whole list twice (`list.some(...)` and `freeSlot()`, which rebuilds every dot), so the work grows with the square of the file count. It's a quick fix: keep the ids in a Set, and stop looking for slots once all 60 are taken. But that file is the shared logo module, not one of Jony's, so I didn't touch it. **This needs an owner.** Estimate, not measured: since the cost grows with the square of the count, 1,000 files should pause about 10 ms.
2. No Undo after a zone drop (there's no way yet to take a file back out of a section). The roadmap's Phase 3 asks for one.
3. No "waiting" mark on fireflies that were sent to a section (roadmap Phase 3).
4. Fireflies can't be moved with the keyboard.
5. The remove note says "removed from Untitled" when the agent has no name yet. Fine for now, but watch it once names arrive.

## Integration (Columbo, captain)

- **Open item 1 is fixed.** In `createDna` / `setFiles` (`fireflies-dna.js`), the ids now go in a Set and the first-visit slots are given out in order, so the work grows in step with the file count, not with its square. Reran `checks/creation-screen-check.cjs` with 10,000 files: **ALL PASS in Chrome (longest frame 17 ms) and WebKit (longest frame 36 ms)**, where before they were 1,100 ms and 850 ms. `npm test`: 181 pass, 1 skipped, 0 fail. Ran `npm run build:app` again, and the installed app carries the fix.
- Items 2–5 stay open for Phase 3.

## What to watch later

- Keep it at one open icon per section. If skills get more actions, put them inside the skill's popup, not next to its star.
- If a "waiting" mark is added, it must not need a click to clear.
