// Live walkthrough of acceptance-columbo.md (C1–C9, W1–W3) in real Chrome
// against the real `claude` CLI. A spike, not part of `npm test`.
//
//   npm install --no-save playwright-core
//   npx playwright-core install chromium-headless-shell
//   node "updates/2026-11-24 AGENT-CREATOR - OPEN/walkthrough-jony.mjs"
//
// Starts its own server (PORT, default 3505) with a clean agent home in
// ./.walkthrough-home (gitignored), and stops/restarts it where a check asks.
// Prints one line per "Done well" item and writes walkthrough-results.json.

import { spawn } from "node:child_process";
import { rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const HOME = `${ROOT}.walkthrough-home`;
const PORT = process.env.PORT || "3505";
const BASE = `http://localhost:${PORT}`;
const results = [];
const timings = {};
const transcript = [];

function check(id, line, ok, detail = "") {
  results.push({ id, line, ok: Boolean(ok), detail: String(detail).slice(0, 300) });
  console.log(`${ok ? "PASS" : "FAIL"} ${id} · ${line}${detail ? ` — ${String(detail).slice(0, 200)}` : ""}`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Server ───────────────────────────────────────────────────────────────
let server;
async function startServer() {
  server = spawn(process.execPath, ["src/server/main.mjs"], {
    cwd: ROOT, env: { ...process.env, PORT, AGENT_CREATOR_HOME: HOME, LOG_LEVEL: "warn" }, stdio: ["ignore", "inherit", "inherit"],
  });
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${BASE}/api/health`)).ok) return; } catch { /* not yet */ }
    await sleep(100);
  }
  throw new Error("server did not start");
}
async function stopServer() {
  if (!server) return;
  const exited = new Promise((resolve) => server.once("exit", resolve));
  server.kill("SIGINT");
  await exited;
  server = null;
}

// ── Page helpers ─────────────────────────────────────────────────────────
let browser, context, page;
let requests = [];

async function openPage() {
  page = await context.newPage();
  page.on("request", (r) => requests.push({ m: r.method(), u: new URL(r.url()).pathname, start: Date.now(), end: null, req: r }));
  page.on("requestfinished", (r) => { const x = requests.find((q) => q.req === r); if (x) x.end = Date.now(); });
  page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
  page.on("crash", () => console.log("PAGE CRASHED"));
  page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE", m.text()); });
  const t0 = Date.now();
  await page.goto(BASE);
  await page.waitForFunction(() => document.activeElement?.id === "message" && document.querySelector("#keep").textContent);
  await page.waitForLoadState("networkidle");
  return Date.now() - t0;
}

const count = (m, suffix, since = 0) => requests.filter((r) => r.m === m && r.u.endsWith(suffix) && r.start >= since).length;

const snap = () => page.evaluate(() => {
  const f = (n) => {
    const w = document.querySelector(`.draft-field[data-field="${n}"]`);
    const input = w.querySelector(".field");
    return { value: input.value, tag: w.querySelector(".tag").textContent.trim(), updated: w.classList.contains("updated"), edited: w.classList.contains("edited"), readOnly: input.readOnly, retry: !w.querySelector(".retry").hidden };
  };
  const keep = document.querySelector("#keep");
  const replies = [...document.querySelectorAll(".msg.sketcher")];
  const last = replies.at(-1);
  const card = document.querySelector("#keep-card");
  return {
    name: f("name"), persona: f("persona"), instructions: f("instructions"),
    keep: { text: keep.textContent, disabled: keep.disabled, title: keep.title, cls: keep.className },
    title: document.querySelector("#sketch-title").textContent,
    switcher: document.querySelector("#switcher-name").textContent,
    placeholder: document.querySelector("#message").placeholder,
    composer: document.querySelector("#message").value,
    card: { hidden: card.hidden, text: card.innerText },
    logCount: document.querySelector("#log").childElementCount,
    lastReply: last?.querySelector(".say")?.innerText ?? null,
    lastChange: last?.querySelector(".change-line")?.textContent ?? null,
    lastError: document.querySelector(".msg.user:last-of-type .turn-error, .turn-error:last-of-type")?.innerText ?? null,
    lastErrorNeutral: [...document.querySelectorAll(".turn-error")].at(-1)?.classList.contains("neutral") ?? null,
    emptyHidden: document.querySelector("#empty").hidden,
    note: document.querySelector("#note").hidden ? null : document.querySelector("#note").textContent,
    sendStop: document.querySelector("#send").classList.contains("stop"),
    sendDisabled: document.querySelector("#send").disabled,
    focus: document.activeElement?.id,
    voiceCards: [...document.querySelectorAll(".voice-card")].map((c) => ({ first: c.classList.contains("first-voice"), avatar: c.querySelector(".voice-avatar")?.textContent, name: c.querySelector(".voice-head span:last-child")?.textContent, italic: getComputedStyle(c.querySelector(".voice-text")).fontStyle, caption: c.querySelector(".voice-caption")?.textContent })),
    logText: document.querySelector("#log").innerText,
    sketchBusy: document.querySelector("#sketch").getAttribute("aria-busy"),
  };
});

// Sends one message and follows the turn to its end.
async function turn(text, { onFirstWords, label } = {}) {
  await page.fill("#message", text);
  const since = Date.now();
  await page.press("#message", "Enter");
  const instant = await snap();
  const bubbleMs = Date.now() - since;
  let firstWords = null;
  const lengths = new Set();
  let leak = false;
  let called = false;
  for (;;) {
    const s = await page.evaluate(() => ({
      say: document.querySelector(".msg.sketcher:last-child .say")?.textContent ?? "",
      streaming: Boolean(document.querySelector(".msg.sketcher:last-child .say.streaming")),
      cardWhileStreaming: Boolean(document.querySelector(".msg.sketcher:last-child .say.streaming .voice-card")),
      stop: document.querySelector("#send").classList.contains("stop"),
      log: document.querySelector("#log").textContent,
    }));
    if (/<draft|<\/draft>|\{\s*"(name|persona|instructions)"/.test(s.log)) leak = true;
    if (s.streaming && s.say) {
      lengths.add(s.say.length);
      firstWords ??= Date.now() - since;
      if (onFirstWords && !called) { called = true; await onFirstWords(); }
    }
    if (s.cardWhileStreaming) leak = "card-while-streaming";
    if (!s.stop) break;
    if (Date.now() - since > 240_000) throw new Error(`turn timed out: ${text}`);
    await sleep(40);
  }
  const fullMs = Date.now() - since;
  const after = await snap();
  transcript.push({ label, you: text, sketcher: after.lastReply, change: after.lastChange, error: after.lastError, firstWords, fullMs });
  console.log(`  … turn "${text.slice(0, 50)}" first words ${firstWords} ms, full ${fullMs} ms, chunks ${lengths.size}`);
  return { instant, bubbleMs, firstWords, fullMs, chunks: lengths.size, leak, after, since };
}

async function typeInto(selector, text, { replace = false } = {}) {
  await page.click(selector);
  if (replace) await page.keyboard.press("Meta+A");
  else await page.keyboard.press("Meta+ArrowDown");
  await page.keyboard.type(text, { delay: 15 });
}

const questions = (text) => (text.match(/\?/g) ?? []).length;

// ── The walk ─────────────────────────────────────────────────────────────
async function main() {
  await rm(HOME, { recursive: true, force: true });
  await startServer();
  // Playwright's own headless shell: the system Chrome gets killed ~20 s in
  // on this machine. Set CHROME_CHANNEL=chrome to use the system one.
  browser = await chromium.launch({ ...(process.env.CHROME_CHANNEL ? { channel: process.env.CHROME_CHANNEL } : {}), headless: true });
  browser.on("disconnected", () => console.log("BROWSER DISCONNECTED"));
  context = await browser.newContext({ viewport: { width: 1280, height: 860 } });

  // C1
  const openMs = await openPage();
  let s = await snap();
  const heading = await page.textContent(".empty-q");
  const chips = await page.$$eval(".chip", (c) => c.map((x) => x.textContent));
  check("C1", "open under 1 s with composer focused", openMs < 1000 && s.focus === "message", `${openMs} ms, focus ${s.focus}`);
  check("C1", "heading, three chips, 'Type here…'", heading === "Who should this agent be? One line is enough." && chips.length === 3 && s.placeholder === "Type here…", `${heading} | ${chips.length} | ${s.placeholder}`);
  check("C1", "Keep disabled with 'Give it a name first'", s.keep.disabled && s.keep.title === "Give it a name first", JSON.stringify(s.keep));
  const chatBefore = count("POST", "/chat");
  await page.click(".chip >> nth=0");
  const sel = await page.evaluate(() => { const m = document.querySelector("#message"); return { v: m.value, at: m.selectionStart, len: m.value.length, focus: document.activeElement.id }; });
  check("C1", "chip fills the composer, not sent, cursor at end", sel.v === chips[0] && sel.at === sel.len && sel.focus === "message" && count("POST", "/chat") === chatBefore, JSON.stringify(sel));
  const since = Date.now();
  await page.press("#message", "Enter");
  s = await snap();
  const bubbleMs = Date.now() - since;
  check("C1", "bubble at once, chips gone, Sketching… in chat and header", bubbleMs < 300 && s.logCount === 2 && s.emptyHidden && s.title === "Sketching…" && /Sketching…/.test(s.logText), `${bubbleMs} ms (incl. snapshot), title ${s.title}`);
  check("C1", "fields read-only and Sketch busy (shimmer hook)", s.name.readOnly && s.persona.readOnly && s.instructions.readOnly && s.sketchBusy === "true");
  // follow the rest of the C1 turn
  let lengths = new Set(); let firstWords = null; let leak = false;
  for (;;) {
    const st = await page.evaluate(() => ({ say: document.querySelector(".msg.sketcher:last-child .say.streaming")?.textContent ?? "", stop: document.querySelector("#send").classList.contains("stop"), log: document.querySelector("#log").textContent }));
    if (/<draft|\{\s*"(name|persona|instructions)"/.test(st.log)) leak = true;
    if (st.say) { lengths.add(st.say.length); firstWords ??= Date.now() - since; }
    if (!st.stop) break;
    await sleep(40);
  }
  const c1Full = Date.now() - since;
  s = await snap();
  transcript.push({ label: "C1", you: chips[0], sketcher: s.lastReply, change: s.lastChange, firstWords, fullMs: c1Full });
  timings.C1 = { firstWords, full: c1Full };
  check("C1", "reply streams in pieces", lengths.size >= 3, `${lengths.size} streamed lengths`);
  check("C1", "all three fields filled, each 'new'", ["name", "persona", "instructions"].every((n) => s[n].value.trim() && s[n].tag === "new"), `${s.name.value} | tags ${s.name.tag}/${s.persona.tag}/${s.instructions.tag}`);
  check("C1", "switcher shows the name", s.switcher === s.name.value.trim(), s.switcher);
  check("C1", "change line names all three", s.lastChange === "Sketch: name, persona and instructions updated ↗", s.lastChange);
  check("C1", "at most two questions, after the draft exists", questions(s.lastReply) <= 2, `${questions(s.lastReply)} '?'`);
  check("C1", "no raw <draft> or JSON ever shown", !leak);
  check("C1", "Keep enabled", !s.keep.disabled && s.keep.text === "Keep");
  const c1Placeholder = s.placeholder;
  const tonyName = s.name.value;

  // C2
  const instrBefore = s.instructions.value;
  // A persona that says "You are [old name]" must follow the rename; anything else stays.
  const personaNamesIt = s.persona.value.includes(tonyName);
  let t = await turn("Give him a shorter name", { label: "C2" });
  s = t.after;
  const nameChanged = s.name.value !== tonyName;
  const personaOk = s.persona.tag === "" || (personaNamesIt && s.persona.value.includes(s.name.value));
  check("C2", "only Name reacts (Persona only to carry the new name)", nameChanged && s.name.tag === "new" && personaOk && s.instructions.tag === "", `${tonyName} → ${s.name.value}; tags ${s.name.tag}/${s.persona.tag}/${s.instructions.tag}`);
  check("C2", "Instructions exactly as before", s.instructions.value === instrBefore);
  check("C2", "change line names Name (and Persona only if it carried the name)", s.lastChange === "Sketch: name updated ↗" || (personaOk && s.lastChange === "Sketch: name and persona updated ↗"), s.lastChange);
  await page.evaluate(() => { const w = document.querySelector('.draft-field[data-field="name"]'); w.classList.remove("updated"); document.querySelector("#sketch-scroll").scrollTop = 9999; });
  await page.click(".msg.sketcher:last-child .change-line");
  await sleep(100);
  const replay = await page.evaluate(() => ({ updated: document.querySelector('.draft-field[data-field="name"]').classList.contains("updated") }));
  check("C2", "change line click re-shows the Name bar", replay.updated);

  // C3 / C5 placeholder (C5 step 1 is about the placeholder after the first sketch)
  check("C5", "placeholder after first sketch: 'Ask how [Name] would answer something real…' once", /^Ask how .+ would answer something real…$/.test(c1Placeholder) && s.placeholder === "Reply to the Sketcher…", `${c1Placeholder} → ${s.placeholder}`);
  t = await turn("ok", { label: "C3 ok" });
  s = t.after;
  check("C3", "'ok' accepted: the draft changes on that turn", Boolean(s.lastChange), s.lastChange ?? "(no change line)");
  check("C3", "never more than two questions", questions(s.lastReply) <= 2, `${questions(s.lastReply)} '?'`);
  t = await turn("Skip that. Can he use one short story per answer?", { label: "C3 skip" });
  s = t.after;
  check("C3", "half-answer / skip goes on without error", !s.lastError && Boolean(s.lastReply), s.lastChange ?? "(no change)");

  // C4
  const c4Name = s.name.value;
  t = await turn("More blunt. No hype words.", { label: "C4 blunt" });
  s = t.after;
  timings.C4 = { firstWords: t.firstWords, full: t.fullMs };
  check("C4", "Persona changes, Name unchanged, untouched fields unmarked", s.name.value === c4Name && s.name.tag === "" && /persona|instructions/.test(s.lastChange ?? ""), `${s.lastChange}; name tag '${s.name.tag}'`);
  t = await turn("Actually, make him a bit gentler", { label: "C4 gentler" });
  s = t.after;
  check("C4", "gentler applied by a change", Boolean(s.lastChange), s.lastChange);

  // C5
  const keepLinesBefore = (s.logText.match(/press Keep/g) ?? []).length;
  let cardMidStream = false;
  t = await turn("How would he answer: I can't get out of bed in the morning?", {
    label: "C5 sample 1",
    onFirstWords: async () => { cardMidStream = await page.evaluate(() => Boolean(document.querySelector(".say.streaming .voice-card"))); },
  });
  s = t.after;
  timings.C5 = { firstWords: t.firstWords, full: t.fullMs };
  const vc = s.voiceCards.at(-1);
  check("C5", "voice card: circle letter, name, italic, caption", vc && vc.avatar && vc.name && vc.italic === "italic" && vc.caption === "sample, from the current sketch", JSON.stringify(vc));
  check("C5", "plain text while streaming, card only on done", !cardMidStream && t.leak !== "card-while-streaming");
  // The C1 reply may already hold a sample: the first card in the chat rises, the rest don't.
  check("C5", "first card rises (first-voice), only that one", s.voiceCards[0]?.first === true && s.voiceCards.slice(1).every((c) => !c.first), `${s.voiceCards.length} cards`);
  t = await turn("And how would he answer: my boss ignores my ideas?", { label: "C5 sample 2" });
  s = t.after;
  check("C5", "second card just appears", s.voiceCards.length >= 2 && s.voiceCards.at(-1).first === false, `${s.voiceCards.length} cards`);
  const keepLines = (s.logText.match(/press Keep/g) ?? []).length;
  check("C5", "'press Keep' at most once for this agent", keepLines <= 1, `${keepLines} (was ${keepLinesBefore})`);
  check("C5", "sample questions don't change the draft", !s.lastChange, s.lastChange ?? "(none)");

  // C6
  let mark = Date.now();
  await typeInto("#f-name", "Coach T", { replace: true });
  await sleep(1300);
  s = await snap();
  check("C6", "Name: '✓ saved' ~1 s after typing stops", s.name.tag === "✓ saved", s.name.tag);
  await sleep(1500);
  s = await snap();
  check("C6", "then '✎ yours'; 'kept' never on a field", s.name.tag === "✎ yours" && !/kept/i.test(s.name.tag), s.name.tag);
  check("C6", "one PUT for the Name edit, not one per keystroke", count("PUT", "/draft", mark) === 1, `${count("PUT", "/draft", mark)} PUTs`);
  mark = Date.now();
  await typeInto("#f-persona", " He always ends with one action for today.");
  await page.click(".sketch-head h2");
  await sleep(300);
  s = await snap();
  check("C6", "Persona: '✓ saved' on leaving the field, one PUT", s.persona.tag === "✓ saved" && count("PUT", "/draft", mark) === 1, `${s.persona.tag}, ${count("PUT", "/draft", mark)} PUTs`);
  await sleep(1600);
  let blocked = null;
  t = await turn("Make the instructions shorter", {
    label: "C6 shorter",
    onFirstWords: async () => {
      const before = await page.inputValue("#f-name");
      await page.click("#f-name").catch(() => {});
      await page.keyboard.type("zz");
      const mid = await snap();
      blocked = { same: (await page.inputValue("#f-name")) === before, tags: [mid.name.tag, mid.persona.tag, mid.instructions.tag].join(""), ro: mid.name.readOnly };
      await page.focus("#message");
    },
  });
  s = t.after;
  check("C6", "while sketching fields can't be typed into, tag spots empty", blocked && blocked.same && blocked.ro && blocked.tags === "", JSON.stringify(blocked));
  check("C6", "fields open again after the reply", !s.name.readOnly && !s.persona.readOnly);
  check("C6", "MOST IMPORTANT: Name still 'Coach T', persona sentence word for word", s.name.value === "Coach T" && s.persona.value.includes("He always ends with one action for today."), `${s.name.value} | ...${s.persona.value.slice(-80)}`);
  check("C6", "only Instructions changed", s.lastChange === "Sketch: instructions updated ↗", s.lastChange);
  t = await turn("Rename him to Tony", { label: "C6 rename" });
  s = t.after;
  check("C6", "asked rename: done ('new', not both) or asked first", (s.name.value !== "Coach T" && s.name.tag === "new") || (s.name.value === "Coach T" && /\?/.test(s.lastReply)), `${s.name.value} tag '${s.name.tag}'`);
  await typeInto("#f-name", "", { replace: true });
  await page.keyboard.press("Backspace");
  s = await snap();
  const clearedDisabled = s.keep.disabled;
  await page.keyboard.type("Tony");
  s = await snap();
  check("C6", "clearing Name disables Keep, typing it back enables it", clearedDisabled && !s.keep.disabled);
  await page.click(".sketch-head h2");
  await sleep(400);
  // hard case
  mark = Date.now();
  await typeInto("#f-instructions", '\nNever use the word "awesome".');
  await page.fill("#message", "Rewrite everything to be more energetic");
  await page.press("#message", "Enter");
  const put = requests.filter((r) => r.m === "PUT" && r.start >= mark).at(-1);
  await page.waitForFunction(() => !document.querySelector("#send").classList.contains("stop"), null, { timeout: 240_000 });
  const chat = requests.filter((r) => r.m === "POST" && r.u.endsWith("/chat") && r.start >= mark)[0];
  s = await snap();
  transcript.push({ label: "C6 hard", you: "Rewrite everything to be more energetic", sketcher: s.lastReply, change: s.lastChange });
  check("C6", "hard case: PUT finishes before the chat POST", put && chat && put.end && put.end <= chat.start, `put end ${put?.end} chat start ${chat?.start}`);
  check("C6", "hard case: hand line still there (or asked first)", /awesome/i.test(s.instructions.value) || /awesome/i.test(s.lastReply ?? ""), s.instructions.value.split("\n").find((l) => /awesome/i.test(l)) ?? s.instructions.value.slice(-120));
  check("C6", "hard case: '✎ yours' stays unless that field changed", s.instructions.tag === "✎ yours" || s.instructions.tag === "new", `tag '${s.instructions.tag}', change ${s.lastChange}`);

  // C7
  t = await turn("ok save it, I'm done", { label: "C7 save it" });
  s = t.after;
  check("C7", "Sketcher doesn't claim it saved/kept; points to Keep; header still Keep", /Keep/.test(s.lastReply) && !/\b(I('ve| have)? (saved|kept)|is (now )?kept)\b/i.test(s.lastReply) && s.keep.text === "Keep", s.lastReply?.slice(0, 160));
  const logBefore = s.logCount;
  mark = Date.now();
  await page.click("#keep");
  await page.waitForFunction(() => document.querySelector("#keep").textContent === "Kept ✓");
  const keepMs = Date.now() - mark;
  const born = await page.evaluate(() => document.querySelector("#sketch").classList.contains("agent-born"));
  s = await snap();
  check("C7", "Keep → 'Kept ✓' under 1 s, card with name, first sentence, 'Yours…', no Kept ✓ in card", keepMs < 1000 && !s.card.hidden && s.card.text.includes(s.name.value) && s.card.text.includes("Yours. You can keep changing it.") && !s.card.text.includes("Kept"), `${keepMs} ms | ${s.card.text.replace(/\n/g, " / ")}`);
  check("C7", "celebration plays (agent-born), saved class on button", born && /saved/.test(s.keep.cls));
  await sleep(500);
  check("C7", "nothing new in the chat after Keep", (await snap()).logCount === logBefore);
  await page.click("#switcher-btn");
  await page.waitForSelector("#switcher-menu:not([hidden])");
  const menu1 = await page.$$eval("#switcher-menu [role=menuitem]", (x) => x.map((i) => i.innerText.replace(/\n/g, " ")));
  check("C7", "switcher shows 'Kept'", menu1.some((r) => r.includes(s.name.value) && r.includes("Kept")), menu1.join(" | "));
  await page.keyboard.press("Escape");
  const keptDraft = { name: s.name.value, persona: s.persona.value, instructions: s.instructions.value };
  await page.reload();
  await page.waitForFunction(() => document.querySelector("#keep").textContent && document.querySelector("#f-name").value);
  s = await snap();
  check("C7", "after reload: same draft and 'Kept ✓'", s.keep.text === "Kept ✓" && s.name.value === keptDraft.name && s.persona.value === keptDraft.persona && s.instructions.value === keptDraft.instructions);
  await typeInto("#f-persona", " Truly.");
  await page.click(".sketch-head h2");
  await sleep(400);
  s = await snap();
  check("C7", "hand edit after Keep: card goes, Keep enabled, no dialog", s.card.hidden && s.keep.text === "Keep" && !s.keep.disabled);
  await page.click("#keep");
  await page.waitForFunction(() => document.querySelector("#keep").textContent === "Kept ✓");

  // C8
  const beforeClose = await snap();
  await page.close();
  await stopServer();
  await startServer();
  requests = [];
  const reopenMs = await openPage();
  s = await snap();
  check("C8", "most recent agent opens at once, no chat call", reopenMs < 1500 && count("POST", "/chat") === 0, `${reopenMs} ms`);
  check("C8", "only 'Back to [Name].', composer focused, no marks, same draft", s.logCount === 0 && s.note === `Back to ${beforeClose.name.value}.` && s.focus === "message" && [s.name.tag, s.persona.tag, s.instructions.tag].join("") === "" && s.persona.value === beforeClose.persona.value, `${s.note}`);
  t = await turn("Make his instructions mention mornings", { label: "C8 mornings" });
  s = t.after;
  check("C8", "first reply goes straight to the change (session resumed)", /instructions/.test(s.lastChange ?? "") && !/where we (were|left)|so far|recap/i.test(s.lastReply), `${s.lastChange} | ${s.lastReply?.slice(0, 120)}`);
  t = await turn("Where were we?", { label: "C8 where" });
  check("C8", "recap only when asked", Boolean(t.after.lastReply) && t.after.lastReply.length > 40, t.after.lastReply?.slice(0, 160));
  await page.click("#switcher-btn");
  await page.waitForSelector("#switcher-menu:not([hidden])");
  const menu2 = await page.$$eval("#switcher-menu [role=menuitem]", (x) => x.map((i) => i.innerText.replace(/\n/g, " ")));
  check("C8", "menu lists only real agents, no 'Untitled sketch'", menu2[0] === "+ New agent" && !menu2.some((r) => r.includes("Untitled")), menu2.join(" | "));
  await page.keyboard.press("Escape");
  const tonyId = await page.evaluate(() => location.href) && (await (await fetch(`${BASE}/api/agents`)).json())[0].id;

  // C9
  await page.click("#switcher-btn");
  await page.click("#switcher-menu [role=menuitem] >> nth=0");
  await page.waitForFunction(() => !document.querySelector("#empty").hidden);
  const bio = BIO;
  await page.click("#message");
  await page.keyboard.type("Use this: ");
  await page.evaluate(() => document.querySelector("#message").dispatchEvent(new ClipboardEvent("paste", { bubbles: true })));
  await page.keyboard.insertText(bio);
  const grow = await page.evaluate(() => { const m = document.querySelector("#message"); return { h: m.clientHeight, sh: m.scrollHeight }; });
  check("C9", "composer takes the paste, grows to ~8 lines then scrolls", grow.h > 150 && grow.h < 260 && grow.sh > grow.h, JSON.stringify(grow));
  const words = bio.trim().split(/\s+/).length;
  const pasteSince = Date.now();
  await page.press("#message", "Enter");
  const bubble = await page.evaluate(() => { const b = [...document.querySelectorAll(".msg.user .bubble")].at(-1); return { lead: b.firstChild?.textContent, chip: b.querySelector(".paste-chip")?.textContent }; });
  check("C9", "bubble shows 'Use this:' and 'Pasted note · N words ▸'", bubble.lead === "Use this:" && bubble.chip === `Pasted note · ${words.toLocaleString("en-US")} words ▸`, JSON.stringify(bubble));
  await page.locator(".msg.user").last().locator(".paste-chip").click();
  const expanded = await page.evaluate(() => ![...document.querySelectorAll(".msg.user .paste-text")].at(-1).hidden);
  check("C9", "▸ expands the full text in place", expanded);
  let typingOk = true;
  await page.waitForFunction(() => document.querySelector(".say.streaming")?.textContent, null, { timeout: 120_000 });
  const typeStart = Date.now();
  await page.evaluate(() => document.querySelector("#message").focus());
  await page.keyboard.type("still responsive", { delay: 5 });
  typingOk = (await page.inputValue("#message")) === "still responsive" && Date.now() - typeStart < 2000;
  await page.fill("#message", "");
  await page.waitForFunction(() => !document.querySelector("#send").classList.contains("stop"), null, { timeout: 240_000 });
  s = await snap();
  transcript.push({ label: "C9", you: "Use this: <bio>", sketcher: s.lastReply, change: s.lastChange, fullMs: Date.now() - pasteSince });
  check("C9", "persona uses details from the paste", /lighthouse|Brennock|harbour|harbor|fog/i.test(s.persona.value + s.instructions.value), s.persona.value.slice(0, 160));
  check("C9", "page stays responsive while streaming", typingOk);
  const maraId = (await (await fetch(`${BASE}/api/agents`)).json())[0].id;

  // W2
  await page.click("#switcher-btn");
  await page.click("#switcher-menu [role=menuitem] >> nth=0");
  await page.waitForFunction(() => !document.querySelector("#empty").hidden);
  const emptyId = await page.evaluate(() => document.querySelector("#switcher-name").textContent);
  mark = Date.now();
  await page.press("#message", "Enter");
  const sendDisabled = await page.evaluate(() => document.querySelector("#send").disabled);
  await page.click("#send", { force: true }).catch(() => {});
  await page.fill("#message", "   ");
  await page.press("#message", "Enter");
  s = await snap();
  check("W2", "empty / spaces: nothing sent, Send disabled, chips still there", count("POST", "/chat", mark) === 0 && s.logCount === 0 && sendDisabled && s.sendDisabled && !s.emptyHidden && !s.lastError);
  await page.fill("#message", "");
  await page.keyboard.type("a");
  await page.keyboard.press("Shift+Enter");
  await page.keyboard.type("b");
  check("W2", "Shift+Enter adds a line, doesn't send", (await page.inputValue("#message")) === "a\nb" && count("POST", "/chat", mark) === 0);
  await page.fill("#message", "");
  const postsBefore = count("POST", "/api/agents", mark);
  await page.click("#switcher-btn");
  await page.waitForSelector("#switcher-menu:not([hidden])");
  const menu3 = await page.$$eval("#switcher-menu [role=menuitem]", (x) => x.map((i) => i.innerText.replace(/\n/g, " ")));
  await page.click("#switcher-menu [role=menuitem] >> nth=0");
  await sleep(300);
  check("W2", "empty agent not listed; + New agent stays on the same empty screen", !menu3.some((r) => r.includes("Untitled") || r.startsWith("New agent")) && count("POST", "/api/agents", mark) === postsBefore && emptyId === "New agent", menu3.join(" | "));

  // W1 (on the pasted-bio agent)
  await page.click("#switcher-btn");
  await page.click(`#switcher-menu [role=menuitem]:has-text("${(await (await fetch(`${BASE}/api/agents/${maraId}`)).json()).draft.name}")`);
  await page.waitForFunction(() => document.querySelector("#note").textContent.startsWith("Back to"));
  const w1Before = await snap();
  await page.fill("#message", "Make him sound older and wiser");
  await page.press("#message", "Enter");
  await page.waitForFunction(() => document.querySelector(".say.streaming")?.textContent, null, { timeout: 120_000 });
  await page.click("#send");
  await page.waitForFunction(() => !document.querySelector("#send").classList.contains("stop"));
  s = await snap();
  check("W1", "Stop: partial text gone, 'Stopped. · Try again' neutral, Sketch unchanged, fields open", (s.lastReply === null && s.lastError === "Stopped. · Try again" && s.lastErrorNeutral === true && s.persona.value === w1Before.persona.value && !s.persona.readOnly), `${s.lastError} neutral=${s.lastErrorNeutral}`);
  await page.click(".turn-error .link-btn");
  await page.waitForFunction(() => document.querySelector("#send").classList.contains("stop"));
  await page.waitForFunction(() => !document.querySelector("#send").classList.contains("stop"), null, { timeout: 240_000 });
  s = await snap();
  const userBubbles = await page.$$eval(".msg.user", (x) => x.length);
  check("W1", "Try again resends the same message and completes", userBubbles === 1 && !s.lastError && Boolean(s.lastReply), `${userBubbles} bubbles, reply ${s.lastReply?.slice(0, 60)}`);
  const w1Sketch = await snap();
  await page.fill("#message", "Give him a favourite saying");
  await page.press("#message", "Enter");
  await page.waitForFunction(() => document.querySelector(".say.streaming")?.textContent, null, { timeout: 120_000 });
  await page.keyboard.type("half-typed note");
  const killAt = Date.now();
  await stopServer();
  await page.waitForFunction(() => !document.querySelector("#send").classList.contains("stop"), null, { timeout: 15_000 });
  const lostMs = Date.now() - killAt;
  s = await snap();
  check("W1", "server down: 'Lost the connection to the app. · Try again' within seconds, nothing stuck", s.lastError === "Lost the connection to the app. · Try again" && s.title === "Sketch" && s.lastReply === null && lostMs < 5000, `${lostMs} ms: ${s.lastError}`);
  check("W1", "Sketch unchanged and composer text kept", s.persona.value === w1Sketch.persona.value && s.composer === "half-typed note", s.composer);
  await startServer();
  await page.locator(".turn-error .link-btn").last().click();
  await page.waitForFunction(() => document.querySelector("#send").classList.contains("stop"));
  await page.waitForFunction(() => !document.querySelector("#send").classList.contains("stop"), null, { timeout: 240_000 });
  s = await snap();
  check("W1", "after restart, Try again completes the turn", !s.lastError && Boolean(s.lastReply) && s.composer === "half-typed note", s.lastReply?.slice(0, 80));
  await page.fill("#message", "");
  // banner (simulated: the CLI can't be removed on this machine)
  await page.route("**/api/agents/*/chat", (route) => route.fulfill({ status: 200, headers: { "content-type": "text/event-stream" }, body: 'event: error\ndata: {"kind":"not-installed","message":"spawn claude ENOENT","traceId":"t1"}\n\n' }));
  await page.route("**/api/health", (route) => route.fulfill({ status: 200, contentType: "application/json", body: '{"installed":false}' }));
  await turn("Simulated offline turn", { label: "W1 offline (simulated)" });
  s = await snap();
  const banner = await page.evaluate(() => ({ hidden: document.querySelector("#banner").hidden, text: document.querySelector("#banner").innerText, btn: document.querySelector("#banner-btn").textContent, role: document.querySelector("#banner").getAttribute("role") }));
  check("W1", "offline banner (simulated): text, one button 'Try again', line has no Try again", !banner.hidden && banner.text.includes("The Sketcher can't reach Claude right now.") && banner.text.includes("Your text stays here.") && banner.btn === "Try again" && s.lastError === "The Sketcher can't reach Claude right now." && s.sendDisabled, `${banner.btn} | ${s.lastError}`);
  await page.unroute("**/api/agents/*/chat");
  await page.unroute("**/api/health");
  await page.click("#banner-btn");
  await page.waitForFunction(() => document.querySelector("#banner").hidden);
  await page.waitForFunction(() => !document.querySelector("#send").classList.contains("stop"), null, { timeout: 240_000 });
  s = await snap();
  check("W1", "banner Try again: back online, resends the failed turn", !s.lastError && Boolean(s.lastReply));

  // W3 (back to the Tony agent)
  await page.click("#switcher-btn");
  await page.click(`#switcher-menu [role=menuitem]:has-text("Kept")`);
  await page.waitForFunction(() => document.querySelector("#keep").textContent === "Kept ✓");
  await typeInto("#f-persona", " Always.");
  mark = Date.now();
  await page.dblclick("#keep");
  const savingSeen = await page.evaluate(() => document.querySelector("#keep").classList.contains("saving") || document.querySelector("#keep").textContent === "Kept ✓");
  await page.waitForFunction(() => document.querySelector("#keep").textContent === "Kept ✓");
  await sleep(800);
  s = await snap();
  check("W3", "at most one PUT and exactly one POST /save", count("PUT", "/draft", mark) <= 1 && count("POST", "/save", mark) === 1, `${count("PUT", "/draft", mark)} PUT, ${count("POST", "/save", mark)} save`);
  check("W3", "saving state, one 'Kept ✓', no 'Couldn't keep'", savingSeen && s.keep.text === "Kept ✓" && !/Couldn't/.test(s.keep.text));
  await page.reload();
  await page.waitForFunction(() => document.querySelector("#keep").textContent && document.querySelector("#f-name").value);
  s = await snap();
  check("W3", "after reload the edit is there and Kept ✓", s.persona.value.endsWith("Always.") && s.keep.text === "Kept ✓");
  // related: a failing save, and a failing hand save (simulated with a 500)
  await typeInto("#f-persona", " Yes.");
  await page.click(".sketch-head h2");
  await sleep(400);
  await page.route("**/api/agents/*/save", (route) => route.fulfill({ status: 500, body: "{}" }));
  await page.click("#keep");
  await page.waitForFunction(() => document.querySelector("#keep").textContent === "Couldn't keep · Try again");
  const failAt = Date.now();
  await page.waitForFunction(() => document.querySelector("#keep").textContent === "Keep", null, { timeout: 6000 });
  check("W3", "related: failed save shows 'Couldn't keep · Try again' ~4 s, then Keep", Math.abs(Date.now() - failAt - 4000) < 600, `${Date.now() - failAt} ms`);
  await page.unroute("**/api/agents/*/save");
  await page.route("**/api/agents/*/draft", (route) => route.fulfill({ status: 500, body: "{}" }));
  await typeInto("#f-name", "Tony X", { replace: true });
  await page.click(".sketch-head h2");
  await sleep(400);
  s = await snap();
  mark = Date.now();
  await page.fill("#message", "Hello");
  await page.press("#message", "Enter");
  await sleep(400);
  const s2 = await snap();
  check("C6", "H6 (simulated): failed hand save shows 'Not saved · Try again', Send retries and holds the turn", s.name.tag === "Not saved ·" && s.name.retry && s2.composer === "Hello" && count("POST", "/chat", mark) === 0 && s2.name.value === "Tony X", `${s.name.tag} retry=${s.name.retry}`);
  await page.unroute("**/api/agents/*/draft");
  await page.click('.draft-field[data-field="name"] .retry');
  await sleep(400);
  s = await snap();
  check("C6", "H6: Try again saves it", s.name.tag === "✓ saved");
  await page.fill("#message", "");

  await browser.close();
  await stopServer();
}

const BIO = `Mara Ellison kept the Brennock Point lighthouse on the north coast for twenty-six years, the last keeper before the light went automatic. She grew up in the harbour town below it, the daughter of a net mender and a schoolteacher, and she liked to say she learned patience from one and precision from the other. Her days had a fixed shape: up at four, trim and check the lamp, log the weather every three hours, walk the cliff path at dusk to look for boats that had stayed out too late. In fog she rang the bell by hand when the machine failed, sometimes for nine hours straight, and she never once complained about it in her logbooks. What she wrote instead were short notes about what she saw: a seal that came back every spring, a fishing crew that always waved, the exact colour of the sea before a gale. After the light was automated she moved into town and started teaching sailing to children, and later to adults who had decided late in life that they wanted to learn. Her students describe her as calm, dry and very direct. She doesn't flatter anyone. If you tie a bad knot she will tell you it is a bad knot and then show you, slowly, the right one, as many times as you need. She has a habit of answering a worried question with a practical one: "What can you check right now?" She believes most fear is just missing information, and that the cure is to go and look. She distrusts big speeches and motivational slogans. Her favourite phrase is "Keep the light trimmed", by which she means: do the small boring thing well, every day, and the big moments will take care of themselves. She reads old weather diaries for fun, drinks her tea far too strong, and keeps a list of every ship she ever helped guide home. She is warm underneath the bluntness, and people who stay with her long enough find that she remembers everything about them: their boat, their children's names, the storm that scared them. When someone is about to give up she tells them about the longest fog she ever rang through, and how the only way to get through it was one pull of the rope at a time. She is seventy-one now, still sails every morning the weather allows, and still writes one line in a logbook every night.`;

main()
  .catch(async (error) => {
    console.error("WALKTHROUGH ERROR", error);
    results.push({ id: "harness", line: "walkthrough crashed", ok: false, detail: error.message });
    await browser?.close().catch(() => {});
    await stopServer().catch(() => {});
  })
  .finally(async () => {
    await writeFile(new URL("./walkthrough-results.json", import.meta.url), JSON.stringify({ ranAt: new Date().toISOString(), timings, results, transcript }, null, 2));
    const failed = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failed.length}/${results.length} passed`);
    process.exit(failed.length ? 1 : 0);
  });
