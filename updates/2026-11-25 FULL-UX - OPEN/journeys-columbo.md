# Journey map: how people will live with the whole app (P1–P12)

*Columbo, UX Detective. 2026-11-25. For Merlin, Jony and Eraser, then the
build team. Builds on `updates/2026-11-24 AGENT-CREATOR - OPEN/research-columbo.md`
(P2, shipped). That file still holds for the creation chat. This one adds
everything around it.*

## 1. Summary

People hire Agent Creator for **two different jobs**, and the app has to
carry both:

1. **Make** (rare, deep, emotional): *"Take everything I have of this
   person and turn it into someone I can talk to, who really knows their
   stuff."* It happens once per agent, takes 10 minutes to an evening, and
   ends with the feeling "that's them."
2. **Talk** (often, light, practical): *"I have a problem right now. Let me
   ask the person who would know."* It happens many times a week, takes a
   few minutes, and ends with an answer they trust.

After the first agent is kept, **Talk becomes the main reason to open the
app**. Make becomes something they do now and then. The first run is all
Make; month two is mostly Talk.

Between the two jobs sits one question the user asks again and again:
**"How good is it, really, and where is it weak?"** The learning insight
(P10), the quality score (P10) and the capability map (P12) are three
answers to that *one* question. In the user's head they are one place.

Three things decide trust in the whole app:
1. **Evidence.** The core user knows the source material deeply and will
   test the clone. Every answer that claims knowledge must be able to show
   where it came from. One made-up quote breaks the agent for them.
2. **Honest limits.** "It isn't trained for this" said up front builds
   more trust than a confident guess later.
3. **One round trip between Talk and Make.** When an answer sounds wrong in
   chat, the user wants to fix the agent *from there*. They won't remember
   to go find the creator.

## 2. Scope

**In (the whole app, as the clickable prototype):** first run, the agent
library, making an agent from one line (P2, real) or from material
(P3 intake + rules, P5 generation, P12 first map), the wait while material
is learned (P3/P4), Keep and the capability card (P12), the learning
insight and scores (P10), talking with an agent grounded in its knowledge
(P4, P8), chat history (P9), fixing an agent from the chat, icons and
characters (P7, P11), exporting and importing the agent file (P6), errors.

**Out (and why):**
- **How RAG works inside** (chunking, embeddings, stores). It's a backend
  decision, still open per CLAUDE.md. I only cover what the user sees of it:
  waiting, sources, gaps.
- **Talking to several agents in one chat.** masters-wheel has it, and
  people will ask for it ("what would Tony and Marcus each say?"). No
  feature covers it yet. Listed as an open question, not mapped.
- **Phone.** It's a desktop .app. Scored 1.
- **Sharing agents with other people.** P6 is about the user's *own* apps.
  Sharing a clone of a real person with others is an ethics question (see
  watch-outs).
- **What the DNA visual looks like.** P11 says the look is still open and
  needs Elon's research first. I map the *behavior* around it only.

**Assumptions (mine, please check):**
- **A1** (from P2, still holds). Users are the project owner and people
  like them: comfortable with AI, Claude Code installed, building clones of
  real people (coaches, authors, themselves) or clear roles.
- **A2.** The owner has other apps (masters-wheel in `~/dev` already takes
  agents with knowledge files). P6's agent file is mainly for *them*, not
  for strangers.
- **A3.** Real material is big: a course folder can be hundreds of files,
  with video and audio. Learning it will take minutes, sometimes hours.
  *This is the biggest new emotional problem in the app.* (The Tony
  Robbins corpus in this repo is the reference case.)
- **A4.** In month two, a typical user has 3–10 agents and talks to 1–3 of
  them often.
- **A5.** Frequency in the table below means *how often once the app is
  part of their week*. Making behaviors happen once per agent; talking
  behaviors happen daily. That's why making scores lower on frequency even
  when it matters a lot.

## 3. Who I pictured

- **The clone-maker** (core). Has a folder of a teacher's courses and books.
  Knows the person deeply. Will quiz the clone on things they know the
  answer to. *Most of the trust questions come from them.*
- **The self-cloner.** Makes an agent of *themselves* from their own notes,
  posts and call recordings, to answer clients or think out loud. Very
  sensitive about privacy and about being "scored."
- **The role-builder.** A tough editor, a legal-reading helper. Small
  material, clear rules. Cares about "will it follow the rules".
