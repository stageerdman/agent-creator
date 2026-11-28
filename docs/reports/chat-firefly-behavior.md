# Behavior report: typing, sending and waiting in the floating Sketcher chat

Columbo, 2026-11-28. Input for Merlin (`chat-firefly-motion.md`).

## Summary

People use the Sketcher chat in short bursts: they think with the cursor in
the box, type one or two sentences, press Enter, and then look at the Sketch
or the reply while Sketcher works. Most of the time in this chat is spent
**waiting** or **thinking before typing**, not sending. So the glow must
be calm enough to sit still for minutes. The send flight must be over before
the eye moves to the log. The thinking state must say "still working" during
a 40-second tool run without turning into an alarm. One rule above all: the
box is always ready for the next words. No effect may delay, cover or steal
focus from typing.

## Scope

**In:** the floating chat on /new: `#sketcher-form`, `#sketcher-box`,
`#sketcher-log`, the `you` line, the `sketcher wait` line ("Sketching…"),
streamed replies, the tool and file changes during a reply, the failed send,
closing the panel, Reduce Motion.

**Out:** the glass panel itself, the Start + firefly, the left side and the
Sketch dots (done or owned elsewhere). The Create button and Daily Talk are
also out. Daily Talk's rule "no motion before the first words" is used here
as a guide only.

**How the code behaves today** (`src/server/public/left-side.js` ~297–316):
- Enter sends, Shift+Enter makes a new line, and IME composition is respected.
- When a send is accepted, the box empties at once and the `you` line and
  the `sketcher wait` line are added in the same moment.
- While a reply runs (`busy`), Enter does **nothing**, silently. Typed text
  stays in the box.
- The first streamed text replaces "Sketching…" and the `wait` class goes away.
- On failure, the `you` line is removed and the message goes back in the box,
  but **only if the box is empty**. The wait line becomes the red error line.
- The log is `aria-live="polite"`, so every added line is read aloud.
- Closing the panel makes it `inert` and then `hidden`. The reply keeps
  streaming in the background.

Assumption: the patterns from similar chats (ChatGPT, Claude, Messages)
hold here. In those apps the sent bubble appears in well under a second,
and a "thinking" sign that lasts a long time is read as "still working",
not as "stuck", as long as it changes a little when real work happens.

## Behavior table

Sorted by likelihood + frequency (L + F).

| # | Behavior | L | F | Reason |
|---|----------|---|---|--------|
| B1 | **Type a short instruction, press Enter** | 10 | 10 | This is the whole job of the chat: "make it warmer", "add his podcast notes". |
| B2 | **Watch "Sketching…" until the first words** (1–5 s) | 10 | 9 | It follows every send, and the eyes stay on the log right after Enter. |
| B3 | **Sit with the cursor in the box, thinking** (10 s to minutes) | 9 | 8 | The panel focuses the box when it opens. People pause to word things, or reread the Sketch. |
| B4 | **Long working wait while tools and files change** (10–60 s) | 8 | 7 | Building an agent means file edits. The Sketch and menu change while the words are slow. |
| B5 | **Look away to the Sketch while waiting** | 8 | 7 | The dots and sections move on the left. People check "did it do what I said?". |
| B6 | **Type the next message while Sketcher still answers** | 8 | 7 | Ideas come while reading. People type ahead, as they do in any messenger. |
| B7 | **Press Enter again while busy** (fast repeat send) | 7 | 5 | It follows from B6: the typed-ahead text is ready and Enter is habit. Today nothing happens and nothing explains why. |
| B8 | **Paste or write a long, multi-line message** | 6 | 4 | People paste a bio or notes. Shift+Enter is used by power users. |
| B9 | **Switch to another app or tab and come back mid-wait** | 6 | 5 | A 40 s wait invites a glance at mail. They come back expecting the answer done. |
| B10 | **Scroll up in the log while a reply streams** | 5 | 4 | People reread an earlier answer. Auto-scroll can pull them back down. |
| B11 | **Close the panel while waiting** | 5 | 4 | To see the whole Sketch, or by Esc habit. They expect the work to go on. |
| B12 | **Use Reduce Motion** | 3 | 10 | A small share of users, but for them it is every moment. Scored 3 (lower choice): no data on this app's users. |
| B13 | **A send fails, press Enter to retry** | 4 | 2 | Network or server trouble is rare, but it breaks trust when it happens. |
| B14 | **Type with an IME** (Japanese, Chinese) | 3 | 5 | Enter confirms the composition and must not send. This already works. |
| B15 | **Want to stop or take back a wrong message** | 4 | 3 | "Oops, not that." There is no stop. Kept as a watch-out, not a feature. |

