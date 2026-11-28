// Scores what an agent learned from: usefulness per file (AI, batches of
// excerpts, cached per file) and how well the persona captures its sources
// (AI, a separate call). Saved as quality.json for the user only; nothing
// the agent itself reads (talk, persona build) ever opens it.

import { askWithBlock } from "../askWithBlock.mjs";
import { BadInput, BadOutput } from "../errors.mjs";
import { createLogger } from "../../log/logger.mjs";
import { CONTEXT_FILE } from "../persona/personaBuilder.mjs";
import { readUsable } from "../sourceText/usable.mjs";
import { excerptOf } from "./excerpt.mjs";
import { USEFULNESS_BATCH, USEFULNESS_TAG, buildUsefulnessMessage, buildUsefulnessPrompt, readScores } from "./usefulnessPrompt.mjs";
import { PERSONA_RATING_TAG, buildPersonaRatingMessage, buildPersonaRatingPrompt, readRating } from "./personaRatingPrompt.mjs";
import {
  agentFingerprintOf, fileFingerprintOf, generatedOf, isPersonaPart, needsScore, personaFingerprintOf, reportOf,
} from "./qualityReport.mjs";

const log = createLogger("qualityBuilder");
export const QUALITY_FILE = "quality.json";

// The persona samples share about 60k characters: head, middle and tail of each.
const SAMPLE_BUDGET = 60_000;
export const samplePieceOf = (count) => Math.min(2000, Math.max(200, Math.floor(SAMPLE_BUDGET / (3 * count))));

const batchesOf = (list, size) =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, index) => list.slice(index * size, (index + 1) * size));

export function createQualityBuilder({ store, engine, memory, now = () => new Date() }) {
  async function loadSaved(id) {
    const text = await store.readText(id, QUALITY_FILE);
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Couldn't read ${QUALITY_FILE} of agent ${id}: ${error.message}`, { cause: error });
    }
  }

  // Everything the report and the build compare against, read from disk.
  async function currentOf(id, draft, files) {
    const { parts, skipped } = await readUsable(memory, id, files);
    const generated = generatedOf(draft, await store.readText(id, CONTEXT_FILE));
    return {
      draft, parts, skipped, generated, saved: await loadSaved(id),
      agentFingerprint: agentFingerprintOf(draft, parts), personaFingerprint: personaFingerprintOf(parts, generated),
    };
  }

  async function scoreBatch(batch, current, ask) {
    const files = batch.map(({ path, role, text }) => ({ path, role, excerpt: excerptOf(text) }));
    const message = buildUsefulnessMessage({ agent: current.draft, files });
    const reply = await ask({ message, systemPrompt: buildUsefulnessPrompt() }, USEFULNESS_TAG);
    const scores = readScores(reply.patch, batch.map((part) => part.path));
    const byPath = new Map(batch.map((part) => [part.path, part]));
    return Object.fromEntries(Object.entries(scores).map(([path, score]) =>
      [path, { ...score, fingerprint: fileFingerprintOf(byPath.get(path)), agent: current.agentFingerprint }]));
  }

  async function ratePersona(current, ask) {
    const sources = current.parts.filter(isPersonaPart);
    const piece = samplePieceOf(sources.length);
    const samples = sources.map(({ path, text }) => ({ path, excerpt: excerptOf(text, piece) }));
    const message = buildPersonaRatingMessage({ generated: current.generated, samples });
    const reply = await ask({ message, systemPrompt: buildPersonaRatingPrompt() }, PERSONA_RATING_TAG);
    return { ...readRating(reply.patch), fingerprint: current.personaFingerprint };
  }

  // One call's BadOutput is logged and leaves the old entry (shown stale);
  // any other error (engine, abort) ends the build.
  async function tryCall(what, call, context) {
    try {
      return await call();
    } catch (error) {
      if (!(error instanceof BadOutput)) throw error;
      log.warn("buildQuality", `${what} skipped: unusable answer`, { ...context, error });
      return null;
    }
  }

  return {
    // → the report (qualityReport.mjs). No usable source is BadInput; calls
    // made with none usable is BadOutput, and nothing is saved.
    async buildQuality(id, { onProgress = () => {}, signal, traceId } = {}) {
      const files = await memory.copySources(id, { traceId });
      const { draft } = await store.loadAgent(id);
      const current = await currentOf(id, draft, files);
      if (!current.parts.length) throw new BadInput("No source with text yet: add files the agent uses first.");
      const ask = (input, tag) => askWithBlock(engine, input, tag, { signal, traceId });
      const batches = batchesOf(needsScore(current.saved, current.parts, current.agentFingerprint), USEFULNESS_BATCH);
      const personaDue = current.personaFingerprint !== null && current.saved?.persona?.fingerprint !== current.personaFingerprint;
      const total = batches.length + (personaDue ? 1 : 0);
      let done = 0;
      let succeeded = 0;
      onProgress({ done, total });

      const kept = new Set(current.parts.map((part) => part.path));
      const scored = Object.fromEntries(Object.entries(current.saved?.files ?? {}).filter(([path]) => kept.has(path)));
      for (const batch of batches) {
        const scores = await tryCall("usefulness batch", () => scoreBatch(batch, current, ask), { id, size: batch.length, traceId });
        if (scores) {
          Object.assign(scored, scores);
          succeeded++;
        }
        onProgress({ done: ++done, total });
      }
      let persona = current.personaFingerprint === null ? null : current.saved?.persona ?? null;
      if (personaDue) {
        const rating = await tryCall("persona rating", () => ratePersona(current, ask), { id, traceId });
        if (rating) {
          persona = rating;
          succeeded++;
        }
        onProgress({ done: ++done, total });
      }
      if (total > 0 && succeeded === 0) throw new BadOutput("No scoring call gave a usable answer: nothing was saved.");

      const saved = { files: scored, persona, builtAt: now().toISOString() };
      await store.writeText(id, QUALITY_FILE, JSON.stringify(saved, null, 2));
      log.info("buildQuality", "quality built", { id, calls: total, succeeded, files: current.parts.length, traceId });
      return reportOf({ ...current, files, saved });
    },

    // → the report. Reads the copies already kept; never calls the engine.
    async getQuality(id) {
      const { draft, files = [] } = await store.loadAgent(id);
      const current = await currentOf(id, draft, files);
      return reportOf({ ...current, files });
    },
  };
}
