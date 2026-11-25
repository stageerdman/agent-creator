// Block E: grow and shape. One-pile top-up (E1), the map moves (E2), remove
// a reference with Undo (E3), the face sheet (E4), the Palette (E5).
// design-jony-block-E.md. Every change after Keep is live (X4).

import {
  P2, el, btn, closeBtn, bus, store, nameOf, shortName, fileById, note, face, sheet, closeSheet,
  picker, paletteStrip, wait, nowIso, dayMonth,
} from "/components.js";
import { mergePersona } from "/sketch.js";
import { nav } from "/block-a.js";
import * as B from "/block-b.js";
import * as C from "/block-c.js";

const $ = (id) => document.getElementById(id);
const inSketcher = (a) => P2.state.agent?.id === a.id && store.screen === "sketcher";

// A plain line in the Sketcher chat (no reply): `References: removed "…"`.
function logLine(a, text, onClick) {
  if (inSketcher(a)) {
    P2.els.empty.hidden = true;
    const line = onClick ? btn(`${text} ↗`, onClick, "change-line") : el("p", "change-line plain", text);
    P2.stick(() => P2.els.log.append(el("div", "msg note-line", line)), true);
  } else note(a.id, { kind: "divider", text });
}

function userChip(title, detail) {
  const msg = el("div", "msg user", el("div", "who", "You"),
    el("div", "bubble refs-bubble", el("span", "refs-chip", el("strong", "", title), el("span", "", detail))));
  P2.stick(() => P2.els.log.append(msg), true);
  P2.els.empty.hidden = true;
}

const clearMarks = (a) => { delete a.marks; delete a.moved; delete a.likenessWas; delete a.removal; delete a.marksStale; };

// ── E1 One-pile top-up ────────────────────────────────────────────────────

const MARCUS_FILES = [
  { id: "marcus-letters", name: "Letters to a founder.md", kind: "doc", size: "0.4 MB", ease: "easy" },
  { id: "marcus-board", name: "Board notes.docx", kind: "doc", size: "1.1 MB", ease: "easy" },
  { id: "marcus-control", name: "Control list.txt", kind: "doc", size: "0.1 MB", ease: "easy" },
  { id: "marcus-calls", name: "Hard calls.pdf", kind: "doc", size: "1.4 MB", ease: "easy" },
];
const mref = (fileId, location, passage, words) => ({ fileId, location, passage, words, span: [passage.indexOf(words), passage.indexOf(words) + words.length] });
const MARCUS_MAP = [
  { id: "marcus-control", level: "sharp", text: "In your control or not: sort every worry before you act", short: "what's in your control",
    refs: [mref("marcus-control", "line 3", "Two columns. Left: what I can change this week. Right: everything else. Only the left column gets my morning.", "what I can change this week"),
      mref("marcus-letters", "Letter 2", "You are not your company's mood. Ask what is in your control, do that, and let the rest pass like weather.", "Ask what is in your control")] },
  { id: "marcus-calls", level: "sharp", text: "Hard calls: sleep on it once, then decide", short: "hard calls",
    refs: [mref("marcus-calls", "p. 4", "A hard call gets one night. Not two. After the night, decide, write it down, and tell the person first.", "A hard call gets one night"),
      mref("marcus-board", "March", "We agreed: every hard call gets one night, then a decision in writing.", "one night, then a decision in writing")] },
  { id: "marcus-hiring", level: "blank", text: "Hiring and firing", refs: [], topic: "hiring" },
];

export function topUp(a) {
  if (!a || a.real) return;
  const own = store.demo.pickerFiles.topUps.filter((t) => t.for === a.id);
  const items = own.length ? own : [{ id: "generic", name: `${shortName(a)} notes.pdf`, detail: "1 file · 2 MB" }];
  picker("Add references", items, (item) => runTopUp(a, item));
}

