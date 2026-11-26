# FIREFLIES-DNA: who plays with it, and how

*Columbo, 2026-11-26. For Merlin (`02`), Jony (`03`) and Eraser (`04`).*

## Summary

The playground gets **hired for one job, three ways**: "show me, as light,
what this agent is made of, and let me feel whether it's right". The
**builder** hires it to tune the rules until they feel alive and not like a
screensaver. The **curious owner** hires it to see their agent's "soul" and
recognise their own files in it. The **presenter** hires it to make other
people say "oh".

The most important behaviors: **add a big file and watch it burst**, **build
embeddings and look for families of colour**, **replay and scrub the
history**, **push the sliders to the extremes**, **hover a dot to ask "what
is this?"** and **just watch, waiting for a spark and its chain**. Two
quieter ones carry risk: **hundreds of dots on a laptop** and **reduced
motion**.

The biggest finding: every behavior ends in a *"which one is that?"*
moment. The magic only lands if the dots can be **read back** into files and
events: hover tells the truth, one file's dots light together, colours stay
far enough apart to tell. Beauty without legibility reads as a screensaver,
and people stop after 20 seconds.

## Scope

**In:** the playground only (`playground/fireflies-dna.html`): fake files,
fake events, fake embeddings, the controls named in `00-roadmap.md`, on a
laptop or desktop browser, plus a phone glance (tap).

**Out (and why):**
- **Real data / real RAG.** Not built; behaviors around "is this my real
  agent?" are noted as open questions only.
- **Saving and sharing a state.** Not built. The wish will show up (see
  "Copy my settings" in the table), but it is out of scope; Jony writes
  settings into `03` by hand.
- **Use inside the app** (agent page, home). Not linked yet. How a daily
  user would meet the DNA in the app is a later study.

**Assumption:** the playground is used by the team and a few invited
people, not the public. Scores reflect that.

## Who plays with this

| Person | The job they hire it for | In their words |
|---|---|---|
| **The builder** (Merlin, Jony, the founder) | Tune the rules until they feel alive and honest. | "Is 40 MB too many dots? Do the blinks look like a loop?" |
| **The curious owner** | See what their agent is made of; recognise their own history. | "Which one is Dad's letters? Why are those two the same green?" |
| **The presenter** | Show others the idea of an agent with a living history. | "Watch, I'll add a big file… there." |

