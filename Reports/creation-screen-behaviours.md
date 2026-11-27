# CREATION-SCREEN: how people will use the creation screen (Columbo)

## Summary

People come to this screen with one job: **"turn my pile into a real
agent, and let me see which parts of the pile it really took."** They
just gave a folder on the + build screen. Now they want to see what came
in, put the good material where it belongs (the agent's character, its
knowledge, its skills), and push the junk aside.

The most important finding: **people will believe a file is "in" the
agent the moment they drop it on a zone.** That is the mental model of
every upload box they know. The user's dim and bright rule says the
opposite, on purpose: a drop is only a plan; a firefly shines only when
its file was really used. This rule is the screen's best promise (other
tools say "uploaded" when nothing was read, see Sources), but only if
the gap between "I put it there" and "it is really used" is easy to see.
If it isn't, the dim firefly after a drop reads as "it didn't work", and
people drop the same file again and again.

The other big risks: a huge folder that feels frozen while counting,
junk that fills the field with thousands of dim dots, a drop that misses
or lands on the wrong zone, and a bright file people want back.

Roadmap: `updates/2026-11-27 CREATION-SCREEN/00-roadmap.md` (phases 1 to
4). Journey steps **UJ2 · 2, 3, 4** in
`updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`.

## Scope

**In (this update):**
- the scan after a drop or pick, with the fireflies circling fast, one
  firefly per file (Phase 1)
- the split: a simple firefly field on the left, the character menu on
  the right with System prompt, Knowledge and Skills (Phase 2)
- dragging fireflies, or files from Finder, onto Adjust DNA, Adjust
  Knowledge and Create new skill (Phase 3)
- dim and bright: a file shines only when really used; dim files can be
  thrown away; a used file can be taken back (Phase 4)
- the cases the brief names: a huge folder, junk files, the same file
  dropped twice, the wrong zone, undoing a file going bright
- Reduce Motion, the dev server, the real app and the installed build

**Out (and why):**
- **the full left side** (f-the-left-side): names on hover, grouping,
  search, selecting many. Next update. I note below where people will
  miss it (C4), so that update starts from real needs.
- **how Knowledge is embedded and how a skill is made**: the machines are
  not built yet (CLAUDE.md: RAG is unscoped). I study how people *feel*
  about waiting for them, not how they work.
- **routing through the Sketcher chat** (UJ2 · 3 in words): it exists;
  I only look at where chat and drag meet (C12).
- **adding files to an older agent** from its page (UJ8).
- **touch and phone**: the app is a desktop window (same assumption as
  before).

## Who uses it

- **The clone-maker** (core): a teacher's courses, books and talks.
  Knows the material and has opinions on what is "really them".
- **The tidy sorter**: wants every file in its place before moving on.
- **The hurried maker**: "just make it work", drops everything on one
  zone.
- **The corpus power user**: 5,000 to 40,000 files, lots of junk.
- **The doubter**: has been burned by tools that said "uploaded" and
  used nothing. Watches for proof.
- **The Reduce Motion user.**

## Behavior table

Scores 1 to 10. Unlike the + build screen, this screen is a working
session: one agent means many drags, so frequency here counts actions
within a session (10 = dozens of times per agent).

