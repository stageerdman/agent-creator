// Block C: the right pane's two switches (SKETCH-REWORK).
// Profile: face, name, description, skills sorted by hand.
// DNA: Instructions → Made from → Looks up → Strong and thin, every part adjustable.
// Grow (block E) still leaves a.removal on the agent; Undo lives in Looks up.

import { P2, el, btn, store, passagePanel, refLink, shortName, nameOf } from "/components.js";
import {
  skillsFromMap, profileRows, nextRow, moveSkill, skillLabel, moveLine, describe,
  sourcesOf, dnaLayers, partAt, instructionParts, threadsFor, toggleUse, qualityFrom,
} from "/sketch.js";
import * as B from "/block-b.js";
import * as E from "/block-e.js";

const $ = (id) => document.getElementById(id);
const revealed = new Set(); // agent ids whose DNA has played its reveal this session
let showing = null; // agent id whose DNA is on screen
let passage = null; // { a } while a passage replaces the layers
let part = -1; // the instruction part the caret is in

// ── Who is on screen ──────────────────────────────────────────────────────

const mockOf = () => store.agents.find((x) => x.id === P2.state.agent?.id) ?? null;
const current = () => mockOf() ?? (P2.state.agent ? { id: P2.state.agent.id, draft: P2.state.agent.draft } : null);
const nameFor = (a) => (a && nameOf(a) ? shortName(a) : "It");
const filesOf = (a) => a?.references?.files ?? [];

// ── Profile's own data (description and hand moves) stay on this Mac ─────

const profileKey = (id) => `ac-profile-${id}`;
function loadProfile(id) {
  try { return { desc: "", picks: {}, ...JSON.parse(localStorage.getItem(profileKey(id)) ?? "{}") }; }
  catch { return { desc: "", picks: {} }; }
}
function saveProfile(id, data) {
  try { localStorage.setItem(profileKey(id), JSON.stringify(data)); } catch { /* private mode: keep it in memory only */ }
}

// ── Init ──────────────────────────────────────────────────────────────────

export function init() {
  $("rs-profile").addEventListener("click", () => showProfile());
  $("rs-dna").addEventListener("click", () => showDna(current()));
  // Narrow screens get one switch [ Chat | Profile | DNA ]; the right-pane switch hides there.
  $("view-sketch").addEventListener("click", () => $("rs-profile").click());
  $("view-knows").addEventListener("click", () => $("rs-dna").click());
  const sync = () => {
    const onSketch = $("panes").dataset.view === "sketch";
    const dna = $("rs-dna").getAttribute("aria-selected") === "true";
    $("view-knows").hidden = $("right-switch").hidden;
    $("view-knows").setAttribute("aria-selected", String(onSketch && dna && !$("right-switch").hidden));
    $("view-sketch").setAttribute("aria-selected", String(onSketch && (!dna || $("right-switch").hidden)));
  };
  new MutationObserver(sync).observe($("right-switch"), { subtree: true, attributes: true });
  new MutationObserver(sync).observe($("panes"), { attributes: true, attributeFilter: ["data-view"] });
  sync();

  $("f-desc").addEventListener("input", () => {
    const a = current();
    if (!a) return;
    saveProfile(a.id, { ...loadProfile(a.id), desc: $("f-desc").value });
  });
  const ins = $("f-instructions");
  const follow = () => setPart(partAt(ins.value, ins.selectionStart ?? 0));
  for (const type of ["click", "keyup", "input", "focus"]) ins.addEventListener(type, follow);
  ins.addEventListener("input", () => renderProfile(current())); // the description falls back to the first sentence
  ins.addEventListener("keydown", (e) => { if (e.key === "Escape" && part !== -1) { e.stopPropagation(); setPart(-1); } });
}

export function escape() {
  if (passage) { back(); return true; }
  if (part !== -1 && !$("dna").hidden) { setPart(-1); return true; }
  return false;
}

function select(dna) {
  $("rs-profile").setAttribute("aria-selected", String(!dna));
  $("rs-dna").setAttribute("aria-selected", String(dna));
  $("dna").hidden = !dna;
  $("sketch-scroll").hidden = dna;
  $("dna-passage").hidden = true;
  if (P2.isNarrow?.()) P2.setView("sketch");
}

// ── Profile ───────────────────────────────────────────────────────────────

export function showProfile() {
  showing = null;
  passage = null;
  $("rs-profile").setAttribute("aria-selected", "true");
  $("rs-dna").setAttribute("aria-selected", "false");
  $("dna").hidden = true;
  $("dna-passage").hidden = true;
  $("sketch-scroll").hidden = false;
  renderProfile(current());
}

