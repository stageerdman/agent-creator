// Injects the fake CLI in place of the real binary: same args, same
// options, just run through `node fakeClaude.mjs <scenario>`.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const FAKE = fileURLToPath(new URL("./fakeClaude.mjs", import.meta.url));

export function fakeSpawn(scenario) {
  return (_binary, args, options) => spawn(process.execPath, [FAKE, scenario, ...args], options);
}
