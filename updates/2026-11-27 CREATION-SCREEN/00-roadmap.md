# CREATION-SCREEN: roadmap

The screen a new agent grows on, right after the folder is given on the
+ build screen (`updates/2026-11-27 FIREFLIES-BUILD/`). Fireflies on the
left, a character-style menu on the right with three parts: **System
prompt**, **Knowledge** and **Skills**.

Journey steps (`updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`):
**UJ2 · 2** (what is in the folder), **UJ2 · 3** (the split: which file
is for what) and **UJ2 · 4** (learning). Behaviour research:
`Reports/creation-screen-behaviours.md` (behaviour numbers **C1…** below
point there).

It is the same page, `/new` (`src/server/public/new-agent.html`). Today
the drop ends on a calm placeholder (FIREFLIES-BUILD phase 2). This
update replaces that placeholder.

Order of work: Columbo (research and this roadmap) → Merlin (magic
moments, `Reports/creation-screen-magic-moments.md`) → Jony (design and
build) → Eraser (sign-off).

## The user's fixed rules (constraints, not up for change)

- After a drop or pick, the fireflies keep circling fast while a quick
  scan walks every file in the folder and its subfolders and reads each
  size. **One file = one firefly.**
- The screen then splits: a **simple** firefly field on the left, the
  character menu on the right (System prompt, Knowledge, Skills).
- While you drag, the three parts become drop zones: **Adjust DNA**,
  **Adjust Knowledge**, **Create new skill**.
- **Dim and bright.** A file's firefly shines, and is put in order, only
  once its file has really been used: built into the final system
  prompt, really embedded into Knowledge, or really turned into a
  skill. Every other file stays dim and unsorted, and can be thrown
  away.
- The full left-side design is feature **f-the-left-side**, next
  update. This update keeps the left side simple on purpose.
- The Fireflies DNA look (`MIN_R`, `MAX_R`, glow and colour in
  `src/server/public/fireflies-dna.js`), Reduce Motion respected, one
  way to do each thing, Esc goes home.

## Phase 1: the scan, while the fireflies circle fast

- The answer to a pick or drop (the fast, bright circling from
  FIREFLIES-BUILD) **holds for the whole scan**, not only for the
  save. It ends when the last file has been counted and sent.
- The scan walks every file in the chosen folder and every subfolder,
  to any depth, and reads each size. Only paths and sizes; never the
  content (`file-intake.js`: `walkEntries`, `toEntries`).
- Each file found becomes one firefly. The count the user can see grows
  while the scan runs, so a big folder visibly "fills up" (C1, C3).
- Hidden files and dot-folders are left out, as today (`isHidden`).
- A file already in this agent (same path) does not make a second
  firefly (`addFiles` keeps the first, C5).
- The screen never freezes. A 10,000-file folder keeps the circling
  smooth, and the files are sent in batches (`BATCH`, `intake:progress`).
- A scan that finds no files, or a failed save, settles back calmly as
  today. No error box (FIREFLIES-BUILD decisions).
- Reduce Motion: no circling, no speed-up. The fireflies appear one by
  one in place as they are counted; brightness alone says "still
  counting".

Tests that prove it:
1. Unit (`file-intake.test.mjs`): a nested fake folder 4 levels deep
   gives one entry per file with its size; dot-files skipped; a repeat
   path is not doubled.
2. Unit: the screen's firefly count equals the number of entries, at
   every `intake:progress` and at `intake:done`.
3. Browser check (Chrome and WebKit): a 10,000-file scratch folder.
   The ring keeps moving during the whole scan (positions change on
   every sampled frame, no gap over 100 ms), and the visible firefly
   count on screen at the end equals the file count (or the visible cap
   Jony sets, with the real count readable, see open question Q1).
4. Same check with Reduce Motion on: nothing moves, the count still
   grows.

## Phase 2: the split, a simple field and the character menu

- When the scan is done, the screen splits. Left: the firefly field,
  one dim firefly per file. Right: the character menu with three parts,
  **System prompt**, **Knowledge**, **Skills**, each showing what it
  holds now (for a new agent: nothing yet).
- **The left side stops here.** It is a simple field: the fireflies,
  dim and unsorted, and nothing else. No grouping, no search, no file
  names on hover, no filters. All of that is **f-the-left-side**, the
  next update.
- The split is a state of `/new`, as the placeholder was. Esc still
  goes home, where the new agent sits at the top.
- Reopening the agent later shows the same split with the same
  fireflies (the state comes from the agent's file list, not from the
  drop).

Tests that prove it:
1. Unit: the field draws one firefly per file in the agent's file list
   (`dnaOf`), all dim when no file is used.
2. Browser check: after a drop the left shows the field and the right
   shows the three parts with their plain labels; the old placeholder
   is gone; the left has no controls (no buttons, inputs or links).
3. Reload, or go home and open the agent again: the same field and the
   same three parts.
4. Esc from the split goes home; the agent is listed at the top.

## Phase 3: while you drag, the three parts become drop zones

- The moment a drag enters the window, the three parts become drop
  zones named **Adjust DNA** (System prompt), **Adjust Knowledge**
  (Knowledge) and **Create new skill** (Skills). When the drag leaves
  or ends, they go back to their plain names.
