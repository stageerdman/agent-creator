// Shared parts for blocks A–F (blocks-jony.md §5, C1–C15) plus the demo
// store and a tiny event bus. Zero dependencies. The P2 Sketcher (app.js)
// registers itself on window.ACP2; its hooks live on window.ACHooks.

import { fileEntries } from "/sketch.js";

export const P2 = (window.ACP2 ??= {});
export const hooks = (window.ACHooks ??= {});

// ── DOM helper ────────────────────────────────────────────────────────────
// el("p", "cls", "text", child, …) · el("button", { class, onclick, … }, …)
export function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  if (typeof attrs === "string") node.className = attrs;
  else if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else if (key === "text") node.textContent = value;
      else if (key === "style") node.style.cssText = value;
      else node.setAttribute(key, value === true ? "" : value);
    }
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  if (tag === "button" && !node.hasAttribute("type")) node.type = "button";
  return node;
}

export const btn = (label, onclick, cls = "link-btn", extra = {}) => el("button", { class: cls, onclick, ...extra }, label);

// Drawn, not typed: "✕" isn't in the system font, so each engine picks its own fallback size.
const SVG = "http://www.w3.org/2000/svg";
export function closeBtn(onclick, label = "Close") {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "0 0 12 12");
  svg.setAttribute("class", "i-close");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(SVG, "path");
  path.setAttribute("d", "M1.5 1.5l9 9M10.5 1.5l-9 9");
  svg.append(path);
  return btn(svg, onclick, "icon-btn", { "aria-label": label });
}

// ── Bus ───────────────────────────────────────────────────────────────────
const listeners = {};
export const bus = {
  on(name, fn) { (listeners[name] ??= []).push(fn); },
  emit(name, data) { for (const fn of listeners[name] ?? []) fn(data); },
};

// ── Store ─────────────────────────────────────────────────────────────────
export const store = {
  demo: null, // the whole /mock/demo payload (scripts, fixes, lines…)
  agents: [], // mock agents, mutated in memory
  real: [], // real agents from /api/agents
  templates: {}, // pristine copies (Start UJ2 fresh)
  online: true,
  screen: "home", // home | sketcher | talk
  current: null, // agent id
  talkId: null,
  notes: {}, // agentId → [ { kind, text, … } ] waiting for the Sketcher chat
  deleted: new Set(),
};

export async function loadStore() {
  const [demo, real] = await Promise.all([
    fetch("/mock/demo").then((r) => r.json()),
    fetch("/api/agents").then((r) => (r.ok ? r.json() : [])).catch(() => []),
  ]);
  store.demo = demo;
  store.agents = demo.agents.map((a) => ({ ...a, mock: true }));
  store.templates = Object.fromEntries(demo.agents.map((a) => [a.id, structuredClone(a)]));
  store.real = real;
  store.notes = {};
  bus.emit("store");
}

export async function refreshReal() {
  store.real = await fetch("/api/agents").then((r) => (r.ok ? r.json() : [])).catch(() => []);
}

export const mockAgent = (id) => store.agents.find((a) => a.id === id);
export const isMock = (id) => Boolean(mockAgent(id));
export const nameOf = (a) => a?.draft?.name?.trim() || "";
// Before the name lands, a laid-out folder (`Ines Duarte – The Quiet Deal`) names the person (B2).
export const shortName = (a) => nameOf(a).split(" ")[0] || a?.references?.root?.split(/ [–-] /)[0]?.split(" ")[0] || "it";
export const fileById = (a, id) => a.references.files.find((f) => f.id === id) ?? (id === store.demo?.extras.moneyFile.id ? store.demo.extras.moneyFile : null);

export function note(agentId, entry) { (store.notes[agentId] ??= []).push(entry); }

