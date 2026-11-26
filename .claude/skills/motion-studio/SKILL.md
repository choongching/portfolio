---
name: motion-studio
description: CC's motion studio (pnpm studio, localhost:8080/__studio/): a design canvas with the real site in a desktop and a phone frame, to watch and tweak the home intro (logo flies home, menu, cards come in, intro lines) and the look (the intro card's text size, line spacing, padding and width, and its round arrow; header logo size; card corners, colours, border, shadow and spacing; page colour). Use when CC wants to change the intro's timing or easing, the card style, or to extend or fix the studio.
---

# Motion studio

`pnpm studio` starts the dev server and opens http://localhost:8080/__studio/ (if `pnpm dev:site`
is already running, just open that address). Decisions and options looked at:
`research/2026-11-26-motion-studio-spike.md`.

## Files

| File | Role |
|---|---|
| `designbycc-landing/site-design.js` | **The settings** (`SITE_DESIGN`): `logo`, `menu`, `cards`, `cardsPhone`, `lines`, `intro`, `look`. Save rewrites it. Desktop sizes are at the design canvas (cards scale to the window); `…Phone` keys are real pixels. |
| `designbycc-landing/site-look.js` | `lookVars()` / `lookCss()`: the look as CSS variables. Shared by the studio, the save and `main.js`. |
| `designbycc-landing/site-design.css` | Generated from the look by Save, loaded after `styles.css`. Don't edit by hand. |
| `docs/studio/index.html`, `studio.js` | The studio. |
| `docs/studio/write-site-design.mjs` | Save: checks the shape, writes the two files and the page colour on `index.html`'s `<body>`. |
| `vite.site.config.ts` → `motionStudio()` | The dev-only route: `/__studio/`, `/__studio/design`, `/__studio/save`. |

## How it reaches the site

- The frames load `/?studio` (plus `opening=0` / `preloader=0` when those are off).
- `main.js` reads the unsaved draft (localStorage `studio-draft`) and the playback speed
  (`studio-speed`) only when `import.meta.env.DEV` and `?studio`: never in the build.
  `opening.js` stretches its fail-safe the same way; `site-preloader.js` applies speed and page
  colour behind its localhost check (like `?tune`).
- Three kinds of change (`kindOf()` in `studio.js`): **live** (CSS variables set on the frames),
  **layout** (the intro card and the card spacing: shown live, then the frames reload without the
  opening, because desktop text has frozen line breaks and the slider engine measures cards and
  `GAP` at boot) and **motion** (a full replay).
- **The Canva-style toolbar** floats above the selection in the active frame (the last one
  clicked): steppers for the layer's `toolbar` keys, using the phone's own key in the phone frame.
  "Padding" steps all four sides at once and shows "Mixed" when they differ. Toolbar items can
  also be `{ type: "color", k }` (a swatch; no label = joined to the item before) or
  `{ type: "shadow" }` (the presets). Colour edits pass `keepCtx` so the picker isn't rebuilt
  while open.
- Card outline and shadow apply to boxed cards only (`BOX_CARDS`: text, card, project; not the
  clock or the spiral). The bare video card clips its corners on the inner, so shadows show.
- The timeline measures `window.__studio.marks` in each frame: `reveal` (preloader gap opens),
  `intro` (loader out, intro starts), `landed` (logo home).

## Adding a control

1. Add the value to `site-design.js` with today's value, so nothing changes until CC moves it.
2. Use it in `main.js` via `D.<group>.<key>` (or in `lookVars()` for a CSS variable, then use the
   variable in `styles.css`).
3. Add a row to the layer in `LAYERS` (`studio.js`): `num` (min, max, step, unit), `ease`,
   `color` or `bezier`. If it's timed, add it to `bars()` so the timeline shows it.
4. Save's check compares against the saved file's keys, so a new key needs the file updated
   first (step 1).

## Rules

- Defaults equal what the site already does. A new token must be off by default (`none`, `0px`).
  Check the computed value on both trees before trusting the stylesheet: the phone intro's line
  spacing was 1.2, not the 32px its mobile rule says, because a later `.c-intro` rule won.
- Compare layout sizes against `main` with `offsetWidth` / `offsetHeight` and computed styles
  (stash, measure, pop). `check-slider --mobile --compare` jitters by a few px between runs: the
  phone slider scales cards by scroll position.
- After changing the site side: `pnpm build`, `check-slider.mjs` desktop and `--mobile` PASS, and
  a plain load (no `?studio`) shows the same radius and no shadow (`drive-headless`).
- The preloader and the opening keep their own editors (`preloader` skill); the studio links to
  them rather than duplicating their settings.
- CC's motion taste (`feedback_motion_taste` in memory): slower first, low bounce, no blur.
- `drive-headless` tip: only `nav` steps honour `after`; use `{ "wait": ms }` between other steps.
