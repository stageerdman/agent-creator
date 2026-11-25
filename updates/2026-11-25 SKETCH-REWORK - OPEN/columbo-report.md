# Columbo report: how people will use the new Sketch

Research for the SKETCH-REWORK update. Readers: Merlin (magic), Jony
(build), Eraser (cut review). It builds on the FULL-UX journey map
(`updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`, cited as UJ# and
D#) and does not repeat it.

## 1. Summary

People open the Sketch for three jobs, and the rework should give each
job one clear home:

1. **"Fix how it sounds."** They read or change the text that *is* the
   agent. Today that text is split into Persona and Instructions, and
   nobody can say where a line belongs. One **Instructions** box ends the
   question. (Job: *make it more like them.*)
2. **"Show me who this is."** They glance at the face, name, one-line
   description and what it is good at / medium at / not trained for.
   That is the **Profile** switch. It is the card they check before they
   ask it something, and the card they fix when it looks wrong. (Job:
   *know what I can hire this agent for.*)
3. **"Show me what it's made of, so I can trust it."** They open
   **DNA** when an answer surprised them or after adding material: the
   instructions, then the source files those came from, then the RAG
   files, then a quality check. (Job: *trust it, and know what to add
   next.*)

The **Talk to [Name]** section in the Sketch and the **Studying · about 5
min left** pill in the top bar are both a second way to do something the
app already does (the Talk/Sketcher mode switch; the study block in the
agent's own view). Dropping them follows our rule "one way to do each
thing" and lowers noise during the long first learning run.

The biggest risks: **losing text when Persona and Instructions merge**,
a **DNA view that reads like a database** instead of an answer to "why
does it say that?", and **people losing sight of a running study** once
the top pill is gone.

## 2. Scope

**In (this update, MVP of the rework):**
- One merged **Instructions** section; Persona folded in; the
  **Talk to [Name] →** button/section gone from the Sketch (Keep card).
- **Profile** switch: image (face), name, description, and skills sorted
  into good at / medium / not trained for.
- **DNA** switch: instructions → source files behind them → RAG files →
  quality analysis, every part adjustable. Mock data where there is no
  backend yet.
- Removing the top-bar **Studying · about 5 min left** pill.

**Out (and why):**
- The real RAG pipeline, chunking, embeddings: still an open decision
  (CLAUDE.md). DNA shows mock data shaped like the real thing.
- The real instruction-to-source link ("this line came from that
  file"): needs engine work. Mocked now; behavior researched so the
  mock matches what people will want.
- File drop into DNA as its own feature: another item in this goal. I
  cover the *behavior* (#7) so DNA leaves room for it, not its build.
- Talk, Export, Palette, Home: unchanged, except where they echo
  Persona (Export's word counts show "Persona", see watch-out W2).
- Mobile: the app is a Mac app; all behaviors assume a laptop/desktop.

## 3. Who I pictured

- **The clone-maker** (main user): built an agent of a teacher or
  author they follow (the Tony Robbins example) from course files. Cares
  about likeness. Comes back to the Sketch after a wrong note in chat.
- **The self-cloner:** made an agent of themselves from their own
  writing. Sensitive: "not trained for" can read as a judgment of them.
- **The role-builder:** made a "pricing coach" from one line, no files.
  Their DNA has instructions but no sources. Must not look broken.
- **The tired evening tinkerer:** 10 pm, a little bored, opens the
  Sketch "just to look", tweaks one line, closes.
- **The power user:** has 6+ agents, edits instructions by hand,
  wants to know exactly what goes into the prompt.
- **The impatient first-timer:** dropped a folder, wants to see
  progress *now*, and used to stare at the top pill.

## 4. Behavior table

Scores 1–10. L = likelihood (how many users do it), F = frequency (how
often). Sorted by L + F. When unsure I chose the lower score.

| # | Behavior | L | F | Reason |
|---|---|---|---|---|
| 1 | **Fix a line in Instructions after a wrong note in chat** | 9 | 8 | The core loop from D7/UJ7. Every clone-maker hits a wrong note within days; with one box they no longer stop to ask "Persona or Instructions?". |
| 2 | **Glance at the Profile before asking** ("is this the right one?") | 8 | 8 | With several agents, people check "what is it good at" before choosing (D2). Fast and often, but only if Profile is the first view. |
| 3 | **Open DNA to see why it said something** | 8 | 7 | Surprise in chat → "where did that come from?" (D4). Strong pull, but only after a surprise, so a bit less often than #1. |
| 4 | **Read the quality analysis after adding files** | 8 | 7 | Same moment as D6's capability map: "what did it get from all that?" Happens after each batch of material. |
| 5 | **Change the face, name or description** | 9 | 4 | Almost everyone does it once or twice right after Keep (UJ9), then rarely. High L, low F. |
| 6 | **Re-sort a skill** (move "money" from medium to not trained for, or the other way) | 7 | 5 | When the summary is wrong they want to correct it, like the witness correcting a portrait. Not daily. Lowered F: most only do it after new files. |
| 7 | **Drop a new file straight onto DNA** | 7 | 5 | The quality line says "not trained for money" → they grab the money book and drop it right there. Natural, but depends on the gap. |
| 8 | **Turn a RAG file off or remove it** ("that interview is off-topic") | 6 | 4 | People who look at sources start pruning. Not common, but risky (see W4). |
| 9 | **Follow an instruction back to its source file** | 6 | 5 | Power users and skeptics. Most people trust the sum; some check one line to see if it's real. I gave 6, not 7: the link is new and must be seen to be used. |
| 10 | **Look for the study progress after the top pill is gone** | 7 | 4 | Anyone who drops a big folder looks for "how far along?" at least once per run. Only during a run. |
| 11 | **Paste old Persona-style text into Instructions** | 5 | 3 | Users with prompt habits from GPT builders paste "You are…" blocks. Must just work. |
| 12 | **Toggle Profile ↔ DNA back and forth to compare** | 5 | 4 | "It says good at X — show me the files for X." A bridge they will want, not a main path. |
| 13 | **Look for the old Persona field** | 6 | 2 | Returning users of earlier builds, once. Low F, but it's a trust moment (W1). |
| 14 | **Look for the old Talk to [Name] button** | 6 | 2 | Same: once, after the update. The mode switch must be obvious. |
| 15 | **Ask the Sketcher chat to change the Profile or DNA** ("make the description shorter") | 5 | 3 | Habit from the chat-first Sketch. Must land in the same fields, with the usual change line. |
| 16 | **Show the DNA to someone else** (screen share, a friend) | 3 | 2 | "Look what it's made of." A brag moment. Low, but the view should look good. |
| 17 | **Try to edit a source file's text inside DNA** | 3 | 2 | Some think "adjustable" means editing the book. It shouldn't (W5). |

## 5. Deep dives (top 6: both scores 7+ and the strongest near-misses)

### D1. Fix a line in Instructions after a wrong note (#1)

- **The moment:** Evening, at the laptop, mid-chat with the agent. It
  just said "Great question!" or gave advice the person would never give.
  They hit the mode switch to Sketcher.
- **Trigger:** One wrong line breaks the likeness.
- **Thoughts:** "He'd never say that. Where's the bit about how he talks?
  …OK, this is all in one place now. Good. Let me find 'tone'."
- **Emotions:** A small sting of "it's not him" → focus while hunting →
  relief when the fix is in, and a little pride.
- **Expectations:** Opens straight on the text, cursor ready, in 1 step
  from Talk. Search-like scanning: short headed paragraphs, not one wall.
  Saving is automatic (autosave, our rule). Then back to Talk to test it
  in 1 click.
- **Success:** "Changed one sentence, asked again, and now it sounds like
  him."
- **Friction and fears:** A long wall of text where the old Persona just
  got pasted on top. Losing the old Persona text in the merge ("where did
  my voice notes go?"). The AI rewriting their hand edit later (our rule:
  hand edits win).
- **Product insight:** The merged box must keep *all* old text, with
  the former Persona part first (who they are) and the job/rules after
  (what they do), so the order still reads naturally. One label, one
  hint ("Who they are and what they do"). Change lines say "Sketch:
  instructions updated", never "persona". The ↗ change lines that point
  to "persona" (block-b) must point to Instructions.

### D2. Glance at the Profile before asking (#2)

- **The moment:** Morning, a work question in mind ("how should I price
  this?"). They have four agents and aren't sure which one fits.
- **Trigger:** A real question and a choice to make.
- **Thoughts:** "Would Tony know pricing? …good at: sales talks,
  'Rough' on pricing — medium. Hmm. Maybe the other one."
- **Emotions:** Slight hurry; calm when the answer is obvious within a
  second; mild irritation if they must scroll.
- **Expectations:** Profile is the **first** switch and the default when
  the Sketch opens after Keep. Face, name, one line, then three short
  lists. Readable in 3 seconds. Specific words ("6 Human Needs"), not
  "motivation" (D6 in FULL-UX).
- **Success:** "I knew in a glance who to ask."
- **Friction and fears:** Generic skills. Long sentences instead of
  chips. An empty "not trained for" that reads as "can do everything"
  (false confidence). For self-cloners: "not trained for" reading as a
  verdict on them.
- **Product insight:** Short chips in three rows; the third row is
  framed as *material* ("not in the material yet"), not ability. An
  empty row says so plainly instead of vanishing. Profile is a glance
  view first and an edit view second: editing happens in place (click a
  field), no Edit mode.

### D3. Open DNA to see why it said something (#3, with #9)

- **The moment:** Right after a surprising answer, good or bad. "Where
  did 'the Triad' come from? I don't remember giving it that."
- **Trigger:** Curiosity or doubt about a specific claim.
- **Thoughts:** "Is that from his book, or did it make it up?" "Which
  files actually shaped this?"
- **Emotions:** Suspicion or wonder before → absorbed while tracing →
  trust (or a clear "aha, that file is the problem") after.
- **Expectations:** DNA opens in the fixed order: Instructions on top,
  then the source files those came from, then the RAG files, then
  quality. Click a part of the instructions → the source files behind it
  light up. Plain file names they recognise (their own file names). Under
  2 seconds to the first layer. No jargon: "RAG", "chunks", "embeddings"
  never shown as labels.
- **Success:** "It's from day 2 of the seminar. Real. I trust it more."
- **Friction and fears:** A database-like list of 300 files with no
  link to the question they came with. Not knowing which layer they are
  looking at. Magic that delays the answer (our rule: no magic on
  sources or scores — motion only on the reveal, never on the content).
  A role-builder's DNA with an empty "source files" layer that looks
  broken.
- **Product insight:** Each layer is one card with a plain title and a
  count ("Made from 12 files", "Looks up 240 files"). The link from an
  instruction to its source file is the heart of DNA; with mock data it
  must still feel true (use the agent's real file names). A missing
  layer says what it means in one line ("Made from one sentence, no
  files yet") with one action. Plain layer names; I suggest
  "Instructions", "Made from", "Looks up", "How good" — Merlin owns the
  final words in the team's word list.

### D4. Read the quality analysis after adding files (#4, with #7)

- **The moment:** After the first study finishes, or after a top-up.
  They come back from a coffee.
- **Trigger:** "So, what did it get from all that?"
- **Thoughts:** "Coverage on relationships is thin, that's one seminar.
  Two files couldn't be read — which ones? Oh, the scanned PDFs."
- **Emotions:** Interest, then recognition or a useful shock. Annoyance
  at a bare number with no reason.
- **Expectations:** A short plain verdict, a few lines max: what is
  strong, what is thin, what failed to read, each with *why* and one
  action ("Add material on money", "Replace the 2 scanned files"). They
  expect to fix it right there: drop a file onto DNA (#7) or remove a bad
  one.
- **Success:** "It told me something true I hadn't noticed, and I knew
  what to add."
- **Friction and fears:** A score without a reason ("72%" — of what?).
  A long report. A quality line that disagrees with the Profile's skill
  rows (two truths).
- **Product insight:** Quality and Profile's three rows come from the
  same data; if one changes, both change. The score settles once, no
  counting-up animation that dramatises it. Each issue has exactly one
  action next to it. Dropping a file onto DNA should feel like the natural
  answer to "thin on money" — leave room for the drop target (built in
  another item).

### D5. Change the face, name or description (#5, with #6)

- **The moment:** Right after Keep, while proud of the new agent. Or a
  week later when the description sounds off.
- **Trigger:** "It should look and sound like a proper card."
- **Thoughts:** "Not that face. And the line should say 'Coach for
  sales calls', not 'An AI version of…'." Later: "money isn't medium,
  it's not trained at all — move it."
- **Emotions:** Playful, low-stakes, a sense of ownership.
- **Expectations:** Click the face → the existing face picker (no new
  flow). Name and description edit in place, saved on their own. Skill
  chips move between rows with one click or drag, and their choice
  sticks after the next study (hand edits win).
- **Success:** "Looks like mine now."
- **Friction and fears:** A second way to edit the name (Profile and the
  old Name field both — must be one). The AI quietly moving a skill back
  after the next study. Not knowing if moving a chip changes how the
  agent behaves.
- **Product insight:** Name moves to Profile and lives only there.
  Moving a chip is the user's *judgment* of the portrait; say in one
  line what it does (assumption: it changes the summary only, not the
  instructions, in this MVP — open question Q2).

### D6. Look for study progress after the top pill is gone (#10)

- **The moment:** They dropped a 40-file folder, went to Talk with
  another agent, and want to know "is it done yet?"
- **Trigger:** Impatience, or a plan ("I'll try it after lunch").
- **Thoughts:** "Where did the timer go? Is it still working?"
- **Emotions:** Mild anxiety if nothing tells them; calm if one quiet
  sign exists.
- **Expectations:** Progress lives with the agent, in DNA (the
  "Looks up" layer fills as files are studied). A quiet sign on the
  agent's Home card. A note when it's done (existing Ready mark).
- **Success:** "I forgot about it, and it told me when it was ready."
- **Friction and fears:** Thinking the study stopped because the pill
  vanished. Two progress displays left behind.
- **Product insight:** Removing the pill is right (less noise, one
  place), *if* the study block's progress stays in the agent view and
  the Home card keeps its mark. The "paused, Claude isn't reachable"
  warning must still be findable — that is an error, not progress.

## 6. Key insights

1. **Three jobs, three homes:** Instructions = make it more like them;
   Profile = know what to hire it for; DNA = trust it and know what to
   add. If a control doesn't serve one of these, it's out.
2. **Profile is the glance, DNA is the proof.** Profile first and
   short; DNA deeper and only when asked.
3. **The instruction-to-source link is DNA's magic and its trust
   test.** Done well it answers "is it real?"; faked badly it destroys
   trust. Mock links must use the agent's own file names.
4. **One source of truth for quality.** Profile rows and DNA quality
   must never disagree.
5. **The merge must lose nothing.** Old Persona text goes in first,
   word for word.
6. **Fewer status signals, but no silent study.** The pill can go;
   progress must stay one click from the agent.

## 7. Watch-out list (low score, high risk)

- **W1 · Persona text lost in the merge.** Any kept agent with a
  Persona must keep every word. Test it. Old drafts and imported files
  that still carry `persona` must load into Instructions.
- **W2 · Leftover "Persona" words.** Export sheet (block-f: "Persona ·
  N words"), change lines ("persona and instructions updated"), the
  `persona` field in `FIELDS`, the magic order of three fields. Each is a
  "where did it go?" moment.
- **W3 · Two places for one thing.** Name in Profile *and* a Name field;
  "What it knows" tab *and* DNA; Talk button *and* mode switch. Pick one.
- **W4 · Removing a RAG file by accident.** It changes what the agent
  knows. Use an Undo line, not a confirm (our rule). The user's own
  file on disk is never touched — say so.
- **W5 · Editing a source file in DNA.** Source text is evidence, not a
  draft. Show it read-only; "adjustable" means include / exclude /
  replace, not rewrite.
- **W6 · Private material on screen.** DNA shows file names and quotes
  from private courses. Nothing from DNA leaves the Mac or goes into an
  export by default (FULL-UX open question 4 still holds).
- **W7 · Self-cloners judged.** "Not trained for" is about material,
  never about the person.
- **W8 · Mock data mistaken for real.** If mock quality says "strong on
  money" for a real agent with no money files, trust breaks. Mock data
  should only appear for mock agents, or be derived from the agent's
  real file list.
- **W9 · Blank Home after the update.** The NATIVE-SHELL lesson: a new
  script not served by the server gives a blank Home in the .app.

## 8. Open questions (with my assumptions)

- **Q1 · Do Profile and DNA replace the "Sketch | What it knows" tabs?**
  *Assumption:* yes. Profile takes the capability rows, DNA takes the
  study block and files. Keeping "What it knows" next to DNA would be two
  homes for one thing (W3).
- **Q2 · Does moving a skill chip change the agent?** *Assumption:* in
  this MVP it changes the summary only, and the change line says so.
  Later it could steer study or instructions.
- **Q3 · Where does the Sketcher chat sit?** *Assumption:* unchanged,
  next to the switches; its edits land in Instructions or Profile with
  the usual change line.
- **Q4 · What does "adjustable" mean per layer?** *Assumption:*
  Instructions = edit text; source files = remove / add; RAG files =
  turn off / remove / add; quality = act on each issue (one action each).
- **Q5 · Is the description new data or the Keep card's first
  sentence?** *Assumption:* a new short field, prefilled from the first
  sentence of Instructions, then the user's.
- **Q6 · Which switch opens by default?** *Assumption:* Profile after
  Keep; Instructions/DNA while still sketching (before Keep there is
  little to profile).

## Sources

- FULL-UX journey map: `updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`
  (D2, D4, D6, D7; watch-out and open question 4).
- Team rules: `principles/magic-ux/design-rules.md`,
  `principles/magic-ux/world-and-words.md`.
- Current Sketch code read for this report: `src/server/public/index.html`
  (fields), `sketch.js` (`FIELDS`, `changeLine`), `block-a.js`
  (`studyLine`, top pill), `block-b.js` (`Talk to [Name] →`),
  `block-f.js` (Export counts).
- GPT builder users on chat vs. hand-edited fields: chat rewrites
  instructions, people move to editing fields directly —
  [OpenAI community: GPT Builder findings](https://community.openai.com/t/lets-share-our-gpt-builder-findings-tricks-and-doubts/561970),
  [Instructions interpretation issues](https://community.openai.com/t/instructions-interpretation-issues/592879),
  [Lost / unsaved update with GPT Builder](https://community.openai.com/t/lost-unsaved-update-with-gpt-builder/845081).
- Clone products and the need to keep feeding and reviewing a clone:
  [Scaling your persona: a review of Delphi in 2026](https://aiindigo.com/blog/scaling-your-persona-a-thorough-review-of-delphi-in-2026),
  [Fast Company on Delphi](https://www.fastcompany.com/91356476/delphi-ai-digital-mind).
- Assumption (my own knowledge, not checked here): tools like NotebookLM
  and Claude Projects show a plain source list with on/off and a capacity
  line, which sets the expectation for DNA's "Looks up" layer.
