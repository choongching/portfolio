# Dev log

What changed, why, and what was decided. Git holds the *titles*; this holds the reasoning —
the things that would otherwise have to be rediscovered.

Newest first. Started at #33; earlier work is in `git log` only.

---

## Where we are — updated 2026-11-25

**Live:** designby.cc (Cloudflare Pages, auto-deploys on merge to `main`) serves the slider site
from `designbycc-landing/` (`swap/site-cutover`): the preloader (block C's, #101) opening onto the opening on every home visit (#96), then 7 cards (intro, Trustana montage,
pipeline, LinkedIn spiral, Graas × Trustana news, PENANG clock, status), the About and Penang
pages at `/about/` and `/penang/`, the resume overlay, and `/resume` + `/resume.pdf`. Shared links show
`og-home.png` (one image for every page, #99).

**Search and visibility (2026-11-25):**
- The site leads with "Teo Choong Ching" (#107).
- The old Webflow site is unpublished, and Google outdated-content removals are pending.
- Search Console is verified, with the sitemap submitted. `/`, `/about/` and `/resume` are all
  indexed (crawled 25 Nov).
- Cloudflare Web Analytics is on.
- AI crawlers are all allowed: answers, AI search and training (CC, 25 Nov). The dashboard's AI
  answers view tracks it.
- `pnpm visibility` (#109, `visibility` skill) is the local dashboard for traffic, Google search
  and site health. Its keys are in `~/.config/designby-visibility/`, never the repo.
- The resume PDF is ATS-checked on every build (#108, `resume-pdf` skill).

**Pick-up checklist:**

1. `pnpm dev:site` → http://localhost:8080/ (phones: the LAN URL it prints). `pnpm preview:site`
   serves the production build like Cloudflare Pages at :8788. Repo-root static servers no longer
   work: the site's paths are root paths.
2. Cards, pages, transitions and the layout check: the `slider-page-transitions` skill. Headless
   checks: `drive-headless`. Standing rules: `CLAUDE.md`.
   The link-preview image: `pnpm og:edit` and the `og-thumbnail` skill. The preloader:
   `pnpm preloader:edit`, `localhost:8080/?tune` and the `preloader` skill. Why it is the way it
   is: `research/2026-11-25-preloader-decisions.md`.
   The resume PDF: `pnpm resume:pdf` (it runs `pnpm resume:check`) and the `resume-pdf` skill.
   Traffic, Google search and site health: `pnpm visibility` and the `visibility` skill.
   The intro after the opening and the card style: `pnpm studio` and the `motion-studio` skill.
3. New change → new branch off `main`, `type/kebab-slug`, one branch = one PR = one devlog entry.
4. Don't stack PRs: merging the base deletes the branch and **closes** the dependent PR.

**Open:**

- Search, still with CC or Google:
  - CC to update the profile website links to `https://www.designby.cc` (LinkedIn, GitHub,
    Dribbble, Medium) and replace any `choongchingteo.webflow.io` links.
  - Check that the Webflow removals are approved and the sitemap shows "Success".
  - The Search tab's first numbers arrive 1 to 3 days after the 25 Nov setup. Watch "Position
    for your name"; the goal is #1.
  - Search Console's video "non-critical issues" haven't been looked into.
- Offered, not yet asked for:
  - one headline everywhere (the resume PDF says "Lead Product Designer", the site "Product
    Designer");
  - "relocation" only if CC confirms it;
  - "B2B" in the locked About intro.
- Visibility dashboard: CC declined a Dock app or background service (2026-11-25). It runs only
  when `pnpm visibility` is started.

- Cloudflare email obfuscation is on: it rewrites the About page's mailto on the live site. Turn
  it off in the Cloudflare dashboard (CC).
- The Trustana card video is 13 MB (WebM) and starts loading once the intro has played, also on
  phones; a phone-sized rendition (`rebuild-hero-video`, from the master) would cut that.
- `public/` is ~32MB against the documented 8–10MB budget (mostly that montage).
- The site takes about 2.8 s longer to come in since the preloader (#101: 10.7 s vs 7.9 s, fast).
  Levers if it feels long: "Preloader plays at least", the opening's length, a shorter preloader
  on repeat visits (CC). The flower hold (0.35 s) puts the media cuts 0.1 s off the beat.

---

## 2026-11-27 — (`feat/studio-drawer`) · A Drawer prototype in the studio (another take on Case studies)

**Why:** CC isn't happy with the 3D folder look: "re-imagine a drawer file container … flat from
the default view … once they click … the entire drawer will slide towards the screen … the
perspective is direct", "move away from the polished 3D look", "simple colour scheme".
References: flat tabbed dividers (matte, staggered tabs, mono labels), a file-drawer icon, the
file-drawer video frame. CC's picks: the closed drawer shows the files' tabs peeking above a flat
front (then changed to fully shut, no peeking); the site's own palette; a new tab next to the folder (the site keeps the folder).

**What:**
- `docs/studio/drawer.js`: the drawer card and its **Drawer** tab. Closed: flat and shut (a very long lens),
  just an ink front with a mono label and a handle, the files hidden behind it. Click: one value `t`
  drives the slide towards you, the spacing and the perspective together, into a one-point view
  from above: a real 3D box (back, floor, walls) with the files standing one behind the other.
  Hover a file: it lifts and shows its title, the files behind move up too, the others drop and
  get a light wash. Flat and matte: no gloss, glass or gradients. Studio only.
- `docs/studio/proto.js`: the canvas, states, dials and Play, shared by the Folder and Drawer tabs
  (pulled out of `folder.js`).

- **Closed look, round 2 (CC):** fully shut, nothing peeking; then "re-think the default look": three
  looks to compare side by side on the canvas (each a working drawer): **Cabinet drawer** (ink front
  in a grey frame, a white label card in a holder, a recessed pull), **Index-card box** (white
  front, mono label, a big "03", a thin pull line), **Drawer with a tab** (ink front with its own
  "CASE STUDIES" tab). `proto.js` takes a tab's own frame list for this.
- **Hover (CC):** only the hovered file lifts; the files behind no longer move up with it (the
  folder's "make room" is off here), they stay, washed and dropped a touch.
- **Lift too abrupt (CC):** the cause was a comment that swallowed the lift's timing values, so it
  jumped. Now a soft float (0.65 s, power2.out) and a mid-air bob once up; a "Quick float" choice
  (0.3 s, back.out(1.7)) for CC's "or a quick fast float".
- **The file behind was covered (CC):** in the open drawer each tab sits only 7 to 9 units above
  the one in front, so a 14-unit lift covered it. The lifted file now rises only up to the tab of
  the file behind it (measured on screen, per file), its own tab ends up beside that tab, files
  behind no longer drop, and only a file's painted shape takes the mouse (the empty strip beside
  its tab caught the pointer). The back file still lifts fully. Checked: hover 1, then 2, then 3,
  then back to 1, each tab hit-tests to its own file.
- **Taller, same width (CC):** front 40 → 54 (files 32 → 46, still hidden when shut); the card is a
  little taller (ratio 1.06 → 1.14) and the drawer sits a little higher, so the open front and a
  fully lifted back file stay inside the card.
- **Back file lifted too high (CC):** with nothing behind it, it took the full 14; now 8 ("Back file
  lifts"), in line with the others (measured: 48.6, 43.5 and 47.1 px for files 1, 2, 3).
- **Hover the shut drawer (CC: "like someone open the drawer a bit, just a slit"):** the drawer eases
  out a touch and the files' tabs peek just above the front, each one behind a little higher;
  leaving closes it again. Dials: "Hover: files peek", "Each behind, higher".
- **Colour pickers per look (CC):** a "Colours" section for each of the three looks: front, inside,
  the cabinet's frame, files 1 to 3, with presets; changing one look doesn't touch the others.
- **Layer shadows (CC, on the index-card box):** each file casts a soft shadow along its top edge onto
  the file behind (a `drop-shadow` that follows the tab), the front one up onto the files and a
  lighter one onto the page. Per look ("Layer shadows"): on for the index-card box, off for the others.
  CC: "way too obvious, remove the outer part, only for the inner layers": the front's shadows are
  gone, the back file casts none, and the files' shadows are tighter (1 unit blur, 10%).
  Then file 1 merged with the white front, so the front casts a soft shadow up onto file 1 only:
  inside the drawer's width (negative spread) and only as it opens, none when shut.
- **Swing (CC):** file 2 lifts with a swing up to the right, file 3 up to the left (per-file dials).
  6° was "way too much", now 3° with a small drift. The lift leaves room for the raised side, so
  the next tab stays hoverable (checked: lift 2 → tab 3 hits 3; lift 3 → tab 2 hits 2).
- **Claude's additions (CC: "explore and apply your own ideas"):** the lifted file leans a little
  after the pointer (1°), its tab label turns the site's orange accent, and a file that's let go
  settles back with a small spring (back.out(1.6)). Each has a dial or switch.
- Again a note on a crowded defaults line swallowed the values after it (wash, timing, bob); the
  defaults are now one group per line.
- **Placeholder cut short (CC):** a file's picture placeholder now fills its face down to the bottom
  margin instead of a fixed 16-unit block.
- **Hover peek too obvious (CC: "we only need to show that something is inside"):** the tabs now
  peek as slivers (2.6 units, 0.6 step) and their labels stay hidden until the drawer opens.
- **A hover bubble (CC):** "Browse case studies" (CC's words) in the LinkedIn card's speech-bubble
  style. First pinned above the drawer ("too stale"); now it grows out of thin air at the pointer,
  over the drawer, trails the mouse while hovering the shut drawer and shrinks back on leaving or
  opening (like the site's Close hint). Colour automatic: ink on a white front, white on an ink one;
  kept inside the card. Mouse only.
  A click pops it (a quick puff to 118%, then gone in about 0.3 s) as the drawer opens (CC). Black
  on the white front was "way too strong": now a soft grey pill (#ececec) with a hairline edge.
- **A livelier tail (CC: "the two smaller bubbles are weak … go wild"):** three dots chain from the
  pointer to the pill, each lagging the one before (frame-rate independent), the pill leans into the
  movement and squashes with speed; it's blown out dot by dot and pops in sequence. "Still" and "no
  tail" options to compare. 60 fps while moving.
- **The pull thickens on hover (CC).** No constant mid-air bob on a lifted file any more (CC).
- **Corner bug (CC):** the box (back, floor, walls) showed through the front's rounded corners. It
  now sits inside them and only appears once the drawer really opens.
- **Less grey (CC: "so stale"):** files in warm paper whites (#fff, #f6f3ee, #ece6dc), a warm light
  inside for the index-card box; "Paper" and "Soft tints" presets next to "Greys".
- **Tabs (CC: "just #01, #02, #03 … keep it simple", shorter):** labels are the number only and
  the tabs are narrower (16% of the file's width, was 30%).
- **Faster and stiffer (CC):** lift 0.65 → 0.28 s (power4.out), open 0.55 → 0.4 s, close 0.4 →
  0.28 s, hover 0.45 → 0.3 s, settle back.out(1.6) → (1.2). "Stiff" joins "Soft float" and "Quick
  float" as a one-click choice.
- **Tab numbers, typeset (CC):** three styles to switch: "N° 01" (a tiny mono N° with the number in
  Switzer, the default), "01/03" (mono, the total faded), "Big 01" (a large light Switzer numeral).
- **Greyscale, revisited (CC):** light, crisp greys (#fff, #f4f4f4, #e9e9e9; inside #dedede) with a
  hairline edge on each file doing the separating, instead of the old heavier greys. "Light greys"
  preset (default) next to Paper, Soft tints and the old Greys; "Edge line" dial.
- **Numbers too small and thin (CC):** bigger and stronger in all three styles (N° 01: Switzer 600 at
  3.6 units, N° larger and darker; 01/03: 2.5 units, 600; Big 01: weight 500); tabs a touch bigger
  (7 high, 19% wide).
- **A dot, not "N°" (CC);** bigger, then "too big … less bold": 3.8 units, weight 450. The lifted
  file's title moved to the right, clear of the tabs in front. Then CC: "give me a set of controls":
  a **Tab number** section (size, weight 300 to 700, letter spacing, dot size, dot gap, padding, tab
  height, width and corners), all CSS variables on the label.
- **Peek shadows lighter (CC):** the files' shadows and edge lines scale with how far it's open: no
  shadow and a faint edge (35%) while it only peeks, full once open.
- **Centred numbers (CC):** the dot and number sit centred in the tab (default), with a Left/Centre
  switch.
- **Hits the stop (CC: "hit the drawer nail"):** first a separate knock after the open ("too slow", then
  "a pause, then the animation plays, which is wrong"); now it's part of the open: the drawer runs a
  hair past fully open (1.8%) and springs straight back while the files jiggle at the same instant.
  "Hits the stop" dial.
- **Files vanished (CC):** a note on the defaults line swallowed `tabH`/`tabR` (and, found by an
  audit, `corner`/`depth`), so the file shapes drew with NaN. Third time this pattern bit: the
  defaults now keep every comment on its own line, and an audit (every `S.key` used has a default,
  no comment followed by `key: value`) came back clean.
- **2nd tab invisible in the peek (CC):** #f4f4f4 on the #f2f2f2 page, with its edge faded out. The
  edge line now stays at full strength (0.11) in the peek; only the shadows stay off.
- **Inner shadows 30% lighter (CC):** files 10% → 7%, the front's on the first file 13% → 9.1%.
- **Dribbble frames (CC: "suitable for Dribbble upload … record and upload"):** each of the three
  frames is 4:3, 1200 × 900 (Dribbble's shot ratio; 1600 × 1200 is the usual upload size), the card
  drawn larger to fill it, 40 apart ("closer to each other"). "Size for recording" puts the first
  frame at exactly 800 × 600 on screen (1600 × 1200 on a Retina screen). Toggle "Dribbble frames".
- **Hide panels (CC):** a top-bar toggle (and ⌘\) hides both side panels for a clean canvas.
- A shut drawer always hides the tabs fully, whatever their height (taller tabs had peeked a hair).
- **One hover highlight (CC):** the lifted file turns one colour whichever file it is (a light tint of
  the orange, #fdf1e8, with its orange number) and back to its own on leaving; picker and switch.
- **The back panel's colour (CC):** the sides were lifted to near white (brightness 1.15) while the back
  stayed mid-grey, so the back read as a separate block. One light tone now (#e6e6e6 for the
  index-card box): sides ×1.03, floor ×0.92, back ×0.95. Then CC: "I need it to be in white": the
  index-card box's inside is white, back and sides the inside colour itself, the floor ×0.96.
- **Back panel shorter (CC: "showing too much"):** the box's back and sides are 0.6 of the front's
  height (was 0.92), so the back no longer rises above the files. "Back height" dial.
- **A more natural stop (CC):** the files no longer jiggle up and down: momentum tips them forward
  on their bottom edge and they swing back a little less and settle (a damped swing, about 2.6°, each
  at a slightly different rate); the drawer settles with a tiny decaying bounce (elastic) instead of
  one smooth return. The front cover bounces a hair towards you and back (CC), then "too much …
  very quick": 0.3 units out, settled in about 0.2 s. Dials: "Hits the stop", "Front bounces".

**Checked:** headless, real mouse: hover nudges the closed drawer, click opens, hovering file 3 then
file 1 lifts each, click outside closes, 60 fps, no errors; the Folder tab still works.

---

## 2026-11-27 — (`fix/video-upload-date`) · Video structured data: uploadDate with a time and timezone

**Why:** Search Console email (26 Nov): 2 non-critical Videos issues, "Datetime property uploadDate
is missing a timezone" and "Invalid datetime value for uploadDate".

**Cause:** the homepage's VideoObject had a bare date (`"2026-10-06"`). Google treats `uploadDate`
as a date and time and recommends an offset (its own examples: `2024-07-19T08:00:00+08:00`).
The JSON-LD is on `/` and its copies (`/about/`, `/penang/`), hence more than one page.

**Fix:** `"uploadDate": "2026-10-06T14:48:42+08:00"`, when the current montage was published
(#50's commit time, Penang time), not a made-up time. `duration` PT1M17S still matches the file
(77.25 s).

**After deploy (CC):** Search Console → Enhancements → Videos → "Validate fix".

---

## 2026-11-26 — (`fix/folder-click-jump`) · Clicking the folder no longer jumps the slider

**Why:** CC (screen recording): the first click on the blue folder made the slider jump, putting
the folder in the middle of the page.

**Cause:** the folder is a keyboard button (`tabindex="0"`), so a mouse click focuses it. The desktop
slider's `focusin` handler (`SliderEngine`, for Tab) then called `reveal()`, which scrolls the
focused card to 45% across. Reproduced headless: folder at x 1249, click, x 677.

**Fix:** `focusin` reveals only on keyboard focus (`:focus-visible`). Clicked: x stays 1249. Tab
still reveals each card (the folder and the LinkedIn card land at 677).

**Checked:** check-close and check-slider desktop PASS.
## 2026-11-26 — (`feat/hide-pipeline-card`) · Pipeline card hidden

**Why:** CC: "let's hide this card, don't remove it from code, just hide it from the site".

**What:** the Pipeline bottleneck slide moved out of both slider containers into a
`<template class="js-hidden-cards">` right after each one (the safe way from the
`slider-page-transitions` skill: nothing may sit between slides, #58). Inside a template the slide
isn't rendered and `pipeline-bottleneck.js` finds nothing to mount, so it costs nothing. To bring it
back, move the slide into each container after the Trustana video. `list-cards.py` lists parked
cards apart, as hidden.

Order now: Intro, Trustana video, Case studies folder, LinkedIn spiral, Graas news, Penang clock,
Status.

**Checked:** check-slider desktop (no overlaps; later cards MOVED up one place, expected) and phone
PASS; check-close desktop and phone PASS; no `.js-a-pipeline` on the page, no errors.

---

## 2026-11-26 — (`feat/case-study-card`) · The Case studies folder is on the site

**Why:** CC: "let's add this blue folder in the main slider, users can see it". Placeholder papers
for now (CC's pick), after Pipeline (as in CC's mockup).

**What:**
- The folder card moved into `designbycc-landing/case-folder.js` (one module, used by the site and
  the studio's Folder tab), with CC's locked values as `FOLDER_DEFAULTS`.
- A 4th card in both slider trees (`.c-slider-folder`, `--item-width: 589px`, 106% box, no card
  fill), between Pipeline and the LinkedIn spiral. The box takes clicks (other media boxes don't).
- Mouse: hover lifts and tilts it, a click snaps it open, hovering a paper lifts it. Touch: taps.
  A click on the folder or anywhere else closes it; so does scrolling it out of view. Keyboard:
  Tab to it, Enter or Space. Reduced motion: opens and closes without travel, bob or tilt.
  A slider drag that ends on it isn't a click.
- Paper titles are placeholders ("Case study 1, 2, 3"); a paper click does nothing yet.

**Checked:** check-slider desktop (no overlaps; the earlier cards report MOVED only because the track
is one card longer, the screenshots are clean) and phone PASS; check-close desktop and phone PASS;
headless desktop (hover, click, paper hover, outside click, drag, 60 fps) and iPhone (tap open, tap
paper, tap outside); the folder doesn't rebuild while the phone slider scrolls; build +5 KB gzip,
no studio code in it.

---

## 2026-11-26 — (`feat/case-study-folder`) · A "Case studies" folder prototype in the studio

**Why:** CC wants a Case Study section: a 3D-looking folder card that opens to show 3 case study
papers. References: CC's mockup (folder → wallet-like pocket), a Dribbble file-drawer video, a
frosted folder ("Wrap Designs"). CC: "build the standalone folder prototype first ... in the
same Studio app".

**What:** a **Folder** tab in the studio (`docs/studio/folder.js`), a desktop and a phone card on
its own canvas, states on the left (Closed, Open, each case study lifted), dials on the right,
Play runs the sequence. Nothing on the site changes.

**Research (feasible, no new library):** CSS 3D transforms + GSAP (already on the site). Rive,
Lottie and Three.js/Spline were weighed: runtimes to download, text baked into a canvas, or far
too heavy for one card. The look is "2.5D": flat layers, perspective, light and shadow.

**CC's rounds, in order (what was rejected matters):**
1. Hover zoomed the folder and fanned the papers back into depth: wrong. CC: papers slide up and
   float mid air, peeking; the hovered one lifts higher.
2. Closed must be shut neatly; hover opens it a little; hovering the papers floats them.
3. Papers too short (their bottoms showed above the glass): made taller.
4. Hovered paper in focus: a fade with the hovered paper brought to the top was rejected ("the
   layers stay"); now a light wash on the others, which also drop a little. The hovered paper
   tips and follows the mouse in 3D ("be a bit playful").
5. Opening moved from hover to a **click**; the whole folder comes a little closer; then a quicker,
   snap opening (back.out, 0.3 s).
6. White card, side cards and the round arrow removed; two-layer realistic shadow that reacts to
   hover and the pointer; the folder tilts under the mouse and sinks when pressed.
7. CC's settings locked as the defaults (blue `#4a8fe7`, papers peek 4, float up 12, gap 7, soft
   shadow 0.05, ...).

**Checked:** headless Chrome with real mouse input: hover does nothing while closed, click opens,
paper hover lifts the right paper (and the ones behind still reachable), click on the folder or
outside closes, phone taps, Play; 60 fps; no errors.

**Next:** CC to name the 3 case studies (and their covers), then the card goes into the slider
(both trees) as its own PR, with what a paper click opens.

---

## 2026-11-26 — (`feat/studio-card-style`) · Card outline, shadow, colours and corners in the studio's toolbar

**Why:** CC: "can we also surface values and adjustments for cards outlines and drop shadow or
colors too? even radius corners ... it will affect all the cards".

**What:**
- Clicking any card in a frame now selects **Card style** (all cards), as in Canva and Figma.
  A double-click goes into the card: the intro card's text and spacing, or its arrow. Tabs in the
  toolbar (All cards · Intro card · Arrow) switch between them. CC didn't find the card controls
  at first, because clicking the intro card went straight to its own text settings.
  "Cards come in" stays in the list and the timeline.
- **UX pass (design critique, CC: "where are they? can we make it more obvious? simple UX"):**
  - The studio has two modes, **Style** and **Motion**, like Canva's Design and Animate. Style
    is the default and opens on **Cards**; its frames load straight to the finished page (no
    opening), and the timeline is hidden.
  - The list items carry a one-line hint ("Corners, colours, outline, shadow").
  - The Cards toolbar is trimmed to Corners, Fill (Light / Dark), Outline and Shadow; Blur,
    Opacity and Spacing are in the panel.
  - Shadow presets are tiles that show the shadow.
- **Hide outlines (H)** hides the blue selection and hover boxes (CC asked).
- **No floating toolbar** (CC: "remove these toolbar, make it simpler"). Every control is in the
  side panel.
- **Play is manual** (CC: "make the animation stop each time i adjusted something? let user
  manually start animation").
  - The frames rest on the finished page: `?still` runs the intro 1000× fast, with no preloader or
    opening.
  - One **▶ Play / ■ Stop** button (Space) plays the intro as set in Motion mode.
  - Any edit while it plays stops it. Layout edits reload still frames. Motion edits wait for Play
    ("Changed. Press Play to see it.").
- **Card outline on top of the content** (CC: the Trustana video card's outline was clipped). The
  video is a composited layer that filled the card and painted over its own inset `outline`. The
  outline is now a `::after` overlay (`border`, `border-radius: inherit`, `z-index: 3`), and boxed
  cards are `position: relative`. Layout sizes are identical to `main`.
- **Same outline thickness on every card** (CC: "why there are two different thickness ... i thought
  they should share the same token?"). They did share the token, but the slider scales cards as
  they come and go (at rest: intro 0.99, video 0.49, the rest 0.30), and the outline scaled with
  them. Both engines now set `--fx` (the card's scale) and the outline divides by it, so it's the
  same on-screen width everywhere (about 2px for a 2px token, give or take device-pixel rounding).
  Corners and shadows still scale with the card, as the whole card does.
- **Page tab** (CC: "break this phone mobile view into a complete design elements and objects ...
  think Figma but less complex ... in a new tab section, not the same canvas"):
  - A third mode, **Page**, with its own canvas: the phone home page laid out flat, one long
    page (about 3,300px) with every card at full size.
    - The frame loads `?studio&still&flat`; `ResponsiveSliderEngine.flatten()` stops the scroll
      scaling.
    - The container keeps a real phone's padding (25% of 844px) instead of 25% of the tall
      frame.
  - A layer tree: Header (Logo, Menu button), then each card (Intro, Video, Light, Spiral, News,
    Clock, Status) with the objects inside it: texts, images, video, graphics, the arrow and the
    clock face.
  - A click selects a card, and another click (or a double-click) selects what's inside.
  - The inspector shows the object's real position and size, and lets you tweak text (size,
    weight, line height, letter spacing, colour), box (fill, corners, opacity) and spacing
    (padding, gap).
    - It names the selector and says when a tweak also changes others with the same style
      ("Same style as 1 other on the page").
  - Tweaks are phones only: `site-tweaks.json` (the source) and `site-tweaks.css` (loaded after
    `site-design.css`), written by Save (`docs/studio/tweaks.mjs` checks selectors, properties
    and values).
  - Layout is identical to `main`; `check-slider` passes on desktop and phone.
- Its floating toolbar has Corners, Outline (width plus a colour swatch), Shadow (None, Soft,
  Lifted, Tight; "Custom" when edited), Blur, Opacity, Fill (light and dark card colours) and
  Spacing.
- The outline and shadow apply only to cards with a box: the round PENANG clock and the LinkedIn
  spiral would have drawn a square.
- The video card's corner clip moved from the card to its inner, so a shadow isn't cut off. The
  desktop inner is drawn at the design size, so its radius is divided by `--initial-scale`.

**Checked:** the video card's corners are still rounded (desktop and phone); layout sizes are
identical to `main`; `check-slider` passes on desktop and phone. Nothing on the site changes
until CC saves new values.

---

## 2026-11-26 — (`feat/motion-studio`) · A motion studio for the home intro and the card style

**Why:** CC wants to watch the intro (the logo animating up into the header, then the cards
coming in) and tweak its speed, timing and easing, plus the cards' corners, shadow, border and
the page colour, in a design-canvas tool. The preloader and the opening already had editors; the
part after them was hard-coded in `main.js`.

**What:** `pnpm studio` (http://localhost:8080/__studio/, dev only). The real site plays in a
desktop and a phone frame on a pannable, zoomable canvas. On the left is the sequence; on the
right, the inspector (sliders, eases with curve previews, a bezier editor for the logo, colour
pickers, shadow presets). At the bottom is a measured timeline with a playhead: drag a bar to
change its delay, or its edge to change its duration. Replay, pause, 0.25× / 0.5× / 1×,
preloader and opening on or off, undo and redo. Look changes are live, motion changes replay,
and Save writes the files.

**Site side:** the intro's values moved to `designbycc-landing/site-design.js` with the same
values. The card look is generated into `site-design.css`, with new `--card-border` and
`--card-shadow` tokens, off by default. The studio's draft is read only in dev with `?studio`.
Checked: the build, `check-slider` desktop and phone PASS, and a plain load shows radius 16 / 8 px,
no shadow and no studio code.

**Header logo on phones (CC, first round):** the wordmark was 19 px everywhere; CC: "on Mobile
view, the logo can be much bigger". It is now a `--logo-size` token (Look → Header logo), 28 px on
phones and still 19 px on desktop. The opening's fly-home and the logo eyes measure it, so they
follow it. Checked at 390 px: it lines up with the menu button, and `check-slider` PASSes on
desktop and phone.

**Editable intro card, Canva-style (CC, second round):** CC asked to make the card editable
(spacing, margins, font sizing) "like Canva UI and UX". New `intro` settings for desktop and
phone: text size, line spacing, padding (each side), space below the text and width (desktop). A
"Space between cards" setting for desktop and phone (`--card-gap`; `main.js` `GAP` reads the
same value). Selecting a layer shows a floating toolbar above it in the frame, with −/+ steppers
and a value field (arrow keys step, Shift × 10), like Canva's. Changes show at once, then the
frames reload without the opening so the lines re-wrap. Defaults match what was live; layout
sizes and computed styles are identical to `main` on desktop and phone. (Found on the way: the
phone intro's line spacing is 1.2, not the 32px its mobile rule says.)

**Intro card arrow (CC, third round):** the round arrow is a layer of its own: size, arrow size, line
width, distance from the right and bottom (desktop and phone), and the hover nudge. The space
under the text (`.c-intro__spacer`) now follows the arrow's size (both were 48px), so a bigger
arrow never covers the words. Same layout as `main` at the defaults.

**CC's first saved settings (2026-11-26):** phones: intro text 29px at 1.29 line spacing,
padding 21 / 28 / 20 / 28, arrow 38px; desktop: arrow 41px; header logo 28px on phones. Everything
else as before. Checked: `check-slider` desktop and phone, `check-close`, the build.

**Decided:** own tool rather than Theatre.js (it would mean rewriting the motion around its
sequence model; the studio is AGPL), GSDevTools (it can't scrub the preloader; it needs GSAP
3.13) or a bare Tweakpane panel (no canvas or timeline). Research, gaps and next ideas:
`research/2026-11-26-motion-studio-spike.md`; how to extend it: the `motion-studio` skill.

---

## 2026-11-25 — (`feat/visibility-logo-eyes`) · The live logo with its eyes, and a simpler, collapsible side menu

- **Why:** CC: "replace this with the actual live site's logo… the one where the CC can turn into
  eyes".
- The "designby.cc" text is replaced with the site's wordmark: "designby" plus a bold "cc", at 24px.
  It links to www.designby.cc.
- **The eyes reuse `designbycc-landing/logo-eyes.js` as is.**
  - The dashboard loads GSAP from `node_modules` and the eyes script, then fires
    `site:intro-done` once the fonts are ready. The script only arms after that event.
  - The server allows exactly those two files from outside `docs/visibility/`.
  - Hover pokes escalate as on the site ("huh?", "again?", "ugh").
- Checked headless at 2x: the eyes appear on hover and turn back into cc.
- **Side menu**, from CC's notes on the same PR:
  - The "Is the portfolio working?" label is gone ("weird").
  - Lucide icons are inlined (chart-column, search, bot, heart-pulse), with exact paths from
    lucide-static 0.460.0.
  - The menu collapses to an icon rail (panel-left button), and the choice is remembered.
  - "Checked 21:21" became a status line with an icon: "Everything's working" or "N problems on
    the site", then "Updated at 9:23 PM".
- **Fixed while testing:**
  - Collapsing hid the logo with `display: none`, so the eyes re-measured it at zero size and
    drew in the wrong place. The logo now stays laid out (only invisible).
  - The page jumped to the view named in the hash on load, hiding the question line. The view
    is now `#/traffic` (no element has that id), and old `#traffic` links are rewritten.
- **Plain wording** (CC: "Period" and the AI answer were "weird" and "very off"):
  - The date range buttons read "Last 7 days / Last 28 days / Last 90 days", or "7 days" on phones.
  - The AI view asks "Can AI tools like ChatGPT find you?" and answers, for example, "Yes.
    ChatGPT, Claude, Perplexity and other AI tools can read your site, and it tells them who you
    are. None of them has sent you a visitor in the last 28 days."
  - The metrics and panel titles were rewritten the same way.
  - The spot-check section is "Ask AI about you", with "Questions to try" and "A good answer"
    (CC found "Check what they say" and "What to look for" weird).
- **Logos and more AI tools** (CC: "display each of their favicon… fill them all up").
  - Favicons come from Google's favicon service (public domains only) and appear on the AI tools
    table, the "open in" links and the AI visitors list.
  - The "open in" links now cover ChatGPT, Claude, Perplexity, Google AI Mode, Gemini, Copilot,
    Grok, Le Chat, Meta AI and DeepSeek. Gemini, Meta AI and DeepSeek can't open with a question,
    so their link copies the question to paste in.
  - The crawler list grew to 18: MistralAI-User, DuckAssistBot, Meta-ExternalFetcher, Applebot and
    Meta-ExternalAgent were added. All 18 are allowed.
- **Phones** (CC: "not mobile friendly"):
  - A compact header holds the wordmark, Refresh and a full-width date range.
  - The four views sit in a tab bar fixed to the bottom, mobile-app style, with the active icon in
    the accent colour.
  - The questions table stacks.
  - No view scrolls sideways at 390px (checked headless on all four).
- "A good answer" is now a four-line checklist (name and role, recent work, where you are, a link)
  plus one line on what to do if something's wrong. CC found the earlier paragraph weird.
- **Blocks on the grey page** (CC: the edge-to-edge thin lines looked weird). The question and
  every section are now inset with the same `--gap` all round, with a border and 12px corners.

---

## 2026-11-25 — (`feat/visibility-ai-answers`) · AI answers (AEO/GEO) view, and AI crawlers unblocked

- **Why:** CC asked for an AEO/GEO section. While checking what it should measure, we found
  Cloudflare blocking AI crawlers:
  - PerplexityBot, GPTBot and ClaudeBot got **403** from "AI Crawler and Agent access policies"
    (Training: Disallow).
  - Bot Preference Sync prepended a managed robots.txt that disallowed GPTBot, ClaudeBot,
    Google-Extended, CCBot and others, with `ai-train=no`.
  - The live-fetch bots (ChatGPT-User, Claude-User, Perplexity-User, OAI-SearchBot,
    Claude-SearchBot) were already allowed.
- **CC chose "allow all".** In Cloudflare, Search, Training and Agents are all set to Allow, and
  Bot Preference Sync is off. Every crawler now gets 200, and robots.txt is our own file (allow
  all).
- **Trade-offs, as told to CC:**
  - The upside: AI search can cite the portfolio, and models learn the correct facts.
  - The downside: the public content, including the Trustana visuals and copy, can be used for
    training. That can't be undone for crawls already made, though it can be stopped at any time.
  - Nothing private is on the site.
- **New view, AI answers.** It asks: "Can AI assistants find you and describe you correctly?"
  - Key metrics: AI crawlers allowed (13 checked; Google-Extended and Applebot-Extended through
    robots.txt only), visits from AI assistants (ChatGPT, Perplexity, Claude, Gemini and Copilot
    referrers, against the previous period), profile facts for AI (10 llms.txt and JSON-LD checks),
    and pages readable without JavaScript.
  - Panels: crawler access, AI referrals, profile facts, the no-JS view, and "Ask the assistants"
    links (ChatGPT, Perplexity, Claude, Google AI Mode, Copilot) with two prompts: "does it know
    you" and "does it recommend you".
  - Server: `/api/ai`, with a small robots.txt group parser. It was tested against the old
    Cloudflare rules (GPTBot, CCBot and Applebot-Extended blocked; Googlebot not).
- **Site health** gains "robots.txt lets AI crawlers in": 24 checks.

---

## 2026-11-25 — (notes) · Search, analytics and resume decisions from the 25 Nov session

- **Webflow phase-out:**
  - `choongchingteo.webflow.io` is unpublished; every page now returns 404. Disabling subdomain
    indexing needs a paid plan, so it was skipped.
  - Google outdated-content removals were requested for `/` and `/about`.
  - It can be restored by republishing in Webflow.
- **Search Console:**
  - designby.cc is a Domain property, verified through Cloudflare's one-time DNS authorize.
    Never delete the `google-site-verification` TXT record.
  - The sitemap was submitted, and indexing was requested for `/`, `/about/` and `/resume`. All
    three were indexed the same day.
- **Analytics:**
  - CC turned on Cloudflare Web Analytics: free, no cookies, no consent banner.
  - CC asked why not build our own, or copy Google Analytics. Answer: a home-made tracker would
    need a store, bot filtering, visitor counting and upkeep, for the numbers Cloudflare already
    gives. GA's value is Google's own data (demographics, cross-device identity). Search queries
    exist only in Search Console.
  - So: Cloudflare for visits, Search Console for searches.
- **Resume PDF:**
  - The download on the live site serves the latest build (byte-identical to the repo).
  - CC asked for every edit to stay ATS-ready. That became the `resume-pdf` skill and
    `pnpm resume:check` (#108).
- **README:** it now lists `pnpm resume:pdf`, `resume:check` and `visibility`, `docs/resume/` and
  `docs/visibility/`, a search and analytics note, and two "leave alone" items: the Search Console
  TXT record and Cloudflare Web Analytics.
- **Credentials:**
  - Cloudflare: the token is named `site-visibility`, Account Analytics: Read.
  - Google: a service account, added to Search Console as
    Restricted.
  - Both live in `~/.config/designby-visibility/`.
  - The Cloudflare token was pasted in chat once; it can be rolled in Cloudflare if wanted.

---

## 2026-11-25 — (`feat/visibility-tool`) · A local dashboard for the site's visibility

- **Why:** CC wanted to see the site's traffic and Google visibility "without paying any cents".
  CC chose all three panels, on a local page like the OG and preloader editors.
- `pnpm visibility` → http://127.0.0.1:5181/. Server: `docs/visibility/serve.mjs`, with no
  dependencies.
  - **Site health:** 23 live checks, no setup: pages, the 404, the www redirect, title,
    description, canonical, OG `?v=`, JSON-LD, sitemap, robots, llms.txt, the resume PDF against
    the repo, and the Webflow pages gone.
  - **Google search:** the Search Console API through a service account (a JWT signed with
    `node:crypto`): impressions, clicks, position, click rate, searches for CC's name, all
    searches, top pages, countries, index status for `/`, `/about/` and `/resume`, and the
    sitemap's status.
  - **Site traffic:** the Cloudflare Web Analytics GraphQL API (`rumPageloadEventsAdaptiveGroups`):
    visits, views, top pages, referrers, countries, devices.
- **Three tabs** (CC): Traffic, Google search, Site health.
  - The choice is kept in the URL hash, and the arrow keys switch tabs.
  - Each tab shows a small badge: visits, impressions, and checks passed.
- Changes from a design critique (`design:design-critique`):
  - Hiding the date range on the Health tab no longer moves the tab row.
  - Taps on phones switch tabs instead of selecting the text.
  - The estimate note joins the source line.
  - The tiles stay in one row on phones.
  - The search tab shows one "no data yet" note instead of eight empty boxes.
  - The health checks sit in balanced columns, without "HTTP 200" under every passing check.
  - Countries show their names.
  - The site's own pages are left out of "Where visitors came from".
- **Redesigned around goals** (CC: "first redefine the goals… work backwards… the design must
  answer those goals").
  - The page asks: are hiring teams finding the portfolio, and does it hold their interest?
  - Each view opens with its question and a computed one-sentence answer:
    - Traffic: how many people visit, and are they interested?
    - Google search: do you show up when people search your name?
    - Site health: is the site working for visitors and for Google?
  - Then four key metrics, each with a change against the previous period. The server now also
    returns the previous period.
- Style from CC's SaaS references: a side menu, a hairline-divided metrics strip, grey gutters
  between sections, panels titled "Title · description", ranked share lists, and a D/W toggle on
  the chart.
- Light only, lots of whitespace, no icons, no shadows, one accent colour. Passing checks stay
  grey; only problems get colour. The goals and rules are in the `visibility` skill.
- **Keys live in `~/.config/designby-visibility/`, outside the repo.** CC creates them; the
  `visibility` skill has the steps.
- **Verified:**
  - The health panel runs against the live site: all 23 checks pass.
  - The traffic panel runs on real Cloudflare data: 61 visits and 66 views in the first week,
    mostly from Malaysia, mostly direct.
  - The search panel is verified with sample data only, until CC adds the Google key.
- **Found while connecting Cloudflare:**
  - An Account Analytics: Read token can't list Web Analytics sites (`rum/site_info/list` gives an
    authentication error). The server finds the site tag by grouping the GraphQL analytics by
    `requestHost`.
  - Cloudflare only injects its beacon for requests that accept `text/html`, so the health check
    sends that header.
  - Cloudflare samples long queries: one 28-day query came back 1-in-10, rounded to tens (150
    visits). The server now asks in 7-day windows and adds them up (81 for the same range).
    Some older days are stored sampled (`sampleInterval` 10 even in a 7-day window). When that
    happens the page says the numbers are estimates.
- Fixed while building: the meta parser cut the description at the apostrophe in "Trustana's".

---

## 2026-11-25 — (`skills/resume-pdf-ats`) · The resume PDF stays ATS-ready on every rebuild

CC: "whenever you edited this PDFs, always remember to make sure that it is ATS ready."

- New `resume-pdf` skill. It covers where the source, build and download links live, the layout
  rules that keep the PDF parseable, and the post-deploy check.
- `pnpm resume:check`: `check-ats.swift` reads the PDF with PDFKit, the way a parser does. It checks:
  - 2 pages, with the name on the first line and the contact details in the body;
  - the standard headers, in order;
  - role lines in `Title | Company | dates` form;
  - no ligatures or em dashes;
  - the title metadata and the links.

  `check-ats.sh` adds:
  - embedded fonts and no images;
  - a one-column source;
  - the download filename.
- `pnpm resume:pdf` now runs the check after every build. Today's PDF passes every check.
- The body type is 9.8pt, at the floor of the usual 10pt guideline. Left as is; the skill says
  never to go smaller.

---

## 2026-11-25 — (`copy/ready-to-work-globally`) · Location: open to remote, worldwide

- **Why:** CC: "so people will not think that I'm in Penang only", and "so that AEO and GEO can
  pick up". "Ready to work globally" was the first try; "open to remote, worldwide" won because
  "remote" is what recruiters and answer engines search for, and "(UTC+8)" answers a remote
  hirer's first question. Relocation was left out (not confirmed by CC).
- **Headers:** README, `/resume` (two contact lines, so nothing wraps alone on phones) and the
  resume PDF (`pnpm resume:pdf`, still two pages): "Penang, Malaysia (UTC+8) · Open to remote,
  worldwide". The About page's contact note says the same; the locked About intro keeps "ready to
  work globally".
- **Description** (meta, OG, Twitter and JSON-LD on `/`, `/about/`, `/resume`, plus the og
  editor's preview): "CC Teo is a product designer in Penang, open to remote work worldwide. 13
  years of B2B AI and enterprise products, and Trustana's only designer until Graas acquired it."
  (168 chars; the old one ended "Available for new work.", now carried by "open to remote work").
- **For answer engines:** the homepage `Person` gets the same `knowsAbout` list as `/resume`;
  `llms.txt` gets an "Availability" section (status, IC work, location and time zone, focus,
  contact), "IC work" in the summary, and "seven years shaping B2B AI products".
- **Search ranking (CC: "why is Webflow the first result?"):** CC's old Webflow page ("About Me -
  Teo Choong Ching", 2020) outranked the site for "Teo Choong Ching CC", and the site never said
  "Teo Choong Ching". Now: both titles lead with it ("Teo Choong Ching (CC Teo), Product Designer
  | B2B AI" and "… | Resume"), the `/resume` h1 and README heading say "Teo Choong Ching (CC)"
  (the PDF's order), the `Person` blocks list `alternateName` CC / CC Teo / Teo Choong Ching, and
  `llms.txt` names all three. Sitemap `lastmod` bumped. The rest is off-site and CC's: phase out
  the Webflow site, Search Console (request indexing), and profile links to designby.cc.
- **Old thumbnail in Google:** Google still showed the pre-#99 Trustana image, cached by URL. The
  image is now `og-home.png?v=2` everywhere; bump it whenever the picture changes (`og-thumbnail`,
  `seo-sweep`).
- **Not changed:** the resume headline's "0-to-1 Builder" (README and PDF say "Zero to One"); it
  matches the LinkedIn keywords on the spiral card, so CC decides.

---

## 2026-11-25 — (`docs/skills-after-copy-104`) · Copy skills after #103 and #104

- `write-cc-copy`: CC is available for IC roles (the site's wording, #104); the B2B framing and
  the intro card's sentence (#103); two voice rules from these rounds: add a keyword by inserting
  it into the existing sentence, and no dated lines or labels that repeat the obvious; a fit
  check for the intro and status cards.
- `slider-page-transitions`: the card table's status row (no labels since #104).
---

## 2026-11-25 — (`copy/about-now-no-date`) · About "Now": no date line

- **Change:** the About page's "Now" section drops its small "Updated October 2026" line, as the
  status card did in #104. The availability sentence (with "IC work", #104) stays.
- **Why:** CC: "we don't need those lines". A dated line goes stale and reads as unmaintained.

---

## 2026-11-25 — (`docs/preloader-skills-and-decisions`) · Skills, QA scripts and the decision record after #101

#101 merged and was checked live (desktop, iPhone size, reduced motion, the off switches, `/about/`
and `/resume`; the preloader file serves with a year's cache). This brings the rest of the repo's
know-how in line with it.

- **Decision record:** `research/2026-11-25-preloader-decisions.md`: each of CC's rounds, the
  rejected options (cut lines as % of the width, a fixed cut length, the preloader inside the
  bundle, inlining it, a non-blocking stylesheet), the performance table and open questions.
- **QA scripts fixed:** `check-slider.mjs` and `check-close.mjs` waited a fixed 9 s, which now
  lands mid-opening (the site takes about 11 s to come in). They wait until the preloader, the
  opening and the loader have gone, then 2 s. Both pass. The mobile slider check reports 0
  visible cards after step 1 with or without the intro: a quirk of its scroll steps, noted.
- **QA skills:** `verify-motion` (the preloader → opening → intro chain, what to check when it
  stalls, the off-centre-logo cause), `drive-headless` (a "how long until the site is in"
  recipe with the #101 baseline, the blocked-file fallback check), `slider-page-transitions`
  (the boot chain, `siteLogo()`, the new waits).
- **Design skills:** `motion-art-direction` gains "CC's motion taste" (calm first, low bounce,
  no blur, sequence don't stack, anchors stay put, seamless colour, CC tunes with dials);
  `logo-animation` points at the opening and the tuner.
- **Technical skills:** `preloader` links the decision record and lists the full check pass;
  `og-thumbnail` notes the block "CC" is also the preloader.

---

## 2026-11-25 — (`copy/status-card-ic`) · Status card: IC work, no labels

- **Change:** the status card (both trees) and the About page's "Now" line say "I'm available now
  for full-time, contract or freelance IC work." (was "… freelance work."). The card's small
  "Status" and "Updated October 2026" labels are gone (CC: "we don't need those lines").
- **Why "IC work":** CC wants to say they're available for IC roles. The resume, README and
  `llms.txt` already say "hands-on IC". Inserting "IC" keeps the line on two lines; "I'm
  available now for IC roles: full-time, contract or freelance." was tried and wrapped to three
  with "freelance." alone.
- **Layout:** without the labels the card would shrink to the sentence. `styles.css` keeps the
  desktop card at its old height (`min-height: 484px`, the measured size with the labels) and
  centres the sentence; the phone card keeps its 3:4 ratio (350×467) with the sentence centred.
  Checked headless on desktop and iPhone.
- **Left:** the About page's "Now" section keeps its own "Updated October 2026" line.

---

## 2026-11-25 — (`copy/intro-early-stage-b2b-saas`) · Intro card: B2B AI products

- **Change:** the intro card's second sentence, both trees of `designbycc-landing/index.html`:
  "Thirteen years in design, seven of them shaping AI products." became "Thirteen years in
  design, seven of them shaping B2B AI products."
- **Why:** CC wanted to say "early stage AI product teams". Saleswhale and Trustana (CC's seven
  AI years) were early-stage B2B SaaS startups. "B2B" is the recruiter search term that was
  missing from the card; the startup side is already on the About page ("five startups",
  "zero to one"). The headline keeps "enterprise teams" (who the work serves).
- **Rejected:** first try, "the last seven at early-stage B2B SaaS startups building AI
  products": accurate, but long, and on desktop it wrapped to five lines with "products."
  alone. CC: "keep it short, just say B2B AI products". Also rejected: "early-stage B2B SaaS AI
  product teams" in the headline (stacked adjectives, and it drops "enterprise").
- **Hover:** "B2B" joins the lit keywords (`INTRO_KEYWORDS` in `main.js`).
- **Fit:** checked headless on desktop (1505×880): four lines, same type size (72 px), as before.
- **Not changed:** the meta and JSON-LD descriptions, `/resume`, `resume.pdf`, `llms.txt` and the
  README don't carry this sentence and already say B2B SaaS; the About intro is locked.

---

## 2026-11-25 — (`feat/preloader`) · A preloader: the block C's, opening onto the opening

From CC's reference clip (stretchy type), the block "CC" of the link-preview image became a full-window
preloader on home visits. Built in a motion editor first (`docs/preloader/`, `pnpm preloader:edit`),
then moved into the site.

- **Motion (CC's rounds):** the two C's trade widths left to right and back; heights never change
  ("no need to shrink its size or its height"). Slowed down twice, bounce lowered (spring 0.12),
  motion blur and the editor's soft shadow removed ("do not use any motion blurred").
- **Cut lines:** first they slid and bounced with the stretch (their start was a % of each C's
  width). A fixed length was wrong; CC's sketch: **the start stays put**, a fixed distance in from
  the C's left edge, and the cut runs to the open edge. 23% of an even half matches both keyframes.
- **The exit (CC's order):** when the page has loaded, the C's settle to even halves, then the gap
  between them opens and the opening grows out of it (from 19%), the C's leave the frame. The real
  opening (`opening.js`) replaces the editor's stand-in logo: it waits on `sitePreloader.reveal`.
- **Seamless colour:** the preloader's background and cut lines are the page colour, so the gap
  shows no white step.
- **The logo tuner** (`localhost:8080/?tune`, dev only): CC found the logo off-centre (a bug: the
  opening measured itself while the grow had it at 35%; it now measures before the grow and uses
  `offsetWidth`) and too large. The panel sizes and places the opening's wordmark on the real page
  and saves to the same settings: CC set 39% wide (74% on phones), the flower doodle holds 0.35 s
  before the first cut (new; it used to cut straight away). Width is now a true % of the screen
  (it was a share of the header link, about 8% narrower).
- **Performance:** the preloader runs at 60 fps. It first shipped inside the site bundle, so on
  slow 4G it only appeared at 2.6 s; it is now three plain deferred scripts ahead of the bundle,
  joined and minified at build time into one fingerprinted `/assets/preloader-<hash>.js` (3.6 KB
  gzip), and appears with the first paint (1.4 s). The engine writes styles only when they change.
  Time until the site is in: 10.7 s vs 7.9 s on `main` (fast), 12.1 s vs 10.1 s (slow 4G); most of
  it is choreography (the minimum loop, the settle, the opening).
- Off switches: `?preloader=0` (opening only), `?opening=0` (neither). If the preloader files fail
  to load, the site falls back to the normal intro (checked by blocking them).
- New skill: `preloader`. `drive-headless` notes the longer wait before measuring cards.

---

## 2026-11-24 — (`docs/og-thumbnail-followup`) · Docs and skills after #99

#99 shipped the link-preview fix, the new image and its editor; checked live afterwards: the
deploy passed, `/resume` points at `og-home.png`, and the live image matches the repo's.

- README: `pnpm og:edit` and `pnpm og:images` in the commands, `docs/og/` in the docs table.
- "Where we are": the opening plays on every home visit (it still said a tab's first visit), the
  preview image, and the editor in the pick-up checklist.
- `og-thumbnail`: how to check a shipped image is live, and where the image is referenced.

---

## 2026-11-24 — (`fix/link-preview-image`) · The link preview shows designby.cc, not Trustana

CC shared designby.cc in Google Chat and the preview showed Trustana's logo. The page's own
`og:image` was right; the cause was #93's structured data: both `Person` blocks listed Trustana as
`alumniOf` with its URL, and Google used that organisation's logo as the page's picture.

- **Structured data:** the Trustana `Organization` is gone from both `Person` blocks, and each
  names its preview image (`"image"`). The descriptions keep the Trustana sentence.
- **New preview images:** the old ones were the retired brand (slashes, another face, beige) and
  the resume one still said Singapore. After many rounds of directions on a local canvas, CC
  picked 128 (the line in a tile, then two "C"s drawn as tiles with a cut line, in greys) and
  tuned it in the editor: "Zero-to-one product designer for AI products and enterprise teams" in
  light grey on the dark frame, "designby.cc" bottom left, and two mid-grey rounded "C" tiles.
  `/resume` uses the same image (the separate resume one is gone). `og:image:alt` follows it.
- **Editor:** `pnpm og:edit` opens `docs/og/editor.html`: select any part (frame, tiles, line,
  wordmark, cut lines), drag handles for margins, gaps, widths, corner radii and cut lines, or set
  every value in the inspector, including the font (repo, Google Fonts or system), weight,
  spacing, kerning, case and OpenType features. Save writes `docs/og/og-design.js` and runs
  `pnpm og:images`. `og.html` and the editor draw from the same `og-render.js`. A Google Font
  needs a connection when the image is built. **Preview mode** shows the thumbnail in Google Chat,
  Slack, iMessage, LinkedIn, X and WhatsApp cards and a Google result, with each page's real title
  and description and their character counts.
- New skill `og-thumbnail`: the files, the editor, how to add a control, the checks, and why the
  editor stays. `seo-sweep` points to it.
- Chat apps cache previews: links shared before this keep the old image for a while; new shares
  (or the URL with a query string, e.g. `?v=2`) get the new one.

`seo-sweep` now says why there's no company entity in the `Person` blocks, and where the images
come from.

---

## 2026-11-24 — (`chore/motion-design-skills`) · Twelve motion-design skills in the repo

The third-party skills used for the opening are now tracked under `.claude/skills/`, from CC's
installs of `iart-ai/motion-design-skills` and `iart-ai/webgl-animation-skills` (2026-11-23,
`npx skills add`): `animation-principles`, `motion-art-direction`, `logo-animation`,
`shader-glsl`, `particle-system`, `threejs-animation`, `after-effects`, `beat-sync-editing`,
`color-motion`, `motion-background`, `remotion-video` and `shot-composition` (about 360 KB of Markdown,
plus three JSX examples). `skills-lock.json` records each one's source and hash.

The installer had left them as symlinks into `.agents/skills/`, which `.gitignore` keeps local (it
duplicates `.claude/skills`), so committed links would have been broken in every clone: they are
real copies now. To update one, re-run `npx skills add <source>`, then replace the new symlink
with a copy again (`cp -R "$(readlink <name>)" <name>`). They're vendor files: their em dashes
and style are theirs, not site copy. The project's own motion decisions live in `opening.js`
and the devlog, not in these.

---

## 2026-11-24 — (`docs/devday-opening-research`) · Dev Day opening research notes

The spike behind the first opening idea (CC's OpenAI Dev Day reference): how each letter is
built in three layers (points, outline, fill) with measured per-letter timings, and how that
maps onto the wordmark. `research/2026-11-23-devday-opening-letters-spike.md`, plus the glyph
extraction script it used (`…-glyphs.py`: Switzer outlines and on-curve points via fontTools and
HarfBuzz). The letter build stayed in its lab; the note now says so at the top and points at the
opening that shipped (#94, #96).

---

## 2026-11-24 — (`feat/opening-every-visit`) · The opening plays on every home visit

#94 played the opening once per tab, so a reload got the old intro (the logo spanning the width
at the top). CC: keep the full opening for reloads too. The `sessionStorage` rule is gone from the
inline script and `opening.js`; reduced motion, page visits and `?opening=0` still skip it.

A repeat-visit variant (the big logo's cc blinking into eyes as it shrinks) was built and
dropped in the same branch: with the opening on every visit it would almost never run.

Kept from it: without the opening (reduced motion, `/about/` or `/penang/` directly,
`?opening=0`) the logo now starts where the opening's wordmark plays: centred, 62% of the width
(80% on phones, capped at 32% of the height; `OPENING_SHARE` in `main.js`, matching `opening.js`
`layout()`), instead of spanning the width at the top. The logo tween brings `x` home too.

Verified: `check-slider.mjs` desktop and mobile and `check-close.mjs` desktop and mobile PASS;
`/about/` lands the logo at its corner; a reload plays the opening again.

---

## 2026-11-24 — (`docs/skills-after-opening`) · Skills catch up with #93 and #94

The project skills now know about the opening and the Trustana copy round:

- `write-cc-copy`: the Trustana framing CC chose (only designer until the Graas acquisition) and
  where that fact lives, so the next change goes everywhere at once (About, meta and JSON-LD,
  `/resume`, the PDF source, `llms.txt`, README). Also two lessons from that round: keep each
  claim in its own clause ("joined… and was the only designer" read as on day one), and no
  pivot stories.
- `seo-sweep`: the current shared description, `alumniOf` Trustana in both `Person` blocks (no
  `worksFor`), and the PDF's new source and checks (`pnpm resume:pdf`).
- `slider-page-transitions`, `drive-headless`: a fresh browser plays the opening first (about
  6.5 s); `?opening=0` and `?opening=1`; a second nav in the same run skips it.
- `verify-motion`: what to check when the intro doesn't play after the opening.
- `swap-study-media`: the loader gate for live cards now opens after the opening hands over.

---

## 2026-11-24 — (`feat/opening-motion`) · The opening, and the logo eyes

The opening explored in the swap lab (local, `designbycc-landing/_swap-lab.html`; how it was
built: `research/2026-11-23-devday-opening-letters-spike.md`) is on the home page:

1. "designby" comes in.
2. A single-line flower draws in the cc slot.
3. The slot cuts through seven media on a 120 bpm grid: oil, crayon, glitch, shader, ink,
   halftone, pixels.
4. A technical-drawing cursor assembles and clicks; the click starts the bots.
5. The bots glare, collide, go dizzy and shocked, turn happy, and merge with a few confetti pieces.
6. The bold cc lands.
7. The wordmark flies into the header with the logo intro's own duration, delay and ease, while
   the site's intro (menu, card fly-in, intro lines) plays behind it.

About 6.5 s to the hand-off. CC's call on the eyes ending (cc becomes eyes, looks around): off,
one payoff is enough.

- **Who gets it:** an inline script in `index.html` decides before first paint and adds
  `.has-opening`, so the loader shows no spinner when the opening will play.
  - Home only: not `/about/`, `/penang/`, `#about` or `#contact`.
  - Once per tab (`sessionStorage`).
  - Never under reduced motion.
  - `?opening=1` and `?opening=0` force it on or off.
- **Hand-off:** the opening is the loader's cover. `main.js` runs its layout as before, then waits
  on `window.siteOpening.done` before the intro, and gives the logo to `siteOpening.flyHome()`
  instead of the pre-scaled logo tween. The flying wordmark eases its letter spacing to the
  logo's (the opening uses -0.02em, the header keeps +0.02em). It lands with a 0.2 s crossfade:
  the 19px text rounds its letter advances and the scaled one doesn't, about 1 px apart.
  Scaling the real logo up instead puts it a few px off, because its glyphs are pixel-snapped at
  19px. Found in `_opening-site.html`.
- **Safety:** a click or a key skips to the end. Any error, or 15 s, falls back to the normal
  intro (`bail()`). At the hand-off the cover, its ticker and its WebGL context are all removed:
  no canvases are left afterwards.
- **Logo eyes** (`logo-eyes.js`): once the intro has landed (`site:intro-done`, fired in both
  paths), hovering the header logo with a mouse turns its cc into eyes that react, then blinks
  back into the letters.
  - Poke 1, "huh?": looks at the cursor.
  - Poke 2, "again?": flat lids, an unimpressed stare.
  - Poke 3, "ugh": a full eye roll and a narrow glare.
  - Escalation resets after 4 s. Not on touch, not under reduced motion.
- **Code:** `opening.js` and `opening.css` are the lab's drawing and timeline code without the
  panel, fonts, debug labels or unused media; every rule is scoped under `.c-opening`.

Verified (headless, dev server):

- Desktop and iPhone recordings, end to end.
- A reload in the same tab skips the opening.
- Direct `/about/` and reduced motion: no opening.
- Click to skip works.
- The eyes arm after the intro.
- `check-slider.mjs`: PASS desktop (with and without the opening) and mobile. Mobile reports 0
  visible cards after step 1 with or without the opening: the check scrolls past them on phones.
- `check-close.mjs`: PASS desktop and mobile.
- During the opening: 16.7 ms frames (p95 16.7, also at 4× CPU slowdown).
- Idle cost after it: about the same as without it.
- Bundle: +35 KB JS (+13 KB gzip).

---

## 2026-11-24 — (`copy/trustana-graas`) · Trustana: the only designer until the Graas acquisition

CC asked for the About page's Trustana entry to say it was acquired by Graas, phrased so CC's
contribution reads clearly, then for the same framing everywhere. After a `copy-pass` (no pivot
story, no fragment) the entry reads: "Joined as the second hire, promoted from Senior to Lead. The
only designer until the Graas acquisition in August 2026, and took the product from zero to one: a
B2B marketplace, then PIM and AI enrichment, then Commerce Agents. Enterprise retailers across APAC
and the Middle East used it to process 30K+ SKUs a month." "Only designer until the acquisition" is
CC's own wording (LinkedIn still says "most of the past five years"; CC to update it there). The
"Now" section drops its "after it was acquired by Graas" clause: no repeat on one page.

Everywhere else (`seo-sweep`):

- Meta, Open Graph, Twitter and JSON-LD `Person` descriptions (homepage, `/about/`, `/resume`):
  "CC Teo is a product designer in Penang. 13 years of enterprise and AI products, and the only
  designer at Trustana until Graas acquired it. Available for new work." (162 characters; the
  130-170 range left no room for "full-time, contract or freelance", which stays on the pages).
- JSON-LD: Trustana added as a former organisation (`alumniOf`) on both `Person` blocks, so answer
  engines can tie CC to it; still no `worksFor`.
- `/resume`: the Trustana lede says the same as About.
- `llms.txt`: the summary and the career line.
- `README.md` (what GitHub shows for the repo): the resume part (header, About, Experience,
  Education, Skills) regenerated from `docs/resume/resume-pdf.html`, so it says the same as the PDF:
  Penang, designby.cc, 13 years, Trustana to Sep 2026, no em dashes. The repo docs below it are
  unchanged.
- `sitemap.xml`: `lastmod` 2026-11-24. `robots.txt` needed no change (it has no copy, and allows
  every crawler, AI ones included).
- `resume.pdf`: rebuilt (it was the May export: Singapore, "12+ years", Trustana "Present"). CC's
  Word source (`Teo_Choong_Ching_Resume.docx`, Cowork folder) came from a `create_resume.py` that's
  gone, and there's no Word or LibreOffice here, so the PDF now has a source in the repo:
  `docs/resume/resume-pdf.html`, printed by headless Chrome (`pnpm resume:pdf`). Content from the
  September Word export and `/resume`, through `resume-bullet-writer` (verb first, one to two lines,
  only sourced numbers), `resume-ats-optimizer` and `resume-formatter` (one column, real text,
  standard headers, contact in the body, Arial, A4, two pages). Customer names stay: the resume is
  where they belong.
- Not changed: the OG images (no Trustana text).

---

## 2026-11-23 — (`feat/remove-lissajous-card`) · The Lissajous "CC" card is gone

CC asked to remove the card entirely. Removed from both trees (desktop and mobile, matched by
`js-a-lissajous`, exactly one slide each), with its script `lissajous-c.js` (import in `site.js`)
and its `.a-lissajous` CSS. The JS bundle drops 3.4 KB. Seven cards now: intro, Trustana,
pipeline, LinkedIn spiral, Graas news, PENANG clock, status. Skills (`slider-page-transitions`
card table, `list-cards.py`, `swap-study-media` live-SVG notes) and the asset guidelines no
longer point at it. The markup and script are in git history (`fd388d9`).

Verified on the production build: `check-slider.mjs` desktop and mobile PASS (no overlaps;
Trustana is now followed directly by the pipeline card, screenshots looked at),
`check-close.mjs` desktop and mobile PASS.

---

## 2026-11-23 — (`style/resume-site-tokens`) · The resume looks like the rest of the site

The Resume overlay frames `/resume` (`public/resume.html`), which still had the React site's look:
Space Grotesk, the beige palette, right-aligned labels. Audit and refactor:

- **Type and colour:** Switzer and Geist Mono, ink `#141414` on `#f2f2f2`, quieter text mixed
  from ink (AA contrast). `theme-color` `#f2f2f2`.
- **Layout:** the About page's: a mono label in the first three columns, text in the next eight
  (six on wide screens), a hairline between sections; stacked on phones. The name leads the
  intro. Each role is company, then one mono line with title and dates (the dates moved up from
  under the text), then the text; the lede in full ink. Skills sit in two columns on phones too.
  Copy is unchanged word for word (checked by diffing the page text).
- **Fonts shared:** the slider's woff2 files moved from `designbycc-landing/fonts/` to
  `public/fonts/` (served at `/fonts/`, already cached a year), and the site, 404 and resume all
  load them from there. Opening the resume now downloads no fonts (2 requests in total, was 5);
  the three Space Grotesk files are deleted. The untracked `_*` labs point at `/fonts/` too.
- **Download button:** same button and note, on the site's tokens; the eight stacked
  `backdrop-filter` layers behind it became one gradient in the page colour (cheaper to scroll).
- **Overlay:** background `#f2f2f2`; Close now sits exactly where the menu's "Resume" link is,
  in the header's type (was 19px higher, beige, underlined), and the resume scrolls under a soft
  band like the header's on pages, so text no longer runs into Close on phones.
- **Print:** same structure in black on white, three pages.
- Removed: the inline `padding-top: 3px` nudge on the first role (#15), now unneeded.

Verified on the production build under `wrangler pages dev`: overlay opens, loads both fonts,
no horizontal overflow, Esc closes, desktop and iPhone; `check-slider.mjs` vs live and
`check-close.mjs` PASS; 404 page and print layout looked at; no console errors.

---

## 2026-11-23 — (`docs/preloader-spike-notes`) · Preloader research notes

Three research notes from 2026-10-08/09, written then but never committed. Research only; nothing
is built from them yet. They feed the "designby[ ]cc" preloader labs
(`designbycc-landing/_cc-lab.html`, `_cc-lab-2.html`, `_preloader-lab.html`, not shipped):

- `research/2026-10-08-nothin-preloader-spike.md`: why noth.in's preloader feels alive.
- `research/2026-10-09-parentheses-loader-spike.md`: frame-by-frame timing of a
  "( Published Tales )" reel, the model for a loader whose first word swaps while the page loads.
- `research/2026-10-09-sdf-motion-logo-spike.md`: the Sydney Design Festival 2018 motion logo,
  with GSAP eases fitted to tracked glyph positions.

---

## 2026-11-23 — (`chore/remove-react`) · The React site is gone from the repo

The site hasn't used React since the cutover (#88); this removes what was left (plan Phase 6).

- Deleted: `src/`, the root Vite/Vitest/ESLint/Tailwind/PostCSS/shadcn configs and the React
  tsconfigs. `tsconfig.json` now only type-checks `vite.site.config.ts`.
- Dependencies 67 → 5 (`gsap`, `vite`, `wrangler`, `typescript`, `@types/node`); lockfile
  entries 1000 → 274, a fresh `node_modules` 479 MB → 228 MB (most of what's left is
  `wrangler`). `pnpm test` and `pnpm lint` are gone: they only covered React files, and CI never
  ran them.
- Visitors see no difference, by design: the JS bundle is byte-identical to production and the
  HTML differs only in asset hashes. The CSS is 253 bytes smaller: the old `postcss.config.js`
  was also running autoprefixer over the slider's CSS. The prefixes it added (`-moz-column-gap`,
  `-moz-fit-content`, `-moz-user-select`, `-o-object-fit`) only served Firefox before 2021 and
  Opera 12.
- Skills kept to what applies to this site: `styleguide-check` and `verify-css` (Tailwind and
  `src/`) and `parity-check` (fidelity to smlxl.company, which no card follows any more;
  regressions are `check-slider.mjs`) are retired. `rebuild-hero-video` now points at the
  Trustana card in both trees; its `check-video.mjs` read the React page's `video.poster` and
  page scroll, so it couldn't work on the slider and is removed.
- Docs: `docs/plan.md` (shipped #39 record) removed; `docs/asset-guidelines.md` loses the
  Tailwind typography and Lottie sections and points at the tokens in `styles.css`; README
  describes the current stack.
- Public files untouched (CC: video sizes stay as they are; `public/fonts/` still serves
  `/resume`).

Verified on the production build under `wrangler pages dev`: every route's status and type
(`/`, `/about/`, `/penang/`, `/resume`, `/resume.pdf`, `/styleguide` 301, unknown 404);
`check-slider.mjs` against live production, desktop PASS. Mobile reported three moved cards at
step 1, and the same check of production against itself reports the same three (cards still
settling), so that step is noise, not this change. `check-close.mjs` desktop and mobile PASS;
the resume overlay opens, loads and closes on Esc; a direct `/about/` opens About; no console
errors.

---

## 2026-10-13 — (`swap/site-cutover`) · designby.cc serves the slider

The React page retires: `pnpm build` now builds the slider site (`designbycc-landing/`), so the
merge deploys it to designby.cc. Favicon and page title are unchanged (CC's condition).

- `public/_redirects`: the SPA catch-all (`/* /index.html 200`) is gone. Cloudflare Pages only
  behaves as an SPA when there is no `404.html`; the site ships one, so unknown paths get a real
  404. `/styleguide` (the React site's internal type specimen) 301s home.
- `public/_headers`: `/media/*` cached a week, like `/trustana-*`.
- `public/sitemap.xml` and `public/llms.txt` gain `/about/` (CC: About only; `/penang/` is live
  but unlisted).
- The root `index.html` (React entry) is removed; `src/` and the React dependencies stay until a
  quiet week live (plan Phase 6, `chore/remove-react`).
- Rollback: Cloudflare Pages dashboard → previous production deployment → Rollback, or revert
  this PR.

Verified on the production build served by `wrangler pages dev` (answers like Pages: pretty URLs,
`_headers`, `_redirects`, 404.html): every route's status and type, then the e2e journeys below.

---

## 2026-10-13 — (`seo/site-head`) · The slider carries the live site's metadata

The slider page had only a title and `noindex`. It now carries the live homepage's head
unchanged: description, author, robots `index`, canonical, favicon, Open Graph and Twitter
(`og-home.png`), and the Person, WebSite and VideoObject JSON-LD (VideoObject `embedUrl` now `/`
instead of the retired `/#work`). `theme-color` follows the slider's background (`#f2f2f2`, was
the old beige). `resume.html` `og:site_name` unified to "Design by CC" (open since #80).

No JavaScript (crawlers, LLM tools): `public/noscript.css`, linked from a `<noscript>`, hides the
loader and slider and shows the About page as a plain document, so the old hand-written noscript
copy isn't needed: the About text is already in the HTML. The same view is the fail-safe if the
site module never runs (checked by blocking it: the About page shows after 10s).

---

## 2026-10-13 — (`feat/site-routes`) · About and Penang get real addresses

`/about/` and `/penang/` were only lookup keys: a shared link, reload or Cmd-click opened nothing.

- Card hrefs and `data-url` are root paths (`/about/`), matched by path on the same origin, so
  the same markup works on localhost, previews and production.
- Opening a page pushes its path; home pushes `/`; back/forward read `location.pathname`.
- A direct visit opens the page at once (`initialLayer()` / `openInitial()`), with home built
  underneath, so the logo and Esc fade home as usual. Back from a direct visit leaves the site, as
  any page would (no injected history entry).
- Old links: `/#about` and `/#contact` open About and settle on `/about/`; `/#work` settles on `/`,
  on load and on `hashchange`.
- The build writes `about/index.html` and `penang/index.html`, copies of the homepage with their
  own canonical and `og:url`; the title stays the same everywhere (CC).
- `404.html`: wordmark, "Page not found", "Return to home" (the React 404's words), site fonts.

---

## 2026-10-13 — (`build/site-vite`) · The slider builds with Vite

`vite.site.config.ts` builds `designbycc-landing/` to `dist/` with `public/` at the root:
`pnpm dev:site` (:8080), `pnpm build:site`, `pnpm preview:site` (wrangler, :8788, like Pages).

- One module, `site.js`: GSAP 3.12.5 from npm (`gsap-globals.js`), then the page scripts in their
  old order. The vendored UMD files broke under the dev server (strict-mode `self.window`
  assignment), so `vendor/` is gone. JS 45 KB gzip (live React: 57).
- CSS and fonts are fingerprinted into `/assets/` (year cache); `../public/` paths became root
  paths; the resume overlay fetches `/resume` and checks it got the resume, not a fallback page.
- Only `index.html` and `404.html` are inputs, so scratch `_*.html` and `_penang/` never ship;
  HTML comments are stripped from the output.
- Tools default to the site server (`check-slider`, `check-close`, `drive.mjs`); `check-close`
  reads the page from the path; `drive.mjs` gained `--no-js`, `--reduced-motion` and real Tab/Enter.

---

## 2026-10-12 — (`fix/penang-clock-box`) · The PENANG card's box is its clock face

CC: the clock seemed to enlarge while scrolling, its spacing was off and the title wasn't centred.
Measured against `main`: the base rules size the face by `--initial-scale` inside an inner that is
already scaled by it, so the face filled only ~73% of its 589px card box (the share changes with
window width), pinned to the top-left. The slider grows and pins the box, so the face seemed to
swell and drift; PENANG centred on the box, 42-56px right of the face; the face floated ~85px
above the other cards' baseline; and the box's empty right side left a 104-131px gap before the
next card (other gaps: 20px).

`c-slider-clock--box`: the card box is 433px (589 × 0.735, the face's size at CC's 1505px
window) and the face, numerals and hands fill it in the same proportions (numerals 101/589, hands
10/589 of the face). The intro card works this way already: its box is its content.

Verified vs `main` (headless, same scroll positions, `drive-headless`): face at rest 233px on both;
peak while scrolling 318 vs 316px; title offset 0px (was 42-56); face on the shared baseline; gaps
20px both sides; spin and the Penang page unchanged; `check-slider`, `check-close` PASS desktop and
mobile. Side-by-side frames reviewed before showing CC.

---

## 2026-10-12 — (`copy/location-penang`) · CC is based in Penang, ready to work globally

CC: "Penang and ready to work globally from Penang." Everywhere the site said CC is in Singapore:
- **Live site:** meta, Open Graph, Twitter and JSON-LD descriptions ("a product designer in
  Penang"), JSON-LD address (Penang, MY), `og:locale` `en_MY`, the resume's contact line and OG alt
  text, llms.txt ("based in Penang, ready to work globally"), the footer ("Based in Penang",
  "Working globally" unchanged), the header's place name, and the live clock's zone
  (Asia/Kuala_Lumpur; same UTC+8). Styleguide samples follow.
- **Landing About intro:** "I'm a product designer based in Penang, ready to work globally."
- History stays as it was: the resume's Singapore customers, the Singapore agency and "Singapore's
  first online banking tool".
- `seo-sweep` and `write-cc-copy` record the new location.

Verified: `vite build` and `vitest` pass; no "Singapore" left outside the resume's history.

---

## 2026-10-12 — (`docs/skills-refresh`) · Skills refresh: a headless driver in the repo, a copy skill, stale notes fixed

CC asked to review the skills and add any that were missing. The headless Chrome driver and
no-cache server used to verify every landing change since 2026-10-11 lived only in the session
scratchpad, which was wiped; they're rewritten and kept in the repo now.

- **New `drive-headless`:** `serve.py` (no-store static server, prints the phone URL) and
  `drive.mjs` (JSON steps: nav, eval, shot, move, click, tap, wheel, wheel-until, drag, swipe,
  key, frame timing, main-thread cost), with `--device iphone|ipad`. Recipe for comparing cost
  against a clean `main` worktree. Tested on desktop (hover the LinkedIn spiral, 60 fps, cost
  read-out) and as an iPhone (swipe, tap the intro to `#about`, Esc home).
- **New `write-cc-copy`:** where CC's facts live, the fact rules (no customer names, left
  Trustana Sep 2026, UX years from AsiaRooms 2013, AI years from Saleswhale 2019), the voice
  (plain, minimal, no slogans or storytelling, no em dashes) and the loop (options with a pick,
  on the page, line by line, the debate rounds when CC asks). Previously spread over six memory
  notes.
- **`slider-page-transitions`:** state table dated 2026-10-12 (intro left-aligned on phones,
  spiral hover); the hover-motion pattern; baselines from a clean `main`; blank-page check.
- **`verify-motion`, `site-spike`:** headless first; the extension only to see CC's own tab.
- Outside the repo: the user-level `/ship` command now takes its sign-off from the session (it
  named an old model), waits for CI before merging, and documents shipping a batch one PR at a
  time.

---

## 2026-10-12 — (`perf/live-load`) · Faster first paint on phones, half the JavaScript

From a load audit of designby.cc (headless Chrome, empty cache, desktop and iPhone, Slow 4G +
4x CPU):
- **Hero video no longer blocks phone LCP.** `preload="auto"` + `autoPlay` forced the whole
  13–15 MB walkthrough to download at load, and the video was the phone's LCP element (~6.9 s on
  Slow 4G). Now `preload="metadata"`, no `autoPlay`; an IntersectionObserver plays it on screen
  and pauses it off screen (reduced motion still pauses). The poster is preloaded with
  `fetchpriority="high"`. Measured: **LCP 6.9 s → 2.6 s**, FCP 3.05 → 2.64 s (iPhone, Slow 4G,
  two runs each); the video still plays.
- **Main bundle 106.6 → 57.4 KB gzip.** `App.tsx` dropped `QueryClientProvider`, both toasters and
  `TooltipProvider` (nothing on the site used them); the internal `/styleguide` page is
  lazy-loaded.
- **Fonts:** `font-display: swap` (was `block`: invisible text for up to 3 s); the unused 700
  weight is no longer preloaded.
- **Caching:** `public/_headers` gives `/assets/*` and `/fonts/*` a year (immutable, fingerprinted)
  and the Trustana media a week; Cloudflare served everything at 4 hours.

Not done here, for CC to decide: a phone-sized hero rendition (re-encode from the master via
`rebuild-hero-video`), prerendering `/` to static HTML (~0.7–0.9 s FCP estimated), deleting the
~49 unused `src/components/ui/*` files and their dependencies, and turning off Cloudflare's email
obfuscation (adds a render-blocking script to `/resume`; dashboard setting).

Verified: `vite build`, `eslint` on the changed files, `vitest` pass; video plays when scrolled to.

---

## 2026-10-12 — (`fix/live-seo-refresh`) · The live site stops saying CC works at Trustana

An SEO and LLM-text audit of designby.cc found the same stale facts in every channel: meta,
Open Graph and Twitter descriptions, JSON-LD (`worksFor: Trustana`), llms.txt, the homepage hero
("Right now I'm at Trustana", "12 years") and the resume ("Mar 2021 — Present", "12 years… I work
on now"). CC left Trustana on 28 Sep 2026; UX years count from 2013 (13 in 2026).

- **Descriptions** (both pages, 8 places): "CC Teo is a product designer in Singapore. 13 years of
  enterprise tools, AI products and zero-to-one building. Available for full-time, contract or
  freelance work." (163 chars; the availability line is CC's approved About-page wording.)
- **JSON-LD:** `worksFor` removed on both pages; Medium added to `sameAs`; em dash out of the
  AJ&Smart name.
- **Hero:** "Most recently I was at Trustana, building…" and "13 years and five startups later, I'm
  still building from zero to one, and I'm available now for full-time, contract or freelance
  work." The styleguide sample follows.
- **Resume:** Trustana dated Mar 2021 – Sep 2026 (5 years 6 months, same counting as the other
  roles); role dates use an en dash, not an em dash; About says 13 years without "I work on now";
  Skills headings h4 → h3 (no skipped level).
- **llms.txt:** past tense, dates, Commerce Agents (Jul 2026) and the Graas acquisition (Aug
  2026), availability, Medium.
- **No-JS readers:** a `<noscript>` copy of the hero (h1, two paragraphs, resume/LinkedIn/email
  links) so crawlers and LLM tools that don't run JavaScript see more than meta tags.
- sitemap `lastmod` 2026-10-12; og:image:alt em dashes → colons.

Not done here (CC's call): re-export `resume.pdf` (still the May version), the location question
(Penang or Singapore), `og:site_name` ("designbycc" vs "Design by CC").

Verified: all JSON-LD parses; `vite build` and `vitest` pass.

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
