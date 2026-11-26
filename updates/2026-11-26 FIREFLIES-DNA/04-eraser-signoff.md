# 04 · Eraser — clutter check and sign-off

*Eraser, 2026-11-26. Checks `playground/fireflies-dna.html` (commit c047725) against `00-roadmap.md` (Phase 4), the watch-out list in `01-columbo-behaviors.md` and `principles/magic-ux/design-rules.md`.*

## Verdict: NOT YET (round 1)

The page is lean. There are no double ways to do anything and no dead controls. Two things are still wrong: one rule (B) can't be read at the first file a person adds, and one pair of labels can say something false. Both are small fixes. Fixes F1–F3 are for Jony. F1 touches Merlin's block, so the doc copy has to change with it.

## User goal

Open the file and *see* an agent's history as fireflies, then play with the four rules until they make sense, without reading a manual.

## Step count (most common path)

| # | Step | Mark | Why |
|---|---|---|---|
| 1 | Open the file; the field is alive with a seeded history | Keep | No setup, no empty state |
| 2 | Point at a light → card (name, size, time) | Keep | The only reading tool, and it reads Rules A and C |
| 3 | Click **Add file** (name and size already filled in) | Keep | Works on the first click. Enter in the name field does the same thing (form default, not a second control) |
| 4 | Click an event chip | Keep | The chip's dot is the legend |
| 5 | Click **Build embeddings** | Keep | It's the transformation moment (Rule B), and the button turns itself off when done |
| 6 | Click **Replay**, or drag the scrub | Keep | One button changes between Replay, Pause and Play, and there is no reset button |
| 7 | Move a slider | Keep | All five are in the roadmap, and each shows its effect live |

**7 steps, target 7.** Nothing to cut. Merges Jony already made, and that I agree with: topic picker folded into the folder name, legend folded into the chips, Play/Pause/Replay/Reset folded into one button, "back to now" folded into "add jumps to now", second build button folded into the button's own state.

## Clutter check

- **Double ways:** none. Scrub and Play move the same cursor, but one is direct and the other is automatic, which is the standard media pattern. Ticks are not clickable, so they don't compete with the scrub.
- **Unneeded controls:** none. The footer count ("87 lights · 12 files · 12 events") is read-only. It earns its place because it shows Rule A in numbers when you move the size sliders.
- **Confusing magic:** none, apart from F1. The newest-item glow, the build wave in time order and the spark half a second after releasing Chain strength all explain themselves.

## The four rules: can each be seen on its own?

| Rule | Seen? | How I checked |
|---|---|---|
| A · size → seed head | Yes | 900 B is one spark, 1.4 GB is the biggest head (~19 dots), and the size output reads 0 B to 5 GB |
| B · embedding colour, similar alike | **Partly, see F1** | recipes ≈141°, garden ≈177°, letters ≈242°, but the 4th topic (travel) ≈120°, only ~20° from recipes |
| C · event colours + replay/scrub | Yes | Coral 6°, rose 322° and gold 46° are far from the cool arc (110–280°) and plain (72°). Replay takes 16 s, scrub shows the date, later ticks dim |
| D · blinks follow time + chains | Yes | Close items blink together. The first spark comes 6–12 s after open, and chains stop at ≤25% of lights |

## Watch-out list (01), one by one

| Item | Result |
|---|---|
| Performance, 300 and 600 lights, while scrubbing | **Pass.** 642 lights while dragging the scrub end to end: 60 fps in Chrome and in WebKit, worst frame 17–18 ms. Jony's run: 672 lights at 60 fps |
| Cyclic-looking blinks | **Pass** (by the code). Each pass gets a fresh random lead and Gaussian jitter, with a floor of 0.15 even at Randomness 0 |
| Colours too alike | **Fail → F1** |
| Strobing | **Pass.** Each light blinks once per pass, and a pass is ≥2.5 s plus 0.9 s, so a light flashes under 0.3 times a second. At 4× the pass is a wave across the field, not a whole-field flash |
| Reduced motion | **Pass.** No drift and no burst (newcomers fade in). Blinks are softer and slower, and chains are stretched ×1.6 with no growth. Checked in code and with `reducedMotion: 'reduce'` |
| Endless or field-wide chains | **Pass.** Capped at 4 + 36 × strength lights and ≤25% of the field, and ≤6 steps |
| Edge sizes | **Pass.** 0 B is one small dot, and 5 GB stays within the cap |
| Forgotten tab | **Pass.** rAF pauses when the tab is hidden, and drift is bounded (±6.4 px around a fixed spot) |
| Looks like real data | **Pass.** The lede says "A made-up history", and the names are clearly invented |
| Console | **Empty** in Chrome and WebKit, normal and reduced motion (Jony's 19 checks rerun, all pass) |

Columbo's open question, "Should hover highlight the whole file family or only the dot?": the page lights all dots of the hovered *file*, not the whole topic. That's the right amount. Lighting a whole topic on every pointer move would be noisy.

## Fixes for Jony

- **F1 · Fourth topic collides with the first (Rule B).** `topicBase` puts the k-th named topic at `(0.15 + k·0.618) % 1`, so k = 3 lands at the bottom of the arc (q ≈ 0.06 → ~120°), next to k = 0 (~141°). The first suggested file is `travel/…`, so the **very first file a person adds** turns the same green as recipes. Rule B fails at its first test. Target: the first 4 topics are ≥ 40° apart. Topics 5–7 may sit closer (≥ 20°). From the 8th topic on, golden steps continue and the name on the hover card tells topics apart (only about 150° is usable). *Correction after Jony's question:* changing the start value can't reach this target. The arc doesn't wrap (hue ≈ 110 + 170·q, q in 0.06–0.94, so about 150° is usable), and golden steps always leave a gap of 0.146 (≈ 22°) once there are 4 topics, whatever the start. Use a fixed slot list for the first topics instead, for example `[0, 0.67, 0.33, 1, 0.5, 0.17, 0.83]` then golden after that. Four topics then sit about 50° apart and the 5th about 25° away. This lives in Merlin's block, so change it in `02-merlin-magic.md` and paste it again (check 1 needs them byte-identical). Ask Merlin if you'd rather not touch it yourself.
- **F2 · Min/Max labels can lie.** The ranges overlap (min 0.75–4, max 2–9). Setting Min 4 and Max 2 shows "4.00 px | 2.0 px", and the code quietly swaps them. Fix with zero logic: ranges that can't cross, for example Min 0.75–2.5 and Max 2.5–9.
- **F3 · Doc says more than the page does.** `03-jony-build.md` → "Hover and tap" says pointing "lights up its whole family". The page (correctly) lights the whole *seed head of that file*. Change the doc's wording to match the page.

Watch item, not blocking: with big Max dot sizes, a seed head near the edge can spill past the 44 px padding and be clipped. If it bothers anyone, keep `it.rad` inside the field in `place()`.

## Recheck (after Jony's pass)

*Pending.*

## Sign-off

*Pending — NOT YET until F1–F3 are in.*
