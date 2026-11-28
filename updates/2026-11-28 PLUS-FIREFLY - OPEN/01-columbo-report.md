# PLUS-FIREFLY · 01 · What people expect when they press + (Columbo)

Journey: UJ1 · step 1 (start a new agent from Start).

## Summary

Pressing + is a **decision, not a show**. The job people hire it for:
*"Start my new agent now."* The gather (about 1000 ms) is welcome only
because it is short, it reads as one motion and it ends on /new.

Today the gather fades `#root`. The + sits outside `#root`, so it stays
**fully visible and unchanged** while the whole page around it turns to
light. The header comment says "nothing goes into the plus, and the plus
does not glow." The result: the one thing the person touched is the one
thing that doesn't answer. The new idea (the + itself turns into a
firefly and flies with the others) fixes that. The thing you pressed
becomes the first sign that "it heard me".

The idea has one real risk. If the + **disappears** before people can
see it *become* something, it reads as "the button broke" or "the page
glitched". The rule that protects against it: **the + never just
vanishes. In the same frame it goes, the eye sees a firefly where it
was.**

## Scope

**In:** the moment from the press on Start (`#plus` in
`src/server/public/agent-home.html`) until /new shows the ring: mouse
click, keyboard (Enter on a focused +, ⌘N / Ctrl+N), a second press,
key repeat, Reduced Motion, a slow or busy machine, a hidden window,
and coming back with Back.

**Out:**
- What happens on /new after the ring stands (Select Folder, the drop,
  the hand-over): covered in `Reports/one-flow-plus-to-chaos-behaviours.md`.
- ⌘-click or middle-click (a new tab): it already skips all motion and
  stays that way.
- Touch and phone: the app is a desktop window (same assumption as
  before).

## Who presses +

