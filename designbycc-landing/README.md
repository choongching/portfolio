# designby.cc: the slider site

The site at https://www.designby.cc/: the card slider, its pages (About, Penang) and the resume
overlay. It began as a recreation of the origin site's landing page (spec:
`research/2026-07-18-smlxl-landing-recreation.md`) and was converted card by card to CC's own
content; no origin media or copy remains. Cutover plan: `research/2026-10-12-site-cutover-plan.md`.

Cards, pages and transitions: the `slider-page-transitions` skill. Media: `swap-study-media`.

## Run

Built by Vite (`vite.site.config.ts`: root is this folder, `public/` is copied to the site root).

```sh
pnpm dev:site       # http://localhost:8080/ (and on the LAN for phones)
pnpm build:site     # → dist/
pnpm preview:site   # build, then serve dist/ the way Cloudflare Pages does: http://localhost:8788/
```

- Scripts are one module, `site.js` (GSAP from npm first, then the page scripts in order).
  Stylesheets and fonts are fingerprinted into `/assets/`.
- Files in `public/` are referenced by root path: `/media/<name>`, `/trustana-poster.webp`,
  `/resume`.
- Pages have real addresses: `/about/` and `/penang/` (the build writes a copy of `index.html`
  at each, with its own canonical URL). New page: add its slug to `PAGES` in
  `vite.site.config.ts`.
- Only `index.html` and `404.html` are built. Scratch files here (`_*.html`, `_penang/`) never
  ship, and HTML comments are stripped from the built pages.
- Without JavaScript, `public/noscript.css` shows the About page as a plain document.

## Page transitions

Card clicks reproduce the origin's barba `sliderTransition` (spec in the research doc):
stage clears sideways + clicked card centers on dual custom eases (0.84s), then the
current page conveys up and away while the target page slides up from below with the
body palette washing to the target's colors (1.2s power3.inOut, overlapping from 0.6s).
Card destinations are "page layers" (About, Penang). **Cards without an `href` are inert**:
`bind()` in `main.js` selects `a[href]`. Logo/back run the origin's default
transition home — leave fade, color-wash beat, then the slider's reverse stagger re-entry
(0.5s power1.inOut, i×0.05) before input reattaches. External (non-origin) card links
navigate normally, as on the origin.

## Styling (restyled 2026-07-19)

The visual system is no longer the origin site's own — it was swapped to the **curated.supply**
token system (light monochrome: bg `#f2f2f2`, surfaces `#fff`, ink `#141414`, secondary
`#737373`; **Switzer** (Fontshare FFL) for display/body + **Geist Mono** (SIL OFL) for labels, local variable woff2s in `fonts/`; radii
8/16px; signature ease `cubic-bezier(.44,0,.56,1)`) per
`research/2026-07-19-curated-supply-styleguide.md`. All UX/mechanics (engine math, intro,
transitions) are unchanged; page-layer washes are normalized to an ink inversion
(`#141414`/`#f2f2f2`); labels/metadata are Geist Mono sentence case. The origin's palette
and Supreme type survive only in the research specs.

## Pages

An active page layer is its own fixed, full-viewport scroll container; `body` keeps
`overflow: hidden` so the slider engine never re-measures around a document scrollbar. Layer
videos load and play on intersection rather than at boot.

## Fidelity notes / substitutions
- **Wordmark**: origin's SVG logo is their trademark artwork; rendered here as
  live text (now in Switzer).
- **Excluded**: cookie banner (third-party Complianz plugin), analytics, IE shims —
  not part of the design.
- All JS/CSS is our own implementation of the measured mechanics (timings, eases,
  clamps, math documented in the research spec), not the origin's code.

## Working on cards and pages

How cards open pages, how to add, hide or restore a card, and how to verify the slider:
`.claude/skills/slider-page-transitions/SKILL.md` (with `check-slider.mjs`).
