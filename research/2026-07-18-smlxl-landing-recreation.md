# SMLXL.company landing page — full recreation spec (July 18 2026)

Research pass for the standalone recreation in `smlxl-landing/`. Derived from the live site's
unminified webpack bundle (`app.bundle.js ver=1784278572`, module extracts in scratchpad
`smlxl-src/`), prettified `app.css ver=1775137209`, live HTML, and browser observation.
Extends `research/2026-07-16` / `07-17` spikes and `project_smlxl_replica` memory — the slider
engine math there was re-verified against the current bundle and is unchanged
(wheel clamp ±70, drag clamp ±140, friction 0.95, cosine shaping, 3-pass update,
`--initial-scale = innerWidth/2048`, ×1.5 ≤1300px, ×2 ≤730px).

## Stack (role on the homepage)

| Library | Role on this page |
|---|---|
| GSAP + CustomEase + ScrollTrigger | intro tweens, header scroll classes, ticker (`lagSmoothing(0)`) |
| Lenis (`lerp: 0.9`, wrapper `body`) | smooth scroll (inert on home — page doesn't scroll vertically; slider owns wheel) |
| barba | page transitions to other pages (out of scope for landing-only build, leave anims kept) |
| swiper | present in bundle, unused on home |
| WordPress theme `smlxl` | markup source |

## Design tokens (`:root`)

- `--font-a: "SupremeLLWeb-Regular", sans-serif` — **Lineto Supreme LL**, domain-licensed to
  smlxl.company only ("strictly prohibited to… use these fonts in any other media").
  Recreation uses Fontshare **Supreme** (free webfont) as the licensed stand-in; every size/
  spacing setting kept exact.
- Colors: white `#fff`, black `#000`, grey-dark `#1d354d`, grey-light `#929292`,
  grey-lighter `#e1e1df`, background `#943821`, background-alt `#652114`, yellow `#ecec00`,
  blue `#7f9ad1`, orange `#f80`, pink `#ff96d9`.
- Homepage palette (inline on `<body>`): `--color-text: #ff96d9`, `--color-bg: #652114`.
- `--container-width: 1700px`; grid: 12 col / 20px gutter / 40px container padding
  (6 col / 20px / 20px ≤730px); `--border-radius: 10px` (5px ≤730px).
- Transitions: `--t-generic: 0.5s ease-in-out`, `--t-fast: 0.2s ease-in-out`.

## Type scale (`.o-font-*`, weight 400 throughout)

| Class | ≤730 | 731–1300 | ≥1301 | Extras |
|---|---|---|---|---|
| h1 | 30px | 72px | 72px | lh 1.2 |
| h2 | 12px/16px | 25px | 30px | tracking 0.2em |
| h3 | 18px | 26px | 30px | lh 1.38 |
| h4 | 24px | 26px | 30px | |
| small-text | 14px/18px | 15px/1.5 | — | |
| small-title | 12px/16px | 15px/1.5 | — | tracking 0.1em, uppercase |
| clock | 61px | 101px | — | tracking −0.1em, lh 1 |

Header: 14px→15px/1.5 ≥731px.

## Intro sequence (first visit, home)

1. **Loader** `.b-loader`: fixed full-screen `--color-bg`; 60px spinner ring
   (2px transparent border, top border `--color-text`, `rotate 0.6s linear infinite`).
   Shown until all `img[src]` have loaded → on home it's removed with **duration 0**
   (elsewhere 0.5s power2.inOut fade).
2. **Logo**: pre-set scaled so the 46px-wide wordmark spans `innerWidth − 2·rect.x`
   (transform-origin top left; `force3D: false` for Safari sharpness). On loader-out it tweens
   to scale 1 over **1s**, delay 0.2, `CustomEase("M0,0 C0.83,0 0.17,1 1,1")` (position rushes,
   lands soft). Mobile (≤900px menu breakpoint): also vertically centered
   (`y = innerHeight/2 − rect.top`, `yPercent: −50·scale`), ease power3.inOut, no delay.
3. **Menu**: opacity 0 → 1, 0.7s power3.inOut, delay 0.5 (desktop only).
4. **Slider**: pre-set `x: innerWidth, scale: 0.5` (origin bottom left), container gets
   `.is-ready` (opacity 1), then tween to `x:0, scale:1`, **0.7s power1.out, delay 0.5**;
   input listeners attach only onComplete. `sliderAnimated` flag then set — the per-slide
   reverse stagger (`--scale` 0→current, `xPercent` −50→0, 0.5s power1.inOut, i×0.05,
   rightmost-last) plays only on subsequent barba navigations, not first load.

Overlap is the feel: logo shrink (0.2→1.2s) and slider fly-in (0.5→1.2s) run together.

## Slider (re-verified, unchanged from prior spike)

- Container: `inline-flex`, `align-items: end`, gap 20px, `height: 100dvh`,
  `padding-block: 30px`, `padding-right: 30px`; slider fixed full-viewport,
  origin bottom-left, `overflow: hidden`.
- Focus line at `p = scrollLeft/maxScroll`: right of line scale 1→0.3 shaped
  `-(cos(πx)-1)/2`, pinned to prev sibling right edge + 20px; left of line `--scale` 1→0
  (item `scale: max(0, var(--scale))`, origin bottom-right), freed width accumulates as +x.
- `--item-width` per variant: project-horizontal 1339, project-vertical 497,
  text-horizontal 1463, text-vertical 460, card-vertical 443, card-horizontal 669, clock 589.
  Item width = `--item-width × --initial-scale`; inner counter-scales
  (`transform: scale(is)`, `width: 100%/is`); height set in JS from `data-initial-height × scale`.
- Wheel: `deltaY||deltaX` clamped ±70; drag: delta clamped ±140, momentum ×0.95/frame until <0.5;
  update called explicitly after every scrollLeft write (Chrome quirk).
- Text-slide line breaks frozen via word-span measurement + injected `<br>` + nowrap.

## Slide inventory (39, in order)

s0 spacer · s1 text-horizontal (mission → /about/, blue `#7f9ad1` bg, green `#9dffb2` text,
padding 30/75/30/30, gap 210) · s2/s3/s5/s7/s9/s16/s20/s31/s34 news cards orange `#f80`
· s24/s26/s30 editorial cards black · s4 SPATIAL h · s6 Houseplant h · s8 D'Arbequina v
· s10 UDRA v · s11 Midnight×HotDog v · s12 image (site IG) · s13 image HotDog gif
· s14 Escola v · s15 BCN Xmas lights h · s17 Hyundai Cards h · s18 Tour de France v
· s19 MAGENTA h · s21 ORIKA h · s22 Hic&Nunc v · s23 Buen Dolor h · s25 Tantarantana v
· s27 P&T Knitwear v · s28 clock black NY (`data-offset="-5"`) · s29 Go Human h
· s32 Lil Yatchy h · s33 image 1917 gif · s35 text-vertical shower-thought (green bg, gap 148)
· s36 clock grey-lighter Barcelona (`data-offset="1"`) · s37/s38 images (About/Projects links).

Cards: radius, `padding: 18px 18px 30px`, gap 18, inner content gap 8.
Projects: white titles over `linear-gradient(180deg, rgba(0,0,0,.5), transparent 50%)`,
titles padded 30px, gap 8; media bleeds 2px (`inset −2px`); video absolute cover, `<source>`,
autoplay muted loop playsinline preload=metadata, played on after-enter +
IntersectionObserver pause/play. Clock slides: title centered 32px above circle.

## Clock (`a-clock`)

CSS-var clock, update every 1s: `hour = h%12·30 + m·0.5` deg, `minute = m·6 + s·0.1` deg;
offset = `(localUTCOffset + data-offset)·3600000`. Numbers 1–12 at
`rotate(n·30deg) translateY(−size·0.37·clock-scale)`, 101px, tracking −0.1em, color red
(inherits slide color via `--color-*` in clock slides — black card: white handles, red numbers).
Handles white, width 10px, hour h=size·0.28, minute h=size·0.44, origin 50%/100%,
offset `translateY(15px·scale)`. In slider: `--size = item-width × initial-scale`, scale forced 1.

## Header

Fixed, `justify-content: space-between`, padding 40px (25px/20px ≤730px), `pointer-events: none`
(links/logo re-enable), color `--color-text`, transitions `transform/color var(--t-fast)`.
Logo SVG 46px wide, fill `--color-text`. Menu gap 30px. Scroll (non-home pages):
past 100px down → `.has-transform` + `.is-alt`; up → removed.
Mobile ≤900px: plus button (2 svg rects, 40px hit-area :after), menu = fixed full-screen
pink `#ff96d9`, links 60px `#943821`, column, centered; open: body `.is-menu-open`,
button `rotate(45deg) scale(-1)` 0.2s, items `scale 0→1, 0.4s cubic-bezier(0.44,0.36,0,1)`,
delays 0.1s·n. No hover effects on desktop menu/cards — the physics is the micro-interaction.

## Card-click page transition (`sliderTransition`, from PSPageTransitions.js)

Barba transition chosen when the click trigger is inside `.js-c-slider` (desktop only —
`getIsSM()` falls back to the default fade). Base `DURATION_PT_SLIDER = 1.2s`;
step1 = ×0.7 = **0.84s**, pause = ×−0.2 (step2 starts at **0.6s**, overlapping), step2 = **1.2s**.

Eases (both CustomEase):
- `positionCurve = "M0,0 C0.197,0 0.418,0.559 0.525,0.763 0.602,0.911 0.699,1 1,1"` (rush → soft landing)
- `scaleCurve = "M0,0 C0.423,0 0.577,0.155 0.645,0.374 0.72,0.619 0.818,1.001 1,1"` (hang back → swell)

Prepare: current container `height: innerHeight`; next container `fixed, top 0, left 0, width 100%`.
Clicked item + slide: `zIndex 10`, explicit `height = baseHeight × initialScale`.

**Step 1 (t=0, 0.84s):** every other item gets explicit height, then tweens
`autoAlpha → 0, x → innerWidth·sign/visualScale` (sign = which side of clicked index;
divide by `rect.width/offsetWidth` because the tween runs in local scaled space), positionCurve.
Clicked card: if item `--scale ≠ 1` (exit side) transfer shrink to the slide
(`item scale → 1` via inline override, `slide scale = --scale`, origin bottom-right); then
`dX = innerWidth·0.5 + itemWidth·(1−scaleProp) − rect.left − itemWidth·0.5`;
tween item `x → dX` (positionCurve), item `scale → 1, origin 'bottom 50%'` (scaleCurve),
slide `scale → 1` (scaleCurve).

**Step 2 (t=0.6s, 1.2s, power3.inOut everywhere):** item `scale → 0.2`; current container
`y → −innerHeight`; next container `y: +innerHeight → 0` (the upward conveyor); body color wash
`--color-bg/--color-text/backgroundColor/color` from current container's `data-bg-color`/`data-color`
to next's, duration 0.96s starting at 0.6s. onComplete: current container removed, next unpinned.

Other transitions in the file, same skeleton: default (leave = current fade 0.5s power3.out →
enter = color wash 0.5s + next fade-in 0.5s power2.inOut — used for popstate/back, menu links,
mobile); related ×1.0; projects-list ×1.0; filters ×0.7. Home re-entry after back: the recreated
c-slider runs the `sliderAnimated` branch of sliderReady — slides fromTo `--scale: 0, xPercent: −50`
→ laid-out values, 0.5s power1.inOut, delay i×0.05 over the document-order-reversed array,
input attaching after.

Per-destination palettes (data-bg-color / data-color) captured for all 26 card targets in
scratchpad `targets.json` — e.g. spatial-2025 `#a1a1a1`/`#000`, houseplant `#f4edcd`/`#0a0a0a`,
midnight-hotdog `#ffa4d9`/`#0a0a0a`, barcelona-christmas-lights `#00023f`/`#fff`,
vermouth1917 `#ff7700`/`#000`, pt-knitwear `#fff47c`/`#000`, about `#7f9ad1`/`#9dffb2`,
contact `#ff96d9`/`#652114`, projects `#918576`/`#fff57d`.

## Exclusions from recreation (not design, or licensing)

- Complianz cookie banner (third-party plugin), GA, html5shiv/respond (IE shims).
- Lineto woff2 files (license above) — Fontshare Supreme substituted, settings identical.
- Media hotlinked from smlxl.company — **private study only**; folder deliberately outside
  `public/` so it never deploys.
