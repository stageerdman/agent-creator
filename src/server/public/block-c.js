// Block C: What [Name] knows. The map (C1), why this line (C2), empty (C3),
// while studying (C4), Likeness and References. design-jony-block-C.md.
// Grow (block E) leaves its marks on the agent: a.marks{lineId:{mark,quiz}},
// a.moved (line id shown first), a.likenessWas, a.removal{file,label}.

import { P2, el, btn, store, mapLine, passagePanel, refRow, refLink, shortName, nameOf } from "/components.js";
import * as B from "/block-b.js";
import * as D from "/block-d.js";
import * as E from "/block-e.js";

const $ = (id) => document.getElementById(id);
const ORDER = { sharp: 0, rough: 1, blank: 2 };
const ui = new Map(); // agentId → { refsOpen, groups:Set, lines:Set }
const uiOf = (a) => { if (!ui.has(a.id)) ui.set(a.id, { refsOpen: false, groups: new Set(), lines: new Set() }); return ui.get(a.id); };
let showing = null; // agent id whose map is on screen
let passage = null; // { a, r, line } while the passage panel replaces the map

export function init() {
  $("rs-sketch").addEventListener("click", () => showSketch());
  $("rs-knows").addEventListener("click", () => {
    const a = store.agents.find((x) => x.id === P2.state.agent?.id);
    if (a) showKnows(a);
    else showKnowsReal();
  });
}

export function escape() {
  if (passage) { back(); return true; }
  return false;
}

function select(knows) {
  $("rs-sketch").setAttribute("aria-selected", String(!knows));
  $("rs-knows").setAttribute("aria-selected", String(knows));
  $("knows").hidden = !knows;
  $("sketch-scroll").hidden = knows;
  if (P2.isNarrow?.()) P2.setView("sketch");
}

export function showSketch() {
  const a = showing && store.agents.find((x) => x.id === showing);
  if (a && (a.marks || a.moved || a.likenessWas !== undefined || a.removal)) a.marksStale = true;
  showing = null;
  passage = null;
  $("rs-sketch").setAttribute("aria-selected", "true");
  $("rs-knows").setAttribute("aria-selected", "false");
  $("knows").hidden = true;
  $("sketch-scroll").hidden = false;
}

export function showKnows(a) {
  if (a.marksStale) { // marks stay until the next visit (C1, E2, E3)
    delete a.marks; delete a.moved; delete a.likenessWas; delete a.removal; delete a.marksStale;
  }
  showing = a.id;
  passage = null;
  select(true);
  renderKnows(a);
  $("knows").scrollTop = 0;
}

export const showingKnows = (a) => showing === a?.id && !$("knows").hidden;

// A real P2 agent: no references in the prototype, so C3 in plain words.
function showKnowsReal() {
  showing = null;
  select(true);
  const name = nameOf(P2.state.agent) ? shortName(P2.state.agent) : "It";
  $("knows").replaceChildren(el("p", "knows-empty", `${name} knows only what's in the Sketch.`));
}

export function showPassage(a, r, line) {
  if (!showingKnows(a)) { showing = a.id; select(true); }
  passage = { a, r, line };
  const panel = passagePanel(r, a, { back: `What ${shortName(a)} knows`, onBack: back, behind: line?.text });
  $("knows").replaceChildren(panel);
  panel.querySelector("button")?.focus();
}

function back() {
  const { a, line } = passage;
  passage = null;
  renderKnows(a);
  if (line) $("knows").querySelector(`[data-line="${line.id}"] .refs-toggle`)?.focus();
}

// ── C1 render ─────────────────────────────────────────────────────────────

