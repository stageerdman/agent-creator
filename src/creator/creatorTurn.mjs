// One creator turn: prompt from the current draft → streaming engine call →
// chat text without the draft block, plus the patch the creator proposed.
// Applying the patch is the caller's job, so it lands on the freshest draft.

import { buildCreatorPrompt, buildTurnMessage } from "./creatorPrompt.mjs";
import { splitReply, streamFilter } from "./creatorReply.mjs";

// Resolves to { say, patch | null, sessionId }. Engine errors pass through
// untouched, so their `kind` reaches the caller.
export async function creatorTurn({ message, draft, handEdited, handLines, files, sessionId }, { engine, onSay = () => {}, signal, traceId }) {
  const filter = streamFilter();
  const reply = await engine.askAgent(
    { message: buildTurnMessage({ message, draft, handEdited, handLines, files }), systemPrompt: buildCreatorPrompt(), resumeSessionId: sessionId ?? undefined },
    { onDelta: (text) => emit(onSay, filter.push(text)), signal, traceId },
  );
  emit(onSay, filter.flush());
  const { say, patch } = splitReply(reply.text);
  return { say, patch, sessionId: reply.sessionId };
}

function emit(onSay, text) {
  if (text) onSay(text);
}
