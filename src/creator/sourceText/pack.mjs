// Fits source copies into one prompt (persona build, capability map): under
// `cap` characters in all, each file gets a fair share, and a short file
// hands what it doesn't use to the others. Pure, so the budget rule is
// tested on its own.

export const SOURCE_CHAR_CAP = 120_000;

// parts: [{ path, text, ...rest }] → { sources: same parts in the given
// order, text shortened to fit, cut: [paths whose text was shortened] }.
export function packSources(parts, cap = SOURCE_CHAR_CAP) {
  const shares = fairShares(parts.map(({ text }) => text.length), cap);
  const cut = [];
  const sources = parts.map((part, at) => {
    if (shares[at] >= part.text.length) return part;
    cut.push(part.path);
    return { ...part, text: part.text.slice(0, shares[at]) };
  });
  return { sources, cut };
}

// Shortest first: each takes what it needs, up to an even split of what is left.
function fairShares(lengths, cap) {
  const shares = new Array(lengths.length);
  const order = lengths.map((length, at) => ({ length, at })).sort((a, b) => a.length - b.length);
  let left = cap;
  order.forEach(({ length, at }, done) => {
    shares[at] = Math.min(length, Math.floor(left / (order.length - done)));
    left -= shares[at];
  });
  return shares;
}
