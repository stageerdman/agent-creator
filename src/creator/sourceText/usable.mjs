// What reports about an agent (capability map, knowledge quality) read:
// every file the agent uses (not removed, in at least one feed) that has a
// text copy, tagged with its role. The fingerprint tells whether a saved
// report still matches them.

import { createHash } from "node:crypto";
import { isSkillFeed } from "../files.mjs";

const ROLE_OF_FEED = { rag: "knowledge", instructions: "persona" };

// ["rag", "skill:x"] → "knowledge, skill": what the agent does with the file.
export function roleOf(feeds) {
  const roles = feeds.map((feed) => (isSkillFeed(feed) ? "skill" : ROLE_OF_FEED[feed])).filter(Boolean);
  return [...new Set(roles)].join(", ");
}

// → { parts: [{ path, text, role }], skipped: [{ path, reason }] }.
export async function readUsable(memory, id, files = []) {
  const parts = [];
  const skipped = [];
  for (const file of files.filter((one) => !one.removed && one.feeds.length)) {
    const text = file.text === "ok" ? await memory.readCopy(id, file.path) : "";
    if (text.trim()) parts.push({ path: file.path, text, role: roleOf(file.feeds) });
    else skipped.push({ path: file.path, reason: file.text && file.text !== "ok" ? file.text : "no-copy" });
  }
  return { parts, skipped };
}

// Same sources, roles and text in any order → same fingerprint.
export function fingerprintOf(parts) {
  const hash = createHash("sha256");
  for (const { path, role, text } of [...parts].sort((a, b) => a.path.localeCompare(b.path))) {
    hash.update(JSON.stringify([path, role, text]));
  }
  return hash.digest("hex");
}
