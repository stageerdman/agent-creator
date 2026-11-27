# CREATION-SCREEN: the magic moments (Merlin)

Builds on `Reports/creation-screen-behaviours.md` (Columbo, behaviours
**C1…C17**, watch-outs **W1…W7**, questions **Q1…Q7**) and
`updates/2026-11-27 CREATION-SCREEN/00-roadmap.md` (**Phases 1–4**).
Journey steps **UJ2 · 2** (what is in the folder), **UJ2 · 3** (which
file is for what), **UJ2 · 4** (learning).

It continues `updates/2026-11-27 FIREFLIES-BUILD/02-merlin-motion.md`
(waiting ring, stir, answer, first light) and reuses its sprite, colour
`#D8F26A`, curves (`outQuad`, `inQuad`, `inOutQuad`, `flash()`), the
`MIN_R`/`MAX_R` clamp and `createDna()`. No new visual language.

## 1. The person and the true job

**Who arrives:** someone who just handed over a folder of their teacher
or of themselves. They are a little proud ("this is him"), a little
worried ("will it choke?"), and many have been burned by tools that said
"uploaded" and read nothing (the doubter).

**The true job:** *"Turn my pile into someone, and show me honestly what
they really took in."* (report, Summary and key insight 1).

**The hidden human truth:** people trust a drop because a box said
"done". This screen asks them to trust the opposite: a drop is only a
promise, and the proof comes later. That only works if **the promise and
the proof look completely different**, and the proof feels worth waiting
for.

## 2. Where else this job is done (and the test)

| # | Source | What maps | Verdict |
|---|---|---|---|
| 1 | **Real fireflies.** Their light is chemistry: luciferin is burned to make it. No work, no light. | light = real use; dim = resting, not broken; a field at dusk filling up = the count | **Kept (main world).** The app already is fireflies, so it needs no explaining. |
| 2 | **A character sheet's attunement** (an item can be carried in a slot, but only grants its power once you are attuned to it, after time) | zone holds the file = carried; bright = attuned; the three parts = character slots | **Kept as backup A.** Fits "character-style menu" perfectly; the word itself needs explaining, so it stays team-only. |
| 3 | **A kiln.** Glazed pots go on the shelf dull; only firing makes them shine. | accepted = on the shelf; bright = fired; a cracked pot stays dull | Backup B. Clear, but a new world next to fireflies. |
| 4 | **Seeds in the ground.** Sown = waiting, sprouted = taken. | waiting mark = a sown seed | Cut: soil hides the seed, and we must *show* the waiting. |
| 5 | **Gene expression.** A gene sits in the DNA but only some are *expressed*. | routed to DNA vs. really shaping the prompt | Cut: true and on-theme, but needs a biology lesson. |
| 6 | **Lighting candles from one flame** at a vigil | bright passes only by real contact | Cut: too solemn, and suggests the user lights them. |
| 7 | **A shepherd counting sheep through a gate** | the scan count | Cut: fine for counting, nothing for light. Its one gift (one at a time through a gap, never a blur) is kept in the scan. |

## 3. The world: **"Light is earned"**

One rule, said once in motion and never in words:

> **Shape says chosen. Light says used.**

- A **dim dot** is a file at rest: unsorted, harmless.
- A **dim dot with a thin hollow ring** is a file that is *spoken for*:
  a zone accepted it, the work has not happened yet. (Accepted, W1.)
- A **bright dot** is a file whose work really happened. Only the
  machine that did the work can light it. (Used, W2.)

Light is never used for anything else on this screen: not hover, not
pickup, not acceptance. That is what keeps "accepted" and "used" from
ever looking alike.

The right side is the **character**: the new agent's own DNA emblem at
the top (the same logo home shows), then three parts. Labels stay plain
(world rule: plain labels, world in the microcopy):

```
        ◉  [Name]                      ← DNA emblem (createDna)
  ┌──────────────────────────────┐
  │ System prompt                │
  │ who [Name] is · nothing yet  │
  ├──────────────────────────────┤
  │ Knowledge                    │
  │ what [Name] knows · nothing… │
  ├──────────────────────────────┤
  │ Skills                       │
  │ what [Name] can do · nothing…│
  └──────────────────────────────┘
```

Team names for the four moments (never on screen): **Dusk**, **The
landing**, **Handing over**, **Earned light**.

## 4. The moments

### Moment 1 · Dusk: the fast circling while the scan counts

