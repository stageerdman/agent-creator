# Motion spec: a firefly box, a firefly message, a firefly that answers

Merlin, 2026-11-28. Built on `docs/reports/chat-firefly-behavior.md` (Columbo).
For Jony (build) and Eraser (cut review). Scope: the floating Sketcher chat
only: `#sketcher-form`, the `you` line and the `sketcher wait` line. No new
words on screen. No sound.

## 1. The story

**The person.** They sit with the cursor in the box for long stretches,
choosing words about someone they know well. Then they press Enter and look
away to the likeness. Their worry is small but real: *did it hear me, and is
it doing anything?*

**The true job.** The chat is where the witness *signals*, and Sketcher
*signals back*. Each message is a small light sent toward the portrait.

**Sources I tested** (things that do the same job: a short signal sent, and a
quiet answer while you wait):

| Source | Fit | Verdict |
|---|---|---|
| **Firefly flash talk.** Fireflies court in call and answer: one sends a flash, the other answers with its own after a pause. Silence between flashes is normal, not death. | Send = your flash. Waiting = the other firefly glowing. Work events = its answering flashes. Already the app's world (`--fly`, the Sketch dots). | **Chosen.** Needs no explaining, and it is true in nature. |
| Lighthouse and ship lamp (Morse) | The answer as a blinking lamp | Too loud and too regular. Blinking for 40 s looks like an alarm. Cut. |
| Paper lantern let go on water | The send as a lantern drifting away | It drifts *away*. Our message must *arrive* and stay. Cut. |
| Ember blown into a flame | The thinking state as an ember | Fire means burning and danger next to "files changing". Cut. |
| Pneumatic tube in an old office | A sent message that whooshes up into a slot | Fun once, mechanical the 100th time. It's a different world from the studio. Cut. |
| Breath on cold glass | A glow that comes with the breath while you think | Lovely for the box, but it's a second metaphor. Kept only as the *feeling* of the resting glow. |

**The world, in one line:** the box is a firefly waiting for you. Enter sends
your flash up to the log, where it becomes your line. Sketcher's firefly glows
softly beside "Sketching…" and gives one answering flash each time it really
does something.

- **Action:** a flash sent (the send flight).
- **Success:** the flash lands and *is* your line. The `you` bubble is
  already lime-tinted (`rgba(216,242,106,.14)`), so the firefly turning into
  it looks natural.
- **Waiting:** a calm glow, the firefly is "there".
- **Progress:** an answering flash per real event, never per second.
- **Failure:** no light. The error is plain red text (no magic on errors).
- **Coming back:** the box glow is there, at rest, ready.

Color everywhere: `--fly` `#D8F26A` (216,242,106), the same as the Sketch
fireflies. Nothing new.

## 2. Moment A: the box glows (`#sketcher-form`)

**What it means:** "I'm listening." It stays true while Sketcher is busy (B6).

Three states. The glow is a soft halo (`box-shadow`) on `#sketcher-form`.
The form gets `border-radius: 12px` to match the box. The text, the caret and
the placeholder never change color.

| State | When | Halo | Box border |
|---|---|---|---|
| **Rest** | Panel open, box not focused | `0 0 14px rgba(216,242,106,.06)` | as today `rgba(232,239,224,.14)` |
| **Lit** | `:focus-within` | `0 0 18px rgba(216,242,106,.16)` | as today `rgba(216,242,106,.5)` |
| **Breath** | First ~10 s after focus, while not typing | halo alpha drifts `.16 → .11 → .16` | unchanged |

Timing:
- **Focus:** Rest → Lit in **180 ms** `ease-out` (limit ≤ 200).
- **Breath:** starts 600 ms after focus. **2 cycles of 4.8 s** `ease-in-out`,
  then still at Lit (≤ 3 cycles). It is the box's one hello each time you
  arrive. After that it is quiet for as long as you think (B3).
- **Typing:** any `input` stops the breath where it is and settles to Lit in
  200 ms. It doesn't start again until the next focus.
- **Blur:** Lit → Rest in **280 ms** `ease-in` (limit ≤ 300).
- **Busy:** no change, ever. There is no dimmed or "locked" look.
- **Create shown:** the halo wraps the whole form, Create included. That is
  fine, since Create is lime too. If it looks heavy, Jony may confine the
  halo to the box's row (the box's own size via `::before`). One halo either way.

**Reduce Motion:** Rest and Lit only, switched with no transition. No breath.

