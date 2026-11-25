# Block D · Talk

*Jony, 2026-11-25. Shared frame, components (C1–C14), data shapes and flags
live in `blocks-jony.md`. Journeys: **UJ5, UJ6, UJ7**. Owns Merlin ★1 Where
from, ★2 Not [Name], ★5 First words, 8 An honest Blank, 10 Where we left
off. Talk is **mock** (F2); the Sketcher inside the fix panel is the real
P2 Sketcher.*

## User goal

> "I have a problem now. Ask the one who'd know, trust where the answer
> came from, pick up where we left off, and if he sounds wrong, fix him
> right here, once."

**One primary action:** the Talk composer. Everything else is a quiet line
or a hover action. The daily path is open → face → type.

## What I removed, and why

| Removed | Why |
|---|---|
| A greeting on every open | Merlin §5. Only First words, once per agent, ever. |
| Per-message toolbar (copy, like, retry, share) | One action only: `Not [Name]`. Copy works by selecting text (macOS). |
| Thumbs up / down | A rating isn't a fix. `Not [Name]` is the fix; silence is the "good". |
| "Regenerate" | A second answer from the same agent hides the wrong note instead of fixing it. |
| Source badges or footnote numbers in the text | One Where from line after the answer, only when it leans on a reference. |
| ＋ references button in the Talk composer | References go through the Sketcher (blocks §4). A drop in Talk switches to Sketch (B1). |
| "New chat" titles | Titles are topics (Merlin 10). |
| A typing indicator with theatrics | P2's three dots only, and the first words start in seconds. |
| A "this sounds off" detector | Only the witness says `Not [Name]` (Merlin §5). |
| Separate talk-rename UI | Titles are made from the first exchange; the row menu has Rename for the rare case (D4). |

## D1 · Talk (UJ5 · 2–4, UJ6 · 3, UJ7 · 1, 4)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Agent Creator › (R) Rex Hart ▾                              [Talk|Sketch]│
├─────────────────────────────────────┬────────────────────────────────────┤
│                                     │ Past talks                 New talk│
│  How do I call my landlord about    │ ┌────────────────────────────────┐ │
│  the rent without caving?    (you)  │ │ Search past talks              │ │
│                                     │ └────────────────────────────────┘ │
│  (R) Rex                            │ Landlord call          today       │
│  Three breaths before you dial.     │ The job offer          yesterday   │
│  Then say the whole ask in one      │ Saying no to Dad       Mon         │
│  breath: "The rent goes up 5%, not  │ The 6 am thing         18 Nov      │
│  12. Here's why." Then stop talking.│ Team meeting on Monday 14 Nov      │
│  Where from · Day 2 – Hard Calls.mp4│ Why I stall on emails  11 Nov      │
│  · 14:20 · No Soft Days.pdf · p. 88 │ …                                  │
│                         Not Rex     │                                    │
│ ┌─────────────────────────────────┐ │                                    │
│ │ Talk to Rex…                 (↑)│ │                                    │
│ └─────────────────────────────────┘ │                                    │
└─────────────────────────────────────┴────────────────────────────────────┘
```

- **Left:** the talk. C4 message list: user bubbles (P2), agent messages in
  the P2 Sketcher style with the agent's 24 px face before the 13 px name
  label (`Rex`, first name). Composer: P2 composer, no ＋, placeholder
  `Talk to Rex…`, focused on open.
- **Right:** `Past talks` (D4) by default.
- **Streaming:** P2's streaming; first words in seconds (mock: 400 ms
  delay, then ~40 chars per 50 ms). Stop works as in P2.
- **Opening:**
  - Card click on Home → a **new talk**: empty list, composer focused, no
    line, no greeting (Merlin §5). Not saved until the first message.
  - `Last: …` on Home, or a row in Past talks → that talk **continued**
    (Merlin 10): the list scrolled to the end, showing at least the last
    two messages, composer focused. No recap, no motion.
  - The first time ever: D2.

### Parts of an agent message (C4, specced here once)

**Where from line** (★1). Under an answer that leans on a reference, 13 px,
60%, fades in 150 ms *after* the stream ends:
```
Where from · Day 2 – Hard Calls.mp4 · 14:20 · No Soft Days.pdf · p. 88
```
- 1–3 sources, the user's own file names, a place they can find. Each
  source is its own link → D3. Never chunk ids, never on every sentence.
- Long lines wrap; no truncation of file names under 60 chars (longer:
  middle ellipsis, full name in the tooltip and accessible name).

**Own-view line** (★1 honest absence). An answer from the persona alone:
```
Rex's own view · no reference
```
Same style, not a link. It is a pass, not a warning: neutral colour.

**Blank line** (8). Only under an answer about a Blank map topic, visible
only to the user, on a C8 strip (dashed top border, inset):
```
Blank in what Rex knows · Add a reference
```
- `Blank in what Rex knows` → Sketch mode, `What Rex knows`, that row
  focused. `Add a reference` → the macOS open panel → E1 (Sketch mode).
- The agent's own words never mention the map (Merlin §5).

**`Not Rex` action** (★2). On hover or keyboard focus of an agent message:
a text button `Not Rex` at the bottom-right of the message (13 px, 60% →
100% on hover, 44 px target). The **only** per-message action. Never on
user messages, dividers or First words before they finish streaming.
Hidden while streaming. Touch: always visible at 60% (no hover on touch;
not a Mac case, noted for later).

**Divider** (C4). Full-width thin rule with centred 13 px text:
- `── Rex was redrawn · persona updated ──` (after a fix, D5). Click →
  expands under it: the changed sentence as added text (`+ He never says
  "great question" and never uses emoji. He answers the question first.`)
  and `See the Sketch ↗` (Sketch mode, the changed field scrolled into
  view with its `from your talk` tag). Click again collapses.
- `── First words · 25 Nov ──` (D2). Not clickable.

### Answers by kind (mock, UJ5)
1. **Sourced** (UJ5 · 3): the landlord answer above.
2. **Own view** (UJ5 · 3 "no source"): `Should I quit my job?` → `Not
   because you're scared of Monday. Quit when you've got a plan you'd
   bet a year on. Do you?` + `Rex's own view · no reference`.
