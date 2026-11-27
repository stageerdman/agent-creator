// Plain-word file rules ("only PDF and MD go to knowledge", "a random sample
// for the persona", "this book for the persona, the rest for RAG"), as the
// Sketcher writes them in its <draft> block, applied to the file list. Pure:
// randomness is passed in, so tests are exact.
//
// Rule: { to: route (see files.ROUTES),
//         files?: { types?: [extension | kind], in?: path | folder/ | [...], rest?: true },
//         only?: true, sample?: count | "N%" }.

import { ROUTES, isSkillFeed, normalPath, routeFiles, sameFeeds } from "../files.mjs";
import { extensionOf, kindOf } from "./kinds.mjs";

// The turn's path routes (patch.files), then its rules (patch.rules), in order.
// → { files, changed: [paths whose feeds changed], rules: [{ to, picked, only }] }.
export function sortFiles(files, patch = {}, random = Math.random) {
  const routed = routeFiles(files, patch.files).files;
  const { files: next, rules } = applyRules(routed, patch.rules, random);
  const before = new Map(files.map((file) => [file.path, file.feeds]));
  const changed = next.filter((file) => !sameFeeds(before.get(file.path), file.feeds)).map((file) => file.path);
  return { files: changed.length ? next : files, changed, rules };
}

// Bad rules are skipped: the model may guess.
export function applyRules(files, rules, random = Math.random) {
  const picked = new Set();
  const report = [];
  for (const rule of (Array.isArray(rules) ? rules : []).map(validRule).filter(Boolean)) {
    const chosen = sampleOf(files.filter((file) => !file.removed && matches(file, rule.files, picked)), rule.sample, random);
    chosen.forEach((file) => picked.add(file.path));
    files = withRoute(files, new Set(chosen.map((file) => file.path)), rule);
    report.push({ to: rule.to, picked: chosen.length, only: rule.only });
  }
  return { files, rules: report };
}

function withRoute(files, chosen, { to, only }) {
  const feeds = ROUTES[to];
  return files.map((file) => {
    if (file.removed) return file;
    if (chosen.has(file.path)) return withFeeds(file, [...feeds, ...file.feeds.filter(isSkillFeed)]);
    return only ? withFeeds(file, file.feeds.filter((feed) => !feeds.includes(feed))) : file;
  });
}

const withFeeds = (file, feeds) => (sameFeeds(file.feeds, feeds) ? file : { ...file, feeds });

function matches(file, { types, in: places, rest }, picked) {
  if (rest && picked.has(file.path)) return false;
  if (types && !types.some((type) => type === extensionOf(file.path) || type === kindOf(file.path))) return false;
  return !places || places.some((place) => place === "" || file.path === place || file.path.startsWith(`${place}/`));
}

// The first `size` of a random order, kept in list order.
function sampleOf(files, sample, random) {
  if (sample === undefined) return files;
  const size = Math.min(files.length, sampleSize(sample, files.length));
  const order = files.map((_, index) => index);
  for (let i = 0; i < size; i += 1) {
    const j = i + Math.floor(random() * (order.length - i));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const kept = new Set(order.slice(0, size));
  return files.filter((_, index) => kept.has(index));
}

const sampleSize = (sample, total) =>
  typeof sample === "number" ? sample : Math.max(1, Math.round((total * parseFloat(sample)) / 100));

// A rule in its clean shape, or null when it can't mean anything.
function validRule(rule) {
  if (!rule || !Object.hasOwn(ROUTES, rule.to)) return null;
  const files = validSelector(rule.files ?? {});
  const sample = validSample(rule.sample);
  if (!files || sample === null) return null;
  return { to: rule.to, files, only: rule.only === true, sample };
}

function validSelector({ types, in: places, rest }) {
  const cleanTypes = types === undefined ? undefined : listOf(types).map((type) => String(type).toLowerCase().replace(/^\./, ""));
  const cleanPlaces = places === undefined ? undefined : listOf(places).map((place) => normalPath(place).replace(/\/+$/, ""));
  if (cleanTypes?.length === 0 || cleanPlaces?.length === 0) return null;
  return { types: cleanTypes, in: cleanPlaces, rest: rest === true };
}

const listOf = (value) => (Array.isArray(value) ? value : [value]).filter((item) => typeof item === "string" && item.trim());

// undefined = no sample; a whole count ≥ 1 or "N%" (0 < N ≤ 100); else null.
function validSample(sample) {
  if (sample === undefined || sample === null) return undefined;
  if (Number.isInteger(sample) && sample >= 1) return sample;
  const share = typeof sample === "string" && /^\s*(\d+(\.\d+)?)\s*%\s*$/.exec(sample);
  return share && Number(share[1]) > 0 && Number(share[1]) <= 100 ? share[0].trim() : null;
}
