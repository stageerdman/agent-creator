// Small HTTP helpers shared by the routes: JSON bodies in, JSON or
// Server-Sent Events out.

const MAX_JSON_BYTES = 1_000_000;
const MAX_UPLOAD_BYTES = 50_000_000;

export class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequest";
  }
}

// The raw request body (an uploaded file), refused past `maxBytes`.
export async function readBytes(req, maxBytes = MAX_UPLOAD_BYTES) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new BadRequest("Request body too large.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function readJson(req) {
  const body = (await readBytes(req, MAX_JSON_BYTES)).toString("utf8");
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

export function requireFiles(body) {
  const { files } = body;
  const valid = Array.isArray(files) && files.length > 0 && files.every((file) => typeof file?.path === "string" && file.path.trim());
  if (!valid) throw new BadRequest("`files` must be a non-empty list of { path, size }.");
  return files;
}

export function requireFile({ file }) {
  if (typeof file?.path !== "string" || !file.path.trim()) throw new BadRequest("`file` must be { path, size }.");
  return file;
}

export function requireQuery(query, name) {
  const value = query.get(name);
  if (!value) throw new BadRequest(`\`?${name}=\` is required.`);
  return value;
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
