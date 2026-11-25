# Columbo report: the moments that matter (MAGIC-PASS)

*Columbo, UX Detective. 2026-11-25. For Merlin (magic and words), Jony
(build) and Eraser (cut review). Builds on the FULL-UX journey map
(`updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`, cited as UJ#
and FU-D#) and the Sketch report
(`updates/2026-11-25 SKETCH-REWORK - OPEN/columbo-report.md`, cited as
SK-D# and SK-W#). I don't repeat them. This report only asks: **at which
moments does a person's feeling peak, and should magic be there or stay
away?***

Marks used: **[A#]** = my assumption, please check. **[code]** = read in
the code today, not clicked through (there is no browser here, and nobody
has clicked through the Sketch rework or the DNA drop yet).

## 1. Summary

The app has two jobs (FU §1): **Make** (rare, deep, emotional) and
**Talk** (often, light, practical). Magic belongs to Make. In Talk it
should almost disappear.

The strongest feeling in the whole app is the **creation moment**: the
stretch from "I typed one line" to "there is someone here, with a name and
a face, and they just spoke to me." People don't hire Agent Creator to
fill in a form. They hire it to *meet someone*. That stretch has five
beats, and each has its own feeling:

1. **First words out** (type the first line): a small risk. "Will it get
   what I mean?"
2. **The first sketch lands**: relief and surprise. "Oh, it gets it."
3. **It gets a name** (and later a face): the jump from *a text* to *a
   someone*. This is the real birth, more than Keep.
4. **Keep**: ownership. "It's mine now."
5. **It speaks for the first time** (First words in Talk): recognition.
   "That's them."

Reading the code, I found that **the current app hides or skips three of
those five beats** [code]:

- The first sketch writes the Instructions, but they live behind the
  **DNA** switch. The Sketch opens on **Profile**, so the person sees a
  name and a letter, and the main text is written where they aren't
  looking. The glow plays on a hidden field. (O1)
- **Real agents never get a face.** The face picker only opens for demo
  agents. A real agent stays a letter forever. (O2)
- **Real agents' first Talk shows "(Demo) First words would be here."**
  So the creation arc ends on a placeholder for exactly the people who
  made a real agent. (O3)
- After Keep, the "born" effect plays and the Keep card appears, but the
  way to Talk is only the mode switch in the top bar. There's no bridge
  from "born" to "say hello". (O4)

So the biggest win of this magic pass isn't *adding* effects (magic.css
already has 20 animations). It's **putting the magic where the person is
looking, at the beats that matter, and keeping it away from daily Talk.**

## 2. Scope

**In:** every screen as it is today on `main` after the Sketch rework and
the file drop into DNA:
- Home (agent cards, sketch rows, "+ New agent · one line, or drop a
  folder", marks like Ready and Studying).
- The creator chat (empty state with three chips and the references door,
  the Sketcher streaming, change lines, voice cards, the offline banner).
- The Sketch: Profile (face, name, description, skills), DNA
  (Instructions, Made from, Files, Looks up, Strong and thin), Keep and
  the Keep card.
- The file drop (the overlay, the toast "N files added to DNA", the DNA
  Files layer).
- Talk (First words, answers, Where from, Not [Name] and its fix panel,
  past talks and search).
- Palette, face picker, export and import, delete, errors and empty
  states, only where they touch a moment below.

**Out (and why):**
- **How the motion looks** (timing, easing, words). That is Merlin's job.
  I say *where* and *why*, not *how*.
- **The real RAG, real icon generation, real First words for real
  agents.** These need server or engine work. I describe what people
  expect, and mark where today's app can't meet it (O2, O3), so the team
  can decide.
- **Moments already covered in depth:** asking a real question (FU-D1),
  sources (FU-D4), past talks (FU-D5), the capability map (FU-D6), fixing
  Instructions by hand (SK-D1), Profile glance (SK-D2), DNA "why did it
  say that" (SK-D3). I only add their magic angle in the table and the
  ranking.
- **Phone.** It's a Mac app.

**Assumptions:**
- **[A1]** Frequency here means **how often in the first month**, not
  month two as in FU (A5). A magic pass is judged by first impressions,
  and in month one people make more agents and hit more wrong notes. For
  Talk rows, month one and month two are about the same.
- **[A2]** In the first month a typical user makes **3 to 6 agents**
  (FU A4 says 3 to 10 agents by month two). So a "once per agent" step
  happens 3 to 6 times: frequency 5.
- **[A3]** Inside one making session, people nudge the sketch **5 to 15
  times** ("warmer", "shorter", "more blunt"). This is from the P2
  research and what GPT-builder users report; I haven't measured it here.
- **[A4]** Most real users make agents from **one line first** and add
  files later (FU UJ3). The full folder path (UJ2) is for clone-makers.
- **[A5]** The people are those in FU §3: the clone-maker, the
  self-cloner, the role-builder, the daily asker. I added one more for
  this pass: **the first-evening explorer**. They installed the app
  tonight, are curious, and will decide in about ten minutes whether it
  is "magic" or "just another chatbot wrapper".

## 3. What the app does today at each beat [code]

These observations come from reading `src/server/public/` and drive the
scores below.

- **O1 · The Instructions are written behind a closed door.** When an
  agent loads, the Sketch shows **Profile** (`B.afterLoad` → `C.showSketch`).
  The first reply fills Name and Instructions and plays `filling` and
  `updated` on both. But Instructions sit inside `#dna`, which is hidden.
  The change line "Sketch: name and instructions updated ↗" opens the
  *first* changed field, which is Name, in Profile. So unless the person
  clicks DNA, they never see the text that *is* the agent being written.
  The description placeholder in Profile shows the first sentence of the
  Instructions, and that's the only trace.
- **O2 · No face for real agents.** `renderFaceSlot` only makes the face
  clickable for demo agents (`a && named`). Real agents show a letter
  (`face-letter`) everywhere: Home, top bar, Profile. The `faceNew` tag
  and the three icon options only exist in the demo flow (`B.finish`).
- **O3 · Real First words are a placeholder.** `D.firstWords` for a real
  agent pushes "(Demo) First words would be here." The `fill-in` effect
  (outline face → filled) only runs for demo agents.
- **O4 · Keep has no next step.** Keep → `agent-born` (1 s on the Sketch
  pane) → Keep card ("Yours. You can keep changing it."). The "Talk to
  [Name]" button is gone (SKETCH-REWORK). The Talk/Sketcher switch
  appears in the top bar, but nothing points to it. Rule: one way to do
  each thing, so the answer is *not* a second Talk button (see M5).
- **O5 · A drop on Home starts a nameless agent.** Dropping files on Home
  (or on a demo agent) makes a new agent, puts the files into DNA, shows
  a toast and the hint "Tell the Sketcher what each is for…". The
  creation then starts from files, with no first line and empty
  Instructions ("Appears after your first message").
- **O6 · Lots of magic already exists.** `magic.css` has about 20
  effects: caret, dots, fresh glow, Keep shimmer and breathe, born, card
  settle, first voice card, map arrive and redraw, palette bloom, face
  fill and cross-fade, DNA reveal, thread, quality wash, chip settle.
  All of them sit behind `prefers-reduced-motion`. The risk now is too
  much, not too little.
- **O7 · "Sketching…" takes over the title.** While the Sketcher replies,
  the Sketch title says "Sketching…" and every field is read-only. That
  is the one "the agent is being made" signal during a turn.

## 4. Behavior table

L = likelihood (how many people do it at all). F = frequency in the first
month [A1]. Both 1–10, sorted by L + F. When I was unsure, I took the
lower score. "Beat" marks the five creation beats from §1.

| # | Behavior | Screen | L | F | Reason |
|---|---|---|---|---|---|
| 1 | **Ask a question and wait for the answer to start** | Talk | 9 | 9 | The daily job (FU-D1). Every Talk session has it, often several times. The wait before the first word is the most-felt few seconds in the app. |
| 2 | **Open the app and pick someone by face on Home** | Home | 9 | 8 | Every session starts here once there are 2+ agents (FU-D2). With letter faces only for real agents (O2), recognition is weaker than it should be. |
| 3 | **Nudge the sketch and watch it change** ("warmer", "shorter") | Creator chat + Sketch | 8 | 8 | 5 to 15 nudges per making session [A3], 3 to 6 sessions [A2]. This is the heartbeat of making, and it repeats a lot. That's why its magic has to stay light. |
| 4 | **Pick up the last talk from the Home card** ("Last: …") | Home → Talk | 8 | 7 | One click back into an ongoing topic (FU-D5). Common for coaching-style use. |
| 5 | **Say "Not [Name]" and see the fix land** | Talk → fix panel | 8 | 7 | In month one, wrong notes come often (FU-D7). Lower later. The moment the fixed answer sounds right again is an emotional high point that nobody marks today. |
| 6 | **Check Where from on an answer** | Talk | 8 | 6 | Clone-makers check (FU-D4). I lowered F from FU's 7: role-builders without files never see it. No magic here, ever (world rule). |
| 7 | **Type the first line, or pick a chip** (beat 1) | Creator, empty state | 10 | 5 | Every agent starts here: it's the only door besides a drop. Once per agent [A2]. The chips make it easy; the first-evening explorer often takes a chip "just to see". |
| 8 | **See the first sketch land** (beat 2) | Creator chat + Sketch | 10 | 5 | Follows #7 every time. Today the main text lands in the hidden DNA (O1), so what people *see* is a name and a letter. |
| 9 | **Meet the name** (beat 3: the Sketcher names it, or they rename it) | Profile | 9 | 5 | Every agent gets a name in the first reply. About half rename right away (my estimate, unmeasured; GPT-builder users ask to choose names themselves, see sources). It's the first time "it" becomes "her" or "him". |
| 10 | **Press Keep** (beat 4) | Sketch | 9 | 5 | Once per agent. Most press it within the first session. A few keep sketching for days first. |
| 11 | **Hear it speak for the first time** (beat 5: First words) | Talk | 8 | 5 | Once per agent, right after Keep, *if* they find Talk (O4). For real agents today it's a placeholder (O3). L 8 not 9: some close the app after Keep. |
| 12 | **Glance at Profile before choosing who to ask** | Profile | 8 | 6 | SK-D2 (8/8 in month two). Lower in month one: fewer agents to choose between. |
| 13 | **Drop files or a folder** (onto Home, the chat or DNA) | Drop overlay → DNA Files | 8 | 6 | Clone-makers always, others now and then (SK #7, FU #8). Includes top-ups after a "thin" line. |
| 14 | **Get or choose a face** (beat 3, part two) | Profile → face picker | 8 | 5 | People expect a face as part of "a finished agent" (FU #18, #21). Real agents can't today (O2), so this is an expectation the app doesn't meet yet. |
| 15 | **Come back to "Ready" after a long study** | Home | 7 | 5 | Every big folder (FU-D8). The study runs for minutes to hours, so the return is a real moment: "did it work?" |
| 16 | **Tell the Sketcher what the dropped files are for** | Creator chat | 7 | 5 | The new drop flow asks for it in a hint (O5). Many will skip it at first and just type "use them". Lowered L: people don't read hints. |
| 17 | **Open DNA for the first time and look around** | DNA | 7 | 4 | Curiosity: "what is it made of?" The reveal plays once per agent (`revealed`). Later visits are task-driven (SK-D3). |
| 18 | **Edit the Instructions by hand during creation** | DNA · Instructions | 6 | 5 | Power users and prompt writers do it every time. Others never open DNA while sketching (O1). |
| 19 | **Look for Talk after Keep** ("now what?") | Sketch → top bar | 7 | 4 | Once per agent, for the first one or two agents. After that they know the switch. A short moment, but it decides whether beat 5 happens. |
| 20 | **Start from a drop, with no first line** | Home → new agent | 6 | 4 | Clone-makers with a folder ready (O5). Lowered: the empty state leads with "one line", so most type first. |
| 21 | **Move a skill chip** | Profile | 6 | 4 | SK #6. After each study. The chip-settle effect plays each time. |
| 22 | **Hit an error mid-creation** (Claude unreachable, Keep fails) | Banner, Keep button | 5 | 3 | Rare, but it lands in the most emotional stretch. "Your text stays here." must stay calm and plain. |
| 23 | **Rename the agent after Keep** | Profile | 6 | 3 | Rare after the first day. Names stick fast once they've talked. |
| 24 | **Make a second agent right after the first** | Home → + New agent | 6 | 3 | The first-evening explorer, delighted: "let me make another one". The creation magic plays a second time, and it should still feel fresh, not like a replay. |
| 25 | **Show the creation to someone else** (screen share, a friend at the desk) | Any | 3 | 2 | A brag moment. Low score, but it's where magic gets judged by an outsider. |
| 26 | **Turn on reduced motion and still want the moment** | All | 3 | 3 | A small group, but every effect must have a still form that still says "something happened". |

**Merged:** "watch the Sketcher stream" into #3 and #8 (same wait).
"Choose one of three icons" and "upload a photo" into #14 (same job: give
it a face). "See the Keep card" into #10. "Click the change line" into #3
(it's how people follow a nudge).

## 5. Deep dives

The rule says: behaviors with 7 or more on both scores. Those are #1–#5.
#1, #2 and #4 are covered in depth in FU-D1, FU-D2 and FU-D5, so here I
only add the **magic angle** (short dives M1 and M2). The brief asks for
the creation moment in depth, so I added **M4 and M5** on beats 1–5. By
the rule they're near-misses (L 8–10, F 5), included on purpose because
they carry the strongest feelings in the app. I also added **M7** (the
file drop), because it's new and nobody has researched it as a moment
yet (F 6, a near-miss too).

### M1. Ask and wait for the answer to start (#1, magic angle only)

- **The moment:** Morning at the desk or late evening on the sofa (FU-D1).
  They just typed a real question and pressed Enter.
- **Trigger:** A real problem, right now.
- **Thoughts:** "Come on." "Please don't give me a lecture." Then, if the
  first words are right: "Yes, that's him."
- **Feelings:** Before: stuck, a little heavy. During the wait: impatient,
  every 100 ms counts. After: lighter, or let down.
- **Expectations:** Text starts within a few seconds. Nothing on screen
  pretends to be thinking. A quiet sign that it's working (the caret, the
  dots) is enough. They don't want to *watch* anything.
- **Success:** "I forgot it was an app."
- **Friction and fears:** Any motion that delays or dresses up the answer.
  A greeting before the answer. A celebratory effect on an answer to a
  painful question (emotional mismatch: someone asking about grief doesn't
  want sparkle).
- **Magic angle:** This is where magic gets in the way most. The world
  rule ("Daily Talk is never slowed") is right. The only magic here is
  **speed and voice**. The one exception is beat 5 (M5): the very first
  words an agent ever says.

### M2. Pick someone on Home (#2, with #4 and #15, magic angle only)

- **The moment:** Right after opening the app. A problem in their head,
  not yet a name (FU-D2). Or a return after a long study.
- **Trigger:** Opening the app.
- **Thoughts:** "Who'd know?" … "There he is." Or after a study: "Is she
  ready?"
- **Feelings:** Practical and quick. A small warmth at familiar faces. On
  a "Ready" return: a burst of curiosity.
- **Expectations:** Faces they can tell apart at a glance. The most
  recent first. A clear difference between "ready to talk", "still
  studying" and "just a sketch". One click to talk.
- **Success:** "I saw her face and I was already talking."
- **Friction and fears:** Five letter faces in five colors (real agents,
  O2). A Home that animates every time it opens, which feels slow by the
  third day. A "Ready" mark that looks like every other mark.
- **Magic angle:** Home should be still by default. The only Home moment
  worth magic is **the first time a card shows up as Ready** after a
  long study (#15): a once-only "she's back", and then quiet. A face
  matters more here than any motion.

### M3. Nudge the sketch and watch it change (#3)

- **The moment:** Same session as the first sketch, 2 to 20 minutes in.
  Laptop, often evening, focused. They just read a voice card or the
  draft and something is off.
- **Trigger:** "Close, but she'd be warmer." "Shorter." "Less salesy."
- **Thoughts:** "Did it actually change, or just say it did?" "Where did
  it change?" "Is it still the same person, or did it start over?"
  "Don't touch the line I wrote."
- **Feelings:** Before: a small itch, half sure what they want. During:
  hopeful, watching the Sketch. After: satisfaction when the change is
  visible and small, irritation when the whole text was rewritten.
- **Expectations:** The reply in a few seconds. **The changed part
  shows itself** right where they look: the line or field that changed
  lights up briefly, the rest stays still. A voice card that sounds
  different, so they *hear* the change. Their hand edits are untouched
  (rule: hand edits win). Repeating it ten times shouldn't get tiring.
- **Success:** "I said 'warmer', and I could see exactly which line got
  warmer, and the sample sounded like her."
- **Friction and fears:**
  - **The change happens in the hidden DNA (O1).** They're on Profile,
    the name didn't change, so nothing visible moves. "Did it do
    anything?" The change line opens Name, not Instructions, if both
    changed.
  - A big glow on every nudge: by the fifth one it's noise, and noise
    hides the one change that matters.
  - The whole Instructions box flashing when only one line changed:
    "it rewrote everything?"
  - "Sketching…" in the title is the only sign during the wait (O7).
    That's fine, as long as nothing else moves.
- **Product insight:** The magic for nudges is **pointing, not
  celebrating**: show *where* it changed, in the pane they're looking
  at, small and the same every time. Whichever switch is open, the
  person must be able to see that the Instructions changed. That needs
  a decision (open question Q1).

### M4. The creation moment, part 1: from the first line to the first sketch (#7, #8, #9; near-miss, included by the brief)

- **The moment:** The first evening (the first-evening explorer [A5]), or
  a weekend afternoon for a clone-maker. They just opened the app for the
  first time, or pressed "+ New agent". The screen is nearly empty: "Who
  should this agent be? One line is enough.", three chips and the
  references door.
- **Trigger:** An idea they've been carrying ("I want a Tony in my
  pocket"), or pure curiosity ("let's see what this does").
- **Thoughts, in order:**
  - Before typing: "One line? Really? What should I say?" … "I'll take
    the editor chip, just to see." Or for a real person: "A coach like…
    can I just write his name?"
  - After Enter: "Okay, let's see."
  - While it streams: "It's writing… is it writing *the agent*, or just
    chatting at me?"
  - When the sketch lands: "Oh. It named her Clara." "That's… actually
    what I meant." Or: "Hm, generic."
- **Feelings:**
  - Before: a small risk, like saying a wish out loud. Mild doubt that
    one line can be enough.
  - During (2–10 s): anticipation, eyes jumping between chat and Sketch.
  - After: the first surprise. "It gets it" is the hook of the whole
    app. "Generic" is the moment they decide it's a toy.
- **Expectations:**
  - Something visible within a few seconds, not a blank wait.
  - The Sketch **fills in front of them**: a name appears, the text that
    describes the agent appears. They expect to see the *person* forming,
    not only a chat message about it.
  - A name that fits the line (not "Assistant").
  - Their own words echoed back somewhere ("tough-love coach" shows up in
    the draft).
  - No questions before the first sketch (P2 rule: show first, ask later).
- **Success:** "I typed one sentence and someone was already there."
- **Friction and fears:**
  - **O1 again, at the worst moment:** the Instructions fill behind the
    DNA switch. On Profile they see a name, a letter and an empty
    "Skills show after the first study." That reads as *less* than they
    expected: "where's the rest?"
  - The face is a single letter. A letter is a placeholder, not a
    someone.
  - "Skills show after the first study." on an agent made from one line
    reads like homework or a missing part.
  - Too much at once: chat stream, fill effect, glow, change line, new
    tags, the hint all in the same second. The eye doesn't know where
    to land.
  - For clones of real people: "Will it pretend to *be* him?" A small
    ethics flicker that the words should respect (watch-out list).
- **Product insight:** Beat 2 is the hook. The person needs to see the
  agent **take shape in one place**, in a clear order: first who it is
  (the Instructions' first lines), then the name. Whatever moves should
  happen where the eye already is. One clear moment beats five small
  ones. This is the place for the biggest magic *in the creator*, and it
  plays **once per agent**. Later nudges get the small version (M3).

### M5. The creation moment, part 2: name, face, Keep and the first words (#9, #10, #11, #14, #19; near-miss, included by the brief)

- **The moment:** Same session, 5 to 30 minutes after the first line.
  They've nudged a few times, the voice card sounds right. Or (for a
  clone-maker) they come back to a finished study with three faces to
  pick from (demo flow).
- **Trigger:** "Yes. That's her." The feeling of *done enough*.
- **Thoughts:**
  - On the name: "Clara is fine." Or: "No, she's 'Ines'." A rename is
    the first act of ownership.
  - On the face: "What does she look like?" "Not that one, the second."
    For real people: "Can I use his real photo?"
  - On Keep: "What does Keep do? Can I still change her?" Then reading
    "Yours. You can keep changing it.": "Good."
  - After Keep: "Now what? How do I talk to her?" (O4)
  - First words: "She spoke first. That's… her."
- **Feelings:**
  - Before Keep: satisfied, a little proud, a little unsure about
    committing.
  - At Keep: a small ceremony, like signing a painting. Relief that it
    isn't locked.
  - The gap after Keep: a flat moment if nothing points to Talk. The
    emotional peak can drain right here.
  - First words: the peak of the whole arc. Recognition, a bit of
    wonder, sometimes a shiver with real-person clones.
- **Expectations:**
  - A face is part of "finished". A letter isn't. They expect to choose
    or upload one, in one step, right when the agent feels real (O2).
  - Keep happens once, feels final in a good way, and changes nothing
    about editing (rule: Keep happens once).
  - After Keep, **an obvious way to say hello**, without a second button
    for something that already exists. They expect the top-bar switch
    to be noticeable at that moment, or the app to take them there.
  - First words in the agent's own voice, about *them* or the
    situation, not "How can I help you today?"
  - All of it in about a minute, not a wizard.
- **Success:** "I kept her, she looked at me and said something only she
  would say."
- **Friction and fears:**
  - **For real agents today, beat 5 is "(Demo) First words would be
    here." (O3).** The peak becomes a placeholder. Of every gap in this
    report, this one costs the most trust.
  - No face for real agents (O2), so the Keep card and Home show a
    letter.
  - Keep's born effect plays on the Sketch pane, but the person's next
    need is Talk, at the top. Effect and next step point to different
    places.
  - A Keep celebration that's too big for a quick role agent ("a blunt
    editor"). The same ceremony for a newsletter helper and for a clone
    of a beloved teacher can feel silly for the first.
  - The face picker changing the face again on its own. GPT Builder
    users complained the builder "kept changing the profile picture
    without my permission" (sources). Once chosen, the face is theirs.
- **Product insight:** Beats 3–5 are one arc and should feel like one:
  **name → face → Keep → first words**, with each step leading to the
  next. The ceremony belongs at **first words**, not at Keep. Keep is
  the signature; first words are the meeting. Today the arc breaks in
  three places for real agents (O2, O3, O4), and no animation can fix
  that. It needs a team decision on real faces and real first words
  (Q2, Q3), or the magic should be designed so it still works with a
  letter face and without first words.

### M6. Say "Not [Name]" and see the fix land (#5)

- **The moment:** In Talk, the first week. The agent says something
  the real person never would (FU-D7). They press **Not [Name]**, say
  what's wrong in the fix panel, and go back to the talk.
- **Trigger:** A jolt: "That's not him."
- **Thoughts:** "Will this stick, or just for this chat?" Then, after
  the fix: "Let's ask again… yes. *That's* him."
- **Feelings:** Before: a sting, a crack in the likeness. During: focus,
  a bit of worry about breaking something. After: relief, and pride as
  the witness ("I know him better than the machine").
- **Expectations:** The fix is quick and visible: they see that the
  agent changed (a change line, the Instructions updated). The next
  answer sounds right. They're never taken out of the talk.
- **Success:** "One sentence from me and he was himself again."
- **Friction and fears:** A fix that only says "updated" with no trace
  of *what*. A big effect during a moment that started with
  disappointment: it reads as the app patting itself on the back. Not
  knowing whether the old wrong answer is still "in" him.
- **Product insight:** The emotional peak isn't the fix. It's **the next
  answer sounding right**. Magic here should be small and warm: a quiet
  sign that the witness was heard. It fits the world (the user is the
  witness), but it must not touch the answer text itself (no magic on
  Talk answers, world rule).

### M7. Drop files and see them land in DNA (#13, with #16 and #20; near-miss, new moment)

- **The moment:** A clone-maker with a folder open in Finder, or someone
  who just read "thin on money" in DNA and grabs the book. Laptop,
  dragging from Finder onto the app window.
- **Trigger:** "Here's everything I have." Or: "This fills that gap."
- **Thoughts:**
  - While dragging: "Will it take a folder?" "Where do I drop it?" The
    overlay answers: "into Ines's DNA".
  - On drop: "Did it take all 312? Even the subfolders?"
  - After the toast: "312 files added to DNA. Okay, now what? Does it
    *know* them now?" Then the hint: "Tell the Sketcher what each is
    for…" "Hm. Do I have to?"
- **Feelings:** Before: anticipation, a little worry about "will it
  choke". On drop: wants proof, fast. After: either in control ("it has
  them, it knows what's what") or unsure ("they're listed, but are they
  *used*?").
- **Expectations:** Instant feedback on drop, before any work happens.
  A count they can trust, in their own folder names. Paths kept
  (`notes/week 1.md`). A clear next step in plain words. Nothing leaves
  the Mac (the door says so). Dropping the same file twice is fine
  ("Already in DNA").
- **Success:** "I dropped the folder, saw every file land with its own
  folder name, said 'the notes are for looking up', done."
- **Friction and fears:**
  - The overlay or the toast are slow to appear. The drop has to *feel*
    instant, or they drop again.
  - Files listed but not studied, and no sign of the difference. (Today
    the Files layer is a list; studying is a separate step.)
  - A drop on Home creates a nameless agent with files and no words
    (O5). "Who is this?" Creation starts from material, and beat 2
    (M4) has nothing to show yet.
  - An effect on each of 312 files: slow, noisy and pointless.
- **Product insight:** The magic of a drop is **a receipt**: one clear
  "they're in", with the count, where the person is looking. It's
  never one effect per file, and nothing that makes the drop feel
  heavy. The bigger feeling (it *knows* them) belongs to the end of a
  study (#15), not to the drop.

## 6. Where magic means the most, and where it gets in the way

### Ranked: magic would mean the most here

1. **The agent's very first words** (beat 5, M5). The peak of the whole
   app: recognition. Plays once per agent. Today it's missing for real
   agents (O3).
2. **The first sketch lands** (beat 2, M4). The hook: "it gets it." Plays
   once per agent. Today it happens mostly in a hidden pane (O1).
3. **It gets a face** (beat 3, M5). The jump from text to someone, and
   the key to recognition on Home ever after (M2). Missing for real
   agents (O2).
4. **Keep, as the signature that leads to the meeting** (beat 4, M5).
   Small ceremony, then a clear way to Talk (O4). Not a second button.
5. **The fixed answer sounds right again** (M6). A quiet "you were heard"
   for the witness.
6. **Ready after a long study** (M2, #15). The once-only "she's back"
   on Home or in DNA.
7. **Files land in DNA** (M7). A fast, single receipt.
8. **Each nudge shows where it changed** (M3). Pointing, not
   celebrating. Small, the same every time, in the pane in view.

### Ranked: magic would get in the way here (keep these still)

1. **The wait before and during a Talk answer** (M1). Speed is the magic.
2. **Typing**: in the composer, Instructions, description, fix panel,
   search. Nothing moves near the cursor.
3. **Sources, scores and "Strong and thin"**: evidence, not show (world
   rule). The existing quality wash should stay once-only and subtle.
4. **Errors, offline, "Not saved", Keep failed**: calm and plain. Magic
   here feels like mockery.
5. **Delete and removals**: real loss. No motion beyond the Undo line.
6. **Switching Profile ↔ DNA, Talk ↔ Sketcher, opening Home**: these
   happen dozens of times a week. Any reveal must play once per agent
   (DNA already does) or not at all.
7. **The drop overlay itself and per-file feedback**: has to appear
   instantly, with no effect per file.
8. **Repeated moments** (the 2nd to 15th nudge, the 3rd chip move, the
   2nd agent's Keep): small, or they wear out.

## 7. Watch out

Low scores or rare, but they could break trust or annoy people.

- **W1 · Magic in a hidden pane.** An effect that plays in the closed
  DNA (O1) or the other narrow-screen view is wasted at best, and at
  worst the person thinks nothing happened. Every creation effect must
  play where the person is looking (or be replayed when they get
  there, as the narrow view already does with `replay`).
- **W2 · Celebrating a placeholder.** A big first-words moment that
  ends in "(Demo) First words would be here." (O3), or a face ceremony
  on a letter, is worse than no magic. It makes the gap louder.
- **W3 · Too many effects at once.** At the first sketch, the stream,
  the fill, the glow, the change line, the "new" tags and the hint all
  land together. Pick one lead moment per beat.
- **W4 · Wearing out.** Effects that play on every nudge, chip move or
  Home visit go from delight to delay by day three. Big ones play once
  per agent. Small ones are short and stay the same.
- **W5 · The same ceremony for every agent.** A "soul is born" moment
  for a newsletter helper can feel silly. The ceremony should come from
  the agent (its name, its words, its face), not from a fixed amount of
  sparkle. *Assumption:* the words carry the scale, not the motion.
- **W6 · Real people.** For clones of living people, a "born" or "soul"
  ceremony can feel like it claims to *be* them. The world (a portrait
  studio, the user as witness) is the right frame: a portrait of them,
  not them. Words must stay on that side of the line.
- **W7 · The face changing on its own.** Once chosen, a face is theirs.
  No auto-regenerating after nudges (the GPT Builder complaint, sources).
- **W8 · Reduced motion.** Everything in magic.css already respects it.
  New moments must keep a *still* form that still says "this changed"
  (a mark, a word), so these people don't lose the meaning with the
  motion.
- **W9 · Screen readers at the peak.** The first sketch and first words
  are announced once, not as a stream of deltas (the log already uses
  `aria-busy`). A magic pass mustn't add live-region chatter.
- **W10 · Magic that blocks.** Nothing may delay Keep, Send, Stop, a
  switch or the first word of an answer. If an effect is running and
  they click, the click wins at once.
- **W11 · New words clashing with old ones.** Keep, Sketch, Profile,
  DNA, First words, Not [Name], Ready, Studying are settled
  (`magic-merlin.md` §6, world-and-words). A magic pass that adds
  "Born", "Soul" or "Alive" as labels would break "labels stay plain".
  In microcopy only, and added to the word list first.
- **W12 · Error during the creation stretch** (#22). Claude unreachable
  right after the first line is the worst first impression possible.
  "Your text stays here." is right. No magic, and no lost line.

## 8. Open questions

- **Q1 · Where do the Instructions show while sketching?** The Sketch
  report assumed "Instructions/DNA while still sketching, Profile after
  Keep" (SK Q6). The code opens Profile always (O1). *My read:* while the
  agent isn't kept, the person needs to *see* the Instructions forming,
  so either DNA opens during sketching or Profile shows the forming
  text. **Needs a decision (Jony, with Merlin).** This one choice
  affects M3 and M4 more than any effect.
- **Q2 · Real faces for real agents in this pass?** Without it, beat 3
  and Home recognition stay weak (O2). Options outside my role; it may
  need server work (Jony's brief says to write that down). *My read:*
  even an upload-your-own-photo path would close most of the gap for
  clone-makers.
- **Q3 · Real First words for real agents?** Today it's a demo line
  (O3). Making it real needs one CLI call with the agent's instructions.
  *My read:* this is the single highest-value fix for the creation
  moment. If it can't be done now, design beat 5 so it doesn't pretend
  (W2).
- **Q4 · What happens right after Keep?** Does the app take them to Talk,
  or does the top-bar switch get a one-time pointer? Both keep "one
  way to do each thing" if no new button appears. *Assumption:* most
  people want to talk right after Keep (FU UJ2 → UJ5).
- **Q5 · Drop on Home with no words (O5):** should the Sketcher make a
  first sketch from the files' names, so beat 2 still happens? Or wait
  for a line? *My read:* wait, but say in one line what it's waiting
  for.
- **Q6 · Does the name arrive before or after the description?** In the
  person's head, "who is it" comes before "what's it called". The
  Sketcher picks a name in the first reply. Should the moment show the
  description first and the name as the reveal? A Merlin call. I only
  note that the name is the moment "it" becomes "her".
- **Q7 · Second agent, same ceremony?** (#24) Should the first-ever
  agent get a bigger moment than later ones? *Assumption:* the first
  agent matters most for first impressions, but a smaller ceremony for
  the second could read as "less special". Watch it in a walkthrough.

## Sources

- FULL-UX journey map: `updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`
  (FU-D1, D2, D4–D8, A4, A5, UJ2, UJ3, UJ5).
- Sketch report: `updates/2026-11-25 SKETCH-REWORK - OPEN/columbo-report.md`
  (SK-D1–D3, #6, #7, Q6).
- Team rules: `principles/magic-ux/design-rules.md`,
  `principles/magic-ux/world-and-words.md`.
- Code read for O1–O7: `src/server/public/index.html` (Profile/DNA
  markup, Instructions inside `#dna`), `app.js` (`onDraft` filling and
  `markUpdated`, `addChangeLine`, `keep` and `agent-born`, `setPhase`),
  `block-a.js` (Home cards, drop overlay target), `block-b.js`
  (`afterLoad` → `showSketch`, `renderFaceSlot`, `finish`, `afterKeep`,
  `onDrop`), `block-c.js` (`showProfile`, `showDna` once-only reveal,
  `renderFiles` toast and hint), `block-d.js` (`firstWords`, real-agent
  demo line, `fill-in`), `components.js` (`face`, letter fallback),
  `magic.css` (about 20 effects, all behind reduced motion).
- GPT Builder (the closest product to "make an agent by chatting"): its
  builder prompt proposes a name for the user to confirm and generates a
  profile picture without asking
  ([GPT Builder prompt, third-party copy](https://huggingface.co/datasets/Nymbo/Official_LLM_System_Prompts/blob/f84de459cb73a1fd93491362a5585fce277e7dc6/GPT%20Builder.md)).
  Users complained it kept changing the picture without permission, and
  asked to choose names themselves
  ([custom picture lost](https://community.openai.com/t/gpt-builder-bug-custom-profile-picture-lost-when-publishing-publically/498387.md),
  [name option request](https://community.openai.com/t/feature-to-improve-gpt-the-option-to-give-it-a-name/876169),
  [why can't GPTs have a logo anymore](https://community.openai.com/t/why-cant-gpts-have-a-logo-anymore/1367080)).
  These are a handful of forum posts, not a survey.
- Assumption (my own knowledge, not checked here): character apps that
  let you create a companion (Character.AI, Replika) end creation with
  the character's first message, and people remember that first message
  as the moment it "came alive". That is why I rank beat 5 first.