Deep dives: B1–B6 (both scores 7 or more). The edge moments the brief asks
for (B7, B11, B12, B13, plus a fast fail during the flight) follow after them.

## Deep dives

### B1 — Type a short instruction, press Enter
- **Moment:** /new, Mac app or desktop browser, mid-session. They just looked
  at the Sketch and saw something off.
- **Trigger:** "That's not quite him."
- **Thoughts:** "Tell it he never says 'leverage'. Enter."
- **Emotions:** focused and a little impatient before. During, a small "sent!"
  release. After, hope.
- **Expectations:** the words leave the box *at once* and show as their line
  within a blink, in one keystroke. The box is empty and ready again.
- **Success:** "It took it." The message is plainly in the log, in their own
  words, unchanged.
- **Friction and fears:** a line that appears late ("did it go?"). Text that
  moves while they read it. A flight that covers the log or the next words.
- **Product insight:** the send moment is under one second of attention. The
  flight must *end on* the line, not *before* it. The text must be readable
  by about 600 ms. The box must be empty and focused in the same frame as Enter.

### B2 — Watch "Sketching…" until the first words
- **Moment:** right after B1, with the eyes still on the log.
- **Trigger:** nothing new. They are waiting for the answer.
- **Thoughts:** "Is it doing anything? … ok, here it comes."
- **Emotions:** a short suspense. Relief when words start.
- **Expectations:** a sign of life within 300 ms. Words in a few seconds. The
  wait sign goes away the instant text starts.
- **Success:** the wait feels short and alive, and the answer replaces it
  with no gap.
- **Friction and fears:** a fade-out that holds back the first words. A
  spinner next to a glow (two signs for one thing). "Sketching…" turning into
  an icon that a screen reader can't read.
- **Product insight:** the thinking state is a skin on the existing wait line.
  It switches off in the same frame as the first `onText`, with no exit
  animation that delays the text.

### B3 — Sit with the cursor in the box, thinking
- **Moment:** the panel just opened (the box is focused), or between messages.
  This can last minutes.
- **Trigger:** they are choosing words, or comparing the Sketch to the real person.
- **Thoughts:** "How do I say he's blunt but kind?"
- **Emotions:** reflective, sometimes unsure.
- **Expectations:** a quiet, ready box. Nothing asks for attention.
- **Success:** the box feels inviting, "it's listening", and never nags.
- **Friction and fears:** a pulse that pulls the eye every second like a
  notification. A glow that looks like "busy" or "disabled". Movement at the
  edge of sight while they study the Sketch.
- **Product insight:** the resting glow is seen for far longer than any other
  effect. It must be close to still. Any breathing must be slow and small, or
  it must rest after a few cycles.

### B4 — Long working wait while tools and files change
- **Moment:** a larger request ("add these three sources"). Sketcher edits files.
  The menu reloads and dots sort on the left.
- **Trigger:** their own big ask.
- **Thoughts:** "It's working on it… is it stuck? … oh, the menu changed."
- **Emotions:** patient for about 10 s, then mild doubt. They are reassured
  by visible progress.
- **Expectations:** a sign that this is *work*, not a hang. They don't
  need detail.
- **Success:** "I can see it doing things." The wait sign stays calm but
  notices each change.
- **Friction and fears:** the same loop for 60 s, looking frozen. Getting
  louder over time, which reads as an alarm. A second spinner for tools.
- **Product insight:** one thinking state with a small, *event-driven* change
  when a tool or file event arrives (`onChange`, `onAllocate`). It does not
  grow louder with time.

### B5 — Look away to the Sketch while waiting
- **Moment:** during B2 or B4. The eyes go left, where the fireflies sort.
- **Trigger:** movement on the left, or "let me check it did it".
- **Thoughts:** "Yes, that section lit up."
- **Emotions:** curious, a sense of control.
- **Expectations:** the chat stays calm in the corner of the eye while the
  left side moves.
- **Success:** one place moves at a time. The chat's thinking sign doesn't
  compete with the sorting flights.
- **Friction and fears:** two lime things pulsing at once, fighting for the eye.
- **Product insight:** the thinking state should be the *quieter* of the two.
  Lower brightness and slower than the Sketch fireflies.

### B6 — Type the next message while Sketcher still answers
- **Moment:** the reply streams, and they already know their next point.
- **Trigger:** an idea while reading.
- **Thoughts:** "And also tell it…"
- **Emotions:** in flow, and they don't want to lose the thought.
- **Expectations:** the box takes every key at once. The glow acts as normal
  typing, not as "locked".
