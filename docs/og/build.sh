#!/bin/sh
# Renders public/og-home.png (1200×630, the link preview for every page) from docs/og/og.html.
# The design's settings live in docs/og/og-design.js; adjust them with `pnpm og:edit` (its Save runs this).
# Usage: pnpm og:images
set -e
cd "$(dirname "$0")/../.."
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=2000 \
  --screenshot="public/og-home.png" "file://$PWD/docs/og/og.html" 2>/dev/null
echo "wrote public/og-home.png"
