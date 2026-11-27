# LEFT-SIDE: update v1, the phased roadmap

Feature: **f-the-left-side** (Frontend: The Left Side).
Team: Magic UX. Captain: Columbo.
Order of work (design rules): research (Columbo) → magic (Merlin) →
design and build (Jony) → cut review (Eraser).

## Goal

The left side of the creation screen (`/new`, `src/server/public/new-agent.html`)
tells one story without words: **at first a loose mess of fireflies, one per
file; as files are processed, they gather into the agent's AI identity**
(the Fireflies DNA mark). A small arrow on the left edge pulls out the
**orchestration chat**: the creator AI that can see every file and edit the
agent. One way in (the arrow), one clear way out.

It builds on what is already there, not beside it:
- the wander: `wanderAt` / `wanderParams` in `src/server/public/creation-screen.js`
  (`Reports/fireflies-wander-motion.md`)
- the identity mark: `createDna`, `layoutOf`, `makeLook` in `src/server/public/fireflies-dna.js`
- the gather and flights: `src/server/public/firefly-gather.js`, `firefly-orbit.js`
- the one intake: `createIntake` in `src/server/public/file-intake.js`
- "processed" per file already comes from the server (`state` in each
  `dna` file, `src/creator/files.mjs`); the creator chat already exists
  at `POST /api/agents/:id/chat` (SSE).

Journey step: **UJ2 · 3–4** (the proposed split and the creator chat, then
learning) in `updates/2026-11-25 FULL-UX - OPEN/journeys-columbo.md`.

## The user's fixed rules (not up for change)

- In the beginning the left is a mess; it only adds up into the final AI
  identity as files are processed.
- A little arrow on the left pulls out the special orchestration chat.
- The chat window is glassy and blurs what is behind it. Two rounded corners
  on the right; on the left it is merged with the screen edge. A back arrow
  on top pulls it back to the side.
- Closing it shows the Agent's DNA it was covering.
- Reduce Motion is respected. One way to do each thing.

## Phase 1: research (owner: Columbo)

- Write `Reports/left-side-behaviours.md`: who uses the left side, when, and
  what they expect. Behavior table, 5–8 deep dives, a watch-out list, key
  insights, open questions. Covers: the early mess while files are processed,
  the gathering into the identity, finding and opening the arrow, using and
  closing the chat, small screens and Reduce Motion.
- Write this roadmap.
- Link both from feature f-the-left-side.

**Done when:** both files exist, the feature points to them, and the report
lists must-feel checks a person can do on screen (Jony and Eraser test
against them).
**Tests that must pass:** `npm test` stays green (no code changes in this
phase; it proves nothing was broken).

## Phase 2: magic (owner: Merlin)

- Write `Reports/left-side-magic.md`, copy in this folder as `magic-merlin.md`.
- At most 3 moments: the mess gathering into the identity, the arrow's
  reveal, the chat's open and close. Give numbers: timing, how processed
  share maps to how much has gathered, easing, Reduce Motion behaviour.
- Reuse the named functions above; no new particle system. Name for the
  arrow and chat added to the word list (`magic-merlin.md` §6 of FULL-UX)
  if any new on-screen word is needed.

