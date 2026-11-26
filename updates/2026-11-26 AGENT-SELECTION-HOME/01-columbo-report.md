# AGENT-SELECTION-HOME: how people will use the new home (Columbo)

## Summary

People hire this screen for one job: **"take me to my agent"**, and, now and
then, **"let me start a new one."** Nothing else belongs on it. Most visits
take two seconds: the eye finds a name (helped by its constellation, which
works like a face), and the hand clicks. With many agents, people type two or
three letters into the centred search first. The age line answers a quiet
question ("which one is the new one?"), and the plus is a rare but emotional
moment, so its transition must feel like a beginning, never like a crash.

The biggest risk is a **mental-model mismatch on the age**: the user sorts by
`createdAt`, but some people will read "2 days" as "last used 2 days ago".
That is fine as long as the age is always correct, never blank, and the order
never surprises them.

## Scope

**In:** the new home only, as in `00-roadmap.md`: rows (constellation, name,
description, age, learning animation), newest first; the centred live search
and its no-match state; the 0-agents state; the plus and the fireflies-to-plus
transition into `/new`; 0, 1, 10 and 50 agents; long names.

**Out (and why):**
- What happens inside `/new` and on the agent page: other items own them.
- Rename, delete, pin, sort choices, folders: not asked for, and the rule is
  "only agent selection".
- Phone layouts: the app runs as a desktop app and a website (assumption:
  desktop window, mouse and keyboard; narrow windows down to 800 px).
- The Fireflies look itself: it is the base and stays as it is.

## Who

- **The regular** (most people): 3–10 agents, uses one or two daily.
- **The beginner**: 0 agents, or 1 just made.
- **The collector**: 30–50 agents, many with look-alike names.
- **The tired evening user**: low patience, zero thinking.
- **The keyboard person**: wants to type, not aim.

## Behavior table

Sorted by combined score. Where I was unsure, I took the lower score.

| # | Behavior | Likelihood | Frequency | Reason |
|---|----------|-----------:|----------:|--------|
| B1 | **Pick by sight**: scan names (and constellations), click one | 10 | 10 | The core job, every visit. With 3–15 agents, looking beats typing. |
| B2 | **Type to find**: 2–4 letters in the centred search, then click | 8 | 8 | Collectors do it every visit; regulars when the list grows. The search sits in the middle, so it is hard to miss. Lower than B1 because small lists don't need it. |
| B3 | **Read the age to orient**: "which one did I just make?" | 8 | 7 | The age sits on every row, so the eye takes it in on the way. Used most right after making an agent and when twins exist. Not every visit needs it, so 7. |
| B4 | **Tell twins apart**: description, constellation and age together | 7 | 7 | Look-alike names ("Rex", "Rex 2") are common once people have 10+. Lower for small lists. |
| B5 | **Make a new agent**: press plus, watch the gather, land on `/new` | 9 | 4 | Nearly everyone does it, but not daily. High emotion, low frequency. |
| B6 | **Watch a learning agent**: "is it still studying?" | 6 | 5 | Only after giving an agent files. People come back to check on it, like a progress bar. Scored lower: not every agent learns. |
| B7 | **Search finds nothing**: a typo, or an agent they never made | 7 | 4 | Happens to everyone now and then. |
| B8 | **First visit, 0 agents** | 10 | 2 | Everyone, once. Sets trust in the first second. |
| B9 | **Clear the search** and expect the whole list back | 6 | 5 | Follows every B2 and B7. |
| B10 | **Press plus twice**, or by mistake | 4 | 2 | Impatient double-click, or a stray click. See W5. |
| B11 | **Hover a cut-off name** to read it whole | 4 | 3 | Only people with long names. Most names are short. |

## Deep dives

### B1 · Pick by sight

- **Moment:** Morning at the desk, the app opened from the dock, coffee next
  to the keyboard. Or a quick stop between two meetings.
- **Trigger:** "I want to carry on with my writing coach."
- **Thoughts:** "There… the one with the round cluster. Writing coach." Most
  of the time no words at all: the hand moves before the reading ends.
- **Emotions:** Before: a little intent. During: nothing (good). After: calm,
  already inside the agent.
- **Expectations:** All rows readable on the very first frame. One click.
  Name strong, description quieter, age quietest. A row that reacts on hover,
  so it is clearly clickable. The constellation of an agent looks the same
  every visit, so it becomes its face.
