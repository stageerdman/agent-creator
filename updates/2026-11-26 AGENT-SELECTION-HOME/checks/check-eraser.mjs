// Eraser's WebKit sign-off check of the agent-selection home (00-roadmap.md, Phases 1–4).
// Setup once (not saved): npm install --no-save playwright-core@1 ; npx playwright-core install webkit
// Run with the server up (PORT=3505 npm start), then:
//   node "updates/2026-11-26 AGENT-SELECTION-HOME/checks/check-eraser.mjs"
// Exit code 1 if any check fails. Screenshots go to checks/shots/ (git-ignored).
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { webkit } from "playwright-core";
import { ageLabel, sortAgents } from "../../../src/server/public/agent-list.js";

const BASE = `http://localhost:${process.env.CHECK_PORT || 3505}`;
const SHOTS = fileURLToPath(new URL("./shots/", import.meta.url));
await mkdir(SHOTS, { recursive: true });
const out = [];
const ok = (name, pass, extra = "") => out.push(`${pass ? "ok  " : "FAIL"} ${name}${extra !== "" ? ` (${extra})` : ""}`);
const browser = await webkit.launch({ headless: true });

// Long names from the roadmap: 40, 80, 200 characters, with and without spaces.
const words = (n) => ("Annabel Quinterra Montgomery Fairweather ".repeat(10)).slice(0, n).trim().padEnd(n, "x");
const solid = (n) => "W".repeat(n);
const LONG = [40, 80, 200].flatMap((n) => [words(n), solid(n)]);
const withLong = (list) => [...list, ...LONG.map((name, i) => ({
  id: `long-${i}`, draft: { name, status: "saved", description: `Long name test ${name.length}` },
  createdAt: new Date(Date.now() - (i + 1) * 3600e3 * 24 * 200).toISOString(), updatedAt: new Date().toISOString(),
}))];

async function open(n, { w = 1280, h = 820, long = false, reducedMotion = "no-preference" } = {}) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion });
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  let api = null;
  await page.route(`**/mock/home/${n}`, async (route) => {
    const res = await route.fetch(); let list = await res.json();
    if (long) list = withLong(list);
    api = list; await route.fulfill({ response: res, json: list });
  });
  await page.goto(`${BASE}/?demo=${n}`); await page.waitForTimeout(900);
  return { page, errors, api: () => api };
}

const measure = (page) => page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest("[hidden]"); };
  const rows = [...document.querySelectorAll("#rows .row")].filter(vis);
  const list = document.querySelector("#list").getBoundingClientRect();
  const q = document.querySelector("#q").getBoundingClientRect();
  const plus = document.querySelector("#plus").getBoundingClientRect();
  // Everything a person can act on, outside the rows: must be exactly the search and the plus.
  const controls = [...document.querySelectorAll("a, button, input, select, textarea, [role=button], [tabindex]")]
    .filter((e) => vis(e) && !e.closest("#rows")).map((e) => e.id || e.tagName);
  // Visible text outside rows and the quiet line: must be none (no header, footer, count, tips).
  const stray = [...document.body.querySelectorAll("*")].filter((e) => vis(e) && !e.closest("#rows, #quiet, script, style")
    && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())).map((e) => e.textContent.trim().slice(0, 30));
  return {
    sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight,
    listSw: document.querySelector("#list").scrollWidth, listCw: document.querySelector("#list").clientWidth,
    controls, stray,
    rows: rows.map((e) => {
      const n = e.querySelector(".name"), d = e.querySelector(".desc"), a = e.querySelector(".age"), c = e.querySelector("canvas");
      const nr = n.getBoundingClientRect(), ar = a.getBoundingClientRect(), cr = c.getBoundingClientRect();
      return { href: e.getAttribute("href"), name: n.textContent, title: n.title, desc: d ? d.textContent : "", age: a.textContent, ageTitle: a.title,
        oneLine: nr.height < 30, clipped: n.scrollWidth > n.clientWidth, overflow: getComputedStyle(n).textOverflow,
        h: Math.round(e.getBoundingClientRect().height), canvasW: Math.round(cr.width), ageInside: ar.right <= list.right && ar.width > 0,
        nameBeforeAge: nr.right <= ar.left + 1 };
    }),
    centred: Math.abs((q.left + q.right) / 2 - innerWidth / 2) <= 1,
    plusBox: [plus.x, plus.y, plus.width, plus.height].map(Math.round), qBox: [q.x, q.y, q.width, q.height].map(Math.round),
    quiet: document.querySelector("#quiet").hidden ? "" : document.querySelector("#quiet").textContent,
  };
});
const pixels = (page, i) => page.evaluate((i) => {
  const c = document.querySelectorAll("#rows .row canvas")[i]; const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let s = 0; for (let k = 3; k < d.length; k += 4) s += d[k]; return s;
}, i);