3. **Honest Blank** (UJ5 · 4, 8): `What should I eat before a big day?` →
   `Not my lane. I've never taught food, and I won't guess with your body.
   Ask someone who has. Now, what's the big day?` + the Blank line.
4. **Planted wrong note** (UJ7 · 1): `How do I get started in the
   morning?` → `Great question! 😊 Let's explore that together. Everyone's
   mornings are different…` (`planted: 'wrongNote'`). No source line, no
   own-view line (the planted answer has neither; that's part of why it
   feels off).
5. **Corrected** (UJ7 · 4), after D5: same question → `Feet on the floor
   before the phone. Three breaths. Then the one thing you dread, first.
   That's the Morning Standard.` + `Where from · No Soft Days.pdf · p. 12`.
6. **Continued** (UJ6 · 3): in `The job offer`, previous last two lines:
   you `They want an answer by Friday.` · Rex `Then you call them Friday at
   9, before you can talk yourself out of it. Write the first sentence
   now.` Next user message (any) → Rex `Last time you were going to call
   them Friday. Did you?` (own view).
7. **Anything else** (free text not in the script): a marked mock line
   (`data-mock`, F2): `(Demo) Rex would answer here. Try one of: …` with the
   4 scripted questions as chips that type the question (not send). Plain,
   never pretending.

### States
- **D1.1 New talk, empty:** composer only. Right pane: Past talks.
- **D1.2 Streaming:** P2 dots → text; Stop in the composer (P2).
- **D1.3 Answered** with Where from / own view / Blank line.
- **D1.4 Continued talk** (UJ6 · 3).
- **D1.5 Agent studying a top-up:** Talk works; the agent answers from what
  it has. The top bar shows the Studying line (C9). Nothing else changes.
