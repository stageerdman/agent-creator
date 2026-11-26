# 04 — Eraser sign-off: agent-selection home

**Verdict: APPROVED.** The push can go ahead. One item outside this flow (the white launch frame in light mode, see below) goes to Columbo to assign.

## Goal
The person opens the app and either gets to one of their agents or starts a new one, with nothing else in the way.

## Step count

### A. Open an existing agent (the most common path)
| # | Step | Mark | Why |
|---|------|------|-----|
| 1 | Look at the list (newest first, name, description and age on each row) | Keep | Reading the list is the choice itself. Newest first puts the usual pick at the top. |
| 2 | Click the row | Keep | One click, and the whole row is the target. It opens a real page. |

**2 steps.** With a long list, add one step: type a few letters. The search already has focus, so no click is needed first (that one was **Automated**). It filters on every letter, so there's no Enter and no "Search" button. **Most steps: 3.**

### B. Make a new agent
| # | Step | Mark | Why |
|---|------|------|-----|
| 1 | Click plus | Keep | The only way to create an agent. It has no menu, no name prompt and no "are you sure". |
| — | Wait about 1.2 s while the fireflies gather into the plus | Keep (watch) | This is the team's magic, and it stays inside the 1.0–1.5 s budget. A second press is ignored. With reduced motion it's a 160 ms fade. |

**1 step.**

### Clutter
- The only things you can act on are the search field and the plus. Every row is a link. There's no header, footer, count, tips, sort menu, filter chips, settings or second "New agent" button. The check measures this on every screen size and agent count.
- Each action has exactly one way to do it: a row opens an agent, plus creates one, and the search narrows the list. Nothing is duplicated.
- The agent page has a single "← Agents" link to go back, along with the system's own Back.

Current count: **A = 2 (3 with search), B = 1.** Target: the same. There's nothing left to cut.

## What was checked (WebKit, Playwright 1.x, headless)
Script: `checks/check-eraser.mjs`. Result: **113 ok, 0 failed**. It ran with 0, 1, 10 and 50 agents, at 1280×820 and 800×600, and the 50-agent set had six extra long names (40, 80 and 200 characters, with and without spaces).

- **Only selection on screen:** only `q` and `plus` can be acted on, and there is no stray text, at every count and size.
- **Rows:** there's one row per agent, each with a constellation canvas, a name and a description (or none, never "undefined"). The age matches `ageLabel` and has a full-date tooltip. Ages for 10 agents: just now, 5 min, 3 h, 2 days, 3 days, 4 days, 1 week, 3 weeks, 1 month, 4 months.
- **Order:** newest first, with ties broken by id. The rows don't move after they appear.
- **Learning agents animate:** the pixel sums change from frame to frame.
- **Long names:** each stays on one line and ends in an ellipsis. Row height stays at 68, the age never gets pushed out, and nothing scrolls sideways.
- **Search:** it's centred and live on every letter (with 50 agents, m → ma → mar gives 21 → 7 → 3), and the list updates in the same frame. Description words match. When nothing matches, one calm line repeats the text ("Nothing matches “rxe zq”"). The search and plus don't move. Backspace brings back the full list in the same order. With 0 agents, typing shows the no-match line and no error. The quiet line is `aria-live="polite"`.
- **Row click:** it opens `/agents/:id`, a real page on the Fireflies field. It isn't raw JSON or a blank page.
- **Plus:** it reaches `/new` in 1221 / 1223 / 1210 / 1229 ms (for 0 / 1 / 10 / 50 agents). No frame takes over 50 ms (the worst is 25 ms with 50 agents). A second press during the gather adds no second canvas. `/new` opens on `rgb(11, 20, 16)`, so there's no white. Back brings the home back at full opacity with all its rows.
- **Reduced motion:** 172 ms from click to `/new`, page load included.
- **Real API:** `GET /` with no demo set serves the new home.

Other checks:
- `npm test`: 147 pass, 1 skipped (the live CLI test), 0 fail.
- `git hash-object src/server/public/glade-fireflies.html` = `645922246274e3c5c695c59163e15824935d9245`, so it's unchanged.
- Start (`run: npm run start:app`) builds and opens the Mac app on the same `agent-home.html`. Jony rebuilt and opened it (03-jony-build.md §3), and `GET /` above confirms the page it loads.
- By eye (screenshots in `checks/shots/`, git-ignored): the 50-agent home, the 0-agent home at 800×600, the gather halfway through, and the agent page. All are calm, dark and aligned. No clutter.

## Watch items (not blocking)
1. **White launch frame in light mode (outside this flow; Columbo to assign).** `src-tauri/src/main.rs` `canvas()` paints the native window `#ffffff` when macOS is in light mode, but the home is `#0B1410`, so a light-mode Mac shows a white frame on every launch. The fix is one line: return `Color(0x0B, 0x14, 0x10, 0xff)` for both themes. It doesn't affect the home's steps, and the roadmap's no-white rule is about `/new`, which passes. It's still worth doing before people see it. **Done at integration (Columbo):** `canvas()` now returns `#0B1410` for both themes; `npm run test:shell` passes and the app was rebuilt and installed.
2. **The 1.2 s gather.** This is the only wait in the app's main loop. If the logs ever show people creating many agents in a row, shorten it toward 1.0 s first, before adding anything else.
3. **No second door.** Any later "New agent" item in a menu bar, empty state or row menu would be a second way to do the same thing. Keep plus as the only one. The same goes for the agent page: if a row ever gets hover actions (rename, delete), they belong on the agent page instead.
