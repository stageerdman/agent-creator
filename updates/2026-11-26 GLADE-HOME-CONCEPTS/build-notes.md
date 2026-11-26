# Glade Home concepts · build notes

Open `index.html`. It links to the three concepts, and each concept links back with **← All concepts**.

| Page | Pitch |
|---|---|
| `the-lantern-call.html` | Type a name and they flash back; the same line makes someone new. |
| `the-firefly-river.html` | Your agents stand along a river in A to Z order; past talks are moored in the water. |
| `the-night-clock.html` | Whoever you usually need at this hour is waiting under the moon. |

Each page is self-contained: no network and no build step. All three share one core (sample data, fireflies, stand-in Talk and New agent screens, drop/folder/⌘⇧N, a demo data switch and a reduced-motion toggle) and change only the Home.

**Demo bar on every page:** *First run* · *4 agents* · *12 agents* · *Reduced motion*. The pages open on 12 agents. Sample data: 12 agents (Ines and Amara are studying, Jun is new from an import), 2 sketches and 5 past talks. In the demo, "now" is 10:40.

## How to try each job

| Job | Lantern Call | Firefly River | Night Clock |
|---|---|---|---|
| Find | Type in the line (e.g. "maya"), then Return | Type a letter anywhere (e.g. "r") and the torch jumps to that tree; Return | Type anywhere (e.g. "ma"); the match gets focus; Return |
| Make new | Type a line that matches no one, then Return, or pick "or make a new agent from this line" | Type in the Landing field, then Return | Type in the hollow field, then Return |
| Bring files | "or bring a folder", drop files anywhere, or ⌘⇧N | same | same |
| See status | Ready / Studying · 18 of 30 / new here under each name; studying agents scatter light | same, on two lines | same, plus a ring of file-lights that fills in |
| Open a past talk | "Where you left off" list | A moored panel under its agent's tree | A label on the inner track, at the hour it happened |
| First run | *First run*: no rings, the line reads "Describe someone new" | An empty bank, centred Landing, "Their tree will stand across the water." | No dial, centred hollow, "They'll keep the hours you keep." |

## What I checked in a real browser

I ran an automated click-through with Playwright (`.scratch/glade/check.cjs`, kept out of git) in **Chromium and WebKit (Safari's engine)**. It covered three window sizes (**1280×800, 1440×900, 1024×768**), each with normal and reduced motion: 12 runs per page.

On each run:

- **index.html**: links to the three pages in order, and nothing overlaps or runs off screen.
- Each page opened **from the index link**. **← All concepts** goes back to `index.html`.
- **12, 4 and First run** sets: no overlap between name tags, panels, the find chip, sketches, links and the top bar, and everything sits inside the window. The river bank scrolls sideways on purpose, so the window check skips it.
- **First run**: the empty state appears with the right line for that concept.
- **Find**: Lantern "maya" + Return opens Maya's talk. River "r" puts focus on Rex, and Return opens the talk. Clock: focus is on Rex when the page opens, "ma" moves it to Maya, and Return opens Maya's talk.
- **Make new**: a line + Return opens New agent and shows that line.
- **Bring a folder**: the button is there. The file picker itself can't be automated, so I didn't open it.
- **See status**: "Studying · 18 of 30" is shown (on two lines on the River).
- **Open a past talk**: clicking one opens Talk with its last lines. **Back to Home** works.
- **Sketch**: clicking one opens a new talk.
- **Reduced motion** button: switches on and off with no errors.
- **No console errors or page errors** on any run.

Final result: **all checks passed**.

### Bugs the click-through found, now fixed

1. **Resize didn't re-lay out (all pages).** The core checked `window.Concept`, but `Concept` is a top-level `const` and never sits on `window`. It now calls `Concept.layout()` directly.
2. **Night Clock at 1024×768:** track labels overlapped the name tags of the top agents and the sketches strip. Each label now takes the first clear side of its dot, trying the inward side first. If no side is clear, it shows only the time and the title appears on hover or focus. The dial radius also leaves room for the bottom tags.
3. **Test expectation only:** the River puts status on two lines by design, so the test now accepts that.

## Where the pages differ from concepts.md

- Studying scatter: at most one burst of 3 to 5 sparks every 2 s, so it stays calm.
- Lantern: the pip sits above the input's ring mark. When typing finds someone, they flash back on a 2 s gate so they don't flicker on every key.
- Talk stand-in for a new talk reads "Talk opens here, as a new talk." The note for a studying agent reads "…She answers from those."
- River: the reflection is a stretched sprite with no canvas blur, for speed. All tags sit on one line under the largest cluster. A studying state uses two lines. A plain mouse wheel scrolls the bank. Letter posts glide with native smooth scroll. Moored panels show a day word (today, yesterday, Mon).
- Clock: agents keep a minimum gap of 2·asin(70/r), and the one nearest the moon stays at its true angle. The find chip sits left of the moon on the same row, not under it, to stay clear of the top agent. First run uses the same demo time, 10:40, not 21:10. There's no second ring, since the demo has at most 12 agents. Each track light has a transparent 28 px hit button. Amara's ring gains a file every 6 s, then merges and turns Ready. Arrival focus adds a visible outline (`ring`). Track labels drop to time-only when there's no room (see fix 2).

## Not covered

- Screen readers: I checked aria labels and keyboard paths in the code but didn't test with VoiceOver.
- Touch devices and windows narrower than 1024 px were not checked.
