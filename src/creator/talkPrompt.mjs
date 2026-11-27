// The prompt a kept agent answers with when the user talks to it (not the
// Sketcher). The agent's own system prompt comes first; its skills,
// knowledge and readable files follow as context, each under the name the
// agent must use when it says it drew on it (`<used>`). No retrieval yet:
// everything given is inline.

import { USER_SAYS } from "./creatorPrompt.mjs";

const USED_RULE = `After your answer, if it drew on any of the skills or files above, end with exactly one block naming them, in this form:
<used>{"skills": ["skill name"], "files": ["notes/week 1.md"]}</used>
Use only the names given above, and only those your answer really drew on. No block when it drew on none. Never mention the block.`;

// The agent's system prompt: system-prompt.md when written, else its draft.
export function agentIdentity({ systemPrompt, draft }) {
  if (systemPrompt.trim()) return systemPrompt.trim();
  return [draft.persona, draft.instructions].map((text) => text.trim()).filter(Boolean).join("\n\n");
}

// skills: [{ name, body }]; files: [{ path, text }] (the built knowledge.md
// is one of them). Empty texts are left out.
export function buildTalkPrompt({ systemPrompt, draft, skills = [], files = [] }) {
  const context = [
    ...skills.filter(({ body }) => body.trim()).map(({ name, body }) => section("skill", name, body)),
    ...files.filter(({ text }) => text.trim()).map(({ path, text }) => section("file", path, text)),
  ];
  const parts = [agentIdentity({ systemPrompt, draft })];
  if (context.length) parts.push(`What you know and can do:\n\n${context.join("\n\n")}`, USED_RULE);
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
export function usedOf(patch, { skills = [], files = [] }) {
  const known = (names, given) => (Array.isArray(names) ? [...new Set(names)].filter((name) => given.includes(name)) : []);
  return [
    ...known(patch?.skills, skills.map((skill) => skill.name)).map((name) => ({ kind: "skill", name })),
    ...known(patch?.files, files.map((file) => file.path)).map((name) => ({ kind: "file", name })),
  ];
}

const section = (kind, name, text) => `<${kind} name=${JSON.stringify(name)}>\n${text.trim()}\n</${kind}>`;
