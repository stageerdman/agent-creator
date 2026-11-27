# THE LEFT SIDE: how people watch the mess gather, and use the chat behind the arrow (Columbo)

## Summary

The left side of the creation screen does two jobs at once.

1. **A progress picture with no numbers.** People hire it to answer
   *"Is it getting there? Is this turning into someone?"* At first there is a
   loose mess of fireflies, one per file (the wander from
   `Reports/fireflies-wander-motion.md`). As files are processed, the flies
   gather into the agent's AI identity, the Fireflies DNA mark. The shape
   that forms is the only progress bar, so it must move only when real work
   happens, and only forward.
2. **The door to the creator.** A small arrow on the left edge pulls out the
   orchestration chat: the AI that sees all files and can edit anything.
   People hire it for *"Help me shape this agent, and tell me when it's
   ready."* It must have one way in (the arrow), one way out (the back arrow
   on top, with Esc as its key), and must never lose what was said.

Main findings:

1. **The gathering is read as progress, and progress that goes back breaks
   trust.** If the shape forms and then loosens, people think work was lost
   (D2, W1).
2. **A long still mess will look like "nothing is happening".** Today files
   only become `processed` when they are baked into the agent. If that
   happens late (after chat or a build), the left stays a mess for minutes.
   The mess must look alive (the wander does that) and the first gathering
   step should come with the first processed file, not after a threshold
   (D1, Q1).
3. **The arrow is found by people who look for it, and missed by people who
   don't.** That's fine only if something points to it once, at the right
   moment: when there is something to talk about (D3, W3).
4. **The chat is a working place, not a pop-up.** People will spend minutes
   there, leave it, and come back. History must stay, the draft they were
   typing must stay, and the DNA behind it must stay visible enough through
   the glass to feel "it's still there" (D4, D5).
5. **Esc already means "go home" on this screen.** When the chat is open,
   Esc must close the chat only. A user who presses Esc to close the panel
   and lands on the home screen will feel they lost the agent (W2).
6. **Small windows and Reduce Motion are part of the main path**, not edge
   cases: the app sits next to Finder, often at half a screen, and Reduce
   Motion users must still see the identity form, as steps of light instead
   of motion (D6, D7).

## Scope

**In:**
- the left field on `/new` after files land: the early mess while files are
  processed, and its gathering into the AI identity
- seeing and finding the left arrow; opening the orchestration chat
- using the chat: asking, answering, the AI's "ready to build" proposal with
  **Create**, asking for more questions, or just chatting on
- closing the chat with the back arrow (or Esc), seeing the DNA again
- all of the above in a small or narrow window, by keyboard, and with Reduce
  Motion on
- the first visit (fresh agent) and coming back to it (`/new?agent=…`)

**Out (and why):**
- **the exact motion numbers** for the gathering, arrow and panel: Merlin's
  recipe (`Reports/left-side-magic.md`). Here: what people must see and feel.
- **talking to the built agent "in the box"**, its skill and RAG calls shown
  over the DNA: it needs a built agent; a later update.
- **the middle fireflies glowing one by one as files are allocated**, and
  allocation by chat as its own visual: also after the build.
- **the right-side menu** (sections, swarms, rename): covered in
  `Reports/creation-screen-behaviours.md`.
- **phones**: a desktop app with Finder drops; "small screen" here means a
  13" laptop or a window at half the screen.

**Assumptions (marked, not checked with real users):**
- A1. "Processed" means a file's `state` is `processed` in the agent's `dna`
  (`src/creator/files.mjs`). Share processed = processed ÷ (all files not
  removed). This is the only honest progress signal there is today.
