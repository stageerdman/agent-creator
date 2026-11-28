# Create card, Esc and typing while the AI thinks: user behaviours

Columbo (UX Detective), 2026-11-28. A short research report for Jony's build in
`src/server/public/left-side.js` and the `#sketcher` panel in `new-agent.html`.

## Summary

People treat the Sketcher chat like a chat with a person, or like Claude Code in
a terminal. They don't wait for the AI to finish. They correct it mid-sentence,
and they skip suggestions they aren't ready for. Create belongs at the point in
the talk where the AI asks for it, as the AI's own request, so it shouldn't sit
as a button that is always there. Three rules carry most of the trust:
**the newest card is the only live one**, **Esc stops the AI but never eats the
user's words**, and **Create happens once, and the page still knows it after a
reload**.

## Scope

**In:** the Create card in the chat, ignoring the card, Esc during an answer,
sending while the AI thinks (the message waits in line), Esc with messages
waiting, and the card's state after Create and after a reload.

**Out (and why):** a visible stop button (the brief sets Esc as the one stop;
see open question 3), editing a message after it is sent, Daily Talk (a
different screen with different rules), and mobile keyboards (the Sketcher is a
Mac or desktop window for now).

**The backend this is built on (commit 7540622):** `POST /api/agents/:id/stop`
returns `{ stopped: n }`. Cancelled turns end with `error { kind: "cancelled" }`
and save nothing. A message sent while the AI thinks first gets `queued {}`, then
runs when the turn before it ends. `ready` comes as `event: ready {ready:true}`
or `done {ready:true}`.

## Behaviour table

Sorted by combined score (likelihood + frequency).

| # | Behaviour | Likelihood | Frequency | Reason |
|---|---|---|---|---|
| B1 | **Sees the Create card when the AI says it has enough** | 10 | 8 | Every agent made reaches this point. It can come more than once per agent if the user keeps talking. |
| B2 | **Types the next thought while the AI is still answering** | 9 | 8 | Thinking runs for seconds. Claude Code and ChatGPT users already type ahead. A locked box feels broken. |
| B3 | **Ignores the card and keeps chatting** | 8 | 7 | The AI often says it is "ready" before the witness feels "it's really them". Many people want one more detail. |
| B4 | **Presses Esc mid-answer to correct the AI** | 8 | 7 | The AI starts down the wrong path ("no, she's not a lawyer"). Esc is the terminal habit and the brief's only stop. |
| B5 | **Comes back after Create, or after a reload, and sees the old card** | 9 | 6 | Reloads, app relaunches and coming back the next day are normal. A card that still says Create would cause a double create, or make people doubt it worked. |
| B6 | **Presses Esc while messages wait in line** | 6 | 4 | It needs a fast typist who then changes their mind. It is rarer, but losing their words here is the worst moment in this feature. |
| B7 | Presses Esc when nothing is running | 7 | 4 | Esc is a reflex ("close", "get out"). It must do nothing harmful. *Watch out.* |
| B8 | Double-clicks Create, or clicks while the network is slow | 6 | 2 | Many people double-click, and impatient people click again. Score kept low because the button already locks after the first click. *Watch out.* |

The deep dives cover B1 to B6. The scores for B5 and B6 are below 7, but they
stay in because a mistake there breaks trust.

## Deep dives

### B1: The AI says "I have everything" and a Create card appears

- **The moment:** evening at the desk, ten minutes into describing a mentor.
  The user has just answered the AI's last question.
- **The trigger:** the AI's reply ends with "I think I have what I need. Shall I
  create her?" and the server sends `ready`.
- **Thoughts:** "Oh, already? …ok, it does sound like her." "What happens if I
  press it, can I still change things?"
- **Emotions:** before, effort and some doubt. During, a small lift, *it
  listened*. After pressing, relief and pride.
