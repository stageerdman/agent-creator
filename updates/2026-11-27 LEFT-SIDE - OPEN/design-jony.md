# Left Side — design and build notes (Jony)

## User goal
You drop a folder and watch your agent take shape. Then, when you want to say what it is for, you talk to Sketcher. Two jobs: **see it forming** and **talk to it**. Nothing else lives on the left.

## What is on screen
- **The likeness** (`canvas#mark`): the agent's Fireflies DNA mark, in the middle of the free space. It holds only the files that have been used. Unused files keep flying in the field.
- **The flights** (`canvas#sky`): when a file is used, its firefly wakes, leaves the field and flies into the likeness. Then the likeness gains its dots.
- **The handle** (`button#handle`, the `›` on the left edge): the only way into Sketcher. It slides in 900 ms after the agent exists. It blinks at most twice per agent, and never after the first open.
- **The Sketcher panel** (`aside#sketcher`): a glass panel holding the chat log, one text box and a Create button that is hidden until Sketcher says the agent is ready. It has one way out, the `‹` button, and Esc works as the keyboard shortcut for it.

## What I removed
- A "Sketcher" label button next to the arrow, a send button and a header menu. Enter sends, so there is one way to send and one way in.
- Progress numbers and percentages. How full the likeness is shows the progress.
- A separate opening animation. The panel slides 280 ms; under Reduce Motion it just appears.

## States
| State | What you see |
|---|---|
| No agent yet | Nothing on the left. |
| Agent, nothing used | An empty likeness (one still dot). The handle slides in. |
| Files being used | Fireflies fly into the likeness, and it gains dots. |
| All used | The whole likeness, which flashes once (only once per agent, never on a later visit). |
| Panel open | Glass panel over the left side. The box has focus. The handle reads expanded. |
| Sketcher thinking | "Sketching…" in the log. |
| Sketcher failed | "Sketcher couldn’t answer. Try again." Your message is back in the box, focused: trying again is one Enter. |
| Ready | Sketcher says "press Keep": the Keep button appears. Never once the agent is kept. |
| Kept | "Yours. You can keep changing it." Keep never shows again for this agent. |
| Keep failed | "Couldn’t keep it. Try again." The button stays. |
| Reduce Motion | No flights, no sliding, no zoom. Dots switch on in place. The blink is a single step. |
| Small screen (<640 px) | The panel spans the full width. The handle stays on screen, 44×48 px. |

## Interaction
- Click, tap, Enter or Space on the handle opens the panel and focuses the box.
- `‹` or Esc closes it and moves focus back to the handle. Esc in the panel is caught first (capture + stopImmediatePropagation), so the page's own Esc→home never fires. You stay on the screen.
- If the likeness changed while the panel was open, it flashes once after the panel closes, so you notice the change. If it became whole while open, its whole flash waits for the close too: one flash there, never two.

## Eraser's review (04-eraser-review.md): what changed
- **M1** The button already said Keep. The lines now read "Couldn’t keep it. Try again." and "Yours. You can keep changing it."
- **M2** Ready is only "press / tap / hit / click (on) Keep". If Sketcher words it some other way, the button stays hidden, but the agent is already autosaved, so nothing is lost. A ready signal from the engine (`done.ready`) would be safer than matching words. That's flagged in issues.txt for whoever wires the chat to the engine. Keep never shows when `draft.status === 'saved'` or after a Keep in this browser (`left.kept.<id>`).
- **M3** A failed send puts the message back in the box and focuses it.
- **M4** Cause: the shared logo shrinks each dot as the count grows (`sqrt(12/N)` above 12 dots) and zooms out to fit, so its lit area stays flat or falls from 50% to 100%. (The 323→210 reading was mostly one frame's blinks; averaged it was 233→414 from 25% to 50%.) The approved logo stays as it is. Instead, the Left Side scales the mark from half size up to full: `markGrow = .5 + .5·sqrt(placed/whole)`, a 600 ms ease (none under Reduce Motion), and the flyers land on the scaled mark. Check 4 now reads lit pixels on screen (canvas pixels × scale², averaged over 3 s) and needs them to rise at every step: 6 → 184 → 263 → 621.
- **M5** A whole flash that comes while the panel is open is held. The close plays one flash.
- Optional ideas: skipped for now. The path already hits Eraser's target of 9 steps.
- While some files are still unused, the screen asks for the agent every 2 s. It stops once every file is used, or while the tab is hidden.

## Choices made without a teammate's answer (flag to Columbo)
- **Chat endpoint**: assumed `POST /api/agents/:id/chat` streaming SSE `delta` / `files` / `draft` / `done` / `error`. This matches the current server.
- **Keep** posts `/api/agents/:id/save`. The button now says **Keep**, the same word the creator prompt, the API and its tests already use, so there is one word for one action. (Eraser suggested renaming everything to "Create". That would change the creator's prompt and the server tests, which is outside the Left Side, so Columbo can decide if the whole app should switch.) Ready is detected with `/press keep/i` only.
- **Eraser's Q1/Q2 (can you make an agent without opening Sketcher?)**: yes. The agent exists and autosaves from the drop, and Keep only marks it kept. So the handle is never a hidden step on the main path.
- The box has `enterkeyhint="send"`, so phone keyboards show Send.
- **Panel width**: full window under 640 px, else 440 px.
- `src/server/app.mjs` now serves `left-side.js`. Without it the page 404'd and went blank. This is a one-word change outside my files.

## Tests
- `src/server/public/left-side.test.mjs`: 13 unit tests (behaviour report §7, checks 1–11, plus M4). The full `npm test` passes: 221 pass, 1 skipped (live).
- `checks/left-side-check.cjs`: the browser check. Run it as
  `AGENT_CREATOR_HOME=<scratch> PORT=3505 npm start`, then
  `node checks/left-side-check.cjs http://localhost:3505 --home <scratch>`. ALL PASS.
  On this machine Chrome is killed from outside after about 25 s, even on a blank page. Check 4 opens a fresh Chrome, and if Chrome is quit in the middle of a step, it reads that step again on a fresh visit. Anywhere else the check starts over, up to 4 times.