- A2. The orchestration chat uses the existing creator chat,
  `POST /api/agents/:id/chat`, and its words may change the agent (it "can
  edit anything").
- A3. People are on a laptop or desktop, mostly 50–70 cm from the screen,
  eyes mostly on the right side or in the chat.
- A4. The chat panel covers the left field while open; the menu on the right
  stays visible.

## Behavior table

Scores 1–10. Sorted by the two scores together. When unsure, the lower score.

| # | Behavior | Likelihood | Frequency | Reason |
|---|---|---|---|---|
| B1 | **Glance for progress**: look at the left to see "how far along" it is | 9 | 9 | No counts on screen. The shape is the only sign of progress, so every user checks it, again and again. |
| B2 | **Watch it gather**: notice the flies pulling together into a shape | 8 | 8 | The change from mess to form is the most visible thing on the screen once processing starts; people stop to watch. |
| B3 | **Open the chat to shape the agent** via the left arrow | 8 | 8 | It is where the real work is done (tell the AI what the agent is for, answer its questions). Done many times per agent. |
| B4 | **Close the chat to see the DNA**, then reopen it | 8 | 7 | People want to see "what it did" after a chat turn. The fixed rule says closing reveals the DNA; they'll toggle often. |
| B5 | **Answer the "ready to build" proposal**: Create, ask more, or chat on | 7 | 7 | Every agent reaches it at least once; many people hesitate and ask more first. |
| B6 | **Hunt for the arrow**: look for "where do I talk to it?" | 7 | 7 | The feature says "to build anything we must chat"; anyone who doesn't see the arrow at once will search for it. |
| B7 | **Use it in a narrow window** beside Finder | 7 | 6 | Gathering material means Finder next to the app; half-screen windows are common on 13" laptops. |
| B8 | **Come back later** (`/new?agent=…` or reopen) and expect the shape and chat as they were | 6 | 6 | Processing and thinking take time; people leave and return. |
| B9 | **Keyboard only**: Tab to the arrow, Enter, type, Esc | 5 | 6 | Power users and screen-reader users; they'll do it every session. |
| B10 | **Reduce Motion on** and still expect to see the identity form | 4 | 8 | A minority, but every session for them. |
| B11 | **Drop more files while the shape is half formed** | 5 | 4 | Adding "one more folder" happens; it changes the share processed. |
| B12 | **Remove files** and watch the shape react | 4 | 3 | Done rarely, but it makes the share go down. |
| B13 | **Try to touch the shape**: click or drag the forming identity | 5 | 3 | A shape invites a poke more than loose dots; once or twice. |
| B14 | **Type in the chat while the AI is still answering** | 5 | 4 | Fast typists do; once a session or so. |

### Watch out (low scores, but they can break trust)

- **W1. The shape falls apart.** If gathered flies drift back into the mess
  (a reload, a removed file, a failed save), people read "my work was lost".
  Removing files may shrink the shape, but gently and only for that reason.
- **W2. Esc goes home from the chat.** Today Esc on `/new` goes to the home
  screen. With the chat open, an Esc that leaves the page feels like losing
  the agent and the conversation.
- **W3. The arrow is never found.** If no one ever sees it, the core of the
  feature ("to build anything we must chat") is hidden. But a glowing,
  pulsing arrow competes with the wander and nags (two calls for attention).
- **W4. The AI edits silently.** The chat "can edit anything". If an edit
  happens with no visible trace (menu, DNA), people stop trusting both. If
  it overwrites something they typed, it breaks a team rule (hand edits win).
- **W5. Create pressed by accident**, or Create that seems to do nothing.
  Starting a build is a big step; an unclear result there makes people
  press it again.
- **W6. Lost draft or history.** Closing the panel and losing the half
  written message, or reopening to an empty chat, feels like being
  forgotten.
- **W7. Unreadable glass.** Blur behind text with bright flies passing under
  it can make words hard to read, worst for low vision and on small screens.
- **W8. Motion under Reduce Motion.** A sliding panel and flies flying into
  a shape across half the screen can cause real discomfort for people with
  vestibular problems.
- **W9. A fake progress shape.** If the identity forms on a timer, or faster
  than files are really processed, people who notice will stop believing
  the whole screen.

## Deep dives

### D1. The early mess while files are processed (B1: 9 / 9)

- **The moment:** a weekday afternoon at a laptop. They just dropped a folder
  of a coach's transcripts. The flies flew off the orbit and landed on the
  left. The menu slid in on the right. Nothing is processed yet.
- **The trigger:** "Did it take it? Is it doing anything with it?"
- **Thoughts:** *"OK, they're all there… now what? Is it reading them?"*
  *"It's just floating. Is that the loading?"* *"How long will this take?"*
- **Emotions:** before: a little tense, they just handed over private
  material. During: calm if the mess is clearly alive; unease if it looks
  the same for minutes with no change. After: either "it's on it" or "I
  should do something, but what?"
- **Expectations:** a living mess right away (the wander). Within the first
  processed file, a first, small sign of order. They don't expect speed;
  they expect a direction.
- **Success:** *"It's working through them. Something is starting to form."*
- **Friction and fears:** a mess that stays a mess for minutes, with no hint
  why, reads as stuck. A mess that looks too ordered from the start reads as
  fake. Not knowing that *they* may have to start something (chat, Create)
  leaves them waiting forever.
- **Product insight:** the mess is a valid state, but it should not be a
  dead end. If nothing processes until the user chats, the screen should
  point to the arrow (D3) instead of looking like it is working. The first
  processed file should give the first visible step of gathering.

### D2. Seeing it gather into the AI identity (B2: 8 / 8)

- **The moment:** a few minutes later. They've named the agent and are
  reading the menu. Out of the side of the eye, the left changes: a cluster
  of flies is pulling together.
- **The trigger:** motion that has a direction, which the eye notices.
- **Thoughts:** *"Oh, it's becoming something."* *"Is that its logo?"*
  *"About half done?"* *"Wait, did it just get smaller?"*
- **Emotions:** before: patient. During: delight, a sense of watching
  something being born. After: pride and ownership ("that's my agent").
- **Expectations:** the shape grows **only forward**, steadily, in step with
  real progress. Gathered flies stay gathered. The rest keep wandering.
  At 100 % the shape is clearly "a thing", the same mark they'll later see
  for this agent elsewhere (home, agent page).
- **Success:** *"It looks like it's done, and it looks like mine."* They can
  read "about how far" without a number.
- **Friction and fears:** sudden jumps (25 files processed at once becoming
  one snap), flies leaving the shape, a shape that doesn't match the mark
  used elsewhere, a shape that forms while the screen says nothing else
  changed.
- **Product insight:** map the shape to the processed share and only let it
  go forward; spread a big jump over time so it reads as gathering, not as
  a snap. The final shape must be the same identity mark `createDna` draws,
  so it is recognised later. Position it where the chat panel will cover it
  and closing the panel reveals it (fixed rule).

### D3. Finding and opening the left arrow (B6 + B3: 7 / 7 and 8 / 8)

- **The moment:** first use. They've dropped files and named the agent.
  They wonder: *"How do I tell it what this agent is for?"*
- **The trigger:** the feature's promise, "to build anything we must chat",
  meets a screen with no visible chat box.
- **Thoughts:** *"Where's the chat?"* *"Is it in the menu?"* *"What's that
  little thing on the left edge?"* Later: *"Ah, it pulls out."*
- **Emotions:** before: a bit lost. During: a small "aha" if the arrow is
  found within seconds; irritation if they search the menu first. After:
  confident, they know the way in from now on.
- **Expectations:** something small at the left edge that looks like a
  handle (arrow pointing right, "pull me out"). A hover shows it is live.
  One click opens it. It is also in the Tab order.
- **Success:** they find it within about 10 seconds the first time, and
  never think about it again.
- **Friction and fears:** an arrow so faint it's missed (W3); an arrow that
  pulses forever (nags beside the wander); a second way in (a chat button
  in the menu too) that makes people wonder which one is "the real" chat.
- **Product insight:** one handle, quiet at rest, with a single gentle
  "here I am" moment when the chat has something to offer (for example,
  right after the files land). It must have an accessible name and be
  reachable by keyboard.

### D4. Using the orchestration chat (B3 + B5: 8 / 8 and 7 / 7)

- **The moment:** the panel is out, glassy over the left; through the blur
  they can still see the fireflies. They type: *"This is a coach for new
  managers, use the transcripts as knowledge."* The AI asks two questions.
  Later it says it is ready to build.
- **The trigger:** they want to give the agent its purpose; the AI wants
  answers.
- **Thoughts:** *"Does it see all my files?"* *"Did it actually move those
  to knowledge?"* *"Ready already? Let me ask one more thing."* *"What
  happens if I press Create?"*
- **Emotions:** before: hopeful, a bit unsure how much to write. During:
  engaged, like briefing a helpful colleague. At the proposal: a small
  thrill and a small fear ("is it really ready?"). After Create: excitement.
- **Expectations:** answers start fast (words within a second or two, as a
  stream). When the AI changes something, they see it in the menu or on the
  left. The proposal shows plainly what Create will do. Not pressing Create
  is always fine: they can ask more or just keep chatting.
- **Success:** *"It understood what I want, and it showed me what it did."*
- **Friction and fears:** silent edits (W4); a proposal with only one button
  (forced); Create with no visible result (W5); typing while it answers and
  losing the message.
- **Product insight:** the chat's power to edit must leave a visible trace
  (the menu and the field react). The proposal offers Create as the one
  build action; "ask me more" can simply be a typed message, so there's no
  extra button for it. A message typed during an answer must not be lost.

### D5. Closing the chat and seeing the DNA (B4: 8 / 7)

- **The moment:** after a chat turn that said "I moved 40 files to
  knowledge". They want to see it.
- **The trigger:** curiosity: "what did that do to my agent?"
- **Thoughts:** *"Let me look."* *"How do I close this?"* *"Oh, it formed
  more."* Then: *"OK, back in."*
- **Emotions:** before: curious. During: a small reward as the DNA appears
  from behind the glass. After: ready to go back in.
- **Expectations:** one obvious way out: the back arrow on top of the
  panel. Esc does the same. The panel slides back to the edge it came from.
  The left arrow is where it was, and focus goes back to it. Reopening
  shows the chat exactly as they left it, draft included.
- **Success:** close, look, reopen, without thinking about the controls.
- **Friction and fears:** Esc that leaves the page (W2); a lost draft or
  history (W6); a click on the blurred background that closes it by
  accident (and loses the message); two different close buttons.
- **Product insight:** the back arrow is the one way out and Esc is its
  key. Esc must be handled by the chat first so it never reaches the page's
  "go home". A click outside should not be a second, hidden way out.

### D6. On a small screen or narrow window (B7: 7 / 6)

- **The moment:** a 13" laptop, the app at half the screen (about
  720–800 px wide) beside Finder. The menu on the right is 380 px today, so
  the left field is only about 340–420 px.