export function topUpFiles(a, files) {
  if (!a || a.real || !files?.length) return;
  if (faceSheet && files.some((n) => /\.(png|jpe?g|heic|gif|webp)$/i.test(n))) return facePhoto(a, { src: null, name: files[0] });
  if (files.some((n) => /money has rules/i.test(n)) && a.id === "rex") return runTopUp(a, store.demo.pickerFiles.topUps.find((t) => t.id === "money"));
  if (a.id === "marcus" && !a.references.total) return runTopUp(a, store.demo.pickerFiles.topUps.find((t) => t.id === "marcus-docs"));
  const detail = `${files.length} ${files.length === 1 ? "file" : "files"}`;
  runTopUp(a, { id: "generic", name: files.length === 1 ? files[0] : `${files.length} files`, detail, names: files });
}

export function addForLine(a, line) {
  if (a.real) return;
  const money = store.demo.pickerFiles.topUps.find((t) => t.id === "money");
  if (a.id === "rex" && line.topic === "money") return picker("Add a reference for this", [money], (item) => runTopUp(a, item));
  topUp(a);
}

async function runTopUp(a, item) {
  if (!item) return;
  if (!inSketcher(a)) await nav.open(a.id, "sketcher");
  const money = item.id === "money";
  if (money && a.references.files.some((f) => f.id === "rex-money" && !f.removed)) {
    B.sketcherSay(a, `${shortName(a)} already has Money Has Rules.pdf. Nothing to study.`);
    return;
  }
  const names = item.files ?? item.names ?? [item.name];
  const count = names.length;
  userChip(`References · ${item.name}`, item.detail);
  const name = shortName(a);
  B.sketcherSay(a, count === 1
    ? `Studying ${names[0]}. It goes into what ${name} knows${money ? ", under money" : ""}.`
    : `Studying ${count} references. They go into what ${name} knows.`);
  a.topUp = { item, names };
  a.study = { state: "studying", stage: "reading", current: names[0], done: 0, total: count, etaMin: 1, resumed: false };
  a.run = { current: { reading: names, listening: names }, paletteAt: [] };
  B.renderStudy(a);
  C.showKnows(a);
  await wait(3000);
  if (a.topUp?.item === item && a.study?.state === "studying") {
    if (!store.online) { a.study.state = "paused"; B.renderStudy(a); return; }
    finishTopUp(a);
  }
}

// Called by the 3 s timer above, or by block B's ticker (Skip time, Study the rest).
export function finishTopUp(a) {
  const t = a.topUp;
  if (!t) return;
  B.stopTimers(a);
  delete a.topUp;
  delete a.run;
  const count = t.names.length;
  a.study = { state: "finished", studied: count, total: count, aside: [] };
  a.studiedAt = dayMonth();
  clearMarks(a);
  const name = shortName(a);
  const refs = a.references;
  if (t.item.id === "money") {
    const { moneyFile, rexMoneyAfter } = store.demo.extras;
    refs.files.push({ ...moneyFile });
    refs.total += 1;
    const i = a.map.findIndex((l) => l.id === "rex-money");
    const after = structuredClone(rexMoneyAfter);
    if (i >= 0) a.map[i] = after; else a.map.push(after);
    a.marks = { "rex-money": { mark: "was Blank", quiz: after.quiz, redraw: true } };
    a.moved = "rex-money";
    if (a.likeness && a.likenessAfterMoney) {
      a.likenessWas = a.likeness.rating;
      a.likeness.rating = a.likenessAfterMoney.rating;
      if (!a.likeness.reasons.some((r) => r.text === a.likenessAfterMoney.reason.text)) a.likeness.reasons.unshift(structuredClone(a.likenessAfterMoney.reason));
    }
    B.sketcherSay(a, "I studied Money Has Rules.pdf. Money is no longer Blank.",
      { lines: [{ text: "What Rex knows: Money and investing, Blank → Sharp ↗", onClick: () => C.showKnows(a) }] });
  } else if (t.item.id === "marcus-docs") {
    refs.files.push(...MARCUS_FILES.map((f) => ({ ...f, folder: null, pile: "knows" })));
    refs.total += MARCUS_FILES.length;
    refs.size = "3 MB";
    refs.flat = true;
    a.map = structuredClone(MARCUS_MAP);
    a.marks = Object.fromEntries(MARCUS_MAP.filter((l) => l.level === "sharp").map((l, i) => [l.id, { mark: "was Blank", quiz: i === 0 ? "What do I do with the worries I can't change?" : null, redraw: true }]));
    a.moved = MARCUS_MAP[0].id;
    B.sketcherSay(a, `I studied ${count} references. ${name} has two Sharp lines now, and one Blank.`,
      { lines: [{ text: `DNA: 2 Good at · 1 Not trained for ↗`, onClick: () => C.showKnows(a) }] });
  } else {
    t.names.forEach((n, i) => refs.files.push({ id: `${a.id}-added-${Date.now()}-${i}`, name: n, folder: null, kind: "doc", size: "", pile: "knows", ease: "easy" }));
    refs.total += count;
    B.sketcherSay(a, `Studied. ${count === 1 ? t.names[0] : `These ${count} references`} ${count === 1 ? "adds" : "add"} to what ${name} already knows well.`);
  }
  (refs.batches ??= []).push({ id: `${a.id}-b${refs.batches.length + 1}`, addedAt: nowIso(), fileIds: [] });
  B.renderStudy(a);
  if (inSketcher(a)) C.showKnows(a);
  bus.emit("changed");
}

