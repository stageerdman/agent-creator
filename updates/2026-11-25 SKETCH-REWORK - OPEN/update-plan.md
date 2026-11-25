# SKETCH-REWORK: Instructions only, Profile + DNA switches, no Studying pill

## Goal

Make the Sketch serve three jobs with one home each (see
`columbo-report.md` §1):

- **Instructions** — one text box that *is* the agent (Persona folded in).
- **Profile** switch — face, name, description; skills in good at /
  medium / not trained for.
- **DNA** switch — instructions → source files behind them → RAG files →
  quality analysis, every part adjustable (mock data for now).

And remove two second ways of doing things: the **Talk to [Name] →**
section in the Sketch, and the top-bar **Studying · about 5 min left** pill.

**Done when:** all five phases below are checked, `npm test` passes
(including `src/server/public/sketch.test.mjs` and `tab-focus.test.mjs`),
and the installed `/Applications/Agent Creator.app` boots to Home with
the new Sketch.

Features: `f-sketch-instructions-only-no-talk-section`,
`f-remove-the-studying-about-5-min-left-top`, `f-sketch-profile-switch`,
`f-sketch-dna-switch-what-the-agent-is-made`.

## Who does what

| File | Owner |
|---|---|
| `columbo-report.md`, `update-plan.md` | Columbo |
| `merlin-magic.md`, `src/server/public/magic.css` | Merlin |
| `sketch.js`, `sketch.test.mjs`, `components.js`, `app.css`, `block-*.js`, `index.html` | Jony |
| `eraser-review.md`, small removals in Sketch files | Eraser |

## Decisions (from the research; Jony may refine, Eraser checks)

- Profile and DNA **replace** the current `Sketch | What it knows` tabs
  (report Q1). No third place for the study block or capability map.
- Name lives **only** in Profile. Instructions keep the old Persona text
  **first, word for word**, then the old Instructions (report D1, W1).
- No "Persona" word left anywhere on screen or in change lines (W2).
- Profile rows and DNA quality come from **one** data source (insight 4).
- Removing a RAG file gets an **Undo** line, not a confirm (W4). Source
  text is read-only (W5).
- Magic only on reveals, never on scores, sources or private material
  (team rule). Classes from `magic.css`: `.dna-layer` / `.is-revealed` /
  `--dna-i`, `.dna-thread` / `.is-active`, `.dna-quality-glow`,
  `.profile-skill-chip` / `.is-picked`.

## Roadmap

Each phase ends with **tests** (in `src/server/public/sketch.test.mjs`
unless said otherwise; run with `npm test`) and a **hand check in the Mac
app** (`npm run build:app`, then open Agent Creator from /Applications).
A phase is done only when both pass. Commit and push after each phase.

### Phase 1: Clean up — no Studying pill, no Talk section, one Instructions

Build:
- Remove the top-bar study pill: `#top-study` content, `studyLine` and
  `openStudying` in `block-a.js`, `.study-pill` in `app.css`. Keep the
  study block in the agent view (it moves to DNA in Phase 3) and the Home
  card's mark.
- Remove `Talk to [Name] →` from the Keep card (`block-b.js`
  `renderKeepExtras`) and the `.talk-to` style. The top mode switch stays
  the one way to Talk.
- Merge Persona into Instructions: `FIELDS` becomes
  `["name", "instructions"]` (name moves to Profile in Phase 2); the
  Persona field goes from `index.html`; old drafts with `persona` load as
  `persona + "\n\n" + instructions`; `changeLine`, `firstSentence` (Keep
  card line now from Instructions), the B5 change lines in `block-b.js`
  and the Export counts in `block-f.js` drop "persona".

Tests:
- `sketch.test.mjs`: a merge function (e.g. `mergePersona(draft)`) keeps
  every word, Persona first; a draft without `persona` is unchanged; it is
  safe to run twice.
- `changeLine` never returns "persona"; existing `applyDraftEvent` and
  `changeLine` tests updated to the two-field shape.
