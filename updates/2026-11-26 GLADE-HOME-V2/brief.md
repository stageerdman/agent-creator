# Glade Home v2 · brief

*Columbo, 2026-11-26. For Merlin (concepts.md), Jony (HTML), Eraser (review).
This replaces `updates/2026-11-26 GLADE-HOME-CONCEPTS/home-brief.md`. Where the
two disagree, this one wins.*

**In one line:** Home does two things only. **Add a new agent.** **Find an
agent, then edit it or chat with it.** Everything else leaves Home.

---

## 1 · The two jobs

Home is a doorway that people pass through many times a day. Success is
counted in seconds spent *leaving* Home toward the thing they came for.

### Job A · Add a new agent

> *When I have a person in mind that I don't have yet (a blunt editor, my
> old professor, my mum's recipes), I want to start them right now, so I
> can talk to them before the idea goes cold.*

| | 1 agent | 12 agents | 50 agents |
|---|---|---|---|
| **Moment** | Day one or two. Evening, laptop, curious and a bit unsure. They just made their first one and want a second "to see if it works again". | Week two or three. Mid-task, an idea pops up: "I need someone for pricing." Quick, on purpose. | Power user. Making agents is a habit, maybe several a week. Often holding a folder they just exported. |
| **Trigger** | "That worked. What about Dad's letters?" | A real problem nobody on the list covers. | A new project, a new client, a folder in Finder. |
| **Expectations** | The way in is obvious without reading. One click, or start typing. | Same spot as last time, under 1 s to locate, no hunting. | Never pushed down or scrolled away by the list. Dropping a folder just works. |
| **Friction and fears** | "Where's the button now that I have one?" Fear of overwriting the first agent. | The add action looks like a search box, so they type a description and get "no results". | The add action is buried at the end of a long list, or the list crowds it. Fear of making a duplicate. |

**What "done well" feels like:** "I had the thought and three seconds later
I was already describing them." Frequency is low after week one (score 3 of
10 in the old brief), but importance is high: it is the whole screen on
first run and the reason the app exists.

### Job B · Find an existing agent, then edit it or chat with it