- **The first-timer** (empty Start, "Press + to make your first
  agent"). The only thing to do, pressed with curiosity. Watches the
  whole motion.
- **The returning maker** (a few agents). Knows what comes. Wants it
  quick. Watches with half an eye.
- **The keyboard user.** ⌘N from anywhere on Start, or Tab to + and
  Enter. Expects the Mac shortcut to act like the menu item: at once.
- **The impatient double-clicker.** Clicks twice out of habit (web
  buttons have taught people that one click sometimes "doesn't take").
- **The Reduced Motion user.**
- **The person on a tired machine.** An older Mac, many tabs, a
  background build: frames drop or stall.

## Behavior table

Scores 1 to 10. Frequency = how often it happens each time a new agent
is made (the press happens once per agent, so 10 = almost every time).

| # | Behavior | Likelihood | Frequency | Reason |
|---|----------|-----------:|----------:|--------|
| P1 | **Click + and watch the press answer** (eyes stay on the + for the first ~200 ms) | 10 | 10 | It's the only way in. People look at what they clicked, and only then follow the motion. |
| P2 | **Watch where the light goes**, then read the ring on /new | 9 | 9 | Motion pulls the eye. Once the + moves, the eye follows it to the ring. |
| P3 | **Press ⌘N / Ctrl+N** instead of clicking | 7 | 7 | It's the standard Mac "New" shortcut. Returning makers and keyboard people use it each time. Pegged lower because many people never learn shortcuts. |
| P4 | **Press a second time** during the gather (double-click, or "did it take?") | 7 | 6 | Habit double-clicks are common. Frequency is lower because a clear answer on the first press stops most of them. |
| P5 | **Hold ⌘N a little long**: key repeat fires more presses | 5 | 4 | Repeat starts after about 0.5 s. A firm press-and-hold happens, but not often. Scored lower when unsure. |
| P6 | **Reduced Motion on** | 3 | 10 | Few users, but every time they make an agent. |
| P7 | **Slow or busy machine**: frames drop or stall during the gather | 5 | 4 | Older Macs and busy moments exist. Rare per press, but it's when "broken" feelings start. |
| P8 | **Come back with Back** (⌘[ or the back button) from /new | 5 | 3 | "Oops, not now." Back must show Start as it was, + included. |
| P9 | **Tab to + and press Enter** (focus ring on the +) | 4 | 4 | A minority, but keyboard users. Their focus ring sits on the + that is about to turn into a firefly. |
| P10 | **Press + while typing in search** (mouse while the field has text) | 4 | 3 | Searched, found nothing, decided to make one. The search text becomes fireflies too. That's fine. |
| P11 | **Switch windows during the gather** (hidden window, frames stop) | 3 | 2 | Rare in one second. The timer fallback already covers it. |

## Deep dives

Both scores 7 or more: P1, P2, P3, P4. P5 (key repeat) is in P3's deep
dive, since it is the same hand. P6 and P7 are below the line, but the
brief asks for them and they carry trust risk, so they share a fifth
deep dive.

### D1 · The press and the + answering (P1)

- **The moment:** At the desk, Start open, cursor on the + (it has
  turned lime on hover, `var(--fly)`). They've just decided "let's
  make one."
- **The trigger:** The + is the only "new" on screen.
- **Thoughts:** "Click." Then, in the first fraction of a second: "Did
  it take?" If the + itself moves: "Oh, it's alive." If the + simply
  disappears: "…huh? Where did it go? Did the page break?"
- **Emotions:** Before: a small lift, a decision made. During: a spark
  of delight if the + answers at once, or a jolt of doubt if it
  blinks out. After: settled, curious about /new.
- **Expectations:**
  - The answer comes **within 100 ms**, on the + itself. That's the
    limit where people feel they caused it (Nielsen's response time
    limits). Today it isn't there: the page answers, the + doesn't.
  - The + is **seen becoming** the firefly. A shrink or fold into a dot
    with the same lime they saw on hover. No blank gap between the +
    and the dot, not even one frame. A gap reads as a glitch.
  - The + stays where it is for a beat before it flies. Eyes are still
    on it. A + that rockets off at once is lost from view.
- **Success:** "The + became a little light and went to join the
  others."
- **Friction and fears:**
  - **The + vanishes with nothing in its place.** The biggest risk of
    this change: "broken page", "the button is gone".
  - **The + stays as it is** (today). The thing you touched ignores you.
    That's a small but real "did it take?" and it leads to P4 double
    presses.
  - **Too much on the +:** a burst, a ripple, a glow ring. It turns a
    single act into a show and breaks the team rule "one small moment".
- **Product insight:** The + is the first firefly to light. Its firefly
  appears in the very frame the real + hides (the same canvas, from the
  +'s own box). The change starts on the first frame after the press,
  in the + colour people just saw on hover.

### D2 · Following the light to the ring (P2)

- **The moment:** The next ~800 ms. The page dissolves into fireflies
  that swirl into the 30-slot ring.
- **The trigger:** Motion. The eye follows the + firefly because it was
  looking at it.
- **Thoughts:** "There it goes… they're all gathering… there's the
  circle." Then on /new: "OK, now what?" (the ONE-FLOW report picks up
  from here).
- **Emotions:** Calm wonder for a second. Any doubt from D1 fades if the
  + firefly lands like the others.
- **Expectations:**
  - The + firefly is **one of them**, not a leader or a special star. It
    looks the same, flies the same way, and lands in a ring slot like
    the rest. A brighter or bigger one reads as "something important",
    and people wait to see what it does.
  - It arrives **with** the others, not first and not last. Last reads
    as "the + is holding everything up".
  - The whole thing is still **about one second**. If the + adds even
    200 ms, the returning maker feels it on the fifth agent.
- **Success:** "My click became part of the ring." The ring on /new
  feels like it came from what they pressed.
- **Friction and fears:** a + firefly that flies a different path (a
  straight line while the others swirl), trails behind, or flashes
  differently. It's "the odd one", and the eye sticks on it.
- **Product insight:** The + firefly is a normal member of the gather.
  It could even take the place of the "lit from the plus" slot fly the
  code already has for a near-empty home. It uses the same sprite, the
  same flash and the same arrival window. The total time doesn't grow.

### D3 · ⌘N, and the held key (P3, P5)

- **The moment:** Start just opened, hands on the keyboard. Or
  searching, then "never mind, a new one."
- **The trigger:** Habit: ⌘N means New in every Mac app.
- **Thoughts:** "⌘N." They expect it to act like the menu item: right
  away. Some look at the + (they know it's the New button). Many don't:
  their eyes are in the middle of the screen.
- **Emotions:** Neutral, efficient. Annoyed only if it lags or does
  something odd.
- **Expectations:**
  - Exactly the same as a click: the same morph, the same time, the same
    arrival. A shortcut that looks different from the click reads as a
    different action.
  - **A held key must not change anything.** The code sends ⌘N as
    `plus.click()`, and the second press skips the wait. So key repeat
    (after about 0.5 s of holding) skips the gather halfway through.
    It looks like a jump cut ("it glitched") instead of a choice.
- **Success:** "⌘N, swirl, I'm there."
- **Friction and fears:** the jump cut from key repeat. People don't
  know they held the key, so it feels random.
- **Product insight:** Count a held key (`e.repeat`) as the same press,
  not a second one. Only a fresh, deliberate second press skips. *This
  touches the keydown script in `agent-home.html`. It's a finding for
  Jony to weigh, not a decision.*

### D4 · The second press (P4)

- **The moment:** 100 to 600 ms after the first click. The finger
  clicks again, out of habit or "did it take?".
- **The trigger:** A double-click habit, or not seeing an answer.
- **Thoughts:** Habit: none, it's automatic. Doubt: "Come on…". The
  deliberate skipper: "I've seen this, just go."
- **Emotions:** Mild impatience. Never punished: they expect to land on
  /new either way.
- **Expectations:**
  - A second press **never restarts** the gather, never plays a second
    firefly, and never makes the + come back.
  - A second press **may skip** to /new at once (today's rule). That's
    fine and welcome for the skipper.
  - **Where is the second click?** The + has already hidden, so the
    second click lands on empty space (or on the canvas, which has
    `pointer-events: none`, so it lands on whatever is behind it). If
    the real + is hidden by removing it from layout or by
    `pointer-events: none`, the second click no longer reaches `#plus`
    and the skip quietly stops working for mouse users. ⌘N still skips.
- **Success:** "Click-click, I'm there." Or with one click, no urge to
  click again, because the + answered at once (D1).
- **Friction and fears:** a second click that does nothing visible
  while the gather plays on. That's not harmful, but the skip promise
  is lost. Worse: a second click on a hidden spot that opens something
  else (a row behind it, if one ever sits there).
- **Product insight:** Hide the + so it stays clickable in place (for
  example only made invisible, `opacity: 0` / `visibility` kept
  hit-testable), or have the page treat any click during the gather as
  the skip. Either way: second press = go now, never restart, never a
  second firefly. A clear answer on the first press (D1) is the best
  cure for double-clicks.

### D5 · Reduced Motion and the slow machine (P6, P7, P8, P11)

- **The moment:** Same press. But motion is off, or the Mac is busy
  (frames drop, or a frame stalls for 300 ms).
- **Thoughts:**
  - Reduced Motion: "Just take me there." Any flight is a broken
    promise from the setting they chose.
  - Slow machine: "Is it stuck?" If the + vanished and the next frame
    is late, they see a page with no + and half-faded content: "it
    broke".
  - Back: "Let me go back." They expect Start exactly as they left it,
    with the + in its place.
- **Emotions:** Reduced Motion: calm if respected, irritated if not.
  Slow machine: rising worry after about 300 ms of no change. Back:
  thrown if the + is missing ("my button is gone").
- **Expectations:**
  - **Reduced Motion:** the + fades with the rest of the page (today's
    160 ms fade). No shrink, no flight, no firefly. It goes with the
    page, not before it.
  - **Slow machine:** /new still opens on time. The timer fallback
    (D + 250 ms) already does this. The + must **not hide before its
    firefly is drawn.** Hide it in the same frame the canvas first
    paints, not at the click. Then a stalled frame shows a +, not a hole.
  - **Back (bfcache):** the + is back, visible and clickable, in its
    hover-off colour. A hover state stuck on is OK. Missing is not.
  - **Hidden window:** nothing to watch. Navigation goes on by timer,
    and Back restores everything as above.
- **Success:** Nobody notices this deep dive. That's the point.
- **Friction and fears:** a missing + after Back (the worst: the only
  way to make an agent is gone), a flight under Reduced Motion, a hole
  where the + was during a stall.
- **Product insight:** Tie "the + hides" to "the + firefly is on
  screen", never to the click itself. `restoreHome()` must bring the +
  back as well as `#root`.

## Watch out (low score, but can break trust)

- **W1 · The + is gone after Back.** It's the only way to make an
  agent. Must be restored on `pageshow` with `persisted`.
- **W2 · A hole where the + was** on a stalled frame. Hide only once
  its firefly is drawn.
- **W3 · A flight under Reduced Motion.** Plain fade, with the page.
- **W4 · Key repeat skips the gather** (D3). It reads as a glitch.
- **W5 · Focus lost for keyboard users.** If Enter on a focused + hides
  it, the focus ring goes with it. That's fine during the leave, but
  after Back, focus should be usable again (the + visible, Tab still
  reaches it).
- **W6 · Screen readers.** The + is a link, "New agent". Hiding it with
  `display: none` mid-activation can make some readers announce
  nothing or jump. Visually hiding it is enough. *Assumption: low risk,
  since navigation follows within a second.*

## Limits Merlin must respect

1. **Total time stays the same.** The gather ends at D = 1000 ms (the
   timer fallback at D + 250 ms) as today. The + morph happens inside
   that second. /new never opens later than before.
2. **The + answers at once.** The change to the + is visible in the
   first frame after the press (within 100 ms). No delay before it
   starts.
3. **No blank between + and firefly.** The real + hides in the same
   frame its firefly first paints, never before. Never a frame with
   neither.
4. **One of the others.** The + firefly uses the same colour
   (`var(--fly)`), sprite, flash and size range, lands in a ring slot
   within the same arrival window, and isn't first or last. No extra
   effects: no burst, ripple, trail or glow ring.
5. **Second press = go now.** It never restarts, never draws a second
   + firefly and never brings the + back. A held key (`e.repeat`) is
   not a second press.
6. **Reduced Motion: no flight.** The + fades with the page in the same
   160 ms fade. No shrink, no fold, no firefly.
7. **Never block the move to /new.** No error, missing box (a + with no
   size) or stopped frame delays navigation. The + morph is optional
   decoration on a run that already resolves by timer.
8. **Back brings the + back**, visible and clickable, with the rest of
   Start.

## Key insights

1. **The job is "start my new agent now".** The morph serves the
   feeling "it heard me", nothing more.
2. **People look at what they clicked.** The + is where the eye is for
   the first ~200 ms, so that's where the answer must be. Today the
   answer is everywhere *except* the +.
3. **Becoming, not vanishing.** The same change reads as magic if it's
   seen and as breakage if it's missed. The difference is one frame.
4. **Ordinary beats special.** The + firefly joining as *one of the
   others* tells people "you made this ring". A special one makes them
   wait for it.
5. **A clear first answer prevents the second press.**

## Open questions (with the assumption used until answered)

- **Q1 · How is the + hidden?** *Assumption:* visually hidden but still
  in place and clickable (opacity), so a second click still skips
  (D4). Jony decides the method.
- **Q2 · Should key repeat be ignored?** *Assumption:* yes, `e.repeat`
  is the same press. It needs a one-line change in `agent-home.html`'s
  keydown. Jony's call. If it's left out, note it as a known small
  glitch.
- **Q3 · Which ring slot does the + firefly take?** *Assumption:* any
  slot near its path, chosen like the others. Merlin decides.
- **Q4 · ⌘N while the + is off screen or has no box** (a very narrow
  window). *Assumption:* the gather runs without a + firefly, as today.
  Navigation is never affected.

## Sources

- Nielsen Norman Group, response time limits (0.1 s feels caused by
  you, 1 s keeps the flow):
  https://www.nngroup.com/articles/response-times-3-important-limits/
- Apple Human Interface Guidelines, Motion (keep it brief, purposeful,
  and honour Reduce Motion):
  https://developer.apple.com/design/human-interface-guidelines/motion
- Apple HIG, Keyboards (⌘N = New is a standard shortcut people expect):
  https://developer.apple.com/design/human-interface-guidelines/keyboards
- Earlier team research: `Reports/one-flow-plus-to-chaos-behaviours.md`
  (D1: arrival in about a second, no blank frame, no jump).
- Code read: `src/server/public/firefly-gather.js` (D = 1000 ms, timer
  at D + 250, a 160 ms Reduced Motion fade, `restoreHome`, the slot "lit
  from the plus"), and `src/server/public/agent-home.html` (`#plus`
  sits outside `#root`, so today it never fades; the second press goes
  at once; ⌘N calls `plus.click()`; modifier-clicks skip motion).