- **Success:** "I didn't even notice the home."
- **Friction and fears:** Rows that slide in or re-sort after load, so they
  click the wrong one. Fireflies drifting over text. Constellations so busy
  that 50 rows feel like noise. A click that lands on raw JSON or a white page
  (this happened in the rejected version).
- **Product insight:** Readability beats atmosphere. Constellations stay small
  and calm (the original slow beat), the same shape on every load (seeded by
  agent id). Nothing moves under the mouse. The row is a real link to a real
  page.

### B2 · Type to find

- **Moment:** A collector with 40 agents, hands already on the keyboard.
- **Trigger:** "It's the Rex one about money."
- **Thoughts:** "r… e… x… three Rexes… the money one." On iOS they have
  learned that search reacts on every letter; they expect the same here.
- **Emotions:** Before: slight impatience with a long list. During: a small
  pleasure as the list shrinks with each letter. After: "that was quick."
- **Expectations:** The search is in the middle, so the eye lands on it. It
  looks like the soft, rounded iOS field they know: one glance says "type
  here". The list changes on every letter, no Enter, no felt delay. Case does
  not matter. A word from the description works ("money"). Results stay
  newest first. Backspace widens the list again at once.
- **Success:** Two to four letters, one click, and the list never flickered.
- **Friction and fears:** Any lag (even 150 ms feels "stuck" while typing).
  Results that reshuffle. The field moving when the list gets shorter.
  Having to click into the field first (assumption: focus on load is welcome
  if it steals nothing).
- **Product insight:** Filter synchronously on every input event; 50 items is
  tiny. Keep the search fixed in place while the list below changes.

### B3 · Read the age

- **Moment:** Right after making a new agent, or when two names look alike.
- **Trigger:** "Which one is the new one I made yesterday?"
- **Thoughts:** "Top row, 'just now', that's it." Or: "'3 weeks'… no, that's
  the old Rex." Some people will think "I last used this 3 weeks ago"
  (assumption: a part of users reads age as last use, because many apps show
  "last edited").
- **Emotions:** Before: mild doubt. During: quick certainty. After: trust in
  the list. If an age looks wrong ("2 years" for an agent made today), trust
  drops for the whole screen.
- **Expectations:** Short, plain words they know from chat and mail apps:
  `just now`, `5 min`, `2 days`, `3 weeks`, `4 months`. Always there, always
  right, right-aligned so the eye can run down the column. The top row is the
  newest. Design systems agree that relative times show immediacy but should
  give the exact date on request (Cloudscape, UX Movement).
- **Success:** One glance answers "which is newer".
- **Friction and fears:** A blank or "NaN" age on old agents without
  `createdAt`. "just now" on an old agent (fallback to the current time).
  An age that disagrees with the order. A minus value from clock skew.
- **Product insight:** `createdAt` falls back to `updatedAt`, never to "now"
  and never to nothing. The age and the order use the same date, so they can
  never disagree. A native `title` tooltip on the age with the full date
  answers "when exactly?" without adding anything visible (assumption, see Q1).

### B5 · Make a new agent (the gather)

- **Moment:** Weekend morning, or right after an idea from a friend. Relaxed.
- **Trigger:** "I want an agent for my running plan."
- **Thoughts:** "The plus." Then, as the fireflies lift: "Oh!" Then, a second
  later: "…and now?"
- **Emotions:** Before: hope, a bit of excitement. During: wonder, if it is
  short and clearly *going somewhere*: everything flows into the plus.
  After: a fresh start on a page that is plainly the same world.
- **Expectations:** One press. The motion has a clear direction (into the
  plus), so it reads as "you are going there", not as "the screen broke".
  It ends in about a second. Then `/new` appears with the same dark
  background, no white flash. Back brings the home back as it was.
- **Success:** "That felt like the screen became the new agent."
- **Friction and fears:** The UI vanishing with nothing following, or a
  frozen frame, reads as a crash. Over 1.5 s feels like waiting by the third
  use. A double-click starting it twice. Fear that something was saved.
- **Product insight:** Keep 1.0–1.5 s and a clear end point at the plus,
  with the plus answering with a small glow, so the eye knows where it went.
  The second press does nothing extra. Any error goes straight to `/new`.
  Reduced motion gets a short fade. The plus saves nothing.

### B7 + B8 · When the list is empty (no match, or no agents)

- **Moment:** No match: any time, usually a typo ("rxe"). No agents: the very
  first open, curious and a little unsure.
