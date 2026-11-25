import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import {
  readEvents, parseEventBlock, applyDraftEvent, changeLine, firstSentence, errorLine,
  splitPaste, replyBlocks, inlineRuns, switcherRows, timeAgo, mergePersona,
  skillsFromMap, applyAiSkills, profileRows, nextRow, moveSkill, skillLabel, moveLine, describe,
  sourcesOf, dnaLayers, instructionParts, partAt, threadsFor, removeRag, undoRag, toggleUse, qualityFrom,
  fileEntries, agentZip, feedLabel, filesSub, sizeLabel,
} from "./sketch.js";

// ── DNA · Files ───────────────────────────────────────────────────────────
test("Files: a picked folder keeps its relative paths, loose files their names", () => {
  const picked = [{ webkitRelativePath: "notes/week 1.md", name: "week 1.md", size: 10 }, { webkitRelativePath: "", name: "a.pdf", size: 3 }];
  assert.deepEqual(fileEntries(picked), [{ path: "notes/week 1.md", size: 10 }, { path: "a.pdf", size: 3 }]);
  assert.deepEqual(fileEntries(null), []);
});

test("Files: an .agent.zip is an import, anything else is a file for DNA", () => {
  assert.equal(agentZip([{ path: "x/Juno.agent.zip" }, { path: "a.md" }]), "x/Juno.agent.zip");
  assert.equal(agentZip([{ path: "a.zip" }]), null);
});

test("Files: feeds read in DNA words; unrouted files are counted", () => {
  assert.equal(feedLabel(["rag"]), "Looks up");
  assert.equal(feedLabel(["instructions"]), "Shapes Instructions");
  assert.equal(feedLabel(["rag", "instructions"]), "Looks up · shapes Instructions");
  assert.equal(feedLabel([]), "Not routed yet");
  assert.equal(filesSub([{ feeds: ["rag"] }, { feeds: [] }]), "2 files · 1 not routed yet");
  assert.equal(filesSub([{ feeds: ["rag"] }]), "1 file · all routed");
  assert.match(filesSub([]), /Drop files/);
});

test("Files: sizes read short, unknown sizes read blank", () => {
  assert.equal(sizeLabel(512), "512 B");
  assert.equal(sizeLabel(2048), "2 KB");
  assert.equal(sizeLabel(3 * 1024 ** 2), "3.0 MB");
  assert.equal(sizeLabel(null), "");
});

// ── SKETCH-REWORK P2 / P3 ─────────────────────────────────────────────────
const MAP = [
  { id: "m1", level: "rough", text: "Pricing and offers", refs: [{ fileId: "f2", location: "p 4" }] },
  { id: "m2", level: "sharp", text: "Sales talks and closing", refs: [{ fileId: "f1", location: "12:00" }, { fileId: "f2", location: "p 9" }] },
  { id: "m3", level: "blank", text: "Money and investing", refs: [] },
  { id: "m4", level: "sharp", text: "Hard calls with clients", refs: [{ fileId: "f3", location: "3:10" }] },
];
const FILES = [
  { id: "f1", name: "Day 1.mp4" }, { id: "f2", name: "Offers.pdf" },
  { id: "f3", name: "Calls.mp3", ease: "hard" }, { id: "f4", name: "Notes.txt" },
];

test("profileRows sorts skills into three rows and keeps their order", () => {
  const rows = profileRows(skillsFromMap(MAP));
  assert.deepEqual(rows.map((r) => r.title), ["Good at", "Medium", "Not trained for"]);
  assert.deepEqual(rows.map((r) => r.skills.map((s) => s.id)), [["m2", "m4"], ["m1"], ["m3"]]);
  assert.deepEqual(rows.map((r) => r.hint), ["plenty in the material", "some in the material", "not in the material yet"]);
});

test("empty rows say so; Not trained for never reads as can-do-everything", () => {
  const rows = profileRows([]);
  assert.deepEqual(rows.map((r) => r.empty), ["Nothing here yet.", "Nothing here yet.", "Nothing missing that we know of."]);
  for (const r of rows) assert.doesNotMatch(`${r.title} ${r.hint} ${r.empty}`, /sharp|rough|blank|persona/i);
});

