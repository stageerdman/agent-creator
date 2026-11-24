// Browser side: send a prompt, render the streamed answer live, keep the
// CLI session id so the next message continues the same conversation.

const status = document.getElementById("status");
const chat = document.getElementById("chat");
const form = document.getElementById("ask");
const input = document.getElementById("message");
const send = document.getElementById("send");
let sessionId;

function bubble(className, text = "") {
  const element = document.createElement("div");
  element.className = `msg ${className}`;
  element.textContent = text;
  chat.append(element);
  element.scrollIntoView({ block: "end" });
  return element;
}

// Reads `event: x\ndata: {...}\n\n` blocks off a fetch body.
async function* serverEvents(response) {
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += value;
    let end;
    while ((end = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const event = block.match(/^event: (.*)$/m)?.[1];
      const data = block.match(/^data: (.*)$/m)?.[1];
      if (event && data) yield { event, data: JSON.parse(data) };
    }
  }
}

async function ask(message) {
  bubble("user", message);
  const answer = bubble("ai");
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });
  if (!response.ok) {
    answer.classList.add("error");
    answer.textContent = (await response.json()).error;
    return;
  }
  for await (const { event, data } of serverEvents(response)) {
    if (event === "delta") answer.textContent += data.text;
    if (event === "done") {
      answer.textContent = data.text; // the result is the truth, not the summed deltas
      sessionId = data.sessionId;
    }
    if (event === "error") {
      answer.classList.add("error");
      answer.textContent = data.message;
    }
    answer.scrollIntoView({ block: "end" });
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  input.value = "";
  send.disabled = true;
  try {
    await ask(message);
  } catch (error) {
    bubble("ai error", `Couldn't reach the app: ${error.message}`);
  } finally {
    send.disabled = false;
    input.focus();
  }
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

const health = await fetch("/api/health").then((r) => r.json());
status.textContent = health.installed
  ? `Using your local Claude Code CLI ${health.version} — replies run in the background on your own login.`
  : "Claude Code CLI not found. Install it and log in (`claude`), then reload.";
status.classList.toggle("bad", !health.installed);
