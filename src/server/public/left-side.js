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

/* The Create card's one line, under the AI's message that asks: short, never blank, never a repeat of it. */
export const cardLine = name => `Ready to create ${(name || '').trim() || 'this agent'}?`;

/* Esc with the panel open: stop while a turn runs or waits, else close (as before). Panel shut: not ours. */
export const escAction = ({ open = false, running = false } = {}) => !open ? null : running ? 'stop' : 'close';

/* Words that were never sent go back in the box, after whatever is there, one per line. */
export const giveBack = (value, messages) => [String(value || '').replace(/\s+$/, ''), ...messages].filter(Boolean).join('\n');

/* Esc: POST /api/agents/:id/stop → how many turns it stopped (0 when Sketcher was idle). */
export async function stopTurns({ fetch, id }) {
  const r = await fetch(`/api/agents/${encodeURIComponent(id)}/stop`, { method: 'POST' });
  if (!r.ok) throw new Error(`stop: status ${r.status}`);
  return ((await r.json()) || {}).stopped || 0;
}

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

/* ---- the chat's fireflies (Reports/chat-firefly-motion.md §3–4) ----
   Send: one dot flies from the box up to the new 'you' line and blooms into it.
   Wait: Sketcher's dot glows beside "Sketching…" and answers each real event once. */
export const BLOOM_MS = 200;    // the 'you' tint settles .30 → .14 after the landing
export const ANSWER_MS = 320;   // one answering flash, back in the loop by then
export const RISE_MS = 80;      // its rise to full
export const SEND_BOW = 10;     // px the flight bows to the left at its middle
export const MIN_FLIGHT = 24;   // px: shorter than this, nothing flies
/* null = no flight (both lines show at once); else when it lands and when everything is still. */
export function flightPlan({ from, to, reduced = false, visible = true } = {}) {
  if (reduced || !visible || !from || !to) return null;
  const d = Math.hypot(to.x - from.x, to.y - from.y);
  if (!(d >= MIN_FLIGHT)) return null;
  const dur = Math.round(clamp(160 + .8 * d, 220, 380));
  return { dur, bow: SEND_BOW, landAt: dur, settleAt: dur + BLOOM_MS };
}
/* The point at u (0–1) of the gentle arc: a quadratic curve whose middle sits `bow` px left of the straight line. */
export const sendArcAt = (from, to, u, bow = SEND_BOW) => {
  const c = { x: (from.x + to.x) / 2 - 2 * bow, y: (from.y + to.y) / 2 }, v = 1 - u;
  return { x: v * v * from.x + 2 * v * u * c.x + u * u * to.x, y: v * v * from.y + 2 * v * u * c.y + u * u * to.y };
};
/* Where the send dot lands: the centre of the new 'you' bubble's rect (viewport px, the same space as
   `from`). Not the field, not the mark: the message itself. null when there is no bubble to land in. */
export const landingPoint = r => r && r.width > 0 && r.height > 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
/* The landing counts as seen only inside the log's visible rect. */
export const inside = (p, R) => !!p && !!R && p.x >= R.left && p.x <= R.right && p.y >= R.top && p.y <= R.bottom;
/* How long the wait dot stays at full after the latest event before it eases back (Reduce Motion: a plain step). */
export const answerHold = reduced => reduced ? ANSWER_MS : RISE_MS;

/* One turn with Sketcher (the creator on the engine): POST /api/agents/:id/chat, read its events.
   onText(all text so far) as it streams; onChange(event) when the draft or the files changed;
   onAllocate({ file, section }) once per file Sketcher sorted (after files);
   onReady() once when the server says the draft can be created (event ready, or done.ready);
   onQueued() when the message waits in line behind a turn still thinking.
   → Sketcher's whole answer. Throws on any failure (no answer counts as one); a stopped turn
   throws with kind 'cancelled'. */
