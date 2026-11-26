# AGENT-HOME 03: Jony's build of the new home

Built from Columbo's report (`01-*`) and Merlin's motion spec (`02-merlin-motion.md`).
Code commit: 51cad32. Checks: `checks/check-agent-home.mjs` (WebKit, the engine the Mac app uses).

## User goal

Open the app, see every agent at once, find one by typing, or start a new one. Nothing else.

## What was built

- **`src/server/public/agent-home.html`**: the Fireflies background, sprite and movement copied from the original, plus the user's three parts and nothing else:
  1. **Left: the big ordered list** (`nav#list > ol#rows`). One row per agent, newest `updatedAt` first. Each row is a link with the name (large) and a short description (small, muted) on one line. Anything too long ends in an ellipsis. The name wins the space, so a very long name pushes the description out rather than wrapping.
  2. **Bottom: the search row** (`input#q`, placeholder "Search"). It is focused when the page opens. It filters by name and description on every letter typed, with no Enter needed, and ignores letter case.
  3. **Next to it: the plus** (`a#plus`, aria-label and title "New agent"). It plays Merlin's call: the plus lights, the glade hushes, the list and search fade, and one spark flies to where the new agent will form. At 480 ms the page goes to `/new`. A second press, Enter or Esc skips the motion and goes straight there. Cmd/Ctrl/middle-click open the page natively. With reduced motion turned on, the page switches instantly. Coming back with Back resets the page (the bfcache case).
  - To the right of the list, one firefly cluster per agent, for the newest 12 only. Hovering over a row makes its cluster glow.
- **`src/server/public/new-agent.html`**: a blank page on the same background. If it was reached through the plus less than 2 s earlier, a soft arrival light appears where the spark landed.
- **`src/server/app.mjs`**: `GET /` serves `agent-home.html`, and `GET /new` serves `new-agent.html`.
- **`src/creator/agents.mjs`**: `summary()` now includes `draft.description` from `shortDescription()`: the first sentence of persona, or of instructions if persona is empty, cut near 80 characters. It is `""` when there is neither.
- **`glade-fireflies.html` is untouched**: `git diff b309ffd -- src/server/public/glade-fireflies.html` is empty.

## Removed or left out, and why

- No header, title, count, sort control or filter chips. The list *is* the page, and the order is always newest first. We add no clear button of our own: WebKit shows its own clear-x in the search field (type=search), and we keep it as the platform default.
- No "New agent" text button and no empty-state call to action. The plus is the one way to create an agent, so there are no two ways to do the same thing.
- No lone firefly when there are no agents (Merlin cut it). An empty glade is the calm state.
- No sound and no extra motion beyond Merlin's spec.
- Clusters are capped at the newest 12 so that 50 agents still look calm rather than crowded.

## States

| State | What shows |
|---|---|
| 0 agents | One muted line, "No agents yet", the empty glade, and search plus the plus |
| Search matches nothing | "Nothing matches “zzqq”" in the same muted line; the clusters stay |
| Load fails | "Couldn’t load your agents" in the same line |
| Many agents | The list scrolls inside its column; search and plus stay fixed at the bottom |

## Check results (WebKit, 1280×820, all passing)

- **0 agents**: no rows, "No agents yet", search focused, no overflow, no page errors.
- **1 agent**: one row and one cluster. The plus lit, the glade dimmed and the page landed on `/new` (542 ms, measured from the click through the page load; the spec is 480 ms plus navigation). `/new` is blank. Back shows the home again.
- **10 agents, with long names** (40 chars, 80 chars, a 200-char name with spaces, and a 200-char name with no spaces): every name ends in an ellipsis inside the column. Page width stayed 1280/1280, and the search and plus stayed inside the window.
- **Live search**: typing "writer" one letter at a time gave visible rows 10, 8, 8, 8, 8, 2. "careful helper" matches on description, and "zzqq" shows the calm no-match line.
- **50 agents**: the list scrolls in its column, 12 clusters show, nothing overflows, no page errors.
- `npm test`: 124 pass, 1 skipped (the live test), 0 fail.
- **Start**: `npm run build:app` built and installed `/Applications/Agent Creator.app`. The staged app serves `agent-home.html` at `/` and `new-agent.html` at `/new`.

Screenshots are in `.tmp-test/` (git-ignored; re-run the check script to make them again): `home-0.png`, `home-1.png`, `home-10.png`, `home-10-search.png`, `home-10-nomatch.png`, `home-50.png`, `plus-mid.png`, `new.png`.

## Open notes for Columbo

- Rows link to `/agents/:id`, which has no route yet. The agent page is out of scope per Columbo's report and is Columbo's to wire.
- When a name fills the row, its description is hidden by the ellipsis. The name matters more, so this is intended.
