// A stand-in for the real model in tests: bag of words hashed into a small
// vector, so texts sharing words are close. Same shape as embedder.mjs.

const DIMS = 64;

function hashOf(word) {
  let hash = 0;
  for (const char of word) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  return hash % DIMS;
}

export function wordVector(text) {
  const vector = new Array(DIMS).fill(0);
  for (const word of text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) vector[hashOf(word)] += 1;
  return vector;
}

// `fail`: a CantEmbed (or any error) every call throws, to test failures.
export function createFakeEmbedder({ fail } = {}) {
  const calls = { passages: 0, queries: 0 };
  const guard = () => {
    if (fail) throw fail;
  };
  return {
    model: "fake-words",
    dims: DIMS,
    calls,
    async embedPassages(texts) {
      guard();
      calls.passages += texts.length;
      return texts.map(wordVector);
    },
    async embedQuery(text) {
      guard();
      calls.queries += 1;
      return wordVector(text);
    },
  };
}
