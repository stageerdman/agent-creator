// The RAG builder's use cases: list the Knowledge sources, adjust, swap or
// take one out, and Build the one knowledge file from what is searchable.
// The rules are pure (sources.mjs, merge.mjs, sections.mjs); this saves them.
// Only Build embeds; callers embed after a swap or an edit (embedFiles).

import { BadInput } from "../errors.mjs";
import { changeFiles as changeFileList } from "../fileList.mjs";
import { normalPath } from "../files.mjs";
import { rebuiltFeed } from "../sections.mjs";
import { requireCopyText } from "../sourceText/memory.mjs";
import { createLogger } from "../../log/logger.mjs";
import { KNOWLEDGE_FILE, mergeKnowledge } from "./merge.mjs";
import { KNOWLEDGE_FEED, adjustSource, buildPlan, sourcesOf, swapSource, takeOut } from "./sources.mjs";

const log = createLogger("knowledgeBuilder");

// `memory`: sourceText/memory.mjs; `knowledge`: knowledgeBase.mjs;
// `forget(id, paths)` lets go of a file's copy and chunks once it is gone.
export function createKnowledgeBuilder({ store, memory, knowledge, forget, now = () => new Date() }) {
  const changeFiles = (id, change) => changeFileList(store, id, change);
  const listed = (files, dna) => ({ sources: sourcesOf(files), dna });

  async function mergedText(id, files, built) {
    const byPath = new Map(files.map((file) => [file.path, file]));
    const parts = [];
    for (const path of built) {
      const { title, note } = byPath.get(path);
      parts.push({ path, title, note, text: await memory.readCopy(id, path) });
    }
    return mergeKnowledge(parts);
  }

  return {
    listSources: async (id) => ({ sources: sourcesOf((await store.loadAgent(id)).files ?? []) }),

    // { title?, note?, text? }: only what is given changes. → { source }.
    async adjustSource(id, path, { title, note, text } = {}) {
      if (title === undefined && note === undefined && text === undefined) throw new BadInput("Give a `title`, `note` or `text` to change.");
      if (text !== undefined) requireCopyText(text); // before anything is saved
      let { files } = await changeFiles(id, (files) => ({ files: adjustSource(files, path, { title, note }) }));
      if (text !== undefined) files = await memory.editCopy(id, path, text);
      return { source: sourcesOf(files).find((source) => source.path === normalPath(path)) };
    },

    // `file` ({ path, size, source? }) takes the source's place. → { sources, dna }.
    async swapSource(id, path, file) {
      const { dna } = await changeFiles(id, (files) => swapSource(files, path, file, now().toISOString()));
      await knowledge.forget(id, [normalPath(path)]);
      return listed(await memory.copySources(id), dna);
    },

    // Out of Knowledge only; the file stays in the agent. → { sources, dna }.
    async removeSource(id, path) {
      const { files, dna } = await changeFiles(id, (files) => ({ files: takeOut(files, path) }));
      await knowledge.forget(id, [normalPath(path)]);
      return listed(files, dna);
    },

    // Rewrites knowledge.md from exactly the searchable sources; those turn
    // green, the rest are reported. → { text, built, skipped, embeds, sources, dna }.
    async build(id, { traceId } = {}) {
      await memory.copySources(id, { traceId });
      const embeds = await knowledge.embedFiles(id, { traceId });
      const embedded = (await store.loadAgent(id)).files ?? [];
      const { built, skipped } = buildPlan(embedded);
      // Written before anything turns green: a failed write bakes nothing.
      const text = await mergedText(id, embedded, built);
      await store.writeText(id, KNOWLEDGE_FILE, text);
      const { files, dna, dropped } = await changeFiles(id, (files) => rebuiltFeed(files, KNOWLEDGE_FEED, built));
      await forget(id, dropped);
      log.info("build", "knowledge built", { id, built: built.length, skipped: skipped.length, dropped: dropped.length, traceId });
      return { text, built, skipped, embeds, ...listed(files, dna) };
    },
  };
}
