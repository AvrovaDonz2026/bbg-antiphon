#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist
zip -q -r -X dist/antiphon-v2.bbgtheme2 index.html css js themecfg
printf 'built dist/antiphon-v2.bbgtheme2 (%s bytes)\n' "$(wc -c < dist/antiphon-v2.bbgtheme2 | tr -d ' ')"
