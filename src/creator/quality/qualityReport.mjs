// What the user sees of an agent's knowledge quality, from its files, the
// copies read now and what the last build saved. Pure: structure is always
// computed fresh; AI scores carry `stale` when what they judged has changed.

import { createHash } from "node:crypto";
import { stateOf } from "../files.mjs";
import { fingerprintOf, roleOf } from "../sourceText/usable.mjs";
import { structureOf } from "./structure.mjs";

const hashOf = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

// What usefulness is judged against: the agent's written fields, or, before
// there are any, what all its files are about together.
export function agentFingerprintOf(draft, parts) {
  const about = [draft.name, draft.persona, draft.instructions].map((field) => field?.trim() ?? "");
  return about.some(Boolean) ? hashOf(about) : hashOf(["files", fingerprintOf(parts)]);
}

export const fileFingerprintOf = (part) => fingerprintOf([part]);
export const isPersonaPart = (part) => part.role.split(", ").includes("persona");

// The generated persona the rating reads: draft fields and background.
export const generatedOf = (draft, background) =>
  ({ name: draft.name ?? "", persona: draft.persona ?? "", instructions: draft.instructions ?? "", background: background ?? "" });

// null when there is nothing to rate: no persona source or nothing generated.
export function personaFingerprintOf(parts, generated) {
  const sources = parts.filter(isPersonaPart);
  if (!sources.length || !Object.values(generated).some((text) => text.trim())) return null;
  return hashOf([fingerprintOf(sources), generated]);
}

// Which usable parts need a (new) usefulness score.
export const needsScore = (saved, parts, agentFingerprint) =>
  parts.filter((part) => saved?.agent !== agentFingerprint || saved?.files?.[part.path]?.fingerprint !== fileFingerprintOf(part));

function fileView(file, part, reason, saved, fresh) {
  const role = roleOf(file.feeds);
  const view = { path: file.path, role, state: stateOf(file) };
  if (!part) return { ...view, structure: null, usefulness: null, noCopy: reason };
  const scored = saved?.files?.[file.path];
  const usefulness = scored ? { score: scored.score, reason: scored.reason, stale: !fresh.has(file.path) } : null;
  return { ...view, structure: structureOf(part.text, role), usefulness };
}

// files: the agent's file list; parts/skipped: readUsable(); saved: quality.json or null.
// → { files, persona, progress, stale, builtAt }.
export function reportOf({ files = [], parts, skipped, saved, agentFingerprint, personaFingerprint }) {
  const used = files.filter((file) => !file.removed && file.feeds.length);
  const partOf = new Map(parts.map((part) => [part.path, part]));
  const reasonOf = new Map(skipped.map(({ path, reason }) => [path, reason]));
  const stalePaths = new Set(needsScore(saved, parts, agentFingerprint).map((part) => part.path));
  const fresh = new Set(parts.map((part) => part.path).filter((path) => !stalePaths.has(path)));
  const personaStale = personaFingerprint !== null && saved?.persona?.fingerprint !== personaFingerprint;
  const { fingerprint, ...rating } = saved?.persona ?? {};
  return {
    files: used.map((file) => fileView(file, partOf.get(file.path), reasonOf.get(file.path), saved, fresh)),
    persona: saved?.persona ? { ...rating, stale: personaStale } : null,
    progress: {
      files: used.length,
      readable: parts.length,
      learned: used.filter((file) => stateOf(file) === "processed").length,
      scored: fresh.size,
    },
    stale: stalePaths.size > 0 || personaStale,
    builtAt: saved?.builtAt ?? null,
  };
}
