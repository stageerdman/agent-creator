// Talking to a kept agent (G4): the agent itself answers, from its system
// prompt, skill bodies and files, and the passages of its Knowledge files
// that a search finds for the message (talkPrompt.mjs). The
// talk is kept in the record; it never changes the draft or the files.

import { askWithBlock } from "./askWithBlock.mjs";
import { buildTalkMessage, buildTalkPrompt, usedOf } from "./talkPrompt.mjs";
import { createLogger } from "../log/logger.mjs";
import { BadInput, CantEmbed } from "./errors.mjs";
import { CONTEXT_FILE } from "./persona/personaBuilder.mjs";

const log = createLogger("agentTalk");
export const TALK_KEEP = 200;
const TALK_CONTEXT = 40; // earlier lines the agent sees again
const FILE_CAP = 100_000; // characters per file
const TOTAL_CAP = 400_000; // characters over all files

// Knowledge files are searched, not inlined: only skill files go in whole.
const feedsTalk = (file) => !file.removed && file.text === "ok" && file.feeds.some((feed) => feed.startsWith("skill:"));

// `memory` (sourceText/memory.mjs) holds the files' plain-text copies:
// talk reads those, never the originals. `knowledge` finds the passages
// of the agent's Knowledge files closest to what the user says.
export function createTalk({ store, engine, memory, knowledge }) {
  // A model that can't run leaves the answer without excerpts, never fails it.
  async function excerptsFor(id, message, traceId) {
    try {
      return (await knowledge.retrieve(id, message)).map(({ file, text }) => ({ file, text }));
    } catch (error) {
      if (!(error instanceof CantEmbed)) throw error;
      log.warn("excerptsFor", "model can't run, no excerpts", { id, reason: error.reason, error: error.cause ?? error, traceId });
      return [];
    }
  }

  async function skillsOf(id, record) {
    return Promise.all((record.skills ?? []).map(async (skill) => ({ name: skill.name, body: await store.readText(id, `skills/${skill.id}/SKILL.md`) })));
  }

  // Each kept skill-file copy until the cap. knowledge.md is not here: it
  // merges the Knowledge files, which reach talk as passages instead. A copy
  // gone missing is logged and left out, never fatal.
  async function filesOf(id, record, traceId) {
    const files = [];
    let total = 0;
    for (const file of (record.files ?? []).filter(feedsTalk)) {
      if (total >= TOTAL_CAP) break;
      const text = await memory.readCopy(id, file.path);
      if (!text) {
        log.warn("filesOf", "copy missing, left out", { id, path: file.path, traceId });
        continue;
      }
      const kept = text.slice(0, Math.min(FILE_CAP, TOTAL_CAP - total));
      files.push({ path: file.path, text: kept });
      total += kept.length;
    }
    return files;
  }

  // Only a created agent talks; a draft gets a plain 400 before any stream.
  async function canTalk(id) {
    const record = await store.loadAgent(id);
    if (record.draft.status !== "saved") throw new BadInput("Create the agent first, then talk to it.");
    return record;
  }

  return {
    canTalk,

    // → { say, used: [{ kind, name }] }. Never resumed: each call gets the
    // newest system prompt, with the earlier talk in the message.
    async talk(id, message, { onSay, signal, traceId } = {}) {
      const record = await canTalk(id);
      const systemPrompt = await store.readText(id, "system-prompt.md");
      const context = await store.readText(id, CONTEXT_FILE);
      const skills = await skillsOf(id, record);
      const files = await filesOf(id, record, traceId);
      const excerpts = await excerptsFor(id, message, traceId);
      const input = {
        message: buildTalkMessage({ message, talk: (record.talk ?? []).slice(-TALK_CONTEXT) }),
        systemPrompt: buildTalkPrompt({ systemPrompt, draft: record.draft, context, skills, files, excerpts }),
      };
      const reply = await askWithBlock(engine, input, "used", { onSay, signal, traceId });
      const used = usedOf(reply.patch, { skills, files, excerpts });
      const latest = await store.loadAgent(id);
      const talk = [...(latest.talk ?? []), { who: "you", text: message }, { who: "agent", text: reply.say, used }].slice(-TALK_KEEP);
      await store.saveDraft(id, { talk });
      return { say: reply.say, used };
    },
  };
}
