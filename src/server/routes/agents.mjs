// The creator's HTTP surface: thin wrappers over src/creator's use cases.
// A missing agent throws AgentNotFound; the app's error handler makes it a 404.
// Files, sections and texts are in material.mjs.

import { allocations } from "../../creator/index.mjs";
import { readJson, requireMessage, sendJson, streamEvents } from "../http.mjs";
import { embedEvents } from "./embeds.mjs";

export function agentRoutes(agents) {
  return {
    "POST /api/agents": async (_req, res) => sendJson(res, 200, await agents.create()),
    "GET /api/agents": async (_req, res) => sendJson(res, 200, await agents.list()),
    "GET /api/agents/:id": async (_req, res, { params }) => sendJson(res, 200, await agents.get(params.id)),
    "DELETE /api/agents/:id": async (_req, res, { params }) => {
      await agents.remove(params.id);
      sendJson(res, 200, { deleted: params.id });
    },

    // A message sent while a turn is thinking waits in line, CLI-style: its
    // stream opens with queued {} and runs once the turn before it is over.
    // SSE: queued {}? → delta* → found { files }* per batch of a path read in from the chat →
    // draft { draft, changed } and/or files { files, changed }
    // (each only if something changed or came in) → intake { added, skipped,
    // rules: [{ to, picked, only }] } once when paths or rules were asked, then allocate { file, section } per
    // changed file and section it now goes to ("none" if it feeds nothing) → embedded { file } or
    // embed-failed { file, reason } per Knowledge file newly searchable or not → ready { type, ready: true }
    // only when the creator flags the agent ready (never once kept) → done { say, sessionId, ready } | error.
    // A stopped turn (running or waiting) ends with error { kind: "cancelled" } and saves nothing.
    "POST /api/agents/:id/chat": async (req, res, { params, traceId }) => {
      const message = requireMessage(await readJson(req));
      await agents.get(params.id); // 404 before the stream opens
      await streamEvents(res, traceId, async ({ send, signal }) => {
        const onQueued = () => send("queued", {});
        const onSay = (text) => send("delta", { text });
        const onFiles = (files) => send("found", { files });
        const turn = await agents.chat(params.id, message, { onQueued, onSay, onFiles, signal, traceId });
        if (turn.changed.length) send("draft", { draft: turn.draft, changed: turn.changed });
        if (turn.filesChanged.length || turn.intake?.added) send("files", { files: turn.files, changed: turn.filesChanged });
        if (turn.intake) send("intake", turn.intake);
        for (const allocation of allocations(turn.files, turn.filesChanged)) send("allocate", allocation);
        if (turn.filesChanged.length) for (const event of await embedEvents(agents, params.id, traceId)) send(event.type, event);
        if (turn.ready) send("ready", { type: "ready", ready: true });
        send("done", { say: turn.say, sessionId: turn.sessionId, ready: turn.ready });
      });
    },

    // Esc: stops the creator's running turn and any waiting behind it. → { stopped: count }.
    "POST /api/agents/:id/stop": async (_req, res, { params, traceId }) => {
      await agents.get(params.id);
      sendJson(res, 200, agents.stop(params.id, { traceId }));
    },

    // Talk to the kept agent itself. SSE: delta* → done { say, used: [{ kind, name }], sources: [{ file, passage }] } | error.
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
