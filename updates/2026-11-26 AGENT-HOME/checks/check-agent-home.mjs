// WebKit check of the new home with 0, 1, 10 and 50 agents and long names.
// Setup once (not saved): npm install --no-save playwright-core@1 ; npx playwright-core install webkit
// Run: node "updates/2026-11-26 AGENT-HOME/checks/check-agent-home.mjs"
// Screenshots land in .tmp-test/ (git-ignored).
import { mkdtemp, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { webkit } from "playwright-core";
import { createAgentStore } from "../../../src/creator/agentStore.mjs";
import { createApp } from "../../../src/server/app.mjs";

await mkdir(".tmp-test", { recursive: true });
const engine = { askAgent: async () => ({}), checkCli: async () => ({ ok: true }) };
const results = [];
const ok = (name, pass, extra = "") => results.push(`${pass ? "ok  " : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);

const LONG = {
  40: "Quarterly Revenue Forecasting Assistant",
  80: "The Extremely Thorough Research Companion For Very Long Literature Reviews Ever",
  200: "Name".repeat(40).trim(),
  nospace: "X".repeat(200),
};

async function seed(n) {
  const home = await mkdtemp(join(tmpdir(), "agent-home-check-"));
  let t = Date.parse("2026-11-01T00:00:00Z");
  const store = createAgentStore({ home, now: () => new Date((t += 60_000)) });
  const longs = Object.values(LONG);
  for (let i = 0; i < n; i++) {
    const a = await store.createAgent();
    const name = i < longs.length && n > 1 ? longs[i] : `Agent ${i + 1}${i % 3 === 0 ? " Writer" : " Helper"}`;
    const persona = i % 4 === 3 ? "" : `You are agent number ${i + 1}, a careful helper who writes very long paragraphs about everything it sees. Second sentence.`;
    await store.saveDraft(a.id, { draft: { name, persona, instructions: i % 4 === 3 ? "Answer briefly." : "", status: "draft" } });
  }
  return store;
}

async function layoutCheck(page, label) {
  const m = await page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom }; };
    return {
      sw: document.documentElement.scrollWidth, iw: innerWidth, ih: innerHeight,
      q: r("#q"), plus: r("#plus"), list: r("#list"),
      rows: document.querySelectorAll("#rows .row").length,
      quiet: document.querySelector("#quiet")?.hidden === false ? document.querySelector("#quiet").textContent : "",
      rowOverflow: [...document.querySelectorAll("#rows .row")].some((e) => e.getBoundingClientRect().right > innerWidth || e.scrollWidth > e.clientWidth + 1),
    };
  });
  ok(`${label}: no horizontal overflow`, m.sw <= m.iw, `${m.sw}/${m.iw}`);
  ok(`${label}: search and plus inside viewport`, m.q && m.plus && m.q.l >= 0 && m.plus.r <= m.iw && m.plus.b <= m.ih && m.q.b <= m.ih);
  ok(`${label}: rows stay in their box`, !m.rowOverflow);
  return m;
}

for (const n of [0, 1, 10, 50]) {
  const store = await seed(n);
  const server = createApp(engine, { store }).listen(3506);
  const browser = await webkit.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3506/");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `.tmp-test/home-${n}.png` });
  const m = await layoutCheck(page, `${n} agents`);
  ok(`${n} agents: ${n} rows`, m.rows === n, `${m.rows}`);
  if (n === 0) ok("0 agents: calm empty line", m.quiet.includes("No agents yet"), m.quiet);
  ok(`${n} agents: search focused`, await page.evaluate(() => document.activeElement?.id === "q"));

  if (n === 10) {
    // Letter by letter: count after each key, no Enter.
    const counts = [];
    for (const ch of "writer") { await page.keyboard.type(ch); await page.waitForTimeout(60); counts.push(await page.locator("#rows .row:visible").count()); }
    ok("10 agents: filters on every letter", counts.at(-1) > 0 && counts.at(-1) < 10, counts.join(","));
    await page.screenshot({ path: `.tmp-test/home-10-search.png` });
    await page.fill("#q", "zzqq");
    await page.waitForTimeout(100);
    const quiet = await page.locator("#quiet").textContent();
    ok("10 agents: no-match calm line", (await page.locator("#rows .row:visible").count()) === 0 && quiet.includes("Nothing matches"), quiet);
    await page.screenshot({ path: `.tmp-test/home-10-nomatch.png` });
    await page.fill("#q", "careful helper");
    await page.waitForTimeout(100);
    ok("10 agents: description matches too", (await page.locator("#rows .row:visible").count()) > 0);
    await page.fill("#q", "");
  }

  if (n === 1) {
    const t0 = Date.now();
    await page.click("#plus");
    await page.waitForTimeout(150);
    await page.screenshot({ path: `.tmp-test/plus-mid.png` });
    await page.waitForURL("**/new", { timeout: 3000 });
    const ms = Date.now() - t0;
    ok("plus lands on /new", page.url().endsWith("/new"), `${ms} ms`);
    await page.waitForTimeout(200);
    await page.screenshot({ path: `.tmp-test/new.png` });
    ok("/new is blank", (await page.evaluate(() => document.body.innerText.trim())) === "");
    await page.goBack();
    await page.waitForTimeout(500);
    ok("back from /new shows home again", (await page.locator("#rows .row").count()) === 1);
  }
  ok(`${n} agents: no page errors`, errors.length === 0, errors.join(" | "));
  await browser.close();
  await new Promise((r) => server.close(r));
}

console.log(results.join("\n"));
process.exitCode = results.some((r) => r.startsWith("FAIL")) ? 1 : 0;
