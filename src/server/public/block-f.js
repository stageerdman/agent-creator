// Block F: share. Export (F1), import with its name clash and broken file
// (F2), and the imported agent before first open (F3). design-jony-block-F.md.
// The prototype writes no file: Export and Show in Finder are mock.

import { el, btn, bus, store, nameOf, shortName, face, sheet, closeSheet, picker, wait, nowIso } from "/components.js";
import { nav } from "/block-a.js";
import * as B from "/block-b.js";

const words = (text = "") => (text.trim() ? text.trim().split(/\s+/).length : 0);
const FOLDERS = ["Desktop", "Documents", "Downloads"];
let folder = "Desktop";
const written = {}; // folder → Set of file names already exported there

const dl = (rows) => el("dl", "facts", ...rows.flatMap(([k, v]) => [el("dt", "", k), el("dd", "", v)]));
const faceWord = (a) => (a.face?.kind === "photo" ? "photo" : a.face?.src ? "icon" : "letter");

function knowledge(a) {
  const r = a.references ?? {};
  if (a.study && a.study.state !== "finished" && !a.topUp) return `from ${a.study.done} of ${a.study.total} references so far`;
  if (r.packed) return `packed · ${r.packed.size}`;
  const live = (r.total ?? 0) - (r.files ?? []).filter((f) => f.removed).length;
  return live > 0 ? `from ${live} references · ${r.size}` : "none, only the Sketch";
}

// ── F1 Export ─────────────────────────────────────────────────────────────

export function openExport(a) {
  if (!a?.keptAt || a.real) return;
  const name = nameOf(a);
  const studying = a.study && a.study.state !== "finished" && !a.topUp;
  const size = a.references?.packed?.size ?? (a.references?.total ? a.references.size : "1 MB");
  const fileName = () => {
    const taken = written[folder] ?? new Set();
    let n = `${name}.agent.zip`;
    for (let i = 2; taken.has(n); i += 1) n = `${name} ${i}.agent.zip`;
    return n;
  };
  const where = el("p", "export-where", `${folder} · `, btn("Change…", () => picker("Export to", FOLDERS.map((f) => ({ name: f })), (it) => { folder = it.name; openExport(a); }), "link-btn"));
  const exportBtn = btn("Export", async () => {
    exportBtn.textContent = "Exporting…";
    exportBtn.disabled = true;
    await wait(700);
    const done = fileName();
    (written[folder] ??= new Set()).add(done);
    exported(a, done);
  }, "btn primary", { "data-focus": "" });
  sheet({
    title: `Export ${name}`,
    body: [
      el("div", "export-who", face(a, 48), el("h3", "sheet-h", "Packed")),
      dl([["Name", name], ["Instructions", `${words(`${a.draft.persona ?? ""} ${a.draft.instructions ?? ""}`)} words`],
        ["Face", faceWord(a)], ["Knowledge", knowledge(a)]]),
      studying ? el("p", "sheet-note", "Studying isn't finished. The file has what's studied so far.") : null,
      el("h3", "sheet-h", "Stays here"),
      el("ul", "stays", el("li", "", `What ${shortName(a)} knows (only you see it)`), el("li", "", `Your talks with ${shortName(a)}`)),
      el("p", "export-file", `One file: ${fileName()} · about ${size}`),
      where,
    ],
    actions: [btn("Cancel", () => closeSheet(), "btn"), exportBtn],
  });
}

function exported(a, fileName) {
  sheet({
    title: `Export ${nameOf(a)}`,
    body: [el("p", "", `Exported · ${fileName}`)],
    actions: [
      btn("Done", () => closeSheet(), "btn"),
      btn("Show in Finder", () => { closeSheet(); toastFinder(fileName); }, "btn primary", { "data-focus": "", "data-mock": "" }),
    ],
  });
}

function toastFinder(fileName) {
  const host = document.getElementById("toast");
  const t = el("div", { class: "toast", role: "status", "data-mock": "" }, `(Demo) Finder would show ${fileName} in ${folder}.`);
  host.replaceChildren(t);
  setTimeout(() => t.remove(), 5000);
}

// ── F2 Import ─────────────────────────────────────────────────────────────

