// Block D: Talk. The talk (D1), First words (D2), Where from (D3), Past
// talks (D4), Not [Name] and the fix panel (D5), errors (D6).
// design-jony-block-D.md. Answers are scripted (demo.scripts); real P2
// agents get one marked demo line, never a fake answer.

import {
  P2, el, btn, store, nameOf, shortName, subj, when, dayMonth, nowIso, face, passagePanel, sheet, closeSheet,
  stream, wait, note, fileById,
} from "/components.js";
import { nav } from "/block-a.js";
import * as E from "/block-e.js";

const $ = (id) => document.getElementById(id);
let cur = null; // { a, talk } — talk.saved once it has a message
let side = "past"; // past | passage | fix
let passageFrom = null; // the source link that opened the passage (focus returns there)
let run = null; // { controller, firstWords } while an answer streams
let fix = null; // { msg, question, changed, log, a }
let query = "";
let prefill = null; // startTalkWith
let menuFor = null; // talk id whose ⋯ menu is open
let renaming = null; // talk id being renamed
let hit = null; // { talkId, text } to highlight after opening a search match
const realTalks = new Map(); // real agent id → talk (memory only)

// ── Shell ─────────────────────────────────────────────────────────────────

export function init() {
  const textarea = el("textarea", { id: "talk-msg", rows: 1, autocomplete: "off", "aria-label": "Message" });
  const send = el("button", { id: "talk-send", class: "send", type: "submit", "aria-label": "Send", disabled: true });
  send.innerHTML = $("send").innerHTML;
  const form = el("form", { id: "talk-form", class: "composer" }, textarea, send);
  const banner = el("div", { id: "talk-banner", class: "banner", role: "alert", hidden: true });
  $("talk").replaceChildren(
    el("section", "talk-main",
      el("div", { id: "talk-scroll", class: "chat-scroll" },
        el("div", "chat-col", el("div", { id: "talk-log", class: "log", role: "log", "aria-live": "polite" }))),
      el("div", "composer-wrap", banner, form)),
    el("aside", { id: "talk-side", class: "talk-side", "aria-label": "Past talks" }));

  form.addEventListener("submit", (e) => { e.preventDefault(); if (run && !run.firstWords) return stopRun(); sendFromComposer(); });
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!run) sendFromComposer(); }
  });
  textarea.addEventListener("input", () => {
    if (run?.firstWords) run.controller.abort(); // typing cancels the First words stream: shown in full
    grow(textarea);
    renderSend();
  });
  document.addEventListener("click", (e) => {
    if (menuFor && !e.target.closest(".row-menu, .row-more")) { menuFor = null; renderSide(); }
  });
}

const grow = (t) => { t.style.height = "auto"; t.style.height = `${Math.min(t.scrollHeight, 200)}px`; };

function renderSend() {
  const send = $("talk-send");
  const streaming = Boolean(run && !run.firstWords);
  send.classList.toggle("stop", streaming);
  send.setAttribute("aria-label", streaming ? "Stop" : "Send");
  send.disabled = !streaming && (!$("talk-msg").value.trim() || !store.online);
}

function renderBanner() {
  const b = $("talk-banner");
  if (!cur || store.online) { b.hidden = true; renderSend(); return; }
  const howto = el("p", { class: "howto", hidden: true }, "Agent Creator uses Claude Code on this computer. Install it, run ", el("code", "", "claude"), " once in a terminal to sign in, then press the button again.");
  const how = btn("How to fix ▸", () => { howto.hidden = !howto.hidden; how.textContent = `How to fix ${howto.hidden ? "▸" : "▾"}`; how.setAttribute("aria-expanded", String(!howto.hidden)); }, "link-btn quiet", { "aria-expanded": "false" });
  b.replaceChildren(el("p", "", `${shortName(cur.a)} can't reach Claude right now.`),
    el("div", "banner-row", el("span", "", "Your text stays here."), btn("Check again", () => onOnline(store.online), "link-btn"), how), howto);
  b.hidden = false;
  renderSend();
}

