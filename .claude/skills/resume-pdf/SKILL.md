---
name: resume-pdf
description: Edit, rebuild and ATS-check CC's resume PDF (public/resume.pdf, built from docs/resume/resume-pdf.html). Use whenever the resume PDF's content, layout or styling changes, when CC asks whether the PDF is up to date or ATS-ready, or when the /resume page's Download button serves the wrong file.
---

# Resume PDF

`public/resume.pdf` is what recruiters download and what their applicant tracking systems (ATS)
parse. **CC's rule (2026-11-25): every edit to the PDF must leave it ATS-ready.** Run the check
after every change and show CC the result before committing.

## Where things live

- Source: `docs/resume/resume-pdf.html`. Edit this, never the PDF.
- Build: `pnpm resume:pdf` (`docs/resume/build-pdf.sh`, headless Chrome). It runs the ATS check
  at the end.
- Check alone: `pnpm resume:check` (`check-ats.sh` and `check-ats.swift` in this folder).
- Download links: `/resume` (`public/resume.html`, `download="Teo-Choong-Ching-Resume.pdf"`) and
  the homepage's resume overlay (`designbycc-landing/resume-overlay.js`). Both point at `/resume.pdf`.
- Copy and facts: the `write-cc-copy` skill. The PDF is one of the places a fact about CC lives,
  so a change usually also goes to `/resume`, the README, llms.txt and the meta descriptions
  (`seo-sweep`). Customer names are fine here (resume only), not in the portfolio.

## The ATS check

`check-ats.swift` reads the PDF with PDFKit, the way a parser does. There's no pdftotext or pypdf
on this Mac. It checks:

- 2 pages; real, selectable text; name on the first line; contact details in the body.
- The standard headers, each on its own line and in order: Professional Summary, Skills,
  Professional Experience, Education, Certifications.
- Role lines all read `Title | Company | Mon YYYY – Mon YYYY` (an en dash is fine for ATS).
- No ligature glyphs (ﬁ ﬂ), no unreadable characters, no em dashes.
- The PDF title metadata is set and the links are clickable.

`check-ats.sh` adds checks on the file and the source:

- the fonts are embedded (Arial) and the PDF has no images;
- the source has no columns, grid, tables, floats or positioned elements;
- the download filename is right.

When a check fails, fix the source and rebuild. Don't loosen the check to make it pass. If a
change needs a new rule (a new section header, three pages), ask CC first, then update the check
and this file.

## Layout rules that keep it ATS-ready

- One column, top to bottom. Use no tables, grid, columns, text boxes or images, and no skill bars.
- Don't use the print header or footer. The build passes `--no-pdf-header-footer`, and the contact
  line sits in the body.
- Use plain bullets and a standard font (Arial). The body is 9.8pt, which sits at the ATS
  guideline's floor of about 10pt; never go smaller.
- Keep it to 2 pages. If an edit spills onto a third, cut words; don't shrink the type.

## After shipping

The site deploys on merge. Confirm the live file is the new one, then tell CC that their browser
may keep the old copy for up to 4 hours (`max-age=14400`): Cmd+Shift+R or a private window.

```sh
curl -s https://www.designby.cc/resume.pdf | shasum
shasum public/resume.pdf
```
