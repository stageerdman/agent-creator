import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { askAgent, checkCli } from "../engine/index.mjs";
import { fakeSpawn } from "../engine/testing/fakeSpawn.mjs";
import { createApp } from "./app.mjs";
import { parseSse } from "./testing/sse.mjs";

// The real engine, with the CLI swapped for the fake per scenario.
let scenario = "stream-ok";
const engine = {
  askAgent: (input, options) => askAgent(input, { ...options, spawn: fakeSpawn(scenario) }),
  checkCli: () => checkCli({ binary: "claude", spawn: fakeSpawn("version") }),
};
const server = createApp(engine).listen(0);
const base = `http://localhost:${server.address().port}`;
after(() => server.close());

const post = (body) =>
  fetch(`${base}/api/ask`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

test("POST /api/ask streams deltas then done with the session id", async () => {
  scenario = "stream-ok";
  const response = await post({ message: "hi" });
  assert.equal(response.headers.get("content-type"), "text/event-stream");
  const events = parseSse(await response.text());
  assert.deepEqual(events.map((e) => e.event), ["delta", "delta", "done"]);
  assert.equal(events.map((e) => e.data.text).slice(0, 2).join(""), "Echo: hi");
  assert.deepEqual(events[2].data, { text: "Echo: hi", sessionId: "sess-1", contextTokens: 15, contextWindow: 200000 });
});

test("POST /api/ask turns a CLI failure into an error event with its kind", async () => {
  scenario = "stream-fail";
  const events = parseSse(await (await post({ message: "hi" })).text());
  assert.equal(events.length, 1);
  assert.equal(events[0].event, "error");
  assert.equal(events[0].data.kind, "failed");
  assert.equal(events[0].data.message, "Not logged in");
});

test("POST /api/ask rejects an empty message with 400", async () => {
  const response = await post({ message: "  " });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /message/);
});

test("GET /api/health reports the CLI", async () => {
  const health = await (await fetch(`${base}/api/health`)).json();
  assert.deepEqual(health, { installed: true, binary: "claude", version: "9.9.9 (Claude Code)" });
});

test("GET / serves the page", async () => {
  const response = await fetch(`${base}/`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Agent Creator<\/title>/);
  assert.match(html, /href="\/new"/);
});

test("GET /new serves the blank new-agent page", async () => {
  const response = await fetch(`${base}/new`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(await response.text(), /New agent · Agent Creator/);
});

test("GET /agents/:id serves a page, not raw JSON", async () => {
  const response = await fetch(`${base}/agents/some-agent`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  const html = await response.text();
  assert.match(html, /Agent · Agent Creator/);
});

const SCREENS = ["/", "/agents/some-agent", "/new"];

// LAUNCH-GLASS: one background, defined once, linked first by every screen. No page sets its own
// html/body background or a glass override, so the first frame is the final one. The Mac window
// paints the same colour natively (src-tauri/src/main.rs, background_color 11,20,16).
test("every screen uses the one shared background token, and nothing else sets it", async () => {
  const css = await (await fetch(`${base}/app-background.css`)).text();
  assert.match(css, /:root \{ --field: #0B1410; \}/);
  assert.match(css, /html \{ background: var\(--field\); \}/);
  for (const path of SCREENS) {
    const html = await (await fetch(`${base}${path}`)).text();
    const head = html.slice(0, html.indexOf("<style>"));
    assert.match(head, /<link rel="stylesheet" href="\/app-background\.css">/, `${path} links it before its own styles`);
    assert.doesNotMatch(html, /^\s*(html|body|html, body)\s*\{[^}]*background/m, `${path} sets no html/body background`);
    assert.doesNotMatch(html, /--field:|--shadow:|html\.glass|classList\.(add|toggle)\(['"]glass/, `${path} has no own field or glass switch`);
  }
});

// The one glass in the app is the floating Sketcher chat: low fill, strong blur.
test("only the Sketcher chat uses backdrop-filter, and it is clearly see-through", async () => {
  const pages = await Promise.all(SCREENS.map(async (p) => (await fetch(`${base}${p}`)).text()));
  const blurs = pages.join("\n").split("\n").filter(l => /backdrop-filter:/.test(l) && !/^\s*@supports/.test(l));
  assert.ok(blurs.length > 0 && blurs.every(l => /^\s*#sketcher \{/.test(l)), "backdrop-filter only on #sketcher");
  const m = pages[2].match(/#sketcher \{ background: rgba\(12,14,10,\.(\d+)\); backdrop-filter: blur\((\d+)px\)/);
  assert.ok(m, "the chat's glass rule");
  assert.ok(Number(`.${m[1]}`) <= 0.2, `chat fill ${m[1]} is low`);
  assert.ok(Number(m[2]) >= 24, `blur ${m[2]}px is strong enough to soften a lit dot`);
});

test("GET serves the screens' scripts", async () => {
  for (const [path, type] of [["/agent-list.js", "javascript"], ["/firefly-gather.js", "javascript"], ["/firefly-orbit.js", "javascript"],["/fireflies-dna.js", "javascript"], ["/left-side.js", "javascript"]]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), new RegExp(type), path);
  }
});

// Regression: a module was imported but not routed, so the page booted blank.
test("GET serves every script the pages import", async () => {
  const dir = new URL("./public/", import.meta.url);
  const sources = await Promise.all((await readdir(dir))
    .filter((f) => /\.(js|html)$/.test(f) && !f.includes(".test."))
    .map((f) => readFile(new URL(f, dir), "utf8")));
  const imported = new Set(sources.flatMap((src) => [...src.matchAll(/from\s+["']\.?(\/[\w-]+\.js)["']/g)].map((m) => m[1])));
  assert.ok(imported.size > 0);
  for (const path of imported) {
    assert.equal((await fetch(`${base}${path}`)).status, 200, path);
  }
});
