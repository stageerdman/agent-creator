// Eraser's WebKit check of the new home: clutter count, Merlin's edge rules,
// filtering on every letter, row click, and the original page untouched.
// Setup once (not saved): npm install --no-save playwright-core@1 ; npx playwright-core install webkit
// Run: node "updates/2026-11-26 AGENT-HOME/checks/check-eraser.mjs"
import { mkdtemp, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { webkit } from "playwright-core";
import { createAgentStore } from "../../../src/creator/agentStore.mjs";
import { createApp } from "../../../src/server/app.mjs";

await mkdir(".tmp-test", { recursive: true });
const engine = { askAgent: async () => ({}), checkCli: async () => ({ ok: true }) };
const out = [];
const ok = (name, pass, extra = "") => out.push(`${pass ? "ok  " : "FAIL"} ${name}${extra !== "" ? ` (${extra})` : ""}`);
const PORT = 3507, URL0 = `http://localhost:${PORT}`;

async function seed(n, names = []) {
  const home = await mkdtemp(join(tmpdir(), "eraser-check-"));
  let t = Date.parse("2026-11-01T00:00:00Z");
  const store = createAgentStore({ home, now: () => new Date((t += 60_000)) });
  for (let i = 0; i < n; i++) {
    const a = await store.createAgent();
    await store.saveDraft(a.id, { draft: { name: names[i] ?? `Agent ${i + 1}`, persona: `Helps with task ${i + 1}. More.`, status: "draft" } });
  }
  return store;
}
async function withServer(store, fn) {
  const server = createApp(engine, { store }).listen(PORT);
  const browser = await webkit.launch({ headless: true });
  try { await fn(browser); } finally { await browser.close(); await new Promise((r) => server.close(r)); }
}

// 1 + 2: what is on the home, and nothing else.
await withServer(await seed(3, ["Maya", "Marcus", "Iris"]), async (browser) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
  await page.goto(URL0 + "/"); await page.waitForTimeout(800);
  const inv = await page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
    const controls = [...document.querySelectorAll("a, button, input, select, textarea, [role=button], [tabindex]")].filter(vis)
      .map((e) => e.id || e.className || e.tagName);
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6,header,footer")].filter(vis).length;
    const order = [...document.querySelectorAll("#rows .row .name")].map((e) => e.textContent);
    const texts = [...document.querySelectorAll("body *")].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
      .filter((e) => !e.closest("#rows")).map((e) => e.textContent.trim());
    return { controls, headings, order, texts, placeholder: document.querySelector("#q").placeholder };
  });
  ok("only rows + search + plus are controls", inv.controls.filter((c) => c !== "row").join(",") === "q,plus", inv.controls.join(","));
  ok("no headers or footers", inv.headings === 0, inv.headings);
  ok("no visible text outside the rows", inv.texts.length === 0, JSON.stringify(inv.texts));
  ok("newest first", inv.order.join(",") === "Iris,Marcus,Maya", inv.order.join(","));
  // search: every letter, and clearing brings all back in order
  const counts = [];
  for (const ch of "mar") { await page.keyboard.type(ch); counts.push(await page.locator("#rows .row").count()); }
  ok("filters on every letter (m, ma, mar)", counts.join(",") === "2,2,1", counts.join(","));
  await page.keyboard.type("x"); ok("no match: calm line", (await page.locator("#quiet").textContent()).startsWith("Nothing matches"));
  for (let i = 0; i < 4; i++) await page.keyboard.press("Backspace");
  ok("clearing restores all, same order", (await page.locator("#rows .row .name").allTextContents()).join(",") === "Iris,Marcus,Maya");
  // filtering has no motion
  ok("filtering adds no animations", (await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)) === 0);
  await page.keyboard.type("MAYA"); ok("case-insensitive", (await page.locator("#rows .row").count()) === 1);
  await page.fill("#q", "");
  await page.screenshot({ path: ".tmp-test/eraser-home-3.png" });
  // the WebKit search field's own clear (x): a second way to clear?
  const cancel = await page.evaluate(() => { const q = document.querySelector("#q"); q.value = "ma"; return getComputedStyle(q, "::-webkit-search-cancel-button").display; });
  out.push(`note WebKit's own clear-x in the search field: ${cancel === "none" ? "hidden" : "shown"} (kept: platform default, one tap to clear)`);
  await page.fill("#q", "");

  // row click: where does it go?
  await page.click("#rows .row >> nth=0");
  await page.waitForTimeout(300);
  const landed = await page.evaluate(() => ({ url: location.pathname, text: document.body.innerText.slice(0, 80), bg: getComputedStyle(document.documentElement).backgroundColor }));
  ok("row click opens a real page", !landed.text.includes("Not found"), `${landed.url} → ${JSON.stringify(landed.text)} bg ${landed.bg}`);
  await page.goBack(); await page.waitForTimeout(300);

  // 4: plus motion and edge rules
  const t0 = Date.now(); await page.click("#plus");
  await page.waitForTimeout(200);
  const mid = await page.evaluate(() => ({ calling: document.body.classList.contains("calling"), canvas: +getComputedStyle(document.querySelector("#field")).opacity, list: +getComputedStyle(document.querySelector("#list")).opacity }));
  ok("mid-call: plus lit, glade dimming, list fading", mid.calling && mid.canvas < 1 && mid.list < 1, JSON.stringify(mid));
  await page.waitForURL("**/new"); const ms = Date.now() - t0;
  ok("plus → /new within ~500 ms + load", ms < 800, `${ms} ms`);
  const nw = await page.evaluate(() => ({ text: document.body.innerText.trim(), html: getComputedStyle(document.documentElement).backgroundColor, controls: document.querySelectorAll("a,button,input").length }));
  ok("/new blank, dark html bg (no white flash)", nw.text === "" && nw.controls === 0 && nw.html === "rgb(11, 20, 16)", JSON.stringify(nw));
  await page.waitForTimeout(300); await page.screenshot({ path: ".tmp-test/eraser-new.png" });
  await page.goBack(); await page.waitForTimeout(400);
  const back = await page.evaluate(() => ({ cls: document.body.className, list: +getComputedStyle(document.querySelector("#list")).opacity, plus: +getComputedStyle(document.querySelector("#plus")).opacity, canvas: +getComputedStyle(document.querySelector("#field")).opacity, rows: document.querySelectorAll("#rows .row").length }));
  ok("Back restores the home exactly", back.cls === "" && back.list === 1 && back.plus === 1 && back.canvas === 1 && back.rows === 3, JSON.stringify(back));

  // second press skips
  // a real second mouse press at the plus (not a scripted .click(), which would bypass hit-testing)
  const pb = await page.locator("#plus").boundingBox();
  const t1 = Date.now(); await page.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2); await page.waitForTimeout(30); await page.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2);
  await page.waitForURL("**/new"); ok("second press skips", Date.now() - t1 < 400, `${Date.now() - t1} ms`);
  await page.goBack(); await page.waitForTimeout(300);
  // Esc skips
  const t2 = Date.now(); await page.click("#plus"); await page.waitForTimeout(30); await page.keyboard.press("Escape");
  await page.waitForURL("**/new"); ok("Esc skips", Date.now() - t2 < 400, `${Date.now() - t2} ms`);
  await page.goBack(); await page.waitForTimeout(300);
  // keyboard Enter on the plus plays the same motion
  await page.focus("#plus"); await page.keyboard.press("Enter"); await page.waitForTimeout(100);
  ok("Enter on plus plays the call", await page.evaluate(() => document.body.classList.contains("calling")));
  await page.waitForURL("**/new"); await page.goBack(); await page.waitForTimeout(300);
  // modifier click: no motion
  const ctx = page.context();
  const [tab] = await Promise.all([ctx.waitForEvent("page", { timeout: 2000 }).catch(() => null), page.click("#plus", { modifiers: ["Meta"] })]);
  await page.waitForTimeout(100);
  ok("⌘-click: no motion on the home", !(await page.evaluate(() => document.body.classList.contains("calling"))) && page.url().endsWith("/"), tab ? "new tab opened" : "no new tab in headless");
  if (tab) await tab.close();
});

