# 03 — Jony: the agent-selection home, built

## User goal
Open the app, find the agent I want, open it. Or make a new one. Nothing else.

## What I removed, and why
- Every heading, title, footer, count and toolbar: the rows say what this is.
- Sort and filter options: newest first is the only order people ask for; search covers the rest.
- A "New agent" row or empty-state button: the plus is the one way to make an agent.
- Hover menus, delete, rename on the row: not a selection task; they belong on the agent page.
- Our own clear (×) in the search: WebKit's built-in search clear is kept as the platform default, so there is no second, custom one.

## Flow
1. `/` opens with the search already focused. Type → rows narrow on every letter.
2. Click (or Enter on) a row → `/agents/:id`, a real page: name, description, `← Agents`. The back link is there because the Mac app window has no Back button.
3. Click the plus → fireflies gather into it (Merlin's `gatherToPlus`, ~1.2 s; reduced motion: short fade) → `/new`. A second press while gathering is ignored. ⌘/Ctrl/Shift-click opens normally, with no motion.

## Layout
- One centred column, `min(560px, 100vw − 136px)` wide.
- Search: fixed at `top: max(32px, 12vh)`, centred, 44 px high, soft fill `rgba(230,238,232,.075)`, 14 px radius (22 px with `corner-shape: squircle` where supported), blurred backdrop, lime caret. Focus ring is a soft 1 px lime inset, because it is focused on every load.
- Plus: 44 × 44, same top, 12 px right of the search, outside `#root`, so the gather flies into it.
- Rows (68 px): a 56 px constellation canvas · name (17 px, 500) over description (13 px, quiet) · age on the right (13 px, tabular). Name and description are one line each and end in an ellipsis. The full name is in the title, and the full date is on the age.
- Background: the original Fireflies field gradient and colours, copied. `glade-fireflies.html` is untouched.

## States
- Loading: nothing (no spinner; it takes a few ms).
- 0 agents: "No agents yet", centred and quiet.
- No match: `Nothing matches "…"`, in line with the names.
- Load failed: "Couldn't load your agents".
- Learning agent: warm, loose fireflies drift in and join the cluster, again and again.
- Reduced motion: still constellations; the plus makes a short fade, then `/new`.
- Hover/focus on a row: a soft panel, and the constellation flashes once.

## Spec notes for whoever touches this next
- Data: `GET /api/agents` → `[{ id, draft: { name, status, description }, createdAt, updatedAt }]`. `summary()` returns `createdAt` and falls back to `updatedAt` for old records.
- Pure logic lives in `src/server/public/agent-list.js` (`ageLabel`, `sortAgents`, `filterAgents`, `nameOf`, `descOf`, `isLearning`), with unit tests.
- Mock sets: `/?demo=0|1|10|50` (served from `GET /mock/home/:count`). They include long names with and without spaces, learning agents, and ages from "just now" to "4 months".
- `aria-live` sits only on the quiet status line, not on the list, so a screen reader doesn't read 50 rows on every letter.
- Only on-screen rows are drawn (IntersectionObserver), so 50 agents cost about as much as 8.

## What I checked (WebKit, Playwright)
Script: `checks-jony/check-home.mjs`, run against `PORT=3505`. Everything passed:
- 0, 1, 10 and 50 agents at 1280×820 and 800×600: no horizontal or page scroll, every row is 68 px and inside the column, the search is centred, the plus sits to its right, the list is under the search, constellations are drawn, and there are no page errors.
- Long names (with and without spaces) end in an ellipsis. Ages on the 10-agent set: just now, 5 min, 3 h, 2 days, 3 days, 4 days, 1 week, 3 weeks, 1 month, 4 months. Order is newest first.
- 0 agents shows "No agents yet". Search narrows on every letter (10 → 8 → 4), no match shows the calm line, and clearing restores the same order.
- A row opens `/agents/home-01`, which shows name, description and `← Agents` (not JSON, not blank).
- Plus with 50 agents: `/new` after 1233 ms. A second press mid-gather was ignored. Reduced motion: `/new` after 409 ms.
- `npm test` passes.

Looked at by eye: the screenshots for 0, 10 and 50 agents, mid-gather, and the agent page. One fix came from that: the search's focus ring was a loud lime on every load, so it is now a soft inset.
