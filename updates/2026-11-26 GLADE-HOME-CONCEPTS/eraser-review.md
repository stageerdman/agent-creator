# Eraser review · Glade Home concepts

*Eraser, 2026-11-26. Checked `index.html` and the three pages against `home-brief.md`,
`concepts.md` and `principles/magic-ux/`. For Jony. Merge decisions stay with Columbo.*

**Goal (one sentence):** the returning user gets from Home into Talk with the person
they have in mind in one click or less, and a first-run user starts their first agent
without being told how.

**What I looked for:** two ways to do the same thing, elements that do nothing, magic
that hides or confuses a job, and UJ1 / UJ12 jobs more than one click away.

**Verdict: RETURNED.** All three are lean on the main path. There are 7 cuts below.
Each is small. Reworking is Jony's job. I sign off once every cut checks out in a browser.

---

## Step counts (most common path: returning user, "I need Rex")

| | Lantern Call | Firefly River | Night Clock |
|---|---|---|---|
| Steps now | 3: read the ring, type "re", Return (or 2: spot Rex, click) | 2: spot Rex in A→Z, click. **3 at 1024 px** if he's off-screen (scroll, spot, click) | 1: Return (Rex is pre-focused). Someone else: 2 (spot, click) |
| Target | 2 | 2 everywhere | 1 / 2 |
| First run (UJ1) | 1 focused line + folder link, nothing else ✓ | Landing focused + folder link ✓ | Hollow focused + folder link ✓ |
| Open a sketch (UJ12) | 1 click ✓ | 1 click ✓ | 1 click ✓ |
| State in words (UJ12) | ✓ | ✓ (wraps onto two lines, same words) | ✓ |
| Rename / delete on Home | none ✓ | none ✓ | none ✓ |
| `index.html` | Clean. Each card is one link; "Open →" sits inside it, so it's not a second target. No cuts. | | |

---

## 1 · The Lantern Call

| # | Element | Mark | Why |
|---|---|---|---|
| L1 | `.ring-mark`, the hollow circle inside the input | **Cut** | It does nothing. It looks like a radio button or a search icon, so people click it and nothing happens. The pip above the panel is already the lantern's light. Two lantern marks is one too many. |
| L2 | `or make a new agent from this line` (shown with 3+ words and a match) | Keep | It's the only way out when a description contains a name ("like Rex but kinder"). It's rare and only shows up when it's needed. |
| L3 | `Where you left off` (3 talks) | Keep | Pick up a talk in 1 click, as the brief asks. |
| Watch | The inner ring is ordered by recency, so Rex's spot moves between visits | — | Fine for this concept, since finding means typing. If it ships, say plainly that the spots move. |

**Cuts for Jony: L1.**

## 2 · The Firefly River

| # | Element | Mark | Why |
|---|---|---|---|
| R1 | Letter posts (`#posts`) | **Cut** | That's two ways to do the same thing. Typing a letter already jumps to that tree and focuses it. At 1024 px the posts show up for 12 agents, and with 10 posts for 12 trees each post mostly repeats the name right under it. A plain mouse wheel already scrolls the bank. Remove the posts and their code. Don't leave a hidden placeholder either: the rule is that only *later features* get a `hidden` spot. |
| R2 | The bank scrolls sideways at 1024×768 with 12 agents (min tree width 96 px, so it needs 1200 px) | **Cut the scroll at 12** | Sol and Theo sit off-screen, so opening them takes 2+ steps. That breaks UJ12 "one click on any agent". A cluster is about 64 px wide, so 12 trees fit in 1024 px at about 80 px each. Lower the minimum so 12 agents always fit in a 1024 px window. Keep the scroll only for counts that really can't fit. |
| R3 | First-run line `Their tree will stand across the water.` | Keep | It's one quiet line, and it tells you what the empty band is for. Without it, the bare bank looks broken, and that's the brief's first worry. |
| R4 | Moored talks plus crossing lights, both in the water | Keep, watch | They mean different things (pale and still = a talk you can click; green and moving = files on their way, not clickable). Colour, motion and the panel set them apart (from reading the code), so they stay. If a test shows people clicking the crossing lights, cut the crossing first. |

**Cuts for Jony: R1, R2.**

## 3 · The Night Clock

| # | Element | Mark | Why |
|---|---|---|---|
| C1 | `.tk.short`: on short windows, track labels show only `09:50` and the title appears on hover | **Cut** | This is magic hiding a job. "Pick up the job offer talk" turns into hovering dots to find out what they are. Keep the title visible at every size. Truncate it with an ellipsis, or move the label to a clear side, but never drop it down to just the time. |
| C2 | Inner track shows only the **last 24 h** | **Cut the 24 h rule** | Monday morning after a weekend means an empty track, so picking up a talk takes 2–3 clicks. The brief warns about exactly this ("Past talks buried"). Show the 4 most recent talks at their hour, whatever the day. Give older ones a day word (`Chapter 2 structure · Mon 09:20`). |
| C3 | Type-to-find drops spaces (`/\S/`), and a no-match find is a dead end | **Fix** | With Rex pre-focused, someone who starts typing a description ("a blunt editor") gets `No one called “Abluntedito…”`. That's wrong text, and it leaves them nowhere. The smallest fix: keep the spaces in the chip, and when nothing matches, the chip says `No one called “a blunt editor” · Return · make a new agent`, and Return opens Make with that line. This doesn't add a second maker. It reuses the line they already typed, so they don't have to click into the hollow and type it again. |
| C4 | First-run line `They'll keep the hours you keep.` | **Cut** | On first run the dial is hidden, so "the hours" points at nothing on screen. It's a riddle, not a pointer. The moon and the `New agent` panel are enough, as Merlin said. |
| C5 | Rex is focused on arrival | Keep | It makes the most common visit one step: Return. The focus ring is visible, and nothing opens by itself. |
| C6 | Progress ring + scatter + words, three signals for studying | Keep | The words carry the truth, and the ring adds *how far along*, which the scatter can't show. It never blinks. |

**Cuts for Jony: C1, C2, C3, C4.**

---

## Cut list (what I'll check in the browser)

| Cut | Page | Done? |
|---|---|---|
| L1 · Remove `.ring-mark` from the lantern input | Lantern | ☐ |
| R1 · Remove the letter posts (markup, CSS, code) | River | ☐ |
| R2 · 12 agents fit in 1024 px, no sideways scroll | River | ☐ |
| C1 · Track titles always visible (no time-only labels) | Clock | ☐ |
| C2 · Track shows the 4 latest talks, any day, with a day word when not today | Clock | ☐ |
| C3 · Find keeps spaces, and a no-match find offers `Return · make a new agent` | Clock | ☐ |
| C4 · Remove the first-run line `They'll keep the hours you keep.` | Clock | ☐ |

Update `build-notes.md` with what changed. **Status: RETURNED to Jony.**
