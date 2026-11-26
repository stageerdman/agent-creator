// Jony's WebKit build check of the agent-selection home, against the mock sets (/?demo=0|1|10|50).
// Setup once (not saved): npm install --no-save playwright-core@1 ; npx playwright-core install webkit
// Run with the server up: PORT=3505 node src/server/main.mjs, then
//   node "updates/2026-11-26 AGENT-SELECTION-HOME/checks-jony/check-home.mjs"
import { mkdir } from "node:fs/promises";
import { webkit } from "playwright-core";

const BASE = `http://localhost:${process.env.CHECK_PORT || 3505}`;
const SHOTS = "updates/2026-11-26 AGENT-SELECTION-HOME/checks-jony/shots";
await mkdir(SHOTS, { recursive: true });
const out = [];
const ok = (name, pass, extra = "") => out.push(`${pass ? "ok  " : "FAIL"} ${name}${extra !== "" ? ` (${extra})` : ""}`);
const browser = await webkit.launch({ headless: true });

const measure = (page) => page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest("[hidden]"); };
  const rows = [...document.querySelectorAll("#rows .row")].filter(vis);
  const q = document.querySelector("#q").getBoundingClientRect();
  const plus = document.querySelector("#plus").getBoundingClientRect();
  const list = document.querySelector("#list").getBoundingClientRect();
  const clipped = (e) => e.scrollWidth > e.clientWidth;
  return {
    sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight,
    rows: rows.length,
    sameHeight: rows.every((e) => Math.round(e.getBoundingClientRect().height) === 68),
    inList: rows.every((e) => e.getBoundingClientRect().right <= list.right + 1 && e.getBoundingClientRect().left >= list.left - 1),
    ellipsis: rows.filter((e) => clipped(e.querySelector(".name"))).map((e) => getComputedStyle(e.querySelector(".name")).textOverflow),
    ageVisible: rows.every((e) => { const a = e.querySelector(".age").getBoundingClientRect(); return a.width > 0 && a.right <= list.right; }),
    ages: rows.map((e) => e.querySelector(".age").textContent),
    centred: Math.abs((q.left + q.right) / 2 - innerWidth / 2) <= 1,
    plusRightOfSearch: plus.left >= q.right && plus.right <= innerWidth && Math.abs(plus.top - q.top) <= 1,
    listBelowSearch: list.top >= q.bottom,
    quiet: document.querySelector("#quiet").hidden ? "" : document.querySelector("#quiet").textContent,
    canvasesDrawn: rows.slice(0, 6).every((e) => { const c = e.querySelector("canvas"); const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return true; return false; }),
  };
});

for (const n of [0, 1, 10, 50]) {
  for (const [w, h] of [[1280, 820], [800, 600]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${BASE}/?demo=${n}`); await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SHOTS}/home-${n}-${w}.png` });
    const m = await measure(page);
    const clean = m.sw <= m.iw && m.sh <= m.ih && m.rows === n && m.sameHeight && m.inList && m.ageVisible && m.centred && m.plusRightOfSearch && m.listBelowSearch && !errors.length;
    ok(`${n} agents @${w}×${h}: clean layout`, clean, JSON.stringify({ sw: m.sw, rows: m.rows, sameHeight: m.sameHeight, inList: m.inList, centred: m.centred, plus: m.plusRightOfSearch, errors }));
    if (n) ok(`${n} agents @${w}: long names end in an ellipsis`, m.ellipsis.every((t) => t === "ellipsis"), `${m.ellipsis.length} clipped`);
    if (n) ok(`${n} agents @${w}: constellations drawn`, m.canvasesDrawn);
    if (n === 0) ok(`0 agents @${w}: calm empty line`, m.quiet === "No agents yet", m.quiet);
    if (n === 10 && w === 1280) out.push(`note ages shown: ${m.ages.join(", ")}`);
    await page.close();
  }
}

// Search: live on every letter, calm no-match, clears back to the same order.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
  await page.goto(`${BASE}/?demo=10`); await page.waitForTimeout(800);
  const all = await page.locator("#rows li:not([hidden]) .name").allTextContents();
  const counts = [];
  await page.focus("#q");
  for (const ch of "re") { await page.keyboard.type(ch); counts.push(await page.locator("#rows li:not([hidden])").count()); }
  ok("search narrows on every letter", counts[0] <= 10 && counts[1] <= counts[0], counts.join(","));
  await page.keyboard.type("zzqx");
  const quiet = await page.locator("#quiet").textContent();
  ok("no match: calm line", quiet.startsWith("Nothing matches"), quiet);
  await page.screenshot({ path: `${SHOTS}/home-nomatch.png` });
  await page.fill("#q", "");
  const back = await page.locator("#rows li:not([hidden]) .name").allTextContents();
  ok("clearing restores all, same order", back.join("|") === all.join("|"));
  // row click → a real agent page
  await page.click("#rows .row >> nth=0"); await page.waitForTimeout(500);
  const landed = await page.evaluate(() => ({ path: location.pathname, text: document.body.innerText.slice(0, 120) }));
  ok("row opens a real agent page", landed.path.startsWith("/agents/") && landed.text.trim() && !landed.text.trim().startsWith("{") && !/not found/i.test(landed.text), JSON.stringify(landed));
  await page.screenshot({ path: `${SHOTS}/agent-page.png` });
  await page.close();
}

// Search focus ring: soft on load (autofocus), clear once the user arrives by Tab, soft again after a click.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
  await page.goto(`${BASE}/?demo=10`); await page.waitForTimeout(600);
  const ring = () => page.evaluate(() => ({ active: document.activeElement.id, shadow: getComputedStyle(document.querySelector("#q")).boxShadow }));
  const load = await ring();
  await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab");
  const kbd = await ring();
  await page.mouse.click(640, 10); await page.click("#q");
  const click = await ring();
  ok("search ring: soft on load", load.active === "q" && /inset/.test(load.shadow), load.shadow);
  ok("search ring: clear on Tab arrival", kbd.active === "q" && !/inset/.test(kbd.shadow) && /2px/.test(kbd.shadow), kbd.shadow);
  ok("search ring: soft again after a click", click.active === "q" && /inset/.test(click.shadow), click.shadow);
  await page.close();
}

// Plus: gather plays, a second press is ignored, /new in ~1–1.5 s; with 50 agents.
for (const reducedMotion of ["no-preference", "reduce"]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, reducedMotion });
  await page.goto(`${BASE}/?demo=50`); await page.waitForTimeout(1200);
  const b = await page.locator("#plus").boundingBox();
  const t0 = Date.now();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await page.waitForTimeout(400);
  if (reducedMotion === "no-preference") await page.screenshot({ path: `${SHOTS}/gather-mid.png` });
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);   // second press: must not restart
  await page.waitForURL("**/new", { timeout: 4000 });
  const ms = Date.now() - t0;
  if (reducedMotion === "reduce") ok("reduced motion: short, then /new", ms < 900, `${ms} ms`);
  else ok("plus → /new in about 1–1.5 s, second press ignored", ms >= 900 && ms <= 1800, `${ms} ms`);
  await page.close();
}

await browser.close();
console.log(out.join("\n"));
process.exitCode = out.some((r) => r.startsWith("FAIL")) ? 1 : 0;
