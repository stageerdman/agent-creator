// The call that rates how well a generated persona captures the person in
// its sources. It is a separate call from the one that wrote the persona:
// a writer grading its own work is unreliable.

import { BadOutput } from "../errors.mjs";
import { reasonOf, scoreIn } from "./scoreIn.mjs";

export const PERSONA_RATING_TAG = "personaRating";
// Each part's weight in the 0–100 capture score.
export const PERSONA_PARTS = { beliefs: 30, voice: 25, work: 25, honesty: 20 };

const RULES = `You check, for a user building an AI agent, how well a generated persona captures the person in its source files. You see samples of the sources (head, middle and tail of each, […] where text is left out) and what was generated: name, persona, instructions and background.

First, list the beliefs and convictions the samples show that the generated text leaves out or gets wrong. Most important first; empty if none.

Then score four parts, each with one short, specific reason:
- beliefs (0–30): their views and what they stand for.
- voice (0–25): how they talk: words, tone, rhythm.
- work (0–25): how they decide and how they work.
- honesty (0–20): it stays within what the sources show and does not flatten or exaggerate the person.

Last, list specific claims in the generated text (names, numbers, dates, events) that you do not find in the samples. They may come from parts of the sources you do not see, so call them unsupported in samples, never invented.

Judge only from the samples. You have no tools. Never announce what you are about to do.

Answer with one plain sentence, then exactly one block:
<personaRating>{"missingBeliefs": ["…"], "beliefs": {"score": 0, "reason": "…"}, "voice": {"score": 0, "reason": "…"}, "work": {"score": 0, "reason": "…"}, "honesty": {"score": 0, "reason": "…"}, "unsupported": ["…"]}</personaRating>
Valid JSON. Never mention the block.`;

export const buildPersonaRatingPrompt = () => RULES;

const GENERATED = ["name", "persona", "instructions", "background"];

// generated: { name, persona, instructions, background }; samples: [{ path, excerpt }].
export function buildPersonaRatingMessage({ generated, samples }) {
  const written = GENERATED.filter((field) => generated[field]?.trim()).map((field) => `<${field}>\n${generated[field].trim()}\n</${field}>`);
  const sampled = samples.map(({ path, excerpt }) => `<sample name=${JSON.stringify(path)}>\n${excerpt}\n</sample>`);
  return `<samples>\n${sampled.join("\n\n")}\n</samples>\n\n<generated>\n${written.join("\n")}\n</generated>\n\nRate how well the generated persona captures this person.`;
}

const linesOf = (list) => (Array.isArray(list) ? list.map(reasonOf).filter(Boolean) : []);

// The `<personaRating>` patch → { score, missingBeliefs, parts: { [part]:
// { score, max, reason } }, unsupported }. BadOutput when there is no block
// or a part has no numeric score.
export function readRating(patch) {
  if (!patch || typeof patch !== "object") throw new BadOutput("The answer had no valid <personaRating> block.");
  const parts = {};
  for (const [part, max] of Object.entries(PERSONA_PARTS)) {
    const score = scoreIn(patch[part]?.score, max);
    if (score === null) throw new BadOutput(`The <personaRating> block has no score for "${part}".`);
    parts[part] = { score, max, reason: reasonOf(patch[part].reason) };
  }
  const score = Object.values(parts).reduce((sum, part) => sum + part.score, 0);
  return { score, missingBeliefs: linesOf(patch.missingBeliefs), parts, unsupported: linesOf(patch.unsupported) };
}
