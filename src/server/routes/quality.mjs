// Knowledge quality's HTTP surface: score each file's structure and usefulness
// for this agent plus how well the persona captures its sources, and read the
// saved report back. Thin wrappers over src/creator/quality/qualityBuilder.mjs.

import { sendJson, streamEvents } from "../http.mjs";

export function qualityRoutes(agents) {
  return {
    // SSE: progress { done, total }* → done { report }
    // | error { kind } ("bad-input" when no source has text, "bad-output" when no call was usable).
    "POST /api/agents/:id/quality/build": async (_req, res, { params, traceId }) => {
      await agents.get(params.id); // 404 before the stream opens
      await streamEvents(res, traceId, async ({ send, signal }) => {
        const onProgress = (step) => send("progress", step);
        send("done", { report: await agents.buildQuality(params.id, { onProgress, signal, traceId }) });
      });
    },

    // → the report { files, persona, progress, stale, builtAt }; never calls the AI.
    "GET /api/agents/:id/quality": async (_req, res, { params }) =>
      sendJson(res, 200, await agents.getQuality(params.id)),
  };
}
