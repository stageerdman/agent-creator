// End-to-end against the user's real `claude` CLI: the server, the creator
// and the engine, nothing faked. Slow and costs a few cents, so it only runs
// with CLAUDE_LIVE=1 (`npm run test:live`); `npm test` skips it.

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as engine from "../engine/index.mjs";
import { createAgentStore } from "../creator/index.mjs";
import { createApp } from "./app.mjs";
import { parseSse } from "./testing/sse.mjs";

const live = process.env.CLAUDE_LIVE === "1";
const home = await mkdtemp(join(tmpdir(), "agent-creator-live-"));
const server = createApp(engine, { store: createAgentStore({ home }) }).listen(0);
const base = `http://localhost:${server.address().port}`;
after(async () => {
  server.close();
  await rm(home, { recursive: true, force: true });
});

const send = async (method, path, body) =>
  fetch(`${base}${path}`, { method, headers: { "content-type": "application/json" }, body: body && JSON.stringify(body) });
const json = async (...args) => (await send(...args)).json();
async function chat(id, message) {
  const events = parseSse(await (await send("POST", `/api/agents/${id}/chat`, { message })).text());
  const error = events.find((e) => e.event === "error");
  assert.equal(error, undefined, `CLI error: ${JSON.stringify(error?.data)}`);
  const streamed = events.filter((e) => e.event === "delta").map((e) => e.data.text).join("");
  assert.doesNotMatch(streamed, /<\/?draft|"persona"\s*:/, "the draft block leaked into the stream");
  return { events, streamed, done: events.at(-1).data, draftEvent: events.find((e) => e.event === "draft")?.data };
}

test("live: one line makes a full draft, a hand edit survives, the chat resumes", { skip: !live, timeout: 240_000 }, async () => {
  const { id } = await json("POST", "/api/agents");

  const first = await chat(id, "A no-nonsense running coach for beginners.");
  assert.ok(first.draftEvent, "the first message must produce a draft");
  for (const field of ["name", "persona", "instructions"]) assert.ok(first.draftEvent.draft[field].trim(), `${field} is empty`);
  assert.doesNotMatch(first.done.say, /<draft/);
  assert.ok(first.done.sessionId);

  const persona = "You are Coach Pat: warm, patient, and you always end with one small next step.";
  await json("PUT", `/api/agents/${id}/draft`, { persona });

  await chat(id, "Also have it cover what to eat before a run.");
  const saved = await json("GET", `/api/agents/${id}`);
  assert.equal(saved.draft.persona, persona, "the creator overwrote a hand edit without asking");
  assert.ok(saved.sessionId);

  const third = await chat(id, "In five words or fewer: what did I say the coach is for?");
  assert.match(third.done.say, /run/i, "the resumed session lost the earlier turns");
});