// ── Opening ───────────────────────────────────────────────────────────────

const blankTalk = (a) => ({ id: `${a.id}-t${Date.now().toString(36)}`, title: null, updatedAt: nowIso(), messages: [], saved: false });

export function openTalk(a, { talkId } = {}) {
  stopRun(true);
  closeSheet();
  fix = null;
  side = "past";
  query = "";
  menuFor = null;
  renaming = null;
  a.talks ??= [];
  let talk = talkId ? a.talks.find((t) => t.id === talkId) : null;
  if (talk) talk.saved = true;
  if (!talk && a.real) talk = realTalks.get(a.id) ?? null;
  talk ??= blankTalk(a);
  cur = { a, talk };
  $("talk-msg").placeholder = `Talk to ${shortName(a)}…`;
  $("talk-msg").value = prefill ?? "";
  prefill = null;
  grow($("talk-msg"));
  renderAll();
  scrollEnd();
  $("talk-msg").focus();
  if (!talkId && needsFirstWords(a)) firstWords(a);
  else if (a.real && !talk.messages.length) firstWords(a);
}

export function leaveTalk() {
  stopRun(true);
  fix = null;
  side = "past";
  cur = null;
}

export function newTalk() {
  if (!cur) return;
  stopRun(true);
  fix = null;
  side = "past";
  cur.talk = blankTalk(cur.a);
  $("talk-msg").value = "";
  renderAll();
  $("talk-msg").focus();
}

export function startTalkWith(a, text) {
  prefill = text;
  nav.open(a.id, "talk");
  if (prefill === null) return; // openTalk took it
  // Already on this talk screen (no reopen): just type it in.
  $("talk-msg").value = text;
  prefill = null;
  renderSend();
}

export function focusSearch() {
  if (side !== "past") closeSide();
  $("talk-search")?.focus();
}

export function escape() {
  if (menuFor || renaming) { menuFor = null; renaming = null; renderSide(); return true; }
  if (side !== "past") { closeSide(); return true; }
  if (query) { query = ""; renderSide(); $("talk-search")?.focus(); return true; }
  return false;
}

export function onOnline(online) {
  if (!cur) return;
  renderBanner();
  if (online && needsFirstWords(cur.a) && store.screen === "talk") firstWords(cur.a);
}

// The top bar face stays an outline until First words arrive (C5, X23).
export const outlineFace = (a) => Boolean(a && cur?.a === a && needsFirstWords(a));
const needsFirstWords = (a) => !a.real && a.firstWords && a.firstWords.at === null && Boolean(a.firstWords.line);

// ── D2 First words ────────────────────────────────────────────────────────

async function firstWords(a) {
  if (!store.online) { renderBanner(); return; } // no fake: the face stays an outline
  if (a.real) {
    const talk = cur.talk;
    talk.messages.push({ role: "agent", text: "(Demo) First words would be here.", mock: true });
    realTalks.set(a.id, talk);
    renderAll();
    return;
  }
  const talk = cur.talk;
  talk.title = "First words";
  talk.saved = true;
  talk.updatedAt = nowIso();
  if (!a.talks.includes(talk)) a.talks.push(talk);
  a.firstWords.at = nowIso();
  talk.messages.push({ role: "divider", text: `First words · ${dayMonth()}`, divider: { kind: "firstWords" } });
  renderAll();
  $("top-face").querySelector(".face")?.classList.add("fill-in"); // outline → filled, with the words
  $("talk-log").lastElementChild?.querySelector(".face")?.classList.add("fill-in");
  await streamAgent(a, { role: "agent", text: a.firstWords.line }, { firstWords: true });
}

// ── Sending and answers ───────────────────────────────────────────────────

function sendFromComposer() {
  const t = $("talk-msg");
  const text = t.value.trim();
  if (!text || !cur || run) return;
  if (!store.online) return renderBanner();
  t.value = "";
  grow(t);
  send(text);
}

