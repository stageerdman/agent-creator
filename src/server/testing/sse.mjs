// Parses a finished SSE body into [{ event, data }] for route tests.
export function parseSse(text) {
  return text.trim().split("\n\n").map((block) => ({
    event: block.match(/^event: (.*)$/m)[1],
    data: JSON.parse(block.match(/^data: (.*)$/m)[1]),
  }));
}
