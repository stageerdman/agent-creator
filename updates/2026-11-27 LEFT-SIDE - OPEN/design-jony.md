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
| Sketcher failed | "Sketcher couldn’t answer. Try again." The box stays usable. |
| Ready | The Create button appears. |
| Reduce Motion | No flights, no sliding, no zoom. Dots switch on in place. The blink is a single step. |
| Small screen (<640 px) | The panel spans the full width. The handle stays on screen, 44×48 px. |

## Interaction
- Click, tap, Enter or Space on the handle opens the panel and focuses the box.
- `‹` or Esc closes it and moves focus back to the handle. Esc in the panel is caught first (capture + stopImmediatePropagation), so the page's own Esc→home never fires. You stay on the screen.
- If the likeness changed while the panel was open, it flashes once after the panel closes, so you notice the change.
- While some files are still unused, the screen asks for the agent every 2 s. It stops once every file is used, or while the tab is hidden.

## Choices made without a teammate's answer (flag to Columbo)
- **Chat endpoint**: assumed `POST /api/agents/:id/chat` streaming SSE `delta` / `files` / `draft` / `done` / `error`. This matches the current server.
- **Create** posts `/api/agents/:id/save` (Keep). The creator prompt still says "press Keep" while the button says Create. Ready is detected with `/\bready\b|press keep/i`. The two words should become one.
- **Panel width**: full window under 640 px, else 440 px.
- `src/server/app.mjs` now serves `left-side.js`. Without it the page 404'd and went blank. This is a one-word change outside my files.

## Tests
- `src/server/public/left-side.test.mjs`: 12 unit tests (behaviour report §7, checks 1–11). The full `npm test` passes: 220 pass, 1 skipped (live).
- `checks/left-side-check.cjs`: the browser check. Run it as
  `AGENT_CREATOR_HOME=<scratch> PORT=3505 npm start`, then
  `node checks/left-side-check.cjs http://localhost:3505 --home <scratch>`. ALL PASS.
  On this machine Chrome is killed from outside after about 25 s, even on a blank page. When that happens the check starts over, up to 4 times.
