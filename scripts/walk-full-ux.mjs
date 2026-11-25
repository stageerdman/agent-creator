// Headless click-through of blocks A–F (33 steps), in short segments, each in
// a fresh browser. Screenshots land in .scratch/ (git-ignored).
// Setup once (not saved to package.json):
//   npm install --no-save playwright-core@1
//   npx playwright-core install chromium-headless-shell
// (The studio sandbox stops the system Google Chrome after ~20 s; the
// headless shell is not affected.)
// Run: PORT=3506 node src/server/main.mjs, then
//   node scripts/walk-full-ux.mjs [url] [segment-prefix]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

mkdirSync(".scratch", { recursive: true });

const url = process.argv[2] ?? "http://localhost:3506/";
const only = process.argv[3];
const results = [];
const errors = [];

async function segment(name, body) {
  if (only && !name.startsWith(only)) return;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
  page.on("pageerror", (e) => errors.push(`[${name}] pageerror: ${e.stack}`));
  page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("favicon")) errors.push(`[${name}] console: ${m.text()}`); });
  page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("favicon")) errors.push(`[${name}] http ${r.status()}: ${r.url()}`); });
  page.setDefaultTimeout(5000);
  const wait = (ms) => page.waitForTimeout(ms);
  const h = {
    page, wait,
    shot: (n) => page.screenshot({ path: `.scratch/shot-${n}.png` }),
    see: (text) => page.getByText(text, { exact: false }).filter({ visible: true }).first().waitFor({ timeout: 4000 }),
    click: (text, exact = false) => page.getByRole("button", { name: text, exact }).first().click({ timeout: 4000 }),
    menu: async (item) => { await page.click("#switcher-btn"); await page.getByRole("menuitem", { name: item }).first().click({ timeout: 4000 }); },
    demo: async (item) => { await page.click(".demo-pill"); await page.getByRole("menuitem", { name: item }).first().click({ timeout: 4000 }); },
    step: async (n, fn) => {
      try { await fn(); results.push(`ok   ${n}`); } catch (e) {
        const file = `.scratch/fail-${n.replace(/\W+/g, "-").slice(0, 40)}.png`;
        await page.screenshot({ path: file }).catch(() => {});
        results.push(`FAIL ${n}: ${e.message.split("\n").slice(0, 3).join(" | ")} [${file}]`);
        await page.keyboard.press("Escape").catch(() => {});
      }
    },
    rexSketcher: async () => { await page.getByRole("button", { name: "Talk to Rex Hart" }).click(); await wait(500); await page.click("#mode-sketcher"); await wait(700); },
  };
  await page.goto(url);
  await wait(900);
  await body(h);
  await browser.close();
}

await segment("1-home-talk", async ({ page, wait, shot, see, click, step }) => {
  await step("A1 Home shows kept cards, sketches, + New agent", async () => { await see("Rex Hart"); await see("Sketches"); await see("+ New agent"); await shot("01-home"); });
  await step("A1 Juno card says new here", () => see("new here"));
  await step("D Talk to Rex from Home", async () => { await page.getByRole("button", { name: "Talk to Rex Hart" }).click(); await wait(500); await see("Past talks"); await shot("02-talk-rex"); });
  await step("D open a past talk, Where from opens the passage", async () => {
    await page.locator("#talk-side .talk-open").first().click(); await wait(300);
    await page.locator("#talk-log .src-link").last().click(); await wait(300); await see("Used in this answer"); await shot("03-where-from"); await page.keyboard.press("Escape");
  });
  await step("D Not Rex: fix panel, example, reply, close → redrawn", async () => {
    await page.locator(".not-btn").last().click(); await wait(300); await see("Sketcher · fixing Rex"); await shot("04-fix");
    const ex = page.locator(".fix-example"); if (await ex.count()) await ex.click();
    await page.keyboard.press("Enter"); await wait(2600); await see("from your talk"); await shot("05-fix-reply");
    await page.locator(".fix .icon-btn").first().click(); await wait(400); await see("Rex was redrawn"); await shot("06-redrawn");
  });
  await step("D unknown question → (Demo) chips", async () => {
    await click("New talk"); await wait(200);
    await page.fill("#talk-msg", "What's the capital of Peru?"); await page.keyboard.press("Enter"); await wait(2200); await see("(Demo) Rex would answer here");
  });
  await step("D search past talks", async () => { await page.fill("#talk-search", "zzzz"); await wait(300); await see('No talks with "zzzz"'); });
});