// ── E3 Remove a reference, Undo for this visit ────────────────────────────

const LEVELS = ["blank", "rough", "sharp"];
function dropRefs(a, removedIds, label) {
  const before = {};
  for (const line of a.map ?? []) {
    const left = (line.refs ?? []).filter((r) => !removedIds.has(r.fileId));
    if (left.length === (line.refs ?? []).length) continue;
    before[line.id] = structuredClone(line);
    let level = line.level;
    if (!left.length) level = "blank";
    else if (level === "sharp" && left.length < 2) level = "rough";
    line.refs = left;
    if (level !== line.level) {
      const was = line.level[0].toUpperCase() + line.level.slice(1);
      const now = level[0].toUpperCase() + level.slice(1);
      (a.marks ??= {})[line.id] = { mark: `was ${was} · now ${now} · after removing "${label}"` };
      line.level = level;
    }
    if (level === "rough" && left.length === 1) line.roughReason = `Only ${fileById(a, left[0].fileId)?.name ?? "one reference"} covers this.`;
  }
  return before;
}

function remove(a, files, label, group, what = `"${label}"`) {
  if (a.marksStale) clearMarks(a);
  for (const f of files) f.removed = true;
  if (group) {
    group.removed = true;
    group.hiddenCount = group.count - files.length;
    a.references.total -= group.hiddenCount;
  }
  const before = dropRefs(a, new Set(files.map((f) => f.id)), label);
  a.removal = { file: files, group, label, what, before, focus: true };
  logLine(a, `References: removed "${label}"`);
  C.renderKnows(a);
  bus.emit("changed");
}

export function removeFile(a, file) { remove(a, [file], file.name); }

export function removeGroup(a, g) {
  const files = a.references.files.filter((f) => f.folder === g.name && !f.removed);
  const unit = { audio: "recordings", video: "videos", doc: "files" }[g.kind] ?? "files";
  remove(a, files, g.name, g, `"${g.name}" (${g.count} ${unit})`);
}

export function undoRemove(a) {
  const r = a.removal;
  if (!r) return;
  for (const f of r.file) f.removed = false;
  if (r.group) { r.group.removed = false; a.references.total += r.group.hiddenCount; }
  for (const line of a.map) {
    if (r.before[line.id]) { Object.assign(line, r.before[line.id]); if (!r.before[line.id].roughReason) delete line.roughReason; delete a.marks?.[line.id]; }
  }
  if (a.marks && !Object.keys(a.marks).length) delete a.marks;
  const label = r.label;
  delete a.removal;
  logLine(a, `References: put back "${label}"`);
  C.renderKnows(a);
  bus.emit("changed");
}

// ── E4 Face ───────────────────────────────────────────────────────────────

