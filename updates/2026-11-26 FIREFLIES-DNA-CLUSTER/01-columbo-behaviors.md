# 01 · Columbo — how people look at an agent's cluster

## Summary

People don't study an agent's cluster. They **glance** at it, in a list, for
under a second, to find *their* agent and to feel that it's alive. The
cluster's job is the job of an avatar: "that's mine, it's fine". Only now
and then do they look closer, when they add or remove a file and want to see
the cluster react. So the 56 px version is the real product. The larger
preview is only there to check what the small one is doing.

## Scope

**In:** the cluster at avatar size in the home rows, the same cluster larger,
and the moments where a file is added or removed. This is what Phase 1 of
`00-roadmap.md` builds.
**Out:** the big map, replay and timeline (removed for good); event dots;
the profile page (Phase 3); people with hundreds of agents (no sign yet that
they exist).

## Where we start: the real code

`src/server/public/agent-home.html`, lines 182–260:

- `cluster(a, cv)` seeds a random generator from the agent's name + id and
  picks **14–29 dots** (`14 + Math.floor(r() * 16)`).
- `slot(i, n, R, seed)` puts dot *i* on a **golden-angle spiral**
  (`i * 2.39996 + seed`, radius `R * sqrt((i + .5) / n)`), squashed to
  **.86** vertically.
- `radius(n)` = `22 + 8 * sqrt(n)`; `c.scale = (BOX / 2 - 4) / R` fits it in
  **`BOX = 56`** px.
- `flash(dt)`: the synced firefly flash, rise 120 ms, fall 900 ms. All
  joined dots fire on one beat (period 2.4–3.4 s), up to ~25 ms apart.
- `drawCluster(c, t, dt)` draws the warm green sprites `FLY` and `WARM`
  with `lighter` blending. At rest a dot is drawn at **alpha .1** and sprite
  size `18 * max(.42, scale)` ≈ **7.5–8 px**; at the flash peak, alpha .9 and
  about **12 px**.

Two facts from this code matter most for the report:
1. **Between flashes the cluster is very dim** (alpha .1). Size and colour
   mostly show *during* the flash.
2. **A resting dot is about 8 px of glow with a ~2 px bright core.** That is
   all the room there is for "big file" vs "small file".

## How people use avatars today (short check)

- In Slack, GitHub, Discord and phone contacts, people find "theirs" in a
  list by **colour and outline first**, almost never by detail. Generated
  avatars (GitHub identicons, Boring Avatars) work because they are a few
  big shapes and one or two colours.
- People notice when an avatar **changes**, and a change they didn't make
  feels wrong ("did someone edit my thing?").
- Motion in a list pulls the eye. One moving item is a signal; every item
  moving the same way is wallpaper.
*(From common knowledge of these apps, not a new study. Assumption marked.)*

## Behaviour table

Sorted by likelihood + frequency.

| # | Behaviour | Likelihood | Frequency | Reason |
|---|---|---|---|---|
| B1 | **Glance at the home rows** to see all agents are there and alive | 9 | 9 | Happens every time the home opens; nobody stops to read it |
| B2 | **Spot my agent** in the list by its cluster, before reading the name | 8 | 8 | Avatars are how people scan lists; names come second. Lowered from 9: with few agents, people may just read names |
| B3 | **Add a file and watch the cluster change** | 8 | 7 | It's the one moment the cluster says "I got it". Not daily: files are added in bursts |
| B4 | **Remove a file and check the dot is gone** | 7 | 7 | After a mistake or a privacy worry; they want proof, fast |
| B5 | **Compare two agents** side by side ("why does this one look fuller?") | 7 | 7 | Two neighbouring rows invite it. Scored lower because it's a passing thought, not a task |
| B6 | Open the larger preview to "read" the cluster: which topic is which colour, which file is biggest | 6 | 4 | Curious users and builders; most never need it |
| B7 | Play with min/max size to make the cluster "look nice" | 5 | 3 | Playground users only; real users won't see this control |
| B8 | Use the cluster as a rough "how much does it know" meter | 6 | 5 | Fuller = smarter is the natural reading, true or not |
| B9 | Show the agent to someone else ("look, this is mine") | 5 | 3 | A pride moment, rare but strong |
| B10 | Add the same file twice by accident | 4 | 3 | Happens with drag-drop; the cluster shows it only if dots are counted |

**Watch out** (low score, but can break trust):

- **W1 · "My agent looks different and I didn't touch it."** If the seed or
  the order shifts when a file is added, the whole cluster jumps. The person
  stops recognising it. Trust breaks.
- **W2 · Two agents look the same.** With similar file sets they could get
  look-alike clusters. Then B2 fails and people pick the wrong agent.
- **W3 · A removed private file still seems to be there.** A dot that fades
  slowly or a count that doesn't change reads as "it kept my file".
- **W4 · One huge file eats the avatar.** A 2 GB zip at max size can hide
  every other dot inside 56 px.

## Deep dives

### D1 · Glance at the home rows (B1)

- **Moment:** morning, laptop, just opened the app to get to work. Or on the
  phone between meetings.
- **Trigger:** they want to *use* an agent; the home list is in the way.
- **Thoughts:** "OK, they're all here. Go."
- **Emotions:** neutral → a small warm feeling if the rows feel alive →
  gone in a second.
- **Expectations:** the list is there at once, nothing to wait for, nothing
  that blinks for attention.
- **Success:** they don't notice the clusters on purpose, but the page feels
  calm and living.
- **Friction and fears:** all rows flashing at the same rhythm looks like an
  error light; flashes that are too bright pull the eye from the names.
