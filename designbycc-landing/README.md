# designbycc landing — interaction study

Standalone recreation of the origin site's landing page (see research spec): intro choreography, focus-line
slider physics, live clocks, and all measured tokens/typography. Private design study —
**not linked, not deployed** (kept outside `public/` on purpose: media is hotlinked from
the origin site (named in the research spec) and its copy appears in the cards, which is fine to study locally but not
to republish).

Spec and derivation: `research/2026-07-18-smlxl-landing-recreation.md`.

## Run

```sh
python3 -m http.server 4173 --directory designbycc-landing
# open http://localhost:4173/?fresh=1  (cache-bust query — Chrome serves stale HTML otherwise)
```

## Page transitions

Card clicks reproduce the origin's barba `sliderTransition` (spec in the research doc):
stage clears sideways + clicked card centers on dual custom eases (0.84s), then the
current page conveys up and away while the target page slides up from below with the
body palette washing to the target's colors (1.2s power3.inOut, overlapping from 0.6s).
All 26 card destinations exist as facsimile "page layers" (real palette + hero media +
title; full page content intentionally out of scope). Logo/back run the origin's default
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

## Fidelity notes / substitutions
- **Wordmark**: origin's SVG logo is their trademark artwork; rendered here as
  live text (now in Switzer).
- **Slides 37/38**: origin embeds bespoke vector artwork ("10 years" numerals, circular
  badge) as inline SVG; simple same-color/same-size stand-ins are drawn instead.
- **Excluded**: cookie banner (third-party Complianz plugin), analytics, IE shims —
  not part of the design.
- All JS/CSS is our own implementation of the measured mechanics (timings, eases,
  clamps, math documented in the research spec), not the origin's code.
