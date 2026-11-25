# FULL-UX: the blocks A–F, the shared frame and the shared components

*Jony, UI Design. 2026-11-25. For Eraser (cut review), Columbo (captain) and
the build team. Built on `journeys-columbo.md`, `magic-merlin.md`,
`update v1.md`, `principles/magic-ux/` and the shipped P2 design
(`updates/2026-11-24 AGENT-CREATOR - OPEN/design-jony.md`, "P2" below).*

Read this file first. It holds what every block shares: the frame, the
components, the data shapes, the demo agent set and the coverage tables.
Each block file (`design-jony-block-A.md` … `-F.md`) then designs its screens
and states, and only points back here for shared parts.

## 1. The whole app in one sentence per job

- **Make:** "I bring one line or a folder; the Sketcher draws them; I say
  when it's them." (Blocks B, E)
- **Know:** "Show me what it really knows and where it's weak." (Block C)
- **Talk:** "Pick who'd know, ask, see where it came from, fix a wrong line."
  (Blocks A, D)
- **Share:** "Take it to my other apps, or bring one in." (Block F)

After the first Keep, **Talk is the shortest path in the app**: open → face
→ type. Everything else is one level away and never in Talk's way.

## 2. The blocks, written as features

Each journey lands in exactly one block. A block can *use* a moment that
another block owns; it never redesigns it.

### Block A · Home and first run
- **User job:** "Open the app and be one click from the agent I need, or
  from making my first one."
- **Journeys:** UJ1 First run · UJ12 Manage the library.
- **Magic moments owned:** 12 Who'd know (faces with Sharp lines), the
  library side of 10 (`Last: [topic] · [when]`), the library side of ★3
  (the Studying / Ready card) and ★5 (`new here`). UJ1's second door
  ("Or bring their references").
- **Screens:** A1 Home (the agent grid), A2 First run (P2 S1 plus the
  second door), A3 Delete an agent, A4 App opening rules, A5 CLI missing.

### Block B · Make
- **User job:** "Turn one line or a whole folder into someone who's really
  them, and keep it."
- **Journeys:** UJ2 Make from material · UJ3 Make from one line.
- **Magic moments owned:** 6 Laying out references, ★3 Studying (first
  impressions, Palette filling, Finished), the Keep card side of ★4, the
  first-face side of 11 (three icon sketches), ★1 inside voice cards.
- **Screens:** B1 Bringing references, B2 Laid out (inventory and two
  piles), B3 Studying, B4 Finished studying (B3 and B4 are one Study block,
  C9), B5 Generated Sketch, B6 Keep with the capability lines, B7 One-line
  Keep (no references).

### Block C · Know
- **User job:** "See how good it is, why, and what to add next, in one
  place."
- **Journeys:** UJ4 Check how good it is.
- **Magic moments owned:** ★4 What [Name] knows (the full map and its
  arrival). Likeness and study scores, **plain on purpose** (no magic).
- **Screens:** C1 What [Name] knows (map, Likeness, References), C2 Why
  this line (references behind a map line), C3 Empty (no references yet),
  C4 While studying.

### Block D · Talk
- **User job:** "Ask the one who'd know, trust where the answer came from,
  pick up where we left off, and fix a wrong line in one step."
- **Journeys:** UJ5 Ask · UJ6 Pick up an earlier talk · UJ7 Fix a wrong
  note.
- **Magic moments owned:** ★1 Where from, ★2 Not [Name], ★5 First words,
  8 An honest Blank, 10 Where we left off.
- **Screens:** D1 Talk, D2 First words, D3 Where from (passage panel), D4
  Past talks (list and search), D5 Not [Name] (fix panel), D6 Errors.

### Block E · Grow
- **User job:** "Make an agent I already have better: teach it more, take
  out what hurts, and give it its real face and character."
- **Journeys:** UJ8 Add more material · UJ9 Make it a character.
- **Magic moments owned:** 7 The map moves (`was Blank`, the quiz
  invitation, removal), 9 The Palette (full view), 11 Their face,
  everywhere.
- **Screens:** E1 Add a reference (short batch), E2 The map moves, E3
  Remove a reference, E4 Face, E5 Palette.

### Block F · Share
- **User job:** "Take this agent to my other apps exactly as it is, or
  bring one in, and know what travels."
