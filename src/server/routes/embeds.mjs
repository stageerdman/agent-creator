// Embedding follows a change the user already has (a chat turn, a drop, an
// upload), so its failure must not undo or hide that change. A model that
// can't run is already an `embed-failed` event; anything else is logged here
// with its trace and the files stay unmarked, so the next change retries them.

import { createLogger } from "../../log/logger.mjs";

const log = createLogger("embeds");

// → [{ type: "embedded" | "embed-failed", file, reason? }], never rejects.
export async function embedEvents(agents, id, traceId) {
  try {
    return await agents.embedKnowledge(id, { traceId });
  } catch (error) {
    log.error("embedEvents", "embedding failed, will retry on the next change", { id, traceId, error });
    return [];
  }
}
