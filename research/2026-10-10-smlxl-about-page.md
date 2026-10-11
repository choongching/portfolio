# smlxl.company/about: content, layout, motion, and how you enter and leave

Spike date: 2026-10-10. Target: `https://smlxl.company/about/`, reached from the home slider's
mission card (the card our intro card replaces). Companion to
`research/2026-07-18-smlxl-landing-recreation.md` (slider engine, card-click transition) and
`research/2026-08-02-smlxl-project-page-content.md` (what a destination page is). Method: static
fetch (desktop and mobile user agents return the same document), the theme bundle's unminified
modules (`c-slider-cards`, `c-awards`, `c-video`, `c-slider-team`, `c-slider`,
`PSPageTransitions`, read as reference only), the prettified stylesheet, and headless Chrome over
the DevTools protocol at 1505x880, 1024x768 and 390x844 (the Chrome extension timed out).

## 1. The page

Barba container `data-bg-color="#7f9ad1" data-color="#9dffb2"`. One font face, weight 400, no bold.
Eight blocks inside the 12-column grid, then the global footer:

| # | Block | Grid | What it is |
|---|---|---|---|
| 1 | `c-content` | 10, push 1, push-r 1 | Centred h1 (72px, 30 mobile) "We are an ideas-first / design company", two spacer paragraphs, three body paragraphs (30/26/18px, line-height 1.38) separated by spacers. Inner padding 60/60. |
| 2 | `c-video` | 12 | 16:9 team video, no poster. Loads on intersection, pauses when it leaves, restarts from 0 on return. Box shows text colour at 30% until it loads. |
| 3 | `c-slider-team` | 12 | Small title "The team" + one h3-size paragraph. Its Swiper ships with **no slides**, zero height. |
| 4 | `c-clients` | 12 | 48 client names, CSS columns: 3 centred, 2 left-aligned on mobile. |
| 5 | `c-slider-cards.is-news` | 12 | "Selected press": 32 orange cards (label, image, source, headline or lead, optional blurb, date), bottom-aligned, draggable. |
| 6 | `c-awards` | 10, push 1 | "Selected awards": 82 rows, grid `2fr 3fr 5fr`, year only on the first row of each year (2026 to 2018, extra top padding). All rows show on desktop; mobile shows 10 and a "Show More" button adds 10 per tap. |
| 7 | `c-slider-cards.is-facts` | 12 | 9 green "Shower thought" cards, centred text, draggable, no title. |
| 8 | `c-content` | 10, push 1 | "Thank you to our collaborators and former co-workers" + one long h3 line. |
| | `b-footer` | | Full-bleed, home palette (`#652114` / `#ff96d9`), min-height `min(644px, 100svh)`: logo, social links, three contact emails, copyright row. |

**No content animation.** Same as project pages: no reveal, no scroll-triggered motion, no hover
effects on cards, header or footer. The header stays fixed; its `has-transform` / `is-alt` scroll
classes toggle but have no CSS.

## 2. Drag sliders (press + shower thoughts)

Swiper 11 core, no modules. Our measurements (full tables in the scratchpad findings):

- `slidesPerView: auto`, gap 20 (10 mobile). Cards 400/380/300px wide; facts 428x525, 390x470,
  300x400.
- Desktop: the slider is `scale: .8`, origin top-left, width 125%. JS then sets the component height
  to `slider.clientHeight * .8 + rest` to remove the dead space. Not on mobile.
- Follows the pointer 1:1 in local px, so cards move 0.8x the pointer on desktop.
- Threshold 5px. Always snaps to a card edge, never momentum. Short swipe (<300ms) advances one
  card even at 27px; a long drag advances only past half a card.
- Rubber band past the ends: `overshoot^0.85 - 1`.
- Release: 500ms (300 mobile), CSS `ease` (`cubic-bezier(.25,.1,.25,1)`), no overshoot.
- Cursor grab / grabbing. A click after a drag is suppressed. Horizontal wheel does nothing.

## 3. Entering

Desktop card click: the slider transition we already run (stage clears, card centres, conveyor up,
palette wash about 1s, URL updates on click, page opens at the top). Header menu link, browser
history and every mobile entry: the default fade.

## 4. Leaving (every path is the default fade)

Logo, browser back/forward, menu links and all mobile navigation use one transition; there is no
reverse card animation.

| t | What happens |
|---|---|
| 0 | URL updates, input locked, smooth scroll stopped |
| 0 to 500ms | Page fades out **at its current scroll position**, `power3.out` |
| 500ms | Page removed, flat old background shows |
| about 550 to 1050ms | Scroll reset to 0; home fades in `power2.inOut` while bg and text colour wash `power3.inOut`, 0.5s each |
| about 1040ms | Slider, hidden until now and **always back at progress 0**, staggers in: each card `xPercent -50 to 0` while its item scales from 0 (bottom-right origin), 0.5s `power1.inOut`, **leftmost first**, 50ms apart |
| end of stagger | Slider input attaches |

The stagger order is easy to get wrong: `c-slider.js` reverses its slide list at start (for the
right-to-left packing pass) and reverses it **again** before the stagger, so the result is document
order. Our `fadeHome` reused the engine's reversed list directly and bloomed right to left; fixed on
this branch.

Clicks during a transition are ignored (barba `preventRunning`). Browser back during a transition
makes barba force a full reload; we deliberately do not copy that.

## 5. Translation to the landing study

- One `.page-layer--about` built from this document's content (generated, not hand-pasted), in our
  tokens: ink palette `#141414` / `#f2f2f2` (the July 19 normalisation), Switzer and Geist Mono,
  sentence-case mono labels. Press-card kickers (source + date) keep uppercase because their source
  copy is mixed-case all-caps.
- Footer: the reference footer wears the home palette, so ours uses our home palette (`#f2f2f2` /
  `#141414`) with our wordmark in place of their logo artwork.
- Drag sliders: our own GSAP implementation of the numbers above; no Swiper.
- Our extra ways back (Close hint at the cursor over the logo, Esc, from `feat/layer-close-cursor`)
  apply to this layer too once that branch lands; they are additions, not reference behaviour.
- Copy, media and footer details are the reference's for this round (private study, hotlinked),
  to be rewritten by CC.
