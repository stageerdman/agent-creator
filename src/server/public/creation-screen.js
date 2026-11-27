/* creation-screen.js: the split creation screen.
 *
 * Left, the field: one firefly per file of the new agent, added as each upload batch lands
 * (dim = not used yet, bright = used, red = removed but still baked in until a full rebuild).
 * Right, the menu: the agent's DNA and name, then System prompt, Knowledge and Skills.
 * While anything is dragged (files from Finder, or a firefly from the field) the three sections
 * are drop zones: Adjust DNA, Adjust Knowledge, Create new skill.
 *
 *   import { mountCreation } from '/creation-screen.js';
 *   const screen = mountCreation({ reduced });   // the markup lives in new-agent.html
 *   screen.grow(dna)        // during the upload: after each batch (the agent's whole DNA so far)
 *   screen.open(agent)      // the split: the menu comes in, the field stays
 *
 * Spec: updates/2026-11-27 CREATION-SCREEN/03-jony-build.md. The pure helpers below are tested in
 * creation-screen.test.mjs; everything after mountCreation touches the DOM.
 */

import { BATCH, chunks } from './file-intake.js';
import { FLY, hash, rng, entriesOfDrop } from './firefly-orbit.js';
import { createDna } from './fireflies-dna.js';
import { nameOf } from './agent-list.js';

export const MENU_W = 380;        // the menu's width, css px; the field is the rest of the window
export const FIELD_CAP = 3000;    // fireflies drawn at most; the count line always tells the real number
export const BELT_CAP = 48;       // dots on a belt at most; the list shows every file
export const RED = '#FF6B5E';
export const HIT = 8;             // px around a firefly that still picks it up
export const FADE_IN = 300;       // ms a new firefly takes to appear
export const DRAG_END = 150;      // ms after the last dragover that a Finder drag counts as gone
export const SAVE_AFTER = 800;    // ms of quiet typing before a popup saves
export const NOTE_FOR = 6000;     // ms a confirmation line (with Undo) stays

/* ---------- pure: uploads ---------- */

/* Posts `list` in BATCH-sized parts, one after another; onBatch(result, sentSoFar) after each.
   → the last part's result (null for an empty list). */
export async function postInBatches(list, post, onBatch = () => {}, size = BATCH) {
  let last = null, sent = 0;
  for (const part of chunks(list, size)) { last = await post(part); sent += part.length; onBatch(last, sent); }
  return last;
}

/* ---------- pure: the field ---------- */

/* A file's own spot in the field, 0..1 each way: the same path always lands in the same place. */
export function spotOf(path) { const r = rng(hash('field:' + path)); return { x: r(), y: r() }; }

/* dna: [{ id (the path), name, sizeBytes, state }] in upload order. Only the first `cap` are drawn,
   so a 10,000-file folder costs the same as a 3,000-file one. → { total, dots: [{ id, name, size, state, x, y }] } */
export function fieldLayout(dna, { width, height, pad = 32, cap = FIELD_CAP }) {
  const w = Math.max(0, width - 2 * pad), h = Math.max(0, height - 2 * pad);
  const dots = dna.slice(0, cap).map(f => {
    const s = spotOf(f.id);
    return { id: f.id, name: f.name, size: f.sizeBytes ?? null, state: f.state, x: pad + s.x * w, y: pad + s.y * h };
  });
  return { total: dna.length, dots };
}

/* How a firefly glows by its file's state. */
export function dotLook(state) {
  if (state === 'removed') return { color: RED, alpha: .9, halo: true };
  if (state === 'processed') return { color: FLY, alpha: .9, halo: true };
  return { color: FLY, alpha: .32, halo: false };
}

/* The nearest drawn firefly within `hit` px of (x, y), or null. */
export function dotAt(dots, x, y, hit = HIT) {
  let best = null, bestD = hit * hit;
  for (const d of dots) { const dd = (d.x - x) ** 2 + (d.y - y) ** 2; if (dd <= bestD) { best = d; bestD = dd; } }
  return best;
}

const fmt = n => n.toLocaleString('en-US');
export function countLine(total, cap = FIELD_CAP) {
  if (!total) return '';
  return `${fmt(total)} ${total === 1 ? 'file' : 'files'}` + (total > cap ? ` · ${fmt(cap)} shown` : '');
}

