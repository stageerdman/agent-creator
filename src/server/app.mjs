// The local app: a tiny router over the engine. The engine is passed in, so
// tests run the real server against the fake CLI.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { BadRequest, sendJson } from "./http.mjs";
import { askRoute } from "./routes/ask.mjs";
import { createLogger, newTraceId } from "../log/logger.mjs";

const log = createLogger("server");
const PUBLIC = new URL("./public/", import.meta.url);

function staticFile(name, contentType) {
  return async (_req, res) => {
    res.writeHead(200, { "content-type": contentType });
    res.end(await readFile(new URL(name, PUBLIC)));
  };
}

export function createApp(engine) {
  const routes = {
    "GET /": staticFile("index.html", "text/html; charset=utf-8"),
    "GET /app.js": staticFile("app.js", "text/javascript; charset=utf-8"),
    "GET /api/health": async (_req, res) => sendJson(res, 200, await engine.checkCli()),
    "POST /api/ask": askRoute(engine),
  };

  return createServer(async (req, res) => {
    const traceId = newTraceId();
    const route = routes[`${req.method} ${new URL(req.url, "http://local").pathname}`];
    if (!route) return sendJson(res, 404, { error: "Not found." });
    try {
      await route(req, res, { traceId });
    } catch (error) {
      handleError(error, req, res, traceId);
    }
  });
}

// The one place request errors are reported.
function handleError(error, req, res, traceId) {
  const badRequest = error instanceof BadRequest;
  if (!badRequest) log.error("request", "unhandled", { traceId, method: req.method, url: req.url, error });
  if (res.headersSent) return res.end();
  sendJson(res, badRequest ? 400 : 500, { error: badRequest ? error.message : "Internal error.", traceId });
}
