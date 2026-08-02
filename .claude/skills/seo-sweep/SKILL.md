---
name: seo-sweep
description: Run an SEO sweep over designby.cc — checks both HTML entry points (index.html, public/resume.html) plus sitemap.xml, robots.txt, llms.txt, and OG images for the conventions established in PRs #14, #22, #24, #25, #26–28, #29, #31. Use when the user says "SEO sweep" / "SEO check" / "SEO pass", after editing copy on the homepage or resume, after adding a new page, or before shipping changes that touch title/description/OG/canonical/sitemap.
---

# SEO sweep

A site-specific audit, not a generic SEO checklist. The site is a two-page portfolio at `https://www.designby.cc/`:

- `index.html` (React SPA shell) — `/`
- `public/resume.html` (static page) — `/resume`
- `public/resume.pdf` (ATS-friendly download)

Run the checks below in order, report each as **OK** or **FIX**, and propose concrete edits for any FIX. Do **not** mass-rewrite without surfacing what changed and why — the user has shipped careful copy revisions in #17, #20, #29, #30.

## 1. Per-page meta block

For each of `index.html` and `public/resume.html`, verify:

- `<title>` present, 30–65 chars. Homepage uses `CC Teo, Product Designer | Enterprise, AI, Zero-to-One`; resume uses `CC Teo, Product Designer | Resume`. If the title was edited, flag if it falls outside the range.
- `<meta name="description">` present, 120–170 chars. Both pages share the same canonical description — if one diverges, flag for confirmation (intentional or drift?).
- `<meta name="author">` = `Choong Ching Teo (CC)`
- `<meta name="robots">` = `index, follow, max-image-preview:large`
- `<meta name="theme-color">` = `#e5ddd2`
- `<link rel="canonical">` is **absolute** (`https://www.designby.cc/...`) and has **no `.html` extension** (PR #23 dropped `.html` to match Cloudflare Pages serving).
- `<link rel="icon" href="/favicon.ico">`

## 2. Open Graph + Twitter Card

For each page:

- `og:type` — `website` for homepage, `profile` for resume.
- `og:site_name`, `og:title`, `og:description`, `og:url`, `og:locale` (`en_SG`).
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

Spot-check that `url`, `email`, and `worksFor.name` in the Person blocks still match the current canonical URLs and the current employer (Trustana). If the user has updated the About section or role recently, check that JSON-LD `description` hasn't gone stale relative to the visible page copy.

## 4. sitemap.xml

`public/sitemap.xml` must list every public URL — currently `/` and `/resume`. Checks:

- All `<loc>` entries are absolute (`https://www.designby.cc/...`) and have no `.html` extension.
- `<lastmod>` is within ~6 months of today, or matches the last meaningful content change. If the sweep is being run because of fresh content edits, propose bumping `<lastmod>` to today.
- No stale entries (e.g. `/styleguide` is intentionally **not** in the sitemap — it's an internal reference page; do not add it unless the user says so).
- Top-level page priority `1.0`, resume `0.9`.

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

`public/resume.pdf` exists. The homepage CTA reads "Download Resume (PDF)" with an ATS-friendly note (#19) — if the PDF is missing or its mtime is older than the most recent `resume.html` content change, flag for re-export.

## 8. Cross-page consistency

- Job title is `Product Designer` (set in #30, applied across homepage + resume). Flag any drift to "Lead Product Designer", "UX Designer", etc., unless the user just changed it intentionally — in which case propose updating *everywhere* including JSON-LD and llms.txt.
- Current employer is `Trustana` in JSON-LD `worksFor` and llms.txt.
- Location is `Singapore` / `en_SG`.

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
- Adding new pages to sitemap/llms.txt without asking — the user controls which pages are public-facing (e.g. `/styleguide` is deliberately omitted).
