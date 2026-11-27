// How well a file's text is shaped for the agent, scored in code so it is
// free, repeatable and always fresh. Knowledge files are cut by the real
// chunker and searched, so their chunks count; persona and skill files are
// read whole, so only clean text counts for them.

import { TARGET_CHUNK_CHARS, chunkText, paragraphsOf } from "../knowledge/chunk.mjs";

const MIN_CHUNK_CHARS = 200;
const MAX_CHUNK_CHARS = TARGET_CHUNK_CHARS * 1.2;

const percent = (part, whole) => (whole ? Math.round((100 * part) / whole) : 0);

// A chunk the chunker had to slice mid-paragraph ends in a piece of a
// paragraph; one it packed ends in a whole one.
const lastParagraphOf = (chunk) => chunk.split("\n\n").pop().trim();

// Share of chunks of a usable size that end where a paragraph ends.
export function chunkFitOf(text) {
  const chunks = chunkText(text);
  const paragraphs = new Set(paragraphsOf(text));
  const sizeOk = (chunk) => chunk.length <= MAX_CHUNK_CHARS && (chunks.length === 1 || chunk.length >= MIN_CHUNK_CHARS);
  const fits = chunks.filter((chunk) => sizeOk(chunk) && paragraphs.has(lastParagraphOf(chunk)));
  return percent(fits.length, chunks.length);
}

// Under half letters: page numbers, rules, OCR noise.
const isJunk = (line) => (line.match(/\p{L}/gu)?.length ?? 0) * 2 < line.replace(/\s/g, "").length;

// Share of characters in lines that are neither junk nor a repeat of an
// earlier line (running headers and footers).
export function cleanTextOf(text) {
  const seen = new Set();
  let clean = 0;
  let total = 0;
  for (const line of text.split("\n").map((one) => one.trim()).filter(Boolean)) {
    total += line.length;
    if (!isJunk(line) && !seen.has(line)) clean += line.length;
    seen.add(line);
  }
  return percent(clean, total);
}

// `role`: roleOf() from sourceText/usable.mjs, e.g. "knowledge, skill".
// → { score, chunkFit (null when the file is not chunk-searched), clean }, each 0–100.
export function structureOf(text, role) {
  const clean = cleanTextOf(text);
  if (!role.split(", ").includes("knowledge")) return { score: clean, chunkFit: null, clean };
  const chunkFit = chunkFitOf(text);
  return { score: Math.round((chunkFit + clean) / 2), chunkFit, clean };
}
