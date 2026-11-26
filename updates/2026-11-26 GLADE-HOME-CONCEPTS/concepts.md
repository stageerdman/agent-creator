# Three Glade Homes

*Merlin, 2026-11-26. Built from `home-brief.md` (Columbo) and the Glade in
`updates/2026-11-25 MAGIC-CONCEPTS/` (`concepts.md` §A, `glade-fireflies.html`).
For Jony (HTML), then Eraser (cuts). All three use the Glade's light and
palette. Each one is built around a different idea of what "find the right
person, now" means:*

| | Idea | Finding means |
|---|---|---|
| **1 · The Lantern Call** | You call, they answer. | **Asking**: type, and whoever matches flashes back. |
| **2 · The Firefly River** | Walk the bank, A to Z. | **Browsing**: everyone stands in name order along a river. |
| **3 · The Night Clock** | Whoever you need now stands under the moon. | **Habit**: each agent stands at the hour you usually talk to them. |

---

## The human truth I'm building on

The returning user isn't looking around. They already know who they want
("I need Rex about this"). So Home's magic has to come from **recognition**,
not exploring. Real fireflies give us three true behaviours to work with,
and each concept takes one:

- **They answer a light.** Firefly watchers blink a penlight and the males
  flash back. *Type a name and that person answers you.* → Concept 1
- **They gather on particular trees along a river.** On mangrove rivers,
  boatmen have long used firefly trees as landmarks: "the bright tree past the
  bend". *Everyone has a fixed place on the bank, and you walk to them.* →
  Concept 2
- **Each species flies at its own hour.** Some flash at dusk, some at
  midnight. *Your agents keep hours too: the morning editor, the evening
  coach.* → Concept 3

Shared truth for all three: **firefly larvae glow too.** They're called
glowworms. They sit on the ground with a steady, faint light and don't fly
yet. That's exactly what a **sketch** is (never kept): alive, but not yet
grown. In all three Homes, sketches are glowworms: a few steady points low
on the ground, apart from the kept agents. They never blink and never mix
in.

### Where I looked (and what I dropped)

