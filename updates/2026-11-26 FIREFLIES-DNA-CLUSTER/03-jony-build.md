# 03 · Jony — build notes: playground around the real 56 px cluster

## Update 2 (2026-11-26): file-by-file lighting, 1 dot per MB, density at 56 px

File: `playground/fireflies-dna.html` (the only code file changed).

### User goal
Watch an agent's cluster grow as files arrive: each file shows up as its own small burst, in the order it was added, and the size of what it holds is readable at 56 px.

### What was removed, and why
- **The hover/focus flash** on the avatar: it was a second trigger for the whole cluster to light up. Now only two things light dots: a file arriving, and the slow idle beat.
- **The global pulse when files arrive**: lit dots stay steady while the queue runs. The beat waits until the queue is empty plus 1.5 s after the last dot lands.
- **One dot per file, sized by file size**: replaced by 1 dot per MB. Every full dot is the same size; only the last dot of a file is smaller, by how full it is.
- **Per-file timing jitter**: the pace is now a plain queue, so the order is easy to read and to test.

### Rules used
**Pace (normal motion)**
- Files go in a queue, in the order they were added. Each file's dots land one by one, **90 ms apart**, then a **250 ms gap** before the next file.
- Cap per file: **2.5 s**. A file with many dots gets a shorter step (`min(90, 2400 / (dots − 1))` ms), so a 40 MB file lands in 2.4 s.
- **Long queue**: with more than 3 files waiting, steps and gaps shrink by `hurry = max(0.12, 1 / (1 + (waiting − 3) / 2))`; the gap is never below 24 ms. No file is ever skipped. Up to 3 waiting files keep the full 90/250 ms pace. (Changed during checking: the first version hurried at 1 waiting file, which turned a normal 4-file drop into 36 ms steps.)
- First beat still lands 400 ms after open and after a rename.

**Sizing**: dots per file = `max(1, ceil(sizeBytes / 1048576))`. A 0 B file still gets 1 dot. The last dot's area follows the leftover bytes.

**Density at 56 px** (rule changed from the brief; here is what and why)
1. Up to 12 dots: the user's size range (default 2.5–6 px radius).
2. Above 12: radius × `sqrt(12 / N)`, as the brief says, with a **2 px radius floor**.
3. Then a **no-touch pass**: if any two dots would come closer than 0.25 px edge-to-edge, or the cluster plus its 1.3× flash would leave the 56 px box, all radii shrink toward the 2 px floor together (big dots stay bigger than small ones) until it fits.
- **Why**: the sqrt rule alone overlaps. Even 12 dots at 6 px cannot sit apart in 56 px, so step 3 is what actually sets the size from about 8 dots up. sqrt(12/N) is kept as the starting point so the shrink stays gentle and predictable.
- Dense clusters also lose their oval squash above 12 dots (it fades to round), because a squashed spiral packs worse.
4. Above **60 dots**: no new spots. Each extra MB adds to one soft glow per topic, behind the dots. The glow is steady (no pulse) and capped at 0.3 opacity. A one-line note under the files says "Past 60 dots, each extra MB adds glow instead of a dot."

**Reduced motion**: each file appears in one step, in queue order, with no movement or flash. A new file is fully lit for 1.2 s, then rests at 75%. In `litOrder`, the dots of one file get `litAt = start + k × 0.001 ms` (same frame, strictly increasing). The 250 ms gap between files is kept, so the order is still visible.

### Test hook (`window.dna`), new and changed
- `addFiles([{id, name, sizeBytes}])`: queues the files and returns how many were queued. A duplicate id is skipped.
- `dotCount()`: total dots of all files, lit or still queued.
- `litOrder()`: `[{fileId, litAt}]` in the order the dots lit (`litAt` in `performance.now()` ms).
- `queueIdle()`: true when nothing is waiting or lighting.
- `getFiles()` now includes `id` and `dots` (count). `removeFile(id | name)`.
- **`getDots()` is now per dot, not per file**: it lists the lit dots that have a spot (at most 60), each with `fileId`. **For Eraser**: the old checks "one dot per file" and "bigger file → bigger dot" no longer hold and must change to "dots per file = ceil(MB)".

### Checked (my own script, Chrome + WebKit, normal + reduced motion, 1280×800 @2×)
All passed in all four runs.

| Check | Chrome normal | Chrome reduced | WebKit normal | WebKit reduced |
|---|---|---|---|---|
| dotCount for 20 MB + 300 KB + 0 B + 3.2 MB = 26 | ok | ok | ok | ok |
| lit grouped by file, in added order; litAt strictly increasing | ok | ok | ok | ok |
| step between dots / file in one step | 90.0 ms | 0.019 ms per 20 dots | 90.0 ms | 0.019 ms |
| gap between files | 250 ms | 250 ms | 250 ms | 250 ms |
| 40 MB file | 2400 ms | 0 ms (one step) | 2400 ms | 0 ms |
| 15 files queued: all lit, in order | 2.5 s | 1.8 s | 2.5 s | 1.9 s |
| no global flash while files arrive (peak vs idle beat) | 99.6k < 151.7k | still when idle | 98.2k < 165.4k | still when idle |
| first beat after rename | ~563 ms | — | ~549 ms | — |
| console clean | ok | ok | ok | ok |

