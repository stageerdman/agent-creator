# Glade Home v2 · three concepts

*Merlin, 2026-11-26. Built from `brief.md` in this folder (Columbo). For Jony
(HTML), then Eraser (cuts). Every concept keeps the Glade look from brief §3.8
and only the two jobs: **New agent**, and **find an agent, then Chat or Edit**.*

---

## The human truth

At 50 agents people don't forget *that* they have someone. They forget
**which handle** they kept them by. The brief's own traps show this: "Amara? Or
Ada?" is a name that slipped; "the contract one" is a need they still
remember; "the one I used yesterday" is a time they still remember. People
hold their agents by one of three handles: **when**, **name** or **need**.

The old three Homes all made the same screen (a box in the middle, lights
around it) and only changed the decoration. These three each pick **one
handle** and build the whole structure around it. So they differ where it
counts: the layout, how you find someone, and where the way to make someone
new lives.

| | Handle | Real-world thing that does the same job | Finding means |
|---|---|---|---|
| **A · The Path** | **When** | A forest path at night: the lights you passed last are the nearest ones. | Recent first, look first, then choose. |
| **B · The Field Guide** | **Name** | A naturalist's field guide: A to Z, every entry a name and one line, guide words at the top of each column. | Everyone has a fixed place; you know where R is. |
| **C · The Groves** | **Need** | A wood where trees grow in stands: you go to the oaks for oak. | Go to the grove for the need, then pick the person. |

### Where I looked (and what I dropped)

| Source | Kept? | Why |
|---|---|---|
| A path walked at night, the last lights nearest | **Kept → A** | Recency as distance. Needs no explaining. |
| A field guide's A–Z entries and guide words (also dictionaries, phone books) | **Kept → B** | Fixed places plus guide words let you jump to a letter by eye with no extra button. |
| Stands of trees / a library shelved by subject | **Kept → C** | Answers "the contract one": Ada, Amara and Abel sit in three different groves. |
| A card catalogue drawer per letter | Dropped | A drawer is a click that hides people. B gets the same help from guide words with zero clicks. |
| Constellations as a map of agents | Dropped | Needs a legend, and every "knowledge map" uses it. |
| Fireflies that drift toward what you type | Dropped | It moves targets while you aim (brief rule 5). |
| Species keeping their own hour (morning editor, evening coach) | Dropped | Already tried in the Night Clock. It reorders by time of day and breaks muscle memory. |
| A clickable A–Z thumb index | Dropped | A second way to find, next to typing and looking (rule 6). Guide words do the job with nothing to click. |

---

## Rules all three share (Jony, build these once)

- **Data:** the 50 rows in brief §5, `{ name, role, last, state }`. C also
  needs `grove` (mapping in C below). Demo bar toggle: `0 · 1 · 12 · 50`.
- **Every agent shows** its name (brightest text), its one-line role (quiet),
  and its state in words with the small firefly mark: `Ready`,
  `Studying · 18 of 30`, `new here`, `sketch`. The sketch is a normal entry
  marked `sketch`, not a separate strip.
- **Type anywhere** on Home to find. The letters you type show in a small
  `Find` chip (where it sits differs per concept, and it is never centred).
  It matches name **or** role, from the start of any word (`law` finds Amara,
  `edi` finds Rex and Vera). `Esc` clears. There's no input box to click,
  so nobody mistakes it for "describe a new agent".
- **Drop a folder anywhere** on Home and the new-agent start opens with that
  folder in. That's the same door as `New agent`, not a second button.
- **Stub screens:** `Chat · Rex` (with the brief's studying line for Ines and
  Amara), `Edit · Rex`, `New agent`. Each has a `Back to Home`.
- **Nothing moves by itself.** No motion near names. Hover only brightens a
  hairline to `#3A4A40`. Reduced motion: every fade is instant, and every flash
  becomes a 1 s steady glow.
- **0 agents:** the whole screen is the new-agent start: `New agent`,
  `Who do you have in mind?`, `Drop a folder, or start here.`

---

## A · The Path

**Pitch (for the index):** *Your most recent people nearest you. Pick one, see who it is, then Chat or Edit.*

**File:** `concept-a-path.html`

### Layout: two panes, list and clearing

