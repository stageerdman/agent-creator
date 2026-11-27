// The creator's use cases: what the server routes (and later a desktop
// shell) call. Store and engine are passed in; no HTTP here.

import { applyPatch, isEmpty, trackHandEdits, trackHandLines } from "./draft.mjs";
import { addFiles, dnaOf, routeFiles } from "./files.mjs";
import { creatorTurn } from "./creatorTurn.mjs";

// The home's one-line description: the first sentence of persona, else of
// instructions, cut to about 80 characters. Empty when neither has text.
export function shortDescription({ persona = "", instructions = "" } = {}) {
  const text = (persona.trim() || instructions.trim()).replace(/\s+/g, " ");
  const first = text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
  return first.length > 80 ? `${first.slice(0, 79).trimEnd()}…` : first;
}
// The home sorts and ages rows by createdAt. Records written before the store
// kept it fall back to updatedAt: never undefined, never "now".
// `dna` is what the row's Fireflies DNA logo draws (files.mjs dnaOf).
export function summary({ id, draft, files, createdAt, updatedAt }) {
  const born = createdAt || updatedAt;
  return {
    id, draft: { name: draft.name, status: draft.status, description: shortDescription(draft) },
    createdAt: born, updatedAt, dna: dnaOf(files, born),
  };
}
const view = ({ id, draft, sessionId, files = [], createdAt, updatedAt }) =>
  ({ id, draft, sessionId, files, dna: dnaOf(files, createdAt || updatedAt) });
const isUnused = (record) => isEmpty(record.draft) && !record.sessionId && !record.files?.length;

export function createAgents({ store, engine, now = () => new Date() }) {
  return {
    // Reuses an untouched empty agent, so hidden empty ones never pile up (R8).
    async create() {
      const unused = (await store.listAgents()).find(isUnused);
      return { id: (unused ?? (await store.createAgent())).id };
    },

    // Empty agents are left out of the switcher (R8). One built from a folder
    // (files, no words yet) is not empty: home shows it at the top.
    list: async () => (await store.listAgents()).filter((r) => !isEmpty(r.draft) || r.files?.length).map(summary),

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
      const { files, added } = addFiles(record.files ?? [], entries, now().toISOString());
      if (added.length) await store.saveDraft(id, { files });
      return { files, added };
    },

    keep: async (id) => (await store.markSaved(id)).draft,

    remove: (id) => store.deleteAgent(id),
  };
}
