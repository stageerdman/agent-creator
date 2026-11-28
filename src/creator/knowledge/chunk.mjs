// Cuts a file's plain text into small, overlapping pieces: a search returns
// whole chunks, so each must be focused enough to answer something on its
// own. Port of masters-wheel knowledge/chunk.rs.

export const TARGET_CHUNK_CHARS = 1500;
export const OVERLAP_CHARS = 200;

export const paragraphsOf = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

// The tail of a closed chunk opens the next one, so a fact sitting on the
// boundary is whole in at least one chunk. A cut inside a surrogate pair
// steps forward to the next whole character.
function tailOf(chunk) {
  const tail = chunk.slice(-OVERLAP_CHARS);
  return /^[\uDC00-\uDFFF]/.test(tail) ? tail.slice(1) : tail;
}

function packParagraphs(paragraphs) {
  const chunks = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > TARGET_CHUNK_CHARS) {
      chunks.push(current);
      current = tailOf(current);
    }
    current = current ? `${current}\n\n${paragraph}` : paragraph;
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}

// A paragraph with no blank lines can be huge on its own; one giant chunk
// would defeat retrieval, so it is sliced. Array.from keeps whole code points.
function splitIfOversized(chunk) {
  const chars = Array.from(chunk);
  if (chars.length <= TARGET_CHUNK_CHARS * 2) return [chunk];
  const slices = [];
  for (let start = 0; start < chars.length; start += TARGET_CHUNK_CHARS) {
    slices.push(chars.slice(start, start + TARGET_CHUNK_CHARS).join(""));
  }
  return slices;
}

export const chunkText = (text) => packParagraphs(paragraphsOf(text)).flatMap(splitIfOversized);
