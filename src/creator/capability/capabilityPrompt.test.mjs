import { test } from "node:test";
import assert from "node:assert/strict";
import { BadOutput } from "../errors.mjs";
import { buildCapabilityMessage, readMap } from "./capabilityPrompt.mjs";

test("buildCapabilityMessage: each source with its role, cut ones marked", () => {
  const message = buildCapabilityMessage({
    sources: [{ path: "kb/tax.md", text: "VAT rules\n", role: "knowledge" }, { path: "bio.md", text: "Born", role: "persona" }],
    cut: ["bio.md"],
  });
  assert.match(message, /<source name="kb\/tax.md" role="knowledge">\nVAT rules\n<\/source>/);
  assert.match(message, /<source name="bio.md" role="persona" cut="true">\nBorn\n<\/source>/);
});

test("readMap: keeps lines, drops unknown and repeated paths, skips blank lines", () => {
  const map = readMap({
    good: [{ text: " Dutch VAT for freelancers ", from: ["kb/tax.md", "ghost.md", "kb/tax.md"] }, { text: "  ", from: [] }],
    notTrained: [{ text: "US payroll" }],
  }, ["kb/tax.md"]);
  assert.deepEqual(map, {
    good: [{ text: "Dutch VAT for freelancers", from: ["kb/tax.md"] }],
    medium: [],
    notTrained: [{ text: "US payroll", from: [] }],
  });
});

test("readMap: fails on no block, wrong shape or no line", () => {
  assert.throws(() => readMap(null, []), BadOutput);
  assert.throws(() => readMap({ good: "VAT" }, []), BadOutput);
  assert.throws(() => readMap({ good: [{ from: [] }] }, []), BadOutput);
  assert.throws(() => readMap({ good: [], medium: [{ text: " " }] }, []), BadOutput);
});
