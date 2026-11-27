// A file's bytes → its plain text. PDFs through unpdf (pdf.js inside); any
// other file is read as UTF-8 and refused when it is binary. One job: no
// disk, no store, so the same rule serves scans and page uploads.

import { extractText } from "unpdf";
import { CantExtract } from "../errors.mjs";

const isPdf = (name, bytes) => /\.pdf$/i.test(name) || bytes.subarray(0, 5).toString("latin1") === "%PDF-";

// → text (never empty), or throws CantExtract with reason "binary" | "empty" | "unreadable-pdf".
export async function extractPlainText(name, bytes) {
  const text = isPdf(name, bytes) ? await pdfText(name, bytes) : utf8Text(name, bytes);
  if (!text.trim()) throw new CantExtract(name, "empty");
  return text;
}

async function pdfText(name, bytes) {
  try {
    const { text } = await extractText(new Uint8Array(bytes), { mergePages: true });
    return text;
  } catch (error) {
    throw new CantExtract(name, "unreadable-pdf", error);
  }
}

function utf8Text(name, bytes) {
  if (bytes.includes(0)) throw new CantExtract(name, "binary");
  return bytes.toString("utf8").replace(/^﻿/, "");
}
