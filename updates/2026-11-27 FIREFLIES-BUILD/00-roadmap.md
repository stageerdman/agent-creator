# FIREFLIES-BUILD: roadmap

The screen that opens when you press the plus on the home (or Cmd+N).
It is where a new agent starts: you give it a folder. It belongs to
journey step **UJ2 · 1, "Brings a folder, files or a path"** in
`updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`.

The page is the existing `/new` (`src/server/public/new-agent.html`). It
keeps the `glade.call` arrival fade that home already hands over.

Order of work: Columbo (research) → Merlin (motion) → Jony (build) →
Eraser (sign-off).

## The user's fixed rules (constraints, not up for change)

- Very dim fireflies circle the middle of the screen, each at its own
  speed.
- Hovering the middle shows **Select Folder**, very faintly, in the
  firefly colour and glow. A few fireflies near it brighten.
- A click opens the Finder folder picker.
- A drop works **anywhere** on the screen.
- After a pick or a drop, every firefly lights up and speeds up, then
  the screen moves on to the placeholder.
- The Fireflies DNA look: dot radius 2.5 to 6.0 (`MIN_R`, `MAX_R` in
  `src/server/public/fireflies-dna.js`), the same glow and colour. No
  size controls.
- Reduce Motion is respected.
- One way to do each thing. No extra buttons, labels or drop targets.

## Phase 1: the fireflies orbit on /new

- Arrive from the plus or Cmd+N. The arrival fade plays, then the
  orbit is there.
- Dim fireflies circle the middle, each at its own speed (numbers in
  `02-merlin-motion.md`).
- Hover the middle: **Select Folder** fades in very faintly; a few
  nearby fireflies brighten. Mouse away: it fades out.
- Click the middle: the Finder folder picker opens (native dialog in
  the app, the browser folder picker on the dev server).
- Drop a folder or loose files anywhere on the window. While dragging,
  a quiet sign in the same light says a drop will work.
- Both ways end in one call, `onChosen(entries)` with
  `entries = [{ path, size }]`.
- The agent is made with the existing routes: `POST /api/agents` →
  `{ id }`, then `POST /api/agents/:id/files` with `{ files }`.
- Burst: every firefly goes to full glow and speeds up.
- Cancel Finder, or drop something with no files in it: a gentle
  settle back to the orbit. No error box, nothing created.
- Esc (or Back) goes home. Nothing is created until a folder is chosen.
- Reduce Motion: still dots, brightness changes only. No circling, no
  speed-up.

Done when: hover, click-to-pick, drop-anywhere, cancel and Esc each
work the one way described, in Chrome and in the app.

## Phase 2: the calm placeholder for the next screen

- After the burst, the screen settles into a calm placeholder on the
  same Fireflies background. It is a state of `/new`, not a new page
  with buttons.
- It shows the agent was made: the files were sent. It has no controls
  of its own (design rule: no dead UI). Esc still goes home, where the
  new agent now sits at the top of the list.

Done when: every pick and every drop ends on the placeholder, and the
new agent is on the home list after Esc.

## Later phases (named, out of scope now)

- **Phase 3: the inventory.** What is in the folder, in the user's own
  folder names: kinds, counts, sizes, what will be skipped and why
  (UJ2 · 2). Out now: it needs reading the files on disk and a real
  design of its own.
- **Phase 4: the proposed split and the Sketcher chat** (UJ2 · 3).
  Out now: it depends on Phase 3 and on the creator engine.
- **Phase 5: learning, the honest wait and "done"** (UJ2 · 4–6). Out
  now: background work that survives closing the app is a separate,
  large piece.
- **Making from one line, with no folder** (UJ3). Out now: the user's
  brief for this screen is folder only. Raised as an open question in
  `01-columbo-report.md`.
- **Adding more material to an existing agent** (UJ8). Out now: it
  starts from the agent page, not from the plus.

These come later because each one needs the step before it to be real
first, and the user asked for the orbit and the hand-off only.

## Test, Start, sign-off

1. `npm test` passes, including `src/server/public/firefly-orbit.test.mjs`.
2. Works in the browser dev server, in the real Tauri app and in the
   installed build (`scripts/install-mac-app.sh`).
3. Start (`scripts/start-mac-app.sh`), then the plus, opens it.
4. Eraser checks it with `checks/build-screen-check.cjs` in Chrome,
   WebKit and the installed build, and writes `04-eraser-signoff.md`.

**Done: works in the real app and in the installed build, Eraser signed
it off, Start opens it.**

## Files in this folder

- `00-roadmap.md`: this file (Columbo)
- `01-columbo-report.md`: behavior research (Columbo)
- `02-merlin-motion.md`: motion and glow spec (Merlin)
- `03-jony-build.md`: what was built and how to try it (Jony)
- `04-eraser-signoff.md`: sign-off (Eraser)
