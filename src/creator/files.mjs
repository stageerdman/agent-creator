// The agent's file list (shown in its DNA). Files are known by their path
// only: the creator routes them to the machines that will use them, it never
// reads what is inside. Pure functions, so the server, tests and the page
// agree on what a route means.
//
// File: { path, name, size, feeds, addedAt }. `path` is relative to what the
// user dropped or picked ("notes/week 1.md") and is the file's identity.
// `addedAt` (ISO) is when it joined; files saved before it was kept have none.

import { BadInput } from "./errors.mjs";

// The two machines that each get their own feed of files.
export const FEEDS = ["rag", "instructions"];

// What the creator may say about a file or folder, and the feeds that means.
const ROUTES = { rag: ["rag"], instructions: ["instructions"], both: FEEDS, none: [] };

// Adds new files, stamped `addedAt`; one already in the list (same path)
// keeps its feeds and its first stamp.
export function addFiles(files, incoming, addedAt = new Date().toISOString()) {
  const known = new Set(files.map((file) => file.path));
  const added = [];
  for (const entry of incoming) {
    const file = { ...newFile(entry), addedAt };
    if (known.has(file.path)) continue;
    known.add(file.path);
    added.push(file);
  }
  return { files: [...files, ...added], added: added.map((file) => file.path) };
}

// `routes` maps a file path, or a folder path ending in "/" ("/" alone is
// every file), to a route name
// (see ROUTES). A file follows its own entry first, else its deepest folder.
// Unknown route names and unknown paths are ignored: the creator may guess.
// → { files, changed: [paths whose feeds really changed] }.
export function routeFiles(files, routes) {
  const valid = Object.entries(routes ?? {}).filter(([, route]) => Object.hasOwn(ROUTES, route));
  if (!valid.length) return { files, changed: [] };
  const changed = [];
  const next = files.map((file) => {
    const route = routeFor(file.path, valid);
    if (!route || sameFeeds(file.feeds, ROUTES[route])) return file;
    changed.push(file.path);
    return { ...file, feeds: [...ROUTES[route]] };
  });
  return { files: changed.length ? next : files, changed };
}

// The files one machine should take in.
export const feedOf = (files, feed) => files.filter((file) => file.feeds.includes(feed));

// What the Fireflies DNA logo draws: one entry per file, oldest first.
// `topic` is the top folder ("notes/week 1.md" → "notes"; no folder → "other"),
// the same rule as playground/fireflies-dna.html, so the UI maps it to a
// colour. A file without a stamp (saved before addedAt existed) takes
// `fallbackAt`, the agent's own createdAt. sizeBytes is null when unknown.
// → [{ id, name, sizeBytes, addedAt, topic }].
export function dnaOf(files = [], fallbackAt) {
  return files
    .map(({ path, name, size, addedAt }) => ({ id: path, name, sizeBytes: size ?? null, addedAt: addedAt || fallbackAt, topic: topicOf(path) }))
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

function newFile({ path, size }) {
  const clean = normalPath(path);
  if (!clean) throw new BadInput(`A file needs a path, got ${JSON.stringify(path)}.`);
  return { path: clean, name: clean.split("/").at(-1), size: Number.isFinite(size) && size >= 0 ? size : null, feeds: [] };
}

// "./a\\b.md" and "/a/b.md" are both "a/b.md": what the page sends varies.
function normalPath(path) {
  if (typeof path !== "string") return "";
  return path.replace(/\\/g, "/").replace(/^(\.?\/)+/, "").trim();
}

// "notes/" → "notes/"; "/" → "" (every file). Not a folder → null.
function folderKey(key) {
  return key.endsWith("/") ? normalPath(key) : null;
}

const sameFeeds = (a, b) => a.length === b.length && a.every((feed) => b.includes(feed));
