#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-8775}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ln -s "$ROOT/index.html" "$TMP/index.html"
ln -s "$ROOT/css" "$TMP/css"
ln -s "$ROOT/js" "$TMP/js"
ln -s "$ROOT/themecfg" "$TMP/themecfg"
cp -R "$ROOT/preview/." "$TMP/"
printf 'preview: http://127.0.0.1:%s/index.html\n' "$PORT"
cd "$TMP"
exec python3 - "$PORT" <<'PY'
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

port = int(sys.argv[1])
ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
PY
