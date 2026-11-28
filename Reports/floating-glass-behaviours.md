# FLOATING GLASS: how people use the floating Sketcher chat over the likeness (Columbo)

Journey step: **UJ2 · 3, the Sketcher chat**. Vision: Phase 1 of
`updates/2026-11-28 FLOATING-GLASS - OPEN/00-roadmap.md`.

## Summary

People hire the Sketcher panel for one job: *"Help me shape this agent,
and let me keep an eye on it while we talk."* The glass is what makes the
second half work. Through it they can see the likeness (the Fireflies DNA
mark) still there behind the chat. But they only accept the glass while
reading stays easy. Once a bright dot sits under a line of text and the
words blur, the glass stops being magic and becomes a problem.

Main findings:

1. **Reading is the main use, and the likeness is brightest exactly where
   the text is.** The mark sits in the middle of the left field, under the
   panel. Its lime dots (#D8F26A, with glow) are the brightest thing on the
   screen. The message area needs its own darker tint so text passes 4.5:1
   over the brightest dot, not only over the dark field (D1).
2. **A floating panel with a gap and rounded corners says "window", and
   windows bring expectations.** People will expect it to sit above the page,
   cast a shadow and stay put. Some will try to drag it by its top. The arrow
   tab is still the only handle (D2, W3).
3. **Closing is "let me look", not "I'm done".** People close with the arrow
   tab or Esc to check the likeness, then come straight back. The look-back
   flash, focus going back to the tab and a kept draft are what make this
   loop feel safe (D3).
4. **On a narrow window the panel takes almost the whole width.** The gap
   must not cost so much width that words crowd the arrow, and the glass
   must read just as well there, because the mark is then fully behind the
   text (D4).
5. **Only the panel is glass.** If the field or the left edge looks
   see-through too, people can't tell which layer is the "window". One glass
   layer makes the panel the thing to read and everything else the scene.

## Scope

**In:** opening the panel with the arrow tab ("dragging it out"), reading
and writing in it over a bright likeness, glancing through it, closing it
with the arrow tab or Esc, the look-back flash, narrow windows under
640 px, keyboard focus, and what people expect from a see-through panel.

**Out (and why):**
- Firefly +, and the firefly chat box, send and thinking: Phases 3–4, with
  their own report (`01-columbo-behaviors.md`).
- The Talk box on the agent page, and glass on home and the agent page:
  out of this goal (roadmap, Pixel).
- Free dragging of the panel around the window: not planned (roadmap). I
  keep it only as a watch-out (W3).
- Exact gap, radius, tint and blur values: Jony's and Merlin's call. This
  note says what people must see.

**Assumptions (not checked with real users):**
- A1. After Phase 1 the field on /new is solid, so what shows through the
  glass is the likeness, the wandering flies and the field, not the desktop.
  The brightest thing behind the text is a fully lit, glowing mark dot.
- A2. People sit at a laptop or desktop. A window "under 640 px" means a
  half-screen window or a small Mac app window, not a phone.
- A3. Replies are often long (markdown lists, a few paragraphs), so people
  read for 10–60 seconds at a time, not just glance.

## Behavior table

Scores 1–10, sorted by the two scores added together. Where I was unsure I
chose the lower score.

| # | Behavior | Likelihood | Frequency | Reason |
|---|---|---|---|---|
| B1 | **Read a reply over the bright likeness** | 9 | 9 | Every turn ends in reading. The mark is under the text area, so every reply passes over it. |
| B2 | **Pull the panel out with the arrow tab** | 9 | 8 | It is the only way in. People do it at the start of every session and after each look. |
| B3 | **Write a message in the box over the glass** | 9 | 8 | Every turn. The draft and the caret must read as clearly as the replies. |
| B4 | **Close to look, then reopen** (arrow tab or Esc) | 8 | 8 | People want to see what a turn changed. The look-back flash invites this loop. |
| B5 | **Glance through the glass at the likeness** while the chat is open | 8 | 7 | The reason glass is wanted at all: *"it's still there, it's changing"*. Often, but brief. |
| B6 | **Use it in a narrow window** (under 640 px) | 7 | 6 | Finder is often beside the app at half a screen. On a small window, every session. |
| B7 | **Select or copy text** from a reply | 6 | 4 | Copying a suggested description or name happens, but not every turn. |
| B8 | **Click the gap or the field outside** to close it | 5 | 4 | Floating windows teach "click outside to dismiss". Tried once or twice. |
| B9 | **Try to drag the panel by its top** | 5 | 3 | A floating window with a shadow invites it. Tried once, then dropped if nothing moves. |
| B10 | **Reduce Transparency on** and still expect a readable panel | 3 | 8 | Few people, but every session for them. |

## Deep dives

### D1. Reading a reply over the bright likeness (B1 + B3: 9/9, 9/8)

- **The moment:** a weekday afternoon at a laptop. They asked Sketcher to
  sort the transcripts. A five-line reply with a list streams in. Behind it,
  the mark has almost formed and is fully lit.
- **The trigger:** the answer is arriving, and they want to know what it did.
- **Thoughts:** *"OK, what did it say… wait, what's that word?"* *"The green
  dot is right behind the second line."* *"Pretty, but I'm squinting."*
- **Emotions:** before: curious. During: calm and focused if the words are
  crisp. If a bright dot shimmers under the text, small irritation that
  grows with every line. After: either "got it" or tired eyes.
- **Expectations:** text as crisp as on a solid panel. The glass shows
  *that* something is behind it (colour, glow, soft shapes), never *what*
  in detail. The look doesn't change as they scroll or as dots light up
  behind them.
- **Success:** they read the whole reply without noticing the glass at
  all, then notice it with pleasure when they look up.
- **Friction and fears:** a lit dot right under a word lowers contrast in
  that spot. The flies wandering behind the text make it shimmer as you
  read. Dim helper text ("Sketching…" at 60 %) becomes hard to read. The
  lime link colour on a lime glow vanishes.
- **Product insight:** contrast is set by the *brightest* point behind the
  text, not the average. Measure 4.5:1 over a fully lit mark dot, also for
  the dim and link styles, not only body text. Blur strong enough that moving
  dots under the text read as a soft glow, not as moving spots. A darker tint
  behind the log (not the whole panel) keeps the glass feeling in the frame
  and the header.

### D2. Pulling it out: a window, not a strip (B2 + B5: 9/8, 8/7)

- **The moment:** files landed and the mark is gathering. They click the
  arrow tab on the left edge to tell Sketcher what the agent is for.
- **The trigger:** "Time to talk to it."
- **Thoughts:** *"Oh, a chat window."* *"I can still see my agent behind
  it, nice."* Today's glued strip reads as *"a sidebar took over the left"*.
  A floating panel reads as *"something came to help me"*.
- **Emotions:** before: purposeful. During: a small pleasure as it slides
  out and the field softens behind it. After: settled, ready to type.
- **Expectations:** the panel arrives with a clear edge on all four sides
  (gap, rounded corners, soft shadow), so it sits *above* the page. Focus
  lands in the message box. The arrow tab is still visible and points back
  (‹), so the way out is obvious. Nothing else on the screen looks
  see-through, so it's clear which layer is the window.
- **Success:** *"It's a little window over my agent."* They can tell at a
  glance which part is the chat and which is the scene.
- **Friction and fears:** if the field behind is also glassy, panel and
  field melt into one haze. The shadow or gap is too faint to read as a
  window. The arrow tab is left floating in the gap, cut off from the panel,
  so it no longer looks like the panel's handle. The panel looks like a
  window and can't be moved (W3).
- **Product insight:** solid field + glass panel + shadow is what makes
  "window" readable. The arrow tab should still clearly belong to the
  panel's edge once the panel has a gap. Check that open and closed arrow
  positions still line up.

### D3. Closing to look, then coming back (B4: 8/8)

- **The moment:** Sketcher said "I moved 40 files to knowledge". They want
  to see the likeness change.
- **The trigger:** "What did that do?"
- **Thoughts:** *"Let me look."* Arrow tab or Esc. *"Oh, it flashed. Something
  changed."* *"OK, back in."*
- **Emotions:** before: curious. During: a small reward from the look-back
  flash. After: reassured, and they reopen within seconds.
- **Expectations:** one press closes it. Esc closes the panel only and never
  goes home. The panel goes back the way it came. Focus returns to the arrow
  tab. The flash plays once, only if something changed. Reopening shows
  the log and their half-typed draft as they left them.
- **Success:** close, look, reopen without thinking about the controls.
- **Friction and fears:** Esc that leaves /new. A lost draft. A flash that
  plays when nothing changed (it starts to mean nothing). A click in the
  new gap that closes it by accident or does nothing in a way that feels
  broken (W4).
- **Product insight:** Phase 1 changes only the look, so this loop must
  behave exactly as today. The new gap is new space to click: it must not
  become a second, hidden way to close.

### D4. On a narrow window (B6: 7/6)

- **The moment:** a 13" laptop, the app squeezed to about 600 px beside
  Finder. They open Sketcher. The panel takes almost the full width, and the
  arrow tab rests just inside its right edge.
- **The trigger:** the same as D1–D3, in less room.
- **Thoughts:** *"It covers everything, fine."* *"Is that the arrow or part
  of the text?"* *"The mark is right behind this paragraph."*
- **Emotions:** tolerant if it still works. Frustrated if the arrow tab
  overlaps words or the box falls under the bottom edge.
- **Expectations:** the panel fits inside the window with its gap. Words
  wrap clear of the arrow tab. The message box stays above the bottom edge.
  The text reads as well as on a wide window.
- **Success:** the same flow, just narrower.
- **Friction and fears:** gap plus padding eats too much width, so lines
  wrap every two words. The arrow tab sits over the text. The whole mark is
  now behind the text, so weak glass shows here first.
- **Product insight:** check contrast and the arrow tab's clearance at
  about 600 px wide as well as on a wide window. The gap can shrink on
  narrow screens, but the panel should still read as floating.

## Watch out (low scores, but they can break trust)

- **W1. Text contrast over bright backgrounds.** The biggest risk. A fully
  lit, glowing mark dot right under a line of text can push body text,
  the dim "Sketching…" line, code blocks or lime links under 4.5:1. Measure
  it from pixels at the brightest spot, in Chrome, WebKit and the Mac app.
  Measuring over the dark field average isn't enough. Apple's own
  see-through UI got widespread complaints about text that was hard to read
  and tiring eyes, and Apple had to add a "Tinted" option. Phase 1 has the
  same risk.
- **W2. Shimmer while reading.** Flies wandering under the text, even when
  blurred, can make words seem to move. For people prone to motion
  discomfort this is worse than low contrast. With Reduce Motion the flies
  are still, so this mainly hits everyone else.
- **W3. "It looks like a window, so I'll drag it."** A floating panel with a
  shadow invites dragging by its top. Nothing moving is fine if nothing
  *looks* grabbable (no grip, no move cursor). No half-working drag.
- **W4. The gap becomes a hidden way out.** A click in the new gap or on
  the field must not close the panel (that would be a second way to close,
  and it would lose the reading place). It also shouldn't feel like the
  click was swallowed for no reason.
- **W5. Reduce Transparency is ignored.** People who turned on macOS
  Reduce Transparency did it because glass hurts their reading. If the
  panel stays see-through for them, it breaks trust. Uncertain: the CSS
  signal for this isn't supported in every engine yet, so Jony should check
  what the Mac app's WebKit can see.
- **W6. Glass that spreads.** If `html.glass` or the field turns
  see-through again on /new (for example in the Mac app), there are two
  glass layers and the panel stops reading as the window.
- **W7. Looks right in Chrome, wrong in the app.** Blur and alpha look
  different in WebKit and over the Mac app's window. Check the eye test in
  every place people use it.

## Key insights

1. **Measure contrast at the brightest dot, not the average.** The likeness
   sits under the text, so that is the case that counts.
2. **One glass layer.** The panel is glass and everything else on /new is
   solid. That is what makes it read as a window.
3. **Floating means a clear edge all round.** Gap, rounded corners and
   shadow. The arrow tab still belongs to the panel.
4. **Phase 1 changes the look only.** Arrow tab, Esc, focus, draft and
   look-back flash behave exactly as today, and the gap adds no new way to
   close.
5. **Narrow windows are the hardest test for glass.** Check readability and
   arrow clearance there too.

## Open questions

- **Q1. Reduce Transparency:** should the panel go near-solid when the
  system asks for it? My lean: yes, if the app can detect it. Jony/Merlin
  to decide.
- **Q2. Does the gap close the panel on click?** My lean: no (one way out).
  Eraser to confirm when checking for double ways to close.
- **Q3. Real-eye check.** All of this comes from reasoning, the team's
  earlier reports and the code. Phase 2 (the user looks at the glass) is the
  real test. Ask them to read a long reply over the fully formed mark, and
  to try a half-screen window.

## Sources

- `updates/2026-11-28 FLOATING-GLASS - OPEN/00-roadmap.md` (Phase 1).
- `Reports/left-side-behaviours.md` (W2 Esc, W6 draft, W7 unreadable glass).
- `src/server/public/new-agent.html` (#sketcher, the `.88` rule, the
  under-640 px padding), `left-side.js` (`lookBack`, `closeFlash`, Esc).
- `principles/magic-ux/design-rules.md` (one way to do each thing; checks
  look at pixels).
- Engadget, how to adjust Liquid Glass in iOS 26.1:
  https://www.engadget.com/mobile/smartphones/how-to-adjust-the-liquid-glass-effect-in-ios-261-203634681.html
- Six Colors, less transparency, more contrast:
  https://sixcolors.com/post/2025/11/soaping-up-liquid-glass-less-transparency-more-contrast/
- Apple Developer Forums, iOS 26 transparency readability issues:
  https://developer.apple.com/forums/thread/811219
