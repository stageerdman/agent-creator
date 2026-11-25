# Block A · Home and first run

*Jony, 2026-11-25. Shared frame, components (C1–C14), data shapes and flags
live in `blocks-jony.md`. Journeys: **UJ1, UJ12** (and the first step of
UJ5, which ends in Block D).*

## User goal

> "I open the app and I'm one click from the agent I need, or from making
> my first one."

**One primary action per screen:**
- A1 Home: **open an agent** (click a face).
- A2 First run: **send the first line** (or drop references; same weight,
  two doors, because the clone-maker has a folder and the role-builder
  doesn't, UJ1 · 3).

## What I removed, and why

| Removed | Why |
|---|---|
| Welcome tour, onboarding cards | UJ1 · 2: "lands straight on making, no tour" (Merlin: no welcome animation). |
| Search and filters on Home | 3–10 agents (A4). Faces and Sharp lines are faster than search. Merlin's "who knows about money?" search is a feature idea, not a must; left for Eraser. |
| Sort menu | One order that matches the job: most recently talked to first. |
| Card buttons (Talk / Edit / ⋯) | The card itself opens Talk; the `Last:` line continues. Everything else is one click inside the agent. |
| Home **at launch** with one agent | No choice to make (D2). At launch the app opens straight into it, exactly like a card click (§4.4). Going Home on purpose always shows Home, so `New agent` is never out of reach (X8). |
| "Ready" label on every kept card | A label on everything is noise. `Ready` shows only right after studying finished, until opened. |
| Two marks on one card | X9: one mark at most; `new here` wins over `Ready`. |
| The composer's ＋ on first run | X7: the references door already opens the same panel. ＋ appears when the door goes. |

## A1 · Home

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Agent Creator                                                     [Demo] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ( photo )        (  M  )         (  E  )          ( J  )               │
│   Rex Hart         Marcus          Edie             Juno       new here  │
│   Ladder of        Hard calls ·    Cutting the      Clauses in           │
│   Excuses · hard   what's in       first para ·     plain words          │
│   conversations    your control    subject lines                         │
│   Last: The job    Last: Firing    Last: Issue                           │
│   offer · yesterday my cofounder ·  #212 · 3 Nov                          │
│                    12 Nov                                                │
│                                                                          │
│   Sketches                                                               │
│   ( ◌ )  Ines Duarte   Studying · about 25 min left                      │
│   ( ◌ )  Untitled sketch · yesterday                                     │
│                                                                          │
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐                                                  │
│     +  New agent                                                         │
│     one line, or drop a folder                                           │
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘                                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Layout
- One column, max 960 px, centred, 32 px top margin. No right pane: Home is
  not a conversation.
- **Agents** (ever kept, or imported): a grid of cards, 200 px wide, 24 px
  gap, sorted by the latest talk (`talks[0].updatedAt`, else `keptAt`).
  No heading: they are the page.
- **Sketches** (never kept): a heading `Sketches` (13 px, semibold, 60%),
  then compact rows (48 px face, name, one status line), newest first. Kept
  agents never mix with sketches (D2 friction).
- **New agent** card: a dashed outline card after the sketches (or after
  the agents if there are no sketches). ⌘⇧N does the same, from anywhere
  (X2). The card is on Home in every case, with any number of agents.

### The agent card (Merlin 12, 10)
- Face 72 px (C5), name (17 px semibold), then the top 1–2 **Sharp** lines
  of its map, shortened to their key words (13 px, 60%), then
  `Last: [talk title] · [when]` (13 px, a separate link).
- **Click the card** (face or name) → the agent in Talk, a **new talk**
  (D1). **Click `Last: …`** → that talk continued (D1, UJ6 · 3). Two doors,
  one per job: a new problem, or the same one.
- No Sharp lines (Marcus, from one line): the first sentence of the persona
  instead, 2 lines max. Never an empty gap.
- No talks yet: no `Last:` line.
- Hover: 1 px border (P2 field hover). Focus: 2 px accent ring. The whole
  card is one button; `Last:` is a second focus stop.
- **Card states** (words, never colour only). **A card shows one mark at
  most** (X9): `new here` wins; `Ready` is only for agents the user made
  and is waiting on.
  | State | Face | Line under the name |
  |---|---|---|
  | kept | photo / icon / letter | Sharp lines, `Last:` |
  | kept, studying a new batch | same | C9 `Studying · about 2 min left` replaces the Sharp lines |
  | kept, just finished studying | same | `Ready` (13 px semibold) until the agent is opened |
  | imported, never opened | icon | `new here` (13 px semibold) on the name row (★5, F3); its import study (C1.6) shows the C9 line while it runs and **never** turns into `Ready` |
- **Sketch rows:** outline face (C5); name or `Untitled sketch`; then
  `Studying · about 25 min left` (C9) if studying, else the time since the
  last change. Click → the agent in Sketcher mode (P2 S9: `Back to [Name].`).

### States
- **A1.1 Normal:** as drawn (demo set).
- **A1.2 Only sketches, no agents yet:** the `Sketches` heading is dropped;
  the rows and the New agent card stay. (At launch, one sketch opens
  straight into it, §4.4; going Home on purpose shows this state with one
  row.)
- **A1.2b One agent, reached on purpose** (title link or ⌘↑ with a single
  agent): one card, then the New agent card. Same layout, nothing special.
- **A1.3 Empty:** never shown. 0 agents → A2.
- **A1.4 Loading:** P2 S0 rule: the layout renders at once with face circles
  as faint outlines; no spinner; `Opening…` (13 px, 60%) after 1 s.
- **A1.5 Drop a folder or files on Home:** the whole window shows the
  reference drop overlay (C15) `Drop · your files stay on this Mac` /
  `Claude reads them to study` with the context line `for a new agent`. On
  drop → a new agent, Sketcher mode, B1. Dropping a `.agent.zip` → Import
  (F2) instead, with the one import text `Drop · import this agent` (X5).
- **A1.6 Studying finished while the app was closed:** the card or row reads
  `Ready`; macOS notification was sent (B4). Nothing else moves.
- **A1.7 Claude not reachable:** Home shows nothing (no banner): Home needs
  no Claude. The banner appears inside an agent (A5).
- **A1.8 Face changed** (E4): the card's face crossfades (300 ms) the next
  time Home shows.

### Mock data (A1)
- The demo set (`blocks-jony.md` §7) with: faces, `keptAt`, 1–2 Sharp lines
  each (Rex `Ladder of Excuses · hard conversations`; Edie `Cutting the
  first paragraph · subject lines`; Juno `Clauses in plain words`; Marcus
  none → persona first sentence "A stoic mentor who helps founders make
  hard calls."), latest talk title and date (Rex `The job offer` ·
  yesterday; Marcus `Firing my cofounder` · 12 Nov; Edie `Issue #212` ·
  3 Nov), Ines's study (`etaMin: 25`), the untitled sketch's `updatedAt`.

## A2 · First run (UJ1)

P2 S1, unchanged, plus **the references door** (Merlin's second door,
UJ1). The Sketch pane is P2's, with the right-pane switch `Sketch | What it
knows` (B, C).

```
Chat pane, vertically centred:

        Who should this agent be? One line is enough.

        [ A tough-love coach like Tony Robbins ]
        [ A blunt editor for my newsletter ]
        [ Me, for answering client emails ]

        ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
          Or bring their references
          Drop a folder or files here, or paste a path
          Your files stay on this Mac · Claude reads them to study
        └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘

  ┌──────────────────────────────────────────┐
  │ Type here…                             (↑)│
  └──────────────────────────────────────────┘
```

- The door is a dashed drop area (same width as the chips column, 88 px
  high, radius 12). Clicking it opens the macOS open panel (folders and
  files). It's also a drop target; the **whole window** is one too (C15
  overlay, no context line: the door already says what it's for).
- Title line 15 px, the two lines below 13 px at 60%.
- **No ＋ while the door is shown** (X7): there is exactly one visible way
  to open the panel. A message that is only a path (`/…` or `~/…`) is
  treated as references (B1), never sent to the Sketcher as text.
- The door and the chips disappear for good once the first message is
  sent or references arrive (P2 chip rule). At that moment C3's ＋ appears
  in the composer (no motion), and from then on it's the one way in.
- **Chip text stays as shipped** in P2. (It names a real person as a style
  hint, which is fine for a one-line prompt; mock *content* uses invented
  people only.)
- No mode switch, no agent button yet: the top bar shows `Agent Creator`
  and, after the first sketch, `› ( ◌ ) [Name] ▾` (outline face).

### States
- **A2.1 Ready (Claude reachable):** as drawn, composer focused.
- **A2.2 Claude not reachable:** A5.
- **A2.3 Drag over:** the door's border turns solid accent; the rest of the
  window gets the drop overlay (B1).
- **A2.4 After a line:** P2 S2 → S3 → B (one-line make, UJ3).
- **A2.5 After references:** B1.

## A3 · Delete an agent (UJ12 · 2)

From the agent menu (`Delete Rex…`) or its menu-bar mirror File ›
`Delete Rex Hart…` (the item names its target, X33; it never deletes a
talk). A C10 sheet, plain
(Merlin no-magic):

```
Delete Rex Hart?
This deletes Rex Hart's 14 past talks and what Rex Hart learned from
186 references. Your files on this Mac aren't touched.
This can't be undone.
                                   [ Cancel ]  [ Delete Rex Hart ]
```
- The destructive button uses the error colour as its fill; `Cancel` has
  default focus (Return = Cancel; the user must click or Tab to delete).
- Counts are real for the agent (0 talks → the talks part is left out; no
  references → that part is left out). A sketch: `Delete this sketch?`.
- On delete: back to Home, with any number of agents left (or A2 if it was
  the last one). No toast, no goodbye.
- **Studying agent:** the sheet adds `Studying stops.` before "This can't
  be undone."
- **Error:** `Couldn't delete Rex Hart. · Try again` in the sheet (error
  colour). The sheet stays.

