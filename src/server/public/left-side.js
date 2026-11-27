/* The Left Side: the mess gathering into the likeness, the Sketcher handle and the glass panel.
   Spec: Reports/left-side-magic.md §4 (numbers) and §7 (checks). Pure helpers first (tested in
   left-side.test.mjs), then mountLeftSide, which needs a page (new-agent.html). */
import { createDna, dotsFor, timeOf, PLACED, flash } from './fireflies-dna.js';
import { FLY, WAKE, WAKE_MS, outQuad } from './firefly-orbit.js';
import { MENU_W, FLY_MS, spotOf, wanderAt, wanderParams, fieldLayout, dotLook, flightAt, flyerAlpha, leaveOrder } from './creation-screen.js';
import { nameOf } from './agent-list.js';
import { renderMarkdown } from './markdown.js';

export const SIT_MS = FLY_MS - 180;   // 600: the mark answers this long after the first flyer leaves
export const WHOLE_WAIT = 1200;       // ms after the last setFiles before the shared flash
export const HANDLE_AT = 900;         // ms after the agent exists before the handle slides in
export const HANDLE_MS = 400;         // its slide
export const HINT_AFTER = 25000;      // ms with nothing processed before the second blink
export const HINTS_MAX = 2;           // blinks per agent, ever
export const OPEN_MS = 280, CLOSE_MS = 220, LABEL_MS = 120;
export const STILL_BLINK = 1200;      // Reduce Motion: a blink is a plain step this long
export const POLL_MS = 2000;          // while files wait, the page asks for the agent this often
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const clamp01 = v => clamp(v, 0, 1);

/* The mark's size: clamp(0.4 × min(fw, H), 140, 240) css px. */
export const markSize = (fw, H) => clamp(.4 * Math.min(fw, H), 140, 240);

/* How much has gathered. prev = { shown, live } from the last call (forward only; a removal resets). */
export function gatheredFiles(files, prev = { shown: 0, live: 0 }) {
  const live = (files || []).filter(f => f.state !== 'removed');
  const sorted = live.map((f, i) => ({ f, i, t: timeOf(f.addedAt) ?? -Infinity })).sort((a, b) => a.t - b.t || a.i - b.i).map(x => x.f);
  const processed = live.filter(f => f.state === 'processed').length;
  const share = live.length ? processed / live.length : 0;
  const P = Math.min(PLACED, live.reduce((n, f) => n + dotsFor(f.sizeBytes), 0));
  const want = share === 0 ? 0 : Math.ceil(share * P);
  let k = 0;
  if (share === 1) k = live.length;
  else for (let sum = 0; k < sorted.length && sum < want; k++) sum += dotsFor(sorted[k].sizeBytes);
  const shrunk = live.length < (prev.live || 0);
  const shown = shrunk ? k : Math.max(prev.shown || 0, k);
  return { sorted, prefix: sorted.slice(0, shown), shown, live: live.length, share, P, want };
}

/* Flight stagger: a batch of q is always in the air within 8 s. */
export const flightGap = q => clamp(8000 / Math.max(1, q), 16, 90);

/* A refresh's plan. newly: the newly processed files drawn in the field, [{ id, x }].
   → flyers [{ id, leave }] (≤ PLACED, left-most first), vanish (the rest), setAt (when the mark answers). */
export function planRefresh(newly, { t = 0, reduced = false } = {}) {
  if (reduced || !newly.length) return { flyers: [], vanish: newly.map(p => p.id), setAt: t };
  const order = leaveOrder(newly).map(o => newly[o.i]);
  const fly = order.slice(0, PLACED), gap = flightGap(fly.length), first = t + WAKE_MS;
  return { flyers: fly.map((p, k) => ({ id: p.id, leave: first + k * gap })), vanish: order.slice(PLACED).map(p => p.id), setAt: first + SIT_MS };
}

/* The shared flash: once per agent, the first time the mark is whole. A visit that starts whole only remembers. */
export function wholeDue(store, id, { shown, live, atStart = false }) {
  const key = 'left.whole.' + id;
  if (!live || shown < live || store[key] === '1') return false;
  store[key] = '1';
  return !atStart;
}

