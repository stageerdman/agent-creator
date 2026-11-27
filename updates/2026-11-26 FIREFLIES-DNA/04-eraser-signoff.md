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

## Recheck (round 2, at integration)

*Columbo (captain) made F1–F3 at integration, because Jony's pass had not landed yet, and rechecked them against the targets above.*

| Fix | Change | Result |
|---|---|---|
| F1 | `topicBase` uses the fixed slot list `[0, 0.67, 0.33, 1, 0.5, 0.17, 0.83]` for the first 7 topics, then golden steps. Changed in `02-merlin-magic.md` (code and prose) and pasted into the page | **Pass.** Measured hues (3 files each): recipes ≈120°, garden ≈163°, letters ≈223°, travel ≈270°, so the first 4 are 43–59° apart. Topics 5–7 (≈198°, ≈143°, ≈248°) are each ≥20° from their nearest neighbour. The first file a person adds (`travel/…`) is now clearly its own colour |
| F2 | Min dot size 0.75–2.5, Max dot size 2.5–9 | **Pass.** The ranges can't cross, so the labels can't lie |
| F3 | `03-jony-build.md` now says pointing lights "every dot of that file's seed head (not the whole topic)" | **Pass** |

Browser checks rerun after the fixes (`checks/run.cjs`): 19/19 in WebKit (672 lights, 61 fps) and 19/19 in Chrome (672 lights, 60 fps). The console is empty in both, with normal and reduced motion. Check 1 confirms Merlin's block is still byte-identical to his doc.

## Recheck (round 3, Jony's pass on main's rewritten page)

*Eraser, 2026-11-27, on Jony's `6dd9c07` (main merged in at `e6261fc`), merged into this branch. Main had rewritten `playground/fireflies-dna.html` into the 56 px cluster page, so Merlin's `<script id="dna-magic">` block and old check 1 no longer exist. The current check is `updates/2026-11-26 FIREFLIES-DNA-CLUSTER/checks/run.cjs`.*

| Fix | What is in the code | Result |
|---|---|---|
| F1 | `FIRST_SLOTS = [0, .67, .33, 1, .5, .17, .83]`, then golden steps. It's the same in `playground/fireflies-dna.html:160`, `src/server/public/fireflies-dna.js:42` and `02-merlin-magic.md:360`. Merlin's comment now gives the reason (150° arc) | **Pass.** run.cjs, Chrome and WebKit: the first 4 topics are at least **49°** apart, and all 7 are at least **24°** apart. My target was ≥ 40° for the first 4 and ≥ 20° for 5–7, so main's slots meet it. Jony's question: **keep it as it is.** "Five at ≥ 35°" was never my target. It would cost the 7-topic spread, and the hover card names a topic anyway |
| F2 | Both sliders run 2–9 and push each other (`fireflies-dna.html:450-451`). Merlin's table now says this | **Pass.** Setting Min to 8 pushes Max to 8, and pulling Max to 2 pulls Min to 2. The labels read 2.0 / 2.0, so they can't say something false. This is better than my suggestion: one range, no logic hidden from the user |
| F3 | `03-jony-build.md:37`: "every dot of that file's seed head (not the whole topic)" | **Pass** |

**Step Count:** no change in this pass, which only touched the docs. The page's path is still name → Size → Add, with the same control set (agentName, fname, fsize, minR, maxR, Add, ×).

**The 8 run.cjs failures (the same 112/120 in both browsers) are stale expectations, not regressions.** They assert the Update 2 behaviour that two later sign-offs replaced on purpose. (1) Reduce Motion now lights 1 dot per frame about 66 ms apart, not one file per step (see "Reduce Motion pace", `c5ecc57`). That accounts for the 2 reduce-pace fails. (2) Each file now blinks on its own beat, and nothing blinks while files are landing, instead of a whole-cluster idle beat (see "Per-file blink", `502662e`). That accounts for the 6 U2 pixel probes. I reran the checks that replaced them on this page in WebKit: **`eye-check.cjs` PASS** (Reduce Motion lights 13 separate dots 66 ms apart with no pop; normal mode runs about 90–100 ms apart; 60 MB = 60 dots, then glow) and **`blink-check.cjs` PASS** (gaps 617 / 1165 ms match the rule, same moment means same frame, no blink while landing, Reduce Motion has 0 rises). The console is clean. Updating run.cjs is filed in `issues.txt`.

`npm test`: 225 pass, 0 fail, 1 skipped. Chrome headless dropped out mid-run here as well (already in `issues.txt`), and the script restarted those parts. The page logged no errors.

## Sign-off

**APPROVED (round 3)**: Eraser, 2026-11-27, on `6dd9c07`. F1–F3 hold on main's page. Nothing to cut.

**APPROVED.** All four rules can be seen and played with, there's no clutter, it runs smoothly at 600+ lights, and it respects reduced motion. The non-blocking watch item (big heads clipped at the edge) stays open.

## Recheck (round 3, on main's rewritten page, commit 6dd9c07)

*Main rewrote the page after round 2 (no `dna-magic` block, cluster avatar). Jony rechecked F1–F3 there. Eraser approved by reading the page and took Jony's run results as reported.*

| Fix | On main | Result |
|---|---|---|
| F1 | `FIRST_SLOTS [0,.67,.33,1,.5,.17,.83]`, the same in the page, `src/server/public/fireflies-dna.js` and Merlin's doc | **Pass.** First 4 topics 49° apart, 7 topics 24° apart. Kept on purpose: on the ~150° cool arc, five at ≥35° would push seven below 20° |
| F2 | The two sliders (both 2–9) push each other | **Pass.** Min 8 pushes max to 8, max 2 pulls min to 2, labels read 2.0 / 2.0. Merlin's table updated to match |
| F3 | The Hover text says "every dot of that file's seed head" | **Pass** |

Checks (`FIREFLIES-DNA-CLUSTER/checks/run.cjs`): 112/120 in Chrome and 112/120 in WebKit, with the same 8 failing in both, all outside round 1. Six are U2 pixel probes that still expect a cluster-wide beat; the check is out of date and Eraser will update it. Two are the Reduce Motion pace, now **F4**, a new item (60 ms per dot with no per-file cap means Reduce Motion users wait longest). `npm test`: 225 pass, 0 fail, 1 skipped.

**APPROVED (round 3)** for F1–F3. Watch: past 7 topics the golden-step hues start to crowd together.
