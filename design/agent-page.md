# Agent page — spec

Files: `src/server/public/agent-page.html`, `agent-page.js`, tests in `agent-page.test.mjs`, browser check `checks/agent-page-check.cjs`.

## User goal
"I made an agent. Now I want to **use** it, see **who it is** and **what it's made of**, and **go back to change it**."
Ties to user-model goals 2 (see what it took) and 4 (adjust it), and the new goal: talk to it.

## What was removed, and why
- **Word-matched Keep button** in the left-side chat. It appeared when Sketcher's reply *sounded* finished. Replaced by one **Create** button driven by the server's `ready` flag (event `ready` or `done.ready`). One signal, one button.
- **A second edit path.** The page has one way back into the build screen: **Edit**, top right. The draft line points at it instead of adding its own button.
- **Talk for drafts.** A draft has nothing finished to talk to; it gets one plain line instead of a box that fails.
- **Legends and counts** on Profile. Three words, nothing else.

## Flow
Home → agent card → agent page (Profile shown) → type in the box, Enter → answer streams in, a quiet `Used · …` line under it.
Edit (top right) → `/new?agent=<id>` → build screen with that agent.

## Layout (top to bottom)
1. Back (top left), **Edit** (top right; hidden in demo).
2. Face (the agent's logo), name, description.
3. Switch: **Profile | DNA** (tabs; arrow keys move between them).
4. Profile: `Good at` · `Medium` · `Not trained for`.
   - Good at: skills that have files.
   - Medium: Knowledge topics (folder, or file name) and skills with no files yet.
   - Not trained for: "Anything outside these".
5. DNA, in this order: **Instructions** (markdown) → **Made from** (DNA files) → **RAG files** (Knowledge) → **Quality** ("n of m files learned").
6. Talk (the primary action): log + one text box. Enter sends, Shift+Enter is a new line.

## States
| State | What shows |
|---|---|
| Loading | Header only; views hidden until the agent is read. |
| Missing (404) | "This agent isn't here" / "It may have been removed." |
| Error | "Couldn't open this agent" / "Go back and try again." |
| Draft | Profile/DNA + "Not created yet. Edit it to finish, then talk to it here." No talk box. |
| Created | Profile/DNA + talk box, earlier turns (`a.talk`) shown. |
| Answer streaming | Reply bubble shows "…", then markdown as it arrives. |
| Talk error | Your words go back in the box; "It couldn't answer. Press Enter to try again." Typing hides it. |
| Demo (`?demo=n`) | Mock row; no Edit, no Talk, no draft line. |
| Empty parts | Each says so: "Nothing yet", "No instructions yet", "No files yet", "None in Knowledge". |

## Backend it reads (Uncle Bob's part; shapes assumed)
- `GET /api/agents/:id` → agent with `draft.status` (`'saved'` = created), `dna[]`, `talk[]` (`{who, text, used}`).
- `GET /api/agents/:id/system-prompt` → `{text}`; `/sections/knowledge/files` → `[{name, path, state}]`; `/skills` → `{skills:[{name, fileCount}]}`.
- `POST /api/agents/:id/talk {message}` → SSE `delta {text}` … `done {say, used:[{kind:'skill'|'file', name}]}` or `error {error}`.

## Accessibility
Tabs use `role=tablist/tab/tabpanel` with roving tabindex. Talk log is `aria-live=polite`; the error is `role=alert`. Text box has a label. All text meets contrast on the dark glass.

## E4 (Knowledge turns bright only when embedded)
The embedded event doesn't exist yet (Columbo's RAG plan, slot 1, Uncle Bob), so a Knowledge file still turns bright on processed; E4 waits for it.
