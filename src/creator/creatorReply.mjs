// The creator answers in plain chat text and may add one
// `<draft>{…changed fields…}</draft>` block. These two functions keep that
// block out of what the user sees: `splitReply` for the final text (the
// truth, pitfall 8), `streamFilter` for the live deltas.

const OPEN = "<draft>";
const CLOSE = "</draft>";

// → { say, patch | null }. The last block wins; a broken block gives no patch
// but the chat text still shows. An unclosed block hides the rest of the
// text, exactly as the stream filter did.
export function splitReply(text) {
  const blocks = [];
  let say = "";
  let rest = text;
  for (let start = rest.indexOf(OPEN); start !== -1; start = rest.indexOf(OPEN)) {
    say += rest.slice(0, start);
    const end = rest.indexOf(CLOSE, start);
    if (end === -1) {
      rest = "";
      break;
    }
    blocks.push(rest.slice(start + OPEN.length, end));
    rest = rest.slice(end + CLOSE.length);
  }
  say += rest;
  return { say: say.trim(), patch: blocks.length ? parsePatch(blocks.at(-1)) : null };
}

function parsePatch(body) {
  // Models sometimes fence JSON even when told not to.
  const json = body.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const value = JSON.parse(json);
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

// Stateful filter for streamed deltas: `push(delta)` returns the text that
// is safe to show now; `flush()` returns what was held back at the end.
// A tag split across deltas (`<dr` + `aft>`) is held until it's decided.
// `tag` picks the block to hide ("draft" by default; the talk hides "used").
export function streamFilter(tag = "draft") {
  const OPEN = `<${tag}>`;
  const CLOSE = `</${tag}>`;
  let held = "";
  let inside = false;

  const push = (delta) => {
    held += delta;
    let out = "";
    for (;;) {
      const next = inside ? CLOSE : OPEN;
      const at = held.indexOf(next);
      if (at !== -1) {
        if (!inside) out += held.slice(0, at);
        held = held.slice(at + next.length);
        inside = !inside;
        continue;
      }
      const keep = partialTagLength(held, next);
      if (!inside) out += held.slice(0, held.length - keep);
      held = held.slice(held.length - keep);
      return out;
    }
  };

  const flush = () => {
    const out = inside ? "" : held;
    held = "";
    return out;
  };

  return { push, flush };
}

// Length of the longest end of `text` that could be the start of `tag`.
function partialTagLength(text, tag) {
  for (let n = Math.min(tag.length - 1, text.length); n > 0; n--) {
    if (tag.startsWith(text.slice(-n))) return n;
  }
  return 0;
}