## A4 · Opening rules (UJ1 · 1, UJ5 · 1)

`blocks-jony.md` §4.4. The 0 / 1 / 2+ rule applies **at launch only**;
going Home on purpose always shows Home (X8). Opening straight into the only
agent is a card click: a new talk, Past talks on the right. Health and
agents load in parallel (P2 S0). No AI call on open.

## A5 · Claude not reachable (UJ1 · 2)

P2 S10 and its offline banner (C11), unchanged, in every Sketcher composer
and every Talk composer. On first run: A2 with the banner above the
composer, Send disabled, typing allowed, the references door still
**works**: references are laid out (that's local), and `Start studying`
waits with the same reason (B2.6). The demo panel's `Claude reachable`
switch drives this state.

## Accessibility (block A)
- Home grid: a list (`role="list"`), each card a `button` labelled
  "Rex Hart. Ladder of Excuses, hard conversations. Last talk: The job
  offer, yesterday", plus the separate `Last:` link.
- Arrow keys move between cards; Return opens. Tab order: cards → sketch
  rows → New agent.
- `new here` and `Ready` are words. Faces have `alt` = name.
- Drop areas also open the file panel by click, Space or Return (never
  drop-only).

## Kept plain (no magic, checked)
Delete (one sheet, says what goes, no goodbye) · CLI missing (P2 words) ·
Home (no motion except the once-per-change face crossfade) · no welcome.

## Journey trace
UJ1 · 1 → A4 · UJ1 · 2 → A5 · UJ1 · 3 → A2 (chips, door) ·
UJ5 · 1 → A1 card · UJ6 · 1 → A1 `Last:` · UJ12 · 1 → A1 states ·
UJ12 · 2 → A3 (agent), Name field in the Sketch (rename), D4 (talks) ·
UJ12 · 3 → A1 New agent → A2.