```
┌──────────────┬────────────────────────────────────────┐
│ + New agent  │                                        │
│ Find: am_    │      ·                     ·           │
│ TODAY        │   ┌──────────────────────────────┐     │
│ ▸ Rex        │   │ ✦ Rex                        │     │
│   Blunt edi… │   │ Blunt editor for my newsletter│    │
│   Maya       │   │ Ready · last talked today 09:50│   │
│   Career m…  │   │                              │     │
│ YESTERDAY    │   │ [ Chat ]   Edit              │     │
│   Ines       │   └──────────────────────────────┘     │
│   …          │          ·                             │
└──────────────┴────────────────────────────────────────┘
   the path              the clearing
```

- **Left, the path:** a narrow column (~300px), full height. Agents in order
  of last use, newest at top, with quiet day markers (`Today`, `Yesterday`,
  `This week`, `Earlier`). Each row has the name, then the role on the next
  line, 44px. At 12 it all fits with no scroll at 1024×768. At 50 the path
  scrolls, but you never need to (see find).
- **Right, the clearing:** one solid panel showing the **highlighted** agent:
  name large, role, state, `last talked …`, and two buttons, **`Chat`**
  (primary, lit) and **`Edit`** (quiet, same size of word). The field around
  the panel is the only place firefly points may live (a few, slow, ≥ 8px
  off the panel).
- On load, **the most recent agent is already highlighted**, so "same person
  as last time" is one click.

### Find

The handle is **when**. You look first, then choose. The clearing shows *who*
before you commit, which guards against the brief's worst 50-agent fear:
opening the wrong Editor.

- **Typing** filters the path in place: only matches stay, in the same
  recency order. The first one is highlighted and shown in the clearing. The
  `Find` chip sits on the second row of the path, under `New agent`. `Esc`
  brings the full path back.
- **Keys:** `↑ ↓` move the highlight (the clearing follows). `Return` = Chat.
  `Tab` reaches `Edit`.

| Agents | Chat | Edit | Rough time |
|---|---|---|---|
| **1** | Rex is already in the clearing: click `Chat` (**1 step**) | click `Edit` (**1 step**) | < 1 s |
| **12** | click Maya in the path (1), click `Chat` (**2**) | click Maya (1), `Edit` (**2**) | ~1.5 s |
| **50, recent** (Tony, row 4) | click Tony (1), `Chat` (**2**) | Tony (1), `Edit` (**2**) | ~2 s |
| **50, older** (Amara, "the contract one") | type `con` (1), Amara is highlighted, `Return` or `Chat` (**2**) | type (1), `Edit` (**2**) | ~3 s |

### New agent: the trailhead

`+ New agent` is the **first row of the path**, pinned. It never scrolls and
is never pushed down by the list. It's where every path starts. One click
opens the start screen. At 0 agents the path is empty and the clearing *is*
the start. Dropping a folder anywhere brightens the trailhead's hairline to
`--fly` while you hold it, then opens the start with the folder in.

### Open to edit vs chat

Two equal, plain words on the clearing: `Chat` (lit, default, `Return`) and
`Edit`. Clicking a name in the path only highlights it. It never opens
anything, so an accidental click costs nothing.

### Quiet magic (2)

1. **They answer.** After you click `Chat`, the firefly mark in the chat
   header gives one flash (rise 120 ms, fall 900 ms) as the chat opens. You
   called, they answered. It plays *after* the screen has changed, so it
   never delays anything. It doesn't play on highlight, so arrowing down the
   path never flickers.
2. **The trailhead holds the light.** While a folder is held over the window,
   only the trailhead's hairline lights. It tells the truth about where the
   drop is going.

---

## B · The Field Guide

**Pitch (for the index):** *Everyone on one page, A to Z, each in a place that never changes. Click a name to chat.*

**File:** `concept-b-field-guide.html`

### Layout: one full-width page of entries, a gate at the bottom

