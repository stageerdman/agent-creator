// The agent's own copy of every file it uses: plain text kept at
// `sources/<path>.txt` in its folder, so nothing depends on the original
// staying where it was. Each file records how its copy went in `text`:
// "ok", or the reason it has none ("binary", "empty", "unreadable-pdf").

import { readFile } from "node:fs/promises";
import { BadInput, CantExtract, NotFound } from "../errors.mjs";
import { markFiles } from "../fileMarks.mjs";
import { normalPath } from "../files.mjs";
import { createLogger } from "../../log/logger.mjs";
import { extractPlainText } from "./extract.mjs";

const log = createLogger("sourceMemory");

export const sourceCopyOf = (path) => `sources/${path}.txt`;

// A copy the user writes must say something; an empty one is a take-out.
export function requireCopyText(text) {
  if (typeof text !== "string" || !text.trim()) throw new BadInput("`text` must be non-empty: take the source out instead.");
  return text;
}

const isUsed = (file) => !file.removed && file.feeds.length > 0;
const needsCopy = (file) => isUsed(file) && !file.text && file.source;

// `readOriginal(absolutePath)` → bytes; passed in so tests need no real files.
export function createSourceMemory({ store, readOriginal = readFile }) {
  // Writes the copy, → the `text` mark. Only CantExtract becomes a mark.
  async function keepText(id, path, bytes) {
    try {
      await store.writeText(id, sourceCopyOf(path), await extractPlainText(path, bytes));
      return "ok";
    } catch (error) {
      if (!(error instanceof CantExtract)) throw error;
      return error.reason;
    }
  }

  // A new copy makes the old embedding stale, so its `embed` mark goes too.
  const saveMarks = (id, marks) =>
    markFiles(store, id, new Map([...marks].map(([path, text]) => [path, { text, embed: undefined }])));

  async function knownPath(id, path) {
    const clean = normalPath(path);
    const record = await store.loadAgent(id);
    if (!(record.files ?? []).some((file) => file.path === clean)) throw new NotFound(`No file "${clean}" in this agent.`);
    return clean;
  }

  // An original that can't be read now (moved, no access) gets no mark,
  // so the next change tries again.
  async function copyOne(id, file, traceId) {
    let bytes;
    try {
      bytes = await readOriginal(file.source);
    } catch (error) {
      log.warn("copySources", "original not readable, will retry", { id, path: file.path, error, traceId });
      return null;
    }
    return keepText(id, file.path, bytes);
  }

  return {
    // Copies every used file that has an original on disk and no copy yet. → files.
    async copySources(id, { traceId } = {}) {
      const record = await store.loadAgent(id);
      const marks = new Map();
      for (const file of (record.files ?? []).filter(needsCopy)) {
        const mark = await copyOne(id, file, traceId);
        if (mark) marks.set(file.path, mark);
      }
      return saveMarks(id, marks);
    },

    // Content the page hands over for a file already in the list. → { path, text }.
    async putSource(id, path, bytes) {
      const clean = await knownPath(id, path);
      const text = await keepText(id, clean, bytes);
      await saveMarks(id, new Map([[clean, text]]));
      return { path: clean, text };
    },

    // The user's own wording replaces the extracted copy. → the files.
    async editCopy(id, path, text) {
      requireCopyText(text);
      const clean = await knownPath(id, path);
      await store.writeText(id, sourceCopyOf(clean), text);
      return saveMarks(id, new Map([[clean, "ok"]]));
    },

    readCopy: (id, path) => store.readText(id, sourceCopyOf(path)),

    async forgetCopies(id, paths) {
      for (const path of paths) await store.deleteText(id, sourceCopyOf(path));
    },
  };
}