async function send(text) {
  const { a, talk } = cur;
  talk.messages.push({ role: "user", text });
  talk.updatedAt = nowIso();
  if (!talk.saved && !a.real) { talk.saved = true; a.talks.push(talk); }
  if (a.real) realTalks.set(a.id, talk);
  renderAll();
  scrollEnd();
  const reply = answerFor(a, talk, text);
  const ok = await streamAgent(a, reply);
  if (ok && !talk.title) talk.title = reply.title ?? titleFrom(text);
  renderSide();
}

function answerFor(a, talk, text) {
  const m = text.toLowerCase();
  const name = shortName(a);
  if (a.real) return { role: "agent", text: `(Demo) ${name} would answer here.`, mock: true };
  const continued = store.demo.scripts.continued?.[talk.id];
  if (continued && !talk.continuedUsed) { talk.continuedUsed = true; return clean(a, continued); }
  const list = store.demo.scripts[a.id] ?? [];
  const s = list.find((x) => x.match.every((w) => m.includes(w)));
  if (!s) {
    return { role: "agent", text: `(Demo) ${name} would answer here. Try one of:`, mock: true, chips: list.slice(0, 4).map((x) => x.ask) };
  }
  let reply = s.reply;
  if (s.needs === "rex-money-sharp") reply = a.map.find((l) => l.id === "rex-money")?.level === "sharp" ? s.reply : s.before;
  if (s.fixed && a.fixed?.[s.id]) reply = s.fixed;
  return { ...clean(a, reply), scriptId: s.id, title: TITLES[s.id] };
}

const TITLES = {
  landlord: "Landlord call", quit: "Quitting the job", eat: "Food before a big day", morning: "Mornings",
  money: "The first rule of money", cofounder: "Telling my cofounder", raise: "Raising money", draft: "The first paragraph",
  subject: "A subject line", fiction: "A short story?", renew: "Gym contract", cap: "Liability caps", tax: "Tax", first: "Their number first",
};
const titleFrom = (text) => { const w = text.replace(/[?.!]+$/, "").split(/\s+/).slice(0, 4).join(" "); return w.charAt(0).toUpperCase() + w.slice(1); };

// New answers never cite a removed reference (E3).
function clean(a, reply) {
  const r = structuredClone(reply);
  if (r.sources) {
    r.sources = r.sources.filter((s) => !fileById(a, s.fileId)?.removed);
    if (!r.sources.length) { delete r.sources; r.ownView = true; }
  }
  return r;
}

async function streamAgent(a, message, { firstWords: fw = false } = {}) {
  const talk = cur.talk;
  const controller = new AbortController();
  run = { controller, firstWords: fw };
  renderSend();
  const node = agentNode(a, { ...message, text: "" }, { streaming: true });
  const say = node.querySelector(".say");
  say.append(el("span", "waiting", ""));
  $("talk-log").append(node);
  scrollEnd();
  const done = await stream(say, message.text, { signal: controller.signal, onTick: scrollEndIfNear });
  run = null;
  if (cur?.talk !== talk) return false;
  if (!done && !fw) { // Stopped: partial text goes, the bubble says so
    node.remove();
    const last = talk.messages.at(-1);
    if (last?.role === "user") last.error = "stopped";
    renderAll();
    return false;
  }
  talk.messages.push(message);
  talk.updatedAt = nowIso();
  renderAll();
  scrollEnd();
  if (!$("talk-msg").value) $("talk-msg").focus();
  return true;
}

function stopRun(silent = false) {
  if (!run) return;
  run.controller.abort();
  if (silent) run = null;
}

// ── Rendering the talk ────────────────────────────────────────────────────

function renderAll() {
  if (!cur) return;
  renderLog();
  renderSide();
  renderBanner();
  nav.renderTop();
}

