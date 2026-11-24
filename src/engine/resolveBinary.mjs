// Port of masters-wheel src-tauri/src/util.rs::resolve_binary.
// An app launched from Finder/Spotlight (or by a studio "Start" button)
// doesn't inherit the shell's PATH, so a bare `claude` isn't found even when
// installed. Check the known install spots first, then fall back to the bare
// name for wherever PATH does carry it. `~/.local/bin` and `~/.claude/local`
// are Claude Code's own installer locations (not in the Rust original).

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export function candidateDirs(home = homedir()) {
  return ["/opt/homebrew/bin", "/usr/local/bin", join(home, ".local/bin"), join(home, ".claude/local")];
}

export function resolveBinary(name, { dirs = candidateDirs(), exists = existsSync } = {}) {
  for (const dir of dirs) {
    const candidate = join(dir, name);
    if (exists(candidate)) return candidate;
  }
  return name;
}
