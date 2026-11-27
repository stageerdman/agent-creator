// The <files> block the Sketcher reads: paths and feeds only, never content.
// Up to `limit` files it lists each one; beyond that a folder of thousands
// would flood the prompt, so it lists folders with counts per type and feed,
// and the Sketcher sorts them with rules instead of paths.
// Only the feeds it may route (skill files are the user's own sorting), and
// never a file the user removed.

import { FEEDS } from "../files.mjs";
import { extensionOf } from "./kinds.mjs";

export const FULL_LIST_LIMIT = 150;
const TYPES_SHOWN = 6;

export function fileSummary(files, limit = FULL_LIST_LIMIT) {
  const listed = files.filter((file) => !file.removed);
  if (!listed.length) return "";
  const rows = listed.length <= limit ? listed.map(fileRow) : folderRows(listed, limit);
  return ["<files>", ...rows, "</files>"].join("\n");
}

const routedFeeds = (file) => file.feeds.filter((feed) => FEEDS.includes(feed));

function fileRow(file) {
  const routed = routedFeeds(file);
  return `- ${file.path} → ${routed.length ? routed.join(" + ") : "not routed yet"}`;
}

// By parent folder; still too many folders → by top folder.
function folderRows(files, limit) {
  const byParent = groupBy(files, parentOf);
  const groups = byParent.size <= limit ? byParent : groupBy(files, topOf);
  return [
    `${files.length} files, too many to list one by one: by folder. Sort them with "rules" (by type or folder), not one path at a time.`,
    ...[...groups].map(([folder, members]) => folderRow(folder, members)),
  ];
}

function folderRow(folder, files) {
  const types = countsOf(files.map((file) => extensionOf(file.path) || "no extension"));
  const shown = types.slice(0, TYPES_SHOWN).map(([type, count]) => `${count} ${type}`);
  if (types.length > TYPES_SHOWN) shown.push(`${types.slice(TYPES_SHOWN).reduce((sum, [, count]) => sum + count, 0)} other`);
  const feeds = countsOf(files.flatMap((file) => (routedFeeds(file).length ? routedFeeds(file) : ["not routed yet"])));
  return `- ${folder || "(top level)"} : ${files.length} files (${shown.join(", ")}) → ${feeds.map(([feed, count]) => `${feed} ${count}`).join(", ")}`;
}

const parentOf = (file) => file.path.slice(0, file.path.lastIndexOf("/") + 1);
const topOf = (file) => file.path.slice(0, file.path.indexOf("/") + 1);

function groupBy(items, keyOf) {
  const groups = new Map();
  for (const item of items) {
    const key = keyOf(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

// Most common first.
function countsOf(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
}
