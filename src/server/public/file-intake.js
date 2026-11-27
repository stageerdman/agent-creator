// The one way files come in: a Finder pick or a drop becomes [{ path, size }] and goes into a new
// agent's DNA (POST /api/agents, then POST /api/agents/:id/files in batches), never into chat.
// Only paths and sizes leave the page: the creator never reads content.
//
//   createIntake({ api, emit }).take(source, read)
//     read(found) → Promise<[{ path, size }]>, calling found(newEntries) as entries are read
//   events (emit(name, detail)):
//     start    { source: 'drop' | 'pick' }   at the first real entry, never before
//     found    { entries, total }             each time more entries were read (the field lights them)
//     progress { sent, total }                after each saved batch
//     done     { agentId, agent, added, dna } the agent as the server has it now
//     error    { message, started }           'busy', 'no files found', or the server's words
// A failed save removes the half-made agent. It never navigates: the screen decides.

export const BATCH = 500;   // ~60 bytes a file, far under the server's 1 MB body cap

export function chunks(list, size = BATCH) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/* Hidden files and dot-folders (.DS_Store, .git) are the Mac's and tools' files, not the person's. */
export const isHidden = path => String(path).split('/').some(part => part.startsWith('.'));
const clean = p => String(p || '').replace(/^\/+/, '');

/* A folder pick (<input webkitdirectory>) or loose File-likes. Paths start with the chosen folder's name. */
export function entriesOfFiles(files) {
  const out = [];
  for (const f of files || []) {
    const path = clean(f.relativePath || f.webkitRelativePath || f.name);
    if (path && !isHidden(path)) out.push({ path, size: +f.size || 0 });
  }
  return out;
}

/* A drop: folders are read through webkitGetAsEntry to any depth, one readEntries batch at a time,
   so a 10,000-file folder never blocks a frame. found(newEntries) after each batch with real files;
   it always runs after this call has returned its promise. Must be called inside the drop event:
   the browser empties the DataTransfer as soon as the handler returns. */
export async function entriesOfDrop(dataTransfer, found = () => {}) {
  const items = [...(dataTransfer && dataTransfer.items || [])].filter(i => i.kind === 'file');
  const roots = items.map(i => (i.webkitGetAsEntry ? i.webkitGetAsEntry() : null));
  // Taken now, while the drop is live: a top-level file whose entry can't be read (WebKit, no disk path) still counts.
  const loose = items.map(i => (i.getAsFile ? i.getAsFile() : null));
  const out = [];
  let fresh = [];
  const push = e => { if (e.path && !isHidden(e.path)) { out.push(e); fresh.push(e); } };
  const flush = async () => { await null; if (fresh.length) { const now = fresh; fresh = []; found(now); } };
  const fileOf = entry => new Promise(res => entry.file(res, () => res(null)));
  const batches = dir => { const reader = dir.createReader(); return () => new Promise(res => reader.readEntries(res, () => res([]))); };
  async function walk(entry, fallback = null) {
    if (!entry || entry.name.startsWith('.')) return;
    if (entry.isFile) { const f = (await fileOf(entry)) || fallback; if (f) push({ path: clean(entry.fullPath || entry.name), size: +f.size || 0 }); return; }
    if (!entry.isDirectory) return;
    const next = batches(entry), dirs = [];
    for (let batch = await next(); batch.length; batch = await next()) {
      for (const child of batch) { if (child.isDirectory) dirs.push(child); else await walk(child); }
      await flush();
    }
    for (const d of dirs) await walk(d);
  }
  if (roots.some(Boolean)) { for (let k = 0; k < roots.length; k++) { await walk(roots[k], loose[k]); await flush(); } }
  else { entriesOfFiles(dataTransfer && dataTransfer.files).forEach(push); await flush(); }   // no entry API: loose files only
  return out;
}

export function httpApi(fetchFn = fetch) {
  async function call(method, url, body) {
    const res = await fetchFn(url, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body && JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `The app answered ${res.status}.`);
    return data;
  }
  const at = id => `/api/agents/${encodeURIComponent(id)}`;
  return {
    createAgent: async () => (await call('POST', '/api/agents')).id,
    addFiles: (id, files) => call('POST', `${at(id)}/files`, { files }),
    getAgent: id => call('GET', at(id)),
    removeAgent: id => call('DELETE', at(id)),
  };
}

export function createIntake({ api, emit, batch = BATCH }) {
  let busy = false;
  async function take(source, read) {
    if (busy) return emit('error', { message: 'busy', started: false });
    busy = true;
    let started = false, total = 0, agentId = null;
    try {
      const entries = await read(list => {
        if (!list.length) return;
        if (!started) { started = true; emit('start', { source }); }
        total += list.length;
        emit('found', { entries: list, total });
      });
      if (!entries.length) throw new Error('no files found');
      agentId = await api.createAgent();
      const added = [];
      let result;
      for (const part of chunks(entries, batch)) {
        result = await api.addFiles(agentId, part);
        added.push(...result.added);
        emit('progress', { sent: added.length, total: entries.length });
      }
      const agent = await api.getAgent(agentId).catch(() => ({ id: agentId, dna: result.dna }));
      emit('done', { agentId, agent, added, dna: result.dna });
    } catch (error) {
      if (agentId) await Promise.resolve().then(() => api.removeAgent(agentId)).catch(() => {});   // a failed save leaves no agent
      emit('error', { message: error.message, started });
    } finally {
      busy = false;
    }
  }
  return { take, isBusy: () => busy };
}
