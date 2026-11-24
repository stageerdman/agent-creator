// Starts the AI CLI as a background process and feeds its stdout to the
// caller line by line. Shared by the one-shot and streaming call shapes so
// spawn, stderr draining and cancel live in exactly one place.

import { spawn as nodeSpawn } from "node:child_process";
import { tmpdir } from "node:os";
import { createInterface } from "node:readline";
import { ClaudeCliError } from "./errors.mjs";

const NOT_INSTALLED = "The Claude Code CLI isn't available. Make sure `claude` is installed and you're logged in.";

// Resolves { code, stderr } once the process has exited and all stdout lines
// were delivered. Rejects with ClaudeCliError for not-installed / cancelled.
export function runCliProcess({ binary, args, onLine, signal, spawn = nodeSpawn }) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(cancelled());
    // cwd = temp dir so no project CLAUDE.md leaks into the reply (pitfall 3).
    const child = spawn(binary, args, { cwd: tmpdir(), stdio: ["ignore", "pipe", "pipe"] });
    const onAbort = () => child.kill("SIGTERM");
    signal?.addEventListener("abort", onAbort, { once: true });

    // stderr is read in parallel with stdout; reading one pipe while the
    // other fills up unread deadlocks the child (pitfall 7).
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => (stderr += chunk));
    createInterface({ input: child.stdout }).on("line", onLine);

    child.on("error", (error) => {
      signal?.removeEventListener("abort", onAbort);
      reject(new ClaudeCliError("not-installed", `${NOT_INSTALLED} (${error.message})`, { cause: error }));
    });
    // "close" (not "exit") fires after stdout/stderr are fully drained.
    child.on("close", (code) => {
      signal?.removeEventListener("abort", onAbort);
      if (signal?.aborted) return reject(cancelled());
      resolve({ code, stderr: stderr.trim() });
    });
  });
}

function cancelled() {
  return new ClaudeCliError("cancelled", "The AI call was cancelled.");
}
