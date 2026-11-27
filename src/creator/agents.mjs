// The creator's use cases: what the server routes (and later a desktop
// shell) call. Store and engine are passed in; no HTTP here.

import { applyPatch, isEmpty, trackHandEdits, trackHandLines } from "./draft.mjs";
import { dnaOf, routeFiles } from "./files.mjs";
import { createMaterial } from "./agentMaterial.mjs";
import { createTexts } from "./agentTexts.mjs";
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
const view = ({ id, draft, sessionId, files = [], chat = [], createdAt, updatedAt }) =>
  ({ id, draft, sessionId, files, chat, dna: dnaOf(files, createdAt || updatedAt) });

// The chat as the panel shows it again after a reload; the oldest lines go first.
export const CHAT_KEEP = 200;
export const withTurn = (chat = [], message, say) =>
  [...chat, { who: "you", text: message }, { who: "sketcher", text: say }].slice(-CHAT_KEEP);
const isUnused = (record) => isEmpty(record.draft) && !record.sessionId && !record.files?.length;

// Files, sections and texts are their own use cases (agentMaterial.mjs,
// agentTexts.mjs), offered here so callers hold one object.
export function createAgents({ store, engine, now = () => new Date() }) {
  const material = createMaterial({ store, now });
  return {
    ...material,
    ...createTexts({ store, material, now }),

    // Reuses an untouched empty agent, so hidden empty ones never pile up (R8).
    async create() {
      const unused = (await store.listAgents()).find(isUnused);
      return { id: (unused ?? (await store.createAgent())).id };
    },

    // Empty agents are left out of the switcher (R8); one made only of
    // dropped files is in it, so its files are never out of reach.
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
      const chat = withTurn(latest.chat, message, turn.say);
      await store.saveDraft(id, { draft, handEdited, handLines, files: routed.files, sessionId: turn.sessionId, chat });
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

    keep: async (id) => (await store.markSaved(id)).draft,

    remove: (id) => store.deleteAgent(id),
  };
}