function renderLog() {
  const { a, talk } = cur;
  const log = $("talk-log");
  const lastAgent = talk.messages.findLastIndex((m) => m.role === "agent");
  log.replaceChildren(...talk.messages.map((m, i) => {
    if (m.role === "divider") return divider(a, m);
    if (m.role === "user") return userNode(a, m, i);
    return agentNode(a, m, { latest: i === lastAgent, index: i });
  }));
  if (hit?.talkId === talk.id) {
    const node = [...log.querySelectorAll(".say, .bubble")].find((n) => n.textContent.toLowerCase().includes(hit.text));
    hit = null;
    if (node) { node.classList.add("hit"); node.scrollIntoView({ block: "center" }); setTimeout(() => node.classList.remove("hit"), 1000); }
  }
}

function userNode(a, m, i) {
  const node = el("div", "msg user", el("div", "who", "You"), el("div", "bubble", m.text));
  if (m.error === "stopped") {
    node.append(el("div", "turn-error neutral", "Stopped. · ", btn("Try again", () => retry(i), "link-btn")));
  } else if (m.error === "offline") {
    node.append(el("div", "turn-error", `${shortName(a)} can't reach Claude right now.`));
  }
  return node;
}

function retry(i) {
  const m = cur.talk.messages[i];
  if (!store.online) { m.error = "offline"; renderAll(); return renderBanner(); }
  delete m.error;
  renderAll();
  const reply = answerFor(cur.a, cur.talk, m.text);
  streamAgent(cur.a, reply).then((ok) => { if (ok && !cur.talk.title) cur.talk.title = reply.title ?? titleFrom(m.text); renderSide(); });
}

function agentNode(a, m, { latest = false, streaming = false, index } = {}) {
  const node = el("div", { class: `msg agent${latest ? " latest" : ""}${fix?.msg === m ? " fixing" : ""}` });
  node.append(el("div", "who", face(a, 24), " ", shortName(a) || nameOf(a)));
  const say = el("div", { class: "say", "data-mock": m.mock ? "" : undefined }, streaming ? "" : m.text);
  node.append(say);
  if (streaming) return node;
  if (m.chips?.length) {
    node.append(el("div", "talk-chips", ...m.chips.map((ask) => btn(ask, () => { const t = $("talk-msg"); t.value = ask; grow(t); renderSend(); t.focus(); }, "chip", { "data-mock": "" }))));
  }
  if (m.sources?.length) node.append(whereFrom(a, m));
  else if (m.ownView) node.append(el("p", "prov", `${shortName(a)}'s own view · no reference`));
  if (m.blankLineId) {
    const line = a.map?.find((l) => l.id === m.blankLineId);
    node.append(el("div", "blank-strip",
      el("span", "sr-only", "Only you see this: "),
      `Blank in what ${shortName(a)} knows · `,
      line ? btn("Add a reference for this", () => E.addForLine(a, line), "link-btn") : null));
  }
  if (!m.mock) {
    node.append(btn(`Not ${shortName(a)}`, () => openFix(a, m, index), "not-btn", { "aria-label": `Not ${shortName(a)}: fix this answer` }));
  }
  return node;
}

function whereFrom(a, m) {
  const parts = ["Where from · "];
  m.sources.forEach((r, i) => {
    if (i) parts.push(" · ");
    const file = fileById(a, r.fileId);
    const name = file?.name ?? r.fileId;
    if (file?.removed) parts.push(el("span", "", `${name} · removed`));
    else {
      const link = btn(`${name} · ${r.location}`, () => openPassage(a, r, link), "link-btn src-link", { "aria-label": `Source: ${name} at ${r.location}` });
      parts.push(link);
    }
  });
  return el("p", "prov", ...parts);
}

function divider(a, m) {
  if (m.divider?.kind !== "redrawn") return el("div", { class: "divider", role: "separator", "aria-label": m.text }, m.text);
  const box = el("div", "divider-box");
  const more = el("div", { class: "divider-more", hidden: !m.open },
    el("p", "patch", `+${m.divider.patch}`),
    btn("See the Sketch ↗", () => seeSketch(a), "link-btn"));
  const head = btn(m.text, () => { m.open = !m.open; more.hidden = !m.open; head.setAttribute("aria-expanded", String(m.open)); }, "divider as-btn", { "aria-expanded": String(Boolean(m.open)) });
  box.append(head, more);
  return box;
}

