import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readEvents, parseEventBlock, applyDraftEvent, changeLine, firstSentence, errorLine,
  splitPaste, replyBlocks, inlineRuns, switcherRows, timeAgo,
} from "./sketch.js";

const streamOf = (...chunks) =>
  new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
      controller.close();
    },
  });

test("readEvents parses SSE blocks split across chunks", async () => {
  const body = streamOf('event: delta\ndata: {"text":"Hel', 'lo"}\n\nevent: done\ndata: {"say":"Hello","sessionId":"s1"}\n\n');
  const events = [];
  for await (const event of readEvents(body)) events.push(event);
  assert.deepEqual(events, [
    { event: "delta", data: { text: "Hello" } },
    { event: "done", data: { say: "Hello", sessionId: "s1" } },
  ]);
});

test("readEvents ends quietly when the stream is cut mid-block", async () => {
  const events = [];
  for await (const event of readEvents(streamOf('event: delta\ndata: {"text":"a"}\n\nevent: delta\ndata: {"te'))) events.push(event);
  assert.equal(events.length, 1);
});

test("parseEventBlock skips broken blocks", () => {
  assert.equal(parseEventBlock("event: delta\ndata: {nope"), null);
  assert.equal(parseEventBlock(": comment"), null);
});

test("applyDraftEvent replaces the draft and moves marks from yours to fresh", () => {
  const before = { name: "Tony", persona: "p", instructions: "i", status: "saved" };
  const draft = { name: "T", persona: "p", instructions: "i", status: "draft" };
  const result = applyDraftEvent({ draft: before, yours: new Set(["name", "persona"]) }, { draft, changed: ["name"] });
  assert.equal(result.draft, draft);
  assert.deepEqual([...result.fresh], ["name"]);
  assert.deepEqual([...result.yours], ["persona"]);
  assert.equal(result.firstSketch, false);
  assert.equal(result.unkept, true);
});

test("applyDraftEvent spots the first sketch", () => {
  const empty = { name: "", persona: "", instructions: "", status: "draft" };
  const draft = { name: "Tony", persona: "p", instructions: "i", status: "draft" };
  assert.equal(applyDraftEvent({ draft: empty, yours: new Set() }, { draft, changed: ["name", "persona", "instructions"] }).firstSketch, true);
});

test("changeLine is built from changed, in field order", () => {
  assert.equal(changeLine([]), "");
  assert.equal(changeLine(["persona"]), "Sketch: persona updated");
  assert.equal(changeLine(["persona", "name"]), "Sketch: name and persona updated");
  assert.equal(changeLine(["instructions", "name", "persona"]), "Sketch: name, persona and instructions updated");
});

test("firstSentence cuts at the first sentence and at 140 characters", () => {
  assert.equal(firstSentence("You are Tony. You push."), "You are Tony.");
  assert.equal(firstSentence("Is it him? Yes."), "Is it him?");
  assert.equal(firstSentence("No end mark"), "No end mark");
  const long = firstSentence("a".repeat(200));
  assert.equal(long.length, 140);
  assert.ok(long.endsWith("…"));
});

test("errorLine: the offline kind has no Try again of its own; Stop is neutral", () => {
  assert.deepEqual(errorLine("not-installed"), { text: "The Sketcher can't reach Claude right now.", retry: false, details: false, offline: true });
  assert.equal(errorLine("cancelled").neutral, true);
  assert.equal(errorLine("network").text, "Lost the connection to the app.");
  assert.equal(errorLine("bad-output").details, true);
  assert.equal(errorLine("something-new").retry, true);
});

test("splitPaste keeps short messages whole and splits a long paste at the paste point", () => {
  assert.deepEqual(splitPaste("short", 0), { lead: "short", note: "" });
  const pasted = Array.from({ length: 301 }, (_, i) => `w${i}`).join(" ");
  assert.deepEqual(splitPaste(`Use this: ${pasted}`, 10), { lead: "Use this:", note: pasted });
  assert.deepEqual(splitPaste(pasted, -1), { lead: "", note: pasted });
});

test("replyBlocks finds voice cards, plain quotes and paragraphs", () => {
  const say = "Here's how he'd answer:\n\n> **Tony:** Get up.\n> Now.\n\n> just a quote\n\nIf that's him, press Keep.";
  assert.deepEqual(replyBlocks(say), [
    { type: "text", text: "Here's how he'd answer:" },
    { type: "voice", name: "Tony", text: "Get up.\nNow." },
    { type: "quote", text: "just a quote" },
    { type: "text", text: "If that's him, press Keep." },
  ]);
  assert.equal(replyBlocks("> **Coach T**: Hi")[0].name, "Coach T");
  assert.equal(replyBlocks("> **Bold** not a voice")[0].type, "quote");
});

test("inlineRuns marks bold spans", () => {
  assert.deepEqual(inlineRuns("a **b** c"), [{ text: "a ", bold: false }, { text: "b", bold: true }, { text: " c", bold: false }]);
});

test("switcherRows: newest first, Untitled sketch, Kept or Sketch", () => {
  const now = Date.parse("2026-11-24T12:00:00Z");
  const rows = switcherRows([
    { id: "a", draft: { name: "Old", status: "draft" }, updatedAt: "2026-11-23T10:00:00Z" },
    { id: "b", draft: { name: "", status: "saved" }, updatedAt: "2026-11-24T11:58:00Z" },
  ], now);
  assert.deepEqual(rows, [
    { id: "b", name: "Untitled sketch", status: "Kept", when: "2 min ago" },
    { id: "a", name: "Old", status: "Sketch", when: "yesterday" },
  ]);
  assert.equal(timeAgo("2026-11-24T12:00:00Z", now), "just now");
});
