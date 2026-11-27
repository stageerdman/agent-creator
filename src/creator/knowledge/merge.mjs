// The one knowledge file, knowledge.md, merged from the agent's Knowledge
// sources in list order. Each source is one "## " section headed by its
// title (else its path), naming where it came from, with the user's note
// quoted above its text. Pure, so a Build and a test agree on the result.

export const KNOWLEDGE_FILE = "knowledge.md";

// parts: [{ path, title?, note?, text }] → markdown ("" when there are none).
export function mergeKnowledge(parts) {
  return parts.map(sectionOf).join("\n");
}

function sectionOf({ path, title, note, text }) {
  const lines = [`## ${oneLine(title) || path}`, `_Source: ${path}_`];
  if (note?.trim()) lines.push(quoted(note));
  lines.push(text.trim());
  return lines.join("\n\n") + "\n";
}

// A heading must stay one line, whatever the user typed.
const oneLine = (value) => (value ?? "").replace(/\s+/g, " ").trim();

const quoted = (note) => note.trim().split("\n").map((line) => `> ${line}`.trimEnd()).join("\n");