// ---------- Phase 1: rows, ages, order, long names, clutter — 0/1/10/50 at two sizes ----------
for (const n of [0, 1, 10, 50]) {
  for (const [w, h] of [[1280, 820], [800, 600]]) {
    const tag = `${n} agents @${w}×${h}`;
    const { page, errors, api } = await open(n, { w, h, long: n === 50 });
    await page.screenshot({ path: `${SHOTS}home-${n}-${w}.png` });
    const m = await measure(page);
    const expect = sortAgents(api());
    ok(`${tag}: only search + plus on screen`, m.controls.join(",") === "q,plus" && !m.stray.length, `${m.controls} | ${m.stray}`);
    ok(`${tag}: no page or list sideways scroll`, m.sw <= m.iw && m.sh <= m.ih && m.listSw <= m.listCw, `${m.sw}/${m.iw} list ${m.listSw}/${m.listCw}`);
    ok(`${tag}: search centred`, m.centred);
    ok(`${tag}: no page errors`, !errors.length, errors.join("; "));
    ok(`${tag}: one row per agent`, m.rows.length === expect.length, `${m.rows.length}/${expect.length}`);
    if (n === 0) ok(`${tag}: calm empty line`, m.quiet === "No agents yet", m.quiet);
    if (!n) { await page.close(); continue; }
    const now = Date.now();
    ok(`${tag}: newest first, ties by id`, m.rows.map((r) => r.href.split("?")[0]).join() === expect.map((a) => `/agents/${a.id}`).join());
    const badAge = m.rows.filter((r, i) => r.age !== ageLabel(expect[i].createdAt || expect[i].updatedAt, now) || !r.ageTitle);
    ok(`${tag}: every age correct, with full date tooltip`, !badAge.length, badAge.map((r) => `${r.name.slice(0, 12)}=${r.age}`).join(", "));
    const badDesc = m.rows.filter((r, i) => r.desc !== (expect[i].draft.description || "").trim() || /undefined|null/.test(r.desc));
    ok(`${tag}: name + description (or none) on every row`, !badDesc.length && m.rows.every((r) => r.name && r.title === r.name), badDesc.map((r) => r.name).join());
    ok(`${tag}: constellation canvas on every row`, m.rows.every((r) => r.canvasW === 56));
    const badLayout = m.rows.filter((r) => !r.oneLine || r.h !== 68 || !r.ageInside || !r.nameBeforeAge || (r.clipped && r.overflow !== "ellipsis"));
    ok(`${tag}: long names one line with …, age never pushed`, !badLayout.length, badLayout.map((r) => r.name.length).join());
    if (n === 50) ok(`${tag}: all 40/80/200 long names present and clipped`, LONG.every((name) => m.rows.some((r) => r.name === name && (name.length < 60 || r.clipped))));
    if (n === 10 && w === 1280) out.push(`note ages: ${m.rows.map((r) => r.age).join(", ")}`);
    // Learning rows animate; calm rows keep a slow beat. Compare frames of the first learning row.
    const li = expect.findIndex((a) => a.draft.status === "learning");
    if (li >= 0 && li < 6 && w === 1280) {
      const samples = []; for (let k = 0; k < 5; k++) { samples.push(await pixels(page, li)); await page.waitForTimeout(250); }
      ok(`${tag}: learning row animates`, new Set(samples).size >= 3, samples.join(","));
    }
    await page.close();
  }
}

// ---------- Phase 1: nothing moves after it appears ----------
{
  const { page } = await open(50);
  const a = await page.evaluate(() => [...document.querySelectorAll("#rows .row")].slice(0, 8).map((e) => e.getBoundingClientRect().top));
  await page.waitForTimeout(1200);
  const b = await page.evaluate(() => [...document.querySelectorAll("#rows .row")].slice(0, 8).map((e) => e.getBoundingClientRect().top));
  ok("rows do not move after they appear", a.join() === b.join());
  await page.close();
}

// ---------- Phase 2: live search ----------
for (const n of [10, 50]) {
  const { page } = await open(n);
  const before = await measure(page);
  const all = before.rows.map((r) => r.href);
  const counts = [], times = [];
  for (const ch of "mar") {
    const ms = await page.evaluate((ch) => new Promise((res) => {
      const q = document.querySelector("#q"), t0 = performance.now();
      q.value += ch; q.dispatchEvent(new Event("input", { bubbles: true })); res(performance.now() - t0);
    }), ch);
    times.push(ms); counts.push((await measure(page)).rows.length);
  }
  ok(`${n} agents: search live on every letter (m→ma→mar)`, counts[0] >= counts[1] && counts[1] >= counts[2] && counts[0] < all.length, counts.join(","));
  ok(`${n} agents: keypress → list under 50 ms`, Math.max(...times) < 50, times.map((t) => t.toFixed(1)).join(","));
  await page.fill("#q", "");
  await page.keyboard.type("founders");     // a word only in a description
  const desc = await measure(page);
  ok(`${n} agents: description word matches`, desc.rows.length >= 1 && desc.rows.every((r) => /founders/i.test(r.desc) || /founders/i.test(r.name)), String(desc.rows.length));
  await page.fill("#q", ""); await page.keyboard.type("rxe zq");
  const none = await measure(page);
  ok(`${n} agents: no match is calm and repeats the text`, none.rows.length === 0 && none.quiet.includes("rxe zq") && none.quiet !== "No agents yet", none.quiet);
  ok(`${n} agents: search and plus did not move`, none.qBox.join() === before.qBox.join() && none.plusBox.join() === before.plusBox.join());
  if (n === 50) await page.screenshot({ path: `${SHOTS}nomatch.png` });
  for (let k = 0; k < 6; k++) await page.keyboard.press("Backspace");
  const back = await measure(page);
  ok(`${n} agents: Backspace to empty → full list, same order`, back.rows.map((r) => r.href).join() === all.join() && !back.quiet);
  await page.close();
}
{
  const { page } = await open(0);
  await page.keyboard.type("x");
  const m = await measure(page);
  ok("0 agents: typing shows the no-match line, never an error", m.quiet.startsWith("Nothing matches"), m.quiet);
  ok("search has a live-region status for screen readers", await page.evaluate(() => document.querySelector("#quiet").getAttribute("aria-live") === "polite"));
  await page.close();
}

