# 04 · Eraser — clutter check and sign-off: the 56 px cluster playground

## Update 2 (2026-11-26): pace lighting, 1 dot per MB, density at 56 px

File checked: `playground/fireflies-dna.html` (Jony, commits 2a8e86f + 5f3d08b).
Checks: the same `checks/run.cjs`. It now runs **120 checks**: the 45 earlier ones,
plus 2 code checks and 73 Update 2 checks. Four of the earlier checks were rewritten
because Update 2 changed the rule they tested (as Jony's notes asked):
"one dot per file" became "dots = sum of ceil(MB)"; "bigger file → bigger dot" became
"bigger file → more dots, full dots one size, last dot no bigger"; "radius within
min–max" became "radius between the 2 px floor and max"; and the 7-topics check now
waits for the queue first. Everything goes through `window.dna` (`addFiles`,
`queueIdle`, `dotCount`, `litOrder`, `getDots`). The pixel checks use a probe that
copies the avatar every frame and counts how many old dots are bright at once.

### Goal
Watch an agent's cluster grow as files arrive: each file lights as its own burst,
in the order it was added, and how much a file holds can be read at 56 px.

### Step count (most common path)

| # | Step | Mark | Why |
|---|------|------|-----|
| 0 | Open: the cluster is already lit, and the first beat comes at 400 ms | Keep | Zero steps |
| 1 | Add a file (**Add**, or `addFiles` for many) | Keep | One step. The pace, order and dot count all come from the files themselves |
| — | Watch it light | — | Takes no step. There's no play button, speed control or replay, and none is needed |

Current: **1 step per change, 0 to first view.** Target: the same. Update 2 added
no control, no choice and no setting. It took one away: the hover flash.

### Clutter
- **One way to trigger the animation.** Only two things in the code start a flash: a dot
  landing and the idle beat. The page listens only to `change`, `input`, `submit` and `click`.
  There are no hover, pointer or focus triggers. In pixels: hovering the row and focusing
  the name lit **0 %** of the dots.
- **No full-cluster flash while files arrive.** When 4 files were added, **0 %** of the old
  dots were bright at the same time across 140 frames. When idle, the beat lights
  **100 %**, which shows the probe really sees flashes. The beat comes back after the queue.
- **No glow hiding the pace.** At 60 dots or fewer, empty space stays at alpha **0/255**
  while files arrive. Glow only starts past 60 dots, and the note says so.
- **Nothing is double.** `addFile` (the UI) and `addFiles` (a drop of many) use the
  same queue, so there's one pace and not two.

### Results: Chrome and WebKit, 120/120 each

| Check | Chrome | WebKit |
|---|---|---|
| All 45 earlier checks (4 rewritten for 1 dot per MB, see above) | ok | ok |
| Code: no hover/pointer/focus trigger; only 2 places start a flash | ok | ok |
| Dot count = sum of max(1, ceil(bytes/1 MiB)): 20 MB→20, 300 KB→1, 0 B→1, 1 MiB→1, 1 MiB+1 B→2, 3.2 MB→4; total 12 + 29 = 41; a duplicate id is skipped (normal + reduced) | ok | ok |
| Lit grouped by file, in added order, litAt strictly increasing, never two files at once (smallest gap 125 ms in a 6-file drop) (normal + reduced) | ok | ok |
| Normal pace, 2-file drop: 90 ms between dots, 250 ms between files | 90 / 250.0 | 90 / 250.0 |
| 40 MB file: 40 dots in | 2400 ms | 2400 ms |
| 15 files queued: all lit, in order (normal / reduced) | 2.31 s / 1.59 s | 2.31 s / 1.59 s |
| Reduced: each file in one step (span 0.002 ms), 250 ms kept between files | ok | ok |
| Density, no overlap, r ≥ 2 px, inside 0–56 with flash growth: 12 dots (r 2.37–4.94, gap 0.25 px), 20 (2.00–3.94, 0.48), 40 (2.00–2.89, 0.27) (normal + reduced) | ok | ok |
| Past 60: 61 and 90 dots → 60 placed, no overlap, the glow note shows; at 40 or fewer, no note | ok | ok |
| No full-cluster flash on add (0 %); idle beat 100 %; empty space alpha 0 | ok | ok |
| First beat on open lights the cluster (ms after navigation, load included) | 518 | 857 |
| First beat after rename (400 ms beat + 120 ms rise) | 481 ms | 461 ms |
| Hover and focus on the row: no flash | 0 % | 0 % |
| Console clean, every page | ok | ok |
| Start: `npm test` 147 pass, 0 fail (1 live test skipped); the app server answers `GET /` 200 "Agent Creator" (no app code changed in Update 2) | ok | — |

Findings for Jony: **none.** No F items, so there was nothing to recheck.

Note on Chrome: in this environment the whole headless Chrome browser sometimes
quits mid-run (seen again today). The script now reruns a block whose browser
dropped, up to 3 times, in a fresh browser, and throws away that block's partial
results. The final Chrome run passed 120/120.

### Watch later (when this moves into agent-home.html)
- **Hurry starts at 4+ waiting files.** A 6-file drop runs at half pace (45 ms steps,
  125 ms gaps). It still reads file by file. Don't lower the threshold again.
- **The "Past 60 dots…" note** is playground text. In the real home row, the glow
  has to explain itself or say nothing. Don't add a caption under a 56 px avatar.
- **Partial last dots** go to glow once past 60, so a 1.5 MB file can show only one
  spot. That's fine, but don't add a counter to "fix" it.
- Keep `addFile` and `addFiles` on the one queue. A second path with its own timing
  would be a second way to animate.

### Sign-off (Update 2)
**APPROVED**: Eraser, 2026-11-26. Chrome and WebKit, normal and reduced motion,
**120/120** each. One step per change and nothing to cut. The pace is the only
animation you see when files arrive.

---

## Earlier round

File checked: `playground/fireflies-dna.html` (Jony, commit 03ae8fd).
Checks: `checks/run.cjs` (run from the repo root:
`node "updates/2026-11-26 FIREFLIES-DNA-CLUSTER/checks/run.cjs" chrome|webkit`,
needs `npm install --no-save playwright-core`; screenshots go to `.tmp-test/shots-cluster/`).

## Goal
See what an agent's 56 px avatar cluster looks like for its files, and watch it
change as files come and go.

## Step count (most common path)

| # | Step | Mark | Why |
|---|------|------|-----|
| 0 | Open the page: the cluster for a sample agent is already alive at 56 px and in the preview | Keep | Zero steps to the main thing |
| 1 | Add a file: press **Add** (name and size are prefilled with a suggestion) | Keep | Works on the first press. Typing a name or moving Size is optional |
| 2 | Remove a file: press its **×** | Keep | One click. No confirm, because this is a playground and nothing is lost |
| 3 | Change dot size: drag **Smallest** or **Largest** | Keep | The two sliders push each other, so they can't cross and there's no error to read |
| 4 | Try another agent: type a name in the row | Keep | The name is the seed. It's the same place the name sits in the real home row |

Current: **1 step per change, 0 to first view.** Target: the same. Nothing left to cut.

## Clutter
- No map, replay or timeline: none in the UI, none in the code, and no hidden "later" markup.
- Controls: name, Files (× per file, one Add with name and size), Smallest and Largest. That's all. The topic legend is read-only and comes from the folder name, so there's no colour picker and no second way to set a topic.
- There's one way to do each thing: one Add, one × per file, one pair of size sliders.
- Magic kept: a flash on hover or focus of the row (no button, no control), arrival from just outside the cluster, and the first beat at 400 ms. None of these adds a control or a choice.

## Results: Chrome and WebKit, 45/45 each

| Check | Chrome | WebKit |
|---|---|---|
| No map, replay or timeline in the code; no hidden placeholders | ok | ok |
| Avatar 56×56 in a home-style row; preview 224×224 | ok | ok |
| Only these controls: name, files (add + × per file), Smallest, Largest | ok | ok |
| One dot per file; sample set of 14 loaded | ok | ok |
| Bigger file → bigger dot; every radius inside min–max; a wider range spreads the sizes | ok | ok |
| Min and max can't cross (hook swaps 7,3 → 3–7; sliders push each other; labels follow) | ok | ok |
| Same topic → same colour; first 4 topics ≥ 40° apart (min 49°); 7 topics ≥ 20° apart (min 24°) | ok | ok |
| Compact: every dot, with flash growth, inside 0–56; cluster spans 42×37 px; the avatar's 1 px edge stays dark for 2 s of motion | ok | ok |
| Four names → four clusters (closest pair 13 px apart on average); the same name gives the same cluster | ok | ok |
| Add → one more dot, other dots keep their direction (zoom, no reshuffle); duplicate refused; remove → one fewer; UI Add and × work | ok | ok |
| Normal: the avatar moves. Reduced motion: still, a new file shows at once, then still again | ok | ok |
| Narrow (390 px): no sideways scroll | ok | ok |
| Console clean (normal and reduced) | ok | ok |

Note on Chrome: in this test environment headless Chrome sometimes closes its
tab after 15–30 s, even on `about:blank` (checked with a soak test), so a run
can stop early. That comes from the environment, not the page. Two full Chrome
runs passed 45/45.

## Watch later (Phase 2, agent-home.html)
- With many files (17+) and the dim resting alpha (.12), the 56 px cluster reads mostly on the beat. Check that it still reads in a row of real agents.
- A new file arrives from 1.35–1.5× its place. On an outer slot that can start just past the avatar edge. That's fine as "flying in", but don't add a clip mask or an extra frame to hide it.
- Keep the name as the only seed, so the row and the profile show the same cluster.

## Sign-off
**APPROVED** — Eraser, 2026-11-26. Chrome and WebKit, normal and reduced motion. Nothing is left to cut.

## Reduce Motion pace + 60 MB slider (item 9e390bf9) — eye check

**Checked commit:** `c5ecc57` (on `origin/main`), file `playground/fireflies-dna.html`.
**How:** `checks/eye-check.cjs`. A fresh browser for each run, with no cache or old tabs, at 1280×800.
Reduce Motion was emulated on once and off once. The check never reads the test hooks.
On every animation frame (about every 16 ms), it reads the 224 px preview canvas pixels and
counts the bright dot centres. All input goes through the real UI: × to clear, then the name field,
the Size slider and Add. As a control, the same check run on the old page (`5f3d08b`) fails:
with Reduce Motion on, 12 dots show up in one frame (33–44 ms → 12), and the slider reads "100 MB".

Step Count for the user is unchanged. It is still: name → Size → Add. There are no new controls.

| Check | Chrome | WebKit |
|---|---|---|
| a) Reduce Motion on: a 12 MB file's dots appear 1 per frame, in order, median 66 ms apart (13 separate arrivals, never 2+ in one frame) | ok | ok |
| a) No flash growth or pop: bright area never swells between arrivals; each dot is ≥ 0.98 of its peak brightness on its first frame | ok | ok |
| b) Reduce Motion off: still one by one, median 84 ms apart (same as before the fix) | ok | ok |
| c) Size slider at its max reads "60 MB"; one max file shows 60 dots; three max files still show 60 dots, and the note says extra MB adds glow | ok | ok |
| d) Controls are the same set as before (agentName, fname, Add, fsize, minR, maxR, × per file). No second way to add or size anything | ok | ok |
| Console clean | ok | ok |

Chrome note: one normal-mode Chrome run flagged a 3-dot jump. That was the detector, not the page:
overlapping landing flashes hid one dot's peak for a moment, and the same thing (a 2-dot jump)
shows on the old page, whose normal path this diff doesn't touch. A rerun gave 13 separate
arrivals. Headless Chrome also drops out at random here (see the note above), so the check
restarts a mode when that happens.

### Watch
- **The user's folder is not pulled yet.** `/Users/stage/dev/agent-creator` is still at
  `57080be` (its page is the `5f3d08b` version), with `max` reading 100 MB and all dots lighting at once.
  A plain `git pull` there should fast-forward cleanly (pull item 0620de8d is waiting for an owner). Until that folder pulls `origin/main`, the
  user opening `file:///Users/stage/dev/agent-creator/playground/fireflies-dna.html` sees the
  old page. That gap is how this goal started.
- The readout rounds: "12 MB" can be 12.4 MB and show 13 dots. That's a one-dot gap, not a cap
  issue. If "N MB = N dots" ever has to be exact, round the readout up.

**APPROVED** — Eraser, 2026-11-26, on `c5ecc57`.