- **The corpus power user.** Points at a 40 GB folder by path and writes
  rules ("only PDFs and MD into the knowledge, Q&A sessions only for
  voice"). Wants control and visible progress.
- **The daily asker.** Months in. Opens the app with a real problem in the
  morning or late evening, picks "who'd know", asks, closes.
- **The owner as integrator.** Wants the same agent inside their other
  apps, exactly the same, without rebuilding it.

## 4. Behavior table

Likelihood = how likely a real user is to do this at all. Frequency = how
often, once the app is part of their week (A5). Both 1–10, sorted by the
sum. "Feature" shows where it lives.

| # | Behavior | Feature | L | F | Reason |
|---|---|---|---|---|---|
| 1 | **Ask an agent a real question** | P8, P4 | 9 | 9 | This is what the agent is for. Once one exists, it's the main reason to open the app, several times a week. |
| 2 | **Pick "who'd know" from the library** | home | 9 | 8 | Every Talk session starts with choosing. With 3+ agents it becomes a real decision: "is this a Tony problem or a Marcus problem?" |
| 3 | **Quiz the clone on something they know** | P8, P2 | 8 | 7 | Clone-makers test before they trust: "what does he say about state?" Heavy in the first days, then whenever material changes. Delphi and GPT users do the same. |
| 4 | **Check where an answer came from** | P4, P8 | 8 | 7 | Experts in the material want the quote and the source. Custom-GPT forums are full of "it made it up instead of using my files", so people check. |
| 5 | **Pick up an earlier conversation** | P9 | 8 | 7 | Coaching and thinking happen over days: "yesterday he told me to…". Lower than #1 because many questions are one-off. |
| 6 | **Read the capability map after adding material** | P12 | 9 | 6 | Everyone wants to know "what did it get from this?" right after bringing material in. Happens once per batch. |
| 7 | **Spot a wrong note in chat and want to fix the agent** | P8 → P2 | 8 | 6 | The clone says something the real person never would. Common in the first weeks, rarer later. The fix needs to start from the chat. |
| 8 | **Bring a whole folder (or a path)** | P3 | 9 | 5 | The core way to make a real clone. Once per agent plus top-ups. Includes video and audio. |
| 9 | **Walk away while it learns, and come back** | P3, P4, P5 | 8 | 5 | Big folders take minutes to hours (A3). Nobody watches a bar for an hour. Happens with every big batch. |
| 10 | **Look at the learning insight and scores** | P10 | 8 | 4 | Curious once after the first learning, then again after adding material or when an answer disappoints. |
| 11 | **See the capability card at Keep** | P12 | 8 | 4 | Shown once per agent at the finish. High weight, low frequency. |
| 12 | **Ask the Sketcher about the map** ("does it know his money stuff?") | P12, P2 | 7 | 5 | The map raises questions. People ask in the chat they already know. |
| 13 | **Make an agent from one line, no material** | P2 | 7 | 4 | Shipped. Still common for role agents and quick tries. |
| 14 | **Add more material to an existing agent** | P3, P10 | 7 | 4 | After seeing a gap in the map or a weak answer. "I have his newer book, let me add it." |
| 15 | **Let the app decide how material is used** (accept the proposed split) | P3 | 7 | 4 | Most people won't write rules unless the default is wrong. They correct one thing ("not the Q&A for the persona"). |
| 16 | **Say in plain words how parts are used** (own rules) | P3 | 6 | 4 | Power users do it every time; others rarely. I took the lower score on purpose: the feature exists for when the default is wrong, not as a step. |
| 17 | **Search old conversations** ("where did he say…") | P9 | 6 | 4 | Grows with history. ChatGPT users complain loudly when search can't find old chats. |
| 18 | **Accept or redo the AI icon** | P7 | 7 | 3 | Every new agent gets one. Most accept; some redo once or twice. |
| 19 | **Export the agent to another app** | P6 | 7 | 3 | The owner will do it for every agent they use elsewhere (A2). Rare for others. |
| 20 | **Drop private material** (client calls, own journals) | P3 | 6 | 4 | Self-cloners will. Mostly a trust question: does it stay on my machine? |
| 21 | **Set a real photo for the agent** | P11 | 7 | 2 | A face makes it "them". Once per agent. Clone-makers of real people will want a real photo. |
| 22 | **Look at the agent's DNA / soul visual** | P11 | 6 | 3 | Fascinating the first time, then a glance. The look is still open, so I scored low. |
| 23 | **Remove a source** ("not this book") | P3, P4 | 6 | 2 | When a source makes answers worse. Rare, but people need to trust it's really gone. |
| 24 | **Delete an agent or a chat** | home, P9 | 6 | 2 | Cleanup. Rare, but can't be undone. |
| 25 | **Ask the agent what it knows** ("what books have you read?") | P8 | 6 | 2 | Natural in chat. The map is user-only, so the agent's answer must come from its sources, not the map. |
| 26 | **Import an agent file** | P6 | 5 | 2 | From another app, or moving machines. |
| 27 | **Open the app with the CLI missing or logged out** | P1 | 5 | 2 | First run on a new machine, or after a CLI update. Rare but blocks everything. |
| 28 | **Make a variant of an agent** ("Tony, but gentler") | home | 4 | 2 | Some will want it. Possible by making a new agent, so I scored low. |
| 29 | **Use it on a phone** | — | 1 | 1 | Desktop .app. |

**Merged:** "give a path" into #8 (same job, two ways in). "Drop video and
audio" into #8 and #9 (it's what makes the wait long). "Rename a chat" into
#17 (people rename to find later). "Read the generated persona" into the P2
behavior "glance at the draft".

## 5. Deep dives

Behaviors #1–#5 score 7 or more on both. I added #6, #7 and #8+#9 (merged
into one dive) because they decide trust and have no shipped answer yet,
even though their frequency is lower.

