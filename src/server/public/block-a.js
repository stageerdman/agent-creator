// Block A: the shell. Home (A1), first run (A2), delete (A3), the opening
// rule, the top bar, the Demo pill and the keys. design-jony-block-A.md.

import {
  P2, hooks, el, btn, bus, store, loadStore, refreshReal, mockAgent, isMock, nameOf, shortName, when,
  firstSentence, face, sheet, closeSheet, sheetOpen, demoPill, dropOverlay, nowIso, picker,
} from "/components.js";
import * as B from "/block-b.js";
import * as C from "/block-c.js";
import * as D from "/block-d.js";
import * as E from "/block-e.js";
import * as F from "/block-f.js";

const $ = (id) => document.getElementById(id);

// ── Navigation ────────────────────────────────────────────────────────────

export const nav = {
  home: goHome,
  open: openAgent,
  mode: setMode,
  newAgent: newAgentFlow,
  renderTop,
  renderHome,
  current: () => (store.current ? mockAgent(store.current) ?? realAgent(store.current) : null),
};

function setScreen(screen) {
  store.screen = screen;
  document.body.dataset.screen = screen;
  renderTop();
}

function goHome() {
  closeSheet();
  P2.closeMenu?.();
  D.leaveTalk();
  store.current = null;
  setScreen("home");
  renderHome();
  $("home").querySelector("button")?.focus();
}

const realAgent = (id) => {
  const row = store.real.find((r) => r.id === id);
  return row ? { id: row.id, real: true, draft: row.draft, updatedAt: row.updatedAt, keptAt: row.draft?.status === "saved" ? row.updatedAt : null, talks: [], map: [] } : null;
};

async function openAgent(id, mode, { talkId } = {}) {
  closeSheet();
  const a = mockAgent(id);
  store.current = id;
  if (a) {
    mode ??= a.keptAt ? "talk" : "sketcher";
    if (mode === "talk") {
      setScreen("talk");
      D.openTalk(a, { talkId });
      a.openedAt = nowIso();
      return;
    }
    a.openedAt ??= nowIso();
    D.leaveTalk();
    setScreen("sketcher");
    if (P2.state.agent?.id !== id) await P2.loadAgent(id);
    else B.afterLoad(P2.state.agent);
    return;
  }
  // A real agent: the P2 Sketcher with the real CLI. Talk is one marked demo line.
  const real = realAgent(id) ?? { id, real: true };
  if (mode === "talk") {
    setScreen("talk");
    D.openTalk(real, {});
    return;
  }
  D.leaveTalk();
  setScreen("sketcher");
  await P2.loadAgent(id);
}

function setMode(mode) {
  const a = nav.current();
  if (!a || !(a.keptAt || a.draft?.status === "saved")) return;
  openAgent(a.id, mode);
}

// A2 first run (and every + New agent): the P2 empty state plus the references door.
async function newAgentFlow() {
  closeSheet();
  D.leaveTalk();
  const id = await P2.newAgent().catch(() => null);
  if (!id) return;
  await refreshReal();
  store.current = id;
  setScreen("sketcher");
}

// ── Top bar ───────────────────────────────────────────────────────────────

function renderTop() {
  const a = store.screen === "home" ? null : nav.current();
  const kept = Boolean(a && (a.keptAt || a.draft?.status === "saved"));
  $("top-face").replaceChildren(a ? face(a, 24) : "");
  if (a && store.screen === "talk") $("switcher-name").textContent = nameOf(a) || "New agent";
  $("mode").hidden = !kept;
  $("mode-talk").setAttribute("aria-selected", String(store.screen === "talk"));
  $("mode-sketcher").setAttribute("aria-selected", String(store.screen === "sketcher"));
  const studying = store.agents.find((x) => x.study && ["studying", "paused"].includes(x.study.state));
  const s = studying?.study;
  $("top-study").replaceChildren(studying && !(store.screen === "sketcher" && store.current === studying.id)
    ? btn(s.state === "paused" ? "Studying paused" : `Studying · ${s.done} of ${s.total}`, () => openAgent(studying.id, "sketcher"), "study-pill")
    : "");
}

$("home-link").addEventListener("click", goHome);
$("mode-talk").addEventListener("click", () => setMode("talk"));
$("mode-sketcher").addEventListener("click", () => setMode("sketcher"));

hooks.menu = () => {
  const a = nav.current();
  if (!a || a.real) return [];
  const name = nameOf(a);
  const items = [];
  if (name) items.push({ label: "Palette", run: () => E.openPalette(a) });
  if (a.keptAt) items.push({ label: `Export ${name}…`, run: () => F.openExport(a) });
  if (items.length) items.push("-");
  items.push({ label: `Delete ${name || "this sketch"}…`, run: () => openDelete(a) });
  return items;
};

