// Block B: make from material. References door and chip (B1), laid out and
// corrected in one sentence (B2), studying (B3), finished (B4), Keep (B6/B7).
// design-jony-block-B.md. The Sketcher's lines are scripted (F7).

import {
  P2, el, btn, bus, store, mockAgent, nameOf, shortName, note, face, studyBlock,
  paletteStrip, picker, wait, nowIso, dayMonth,
} from "/components.js";
import { mergePersona, agentZip } from "/sketch.js";
import { nav } from "/block-a.js";
import * as C from "/block-c.js";
import * as E from "/block-e.js";
import * as F from "/block-f.js";

const $ = (id) => document.getElementById(id);
const lines = () => store.demo.sketcherLines;
const isCurrent = (a) => P2.state.agent?.id === a.id && store.screen === "sketcher";
const timers = new Map();

// ── Saying things in the Sketcher chat ────────────────────────────────────

export function sketcherSay(a, text, { lines: extra = [], waitingOnly = false } = {}) {
  if (!isCurrent(a)) { note(a.id, { kind: "say", text, lines: extra }); return null; }
  const reply = P2.addSketcherMessage();
  if (waitingOnly) return reply;
  P2.stick(() => {
    reply.waiting.remove();
    P2.renderReply(reply.say, text);
    for (const line of extra) P2.addCustomLine(reply.msg, line);
  });
  return reply;
}

function userChip(a, title, detail) {
  const msg = el("div", "msg user", el("div", "who", "You"),
    el("div", "bubble refs-bubble", el("span", "refs-chip", el("strong", "", title), el("span", "", detail))));
  P2.stick(() => P2.els.log.append(msg), true);
  P2.els.empty.hidden = true;
  renderLead(a);
}

export function replayNotes(a) {
  for (const n of store.notes[a.id] ?? []) {
    if (n.kind === "say") sketcherSay(a, n.text, { lines: n.lines });
    else if (n.kind === "divider") P2.els.log.append(el("div", "divider", n.text));
    else if (n.kind === "user") {
      const bubble = P2.addUserBubble(n.text, -1);
      for (const line of n.lines ?? []) P2.addCustomLine(bubble, line);
    }
  }
  if ((store.notes[a.id] ?? []).length) P2.els.empty.hidden = true;
  store.notes[a.id] = [];
}

// ── After P2 loads an agent (mock or real) ────────────────────────────────

export function afterLoad(agent) {
  const a = mockAgent(agent.id);
  const shown = a ?? realShown(agent);
  E.closePalette();
  // MAGIC-PASS Q1: until Keep the Sketch opens on DNA (the portrait forms there); after, on Profile.
  if (agent.draft?.status === "saved") C.showProfile();
  else C.showDna(shown);
  renderFaceSlot(shown, a);
  renderStudy(a);
  renderDoor(a);
  renderLead(a);
  renderKeepExtras(a);
  if (a) {
    replayNotes(a);
    if (a.make?.phase === "laid") {
      sketcherSay(a, lines().inesLaidOut);
      setHint(`Say what to change, like "skip Bonus"…`);
      C.showKnows(a);
    } else if (a.study?.state === "finished" && !a.keptAt) {
      setHint(`Ask about any line, like "why Rough on pricing?"…`);
    }
  }
}

function setHint(text) {
  P2.state.hint = text;
  P2.renderPlaceholder();
}

function renderFaceSlot(shown, a) {
  const slot = $("face-slot");
  const named = Boolean(nameOf(shown));
  slot.replaceChildren(face(shown, 48, a && named ? { onclick: () => E.openFace(a), label: `${nameOf(a)}'s face` } : {}));
  if (a?.faceNew) slot.append(el("span", "tag new", "new"));
}

export function renderStudy(a) {
  const host = $("study-host");
  if (a && P2.state.agent?.id !== a.id) {
    // another agent's study (Ines in the background): only the top bar and Home change
  } else if (!a || !a.study) {
    host.replaceChildren();
    host.hidden = true;
  } else {
    host.hidden = false;
    const s = a.study;
    // `Picked up where it left off` shows for about 10 s, then the normal line.
    if (s.resumed && !s.resumedTimer) s.resumedTimer = setTimeout(() => { if (a.study === s) { s.resumed = false; renderStudy(a); } }, 10000);
    const parts = [studyBlock(a, {
      onStop: () => stopStudy(a), onResume: () => resumeStudy(a), onCheck: () => checkAgain(a),
    })];
    if (a.palette?.length && s.state !== "finished" && !a.topUp) {
      const filled = new Set((a.run?.paletteAt ?? []).filter((p) => s.done >= p.at).map((p) => p.id));
      parts.push(el("div", "stand-in", paletteStrip(a.palette, { filled, small: true }), el("span", "muted small", "stand-in look")));
    }
    host.replaceChildren(...parts);
  }
  if (a) C.renderKnows(a); // Profile skills and DNA both read the study
  nav.renderTop();
  bus.emit("changed");
}

