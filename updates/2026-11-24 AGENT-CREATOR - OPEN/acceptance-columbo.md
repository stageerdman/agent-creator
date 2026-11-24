# Acceptance checks — the agent-creation chat screen (P2)

*Columbo, UX Detective. 2026-11-24. For Jony (build-jony.md) and Eraser
(signoff-eraser.md). Built from `research-columbo.md` (top behaviors and
watch-out list), `design-jony.md` (with R1–R11), `review-eraser.md` and
`wiki.md`.*

## How to use this file

- Run `npm start` and open the page that Start opens, in a desktop browser
  at least 860 px wide. Use the real `claude` CLI, signed in.
- Do the checks **in order**: later checks reuse the agent made in C1.
  Start clean: if the app opens straight into an old agent, choose
  **+ New agent** from the switcher first.
- Each check has **The moment** (why a real person does this), **Steps**
  (exactly what to do) and **Done well** (what must be true to tick it).
  A check passes only if *every* line under "Done well" is true.
- Write **pass** or **fail** for each check, plus one line on what you saw.
  For a fail, say which "Done well" line broke.
- **Times:** count from the moment you press Enter or click. A stopwatch or
  counting out loud is enough. The Sketcher's reply time depends on the
  CLI, so speed lines say what the *screen* must do while it waits. Write
  down the time to the first streamed words and to the full reply for C1,
  C4 and C5; Jony's assumption J2 needs those numbers.
- In the browser DevTools, keep the **Network** tab open. Several checks
  ask you to count requests.

## Speed expectations (apply to every check)

| What | Must be |
|---|---|
| Page open to a usable screen (composer focused) | under 1 s; "Opening…" shows only if it's slower |
| Your bubble appears after Enter | at once (under 100 ms), before any server answer |
| "Sketching…" (chat and Sketch header) appears | at once, with your bubble |
| First streamed words of the reply | as fast as the CLI sends them; no extra wait added by the screen. Typically a few seconds. Note it if over 10 s. |
| Sketch fields fill after the reply's draft arrives | under 0.3 s, Name first, then Persona, then Instructions |
| "✓ saved" after a hand edit | within about 1 s of stopping typing, or at once on leaving the field |
| Keep → "Kept ✓" | under 1 s (no AI call) |
| Typing in the composer | never lags or freezes, even while a reply streams or a glow plays |

## The checks

### C1. Describe it in one line (research #1)

**The moment:** Evening, laptop. They just thought "I wish I had a coach
like Tony" and want to see if this thing gets him, without writing a prompt.

**Steps:**
1. Open Start. Look at the screen before touching anything.
2. Click the chip **A tough-love coach like Tony Robbins**.
3. Check the composer, then press Enter.
4. Watch the chat and the Sketch until the reply finishes.

**Done well:**
- Before step 2: the heading reads "Who should this agent be? One line is
  enough.", three chips show, the composer says "Type here…" and already
  has focus (you can type without clicking). Keep is disabled, and hovering
  it says "Give it a name first".
- Step 2 puts the chip text in the composer **without sending it**, with
  the cursor at the end.
- After Enter: your bubble shows at once, the chips are gone, "Sketching…"
  shows under a "Sketcher" label and in the Sketch header title. The fields
  shimmer faintly and are read-only.
- The reply **streams in word by word**; it does not appear all at once at
  the end.
- When it finishes, **all three fields** (Name, Persona, Instructions) are
  filled, each with a "new" tag. The switcher in the top bar shows the name.
- Under the reply: "Sketch: name, persona and instructions updated".
- The reply asks at most one or two questions, and it does this **after**
  the draft exists, never as an interview before it.
- No raw `<draft>` or `{ "name": …` text shows anywhere in the chat, not
  even for a moment while streaming.
- Keep is now enabled.

### C2. Glance at the draft after a reply (research #2)

**The moment:** A reply just landed. Their eyes jump to the Sketch: "Did it
actually change what I asked, and leave the rest alone?"

**Steps:**
1. Before sending, copy the current Instructions text somewhere (a note).
2. Type `Give him a shorter name` and press Enter.
3. When the reply ends, look at the Sketch without scrolling the chat.
4. Click the change line under the reply.

**Done well:**
- Only the Name field reacts: a warm bar on its left edge (fades over about
  4 s) and a "new" tag. Persona and Instructions show **no** bar and **no**
  tag.
- The Instructions text is exactly the text you copied in step 1 (compare
  it).
- The change line reads "Sketch: name updated". Its words come from what
  actually changed, not from the Sketcher's wording.
