#!/bin/sh
# The studio's Start button: build the newest .app, install it into
# Applications, and open the installed copy. Stays running while the app is
# open, so Start/Stop track the app's life. Usage: npm run start:app
#
# The app runs its own server on a port of its choosing (3517 first), so the
# studio's address (PORT) would stay blank. When PORT is set, the same newest
# server also answers there for as long as the app is open.
set -eu

cd "$(dirname "$0")/.."
DEST="$(npm run --silent build:app | tail -n 1)"
[ -d "$DEST" ] || { echo "start-mac-app: build/install did not produce an app (got: $DEST)" >&2; exit 1; }

if [ -n "${PORT:-}" ]; then
  node src/server/main.mjs &
  WEB_PID=$!
  trap 'kill "$WEB_PID" 2>/dev/null || true' EXIT INT TERM
  echo "Serving the web page on http://localhost:$PORT/"
fi

echo "Opening $DEST"
open -W "$DEST"
