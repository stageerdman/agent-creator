// The local app: a tiny router over the engine and the creator. Both are
// passed in, so tests run the real server against the fake CLI and a temp
// agent store.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { BadRequest, sendJson } from "./http.mjs";
import { matchRoute } from "./router.mjs";
import { agentRoutes } from "./routes/agents.mjs";
import { askRoute } from "./routes/ask.mjs";
import { capabilityRoutes } from "./routes/capabilities.mjs";
import { qualityRoutes } from "./routes/quality.mjs";
import { knowledgeRoutes } from "./routes/knowledge.mjs";
import { materialRoutes } from "./routes/material.mjs";
import { mockRoutes } from "./routes/mock.mjs";
import { personaRoutes } from "./routes/persona.mjs";
import { createAgents, createAgentStore } from "../creator/index.mjs";
import { summary } from "../creator/agents.mjs";
import { homeAgents } from "./mock/demoAgents.mjs";
import { createLogger, newTraceId } from "../log/logger.mjs";

const log = createLogger("server");
const PUBLIC = new URL("./public/", import.meta.url);
// Every script the page imports; a module missing here 404s and the page stays blank.
const PAGE_MODULES = ["agent-list", "firefly-gather", "firefly-orbit", "fireflies-dna", "file-intake", "creation-screen", "left-side", "markdown", "agent-page"];

function staticFile(name, contentType) {
  return async (_req, res) => {
    res.writeHead(200, { "content-type": contentType });
    res.end(await readFile(new URL(name, PUBLIC)));
  };
}

// `embedder` defaults to the local model (agents.mjs); tests pass a fake.
export function createApp(engine, { store = createAgentStore(), embedder } = {}) {
  const agents = createAgents({ store, engine, embedder });
  const routes = {
    "GET /": staticFile("agent-home.html", "text/html; charset=utf-8"),
    "GET /new": staticFile("new-agent.html", "text/html; charset=utf-8"),
    // A home row opens here: the agent's own page on the Fireflies background.
    "GET /agents/:id": staticFile("agent-page.html", "text/html; charset=utf-8"),
    // The home's mock sets (0, 1, 10, 50), in the real /api/agents shape: `/?demo=50`.
    // The one screen background every page links first (Reports/launch-and-glass.md).
    "GET /app-background.css": staticFile("app-background.css", "text/css; charset=utf-8"),
    "GET /mock/home/:count": async (_req, res, { params }) => sendJson(res, 200, homeAgents(params.count).map(summary)),
    ...Object.fromEntries(PAGE_MODULES
      .map((name) => [`GET /${name}.js`, staticFile(`${name}.js`, "text/javascript; charset=utf-8")])),
    ...mockRoutes(),
    "GET /api/health": async (_req, res) => sendJson(res, 200, await engine.checkCli()),
    "POST /api/ask": askRoute(engine),
    ...agentRoutes(agents),
    ...materialRoutes(agents),
    ...knowledgeRoutes(agents),
    ...personaRoutes(agents),
    ...capabilityRoutes(agents),
    ...qualityRoutes(agents),
  };

  return createServer(async (req, res) => {
    const traceId = newTraceId();
    const url = new URL(req.url, "http://local");
    const match = matchRoute(routes, req.method, url.pathname);
    if (!match) return sendJson(res, 404, { error: "Not found." });
    try {
      await match.handler(req, res, { traceId, params: match.params, query: url.searchParams });
    } catch (error) {
      handleError(error, req, res, traceId);
    }
  });
}

// The one place request errors are reported.
function handleError(error, req, res, traceId) {
  const status = error instanceof BadRequest || error.kind === "bad-input" ? 400 : error.kind === "not-found" ? 404 : 500;
  if (status === 500) log.error("request", "unhandled", { traceId, method: req.method, url: req.url, error });
  if (res.headersSent) return res.end();
  sendJson(res, status, { error: status === 500 ? "Internal error." : error.message, traceId });
}
