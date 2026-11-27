// Maps what an agent will be good at, medium at and not trained for: one
// engine call reads the text copies of every file it uses. The map is saved
// as capabilities.json for the user and the creator chat only; nothing the
// agent itself reads (talk, persona build) ever opens it.

import { askWithBlock } from "../askWithBlock.mjs";
import { BadInput } from "../errors.mjs";
import { createLogger } from "../../log/logger.mjs";
import { packSources } from "../sourceText/pack.mjs";
import { CAPABILITY_TAG, buildCapabilityMessage, buildCapabilityPrompt, readMap } from "./capabilityPrompt.mjs";
import { fingerprintOf, readUsable } from "./capabilitySources.mjs";

const log = createLogger("capabilityBuilder");
export const CAPABILITY_FILE = "capabilities.json";

// `memory`: sourceText/memory.mjs. `cap`: characters of source text one call may carry.
export function createCapabilityBuilder({ store, engine, memory, cap, now = () => new Date() }) {
  async function loadSaved(id) {
    const text = await store.readText(id, CAPABILITY_FILE);
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Couldn't read ${CAPABILITY_FILE} of agent ${id}: ${error.message}`, { cause: error });
    }
  }

  // Stale when the sources changed since the map was built, or there are
  // sources and no map yet. With no usable source there is nothing to map.
  const isStale = (saved, parts) => parts.length > 0 && saved?.fingerprint !== fingerprintOf(parts);

  return {
    // → { say, map, stale: false, used, cut, skipped }. No usable source is
    // BadInput; a reply without a valid block saves nothing.
    async buildCapabilities(id, { onSay, signal, traceId } = {}) {
      const files = await memory.copySources(id, { traceId });
      const { parts, skipped } = await readUsable(memory, id, files);
      if (!parts.length) throw new BadInput("No source with text yet: add files the agent uses first.");
      const { sources, cut } = packSources(parts, cap);
      const used = sources.map((source) => source.path);
      const input = { message: buildCapabilityMessage({ sources, cut }), systemPrompt: buildCapabilityPrompt() };
      const reply = await askWithBlock(engine, input, CAPABILITY_TAG, { onSay, signal, traceId });
      const map = { ...readMap(reply.patch, used), sources: used, builtAt: now().toISOString() };
      await store.writeText(id, CAPABILITY_FILE, JSON.stringify({ ...map, fingerprint: fingerprintOf(parts) }, null, 2));
      log.info("buildCapabilities", "map built", { id, used: used.length, cut: cut.length, skipped: skipped.length, traceId });
      return { say: reply.say, map, stale: false, used, cut, skipped };
    },

    // → { map | null, stale }. Reads the copies already kept; never calls the engine.
    async getCapabilities(id) {
      const record = await store.loadAgent(id);
      const { parts } = await readUsable(memory, id, record.files);
      const saved = await loadSaved(id);
      const stale = isStale(saved, parts);
      if (!saved) return { map: null, stale };
      const { fingerprint, ...map } = saved;
      return { map, stale };
    },
  };
}