/* The handle's blinks: at most HINTS_MAX per agent, none once Sketcher was opened, the second only
   after HINT_AFTER with nothing processed. which: 'first' | 'second'. Counts the blink when allowed. */
export function blinkAllowed(store, id, which, { processed = 0, waited = 0 } = {}) {
  const key = 'left.hint.' + id, n = +store[key] || 0;
  if (n >= HINTS_MAX || store['left.opened.' + id] === '1') return false;
  if (which === 'second' && (processed > 0 || waited < HINT_AFTER || n < 1)) return false;
  store[key] = String(n + 1);
  return true;
}

/* The look-back: one notice on close, only if the mark changed while the panel was open. */
export const lookBack = (changed, reduced) => !!changed && !reduced;

/* On close: a whole flash held while the panel was open, or the look-back. Either way, ONE flash. */
export const closeFlash = ({ changed = false, held = false, reduced = false } = {}) => !!held || lookBack(changed, reduced);

/* Every transition the left side sets, in ms (all 0 under Reduce Motion). */
export const timings = reduced => reduced
  ? { handle: 0, label: 0, open: 0, close: 0, flight: 0 }
  : { handle: HANDLE_MS, label: LABEL_MS, open: OPEN_MS, close: CLOSE_MS, flight: FLY_MS };

/* The handle's chevron opacity dt ms into a blink. */
export const blinkLevel = (dt, reduced) => reduced ? (dt >= 0 && dt < STILL_BLINK ? 1 : .55) : .55 + .45 * flash(dt);

/* The mark grows as it fills: the shared logo shrinks each dot as the count rises (so its lit area
   stays flat), so here the whole canvas scales from half size to full. cur, whole: dots placed now / when whole. */
export const markGrow = (cur, whole) => !(whole > 0) || cur >= whole ? 1 : .5 + .5 * Math.sqrt(Math.max(0, cur) / whole);
export const dotsOf = list => Math.min(PLACED, (list || []).reduce((n, f) => n + dotsFor(f.sizeBytes), 0));

/* The server says the draft is ready to create: `event: ready` {ready:true}, or done {ready:true}.
   A real flag from the engine, never guessed from Sketcher's words. */
export const isReady = (event, data) => !!data && data.ready === true && (event === 'ready' || event === 'done');

/* The agent is created (the server's draft status "saved"). */
export const isKept = a => !!(a && a.draft && a.draft.status === 'saved');

/* Keep happens once: never again once the draft is saved (or this browser saw it kept). */
export const kept = (store, a) => isKept(a) || (!!a && store['left.kept.' + a.id] === '1');

/* Show Create: only when the server says ready and the agent is not and never was created. */
export const showCreate = (ready, kept) => !kept && !!ready;

/* Server-sent events, as text arrives: → [{ event, data }] and the unfinished rest. */
export function parseEvents(buf) {
  const out = [], parts = buf.split('\n\n'), rest = parts.pop();
  for (const p of parts) {
    const ev = /^event: (.*)$/m.exec(p), da = /^data: (.*)$/m.exec(p);
    if (ev) { let data = null; try { data = JSON.parse(da ? da[1] : 'null'); } catch {} out.push({ event: ev[1], data }); }
  }
  return { events: out, rest };
}

/* The sorting: Sketcher puts a file in a section (the server's allocate { file, section }).
   The menu section that takes it: 'skill:<id>' → 'skills'; 'none' (feeds nothing) → null. */
export const menuSectionOf = section => !section || section === 'none' ? null : String(section).startsWith('skill:') ? 'skills' : section;
export const GLOW_MS = 900;     // a sorted file's firefly glows this long, from its own allocate
export const TOOK_MS = 600;     // the section's soft light when the file lands
export const SORT_GAP = 90;     // ms between two sorted files leaving (a burst reads as a line, not a blob)
/* The glow dt ms after its allocate: up fast, down slow; 0 outside. Reduce Motion: a plain step. */
export const glowLevel = (dt, reduced) => dt < 0 ? 0 : reduced ? (dt < STILL_BLINK ? 1 : 0) : dt >= GLOW_MS ? 0 : flash(dt * 1020 / GLOW_MS);
/* When each of a burst leaves: never before t + WAKE_MS (the glow first), SORT_GAP after the one before. */
export const sortLeave = (t, last) => Math.max(t + WAKE_MS, last + SORT_GAP);

