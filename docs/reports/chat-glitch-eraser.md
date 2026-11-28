# CHAT-GLITCH: Eraser sign-off

**Verdict: APPROVED** (Eraser, 2026-11-28)

Fix commits checked: `a59c45e` and `bb3c4f6` (Jony).

**Goal:** When you type in the floating Sketcher chat and press Enter, your
message sits cleanly on the glass, and one firefly carries it there.

## Step count (unchanged: 2)

1. Type in the box. **Keep**
2. Press Enter. **Keep**: one send path (Enter → `requestSubmit` → one `submit` handler → one `fly()`).

The fixes add no steps, no buttons and no elements. They only remove things
that looked broken.

## What I checked

| # | Check | How | Result |
|---|---|---|---|
| 1 | No black background inside the glass | `chat-glitch-probe`: no fill on `#sketcher-log` or anything between it and the panel (Chrome, Chrome + Reduce Motion, WebKit). I also looked at the screenshots. Each message now carries its own dark glass shaped like the bubble, so text keeps AA contrast over a lit likeness (design rule: glass text). | PASS |
| 2 | No white shine behind Create, at rest or after it shows/moves | The halo now belongs to `#sketcher-box`, not the form. The form and Create have `box-shadow: none` and no `::before`/`::after`. The screenshot with Create showing has no glow around the button. | PASS |
| 3 | On Enter, one firefly flies from the box into the new "you" bubble and pops into it | The dot's last keyframe is the bubble's centre, 0 px off in both Chrome and WebKit. It never heads for the field (end x 362 vs field x 600). No `.send-fly` is left afterwards. Under Reduce Motion no frames fly and the line simply appears. | PASS |
| 4 | Nothing extra | One `.send-fly` creator (`left-side.js` `fly()`, and `land(false)` keeps it to one dot). The old form halo and form breath were moved onto the box, not duplicated. One effect per moment: the box halo while you type, the dot in flight, the bloom when it lands. | PASS |
| 5 | Full test suite | `npm test`: 404 tests, 402 pass, **0 fail**, 2 skipped. After rebasing onto main (`7540622`, Esc stops / queued send): 411 tests, 409 pass, **0 fail**, 2 skipped, and the probe passes again in all three runs. | PASS |
| 6 | Fresh Start build | `npm run start:app` rebuilt the Tauri app, installed it into /Applications and opened it. The page it serves on :3505 has the new CSS (`--ink`, no log fill, no form glow, halo on the box) and the new `landingPoint` flight. | PASS |

On item 6: I did not run the probe against the installed app, because it
creates agents and sends real chats into the user's own data. The probe ran
against the mock engine instead, in real Chrome and WebKit windows (the
WebKit engine is the same one the Mac app uses).

## Watch later

- The "you" bubble now gets its tint from an inset `box-shadow` over `--ink`.
  If anyone adds a real `box-shadow` to messages later, it will replace the
  tint. Use a second layer instead.
- `inside(to, L)` hides the flight when the new bubble is scrolled out of
  view. Keep the log scrolled to the new message *before* `fly()` measures it.
