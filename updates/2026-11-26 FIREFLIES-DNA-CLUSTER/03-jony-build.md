# 03 · Jony — build notes: playground around the real 56 px cluster

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
