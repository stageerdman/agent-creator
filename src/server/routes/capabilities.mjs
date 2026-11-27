// The capability map's HTTP surface: build what the agent will be good at,
// medium at and not trained for, and read the saved map back. Thin wrappers
// over src/creator/capability/capabilityBuilder.mjs.

import { sendJson, streamEvents } from "../http.mjs";

export function capabilityRoutes(agents) {
  return {
    // SSE: delta { text }* → done { say, map, stale, used, cut, skipped }
    // | error { kind } ("bad-input" when no source has text, "bad-output" when the reply had no block).
    "POST /api/agents/:id/capabilities/build": async (_req, res, { params, traceId }) => {
      await agents.get(params.id); // 404 before the stream opens
      await streamEvents(res, traceId, async ({ send, signal }) => {
        const onSay = (text) => send("delta", { text });
        send("done", await agents.buildCapabilities(params.id, { onSay, signal, traceId }));
      });
    },

    // → { map | null, stale }: stale once the sources changed since the build.
    "GET /api/agents/:id/capabilities": async (_req, res, { params }) =>
      sendJson(res, 200, await agents.getCapabilities(params.id)),
  };
}
