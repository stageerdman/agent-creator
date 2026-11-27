# Left Side — Eraser review

Reviewed: branch `studio/design-and-build-the-left-side-and-the-o-3491081e`, commits 883b65a..f81d825.
Read: `design-jony.md`, `src/server/public/left-side.js`, the `new-agent.html` diff, `src/server/routes/agents.mjs`, `src/creator/creatorPrompt.mjs`.
Ran: `npm test` (220 pass, 1 skip). `node checks/left-side-check.cjs http://localhost:3506 --home .scratch/eraser-left`, twice, Chrome: ALL PASS both times. Even so, finding 4 below is a real problem the check misses.

## Goal
After dropping a folder, the user watches the agent take shape, tells Sketcher what it is for, and keeps it.

## Step count (common path, after the drop)
| # | Step | Mark | Why |
|---|---|---|---|
| 1 | Watch the likeness form | Keep | This is the moment's magic. It costs nothing because the user can skip it. |
| 2 | Notice the handle (slide in + one blink) | Keep | This is the only way forward, so a single signpost is earned. |
| 3 | Click/tap/Enter/Space the handle | Keep | There is one way in. |
| 4 | Focus the box | Automate ✅ | It is already automatic. |
| 5 | Type what the agent is for | Keep | Only the user knows this. |
| 6 | Press Enter | Keep ✅ | There is no send button. |
| 7 | Read the reply (repeat 5–7 as needed) | Keep | |
| 8 | Press the finish button | Keep, **rename** | See M1. |
| 9 | Close the panel (‹ or Esc) | Keep ✅ | There is one close button with one shortcut. |

Error path today: 10 retype the lost message, 11 Enter. **Cut both** (see M3).

**Current: 9 steps (11 on the error path). Target: 9 (9 on the error path).** The main path is already lean. What has to change is the words and the cases that break.

## Must change (RETURNED until done)
- **M1. One word: `Keep`, not `Create`.** (your point 1) Keep is the settled finish word (FULL-UX magic-merlin §6, "Keep / Kept"), and the server route, the creator prompt and the tests all say Keep. Rename the button to **Keep** and the error line to "Couldn’t keep it. Try again." After it succeeds, use the §6 line "Yours. You can keep changing it." in place of "[Name] is yours." Leave the prompt alone.
- **M2. Keep must not show up by accident or twice.** `saysReady` matches `\bready\b`, so a first reply like "Ready when you are, what's it for?" brings up Keep before anything exists. Match only the Keep line the prompt actually writes (`press Keep`). Never show the button when `draft.status === 'saved'`: Keep happens once, and the prompt already stops pointing to it by then.
- **M3. A failed send must not cost a retype.** Right now the box is cleared before sending. When the reply fails, put the message back in the box, so "Try again" is a single Enter.
- **M4. The likeness gets dimmer as it fills.** In the browser check, the lit pixels on `#mark` drop at 50% used, even though the dot count doubles. Run 1: 25% → 323, 50% → 210. Run 2: 333 → 211. The user sees the likeness shrink just as it should be growing. Check 4 passes only because it reads `mark.placed`, which is exactly the trap our design rules warn about ("checks look at what the eye sees"). Find the cause and fix it. Then make check 4 require lit pixels to rise at every step.
- **M5. One flash per close, never a wasted one.** If the likeness becomes whole while the panel is open, the whole flash (`WHOLE_WAIT`) plays hidden behind the glass, and then the look-back flash plays again on close. While the panel is open, hold the whole flash until the close, and play **one** flash there.

## Your points
1. Keep vs Create: see M1. Use **Keep**.
2. **Second blink: keep it.** It adds no step and only one motion. It never repeats (2 per agent, ever), it stops after the first open, and it only fires when nothing has happened for 25 s, which is when the user needs pointing to the only way forward. That is a signpost, not clutter.
3. **Look-back flash: keep it.** It fires right after the user's own action and points at what changed behind the glass (at 1280 px most of the likeness sits under the 440 px panel, and under 640 px all of it does). Fix the double flash (M5). Optional, your call: if the likeness moved into the free space beside the panel when there is room, the look-back would only be needed on small screens.

## Watch later (not blocking)
- The creator prompt says "pressing Keep in the Sketch", but this page has no Sketch with a Keep button, only this one. Ask Columbo whether that wording should change.
- `draft.mjs` turns a kept agent back into a draft on any change, while our rule says "Keep happens once". Handle this as part of M2: hide the button once the agent was ever kept. Don't reopen the question here.
- Optional: typing while nothing has focus could open the panel with those keys, a keyboard form of the handle with no new button. Only do it if it doesn't clash with editing the name.