let faceSheet = null; // { a, options:[{src,kind,label}], choice }

export function openFace(a, keep) {
  const current = a.face?.src ? { src: a.face.src, kind: a.face.kind } : null;
  if (!keep) {
    const icons = (a.face?.iconOptions ?? []).filter((s) => s !== current?.src).map((src) => ({ src, kind: "icon" }));
    faceSheet = { a, current, options: [current, ...icons].filter(Boolean).slice(0, 3), choice: current?.src ?? null };
  }
  const st = faceSheet;
  const name = shortName(a);
  const group = el("div", { class: "face-options", role: "radiogroup", "aria-label": `${name}'s face` });
  st.options.forEach((o, i) => {
    const on = st.choice === o.src;
    group.append(el("button", {
      class: `face-option${on ? " on" : ""}`, role: "radio", "aria-checked": String(on), "data-focus": on ? "" : undefined,
      onclick: () => { st.choice = o.src; openFace(a, true); },
    }, el("img", { src: o.src, alt: o.kind === "photo" ? "Your photo" : `Face option ${i + 1} of ${st.options.length}` })));
  });
  const draw = btn("Draw three more", async () => {
    draw.textContent = "Drawing…";
    draw.disabled = true;
    await wait(800);
    const fresh = (a.moreIcons ?? []).map((src) => ({ src, kind: "icon" }));
    st.options = [st.current, ...fresh].filter(Boolean).slice(0, st.current ? 4 : 3);
    if (!st.options.some((o) => o.src === st.choice)) st.choice = st.current?.src ?? null;
    openFace(a, true);
  }, "link-btn");
  const photo = btn("Use a photo…", () => {
    const photos = a.photoOffer ? [a.photoOffer] : store.demo.pickerFiles.photos;
    picker("Use a photo", photos, (p) => facePhoto(a, p));
  }, "link-btn");
  const changed = st.choice !== (st.current?.src ?? null);
  sheet({
    title: `${name}'s face`, label: `${name}'s face`,
    body: [group, el("p", "face-links", draw, " · ", photo),
      el("button", { class: "face-drop", onclick: () => photo.click() }, "or drop a photo here")],
    actions: [
      btn("Cancel", () => { faceSheet = null; closeSheet(); }, "btn"),
      btn("Use", () => useFace(a), "btn primary", { disabled: !changed }),
    ],
    onClose: () => {},
  });
}

function facePhoto(a, p) {
  const st = faceSheet ?? (openFace(a), faceSheet);
  const src = p.src ?? store.demo.pickerFiles.photos[0].src;
  st.options = [...st.options.filter((o) => o.kind !== "photo" || o.src === st.current?.src).slice(0, 3), { src, kind: "photo" }];
  st.choice = src;
  openFace(a, true);
}

function useFace(a) {
  const st = faceSheet;
  const o = st.options.find((x) => x.src === st.choice);
  faceSheet = null;
  closeSheet();
  if (!o) return;
  a.face = { ...a.face, kind: o.kind, src: o.src };
  a.faceNew = false;
  document.body.classList.add("face-change");
  setTimeout(() => document.body.classList.remove("face-change"), 400);
  if (inSketcher(a)) $("face-slot").replaceChildren(face(a, 48, { onclick: () => openFace(a), label: `${nameOf(a)}'s face` }));
  logLine(a, o.kind === "photo" ? "Face: new photo" : "Face: new face");
  bus.emit("changed");
}

// ── E5 Palette ────────────────────────────────────────────────────────────

const TRAIT_COLOURS = ["#A8B48E", "#B5A0C4", "#C49A8A", "#8FB0B5", "#C4B48A"];
const bloomed = new Set();
let paletteOf = null;
let busy = false;

function paletteHost() {
  let host = $("palette");
  if (!host) {
    host = el("div", { id: "palette", class: "knows sketch-scroll palette-view", hidden: true });
    $("dna-passage").after(host);
  }
  return host;
}

export const paletteOpen = () => Boolean(paletteOf);

