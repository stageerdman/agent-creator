// Writes an agent from its persona sources (the System prompt section, feed
// "instructions"): one engine call reads their text copies and proposes
// name, persona, instructions and the person's background. Fields edited by
// hand are kept; the background is saved as context.md, which talk puts
// right after the agent's identity. The files used turn green.

import { askWithBlock } from "../askWithBlock.mjs";
import { applyPatch, trackHandEdits, trackHandLines } from "../draft.mjs";
import { BadInput } from "../errors.mjs";
import { changeFiles } from "../fileList.mjs";
import { feedOf } from "../files.mjs";
import { rebuiltFeed } from "../sections.mjs";
import { createLogger } from "../../log/logger.mjs";
import { packSources } from "../sourceText/pack.mjs";
import { PERSONA_TAG, buildPersonaMessage, buildPersonaPrompt, readGenerated } from "./personaPrompt.mjs";

const log = createLogger("personaBuilder");
export const PERSONA_FEED = "instructions";
export const CONTEXT_FILE = "context.md";

// `memory`: sourceText/memory.mjs; `forget(id, paths)` lets go of a file
// gone for good. `cap`: characters of source text one call may carry.
export function createPersonaBuilder({ store, engine, memory, forget, cap }) {
  // → { parts: [{ path, text }], skipped: [{ path, reason }] }.
  async function readSources(id, files) {
    const parts = [];
    const skipped = [];
    for (const file of feedOf(files, PERSONA_FEED)) {
      const text = file.text === "ok" ? await memory.readCopy(id, file.path) : "";
      if (text.trim()) parts.push({ path: file.path, text });
      else skipped.push({ path: file.path, reason: file.text && file.text !== "ok" ? file.text : "no-copy" });
    }
    return { parts, skipped };
  }

  // Applied to the draft as it is after the reply, so nothing typed meanwhile is lost.
  async function saveFields(id, fields) {
    const latest = await store.loadAgent(id);
    const kept = latest.handEdited ?? [];
    const writable = Object.fromEntries(Object.entries(fields).filter(([field]) => !kept.includes(field)));
    const { draft, changed } = applyPatch(latest.draft, writable);
    const handEdited = trackHandEdits(kept, changed, "creator");
    const handLines = trackHandLines(latest.handLines, latest.draft, draft, "creator");
    await store.saveDraft(id, { draft, handEdited, handLines });
    return { draft, changed, kept };
  }

  return {
    // → { say, draft, changed, kept, context, used, cut, skipped, dna }.
    // No usable source is BadInput; a reply without a valid block saves nothing.
    async buildPersona(id, { onSay, signal, traceId } = {}) {
      const files = await memory.copySources(id, { traceId });
      const { parts, skipped } = await readSources(id, files);
      if (!parts.length) throw new BadInput("No persona source with text: add files to the System prompt section first.");
      const { sources, cut } = packSources(parts, cap);
      const record = await store.loadAgent(id);
      const input = {
        message: buildPersonaMessage({ sources, cut, draft: record.draft, handEdited: record.handEdited, handLines: record.handLines }),
        systemPrompt: buildPersonaPrompt(),
      };
      const reply = await askWithBlock(engine, input, PERSONA_TAG, { onSay, signal, traceId });
      const generated = readGenerated(reply.patch);
      // Written before anything turns green: a failed write bakes nothing.
      if (generated.context) await store.writeText(id, CONTEXT_FILE, generated.context);
      const { draft, changed, kept } = await saveFields(id, generated.fields);
      const used = sources.map((source) => source.path);
      const { dna, dropped } = await changeFiles(store, id, (files) => rebuiltFeed(files, PERSONA_FEED, used));
      await forget(id, dropped);
      log.info("buildPersona", "persona built", { id, used: used.length, cut: cut.length, skipped: skipped.length, changed, traceId });
      const context = await store.readText(id, CONTEXT_FILE);
      return { say: reply.say, draft, changed, kept, context, used, cut, skipped, dna };
    },

    // → { text }: "" until a persona build wrote one.
    async getContext(id) {
      await store.loadAgent(id);
      return { text: await store.readText(id, CONTEXT_FILE) };
    },
  };
}
