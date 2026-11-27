// The Knowledge section's sources as the RAG builder sees them: files of
// feed "rag", each with an optional `title` and `note` the user gave it.
// Pure rules over the file list (files.mjs); knowledgeBuilder.mjs saves them.
// Any change to a source since the last Build takes "rag" out of its
// `baked`, so it shows dim until the next Build.

import { BadInput, NotFound } from "../errors.mjs";
import { addFiles, feedOf, normalPath } from "../files.mjs";
import { sectionFiles, unassignFile } from "../sections.mjs";

export const KNOWLEDGE_FEED = "rag";

// → [{ path, name, size, state, text, embed, title, note }], in list order;
// a file taken out but still baked in shows "removed".
export function sourcesOf(files) {
  const byPath = new Map(files.map((file) => [file.path, file]));
  return sectionFiles(files, KNOWLEDGE_FEED).map((source) => {
    const { embed = null, title = null, note = null } = byPath.get(source.path);
    return { ...source, embed, title, note };
  });
}

// { title?, note? }: only what is given changes; "" clears it. → files.
export function adjustSource(files, path, fields) {
  const file = requireSource(files, path);
  return replaced(files, file, [unbaked({ ...file, ...labelsOf(fields) })]);
}

// Out of Knowledge at once: no longer searchable, its `embed` mark gone.
// It stays in the agent's list (its copy and other sections untouched). → files.
export function takeOut(files, path) {
  requireSource(files, path);
  return unassignFile(files, KNOWLEDGE_FEED, path).files.map((file) => (file.path === normalPath(path) ? outOfKnowledge(file) : file));
}

// `entry` ({ path, size, source? }) takes the old source's place, title and
// note; the old one is taken out. → { files, path: the new source's path }.
export function swapSource(files, oldPath, entry, addedAt) {
  const old = requireSource(files, oldPath);
  const path = normalPath(entry?.path);
  if (path === old.path) throw new BadInput(`"${path}" can't be swapped for itself.`);
  const joined = addFiles(files, [entry], addedAt).files;
  const incoming = joined.find((file) => file.path === path);
  if (incoming.feeds.includes(KNOWLEDGE_FEED)) throw new BadInput(`"${path}" is already in Knowledge.`);
  const swapped = { ...incoming, feeds: [...incoming.feeds, KNOWLEDGE_FEED], title: old.title, note: old.note };
  const { title, note, ...rest } = outOfKnowledge(old);
  const leaving = { ...rest, feeds: old.feeds.filter((feed) => feed !== KNOWLEDGE_FEED) };
  const next = joined.filter((file) => file.path !== path);
  return { files: replaced(next, next.find((file) => file.path === old.path), [swapped, leaving]), path };
}

// What a Build can merge: sources with a copy that were proven searchable,
// in list order; every other source with why not.
// → { built: [paths], skipped: [{ path, reason }] }.
export function buildPlan(files) {
  const built = [];
  const skipped = [];
  for (const file of feedOf(files, KNOWLEDGE_FEED)) {
    const reason = file.text !== "ok" ? file.text ?? "no-copy" : file.embed !== "ok" ? file.embed ?? "not-embedded" : null;
    if (reason) skipped.push({ path: file.path, reason });
    else built.push(file.path);
  }
  return { built, skipped };
}

function requireSource(files, path) {
  const clean = normalPath(path);
  const file = files.find((candidate) => candidate.path === clean && candidate.feeds.includes(KNOWLEDGE_FEED));
  if (!file) throw new NotFound(`No source "${clean}" in this agent's Knowledge.`);
  return file;
}

function labelsOf({ title, note } = {}) {
  const labels = {};
  if (title !== undefined) labels.title = label(title, "title");
  if (note !== undefined) labels.note = label(note, "note");
  return labels;
}

function label(value, field) {
  if (typeof value !== "string") throw new BadInput(`\`${field}\` must be a string.`);
  return value.trim() || undefined;
}

const unbaked = (file) => ({ ...file, baked: (file.baked ?? []).filter((feed) => feed !== KNOWLEDGE_FEED) });
const outOfKnowledge = (file) => ({ ...file, embed: undefined });
const replaced = (files, target, by) => files.flatMap((file) => (file === target ? by : [file]));