// ── A1 Home ───────────────────────────────────────────────────────────────

const latestTalk = (a) => [...(a.talks ?? [])].sort((x, y) => y.updatedAt.localeCompare(x.updatedAt))[0];
const studyLine = (s) => (s.state === "paused" ? "Studying paused" : s.state === "stopped" ? `Stopped · ${s.done} of ${s.total} studied` : `Studying · ${s.done} of ${s.total}`);

function mark(a) {
  if (a.importedFrom && !a.openedAt) return el("span", "mark new", "new here");
  if (a.study?.state === "finished" && a.ready) return el("span", "mark ready", "Ready");
  if (a.study && a.study.state !== "finished") return el("span", "mark", studyLine(a.study));
  return null;
}

function summary(a) {
  const shorts = (a.map ?? []).filter((l) => l.level === "sharp" && l.short).map((l) => l.short).slice(0, 3);
  return shorts.length ? shorts.join(" · ") : firstSentence(a.draft.persona);
}

function card(a) {
  const last = latestTalk(a);
  const open = () => openAgent(a.id, "talk");
  const c = el("article", { class: "card" },
    el("button", { class: "card-main", onclick: open, "aria-label": `Talk to ${nameOf(a)}` },
      face(a, 72), el("span", "card-name", nameOf(a)), el("span", "card-line", summary(a))),
    el("div", "card-foot",
      last ? btn(`Last: ${last.title} · ${when(last.updatedAt)}`, () => openAgent(a.id, "talk", { talkId: last.id }), "link-btn quiet card-last") : null,
      mark(a)));
  return c;
}

function sketchRow(a) {
  const status = a.study ? (a.study.state === "finished" ? "Ready" : studyLine(a.study)) : `Sketch · ${when(a.updatedAt ?? a.openedAt)}`;
  return el("button", { class: "sketch-row", onclick: () => openAgent(a.id, "sketcher") },
    face(a, 40, { outline: true }), el("span", "sketch-name", nameOf(a) || "Untitled sketch"), el("span", "sketch-status", status));
}

function renderHome() {
  const realKept = store.real.filter((r) => r.draft?.status === "saved").map((r) => realAgent(r.id));
  const realSketch = store.real.filter((r) => r.draft?.status !== "saved" && r.draft?.name?.trim()).map((r) => realAgent(r.id));
  const kept = [...store.agents.filter((a) => a.keptAt), ...realKept]
    .sort((x, y) => (latestTalk(y)?.updatedAt ?? y.keptAt ?? "").localeCompare(latestTalk(x)?.updatedAt ?? x.keptAt ?? ""));
  const sketches = [...store.agents.filter((a) => !a.keptAt), ...realSketch];
  const cards = el("div", "cards", ...kept.map(card),
    el("button", { class: "card new-card", onclick: newAgentFlow }, el("span", "new-plus", "+ New agent"), el("span", "card-line", "one line, or drop a folder")));
  const col = el("div", "home-col", cards);
  if (sketches.length) {
    if (kept.length) col.append(el("h2", "home-h", "Sketches"));
    col.append(el("div", "sketches", ...sketches.map(sketchRow)));
  }
  $("home").replaceChildren(col);
}

// ── A3 Delete ─────────────────────────────────────────────────────────────

function openDelete(a) {
  const name = nameOf(a) || "this sketch";
  const talks = a.talks?.length ?? 0;
  const refs = a.references?.total ?? 0;
  const counts = [talks && `${talks} ${talks === 1 ? "talk" : "talks"}`, refs && `${refs} references`].filter(Boolean).join(" · ");
  const studying = a.study && ["studying", "paused"].includes(a.study.state);
  sheet({
    title: `Delete ${name}?`,
    body: [counts && el("p", "", counts), el("p", "", "Your files on this Mac aren't touched."), studying && el("p", "", "Studying stops."), el("p", "", "This can't be undone.")],
    actions: [
      btn("Cancel", () => closeSheet(), "btn", { "data-focus": "" }),
      btn(`Delete ${name}`, () => {
        B.stopTimers(a);
        store.agents = store.agents.filter((x) => x !== a);
        closeSheet();
        goHome();
      }, "btn danger"),
    ],
  });
}

// ── The bridge from the P2 Sketcher to the demo agents ────────────────────

hooks.mockApi = (path, { method, body }) => {
  if (path === "/api/health" && !store.online) return Promise.resolve({ installed: false });
  const m = path.match(/^\/api\/agents\/([^/]+)(\/draft|\/save)?$/);
  const a = m && mockAgent(m[1]);
  if (!a) return undefined;
  if (m[2] === "/draft" && method === "PUT") {
    if (!store.online) return Promise.reject(new Error("offline"));
    Object.assign(a.draft, body);
    a.updatedAt = nowIso();
  } else if (m[2] === "/save" && method === "POST") {
    a.draft.status = "saved";
    a.keptAt = nowIso();
  }
  return Promise.resolve(m[2] ? { ...a.draft } : { id: a.id, mock: true, draft: { ...a.draft }, sessionId: null });
};