export function renderProfile(a) {
  if (!a) return;
  const data = loadProfile(a.id);
  const d = describe(data.desc, $("f-instructions").value);
  const desc = $("f-desc");
  if (document.activeElement !== desc) desc.value = data.desc;
  desc.placeholder = d.fromInstructions ? d.text : "One line about who this is";
  $("h-desc").hidden = !(d.fromInstructions && !data.desc.trim());

  const host = $("profile-skills");
  const map = a.map ?? [];
  if (!map.length) {
    host.replaceChildren(el("h3", "profile-h", "Skills"), el("p", "profile-quiet", "Skills show after the first study."));
    return;
  }
  const skills = skillsFromMap(map, data.picks);
  const live = el("p", { class: "sr-only", "aria-live": "polite" });
  const rows = profileRows(skills).map((r) => el("div", { class: "profile-row", role: "group", "aria-label": r.title },
    el("h4", "profile-row-h", r.title, " ", el("span", "profile-hint", `· ${r.hint}`)),
    r.skills.length
      ? el("div", "profile-chips", ...r.skills.map((s) => el("button", {
        class: `profile-skill-chip${s.picked ? " is-picked" : ""}`, "data-skill": s.id, "aria-label": skillLabel(s),
        title: "Move to the next row",
        onclick: () => moveChip(a, s),
      }, s.text)))
      : el("p", "profile-quiet", r.empty)));
  host.replaceChildren(el("h3", "profile-h", "Skills"), ...rows,
    el("p", "profile-quiet small", `A summary for you. ${nameFor(a)} answers the same.`), live);
}

function moveChip(a, s) {
  const data = loadProfile(a.id);
  data.picks = moveSkill(data.picks, s.id, nextRow(s.row));
  saveProfile(a.id, data);
  renderProfile(a);
  const moved = skillsFromMap(a.map, data.picks).find((x) => x.id === s.id);
  $("profile-skills").querySelector(`[data-skill="${s.id}"]`)?.focus();
  const live = $("profile-skills").querySelector("[aria-live]");
  if (live && moved) live.textContent = moveLine(moved, nameFor(a));
  if (showing === a.id) renderQuality(a);
}

// ── DNA ───────────────────────────────────────────────────────────────────

export function showDna(a) {
  if (!a) a = current();
  showing = a?.id ?? null;
  passage = null;
  select(true);
  const layers = [...$("dna").querySelectorAll(".dna-layer")];
  const first = a && !revealed.has(a.id);
  for (const l of layers) l.classList.toggle("is-revealed", Boolean(first));
  if (a) revealed.add(a.id);
  renderDna(a);
  $("dna").scrollTop = 0;
}

export const showingDna = (a) => Boolean(a) && showing === a.id && (!$("dna").hidden || Boolean(passage));

export function renderDna(a) {
  if (!a || passage || showing !== a.id) return;
  const name = nameFor(a);
  const subs = dnaLayers({ name, map: a.map ?? [], files: filesOf(a), total: a.references?.total });
  for (const s of subs) {
    const sub = $("dna").querySelector(`[data-layer="${s.id}"] .dna-sub`);
    if (sub) sub.textContent = `· ${s.sub}`;
  }
  renderMade(a);
  renderLooks(a);
  renderQuality(a);
  setPart(part);
}

function renderMade(a) {
  const name = nameFor(a);
  const files = sourcesOf(a.map ?? [], filesOf(a));
  const host = $("dna-made");
  if (!files.length) {
    host.replaceChildren(el("p", "dna-quiet", `Made from your words in the chat. To change ${name}, edit the Instructions.`));
    return;
  }
  const rows = files.map((f) => {
    const ref = (a.map ?? []).flatMap((l) => l.refs ?? []).find((r) => r.fileId === f.id);
    return el("div", { class: "dna-thread dna-row", "data-file": f.id },
      ref ? refLink(ref, a, () => showPassage(a, ref)) : el("span", "", f.name));
  });
  host.replaceChildren(...rows,
    el("p", "dna-quiet", `Shown as is. To change ${name}, edit the Instructions.`),
    el("p", "dna-quiet small", "Sample links · real ones come with the next study"));
}

function setPart(index) {
  part = index;
  const a = showing && current();
  const own = $("dna-own");
  const rows = [...$("dna-made").querySelectorAll(".dna-thread")];
  if (!a || index === -1) {
    for (const r of rows) r.classList.remove("is-active");
    own.textContent = "";
    return;
  }
  const text = instructionParts($("f-instructions").value)[index]?.text ?? "";
  const behind = new Set(threadsFor(text, a.map ?? [], filesOf(a)).map((f) => f.id));
  for (const r of rows) r.classList.toggle("is-active", behind.has(r.dataset.file));
  own.textContent = behind.size
    ? `${behind.size} ${behind.size === 1 ? "file" : "files"} behind this line`
    : `${nameFor(a)}'s own view · no reference`;
}