### D1. Ask an agent a real question (#1)

- **The moment:** 7:40 in the morning at the desk before work, or 10 pm on
  the sofa with the laptop. Just before: a hard email, a decision they keep
  putting off, a low mood.
- **Trigger:** "What would Tony say about this?" The person in the agent
  is someone they already go to in their head.
- **Thoughts:** "I don't want to explain my whole life again." "Just tell
  me what to do." "Is this really him or ChatGPT in a costume?"
- **Emotions:** Before: stuck, a bit heavy. During: hopeful, impatient for
  the first words. After a good answer: lighter, *seen*. After a generic
  answer: "it's just a chatbot", and a step back from the whole app.
- **Expectations:** From opening the app to typing: two steps at most
  (open, pick). Words start in a few seconds. The voice is the person's,
  from the first sentence. It answers *their* situation, not a lecture.
- **Success:** "He said exactly what he'd say, and it fit my problem."
- **Friction and fears:**
  - Landing in the creator when they wanted to talk.
  - A cold start that forgets what they told it last week (see D5).
  - Answers that sound like a summary of the person, not the person.
  - The agent narrating its search ("Let me look in my sources…").
- **Product insight:** Once an agent is kept, *talking* to it is the
  shortest path in the app. The P2 rule against narration (P1 pitfall 11)
  holds for agent chat too. Voice comes from P5's persona; facts come from
  P4. Both show up in every answer.

### D2. Pick "who'd know" from the library (#2)

- **The moment:** Right after opening the app. A problem in their head,
  not yet a name.
- **Trigger:** Opening the app *is* the trigger.
- **Thoughts:** "Who's good at this?" "Marcus for the hard call, Tony for
  energy." "Which one did I talk to about the move?"
- **Emotions:** Quick and practical. A small warmth on seeing familiar
  faces. Mild irritation if they have to hunt.
- **Expectations:** They recognise each agent at a glance, by face and
  name before any text. The ones they use most, or last, are easiest to
  reach. With one agent, there's no choice to make at all.
- **Success:** "I saw his face and I was already talking."
- **Friction and fears:**
  - All agents look the same (initials only) once there are five.
  - Not knowing which agent is good at what. People ask "who knows about
    money?" This is where the capability map quietly helps the *user*
    choose. It stays out of the agents.
  - Unfinished sketches mixed in with kept agents.
- **Product insight:** The face (P7/P11) is a *recognition* tool here, not
  decoration. The library shows "who they are and what they're good for" in
  one glance. Sketches and agents still learning look different from kept
  ones.

### D3. Quiz the clone on something they know (#3)

- **The moment:** The first evening after Keep, or right after adding a
  new book. Often with the source open in another window.
- **Trigger:** "Let's see if it really read it." A test, not a need.
- **Thoughts:** "In the course he has a whole model on this. Does it know
  it?" "That's the wrong number of steps." "Okay… that's actually his
  example."
- **Emotions:** Skeptical, a little playful. A real chill when it gets a
  niche detail right. Sharp disappointment, and suspicion of *everything
  else*, when it invents one.
- **Expectations:** Niche details right, with the source shown. When it
  doesn't know, it says so plainly. That is a pass, not a fail.
- **Success:** "It knew the thing only real fans know, and showed me where."
- **Friction and fears:**
  - A made-up quote or a made-up source. The worst possible failure (see
    watch-outs).
  - "I don't know" on something that is clearly in the material. They'll
    blame the upload: "did it even read the folder?"
  - No way to tell knowledge from guessing.
- **Product insight:** The quiz happens in two places: in the Sketcher
  chat before Keep (P2 voice cards) and in agent chat after. The capability
  map should *predict* the quiz result. If the map says "sharp on the
  6 Human Needs" and the quiz fails, trust in the map drops too. Map, score
  and answers have to agree.