- Clicking the change line scrolls the Sketch to the Name field and shows
  its bar again.
- What the chat says it changed matches what the Sketch shows. If the
  reply claims a change that the Sketch doesn't show, this check fails.
- A reply that changes nothing shows **no** change line, and no field moves.

### C3. Answer the Sketcher's question (research #3)

**The moment:** Right after the first sketch. They're leaning in, and they
answer in as few words as they can.

**Steps:**
1. Read the Sketcher's question in C1's or C2's reply. Check that it
   carries a suggested answer ("…? I'd keep it clean.").
2. Type only `ok` and press Enter.
3. On the next reply, if there's a question, answer only part of it or
   ignore it and ask for something else.

**Done well:**
- Each question comes with a suggested answer in the same sentence. There
  are never more than two questions in one reply, and there is no form, no
  list of options and no buttons.
- "ok" is accepted as "use your suggestion", and the draft changes to
  match on that same turn (a change line appears).
- Skipping or half-answering is fine: the Sketcher goes on with what you
  asked and doesn't repeat the skipped question word for word.
- The Sketcher never asks for something you already told it.

### C4. Nudge it by chat (research #4)

**The moment:** Something sounds off ("he'd never say 'awesome'") and they
fix it with a few words.

**Steps:**
1. Copy the current Name and Instructions into your note.
2. Type `More blunt. No hype words.` and press Enter. Time it.
3. When it ends, compare the Sketch with your note.
4. Type `Actually, make him a bit gentler` and press Enter.

**Done well:**
- Step 2: the Persona (and maybe the Instructions) changes, and the change
  is about tone. The Name is unchanged. Untouched fields carry no bar or
  tag.
- The persona is edited, not rewritten from scratch: lines you didn't ask
  about are still there.
- Step 4: the latest wish wins (gentler), and the earlier fixes that don't
  conflict with it (no hype words) are still there.
- The Sketcher doesn't argue or ask "are you sure?".
- Note the time to first words and to the full reply.

### C5. Try it out: hear the voice (research #5)

**The moment:** The Sketch *looks* right, but they need to *hear* it. They
ask the agent a real question from their own life.

**Steps:**
1. Check the composer placeholder after the first sketch (it should read
   "Ask how [Name] would answer something real…" once).
2. Type `How would he answer: I can't get out of bed in the morning?` and
   press Enter. Time it.
3. Watch the reply while it streams and when it ends.
4. Ask a second sample question.

**Done well:**
- The answer shows as a **voice card**: indented, bordered, a circle with
  the name's first letter, the name, the answer in italic, and the caption
  "sample, from the current sketch".
- The answer speaks **as** the agent ("Get up. Now."), not *about* it ("He
  would probably say…").
- While streaming, it shows as plain text. The card appears only when the
  reply is done, with no half-built card.
- The first card rises in gently; the second just appears.
- "If that's him, press Keep." shows **at most once** for this agent, after
  the first card. It doesn't come back after the second card.
- The voice matches the current Sketch (blunt but gentler, from C4).
- The draft is not changed by a sample question (no change line), unless
  you asked for a change too.

### C6. Fix a field by hand, and it stays fixed (research #6, top trust-breaker)

**The moment:** The draft is 90% right. Typing three words is faster than
explaining them. A second later they worry: "Will the AI undo my change?"

**Steps:**
1. Click the **Name** field and retype it to `Coach T`. Stop typing and
   wait.
2. Click into **Persona** and add one sentence at the end:
   `He always ends with one action for today.` Then click outside the
   field.
3. In the chat, type `Make the instructions shorter` and press Enter.
4. While the reply is streaming, try to type into any Sketch field.
5. When it ends, read Name and Persona.
6. Type `Rename him to Tony` and press Enter.

**Done well:**
- Step 1: about 1 s after you stop typing, "✓ saved" shows in the Name
  label row for about 1.5 s, then the tag becomes "✎ yours". The word
  "kept" never appears for a field.
- Step 2: "✓ saved" on leaving the field, then "✎ yours". In Network: one
  `PUT …/draft` per field, not one per keystroke.
- Step 3: if a hand edit was still unsaved, its `PUT` goes out **before**
  the chat `POST`.
- Step 4: while sketching, the fields can't be typed into (you can still
  select and copy text). The tag spots are empty; there's no per-field
  "Sketching…". When the reply ends, the fields open again.
- Step 5: **Name is still "Coach T" and your Persona sentence is still
  there, word for word.** Only Instructions changed. This is the most
  important line in the whole file. If a hand edit is gone or changed
  without the Sketcher saying so first, the check fails.
