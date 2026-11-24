# AGENT-CREATOR — P2: Create agents by chatting with AI

## Goal

The user builds an agent by talking to an AI, the **creator**. They say what
they want, answer a few questions, and keep refining in the chat. Next to the
chat, a **draft agent** fills in live: its name, persona and instructions.
The user can also fix any field by hand. When they're happy, they save it.

**Done when** someone can open the app, describe an agent in one sentence,
watch the draft appear, shape it through chat and by hand, save it, close the
app, and find the saved agent again. The tests must pass, and Start must open
the newest working app.

This is feature P2. It builds on the P1 engine (`src/engine`: `askAgent`,
`runClaude`, `checkCli`) and the P1 local app (`src/server`). Two later
features plug into it, and P2 only leaves room for them (see "Plug-in points
for later"):
- **P3**: uploaded materials (files, folders, paths).
- **P12**: a capability map that only the user sees (good at / medium / not
  trained for).

## Team inputs (read these before building)

All in this folder:
- `research-columbo.md`: how people will really use the creator (behaviors,
  scores, deep dives, watch-outs). Most decisions below come from it.
- `magic-merlin.md`: the small magic moments and the names.
- `design-jony.md`: the screen design (layout, every state, labels).
- `review-eraser.md`: cuts to the design and the final sign-off. **Build the
  version of the design that Eraser signs off.**

## Key decisions (2026-11-24)

1. **The creator runs in P1's chat mode, not a build job.** It uses the
   streaming `askAgent` with a creator system prompt, `--tools ""`, and
   `cwd = tmpdir`. There are no file tools, so no spike is needed. Build-job
   mode (file tools in the agent's folder) waits for P5.
2. **The draft has one shape:**
   `{ name: string, persona: string, instructions: string, status: 'draft'|'saved' }`.
   - *Persona* is who the agent is: its voice, character and point of view.
   - *Instructions* are what it does: its job, rules and limits.

   Nothing else goes into the draft. The P12 map never does.
3. **One source of truth, and hand edits win.** The server keeps the current
   draft. Every creator turn sends the *whole current draft* (with the user's
   hand edits) into the prompt. The creator changes only the fields it means
   to change. It never silently undoes a hand edit, and if it wants to, it
   asks in the chat first. (Research: in other agent builders, the top
   complaint is chat quietly overwriting text the user wrote by hand.)
4. **How the creator updates the draft:** the creator answers in plain chat
   text. At the end it adds one block, `<draft>{…changed fields only…}</draft>`.
   - The server strips that block out of the streamed chat, so the user never
     sees it.
   - The server parses the block from the final `result`, never from the
     deltas (P1 pitfall 8).
   - If a reply has no block, or a broken one, the draft stays as it is. The
     chat still shows the reply.
5. **Autosave.** The draft is saved on every change (`status: 'draft'`).
   "Save", or whatever Eraser's sign-off calls it, sets `status: 'saved'`. A
   saved agent can be reopened and refined again, and the chat then continues
   with `--resume`.
6. **Where agents live:** user data never goes in the repo (see the CLAUDE.md
   rule on personal material). Agents are saved under
   `AGENT_CREATOR_HOME` (default `~/.agent-creator`), in
   `agents/<id>/agent.json`. Tests point `AGENT_CREATOR_HOME` at a temp
   folder.

## Roadmap

Each phase ends with tests that lock in what it built. New code goes in
`src/creator/`, which is pure and has no HTTP, so a future desktop shell can
call it directly like the engine. The routes go in `src/server/routes/`.

### Phase 0 — Research + design ✅ (this team)
- `research-columbo.md`, `magic-merlin.md`, `design-jony.md`,
  `review-eraser.md`.
- **Test:** none (documents). The check is Eraser's sign-off.

### Phase 1 — Draft model (pure)
- `src/creator/draft.mjs`:
  - `emptyDraft()`
  - `applyPatch(draft, patch)`: only `name` / `persona` / `instructions`;
    unknown keys and non-strings are dropped; it returns a new draft and the
    list of changed fields, so the screen can show what changed.
  - `isEmpty(draft)`
- `src/creator/creatorReply.mjs`:
  - `splitReply(text)` → `{ say, patch | null }`: it finds the last
    `<draft>…</draft>` block and parses its JSON.
  - `streamFilter()`: passes chat deltas through and holds back everything
    from `<draft>` on, even when the tag is split across two deltas.
- **Tests:**
  - patch merge
  - unknown keys and wrong types dropped
  - changed-fields list
  - a reply with no block, a broken block, or two blocks (the last one wins)
  - `<dr` + `aft>` split across deltas never leaks into the chat
  - `say` is trimmed

### Phase 2 — The creator AI (prompt + one turn)
- `src/creator/creatorPrompt.mjs`: the creator's system prompt, built from
  the current draft. It holds the rules from the research:
  - Make a first draft from the first message, however short.
  - Ask at most one or two questions at a time, each with a suggested answer.
  - Treat the draft as the truth, including the user's hand edits.
  - Never quietly undo a hand edit.
  - Say plainly when the agent looks ready, but let the user decide.
  - The P1 rule against "Let me check…" narration (pitfall 11).

  It has an empty `materials` slot for P3 (see below).
- `src/creator/creatorTurn.mjs`:
  `creatorTurn({ message, draft, sessionId }, { onSay, signal, engine })`.
  It calls `engine.askAgent` with the creator prompt, sends filtered deltas
  to `onSay`, and resolves to `{ say, draft, changed, sessionId }`. The
  engine is passed in, as in `createApp(engine)`.
- **Tests (fake CLI):**
  - The prompt contains the current draft, hand edits included.
  - Deltas reach `onSay` without the draft block.
  - The final `result` wins over the deltas.
  - The patch is applied and `changed` is right.
  - A reply with no block leaves the draft unchanged.
  - `sessionId` is passed through to `--resume`.
  - Engine errors (`not-installed`, `failed`, `cancelled`) come out with
    their `kind`.

### Phase 3 — Saving the draft
- `src/creator/agentStore.mjs`:
  - `createAgent()`
  - `loadAgent(id)`
  - `saveDraft(id, { draft, sessionId })`: the autosave.
  - `markSaved(id)`
  - `listAgents()`

  A record is `{ id, draft, sessionId, createdAt, updatedAt }`, written to
  `agents/<id>/agent.json`. Each write goes to a temp file and is then
  renamed, so a crash never leaves half a file. The `id` is a short random
  id. It is not built from the name, because the name changes while the user
  chats.
- **Tests (temp `AGENT_CREATOR_HOME`):**
  - The round trip works.
  - Autosave keeps `status: 'draft'`.
  - `markSaved` sets `'saved'`.
  - Reopening a saved agent and editing it keeps the record.
  - `listAgents` sorts by `updatedAt`.
  - A missing id gives a clear error.
  - Nothing is written inside the repo.

### Phase 4 — Server routes
- `POST /api/agents`: creates a new empty agent and returns `{ id }`.
- `GET /api/agents` and `GET /api/agents/:id`.
- `POST /api/agents/:id/chat { message }` returns an SSE stream:
  - `delta`*: the chat text, with no draft block in it.
  - then `draft { draft, changed }` if anything changed.
  - then `done { say, sessionId }`, or `error { kind, message, traceId }`.

  Closing the request cancels the CLI (as in P1). The new draft and session
  are autosaved before `done`.
- `PUT /api/agents/:id/draft { name?, persona?, instructions? }`: a hand
  edit, autosaved.
- `POST /api/agents/:id/save`: sets `status: 'saved'`.
- `GET /api/health` stays the same. The screen uses it for "CLI offline".
- **Tests (server against the fake CLI):**
  - SSE order.
  - The draft block never appears in a `delta`.
  - A hand edit, then a chat turn: the prompt sees the hand edit, and the
    hand edit survives unless the patch changes that same field.
  - Save sets the status.
  - A bad id gives a 404, an empty message gives a 400.
  - A missing CLI gives an `error` event with `kind: 'not-installed'`.

### Phase 5 — The chat screen in the local app
- Replace P1's prompt box in `src/server/public/` with the agent-creation
  screen from `design-jony.md`, as signed off in `review-eraser.md`:
  - the chat on one side and the live draft on the other
  - every state in the design: empty first visit, first message, draft
    growing, hand edit, creator asks a question, errors / CLI offline,
    finish and save
  - the narrow-screen layout
  - the magic moments Eraser kept
- Keep the browser code plain (no framework, no build step), as in P1. Put
  the logic that can be tested (the SSE reader, applying a `draft` event,
  the state from health and errors) in a small module with no DOM.
- Leave the two reserved spots from the design empty and marked "later": P3
  uploads and the P12 capability map.
- **Tests:**
  - The server serves the page and its scripts.
  - Unit tests for the non-DOM module: the SSE event parser, the
    draft-event reducer, the state for `not-installed`.
  - A manual check of each design state in the browser.

### Phase 6 — Live verification
- Run the real `claude` on PORT, then make one agent from start to end:
  - a one-line description
  - two refinements by chat
  - one hand edit
  - save
  - restart the server and reopen the agent
- Check that the draft block never shows in the chat, and that the hand edit
  survived. Write down what was learned in a new `wiki.md` in this folder.
- **Test:** this run, written down in `wiki.md`. Any bug it finds gets a
  test in phases 1–4.

## Plug-in points for later (not built in P2)

- **P3 — uploaded materials.**
  - `creatorPrompt` takes a `materials` input that is always empty in P2.
    P3 fills it with a short summary of what was uploaded and the user's
    rules ("only PDFs go into the knowledge base", "use this book for the
    persona"). Then the user can ask questions about their material in the
    same chat.
  - The agent folder `agents/<id>/` is where P3 will keep or point to the
    materials.
  - The screen has a reserved "later" spot for uploads.
  - Until P3, people will paste text into the chat instead. The research
    covers this, and the creator should handle it well.
- **P12 — the capability map (only the user sees it).**
  - It lives *outside* the draft, in its own file
    (`agents/<id>/capability-map.json`, not created in P2). It must never go
    into `name`, `persona` or `instructions`, and never into the creator's
    `<draft>` patch.
  - The Phase 1 rule that drops unknown patch keys already guards this.
    Keep it.
  - The screen has a reserved "later" spot for the map and for the short
    capability card shown at save.
  - P12 needs P3's materials first.

## Not in P2 (on purpose)

- Uploads and the capability map (P3, P12, above).
- Generating the persona from source material with the `SKILL.md` pipeline,
  and build-job mode (P5).
- Chatting with the finished agent as itself (P8). Trying the agent out
  inside the creator chat is an open question in the research; until it's
  decided, the creator may *show* a sample answer in its own reply.
- Chat history and titles (P9). P2 only keeps each agent's `sessionId` so its
  chat can continue.
- Export, icons and characters (P6, P7, P11).

## Status

- 2026-11-24: Phase 0 in progress. The roadmap and research are written.
  Magic, design and review come next from the Magic UX team.
