# Site cutover: the slider becomes designby.cc

Plan, 2026-10-12. Goal: anyone opening https://www.designby.cc/ gets the slider build
(`designbycc-landing/`), not the Vite + React page. **Fixed:** the favicon (`public/favicon.ico`)
and the page title (`CC Teo, Product Designer | Enterprise, AI, Zero-to-One`) stay exactly as
they are.

Inputs: three inventory passes on 2026-10-12 (live site, study, prior notes). Findings are
summarised in § 1. Nothing here has been built yet.

## 1. Where we start

**The study is nearly content-clean.**
- All 8 cards are CC's own (or third-party with credit: the Graas news card and the Unsplash
  Penang photo). No smlxl.company URLs or hotlinked media remain; smlxl appears only in code
  comments.
- Fonts are licensed: Switzer (Fontshare FFL) and Geist Mono (OFL), with the licence files in
  `fonts/`.
- GSAP is self-hosted in `vendor/`.
- The About and Penang layers carry CC's copy.
- The devlog conventions and `designbycc-landing/README.md` still say "private study, never
  deployed, 73 hotlinked assets". That is stale and gets rewritten at cutover.

**What blocks shipping it as-is:**

| # | Blocker | Where |
|---|---|---|
| B1 | The study is outside the deploy: CI builds `dist/` from the React app only | `.github/workflows/deploy.yml`, `vite.config.ts` |
| B2 | `<meta name="robots" content="noindex, nofollow">` | `designbycc-landing/index.html:6` |
| B3 | No favicon, description, canonical, OG/Twitter or JSON-LD (the live root has all of these) | study `<head>` |
| B4 | 9 `../public/...` paths would resolve to `/public/...` at the root | index.html 67-422, `resume-overlay.js:20-21` |
| B5 | `_redirects` (`/* /index.html 200`) would answer missing files with HTML. The resume overlay only checks `r.ok`, so a broken path would frame the homepage instead | `public/_redirects`, `resume-overlay.js:52` |
| B6 | `/about/` and `/penang/` are only lookup keys, not real addresses. A direct visit, Cmd-click or shared link opens nothing; `/#about` on first load doesn't open About either | `main.js:753-798` |
| B7 | `fonts/` clash: at the root, the study's `fonts/Switzer…` resolves to `/fonts/`, which holds only Space Grotesk (still needed by `resume.html`) and is cached immutable for a year | `public/fonts/`, `public/_headers` |
| B8 | Lab files (`_*.html` with CDN GSAP, three.js and Google Fonts) and `_penang/` (2.6 MB) sit in the same folder and must not ship | `designbycc-landing/_*` |
| B9 | The tools hardcode `http://localhost:8081/designbycc-landing/index.html` | `check-slider.mjs`, `check-close.mjs`, `drive-headless`, `list-cards.py` |

**What the live site has that must survive:**
- **Routes:** `/`, `/resume` (`public/resume.html`), `/resume.pdf`, `/llms.txt`,
  `/sitemap.xml`, `/robots.txt`, `/og-home.png`, `/og-resume.png`, and the Trustana
  video/poster URLs that the VideoObject JSON-LD points to.
- **Metadata:** all head metadata from #80 and #83: description, Person/WebSite/VideoObject
  JSON-LD, Penang address, `en_MY`.
