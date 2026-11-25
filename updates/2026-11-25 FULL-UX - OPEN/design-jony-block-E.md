# Block E · Grow (teach more, take out, face, Palette)

*Jony, 2026-11-25. Shared frame, components (C1–C14), data shapes and flags
live in `blocks-jony.md`. Journeys: **UJ8, UJ9**. Owns Merlin 7 The map
moves, 9 The Palette (full view), 11 Their face, everywhere. Everything
here happens in **Sketch mode**, with the Sketcher in the room (blocks
§4: anything that changes the agent).*

## User goal

> "Rex is good, but Blank on money. Let me give him the money book, see it
> land, quiz him on it, and take out the old seminar that makes him worse.
> And put his real face on."

**One primary action per screen:**
- E1 Add: none after the pick (one-pile batches start at once, F4).
- E2 The map moves: the quiz invitation.
- E3 Remove: `Remove` on the row (no confirm).
- E4 Face: **Use** (the chosen face).
- E5 Palette: none; the traits are the controls.

## What I removed, and why

| Removed | Why |
|---|---|
| An "Add material" screen | Adding is B1 again, for a kept agent: ＋, drop, or the Blank line's action. One way in. |
| A confirmation on Remove | It's undone by adding the file back; the plain line says what happened (Merlin §5). |
| A trash / "recently removed" | Same reason. The file is still on the user's Mac; only the study of it goes. |
| A before/after diff screen | The map marks (`was Blank`) and Likeness `was 8` say it in place. |
| Crop and zoom controls for photos | Auto circle crop, centred on the face (mock: centred). Re-pick is cheaper than a cropper. |
| Free sliders on the Palette | 5-step scales: each step has a sentence in the Sketch. A slider implies precision that isn't there. |
| Editing the persona from the Palette directly | One pipeline: a trait change is a visible message to the Sketcher, who patches the Sketch (P2 rules, hand edits win). |
| A "reset character" button | "Put it back" to the Sketcher (P2 J3, OQ3). |

## E1 · Add a reference, short batch (UJ8 · 1–2, UJ3 · 3)

Ways in (all B1):
1. `Add a reference for this` on a Blank row (C1) or on the Blank line in
   Talk (D1). Opens the macOS open panel.
2. ＋ in the Sketcher composer.
3. Drop on the window (in Talk: the overlay `Drop · add to Rex Hart's
   references`, then Sketch mode).

Then, for `Money Has Rules.pdf`:
- **Chat:** references chip `References · Money Has Rules.pdf · 1 file ·
  4 MB` (user side). Sketcher (scripted, F7): `Studying Money Has
  Rules.pdf. It goes into what Rex knows, under money.` (from a Blank row:
  "under money"; otherwise without it).
- **One-pile batch** (B2.3): no piles, no Start studying, it starts.
- **Right pane** switches to `What Rex knows` (the user just acted). The
  Studying block sits on top of the existing, fully usable map (C4):
  ```
  │ Studying · Money Has Rules.pdf (reading) · 1 of 1                │
  │ about 1 min left · you can close the app, it keeps going         │
  ```
- **Top bar:** `Studying · about 1 min left` (C9). Talk still works on the
  old Rex (D1.5).
- **Finished** (B4.3): `Finished studying · 1 reference studied` with
  `See what Rex knows` (primary) and `Talk to Rex` (quiet). Then E2.

### States
- **E1.1 One file** (as above) · **E1.2 Several files, one pile** (Marcus:
  4 docs, UJ3 · 3; `Studying 4 references. They go into what Marcus
  knows.`) · **E1.3 Mixed batch** (needs piles or something set aside):
  the full B2 layout with Start studying · **E1.4 Duplicate** (the file is
  already a reference): Sketcher `Rex already has Money Has Rules.pdf.
  Nothing to study.` No run · **E1.5 Errors:** B1.2–B1.4, B3.6–B3.8.

## E2 · The map moves (UJ8 · 3–4, Merlin 7)

On `See what Rex knows` after the batch (first view only):

