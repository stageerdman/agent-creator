// One streaming engine call whose answer may end in a `<tag>{json}</tag>`
// block: the live deltas and the final text never show the block.
// Shared by the creator's turn (`draft`) and an agent's talk (`used`).

import { splitReply, streamFilter } from "./creatorReply.mjs";

// → { say, patch | null, sessionId }. Engine errors pass through untouched,
// so their `kind` reaches the caller.
export async function askWithBlock(engine, input, tag, { onSay = () => {}, signal, traceId } = {}) {
  const filter = streamFilter(tag);
  const reply = await engine.askAgent(input, { onDelta: (text) => emit(onSay, filter.push(text)), signal, traceId });
  emit(onSay, filter.flush());
  const { say, patch } = splitReply(reply.text, tag);
  return { say, patch, sessionId: reply.sessionId };
}

function emit(onSay, text) {
  if (text) onSay(text);
}
