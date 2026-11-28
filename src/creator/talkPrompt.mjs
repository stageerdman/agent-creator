// The prompt a kept agent answers with when the user talks to it (not the
// Sketcher). The agent's own system prompt comes first; its skills and
// skill files follow whole, then the passages a search
// of its Knowledge files found for this message, each under the name the
// agent must use when it says it drew on it (`<used>`).

import { USER_SAYS } from "./creatorPrompt.mjs";

const USED_RULE = `After your answer, if it drew on any of the skills, files or knowledge passages above, end with exactly one block naming them, in this form:
<used>{"skills": ["skill name"], "files": ["notes/week 1.md"], "passages": [1, 3]}</used>
Use only the names and passage numbers given above, and only those your answer really drew on. No block when it drew on none. Never mention the block.`;

// The agent's system prompt: system-prompt.md when written, else its draft.
export function agentIdentity({ systemPrompt, draft }) {
  if (systemPrompt.trim()) return systemPrompt.trim();
  return [draft.persona, draft.instructions].map((text) => text.trim()).filter(Boolean).join("\n\n");
}

// skills: [{ name, body }]; files: [{ path, text }]; excerpts: [{ file,
// text }], best first. Empty texts are left out. `context` is the person's
// background (persona/personaBuilder.mjs), right after the identity.
export function buildTalkPrompt({ systemPrompt, draft, context = "", skills = [], files = [], excerpts = [] }) {
  const known = [
    ...skills.filter(({ body }) => body.trim()).map(({ name, body }) => section("skill", name, body)),
    ...files.filter(({ text }) => text.trim()).map(({ path, text }) => section("file", path, text)),
    ...(excerpts.length ? [knowledgeBlock(excerpts)] : []),
  ];
  const parts = [agentIdentity({ systemPrompt, draft })];
  if (context.trim()) parts.push(`<background>\n${context.trim()}\n</background>`);
  if (known.length) parts.push(`What you know and can do:\n\n${known.join("\n\n")}`, USED_RULE);
  return parts.join("\n\n");
}

// Earlier lines of this talk go in the message: the call is never resumed,
// so an edited system prompt is always the one in force.
export function buildTalkMessage({ message, talk = [] }) {
  const lines = talk.map(({ who, text }) => `${who === "you" ? "User" : "You"}: ${text}`);
  const history = lines.length ? `<earlier_talk>\n${lines.join("\n")}\n</earlier_talk>\n\n` : "";
  return `${history}${USER_SAYS}${message}`;
}

// The agent's `<used>` patch → [{ kind, name }], only names it was given.
// The file of a passage it used counts as a used file too.
export function usedOf(patch, { skills = [], files = [], excerpts = [] }) {
  const fileNames = [...files.map((file) => file.path), ...excerpts.map((excerpt) => excerpt.file)];
  const usedFiles = [...listOf(patch?.files), ...sourcesOf(patch, excerpts).map((source) => source.file)];
  return [
    ...known(listOf(patch?.skills), skills.map((skill) => skill.name)).map((name) => ({ kind: "skill", name })),
    ...known(usedFiles, fileNames).map((name) => ({ kind: "file", name })),
  ];
}

// The `<used>` passage numbers → [{ file, passage }], the passages the
// answer stood on ("Where from"). Only numbers of passages it was given,
// no repeats, in the agent's order. Empty = the agent's own view.
export function sourcesOf(patch, excerpts = []) {
  const valid = (n) => Number.isInteger(n) && n >= 1 && n <= excerpts.length;
  return [...new Set(listOf(patch?.passages))].filter(valid).map((n) => ({ file: excerpts[n - 1].file, passage: excerpts[n - 1].text.trim() }));
}

const listOf = (value) => (Array.isArray(value) ? value : []);
const known = (names, given) => [...new Set(names)].filter((name) => given.includes(name));

const section = (kind, name, text) => `<${kind} name=${JSON.stringify(name)}>\n${text.trim()}\n</${kind}>`;

// Numbered, so the agent can tell passages apart; named by file for `<used>`.
const knowledgeBlock = (excerpts) =>
  `<knowledge>\nPassages from your knowledge files that may bear on this message:\n\n${excerpts
    .map(({ file, text }, at) => `[${at + 1}] (from ${file})\n${text.trim()}`)
    .join("\n\n")}\n</knowledge>`;