- **Journeys:** UJ10 Export · UJ11 Import.
- **Magic moments owned:** 13 Packed for travel (`Stays here`), and the
  imported agent's first open (★5, designed in D2).
- **Screens:** F1 Export, F2 Import (valid, name clash, broken), F3 The
  imported agent before first open.

**Settings:** deleted. Nothing in the journeys needs one. Claude's status
shows only when it's bad (P2 banner), motion follows macOS "Reduce motion",
light/dark follows macOS. The prototype's demo switches live in the demo
panel (§5 C14), not in a settings screen.

## 3. Coverage tables

### 3.1 Journeys → blocks → screens (every step)

Updated after the cut review (`cuts-jony-reply.md`). Every step has
**exactly one screen** that serves it. "Also" lists places that only show
the same thing or lead to it; none of them is a second way to do the step.

| Journey · step | Block | The one screen | Also (shows it, or leads there) |
|---|---|---|---|
| UJ1 · 1 open first time | A | A4 opening rules (0 agents → A2) | — |
| UJ1 · 2 CLI found / missing | A | A5 (P2 offline banner on A2) | — |
| UJ1 · 3 one line or folder | A | A2 (chips, the references door) | → B1 |
| UJ2 · 1 bring folder/files/path | B | B1 (drop, picker, path in composer) | — |
| UJ2 · 2 inventory | B | B2 stacks + Set aside | — |
| UJ2 · 3 split, corrected in one sentence | B | B2 correction + change line | — |
| UJ2 · 4 learning starts, estimate | B | B3 Study block (Studying line, time line) | C9 line in the top bar |
| UJ2 · 5 something early | B | B3 First impressions | C4 (same map lines) |
| UJ2 · 6 back to "done" | B | B4 Study block, finished (summary, no button) | notification and A1 `Ready` lead there |
| UJ2 · 7 full map, ask about a gap | C | C1 (arrival on first view after the batch) | Sketcher chat beside it (B5 placeholder) |
| UJ2 · 8 shape persona, voice card quotes | B | B5 (P2 S4–S7 + Where from in the card) | — |
| UJ2 · 9 icon, accept or redo | E | E4 Face sheet (from the B5 face slot) | — |
| UJ2 · 10 Keep + short card | B | B6 | — |
| UJ3 · 1 one line | B | P2 S1–S7 unchanged | — |
| UJ3 · 2 Keep, "no material" card | B | B7 | C3 (same words in the view) |
| UJ3 · 3 add a few files later | E | E1.2 (4-file one-pile batch) | E2 before/after |
| UJ4 · 1 open the insight | C | C1 (`What [Name] knows`) | B6 box, C9 line lead there |
| UJ4 · 2 Likeness, why | C | C1 Likeness section | — |
| UJ4 · 3 study scores per file | C | C1 References (one list, hard files first) | — |
| UJ4 · 4 gap → what to add | C | C1 Blank row `Add a reference for this` | → E1 |
| UJ5 · 1 library, pick by face | A | A1 cards (face, Sharp lines) | — |
| UJ5 · 2 ask, words in seconds | D | D1 | D2 the very first time |
| UJ5 · 3 check a source | D | D3 passage panel (from the D1 Where from line) | — |
| UJ5 · 4 outside its training | D | D1 Blank answer + Blank line | — |
| UJ6 · 1 past talks with titles | D | D4 list | A1 `Last:` (the latest one only) |
| UJ6 · 2 search a word | D | D4 search | — |
| UJ6 · 3 continue, it remembers | D | D1.4 continued talk | — |
| UJ7 · 1 a wrong line | D | D1 planted answer, `Not [Name]` shown on the latest answer | — |
| UJ7 · 2 say it, line carried | D | D5 pinned strip | — |
| UJ7 · 3 Sketcher proposes, fresh lines | D | D5 reply + change line `from your talk` | — |
| UJ7 · 4 next answer sounds right | D | D1 redrawn divider + prefilled question | — |
| UJ8 · 1 add a new book | E | E1 (from a Blank row, drop or ＋) | — |
| UJ8 · 2 short run | E | E1 short Study block | C9 line in the top bar |
| UJ8 · 3 what changed | E | E2 (`was Blank`, Likeness `was 8`), on first view after the batch | — |
| UJ8 · 4 quiz on the new book | E | E2 quiz invitation | → D1 sourced answer |
| UJ8 · 5 remove a source | E | E3 (Remove, then Undo) | — |
| UJ9 · 1 real photo | E | E4 (from the face slot) | crossfade everywhere |
| UJ9 · 2 the Palette | E | E5 | — |
| UJ9 · 3 adjust a trait | E | E5 trait scales → Sketcher turn | — |
| UJ10 · 1 export, what's in it | F | F1 (one sheet, list + where it goes) | — |
| UJ10 · 2 open elsewhere | F | F1.3 done state (the rest is outside the prototype) | — |
| UJ11 · 1 drop a file (valid / broken) | F | F2 | — |
| UJ11 · 2 see contents, name clash | F | F2 (F2.1 list, F2.2 clash) | → A1 `new here` (F3) → D2 |
| UJ12 · 1 6+ agents, mixed states | A | A1 groups and card states | — |
| UJ12 · 2 rename, delete agent or talk | A | A3 delete agent | rename: Name field in the Sketch (P2); talk: D4 row menu |
| UJ12 · 3 start a new one | A | A1 `New agent` card (⌘⇧N) | → A2 |

