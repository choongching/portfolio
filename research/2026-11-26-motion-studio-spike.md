---
date: 2026-11-26
topic: motion-studio-spike
type: spike
agent: manual
trigger: cc-motion-tooling-request
status: open
related: [2026-11-25-preloader-decisions]
tags: [tooling, motion, intro, cards, design-canvas]
---

# Motion studio: research and spike (2026-11-26)

CC asked for an internal tool to watch the home intro (the logo animating up into the header, then
the cards sliding in) and tweak it: speed, timing values, rounded corners, shadows, background
colour, border and outline colours, approached like a design canvas app.

## What's already there

| Part | Settings | Tool |
|---|---|---|
| Preloader (block C's) | `preloader/preloader-design.js` | `pnpm preloader:edit` (keyframes, exit, look) |
| Opening (designby, flower, cuts, bots, cc) | `P` in `opening.js`; size and place in the preloader file's `site` | `localhost:8080/?tune` (logo size, place, flower hold) |
| Logo flies home, menu, cards in, intro lines | Hard-coded in `main.js` | None |
| Card look (radius, colours) | `styles.css` tokens; no border or shadow tokens | None |

So the gap was the second half of the sequence and the card look.

## Options looked at

- **Theatre.js** (`@theatre/core` + `@theatre/studio`): the closest to "After Effects in the
  browser": outline panel, props panel, sequence editor with keyframes. But the motion would have
  to move into Theatre's sequence model: the site's motion is GSAP tweens plus the preloader's own
  rAF engine, so it means rewriting the intro around it and shipping its runtime. The studio
  package is AGPL. Too heavy for tuning a dozen values.
  ([Studio manual](https://www.theatrejs.com/docs/0.5/manual/Studio),
  [sequences](https://www.theatrejs.com/docs/0.5/manual/sequences))
- **GSDevTools** (GSAP's scrubber): free since GSAP 3.13 made every plugin free. It scrubs the
  global timeline, but the site is on GSAP 3.12.5 and the preloader isn't a GSAP timeline, so it
  can't scrub the whole sequence. Worth adding later for the part after the opening.
  ([GSAP 3.13](https://gsap.com/blog/3-13/), [GSDevTools docs](https://gsap.com/docs/v3/Plugins/GSDevTools))
- **Tweakpane / lil-gui / Leva**: good knob panels, but only panels: no canvas, no timeline. The
  preloader editor and the tuner already show that a hand-made panel fits CC's taste better.
  ([Tweakpane v4](https://tweakpane.github.io/docs/migration/v4),
  [lil-gui vs dat.gui](https://discourse.threejs.org/t/lib-why-changed-dat-gui-to-lil-gui/62124))
- **Design-canvas conventions** (Figma, Framer, Replit's canvas): artboards on a dotted
  pannable canvas, zoom anchored on the cursor, layers on the left, inspector on the right.
  ([Replit canvas](https://docs.replit.com/design/canvas),
  [Framer Zoomboard](https://www.framer.com/marketplace/components/zoomboard/))

**Chosen:** our own, dependency-free, on the dev server. The real site plays in iframes, so
what CC sees is the site itself, not a re-creation.

## How the spike works

- `pnpm studio` opens http://localhost:8080/__studio/ (a dev-only route, so the frames are on the
  same origin and the studio can read and style them directly).
- **Canvas:** a desktop frame (1505 × 880, CC's window) and a phone frame (390 × 844), each the
  real site loaded with `?studio`. Drag or scroll to move, ⌘ + scroll or pinch to zoom, Shift+1 to
  fit. Hovering shows what's under the pointer, clicking selects it (as Figma does). **Interact**
  (I) hands the mouse to the frames.
- **Sequence (left):** Preloader, Opening, Logo flies home, Menu fades in, Cards come in, Intro
  card lines; then the Look: Page colour, Card style. The selection is outlined in both frames.
- **Inspector (right):** sliders and number fields (arrow keys step, Shift × 10), ease menus with
  a curve preview, a cubic-bezier editor for the logo's curve, colour pickers, shadow presets.
- **Timeline (bottom):** one row per step, measured from the frame (the preloader's reveal,
  the intro start, the logo landing), with a playhead. Drag a bar to change its delay, its right
  edge to change its duration.
- **Transport:** Replay (R), Pause (Space, GSAP only: the preloader keeps going), speed 0.25× /
  0.5× / 1× (preview only, never saved), Preloader and Opening on or off to get to the cards
  faster.
- **Look changes are live; motion changes replay the frames.** ⌘Z / ⇧⌘Z undo and redo.
- **Save** writes `site-design.js`, regenerates `site-design.css` and sets the page colour on
  `index.html`'s `<body>`. The dev server then reloads the frames.

## What changed in the site

- The intro's numbers moved from `main.js` into `designbycc-landing/site-design.js`, with the
  same values, so the site plays exactly as before. The card look is CSS variables in
  `site-design.css` (generated, loaded after `styles.css`).
- New tokens, off by default: `--card-border`, `--card-border-color`, `--card-shadow`. The
  border is an inset outline, so the bare video card's `clip-path` can't cut it.
- `?studio` reads the unsaved draft and speed from localStorage. In `main.js` and `opening.js`
  it's behind `import.meta.env.DEV`, so it's not in the build; in `site-preloader.js` it's behind
  the localhost check, as `?tune` already is. The fail-safe timers stretch in slow motion.
- Checked: the build, `check-slider` desktop and phone PASS, card radius 16 / 8 px with no
  shadow and no studio code on the plain site.

## Known gaps

- The shadow is clipped on the bare video card (its `clip-path`), and it draws a rectangle
  on the LinkedIn spiral card, which has no rounded box.
- Desktop cards are drawn at a fixed size and scaled down, so a 1 px border renders thinner on
  smaller windows.
- No scrubbing: Replay plus slow motion. GSDevTools (after a GSAP 3.13 upgrade) could scrub the
  part after the opening.
- The phone frame is the phone layout at phone width, but with a mouse: no touch, no iPhone UA.
- The preloader and the opening keep their own editors; the studio links to them.
- Page colour: Save doesn't touch `theme-color`, `404.html` or the OG image.

## Ideas for a next round

Scrubbing, keyframe-level editing of the cards (per-card stagger), side-by-side A/B of two
drafts, saved presets, recording a GIF or MP4 of a run.