Density (same in all four runs; edge gap = closest pair, all dots inside the box including flash growth):

| Dots | Placed | Radius | Closest edge gap | Note shown |
|---|---|---|---|---|
| 1 | 1 | 6.00 px | — | — |
| 12 | 12 | 4.44 px | 0.29 px | — |
| 20 | 20 | 3.72 px | 0.32 px | — |
| 40 | 40 | 2.74 px | 0.33 px | — |
| 61 | 60 | 2.29 px | 0.26 px | yes |
| 90 | 60 | 2.29 px | 0.26 px | yes |

Screenshots: `.tmp-test/shots-jony-u2/` (`{chrome,webkit}-{normal,reduce}-N{1,12,20,40,61,90}.png` for the row, `…-preview.png` for the 4× view, `…-page.png`). Performance: relayout takes ≤ 2.6 ms at 60 dots and the page holds 60 fps.

---

## Earlier notes

File: `playground/fireflies-dna.html` (the only code file changed).

## User goal
See what an agent's small profile cluster looks like for a given set of files, and watch it change as files come and go. The 56 px avatar is the product; everything else serves it.

## What was removed, and why
- **Big map**: the real thing is a 56 px avatar. A map showed something no user ever sees.
- **Replay mode and timeline**: they answered "how did it grow?", which no one was asking here. The arrival animation of a new file already tells that story, one file at a time.
- No leftover code: no map, replay or timeline functions, styles or ids remain.

## Layout
- Left: a home-style row: the **56 px avatar** (`data-role="avatar"`), the **agent name** (editable, it seeds the look), and "N files · M topics". Below it, one **224 px preview** (`data-role="preview"`): the same cluster drawn at 4×, the same dots at the same moment. Under that is a **topic legend** (colour · topic · count).
- Right: a **Files** list (each file has a × to remove it), an add row (name + **Add**, then a size slider from 100 B to 3 GB, log scale), and **Dot size**: Smallest / Largest, 1–9 px.
- One primary action: Add.

## Behaviour
- One dot per file. Radius maps log(bytes) between min and max px. Min and max push each other, so they can never cross.
- Topic = the folder of the name (`recipes/…`); no folder means `other`. A topic gets the next fixed hue slot from FIREFLIES-DNA (`[0,.67,.33,1,.5,.17,.83]` → 110°+170°·(.06+.88·slot)), so colours stay apart at 56 px.
- Slots are stable: a new file takes the lowest free slot on a fixed golden spiral, so removing a file never reshuffles the others. The scale fits the cluster (glow and flash included) inside the 56 px box and eases (a zoom, not a jump).
- The name seeds the spiral turn, squash (.80–.92), tilt, beat period (2.4–3.4 s) and per-file jitter, so two names give two clearly different clusters.
- Motion is the home cluster's: dots rest dim, all flash together on the beat, and drift slowly. A new file arrives from just outside the cluster in 900 ms and flashes as it joins. The first beat lands 400 ms after the page opens or the name changes, so a new look is seen lit, not dark.
- `prefers-reduced-motion`: static dots at alpha .75, no drift and no flash; a new file appears fully lit for 1.2 s.

## Test hook
```
window.dna = {
  getFiles()            -> [{name, bytes, topic}]
  addFile({name, bytes, topic})  -> true, or false for an empty or duplicate name (topic optional: the folder, else 'other')
  removeFile(name)
  setSizeRange(min, max)  // clamps to 1–9; swaps them if crossed
  getSizeRange()        -> {min, max}
  getDots()             -> [{x, y, r, color, topic}]  // avatar CSS px, resting positions, r = radius at rest, color = hex
}
```

## Assumptions (guesses — check with Columbo / Eraser)
- The editable name is the seed control. It isn't a "fourth control"; it stands in for the agent.
- "Topic colours" is shown as a legend with automatic fixed slots, not a colour picker (hand-picked colours would undo the "stay apart" rule).
- `setSizeRange(5, 2)` swaps to {2, 5} rather than rejecting.
- `getDots()` gives resting positions (without drift or flash), so checks are deterministic.

## Checked
Chrome and WebKit, normal and reduced motion: console clean; add, duplicate rejected, remove; the crossed range is swapped; every dot (×1.3 flash growth) stays inside 0–56; avatar 56 px, preview 224 px; two names give different dots.
