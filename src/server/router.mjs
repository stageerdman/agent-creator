// Matches "METHOD /path" against route keys like "GET /api/agents/:id".
// Returns { handler, params } or null.
export function matchRoute(routes, method, pathname) {
  const parts = pathname.split("/");
  for (const [key, handler] of Object.entries(routes)) {
    const [routeMethod, pattern] = key.split(" ");
    const params = routeMethod === method && matchPath(pattern.split("/"), parts);
    if (params) return { handler, params };
  }
  return null;
}

function matchPath(patternParts, parts) {
  if (patternParts.length !== parts.length) return null;
  const params = {};
  for (const [i, part] of patternParts.entries()) {
    if (part.startsWith(":")) params[part.slice(1)] = parts[i];
    else if (part !== parts[i]) return null;
  }
  return params;
}
