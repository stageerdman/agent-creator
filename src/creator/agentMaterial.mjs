// What an agent is made of, file by file: dropping, scanning, sorting files
// into the menu's sections, removing them, and the builder's reports.
// Use cases over the store; the rules live in files.mjs and sections.mjs.
// Every change answers with `dna`, so the screen redraws without asking again.

import { addFiles, dnaOf } from "./files.mjs";
import { scanPaths } from "./folderScan.mjs";
import { assignFiles, feedFor, markProcessed, rebuilt, removeFile, sectionFiles } from "./sections.mjs";

const dnaOfRecord = (record, files = record.files ?? []) => dnaOf(files, record.createdAt || record.updatedAt);

export function createMaterial({ store, now = () => new Date() }) {
  // Loads, changes and saves the file list; `change(files, record)` → { files, ...answer }.
  async function changeFiles(id, change) {
    const record = await store.loadAgent(id);
    const { files, ...answer } = change(record.files ?? [], record);
    if (files !== record.files) await store.saveDraft(id, { files });
    return { ...answer, files, dna: dnaOfRecord(record, files) };
  }

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
    assign: (id, section, entries) =>
      changeFiles(id, (files, record) => {
        const feed = feedFor(section, record.skills);
        const joined = addFiles(files, entries, now().toISOString()).files;
        const assigned = assignFiles(joined, feed, entries.map((entry) => entry.path));
        return { files: assigned.files, section: sectionFiles(assigned.files, feed), changed: assigned.changed };
      }),

    // → { path, state: "gone" | "removed", dna }.
    removeFile: (id, path) =>
      changeFiles(id, (files) => ({ ...removeFile(files, path), path })),

    // The builder's reports (no endpoint yet): these files are now in `section`…
    markProcessed: (id, section, paths) =>
      changeFiles(id, (files, record) => ({ files: markProcessed(files, feedFor(section, record.skills), paths) })),

    // …and a full rebuild is done: removed files are gone, the rest green.
    rebuilt: (id) => changeFiles(id, (files) => ({ files: rebuilt(files) })),
  };
  return material;
}

// What the screen needs for a firefly; `source` stays on the server.
const publicEntry = ({ path, name, size }) => ({ path, name, size });
