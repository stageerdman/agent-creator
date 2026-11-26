# Eraser review · Glade Home v2

*Eraser, 2026-11-26. I checked `index.html` and the three pages from commit `daf915f` against
`brief.md`, `concepts.md`, `build-notes.md` and `principles/magic-ux/`. I tested them in Chrome
(Playwright) at 1024×768 with 1, 12 and 50 agents, and I also read the code. For Jony. Reworking
the pages is Jony's job.*

**Goal (one sentence):** the user leaves Home in seconds, either starting a new agent or inside
Chat or Edit with the person they had in mind.

**Verdict: APPROVED after cuts** (see *Sign-off* at the end). *First pass: RETURNED.* All three keep Home to two jobs, and the step counts meet the brief at
1, 12 and 50. There are 5 page cuts (1 in A, 4 in C) and 1 repo cleanup (T1). **B passes as it is.** Each cut is small. I sign
when each one checks out in a browser.

---

## 1 · Only two actions on Home, nothing competing

Measured at 1024×768. I counted the clickable things on Home, demo bar not included.

| | A · Path | B · Field Guide | C · Groves |
|---|---|---|---|
| Kinds of target | New agent · agent row · Chat · Edit | New agent · card (= Chat) · Edit | New agent door · row (= Chat) · Edit |
| Buttons at 1 / 12 / 50 | 4 / 15 / 53 | 3 / 25 / 101 | 3 / 25 / 101 |
| Past talks, sketches strip, clock, status show | none ✓ | none ✓ | none ✓ |
| Something that looks clickable but isn't | none | none | **Find chip is a bordered box** (C4) |
| Text that invites the wrong action | none | none | **Door asks "Who do you have in mind?" with nowhere to type** (C3) |

## 2 · Duplicates and clutter

