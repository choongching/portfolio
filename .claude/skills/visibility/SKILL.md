---
name: visibility
description: CC's local designby.cc visibility dashboard (pnpm visibility): live site-health checks, Google Search Console (searches, impressions, clicks, position, index status, sitemap) and Cloudflare Web Analytics (visits, pages, referrers, countries). Use when CC asks how the site is doing, about traffic, search ranking or visibility, whether Google has indexed a page, or to connect, fix or extend the dashboard.
---

# Visibility dashboard

`pnpm visibility` opens http://127.0.0.1:5181/. The server is `docs/visibility/serve.mjs` and the
page is `docs/visibility/index.html`. It has no dependencies, costs nothing and listens on this Mac
only.

| Panel | Source | Setup |
|---|---|---|
| Site health | Live requests to www.designby.cc and the old Webflow site | None |
| Google search | Search Console API, through a service account | A Google key file |
| Site traffic | Cloudflare Web Analytics, through the GraphQL API | Web Analytics on, plus an API token |

## Goals: every widget answers one of these (CC, 2026-11-25)

The page answers one question: **are hiring teams finding the portfolio, and does it hold their
interest?** Each view opens with its own question and a one-sentence answer computed from the
data, then the widgets that back the answer up. When adding a widget, say which question it
answers; if it answers none, leave it out.

| View | Question | Key metrics |
|---|---|---|
| Traffic | How many people visit, and are they interested? | Visitors · Viewed resume or About (hiring interest) · Came from a link · From outside Malaysia (the remote, worldwide goal) |
| Google search | Do you show up when people search your name on Google? | Position for your name (goal: #1, the old Webflow problem) · Impressions · Clicks · Pages indexed |
| Site health | Is the site working for visitors and for Google? | Checks passing, then per group: what visitors open, what Google reads, resume PDF, old site retired |

Write the questions the way a person would ask them (CC rejected "Who's coming, and do they
look further?" as unnatural).

**CC's design rules:**
- Light mode only. Simple, well spaced, a lot of whitespace.
- No icons, no shadows, not colourful. One data colour (`--accent`).
- Green and red appear only for up/down changes and for failures. Passing checks stay grey.
- Layout follows the SaaS references CC shared: a side menu, a "Key metrics" strip with hairline
  dividers, sections on a grey page separated by gutters, and panels whose title carries a muted
  "· description".
- Use ranked share lists and plain tables. Each delta compares with the previous period of the
  same length.

## Keys: outside the repo, never committed

Everything lives in `~/.config/designby-visibility/`:

```json
// config.json
{
  "cloudflare": { "accountId": "…", "apiToken": "…", "siteTag": "" },
  "google": { "site": "sc-domain:designby.cc" }
}
```

- `google-key.json` holds the service account's JSON key.
- `siteTag` can stay empty: the server finds it by grouping the analytics by site (an Account Analytics: Read token cannot list sites).
- Env vars override the config: `CF_ACCOUNT_ID`, `CF_API_TOKEN`, `CF_SITE_TAG`, `GSC_KEY_FILE`, `GSC_SITE`.
- **CC creates the keys and tokens; Claude never types them into a form.** Guide CC through the
  steps (the panels show them too), then ask CC to save the files.

**Google** (one-off, about 10 minutes):
1. In a Google Cloud project, enable the Search Console API.
2. Create a service account with no roles and download a JSON key into `google-key.json`.
3. In Search Console → Settings → Users and permissions, add the service account's email with
   **Restricted** permission.

**Cloudflare:**
1. Workers & Pages → designcc → Metrics → Web Analytics → Enable. It starts counting after the
   next deploy.
2. Create a custom API token with the permission **Account · Account Analytics · Read**. CC's
   token is named `site-visibility` (2026-11-25); roll it from My Profile → API Tokens if it leaks.
3. Put the account ID and the token in `config.json`.

## How it behaves

- Caches: health 1 min, search 30 min, traffic 10 min. **Refresh** clears them.
- Range presets: 7, 28 or 90 days. The choice is remembered in localStorage.
- Search Console data runs about 2 days behind. The range ends yesterday.
- "Searches for your name" filters the query list with `NAME_RE` in `serve.mjs`: teo, choong,
  ching, cc teo, designby. It tracks the old ranking problem: does designby.cc show up for CC's
  own name?
- Traffic is fetched in 7-day windows and summed: Cloudflare samples longer queries. Some older
  days are stored sampled anyway; the page then says the numbers are estimates.
- URL inspection covers `/`, `/about/` and `/resume`. Each costs one call from a quota of
  2,000 a day; the cache keeps reloads cheap.
- API errors appear on the page verbatim. A missing key shows that panel's setup steps.

## Health checks

They mirror the standing SEO rules (`seo-sweep`) and the Webflow phase-out:

- the pages answer 200, an unknown path gets a real 404, and the bare domain redirects to www;
- the title leads with "Teo Choong Ching" and the description is 120–170 characters;
- robots, canonical and the versioned `og-home.png?v=N`;
- the Person JSON-LD with `alternateName`, the sitemap URLs, robots → sitemap, and llms.txt
  Availability;
- the live `resume.pdf` matches the repo copy;
- the Webflow pages are gone;
- the Cloudflare Analytics beacon is present. This one is a warning until Web Analytics is on.

When a standing rule changes (a new page, a new title, `?v=3`), update the check in `health()`
in the same PR.

## Testing without keys

Render the panels with sample data: open the page, override `window.api` to return mock
`search` and `traffic` objects (the shapes come from `search()` and `traffic()` in `serve.mjs`),
then call `loadSearch()` and `loadTraffic()`. `drive-headless` can do this with an `eval` step.
Look at the screenshot.
