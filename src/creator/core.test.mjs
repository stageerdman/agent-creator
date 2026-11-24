import { test } from "node:test";
import assert from "node:assert/strict";
import { applyPatch, emptyDraft, isEmpty, trackHandEdits } from "./draft.mjs";
import { splitReply, streamFilter } from "./creatorReply.mjs";
import { buildCreatorPrompt } from "./creatorPrompt.mjs";

const draft = (fields = {}) => ({ ...emptyDraft(), ...fields });

test("applyPatch merges known string fields and lists what changed", () => {
  const { draft: next, changed } = applyPatch(draft({ name: "Tony", persona: "old" }), { persona: "new", name: "Tony" });
  assert.deepEqual(next, draft({ name: "Tony", persona: "new" }));
  assert.deepEqual(changed, ["persona"]);
});

test("applyPatch drops unknown keys and non-strings (the P12 map can't sneak in)", () => {
  const before = draft({ name: "Tony" });
  const { draft: next, changed } = applyPatch(before, { name: 7, capabilityMap: {}, status: "saved", instructions: null });
  assert.equal(next, before);
  assert.deepEqual(changed, []);
});

test("applyPatch turns a kept agent back into a draft only on a real change", () => {
  const kept = draft({ name: "Tony", status: "saved" });
  assert.equal(applyPatch(kept, { name: "Tony" }).draft.status, "saved");
  assert.equal(applyPatch(kept, { name: "Tina" }).draft.status, "draft");
  assert.equal(applyPatch(kept, null).draft, kept);
});

test("isEmpty ignores whitespace", () => {
  assert.equal(isEmpty(draft({ persona: "  \n" })), true);
  assert.equal(isEmpty(draft({ instructions: "x" })), false);
});

test("trackHandEdits: a hand edit marks a field, a creator change clears it", () => {
  const marked = trackHandEdits(["name"], ["persona"], "hand");
  assert.deepEqual(marked, ["name", "persona"]);
  assert.deepEqual(trackHandEdits(marked, ["persona", "instructions"], "creator"), ["name"]);
});

test("splitReply without a block keeps the text and gives no patch", () => {
  assert.deepEqual(splitReply("  Hello there.  "), { say: "Hello there.", patch: null });
});

test("splitReply strips the block and parses it", () => {
  const { say, patch } = splitReply('Done.\n<draft>{"name":"Tony"}</draft>\n');
  assert.equal(say, "Done.");
  assert.deepEqual(patch, { name: "Tony" });
});

test("splitReply: a broken block gives no patch but the chat still shows", () => {
  assert.deepEqual(splitReply("Hi <draft>{name: oops}</draft>"), { say: "Hi", patch: null });
  assert.deepEqual(splitReply("Hi <draft>[1]</draft>"), { say: "Hi", patch: null });
  assert.deepEqual(splitReply('Hi <draft>{"name":"T'), { say: "Hi", patch: null });
});

test("splitReply: with two blocks the last one wins and both are hidden", () => {
  const { say, patch } = splitReply('A <draft>{"name":"One"}</draft> B <draft>{"name":"Two"}</draft>');
  assert.equal(say, "A  B");
  assert.deepEqual(patch, { name: "Two" });
});

test("splitReply tolerates a fenced JSON body", () => {
  assert.deepEqual(splitReply('ok <draft>\n```json\n{"name":"T"}\n```\n</draft>').patch, { name: "T" });
});

function runFilter(deltas) {
  const filter = streamFilter();
  const shown = deltas.map((d) => filter.push(d));
  return [...shown, filter.flush()];
}

test("streamFilter never leaks a draft tag split across deltas", () => {
  const shown = runFilter(["Here you go. <dr", 'aft>{"name"', ':"Tony"}</dra', "ft> Bye"]);
  assert.equal(shown.join(""), "Here you go.  Bye");
  assert.ok(shown.every((piece) => !piece.includes("<") && !piece.includes("{")));
});

test("streamFilter releases text that only looked like a tag start", () => {
  assert.equal(runFilter(["a <d", "og> b <"]).join(""), "a <dog> b <");
});

test("streamFilter hides an unclosed block to the end", () => {
  assert.equal(runFilter(["Hi <draft>", '{"name"']).join(""), "Hi ");
});

test("the creator prompt carries the current draft, its hand edits and status", () => {
  const prompt = buildCreatorPrompt({ draft: draft({ name: "Tony", persona: "You are loud." }), handEdited: ["persona"] });
  assert.match(prompt, /"persona": "You are loud\."/);
  assert.match(prompt, /edited by hand since you last changed them: persona\./);
  assert.match(prompt, /status="draft"/);
  assert.match(prompt, /at most once/);
  assert.doesNotMatch(prompt, /<materials>/);
});

test("after Keep the prompt says so and drops the Keep pointer", () => {
  const prompt = buildCreatorPrompt({ draft: draft({ status: "saved" }) });
  assert.match(prompt, /status="kept"/);
  assert.match(prompt, /already pressed Keep/);
  assert.match(prompt, /hand since you last changed them: none\./);
});
