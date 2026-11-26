# Home brief: who comes to Home, when, and why

*Columbo, 2026-11-26. For Merlin (concepts), Jony (HTML), Eraser (review).
Built on `updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md` (UJ1, UJ12),
`walkthrough-columbo.md`, and the Glade in `updates/2026-11-25 MAGIC-CONCEPTS/`.*

## What Home is for

Home is the doorway, not a place to stay. The job people hire it for:
**"get me to the right person, now."** Success is measured in seconds spent
*leaving* Home. The feeling to give: *there they are, alive and waiting.*
In the Glade, each agent is a cluster of fireflies, one light per file.
**In step = Ready. Scattered = Studying.** Lights live only in the field;
all words sit on solid panels.

## Who arrives, and when

1. **First run, no agents yet.** First evening, laptop, curious and a bit
   unsure: "Will this need setup? What do I do?" They hold either one line
   ("a blunt editor for my newsletter") or a folder of someone's course.
   They need both ways visible at once, and nothing else.
2. **Returning user (most visits).** Mid-morning, between tasks, maybe
   tired, a real question in their head: "I need Rex about this." They
   know who they want. They expect to see the name and click it. Under
   2 seconds, one click. Anything in the way feels like a toll.
3. **User whose agent is still studying.** Dropped a big folder an hour
   ago, closed the app, came back: "Is Ines done yet? Can I talk to her?"
   Hopeful, slightly anxious. They need the answer at a glance, in words,
   without opening anything.

## The four jobs (scored 1–10)

| Job | Likelihood | Frequency | Why |
|---|---|---|---|
| **Find the agent you need** | 10 | 9 | Almost every visit starts here; with 6+ agents (UJ12) they must find a name fast, not hunt. |
| **Pick up a past talk** | 8 | 6 | People continue threads ("the job offer"), but most visits start a fresh talk, and Past talks also live inside Talk. |
| **See who is ready or studying** | 8 | 6 | Everyone glances, but it only matters while something is studying (hours after a drop). Passive: read, not clicked. |
| **Make a new one** | 9 | 3 | Everyone does it on first run (UJ1); after week one it's rare (UJ12 step 3). |

Lower score chosen where unsure (past talk, status). Order of weight on the
screen: find > past talk ≈ status > make new. But make new is the *whole*
screen on first run.

## Must stay one click away

From **UJ1 · First run**:
- With 0 agents, Home *is* the start of making: one line **or** bring a
  folder, both visible, the line focused. No tour, no welcome animation.
- **New agent** (one line, or drop a folder) is always visible on Home,
  even with one agent left. ⌘⇧N works from anywhere.
- Dropping files anywhere on Home starts a new agent, with
  `Drop · your files stay on this Mac` / `Claude reads them to study` / `for a new agent`.

From **UJ12 · Manage the library**:
- **Open any agent:** one click on it opens Talk at once, as a new talk.
  No exit animation.
- **Sketches** (never kept, e.g. "Untitled sketch") are shown apart from
  kept agents, never mixed, and also open in one click.
- **State in words** on every agent, right next to its light: `Ready`,
  `Studying · 18 of 30`, `new here` (imported, never opened). One mark each.
- Keyboard works: arrows move between agents, Return opens.
- Rename and delete are **not** on Home (Name field and the agent menu own
  them). Don't add a second way.

## Watch out

- **Empty Home on first run:** a dark field with no fireflies looks broken
  or dead. Empty must still invite: the one line and the folder door.
- **"Studying" vs "Ready" unclear:** scattered vs in-step blinking can be
  missed (tired eyes, small clusters, reduced motion). The words must
  always say it; motion only confirms.
- **Clicking a studying agent:** they'll try. Don't block it, and don't
  pretend it's done. Say what they'll get.
- **Magic before the click:** any hover flash or drift that delays or moves
  the target makes the returning user miss. Targets stay still.
- **Lost in the field at 10+ agents:** free-floating clusters don't scale;
  finding by name (type to filter) must exist.
- **Flashing:** never under text, never brighter than low-contrast, never
  more than one flash per 2 s; reduced motion = steady glows that still
  tell the truth.
- **Past talks buried:** if they're only inside an agent, "pick up the job
  offer talk" becomes two or three clicks.

## Open questions (assumptions made)

- Should past talks across *all* agents show on Home? Assumed **yes, a
  few recent ones**, since that keeps UJ "pick up a talk" one click away.
- Search or filter? Assumed **type a name to filter**; each concept may
  find its own way, but typing must still work.
