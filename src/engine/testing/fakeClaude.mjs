// A stand-in for the `claude` CLI in tests: `node fakeClaude.mjs <scenario> ...cliArgs`.
// It prints the same NDJSON / JSON shapes the real CLI does (recorded
// shapes, see the AI-ENGINE wiki) and echoes the message so tests can see
// the args arrived intact.

const [scenario, ...args] = process.argv.slice(2);
const message = args.at(-1);
const out = (event) => process.stdout.write(JSON.stringify(event) + "\n");
const delta = (text) => ({ type: "stream_event", event: { type: "content_block_delta", delta: { type: "text_delta", text } } });
const result = (text, extra = {}) => ({
  type: "result", result: text, session_id: "sess-1", is_error: false,
  usage: { input_tokens: 3, cache_creation_input_tokens: 0, cache_read_input_tokens: 10, output_tokens: 2 },
  modelUsage: { "claude-test": { contextWindow: 200000 } },
  ...extra,
});

const scenarios = {
  "stream-ok": () => {
    out({ type: "system", subtype: "init" });
    out(delta("Echo: "));
    out(delta(message));
    out(result(`Echo: ${message}`));
  },
  "stream-fail": () => {
    process.stderr.write("Not logged in\n");
    process.exitCode = 1;
  },
  "stream-is-error": () => out(result("Credit balance too low", { is_error: true })),
  "stream-no-result": () => out(delta("partial")),
  // The creator replying with a draft block whose body is the message, so
  // a test picks the patch by what it sends. The tag is split across deltas.
  "creator-patch": () => {
    const block = `<draft>${message}</draft>`;
    out(delta("Here's a first sketch. <dr"));
    out(delta(block.slice(3)));
    out(result(`Here's a first sketch. ${block}`));
  },
  "once-ok":() => out(result(`Echo: ${message}`)),
  "once-bad-json": () => process.stdout.write("not json\n"),
  "version": () => process.stdout.write("9.9.9 (Claude Code)\n"),
  // Streams one delta then never finishes, so only a cancel ends it.
  "hang": () => {
    out(delta("thinking"));
    setInterval(() => {}, 1000);
  },
};

scenarios[scenario]();
