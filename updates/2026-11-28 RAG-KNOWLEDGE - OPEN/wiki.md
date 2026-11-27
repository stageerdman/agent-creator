# RAG knowledge — decisions and lessons

## The stack (spiked 2026-11-28, `spike/spike.mjs`)

- **Embeddings: `fastembed` (npm, 3.0.0), `AllMiniLML6V2`, 384 numbers.**
  Same library family and model as masters-wheel (Rust fastembed), so the
  behaviour carries over. Runs on device via onnxruntime-node; first load
  downloads the model once (~5 s here incl. download, cached after). No API
  key, no network afterwards. Spike: "what does he say about emotions and
  life" → 0.58 for the emotions passage, ≈0 for the unrelated two.
  `embed(texts, batch)` is an async generator of batches; `queryEmbed(text)`
  for questions. Vectors come back as plain arrays.
- Rejected `@huggingface/transformers`: pulls `sharp` (image library) and a
  second onnx runtime for nothing we use.
- Native parts (`onnxruntime-node`, `@anush008/tokenizers`) are prebuilt per
  platform; the Mac app must ship them in its `node_modules`.
- **Store: one JSON file per agent, brute-force cosine** — not SQLite +
  sqlite-vec as in masters-wheel. Node would need a native extension load
  for sqlite-vec; vec0 does brute-force KNN anyway, and one agent's
  knowledge is a few hundred to a few thousand chunks (masters-wheel's own
  note). Easy to swap behind vectorIndex if it ever outgrows that.
