import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAgentStore } from "./agentStore.mjs";
import { createAgents } from "./agents.mjs";

const home = await mkdtemp(join(tmpdir(), "agent-material-test-"));
after(() => rm(home, { recursive: true, force: true }));

async function freshAgent() {
  const store = createAgentStore({ home: await mkdtemp(join(home, "h-")) });
  const agents = createAgents({ store, engine: {}, now: () => new Date("2026-11-27T09:00:00Z") });
  const { id } = await agents.create();
  return { store, agents, id };
}

const states = (section) => section.map((file) => [file.path, file.state]);

test("scan: streams batches without disk places, then saves every file once", async () => {
  const { agents, id } = await freshAgent();
  const root = join(await mkdtemp(join(home, "drop-")), "notes");
  await mkdir(join(root, "deep"), { recursive: true });
  await writeFile(join(root, "a.md"), "aa");
  await writeFile(join(root, "deep", "b.md"), "bbb");
  const batches = [];
  const result = await agents.scan(id, [root], { onFiles: (files) => batches.push(files) });
  assert.deepEqual(batches.flat(), [{ path: "notes/a.md", name: "a.md", size: 2 }, { path: "notes/deep/b.md", name: "b.md", size: 3 }]);
  assert.deepEqual(result.added, ["notes/a.md", "notes/deep/b.md"]);
  assert.equal(result.total, 2);
  assert.equal(result.dna.length, 2);
  assert.equal((await agents.get(id)).files[1].source, join(root, "deep", "b.md"));
  // The same folder again adds nothing.
  assert.deepEqual((await agents.scan(id, [root])).added, []);
});

test("scan: an aborted scan saves nothing; an unknown agent fails before walking", async () => {
  const { agents, id } = await freshAgent();
  const root = await mkdtemp(join(home, "drop-"));
  await writeFile(join(root, "a.md"), "a");
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(agents.scan(id, [root], { signal: controller.signal }));
  assert.deepEqual((await agents.get(id)).files, []);
  await assert.rejects(agents.scan("0123456789ab", [root]), { kind: "not-found" });
});

test("sections: dropped files land in a section dim, go green when built, red when removed after", async () => {
  const { agents, id } = await freshAgent();
  const dropped = await agents.assign(id, "knowledge", [{ path: "notes/a.md", size: 2 }, { path: "notes/b.md", size: 3 }]);
  assert.deepEqual(dropped.changed, ["notes/a.md", "notes/b.md"]);
  assert.deepEqual(states(dropped.section), [["notes/a.md", "unprocessed"], ["notes/b.md", "unprocessed"]]);
  assert.deepEqual(await agents.sectionFiles(id, "system-prompt"), []);

  await agents.markProcessed(id, "knowledge", ["notes/a.md"]);
  assert.deepEqual(states(await agents.sectionFiles(id, "knowledge")), [["notes/a.md", "processed"], ["notes/b.md", "unprocessed"]]);

  assert.equal((await agents.removeFile(id, "notes/b.md")).state, "gone");
  const removed = await agents.removeFile(id, "notes/a.md");
  assert.equal(removed.state, "removed");
  assert.deepEqual(removed.dna.map((f) => f.state), ["removed"]);
  assert.deepEqual(states(await agents.sectionFiles(id, "knowledge")), [["notes/a.md", "removed"]]);

  await agents.rebuilt(id);
  assert.deepEqual(await agents.sectionFiles(id, "knowledge"), []);
});

test("sections: unknown sections, skills and files are clear errors", async () => {
  const { agents, id } = await freshAgent();
  await assert.rejects(agents.sectionFiles(id, "persona"), { kind: "bad-input" });
  await assert.rejects(agents.sectionFiles(id, "skill:ffffffff"), { kind: "not-found" });
  await assert.rejects(agents.removeFile(id, "nope.md"), { kind: "not-found" });
});

test("system prompt is editable, knowledge is read-only text, both start empty", async () => {
  const { agents, store, id } = await freshAgent();
  assert.deepEqual(await agents.getSystemPrompt(id), { text: "" });
  assert.deepEqual(await agents.setSystemPrompt(id, "You are Ada."), { text: "You are Ada." });
  assert.deepEqual(await agents.getSystemPrompt(id), { text: "You are Ada." });
  await assert.rejects(agents.setSystemPrompt(id, 3), { kind: "bad-input" });
  assert.deepEqual(await agents.getKnowledge(id), { text: "" });
  await store.writeText(id, "knowledge.md", "Soup is hot.");
  assert.deepEqual(await agents.getKnowledge(id), { text: "Soup is hot." });
});

test("skills: made from dropped files, listed with a file count, edited by name and body", async () => {
  const { agents, id } = await freshAgent();
  const skill = await agents.createSkill(id, { name: " Soup ", files: [{ path: "recipes/soup.md", size: 5 }] });
  assert.match(skill.id, /^[0-9a-f]{8}$/);
  assert.equal(skill.name, "Soup");
  assert.equal(skill.body, "# Soup\n");
  assert.deepEqual(states(skill.files), [["recipes/soup.md", "unprocessed"]]);
  assert.deepEqual(states(await agents.sectionFiles(id, `skill:${skill.id}`)), [["recipes/soup.md", "unprocessed"]]);

  const [listed] = await agents.listSkills(id);
  assert.deepEqual([listed.id, listed.name, listed.fileCount], [skill.id, "Soup", 1]);

  const edited = await agents.editSkill(id, skill.id, { body: "Stir slowly." });
  assert.deepEqual([edited.name, edited.body], ["Soup", "Stir slowly."]);
  assert.equal((await agents.editSkill(id, skill.id, { name: "Stew" })).name, "Stew");
  assert.equal((await agents.getSkill(id, skill.id)).body, "Stir slowly.");
});

test("skills: a bad request leaves no half-made skill; unknown ids are not-found", async () => {
  const { agents, id } = await freshAgent();
  await assert.rejects(agents.createSkill(id, { name: "" }), { kind: "bad-input" });
  await assert.rejects(agents.createSkill(id, { name: "Soup", files: [{ size: 1 }] }), { kind: "bad-input" });
  assert.deepEqual(await agents.listSkills(id), []);
  await assert.rejects(agents.getSkill(id, "../../x"), { kind: "not-found" });
  await assert.rejects(agents.editSkill(id, "ffffffff", { name: "x" }), { kind: "not-found" });
});
