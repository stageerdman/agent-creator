// The capability map as the creator (the Sketcher) sees it in each turn's
// <turn_context>. Its rule rides along: a resumed session never re-reads the
// system prompt.

const RULE = `The <capability_map> is what the app worked out from the agent's files: what the agent will be good at, medium at, and not trained for. The user sees it too. You may talk it through with them, explain a line, or suggest files that would fill a gap. It is for the user only: never copy it into the name, persona or instructions.`;
const STALE = "The files changed since this map was made; it may be out of date. Say so if the user relies on it.";

const HEADINGS = { good: "Good at", medium: "Medium at", notTrained: "Not trained for" };

// { map | null, stale } → the block, or "" when there is no map yet.
export function capabilityContext({ map, stale } = {}) {
  if (!map) return "";
  const lists = Object.entries(HEADINGS)
    .filter(([level]) => map[level]?.length)
    .map(([level, heading]) => [`${heading}:`, ...map[level].map(lineOf)].join("\n"));
  return [RULE, stale ? STALE : "", `<capability_map>\n${lists.join("\n\n")}\n</capability_map>`].filter(Boolean).join("\n");
}

const lineOf = ({ text, from }) => (from.length ? `- ${text} (from ${from.join(", ")})` : `- ${text}`);