- **One New agent door** in each. Dropping a folder lights that same door. ✓
- **A:** the row and the clearing show the same name and role. That's the concept's preview, not a second way to do anything. At 1 agent, clicking the row does nothing (it's already chosen). *Watch*, no cut: it costs nothing.
- **B and C:** the word `Edit` shows 50 times at 50 agents. It's quiet text and the brief wants Edit visible. *Watch*: if a test shows it reads as noise, show it on the hovered or focused row only. Don't make it hover-only before a test says so.
- **C:** "Who do you have in mind?" is on the door **and** on the New agent screen, so the same words do two jobs (C3). The planted line sits **inside** the New agent button (C2).

## 3 · Find and open at 50: steps and time

A step is one click, one key, or one typed word. Times are rough estimates (point and click about 1.1 s, a 3-letter word about 0.6 s, a glance to decide about 1 s).

| Task at 50 | A · Path | B · Field Guide | C · Groves |
|---|---|---|---|
| **Chat with the latest** (Rex) | 1 (`Chat`, or `Return`) · ~1 s | 2 (spot Rex in col 4, click) · ~3 s | 2 (Writing, click Rex at top) · ~2.5 s |
| **Chat with a recent one** (Tony) | 2 (row, `Chat`) · ~2.5 s | 2 (spot, click) · ~3 s (`today` marks help) | 2 (Work, click) · ~2.5 s |
| **Chat by role** ("the contract one") | 2 (`con`, `Return`) · ~2.5 s | 2 (`con`, `Return`) · ~2 s | 1–2 (Work → Amara, or `con` `Return`) · ~2.5 s |
| **Edit** (Vera) | 2 (`ver`, `Edit`) · ~2.5 s | 1 by eye / 2 typed · ~3 s | 2 (Writing, `Edit` on Vera) · ~3 s |
| Brief limit | ≤ 3 steps, < 5 s ✓ | ✓ | ✓ |

No path needs "scroll and look". A's list scrolls at 50 but nothing has to be found by scrolling, because typing filters it. B and C fit with no scroll. **But C cuts roles to 10–12 characters at 50** (`Contract law…`, `Startup boar…`, `Imported fro…`, the name `Untitl…`). Finding by role by eye is C's whole idea, and the brief's first warning is opening the wrong agent. That's cut C1.

*Push from Merlin: is A's preview worth the extra click?* Yes, for now. The latest agent is still 1 step, and the brief allows ≤ 2. Opening the wrong agent is cheap (Esc), so A's preview is close to an "are you sure?" step. If A is chosen, test it: if people rarely change their mind in the clearing, a row click should open Chat.

## 4 · Works at 1 and 12

- **1 agent:** Chat in 1 step and Edit in 1 step in all three. The Find chip is hidden. ✓
- **12 agents:** all visible with no scroll in all three. 1 step to Chat in B and C, 2 in A. ✓

## 5 · Truly different, no centred search bar

Each one differs in layout (list + clearing / A–Z sheet + bottom gate / side door + grove columns), in how you find (recency filter / place + dim / need + dim) and in where New agent lives (first row / bottom strip / left side). None has an input or panel in the centre with agents around it. The Find chip sits top-left in all three. ✓

## 6 · The magic is quiet

| | Moment | Mark | Why |
|---|---|---|---|
| A | **They answer**: a flash on the chat header mark as Chat opens | **Cut (A1)** | Team rule (`world-and-words.md`): *Daily Talk is never slowed: no motion before the first words.* This flash plays on every chat, before the first words. On the 100th visit it's just a blink in the way. |
| A | Trailhead lights while a folder is held | Keep | It tells the truth about where the drop goes, and it only plays when you act. |
| B | Dusk: the rest dims while you type | Keep | It *is* the find. Nothing moves. |
| C | Planted: one line after making someone | Keep the idea, **move it (C2)** | |
| All | Fireflies in empty field (A at every count, B/C at 1 and 12) | Keep | At least 28 px clear of panels, no text nearby, quieter than names. |

---

## Cuts for Jony

| ID | Page | What's wrong | Exact fix |
|---|---|---|---|
| **A1** | A · Path | The "They answer" flash on the Chat header breaks *no motion before the first words*. | Delete `Concept.afterChat` (the whole function) in `concept-a-path.html`. Leave the core's `if (kind === 'chat' && Concept.afterChat)` line as it is. A's quiet magic is then just the trailhead drop light. Update A's magic line in `index.html` if it mentions the flash. |
| **C1** | C · Groves | At 50, roles cut to 10–12 characters and the sketch's name to `Untitl…`, so finding by role by eye fails. | Allow the role to wrap to 2 lines (`.gr .rl{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}` and drop `ell` from it). Narrow the door from 240 px to 200 px (still fixed at every count). Check at 1024×768 with 50: no scroll, and `Contract lawyer`, `Startup board advisor`, `Imported from Lena` and `Untitled sketch` show in full. If it doesn't fit, let the role wrap only and keep the door at 240. |
| **C2** | C · Groves | The planted line ("Nell is in Home & life. Move her in Edit.") sits inside the New agent button. Clicking the line starts another agent, and it becomes part of the button's name for screen readers. | Take `#planted` out of `<button id="door">`. Wrap the door in a `<div class="door solid">`, make the button the pill plus the hint, and put `#planted` under it as a plain `<p>`. The whole panel still lights on folder drop. Clicking empty space on the panel can stay as New agent, but the planted text itself is not clickable. |
| **C3** | C · Groves | The door asks "Who do you have in mind?" but there's nowhere to type. Anyone who answers by typing gets the Find (groves dim, `No one called "a blunt…"`). It's also a copy of the New agent screen's question. | Remove `<span class="ask">Who do you have in mind?</span>` from the Home door. Keep `+ New agent` and `Drop a folder here, or anywhere.` The question stays on the New agent screen, where the field is. (At 0 agents nothing changes: Home *is* that screen.) |
| **C4** | C · Groves | The `Type to find` chip has `solid` (panel and border), so it looks like a search box. Clicking it does nothing. That's the brief's "looks like a search box" fear, and dead UI. | Remove `solid` from `#chip` in C so it's plain quiet text like A and B. Keep its place, top-left of the groves. |

| **T1** | repo | Commit `8fcb86a` added `.tmp-test/` (2 test scripts and 29 screenshots) to git. It's leftover build clutter next to the deliverable. | `git rm -r .tmp-test` and add `.tmp-test/` to `.gitignore`. |

**B · Field Guide: no cuts.**

*Re-check on branch `studio/review-only-two-actions-no-clutter-fast-86d44352`: `8fcb86a` (the team branch head) changed no page since `daf915f`, so every finding above still applies. That commit added only T1.*

## What I'll check in the browser

| Cut | Check | Done? |
|---|---|---|
| A1 | Opening Chat (mouse and `Return`, with and without `?rm=1`) shows no flash or glow on the header mark | ☑ |
| C1 | At 50, 1024×768: no scroll, roles readable (the four examples above in full), door fixed width | ☑ |
| C2 | After Keep, the planted line shows on the door, clicking it does nothing, and the button's name is just `New agent…` | ☑ |
| C3 | No "Who do you have in mind?" on Home at 1/12/50. It's still on the New agent screen and at 0 | ☑ |
| C4 | The chip has no box or border. Clicking it does nothing, and it doesn't look like it would | ☑ |
| T1 | `git ls-files .tmp-test` is empty and `.tmp-test/` is in `.gitignore` | ☑ |
| index | `index.html` opens all three pages | ☑ |

~~Status: RETURNED to Jony.~~

## Re-check after the cuts

*Columbo (captain), on integration, 2026-11-26.* Jony made the cuts on main, and the merged pages
are Jony's version. I re-ran both browser checks on the merged pages in Chrome at 1024×768:
`checks/cuts.cjs` (every cut, at 0/1/12/50) and `checks/run.cjs` (all three concepts at
0/1/12/50: find, Chat, Edit, Back, no-match, New agent, reduced motion). Everything passed with
no console or page errors. The details are in `build-notes.md` under *Eraser cuts*.

- **C1:** C's door is 200 px, as asked. Names and roles wrap to 2 lines, with tighter spacing,
  so 50 fit with no scroll, and 51 still fit after making Nell. Only Ines's role still clamps
  after 2 lines (`Her design course, week by…`), as C1 allows. It has a `title` with the full text.
- **C2:** only the New agent button opens New agent. Empty space on the panel and the planted
  line do nothing (agreed with Eraser).
- **T1:** `.tmp-test/` is out of git. The check scripts live in `checks/`, and screenshots go to
  the git-ignored `.tmp-test/shots/`.

**Status: PASSED.** B passes unchanged. A and C pass with the cuts applied.

## Sign-off

*Eraser, 2026-11-26, on the cuts branch head `c1ad384`.* I ran `checks/cuts.cjs` and
`checks/run.cjs` myself in Chrome at 1024×768 at 0/1/12/50. Every line was `ok`, with no page
or console errors. Then I measured the three open points in C with my own script:

| Open point | Measured | Result |
|---|---|---|
| Edit stays on the name line when a name wraps | `Untitled sketch` at 50 wraps to 2 lines. Edit's centre is 12 px below the name's top, inside the first 18 px line, and it doesn't touch the name text | ✓ |
| Rows easy to click at the tighter spacing | Each row's Chat target is at least 39 px tall, with a 2 px gap between rows. Edit is 39×25 px, above the 24 px minimum | ✓ |
| Misclicks near the planted line | The panel is gone as a target: only the `+ New agent` button opens New agent. Clicks on empty space and on the planted line do nothing. That's fewer targets, so there's nothing to misclick | ✓ |

**Final step counts (C at 50):** 2 to chat with the latest, a recent one or by role, and 2 to
edit. New agent takes 1. Nothing needs a scroll.

**Watch later:**
- *Ines's role clamps* at 2 lines (`Her design course, week by…`). The full text is in the tooltip
  and the aria-label. If longer imported roles become common, test whether people still find
  by role by eye.
- *`Edit` shows 50 times* at 50 agents. Keep it until a test shows it reads as noise.

**APPROVED. Signed — Eraser.**