- **Product insight:** the cluster must look calm at rest and still be
  *there* at alpha .1. Each agent keeps its own beat (period 2.4–3.4 s) so
  rows never flash together. Don't make the resting state brighter just to
  show colour; let the flash carry it.

### D2 · Spot my agent (B2)

- **Moment:** home list with 4–12 agents, scrolling a little.
- **Trigger:** "I need *the recipe one*."
- **Thoughts:** "Mine is the… bluish, round one. There."
- **Emotions:** a small hunt → relief when the eye lands.
- **Expectations:** found in under a second, by shape and main colour, the
  same way every day.
- **Success:** the eye lands on the right row before reading the name.
- **Friction and fears:** clusters that differ only in detail all look like
  "a green blob"; a cluster that changes shape after an edit (W1).
- **Product insight:** what makes an agent recognisable at 56 px is three
  things only: the **main topic colour** (the topic with the most files),
  the **outline** (how full or sparse; the spiral turn from the name
  seed) and **how many dots**. Individual dot sizes won't be read here. The
  seed must come from the name and stay put: adding a file adds one dot on
  the spiral, it doesn't reshuffle the others.

### D3 · Add a file and watch the cluster change (B3)

- **Moment:** at a desk, dragging a PDF or a folder in. Focused, a bit
  hopeful.
- **Trigger:** they want the agent to know something new.
- **Thoughts:** "Did it take it? Where is it? Is that one mine?"
- **Emotions:** hope → a quick check → delight when one new light appears.
- **Expectations:** the change is visible right away, in the same place they
  dropped the file, in one step. They look at the **56 px** one first,
  because that is the one they know.
- **Success:** a new dot arrives, in the topic's colour, and the rest of the
  cluster stays where it was. If it's a big file, the dot is clearly bigger.
- **Friction and fears:** nothing visible changes (at 29+ dots one more is
  invisible); the whole cluster moves (W1); the new dot is only visible in
  the preview.
- **Product insight:** the new dot needs a short, clear arrival at avatar
  size (its own flash, not just the next shared beat), and the old dots must
  keep their slots. Reduced motion: it simply appears, fully lit for a
  moment.

### D4 · Remove a file and check it's gone (B4)

- **Moment:** after "oops, wrong file" or "I shouldn't have shared that".
  Often a bit tense.
- **Trigger:** a mistake or a privacy worry.
- **Thoughts:** "Is it really gone? Does it still *know* it?"
- **Emotions:** worry → needs proof → relief.
- **Expectations:** the dot goes **at once**, the count drops by one, no
  lingering glow.
- **Success:** they can point at the spot where it was and see it's empty,
  and the rest of the cluster is the same.
- **Friction and fears:** a slow fade-out that looks like "still there"
  (W3); other dots jumping into the gap so they can't tell which one left.
- **Product insight:** removal is plain and quick: no magic on deletion
  (team rule). The other dots should not shift so the gap is readable, at
  least for a moment.

### D5 · Compare two agents (B5)

- **Moment:** two rows next to each other, often a new agent under an old
  one.
- **Trigger:** one looks fuller, brighter or more colourful.
- **Thoughts:** "Why does this one have more? Is the new one weaker?"
- **Emotions:** curiosity, sometimes a small worry for the newer agent.
- **Expectations:** the difference has a simple reason: more files, more
  topics, bigger files.
- **Success:** "Ah, it's just read more." No hidden scoring feeling.
- **Friction and fears:** two different agents that look alike (W2); one
  agent that looks "better" for no reason they can name.
- **Product insight:** differences at 56 px should come only from the files
  (count, topics, size) and the name seed. Two agents with the same files
  but different names must still look clearly different; that's the name
  seed's job.

## Key insights — what must still read clearly at 56 px

1. **"This is mine."** Main topic colour + outline + rough dot count,
   stable from day to day. The name seed sets the outline and spiral turn
   and never changes.
2. **Topic colours stay apart.** The fixed hue slots
   (`[0, .67, .33, 1, .5, .17, .83]`) are far enough apart in the big view,
   but at 56 px glows overlap and `lighter` blending mixes neighbours
   towards pale yellow-white. Check the colours *on the 56 px canvas*, at
   rest and at the flash peak. If they mix, use smaller glow or a brighter
   core, not more dots.
3. **Big vs small file, only as a ratio.** A resting dot is ~8 px with a
   ~2 px core. A size difference below about 2× won't be seen at 56 px. The
   min/max range should make the biggest dot clearly bigger, but max must
   still fit, so one huge file can't cover the others (W4).
4. **One added or removed dot is visible.** Old dots keep their slots; the
   new one gets its own short arrival; a removed one goes at once.
5. **Calm at rest, alive on the beat.** Alpha .1 between flashes is fine for
   the list; colour and size show on the flash. Each agent its own beat.
6. **Compact.** The whole cluster stays inside the 56 px box with its glow,
   at every file count the sample set can reach.

## Open questions

- **Very few files (0–3).** The current code never draws fewer than 14
  dots. What does a new agent with 1 file look like: one lonely light, or
  a small cluster? *Assumption: one light per file, honestly — but it needs
  to look intentional, not broken.*
- **Very many files (100+).** One dot per file won't fit in 56 px. Cap,
  merge, or shrink? Not needed for the Phase 1 sample set; needed before
  Phase 2.
- **Learning rows.** The real code has loose dots that drift in and join.
  Do new files use that same loop as their "arrival"? Worth trying; it's
  already the agent's own language.
- **Is the main colour enough?** If most agents have the same top topic
  (say "notes"), colour stops helping B2 and the outline must do the work.
