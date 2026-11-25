// The creator's use cases: what the server routes (and later a desktop
// shell) call. Store and engine are passed in; no HTTP here.

import { applyPatch, isEmpty, trackHandEdits, trackHandLines } from "./draft.mjs";
import { addFiles, routeFiles } from "./files.mjs";
import { creatorTurn } from "./creatorTurn.mjs";

const summary = ({ id, draft, updatedAt }) => ({ id, draft: { name: draft.name, status: draft.status }, updatedAt });
const view = ({ id, draft, sessionId, files = [] }) => ({ id, draft, sessionId, files });
const isUnused = (record) => isEmpty(record.draft) && !record.sessionId && !record.files?.length;

export function createAgents({ store, engine }) {
  return {
    // Reuses an untouched empty agent, so hidden empty ones never pile up (R8).
    async create() {
      const unused = (await store.listAgents()).find(isUnused);
      return { id: (unused ?? (await store.createAgent())).id };
    },

    // Empty agents are left out of the switcher (R8).
    list: async () => (await store.listAgents()).filter((r) => !isEmpty(r.draft)).map(summary),

    get: async (id) => view(await store.loadAgent(id)),

    // One chat turn. The patch is applied to the draft as it is *after* the
    // reply, so nothing saved meanwhile is lost. Autosaved before resolving.
    // The creator sees file paths only and may route them (patch.files).
    async chat(id, message, { onSay, signal, traceId } = {}) {
      const before = await store.loadAgent(id);
      const turn = await creatorTurn(
        { message, draft: before.draft, handEdited: before.handEdited, handLines: before.handLines, files: before.files, sessionId: before.sessionId },
        { engine, onSay, signal, traceId },
      );
      const latest = await store.loadAgent(id);
      const { draft, changed } = applyPatch(latest.draft, turn.patch);
      const routed = routeFiles(latest.files ?? [], turn.patch?.files);
      const handEdited = trackHandEdits(latest.handEdited, changed, "creator");
      const handLines = trackHandLines(latest.handLines, latest.draft, draft, "creator");
      await store.saveDraft(id, { draft, handEdited, handLines, files: routed.files, sessionId: turn.sessionId });
      return { say: turn.say, draft, changed, files: routed.files, filesChanged: routed.changed, sessionId: turn.sessionId };
    },

    // A hand edit: autosaved, and its fields are "yours" until the creator changes them.
    async edit(id, fields) {
      const record = await store.loadAgent(id);
      const { draft, changed } = applyPatch(record.draft, fields);
      if (changed.length === 0) return draft;
      const handEdited = trackHandEdits(record.handEdited, changed, "hand");
      const handLines = trackHandLines(record.handLines, record.draft, draft, "hand");
      return (await store.saveDraft(id, { draft, handEdited, handLines })).draft;
    },

    // Dropped or picked files join the DNA file list, unrouted. Never the chat.
    async addFiles(id, entries) {
      const record = await store.loadAgent(id);
      const { files, added } = addFiles(record.files ?? [], entries);
      if (added.length) await store.saveDraft(id, { files });
      return { files, added };
    },

    keep: async (id) => (await store.markSaved(id)).draft,
  };
}
