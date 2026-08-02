# smlxl.company — project page: transition arrival, content, and exit

Spike date: 2026-08-02. Target: `https://smlxl.company/project/spatial-2025/`, reached by clicking the
4th slider card on `https://smlxl.company/`. Companion to
`research/2026-07-18-smlxl-landing-recreation.md` (which covers the slider engine and the transition
choreography itself). This document covers the part that study left out: **what the destination page
actually is, how its content gets on screen, and how you leave it.**

Method: bundle extraction (`app.bundle.js` → 20 unminified webpack modules), `app.css` token/rule pull,
static DOM skeleton of the fetched page, and live observation in Chrome. Extracted source is reference
only — every line we ship is our own.

---

## 1. Stack, on this page

| Library | Role on the project page |
|---|---|
| **barba.js** (`@barba/core`) | SPA page swap. Fetches the next page's HTML, extracts `main[data-barba="container"]`, appends it, runs the transition, removes the old container. |
| **GSAP + CustomEase** | The transition timelines. Nothing else on the page is GSAP-animated. |
| **Lenis** (`@studio-freight/lenis`) | Smooth scroll. Destroyed and recreated on every page change, `lerp: 0.9`, `wrapper: document.body`. |
| **ScrollTrigger** | One trigger only (`general-header-scroll`), and it toggles two classes that **have no CSS rules** — dead code. |
| **IntersectionObserver** (native) | Lazy-loads and plays/pauses every autoplay video. This is the only per-component JS on the page. |
| Swiper | Present in the bundle, **not used** on this page. |

Durations are class constants (`PSPageTransitions`):
`DURATION_PT_LEAVE = 0.5`, `DURATION_PT_ENTER = 0.5`, `DURATION_PT_SLIDER = 1.2`,
`DURATION_PT_RELATED = 1`, `DURATION_PT_PROJECTS = 1`, `DURATION_PT_FILTERS = 0.7`.

---

## 2. The finding that matters most

**There is no content-reveal animation. None.**

I went looking for a stagger, a fade-up, a SplitText line reveal — the things this kind of site usually
has. They are not there:

- `atoms.js` registers exactly one atom: `a-clock`. `modules.js` registers an empty list.
- `components.js` registers 8 components; the only one on a project page is `c-video`.
- There is no `a-text.js`, `a-content.js`, or `c-image.js` — those are pure markup + CSS.
- Every component class exposes an `__applyAnims()` hook and `c-video`'s is **an empty function body**.
- The `PREPARE_ANIMS` / `APPLY_ANIMS` events are dispatched but nothing meaningful listens.
- `SplitText` appears 4× in the bundle and every occurrence is a **commented-out import**.

Confirmed live: scrolling to the title block shows fully-opaque text with no transform and no inline
style. The content is simply *there*, at rest, the instant the container mounts.

So "showing the content" is entirely:

1. the **conveyor** — `next.container` slides up from `+innerHeight` to `0` while the body palette washes; and
2. **plain scrolling** afterwards, with videos lazily loading as they intersect.

That is very good news for us: the expensive-looking part is the transition we already built. The
content layer is layout, not motion.

---

## 3. What the destination actually is

barba fetches the URL and lifts out this element:

```html
<main data-barba="container"
      data-barba-namespace="spatial-2025"
      data-bg-color="#a1a1a1"
      data-color="#000000">
```

The palette that the color wash tweens toward lives on that element as `data-bg-color` / `data-color`
— the exact same contract our `.page-layer` sections already use.

Inside, the structure is flat and repetitive:

```
main[data-barba=container]
└ .ps-main > div > div > section.o-main.s-template-single
  └ .all-components
    └ .o-container.o-container--full          ← flex-wrap 12-col grid, row-gap 20px
      ├ .c-video.is-autoplay.o-col-12@lg.ps-component--1     ← hero, --aspect-ratio: 1.777
      ├ .c-content.o-col-10@lg.o-col-push-1@lg.ps-component--2  ← eyebrow + h1 + body
      ├ .c-video …--3, …--4
      ├ .c-content …--5
      ├ .c-image.o-col-4@lg …--6
      ├ .c-image.o-col-8@lg …--7
      … 46 ps-components in total …
    └ .c-related.has-4-posts                  ← 4 next-project cards
```

Three block types, repeated. Every block is a grid column (`o-col-N@lg/@md/@sm`, optional
`o-col-push-N`), and vertical rhythm comes from the container's `row-gap: 20px` — there are **no
margins between components on desktop** at all.

### `.c-content` — the title/body block

```html
<div class="c-content | o-col-10@lg o-col-push-1@lg | ps-component--2 | vertical-align--center">
  <div class="c-content__inner | c-content__inner--pb-40 | c-content__inner--pi-0">
    <div class="a-content__content">
      <div class="a-content-h5" style="text-align:center">SPATIAL FESTIVAL 2025</div>
      <p data-linebreak></p>
      <h1 class="a-content-h1" style="text-align:center">Campaign for a space embodied listening festival</h1>
      <p data-linebreak></p>
      <p style="text-align:center">Campaign for Spatial's second edition, …</p>
    </div>
  </div>
</div>
```

