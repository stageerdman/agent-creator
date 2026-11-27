// Files picked in Finder or dropped on the page go into a new agent's DNA
// (POST /api/agents, then POST /api/agents/:id/files), never into chat.
// Only paths and sizes leave the page: the creator never reads content.
//
// The screen listens on `document` (attachIntake) and draws its own moments:
//   intake:over / intake:leave  something is dragged over the window / left it
//   intake:start  { source: 'drop' | 'pick' }  the instant files are chosen
//   intake:progress { sent, total }  after each upload batch
//   intake:done   { agentId, files, added, dna }
//   intake:cancel  the picker closed with nothing chosen
//   intake:error  { message }  'busy' while one runs, 'no files found', or the server's words
// It never navigates: the screen decides where to move on.

export const BATCH = 500;   // ~60 bytes a file, far under the server's 1 MB body cap

// .DS_Store, .git/… are the Mac's and tools' files, not the person's material.
export const isHidden = (path) => path.split("/").some((part) => part.startsWith("."));

// File-likes ({ name, size, relativePath | webkitRelativePath }) → [{ path, size }].
export function toEntries(files) {
  return Array.from(files, (file) => ({ path: file.relativePath || file.webkitRelativePath || file.name, size: file.size }))
    .filter(({ path }) => path && !isHidden(path));
}

export function chunks(list, size = BATCH) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

// A drop's FileSystemEntries → File-likes with their path inside the drop.
// Folders are walked to any depth; readEntries hands out batches until empty.
export async function walkEntries(entries) {
  const files = [];
  async function visit(entry) {
    if (entry.isFile) {
      const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
      files.push({ name: file.name, size: file.size, relativePath: entry.fullPath.replace(/^\/+/, "") });
    } else if (entry.isDirectory && !isHidden(entry.name)) {
      const reader = entry.createReader();
      for (;;) {
        const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
        if (!batch.length) break;
        for (const child of batch) await visit(child);
      }
    }
  }
  for (const entry of entries) await visit(entry);
  return files;
}

// The entries must be taken during the drop event itself: the browser empties
// the DataTransfer as soon as the handler returns.
export function dropSource(dataTransfer) {
  const entries = Array.from(dataTransfer.items ?? [], (item) => item.webkitGetAsEntry?.()).filter(Boolean);
  const files = Array.from(dataTransfer.files ?? []);
  return () => (entries.length ? walkEntries(entries) : files);
}

export function httpApi(fetchFn = fetch) {
  async function call(method, url, body) {
    const res = await fetchFn(url, { method, headers: { "content-type": "application/json" }, body: body && JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `The app answered ${res.status}.`);
    return data;
  }
  return {
    createAgent: async () => (await call("POST", "/api/agents")).id,
    addFiles: (id, files) => call("POST", `/api/agents/${encodeURIComponent(id)}/files`, { files }),
  };
}

// The intake itself, without the DOM: `gather()` yields File-likes.
export function createIntake({ api, emit, batch = BATCH }) {
  let busy = false;
  async function take(source, gather) {
    if (busy) return emit("error", { message: "busy" });
    busy = true;
    emit("start", { source });
    try {
      const entries = toEntries(await gather());
      if (!entries.length) throw new Error("no files found");
      const agentId = await api.createAgent();
      const added = [];
      let result;
      for (const part of chunks(entries, batch)) {
        result = await api.addFiles(agentId, part);
        added.push(...result.added);
        emit("progress", { sent: added.length, total: entries.length });
      }
      emit("done", { agentId, files: result.files, added, dna: result.dna });
    } catch (error) {
      emit("error", { message: error.message });
    } finally {
      busy = false;
    }
  }
  return { take, isBusy: () => busy };
}

// Wires drops on the whole window and a hidden Finder folder picker.
// → { pick(), isBusy() }.
export function attachIntake(doc = document, { api = httpApi() } = {}) {
  const emit = (name, detail) => doc.dispatchEvent(new CustomEvent(`intake:${name}`, { detail }));
  const intake = createIntake({ api, emit });

  const input = Object.assign(doc.createElement("input"), { type: "file", multiple: true, hidden: true });
  input.setAttribute("webkitdirectory", "");
  doc.body.append(input);
  input.addEventListener("change", () => {
    const files = Array.from(input.files);
    input.value = "";   // the same folder picked again still fires change
    if (files.length) intake.take("pick", () => files);
    else emit("cancel");
  });
  input.addEventListener("cancel", () => emit("cancel"));

  // dragenter/leave fire for every child crossed; count to know the window's own edge.
  let depth = 0;
  const hasFiles = (e) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
  doc.addEventListener("dragenter", (e) => { if (hasFiles(e) && depth++ === 0) emit("over"); });
  doc.addEventListener("dragleave", (e) => { if (hasFiles(e) && --depth === 0) emit("leave"); });
  doc.addEventListener("dragover", (e) => { if (hasFiles(e)) e.preventDefault(); });   // allows the drop
  doc.addEventListener("drop", (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();   // never let the window navigate to the dropped file
    depth = 0;
    emit("leave");
    intake.take("drop", dropSource(e.dataTransfer));
  });

  return {
    pick() {
      if (intake.isBusy()) return emit("error", { message: "busy" });
      input.click();
    },
    isBusy: intake.isBusy,
  };
}
