import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyDraft } from "../draft.mjs";
import { BadOutput } from "../errors.mjs";
import { buildPersonaMessage, readGenerated } from "./personaPrompt.mjs";

test("buildPersonaMessage: draft, hand lines and each source, cut ones marked", () => {
  const message = buildPersonaMessage({
    sources: [{ path: "bio.md", text: "Born in Lyon.\n" }, { path: "talks/one.txt", text: "Hello" }],
    cut: ["talks/one.txt"],
    draft: { ...emptyDraft(), name: "Ada" },
    handEdited: ["name"],
    handLines: { instructions: ["Never swear."] },
  });
  assert.match(message, /"name": "Ada"/);
  assert.match(message, /edited by hand since you last changed them: name\./);
  assert.match(message, /- instructions: Never swear\./);
  assert.match(message, /<source name="bio.md">\nBorn in Lyon.\n<\/source>/);
  assert.match(message, /<source name="talks\/one.txt" cut="true">\nHello\n<\/source>/);
});

test("readGenerated: fields and context, trimmed; empty and missing ones left out", () => {
  const read = readGenerated({ name: " Ada ", persona: "", instructions: "Teach.", context: "## Life\n", extra: 1 });
  assert.deepEqual(read, { fields: { name: "Ada", instructions: "Teach." }, context: "## Life" });
});

test("readGenerated: no context is null", () => {
  assert.equal(readGenerated({ name: "Ada" }).context, null);
});

test("readGenerated: no block, a non-text field, or nothing written is BadOutput", () => {
  assert.throws(() => readGenerated(null), BadOutput);
  assert.throws(() => readGenerated({ name: 3 }), BadOutput);
  assert.throws(() => readGenerated({ name: " ", context: "" }), BadOutput);
});
