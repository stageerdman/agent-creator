// The mock routes serve the full demo set, read-only, and the demo data keeps
// the hard rule: every source passage contains the words it backs.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "./app.mjs";
import { createAgentStore } from "../creator/index.mjs";
import { demo, demoAgents, scripts } from "./mock/demoAgents.mjs";

let server, base, home;

before(async () => {
  home = await mkdtemp(join(tmpdir(), "ac-mock-"));
  const engine = { checkCli: async () => ({ installed: true }) };
  server = createApp(engine, { store: createAgentStore({ home }) });
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(home, { recursive: true, force: true });
});

const get = async (path) => {
  const res = await fetch(base + path);
  return { status: res.status, type: res.headers.get("content-type"), body: res.headers.get("content-type")?.includes("json") ? await res.json() : await res.text() };
};

test("GET /mock/agents returns the six demo agents", async () => {
  const { status, body } = await get("/mock/agents");
  assert.equal(status, 200);
  assert.deepEqual(body.map((a) => a.id), ["rex", "marcus", "edie", "ines", "untitled", "juno"]);
});

test("the demo set covers every state", () => {
  const by = Object.fromEntries(demoAgents.map((a) => [a.id, a]));
  assert.ok(by.rex.keptAt && by.rex.talks.length === 14 && by.rex.references.total === 186); // rich
  assert.ok(by.marcus.keptAt && by.marcus.references.total === 0); // one line
  assert.ok(by.edie.references.files.some((f) => f.ease === "hard")); // weak material
  assert.equal(by.ines.study.state, "studying"); // still learning
  assert.ok(by.ines.study.resumed);
  assert.equal(by.untitled.keptAt, null); // unfinished sketch
  assert.equal(by.untitled.draft.name, "");
  assert.equal(by.juno.importedFrom, "Juno.agent.zip"); // imported
  assert.equal(by.juno.openedAt, null);
});

test("GET /mock/agents/:id returns one agent, 404 otherwise", async () => {
  assert.equal((await get("/mock/agents/rex")).body.draft.name, "Rex Hart");
  assert.equal((await get("/mock/agents/nobody")).status, 404);
});

test("GET /mock/imports lists the three demo files and serves each", async () => {
  const { body } = await get("/mock/imports");
  assert.deepEqual(body, ["Juno.agent.zip", "Marcus.agent.zip", "Old coach.agent.zip"]);
  assert.equal((await get(`/mock/imports/${encodeURIComponent("Old coach.agent.zip")}`)).body.valid, false);
  assert.equal((await get("/mock/imports/Juno.agent.zip")).body.name, "Juno");
});

test("GET /mock/faces serves an SVG and refuses odd names", async () => {
  const face = await get("/mock/faces/rex-portrait.svg");
  assert.equal(face.status, 200);
  assert.match(face.type, /svg/);
  assert.match(face.body, /^<svg/);
  assert.equal((await get("/mock/faces/..%2Fapp.mjs")).status, 404);
});

test("mock routes are read-only", async () => {
  const res = await fetch(`${base}/mock/agents`, { method: "POST" });
  assert.equal(res.status, 404);
});

// Every SourceRef anywhere in the demo, with where it was found.
function allRefs(value, path = "demo", out = []) {
  if (Array.isArray(value)) value.forEach((v, i) => allRefs(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") {
    if (typeof value.passage === "string" && Array.isArray(value.span)) out.push({ path, ref: value });
    for (const [k, v] of Object.entries(value)) allRefs(v, `${path}.${k}`, out);
  }
  return out;
}

test("hard rule: every passage contains its words and the span covers them", () => {
  const refs = allRefs(demo);
  assert.ok(refs.length > 30);
  for (const { path, ref } of refs) {
    const [start, end] = ref.span;
    assert.equal(ref.passage.slice(start, end), ref.words, path);
  }
});

test("hard rule: Sharp lines have a sourced answer, Blank lines an honest one", () => {
  for (const a of demoAgents) {
    const answers = [...a.talks.flatMap((t) => t.messages), ...(scripts[a.id] ?? []).map((s) => s.reply)];
    for (const l of a.map) {
      if (l.level === "sharp") assert.ok(l.refs.length > 0, `${a.id}/${l.id} has refs`);
      if (l.level === "blank") {
        assert.equal(l.refs.length, 0, `${a.id}/${l.id} has no refs`);
        assert.ok(answers.some((m) => m.blankLineId === l.id) || a.id === "rex" || a.id === "edie" || a.id === "juno", `${a.id}/${l.id}`);
      }
    }
    const sharpRefs = a.map.filter((l) => l.level === "sharp").flatMap((l) => l.refs.map((r) => r.fileId));
    if (sharpRefs.length) assert.ok(answers.some((m) => m.sources?.some((s) => sharpRefs.includes(s.fileId))), `${a.id} has a sourced answer`);
  }
  for (const id of ["rex-health", "edie-fiction", "juno-tax"]) {
    assert.ok(Object.values(scripts).flat().some((s) => s.reply?.blankLineId === id) || demoAgents.some((a) => a.talks.some((t) => t.messages.some((m) => m.blankLineId === id))), id);
  }
});

test("the map never lives inside the draft", () => {
  for (const a of demoAgents) {
    assert.deepEqual(Object.keys(a.draft).sort(), ["instructions", "name", "persona", "status"]);
    const text = JSON.stringify(a.draft);
    for (const l of a.map) assert.ok(!text.includes(`"${l.id}"`), `${a.id} draft has no map ids`);
  }
});
