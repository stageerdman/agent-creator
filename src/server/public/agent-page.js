/* agent-page.js: an agent's own page. Who it is (Profile), what it is made of (DNA), and Talk.
 * Spec: design/agent-page.md. Pure rules first (tested in agent-page.test.mjs), then the page. */
import { nameOf, descOf } from './agent-list.js';
import { parseEvents } from './left-side.js';
import { renderMarkdown } from './markdown.js';

const uniq = list => [...new Set(list.filter(Boolean))];
const topicOf = path => { const s = String(path || ''), i = s.indexOf('/'); return i > 0 ? s.slice(0, i) : ''; };
const live = files => (files || []).filter(f => f && f.state !== 'removed');

/* G1. The three words. Good at: skills that have files behind them. Medium: what it only knows
   (Knowledge, by folder or file name) and skills with no files yet. Not trained for: the rest. */
export function profileLevels({ skills = [], knowledge = [] } = {}) {
  const good = skills.filter(s => s.fileCount > 0).map(s => s.name);
  const thin = skills.filter(s => !(s.fileCount > 0)).map(s => s.name);
  const known = live(knowledge).map(f => topicOf(f.path) || f.name);
  return { good: uniq(good), medium: uniq([...known, ...thin]), not: 'Anything outside these' };
}

/* G2. The DNA, in this order: instructions → made from → RAG files → quality. */
export function dnaSections({ instructions = '', dna = [], knowledge = [] } = {}) {
  const made = live(dna), learned = made.filter(f => f.state === 'processed').length;
  return {
    instructions: String(instructions || '').trim(),
    madeFrom: made.map(f => f.name),
    rag: live(knowledge).map(f => f.name),
    quality: made.length ? `${learned} of ${made.length} file${made.length === 1 ? '' : 's'} learned` : 'No files yet',
  };
}

/* F14. The quiet line under an answer: what it used. Nothing used → no line. */
export const usedLine = used => {
  const names = uniq((used || []).map(u => u && u.name));
  return names.length ? 'Used · ' + names.join(', ') : '';
};

/* P8. Under every answer: the passages it stood on, each with its file. None → the agent's own view. */
export const whereFrom = (sources, name) => {
  const passages = (sources || []).filter(s => s && s.passage).map(s => ({ file: String(s.file || ''), passage: String(s.passage) }));
  return passages.length ? { label: 'Where from', passages } : { label: `${name}'s own view · no reference`, passages };
};

/* C9. The one way back into the build screen. */
export const editHref = id => '/new?agent=' + encodeURIComponent(id);

/* G4. Talk only to a created agent. */
export const canTalk = a => !!(a && a.draft && a.draft.status === 'saved');

/* G4/F14/P8. One turn: POST /api/agents/:id/talk, read delta / done / error. → { say, used, sources }. Throws. */
export async function streamTalk({ fetch, id, message, onText = () => {} }) {
  const r = await fetch(`/api/agents/${encodeURIComponent(id)}/talk`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message }) });
  if (!r.ok || !r.body) throw new Error(`talk: status ${r.status}`);
  const rd = r.body.getReader(), dec = new TextDecoder();
  let buf = '', text = '', used = [], sources = [];
  for (;;) {
    const { value, done } = await rd.read(); if (done) break;
    const out = parseEvents(buf + dec.decode(value, { stream: true })); buf = out.rest;
    for (const { event, data } of out.events) {
      if (event === 'delta' && data && data.text) onText(text += data.text);
      else if (event === 'done' && data) { if (data.say && data.say !== text) onText(text = data.say); used = Array.isArray(data.used) ? data.used : []; sources = Array.isArray(data.sources) ? data.sources : []; }
      else if (event === 'error') throw new Error(`talk: ${(data && data.error) || 'error'}`);
    }
  }
  if (!text) throw new Error('talk: empty answer');
  return { say: text, used, sources };
}

/* ------------------------------------------------------------------ the page ---- */
const getJson = async (fetch, url, fallback) => { try { const r = await fetch(url); return r.ok ? await r.json() : fallback; } catch { return fallback; } };