Weight: CSS only (one transition, one `@keyframes`, one class removed on
`input`). Builder: Jony.

## 3. Moment B: the firefly becomes your message

**What it means:** your words left the box as light and arrived. Same frame
as Enter: the box is empty and still focused (B1).

**What flies:** one 6 px `--fly` dot with a `0 0 8px rgba(216,242,106,.6)`
halo, the same look as a lit Sketch dot (`i.d.processed`). There is no text
on it. It is `aria-hidden`, `pointer-events: none`, `position: fixed` above
the panel, and never in tab order. It is removed on landing.

**Path:** from the top edge of `#sketcher-box`, 24 px in from its right edge
(the `you` bubbles sit on the right). To the right end of the new `you`
bubble, vertically centered on its first line (`bubble.right - 16px`,
`bubble.top + 18px`). A gentle arc that bows **10 px to the left** at the
middle. There's no straight-line zip, because fireflies wander.

**Timeline** (t = 0 is the accepted Enter):

```
t=0      box empties, keeps focus. The 'you' line and the 'sketcher wait' line
         are added to the log at once, as today (the screen reader hears
         them now). Both are visually held: opacity 0, class 'landing'.
         The log scrolls to the bottom, then the target is measured.
         The dot appears at the start, full brightness.
0–D      the dot flies the arc, cubic-bezier(.3,0,.2,1). It brightens a
         little in the first 80 ms (scale 1 → 1.25), then holds.
         D = clamp(220, 160 + 0.8 × distance px, 380) ms.
t=D      LAND. The dot is removed. The 'you' line shows: text at full
         opacity at once. Its lime tint starts bright (.30) and settles
         to .14 over 200 ms ease-out. That bloom is the firefly becoming
         the bubble. The wait line shows in the same frame and starts
         Moment C.
D+200    done. At most 580 ms after Enter.
```

So the text is readable at D (≤ 380 ms) and everything is still by ≤ 580 ms.
The text never moves, fades or blurs. Only the bubble's tint blooms.

**Skip the flight** (show both lines at once, no dot) when any of these hold:
`reduced`; the panel isn't `open`; `document.hidden`; the target's rect
isn't inside the log's visible rect; distance < 24 px. A flight that would
fly to nowhere doesn't start.

**"End now" paths** (each finishes the current flight in the same frame):
- **Another accepted send mid-flight** (possible after a fast failure and an
  Enter retry): the old dot is removed, its line is settled (shown, tint at
  .14), then the new flight starts from t = 0. There is only ever one dot.
- **Enter while busy:** nothing is sent, so nothing flies. Unchanged (B7).
- **Error before landing:** the dot is removed, the `you` line is removed (as
  today), and the wait line becomes the plain red error line. Nothing lands.
- **First `onText` before landing** (very fast reply): land at once, then
  replace the wait text as today.
- **Panel closed mid-flight:** land at once (dot gone, lines shown).

**Reduce Motion:** no dot and no bloom. Both lines appear at t = 0 with the
tint at .14. This is today's behavior.

**Pure helper to export and test** (in `left-side.js`):
`flightPlan({ from, to, reduced, visible })` → `null` (skip) or
`{ dur, bow: 10, landAt: dur, settleAt: dur + 200 }`. Tests: `reduced` → `null`,
`!visible` → `null`, distance < 24 → `null`, `dur` clamped to 220–380,
`settleAt ≤ 600`.

Weight: one element, one Web Animations call (or a short rAF), removed on
land. Builder: Jony.

## 4. Moment C: Sketcher's firefly answers (the `sketcher wait` line)

**What it means:** "I'm here, I'm working." It tells *working* from *stuck*
with real events, not with time (B4).

**The look:** the wait line keeps its words, **"Sketching…"**, as real text
at today's color `rgba(232,239,224,.72)`. The text never animates. One small
firefly sits before the words: `.wait::before`, a 6 px `--fly` dot, 8 px gap,
vertically centered on the text. It is a pseudo-element, so screen readers
don't see it. The live log reads "Sketching…" once, as today.

**The glow (waiting):** the dot's opacity loops **.35 → .80 → .35** over
**2.6 s** `ease-in-out`, with a halo that grows from 0 to 6 px at the peak.
That's 0.4 flashes a second, dimmer and slower than the Sketch fireflies,
so the left side wins the eye while it sorts (B5). The loop never speeds up
and never grows brighter with time. Second 50 looks like second 2.