async function seeSketch(a) {
  await nav.open(a.id, "sketcher");
  if (P2.state.agent?.id === a.id) {
    P2.takeDraft({ ...P2.state.agent.draft, ...a.draft });
    const f = P2.fields.persona;
    f.tag.textContent = " from your talk";
    f.tag.className = "tag new";
    f.wrap.scrollIntoView({ block: "nearest" });
    P2.markUpdated("persona");
  }
}

const near = () => { const s = $("talk-scroll"); return s.scrollHeight - s.scrollTop - s.clientHeight < 80; };
const scrollEnd = () => { const s = $("talk-scroll"); s.scrollTop = s.scrollHeight; };
const scrollEndIfNear = () => { if (near()) scrollEnd(); };

// ── Right pane ────────────────────────────────────────────────────────────

function renderSide() {
  if (!cur) return;
  if (side === "past") renderPast();
  else if (side === "fix") renderFix();
}

function closeSide() {
  if (side === "fix") return closeFix();
  side = "past";
  renderSide();
  passageFrom?.isConnected ? passageFrom.focus() : $("talk-msg").focus();
  passageFrom = null;
}

// D3 Where from
function openPassage(a, r, link) {
  if (side === "fix") return; // the fix panel stays put; one panel at a time
  side = "passage";
  passageFrom = link;
  const panel = passagePanel(r, a, { close: true, onClose: closeSide, used: true });
  const host = $("talk-side");
  host.setAttribute("aria-label", "Passage");
  host.replaceChildren(panel);
  panel.querySelector("button")?.focus();
}

// D4 Past talks
function renderPast() {
  const { a, talk: open } = cur;
  const host = $("talk-side");
  host.setAttribute("aria-label", "Past talks");
  const head = el("div", "side-head", el("h2", "side-title", "Past talks"), el("span", "grow"), btn("New talk", newTalk, "link-btn"));
  const talks = [...(a.talks ?? [])].filter((t) => t.messages.length).sort((x, y) => y.updatedAt.localeCompare(x.updatedAt));
  const parts = [head];
  if (!talks.length) {
    parts.push(el("p", "side-empty", `Your talks with ${shortName(a)} will be here.`));
    host.replaceChildren(...parts);
    return;
  }
  if (talks.length >= 3) {
    const input = el("input", { id: "talk-search", class: "search", type: "search", placeholder: "Search past talks", "aria-label": "Search past talks", value: query, autocomplete: "off" });
    let t = 0;
    input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { query = input.value; renderList(list, talks, open); }, 150); });
    input.addEventListener("keydown", (e) => { if (e.key === "Escape" && input.value) { e.stopPropagation(); e.preventDefault(); input.value = ""; query = ""; renderList(list, talks, open); } });
    parts.push(input);
  }
  const list = el("ul", { class: "talk-list", role: "list" });
  renderList(list, talks, open);
  parts.push(list);
  host.replaceChildren(...parts);
  if (renaming) host.querySelector(".rename")?.focus();
}

function matchText(t, q) {
  for (const m of t.messages) {
    const i = m.text?.toLowerCase().indexOf(q) ?? -1;
    if (i >= 0) return { text: m.text, i };
  }
  return null;
}

function renderList(list, talks, open) {
  const q = query.trim().toLowerCase();
  const rows = [];
  for (const t of talks) {
    const byTitle = (t.title ?? "").toLowerCase().includes(q);
    const byText = q ? matchText(t, q) : null;
    if (q && !byTitle && !byText) continue;
    rows.push(talkRow(t, open, q && !byTitle ? byText : null, q));
  }
  if (!rows.length) list.replaceChildren(el("li", "side-empty", `No talks with "${query.trim()}".`));
  else list.replaceChildren(...rows);
}

