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
  piles), B3 Studying, B4 Finished studying, B5 Generated Sketch, B6 Keep
  with the capability lines, B7 One-line Keep (no references).

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

| Journey · step | Block | Where it's served |
|---|---|---|
| UJ1 · 1 open first time | A | A4 opening rules (0 agents → A2) |
| UJ1 · 2 CLI found / missing | A | A2 · A5 (P2 offline banner) |
| UJ1 · 3 one line or folder | A | A2 chips + second door → B1 |
| UJ2 · 1 bring folder/files/path | B | B1 (drop, picker, path in composer) |
| UJ2 · 2 inventory | B | B2 stacks + Set aside |
| UJ2 · 3 split, corrected in one sentence | B | B2 piles + change line |
| UJ2 · 4 learning starts, estimate | B | B3 Studying line, stages |
| UJ2 · 5 something early | B | B3 First impressions (Sketch + map) |
| UJ2 · 6 back to "done" | B | B4 Finished card, notification, A1 card "Ready" |
| UJ2 · 7 full map, ask about a gap | B → C | C1 (arrival), Sketcher chat beside it |
| UJ2 · 8 shape persona, voice card quotes | B | B5 (P2 S4–S7 + Where from in the card) |
| UJ2 · 9 icon, accept or redo | B | B5 face slot → E4 sheet |
| UJ2 · 10 Keep + short card | B | B6 |
| UJ3 · 1 one line | B | P2 S1–S7 unchanged |
| UJ3 · 2 Keep, "no material" card | B | B7 |
| UJ3 · 3 add a few files later | B | B7 → E1 (4-file batch), C1 before/after |
| UJ4 · 1 open the insight | C | C1 (tab "What [Name] knows") |
| UJ4 · 2 Likeness, why | C | C1 Likeness section |
| UJ4 · 3 study scores per file | C | C1 References · Easy / Hard to study |
| UJ4 · 4 gap → what to add | C | C1 Blank line "Add a reference for this" → E1 |
| UJ5 · 1 library, pick by face | A | A1 cards (face, Sharp lines) |
| UJ5 · 2 ask, words in seconds | D | D1 (and D2 the first time) |
| UJ5 · 3 check a source | D | D1 Where from line → D3 |
| UJ5 · 4 outside its training | D | D1 Blank answer + user-only line |
| UJ6 · 1 past talks with titles | D | D4 list (also A1 `Last:` line) |
| UJ6 · 2 search a word | D | D4 search |
| UJ6 · 3 continue, it remembers | D | D1 continued talk |
| UJ7 · 1 a wrong line | D | D1 planted answer, `Not [Name]` on hover/focus |
| UJ7 · 2 say it, line carried | D | D5 pinned strip |
| UJ7 · 3 Sketcher proposes, fresh lines | D | D5 reply + change line `from your talk` |
| UJ7 · 4 next answer sounds right | D | D1 redrawn divider + prefilled question |
| UJ8 · 1 add a new book | E | E1 (from a Blank line, drop or ＋) |
| UJ8 · 2 short run | E | E1 short Studying |
| UJ8 · 3 what changed | E | E2 `was Blank`, Likeness before/after |
| UJ8 · 4 quiz on the new book | E → D | E2 quiz invitation → D1 sourced answer |
| UJ8 · 5 remove a source | E | E3 |
| UJ9 · 1 real photo | E | E4 → crossfade everywhere |
| UJ9 · 2 the Palette | E | E5 |
| UJ9 · 3 adjust a trait | E | E5 trait scales → Sketcher turn |
| UJ10 · 1 export, what's in it | F | F1 |
| UJ10 · 2 open elsewhere | F | outside the prototype (F1 done state) |
| UJ11 · 1 drop a file (valid / broken) | F | F2 |
| UJ11 · 2 see contents, name clash | F | F2 + F3, then D2 First words |
| UJ12 · 1 6+ agents, mixed states | A | A1 groups and card states |
| UJ12 · 2 rename, delete agent or talk | A (agent) / D (talk) | Name field in the Sketch · A3 · D4 row menu |
| UJ12 · 3 start a new one | A | A1 "New agent" card → A2 |

### 3.2 Magic moments → where they happen

| Moment (Merlin) | MUST | Home block · screen | Also shown in |
|---|---|---|---|
| ★1 Where from | ✓ | D · D1 line, D3 panel | B5 voice card, C2 (same panel), E2 quiz |
| ★2 Not [Name] | ✓ | D · D1 action, D5 panel, D1 divider | — |
| ★3 Studying | ✓ | B · B3, B4 | A1 card, top bar line, C4, E1 short run |
| ★4 What [Name] knows | ✓ | C · C1 arrival | B6 Keep card, B7, A1 card lines, D1 Blank line |
| ★5 First words | ✓ | D · D2 | A1 `new here`, F3 |
| 6 Laying out references | | B · B2 | E1 (one-pile batch skips the piles) |
| 7 The map moves | | E · E2, E3 | — |
| 8 An honest Blank | | D · D1 | — |
| 9 The Palette | | E · E5 | B3 (filling, stand-in strip) |
| 10 Where we left off | | D · D1, D4 | A1 `Last:` line |
| 11 Their face, everywhere | | E · E4 | B5 face slot |
| 12 Who'd know | | A · A1 | — |
| 13 Packed for travel | | F · F1, F2 | — |

