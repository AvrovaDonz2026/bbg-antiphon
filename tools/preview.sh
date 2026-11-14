#!/usr/bin/env bash
set -euo pipefail
# Resolve the repo root through symlinks, and independently of $PWD. A relative
# invocation (`bash tools/preview.sh`) resolves `$0` against the caller's cwd,
# which non-interactive startup files (`BASH_ENV`, CI wrappers) can change; and
# `$0` is the link itself when the script is run through one. `dirname "$0"/..`
# alone gets both cases wrong. Walking the link chain with `cd -P` fixes both.
SOURCE="${BASH_SOURCE[0]}"
while [ -L "$SOURCE" ]; do
  DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ "$SOURCE" != /* ]] && SOURCE="$DIR/$SOURCE"
done
ROOT="$(cd -P "$(dirname "$SOURCE")/.." && pwd)"
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
