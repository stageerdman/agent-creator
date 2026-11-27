/* creation-screen.js: the split creation screen.
 *
 * Left, the field: one firefly per file of the new agent, added as each upload batch lands
 * (dim = not used yet, bright = used, red = removed but still baked in until a full rebuild).
 * Every firefly wanders the whole field, slowly, with pauses, and now and then shines, very dim;
 * none can be dragged (wanderAt).
 * Right, the menu: the agent's name (click to rename), then System prompt, Knowledge and Skills.
 * System prompt and Knowledge hold a loose seeded cluster of fireflies; a tap flies each one to its
 * own ordered spot beside its file name, a second tap flies them back.
 * While files are dragged in from Finder the three sections are drop zones: Adjust DNA,
 * Adjust Knowledge, Create new skill. No counts and no status words anywhere: the fireflies say it.
 *
 *   import { mountCreation } from '/creation-screen.js';
 *   const screen = mountCreation({ reduced });   // the markup lives in new-agent.html
 *   screen.adopt(orbit.release())   // the hand-over: the orbit's 30 live fireflies fly out to their files
 *   screen.feed(entries)    // as entries are read: the field lights them (≤ 24 a frame), server not needed
 *   screen.fail()           // a failed save: the lights fade where they are, the field is empty again
 *   screen.open(agent)      // saved: the name and sections fill in; the field stays
 *
 * Spec: updates/2026-11-27 CREATION-SCREEN/03-jony-build.md. The pure helpers below are tested in
 * creation-screen.test.mjs; everything after mountCreation touches the DOM.
 */

import { BATCH, chunks, entriesOfDrop } from './file-intake.js';
import { FLY, WAKE, hash, rng, inQuad, outQuad, inOutQuad, clampR, dnaSprite } from './firefly-orbit.js';
import { nameOf } from './agent-list.js';

export const MENU_W = 380;        // the menu's width, css px; the field is the rest of the window
export const FIELD_CAP = 3000;    // fireflies drawn at most
export const BELT_CAP = 48;       // fireflies in a closed cluster at most; opened, every file shows
export const RED = '#FF6B5E';
export const FADE_IN = 300;       // ms a new firefly takes to appear
export const CLUSTER_H = 56;      // px, a closed cluster's height
export const ROW = 28;            // px between ordered spots when a cluster is open
export const FLIGHT = 640;        // ms one firefly's flight takes
export const STAGGER = 30;        // ms between one firefly's start and the next (capped)
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

/* ---------- pure: alive, but calm (fix 2; the wander: Reports/fireflies-wander-motion.md) ---------- */

export const SHINE_MAX = .22;     // alpha a shine adds, at most: never a flash
export const SHINE_MS = 2400;     // ms one shine takes, rise and fall
const TAU = 2 * Math.PI;
const BOUND_C = 1.3, BOUND_N = .94 / Math.sin(BOUND_C * .92);   // soft bounds: slow down and curve back near an edge

/* A field firefly's own wander, seeded by its id; the draws keep the recipe's order. Periods in ms. */
export function wanderParams(id) {
  const r = rng(hash('wander:' + id)), u = (a, b) => a + r() * (b - a);
  const PX1 = u(120e3, 180e3), PY1 = u(120e3, 180e3), fX1 = u(0, TAU), fY1 = u(0, TAU);   // long sway
  const PX2 = u(66e3, 96e3), PY2 = u(66e3, 96e3), fX2 = u(0, TAU), fY2 = u(0, TAU);       // medium sway
  const PL = u(30e3, 44e3) * (r() < .5 ? -1 : 1), fL = u(0, TAU);                         // the loop
  const Q1 = u(9e3, 15e3), p1 = u(0, TAU), Q2 = u(23e3, 35e3), p2 = u(0, TAU);             // pauses: the time warp
  const sp = u(.45, .65), every = u(16e3, 32e3), at = r();                                // pace, the shine's clock
  return { PX1, PY1, fX1, fY1, PX2, PY2, fX2, fY2, PL, fL, Q1, p1, Q2, p2, sp, every, at };
}

/* Where a field firefly is at t (ms) inside area { w, h, pad } and how much it shines: no state, the same
   inputs always give the same place. Reduced motion: its fixed home spot (fieldLayout's), no shine. */
