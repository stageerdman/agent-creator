// Loads, changes and saves an agent's file list in one step, answering with
// `dna` so the screen redraws without asking again. Shared by every use case
// that edits the list (agentMaterial.mjs, knowledge/knowledgeBuilder.mjs).

import { dnaOf } from "./files.mjs";

export const dnaOfRecord = (record, files = record.files ?? []) => dnaOf(files, record.createdAt || record.updatedAt);

// `change(files, record)` → { files, ...answer }; saved only if `files` is new.
// → { ...answer, files, dna }.
export async function changeFiles(store, id, change) {
  const record = await store.loadAgent(id);
  const { files, ...answer } = change(record.files ?? [], record);
  if (files !== record.files) await store.saveDraft(id, { files });
  return { ...answer, files, dna: dnaOfRecord(record, files) };
}
