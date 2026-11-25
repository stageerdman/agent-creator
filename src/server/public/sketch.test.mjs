import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import {
  readEvents, parseEventBlock, applyDraftEvent, changeLine, firstSentence, errorLine,
  splitPaste, replyBlocks, inlineRuns, switcherRows, timeAgo, mergePersona,
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
  const before = { name: "Tony", instructions: "i", status: "saved" };
  const draft = { name: "T", instructions: "i", status: "draft" };
  const result = applyDraftEvent({ draft: before, yours: new Set(["name", "instructions"]) }, { draft, changed: ["name"] });
  assert.equal(result.draft, draft);
  assert.deepEqual([...result.fresh], ["name"]);
  assert.deepEqual([...result.yours], ["instructions"]);
  assert.equal(result.firstSketch, false);
  assert.equal(result.unkept, true);
});

test("applyDraftEvent spots the first sketch", () => {
  const empty = { name: "", instructions: "", status: "draft" };
  const draft = { name: "Tony", instructions: "i", status: "draft" };
  assert.equal(applyDraftEvent({ draft: empty, yours: new Set() }, { draft, changed: ["name", "instructions"] }).firstSketch, true);
});

test("applyDraftEvent folds an old persona into instructions and never names it", () => {
  const draft = { name: "Tony", persona: "You push.", instructions: "Coach.", status: "draft" };
  const result = applyDraftEvent({ draft: { name: "", instructions: "" }, yours: new Set() }, { draft, changed: ["persona"] });
  assert.equal(result.draft.instructions, "You push.\n\nCoach.");
  assert.equal("persona" in result.draft, false);
  assert.deepEqual(result.changed, ["instructions"]);
  assert.deepEqual([...result.fresh], ["instructions"]);
});

test("changeLine is built from changed, in field order", () => {
  assert.equal(changeLine([]), "");
  assert.equal(changeLine(["instructions"]), "Sketch: instructions updated");
  assert.equal(changeLine(["instructions", "name"]), "Sketch: name and instructions updated");
});

test("changeLine never says persona", () => {
  for (const changed of [["persona"], ["persona", "name"], ["instructions", "name", "persona"]]) {
    assert.doesNotMatch(changeLine(changed), /persona/i);
  }
  assert.equal(changeLine(["persona", "instructions"]), "Sketch: instructions updated");
});

test("mergePersona keeps every word, Persona first", () => {
  const draft = { name: "Ines", persona: "Calm and exact.\nNever rushes.", instructions: "Teach negotiation.", status: "saved" };
  const merged = mergePersona(draft);
  assert.equal(merged.instructions, "Calm and exact.\nNever rushes.\n\nTeach negotiation.");
  assert.equal("persona" in merged, false);
  assert.equal(merged.name, "Ines");
  assert.equal(merged.status, "saved");
  assert.equal(mergePersona({ persona: "Only a persona.", instructions: "" }).instructions, "Only a persona.");
});

test("mergePersona leaves a draft without persona unchanged and is safe twice", () => {
  const plain = { name: "A", instructions: "Do X." };
  assert.equal(mergePersona(plain), plain);
  const old = { name: "A", persona: "P.", instructions: "I." };
  const once = mergePersona(old);
  assert.deepEqual(mergePersona(once), once);
  // The server may still hold persona next to an already merged text.
  assert.equal(mergePersona({ ...once, persona: "P." }).instructions, "P.\n\nI.");
  assert.equal(mergePersona({ persona: "", instructions: "I." }).instructions, "I.");
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

// ── SKETCH-REWORK phase 1: one Instructions box, no Talk to, no top study line ──
const pub = new URL("./", import.meta.url);
const read = (name) => readFileSync(new URL(name, pub), "utf8");
const pageFiles = () => [...readdirSync(pub).filter((f) => /^block-.*\.js$/.test(f)), "components.js", "app.js", "index.html", "app.css"];

test("P1: no Persona field, no Talk to section, no top-bar study line", () => {
  const html = read("index.html");
  assert.doesNotMatch(html, />Persona</, "index.html still labels a Persona field");
  assert.doesNotMatch(html, /f-persona|top-study/);
  for (const f of pageFiles()) {
    const src = read(f);
    assert.doesNotMatch(src, /Studying · about/, `${f} still says "Studying · about"`);
    assert.doesNotMatch(src, /study-pill|talk-to\b/, `${f} still has the pill or the Talk to button`);
    assert.doesNotMatch(src, /markUpdated\("persona"\)|fields\.persona|persona updated/, `${f} still points at Persona`);
  }
});