export function renderKnows(a) {
  if (passage || showing !== a.id) return;
  const host = $("knows");
  const name = shortName(a);
  const parts = [el("p", "knows-only", `Only you see this. ${name} doesn't.`)];

  if (a.make?.phase === "laid") {
    host.replaceChildren(...parts, B.piles(a));
    return;
  }

  const s = a.study;
  const studyingFirst = s && s.state !== "finished" && !(a.map ?? []).length;
  if (studyingFirst) {
    const fi = s.firstImpressions;
    if (a.topUp) {
      parts.push(el("p", "knows-quiet", "The map comes when studying is done."));
    } else if (fi?.map?.length && s.done >= 20) {
      parts.push(el("h3", "knows-h", `What ${name} knows · first impressions · from 20 of ${s.total}`));
      parts.push(el("div", { class: "map", role: "list" }, ...fi.map.map((l) => mapLine(l, a, { faded: true }))));
      parts.push(el("p", "knows-quiet", "Likeness comes when studying is done."));
    } else {
      parts.push(el("p", "knows-quiet", "First impressions after about 20 files."));
    }
    host.replaceChildren(...parts);
    return;
  }

  if (!(a.map ?? []).length) {
    if (a.references?.packed) parts.push(packedRow(a));
    else {
      parts.push(el("p", "knows-empty", `${name} knows only what's in the Sketch.`, el("br"), `Add references to teach ${pronounOf(a)} more.`),
        el("div", "knows-actions", btn("Add references", () => E.topUp(a), "btn primary")));
    }
    host.replaceChildren(...parts);
    return;
  }

  parts.push(renderMap(a));
  if (a.likeness) parts.push(renderLikeness(a));
  parts.push(renderReferences(a));
  host.replaceChildren(...parts);
  if (a.arrive) {
    const map = host.querySelector(".map");
    map.classList.add("arrive");
    setTimeout(() => map.classList.remove("arrive"), 700);
    delete a.arrive;
  }
}

const pronounOf = (a) => ({ rex: "him", marcus: "him" })[a.id] ?? (["ines", "edie", "juno"].includes(a.id) ? "her" : "it");

function sortedMap(a) {
  const lines = [...a.map].sort((x, y) => ORDER[x.level] - ORDER[y.level] || (y.refs?.length ?? 0) - (x.refs?.length ?? 0));
  if (a.moved) {
    const i = lines.findIndex((l) => l.id === a.moved);
    if (i > 0) lines.unshift(...lines.splice(i, 1));
  }
  return lines;
}

function renderMap(a) {
  const state = uiOf(a);
  const map = el("div", { class: "map", role: "list" });
  for (const line of sortedMap(a)) {
    const m = a.marks?.[line.id];
    const quiz = m?.quiz ? btn(`Ask ${shortName(a)} about it: "${m.quiz}"`, () => D.startTalkWith(a, m.quiz), "link-btn quiz") : null;
    const row = mapLine(line, a, {
      onRef: (r) => showPassage(a, r, line),
      onAdd: (l) => E.addForLine(a, l),
      mark: m?.mark,
      extra: quiz,
    });
    row.setAttribute("role", "listitem");
    row.style.setProperty("--g", ORDER[line.level]);
    if (m?.redraw) row.classList.add("redraw");
    const toggle = row.querySelector(".refs-toggle");
    if (toggle) {
      toggle.setAttribute("aria-label", `${line.level[0].toUpperCase()}${line.level.slice(1)}. ${line.text}. ${line.refs.length} ${line.refs.length === 1 ? "reference" : "references"}.`);
      toggle.addEventListener("click", () => { if (state.lines.has(line.id)) state.lines.delete(line.id); else state.lines.add(line.id); });
      if (state.lines.has(line.id)) toggle.click(), state.lines.add(line.id);
    }
    map.append(row);
  }
  if (a.marks) for (const m of Object.values(a.marks)) delete m.redraw; // the redraw plays once
  return map;
}

function renderLikeness(a) {
  const l = a.likeness;
  const box = el("section", "likeness", el("h3", "knows-h", "Likeness"));
  for (const reason of l.reasons) {
    box.append(el("div", "reason",
      el("span", { class: "reason-mark", "aria-hidden": "true" }, reason.good ? "✓" : "–"),
      el("span", "sr-only", reason.good ? "matches: " : "not yet: "),
      el("span", "", reason.text),
      reason.ref ? el("div", "reason-ref", refLink(reason.ref, a, () => showPassage(a, reason.ref, { id: null, text: reason.text }))) : null));
  }
  if (l.example) {
    box.append(el("div", "reason example", el("span", "", `Example: "${l.example.text}"`),
      el("div", "reason-ref", refLink(l.example.ref, a, () => showPassage(a, l.example.ref, { id: null, text: `Example: "${l.example.text}"` })))));
  }
  box.append(el("p", "rating", `${l.rating} of 10${a.likenessWas !== undefined && a.likenessWas !== l.rating ? ` · was ${a.likenessWas}` : ""}`));
  return box;
}