export function wanderAt(id, t, { w, h, pad = 32 }, reduced = false, p = null) {
  const iw = Math.max(0, w - 2 * pad), ih = Math.max(0, h - 2 * pad);
  if (reduced) { const s = spotOf(id); return { x: pad + s.x * iw, y: pad + s.y * ih, glow: 0 }; }
  p = p || wanderParams(id);
  const tau = p.sp * (t - .5 * p.Q1 / TAU * Math.sin(TAU * t / p.Q1 + p.p1) - .25 * p.Q2 / TAU * Math.sin(TAU * t / p.Q2 + p.p2));
  const L = TAU * tau / p.PL + p.fL;
  const X = .46 * Math.sin(TAU * tau / p.PX1 + p.fX1) + .30 * Math.sin(TAU * tau / p.PX2 + p.fX2) + .16 * Math.cos(L);
  const Y = .46 * Math.sin(TAU * tau / p.PY1 + p.fY1) + .30 * Math.sin(TAU * tau / p.PY2 + p.fY2) + .16 * Math.sin(L);
  const x = pad + iw * (.5 + .5 * BOUND_N * Math.sin(BOUND_C * X)), y = pad + ih * (.5 + .5 * BOUND_N * Math.sin(BOUND_C * Y));
  const v = ((t / p.every + p.at) % 1 + 1) % 1 * p.every;
  return { x, y, glow: v < SHINE_MS ? SHINE_MAX * Math.sin(Math.PI * v / SHINE_MS) ** 2 : 0 };
}

/* A menu firefly's own slow rhythm (css drift and shine), seeded by its id. */
export function flyParams(id) {
  const r = rng(hash('fly:' + id));
  return {
    ax: 1.2 + r() * 1.8, ay: 1.2 + r() * 1.8,                  // px
    px: 14000 + r() * 12000, py: 14000 + r() * 12000,          // ms per sway, each way
    phx: r() * 6.2832, phy: r() * 6.2832,
    shineEvery: 12000 + r() * 12000, shineAt: r(),             // ms between shines, where in the cycle
  };
}

/* ---------- pure: the hand-over from the orbit (Reports/one-flow-magic-moment.md §5–§7) ---------- */

export const LEAVE_AFTER = 120;   // ms of wake before the first fly leaves the ring
export const LEAVE_SPREAD = 240;  // ms from the left-most fly leaving to the right-most
export const FLY_MS = 780;        // ms one fly's flight takes
export const SETTLE_MS = 600;     // ms at the end of a flight in which its light settles to rest dim
export const RETARGET = 400;      // ms a flight's end takes to slide to its file's real spot
export const POUR_FROM = 500;     // ms after the signal the further files start to light in place
export const POUR_MAX = 24;       // new lights per frame, at most
export const SHINE_AFTER = 1500;  // ms after landing before a firefly may shine
export const FAIL_MS = 900;       // ms the lights take to fade where they are after a failed save
export const XFADE = 300;         // ms of the Reduce Motion cross-fade, ring to field
export const LAND_R = 4.5;        // a flyer's sprite radius at landing: the look of a field dot
export const MENU_AT = 300;       // ms after the signal the menu starts to slide in
const clamp01 = x => Math.min(1, Math.max(0, x));

/* An entry as read ({ path, size }) as the field's file, the same shape and id the server's DNA has. */
export const asFile = e => ({ id: e.path, name: String(e.path).split('/').pop(), sizeBytes: e.size ?? null, state: 'unprocessed' });

/* The flies' positions at the signal → [{ i, delay }] in leaving order: left side first, 0–240 ms. */
export function leaveOrder(points) {
  const xs = points.map(p => p.x), lo = Math.min(...xs), span = Math.max(...xs) - lo || 1;
  return points.map((p, i) => ({ i, delay: LEAVE_AFTER + LEAVE_SPREAD * (p.x - lo) / span }))
    .sort((a, b) => a.delay - b.delay || a.i - b.i);
}

/* Where a flight is at raw progress u (0..1): a cubic from `from` to `to` whose first control point
   lies along the way it was moving (tan), so it leaves without stopping or turning back. */
