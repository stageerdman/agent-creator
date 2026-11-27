import { test } from "node:test";
import assert from "node:assert/strict";
import { extractPlainText } from "./extract.mjs";

// A one-page PDF saying `words`, built by hand with a correct xref table.
function tinyPdf(words) {
  const stream = `BT /F1 12 Tf 72 720 Td (${words}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, i) => {
    const at = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return at;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((at) => `${String(at).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

const reasonOf = (promise) => promise.then(() => "none", (error) => error.reason);

test("text files come back as they are, without a BOM", async () => {
  assert.equal(await extractPlainText("a.md", Buffer.from("﻿# Hi\nthere")), "# Hi\nthere");
  assert.equal(await extractPlainText("notes", Buffer.from("plain")), "plain");
});

test("a PDF gives its words", async () => {
  assert.match(await extractPlainText("doc.pdf", tinyPdf("Hello from a PDF")), /Hello from a PDF/);
});

test("binary, empty and broken PDFs are refused with a reason", async () => {
  assert.equal(await reasonOf(extractPlainText("x.bin", Buffer.from([1, 0, 2]))), "binary");
  assert.equal(await reasonOf(extractPlainText("e.txt", Buffer.from("  \n"))), "empty");
  assert.equal(await reasonOf(extractPlainText("bad.pdf", Buffer.from("%PDF-1.4 nonsense"))), "unreadable-pdf");
});

test("audio and video are refused as media, even when their bytes look like text", async () => {
  assert.equal(await reasonOf(extractPlainText("talk.MP4", Buffer.from("looks like text"))), "media");
  assert.equal(await reasonOf(extractPlainText("talks/day1.mp3", Buffer.from([1, 0, 2]))), "media");
});
