// What an agent is made of, file by file: dropping, scanning, sorting files
// into the menu's sections, removing them, and the builder's reports.
// Use cases over the store; the rules live in files.mjs and sections.mjs.
// Every change answers with `dna`, so the screen redraws without asking again.

import { addFiles, normalPath } from "./files.mjs";
import { changeFiles as changeFileList } from "./fileList.mjs";
import { scanPaths } from "./folderScan.mjs";
import { assignFiles, feedFor, markProcessed, rebuilt, removeFile, sectionFiles } from "./sections.mjs";

// `memory` (sourceText/memory.mjs) keeps the used files' plain-text copies;
// `forget(id, paths)` lets go of a file's copy and chunks once it is gone.
export function createMaterial({ store, memory, forget, now = () => new Date() }) {
  const changeFiles = (id, change) => changeFileList(store, id, change);

  const material = {
    // Dropped or picked files join the DNA file list, unrouted. Never the chat.
    addFiles: (id, entries) =>
      changeFiles(id, (files) => {
        const result = addFiles(files, entries, now().toISOString());
        return result.added.length ? result : { ...result, files }; // nothing new, nothing saved
      }),

    // Walks dropped folders on disk. `onFiles(files)` gets each batch as it
    // is found; the list is saved once, at the end, so a cancelled scan adds
    // nothing. → { added, total, skipped, dna }.
    async scan(id, roots, { onFiles = () => {}, signal } = {}) {
      await store.loadAgent(id); // unknown agent → not-found before any walking
      const found = await scanPaths(roots, { signal, onBatch: (batch) => onFiles(batch.map(publicEntry)) });
      signal?.throwIfAborted();
      const { added, dna } = await material.addFiles(id, found.files);
      return { added, total: found.files.length, skipped: found.skipped, dna };
    },

    // → [{ path, name, size, state }] for "system-prompt", "knowledge" or "skill:<id>".
    async sectionFiles(id, section) {
      const record = await store.loadAgent(id);
      return sectionFiles(record.files ?? [], feedFor(section, record.skills));
    },

    // Dropped onto a section: new files join the list, then all go into it.
    // → { section: [section files], changed: [paths newly in it], dna }.
    // Their plain-text copies are kept before answering.
    async assign(id, section, entries) {
      const { feed, changed, dna } = await changeFiles(id, (files, record) => {
        const feed = feedFor(section, record.skills);
        const joined = addFiles(files, entries, now().toISOString()).files;
        return { ...assignFiles(joined, feed, entries.map((entry) => entry.path)), feed };
      });
      const files = await memory.copySources(id);
      return { files, section: sectionFiles(files, feed), changed, dna };
    },

    // → { path, state: "gone" | "removed", dna }. A gone file's copy goes too;
    // a removed one is still baked in, so its copy stays until the rebuild.
    async removeFile(id, path) {
      const answer = await changeFiles(id, (files) => ({ ...removeFile(files, path), path }));
      if (answer.state === "gone") await forget(id, [normalPath(path)]);
      return answer;
    },

    // The builder's reports (no endpoint yet): these files are now in `section`…
    markProcessed: (id, section, paths) =>
      changeFiles(id, (files, record) => ({ files: markProcessed(files, feedFor(section, record.skills), paths) })),

    // …and a full rebuild is done: removed files are gone, the rest green.
    async rebuilt(id) {
      const { dropped, ...answer } = await changeFiles(id, (files) =>
        ({ files: rebuilt(files), dropped: files.filter((file) => file.removed).map((file) => file.path) }));
      await forget(id, dropped);
      return answer;
    },
  };
  return material;
}

// What the screen needs for a firefly; `source` stays on the server.
const publicEntry = ({ path, name, size }) => ({ path, name, size });
