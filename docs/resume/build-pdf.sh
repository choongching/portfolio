#!/bin/sh
# Builds public/resume.pdf from docs/resume/resume-pdf.html with headless Chrome (real, selectable
# text: ATS-friendly). Usage: pnpm resume:pdf
set -e
cd "$(dirname "$0")/../.."
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="public/resume.pdf" "file://$PWD/docs/resume/resume-pdf.html" 2>/dev/null
echo "wrote public/resume.pdf"
