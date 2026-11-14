#!/usr/bin/env bash
set -euo pipefail
# Resolve the repo root through symlinks, and independently of $PWD. A relative
# invocation (`bash tools/build.sh`) resolves `$0` against the caller's cwd,
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
cd "$ROOT"
rm -rf dist
mkdir -p dist
if command -v zip >/dev/null 2>&1; then
  zip -q -r -X dist/antiphon-v2.bbgtheme2 index.html css js themecfg
else
  # Same output path and member set as the zip branch: python's zipfile module
  # archives directories recursively, so the single command covers the files
  # and their tree structure alike.
  python3 -m zipfile -c dist/antiphon-v2.bbgtheme2 index.html css js themecfg
fi
printf 'built dist/antiphon-v2.bbgtheme2 (%s bytes)\n' "$(wc -c < dist/antiphon-v2.bbgtheme2 | tr -d ' ')"
