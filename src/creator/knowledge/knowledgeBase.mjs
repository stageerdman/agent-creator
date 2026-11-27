// An agent's own knowledge store: the plain-text copy of every Knowledge
// file (feed "rag") is cut into chunks, embedded locally and kept in
// `knowledge/index.json` in the agent's folder. Each file records how it
// went in `embed`: "ok", or why not ("no-text", "not-found"). A file counts
// as embedded only when a search with a line of it finds it again.

import { CantEmbed } from "../errors.mjs";
import { markFiles } from "../fileMarks.mjs";
import { createLogger } from "../../log/logger.mjs";
import { chunkText } from "./chunk.mjs";
import { emptyIndex, search, withFile, withoutFiles } from "./vectorIndex.mjs";

const log = createLogger("knowledgeBase");
const INDEX = "knowledge/index.json";
const PROOF_K = 5;
// A file alone in the index is always among the top k; it must also be
// close. A line of a chunk scores ~0.5–0.9 against it, unrelated text < 0.2.
const PROOF_MIN_SCORE = 0.4;
export const RETRIEVE_K = 5;

const isKnowledge = (file) => !file.removed && file.feeds.includes("rag") && file.text === "ok";
const needsEmbed = (file) => isKnowledge(file) && !file.embed;
const isEmbedded = (file) => isKnowledge(file) && file.embed === "ok";

// The longest line of the first chunk: the likeliest to be the file's own.
const probeOf = (chunks) =>
  chunks[0]
    .split("\n")
    .map((line) => line.trim())
    .reduce((best, line) => (line.length > best.length ? line : best), "")
    .slice(0, 300);

const embedded = (file) => ({ type: "embedded", file });
const failed = (file, reason) => ({ type: "embed-failed", file, reason });

// `memory`: sourceText/memory.mjs; `embedder`: embedder.mjs (or a fake).
export function createKnowledgeBase({ store, memory, embedder }) {
  const queues = new Map();
  // One write at a time per agent: each one rewrites the whole index. The
  // queue only keeps the order; a failure reaches the caller through `run`.
  function serial(id, work) {
    const run = (queues.get(id) ?? Promise.resolve()).then(work);
    queues.set(id, run.catch(() => {}));
    return run;
  }

  async function loadIndex(id) {
    const text = await store.readText(id, INDEX);
    return text ? JSON.parse(text) : emptyIndex(embedder.model, embedder.dims);
  }

  const saveIndex = (id, index) => store.writeText(id, INDEX, JSON.stringify(index));

  // → { index, mark }. A file its own line can't find is left out.
  async function embedOne(id, index, path) {
    const chunks = chunkText(await memory.readCopy(id, path));
    if (!chunks.length) return { index, mark: "no-text" };
    const vectors = await embedder.embedPassages(chunks);
    const next = withFile(index, path, chunks.map((text, i) => ({ text, vector: vectors[i] })));
    const hits = search(next, await embedder.embedQuery(probeOf(chunks)), PROOF_K);
    if (hits.some((hit) => hit.file === path && hit.score >= PROOF_MIN_SCORE)) return { index: next, mark: "ok" };
    return { index: withoutFiles(next, [path]), mark: "not-found" };
  }

  // A model that can't run fails every file left, unmarked: tried again later.
  async function embedPending(id, pending, traceId) {
    let index = await loadIndex(id);
    const marks = new Map();
    const events = [];
    for (const [at, { path }] of pending.entries()) {
      try {
        const result = await embedOne(id, index, path);
        index = result.index;
        marks.set(path, { embed: result.mark });
        events.push(result.mark === "ok" ? embedded(path) : failed(path, result.mark));
      } catch (error) {
        if (!(error instanceof CantEmbed)) throw new Error(`Embedding ${path} of agent ${id} failed: ${error.message}`, { cause: error });
        log.warn("embedFiles", "model can't run, will retry", { id, path, reason: error.reason, error: error.cause ?? error, traceId });
        events.push(...pending.slice(at).map((file) => failed(file.path, error.reason)));
        break;
      }
    }
    await saveIndex(id, index);
    await markFiles(store, id, marks);
    return events;
  }

  return {
    // Embeds every Knowledge file with a copy and no `embed` mark yet.
    // → [{ type: "embedded", file } | { type: "embed-failed", file, reason }].
    embedFiles: (id, { traceId } = {}) =>
      serial(id, async () => {
        const pending = ((await store.loadAgent(id)).files ?? []).filter(needsEmbed);
        return pending.length ? embedPending(id, pending, traceId) : [];
      }),

    // → the k chunks closest to `query`, best first: [{ file, text, score }].
    // Only files still in Knowledge and proven count; none → no model load.
    async retrieve(id, query, k = RETRIEVE_K) {
      const allowed = new Set(((await store.loadAgent(id)).files ?? []).filter(isEmbedded).map((file) => file.path));
      if (!allowed.size) return [];
      const index = await loadIndex(id);
      const chunks = index.chunks.filter((chunk) => allowed.has(chunk.file));
      if (!chunks.length) return [];
      return search({ ...index, chunks }, await embedder.embedQuery(query), k);
    },

    forget: (id, paths) =>
      serial(id, async () => {
        if (!paths.length) return;
        const index = await loadIndex(id);
        const kept = withoutFiles(index, paths);
        if (kept.chunks.length !== index.chunks.length) await saveIndex(id, kept);
      }),
  };
}
