# P8 · Chat with any agent, grounded in its RAG (v1)

## Goal

Pick any created agent and talk with it. Each answer is grounded in the
agent's own retrieval (P4) and shows **Where from**: the actual passages it
drew on, each with its file. An answer that drew on none says it is the
agent's **own view · no reference** (magic-merlin.md §"Source on an answer").

## What exists already (reused, not rebuilt)

- `creator/agentTalk.mjs`: a saved agent answers from system prompt,
  `context.md`, skills, skill files and the top-k passages
  `knowledgeBase.retrieve` finds for the message. The talk is kept.
- `talkPrompt.mjs`: numbered `<knowledge>` passages, a `<used>` block that
  names skills and files.
- `POST /api/agents/:id/talk` (SSE delta / done / error) and the Talk box on
  `/agents/:id`. The home lists every agent; any saved one opens to Talk.

The gap: `used` names files only. The user can't see *which* words an answer
stood on, and there is no "own view" signal. That is what P8 adds.

## Phases

1. **Passages in `<used>` (pure).** The rule asks for
   `"passages": [1, 3]`, the numbers of the `<knowledge>` passages the answer
   used. `sourcesOf(patch, excerpts)` → `[{ file, passage }]`, only valid
   numbers, no repeats, in the order given. A passage's file also counts as
   a used file. Tests in `talkPrompt.test.mjs`.
2. **Kept and sent.** `talk()` returns `{ say, used, sources }`; each agent
   line in the record keeps `sources` (empty = own view). The SSE `done`
   carries them. Tests with the fake CLI, server and creator side.
3. **Where from on the page.** Under an answer: one `Where from` details
   with each passage and its file, or `[Name]'s own view · no reference`.
   Tests in `agent-page.test.mjs`.
4. **Ship.** Full suite, rebuild the app (`npm run build:app`), check Start
   and the page answers, tick this roadmap, feature status.

## Status

- [x] Phase 1
- [x] Phase 2
- [x] Phase 3
- [x] Phase 4 (388 tests: 386 pass, 0 fail, 2 skipped; app rebuilt and
  installed; bare server answers `/` and `/agents/:id`)