- A text check that no `block-*.js`, `components.js` or `index.html`
  contains `Studying · about` or `study-pill`, that `block-b.js` has no
  `talk-to` button, and that no screen shows the label `Persona`. (The
  Talk composer's `Talk to [Name]…` placeholder in `block-d.js` and the
  Home card's aria-label in `block-a.js` stay; they are not the Sketch.)
- `tab-focus.test.mjs` still passes.

Hand check (Mac app):
- No pill in the top bar while an agent is studying; progress is still
  visible in the agent's view and the Home card.
- A kept agent from before the update shows its old Persona text at the
  top of Instructions.
- After Keep there is no Talk to [Name] button; the Talk mode switch works.

### Phase 2: Profile switch

Build:
- Add the switch `Profile | DNA` in the Sketch header, Profile first.
- Profile: face (opens the existing face picker), name (in place),
  description (short, prefilled from Instructions' first sentence), and
  three rows of `.profile-skill-chip` (good at / medium / not trained
  for). A chip moves rows on click; `.is-picked` marks the user's choice.
  Empty rows say so in one line. The "not trained for" row speaks of
  material, not the person (W7).
- Hand edits win: a chip the user moved stays put after the next study.

Tests:
- Pure functions in `sketch.js`, e.g. `profileRows(skills)` (sorts into
  three rows, keeps order) and `moveSkill(skills, id, row)` (marks it
  picked by the user; a later AI update does not move a picked chip).
- Description fallback: empty description → first sentence of
  Instructions, max 140 characters.
- Only one Name input exists in `index.html` (it is in Profile).

Hand check (Mac app):
- Open a kept agent: Profile shows first, readable in a glance.
- Change face, name and description; quit and reopen the app; all kept.
- Move a chip; its row and look change; tab focus moves through the
  switch, fields and chips in order.

### Phase 3: DNA switch with mock data

Build:
- DNA shows four `.dna-layer` cards in this order, revealed one after
  another (`.is-revealed`, `--dna-i` = 0..3):
  1. Instructions (the same text box as Phase 1, not a copy),
  2. Made from — the source files behind them,
  3. Looks up — the RAG files (the study block and its progress live here),
  4. How good — the quality analysis (`.dna-quality-glow`), each issue
     with one action.
  Final labels come from `merlin-magic.md`.
- Clicking a part of the instructions activates its `.dna-thread` to the
  source files behind it (`.is-active`).
- Adjustable: edit instructions; add/remove source files; turn off /
  remove / add RAG files (Undo line, never touch the user's disk); act on
  a quality issue. Leave room for file drop onto DNA (separate item).
- Mock data shaped like the future backend, built from the agent's real
  file list where there is one (W8). A role-builder with no files sees
  "no files yet" lines, not empty boxes.
- Profile rows and the quality layer read the same data.

Tests:
- `dnaLayers(agent)` returns the four layers in fixed order, each with a
  title and count, and works for an agent with no files.
- `threadsFor(instructionPart, sources)` returns the linked source files.
- Removing a RAG file returns an undo-able state; undo restores it.
- Quality and `profileRows` agree on the same mock data.

Hand check (Mac app):
- Layers appear in order; with Reduce Motion on in macOS they appear at
  once.
- Click an instruction part → its source files light up.
- Remove a RAG file, press Undo, it's back.
- The study block shows progress in "Looks up" while a study runs.

### Phase 4: Magic pass and clean-up

Build:
- Apply `merlin-magic.md` moments and words; add any new words to the
  team word list (FULL-UX `magic-merlin.md` §6).
- Eraser review: remove anything that is a second way to do one thing,
  any leftover Persona / Talk to [Name] / Studying pill bits, and magic
  that confuses. Write `eraser-review.md`.

Tests:
- The Phase 1 text check, run again over all Sketch files.
- `npm test` passes in full, including `tab-focus.test.mjs`.

Hand check (Mac app):
- Walk the top behaviors from `columbo-report.md` §5 (D1–D6) once each.
  Each should take the steps the report expects (e.g. fix a line from
  Talk in 1 step to the Sketch, Profile readable in 3 seconds).

### Phase 5: The installed .app still works

Build:
- `npm run build:app` (builds and installs to /Applications).
- Make sure every new script or module is served by the server (the
  NATIVE-SHELL blank-Home lesson, W9).

Tests:
- `npm test` and `npm run test:shell` pass.

Hand check (Mac app):
- Open the installed app from Spotlight: it boots to Home, not blank.
- Open an agent → Sketch → Profile and DNA both work; Talk works; no
  Studying pill anywhere.
- Quit and reopen: edits are still there.

## Status

- [ ] Phase 1 — clean-up
- [ ] Phase 2 — Profile switch
- [ ] Phase 3 — DNA switch (mock data)
- [ ] Phase 4 — magic pass and clean-up
- [ ] Phase 5 — installed .app check

Research and plan: done (`columbo-report.md`, this file).
