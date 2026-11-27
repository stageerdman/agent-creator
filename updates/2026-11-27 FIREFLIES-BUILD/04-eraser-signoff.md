# 04 · Eraser sign-off: the + build screen (/new)

**Verdict: RETURNED. One fix is needed, and it's Jony's job.** Everything else passes.

- Build checked: `4c7deb7` (Jony's `new-agent.html` + `firefly-orbit.js`, from `c9b1754`..`cd55100`)
- Check: `node checks/build-screen-check.cjs <url> chrome|webkit [--read-only]` (`5e6f711`)
- Where:
  - Chrome on the dev server (scratch home)
  - WebKit on the dev server (scratch home)
  - The installed `/Applications/Agent Creator.app`, opened with Start (`npm run start:app`). Its server is on 3517 and serves the same `/new` and `firefly-orbit.js` as the checkout. WebKit, `--read-only`: the real home is not touched.
- Result: 75 of 76 checks pass on all three. All three fail the same 1.

## Goal and step count

Goal: give the new agent a folder and see it come alive.

| # | Pick path | Mark |
|---|---|---|
| 1 | Press + on home | Keep (the one way in) |
| 2 | Click the middle of the ring | Keep (the one control) |
| 3 | Choose the folder in Finder and confirm | Keep (macOS's own panel) |
| 4 | Watch the burst, ~1.5 s, until first light | Keep (it's the answer, and there's nothing to do) |

| # | Drop path | Mark |
|---|---|---|
| 1 | Press + on home | Keep |
| 2 | Drop a folder anywhere in the window | Keep |

There's no naming, no fields, no confirm and no second drop target. Esc goes home from any state. The step count is 3 (pick) or 2 (drop) plus the wait, which is the target. There's nothing left to cut.

## What passed

- **One way:** one control and one Tab stop. One hidden `webkitdirectory` input. No drop zone (the whole page takes a drop). No size controls. Only the two canvases are drawn.
- **Faint word:** "Select Folder" is invisible at rest. On hover it peaks at opacity 0.36 in the firefly colour `rgb(216,242,106)`. It's gone by 650 ms during a drag.
- **Radii:** 2.5 to 5.46 in every state, burst included.
- **Stir:** the ring speeds up to 1.6. A text or link drop settles back and makes no agent.
- **Cancel:** the lean holds while Finder is open. On cancel the word fades over ~910 ms, the speed doesn't change and no agent is made.
- **Pick and drop:** answer, then the burst (speed 6), then first light 1500 ms later. The DNA logo lights up and VoiceOver says "New agent". Exactly one agent is made with the right files, and the hidden file is left out. A second drop is ignored. The new agent is at the top of home.
- **Esc:** goes home from rest, during the answer, and from first light.
- **Reduce Motion:** no repaint and no movement over 1 s. Speed stays 1. Hover and stir change brightness only. Pick and drop reach first light in ~1100 ms, with the ring fading in place.

## Must fix (Jony)

1. **After a drop, a failed save leaves the ring stirred forever.** The ring keeps turning at 1.6× and every firefly stays +0.15 brighter, in Reduce Motion too.
   - Cause: `firefly-orbit.js` `answer()` (line 281) sets `S.stirring = false` but leaves `S.stirTw` at 1. The failed-save settle clears `mTw`, so `frame()` falls back to `m = 1 + .6*s` with `s = 1`.
   - Fix: end the stir in `answer()` too, by tweening `stirTw` to 0.
   - Check: line `8. after a failed save the ring is back to speed 1` must pass.
   - Status: Jony has accepted this as a whiteboard task.

## Watch items (not fixes)

- `orbit.endStir()` is exported but nothing calls it. The native Tauri drag-leave isn't wired up yet. Today the stir ends on its own after 150 ms.
- In `entriesOfDrop`, a mixed drop (some items readable as entries, some not) skips the loose file that has no entry. This is rare.
- Not driven headless: the real Finder panel and a real Finder drag inside the installed app. Someone needs to try them by hand once.
- A note for checks: in Chrome, a canvas read back with `getImageData` can differ by 1 in a few bytes even though nothing was repainted. The RM check counts repaints for this reason.
