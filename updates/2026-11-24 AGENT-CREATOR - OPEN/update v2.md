# AGENT-CREATOR — update v2: 9 fixes on the split creation screen

## Goal

The user tried the split creation screen and asked for 9 fixes. The fixes
make the screen quieter, make the fireflies feel alive but calm, and add
three small interactions. This file is the roadmap. Jony builds it, and
Eraser checks each fix against its **Done looks like** line in the running
app.

Files in play: `src/server/public/creation-screen.js`, `firefly-gather.js`,
`firefly-orbit.js` and their styles. `fireflies-dna.js` only if the dim
shine or the slow drift has to live there.

Rule from `principles/magic-ux/design-rules.md`: checks look at what the eye
sees, not only at internal state. Each "Done looks like" line is something a
person can see on screen.

## Phase 1 — Remove clutter

### Fix 1: remove the file count below the screen
- **Why (user):** The number below the screen tells me nothing I need; it is
  just noise under the agent.
- **Done looks like:** Open an agent with files. Nothing below the screen
  shows a file count (no "N files", no number line). Drop a big folder: still
  no count appears.

### Fix 7: remove "x waiting" and every similar status line
- **Why (user):** Lines like "1 used · 2 waiting · 1 out at next rebuild"
  read like a machine log; the fireflies already show what is happening.
- **Done looks like:** Add, process and remove files. No text with
  "waiting", "used", "out at next rebuild", "processing" or any other
  counter or status word appears anywhere on the screen, at any moment.

### Fix 9: no fireflies next to the agent's name
- **Why (user):** The fireflies by the name crowd it and pull the eye away
  from the agent itself.
- **Done looks like:** The agent's name stands alone. No dot, glow or firefly
  sits beside or around it, before, during or after files arrive.

## Phase 2 — Firefly behaviour

### Fix 2: every file firefly drifts slowly and now and then shines, very dim
- **Why (user):** Still dots look dead, and bright flashes are tiring; I want
  them gently alive in the corner of my eye.
- **Done looks like:** Watch the screen for 20 seconds without touching it.
  Every file firefly moves a little, slowly, on its own. Now and then one
  brightens softly and fades back; it is never a bright flash, and they never
  all shine at once. With reduced motion on, they stay still.

### Fix 3: fireflies can't be dragged
- **Why (user):** Grabbing one by accident moved it and felt broken; they are
  not things I arrange.
- **Done looks like:** Press on a firefly and drag the mouse (or finger). The
  firefly does not follow and does not move from its spot; no grab cursor
  shows.

### Fix 5: Knowledge and System prompt fireflies sit in a loose, organic cluster
- **Why (user):** A straight row looks like a spreadsheet, not a swarm.
- **Done looks like:** The Knowledge and System prompt fireflies each form a
  loose, uneven cloud with no straight line or grid in it. Reload the page:
  each cluster has the same shape as before (it is seeded, not random each
  time).

## Phase 3 — Interactions

### Fix 4: each skill shows its name next to it
- **Why (user):** I can't tell my skills apart if they are only dots.
- **Done looks like:** Every skill firefly has its name in plain text right
  next to it, readable without hovering or clicking.

### Fix 6: tapping a cluster flies the fireflies to their spots, and back
- **Why (user):** I want to see which files are in Knowledge or the System
  prompt, and a list dropping down breaks the magic; the fireflies themselves
  should show me.
- **Done looks like:** Tap the Knowledge cluster. Each firefly flies along a
  visible, eased path (a little staggered, not all at once) to its own spot
  in a clear order, and its file name shows by it. No list or panel drops
  down. Tap again: they fly back into the loose cluster. Same for System
  prompt. With reduced motion on, they snap into place and back with no
  flight.

### Fix 8: click the agent's name to rename it
- **Why (user):** Renaming should happen right where the name is, not
  somewhere else.
- **Done looks like:** Click the name: it becomes editable in place. Type a
  new name and press Enter, or click elsewhere: the new name stays, also after
  a reload. Press Esc while typing: the old name comes back. Clear the name and
  press Enter: the old name stays. There is no second rename button or field.

## Overall done

- All 9 fixes are visible in the running app, each matching its "Done looks
  like" line.
- Tests pass: `creation-screen.test.mjs`, `firefly-gather.test.mjs`,
  `firefly-orbit.test.mjs`, `fireflies-dna.test.mjs` and
  `checks/creation-screen-check.cjs`. Tests that checked the old count or
  status lines are removed.
- Start opens the newest build, not an old cached one.
