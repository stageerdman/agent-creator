# 04 · Eraser — clutter check and sign-off: the 56 px cluster playground

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
