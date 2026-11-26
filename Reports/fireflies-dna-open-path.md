# Fireflies DNA: how the user opens the page, and what "new" looks like

Columbo, 2026-11-26. This is the acceptance check for Jony (fix) and Eraser (sign-off).

## What I found first (facts, checked)

- `/Users/stage/dev/agent-creator` is on branch **main** and its git status is clean.
- The last commit that touched `playground/fireflies-dna.html` there is **5f3d08b**. The earlier one is 2a8e86f, which brought in the pace queue and 1 dot per MB. That is the same history as this checkout. Commit 7b2d34e did not change the page itself; it only added the check notes.
- So **the file on disk is already the new one.** The "old way" the user sees most likely comes from (a) an old tab or a cached copy, or (b) the first screen, which looks "all lit at once" by design (see section 3, point 1). Jony should still confirm this with `git diff main -- playground/fireflies-dna.html`.

## 1. How the user gets to the page

- They open `file:///Users/stage/dev/agent-creator/playground/fireflies-dna.html` from disk. There is no server: they double-click the file or paste the path into the address bar.
- **Correction to the brief:** the page has **no file drop and no file picker.** It adds pretend files. On the right, under **Files**, there is a name box that is already filled in (for example `travel/packing-list.txt`), a **Size** slider (100 B to 100 MB), and an **Add** button.
- What they do: move the Size slider if they want, then press **Add**. Each press adds one file and fills in the next name.
- What they expect right away: within a moment of pressing Add, new dots blink on in the cluster one after another, then settle. The new file appears in the Files list, and the line under the form says "Added …".
- Assumption: the user thinks of this as "adding files". If they try to drag real files from Finder onto the page, nothing will happen, and they may decide it's "broken / old". That is not a bug in this build, but it can cause confusion (see open questions).

## 2. What "it works" looks like to them

- **One file at a time.** Press Add three times quickly: the first file's dots land one by one (about 0.1 s apart). The next file's dots only start after a short pause (about ¼ s) once the last file has finished. You can see the three files take turns. Nothing pulses afterwards.
- **1 dot per MB, rounded up, at least 1 dot.** The page counts 1 MB as 1,048,576 bytes. The slider label uses 1,000-based units, so the label and the count can differ by one near the edge.

| Size added (slider label) | Dots they should see |
|---|---|
| ~1 MB (shows "977 KB" or "1.0 MB") | **1** |
| 5 MB | **5** |
| 12 MB | **12** |
| any tiny file (e.g. 20 KB) | **1** |
| 100 MB (slider at the far right) | **96** (only 60 get their own spot; past that, extra MB add glow and a note says so) |

- Exact checks without the slider: in the console, `dna.addFile({name:'a/one.bin', bytes:1048576})` should give 1 dot, `5*1048576` should give 5, and `12*1048576` should give 12. `dna.litOrder()` should show each file's dots in one block, not mixed together.

## 3. What makes them think "it's still the old way"

1. **The first screen.** On load, a sample agent (Juniper, about 12 dots) is already fully lit, all at once. This is on purpose, but to a user looking for "the new pace" it looks exactly like the old glow. **The pace only shows after you press Add.** This is the biggest risk.
2. **An old tab.** A tab opened before the update keeps the old code until it is reloaded.
3. **A cached copy.** Safari and Chrome can keep a `file://` page. Fix: a hard reload (⌘⇧R) or a private window.
4. **The wrong copy of the file.** For example a worktree under `~/.ai-studio/worktrees/…`, a Downloads copy, or a link someone sent. Check the address bar says `/Users/stage/dev/agent-creator/playground/fireflies-dna.html`.
5. **Wrong branch or behind main.** Not the case today (main, clean), but if the folder changes branch later, the page changes with it.
6. **Adding very small or uneven files.** Small files are 1 dot each, so three quick tiny adds look like "three dots at once". Use sizes of 5 MB or more to see the pace clearly.

## 4. The one line for the user

**Open `playground/fireflies-dna.html` in a new private window (or press ⌘⇧R), then press Add a few times: each file's dots now light up one after another, 1 dot per MB.**

## Open questions

- Should the first screen show the pace too (the sample dots landing on open), so the change is visible without pressing Add? That is a product choice, not part of this fix.
- Users may expect real drag-and-drop of files. Today the page only takes pretend files through Add.
