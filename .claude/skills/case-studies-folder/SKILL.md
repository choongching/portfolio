---
name: case-studies-folder
description: The "Case studies" folder card on designby.cc (designbycc-landing/case-folder.js): a blue 3D-looking folder in the slider that a click (tap) opens, its papers floating up, the hovered paper lifting with a playful tilt. Use when CC wants to change the folder's look or motion, name the case studies or give them covers, make a paper open a case study page, move or hide the card, or when the folder misbehaves (jumps, won't open, clipped papers, janky). Also the Drawer, its studio-only successor (docs/studio/drawer.js): a flat file drawer that slides out towards you, ear-tabbed files, two closed looks, seven front layouts, a shader paper texture, and a click that brings a file to the front.
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
perspective, the files inside; a click on a file brings it out to the front. It lives only in the
studio's **Drawer** tab until CC picks a look to replace the folder on the site (a separate PR then).

| File | Role |
|---|---|
| `docs/studio/drawer.js` | `DRAWER_DEFAULTS`, `DRAWER_CSS`, `createDrawerCard(S, width, { touch })`, `createDrawer()` (the tab: states, dials, frames). |
| `docs/studio/paper.js` | `paperTile()`: a WebGL fragment shader that paints one seamless paper tile (cached image URL). |
| `docs/studio/proto.js` | `createProtoTab()`: the canvas, states and the inspector (dials, search, tabs, the Save bar) shared by the Folder and Drawer tabs (`motion-studio` skill). Frames can be fixed boxes (`box: [1200, 900]`, Dribbble 4:3). |
| `docs/studio/write-defaults.mjs` | The panel's **Save** (⌘S): rewrites only the changed values inside `DRAWER_DEFAULTS` / `FOLDER_DEFAULTS`, in place. |
| `drawer-reach.json` (here) | `drive.mjs` steps: open, then check every tab hit-tests to its own file before and after lifting files 1 and 2. Change the card index `[1]` (0, 1 = the two looks). |

## How CC hands over changes

CC tunes the dials and presses **Save** (⌘S) in the panel's bottom bar. That rewrites the
defaults in `docs/studio/drawer.js` (or, on the Folder tab, `designbycc-landing/case-folder.js`:
the **live card**, so ship that as its own PR). At the start of a turn, check `git status` /
`git diff` on those files: saved values are there, uncommitted. Log them in the devlog and commit.
If CC says "take my changes" without saving, read their browser's localStorage `studio-drawer-1`
(Chrome, on localhost:8080) against `DRAWER_DEFAULTS` and write the difference in.

## How it works

- **Real 3D box** (`preserve-3d`): back, floor, two walls (sloped with a `clip-path`: full height
  at the front, low at the back, so the sides show and nothing sticks up). One pose value `t`
  (0 shut, 1 open) drives the slide, the file spacing and the lens: `perspective = persp / t`, so a
  shut drawer is flat. `pose.slit` is the hover peek; `pose.fb` / `pose.ftip` the front's bounce;
  `pose.fwd` the chosen file's shadow.
- **Files** are SVG paths built by `roundedPath()` (every corner a circular-looking arc): ear tabs
  with a sloped side, round top corner (`earTop`) and a hollow at the foot (`earFoot`). A lifted
  or chosen file shows its face: "Case study N" and a picture placeholder.
- **Hover a file:** `liftFor()` measures on-screen rects so a lifted file stops just under the next
  file's tab (`reach`); the back file lifts `lastLift`. Pointer events only on the SVG paths.
