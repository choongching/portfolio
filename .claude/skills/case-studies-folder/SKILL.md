---
name: case-studies-folder
description: The "Case studies" folder card on designby.cc (designbycc-landing/case-folder.js): a blue 3D-looking folder in the slider that a click (tap) opens, its papers floating up, the hovered paper lifting with a playful tilt. Use when CC wants to change the folder's look or motion, name the case studies or give them covers, make a paper open a case study page, move or hide the card, or when the folder misbehaves (jumps, won't open, clipped papers, janky). Also the Drawer, its studio-only successor (docs/studio/drawer.js): a flat file drawer that slides out towards you, ear-tabbed files, three closed looks and four front layouts.
---

# Case studies folder

The 4th card on the home slider (#115), designed with CC in the motion studio's **Folder** tab
(2026-11-26). One module draws it everywhere:

| File | Role |
|---|---|
| `designbycc-landing/case-folder.js` | **The card.** `FOLDER_DEFAULTS` (CC's chosen values: the site uses these), `createFolderCard(S, width, { touch, reduced })`, `FOLDER_CSS`, and the site mount on every `.js-a-folder`. |
| `designbycc-landing/index.html` | The slide in both trees: `.c-slider-folder`, `--item-width: 589px`, `--aspect-ratio: 106%`, `.a-folder.js-a-folder` inside. |
| `designbycc-landing/styles.css` | `.a-folder` (fills the box) and `.c-slider-folder__box` (`pointer-events: auto`: unlike other media boxes, it takes clicks). |
| `docs/studio/folder.js` | The studio's Folder tab: both card sizes on a canvas, states, dials, Play. Dials preview only, in that browser (`localStorage["studio-folder-5"]`). |

`pnpm studio` → http://localhost:8080/__studio/ → **Folder**. To change the live card, copy the
values CC settles on into `FOLDER_DEFAULTS` (the inspector marks changed rows in bold).

## How it works

- **Layers, back to front:** ground shadows (soft + contact) · the "hand" (tilts/presses) → the
  rig (opens, comes closer) → back panel with a tab (SVG) · papers (`.fo-sheet` → `.fo-paper` →
  `.fo-wash`) · glass front (`.fo-front` → `.fo-glass`, `backdrop-filter` frost, title).
- **Depth without `preserve-3d`:** each layer has its own `perspective()` aimed at one vanishing
  point (`vp`), so DOM order does the stacking and the glass can blur what's behind it.
- **Units:** u = 1% of the card's width. One set of values fits the desktop design size (589,
  scaled by the slider) and the phone column (~350). The mount rebuilds only when the box's
  width changes by 1 px or more (the phone engine nudges widths by 0.1 px every frame).
- **States:** closed (papers peek `peekC`) → `open` (front snaps forward `back.out(2)` 0.3 s, the
  folder comes closer, papers float up and bob) → `pulled` = one paper lifted (others drop
  `sink` and get the light `wash`; the lifted one tips `twist` and follows the mouse in 3D).
- **Input:** mouse (`(hover: hover) and (pointer: fine)`): hover lifts and tilts the closed folder
  and shadows slide away from the pointer, press sinks it, click opens, hover a paper lifts it.
  Touch: tap opens, tap a paper lifts it. Click/tap the folder or anywhere else closes it;
  scrolling it off screen shuts it quietly. Keyboard: it's a `role="button"`, Enter/Space.
  A pointer that travelled more than 6 px (a slider drag) isn't a click.
- **Reduced motion:** `CALM` overrides: opens and closes at once, no travel, bob, tilt or spring.

## CC's decisions (don't undo without asking)

1. Opening is a **click**, not hover (hover opening was tried first). Closed must look shut and
   neat, with only the papers' top edges showing.
2. Papers **float up** and hang mid-air; the hovered one **lifts higher**. The papers behind it
   move up too, so they stay reachable.
3. Focus on the hovered paper: the others get a **light wash and drop a little**. A fade (see-
   through) with the hovered paper brought to the top was rejected: "the layers stay".
4. **Playful:** the lifted paper tips and follows the mouse; a quick **snap** opening; the whole
   folder **comes a little closer** to the viewer; realistic two-layer shadow; 3D tilt and press.
5. No card fill, no round arrow, blue `#4a8fe7`. Placeholder papers ("Case study 1, 2, 3") until
   CC names them; a paper click does nothing yet.

References CC gave: their own folder → wallet mockup, a Dribbble file-drawer video, a frosted
"Wrap Designs" folder. The record of every round: `docs/devlog.md` (`feat/case-study-folder`,
`feat/case-study-card`).

## Recipes

- **Name the case studies / covers:** the paper markup is built in `createFolderCard` (`.fo-head`
  title + mono number, `.fo-thumb`). Take names from CC only (`write-cc-copy`); give each paper
  its data (an array next to `FOLDER_DEFAULTS`) rather than `Case study ${c}`. Covers go in
  `public/media/`, as `.fo-thumb` backgrounds or an `<img>` with `object-fit: cover`.
- **A paper opens a case study page:** follow `slider-page-transitions` § "add a card that opens
  its own page" for the `.page-layer` and `PAGES`, then call the page transition from the paper
  click (today the click handler ignores papers on desktop; on touch the first tap lifts, so open
  on the second). Keep `preventDefault` on intercepted clicks.
- **Move or hide the card:** `slider-page-transitions` (both trees, same place; park it in the
  `<template class="js-hidden-cards">` to hide, as Pipeline is).

## Checks

- Headless (`drive-headless`), real input, against `?opening=0` (or wait ~14 s on `/`): wheel until
  the folder's centre is where you want it, read the paper rects with an `eval`, then `move` /
  `click` to those coordinates in a second run (positions shift as the slider eases). Assert
  `.fo-card.is-open`, `.fo-sheet.on`, and that the folder's x **doesn't change on click**.
- iPhone: `--device iphone`; bring it to the middle with `window.scrollBy` in an `eval`, then `tap`.
- `check-slider.mjs` desktop and `--mobile`, `check-close.mjs` both; build and check no studio
  code ships (`grep createFolder\b dist/assets/*.js` finds nothing).
- Cost: open it and run `metrics` (the bob is ~85 ms/s busy, 60 fps); closed it costs nothing.

## Gotchas met

- **The slider jumped on the first click (#117):** the folder takes focus, and the desktop
  engine's `focusin` → `reveal()` scrolled it to 45%. Fixed engine-wide: reveal only on
  `:focus-visible`. Any focusable thing inside a card would have done the same.
- GSAP: staggered tweens with `overwrite: "auto"` can land late and undo a newer state, so position
  tweens use `overwrite: true`. The wash/fade on a paper that also bobs must not use `true` (it
  would kill the bob): use `"auto"` or a separate element (`.fo-wash`).
- A settle tween with `overwrite: true` on the papers cancelled their fade back to full; the
  settle tween now doesn't overwrite.
- An inner function named `light` shadowed the colour helper `light()`, and the card threw on
  build ("Cannot access 'card' before initialization"): keep helper names distinct.
- Papers must be tall enough (`sheetH` 44u) that their bottoms stay behind the glass when floating.
- The document-level "click outside closes" listener is removed in `kill()`; rebuilds call it.

# The Drawer (the next design; studio only, branch `feat/studio-drawer`)

CC wasn't happy with the polished 3D folder and asked to "re-imagine a drawer file container"
(2026-11-27/28): flat when shut, a click slides the whole drawer towards you in a one-point
perspective, the files inside. It lives only in the studio's **Drawer** tab until CC picks a look
to replace the folder on the site (a separate PR then).

| File | Role |
|---|---|
| `docs/studio/drawer.js` | `DRAWER_DEFAULTS`, `DRAWER_CSS`, `createDrawerCard(S, width, { touch })`, `createDrawer()` (the tab: states, dials, frames). |
| `docs/studio/proto.js` | `createProtoTab()`: the canvas, states, dials and Play shared by the Folder and Drawer tabs. Frames can be fixed boxes (`box: [1200, 900]`, Dribbble 4:3). |
| `drawer-reach.json` (here) | `drive.mjs` steps: open, then check every tab hit-tests to its own file before and after lifting files 1 and 2. Change the card index `[1]` (0, 1, 2 = the three looks). |

## How it works

- **Real 3D box** (`preserve-3d`): back, floor, two walls (sloped with a `clip-path`: full height
  at the front, low at the back, so the sides show and nothing sticks up). One pose value `t`
  (0 shut, 1 open) drives the slide, the file spacing and the lens: `perspective = persp / t`, so a
  shut drawer is flat. `pose.slit` is the hover peek; `pose.fb` / `pose.ftip` the front's bounce.
- **Files** are SVG paths built by `roundedPath()` (every corner a circular-looking arc): ear tabs
  with a sloped side, round top corner (`earTop`) and a hollow at the foot (`earFoot`).
- **Hover a file:** `liftFor()` measures on-screen rects so a lifted file stops just under the next
  file's tab (`reach`); the back file lifts `lastLift`. Pointer events only on the SVG paths.
- **Three closed looks** (side by side, `compare`): Cabinet drawer, Index-card box, Drawer with a
  tab. The last two have a **cover tab** (same ear shape, one SVG reaching into the front so no seam,
  its own drop-shadow clipped at the base); their file tabs sit to its right (`coverTabW`).
- **Four front layouts** (`frontType`): Centred (default), Portfolio, Editorial, Original.

## CC's decisions (in order; don't undo without asking)

- Shut means **fully shut**: nothing peeks. Hover nudges it out and the files' **ear tips peek
  evenly**, all at one height ("make it even", a staircase looked weird), blank, no labels.
- A hover bubble "Browse case studies" grows at the pointer, soft grey, a lively dot tail; it pops
  on click. Only the **hovered file lifts**; no constant floating; one highlight colour for it.
- Motion **fast and stiff** (open 0.4 s `power4.out`). At full open a **very subtle, very quick**
  knock: files tip 0.35°, the front bounces a hair, as part of the open (no pause before it).
- Tabs `#01`-style numbers with a dot, centred; ears **low and wide** (height 4.5), tabs spread like
  CC's index-card references; files sit low when open ("Files show" 2, space 10.5).
- Fronts after CC's references: no designby.cc on the cover tab ("just keep it blank"). Only words
  already on the card plus the site name and the files' range; never invent front copy.
- Dribbble: three 4:3 frames close together; **⌘\** hides both side panels for recording.

## Gotchas met

- **A `//` note mid-line in `DRAWER_DEFAULTS` swallows every value after it** (hit 5 times: missing
  durations, files vanishing as NaN paths). Notes go on their own line. After any edit to the
  defaults run the audit: evaluate the object and list every `S.key` used without a default:
  `node -e "const s=require('fs').readFileSync('docs/studio/drawer.js','utf8');const D=eval('('+s.match(/export const DRAWER_DEFAULTS = (\{[\s\S]*?\n\});/)[1]+')');console.log([...new Set([...s.matchAll(/\bS\.(\w+)/g)].map(m=>m[1]))].filter(k=>!(k in D)))"`
  (`layerShadow` and `div*`/`cabinet*`/`card*`/`tab*` keys are derived per look; ignore them).
- **The studio stores the whole settings object**, so a changed default never reaches a browser
  that saved before. `createDrawer` deletes a list of keys **once per `MIGRATE` version**: bump
  `MIGRATE` and add the key when you change a default. (It used to run on every load, which threw
  away CC's own dial choices on reload.) In headless tests, set a migrated key by clicking its
  chip or dial, not through `localStorage` before a reload.
- Absolutely positioned children of the cover tab box are already `-H` above the front: don't
  offset them again (the tab once floated a tab-height above the front).
- Inline `transform` beats a stylesheet rule: a layout that repositions the pull needs `!important`.
- The front's `box-shadow` doesn't follow a tab drawn over it: give the tab its own `drop-shadow`.
- Never verify by counting: shoot the canvas zoomed (`--dpr 4` + `clip`) and LOOK, every look.