| # | Behavior | Likelihood | Frequency | Reason |
|---|----------|-----------:|----------:|--------|
| C2 | **Drag a firefly onto a zone to route it** | 9 | 8 | The core action of the screen. Every file that matters gets placed, often one by one. |
| C3 | **Look for proof that a file is really used** (expect bright right after the drop) | 8 | 7 | Every upload box they know says "done" on drop. They check after each drop, and again after a while. |
| C10 | **Drop a whole folder straight from Finder onto one zone** | 8 | 6 | Fastest way to route a lot ("all the Books go to Knowledge"). Natural for the hurried maker and anyone with a big folder. |
| C4 | **Scan the field to find a file** ("which one is the bio?") | 8 | 6 | To route one file you must find it. With a simple field and no names, this is where people will feel the missing left side. |
| C1 | **Watch a huge folder being counted** | 8 | 5 | For the core user big is normal (A3 in the journeys). Once per drop, but it sets the trust for the rest. |
| C8 | **Clear out junk** (throw dim files away) | 7 | 5 | Real folders hold `.zip`s, screenshots, "copy (2)" files, installers. People want them gone, more so when the field looks crowded. |
| C6 | **Drop onto the wrong zone, or miss** | 7 | 5 | Three zones side by side, a moving pointer, a long drag from the left field. Misses are normal in any drag UI. |
| C9 | **Leave dim files alone and move on** | 7 | 4 | Most people sort what matters and ignore the rest. The rule says dim is fine; they need to feel that it is. |
| C12 | **Use the chat instead of dragging** ("put all the talks in Knowledge") | 6 | 5 | The Sketcher already routes in words; people who know it keep using it. |
| C5 | **Drop the same file or folder twice** | 6 | 4 | They forgot it was in, or they think the first drop failed (C3), or the same PDF sits in two folders. |
| C14 | **Come back later and reopen the agent** | 7 | 3 | Embedding a big corpus is slow; they close the app and come back to see what went bright. |
| C13 | **Drop one file on two zones** (prompt and knowledge) | 5 | 4 | A bio or a "principles" PDF is both character and fact. The routes already allow `both`. |
| C7 | **Take back a file that went bright** | 5 | 3 | A wrong file got used ("that's my notes, not his words"), or a file they now see as off-key. Rare, but it matters. |
| C11 | **Leave in the middle of the scan** (Esc, close the app) | 5 | 3 | A huge scan, or they picked the wrong folder. |
| C15 | **Use it with Reduce Motion on** | 3 | 8 | Few users, but every action. |
| C16 | **Drag onto a zone with nothing selected, or drag the wrong firefly** | 4 | 3 | Dots are small (radius 2.5 to 6). Grabbing a neighbour is easy. |
| C17 | **Drop the whole home folder or an app** | 2 | 1 | Mistake. Tens of thousands of files. See W3. |

### Watch out (low score, but can break trust)

- **W1 · A drop that looks like a failure.** After a zone drop the
  firefly stays dim (by the rule). If nothing else changes, the user
  reads "it didn't take" and drops again (C5) or quits. The zone must
  visibly accept the file at once, while the firefly stays dim. Accepted
  and used are two different, both visible, states.
- **W2 · A firefly that shines without real use.** One false bright
  breaks the whole promise. Bright only on the machine's own "used"
  signal, per file; never on route, never on "in progress", never on
  a timer. A file that failed stays dim.
- **W3 · Hidden giants.** A home folder, a `.app`, `node_modules`:
  tens of thousands of fireflies. The scan must stay smooth and
  Esc must stop it cleanly. (Dot-folders are already skipped.)
- **W4 · Throwing away feels like deleting from the disk.** People with
  one copy of a course will panic at "thrown away". It must be clear it
  leaves the agent only, with Undo (team rule).
