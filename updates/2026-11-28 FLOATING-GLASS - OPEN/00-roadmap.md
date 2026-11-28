# FLOATING-GLASS: roadmap

Three changes on the Sketcher chat and the plus button:

1. **Glass fix.** The glass goes on the floating Sketcher chat only. The
   left side and the window behind the chat go back to solid.
2. **Firefly +.** The plus on the home turns into a firefly and flies off
   with the others.
3. **Firefly chat.** The Sketcher chat box, sending a message and the
   wait for an answer get firefly magic.

Journey step: **UJ2 · 3, the Sketcher chat** (and UJ2 · 1 for the plus),
in `updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`.

Order of work (design rules): research (Columbo) → magic (Merlin) →
design and build (Jony) → cut review and sign-off (Eraser). The captain
puts Eraser's required changes into the design, so the build reads one
file.

## What was asked, pinned down (Pixel, 2026-11-28)

- "The floating AI chat" is the **Sketcher panel on /new**
  (`aside#sketcher` in `src/server/public/new-agent.html`, logic in
  `left-side.js`), the chat you pull out with the arrow tab. The Talk box
  on the agent page is **not** part of this.
- "(not the left side)": the user says the glass went on the wrong part.
  Today it sits on the left edge and the window behind it (the
  `html.glass` window treatment and a full-height strip stuck to the left
  edge). The glass goes on the chat panel itself and nowhere else.
- The newer request wins over commit 5fd7ef2, which made the panel
  near-solid (`html.glass #sketcher { background: rgba(12,14,10,.88) }`,
  `new-agent.html:152`). The panel must be truly see-through with blur.
  Text must still read well. Use a darker tint behind the messages or a
  stronger blur, not a near-solid panel.
- The "+ button" is the plus on the first screen (`agent-home.html`
  `#plus`, line 104). Pressing it turns the + into a firefly that flies
  off with the others (the existing gather, `firefly-gather.js`
  `gatherToRing`).

## Rules that hold for every phase

- Fireflies DNA look: same colour (`--fly` #D8F26A), glow and dot size
  (`MIN_R`/`MAX_R` in `fireflies-dna.js`). No new kind of light.
- Reduce Motion is respected: no flying, only brightness changes.
- No magic on errors. "Sketcher couldn't answer. Press Enter to try
  again." stays plain.
- Nothing slows the words. The thinking magic stops when the first word
  arrives, and sending never waits for an animation.
- One way to do each thing: no new buttons, no send button unless the
  design shows Enter alone fails users (open question 2).
- Checks look at what the eye sees (pixels), not only at internal state.

## Phase 1: glass only on the floating chat

- The Sketcher panel floats: a small gap from the window edges, rounded
  corners all round, a soft shadow. It reads as a chat window, not a strip
  glued to the left edge. (Jony sets the exact gap and radius.)
- The panel is real glass: see-through, with blur, in the browser and in
  the Mac app. The `.88` near-solid rule goes.
- Reading stays easy: a darker tint behind the message area (or a stronger
  blur) keeps text readable over a bright likeness or a bright desktop.
- Everything else on /new is solid again: the field behind the panel, the
  left side and the window. On /new, `html.glass` no longer tints the
  field see-through.
- The handle (arrow tab), Esc, focus and the look-back flash work as today.
- Narrow screens (under 640 px): the panel still fits, words stay clear of
  the arrow.

Tests that lock it in:
- `checks/left-side-check.cjs` (Chrome + WebKit), new steps: with the
  panel open, `#sketcher` has a `backdrop-filter` blur and a background
  alpha well under .88; the panel has a gap from the left, top and bottom
  edges and rounded corners on both sides; `html`/`body` on /new are
  opaque, also with `html.glass` set.
- A pixel check: a bright patch placed behind the panel shows through
  blurred (pixels behind the panel differ from a solid fill), and message
  text keeps a readable contrast over it (WCAG AA, 4.5:1, measured from
  pixels).
- `npm test` passes (`left-side.test.mjs` and the shell's glass test,
  updated to the new rule).

Done when: in Chrome, WebKit and the installed Mac app the chat is clearly
glass and floating, and nothing else on /new is.

## Phase 2: the user looks at the glass (gate)

- Build and install the app (`scripts/install-mac-app.sh`), Start opens it.
- The user checks the glass by eye before any firefly work starts.
  Their notes go into the design file; fixes go in before Phase 3.

Done when: the user says the glass looks right.

## Phase 3: the firefly +

- Press the plus (or ⌘N): the + itself becomes a firefly, then flies off
  with the others into the ring the gather already makes. /new goes on
  from the home's last frame, as today (`glade.call` epoch).
- The + doesn't glow on its own before it turns (`firefly-gather.js`
  note: "the plus does not glow"). Merlin decides how the cross collapses
  into one dot.