- **Success:** they type freely. When the reply ends, Enter sends.
- **Friction and fears:** a glow that looks "off" or dimmed while busy, which
  says "you can't type". Focus jumping to the log.
- **Product insight:** the glow must not change for `busy`. Typing during a
  wait is normal and must look normal.

## Edge moments the brief asks for

- **B7 — Fast repeat send (Enter while busy).** Today the keypress is dropped
  silently and the text stays. There is no flight, because nothing was sent.
  If a firefly lifts and nothing lands, that is a lie. *Limit:* the flight
  starts only when a send is accepted. A blocked Enter shows no send effect.
  (Whether it should queue or explain is a product question, below.)
- **Fail during the flight.** Offline errors can come back in under 600 ms.
  Then the `you` line is removed and the message goes back in the box, while
  the firefly may still be in the air. *Limit:* the error cancels the flight
  at once. The flight element is removed and no `you` line lands. The red
  error line has no magic (rule: no magic on errors).
- **B13 — Failed send, retry.** They see the red line and their text back in
  the box, then press Enter. Fear: "did I lose what I wrote?" *Watch out:* if
  they typed ahead (B6) before the failure, the box isn't empty, so the failed
  message is **not** restored and its `you` line is removed. The message is
  gone. This is outside the motion brief, but it can break trust.
- **B11 — Panel closed mid-wait or mid-flight.** They expect the work to go
  on and the answer to be there when they reopen. *Limit:* closing ends any
  flight at once (the line is simply there). No loops run while the panel is
  hidden. On reopen, the thinking state is shown only if the reply is still
  pending.
- **B9 / B10 — Away or scrolled up.** A flight aimed at a line that is
  off-screen (scrolled up, or the tab is hidden) must not fly to nowhere.
  Skip it and show the line.
- **B12 — Reduce Motion.** For them: no flight (the line appears at once), a
  still glow, and a still thinking sign (at most a plain step when a tool
  event arrives). The words stay the same.
- **B8 — Long messages.** The flight carries a firefly, not the text, so it
  works the same for one word or a pasted page. The tall line must not
  slide in from below the fold.

## Limits for Merlin

**Maximum durations**
- Focus brighten: ≤ 200 ms. Blur back to rest: ≤ 300 ms.
- Resting breathing (if any): one cycle ≥ 4 s, small brightness change. It
  settles to still after ≤ 3 cycles without input, or it is still from the start.
- Send flight: lift to landing ≤ 600 ms. The `you` line text is fully
  readable at ≤ 600 ms after Enter.
- Thinking loop: one cycle 1.5–3 s. It never flashes more than 3 times a
  second. It doesn't grow louder or faster with time.
- Tool or file change cue: ≤ 400 ms, once per event, merged when events
  come fast.
- First words: the thinking state is gone in the same frame as the first
  `onText` (no exit delay). The same goes for the error line.

**Must never block typing**
- The box empties and stays focused in the same frame as an accepted Enter.
- The flight element can't be clicked (`pointer-events: none`), isn't in tab
  order, never takes focus and never covers `#sketcher-box`.
- The glow doesn't change for `busy`. There is no dimmed or "locked" look
  while a reply runs.
- No effect waits on another effect. Shift+Enter, IME and Esc work as today.
- One send path only: the flight is skin on the existing submit handler.

**Must stay readable**
- The message text in the box and in the `you` line never moves, blurs or
  fades below full contrast once landed. No text rides on the firefly.
- "Sketching…" stays as real text in the wait line. It is read once by the
  live log and keeps AA contrast (≥ 4.5:1) on the glass at every frame of
  the loop.
- The flight element is `aria-hidden`. Screen readers get one `you` line,
  not two.
- The error line stays plain red text with no glow.
- The glow never lowers the contrast of the typed text or the placeholder.

## Key insights

1. Waiting and pausing take far more time than sending. Design the rest
   states first. The flight is the shortest moment.
2. The glow means "ready for you", always, even while Sketcher is busy.
3. The thinking state tells "working" from "stuck" with real events, not
   with time.
4. Every effect has an "end now" path: first text, error, panel closed,
   Reduce Motion, tab hidden.

## Open questions (product, not for motion)

- Enter while busy is silently ignored (B7). Should it queue, or say "one at
  a time"? Today people may think the app is broken.
- A failed send with typed-ahead text loses the failed message (B13). Should
  it be kept somewhere?
- There is no way to stop a wrong request mid-reply (B15). Watch for it in
  testing.
