---
name: preloader
description: The designby.cc page preloader (two block "C"s that stretch while the home page loads, then open onto the opening animation), its motion editor and the logo tuner. Use when CC wants to change the preloader's motion, colours, cut lines, timing or exit, the size or position of the "designbycc" logo that grows out of the gap, how long the flower doodle holds, or when the preloader misbehaves (wrong colours, off-centre logo, late on slow connections).
---

# The preloader, its motion editor and the logo tuner

Home visits with the opening (`.has-opening`: home, not reduced motion) play, in order:

1. **The loop:** two block "C"s fill the window (sizes in vmin, fluid) and trade widths left to
   right and back. Heights never change. Each cut line starts a fixed distance in from its C's
   left edge and runs to the open right edge (CC's sketch: the start stays put).
2. **Loading complete:** `main.js` calls `sitePreloader.loaded()` once fonts and the home images
   are in. After at least `exit.minShow` ms of loop: the C's **settle** to even halves, pause,
   then the **gap opens**, the C's leave the frame and the opening (`opening.js`) **grows out of
   the gap** (from `exit.logoScale` % to full size).
3. The opening plays (the finished flower holds `site.doodleHold` s), its wordmark flies into
   the header, the site comes in.

No motion blur, no blurred edges (CC removed them). The preloader's background and cut lines use
the page colour (`--color-bg`, #f2f2f2), so the doors open seamlessly.

## Files

| File | Role |
|---|---|
| `designbycc-landing/preloader/preloader-design.js` | **The settings** (`window.PRELOADER_DESIGN`): `look`, `exit`, `site`, `keys`. Both tools save here. |
| `designbycc-landing/preloader/preloader.js` | The engine, `createPreloader(root, design)`. Shared by the site and the editor. Writes styles only when they change. |
| `designbycc-landing/preloader/site-preloader.js` | Wires it to the site: `window.sitePreloader` (`reveal`, `loaded`, `started`, `cancel`), `window.SITE_LOGO`, the grow, a 20 s fail-safe. |
| `designbycc-landing/site-logo.js` | `siteLogo()`: the logo settings with a fallback, used by `opening.js` and `main.js`. |
| `designbycc-landing/preloader-tuner.js` | The logo tuner (dev only). |
| `docs/preloader/editor.html`, `preview.html`, `serve.mjs`, `write-design.mjs` | The motion editor, its full-window preview, its server, the shared settings writer. |

The three preloader scripts are plain deferred `<script>`s in `index.html`, **outside the site
bundle**, so the preloader is up while the 150 KB bundle downloads (on slow 4G it appears with
the first paint). The build (`preloaderBundle` in `vite.site.config.ts`) joins them into one
minified `/assets/preloader-<hash>.js` (a year's cache) and fails if `index.html` stops loading
them. Dev serves them as they are, so saves show on reload.

## Tools

- **Motion editor:** `pnpm preloader:edit` (http://127.0.0.1:5179/docs/preloader/editor.html).
  Keyframes (share, heights, cut heights, easing, bounce, durations), the Exit (settle, gap,
  stand-in logo, hand-off, "On the site, play at least"), the Look (colours, margin, gap,
  radius, cut thickness, cut lines fixed or per keyframe, speed). "Loading complete" and the
  timeline show the exit. The logo there is a stand-in; the site shows the real opening.
- **Logo tuner:** http://localhost:8080/?tune (`pnpm dev:site`). A panel on the real page:
  logo width (% of the screen, desktop and phones), height cap, position from the centre (or
  drag the box), the grow, the minimum play time, the flower hold; guides, a static preview,
  "Hold before it flies home", Replay (keeps unsaved changes), Save. Never in the build.

## Rules from CC's rounds

- Slow, calm motion; widths trade, heights fixed; low bounce (spring 0.12, settle 0.1).
- The exit order: settle to even halves first, then the gap opens, then the logo grows out of it.
- Cut lines don't stretch from the back: the start stays put (`look.cutMode: "fixed"`, `cutStart`).
- The flower hold: 0.25 s steps keep the opening's cuts on its 120 bpm beat.

## Checks

- Headless (`drive-headless`): `.c-preloader` exists early, goes after the exit; the logo is
  centred (`.c-opening .wm` rect) and its width matches `site.size` %; 60 fps in the loop.
- `?preloader=0` (opening only) and `?opening=0` (neither) still work; blocking `*preloader*`
  must fall back to the normal intro with no errors.
- After a build: `dist/index.html` loads one `/assets/preloader-*.js` before the module script.