### D4. Check where an answer came from (#4)

- **The moment:** Mid-chat, right after an answer that surprises them,
  good or bad.
- **Trigger:** "Did he really say that?" or "I want to reread that part."
- **Thoughts:** "Which book is this from?" "Show me the actual words."
  "Is this his idea or the AI's?"
- **Emotions:** Curious, slightly on guard. Reassured when the source is
  real and fits. Betrayed when the source doesn't say what the answer says.
- **Expectations:** The source is one click from the answer: the file
  name they recognise, and the passage. Not a page of chunk numbers. When
  an answer is from the persona (voice, opinion) and not from a source,
  it's clear there's no source, and that's fine.
- **Success:** "One click, and there's the passage from Day 3 of the
  course."
- **Friction and fears:**
  - Sources named by an internal file name, not the one they know
    (NotebookLM users complain about this with merged sources).
  - A citation that points at text that doesn't contain the claim.
  - Sources on *every* sentence: noise.
- **Product insight:** Show sources only where the answer leans on the
  material, using the names the user gave the files. In the mock, sources
  need real-looking passages, or the prototype will feel hollow at exactly
  the point users test hardest.

### D5. Pick up an earlier conversation (#5)

- **The moment:** A day or a week later, often on the same topic: "the
  job thing."
- **Trigger:** The situation moved on. "I did what he said, now what?"
- **Thoughts:** "Where was that chat?" "I don't want to explain it again."
  "Does he remember?"
- **Emotions:** Continuity feels like a relationship. Starting over feels
  like a stranger.
- **Expectations:** The last chat with this agent is easy to reach from
  the agent. Old chats have names that say what they were about. Search
  finds a word they remember. Picking one up continues it; the agent
  remembers.
- **Success:** "I opened 'the job offer' and he picked up right where we
  left off."
- **Friction and fears:**
  - Titles like "New chat" everywhere.
  - Search that misses an exact word (the top ChatGPT history complaint).
  - Chats from different agents mixed into one list with no faces.
  - A chat that loads but the agent has "forgotten" it.
- **Product insight:** History belongs to each agent first (the feature
  says so). Titles must describe the topic. Continuing uses the same
  session, as P2 already does with `--resume`.

### D6. Read the capability map after adding material (#6, with #11 and #12)

- **The moment:** Right after material is in, or when they come back to a
  finished learning run. Also at Keep, as the short card.
- **Trigger:** "So what did it get from all that?"
- **Thoughts:** "Good at the 6 Human Needs, yes. Medium on relationships,
  makes sense, that's only one seminar. Not trained for… finances? He has a
  whole book on money! Oh, I didn't add it." Or: "This is generic, it
  says 'motivation'. Every coach does motivation."
- **Emotions:** Interest, then either recognition ("that's right") or a
  useful little shock ("it's missing the money book"). Annoyance at
  generic lines.