export async function streamChat({ fetch, id, message, onText = () => {}, onChange = () => {}, onAllocate = () => {}, onReady = () => {}, onQueued = () => {} }) {
  const r = await fetch(`/api/agents/${encodeURIComponent(id)}/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message }) });
  if (!r.ok || !r.body) throw new Error(`chat: status ${r.status}`);
  const rd = r.body.getReader(), dec = new TextDecoder();
  let buf = '', text = '', ready = false;
  for (;;) {
    const { value, done } = await rd.read(); if (done) break;
    const out = parseEvents(buf + dec.decode(value, { stream: true })); buf = out.rest;
    for (const { event, data } of out.events) {
      if (!ready && isReady(event, data)) { ready = true; onReady(); }
      if (event === 'queued') onQueued();
      else if (event === 'delta' && data && data.text) onText(text += data.text);
      else if (event === 'files' || event === 'draft') onChange(event);
      else if (event === 'allocate' && data && data.file) onAllocate({ file: data.file, section: data.section || 'none' });
      else if (event === 'done' && data && data.say) { if (data.say !== text) onText(text = data.say); }   // the final text is the truth
      else if (event === 'error') throw Object.assign(new Error(`chat: ${(data && (data.error || data.kind)) || 'error'}`), { kind: data && data.kind });
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
  const form = $('#sketcher-form'), box = $('#sketcher-box');
  let id = null, name = '', mark = null, prev = { shown: 0, live: 0 }, applied = [], files = [];
  let known = new Map(), flown = new Set(), flyers = [], timers = [], raf = 0, lastT = 0;
  let glows = new Map(), sorters = [], lastLeave = -1e9, sorted = { count: 0, last: [] }, tookSeen = 0;   // the sorting
  let open = false, changedWhileOpen = false, heldWhole = false, wasKept = false, grow = 1, handleAt = 0, blinkAt = -1e9, blinks = 0, pollT = 0;
  let turns = [];   // the turns running or waiting, in send order (the box is never locked)
  const T = () => timings(reduced);
  const later = (fn, ms) => { const h = win.setTimeout(fn, ms); timers.push(h); return h; };
  const gap = () => parseFloat(win.getComputedStyle ? win.getComputedStyle(panel).left : 0) || 0;   // the floating panel's gap from the window edge (its CSS left)
  const geo = () => { const W = win.innerWidth, H = win.innerHeight, fw = Math.max(160, W - MENU_W), L = markSize(fw, H); return { W, H, fw, L, cx: fw / 2, cy: H / 2 }; };

  function place() {
    const g = geo();
    Object.assign(markEl.style, { left: g.cx - g.L / 2 + 'px', top: g.cy - g.L / 2 + 'px', width: g.L + 'px', height: g.L + 'px' });
    handle.style.top = clamp(g.cy - 24, 16, g.H - 64) + 'px';
    panel.style.width = (g.W < 640 ? g.W - 2 * gap() : Math.min(440, g.fw)) + 'px';   // narrow: the whole width less the gap on each side
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
    if (kept(store, a)) { wasKept = true; store['left.kept.' + id] = '1'; quietCards(); }   // once kept, Create never comes back
    const nm = nameOf(a);
    if (nm !== name) { name = nm; setMark(applied, true); if (open) box.placeholder = `Tell Sketcher what ${name} is for`; }
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
    heldWhole = false; wasKept = kept(store, a); turns = []; drop();
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
  // Open, the arrow sits on the floating panel's right edge: its gap + its width.
  const edgeX = () => Math.max(0, Math.min(gap() + panel.getBoundingClientRect().width, win.innerWidth - tabW()));
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
    land(false);   // a flight in the air lands at once
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
    if (e.key !== 'Escape') return;
    const act = escAction({ open, running: turns.length > 0 }); if (!act) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (act === 'stop') stop(); else closePanel();
  }, true);

  /* ---- talking to Sketcher ---- */
  // A line is a div (a reply may hold lists and quotes). Only Sketcher's own words (md) are rendered
  // as markdown; the user's lines and the app's lines (waiting, errors, "Yours…") stay plain text.
  const say = (el, text) => el.replaceChildren(renderMarkdown(doc, text));
  const line = (who, text, md = false, after = null) => {   // after: right below that line, else at the end
    const el = doc.createElement('div'); el.className = who + (md ? ' md' : '');
    if (md) say(el, text); else el.textContent = text;
    if (after && after.isConnected) after.after(el); else log.append(el);
    log.scrollTop = log.scrollHeight; return el;
  };
  // The box glows (CSS :focus-within); each arrival breathes twice, typing stills it. Reduce Motion: 'still'.
  panel.classList.toggle('still', reduced);
  box.addEventListener('focus', () => { form.classList.remove('breath'); if (!reduced) { void form.offsetWidth; form.classList.add('breath'); } });
  box.addEventListener('input', () => form.classList.remove('breath'));
  box.addEventListener('blur', () => form.classList.remove('breath'));
  // The send flight: one dot, removed when it lands; the held lines show in that same frame.
  let flight = null;
  function land(bloom = true) {
    if (!flight) return;
    const f = flight; flight = null; win.clearTimeout(f.timer); f.dot.remove();
    f.mine.classList.remove('landing'); if (f.reply) f.reply.classList.remove('landing');
    if (bloom) f.mine.classList.add('bloom');
  }
  function drop() { if (!flight) return; win.clearTimeout(flight.timer); flight.dot.remove(); flight = null; }   // an error: nothing lands
  function fly(mine, reply) {
    land(false);   // only ever one dot
    // Measured after the bubble is in the log (and the log scrolled to it): the dot flies into the message.
    const b = box.getBoundingClientRect(), L = log.getBoundingClientRect();
    const from = { x: b.right - 24, y: b.top }, to = landingPoint(mine.getBoundingClientRect());
    const visible = open && !doc.hidden && inside(to, L);
    const plan = flightPlan({ from, to, reduced, visible });
    if (!plan) return;
    const dot = doc.createElement('div'); dot.className = 'send-fly'; dot.setAttribute('aria-hidden', 'true');
    mine.classList.add('landing'); if (reply) reply.classList.add('landing');   // a waiting line has no reply yet
    dot.style.transform = `translate(${from.x}px, ${from.y}px)`;
    doc.body.append(dot);
    if (dot.animate) {
      const path = Array.from({ length: 13 }, (_, i) => { const p = sendArcAt(from, to, i / 12, plan.bow); return { transform: `translate(${p.x}px, ${p.y}px)` }; });
      dot.animate(path, { duration: plan.dur, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' });
      dot.animate([{ scale: 1 }, { scale: 1.25, offset: Math.min(1, RISE_MS / plan.dur) }, { scale: 1.25 }], { duration: plan.dur, fill: 'forwards' });
    }
    flight = { dot, mine, reply, timer: win.setTimeout(() => land(true), plan.landAt) };
  }
  // Sketcher's answering flash: one per real event; a burst merges into one longer glow.
  function answer(reply) {
    if (!reply.classList.contains('wait')) return;
    reply.classList.remove('settle'); reply.classList.add('answer');
    win.clearTimeout(reply._answer);
    reply._answer = win.setTimeout(() => { reply.classList.remove('answer'); if (!reduced) reply.classList.add('settle'); }, answerHold(reduced));
  }
  box.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  // A turn: the 'you' line, then Sketcher's line once the turn starts. Sent while another turn thinks,
  // the 'you' line waits (dim, 'queued') and starts when the turn ahead ends or its first words come.
  function begin(t) {
    if (t.reply || t.stopping) return;
    t.mine.classList.remove('queued');
    t.reply = line('sketcher wait', 'Sketching…', false, t.mine);
  }
  function finish(t) { turns = turns.filter(x => x !== t); if (turns[0]) begin(turns[0]); }
  const toEnd = () => { box.focus(); box.setSelectionRange(box.value.length, box.value.length); };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const message = box.value.trim(); if (!message || !id) return;
    box.value = ''; const mine = line('you', message);
    const t = { message, mine, reply: null, text: '' }; turns.push(t);
    if (turns.length === 1) begin(t); else mine.classList.add('queued');
    const reply = t.reply;
    fly(mine, reply);
    const onText = text => {
      if (!t.reply) { t.stopping = false; begin(t); }   // its words came: it is running after all
      t.text = text;
      if (flight && flight.mine === mine) land(true);   // a very fast reply: land at once
      win.clearTimeout(t.reply._answer); t.reply.classList.remove('wait', 'answer', 'settle');
      say(t.reply, text); t.reply.classList.add('md'); log.scrollTop = log.scrollHeight;
    };
    try {
      const onChange = ev => { if (t.reply) answer(t.reply); pull(); if (ev === 'files') Promise.resolve(reloadMenu()).catch(() => {}); };
      const onAllocate = a => { if (t.reply) answer(t.reply); sortFile(a); };
      const onQueued = () => { if (!t.reply) mine.classList.add('queued'); };
      let ready = false;
      await streamChat({ fetch: win.fetch.bind(win), id, message, onText, onChange, onAllocate, onQueued, onReady: () => { ready = true; } });
      if (showCreate(ready, wasKept)) { await pull(); offerCreate(t.reply); }   // the card names the agent as this turn left it
    } catch (err) {
      if (flight && flight.mine === mine) drop();
      if (t.reply) win.clearTimeout(t.reply._answer);
      if (err && err.kind === 'cancelled') stopped(t);
      else {
        // The message goes back in the box, so Enter tries again (no retyping, no retry button).
        const msg = t.reply || line('sketcher', '', false, mine);
        msg.textContent = 'Sketcher couldn’t answer. Press Enter to try again.'; msg.className = 'sketcher err';
        mine.remove(); box.value = giveBack(box.value, [message]); toEnd();
      }
    }
    finish(t); log.scrollTop = log.scrollHeight;
  });

  // Esc while Sketcher thinks: stop every turn, running or waiting. Each ends with error {kind:'cancelled'}.
  async function stop() {
    const all = turns.slice(); all.forEach(t => { t.stopping = true; });   // none of them starts now
    box.focus();
    try { await stopTurns({ fetch: win.fetch.bind(win), id }); } catch { all.forEach(t => { t.stopping = false; }); }
  }
  // A stopped turn, said calmly: the dot goes, any words so far stay, one quiet 'Stopped' note.
  // A line that never started is marked 'Not sent' and its words go back in the box. Nothing is saved.
  function stopped(t) {
    if (t.reply) {
      if (!t.text) t.reply.remove(); else t.reply.classList.remove('wait', 'answer', 'settle');
      line('note', 'Stopped', false, t.text ? t.reply : t.mine);
    } else {
      t.mine.classList.remove('queued'); t.mine.classList.add('unsent');
      const tag = doc.createElement('span'); tag.className = 'tag'; tag.textContent = 'Not sent'; t.mine.append(tag);
      box.value = giveBack(box.value, [t.message]); toEnd();
    }
  }

  // The Create card: under the message whose turn said ready. Only the newest is live; once kept, none.
  function quietCards() {
    for (const b of log.querySelectorAll('.card button')) { b.closest('.card').classList.add('quiet'); b.remove(); }
  }
  function offerCreate(after) {
    quietCards();
    const card = doc.createElement('div'); card.className = 'card';
    const p = doc.createElement('p'); p.textContent = cardLine(name);
    const b = doc.createElement('button'); b.type = 'button'; b.textContent = 'Create';
    b.addEventListener('click', () => keep(b));
    card.append(p, b);
    if (after && after.isConnected) after.after(card); else log.append(card);
    log.scrollTop = log.scrollHeight;
  }
  async function keep(b) {
    if (b.disabled) return;   // one click, one request
    b.disabled = true; b.textContent = 'Creating…';
    try {
      const r = await win.fetch(`/api/agents/${encodeURIComponent(id)}/save`, { method: 'POST' });
      if (!r.ok) throw new Error();
      wasKept = true; store['left.kept.' + id] = '1'; quietCards(); line('sketcher', 'Created. You can keep changing it.');
    } catch { b.disabled = false; b.textContent = 'Create'; line('sketcher err', 'Couldn’t create it. Try again.'); }
  }

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
    setReduced(v) { reduced = !!v; panel.classList.toggle('still', reduced); if (reduced) land(false); kick(); },
    isOpen: () => open,
    info: () => ({
      sorted: { count: sorted.count, last: sorted.last.slice() }, sorting: sorters.length, glowing: glows.size, took: tookSeen,
      agent: id, grow, kept: wasKept, turns: turns.length, cards: log.querySelectorAll('.card button').length, shown: prev.shown, live: prev.live, applied: applied.length, flyers: flyers.length, flown: flown.size,
      handle: { shown: !handle.hidden && handle.classList.contains('in'), blinks, blinkAt },
      panel: { open, hidden: panel.hidden }, mark: mark ? mark.info() : null,
      rect: (() => { const r = markEl.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })(),
    }),
  };
  win.addEventListener('resize', place);
  place();
  return api;
}
