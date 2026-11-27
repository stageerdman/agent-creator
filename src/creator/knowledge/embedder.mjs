// The local embedding model: all-MiniLM-L6-v2 through fastembed (ONNX, on
// this machine, nothing sent anywhere). Loaded lazily on first use, once;
// the model files are kept in `cacheDir` (downloaded the first time).
// Everything else talks to the { model, dims, embedPassages, embedQuery }
// shape, so tests pass a fake.

import { CantEmbed } from "../errors.mjs";

export const MODEL_NAME = "all-MiniLM-L6-v2";
const DIMS = 384;
const BATCH = 16;

// Imported here, not at the top, so the server starts even when the native
// runtime can't load; then only embedding fails.
async function loadFastembed(cacheDir) {
  const { EmbeddingModel, FlagEmbedding } = await import("fastembed");
  return FlagEmbedding.init({ model: EmbeddingModel.AllMiniLML6V2, cacheDir, showDownloadProgress: false });
}

export function createEmbedder({ cacheDir, load = loadFastembed }) {
  let loading = null;
  // A failed load is forgotten so the next call tries again (e.g. back online).
  const model = () =>
    (loading ??= load(cacheDir).catch((error) => {
      loading = null;
      throw new CantEmbed("model-unavailable", error);
    }));

  return {
    model: MODEL_NAME,
    dims: DIMS,

    // → one plain number[] per text, in order.
    async embedPassages(texts) {
      const vectors = [];
      for await (const batch of (await model()).embed(texts, BATCH)) vectors.push(...batch.map((vector) => Array.from(vector)));
      return vectors;
    },

    async embedQuery(text) {
      return Array.from(await (await model()).queryEmbed(text));
    },
  };
}