- The + comes back as a + when you return home (`restoreHome`).
- Reduce Motion: the + dims into a dot and the page goes on. No flight.
- The total time of the call doesn't grow (D = 1000 ms).

Tests that lock it in:
- `firefly-gather.test.mjs`: the plan has one flight that starts at the
  plus's centre, takes the plus's place, and lands in a ring slot; the
  total time stays D.
- `checks/real-home-check.cjs` (Chrome + WebKit): during the call the
  plus's pixels go from a cross to one dot, then the dot leaves the plus's
  spot; after Back the + is drawn again. Reduce Motion: no movement
  between frames, only brightness.
- `npm test` passes.

Done when: in the app, pressing + visibly turns it into a firefly that
joins the flight, and Back shows the + again.

## Phase 4: firefly chat box, send and thinking

Merlin writes the magic first (`02-merlin-magic.md`), Columbo checks the
moments against how people use chat (`01-columbo-behaviors.md`), Jony
designs and builds (`03-jony-build.md`).

- **The box.** The chat box carries the firefly light: a firefly caret
  and a quiet glow on focus. Typing is never slowed or hidden.
- **Send.** Enter sends, as today. The message leaves the box with a small
  firefly lift into the log; the text is in the log at once, the light is
  only on top.
- **Thinking.** While Sketcher thinks, a few fireflies take the place of
  "Sketching…" (the words stay for screen readers). At the first word they
  fade out at once. If the answer fails, they go out and the plain error
  line shows.
- Reduce Motion: no lift or drift, only a soft brightness pulse while
  thinking.

Tests that lock it in:
- `left-side.test.mjs`: the thinking state starts on send and ends on the
  first text, on error and on close; Enter still sends; Shift+Enter still
  makes a new line.
- `checks/sketcher-chat-check.cjs` (Chrome + WebKit): after Enter the
  message text is in the log in the same frame; firefly pixels show in the
  reply's spot while waiting; they are gone in the frame the first word
  lands; an error shows no firefly pixels; Reduce Motion shows no movement.
- `npm test` passes.

Done when: in the app, typing, sending and waiting feel alive and the
first word is never later than before.

## Phase 5: sign-off

1. `npm test` passes.
2. Works in the browser dev server, the real Tauri app and the installed
   build.
3. Start opens the newest app.
4. Eraser runs the checks above in Chrome, WebKit and the installed build,
   cuts what isn't needed and writes `04-eraser-signoff.md`.

**Done: the user saw the glass, Eraser signed off, Start opens it.**

## Out of scope now

- The Talk box on the agent page: not in this goal (Pixel).
- Window glass on the home and the agent page: left as it is. Only /new
  goes solid. (Open question 1.)
- Dragging the chat panel around the window: "drag out" means pulling it
  out with the arrow tab, which already works.

## Open questions

1. Should the home and agent page also go back to a solid window, or only
   /new? Assumption: only /new, because the request is about the chat and
   the left side.
2. Does the chat need a visible send control? Assumption: no, Enter stays
   the one way (`enterkeyhint="send"` already shows it on touch keyboards).

## Files in this folder

- `00-roadmap.md`: this file (Columbo, captain)
- `01-columbo-behaviors.md`: chat behaviors for Phase 4 (Columbo)
- `02-merlin-magic.md`: glass look, firefly +, chat magic (Merlin)
- `03-jony-build.md`: design, what was built, how to try it (Jony)
- `04-eraser-signoff.md`: cut review and sign-off (Eraser)
