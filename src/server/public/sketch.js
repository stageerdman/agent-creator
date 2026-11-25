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

export function timeAgo(iso, now = Date.now()) {
  const minutes = Math.round((now - Date.parse(iso)) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}