- Step 6: the Sketcher may change the Name now, because you asked. Either
  it does it (the tag turns from "✎ yours" to "new", never both at once),
  or it asks first. It never changes a "yours" field you didn't ask about.
- Clearing the Name by hand disables Keep. Typing a name back enables it.

**Hard case (watch-out: a hand edit that must not be overwritten).** The
user edits a field and then, out of habit, asks for a broad change that
touches the same field, so the save and the send race.

7. Edit one Instructions line by hand to something you'll recognize, e.g.
   `Never use the word "awesome".`
8. Within 1 s, without waiting for "✓ saved", type
   `Rewrite everything to be more energetic` and press Enter.
9. When the reply ends, read the Instructions.

**Done well (hard case):**
- In Network, the `PUT …/draft` finishes **before** the `POST …/chat`.
- Your line is still in the Instructions, word for word. Or, if the
  Sketcher wants to change it, it **says so in the chat first** and the
  line stays until you agree. A silent change or loss of your line is a
  fail.
- "✎ yours" stays on Instructions until a reply actually changes that
  field.

### C7. Decide it's done and press Keep (research #7)

**The moment:** 10–30 minutes in. The sample answer felt right: "That's
him." A small fear: "Is it really saved? Can I still change it?"

**Steps:**
1. First type `ok save it, I'm done` in the chat and press Enter.
2. Read the reply, then look at the Sketch header.
3. Press **Keep** once.
4. Read the Sketch pane and the chat.
5. Reload the page (Cmd+R).
6. After reload, change one word in the Persona by hand.

**Done well:**
- Step 1: the Sketcher does **not** say it saved, kept or finished the
  agent. It says the work is saved automatically and points to Keep. The
  header still shows **Keep** (not "Kept ✓").
- Step 3: in under 1 s, the button is replaced by the status **Kept ✓**,
  and a card settles at the top of the Sketch: the name, the first sentence
  of the persona, and "Yours. You can keep changing it." The card has no
  "Kept ✓" of its own. A short, calm celebration plays (under 1 s) and does
  not block typing.
- Nothing new appears in the chat after Keep.
- The switcher menu shows the agent with "Kept".
- Step 5: after the reload, the same agent opens, with the same Name,
  Persona and Instructions, and the header says **Kept ✓**. The agent was
  really saved, not just shown as saved.
- Step 6: the card goes away and the header shows **Keep** again, enabled.
  No warning and no dialog.
- Press Keep again to finish in the Kept state for C8.

### C8. Leave and come back later (research #10)

**The moment:** The tired tinkerer closed the tab last night. Today they
open it again to make one more change.

**Steps:**
1. Close the browser tab. Stop the server (Ctrl+C) and run `npm start`
   again.
2. Open Start.
3. Type `Make his instructions mention mornings` and press Enter.
4. Then type `Where were we?` and press Enter.
5. Open the switcher menu.

**Done well:**
- Step 2: the most recent agent opens at once (no AI call: no request to
  `…/chat` in Network). The chat is empty except for one quiet line
  "Back to [Name]." The composer has focus. No "new" or "yours" marks are on
  the fields. The draft matches what was there before closing.
- Step 3: the first reply goes straight to the change you asked for, with
  **no** automatic recap in front of it. The Sketcher clearly remembers the
  earlier session (for example, it keeps the blunt-but-gentle tone).
- Step 4: now, because you asked, it gives a short recap.
- Step 5: only real agents are listed, newest first. There are no
  "Untitled sketch" rows from empty agents.

### C9. Paste a chunk of text (research #8)

**The moment:** A clone-maker has a bio or a transcript excerpt open in
another window and pastes it in, because there are no uploads yet (P3).

**Steps:**
1. Start a **+ New agent**.
2. Type `Use this:` then paste a text of more than 300 words (any long
   article or bio), and press Enter.

**Done well:**
- The composer takes the whole paste without freezing. It grows to about 8
  lines, then scrolls.
- The bubble shows "Use this:" and a collapsed chip **Pasted note · N
  words ▸**. Clicking ▸ shows the full text in place.
- The reply uses the pasted material: the persona shows details that came
  from the text.
- The page stays responsive while the reply streams.

## Watch-out checks

### W1. The stream breaks mid-reply

**The moment:** The reply is halfway in, and the connection drops, or the
user changes their mind and stops it. They fear their message and their
draft are gone.

