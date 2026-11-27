// One creator turn: prompt from the current draft → streaming engine call →
// chat text without the draft block, plus the patch the creator proposed.
// Applying the patch is the caller's job, so it lands on the freshest draft.

import { buildCreatorPrompt, buildTurnMessage } from "./creatorPrompt.mjs";
import { saysReady } from "./creatorReply.mjs";
import { askWithBlock } from "./askWithBlock.mjs";

// Resolves to { say, patch | null, ready, sessionId }. `ready` is the
// creator's structured flag (patch.ready), never read from the words.
export async function creatorTurn({ message, draft, handEdited, handLines, files, sessionId }, { engine, onSay, signal, traceId }) {
  const input = { message: buildTurnMessage({ message, draft, handEdited, handLines, files }), systemPrompt: buildCreatorPrompt(), resumeSessionId: sessionId ?? undefined };
  const reply = await askWithBlock(engine, input, "draft", { onSay, signal, traceId });
  return { ...reply, ready: saysReady(reply.patch) };
}
