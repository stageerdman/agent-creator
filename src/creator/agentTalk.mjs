// G4/F14: talking to a created agent over its DNA. The agent's prompt is
// made from what it is built into: its system prompt (or persona and
// instructions), its knowledge text and its skills' bodies. No RAG yet (A11
// plan): the knowledge text goes in whole. The answer may end with one
// `<used>["Skill name", "Knowledge"]</used>` block; it never shows, and only
// names the agent really has reach the page.

import { createHash } from "node:crypto";
import { splitReply, streamFilter } from "./creatorReply.mjs";
import { BadInput } from "./errors.mjs";

export const TALK_KEEP = 200;
const KNOWLEDGE = "Knowledge";

export function buildTalkPrompt({ draft, systemPrompt = "", knowledge = "", skills = [] }) {
  const own = systemPrompt.trim() || [draft.persona, draft.instructions].map((t) => (t ?? "").trim()).filter(Boolean).join("\n\n");
  const parts = [own || `You are ${draft.name || "a helpful agent"}.`];
  if (knowledge.trim()) parts.push(`<knowledge>\n${knowledge.trim()}\n</knowledge>`);
  for (const skill of skills) parts.push(`<skill name=${JSON.stringify(skill.name)}>\n${skill.body.trim()}\n</skill>`);
  if (knowledge.trim() || skills.length) {
    const names = [...skills.map((s) => s.name), ...(knowledge.trim() ? [KNOWLEDGE] : [])];
    parts.push(`If your answer draws on the knowledge or a skill above, end with one line <used>${JSON.stringify(names)}</used> listing only the ones you drew on, from: ${names.join(", ")}. Never mention this line.`);
  }
  return parts.join("\n\n");
}

// → [{ name, kind }]: the names the answer gave that the agent really has.
export function usedOf(raw, { skills = [], knowledge = "" }) {
  const match = /<used>([\s\S]*?)<\/used>/.exec(raw ?? "");
  if (!match) return [];
  let names;
  try { names = JSON.parse(match[1]); } catch { return []; }
  if (!Array.isArray(names)) return [];
  const used = [];
  for (const name of new Set(names.filter((n) => typeof n === "string"))) {
    if (skills.some((s) => s.name === name)) used.push({ name, kind: "skill" });
    else if (name === KNOWLEDGE && knowledge.trim()) used.push({ name, kind: "knowledge" });
  }
  return used;
}

const stripUsed = (text) => splitReply(text.replace(/<used>/g, "<draft>").replace(/<\/used>/g, "</draft>")).say;
const hash = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);

export function createTalk({ store, engine }) {
  async function canTalk(id) {
    const record = await store.loadAgent(id);
    if (record.draft.status !== "saved") throw new BadInput("Create the agent first, then talk to it.");
    return record;
  }

  return {
    canTalk,

    // One turn. A changed prompt (the agent was edited) starts a new session,
    // because a resumed session keeps its first system prompt.
    async talk(id, message, { onSay = () => {}, signal, traceId } = {}) {
      const record = await canTalk(id);
      const [systemPrompt, knowledge] = await Promise.all([store.readText(id, "system-prompt.md"), store.readText(id, "knowledge.md")]);
      const skills = await Promise.all((record.skills ?? []).map(async (s) => ({ name: s.name, body: await store.readText(id, `skills/${s.id}/SKILL.md`) })));
      const prompt = buildTalkPrompt({ draft: record.draft, systemPrompt, knowledge, skills });
      const key = hash(prompt);
      const resume = record.talkSession?.prompt === key ? record.talkSession.id : undefined;

      const filter = streamFilter("used");
      const emit = (text) => text && onSay(text);
      const reply = await engine.askAgent(
        { message, systemPrompt: prompt, resumeSessionId: resume },
        { onDelta: (text) => emit(filter.push(text)), signal, traceId },
      );
      emit(filter.flush());
      const say = stripUsed(reply.text);
      const used = usedOf(reply.text, { skills, knowledge });

      const latest = await store.loadAgent(id);
      const talk = [...(latest.talk ?? []), { who: "you", text: message }, { who: "agent", text: say, used }].slice(-TALK_KEEP);
      await store.saveDraft(id, { talk, talkSession: { id: reply.sessionId, prompt: key } });
      return { say, used };
    },
  };
}