/* ---------- pure: the menu ---------- */

/* What a section's belt says under its title. files: [{ state }]. */
export function sectionLine(files) {
  if (!files.length) return 'nothing yet · drag a firefly here';
  const n = s => files.filter(f => f.state === s).length;
  const parts = [[n('processed'), 'used'], [n('unprocessed'), 'waiting'], [n('removed'), 'out at next rebuild']];
  return parts.filter(([k]) => k > 0).map(([k, w]) => `${fmt(k)} ${w}`).join(' · ');
}

/* A section's list after DELETE /files answered { path, state }. Never used anywhere ("gone"): it leaves
   every list. Already baked in somewhere ("removed"): it stays red where it was used and leaves the
   sections that had not used it yet (the server's own sectionFiles rule). */
export function applyRemove(files, { path, state }) {
  if (state === 'gone') return files.filter(f => f.path !== path);
  return files.filter(f => f.path !== path || f.state !== 'unprocessed')
              .map(f => (f.path === path ? { ...f, state: 'removed' } : f));
}

/* ---------- pure: drop zones ---------- */

export const ZONES = { 'system-prompt': 'Adjust DNA', knowledge: 'Adjust Knowledge', skills: 'Create new skill' };
export const zoneLabel = section => ZONES[section] ?? null;
const TITLES = { 'system-prompt': 'System prompt', knowledge: 'Knowledge', skills: 'Skills' };

/* zones: [{ section, left, top, right, bottom }] → the section under (x, y), or null. */
export function zoneAt(zones, x, y) {
  const z = zones.find(r => x >= r.left && x < r.right && y >= r.top && y < r.bottom);
  return z ? z.section : null;
}

/* A new skill's name: the dropped folder's name, else the first file's name without its extension. */
export function skillName(files) {
  const paths = files.map(f => String(f.path || '')).filter(Boolean);
  if (!paths.length) return 'New skill';
  const top = paths[0].split('/')[0];
  if (paths[0].includes('/') && paths.every(p => p.startsWith(top + '/'))) return top;
  return paths[0].split('/').pop().replace(/\.[^.]+$/, '').trim() || 'New skill';
}

/* The requests a drop makes, in order, relative to /api/agents/:id/. Files from Finder are new to the
   agent, so they are added first (known: false); fireflies from the field are already in it.
   section null: dropped on the field, the files simply join the agent. */
export function dropPlan(section, entries, { known = false } = {}) {
  const files = entries.map(({ path, size }) => ({ path, size }));
  const steps = known ? [] : chunks(files).map(part => ({ method: 'POST', url: 'files', body: { files: part } }));
  if (section === 'skills') steps.push({ method: 'POST', url: 'skills', body: { name: skillName(files), files } });
  else if (section) for (const part of chunks(files)) steps.push({ method: 'POST', url: `sections/${encodeURIComponent(section)}/files`, body: { files: part } });
  return steps;
}

/* The line after a drop. */
export function dropNote(section, count) {
  const what = `${fmt(count)} ${count === 1 ? 'file' : 'files'}`;
  if (section === 'skills') return `New skill from ${what}`;
  return section ? `${what} → ${TITLES[section]}` : `${what} added`;
}

/* ---------- the screen (DOM) ---------- */

async function call(method, url, body) {
  const r = await fetch(url, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `${method} ${url} ${r.status}`);
  return data;
}