- **W5 · Same file twice counted twice.** If a repeat drop made a second
  firefly, the count would lie and the field would grow with each
  doubt. Same path = same firefly (today's `addFiles` already does this).
  Same content under another path (`Books/a.pdf` and `Backup/a.pdf`) is
  two fireflies today. Open question Q6.
- **W6 · The private-material fear.** Clone-makers drop client calls and
  paid courses. "Embedding" may sound like "sending somewhere". Keep
  everything local (fact today), and no magic or words about it here
  (team rule: no magic on private material).
- **W7 · Reduce Motion users get circling.** The scan's fast circling
  must become still light, not slower circling.

## Deep dives

The brief asks for both scores 7 or more: that gives C2 and C3. I add
the next six by combined score, which also cover the cases the brief
names (huge folder C1, junk C8, wrong zone C6, undo bright C7). The same
file twice (C5) is covered under C3 and W5.

### C2 · Drag a firefly onto a zone to route it

- **The moment:** Evening at the desk, right after the split appears.
  Mouse in hand, the folder's contents in their head.
- **The trigger:** "His *Principles* PDF is the core of him. That goes
  into his DNA."
- **Thoughts:** "Grab it… drag… Adjust DNA, there." Then: "Did it go
  in?"
- **Emotions:** Before: purpose, a sense of authorship. During: focus,
  a little care not to miss. After: satisfaction, if the zone answers;
  doubt, if nothing changes.
- **Expectations:** The zones change their names the moment the drag
  starts, so they know where it can go. The zone under the pointer
  shows it will take the drop. Release: the zone shows it now holds the
  file, under half a second. The firefly leaves the "unsorted" crowd in
  some visible way, even though it stays dim (assumption: "put in order"
  happens on use, but "chosen" must still show; Q2).
- **Success:** "Picked it up, put it in his DNA. He's mine to shape."
- **Friction and fears:** Not knowing which firefly is which (C4). The
  zone names only appear during the drag, so first-timers don't know
  there are zones until they try. A drop that looks like nothing
  happened (W1).
- **Product insight:** The drop needs two clear signals that never mix:
  **accepted** (now, by the zone) and **used** (later, the firefly
  shines). Phase 3 owns the first, Phase 4 the second. Every zone drop
  gets an Undo line.

### C3 · Look for proof that a file is really used

- **The moment:** Seconds after a drop, then again minutes later, then
  the next morning (C14).
- **The trigger:** The firefly they just placed is still dim.
- **Thoughts:** "Why isn't it lit? Did it fail? Should I drop it
  again?" Later: "Oh, it's lit now. It really read it."
- **Emotions:** Before: hope. During the wait: doubt, then patience
  if they can tell work is happening. After it shines: trust, real
  pride, a "this is honest" feeling the doubter rarely gets from tools.
- **Expectations:** Upload boxes have taught them "drop = done". They
  expect bright at once. When it isn't, they want to know *why* and
  *how long*, in plain words, without opening anything.
- **Success:** "It only lights what it really used. I can trust what I
  see."
- **Friction and fears:** No sign of work, so dim looks like broken.
  Dropping again (C5). Knowledge files can't go bright at all until the
  RAG machine exists, so the Knowledge side may look broken forever
  (Q3).
- **Product insight:** Dim must have two readable kinds: **dim and
  waiting** (accepted, in line) and **dim and unsorted** (never placed).
  Without that, the rule punishes the user for trusting it. The bright
  signal comes per file from the machine. The "same file twice" case
  mostly starts here: fix the waiting signal and most repeat drops go
  away.

### C10 · Drop a whole folder straight from Finder onto one zone

- **The moment:** The split is on screen, Finder open beside it. They
  have a "Books" folder of 40 PDFs.
- **The trigger:** "I'm not dragging 40 dots. All Books go to
  Knowledge."
- **Thoughts:** "Drag Books onto Adjust Knowledge. Done."
- **Emotions:** Before: impatience, efficiency. After: relief, if all
  40 went; anger, if only one did or if they also got 40 new dim
  duplicates.
- **Expectations:** The same zones show while dragging from Finder as
  while dragging a firefly. The files that are new join the field and
  are routed in one move; files already in the agent are routed, not
  doubled. The scan from Phase 1 runs for this drop too, so a big
  folder feels the same as at the start.
- **Success:** "One drop, a whole shelf sorted."
- **Friction and fears:** A path mismatch: the field has
  `Tony Course/Books/a.pdf`, the new drop is `Books/a.pdf`, so the same
  book shows twice (W5, Q6). The drop on a zone is taken as a plain
  drop and lands unsorted.
- **Product insight:** Since the left side has no multi-select this
  update, dropping a folder from Finder onto a zone is the only fast way
  to route many files. It must work from day one. Match repeats by path
  inside the agent, and test a re-drop of a subfolder.

### C4 · Scan the field to find a file

- **The moment:** They want to route one specific file: the bio, the
  main book.
- **The trigger:** "Where's *Awaken the Giant*?"
- **Thoughts:** "Which dot is it? They all look alike."
- **Emotions:** Before: purpose. During: growing frustration with every
  dot that isn't it. After: they give up and use the chat (C12) or
  Finder (C10).
- **Expectations:** Any file list lets you see names. They expect at
  least a name when they point at a dot.
- **Success:** Found in a few seconds.
- **Friction and fears:** With 500 identical dim dots, finding one is a
  guessing game. This is the main cost of keeping the left side simple.
- **Product insight:** This update keeps the field simple on purpose,
  so the working paths are Finder-to-zone (C10) and the chat (C12);
  both must work well now. Finding one file in the field is the first
  need for **f-the-left-side**. (Assumption: whether even a name on
  hover belongs in this update is a product call; the roadmap keeps it
  out. Q1.)

### C1 · Watch a huge folder being counted

- **The moment:** The clone-maker's big drop: 12 GB, 8,000 files.
- **The trigger:** They just let go of the folder.
- **Thoughts:** "That's a lot. Is it coping?" Then, as the count grows:
  "Look at it go. It's finding everything." If it stalls: "Frozen?"
- **Emotions:** Before: excitement with worry. During: if the circling
  stays smooth and the count visibly grows, a kind of awe, the material
  "becoming" fireflies. After: trust. If it freezes, a doubt that
  colours everything after.
- **Expectations:** No beach ball, no stall. Proof of progress without
  numbers they must read: the field filling up. An end they can see:
  the circling calms and the split arrives.
- **Success:** "It counted every file, and I watched it happen."
- **Friction and fears:** 8,000 fireflies can't all fit on a laptop
  screen at radius 2.5 to 6 (Q1). The scan of a slow disk takes
  minutes. They want to stop a wrong drop (C11) and can't.
- **Product insight:** Phase 1's fast circling holds for the whole
  scan, and the visible count grows as files are found. Esc stops a scan
  cleanly and keeps nothing half-done. If there is a visible cap on
  fireflies, the real count must still be readable somewhere (design
  rule: a cap means the count the user can see).

### C8 · Clear out junk

- **The moment:** Right after the split, looking at a field that's
  bigger than the material they meant.
- **The trigger:** "There are 300 files here, but the course is 60
  videos and some PDFs. What's the rest?" Screenshots, `.zip`s,
  installers, "copy (2)" files.
- **Thoughts:** "Get rid of the junk so I can see what matters."
- **Emotions:** Before: mild annoyance, a wish for order. During:
  careful, a little nervous about deleting the wrong thing. After:
  relief, the field feels like "his" material.
- **Expectations:** Throwing away is quick and undoable. It never
  touches the files on their Mac (W4). Thrown-away files don't come
  back on their own.
- **Success:** "Only the good stuff is left."
- **Friction and fears:** One by one is too slow for hundreds of junk
  files, and the simple field can't select many (f-the-left-side).
  Fear that "thrown away" deletes from disk.
- **Product insight:** The rule already helps: junk that is never used
  stays dim and does no harm, so cleaning is optional, not required.
  Saying that kindly is worth more than a fast bulk delete this update.
  Bulk cleaning is the second need for f-the-left-side. Throwing away
  is only for dim files and always has Undo.

### C6 · Drop onto the wrong zone, or miss

- **The moment:** Mid-session, quick drags, many in a row.
- **The trigger:** The pointer was over Adjust Knowledge when they
  meant Adjust DNA, or they let go between zones.
- **Thoughts:** "No, not there!" or "Where did it go?"
- **Emotions:** A sharp moment of "oops", then either calm (if Undo is
  right there) or stress (if they must hunt).
- **Expectations:** Undo, right away, one click, like every Mac app
  (Cmd+Z too). A miss does nothing harmful: the file is still in the
  field.
- **Success:** "Oops, undo, fine."
- **Friction and fears:** A wrong route that starts real work at once
  (embedding a file into the wrong place). No way to see where a file
  went. A miss that loses the file.
- **Product insight:** Routing is a plan, so undo is cheap: it puts the
  feeds back as they were (Phase 3). This is another reason routing and
  using must stay separate. Moving a file from one zone to another by
  dragging again is just a new route. Only the zone under the pointer
  lights, so a miss is visible as "nothing lit".

### C7 · Take back a file that went bright

- **The moment:** Days later, or minutes after a file went bright.
- **The trigger:** "That's my own notes, not his words, and it's in his
  DNA." Or the agent sounds off in a test chat and they trace it to one
  file.
- **Thoughts:** "Take that out of him."
- **Emotions:** Before: worry, a little guilt ("I put it there").
  During: careful. After: relief, if the agent is clean again.
- **Expectations:** It can be undone, even though it was "really used".
  The firefly goes dim when it's out. They understand that taking it
  out of a finished system prompt means rebuilding it, and accept a
  wait if they're told.
- **Success:** "It's out, and the dot went dark. I can see it's gone."
- **Friction and fears:** Bright being forever. A quiet "removed" that
  leaves the file's influence in the prompt. Having to start the agent
  over.
- **Product insight:** Bright is a fact, so taking it back is real work,
  not a flag flip: the firefly goes dim only once the machine has really
  removed it (the same honesty as going bright, W2). Bright files can't
  be thrown away directly; they are taken back first (assumption Q5,
  kept simple and safe; Phase 4 of the roadmap).

## Key insights

1. **The job is "turn my pile into a real agent, and show me what it
   really took."** The dim and bright rule is the screen's promise of
   honesty; it is what makes this different from upload boxes.
2. **Accepted and used are two states, and both must be visible.**
   A drop is accepted at once by the zone; the firefly shines later,
   on real use. Mixing them breaks trust either way (W1, W2).
3. **Dim needs two kinds: waiting and unsorted.** Otherwise a correct
   drop looks like a failure and people drop again (C3, C5).
4. **Routing is a plan, so undo is cheap.** Wrong zone and misses are
   solved by Undo, not by confirms (C6). Taking back a used file is
   real work and is shown as such (C7).
5. **With a simple field, Finder-to-zone and the chat are the fast
   paths.** They must be solid this update (C10, C12). Finding one file
   and cleaning many are the first needs for f-the-left-side.
6. **Big folders are normal; the count is the receipt.** Smooth fast
   circling and a growing count during the whole scan (C1).
7. **Junk is harmless when dim.** Cleaning is optional; say so kindly.
   Throwing away never touches the disk and always has Undo (C8, W4).
8. **Same path, same firefly.** A repeat drop never adds a second dot
   (W5).

## Open questions (with the assumption we work with until answered)

- **Q1 · Names and a cap on the field.** Does pointing at a firefly show
  its name this update, and how are 8,000 fireflies shown?
  *Assumption:* no names (f-the-left-side); the visible count may be
  capped by Jony, with the real count readable.
- **Q2 · Where a placed but unused firefly sits.** The rule says files
  are "put in order" on use. *Assumption:* a routed file stays dim and
  in the field, with a visible "waiting" mark; it moves into order only
  when it shines.
- **Q3 · Knowledge before the RAG machine exists.** *Assumption:* files
  can be routed to Knowledge now, but stay dim and waiting until the
  machine really embeds them. That is honest; the waiting mark must
  say so calmly.
- **Q4 · What "turned into a skill" means.** *Assumption:* one drop on
  Create new skill starts one new skill from that file; it shines when
  the skill exists.
- **Q5 · Bright files and throwing away.** *Assumption:* bright files are
  taken back first, then can be thrown away.
- **Q6 · Same content, different path.** *Assumption:* two fireflies
  (identity is the path, as today). Revisit with f-the-left-side.
- **Q7 · Chat and drag together.** *Assumption:* both route through the
  same `routeFiles`, so a chat route and a drag route look the same on
  screen.

## Sources

- Google NotebookLM FAQ, source limits:
  https://support.google.com/notebooklm/answer/16269187
- Third-party write-ups of NotebookLM uploads that "complete" while the
  document is treated as empty and never indexed (the trust problem the
  dim and bright rule avoids):
  https://fast.io/resources/notebooklm-upload-failed/ and
  https://fast.io/resources/notebooklm-limits/
- Apple Human Interface Guidelines, drag and drop (feedback while
  dragging, only the target under the pointer highlights, undo):
  https://developer.apple.com/design/human-interface-guidelines/drag-and-drop
- Nielsen Norman Group, drag and drop: https://www.nngroup.com/articles/drag-drop/
- Project code: `src/creator/files.mjs` (`addFiles`, `routeFiles`,
  `dnaOf`), `src/server/public/file-intake.js` (`walkEntries`,
  `isHidden`, `BATCH`).
- Earlier team research: `updates/2026-11-27 FIREFLIES-BUILD/01-columbo-report.md`,
  `updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`.

## Hand-off note for Merlin

Merlin, the four moments you mark sit on these behaviours and phases:

- **Fast circling while the scan counts** → C1 (huge folder), Phase 1.
  The feeling to protect: "it's finding everything", never "frozen".
- **The split into field and character menu** → C2 and C4, Phase 2.
  The left stays a simple field; don't add anything that belongs to
  f-the-left-side.
- **The drag that renames the parts** (Adjust DNA, Adjust Knowledge,
  Create new skill) → C2, C6 and C10, Phase 3. The zone accepts at once;
  the firefly stays dim.
- **Dim to bright on real use** → C3 and C7, Phase 4. Bright is earned,
  never shown early; going dim again on take-back is the same honesty.

Mind W1 and W2: "accepted" and "used" must never look alike. Team rule:
no magic on errors, deletion (throwing away) or private material.
