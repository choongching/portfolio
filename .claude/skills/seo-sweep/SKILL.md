---
name: seo-sweep
description: Run an SEO sweep over designby.cc: checks the HTML entry points (designbycc-landing/index.html and its /about/ and /penang/ copies, public/resume.html, designbycc-landing/404.html) plus sitemap.xml, robots.txt, llms.txt, and OG images for the conventions established in PRs #14, #22, #24, #25, #26–28, #29, #31. Use when the user says "SEO sweep" / "SEO check" / "SEO pass", after editing copy on the homepage or resume, after adding a new page, or before shipping changes that touch title/description/OG/canonical/sitemap.
---

# SEO sweep

A site-specific audit, not a generic SEO checklist. The site at `https://www.designby.cc/` is the slider landing, built by Vite (`vite.site.config.ts`: root `designbycc-landing/`, publicDir `public/`, output `dist/`; `pnpm build:site`, which becomes `pnpm build` at cutover). The repo-root `index.html` is the React SPA shell, retired at cutover.

- `designbycc-landing/index.html`: `/`
- `/about/` (indexed) and `/penang/` (live, not in the sitemap): built copies of the homepage HTML, one per slug in `PAGES` in `vite.site.config.ts`, each with its own canonical and `og:url`
- `public/resume.html` (static page): `/resume`
- `public/resume.pdf` (ATS-friendly download)
- `designbycc-landing/404.html`: what unknown paths get, with a real 404 status

Run the checks below in order, report each as **OK** or **FIX**, and propose concrete edits for any FIX. Do **not** mass-rewrite without surfacing what changed and why — the user has shipped careful copy revisions in #17, #20, #29, #30.

## 1. Per-page meta block

For each of `designbycc-landing/index.html` and `public/resume.html`, verify:

