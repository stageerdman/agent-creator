import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_PATHS, askedPaths, expandHome, scanAsked } from "./scanAsked.mjs";
import { BadInput } from "../errors.mjs";

test("expandHome: ~ and ~/x start at home, other paths are kept", () => {
  assert.equal(expandHome("~", "/Users/ada"), "/Users/ada");
  assert.equal(expandHome("~/Books", "/Users/ada"), "/Users/ada/Books");
  assert.equal(expandHome("/tmp/~x", "/Users/ada"), "/tmp/~x");
  assert.equal(expandHome("~bob/x", "/Users/ada"), "~bob/x");
});

test("askedPaths: trims, drops non-strings and blanks, dedupes after ~, caps at MAX_PATHS", () => {
  assert.deepEqual(askedPaths(undefined), []);
  assert.deepEqual(askedPaths("~/Books"), []);
  assert.deepEqual(askedPaths([" ~/Books ", "/Users/ada/Books", "", 3, null], "/Users/ada"), ["/Users/ada/Books"]);
  const many = Array.from({ length: MAX_PATHS + 5 }, (_, i) => `/p${i}`);
  assert.equal(askedPaths(many).length, MAX_PATHS);
});

test("scanAsked: scans each path alone; a bad one is reported, the rest still come in", async () => {
  const scan = async ([path]) => {
    if (path === "/missing") throw new BadInput("not found: /missing");
    if (path === "/locked") throw Object.assign(new Error("denied"), { code: "EACCES" });
    return { added: [`${path}/a.md`], skipped: [{ path: `${path}/b`, reason: "link" }] };
  };
  const result = await scanAsked(["/one", "/missing", "/locked", "/two"], { scan });
  assert.deepEqual(result.added, ["/one/a.md", "/two/a.md"]);
  assert.deepEqual(result.skipped, [
    { path: "/one/b", reason: "link" },
    { path: "/missing", reason: "not found: /missing" },
    { path: "/locked", reason: "EACCES" },
    { path: "/two/b", reason: "link" },
  ]);
});

test("scanAsked: a cancel stops it instead of being reported", async () => {
  const controller = new AbortController();
  controller.abort();
  const scan = async () => Promise.reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
  await assert.rejects(scanAsked(["/one"], { scan, signal: controller.signal }), { name: "AbortError" });
});
