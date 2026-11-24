// The one logger every module uses — never bare console.log. Each line is a
// JSON object on stderr (stdout stays free for anything a caller may pipe),
// carrying module + fn + whatever context the caller passes (traceId above
// all), so one grep for a traceId shows a request's whole path.

import { randomUUID } from "node:crypto";

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

function thresholdFrom(env) {
  return LEVELS[env.LOG_LEVEL] ?? LEVELS.info;
}

export function newTraceId() {
  return randomUUID().slice(0, 8);
}

// `write` and `env` are injectable so tests can capture output.
export function createLogger(module, { write = (line) => process.stderr.write(line), env = process.env } = {}) {
  const threshold = thresholdFrom(env);
  const log = (level) => (fn, message, context = {}) => {
    if (LEVELS[level] < threshold) return;
    const entry = { time: new Date().toISOString(), level, module, fn, message, ...context };
    if (context.error instanceof Error) {
      entry.error = { name: context.error.name, message: context.error.message, kind: context.error.kind };
    }
    write(JSON.stringify(entry) + "\n");
  };
  return { debug: log("debug"), info: log("info"), warn: log("warn"), error: log("error") };
}