- **The trigger:** the same as D1–D5, in less space.
- **Thoughts:** *"The shape is tiny."* *"The chat covers everything."*
  *"Where did the arrow go?"* *"I can't read this over the glow."*
- **Emotions:** cramped but tolerant if everything still works; frustrated
  if the way out of the chat is off screen.
- **Expectations:** the shape scales down but stays readable as a form. The
  arrow stays at the left edge and within reach. The chat panel fits the
  window, its back arrow always visible, its input always visible above the
  bottom edge, text readable over the blur.
- **Success:** the same flow works, just smaller.
- **Friction and fears:** the panel wider than the window, the input under
  the bottom edge, the shape cut off under the menu, the arrow hidden under
  the panel, blur too weak to read text over bright flies (W7).
- **Product insight:** set a minimum window the team promises (800 × 600
  in the roadmap) and test there. Glass must be strong enough for text to
  read over the brightest flies.

### D7. With Reduce Motion on (B10: 4 / 8, kept because of W8)

- **The moment:** any session, for someone with the system setting on.
- **The trigger:** the same as D1–D5.
- **Thoughts:** *"Is anything happening?"* *"I see more lit dots in the
  shape now."* *"The chat just appeared, fine."*
- **Emotions:** at ease when nothing slides or flies; left out if the only
  progress signal is motion they no longer see.