// ── Time words: today / yesterday / weekday / 18 Nov ──────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function when(iso) {
  if (!iso) return "";
  const today = new Date(`${store.demo?.today ?? "2026-11-25"}T12:00:00`);
  const d = new Date(iso);
  const days = Math.round((new Date(d.toDateString()) - new Date(today.toDateString())) / 864e5);
  if (days >= 0) return "today";
  if (days === -1) return "yesterday";
  if (days > -7) return DAYS[d.getDay()];
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
export const dayMonth = (iso) => { const d = iso ? new Date(iso) : new Date(`${store.demo.today}T12:00:00`); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const nowIso = () => `${store.demo?.today ?? "2026-11-25"}T${new Date().toTimeString().slice(0, 8)}`;
export const firstSentence = (text = "") => (text.match(/^.*?[.!?](\s|$)/)?.[0] ?? text).trim();

// ── C5 Face ───────────────────────────────────────────────────────────────
export function face(a, size = 40, { outline = false, onclick, label } = {}) {
  const f = a?.face;
  const name = nameOf(a);
  const wrap = el(onclick ? "button" : "span", {
    class: `face${outline || !a?.keptAt && !f?.src ? " outline" : ""}`,
    style: `--s:${size}px`, onclick, "aria-label": label, "aria-hidden": label ? undefined : "true",
  });
  if (f?.src && f.kind !== "letter") wrap.append(el("img", { src: f.src, alt: "" }));
  else wrap.append(el("span", "face-letter", name.charAt(0).toUpperCase() || ""));
  return wrap;
}

// ── C6 Map line ───────────────────────────────────────────────────────────
const LEVEL = { sharp: "Sharp", rough: "Rough", blank: "Blank" };
export function mapLine(line, a, { onRef, onAdd, faded = false, mark, extra } = {}) {
  const row = el("div", { class: `map-line ${line.level}${faded ? " faded" : ""}`, "data-line": line.id });
  const refs = line.refs ?? [];
  const head = el("div", "map-head", el("span", `level ${line.level}`, LEVEL[line.level]), el("span", "map-text", line.text));
  row.append(head);
  if (refs.length) {
    const list = el("div", "map-refs");
    list.hidden = true;
    for (const r of refs) list.append(refLink(r, a, () => onRef?.(r, line)));
    const toggle = btn(`${refs.length} ${refs.length === 1 ? "ref" : "refs"} ▸`, () => {
      list.hidden = !list.hidden;
      toggle.textContent = `${refs.length} ${refs.length === 1 ? "ref" : "refs"} ${list.hidden ? "▸" : "▾"}`;
      toggle.setAttribute("aria-expanded", String(!list.hidden));
    }, "link-btn quiet refs-toggle", { "aria-expanded": "false" });
    head.append(toggle);
    row.append(list);
  }
  if (line.level === "rough" && line.roughReason && refs.length <= 1) row.append(el("p", "map-why", line.roughReason));
  if (mark) row.append(el("p", "map-mark", mark));
  if (line.level === "blank" && onAdd) row.append(btn("Add a reference for this", () => onAdd(line), "link-btn"));
  if (extra) row.append(extra);
  return row;
}

export function refLink(r, a, onclick) {
  const file = fileById(a, r.fileId);
  const removed = file?.removed;
  return btn(`${file?.name ?? r.fileId}${removed ? " · removed" : ""} · ${r.location}`, onclick, "link-btn ref-link", { "data-mock": "" });
}

// ── C7 Passage panel ──────────────────────────────────────────────────────
export function passagePanel(r, a, { back, onBack, close, onClose, behind, used } = {}) {
  const file = fileById(a, r.fileId);
  const panel = el("section", { class: "passage", "aria-label": "Passage" });
  const head = el("div", "passage-head");
  if (back) head.append(btn(`← ${back}`, onBack, "link-btn quiet"));
  if (close) head.append(el("span", "grow"), closeBtn(onClose));
  panel.append(head);
  if (behind) panel.append(el("p", "passage-behind", `Behind: ${behind}`));
  if (used) panel.append(el("p", "passage-behind", "Used in this answer"));
  panel.append(el("p", "passage-file", `${file?.name ?? r.fileId}${file?.removed ? " · removed" : ""} · ${r.location}`));
  const [s, e] = r.span;
  panel.append(el("blockquote", { class: "passage-text", "data-mock": "" }, r.passage.slice(0, s), el("mark", "", r.passage.slice(s, e)), r.passage.slice(e)));
  return panel;
}

// ── C8 What [Name] knows · only you see this ──────────────────────────────
export function c8Surface(a, { onOpen } = {}) {
  const map = a.map ?? [];
  const pick = (level) => map.find((l) => l.level === level);
  const rows = [pick("sharp"), pick("rough"), pick("blank")].filter(Boolean);
  const inner = [el("p", "c8-title", `What ${shortName(a)} knows · only you see this`)];
  if (!rows.length) {
    inner.push(el("p", "c8-empty", `${shortName(a)} knows only what's in the Sketch. Add references to teach ${pronoun(a)} more.`));
    return el("div", "c8", ...inner);
  }
  for (const l of rows) inner.push(el("p", "c8-row", el("span", `level ${l.level}`, LEVEL[l.level]), " ", l.text));
  return el("button", { class: "c8 c8-btn", onclick: onOpen }, ...inner);
}

export const pronoun = (a) => ({ rex: "him", marcus: "him" })[a.id] ?? (["ines", "edie", "juno"].includes(a.id) ? "her" : "it");
export const subj = (a) => ({ rex: "he", marcus: "he" })[a.id] ?? (["ines", "edie", "juno"].includes(a.id) ? "she" : "it");

// ── C9 Study block ────────────────────────────────────────────────────────
export function studyBlock(a, { onStop, onResume, onCheck, onAside } = {}) {
  const s = a.study;
  const box = el("div", { class: "study", role: "status" });
  if (!s) return box;
  if (s.state === "studying") {
    box.append(el("p", "study-line", s.resumed ? `Picked up where it left off · ${s.done} of ${s.total}` : `Studying · ${s.current} (${s.stage}) · ${s.done} of ${s.total}`));
    const slow = s.stage === "listening" ? " · listening is the slow part" : "";
    box.append(el("p", "study-sub", `about ${s.etaMin} min left${slow} · you can close the app, it keeps going`, " ", btn("Stop", onStop, "link-btn")));
  } else if (s.state === "stopped") {
    box.append(el("p", "study-line", `Stopped · ${s.done} of ${s.total} studied · `, btn("Study the rest", onResume, "link-btn")));
  } else if (s.state === "paused") {
    box.append(el("p", "study-line warn", "Studying paused · Claude isn't reachable · ", btn("Check again", onCheck, "link-btn")));
  } else if (s.state === "finished") {
    const list = el("ul", "aside-list");
    list.hidden = true;
    for (const x of s.aside ?? []) list.append(el("li", "", `${x.name} · ${x.reason}`));
    const asideCount = s.asideCount ?? (s.aside ?? []).length;
    const toggle = asideCount ? btn(`${asideCount} set aside ▸`, () => { list.hidden = !list.hidden; toggle.textContent = `${asideCount} set aside ${list.hidden ? "▸" : "▾"}`; onAside?.(); }, "link-btn quiet") : null;
    box.append(el("p", "study-line done", `Finished studying · ${s.studied} ${s.studied === 1 ? "reference" : "references"} studied`, toggle && " · ", toggle), list);
  }
  return box;
}

// ── C10 Sheet ─────────────────────────────────────────────────────────────
let openSheetState = null;
export function sheet({ title, body = [], actions = [], onClose, wide = false, label }) {
  closeSheet();
  const host = document.getElementById("sheet");
  const card = el("div", { class: `sheet-card${wide ? " wide" : ""}`, role: "dialog", "aria-modal": "true", "aria-label": label ?? title });
  if (title) card.append(el("h2", "sheet-title", title));
  card.append(...body.flat().filter(Boolean));
  if (actions.length) card.append(el("div", "sheet-actions", ...actions));
  host.replaceChildren(el("div", { class: "sheet-scrim", onclick: () => closeSheet() }), card);
  host.hidden = false;
  const previous = document.activeElement;
  openSheetState = { onClose, previous, card };
  (card.querySelector("[data-focus]") ?? card.querySelector("button, input, textarea"))?.focus();
  return card;
}
export function closeSheet() {
  if (!openSheetState) return;
  const { onClose, previous } = openSheetState;
  openSheetState = null;
  const host = document.getElementById("sheet");
  host.hidden = true;
  host.replaceChildren();
  onClose?.();
  previous?.focus?.();
}
export const sheetOpen = () => Boolean(openSheetState);

// ── Mock picker (the prototype's stand-in for the macOS open panel) ────────
export function picker(title, items, onPick) {
  sheet({
    title, label: title,
    body: [el("p", "sheet-note", "Demo: pick one of these."), el("div", "picker", ...items.map((it) =>
      el("button", { class: "picker-row", "data-mock": "", onclick: () => { closeSheet(); onPick(it); } },
        el("span", "picker-name", it.name), el("span", "picker-detail", it.detail ?? ""))))],
    actions: [btn("Cancel", () => closeSheet(), "btn", { "data-focus": "" })],
  });
}

// ── C12 Reference row ─────────────────────────────────────────────────────
export function refRow(file, a, { onRemove } = {}) {
  const row = el("div", `ref-row${file.ease === "hard" ? " hard" : ""}`);
  row.append(el("span", "ref-name", file.name), el("span", "ref-size", file.size ?? ""));
  if (onRemove) row.append(btn("Remove", () => onRemove(file), "link-btn quiet", { title: `${shortName(a)} stops using it. The file stays on your Mac.` }));
  if (file.ease === "hard") row.append(el("p", "ref-why", `Hard to study · ${file.easeReason}`));
  else if (file.ease === "easy") row.append(el("p", "ref-why", "Easy to study"));
  return row;
}

// ── C13 Palette strip ─────────────────────────────────────────────────────
export function paletteStrip(palette, { filled, small = false, titles = false } = {}) {
  const total = palette.reduce((n, p) => n + p.share, 0) || 1;
  const band = el("div", `palette-band${small ? " small" : ""}`);
  palette.forEach((p, i) => {
    const on = !filled || filled.has(p.id);
    band.append(el("span", { class: `seg${on ? "" : " off"}`, style: `flex:${p.share / total};background:${p.colour};--i:${i}`, title: `${p.label} · ${p.detail}` }));
  });
  if (!titles) return band;
  const legend = el("div", "palette-legend", ...palette.map((p) => el("div", "legend-row", el("span", { class: "swatch", style: `background:${p.colour}` }), el("strong", "", p.label), " ", el("span", "muted", p.detail))));
  return el("div", "", band, legend);
}

// ── C14 Demo pill ─────────────────────────────────────────────────────────
export function demoPill(items) {
  const wrap = el("div", "demo");
  const pop = el("div", { class: "demo-pop", role: "menu", hidden: true });
  const pill = btn("Demo", () => { pop.hidden = !pop.hidden; pill.setAttribute("aria-expanded", String(!pop.hidden)); if (!pop.hidden) render(); }, "demo-pill", { "aria-expanded": "false", "aria-haspopup": "menu" });
  const render = () => pop.replaceChildren(...items().map((it) => it === "-" ? el("hr") : it instanceof Node ? it
    : el("button", { class: "demo-item", role: "menuitem", disabled: it.disabled, onclick: () => { if (!it.keepOpen) pop.hidden = true; it.run(); if (it.keepOpen) render(); } }, it.label)));
  // composedPath is fixed at dispatch, so a menu item re-rendered by its own click still counts as inside.
  document.addEventListener("click", (e) => { if (!e.composedPath().includes(wrap)) pop.hidden = true; });
  pop.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); pop.hidden = true; pill.focus(); } });
  wrap.append(pill, pop);
  return wrap;
}