- `<title>` present, 30–65 chars. Homepage uses `CC Teo, Product Designer | Enterprise, AI, Zero-to-One`; resume uses `CC Teo, Product Designer | Resume`. If the title was edited, flag if it falls outside the range.
- `<meta name="description">` present, 120–170 chars. Both pages share the same canonical description — if one diverges, flag for confirmation (intentional or drift?).
- `<meta name="author">` = `Choong Ching Teo (CC)`
- `<meta name="robots">` = `index, follow, max-image-preview:large`
- `<meta name="theme-color">` present: `#f2f2f2` on the homepage, `#e5ddd2` on the resume
- `<link rel="canonical">` is **absolute** (`https://www.designby.cc/...`) and has **no `.html` extension** (PR #23 dropped `.html` to match Cloudflare Pages serving).
- `<link rel="icon" href="/favicon.ico">`

Then build (`pnpm build:site`) and check the page copies: `dist/about/index.html` and `dist/penang/index.html` must carry their own canonical and `og:url` (`https://www.designby.cc/about/`, `…/penang/`), with everything else the same as the homepage (the build fails if it finds neither to rewrite). `designbycc-landing/404.html` must stay `noindex`.

## 2. Open Graph + Twitter Card

For each page:

- `og:type` — `website` for homepage, `profile` for resume.
- `og:site_name`, `og:title`, `og:description`, `og:url`, `og:locale` (`en_MY`).
- `og:image` is an **absolute URL** pointing at `og-home.png` (home) or `og-resume.png` (resume).
- `og:image:width` = `1200`, `og:image:height` = `630`, `og:image:alt` present.
- Twitter Card block: `summary_large_image` + title/description/image mirror OG.
- Resume page additionally has `profile:first_name` / `profile:last_name`.

After meta check, verify the image files themselves:

```bash
file public/og-home.png public/og-resume.png
```

Both must report `PNG image data, 1200 x 630`. If either is missing, regenerated, or off-dimension, flag — past redesigns (#27, #28) regenerated these and a dimension drift would silently break LinkedIn/Slack previews.

## 3. JSON-LD structured data

For each page, extract every `<script type="application/ld+json">` block and validate as JSON. Expected blocks:

- **Homepage**: `Person`, `WebSite`, `VideoObject` (Trustana walkthrough).
- **Resume**: `Person` (with `worksFor`, `address`, `sameAs`).

Spot-check that `url` and `email` in the Person blocks still match the current canonical URLs, and that there is **no `worksFor`** while CC is between roles (CC left Trustana on 28 Sep 2026; check the `write-cc-copy` skill for current facts before assuming an employer). If the user has updated the About section or role recently, check that JSON-LD `description` hasn't gone stale relative to the visible page copy.

## 4. sitemap.xml

`public/sitemap.xml` must list every indexed URL: currently `/`, `/about/` and `/resume`. Checks:

- All `<loc>` entries are absolute (`https://www.designby.cc/...`) and have no `.html` extension.
- `<lastmod>` is within ~6 months of today, or matches the last meaningful content change. If the sweep is being run because of fresh content edits, propose bumping `<lastmod>` to today.
- No stale entries. `/penang/` is live but intentionally **not** in the sitemap; do not add it unless the user says so. `/styleguide` is retired with the React site and 301s to `/` (`public/_redirects`); it must not be listed.
- Top-level page priority `1.0`, `/about/` and resume `0.9`.
- `public/_redirects` has **no SPA catch-all** (`/* /index.html 200`): unknown paths must get `404.html` with a 404 status. Check with `pnpm preview:site` (answers like Cloudflare Pages at http://localhost:8788/): `curl -sI http://localhost:8788/nope` → `404`.

## 5. robots.txt

`public/robots.txt` must:

- Allow `Googlebot`, `Bingbot`, `Twitterbot`, `facebookexternalhit`, and `*`.
- End with `Sitemap: https://www.designby.cc/sitemap.xml`.

If the user has added a new bot allow/deny rule, leave it; just confirm the `Sitemap:` line is intact.

## 6. llms.txt

`public/llms.txt` is the LLM-friendly summary (added in PR #25). Check:

- Top-of-file summary still matches the homepage description and current role framing.
- "Pages" section lists every URL in `sitemap.xml` (plus `resume.pdf`).
- Career timeline reflects what's currently on `/resume` — if the resume's role descriptions or dates changed, the llms.txt summary will drift.
- Contact section matches the footer/resume contact info.

## 7. Resume PDF

`public/resume.pdf` exists. The resume's CTA (`public/resume.html`, also what the homepage's resume overlay shows) reads "Download Resume (PDF)" with an ATS-friendly note (#19). If the PDF is missing or its mtime is older than the most recent `resume.html` content change, flag for re-export.

## 8. Cross-page consistency

- Job title is `Product Designer` (set in #30, applied across homepage + resume). Flag any drift to "Lead Product Designer", "UX Designer", etc., unless the user just changed it intentionally — in which case propose updating *everywhere* including JSON-LD and llms.txt.
- Employment matches the current facts (`write-cc-copy` skill): since 28 Sep 2026 CC has no current employer, so no `worksFor`, Trustana in the past tense (Mar 2021 to Sep 2026), and an availability line instead. Years count from 2013 (13 in 2026); flag any "12 years".
- Location is `Penang` (`addressCountry: MY`) / `en_MY` since 2026-10-12 (CC: "Penang and ready to work globally from Penang"). Past roles and clients in Singapore stay as history.

## Reporting format

End with a single summary:

```
SEO sweep — N checks, M FIX

FIX:
  - <file>:<line or section> — <what's wrong> → <proposed fix>

OK:
  - <one line per area that passed>
```

Then ask before applying any FIX edits — copy changes need explicit sign-off in this project.

## What this skill does **not** do

- Lighthouse / PageSpeed scoring — out of scope; that's a runtime concern.
- Rewriting copy. Surface drift, don't restyle prose.
- Adding new pages to sitemap/llms.txt without asking: the user controls which pages are public-facing (e.g. `/penang/` is deliberately omitted).