export async function openPalette(a) {
  if (!inSketcher(a)) await nav.open(a.id, "sketcher");
  paletteOf = a.id;
  $("right-switch").hidden = true;
  $("dna").hidden = true;
  $("dna-passage").hidden = true;
  $("sketch-scroll").hidden = true;
  paletteHost().hidden = false;
  if (P2.isNarrow?.()) P2.setView("sketch");
  renderPalette(a);
  paletteHost().querySelector("input")?.focus();
}

export function closePalette() {
  if (!paletteOf) return false;
  paletteOf = null;
  paletteHost().hidden = true;
  $("right-switch").hidden = false;
  C.showSketch();
  return true;
}

export const escape = () => closePalette();

function mix(a) {
  const groups = (a.palette ?? []).map((p) => ({ ...p }));
  const traits = (a.traits ?? []).map((t, i) => ({ id: `trait-${t.id}`, label: t.label, detail: `${t.value} of 5 · a trait`, colour: TRAIT_COLOURS[i % TRAIT_COLOURS.length], share: t.value * 3 }));
  return [...groups, ...traits];
}

function renderPalette(a) {
  const host = paletteHost();
  const name = shortName(a);
  const refs = a.references?.total ?? 0;
  const traits = a.traits ?? [];
  const head = [refs ? `${refs} references` : null, `${traits.length} traits`].filter(Boolean).join(", ");
  const bloom = !bloomed.has(a.id);
  bloomed.add(a.id);
  const segments = mix(a);
  const rows = traits.map((t) => {
    const sentence = el("span", "trait-line", t.sketchLine[t.value]);
    const group = el("div", { class: "trait-steps", role: "radiogroup", "aria-label": `${t.label}: ${t.sketchLine[t.value]}` });
    for (let v = 1; v <= 5; v += 1) {
      group.append(el("label", "step",
        el("input", { type: "radio", name: `trait-${t.id}`, value: v, checked: v === t.value, disabled: busy, "aria-label": `${t.label} ${v} of 5`, onchange: () => setTrait(a, t, v) }),
        el("span", "dot", "")));
    }
    return el("div", "trait-row", el("span", "trait-label", t.label), group, sentence);
  });
  host.replaceChildren(
    el("div", "palette-head", el("h3", "knows-h", `Palette · what ${name} is mixed from · ${head}`, busy ? el("span", "muted", " · Sketching…") : null),
      closeBtn(closePalette, "Close Palette")),
    el("div", "palette-mix", paletteStrip(segments, { bloom }), el("span", "muted small", "stand-in look")),
    el("p", "palette-names muted small", segments.map((s) => s.label).join(" · ")),
    el("ul", "sr-only", ...segments.map((s) => el("li", "", `${s.label} · ${s.detail}`))),
    el("div", "traits", ...rows));
}

async function setTrait(a, t, v) {
  if (busy || v === t.value) return;
  const from = t.value;
  busy = true;
  t.value = v;
  renderPalette(a);
  const bubble = P2.addUserBubble(`${t.label}: ${from} → ${v}`, -1);
  P2.els.empty.hidden = true;
  void bubble;
  a.instructionsBase ??= (mergePersona(a.draft).instructions ?? "");
  a.traitLines = { ...(a.traitLines ?? {}), [t.id]: t.sketchLine[v] };
  await wait(700);
  a.draft.instructions = `${a.instructionsBase} ${Object.values(a.traitLines).join(" ")}`.trim();
  delete a.draft.persona;
  B.sketcherSay(a, `Done. ${t.label} is ${v} of 5 now: "${t.sketchLine[v]}"`, {
    lines: [{ text: "Sketch: instructions updated ↗", onClick: () => { closePalette(); P2.markUpdated("instructions"); } }],
  });
  if (P2.state.agent?.id === a.id) {
    P2.takeDraft({ ...a.draft });
    const tag = P2.fields.instructions.tag;
    tag.textContent = " new";
    tag.className = "tag new";
  }
  busy = false;
  if (paletteOf === a.id) renderPalette(a);
}