> *When I need a particular person (Rex, about Friday's newsletter), I want
> to get to them at once and say whether I'm here to talk or to change
> them, so I'm not slowed down at the exact moment I have the question.*

Two endings, one find:
- **Chat** is the common ending (most visits). "I need Rex about this."
- **Edit** is the rarer ending. "Rex is too soft, fix his tone", "add these
  new files to Ines", "rename the sketch". Assumed about 1 in 5 visits.

| | 1 agent | 12 agents | 50 agents |
|---|---|---|---|
| **Moment** | Any time. They know exactly who; there's only one. | Mid-morning, between tasks, maybe tired. A real question in their head. | Busy, many agents, many look alike ("Editor", "Editor (blunt)"). They remember a name, a role or "the one I used yesterday". |
| **Trigger** | A question for the one agent. Or "it said something wrong, let me fix it". | "I need Maya about the job offer." | "Where's the contract one… Amara? Or was it Ada?" |
| **Expectations** | The agent *is* the page's main thing. 1 click to chat, 1 click to edit. | See the name without looking for it, recent ones easy, under 2 s. | Type a few letters or recognise by role. The likely ones are near the top. Under 5 s. Never scroll through all 50. |
| **Friction and fears** | Having to "find" one item feels silly. Not knowing how to edit (old Homes only opened chat). | Things that move between visits. Status lights pulling the eye away from the names. | A long, flat grid with no order. Names only, no role, so two look the same. Typing that doesn't match the role. Opening the wrong agent and losing time. |

**Edit vs chat, what people expect:** Chat is the default and must cost
nothing extra. Edit must be visible on the agent once it's found, not hidden
in a right-click or a menu they've never seen. One plain word each: `Chat`,
`Edit`. Assumption: clicking the agent itself goes to Chat, and `Edit` sits
next to it. Concepts may choose differently, but both must be obvious and
one step after finding.

---

## 2 · Why the old three felt messy and hard to find

*What the user said, as passed to the team (the exact sentences weren't
written down in a file, so these are their words as relayed in the goal):*
"messy", "hard to find", "they all looked the same", and they want designs
"built around two actions: add a new agent, find an existing one to edit or
chat". They love the Glade style; that's not the problem.

**What competed with the two actions.** The old brief (my own) gave Home
four jobs, and the concepts built all four:
- **Past talks** on Home: `Where you left off` (Lantern), moored lights in
  the river (River), the inner track (Clock). A third kind of thing to click.
- **Studying status** as a job: lights crossing the river, progress rings,
  off-beat scatter. Pretty, but a show running beside the names.
- **Sketches** as a separate strip of glowworms. A fourth kind of target.
- **One line doing two jobs** (Lantern): find *and* make in one box, with a
  hint line to explain what Return will do. If you need a hint, it's two
  things pretending to be one.
- **Demo-only and world extras** read as content: the moon and `now · 10:40`
  chip, the typing chip, letter posts (cut later), wild fireflies.

**What pulled the eye away.** Every agent was a living, blinking cluster.
At 12 agents that's 12 lights fighting the one thing the user wants to
read: a name. Motion always wins attention over text (that's how eyes
work), so the eye went to lights, then to the panel, then hunted for the
name. In the River the water moved; in the Clock the pre-focus ring and the
moon sat at the top. None of these is a job the user hired Home for.

**Why all three looked the same.** Each one was, at heart, **a solid panel
in the middle with agents scattered around it**: the lantern panel with
rings around it; the hollow with the dial around it; the River was bands,
but still a "panel + things around it" reading. The metaphor changed (ring,
river, clock), the structure didn't. So from a step back they were the
same screen: a centred box, and lights orbiting it. The differences lived
in decoration and motion, which is exactly what doesn't count.

**What else was missing.** **Edit** had no place at all. One click opened
Chat, and there was no way to say "I'm here to change Rex". Half of Job B
had no door.

---

## 3 · Hard rules

1. **Only two actions on Home.** `New agent` and finding an agent (which
   ends in `Chat` or `Edit`). Nothing else is clickable on Home except the
   demo bar. No past talks, no sketches strip, no status show, no clock, no
   hint lines that explain a double-use box.
2. **Nothing competes with them.** No motion near names or targets. Light
   and motion may live only where there's no text and no target, and must
   be quieter than the names. Names and roles are the brightest text.
3. **Finding is fast and obvious at every size.** "Fast" means:
   - **1 agent:** visible on load with no searching. **1 step** to Chat,
     **1 step** to Edit. Under **1 s** to spot.
   - **12 agents:** all visible with no scroll at 1024×768. Spot by eye in
     under **2 s**. Agent open in **≤ 2 steps** (click it, or choose
     Chat/Edit).
   - **50 agents:** right agent found in under **5 s**, **≤ 3 steps** to
     Chat or Edit (for example: type 2–3 letters, pick, choose). No step is
     "scroll and look". The most recently used ones are reachable without
     typing.
   - Typing a name or a **role word** ("lawyer") must find it. Keyboard
     works: arrows move, Return opens Chat.
4. **No centred search bar with things around it.** No input or panel in
   the middle of the screen with agents arranged around it, in any shape
   (ring, dial, river bands). If there is a type-to-find, it sits somewhere
   else and is not the centre of the page.
5. **Targets never move.** An agent's place doesn't change during a visit,
   and doesn't jump on hover. Hover only brightens a hairline.
6. **One way to do each thing.** One `New agent` door (dropping files
   anywhere on Home may start it too; that's the same door, not a second
   button). One `Edit`, one `Chat`.
7. **Three truly different structures.** They must differ in layout, in
   how you find, and in where `New agent` lives. Colour, theme or motion
   don't count as differences.
8. **Keep the Glade style.** From `updates/2026-11-25 MAGIC-CONCEPTS/glade-fireflies.html`
   and the old Home pages, keep:
   - The palette: field `#0B1410`, shadow `#060B08`, fly `#D8F26A`
     (halo the same at 25%, blur 12px), text `#E6EEE8`, quiet `#8C9A90`,
     panel `#101A15`, hairline `#1E2B24`, hover hairline `#3A4A40`. No
     ember `#E89A4A` on Home (it means a failed file).
   - Dark night field; light only as small points on a canvas; **all words
     on solid panels**, points at least 8px clear of any panel.
   - The flash shape: rise 120 ms ease-out, fall 900 ms ease-in; at most
     one flash per 2 s; low contrast.
   - Each agent has a small firefly mark; **in step = Ready, scattered =
     Studying**, and the words always say it (`Ready`,
     `Studying · 18 of 30`, `new here`). One small mark, not a big cluster.
   - Plain labels; the world lives only in light and a little microcopy.
   - Focus ring `2px solid var(--fly)`; system font; reduced motion =
     steady glows that still tell the truth.
9. **Magic stays quiet.** At most one or two small moments per concept.
   None before the click, none that delays a target, none that needs
   explaining. If the user would notice it on the 100th visit and feel
   slowed, cut it.

---

## 4 · Watch out, and open questions

**Watch out** (low score, but could break trust):
- **Opening the wrong agent at 50.** Similar names ("Editor", "Editor ·
  blunt") make mistakes likely. Every agent shows a name **and** a one-line
  role.
- **Edit by accident.** If Edit is one click, an accidental click must not
  change anything. Opening Edit is safe; changes there follow the existing
  rules (hand edits win, Undo over "are you sure?").
- **Empty Home (0 agents).** A dark empty field looks broken. With 0
  agents, `New agent` is the whole screen. (Not one of the 1/12/50 sets,
  but the toggle may include it.)
- **Studying agents.** People will open them. Don't block, don't pretend
  they're done; the Chat stand-in says
  `Ines has studied 18 of 30 files so far. She answers from those.`
- **Reordering.** If agents are ordered by last used, positions change
  between visits. Fine for "recent", bad for muscle memory. A concept that
  orders by recency must also let people find by name.
- **Flashing.** Never under text, never brighter than the names, reduced
  motion respected.

**Open questions (assumptions marked):**
- *Where do past talks go?* **Assumed:** inside Chat (the agent's own Past
  talks). Not on Home.
- *Where do sketches go?* **Assumed:** in the same list as agents, marked
  `sketch` in words, not a separate strip.
- *What's in Edit?* **Assumed:** the existing agent screen (name, files,
  tone). For these mockups a stub screen titled `Edit · Rex` is enough.
- *How often is Edit chosen over Chat?* **Assumed** about 1 in 5. If it's
  rarer, Edit can sit one step deeper; if more common, it needs equal
  weight. To check with real users.
- *Do people at 50 remember names or roles?* **Assumed:** both. Find must
  match either.
- *The user's exact sentences.* Not in any file I could read; section 2
  uses their words as relayed in the goal. Pixel may add the exact quote.

---

## 5 · Mock data (the same on every page)

"Now" in the demo is **Thu 26 Nov, 10:40**. The list is ordered by last
used, newest first.
- **1 agent** = row 1 (Rex).
- **12 agents** = rows 1–12.
- **50 agents** = all rows.

State is `Ready` unless the table says otherwise. `Studying` agents show
`Studying · learned of total`.

| # | Name | Role (one line) | Last used | State |
|---|---|---|---|---|
| 1 | Rex | Blunt editor for my newsletter | today 09:50 | Ready |
| 2 | Maya | Career mentor | today 08:15 | Ready |
| 3 | Ines | Her design course, week by week | yesterday 19:10 | Studying · 18 of 30 |
| 4 | Tony | Pricing and sales | yesterday 14:05 | Ready |
| 5 | Lena | Research supervisor | yesterday 09:20 | Ready |
| 6 | Marcus | Running coach | Tue 07:00 | Ready |
| 7 | Amara | Contract lawyer | Tue 11:30 | Studying · 4 of 22 |
| 8 | Priya | Product strategist | Mon 13:10 | Ready |
| 9 | Theo | Poetry teacher | Mon 22:00 | Ready |
| 10 | Jun | Imported from Lena | Sun 16:40 | new here |
| 11 | Sol | Sleep and calm | Sun 23:05 | Ready |
| 12 | Hugo | Cookbook author | Sat 18:20 | Ready |
| 13 | Ada | Python code reviewer | Sat 10:15 | Ready |
| 14 | Bruno | Landlord and tenancy questions | Fri 20 Nov | Ready |
| 15 | Clara | Grant writing | Fri 20 Nov | Ready |
| 16 | Dev | Startup board advisor | Thu 19 Nov | Ready |
| 17 | Elif | Turkish tutor | Thu 19 Nov | Ready |
| 18 | Felix | Guitar teacher | Wed 18 Nov | Ready |
| 19 | Grace | Grief counsellor | Wed 18 Nov | Ready |
| 20 | Hana | Japanese cooking, Grandma's notes | Tue 17 Nov | Ready |
| 21 | Ivan | Chess coach | Tue 17 Nov | Ready |
| 22 | Jade | Instagram captions | Mon 16 Nov | Ready |
| 23 | Kofi | Personal finance | Mon 16 Nov | Ready |
| 24 | Lars | Woodworking | Sun 15 Nov | Ready |
| 25 | Mina | UX research critique | Sat 14 Nov | Ready |
| 26 | Nadia | Podcast producer | Fri 13 Nov | Ready |
| 27 | Oscar | Dad's letters, 1970–1995 | Thu 12 Nov | Ready |
| 28 | Paula | Pitch deck coach | Wed 11 Nov | Ready |
| 29 | Quinn | Debate sparring partner | Tue 10 Nov | Ready |
| 30 | Rosa | Garden planner | Mon 9 Nov | Ready |
| 31 | Sami | Arabic calligraphy | Sun 8 Nov | Ready |
| 32 | Tara | Wedding speech helper | Sat 7 Nov | Ready |
| 33 | Umar | Tax return questions | Fri 6 Nov | Ready |
| 34 | Vera | Novel editor, chapter feedback | Thu 5 Nov | Ready |
| 35 | Wes | Fantasy football league | Wed 4 Nov | Ready |
| 36 | Xena | Climbing coach | Mon 2 Nov | Ready |
| 37 | Yara | Nutritionist | Sat 31 Oct | Ready |
| 38 | Zane | Linux sysadmin | Thu 29 Oct | Ready |
| 39 | Abel | Sunday sermon notes | Tue 27 Oct | Ready |
| 40 | Bea | Kids' bedtime stories | Sun 25 Oct | Ready |
| 41 | Cyrus | History of Persia | Fri 23 Oct | Ready |
| 42 | Dora | Job interview practice | Tue 20 Oct | Ready |
| 43 | Emil | Philosophy reading group | Sat 17 Oct | Ready |
| 44 | Fern | Houseplant doctor | Tue 13 Oct | Ready |
| 45 | Gus | Car repair manual | Fri 9 Oct | Ready |
| 46 | Holly | Email tone checker | Sun 4 Oct | Ready |
| 47 | Iris | Old professor's lectures | 28 Sep | Ready |
| 48 | Jonas | Spanish for travel | 21 Sep | Ready |
| 49 | Kai | Meditation guide | 12 Sep | Ready |
| 50 | Untitled sketch | A sketch, never kept | 3 Sep | sketch |

Jony: a ready-to-paste shape, `{ name, role, last, state }`, for example
`{ name:'Ines', role:'Her design course, week by week', last:'yesterday 19:10', state:'studying', learned:18, total:30 }`.
Studying agents: Ines and Amara. `new here`: Jun. Sketch: row 50.
Deliberate traps for find at 50: Ada / Amara / Abel (same first letter),
Rex vs Vera (both editors), Lena vs Jun ("Imported from Lena").
