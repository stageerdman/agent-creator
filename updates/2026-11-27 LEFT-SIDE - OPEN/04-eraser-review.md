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
_(pending)_