```
│ Only you see this. Rex doesn't.                                       │
│                                                                       │
│ Sharp  Money has rules: the four rules, starting with      1 ref ▸   │
│        "pay the future first"                                         │
│        was Blank                                                      │
│        Ask Rex about it: "What's the first rule of money?"            │
│ Sharp  The Ladder of Excuses: 7 rungs, step off one a day   5 refs ▸ │
│ …                                                                     │
│ Blank  Health and food              Add a reference for this         │
│                                                                       │
│ Likeness                                                              │
│ ✓ Has his money rules, word for word  Money Has Rules.pdf · p. 12 ▸  │
│ …                                                                     │
│ 9 of 10 · was 8                                                       │
```

- **The changed line** moves to its new level's group. It **redraws** faint
  → clear (60% → 100%, 400 ms, once). Placed **first** in Sharp for this
  view (the news), back to its normal order next visit. Unchanged lines do
  nothing.
- Mark `was Blank` (13 px, 60%) under it, until the next visit.
- **The quiz invitation** (the one primary of the view), under the mark, an
  accent text link: `Ask Rex about it: "What's the first rule of money?"`.
  Click → Talk mode, a **new talk**, composer focused with the question
  **typed, not sent**. Focus moves because the user asked.
- **The quiz answer** (UJ8 · 4, mock): `Pay the future first. Before rent,
  before fun, before anyone else gets a cent, a slice goes to the you of
  ten years from now. Every payday. No exceptions.` + `Where from · Money
  Has Rules.pdf · p. 12`. The passage contains "pay the future first" and
  the span covers it.
- **Likeness:** the new reason and `9 of 10 · was 8`. Plain. No motion on
  the number.
- **In the chat** (scripted): `I studied Money Has Rules.pdf. Money is no
  longer Blank.` + change line `What Rex knows: Money and investing, Blank
  → Sharp ↗`. The persona fields are not touched (knowledge, not voice); if
  a batch did change the persona, P2's change line and marks apply.