// ── C15 Drop overlay ──────────────────────────────────────────────────────
export function dropOverlay({ target, onDrop }) {
  const overlay = el("div", { class: "drop", hidden: true, "aria-hidden": "true" });
  document.body.append(overlay);
  let depth = 0;
  const show = (event) => {
    const names = [...(event.dataTransfer?.items ?? [])].map((i) => i.getAsFile?.()?.name ?? "");
    const zip = names.some((n) => n.endsWith(".agent.zip"));
    const t = target();
    overlay.replaceChildren(zip
      ? el("p", "drop-big", "Drop · import this agent")
      : el("div", "", el("p", "drop-big", "Drop · your files stay on this Mac"), el("p", "drop-sub", "They go into the DNA · tell the Sketcher what each is for"), t && el("p", "drop-for", t)));
    overlay.hidden = false;
    document.body.classList.toggle("dragging", !zip);
  };
  const hide = () => { overlay.hidden = true; document.body.classList.remove("dragging"); };
  addEventListener("dragenter", (e) => { e.preventDefault(); depth += 1; if (depth === 1) show(e); });
  addEventListener("dragover", (e) => e.preventDefault());
  addEventListener("dragleave", () => { depth = Math.max(0, depth - 1); if (!depth) hide(); });
  addEventListener("drop", (e) => {
    e.preventDefault();
    depth = 0;
    hide();
    // Entries must be taken now: the browser empties dataTransfer once the handler returns.
    const roots = [...(e.dataTransfer?.items ?? [])].map((i) => i.webkitGetAsEntry?.()).filter(Boolean);
    const loose = roots.length ? null : fileEntries(e.dataTransfer?.files);
    (loose ? Promise.resolve(loose) : Promise.all(roots.map(walkEntry)).then((lists) => lists.flat()))
      .then(onDrop, (error) => toast(`Couldn't read the drop: ${error.message}`, null, { error: true }));
  });
  return overlay;
}