- **D1.6 Agent never studied (Marcus):** every answer is own view. That's
  correct and honest. No banner about missing references (C3 says it, in
  the user's place).
- **D1.7 Imported, first open:** D2.
- **D1.8 After a fix:** divider in place; composer prefilled (D5).
- **D1.9 Errors:** D6.
- **D1.10 Long talk:** the list virtualises past ~200 messages; Past talks
  row stays the same.

## D2 · First words (★5, UJ2 · 10 → UJ5 · 2, UJ3 · 2, UJ11 · 2)

When an agent is opened in Talk for the **first time in its life**
(`firstWords.at === null`): after `Talk to Rex →` on the Keep card (B6), or
the first open of an imported agent (F3), or the first card click after a
Keep made elsewhere.

1. Frame 0: the composer is ready and focused. The top bar face and the
   message label face are **outlines** (C5).
2. 0–600 ms: the face **fills in** (outline → filled, C5 fill-in), in the
   top bar and the message label at the same time. Once per agent, ever.
3. Then the first line **streams** as Rex's first message, in voice:
   `You came. Good. What have you been putting off?`
4. Above it, the mark: `── First words · 25 Nov ──`, which stays at the top
   of this first talk forever.
5. The talk is saved at once (it has a message), titled `First words`
   until the user's first message retitles it from the topic.

- **Typing cancels the stream**: the line shows in full at once; the user
  keeps typing.
- Once complete, the first line gets `Not Rex` like any answer: a wrong
  first line is a wrong note too.
- After this, opening Rex never greets again.
- The mark's date is the day of First words (Rex: `25 Oct`; Ines and Juno
  in the demo: `25 Nov`).
- Reduced motion: the face appears filled in; the line shows in full.
- Offline at that moment: no first words (no fake); the face fills in and
  the C11 banner shows. The first words come with the first successful
  open (they're from the persona, so they can't be pre-made without
  Claude; the mock has them scripted).

**Lines** (mock): Rex `You came. Good. What have you been putting off?` ·
Marcus `Sit. What is in your control today, and what isn't?` · Edie `Send
me the draft. I'll tell you what to cut.` · Juno `Paste the clause that
worries you. I'll tell you what it means in plain words.` · Ines (after
the UJ2 Keep) `Before we talk numbers — what do you actually need from
this deal?` · real one-line agents (F2): `(Demo) First words would be
here.` marked mock.

## D3 · Where from (the passage panel, UJ5 · 3)

Clicking a source in a Where from line opens C7 in the right pane (over
Past talks):

```
│ Day 2 – Hard Calls.mp4                          ‹ 1 of 2 ›    ✕ │
│─────────────────────────────────────────────────────────────────│
│ 14:20                                                           │
│                                                                 │
│ Before you dial, three breaths. In through the nose, all the    │
│ way down. Then you say the whole ask in one breath, and you     │
│ stop. Silence is not your enemy on a hard call. The person who  │
│ fills the silence is the one who gives something away.          │
│   (underlined: "three breaths" … "say the whole ask in one      │
│    breath, and you stop")                                       │
│                                                                 │
│ Used in this answer                                             │
```
- The underline draws left to right, 300 ms (C7). Reduced motion: there
  at once.
- `‹ 1 of 2 ›` steps through the answer's sources; the clicked one opens
  first.
- `✕` / Esc → Past talks; focus returns to the source link.
- The panel never opens on its own.
- **Removed reference** (E3) still cited in an old talk: the old answer
  keeps its line, and that source shows as plain text `Old seminar
  2009.mp4 · removed` (not a link, no strike-through). New answers never
  cite it.
- **Narrow:** full view with `✕` (blocks §4.3).

## D4 · Past talks (UJ6 · 1–2, UJ12 · 2 for talks)

Right pane default in Talk.

- **Header:** `Past talks` (17 px) · on the right `New talk` (text button,
  ⌘N). It starts an empty talk on the left.
- **Search field** `Search past talks` (P2 field style), ⌘F focuses it.
- **Rows:** title (15 px) · when (13 px, right: `today`, `yesterday`,
  weekday within the week, `18 Nov` after). Newest first. The open talk is
  highlighted (selected row style, `aria-current`). No previews: the title
  is the topic; the list stays calm.
- **Titles:** from the first exchange, as a topic (Merlin 10): mock
  provides them. While a new talk has one message, its row shows
  `New talk` in 60% until the title arrives after the first answer.
- **Row menu** (on hover/focus, `⋯`, the only row action): `Rename` (inline
  edit, Enter saves, Esc cancels) · `Delete…` → C10 sheet `Delete "Saying
  no to Dad"? The talk goes. Rex stays as he is.` [Cancel] [Delete]. Plain.
  Deleting the open talk leaves an empty new talk.