function packedRow(a) {
  const p = a.references.packed;
  return el("section", "refs-section", el("p", "refs-row", `${p.label} · ${p.size}`));
}

function renderReferences(a) {
  if (a.references?.packed) return packedRow(a);
  const state = uiOf(a);
  const refs = a.references;
  const live = refs.files.filter((f) => !f.removed);
  const hard = live.filter((f) => f.ease === "hard");
  const removedCount = refs.files.length - live.length;
  const total = refs.total - removedCount;
  const section = el("section", "refs-section");
  if (a.removal) {
    const undo = btn("Undo", () => E.undoRemove(a), "link-btn");
    section.append(el("p", { class: "removal", "aria-live": "polite" }, `Removed. ${shortName(a)} no longer uses ${a.removal.what ?? `"${a.removal.label}"`}. · `, undo));
    queueMicrotask(() => { if (a.removal?.focus) { undo.focus(); a.removal.focus = false; } });
  }
  const label = () => `References · ${total}${hard.length ? ` · ${hard.length} hard to study` : ""} ${state.refsOpen ? "▾" : "▸"}`;
  const toggle = btn(label(), () => { state.refsOpen = !state.refsOpen; renderKnows(a); }, "link-btn quiet refs-row", { "aria-expanded": String(state.refsOpen) });
  section.append(toggle);
  if (a.studiedAt && !(a.study && a.study.state !== "finished")) {
    const studied = a.study?.state === "finished" && a.study.studied ? a.study.studied : total;
    section.append(el("p", "knows-quiet", `${studied} references · studied ${a.studiedAt}`));
  }
  if (!state.refsOpen) return section;

  const remove = (file) => E.removeFile(a, file);
  const body = el("div", "refs-body");
  for (const f of hard) body.append(refRow(f, a, { onRemove: remove }));
  if (refs.flat || !refs.groups.length) {
    for (const f of live.filter((x) => x.ease !== "hard")) body.append(refRow(f, a, { onRemove: remove }));
  } else {
    for (const [pile, title] of [["knows", `What ${shortName(a)} knows`], ["sounds", `How ${shortName(a)} sounds`]]) {
      const groups = refs.groups.filter((g) => g.pile === pile && !g.removed);
      if (!groups.length) continue;
      const box = el("div", "pile", el("h4", "pile-h", title));
      for (const g of groups) {
        const files = live.filter((f) => f.folder === g.name && f.ease !== "hard");
        const open = state.groups.has(g.id);
        const row = el("div", "ref-row group",
          btn(`${g.name} · ${g.count} ${open ? "▾" : "▸"}`, () => { if (open) state.groups.delete(g.id); else state.groups.add(g.id); renderKnows(a); }, "link-btn quiet", { "aria-expanded": String(open) }),
          el("span", "ref-size", g.size),
          btn("Remove", () => E.removeGroup(a, g), "link-btn quiet", { title: `${shortName(a)} stops using it. The files stay on your Mac.` }));
        box.append(row);
        if (open) for (const f of files) box.append(el("div", "indent", refRow(f, a, { onRemove: remove })));
      }
      body.append(box);
    }
  }
  if (refs.aside?.length) {
    const list = el("ul", "aside-list", ...refs.aside.map((x) => el("li", "", `${x.name} · ${x.reason}`)));
    list.hidden = true;
    const n = refs.asideCount ?? refs.aside.length;
    const t = btn(`Set aside · ${n} · why ▸`, () => { list.hidden = !list.hidden; t.textContent = `Set aside · ${n} · why ${list.hidden ? "▸" : "▾"}`; }, "link-btn quiet");
    body.append(el("div", "", t, list));
  }
  section.append(body);
  return section;
}
