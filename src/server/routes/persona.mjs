// Persona generation's HTTP surface: write the agent from its System prompt
// sources, and read the background (context.md) that build wrote. Thin
// wrappers over src/creator/persona/personaBuilder.mjs.

import { sendJson, streamEvents } from "../http.mjs";

export function personaRoutes(agents) {
  return {
    // SSE: delta { text }* → done { say, draft, changed, kept, context, used, cut, skipped, dna }
    // | error { kind } ("bad-input" when no source has text, "bad-output" when the reply had no block).
    "POST /api/agents/:id/persona/build": async (_req, res, { params, traceId }) => {
      await agents.get(params.id); // 404 before the stream opens
      await streamEvents(res, traceId, async ({ send, signal }) => {
        const onSay = (text) => send("delta", { text });
        send("done", await agents.buildPersona(params.id, { onSay, signal, traceId }));
      });
    },

    // → { text }: "" until a build wrote one.
    "GET /api/agents/:id/context": async (_req, res, { params }) =>
      sendJson(res, 200, await agents.getContext(params.id)),
  };
}
