# FIREFLIES-DNA: roadmap

A playground for an agent's **Fireflies DNA**. Every firefly is a file or an
event from the agent's history. Big files burst into many dots; embeddings
paint similar files in similar colours; events (edit, change, activity) have
their own colours; blinks follow time, and now and then a random spark sets
off a chain.

It is a **playground**: one HTML file to feel and tune the rules before any
of this goes into the app.

Order of work: Columbo (this roadmap + `01`) → Merlin (`02`, the rules as
code) → Jony (`playground/fireflies-dna.html` + `03`) → Eraser (`04`,
sign-off). Merlin and Jony may start in parallel; Jony codes against the
`window.DNA` names below and pastes Merlin's block when it lands.

## Scope

**In:**
- One self-contained file, `playground/fireflies-dna.html`. No installs, no
  server, no external fetches. Opens from `file://` in Safari and Chrome.
- Fake files (name, size, topic), fake events, fake embeddings
  (`DNA.fakeEmbedding`).
- A small seeded history on open, so the field is alive at once.

**Out (and why):**
- **Real RAG data and real embeddings.** We are tuning feel, not wiring
  data. Fake vectors with topics are enough to see "similar looks similar".
- **Saving.** A playground resets on reload. Settings worth keeping get
  copied into `03-jony-build.md` by hand.
- **A link into the app.** Nothing in `src/` changes. The app's home and
  `glade-fireflies.html` stay untouched.

## Rules (hold for every phase)

1. **The Fireflies look is the base.** Field `#0B1410` with the shadow
   gradient, glow and type from `updates/2026-11-26 GLADE-HOME-V2/index.html`.
   Nothing new in style unless a phase names it.
2. **Four rules must be visible**, each on its own, without explanation:
   (A) dot size from file size, (B) embedding colour, similar files alike,
   (C) event colours + timeline replay and scrub, (D) blinks follow time,
   plus random chain sparks.
3. **Never looks like a loop.** No blink pattern that repeats like a
   screensaver. Randomness stays, even at its lowest setting.
4. **Words stay readable.** Labels, the hover card and controls sit on solid
   panels; dots never sit under text.
5. **Reduced motion is respected**: no drift, gentle opacity blinks only,
   chains as a soft step-by-step glow.
6. **One way to do each thing** (`principles/magic-ux/design-rules.md`).

## The shared contract: `window.DNA`

Merlin writes it, Jony uses it unchanged, Eraser checks against it.

| Function | Returns |
|---|---|
| `DNA.fileToDots(sizeBytes, {minR, maxR, rand})` | `[{r, dx, dy}]` |
| `DNA.embeddingToColor(vec)` | `{h, s, l}` |
| `DNA.fakeEmbedding(name, topic)` | `number[64]` |
| `DNA.eventColor('edit'\|'change'\|'activity')` | `{h, s, l}` |
| `DNA.plainColor` | `{h, s, l}` (file before embeddings) |
| `DNA.blinkTimes(items[{t}], {speed, randomness})` | `number[]` ms offsets |
| `DNA.sparkChain(...)` | see `02-merlin-magic.md` |

---

## Phase 1: who plays with this, and how (Columbo)

Files: `00-roadmap.md`, `01-columbo-behaviors.md`.

What it gives: the three kinds of people who open the playground, a scored
behavior table, deep dives on the top behaviors, insights for Merlin and
Jony, a watch-out list and open questions.

Done when: both files are committed and pushed; the top behaviors each end
in a product insight that Merlin or Jony can act on.

## Phase 2: the magic rules (Merlin)

File: `02-merlin-magic.md`.

What it gives: each rule in plain words with why it feels nice, then **one**
plain-JS block (no imports, no DOM) that sets `window.DNA` with the
functions above. Seeded randomness only (`rand` is passed in).

Done when:
- A big file gives several max-size dots and a falling tail of smaller ones;
  a small file gives one small dot; same seed → same dots.
- Same-topic fake embeddings give colours that look related; different
  topics are clearly apart; every colour glows on `#0B1410`.
- Event colours are clearly apart from every embedding colour and from
  `plainColor`.
- `blinkTimes`: close-in-time items blink almost together, far-apart ones
  further apart, and jitter means no visible loop at any slider value.
- `sparkChain` makes a short chain that dies out by itself (never the whole
  field, never forever).
- Columbo's insights for Merlin in `01` are answered or turned down with a
  reason.

## Phase 3: the build (Jony)

Files: `playground/fireflies-dna.html`, `03-jony-build.md`.

What to build:
- One canvas, one `requestAnimationFrame` loop. Merlin's block pasted as-is
  into `<script id="dna-magic">`.
- Seeded history on open (a mix of small and big files, two or three topics,
  some events).
- Controls: **add a file** (name + size picker), **add an event**
  (edit/change/activity), **build embeddings** (dots fade to their colours),
  **timeline** with replay and scrub (items appear one by one in time
  order), sliders for **min dot size, max dot size, blink speed, randomness,
  chain strength**.
- Hover or tap a firefly → which file or event it is (name, size or kind,
  time). All dots of one file light up together.
- Reduced motion as in Rule 5.

Done when: it opens from `file://` in Safari and Chrome with an empty
console; all four rules can be seen; smooth at 300+ dots on a laptop;
`03-jony-build.md` says how to see each rule; committed and pushed.

## Phase 4: clean-up and sign-off (Eraser)

File: `04-eraser-signoff.md` (small HTML clean-ups allowed, noted there).

What to check: no double ways to do one thing, no control that isn't
needed, no magic that confuses; the four rules visible; a few hundred dots
run smoothly; reduced motion respected; console empty; Columbo's watch-out
list (in `01`) checked one by one.

Done when: fixes listed for Jony, rechecked after Jony's pass, and
`04-eraser-signoff.md` says **APPROVED** (or NOT YET with reasons),
committed and pushed.

## Files in this folder

- `00-roadmap.md`: this file (Columbo)
- `01-columbo-behaviors.md`: who plays and how (Columbo)
- `02-merlin-magic.md`: the rules and the `window.DNA` code (Merlin)
- `03-jony-build.md`: build notes (Jony); the page is `playground/fireflies-dna.html`
- `04-eraser-signoff.md`: sign-off (Eraser)