- **Expectations:**
  - Specific and niche, in the person's own terms: model names, course
    names, topics only fans know.
  - Each line traceable: *why* is it good at this (which sources)?
  - Gaps that point to an action they can take ("add material on X").
  - Talking it over in the creator chat (#12): "what exactly does it know
    about relationships?"
  - Only they see it. The agent never "knows" its own map.
- **Success:** "It told me something true I hadn't noticed, and I knew
  what to add."
- **Friction and fears:**
  - Generic categories. They read as fake.
  - A map that contradicts what the agent then does (D3).
  - Being made to read a long report before they can continue.
  - For self-cloners: the map reads as a judgment of *them* ("medium at
    parenting").
- **Product insight:** The map is the user's main tool for deciding
  *what to add next* and *which agent to ask*. It shows up three times:
  after material (full), at Keep (short card), in the library (a hint for
  choosing, D2). It lives with the insight (P10) as one place, and stays
  out of every agent file, prompt and export (the P2 guard holds; P6 must
  keep it out of the zip too, see open question 4).

### D7. Spot a wrong note in chat and fix the agent (#7)

- **The moment:** In agent chat, a week after Keep. The agent says "Great
  question!" or gives advice the real person would never give.
- **Trigger:** A wrong line that breaks the likeness.
- **Thoughts:** "He'd never say that." "How do I tell it?" "If I say it
  here, will it remember, or is this just this chat?"
- **Emotions:** A jolt of "that's not him", then mild frustration. Relief
  if the fix is quick and sticks.
- **Expectations:** They can say what's wrong right where they saw it.
  The fix changes the agent itself, for every future chat, and they can see
  it did. The chat they were in carries on.
- **Success:** "I said 'he wouldn't say that', the agent changed, and the
  next answer was him again."
- **Friction and fears:**
  - Not knowing whether a correction in chat changes the agent or only
    this conversation. This is the core confusion of the two-pillar app.
  - Having to leave the chat, find the creator, and explain the context
    again.
  - A fix in chat that quietly overwrites a hand-written persona line (the
    P2 "hand edits win" rule must hold here too).
- **Product insight:** There must be one clear, explicit way to turn a
  wrong note into a change to the agent, with the line that was wrong
  carried along. Telling the agent "be blunter" inside a normal chat should
  *not* silently change the agent (people also roleplay and test). The
  change goes through the Sketcher and shows as fresh lines in the Sketch,
  as in P2.

### D8. Bring a whole folder, then walk away while it learns (#8 + #9, with #15, #16)

- **The moment:** A weekend afternoon or a free evening. They've
  collected the material over time: a course download, PDFs of the books,
  podcast files. The folder already exists on disk.
- **Trigger:** "I finally have everything. Let's make the real one."
- **Thoughts:**
  - On dropping: "Will it take video?" "That's 312 files, will it choke?"
    "I don't want the bonus junk in there."
  - Seeing what's inside: "Yes, 3 books, 41 videos, 120 transcripts. The
    'Bonus' folder is spam, skip it."
  - On the split: "Books for knowledge, the live Q&A for how he talks.
    Fine." Or "No, the persona should come from the seminars, not the
    books, books are too polished."
  - On the wait: "How long? Can I close it? Will it still be going?"
- **Emotions:** Before: anticipation, the big moment. During the inventory:
  in control or overwhelmed. During the wait: impatient, then forgetting.
  On return: curious, a little nervous ("did it work?").
- **Expectations:**
  - Folder, files or a path all work, and video and audio are accepted.
  - A quick, plain inventory first, in their own folder names: what kinds,
    how many, what it can't read, what it will skip.
  - A proposed split ("books and transcripts → knowledge, Q&A recordings →
    persona") they can accept or correct in one sentence. Plain words, not
    settings.
  - An honest time estimate, and the freedom to close the app or do
    something else, including working on the Sketch from one line while it
    learns.
  - Something to look at early: a first rough map or sketch from a sample,
    not a blank wait.
  - A clear "done" when they come back, and what came out of it.
- **Success:** "I dropped the folder, said 'skip the bonus stuff', went
  for a walk, and came back to a Tony who knows the whole course."
- **Friction and fears:**
  - The app freezes on a big folder.
  - Files silently skipped (custom-GPT users: "it never read my files").
  - A form of rules before anything happens.
  - A progress bar with no time, or one that restarts.
  - Closing the app kills hours of work.
  - Private files (client calls) leaving the machine.
- **Product insight:** This is P2's "show something at once" rule at a
  bigger scale. The wait is the new emotional center of making: the
  inventory and proposed split come in seconds, the learning runs in the
  background and survives closing, and the user gets something early and a
  clear "done". Rules are a correction of a proposal, said in the creator
  chat, not a form. Every skipped file is listed with a reason.

## 6. The journeys (UJ1–UJ12)

Each journey lists its steps. For each step: what the user does, what they
think or feel, the feature, and **what the mock must contain** for the step
to feel real in the prototype. "Real" means already built (P1/P2).
Arrows at the end show where people go next.

The big loop, as people live it:

```
first run ─► MAKE ─────────► KNOW ─────────► TALK ◄──── daily return
             (one line or     (map, insight,   (ask, sources,
              a folder)        scores)          history)
               ▲                 │                │
               └──── add material┘◄──── wrong note┘
                         (fix loop)

   on the side: IDENTITY (icon, photo, DNA) · SHARE (export, import)
```

### UJ1. First run (P1, P2) · the clone-maker, first evening

1. **Opens the .app for the first time.** "Will this need setup?" Hopeful.
   *Real:* the CLI check (`/api/health`).
2. **CLI found:** lands straight on making the first agent, no tour. *Real:*
   P2 empty state. **CLI missing:** a plain message and what to do, nothing
   lost (#27). *Mock:* a toggle to show the missing-CLI state.
3. **Types one line or brings a folder.** Splits into UJ3 or UJ2. The first
   screen must make both ways visible, because the clone-maker *has* a
   folder and the role-builder doesn't.
→ UJ2 or UJ3.

### UJ2. Make an agent from material (P3, P5, P4, P12, P7, P2) · the clone-maker · deep dive D8

1. **Brings a folder, files or a path** (video and audio included).
   "Will it choke?" *Mock:* a folder of ~300 files: 3 book PDFs, 41 videos,
   120 transcripts, an MD notes folder, a "Bonus" folder of spam, 2
   unreadable files.
2. **Sees the inventory** in their own folder names, with what will be
   skipped and why. Feels in control. *Mock:* the inventory with counts,
   sizes and skip reasons.
3. **Sees the proposed split** (what goes to knowledge, what to the
   persona) and corrects it in one sentence in the Sketcher chat ("skip
   Bonus, persona from the live Q&A only"). *Real:* the Sketcher chat.
   *Mock:* the split before and after the correction, and the Sketcher's
   reply restating the rules.
4. **Learning starts; sees an honest estimate.** Leaves, or keeps
   chatting. "Can I close it?" *Mock:* a learning run with stages (reading,
   transcribing video, learning), an estimate ("about 40 min"), and a
   way to skip time in the prototype.
5. **Gets something early:** a first persona sketch from a sample (P5) and
   a rough first map. *Mock:* an early sketch and a rough map marked as
   early.
6. **Comes back to "done".** Sees what came out: sources learned, skipped,
   failed. *Mock:* a finished run summary, including one failed video.
7. **Reads the full capability map (D6)** and asks the Sketcher about a
   gap. *Mock:* a specific, niche map for the demo coach (good at / medium
   at / not trained for, each line with its sources), and a Sketcher
   answer about one gap.
8. **Shapes the persona in the chat** as in P2: nudges, hand edits, a voice
   card that now quotes the material. *Real:* P2. *Mock:* generated
   name/persona/instructions from the persona sources.
9. **Gets an icon** (P7), accepts or redoes it. *Mock:* 3 icon options.
10. **Keeps it** and sees the short capability card (#11). *Real:* Keep.
    *Mock:* the card.
→ UJ5 (talks to it right away) or UJ4.

### UJ3. Make from one line, add material later (P2, then P3) · the role-builder

1. **Types one line.** *Real:* P2, all of it (sketch, nudges, voice card,
   Keep).
2. **Keeps it.** The capability card says honestly that it knows only what
   the Sketch says, no material yet. *Mock:* the "no material" card.
3. **Later, adds a few files** to the same agent. Goes through UJ2 steps
   1–7 at small scale. *Mock:* a 4-file batch and the map before/after.
→ UJ5.

### UJ4. Check how good it is (P10, P12) · the clone-maker after learning

1. **Opens the agent's insight.** "So how good is it?" *Mock:* one place
   with: what it learned from (the sources, by the user's names), a persona
   rating, a material quality score, learning progress, and the map.
2. **Reads the persona rating** and wants to know *why* that number.
   *Mock:* the rating with 2–3 plain reasons and an example line.
3. **Reads the material quality score**: the AI sampled a few files and
   scored how well they're structured. *Mock:* a score per sampled file
   with one-line reasons ("long transcript, no headings, hard to split").
4. **Sees a gap and decides what to add.** *Mock:* a gap that points to a
   source they don't have yet.
→ UJ8 (adds material) or UJ5.

### UJ5. Ask an agent a real question (P8, P4) · the daily asker · D1, D2, D4

1. **Opens the app; sees the library.** Picks by face (D2). *Mock:* the
   demo agent set (§7), with faces, sketch vs. kept vs. learning states.
2. **Asks.** Words start in seconds, in the voice. *Mock:* streamed
   answers for 3–4 likely questions per demo agent. (Optional: P8 could be
   real with the persona as system prompt and no RAG, but the brief says
   mock, so it's mock.)
3. **Checks a source** on one claim. *Mock:* answers with 1–3 sources each,
   using the user's file names and a real-looking passage. At least one
   answer with no source (pure opinion), shown as such.
4. **Asks something outside its training.** It says so plainly. *Mock:* an
   honest "not trained for this" answer that matches the map.
→ leaves, or UJ7, or later UJ6.

### UJ6. Pick up an earlier conversation (P9) · the daily asker · D5

1. **Opens an agent and sees its past chats**, newest first, with topic
   titles. *Mock:* 8–15 chats per main demo agent with real-sounding
   titles and dates across weeks.
2. **Searches a remembered word.** *Mock:* search over the mock chats.
3. **Continues a chat.** The agent remembers. *Mock:* a continued
   conversation that refers back.
→ UJ5.

### UJ7. Fix a wrong note from the chat (P8 → P2) · the clone-maker · D7

1. **Sees a wrong line in an agent answer.** "He'd never say that."
   *Mock:* one planted wrong answer ("Great question! 😊").
2. **Says it's wrong, right there,** and the wrong line is carried along.
3. **The Sketcher proposes a change; the Sketch shows fresh lines.**
   *Real:* the Sketcher chat and Sketch. *Mock:* the carried-over line.
4. **Back in the chat, the next answer sounds right.** *Mock:* the
   corrected answer.
→ UJ5.

### UJ8. Add more material later (P3, P10, P12) · the clone-maker

1. **Adds a new book** to an existing agent, from the gap in UJ4.
2. **Short learning run.** *Mock:* a 1-file run.
3. **Sees what changed:** the map line moves from "not trained for" to
   "good at", the score moves. *Mock:* the map and scores before and after.
4. **Quizzes it on the new book** (D3). *Mock:* an answer with a source in
   the new book.
5. **Removes a source** that made answers worse (#23), and trusts it's
   gone. *Mock:* a removed source and the map after.
→ UJ5.

### UJ9. Make it a character (P7, P11) · anyone, after Keep

1. **Sees the AI icon** from UJ2 and wants a real photo instead (#21).
   *Mock:* an uploaded photo replaces the icon everywhere.
2. **Looks at the DNA / soul visual** built from persona, knowledge and
   traits (#22). *Mock:* a placeholder visual made from the mock traits,
   marked as a stand-in until P11's look is chosen (Elon's research first).
3. **Adjusts a trait** and sees the character change. *Mock:* 3–5 traits.
→ UJ5 or UJ10.

### UJ10. Export the agent to another app (P6) · the owner as integrator

1. **Exports an agent** as one file. "Is everything in it?" *Mock:* a file
   summary: instructions, photo/icon, knowledge, name, metadata, sizes.
   *Not* the capability map (watch-out).
2. **Opens it in another app** (outside this prototype). Expects the same
   agent, same voice, same knowledge.
→ done.

### UJ11. Import an agent file (P6)

1. **Drops a file in.** *Mock:* one valid file and one broken or old-format
   file.
2. **Sees what's in it before it's added,** and a clear choice when an
   agent with that name already exists.
→ UJ5 or UJ4.

### UJ12. Manage the library (home, P9) · month two

1. **Has 6+ agents**, some sketches, one still learning. *Mock:* the demo
   set in §7.
2. **Renames, deletes an agent or a chat** (#24). Deleting asks once and
   says what goes (chats, knowledge). *Mock:* any agent.
3. **Starts a new one.** → UJ2 or UJ3.

## 7. The demo agent set (what the mock must cover)

Real users will be in different states at once. The prototype needs one
agent per state, or the journeys can't be walked:

| Demo agent | State | Journeys |
|---|---|---|
| A tough-love coach (big course folder) | Kept, rich material, long history, photo | UJ4, UJ5, UJ6, UJ7, UJ8, UJ10 |
| A stoic mentor (made from one line) | Kept, no material, AI icon | UJ3, UJ5 |
| A newsletter editor (role, 4 files) | Kept, small material, low quality score | UJ4, UJ8 |
| A new clone in progress | Still learning (stage 2 of 3), early sketch | UJ2 steps 4–6 |
| "Untitled sketch" | Sketch, never kept | UJ12 |
| Imported agent | From a file, never opened | UJ11 |

Use invented people or roles, not real living people, for any mock with
words put in their mouth (watch-out list). The repo's real Tony Robbins
instance stays a reference, not mock content.

## 8. Key insights

1. **Two jobs, two rhythms.** Make is rare and deep; Talk is daily and
   light. After the first Keep, the shortest path in the app must be to
   *talking*. The first run must be all about making.
2. **"How good is it?" is one question.** Learning insight, quality score
   and capability map answer it together. Users won't think of them as
   three features.
3. **Evidence is the product for clone-makers.** They will quiz and check
   sources (D3, D4). Map, scores and answers must agree, or all three lose
   trust together.
4. **The wait is the new emotional center of making.** Big folders take
   long. Show the inventory and proposed split in seconds, let learning run
   in the background and survive closing, give something early, and mark
   "done" clearly.
5. **Rules are corrections, not settings.** Propose a split; let people
   fix it in one sentence in the chat they already know (P2's "show first,
   ask later" at a bigger scale).
6. **The fix loop joins the two pillars.** A wrong note in Talk must turn
   into a change in Make in one explicit step, with the line carried along.
   Never silently.
7. **Faces are for recognition.** P7/P11 matter most in the library and
   the chat header, where people pick and know who's talking. The DNA
   visual is a delight moment, not a daily tool.
8. **The map helps the user choose, never the agent speak.** It's for
   deciding what to add and whom to ask. It stays out of the agent's
   context and out of the export.
9. **The prototype must be believable where users test hardest:** sources
   with real-looking passages, a niche map, and honest "not trained for"
   answers. Hollow mocks there will give the team false feedback.

## 9. Watch-out list

Low score or rare, but they could break trust or cause harm.

- **A made-up quote or source.** The single worst failure for this app.
  The real RAG (P4) must never show a source that doesn't contain the
  claim. In the mock, never fake a citation that the mock source doesn't
  contain either, or the prototype teaches the wrong expectation.
- **The map leaking into the agent or the export.** P2 guards the draft.
  P5 (generation), P8 (chat context) and P6 (the zip) need the same guard.
- **The agent "knowing" its own map.** If asked "what are you bad at?",
  it answers from its sources and persona, not from the user-only map.
- **Silently skipped files.** Every skipped or failed file is listed with
  a reason.
- **Private material.** Client calls, journals, other people's voices in
  recordings. Everything stays local. Make that visible where people drop
  files, not only in a policy.
- **Scores that feel like judgment.** A "persona 62%" for a self-cloner
  reads as "you're 62% captured", and a low material score insults their
  own notes. The P2 team cut fake progress numbers; P10 asks for a rating.
  The rating needs reasons, or it's a fake number. (Open question 2.)
- **Removing a source that isn't really removed.** If a removed book still
  shows up in answers, trust in the whole knowledge base breaks.
- **Deleting an agent.** It takes the chats and the knowledge with it.
  Say so once, clearly.
- **Closing the app during learning.** Hours of work lost would be
  unforgivable. Learning must resume.
- **Real-person clones, exported.** P6 makes clones portable. A clone of a
  living person that claims to *be* them, outside this app, is a product
  and ethics question for the orchestrator (carried over from P2,
  bigger now).
- **A behavior change after an update.** After adding material or fixing a
  note, the agent they trust may sound different. "It's not him anymore"
  needs a way back. (Open question 3.)
- **Mocks mistaken for real.** In the prototype, mock answers could be
  read as real AI output during testing. The team should be able to tell
  them apart (not necessarily the screen: that's a design call).

## 10. Open questions

1. **Correction in chat: agent-wide or this chat only?** (D7) My read:
   a normal chat message never changes the agent; one explicit step does.
   *Needs a decision (orchestrator/Jony).*
2. **What does the persona rating actually measure** (P10), and how is it
   shown so it isn't a fake number? Delphi uses a "readiness" score. My
   read: a rating with reasons and examples, never alone.
3. **Versions.** Do people need "go back to how he was last week" once
   material and fixes pile up? P2 decided no undo button; the stakes are
   higher after months of chats. Not decided.
4. **Does the capability map travel in the agent file (P6)?** The feature
   says it's user-only. If the same user imports it into their own other
   app, would they want it there? Safe default: leave it out.
5. **Several agents in one chat** (masters-wheel has it). No feature yet.
   People will ask. Propose as a feature, or say no on purpose.
6. **Where does the user land on opening the app in month two:** the
   library, or the last agent's chat? P2 opens the last agent (Jony's J4).
   With Talk as the main job, the last *chat* might be right. Check in the
   Phase 7 walkthrough.
7. **Real photos of real people** (P11): fine for a private app, risky
   inside an exported file. Tied to the real-person watch-out.

## Sources

- P2 research and live findings: `updates/2026-11-24 AGENT-CREATOR - OPEN/research-columbo.md`, `wiki.md`, `magic-merlin.md`, `design-jony.md`.
- Feature notes P3–P12 (the studio's Features list).
- masters-wheel (`~/dev/masters-wheel/FEATURES.md`): agents with knowledge
  files, local RAG, multi-agent chat, already in use by the owner.
- Custom-GPT knowledge complaints: files ignored, made-up answers instead
  of the files ([1](https://community.openai.com/t/custom-gpt-and-projects-can-no-longer-access-knowledge-just-makes-up-stuff-instead/1273600),
  [2](https://community.openai.com/t/uploaded-files-work-knowledge-files-dont/607194),
  [3](https://community.openai.com/t/custom-gpts-knowledge-files-dont-get-persisted/546431)).
- NotebookLM: source limits, missing citations, merged-source names
  ([FAQ](https://support.google.com/notebooklm/answer/16269187),
  [limits guide](https://www.atlasworkspace.ai/blog/notebooklm-limitations)).
- Delphi (AI clones from uploaded content, onboarding questions, a
  readiness score, consent for clones of others)
  ([help](https://intercom.help/delphi-ai/en/articles/11512012-faqs-what-to-know-before-you-begin),
  [VentureBeat](https://venturebeat.com/ai/you-can-now-make-an-ai-clone-of-yourself-or-anyone-else-living-or-dead-with-delphi)).
- ChatGPT history: can't find old chats, search misses exact titles
  ([1](https://community.openai.com/t/finding-old-chats-is-a-nightmare/1387983),
  [2](https://www.tomsguide.com/ai/i-thought-my-chatgpt-chats-were-gone-heres-how-i-found-them-instantly)).