test("moveSkill marks a chip picked; a later study does not move it", () => {
  assert.equal(nextRow("good"), "medium");
  assert.equal(nextRow("not"), "good");
  const picks = moveSkill({}, "m3", nextRow("not"));
  const skills = skillsFromMap(MAP, picks);
  const money = skills.find((s) => s.id === "m3");
  assert.equal(money.row, "good");
  assert.equal(money.picked, true);
  assert.equal(skillLabel(money), "Money and investing, Good at, moved by you");
  assert.equal(moveLine(money, "Rex"), 'Profile: "Money and investing" moved to Good at · summary only, Rex answers the same');
  const restudied = applyAiSkills(skills, MAP.map((l) => ({ ...l, level: "rough" })));
  assert.equal(restudied.find((s) => s.id === "m3").row, "good");
  assert.equal(restudied.find((s) => s.id === "m2").row, "medium");
});

test("describe falls back to the Instructions' first sentence, max 140 characters", () => {
  assert.deepEqual(describe("  Mine.  ", "You coach. Hard."), { text: "Mine.", fromInstructions: false });
  assert.deepEqual(describe("", "You coach. Hard."), { text: "You coach.", fromInstructions: true });
  const long = describe("", `${"word ".repeat(60)}end.`);
  assert.ok(long.text.length <= 140);
  assert.equal(describe("", "").fromInstructions, false);
});

test("dnaLayers: four layers in fixed order, with words for an agent with no files", () => {
  const full = dnaLayers({ name: "Rex", map: MAP, files: FILES });
  assert.deepEqual(full.map((l) => l.title), ["Instructions", "Made from", "Looks up", "Strong and thin"]);
  assert.equal(full[1].sub, "3 files shaped these instructions");
  assert.equal(full[2].sub, "4 files Rex reads while answering");
  assert.equal(full[3].sub, "about the material, not about Rex");
  const none = dnaLayers({ name: "Edie" });
  assert.deepEqual(none.map((l) => l.count), [1, 0, 0, 0]);
  assert.equal(none[1].sub, "Made from one sentence, no files yet.");
  assert.equal(none[2].sub, "Nothing to look up yet.");
  for (const l of [...full, ...none]) assert.doesNotMatch(`${l.title} ${l.sub}`, /persona/i);
});

test("instruction parts are paragraphs; partAt follows the caret", () => {
  const text = "You coach sales.\nShort lines.\n\nNever talk about money.";
  const parts = instructionParts(text);
  assert.deepEqual(parts.map((p) => p.text), ["You coach sales.\nShort lines.", "Never talk about money."]);
  assert.equal(partAt(text, 0), 0);
  assert.equal(partAt(text, text.length), 1);
  assert.equal(partAt(text, text.indexOf("\n\n") + 1), 0);
  assert.equal(partAt("", 0), -1);
});

test("threadsFor returns the source files behind a part, none for its own view", () => {
  assert.deepEqual(threadsFor("Run sales talks like a coach.", MAP, FILES).map((f) => f.id), ["f1", "f2"]);
  assert.deepEqual(threadsFor("Be kind.", MAP, FILES), []);
  assert.deepEqual(sourcesOf(MAP, FILES).map((f) => f.id), ["f2", "f1", "f3"]);
});

test("removing a looked-up file can be undone; turning it off is a toggle", () => {
  const { files, undo } = removeRag(FILES, "f4");
  assert.equal(files.find((f) => f.id === "f4").removed, true);
  assert.deepEqual(undo, { id: "f4", name: "Notes.txt" });
  assert.equal(FILES.find((f) => f.id === "f4").removed, undefined); // nothing changed in place
  assert.equal(undoRag(files, undo).find((f) => f.id === "f4").removed, false);
  assert.equal(dnaLayers({ name: "Rex", map: MAP, files }).at(2).count, 3);
  assert.equal(toggleUse(toggleUse(FILES, "f1"), "f1").find((f) => f.id === "f1").off, false);
});

test("quality and profileRows read the same skills", () => {
  const skills = skillsFromMap(MAP, moveSkill({}, "m1", "good"));
  const q = qualityFrom(skills, FILES);
  const rows = profileRows(skills);
  assert.deepEqual(q.lines.filter((l) => l.kind === "Strong").map((l) => l.skill), rows[0].skills.map((s) => s.id));
  assert.deepEqual(q.lines.filter((l) => l.kind === "Thin").map((l) => l.skill), rows[1].skills.map((s) => s.id));
  assert.deepEqual(q.lines.filter((l) => l.kind === "Missing").map((l) => l.skill), rows[2].skills.map((s) => s.id));
  assert.deepEqual(q.lines.filter((l) => l.kind === "Set aside").map((l) => l.file), ["f3"]);
  assert.equal(q.score, 75);
  assert.equal(q.overall, "Overall 75 of 100");
  for (const l of q.lines) assert.ok(l.kind === "Strong" ? l.action === null : Boolean(l.action));
  assert.equal(qualityFrom([]).overall, "Nothing to judge yet.");
});

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

