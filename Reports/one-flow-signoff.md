# One flow — sign-off (Eraser)

**Verdict: APPROVED**

## Goal

The user presses + and gives a folder; the agent is made, and the same fireflies that wait in the
orbit become the field of files on the left. No icon, no jump, no freeze.

## Step Count

| # | Step | Mark | Why |
|---|------|------|-----|
| 1 | Press + on the home | Keep | The one way in. The fireflies go to the ring in the middle, not into the button. |
| 2 | Click "Select Folder" (or drop a folder anywhere) | Keep | One control. Pick and drop are the same step done two ways, and both use the one intake (`file-intake.js`). Drop has no target of its own, so there's nothing to aim at. |
| 3 | Choose the folder in Finder | Keep | The system picker. We can't skip it. |
| — | Handing over from the + screen to the creation screen | Cut (already gone) | No second screen to read, no logo and no first-light wait. The same 30 flies hand over in one frame. |
| — | File count and "waiting / used / processing" lines | Cut (already gone) | Only one word is shown at rest: "Select Folder" at .24. |
| — | "New agent" message | Keep (VoiceOver only) | Screen readers need it. Sighted users don't see it. |

**Current: 3 steps. Target: 3. Met.** Everything after step 3 happens on screen with nothing for the user to do.

## Clutter review

- One entry (+ in `agent-home.html` → `/new`) and one control (`#pick`), with one Tab stop.
- One hidden folder input and no second drop target.
- 2 canvases, with no img or svg.
- No duplicate ways to do the same thing, and no labels left over.
- A text or link drop makes no agent. A second drop makes no second agent.

## What I checked

- `npm test`: 206 pass, 1 skip, 0 fail.
- `checks/build-screen-check.cjs`: ALL PASS on WebKit and on bundled Chromium.
- `checks/creation-screen-check.cjs`: ALL PASS on WebKit and on bundled Chromium.
  - 10,000 files: longest frame 18 ms (WebKit) and 17 ms (Chromium).
  - 30 flies hand over in one frame, and the menu comes in after the hand-over.
  - 10,000 counted, 3,000 drawn.
- Start (`npm run start:app`): builds, installs and opens `/Applications/Agent Creator.app`.
  - `build-screen-check.cjs http://localhost:3517 webkit --read-only` against the app's own server: ALL PASS.
  - The ring is lit from the first frame, pick and drop each hand over in one frame, the menu comes at ~300 ms and there are no page errors.
  - Reduced motion: also ALL PASS.

## Note on system Chrome

System Chrome (channel `chrome`, v158) disconnects after 6–9 s even on a blank canvas page with
no app code. That's a problem with this machine's browser, not the app. Bundled Chromium 159 passes everything.

## For Jony (small, not blocking)

- `checks/build-screen-check.cjs:250` has a comment that is out of date: "a second drop during first light does nothing".
  First light no longer exists, so the comment should say "a second drop makes no second agent".
- Watch out later: the field's fireflies only move a few px (DRIFT_MAX 3). Real wandering is a
  separate task. When it lands, check that it doesn't add a long frame at 10,000 files.
