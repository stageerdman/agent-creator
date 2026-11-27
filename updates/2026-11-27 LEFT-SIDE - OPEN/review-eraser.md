# Left Side: Eraser sign-off (copy of `Reports/left-side-signoff.md`)

Reviewed: branch `studio/roadmap-design-and-build-the-left-side-739912da` at `b883166`
(Jony's build, plus `78b2bfb` "Keep" and Send key). My first pass was `04-eraser-review.md`
(commit `cf94300`, M1–M5). This file is the final sign-off and checks those points again,
along with anything new.

Ran: `npm test`, which gave 220 pass, 1 skip, 0 fail.

## Goal
After dropping a folder, the user watches the agent take shape, tells Sketcher what it is for, and keeps it.

## Step count (common path, after the drop)
| # | Step | Mark |
|---|---|---|
| 1 | Watch the likeness form | Keep (magic, costs nothing, skippable) |
| 2 | Notice the handle (slides in, one blink) | Keep (the one signpost) |
| 3 | Click/tap/Enter/Space the handle | Keep (the **one way in**) |
| 4 | Focus the box | Automated ✅ |
| 5 | Type what the agent is for | Keep |
| 6 | Press Enter (no send button) | Keep ✅ |
| 7 | Read the reply (repeat 5–7) | Keep |
| 8 | Press **Keep** | Keep |
| 9 | Close with `‹` (Esc is its key) | Keep (the **one way out**) |

**Current: 9 (11 when a send fails). Target: 9 (9 when a send fails).**

## Double ways: checked
- Ways into the chat: only `#handle`. Nothing on the right menu, no hotkey, no second label button. ✅ The hover label "Sketcher" belongs to the same button.
- Ways out: `#sketcher-close` (‹), with Esc as its keyboard form. Clicking outside does nothing, and the handle sits under the panel while it is open. ✅
- Ways to send: Enter only. ✅
- Ways to finish: one Keep button. ✅ Two lines around it still say "create" or "is yours" (M1).

## Must change (RETURNED until done)
| # | What | Status at b883166 |
|---|---|---|
| M1 | One word, Keep. The button already says Keep ✅. Change the error line to **`Couldn’t keep it. Try again.`** and the success line to **`Yours. You can keep changing it.`** (`left-side.js:232-233`). | half done |
| M2 | `saysReady` matches only `press keep` (not `\bready\b`, `:82`). Never show Keep once the agent is or was kept. | open |
| M3 | A failed send puts the message back in the box (`:207` clears it before the fetch). | open |
| M4 | The likeness dims at 50 % (323 → 210 lit px). Fix the cause. Check 4 must count lit pixels and require them to rise at every step. | open |
| M5 | A whole flash while the panel is open is held, and **one** flash plays on close (`:122`, `:191`). Add a unit test. | open |
| M6 (new) | `.scratch-home/` test agents were committed in `b883166` (10 files). `git rm -r` them and ignore the folder. | open |
| M7 (new) | `design-jony.md`: Eraser asked for **Keep**, not Create. Line 10 and the "Ready" row should say Keep. The hover label is the handle's own name, not a removed button. | open |

## Kept on purpose (not clutter)
Second handle blink (capped at 2, stops after the first open). Look-back flash (once, after M5). The handle's hover label.

## Verdict
**RETURNED.** Lean at 9 steps, with one way in, one way out, one way to send and one way to finish. M1–M7 come first, and the rework is Jony's job.

## Sign-off
_(pending: Jony's fix commit)_
