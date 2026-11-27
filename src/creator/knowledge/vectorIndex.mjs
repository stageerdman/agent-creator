// An agent's searchable knowledge as plain data:
// { model, dims, chunks: [{ file, text, vector }] }. Pure functions only, so
// the store can keep it as JSON. Brute-force cosine is plenty for the few
// thousand chunks one agent has.

export const emptyIndex = (model, dims) => ({ model, dims, chunks: [] });

export function cosine(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
}

export const withoutFiles = (index, files) => {
  const gone = new Set(files);
  return { ...index, chunks: index.chunks.filter((chunk) => !gone.has(chunk.file)) };
};

// A file's chunks replace whatever it had before. `pieces`: [{ text, vector }].
export function withFile(index, file, pieces) {
  const rest = withoutFiles(index, [file]);
  const added = pieces.map(({ text, vector }) => ({ file, text, vector: Array.from(vector) }));
  return { ...rest, chunks: [...rest.chunks, ...added] };
}

// → the k chunks closest to the query, best first: [{ file, text, score }].
export const search = (index, queryVector, k) =>
  index.chunks
    .map(({ file, text, vector }) => ({ file, text, score: cosine(queryVector, vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

export const filesIn = (index) => [...new Set(index.chunks.map((chunk) => chunk.file))];