// ── B1 The references door, the chip, the path rule ───────────────────────

export const doorShowing = () => !P2.els.empty.hidden;

function renderDoor(a) {
  P2.els.empty.querySelector(".door")?.remove();
  const door = el("button", { class: "door", onclick: chooseFolder },
    el("strong", "", "Or bring their references"),
    el("span", "", "Drop a folder or files here, or paste a path"),
    el("span", "", "Your files stay on this Mac · Claude reads them to study"));
  P2.els.empty.append(door);
}

function renderLead(a) {
  const lead = $("composer-lead");
  const showPlus = !doorShowing();
  lead.hidden = !showPlus;
  lead.replaceChildren(showPlus ? btn("＋", () => (a?.keptAt || a?.references?.total ? E.topUp(a) : chooseFolder()), "plus-btn", { "aria-label": "Add references" }) : "");
}

function chooseFolder() {
  const { folders, broken } = store.demo.pickerFiles;
  picker("Choose references", [...folders, ...broken], (item) => (item.nothing ? nothingReadable(item.name) : refsFlow(item)));
}

const isPath = (text) => /^(\/|~\/)\S+$/.test(text.trim());

export async function beforeSend(message) {
  if (!isPath(message)) return false;
  P2.els.message.value = "";
  P2.growComposer();
  P2.renderSend();
  if (/quiet\s*deal|ines/i.test(message)) { await refsFlow(store.demo.pickerFiles.folders[0]); return true; }
  P2.addUserBubble(message, -1);
  P2.els.empty.hidden = true;
  const anyAgent = { id: P2.state.agent.id };
  if (/installers/i.test(message)) sketcherNow(anyAgent, "Nothing here Agent Creator can read. It reads text, PDF, Word, Markdown, audio and video.");
  else sketcherNow(anyAgent, `Can't find ${message.trim()}. Check the path.`);
  renderLead(mockAgent(P2.state.agent.id));
  return true;
}

function sketcherNow(agent, text) {
  const reply = P2.addSketcherMessage();
  P2.stick(() => { reply.waiting.remove(); P2.renderReply(reply.say, text); });
}

function nothingReadable(name) {
  P2.addUserBubble(`~/Downloads/${name}`, -1);
  P2.els.empty.hidden = true;
  sketcherNow({ id: P2.state.agent.id }, "Nothing here Agent Creator can read. It reads text, PDF, Word, Markdown, audio and video.");
  renderLead(mockAgent(P2.state.agent.id));
}

// Any new sketch that gets the Ines folder becomes the fresh Ines (UJ2).
async function refsFlow(item) {
  let a = mockAgent(P2.state.agent?.id);
  if (!a || a.id !== item.agent || a.references.total) {
    a = freshAgent(item.agent);
    await loadFresh(a);
  }
  const t = store.templates[a.id];
  a.references = structuredClone(t.references);
  a.make = { phase: "laying" };
  userChip(a, `References · ${a.references.root}`, `${a.references.total} files · ${a.references.size}`);
  const reply = sketcherSay(a, "", { waitingOnly: true });
  reply.waiting.textContent = "Laying out… ";
  await wait(1200);
  reply.msg.remove();
  a.make.phase = "laid";
  a.layout = { corrected: false };
  sketcherSay(a, lines().inesLaidOut);
  setHint(`Say what to change, like "skip Bonus"…`);
  C.showKnows(a);
  bus.emit("changed");
}

function freshAgent(id) {
  const t = structuredClone(store.templates[id]);
  stopTimers(mockAgent(id));
  const a = { ...t, mock: true, draft: { name: "", instructions: "", status: "draft" }, keptAt: null,
    references: { root: null, total: 0, size: "0 MB", files: [], groups: [], aside: [], batches: [] },
    study: null, map: [], likeness: null, talks: [], face: { kind: "letter", src: null, iconOptions: t.face.iconOptions },
    make: { phase: "door" }, openedAt: nowIso(), ready: false, faceNew: false };
  store.agents = [...store.agents.filter((x) => x.id !== id), a];
  store.notes[id] = [];
  return a;
}