| Source | Kept? | Why |
|---|---|---|
| Penlight call and answer | **Kept → 1** | Searching *is* calling. The answer is a flash. Nothing to explain. |
| Mangrove firefly trees on a river | **Kept → 2** | Fixed landmarks scale to many, and the water can hold what's left behind (past talks). |
| Species keep their own hour of night | **Kept → 3** | The surprising truth: we need different people at different times of day. Home can know that. |
| Glowworms (firefly larvae) | **Kept → all** | Sketches finally get an honest picture: not yet a grown agent. |
| Fireflies in a jar on a shelf | Dropped | Trapping them is the wrong feeling for a person you respect, and it's the first idea anyone has. |
| Constellations / star map | Dropped | Every "knowledge map" uses it, and stars don't learn or sync. |
| Firefly flash codes (each species' pattern) as name codes | Dropped | You'd need a legend to read them. If a metaphor needs explaining, I drop it. |
| A swarm that gathers around whoever you type | Dropped | It moves the target while you're aiming. The brief says targets stay still. |
| *Photuris* "femme fatale" mimics | Dropped | A predator that fakes the signal. That's the user's worst fear about an imitation. |

---

## Rules all three share (Jony, build these once)

**Look.** The Glade palette and type from `glade-fireflies.html`: field
`#0B1410`, shadow `#060B08`, fly `#D8F26A` (halo the same at 25%, blur 12px),
text `#E6EEE8`, quiet `#8C9A90`, panel `#101A15` with a hairline `#1E2B24`.
The ember `#E89A4A` is **not used on Home** (it means a failed file, which
isn't a Home thing). Light comes only from points on a `<canvas>` field. All
words sit on solid panels.

**Words (plain, the same on all three pages).** On every agent, right next to
its light, exactly one state:
- `Ready`
- `Studying · 18 of 30`
- `new here` (imported, never opened)

Sketches show their name (for example `Untitled sketch`) under a small
`Sketches` heading. The world lives only in light, motion and a few lines of
microcopy (listed per concept). Button labels stay plain.

**Light rules.**
- Flashes never sit under text. Points stay at least 8px outside every panel.
- Never more than one flash per 2 s from any one cluster. The peak point
  opacity is 0.9 and the halo 25%, which keeps the contrast low.
- A flash is the Glade shape: rise 120 ms ease-out, fall 900 ms ease-in.
- Drift is 1–2 px (sine, 8 s), and only inside each cluster's **fixed hit
  box**. The hit box (cluster + name panel) never moves before the click.
  Hover or keyboard focus stops drift in that cluster and brightens its name
  panel's hairline to `#3A4A40`. **No hover flash** (the brief overrules the
  old Glade hover).
- **Reduced motion** (`prefers-reduced-motion`, plus a demo toggle): nothing
  blinks or drifts. Ready = all points glow evenly at 0.8. Studying = points
  glow unevenly (0.2–0.6, fixed random per point). The words still say it all.

**Clicks that are the same everywhere.**
- **Open an agent:** one click on its cluster or name panel → Talk opens at
  once as a new talk. No exit animation.
- **Open a studying agent:** it isn't blocked. Talk opens with one plain line
  at the top: `Ines has studied 18 of 30 files so far. She answers from those.`
- **Open a sketch:** one click → Talk with that sketch.
- **Keyboard:** arrows move focus between agents (the order is given per
  concept), Return opens. Focus ring = `2px solid var(--fly)`, as in the old
  Glade.
- **⌘⇧N** focuses the concept's one-line "New agent" field.
- **Drop files anywhere** on Home: the field dims to 40% and a solid panel
  appears in the middle with three lines: `Drop · your files stay on this
  Mac` / `Claude reads them to study` / `for a new agent`. On drop → the
  Make stand-in, listing the file names.

**Stand-in screens (so every job really ends somewhere).** Each page has two
plain panels that replace Home and have a `Back to Home` link:
- **Talk stand-in:** `Talk · Rex · new talk`, or `Talk · Maya · The job offer`
  for a past talk (show its last two lines). Add the studying line when it
  applies.
- **Make stand-in:** `New agent` + the line they typed, or the list of
  dropped/chosen files. (`bring a folder` opens a real file picker,
  `<input type="file" webkitdirectory multiple>`.)

**Demo bar** (on top, demo-only, like the old pages): `← All concepts` ·
a three-way switch `First run · 4 agents · 12 agents` · `Reduced motion`.
It starts on **12 agents**, because scale is the real test.

**Sample data (the same on all three pages, so they can be compared).** The
tempo is seeded from the name (2.4–3.4 s). `hour` is only used by Concept 3.
`lights` = number of points (one per file, at least 12, capped at 40).

```js
agents = [
  { name:'Rex',    about:'blunt newsletter editor', state:'ready', files:24, hour:10 },
  { name:'Ines',   about:'her design course',      state:'studying', learned:18, total:30, hour:19 },
  { name:'Maya',   about:'career mentor',           state:'ready', files:31, hour:21 },
  { name:'Tony',   about:'pricing and sales',       state:'ready', files:17, hour:14 },
  // 4-agent set ends here
  { name:'Marcus', about:'running coach',           state:'ready', files:12, hour:7 },
  { name:'Amara',  about:'contract lawyer',         state:'studying', learned:4, total:22, hour:11 },
  { name:'Jun',    about:'imported from Lena',      state:'new', files:19, hour:16 },
  { name:'Priya',  about:'product strategist',      state:'ready', files:28, hour:13 },
  { name:'Theo',   about:'poetry teacher',          state:'ready', files:14, hour:22 },
  { name:'Lena',   about:'research supervisor',     state:'ready', files:40, hour:9 },
  { name:'Sol',    about:'sleep and calm',          state:'ready', files:9,  hour:23 },
  { name:'Hugo',   about:'cookbook author',         state:'ready', files:21, hour:18 },
]
sketches = [ 'Untitled sketch', 'Pitch coach' ]          // 4-agent set: just 'Untitled sketch'
talks = [  // newest first; "now" in the demo is 10:40
  { agent:'Rex',   title:'Subject lines for Friday', when:'today 09:50' },
  { agent:'Maya',  title:'The job offer',            when:'yesterday 21:30' },
  { agent:'Ines',  title:'Week 3 critique',          when:'yesterday 19:10' },
  { agent:'Tony',  title:'Pricing the workshop',     when:'yesterday 14:05' },
  { agent:'Lena',  title:'Chapter 2 structure',      when:'Mon 09:20' },  // 12-agent set only
]
```
First run = no agents, no sketches, no talks.

---

## Concept 1 · **The Lantern Call**

**One line:** Home is one lantern in the middle of the dark. Type a name and
that person flashes back at you. Type someone who doesn't exist yet, and the
same line makes them.

**The world.** You hold the lantern. Every ready agent flashes **in step with
your lantern**, one shared beat across the whole glade. They're in tune with
you. Anyone still studying can't keep the beat yet. The single input is your
light: the same line is a first-run maker on day one and a finder forever
after. It never moves.

### Layout

```
 ┌ demo bar ────────────────────────────────────────────────────────────┐
       ·:·.        .·:·          ·:·.            .:·:          ·:·
      Marcus       Lena          Rex             Priya         Theo
      Ready        Ready         Ready           Ready         Ready
            .·:·      ┌──────────────────────────────────┐   .·:·
            Maya      │ ◦  Find someone, or describe     │   Tony
            Ready     │    someone new_                  │   Ready
                      │ ──────────────────────────────── │
     . · .            │ Return · talk to Rex             │   ·  .  ·
     Ines             │                                  │   Amara
     Studying·18 of 30│ Where you left off               │   Studying · 4 of 22
                      │ Subject lines for Friday · Rex · 09:50 │
       ·:·.           │ The job offer · Maya · yesterday │    .·:·
       Hugo           │ Week 3 critique · Ines · yesterday│   Jun
       Ready          │ or bring a folder                │    new here
                      └──────────────────────────────────┘
                  Sketches   ∙ Untitled sketch   ∙ Pitch coach
```

- **The lantern panel** sits dead centre, 520px wide. From the top: the
  input (focused on load, every time); the **hint line** (it says exactly
  what Return will do); `Where you left off` (the 3 most recent talks); and
  the `bring a folder` link.
- **The lantern pip** is a single point of light sitting *outside* the panel,
  12px above its top edge, in the field. It flashes on the glade beat. It's
  the only light near the panel.
- **Agents** stand on two still rings around the panel. The **inner ring**
  holds the 6 most recently talked-to agents, the newest at 12 o'clock, then
  clockwise. The **outer ring** holds the rest, up to 12 more. With 19 or
  more, add a third ring at 70% scale. Positions are set when the page loads
  and never change during the visit.
- **Sketches** are a low strip under everything: glowworm points on the
  ground line, with names on small panels.

### The four jobs, in clicks

| Job | How | Clicks |
|---|---|---|
| **Find** | Type part of a name. Matching clusters answer (see motions) and the rest dim. The hint says `Return · talk to Rex`. Return opens Rex. Or just click any cluster. | **0** (type + Return) or **1** |
| **Pick up a past talk** | Click a line in `Where you left off`. Typing searches talk titles too: `job` makes the list show `The job offer · Maya`, and the hint says `Return · open "The job offer"` when no agent name matches. | **1** (or type + Return) |
| **See who's studying** | Read it: the words under each cluster; off-beat clusters stand out against the one shared beat. | **0** |
| **Make new** | Type a line that matches no one (`a blunt editor for my newsletter`). The hint says `Return · make a new agent from this line`. Return → Make. Or click `bring a folder`, or drop files anywhere. | **0** (type + Return) or **1** |

**Matching rule (keep it this simple):** case-insensitive "contains" on agent
names, then on talk titles. Return opens the first agent match; if there's
none, the first talk match; if there's none, it makes a new agent. Arrow
down moves through the matches, in that order. When there's a match **and**
the line has 3 or more words, the hint adds a second line,
`or make a new agent from this line`, which you can click. That way a
description that happens to contain a name ("like Rex but kinder") can still
become a new agent.

**Keyboard order** (when the input is empty): arrows walk the inner ring
clockwise, then the outer ring, then the sketches. Esc clears the line.

### Studying vs ready

- **Ready:** the cluster flashes **with the lantern pip**, on one global beat
  every **3.0 s**. Every ready agent on the page lights together, so the
  whole glade breathes as one. It's the clearest possible "these are fine".
- **Studying:** its points blink on their own, scattered, each about once
  every 4–7 s at random. With the whole room in step, one scattered cluster
  stands out from across the room. Words: `Studying · 18 of 30`.
- **new here:** flashes in step (it's ready) and says `new here`.
- **Reduced motion:** as in the shared rules, plus the lantern pip glows
  steadily.

### First run (empty)

```
                    .                         ·


                      ┌──────────────────────────────────┐
                      │ ◦  Describe someone new_          │
                      │ ──────────────────────────────── │
                      │ Return · make a new agent         │
                      │ or bring a folder                 │
                      └──────────────────────────────────┘
               ·                                       .
```
The same panel in the same place. The placeholder becomes
`Describe someone new`. There's no `Where you left off`, no sketches strip
and no rings. The lantern pip still beats, alone. Four or five **wild
fireflies** (tiny, opacity 0.15, no names, not clickable) blink at random far
out at the edges, so the field reads as *night, alive*, not broken. As soon
as they type, the hint reads `Return · make a new agent`.

### Key motions

1. **The glade beat:** every 3.0 s, all ready clusters and the pip flash
   together (120 ms rise, 900 ms fall). It's the page's heartbeat.
2. **The answer:** when a cluster *becomes* a match as you type, it flashes
   once right away, off the beat (80 ms rise, 600 ms fall), then rejoins the
   beat. At most one answer per cluster per 2 s. Non-matching clusters fade to
   20% and their names to quiet over 160 ms. Clearing the line brings them
   back over 160 ms. Nothing moves position.
3. **Studying scatter:** random blinks per point (above).
4. **Reduced motion:** the answer becomes an instant brighten (matches go to
   0.9, others to 0.2). No flash.

### Glade names (team words; on-screen microcopy marked ✎)

- **the lantern**: the one input. ✎ placeholder `Find someone, or describe
  someone new` (on first run: `Describe someone new`)
- **the pip**: the lantern's own light
- **the glade beat**: the shared 3 s pulse of every ready agent
- **the answer**: a match flashing back
- **the rings**: inner = lately, outer = the rest
- **glowworms**: sketches
- ✎ `Where you left off` (the past-talks heading)
- ✎ hint lines: `Return · talk to Rex` / `Return · open "The job offer"` /
  `Return · make a new agent from this line`

---

## Concept 2 · **The Firefly River**

**One line:** a dark river runs across the screen. Your agents are firefly
trees standing along the far bank in name order. Past talks are little lights
moored in the water under the tree they belong to.

**The world.** Every agent has its own tree, and the tree never moves, so you
learn the bank the way a boatman does: "Maya is the bright one past Lena."
The river is where things are still *on their way*: files still crossing
over to the agent studying them, and talks you left floating. The near bank
is where new things start. It holds the **Landing**, where you make someone,
and the **glowworms** in the grass (sketches).

### Layout

```
 ┌ demo bar ─────────────────────────────────────────────────────────────────┐
   A        H        I          J      L        M        M        P       ... ← letter posts
  .·:·.   ·:·:·.   . · .  ·    ·:·.   ·:·:·.   ·:·:·    ·:·.    ·:·:·.       far bank
  Amara   Hugo     Ines        Jun    Lena     Marcus   Maya    Priya         (trees, A→Z)
  Studying Ready   Studying    new    Ready    Ready    Ready   Ready
  4 of 22          18 of 30    here
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ river
   ·    ·  ·   .   ∙ ∙ ·  ·  ← lights crossing to Ines & Amara      ◦ The job offer
          ◦ Week 3 critique                                        yesterday
          yesterday               ◦ Chapter 2 structure · Mon
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ┌ Landing ───────────────────┐   ∙ Untitled sketch    ∙ Pitch coach      near bank
 │ New agent                  │      (glowworms in the grass)
 │ [ Describe someone… ]      │
 │ or bring a folder          │
 └────────────────────────────┘
```

- **Far bank (top 45%)**: one tree per kept agent, **A→Z left to right**,
  evenly spaced. Each tree is a cluster with a name panel under it. Up to 12
  trees fit across 1280px (min tree width 96px). With more, the bank scrolls
  sideways (trackpad, Shift+wheel or arrows), with a soft fade at the edges.
- **Letter posts:** a thin row of plain capital letters above the trees, one
  per letter that starts at least one name. Click a post → the bank glides to
  that letter (300 ms ease-out) and focuses its first tree. Only show posts
  when the bank is wider than the window. With 12 agents at 1280px it fits,
  so they're hidden (no dead UI). Jony: add a `Show 24 agents` option to the
  demo switch *only if* you want to show the posts working. That's optional.
- **River (middle 25%)**: dark water, a 2–4% lighter band. Each tree's
  flashes are reflected in it. Past talks are **moored lights**: one small
  steady point in the water directly below its agent's tree, with a small
  panel `The job offer · yesterday`. The 4 most recent talks show (5 in the
  12-agent set). Two talks under the same tree stack downward.
- **Near bank (bottom 30%)**: the **Landing** panel on the left (always
  there, never scrolls). The **glowworms** (sketches) sit in the grass to the
  right of it.

### The four jobs, in clicks

| Job | How | Clicks |
|---|---|---|
| **Find** | Look along the bank: names are in A→Z order, so you know where Rex is. Click the tree. **Or type** (anywhere but the Landing field): a soft **torchlight** pool lands on the ground under the first tree whose name starts with what you typed, and focuses it. Return opens it. | **1**, or **0** (type + Return) |
| **Pick up a past talk** | Click its moored light or panel in the river, under the agent it belongs to. | **1** |
| **See who's studying** | Read it: the words under each tree, plus **lights crossing the river** toward any tree that's still studying. | **0** |
| **Make new** | The Landing: type a line + Return, or `bring a folder`, or drop files anywhere. ⌘⇧N focuses the Landing field. | **0** (type + Return) or **1** |

**Type-to-find rule:** keys typed while focus is *not* in the Landing field
build a prefix (it resets after 1 s of no typing, like a Finder list). The
first agent whose name starts with it gets focus and the torchlight. A
small solid chip in the top-right of the river shows what you've typed,
`Find · Re`, and fades out 1 s after you stop. If nothing matches, the chip
says `No one called "Rz"` and focus stays where it was. This is the only
place on this page where typing finds. **Focus on load:** with agents, the
page itself has focus and nothing is pre-selected, so typing finds right
away. With 0 agents, the Landing field is focused.

**Keyboard order:** ← → along the bank (A→Z), ↓ from a tree goes to its
moored talks, then to the Landing; ↑ goes back up.

### Studying vs ready

- **Ready:** the tree's lights flash in step at **its own tempo** (2.4–3.4 s,
  seeded from the name, as in the old Glade), so each tree has its own
  rhythm. The flash reflects in the river below.
- **Studying:** the tree's points are scattered. **Lights cross the river
  toward it**: single points rise from the Landing side and drift on a soft
  curve over the water to the foot of the tree. There's one crossing light per
  file still to read (30 − 18 = 12 left for Ines, capped at 12 visible). Each
  crossing takes 24 s, and they set off staggered, so a thin, slow stream is
  always on its way. Fewer lights crossing = nearly there. When studying
  ends, the stream simply stops. Words: `Studying · 18 of 30`.
- **new here:** a ready tree that says `new here`, with no moored talks.
- **Reduced motion:** the crossing lights sit still, evenly spaced along
  their curve. There are no reflections, only the even glow described above.

### First run (empty)

```
  ────────────────────────────────────────────────────────────── far bank (bare)
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ·                .              ·        (a few wild lights over the water)
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                 ┌ Landing ─────────────────────────┐
                 │ New agent                        │
                 │ [ Describe someone… ]  (focused) │
                 │ or bring a folder                │
                 └──────────────────────────────────┘
```
The far bank is a bare, faint horizon line: no trees, no posts. The Landing
moves to the centre of the near bank, and its field is focused. A few wild
fireflies (unnamed, 0.15) blink over the water, so the river is alive and
waiting. ✎ Under the field, quiet: `Their tree will stand across the water.`
(It's the one line that tells you where they'll be. Cut it if Eraser says it
explains too much.)

### Key motions

1. **Each tree's own beat**, with its **reflection**: the same flash in the
   water, 120 ms later, at 30%, stretched down (scaleY 1.6, blur 3px).
2. **The crossing:** points travel Landing → tree over 24 s, ease-in-out,
   with a 1px sine wobble. They fade in over 400 ms at the start and out over
   400 ms when they reach the tree.
3. **The torchlight:** a soft ground pool (an ellipse on the canvas, 10%
   fly colour) glides 260 ms ease-out to the found tree. It sits on the
   ground under the cluster, never under the name panel. The bank scrolls
   300 ms if the tree is off-screen. This is motion you asked for by typing,
   so it doesn't break "targets stay still".
4. **Reduced motion:** the torchlight jumps there, and the bank jumps too.

### Glade names (team words; on-screen microcopy marked ✎)

- **the far bank**: where kept agents stand
- **trees**: agents (each one is a "firefly tree")
- **letter posts**: the A–Z markers
- **the river**: what's on its way
- **the crossing**: files still on their way to a studying agent
- **moored lights**: past talks
- **the torchlight**: type-to-find focus
- **the Landing**: the New agent panel (✎ the panel's title stays the plain
  `New agent`)
- **glowworms**: sketches, in the grass on the near bank
- ✎ `Find · Re` / `No one called "Rz"` (the typing chip)
- ✎ `Their tree will stand across the water.` (first run only)

---

## Concept 3 · **The Night Clock**

**One line:** Home is a round glade that keeps time. Each agent stands at
the hour you usually talk to them, and the moon sits on *now*, so the person
you're most likely to need is already right under it, focused, one Return
away.

**The world.** Fireflies keep hours, and so do the people we lean on: the
editor at 10 a.m., the mentor at 9 p.m. The dial turns with the day, so
**now is always at the top, under the moon**. The ones you'll want later
come round from the right; the ones you just saw have passed to the left.
The **hollow** in the centre is where new ones are made. When they're born
they go out to stand at their hour.

### Layout

```
 ┌ demo bar ─────────────────────────────────────────────────────────────┐
                               ( ) now · 10:40
                    Lena    .·:·.  Rex   .·:·  Amara
                    Ready  ·:·.   Ready  · . ·  Studying · 4 of 22
             Marcus  ·:·  ◦ Subject lines for Friday · 09:50     ·:·. Priya
             Ready                                             Ready
                    ┌──────────────────────────┐
        Sol  ·:·    │ New agent                │        ·:·.  Tony
        Ready       │ [ Describe someone… ]    │        Ready
                    │ or bring a folder        │
                    └──────────────────────────┘
          Theo ·:·.   ◦ The job offer · 21:30       .·:· Jun
          Ready                                        new here
                  Maya ·:·.     . · .  Ines     ·:·  Hugo
                  Ready    Studying · 18 of 30   Ready
                               (12 hours from now)
   Sketches  ∙ Untitled sketch  ∙ Pitch coach
```

- **The dial:** a circle, radius = 38% of the shorter side of the window,
  centred. It isn't drawn as a clock face. It's only a faint hairline ring
  (`#1E2B24`) with **no numbers**. The time lives in one place, the moon.
- **The moon:** a small pale disc (`#E6EEE8` at 0.7, 14px, steady, never
  flashes) at 12 o'clock, outside the ring, with a solid panel `now · 10:40`.
  Since now is always at the top, each hour sits at
  `angle = (hour − nowHour) × 15°` clockwise from 12. The dial turns 15° an
  hour, about 0.004° a second, so nobody ever sees it move.
- **Agents** stand on the ring at their **hour** (the hour of day you
  usually open them; until there's a habit, the hour they were made). Two
  agents in the same hour sit 7.5° apart. With more than 16, a second ring
  outside at 85% scale takes the extras, ordered by hour too.
- **The inner track** (radius 62%): past talks from the **last 24 h** sit
  here at the hour they happened, each one a small steady silver point with
  a panel `The job offer · 21:30`. At most 4; older talks don't show.
  (In the 12-agent set, Lena's Monday talk doesn't appear. Older talks live
  in Talk.)
- **The hollow** (centre, radius 34%): the `New agent` panel. It's always
  here, in every state.
- **Sketches:** glowworms in a strip at the bottom-left corner, outside the
  dial, with the plain heading `Sketches`.

### The four jobs, in clicks

| Job | How | Clicks |
|---|---|---|
| **Find** | On arrival, **focus is already on the agent nearest the moon** (Rex at 10:40), with the normal focus ring and no animation. Press Return, or click anyone on the dial. **Or type**: matching agents stay lit and the rest dim (as in Concept 1, but without the answer flash), the first match gets focus, and Return opens it. | **0** (Return), **1** (click), or type + Return |
| **Pick up a past talk** | Click its light or panel on the inner track. | **1** |
| **See who's studying** | Read it: the words, plus the **progress ring** of points around a studying agent. | **0** |
| **Make new** | The hollow, at the centre of everything: type + Return, or `bring a folder`, or drop files anywhere. ⌘⇧N focuses it. | **0** (type + Return) or **1** |

**Focus and typing.** Focus starts on the agent nearest the moon, not in the
hollow field (the returning user is the common case). Typing a letter while
an agent has focus starts type-to-find; a small solid chip under the moon
shows `Find · Re`. Clicking into the hollow field and typing there makes a
new agent instead. With **0 agents**, focus starts in the hollow field.
Esc clears the find.

**Keyboard order:** → / ↓ = clockwise (later), ← / ↑ = counter-clockwise
(earlier); Tab reaches the inner track, then the hollow.

### Studying vs ready

- **Ready:** the cluster flashes in step at its own tempo.
- **Studying:** the cluster is scattered **and** wears a **progress ring**:
  a small circle of points around the cluster, one per file (capped at 30,
  scaled down). Learned files are lit steady at 0.7; files still to come are
  dim at 0.15. So Ines' ring is 18 lit, 12 dim, and you can *see* how much
  of the circle is closed. The ring never blinks. Words: `Studying · 18 of 30`.
- **new here:** a ready cluster with `new here`. There's no ring.
- **Reduced motion:** the progress ring is already still. Clusters follow the
  shared rule.

### First run (empty)

```
                               ( ) now · 21:10

                    ┌──────────────────────────┐
                    │ New agent                │
                    │ [ Describe someone… ]    │  ← focused
                    │ or bring a folder        │
                    └──────────────────────────┘
                 ·                                  .
```
The hollow and the moon. The dial hairline is **hidden** (an empty ring is
dead UI); a few wild fireflies blink at the edges. ✎ Under the field,
quiet: `They'll keep the hours you keep.` (Cut it if Eraser says it explains
too much. The moon is enough.)

### Key motions

1. **Each agent's own beat** (ready).
2. **The ring closes:** when a file is learned, one dim ring point rises to
   0.7 over 400 ms, ease-out. When the last one lights, all the ring points
   slide into the cluster (600 ms ease-in) and the cluster gives one shared
   flash. The ring is gone; they're ready. (In the demo, Amara's ring gains a
   file every 6 s, so this is visible within a couple of minutes. Ines stays
   at 18 of 30.)
3. **The moon's turn:** the dial angle follows the clock, `(hour − now) ×
   15°`, recalculated every minute. Nobody sees it move.
4. **Find dim:** like Concept 1's dim (160 ms), with no answer flash. Here
   finding is mostly *not needed*, which is the point.

### Glade names (team words; on-screen microcopy marked ✎)

- **the dial**: the ring of hours
- **the moon**: now (✎ `now · 10:40`)
- **their hour**: where an agent stands
- **the hollow**: the New agent panel in the centre (the title stays the
  plain `New agent`)
- **the inner track**: today's past talks
- **the progress ring**: files learned around a studying agent
- **glowworms**: sketches
- ✎ `Find · Re` (the typing chip)
- ✎ `They'll keep the hours you keep.` (first run only)

---

## How the three differ

| | 1 · The Lantern Call | 2 · The Firefly River | 3 · The Night Clock |
|---|---|---|---|
| Layout | Centre panel with two still rings of agents around it | Horizontal bands: far bank of trees / river / near bank | A round dial; agents on its rim, maker in the hollow at the centre |
| Agents are placed by | How recently you talked (inner ring = lately) | Name, A→Z | The hour you usually talk to them; now is at the top |
| Main way to find | **Ask:** type, matches flash back | **Browse:** know the spot in A→Z, or type a prefix for the torchlight | **Habit:** the likely one is already focused under the moon |
| Find, fastest | type + Return (0 clicks) | 1 click | Return (0 clicks, nothing typed) |
| Ready looks like | Flashing on **one shared beat** with your lantern | Its own tempo, **reflected** in the water | Its own tempo, no ring |
| Studying looks like | Off the shared beat (scattered) | Scattered, plus **lights crossing the river** to it (count = files left) | Scattered, plus a **progress ring** of lit and dim points |
| Past talks | A list in the lantern panel, searchable by typing | Moored lights in the water under their agent | Points on the inner track at the hour they happened (last 24 h) |
| Make new | **The same line** as find (Return when no one matches) | The Landing, bottom-left | The hollow, the centre of everything |
| Sketches (glowworms) | A strip under the rings | In the near-bank grass | A strip in the bottom-left corner |
| First run | The lantern alone, pip beating | A bare bank across the water; the Landing in the middle | The moon and the hollow |
| Feels like | Being answered | Walking a place you know | Being expected |
| Scales to 20+ by | A third ring + typing | Sideways scroll + letter posts | A second ring + typing |
| Main risk | One line doing two jobs could confuse (the hint line must always say what Return does) | Sideways scroll hides the far end | "Why is Rex at the top?" before the habit is learned; hours with no data |
| Build weight | Light | Light–medium (reflections, crossing curves) | Light–medium (polar layout) |

**My pick, if forced:** **3 · The Night Clock** for the returning user. It's
the only Home where the most common visit costs *nothing*: arrive, Return,
you're talking to Rex. **1 · The Lantern Call** has the purest first run: the
line you make your first agent with is the line you find them with forever.
**2 · The Firefly River** scales most honestly and gives past talks a home
that makes sense. Build all three.

---

## Ideas I cut (and why)

- **Hover flash ("they noticed you")** from the old Glade: the brief says
  magic before the click makes the returning user miss. Hover now only
  brightens a hairline.
- **Clusters that swim toward your cursor:** it moves the target.
- **A welcome sync flash on every arrival:** it plays on every visit, so it
  costs time 100 times a day. The beat is already there.
- **Sound** (a soft night chorus on Home): Home is a doorway visited many
  times a day. It stays silent on all three pages, and there's no sound
  switch (that would be dead UI).
- **River: talks drift downstream as they age:** they'd be moving targets.
  They're moored instead.
- **Clock: hour numbers around the dial:** one clock (the moon) is enough;
  24 numbers is clutter.
- **Clock: auto-open the agent under the moon:** it takes the choice away.
  Focus without opening is enough.
- **Lantern: showing every past talk, not only 3:** Home is a doorway; the
  full list lives in Talk.
- **Showing rename / delete on any cluster:** the brief rules it out (the
  Name field and the agent menu own them).
- **The ember colour for "studying":** ember means a failed file. Using it
  here would teach the wrong word.

---

## Hand-off

- **Jony:** build three pages, `the-lantern-call.html`, `the-firefly-river.html`
  and `the-night-clock.html`, plus `index.html` with these pitches:
  - *The Lantern Call:* "Type a name and they flash back; the same line makes someone new."
  - *The Firefly River:* "Your agents stand along a river in A to Z order; past talks are moored in the water."
  - *The Night Clock:* "Whoever you usually need at this hour is waiting under the moon."
  
  Build the shared rules once and copy them into each self-contained page.
  Choices that are yours: the exact cluster shapes, the panel sizes within
  what's sketched here, the curve shapes for the crossing, and the type
  scale. If something here fights the brief, the brief wins. Note it in
  `build-notes.md`.
- **Eraser:** the places I expect cuts: Concept 1's two-outcome line (is the
  hint enough?), Concept 2's first-run microcopy and its letter posts,
  Concept 3's first-run microcopy and its pre-set focus. Lines marked ✎ are
  new on-screen words. If one survives into the real app, it has to be added
  to §6 of `updates/2026-11-25 FULL-UX - OPEN/magic-merlin.md`.
- **Columbo:** two assumptions to check with users: that most visits really
  are to a person they already have in mind (Concept 3 leans on it), and
  that people keep agent "hours" at all.