**The no-magic list** (Merlin §5) holds in every block. Each block file
ends with its own "kept plain" lines so Eraser can check them in place.

## 4. The frame (layout grammar, extended from P2)

P2's grammar is: **a conversation on the left, the thing it's about on the
right, on a slightly raised surface.** The whole app keeps it. There are
only two conversations in the app, so there are only two agent modes:

| Mode | Left pane (conversation) | Right pane (the thing) |
|---|---|---|
| **Sketch** (Make, Know, Grow) | the Sketcher chat (P2, real) | `Sketch` or `What [Name] knows` (or the Palette) |
| **Talk** | the agent's talk | `Past talks`, or `Where from`, or the Sketcher for a `Not [Name]` fix |

Anything that **changes** the agent happens with the Sketcher in the room.
Anything that **uses** the agent happens in Talk. That one rule answers
"where do I go to…?" for every journey.

### 4.1 Window (wide, ≥ 860 px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Agent Creator › (R) Rex ▾        Studying · about 2 min left  [Talk|Sketch]│ top bar 52
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
  face (24 px) + name + ▾. ⌘↑ also goes home.
- **Agent menu** (the P2 switcher button, new menu; see flag F3):
  ```
  Change face…
  Palette
  Export Rex…
  ─────────────
  Delete Rex…
  ```
  Palette and Change face are hidden until the agent has a name.
- **Middle-right:** the **Studying line** (C9) when this agent is studying,
  or just finished. It's a button → opens `What [Name] knows`.
- **Right:** the **mode switch** `[ Talk | Sketch ]` (P2's segmented
  control, 32 px high, padded to 44 px). Hidden until the agent's first
  Keep: a sketch has only the Sketch mode, exactly like P2. ⌘1 Talk, ⌘2
  Sketch.
- **Far right, prototype only:** the `Demo` pill (C14).

### 4.3 Narrow (< 860 px)

P2 §7, one rule for both modes: one pane at a time, chosen by P2's
two-part switch under the top bar: `[ Chat | Sketch ]` in Sketch mode
(the Sketch view keeps its own inner `Sketch | What [Name] knows` switch),
`[ Talk | Past talks ]` in Talk mode. A right-pane panel that opens from
the conversation (Where from, the Not [Name] fix) opens as the full view,
with `✕` (and Esc) back to the conversation. The mode switch stays in the
top bar. The P2 update dot (•) rule holds for every right-pane view.

### 4.4 Where the app opens (A4, flag OQ6)
- 0 agents → A2 First run.
- exactly 1 agent → that agent (Talk if ever kept, else Sketch).
- 2+ agents → A1 Home.
Inside an agent, the mode opens where the user last was for that agent;
the first time, Talk if ever kept, else Sketch.

## 5. Shared components (defined once, reused everywhere)

Each block names these by id. P2 components keep their P2 spec; only the
additions are written here.

