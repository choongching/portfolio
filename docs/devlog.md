# Dev log

What changed, why, and what was decided. Git holds the *titles*; this holds the reasoning —
the things that would otherwise have to be rediscovered.

Newest first. Started at #33; earlier work is in `git log` only.

---

## Where we are — updated 2026-10-06

**Live:** designby.cc (Cloudflare Pages, auto-deploys on merge to `main`). Homepage focuses the
Trustana walkthrough; `/resume` is the second page.

**Homepage (live):** the 77s Trustana montage video (#50, rebuild via the `rebuild-hero-video`
skill). Trustana is described as "an AI platform that enriches product data" (#61).

**Landing study, 2026-10-06:** 18 slides. Intro card ("Hello!" + line reveal + arrow), then the
Trustana video, Lissajous CC, pipeline, …, a LinkedIn spiral, a Graas × Trustana news card and a
PENANG clock that opens a Penang page. Card/page/transition knowledge and the layout check
script: the `slider-page-transitions` skill. Standing rules: `CLAUDE.md`.

**Active thread — replacing the interaction study's borrowed media.** `designbycc-landing/` is a
private study recreated from `smlxl.company`. It is being converted card by card to CC's own
media and copy, so it stops depending on someone else's assets.

| | |
|---|---|
| Converted | **4 of 12** — card #3 (Trustana montage), ADG-FAD card (live Lissajous `CC`), Instagram card (live LinkedIn spiral), Catalunya Ràdio news card (Graas × Trustana news). 16 cards removed in total (5 in #52, 11 in #63) |
| Remaining | 8 cards, 73 hotlinked assets incl. page layers (32 mp4, 26 webp, 7 jpg, 3 png, 5 gif) |
| Procedure | the `swap-study-media` skill — read it first, it holds the traps |
| Next target | the remaining GIFs (`hotdog_Thumbnail-1.gif`, `vermouth-1917.gif`) — slowest hotlinks |

**Pick-up checklist:**

1. Serve from the **repo root**, not from `designbycc-landing/`:
   `python3 -m http.server 8081` → `http://localhost:8081/designbycc-landing/index.html`.
   (Study media lives in `public/media/` and is referenced as `../public/media/…`. Serving the
   study folder as its own web root loads the page with silently broken media. Note `pnpm dev`
   already uses :8080.)
2. New change → new branch off `main`, `type/kebab-slug`, one branch = one PR = one devlog entry.
3. Don't stack PRs — merging the base deletes the branch and **closes** the dependent PR.

**Known, unfixed, deliberate:**

- `public/` is ~32MB against the documented 8–10MB budget (mostly the Trustana montage: 15MB MP4
  + 13MB WebM). Study media adds ~4MB per converted clip.
- ~~`loadAllImages` has no timeout~~ — fixed (`fix/loader-timeout`): each image probe now races
  a 4s timeout, so the reveal is delayed by at most `IMAGE_TIMEOUT` and slow hotlinks pop in late.
- The `spatial-2025` page layer is orphaned — card #3 no longer reaches it. Left in place to
  delete or repurpose when card #3 gets a real destination.

---

## 2026-10-12 — (`feat/intro-hover`) · Hovering the intro card lights its key words

CC liked the PENANG clock's hover colour shift and asked for the same on the intro card, hover
only, "express your creativity" (built by a delegated agent, checked in headless Chrome).
- After the line reveal, `wireIntroWords` wraps each word inside the already-frozen lines (line
  positions measured identical before and after), so breaks never move.
- On hover a faint orange tint (#f76d18 at 65%) glints through the other words in a fresh random
  order, while the key words ("product designer", "enterprise teams", "Thirteen years", "seven")
  turn orange one by one and stay lit; they settle back in random order on leave. "Hello!"
  brightens and the round arrow fills orange.
- The two "AI" words show a slowly flowing blue-purple-pink gradient through the letters
  (`background-clip: text`), paused on leave so nothing repaints.
- Mouse only, `(hover: hover) and (pointer: fine)`, and nothing under reduced motion; clicking
  still opens About with the slide transition.

Verified: frames 16.7 ms during the glint and gradient; key words light in random order; back to
rest ~1.4 s after leave; iPhone tap adds no hover state; `check-close`, `check-slider` PASS.

---

## 2026-10-12 — (`fix/landing-a11y-ux`) · Keyboard, focus and readability fixes from the full click-through

From a full click-through audit (desktop and iPhone, real input via `drive-headless`):
- **Tab no longer breaks the slider.** Focusing a card made the browser scroll the viewport behind
  the engine's back (cards stranded, page mostly blank). `SliderEngine` now lays out on the
  viewport's `scroll` event and, on `focusin`, bisects `scrollLeft` so the focused card sits about
  45% across at full size (`reveal()`).
- **Visible focus** on every link and button (`:focus-visible` ring in the text colour; cards get a
  rounded ink ring). Opening a page from the keyboard focuses the page; closing it returns focus to
  the card.
- **Phone PENANG clock numerals** were piled in the centre since #39: their ring radius is a % inside
  the numeral's own transform. `--size: 100cqw` against the face (`container-type: inline-size`).
- **Header over open pages:** a soft band in the page colour fades in behind the header, so scrolled
  About text and the Penang photo no longer collide with the logo, menu and Close.
- **Semantics:** inert cards lose `role="link" aria-disabled` (screen readers said "link, dimmed");
  the menu button has `aria-expanded`/`aria-controls`; the LinkedIn and Graas cards say they open
  a new tab.
- **Copy facts:** the page title had an em dash ("designbycc landing — interaction study"); it now
  uses the live site's title. The intro card said "Twelve years in design" while About says
  thirteen (UX years count from 2013): now "Thirteen years".

Verified: `check-slider` and `check-close` PASS desktop and mobile; Tab → Enter → About (page
focused) → Esc → focus back on the intro card; phone clock numerals on the ring (radius 0.37 ×
face); header shots on Penang and scrolled About; resume overlay paths unchanged.

---

## 2026-10-12 — (`perf/landing-load`) · The landing page loads less and idles quietly

From a load/runtime audit (headless, desktop and iPhone, Slow 4G profile):
- **20 orphaned page layers removed** (Spatial, HotDog, Economist… every SMLXL page no card reaches
  any more): `index.html` 54 → 26 KB, ~300 fewer DOM nodes, and no SMLXL client names left in the
  source. About and Penang stay.
- **The Trustana card video downloaded twice** (both slider trees, `autoplay` overriding
  `preload`): 8.3 MB in the first 10 s. Now only the displayed tree's copy gets its sources, after
  the loader has gone, plays while on screen, and pauses under a page or the resume
  (`startCardVideos()`, `resume:open`/`resume:close` events from the overlay).
- **Lissajous and pipeline loops** ran forever (most of the 66–131 ms/s idle main-thread time).
  They now run only while their card is on screen, the tab is visible and nothing covers home.
  Idle at home: ~45 ms/s; with About open: ~15 ms/s.
- **GSAP 3.12.5 self-hosted** in `vendor/` (standard licence header kept) and all seven scripts
  `defer`: no third-party round trip before the intro (DOMContentLoaded 83 ms locally).
- **Fonts preloaded** (Switzer, Geist Mono), found before styles.css is parsed.
- **Fail-safe vendor scripts:** a failed script left the page on the loader for good. Without
  CustomEase the named eases fall back to `power3.inOut`; without GSAP the loader is dropped and the
  static page shows. Tested with `drive.mjs --block`. (The failures themselves came from the local
  Python server: its listen backlog of 5 dropped connections once seven deferred scripts were
  fetched at once. The dev servers now use a backlog of 128; Cloudflare has no such limit.)

Verified: no console errors; one video request; loops stop under About; slider, Close and resume
checks PASS desktop and mobile.

---

## 2026-10-12 — (`swap/slider-cleanup`) · The slider keeps only CC's own cards, ending on a status card

CC went through the slider card by card (screenshots, one at a time) and removed every SMLXL card
left: the ADC awards news, HotDog, You've Got to Have Freedom, Buen Dolor (books), The Economist,
the theatre poster, Vermouth 1917, the ADC judge news and the BARCELONA clock. Each slide block was
deleted from both trees, matched by its href and asserted to hit exactly twice (old markup is in
git history; their page layers stay in place, unbound). 18 → 9 slides on desktop, 8 on mobile.

- **Status card:** the shower-thought card stays, rewritten as CC's status and made inert like
  the Trustana video card (no href, `role="link" aria-disabled="true"`): "Status" / "I'm
  available now for full-time, contract or freelance work." / "Updated October 2026", all from
  the About page's approved Now copy.
- **PENANG clock: back to main.** The title was centred over the face (first by making the face
  fill its card, then by centring the original-size face), and the clock was polished (second hand,
  hover colour shift). CC saw the clock jump and the alignment shift while scrolling, and asked for
  the original clock back the same evening, so the desktop clock's markup, script and styles are
  exactly as on main. Kept: the phone numeral fix (`fix/landing-a11y-ux`).

Verified: `check-slider.mjs` PASS desktop and mobile after each round (no overlaps), screenshots
through the whole slider; `check-close.mjs` PASS desktop and mobile; tapping the status card on an
iPhone stays home.
---

## 2026-10-12 — (`feat/resume-overlay`) · Every Resume link opens the resume over the whole screen

CC wanted the Resume links (the menu, the About page) to show the resume page, 1:1 with
designby.cc/resume, from wherever the visitor is; CC chose an overlay over a separate page.
`resume-overlay.js` frames the real `public/resume.html` (as srcdoc, with its `/fonts` and
`/resume.pdf` paths pointed at `public/`), so the write-up, layout, fonts and floating download
button are the live page's own and can't drift. It slides up over home or a page, and closes with
its Close button, Esc or browser back (one history entry, same URL), back to exactly where you
were: Esc over the About page closes only the resume (CC: keep Esc to About). The frame keeps
wheel, drag and touch away from the slider; the page under it is `inert` while open. Wired as soon
as the script runs (not on DOMContentLoaded, which waits for GSAP from the CDN), preloads on idle
and on hovering a Resume link, and fades the page in if it isn't loaded yet. Cmd/Ctrl-click still
opens designby.cc/resume in a new tab.

The About link no longer carries the "ATS-ready PDF" cursor hint (it opens the overlay now; the
overlay's own download button keeps the "ATS-friendly format" note).

Verified (`drive-headless`, desktop and iPhone): opens from the menu, the About page and the new
Contact section; fonts load; wheel scrolls the resume, not the slider; Esc, Close, back and
forward all land correctly; phone menu closes behind it.

---

## 2026-10-12 — (`feat/linkedin-spiral-flow`) · Hovering the LinkedIn spiral streams its text into the centre

CC asked for something playful on the LinkedIn disc: on mouse hover the spiral text spins as an
endless spiral, moving in towards the dead centre, and it halts on mouse out or window blur.
Spiked two variants side by side (`research/2026-10-12-linkedin-spiral-hover-spike.md`): **Flow**
(the resting spiral; repeats of the sentence stream along it and fade out at the centre) and
**Vortex** (a log spiral, letters shrinking towards the centre). CC picked Flow; Vortex is gone.

The spiral's old sentence (stale: "12 years", "Right now I'm at Trustana") is replaced, at CC's
ask, by keywords taken verbatim from the resume page (designby.cc/resume), joined with " · " and
looping like a ticker: Lead Product Designer, B2B AI Products, 0-to-1 Builder, AI Product Design,
Enterprise Workflows, Design Systems, AI Data Enrichment, Bulk Data Workflows, Claude Code, Figma,
User Research. ~200 characters, like the old sentence, so the type stays the same size.
Separators are their own tspans, hidden at rest with the repeats.

- At rest the card looks exactly as before. The sentence repeats inside one `<textPath>`, and
  the motion only moves `startOffset` (130 path px/s, 0.4 s ramp up; mouse out, blur or a hidden
  tab brake it to a halt in ~0.6 s). The extra copies fade in on the first hover and stay, so a
  halted spiral is never half empty. Mouse only; touch and reduced motion keep the static card.
- **Never cut by the rim** (CC's screenshot): the text is masked to the resting spiral's own band
  (one ring gap wide), so the turn outside the disc never shows; it fades in along the quarter
  turn before the resting start instead.
- **No added browser cost** (CC's condition): the disc moved into its own SVG layer, so its slow
  120 s turn is a composited rotation with no SVG re-layout. Headless Chrome, card in view,
  vs `main`: idle layout 5 vs 10 ms/s, busy time the same or lower idle and after a hover,
  and the same while streaming; 60 fps throughout. Two traps found on the way: hit-testing the
  moving SVG text cost ~300 ms a frame (the svg is now `pointer-events: none`), and per-glyph SVG
  text scaled every frame (the Vortex) ran at ~3 fps.

Verified: `check-slider.mjs` PASS desktop and mobile; hover streams, mouse out and blur halt,
re-hover resumes, no console errors on the real card.

---

## 2026-10-12 — (`feat/link-cursor-hint`) · The resume link says "ATS-ready PDF" at the cursor

CC wanted the About page's resume link to carry "ATS-ready" without adding text to the line, using
the same cursor hint as the logo's "Close". The hint's look and motion (grow from the pointer tip,
0.2 lerp, shrink on leave) moved into a small `FollowHint` base class in `main.js`; `CloseHint`
extends it unchanged in behaviour, and new `LinkHints` shows any `data-cursor-hint` text while
that link is hovered (fine pointers only; the link's `aria-label` carries the same words).

Verified: `check-close.mjs` PASS on desktop and mobile after the refactor; real mouse hover over
the resume link shows "ATS-ready PDF" at the cursor and hides it on leave.

---

## 2026-10-12 — (`copy/about-trim`) · About page: shorter intro and approach, clearer availability

CC cut the paragraph about designing how people stay in control of the agents (confidence
thresholds, flagged items, a record of every action). Case-study detail that slowed a short bio
down. The intro is now four short paragraphs: who, agentic commerce, tools, contact. CC also cut
the third approach principle ("Structure the complexity, don't hide it") as vague; My approach
keeps two principles. The Now section says plainly that CC is available for full-time, contract
or freelance work, and ends the page with the contact line (LinkedIn, email, and the ATS-ready resume
PDF), moved down from the intro.


**Experience from the resume (draft, 2026-10-12):** CC asked for a simplified version of the
resume on the About page. New "Experience" section after the intro: Trustana, Saleswhale,
Rakuten Viki, AsiaRooms, each as company, role and years, then one line, all taken from
designby.cc/resume without customer names (Aleph-Labs stays out as pre-UX work, as before). The
intro's first paragraph drops the company history the list now carries: "For the past seven
years I've worked on AI products for enterprise teams." Previous version backed up before the
edit.

**Details from designby.cc's footer (2026-10-12):** CC asked for them on About in the page's own
style, with no footer. Three sections after Now, in the same label-left layout: Contact (email,
Resume, "Based in Penang, working globally": CC corrected Singapore to Penang), Follow (LinkedIn,
Medium, Dribbble, plus GitHub at CC's ask) and Developed
by ("Designed and built by me, with Claude Code"), wording as on the live site
(`src/components/Footer.tsx`); "© All Rights Reserved" left out as footer furniture. The Now
section's contact sentence is gone, since Contact and Follow now carry it.
---

## 2026-10-11 — (`fix/mobile-intro-left-align`) · Phone intro card reads left-aligned, like desktop

CC: the phone intro card was "not a good layout design... the text alignment is not great for
readability", and it must be left-aligned because the desktop card is. Cause: the phone card
inherited the shared statement-card rules (centred, 30px on a 32px line, about 1.07), copied
from the reference's one-line statements; the desktop card is left-aligned at 1.2.

- `styles.css`, intro block only: `.c-intro.c-slider-responsive-text { text-align: left }` and
  `.c-intro .a-content-h1 { line-height: 1.2 }` (36px on phones; desktop already 1.2, unchanged).
  Other statement cards keep their centring.
- Verified at 360, 390 and 430 with an iPhone user agent: every reveal line starts at the same
  left edge, mid-reveal included. `check-slider.mjs` desktop PASS; mobile shows the intro card
  31px taller and every later card shifted by that, no overlaps (expected).

---

## 2026-10-11 — (`feat/about-page`) · The intro card opens a minimal About page

The intro card's About layer was a stub (a hero GIF and the word "About"). It is now a real page:
entered and left exactly like `smlxl.company/about` (studied in
`research/2026-10-10-smlxl-about-page.md` and `…-smlxl-about-mobile.md`), with CC's own content
and a deliberately minimal layout.

- **Built in two passes.** First a faithful recreation of the reference page (generated from its
  HTML: video, team, clients, draggable press and fact cards, awards, footer), to get the enter and
  leave experience right. Then, with CC, the content was replaced and the page cut down to what
  carries his story. The recreation was never committed; its measured slider mechanics are in the
  research note.
- **The page now:** "Hi, I'm CC." and four paragraphs, then two labelled sections in one layout
  (small mono label left, text right, all left-aligned, stacked on phones): **My approach** (three
  principles as a plain list, a layout taken from lukaszydek.com/about) and **Now** (dated, idea
  from joshuabaker.com/now). No footer.
- **How the copy was reached.** Studies of vladmoroz.com (intro voice) and how people write
  about vertical commerce agents; facts only from CC's Cowork brief (`All About Me (CC)`). No
  customer names (those stay in the CV); Trustana in the past tense (CC left in September 2026);
  thirteen years counted from AsiaRooms (2013); Aleph-Labs left out as pre-UX work. Versions CC
  rejected as too blunt or too fragmented are noted in memory, not here.
- **Removed on purpose (minimal page):** the video, client and company lists, press cards,
  awards, shower thoughts, the thank-you line, an "Earlier work" section and the footer, and with
  them all slider code and `about.js`. `about.css` holds the type scale and the section layout,
  every rule scoped under `.page-layer--about`. `main.js` is untouched by this change.
- **Links.** The intro card (both trees) and the vertical "shower thoughts" card point at
  `https://www.designby.cc/about/`. The shower-thoughts card previously matched the About layer
  only because its smlxl URL shared the path; leaving it would have sent clicks to the real site.

Verified: slider layout check PASS on desktop against a clean `main` baseline; card to About and
header logo back home at 1505, 1024 and 390 (phone user agent); no horizontal overflow;
screenshots at each size.

Known, not fixed here: `fadeHome` logs "GSAP target null" from the empty spacer slide (also on
`main`); our transitions push the URL when the animation ends, the reference on click.

---

## 2026-10-11 — (`fix/home-return-stagger-order`) · Cards return home left to right

Coming back from any page, the slider re-entered right to left: `fadeHome` staggered
`engine.slides`, which the engine stores rightmost-first for its packing pass, so the visible left
cards waited almost a second. The origin's `c-slider.js` reverses its list a second time before the
stagger; measured live on 2026-10-10, cards bloom leftmost first. `fadeHome` now staggers a
reversed copy. Found while studying the About page exits.

Verified: slider layout check PASS on desktop; logo from an open page brings the cards back
leftmost first.

---

## 2026-10-11 — (`feat/layer-close-cursor`) · A quiet "Close" hint on the logo while a page is open

Pages opened from the slider had no visible way back except knowing the logo goes home. Studied
tlb.betteroff.studio's cursor-following Close (`research/2026-10-08-close-cursor-spike.md`), then
went quieter at CC's direction: a solid pill plus a whole-hero close zone was "too button look
alike", and a label fixed beside the logo was wrong too.

- **Desktop:** while a layer is open, hovering the logo grows a mono "Close" (no fill) out of the
  pointer tip; it trails the cursor with a frame-rate-normalised 0.2 lerp on `gsap.ticker` and
  shrinks back on leave. Gated on `(hover: hover) and (pointer: fine)`.
- **Touch:** no cursor, so the hint sits beside the logo while a layer is open, absolutely
  positioned so the logo's width (which the intro scales by) never changes.
- **Esc** also closes. `PageTransitions` now dispatches `pt:begin` / `pt:end` so UI like this hooks
  page changes without patching the transitions (`class CloseHint` in `main.js`).
- **Layout check fixed:** `check-slider.mjs` matched cards by label only, so media-only cards (no
  label) collided and showed false MOVED results; it now keys by index + label. New
  `check-close.mjs` drives real mouse, touch and key input and asserts the hint and every way back.

Verified: `check-close.mjs` PASS on desktop and mobile; slider layout check PASS on desktop against
a clean `main` baseline.

---

## 2026-10-06 — (`docs/landing-knowledge`) · Write down how the landing slider and its pages work

CC asked that how page transitions work, and how to bring cards back, never be lost between
sessions. New repo skill `.claude/skills/slider-page-transitions/`:

- `SKILL.md`: hard rules and a code map (by function name, not line number); current card
  order; how a card opens a page (`bind` / `layerFor` / `sliderToLayer` / `fadeHome`) with
  timings checked against the code; recipes for adding a card + page, removing, reordering and
  safely hiding cards; patterns already built (Penang page, external new-tab cards, news card
  variants, bare media card, intro card + line reveal, per-card click motion).
- `check-slider.mjs`: headless layout check, steps through the whole slider and fails on
  overlapping or moved cards (`--save` / `--compare` / `--mobile` / `--shots`). Proven: PASS on
  #57, FAIL (61 problems) on #58.
- `list-cards.py`: prints the current card order per tree with each card's click target.

Pointers from `CLAUDE.md`, `designbycc-landing/README.md` (status refreshed),
`swap-study-media` and `parity-check`. "Where we are" above is refreshed to today.

---

## 2026-10-06 — (`study/intro-line-reveal`) · Intro card: masked line reveal after "Hello!"

On first load, "Hello!" arrives with the intro card. As the card lands, each line of the
sentence slides up from behind a mask with a soft fade: `yPercent` 110 → 0, 1.1s `power4.out`;
opacity 0 → 1, 0.6s `power2.out`; 0.1s stagger. It starts at 1.0s on desktop (the slider
fly-in ends at 1.2s) and 0.6s on mobile, and all lines settle by about 1.8s. Lines are split per
word, not per letter, to keep it subtle at 72px.

Decisions that weren't obvious:

- **Line detection has two paths** (`maskIntroLines()` in `main.js`). Desktop text has already
  been frozen by `freezeLineBreaks` into `<br>` breaks with `nowrap`, so it splits on those.
  Measuring word `offsetTop` there returns a single line, which was the first bug. Mobile text
  wraps naturally, so it groups words by `offsetTop`. Desktop gives 4 lines, mobile 7.
- **Masks:** each line is a `display:block; overflow:hidden` span with
  `padding-bottom: 0.12em` / `margin-bottom: -0.12em`, so descenders aren't clipped and the
  settled layout is pixel-identical (verified against the pre-reveal screenshot).
- It runs before `loader.remove()`, so the hidden start state never flashes. Only the visible
  tree is processed. `will-change` is released on complete. With `prefers-reduced-motion`
  nothing is wrapped or hidden. Not replayed on return from a page layer (first load only).

---

## 2026-10-06 — (`study/trustana-card-second`) · Trustana walkthrough moves to second place

At CC's request, the Trustana montage card (bare, #55) now sits directly after the intro card in
both trees, so on load it's the first thing beside "Hello!". The Lissajous CC and pipeline cards
each move back one place. Slides are reordered by moving whole slide blocks (no wrappers between
slides), and `check-slider.mjs` passes on desktop and mobile.

---

## 2026-10-06 — (`swap/slider-card-graas-news`) · Catalunya Ràdio card becomes the Graas × Trustana news

The Catalunya Ràdio news card, in both trees, now announces that Graas acquired Trustana:
"GRAAS × TRUSTANA" / "Graas acquires Trustana and closes a US$17M Series B" / "AUGUST 12TH
2026". It links to Graas's announcement
(`graas.ai/in-the-news/graas-series-b-trustana-acquisition`) in a new tab. Fourth conversion.

- **Facts sourced, not written:** confirmed on graas.ai (dated 12 Aug 2026) plus secondary
  coverage. US$17M Series B led by LemmaTree (founded by Temasek); acquisition price
  undisclosed. Trustana's own page (`trustana.com/company-pages/trustana-acquired-by-graas`)
  is the alternative link.
- **Styling per CC:** the Economist card's black variant (`c-slider-card--black`), headline and
  date only, no body copy (the body line was removed, not hidden).
- **Thumbnail:** Graas's official logo (from graas.ai) on a light grey-blue tile (#ECEFF6) with
  the wordmark recoloured to ink and the cube kept blue. CC picked it from three options; plain
  black read as a hole on the black card. 1200×1373 = the card's 114.42% box, 17KB WebP.
- **External links in the slider:** an href with no matching `.page-layer` isn't intercepted by
  `PageTransitions`, so `target="_blank" rel="noopener"` behaves normally.

---

## 2026-10-06 — (`study/remove-eleven-cards`) · Remove eleven more SMLXL cards

Removed from both trees at CC's direction, after #62 restored the slider: Magenta (card
games), the FORUM news card, Orika, Oscar Tusquets, Tour de France, "Vibrant cards for everyday
life", Go Human (skincare), the FT "How to really change someone's mind" card, the America's
Cup news card, Lil Yachty ("Greetings from a dream") and the Barcelona Christmas lights card.
Slides: desktop 29 → 18 (incl. spacer), mobile 28 → 17. Hotlinked assets 105 → 75.

- Removed outright (CC's call) rather than parked: #58 showed parking inside the container
  breaks the slider. The markup is recoverable from `c3fac3e`
  (`git show c3fac3e:designbycc-landing/index.html`), and the recipe for adding a card back is
  in the `slider-page-transitions` skill.
- Done by matching each card's copy in a key list and deleting whole slide blocks. Each key had
  to hit exactly twice, once per tree. Verified with `check-slider.mjs`: no overlaps on desktop
  or mobile.
- Their page layers stay in the DOM, orphaned.

---

## 2026-10-06 — (`fix/revert-hidden-cards`) · Revert #58: the `<template>` wrappers broke the slider

#58 hid three cards by wrapping each slide in `<template>`, inside the slider container. CC saw
the slider break: from that point on, cards piled up and overlapped along the bottom ("double
layers"). Bisected in headless Chrome at CC's viewport (1505×880): #57 was clean, #58 was the
first bad commit. Reverted, so the three cards show again.

- **Cause:** `SliderEngine` pins each slide to its neighbour via `slide.previousElementSibling`
  (`main.js:368`). A `<template>` is an element sibling, so every slide after a hidden one got a
  template as its "neighbour" (no geometry), and the layout collapsed from there.
- **Why #58's check missed it:** it verified slide counts, hidden text and console errors, but
  never slide **positions**. Layout changes in the slider need a positional check (item rects
  before vs after) or a screenshot past the changed index, not just counts.
- To hide cards later, take the slides out of the slider container entirely (e.g. one
  `<template>` after it), or make the engine skip non-slide siblings.

---

## 2026-10-06 — (`copy/trustana-category`) · Describe Trustana by its real category

"Building AI tools that help enterprise retailers manage product data" was too vague. Trustana
is a PIM and AI data enrichment platform (CC's resume wording; Capterra and G2 list "AI-powered
enrichment" for retailers, distributors and brands). Now reads "building an AI platform that
enriches product data for retailers at scale" in the homepage hero and the landing LinkedIn
spiral (which auto-fits its path, so no geometry change), and "…building an AI platform that
enriches product data." in the styleguide specimen.

The resume, README and `llms.txt` already said "PIM and AI data enrichment platform", so they
were left alone. "PIM" stays out of the hero because most readers wouldn't know the acronym.

---

## 2026-10-06 — (`study/penang-page`) · Clicking the Penang clock opens a Penang page

The PENANG clock card now transitions into its own `penang` page layer instead of SMLXL's
`/contact/` layer: a full-width photo of George Town from above (green canopy, highway, towers
by the sea), "Penang", the live local time, and a photo credit. First version. Still to come:
CC's own line under the time, and sticker cut-outs for more character.

- **Photo:** Kelvin Zyteng on Unsplash (Unsplash License, free; credit given anyway), picked by
  CC from 7 George Town candidates. 2560px WebP at q70 = 367KB (q80 was 485KB); the hero box is
  `66.68%`, the photo's native ratio. Mural photos were excluded (the photo licence doesn't
  cover the artwork).
- **Live time** uses `Intl.DateTimeFormat` with `Asia/Kuala_Lumpur` (`startLocalTimes()`,
  `.js-local-time[data-timezone]`), so it handles time zones properly, unlike the clock cards'
  fixed `data-offset`.
- The card and layer share `https://www.designby.cc/penang/` as `href` / `data-url`, because
  `PageTransitions.layerFor()` matches on the resolved absolute href. That URL doesn't exist on
  the live site: fine while the study is undeployed, but it needs a real route if the study
  ever ships. SMLXL's `contact` layer is now orphaned.

---

## 2026-10-06 — (`copy/landing-intro-card`) · Intro card: "Hello!", new line, arrow link

CC's brief (from a Cowork handoff) for the study's intro card, both trees:

- New text: "Hello!" on its own line at 70% opacity, then "I'm CC Teo, a product designer
  helping enterprise teams get more done with AI. Twelve years in design, seven of them shaping
  AI products." Replaces #56's line (the brief quoted the pre-#56 text; same card).
- "learn more about me" replaced by a 48px round → arrow, bottom-right, 32px in. On hover and
  focus it fills `#f2f2f2` and slides 4px; reduced motion keeps only the colour change. The
  whole card was already the link (to the About layer); it gains `aria-label="About me"` and a
  `:focus-visible` outline.

Deviations from the reference code, and why:

- **"Hello!" is a sibling `div`, not a `<span>` inside the `h1`.** `freezeLineBreaks` only
  freezes leaf nodes (`:not(:has(*))`) and rebuilds their HTML, so a child span would leave the
  heading unfrozen and be stripped anyway. A `<p>` would have hit `.a-content p` (30px).
- **Focus outline is ink, not `currentColor`:** the card's light text colour is invisible
  against the light page.
- **No `color: inherit` / `position: relative` on the anchor:** the first turns the text dark
  on dark, and the second risks the slider's item positioning. The arrow is absolutely
  positioned in the (transformed) inner, so it scales with the card (~33px on screen at the
  0.70 resting scale); an in-flow 48px spacer keeps it clear of the text.

---

## 2026-10-06 — (`study/hide-three-cards`) · Hide three SMLXL cards without deleting them

Hidden at CC's request, in both trees: the Magenta project card ("Exploring identity and
collectivity through card games"), the FORUM news card, and the Orika project card ("Bringing
together eastern and western cultures"). Unlike #52's removals, CC wanted the code kept.

- Each slide is wrapped in `<template class="js-hidden-card">` with a comment. Template content
  isn't in the DOM, so the engine's `querySelectorAll` never sees it, the loader doesn't wait on
  its images, and nothing is fetched. A `hidden` attribute would have left the slides in the
  engine's layout maths. To restore a card, unwrap its template.
- Slides: desktop 29 → 26 (incl. spacer), mobile 28 → 25.

---

## 2026-10-06 — (`study/penang-clock-spin`) · Penang clock hands spin on click

Clicking the PENANG clock card sweeps both hands one full round, with a rotary-dial overshoot
(to 378deg at 78%, settling at 360deg over 1.4s). The page transition starts on the same click,
so the spin plays while the card expands. The hands land back on the real time; the hour hand
trails by 80ms so they don't move as one piece. Both trees.

Decisions that weren't obvious:

- **A registered `--spin` angle** (`@property`, `inherits: false`) is added inside each hand's
  existing `rotate(calc(var(--…-angle) + var(--spin)))`. Animating `transform` directly would
  fight the per-second `--hour-angle`/`--minute-angle` updates and the translate stack.
- **No separate trigger.** The card keeps its `href`, so `PageTransitions` handles navigation;
  `Clock` adds its own click listener for the spin. `sliderToLayer` animates the actual item
  (not a clone), which is why the spin stays visible during the expand.
- The spin class clears on the **hour** hand's `animationend` (it ends last). `animationcancel`
  covers the mobile fade hiding the slider mid-spin. `prefers-reduced-motion`: no spin.
- Tried first and rejected by CC: spinning the number ring instead of the hands, and spinning
  without opening the page.

---

## 2026-10-06 — (`copy/landing-hero-intro`) · Rewrite the landing hero intro

The study's hero card now reads "I'm CC Teo. For 7 years I've designed enterprise AI for teams
who just want to get the work done and move on." It replaces "I'm CC Teo. 12 years in product
design, 7 of them taking enterprise AI products from zero to one." Both trees.

How it was chosen (CC picked the final wording):

- The old line read like a CV entry, with two numbers to parse and "zero to one" jargon. It said
  what CC had done, not who it's for.
- Compared against ednaho.com (clear positioning, no proof) and the live homepage, which leads
  with a user insight ("Enterprise users just want to get the work done and move on").
  Short-fragment headlines (mantra, question, stack) were rejected as unnatural; CC wanted a
  proper sentence.
- The final line merges the homepage's user insight with the "7 years of enterprise AI" proof.
  The 7 years covers Saleswhale (AI conversational platform for sales and marketing) and
  Trustana (PIM and AI enrichment platform). "Teams" rather than "people" or "users", because
  in B2B the work happens in teams.
- Open: the live homepage still says "AI tools that help enterprise retailers", which is vague
  next to Trustana's actual category (AI product data enrichment).

---

## 2026-10-06 — (`swap/slider-card-trustana-montage-v2`) · Card #3 plays the Trustana montage, bare

Card #3 swaps the RUN agent demo for the homepage's Trustana montage (#50), in both trees. At
CC's direction it is **bare**: no RUN titles and no title-protection gradient, ahead of a UI
redesign. Ratio box `62.66%` (2560×1604).

Decisions that weren't obvious:

- **Reuses `public/trustana-walkthrough.*`** instead of copying into `public/media/`, which
  would have added another 15MB. The card has WebM first, then MP4, like the homepage.
- `--bare` modifier (`c-slider-project--bare` / `c-slider-responsive-project--bare`) sets
  `content: none` on the `__inner::before` gradient. Other project cards keep theirs.
- **`clip-path: inset(0 round var(--border-radius))` on bare cards.** CC saw square corners
  on the card in Chrome. Headless (software) rendering showed all four rounded before and after,
  so this is a guard against GPU-composited video painting past the `overflow` + `border-radius`
  clip, not a reproduced fix.

Known, unfixed:

- **Mobile may stall.** Both trees hold a `<video>` that autoplays, so a visit fetches the 13MB
  WebM twice. In headless at 390px the visible mobile copy was still at `readyState 0` after 9s,
  while the old 3.7MB RUN clip played. Needs a real-phone check; the fix would be loading only
  the visible tree's video.
- `public/media/run-agent-demo.mp4` and its poster (~3.7MB) are now unreferenced. Kept until CC
  decides.
- Local preview tip: `python3 -m http.server` sends no cache headers, so Chrome can keep a stale
  `styles.css` after edits. Hard-reload, or serve with `Cache-Control: no-store`.

---

## 2026-10-06 — (`swap/slider-card-linkedin-spiral`) · Instagram sticker becomes a LinkedIn card

The origin's "Follow us on Instagram!" sticker (a flat PNG with SMLXL's blurb set on a spiral)
is redrawn as live SVG in `linkedin-spiral.js`: a speech bubble ("Connect with me on
LinkedIn"), an ink disc with CC's intro on an Archimedean spiral, and an orange ↗ button in the
CC mark's `#F76D18`. The card links to linkedin.com/in/choongching in a new tab. Third
conversion; the counts in "Where we are" were recounted after the five removals.

Decisions that weren't obvious:

- **Spiral copy is existing copy only:** the study's hero line plus the homepage's "Right now
  I'm at Trustana…" sentence. Nothing new written.
- **Text auto-fits its path.** After `document.fonts.ready`, the font size is scaled so the
  text fills ~98% of the spiral's length, and the bubble sizes to its label. Copy edits never
  need geometry tweaks. Text can only be measured while its tree is displayed, so the hidden
  tree retries on `resize`.
- Motion is CSS only: the disc turns once per 120s; hover lifts the bubble and turns the arrow.
  `prefers-reduced-motion` stops both. No rAF loop, so no loader gate is needed.

---

## 2026-10-06 — (`study/penang-clock`) · New York clock becomes Penang

The NEW YORK clock card now reads PENANG at `data-offset="8"`, in both trees. Malaysia has no
daylight saving, so the fixed offset is always right. (The `Clock` class takes a whole-hour
offset and ignores DST, so New York had been an hour off since March.) The BARCELONA clock is
unchanged.

Still SMLXL's: the card's `href` goes to the origin's `/contact/` page layer.

---

## 2026-10-06 — (`study/remove-five-cards`) · Remove five SMLXL cards from the slider

Removed, from both trees: the Houseplant project card ("Rethinking Seth Rogen's Homegoods
Brand"), the HotDog project card ("Where cosmetic and dog brands meet"), and the TDC72,
It's Nice That and D&AD news cards. CC's call, ahead of a UI redesign. Slides go from 34 to 29
(desktop, incl. spacer) and 33 to 28 (mobile).

- The D&AD card carried `Website_low.gif`, one of the two heavy GIFs flagged as the slowest
  hotlinks.
- The `houseplant` and `midnight-hotdog` page layers are now orphaned (no card links to them).
  Left in place for the redesign cleanup.

---

## 2026-10-06 — (`docs/claude-md-and-video-skill`) · Standing rules + `rebuild-hero-video` skill

Added a root `CLAUDE.md` with CC's standing rules (no em dashes in copy, don't invent copy or
numbers, one change per branch/PR/devlog entry, box adapts to video, hero video specs, Cowork
handoffs in `research/`). Added the `rebuild-hero-video` skill so Claude Code can rebuild the
hero video without Cowork.

The skill is CC's Cowork recipe (`hero-video-recipe.md`) plus `rebuild-hero-video.sh`, copied
in from the montage folder. It replaces a first draft on this branch that had been reconstructed
from the shipped files. That draft's findings agree with the recipe: the master is a stream-copy
join of the 8 clips in order (confirmed by matching packet sizes), and the MP4's embedded x264
settings match `-preset slow -crf 20 -g 120`. The recipe also records what the files couldn't:
WebM `-crf 33` and poster quality 90.

Decisions that weren't obvious:

- **cwebp fallback in the script.** Homebrew's ffmpeg (8.1.1 here) has no `libwebp`, so the
  script as written stopped at its encoder check. It now uses ffmpeg's libwebp when present,
  otherwise extracts the same lanczos-scaled frame as PNG and runs `cwebp -q 90 -m 6`. A
  one-frame test gave 92.7 KB against the shipped 91.5 KB. libx264 and libvpx-vp9 are still
  required.
- **Kept `check-video.mjs`** (headless Chrome over CDP), now called from step 8. It runs the
  browser checks without the Chrome extension and was used to verify #50.
- The full rebuild was not run. The script passes `bash -n`.

---

## 2026-10-06 — (`feat/trustana-montage-video`) · Homepage video becomes a 77s Trustana montage

Replaced the 24s 1280×720 walkthrough with a silent 77s montage of 8 Screen Charm clips
(attribute creation, export mapping, Auto Transform, AI Upscaler settings, image enrichment
review, AEO attribute review + popover close-up, the Product Attribute QA agent). Same filenames,
so `Projects.tsx` paths didn't move. Encoded outside the repo (handoff:
`research/2026-10-06-trustana-montage-handoff.md`); the 114MB lossless master stays out of git.

Decisions that weren't obvious:

- **Why bigger:** the old video was 1280 wide and stretched ~2× on Retina screens, which is why it
  looked soft. The new one is 2560×1604 at 60fps — a deliberate exception to the 720p/1–3MB rule,
  noted in `docs/asset-guidelines.md` §3.
- **Box adapts to the video:** the montage is ~16:10, so `aspect-video` would have left side bars.
  `GallerySlot`'s video box is now `aspect-[640/401]` (2560/1604 reduced), exact to the file.
- `ariaLabel`, sr-only `description` and the `VideoObject` JSON-LD were rewritten from the clip
  list (duration `PT1M17S`, `uploadDate` 2026-10-06); the old "powered by Claude Opus 4.5" line
  went, since the new footage doesn't show it. Homepage sitemap `lastmod` bumped, as in #33.

Left as is, worth revisiting: a visitor now downloads ~13–15MB (one of WebM/MP4), all up front
because the slot is `preload="auto"`. `public/` is now ~31MB against the 8–10MB budget.

---

## 2026-09-04 — (`feat/pipeline-bottleneck-card`) · New landscape card: pipeline bottleneck

First **added** card, not a conversion — the "2 of 28" swap count is untouched, and the slide
count now diverges from the origin by +1 per tree (registered in `parity-check`). A landscape
10:3 live-SVG card (`pipeline-bottleneck.js`, second no-file card after `lissajous-c.js`):
dots flow through a pipe that cinches at the cursor; the nearest stage label
(GENERATE / REVIEW / PUBLISH) goes red with a dashed guide line. Idle, it runs a centred
free-flow → cinch (600ms) → hold (3.5s) → release cycle — which is also the whole mobile
experience, since there is no cursor there. Slotted at ordinal 3, right after the Lissajous
card, in both trees. Ported from a standalone demo; light theme kept as designed
(#F2F2F2 panel, red accent, 4-colour dots), labels moved from ABC Diatype to Geist Mono.
No card copy at CC's direction — the `c-slider-project` variant's white overlay titles and
dark gradient fought the graphic, so the card uses the plain `c-slider-card` pattern
(media panel only), same as the Lissajous card.

Decisions that weren't obvious:

- **Pointer tracking on `window`, hit-tested against the SVG's live rect per event** — not
  listeners on the anchor. `SliderEngine.dragTo()` sets `pointer-events: none` on every slider
  `<a>` mid-drag, so an anchor-level `pointermove` goes deaf and fires a spurious leave. The
  rect must be fresh each event because GSAP scales/translates the card continuously.
- Card is inert (`role="link" aria-disabled="true"`, no `href`) via the proven pattern; width
  via inline `--item-width: 1339px` (the `c-slider-image` inline-override precedent), ratio box
  at `66.58%` — CC sized it to the RUN card after seeing the SVG-native 10:3 in place ("too
  slim and wide"); the 800×240 drawing centres in the taller panel. Landscape needed no engine
  work — per-card width and natural height are already the contract, and `align-items: end`
  baselines it.
- rAF parks until `main.js` removes the loader (the `lissajous-c.js` gate); hidden-tree
  instances advance state but skip DOM writes so both trees stay in step. The card adds zero
  `<img>`s, so the PR #45 loader time-box never sees it.
- `prefers-reduced-motion`: renders one static open-pipe frame, binds nothing — first card in
  the study to honour it (the Lissajous card doesn't).

---

## 2026-08-23 — (`swap/slider-card-lissajous-c`) · ADG-FAD card becomes a live Lissajous "CC"

Second converted card, and the first with **no media file at all**: the ADG-FAD Laus NEWS card
drops its hotlinked `Laus-post_LinkedIn_1-1.gif` (one of the heavy loader-hang GIFs) for a live
SVG animation — two "C" letters drawn as Lissajous curves (`x = cx + ampX·sin(2t + δ)`,
`y = cy + ampY·sin(t)`), reduced from a study of cursor.com/compile's hero (7 letters → 2).
All copy removed at CC's direction — no eyebrow, headline, or date; the card is a pure visual
on a black panel. Inert via the proven pattern (`href` removed, both trees).

Motion layers, all additive on the phase δ: staggered intro untwist (δ−π → δ, 1.8s/2s);
idle "breathing" (±0.05π sinusoid, 7s period, anti-phase per letter) so the card never sits
still; whole-card hover morph (+0.3π over 4s, blending mid-flight); and a click easter egg —
each click spins the letters through a full 2π (identity, so it always lands back at rest)
with a damped squash-and-stretch wobble, staggered, alternating direction, stackable.

**Non-obvious bits:**
- The `.a-image` ratio box is the seam: keep the wrapper and its `--aspect-ratio`, absolutely
  fill it with the SVG panel. Engine geometry (`captureBaseHeights`, `measure()`, the click
  transition's `dataset.baseHeight`) never notices the media isn't an `<img>`.
- Curvature is data: `(a, b, δ, scaleX, scaleY)` pick the letter shape. CC chose a flattened
  bow (`scaleX 0.55`) off a rendered variant sheet. Flatter letters carry less ink per 200-cell,
  so the overlap deepens (`GAP` −70 → −110) to keep the interlock.
- One shared rAF loop, parked until the loader is gone, skipping DOM writes for the hidden
  tree and unchanged frames. rAF is frozen entirely while the Chrome window is occluded —
  verify motion with the window visible, or via path-`d` sampling (per `verify-motion`).
- A 2π phase spin is the cheapest "always lands clean" click animation — no state to restore.

---

## 2026-08-23 — (`fix/loader-timeout`) · Time-box the study loader

`loadAllImages` gated the reveal on every `img[src]` in `main` with no timeout — a failed image
resolved, but a *slow* one blocked forever, and smlxl's origin throttles hard under ~90 concurrent
requests. Diagnosed 2026-08-04, deferred three times in favor of replacing the assets; taken up
now after it cost minutes twice in one session (a cold-cache reload sat 3+ minutes on one GIF).

The fix races each image probe against a 4s timeout (`IMAGE_TIMEOUT`). Worst case the reveal is
delayed by 4s; slow hotlinks pop in after. Verified on a fully cold cache: page revealed in ~5s
with two multi-MB GIFs still downloading. Asset replacement continues regardless — this also
protects our own media on slow networks once the study has no hotlinks left.

---

## 2026-08-23 — (unmerged, `chore/skills-post-media-swap`) · Skills catch up to the media swap

Shipping #41/#43 invalidated assumptions in two skills and left a recurring procedure unwritten.

**`styleguide-check` was wrong in both directions about `public/media/`.** The skill exempts
`designbycc-landing/` by path, but study media now lives in `public/` — outside the exemption.
§4's inventory used `ls public/*.mp4`, which is not recursive, so it silently reported a clean
video check while missing the 3.7MB MP4 entirely; §5 and §7 use recursive `find`, so §5
over-fired on the ffmpeg-extracted `.jpg` poster, demanding a WebP conversion that would break
the extraction pipeline. Added a split-case table: `public/media/` is subject to §3 naming and
§7 page weight (it deploys), exempt from §4 dual-format/poster and §5 image format (it is
consumed by the study's own markup, not React). Greps corrected and re-run to confirm.

Surfaced while verifying: `public/` is at ~13MB against the documented 8–10MB budget, most of it
`trustana-walkthrough.mp4` at 7MB. Not fixed — flagged.

**`parity-check` assumed fidelity to `smlxl.company` is still the goal.** It isn't, per card.
Added a divergence register — card #3 diverges deliberately on ratio, copy, and href — plus the
consequence that inert cards reduce the `a[href]` selector count by one each. Regression diffing
(us vs. ourselves) is unaffected and is now the more useful of the two techniques here.

**New `swap-study-media` skill** for the 27 remaining cards. Encodes the adapt-the-card rule,
the lossless ffmpeg pipeline, the both-DOM-trees requirement, the serve-from-repo-root
constraint, and the `href` finding — that `main.js:558` binds any anchor matching a
`.page-layer[data-url]`, so the link was never external and removing the attribute (not setting
`href="#"`) is what makes a card inert.

---

## 2026-08-23 — (unmerged, `copy/slider-card-run-agent`) · Card #3 gets its own copy

Follows the media swap. The card was showing CC's product walkthrough under SMLXL's title:
eyebrow `SPATIAL`, headline "Moving into an immersive identity". Now `RUN` / "Configuring
agents that do the research for you", in both slider trees.

**The link behaviour was not what it looked like.** The card's `href` pointed at
`smlxl.company/project/spatial-2025/`, which reads as an external link — but `main.js:558`
binds every slider anchor whose href matches a `.page-layer[data-url]`, and Spatial has one.
So the click was always intercepted (`preventDefault`) and ran the in-page slider transition;
it never left the site. The real problem was the destination layer, still full of SMLXL's
Spatial content.

Dropping the `href` is what makes the card inert: `bind()` selects `a[href]`, so a hrefless
anchor is never wired up at all — no dead listener, no transition to a foreign layer. Kept as
`<a role="link" aria-disabled="true">` so the element and its styles survive; no CSS keys on
`a[href]` or `:link`, so nothing moved visually. The orphaned Spatial page-layer stays in the
DOM, now unreachable — cheap to delete or repurpose when card #3 gets a real destination.

Verified: copy correct in both trees, `hasHref: false` on both, 0 slider links still pointing
at spatial-2025, the other 31 card links untouched, no console errors.

---

## 2026-08-04 — (unmerged, `feat/slider-video-run-agent-demo`) · First own-media slider card

First step of replacing all 28 hotlinked `smlxl.company` media cards in `designbycc-landing/`
with CC's own content: card #3 (SPATIAL) now plays `public/media/run-agent-demo.mp4` — a SaaS B2B
product walkthrough edited in CapCut (1622×1080, 30fps, 3.7MB) — with a matching extracted
poster. Both the desktop `c-slider` and mobile `c-slider-responsive` trees were updated, since
each card exists in both DOMs.

**The rule that emerged: adapt the card to the video, never the video to the card.** Each card
carries an inline `--aspect-ratio: N%` (N = height / width × 100); setting it to the asset's
native ratio makes the `object-fit: cover` crop problem vanish. Three CapCut re-export rounds
were spent chasing 16:9 before landing on this — CapCut inherits the source window's shape
anyway — and the actual fix was one number in the HTML (`56.25%` → `66.58%`).

**Per-asset pipeline** (lossless, no re-encode):
```
ffmpeg -i "<export>.mp4" -c:v copy -an -movflags +faststart public/media/<name>.mp4
ffmpeg -ss 0.5 -i public/media/<name>.mp4 -frames:v 1 -q:v 3 public/media/<name>-poster.jpg
```
`-c:v copy` is a container swap — pixels untouched, audio stripped, also remuxes `.mov` → `.mp4`.

**Where the media lives — decided:** `public/media/`, committed. `public/` is the deployed
folder, so these files ship to designby.cc and are publicly fetchable by URL, even though the
study page itself never deploys. The study reaches them via `../public/media/…`, which means it
must be served from the **repo root** (`/designbycc-landing/index.html`), not from
`designbycc-landing/` as its own web root — that was the previous local setup and it now 404s.

Binaries in git are a real cost (git keeps every version forever; one clip went through four
exports in a session), accepted here for a self-contained repo. Keep re-exports out of history
by settling a clip before committing it.

**Still open:**
- Card copy is still SMLXL's — eyebrow `SPATIAL`, headline "Moving into an immersive identity",
  and the link still points at `smlxl.company/project/spatial-2025/`. The card therefore shows
  CC's product walkthrough under someone else's title. Next branch.
- Remaining inventory: 7 video cards + 20 image cards (123 hotlinked assets: 44 mp4, 28 webp,
  23 jpg, 19 png, 9 gif). Priority is the five heavy assets (~28MB of GIF/PNG) that gate the
  page through `loadAllImages`, which has no timeout.

---

## 2026-08-02 — #39 · Project layers get real content, and a mobile composition

**Why:** the card-click transition already landed correctly and then arrived on a stub — a hero
box and one `<h1>`. The choreography was writing a cheque the destination didn't cash.

**Key finding:** the origin has **no content-reveal animation**. Every component's
`__applyAnims()` is an empty function, all four `SplitText` references in their bundle are
commented-out imports, and content sits at rest the instant the container mounts. The conveyor
*is* the reveal — so this was layout work, not motion work. That reframing made a job that
looked like weeks into one session.

**Decisions:**
- **Layers are their own fixed scroll containers**, and `body { overflow: hidden }` stays. Flipping
  document overflow per route changes viewport width by the scrollbar where scrollbars aren't
  overlaid, and `SliderEngine` derives its whole layout from `window.innerWidth` — that would land
  a resize mid-transition. Consequence: the `position: ""` reset in `sliderToLayer`'s `onComplete`
  had to go, or content lands unreachable.
- **One `.o-col` driven by custom properties** instead of the origin's ~36 column classes.
- **`--ratio` for new components, never `--aspect-ratio`.** Ours is a percentage feeding a
  padding-bottom box; theirs is a unitless number for the native property. Custom properties
  inherit, so a shared name silently collapses image boxes to zero height.
- **Mobile is a second DOM**, matching the origin. Discovered by fetching `/` with a Pixel 7
  user-agent: it returns `c-slider-responsive` with 39 slides and *zero* desktop slides, selected
  server-side by `wp_is_mobile()`. Their mobile cards are authored natively at phone size — no
  design canvas, no `--item-width`, no counter-scale.

**Reverted mid-flight:** the first mobile attempt reused the desktop authoring model (cards drawn
on a ~1463px canvas, scaled down). It wasn't buggy, it was structurally wrong — fitting a desktop
canvas into a phone column solves a problem the origin doesn't have. Rebuilt against their actual
structure.

**Verification:** 46/46 blocks match the origin's `left,width` to the pixel at 1512px. Desktop
geometry stayed identical to a captured baseline through every commit, checked against the
unmodified build served on a second port. Mobile feel, video playback and transition motion were
confirmed by CC in a real browser — automation ran against an occluded Chrome window all session,
which suspends rAF, IntersectionObserver *and* media loading.

**Cost worth remembering:** a layout throw ran *before* `loader.remove()`, so an exception
presented as a blank page with no error and nothing to diagnose. Layout is now wrapped and logs.

---

## 2026-07-24 — #38 · designbycc-landing interaction study

Renamed from `smlxl-landing`, kept at repo root and deliberately **outside `public/`** so it can
never deploy — media is hotlinked from the origin and the copy is theirs. Visible copy and comments
brand-swept to designbycc. Slider trimmed 38 → 32 cards with orphaned page layers removed, and two
dead video sources (image URLs sitting in `<source type="video/mp4">`, a bug faithfully copied from
the origin) replaced with plain image cards. Fonts bundled with their FFL/OFL licences.

---

## 2026-05-23 — #37 · Footer rewrite

Replaced the bare © line with a "Based in Singapore / Working globally" location statement, © kept
below as muted secondary text. Right column expanded into three labelled sections: Contact, Follow
(LinkedIn / Medium / Dribbble), and a first-person "Designed and built by me, with Claude Code"
credit.

---

## 2026-05-21 — #36 · Pin the single-media project card on desktop scroll

For the single-media case — currently the only visible Trustana slot — the video column goes sticky
at the same offset as the Trustana label (`top-4` / `lg:top-6`, `z-10`) so label and video lock
together at the top of the viewport.

**Non-obvious bit:** the article's min-height had to extend to `180vh` on desktop, or sticky
activates for only a few pixels of scroll and reads as broken. Multi-media projects unchanged.

---

## 2026-05-21 — #35 · Two-tone wordmark via a shared component

`src/components/Wordmark.tsx` became the single source of truth for the `/designby + cc + /`
wordmark, with `cc` in the Inactive grey token.

**Why two hexes:** the component serves two visual contexts. Direct render on cream uses `#999999`;
inside `mix-blend-mode: difference` (the site header) the source must be `#464646` to come out as a
matching muted beige after the filter. Both are documented in `/styleguide` with the reasoning, so
the second value doesn't read as a mistake.

---

## 2026-05-21 — #34 · Free up mobile header and hero

Header no longer fixed on mobile — it sits in flow and scrolls away, with desktop keeping
`lg:sticky`. Hero drops `min-h-screen` on mobile and trims vertical padding so it collapses to
natural height. Together these surface the Trustana label and the start of the walkthrough video
within the first mobile viewport. Tablet and desktop unchanged.

---

## 2026-05-20 — #33 · Focus the homepage on the Trustana walkthrough

Wired a 1280×720 30fps walkthrough (MP4 + WebM + poster) into a single gallery slot. Other case
studies, the Work/About/Contact nav and the back-to-top arrow went **behind feature flags** rather
than being deleted, so they're easy to restore. Footer reduced to Contact + Writing. Hero capped at
80vh on desktop so the video peeks below as a scroll cue.

Also: `VideoObject` JSON-LD, semantic `h2` for the project name, `aria-label` on the work section,
ARIA + `prefers-reduced-motion` handling on the video, sitemap `lastmod` bumped.

---

## Conventions

- One PR per change, squash-merged, title in the imperative.
- `designbycc-landing/` is a **private study** — outside `public/`, never deployed, media hotlinked.
  Nothing in it ships to designby.cc.
- Research specs live in `research/`; the working plan in `docs/plan.md`; token and asset rules in
  `docs/asset-guidelines.md` with the live specimen at `/styleguide`.