test("Eraser: one home for what it knows (DNA), no old level words in change lines", () => {
  assert.doesNotMatch(read("block-b.js"), /c8Surface\(/, "Keep card repeats what it knows next to DNA");
  assert.doesNotMatch(read("block-e.js"), /What \$\{name\} knows: \d Sharp/, "change line uses the old name and words");
  assert.match(read("block-c.js"), /lastQuality/, "quality glow plays once per new summary");
});

test("O4: a fix from Talk lands on DNA, where Instructions live", () => {
  const d = read("block-d.js");
  assert.match(d, /function openDna\(\)[\s\S]*?rs-dna/, "block-d has a way to open DNA");
  assert.match(d, /async function seeSketch[\s\S]*?openDna\(\);[\s\S]*?scrollIntoView/, "See the Sketch opens DNA before scrolling");
  assert.match(d, /instructions updated · from your talk[^\n]*openDna\(\)/, "the change line opens DNA");
});

// ── SKETCH-REWORK phases 2 and 3: the page carries Profile and DNA ────────
const count = (text, re) => (text.match(re) ?? []).length;

test("P2: Profile tab holds one name, a description and the skill rows", () => {
  const html = read("index.html");
  assert.match(html, /id="rs-profile"[^>]*>Profile</);
  assert.equal(count(html, /id="f-name"/g), 1, "exactly one Name input");
  assert.equal(count(html, /id="f-desc"/g), 1);
  assert.match(html, /id="profile-skills"/);
  assert.doesNotMatch(html, /rs-sketch|rs-knows|capability-map|What it knows/);
  assert.doesNotMatch(read("block-c.js"), /Sharp|Rough|Blank|Persona/, "Profile and DNA speak plain words");
  assert.match(read("block-c.js"), /profile-skill-chip/);
});

test("P3: DNA tab has its layers in order (Files after Made from), with the one Instructions box", () => {
  const html = read("index.html");
  assert.match(html, /id="rs-dna"[^>]*>DNA</);
  const dna = html.slice(html.indexOf('id="dna"'), html.indexOf('id="dna-passage"'));
  const layers = [...dna.matchAll(/class="dna-layer" data-layer="(\w+)" style="--dna-i: (\d)"/g)].map((m) => `${m[2]}:${m[1]}`);
  assert.deepEqual(layers, ["0:instructions", "1:made", "2:files", "3:looks", "4:quality"]);
  assert.ok(dna.includes("webkitdirectory"), "a folder can be picked in DNA");
  assert.equal(count(html, /id="f-instructions"/g), 1, "exactly one Instructions box");
  assert.ok(dna.includes('id="f-instructions"'), "Instructions live in DNA");
  for (const id of ["dna-own", "dna-made", "study-host", "knows", "dna-quality"]) assert.ok(dna.includes(`id="${id}"`), id);
  const c = read("block-c.js");
  for (const cls of ["is-revealed", "dna-thread", "is-active", "dna-quality-glow"]) assert.ok(c.includes(cls), cls);
});

test("MAGIC-PASS X3: no Palette view, no second way to change the agent", () => {
  assert.doesNotMatch(read("block-e.js"), /openPalette|setTrait|TRAIT_COLOURS/);
  assert.doesNotMatch(read("block-a.js"), /"Palette"/);
  assert.doesNotMatch(read("app.css"), /\.palette-view|\.trait-row/);
  assert.match(read("app.css"), /\.stand-in \.palette-band/, "study progress keeps its strip");
});

test("MAGIC-PASS X1/X2/X4: one name per motion, errors stay still", () => {
  const css = read("magic.css");
  const names = [...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]);
  assert.deepEqual(names.filter((n, i) => names.indexOf(n) !== i), [], "duplicate keyframes");
  assert.doesNotMatch(css, /magic-toast-rise|magic-fade\b(?!-)/);
  assert.match(css, /\.toast:not\(\.is-error\)/);
  assert.match(read("components.js"), /Couldn't read the drop[^\n]*\{ error: true \}/);
  assert.match(read("block-c.js"), /Couldn't add the files[^\n]*\{ error: true \}/);
});

test("P2/P3: every id the blocks ask for is on the page", () => {
  const html = read("index.html");
  const ids = new Set([...html.matchAll(/id="([\w-]+)"/g)].map((m) => m[1]));
  for (const f of ["block-b.js", "block-c.js", "block-e.js"]) {
    for (const [, id] of read(f).matchAll(/\$\("([\w-]+)"\)/g)) {
      assert.ok(ids.has(id), `${f} asks for #${id}, not in index.html`);
    }
  }
});
