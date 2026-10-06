---
name: slider-page-transitions
description: How the designbycc-landing slider opens a card into a full page and comes back (PageTransitions in main.js), and the recipe for adding, restoring or hiding a card + its page without breaking the slider. Use when CC wants a card to open a page, adds a new write-up/content page, brings back a hidden or removed card, wants to hide cards, or when a card click / back / logo transition misbehaves.
---

# slider-page-transitions

The landing study (`designbycc-landing/`) has two layers of motion: the **slider engine**
(`SliderEngine` desktop, `ResponsiveSliderEngine` mobile) and **page transitions**
(`PageTransitions`, all in `main.js`). This skill is the working knowledge for the second, and
for the slider rules that page work keeps tripping over. Exact timings and easing curves are in
`research/2026-07-18-smlxl-landing-recreation.md` § "Card-click page transition".

## Start here (rules + map)

**Rules. Breaking any of these has broken the page before:**
1. Every card exists **twice**: `.js-c-slider` (desktop) and `.js-c-slider-responsive` (≤730px).
   Change both, in the same position.
2. Inside a slider container, slides must be **direct siblings with nothing between them** (no
   `<template>`, no wrapper divs). Comments are fine.
3. A card opens a page only when its `href` **exactly** equals a `.page-layer`'s `data-url`
   (absolute URL).
4. Serve from the **repo root**, never from `designbycc-landing/`.
5. Verify with `check-slider.mjs` (below) before and after. Counting slides is not verification.

**Where things live (search by name; line numbers drift):**