async function loadFresh(a) {
  store.current = a.id;
  store.screen = "sketcher";
  document.body.dataset.screen = "sketcher";
  await P2.loadAgent(a.id);
}

export async function startFresh() {
  await loadFresh(freshAgent("ines"));
}

// ── B2 Laid out, corrected in one sentence ────────────────────────────────

export function correct(a) {
  const g = Object.fromEntries(a.references.groups.map((x) => [x.name, x]));
  g["Live Q&A"].pile = "sounds";
  g["Course – The Quiet Deal"].pile = "knows";
  a.references.groups = a.references.groups.filter((x) => x.name !== "Bonus");
  a.references.aside = [...a.references.aside, { name: "Bonus · 10 files", reason: "you said skip it" }];
  a.references.asideCount = 14;
  a.layout.corrected = true;
}

export function piles(a) {
  const name = shortName(a);
  const groups = a.references.groups;
  const asideCount = a.references.asideCount ?? a.references.aside.length;
  const pile = (key, title) => {
    const gs = groups.filter((x) => x.pile === key);
    const n = gs.reduce((s, x) => s + x.count, 0);
    return el("section", "pile", el("h3", "pile-h", `${title} · ${n}`),
      ...gs.map((x) => el("div", "pile-row", el("span", "", x.name), el("span", "muted", `${x.count} ${x.unit ?? ""} · ${x.size}`))));
  };
  const asideList = el("ul", "aside-list", ...a.references.aside.map((x) => el("li", "", `${x.name} · ${x.reason}`)));
  asideList.hidden = true;
  const asideBtn = btn(`Set aside · ${asideCount} · why ▸`, () => { asideList.hidden = !asideList.hidden; asideBtn.textContent = `Set aside · ${asideCount} · why ${asideList.hidden ? "▸" : "▾"}`; }, "link-btn quiet");
  return el("div", "piles",
    el("p", "refs-head", `References · ${a.references.root}`, el("span", "muted", ` · ${a.references.total} files · ${a.references.size}`)),
    pile("knows", `What ${name} knows`), pile("sounds", `How ${name} sounds`),
    el("div", "", asideBtn, asideList),
    el("p", "estimate", "About 40 min to study · you can close the app, it keeps going"),
    btn("Start studying", () => startStudy(a), "btn primary"));
}

// ── The scripted Sketcher (only demo agents) ──────────────────────────────

async function* say(text, { draft, changed, lines: extra = [], after, noChangeLine } = {}) {
  await wait(400);
  for (let i = 0; i < text.length; i += 40) {
    yield { event: "delta", data: { text: text.slice(i, i + 40) } };
    await wait(50);
  }
  if (draft) yield { event: "draft", data: { draft, changed } };
  for (const line of extra) yield { event: "line", data: line };
  yield { event: "done", data: { say: text, sessionId: null, after, noChangeLine } };
}

export function mockTurn(a, message) {
  if (!store.online) return (async function* () { yield { event: "error", data: { kind: "not-installed" } }; })();
  const m = message.toLowerCase();
  if (a.make?.phase === "laid") {
    if (/^(go|ok|okay|start)\b/.test(m)) return say(lines().pressStart);
    if (!a.layout.corrected && /bonus|voice|skip|q&a/.test(m)) {
      correct(a);
      return say(lines().inesCorrected, {
        lines: [{ text: "Split: 18 recordings moved to How Ines sounds · 41 videos moved to What Ines knows · Bonus set aside ↗", onClick: () => C.showKnows(a) }],
        after: () => C.renderKnows(a),
      });
    }
    return say("Change anything in one sentence, then press Start studying.");
  }
  if (a.study?.state === "finished" && a.gapAnswer && /rough|pricing|why/.test(m)) {
    const r = a.gapAnswer.ref;
    return say(a.gapAnswer.text, { lines: [{ text: `Where from · Day 4 – Session 8.mp4 · ${r.location}`, onClick: () => C.showPassage(a, r) }] });
  }
  if (!nameOf(a)) {
    const had = Boolean(a.draft.instructions?.trim());
    const draft = { ...a.draft, name: "Clara", instructions: had ? a.draft.instructions : "A patient teacher who explains one thing at a time." };
    return say("(Demo) Here's a first pass. I called her Clara; change anything in the Sketch, or tell me more.", { draft, changed: ["name", ...(had ? [] : ["instructions"])] });
  }
  return say(`(Demo) The Sketcher would answer here and redraw ${shortName(a)}. Try "make ${subjOf(a)} warmer" in the real app.`);
}
const subjOf = (a) => ({ rex: "him", marcus: "him" })[a.id] ?? "her";

