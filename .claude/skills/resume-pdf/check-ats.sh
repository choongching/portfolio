#!/bin/sh
# ATS check for the resume PDF: text extraction (check-ats.swift) plus file and source checks.
# Usage: pnpm resume:check   (also runs at the end of pnpm resume:pdf)
cd "$(dirname "$0")/../../.."
PDF=public/resume.pdf
SRC=docs/resume/resume-pdf.html
fail=0
ok()   { echo "OK    $1"; }
bad()  { echo "FAIL  $1"; fail=1; }

swift .claude/skills/resume-pdf/check-ats.swift "$PDF" 2>/dev/null || fail=1
echo
fonts=$(strings "$PDF" | grep -oE '/BaseFont ?/[A-Za-z+_-]+' | sed 's/.*+//' | sort -u | tr '\n' ' ')
[ -n "$fonts" ] && strings "$PDF" | grep -qE '/FontFile2?3?' && ok "fonts embedded ($fonts)" || bad "fonts embedded"
[ "$(strings "$PDF" | grep -cE '/Subtype ?/Image')" = 0 ] && ok "no images" || bad "no images (the PDF contains an image)"
grep -qE 'column-count|columns:|display: ?grid|<table|float:|position: ?(absolute|fixed)|<img' "$SRC" \
  && bad "one column, no tables, floats or images in $SRC" || ok "one column, no tables, floats or images in the source"
grep -q 'download="Teo-Choong-Ching-Resume.pdf"' public/resume.html \
  && ok "download saves as Teo-Choong-Ching-Resume.pdf" || bad "download filename on public/resume.html"
exit $fail