// reduced motion: instant, no light, no flag
await withServer(await seed(1), async (browser) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, reducedMotion: "reduce" });
  await page.goto(URL0 + "/"); await page.waitForTimeout(400);
  const t0 = Date.now(); await page.click("#plus"); await page.waitForURL("**/new");
  const flag = await page.evaluate(() => sessionStorage.getItem("glade.call"));
  ok("reduced motion: instant, no call flag", Date.now() - t0 < 300 && flag === null, `${Date.now() - t0} ms, flag ${flag}`);
});

// 5: 0 and 50 agents, very long names, small window
const long = ["X".repeat(200), "Name ".repeat(40).trim(), "The Extremely Thorough Research Companion For Very Long Literature Reviews Ever"];
for (const [n, w, h] of [[0, 1280, 820], [50, 1280, 820], [50, 800, 600]]) {
  await withServer(await seed(n, n ? long : []), async (browser) => {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(URL0 + "/"); await page.waitForTimeout(1200);
    await page.screenshot({ path: `.tmp-test/eraser-${n}-${w}.png` });
    const m = await page.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const rows = [...document.querySelectorAll("#rows .row")];
      return { sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, rows: rows.length,
        oneLine: rows.every((e) => e.getBoundingClientRect().height <= 52), inCol: rows.every((e) => e.getBoundingClientRect().right <= r("#list").right + 1),
        listAbove: r("#list").bottom <= r("#q").top, plusIn: r("#plus").right <= innerWidth && r("#plus").bottom <= innerHeight,
        quiet: document.querySelector("#quiet").hidden ? "" : document.querySelector("#quiet").textContent };
    });
    ok(`${n} agents @${w}×${h}: clean`, m.sw <= w && m.sh <= h && m.rows === n && m.oneLine && m.inCol && m.listAbove && m.plusIn && !errors.length, JSON.stringify({ ...m, errors }));
  });
}

console.log(out.join("\n"));
process.exitCode = out.some((r) => r.startsWith("FAIL")) ? 1 : 0;