export function voiceCaption(agent) {
  const a = mockAgent(agent?.id);
  if (!a?.voiceSample) return undefined;
  const r = a.voiceSample.ref;
  return [el("p", "voice-caption", "sample, from the current sketch and her references"),
    btn(`Where from · Live Q&A 7.mp3 · ${r.location}`, () => C.showPassage(a, r), "link-btn ref-link")];
}

// ── B3 Studying ───────────────────────────────────────────────────────────

const STAGE = (done) => (done < 239 ? "reading" : done < 298 ? "listening" : "studying");
function currentFile(a, done) {
  const stage = STAGE(done);
  const list = a.run.current[stage === "reading" ? "reading" : "listening"];
  return list[Math.floor(done / 7) % list.length];
}
const eta = (done) => Math.max(1, Math.round(Math.max(0, 239 - done) * 3 / 239 + Math.max(0, 298 - Math.max(done, 239)) * 0.45 + 4));

function startStudy(a) {
  a.make.phase = "studying";
  a.study = { state: "studying", stage: "reading", current: currentFile(a, 0), done: 0, total: 298, etaMin: eta(0), resumed: false, impressionsAt: 20, corrected: a.layout?.corrected };
  P2.state.hint = null;
  P2.renderPlaceholder();
  C.showDna(a); // the study's progress lives in DNA · Looks up
  runTimer(a);
  renderStudy(a);
}

function runTimer(a) {
  stopTimers(a);
  timers.set(a.id, setInterval(() => tick(a), 1500));
}

export function stopTimers(a) {
  if (!a) return;
  clearInterval(timers.get(a.id));
  timers.delete(a.id);
}

function tick(a) {
  const s = a.study;
  if (!s || s.state !== "studying") return stopTimers(a);
  if (!store.online) { s.state = "paused"; stopTimers(a); return renderStudy(a); }
  setDone(a, s.done + 1);
}

function setDone(a, done) {
  const s = a.study;
  if (a.topUp) { // a one-pile top-up (block E)
    s.done = Math.min(done, s.total);
    if (s.done >= s.total) return E.finishTopUp(a);
    return renderStudy(a);
  }
  const before = s.done;
  s.done = Math.min(done, s.total);
  s.stage = STAGE(s.done);
  s.current = currentFile(a, s.done);
  s.etaMin = eta(s.done);
  if (before < 20 && s.done >= 20 && !a.firstImpressionsShown) firstImpressions(a);
  if (s.done >= s.total) return finish(a);
  renderStudy(a);
}

function firstImpressions(a) {
  a.firstImpressionsShown = true;
  const fi = store.templates.ines.study.firstImpressions;
  a.study.firstImpressions = structuredClone(fi);
  const draft = mergePersona({ ...a.draft, ...fi.draft });
  Object.assign(a.draft, draft);
  delete a.draft.persona;
  sketcherSay(a, lines().inesImpressions, { lines: [{ text: "Sketch: name and instructions updated ↗", onClick: () => { P2.markUpdated("name"); P2.markUpdated("instructions"); } }] });
  if (P2.state.agent?.id === a.id) {
    P2.takeDraft(draft);
    P2.markUpdated("name");
    P2.markUpdated("instructions");
    const tag = P2.fields.instructions.tag;
    tag.textContent = " first impressions";
    tag.className = "tag new";
    afterLoadLight(a);
  }
}

function afterLoadLight(a) {
  renderFaceSlot(a, a);
}

export function skipTime(a) {
  if (!a?.study) return;
  const s = a.study;
  const stops = [20, ...(a.run?.paletteAt ?? []).map((p) => p.at), s.total].filter((n) => n > s.done).sort((x, y) => x - y);
  if (s.state !== "studying") return;
  setDone(a, stops[0] ?? s.total);
}

