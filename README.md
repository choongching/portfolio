# Choong Ching, Teo (CC)

**Lead Product Designer**<br>
B2B AI Products · Zero to One · Based in Penang, Malaysia

[designby.cc](https://www.designby.cc) ·
[teo.choong.ching@gmail.com](mailto:teo.choong.ching@gmail.com) ·
[linkedin.com/in/choongching](https://linkedin.com/in/choongching) ·
[dribbble.com/choongching](https://dribbble.com/choongching) ·
[github.com/choongching](https://github.com/choongching)

---

## About

Lead Product Designer with 13 years as a hands-on IC across B2B SaaS, AI products and enterprise platforms. At Trustana, joined as the second hire and was the only designer until the Graas acquisition in August 2026, taking the product from zero to one: a B2B marketplace, then a PIM and AI enrichment platform, then AI Commerce Agents, used by enterprise retailers across APAC and the Middle East to process 30K+ SKUs a month. Works end to end: research, design systems, prototyping in the live codebase, and shipping. Available for full-time, contract or freelance work.

---

## Experience

### Trustana · Lead Product Designer

_Mar 2021 – Sep 2026_

AI product data platform for retailers, acquired by Graas in August 2026. Joined as the second hire, promoted from Senior to Lead. The only designer until the acquisition.

- Designed Trustana Commerce Agents from zero to one, launched July 2026: AI agents that run long, multi-step catalogue workflows (quality checks, enrichment, taxonomy, channel prep), some steps on their own and others waiting for a person.
- Designed the controls behind the agents: confidence thresholds per category and channel, review queues, and an audit trail of every action, so teams give the agents more room as they earn it.
- Designed the first product, a B2B marketplace for SME suppliers and distributors, then led the move into a PIM and DAM platform, built from zero.
- Launched the PIM beta in March 2023 with early POC customers in Singapore, reaching 950+ products imported per day within months.
- Designed and shipped bulk import, AI data enrichment and image enrichment workflows for enterprise retailers processing 30K+ SKUs a month.
- Cut Vallen Asia's product onboarding from 2 weeks to 2 days with the bulk import workflows. David Jones enriched 8,000 SKUs a week across 73 brands, with 12–52% higher product page engagement.
- Introduced AI-assisted prototyping (Claude Code, Cursor) across the product team, shortening the design-to-delivery cycle by about a week.
- Validated releases through Microsoft Clarity and Hotjar session reviews, turning usability findings into the next design iterations.
- Led design hiring: candidate criteria, recruiter briefs, and the design exercise and assessment process.
- Owned the Webflow marketing site end to end, including the Commerce Agents launch pages and product visuals.

### Saleswhale (YC S16) · Senior Product Designer

_Jan 2019 – Sep 2020_

YC-backed AI conversational platform for marketing and sales teams. Joined at the Series A, in a three-person design team.

- Designed the AI assistant's core workflows: email outreach configuration, lead classification, and conversation management for B2B marketing teams.
- Moved the team from Sketch to Figma and set up Saleswhale's first shared design library, cutting handoff friction between designers, PMs and developers.
- Introduced the design process and quarterly OKRs, and hired the team's junior designer.
- Ran Google Design Sprints (AJ&Smart certified) for major features: the first Dashboard, the Reveal lead funnel view, and the Salesforce integration that synced lead status for sales teams.
- Piloted Research Ops v1.0, bringing user research practices to PMs and Customer Success managers.

### Rakuten Viki · User Experience Designer

_May 2015 – Jan 2019_

Video streaming platform for Asian drama fans worldwide. Joined as the second product designer after the Rakuten acquisition; the team grew to four designers.

- Designed fan channels, subtitling tools and community features for 40M+ monthly viewers, and led the platform redesign after the Rakuten acquisition.
- Ran live interviews and usability sessions that shaped community features, a Korean language learning app and subscription streaming.
- Validated design decisions with Optimizely A/B tests, partnering with data and engineering teams on experiments and rollouts.
- Partnered with the UX researcher on qualitative and quantitative studies: user interviews, usability tests, surveys, session analysis and research planning.
- Maintained Soompi's website (acquired by Viki, 7M users) and launched fan voting and polls for the Korean entertainment news portal.

### AsiaRooms · User Experience Designer

_Jan 2013 – Mar 2015_

UK-owned online travel agency for hotel bookings across Asia. First full-time in-house UX role.

- Redesigned the booking flow across web, iOS and Android, working directly with developers on implementation.
- Designed localization patterns for ASEAN markets (Thai, Vietnamese, Indonesian Rupiah), sharing design systems with sister company LateRooms in Manchester.
- Optimized booking conversion with A/B split tests and Crazy Egg heatmap analysis on key form pages.

### Aleph-Labs · UI/UX Designer

_Jul 2011 – Dec 2012_

Boutique design agency in Singapore. Embedded consultant for OCBC Bank, UOB Singapore and ANZ Singapore.

- Designed OCBC's digital banking interfaces across iOS, Android, iPad and responsive web, on-site at OCBC HQ.
- Shipped OCBC's native mobile banking app and its first iPad internet banking app, featured in OCBC's official news announcement.
- Contributed to the UI of OCBC Money Insights, Singapore's first online banking tool for automated expense tracking, which reached 60,000 active users within two months.
- Supported the styleguide refresh for UOB's enterprise web banking platform, standardizing UI patterns across the application.

---

## Education

### Multimedia University (MMU) · Media Innovation

_Graduated 2007_

Faculty of Creative Multimedia, Cyberjaya, Malaysia.

### AJ&Smart · Google Design Sprint Certification

---

## Skills

**Design:** Product Design · UX Design · Interaction Design · AI Product Design · AI Agents · Agentic Workflows · Human-in-the-Loop Design · Enterprise Workflows · Design Systems · Information Architecture · Zero-to-One Product Building

**Tools:** Figma · Claude Code · Cursor · Webflow · Microsoft Clarity · Hotjar · GitLab · GitHub

**Process:** User Research · Google Design Sprint · Service Blueprint · A/B Testing · User Story Mapping · Agile · Stakeholder Management · Design Hiring

**Domain:** B2B SaaS · PIM · DAM · AI Data Enrichment · Agentic Commerce · Bulk Data Workflows · Retail and Commerce · Enterprise · Fintech · APAC Markets

---

## Resume

A more detailed creative resume is available at [`/resume`](public/resume.html) and as an [ATS-ready PDF](public/resume.pdf).

---

## About this repo

This is the source for my portfolio site: plain HTML, CSS and JavaScript with GSAP, in
`designbycc-landing/`, built with Vite (`vite.site.config.ts`). `public/` is copied to the site
root as-is.

```bash
pnpm install
pnpm dev:site      # dev server on :8080 (phones: the LAN URL it prints)
pnpm build         # production build into dist/
pnpm preview:site  # build, then serve dist/ like Cloudflare Pages on :8788
pnpm og:edit       # the link-preview image editor (Save re-renders public/og-home.png)
pnpm og:images     # re-render public/og-home.png without the editor
pnpm preloader:edit  # the preloader motion editor (logo size and place: localhost:8080/?tune)
```

**Where things are documented:**

| | |
|---|---|
| `docs/devlog.md` | What changed and why, newest first. **Starts with a "Where we are" block** — read this first when picking work back up. |
| `docs/asset-guidelines.md` | Type and colour tokens, image and video rules. |
| `docs/og/` | The link-preview image (`og-home.png`): its settings, renderer and editor. |
| `docs/preloader/` | The preloader's motion editor; the preloader itself is `designbycc-landing/preloader/` (the `preloader` skill). |
| `research/` | Reverse-engineering specs behind the interaction study. |
| `.claude/skills/` | Repeatable procedures: cards and page transitions, media swaps, the hero video, headless checks, SEO, the link-preview image, copy. |

`designbycc-landing/` has its own README.

---

## Deployment

Hosted on **Cloudflare Pages** at [designcc.pages.dev](https://designcc.pages.dev).

### Why Cloudflare Pages

This is a media-heavy portfolio (images, looping videos, downloadable PDF) intended to live online for years, so bandwidth is the cost lever that matters most.

- **Cloudflare Pages free tier offers truly unlimited bandwidth** for static assets, which no other major static host matches. The only practical limits are a 25 MB per-file cap (irrelevant since videos here stay under 3 MB by design) and 500 builds per month.
- **Vercel and Netlify** meter bandwidth aggressively on their free tiers (~100 GB/month), and both have shifted pricing multiple times in recent years. Vercel additionally meters "Image Optimization" as a separate service that can rack up surprise charges.
- **GitHub Pages** is fine for low-traffic personal sites but has a 100 GB soft monthly cap and a 1 GB total site-size limit — workable for years but ceiling-bound, and lacks PR preview deployments.

The asset-size discipline in `docs/asset-guidelines.md` (images 80–150 KB, video loops 1–3 MB) controls long-term cost far more than platform choice — but Cloudflare's bandwidth headroom makes a traffic spike (e.g. front-page of Hacker News) a non-event instead of a billing event.

### Auto-deploy

Auto-deploys via GitHub Actions (`.github/workflows/deploy.yml`):

- **Push to `main`** → production deploy
- **PR opened** → preview deploy at a unique URL (visible in the Action log)

Push-to-live takes ~40–60 seconds.

### Manual deploy

For pushing a local build without going through CI:

```bash
pnpm build
pnpm exec wrangler pages deploy dist --project-name=designcc --branch=main --commit-dirty=true
```

Requires `pnpm exec wrangler login` once per machine.

### Required GitHub secrets

The workflow needs two repo-level secrets under Settings → Secrets → Actions:

- `CLOUDFLARE_API_TOKEN` — created from the "Edit Cloudflare Workers" template at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) (the template covers Pages too).
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID (visible in the URL when you're in the Cloudflare dashboard).

### Things to leave alone

- **`public/_redirects`**: no SPA catch-all. Cloudflare Pages only acts as an SPA when there is no `404.html`; the site ships one, so unknown paths get a real 404.
- **pnpm version in CI is pinned to `10.15.0`** in `deploy.yml`. Must match local pnpm so the lockfile resolves identically — bump both together if you upgrade.

### Why GitHub Actions, not Cloudflare's built-in Git integration

The Pages project was bootstrapped via Wrangler (Direct Upload), so it can't be connected to Cloudflare's native Git integration via the dashboard — that flow only works for projects created from a Git connection at the start. GitHub Actions gives us the same auto-deploy outcome regardless. If you ever want Cloudflare's native flow with build logs in the Cloudflare dashboard, the path is to delete and recreate the project from the dashboard's "Connect to Git" option.
