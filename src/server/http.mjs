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

export function openEventStream(res) {
  res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
  return (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}
