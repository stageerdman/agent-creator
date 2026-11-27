# AGENT-SELECTION-HOME: roadmap

The home, done again. The user rejected the version in
`updates/2026-11-26 AGENT-HOME/` (that folder is background only and stays
unchanged). The new home does **one thing: pick an agent, or make a new one.**

Order of work: Columbo (this roadmap + `01-columbo-report.md`) → Merlin
(motion, `02`) and Jony (build, `03`) in parallel → Eraser (sign-off, `04`)
→ push.

## Rules (hold for every phase)

1. **ONLY agent selection on screen.** Rows, one search, one plus. No header,
   no footer, no count, no sort control, no tips, no second create button.
2. **The original Fireflies look and motion is the base.** Colours, background
   gradient, sprite, glow, `flash()`, drift and the cluster layout come from
   `src/server/public/glade-fireflies.html` and `magic.css`. Nothing new in
   style unless this roadmap names it.
3. **`src/server/public/glade-fireflies.html` stays byte for byte unchanged.**
   Copy from it; never edit it. Eraser checks its blob hash
   (`645922246274e3c5c695c59163e15824935d9245`).
   **RETIRED 2026-11-28 (audit row C8, Eraser's ruling).** The page was
   deleted in `793c876`. A reference page the user never sees isn't a user
   requirement, and bringing it back would add a second Fireflies page.
   Rule 2 still holds: the look lives on in `agent-home.html` and
   `new-agent.html`. The blob-hash checks in §5 below no longer apply. The
   original concept page is still kept at
   `updates/2026-11-25 MAGIC-CONCEPTS/glade-fireflies.html`.
4. **`createdAt` comes from the API.** The store already writes `createdAt` on
   new records (`agentStore.mjs`), but `summary()` in `src/creator/agents.mjs`
   drops it. Add it. An old record without `createdAt` falls back to
   `updatedAt`; never `undefined`, never "now".
5. **No magic on errors or empty states.** Those are plain, quiet text.

Data shape (Jony owns it, Merlin and Eraser code against it):

```
GET /api/agents → [{ id, draft: { name, status, description }, createdAt, updatedAt }]
```

`draft.status` is `"draft" | "saved" | "learning"`. `description` is a short
string or `""`. `createdAt` and `updatedAt` are ISO strings.

Files and owners:

| File | Owner |
|---|---|
| `src/server/public/agent-home.html` (the new home) | Jony |
| `src/creator/agents.mjs` (`summary()` + `createdAt`), `agentStore.mjs` only if needed | Jony |
| `src/server/app.mjs`, `router.mjs` (`/`, `/new`, `/agents/:id`) | Jony |
| `src/server/mock/demoAgents.mjs` (0, 1, 10, 50 agents) | Jony |
| `src/creator/agents.test.mjs`, `src/server/agents.test.mjs` | Jony |
| `src/server/public/firefly-gather.js` + `firefly-gather.test.mjs` | Merlin |
| `updates/…/checks/` (WebKit script) + `04-eraser-signoff.md` | Eraser |

---

## Phase 1: the rows

What to build:

- **One row per agent**, one under another, in a single list in the middle
  column of the screen.
- **Each row, left to right:**
  1. the **constellation**: that agent's firefly cluster, reused from the
     existing cluster code in `glade-fireflies.html` (`cluster()`, `slot()`,
     `radius()`, `flash()`, the joined-firefly look), drawn small, one per row;
  2. the **name** (strong) with the **short description** under it (quieter);
  3. the **age** on the right, plain and quiet.
- **Age words:** `just now` (under 1 minute), `5 min`, `3 h`, `2 days`,
  `3 weeks`, `4 months`, `2 years`. Whole numbers, rounded down, singular
  for 1 (`1 day`, `1 week`). Age is measured from `createdAt`. A date in the
  future (clock skew) shows `just now`, never a minus number. The age has a
  native `title` tooltip with the full date (nothing visible is added).
  Age and order use the same date, so they never disagree.
- **Order:** by `createdAt`, newest at the top. Equal dates: by `id`, so the
  order never flips between loads.
- **Long names** end in an ellipsis (…) on one line and never break the
  layout: not with spaces, not without spaces (`text-overflow: ellipsis`,
  `min-width: 0` on the text column). The age and the constellation never get
  pushed or squeezed. The full name is in a native `title` tooltip.
- **Empty description:** the row shows only the name, vertically centred. No
  gap, no "undefined", no dash.
- **Learning agents** (`draft.status === "learning"`) show the learning
  animation on their row's constellation: the original "studying" look, warm
  loose fireflies drifting in and joining the cluster. Other rows stay calm
  with the original slow beat.
- **Click a row** → that agent's real page at `/agents/:id`, on the same
  Fireflies background. Never raw JSON, never a white or blank error page.
  Rows are links (`<a href>`), so ⌘-click, Tab and Enter work for free.
- **0 agents:** a calm empty state, one quiet line (for example "No agents
  yet"). The plus is the way forward; no second create button.
- Rows are readable and clickable at once. Nothing moves under the mouse
  after it appears (no late re-sort, no rows sliding in).

Done when: the API returns `createdAt` (with the `updatedAt` fallback), and
with 0, 1, 10 and 50 agents every row shows its constellation, name,
description and a correct age, newest first, learning rows animate, long names
end in "…" with no layout break, and a row click opens a real agent page.

Tests to run:

- `npm test`, with new unit tests in `src/creator/agents.test.mjs`:
  `summary()` returns `createdAt`; an old record without `createdAt` gets
  `updatedAt`.
- `src/server/agents.test.mjs`: `GET /api/agents` items have `createdAt`;
  `GET /agents/:id` returns HTML (not JSON); an unknown id gives a calm page,
  not raw JSON.
- An age test (pure function, for example `ageLabel(createdAt, now)`):
  0 s → `just now`, 59 s → `just now`, 5 min, 3 h, 1 day, 2 days, 3 weeks,
  4 months, 2 years, a future date → `just now`.
- A sort test: mixed `createdAt` values come out newest first; ties are stable.
- WebKit (Eraser's script): 0/1/10/50 mock agents; each row has a canvas or
  constellation, name, description, age; names of 40, 80 and 200 characters,
  with and without spaces, stay one line with "…"; no horizontal scroll at
  1280×820 and 800×600.

## Phase 2: the live search in the middle

What to build:

- **One search field, centred** horizontally in the middle of the screen,
  above the list. iOS-style: soft, very rounded with continuous corners
  (a squircle feel, not a plain pill), a light translucent fill on the dark
  Fireflies background, a small magnifier glyph and a quiet "Search"
  placeholder. More refined than the old search row. It does not move when
  results change.
- **Live on every letter**: typing or deleting a letter filters the list at
  once. No Enter, no button, no debounce the user can feel (filter
  synchronously; 50 items is tiny).
- **Match rule:** case-insensitive "contains" on name and description.
  Accents ignored is a bonus, not required. Results keep newest-first order.
- **Clearing** (Backspace to empty, or WebKit's own clear-x) brings back the
  full list in the same order.
- **No match:** a calm, quiet line in the list area that repeats what was
  typed (for example `Nothing matches “rxe”`). It looks clearly different from
  the 0-agents state. The search text stays, the layout does not jump, the
  plus stays where it is. Announced politely to screen readers
  (`aria-live="polite"` on the list area).
- With 0 agents, the search is still there but quiet (it is part of the one
  screen); typing shows the no-match line, never an error.
- Keyboard: the field may take focus on load so the user can just type, as
  long as it steals nothing. `/` or ⌘F focus are optional, not required.

Done when: every typed or deleted letter changes the list at once with 10 and
50 agents, a match on a description word works, clearing brings the full list
back in order, and a search that matches nothing looks calm, not broken.

Tests to run:

- A unit test for the filter function: one letter, a full name, upper case,
  a word only in the description, no match, empty string → everything, order
  kept.
- WebKit: type `m` → `ma` → `mar` and count rows each time; type a no-match
  string and check the no-match line shows the typed text and the search and
  plus did not move (same bounding box before and after); Backspace to empty
  → full list in the same order; time from keypress to list change under
  50 ms with 50 agents.

## Phase 3: the plus and the fireflies-to-plus transition

What to build:

- **One plus button**, kept from the current home, in the same place. It is
  the only way to create an agent.
- **Press plus** → Merlin's `gatherToPlus(rootEl, plusEl, options)` from
  `src/server/public/firefly-gather.js`:
  the real UI (rows, constellations, text, search) dissolves into fireflies,
  the fireflies fly on soft curves into the centre of the plus, the plus gives
  a small glow pulse, then the page goes to **`/new`** (`new-agent.html`).
- **Timing:** the whole thing takes **1.0 to 1.5 seconds** (default 1200 ms).
  Smooth with 50 rows (fireflies capped at about 400).
- **Reduced motion** (`prefers-reduced-motion: reduce`): a quick cross-fade of
  200 ms or less, no flying, then `/new`.
- **Never blocks navigation:** if anything throws, go to `/new` at once.
- **A second press is ignored** while the transition runs (`isGathering()`),
  or skips straight to `/new`. It never starts a second animation. Esc may
  skip too.
- ⌘-click / middle-click on the plus opens `/new` in a new tab with no
  motion (the plus is a link).
- `/new` shows the same Fireflies background on its first frame: no white
  flash. Pressing plus saves nothing; Back returns to the home as it was.
- Routes in `src/server/app.mjs` / `router.mjs`: `GET /` → `agent-home.html`,
  `GET /new` → `new-agent.html`, `GET /agents/:id` → the agent's page.

Done when: plus → fireflies gather into the plus in 1.0–1.5 s → `/new`, every
time, with 0, 1, 10 and 50 agents; reduced motion gives a short fade; a second
press does not restart it; and an error in the animation still lands on `/new`.

Tests to run:

- `src/server/public/firefly-gather.test.mjs` (Merlin): the promise resolves;
  it resolves at once when something throws; reduced motion resolves in
  ≤ 200 ms; the overlay canvas is removed at the end; `isGathering()` is true
  during and false after; the firefly count is capped.
- `src/server/app.test.mjs`: `GET /` serves the new home; `GET /new` serves
  `new-agent.html`.
- WebKit: click plus and measure click → `/new` (1000–1500 ms); a second
  click mid-way does not add time or a second canvas; with reduced motion,
  click → `/new` ≤ 300 ms; frame times during the gather with 50 agents
  (no long frames over 50 ms); Back restores the home with full opacity.

## Phase 4: test, Start, sign-off, push

1. **Mock data** in `src/server/mock/demoAgents.mjs`: sets of 0, 1, 10 and 50
   agents; very long names with and without spaces; some with an empty
   description; some `learning`; `createdAt` from minutes to months ago; one
   old record with no `createdAt`.
2. **WebKit run** (Playwright WebKit, Eraser's script in `checks/`) with 0, 1,
   10 and 50 agents and the long names: all checks from Phases 1–3.
3. **`npm test` passes.**
4. **Start opens the new home** (the `run:` line in `.project`, `GET /`).
5. **`glade-fireflies.html` is unchanged** (blob hash check).
6. **Eraser writes `04-eraser-signoff.md`: APPROVED.** If RETURNED, Jony (or
   Merlin for motion) fixes the exact list, and Eraser checks again.
7. **Push** to `origin` after APPROVED (`git pull --rebase` first).

Done when: `npm test` passes, the WebKit script passes with 0, 1, 10 and 50
agents and long names, Start opens the new home, `glade-fireflies.html` has
its original hash, Eraser has written APPROVED, and the work is pushed.

Tests to run: `npm test`; Eraser's WebKit check script in `checks/`
(0/1/10/50 agents, long names, search, row click, plus transition, reduced
motion, second press); `git hash-object src/server/public/glade-fireflies.html`.

## Files in this folder

- `00-roadmap.md`: this file (Columbo)
- `01-columbo-report.md`: how people will use the new home (Columbo)
- `02-merlin-motion.md`: the fireflies-to-plus transition (Merlin)
- `03-jony-build.md`: build notes (Jony)
- `04-eraser-signoff.md` and `checks/`: sign-off (Eraser)
