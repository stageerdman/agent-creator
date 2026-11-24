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

export function markKept(draft) {
  return { ...draft, status: "saved" };
}
