// Gets everything `tauri build` bundles ready: the app's code (src/ without
// tests, package.json, runtime node_modules) in dist/stage/app, the node it was built with, and
// the icons. Run by tauri.conf.json's beforeBuildCommand.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { writeIcon } from "./make-mac-icon.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const app = `${root}dist/stage/app`;
const icons = `${root}src-tauri/icons`;

rmSync(app, { recursive: true, force: true });
mkdirSync(app, { recursive: true });
cpSync(`${root}src`, `${app}/src`, { recursive: true, filter: (path) => !path.endsWith(".test.mjs") });
cpSync(`${root}package.json`, `${app}/package.json`);
stageDependencies(readPackage(root).dependencies);
// The shell tries this node first (see src-tauri/src/node.rs).
writeFileSync(`${app}/node-path`, process.execPath);

mkdirSync(icons, { recursive: true });
writeIcon(`${icons}/icon.icns`);
writeIcon(`${icons}/icon.png`);

console.log(`stage-mac-app: staged ${app}`);

// The bundle has no npm: copy each runtime dependency (and theirs, not
// devDependencies) from node_modules. Fails loudly if `npm install` was not run.
function stageDependencies(dependencies = {}, staged = new Set()) {
  for (const name of Object.keys(dependencies)) {
    if (staged.has(name)) continue;
    staged.add(name);
    const from = `${root}node_modules/${name}`;
    if (!existsSync(from)) throw new Error(`stage-mac-app: ${name} is not installed; run npm install`);
    cpSync(from, `${app}/node_modules/${name}`, { recursive: true });
    stageDependencies(readPackage(`${from}/`).dependencies, staged);
  }
}

function readPackage(folder) {
  return JSON.parse(readFileSync(`${folder}package.json`, "utf8"));
}
