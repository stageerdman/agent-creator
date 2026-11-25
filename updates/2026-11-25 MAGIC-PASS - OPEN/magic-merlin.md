# Merlin: the magic moments and the words (MAGIC-PASS)

For Jony (build), Eraser (cuts), Columbo (fits the parts). Built on
`research-columbo.md` (cited as O#, M#, W#, Q#), `principles/magic-ux/`,
the FULL-UX world (`updates/2026-11-25 FULL-UX - OPEN/magic-merlin.md`)
and my SKETCH-REWORK notes (`merlin-magic.md`). No app code changed here.

## 0. In one breath

- **The world stays the portrait studio. The user is the witness.** Labels
  stay plain; the world lives only in microcopy, marks and motion.
- **The creation moment is one arc in five beats:** the first line → the
  first lines of the portrait appear → it gets a name → Keep (the
  signature) → the first words (the meeting). The ceremony is at the
  **first words**, not at Keep (M5).
- **Magic plays where the eye is (W1), once per agent for big things, and
  the same small way every time for repeated things (W4).**
- **The words carry the scale, not the motion (W5, Q7).** A blunt editor
  and a clone of a beloved teacher get the same motion; their own name and
  first words make it feel big or small.
- **Never pretend (W2).** No ceremony on a placeholder. The demo line
  "(Demo) First words would be here." goes.
- Every effect is under 600 ms (only the creation arc as a whole is
  longer, and it never waits on the user), behind
  `prefers-reduced-motion`, and a click always wins at once (W10).
- **Sound: none.** The app has no sound (FULL-UX §8). Nothing here needs
  one.

## 1. Decisions on Columbo's open questions

| Q | Decision | Why |
|---|---|---|
| **Q1** Where do Instructions show while sketching? | **Until Keep, the Sketch opens on DNA** (Instructions are layer 1, at the top). **After Keep, it opens on Profile.** The narrow view does the same (`#view-knows` before Keep, `#view-sketch` after). The empty DNA layers below Instructions (Made from, Files, Looks up, Strong and thin) collapse to one quiet line each while there is nothing in them. | The person needs to *see* the portrait forming (M4). Showing the forming text in Profile too would be a second home for Instructions (W3). One choice fixes O1 and the hidden first-sketch glow. |
| **Q2** Real faces for real agents? | **This pass: the letter face, in two honest states.** While a sketch: the outline letter (already used in `sketchRow`). At Keep: it fills in (reuse `.face.fill-in`). No generated faces, no celebration on a letter beyond that 300 ms fill. A photo path ("Choose a photo…" in the face picker, or a photo dropped on the face) is **nice**, and only if `E.facePhotoDrop` can store a face for a real agent; if it needs server work, Jony writes it down and skips it. | A letter that turns from pencil to ink is true (it *is* kept now). A big face reveal on a letter would make the gap louder (W2). |
| **Q3** Real First words? | **Must (no server work):** the agent's **first answer to the user** is the First words. Above it sits the mark **First words · 25 Nov**. Before the first message, the Talk composer says **Say hello to Clara…** and the log is empty. **Nice (needs one CLI call):** the agent speaks first, from its instructions, when Talk opens for the first time. If built, it uses the same mark and the "held breath" (§3, beat 5). | The fallback is honest and still a real first meeting. The demo placeholder dies either way. |
| **Q4** After Keep? | **No new button, no jump.** The top-bar **Talk** tab beckons once (an underline draws in, then stays still until Talk is opened), and the Keep card adds one plain line: **Say hello in Talk, at the top.** (text, not a link). | One way to Talk (the mode switch). The effect points where the next step is, which fixes O4. |
| **Q5** Drop on Home with no words? | **Wait for a line, and say what it waits for.** The creator's empty state changes its question to **312 files are in the DNA. Now say who this is, in one line.** The chips hide (they'd ignore the files). | Beat 2 needs words; the files alone don't say who. One line, honest. |
| **Q6** Name before or after the description? | **Description first, name as the reveal.** The Instructions' first lines appear in DNA, then the name settles in the top bar about 150 ms after the last line has landed. | "Who is it" comes before "what's it called". The name is when "it" becomes "her". |
| **Q7** Second agent, same ceremony? | **Same motion for every agent.** The scale comes from the agent's own name and words. | A smaller ceremony would read as "less special"; a bigger one wears out by the third agent. |

## 2. The world, where it touches these screens