### Search (UJ6 · 2)
- Filters as you type (150 ms debounce) over titles and message text.
- Rows that match by text show one 13 px line under the title with the
  matched words in semibold: `…call them **Friday** at 9…`.
- Opening a matched talk scrolls to the first match and highlights it
  briefly (a 1 s background, no motion with reduced motion).
- **No match:** `No talks with "mortgage".` (13 px, 60%). No suggestions.
- Esc clears the search.

### States
- **D4.1 No talks yet** (new agent, before First words): the header and
  `Your talks with Rex will be here.` (13 px, 60%). No search field until
  there are 3 talks.
- **D4.2 One to fourteen talks** (Rex: 14, all fit with scroll).
- **D4.3 Searching / no match.**

## D5 · Not [Name] (the fix panel, UJ7 · 2–4, ★2)

Click `Not Rex` on the planted answer:

```
┌─────────────────────────────────────┬────────────────────────────────────┐
│  How do I get started in the        │ Sketcher · fixing Rex           ✕  │
│  morning?                    (you)  │────────────────────────────────────│
│                                     │ ┃ Rex: "Great question! 😊 Let's   │
│  (R) Rex                            │ ┃ explore that together."          │
│  Great question! 😊 Let's explore   │                                    │
│  that together…       ← marked     │ Sketcher                           │
│                                     │ You said this isn't Rex. What      │
│                                     │ would he say instead, or what's    │
│                                     │ wrong with it?                     │
│                                     │                                    │
│ ┌─────────────────────────────────┐ │ ┌────────────────────────────────┐ │
│ │ Talk to Rex…                 (↑)│ │ │ Say what's wrong…           (↑)│ │
│ └─────────────────────────────────┘ │ └────────────────────────────────┘ │
└─────────────────────────────────────┴────────────────────────────────────┘
```

- Opens in the right pane in 200 ms; **the talk stays put**. Focus moves
  to the fix composer (the user asked, blocks focus rules).
- The wrong message in the talk gets a 2 px left rule in the warm mark
  colour while the panel is open (so the user sees what's being fixed).
- **Pinned strip:** the carried line, first 1–2 sentences, quoted, on the
  torn-off strip (left rule, 13 px label `Rex:`). Stays at the top of the
  panel while it scrolls.
- **The Sketcher is the real P2 Sketcher** of this agent (same session),
  given the pinned line as context. The opening Sketcher line is fixed
  text (not an AI call).
- User: `He'd never say "great question" and never uses emoji. He answers
  first, then asks one hard question.`
- **Sketcher reply** (P2): `Got it. Rex answers first and never flatters.
  I've redrawn him.` + change line `Sketch: persona updated · from your
  talk ↗` (↗ → Sketch mode, the field). In the Sketch the field gets P2's
  `new` mark and the tag `from your talk`.
- **Hand-written field** (P2 H4): if the change touches a `✎ yours` field,
  the Sketcher asks first (P2), nothing changes until the user agrees.
- **Close** (`✕` / Esc, or after the change, the same): the panel goes,
  Past talks returns. In the talk:
  - the divider `── Rex was redrawn · persona updated ──` fades in (200 ms)
    right after the wrong message;
  - the Talk composer is **prefilled** with the question that got the wrong
    answer (`How do I get started in the morning?`), typed, not sent,
    focused. One ↑ press and the next answer is from the redrawn Rex
    (UJ7 · 4).
- **Closing without a change:** no divider, no prefill, the mark on the
  message goes. Nothing happened, and it says nothing.
- A normal Talk message like "be blunter" **never** changes Rex (OQ1); Rex
  just answers it in character.
- F8: the fix sets `status: 'draft'`; Keep shows in the Sketch, Home keeps
  Rex in kept (by `keptAt`). The talk uses the new persona right away.

### States
- **D5.1 Open, waiting** (as drawn) · **D5.2 Sketcher thinking** (P2 dots)
  · **D5.3 Changed** (reply + change line) · **D5.4 Asked first** (yours
  field) · **D5.5 Sketcher error** (P2 S10 lines inside the panel) ·
  **D5.6 Closed with change** (divider + prefill) · **D5.7 Closed without
  change**.
- **Narrow:** the panel is the full view; `✕` back to the talk.

## D6 · Errors in Talk

Same rule as P2 S10: the user's bubble stays, the line under it says what
happened, **Try again** resends. Partial agent text is removed.

| Cause | Line under the bubble |
|---|---|
| Claude not reachable (mid-turn) | `Rex can't reach Claude right now.` + C11 banner |
| Failed | `Something went wrong on Claude's side. · Try again · Details` |
| Garbled | `Rex's reply came back garbled. · Try again` |
| Stopped | `Stopped. · Try again` (neutral) |
| App connection lost | `Lost the connection to the app. · Try again` |

- **Offline on open** (C11): `Rex can't reach Claude right now. Your text
  stays here. [Check again] How to fix ▸`. Typing allowed, Send disabled.
  Past talks and Where from still work (local).
- **A cited file is missing** (moved, drive gone): the passage panel shows
  the saved passage anyway (it was stored at study time) with a 13 px line
  `The file isn't where it was. This is the passage Rex studied.`

## Accessibility (block D)
- Message list `role="log"`, `aria-live="polite"`; a streamed answer is
  announced once complete, with its Where from line.
- `Not Rex` is a real button in each message's tab order (one stop per
  agent message); accessible name `Not Rex: fix this answer`.