| What | Where |
|---|---|
| Slider maths (desktop) | `class SliderEngine` in `designbycc-landing/main.js`; neighbour pinning in `pinToNeighbour()` |
| Slider (mobile) | `class ResponsiveSliderEngine` (same file) |
| Card → page binding | `PageTransitions.bind()` + `layerFor()` |
| Card → page motion | `PageTransitions.sliderToLayer()` (desktop), `fadeToLayer()` (mobile / history) |
| Page → home motion | `PageTransitions.fadeHome()` (logo, browser back) |
| Timings + easing curves | top of `PageTransitions` (`PT_*`, `pt-position`, `pt-scale`) and `research/2026-07-18-smlxl-landing-recreation.md` |
| Pages | `<section class="page-layer" …>` blocks near the end of `designbycc-landing/index.html` |
| Worked example of a card + own page | the PENANG clock card + `page-layer--penang` (#57, #60) |

## Current state (2026-10-06; re-check with the listing command below)

Desktop order (mobile is the same minus the spacer). **Ours** = CC's own content; the rest still
hotlink SMLXL media and copy.

| # | Card | Ours? | Click |
|---|---|---|---|
| 1 | Intro: "Hello!" + sentence (`.c-intro`) | ✅ | About layer (still SMLXL's) |
| 2 | Trustana montage video, bare (`--bare`) | ✅ | inert |
| 3 | Lissajous "CC" (`lissajous-c.js`) | ✅ | inert, click spins |
| 4 | Pipeline bottleneck (`pipeline-bottleneck.js`) | ✅ | inert |
| 5 | ADC awards news | | external |
| 6 | LinkedIn spiral (`linkedin-spiral.js`) | ✅ | linkedin.com, new tab |
| 7–8 | HotDog, You've Got to Have Freedom | | SMLXL layers |
| 9 | Graas × Trustana news (black card) | ✅ | graas.ai, new tab |
| 10–12 | Buen Dolor, Economist, theatre | | SMLXL layers |
| 13 | PENANG clock: hands spin on click | ✅ | **Penang page** (`page-layer--penang`) |
| 14–17 | Vermouth 1917, ADC judge news, shower thoughts, BARCELONA clock | | SMLXL |

List it yourself: `python3 .claude/skills/slider-page-transitions/list-cards.py [--mobile]`

## Patterns already built here (copy these, don't reinvent)

- **Card → own page:** the Penang clock + `page-layer--penang` (#57, #60). Live data on a page:
  `startLocalTimes()` / `.js-local-time[data-timezone]`.
- **Card → external site in a new tab:** an href with no matching `.page-layer` isn't
  intercepted, so add `target="_blank" rel="noopener"` (LinkedIn spiral #54, Graas news #64).
- **News card variants:** `c-slider-card--light` or `--black`. Black + headline + date only (no
  `a-content-h6` body) is the Economist/Graas look. Thumbnail at the card's own
  `--aspect-ratio`.
- **Media-only card (no titles or gradient):** `c-slider-project--bare` +
  `clip-path: inset(0 round var(--border-radius))` corner guard (#55).
- **Intro card:** `.c-intro` = whole card is the link (`aria-label="About me"`); "Hello!" is a
  sibling `div` (not a span inside the `h1`; `freezeLineBreaks` only freezes leaf nodes); round
  arrow `.c-intro__go` (#59). **Line reveal on first load:** `maskIntroLines()` +
  `revealIntroLines()` in `main.js` (#66). Desktop splits on the frozen `<br>`s, mobile measures
  word `offsetTop`.
- **Per-card motion on click that keeps the page transition:** add a second click listener
  (the clock's `spin()` via a registered `--spin` angle, #57). `sliderToLayer` animates the
  real card, so it stays visible.
- **Live SVG cards:** see `swap-study-media` § "Live SVG media".

## Removing or reordering cards

- **Remove:** delete the whole slide block in **both** trees. Script it: match each card by a
  unique copy string and assert it hits **exactly twice** (one per tree) before deleting (#63).
  Old markup stays in git history; name the commit in the devlog.
- **Reorder:** move whole slide blocks, both trees, same position (#65).
- Then run `check-slider.mjs` (below).

## How a card opens a page

1. **Binding is by URL match.** At boot, `PageTransitions.bind()` takes every
   `.js-c-slider a[href]` and `.js-c-slider-responsive a[href]` and looks up
   `layerFor(a.href)`: the `.page-layer` whose `data-url` equals the anchor's **resolved,
   absolute** href (hash and trailing slash ignored). Match → the click is intercepted. No match
   → it's a normal link (external cards like LinkedIn rely on this).
2. **The page is a `.page-layer` section** near the end of `index.html`:
   ```html
   <section class="page-layer" data-url="https://www.designby.cc/penang/" data-namespace="penang"
            data-bg-color="#141414" data-color="#f2f2f2">
     <div class="page-layer__hero" style="--aspect-ratio: 66.68%;"><img src="../public/media/…" loading="lazy" …></div>
     <div class="page-layer__content"><h1 class="a-content-h2">Title</h1>…</div>
   </section>
   ```
   `data-namespace` becomes the URL hash (`#penang`); `data-bg-color` / `data-color` are the
   palette the body washes to. Layers are `display: none` until `.is-active`.
3. **Desktop click → `sliderToLayer(card, layer)`** (base 1.2s):
   - Step 1 (0.84s): the other cards exit sideways, fading. The clicked card slides to the
     viewport centre on `pt-position` while its scale normalises on `pt-scale`.
   - Step 2 (1.2s, starting at 0.6s, power3.inOut): the card shrinks to 0.2, the home view
     conveys up and away, the layer conveys up from below, and the palette washes
     (`colorWash`, 0.96s).
   - It animates the **real card element**, not a clone, which is why per-card effects (the
     Penang clock spin) stay visible during the expand.
4. **Mobile (≤730px), browser back/forward → `fadeToLayer`**: fade out 0.5s power3.out, then
   palette wash + fade in 0.5s power2.inOut.
5. **Coming home** (logo click, or browser back from a layer) → `fadeHome`: layer fades out, then
   the slider re-enters with a reverse stagger (0.5s power1.inOut, i×0.05) and input re-attaches.
   Home history is `location.pathname`; a layer pushes `#namespace`.
6. **Guards:** `busy` blocks overlapping transitions; `engine.dragTravel > 5` makes a drag
   not count as a click. Intercepted clicks must always `preventDefault`, even when busy, or a
   click mid-transition falls through to real navigation.

## Recipe: add a card that opens its own page

1. Add the card slide in **both trees** (`.js-c-slider` and `.js-c-slider-responsive`), same
   position in each. Copy an existing slide's markup for the card type you want.
2. Give both anchors the same href: an absolute URL you control, e.g.
   `https://www.designby.cc/<slug>/`. It doesn't have to exist (the study isn't deployed), but if
   the study ever ships it needs a real route.
3. Add one `.page-layer` with `data-url` = that exact URL, a `data-namespace`, and a palette.
   Media goes in `public/media/`, referenced as `../public/media/…`, with `loading="lazy"`
   (layer images load only when shown). Set the hero box `--aspect-ratio` to the image's native
   ratio (`height / width × 100`).
4. Need live data on the page? Follow `startLocalTimes()` (the Penang page's `.js-local-time`).
5. Verify (see below), then devlog plus the `parity-check` divergence register.

## Hiding / restoring cards: the rule that broke #58

**Never put any non-slide element between slides inside a slider container.**
`SliderEngine.pinToNeighbour()` positions each entering slide against
`slide.previousElementSibling`. #58 wrapped hidden slides in `<template>` inside the container;
every slide after one got a template as its "neighbour", and the slider piled up along the
bottom. (Comments are fine; elements are not.) Reverted in #62.

Safe ways to hide a card:
- **Move the slide out of the container**: one `<template class="js-hidden-cards">` *after* the
  slider container (per tree) holding the parked slides. To restore one, move its slide back
  into place in **both** trees.
- Or teach the engine to skip non-slides (use the previous `.js-c-slider__slide`, not
  `previousElementSibling`). That's an engine change, so verify the whole slider.
- Removing outright (#52) is also safe, but loses the code.

A parked card's page layer can stay in place: an unbound layer is harmless, and it's ready when
the card comes back.

## Verify: positions, not counts

Counting slides and reading the console **did not catch #58**. Use the bundled script, which
steps through the whole slider and fails on overlapping cards or moved cards:

```bash
python3 -m http.server 8081                       # repo root, in the background
S=.claude/skills/slider-page-transitions/check-slider.mjs
node $S --save /tmp/slider-before.json            # on the last good state, before your change
# …make the change…
node $S --compare /tmp/slider-before.json --shots /tmp/slider-shots   # then LOOK at the shots
node $S --mobile                                  # 390×844, mobile tree
```

- Exit code 1 on any overlap or moved card. A **moved** card is expected only for cards whose
  size you changed on purpose (and everything after them).
- Proven 2026-10-06: PASS on #57, FAIL (61 problems) on #58's broken layout.
- Desktop size defaults to 1505×880 (CC's real window). Headless needs no Chrome extension; a
  hidden real Chrome window freezes rAF/GSAP (`verify-motion`).
- Also click through by hand or script: card → page (URL hash, colour wash, hero loads) →
  logo → home (cards stagger back, scrolling works).
- Chrome caches `styles.css` from `python3 -m http.server`: hard-reload, or use a server that
  sends `Cache-Control: no-store`.
