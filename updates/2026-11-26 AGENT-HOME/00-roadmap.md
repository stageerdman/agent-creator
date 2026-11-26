# AGENT-HOME: roadmap

The new home, on the restored Fireflies design. The user's layout is
fixed: a big agent list on the left, one live search row at the bottom,
and a plus button next to it. Nothing gets added and nothing gets cut.

`src/server/public/glade-fireflies.html` stays byte for byte unchanged.
The new home is `src/server/public/agent-home.html`.

Order of work: Columbo (research) → Merlin (motion) → Jony (build) →
Eraser (sign-off).

## Phase 1: the agent list

- A big list on the left with every agent, one under another.
- Order: most recently changed first (`updatedAt`, newest on top).
- Each row: the name and a very short description, on one line. Text
  that does not fit ends with an ellipsis (…). Long names never wrap
  into a second line and never push the layout.
- Clicking a row opens that agent.
- Data: `GET /api/agents` → `[{ id, draft: { name, status, description }, updatedAt }]`.
  `summary()` in `src/creator/agents.mjs` adds `draft.description`: a
  short string from an existing draft field, or `""`.
- Calm state for 0 agents.

Done when: 0, 1, 10 and 50 agents show cleanly, in the right order.

## Phase 2: the live search row

- One search row at the bottom of the page.
- It filters the list by name and description with every letter typed.
  No Enter, no button, no delay the user can feel.
- Clearing the text brings the full list back, in the same order.
- Calm state when nothing matches.

Done when: every typed or deleted letter changes the list at once, and
a search that matches nothing looks calm, not broken.

## Phase 3: the plus button

- A plus button next to the search row.
- Pressing it plays Merlin's transition (`02-merlin-motion.md`) and goes
  to `/new`: a blank placeholder page on the same Fireflies background.
- `src/server/app.mjs`: `GET /` → `agent-home.html`, `GET /new` →
  `new-agent.html`.
- Reduced motion: the transition follows Merlin's reduced-motion rule.

Done when: plus → transition → blank `/new`, every time.

## Phase 4: test, Start, sign-off

1. Tests with 0, 1, 10 and 50 agents (mock data in
   `src/server/mock/demoAgents.mjs`) and with very long names, with and
   without spaces.
2. Search tests: one letter, a full name, a word from a description, a
   search that matches nothing, clearing the search.
3. `npm test` passes.
4. Start opens the new home.
5. Eraser checks it in a real browser (WebKit) and writes
   `04-eraser-signoff.md`: APPROVED.

## Files in this folder

- `00-roadmap.md`: this file (Columbo)
- `01-columbo-report.md`: behavior research (Columbo)
- `02-merlin-motion.md`: plus-button motion spec (Merlin)
- `04-eraser-signoff.md`: sign-off (Eraser)
