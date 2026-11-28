import { test } from "node:test";
import assert from "node:assert/strict";
import { BadOutput } from "../errors.mjs";
import { buildUsefulnessMessage, readScores } from "./usefulnessPrompt.mjs";
import { buildPersonaRatingMessage, readRating } from "./personaRatingPrompt.mjs";
import { scoreIn } from "./scoreIn.mjs";

test("scoreIn clamps and rounds numbers, rejects what isn't one", () => {
  assert.equal(scoreIn(104), 100);
  assert.equal(scoreIn(-3), 0);
  assert.equal(scoreIn("61.6"), 62);
  assert.equal(scoreIn(40, 30), 30);
  assert.equal(scoreIn("high"), null);
  assert.equal(scoreIn(undefined), null);
});

test("usefulness message: the agent's written fields, each file with its role", () => {
  const message = buildUsefulnessMessage({
    agent: { name: "Tax Ann", persona: " ", instructions: "Answer VAT questions" },
    files: [{ path: "kb/vat.md", role: "knowledge", excerpt: "VAT rules" }],
  });
  assert.match(message, /<name>\nTax Ann\n<\/name>/);
  assert.doesNotMatch(message, /<persona>/);
  assert.match(message, /<file name="kb\/vat.md" role="knowledge">\nVAT rules\n<\/file>/);
});

test("usefulness message: with nothing written yet, judges the files together", () => {
  assert.match(buildUsefulnessMessage({ files: [] }), /Not written yet/);
});

test("readScores keeps known files with a numeric score", () => {
  const scores = readScores({
    files: [
      { name: "kb/vat.md", score: 92, reason: " Core VAT rules " },
      { name: "ghost.md", score: 50 },
      { name: "kb/misc.md", score: "lots" },
    ],
  }, ["kb/vat.md", "kb/misc.md"]);
  assert.deepEqual(scores, { "kb/vat.md": { score: 92, reason: "Core VAT rules" } });
});

test("readScores fails on no block or nothing scored", () => {
  assert.throws(() => readScores(null, []), BadOutput);
  assert.throws(() => readScores({ files: [{ name: "ghost.md", score: 1 }] }, ["kb/vat.md"]), BadOutput);
});

test("persona rating message: samples, then only the generated fields that exist", () => {
  const message = buildPersonaRatingMessage({
    generated: { name: "Ann", persona: "Blunt", instructions: "", background: "Grew up in Delft" },
    samples: [{ path: "letters.md", excerpt: "I never trust a round number." }],
  });
  assert.match(message, /<sample name="letters.md">\nI never trust a round number.\n<\/sample>/);
  assert.match(message, /<background>\nGrew up in Delft\n<\/background>/);
  assert.doesNotMatch(message, /<instructions>/);
});

test("readRating sums capped parts and keeps missing beliefs and unsupported claims", () => {
  const rating = readRating({
    missingBeliefs: ["Distrusts round numbers", " "],
    beliefs: { score: 40, reason: "Mostly there" },
    voice: { score: 20, reason: "Short sentences kept" },
    work: { score: 15 },
    honesty: { score: 18, reason: "Close to the sources" },
    unsupported: ["Born in 1961"],
  });
  assert.equal(rating.score, 30 + 20 + 15 + 18);
  assert.deepEqual(rating.parts.beliefs, { score: 30, max: 30, reason: "Mostly there" });
  assert.deepEqual(rating.parts.work, { score: 15, max: 25, reason: "" });
  assert.deepEqual(rating.missingBeliefs, ["Distrusts round numbers"]);
  assert.deepEqual(rating.unsupported, ["Born in 1961"]);
});

test("readRating fails on no block or a part without a score", () => {
  assert.throws(() => readRating(null), BadOutput);
  assert.throws(() => readRating({ beliefs: { score: 20 }, voice: { score: 20 }, work: { score: 20 } }), BadOutput);
});