- **Expectations:** no wander, no flights, no slide. The same states, shown
  by light: still dots at their home spots, and gathered dots appearing in
  the shape (a soft fade, no travel). The chat appears and disappears in
  place (a short fade at most).
- **Success:** they can still read "how far along" and use the chat with no
  discomfort.
- **Friction and fears:** any travel across the screen; the panel sliding;
  a shape that only forms by motion, leaving them with no progress signal.
- **Product insight:** progress must be readable from still frames: two
  screenshots at 20 % and 80 % must look clearly different with Reduce
  Motion on.

## Must-feel checks (what a person can see on screen)

From Start, make an agent with a folder of about 200 files.

1. **Alive mess.** Before anything is processed, the left shows a loose,
   gently moving mess, no shape.
2. **First step.** When the first files are processed, a first small sign
   of order appears within a few seconds.
3. **Forward only.** As more files are processed, the shape grows; it never
   loosens while you watch (except gently, after you remove files).
4. **Readable progress.** Screenshots at about 25 %, 50 % and 100 %
   processed look clearly different to someone who doesn't know the app.
5. **The identity.** At 100 % the shape is the same mark the agent gets
   elsewhere (`createDna`).
6. **Find the arrow.** A first-time person finds the left arrow within
   about 10 seconds without being told.