export function flightAt(from, tan, to, u) {
  const k = inOutQuad(clamp01(u)), L = Math.hypot(to.x - from.x, to.y - from.y);
  const c1 = { x: from.x + tan.x * L * .35, y: from.y + tan.y * L * .35 };
  const c2 = { x: to.x + (c1.x - to.x) * .3, y: to.y + (c1.y - to.y) * .3 };
  const v = 1 - k, a = v * v * v, b = 3 * v * v * k, c = 3 * v * k * k, d = k * k * k;
  return { x: a * from.x + b * c1.x + c * c2.x + d * to.x, y: a * from.y + b * c1.y + c * c2.y + d * to.y };
}

/* A flyer's light at progress u: from its wake (.8) to the field's rest dim over the last SETTLE_MS.
   extra (no file for it): it melts into the grass along the way. */
export function flyerAlpha(u, { start = WAKE, rest = dotLook('unprocessed').alpha, extra = false } = {}) {
  const tail = clamp01((clamp01(u) * FLY_MS - (FLY_MS - SETTLE_MS)) / SETTLE_MS);
  const a = start + (rest - start) * inQuad(tail);
  return extra ? a * (1 - inQuad(clamp01(u))) : a;
}

/* How many queued files light this frame: none before the pour starts, then at most POUR_MAX. */
export const pourTake = (queued, t, from, max = POUR_MAX) => (t < from ? 0 : Math.min(queued, max));

/* ---------- pure: the clusters (fix 5) and the flight (fix 6) ---------- */

/* A file's spot in its section's closed cluster, in px inside a box w x h: a loose seeded cloud
   (a sunflower spiral, stretched to the box and shaken per file), never a row or a grid. */
export function clusterSpot(path, i, n, seed = '', { w = 316, h = CLUSTER_H } = {}) {
  const r = rng(hash('cluster:' + seed + ':' + path)), turn = rng(hash('turn:' + seed))() * 6.2832;
  const rad = Math.sqrt((i + .5) / Math.max(1, n)), a = i * 2.39996 + turn;
  const jx = (r() - .5) * .22, jy = (r() - .5) * .3;
  const spread = Math.min(1, .35 + n / 30);                    // a few files stay close together
  const x = .5 + (Math.cos(a) * rad * .46 * spread + jx * .4);
  const y = .5 + (Math.sin(a) * rad * .4 + jy * .5);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  return { x: clamp(x, .03, .97) * w, y: clamp(y, .1, .9) * h };
}

/* A file's ordered spot when its cluster is open: one under another, its name beside it. */
export const orderedSpot = i => ({ x: 7, y: i * ROW + ROW / 2 });

/* The flight from one spot to another: points on a gentle arc (a quadratic curve bowed sideways),
   so a firefly travels a real path rather than sliding straight. */
export function flightPath(from, to, steps = 10) {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2, dx = to.x - from.x, dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1, bow = Math.min(40, len * .3);
  const cx = mx - dy / len * bow, cy = my + dx / len * bow;
  return Array.from({ length: steps + 1 }, (_, k) => {
    const t = k / steps, u = 1 - t;
    return { x: u * u * from.x + 2 * u * t * cx + t * t * to.x, y: u * u * from.y + 2 * u * t * cy + t * t * to.y };
  });
}

/* ---------- pure: the menu ---------- */

/* One wording for an empty section, belts and Skills alike. It is a hint, not a status. */
export const EMPTY = 'nothing yet · drag files here';

/* What a section says under its title: only the empty hint. With files, the fireflies say it. */
export const sectionLine = files => (files.length ? '' : EMPTY);

