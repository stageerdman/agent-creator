# FULL-UX: the whole app as a clickable .app with mock data

## Goal

Build the complete look and feel of Agent Creator, every pillar from P1 to
P12, as a real macOS **.app** that you can click through from start to end.
Parts that already work stay real: the P1 engine and the P2 creation chat
(the Sketcher). Everything else runs on **mock data**: intake, RAG, persona
generation, the agent file, icons, agent chat, history, learning insight,
characters/DNA and the capability map. The real functions get wired in
later, one feature at a time, behind the same screens.

**Done when:**
- someone can open the .app and walk every user journey in
  `journeys-columbo.md` (UJ1–UJ12) without hitting a dead end;
- the P2 chat still works for real inside it;
- `npm test` passes, the journey walkthroughs pass, and Start opens the
  newest build.

This serves the feature "Full UX prototype of the whole app (.app)". It
sits on top of `updates/2026-11-24 AGENT-CREATOR - OPEN/` (P2, shipped).

## Rules for this update

- **UX only. No new backend.** No new server routes for P3–P12 and no real
  indexing, embedding, transcription or image generation. Anything not built
  yet reads from mock data.
- **Mocks look like the real thing will.** Each mock has the shape the real
  feature will return later, so wiring it in means swapping the source, not
  the screen. Each mock's shape is written down next to it.
- **Mocks never leak into real agents.** A mock map, score or source never
  gets written into a real agent's `agent.json`, and the P12 map never goes
  into a draft (the P2 rule stays).
- **Magic UX order of work** (from `principles/magic-ux/design-rules.md`):
  research → magic → design → cut review. The captain folds the review into
  the design, so the build team reads one file per block.

## Roadmap

Each phase ends with tests or a written check that locks in what it built.

### Phase 0: Roadmap and journey map ✅ (Columbo, 2026-11-25)
- This file, plus `journeys-columbo.md`: who uses the whole app, what they
  hire it for, a scored behavior table across P1–P12, deep dives on the top
  behaviors, twelve end-to-end journeys (UJ1–UJ12) with the mock data each
  needs, a watch-out list and open questions.
- **Check:** Merlin and Jony can point every moment and every screen they
  make to a journey step (UJ# · step). A screen that serves no journey step
  is a cut candidate for Eraser.

### Phase 1: Magic across the journeys (Merlin)
- `magic-merlin.md` in this folder. Extend the P2 world (the portrait
  sitting: Sketch, Sketcher, Keep, References, Sharp/Rough/Blank) to the
  whole app, or argue for a change. Rank the moments by journey.
- **Check:** every top journey (UJ1–UJ6) has a ranked moment or an explicit
  "none needed". All names used on screen are listed in one table.

### Phase 2: Design, split into UX blocks (Jony)
- `design-jony.md` (or one file per block). Suggested blocks, each tied to
  journeys:
  - **A. Home and library**: first run, picking an agent, coming back
    (UJ1, UJ5, UJ12).
  - **B. Make with material**: bring a folder, rules, the wait, the
    generated persona, the first map, Keep (UJ2, UJ3).
  - **C. Know**: learning insight, quality score and capability map as one
    place (UJ4, UJ8).
  - **D. Talk**: chat with an agent, sources, history, the fix loop back to
    the Sketcher (UJ5, UJ6, UJ7).
  - **E. Identity**: icon, photo, DNA (UJ9).
  - **F. Share**: export and import the agent file (UJ10, UJ11).
- Every state, including errors, the long wait and an empty library.
- **Check:** a user-model table (as in the P2 design §3) that maps each
  journey step to where the design serves it.

### Phase 3: Cut review (Eraser) and fold-in (Columbo as captain)
- `review-eraser.md`. Required changes get applied into the design files.
- **Check:** Eraser's sign-off, and no screen without a journey.

### Phase 4: App shell and mock layer
- The shell: navigation between home, an agent, its creator, its chat and
  its insight. The P2 creator screen moves in unchanged.
- A mock data module in the front end with fixtures for the demo agent set
  in `journeys-columbo.md` §7. No server routes are added for mocks.
- **Tests:**
  - each fixture matches its written shape (one unit test per mock kind);
  - the server serves the shell and its scripts;
  - every existing P2 test still passes;
  - no mock value ends up in a real `agent.json` (a test that walks a
    creation with mocks on and reads the saved file).

### Phase 5: Build the blocks A–F
- One sub-phase per block, in the order A, B, D, C, E, F (making and
  talking first, because they carry the most behavior).
- **Tests per block:** unit tests for the non-DOM logic (state reducers,
  mock readers), and one headless walkthrough script per journey in the
  block (like `walkthrough-jony.mjs` in the P2 folder), checking each step
  is reachable and shows the right state.

### Phase 6: Package as a macOS .app
- Wrap the app as a real `.app`. The wrapper is an open choice for the
  build team (masters-wheel in `~/dev` uses Tauri; a lighter wrapper around
  the local Node server is also possible). The engine still runs through
  the user's own `claude` CLI.
- Keep `run:` in `.project` pointing at the newest build.
- **Tests:** the build makes a `.app`; a smoke test launches it and sees
  the home screen; the P2 chat answers through the real CLI once
  (`npm run test:live`).

### Phase 7: Journey acceptance (Columbo)
- Walk all twelve journeys in the packaged .app, as each user type from
  `journeys-columbo.md`. Write `acceptance-columbo.md`: what felt right,
  where people would stall, what to fix.
- **Check:** all walkthrough scripts green, the acceptance written, and
  any blocking finding fixed or logged in `issues.txt`.

## Status

- 2026-11-25: Phase 0 done. Roadmap and `journeys-columbo.md` written.
  Next: Merlin (Phase 1).