export function mountCreation({ doc = document, reduced = false } = {}) {
  const $ = s => doc.querySelector(s);
  const body = doc.body, win = doc.defaultView;
  const field = createField($('#flies'), () => reduced);
  const count = $('#count'), menu = $('#menu');
  const sections = { 'system-prompt': [], knowledge: [] };
  let agent = null, skills = [], emblem = null, opened = false;
  const base = () => `/api/agents/${encodeURIComponent(agent.id)}/`;

  /* ---- the upload: fireflies arrive batch by batch ---- */
  let countTimer = 0;
  function grow(dna) {
    field.set(dna || []);
    count.textContent = countLine(field.total());
    if (!countTimer && !opened) countTimer = win.setTimeout(() => body.classList.add('counting'), 600);
  }

  /* ---- the split ---- */
  function open(a, { still = false } = {}) {
    agent = a; opened = true;
    win.clearTimeout(countTimer);
    field.set(a.dna || [], { still });
    count.textContent = countLine(field.total());
    $('#name').textContent = nameOf(a);
    emblem = createDna($('#emblem'), { name: nameOf(a), files: a.dna || [] });
    let last = win.performance.now(), emblemIdle = false;
    const frame = t => { const dt = Math.min(.1, (t - last) / 1000); last = t; if (emblem.draw(t, dt, reduced) || !reduced) win.requestAnimationFrame(frame); else emblemIdle = true; };
    win.requestAnimationFrame(frame);
    wake = () => { if (emblemIdle) { emblemIdle = false; win.requestAnimationFrame(frame); } };
    body.classList.add('split');
    menu.removeAttribute('inert');
    reloadMenu();
  }
  let wake = () => {};

  async function reloadAgent() {
    const a = await call('GET', `/api/agents/${encodeURIComponent(agent.id)}`);
    agent = a; setDna(a.dna || []);
  }
  function setDna(dna) {
    agent.dna = dna; field.set(dna);
    count.textContent = countLine(field.total());
    if (emblem) { emblem.setFiles(dna); wake(); }
  }
  async function reloadMenu() {
    await Promise.all([
      ...Object.keys(sections).map(async s => { sections[s] = (await call('GET', base() + `sections/${s}/files`)).files; renderSection(s); }),
      (async () => { skills = (await call('GET', base() + 'skills')).skills; renderSkills(); })(),
    ]).catch(e => note(`Couldn't load the menu. ${e.message}`));
  }

  /* ---- a section: its belt and its list ---- */
  function renderSection(s) {
    const sec = menu.querySelector(`[data-section="${s}"]`), files = sections[s];
    const belt = sec.querySelector('.belt'), dots = belt.querySelector('.dots'), line = sectionLine(files);
    dots.replaceChildren(...files.slice(0, BELT_CAP).map(f => dot(f.state)));
    belt.querySelector('.line').textContent = line;
    belt.setAttribute('aria-label', `${TITLES[s]} files: ${line}`);
    belt.disabled = !files.length;
    if (!files.length && belt.getAttribute('aria-expanded') === 'true') toggle(s, false);
    if (belt.getAttribute('aria-expanded') === 'true') renderRows(s);
  }
  function dot(state) { const i = doc.createElement('i'); i.className = 'd ' + state; return i; }
  function renderRows(s) {
    const ul = menu.querySelector(`[data-section="${s}"] .rows`);
    ul.replaceChildren(...sections[s].map(f => {
      const li = doc.createElement('li'); li.className = f.state;
      const name = doc.createElement('span'); name.className = 'n'; name.textContent = f.name; name.title = f.path;
      li.append(dot(f.state), name);
      if (f.state === 'removed') {
        const out = doc.createElement('span'); out.className = 'out'; out.textContent = 'out at next rebuild'; li.append(out);
      } else {
        const b = doc.createElement('button'); b.type = 'button'; b.textContent = 'Remove'; b.setAttribute('aria-label', `Remove ${f.name}`);
        b.addEventListener('click', () => remove(f)); li.append(b);
      }
      return li;
    }));
  }
  /* Opening: the belt's fireflies fly down into the rows (FLIP), one under another. */
  function toggle(s, want) {
    const sec = menu.querySelector(`[data-section="${s}"]`), belt = sec.querySelector('.belt'), ul = sec.querySelector('.rows');
    const on = want ?? belt.getAttribute('aria-expanded') !== 'true';
    if (!on) { belt.setAttribute('aria-expanded', 'false'); ul.hidden = true; sec.classList.remove('open'); return; }
    const from = [...belt.querySelectorAll('.d')].map(d => d.getBoundingClientRect());
    renderRows(s); ul.hidden = false; belt.setAttribute('aria-expanded', 'true'); sec.classList.add('open');
    if (reduced) return;
    [...ul.querySelectorAll('.d')].slice(0, from.length).forEach((d, i) => {
      const to = d.getBoundingClientRect(), f = from[i];
      d.animate?.([{ transform: `translate(${f.left - to.left}px, ${f.top - to.top}px)` }, { transform: 'none' }],
        { duration: 360, delay: Math.min(i, 24) * 12, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    });
    ul.querySelectorAll('.n, .out, button').forEach(el => el.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 160, fill: 'backwards' }));
  }

  /* ---- remove (from the agent, never from the Mac) ---- */
  async function remove(f) {
    const was = Object.keys(sections).filter(s => sections[s].some(g => g.path === f.path && g.state !== 'removed'));
    let res;
    try { res = await call('DELETE', base() + 'files?path=' + encodeURIComponent(f.path)); }
    catch (e) { return note(`Couldn't remove ${f.name}. ${e.message}`); }
    for (const s of Object.keys(sections)) { sections[s] = applyRemove(sections[s], res); renderSection(s); }
    setDna(res.dna || []);
    const size = f.size;
    note(`${f.name} removed from ${nameOf(agent)}, not from your Mac`, async () => {
      for (const step of dropPlan(null, [{ path: f.path, size }])) await call(step.method, base() + step.url, step.body);
      for (const s of was) await call('POST', base() + `sections/${encodeURIComponent(s)}/files`, { files: [{ path: f.path, size }] });
      await reloadAgent(); await reloadMenu();
    });
  }

  /* ---- skills: one star each ---- */
  function renderSkills() {
    const box = menu.querySelector('[data-section="skills"] .stars');
    const line = menu.querySelector('[data-section="skills"] .line');
    line.textContent = skills.length ? '' : 'nothing yet · drag files here';
    line.hidden = !!skills.length;
    box.replaceChildren(...skills.map(k => {
      const b = doc.createElement('button'); b.type = 'button'; b.className = 'star'; b.title = k.name; b.setAttribute('aria-label', `Open skill ${k.name}`);
      b.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0 9.5 6.5 16 8 9.5 9.5 8 16 6.5 9.5 0 8 6.5 6.5Z"/></svg>';
      b.addEventListener('click', () => sheet.open('skill', k.id));
      return b;
    }));
  }

  /* ---- the popup: one for the system prompt, the knowledge and each skill; it saves itself ---- */
  const sheet = createSheet(doc, {
    load: async (kind, id) => kind === 'system-prompt' ? { title: 'System prompt', text: (await call('GET', base() + 'system-prompt')).text }
      : kind === 'knowledge' ? { title: 'Knowledge', text: (await call('GET', base() + 'knowledge')).text, readOnly: true }
      : (k => ({ title: k.name, name: k.name, text: k.body }))(await call('GET', base() + 'skills/' + encodeURIComponent(id))),
    save: async (kind, id, { name, text }) => {
      if (kind === 'system-prompt') return call('PUT', base() + 'system-prompt', { text });
      const k = await call('PUT', base() + 'skills/' + encodeURIComponent(id), { name, body: text });
      const i = skills.findIndex(x => x.id === id); if (i >= 0 && skills[i].name !== k.name) { skills[i] = { ...skills[i], name: k.name }; renderSkills(); }
      return k;
    },
  });

  menu.addEventListener('click', e => {
    const icon = e.target.closest('[data-open]'); if (icon) return sheet.open(icon.dataset.open);
    const belt = e.target.closest('.belt'); if (belt) toggle(belt.closest('[data-section]').dataset.section);
  });

  /* ---- the confirmation line (with Undo when there is one) ---- */
  const noteEl = $('#note'), noteText = noteEl.querySelector('span'), undoBtn = noteEl.querySelector('button');
  let noteTimer = 0, undoFn = null;
  function note(text, undo = null) {
    win.clearTimeout(noteTimer);
    noteText.textContent = text; undoFn = undo; undoBtn.hidden = !undo; noteEl.classList.add('on');
    noteTimer = win.setTimeout(() => { noteEl.classList.remove('on'); undoFn = null; undoBtn.hidden = true; }, NOTE_FOR);
  }
  undoBtn.addEventListener('click', async () => {
    const fn = undoFn; if (!fn) return;
    undoFn = null; undoBtn.hidden = true; win.clearTimeout(noteTimer); noteEl.classList.remove('on');
    try { await fn(); } catch (e) { note(`Couldn't undo. ${e.message}`); }
  });

  /* ---- drop zones: while anything is dragged ---- */
  const zoneRects = () => [...menu.querySelectorAll('[data-section]')].map(el => { const r = el.getBoundingClientRect(); return { section: el.dataset.section, left: r.left, top: r.top, right: r.right, bottom: r.bottom }; });
  function hover(x, y) {
    body.classList.add('dragging');
    const hot = zoneAt(zoneRects(), x, y);
    menu.querySelectorAll('[data-section]').forEach(el => el.classList.toggle('hot', el.dataset.section === hot));
    return hot;
  }
  function endDrag() { body.classList.remove('dragging'); menu.querySelectorAll('.hot').forEach(el => el.classList.remove('hot')); }

  let busyDrop = false;
  async function drop(section, entries, known) {
    if (!entries.length || busyDrop) return;
    busyDrop = true;
    try {
      for (const step of dropPlan(section, entries, { known })) await call(step.method, base() + step.url, step.body);
      note(dropNote(section, entries.length));
      await reloadAgent(); await reloadMenu();
    } catch (e) { note(`Couldn't add the files. ${e.message}`); }
    finally { busyDrop = false; }
  }

  // Files from Finder. dragenter/over fire for every element crossed: the drag ends DRAG_END ms after the last one.
  let dragTimer = 0;
  const filesIn = e => [...(e.dataTransfer?.types || [])].includes('Files');
  function over(e) {
    if (!opened || !filesIn(e)) return;
    e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
    hover(e.clientX, e.clientY);
    win.clearTimeout(dragTimer); dragTimer = win.setTimeout(endDrag, DRAG_END);
  }
  win.addEventListener('dragenter', over);
  win.addEventListener('dragover', over);
  win.addEventListener('drop', async e => {
    if (!opened) return;
    e.preventDefault();
    const section = zoneAt(zoneRects(), e.clientX, e.clientY);
    win.clearTimeout(dragTimer); endDrag();
    if (!filesIn(e)) return;
    drop(section, await entriesOfDrop(e.dataTransfer), false);
  });

  // A firefly from the field: pick it up, carry it, let go on a zone.
  const canvas = $('#flies'), ghost = $('#ghost');
  let carried = null;
  canvas.addEventListener('pointermove', e => { if (opened && !carried) canvas.style.cursor = field.at(e.clientX, e.clientY) ? 'grab' : ''; });
  canvas.addEventListener('pointerdown', e => {
    if (!opened || e.button !== 0) return;
    const d = field.at(e.clientX, e.clientY); if (!d) return;
    carried = d; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing';
    const look = dotLook(d.state);
    Object.assign(ghost.style, { background: look.color, opacity: look.alpha, transform: `translate(${e.clientX}px, ${e.clientY}px)` });
    ghost.classList.add('on'); field.lift(d.id); hover(e.clientX, e.clientY);
  });
  canvas.addEventListener('pointermove', e => {
    if (!carried) return;
    ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; hover(e.clientX, e.clientY);
  });
  const letGo = e => {
    if (!carried) return;
    const d = carried; carried = null; canvas.style.cursor = '';
    const section = e.type === 'pointerup' ? zoneAt(zoneRects(), e.clientX, e.clientY) : null;
    ghost.classList.remove('on'); field.lift(null); endDrag();
    if (section) drop(section, [{ path: d.id, size: d.size }], true);
  };
  canvas.addEventListener('pointerup', letGo);
  canvas.addEventListener('pointercancel', letGo);

  win.addEventListener('resize', () => field.redraw());

  return {
    grow, open, isOpen: () => opened,
    setReduced(v) { reduced = !!v; wake(); },
    info: () => ({ split: opened, field: field.info(), sections: Object.fromEntries(Object.entries(sections).map(([s, f]) => [s, f.map(x => ({ path: x.path, state: x.state }))])), skills: skills.map(k => k.name) }),
  };
}