- **Expectations:** the card sits **right under the AI message that asks**, as
  part of the talk, not in a toolbar. It has one clear action, **Create**, and no
  second button doing the same thing. Pressing it gives feedback right away (the
  card says it's working within about 100 ms) and a done line in the chat within
  about 1 to 2 s.
- **Success:** "It asked me, I said yes, and it happened right there in the
  conversation."
- **Friction and fears:** a card with no AI request above it (it feels like an
  ad). A card that appears before the AI's words have finished streaming. Any
  sign that Create is final and that changes after it are lost.
- **Product insight:** show the card **after the AI's message finishes
  streaming**, and only if `ready` came. The card's text is the AI's request (its
  `say`, or a short line asking to create the agent). The done line should
  reassure: "Created. You can keep changing it." (this line already exists).

### B2: Types and sends a second message while the AI thinks

- **The moment:** mid-flow. The user sent "She's a retired teacher" and remembers
  "…and she hates small talk" while the dots still pulse.
- **The trigger:** a thought arrives that they don't want to lose.
- **Thoughts:** "Let me just add this before I forget." "Will it see both, or
  get confused?"
- **Emotions:** before, eagerness. During, mild worry that it'll be lost or mess
  up the first answer. After, calm once they see it waiting.
- **Expectations:** the box is **never locked**. Enter sends at once, and their
  line shows in the log straight away, **in the order they sent it**, with a
  quiet "waiting" look (dimmer, or a small waiting mark) so they know it hasn't
  been answered yet. When its turn starts (first `delta`), the waiting look goes
  away. No popup and no "please wait".
- **Success:** "It's like texting. I say things when I think of them and it
  catches up."
- **Friction and fears:** a disabled box (the main complaint about chat UIs). The
  message vanishing until its turn. Two answers mixing into one bubble. The
  waiting line jumping above the current AI answer.
- **Product insight:** each sent message gets its own AI bubble, which appears
  only when that turn starts. The waiting line sits after everything already
  shown. Several waiting lines keep their order.

### B3: Ignores the card and keeps chatting

- **The moment:** right after B1. The user reads the card and thinks "not yet".
- **The trigger:** a detail is missing ("she also speaks Spanish").
- **Thoughts:** "I'll create it later. Will that button still be there?" Later,
  after a new card: "Which one do I press?"
- **Emotions:** before, mild resistance ("don't rush me"). During, relaxed if
  the card doesn't nag. After, confident if a fresh card comes when the AI is
  ready again.
- **Expectations:** the old card **stays in the history** as a record, but goes
  quiet. Its Create action is gone or dimmed and doesn't work. Only the **newest
  card is live**. Until the next `ready`, the user expects the old card still
  works or that the AI will ask again. The AI asking again with a new card feels
  natural.
- **Success:** "It didn't push me, and when I was done it asked again."
- **Friction and fears:** several live Create buttons up the log ("did the old
  one create the old version?"). The card vanishing when they type (it feels
  like a missed chance). A card that pins or floats and nags.
- **Product insight:** one live card at most. When a new card arrives, every
  older one turns inactive. Recommendation: when the user sends a new message,
  **leave the old card live** until a new card replaces it, so "later" stays
  possible (see open question 1). Create always creates the **current draft**,
  never a snapshot from when the card appeared.

### B4: Presses Esc mid-answer to correct the AI

- **The moment:** the AI is streaming "As a corporate lawyer, she…". The user
  winces.
- **The trigger:** the answer is going the wrong way, or is long and obvious.
- **Thoughts:** "No no no, stop." Then right away: "She's a *family* lawyer."
- **Emotions:** before, irritation. During, a sense of control when it stops at
  once. After, relief, and trust that the wrong idea didn't stick.
- **Expectations:** Esc works **while the chat panel is open, even if the cursor
  isn't in the box**. Streaming stops within about 200 ms. The partial answer
  stays visible but is marked as stopped (a quiet "stopped" mark), so it doesn't
  read as the AI's final word. The draft does not change (the backend saves
  nothing, so the field and DNA must not move either). Focus is in the box,
  ready to type the correction. Esc does **not** close the panel or clear the
  box.
- **Success:** "I cut it off and corrected it, like talking to a person."
- **Friction and fears:** Esc closes the whole chat (a common Esc meaning that
  clashes here). A field change animation that still plays from the cancelled
  turn. The partial text looks complete, and later the AI acts as if it never
  said it. That last one is fine, but the mark must make it clear.
- **Product insight:** if a turn is running or waiting, Esc means *stop*, and
  only then. Show a clear but quiet "stopped" state. Drop any `change` events
  after the stop. Put the cursor in the box.

### B5: After Create, and after a reload, the card must not offer Create again

- **The moment:** the next morning. The user opens the app and the mentor's chat
  history comes back.
- **The trigger:** checking it's still there, or wanting to keep tweaking.
- **Thoughts:** "Did it actually save yesterday?" Seeing a live Create card:
  "Do I need to press it again? Will that make a second one?"
