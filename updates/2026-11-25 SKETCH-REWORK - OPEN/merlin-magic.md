# Merlin: magic for the Profile and DNA switches

For SKETCH-REWORK. Readers: Jony (build), Eraser (cut review), Columbo
(fits the parts). Builds on `columbo-report.md` (cited as D#, W#, Q#),
`update-plan.md`, the team rules in `principles/magic-ux/`, and the
FULL-UX world in `updates/2026-11-25 FULL-UX - OPEN/magic-merlin.md`
(the **portrait studio**; the user is the **witness**).

The CSS for every moment below is already in `src/server/public/magic.css`
(section "SKETCH-REWORK"). Jony only adds and removes classes.

## Summary

- **Profile is the name card on the easel.** Light: no new motion except a
  small "yours" mark when the witness moves a skill chip. Words do the work.
- **DNA is the conservator's look under the paint.** A real painting is
  layers: the surface, the underdrawing, the references on the studio wall,
  and the conservator's condition notes. DNA shows the agent the same way,
  top to bottom: **Instructions → Made from → Looks up → Strong and thin**.
  The layers arrive one after another once (under 400 ms in total), a
  **thread** draws from a line of the instructions to the files behind it,
  and the quality line **settles** once, with no count-up.
- Labels stay plain. The world lives only in microcopy and the order of the
  layers. Nobody needs to know the word "underdrawing" to use it.

## 1. The person and the true job

They open DNA right after a surprise ("where did *the Triad* come from?")
or after adding material ("what did it get from all that?") (D3, D4). The
mood is **doubt or curiosity**, sometimes a sting. The true job is not
"see the data"; it is **"show me it's real, and show me what to add"**.
The fear: a database (D3), a grade (W7), a fake link (insight 3).

Profile is opened in a hurry before a question (D2). The true job is
**"who do I ask?"** in 3 seconds. Magic there must never slow the glance.

## 2. Things in the world that do the same job (show what it's made of, so you trust it)

| # | Source | What maps | Verdict |
|---|---|---|---|
| 1 | **A painting under X-ray / infrared** (conservators see the underdrawing and changes beneath the surface) | Surface = Instructions; underdrawing = the files that shaped them; studio references = files looked up; condition report = quality. Layers in a fixed order, top to bottom. Already our world (portrait studio). | **Chosen.** It explains the order of the four layers better than words, and a condition report is about the *material*, never the sitter (W7). |
| 2 | Food ingredient label | "Made from" fits; but no link from a line to a source, and a label is a list, which is the database fear. | Backup words only ("Made from"). |
| 3 | Rock core sample / strata | Layers fit beautifully; but rock is dead, and "deeper = older" is false here. | Dropped: forced. |
| 4 | Footnotes in a good book | The thread from a claim to its source is exactly D3. But it has no quality layer and no "looks up". | Lends the thread its behaviour (one claim → its source), not its look. |
| 5 | Provenance card in a museum (chain of owners) | Trust through origin. Weak on "what to add next". | Dropped. |
| 6 | A detective's pinboard with string | Thread fits; but it reads as suspicion and is a cliché. | Dropped (and too close to a template idea). |
| 7 | Grandma's recipe card with notes in the margin ("from Aunt Rosa, 1974") | Warm, personal, "made from"; but no RAG idea and no check. | Lends one warm touch: the user's own file names, as they wrote them. |

**Backups if the conservator world is rejected:** (B1) *Footnotes*: DNA
as an annotated page, threads as footnote marks. (B2) *Ingredient card*:
plain "Made from / Looks up" lists with a "freshness" note. Both use the
same CSS classes; only microcopy changes.

## 3. The world, inside DNA

| In the product | In the world (never a label) | On screen (plain) |
|---|---|---|
| Instructions | the paint on the surface | **Instructions** |
| Source files that shaped them | the underdrawing | **Made from** · "12 files shaped these instructions" |
| RAG files | references pinned on the studio wall | **Looks up** · "240 files [Name] reads while answering" |
| Quality analysis | the conservator's condition notes | **Strong and thin** · "about the material, not about [Name]" |
| Instruction → source link | a thread from the paint to the underdrawing | mark on the source row: "behind this line" |
| Study run | still **Studying** (unchanged word) | lives in **Looks up** |
| Dropping a file onto DNA | pinning a new reference | existing overlay line "adds to [Name]" |

- **Success:** "It's from day 2 of the seminar. It's real." (a thread lands
  on a file they recognise).
- **Failure:** a thin spot. It's cheap and has one next step ("Add a
  reference on money").
- **Waiting:** Looks up fills as files are studied. You can leave.
- **Coming back:** DNA opens instantly, no reveal (it's already known).

## 4. The moments

Ranked by impact. Heavy = how much it costs to build and run.

### ★1 DNA layers arrive, top to bottom — "lifting the varnish"

- **What happens:** The first time DNA opens for an agent in an app
  session, the four `.dna-layer` cards fade in and rise 6 px, one after
  another, 70 ms apart (each 200 ms; all four done in about 410 ms).
  Opening DNA again in the same session shows them at once.
- **Means:** what the agent is made of has an order: surface first, then
  what's beneath. The motion *teaches the order* once.
- **Feels:** "Oh, it goes down in layers." Calm, quick.
- **Never:** blocks clicks or typing (the cards are usable from frame one;
  a click into a layer just works).
- **Heavy:** CSS only. **Builds:** Jony adds `.is-revealed` to each layer
  and `style="--dna-i: 0..3"`. Remember per agent per session (a Set in JS
  is enough); later opens skip the class.

### ★2 The thread — "behind this line"

- **What happens:** The user clicks (or focuses and presses Enter on) a part
  of the instructions in layer 1. In **Made from**, every source row behind
  that part gets `.dna-thread.is-active`: a 2 px line draws down its left
  edge (220 ms) and a word mark appears: **behind this line**. Clicking
  another part moves the threads; clicking the same part again, or Escape,
  clears them. Layer 2 scrolls into view only if no active row is visible
  (no forced scroll).
- **Means:** the heart of DNA (insight 3): this line came from that file.
- **Feels:** recognition and trust; or a useful "aha, that's the bad file".
- **Rules:** the thread decorates the *link*, never the source itself: no
  glow on the file name, no quotes animated (W6, "no magic on sources").
  Never colour only: the words "behind this line" carry it. If a part has
  no source, say it plainly in layer 1 under the part:
  **[Name]'s own view · no reference** (existing word). Mock links use the
  agent's real file names only (W8) and keep the mock marker visible.
- **Heavy:** CSS + a click handler. **Builds:** Jony (`threadsFor`).

### ★3 The quality line settles — "the condition notes"

- **What happens:** When layer 4 appears (or after a new study batch), the
  summary line with the score gets `.dna-quality-glow` once: it goes from
  faint to clear with one soft warm wash behind it that fades out (500 ms).
  The number is already final. No counting up, no colour for good or bad,
  same motion for every score.
- **Means:** a verdict that is *done*, read calmly, reasons first.
- **Words (reasons first, number second, one action each):**
  ```
  Strong and thin · about the material, not about Tony
  Strong   Sales talks · 6 Human Needs         from 9 files
  Thin     Relationships · one seminar only    [Add a reference]
  Set aside  2 scanned PDFs, hard to study     [Replace…]
  Overall 72 of 100 · most of it from day 1–3 of the seminar
  ```
  Profile's three rows and this layer read the same data (insight 4).
- **Heavy:** CSS only. **Builds:** Jony adds the class to the summary line
  when it renders new data; remove it on the next render.

### ★4 Profile chips: the witness sorts the skills — "yours"

- **What happens:** Three rows of `.profile-skill-chip`:
  **Good at** · **Medium** · **Not trained for**. Clicking a chip moves it
  to the next row (Good at → Medium → Not trained for → Good at); arrow
  keys or a small menu also work. A chip the user moved gets `.is-picked`:
  it settles in its new row (180 ms) and carries a small ✎ and a quiet
  outline, the same "yours" idea as the Sketch fields. A later study never
  moves a picked chip (hand edits win).
- **Means:** the witness corrects the portrait's caption.
- **Feels:** ownership, a small tidy satisfaction.
- **Words:**
  - Row hints: Good at · "plenty in the material" / Medium · "some in the
    material" / Not trained for · "not in the material yet" (W7: about the
    material, never the person).
  - Empty row: "Nothing here yet." (Good at, Medium) and
    "Nothing missing that we know of." (Not trained for, so empty never
    reads as "can do everything" and never vanishes).
  - After a move, the change line: **Profile: "Money" moved to Not trained
    for · summary only, [Name] answers the same** (Q2 assumption).
  - Screen readers: the chip's label reads "Money, Not trained for, moved by
    you". The ✎ is decoration only.
- **Heavy:** CSS + the move function. **Builds:** Jony.

### ★5 Profile card: face, name, description — no new motion

- Face click opens the existing face picker; the existing
  `body.face-change` crossfade plays everywhere at once (E4). Nothing new.
- Name and description edit in place and autosave. Wrap each in
  `.draft-field` and reuse `.draft-field.edited` for the "✎ yours" bar.
  No new class.
- The prefilled description carries a faint hint until the user edits it:
  **from your instructions**. Once they type, the hint goes.

### Small words for DNA (no motion)

| Spot | Words |
|---|---|
| Layer subtitles | Instructions · "what [Name] is told" / Made from · "12 files shaped these instructions" / Looks up · "240 files [Name] reads while answering" / Strong and thin · "about the material, not about [Name]" |
| Role-builder, no files | Made from · "Made from one sentence, no files yet." [Add a reference] · Looks up · "Nothing to look up yet." (no empty boxes) |
| While studying | Looks up · "Studying · 120 of 297 · you can close the app, it keeps going" (existing words). Paused stays a plain warning. |
| Source row, read-only | "Shown as is. To change [Name], edit the Instructions." (W5) |
| Turn a looked-up file off | switch label **Use**; off row reads "Off · [Name] won't read this" |
| Remove a looked-up file | `Removed. Tony no longer reads "Old seminar.mp4". Your file stays on this Mac. Undo` (W4, existing plain style) |
| Mock data | keep the mock marker visible: "Sample links · real ones come with the next study" |
| Drop onto DNA (other item) | reuse "adds to [Name]"; the drop lands in Looks up |

## 5. No magic here (DNA and Profile)

- Source file names, quotes and file contents: never animated or glowing.
- The score: no count-up, no red/green, no celebration, never alone.
- Remove / turn off a file: plain line + Undo, no fade-away.
- The Profile ↔ DNA switch itself: an instant switch, no slide.
- Errors (a file can't be read, study paused): plain words, one action.

## 6. Names on screen: additions and changes for the word list

Add these to `magic-merlin.md` §6 (Columbo or Jony when applying Phase 4):

| Feature | On screen | Microcopy / marks | Backup |
|---|---|---|---|
| Profile switch | **Profile** | "from your instructions" on a prefilled description | Card |
| DNA switch (replaces the Palette as the "what it's made of" home) | **DNA** | layer order Instructions → Made from → Looks up → Strong and thin | Made of |
| DNA layer 2 | **Made from** | "N files shaped these instructions" | Sources |
| DNA layer 3 | **Looks up** | "N files [Name] reads while answering" | Reads |
| DNA layer 4 | **Strong and thin** | "about the material, not about [Name]" | Check |
| Instruction → source link | (no label) | mark **behind this line** | from this |
| Profile skill rows | **Good at** / **Medium** / **Not trained for** | "plenty / some / not in the material yet" | — |
| Turn a looked-up file on/off | **Use** | "Off · [Name] won't read this" | — |

**Changes, for Eraser to check:**
- **Sharp / Rough / Blank** were the old map levels. Profile's rows now say
  Good at / Medium / Not trained for (the user's words; they were the
  backup names already). One word per thing: inside the Sketch, Sharp /
  Rough / Blank go. They still appear in `block-a/b/d/e.js` and
  `components.js`; Columbo decides whether Home cards and Talk follow now
  or in a later update. Two words for one level on two screens is a W3 risk.
- **Palette** (E5, `.palette-band.bloom`): DNA is now the one home for "what
  [Name] is made of". If the Palette band stays anywhere in the Sketch it is
  a second way (W3). My suggestion: drop it from the Sketch; its bloom CSS
  stays harmless until someone removes the markup.
- **"Persona"** never appears, including in DNA layer 1 (W2).

## 7. All ideas I considered, and the cuts

Kept above: layer arrival once per session · thread on the left edge ·
"behind this line" mark · own view line for unsourced parts · quality
settles with a warm wash · reasons-first quality lines · one action per
issue · chip "yours" mark · chip settle · material-not-person row hints ·
empty row lines · "from your instructions" hint · plain remove + Undo ·
studying lives in Looks up · read-only source line.

**Cut, and why:**
- **An X-ray sweep** (a bright band scanning down the DNA view). Pretty,
  but it is motion on private material and it delays the answer.
- **Layers that peel back like paper.** Needs explaining; slower.
- **Threads drawn as curved SVG lines across the screen** from text to
  file. Heavy, breaks on scroll and resize, unreadable with 12 files.
  The left-edge mark says the same.
- **Score counting up / a ring filling.** Game show; a grade (W7).
- **Chips flying between rows.** Fun twice, slow the 100th time, and FLIP
  animation is heavy. A short settle in place is enough.
- **A paper "pin" sound when a thread draws.** No sound in the app (FULL-UX
  §8), and DNA is a reading room.
- **The agent's face watermark behind DNA.** Decoration; makes the face
  look like the knowledge (cut once already).
- **Hover on a Profile chip shows its files** (Profile → DNA bridge, #12).
  Useful, but a new feature; Profile must stay a glance. Later idea for
  Columbo: "Good at · Sales talks" links to DNA with that skill's threads
  active.
- **A glow on the Instructions layer when DNA opens** ("this is the
  surface"). Means nothing new; the order already says it.
- **Animated progress bar in Looks up.** Lies on big folders (cut before).
- **"Freshly studied" sparkle on newly added files.** Decorating sources.
- **Profile card flip to reveal DNA.** Two switches already exist; a flip
  would be a second way and slows the switch.

## 8. Motion and accessibility

- Durations: layer arrival ≈ 410 ms total, once per agent per session;
  thread 220 ms; chip settle 180 ms; quality settle 500 ms (the number is
  readable from 0 ms at 50 % opacity and full by 150 ms).
- Nothing in `magic.css` takes focus, catches clicks or sets layout.
- `prefers-reduced-motion: reduce`: layers, thread, chip and quality all
  appear at once in their final state. The thread line and the ✎ mark stay
  (they carry meaning), without drawing.
- Never colour only: "behind this line", "moved by you" and the row names
  are words.
- Screen readers: when threads change, announce politely once:
  "3 files behind this line". No announcement for the layer arrival.
- Sound: none.

## 9. Hand-off

**Jony** (`sketch.js`, `components.js`, `app.css`):
- Use the classes in the contract at the top of the SKETCH-REWORK section
  of `magic.css`. Short version:
  - `.dna-layer` on each of the 4 cards, `style="--dna-i: N"` (0..3), add
    `.is-revealed` on first open per agent per session only.
  - `.dna-thread` on each source row in Made from (it marks the row's left
    edge, so the row needs nothing else); add `.is-active` to the rows
    behind the selected instruction part.
  - `.dna-quality-glow` on the summary line of Strong and thin, once per new
    data.
  - `.profile-skill-chip` on each chip; `.is-picked` when the user moved it.
    `magic.css` gives the chip only its mark and motion; its look (pill,
    padding, colours) is yours in `app.css`.
- Words: §4 and §6. Plain labels; the world is in subtitles only.

**Eraser:** check §5 (no magic here) and §6 (Sharp/Rough/Blank and Palette
as possible second ways).

**Columbo:** decide the Sharp/Rough/Blank rename outside the Sketch, and add
§6 to the FULL-UX word list.
