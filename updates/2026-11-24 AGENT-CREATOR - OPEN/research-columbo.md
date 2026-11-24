# Research — How people will create agents by chatting (P2)

*Columbo, UX Detective. 2026-11-24. For the Magic UX team (Merlin, Jony,
Eraser) and the build team.*

## Summary

People **hire** the creator for one job: *"Turn the agent I have in my head
into something real that sounds right, without me having to write a
prompt."* They will start vague, with one line and often a person's name.
They expect something to appear almost at once. They will judge progress by
looking at the draft, not by reading the chat. Most shaping happens through
short chat nudges ("more blunt", "less hype"). Small precise fixes happen by
hand.

Three things decide whether they trust the creator:
1. Their hand edits are never quietly overwritten.
2. They can see what changed after each reply.
3. They have some way to feel the agent "sounds right" before they call it
   done.

"Done" is not a checklist. It is a feeling, and it usually comes from
hearing the agent answer one real question in its own voice.

## Scope

**In (P2 MVP):**
- Describing the agent at the start.
- Answering and asking questions in the chat.
- Refining the persona and instructions through chat.
- Watching the draft (name, persona, instructions) grow.
- Editing the draft by hand vs. through chat.
- Knowing when it's done, and saving.
- Leaving and coming back.
- Pasting text into the chat. This is the real stand-in for uploads until P3.

**Out (and why):**
- Uploading files and asking about them. That is P3. I note where it will
  change behavior, but I don't score it as P2 work.
- The capability map (P12). Not built yet, but see the watch-out list: users
  will *ask* what the agent knows.
- Chatting with the finished agent for real (P8), and chat history (P9).
- Persona generation from a source corpus (P5).
- Phone use. The app is a local page on the user's own computer, so phone
  use is unlikely (scored low below).

**Assumptions (mine, please check):**
- **A1.** Today's users are the project owner and people like them. They are
  comfortable with AI, they have Claude Code installed, and they want agents
  that clone a real person's thinking (the Tony Robbins example in this repo)
  or serve a clear role.
- **A2.** One person uses the app on a laptop or desktop, in a session of
  about 10–30 minutes per agent.
- **A3.** The creator's replies take a few seconds each (the local CLI). The
  draft updates when a reply finishes.

## Who I pictured

- **The clone-maker.** Wants an agent of a specific person: a coach, an
  author, themselves. Knows that person deeply and will spot a wrong note at
  once. *This is the core user.*
