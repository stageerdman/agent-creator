// Gets everything `tauri build` bundles ready: the app's code (src/ without
// tests, package.json) in dist/stage/app, the node it was built with, and
// the icons. Run by tauri.conf.json's beforeBuildCommand.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { writeIcon } from "./make-mac-icon.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const app = `${root}dist/stage/app`;
const icons = `${root}src-tauri/icons`;

rmSync(app, { recursive: true, force: true });
mkdirSync(app, { recursive: true });
cpSync(`${root}src`, `${app}/src`, { recursive: true, filter: (path) => !path.endsWith(".test.mjs") });
cpSync(`${root}package.json`, `${app}/package.json`);
// The shell tries this node first (see src-tauri/src/node.rs).
writeFileSync(`${app}/node-path`, process.execPath);

mkdirSync(icons, { recursive: true });
writeIcon(`${icons}/icon.icns`);
writeIcon(`${icons}/icon.png`);

console.log(`stage-mac-app: staged ${app}`);
