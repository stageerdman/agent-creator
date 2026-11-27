// Saves agents on the user's disk, never in the repo (CLAUDE.md: personal
// material). One folder per agent, `<home>/agents/<id>/agent.json`, so P3
// can later keep the agent's materials next to it.
//
// Record: { id, draft, sessionId, handEdited, handLines?, files?, skills?, chat?, talk?, createdAt, updatedAt }.
// `chat` is what the Sketcher panel shows again on a reload: [{ who, text }].
// `talk` is the user's talk with the kept agent: [{ who, text, used? }].
// `files` is the DNA file list (see files.mjs): paths, sizes, feeds and
// added-at stamps, never content. Texts the agent is built into (its system
// prompt, knowledge, skill bodies) are files in the same folder (readText).

import { randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join } from "node:path";
import { emptyDraft, markKept } from "./draft.mjs";
import { AgentNotFound, BadInput } from "./errors.mjs";
import { createLogger } from "../log/logger.mjs";

const log = createLogger("agentStore");
// Ids are ours (hex), so anything else is unknown, never a path to follow.
const ID_PATTERN = /^[0-9a-f]{12}$/;

export function defaultHome(env = process.env) {
  return env.AGENT_CREATOR_HOME || join(homedir(), ".agent-creator");
}

export function createAgentStore({ home = defaultHome(), now = () => new Date() } = {}) {
  const agentsDir = join(home, "agents");
  const fileOf = (id) => join(agentsDir, id, "agent.json");

  async function write(record) {
    await writeAtomic(fileOf(record.id), JSON.stringify(record, null, 2));
    return record;
  }

  // A text file of the agent's own ("system-prompt.md", "skills/<id>/SKILL.md").
  async function textFileOf(id, rel) {
    await loadAgent(id); // unknown or odd id → AgentNotFound
    if (typeof rel !== "string" || !rel || isAbsolute(rel) || rel.split(/[\\/]/).some((part) => part === ".." || part === "")) {
      throw new BadInput(`Not a file inside the agent: ${JSON.stringify(rel)}.`);
    }
    return join(agentsDir, id, rel);
  }

  async function loadAgent(id) {
    if (!ID_PATTERN.test(id)) throw new AgentNotFound(id);
    try {
      return JSON.parse(await readFile(fileOf(id), "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") throw new AgentNotFound(id);
      throw new Error(`Couldn't read agent ${id}: ${error.message}`, { cause: error });
    }
  }

  async function update(id, changes) {
    const record = await loadAgent(id);
    return write({ ...record, ...changes, updatedAt: now().toISOString() });
  }

  return {
    async createAgent() {
      const stamp = now().toISOString();
      const id = randomBytes(6).toString("hex");
      return write({ id, draft: emptyDraft(), sessionId: null, handEdited: [], createdAt: stamp, updatedAt: stamp });
    },

    loadAgent,

    // The autosave. `draft.status` is whatever the caller computed:
    // applyPatch already turns a changed kept agent back into a draft.
    // Fields left out stay as they are.
    saveDraft: (id, { draft, sessionId, handEdited, handLines, files, skills, chat, talk }) =>
      update(id, definedOnly({ draft, sessionId, handEdited, handLines, files, skills, chat, talk })),

    // A text the agent keeps next to its record; "" when never written.
    async readText(id, rel) {
      const file = await textFileOf(id, rel);
      try {
        return await readFile(file, "utf8");
      } catch (error) {
        if (error.code === "ENOENT") return "";
        throw new Error(`Couldn't read ${rel} of agent ${id}: ${error.message}`, { cause: error });
      }
    },

    async writeText(id, rel, text) {
      await writeAtomic(await textFileOf(id, rel), text);
    },

    async markSaved(id) {
      const record = await loadAgent(id);
      return update(id, { draft: markKept(record.draft) });
    },

    // Removes the agent's whole folder. Only our own folder: the user's
    // files are listed by path in the record, never copied in, so they stay.
    async deleteAgent(id) {
      await loadAgent(id); // unknown or odd id → AgentNotFound, never a path to follow
      await rm(join(agentsDir, id), { recursive: true, force: true });
    },

    // Newest first. A broken file is logged and skipped so one bad agent
    // can't hide all the others.
    async listAgents() {
      const ids = await readdir(agentsDir).catch((error) => (error.code === "ENOENT" ? [] : Promise.reject(error)));
      const records = [];
      for (const id of ids.filter((name) => ID_PATTERN.test(name))) {
        try {
          records.push(await loadAgent(id));
        } catch (error) {
          log.warn("listAgents", "skipped unreadable agent", { id, error });
        }
      }
      return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  };
}

// Temp file + rename: a crash mid-write never leaves half a file.
async function writeAtomic(file, text) {
  await mkdir(dirname(file), { recursive: true });
  const temp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(temp, text);
  await rename(temp, file);
}

function definedOnly(fields) {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
}
