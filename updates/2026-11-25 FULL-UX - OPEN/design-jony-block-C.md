# Block C · Know (What [Name] knows)

*Jony, 2026-11-25. Shared frame, components (C1–C14), data shapes and flags
live in `blocks-jony.md`. Journey: **UJ4**. Owns Merlin ★4 (the map and its
arrival). Likeness and study scores are **plain on purpose** (Merlin §5).*

## User goal

> "So how good is it, and where is it weak? Show me in one place, tell me
> why, and tell me what to add."

**One primary action per state:**
- Map shown (C1): none. It's a page to read; each line opens on click.
- A Blank line: **Add a reference for this** (the only button on the row).
- Empty (C3): **Add references**.
- While studying (C4): none (B3's rules).

## What I removed, and why

| Removed | Why |
|---|---|
| A separate "Insight" screen or mode | UJ4 asks one question; it sits beside the Sketcher, who can answer "why Rough on pricing?" (§10 of blocks). |
| A material quality score as one number | Merlin §5: reasons first. Each file says *why* it's easy or hard to study; the summary is a count, not a grade. |
| Colour for Sharp / Rough / Blank | Words carry the level. Colour would read as a red/green grade. |
| A Likeness gauge, ring or bar | A gauge is a verdict. The number is last, small, plain. |
| Filters and sorting on the map | 6–10 lines. The order (Sharp → Rough → Blank) is the sort. |
| Editing map lines | The map is a reading of the references, not a setting. To change it, change the references (E1, E3) or ask the Sketcher. |
| "Learning progress" as its own section | It's the Studying block (B3) at the top, only while it runs. |

## Where it lives

Right pane in Sketcher mode, second part of the switch (B, "The right pane
in Sketcher mode"):

```
│ [ Sketch | What Rex knows ]                                         │  header 52
```
Kept agents never show Keep here (X4, F8): once kept, every change is live.
Reached by: the switch · the Keep card's box (B6) · the top bar Studying
line (C9) · the Finished notification (B4). The map arrives on its own the
first time the view is visible after a batch (X10).

The whole view sits on the behind-the-canvas surface (C8). One line at the
top, once: `Only you see this. Rex doesn't.`

## C1 · What [Name] knows (UJ4 · 1–4, ★4)

Sections, top to bottom. A section with nothing to say isn't drawn.

1. **Studying / Finished block** (B3 / B4), only while it applies.
2. **The map.**
3. **Likeness.**
4. **References.**

```
│ [ Sketch | What Rex knows ]                                           │
│───────────────────────────────────────────────────────────────────────│
│ Only you see this. Rex doesn't.                                       │
│                                                                       │
│ Sharp  The Ladder of Excuses: 7 rungs, step off one a day   5 refs ▸ │
│ Sharp  The 3-Breath Reset before a hard call                4 refs ▸ │
│ Sharp  Say it in one breath: hard conversations at work     4 refs ▸ │
│ Sharp  The Morning Standard: before 8 am                    3 refs ▸ │
│ Rough  Relationships (only Day 4)                           1 ref  ▸ │
│ Rough  Leading a team (scattered Q&A)                       2 refs ▸ │
│ Blank  Money and investing          Add a reference for this         │
│ Blank  Health and food              Add a reference for this         │
│                                                                       │
│ Likeness                                                              │
│ ✓ Talks like the Live Q&A: short, blunt, one question back            │
│   Live Q&A 3.mp3 · 08:40 ▸                                            │
│ ✓ Uses his own names for things (the Ladder, the Standard)            │
│   No Soft Days.pdf · p. 12 ▸                                          │
│ – Warmer on stage than in the books; the Sketch follows the books     │
│ Example: "You don't need motivation. You need a time and a place."    │
│   Day 1 – Opening.mp4 · 06:15 ▸                                       │
│ 8 of 10                                                               │
│                                                                       │
│ References · 186 · 3 hard to study ▸                                  │
└───────────────────────────────────────────────────────────────────────┘
```

### The map
- Rows are C6 map lines. Order: Sharp, then Rough, then Blank; inside a
  level, by number of references (most first). **The first line is the most
  specific one**, in Rex's own terms (Merlin ★4). The mock never has a
  generic line ("motivation", "mindset").
- `5 refs ▸` opens C2 (Why this line). The whole row is the button; the
  refs count is its visible label end.
- **Blank rows** end in `Add a reference for this` (text button, accent,
  44 px target). It opens the macOS open panel (files, multiple); the
  chosen files go to the Sketcher as a references chip with the line's
  topic, and study as a one-pile batch (B2.3 → E1). The Sketcher reply
  names the topic: `Studying Money Has Rules.pdf. It goes into what Rex
  knows, under money.`
- **Arrival** (★4): the groups fade in Sharp → Rough → Blank, 80 ms apart,
  the whole thing under 0.5 s. **Once per batch** (`map.arrivedFor =
  batchId`). Every later visit shows the map at once. Never blocks: the
  mode switch to Talk works from the first frame. Reduced motion: no fade.
- Marks from Grow (E2, E3) sit under the line text in 13 px: `was Blank` ·
  `was Sharp · now Rough · after removing "Old seminar 2009.mp4"`. They
  stay until the next visit to this view.
- No heading over the map: the switch already says `What Rex knows`.

### Likeness (OQ2, plain)
- Heading `Likeness` (15 px semibold), then 2–3 **reasons**, each `✓`
  (matches the references) or `–` (doesn't yet), with the reference that
  shows it as a 13 px link (opens C7). Then **one example line** the Sketch
  produces, with its reference. Then the number **last**: `8 of 10` (13 px,
  60%, no colour, no motion, no "great").
- It describes **the Sketch** against the references, never the person.
  The words never say "captured", "you", or "accurate".
- A `–` reason is phrased as what the Sketch does, so it reads as a thing
  to tell the Sketcher, not a judgment: `– Warmer on stage than in the
  books; the Sketch follows the books`.
- Only shown when there are references and studying has finished. During
  studying: hidden (C4). One-line agents: hidden (C3).

### References (UJ4 · 3)
One list of the user's files, one expander (X16).
- Collapsed: one row `References · 186 · 3 hard to study ▸`. With no hard
  files: `References · 186 ▸`.
- Expanded, top to bottom:
  1. **Hard to study** files first, as C12 rows with their reason. Reasons
     speak about the file's **structure**, never its worth:
     - `Live Q&A 11.mp3 · Hard to study · two voices talk over each other`
     - `Day 3 – Workbook scan.pdf · Hard to study · a scan, the text isn't selectable`
     - `Q&A notes.txt · Hard to study · one long file, no headings, hard to split`
  2. **The piles** (`What Rex knows`, `How Rex sounds`) with C12 rows per
     group, ▸ to files, per-file `Remove` on hover (E3), and the one
     `Set aside · n · why ▸` list (B2, X14).
- Easy files carry `Easy to study` in their own C12 row's ease slot (13 px,
  60%). Files not looked at for ease carry nothing (no "unknown").
- Ease is judged on a sample (studying every file for ease is slow and
  noisy). The prototype mock marks 12 Rex files: 3 hard, 9 easy.

### States
- **C1.1 Full** (Rex, as drawn).
- **C1.2 Small material** (Edie, 4 files): map 2 Sharp, 1 Rough, 2 Blank;
  Likeness with 2 reasons; References `References · 4 · 1 hard to study ▸`,
  expanded: the hard file first, then the 3 easy files flat (no groups).
- **C1.5 First view after a batch**: arrival plays (once), the first time
  the view is visible (X10).
- *(C1.3 Weak material and C1.4 Only Blank are cut from the prototype: no
  demo agent and no journey step uses them, X17. For the real build the
  general rules cover them: words not colours, reasons first, no fake
  Rough when every file was off-topic.)*
- **C1.6 Imported agent** (Juno, OQ4): the map didn't travel. On import,
  a short study of the packed knowledge runs (C4 rules, `Studying · reading
  packed knowledge · about 1 min left`), then the map arrives as normal.
  References shows `Packed knowledge from Juno.agent.zip · 48 MB` (one
  row, no files: the raw files didn't travel, F6) and no study ease
  (nothing to sample). Likeness: hidden (nothing to compare against); the
  Sketch alone speaks.
- **C1.7 After a top-up** (E1/E2): marks on changed lines; Likeness shows
  the new number with `was 8` in 13 px next to it, plain.

## C2 · Why this line (★4 "each line opens its references")

Click a map line → the row expands **in place** to its references:

```
│ Sharp  The 3-Breath Reset before a hard call                4 refs ▾ │
│        Day 2 – Hard Calls.mp4 · 14:20                              › │
│        No Soft Days.pdf · p. 88                                    › │
│        Live Q&A 6.mp3 · 31:02                                      › │
│        The Pressure Gift.pdf · p. 40                               › │
```
- Each reference row → the passage panel (C7) replaces the view, with the
  header `← What Rex knows` on the left instead of `✕` (it's a step into
  this view, not a panel from the conversation), file name as title. The
  panel's footer reads `Behind: The 3-Breath Reset before a hard call`.
  Underline: the words that back the line (span).
- Esc or `←` back: the map, with this row still expanded and focused.
- Rough with 1 ref shows its one row and, under it in 13 px: `Only Day 4
  covers this.` (from `wasReason`-style mock text, never AI-free-form).
- Blank rows don't expand (nothing behind them).
- Asking the Sketcher "why Rough on relationships?" works too (B5 scripted
  pattern); its reply carries the same reference rows as Where from lines.

## C3 · Empty: no references yet (Marcus, UJ3 · 2)

```
│ [ Sketch | What Marcus knows ]                                        │
│───────────────────────────────────────────────────────────────────────│
│ Only you see this. Marcus doesn't.                                    │
│                                                                       │
│ Marcus knows only what's in the Sketch.                               │
│ Add references to teach him more.                                     │
│                                                   [ Add references ]  │
```
- **Add references** (filled, the only primary) → macOS open panel → B1.
- No map, no Likeness, no References section. No empty boxes.
- Dropping files here does the same (B1 overlay).

## C4 · While studying (UJ2 · 5, ★3)

The Studying block (B3) sits on top. Under it:
- **First impressions** map (B3): Rough lines at 60%, heading
  `What Ines knows · first impressions · from 20 of 297`. No refs counts
  yet (they'd change); rows don't expand. Arrival: none (they firm up one
  by one, B3).
- Likeness: hidden (`Likeness comes when studying is done.`, 13 px, 60%).
- References: collapsed row with per-file state (B3).
- **Before first impressions** (the first ~20 files): only the Studying
  block and `First impressions after about 20 files.` (13 px, 60%).
- **Kept agent studying a top-up** (E1): the old map stays fully drawn and
  usable; the Studying block sits above it. Changes arrive with E2's marks
  when finished.

## Accessibility (block C)
- The map is a list (`role="list"`); each line is a button with
  `aria-expanded`, its label read as "Sharp. The 3-Breath Reset before a
  hard call. 4 references."
- Level words are text, not icons or colours. `✓` / `–` have hidden labels
  "matches" / "not yet".
- `Only you see this. [Name] doesn't.` is the first thing read in the view.
- Arrival is visual only; the content is in the DOM from frame one.
- Targets ≥ 44 px (rows, `Add a reference for this`, Add references).
- Contrast: the 60% text is checked ≥ 4.5:1 on the C8 surface in light and
  dark.

## Mock data (block C)
- **Rex map** (`map`, 4/2/2):
  - Sharp `The Ladder of Excuses: 7 rungs, step off one a day` · refs
    `No Soft Days.pdf · p. 30`, `p. 34`, `Day 1 – Opening.mp4 · 22:10`,
    `Day 3 – The Ladder.mp4 · 04:00`, `Live Q&A 2.mp3 · 12:45`.
  - Sharp `The 3-Breath Reset before a hard call` · 4 refs as in C2.
  - Sharp `Say it in one breath: hard conversations at work` · `Day 2 –
    Hard Calls.mp4 · 14:20`, `No Soft Days.pdf · p. 88`, `The Pressure
    Gift.pdf · p. 71`, `Live Q&A 9.mp3 · 05:30`.
  - Sharp `The Morning Standard: before 8 am` · `No Soft Days.pdf · p. 12`,
    `Day 1 – Opening.mp4 · 40:05`, `Live Q&A 4.mp3 · 17:20`.
  - Rough `Relationships (only Day 4)` · `Day 4 – Home Front.mp4 · 10:00`.
  - Rough `Leading a team (scattered Q&A)` · `Live Q&A 5.mp3`, `Live Q&A
    12.mp3`.
  - Blank `Money and investing` · Blank `Health and food`.
  - Every passage contains the line's claim; span set (blocks §6 rule).
- **Rex likeness:** the 3 reasons, example and `8 of 10` as drawn; after E1
  `9 of 10` (`was 8`), with a new reason `✓ Has his money rules, word for
  word` (`Money Has Rules.pdf · p. 12`).
- **Rex study ease:** 12 files carry ease, 3 hard (as listed), 9 easy; the
  other 174 carry none.
- **Edie:** files `Style rules.md` (easy), `Best issues 2025.docx` (easy),
  `Reader emails.txt` (`Hard to study · one 80-page file, no headings, hard
  to split`), `Voice notes.m4a` (easy). Map: Sharp `Cutting the first
  paragraph` · Sharp `Subject lines under six words` · Rough `Interviews
  (one issue)` · Blank `Fiction` · Blank `Design and layout`. Likeness `7
  of 10`, reasons `✓ Cuts like Style rules.md`, `– Fewer jokes than in the
  voice notes`.
- **Ines first impressions:** B3's 3 Rough lines.
- **Juno after import study:** Sharp `Notice periods and auto-renewal` ·
  Sharp `Liability caps in plain words` · Rough `Employment contracts` ·
  Blank `Tax`.
- **Marcus:** no references (C3).
- No weak-material or only-Blank mock (X17).

## Kept plain (no magic, checked)
Likeness: reasons first, number last, no colour, no motion, no praise
words · study ease talks about structure only · the agent never sees the
map (C8, never in the draft) · arrival is the only motion, once per batch.

## Journey trace
UJ4 · 1 → C1 (switch, Keep box, Studying line) · 2 → C1 Likeness · 3 → C1
References, the one expander (hard files first) · 4 → C1 Blank row `Add a reference for this` →
E1. UJ2 · 7 → C1.5 arrival (from B4). UJ3 · 2 → C3. UJ11 → C1.6.