/* The field's canvas: drawn only when something changes (and for FADE_IN ms after new fireflies). */
function createField(canvas, isReduced) {
  const ctx = canvas.getContext('2d'), win = canvas.ownerDocument.defaultView;
  let dna = [], dots = [], total = 0, raf = 0, lifted = null;
  const born = new Map();
  function set(next, { still = false } = {}) {
    const t = still ? -1e9 : win.performance.now();
    for (const f of next) if (!born.has(f.id)) born.set(f.id, t);
    dna = next; redraw();
  }
  function redraw() { if (!raf) raf = win.requestAnimationFrame(paint); }
  function paint(t) {
    raf = 0;
    const W = win.innerWidth, H = win.innerHeight, dpr = Math.min(2, win.devicePixelRatio || 1);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    const lay = fieldLayout(dna, { width: Math.max(160, W - MENU_W), height: H }); dots = lay.dots; total = lay.total;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    let fading = false;
    for (const d of dots) {
      const look = dotLook(d.state), age = t - (born.get(d.id) ?? -1e9);
      let a = look.alpha;
      if (age < FADE_IN && !isReduced()) { a *= Math.max(0, age) / FADE_IN; fading = true; }
      if (d.id === lifted) a *= .2;
      ctx.fillStyle = look.color;
      if (look.halo) { ctx.globalAlpha = a * .16; ctx.beginPath(); ctx.arc(d.x, d.y, 5, 0, 6.2832); ctx.fill(); }
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(d.x, d.y, 1.8, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (fading) redraw();
  }
  return {
    set, redraw, total: () => dna.length,
    at: (x, y) => dotAt(dots, x, y),
    lift(id) { lifted = id; redraw(); },
    info: () => ({ total: dna.length, drawn: dots.length, dots: dots.slice(0, 50).map(d => ({ id: d.id, state: d.state, x: Math.round(d.x), y: Math.round(d.y) })) }),
  };
}

/* The popup. Opens at once, fills in when loaded, saves SAVE_AFTER ms after typing stops and again on close. */
function createSheet(doc, { load, save }) {
  const dlg = doc.querySelector('#sheet'), win = doc.defaultView;
  const title = dlg.querySelector('#sheet-title'), nameIn = dlg.querySelector('#sheet-name'), text = dlg.querySelector('#sheet-text'), err = dlg.querySelector('.err');
  let cur = null, timer = 0, dirty = false;
  const PLACEHOLDER = { 'system-prompt': 'Write who this agent is.', knowledge: 'nothing studied yet', skill: 'What this skill does, step by step.' };

  async function flush() {
    win.clearTimeout(timer);
    if (!cur || !dirty || cur.readOnly) return;
    dirty = false;
    const { kind, id } = cur;
    try { await save(kind, id, { name: nameIn.value.trim() || undefined, text: text.value }); err.textContent = ''; }
    catch (e) { dirty = true; err.textContent = `Couldn't save. Your words are still here. ${e.message}`; }
  }
  const later = () => { dirty = true; win.clearTimeout(timer); timer = win.setTimeout(flush, SAVE_AFTER); };
  text.addEventListener('input', later);
  nameIn.addEventListener('input', () => { if (nameIn.value.trim()) title.textContent = nameIn.value.trim(); later(); });
  dlg.addEventListener('close', () => { flush(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });   // the backdrop

  async function open(kind, id = null) {
    if (dlg.open) await flush();
    const me = cur = { kind, id, readOnly: kind === 'knowledge' };
    dirty = false; err.textContent = '';
    title.textContent = { 'system-prompt': 'System prompt', knowledge: 'Knowledge' }[kind] || '';
    nameIn.hidden = kind !== 'skill'; nameIn.value = '';
    text.value = ''; text.readOnly = me.readOnly; text.placeholder = PLACEHOLDER[kind]; text.disabled = true;
    if (!dlg.open) dlg.showModal();
    try {
      const got = await load(kind, id);
      if (cur !== me) return;
      title.textContent = got.title; text.value = got.text || ''; if (kind === 'skill') nameIn.value = got.name || '';
      text.disabled = false; if (!me.readOnly) text.focus();
    } catch (e) { if (cur === me) err.textContent = `Couldn't open it. ${e.message}`; }
  }
  return { open };
}