Notes:
- Spacing inside prose is `<p data-linebreak>` — an **empty paragraph used as a spacer**, `height: 20px`
  under 731px and `30px` above. Crude, but it's the whole vertical rhythm of the copy.
- `text-align: center` is a per-element inline style from the CMS, not a class.
- `c-content__inner` is `max-width: 1300px; margin-inline: auto`, and the `--pb-N` / `--pi-N` modifiers
  are padding-block / padding-inline steps that **scale down between breakpoints**
  (`pb-40` → 40px ≥1301px, 13.33px 731–1300px; `pb-60` → 60/20; `pb-80` → 80/26.67 — i.e. ÷3 on mid).

### `.c-video` — every video block

```html
<div class="c-video is-autoplay | o-col-12@lg | ps-component--1" style="--aspect-ratio: 1.7777777777778">
  <div class="c-video__media">
    <video loop playsinline autoplay muted data-video-url="…Spatial-2025_Vid-1.mp4">
      <source src="…Spatial-2025_Vid-1.mp4" type="video/mp4">
    </video>
    <div class="c-video__image"></div>
    <svg class="c-video__icon">…play triangle…</svg>
  </div>
</div>
```

- `.c-video__media`: `aspect-ratio: var(--aspect-ratio)`, `border-radius: var(--border-radius)`,
  `overflow: hidden`, and a **skeleton fill** of `color-mix(in srgb, var(--color-text) 30%, transparent)`
  — that grey block you see before the video decodes is deliberate, and it's derived from the washed
  ink color, so it always matches the page palette.
- `.is-autoplay .c-video__icon { display: none }` — the play triangle is only for non-autoplay videos.
- `is-playing` fades the poster out and scales the icon to 2 over `0.3s ease-in-out`.

The `c-video` JS is small and worth copying in spirit:

```
lazyLoadVideos()  // only if .is-autoplay
  IntersectionObserver(entries):
    intersecting → video.src = dataset.videoUrl; video.load(); video.play()
    leaving      → video.pause()
```

Note it sets `video.src` even though a `<source>` already exists — `src` wins, and the `<source>` is
just the no-JS fallback. `__destroy()` disconnects the observer.

### Design tokens (origin)

`--container-width: 1700px`, `--padding-bottom-default: 40px`, `--border-radius: 5px` (→ `10px` ≥731px),
`--grid-gutter: 20px`, `--container-padding: 40px` (→ `20px` ≤730px), `--total-columns: 12` (→ `6` ≤730px).
Type: `a-content-h1` 72px/1.2 (30px mobile), `h4` 30px, `h5` 15px uppercase 0.1em, body `p` 30px/41.4px.

**We do not adopt these.** Our study is on the curated.supply system (Switzer, `#f2f2f2`/`#141414`,
radii 8/16). The origin numbers are recorded here as *proportions to translate*, not values to paste —
same as the July 19 restyle did for the slider.

---

## 4. Enter sequence, end to end

```
click card
├ beforeLeave   record scrollY; DISABLE_VS (lenis.stop); body.is-changing-page;
│               flag sliderTransitioning
├ leave         desktop + trigger inside .js-c-slider → return early, NO fade
│               (the slider transition owns the leave)
├ afterLeave    destroy all components (observers disconnected)
├ beforeEnter   swap <body class> from the fetched HTML; swap og: meta tags;
│               re-init every component on the new container; START_FUNCS →
│               lenis destroyed + recreated + scrolled to 0
├ enter         → sliderTransition(data)      ← the 1.2s choreography we already have
└ afterEnter    remove is-changing-page; ENABLE_VS (lenis.start);
                play all video[autoplay]; scrollIntoView if location.hash
```

`sliderTransition` itself is byte-for-byte what our `main.js:477` already implements — I re-verified
every number (step1 `×0.7`, pause `×−0.2`, step2 `×1.0`, both CustomEase paths, the `/visualScale`
divisor, the `bottom right` → `bottom 50%` origin transfer, `scale → 0.2`, `power3.inOut`). The only
structural difference is the last two lines of its `onComplete`:

```js
current.container.remove();
gsap.set(next.container, { position: '', top: '' });   // ← the fixed→flow handoff
```

That single line is the "content is now a real page" moment: the container stops being a fixed overlay
and becomes normal document flow, at which point the body is tall and scrollable.

**Header:** stays `position: fixed; z-index: 100; pointer-events: none` throughout, and takes its color
from `var(--color-text)` — so the color wash flips the wordmark to the destination's ink for free. The
`has-transform` / `is-alt` classes ScrollTrigger toggles have **no matching CSS**; the header never
hides. Don't recreate that dead code.

