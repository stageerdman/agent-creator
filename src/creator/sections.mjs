// The creation screen's menu: System prompt, Knowledge and one entry per
// skill. A section is a feed of the agent's file list (files.mjs), so the
// creator's routing and the user's dropping are the same thing:
//   "system-prompt" → feed "instructions", "knowledge" → feed "rag",
//   "skill:<skillId>" → feed "skill:<skillId>".
// Pure functions over the file list; the use cases save the result.

import { BadInput, NotFound } from "./errors.mjs";
import { normalPath, stateOf } from "./files.mjs";

const FIXED = { "system-prompt": "instructions", knowledge: "rag" };

export const skillFeed = (skillId) => `skill:${skillId}`;

// The feed behind a section name. `skills` is the agent's skill list.
export function feedFor(section, skills = []) {
  if (Object.hasOwn(FIXED, section)) return FIXED[section];
  const skillId = typeof section === "string" && section.startsWith("skill:") ? section.slice("skill:".length) : null;
  if (skillId === null) throw new BadInput(`No section "${section}": use system-prompt, knowledge or skill:<id>.`);
  if (!skills.some((skill) => skill.id === skillId)) throw new NotFound(`No skill with id "${skillId}".`);
  return skillFeed(skillId);
}

// The section a feed shows up in; the inverse of feedFor.
export function sectionOf(feed) {
  const fixed = Object.keys(FIXED).find((section) => FIXED[section] === feed);
  return fixed ?? feed; // a skill feed is already its section name
}

// Where each changed file now goes, in `changed` order: one entry per
// (file, section); a file that feeds nothing goes to section "none".
// → [{ file, section }].
export function allocations(files, changed) {
  const byPath = new Map(files.map((file) => [file.path, file]));
  return changed.flatMap((path) => {
    const feeds = byPath.get(path)?.feeds ?? [];
    return feeds.length ? feeds.map((feed) => ({ file: path, section: sectionOf(feed) })) : [{ file: path, section: "none" }];
  });
}

// What a section shows: files meant for it, and files still baked into it
// that no longer are (removed, or routed elsewhere): those are red.
// → [{ path, name, size, state }].
export function sectionFiles(files, feed) {
  return files
    .filter((file) => file.feeds.includes(feed) || (file.baked ?? []).includes(feed))
    .map((file) => ({ path: file.path, name: file.name, size: file.size ?? null, state: sectionState(file, feed), text: file.text ?? null }));
}

const sectionState = (file, feed) => (file.feeds.includes(feed) ? stateOf(file, feed) : "removed");

// Puts known files into a section. → { files, changed: [paths newly in it] }.
export function assignFiles(files, feed, paths) {
  const wanted = new Set(paths.map(normalPath));
  const known = new Set(files.map((file) => file.path));
  const missing = [...wanted].find((path) => !known.has(path));
  if (missing !== undefined) throw new NotFound(`No file "${missing}" in this agent.`);
  const changed = [];
  const next = files.map((file) => {
    if (!wanted.has(file.path) || file.removed || file.feeds.includes(feed)) return file;
    changed.push(file.path);
    return { ...file, feeds: [...file.feeds, feed] };
  });
  return { files: changed.length ? next : files, changed };
}

// Takes a file out of the agent. Never used yet: it is simply gone. Already
// baked into something: it stays, red and feeding nothing, until rebuilt().
// → { files, state: "gone" | "removed" }.
export function removeFile(files, path) {
  const clean = normalPath(path);
  const file = files.find((candidate) => candidate.path === clean);
  if (!file) throw new NotFound(`No file "${clean}" in this agent.`);
  if (!(file.baked ?? []).length) return { files: files.filter((candidate) => candidate !== file), state: "gone" };
  const removed = { ...file, feeds: [], removed: true };
  return { files: files.map((candidate) => (candidate === file ? removed : candidate)), state: "removed" };
}

// Takes a file out of one section only: it stays in the agent (and in the
// DNA), baked where it was, so a section that used it shows it red until
// rebuiltFeed(). → { files, changed: whether it was in that section }.
export function unassignFile(files, feed, path) {
  const clean = normalPath(path);
  const file = files.find((candidate) => candidate.path === clean);
  if (!file) throw new NotFound(`No file "${clean}" in this agent.`);
  if (!file.feeds.includes(feed)) return { files, changed: false };
  const next = { ...file, feeds: file.feeds.filter((other) => other !== feed) };
  return { files: files.map((candidate) => (candidate === file ? next : candidate)), changed: true };
}

// After one section was rebuilt from exactly `builtPaths`: those are baked
// into `feed`, every other file is not. A removed file baked nowhere any
// more is gone for good. → { files, dropped: [paths] }.
export function rebuiltFeed(files, feed, builtPaths) {
  const built = new Set(builtPaths.map(normalPath));
  const dropped = [];
  const next = files.flatMap((file) => {
    const rebaked = withBaked(file, feed, built.has(file.path) && !file.removed && file.feeds.includes(feed));
    if (rebaked.removed && !rebaked.baked.length) {
      dropped.push(file.path);
      return [];
    }
    return [rebaked];
  });
  return { files: next, dropped };
}

function withBaked(file, feed, isBaked) {
  const others = (file.baked ?? []).filter((other) => other !== feed);
  return { ...file, baked: isBaked ? [...others, feed] : others };
}

// The builder's report: these files are now baked into `feed` (green).
// Only files still meant for that feed count.
export function markProcessed(files, feed, paths) {
  const done = new Set(paths.map(normalPath));
  return files.map((file) => {
    const baked = file.baked ?? [];
    if (!done.has(file.path) || file.removed || !file.feeds.includes(feed) || baked.includes(feed)) return file;
    return { ...file, baked: [...baked, feed] };
  });
}

// After a full rebuild every section holds exactly its files: removed ones
// are gone for good and each file is baked into what it feeds.
export function rebuilt(files) {
  return files.filter((file) => !file.removed).map((file) => ({ ...file, baked: [...file.feeds] }));
}
