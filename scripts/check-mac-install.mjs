// Checks the installed Agent Creator.app end to end: Spotlight knows it, it
// opens, its server answers with the page and the demo data, and its window
// process is up. Optionally saves a screenshot to look at the window.
// Usage: node scripts/check-mac-install.mjs [screenshot.png]
import { execFileSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const BUNDLE_ID = "app.agent-creator";
const URL = `http://localhost:${process.env.AGENT_CREATOR_PORT || 3517}/`;
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

async function main() {
  const installed = await spotlightPaths();
  check("Spotlight finds the installed app", installed.length > 0, installed.join(", ") || "no hit for " + BUNDLE_ID);
  if (!installed.length) return;
  check("Spotlight finds it by name", run("mdfind", ["-name", "Agent Creator"]).split("\n").includes(installed[0]));

  run("open", [installed[0]]);
  await waitFor(`${URL}api/health`);
  const page = await (await waitFor(URL)).text();
  check("app page served", page.includes("<html"));
  const agents = await (await waitFor(`${URL}mock/agents`)).json();
  check("demo agents served", Array.isArray(agents) && agents.length > 0, `${agents.length} agents`);

  const windows = await appWindows();
  check("app window on screen", windows.length > 0, JSON.stringify(windows));

  const shot = process.argv[2];
  if (shot) renderPage(shot);
}

// The app window's process is the Chrome started with --app=<our URL>; give it time to draw.
async function appWindows(tries = 20) {
  for (let i = 0; i < tries; i++) {
    const pid = run("ps", ["-axo", "pid=,command="]).split("\n").find((l) => l.includes(`--app=${URL}`))?.trim().split(" ")[0];
    const windows = pid ? onScreenWindows(Number(pid)) : [];
    if (windows.length) return windows;
    await sleep(1000);
  }
  return [];
}

// Bounds of the normal on-screen windows a process owns (no screen-recording permission needed).
function onScreenWindows(pid) {
  const jxa = `ObjC.import('CoreGraphics');
    const all = ObjC.deepUnwrap(ObjC.castRefToObject($.CGWindowListCopyWindowInfo($.kCGWindowListOptionOnScreenOnly, 0)));
    JSON.stringify(all.filter((w) => w.kCGWindowOwnerPID === ${pid} && w.kCGWindowLayer === 0).map((w) => w.kCGWindowBounds));`;
  return JSON.parse(run("osascript", ["-l", "JavaScript", "-e", jxa]));
}

// What the window shows, drawn by a headless Chrome at the app's own URL.
function renderPage(file) {
  const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  run(chrome, ["--headless", "--disable-gpu", "--hide-scrollbars", "--window-size=1280,820", "--virtual-time-budget=4000",
    `--user-data-dir=${process.env.TMPDIR || "/tmp"}/agent-creator-check`, `--screenshot=${file}`, URL]);
  console.log(`screenshot: ${file}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
