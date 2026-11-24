// The creator's use cases: what the server routes (and later a desktop
// shell) call. Store and engine are passed in; no HTTP here.

import { applyPatch, isEmpty, trackHandEdits } from "./draft.mjs";
import { creatorTurn } from "./creatorTurn.mjs";

const summary = ({ id, draft, updatedAt }) => ({ id, draft: { name: draft.name, status: draft.status }, updatedAt });
const view = ({ id, draft, sessionId }) => ({ id, draft, sessionId });

export function createAgents({ store, engine }) {
  return {
    // Reuses an untouched empty agent, so hidden empty ones never pile up (R8).
    async create() {
      const unused = (await store.listAgents()).find((r) => isEmpty(r.draft) && !r.sessionId);
      return { id: (unused ?? (await store.createAgent())).id };
    },

    // Empty agents are left out of the switcher (R8).
    list: async () => (await store.listAgents()).filter((r) => !isEmpty(r.draft)).map(summary),

    get: async (id) => view(await store.loadAgent(id)),

    // One chat turn. The patch is applied to the draft as it is *after* the
    // reply, so nothing saved meanwhile is lost. Autosaved before resolving.
    async chat(id, message, { onSay, signal, traceId } = {}) {
      const before = await store.loadAgent(id);
      const turn = await creatorTurn(
        { message, draft: before.draft, handEdited: before.handEdited, sessionId: before.sessionId },
        { engine, onSay, signal, traceId },
      );
      const latest = await store.loadAgent(id);
      const { draft, changed } = applyPatch(latest.draft, turn.patch);
      const handEdited = trackHandEdits(latest.handEdited, changed, "creator");
      await store.saveDraft(id, { draft, handEdited, sessionId: turn.sessionId });
      return { say: turn.say, draft, changed, sessionId: turn.sessionId };
    },

    // A hand edit: autosaved, and its fields are "yours" until the creator changes them.
    async edit(id, fields) {
      const record = await store.loadAgent(id);
      const { draft, changed } = applyPatch(record.draft, fields);
      if (changed.length === 0) return draft;
      const handEdited = trackHandEdits(record.handEdited, changed, "hand");
      return (await store.saveDraft(id, { draft, handEdited })).draft;
    },

    keep: async (id) => (await store.markSaved(id)).draft,
  };
}
