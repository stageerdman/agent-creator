// Entry point for `npm start` (the studio's Start button): the real engine, on PORT.
import * as engine from "../engine/index.mjs";
import { createApp } from "./app.mjs";
import { createLogger } from "../log/logger.mjs";

const log = createLogger("server");
const port = Number(process.env.PORT) || 3000;

// Inside the Mac app the shell owns the server through a stdin pipe: when the
// shell goes away, even by a crash, the pipe closes and the server goes too.
if (process.env.AGENT_CREATOR_EXIT_WITH_STDIN) {
  process.stdin.on("end", () => {
    log.info("main", "shell gone, stopping");
    process.exit(0);
  }).resume();
}

createApp(engine).listen(port, () => log.info("main", "listening", { url: `http://localhost:${port}` }));
