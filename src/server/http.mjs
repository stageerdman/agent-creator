// Small HTTP helpers shared by the routes: JSON bodies in, JSON or
// Server-Sent Events out.

const MAX_BODY_BYTES = 1_000_000;

export class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequest";
  }
}

export async function readJson(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > MAX_BODY_BYTES) throw new BadRequest("Request body too large.");
  }
  try {
    return JSON.parse(body || "{}");
  } catch {
    throw new BadRequest("Request body must be JSON.");
  }
}

export function sendJson(res, status, data) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
}

export function requireMessage(body) {
  const { message } = body;
  if (typeof message !== "string" || !message.trim()) throw new BadRequest("`message` must be a non-empty string.");
  return message;
}

function openEventStream(res) {
  res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
  return (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// Runs `work({ send, signal })` behind an SSE stream. Closing the request
// aborts `signal` (which cancels the CLI); a failure becomes one `error`
// event with its kind. The engine already logged it with the traceId.
export async function streamEvents(res, traceId, work) {
  const send = openEventStream(res);
  const controller = new AbortController();
  res.on("close", () => {
    if (!res.writableFinished) controller.abort();
  });
  try {
    await work({ send, signal: controller.signal });
  } catch (error) {
    send("error", { kind: error.kind ?? "internal", message: error.message, traceId });
  }
  res.end();
}
