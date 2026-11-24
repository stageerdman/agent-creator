# Review: cuts to the agent-creation chat design (P2)

*Eraser, Step Eraser. 2026-11-24. For Jony (design owner), Uncle Bob (build),
Merlin and Columbo. Reviews `design-jony.md`, using `magic-merlin.md` and
`research-columbo.md`.*

**Verdict: Approved with these required changes** (full list in the
sign-off at the end). Build `design-jony.md` with the eleven required
changes R1–R11 applied. Where this file and the design disagree, this file
wins.

## 1. The goal

> The user types one line about someone, sees a likeness at once, corrects
> it by chat or by hand, and presses Keep when it sounds like them.

The design already does this well. Jony cut most of the clutter before I
saw it: no modes, no Apply, no Save next to Keep, no per-field regenerate,
no question chips, no progress bar, no sidebar, no visible "later"
placeholders, no "Kept · changed since". I agree with every one of those
cuts (design §2). What's left is small: a few places where the same thing
is said twice, one word that means two things, and three places where the
user has to make two clicks to do one thing.

## 2. Step count: the most common path

Typical session: first line, two chat nudges, one hand rename, one
"how would he answer…?", Keep. Clicks, typing, reading and waiting all
count.

| # | Step | Mark | Why |
|---|---|---|---|
| 1 | Open the app. It lands in S1 with the composer focused, or in the last agent (S9) | Keep | Zero clicks. No splash, no list. |
| 2 | Read "Who should this agent be? One line is enough." | Keep | One line. The chips show the rest. |
| 3 | Type one line, or click a chip and edit it | Keep | The chip fills the box but doesn't send, so it adds one click and saves the typing. That's the right trade. |
| 4 | Press Enter | Keep | |
| 5 | Wait (Sketching…) | Keep | This is the CLI. Shimmer and dots only show that something is happening. |
| 6 | Glance at the Sketch: bar, "new", change line | Keep | This is the top behavior (#2). Three signals, but each covers a different spot or moment. See C9. |
| 7 | Read the Sketcher's reply and its one question (it suggests an answer) | Keep | |
| 8 | Nudge 1: type and press Enter | Keep | |
| 9 | Wait, then glance | Keep | |
| 10 | Nudge 2: type and press Enter | Keep | |
| 11 | Wait, then glance | Keep | |
| 12 | Click Name and retype it | Keep | It saves on its own. No Save button. |
| 13 | Read "✓ kept" and then "✎ yours" | **Change** | Fine as a signal, but "kept" means the wrong thing here (R1). |
| 14 | Type "How would he answer: I can't get out of bed?" and press Enter | Keep | The one-time placeholder hint covers how people find this. No button needed. |
| 15 | Wait, then read the voice card | Keep | |
| 16 | Click Keep | Keep | The only way to finish. One click, no dialog. |
| 17 | Read the Keep card | Keep | This is the moment that makes the agent theirs. Research #7 asks for name plus a summary. |
| 18 | Read the Sketcher's local line "Kept. Come back any time…" in the chat | **Cut** | Says the card's words a second time, in the pane the user isn't looking at (R3). |

**Returning user path, extra steps:**

| # | Step | Mark | Why |
|---|---|---|---|
| R-a | Read "Back to Tony." | Keep | One static line. Free. |
| R-b | Read a one-line recap at the top of the first reply, before the answer they asked for | **Cut** | The Sketch on screen already is the recap. The recap pushes back the answer the user actually asked for (R6). |

**Count:**
- **Current:** 18 steps on the main path, plus 2 on return = **20**.
- **Target:** **17 + 1 = 18**, after R1 (relabel step 13), R3 (drop
  step 18) and R6 (drop R-b).

The main path has only 4 clicks or key presses that aren't typing: Enter,
Enter, Enter, Keep. That's as low as it goes without auto-sending, and
auto-sending would be wrong.

**Side paths, before and after the required changes:**

| Path | Now | After | Change |
|---|---|---|---|
| CLI goes offline mid-turn, then comes back | Check again, then Try again (2 clicks, 2 buttons on screen) | 1 click | R4 |
| Hand save failed, user wants to send | Notice that Send is blocked, read the tooltip, Retry, Send (4) | Send (1). Send retries the save first | R5 |
| Hand edit still saving, user wants to Keep | Keep is disabled with no visible reason, wait, Keep (3) | Keep (1). Keep saves first | R5 |
| Find an agent in the switcher | Scroll past "Untitled sketch" rows from abandoned "New agent" clicks | Only real agents in the list | R8 |

## 3. Every cut or change, with the reason

### Double ways to do the same thing

**C1. "Kept" means two things → R1 (required).**
Field save shows **✓ kept**. Finishing shows **Keep / Kept ✓**. After Keep,
a hand edit returns the header to **Keep**, while the field at the same
moment says **✓ kept**. On one screen, one word says both "saved" and "not
kept". Rename the field tick to **✓ saved**. Also, the offline banner's
"Your message is kept" → "Your text stays here." (on open there's no
message yet, so "message" is wrong too). Rule for the build: the word
*keep/kept* appears only for the Keep action and its status.

**C2. Keep isn't the only way to finish if the user says "save it" in
chat → R2 (required).**
Merlin asked me to check that Keep is the only way to finish. On screen it
is. But users will type "ok save it" or "done", and a Sketcher that answers
"Saved! Your agent is complete" creates a second way to finish that doesn't
set `status: 'saved'`. Creator prompt rule: the Sketcher never says it saved
or kept the agent. It says the work is autosaved, and that Keep in the
Sketch header makes it theirs. It doesn't trigger a save itself.

**C3. Three "it's kept" messages for one click → R3 (required).**
After Keep the user sees: (a) **Kept ✓** in the header, (b) **Kept ✓**
inside the card, (c) a local Sketcher line in the chat, "Kept. Come back any
time to change it.", and (d) "Kept" in the switcher.
- Keep (a), the status where the button was.
- Keep the card, but **drop its own "Kept ✓"**. It sits right under the
  header that already says it. The card becomes: name, first sentence of
  the persona, "Yours. You can keep changing it."
- **Cut (c).** It repeats the card's last line, it's a fake Sketcher turn
  that isn't an AI reply, and it vanishes on reload, so the chat would
  differ between sessions. The user's eyes are on the Sketch pane anyway,
  since they just clicked Keep there.
- (d) is fine. It's only seen when the menu is open.

**C4. Two recovery buttons for one outage → R4 (required).**
If the CLI drops mid-turn, the design shows "Try again" under the bubble
*and* the banner's "Check again". Try again while offline just fails again.
Pick one: while the offline banner is visible, the bubble line shows its
text without a Try again link. The banner button does both jobs. It
re-checks health, and if it's back and there's a failed turn, it resends
that turn. So: **"Try again"** when there's a failed message, **"Check
again"** when there isn't (on open). One button, one click. Clicking it is
the explicit go-ahead, so the resend isn't a surprise.

**C5. "Retry" and "Try again" for the same action → part of R4 (required).**
The field error says "Not saved · Retry". Everywhere else it's "Try
again". Use **"Not saved · Try again"**. One word per action.

### Steps that don't need to exist

**C6. A failed or pending save blocks Send and Keep → R5 (required).**
H3 already says "on send, save pending edits first, then chat". Apply the
same rule everywhere:
- **Send** is never blocked by a failed hand save. Pressing Send retries
  the PUT first. If it fails again, the turn doesn't go out, the field
  shows "Not saved · Try again", and the composer keeps its text. Cut the
  tooltip "Save your edit first".
- **Keep** is enabled while a hand save is pending. On click it saves the
  pending edits, then `POST /save`. If the PUT fails, use the normal
  "Couldn't keep · Try again".
- The reason (the Sketcher must never see an old draft) is still met, and
  the user loses a disabled state they couldn't see the reason for.

**C7. "Sketching…" shown five times at once → R7 (required).**
During a reply, H3 puts "Sketching…" in each field's label row (×3), S2
puts it in the Sketch header, and the chat shows it with dots. Keep two:
- **chat** (dots, under the label), where the reply will appear;
- **Sketch header title** ("Sketch" → "Sketching…") on **every** turn, not
  only the first. That one spot explains why the fields are read-only right
  now.

Cut the per-field "Sketching…". The tag area just stays empty while the
reply runs. `readonly` and `aria-busy` stay as they are.

**C8. A recap the user didn't ask for → R6 (required).**
S9 makes the first reply after a return open with a one-line recap. The
user just typed "make him gentler" and wants that, not a summary of
yesterday. The Sketch on screen already shows where they left off (the
draft is the scoreboard, insight 2), and "Back to Tony." covers the
greeting. Creator prompt: no automatic recap on resume. Give one only when
asked ("where were we?"). `--resume` stays, so the Sketcher still knows the
history.

**C9. Fresh-line bar + "new" tag + change line → Keep (no change).**
I checked these for duplication. They don't overlap:
- the change line lives in the chat, where the user is reading;
- the bar catches the eye in the first seconds;
- the tag carries the meaning in words after the bar fades, and for screen
  readers.

Watch item W1 covers this later.

**C10. The change line is a button → Keep.**
It's a shortcut to the same Sketch, not a second way to edit, and on narrow
screens it's the obvious way from "something changed" to "show me". It
doesn't fight with the Chat | Sketch switch, because both lead to the same
view.

**C11. Undo left out (J3) → Keep the deferral.**
There's no confirmation dialog to swap for an undo, and adding a button
"just in case" goes against everything else cut here. J3's check is the
right gate. If the Sketcher can't reliably put the last version back, add
the one-step Undo on the change line, as J3 says. Don't add it anywhere
else.

### Gaps that would turn into guessing

**C12. Switching to another agent while sketching isn't defined → R9
(required).**
S12 disables "+ New agent" while sketching, but the other rows in the same
menu aren't covered. Apply one rule to the whole menu: while sketching, the
agent rows and "+ New agent" are disabled, with the same tooltip "Wait for
the Sketcher to finish". The switcher button itself still opens the menu,
so the reason can be read.

**C13. Empty agents pile up in the only list → R8 (required).**
Every "+ New agent" runs `POST /api/agents` at once. Click it, change your
mind, and the switcher gets an "Untitled sketch" row forever. Two rules:
- an agent with an empty name, persona and instructions **isn't listed** in
  the switcher;
- "+ New agent" while the current agent is already empty does nothing new.
  It stays on the same S1.

The rename "Untitled sketch" is still needed for an agent that has a
persona but no name yet.

**C14. "Press Keep" nudges could start to push → R10 (required).**
The voice card ends with "If that's him, press Keep." Repeated after every
sample, that's the "your agent is complete!" pressure the research warns
about (#7). Creator prompt rule: the pointer to Keep appears **at most once
per agent**, after the first voice card, and never after the agent is
Kept.

**C15. Empty-state heading and placeholder say the same thing → R11
(required, one string).**
The heading says "Who should this agent be? One line is enough." The
placeholder right below says "Describe your agent in one line…". The user
reads the same instruction twice. Make the empty-state placeholder
**"Type here…"**. The heading does the asking, the chips do the showing,
and the box only needs to look like a box. Example text in the placeholder
would just copy the chips. The other placeholders
stay as they are.

### Magic I checked and kept as is

- **Chips fill, don't send.** One extra click, saves typing, and lets
  people add "…but gentler". Keep.
- **The first-sketch shimmer and stagger.** Under 0.3 s, plays once. Adds
  no wait. Keep.
- **The voice card.** It's a rendering rule, not a mode or a button, and
  it's the moment research says decides "done". Keep.
- **The one-time placeholder "Ask how [Name] would answer something
  real…"** is how people find "try it out", with no button. Keep. It's the
  best kind of magic: it costs zero steps.
- **The Keep card's persona summary** repeats a sentence of the field just
  below it. I accept that, because research #7 asks for exactly this, and
  the card holds the P12 line later.
- **Merlin's check 2** ("new" and "yours" never on the same field at once):
  H2 covers it. **Pass.**
- **Merlin's check 1** (Keep is the only way to finish): passes on screen.
  It passes fully once R2 is applied.

## 4. Watch later (not required now)

- **W1.** In the Phase 6 live run: after a nudge, do people find the change
  from the bar alone? If the change line is never used on wide screens,
  make it plain text there and keep it as a button only on narrow screens.
- **W2.** "✎ yours" (a hand-edited field) and "Yours. You can keep changing
  it." (on the Keep card) use one word for two ideas. They rarely show at
  the same time, since the card goes away on any change, but if testers
  mention it, change the card line to "It's yours now…".
- **W3.** A power user can type only a Name in S1 and press Keep, which
  keeps an agent with an empty persona. That's rare and harmless, so I
  added no extra rule. Revisit if it shows up.
- **W4.** J2 (fields locked during a reply): if the median reply time goes
  over ~15 s, the lock will start to annoy. Then look at H3 again, but
  don't add merge logic.
- **W5.** Any new button in P3 or P12 goes into the reserved spots in §9
  only. If a later phase wants a second place to start the same action,
  send it back here.

## 5. Sign-off

**Approved with these required changes.**

The build team (Uncle Bob) follows `design-jony.md` **with R1–R11 applied**.
Where the two disagree, this file wins. Jony owns the wording and the
layout of each fix. If Jony updates `design-jony.md` to include them, I'll
check that the update matches this list and sign it as plain **Approved**.

| # | Required change | Where in the design | Owner |
|---|---|---|---|
| R1 | Field save tick "✓ kept" → **"✓ saved"**. Offline banner "Your message is kept." → **"Your text stays here."** The word keep/kept only for Keep. | S6 H1, S10 banner, §4, §12 | Jony / frontend |
| R2 | The Sketcher never claims to have saved or kept the agent. If asked to save, it says the work is autosaved and points to Keep. | Creator prompt (Phase 2), §10 | Prompt owner |
| R3 | Cut the local chat line "Kept. Come back any time to change it." Drop "Kept ✓" from inside the Keep card (the header status stays). | S8, §12 | Jony / frontend |
| R4 | When the offline banner shows, the bubble error line has no own Try again. The banner button is **"Try again"** (re-check, then resend the failed turn) or **"Check again"** (no failed turn). Field error reads **"Not saved · Try again"**. | S10, S6 H6, §12 | Jony / frontend |
| R5 | Send and Keep are never blocked by a pending or failed hand save. Each one saves first, then goes on. Cut the tooltip "Save your edit first". | S6 H6, S8 enable rule, §10 step 1, §12 | Frontend |
| R6 | No automatic recap on resume. Give one only when the user asks. | S9, creator prompt | Prompt owner |
| R7 | "Sketching…" shows in two places only: the chat, and the Sketch header title on every turn. Cut the per-field "Sketching…". | S2, S6 H3 | Jony / frontend |
| R8 | The switcher hides agents whose name, persona and instructions are all empty. "+ New agent" on an empty agent stays on it instead of creating another one. | Top bar, S12, S0 | Frontend |
| R9 | While sketching, every agent row in the switcher is disabled too (same tooltip), not only "+ New agent". | S12 | Frontend |
| R10 | The Sketcher's "If that's [them], press Keep." appears at most once per agent, never after Keep. | S7, creator prompt | Prompt owner |
| R11 | Empty-state composer placeholder → **"Type here…"** (the heading already asks the question). | S1, §5 Composer, §12 | Jony |

**Final step count:** 17 on the main path (from 18), 1 extra on return
(from 2). Four side paths go from 2–4 steps down to 1 each.

Signed: **Eraser**, 2026-11-24.
