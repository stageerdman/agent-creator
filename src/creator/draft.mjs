// The agent draft: the one shape the creator chat and the Sketch panel share.
// Pure functions only, so the server, the tests and a future desktop shell
// all reason about the draft the same way.

// The only fields anyone may change. Anything else in a patch (a stray key,
// or later the P12 capability map) is dropped on purpose.
export const FIELDS = ["name", "persona", "instructions"];

export function emptyDraft() {
  return { name: "", persona: "", instructions: "", status: "draft" };
}

export function isEmpty(draft) {
  return FIELDS.every((field) => !draft[field].trim());
}

// Returns { draft, changed }: a new draft and the fields whose text really
// changed. Any real change after Keep makes it a draft again.
export function applyPatch(draft, patch) {
  const changed = FIELDS.filter((field) => typeof patch?.[field] === "string" && patch[field] !== draft[field]);
  if (changed.length === 0) return { draft, changed };
  const next = { ...draft, status: "draft" };
  for (const field of changed) next[field] = patch[field];
  return { draft: next, changed };
}

// The fields the user changed by hand since the creator last changed them.
// A hand edit marks a field; a creator change to it clears the mark.
export function trackHandEdits(handEdited, changed, source) {
  if (source === "hand") return FIELDS.filter((field) => handEdited.includes(field) || changed.includes(field));
  return handEdited.filter((field) => !changed.includes(field));
}

// The exact lines the user typed by hand, per field ({ instructions: [...] }),
// so the creator can be told what to keep word for word on a rewrite.
// A hand edit adds its new lines; any line no longer in the field is dropped.
export function trackHandLines(handLines = {}, before, after, source) {
  const next = {};
  // The name is one value, not lines of rules; a rename covers it.
  for (const field of FIELDS.filter((f) => f !== "name")) {
    const now = new Set(linesOf(after[field]));
    const old = new Set(linesOf(before[field]));
    const added = source === "hand" ? [...now].filter((line) => !old.has(line)) : [];
    const kept = (handLines[field] ?? []).filter((line) => now.has(line));
    const lines = [...new Set([...kept, ...added])];
    if (lines.length) next[field] = lines;
  }
  return next;
}

const linesOf = (text = "") => text.split("\n").map((line) => line.trim()).filter(Boolean);

export function markKept(draft) {
  return { ...draft, status: "saved" };
}
