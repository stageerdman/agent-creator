// The creator's HTTP surface: thin wrappers over src/creator's use cases.
// A missing agent throws AgentNotFound; the app's error handler makes it a 404.
// Files, sections and texts are in material.mjs.

import { allocations } from "../../creator/index.mjs";
import { readJson, requireMessage, sendJson, streamEvents } from "../http.mjs";

export function agentRoutes(agents) {
  return {
    "POST /api/agents": async (_req, res) => sendJson(res, 200, await agents.create()),
    "GET /api/agents": async (_req, res) => sendJson(res, 200, await agents.list()),
    "GET /api/agents/:id": async (_req, res, { params }) => sendJson(res, 200, await agents.get(params.id)),
    "DELETE /api/agents/:id": async (_req, res, { params }) => {
      await agents.remove(params.id);
      sendJson(res, 200, { deleted: params.id });
    },

    // SSE: delta* → draft { draft, changed } and/or files { files, changed }
    // (each only if something changed), then allocate { file, section } per
    // changed file and section it now goes to ("none" if it feeds nothing) → ready { type, ready: true }
    // only when the creator flags the agent ready (never once kept) → done { say, sessionId, ready } | error.
    "POST /api/agents/:id/chat": async (req, res, { params, traceId }) => {
      const message = requireMessage(await readJson(req));
      await agents.get(params.id); // 404 before the stream opens
      await streamEvents(res, traceId, async ({ send, signal }) => {
        const onSay = (text) => send("delta", { text });
        const turn = await agents.chat(params.id, message, { onSay, signal, traceId });
        if (turn.changed.length) send("draft", { draft: turn.draft, changed: turn.changed });
        if (turn.filesChanged.length) send("files", { files: turn.files, changed: turn.filesChanged });
        for (const allocation of allocations(turn.files, turn.filesChanged)) send("allocate", allocation);
        if (turn.ready) send("ready", { type: "ready", ready: true });
        send("done", { say: turn.say, sessionId: turn.sessionId, ready: turn.ready });
      });
    },

    // Talk to the kept agent itself. SSE: delta* → done { say, used: [{ kind, name }] } | error.
    "POST /api/agents/:id/talk": async (req, res, { params, traceId }) => {
      const message = requireMessage(await readJson(req));
      await agents.canTalk(params.id); // 404 / 400 (not created yet) before the stream opens
      await streamEvents(res, traceId, async ({ send, signal }) => {
        const onSay = (text) => send("delta", { text });
        send("done", await agents.talk(params.id, message, { onSay, signal, traceId }));
      });
    },

    "PUT /api/agents/:id/draft": async (req, res, { params }) =>
      sendJson(res, 200, await agents.edit(params.id, await readJson(req))),

    // The Keep button.
    "POST /api/agents/:id/save": async (_req, res, { params }) => sendJson(res, 200, await agents.keep(params.id)),
  };
}
