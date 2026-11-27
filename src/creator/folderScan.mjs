// Walks what the user dropped or picked (folders and files, absolute paths)
// and finds every file in every subfolder: path, name and size, never
// content. Found files go out in batches as the walk goes, so the screen can
// light one firefly per file without waiting for a big folder to finish.
//
// Entry: { path, name, size, source }. `path` starts at the dropped folder's
// own name ("notes/week 1.md"), like the browser's webkitRelativePath, so a
// scanned file and a dropped one are the same file. `source` is where it is.
//
// Hidden files and folders (any part starting ".") are left out: the same rule
// as the page's file intake. Links are never followed (no loops, nothing
// outside what was dropped); they are reported as skipped.

import { opendir, stat } from "node:fs/promises";
import { basename, isAbsolute, join } from "node:path";
import { BadInput } from "./errors.mjs";
import { createLogger } from "../log/logger.mjs";

const log = createLogger("folderScan");
// Files stat'ed at once: fast on big folders, far below the open-file limit.
const STAT_CHUNK = 64;

// → { files: [entry], skipped: [{ path, reason }] }. `onBatch(files)` gets
// the files as they are found, `batchSize` at a time (the last batch smaller).
export async function scanPaths(roots, { onBatch = () => {}, batchSize = 500, signal } = {}) {
  const scan = { files: [], skipped: [], pending: [], onBatch, batchSize };
  for (const root of await rootsOf(roots)) {
    signal?.throwIfAborted();
    if (root.isFile) await addFiles(scan, [{ source: root.source, path: basename(root.source) }]);
    else await walk(scan, root.source, basename(root.source), signal);
  }
  flush(scan);
  return { files: scan.files, skipped: scan.skipped };
}

async function rootsOf(roots) {
  if (!Array.isArray(roots) || roots.length === 0) throw new BadInput("`paths` must be a non-empty list of absolute paths.");
  return Promise.all(roots.map(async (source) => {
    if (typeof source !== "string" || !isAbsolute(source)) throw new BadInput(`Not an absolute path: ${JSON.stringify(source)}.`);
    const info = await stat(source).catch((error) => {
      throw error.code === "ENOENT" ? new BadInput(`Nothing at ${source}.`) : error;
    });
    if (!info.isFile() && !info.isDirectory()) throw new BadInput(`Not a file or folder: ${source}.`);
    return { source, isFile: info.isFile() };
  }));
}

// Breadth-first, one folder at a time; each folder's files are stat'ed together.
async function walk(scan, rootSource, rootPath, signal) {
  const folders = [{ source: rootSource, path: rootPath }];
  while (folders.length) {
    signal?.throwIfAborted();
    const folder = folders.shift();
    const found = await readFolder(scan, folder);
    folders.push(...found.folders);
    await addFiles(scan, found.files);
  }
}

async function readFolder(scan, folder) {
  const found = { folders: [], files: [] };
  try {
    for await (const dirent of await opendir(folder.source)) {
      if (dirent.name.startsWith(".")) continue;
      const child = { source: join(folder.source, dirent.name), path: `${folder.path}/${dirent.name}` };
      if (dirent.isSymbolicLink()) scan.skipped.push({ path: child.path, reason: "link" });
      else if (dirent.isDirectory()) found.folders.push(child);
      else if (dirent.isFile()) found.files.push(child);
    }
  } catch (error) {
    // A folder we may not read is reported, not fatal: the rest still counts.
    log.warn("readFolder", "skipped unreadable folder", { path: folder.path, error });
    scan.skipped.push({ path: folder.path, reason: error.code ?? "unreadable" });
  }
  return found;
}

async function addFiles(scan, children) {
  for (let i = 0; i < children.length; i += STAT_CHUNK) {
    const chunk = children.slice(i, i + STAT_CHUNK);
    const sizes = await Promise.all(chunk.map((child) => sizeOf(scan, child)));
    chunk.forEach((child, j) => {
      if (sizes[j] !== null) push(scan, { path: child.path, name: basename(child.path), size: sizes[j], source: child.source });
    });
  }
}

async function sizeOf(scan, child) {
  try {
    return (await stat(child.source)).size;
  } catch (error) {
    log.warn("sizeOf", "skipped unreadable file", { path: child.path, error });
    scan.skipped.push({ path: child.path, reason: error.code ?? "unreadable" });
    return null;
  }
}

function push(scan, file) {
  scan.files.push(file);
  scan.pending.push(file);
  if (scan.pending.length >= scan.batchSize) flush(scan);
}

function flush(scan) {
  if (!scan.pending.length) return;
  scan.onBatch(scan.pending);
  scan.pending = [];
}
