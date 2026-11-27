// The agent's file list (shown in its DNA). Files are known by their path
// only: the creator routes them to the machines that will use them, it never
// reads what is inside. Pure functions, so the server, tests and the page
// agree on what a route means.
//
// File: { path, name, size, feeds, addedAt, source?, baked?, removed?, text? }.
// `text` is "ok" once its plain-text copy is kept, else why it has none
// (sourceText/memory.mjs).
// `path` is relative to what the user dropped or picked ("notes/week 1.md")
// and is the file's identity. `addedAt` (ISO) is when it joined; files saved
// before it was kept have none. `source` is its absolute place on disk when a
// scan found it. `feeds` is where it is meant to go, `baked` where a build
// has already put it (missing = nowhere yet). `removed` marks a file the user
// took out after it was baked: it stays, red, until the next full rebuild.

import { BadInput } from "./errors.mjs";

// The two machines that each get their own feed of files. Skills add one
// feed each, "skill:<id>" (see sections.mjs).
export const FEEDS = ["rag", "instructions"];
export const isSkillFeed = (feed) => feed.startsWith("skill:");

// What the creator may say about a file or folder, and the feeds that means.
export const ROUTES ={ rag: ["rag"], instructions: ["instructions"], both: FEEDS, none: [] };

// How a file looks: dim until a build used it, green once it did, red when
// removed but still baked in. With `feed`, how it looks in that one section.
export function stateOf(file, feed) {
  if (file.removed) return "removed";
  const baked = file.baked ?? [];
  return (feed ? baked.includes(feed) : baked.length > 0) ? "processed" : "unprocessed";
}

// Adds new files, stamped `addedAt`; one already in the list (same path)
// keeps its feeds and its first stamp. A removed one dropped again is back.
export function addFiles(files, incoming, addedAt = new Date().toISOString()) {
  const known = new Map(files.map((file) => [file.path, file]));
  const added = [];
  const returned = new Set();
  for (const entry of incoming) {
    const file = { ...newFile(entry), addedAt };
    const old = known.get(file.path);
    if (old?.removed) returned.add(file.path);
    if (old) continue;
    known.set(file.path, file);
    added.push(file);
  }
  const kept = returned.size ? files.map((file) => (returned.has(file.path) ? withoutRemoved(file) : file)) : files;
  return { files: [...kept, ...added], added: [...returned, ...added.map((file) => file.path)] };
}

function withoutRemoved({ removed, ...file }) {
  return file;
}

// `routes` maps a file path, or a folder path ending in "/" ("/" alone is
// every file), to a route name
// (see ROUTES). A file follows its own entry first, else its deepest folder.
// Unknown route names and unknown paths are ignored: the creator may guess.
// A route only sets the rag/instructions feeds: skill feeds stay, and a
// removed file is not routed anywhere again.
// → { files, changed: [paths whose feeds really changed] }.
export function routeFiles(files, routes) {
  const valid = Object.entries(routes ?? {}).filter(([, route]) => Object.hasOwn(ROUTES, route));
  if (!valid.length) return { files, changed: [] };
  const changed = [];
  const next = files.map((file) => {
    const route = !file.removed && routeFor(file.path, valid);
    const feeds = route && [...ROUTES[route], ...file.feeds.filter(isSkillFeed)];
    if (!route || sameFeeds(file.feeds, feeds)) return file;
    changed.push(file.path);
    return { ...file, feeds };
  });
  return { files: changed.length ? next : files, changed };
}

// The files one machine should take in (a removed file no longer is one).
export const feedOf = (files, feed) => files.filter((file) => !file.removed && file.feeds.includes(feed));

// What the Fireflies DNA logo draws: one entry per file, oldest first.
// `topic` is the top folder ("notes/week 1.md" → "notes"; no folder → "other"),
// the same rule as playground/fireflies-dna.html, so the UI maps it to a
// colour. A file without a stamp (saved before addedAt existed) takes
// `fallbackAt`, the agent's own createdAt. sizeBytes is null when unknown.
// `state` is how the firefly glows (stateOf).
// → [{ id, name, sizeBytes, addedAt, topic, state }].
export function dnaOf(files = [], fallbackAt) {
  return files
    .map((file) => ({
      id: file.path, name: file.name, sizeBytes: file.size ?? null,
      addedAt: file.addedAt || fallbackAt, topic: topicOf(file.path), state: stateOf(file),
    }))
    .sort((a, b) => (Date.parse(a.addedAt) || 0) - (Date.parse(b.addedAt) || 0));
}

function topicOf(path) {
  const slash = path.indexOf("/");
  return slash > 0 ? path.slice(0, slash).trim().toLowerCase() : "other";
}

function routeFor(path, routes) {
  const own = routes.find(([key]) => normalPath(key) === path);
  if (own) return own[1];
  const folders = routes
    .map(([key, route]) => [folderKey(key), route])
    .filter(([folder]) => folder !== null && path.startsWith(folder))
    .sort((a, b) => b[0].length - a[0].length);
  return folders[0]?.[1];
}

function newFile({ path, size, source }) {
  const clean = normalPath(path);
  if (!clean) throw new BadInput(`A file needs a path, got ${JSON.stringify(path)}.`);
  const file = { path: clean, name: clean.split("/").at(-1), size: Number.isFinite(size) && size >= 0 ? size : null, feeds: [] };
  return typeof source === "string" && source ? { ...file, source } : file;
}

// "./a\\b.md" and "/a/b.md" are both "a/b.md": what the page sends varies.
export function normalPath(path) {
  if (typeof path !== "string") return "";
  return path.replace(/\\/g, "/").replace(/^(\.?\/)+/, "").trim();
}

// "notes/" → "notes/"; "/" → "" (every file). Not a folder → null.
function folderKey(key) {
  return key.endsWith("/") ? normalPath(key) : null;
}

export const sameFeeds = (a, b) => a.length === b.length && a.every((feed) => b.includes(feed));
