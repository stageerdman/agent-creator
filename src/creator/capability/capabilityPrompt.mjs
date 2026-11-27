// The one call that maps what an agent will be good at, medium at and not
// trained for, read from the text of every file it uses. The map is for the
// user only: it never reaches the agent itself (capabilityBuilder.mjs).

import { BadOutput } from "../errors.mjs";

export const CAPABILITY_TAG = "capabilities";
export const LEVELS = ["good", "medium", "notTrained"];

const RULES = `You tell a user, plainly, what the AI agent they are building will be good at, medium at, and not trained for, judged only from the source files it will use.

Each source has a role:
- knowledge: the agent looks things up in it while it works.
- persona: it shapes who the agent is and how it talks.
- skill: a procedure the agent can follow.

Write three lists:
- good: what the sources cover in depth. The agent can answer this well.
- medium: what they touch on thinly, partly, or only in passing.
- notTrained: nearby things a user would likely expect but the sources do not cover.

How you write each line:
1. Specific and niche: name the actual topic, method, period, product or person the sources deal with. Never generic ("general questions", "writing", "research").
2. Written to the user about the agent, short: "Pricing a freelance design job by the hour", not "You are good at…".
3. Only from the sources. Never guess at what the agent might know beyond them.
4. Three to seven lines per list.
5. "from" lists the source names a line rests on (empty for notTrained when no source applies).
6. A source may be cut short to fit; judge what is there.
7. You have no tools. Never announce what you are about to do.

Answer with one or two plain sentences that sum up the map, then exactly one block:
<capabilities>{"good": [{"text": "…", "from": ["…"]}], "medium": [...], "notTrained": [...]}</capabilities>
Valid JSON. Never mention the block.`;

export const buildCapabilityPrompt = () => RULES;

// sources: [{ path, text, role }] (packed); cut: paths shortened to fit.
export function buildCapabilityMessage({ sources, cut = [] }) {
  const cutShort = new Set(cut);
  const files = sources.map(({ path, text, role }) => {
    const mark = cutShort.has(path) ? " cut=\"true\"" : "";
    return `<source name=${JSON.stringify(path)} role=${JSON.stringify(role)}${mark}>\n${text.trim()}\n</source>`;
  });
  return `<sources>\n${files.join("\n\n")}\n</sources>\n\nMap what the agent will be good at, medium at and not trained for.`;
}

// The `<capabilities>` patch → { good, medium, notTrained }, each
// [{ text, from }]. Paths not in `knownPaths` are dropped from `from`; blank
// lines are skipped. BadOutput when there is no block, a list is not a list
// of lines, or no line is written at all.
export function readMap(patch, knownPaths) {
  if (!patch) throw new BadOutput("The answer had no valid <capabilities> block.");
  const known = new Set(knownPaths);
  const map = Object.fromEntries(LEVELS.map((level) => [level, readLevel(patch[level], level, known)]));
  if (!LEVELS.some((level) => map[level].length)) throw new BadOutput("The <capabilities> block wrote no line.");
  return map;
}

function readLevel(lines, level, known) {
  if (lines === undefined || lines === null) return [];
  if (!Array.isArray(lines)) throw new BadOutput(`The <capabilities> block's "${level}" is not a list.`);
  return lines.map((line) => readLine(line, level, known)).filter((line) => line.text);
}

function readLine(line, level, known) {
  const text = typeof line === "string" ? line : line?.text;
  if (typeof text !== "string") throw new BadOutput(`A "${level}" line in the <capabilities> block has no text.`);
  const from = Array.isArray(line?.from) ? line.from.filter((path) => known.has(path)) : [];
  return { text: text.trim(), from: [...new Set(from)] };
}