hooks.afterLoad = (agent) => {
  store.current = agent.id;
  if (store.screen !== "talk") setScreen("sketcher");
  B.afterLoad(agent);
  renderTop();
};
hooks.afterKeep = (agent) => { B.afterKeep(agent); refreshReal(); renderTop(); };
hooks.onDraft = (draft) => {
  const a = mockAgent(P2.state.agent?.id);
  if (a) Object.assign(a.draft, draft);
  if (store.screen === "sketcher") $("top-face").replaceChildren(face(a ?? { draft }, 24));
};
hooks.beforeSend = (message) => B.beforeSend(message);
hooks.mockTurn = (agent, message, signal) => (isMock(agent.id) ? B.mockTurn(mockAgent(agent.id), message, signal) : undefined);
hooks.voiceCaption = (agent) => B.voiceCaption(agent);

// ── Demo pill (C14) ───────────────────────────────────────────────────────

function demoItems() {
  const studying = store.agents.find((a) => a.study && a.study.state === "studying");
  return [
    { label: "Skip time ▸", disabled: !studying, keepOpen: true, run: () => B.skipTime(studying) },
    { label: `Claude reachable: ${store.online ? "on" : "off"}`, keepOpen: true, run: () => { store.online = !store.online; bus.emit("online", store.online); } },
    { label: "Start UJ2 fresh", run: () => B.startFresh() },
    { label: `Show mock values: ${document.body.classList.contains("show-mock") ? "on" : "off"}`, keepOpen: true, run: () => document.body.classList.toggle("show-mock") },
    { label: "Reset demo", run: resetDemo },
    "-",
    el("p", "demo-cap", "Import a file"),
    ...["Juno.agent.zip", "Marcus.agent.zip", "Old coach.agent.zip"].map((file) => ({ label: file, run: () => F.importFile(file) })),
  ];
}

async function resetDemo() {
  for (const a of store.agents) B.stopTimers(a);
  store.online = true;
  await loadStore();
  goHome();
}

bus.on("online", (online) => {
  P2.state.installed = online;
  P2.renderBanner?.();
  B.onOnline(online);
  D.onOnline(online);
});
bus.on("changed", () => { renderTop(); if (store.screen === "home") renderHome(); });

// ── Keys ──────────────────────────────────────────────────────────────────

addEventListener("keydown", (e) => {
  const cmd = e.metaKey || e.ctrlKey;
  if (e.key === "Escape") {
    if (sheetOpen()) { e.preventDefault(); closeSheet(); return; }
    if (store.screen === "talk" && D.escape()) { e.preventDefault(); return; }
    if (store.screen === "sketcher" && C.escape()) { e.preventDefault(); return; }
    return;
  }
  if (!cmd) return;
  const k = e.key.toLowerCase();
  const a = nav.current();
  let done = true;
  if (k === "n" && e.shiftKey) newAgentFlow();
  else if (k === "n" && store.screen === "talk") D.newTalk();
  else if (k === "1") setMode("talk");
  else if (k === "2") setMode("sketcher");
  else if (e.key === "ArrowUp") goHome();
  else if (k === "f" && store.screen === "talk") D.focusSearch();
  else if (k === "e" && a?.keptAt && !a.real) F.openExport(a);
  else if (k === "i" && e.shiftKey) picker("Import an agent", Object.keys(store.demo.imports).map((name) => ({ name })), (it) => F.importFile(it.name));
  else done = false;
  if (done) e.preventDefault();
});

// ── Boot: the opening rule (0 → A2 · 1 → that agent · 2+ → Home) ──────────

export async function boot() {
  await loadStore();
  $("demo-host").replaceChildren(demoPill(demoItems));
  dropOverlay({
    target: () => {
      const a = nav.current();
      if (store.screen === "home") return "for a new agent";
      if (a && !a.real && nameOf(a) && a.keptAt) return `adds to ${nameOf(a)}`;
      if (a && (a.real || !a.keptAt) && B.doorShowing()) return null;
      return a && nameOf(a) ? `adds to ${nameOf(a)}` : "for a new agent";
    },
    onDrop: (files) => B.onDrop(files),
  });
  C.init();
  D.init();
  const named = store.real.filter((r) => r.draft?.name?.trim());
  const count = store.agents.length + named.length;
  if (count === 0) await newAgentFlow();
  else if (count === 1) await openAgent(store.agents[0]?.id ?? named[0].id);
  else goHome();
}