- **The Keep button** does not appear for a knowledge-only change (the
  draft didn't change).
- Reduced motion: the mark without the redraw.

### States
- **E2.1 Blank → Sharp** (as drawn) · **E2.2 Blank → Rough** (`was Blank`,
  no quiz invitation: Rough isn't worth quizzing yet; instead `Add more on
  this` as the row action) · **E2.3 Nothing moved** (the book was about
  something already Sharp): no marks; one Sketcher line `Studied. Money
  Has Rules.pdf adds to what Rex already knows well.` Honest, no fake
  change · **E2.4 Several lines moved:** each gets its mark; only the first
  gets the quiz invitation.

## E3 · Remove a reference (UJ8 · 5, Merlin 7, §5)

In `What Rex knows` → References → expanded → a file row (C12). On hover
or focus: `Remove` (13 px text button, the row's only action).

- **Click:** no confirm. The row goes (no animation). In its place, one
  plain line for this visit:
  ```
  Removed. Rex no longer uses "Old seminar 2009.mp4".
  ```
- **The study of it** is dropped from what Rex knows. The file on the Mac is
  never touched (said once in the tooltip of `Remove`: `Rex stops using it.
  The file stays on your Mac.`).
- **The map** shows the reverse, plainly, **no motion**:
  ```
  │ Rough  The 10-Minute Promise                                1 ref ▸ │
  │        was Sharp · now Rough · after removing "Old seminar 2009.mp4" │
  ```
  The line moves to the Rough group at once.
- **Likeness** recomputes; if it changes, `· was 9` plain.
- **In the chat:** change line `References: removed "Old seminar
  2009.mp4"` (no Sketcher reply needed; the change is the user's).
- **Talk:** new answers never cite the file (watch-out "removed sources
  still show up"); old talks keep their line with `· removed` (D3).
- **Undo:** add the file again (E1). The removal line has no Undo button
  (one way).
- **Remove a group** (folder row): `Remove` on the group → C10 sheet
  (a group is many files): `Remove "Live Q&A" from Rex? 18 recordings.
  Rex stops using them. The files stay on your Mac.` [Cancel] [Remove].
- **Removing the last reference:** the view becomes C3 (`Rex knows only
  what's in the Sketch…`).
- **While studying that batch:** the file is skipped if not studied yet,
  dropped if studied; the count adjusts with a reason (`296 · you removed
  one`).

## E4 · Face (UJ9 · 1, UJ2 · 9, Merlin 11)

Opened by: clicking the face slot in the Sketch (48 px, left of Name), or
`Change face…` in the agent menu. A C10 sheet:

```
┌──────────────────────────────────────────────┐
│ Rex's face                                   │
│                                              │
│    ( icon 1 )   ( icon 2 )   ( icon 3 )      │  96 px each, radio group
│                                              │
│ Draw three more · Use a photo…               │
│ or drop a photo here                         │
│                                              │
│                        [ Cancel ]  [ Use ]   │
└──────────────────────────────────────────────┘
```

- The three AI icons are "quick sketches of a face" (Merlin 11). The
  current face is preselected. **Use** is disabled until the choice differs
  from the current face.
- `Draw three more` replaces the three with new ones (mock: a second set;
  the button shows `Drawing…` 800 ms). The old three are gone (no history).
- `Use a photo…` → macOS open panel (images). Or drop an image on the
  sheet. The photo appears as a fourth choice, selected, auto circle crop,
  centred.
- **Use** → the sheet closes and the face changes **in every visible place
  at once** (top bar, Sketch slot, message labels, Home card when visible):
  300 ms crossfade (C5). Reduced motion: instant.
- **In the chat:** change line `Face: new photo` (no Sketcher reply).
- The face is not part of the P2 draft fields; it doesn't set `status:
  'draft'`, so Keep doesn't reappear.
- **Errors:** `Agent Creator can't open this image. Try a JPEG, PNG or
  HEIC.` (under the drop area, error colour). Very small image (< 96 px):
  allowed, shown with `Small image, it may look soft.` (13 px).
- **Export note** (OQ7): the face travels in the export (F1 lists it). The
  sheet says nothing about it; F1 is where the user decides to share.

## E5 · Palette (UJ9 · 2–3, Merlin 9)

Agent menu › `Palette`. Opens in the right pane in Sketch mode (it's a
view of the agent, beside the Sketcher), replacing the Sketch / knows
switch for as long as it's open:

```
│ Palette · what Rex is mixed from                                  ✕ │
│─────────────────────────────────────────────────────────────────────│
│                                                                     │
│   ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬   stand-in look  │
│   Books · Day talks · Live Q&A · Directness · Warmth …              │
│                                                                     │
│ Directness   ○ ○ ○ ● ○      Says the hard thing, then explains.     │
│ Warmth       ○ ● ○ ○ ○      Cares, rarely says so.                  │
│ Energy       ○ ○ ○ ● ○      Fast, short, pushes.                    │
│ Humour       ○ ● ○ ○ ○      Dry, rare.                              │
│                                                                     │
│ Mixed from 186 references and 4 traits.                             │
```

- **The mix** (C13, full form): a larger stand-in (a band 48 px high, or
  the P11 look later) of named segments: reference groups (sized by how
  much each adds) and traits (sized by value). Hover/focus names one:
  `Live Q&A · 18 recordings · how Rex sounds`. Meaning first: every part
  traces to a group or a trait. Label `stand-in look` until P11.
- **First open:** blooms from the centre, 800 ms, once per agent. Later:
  at once. Reduced motion: none.
- **Traits:** 3–5 five-step scales (a radio group per trait), the current
  step's Sketch sentence on the right (13 px, 60%).
- **Changing a trait** (UJ9 · 3):
  1. The step moves; the sentence on the right changes to that step's.
  2. A **visible user message** goes to the Sketcher in the left pane:
     `Directness: 4 → 5`. (The user sees exactly what was asked.)
  3. The real Sketcher patches the persona (P2). Its reply and change line
     as usual (`Sketch: persona updated ↗`); the persona field gets `new`.
  4. The mix shifts in 300 ms (the trait's segment grows). Reduced motion:
     it just changes.
  - If the persona field is `✎ yours`, the Sketcher asks first (P2 H4);
    the scale shows the new step only once the Sketch changes. If the user
    says no, the step returns.
  - Several quick changes: each is its own message, queued (P2 one turn at
    a time); scales are disabled while a turn runs (P2 field rule), with
    `Sketching…` in the header.
- **Close** `✕` / Esc → back to the Sketch / knows switch, where it was.
- **No references** (Marcus): the mix shows traits only; line `Mixed from
  the Sketch and 4 traits.`
- **Studying:** the mix fills in like B3 (a segment per finished group).
- **Errors:** Sketcher errors are P2 S10 in the chat; the scale returns to
  the Sketch's step.

## Accessibility (block E)
- Remove: a real button per row; after removing, focus goes to the next row
  (or the removal line if last). The removal line is `aria-live="polite"`.
- `was Blank`, `was Sharp · now Rough…` are text. The quiz invitation is a
  link named with its question.
- Face sheet: a radio group of images, `alt` "Face option 1 of 3"; photo
  "Your photo". Drop area also a button.
- Palette: each trait a radio group labelled with the trait and its
  sentence; the mix has a visually hidden list of its segments and sizes.
  Changes are announced via the Sketcher's chat reply (log).
- Targets ≥ 44 px; the 5-step dots sit in 44 px cells.

## Mock data (block E)
- **`Money Has Rules.pdf`** (4 MB) with passage p. 12: `Rule one: pay the
  future first. Before rent, before fun, before anyone else gets a cent,
  a slice goes to the you of ten years from now. Every payday. No
  exceptions.` (span "pay the future first").
- **Rex map before/after** E1: Money and investing Blank → Sharp `Money has
  rules: the four rules, starting with "pay the future first"`; Likeness 8
  → 9 with the new reason.
- **`Old seminar 2009.mp4`** (in `Extras/`, 1.4 GB) backing `The 10-Minute
  Promise` (Sharp with 2 refs: the seminar + `Live Q&A 8.mp3`); after
  removal Rough with 1 ref. Likeness unchanged at 9 (no `was`).
- **Faces:** the UJ9 · 1 demo is **Edie** (she still has her AI icon):
  3 icons (icon 1 current) + one photo to pick, `edie-portrait.png` (an
  illustrated portrait, not a real person), offered by the demo's open
  panel. Rex already wears his illustrated portrait `rex-portrait.png`
  (blocks §7) plus 3 icons. Ines: 3 icons + a "Draw three more" set.
  Marcus, Juno: 3 icons each.
- **Rex traits:** Directness 4, Warmth 2, Energy 4, Humour 2; five
  sentences per trait (e.g. Directness 5 `Says the hard thing first and
  doesn't soften it.`), and the persona sentence the Sketcher adds per
  step (scripted if the real Sketcher is off, F7).
- **Rex palette groups:** Books `#7A8CA8` (2 books) · Day talks `#B9877A`
  (Day 1–4 videos) · Live Q&A `#8E7AA8` (18 recordings) · Extras `#C9B37E`;
  traits as 4 more segments (stand-in colours).
- Marcus: traits only (Calm 5, Directness 3, Warmth 3).

## Kept plain (no magic, checked)
Remove is plain words, no fade-away, no confirm for one file · no motion
on removal or on scores · the Palette never edits in secret: every trait
change is a visible Sketcher message · a batch that changed nothing says
so · the face change is the only crossfade.

## Journey trace
UJ8 · 1 → E1 (from C1 Blank row) · 2 → E1 short run · 3 → E2 marks,
Likeness `was 8` · 4 → E2 quiz invitation → D1 sourced answer · 5 → E3.
UJ9 · 1 → E4 (Edie) photo → crossfade · 2 → E5 · 3 → E5 trait → Sketcher turn.
UJ3 · 3 → E1.2 → E2.
