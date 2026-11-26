# AGENT-HOME: how people will use the new home (Columbo)

## Summary

People will mostly hire this home for one job: **"get me back to my
agent, fast."** Most visits are short. The user opens the app, sees the
agent they used last at the top, and clicks it. If the list is long,
they type two or three letters and click. Making a new agent (the plus)
happens much less often, but it means the most: it is a new beginning.

The user's layout is **fixed** and fits these behaviors well:

1. a big ordered agent list on the left (name and a very short description),
2. one live search row at the bottom that filters with every letter,
3. a plus button next to the search.

**Nothing gets added and nothing gets cut.** All findings below are
about how these three parts should behave in each state. None of them
asks for a new element. The empty list and the "no match" result are
**states of the list**, not new parts.

## Scope

**In (this stage):**
- the home page on the restored Fireflies design (`agent-home.html`)
- the list in four states: 0 agents, 1 agent, about 10, 50 agents
- long names that could wrap or overflow
- live search, including a search that matches nothing
- pressing the plus and landing on a blank `/new` page

**Out (and why):**
- what happens inside `/new`: it is a blank placeholder for now
- the agent page you reach by clicking a row: it already exists
- deleting, renaming, pinning, sorting choices, folders: the user did
  not ask for them, and the layout is fixed
- mobile layouts: the app runs as a desktop app and website (assumption:
  desktop window, mouse and keyboard)
- the Fireflies movement itself: it is restored and stays unchanged

## Who uses it

- **The regular** (most users): 3 to 10 agents, uses one or two daily.
- **The beginner**: just installed, 0 agents, or 1 just made.
- **The collector / power user**: 30 to 50+ agents, many with similar
  names ("Rex – money", "Rex – health").
- **The tired evening user**: low patience, wants zero thinking.
- **The keyboard person**: wants to type, not move the mouse.

## Behavior table

Sorted by combined score (likelihood + frequency).

| # | Behavior | Likelihood | Frequency | Reason |
|---|----------|-----------:|----------:|--------|
| B1 | **Open the last agent**: click the top row | 10 | 10 | The list is newest first, so the agent you used last is right there. This is the main job. |
| B2 | **Scan and pick**: eyes run down the list, read names, click one | 9 | 9 | With 3–15 agents, reading is faster than typing. |
| B3 | **Type to find**: 2–4 letters in the search, then click | 8 | 8 | With 20+ agents scanning gets slow. Live filter makes this feel instant. Scored a bit lower because small lists don't need it. |
| B4 | **Use the description to tell twins apart** | 8 | 7 | Similar names ("Rex", "Rex 2") are common; the short line is how people tell them apart. |
| B5 | **Plus: make a new agent** | 9 | 5 | Nearly every user does it, but only now and then. High emotion, low frequency. |
| B6 | **First visit, 0 agents** | 10 | 2 | Every new user sees it once (or a few times). Sets trust in the first second. |
| B7 | **Search matches nothing** | 7 | 4 | Typos, or looking for an agent that doesn't exist yet. Happens, but not daily. |
| B8 | **Only 1 agent** | 7 | 4 | A common stage right after the first agent. Short phase, but every user passes through it. |
| B9 | **Clear the search to see everything again** | 7 | 5 | After a search or a "no match", people delete the text and expect the full list back. |
| B10 | **Long name read in full**: hover or squint at a cut-off name | 6 | 4 | Some people give long names ("My strict but kind writing coach for the novel"). Scored lower: most names are short. |
| B11 | **Type before the page is ready / start typing straight away** | 5 | 5 | Keyboard people type at once. Assumption: they expect the search to catch those first letters. |
| B12 | **Search for a word in the description, not the name** ("money") | 5 | 4 | Happens when the user forgets the name but remembers the job. The brief already covers it (name and description). |
| B13 | **Press plus twice, or by mistake** | 4 | 2 | Low, but see Watch out. |

**Watch out** (low score, but can break trust):
- **W1 Plus pressed by mistake.** The transition should not feel like
  something got created. It only goes to a blank page; the browser Back
  returns home. No agent is saved by the plus alone. (Assumption: the
  blank `/new` creates nothing.)