**Done when:** Jony can build straight from the recipe with no open number,
and every moment maps to a behavior in the report.
**Tests that must pass:** the recipe's own thresholds are written as
testable checks (like the wander recipe's handover list); `npm test` green.

## Phase 3: design and build the Left Side in the real app (owner: Jony)

- The field on the left shows the mess, then the gathering, driven only by
  real data: share of files with `state === 'processed'`.
- Gathering is monotonic: it never falls apart again while the user watches
  (unless files are removed, and then gently).
- Works from Start (`npm run start:app`) and the bare server (`npm start`),
  on a fresh agent and on a reload (`/new?agent=…`, `still: true`).
- A new `src/server/public/left-side.js` module is fine; notes in
  `design-jony.md` in this folder.

**Done when:** from Start, pick a folder, and the left field goes from mess to
identity as files are processed, matching Merlin's recipe; Reduce Motion
shows the same states with no motion.
**Tests that must pass:**
- new `src/server/public/left-side.test.mjs`: gathered share is 0 with no
  processed file, 1 with all processed, never goes down as more files get
  processed, the same inputs give the same frame, Reduce Motion gives still
  positions;
- the existing `creation-screen.test.mjs`, `creation-field.test.mjs`,
  `fireflies-dna.test.mjs`, `firefly-gather.test.mjs`,
  `firefly-orbit.test.mjs`, `file-intake.test.mjs` all still pass;
- `checks/left-side-check.cjs` (browser): screenshots show the mess at 0 %
  and a recognisable identity at 100 % (pixels, not only internal state),
  smooth frames at 3,000 drawn flies, no motion under Reduce Motion.

## Phase 4: the small arrow and the orchestration chat (owner: Jony)

- A small arrow on the left edge, quiet but findable. Click, Enter or Space
  opens the chat; it slides out from the left edge as a glass panel
  (blur behind, right corners rounded, left edge merged).
- The chat talks to the existing `POST /api/agents/:id/chat`. When the AI is
  ready it proposes to build; the user can press **Create**, ask for more
  questions, or just keep chatting.
- One clear way out: the back arrow on top of the panel (Esc does the same
  thing, as the keyboard form of the same action, not a second button).
  Closing returns focus to the left arrow and shows the DNA again.
- Small screens: the panel never covers the whole window with no way out;
  the arrow and back arrow stay reachable; text stays readable.
- What the chat said stays when it is closed and opened again.

**Done when:** open, chat, close works by mouse, keyboard only, and in a
narrow window (down to 800 px wide), from Start.
**Tests that must pass:**
- unit tests for open/close state, focus return and "history kept";
- `checks/left-side-check.cjs` extended: arrow found by Tab, opens with
  Enter, Esc and the back arrow close it, focus lands back on the arrow,
  panel fits at 800 × 600 and at 1440 × 900, blur visible behind it;
- all tests from phase 3 still pass.

## Phase 5: Eraser sign-off (owner: Eraser)

- Review from Start for clutter, confusing magic, and two ways of doing one
  thing (the chat must have exactly one way in and one way out).
- Write `Reports/left-side-signoff.md`, copy here as `review-eraser.md`. Send
  the must-change list to Jony; check every point after the fix.

**Done when:** Eraser writes a clear yes, the feature is set to done, and this
folder is renamed to `2026-11-27 LEFT-SIDE - CLOSED`.
**Tests that must pass:** `npm test` (all of it) and
`checks/left-side-check.cjs` from Start, plus the older
`checks/fireflies-wander-check.cjs` and `checks/creation-screen-check.cjs`.

## Out of scope now (named, and why)

- **The agent "in the box"** (talking to the built agent through the faint
  chat over the DNA, seeing its skill and RAG calls). It needs a built agent
  first; it is the next update after this one.
- **The middle fireflies glowing one by one as files are allocated** into
  the final DNA structure. Same reason: it follows the build.
- **Allocation by chat** ("move all outstanding files to knowledge"). The
  chat in phase 4 may already do this through the creator engine, but its
  own visuals belong to the update above.
- **Phones.** The app is a desktop app; "small screen" here means a small
  laptop or a narrow window.

## Live status

- [x] Phase 1: research (Columbo): this file and `Reports/left-side-behaviours.md`
- [ ] Phase 2: magic (Merlin)
- [ ] Phase 3: Left Side build (Jony)
- [ ] Phase 4: arrow and orchestration chat (Jony)
- [ ] Phase 5: sign-off (Eraser)

## Files in this folder

- `update v1.md`: this roadmap (Columbo)
- `magic-merlin.md`: copy of the magic recipe (Merlin)
- `design-jony.md`: design and build notes (Jony)
- `review-eraser.md`: copy of the sign-off (Eraser)
