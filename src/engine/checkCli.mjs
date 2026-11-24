// "Is the AI CLI there?" — masters-wheel never checked this up front
// (wiki, "what to adapt" #4). Login state isn't probed: a logged-out CLI
// reports it on the first real call, and that error is shown as-is.

import { runCliProcess } from "./cliProcess.mjs";
import { resolveBinary } from "./resolveBinary.mjs";

export async function checkCli({ binary = resolveBinary("claude"), spawn } = {}) {
  const lines = [];
  try {
    const { code } = await runCliProcess({ binary, args: ["--version"], onLine: (line) => lines.push(line), spawn });
    return { installed: code === 0, binary, version: lines.join(" ").trim() };
  } catch {
    // Only not-installed can reach here (no signal is passed); "not
    // installed" is the answer, not an error.
    return { installed: false, binary, version: "" };
  }
}