- **W2 The list jumps while you aim.** If rows move after the page
  loads (late data, re-sorting), the user clicks the wrong agent. This
  is the worst friction on this page.
- **W3 Long name breaks the layout.** One very long name without spaces
  that pushes the search or plus off screen makes the whole app feel
  broken.
- **W4 "No match" looks like "all my agents are gone."** If the empty
  search result looks like the 0-agents state, the user panics.
- **W5 Empty description shows as a gap or "undefined".** An agent
  with no description must look complete, just with a name.

## Deep dives

### B1 · Open the last agent

- **Moment:** Morning, at the desk, laptop. They just opened the app
  from the dock, coffee next to them. Or evening, on the sofa.
- **Trigger:** "I want to keep going with the thing I talked about
  yesterday."
- **Thoughts:** "There it is." Most of the time they don't think at all.
  The hand moves before the eyes finish reading.
- **Emotions:** Before: neutral, a bit of intent. During: none (that's
  good). After: calm, already in the conversation.
- **Expectations:** Their agent is the top row, visible within a blink
  of the page showing. One click. No loading list that fills in later.
- **Success:** "I didn't even notice the home page."
- **Friction and fears:** The fireflies or an intro motion delay the
  list. Rows appear one by one so the top row moves. Order changes for
  no reason they understand.
- **Product insight:** The list must be readable and clickable at once.
  Any appear motion stays tiny and must never move rows after they can
  be clicked (W2). Newest-first order matches how people think: "the one
  I used last".

### B2 · Scan and pick

- **Moment:** Mid-day, between tasks. Laptop or desktop, mouse in hand.
- **Trigger:** "I need my writing agent, not the one from this morning."
- **Thoughts:** "Writing… writing… there." They read the first word of
  each name and skip the rest.
- **Emotions:** Before: mild focus. During: light scanning. After: relief
  if found in under 2–3 seconds; mild irritation if they had to read
  twice.
- **Expectations:** Big, clear names. Each row the same height. Name
  first and strong, description quieter. A row that reacts when the
  mouse is over it, so they know it's clickable.
- **Success:** The eye lands on the right name on the first pass.
- **Friction and fears:** Text too small or too low contrast on the dark
  Fireflies background. Fireflies passing over text and making it hard
  to read. Descriptions as loud as names.
- **Product insight:** Readability beats atmosphere here. The Fireflies
  world stays behind the list, never on top of the text. One line per
  row keeps the rhythm even, so scanning 10 or 50 rows stays easy.

### B3 · Type to find (and the 50-agent scan)

- **Moment:** Any time, power user with 30–50 agents. Hands already on
  the keyboard.
- **Trigger:** "I know it's called something with 'Rex'."
- **Thoughts:** "r… e… x… there are three Rexes… the money one."
- **Emotions:** Before: a little impatience with long lists. During:
  satisfaction as the list shrinks with each letter. After: "that was
  quick."
- **Expectations:** The list changes on **every letter**, with no
  Enter and no felt delay. Case does not matter ("rex" finds "Rex").
  Order stays newest first inside the results. Deleting a letter widens
  the list again at once. They expect to find the search row at the
  bottom where it always is, and, as an assumption, a keyboard person
  expects to be able to just start typing (open question Q3).