```
 Find: law_                                    (top-left chip)
 Abel – Elif       Emil – Iris       Ivan – Maya     Mina – Sol     Tara – Zane
┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐  ┌────────────┐
│✦ Abel  Edit│   │✦ Emil  Edit│   │✦ Ivan  Edit│   │✦ Mina  Edit│  │✦ Tara  Edit│
│ Sunday ser…│   │ Philosophy…│   │ Chess coach│   │ UX researc…│  │ Wedding sp…│
├────────────┤   ├────────────┤   ├────────────┤   ├────────────┤  ├────────────┤
│✦ Ada   Edit│   │ …          │   │ …          │   │ …          │  │ …          │
│ Python cod…│
│✦ Amara Edit│   (cards without a match dim to 25% while you type)
│ Contract l…│
└────────────┘
════════════════════════════════════════════════════════════════════════════
  + New agent        or drop a folder anywhere                   (the gate)
```

- **No side panel and no centre.** The whole field is one page of entries,
  like a field guide spread open. Entries run **A to Z, top to bottom, then the
  next column**. Rows per column = `max(4, ceil(n / 5))`, so: 1 agent = one
  entry top-left; 12 = three columns of 4; 50 = five columns of 10. All 50
  are visible at 1024×768 with no scroll (entries ~52px tall, ~190px wide).
- **Guide words** sit above each column in quiet small caps, like the top of
  a dictionary page. At 50: `Abel – Elif`, `Emil – Iris`, `Ivan – Maya`,
  `Mina – Sol`, `Tara – Zane`. You know R is in the fourth column without
  reading names. They aren't clickable. (`Untitled sketch` sorts under U.)
- **Each entry** is a small solid card: firefly mark, **name**, the word
  `Edit` at the right edge (quiet), and the role on the second line. State
  words sit after the role only when they're not `Ready` (`Studying · 4 of 22`,
  `new here`, `sketch`). Entries used today or yesterday show a quiet
  `today` / `yesterday` instead, so recent ones are easy to spot without
  reordering anything.
- **Places never change** because of use. Only a new agent changes the page,
  by slotting into its letter.

### Find

The handle is **name**, held as a **place**. After a few visits you know Rex
lives lower in the fourth column, the way you know where a word sits on a
page.

- **By eye:** guide words, then the name. At 50 this beats typing for
  anyone who remembers the first letter.
- **Typing:** the `Find` chip sits top-left above the first column. Cards
  that don't match **dim to 25%** where they stand. Nothing moves, nothing
  reflows. The first match gets the focus ring. `← → ↑ ↓` jump between lit
  cards only. `Return` = Chat.

| Agents | Chat | Edit | Rough time |
|---|---|---|---|
| **1** | click Rex (**1 step**) | click `Edit` on his card (**1 step**) | < 1 s |
| **12** | find Maya by guide word, click (**1**) | click her `Edit` (**1**) | ~1.5 s |
| **50, by eye** (Rex) | guide words `Mina – Sol`, click Rex (**1**) | his `Edit` (**1**) | ~3 s |
| **50, by role** (the contract one) | type `con` (1), only Amara stays lit, `Return` (**2**) | type (1), click her `Edit` (**2**) | ~3 s |

### New agent: the gate

A **full-width strip along the bottom edge** of the window, outside the
page: `+ New agent` as a lit button, then quiet text:
`or drop a folder anywhere`. It sits below the guide, not in it, so the list
can never crowd it or push it away, and it's in the same place at 1, 12 and
50. At 0 agents the page is empty and the start fills the screen.

### Open to edit vs chat

The **card is Chat** (the common ending costs one click). **`Edit` is its own
word on the card**, always visible, never hover-only. Clicking `Edit`
doesn't also open Chat.

### Quiet magic (1)

1. **Dusk.** When you type, the rest of the field dims around the matches
   (180 ms fade; reduced motion makes it instant). The ones you're after keep
   their light, and nothing has moved. It's the find itself, done in the
   world's own language: the meadow goes dark, and your person is still
   glowing where they always stand.

*Firefly points:* only in the strip of field between the page and the gate
when there is room (1 and 12). None at 50.

---

## C · The Groves

**Pitch (for the index):** *People grouped by what they help with, and a tall door on the left to start someone new.*

**File:** `concept-c-groves.html`

### Layout: a door down the left, groves as columns