How people use similar tools today: Gource (animated git history) is used
mostly as a **show-off replay in talks**, and its users lean on speed
controls, pause and skip to make the history fit their audience
([opensource.com](https://opensource.com/business/16/8/intro-to-gource),
[Gource man page](https://www.mankier.com/1/gource)). The TensorFlow
Embedding Projector's own study says users came to **find clusters of
related points** and then **click a point to see its neighbours**
([paper](https://ar5iv.arxiv.org/html/1611.05469)). Both patterns map
straight onto this playground: replay for showing, colour families + hover
for understanding.

## Behavior table

Sorted by combined score (likelihood + frequency). L = likelihood, F =
frequency, 1–10.

| # | Behavior | L | F | Reason |
|---|---|---|---|---|
| 1 | **Add a big file, watch it burst** | 10 | 9 | L: the first thing anyone tries, it's the most visible cause → effect. F: repeated with different sizes to "feel" the curve. |
| 2 | **Hover / tap a dot: "what is this?"** | 9 | 9 | L: every dot is a question. F: happens dozens of times per session, often without thinking. |
| 3 | **Push sliders to the extremes** | 9 | 8 | L: builders and curious people both test limits. F: every slider, both ends. |
| 4 | **Build embeddings, look for colour families** | 9 | 7 | L: the most "magic" button on screen. F: once per state, but repeated after adding files to see where the new one lands. |
| 5 | **Replay / scrub the history** | 8 | 7 | L: the timeline is the story; Gource users do exactly this. F: several times, more when showing others. |
| 6 | **Just watch, wait for a spark and its chain** | 8 | 7 | L: people leave a living thing on screen. F: often, but in the background. Scored 7, not 8: needs patience, and a spark that comes too rarely is missed. |
| 7 | **Add events and look for their colours** | 8 | 6 | L: the control is right there. F: fewer than files; events feel less "physical". |
| 8 | **Many dots (hundreds) on a laptop** | 7 | 6 | L: anyone pushing extremes adds 20 big files. F: not every session. Lower score chosen; it's a stress case. |
| 9 | **Show it to someone else (screen share / beside them)** | 7 | 4 | L: the presenter exists. F: rare per person, but high stakes. |
| 10 | **Compare two files of the same topic** | 6 | 5 | L: follows from #4 ("are those two really alike?"). F: occasional. Merged with "find the odd one out". |
| 11 | **Reload to start fresh** | 6 | 5 | L: no reset button → reload. F: after a messy session. Assumption: same seed gives the same start. |
| 12 | **Copy my settings to keep them** | 6 | 3 | L: builders found a good feel and want it kept. F: rare. Out of scope (no saving) but the wish is real. |
| 13 | **Open on a phone, tap around** | 5 | 3 | L: a link sent in chat gets opened on a phone. F: rare; quick glance. |
| 14 | **Reduced motion on** | 4 | 4 | L: a minority set it, but some reviewers will. F: whenever they open it. On the watch list. |
| 15 | **Resize the window / go full screen to present** | 5 | 3 | L: presenters do. F: once per show. |
| 16 | **Leave the tab open for an hour** | 4 | 3 | L: forgotten tabs. F: rare. Watch: battery, memory, drift off-screen. |
| 17 | **Add a 0-byte or giant (e.g. 5 GB) file** | 4 | 2 | L: limit testers. F: once. Watch: no dot at all, or a field flooded. |
| 18 | **Click "build embeddings" twice** | 5 | 2 | L: did it work? press again. F: rare. Must be harmless. |

## Deep dives (top 7)

Both scores 7 or more: #1–#6, plus #7 (L 8, F 6) because event colours are
one of the four rules Eraser must see.

### 1 · Add a big file, watch it burst

- **The moment:** first two minutes on the page. Laptop, evening or
  between tasks. They've just watched the seeded history settle.
- **The trigger:** the "add a file" control is the most concrete thing on
  screen. The size picker invites "what if it's huge?".
- **Thoughts:** "Let's try 50 MB… whoa. And 2 KB? Just one tiny dot. Okay,
  bigger means more and bigger. What about 500 MB?"
- **Emotions:** before: curious, a bit skeptical. During: delight if the
  burst feels organic, like a seed pod opening. After: "I get it" pride, or
  disappointment if it looks like a grid of circles.
- **Expectations:** the new dots appear **at once** (under 100 ms after the
  click), in one place, then settle. A big file's dots stay visibly
  **together** as a family. The difference between 10 KB, 1 MB and 100 MB
  is obvious without reading a number.
- **Success:** "That one is clearly bigger, and it looks alive, not
  generated."
- **Friction and fears:** a big file that floods the whole field; dots so
  similar in size that 1 MB and 100 MB look the same; a burst that's too
  fast to see; not knowing which dots are new.
- **Product insight:** the size curve must be **felt in three steps**
  (small / medium / big) without labels. The burst is the hero moment: the
  newest file should be findable right after it lands (it can glow a beat
  longer). A cap on dots per file keeps one file from owning the field.

### 2 · Hover or tap a dot: "what is this?"

- **The moment:** constant, all through the session; on a phone, a tap.
- **The trigger:** a dot that blinks, a colour that stands out, a dot from
  the file they just added.
- **Thoughts:** "Which file is this? Is this one of the big file's dots or
  its own small file? Was this an edit or an activity?"
- **Emotions:** curiosity; small satisfaction each time the answer matches
  their guess; irritation if the card flickers or hides the dot.
- **Expectations:** the card appears in under 100 ms, near the dot but not
  over it, says **name + size** (file) or **kind + time** (event). All the
  dots of the same file light up together, so "this belongs to that" is
  visible. Moving dots are still easy to hover.
- **Success:** "I can read the field like a map."
- **Friction and fears:** drifting dots that slip out from under the
  pointer; tiny dots too small to hit; a card that covers the very thing
  they're looking at; on a phone, a tap that does nothing.
- **Product insight:** hover is how all four rules become **legible**. Hit
  area should be bigger than the smallest dot; the nearest dot within a
  small radius wins. Tap = hover on touch. This is the single most-used
  interaction; it must never feel fiddly.

### 3 · Push the sliders to the extremes

- **The moment:** builder, focused session, laptop. Or the curious person
  after the first burst, "what do these do?".
- **The trigger:** sliders are an open invitation; builders are here to
  tune.
- **Thoughts:** "Max size all the way up… min size all the way down…
  randomness zero: does it become a metronome? Speed 4×: is it a disco?
  Chain strength max: does the whole field catch fire?"
- **Emotions:** playful, testing. Joy if the extremes are still pretty;
  distrust if something breaks ("it froze", "everything is one blob").
- **Expectations:** every slider shows its effect **live** within a second,
  without a reset or rebuild. Ends of the range are still usable. Min can't
  pass max without a sensible result.
- **Success:** "I found the edges, nothing broke, and I found a sweet spot."
- **Friction and fears:** min > max giving nonsense; randomness 0 giving an
  obvious loop; chain max lighting everything forever; speed 4× strobing
  (also a health issue); a slider whose effect can't be seen at all.
- **Product insight:** every slider needs a **visible, immediate effect**
  and **safe ends**. Randomness 0 still keeps a floor of jitter (Rule 3 in
  the roadmap). Chain strength max still dies out. Blink speed max stays
  under a strobe rate (see watch-out). If an effect can't be seen, Eraser
  should cut the slider.

### 4 · Build embeddings, look for colour families

- **The moment:** a few minutes in, after adding some files. The button
  promises a transformation.
- **The trigger:** "build embeddings" is the most mysterious control. Also:
  after adding a file, "where will the new one land?".
- **Thoughts:** "Ooh, they turn colours. Are the recipe files all orange?
  That one's a different blue, why? Is it the same topic?"
- **Emotions:** anticipation, then wonder as the colours fade in, then the
  detective mood: "let me check if it's right". Trust grows each time a
  guess is confirmed by hover.
- **Expectations:** the fade takes long enough to watch (about a second or
  two), not instant and not slow. Same topic = clearly related colours,
  different topics = clearly different. Files added *after* the build come
  in plain and need another build, or colour themselves; either way, they
  can tell which.
- **Success:** "I can see the families. The agent has 'parts'."
- **Friction and fears:** colours too alike to tell topics apart; a family
  colour that sits next to an event colour, so "is that a file or an
  event?"; colours too dark to glow on `#0B1410`; one big file's many dots
  dominating so one topic looks bigger than it is.
- **Product insight:** colour families must survive at **small dot size**
  and **while blinking** (low opacity). Topics need distance in hue, not
  just lightness. The dots of one file share one colour (they come from one
  embedding). Pressing build twice is harmless.

### 5 · Replay and scrub the history

- **The moment:** after the first play, or when showing someone. Often
  with the pointer on the timeline, dragging back and forth.
- **The trigger:** "how did it grow?"; or the presenter's "let me show you
  from the start".
- **Thoughts:** "Play from the beginning… there's the first file, then the
  edits come in. Let me drag back to last week. Wait, where's the file I
  just added? At the end, okay."
- **Emotions:** narrative pleasure; a small "aha" when bursts of activity
  match a busy day. Frustration if scrubbing lags.
- **Expectations:** replay starts from empty and items appear **one by one
  in time order**; busy periods feel busy. Scrubbing is immediate (the
  field matches the handle while dragging). After replay or scrub, the field
  returns to "now" without a hunt. New items join the timeline at "now".
- **Success:** "It's the agent's life story in 20 seconds."
- **Friction and fears:** a replay too long to sit through (minutes) or too
  short to see; scrubbing that janks with hundreds of dots; dragging that
  leaves ghost dots; no way to tell what time the handle is at; adding a
  file mid-replay causing confusion.
- **Product insight:** replay should fit a short, fixed length (assumed
  10–30 s) whatever the span of history, and scrub must be as cheap as one
  frame. Show the date under the handle. Decide (Jony) what "add during
  replay" does: simplest is "jump to now, then add".

### 6 · Just watch: wait for a spark and its chain

- **The moment:** the page left open beside other work; or the presenter
  pausing to let people look; or the builder judging "does it feel alive?".
- **The trigger:** none: the absence of a trigger is the point. Attention
  drifts back when something lights up.
- **Thoughts:** "It's breathing… oh, there, one lit up and its neighbours
  followed. Did that go from file to file or just nearby dots? Will it
  happen again?"
- **Emotions:** calm, a little hypnotic. The chain gives a small jolt of
  surprise. Boredom if nothing happens for long; unease if it's busy.
- **Expectations:** blinks that never fall into a rhythm they can predict;
  chains that are **rare enough to be special but come within a minute**;
  a chain is readable as one event (it travels, then fades out by itself).
- **Success:** "It feels like a real field at night, not a loop."
- **Friction and fears:** **cyclic-looking blinks** (the screensaver
  feeling), chains so frequent they become noise, chains so rare nobody
  sees one, a chain that never ends.
- **Product insight:** this is where Rule D is judged. Blinks follow time
  (close events blink together) plus jitter; chains have a clear start,
  a few steps, a fade. "Chain strength" should change how far a chain
  goes, and maybe how often, but never make it endless. A first chain
  within the first ~20 s of opening helps people learn it exists
  (assumption, for Merlin to decide).

### 7 · Add events and look for their colours

- **The moment:** after files; "what are these other buttons?".
- **The trigger:** the edit / change / activity choice.
- **Thoughts:** "An edit is… that colour. Activity is this one. So the
  history is files *and* things that happened to the agent."
- **Emotions:** mild interest; events are less physical than files, so the
  wow is smaller. Confusion if an event looks like a file.
- **Expectations:** an event is visibly a **different kind** of firefly from
  a file, before and after embeddings. Three kinds are told apart at a
  glance. The event lands at "now" on the timeline.
- **Success:** "I can see when the agent was changed, not just what it
  knows."
- **Friction and fears:** event colours that sit inside an embedding
  family; three event colours too close to each other; events with no size
  meaning, so their dot size feels random.
- **Product insight:** event colours must be reserved: no embedding colour
  may land near them. A fixed, single dot size for events (assumed) keeps
  them from being read as tiny files.

## Key insights

**For Merlin (`02`):**
1. **Three size steps you can feel.** Small / medium / big must read without
   numbers. Cap dots per file so one big file can't flood the field.
2. **Colour by hue distance, not lightness.** Topics far apart in hue; every
   colour bright enough to glow on `#0B1410` even at low blink opacity.
   Reserve hue zones for the three event colours and for `plainColor`;
   embeddings never land there.
3. **Jitter has a floor.** Randomness 0 still never looks periodic. The
   eye catches a repeat in under 30 seconds.
4. **Chains: start, a few steps, fade.** Always end. Strength = reach (and
   maybe rate), never "forever". Consider one chain soon after open.
5. **Safe ends on every parameter.** Min > max, speed 4×, chain max: all
   still pretty, no strobe.

**For Jony (`03`):**
1. **Hover is the reading tool.** Bigger hit area than the dot, nearest dot
   wins, card beside not over the dot, tap = hover on touch. All dots of the
   same file light together.
2. **The newest file is findable** right after it lands (a longer first
   glow is enough).
3. **Every slider shows its effect live** and needs no rebuild.
4. **Replay is short and fixed-length; scrub is one frame cheap.** Show the
   date at the handle. Adding during replay jumps to now first.
5. **Build embeddings is safe to press twice**; files added later stay plain
   until the next build (and look plain, clearly).
6. **Reduced motion still tells all four rules**: sizes, colours, the order
   on the timeline, chains as a step-by-step glow.

## Watch out

Low score, but could break trust or cause harm:

- **Performance with hundreds of dots.** 20 big files on a 2019 laptop:
  dropped frames make the whole thing feel cheap, and scrubbing is where it
  shows first. Eraser: test 300 and 600 dots, while scrubbing.
- **Cyclic-looking blinks.** The fastest way to lose the "alive" feeling.
  Check at randomness 0 and speed 4× for at least a minute.
- **Colours too alike.** Two topics, or a topic and an event, that can't be
  told apart at small size and low opacity. Check after build with three
  topics plus all three events.
- **Strobing.** Many dots blinking together fast can approach a flashing
  rate that bothers people (the common guideline is no more than 3 flashes
  per second in a large area). Speed 4× plus a chain is the case to check.
- **Reduced motion ignored.** If drift or bursts still play, that's a trust
  and accessibility break. Opacity only.
- **Endless or field-wide chains.** Never.
- **Edge sizes.** A 0-byte file still gets one small dot; a huge file stays
  within the cap.
- **Forgotten tab.** An hour open shouldn't heat the laptop or let dots
  drift off-screen. Pausing when the tab is hidden helps (rAF does this by
  itself).
- **Looks like real data.** Someone may think these are their real files.
  Fake names should look clearly made up, and nothing claims to be "your
  agent".

## Open questions

- **Replay length:** fixed (assumed 10–30 s) or tied to blink speed? I
  assumed fixed; Jony decides.
- **Do files added after "build embeddings" colour themselves?** Assumed
  no: they stay plain until the next build, so the build moment stays
  meaningful. Merlin/Jony may choose otherwise; one rule, stated in `03`.
- **What's the right first-chain timing?** Assumed within ~20 s of open.
  Needs a feel test.
- **Event dot size:** assumed one fixed size. Could activity be smaller
  than an edit? Merlin's call.
- **Should hover highlight the whole file family or only the dot?** Assumed
  the whole family; Eraser to confirm it isn't noisy.
- **Real use later:** when this enters the app, does the owner want to
  click a firefly to open the file? Out of scope now, but likely the first
  wish of the curious owner.
- **Saving a "feel":** builders will want to keep good settings. Out of
  scope; noted for a later feature if it keeps coming up.
