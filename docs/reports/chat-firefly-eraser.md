# Eraser cut review: chat firefly (box glow, send flight, answering wait dot)

Eraser, 2026-11-28. Reviewed: commit `e65d2d8` (Jony) in
`src/server/public/left-side.js` and `src/server/public/new-agent.html`,
against `docs/reports/chat-firefly-motion.md` §2–5.

**Goal (one sentence):** the person types a message to Sketcher, presses
Enter, and knows it was heard and that Sketcher is working, without waiting
on any effect.

## Verdict: APPROVED

One send path, one effect per moment, no spinner. The words are never
animated, and each Reduce Motion paragraph is followed. Nothing to remove.

## Step Count (the person's path, unchanged by this work)

| # | Step | Mark | Why |
|---|---|---|---|
| 1 | Click or tab into the box | Keep | The only way in. The glow adds no step. |
| 2 | Type the message | Keep | It's the job itself. The halo holds still while they type. |
| 3 | Press Enter | Keep | The only send. Create is `type="button"`, and there is no send button. |
| 4 | Read their line (shown by ≤ 380 ms) | Keep | The box is empty and focused at t = 0, so the next message can start at once. The flight blocks nothing. |
| 5 | See "Sketching…" with a glowing dot | Keep | It's real text and is announced once by the live log. |
| 6 | Read Sketcher's reply | Keep | The dot leaves in the same frame as the first words, with no exit fade. |

**Step Count: 6. Target: 6.** The magic adds 0 clicks, 0 choices, 0 waits
that block typing, and 0 new words.

## §5 rows, checked in code

| Moment | Spec: the one effect | Built | OK |
|---|---|---|---|
| Arrive or focus | halo brightens and breathes twice | `:focus-within` halo, 180 ms in and 280 ms out. `.breath` is 2 × 4.8 s after a 600 ms delay, and comes back on each focus. | ✔ |
| Typing | none | `input` removes `.breath`. There's no per-key effect. | ✔ |
| Send | one dot flies and blooms into the line | `fly()` calls `land(false)` first, so there is only ever one `.send-fly`. It's `aria-hidden`, fixed, `pointer-events: none`, and **removed** on land, close, error, fast reply or restart. The 200 ms bloom changes only the `you` background. There's no box flash and no ripple. | ✔ |
| Waiting | the wait dot glows slowly | `.wait::before` loops .35 → .8 → .35 every 2.6 s and never speeds up. The "…" isn't animated. | ✔ |
| Working | one flash per real event | `answer()` is called from the existing `onChange` and `onAllocate` paths only. A burst re-arms one timer and the class is already there, so the flash doesn't restart and there's no strobe. | ✔ |
| First words | dot gone, words appear | `onText` removes `wait`, `answer` and `settle` in one frame. | ✔ |
| Error | plain red text | `drop()` removes the dot and nothing blooms. `className = 'sketcher err'` gives no dot and no glow. | ✔ |

**No second spinner:** there is no spinner, progress bar or `aria-busy`
indicator in the panel. The wait dot is the only "working" sign.

**No second send path:** Enter calls `requestSubmit()`, which runs the one
`submit` handler. The flight is started and ended from inside that handler
(`try`, `catch`, `onText`), as the spec asked.

**Readability:** text, caret and placeholder colors never change. The `you`
text shows at full opacity on landing, and only its tint blooms. "Sketching…"
stays at `.72`, and the dot sits *beside* it, never behind it.

**Reduce Motion:** `flightPlan` returns `null`, so there's no dot, no
`landing` and no bloom, and both lines show at t = 0. `.breath` is never
added, and `#sketcher.still` turns off the form transition and animation, so
Rest and Lit switch with no transition. The wait dot holds at .70. An answer
steps to 1.0 for 320 ms (`answerHold(true)`), with no easing. Switching to
Reduce Motion mid-flight lands the flight at once (`setReduced`). All of
these CSS rules win on specificity, which I checked.

**Tests:** `npm test` shows 402 tests: 400 pass, 0 fail, 2 skipped.

## Watch for later (not blocking)

1. **Typing during a breath snaps rather than settles.** Removing `.breath`
   jumps the halo from at most .11 to .16 instead of easing over 200 ms. The
   gap is tiny, but if anyone notices a flicker, the fix is one transition.
   Don't add a second effect for it.
2. **How the merged flash is timed.** The dot holds at 1.0 for 80 ms after
   the latest event, then eases back over 240 ms. That puts it back in the
   loop 320 ms after the last event. This is a fair reading of §4. Keep it
   as one class and one timer, and don't give each event its own animation.
3. **Pixels, not classes.** No one has looked at this in a real window yet,
   me included. Per the design rules, someone should check on Start that the
   halo, the flying dot and the wait dot are *visibly* there.
4. **Don't let it grow.** Any future "status words", trails, sounds or a
   second dot for tools would reopen this review (§6, cuts 3, 5, 7, 9, 10).

Signed: **Eraser, APPROVED.**