| In the product | In the world (never a label) | On screen |
|---|---|---|
| First line | the sitter's first description, said aloud to the painter | composer |
| First sketch landing | the first lines on the canvas | **Instructions** fill in DNA |
| Outline letter face | a pencil sketch | outline face |
| Keep | signing the canvas | **Keep** → **Kept ✓**, face goes from pencil to ink |
| First words | the portrait looks up and speaks | mark **First words · [date]** |
| Not [Name] + fix | the witness says "that's not him", the painter redraws | **[Name] was redrawn** |
| Files dropped | references pinned on the studio wall | **Files** layer, one receipt |
| Ready after a study | back from the studio, finished | mark **Ready** |

## 3. ★ The creation moment, step by step (f-creating-a-soul-the-magical-creation-mom)

The whole arc plays **once per agent**. Each beat has **one lead effect**
(W3). Everything else in that second stays still.

```
Beat 1  "Who should this agent be?"  →  [a tough-love coach…]  ⏎
Beat 2  DNA · Instructions     ░░░ lines appear, top to bottom ░░░
Beat 3  top bar: New agent → Clara        face: ( C ) pencil outline
Beat 4  [ Keep ]  →  Kept ✓     ( C ) → (●C) ink     Talk ﹍ beckons
Beat 5  Talk:   ── First words · 25 Nov ──   Clara: "…"
```

### Beat 1 · The first line (creator, empty state `#empty`)

- **Moment:** they type a line or press a chip, then Enter.
- **Motion:** the empty question (`#empty`) fades out, 180 ms, ease-out,
  as their message lands in `#log`. Chips: no fly, the chip's text simply
  fills the composer (already so).
- **Words:** keep **Who should this agent be? One line is enough.** and
  the three chips. Sketcher waiting: **Sketching…** (in the chat and the
  `#sketch-title`, unchanged).
- **Right pane while the first turn runs:** DNA is open (Q1). Instructions
  shows the existing `aria-busy` shimmer; **only on the Instructions
  field**, not on name, description or other layers (W3). Placeholder
  stays **Appears after your first message**.
- **Why:** saying a wish out loud is a small risk. The question steps
  aside quietly so their line is the only thing on stage.
- **Rank:** must (the fade is tiny; the shimmer limit is the real work).
- **Reduced motion:** the question is gone at once.
- **Hook:** `#empty.is-leaving` (180 ms fade), then `hidden`.
- **Weight:** CSS + one class.

### Beat 2 · The first lines appear (DNA · Instructions) — lead effect of the creator

- **Moment:** the first Sketcher turn ends and the first draft arrives.
- **Motion:** the paragraphs of `#f-instructions` fade in top to bottom
  (reuse `.draft-field.filling`, 80 ms apart, 200 ms each, **cap the
  total at 600 ms**: after the 5th paragraph the rest appear together).
  Then **one** warm wash behind the Instructions field, 500 ms,
  ease-out, fading from `--accent-soft` to clear: `.first-sketch`.
  The usual nudge glow (`.draft-field.updated` 600 ms + 4 s bar) does
  **not** play on this first draft; it starts with the second turn.
