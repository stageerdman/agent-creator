// The call that judges how useful each of a batch of files is for one
// agent, from a head/middle/tail excerpt of each. The scores are for the
// user only: they never reach the agent itself (qualityBuilder.mjs).

import { BadOutput } from "../errors.mjs";
import { reasonOf, scoreIn } from "./scoreIn.mjs";

export const USEFULNESS_TAG = "usefulness";
export const USEFULNESS_BATCH = 10;

const RULES = `You judge, for a user building an AI agent, how useful each source file is for that agent. You see an excerpt of each file: its head, middle and tail, with […] where text is left out.

Judge against the agent's name, persona and instructions. When they are not written yet, judge against what the files are about together.

Score each file 0–100 by its role:
- knowledge (the agent looks things up in it): how well it fits the agent's topic.
- persona (it shapes who the agent is and how it talks): how first-hand the person's own voice and thinking is.
- skill (a procedure the agent follows): how clearly it fits a task the agent will do.
A file with several roles: judge it by the one it serves best.

Anchors: 90 core to the agent · 60 relevant but thin or secondhand · 30 loosely related · 0 noise.

For each file write one short, specific reason the user can act on ("Interview transcript in her own words", "Generic marketing glossary, not about tax").
Judge only what the excerpt shows. You have no tools. Never announce what you are about to do.

Answer with one plain sentence, then exactly one block:
<usefulness>{"files": [{"name": "…", "score": 90, "reason": "…"}]}</usefulness>
One entry per file, named exactly as given. Valid JSON. Never mention the block.`;

export const buildUsefulnessPrompt = () => RULES;

// agent: { name, persona, instructions } (blank fields are left out);
// files: [{ path, role, excerpt }].
export function buildUsefulnessMessage({ agent = {}, files }) {
  const about = ["name", "persona", "instructions"]
    .filter((field) => agent[field]?.trim())
    .map((field) => `<${field}>\n${agent[field].trim()}\n</${field}>`);
  const agentPart = about.length ? `<agent>\n${about.join("\n")}\n</agent>` : "<agent>Not written yet: judge against what the files are about together.</agent>";
  const filePart = files.map(({ path, role, excerpt }) => `<file name=${JSON.stringify(path)} role=${JSON.stringify(role)}>\n${excerpt}\n</file>`);
  return `${agentPart}\n\n<files>\n${filePart.join("\n\n")}\n</files>\n\nScore how useful each file is for this agent.`;
}

// The `<usefulness>` patch → { [path]: { score, reason } } for known paths
// with a numeric score. BadOutput when there is no block or no file scored.
export function readScores(patch, knownPaths) {
  if (!Array.isArray(patch?.files)) throw new BadOutput("The answer had no valid <usefulness> block.");
  const known = new Set(knownPaths);
  const scores = {};
  for (const entry of patch.files) {
    const score = scoreIn(entry?.score);
    if (known.has(entry?.name) && score !== null) scores[entry.name] = { score, reason: reasonOf(entry.reason) };
  }
  if (!Object.keys(scores).length) throw new BadOutput("The <usefulness> block scored no known file.");
  return scores;
}