/* The name after a rename: what was typed, tidied; nothing typed keeps the old name. */
export function nextName(old, typed) {
  const t = String(typed ?? '').replace(/\s+/g, ' ').trim();
  return t || old;
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
  const menu = $('#menu'), nameEl = $('#name');
  const sections = { 'system-prompt': [], knowledge: [] };
  let agent = null, skills = [], opened = false;
  const base = () => `/api/agents/${encodeURIComponent(agent.id)}/`;

  /* ---- the upload: fireflies arrive batch by batch ---- */
  function grow(dna) { field.set(dna || []); }

  /* ---- the hand-over: the orbit's live fireflies fly out, the menu comes in at 300 ms ---- */
  let splitTimer = 0, splitDue = false;   // splitDue: the hand-over's menu is on its way (a fast save waits for it)
  function adopt(hand) {
    field.adopt(hand);
    win.clearTimeout(splitTimer); splitDue = true;
    splitTimer = win.setTimeout(() => { splitDue = false; body.classList.add('split'); }, reduced ? 0 : MENU_AT);
  }
  /* Entries as they are read ([{ path, size }]): the field lights them at once, before the server has them. */
  function feed(entries) { field.feed(entries.map(asFile)); }
  /* A failed save: the lights fade where they are and the menu goes; → a promise for when they are gone. */
  function fail() {
    win.clearTimeout(splitTimer); splitDue = false; opened = false;
    body.classList.remove('split'); menu.setAttribute('inert', '');
    return field.fail();
  }

  /* ---- the split ---- */
  function open(a, { still = false } = {}) {
    agent = a; opened = true;
    field.set(a.dna || [], { still });
    nameEl.textContent = nameOf(a);
    if (!splitDue) body.classList.add('split');
    menu.removeAttribute('inert');
    reloadMenu();
  }

  async function reloadAgent() {
    const a = await call('GET', `/api/agents/${encodeURIComponent(agent.id)}`);
    agent = a; setDna(a.dna || []);
  }
  function setDna(dna) { agent.dna = dna; field.set(dna); }

  /* ---- the name: click it and type; Enter or a click elsewhere saves, Esc puts it back ---- */
  let nameWas = '', cancelName = false;
  nameEl.addEventListener('focus', () => { nameWas = nameEl.textContent; cancelName = false; });
  nameEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
    else if (e.key === 'Escape') { e.preventDefault(); cancelName = true; nameEl.textContent = nameWas; nameEl.blur(); }
  });
  nameEl.addEventListener('blur', async () => {
    const old = nameWas, want = cancelName ? old : nextName(old, nameEl.textContent);
    nameEl.textContent = want; nameEl.scrollLeft = 0;
    if (!agent || want === old) return;
    try { agent.draft = await call('PUT', base() + 'draft', { name: want }); nameEl.textContent = nameOf(agent); }
    catch (e) { nameEl.textContent = old; note(`Couldn't rename. ${e.message}`); }
  });
  async function reloadMenu() {
    await Promise.all([
      ...Object.keys(sections).map(async s => { sections[s] = (await call('GET', base() + `sections/${s}/files`)).files; renderSection(s); }),
      (async () => { skills = (await call('GET', base() + 'skills')).skills; renderSkills(); })(),
    ]).catch(e => note(`Couldn't load the menu. ${e.message}`));
  }

  /* ---- a section: its cluster of fireflies; open, each one beside its file name ---- */
  const parts = s => { const sec = menu.querySelector(`[data-section="${s}"]`); return { sec, swarm: sec.querySelector('.swarm'), belt: sec.querySelector('.belt'), flies: sec.querySelector('.flies'), names: sec.querySelector('.names'), line: sec.querySelector('.line') }; };
  const isOpen = s => parts(s).belt.getAttribute('aria-expanded') === 'true';
  /* Where each of a section's fireflies sits, open or closed. Past BELT_CAP a closed cluster tucks them in its middle. */
  function spots(s, open) {
    const files = sections[s], { swarm } = parts(s), w = swarm.clientWidth || MENU_W - 64, n = Math.min(files.length, BELT_CAP);
    return files.map((f, i) => open ? orderedSpot(i) : i < BELT_CAP ? clusterSpot(f.path, i, n, s, { w, h: CLUSTER_H }) : { x: w / 2, y: CLUSTER_H / 2 });
  }
  const place = (d, p) => { d.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`; };
  function setHeight(s, open) { parts(s).swarm.style.height = (open ? Math.max(CLUSTER_H, sections[s].length * ROW) : CLUSTER_H) + 'px'; }

  function renderSection(s) {
    const { sec, swarm, belt, flies, names, line } = parts(s), files = sections[s];
    if (!files.length && isOpen(s)) { belt.setAttribute('aria-expanded', 'false'); sec.classList.remove('open'); }
    swarm.hidden = !files.length;   // before placing: a hidden swarm has no width, and the cluster would shift later
    const open = isOpen(s), at = spots(s, open);
    flies.replaceChildren(...files.map((f, i) => { const d = dot(f); d.classList.toggle('tucked', !open && i >= BELT_CAP); place(d, at[i]); return d; }));
    names.replaceChildren(...files.map((f, i) => row(f, i)));
    line.textContent = sectionLine(files); line.hidden = !!files.length;
    belt.disabled = !files.length;
    belt.setAttribute('aria-label', `${TITLES[s]} files`);
    setHeight(s, open);
  }
  /* A firefly: its own slow drift and rare shine come from its seed, as css timings (fix 2). */
  function dot(f) {
    const i = doc.createElement('i'), p = flyParams(f.path);
    i.className = 'd ' + f.state;
    i.style.cssText = `--dx:${p.ax.toFixed(1)}px;--dy:${p.ay.toFixed(1)}px;--dp:${Math.round(p.px / 2)}ms;--dd:${Math.round(-p.phx / 6.2832 * p.px)}ms;--sp:${Math.round(p.shineEvery)}ms;--sd:${Math.round(-p.shineAt * p.shineEvery)}ms`;
    return i;
  }
  function row(f, i) {
    const r = doc.createElement('div'); r.className = 'row ' + f.state; r.style.top = i * ROW + 'px';
    const name = doc.createElement('span'); name.className = 'fname'; name.textContent = f.name; name.title = f.path;
    r.append(name);
    if (f.state !== 'removed') {
      const b = doc.createElement('button'); b.type = 'button'; b.className = 'rm'; b.textContent = 'Remove'; b.setAttribute('aria-label', `Remove ${f.name}`);
      b.addEventListener('click', () => remove(f)); r.append(b);
    }
    return r;
  }
  /* A tap: every firefly flies along its own arc to its ordered spot (or back into the cluster),
     eased and a little staggered. Reduced motion: they snap there, no flight. */
  function toggle(s, want) {
    const { sec, belt, flies } = parts(s);
    const on = want ?? !isOpen(s);
    if (on === isOpen(s)) return;
    const from = spots(s, !on), to = spots(s, on);
    belt.setAttribute('aria-expanded', String(on)); sec.classList.toggle('open', on); setHeight(s, on);
    [...flies.children].forEach((d, i) => {
      place(d, to[i]);
      d.classList.toggle('tucked', !on && i >= BELT_CAP);
      if (reduced || !d.animate) return;
      d.getAnimations?.().forEach(a => a.id === 'flight' && a.cancel());
      const a = d.animate(flightPath(from[i], to[i]).map(p => ({ transform: `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)` })),
        { duration: FLIGHT, delay: Math.min(i, 20) * STAGGER, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'backwards' });
      a.id = 'flight';
    });
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
    line.textContent = skills.length ? '' : EMPTY;
    line.hidden = !!skills.length;
    box.replaceChildren(...skills.map(k => {
      const b = doc.createElement('button'); b.type = 'button'; b.className = 'star';
      b.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0 9.5 6.5 16 8 9.5 9.5 8 16 6.5 9.5 0 8 6.5 6.5Z"/></svg>';
      const name = doc.createElement('span'); name.className = 'sk-name'; name.textContent = k.name; b.append(name);
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

  // Fireflies on the field are not things to arrange: the canvas takes no pointer at all (fix 3).

  win.addEventListener('resize', () => { field.redraw(); if (agent) Object.keys(sections).forEach(renderSection); });

  return {
    grow, adopt, feed, fail, open, isOpen: () => opened,
    setReduced(v) { reduced = !!v; field.redraw(); },
    info: () => ({ split: opened, field: field.info(), sections: Object.fromEntries(Object.entries(sections).map(([s, f]) => [s, f.map(x => ({ path: x.path, state: x.state }))])), skills: skills.map(k => k.name) }),
  };
}

/* The field's canvas: every frame, each firefly wanders and now and then shines (wanderAt).
   Reduced motion: drawn only when something changes, each at its home spot. */
export function createField(canvas, isReduced) {
  const doc = canvas.ownerDocument, win = doc.defaultView, ctx = canvas.getContext('2d');
  const now = () => win.performance.now();
  let dna = [], ids = new Set(), dots = [], lay = null, layKey = '', raf = 0;
  const born = new Map(), params = new Map(), spots = new Map(), flown = new Set(), waiting = new Set();
  let queue = [], qi = 0;                                  // files waiting to light in place, in read order
  let hand = null, flyers = [], adoptT = 0, failAt = null, failTimer = 0, sprite = null;
  const P = id => { let p = params.get(id); if (!p) params.set(id, p = wanderParams(id)); return p; };
  const PAD = 32;
  const area = (fw, H) => ({ w: fw, h: H, pad: PAD });
  const S = id => { let s = spots.get(id); if (!s) spots.set(id, s = spotOf(id)); return s; };
  const px = (s, fw, H) => ({ x: PAD + s.x * Math.max(0, fw - 2 * PAD), y: PAD + s.y * Math.max(0, H - 2 * PAD) });

  /* The whole DNA (the server's): files already lit or queued keep their light; new ones fade in now. */
  function set(next, { still = false } = {}) {
    const t = still ? -1e9 : now();
    for (const f of next) if (!born.has(f.id) && !waiting.has(f.id)) born.set(f.id, t);
    dna = next.slice(); ids = new Set(dna.map(f => f.id)); lay = null; redraw();
  }

  /* A file found while reading: a flyer still in the air takes it (in leaving order), else it waits
     its turn to light in place. Past FIELD_CAP it is counted, never drawn. */
  function landingOf(f) { return adoptT + (isReduced() ? LEAVE_AFTER : f.delay + FLY_MS); }
  function assign(id, t) {
    const f = flyers.find(g => !g.id && landingOf(g) > t);
    if (!f) return false;
    f.id = id; f.gotAt = t;
    if (isReduced()) born.set(id, landingOf(f));                 // the cross-fade: it fades in as the ring fades out
    else { flown.add(id); born.set(id, landingOf(f)); }          // the same light lands and stays: no fade-in
    return true;
  }
  function take(f, t) {
    if (!hand) { born.set(f.id, t); return; }
    if (assign(f.id, t)) return;
    if (dna.length > FIELD_CAP) { born.set(f.id, -1e9); return; }
    waiting.add(f.id); queue.push(f.id);
  }
  function feed(items) {
    const t = now();
    for (const f of items) { if (ids.has(f.id)) continue; ids.add(f.id); dna.push(f); take(f, t); }
    lay = null; redraw();
  }

  /* The hand-over: the orbit's 30 live fireflies (orbit.release()) are this field's from now on. */
  function adopt(h) {
    if (!h) return;
    win.clearTimeout(failTimer);
    hand = h; adoptT = h.t; failAt = null; sprite = sprite || dnaSprite(doc);
    flyers = leaveOrder(h.flies.map(f => h.at(f.i, h.t))).map(({ i, delay }, k) => ({ i, k, delay, id: null, gotAt: 0, from: null, prov: spotOf('provisional:' + k) }));
    for (const f of dna) if (!born.has(f.id)) take(f, h.t);     // a picked folder is known at once
    redraw();
  }

  /* A failed save: every light fades where it is, then the field is empty again. */
  function fail() {
    failAt = now(); redraw();
    return new Promise(res => { failTimer = win.setTimeout(() => { reset(); res(); }, FAIL_MS); });
  }
  function reset() {
    dna = []; ids = new Set(); lay = null; born.clear(); flown.clear(); waiting.clear(); queue = []; qi = 0;
    hand = null; flyers = []; failAt = null; redraw();
  }

  /* Where flyer f is at t and how it looks, or null once it has landed (its file's dot goes on). */
  function flyerAt(f, t, still, fw, H) {
    const leave = adoptT + f.delay;
    if (still) {
      const k = clamp01((t - adoptT - LEAVE_AFTER) / XFADE);
      if (k >= 1) return null;
      const p = hand.at(f.i, t); return { x: p.x, y: p.y, r: p.r, a: p.a * (1 - k) };
    }
    if (t < leave) { const p = hand.at(f.i, t); return { x: p.x, y: p.y, r: p.r, a: p.a }; }
    if (!f.from) f.from = hand.at(f.i, leave);
    const u = (t - leave) / FLY_MS;
    if (u >= 1) return null;
    let to = px(f.prov, fw, H), known = 0;
    if (f.id) {
      const s = wanderAt(f.id, t, area(fw, H), false, P(f.id));   // where it will be wandering when it lands
      known = f.gotAt <= leave ? 1 : outQuad(clamp01((t - f.gotAt) / RETARGET));
      to = { x: to.x + (s.x - to.x) * known, y: to.y + (s.y - to.y) * known };
    }
    const p = flightAt(f.from, { x: f.from.tx, y: f.from.ty }, to, u), w = 2 * (1 - u) * Math.sin(u * 9.42 + f.k);
    const full = flyerAlpha(u, { start: f.from.a }), melt = flyerAlpha(u, { start: f.from.a, extra: true });
    return { x: p.x - f.from.ty * w, y: p.y + f.from.tx * w, r: clampR(f.from.r + (LAND_R - f.from.r) * inOutQuad(u)), a: melt + (full - melt) * known };
  }

  function redraw() { if (!raf) raf = win.requestAnimationFrame(paint); }
  function paint(t) {
    raf = 0;
    const W = win.innerWidth, H = win.innerHeight, dpr = Math.min(2, win.devicePixelRatio || 1), fw = Math.max(160, W - MENU_W);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    const key = fw + 'x' + H;
    if (!lay || key !== layKey) { lay = fieldLayout(dna, { width: fw, height: H, pad: PAD }); layKey = key; dots = lay.dots; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const still = isReduced();
    // the pour: further files light in place, a few per frame, once the flyers have the stage
    const pour = pourTake(queue.length - qi, t, hand ? adoptT + (still ? LEAVE_AFTER : POUR_FROM) : -Infinity);
    for (let j = 0; j < pour && failAt == null; j++) { const id = queue[qi++]; waiting.delete(id); born.set(id, t); }
    if (qi && qi === queue.length) { queue = []; qi = 0; }
    const gone = failAt == null ? 1 : 1 - inQuad(clamp01((t - failAt) / FAIL_MS));
    let busy = failAt != null || qi < queue.length;
    const ar = area(fw, H);
    for (const d of dots) {
      const b = born.get(d.id); if (b == null) continue;
      const age = t - b; if (age < 0) continue;
      const look = dotLook(d.state), m = still ? d : wanderAt(d.id, t, ar, false, P(d.id)), glow = age < SHINE_AFTER || still ? 0 : m.glow;
      let a = look.alpha;
      if (!flown.has(d.id) && age < FADE_IN) { a *= outQuad(age / FADE_IN); busy = true; }
      a *= gone;
      const x = m.x, y = m.y, halo = ((look.halo ? a * .16 : 0) + glow * .4) * gone;
      ctx.fillStyle = look.color;
      if (halo > .005) { ctx.globalAlpha = halo; ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.2832); ctx.fill(); }
      ctx.globalAlpha = Math.min(1, a + glow * gone); ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.2832); ctx.fill();
    }
    let flying = 0;
    if (hand) {
      ctx.globalCompositeOperation = 'lighter';
      for (const f of flyers) {
        const p = flyerAt(f, failAt == null ? t : Math.min(t, failAt), still, fw, H);
        if (!p) continue;
        flying++;
        const a = p.a * gone;
        if (a > .003) { ctx.globalAlpha = a; ctx.drawImage(sprite, p.x - p.r, p.y - p.r, 2 * p.r, 2 * p.r); }
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    lastFlying = flying;
    ctx.globalAlpha = 1;
    if (busy || flying || (!still && dots.length)) redraw();
  }
  let lastFlying = 0;
  return {
    set, feed, adopt, fail, redraw, total: () => dna.length,
    info: () => ({
      total: dna.length, drawn: dots.length, moving: !isReduced(), lit: [...born.values()].filter(b => b <= now()).length,
      flyers: flyers.length, flying: lastFlying, queued: queue.length - qi,
      dots: dots.slice(0, 50).map(d => ({ id: d.id, state: d.state, x: Math.round(d.x), y: Math.round(d.y) })),
      at: (t = now()) => {                                   // where the first 50 are drawn at t (home spots when reduced)
        const fw = Math.max(160, win.innerWidth - MENU_W), ar = area(fw, win.innerHeight), still = isReduced();
        return dots.slice(0, 50).map(d => { const m = still ? d : wanderAt(d.id, t, ar, false, P(d.id)); return { id: d.id, x: m.x, y: m.y }; });
      },
    }),
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
