// The texts an agent is built into, each a file in its folder (agentStore
// readText): the final system prompt (the user may edit it), the knowledge
// file (written by the build, read-only here) and one SKILL.md per skill.
// Skills are listed in the record: [{ id, name, createdAt, updatedAt }].

import { randomBytes } from "node:crypto";
import { feedOf, normalPath } from "./files.mjs";
import { BadInput, NotFound } from "./errors.mjs";
import { sectionFiles, skillFeed } from "./sections.mjs";
import { KNOWLEDGE_FILE } from "./knowledge/merge.mjs";

const SYSTEM_PROMPT = "system-prompt.md";
const skillBody = (skillId) => `skills/${skillId}/SKILL.md`;

// `material` (agentMaterial.mjs) puts a new skill's dropped files into it.
export function createTexts({ store, material, now = () => new Date() }) {
  async function findSkill(id, skillId) {
    const record = await store.loadAgent(id);
    const skills = record.skills ?? [];
    const skill = skills.find((candidate) => candidate.id === skillId);
    if (!skill) throw new NotFound(`No skill with id "${skillId}".`);
    return { record, skills, skill };
  }

  const texts = {
    getSystemPrompt: async (id) => ({ text: await store.readText(id, SYSTEM_PROMPT) }),

    async setSystemPrompt(id, text) {
      await store.writeText(id, SYSTEM_PROMPT, requireText(text, "text"));
      return { text };
    },

    getKnowledge: async (id) => ({ text: await store.readText(id, KNOWLEDGE_FILE)}),

    // → [{ id, name, createdAt, updatedAt, fileCount }].
    async listSkills(id) {
      const record = await store.loadAgent(id);
      return (record.skills ?? []).map((skill) => ({ ...skill, fileCount: feedOf(record.files ?? [], skillFeed(skill.id)).length }));
    },

    // → the skill with its body and its files (getSkill).
    async getSkill(id, skillId) {
      const { record, skill } = await findSkill(id, skillId);
      const body = await store.readText(id, skillBody(skillId));
      return { ...skill, body, files: sectionFiles(record.files ?? [], skillFeed(skillId)) };
    },

    // A new skill, made of the files dropped to make it (may be none).
    async createSkill(id, { name, files = [] } = {}) {
      const clean = requireName(name);
      requireEntries(files); // before anything is saved: no half-made skill
      const record = await store.loadAgent(id);
      const stamp = now().toISOString();
      const skill = { id: randomBytes(4).toString("hex"), name: clean, createdAt: stamp, updatedAt: stamp };
      await store.saveDraft(id, { skills: [...(record.skills ?? []), skill] });
      await store.writeText(id, skillBody(skill.id), `# ${clean}\n`);
      if (files.length) await material.assign(id, skillFeed(skill.id), files);
      return texts.getSkill(id, skill.id);
    },

    // { name?, body? }: only what is given changes.
    async editSkill(id, skillId, { name, body } = {}) {
      const { skills, skill } = await findSkill(id, skillId);
      const renamed = name === undefined ? skill.name : requireName(name);
      if (body !== undefined) await store.writeText(id, skillBody(skillId), requireText(body, "body"));
      const edited = { ...skill, name: renamed, updatedAt: now().toISOString() };
      await store.saveDraft(id, { skills: skills.map((candidate) => (candidate === skill ? edited : candidate)) });
      return texts.getSkill(id, skillId);
    },
  };
  return texts;
}

function requireText(text, field) {
  if (typeof text !== "string") throw new BadInput(`\`${field}\` must be a string.`);
  return text;
}

function requireEntries(files) {
  if (!Array.isArray(files) || !files.every((file) => normalPath(file?.path))) {
    throw new BadInput("`files` must be a list of { path, size }.");
  }
}

function requireName(name) {
  if (typeof name !== "string" || !name.trim()) throw new BadInput("A skill needs a `name`.");
  return name.trim();
}