// A dropped folder arrives as a tree of entries; its files keep their path inside it.
async function walkEntry(entry) {
  if (entry.isFile) {
    const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
    return [{ path: entry.fullPath.replace(/^\//, ""), size: file.size }];
  }
  const children = await readAll(entry.createReader());
  return (await Promise.all(children.map(walkEntry))).flat();
}

// readEntries hands out a folder in batches (100 in Chromium/WebKit) until an empty one.
async function readAll(reader) {
  const all = [];
  for (;;) {
    const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
    if (!batch.length) return all;
    all.push(...batch);
  }
}

// ── Streaming text (D: 400 ms, then ~40 chars / 50 ms) ────────────────────
export async function stream(node, text, { signal, onTick } = {}) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  await wait(reduce ? 0 : 400);
  if (reduce) { node.textContent = text; return true; }
  for (let i = 0; i < text.length; i += 40) {
    if (signal?.aborted) return false;
    node.textContent = text.slice(0, i + 40);
    onTick?.();
    await wait(50);
  }
  node.textContent = text;
  return true;
}
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function toast(text, action, { error = false } = {}) {
  const host = document.getElementById("toast");
  const t = el("div", { class: error ? "toast is-error" : "toast", role: "status" }, text, action && " · ", action);
  host.replaceChildren(t);
  clearTimeout(host.timer);
  host.timer = setTimeout(() => t.remove(), 8000);
  return t;
}