### 3.2 Magic moments → where they happen

| Moment (Merlin) | MUST | Home block · screen | Also shown in |
|---|---|---|---|
| ★1 Where from | ✓ | D · D1 source line, D3 panel | B5 voice card, C2 (same panel), E2 quiz answer |
| ★2 Not [Name] | ✓ | D · D1 action (shown on the latest answer), D5 panel, D1 divider | Sketcher chat `From your talk` divider (D5) |
| ★3 Studying | ✓ | B · B3/B4 Study block (C9) | A1 card, top bar line, C4, E1 short run |
| ★4 What [Name] knows | ✓ | C · C1 arrival (first view after a batch, no button) | B6 Keep card, B7, A1 card lines, D1 Blank line |
| ★5 First words | ✓ | D · D2 (fill-in and words start together) | A1 `new here`, F3 |
| 6 Laying out references | | B · B2 | E1 (one-pile batch skips the piles) |
| 7 The map moves | | E · E2, E3 (with Undo) | — |
| 8 An honest Blank | | D · D1 | — |
| 9 The Palette | | E · E5 | B3 (filling, stand-in strip) |
| 10 Where we left off | | D · D1, D4 | A1 `Last:` line |
| 11 Their face, everywhere | | E · E4 (opened only from the face slot) | B5 face slot |
| 12 Who'd know | | A · A1 | — |
| 13 Packed for travel | | F · F1, F2 | — |

**The no-magic list** (Merlin §5) holds in every block. Each block file
ends with its own "kept plain" lines so Eraser can check them in place.

## 4. The frame (layout grammar, extended from P2)

P2's grammar is: **a conversation on the left, the thing it's about on the
right, on a slightly raised surface.** The whole app keeps it. There are
only two conversations in the app, so there are only two agent modes:

The mode is named after **who is in the left pane** (X1), so the word
"Sketch" names only the right-pane view:

| Mode | Left pane (conversation) | Right pane (the thing) |
|---|---|---|
| **Sketcher** (Make, Know, Grow) | the Sketcher chat (P2, real) | `Sketch` or `What [Name] knows` (or the Palette) |
| **Talk** | the agent's talk | `Past talks`, or `Where from`, or the Sketcher for a `Not [Name]` fix |

Anything that **changes** the agent happens with the Sketcher in the room.
Anything that **uses** the agent happens in Talk. That one rule answers
"where do I go to…?" for every journey.

### 4.1 Window (wide, ≥ 860 px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Agent Creator › (R) Rex ▾     Studying · about 2 min left [Talk|Sketcher]│ top bar 52
├─────────────────────────────────────┬────────────────────────────────────┤
│                                     │ (right pane header, 52)            │
│  conversation                       │                                    │
│  (messages column max 680, centred) │  the thing (44%, min 380, max 560) │
│                                     │  raised surface, 3% tint           │
│ ┌─────────────────────────────────┐ │                                    │
│ │ composer                     (↑)│ │                                    │
│ └─────────────────────────────────┘ │                                    │
└─────────────────────────────────────┴────────────────────────────────────┘
```

All P2 measures hold: three type sizes (17 / 15 / 13), 8 px grid, one
accent `#2d6cdf`, the warm mark colour, the error colour, `system-ui`,
`color-scheme: light dark`, each pane scrolls on its own.

