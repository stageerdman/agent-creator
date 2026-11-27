// The creation screen's HTTP surface: files, the menu's sections and the
// texts the agent is built into. Thin wrappers over src/creator's use cases
// (agentMaterial.mjs, agentTexts.mjs). A section is "system-prompt",
// "knowledge" or "skill:<skillId>" (encode the colon or not, both work).

import { BadRequest, readBytes, readJson, requireFiles, requireQuery, sendJson, streamEvents } from "../http.mjs";
import { embedEvents } from "./embeds.mjs";

export function materialRoutes(agents) {
  return {
    // Dropped or picked files: { files: [{ path, size }] } → { files, added, dna }.
    "POST /api/agents/:id/files": async (req, res, { params }) =>
      sendJson(res, 200, await agents.addFiles(params.id, requireFiles(await readJson(req)))),

    // ?path=notes/a.md → { path, state: "gone" | "removed", dna }.
    "DELETE /api/agents/:id/files": async (_req, res, { params, query }) => {
      const { path, state, dna } = await agents.removeFile(params.id, requireQuery(query, "path"));
      sendJson(res, 200, { path, state, dna });
    },

    // Folders or files on disk, { paths: [absolute] }. SSE: files { files }*
    // as they are found → done { added, total, skipped, dna } | error.
    "POST /api/agents/:id/scan": async (req, res, { params, traceId }) => {
      const paths = requirePaths(await readJson(req));
      await agents.get(params.id); // 404 before the stream opens
      await streamEvents(res, traceId, async ({ send, signal }) => {
        const onFiles = (files) => send("files", { files });
        send("done", await agents.scan(params.id, paths, { onFiles, signal }));
      });
    },

    // A file the page read itself (no path on disk): raw bytes, ?path=notes/a.pdf
    // → { path, text, embeds } with text "ok" or why no .txt copy could be
    // made, and embeds the embedded / embed-failed events (as the chat's).
    "PUT /api/agents/:id/sources": async (req, res, { params, query, traceId }) => {
      const path = requireQuery(query, "path");
      const source = await agents.putSource(params.id, path, await readBytes(req));
      sendJson(res, 200, { ...source, embeds: await embedEvents(agents, params.id, traceId) });
    },

    "GET /api/agents/:id/sections/:section/files": async (_req, res, { params }) =>
      sendJson(res, 200, { files: await agents.sectionFiles(params.id, params.section) }),

    // Dropped onto a section: { files: [{ path, size }] } → { files, changed, dna, embeds },
    // `files` being the section's files after the drop.
    "POST /api/agents/:id/sections/:section/files": async (req, res, { params, traceId }) => {
      const { section, changed, dna } = await agents.assign(params.id, params.section, requireFiles(await readJson(req)));
      sendJson(res, 200, { files: section, changed, dna, embeds: await embedEvents(agents, params.id, traceId) });
    },

    "GET /api/agents/:id/system-prompt": async (_req, res, { params }) =>
      sendJson(res, 200, await agents.getSystemPrompt(params.id)),

    "PUT /api/agents/:id/system-prompt": async (req, res, { params }) =>
      sendJson(res, 200, await agents.setSystemPrompt(params.id, (await readJson(req)).text)),

    "GET /api/agents/:id/skills": async (_req, res, { params }) =>
      sendJson(res, 200, { skills: await agents.listSkills(params.id) }),

    // { name, files?: [{ path, size }] } → the new skill (as GET .../skills/:skillId).
    "POST /api/agents/:id/skills": async (req, res, { params }) => {
      const { name, files } = await readJson(req);
      sendJson(res, 200, await agents.createSkill(params.id, { name, files }));
    },

    "GET /api/agents/:id/skills/:skillId": async (_req, res, { params }) =>
      sendJson(res, 200, await agents.getSkill(params.id, params.skillId)),

    // { name?, body? } → the skill.
    "PUT /api/agents/:id/skills/:skillId": async (req, res, { params }) => {
      const { name, body } = await readJson(req);
      sendJson(res, 200, await agents.editSkill(params.id, params.skillId, { name, body }));
    },
  };
}

function requirePaths({ paths }) {
  const valid = Array.isArray(paths) && paths.length > 0 && paths.every((path) => typeof path === "string" && path.trim());
  if (!valid) throw new BadRequest("`paths` must be a non-empty list of absolute paths.");
  return paths;
}