function talkRow(t, open, match, q) {
  const { a } = cur;
  const li = el("li", { class: `talk-row${t === open ? " current" : ""}` });
  if (renaming === t.id) {
    const input = el("input", { class: "rename search", value: t.title ?? "", "aria-label": "Talk title" });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); t.title = input.value.trim() || t.title; renaming = null; renderSide(); }
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); renaming = null; renderSide(); }
    });
    input.addEventListener("blur", () => { if (renaming === t.id) { renaming = null; renderSide(); } });
    li.append(input);
    return li;
  }
  const preview = !t.title;
  const title = preview ? `${(t.messages.find((m) => m.role === "user")?.text ?? "").split(/\s+/).slice(0, 6).join(" ")}…` : t.title;
  const main = el("button", { class: "talk-open", "aria-current": t === open ? "true" : undefined, onclick: () => {
    if (match) hit = { talkId: t.id, text: q };
    openTalk(a, { talkId: t.id });
  } }, el("span", `talk-title${preview ? " muted" : ""}`, title), el("span", "talk-when", when(t.updatedAt)));
  li.append(main);
  if (match) {
    const s = Math.max(0, match.i - 24);
    const e = Math.min(match.text.length, match.i + q.length + 24);
    li.append(el("p", "talk-match", s ? "…" : "", match.text.slice(s, match.i), el("strong", "", match.text.slice(match.i, match.i + q.length)), match.text.slice(match.i + q.length, e), e < match.text.length ? "…" : ""));
  }
  const more = btn("⋯", (ev) => { ev.stopPropagation(); menuFor = menuFor === t.id ? null : t.id; renderSide(); }, "row-more icon-btn", { "aria-label": `More for ${title}`, "aria-haspopup": "menu", "aria-expanded": String(menuFor === t.id) });
  li.append(more);
  if (menuFor === t.id) {
    const menu = el("div", { class: "row-menu menu", role: "menu" },
      el("button", { role: "menuitem", onclick: () => { menuFor = null; renaming = t.id; renderSide(); } }, "Rename"),
      el("button", { role: "menuitem", onclick: () => { menuFor = null; deleteTalk(t); } }, "Delete…"));
    li.append(menu);
    queueMicrotask(() => menu.querySelector("button")?.focus());
  }
  return li;
}

function deleteTalk(t) {
  const { a } = cur;
  sheet({
    title: `Delete "${t.title ?? "this talk"}"?`,
    body: [el("p", "", `The talk goes. ${shortName(a)} stays as ${subj(a)} is.`)],
    actions: [
      btn("Cancel", () => closeSheet(), "btn", { "data-focus": "" }),
      btn("Delete", () => {
        a.talks = a.talks.filter((x) => x !== t);
        closeSheet();
        if (cur.talk === t) newTalk();
        else renderAll();
      }, "btn danger"),
    ],
  });
}

// ── D5 Not [Name]: the fix panel ──────────────────────────────────────────

function openFix(a, m, index) {
  if (run) return;
  const msgs = cur.talk.messages;
  const question = [...msgs.slice(0, index)].reverse().find((x) => x.role === "user")?.text ?? "";
  const f = store.demo.fixes[a.id];
  fix = {
    a, msg: m, index, question, changed: false,
    log: [{ role: "sketcher", text: f?.open ?? `You said this isn't ${shortName(a)}. What would ${subj(a)} say instead, or what's wrong with it?` }],
  };
  side = "fix";
  renderLog();
  renderFix();
  $("fix-msg")?.focus();
}

function pinned(text) {
  const s = text.match(/^.*?[.!?](\s|$)(.*?[.!?](\s|$))?/)?.[0]?.trim() ?? text;
  return s;
}

