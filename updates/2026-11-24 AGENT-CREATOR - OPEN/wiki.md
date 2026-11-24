# Wiki — P2 agent creation by chat

## Backend shape (2026-11-24)

```
browser ──SSE── routes/agents.mjs ── creator/agents.mjs ──┬── creatorTurn ── engine.askAgent (P1)
                                                         └── agentStore (AGENT_CREATOR_HOME/agents/<id>/agent.json)
```

- `src/creator/` has no HTTP. `createAgents({ store, engine })` is the whole
  use-case surface (create, list, get, chat, edit, keep); a desktop shell
  can call it directly.
- The draft logic is pure (`draft.mjs`): `applyPatch` is the only way any
  field changes, for hand edits and creator patches alike. It drops unknown
  keys and non-strings, which is also the guard that keeps the P12 map out.
- `handEdited` is tracked on the server (`trackHandEdits`): a hand edit adds
  the field, a creator change to it removes it. The prompt lists them.

## Lessons

- **The draft goes in the system prompt, every turn.** `--system-prompt` is
  passed again on each `--resume`, so the creator always sees the latest
  draft (with hand edits) even though the resumed session remembers older
  versions. Verified live: a hand-edited persona survived a follow-up turn
  that changed the instructions.
- **Hide only the block, in both places.** If the stream filter hid
  "everything after `<draft>`" but `splitReply` kept text after the block,
  the streamed bubble and the final `say` would disagree. Both now remove
  just `<draft>…</draft>`; an unclosed block hides the rest in both.
- **Apply the patch to the freshest draft.** The CLI takes seconds; a save
  can land in between. `agents.chat` reloads the record after the reply
  and patches that.
- **Live behaviour (claude, 2026-11-24):** one line ("A stoic mentor who
  helps founders make hard calls.") gave all three fields, a voice-card
  blockquote `> **Marcus:** …`, one question with a suggested answer, and
  exactly one "If that's him, press Keep." "save it, I am done" got "Your
  work is saved automatically. Press Keep in the Sketch…" with no draft
  block. The `--resume`d session remembered earlier turns.
- **Live tests are opt-in.** `npm run test:live` (CLAUDE_LIVE=1) runs the
  real server + real CLI end to end (~30 s, a few cents). `npm test` skips
  it so the studio's test run stays offline and fast.