- **Success:** 2–4 letters, one click, done. The list never flickered.
- **Friction and fears:** Lag on a 50-agent list. Results that reorder
  in an unclear way. Matching in the middle of random words that make
  the results feel random (assumption: plain "contains" matching on name
  and description is what people expect; it's what most app lists do).
- **Product insight:** Live filtering of 50 items should feel instant
  with plain matching. When scanning 50 without search, an even row
  height and an ellipsis on every line keep the long list calm. The
  list scrolls inside its own area, while the search and plus stay
  fixed at the bottom, always reachable.

### B4 · Tell twins apart by the description

- **Moment:** Power user, or a regular who made a second version of an
  agent.
- **Trigger:** Two rows start with the same name.
- **Thoughts:** "Rex… Rex… which one was the strict one?"
- **Emotions:** Small doubt, then relief when the short line answers it.
- **Expectations:** The description is short enough to read in one
  glance, on the same line, after the name. It says what the agent is
  *for*, not a long paragraph.
- **Success:** They pick the right twin without opening both.
- **Friction and fears:** The description is cut off so early it says
  nothing; it's the same for both twins; it's missing.
- **Product insight:** The description should come from the start of
  an existing field that says what the agent is (assumption: the first
  sentence of `persona`, falling back to `instructions`, else empty).
  Empty must look normal: just the name (W5).

### B5 · Plus: make a new agent

- **Moment:** Weekend morning, or after a talk with a friend who gave an
  idea. Relaxed time, desktop.
- **Trigger:** "I want an agent for my running plan."
- **Thoughts:** "Where do I make a new one? Ah, the plus." Then: "What
  happens now?"
- **Emotions:** Before: hope, a bit of excitement. During: curiosity,
  this is the "magic" moment. After: a clean, quiet page that feels like
  a fresh start, not an error.
- **Expectations:** The plus is easy to find (next to the search, where
  people look for "add" in list apps). One press. A short, lovely
  transition, not long enough to feel like waiting. Arrive at a page
  that clearly belongs to the same world. Back returns home.
- **Success:** "That felt like opening a new page in a notebook."
- **Friction and fears:** A transition so long it feels slow on the
  third use. A blank page that looks broken (white flash, missing
  background). Fear of having created an empty agent by accident (W1).
- **Product insight:** The transition should be short and skippable
  in feel (Merlin's spec gives exact values). The `/new` page must show
  the same Fireflies background at once, so blank reads as "fresh", not
  "broken". Pressing plus should not save anything.

### B6 · First visit, 0 agents

- **Moment:** Just installed. Curious, a little unsure. Desktop.
- **Trigger:** First open.
- **Thoughts:** "Okay… what do I do here?"
- **Emotions:** Before: curious, a little skeptical. During: either "oh,
  beautiful, calm" or "is something broken?" After: ready to press plus.
- **Expectations:** The page looks finished even with nothing in it.
  The plus is the obvious next step. No error, no spinner that never
  ends.
- **Success:** They understand in one second that this is where their
  agents will live, and they press the plus.
- **Friction and fears:** An empty dark area with no words reads as
  "loading failed". A search row with nothing to search can look
  odd, but it is part of the fixed layout and stays.
- **Product insight:** The list area needs a calm empty state: at most
  one short, quiet line in the list area (a state of the list, not a new
  element), pointing to the plus that is already there. No extra
  "Create" button: the plus is the one way (team rule: one way to do
  each thing). The fireflies help here: the page feels alive, not dead.

### B7 · A search that matches nothing

- **Moment:** Any time. Usually a typo ("rxe"), or looking for an agent
  they never made.
- **Trigger:** They typed, and the list became empty.
- **Thoughts:** "Hm, nothing? Did I type it wrong? … Wait, are my agents
  gone?"
- **Emotions:** Before: focus. During: a short jolt of doubt. After:
  calm if the page makes clear it's only the search; frustration if it
  looks like data loss.
- **Expectations** (this matches common practice in list apps and
  design systems: explain, and give a way forward):
  - It must look clearly different from the 0-agents state (W4): one
    short, quiet line that says nothing matches **what they typed**,
    ideally repeating their text so a typo is easy to see.
  - The search text stays, so they can fix one letter.
  - Deleting letters brings matches back at once; clearing the search
    brings the full list back, in the same order.
  - The way forward is already on the page: fix the text, or press the
    plus next to the search to make the agent they couldn't find. No new
    "create this agent" button.
  - The layout doesn't jump: search and plus stay where they were.
- **Success:** "Ah, typo." One backspace, and the list is back.
- **Friction and fears:** A blank area with no message. A big error
  look (red, icons). The list area collapsing so the search moves.
- **Product insight:** "No match" is a quiet, honest state of the list.
  Screen readers should hear the change (the list area is a polite live
  region). Plain words, no magic on this message (team rule: no magic on
  errors).

### B8 · A single agent

- **Moment:** Day 1 or 2, right after making the first agent.
- **Trigger:** Coming back to the agent they just made.
- **Thoughts:** "There it is, my first one."
- **Emotions:** Small pride. A little "this list looks very empty".
- **Expectations:** One row at the top of the list area, looking just as
  finished as 50 would. Same row style; no special "only one" layout.
- **Success:** One click into their agent; the page doesn't feel empty
  or broken.
- **Friction and fears:** The one row floats in the middle of nowhere,
  or stretches oddly; the search row looks silly. Neither is a reason to
  cut the search: the layout is fixed, and the list grows.
- **Product insight:** The row is placed at the top-left, the same as
  in a full list, so the page looks the same as it grows. No extra hint
  or tip is needed.

### Long names (states across B2, B3, W3)

- **Moment:** Any. Someone named an agent with a full sentence, or
  pasted a long word or a URL with no spaces.
- **Expectations:** Each row stays one line. The name ends with "…"
  where it doesn't fit, the description gets less room or disappears
  first (the name matters more). The search and plus never move.
  Hovering shows the full name (assumption: a native tooltip is what
  desktop users expect; open question Q2).
- **Friction and fears:** Wrapping to 2–3 lines breaks the scan rhythm;
  a no-space name widens the page and pushes the plus off screen (W3).
- **Product insight:** Test names with and without spaces, at 40, 80
  and 200 characters, with and without a description.

## Key insights

1. **The main job is "back to my agent".** Newest first plus a calm,
   instant list does most of the work. The search and plus serve
   smaller but important moments.
2. **Readability beats atmosphere.** The Fireflies stay behind the
   text and never slow the list.
3. **Nothing may move under the mouse.** No late reorder, no rows that
   shift once clickable, no layout jumps when filtering.
4. **Two different empty states:** "you have no agents yet" (0 agents)
   and "nothing matches 'xyz'" (search). They must never look alike.
   Both are states of the list, not new elements.
5. **The plus is the only way forward** from an empty list and from a
   failed search. No second create button.
6. **One line per row, always.** Name first, description quieter and
   cut first.
7. **The layout is fixed.** Every finding here fits into the user's
   three parts. Nothing is added, nothing is cut.

## Open questions (with the assumption we work with until answered)

- **Q1 · Description source.** Which field? *Assumption:* first sentence
  of `persona`, else of `instructions`, else `""`, cut short (around 80
  characters) by `summary()`.
- **Q2 · Full long name on hover.** *Assumption:* a native `title`
  tooltip; it adds no visible element.
- **Q3 · Typing straight away.** Should the search catch letters typed
  as soon as the page opens? *Assumption:* yes, focus the search on load
  only if it doesn't steal anything; Jony decides if it's safe. Not a new
  element.
- **Q4 · Exact empty-state words.** *Assumption:* one short plain line
  for each state, e.g. "No agents yet" and "Nothing matches “xyz”".
  Final words go through the team's word list.
- **Q5 · Search match rule.** *Assumption:* case-insensitive "contains"
  on name and description, results keep newest-first order.
- **Q6 · Keyboard.** Arrow keys and Enter to open the top match would
  help power users. *Assumption:* out of scope now (not asked for);
  normal Tab order works.

## Sources

- Supabase design system, empty states (separate "no data yet" from
  "no results"; keep the layout stable):
  https://supabase.com/design-system/docs/ui-patterns/empty-states
- eBay Playbook, empty states (explain why, offer a next step):
  https://playbook.ebay.com/design-system/patterns/empty-states
- Vercel Geist, empty state (announce with `aria-live="polite"`):
  https://vercel.com/geist/empty-state
- Maersk design system, handling no results:
  https://designsystem.maersk.com/guidelines/search-filter-and-sort/handling-no-results/
- LogRocket, "No results found" page UX:
  https://blog.logrocket.com/ux-design/no-results-found-page-ux