## 5. Exit

Two exits exist, and only one is in scope for us:

**a) Logo / menu → default transition.** `leave` fades `current.container` `autoAlpha 1→0` over
`0.5s power3.out` and removes it; `enter` runs `colorTransition` + `next.container` `autoAlpha 0→1`
over `0.5s power2.inOut`, both at `t=0`. Landing back on home, the slider runs its `sliderAnimated`
re-entry stagger. **We already have this** (`fadeHome`, `main.js:612`).

**b) `.c-related` card → `relatedTransition`.** A separate ~190-line mechanic: pins the current
container at `top: -scrollBeforeTransition`, grows the related strip's `--max-height` to fill the
viewport, conveys the footer and section up by the delta, then hands off to the next container. It has
its own hardcoded footer palette (`#FFF57D` on `#978D80`). Out of scope — our layers have no related
strip. Recorded here so we know what we're choosing not to build.

There is **no back button** on the origin. You leave via the logo, the menu, or browser back.

---

## 5b. Mobile — a different DOM, not a different stylesheet

Established 2026-08-02 from device-emulated screenshots plus a user-agent-switched fetch.

**The origin serves entirely different markup to mobile user-agents.** Fetching `/` with a Pixel 7 UA
returns `c-slider-responsive` (281 class hits, 39 slides) and **zero** `js-c-slider__slide`; the desktop
fetch is the exact inverse. This is why no amount of CSS reading explained the vertical layout — there
is no `max-width: 730px` override for `.c-slider__container` anywhere in `app.css`, because the desktop
slider simply isn't in the mobile document. The two components mirror each other class-for-class
(`__slider / __container / __slide / __item / __item-inner`, with `-project / -card / -image / -text`
variants) and carry the same 39 cards.

The interaction is **not** a static stack. It is the vertical analogue of the desktop focus line:
native page scroll, with every slide scaled by a Gaussian of its distance from the viewport centre.

**Layout**

```
.c-slider-responsive__container  flex column; gap 20px; margin-inline auto;
                                 max-width 600px; padding-block 25svh
.c-slider-responsive__slide      transform: translateX(calc(50svw - 50% - var(--container-padding)))
.c-slider-responsive__item       transform-origin: top left
```

**Motion — `update()`, run on every scroll event**

```
positionNormalized = (slideY + slideH/2 − windowHeight/2) / windowHeight
gaussian(x)        = 0.7 · exp(−(2x)²) + 0.3        // 1.0 at centre, floor 0.3

slide  → width: 100·scale %,  height: dataset.height · scale
item   → scale: scale,        width: 100/scale %     // counter-scale, as on desktop
tween duration 0.15s (timeOffset)
```

Container compensation, which is what stops the stack collapsing upward as cards shrink: slides above
centre accumulate `totalDiff += (1 − scale) · height`, then `totalDiff *= 0.8` (sensitivity), and the
container gets `y: totalDiff` **and** `paddingBottom: totalDiff + containerPadding`.

**Intro:** container starts at `y = innerHeight · 0.75` with scroll disabled; tweens `y → 0` over
**1s power3.inOut**, calling `update()` every frame, then enables scroll.

**Resize:** ignored entirely unless `|Δ innerHeight| ≥ 150` — a deliberate guard against the mobile URL
bar collapsing. On a real resize it clears width/height/scale, re-measures, strips `white-space`, and
re-runs the line-break freeze.

**Clock normalisation:** `--font-size = 61 · min(588, width) / 355`.

**Page transitions:** `getIsSM()` routes mobile to the default fade, never `sliderTransition` — our
`bind()` already branches this way (`main.js`), so no change needed there.

Card chrome differs from desktop too: project cards get a `linear-gradient(180deg, rgba(0,0,0,.5),
transparent 50%)` scrim with titles absolutely positioned top-left (`max-width: 250px`, `padding:
14px 12px`, `gap: 4px`); news cards use `padding: 14px 14px 24px` with a `14px` flex-column gap.

## 6. Implications for our build

Our `.page-layer` sections are static markup already in `index.html`, so we do not need barba's fetch
model to have content — but four things in our current code will actively fight a scrollable content
page. These are named precisely in the plan below (§ Part A–E of `docs/plan.md`):

1. `body { overflow: hidden }` (`styles.css:78`) — global, kills all scrolling.
2. `loadAllImages()` (`main.js:748`) blocks the home intro on **every** `img[src]` in the document,
   layers included.
3. `freezeLineBreaks()` (`main.js:68`) sets `white-space: nowrap` — it is scoped to the slider track
   today and must **stay** scoped there.
4. `document.querySelectorAll("video[autoplay]")` at boot (`main.js:818`) would eagerly start every
   layer video.

None of these is hard to fix; all four are one- or two-line changes. The real work is grid CSS plus
content markup.
