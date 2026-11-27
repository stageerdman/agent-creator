// Throwaway spike: does fastembed (Node) embed locally with all-MiniLM-L6-v2,
// and does a line from a text find its own passage? Run: node spike.mjs <cacheDir>
import { EmbeddingModel, FlagEmbedding } from "fastembed";

const cacheDir = process.argv[2];
const started = Date.now();
const model = await FlagEmbedding.init({ model: EmbeddingModel.AllMiniLML6V2, cacheDir, showDownloadProgress: false });
console.log("loaded in", Date.now() - started, "ms");

const passages = [
  "Tony believes that the quality of your life is the quality of your emotions.",
  "Sourdough needs a starter fed with flour and water every day.",
  "The Rust borrow checker prevents data races at compile time.",
];
const vectors = [];
for await (const batch of model.embed(passages, 16)) vectors.push(...batch);
console.log("dims", vectors[0].length, "type", vectors[0].constructor.name);

const query = await model.queryEmbed("what does he say about emotions and life");
const cos = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0) / Math.hypot(...a) / Math.hypot(...b);
console.log(passages.map((p, i) => [cos(query, vectors[i]).toFixed(3), p.slice(0, 40)]));