- A drag can be fireflies from the left field or new files from Finder.
- Only the zone under the pointer lights. Releasing outside the three
  zones sends files to the field (new files) or does nothing (fireflies
  from the field): no file is ever lost by a miss (C6).
- Dropping onto a zone **routes** the file there (`routeFiles`:
  `instructions` for Adjust DNA, `rag` for Adjust Knowledge; a skill
  route for Create new skill). It does **not** make the firefly bright:
  routing is a plan, not a use (Phase 4).
- The zone shows at once, under half a second, that it **accepted** the
  file, and the firefly gets a visible **waiting** mark while staying
  dim. Accepted and used never look alike (report W1, W2, C3).
- A Finder folder dropped straight onto a zone adds its new files and
  routes them all in one move; files already in the agent are routed,
  not doubled (C10, C5).
- Every drop onto a zone gets an **Undo** line (design rule: undo over
  "are you sure?"). Undo puts the file back where it was, unrouted.
- Reduce Motion: zones change by light and label only.

Tests that prove it:
1. Unit: zone → route mapping; a drop on a zone changes the file's
   feeds; Undo restores the feeds exactly as before.
2. Browser check: on drag enter the three labels read Adjust DNA,
   Adjust Knowledge, Create new skill; on drag leave they read System
   prompt, Knowledge, Skills again, with no flicker while crossing inner
   parts of the page.
3. Browser check: a drop outside the zones adds Finder files to the
   field and changes nothing for field fireflies; nothing is lost.
4. Pixel check: after a zone drop, the firefly is still dim (not lit),
   its waiting mark is visible, and the zone shows it accepted the file.
5. Browser check: a Finder folder of 40 files dropped on Adjust
   Knowledge routes all 40; dropping it again adds no firefly.

## Phase 4: the dim and bright rule

- A firefly shines, and moves into order, **only** when its file has
  really been used:
  - **System prompt:** the file was really read into the final system
    prompt (`instructions.md`) by the instructions machine.
  - **Knowledge:** the file was really embedded and can be found by the
    knowledge machine (RAG).
  - **Skills:** a skill was really made from it.
- The signal comes from the machine that did the work, per file, after
  it finished. Routing, a plan, or "in progress" are not enough. A file
  that failed stays dim.
- Every other file stays dim and unsorted, and can be **thrown away**.
  Throwing away a dim file removes it from this agent only, never from
  the user's disk, and gets an Undo line.
- A bright file can be taken back (C7): removing its use (out of the
  prompt, out of Knowledge, or the skill removed) makes it dim again.
  That is real work for the machine, so it says so plainly and gives
  Undo where it can.
- Bright files are never thrown away from the field directly; they have
  to be taken back first (they are part of the agent).

Tests that prove it:
1. Unit: a file is bright if and only if a machine marked it used; a
   routed but unused file is dim; a failed use is dim.
2. Unit: throw away removes a dim file from the agent's list, Undo
   brings it back with its feeds and its first `addedAt`.
3. Unit: taking back a used file clears its use and it is dim again.
4. Pixel check (Chrome, WebKit, installed app): with 3 used files out
   of 50, exactly 3 fireflies are visibly bright on screen, not 50
   (design rule: checks look at what the eye sees).
5. Reload: the same 3 stay bright, in the same order.

## What this update leaves out on purpose

- **The full left side** (f-the-left-side, next update): grouping by
  folder, file names, search, sorting the dim files, selecting many at
  once, the look of a very large field. Phase 2 stops at a simple field.
- **How Knowledge is built.** The RAG machine (chunking, embedding,
  store) is still undecided (CLAUDE.md). Until it exists, nothing can
  be "really embedded", so no Knowledge firefly can go bright. That is
  honest, not a bug (Q3).
- **What a skill is made of.** Create new skill routes a file; making
  the skill itself is the skill machine's job (Q4).
- **The Sketcher chat** for routing in words (UJ2 · 3). It stays as it
  is; this update adds drag routing next to it, not instead of chat
  (Q5).
- **Adding files to an older agent** from its agent page (UJ8).

## Open questions

Q1 to Q7 in `Reports/creation-screen-behaviours.md`, each with the
assumption this roadmap works with until it is answered (names and a
cap on the field, where a waiting firefly sits, Knowledge before the
RAG machine exists, what a skill is, throwing away bright files, same
content under two paths, chat and drag together).

## Test, Start, sign-off

1. `npm test` passes, with the phase tests above.
2. Works in the browser dev server, in the real app and in the
   installed build (`scripts/install-mac-app.sh`).
3. Start (`scripts/start-mac-app.sh`), then +, then a drop, ends on the
   split screen.
4. Eraser checks it in Chrome, WebKit and the installed build, with
   pixel checks for dim and bright, and writes `04-eraser-signoff.md`.

**Done: all four phases pass their tests in the real app and the
installed build, Eraser signed it off, Start opens it.**

## Files in this folder

- `00-roadmap.md`: this file (Columbo)
- `Reports/creation-screen-behaviours.md`: behaviour research (Columbo)
- `Reports/creation-screen-magic-moments.md`: magic moments (Merlin)
- `03-jony-build.md`: what was built and how to try it (Jony)
- `04-eraser-signoff.md`: sign-off (Eraser)
