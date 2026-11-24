// POST /api/ask  { message, sessionId? }  →  SSE: delta* then done | error.
// The browser's counterpart of masters-wheel's invoke("ask_agent") +
// listen("ask-agent-progress"): one stream per request, so no jobId filter
// is needed. Closing the request cancels the CLI.

import { readJson, requireMessage, streamEvents } from "../http.mjs";

export function askRoute(engine) {
  return async (req, res, { traceId }) => {
    const body = await readJson(req);
    const message = requireMessage(body);
    const resumeSessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;

    await streamEvents(res, traceId, async ({ send, signal }) => {
      const reply = await engine.askAgent(
        { message, resumeSessionId },
        { onDelta: (text) => send("delta", { text }), signal, traceId },
      );
      send("done", reply);
    });
  };
}
