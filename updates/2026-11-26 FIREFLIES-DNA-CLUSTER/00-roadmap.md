# 00 · Roadmap — Fireflies DNA, rebuilt around the small cluster

## Update 2: lights up at the pace files are added + 1 dot per MB

*2026-11-26. This section comes first. Where it differs from the older
sections below, this one wins. "One dot per file" and "dot size follows
file size" are replaced by "one dot per MB" (Phase 2 here).*

**What the user said:** "better, but it's all shining at once, not at the
rate of added files"

**The user's job:** I want to see my agent's knowledge grow as I feed it.

File: `playground/fireflies-dna.html` (Jony builds, Eraser checks). Jony can
build from this section alone.

### Phase 1 — pace: the cluster grows file by file

- Files light up **in the order they were added**. Keep a queue.
- A file's dots arrive **one by one**. The next file starts only after the
  last dot of the file before it is lit.
- Pace numbers:
  - each dot lands **about 90 ms** after the one before it;
  - **250 ms gap** between files;
  - **at most about 2.5 s per file**: if a file has many dots, shorten the
    step between its dots so the whole file fits in 2.5 s. One big file can't
    stall the queue.
- **Nothing in the cluster flashes all at once.** Dots that are already lit
  stay steady when new files arrive. No global flash, no pulse of the whole
  cluster.
- The **400 ms first beat on open/rename stays** as it is today.
- **Reduced motion:** each file appears in **one quiet step**, in order, with
  no movement (no fly-in, no growing, no pulse). The 250 ms gap between files
  stays so the order is still readable.
- Hook for Eraser (extend the existing `window.dna`):
  - `window.dna.addFiles([{id, name, sizeBytes}])`: queue files;
  - `window.dna.queueIdle()`: `true` when the queue is empty;
  - `window.dna.dotCount()`: total number of dots;
  - `window.dna.litOrder()`: array of `{fileId, litAt}` in the order dots lit.
- **Done when:** adding 3 files at once lights file 1's dots, then file 2's,
  then file 3's; `litOrder()` is grouped by file, in added order, `litAt`
  strictly increasing, no two files lit at the same time; no full-cluster
  flash; one 40 MB file takes ≤ about 2.5 s; first beat still fires 400 ms
  after open/rename; reduced motion shows one step per file, in order.

### Phase 2 — sizing: 1 dot per MB

- Dots per file = `max(1, ceil(sizeBytes / 1048576))`.
  - 20 MB file → 20 dots. 300 KB file → 1 dot. Empty file → 1 dot.
- Expected total for a normal agent: about **12 MB, so about 12 dots**. But
  **20+ dots must still read well** (see Phase 3).
- Topic colours stay as they are: all dots of a file share its topic hue.
- **Done when:** `dotCount()` equals the sum of the formula over all files
  (checked with a 20 MB, a 300 KB and a mixed sample set).

### Phase 3 — density at 56 px

A starting rule. **Jony confirms or changes it** and writes down what was
chosen and why in `03-jony-build.md`.

- **Up to 12 dots:** keep today's size range.
- **Above 12 dots:** dot size × `sqrt(12 / N)` (N = total dots), **never
  below a 2 px floor**.
- **Dots never overlap.**
- **No dot is dropped up to 60 dots.**
- **Above 60 dots:** extra dots don't get their own spot; they only add glow
  to the cluster. This is written into `03-jony-build.md` and shown as a
  plain note in the playground.
- **Done when:** at 56 px with 12, 20 and 40 dots, no dots overlap and none
  is smaller than 2 px; at 61+ dots the cluster still reads as the same
  agent and the glow does not hide the pace.

### In scope

- The pace queue, 1 dot per MB, the density rule, reduced motion, the
  `window.dna` hook additions above. All in `playground/fireflies-dna.html`.

### Out of scope

- The **big map, replay and timeline stay removed** (see "Removed for good").
- Bringing this into `agent-home.html` or the profile (later phases below).
- Removing files with animation, re-ordering files, any second way to start
  the animation (no "replay" button).

### Checks (Eraser)

- **Chrome + WebKit**, each in **normal + reduced motion**.
- All existing 45 checks still pass.
- **Start still works** (the project's Start button opens the app).

### Watch out

- If the user adds **many files quickly**, the queue must not feel laggy:
  **speed it up** (shorter dot steps and gaps while the queue is long), but
  **never skip a file**. Every file still lights, in order.

**Why this round:** the last playground (`updates/2026-11-26 FIREFLIES-DNA/`)
grew into a big map with a replay and a timeline. People never see an agent
that way. They see it as a **56 px firefly cluster** in a home row and on the
profile. So we rebuild the playground around that cluster, which already
exists in `src/server/public/agent-home.html` (lines 182–260).

## Removed for good

The **big map**, the **replay mode** and the **timeline** are removed. They
will **not** come back in any later phase. No leftover code, no hidden
markup, no "maybe later" switch. If an idea needs them, it is a new idea and
starts again with research.

## Phase 1 — now: the playground around the real cluster

File: `playground/fireflies-dna.html` (Jony builds, Eraser checks).

- Start from the real code: `cluster(a, cv)`, `slot(i, n, R, seed)`,
  `radius(n)`, `flash(dt)`, `drawCluster(c, t, dt)`, `BOX = 56`, the
  golden-angle spiral (`i * 2.39996 + seed`) with the `.86` vertical squash,
  the synced flash (rise 120 ms, fall 900 ms) and the warm green sprites
  (`FLY`, `WARM`). Keep its look and feel.
- On screen: the cluster at **real avatar size (56 px) inside a row like the
  home row**, and **one larger preview of the same cluster**. Nothing else is
  the main thing.
- **One dot per file.**
- **Dot size follows file size**, mapped between a **min and a max** px the
  user sets. Min can never be above max.
- **Files on the same topic share a colour**, using the fixed topic hue
  slots from last round (`[0, .67, .33, 1, .5, .17, .83]`, then golden steps).
- **Each agent's cluster is clearly its own**: seeded by the agent's name,
  so the spiral turn, the beat and the shape differ per agent.
- Only controls: the files (a sample set plus add/remove), min/max size, and
  the topic colours. Respects reduced motion.
- Done when Eraser signs APPROVED in Chrome and WebKit.

## Phase 2 — later: back into agent-home.html

- Replace the random dot count (`14 + r() * 16`) in `cluster()` with the
  agent's real files: one dot per file, size and colour by the Phase 1 rules.
- Keep the row behaviour that already works: only visible rows draw, the
  learning rows keep their loose → joining → joined loop.
- Decide what a brand-new agent with 0–3 files looks like (see open
  questions in `01-columbo-behaviors.md`).

## Phase 3 — later: the profile

- The same cluster, larger, on the agent's profile. Same seed, same colours,
  so it reads as the same agent as in the row.
- Adding or removing a file there changes the cluster the person sees in the
  home row too.

## Not on this roadmap

Map, replay, timeline (removed, see above). Event dots, embeddings build
button, blink-order and spark-chain tuning: they belonged to the map and are
out unless research shows a need at avatar size.
