# Build notes — 9 fixes on the split creation screen (Jony)

Branch `studio/build-all-9-fixes-on-the-split-creation-acb2f66b`. Numbering follows `update v2.md`.
Files: `src/server/public/creation-screen.js`, `src/server/public/new-agent.html` (markup + css),
`src/server/public/creation-screen.test.mjs`, `checks/creation-screen-check.cjs`.
`firefly-gather.js`, `firefly-orbit.js` and `fireflies-dna.js` needed no change.

## Phase 1 — Remove clutter
- **Fix 1, file count:** `#count` and its code are gone. Test: no count helper left; browser check: no `#count`, no "N files" text anywhere.
- **Fix 7, status lines:** "x used · y waiting", "out at next rebuild", "processing" all gone. A section with files says nothing; an empty one keeps the single hint "nothing yet · drag files here". Dim, bright and red still show the state.
- **Fix 9, fireflies by the name:** `#emblem` removed from the markup and the code.

## Phase 2 — Firefly behaviour
- **Fix 2, drift + dim shine:** field fireflies drift and shine via `flyAt(id, t)` (seeded per file). Menu fireflies (`i.d`) drift with a css `drift` keyframe (on `translate`) and shine with a very dim `::after` (peak .35, rare), timings from seeded css variables `--dx --dy --dp --dd --sp --sd`.
- **Fix 3, no drag:** every pointer handler on the field is gone, and so is `#ghost`. `canvas#flies` has `pointer-events: none`. Browser check: press and move on a firefly → no zones, nothing moves.
- **Fix 5, organic cluster:** Knowledge and System prompt dots sit at `clusterSpot(path, …)`: seeded, spread out, never a row, and the same after a reload. Past `BELT_CAP` the extra dots tuck into the middle.

## Phase 3 — Interactions
- **Fix 4, skill names:** each star is followed by `.sk-name`, and the name updates as soon as the skill is renamed.
- **Fix 6, the flight:** tapping a cluster flies each dot along `flightPath` (a gentle arc) to `orderedSpot(i)`. The flight is eased (`cubic-bezier(.45,.05,.25,1)`, 640 ms) with a small per-dot stagger, using WAAPI on `transform` (id `flight`) so it layers on top of the css drift. Each dot's file name (`.row .fname`) fades in beside it, with one Remove. Tapping again flies the dots back to the same cluster. **Reduced motion:** the dots snap into place, with no flight, drift or shine, and the field is still (`setReduced` follows the system setting live).
- **Fix 8, rename in place:** `#name` is `contenteditable="plaintext-only"`. Enter or a click away saves (`PUT /api/agents/:id/draft {name}`). Esc puts the old name back without leaving the screen. An empty name keeps the old one. The saved name survives a reload. This is the only way to rename.

## Found and fixed while checking
- On first render the cluster was laid out while its box was still hidden (width 0), so it moved after the next render. Now the box is shown before the dots are placed.
- The browser check had a stale zone position: the skills zone moves down once the clusters fill in. It now measures again before each drop.

## Tests (all green)
- `node --test src/server/public/creation-screen.test.mjs src/server/public/firefly-gather.test.mjs src/server/public/firefly-orbit.test.mjs src/server/public/fireflies-dna.test.mjs`: 51 pass.
- `node checks/creation-screen-check.cjs http://localhost:3505 chrome --home <scratch>` and `… webkit …`: ALL PASS in both (server started with `AGENT_CREATOR_HOME=<scratch> PORT=3505 npm start`; needs `npm i --no-save playwright-core`).
