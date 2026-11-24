// Entry point for `npm start` (the studio's Start button): the real engine, on PORT.
import * as engine from "../engine/index.mjs";
import { createApp } from "./app.mjs";
import { createLogger } from "../log/logger.mjs";

const log = createLogger("server");
const port = Number(process.env.PORT) || 3000;

createApp(engine).listen(port, () => log.info("main", "listening", { url: `http://localhost:${port}` }));
