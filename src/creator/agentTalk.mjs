// Talking to a kept agent (G4): the agent itself answers, from its system
// prompt, skill bodies, knowledge and readable files (talkPrompt.mjs). The
// talk is kept in the record; it never changes the draft or the files.

import { askWithBlock } from "./askWithBlock.mjs";
import { buildTalkMessage, buildTalkPrompt, usedOf } from "./talkPrompt.mjs";
import { createLogger } from "../log/logger.mjs";
import { BadInput } from "./errors.mjs";

const log = createLogger("agentTalk");
export const TALK_KEEP = 200;
const TALK_CONTEXT = 40; // earlier lines the agent sees again
const FILE_CAP = 100_000; // characters per file
const TOTAL_CAP = 400_000; // characters over all files

const feedsTalk = (file) => !file.removed && file.text === "ok" && file.feeds.some((feed) => feed === "rag" || feed.startsWith("skill:"));

// `memory` (sourceText/memory.mjs) holds the files' plain-text copies:
// talk reads those, never the originals.
export function createTalk({ store, engine, memory }) {
  async function skillsOf(id, record) {
    return Promise.all((record.skills ?? []).map(async (skill) => ({ name: skill.name, body: await store.readText(id, `skills/${skill.id}/SKILL.md`) })));
  }

  // The built knowledge.md first, then each kept copy until the cap. A copy
  // gone missing is logged and left out, never fatal.
  async function filesOf(id, record, traceId) {
    const files = [{ path: "knowledge.md", text: await store.readText(id, "knowledge.md") }];
    let total = files[0].text.length;
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
      const skills = await skillsOf(id, record);
      const files = await filesOf(id, record, traceId);
      const input = {
        message: buildTalkMessage({ message, talk: (record.talk ?? []).slice(-TALK_CONTEXT) }),
        systemPrompt: buildTalkPrompt({ systemPrompt, draft: record.draft, skills, files }),
      };
      const reply = await askWithBlock(engine, input, "used", { onSay, signal, traceId });
      const used = usedOf(reply.patch, { skills, files });
      const latest = await store.loadAgent(id);
      const talk = [...(latest.talk ?? []), { who: "you", text: message }, { who: "agent", text: reply.say, used }].slice(-TALK_KEEP);
      await store.saveDraft(id, { talk });
      return { say: reply.say, used };
    },
  };
}
