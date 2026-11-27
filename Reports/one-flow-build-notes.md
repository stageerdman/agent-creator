# ONE FLOW: build notes (Jony) — DRAFT, plan

Spec: `Reports/one-flow-magic-moment.md` (§4–§7, numbers §10).

## Plan (decided)

1. **Home → /new: one screen by handing over the time.** The + runs
   `gatherToRing` (firefly-gather.js, D = 1000 ms). It imports from
   firefly-orbit.js `makeFlies()`, a pure `ringPos(f, ms, W, H)` and the DNA
   sprite. Epoch = the call's t = D. Each of the 30 slots takes the nearest
   spawn point; it flies to its ring position at its arrival time and rides
   the ring until D, ending at `a0`, `clampR(r0)`, DNA sprite. The other ~370
   aim at the nearest slot and merge (last 18%). Plus glow, pulse and halo
   are deleted. The canvas is not removed at the end (no blank frame); it
   keeps drawing the ring until the page goes. Resolves `{ epoch }` (wall
   ms); home writes `sessionStorage['glade.call']` and opens /new.
2. **Orbit (/new):** `createOrbit({ canvas, text, reduced, epoch })`. The
   epoch drives angles, breath and wander, so /new continues exactly. With
   an epoch: no fade-in. Deleted: call dot, logo, first light, gather into
   emblem, ring-out, m = 6 spin-up. `Select Folder` rests at .24, lean .36.
   `release()` = the signal (alpha → .8 in 120 ms, radius +6%, speed
   unchanged, word out 160 ms) and hands the 30 live objects to the field in
   the same frame. `restore()` after a failed save: ring back at rest, 600 ms.
3. **Field adopts:** each fly keeps circling until it leaves (120 ms + 0–240
   ms, left first), cubic 780 ms flight along its tangent, wobble 2 → 0, .8
   → .32 over the last 600 ms, lands on its file's spot + drift. Fly i =
   file i; unknown yet → provisional spot, retarget 400 ms. Fewer than 30
   files: the rest fade along the way. Further files light in place, ≤ 24
   per frame, from ~500 ms. No shine before 1.5 s after landing. The field
   is fed from the entries at once; server DNA later has the same ids.
   Menu slides in at 300 ms; name and sections fill when saved.
4. **One intake:** new-agent.html uses file-intake.js (`attachIntake`),
   gated off once the creation screen owns dropping. `start` only at the
   first real entry; new `found` event as entries are read; the robust drop
   walker moves from firefly-orbit.js into file-intake.js.
5. Reduce Motion: ring at rest; signal = brighten in place, 300 ms cross-fade.

## Steps

- [ ] firefly-orbit.js + test
- [ ] firefly-gather.js + agent-home.html + test
- [ ] file-intake.js + test (walker moved in)
- [ ] creation-screen.js field adopt + pour + test
- [ ] new-agent.html wiring
- [ ] checks/build-screen-check.cjs, checks/creation-screen-check.cjs
- [ ] final notes, issues.txt (two intakes → resolved), Start check

Known limit: a drop on the home during the call is not taken (the home has
no drop); /new takes clicks and drops from its first frame.