- **The role-builder.** Wants a helper with a job ("a tough editor for my
  newsletter"). Cares about rules more than voice.
- **The prompt power user.** Has written system prompts before. Will open
  the instructions field and type into it directly.
- **The tired evening tinkerer.** After work, low energy, wants to "just see
  something" and stop after ten minutes.
- **The returner.** Made a draft yesterday and comes back to improve it.

## Behavior table

Likelihood = how likely a real user is to do this at all. Frequency = how
often, within a typical creation session. Both are scored 1–10, and the
table is sorted by the two added together.

| # | Behavior | Likelihood | Frequency | Reason |
|---|---|---|---|---|
| 1 | **Describe in one line** ("Make me a Tony Robbins coach") | 9 | 9 | Every agent starts this way. People open chat tools with short, vague asks, and they repeat it each time they start a new agent or a new direction. |
| 2 | **Glance at the draft after each reply** | 9 | 9 | The draft is the real product. People check that it "got it" far more than they reread the chat. It happens on every turn. |
| 3 | **Answer the creator's questions** | 9 | 8 | If asked, most people answer. They answer fast and short, and sometimes only one of two questions. A little lower than #2 because some turns have no question. |
| 4 | **Nudge the persona or rules by chat** ("more blunt", "no emojis", "shorter answers") | 9 | 8 | This is the main way people shape it. Other builders show that most non-experts edit by talking. |
| 5 | **Try it out** ("How would it answer: I can't get out of bed?") | 8 | 7 | You can't judge a voice from a description. People want to *hear* it. It comes back after each big change. |
| 6 | **Fix a field by hand** (the name, one wrong word, a sentence in the instructions) | 8 | 7 | Typing three words is faster than explaining them. Power users do this a lot; everyone does it for the name. I took the lower score because beginners may not notice the fields can be edited. |
| 7 | **Decide it's done and save** | 8 | 5 | Every finished agent ends with this. It happens once per agent, but it is make-or-break for the feeling. *Deep-dived even though Frequency is under 7, because the brief asks for it and the stakes are high.* |
| 8 | **Paste a chunk of text** (a bio, notes, a transcript excerpt, an old prompt) | 7 | 5 | Without uploads (P3), pasting is how people bring in material. Clone-makers will do it often; role-builders less. |
| 9 | **Undo a change** ("the last version was better") | 7 | 5 | Chat edits sometimes overshoot. People then want the old text back, and fear losing it. |
| 10 | **Leave and come back later** | 7 | 5 | Tired users stop halfway. Returners refine over days. |
| 11 | **Rename the agent** | 7 | 4 | Names are emotional, and the first AI-picked name is often not "it". It is usually done by hand. |
| 12 | **Ask "what else should it have?"** | 6 | 5 | People run out of ideas and want the creator to lead. |
| 13 | **Brain-dump the first message** (several paragraphs) | 6 | 5 | Prepared users arrive with everything written. It is the opposite of #1. Lower than #1 because most people don't prepare. |
| 14 | **Contradict an earlier request** ("Actually, make it gentle") | 6 | 5 | Ideas change as the draft appears. The creator has to follow the latest wish without breaking other parts. |
| 15 | **Read the whole instructions before saving** | 6 | 4 | Careful users and power users do this. Others trust the summary. |
| 16 | **Skip the questions** ("Just make it, I'll fix it later") | 6 | 4 | Hurried and tired users. Lower than #3 because most people do answer when asked. |
| 17 | **Ask what the agent knows or doesn't know** | 6 | 3 | Clone-makers worry about gaps. Today the creator can only guess, and this is exactly the job of P12. Lower score because P2 has no material to ask about yet. |
| 18 | **Ask the creator off-topic things** | 5 | 3 | It's a chat box, so some people use it as a general AI. Not common. |
| 19 | **Make several agents in a row** | 4 | 3 | Possible once the first one works. Not the first-week pattern. |
| 20 | **Use it on a phone** | 2 | 2 | It is a local page on the computer. Only if someone opens it on their home network. |

## Deep dives

### 1. Describe in one line

- **The moment:** Evening, on a laptop at the kitchen table or desk. Just
  before, they were listening to a podcast or rereading a book by the person
  they admire. Or they just finished a task where they thought "I wish I
  had X to ask."
- **Trigger:** The person or role is fresh in their mind. Curiosity: "Can
  this thing really do it?"
- **Thoughts:** "Let's see if it gets him." "I don't want to write a
  prompt, that's the whole point." "Do I need to explain everything?"
- **Emotions:** Before: hopeful, a little skeptical. During: impatient
  ("come on…"). After a good first draft: a small jolt of delight, "oh, it
  knows who he is."
- **Expectations:** One message is enough to get *something*. A visible
  draft in seconds, not after five questions. The name is filled in, and
  the persona sounds roughly like the person.
- **Success:** "I typed one line and there's already an agent with a name
  and a voice."
- **Friction and fears:**
  - An interview before anything appears ("First, tell me the agent's
    purpose, audience, tone…") feels like a form in disguise, and they quit.
  - A blank empty state with no hint of what to type.
  - A generic draft that could be anyone.
- **Product insight:** The time to the first draft is the most important
  number in P2. The first creator reply must fill in all three fields, even
  if it has to guess, and then ask at most one or two questions. The empty
  screen should show what a good first line looks like.

### 2. Glance at the draft after each reply

- **The moment:** Mid-session, while the creator's reply is still finishing.
  Their eyes jump from the chat to the draft.
- **Trigger:** A reply just landed. "Did it actually change anything?"
- **Thoughts:** "What changed?" "Did it keep the part I liked?" "It *said*
  it made it blunter… did it?"
- **Emotions:** Before: alert. During: they scan quickly. After: satisfied
  if they can see the change; uneasy if they can't find it.
- **Expectations:** The draft updates on its own, with no refresh and no
  "apply" step. The changed part is easy to spot. The parts that didn't
  change stay exactly the same.
- **Success:** "I can see it grow, and every change is the one I asked for."
- **Friction and fears:**
  - The whole persona is rewritten when they asked for one small change. It
    reads as "it forgot everything." In GPT Builder this is the most common
    complaint.
  - The chat claims a change the draft doesn't show.
  - Long walls of instructions with no way to see the difference.
- **Product insight:**
  - The draft, not the chat, is where people check the creator's work.
  - The creator must change only what was asked.
  - The screen must make "what just changed" visible.
  - The chat and the draft must never disagree. The roadmap's "final result
    wins" and "changed fields" support this.

### 3. Answer the creator's questions

- **The moment:** Right after the first draft. They're leaning in now,
  engaged.
- **Trigger:** The creator asked something ("Should he be tough-love or
  warm?").
- **Thoughts:** "Good question." Or: "Ugh, I don't know, you decide." "Why
  are there three questions?"
- **Emotions:** Feeling understood when the question is sharp. Tired when
  there are many questions, or abstract ones ("What is the agent's target
  audience?").
- **Expectations:** Short questions they can answer in a few words. A
  suggested answer they can just accept ("I'd go tough-love, okay?"). Each
  answer visibly changes the draft.
- **Success:** "It asked exactly what I'd have forgotten, and my answer
  showed up in the draft right away."
- **Friction and fears:**
  - Question lists.
  - Questions with no visible effect.
  - Questions about things they already said.
  - Being made to answer before they can move on.
  - Answering only one of two questions, then getting the other one again
    and again.
- **Product insight:**
  - One or two questions at a time, each with a suggested default.
  - Skipping a question must be fine.
  - Each answer should change the draft on the same turn.
  - The creator leads the conversation, but gently.

### 4. Nudge the persona or rules by chat

- **The moment:** After the first one or two drafts, often right after
  trying it out (#5).
- **Trigger:** Something sounds off: too much hype, too long, too
  corporate.
- **Thoughts:** "He'd never say 'awesome'." "Shorter. Punchier." "Keep
  everything else."
- **Emotions:** A slight irritation at the wrong note. Then relief when it's
  fixed, or growing distrust when the fix breaks something else.
- **Expectations:** A short sentence is enough. Only that aspect changes.
  The change is visible in the draft (#2).
- **Success:** "I said one word and it nailed the tone, and nothing else
  moved."
- **Friction and fears:**
  - Overshooting: "more blunt" turns into rude.
  - Losing earlier refinements.
  - The creator arguing or asking "are you sure?"
  - Contradicting an earlier wish (#14) turns into a mess.
- **Product insight:**
  - Nudges are small, local edits, not regenerations.
  - The latest wish wins over older ones, but untouched parts stay.
  - An easy way back (#9) makes people brave enough to nudge.

### 5. Try it out

- **The moment:** After a few changes, when the draft "looks" right but they
  aren't sure it *sounds* right.
- **Trigger:** "Reading a description of a voice isn't hearing it." Often a
  real question they have in their own life.
- **Thoughts:** "Let me see how he'd answer *my* problem." "Is this him, or
  a generic chatbot with his name?"
- **Emotions:** Before: anticipation, a bit of a test. After: either "wow,
  that's him", the strongest moment in the whole flow, or a sharp
  disappointment that leads straight to #4.
- **Expectations:** They can ask a sample question without leaving the
  screen and get an answer in the agent's voice. It should be clear that
  this is a *sample*, not the creator talking.
- **Success:** "It answered like him. I got a little chill."
- **Friction and fears:**
  - The creator answers *about* the agent ("It would probably say…")
    instead of *as* the agent.
  - The sample doesn't match the draft.
  - Having to save first and go to some other screen to test.
- **Product insight:**
  - This is how people decide "done" (#7). P2 has no real agent chat yet
    (that's P8).
  - The minimum is for the creator to give a clearly marked sample answer in
    the agent's voice, built from the current draft.
  - Whether P2 needs a real try-it mode is an open question for the team.

### 6. Fix a field by hand

- **The moment:** Any time. Most often right after a draft update that's 90%
  right.
- **Trigger:** One word is wrong, or the name isn't quite it. "Faster to
  just type it."
- **Thoughts:** "I'll just change this myself." Then, a second later: "Wait,
  will the AI undo my change next turn?"
- **Emotions:** In control while typing. Anxious on the next creator reply.
  Betrayed if their edit disappears.
- **Expectations:**
  - The field is obviously editable.
  - The edit is kept at once, with no separate save.
  - The creator *knows* about the edit and builds on it.
  - The creator never overwrites it without asking.
- **Success:** "I fixed it, and the AI kept going with my version."
- **Friction and fears:**
  - The edit is silently overwritten. This is the top trust-breaker.
  - Not knowing whether the edit was saved.
  - Typing while the creator is mid-reply and updating the same field.
  - Two different "edit modes" that fight each other.
- **Product insight:**
  - The user's hand edit is the truth.
  - Every creator turn must see the current draft, hand edits included.
  - If the creator wants to change a field the user just edited, it should
    say so in the chat first.
  - Watch the moment when a hand edit and a creator reply happen at the same
    time. Eraser should check the design has one clear rule for it.

### 7. Decide it's done and save

- **The moment:** 10–30 minutes in. Often right after a "try it out" answer
  felt right, or when energy runs out (the tired tinkerer).
- **Trigger:** "That's him." Or: "Good enough for tonight."
- **Thoughts:** "Is it really finished? Did I forget something?" "Can I
  still change it later?" "Where does it go now?"
- **Emotions:** Pride, and a small fear of committing. Relief if they know
  it's safe and can still be changed.
- **Expectations:**
  - One clear finish action.
  - A moment that marks it as *theirs*, with the name and a short summary.
  - A promise that they can come back and keep refining.
  - Nothing lost if they just close the tab.
- **Success:** "It's saved, it has a name, and I can open it again
  tomorrow."
- **Friction and fears:**
  - Not knowing if it's saved.
  - Thinking saving makes it final and can't be changed.
  - A save that asks for more fields.
  - The creator pushing them to finish ("Your agent is complete!") before
    they feel it.
  - Or the opposite: endless "anything else?" questions.
- **Product insight:**
  - Autosave makes stopping safe. Saving is an emotional *finish* step, not
    a technical need.
  - The creator may say "this looks ready", but the user decides.
  - A saved agent must stay editable.
  - This is where P12's short capability card will sit later. Leave room.

## Key insights

1. **The job is "make it real without writing a prompt."** Every extra form
   field or abstract question works against the job.
2. **The draft is the scoreboard.** People judge the creator by what changes
   in the draft, not by what it says. Make changes visible, and keep
   everything else exactly where it was.
3. **Show something at once, ask later.** A guessed first draft beats a good
   interview. Questions come after there's something to react to: one or
   two at a time, each with a default.
4. **Hand edits are sacred.** The single biggest trust-breaker in similar
   tools (GPT Builder's Create vs. Configure tabs) is chat quietly
   overwriting what the user typed. One draft, one truth, and hand edits
   win.
5. **Chat for direction, hands for precision.** Most people steer by chat.
   Everyone fixes small things by hand, the name above all. Both must work
   on the *same* draft, with no modes.
6. **"Done" is a feeling that comes from hearing the voice.** A sample answer
   in the agent's voice is what turns "looks right" into "that's him."
7. **Pasting is P2's upload.** Until P3, people will paste bios, notes and
   transcript bits. The creator should use pasted text well, and the screen
   should not choke on long pastes.
8. **"Persona" vs. "instructions" is unclear to most people.** The labels
   need a plain hint, such as "who it is" vs. "what it does". Otherwise
   people put things in the wrong field or don't edit at all.
9. **Safety in coming back.** Autosave and reopening make people relaxed
   enough to experiment.

## Watch-out list

These scored low or are rare, but they could break trust or cause harm.

- **Silent overwrite of a hand edit.** This one is common, not rare, but
  it's the worst failure, so it's listed here too. Lock it in with a test.
- **Draft block leaking into the chat.** If the raw `<draft>{…}</draft>`
  ever shows, the magic breaks and the screen looks broken.
- **The CLI offline or not logged in.** The user types, nothing happens, and
  they blame the app. They need a plain message and a next step. Their
  typed message must not be lost.
- **A long reply with no visible change.** If the creator talks for a long
  time and the draft doesn't move, the user loses track. Keep replies short.
- **Sensitive pasted material.** People will paste private transcripts or
  client notes. Keep everything local, never in the repo (CLAUDE.md rule).
  Never echo private details into places they don't expect.
- **Secrets in instructions.** Some people will paste API keys or passwords
  "so the agent can use them." The creator should gently say no to storing
  them.
- **Real-person clones.** Clone-makers build agents of real, living people.
  The agent must not claim to *be* that person to others, or to speak for
  them. This is a product and ethics question for the orchestrator, not
  something I decide here.
- **The user asks "what does it know?" (#17).** Today the creator can only
  guess. A confident guess would be a quiet lie. It should say plainly that
  P2 agents only know what's in the draft and the chat. P12 will answer this
  properly later.
- **The map leaking into the agent (P12, later).** When the capability map
  arrives, it must never end up in the persona or instructions. The roadmap
  already guards this.
- **Losing work on a crash or closed tab.** Covered by autosave. Keep it
  that way.

## Open questions

1. **Try it out in P2 or not?** Is a clearly marked sample answer from the
   creator enough, or does P2 need a small real "try it" box using the draft
   as the system prompt? My read: the sample answer is enough for the MVP,
   and a real mode is better. *Needs a decision from the orchestrator or
   Columbo.*
2. **Undo.** Do we need "go back to the previous version" in P2, or is
   "ask the creator to put it back" enough? I lean toward needing at least a
   one-step undo, because it makes people brave enough to nudge (#4, #9).
   Not decided.
3. **Saved agent format.** Is the saved agent just `name / persona /
   instructions`, or should it also be written as an `instructions.md` like
   the Tony Robbins example, so the rest of the project can use it? This
   matters for P5 and P8.
4. **What's in the persona vs. the instructions** for a clone of a real
   person? The pipeline in `SKILL.md` puts everything into one
   `instructions.md`. Does P2 keep two fields on purpose?
5. **A1 and A2 (who uses it, and on what device).** If the app is meant for
   less technical people later, the empty state and the question style need
   another look.
6. **Several drafts at once.** Do people need a list of their agents in P2,
   or just "continue the last one"? I scored this low (#19), so the simplest
   answer is probably enough.

## Sources

- OpenAI Community: users report the GPT Builder chat overwriting
  hand-written instructions, and switching to editing by hand
  ([thread 1](https://community.openai.com/t/updating-an-existing-custom-gpt-will-randomly-overwrite-your-instructions/582479),
  [thread 2](https://community.openai.com/t/my-gpt-forgot-everything-i-told-it-to-do/508007),
  [thread 3](https://community.openai.com/t/custom-gpts-forgetting-not-saving-errors-timing-out-requiring-info-re-entry/575566)).
- PwR study on conversational programming: most participants edited through
  chat, and expert users edited the shown text directly
  ([paper](https://ar5iv.labs.arxiv.org/html/2309.09495)).
- Builders that offer both chat and direct field editing:
  [Langdock](https://docs.langdock.com/en/using-langdock/agents/agent-builder),
  [HighLevel](https://help.gohighlevel.com/support/solutions/articles/155000009261-how-to-use-the-guided-managed-agent-builder-in-highlevel),
  [Ashby](https://www.ashbyhq.com/product-updates/personal-agent-creation).
- This repo: the P1 engine (`src/engine`), the P1 roadmap and wiki
  (`updates/2026-11-24 AI-ENGINE - OPEN/`), and the feature notes for P2, P3
  and P12.
