// Matches "METHOD /path" against route keys like "GET /api/agents/:id".
// Returns { handler, params } or null. Params arrive decoded ("skill%3Aab" →
// "skill:ab"); a part that isn't valid percent-encoding matches nothing.
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
    if (!part.startsWith(":")) {
      if (part !== parts[i]) return null;
      continue;
    }
    const value = decoded(parts[i]);
    if (value === null) return null;
    params[part.slice(1)] = value;
  }
  return params;
}

function decoded(part) {
  try {
    return decodeURIComponent(part);
  } catch {
    return null;
  }
}