- **noscript:** a noscript copy of the content for crawlers and LLMs.
- **Performance and caching (#81):** year-long immutable cache on `/assets/*` and `/fonts/*`; no
  hero video download before it's needed (phone LCP 2.6 s is the bar to beat or match).
- **Retired with the React app:** `/styleguide` (internal) and the `#work` / `#about` /
  `#contact` hashes.

## 2. Architecture decision (recommended)

**Keep Vite as the build tool and point it at the study.** Drop React.

- `vite.config.ts`: `root: "designbycc-landing"`, `publicDir: "../public"`,
  `build.outDir: "../dist"`, with multi-page inputs (`index.html`, `404.html`, and the
  `about/` and `penang/` entries from Phase 3).
  - CI keeps `pnpm build` and `wrangler pages deploy dist`, so the workflow barely changes.
  - The folder name stays `designbycc-landing/`, so skills, history and memory still point at
    the right place. Renaming it to `site/` is optional and cosmetic, and can come later.
- **Scripts become one module entry.** Today there are seven classic `defer` scripts. All four
  feature files and `resume-overlay.js` are self-contained IIFEs, and `main.js` reads
  `window.gsap`.
  - A `site.js` entry imports them in today's order.
  - Vite then minifies them, hashes them into `/assets/` (year cache) and keeps the run order
    (modules are deferred too).
  - GSAP comes from the vendored file or from npm `gsap@3.12.5`. Phase 2 checks which works;
    module strict mode is the one risk.
- **CSS goes through Vite too:** `styles.css` and `about.css` are hashed and minified.
- **Paths:**
  - `../public/x` becomes `/x`.
  - The resume overlay fetches `/resume.html` and the root-path rewrite in it is removed (the
    resume's own `/fonts/...` paths are then correct as written).
  - Study fonts move to `/fonts/` under **new filenames** (immutable cache), or into Vite
    assets with a hash. Recommendation: the Vite assets, which keeps `public/fonts/` for the
    resume.
- **Local dev:** `pnpm dev` serves the study at `/`, the same as production. The 8081 Python
  server is retired for the study, and the tools take the dev or preview URL.

Rejected alternatives:
- **Copying the folder into `public/` as-is:** no hashing, so no safe long cache, and the lab
  files leak.
- **Wrapping the study in React:** a rewrite for no gain.

## 3. Phases

Each numbered PR is one branch, one PR and one devlog entry, per CLAUDE.md.

**Production safety:**
- PRs 1-4 add a **parallel build** (`pnpm build:site`, `pnpm dev:site`) and leave
  `pnpm build` (React) untouched, so merging them changes nothing live.
- **PR 5 is the cutover:** it flips `build` to the site.
- Its Cloudflare preview URL (`<branch>.designcc.pages.dev`) is the full staging site. It stays
  open until CC has tested it on desktop and on their iPhone.

### Phase 0: Decisions and pre-flight (no code)
- CC answers the questions in § 5.
- Baselines on current main, saved for comparison:
  - `check-slider --save` (desktop and mobile)
  - `check-close`
  - live-site Lighthouse and `drive-headless --throttle slow4g` numbers for `/` and `/resume`
    (phone and desktop)
- Snapshot the live `<head>`, `sitemap.xml`, `llms.txt` and `robots.txt` so parity can be
  diffed later.

### Phase 1: Site build alongside the old one (PR 1: `build/site-vite`)
- Add `vite.site.config.ts`, plus `dev:site`, `build:site` and `preview:site`.
- Add the `site.js` module entry and route CSS through Vite.
- Rewrite `../public/` paths to `/` and fix the resume overlay source path.
- Move the fonts into Vite assets.
- Exclude the lab files:
  - only explicit inputs are built;
  - `_*.html` and `_penang/` are never inputs;
  - a `.gitignore` or exclude entry is confirmed.
- Point the tools (`check-slider`, `check-close`, `drive-headless`, `list-cards`) at a
  `--url` / `SITE_URL` default of the site dev server.
- **Done when:**
  - `pnpm build:site` produces `dist-site/` with no `_*.html`, no `/public/` paths and no CDN
    URLs.
  - `check-slider` desktop and mobile compare clean against the Phase 0 baseline.
  - `check-close` passes.
  - The resume overlay opens from the menu and from About, and closes with Esc, back and Close.

### Phase 2: Real addresses for the pages (PR 2: `feat/site-routes`)
- `/about/` and `/penang/` become real pages:
  - The build emits `about/index.html` and `penang/index.html`. Each is the same document with
    `data-initial-layer`, its own canonical and `og:url`, and the same title (see § 5, Q2).
  - On load, `main.js` opens the initial layer without the card animation; the logo then goes
    home to `/`.
- **Transitions push paths, not hashes.**
  - Card → page pushes `/about/`; going home pushes `/`.
  - `popstate` reads `location.pathname`, falling back to the hash.
  - Old links map as follows: `/#about` and `/#contact` → About; `/#work` → home (proposal,
    § 5, Q4).
- `404.html` in the study's style (logo, one line of existing copy, link home) replaces the SPA
  fallback. Cloudflare Pages only treats a site as an SPA when no `404.html` exists, so this file
  is required.
- **Done when** a direct visit, reload, Cmd-click, back/forward and a shared link all work for
  `/`, `/about/` and `/penang/`, on desktop and on phone, and a junk URL returns a real 404
  status.

### Phase 3: Metadata, SEO and LLM parity (PR 3: `seo/site-head`)
- **Port the live `<head>` unchanged:**
  - title and favicon, unchanged, as asked
  - description, author, robots (remove the noindex)
  - canonical
  - OG/Twitter with `og-home.png`
  - the three JSON-LD blocks, with VideoObject `embedUrl` updated from `/#work` to `/`
- **theme-color:** the live value `#e5ddd2` is the old beige; it changes to the study's
  background colour.
- **noscript:** rewritten from existing copy only (the intro card sentence, the About intro and
  the contact links). No new words.
- **Sitemap:** add `/about/` (and `/penang/` if CC says yes); `lastmod` = cutover date.
- **`llms.txt`:** the Pages section gains About (and Penang). The facts are unchanged.
- **`resume.html`:** `og:site_name` is unified to "Design by CC" (an open item from #80).
- **Done when** a `seo-sweep` run on the preview passes, the `<head>` diff against the Phase 0
  snapshot shows only the intended changes, and the Rich Results test is clean.

### Phase 4: Performance parity (PR 4: `perf/site-load`)
- **Card video (27 MB of mp4 + webm):** it must not download before the card is near view,
  checked on phone with `--throttle slow4g`. Add a phone-sized rendition if needed, via
  `rebuild-hero-video`, re-encoded from the master.
- **`_headers`:**
  - `/assets/*` keeps its year cache;
  - `/media/*` gets a week;
  - HTML stays revalidated.
- **Preloads:** the LCP element (the intro text, so fonts) and nothing else.
- **Budgets vs Phase 0:**
  - phone LCP ≤ 2.6 s on slow4g
  - CLS ≈ 0
  - JS ≤ live's 57 KB gzip (GSAP is ~45 KB of that)
  - no long task over 200 ms at load
- **Lab files:** delete or archive the unused `public/media/run-agent-demo*` (3.9 MB, not
  referenced).

### Phase 5: Cutover (PR 5: `swap/site-cutover`)
- `package.json`: `build` → the site build; drop the React scripts.
- `public/_redirects`: remove the SPA catch-all. Optionally add `/styleguide / 301`.
- Remove the root `index.html` (React).
- Rewrite the devlog conventions and the study README: no longer "never deployed".
- **Staging gate:** the PR's preview URL, tested by CC on desktop and iPhone, plus the full QA
  matrix (§ 4). Merge only on CC's "ship".
- **After merge, verify live:**
  - `curl` checks: the title, the favicon bytes match, `robots` is `index`, and `/resume`,
    `/resume.pdf`, `/llms.txt`, `/about/`, `/penang/` and the 404 all return what they should;
  - a headless run against the production URL;
  - resubmit the sitemap in Search Console (CC).
- **Rollback:** in the Cloudflare Pages dashboard, choose the previous production deployment
  and use "Rollback" (instant). Or `git revert` the cutover PR, which redeploys React.

### Phase 6: Cleanup (PR 6: `chore/remove-react`; can wait a week of live traffic)
- **Delete:**
  - `src/` (66 files, including 49 unused shadcn files)
  - `tailwind.config.ts`, `postcss.config.js`, `components.json`
  - the React tsconfigs and vitest
  - about 60 dependencies (React, Radix, framer-motion, tanstack and the rest)
  - `@fontsource`
- Keep `vite` and `wrangler`, and pin `gsap` if it is used from npm.
- **Update to the new structure:**
  - CLAUDE.md
  - skills (`slider-page-transitions`, `parity-check`, `verify-motion`, `seo-sweep`,
    `drive-headless`, `site-spike`)
  - memory: `reference_deployment` is stale; this is also a project note
- **Then:**
  - drop the two old stashes;
  - delete `dist/` (stale, untracked);
  - CC turns off Cloudflare email obfuscation, which would otherwise mangle the About mailto.

## 4. QA matrix (Phase 1 onwards; full run at cutover)

| Area | Check | Tool |
|---|---|---|
| Slider | Positions vs baseline, desktop 1505×880 + mobile 390×844, shots looked at | `check-slider.mjs --compare` |
| Pages | Card → page → logo/Esc/back, Close hint, touch hint | `check-close.mjs [--mobile]` |
| Addresses | `/`, `/about/`, `/penang/` direct + reload + back/forward + Cmd-click; old `#about` / `#work` / `#contact` | drive-headless steps |
| Resume | Opens from the menu and About; Esc returns to About; back; Close; Cmd-click → `/resume`; PDF download | drive-headless |
| Cards | Lissajous spin, pipeline, spiral hover halts on leave, clock spin into Penang, intro hover, Graas new tab | drive-headless + by hand |
| Keyboard / a11y | Tab order, focus rings, reduced motion, inert under the overlay | drive-headless |
| Browsers | Chrome, Safari (desktop), iPhone Safari (CC, on preview), Firefox | by hand |
| SEO | Head parity diff, robots, sitemap, llms.txt, JSON-LD validity, 404 status | `seo-sweep` |
| Perf | LCP/CLS/JS budgets on phone slow4g and desktop | drive-headless `--throttle` |
| Hygiene | 0 console errors; no `/public/`, CDN, `_lab` or smlxl URLs in `dist/` | grep on `dist/` |

## 5. Questions for CC (defaults in bold)

1. **Real URLs for About and Penang** (`designby.cc/about/`, `/penang/`): **yes** (shareable,
   indexable) or keep them as in-page only?
2. **Title on `/about/` and `/penang/`:** **the same title everywhere**, as you said, or a
   page-specific one such as "About | CC Teo…"?
3. **`/styleguide`:** **retire it and redirect to home** (it documents the old Space Grotesk
   look), or keep it?
4. **Old live links:** `/#about` and `/#contact` → **About page**, `/#work` → **home**. OK?
5. **Penang in the sitemap and `llms.txt`:** **About only**, or both?
6. **Share image `og-home.png`:** **keep it for now** and make a new one from the slider later,
   or make a new one before cutover?
7. **LinkedIn spiral card:** its design redraws smlxl's Instagram sticker (the content is yours).
   **Keep it** as your own take, or restyle it before going public? This and the layout and
   motion borrowed from smlxl (own code, written from measured mechanics) are the only origin
   traces left.

## 6. Threads (who does what)

PRs merge in order. A thread only runs while its inputs are merged.

| Step | Thread | Work | Runs alongside |
|---|---|---|---|
| 0 | me | Baselines, head and route snapshots, CC's answers | none |
| 1 | worktree agent "build" | PR 1 site build + tools | none (it's the base) |
| 2 | worktree agent "routes" | PR 2 addresses, 404, history | "seo" (different files: `main.js` vs `<head>` + `public/`) |
| 2 | worktree agent "seo" | PR 3 head, noscript, sitemap, llms.txt | "routes"; rebased after routes merges |
| 3 | worktree agent "perf" | PR 4 video, headers, budgets | none |
| 4 | 3 QA agents | Desktop, phone and SEO/perf sweeps of the PR 5 preview URL, report only | each other |
| 5 | me + CC | iPhone test on the preview, then "ship" | none |
| 6 | worktree agent "cleanup" | PR 6, after a quiet week live | none |

Every agent gets: CLAUDE.md, the `slider-page-transitions` skill, this plan, and the rule to
verify in motion against the baseline before reporting.