// ---------- Phase 1: row click → a real agent page ----------
for (const n of [1, 10, 50]) {
  const { page } = await open(n);
  await page.click("#rows .row >> nth=0"); await page.waitForTimeout(500);
  const p = await page.evaluate(() => ({ path: location.pathname, text: document.body.innerText.trim(), bg: getComputedStyle(document.documentElement).backgroundColor }));
  ok(`${n} agents: row opens a real agent page on the Fireflies field`, p.path.startsWith("/agents/") && p.text && !p.text.startsWith("{") && !/isn’t here|Couldn’t/.test(p.text) && p.bg === "rgb(11, 20, 16)", JSON.stringify(p).slice(0, 120));
  if (n === 10) await page.screenshot({ path: `${SHOTS}agent-page.png` });
  await page.close();
}

// ---------- Phase 3: plus → fireflies → /new ----------
for (const n of [0, 1, 10, 50]) {
  const { page } = await open(n);
  await page.waitForTimeout(300);
  const b = await page.locator("#plus").boundingBox();
  await page.evaluate(() => {
    window.__frames = []; let last = performance.now();
    const tick = (t) => { window.__frames.push(t - last); last = t; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    window.__t0 = 0; document.querySelector("#plus").addEventListener("click", () => { window.__t0 = performance.now(); }, { capture: true, once: true });
    addEventListener("pagehide", () => { localStorage.setItem("eraser", JSON.stringify({ ms: performance.now() - window.__t0,
      frames: window.__frames.slice(2), canvases: window.__maxCanvases })); });
    window.__maxCanvases = 0; setInterval(() => { window.__maxCanvases = Math.max(window.__maxCanvases, document.querySelectorAll("body > canvas").length); }, 30);
  });
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await page.waitForTimeout(450);
  if (n === 50) await page.screenshot({ path: `${SHOTS}gather-mid.png` });
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);   // second press: ignored
  await page.waitForURL("**/new", { timeout: 4000 });
  const r = JSON.parse(await page.evaluate(() => localStorage.getItem("eraser")));
  const long = r.frames.filter((f) => f > 50).length;
  ok(`${n} agents: plus → /new in 1.0–1.5 s`, r.ms >= 1000 && r.ms <= 1500, `${Math.round(r.ms)} ms`);
  ok(`${n} agents: second press adds no second canvas`, r.canvases <= 1, String(r.canvases));
  ok(`${n} agents: smooth gather (no frames over 50 ms)`, long === 0, `max ${Math.round(Math.max(...r.frames))} ms over ${r.frames.length} frames`);
  const bg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
  ok(`${n} agents: /new opens on the Fireflies field (no white)`, bg === "rgb(11, 20, 16)", bg);
  if (n === 10) {
    await page.goBack(); await page.waitForTimeout(500);
    const back = await page.evaluate(() => ({ path: location.pathname, op: getComputedStyle(document.querySelector("#root")).opacity, rows: document.querySelectorAll("#rows .row").length }));
    ok("Back from /new restores the home at full opacity", back.path === "/" && back.op === "1" && back.rows === 10, JSON.stringify(back));
  }
  await page.close();
}
{
  const { page } = await open(50, { reducedMotion: "reduce" });
  const b = await page.locator("#plus").boundingBox();
  const t0 = Date.now(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await page.waitForURL("**/new", { timeout: 3000 });
  const ms = Date.now() - t0;
  ok("reduced motion: short fade, then /new (≤ 300 ms fade + load)", ms <= 450, `${ms} ms click→/new incl. page load`);
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
  await page.goto(`${BASE}/`); await page.waitForTimeout(600);
  const m = await measure(page);
  ok("GET / (real API) serves the new home", m.controls.join(",") === "q,plus", m.controls.join());
  await page.close();
}

await browser.close();
console.log(out.join("\n"));
const fails = out.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${out.filter((r) => r.startsWith("ok")).length} ok, ${fails} failed`);
process.exitCode = fails ? 1 : 0;