- **Trigger:** The list area is suddenly empty, or was never full.
- **Thoughts:** No match: "Nothing? Did I mistype… wait, are my agents gone?"
  No agents: "Okay, what do I do here?"
- **Emotions:** A short jolt of doubt. Calm returns if the screen clearly
  says *why* it is empty.
- **Expectations:** The two states look different. No match repeats what they
  typed (`Nothing matches “rxe”`), so the typo is visible; the text stays so
  one Backspace fixes it; the search and plus stay put. No agents: one quiet
  line, and the plus is clearly the next step. Common design-system practice:
  separate "no data yet" from "no results", explain, and keep the layout
  stable (Supabase, Maersk).
- **Success:** "Ah, typo." Or: "Right, I press the plus."
- **Friction and fears:** An empty dark area with no words reads as "loading
  failed". A red error look. No-match looking like data loss.
- **Product insight:** Two plain lines, no magic on them. The list area is a
  polite live region. No extra "create" button in either state: the plus is
  the one way.

## Watch out

Low scores, but each one can break trust:

- **W1 An age that looks wrong.** "just now" on an old agent, "NaN", a blank,
  or a minus value. One wrong age makes people doubt the whole list. Test the
  age function at every unit boundary and with a future date.
- **W2 Missing `createdAt` on old agents.** Records made before `createdAt`
  was passed through (or by hand) have to fall back to `updatedAt`. Without
  it they sort to the wrong place and show a bad age. Include one such record
  in the mock data.
- **W3 Age read as "last used".** Some people will expect the agent they used
  this morning at the top; it may be lower if it was made long ago. Low harm
  while the age and order agree, but watch for confusion in Eraser's check
  (open question Q2).
- **W4 A search that feels slow.** Any debounce, network call, or re-drawing
  50 constellations on every letter. Typing must feel instant.
- **W5 A transition that feels like a crash.** The UI vanishing with no
  direction, a frozen frame, a white flash before `/new`, a second press
  starting it again, or an error leaving the user stuck on a dark screen.
- **W6 Long names breaking the layout.** A 200-character name without spaces
  pushing the age or plus off screen.
- **W7 Fifty constellations that never rest.** If every row flashes, the
  screen feels restless and the learning rows lose their meaning. Only
  learning rows should move noticeably.
- **W8 A row click on a broken page.** Raw JSON or a white page (seen in the
  rejected version). The most frequent step must land on a real page.

## Key insights

1. **One screen, one job.** Pick an agent or make one. Every extra element
   competes with the 2-second visit.
2. **The constellation is the agent's face.** Same shape every time, small and
   calm, so it helps recognition instead of adding noise.
3. **Age and order must use the same date** and must never be blank or wrong.
4. **The search is the second way in, and it must feel instant.**
5. **The transition needs a direction and an end:** into the plus, in about a
   second, then the same world on `/new`.
6. **Two empty states, never alike**, both plain and calm.

## Open questions (with the assumption we work with)

- **Q1 Exact date on the age.** *Assumption:* a native `title` tooltip with
  the full date; it adds nothing visible.
- **Q2 Age = created, or last used?** The brief says `createdAt`. *Assumption:*
  keep `createdAt`; if Eraser's check shows confusion, raise it with the user.
- **Q3 Where the `learning` status comes from.** Real drafts today are only
  `draft` or `saved`. *Assumption:* `learning` comes from the mock data now,
  and the row simply animates whenever the API says `learning`.
- **Q4 Focus the search on load.** *Assumption:* yes, if it steals nothing.
- **Q5 Empty-state words.** *Assumption:* "No agents yet" and
  `Nothing matches “…”`; final words follow the team's word list.

## Sources

- UX Movement, absolute vs relative timestamps:
  https://uxmovement.com/content/absolute-vs-relative-timestamps-when-to-use-which/
- Cloudscape Design System, timestamps (give access to the absolute time):
  https://cloudscape.design/patterns/general/timestamps/
- Close, ultimate guide to timestamps:
  https://making.close.com/posts/ultimate-guide-to-timestamps/
- Supabase design system, empty states:
  https://supabase.com/design-system/docs/ui-patterns/empty-states
- Maersk design system, handling no results:
  https://designsystem.maersk.com/guidelines/search-filter-and-sort/handling-no-results/
- Background: the rejected version and its research,
  `updates/2026-11-26 AGENT-HOME/00-roadmap.md` and `01-columbo-report.md`.
