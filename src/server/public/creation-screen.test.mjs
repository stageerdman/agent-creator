import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore, createAgents } from "../../creator/index.mjs";
import { createApp } from "../app.mjs";
import {
  BELT_CAP, CLUSTER_H, EMPTY, FIELD_CAP, RED, ROW, SHINE_MAX, applyRemove, clusterSpot, dotLook, dropPlan,
  fieldLayout, flightPath, nextName, orderedSpot, postInBatches, sectionLine, skillName, spotOf, wanderAt, wanderParams,
  zoneAt, zoneLabel,
} from "./creation-screen.js";
const hash32 = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
import * as screen from "./creation-screen.js";
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
  for (const d of lay.dots) assert.ok(d.x >= 32 && d.x <= 968 && d.y >= 32 && d.y <= 768, "inside the field");
});

test("a file always lands on the same spot, so new batches never shuffle the field", () => {
  assert.deepEqual(spotOf("a/b.md"), spotOf("a/b.md"));
  assert.notDeepEqual(spotOf("a/b.md"), spotOf("a/c.md"));
  const dna = files(3).map((f) => ({ id: f.path, name: f.path, state: "unprocessed" }));
  const before = fieldLayout(dna.slice(0, 2), { width: 500, height: 500 }).dots;
  const afterMore = fieldLayout(dna, { width: 500, height: 500 }).dots;
  assert.deepEqual(afterMore.slice(0, 2), before);
});

/* ---------- fix 1, 4: no counts, no status words, no emblem ---------- */

test("no count line and no status helpers are left in the screen", () => {
  for (const gone of ["countLine", "dotAt", "dropNote", "HIT"]) assert.equal(screen[gone], undefined, `${gone} is gone`);
});

test("a section says nothing when it has files, only the empty hint when it has none", () => {
  assert.equal(sectionLine([]), EMPTY);
  assert.equal(EMPTY, "nothing yet · drag files here");
  assert.equal(sectionLine([{ state: "processed" }, { state: "unprocessed" }, { state: "removed" }]), "");
  assert.ok(BELT_CAP > 0);
});

/* ---------- every firefly wanders the whole field, slowly, and now and then shines, very dim ---------- */

const AREA = { w: 1060, h: 900, pad: 32 };

test("wander: inside the field, the same for the same file and time, home spot and no glow under reduced motion", () => {
  for (const id of ["a.md", "b/c.md", "x"]) {
    const home = wanderAt(id, 0, AREA, true), s = spotOf(id);
    assert.deepEqual(home, { x: 32 + s.x * 996, y: 32 + s.y * 836, glow: 0 }, "reduced: fieldLayout's home spot");
    for (let t = 0; t < 600000; t += 997) {
      const m = wanderAt(id, t, AREA);
      assert.deepEqual(m, wanderAt(id, t, AREA), "deterministic");
      assert.ok(m.x >= 32 && m.x <= 1028 && m.y >= 32 && m.y <= 868, `inside at t=${t}`);
      assert.ok(m.glow >= 0 && m.glow <= SHINE_MAX, "very dim");
      assert.deepEqual(wanderAt(id, t, AREA, true), home, "reduced: still");
    }
  }
});

test("wander: every fly really roams (never stuck), turns gently, never jitters", () => {
  const ids = Array.from({ length: 300 }, (_, i) => `w/f${i}.md`), dist = [];
  let maxTurn = 0;
  for (const id of ids) {
    const p = wanderParams(id), t0 = (hash32(id) % 100) * 1000;
    let d = 0, prev = wanderAt(id, t0, AREA, false, p), head = null;
    for (let t = t0 + 1000 / 60; t <= t0 + 20000; t += 1000 / 60) {
      const m = wanderAt(id, t, AREA, false, p), step = Math.hypot(m.x - prev.x, m.y - prev.y);
      d += step;
      if (step * 60 > 4) {
        const h = Math.atan2(m.y - prev.y, m.x - prev.x);
        if (head != null) { let dh = Math.abs(h - head); if (dh > Math.PI) dh = 2 * Math.PI - dh; maxTurn = Math.max(maxTurn, dh * 180 / Math.PI); }
        head = h;
      } else head = null;
      prev = m;
    }
    dist.push(d);
  }
  dist.sort((a, b) => a - b);
  assert.ok(dist[0] > 20, `every fly flies over 20 px in 20 s (least ${dist[0].toFixed(1)})`);
  assert.ok(dist[150] > 120, `the median fly flies over 120 px in 20 s (${dist[150].toFixed(0)})`);
  assert.ok(maxTurn <= 3, `heading change per frame ≤ 3° (max ${maxTurn.toFixed(2)}°)`);
});

test("wander: 10,000 flies cost little per frame", () => {
  const ids = Array.from({ length: 10000 }, (_, i) => `big/f${i}.md`), ps = ids.map((id) => wanderParams(id));
  const t = performance.now();
  for (let i = 0; i < ids.length; i++) wanderAt(ids[i], 12345, AREA, false, ps[i]);
  assert.ok(performance.now() - t < 30, "10,000 wanderAt calls well under a frame budget");
});

