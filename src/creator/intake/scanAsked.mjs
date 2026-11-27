// Paths the user typed in the chat ("take ~/Books"), read in like dropped
// folders. Each path is scanned on its own, so one bad path is reported and
// the others still come in: a typo never fails the chat turn.

import { homedir } from "node:os";
import { createLogger } from "../../log/logger.mjs";

const log = createLogger("scanAsked");
export const MAX_PATHS = 10;

// "~" and "~/x" start at `home`; anything else is kept as given.
export function expandHome(path, home = homedir()) {
  if (path === "~") return home;
  return path.startsWith("~/") ? `${home}${path.slice(1)}` : path;
}

// The distinct, non-empty strings of what the Sketcher asked for.
export function askedPaths(paths, home = homedir()) {
  if (!Array.isArray(paths)) return [];
  const clean = paths.filter((path) => typeof path === "string" && path.trim()).map((path) => expandHome(path.trim(), home));
  return [...new Set(clean)].slice(0, MAX_PATHS);
}

// `scan(roots, { onFiles, signal })` is the agent's material.scan.
// → { added: [paths], skipped: [{ path, reason }] }. A cancel still stops it.
export async function scanAsked(paths, { scan, onFiles, signal, traceId }) {
  const result = { added: [], skipped: [] };
  for (const path of paths) {
    try {
      const found = await scan([path], { onFiles, signal });
      result.added.push(...found.added);
      result.skipped.push(...found.skipped);
    } catch (error) {
      if (signal?.aborted) throw error;
      log.warn("scanAsked", "skipped a path asked in chat", { traceId, path, error });
      result.skipped.push({ path, reason: error.kind === "bad-input" ? error.message : error.code ?? "unreadable" });
    }
  }
  return result;
}
