#!/bin/sh
# Builds dist/Agent Creator.app: a tiny macOS app that starts the local
# server and opens the app window. Each build replaces the old .app.
# Usage: npm run build:app
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/dist/Agent Creator.app"
NODE_AT_BUILD="$(command -v node || true)"

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources/app"

# The app's code: src/ and package.json (zero dependencies, no node_modules).
cp -R "$ROOT/src" "$APP/Contents/Resources/app/src"
cp "$ROOT/package.json" "$APP/Contents/Resources/app/package.json"
find "$APP/Contents/Resources/app/src" -name "*.test.mjs" -delete

cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Agent Creator</string>
  <key>CFBundleDisplayName</key><string>Agent Creator</string>
  <key>CFBundleIdentifier</key><string>app.agent-creator.prototype</string>
  <key>CFBundleVersion</key><string>0.1.0</string>
  <key>CFBundleShortVersionString</key><string>0.1.0</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleExecutable</key><string>launcher</string>
  <key>LSMinimumSystemVersion</key><string>12.0</string>
  <key>NSHighResolutionCapable</key><true/>
</dict>
</plist>
PLIST

cat > "$APP/Contents/MacOS/launcher" <<LAUNCHER
#!/bin/sh
# Agent Creator launcher: start the local server, open the window, stop the
# server when the window (or the app) quits. Data lives in ~/.agent-creator.
HERE="\$(cd "\$(dirname "\$0")/../Resources/app" && pwd)"
DATA="\${AGENT_CREATOR_HOME:-\$HOME/.agent-creator}"
mkdir -p "\$DATA"
LOG="\$DATA/app.log"
PORT="\${AGENT_CREATOR_PORT:-3517}"
URL="http://localhost:\$PORT/"
export PATH="/opt/homebrew/bin:/usr/local/bin:\$HOME/.local/bin:\$PATH"

NODE="$NODE_AT_BUILD"
[ -x "\$NODE" ] || NODE="\$(command -v node || true)"
if [ -z "\$NODE" ]; then
  osascript -e 'display alert "Agent Creator needs Node.js" message "Install Node 22 or newer, then open Agent Creator again."'
  exit 1
fi

SERVER=""
if ! curl -fsS "\${URL}api/health" >/dev/null 2>&1; then
  cd "\$HERE"
  PORT="\$PORT" "\$NODE" src/server/main.mjs >>"\$LOG" 2>&1 &
  SERVER=\$!
  trap 'kill \$SERVER 2>/dev/null' EXIT INT TERM
  i=0
  until curl -fsS "\${URL}api/health" >/dev/null 2>&1; do
    i=\$((i + 1))
    if [ \$i -gt 100 ]; then
      osascript -e 'display alert "Agent Creator could not start" message "See ~/.agent-creator/app.log."'
      exit 1
    fi
    sleep 0.1
  done
fi

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ -x "\$CHROME" ]; then
  # An app window of its own; the launcher lives as long as the window.
  "\$CHROME" --app="\$URL" --user-data-dir="\$DATA/window" --no-first-run --no-default-browser-check >>"\$LOG" 2>&1
else
  open "\$URL"
  [ -n "\$SERVER" ] && wait \$SERVER
fi
LAUNCHER
chmod +x "$APP/Contents/MacOS/launcher"

echo "Built $APP"
