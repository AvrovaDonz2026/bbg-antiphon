#!/usr/bin/env bash
# Assemble the GitHub Pages demo from the theme source and the preview fixture.
#
# demo/ is a build artifact. It used to be committed in full, which meant the
# theme's index.html, css/ and js/ existed twice in git: once as the real source
# and once as a hand-made copy that could silently drift out of date. The same
# blog fixture was also committed twice, under demo/data and preview/data.
#
# Now there is exactly one source for each thing:
#   theme   -> index.html, css/, js/, themecfg/ at the repository root
#   fixture -> preview/data/, preview/static/, preview/atom.xml
# and this script lays them out in the shallow tree GitHub Pages expects. The
# Pages workflow runs it, so the published demo is always built from source and
# never from a stale copy.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OUT="${1:-demo}"

rm -rf "$OUT"
mkdir -p "$OUT"

# Theme source: the files a BBG site actually loads.
cp index.html "$OUT/index.html"
cp -R css "$OUT/css"
cp -R js "$OUT/js"
cp -R themecfg "$OUT/themecfg"

# Demo content: the fixture the preview server also uses, so the two can never
# disagree about what the sample blog contains.
cp -R preview/data "$OUT/data"
cp -R preview/static "$OUT/static"

# atom.xml is linked unconditionally from the footer (js/views.js), so a demo
# without it ships a dead feed link. It belongs to the fixture, not the theme.
if [ -f preview/atom.xml ]; then
  cp preview/atom.xml "$OUT/atom.xml"
fi

printf 'demo assembled: %s (%s files)\n' "$OUT" "$(find "$OUT" -type f | wc -l | tr -d ' ')"