/* One turn with Sketcher (the creator on the engine): POST /api/agents/:id/chat, read its events.
   onText(all text so far) as it streams; onChange(event) when the draft or the files changed;
   onAllocate({ file, section }) once per file Sketcher sorted (after files);
   onReady() once when the server says the draft can be created (event ready, or done.ready).
   → Sketcher's whole answer. Throws on any failure (no answer counts as one). */
export async function streamChat({ fetch, id, message, onText = () => {}, onChange = () => {}, onAllocate = () => {}, onReady = () => {} }) {
  const r = await fetch(`/api/agents/${encodeURIComponent(id)}/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message }) });
  if (!r.ok || !r.body) throw new Error(`chat: status ${r.status}`);
  const rd = r.body.getReader(), dec = new TextDecoder();
  let buf = '', text = '', ready = false;
  for (;;) {
    const { value, done } = await rd.read(); if (done) break;
    const out = parseEvents(buf + dec.decode(value, { stream: true })); buf = out.rest;
    for (const { event, data } of out.events) {
      if (!ready && isReady(event, data)) { ready = true; onReady(); }
      if (event === 'delta' && data && data.text) onText(text += data.text);
      else if (event === 'files' || event === 'draft') onChange(event);
      else if (event === 'allocate' && data && data.file) onAllocate({ file: data.file, section: data.section || 'none' });
      else if (event === 'done' && data && data.say) { if (data.say !== text) onText(text = data.say); }   // the final text is the truth
      else if (event === 'error') throw new Error(`chat: ${(data && data.error) || 'error'}`);
    }
  }
  if (!text) throw new Error('chat: empty answer');
  return text;
}

/* ------------------------------------------------------------------ the page ---- */
export function mountLeftSide({ doc = document, reduced = false, store = localStorage, fetchAgent, refresh, reloadMenu = () => {} }) {
  const win = doc.defaultView, $ = s => doc.querySelector(s), now = () => win.performance.now();
  const markEl = $('#mark'), sky = $('#sky'), ctx = sky.getContext('2d');
  const handle = $('#handle'), chev = handle.querySelector('.chev');
  const panel = $('#sketcher'), log = $('#sketcher-log');
  const form = $('#sketcher-form'), box = $('#sketcher-box'), create = $('#sketcher-create');
  let id = null, name = '', mark = null, prev = { shown: 0, live: 0 }, applied = [], files = [];
  let known = new Map(), flown = new Set(), flyers = [], timers = [], raf = 0, lastT = 0;
  let glows = new Map(), sorters = [], lastLeave = -1e9, sorted = { count: 0, last: [] }, tookSeen = 0;   // the sorting
  let open = false, changedWhileOpen = false, heldWhole = false, wasKept = false, grow = 1, handleAt = 0, blinkAt = -1e9, blinks = 0, busy = false, pollT = 0;
  const T = () => timings(reduced);
  const later = (fn, ms) => { const h = win.setTimeout(fn, ms); timers.push(h); return h; };
  const geo = () => { const W = win.innerWidth, H = win.innerHeight, fw = Math.max(160, W - MENU_W), L = markSize(fw, H); return { W, H, fw, L, cx: fw / 2, cy: H / 2 }; };

  function place() {
    const g = geo();
    Object.assign(markEl.style, { left: g.cx - g.L / 2 + 'px', top: g.cy - g.L / 2 + 'px', width: g.L + 'px', height: g.L + 'px' });
    handle.style.top = clamp(g.cy - 24, 16, g.H - 64) + 'px';
    panel.style.width = (g.W < 640 ? g.W : Math.min(440, g.fw)) + 'px';
    if (open) handle.style.transform = `translateX(${edgeX()}px)`;
    kick();
  }

  function setMark(list, fresh) {
    const changed = list.length !== applied.length;
    applied = list;
    if (fresh || !mark) mark = createDna(markEl, { name, files: list });
    else mark.setFiles(list);
    if (changed && open) changedWhileOpen = true;
    grow = markGrow(dotsOf(list), gatheredFiles(files).P);
    markEl.style.transition = reduced || fresh ? 'none' : '';
    markEl.style.transform = grow === 1 ? '' : `scale(${grow.toFixed(4)})`;
    if (wholeDue(store, id, { shown: list.length, live: prev.live, atStart: fresh })) {
      if (open) heldWhole = true;   // held: the one flash plays on close
      else later(() => { if (open) heldWhole = true; else mark.notice(reduced); }, WHOLE_WAIT);
    }
    kick();
  }

  /* Every DNA refresh the creation screen gets ends here. */
  function onDna(a, { still = false } = {}) {
    const next = a.dna || [];
    if (a.id !== id) return start(a, still);
    if (kept(store, a)) { wasKept = true; store['left.kept.' + id] = '1'; create.hidden = true; }   // once kept, Keep never comes back
    const nm = nameOf(a);
    if (nm !== name) { name = nm; setMark(applied, true); }
    const t = now(), g = geo();
    const drawn = new Map(fieldLayout(next, { width: g.fw, height: g.H }).dots.map(d => [d.id, d]));
    const newly = next.filter(f => f.state === 'processed' && known.get(f.id) !== 'processed');
    known = new Map(next.map(f => [f.id, f.state])); files = next;
    const res = gatheredFiles(next, prev); prev = { shown: res.shown, live: res.live };
    newly.forEach(f => flown.add(f.id));
    for (const f of next) if (f.state !== 'processed') flown.delete(f.id);   // removed ones stay red in the field
    const plan = planRefresh(newly.filter(f => drawn.has(f.id)).map(f => ({ id: f.id, x: wanderAt(f.id, t, area(g), reduced, wanderParams(f.id)).x })), { t, reduced });
    flyers.push(...plan.flyers.map(f => ({ ...f, from: null, tan: null, to: null })));
    refreshHidden();
    const prefix = res.prefix;
    if (plan.setAt <= t) setMark(prefix); else later(() => setMark(prefix), plan.setAt - t);
    schedulePoll();
  }
  const area = g => ({ w: g.fw, h: g.H, pad: 32 });
  function refreshHidden() { if (api.hide) api.hide([...flown]); }

  function start(a, still) {
    timers.forEach(h => win.clearTimeout(h)); timers = []; flyers = []; sorters = []; glows = new Map();
    id = a.id; name = nameOf(a); files = a.dna || [];
    heldWhole = false; wasKept = kept(store, a); create.hidden = true;
    if (wasKept) store['left.kept.' + id] = '1';
    log.replaceChildren(); for (const m of a.chat || []) { const you = m.who === 'you'; line(you ? 'you' : 'sketcher', m.text, !you); }   // the talk so far, after a reload too: same renderer as live
    known = new Map(files.map(f => [f.id, f.state]));
    const res = gatheredFiles(files); prev = { shown: res.shown, live: res.live };
    flown = new Set(files.filter(f => f.state === 'processed').map(f => f.id));
    refreshHidden();
    applied = []; mark = null; setMark(res.prefix, true);
    doc.body.classList.add('left');
    showHandle(still);
    schedulePoll();
  }

  /* ---- the handle ---- */
  function showHandle(still) {
    handle.style.transition = `transform ${T().handle}ms cubic-bezier(.5,1,.89,1)`;   // outQuad
    const done = () => { handleAt = now(); if (!still && blinkAllowed(store, id, 'first')) blink(); later(secondBlink, HINT_AFTER); };
    if (still) { handle.hidden = false; handle.classList.add('in'); done(); return; }
    later(() => { handle.hidden = false; void handle.offsetWidth; handle.classList.add('in'); later(done, T().handle); }, reduced ? 0 : HANDLE_AT);
  }
  function secondBlink() {
    const processed = files.filter(f => f.state === 'processed').length;
    if (blinkAllowed(store, id, 'second', { processed, waited: now() - handleAt })) blink();
  }
  function blink() { blinkAt = now(); blinks++; kick(); }

  /* ---- the panel ---- */
  // One arrow opens and closes: the handle rides the panel's right edge (same ms, same easing, same
  // height) and its chevron mirrors › → ‹. Narrow screens: the panel is full width, so it stops just inside.
  // The tab's resting width (padding + chevron + gap, 48px), not min-width and not with a hovered label,
  // so the whole arrow stays on screen.
  const tabW = () => { const l = handle.querySelector('.label'); return Math.max(parseFloat(win.getComputedStyle(handle).minWidth) || 44, handle.offsetWidth - (l ? l.offsetWidth : 0)); };
  const edgeX = () => Math.max(0, Math.min(panel.getBoundingClientRect().width, win.innerWidth - tabW()));
  function slide(ms, ease) {
    const tr = `transform ${ms}ms ${ease}`;
    panel.style.transition = tr; handle.style.transition = tr;
    chev.style.transition = `opacity 120ms ease, ${tr}`;
    later(() => { chev.style.transition = ''; }, ms);   // hover nudges stay quick
  }
  function openPanel() {
    if (open || !id) return;
    open = true; changedWhileOpen = false; store['left.opened.' + id] = '1';
    slide(T().open, 'cubic-bezier(.2,.8,.2,1)');
    panel.hidden = false; panel.removeAttribute('inert'); void panel.offsetWidth;
    panel.classList.add('open'); handle.style.transform = `translateX(${edgeX()}px)`;
    handle.setAttribute('aria-expanded', 'true'); handle.setAttribute('aria-label', 'Close Sketcher');
    box.placeholder = `Tell Sketcher what ${name} is for`;
    box.focus();
  }
  function closePanel() {
    if (!open) return;
    open = false;
    slide(T().close, 'cubic-bezier(.4,0,1,1)');
    panel.classList.remove('open'); panel.setAttribute('inert', ''); handle.style.transform = '';
    handle.setAttribute('aria-expanded', 'false'); handle.setAttribute('aria-label', 'Open Sketcher');
    handle.focus();
    const end = () => {
      if (!open) panel.hidden = true;
      if (mark && closeFlash({ changed: changedWhileOpen, held: heldWhole, reduced })) mark.notice(reduced);
      changedWhileOpen = false; heldWhole = false;
    };
    if (T().close) later(end, T().close); else end();
  }
  handle.addEventListener('click', () => open ? closePanel() : openPanel());
  win.addEventListener('keydown', e => {   // Esc is the panel's first: it never reaches the page's "go home"
    if (e.key !== 'Escape' || !open) return;
    e.preventDefault(); e.stopImmediatePropagation(); closePanel();
  }, true);

  /* ---- talking to Sketcher ---- */
  // A line is a div (a reply may hold lists and quotes). Only Sketcher's own words (md) are rendered
  // as markdown; the user's lines and the app's lines (waiting, errors, "Yours…") stay plain text.
  const say = (el, text) => el.replaceChildren(renderMarkdown(doc, text));
  const line = (who, text, md = false) => {
    const el = doc.createElement('div'); el.className = who + (md ? ' md' : '');
    if (md) say(el, text); else el.textContent = text;
    log.append(el); log.scrollTop = log.scrollHeight; return el;
  };
  box.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const message = box.value.trim(); if (!message || busy || !id) return;
    busy = true; box.value = ''; const mine = line('you', message);
    const reply = line('sketcher wait', 'Sketching…');
    const onText = text => { say(reply, text); reply.classList.remove('wait'); reply.classList.add('md'); log.scrollTop = log.scrollHeight; };
    try {
      const onChange = ev => { pull(); if (ev === 'files') Promise.resolve(reloadMenu()).catch(() => {}); };
      let ready = false;
      await streamChat({ fetch: win.fetch.bind(win), id, message, onText, onChange, onAllocate: sortFile, onReady: () => { ready = true; } });
      if (showCreate(ready, wasKept)) create.hidden = false;
    } catch {
      // The message goes back in the box, so Enter tries again (no retyping, no retry button).
      mine.remove(); if (!box.value) box.value = message;
      reply.textContent = 'Sketcher couldn’t answer. Press Enter to try again.'; reply.className = 'sketcher err';
      box.focus(); box.setSelectionRange(box.value.length, box.value.length);
    }
    busy = false; log.scrollTop = log.scrollHeight;
  });
  create.addEventListener('click', async () => {
    create.disabled = true;
    try {
      const r = await win.fetch(`/api/agents/${encodeURIComponent(id)}/save`, { method: 'POST' });
      if (!r.ok) throw new Error(); wasKept = true; store['left.kept.' + id] = '1'; create.hidden = true; line('sketcher', 'Created. You can keep changing it.');
    } catch { line('sketcher err', 'Couldn’t create it. Try again.'); }
    create.disabled = false;
  });

  /* ---- the sorting: on its own allocate, a file's firefly glows, then a light leaves it and flies to
     its section, which takes it with a soft light. The file's firefly stays (it is not built in yet).
     'none': the glow only. Reduce Motion: no flight; the glow and the section's light are plain steps. ---- */
  const secEl = key => doc.querySelector(`#menu [data-section="${key}"]`);
  function dotAt(file, t) {   // where the file's firefly is now: its field spot, or the mark once it has flown in
    const g = geo();
    if (flown.has(file) || !files.some(f => f.id === file)) return { x: g.cx, y: g.cy };
    if (reduced) { const s = spotOf(file), ar = area(g); return { x: ar.pad + s.x * Math.max(0, ar.w - 2 * ar.pad), y: ar.pad + s.y * Math.max(0, ar.h - 2 * ar.pad) }; }
    return wanderAt(file, t, area(g), false, wanderParams(file));
  }
  function targetOf(key) {    // the section's fireflies (or its skills), else its title
    const sec = secEl(key); if (!sec) return null;
    const stars = sec.querySelector('.stars');
    const el = sec.querySelector('.swarm:not([hidden])') || (stars && stars.childElementCount ? stars : null) || sec.querySelector('h2') || sec;
    const r = el.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 60), y: r.top + r.height / 2 };
  }
  function took(key) {
    const sec = secEl(key); if (!sec) return;
    sec.classList.add('took'); tookSeen++;
    later(() => sec.classList.remove('took'), reduced ? STILL_BLINK : TOOK_MS);
  }
  function sortFile({ file, section }) {
    const t = now(), key = menuSectionOf(section);
    sorted.count++; sorted.last = [...sorted.last, { file, section }].slice(-20);
    glows.set(file, t);
    if (key && reduced) took(key);
    else if (key) { lastLeave = sortLeave(t, lastLeave); sorters.push({ file, key, leave: lastLeave, from: null, tan: null }); }
    kick();
  }
  function drawSorting(t) {
    const out = [];
    for (const [file, at] of glows) {   // F13: the glow is this file's own, from its own allocate
      const v = glowLevel(t - at, reduced);
      if (v <= 0 && t - at > 0) { glows.delete(file); continue; }
      const p = dotAt(file, reduced ? at : t);
      ctx.globalAlpha = .45 * v; ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = v; ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, 6.2832); ctx.fill();
    }
    sorters = sorters.filter(s => {
      if (t < s.leave) { out.push(s); return true; }
      if (!s.from) {
        const p = dotAt(s.file, s.leave), q = dotAt(s.file, s.leave - 16), d = Math.hypot(p.x - q.x, p.y - q.y);
        s.from = p; s.tan = d ? { x: (p.x - q.x) / d, y: (p.y - q.y) / d } : { x: 0, y: -1 };
      }
      const u = (t - s.leave) / FLY_MS, to = targetOf(s.key);
      if (u >= 1 || !to) { took(s.key); return false; }
      const p = flightAt(s.from, s.tan, to, u), a = WAKE * (1 - .5 * u);
      ctx.globalAlpha = a * .2; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 6.2832); ctx.fill();
      return true;
    });
    return glows.size + sorters.length;
  }

  /* ---- the agent while files wait ---- */
  async function pull() { if (!id) return; try { const a = await fetchAgent(id); if (a && a.id === id) refresh(a); } catch {} }
  function schedulePoll() {
    win.clearTimeout(pollT);
    if (!files.some(f => f.state === 'unprocessed')) return;
    pollT = win.setTimeout(async () => { if (doc.visibilityState !== 'hidden') await pull(); else schedulePoll(); }, POLL_MS);
  }

  /* ---- one frame: the mark, the flyers, the chevron ---- */
  function kick() { if (!raf) raf = win.requestAnimationFrame(frame); }
  function frame(t) {
    raf = 0;
    const dt = lastT ? Math.min(.1, (t - lastT) / 1000) : 0; lastT = t;
    const moving = mark ? mark.draw(t, dt, reduced) : false;
    const g = geo(), dpr = Math.min(2, win.devicePixelRatio || 1);
    if (sky.width !== Math.round(g.W * dpr) || sky.height !== Math.round(g.H * dpr)) { sky.width = Math.round(g.W * dpr); sky.height = Math.round(g.H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, g.W, g.H); ctx.fillStyle = FLY;
    const ar = area(g), rest = dotLook('unprocessed').alpha;
    flyers = flyers.filter(f => {
      let x, y, a;
      if (t < f.leave) {
        const m = wanderAt(f.id, t, ar, false, wanderParams(f.id));
        x = m.x; y = m.y; a = rest + (WAKE - rest) * outQuad(clamp01((t - (f.leave - WAKE_MS)) / WAKE_MS));
      } else {
        if (!f.from) {
          const P = wanderParams(f.id), p = wanderAt(f.id, f.leave, ar, false, P), q = wanderAt(f.id, f.leave - 16, ar, false, P);
          const d = Math.hypot(p.x - q.x, p.y - q.y) || 1, s = spotOf('sit:' + f.id);
          f.from = p; f.tan = { x: (p.x - q.x) / d, y: (p.y - q.y) / d }; f.off = { x: (s.x - .5) * .5, y: (s.y - .5) * .5 };
        }
        const u = (t - f.leave) / FLY_MS; if (u >= 1) return false;
        const to = { x: g.cx + f.off.x * g.L * grow, y: g.cy + f.off.y * g.L * grow };
        const p = flightAt(f.from, f.tan, to, u); x = p.x; y = p.y; a = flyerAlpha(u, { start: WAKE, extra: true });
      }
      ctx.globalAlpha = a * .16; ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.2832); ctx.fill();
      return true;
    });
    const sorting = drawSorting(t);
    ctx.globalAlpha = 1;
    const bt = t - blinkAt, lit = reduced ? bt < STILL_BLINK : bt < 1020;
    chev.style.setProperty('--b', ((blinkLevel(bt, reduced) - .55) / .45).toFixed(3));
    if (moving || flyers.length || sorting || lit) kick();
  }

  const api = {
    onDna, hide: null,
    setReduced(v) { reduced = !!v; kick(); },
    isOpen: () => open,
    info: () => ({
      sorted: { count: sorted.count, last: sorted.last.slice() }, sorting: sorters.length, glowing: glows.size, took: tookSeen,
      agent: id, grow, kept: wasKept, shown: prev.shown, live: prev.live, applied: applied.length, flyers: flyers.length, flown: flown.size,
      handle: { shown: !handle.hidden && handle.classList.contains('in'), blinks, blinkAt },
      panel: { open, hidden: panel.hidden }, mark: mark ? mark.info() : null,
      rect: (() => { const r = markEl.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })(),
    }),
  };
  win.addEventListener('resize', place);
  place();
  return api;
}
