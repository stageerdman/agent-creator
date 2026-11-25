// The creation chat's logic with no DOM, so it can be unit-tested in Node
// (Roadmap Phase 5). app.js owns the page and calls these.

export const FIELDS = ["name", "instructions"];

// SKETCH-REWORK: Persona folds into Instructions (one text box is the agent).
// The old Persona text goes first, word for word. Safe to run twice: a draft
// whose instructions already start with the persona is not doubled.
export function mergePersona(draft) {
  if (!draft || !("persona" in draft)) return draft;
  const { persona = "", ...rest } = draft;
  const p = (persona ?? "").trim();
  const i = (rest.instructions ?? "").trim();
  if (!p || i.startsWith(p)) return { ...rest, instructions: rest.instructions ?? "" };
  return { ...rest, instructions: i ? `${p}\n\n${i}` : p };
}

// Reads `event: x\ndata: {...}\n\n` blocks off a fetch body (a byte stream).
// Ends quietly when the stream ends; the caller decides if that was early.
export async function* readEvents(body) {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += value;
    let end;
    while ((end = buffer.indexOf("\n\n")) !== -1) {
      const event = parseEventBlock(buffer.slice(0, end));
      buffer = buffer.slice(end + 2);
      if (event) yield event;
    }
  }
}

export function parseEventBlock(block) {
  const event = block.match(/^event: (.*)$/m)?.[1];
  const data = block.match(/^data: (.*)$/m)?.[1];
  if (!event || data === undefined) return null;
  try {
    return { event, data: JSON.parse(data) };
  } catch {
    return null;
  }
}

export const isEmptyDraft = (draft) => FIELDS.every((field) => !draft?.[field]?.trim());

// A `draft { draft, changed }` event (design §10 step 3). The server already
// merged, so the draft is replaced, not merged. Returns the next marks too.
// Persona is folded into Instructions here too, so `changed` only names FIELDS.
export function applyDraftEvent({ draft: before, yours }, { draft: raw, changed: rawChanged }) {
  const draft = mergePersona(raw);
  const changed = FIELDS.filter((field) => rawChanged.map((f) => (f === "persona" ? "instructions" : f)).includes(field));
  return {
    draft,
    changed,
    fresh: new Set(changed),
    yours: new Set([...yours].filter((field) => !changed.includes(field))),
    firstSketch: isEmptyDraft(before) && !isEmptyDraft(draft),
    unkept: before?.status === "saved" && draft.status !== "saved",
  };
}

// "Sketch: name and instructions updated", from `changed` only, in field order.
// A server that still says "persona" means the Instructions changed.
export function changeLine(changed) {
  const said = changed.map((field) => (field === "persona" ? "instructions" : field));
  const names = FIELDS.filter((field) => said.includes(field));
  if (names.length === 0) return "";
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  return `Sketch: ${list} updated`;
}

// The Keep card's second line: the Instructions' first sentence, at most 140 characters.
export function firstSentence(text, max = 140) {
  const clean = (text ?? "").trim().replace(/\s+/g, " ");
  const match = clean.match(/^.*?[.!?](?=\s|$)/);
  const sentence = match ? match[0] : clean;
  return sentence.length > max ? `${sentence.slice(0, max - 1).trimEnd()}…` : sentence;
}

// One line under the user's bubble for every failed turn (design S10).
// `offline` = the banner shows, so the line has no Try again of its own (R4).
export function errorLine(kind) {
  switch (kind) {
    case "not-installed":
      return { text: "The Sketcher can't reach Claude right now.", retry: false, details: false, offline: true };
    case "failed":
      return { text: "Something went wrong on Claude's side.", retry: true, details: true };
    case "bad-output":
      return { text: "The Sketcher's reply came back garbled.", retry: true, details: true };
    case "cancelled":
      return { text: "Stopped.", retry: true, details: false, neutral: true };
    case "network":
      return { text: "Lost the connection to the app.", retry: true, details: false };
    default:
      return { text: "Something went wrong on Claude's side.", retry: true, details: true };
  }
}

export const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