7. **One way in.** There is no other button that opens this chat.
8. **Open by keyboard.** Tab reaches the arrow; Enter or Space opens the
   chat; focus is in the message box.
9. **Glass.** The panel blurs the field behind it; text reads clearly even
   over bright flies.
10. **Chat works.** Words start within a couple of seconds; edits the AI
    makes show in the menu or on the left.
11. **Proposal.** When the AI is ready, Create is there; typing a question
    instead keeps the chat going.
12. **One way out.** The back arrow on top closes the panel; Esc does the
    same and **never** goes home while the chat is open.
13. **DNA revealed.** After closing, the shape that was behind the panel is
    in view; focus is on the left arrow.
14. **Nothing lost.** Reopen: history and a half-typed draft are still there.
15. **Small window.** At 800 × 600: shape visible, arrow reachable, panel
    fits, back arrow and message box on screen.
16. **Reduce Motion.** Nothing travels or slides; progress still shows as
    still dots joining the shape; the panel appears in place.
17. **Not a control.** The forming shape and the flies don't react to the
    pointer.

## Key insights

1. **The shape is the progress bar.** Tie it to real processed files, move
   it only forward, and never fake it.
2. **A mess must lead somewhere.** If progress waits for the user, point to
   the arrow once, gently; don't let the screen look like it's working.
3. **One handle in, one arrow out, Esc as its key.** And Esc must stop at
   the chat, not go home.
4. **The chat's edits must show.** Power to edit anything is trusted only
   when every edit leaves a trace on screen.
5. **Keep everything.** Closing the chat is "look away", not "end". History
   and draft stay.
6. **Small windows and Reduce Motion are on the main path.** Test at
   800 × 600 and with Reduce Motion as part of the normal check.

## Open questions

- **Q1. What processes files, and when?** Today `processed` means "baked
  into the agent". If nothing is baked until chat or Create, the mess stays
  for a long time. Does processing start right after the drop? If not, the
  "first step" (check 2) can't happen until the user chats, and the
  screen should say "talk to me" instead of looking busy. Merlin and Jony
  should decide which signal the shape follows.
- **Q2. What does the shape look like at 0–100 %?** Fewer dots in a full
  mark, or a mark that grows from its centre? Merlin's call; it must be
  readable in still frames (D7).
- **Q3. Where does the identity sit?** In the middle of the left field,
  under where the chat panel opens, so closing reveals it. Assumed yes.
- **Q4. The arrow's name.** It needs an accessible name. Plain label
  ("Creator chat"?) and any themed word must go in the word list first
  (world-and-words rule).
- **Q5. Removing files after the shape formed.** Shrinking is honest but
  sad. How gently? Eraser should judge the feel.
- **Q6. Does the chat open by itself the first time?** It would save the
  hunt (D3), but it's a second "way in" in a sense, and it covers the
  gathering the user came to see. My lean: no; one gentle hint instead.
- **Q7. Real user evidence.** All of this comes from reasoning, the team's
  earlier reports and the code. A five-minute hallway test of checks 4, 6,
  12 and 16 would confirm or correct the biggest assumptions.

## Sources

- Feature f-the-left-side (the user's brief).
- `Reports/fireflies-wander-behaviours.md`, `Reports/fireflies-wander-motion.md`.
- `src/server/public/new-agent.html` (Esc goes home; menu 380 px),
  `creation-screen.js` (`wanderAt`, `dotLook`, `MENU_W`, `FIELD_CAP`),
  `fireflies-dna.js` (`createDna`), `src/creator/files.mjs` (`processed`),
  `src/server/routes/agents.mjs` (`POST /api/agents/:id/chat`).
- `principles/magic-ux/design-rules.md`, `world-and-words.md`.
- W3C WAI-ARIA Authoring Practices, Dialog (Modal) pattern: Esc closes the
  dialog and focus returns to the control that opened it:
  https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- MDN, `prefers-reduced-motion`:
  https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
