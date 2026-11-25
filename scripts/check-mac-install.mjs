// Checks the installed Agent Creator.app end to end: Spotlight knows it, the
// bundle carries no Chrome, it opens as its own native window, its server
// answers with the page and the demo data, and no Chrome runs under it.
// Optionally saves a screenshot of the window (needs screen-recording access).
// Usage: node scripts/check-mac-install.mjs [screenshot.png]
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const BUNDLE_ID = "app.agent-creator";
const URL = `http://localhost:${process.env.AGENT_CREATOR_PORT || 3517}/`;
const CHROME = /chrom(e|ium)/i;
const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8" }).trim();

function check(name, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) process.exitCode = 1;
  return ok;
}

async function waitFor(url, tries = 100) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch { /* server not up yet; retry below */ }
    await sleep(200);
  }
  throw new Error(`check-mac-install: ${url} did not answer after ${tries * 0.2}s`);
}

// Spotlight indexes a fresh install a few seconds after the copy, so ask again for a while.
async function spotlightPaths(tries = 30) {
  for (let i = 0; i < tries; i++) {
    const found = run("mdfind", [`kMDItemCFBundleIdentifier == "${BUNDLE_ID}"`]).split("\n");
    const installed = found.filter((p) => p.endsWith("/Applications/Agent Creator.app"));
    if (installed.length) return installed;
    await sleep(1000);
  }
  return [];
}

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? [path, ...filesUnder(path)] : [path];
  });
}

// No file in the bundle is named after Chrome, and no binary points at a Chrome install.
function chromeInBundle(app) {
  return filesUnder(app).filter((path) => CHROME.test(path.slice(app.length))
    || (statSync(path).isFile() && readFileSync(path).includes("Google Chrome.app")));
}

function processTable() {
  return run("ps", ["-axo", "pid=,ppid=,command="]).split("\n").map((line) => {
    const [pid, ppid, ...command] = line.trim().split(/\s+/);
    return { pid: Number(pid), ppid: Number(ppid), command: command.join(" ") };
  });
}

function descendants(table, pid) {
  const children = table.filter((p) => p.ppid === pid);
  return children.flatMap((child) => [child, ...descendants(table, child.pid)]);
}

async function main() {
  const installed = await spotlightPaths();
  check("Spotlight finds the installed app", installed.length > 0, installed.join(", ") || "no hit for " + BUNDLE_ID);
  if (!installed.length) return;
  const app = installed[0];
  check("Spotlight finds it by name", run("mdfind", ["-name", "Agent Creator"]).split("\n").includes(app));
  const chromeFiles = chromeInBundle(app);
  check("no Chrome in the bundle", chromeFiles.length === 0, chromeFiles.join(", "));
  check("bundle is small", bundleMegabytes(app) < 20, `${bundleMegabytes(app)} MB`);

  run("open", [app]);
  await waitFor(`${URL}api/health`);
  const page = await (await waitFor(URL)).text();
  check("app page served", page.includes("<html"));
  const agents = await (await waitFor(`${URL}mock/agents`)).json();
  check("demo agents served", Array.isArray(agents) && agents.length > 0, `${agents.length} agents`);

  const executable = `${app}/Contents/MacOS/Agent Creator`;
  const shell = processTable().find((p) => p.command === executable);
  check("native shell process running", Boolean(shell), executable);
  if (!shell) return;
  const windows = await appWindows(shell.pid);
  check("app window on screen", windows.length > 0, JSON.stringify(windows.map((w) => w.bounds)));
  const children = descendants(processTable(), shell.pid);
  const chromeKids = children.filter((p) => CHROME.test(p.command));
  check("no Chrome in the launch path", chromeKids.length === 0, children.map((p) => p.command.slice(0, 80)).join(" | "));

  const shot = process.argv[2];
  if (shot && windows.length) screenshot(windows[0].id, shot);
}

function bundleMegabytes(app) {
  const bytes = filesUnder(app).reduce((sum, path) => sum + statSync(path).size, 0);
  return Math.round(bytes / 1e5) / 10;
}

// The shell draws its window a moment after launch, so look again for a while.
async function appWindows(pid, tries = 20) {
  for (let i = 0; i < tries; i++) {
    const windows = onScreenWindows(pid);
    if (windows.length) return windows;
    await sleep(1000);
  }
  return [];
}

// Id and bounds of the normal on-screen windows a process owns (no screen-recording permission needed).
function onScreenWindows(pid) {
  const jxa = `ObjC.import('CoreGraphics');
    const all = ObjC.deepUnwrap(ObjC.castRefToObject($.CGWindowListCopyWindowInfo($.kCGWindowListOptionOnScreenOnly, 0)));
    JSON.stringify(all.filter((w) => w.kCGWindowOwnerPID === ${pid} && w.kCGWindowLayer === 0)
      .map((w) => ({ id: w.kCGWindowNumber, bounds: w.kCGWindowBounds })));`;
  return JSON.parse(run("osascript", ["-l", "JavaScript", "-e", jxa]));
}

// The screenshot is a look-see extra, so a missing screen-recording grant is reported, not failed.
function screenshot(windowId, file) {
  try {
    run("screencapture", ["-x", "-o", `-l${windowId}`, file]);
    console.log(`screenshot: ${file}`);
  } catch (err) {
    console.log(`screenshot skipped (window ${windowId}; screen-recording access needed): ${err.message.split("\n")[0]}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
