# PLUS-FIREFLY — update v1

**Goal:** on Start (home), pressing + turns the + itself into a firefly that
flies with the others into the ring, before the build screen (/new) opens.

## Roadmap and status
1. Behavior research — Columbo, `01-columbo-report.md`. Done.
2. Motion spec — Merlin, `02-merlin-motion.md`. Done.
3. Build + tests — Jony, `03-jony-build.md`. Done
   (`src/server/public/firefly-gather.js`, `firefly-gather.test.mjs`,
   ⌘N repeat guard in `agent-home.html`).
4. Sign-off — Eraser, `04-eraser-signoff.md`. APPROVED.
5. Integration — Columbo (captain). `npm test`: 396 tests, 394 pass, 0 fail,
   2 live tests skipped. Not watched in a real window yet.

## What shipped
- The + glyph is painted on the canvas in the first frame and the real glyph
  hides in the same callback (no gap, no double).
- Arms fold into one lime dot by 140 ms, hold until 200 ms, land in the ring
  slot nearest the + at 700 ms; total run still 1000 ms.
- Reduced motion: page and + fade together in 160 ms, no fireflies.
- Back from the cache restores the glyph and tile; any error in the + part
  drops only the + fly, the run goes on.
- Holding ⌘N counts as one press.

## Next
- Watch it once in the Start app (macOS window) to confirm the feel.
