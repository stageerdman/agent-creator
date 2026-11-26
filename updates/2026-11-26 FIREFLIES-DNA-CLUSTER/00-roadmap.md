# 00 · Roadmap — Fireflies DNA, rebuilt around the small cluster

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