**Phase 1 · behaviours C1, C11, W3, W7 · UJ2 · 2**

**Why it matters (deep dive C1):** for the clone-maker a 12 GB,
8,000-file folder is normal, and these first seconds set the trust for
everything after. The fear is "is it frozen?"; the hope is "it's finding
everything". A stall here "colours everything after".

**What happens:**
- The answer from the build screen (full glow, ring at speed `m = 6`)
  simply **holds** for the whole scan. Nothing new starts; the same
  excitement goes on as long as there is something to count.
- Each counted file **joins as its own firefly**: it fades in (0 → full,
  300 ms, `outQuad`) just outside the ring and is drawn into the circling.
  Joins are paced, a few per frame at most, so a batch of 500 reads as a
  steady pour, never a pop (the shepherd's gate: one at a time).
- As it fills, the swarm **widens a little** (outer radius grows with the
  count, up to the visible cap Jony sets, Q1). A big folder looks like a
  glade filling at dusk: first a few, then many.
- A plain number under the swarm counts the files: `2,184 files`, in
  firefly colour at the quiet `.36` opacity of *Select Folder*. It shows
  only after 600 ms, so small folders never flash a number. Past the cap,
  the swarm stops growing and **the number keeps going**: that is the
  receipt (design rule: a cap means a count the user can read).
- On a slow disk the number may pause. The circling never does, and
  nothing fakes progress: no invented ticks, no sparkle per batch.

**What it means:** the glade is still answering your gift, and every
file is being met one by one.

**What they feel:** "Look at it go." Awe instead of worry, because the
proof is visible without reading a bar.

**Esc during Dusk (C11):** leaves at once, no exit motion (it would delay
leaving). What happens to a half scan is Jony's call per roadmap Phase 1.

**Reduce Motion (W7):** nothing circles and nothing speeds up. Each file's
firefly appears **in place** (seeded spot), at full brightness; the
number grows. Light alone says "still counting".

**Weight:** light. Same loop, same sprite; one counter; a paced join
queue. **Builds:** Jony.

### Moment 2 · The landing: the split into field and character

**Phase 2 · behaviours C2, C4, C8, C9, C14 · UJ2 · 2 → 3**

**Why it matters (deep dives C2, C4, C8):** this is where authorship
starts ("he's mine to shape", C2). It is also where the field can look
crowded with junk (C8) and where each dot looks alike (C4). The landing
has one job beyond layout: **teach the light rule without a word**, so a
dim dot never reads as "broken" (C3, C9).

**What happens (about 1.2 s, once per drop):**

```
 ms   0            600            900          1200
 swarm ══ m 6 → 1 (inOutQuad) ══╡
 files    drift to the left field, light 1 → rest dim (.30–.42) ══╡
 glade 30 ●── gather into the emblem on the right ──● notice()
 menu              ░░ three parts fade in ░░░░░░░░░░░░░╡
```

- The swarm calms. The **file fireflies** float to their own seeded spots
  in the left field and **settle down to dim**, like fireflies landing in
  grass. They were all lit by the answer; now they rest, and each will
  light again only when it is really used. That fade *is* the rule.
- The **30 glade fireflies** from the waiting ring are not files. They
  gather (the shipped spiral-in, aimed at the emblem instead of the
  centre) and become the agent's **DNA emblem** at the top of the right
  side, which flashes once (`notice()`) as they arrive. The glade becomes
  the character; the files become the field.
- The three parts fade in under the emblem with their plain labels and
  one quiet line each: `who [Name] is`, `what [Name] knows`,
  `what [Name] can do`, plus `nothing yet · drag a firefly here` while
  empty. That one line answers C2's friction: first-timers don't know
  the zones exist until they drag. It disappears once the part holds
  something.
- **The left side stops there** (f-the-left-side): dots and one count
  line, nothing else. No names, no hover label, no groups, no buttons.
  The only thing a dot does under the pointer is grow a touch
  (`r × 1.12`, clamped) with a grab cursor, so it says "you can pick me
  up". It never brightens. Hit areas larger than the dot (C16) are a
  design detail for Jony, not magic.
- **Dim is fine, said kindly (C8, C9):** once, the count line reads
  `318 files · dim ones are simply not used`. Plain fact, no warning
  colour, so leaving junk alone feels allowed.
- **Coming back (C14):** reopening goes straight to the split, no Dusk,
  no landing. If files went bright while they were away, those few
  flash once (`flash()`), together, on arrival. Nothing else. "Look what
  was learned while you were gone." Only files that truly lit since the
  last visit; if none, nothing.

**What it means:** your pile is a field; above it stands the someone it
will become.

**What they feel:** calm after the rush, and a quiet "so that's him".

**Reduce Motion:** no drift and no gather. The swarm fades to rest
brightness **in place**, then the field dots crossfade to their spots
(opacity only); the emblem and parts fade in. The return flash on
coming back is a brightness change only, so it stays.

**Weight:** medium (reuses the shipped gather with a new target, one
crossfade, a "last seen" stamp for coming back). **Builds:** Jony; words
checked against §6 of `magic-merlin.md`.

### Moment 3 · Handing over: the drag that turns the parts into zones

**Phase 3 · behaviours C2, C6, C10, C13, C16, W1 · UJ2 · 3**

**Why it matters (deep dives C2, C6, C10):** this is the core action,
done dozens of times per agent. Two dangers: a drop that looks like
nothing happened (W1, so people drop again, C5), and a miss or wrong
zone that feels like loss (C6). It must feel sure and repeatable for the
100th drag, so the motion stays short and quiet.

**What happens:**
- **The parts wake up and say what they will do.** The moment any drag
  enters the window (a firefly or files from Finder), the labels
  crossfade (160 ms): System prompt → **Adjust DNA**, Knowledge →
  **Adjust Knowledge**, Skills → **Create new skill**. The quiet lines
  stay. Ends 150 ms after the last drag-over (the build screen's
  anti-flicker timer), crossfading back.
- **Only the zone under the pointer answers:** a soft fill in the zone's
  panel, not a firefly glow. Zones use *surface*, fireflies use *light*:
  two vocabularies that never mix. A miss is visible as "nothing lit"
  (C6).
- **You carry a copy, the original stays.** Picking up a firefly makes a
  ghost under the pointer at the same dim brightness (it does not light
  up when lifted, W2). Its home spot shows a faint hollow ring:
  "lifted from here".
- **Drop on a zone (accepted, under half a second):**
  - the ghost **sinks into the zone**: shrinks and fades, 200 ms
    (`inQuad`). Handed over.
  - the zone's line changes at once: `1 waiting` (then `2 waiting`…).
  - the original in the field gets the **waiting ring**: a thin hollow
    ring around the still-dim dot. Shape says chosen.
  - an Undo line names the file: `Principles.pdf → System prompt · Undo`
    (Cmd+Z too). It is the only place a name shows this update, and it is
    the receipt: the doubter sees *which* file went in, and a grabbed
    neighbour (C16) is caught at once.
- **Miss:** the ghost fades where it was let go (150 ms); the lifted ring
  goes away. Nothing flies back. *A dot snapping back to its place is
  the classic "rejected" signal in every drag UI*; by never moving the
  original, a miss reads as "nothing happened", which is the truth.
- **Wrong zone (C6):** Undo, or drag again onto the right zone (a new
  route). No confirm.
- **Two zones for one file (C13):** still one waiting ring; both zones
  count it.
- **A Finder folder onto a zone (C10):** the Dusk count plays small
  inside that zone's line (`40 waiting`, counting up). New files appear
  in the field **already wearing the waiting ring**; files already in the
  agent gain the ring, never a second dot (W5). One drop, a whole shelf
  sorted.

**What it means:** you hand a piece of the pile to the character, and the
character says "I'll take it". The promise is made; the proof comes in
Moment 4.

**What they feel:** sure. "Picked it up, put it in his DNA. Done for
now."

**Reduce Motion:** label swap is an instant crossfade; the zone fill is a
brightness change; the ghost follows the pointer directly (that is
the user's own motion, not ours); the sink becomes a plain fade.

**Weight:** light. Label swap, one fill, a ghost, one ring mark.
**Builds:** Jony.

### Moment 4 · Earned light: a firefly goes from dim to bright

**Phase 4 · behaviours C3, C5, C7, C14, W1, W2 · UJ2 · 4**

**Why it matters (deep dives C3, C7):** this is the screen's promise and
what makes it different from upload boxes. After the doubt of waiting
comes "it only lights what it really used. I can trust what I see" (C3).
One false bright breaks it all (W2). And because bright is a fact,
taking it back must be equally honest (C7).

**While waiting (C3):** the zone line carries the "why and how long" in
plain words, so dim-with-a-ring never looks broken:
- `3 waiting` → `Studying 1 of 3` while the machine works (an existing
  word, §6). The ring stays; the dot stays dim. Work in progress never
  lights anything.
- Knowledge before the RAG machine exists (Q3): `40 waiting · studied
  once Knowledge is ready`. Calm, true, no warning colour.

**The moment it lights** (only on the machine's own per-file "used"
signal):

```
 ms    0      120             900          1500
 dot   ▲ flash()─────────────╡ steady bright (alpha ~.9)
 ring  ═ closes into the glow ═╡             (the hollow ring fills in)
 place                ●── drifts into order ──●
 emblem          notice() once per batch
```

- The dot **flashes** (the DNA `flash()`, 120 ms up, 900 ms down) and
  settles to a steady bright. Its hollow waiting ring **closes into the
  glow**: the promise kept, visibly. This is the one detail that ties
  accepted to used.
- It then **drifts into order** (600 ms, `outQuad`): bright files line up
  at the right edge of the field, in three short lines facing the part
  they belong to. No names needed; the line next to Knowledge is what
  Knowledge took. (This is the simplest honest "put in order"; the
  full order belongs to f-the-left-side.)
- The zone line moves on: `Studying 2 of 3`, then `3 used` (or the
  part's real content).
- The **DNA emblem** flashes once (`notice()`), once per batch, not per
  file: [Name] took something in.
- **Many at once** (a prompt build that reads 12 files): they light in
  the order the machine reports them, 40 ms apart, all done within
  1.2 s. Beyond that, the rest light together.
- **A failed use stays dim** with its ring, and the zone line says it
  plainly. No magic on errors.

**Taking it back (C7):** quiet, not magic.
- While the machine removes it, the firefly **stays bright** (it is
  still used, that is honest) and the zone line reads `Taking out…`.
- Only when the machine confirms, the light fades over 900 ms (`inQuad`,
  the shared settle curve) and the dot drifts back into the field,
  dim and unsorted. Same honesty as lighting: light leaves only when the
  use really left.

**Throwing away a dim file:** no motion beyond a plain fade-out, an Undo
line, and the words make clear it leaves the agent only, never the Mac
(W4). Team rule: no magic on deletion.

**What it means:** this file is now really part of [Name].

**What they feel:** trust and real pride. The doubter's "this is honest".

**Reduce Motion:** the flash is a brightness change, so it stays (as in
DNA); the ring fills by opacity; no drift, the dot crossfades to its
place in order; take-back is a brightness fade in place.

**Weight:** light. One flash, one ring fill, one drift, one `notice()`.
**Builds:** Jony; Eraser checks it in pixels.

## 5. Every idea from inside the world, and what survived

Kept (in the moments above):
1. The answer holds for the whole scan (Dusk).
2. Each file joins the swarm as its own firefly, paced like a gate.
3. The swarm widens as it fills, up to the cap.
4. The plain count that keeps going past the cap.
5. File fireflies settle to dim as they land: the rule taught in motion.
6. The 30 glade fireflies gather into the agent's emblem on the right.
7. One quiet line per part (`who [Name] is` …) and `nothing yet · drag
   a firefly here`.
8. Labels that say what they will do during a drag.
9. Zones use surface, fireflies use light.
10. Carry a ghost; the original never moves, so a miss is not a bounce.
11. The waiting ring: shape says chosen.
12. The Undo line that names the file.
13. The hollow ring closing into the glow when used.
14. Bright files lining up facing their part.
15. The emblem's `notice()` once per batch.
16. Coming back: what lit while you were away flashes once.
17. Taking back: light stays until the use is really gone.

Cut, and why:
- **A sparkle per scan batch.** Fake liveliness; it lies on a slow disk.
- **A progress ring or percentage during the scan.** The count is the
  receipt; a bar crawls and lies on huge folders (FULL-UX cut).
- **Dots brightening on hover or on pickup.** Light must only mean used
  (W2).
- **Colour-coding the waiting ring per zone.** Three colours in a dim
  field is noise; the Undo line and zone count already say where.
- **The dropped firefly flying across into the zone and staying there.**
  It would leave the field, and Q2 keeps it in the field until used.
- **A dot snapping back after a drop.** Reads as "rejected".
- **Names or titles on hover.** f-the-left-side (Q1).
- **Constellation lines linking bright files.** Pretty, means nothing,
  and fills the left side.
- **The emblem growing or changing shape with each lit file.** The DNA
  logo is drawn from the agent's file list; changing it per use makes it
  a second, competing truth.
- **A chime when a file lights.** No sound switch on this screen, and it
  repeats dozens of times.
- **Confetti or a burst when all routed files are used.** Loud, and
  often nobody is watching (they closed the app, C14).
- **A dimming "farewell" on thrown-away files.** No magic on deletion.
- **A shake or red on a failed use.** No magic on errors.
- **A first-time tooltip tour of the zones.** The one empty-state line
  does it without blocking.
- **Magic words about privacy ("safe in the glade").** Team rule: no
  magic on private material (W6).

## 6. Don't overdo it (magic to skip so the screen stays clear)

- **Light means used. Nothing else glows.** Not hover, not pickup, not
  accept, not "in progress".
- **The left side stays dots and one count.** No labels, groups, lines,
  trails or tours (f-the-left-side is next).
- **No motion on repeat paths.** Coming back skips Dusk and the landing.
- **One emblem flash per batch, not per file.**
- **No sound on this screen.**
- **No magic on errors, throwing away, taking back, or privacy.** Plain
  words, Undo, a quiet fade.
- **No new on-screen words beyond the list in §8.**
- **Nothing waits for an animation.** Every drop, Undo and Esc works at
  once; motion runs alongside.

## 7. Map: moment → behaviour → phase

| Moment | Team name | Behaviours (report) | Phase | Journey |
|---|---|---|---|---|
| Fast circling while the scan counts | Dusk | C1, C11, W3, W7 | 1 | UJ2 · 2 |
| Split into field and character | The landing | C2, C4, C8, C9, C14 | 2 | UJ2 · 2 → 3 |
| Drag turns parts into zones | Handing over | C2, C6, C10, C13, C16, W1, W5 | 3 | UJ2 · 3 |
| Dim to bright on real use | Earned light | C3, C5, C7, C14, W1, W2, W4 | 4 | UJ2 · 4 |

## 8. Words on screen (added to §6 of `magic-merlin.md`)

Plain labels (the user's): `System prompt` · `Knowledge` · `Skills` ·
`Adjust DNA` · `Adjust Knowledge` · `Create new skill`.
Microcopy (proposed, Jony may tune): `[n] files` ·
`dim ones are simply not used` · `who [Name] is` · `what [Name] knows` ·
`what [Name] can do` · `nothing yet · drag a firefly here` ·
`[n] waiting` · `Studying [i] of [n]` (existing) ·
`studied once Knowledge is ready` · `[n] used` · `[file] → [part] · Undo` ·
`Taking out…`.

Note: §6 named the knowledge pile **What [Name] knows**. On this screen
the user's label **Knowledge** wins; "what [Name] knows" moves into the
microcopy, so both stay true.

## 9. Backups (if the main world fails in design)

- **Backup A · Carried and attuned** (character sheet). Each part shows
  small slots; an accepted file fills a slot outline; it lights when
  attuned. Strong fit for "character menu", but slots invite counting
  limits and the field still needs the light rule. Use only if the
  waiting ring proves too small to read at radius 2.5.
- **Backup B · The kiln.** Accepted = on the shelf, dull; bright = fired.
  Clear, but a second world beside fireflies. Keep only as a way to
  explain the rule in a help line, never in motion.

## 10. Hand-off

- **Jony (design and build):** design the four moments in §4 on
  `/new` (`new-agent.html`, `firefly-orbit.js`), reusing the shipped
  sprite, curves, gather, `flash()`, `notice()` and `createDna()`; don't
  edit `fireflies-dna.js`. Set the visible cap (Q1) and the field layout
  for the lit lines. Decide the hit area for small dots (C16) and what
  Esc does to a half scan. Write it up in `03-jony-build.md`.
- **Eraser (sign-off):** check in pixels that no dot is brighter after a
  drop than before (only the ring is new); that a lifted dot is not
  brighter; that exactly the machine-used files are bright; that the
  count past the cap is readable; that Reduce Motion gives identical
  positions 1 s apart during Dusk; and that every `r` stays in
  `MIN_R`…`MAX_R`.
- **Columbo (captain):** confirm the emblem-on-the-right and the
  `[file] → [part] · Undo` receipt don't cross into f-the-left-side.