| Id | Component | Spec |
|---|---|---|
| **C1** | Top bar | §4.2. |
| **C2** | Two-pane frame | §4.1 / §4.3. The right pane has a 52 px header with a title (17 px) or a segmented switch, and at most one action on its right. Panels opened *from* the conversation (Where from, fix) get `✕` (Esc) on the right; it returns to the pane's default view. |
| **C3** | Composer | P2 composer. New: the **references button** (＋, 44 × 44, `aria-label="Add references"`) in the reserved P2 `composer-lead` spot, Sketcher composer only. Opens the macOS open panel (folders and files, multiple). The Talk composer has no ＋: references go through the Sketcher (§4). Placeholders: see each block. |
| **C4** | Message list | P2 list (`role="log"`): user bubble, sender label, change line, voice card, pasted-note chip, error line, `Back to [Name].` New parts below, each specced once in its home block: **references chip** (user side, B1), **Where from line** (D1), **own-view line** (D1), **Blank line** (D1), **`Not [Name]` action** (D1), **divider** (D1: `[Name] was redrawn · persona updated`, `First words · 25 Nov`). Agent messages use the P2 Sketcher style (no bubble, 13 px sender label) with the agent's 24 px face before the label. |
| **C5** | Face | A circle in 4 sizes: 24 (labels, top bar), 48 (Sketch name row, sheets), 72 (home cards), 96 (Face sheet). Kinds: **letter** (P2: first letter on a 8% tint), **outline** (1.5 px ring, no fill: every *Sketch*, never kept), **icon** (one of the 3 AI sketches), **photo** (circle crop, centred). One motion: **fill-in** (outline → filled, 600 ms, once per agent, D2). Face change = 300 ms crossfade in every visible place at once (E4). `alt` = the name. |
| **C6** | Map line | One row: **level word** (`Sharp` / `Rough` / `Blank`, 13 px semibold, words not colours), the line text (15 px, in the person's own terms), then on the right `5 references ▸` (13 px, a button). Blank rows end in the action `Add a reference for this` instead. Marks: `first impressions` (row text at 60%, B3), `was Blank` / `was Sharp · now Rough · after removing "…"` (13 px, E2/E3). Arrival motion: groups fade in Sharp → Rough → Blank, 80 ms apart, once per batch (C1). |
| **C7** | Passage panel | Right-pane panel. Header: file name as the title (17 px, the user's own name), `✕`. Then location (13 px: `p. 88`, `14:20`, or a heading), then the passage (15 px, 3–6 sentences, line height 1.6), the exact words used **underlined** (2 px accent, drawn left to right, 300 ms; instant with reduced motion). Below: `Used in this answer` or `Behind: [map line]` (13 px). If several sources: small `‹ 1 of 3 ›` pager in the header. Used by D3 and C2. |
| **C8** | Behind-the-canvas surface | The surface for anything only the user sees (map, Likeness, study scores, the Keep card's map lines, the Blank line in Talk): inset 0 / 3% darker than the pane, a dashed 1 px top border, and the line `Only you see this. [Name] doesn't.` (13 px, 60%) at the top of each block of it. Never used for anything the agent sees. |
| **C9** | Studying line | One line, 13 px: `Studying · about 25 min left` (top bar, home card) or the long form `Studying · Day 3 – Session 2.mp4 (listening) · 251 of 297` (B3). States: studying · `Picked up where it left off` (first 10 s after reopening) · `Studying paused · [reason]` (error colour, with its one action) · `Finished studying` → `Ready` (home card only, until opened). Announced politely every ~25 files or stage change. |
| **C10** | Sheet | macOS-style sheet from the top of the window, 480 px wide, radius 12, 24 px padding, title 17 px, one primary button (accent, filled) on the right, `Cancel` left of it, Esc cancels. Used by: delete (A3, D4), Face (E4), Export (F1), Import (F2). |
| **C11** | Offline banner | P2 S10, unchanged. New text in Talk: `[Name] can't reach Claude right now.` Same buttons. |
| **C12** | Reference row | One file or group row: kind glyph (doc / audio / video / other), the user's file or folder name (15 px), count and size (13 px), the reason for Set aside / couldn't be read (13 px), study ease (13 px: `Easy to study` or `Hard to study · [one reason]`), and on hover/focus one action `Remove` (E3). Groups expand ▸ to their files. |
| **C13** | Palette strip | Stand-in look (P11 open): a 12 px high rounded band of named colour segments, sized by how much each reference group or trait adds. Each segment: name on hover/focus (`Live Q&A · 18 recordings · how Rex sounds`), and a visually hidden list for screen readers. Small form in B3, full view in E5. Label `stand-in look` (13 px) until P11's look is chosen. |
| **C14** | Demo pill + panel *(prototype only)* | A small `Demo` pill at the far right of the top bar. Click → a popover: `Skip time ▸` (jumps the current run to the next milestone: First impressions → Finished), `Claude reachable` on/off (drives health → A5, C11), `Start UJ2 fresh` (resets Ines to before the drop, opens A2 with the demo folder ready to drop), `Show mock values` (outlines every element with `data-mock` in a dotted line), `Reset demo`. Never part of the real app. Every mock-fed element carries `data-mock="kind"`. |

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
  keptAt: ISOdate | null,            // ever kept? drives home groups (flag F8)
  face: { kind: 'letter'|'icon'|'photo', src, iconOptions: [src, src, src] },
  firstWords: { line: string, at: ISOdate | null },   // null = not spoken yet
  openedAt: ISOdate | null,          // null + imported = "new here"
  importedFrom: string | null,       // file name, F3
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
  size, pile: 'knows'|'sounds'|'aside'|'failed', reason?: string,
  ease?: 'easy'|'hard', easeReason?: string, removedAt?: ISOdate }
Study = { state: 'laidOut'|'studying'|'paused'|'finished',
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
| **F8** | Status after a fix | P2 sets `status: 'draft'` after any change, so Keep shows again in the Sketch. Home groups by `keptAt` instead, so a fixed Rex never drops back to "Sketches". | — |

## 9. New on-screen words (to add to Merlin's §6 table)

Merlin's table stays the single list; these are now added under it
(`magic-merlin.md` §6). New, all plain:
`Start studying` · `Couldn't be read` · `Picked up where it left off` ·
`Studying paused` · `New talk` · `Search past talks` · `Change face…` ·
`Draw three more` · `Use a photo…` · `Delete [Name]…` · `Keep both` ·
`Replace [Name]` · `New agent` (home card; P2 already had `+ New agent`) ·
`Export [Name]…` · `Import…` · `Packed` · `Show in Finder` · `Remove` ·
`[Name]'s own view · no reference` · `Ask [Name] about it` ·
`Imported from [file]`.
No word for the home screen itself: it's just "Agent Creator".

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
| Undo / versions | OQ3; the Sketcher does it by chat. |
| Any percentage bar | Merlin cut; the file name, count and honest time say more. |
| "Open the file" on a passage | No journey step needs it; the passage is the proof. Reserved for later, not rendered. |
