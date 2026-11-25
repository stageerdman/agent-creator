#!/bin/sh
# The studio's Start button: build the newest .app, install it into
# Applications, and open the installed copy. Stays running while the app is
# open, so Start/Stop track the app's life. Usage: npm run start:app
set -eu

cd "$(dirname "$0")/.."
DEST="$(npm run --silent build:app | tail -n 1)"
[ -d "$DEST" ] || { echo "start-mac-app: build/install did not produce an app (got: $DEST)" >&2; exit 1; }
echo "Opening $DEST"
open -W "$DEST"