// A long paste (S11): over 300 words becomes a chip. `pasteAt` is where the
// first paste went in the composer, so "Use this:" typed before it stays
// normal bubble text.
export function splitPaste(message, pasteAt = 0, limit = 300) {
  if (wordCount(message) <= limit) return { lead: message, note: "" };
  const at = pasteAt > 0 && pasteAt < message.length ? pasteAt : 0;
  return { lead: message.slice(0, at).trim(), note: message.slice(at).trim() };
}

// Splits a Sketcher reply into blocks: paragraphs, plain quotes, and voice
// cards (a blockquote starting with **Name:**, design S7).
export function replyBlocks(say) {
  const blocks = [];
  let paragraph = [];
  let quote = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "text", text: paragraph.join("\n") });
    paragraph = [];
  };
  const flushQuote = () => {
    if (!quote.length) return;
    const text = quote.join("\n").trim();
    const voice = text.match(/^\*\*([^*\n]+?)(?::\*\*|\*\*:)\s*([\s\S]*)$/);
    blocks.push(voice ? { type: "voice", name: voice[1].trim(), text: voice[2].trim() } : { type: "quote", text });
    quote = [];
  };
  for (const line of (say ?? "").split("\n")) {
    const quoted = line.match(/^\s*>\s?(.*)$/);
    if (quoted) {
      flushParagraph();
      quote.push(quoted[1]);
    } else if (!line.trim()) {
      flushParagraph();
      flushQuote();
    } else {
      flushQuote();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushQuote();
  return blocks;
}

// **bold** spans inside a block, as [{ text, bold }] runs.
export function inlineRuns(text) {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) => (/^\*\*[^*]+\*\*$/.test(part) ? { text: part.slice(2, -2), bold: true } : { text: part, bold: false }));
}

// The switcher menu (design §5): newest first, "Untitled sketch" for a
// nameless one. Empty agents are already left out by the server (R8).
export function switcherRows(items, now = Date.now()) {
  return [...items]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(({ id, draft, updatedAt }) => ({
      id,
      name: draft.name.trim() || "Untitled sketch",
      status: draft.status === "saved" ? "Kept" : "Sketch",
      when: timeAgo(updatedAt, now),
    }));
}

// ── SKETCH-REWORK P2: Profile ─────────────────────────────────────────────
// Skills come from the map the study writes (one data source for Profile and
// DNA's quality layer). `picks` are the user's hand moves {skillId: row}; a
// later study never moves a picked chip.

export const ROWS = [
  { id: "good", title: "Good at", hint: "plenty in the material", empty: "Nothing here yet." },
  { id: "medium", title: "Medium", hint: "some in the material", empty: "Nothing here yet." },
  { id: "not", title: "Not trained for", hint: "not in the material yet", empty: "Nothing missing that we know of." },
];
const LEVEL_ROW = { sharp: "good", rough: "medium", blank: "not" };
const rowTitle = (row) => ROWS.find((r) => r.id === row)?.title ?? row;

export function skillsFromMap(map = [], picks = {}) {
  return (map ?? []).map((line) => {
    const picked = Object.hasOwn(picks, line.id);
    return { id: line.id, text: line.text, row: picked ? picks[line.id] : LEVEL_ROW[line.level] ?? "medium", picked, refs: line.refs ?? [] };
  });
}

// A new study's map, with the user's moves kept.
export const applyAiSkills = (skills, map) =>
  skillsFromMap(map, Object.fromEntries(skills.filter((s) => s.picked).map((s) => [s.id, s.row])));

export const profileRows = (skills) => ROWS.map((r) => ({ ...r, skills: skills.filter((s) => s.row === r.id) }));

export const nextRow = (row) => ROWS[(ROWS.findIndex((r) => r.id === row) + 1) % ROWS.length].id;

export const moveSkill = (picks, id, row) => ({ ...picks, [id]: row });

export const skillLabel = (s) => `${s.text}, ${rowTitle(s.row)}${s.picked ? ", moved by you" : ""}`;

export const moveLine = (s, name) => `Profile: "${s.text}" moved to ${rowTitle(s.row)} · summary only, ${name} answers the same`;

// The description: the user's own, else the Instructions' first sentence.
export function describe(description, instructions) {
  const own = (description ?? "").trim();
  return own ? { text: own, fromInstructions: false } : { text: firstSentence(instructions), fromInstructions: Boolean((instructions ?? "").trim()) };
}