- **Words:** the change line under the Sketcher's reply reads
  **First sketch · Instructions** and opens DNA (it's already open). Not
  "Name: Clara" first (O1). The other empty layers each show one quiet
  line: Made from **Made from one sentence, no files yet.** · Files
  **Drop files or folders here. They stay on this Mac.** (existing) ·
  Looks up **Nothing to look up yet.** · Strong and thin: hidden until
  there's material.
- **Why:** "I typed one sentence and someone was already there." The
  portrait forms in one place, where the eye is, in reading order.
- **Rank:** must.
- **Reduced motion:** text appears at once; the wash becomes a still
  2 px accent bar on the left of the field for 2 s, then goes, plus the
  change line (meaning kept by words).
- **Hook:** `.draft-field.first-sketch` (on the Instructions wrapper),
  once per agent (`agent.firstSketchAt` or a Set in JS; only when the
  previous Instructions were empty).
- **Weight:** CSS + one flag.

### Beat 3 · It gets a name (top bar + Profile)

- **Moment:** the same turn's name lands, ~150 ms after the last
  Instructions line (sequence it in JS: add the class after the fill
  finishes; if the user clicks anything, show it at once).
- **Motion:** `#switcher-name` cross-fades **New agent → Clara**: the old
  word fades out 120 ms, the new one fades in and rises 3 px, 240 ms,
  `cubic-bezier(.2,.7,.2,1)`. The face next to it appears as the **pencil
  outline letter**, its stroke drawing in 400 ms (outline only, no fill).
- **Words:** no new words. The name itself is the reveal. In Profile,
  `#f-name` holds it with the hint **from your instructions** under the
  description (existing, from SKETCH-REWORK).
- **Why:** this is when "it" becomes "her". A name settling in like ink
  on a card.
- **Rank:** must (name), nice (stroke drawing; a plain fade is fine).
- **Reduced motion:** the name and outline face are there at once.
- **Hooks:** `#switcher-name.name-arrive`; `.face.outline.is-drawn`.
  Only the first time a name appears for this agent; a rename later is
  instant (a rename is the user's own hand: no motion, hand edits win).
- **Weight:** CSS + one class each.

### Beat 4 · Keep, the signature

- **Moment:** they press **Keep**.
- **Motion, in order:**
  1. 0 ms: existing `.keep-btn.saving` breathe while it saves. Nothing
     else moves.
  2. Success: button becomes **Kept ✓** and hides (existing). The existing
     `.agent-born` ring (700 ms) and `.keep-card` settle (200 ms) play.
     The Sketch switches to Profile (Q1) **before** the ring, so the
     ring plays on the pane the person now sees.
  3. Same frame: the faces of this agent (top bar, Profile `#face-slot`,
     Keep card) go **pencil → ink**: reuse `.face.fill-in`, but at
     300 ms ease-out (not 600).
  4. +300 ms: the top-bar **Talk** tab (`#mode-talk`) beckons: a 2 px
     underline draws left to right, 400 ms, ease-out, then **stays
     still** until Talk is opened once for this agent.
- **Words** (Keep card, `#keep-card`):
  ```
  Clara
  A tough-love coach who asks one hard question at a time.
  Yours. You can keep changing it.
  Say hello in Talk, at the top.
  ```
  The last line is plain text (`.keep-next`), not a link or button.
  Keep failed stays plain: **Couldn't keep · Try again** (no motion).
- **Why:** signing a canvas is short and final in a good way. The relief
  ("I can still change her") is in words. The underline turns the
  emotional peak toward where the next step is (O4), without a second
  Talk button.
- **Rank:** must (switch to Profile, ink, beckon, words); the ring is
  already built.
- **Reduced motion:** no ring, no settle; the face is inked at once; the
  Talk underline is drawn at once and still. The words do the pointing.
- **Hooks:** `.face.fill-in` (shorten in `magic.css`), `#mode-talk.beckon`
  (remove on first Talk open for this agent), `.keep-next` text.
- **Weight:** CSS + two classes + one line in `index.html`.
- **Note:** today `B.afterKeep` returns early for real agents
  (`mockAgent` only). The switch to Profile, the ink and the beckon must
  run for **real** agents too: put them in `app.js keep()` after
  `takeDraft`, not in the demo hook.

### Beat 5 · The first words — the peak

- **Moment (must, no server work):** they open Talk for the first time.
  The log is empty; the face sits at the top, inked. They type hello. The
  agent's **first answer** is the First words.
- **Motion:** above that first answer, the divider **First words · 25 Nov**
  fades in, 250 ms (reuse `.voice-card.first-voice` timing). The answer
  then streams at full speed, like every Talk answer (speed is the magic,
  M1). The beckon underline on `#mode-talk` goes away (opened).
- **Moment (nice, needs one CLI call, Q3):** if real first words exist,
  the agent speaks first when Talk opens: the divider fades in, then a
  **held breath of 400 ms**, then the line streams. This is the one place
  in the app where a pause is on purpose: nobody is waiting on an answer,
  the agent is taking a breath before speaking. Typing cancels it and
  shows the line in full (existing behaviour in `block-d.js`).
- **Words:**
  - Composer before the first message: **Say hello to Clara…**
  - The mark: **First words · 25 Nov** (existing word, date as `dayMonth`).
  - The demo line **(Demo) First words would be here.** is **removed**
    (W2). No placeholder ever shows in its place.
- **For portraits of real people (W6):** no "born", "alive" or "soul"
  anywhere. The mark says *First words*, not "He speaks".
- **Why:** "She spoke, and it was her." Recognition is the peak, and it's
  in the agent's own voice, not in the app's effects.
- **Rank:** must (mark on first answer, placeholder gone, composer
  words), nice (agent speaks first + held breath).
- **Reduced motion:** the divider is there at once; the held breath is
  kept (it's timing, not motion) but typing still cancels it.
- **Hooks:** `.talk-divider.first-words` (250 ms fade-in); a flag
  `agent.firstWordsAt` set when that first answer arrives so it's never
  marked twice.
- **Weight:** small JS + CSS (must); one engine call (nice).

### Coming back · the kept agent on Home

- **Moment:** the first time Home shows a newly kept agent.
- **Motion:** its card settles in, opacity 0→1 and up 4 px, 250 ms,
  ease-out, once. Never again.
- **Words:** none new. The card line is the first sentence of the
  Instructions (existing).
- **Rank:** nice.
- **Reduced motion:** card is there.
- **Hook:** `.card.just-kept` (cleared after it plays; remember per agent).

## 4. The other screens

### Home and the agent list (`#home`, `block-a.js`)

**H1 · Ready, once** — *nice*
- **Moment:** a long study finished while they were away; the card's mark
  turns to **Ready**.
- **Motion:** the mark fades in with a soft warm wash, 400 ms, once per
  study, on the first Home visit after it finished. Never on later visits.
- **Words:** **Ready** (existing). Screen readers: "Clara is ready",
  polite, once.
- **Why:** "she's back from the studio." A quiet welcome, no fanfare.
- **Reduced motion:** the mark is there.
- **Hook:** `.mark.ready.is-new`.

**H2 · Everything else on Home: still.** Opening Home, hovering cards,
the **+ New agent** card (**one line, or drop a folder**), sketch rows,
**new here** for imports: no motion (Home opens dozens of times a week).

### The creator chat (`#log`)

**C1 · Each nudge points to where it changed** — *must* (fixes W1)
- **Moment:** a later Sketcher turn (2nd and on) changes a field.
- **Motion:** the existing `.draft-field.updated` glow 600 ms + 4 s bar,
  only when the field is in the visible pane. If the change is in the
  **other** switch (Profile vs DNA) or the other narrow view, that switch
  label gets a small still dot, no motion, until it is opened; then the
  glow plays there (as `replay` already does for narrow views).
- **Words:** dot's label for screen readers: **DNA changed** /
  **Profile changed**. The change line under the reply (existing) names
  the fields; clicking it opens the right switch.
- **Why:** pointing, not celebrating. The same small way every time.
- **Reduced motion:** the bar and dot stay, no glow.
- **Hook:** `.switch-dot` on `#rs-profile` / `#rs-dna` (and
  `#view-sketch` / `#view-knows`).

**C2 · Streaming** — no change. Dots and caret stay as they are. Nothing
new near the cursor.

### Sketch: Profile and DNA

Already designed in SKETCH-REWORK (`merlin-magic.md`): DNA layers arrive
once per session, the thread **behind this line**, the quality settle,
Profile chips **yours**. Keep them. Additions only:

**S1 · DNA is the first view while sketching** — *must* (Q1, above).

**S2 · The Files layer gets new rows quietly** — *must*, see the drop (D1).

**S3 · Profile ↔ DNA switch** — instant, no slide (unchanged).

### Not [Name] and the fix (Talk)

**T1 · The witness was heard** — *nice*
- **Moment:** after the fix is applied and they go back to the talk.
- **Motion:** none on the answer (no magic on Talk answers). The change
  line in the fix panel appears with the existing `.fade-in` 300 ms.
- **Words:** **Clara was redrawn · from what you said** (extends the
  existing "[Name] was redrawn"). On the **next** answer only, a small
  quiet mark in its meta line, not in the text: **after your fix**.
- **Why:** the peak isn't the fix, it's the next answer sounding right.
  The mark lets them notice it without the app patting itself on the back.
- **Reduced motion:** same words, no fade.
- **Hook:** `.msg-meta .after-fix`.

### The file drop (`components.js dropOverlay`, `block-b.js onDrop`, `block-c.js` Files)

**D1 · One receipt** — *must*
- **Moment:** files land.
- **Motion:** the overlay appears in **under 80 ms** (opacity only, no
  scale) and leaves at once on drop. No effect per file. The toast
  (`#toast`) rises 4 px, 200 ms. The new rows in the Files layer carry a
  still word mark **new** until DNA is next opened (no glow, no sparkle:
  no magic on sources).
- **Words:**
  - Overlay (existing, keep): **Drop · your files stay on this Mac** /
    **They go into the DNA · tell the Sketcher what each is for**
  - Toast: **312 files added to Clara's DNA** (add the name; the count
    is all files after walking folders). Same file again:
    **Already in Clara's DNA** (existing idea).
  - Nameless agent: **312 files added to the DNA**.
- **Why:** a receipt you can trust, in your own folder names. Instant, or
  they drop again.
- **Reduced motion:** toast appears without rising.
- **Hook:** `.file-row .mark.new` (still).

**D2 · Drop on Home, no words yet** (O5, Q5) — *must*
- The creator opens with DNA showing the Files layer, and the empty
  state's question reads:
  **312 files are in the DNA. Now say who this is, in one line.**
  The chips hide. Composer placeholder:
  **Who is this? e.g. my old coach, from his seminar notes**
  The hint "Tell the Sketcher what each is for…" stays in the Files layer.
- No motion. Then beat 1 onward plays as usual.

### Errors and empty states

**E1 · All still, all plain** — *must* (no magic, W12)
- Banner (`#banner`): **The Sketcher can't reach Claude right now.** /
  **Your text stays here.** / **Check again** / **How to fix ▸**
  (existing). It appears at once, no slide, no shake. Their unsent line
  stays in the composer.
- Keep failed: **Couldn't keep · Try again** (existing), no motion.
- Delete: the existing sheet, no motion beyond the Undo line.
- Empty Talk (kept agent, no talks): composer **Say hello to Clara…**, log
  empty. No illustration.
- Empty Home sections: no "Sketches" heading when there are none
  (existing).

## 5. Words (extends FULL-UX `magic-merlin.md` §6)

New or changed on screen in this pass. Everything else stays as settled
(Sketcher, Sketch, Keep/Kept, Profile, DNA, Instructions, Made from,
Files, Looks up, Strong and thin, Talk, First words, Not [Name], [Name]
was redrawn, Ready, Studying, new here).

| Where | Words | Status |
|---|---|---|
| Keep card, last line | **Say hello in Talk, at the top.** | new |
| Talk composer, before first message | **Say hello to [Name]…** | new |
| First words mark | **First words · [day Month]**, above the agent's first answer | changed (was a demo line) |
| Demo placeholder | ~~(Demo) First words would be here.~~ | removed |
| First change line | **First sketch · Instructions** | new |
| Switch dot (screen reader) | **DNA changed** / **Profile changed** | new |
| Fix change line | **[Name] was redrawn · from what you said** | extends existing |
| Next answer after a fix, meta | **after your fix** | new |
| Drop toast | **N files added to [Name]'s DNA** / **N files added to the DNA** | changed (adds name) |
| Same file again | **Already in [Name]'s DNA** | changed (adds name) |
| New file rows | mark **new** (until DNA is next opened) | new |
| Empty state after a Home drop | **N files are in the DNA. Now say who this is, in one line.** | new |
| Composer after a Home drop | **Who is this? e.g. my old coach, from his seminar notes** | new |
| Empty layers before material | **Made from one sentence, no files yet.** / **Nothing to look up yet.** | existing (SKETCH-REWORK) |

Never as labels or microcopy: Born, Soul, Alive, Magic, Creating.

## 6. Too much today (O6): what to quiet

For Jony to apply, Eraser to check.

| Effect | Decision |
|---|---|
| `aria-busy` shimmer on empty fields | Only on `#f-instructions`. |
| `.draft-field.updated` on the first draft | Off for the first draft (beat 2 has `.first-sketch`). |
| `.face.fill-in` 600 ms | 300 ms, and it plays at Keep, not at First words. |
| `.palette-band.bloom` 800 ms | Skip. DNA is the one home for "what it's made of"; the **Palette** item in the agent menu (`block-a.js` line ~121) and the palette band in `block-e.js` are a second way (W3). **Eraser: cut candidate.** |
| `.map arrive` / Sharp/Rough/Blank | Unchanged here; still the open rename from SKETCH-REWORK §6 (Columbo). |
| `.agent-born` ring 700 ms | Keep (creation moment), but only after the switch to Profile. |
| Everything else in `magic.css` | Keep as is. |

## 7. Ideas I considered (and the cuts)

Kept above (14): question steps aside · shimmer only on Instructions ·
first lines fill in reading order · one first-sketch wash · "First sketch"
change line · name cross-fades in the top bar after the lines · pencil
outline face · pencil → ink at Keep · Talk tab beckon that stays still ·
"Say hello in Talk, at the top." · First words mark on the first real
answer · held breath before self-spoken first words · switch dot for
changes in the hidden pane · one drop receipt with the agent's name.
Also kept as nice: Ready once on Home, kept card settles once, "after your
fix" mark.

**Cut, and why:**
1. **A signature drawn across the Keep card** (a scribble that writes the
   name). Lovely once, slow the fifth time, and it's a stroke animation
   on the agent's name: decoration.
2. **Auto-switching to Talk after Keep.** Takes the choice away; some want
   to keep tweaking. The beckon does the job without moving them.
3. **A second "Talk to Clara" button in the Keep card.** A second way
   (W3); cut in SKETCH-REWORK already.
4. **Confetti / sparkle on Keep.** Game show; silly for a newsletter
   helper, wrong for a portrait of a late father (W5, W6).
5. **A "canvas" texture or easel behind the Sketch.** Decoration; needs
   explaining.
6. **The face "opening its eyes" at first words.** Only works with real
   faces; on a letter it's celebrating a placeholder (W2).
7. **A heartbeat pulse on the face before first words.** Says "alive" (W11)
   and feels creepy for real people.
8. **Typing the first words slower than normal for drama.** Slows the
   peak; speed is the magic (M1). The 400 ms held breath is enough.
9. **Each dropped file flying into the DNA.** One effect per file:
   slow, noisy (M7).
10. **Count-up of dropped files in the toast.** A number is evidence;
    no magic on counts.
11. **A "Welcome back" line on Home.** Home opens daily; wears out by day 3.
12. **Shaking the composer when Claude is unreachable.** Feels like
    blame; the user did nothing wrong.
13. **A soft chime at First words.** No sound in the app; a chime at a
    portrait of a real person could feel cheap.
14. **Name letters appearing one by one.** Slower than a cross-fade, and
    feels like a slot machine.
15. **Ghost text of the first line drifting into the Instructions.** Hard
    to build, moves text near where they read, and the Sketcher rewrites
    the line anyway.
16. **A smaller ceremony for the 2nd+ agent.** Reads as "less special"
    (Q7).
17. **"Born · 25 Nov" as the First words mark.** W11; and wrong for
    clones of real people (W6).

## 8. Motion and accessibility rules for this pass

- Durations: all single effects ≤ 600 ms. The creation arc is a sequence
  of short effects, each skippable: any click or keypress during it shows
  the final state at once.
- Nothing takes focus, catches clicks or shifts layout. Nothing moves
  within the composer or any field being typed in.
- `prefers-reduced-motion: reduce`: every moment above lists its still
  form. Marks, dots and words always stay; only movement goes.
- Screen readers: announce politely once: first sketch ("First sketch
  ready"), Keep ("Clara kept"), drop receipt (the toast text), Ready.
  No announcement for the name cross-fade, washes or beckon.
- Never colour only: every changed state also has a word or a mark.
- Sound: none.

## 9. Hand-off

**Jony** (`magic.css`, `app.css`, `app.js`, `block-a/b/c/d.js`,
`components.js`, `index.html`). Must, in this order:
1. Q1: Sketch opens on DNA until Keep, Profile after (incl. narrow view).
2. Beat 2: `.first-sketch` once per agent; shimmer only on Instructions;
   no `.updated` glow on the first draft; first change line
   **First sketch · Instructions**.
3. Beat 3: `#switcher-name.name-arrive` after the fill; outline face.
4. Beat 4: in `app.js keep()` (real agents too): switch to Profile →
   faces `.fill-in` (300 ms) → `#mode-talk.beckon`; `.keep-next` line.
5. Beat 5: remove the demo line; **Say hello to [Name]…**; mark
   **First words · [date]** above the first answer, once.
6. C1: `.switch-dot` for changes in the hidden pane.
7. D1/D2: toast words with the name, overlay < 80 ms, still **new** mark
   on rows, the Home-drop empty state.
8. §6: quiet the listed effects.
Nice, if simple: agent speaks first + held breath (needs one engine call:
write it down if you don't build it), `.card.just-kept`, `.mark.ready.is-new`,
`after your fix` mark, stroke drawing on the outline face, photo faces
for real agents (write down if it needs server work).

**Eraser:** check §6 (Palette as a second way), §5 (new words vs old
ones), that the Talk beckon is not a button, and that every moment has
its still form.

**Columbo:** add §5 to the FULL-UX word list; the Sharp/Rough/Blank rename
is still yours to decide.
