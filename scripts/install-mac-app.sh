#!/bin/sh
# Installs dist/Agent Creator.app into /Applications (or ~/Applications when
# /Applications is not writable), replacing the old copy, and registers it
# with Launch Services and Spotlight so it shows up in search right away.
# Prints the installed path on the last line. Usage: npm run install:app
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILT="$ROOT/dist/Agent Creator.app"
LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"

[ -d "$BUILT" ] || { echo "install-mac-app: no build at $BUILT (run npm run build:app)" >&2; exit 1; }

DEST_DIR="/Applications"
if [ ! -w "$DEST_DIR" ]; then
  DEST_DIR="$HOME/Applications"
  mkdir -p "$DEST_DIR"
fi
DEST="$DEST_DIR/Agent Creator.app"

# Copy straight to the final name: Spotlight types a folder by the name it
# first sees, so a copy renamed from "X.app.new" stays a plain folder.
rm -rf "$DEST"
ditto "$BUILT" "$DEST"

"$LSREGISTER" -f "$DEST" || echo "install-mac-app: lsregister failed for $DEST" >&2
mdimport "$DEST" || echo "install-mac-app: mdimport failed for $DEST" >&2

echo "$DEST"