// ── SKETCH-REWORK P3: DNA ─────────────────────────────────────────────────

// The source files behind the instructions: every file a map line cites.
export function sourcesOf(map = [], files = []) {
  const ids = [...new Set((map ?? []).flatMap((l) => (l.refs ?? []).map((r) => r.fileId)))];
  return ids.map((id) => files.find((f) => f.id === id)).filter(Boolean);
}

const lookable = (files = []) => files.filter((f) => !f.removed);

export function dnaLayers({ name = "it", map = [], files = [], total } = {}) {
  const made = sourcesOf(map, files).length;
  const removed = files.filter((f) => f.removed).length;
  const looks = total !== undefined ? Math.max(0, total - removed) : lookable(files).length;
  const q = qualityFrom(skillsFromMap(map), files);
  return [
    { id: "instructions", title: "Instructions", sub: `what ${name} is told`, count: 1 },
    { id: "made", title: "Made from", count: made, sub: made ? `${made} ${made === 1 ? "file" : "files"} shaped these instructions` : "Made from one sentence, no files yet." },
    { id: "looks", title: "Looks up", count: looks, sub: looks ? `${looks} ${looks === 1 ? "file" : "files"} ${name} reads while answering` : "Nothing to look up yet." },
    { id: "quality", title: "Strong and thin", count: q.lines.length, sub: `about the material, not about ${name}` },
  ];
}

// Instruction parts are the paragraphs of the one Instructions box.
export function instructionParts(text = "") {
  const parts = [];
  const re = /[^\n]+(?:\n(?!\s*\n)[^\n]*)*/g;
  for (let m; (m = re.exec(text ?? "")); ) if (m[0].trim()) parts.push({ index: parts.length, text: m[0].trim(), start: m.index, end: m.index + m[0].length });
  return parts;
}

export function partAt(text, caret) {
  const parts = instructionParts(text);
  if (!parts.length) return -1;
  const hit = parts.find((p) => caret >= p.start && caret <= p.end);
  if (hit) return hit.index;
  const before = parts.filter((p) => p.end < caret);
  return before.length ? before.at(-1).index : 0;
}

const words = (text) => new Set((text ?? "").toLowerCase().match(/[a-z]{5,}/g) ?? []);

// Sample links until the backend sends real ones: a part is "behind" the map
// lines it shares a word with; their cited files are its sources.
export function threadsFor(partText, map = [], files = []) {
  const mine = words(partText);
  const lines = (map ?? []).filter((l) => [...words(l.text)].some((w) => mine.has(w)));
  return sourcesOf(lines, files);
}

// Looks up: remove (with Undo) and turn off. Never touches the user's disk.
export function removeRag(files, id) {
  const file = files.find((f) => f.id === id);
  if (!file || file.removed) return { files, undo: null };
  return { files: files.map((f) => (f.id === id ? { ...f, removed: true } : f)), undo: { id, name: file.name } };
}

export const undoRag = (files, undo) => (undo ? files.map((f) => (f.id === undo.id ? { ...f, removed: false } : f)) : files);

export const toggleUse = (files, id) => files.map((f) => (f.id === id ? { ...f, off: !f.off } : f));

// Strong and thin: reasons first, a number last. Reads the same skills as Profile.
export function qualityFrom(skills, files = []) {
  const rows = profileRows(skills);
  const [good, medium, not] = rows.map((r) => r.skills);
  const aside = lookable(files).filter((f) => f.ease === "hard");
  const lines = [
    ...good.map((s) => ({ kind: "Strong", text: s.text, skill: s.id, action: null })),
    ...medium.map((s) => ({ kind: "Thin", text: s.text, skill: s.id, action: "Add a reference" })),
    ...not.map((s) => ({ kind: "Missing", text: s.text, skill: s.id, action: "Add a reference" })),
    ...aside.map((f) => ({ kind: "Set aside", text: `${f.name}, hard to study`, file: f.id, action: "Remove" })),
  ];
  const score = skills.length ? Math.round((100 * (good.length + medium.length / 2)) / skills.length) : null;
  return { lines, score, overall: score === null ? "Nothing to judge yet." : `Overall ${score} of 100` };
}

export function timeAgo(iso, now = Date.now()) {
  const minutes = Math.round((now - Date.parse(iso)) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}