- **Click a file** (`choose()` / `putBack()`): it rises clear of the front's lip
  (`chooseGeometry()`: the highest edge in front of it), then comes towards you (z, `power3.out`)
  and settles centred and larger (`chooseW`, `chooseY`), its shadow growing. `yDelay` keeps it up
  until it's in front of the lip, so the arc has no pop. **The drawer never moves**: the paper rises
  past the card's top edge on the way (`.dr-spill` lifts the card's `overflow: hidden` while a file
  is out). Click elsewhere or Esc puts it back along the same path. A click on the chosen paper
  does nothing yet (the next step of CC's sequence: opening the case study).
- **Two closed looks** (side by side, `compare`; canvas titles "Index" and "Tab"): Index card and
  Drawer with a tab. Both have a **cover tab** (same ear shape, one SVG reaching into the front so
  no seam, its own drop-shadow clipped at the base); the file tabs sit to its right (`coverTabW`).
  The Cabinet look was dropped (2026-11-28); its code is still there, unused.
- **Seven front layouts** (`frontType`): Editorial (default), Portfolio, Centred, Label, Index card,
  Bottom line, Original.
- **Paper texture** (`paper*` dials): `paperTile()` paints a 512 px seamless tile in six layers
  (blotches, fibre streaks, loose fibres, grain, specks, an emboss lit from the top left), periodic
  noise so it tiles. The front gets it as a `z-index: -1` layer (above its colour, under its text):
  `multiply` on a light front, inverted and `screen` on a dark one. The cover tab gets the same tile
  as an SVG `<pattern>` offset by the tab's height, so it lines up with the front.

## CC's decisions (in order; don't undo without asking)

- Shut means **fully shut**: nothing peeks. Hover nudges it out and the files' **ear tips peek
  evenly**, all at one height ("make it even", a staircase looked weird), blank, no labels.
- A hover bubble "Browse case studies" grows at the pointer, soft grey, a lively dot tail; it pops
  on click. Only the **hovered file lifts**; no constant floating; one highlight colour for it.
- Motion **fast and stiff** (open 0.4 s `power4.out`). At full open a **very subtle, very quick**
  knock: files tip 0.35°, the front bounces a hair, as part of the open (no pause before it).
- Ears **low and wide** (height 4.5), spread like CC's index-card references; files sit low when
  open ("Files show" 2, space 10.5).
- Fronts after CC's references: no designby.cc on the cover tab ("just keep it blank"). Only words
  already on the card plus the files' range; never invent front copy.
- **Click a file:** one smooth arc to the front, fast (out 0.22 s, front 0.38 s, back 0.32 s); it
  rests low (`chooseY` 66) covering the front and its title, the other tabs peeking behind. **Only
  the paper moves**: CC rejected the drawer sinking to make room. Every paper in front shows the
  same UI (title, picture, tab colour).
- Canvas titles are one plain word ("Index", "Tab"). Dribbble: 4:3 frames close together; **⌘\\**
  hides both side panels for recording.
- CC's tuned defaults (2026-11-28, saved from the dials): Index front dark kraft `#795b3e`, no
  handle, page `#d4d5d9`; paper strength 0.97, size 44, blotches 1.7, grain 1.65, specks 1.15,
  tooth 1.4, no fibre streaks or loose fibres; Editorial, title 9.1, small text 3.5; tab numbers
  "( 01 )", left-aligned; the hovered file's tab turns black, its highlight `#eff5f5`.

## Gotchas met

- **A `//` note mid-line in `DRAWER_DEFAULTS` swallows every value after it** (hit 5 times: missing
  durations, files vanishing as NaN paths). Notes go on their own line. After any edit to the
  defaults run the audit: evaluate the object and list every `S.key` used without a default:
  `node -e "const s=require('fs').readFileSync('docs/studio/drawer.js','utf8');const D=eval('('+s.match(/export const DRAWER_DEFAULTS = (\{[\s\S]*?\n\});/)[1]+')');console.log([...new Set([...s.matchAll(/\bS\.(\w+)/g)].map(m=>m[1]))].filter(k=>!(k in D)))"`
  (only `layerShadow`, derived per look, should print).
- **The studio stores the whole settings object**, so a changed default never reaches a browser
  that saved before. `createDrawer` deletes a list of keys **once per `MIGRATE` version**: bump
  `MIGRATE` and add the key when you change a default by hand. (Save from the panel needs no bump:
  the stored values already equal the new defaults.) In headless tests, set a migrated key by
  clicking its control, not through `localStorage` before a reload.
- **`render()` skips the chosen file** (`chosenC`), so a fade it started earlier runs on: jumping
  from one "in front" state to another left the new paper's title and picture hidden. `choose()`
  kills tweens on its face, wash, label and path first. `render()` kills only the pose's `"t,slit"`
  (not `fwd`, which belongs to the choose timeline).
- `gsap.killTweensOf()` can miss a just-created staggered `fromTo` (the bubble stayed up after a
  quick click): keep a handle on it and `.kill()` that.
- A hover lean still running at the click left the chosen paper tilted: kill
  `"x,y,z,rotation,rotationX,yPercent"` on the file in `choose()` and `putBack()`.
- Absolutely positioned children of the cover tab box are already `-H` above the front: don't
  offset them again (the tab once floated a tab-height above the front).
- Inline `transform` beats a stylesheet rule: a layout that repositions the pull needs `!important`.
- The front's `box-shadow` doesn't follow a tab drawn over it: give the tab its own `drop-shadow`.
- 1 px lines drawn as a `repeating-linear-gradient` vanish on the zoomed-out canvas: draw each line
  as its own element (the Index card layout's rules).
- Never `overflow: hidden` on the front (it's `preserve-3d` and the cover tab sits above it).
- Studio state jumps call `api.to(stateOf(id))`; every state names `chosen` (0 for none) so Open
  and Closed put a chosen paper back.
- Never verify by counting: shoot the canvas zoomed (`--dpr 2` + `clip`) and LOOK, every look.
  For motion, shoot at dpr 1 (dpr 2 clips came out zoomed) and time frames (60 fps both ways).
