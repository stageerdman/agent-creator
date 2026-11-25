// Read-only mock routes for the clickable prototype (blocks-jony.md §6, C14).
// The browser fetches the demo set once and plays it locally; nothing here
// writes, and nothing here touches the real agent store or the CLI.

import { sendJson } from "../http.mjs";
import { demo, demoAgents, imports } from "../mock/demoAgents.mjs";

const clone = (value) => structuredClone(value);

// Illustrated faces (invented people, no photos): a portrait or a quick icon,
// drawn from the name so each one is stable.
const PALETTES = [
  ["#E8D5C4", "#7A4E3A", "#2F3B52"], ["#D9E3EA", "#3E2C23", "#5B7A63"], ["#F1E0D0", "#A0522D", "#8E7AA8"],
  ["#E4E0EE", "#2B2B2B", "#B9877A"], ["#DDE8D8", "#6B4A2E", "#7A8CA8"], ["#F0E4C8", "#4A3426", "#C0574A"],
];

function hash(text) {
  let h = 7;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function faceSvg(name) {
  const h = hash(name);
  const [bg, hair, shirt] = PALETTES[h % PALETTES.length];
  const skin = ["#F2C9A8", "#D9A27E", "#B97F5A", "#8D5B3E", "#F5D3B8"][(h >> 3) % 5];
  if (name.includes("icon")) {
    // A quick sketch of a face: simple shapes on a tint.
    const eye = 4 + ((h >> 5) % 3);
    const mouth = ["M38 66 Q50 74 62 66", "M40 68 L60 68", "M38 64 Q50 70 62 64"][(h >> 7) % 3];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}"/>`
      + `<circle cx="50" cy="52" r="30" fill="${skin}"/><path d="M20 46 Q50 ${8 + (h % 14)} 80 46 Q70 30 50 28 Q30 30 20 46Z" fill="${hair}"/>`
      + `<circle cx="39" cy="52" r="${eye}" fill="#222"/><circle cx="61" cy="52" r="${eye}" fill="#222"/>`
      + `<path d="${mouth}" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
  }
  // An illustrated portrait: head, hair, shoulders.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}"/>`
    + `<path d="M14 100 Q16 74 50 72 Q84 74 86 100Z" fill="${shirt}"/><rect x="43" y="58" width="14" height="16" fill="${skin}"/>`
    + `<ellipse cx="50" cy="44" rx="19" ry="23" fill="${skin}"/>`
    + `<path d="M30 42 Q30 16 52 18 Q72 20 70 44 Q66 30 50 30 Q38 30 30 42Z" fill="${hair}"/>`
    + `<circle cx="43" cy="46" r="2.2" fill="#2a2a2a"/><circle cx="57" cy="46" r="2.2" fill="#2a2a2a"/>`
    + `<path d="M44 57 Q50 61 56 57" stroke="#7a3b2e" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
}

export function mockRoutes() {
  return {
    "GET /mock/demo": async (_req, res) => sendJson(res, 200, clone(demo)),
    "GET /mock/agents": async (_req, res) => sendJson(res, 200, clone(demoAgents)),
    "GET /mock/agents/:id": async (_req, res, { params }) => {
      const agent = demoAgents.find((a) => a.id === params.id);
      if (!agent) return sendJson(res, 404, { error: "No such demo agent." });
      sendJson(res, 200, clone(agent));
    },
    "GET /mock/imports": async (_req, res) => sendJson(res, 200, Object.keys(imports)),
    "GET /mock/imports/:file": async (_req, res, { params }) => {
      const file = imports[decodeURIComponent(params.file)];
      if (!file) return sendJson(res, 404, { error: "No such demo file." });
      sendJson(res, 200, clone(file));
    },
    "GET /mock/faces/:name": async (_req, res, { params }) => {
      const name = decodeURIComponent(params.name);
      if (!/^[a-z0-9-]+\.svg$/.test(name)) return sendJson(res, 404, { error: "No such face." });
      res.writeHead(200, { "content-type": "image/svg+xml", "cache-control": "max-age=3600" });
      res.end(faceSvg(name));
    },
  };
}
