import { test } from "node:test";
import assert from "node:assert/strict";
import { agentIdentity, buildTalkPrompt, sourcesOf, usedOf } from "./talkPrompt.mjs";

const excerpts = [{ file: "a.md", text: "one " }, { file: "b.md", text: "two" }];

test("agentIdentity: the written system prompt, else persona and instructions", () => {
  assert.equal(agentIdentity({ systemPrompt: " Be brief. ", draft: { persona: "x", instructions: "y" } }), "Be brief.");
  assert.equal(agentIdentity({ systemPrompt: "", draft: { persona: "Calm.", instructions: " " } }), "Calm.");
});

test("buildTalkPrompt numbers retrieved passages by file and asks for their numbers", () => {
  const prompt = buildTalkPrompt({ systemPrompt: "Be.", draft: {}, excerpts });
  assert.match(prompt, /<knowledge>\n.*\n\n\[1\] \(from a\.md\)\none\n\n\[2\] \(from b\.md\)\ntwo\n<\/knowledge>/);
  assert.match(prompt, /<used>.*"passages": \[1, 3\]/, "the used rule comes with passages alone");
  assert.equal(buildTalkPrompt({ systemPrompt: "Be.", draft: {} }), "Be.");
});

test("sourcesOf keeps only given passage numbers, once each, in the agent's order", () => {
  assert.deepEqual(sourcesOf({ passages: [2, 9, 0, 2, "1", 1.5, 1] }, excerpts), [
    { file: "b.md", passage: "two" },
    { file: "a.md", passage: "one" },
  ]);
  assert.deepEqual(sourcesOf({ passages: "1" }, excerpts), []);
  assert.deepEqual(sourcesOf(null, excerpts), [], "no block = own view");
});

test("usedOf accepts given file names and counts a used passage's file", () => {
  assert.deepEqual(usedOf({ files: ["b.md", "x.md"] }, { excerpts }), [{ kind: "file", name: "b.md" }]);
  assert.deepEqual(usedOf({ files: ["b.md"], passages: [2, 1] }, { excerpts }), [
    { kind: "file", name: "b.md" },
    { kind: "file", name: "a.md" },
  ]);
  assert.deepEqual(usedOf({ skills: ["s", "t"] }, { skills: [{ name: "s" }] }), [{ kind: "skill", name: "s" }]);
});