- Where from sources are links named `Source: Day 2 – Hard Calls.mp4 at
  14:20`. The underline in C7 is also `<mark>` so it's read as highlighted.
- Blank line has a hidden prefix "Only you see this:".
- Dividers are `role="separator"` with their text as label; the redrawn
  one is a button with `aria-expanded`.
- First words: the fill-in is decorative; the line is announced normally.
- Keys: ⌘N new talk · ⌘F search · Esc closes a panel · ⌘1/⌘2 modes.

## Mock data (block D)
- **Rex talks (14):** `Landlord call` (today) · `The job offer`
  (yesterday) · `Saying no to Dad` (Mon) · `The 6 am thing` (18 Nov) ·
  `Team meeting on Monday` (14 Nov) · `Why I stall on emails` (11 Nov) ·
  `Asking for the raise` (7 Nov) · `Gym at 6 or not at all` (4 Nov) ·
  `The apology I owe Sam` (1 Nov) · `Too many yeses` (30 Oct) · `First
  hire` (29 Oct) · `Ten-minute promise` (28 Oct) · `Morning phone` (27 Oct)
  · `First words` (25 Oct, with the mark `First words · 25 Oct`). Each with
  4–12 messages, searchable (`Friday` in `The job offer`, `landlord` in
  `Landlord call`).
- **Scripted questions** (the 4 kinds + continued), with streamed text,
  sources (`SourceRef` with passage and span) as in D1, and the planted
  wrong answer flagged.
- **Fix:** opening Sketcher line (fixed), scripted user example for the
  demo only if the real Sketcher is off; the persona patch sentence; the
  divider detail.
- **Marcus:** 3 talks (`Firing my cofounder` 12 Nov, `Board pressure`,
  `When to say nothing`), answers all own view; a Blank answer isn't
  needed (no map).
- **Edie:** 2 talks; one sourced answer (`Style rules.md · Cutting`), one
  Blank (`Fiction`: `I don't edit fiction. I'd only make it worse. Send me
  the newsletter.`).
- **Juno:** no talks; First words only.
- First-words lines (D2) and dates.

## Kept plain (no magic, checked)
No greeting after First words · no typing theatrics or "let me look"
narration · no source on an opinion; own view says so · no auto "sounds
off" detection · daily Talk has no motion except the 150 ms Where from
fade · errors are plain words with one action · deleting a talk is one
plain sheet.

## Journey trace
UJ5 · 1 → A1 · 2 → D1 (D2 the first time) · 3 → D1 Where from → D3 · 4 →
D1 Blank answer + Blank line. UJ6 · 1 → D4 (and A1 `Last:`) · 2 → D4
search · 3 → D1.4. UJ7 · 1 → D1 planted answer + `Not Rex` · 2 → D5 pinned
strip · 3 → D5 reply + `from your talk` · 4 → D5 close → divider + prefill
→ D1 corrected answer. UJ12 · 2 (talks) → D4 row menu.