function renderFix() {
  const { a } = fix;
  const host = $("talk-side");
  host.setAttribute("aria-label", `Sketcher · fixing ${shortName(a)}`);
  const log = el("div", { class: "fix-log log", role: "log", "aria-live": "polite" }, ...fix.log.map((m) => {
    if (m.role === "user") return el("div", "msg user", el("div", "who", "You"), el("div", "bubble", m.text), m.error ? el("div", "turn-error", m.error) : null);
    const node = el("div", "msg sketcher", el("div", "who", "Sketcher"), el("div", "say", m.waiting ? el("span", "waiting", "Sketching… ") : el("p", "", m.text)));
    if (m.line) node.append(btn("Sketch: persona updated · from your talk ↗", () => seeSketch(a), "change-line"));
    return node;
  }));
  const t = el("textarea", { id: "fix-msg", rows: 1, placeholder: "Say what's wrong…", "aria-label": "Say what's wrong", autocomplete: "off" });
  const sendBtn = el("button", { class: "send", type: "submit", "aria-label": "Send", disabled: true });
  sendBtn.innerHTML = $("send").innerHTML;
  const form = el("form", "composer fix-composer", t, sendBtn);
  t.addEventListener("input", () => { grow(t); sendBtn.disabled = !t.value.trim(); });
  t.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  form.addEventListener("submit", (e) => { e.preventDefault(); const text = t.value.trim(); if (text) fixSend(text); });
  const example = store.demo.fixes[a.id]?.example;
  host.replaceChildren(el("section", "fix",
    el("div", "side-head", el("h2", "side-title", `Sketcher · fixing ${shortName(a)}`), el("span", "grow"), btn("✕", closeFix, "icon-btn", { "aria-label": "Close" })),
    el("blockquote", "pinned", el("span", "pinned-who", `${shortName(a)}:`), ` "${pinned(fix.msg.text)}"`),
    log,
    !fix.log.some((m) => m.role === "user") && example ? btn(example, () => { t.value = example; grow(t); sendBtn.disabled = false; t.focus(); }, "chip fix-example", { "data-mock": "" }) : null,
    form));
}

async function fixSend(text) {
  const { a } = fix;
  const f = fix;
  f.log.push({ role: "user", text });
  if (!store.online) {
    f.log.at(-1).error = "The Sketcher can't reach Claude right now.";
    renderFix();
    return;
  }
  const waiting = { role: "sketcher", waiting: true };
  f.log.push(waiting);
  renderFix();
  await wait(900);
  if (fix !== f) return;
  const script = store.demo.fixes[a.id];
  const patch = script?.patch ?? ` ${text.replace(/\s+$/, "")}`;
  const reply = script?.reply ?? `Got it. I've redrawn ${shortName(a)}.`;
  Object.assign(waiting, { waiting: false, text: reply, line: true });
  a.draft.persona = `${a.draft.persona.trim()}${patch}`;
  if (f.msg.scriptId) (a.fixed ??= {})[f.msg.scriptId] = true;
  f.changed = true;
  f.patch = patch;
  // X22: the fix turns are part of the Sketcher's chat, under a divider.
  note(a.id, { kind: "divider", text: `From your talk · "${shortQ(f.question)}"` });
  note(a.id, { kind: "user", text });
  note(a.id, { kind: "say", text: reply, lines: [{ text: "Sketch: persona updated · from your talk ↗", onClick: () => { P2.markUpdated("persona"); } }] });
  if (P2.state.agent?.id === a.id) P2.state.agent.draft = { ...P2.state.agent.draft, persona: a.draft.persona };
  renderFix();
  $("fix-msg")?.focus();
}

const shortQ = (q) => { if (q.length <= 22) return q; const cut = q.slice(0, 22); return `${cut.slice(0, cut.lastIndexOf(" ")).trim()}…`; };

function closeFix() {
  const f = fix;
  fix = null;
  side = "past";
  if (!f) return renderSide();
  if (f.changed) {
    const msgs = cur.talk.messages;
    const i = msgs.indexOf(f.msg);
    msgs.splice(i + 1, 0, { role: "divider", text: `${shortName(f.a)} was redrawn · persona updated`, divider: { kind: "redrawn", patch: f.patch } });
    const t = $("talk-msg");
    t.value = f.question;
    grow(t);
  }
  renderAll();
  if (f.changed) {
    const d = $("talk-log").querySelectorAll(".divider-box");
    d[d.length - 1]?.classList.add("fade-in");
  }
  $("talk-msg").focus();
}
