# 04 — Eraser: clutter check and sign-off (DRAFT, in progress)

Goal: give the agent a folder, then see and shape what went into System prompt, Knowledge and Skills.

## Checked so far

- `npm test` (2026-11-27, branch `studio/clutter-check-and-sign-off-dc5df55c`, base `ca3f61f`): 182 tests, 181 pass, 1 skip (live CLI), 0 fail.
- Code read: `src/server/public/creation-screen.js`, `src/server/public/new-agent.html`.

## Clutter candidates found in the code read (to confirm in browser)

1. Empty-section wording differs: belts say "nothing yet · drag a firefly here", Skills says "nothing yet · drag files here". Two phrasings for one state.
2. Close a popup: Close button · Esc · backdrop. Native dialog habits; likely keep.
3. Give a folder: Select Folder · drop anywhere (from FIREFLIES-BUILD, already signed). Keep.
4. No second remove, no extra open buttons next to icons: confirmed in the code.

## Open (not clutter, missing per roadmap, not mine to add)

- No Undo after a zone drop (no unassign endpoint). Roadmap Phase 3 asks for one.
- No "waiting" mark on routed fireflies (roadmap Phase 3, Merlin's hollow ring).
- Keyboard can't move fireflies.