## Verdict
**RETURNED.** The path is lean: 9 steps, no duplicate ways, one way in and one way out. But M1–M5 must be fixed first: one wrong word, two cases that break, one visible bug, and one check that doesn't look at the screen. The rework is Jony's job. When it's back, I will rerun `npm test` and the browser check (with check 4 on pixels) and sign below.

## Sign-off
_(pending, see the re-review below)_

---

# Re-review (round 2): branch `studio/left-side-review-returned-the-full-revie-850ca84f`, commits 512d11c + 123de76

Ran on 123de76 (checked out on its own): `npm test` gave 221 pass, 1 skip, 0 fail. `node checks/left-side-check.cjs` on system Chrome gave **ALL PASS**. Check 4 now reads lit pixels on screen: **6 → 190 → 253 → 674** (Jony measured 6 → 184 → 263 → 621). Chrome was quit from outside once, and the check read that step again on a fresh visit, as designed.

Trial merge into `main` (cfcb515): it **conflicts** in `left-side.js`, `left-side.test.mjs` and `design-jony.md`. Main already has its own M1–M3 and M5–M7 (21db835), plus chat history restored after a reload and `streamChat` (cfcb515). So this branch can't land as it is.

## Step count (common path, unchanged)
1 watch, 2 notice handle, 3 open, 4 focus (auto), 5 type, 6 Enter, 7 read, 8 Keep, 9 close. **Current: 9. Error path: 9** (the message comes back, one Enter). Target was 9 / 9. ✅

## Each point
| # | Status on this branch | Note |
|---|---|---|
| M1 | ✅ done | Both lines are right. |
| M2 | ✅ done, better than main | `press/tap/hit/click (on) Keep` plus a tight negative test. `kept(store, a)` also remembers a Keep in this browser (`left.kept.<id>`), and that covers what main misses: `draft.mjs` flips a kept agent back to draft on any change, so on main Keep can come back. The engine ready flag in issues.txt is the right long-term fix. |
| M3 | ⚠ worse than main | The message goes back in the box (good), but the "you" line stays in the log (`left-side.js:228`). The retry adds a second copy, so the log shows the same message twice. Main removes it (`mine.remove()`). Keep main's removal, and add this branch's focus + cursor at the end. |
| M4 | ✅ done, verified on screen | `markGrow` scales the mark from half to full, with no motion under Reduce Motion and none on a fresh visit. The flyers aim at the scaled mark. Check 4 now looks at what the eye sees. This is the one thing main doesn't have. |
| M5 | ⚠ one gap, main has it covered | If the panel opens during `WHOLE_WAIT`, the timer (`:135`) still flashes behind the glass, and then the close flashes again. Main re-checks `open` when the timer fires (`:155`) and has `closeFlash` with a test. Keep main's version. |
| M6 | ✅ | `.scratch-home/` is ignored (also on main). |
| M7 | ✗ not done | `design-jony.md:10` still says "a **Create** button". `:49` still says "Eraser suggested renaming everything to Create" (I asked for **Keep**) and "`/press keep/i` only" (no longer true). |

## One word to settle
The error line exists in two wordings: main says "Sketcher couldn’t answer. Press Enter to try again.", this branch says "Sketcher couldn’t answer. Try again." Pick one. I'd pick **main's**: it names the single step, and with the text already back in the box, Enter is all it takes. (On a phone the key reads Send, so "Try again" is fine only if Jony wants one line for every device. Jony's call, but it must be one line.)

## Must do before sign-off (Jony)
- **R1. Land on main, not beside it.** Merge main into the branch and resolve the conflicts so the result is main plus: M4 (`markGrow`, `dotsOf`, the `#mark` transform, flyers on `grow`, check 4 on pixels), the wider `saysReady` with its tests, `kept(store, a)`, and the focus with the cursor at the end. Keep main's `mine.remove()`, its `heldWhole` timer re-check, its `closeFlash` with its test, `streamChat`, and the restored chat log.
- **R2. M7:** fix `design-jony.md` lines 10 and 49 (Keep, not Create; I asked for Keep; ready is press/tap/hit/click Keep).
- **R3.** Use one error-line wording (see above).

## Verdict
**RETURNED (narrow).** The step count is right (9 / 9) and M4, the only open visual bug, is fixed and proven on screen. What's left is integration: this branch conflicts with main and would bring back a duplicate chat line and a hidden flash that main has already fixed. The rework is Jony's job. When it comes back as a clean merge on main, I'll rerun `npm test` and the browser check and sign here.
