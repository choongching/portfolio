---
date: 2026-11-25
topic: preloader-decisions
type: research
agent: manual
trigger: cc-preloader-from-reference-clip
status: shipped
related: [2026-10-08-nothin-preloader-spike, 2026-10-09-parentheses-loader-spike, 2026-11-23-devday-opening-letters-spike, project-preloader, project-og-thumbnail-editor, project-opening-swap-lab]
tags: [preloader, motion, opening, performance, editor, landing]
---

# Preloader: decisions and history (#101)

Decision record for the home preloader shipped in #101 (2026-11-25). It covers what CC asked
for, what was tried and rejected, and why the code is shaped the way it is, so the decisions can
be revisited without replaying the session. How to use the tools: the `preloader` skill. The
change summary: `docs/devlog.md` (`feat/preloader`).

## The brief

CC shared a screen recording (Campari "World Cocktail Day", stretchy type) and asked for the block
"CC" of the link-preview image (direction 128, #99) as a preloader:

- it fills the whole browser window, fluid in %;
- the two C blocks expand and shrink "in a very very animated and lively manner";
- a simple motion editor app to tune it.

## Timeline of CC's rounds

Each line is CC's feedback, then what changed.

1. **"everything is way too fast! slow down"**: durations raised, holds added (now 1100 ms move
   + 500 ms hold per keyframe).
2. **"just left to right, and right to left, no need to shrink its size or its height"**: the
   heights are fixed at 100%; only the widths trade (first C's share 74% ↔ 26%).
3. **A "loading complete" state** in the same editor, to see the exit. Added: a "Loading complete
   ▸" button, a simulate-after-N-loops option, and the exit drawn on the timeline.
4. **"in reality, we will cue the entire animation of designbycc"**: agreed; the editor shows a
   stand-in logo, and the site uses the real opening (`opening.js`).
5. **The exit order (CC):** "first the two big C C blocks should stop in the middle of the page,
   which means they are same even sized, and then only we enlarge the gaps in between and start
   to show the designbycc logo", growing out of the thin gap. Built as settle → pause → open
   (the logo grows from the gap) → hand-off.
6. **"try removing [the light motion blur]"**, then **"do not use any motion blurred"**: the blur
   (an SVG filter driven by speed) was deleted from the engine, the editor and the settings, not
   only switched off.
7. **"less bouncy too?"**: spring bounce 0.12 for the keyframes, 0.1 for the settle.
8. **"i dont like these blurred edges"**: the editor's soft drop shadow became a 1 px outline.
9. **Migrate into the landing page, locally first.** The preloader plays on home visits with the
   opening (`.has-opening`), and its gap opens onto the real opening.
10. **"the logo is off centered, and the logo size is way too large"**, plus a request for an
    editor for its size and position: this was a bug plus a missing tool (see below). The logo
    tuner was built on the real page (`?tune`).
11. **The cut lines "shift position and bounce back and forth each time it moves"**: first fix
    (a fixed length from the open edge) was wrong. CC's sketch: **the cut's start stays in its
    origin position** and the cut runs to the open edge. See "Cut lines".
12. **"background colors are different, please make it seamless"**: the preloader's background
    and cut lines were white against the page's #f2f2f2. Both now use the page colour.
13. **"the flower doodle scene stays a bit longer after it's done drawn"**: a hold after the
    doodle (it had none). CC set 0.35 s in the tuner.
14. **CC's saved values:** logo 39% of the screen wide (74% on phones), grows from 19%, preloader
    plays at least 1550 ms, flower hold 0.35 s.
15. **"run performance checks, clean up"**, then **"is this the most ideal strategy?"**: see
    "Performance".

## Decisions and why

### Motion

- **Widths trade, heights fixed** (CC, round 2). Any keyframe can still set heights (`h1`, `h2`),
  but the shipped keys keep 100%.
- **Easing:** spring with low bounce. Other easings (back, snap, smooth, anticipate, inBack,
  linear) stay in the editor.
- **No motion blur, anywhere** (CC, round 6). Don't reintroduce it as an option either.
- **Sizes in vmin** (% of the shorter side) so the frame, gap, radius and cut thickness scale
  with any window; the tiles fill the window minus the margin.

### Cut lines

- **Rejected: the start as a % of each C's width** (`from1` / `from2` per keyframe). The start
  slid as the width changed, and the spring made it overshoot: the "bounce" CC saw.
- **Rejected: a fixed length measured from the open edge.** The cut no longer stretched, but its
  start still travelled with the edge. CC: "this is also wrong".
- **Shipped: a fixed start** (`look.cutMode: "fixed"`, `cutStart`): a fixed distance in from the
  C's left edge, 23% of an even-half C, running to the open right edge. 23% is what CC's two
  keyframes already produced (16% of the wide C, 44% of the narrow one, both about 0.116 of the
  available width), so the poses look the same without the wobble. The per-keyframe mode is
  still selectable (`cutMode: "keyframes"`).

### The exit and the hand-off

- **Order: settle → pause → gap opens → logo grows → hand-off** (CC, round 5).
- **The real opening, not a copy of it.** The editor's stand-in logo exists only to preview the
  timing. On the site, `opening.js` waits on `sitePreloader.reveal` (the first frame the gap
  opens), then runs. Its 15 s fail-safe starts then, not at page load.
- **The grow scales the opening's cover** around the gap's centre, from `exit.logoScale` to 1 by
  `exit.logoGrow` % of the open phase. It starts only after `opening.run()` has measured itself
  (`sitePreloader.started()`).
- **The preloader drops its background when the gap opens**, so the gap shows the opening's
  cover behind it.
- **No hold or fade on the site** (the editor keeps them for previews): the doors leave and the
  opening is already playing.
- **Minimum play time** (`exit.minShow`, CC: 1550 ms): on a fast or cached load the page is ready
  almost at once, and without it the stretch would barely show. On slow loads it adds nothing.

### The logo's size and place

- **The off-centre bug:** the opening measured its wordmark (`getBoundingClientRect`) in the same
  frame the grow had scaled its cover to 35%, so it centred a third of its real width. Fixed
  twice over: the grow waits for `started()`, and the layout measures with `offsetWidth` (which
  ignores transforms).
- **Width is a true % of the screen.** It used to be a share of the header link's width, about 8%
  narrower than the number said (62 gave 57%). The layout now measures the wordmark at 100 px
  and scales. The default became 57 so nothing changed until CC tuned it (39).
- **One source for the size:** `window.SITE_LOGO` (the `site` settings), read through
  `siteLogo()` (`site-logo.js`) by both `opening.js` and `main.js` (the no-opening logo intro
  starts from the same place). The fallback inside `siteLogo()` keeps the site working if the
  preloader scripts never load.
- **Why a tuner on the real page,** not in the motion editor: the opening's size depends on the
  real fonts, the header wordmark and the viewport, which only the site has. The tuner saves to
  the same settings file as the editor.

### Colour

- **Seamless with the page:** on the site, the preloader's background and cut lines always take
  `--color-bg` (#f2f2f2), whatever the editor says; the editor's saved values match it.

### The flower hold

- The opening cut from the finished doodle straight to the first medium. `site.doodleHold` adds
  a hold. The cuts after it are counted from the hold's end, so 0.25 s steps keep them on the
  opening's 120 bpm grid; CC chose 0.35 s.

## Performance

Measured in headless Chrome against production builds (`drive-headless`), `main` vs this change.

| | `main` | Inside the bundle (first version) | Shipped |
|---|---|---|---|
| Site bundle, gzip | 57.3 KB | 60.7 KB | 57.5 KB + 3.6 KB preloader |
| Slow 4G: preloader on screen | n/a (opening at 2.6 s) | 2.6 s | 1.4 s, with the first paint |
| Site fully in: fast / slow 4G | 7.9 s / 10.1 s | 10.7 s / 13.2 s | 10.7 s / 12.1 s |
| Loop: frames, script | n/a | 60 fps, 14.5 ms/s | 60 fps, 8.6 ms/s |

- **Why outside the bundle:** inside it, the preloader could only appear once the whole 150 KB
  bundle had arrived, so on slow connections the screen stayed plain grey first. As plain
  deferred scripts ahead of the module, it runs as soon as its own small file arrives. Deferred
  scripts run in document order, so `window.sitePreloader` exists before `opening.js` and
  `main.js` run.
- **Why one built file:** three plain files meant three requests, unminified (6.5 KB gzip) and
  revalidated on every visit. The build (`preloaderBundle` in `vite.site.config.ts`) joins and
  minifies them into one fingerprinted `/assets/preloader-<hash>.js` (3.6 KB gzip, a year's
  cache). Dev serves the three files as they are, so the tools' saves show on reload. A
  placeholder tag carries the swap from the `pre` to the `post` HTML hook, because Vite warns on
  classic scripts it can't resolve.
- **Rejected:** inlining the preloader in the HTML. It saves a request, but the preloader
  already appears with the first paint, and editor saves would then need a build to show.
- **Rejected:** a non-blocking stylesheet, to paint the preloader before the CSS arrives. It
  risks a flash of unstyled page for a small gain.
- **The engine writes a style only when its value changes**, and caches the container's size
  through its ResizeObserver: script time in the loop dropped by about 40%.
- **What the extra time is:** choreography, not loading: the minimum loop, the settle and pause,
  then the opening (about 6.5 s). On slow connections the real lever is the opening's length, a
  design call for CC.

## Robustness

- `?preloader=0`: the opening only. `?opening=0`: neither. Reduced motion: neither.
- If the preloader file is blocked or fails, the opening runs without waiting, and the logo
  layout falls back to `siteLogo()`'s defaults. Checked by blocking `*preloader*`.
- 20 s fail-safe: the preloader never holds the site longer than that.
- If the opening bails, it calls `sitePreloader.cancel()`.

## Open questions to revisit

- The time until the site is in grew by about 2.8 s on fast connections. Options if it feels
  long: a shorter `minShow`, a shorter opening, or a shorter preloader on repeat visits.
- The flower hold of 0.35 s puts the media cuts 0.1 s off the 120 bpm beat; 0.25 or 0.5 lands
  them on it.
- `/about/` and `/penang/` load the preloader file but never play it (they have no opening).
  It is 3.6 KB and cached; split it out only if that ever matters.