### 4.2 Top bar (C1)

- **Left:** `Agent Creator` (17 px semibold). On home it's plain text. Inside
  an agent it's a link back home, followed by `›` and the **agent button**:
  face (24 px) + name + ▾. ⌘↑ also goes home, and Home always shows
  (§4.4).
- **Agent menu** (the P2 switcher button, new menu; see flag F3):
  ```
  Palette
  Export Rex…
  ─────────────
  Delete Rex…
  ```
  Palette is hidden until the agent has a name. The face is changed only
  from the face slot in the Sketch (E4, X26).
- **Middle-right:** the **Studying line** (C9) when this agent is studying,
  or just finished. It's a button → opens `What [Name] knows`.
- **Right:** the **mode switch** `[ Talk | Sketcher ]` (P2's segmented
  control, 32 px high, padded to 44 px). Hidden until the agent's first
  Keep: a sketch has only the Sketcher mode, exactly like P2. ⌘1 Talk, ⌘2
  Sketcher.
- **Far right, prototype only:** the `Demo` pill (C14).

**Keyboard (one shortcut per action, the same in every mode, X2):**
⌘N `New talk` (greyed out in the menu bar outside Talk) · ⌘⇧N `New agent`
(everywhere, opens A2) · ⌘1 / ⌘2 modes · ⌘↑ Home · ⌘F `Search past talks`
(Talk) · ⌘E `Export [Name]…` · ⌘⇧I `Import…` · Esc closes a panel or
sheet. File menu items name their target: `Delete Rex Hart…` (X33).

### 4.3 Narrow (< 860 px)

P2 §7, one rule for both modes: one pane at a time, chosen by **one**
switch under the top bar (X3): `[ Chat | Sketch | What [Name] knows ]` in
Sketcher mode (it replaces the inner pane switch; there is no second
switch), `[ Chat | Past talks ]` in Talk mode. "Chat" is the conversation
pane in both modes. A right-pane panel that opens from the conversation
(Where from, the Not [Name] fix) opens as the full view, with `✕` (and Esc)
back to the conversation. The mode switch stays in the top bar. The P2
update dot (•) rule holds for every right-pane view.

### 4.4 Where the app opens (A4, flag OQ6, X8)
**At launch only:**
- 0 agents → A2 First run.
- exactly 1 agent → that agent, **exactly like a card click** on Home: if
  ever kept, Talk with a **new talk** and Past talks on the right; else
  the Sketcher mode (P2 S9 `Back to [Name].`).
- 2+ agents → A1 Home.

**Going Home on purpose** (the title link, ⌘↑, after a delete or an
import) always shows A1 Home, with any number of agents, and Home always
has the `New agent` card. There is no dead end.

Inside an agent, the mode opens where the user last was for that agent;
the first time, Talk if ever kept, else Sketcher.

## 5. Shared components (defined once, reused everywhere)

Each block names these by id. P2 components keep their P2 spec; only the
additions are written here.