await segment("2-knows-grow", async ({ page, wait, shot, see, step, rexSketcher }) => {
  await rexSketcher();
  await step("C What Rex knows: map, Likeness, References", async () => { await page.click("#rs-knows"); await wait(200); await see("Only you see this"); await see("8 of 10"); await shot("07-knows"); });
  await step("C refs expand → passage with Behind", async () => { await page.locator(".refs-toggle").first().click(); await page.locator(".map-refs .ref-link").first().click(); await wait(200); await see("Behind:"); await shot("08-passage"); await page.keyboard.press("Escape"); });
  await step("E1 Add a reference for Money → studying → finished", async () => {
    await page.locator('[data-line="rex-money"] .link-btn', { hasText: "Add a reference for this" }).click();
    await page.locator(".picker-row").first().click(); await wait(600); await see("Studying Money Has Rules.pdf"); await shot("09-topup-studying"); await wait(3000);
    await see("Finished studying · 1 reference studied");
  });
  await step("E2 map moved: was Blank, 9 of 10 · was 8, chat line", async () => { await see("was Blank"); await see("9 of 10 · was 8"); await see("Money is no longer Blank"); await shot("10-map-moved"); });
  await step("E2 quiz → new talk, typed not sent → sourced answer", async () => {
    await page.locator(".quiz").click(); await wait(500);
    const v = await page.inputValue("#talk-msg"); if (!v.includes("first rule of money")) throw new Error(`composer: ${v}`);
    await page.keyboard.press("Enter"); await wait(2600); await see("Money Has Rules.pdf · p. 12"); await shot("11-quiz-answer");
  });
});

await segment("3-remove-face-palette", async ({ page, wait, shot, see, click, menu, step, rexSketcher }) => {
  await rexSketcher();
  await step("E3 remove Old seminar → Rough mark, then Undo", async () => {
    await page.click("#rs-knows"); await wait(200);
    await page.locator(".refs-row").click(); await wait(150);
    await page.locator(".ref-row.group button", { hasText: "Extras" }).click(); await wait(150);
    await page.locator(".ref-row", { hasText: "Old seminar 2009.mp4" }).getByRole("button", { name: "Remove" }).click(); await wait(200);
    await see('Removed. Rex no longer uses "Old seminar 2009.mp4"'); await see("was Sharp · now Rough"); await see('References: removed "Old seminar 2009.mp4"'); await shot("12-removed");
    await click("Undo", true); await wait(200); await see('References: put back "Old seminar 2009.mp4"');
  });
  await step("E3 remove a group (Live Q&A)", async () => {
    if (!(await page.locator(".ref-row.group").count())) { await page.locator(".refs-row").click(); await wait(150); }
    const row = page.locator(".ref-row.group", { hasText: "Live Q&A" }); await row.getByRole("button", { name: "Remove" }).click(); await wait(200);
    await see('"Live Q&A" (18 recordings)'); await click("Undo", true);
  });
  await step("E4 face sheet: Draw three more, pick, Use", async () => {
    await page.click("#rs-sketch"); await wait(150);
    await page.locator("#face-slot button.face").click(); await wait(150); await see("Rex's face");
    await click("Draw three more"); await wait(1000); await page.locator(".face-option").nth(1).click(); await shot("13-face");
    await page.getByRole("button", { name: "Use", exact: true }).click(); await wait(300); await see("Face: new face");
  });
  await step("E5 Palette: change Directness 4 → 5", async () => {
    await menu("Palette"); await wait(300); await see("Palette · what Rex is mixed from · 186 references, 4 traits"); await shot("14-palette");
    await page.locator('input[name="trait-directness"][value="5"]').check({ force: true }); await wait(1600);
    await see("Directness: 4 → 5"); await see("Sketch: persona updated"); await shot("15-palette-changed"); await page.keyboard.press("Escape"); await wait(100);
    if (!(await page.locator("#right-switch").isVisible())) throw new Error("switch not back after Esc");
  });
});