function stopStudy(a) {
  a.study.state = "stopped";
  stopTimers(a);
  renderStudy(a);
}

function resumeStudy(a) {
  a.study.state = "studying";
  a.study.resumed = false;
  runTimer(a);
  renderStudy(a);
}

function checkAgain(a) {
  if (!store.online) return;
  resumeStudy(a);
}

export function onOnline(online) {
  for (const a of store.agents) {
    if (!a.study) continue;
    if (!online && a.study.state === "studying") { a.study.state = "paused"; stopTimers(a); renderStudy(a); }
  }
}

// Seeded Ines keeps studying in the background while the app is open.
bus.on("store", () => {
  for (const a of store.agents) if (a.study?.state === "studying") runTimer(a);
});

// ── B4 Finished ───────────────────────────────────────────────────────────

function finish(a) {
  stopTimers(a);
  const t = store.templates[a.id];
  a.study = {
    state: "finished", studied: 297, total: 298, asideCount: 15,
    aside: [...a.references.aside, { name: t.run.damaged.name, reason: t.run.damaged.reason }],
  };
  a.map = structuredClone(t.finalMap);
  a.arrive = true;
  a.likeness = structuredClone(t.finalLikeness);
  a.studiedAt = dayMonth();
  a.face = { kind: "icon", src: t.face.iconOptions[0], iconOptions: t.face.iconOptions };
  a.faceNew = true;
  a.ready = true;
  a.make = { phase: "finished" };
  const { persona: finalPersona = "", ...finalRest } = t.finalDraft;
  const draft = mergePersona({ ...a.draft, ...finalRest, persona: finalPersona });
  Object.assign(a.draft, draft);
  delete a.draft.persona;
  const voice = `${lines().inesFinished}\n\n> **${shortName(a)}:** ${t.voiceSample.text}`;
  sketcherSay(a, voice, { lines: [{ text: "Sketch: instructions updated ↗", onClick: () => { P2.markUpdated("instructions"); } }] });
  sketcherSay(a, lines().inesFaces, { lines: [{ text: "Face: three to pick from ↗", onClick: () => E.openFace(a) }] });
  if (P2.state.agent?.id === a.id) {
    P2.takeDraft(draft);
    P2.markUpdated("instructions");
    afterLoadLight(a);
    setHint(`Ask about any line, like "why Rough on pricing?"…`);
  }
  renderStudy(a);
}

// ── B6 / B7 Keep ──────────────────────────────────────────────────────────

function renderKeepExtras(a) {
  const slot = P2.els.keepCard.querySelector(".keep-capability");
  if (!a?.keptAt) { slot.hidden = true; slot.replaceChildren(); return; }
  slot.hidden = false;
  // What it knows lives in DNA only; the Keep card no longer repeats it (Eraser F1).
  if (!a.map?.length) { slot.replaceChildren(btn("Add references", () => E.topUp(a), "btn primary")); return; }
  slot.hidden = true;
  slot.replaceChildren();
}

// A real agent's face is pencil (outline) until Keep, ink after.
const realShown = (agent) => ({ id: agent.id, draft: agent.draft, keptAt: agent.draft?.status === "saved" ? agent.draft.updatedAt ?? true : null });

export function afterKeep(agent) {
  const a = mockAgent(agent.id);
  if (!a) { renderFaceSlot(realShown(agent), null); return; }
  a.keptAt ??= nowIso();
  a.ready = false;
  a.faceNew = false;
  C.showSketch(); // the Keep card lives in the Sketch; Talk is the mode switch at the top
  renderKeepExtras(a);
  renderFaceSlot(a, a);
  bus.emit("changed");
}

// ── Drops (C15) ───────────────────────────────────────────────────────────

// Dropped files never enter the chat: they land in the agent's DNA file list,
// and the user tells the Sketcher in words what each is for.
// Demo agents keep their sample files, so a drop on one (or on Home) makes a new agent.
export async function onDrop(entries) {
  const zip = agentZip(entries);
  if (zip) return F.importFile(zip.split("/").at(-1));
  if (!entries.length) return;
  const a = nav.current();
  if (E.facePhotoDrop(a, entries.map((e) => e.path))) return;
  if (store.screen === "home" || !P2.state.agent || mockAgent(P2.state.agent.id)) {
    await P2.newAgent();
    nav.renderTop();
  }
  await C.addFiles(entries);
}
