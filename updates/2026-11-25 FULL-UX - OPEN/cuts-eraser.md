# FULL-UX cut review: what to cut, merge or fix before build

*Eraser (Step Eraser), 2026-11-25. For Jony (owns every redesign below),
Columbo (captain). I read `blocks-jony.md`, `design-jony-block-A.md` … `-F.md`,
`magic-merlin.md`, `journeys-columbo.md` and `principles/magic-ux/`. I edited
none of them.*

## How to read this

- **Goal of the app, in one sentence:** "Make someone I can talk to once,
  then ask them things every day and trust the answers."
- Each item has an **ID**, the **block · screen**, **what to cut or merge**,
  **the one path to keep**, **why**, and **Must / Nice**.
  - **Must** = I won't sign off until it's done or Jony gives a solid reason
    (safety, privacy, consent, money, data loss, a journey breaking).
  - **Nice** = fewer steps or less thinking, but the design works without it.
- Jony owns the redesign. Where I suggest a fix it's a direction, not a spec.
- **Trust items I protect** (from the journeys report), and no item below
  weakens them: sources on answers (Where from, own view), the honest
  Sharp / Rough / Blank map, the one-step `Not [Name]` fix, and no silent
  skips.

Overall verdict: **RETURNED, lightly.** The design is lean where it counts:
daily Talk is open → face → type, and the trust items are all there. What's
left is a set of double paths, a few words that mean two things, and three
buttons that exist only to trigger an animation or a state the user already
has. **35 items: 17 Must, 18 Nice.** They're grouped by block, so X33–X35
sit with their blocks, not at the end.

## 1. Step counts on the main paths

Counted from a cold start (app closed) to the job done. A "step" is a click,
a key press, a typed message, a choice, a screen change or a wait the user
has to sit through.

| Journey | Now | Target | What gets there |
|---|---|---|---|
| UJ5 Ask (2+ agents) | 4: open · click face · type · send | 4 | Lean. Approved as is. |
| UJ5 Ask (1 agent) | 3: open · type · send | 3 | Lean. Approved (X8 only clarifies which talk opens). |
| UJ6 Continue a talk | 3: open · `Last:` · type+send | 3 | Lean. |
| UJ7 Fix a wrong note | 8: find `Not Rex` (hover) · click · type · send · read reply · `✕` · ↑ send · read | 7 | X19 makes the action visible on the latest answer (no hunting). |
| UJ2 Make from a folder | 12: drop · read layout · type fix · send · Start studying · wait/leave · come back · **See what Ines knows** · read map · shape · Keep · Talk to Ines | 11 | X10 cuts the button that opens a view you're already in. |
| UJ8 Top up a Blank | 9: `Add a reference for this` · pick · Open · wait · **See what Rex knows** · read `was Blank` · quiz link · send · read | 8 | X10 again. |
| UJ8 · 5 Remove a file | 5: open map view · expand References · expand group · hover row · Remove | 5 | Rare; fine. X25 adds Undo, not a step. |
| UJ9 Change face | 4 from Sketch: click face · Use a photo… · pick · Use | 4 | X26 removes the second door, not a step. |
| UJ10 Export | 5: menu · Export Rex… · read · Export… · Save panel Save | 4 | X29 merges the sheet and the save panel. |
| UJ11 Import | 3: drop · read · Import | 3 | Lean. |
| UJ12 Delete agent | 3: menu · Delete… · Delete | 3 | The confirm protects data. Keep. |
| UJ4 See the map (from Home) | 3: face · Sketch mode · `What Rex knows` tab | 3 | Rare-ish; fine. |

## 2. The cut list

### Shared frame and words (blocks-jony.md)

**X1 · Shared · top bar mode switch `[ Talk | Sketch ]` + right-pane switch `[ Sketch | What Rex knows ]`** — **Must**
- **Problem:** "Sketch" names two things on one screen, all the time after
  Keep. On the `What Rex knows` tab the mode switch still says Sketch is on,
  the pane says it isn't. One word, two meanings (design rule 1).
- **Cut:** the word "Sketch" as the mode name.
- **One path to keep:** the right pane keeps `Sketch` (P2, shipped). Rename
  the **mode** after who is in the left pane. My suggestion: `[ Talk |
  Sketcher ]` (already on Merlin's list, and the rule "anything that
  changes the agent happens with the Sketcher in the room" then reads off
  the switch). Jony and Merlin pick the word; add it to Merlin §6.
