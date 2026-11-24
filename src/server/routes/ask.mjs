// POST /api/ask  { message, sessionId? }  →  SSE: delta* then done | error.
// The browser's counterpart of masters-wheel's invoke("ask_agent") +
// listen("ask-agent-progress"): one stream per request, so no jobId filter
// is needed. Closing the request cancels the CLI.

import { BadRequest, openEventStream, readJson } from "../http.mjs";

export function askRoute(engine) {
  return async (req, res, { traceId }) => {
    const { message, sessionId } = await readJson(req);
    if (typeof message !== "string" || !message.trim()) throw new BadRequest("`message` must be a non-empty string.");

    const send = openEventStream(res);
    const controller = new AbortController();
    res.on("close", () => {
      if (!res.writableFinished) controller.abort();
    });

    try {
      const reply = await engine.askAgent(
        { message, resumeSessionId: typeof sessionId === "string" ? sessionId : undefined },
        { onDelta: (text) => send("delta", { text }), signal: controller.signal, traceId },
      );
      send("done", reply);
    } catch (error) {
      // The engine already logged it with the traceId; the client just
      // needs to know what kind of failure it was.
      send("error", { kind: error.kind ?? "internal", message: error.message, traceId });
    }
    res.end();
  };
}