**Steps:**
1. Copy the current Sketch into your note.
2. Send `Make him sound older and wiser`. While the words are still
   streaming, press the **Stop** button (or Esc in the composer).
3. Press **Try again** on the line under your bubble.
4. Send another message. While it streams, stop the server in its terminal
   (Ctrl+C).
5. Start the server again (`npm start`), go back to the page and press
   **Try again**.

**Done well:**
- Step 2: the partial Sketcher text disappears. Your bubble stays, and
  under it "Stopped. · Try again" shows in a neutral color, not red. The
  Sketch is exactly as in your note. The fields can be edited again.
- Step 3: the same message is sent again (you don't retype it) and the
  turn completes normally.
- Step 4: within a few seconds, the partial text is removed and "Lost the
  connection to the app. · Try again" shows under your bubble. The Sketch
  is unchanged. Nothing is stuck in "Sketching…".
- Step 5: Try again resends that message and the turn completes.
- Throughout: any text you had typed in the composer is never cleared by an
  error. A hand edit made before the break is still there.
- *Optional, if you can make the CLI unavailable:* the banner "The Sketcher
  can't reach Claude right now. Your text stays here." appears above the
  composer with one button (**Try again** with a failed turn, **Check
  again** without one), and the line under the bubble has no Try again of
  its own. Mark this line "not run" if you can't set it up.

### W2. An empty first line

**The moment:** Someone presses Enter before typing, or types only spaces,
from habit or by accident.

**Steps:**
1. Start a **+ New agent** (or use the empty one from S1).
2. With the composer empty, press Enter. Then click Send.
3. Type three spaces and press Enter.
4. Type `a` then Shift+Enter, then `b`.
5. Open the switcher menu.

**Done well:**
- Steps 2 and 3: nothing is sent. No bubble, no "Sketching…", no request to
  `…/chat` in Network, no error message. Send looks disabled while the box
  is empty or only spaces. The chips are still there.
- Step 4: Shift+Enter adds a new line, and does not send.
- Step 5: the empty agent is not in the list. Choosing **+ New agent**
  again stays on the same empty screen (no second empty agent is made).

### W3. A double press on Keep

**The moment:** The click didn't seem to do anything for a beat, so they
click again, or they double-click from habit.

**Steps:**
1. Make one hand edit so Keep is enabled again. Without leaving the field,
   double-click **Keep** fast.
2. Look at Network and at the Sketch header.
3. Reload the page.

**Done well:**
- In Network: at most one `PUT …/draft` (for the pending edit) and
  **exactly one** `POST …/save`.
- The button shows a saving state on the first click and ignores the
  second. You see one "Kept ✓", one card and one celebration, not two.
- No error message such as "Couldn't keep · Try again" appears from the
  second click.
- After the reload: the hand edit is there and the header says **Kept ✓**.
- *Related:* if the save fails, the button shows "Couldn't keep · Try
  again" for about 4 s, then Keep again, and no work is lost.

## Results table (copy into build-jony.md / signoff-eraser.md)

| Check | Pass / fail | What I saw (one line) |
|---|---|---|
| C1 One line | | first words: _ s, full reply: _ s |
| C2 Glance at the draft | | |
| C3 Answer a question | | |
| C4 Nudge by chat | | first words: _ s, full reply: _ s |
| C5 Try it out | | first words: _ s, full reply: _ s |
| C6 Hand edit stays (incl. hard case) | | |
| C7 Keep + reload | | |
| C8 Come back | | |
| C9 Paste | | |
| W1 Stream breaks | | banner line: run / not run |
| W2 Empty first line | | |
| W3 Double press on Keep | | |

## Notes and assumptions

- **Double Keep (W3)** isn't written down in the design. I expect the
  simplest rule: Keep ignores clicks while it is saving (Merlin's
  `.keep-btn.saving` state). If the team chooses another rule, update W3.
- **12 checks:** C1–C9 follow the research's top behaviors (#1–#8, #10).
  W1–W3 are the watch-out cases. The "hand edit must not be overwritten"
  watch-out is the hard case inside C6, because it is the same behavior.
- **Empty first line (W2):** the server already rejects an empty message
  with 400. The check asks that the screen never sends one, so the user
  never sees that error.
- **CLI offline (W1, optional line):** the app finds `claude` in fixed
  install folders, so it's hard to fake "not installed" on a machine that
  has it. That's why that line is optional.
- **Not covered here:** narrow screens (research #20, rare), keyboard-only
  and reduced-motion runs (design §13 step 5 asks for those separately),
  and the "what does it know?" question (P12).