- **Why:** the user should never have to work out which "Sketch" is meant.

**X2 · Shared · keyboard: ⌘N** — **Must**
- **Problem:** ⌘N is `New agent` on Home (A1) and `New talk` in Talk (D4).
  In Sketch mode it's undefined. One key, two actions, decided by where you
  are.
- **One path to keep:** one shortcut per action, the same everywhere.
  Suggestion: ⌘N `New talk` (the daily job), ⌘⇧N `New agent` (rare). In the
  macOS menu bar, `New talk` is greyed out outside Talk.
- **Why:** muscle memory must not delete context ("I pressed ⌘N in Talk and
  got a new agent").

**X3 · Shared §4.3 · narrow layout switches** — **Must**
- **Problem:** in narrow Sketch mode the user sees three stacked switches:
  the mode switch (`Sketch`), the pane switch `[ Chat | Sketch ]`, and the
  inner `[ Sketch | What Rex knows ]`. "Sketch" three times. In narrow Talk
  the pane switch `[ Talk | Past talks ]` reuses the mode word "Talk".
- **Merge:** narrow Sketch mode gets one three-part switch `[ Chat | Sketch |
  What Rex knows ]`. Narrow Talk uses `[ Chat | Past talks ]` (same word as
  in Sketch mode for "the conversation pane").
- **Why:** two switches where one does the job; words that collide.

**X4 · Shared F8, B6, D5, E2, E4, F1.5 · Keep after the first Keep** — **Must**
- **Problem:** after a `Not Rex` fix (or a Palette trait change) the change
  is live in Talk at once, *and* the Keep button reappears in the Sketch.
  So what does Keep do now? Nothing the user can notice. It suggests "the
  fix isn't saved until you press Keep", which is false. It also differs by
  change type (a voice fix shows Keep, a knowledge top-up doesn't, a face
  change doesn't). F1.5 then needs an extra line to explain it in Export.
  That's two saves for one thing (design rule 2) and the finish word reused
  for a smaller thing (rule 1).
- **Cut:** Keep reappearing on a kept agent; F1.5's line.
- **One path to keep:** Keep is a one-time act (sketch → agent, sets
  `keptAt`). After that, every change is live and saved, said by the change
  line and, in Talk, the redrawn divider. The way back is "put it back" to
  the Sketcher (OQ3), unchanged.
- **Why:** autosave already does the job. This touches P2's `status:
  'draft'` rule; if that can't change in code, hide Keep when `keptAt` is
  set and leave `status` alone.

**X5 · Shared, A1.5, B1, F2 · drop overlay texts** — **Must**
- **Problem:** there are four drop texts for two actions. Reference drops:
  A2/B1 `Drop · your files stay on this Mac · Claude reads them to study`,
  A1.5 adds `Start a new agent from these`, and the Talk drop
  `Drop · add to Rex Hart's references` **loses the privacy line**. Import:
  A1.5 `Drop to import` and F2 `Drop · import this agent`.
- **One path to keep:** one reference overlay everywhere: the privacy line
  always, plus one context line only where the target isn't obvious (`for
  a new agent` on Home, `adds to Rex Hart` inside an agent). One import
  overlay text, used everywhere.
- **Why:** the journeys' watch-out says privacy has to be visible "where
  people drop files", and that means every drop, not most of them. The
  same action gets the same words.

**X6 · Shared words · "add references" labels** — **Must**
- **Problem:** one action has four labels: `Add a reference for this` (C1),
  `Add a reference` (D1 Blank line), `Add references` (C3, B7, ＋'s aria
  label), `Add more on this` (E2.2, see X24).
- **One path to keep:** two labels only. `Add a reference for this` when it
  belongs to a topic (C1 Blank rows, D1 Blank line), `Add references` when
  it doesn't (C3, B7, ＋).
- **Why:** one word per action (design rule 1).

**X34 · Shared components · merge two pairs** — **Nice**
- **Merge 1:** the Where from line and the own-view line (C4/D1) are one
  "source line" component with two variants (links vs. plain text). Same
  slot, same style, same timing.
- **Merge 2:** the B3 Studying block and the B4 Finished card are one
  "Study block" built on C9 (it already lists `studying · paused ·
  finished`). One component, one set of states, one `aria-live`.
- **Why:** fewer components to build and to keep consistent; no change on
  screen.

### Block A · Home and first run

**X7 · A2 First run · the references door and ＋ on the same screen** — **Must**
- **Problem:** on first run there are two visible buttons that open the
  same macOS panel: the dashed door and the composer's ＋.
- **One path to keep:** the door, while it's shown. The ＋ appears when the
  door goes away (after the first message or the first references), so
  there's always exactly one visible way in.
- **Why:** two buttons for one action on one screen. On first run the door
  is the one that explains itself.

**X8 · A4 / A1 · Home with one agent, and which talk opens** — **Must**
- **Problem:** A1 lists "a home screen with one agent" as removed, but the
  title link and ⌘↑ go Home from inside any agent. With one agent, is Home
  shown? If not, `New agent` (now only on Home, F3) can't be reached:
  UJ12 · 3 dead-ends. Also, when the app opens straight into the only agent,
  it doesn't say whether that's a new talk or the last one.
- **One path to keep:** the 0 / 1 / 2+ rule applies **at launch only**.
  Going Home on purpose always shows Home, with any number of agents.
  Opening straight into the only agent behaves exactly like a card click
  (a new talk, Past talks on the right).
- **Why:** a dead end, and one entry point that behaves two ways.

**X9 · A1 card states · never two marks on one card** — **Nice**
- **Problem:** an imported agent first studies its packed knowledge (F3),
  so it could show `new here` and then `Ready` on the same card. Both say
  "something here you haven't seen".
- **One path to keep:** a card shows one mark at most, and `new here` wins.
  `Ready` stays for agents you made and are waiting on.
- **Why:** one signal per meaning.

**X33 · A3 · File › Delete** — **Nice**
- **Problem:** in Talk, with a talk selected in Past talks, a menu-bar item
  called just "Delete" could mean the talk or the agent.
- **One path to keep:** the menu-bar item reads `Delete Rex Hart…`, the
  same as the agent menu.
- **Why:** a destructive item must name its target.

### Block B · Make

**X10 · B4 / E1 · cut `See what [Name] knows` on the Finished card** — **Must**
- **Problem:** the Finished card sits *inside* the `What [Name] knows`
  view (C1 section 1). Its primary button opens the view the user is
  already in; it only exists to start the map arrival. The notification
  click opens this view too. E1/E2 repeat it for top-ups.
- **Cut:** the button.
- **One path to keep:** the first time the view is visible after a batch
  finishes, the map arrives (once per batch, as specced). The Finished
  card becomes a summary: `Finished studying · 297 references studied ·
  14 set aside ▸`, with no primary button. It collapses to the one-line
  form after the first visit.
- **Why:** a step whose only job is to start an animation. −1 step on UJ2
  and on UJ8.

**X11 · B4.3 / E1 · cut `Talk to Rex` on the top-up Finished card** — **Must**
- **Problem:** for a kept agent the mode switch is already one click away
  in the top bar, and E2's quiz invitation also goes to Talk (with a
  better reason). That makes three doors to Talk on one screen.
- **One path to keep:** the mode switch, plus the quiz invitation when a
  line moved.
- **Why:** a double path. (B6's `Talk to Ines →` stays; see §3.)

**X12 · B3.9 · cut the Stop studying sheet** — **Must**
- **Problem:** `Stop` asks "are you sure?", but stopping loses nothing.
  The design keeps everything studied and offers `Study the rest`.
- **One path to keep:** `Stop` stops at once and shows
  `Stopped · 251 of 297 studied · Study the rest`. That line *is* the undo.
- **Why:** a confirmation for an action that can be undone. Keep `Stop`
  itself: it's the user's control over time and Claude usage.

**X13 · B3 · merge the stages line into the Studying line** — **Nice**
- **Problem:** the block shows the stage and the count twice: `Studying ·
  Day 3 … (listening) · 251 of 297`, then `✓ reading 239 · ● listening
  12 of 58 · ○ studying`. That's two counters to compare.
- **One path to keep:** the Studying line and the time line. If the stage
  plan matters, add it to the time line (`about 25 min left · listening is
  the slow part`), not as a third line.
- **Why:** less reading in the screen people watch while anxious.

**X14 · B2 / B4 / C9 / C12 · merge `Couldn't be read` into `Set aside`** — **Nice**
- **Problem:** two lists, two words, one meaning ("this file isn't used").
  `Workbook.pages` is "set aside" because it can't be read, while `Day 2 –
  Part 4.mp4` is "couldn't be read". The user can't tell why one is which.
- **One path to keep:** one list, `Set aside · 15 · why ▸`, which can grow
  during studying. The reason on each row says what happened (`damaged: no
  sound track found`). The Finished summary names one count.
- **Why:** no silent skips stays fully intact (every file listed with its
  reason), with one word instead of two. If Jony keeps both words, give a
  reason the user needs the split.

**X15 · B7 · one target in the one-line Keep card box** — **Must**
- **Problem:** the box is a button (→ `What Marcus knows`) and also holds
  the link `Add references`. That's a link inside a button: two targets
  stacked, and invalid for screen readers.
- **One path to keep:** in B7 the box isn't a button; its one action is
  `Add references`. B6 keeps the whole box as one button (no inner link).
- **Why:** one target per thing; no nested controls.

### Block C · Know

**X16 · C1 References · one expander, not two** — **Nice**
- **Problem:** `186 references ▸` and `Sampled 12 files · 9 easy, 3 hard ▸`
  open two lists of overlapping files.
- **One path to keep:** one row `References · 186 · 3 hard to study ▸`.
  Expanded, it shows the hard-to-study files first (with reasons), then the
  piles. Easy files carry `Easy to study` on their own rows (C12 already
  has the slot).
- **Why:** one list of the user's files, not two. UJ4 · 3 is still served
  in one click.

**X17 · C1.3 · cut the "weak material" state from the prototype** — **Must**
- **Problem:** no demo agent and no journey step uses it (Jony says so).
- **Cut:** the C1.3 state, its mock and its placeholder line from the
  prototype scope. The general rules (words not colours, reasons first)
  already cover a weak map in the real build.
- **Why:** "no journey step, no screen" (design rule 6).

**X18 · C7 / D3 · cut the `‹ 1 of 3 ›` pager** — **Nice**
- **Problem:** in Talk, every source is its own link in the Where from line,
  and the line stays visible on the left. In C2, the references are a list
  right behind `←`. The pager is a second way to reach the same passages.
- **One path to keep:** click the source you want (in the line, or in the
  C2 list). With the panel open, clicking another source swaps it.
- **Why:** a double path, and one less control in the panel header.

### Block D · Talk

**X19 · D1 · `Not [Name]` findable without hunting** — **Nice (strong)**
- **Problem:** the fix is a trust pillar, but it only appears on hover. A
  user who has just heard a wrong note has to discover a control they've
  never seen.
- **One path to keep:** `Not Rex` stays at 60% on the **latest** agent
  message, and stays hover-only on older ones. It's still the one action,
  and still quiet.
- **Why:** one less thing to figure out in a frustrated moment (UJ7 8 → 7
  steps). This leans against Merlin's "quiet when" rule, so if Jony and
  Merlin keep hover-only, give the Phase 7 test (can a first-timer find it
  in 10 s?) and I'll accept the result.

**X20 · D1 · the Blank line gets one action** — **Nice**
- **Problem:** the strip has two links: `Blank in what Rex knows` (→ map)
  and `Add a reference` (→ add). The user's next move from a gap is to fill
  it; the map is one switch away anyway.
- **One path to keep:** `Blank in what Rex knows` as plain text, and
  `Add a reference for this` (X6) as the only action.
- **Why:** one action per line, like every other part of a message.

**X21 · D4 · the `New talk` placeholder title** — **Nice**
- **Problem:** `New talk` is the header button and also the grey title of
  an untitled row, so the same words point to two different things in one
  pane.
- **One path to keep:** an untitled row shows the first words of the
  user's message (60%) until the topic title arrives.
- **Why:** one word, one meaning.

**X22 · D5 · say where the fix conversation lives** — **Nice**
- **Problem:** "the real P2 Sketcher, same session". So does the fix turn
  appear later in Sketch mode's chat? The design doesn't say. If it shows up
  there unannounced, the user wonders where it came from. If it's missing,
  the Sketch's `from your talk` tag has no trail.
- **One path to keep:** pick one and write it down. My suggestion: the fix
  turns appear in the Sketcher chat under a divider `From your talk ·
  "How do I get started…"`, the same divider pattern as D1.
- **Why:** fewer steps must not mean more guessing.

**X23 · D2 · First words: no wait before the line** — **Nice**
- **Problem:** the face fills in for 0–600 ms, *then* the first line
  streams. That puts motion before the first words, which the world rules
  forbid for Talk. It's once per agent, but it's still a wait. Also, offline,
  the once-ever fill-in plays without First words, so the moment is used up.
- **One path to keep:** fill-in and stream start together. The fill-in
  plays only when First words actually arrive, so offline, the face stays
  an outline until then.
- **Why:** no wait before words; the once-only moment isn't wasted.

### Block E · Grow

**X24 · E2.2 · cut `Add more on this`** — **Must**
- **Problem:** a new label, not in Merlin §6, on Rough rows only, and only
  on the visit after a move. Every other Rough row has `refs ▸`.
- **One path to keep:** a Rough row is a Rough row (`refs ▸`). Adding goes
  through ＋ or drop, as for any other topic.
- **Why:** one word per action; one row type behaves one way.

**X25 · E3 · Remove: Undo instead of "add it back", and no group sheet** — **Must**
- **Problem:** Remove is a 13 px hover button with no confirm, and the only
  way back is to find the file again and re-study it. For `Old seminar
  2009.mp4` (1.4 GB) that's minutes of study time and maybe a lost path. A
  group removal does get a confirm sheet. So the same action has two
  patterns.
- **One path to keep:** one pattern for a file and for a group: no confirm,
  and the removal line gets `Undo` for this visit:
  `Removed. Rex no longer uses "Old seminar 2009.mp4". · Undo`. Undo
  restores the kept study (nothing re-studied). The group sheet goes.
- **Why:** my rule is undo over "are you sure?". The user's study time is
  worth protecting, and one pattern replaces two. (Jony's "Undo is a second
  way" doesn't apply: Undo isn't a second way to remove, it's the only way
  back.)

**X26 · E4 / agent menu · cut `Change face…` from the agent menu** — **Must**
- **Problem:** there are two ways to open the Face sheet: the face slot in
  the Sketch, and the menu. The menu works from Talk, but E4 writes a change
  line "in the chat", and it isn't said which chat. In Talk it would break
  "only the Sketcher changes the agent".
- **One path to keep:** click the face slot in the Sketch. The agent menu
  becomes `Palette · Export Rex… · Delete Rex…`.
- **Why:** a double path, and the second door leads to an undefined state.

**X27 · E5 · Palette footer line** — **Nice**
- **Problem:** the header already says `Palette · what Rex is mixed from`,
  and the footer `Mixed from 186 references and 4 traits.` says it again.
- **One path to keep:** keep the footer's numbers by moving them into the
  header (`what Rex is mixed from · 186 references, 4 traits`), and drop
  the footer.
- **Why:** less reading, nothing lost.

**X28 · E4 · `Draw three more` must not lose the current face** — **Nice**
- **Problem:** "the old three are gone". If the current face was one of
  them, the radio group loses its selected item, and the user can lose the
  face they had.
- **One path to keep:** the current face always stays as the first choice.
  `Draw three more` replaces only the others.
- **Why:** no hidden loss; no "where did my face go?".

### Block F · Share

**X29 · F1 · merge the Export sheet and the save panel** — **Nice**
- **Problem:** `Export Rex…` → sheet → `Export…` → the macOS save panel →
  Save. That's two dialogs in a row.
- **One path to keep:** the sheet shows the honest list *and* where it goes:
  `One file: Rex Hart.agent.zip · Desktop · Change…`. The primary `Export`
  writes it at once. `Change…` opens the save panel only when asked.
- **Why:** −1 dialog on the common path. The Packed / Stays here list,
  the trust part, is still seen before anything is written.

**X30 · F2.1 · after Import, show it; drop the title dot** — **Nice**
- **Problem:** importing from inside an agent leaves the user there and adds
  a new mark, the update dot on the `Agent Creator` title. The user then has
  to notice the dot and go Home.
- **One path to keep:** Import closes the sheet and goes Home, where Juno's
  card shows `new here`. That's not an auto-open (the agent isn't opened).
- **Why:** the user just asked for this agent; showing it is the answer.
  One mark (`new here`) instead of two.

**X31 · F2.2 · Replace's warning visible, not hover-only** — **Must**
- **Problem:** `Replace Marcus` deletes an agent and its talks, but the
  consequence line shows only on hover or focus. A click with no hover (a
  trackpad tap straight on it) replaces without the warning ever being
  seen.
- **One path to keep:** the line `Your Marcus and his 3 talks go. This
  can't be undone.` is always shown under the buttons in the clash state.
  Still one click, and no second confirm.
- **Why:** a safety step can be made light, but it can't be hidden. A
  visible step mustn't turn into a hidden one.

**X32 · F3 · cut the `Imported from Juno.agent.zip` line in the Sketch** — **Nice**
- **Problem:** a third "this is new" signal (after `new here` and First
  words) that no journey step needs.
- **Cut:** the line, and the word from Merlin §6.
- **Why:** no journey step, no UI.

**X35 · F1 · say where the Palette goes** — **Nice**
- **Problem:** the export lists Name, Persona, Instructions, Face and
  Knowledge as Packed, and the map and talks as Stays here. The Palette and
  its trait values appear in neither. Merlin's check (3) asks that the
  Palette never leaks into the export.
- **One path to keep:** add `Palette (only you see it)` to Stays here (trait
  sentences already live in the persona, which travels).
- **Why:** the honest list has to be complete, or it's not honest.

## 3. Checked and kept (so nobody re-argues them)

- **A1 `Last:` link on the card.** It looks like a second door, but it serves
  a different job (continue vs. new problem) at 8/7 frequency. One click
  saved. Keep.
- **B6 `Talk to Ines →` on the Keep card.** It's shown once, at the moment
  Talk is born, and it leads to First words. The mode switch appears at the
  same time, but people won't have learned it yet. Keep.
- **B2 `Start studying` as a button, not chat.** Consent to a long run that
  uses Claude. Keep (F4), with the one-pile exception.
- **A3, D4 delete sheets.** Data loss; one plain confirm with the target
  named. Keep.
- **D5 `✕` to close the fix panel, prefill not sent.** The user may want a
  second round of fixing, and the prefill lets them edit. Keep.
- **The path-in-composer way in (B1).** The journey asks for it, and the A2
  door shows it. Keep.
- **Drop in Talk switching to Sketch.** It follows the "changes happen with
  the Sketcher" rule, and the user just acted. Keep (with X5's text).
- **Palette in the agent menu only.** A rare delight view, so a menu is the
  right weight. The B3 strip isn't a second door (it isn't clickable). Keep.
- **Likeness `8 of 10`.** It comes last, plain and small, after the reasons.
  Keep.
- **Merlin's four checks:** (1) `Not [Name]` is the only way chat changes
  the agent: ✓ (the Palette works in Sketch mode, through a visible
  Sketcher message). (2) Nothing on the daily Talk path waits before the
  first words: ✓ (First words: see X23). (3) The map and Palette never
  reach the agent or the export: the map ✓, the Palette not yet written
  down (X35). (4) No score has motion or colour: ✓.

## 4. Sign-off checklist

I'll call the design clean when every line below is true in Jony's files:

1. **One word, one meaning.** No on-screen word names two things on the
   same screen (X1, X3, X21). Every new word is in Merlin §6, and words not
   used anywhere are removed (X24, X32).
2. **One way per action.** Each action has one visible control per screen,
   plus at most the macOS menu-bar mirror (X7, X11, X18, X26). One label per
   action everywhere (X6).
3. **One shortcut per action,** the same in every mode (X2).
4. **No button opens what's already open** or exists only to play an
   animation (X10).
5. **Keep happens once.** After the first Keep, changes are live and the
   change line or divider says so. No second "save" (X4).
6. **Undo over "are you sure?"** for anything reversible (X12, X25). A
   visible, one-step confirm stays for real loss (A3, D4, F2.2). Its
   consequence is visible without hover (X31).
7. **No dead ends.** Home is always reachable and always shows `New agent`.
   Every entry point behaves like the others (X8).
8. **Privacy at every drop.** Every reference drop overlay says the files
   stay on this Mac and Claude reads them. One text per drop kind (X5).
9. **Trust items intact:** Where from and own-view lines on every answer
   that needs them. The Sharp / Rough / Blank map in words, with sources per
   line. `Not [Name]` one step from any answer, and findable (X19 or its
   test). Every skipped or failed file listed with a reason, in one list
   (X14).
10. **No motion before words in Talk,** First words included (X23).
11. **Every screen and state points to a journey step.** States with none
    are gone from the prototype (X17). The coverage tables in
    `blocks-jony.md` §3 still give every journey step exactly one screen,
    after the cuts (UJ2 · 6–7 and UJ8 · 3 change with X10).
12. **Every item above has a line in `cuts-jony-reply.md`:** Done, Changed
    (how) or Kept (why). Each Must is Done or carries a solid reason.