```
┌───────────┬───────────────────────────────────────────────────────────┐
│           │ Find: _                                                   │
│           │ WORK         WRITING      LEARNING     BODY & MIND  HOME & LIFE│
│  + New    │ Maya   Edit  Rex    Edit  Ines   Edit  Marcus Edit  Hugo  Edit│
│   agent   │ Career m…    Blunt ed…    Her desi…    Running…     Cookbook…│
│           │ Tony   Edit  Theo   Edit  Lena   Edit  Sol    Edit  Bruno Edit│
│ Who do    │ Amara  Edit  Clara  Edit  Jun    Edit  Grace  Edit  …        │
│ you have  │ Priya  Edit  …            …            …                     │
│ in mind?  │ …                                      UNSORTED              │
│           │                                        Untitled sketch       │
│ Drop a    │                                                           │
│ folder    │                                                           │
│ here or   │                                                           │
│ anywhere. │                                                           │
└───────────┴───────────────────────────────────────────────────────────┘
  the door                    the groves
```

- **Left, the door:** a tall solid panel, the full height of the window,
  fixed **240px** wide at every count (it doesn't grow or shrink, so it's
  never a moving target). The whole panel is one button: `New agent`, then
  quiet `Who do you have in mind?` and `Drop a folder here, or anywhere.`
  At 0 agents it widens to fill the screen.
- **Right, the groves:** five columns, one per need, with plain headings:
  `Work`, `Writing`, `Learning`, `Body & mind`, `Home & life`. Inside each
  grove, people are in order of last use (the recent ones sit at the top of
  their grove). The sketch sits in a small `Unsorted` grove under the
  shortest column. Rows: name + `Edit` on line one, role on line two, 44px.
  At 50 the longest grove holds 12, so everything fits without scroll at
  1024×768. Only groves that have someone in them are shown (at 1 agent:
  just `Writing` with Rex).
- **Where a grove comes from (assumption):** Glade picks it from the role
  when the agent is made. The user can change it in Edit. The user is never
  asked to file anyone during New agent; that would slow Job A.

### Find

The handle is **need**. You don't have to remember "Amara or Ada". You go to
`Work`, and there's the contract lawyer. Ada sits in Work too, but with
`Python code reviewer` under her name, and Abel is over in `Writing`.

- **By eye:** grove heading, then the name near the top (recent first).
- **Typing:** the `Find` chip sits top-left of the groves, above `Work`.
  Rows that don't match dim to 25% where they stand, and so do grove headings
  with no match in them. `↑ ↓` move within the lit rows, `← →` jump to the
  next grove that has a match. `Return` = Chat.

| Agents | Chat | Edit | Rough time |
|---|---|---|---|
| **1** | click Rex (**1 step**) | click `Edit` (**1 step**) | < 1 s |
| **12** | `Work` → click Maya (**1**) | her `Edit` (**1**) | ~1.5 s |
| **50, by need** (the contract one) | `Work` → click Amara (**1**) | her `Edit` (**1**) | ~3 s |
| **50, by name** (Iris) | type `iri` (1), `Return` (**2**) | type (1), click `Edit` (**2**) | ~3 s |

### New agent: the door

Not a button in a list and not a strip at an edge: it's **a whole side of the
room**. It's the biggest single target on Home, in the same place every
time, and the obvious drop target for a folder. Click anywhere on it (1 step)
to open the start.

### Open to edit vs chat

Same rule as B (the **row is Chat**, and `Edit` is its own visible word on the
row). The concept differs in layout, find and new-agent place. The open
pattern is the same on purpose, so people coming from either one already know it.

### Quiet magic (1)

