# FULL-UX walk-through checklist (Phase 7)

*Columbo, 2026-11-25. For Eraser (who walks it and signs off in
`signoff-eraser.md`) and anyone testing `dist/Agent Creator.app`. Every
word and screen name comes from `blocks-jony.md`, `design-jony-block-A..F.md`,
`cuts-eraser.md` and `cuts-jony-reply.md`. Screen ids (A1, B3, D5 …) and
component ids (C1 … C15) are Jony's.*

## How to use this

- Each `- [ ]` line is one check. Tick it **yes** only if you saw exactly
  what the line says. If not, write the fix (or the gap) next to it in the
  sign-off file.
- **Click** lines are what you do. **See** lines are what must be on screen.
  `[trust]` marks a trust item (sources, the Sharp / Rough / Blank map, the
  one-step `Not [Name]` fix, no silent skips). `[magic]` marks a magic moment
  (★ = Merlin's MUST).
- **Fresh start for every journey:** open `dist/Agent Creator.app`, click the
  `Demo` pill (far right of the top bar) › `Reset demo`. The demo set is then
  6 agents, so the app opens on **A1 Home**.
- `Demo` › `Claude reachable` must be **on** unless a step says otherwise.
- Where the P2 Sketcher is real (UJ3, the D5 fix, E5 traits), answers will
  differ in wording from the mock. Check the *shape* (reply + change line),
  not the exact words. Scripted parts (references, the map, Talk) must match
  word for word.
- Narrow layout (< 860 px) and reduced motion are checked once, in §14.

## 0. Before you start (the app itself)

- [ ] `npm run build:app` finishes and `dist/Agent Creator.app` exists.
- [ ] Opening the .app starts the local server and shows a window/page with no error.
- [ ] Top bar shows `Agent Creator` (plain text on Home) and the `Demo` pill on the far right.
- [ ] `Demo` › `Show mock values` outlines every mock-fed element in a dotted line; turning it off removes the outlines.
- [ ] Nothing on screen says "Settings", "Library", "Insight" or "Know" as a tab, mode or menu item.

---

## UJ1 · First run

Demo set has 6 agents, so a real 0-agent launch needs the build to offer
it. If it doesn't, tick the first line **no** and note it as a gap.

1. **Launch with 0 agents** (A4)
   - [ ] With 0 agents, the app opens straight on **A2 First run** (no tour, no welcome, no animation).
   - [ ] With exactly 1 agent (if the demo allows it), the app opens straight into it like a card click: kept → Talk, a **new talk**, `Past talks` on the right; never kept → Sketcher mode with `Back to [Name].`
2. **Reach A2 from Home** — Click the dashed `New agent` card (`one line, or drop a folder`). Then try ⌘⇧N from inside Rex.
   - [ ] Both open A2 First run.
   - [ ] A2 shows `Who should this agent be? One line is enough.` and the three P2 chips (`A tough-love coach like Tony Robbins`, `A blunt editor for my newsletter`, `Me, for answering client emails`).
   - [ ] Below the chips: the dashed references door `Or bring their references` / `Drop a folder or files here, or paste a path` / `Your files stay on this Mac · Claude reads them to study`.
   - [ ] The composer (`Type here…`) is focused and has **no ＋** while the door is shown (X7).
   - [ ] Top bar shows only `Agent Creator`; no mode switch, no agent button.
3. **CLI missing** (A5) — `Demo` › `Claude reachable` off.
   - [ ] The P2 offline banner (C11) shows above the composer, Send is disabled, typing still works.
   - [ ] The references door still works (laying out is local); `Start studying` later waits with `Claude isn't reachable · Check again` (B2.6).
   - [ ] Home (A1) shows no banner (A1.7).
   - Turn `Claude reachable` back on.
4. **Drag over the door** (A2.3)
   - [ ] The door's border turns solid accent; the window shows the C15 overlay `Drop · your files stay on this Mac` / `Claude reads them to study` with **no** context line.
5. **After the first message or references**
   - [ ] The door and chips go for good; the ＋ (`Add references`) appears in the composer, with no motion.
   - [ ] A message that is only a path (`~/…` or `/…`) is treated as references (B1), not sent to the Sketcher as text.

## UJ2 · Make from material (Ines)

Click `Demo` › `Start UJ2 fresh` (resets Ines to before the drop, opens A2
with the demo folder ready to drop).

1. **Bring the folder** (B1) — Drop `Ines Duarte – The Quiet Deal/` on the door (or click the door and pick it).
   - [ ] User-side references chip: `References · Ines Duarte – The Quiet Deal` / `312 files · 38.4 GB ▸`.
   - [ ] Under it: `Sketcher` + `Laying out…` (P2 dots), under 1 s.
   - [ ] The right pane switches to `What it knows` (the user just acted); no spinner, faint stack placeholders while scanning.
2. **Inventory** (B2) `[trust]` `[magic 6]`
   - [ ] `Only you see this. Ines doesn't.` at the top of the pane, on the dashed C8 surface.
   - [ ] `References · Ines Duarte – The Quiet Deal · 312 files · 38.4 GB`.
   - [ ] Pile `What Ines knows · 267 files` with Books (3 PDF · 46 MB), Transcripts (120 text · 9 MB), Notes (116 Markdown · 2 MB), Live Q&A (18 audio · 2.1 GB), Bonus (10 PDF · 31 MB) — the user's own folder names.
   - [ ] Pile `How Ines sounds · 41 files` with `Course – The Quiet Deal` (41 video · 36.2 GB).
   - [ ] `Set aside · 4 · why ▸` expands to one row per file with its reason: `Workbook.pages` (can't read Pages, export as PDF), `Setup.dmg` (an app installer), 2 × `(copy).md` (duplicate). `[trust]` no silent skips.
   - [ ] Estimate line `About 40 min to study · you can close the app, it keeps going` above **Start studying** (the only primary in the pane).
   - [ ] Sketcher reply: `I laid out 312 files. … Change anything in one sentence, then press Start studying.`
   - [ ] Composer placeholder: `Say what to change, like "skip Bonus"…`.
   - [ ] No file contents shown anywhere, only names (privacy).
3. **Correct the split in one sentence** — Type `Skip Bonus. Her voice from the Live Q&A only.` and send.
   - [ ] Sketcher reply `Done. Bonus is set aside. …` + change line `Split: 18 recordings moved to How Ines sounds · 41 videos moved to What Ines knows · Bonus set aside ↗`.
   - [ ] The moved stacks slide to their new pile; counts become What Ines knows 280 · How Ines sounds 18 · Set aside 14.
   - [ ] ↗ scrolls the pane to the first moved stack.
   - [ ] Typing `go` (or `ok`, `start`) does **not** start studying; the Sketcher says `Press Start studying when it looks right.`
   - [ ] Rows can't be dragged between piles (one way: the sentence).
4. **Start, then leave** (B3) `[magic ★3]` — Click **Start studying**.
   - [ ] The References section becomes the Study block: `Studying · [file name] ([stage]) · n of 297`, with a real file name from the folder.
   - [ ] Time line `about … min left · … · you can close the app, it keeps going` with a quiet `Stop` on the right. No percentage bar, no stages line (X13).
   - [ ] Top bar shows `Studying · about … min left`; clicking it opens `What Ines knows`.
   - [ ] Go Home (⌘↑): the Ines row under `Sketches` reads `Studying · about … min left`. Nothing pops up.
5. **Something early** — `Demo` › `Skip time ▸` once (to First impressions).
   - [ ] Heading `What Ines knows · first impressions · from 20 of 297` with 3 **Rough** lines at 60%: `The Quiet Anchor: never name a number first`, `Silence as a tool: count to seven before answering`, `Walk-away line: decide it before you sit down`. No refs counts, rows don't expand.
   - [ ] Likeness is hidden (`Likeness comes when studying is done.`).
   - [ ] Sketch view: Name `Ines Duarte` and a persona line filled with the tag `first impressions`; the `Sketch` switch shows the update dot (•) if you're on the other view.
   - [ ] Chat: `First impressions, from 20 of 297: …` + change line `Sketch: name and persona updated`.
   - [ ] The Palette strip (C13) with `stand-in look` gains one named segment per finished group.
6. **Close the app and come back** — Quit the .app mid-study, reopen it.
   - [ ] The Study block reads `Picked up where it left off · 251 of 297` for about 10 s, then the normal line. Nothing restarts from 0. `[trust]` learning work is not lost.
   - [ ] (Seeded Ines in the plain demo set shows this same resumed state.)
7. **Stop and resume** — Click `Stop`.
   - [ ] No "are you sure?" sheet (X12). The block reads `Stopped · 251 of 297 studied · Study the rest`.
   - [ ] `Study the rest` resumes from where it stopped.
8. **Back to "done"** (B4) — `Skip time ▸` until finished.
   - [ ] Summary `Finished studying · 296 references studied · 15 set aside ▸` with **no button** (no `See what Ines knows`, no `Talk to Ines`) (X10, X11).
   - [ ] `15 set aside ▸` is one list with a reason per row, including `Course – The Quiet Deal/Day 2 – Part 4.mp4 · damaged: no sound track found. Re-export it and drop it again.` No separate `Couldn't be read` list (X14). `[trust]`
   - [ ] Chat: `I finished studying. Here's Ines from 296 references.` + a voice card + change line `Sketch: persona and instructions updated`.
   - [ ] Home row for Ines reads `Ready` until opened. No chime, no confetti.
9. **The full map arrives** (C1) `[magic ★4]` `[trust]`
   - [ ] The first time `What Ines knows` is visible after the batch, groups fade in Sharp → Rough → Blank (under 0.5 s). Switch away and back: it shows at once (once per batch).
   - [ ] The map is 4 Sharp / 2 Rough / 2 Blank, levels in **words**, no colour grade.
   - [ ] Sketcher placeholder (once): `Ask about any line, like "why Rough on pricing?"…`. Asking it returns `Only Day 4 covers pricing, and only for short deals. Add her pricing workshop if you have it.` with `Day 4 – Session 8.mp4 · 22:05`.
   - [ ] After this first visit the summary collapses to `296 references · studied 25 Nov`.
10. **Shape, with voice cards that quote the material** (B5) `[magic ★1]`
    - [ ] A voice card with caption `sample, from the current sketch and her references` and `Where from · Live Q&A 7.mp3 · 03:10`.
    - [ ] Clicking it opens the passage panel (C7) with `Live Q&A 7.mp3`, `03:10`, and the sample words underlined. `✕` returns to the Sketch. `[trust]` the passage contains `The first number on the table belongs to whoever is more nervous`.
    - [ ] Hand-edited fields (`✎ yours`) are not overwritten; the Sketcher asks first.
11. **Face** (B5 → E4) `[magic 11]`
    - [ ] When the name lands, the face slot (left of Name) shows the first of three AI icons with tag `new`, and the Sketcher says once `I drew three faces for Ines. Click hers to pick another.`
    - [ ] Clicking the face slot opens the `Ines's face` sheet (E4); doing nothing keeps the first icon.
12. **Keep** (B6) `[magic ★4]`
    - [ ] The Keep card: `Ines Duarte`, persona line, `Yours. You can keep changing it.`, the box `What Ines knows · only you see this` with exactly three lines: `Sharp The Quiet Anchor`, `Rough Pricing in long contracts`, `Blank Salary talks`. No praise.
    - [ ] The whole box is one button → `What Ines knows` (no link inside it, X15).
    - [ ] `Talk to Ines →` link; the mode switch `[ Talk | Sketcher ]` fades into the top bar at the same moment.
    - [ ] After Keep, the Keep button is gone from the Sketch header for good (X4).
    - [ ] Click `Talk to Ines →` → D2 First words: `Before we talk numbers — what do you actually need from this deal?` (see UJ5 step 2 checks).

## UJ3 · Make from one line

Fresh start, then click `New agent`. This path uses the **real** P2 Sketcher.

1. **One line** (P2 S1–S7) — Click the chip `A blunt editor for my newsletter`.
   - [ ] The P2 flow runs unchanged: Sketcher reply, the Sketch fills with `new` marks, voice cards.
   - [ ] The right-pane switch reads `[ Sketch | What it knows ]` before a name, then `[ Sketch | What [Name] knows ]`.
2. **Keep, with the "no material" card** (B7) `[magic ★4]` `[trust]` — Click **Keep**.
   - [ ] The box reads `What [Name] knows · only you see this` / `[Name] knows only what's in the Sketch.` / `Add references to teach [Name] more.` (or the persona's pronoun).
   - [ ] The box is **not** a button; its one action is the text button `Add references` (X15).
   - [ ] Switch to `What [Name] knows`: C3, the same words, one primary `Add references`. No map, no Likeness, no empty boxes.
   - [ ] In Talk, this real agent answers with one marked line `(Demo) …` (F2), outlined when `Show mock values` is on. It never pretends to be a real answer.
3. **A few files later** (E1.2, on Marcus) — Home › Marcus › `Sketcher` › `What Marcus knows` › `Add references`, pick the 4 demo docs.
   - [ ] C3 shows for Marcus before the pick.
   - [ ] One-pile batch: no piles, no Start studying; the Sketcher says `Studying 4 references. They go into what Marcus knows.`
   - [ ] The short Study block runs, then the map arrives with marks on the changed lines (E2).

## UJ4 · Check how good it is (Rex, then Edie)

Fresh start. Click Rex's card › `Sketcher` (or ⌘2) › `What Rex knows`.

1. **Open the view** (C1)
   - [ ] Header shows the switch `[ Sketch | What Rex knows ]` and **no Keep** (Rex is kept).
   - [ ] First line of the view: `Only you see this. Rex doesn't.` on the dashed C8 surface. `[trust]`
2. **The map** `[trust]`
   - [ ] Sharp: `The Ladder of Excuses: 7 rungs, step off one a day · 5 refs ▸`, `The 3-Breath Reset before a hard call · 4 refs ▸`, `Say it in one breath: hard conversations at work · 4 refs ▸`, `The Morning Standard: before 8 am · 3 refs ▸`.
   - [ ] Rough: `Relationships (only Day 4) · 1 ref ▸`, `Leading a team (scattered Q&A) · 2 refs ▸`.
   - [ ] Blank: `Money and investing` and `Health and food`, each ending in `Add a reference for this` (no refs count).
   - [ ] No generic lines ("motivation", "mindset"). Levels are words, not colours.
3. **Why this line** (C2) — Click `The 3-Breath Reset before a hard call`.
   - [ ] The row expands in place to 4 rows: `Day 2 – Hard Calls.mp4 · 14:20`, `No Soft Days.pdf · p. 88`, `Live Q&A 6.mp3 · 31:02`, `The Pressure Gift.pdf · p. 40`.
   - [ ] Click one → the passage panel with `← What Rex knows` (not `✕`), file name as title, location, passage with the backing words underlined, footer `Behind: The 3-Breath Reset before a hard call`. `[trust]` the passage really says the claim.
   - [ ] No `‹ 1 of 3 ›` pager (X18). With the panel open, clicking another reference swaps the passage.
   - [ ] Esc / `←` returns to the map with the row still expanded and focused.
   - [ ] Click `Relationships (only Day 4)`: one row and `Only Day 4 covers this.` Blank rows don't expand.
4. **Likeness** (OQ2, plain)
   - [ ] Heading `Likeness`, then `✓ Talks like the Live Q&A: short, blunt, one question back` (`Live Q&A 3.mp3 · 08:40 ▸`), `✓ Uses his own names for things (the Ladder, the Standard)` (`No Soft Days.pdf · p. 12 ▸`), `– Warmer on stage than in the books; the Sketch follows the books`.
   - [ ] `Example: "You don't need motivation. You need a time and a place."` with `Day 1 – Opening.mp4 · 06:15 ▸`.
   - [ ] `8 of 10` comes **last**, small, no colour, no motion, no "great", no gauge or ring.
   - [ ] No words "captured", "you" or "accurate" in the Likeness text.
5. **Study scores per file** (one expander, X16)
   - [ ] One row only: `References · 186 · 3 hard to study ▸`.
   - [ ] Expanded: the 3 hard files first, each with a reason about structure: `Live Q&A 11.mp3 · Hard to study · two voices talk over each other`, `Day 3 – Workbook scan.pdf · … a scan, the text isn't selectable`, `Q&A notes.txt · … one long file, no headings, hard to split`. Then the piles; easy files carry `Easy to study`; others carry nothing.
6. **Gap → what to add**
   - [ ] `Add a reference for this` on `Money and investing` opens the file panel (continues in UJ8).
7. **Small material** (C1.2) — Home › Edie › `Sketcher` › `What Edie knows`.
   - [ ] Map: Sharp `Cutting the first paragraph`, Sharp `Subject lines under six words`, Rough `Interviews (one issue)`, Blank `Fiction`, Blank `Design and layout`.
   - [ ] Likeness 2 reasons (`✓ Cuts like Style rules.md`, `– Fewer jokes than in the voice notes`), then `7 of 10`.
   - [ ] `References · 4 · 1 hard to study ▸` → `Reader emails.txt · Hard to study · one 80-page file, no headings, hard to split` first, then 3 easy files flat.
8. **While studying** (C4) — Home › Ines (seeded, still studying) › `What Ines knows`.
   - [ ] Study block on top, first-impression Rough lines at 60%, Likeness hidden, no Keep-like button that opens the view.

## UJ5 · Ask a question (Rex)

Fresh start.

1. **Pick by face** (A1) `[magic 12]`
   - [ ] Home shows the kept cards Rex Hart, Marcus, Edie, Juno (Juno: `new here`), each with a 72 px face, name, 1–2 Sharp lines (Rex `Ladder of Excuses · hard conversations`; Edie `Cutting the first paragraph · subject lines`; Marcus: `A stoic mentor who helps founders make hard calls.`) and `Last: [title] · [when]` (Rex `The job offer · yesterday`; Marcus `Firing my cofounder · 12 Nov`; Edie `Issue #212 · 3 Nov`).
   - [ ] Below: `Sketches` with Ines Duarte (`Studying · about 25 min left`) and `Untitled sketch · yesterday`; then the `New agent` card.
   - [ ] No search, sort, filters, card buttons or card context menus.
   - [ ] Each card shows at most one mark (X9).
   - Click Rex's face.
2. **Ask, words in seconds** (D1) — Type `How do I call my landlord about the rent without caving?`, send.
   - [ ] Talk opens on a **new talk**: empty list, composer `Talk to Rex…` focused, no greeting, no motion. No ＋ in the composer.
   - [ ] Right pane: `Past talks` with `New talk` on the right and `Search past talks`.
   - [ ] The answer starts streaming in under ~1 s, Rex's 24 px face before the label `Rex`.
   - [ ] The new row in Past talks first shows the first words of your message at 60% (`How do I call my landlord…`), then the topic title (X21).
   - **First words check** (D2, `[magic ★5]`): Home › Juno (or Ines after UJ2).
   - [ ] Faces start as outlines; the first line streams **and** the face fills in **together**, with no motion before the words (X23).
   - [ ] Mark `── First words · 25 Nov ──` above; the talk is titled `First words`. Opening the agent again never greets.
   - [ ] Offline (`Claude reachable` off) on a never-opened agent: no first words, the face stays an outline, the C11 banner shows. Turning it on and reopening still plays the moment.
3. **Check a source** (D3) `[magic ★1]` `[trust]`
   - [ ] After the stream ends, `Where from · Day 2 – Hard Calls.mp4 · 14:20 · No Soft Days.pdf · p. 88` fades in (150 ms). Each source is its own link; file names are the user's.
   - [ ] Click `Day 2 – Hard Calls.mp4` → the passage panel over Past talks: title, `14:20`, the passage, `three breaths` … `say the whole ask in one breath, and you stop` underlined, `Used in this answer`.
   - [ ] Click `No Soft Days.pdf · p. 88` with the panel open → the passage swaps in place. No pager.
   - [ ] `✕` / Esc → Past talks, focus back on the source link. The panel never opens on its own.
   - Ask `Should I quit my job?`.
   - [ ] Answer ends with `Rex's own view · no reference` (plain text, not a link, neutral colour, same slot as Where from).
4. **Outside its training** (honest Blank) `[magic 8]` `[trust]` — Ask `What should I eat before a big day?`.
   - [ ] Answer `Not my lane. I've never taught food, and I won't guess with your body. …`. The agent's words never mention the map.
   - [ ] Under it, the user-only C8 strip: `Blank in what Rex knows` (plain text) · `Add a reference for this` (the only action, X20).
   - [ ] Free text not in the script → `(Demo) Rex would answer here. Try one of: …` with 4 chips that type the question (not send).
   - [ ] Marcus (D1.6): every answer is own view, no banner about missing references.

## UJ6 · Pick up an earlier conversation (Rex)

Fresh start.

1. **Past talks with titles** — Click `Last: The job offer · yesterday` on Rex's card.
   - [ ] Talk opens on `The job offer` **continued**: scrolled to the end, last two lines `They want an answer by Friday.` / `Then you call them Friday at 9, …`, composer focused, no recap, no motion. `[magic 10]`
   - [ ] `Past talks` lists 14 talks newest first (`Landlord call` today, `The job offer` yesterday, `Saying no to Dad` Mon, … `First words` 25 Oct), titles are topics (never "New chat"), the open one highlighted. No previews.
2. **Search a word** — ⌘F, type `Friday`.
   - [ ] The search field focuses; rows filter as you type; `The job offer` shows `…call them **Friday** at 9…`.
   - [ ] Opening it scrolls to the first match with a 1 s highlight.
   - [ ] Type `mortgage` → `No talks with "mortgage".` No suggestions. Esc clears.
3. **Continue, it remembers** — Send any message in `The job offer`.
   - [ ] Rex: `Last time you were going to call them Friday. Did you?` with `Rex's own view · no reference`.
4. **Row menu** (UJ12 · 2 for talks)
   - [ ] On hover/focus each row shows `⋯` only: `Rename` (inline, Enter saves, Esc cancels) and `Delete…`.
   - [ ] `Delete…` → sheet `Delete "Saying no to Dad"? The talk goes. Rex stays as he is.` [Cancel] [Delete]. Deleting the open talk leaves an empty new talk.

## UJ7 · Fix a wrong note (Rex) `[magic ★2]` `[trust]`

Fresh start. Click Rex's face.

1. **A wrong line** — Ask `How do I get started in the morning?`.
   - [ ] Answer `Great question! 😊 Let's explore that together. Everyone's mornings are different…` with **no** Where from and **no** own-view line.
   - [ ] `Not Rex` is visible at 60% at the bottom-right of this **latest** answer without hovering (X19). On older answers it shows on hover/focus only; never on your messages or dividers; hidden while streaming.
   - [ ] Can a first-timer find it in 10 s? (Phase 7 test, write the result.)
2. **Say it, line carried** (D5) — Click `Not Rex`.
   - [ ] The right pane opens `Sketcher · fixing Rex ✕`; the talk stays put; focus moves to the fix composer `Say what's wrong…`.
   - [ ] The wrong message gets a warm left rule. The pinned strip quotes `Rex: "Great question! 😊 Let's explore that together."`.
   - [ ] Fixed opening line: `You said this isn't Rex. What would he say instead, or what's wrong with it?`
3. **Sketcher proposes** — Type `He'd never say "great question" and never uses emoji. He answers first, then asks one hard question.`, send.
   - [ ] Sketcher reply (real P2) + change line `Sketch: persona updated · from your talk ↗`. No Keep appears anywhere (X4); the change is live.
   - [ ] ↗ opens Sketcher mode with the changed field marked `new` and tagged `from your talk`; the Sketcher chat shows the fix turns under `── From your talk · "How do I get started…" ──` (X22).
4. **Next answer sounds right** — Back in Talk, click `✕`.
   - [ ] `── Rex was redrawn · persona updated ──` fades in right after the wrong message; clicking it shows the added sentence and `See the Sketch ↗`.
   - [ ] The composer is prefilled with `How do I get started in the morning?`, focused, **not sent**. Press ↑ / send.
   - [ ] Rex answers `Feet on the floor before the phone. Three breaths. … That's the Morning Standard.` + `Where from · No Soft Days.pdf · p. 12`.
5. **No-change and normal messages**
   - [ ] Opening `Not Rex` and closing with `✕` without a change: no divider, no prefill, the mark on the message goes.
   - [ ] Typing `be blunter` as a normal Talk message never changes Rex (no change line, no divider).

## UJ8 · Add more material (Rex)

Fresh start. Rex › `Sketcher` › `What Rex knows`.

1. **Add a new book** (E1) — Click `Add a reference for this` on `Money and investing`, pick `Money Has Rules.pdf`.
   - [ ] User chip `References · Money Has Rules.pdf · 1 file · 4 MB`; Sketcher `Studying Money Has Rules.pdf. It goes into what Rex knows, under money.`
   - [ ] One-pile batch: no piles, no Start studying.
   - Also check: the Blank line in Talk (`Add a reference for this`) opens the same panel and lands in Sketcher mode; a drop in Talk shows the overlay with `adds to Rex Hart` and the privacy lines, then switches to Sketcher.
2. **Short run**
   - [ ] Study block `Studying · Money Has Rules.pdf (reading) · 1 of 1` / `about 1 min left · you can close the app, it keeps going` sits on top of the old, fully usable map.
   - [ ] Top bar `Studying · about 1 min left`; Talk still works on the old Rex.
   - [ ] Finished: `Finished studying · 1 reference studied`, no buttons (X10, X11).
3. **What changed** (E2) `[magic 7]`
   - [ ] On this first view: `Sharp Money has rules: the four rules, starting with "pay the future first" · 1 ref ▸`, placed first, redrawing faint → clear, mark `was Blank`.
   - [ ] Likeness gains `✓ Has his money rules, word for word` (`Money Has Rules.pdf · p. 12 ▸`) and shows `9 of 10 · was 8`, no motion on the number.
   - [ ] Chat: `I studied Money Has Rules.pdf. Money is no longer Blank.` + change line `What Rex knows: Money and investing, Blank → Sharp ↗`.
   - [ ] Next visit: the line is back in normal order, marks gone.
4. **Quiz on the new book** — Click `Ask Rex about it: "What's the first rule of money?"`.
   - [ ] Talk, a **new talk**, composer focused with the question typed, not sent.
   - [ ] Send → `Pay the future first. …` + `Where from · Money Has Rules.pdf · p. 12`; the passage underlines `pay the future first`. `[trust]`
5. **Remove a source** (E3) — `What Rex knows` › `References · … ▸` › `Extras` ▸ › hover `Old seminar 2009.mp4` › `Remove`.
   - [ ] Tooltip on `Remove`: `Rex stops using it. The file stays on your Mac.`
   - [ ] No confirm. The row goes; in its place `Removed. Rex no longer uses "Old seminar 2009.mp4". · Undo`, focus on `Undo`.
   - [ ] Map: `Rough The 10-Minute Promise · 1 ref ▸` with `was Sharp · now Rough · after removing "Old seminar 2009.mp4"`, no motion. Likeness unchanged.
   - [ ] Chat change line `References: removed "Old seminar 2009.mp4"`.
   - [ ] In Talk, new answers never cite the file; old talks show `Old seminar 2009.mp4 · removed` as plain text. `[trust]`
   - [ ] Click `Undo`: row, map line and Likeness come back as they were, nothing re-studied, chat `References: put back "Old seminar 2009.mp4"`.
   - [ ] Removing a group (`Live Q&A`) uses the same line `Removed. Rex no longer uses "Live Q&A" (18 recordings). · Undo`, no sheet (X25).

## UJ9 · Make it a character

Fresh start.

1. **Real photo** (E4, Edie) `[magic 11]` — Edie › `Sketcher` › `Sketch` › click the face slot left of Name.
   - [ ] Sheet `Edie's face` with three icons (the current one first and preselected), `Draw three more · Use a photo…`, `or drop a photo here`, [Cancel] [Use]. `Use` is disabled until the choice differs.
   - [ ] `Draw three more` shows `Drawing…`, then replaces only the other two; the current face stays first (X28).
   - [ ] `Use a photo…` → pick `edie-portrait.png`: it appears as a fourth choice, selected, circle crop.
   - [ ] `Use` → the face crossfades (300 ms) in every visible place at once (top bar, Sketch slot, message labels; Home card next time Home shows).
   - [ ] Sketcher chat change line `Face: new photo`, no Keep (live).
   - [ ] The agent menu has **no** `Change face…`; it reads `Palette · Export Edie… · Delete Edie…` (X26).
2. **The Palette** (E5, Rex) `[magic 9]` — Rex › agent button ▾ › `Palette`.
   - [ ] Right pane `Palette · what Rex is mixed from · 186 references, 4 traits ✕`, no footer (X27).
   - [ ] The mix band (stand-in look) blooms once on first open (later: at once); hover names a segment, e.g. `Live Q&A · 18 recordings · how Rex sounds`.
   - [ ] Traits: Directness 4 `Says the hard thing, then explains.`, Warmth 2, Energy 4, Humour 2, each a five-step scale.
   - [ ] Opens in Sketcher mode (Sketcher in the left pane).
3. **Adjust a trait** — Set Directness to 5.
   - [ ] A visible user message `Directness: 4 → 5` goes to the Sketcher; reply + change line `Sketch: persona updated ↗`; the persona field gets `new`. The trait sentence becomes `Says the hard thing first and doesn't soften it.`
   - [ ] Scales are disabled with `Sketching…` while the turn runs.
   - [ ] `✕` / Esc → back to the Sketch / knows switch.
   - [ ] Marcus's Palette header reads `· 3 traits` (traits only).

## UJ10 · Export (Rex)

Fresh start. Rex › agent button ▾ › `Export Rex…` (also ⌘E).

1. **What's in it** (F1) `[magic 13]` `[trust]`
   - [ ] One sheet `Export Rex Hart`. `Packed`: Name `Rex Hart`, Persona `212 words`, Instructions `188 words`, Face `photo`, Knowledge `from 186 references · 2.3 GB`.
   - [ ] `Stays here`: `What Rex knows (only you see it)`, `Palette (only you see it)`, `Your talks with Rex`.
   - [ ] `One file: Rex Hart.agent.zip · about 2.3 GB` / `Desktop · Change…`.
   - [ ] No options (face/talks/map toggles), no "unkept changes" line (X4).
2. **Export** — Click `Export`.
   - [ ] No save panel appears (X29); the done state `Exported · Rex Hart.agent.zip` with `Show in Finder` and `Done`. Esc = Done.
   - [ ] Exporting again to the same place names it `Rex Hart 2.agent.zip` (never overwrites).
   - [ ] `Change…` (only when clicked) opens the save panel; the line shows the new folder, the sheet stays.
   - [ ] Marcus's export shows `Knowledge · none, only the Sketch`. The untitled sketch's menu has no Export item.

## UJ11 · Import

Fresh start. Open `Demo` to get the three draggable files.

1. **Drop a valid file** (F2.1) — Drag `Juno.agent.zip` onto the window (or File › `Import…`, ⌘⇧I).
   - [ ] Overlay `Drop · import this agent` (the one import text, X5), no privacy/reference lines.
   - [ ] Sheet `Import Juno?`: Name `Juno`, Persona `164 words`, Instructions `120 words`, Face `icon`, Knowledge `packed · 48 MB`; `Nothing is added until you press Import.`; no `Stays here`.
   - [ ] `Import` → the sheet closes and the app goes **Home** (from anywhere), Juno's card shows `new here`. No title dot, no auto-open (X30).
   - [ ] The card shows `Studying · about 1 min left` during the import study, then her Sharp lines; it never turns into `Ready` (X9).
2. **Name clash** (F2.2) — Drop `Marcus.agent.zip`.
   - [ ] `You already have Marcus.` with [Replace Marcus] [Keep both] (Keep both is primary).
   - [ ] The line `Replace: your Marcus and his 3 talks go. This can't be undone.` is **always** visible, not only on hover (X31).
   - [ ] `Keep both` → `Marcus 2` appears on Home.
3. **Broken file** (F2.3) — Drop `Old coach.agent.zip`.
   - [ ] `Can't import Old coach.agent.zip` / `This file can't be opened. It's from an older version of Agent Creator, or it's damaged.` / `Details ▸` (monospace reason) / [OK]. Nothing is added.
4. **First open** (F3 → D2) — Click Juno's card.
   - [ ] Talk, First words `Paste the clause that worries you. I'll tell you what it means in plain words.`, face fills in, `First words · 25 Nov`. `new here` is gone on Home.
   - [ ] The Sketch has filled fields with no `new` marks and **no** `Imported from Juno.agent.zip` line (X32).
   - [ ] `What Juno knows`: Sharp `Notice periods and auto-renewal`, Sharp `Liability caps in plain words`, Rough `Employment contracts`, Blank `Tax`; References one row `Packed knowledge from Juno.agent.zip · 48 MB`; Likeness hidden.

## UJ12 · Manage the library

Fresh start.

1. **6 agents, mixed states** (A1)
   - [ ] Kept and imported agents are cards, sorted by latest talk; never-kept ones are rows under `Sketches`; the two never mix.
   - [ ] Card states read in words: Sharp lines + `Last:`, `Studying · …`, `Ready`, `new here`; one mark per card.
   - [ ] Clicking a sketch row (Untitled sketch) opens Sketcher mode with `Back to [Name].`; no mode switch (never kept).
   - [ ] Arrow keys move between cards, Return opens; Tab order cards → sketch rows → New agent.
2. **Rename** — In Rex's Sketch, change the Name field.
   - [ ] The Name field is the only rename (no menu item); the new name shows in the top bar and on Home.
3. **Delete an agent** (A3) — Rex › agent button ▾ › `Delete Rex…` (or File › `Delete Rex Hart…`).
   - [ ] Sheet `Delete Rex Hart?` / `This deletes Rex Hart's 14 past talks and what Rex Hart learned from 186 references. Your files on this Mac aren't touched.` / `This can't be undone.`
   - [ ] `Cancel` has default focus (Return = Cancel); the delete button uses the error colour.
   - [ ] On delete: back to Home, no toast. Ines (studying) adds `Studying stops.`; the untitled sketch reads `Delete this sketch?`.
   - [ ] The File menu item names its target (`Delete Rex Hart…`) and never deletes a talk (X33).
4. **Start a new one**
   - [ ] Home always shows the `New agent` card, also with one agent left (A1.2b); ⌘⇧N works from anywhere (X2).
   - [ ] Dropping files on Home shows the overlay with `for a new agent` and the privacy lines, then a new agent in Sketcher mode (B1).

---

## 13. The Must cuts (from `cuts-eraser.md`)

Eraser counts **17 Musts**; Jony's reply says 15 but marks all 35 Done.
All 17 are listed here.

- [ ] **X1** The mode switch reads `[ Talk | Sketcher ]`; the right pane reads `[ Sketch | What [Name] knows ]`. No screen calls the mode "Sketch".
- [ ] **X2** ⌘N = `New talk` (greyed out outside Talk), ⌘⇧N = `New agent`, the same everywhere. ⌘N in Home or Sketcher mode never makes an agent.
- [ ] **X3** Narrow Sketcher mode has one switch `[ Chat | Sketch | What [Name] knows ]`; narrow Talk has `[ Chat | Past talks ]`. Never two stacked pane switches.
- [ ] **X4** Keep shows only before the first Keep. After a `Not [Name]` fix, a trait change, a top-up or a face change, Keep does not reappear; the change line (and in Talk the divider) says it's live. Export has no "unkept changes" line.
- [ ] **X5** Every reference drop (Home, A2, Talk, Sketcher) shows `Drop · your files stay on this Mac` / `Claude reads them to study`, plus `for a new agent` on Home or `adds to [Name]` inside an agent. Every `.agent.zip` drop shows `Drop · import this agent`. No other drop texts.
- [ ] **X6** Only two labels for adding: `Add a reference for this` (C1 Blank rows, D1 Blank line) and `Add references` (C3, B7, ＋'s label).
- [ ] **X7** On A2, the door is the only visible way to open the file panel; ＋ appears only after the door goes.
- [ ] **X8** The 0/1/2+ rule only at launch; the title link and ⌘↑ always show Home with `New agent`; opening into the only agent = a card click (new talk, Past talks).
- [ ] **X10** No `See what [Name] knows` button anywhere (B4, E1). The map arrives on its own on first view after a batch.
- [ ] **X11** No `Talk to [Name]` on a top-up Finished block. Only the mode switch and the quiz invitation lead to Talk there. (B6's `Talk to Ines →` stays.)
- [ ] **X12** `Stop` has no sheet; it shows `Stopped · n of m studied · Study the rest`.
- [ ] **X15** B7's box is not a button (one action: `Add references`); B6's box is one button with no link inside.
- [ ] **X17** No weak-material (C1.3) or only-Blank (C1.4) state, mock or placeholder in the prototype.
- [ ] **X24** No `Add more on this` anywhere; a Rough row (also after Blank → Rough) is a normal row with `refs ▸`.
- [ ] **X25** Removing a file or a group: no confirm, one `Removed. … · Undo` line; Undo re-studies nothing. No group sheet.
- [ ] **X26** No `Change face…` in the agent menu; the face sheet opens only from the face slot in the Sketch.
- [ ] **X31** In the name clash, `Replace: your Marcus and his 3 talks go. This can't be undone.` is always visible under the buttons.

**Nice cuts** (also checked, one line each):
- [ ] X9 one mark per card, `new here` wins · X13 no stages line · X14 one `Set aside` list, no `Couldn't be read` · X16 one References expander · X18 no pager · X19 `Not [Name]` visible on the latest answer · X20 Blank line has one action · X21 untitled row shows first words, not `New talk` · X22 fix turns under `From your talk · "…"` in the Sketcher chat · X23 fill-in and first line start together · X27 no Palette footer · X28 current face stays first · X29 no save panel on Export · X30 Import goes Home, no title dot · X32 no `Imported from …` line · X33 `Delete Rex Hart…` names its target · X34 one source line, one Study block · X35 `Palette (only you see it)` in Stays here.

## 14. Once across the app

- [ ] **Narrow** (window < 860 px): one pane at a time; Where from and the fix panel open as full views with `✕` back; the update dot (•) shows on switch parts with news.
- [ ] **Reduced motion** (macOS setting on): fades, slides, the underline, the fill-in, the Palette bloom and the map arrival are instant; words and marks stay.
- [ ] **Light / dark** follows macOS; 60% text stays readable on the C8 surface in both.
- [ ] **Focus** never moves on its own; it moves only on `Not [Name]` (to the fix composer), `✕`/Esc (back), and the quiz invitation (to the Talk composer).
- [ ] **Keyboard:** ⌘1 Talk, ⌘2 Sketcher, ⌘↑ Home, ⌘F search (Talk), ⌘E export, ⌘⇧I import, Esc closes a panel or sheet.
- [ ] **Talk errors** (D6, `Claude reachable` off mid-turn): your bubble stays, `Rex can't reach Claude right now.` + banner; Past talks and Where from still work.
- [ ] **Real P1/P2 still work:** making an agent from one line (UJ3) calls the real CLI through `/agents` and `/ask`; it is not mocked.

## 15. Watch-out: things that must NOT happen

Tick **yes** only if it never happened during the whole walk.

- [ ] **No made-up source.** Every Where from, C2 and Likeness reference opens a passage that really contains the claim, with the used words underlined. No chunk ids, no source on an opinion (that's `[Name]'s own view · no reference`).
- [ ] **The map never leaks.** No Sharp / Rough / Blank word, map line or Likeness number appears in an agent's own answer, in the Sketch fields (persona, instructions) or in the export's `Packed` list. The same holds for the Palette.
- [ ] **No silent skips.** Every file not used is in the one `Set aside` list with a reason; the end counts match the design (`296 references studied · 15 set aside`, the damaged video among the 15), and a file that fails during studying moves into `Set aside` with its reason.
- [ ] **No lost learning.** Quitting or sleeping mid-study never restarts from 0 or loses studied files; Stop keeps everything studied.
- [ ] **No removed source in new answers.** After Remove, no new answer cites the file; old talks mark it `· removed`.
- [ ] **No second way to do the same thing** that Eraser cut: no `See what [Name] knows`, no `Talk to [Name]` on a top-up, no `Change face…`, no pager, no ＋ beside the A2 door, no ＋ in the Talk composer, no second pane switch, no Keep after Keep, no save panel on plain Export, no title dot after Import, no Import button on Home, no Rename menu item for agents, no card context menus.
- [ ] **No chat message changes the agent** except through `Not [Name]` (a normal "be blunter" never does), and every change shows a change line or divider.
- [ ] **No private content on screen** where only names belong (laying out and Studying show file names, never contents).
- [ ] **No score feels like a verdict on the person:** no colour or motion on Likeness or study ease, no "great", no gauge, reasons before the number.
- [ ] **No greeting or motion before words in daily Talk**; no greeting ever after First words.
- [ ] **No overwrite:** hand-edited (`✎ yours`) fields never change without the Sketcher asking; an export never silently overwrites a file.
- [ ] **No dead end or dead click:** every button, link and row in this list does something; Home is always reachable.
- [ ] **No real person in the mock:** every demo agent and face is invented (the P2 chip text is the only exception).
- [ ] **No destructive act without its visible consequence line:** delete agent, delete talk, Replace on import.

## 16. Gaps I saw while writing (for Eraser to confirm in the build)

- The demo set has 6 agents, so **A4's 0-agent and 1-agent launch** can only be checked if the build gives a way to start with 0 or 1 agent (for example via `Reset demo` options). C14 doesn't list one. If it's missing, record it rather than adding new UI.
- UJ3 · 3 assumes the prototype's open panel offers **4 demo docs** for Marcus (E1.2); the design names the batch but not the file names.
- The Ines counts in B2 are off by one: after the correction the piles add to 280 + 18 = 298 (+ 14 set aside = 312), but B3 says `297 to study · 14 set aside`. Check that the build's numbers agree with each other on screen; the design's end state (`296 studied · 15 set aside`) is the target.
- `Demo` › `Start UJ2 fresh` is the only way into UJ2 · 1–3 with the demo folder; the seeded Ines starts mid-study (B3.5).
