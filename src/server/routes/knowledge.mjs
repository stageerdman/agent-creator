// The RAG builder's HTTP surface: the Knowledge sources one by one, and
// Build, which rewrites the one merged knowledge.md. Thin wrappers over
// src/creator/knowledge/knowledgeBuilder.mjs. A source is named by its file
// path in `?path=`.

import { readJson, requireFile, requireQuery, sendJson } from "../http.mjs";
import { embedEvents } from "./embeds.mjs";

export function knowledgeRoutes(agents) {
  return {
    // → { text }: the merged knowledge.md as last built.
    "GET /api/agents/:id/knowledge": async (_req, res, { params }) =>
      sendJson(res, 200, await agents.getKnowledge(params.id)),

    // → { sources: [{ path, name, size, state, text, embed, title, note }] }.
    "GET /api/agents/:id/knowledge/sources": async (_req, res, { params }) =>
      sendJson(res, 200, await agents.listSources(params.id)),

    // { title?, note?, text? } → { source, embeds }; an edited text is embedded again.
    "PATCH /api/agents/:id/knowledge/sources": async (req, res, { params, query, traceId }) => {
      const { title, note, text } = await readJson(req);
      const { source } = await agents.adjustSource(params.id, requireQuery(query, "path"), { title, note, text });
      sendJson(res, 200, { source, embeds: await embedEvents(agents, params.id, traceId) });
    },

    // { file: { path, size, source? } } takes ?path='s place → { sources, dna, embeds }.
    "POST /api/agents/:id/knowledge/sources/swap": async (req, res, { params, query, traceId }) => {
      const path = requireQuery(query, "path");
      const swapped = await agents.swapSource(params.id, path, requireFile(await readJson(req)));
      sendJson(res, 200, { ...swapped, embeds: await embedEvents(agents, params.id, traceId) });
    },

    // Out of Knowledge only; the file stays in the agent → { sources, dna }.
    "DELETE /api/agents/:id/knowledge/sources": async (_req, res, { params, query }) =>
      sendJson(res, 200, await agents.removeSource(params.id, requireQuery(query, "path"))),

    // → { text, built, skipped, embeds, sources, dna }.
    "POST /api/agents/:id/knowledge/build": async (_req, res, { params, traceId }) =>
      sendJson(res, 200, await agents.build(params.id, { traceId })),
  };
}