1. **Planted.** After you finish making someone and come back to Home, the
   door shows one plain line under `New agent`, for this visit only:
   `Bea is in Home & life. Move her in Edit.` It's not a link and not a second
   Edit (Edit stays on Bea's row). It tells you where your new person lives,
   once, without moving any row. On the next visit it's gone. *Demo: show it
   after `Back to Home` from the New agent stub, using the name Bea.*

*Firefly points:* only in the empty field to the right of the groves (1 and
12). None at 50.

### Grove mapping for the 50 (Jony: add `grove` to each row)

| Grove | People (in brief order = last-used order) | Count |
|---|---|---|
| **Work** | Maya, Tony, Amara, Priya, Ada, Dev, Mina, Paula, Zane, Dora | 10 |
| **Writing** | Rex, Theo, Clara, Jade, Nadia, Tara, Vera, Abel, Holly | 9 |
| **Learning** | Ines, Lena, Jun, Elif, Felix, Ivan, Quinn, Sami, Cyrus, Emil, Iris, Jonas | 12 |
| **Body & mind** | Marcus, Sol, Grace, Xena, Yara, Kai | 6 |
| **Home & life** | Hugo, Bruno, Hana, Kofi, Lars, Oscar, Rosa, Umar, Wes, Bea, Fern, Gus | 12 |
| **Unsorted** | Untitled sketch | 1 |

At 12 agents: Work = Maya, Tony, Amara, Priya · Writing = Rex, Theo ·
Learning = Ines, Lena, Jun · Body & mind = Marcus, Sol · Home & life = Hugo.

---

## How the three differ (structure only)

| Axis | A · The Path | B · The Field Guide | C · The Groves |
|---|---|---|---|
| **Layout** | Two panes: narrow list left, one agent's clearing right | One full-width page of A–Z cards in columns, nothing else | Tall door left, five grove columns right |
| **Order** | Last used, newest first (changes between visits) | A to Z, fixed places | By need, then last used inside each grove |
| **Handle you find by** | **When** you last talked | **Name**, held as a place | **Need**, what they help with |
| **How you find** | Look at the top, or type to **filter** the list | Guide words by eye, or type to **dim** the rest in place | Grove heading by eye, or type to **dim** rows and groves |
| **`Find` chip lives** | In the list column, under New agent | Top-left, above the first column | Top-left of the groves |
| **New agent lives** | **Inside the list**: pinned first row (the trailhead) | **Outside the list, bottom edge**: a full-width gate | **A whole side of the room**: 240px door, full height |
| **Chat vs Edit** | Click = highlight. Two buttons in the clearing | Card = Chat, `Edit` word on the card | Row = Chat, `Edit` word on the row |
| **Steps at 50 (Chat)** | 2 (pick, Chat) | 1 by eye, 2 by typing | 1 by eye, 2 by typing |
| **Its trade-off** | One more click, but you see who before you open | Recent ones aren't on top (just marked `today`) | Needs a grove per agent (Glade picks, Edit changes) |
| **Magic** | They answer (flash after Chat) · trailhead holds the drop light | Dusk (the field dims around matches) | Planted (one line on the door after making someone) |

None has a centred search bar or a centred panel with agents around it. A's
clearing sits to the right of a list and holds one agent, never a search.

---

## Small ideas I cut, and why

- **A flash when you hover or highlight an agent.** It comes before the click,
  sits next to a name, and would flicker while you arrow down.
- **A steady lantern glowing on C's door.** Pure decoration; the door is
  already the biggest lit target.
- **C's door growing at few agents and shrinking at many.** It would be a
  target that moves between visits. Fixed at 240px.
- **A `Favourites` or pinned row.** A second way to find, and a third kind of
  thing on Home.
- **Asking the user to pick a grove during New agent.** It slows the job
  that has to feel like "three seconds later I was describing them".
- **A clickable A–Z rail in B.** Duplicates typing and looking. Guide words
  give the same help with nothing to click.
- **Double-click to chat in A.** A second way to do one thing. `Return` is
  enough for keyboard people.
- **Fireflies gathering near the most recent agent.** Pulls the eye off
  names, which was the old Homes' exact problem.
- **A new card "flying in" to its letter in B.** Motion near names, and it
  happens before any click.

---

## Words and notes for the team

- **New on-screen words** (to add to §6 of
  `updates/2026-11-25 FULL-UX - OPEN/magic-merlin.md` if a concept is chosen;
  I didn't touch that file in this task): `Find`, `last talked …`, the day
  markers `Today · Yesterday · This week · Earlier`, the grove names
  `Work · Writing · Learning · Body & mind · Home & life · Unsorted`,
  `Who do you have in mind?`, `or drop a folder anywhere`,
  `[Name] is in [Grove]. Move her/him/them in Edit.` (use the agent's
  pronoun if known, else `them`).
- **Jony:** files are `concept-a-path.html`, `concept-b-field-guide.html`,
  `concept-c-groves.html`. Index pitches are the lines in italics under each
  concept name.
- **Eraser, the places to push on:** A's 2 steps at 50 (is the preview worth
  it?), B's recency (is `today`/`yesterday` enough?), and C's mapping (does
  every agent land where people would look?).