function renderLooks(a) {
  const host = $("knows");
  const name = nameFor(a);
  if (!store.agents.includes(a)) {
    host.replaceChildren(el("p", "dna-quiet", `Nothing to look up yet. ${name} answers from the Instructions.`));
    return;
  }
  if (a.make?.phase === "laid") { host.replaceChildren(B.piles(a)); return; }
  const s = a.study;
  if (s && s.state !== "finished" && !(a.map ?? []).length) {
    host.replaceChildren(el("p", "dna-quiet", a.topUp ? "The list comes when studying is done." : "First impressions after about 20 files."));
    return;
  }
  const parts = [];
  if (a.removal) {
    const undo = btn("Undo", () => E.undoRemove(a), "link-btn");
    parts.push(el("p", { class: "removal", "aria-live": "polite" },
      `Removed. ${name} no longer reads ${a.removal.what ?? `"${a.removal.label}"`}. Your file stays on this Mac. `, undo));
    queueMicrotask(() => { if (a.removal?.focus) { undo.focus(); a.removal.focus = false; } });
  }
  if (a.references?.packed) {
    const p = a.references.packed;
    parts.push(el("p", "dna-row", `${p.label} · ${p.size}`));
    host.replaceChildren(...parts);
    return;
  }
  const live = filesOf(a).filter((f) => !f.removed);
  if (!live.length) {
    parts.push(el("div", "knows-actions", btn("Add references", () => E.topUp(a), "btn primary")));
    host.replaceChildren(...parts);
    return;
  }
  for (const f of live) {
    const use = btn(f.off ? "Off" : "On", () => {
      a.references.files = toggleUse(a.references.files, f.id);
      renderDna(a);
      $("knows").querySelector(`[data-file="${f.id}"] .dna-use`)?.focus();
    }, "link-btn quiet dna-use", { "aria-pressed": String(!f.off), "aria-label": `Use ${f.name}` });
    parts.push(el("div", { class: `dna-row dna-look${f.off ? " is-off" : ""}`, "data-file": f.id },
      el("span", "ref-name", f.name),
      el("span", "ref-size", f.off ? `Off · ${name} won't read this` : f.size ?? ""),
      use,
      btn("Remove", () => E.removeFile(a, f), "link-btn quiet", { title: `${name} stops reading it. The file stays on your Mac.` })));
  }
  const total = a.references?.total;
  if (total && total > live.length) parts.push(el("p", "dna-quiet small", `Showing ${live.length} of ${total}.`));
  host.replaceChildren(...parts);
}

function renderQuality(a) {
  const host = $("dna-quality");
  if (!a) { host.replaceChildren(); return; }
  const map = a.map ?? [];
  const q = qualityFrom(skillsFromMap(map, loadProfile(a.id).picks), filesOf(a));
  const lines = q.lines.map((l) => {
    let action = null;
    if (l.action === "Add a reference" && store.agents.includes(a)) {
      const line = map.find((m) => m.id === l.skill);
      action = btn(l.action, () => E.addForLine(a, line), "link-btn");
    } else if (l.action === "Remove") {
      const f = filesOf(a).find((x) => x.id === l.file);
      action = btn(l.action, () => E.removeFile(a, f), "link-btn quiet");
    }
    return el("div", "dna-row dna-q", el("span", "dna-q-kind", l.kind), el("span", "dna-q-text", l.text), action);
  });
  host.replaceChildren(el("p", "dna-quality-summary dna-quality-glow", q.overall), ...lines);
}

// ── Passage ───────────────────────────────────────────────────────────────

export function showPassage(a, r, line) {
  if (!showingDna(a)) { showing = a.id; select(true); }
  passage = { a };
  const panel = passagePanel(r, a, { back: "DNA", onBack: back, behind: line?.text });
  $("dna").hidden = true;
  $("dna-passage").hidden = false;
  $("dna-passage").replaceChildren(panel);
  panel.querySelector("button")?.focus();
}

function back() {
  const { a } = passage;
  passage = null;
  $("dna-passage").hidden = true;
  $("dna").hidden = false;
  renderDna(a);
}

// ── Old names, kept so blocks B, D and E keep working ─────────────────────

export const showSketch = showProfile;
export const showKnows = showDna;
export const showingKnows = showingDna;
export function renderKnows(a) {
  if (!a) return;
  if (P2.state.agent?.id === a.id && !$("sketch-scroll").hidden) renderProfile(a);
  renderDna(a);
}
