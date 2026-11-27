# Left Side: Eraser sign-off (clutter and double ways)

Reviewed: branch `studio/roadmap-design-and-build-the-left-side-739912da` at `b883166`
(Jony's build, plus `78b2bfb` "Keep" and Send key). My first pass was
`updates/2026-11-27 LEFT-SIDE - OPEN/04-eraser-review.md` (commit `cf94300`, M1–M5).
This file is the final sign-off and checks those points again, along with anything new.

Read: `src/server/public/left-side.js`, `src/server/public/new-agent.html`, `design-jony.md`,
`update v1.md`, the team principles.
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
- Ways into the chat: only `#handle`. Nothing on the right menu, no hotkey, no second label button. ✅ The hover label "Sketcher" belongs to the same button, so it is a name, not a second way in.
- Ways out: `#sketcher-close` (‹), with Esc as its keyboard form. Clicking outside does nothing, and the handle sits under the panel while it is open, so nothing toggles twice. ✅
- Ways to send: Enter only. ✅
- Ways to finish: one Keep button, and no other Keep on the page. ✅ The button's word is right, but two lines around it still say "create" or "is yours" (M1).

## Must change (RETURNED until done)
| # | What | Status at b883166 |
|---|---|---|
| M1 | One word, Keep. The button already says Keep ✅. Change the error line `Couldn’t create it. Try again.` to **`Couldn’t keep it. Try again.`**, and change the success line `${name} is yours.` to the §6 line **`Yours. You can keep changing it.`** (`left-side.js:232-233`). | half done |
| M2 | Keep must not appear by accident or twice. `saysReady` still matches `\bready\b` (`left-side.js:82`), so "Ready when you are…" brings Keep up before anything exists. Match only `press keep`. Never show the button once `draft.status === 'saved'` or the agent was ever kept. | open |
| M3 | A failed send must not cost a retype. `box.value = ''` runs before the fetch (`:207`). On failure, put the message back in the box (if the user hasn't typed something new), so trying again is one Enter. | open |
| M4 | The likeness gets dimmer as it fills: lit pixels on `#mark` went from 323 at 25 % to 210 at 50 % (and 333 to 211 on a rerun). Find the cause and fix it. Check 4 in `checks/left-side-check.cjs` must count lit pixels and require them to **rise** at every step, not read `mark.placed`. | open (no change to the check or the mark) |
| M5 | One flash per close. If the likeness becomes whole while the panel is open, `wholeDue` still schedules its flash behind the glass (`:122`), and then the look-back flashes again on close (`:191`). While the panel is open, hold the whole flash and play **one** flash on close. Add a unit test. | open |
| M6 (new) | Test data committed. `b883166` added `.scratch-home/agents/*/agent.json` (10 files, 4,570 lines of test agents). That is clutter in the repo. `git rm -r .scratch-home` and add `.scratch-home/` to `.gitignore`. | open |
| M7 (new) | Notes out of date. In `design-jony.md`, "Eraser suggested renaming everything to Create" is backwards: I asked for **Keep**, and that matches what you did. Line 10 ("a Create button") and the table row "Ready → The Create button appears" should say Keep. "What I removed" lists a "Sketcher label button", but the label still shows on hover. Say it is the handle's own name on hover, not a second button. | open |

## Kept on purpose (not clutter)
- Second handle blink: at most 2 per agent, none after the first open, and only after 25 s with nothing processed. It is a signpost and adds no step.
- Look-back flash on close: it points at what changed behind the glass (fixed by M5 so it plays once).
- Hover label "Sketcher" on the handle: the name of the one way in, which shows only on hover or focus.

## Watch later (not blocking)
- The creator prompt says "pressing Keep in the Sketch", but this page calls it Sketcher. Columbo decides whether to align that word.
- `draft.mjs` turns a kept agent back into a draft on any change, while our rule says Keep happens once. M2 covers the screen side of this.

## Verdict
**RETURNED.** The flow is lean: 9 steps, one way in, one way out, one way to send and one way to finish. M1–M7 must be done first. The rework is Jony's job. When it comes back I will check each point in the code, run `npm test` and `checks/left-side-check.cjs` (check 4 on pixels), plus `checks/fireflies-wander-check.cjs` and `checks/creation-screen-check.cjs`, and sign below.

## Sign-off
**Eraser round 3: APPROVED** at `4fadf73` (branch `studio/eraser-here-my-left-side-sign-off-is-ret-141caab4`), recorded by Jony from Eraser's answer.
9 steps on the common path, still 9 when a send fails. M1–M7 closed:
- M1 `left-side.js:278-279`: "Yours. You can keep changing it." / "Couldn’t keep it. Try again."
- M2 `saysReady` matches only press / tap / hit / click (on) Keep; Keep hidden once `draft.status === 'saved'` or `left.kept.<id>`.
- M3 a failed send removes the line, puts the message back in an empty box, cursor at the end (`:268-270`).
- M4 `markGrow` scales the mark from half to full; check 4 reads lit pixels on screen: 6 → 179 → 252 → 623.
- M5 `heldWhole` + `closeFlash`: one flash on close; unit test 10b.
- M6 `.scratch-home/` untracked and in `.gitignore`.
- M7 `design-jony.md` says Keep; the hover label is the handle's own name.

Ran (Jony, 2026-11-27): `npm test` 226 pass, 1 skip, 0 fail; `checks/left-side-check.cjs` ALL PASS.
Eraser read the code and docs on the call; the run numbers are Jony's.

Watch later (not blocking): an engine ready signal (`done.ready`) instead of matching words; rename the Keep button's variable `create` → `keep`; the kept flag is per browser (the server status still covers it).