await segment("4-share", async ({ page, wait, shot, see, click, demo, menu, step }) => {
  await step("F1 Export Rex: list, Exporting…, Exported", async () => {
    await page.getByRole("button", { name: "Talk to Rex Hart" }).click(); await wait(400);
    await menu("Export Rex Hart…"); await wait(200); await see("Stays here"); await see("from 186 references · 2.3 GB"); await shot("16-export");
    await page.getByRole("button", { name: "Export", exact: true }).click(); await wait(900); await see("Exported · Rex Hart.agent.zip"); await click("Done");
  });
  await step("F1 second export gets ' 2'", async () => { await menu("Export Rex Hart…"); await see("Rex Hart 2.agent.zip"); await page.keyboard.press("Escape"); });
  await step("F1 Marcus: Knowledge none, only the Sketch", async () => {
    await page.click("#home-link"); await wait(200); await page.getByRole("button", { name: "Talk to Marcus" }).click(); await wait(400);
    await menu("Export Marcus…"); await see("none, only the Sketch"); await page.keyboard.press("Escape");
  });
  await step("F2 Marcus.agent.zip: clash, Replace line, Keep both → Marcus 2", async () => {
    await demo("Marcus.agent.zip"); await wait(200); await see("You already have Marcus."); await see("Replace: your Marcus and his"); await shot("17-clash");
    await click("Keep both"); await wait(400); await see("Marcus 2"); await shot("18-home-marcus2");
  });
  await step("F2 Juno.agent.zip clashes with the seeded Juno", async () => { await demo("Juno.agent.zip"); await wait(200); await see("You already have Juno."); await page.keyboard.press("Escape"); });
  await step("F2 Old coach.agent.zip: broken, Details", async () => { await demo("Old coach.agent.zip"); await wait(200); await see("Can't import Old coach.agent.zip"); await click("Details"); await see("format 0.3"); await shot("19-broken"); await click("OK"); });
  await step("F2 after deleting Juno, Juno.agent.zip imports → new here", async () => {
    await page.getByRole("button", { name: "Talk to Juno" }).click(); await wait(400);
    await menu("Delete Juno"); await page.locator(".btn.danger").click(); await wait(300);
    await demo("Juno.agent.zip"); await wait(200); await see("Nothing is added until you press Import."); await click("Import", true); await wait(300); await see("new here");
  });
  await step("F3 first open of Juno: First words", async () => { await page.getByRole("button", { name: "Talk to Juno" }).click(); await wait(2500); await see("Paste the clause"); await shot("20-juno-first-words"); });
});

await segment("5-ines", async ({ page, wait, shot, see, click, menu, step }) => {
  await step("A3 delete Untitled sketch", async () => {
    await page.locator(".sketch-row", { hasText: "Untitled sketch" }).click(); await wait(600);
    await menu("Delete"); await wait(150); await see("This can't be undone."); await shot("21-delete"); await page.locator(".btn.danger").click(); await wait(300);
  });
  await step("B3 Ines studying with first impressions", async () => {
    await page.locator(".sketch-row", { hasText: "Ines" }).click(); await wait(700); await see("Studying ·"); await page.click("#rs-knows"); await wait(200); await see("first impressions"); await shot("22-ines-studying");
  });
  await step("B4 Skip time → finished, voice, faces", async () => {
    await page.click(".demo-pill");
    for (let i = 0; i < 8; i++) {
      const it = page.getByRole("menuitem", { name: "Skip time" });
      if (await it.isDisabled()) break;
      await it.click(); await wait(300);
    }
    await page.mouse.click(400, 400);
    await wait(1200); await see("Finished studying"); await see("297 references studied"); await shot("23-ines-finished");
  });
  await step("B6 Keep → card with C8 box → Talk to Ines", async () => { await page.click("#keep"); await wait(700); await see("only you see this"); await shot("24-ines-kept"); await click("Talk to Ines"); await wait(2000); await shot("25-ines-talk"); });
});

await segment("6-fresh", async ({ page, wait, shot, see, click, demo, step }) => {
  await step("B1 Start UJ2 fresh → door → chip → laid out", async () => {
    await demo("Start UJ2 fresh"); await wait(700); await click("Add references"); await page.locator(".picker-row").first().click(); await wait(1700);
    await see("Set aside · 4"); await see("312 files · 38.4 GB"); await shot("26-laid-out");
  });
  await step("B2 one-sentence correction", async () => {
    await page.fill("#message", "Skip Bonus. Her voice from the Live Q&A only."); await page.keyboard.press("Enter"); await wait(3000);
    await see("Split: 18 recordings moved"); await see("Set aside · 14"); await shot("27-corrected");
  });
  await step("B3 Start studying", async () => { await click("Start studying"); await wait(400); await see("Studying ·"); await shot("28-fresh-studying"); });
  await step("B1 path rule: unknown path", async () => { await page.fill("#message", "~/nowhere"); await page.keyboard.press("Enter"); await wait(600); await see("Can't find ~/nowhere. Check the path."); });
  await step("A2 + New agent → empty state with the door", async () => { await page.click("#home-link"); await wait(200); await page.locator(".new-card").click(); await wait(900); await see("Who should this agent be?"); await see("a folder of their books"); await shot("29-new"); });
});

console.log(results.join("\n"));
console.log(errors.length ? `\nERRORS:\n${[...new Set(errors)].join("\n")}` : "\nno page errors");