/* Fills the page for agent a. demo: a home mock row (no server behind it). */
export async function mountAgentPage({ doc = document, fetch = window.fetch.bind(window), a, demo = false }) {
  const $ = s => doc.querySelector(s), el = (tag, cls, text) => { const e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const id = a.id, base = `/api/agents/${encodeURIComponent(id)}`;
  $('#name').textContent = nameOf(a); $('#desc').textContent = descOf(a);
  doc.title = nameOf(a) + ' · Agent Creator';
  const edit = $('#edit'); edit.href = editHref(id); edit.hidden = demo;

  // The material, read once. In demo there is no server: the row's own files are all there is.
  const [prompt, knowledge, skills] = demo ? [null, [], []] : await Promise.all([
    getJson(fetch, base + '/system-prompt', null),
    getJson(fetch, base + '/sections/knowledge/files', { files: [] }).then(k => (k && k.files) || []),
    getJson(fetch, base + '/skills', { skills: [] }).then(s => (s && s.skills) || []),
  ]);
  const instructions = (prompt && prompt.text) || (a.draft && a.draft.instructions) || '';

  // Profile: the three words.
  const lv = profileLevels({ skills, knowledge });
  const row = (label, value) => { const d = el('div', 'row'); d.append(el('dt', '', label), el('dd', '', value)); return d; };
  $('#profile-list').replaceChildren(
    row('Good at', lv.good.join(', ') || 'Nothing yet'),
    row('Medium', lv.medium.join(', ') || 'Nothing yet'),
    row('Not trained for', lv.not));

  // DNA: instructions → made from → RAG files → quality. An empty part says so in plain words.
  const ds = dnaSections({ instructions, dna: a.dna || [], knowledge });
  const part = (title, body) => { const s = el('section', 'part'); s.append(el('h2', '', title), body); return s; };
  const names = (list, none) => { if (!list.length) return el('p', 'none', none); const u = el('ul', 'names'); for (const n of list) u.append(el('li', '', n)); return u; };
  const ins = ds.instructions ? el('div', 'instructions md') : el('p', 'none', 'No instructions yet');
  if (ds.instructions) ins.append(renderMarkdown(doc, ds.instructions));
  $('#dna').replaceChildren(
    part('Instructions', ins),
    part('Made from', names(ds.madeFrom, 'No files yet')),
    part('RAG files', names(ds.rag, 'None in Knowledge')),
    part('Quality', el('p', 'quality', ds.quality)));

  // The switch: Profile | DNA. Arrow keys move between the two, like any segmented control.
  const tabs = [$('#tab-profile'), $('#tab-dna')], panes = [$('#profile'), $('#dna')];
  const pick = i => tabs.forEach((t, k) => { const on = k === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; panes[k].hidden = !on; });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(i));
    t.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const j = 1 - i; pick(j); tabs[j].focus(); } });
  });
  pick(0);

  // Talk: only a created agent. A draft gets one plain line; Edit (top right) is the way to finish it.
  const talk = $('#talk'), log = $('#talk-log'), form = $('#talk-form'), box = $('#talk-box');
  if (!canTalk(a) || demo) { talk.hidden = true; $('#not-yet').hidden = demo || canTalk(a); return; }
  talk.hidden = false; $('#not-yet').hidden = true;
  box.placeholder = `Talk to ${nameOf(a)}`;
  // Under an answer: what it used, then Where from. A line kept before P8 has no sources: no claim either way.
  const footer = (d, used, sources) => {
    const u = usedLine(used); if (u) d.append(el('p', 'used', u));
    if (!Array.isArray(sources)) return;
    const wf = whereFrom(sources, nameOf(a));
    if (!wf.passages.length) { d.append(el('p', 'used own', wf.label)); return; }
    const det = el('details', 'where'); det.append(el('summary', '', wf.label));
    for (const { file, passage } of wf.passages) { const q = el('blockquote'); q.append(el('p', '', passage), el('cite', '', file)); det.append(q); }
    d.append(det);
  };
  const bubble = (who, text, used, sources) => {
    const d = el('div', who);
    if (who === 'agent') { const b = el('div', 'md'); b.append(renderMarkdown(doc, text)); d.append(b); footer(d, used, sources); }
    else d.textContent = text;
    log.append(d); return d;
  };
  for (const t of a.talk || []) if (t && t.text) bubble(t.who === 'agent' ? 'agent' : 'you', t.text, t.used, t.sources);
  let busy = false;
  box.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const message = box.value.trim(); if (!message || busy) return;
    busy = true; box.value = '';
    const mine = bubble('you', message), reply = el('div', 'agent wait'), body = el('div', 'md', '…');
    reply.append(body); log.append(reply); reply.scrollIntoView({ block: 'nearest' });
    try {
      const { say, used, sources } = await streamTalk({ fetch, id, message, onText: t => { body.replaceChildren(renderMarkdown(doc, t)); reply.classList.remove('wait'); } });
      body.replaceChildren(renderMarkdown(doc, say)); reply.classList.remove('wait');
      footer(reply, used, sources);
    } catch {
      // The words go back in the box, so Enter tries again.
      mine.remove(); reply.remove(); if (!box.value) box.value = message;
      $('#talk-err').hidden = false;
    }
    busy = false; reply.scrollIntoView({ block: 'nearest' }); box.focus();
  });
  box.addEventListener('input', () => { $('#talk-err').hidden = true; });
}
