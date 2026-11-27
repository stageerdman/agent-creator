// Puts marks (`text`, `embed`, …) on the file list as it is *now*: copying
// and embedding take a while, and the list may have changed meanwhile.
// `changes`: Map<path, fields to set>. → the files.
export async function markFiles(store, id, changes) {
  const latest = await store.loadAgent(id);
  if (!changes.size) return latest.files ?? [];
  const files = (latest.files ?? []).map((file) => (changes.has(file.path) ? { ...file, ...changes.get(file.path) } : file));
  await store.saveDraft(id, { files });
  return files;
}
