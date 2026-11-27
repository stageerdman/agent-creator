// The real server with the real engine, only the `claude` CLI swapped for the fake one
// (src/engine/testing/fakeClaude.mjs). For browser checks that must hit the real routes
// (chat → ready, talk → used) without an AI.
// Usage: AGENT_CREATOR_HOME=<scratch folder> PORT=3505 node checks/mock-engine-server.mjs
//
// The fake answers with the user's own words, so a check picks the reply by what it types:
// to Sketcher '{"name":"Tax Helper","ready":true}' becomes the <draft> block (creator-patch);
// to an agent, the words come back as "Echo: <words>" (stream-ok), so markdown and a
// <used>{"files":["knowledge.md"]}</used> block typed in come back as the agent's answer.
// Which one: only the creator's prompt asks for <draft>.
import { askAgent, checkCli } from "../src/engine/index.mjs";
import { fakeSpawn } from "../src/engine/testing/fakeSpawn.mjs";
import { createApp } from "../src/server/app.mjs";

const engine = {
  askAgent: (input, options) => askAgent(input, { ...options, spawn: fakeSpawn(String(input.systemPrompt || "").includes("<draft>") ? "creator-patch" : "stream-ok") }),
  checkCli: () => checkCli({ binary: "claude", spawn: fakeSpawn("version") }),
};
const port = Number(process.env.PORT) || 3505;
createApp(engine).listen(port, () => console.log(`mock-engine server on http://localhost:${port}`));
