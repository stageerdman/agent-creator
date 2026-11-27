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

- [x] firefly-orbit.js + test — API: `createOrbit({ canvas, text, reduced, epoch, now, wall, size })`;
      `ringPos(f, tt, W, H, { phase, loosen, reduced })` pure (tt = ms since epoch; gather uses tt < 0);
      `dnaSprite(doc)` exported; `release()` → `{ t, reduced, flies:[{i, ring, r0, a0, r}], at(i, t) → {x,y,tx,ty,v,r,a} }`
      (orbit clears its canvas and stops; caller's field draws from then); `restore()`; `TEXT_REST` .24, `WAKE` .8.
      `answer()`, logo, call dot, m = 6, first-light all deleted. new-agent.html still calls the old API (fixed in wiring step).
- [x] firefly-gather.js + agent-home.html + test — `gatherToRing(root, plus, { durationMs = 1000 })` → `{ epoch }`
      (null under Reduce Motion or on error); pure `planFlights(pts, ring, {px,py,vw,vh,D})`; `restoreHome()`
      (pageshow persisted: un-fade + remove the kept ring canvas). gatherToPlus, plus glow, pulse, halo deleted.
      Home writes `sessionStorage['glade.call'] = {epoch, t}` only when epoch is set.
- [x] file-intake.js + test — the one intake. Exports `BATCH, chunks, isHidden, entriesOfFiles(files), entriesOfDrop(dt, found)`
      (found(newEntries) after each readEntries batch, always async), `httpApi()` → `{createAgent, addFiles, getAgent, removeAgent}`,
      `createIntake({api, emit}).take(source, read)` where `read(found)` → Promise<entries>. Events: `start {source}` at the first
      real entry, `found {entries, total}`, `progress {sent,total}`, `done {agentId, agent, added, dna}`, `error {message, started}`;
      a failed save removes the agent. `attachIntake`, `toEntries`, `walkEntries`, `dropSource` deleted (unused); orbit's walker deleted.
      creation-screen.js imports `entriesOfDrop` from file-intake.js.
- [x] creation-screen.js field adopt + pour + test (creation-field.test.mjs, fake canvas + clock) — screen API:
      `adopt(hand)` (menu `body.split` at `MENU_AT` 300 ms, 0 under Reduce Motion), `feed(entries [{path,size}])`,
      `fail()` → Promise (900 ms fade, field empty, split removed, menu inert), `open(agent)` unchanged.
      `createField` exported; info() adds `lit, flyers, flying, queued`. Pure: `leaveOrder, flightAt, flyerAlpha, pourTake, asFile`.
      Flyers drawn with the DNA sprite, radius → `LAND_R` 4.5, then the file's dot (no fade). A flyer takes the next file
      only while still in the air; otherwise the file pours. Pour queue only up to FIELD_CAP.
- [ ] new-agent.html wiring
- [ ] checks/build-screen-check.cjs, checks/creation-screen-check.cjs
- [ ] final notes, issues.txt (two intakes → resolved), Start check

Known limit: a drop on the home during the call is not taken (the home has
no drop); /new takes clicks and drops from its first frame.
