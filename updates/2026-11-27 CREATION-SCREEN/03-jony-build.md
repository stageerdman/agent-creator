# 03 — Jony: the split creation screen, built

Built from `00-roadmap.md`. Branch `studio/design-and-build-the-split-creation-scre-57001227`, commits `009984e` and `19562c2`.

## User goal

Give the agent a folder, then see what it learned and shape it: which files went into its DNA (system prompt), which into its knowledge, and which became skills. To change something, drag a file to another part or remove it.

## Files

- `src/server/public/creation-screen.js` (new): the field, the menu, the drop zones, the popups and remove. It is one module that the page uses.
- `src/server/public/creation-screen.test.mjs` (new): 15 tests covering the scan growth (10,000 files without freezing), dim/bright/red states, remove (against a real server), red until rebuild, drop zones, popups, and Start-opens-newest.
- `src/server/public/new-agent.html`: markup, CSS and wiring for the split.
- `src/server/app.mjs`: `creation-screen` added to `PAGE_MODULES`. This one-line change only serves the static script; there are no new routes.

`npm test`: 181 pass, 1 skip, 0 fail.

## What I removed, and why

- **Separate open buttons.** The section icon is the only way to open a section's text.
- **A second remove.** Remove appears only on a row in the opened belt list.
- **Save buttons in popups.** Edits save on their own, 800 ms after you stop typing and again on close.
- **Skill list rows.** A skill is its star. Pressing the star opens it.
- **Drop-undo and a keyboard "move" for fireflies.** The server has no endpoint for either (see Open points).

## Flow

1. **Before the split:** the orbit spins, with **Select Folder** in the middle. Clicking it opens the Finder picker, or you can drop a folder anywhere. 600 ms after the upload starts, a count line appears under the orbit.
2. The page sends files in batches (`postInBatches`), and every batch calls `screen.grow(dna)`. The orbit keeps spinning fast until the whole upload is done.
3. **Split:** the page waits for the orbit's `first-light`, then waits 1200 ms more (400 ms with Reduce Motion). It then adds `body.split`, stops the orbit 600 ms later, changes the URL to `/new?agent=<id>` with `replaceState`, and calls `screen.open(agent)`.
4. Opening `/new?agent=<id>` goes straight into the split, with no orbit (`still: true`).

## Layout and states

**Left: the field (`#flies` canvas)**
- One firefly per file. Unprocessed files are dim (.32). Processed files are bright with a glow. Removed files are red (`#FF6B5E`).
- `#count` sits bottom-left. Past 3,000 files it reads "N files · 3,000 shown", so a huge folder never freezes the screen.
- To move a file, press a firefly, carry the ghost and drop it on a zone.

**Right: the menu (380 px)**
- The emblem (DNA logo) and the agent name (h1).
- **System prompt:** an icon button, the h2, and the belt.
  - The icon opens the popup. The text can be edited and saves on its own.
  - The belt is a button: up to 48 dots, plus a line such as "1 used · 2 waiting · 1 out at next rebuild". Click or Enter opens or closes the list. It is disabled when the section is empty.
  - Each list row has a dot, the file name and a **Remove** button. A removed row turns red, reads "out at next rebuild" and has no button.
- **Knowledge:** the same as System prompt, except the icon opens the final knowledge file, read-only.
- **Skills:** the h2, plus one sharp 4-point star button per skill. Pressing a star opens the skill popup, with an editable name and body that save on their own. With no skills yet, it reads "nothing yet · drag files here".

**While dragging** (Finder files or a firefly): each section shows its zone label, **Adjust DNA**, **Adjust Knowledge** or **Create new skill**. The zone under the pointer is highlighted. Dropping sends the files to that section. Finder files join the agent first.

**`#note`:** a toast at the bottom centre that stays for 6 s.
- After a drop it reads "2 files → Knowledge" or "New skill from 2 files".
- After a remove it reads "x removed from Agent, not from your Mac", with an **Undo** button.

**Popup:** a title, the skill name (skills only), a textarea, an error line, and a **Close** button. Esc or a click on the backdrop also closes it.

**Esc** outside a popup goes home. Inside a popup it only closes the popup.

## Every visible element, and every way to do each action (for Eraser)

| Action | Ways |
|---|---|
| Give a folder | click Select Folder (Finder picker) · drop anywhere |
| Open system prompt | its icon |
| Open knowledge | its icon |
| Open a skill | its star |
| Open/close a belt list | click the belt · Enter/Space on it |
| Remove a file | the Remove button on its row |
| Undo a remove | Undo in the toast |
| Send files to a section | drop Finder files on a zone · carry a firefly to a zone |
| Save an edit | automatic (800 ms after typing, and on close) |
| Close a popup | Close · Esc · backdrop click |
| Go home | Esc (outside a popup) |

Close has three ways and the folder has two. Both follow platform habits, but Eraser may cut them down.

## Open points for Columbo

- **The scan SSE endpoint is unused.** The page has no absolute paths in the browser, so it sends `POST files` in batches of `BATCH`. The fast spin lasts until the upload ends.
- **There is no markProcessed endpoint.** Bright and red show only after the creator builds. The test sets this up with `createAgents` directly.
- **There is no unassign endpoint,** so a drop can't be undone.
- **The keyboard can't move fireflies.** A pointer drag or a Finder drag is needed. To fix this we would need a "Move to…" control, which is a design decision.

## Where it was tested

- `npm test`: 181 pass, 1 skip, 0 fail.
- Live server: `/new` and `/creation-screen.js` answer 200.
- **Not checked by me in a real Chrome, WebKit or the installed app,** because I have no browser tool. Eraser's platform pass covers this.