| Id | Component | Spec |
|---|---|---|
| **C1** | Top bar | §4.2. |
| **C2** | Two-pane frame | §4.1 / §4.3. The right pane has a 52 px header with a title (17 px) or a segmented switch, and at most one action on its right. Panels opened *from* the conversation (Where from, fix) get `✕` (Esc) on the right; it returns to the pane's default view. |
| **C3** | Composer | P2 composer. New: the **references button** (＋, 44 × 44, `aria-label="Add references"`) in the reserved P2 `composer-lead` spot, Sketcher composer only. Opens the macOS open panel (folders and files, multiple). Hidden while the A2 references door is on screen (one visible way in, X7). The Talk composer has no ＋: references go through the Sketcher (§4). Placeholders: see each block. |
| **C4** | Message list | P2 list (`role="log"`): user bubble, sender label, change line, voice card, pasted-note chip, error line, `Back to [Name].` New parts below, each specced once in its home block: **references chip** (user side, B1), **source line** (D1; one component, two variants: `Where from · …` with links, or `[Name]'s own view · no reference` as plain text; same slot, style and timing, X34), **Blank line** (D1), **`Not [Name]` action** (D1), **divider** (D1: `[Name] was redrawn · persona updated`, `First words · 25 Nov`; D5: `From your talk · "…"` in the Sketcher chat). Agent messages use the P2 Sketcher style (no bubble, 13 px sender label) with the agent's 24 px face before the label. |
| **C5** | Face | A circle in 4 sizes: 24 (labels, top bar), 48 (Sketch name row, sheets), 72 (home cards), 96 (Face sheet). Kinds: **letter** (P2: first letter on a 8% tint), **outline** (1.5 px ring, no fill: every *Sketch*, never kept), **icon** (one of the 3 AI sketches), **photo** (circle crop, centred). One motion: **fill-in** (outline → filled, 600 ms, once per agent, D2). Face change = 300 ms crossfade in every visible place at once (E4). `alt` = the name. |
| **C6** | Map line | One row: **level word** (`Sharp` / `Rough` / `Blank`, 13 px semibold, words not colours), the line text (15 px, in the person's own terms), then on the right `5 references ▸` (13 px, a button). Blank rows end in the action `Add a reference for this` instead. Marks: `first impressions` (row text at 60%, B3), `was Blank` / `was Sharp · now Rough · after removing "…"` (13 px, E2/E3). Arrival motion: groups fade in Sharp → Rough → Blank, 80 ms apart, once per batch (C1). |
| **C7** | Passage panel | Right-pane panel. Header: file name as the title (17 px, the user's own name), `✕`. Then location (13 px: `p. 88`, `14:20`, or a heading), then the passage (15 px, 3–6 sentences, line height 1.6), the exact words used **underlined** (2 px accent, drawn left to right, 300 ms; instant with reduced motion). Below: `Used in this answer` or `Behind: [map line]` (13 px). No pager (X18): with the panel open, clicking another source (in the Where from line or the C2 list) swaps the passage in place. Used by D3 and C2. |
| **C8** | Behind-the-canvas surface | The surface for anything only the user sees (map, Likeness, study scores, the Keep card's map lines, the Blank line in Talk): inset 0 / 3% darker than the pane, a dashed 1 px top border, and the line `Only you see this. [Name] doesn't.` (13 px, 60%) at the top of each block of it. Never used for anything the agent sees. |
| **C9** | Studying line + Study block | **Line**, 13 px: `Studying · about 25 min left` (top bar, home card). **Study block** (one component for B3 and B4, X34), on the C8 surface at the top of `What [Name] knows`: the long line `Studying · Day 3 – Session 2.mp4 (listening) · 251 of 297`, the time line (with `Stop`), and, when finished, the summary `Finished studying · 296 references studied · 15 set aside ▸` (no button). States: studying · `Picked up where it left off` (first 10 s after reopening) · `Studying paused · [reason]` (error colour, with its one action) · `Stopped · 251 of 297 studied · Study the rest` · finished (full summary until the first visit, then one line) → `Ready` (home card only, until opened). One `aria-live="polite"`, announced every ~25 files, on stage change and on finish. |
| **C10** | Sheet | macOS-style sheet from the top of the window, 480 px wide, radius 12, 24 px padding, title 17 px, one primary button (accent, filled) on the right, `Cancel` left of it, Esc cancels. Used by: delete (A3, D4), Face (E4), Export (F1), Import (F2). |
| **C11** | Offline banner | P2 S10, unchanged. New text in Talk: `[Name] can't reach Claude right now.` Same buttons. |
| **C12** | Reference row | One file or group row: kind glyph (doc / audio / video / other), the user's file or folder name (15 px), count and size (13 px), the reason for Set aside (13 px; it says what happened, e.g. `damaged: no sound track found`, X14), study ease (13 px: `Easy to study` or `Hard to study · [one reason]`), and on hover/focus one action `Remove` (E3). Groups expand ▸ to their files. |
| **C13** | Palette strip | Stand-in look (P11 open): a 12 px high rounded band of named colour segments, sized by how much each reference group or trait adds. Each segment: name on hover/focus (`Live Q&A · 18 recordings · how Rex sounds`), and a visually hidden list for screen readers. Small form in B3, full view in E5. Label `stand-in look` (13 px) until P11's look is chosen. |
| **C14** | Demo pill + panel *(prototype only)* | A small `Demo` pill at the far right of the top bar. Click → a popover: `Skip time ▸` (jumps the current run to the next milestone: First impressions → Finished), `Claude reachable` on/off (drives health → A5, C11), `Start UJ2 fresh` (resets Ines to before the drop, opens A2 with the demo folder ready to drop), `Show mock values` (outlines every element with `data-mock` in a dotted line), `Reset demo`. Never part of the real app. Every mock-fed element carries `data-mock="kind"`. |
| **C15** | Drop overlay | Whole window, 6% accent tint, 2 px dashed accent inset 16 px, text centred, settles down 8 px / 200 ms on drop (B1). **Two texts only, one per drop kind (X5):** References: `Drop · your files stay on this Mac` / `Claude reads them to study` (13 px), plus one 13 px context line only where the target isn't obvious: `for a new agent` (Home) or `adds to Rex Hart` (inside an agent, Talk or Sketcher). A2 First run has no context line (the door says it). The privacy line is on **every** reference drop. Import (a `.agent.zip`): `Drop · import this agent`, everywhere. |

**Motion rules (whole app):** P2 §8 plus Merlin §8. Nothing moves before or
during an agent's first words. Once-only moments are remembered per agent.
Reduced motion makes every fade, slide, underline, fill-in and bloom
instant; words and marks stay.

**Focus rules (whole app):** focus never moves on its own. It moves only
when the user asked: `Not [Name]` → the fix composer; `✕`/Esc → back where
they were; a quiz invitation → the Talk composer (text typed, not sent).

## 6. Data shapes for the mock layer (Phase 4)

One agent fixture holds everything a screen needs. The P2 draft stays
exactly `{ name, persona, instructions, status }`. **Nothing below ever goes
into the draft or the agent file except where F1 says so.**

```js
Agent = {
  id, draft: { name, persona, instructions, status: 'draft'|'saved' },
  keptAt: ISOdate | null,            // ever kept? drives home groups and hides Keep (F8, X4)
  face: { kind: 'letter'|'icon'|'photo', src, iconOptions: [src, src, src] },
                                     // the current face is always iconOptions' first choice (X28)
  firstWords: { line: string, at: ISOdate | null },   // null = not spoken yet
  openedAt: ISOdate | null,          // null + imported = "new here"
  importedFrom: string | null,       // file name; data only, not shown (X32)
  references: {
    root: string,                    // the user's folder name or path
    files: [ReferenceFile],
    batches: [{ id, addedAt, fileIds }]
  },
  study: Study | null,
  map: [MapLine],                    // user-only (C8). Never in draft or export.
  mapBefore: [MapLine] | null,       // for E2/E3 marks
  likeness: { reasons: [{ good: bool, text, ref? }], example: { text, ref }, rating: 1..10 } | null,
  traits: [{ id, label, value: 1..5, sketchLine: { [value]: string } }],
  palette: [{ id, label, detail, colour, share }],
  talks: [Talk]
}
ReferenceFile = { id, path, name, folder, kind: 'doc'|'audio'|'video'|'other',
  size, pile: 'knows'|'sounds'|'aside', reason?: string,   // one Set aside pile, the reason says why (X14)
  ease?: 'easy'|'hard', easeReason?: string,
  removedAt?: ISOdate }              // study kept until the visit ends, so Undo re-studies nothing (X25)
Study = { state: 'laidOut'|'studying'|'paused'|'stopped'|'finished',
  stage: 'reading'|'listening'|'studying', current: fileId, done, total,
  etaMin, resumed: bool, pausedReason?, impressionsAt?: count,
  firstImpressions: { draft: {name, persona}, map: [MapLine] } }
MapLine = { id, level: 'sharp'|'rough'|'blank', text, refs: [SourceRef],
  was?: 'sharp'|'rough'|'blank', wasReason?: string }
SourceRef = { fileId, location: 'p. 88' | '14:20' | 'heading', passage, span: [start, end] }
Talk = { id, title, updatedAt, sessionId?, messages: [Message] }
Message = { role: 'user'|'agent'|'divider', text,
  sources?: [SourceRef], ownView?: bool, blankLineId?: string,
  planted?: 'wrongNote', divider?: { kind: 'redrawn'|'firstWords', detail } }
```

**The hard rule (Merlin §9):** every `SourceRef.passage` must contain the
claim it backs, and `span` must cover the words the answer used. Sharp
lines have a good sourced answer in `talks`; Blank lines have the honest
"not my lane" answer. A unit test checks both (Phase 4).

## 7. The demo agent set (invented people only)

Columbo §7, with names. No real living person; the repo's Tony Robbins
instance stays a reference only.

| Agent | Who | State | Face | Material | Journeys |
|---|---|---|---|---|---|
| **Rex Hart** | tough-love coach | Kept 25 Oct, 14 past talks, has spoken First words | photo (an illustrated portrait, not a real person's photo) | `Rex Hart – Breakthrough Weekend/`, 186 references | UJ4–UJ8, UJ9 · 2–3, UJ10 |
| **Marcus** | stoic mentor for founders | Kept, from one line, no references | AI icon | none | UJ3, UJ5 |
| **Edie** | blunt newsletter editor | Kept, 4 files, 1 hard to study | AI icon | `Edie files/`, 4 files | UJ4, UJ9 · 1 (icon → photo) |
| **Ines Duarte** | calm negotiation coach | Sketch, Studying stage 2 of 3, first impressions, resumed after closing | outline | `Ines Duarte – The Quiet Deal/`, 312 files | UJ2 · 4–6 |
| *Untitled sketch* | (persona only: "A patient piano teacher…") | Sketch, never kept, no name | outline, empty | none | UJ12 |
| **Juno** | plain-language contract reader | Imported from `Juno.agent.zip`, never opened | AI icon | packed knowledge | UJ11 |

The per-block files list the exact mock content each screen needs. The
312-file Ines folder is specced once in B (B2 mock data).

## 8. Flags: choices that touch an open question, with my assumption

| # | Touches | Choice and assumption | Check |
|---|---|---|---|
| **OQ1** | Correction in chat | **Decided by design:** `Not [Name]` is the only way chat changes the agent, and it changes it for every future talk. A normal message ("be blunter") never does. The divider shows it happened. | Phase 7: does anyone expect "be blunter" to stick? |
| **OQ2** | Persona rating | **Likeness** = 2–3 reasons with references, one example line, then `8 of 10` last, small, no colour, no motion. It describes *the Sketch*, never the person. | Phase 7: ask a self-cloner how it reads. |
| **OQ3** | Versions | None. A redrawn divider shows what changed; reversing is "put it back" to the Sketcher (P2 J3). No "how he was last week". | Phase 7: after 3 fixes, can the user undo one by chat? |
| **OQ4** | Map in export | Out. Export shows `Stays here: What [Name] knows (only you see it)`. On import, the app draws a fresh map by studying the packed knowledge (short run). | — |
| **OQ5** | Several agents in one talk | Not designed, no reserved spot (no dead UI). One agent per talk. | Orchestrator: propose or decline. |
| **OQ6** | Where the app opens | Home when 2+ agents; straight into the only agent otherwise (§4.4). The home card's `Last:` line makes continuing one click. | Phase 7: time open → first word typed. |
| **OQ7** | Real photos in exports | The face travels in the export by default; the export sheet lists it. No option. Real-person clones stay an orchestrator question. | Orchestrator. |
| **F1** | Privacy promise | Merlin's drop line `it stays on this Mac` is **not fully true**: Claude reads the text to study it. I use `Drop · your files stay on this Mac · Claude reads them to study`. **Applied** by Columbo in `magic-merlin.md` §4 (moment 6) and §6. | Done. |
| **F2** | Talk for new real agents | Talk is mock. An agent made for real in P2 has no talk fixtures, so UJ3 → UJ5 would dead-end. Assumption: Talk for non-fixture agents answers with one marked demo line (`data-mock`). **Recommend** wiring P8 minimally for real (persona as system prompt, no RAG); needs the orchestrator because it adds a route. | Orchestrator / Columbo. |
| **F3** | P2 switcher | Home now does the switcher's job (picking among 3–10 agents, behavior #2). The P2 switcher *button* stays in place as the agent button; its *menu* becomes the agent's menu. `+ New agent` moves to Home. This is a deliberate change to the P2 top bar. | Eraser. |
| **F4** | Starting the study | `Start studying` is a button, and the Sketcher never starts it from chat (like Keep, P2 R2). Exception: a batch that lands in one pile with nothing set aside starts at once. | Phase 7. |
| **F5** | Talk before Keep | Talk appears after the first Keep. A sketch is tried with voice cards (P2). | — |
| **F6** | What export packs | Packs the built knowledge (`from 297 references · 1.2 GB`), not the raw files. P6 to confirm. | P6 owner. |
| **F7** | Scripted Sketcher | While references are laid out, and for the map questions, the Sketcher's replies are scripted mock (the real Sketcher doesn't know references yet). Marked `data-mock`. | Build team. |
| **F8** | Status after a fix | **Changed by the cut review (X4):** Keep is a one-time act (sketch → agent, sets `keptAt`). Once `keptAt` is set, Keep is **hidden** in the Sketch for good; every later change (a `Not [Name]` fix, a trait, knowledge, a face) is live and saved at once, and the change line (and in Talk the redrawn divider) says so. `status` is left as P2 sets it; the UI reads `keptAt`. Home groups by `keptAt` too. The way back is "put it back" to the Sketcher (OQ3). | Build team: confirm hiding Keep on `keptAt` needs no P2 status change. |

## 9. New on-screen words (to add to Merlin's §6 table)

Merlin's table stays the single list; these are now added under it
(`magic-merlin.md` §6). New, all plain:
`Start studying` · `Picked up where it left off` · `Studying paused` ·
`Stop` · `Stopped` · `Study the rest` · `New talk` · `Search past talks` ·
`Draw three more` · `Use a photo…` · `Delete [Name]…` · `Keep both` ·
`Replace [Name]` · `New agent` (home card; P2 already had `+ New agent`) ·
`Export [Name]…` · `Export` · `Change…` · `Import…` · `Packed` ·
`Show in Finder` · `Remove` · `Undo` · `[Name]'s own view · no reference` ·
`Ask [Name] about it` · divider `From your talk · "[question]"` · context
lines `for a new agent` / `adds to [Name]` (drop overlay).
The mode switch reads `[ Talk | Sketcher ]`: **Sketcher** is already in
§6 (X1).
No word for the home screen itself: it's just "Agent Creator".

**Removed by the cut review** (to be taken out of §6 too): `Couldn't be
read` (merged into **Set aside**, X14) · `Imported from [file]` (X32) ·
`Change face…` (X26) · `Add more on this` (never listed; cut, X24) ·
`See what [Name] knows` (X10; it was never in §6).

## 10. What I removed across the whole app, and why

| Removed | Why |
|---|---|
| A settings screen | No journey needs it (§2). |
| A separate "Know" or "Insight" mode | "How good is it?" sits beside the Sketcher, who can answer questions about it (behavior #12). One more mode would split Make. |
| A "Library" word, tab or sidebar | Home is just the app's first screen; the title takes you there. |
| A sidebar of agents inside Talk | Home + ⌘↑ does it; Talk's right pane holds Past talks, the thing people actually go back to. |
| A references button in Talk | References always go through the Sketcher, so there's one place that changes the agent. |
| Card context menus on Home | A second set of the agent menu. Open the agent; its menu is one click away. |
| Rename as a menu item | The Name field in the Sketch is the one way (P2). |
| A "Start" confirmation on every small batch | One-pile batches start at once (F4). |
| Versions, and undo of agent changes | OQ3; the Sketcher does it by chat. (The one Undo in the app is on removing a reference, E3, where the way back would otherwise cost study time.) |
| Keep after the first Keep | X4: autosave already does it. Keep happens once. |
| Buttons that open a view you're in, or only play an animation | X10: the map arrives on its own the first time the view is visible after a batch. |
| `Change face…` in the agent menu | X26: the face slot in the Sketch is the one door. |
| Confirm sheets for reversible acts (Stop studying, Remove a group) | X12, X25: the line that follows is the undo. |
| Any percentage bar | Merlin cut; the file name, count and honest time say more. |
| "Open the file" on a passage | No journey step needs it; the passage is the proof. Reserved for later, not rendered. |