export function importFile(file) {
  const info = store.demo.imports[file];
  if (!info) {
    return sheet({ title: `Can't import ${file}`, body: [el("p", "", "This isn't an agent file.")], actions: [btn("OK", () => closeSheet(), "btn primary", { "data-focus": "" })] });
  }
  if (!info.valid) return broken(info);
  const template = store.templates[info.name.toLowerCase()];
  const existing = store.agents.find((a) => nameOf(a) === info.name);
  const preview = { id: "preview", keptAt: nowIso(), draft: { name: info.name }, face: { kind: "icon", src: template?.face?.iconOptions?.[0] ?? null } };
  const list = [el("div", "export-who", face(preview, 48)),
    dl([["Name", info.name], ["Instructions", `${(info.persona ?? 0) + (info.instructions ?? 0)} words`], ["Face", info.face], ["Knowledge", info.knowledge]])];
  if (!existing) {
    return sheet({
      title: `Import ${info.name}?`,
      body: [...list, el("p", "sheet-note", "Nothing is added until you press Import.")],
      actions: [btn("Cancel", () => closeSheet(), "btn"), btn("Import", () => add(info, info.name), "btn primary", { "data-focus": "" })],
    });
  }
  const talks = existing.talks?.length ?? 0;
  const his = ({ he: "his", she: "her" })[{ rex: "he", marcus: "he", ines: "she", edie: "she", juno: "she" }[existing.id]] ?? "its";
  const refs = existing.references?.total ? `, ${his} references` : "";
  const consequence = el("p", { id: "replace-why", class: "sheet-note warn" },
    `Replace: your ${info.name}${refs} and ${his} ${talks} ${talks === 1 ? "talk" : "talks"} go. This can't be undone.`);
  sheet({
    title: `Import ${info.name}?`,
    body: [...list, el("p", "", `You already have ${info.name}.`)],
    actions: [
      btn("Cancel", () => closeSheet(), "btn"),
      el("span", "grow"),
      btn(`Replace ${info.name}`, () => add(info, info.name, existing), "btn", { "aria-describedby": "replace-why" }),
      btn("Keep both", () => add(info, freeName(info.name)), "btn primary", { "data-focus": "" }),
    ],
  }).append(consequence);
}

function freeName(name) {
  const names = new Set(store.agents.map(nameOf));
  let i = 2;
  while (names.has(`${name} ${i}`)) i += 1;
  return `${name} ${i}`;
}

function broken(info) {
  const details = el("pre", "details", info.details);
  details.hidden = true;
  const toggle = btn("Details ▸", () => { details.hidden = !details.hidden; toggle.textContent = `Details ${details.hidden ? "▸" : "▾"}`; }, "link-btn quiet", { "aria-expanded": "false" });
  sheet({
    title: `Can't import ${info.file}`,
    body: [el("p", "", "This file can't be opened. It's from an older version of Agent Creator, or it's damaged."), toggle, details],
    actions: [btn("OK", () => closeSheet(), "btn primary", { "data-focus": "" })],
  });
}

function add(info, name, replace) {
  const base = structuredClone(store.templates[info.name.toLowerCase()]);
  const id = replace ? replace.id : name === info.name ? base.id : `${base.id}-${name.split(" ").pop()}`;
  if (replace) B.stopTimers(replace);
  const a = {
    ...base, id, mock: true, order: replace?.order ?? store.agents.length + 1,
    draft: { ...base.draft, name, ...(info.agent ?? {}), status: "saved" },
    keptAt: nowIso(), openedAt: null, importedFrom: info.file, talks: [], study: null, likeness: null,
    references: { root: null, packed: { label: `Packed knowledge from ${info.file}`, size: info.knowledge.replace(/^packed · /, "") }, total: 0, size: info.knowledge.replace(/^packed · /, ""), files: [], groups: [], aside: [], batches: [] },
    firstWords: { line: base.firstWords?.line || "", at: null },
  };
  if (info.agent) a.map = []; // a different person with the same name: nothing of ours carries over
  store.agents = [...store.agents.filter((x) => x.id !== id), a];
  store.deleted.delete(id);
  closeSheet();
  nav.home();
  bus.emit("changed");
}
