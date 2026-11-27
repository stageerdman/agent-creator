// The one call that writes an agent from its persona sources: the System
// prompt section's files (feed "instructions"). The model reads their text
// and answers with a short chat line plus one `<persona>` block; the backend
// keeps hand-edited fields and saves the rest (personaBuilder.mjs).

import { BadOutput } from "../errors.mjs";
import { currentDraft, userLines } from "../creatorPrompt.mjs";

export const PERSONA_TAG = "persona";
const FIELDS = ["name", "persona", "instructions", "context"];

const RULES = `You write an AI agent from source files the user picked for it: notes, transcripts, bios, books, posts by or about a person or a role. The agent becomes that person or role.

Write four fields:
- name: what the agent is called. The person's name when the sources make it clear.
- persona: who the agent is: voice, character, point of view, the way they talk. Written to the agent, starting "You are".
- instructions: what the agent does: its job, rules and limits, drawn from how the person works. Written to the agent.
- context: the person's background as the agent should know it: facts, story, beliefs, methods, the people and places that matter. Markdown, plain and dense, written to the agent ("You grew up…"). Up to about 1500 words.

How you work:
1. Draw only on the sources. Never invent facts, dates or quotes. Where the sources are silent, leave it out.
2. The message holds the <current_draft>. Leave out every field the user edited by hand. If the user typed lines themselves (listed in the message), any field you write keeps each of them word for word.
3. A source may be cut short to fit; work with what is there.
4. You have no tools. Never announce what you are about to do.

Answer with one or two plain sentences on what you wrote, then exactly one block:
<persona>{"name": "…", "persona": "…", "instructions": "…", "context": "…"}</persona>
Valid JSON, each field its full text. Never mention the block.`;

export const buildPersonaPrompt = () => RULES;

// sources: [{ path, text }] (packed); cut: paths shortened to fit.
export function buildPersonaMessage({ sources, cut = [], draft, handEdited = [], handLines = {} }) {
  const parts = [currentDraft(draft, handEdited), userLines(handLines), sourcesBlock(sources, cut)];
  return `${parts.filter(Boolean).join("\n\n")}\n\nWrite the agent from these sources.`;
}

function sourcesBlock(sources, cut) {
  const cutShort = new Set(cut);
  const files = sources.map(({ path, text }) => {
    const mark = cutShort.has(path) ? " cut=\"true\"" : "";
    return `<source name=${JSON.stringify(path)}${mark}>\n${text.trim()}\n</source>`;
  });
  return `<sources>\n${files.join("\n\n")}\n</sources>`;
}

// The `<persona>` patch → { fields: { name?, persona?, instructions? },
// context: string | null }. Empty fields count as not written. Fails with
// BadOutput when there is no block, a field isn't text, or nothing is written.
export function readGenerated(patch) {
  if (!patch) throw new BadOutput("The answer had no valid <persona> block.");
  const written = {};
  for (const field of FIELDS) {
    const value = patch[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") throw new BadOutput(`The <persona> block's "${field}" is not text.`);
    if (value.trim()) written[field] = value.trim();
  }
  const { context = null, ...fields } = written;
  if (!context && !Object.keys(fields).length) throw new BadOutput("The <persona> block wrote nothing.");
  return { fields, context };
}