- **Emotions:** before, mild uncertainty. During, calm if the history clearly
  shows it was created. After, settled.
- **Expectations:** the history shows the old card(s), none with a working
  Create, and a "Created" line where it happened. No new card appears from old
  `ready`s. Changes now are live (design rule: *Keep happens once*).
- **Success:** "Yes, it's made, I'm just editing it now."
- **Friction and fears:** a live Create after a reload. That is the classic "did
  my order go through?" fear, and pressing it again may look like it makes a
  duplicate. A card that says Create on an agent that is already live.
- **Product insight:** check `kept(store, a)` on every render and on reload.
  Once kept, **no** card shows a Create action, in history or new. Known gap:
  the chat history from the server holds only text, not `ready`, so after a
  reload an *uncreated* agent shows no card until the AI's next ready reply.
  That's acceptable (the user can just say "create her"). Open question 2 covers
  it.

### B6: Presses Esc with messages waiting in line

- **The moment:** the user sent two quick follow-ups, then realised the first
  answer is going wrong.
- **The trigger:** "Stop, start over."
- **Thoughts:** "Stop *that*." They likely don't realise Esc also drops the
  waiting messages. Then: "Wait, where did my 'she hates small talk' go?"
- **Emotions:** before, urgency. After, alarm if their words disappear without
  a word. Fine if they can see what happened and get the words back.
- **Expectations:** the waiting lines **stay in the log**, marked "not sent"
  (stopped). Their text is **put back in the input box** (joined in order, one
  per line, after anything already there) so one Enter resends it. Nothing
  vanishes.
- **Success:** "It stopped everything, and my notes were right there to send
  again."
- **Friction and fears:** silent loss of typed words. That is the worst outcome
  here and costs more trust than anything else in this feature. Lines that look
  sent but never got answered.
- **Product insight:** the backend drops waiting turns on stop (`stopped: n`
  counts them, and each one's stream ends with `error {kind:"cancelled"}`). The
  UI must make that visible and give the words back. It must never wipe what the
  user was typing in the box at that moment.

## Watch out

- **Double Create click, or a click while slow:** lock the card on the first
  click, show "creating…", and send one request only. On failure, unlock with a
  plain error line. Never create twice.
- **Esc when nothing runs:** do nothing. No stop call (or a harmless one that
  returns `stopped: 0`), no "stopped" mark, and the panel doesn't close. Don't
  invent a new Esc meaning here.
- **Esc while the user types in another field, or in a dialog:** Esc only stops
  the AI when the chat panel is open or focused. It must not fight other Esc
  uses.
- **Esc right as the answer finishes (a race):** if `done` already came, nothing
  is marked stopped. Never mark a finished, saved answer as "stopped".
- **Create pressed while a turn is running or waiting:** Create saves the draft
  as it is now. Recommendation: let it go ahead (Keep does its own save), and
  the running turn's later changes apply live as usual. Don't block it without
  a visible reason.
- **`ready` without a `say`, or with an empty message:** use the short fallback
  line asking to create the agent. Never show a blank card.
- **A card without `ready`:** never. No guessing from words like "create" in
  the AI's text.
- **A network error on a waiting message:** handle it like B6. Keep the line,
  mark it not sent, and give the words back.

## Key insights

1. **Create is a reply to the AI's question**, so it lives in the chat, under
   the asking message, after streaming ends.
2. **One live card at most.** Old cards stay as quiet history.
3. **The box is never locked.** Waiting lines show at once, in order, with a
   quiet waiting look.
4. **Esc means stop only while something runs.** It acts within about 200 ms,
   leaves a "stopped" mark, changes nothing, and puts the cursor in the box.
5. **Never lose the user's words.** Dropped waiting messages go back into the
   box.
6. **Kept is final and survives a reload.** Once kept, no Create anywhere.

## Open questions

1. When the user sends a new message after a card, should the card stay live
   until a new `ready` (my recommendation), or go quiet at once? *Assumption:*
   it stays live. "Later" is a real wish, and Create always uses the current
   draft.
2. Should `ready` be stored with the chat history so an uncreated agent shows
   its card after a reload? *Assumption:* not for now. The next AI reply
   re-offers it. This is worth a later backend line.
3. Do people who don't know Esc need a visible way to stop? Mouse-first users
   won't guess Esc. *Assumption:* Esc only for this item, as briefed. A small
   "Esc to stop" hint next to the thinking dots would teach it without adding a
   second stop action.