test("shine is rare: at any moment only a few of 3,000 fireflies glow, never all at once", () => {
  const ids = Array.from({ length: 3000 }, (_, i) => `n/f${i}.md`);
  let max = 0;
  for (const t of [0, 7000, 33000, 120000, 500000]) {
    const g = ids.map((id) => wanderAt(id, t, AREA).glow);
    const on = g.filter((x) => x > 0).length / ids.length;
    assert.ok(on > 0 && on < 0.25, `shining share ${on.toFixed(2)} at t=${t}`);
    max = Math.max(max, ...g);
  }
  assert.ok(max <= SHINE_MAX);
});

/* ---------- fix 5: a loose seeded cluster, not a row ---------- */

test("cluster spots: seeded, inside the box, spread out, never a row", () => {
  const n = 12, box = { w: 316, h: CLUSTER_H };
  const spots = Array.from({ length: n }, (_, i) => clusterSpot(`k/f${i}.md`, i, n, "knowledge", box));
  assert.deepEqual(spots, Array.from({ length: n }, (_, i) => clusterSpot(`k/f${i}.md`, i, n, "knowledge", box)), "same files, same cluster");
  for (const p of spots) assert.ok(p.x >= 0 && p.x <= box.w && p.y >= 0 && p.y <= box.h, "inside the box");
  assert.ok(new Set(spots.map((p) => p.x.toFixed(1))).size === n, "distinct x");
  assert.ok(new Set(spots.map((p) => p.y.toFixed(1))).size > n / 2, "many heights: not a row");
  const ys = spots.map((p) => p.y), spread = Math.max(...ys) - Math.min(...ys);
  assert.ok(spread > CLUSTER_H * 0.3, "it has depth, not a line");
  assert.notDeepEqual(clusterSpot("k/f0.md", 0, n, "system-prompt", box), spots[0], "each section its own cloud");
});

/* ---------- fix 6: a real flight to an ordered spot, and back ---------- */

test("ordered spots go down one under another", () => {
  const ys = [0, 1, 2, 3].map((i) => orderedSpot(i).y);
  assert.deepEqual(ys, [ROW / 2, ROW * 1.5, ROW * 2.5, ROW * 3.5]);
  assert.ok([0, 1, 2].every((i) => orderedSpot(i).x === orderedSpot(i + 1).x), "one column");
});

test("a flight starts and ends where it should and bows off the straight line", () => {
  const from = { x: 200, y: 20 }, to = { x: 7, y: 70 };
  const path = flightPath(from, to);
  assert.equal(path.length, 11);
  assert.deepEqual(path[0], from);
  assert.ok(Math.abs(path.at(-1).x - to.x) < 1e-9 && Math.abs(path.at(-1).y - to.y) < 1e-9);
  // distance of the middle point from the straight line
  const m = path[5], dx = to.x - from.x, dy = to.y - from.y;
  const off = Math.abs(dy * (m.x - from.x) - dx * (m.y - from.y)) / Math.hypot(dx, dy);
  assert.ok(off > 5, "a real arc, not a slide");
  assert.deepEqual(flightPath(from, to), path, "the same every time");
});

/* ---------- fix 7: rename in place ---------- */

test("a rename keeps what was typed, tidied; nothing typed keeps the old name", () => {
  assert.equal(nextName("Old", "  New   name "), "New name");
  assert.equal(nextName("Old", ""), "Old");
  assert.equal(nextName("Old", "   \n "), "Old");
  assert.equal(nextName("Old", null), "Old");
});

test("against the server: a rename is saved and comes back", async () => {
  const { id } = await call("POST", "/api/agents");
  await call("PUT", `/api/agents/${id}/draft`, { name: "Juniper" });
  assert.equal((await call("GET", `/api/agents/${id}`)).draft.name, "Juniper");
});

/* ---------- file states: dim, bright, red ---------- */

test("dim if unprocessed, bright if processed, red if removed but still baked in", () => {
  assert.deepEqual(dotLook("unprocessed"), { color: FLY, alpha: 0.32, halo: false });
  assert.deepEqual(dotLook("processed"), { color: FLY, alpha: 0.9, halo: true });
  assert.deepEqual(dotLook("removed"), { color: RED, alpha: 0.9, halo: true });
  assert.notEqual(RED, FLY);
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
  for (const id of ["flies", "menu", "name", "note", "sheet", "sheet-title", "sheet-name", "sheet-text"]) {
    assert.match(page, new RegExp(`id="${id}"`), `new-agent.html has #${id}`);
  }
  for (const id of ["count", "emblem", "ghost"]) assert.doesNotMatch(page, new RegExp(`id="${id}"`), `#${id} is gone`);
  for (const s of ["system-prompt", "knowledge", "skills"]) assert.match(page, new RegExp(`data-section="${s}"`));
  assert.match(page, /id="name" contenteditable="plaintext-only"/, "the name is edited in place");
  assert.equal((page.match(/class="swarm"/g) || []).length, 2, "System prompt and Knowledge each hold a swarm");
  assert.doesNotMatch(page, /class="rows"|class="dots"/, "no list drop-down, no row of dots");
  assert.doesNotMatch(page, /canvas#flies \{[^}]*pointer-events: auto/, "the field takes no pointer");
  assert.match(page, /prefers-reduced-motion: reduce[\s\S]*animation: none/, "reduced motion stops drift and shine");
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
