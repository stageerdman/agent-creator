import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore, createAgents } from "../../creator/index.mjs";
import { createApp } from "../app.mjs";
import {
  BELT_CAP, FIELD_CAP, RED, applyRemove, countLine, dotAt, dotLook, dropNote, dropPlan,
  fieldLayout, postInBatches, sectionLine, skillName, spotOf, zoneAt, zoneLabel,
} from "./creation-screen.js";
import { FLY } from "./firefly-orbit.js";

// The real server and store in a temp home, so the screen's requests are checked against the real endpoints.
const home = await mkdtemp(join(tmpdir(), "agent-creator-creation-"));
const store = createAgentStore({ home });
const server = createApp({}, { store }).listen(0);
const base = `http://localhost:${server.address().port}`;
const agents = createAgents({ store, engine: {} }); // only to mark files used, which has no endpoint
after(async () => {
  server.close();
  await rm(home, { recursive: true, force: true });
});

async function call(method, url, body) {
  const r = await fetch(base + url, { method, headers: body ? { "content-type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json();
  assert.ok(r.ok, `${method} ${url} → ${r.status} ${JSON.stringify(data)}`);
  return data;
}
const files = (n, dir = "notes") => Array.from({ length: n }, (_, i) => ({ path: `${dir}/f${i}.md`, size: i + 1 }));
const ROOT = new URL("../../../", import.meta.url);
const text = (path) => readFile(new URL(path, ROOT), "utf8");

/* ---------- the scan: fireflies arrive batch by batch ---------- */

test("uploads go in batches, one after another, and the field grows after each", async () => {
  const sent = [], grown = [];
  let busy = false;
  const last = await postInBatches(files(1050), async (part) => {
    assert.equal(busy, false, "one batch at a time");
    busy = true; await null; busy = false;
    sent.push(part.length);
    return { total: sent.reduce((a, b) => a + b, 0) };
  }, (r, soFar) => grown.push([r.total, soFar]), 500);
  assert.deepEqual(sent, [500, 500, 50]);
  assert.deepEqual(grown, [[500, 500], [1000, 1000], [1050, 1050]]);
  assert.deepEqual(last, { total: 1050 });
  assert.equal(await postInBatches([], () => assert.fail("nothing to post")), null);
});

test("a 10,000-file folder: every file is counted, only FIELD_CAP are drawn, fast", () => {
  const dna = files(10000).map((f) => ({ id: f.path, name: f.path, sizeBytes: f.size, state: "unprocessed" }));
  const t = performance.now();
  const lay = fieldLayout(dna, { width: 1000, height: 800 });
  assert.ok(performance.now() - t < 200, "laying out 10,000 files must not freeze the screen");
  assert.equal(lay.total, 10000);
  assert.equal(lay.dots.length, FIELD_CAP);
  assert.equal(countLine(10000), "10,000 files · 3,000 shown");
  assert.equal(countLine(1), "1 file");
  assert.equal(countLine(0), "");
  for (const d of lay.dots) assert.ok(d.x >= 32 && d.x <= 968 && d.y >= 32 && d.y <= 768, "inside the field");
});

test("a file always lands on the same spot, so new batches never shuffle the field", () => {
  assert.deepEqual(spotOf("a/b.md"), spotOf("a/b.md"));
  assert.notDeepEqual(spotOf("a/b.md"), spotOf("a/c.md"));
  const dna = files(3).map((f) => ({ id: f.path, name: f.path, state: "unprocessed" }));
  const before = fieldLayout(dna.slice(0, 2), { width: 500, height: 500 }).dots;
  const afterMore = fieldLayout(dna, { width: 500, height: 500 }).dots;
  assert.deepEqual(afterMore.slice(0, 2), before);
  assert.equal(dotAt(afterMore, afterMore[2].x + 3, afterMore[2].y).id, dna[2].id);
  assert.equal(dotAt(afterMore, -100, -100), null);
});

/* ---------- file states: dim, bright, red ---------- */

test("dim if unprocessed, bright if processed, red if removed but still baked in", () => {
  assert.deepEqual(dotLook("unprocessed"), { color: FLY, alpha: 0.32, halo: false });
  assert.deepEqual(dotLook("processed"), { color: FLY, alpha: 0.9, halo: true });
  assert.deepEqual(dotLook("removed"), { color: RED, alpha: 0.9, halo: true });
  assert.notEqual(RED, FLY);
});

test("the belt's line says what is used, waiting and out", () => {
  assert.equal(sectionLine([]), "nothing yet · drag files here");
  assert.equal(sectionLine([{ state: "processed" }, { state: "unprocessed" }, { state: "unprocessed" }, { state: "removed" }]),
    "1 used · 2 waiting · 1 out at next rebuild");
  assert.ok(BELT_CAP > 0);
});

/* ---------- remove, red and green ---------- */

test("remove: a file never used leaves every list", () => {
  const list = [{ path: "a", state: "unprocessed" }, { path: "b", state: "processed" }];
  assert.deepEqual(applyRemove(list, { path: "a", state: "gone" }), [{ path: "b", state: "processed" }]);
});

test("remove: a used file turns red where it was used and leaves where it was only waiting", () => {
  const used = [{ path: "a", state: "processed" }, { path: "b", state: "processed" }];
  const waiting = [{ path: "a", state: "unprocessed" }];
  assert.deepEqual(applyRemove(used, { path: "a", state: "removed" }), [{ path: "a", state: "removed" }, { path: "b", state: "processed" }]);
  assert.deepEqual(applyRemove(waiting, { path: "a", state: "removed" }), []);
});

test("against the server: remove, red until a full rebuild, and the screen's own list matches", async () => {
  const { id } = await call("POST", "/api/agents");
  const url = `/api/agents/${id}/`;
  for (const step of dropPlan("system-prompt", files(3))) await call(step.method, url + step.url, step.body);
  let section = (await call("GET", url + "sections/system-prompt/files")).files;
  assert.deepEqual(section.map((f) => f.state), ["unprocessed", "unprocessed", "unprocessed"]);

  await agents.markProcessed(id, "system-prompt", ["notes/f0.md"]);
  section = (await call("GET", url + "sections/system-prompt/files")).files;
  assert.deepEqual(section.map((f) => f.state), ["processed", "unprocessed", "unprocessed"]);

  const used = await call("DELETE", url + "files?path=" + encodeURIComponent("notes/f0.md"));
  assert.equal(used.state, "removed");
  const never = await call("DELETE", url + "files?path=" + encodeURIComponent("notes/f1.md"));
  assert.equal(never.state, "gone");

  const mine = applyRemove(applyRemove(section, used), never);
  const theirs = (await call("GET", url + "sections/system-prompt/files")).files;
  assert.deepEqual(mine.map((f) => [f.path, f.state]), theirs.map((f) => [f.path, f.state]));
  assert.deepEqual(theirs.map((f) => [f.path, f.state]), [["notes/f0.md", "removed"], ["notes/f2.md", "unprocessed"]]);
  assert.equal(dotLook(theirs[0].state).color, RED, "red, not green");
});

/* ---------- drop zones ---------- */

test("the three zones and their labels", () => {
  assert.equal(zoneLabel("system-prompt"), "Adjust DNA");
  assert.equal(zoneLabel("knowledge"), "Adjust Knowledge");
  assert.equal(zoneLabel("skills"), "Create new skill");
  assert.equal(zoneLabel("elsewhere"), null);
  const rects = [
    { section: "system-prompt", left: 600, top: 100, right: 980, bottom: 250 },
    { section: "knowledge", left: 600, top: 250, right: 980, bottom: 400 },
    { section: "skills", left: 600, top: 400, right: 980, bottom: 550 },
  ];
  assert.equal(zoneAt(rects, 700, 120), "system-prompt");
  assert.equal(zoneAt(rects, 700, 250), "knowledge");
  assert.equal(zoneAt(rects, 979, 549), "skills");
  assert.equal(zoneAt(rects, 300, 300), null, "the field is no zone");
});

test("a drop's requests: Finder files join the agent first, fireflies from the field don't", () => {
  const two = [{ path: "a.md", size: 1, extra: "dropped" }, { path: "b.md", size: 2 }];
  assert.deepEqual(dropPlan("knowledge", two), [
    { method: "POST", url: "files", body: { files: [{ path: "a.md", size: 1 }, { path: "b.md", size: 2 }] } },
    { method: "POST", url: "sections/knowledge/files", body: { files: [{ path: "a.md", size: 1 }, { path: "b.md", size: 2 }] } },
  ]);
  assert.deepEqual(dropPlan("skills", [two[0]], { known: true }), [
    { method: "POST", url: "skills", body: { name: "a", files: [{ path: "a.md", size: 1 }] } },
  ]);
  assert.deepEqual(dropPlan(null, [two[1]]).map((s) => s.url), ["files"]);
  assert.equal(dropPlan("system-prompt", files(1200)).length, 6, "big drops go in batches");
});

test("a new skill is named after the dropped folder, else the first file", () => {
  assert.equal(skillName([{ path: "pricing/a.md" }, { path: "pricing/b/c.md" }]), "pricing");
  assert.equal(skillName([{ path: "Refunds.md" }, { path: "x/y.md" }]), "Refunds");
  assert.equal(skillName([]), "New skill");
  assert.equal(dropNote("skills", 2), "New skill from 2 files");
  assert.equal(dropNote("knowledge", 1), "1 file → Knowledge");
  assert.equal(dropNote(null, 3), "3 files added");
});

test("against the server: each zone sends the files to its own section", async () => {
  const { id } = await call("POST", "/api/agents");
  const url = `/api/agents/${id}/`;
  const run = async (section, list, known) => { for (const s of dropPlan(section, list, { known })) await call(s.method, url + s.url, s.body); };
  await run("system-prompt", files(2, "dna"));
  await run("knowledge", files(1, "facts"));
  await run("skills", files(2, "pricing"));
  await run("knowledge", [{ path: "dna/f0.md", size: 1 }], true); // a firefly carried from the field

  const paths = async (s) => (await call("GET", url + `sections/${s}/files`)).files.map((f) => f.path).sort();
  assert.deepEqual(await paths("system-prompt"), ["dna/f0.md", "dna/f1.md"]);
  assert.deepEqual(await paths("knowledge"), ["dna/f0.md", "facts/f0.md"]);
  const { skills } = await call("GET", url + "skills");
  assert.deepEqual(skills.map((k) => k.name), ["pricing"]);
  assert.equal((await call("GET", `/api/agents/${id}`)).dna.length, 5);
});

test("the popups' endpoints: the system prompt and a skill save, knowledge reads", async () => {
  const { id } = await call("POST", "/api/agents");
  const url = `/api/agents/${id}/`;
  await call("PUT", url + "system-prompt", { text: "You are calm." });
  assert.equal((await call("GET", url + "system-prompt")).text, "You are calm.");
  assert.equal(typeof (await call("GET", url + "knowledge")).text, "string");
  const k = await call("POST", url + "skills", { name: "Refunds" });
  await call("PUT", url + "skills/" + encodeURIComponent(k.id), { name: "Refunds", body: "Step one." });
  assert.equal((await call("GET", url + "skills/" + encodeURIComponent(k.id))).body, "Step one.");
});

test("the page can load the screen's script", async () => {
  const r = await fetch(base + "/creation-screen.js");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /javascript/);
  const page = await (await fetch(base + "/new")).text();
  for (const id of ["flies", "count", "menu", "emblem", "name", "note", "ghost", "sheet", "sheet-title", "sheet-name", "sheet-text"]) {
    assert.match(page, new RegExp(`id="${id}"`), `new-agent.html has #${id}`);
  }
  for (const s of ["system-prompt", "knowledge", "skills"]) assert.match(page, new RegExp(`data-section="${s}"`));
});

/* ---------- Start opens the newest build ---------- */

test("Start builds, replaces the installed app, then opens that copy", async () => {
  assert.match(await text(".project"), /^run: npm run start:app$/m);
  const pkg = JSON.parse(await text("package.json"));
  assert.equal(pkg.scripts["start:app"], "sh scripts/start-mac-app.sh");
  assert.match(pkg.scripts["build:app"], /tauri build .*&& sh scripts\/install-mac-app\.sh$/);
  const start = await text("scripts/start-mac-app.sh");
  assert.match(start, /set -eu/);
  const build = start.indexOf("npm run --silent build:app"), open = start.indexOf('open -W "$DEST"');
  assert.ok(build >= 0 && open > build, "builds first, then opens what the build installed");
  const install = await text("scripts/install-mac-app.sh");
  const wipe = install.indexOf('rm -rf "$DEST"'), copy = install.indexOf('ditto "$BUILT" "$DEST"');
  assert.ok(wipe >= 0 && copy > wipe, "the old copy is removed before the new one goes in");
  assert.match(install, /echo "\$DEST"\s*$/, "the installed path is the last line Start reads");
  const conf = JSON.parse(await text("src-tauri/tauri.conf.json"));
  assert.equal(conf.build.beforeBuildCommand, "node scripts/stage-mac-app.mjs", "every build stages the newest page");
  const stage = await text("scripts/stage-mac-app.mjs");
  const clear = stage.indexOf("rmSync(app"), fill = stage.indexOf("cpSync(`${root}src`");
  assert.ok(clear >= 0 && fill > clear, "the stage is emptied before the newest src goes in");
});
