// The creator's use cases: what the server routes (and later a desktop
// shell) call. Store and engine are passed in; no HTTP here.

import { applyPatch, isEmpty, trackHandEdits, trackHandLines } from "./draft.mjs";
import { dnaOf } from "./files.mjs";
import { sortFiles } from "./intake/rules.mjs";
import { askedPaths, scanAsked } from "./intake/scanAsked.mjs";
import { createMaterial } from "./agentMaterial.mjs";
import { createTexts } from "./agentTexts.mjs";
import { creatorTurn } from "./creatorTurn.mjs";
import { createTalk } from "./agentTalk.mjs";
import { createSourceMemory } from "./sourceText/memory.mjs";
import { createKnowledgeBase } from "./knowledge/knowledgeBase.mjs";
import { createEmbedder } from "./knowledge/embedder.mjs";
import { createKnowledgeBuilder } from "./knowledge/knowledgeBuilder.mjs";
import { createPersonaBuilder } from "./persona/personaBuilder.mjs";
import { createCapabilityBuilder } from "./capability/capabilityBuilder.mjs";
import { defaultHome } from "./agentStore.mjs";
import { join } from "node:path";
import { homedir } from "node:os";

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
const view = ({ id, draft, sessionId, files = [], chat = [], talk = [], createdAt, updatedAt }) =>
  ({ id, draft, sessionId, files, chat, talk, dna: dnaOf(files, createdAt || updatedAt) });

// The chat as the panel shows it again after a reload; the oldest lines go first.
export const CHAT_KEEP = 200;
export const withTurn = (chat = [], message, say) =>
  [...chat, { who: "you", text: message }, { who: "sketcher", text: say }].slice(-CHAT_KEEP);
const isUnused = (record) => isEmpty(record.draft) && !record.sessionId && !record.files?.length;

// The local model, kept next to the agents; loaded only when first used.
const defaultEmbedder = () => createEmbedder({ cacheDir: join(defaultHome(), "models") });

// Files, sections and texts are their own use cases (agentMaterial.mjs,
// agentTexts.mjs), offered here so callers hold one object. `readOriginal`
// reads a file's original bytes once, to keep its copy (sourceText/memory.mjs).
// `embedder` turns Knowledge copies into the agent's searchable store.
// `random` draws the creator's random samples; `home` is where "~/" starts.
export function createAgents({
  store, engine, now = () => new Date(), readOriginal, embedder = defaultEmbedder(), random = Math.random, home = homedir(),
}) {
  const memory = createSourceMemory({ store, readOriginal });
  const knowledge = createKnowledgeBase({ store, memory, embedder });
  // A file gone for good leaves no copy and no chunks behind.
  const forget = async (id, paths) => {
    await memory.forgetCopies(id, paths);
    await knowledge.forget(id, paths);
  };
  const material = createMaterial({ store, memory, forget, now });
  const capability = createCapabilityBuilder({ store, engine, memory, now });
  return {
    ...material,
    ...createTexts({ store, material, now }),
    ...createTalk({ store, engine, memory, knowledge }),
    ...createKnowledgeBuilder({ store, memory, knowledge, forget, now }),
    ...createPersonaBuilder({ store, engine, memory, forget }),
    ...capability,
    putSource: memory.putSource,
    // Call after any change that may bring new Knowledge copies (chat, a
    // drop, putSource). → [{ type: "embedded" | "embed-failed", file, reason? }].
    embedKnowledge: knowledge.embedFiles,

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
    // The creator sees file paths only: it may have paths read in
    // (patch.paths, `onFiles` gets each batch found), then route files by
    // path (patch.files) and by plain-word rules (patch.rules).
    // `intake` reports that ({ added, skipped, rules }), null when not asked.
    async chat(id, message, { onSay, onFiles, signal, traceId } = {}) {
      const before = await store.loadAgent(id);
      const capabilities = await capability.getCapabilities(id);
      const turn = await creatorTurn(
        { message, draft: before.draft, handEdited: before.handEdited, handLines: before.handLines, files: before.files, capabilities, sessionId: before.sessionId },
        { engine, onSay, signal, traceId },
      );
      const paths = askedPaths(turn.patch?.paths, home);
      const scanned = await scanAsked(paths, { scan: (roots, options) => material.scan(id, roots, options), onFiles, signal, traceId });
      const latest = await store.loadAgent(id);
      const { draft, changed } = applyPatch(latest.draft, turn.patch);
      const sorted = sortFiles(latest.files ?? [], turn.patch ?? {}, random);
      const handEdited = trackHandEdits(latest.handEdited, changed, "creator");
      const handLines = trackHandLines(latest.handLines, latest.draft, draft, "creator");
      const chat = withTurn(latest.chat, message, turn.say);
      await store.saveDraft(id, { draft, handEdited, handLines, files: sorted.files, sessionId: turn.sessionId, chat });
      const files = sorted.changed.length ? await memory.copySources(id, { traceId }) : sorted.files;
      // A kept agent is never "ready to create" again, nor is an empty draft.
      const ready = turn.ready === true && draft.status !== "saved" && !isEmpty(draft);
      const intake = paths.length || sorted.rules.length ? { added: scanned.added.length, skipped: scanned.skipped, rules: sorted.rules } : null;
      return { say: turn.say, draft, changed, files, filesChanged: sorted.changed, intake, sessionId: turn.sessionId, ready };
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