**The answer (working):** each `onChange` (`draft` or `files`) and each
`onAllocate` gives **one answering flash**. The dot goes to 1.0 with an
8 px halo in 80 ms, then eases back into the loop by **320 ms** (limit ≤ 400).
- **Merge:** an event during a flash extends it, so the dot stays at 1.0
  until 320 ms after the last event. It never restarts mid-flash, so a burst
  of 12 allocations reads as one longer glow, never a strobe.
- Done with a class (`.wait.answer`) added on the event and removed by one
  timer. Called from the existing `onChange` and `sortFile` paths, with no
  new event plumbing.

**The end:** on the first `onText`, the `wait` class goes away in the same
frame (as today), so the dot is gone with no exit fade. On error, the line
becomes `sketcher err`: red, no dot, no glow. Panel closed: the animation
simply doesn't paint while hidden. On reopen, the dot is there only if the
line still has `wait`.

**Reduce Motion:** the dot is still at .70 with no loop. An answer is a plain
**step** to 1.0 for 320 ms, then back to .70, with no easing. The words stay
the same.

**Contrast:** the dot sits beside the text, never behind it. "Sketching…" at
.72 on the log tint (`rgba(6,9,6,.72)`) stays above 4.5:1 at every frame,
because the text itself never changes.

Weight: CSS `@keyframes` on a pseudo-element plus one class toggle. Builder: Jony.

## 5. One effect per moment

| Moment | The one effect | Not also |
|---|---|---|
| Arrive or focus | box halo brightens (+ 2 breaths) | no dot, no sound |
| Typing | none (halo holds) | no glow per key |
| Send | one dot flies and blooms into the line | no box flash, no ripple |
| Waiting | the wait dot glows slowly | no spinner, no animated dots in "…" |
| Working | the wait dot answers, one flash per event | no second spinner for tools |
| First words | the dot is gone, the words appear | no exit fade |
| Error | plain red text | no magic |

## 6. Small ideas I tried and cut

1. **A glow per keystroke** (the box flickers as you type). Noisy by the 100th
   message, and it competes with the text. Cut.
2. **The message text riding the firefly.** It breaks "no text rides on the
   firefly", and long pastes would look absurd. Cut.
3. **Several fireflies for long messages.** It means nothing extra, and it's a
   second effect. Cut.
4. **The box dims while busy.** It reads as "locked" (B6). Cut.
5. **Animated "Sketching" → "Sorting files…" → "Writing…" words.** Each change
   would be re-read by the live log, and the words would need a §6 entry.
   Cut. The flash says it without words.
6. **The wait dot drifting along the line.** Motion at the edge of sight
   during a 40 s wait. Cut. It glows in place.
7. **The landing dot leaving a short trail.** It looks nice and means nothing. Cut.
8. **The wait loop getting warmer after 20 s, "still going".** That is
   growing with time, which reads as an alarm. Cut.
9. **A tiny "tick" sound on send.** It isn't in the studio's sound world, and
   people type with music on. Cut. No sound in this spec.
10. **The wait dot flying over to the Sketch on each allocation.** It
    competes with the left side's own sorting flight (B5). Cut.
11. **The reply's first words fading in from the dot.** It holds back the
    first words (B2). Cut.
12. **A red firefly on error.** No magic on errors. Cut.
13. **The firefly flying back down into the box on failure ("returned to
    you").** Tender, but it's motion on an error, and it delays the retry.
    Cut. The text simply returns, as today.
14. **Breathing forever while focused.** It nags during minutes of thinking
    (B3). Cut to 2 breaths.
15. **The Enter key itself glowing.** There is no Enter button, and adding
    one would be dead UI. Cut.
16. **The box halo pulsing once on send as "release".** That is a second
    effect in the send moment. Cut. The flight is the release.

## 7. Next steps

**Jony (build):** sections 2–4 as written. Use `flightPlan` as an export with
tests. Use one send path (the existing submit handler), and land or cancel
the flight from its `try`/`catch` and `onText`. Add a `reduced` branch for
each moment. Check visually on Start that the halo, the flight and the wait
dot are all *visibly* there (pixels, not only classes).

**Eraser (cut review):** check each row of §5. Exactly one effect per moment,
no spinner, "Sketching…" is real text, the flight element is gone after
landing, and Reduce Motion matches each "Reduce Motion" paragraph.

**Columbo:** the open product questions from the behavior report (Enter
while busy, a lost failed message) are untouched by this spec, on purpose.
