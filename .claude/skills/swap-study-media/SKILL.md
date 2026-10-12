---
name: swap-study-media
description: Put CC's own video or image into a designbycc-landing/ card (the live site at designby.cc), replacing a card's media or adding a media card: ffmpeg pipeline, card aspect-ratio adaptation, both DOM trees, card copy, and the verification pass. Use when the user says "swap the media", "replace card N", "put my video in the slider", "use my own footage", or wants a new video or image card on the landing.
---

# swap-study-media

`designbycc-landing/` replaced all its hotlinked `smlxl.company` media with CC's own work, and is now the live site at https://www.designby.cc/. This skill is the per-card procedure for swapping or adding media. It is implementation, not research: `site-spike` covers the research side and explicitly stops before code.

**Progress:** done. Card #3 (Trustana montage video, bare: no titles or gradient; was `RUN` / run-agent-demo until 2026-10-06), ADG-FAD card (live Lissajous "CC" SVG, see "Live SVG media" below), Instagram card (live LinkedIn spiral, `linkedin-spiral.js`), Catalunya Ràdio news card (Graas × Trustana news, external link in a new tab); the pipeline-bottleneck card (2026-09-04) was **added**. Every other SMLXL card was removed (#52, 11 more on 2026-10-06, the last nine on 2026-10-12), so no SMLXL media or copy remains. This should print 0:

```bash
grep -o 'https://smlxl.company/wp-content/uploads/[^"]*' designbycc-landing/index.html | wc -l
```


> Adding, hiding or restoring whole cards, or giving a card its own page: see the `slider-page-transitions` skill. Verify with its `check-slider.mjs`.

## The rule that governs everything here

**Adapt the card to the video. Never re-export the video to fit the card.**

Each card carries an inline `--aspect-ratio: N%` where `N = height / width × 100`. Set it to the asset's *native* ratio and the `object-fit: cover` crop problem disappears entirely.

Three CapCut re-export rounds were once spent chasing 16:9 before this landed — CapCut inherits the source recording window's shape anyway, so the fight is unwinnable from that end. The actual fix was one number in the HTML (`56.25%` → `66.58%`).

## 1. Prepare the asset (lossless, no re-encode)

```bash
ffmpeg -i "<export>.mp4" -c:v copy -an -movflags +faststart public/media/<name>.mp4
ffmpeg -ss 0.5 -i public/media/<name>.mp4 -frames:v 1 -q:v 3 public/media/<name>-poster.jpg
```

- `-c:v copy` is a container swap — pixels untouched. Also remuxes `.mov` → `.mp4` for free.
- `-an` strips audio. The cards autoplay muted; audio is dead weight and a styleguide violation.
- `-movflags +faststart` moves the moov atom to the front so playback can begin before the full file arrives.
- `-ss 0.5` avoids a black or half-faded first frame.

Naming is kebab-case, `{descriptor}` or `{project-slug}-{descriptor}`, matching `docs/asset-guidelines.md` §6.

Get the native ratio:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 public/media/<name>.mp4
python3 -c "print(round(<height>/<width>*100, 2))"
```

## 2. Know where the media lives, and what that costs

Media goes in **`public/media/`**, committed. `public/` is the site's public folder (Vite `publicDir` in `vite.site.config.ts`, copied to the site root as-is), so:

- These files ship to designby.cc and are **publicly fetchable by URL**, on the live landing. Confirm the user is cleared to publish the footage before committing client work.
- The landing references them as root paths: `/media/<name>.mp4`, `/media/<name>-poster.jpg`. Root paths only resolve when the site is served at `/`, so serve it with Vite:

```bash
pnpm dev:site                        # → http://localhost:8080/ (also on the LAN for phones)
pnpm preview:site                    # the production build, as Cloudflare Pages serves it → http://localhost:8788/
```

A repo-root static server (`python3 -m http.server`) gives a page that loads with silently broken media.

- Each clip is ~4 MB committed forever. Settle a clip *before* committing it; four exports of one video is four permanent copies. `public/` is already at ~13 MB against a documented 8–10 MB budget, so raise the total when it moves.

## 3. Edit the card — both trees

**Every card exists twice**: once under `.js-c-slider` (desktop) and once under `.js-c-slider-responsive` (mobile). Editing one and not the other is the most common failure here, and desktop-only testing will not catch it.

Per card, four things change:

| | |
|---|---|
| `<img src>` | → `/media/<name>-poster.jpg` |
| `<source src>` | → `/media/<name>.mp4` |
| `--aspect-ratio` | → the asset's native `N%` from step 1 |
| Copy + `href` | see below: the card still carries the old card's title |

## 4. The copy and the link — read this before touching `href`

A swapped card still says what the old card said. Leaving it means the new footage runs under the old title.

**The `href` decides more than it looks.** `PageTransitions.bind()` in `main.js` binds *every* slider anchor whose href path matches a `.page-layer[data-url]` on the same origin (`href="/penang/"` ↔ `data-url="/penang/"`):

```js
const layer = this.layerFor(a.href);
if (!layer) return;           // only genuinely external links navigate
a.addEventListener("click", e => { e.preventDefault(); /* in-page transition */ });
```

So a matching click is **always** intercepted and stays in-page. The problem is never "it leaves the site"; it is that the destination layer may still hold the old card's content.

Options, in order of preference:

1. **Point at a real destination** once one exists: a CC project layer (recipe in `slider-page-transitions`).
2. **Make the card inert** as a stopgap: *remove the `href` attribute entirely*. `bind()` selects `a[href]`, so a hrefless anchor is never wired up — no dead listener, no transition into a foreign layer. Keep it as `<a role="link" aria-disabled="true">` so the element and its styles survive; no CSS keys on `a[href]` or `:link`, so nothing moves visually.
3. Leave the old link only if you are deliberately keeping its page working end-to-end.

Setting `href="#"` is the wrong stopgap — it stays bound and transitions to nothing.

The orphaned `.page-layer` stays in the DOM, unreachable. Cheap to delete or repurpose later; note it rather than removing it mid-swap.

## 5. Verify — computed, not eyeballed

Serve with `pnpm dev:site` (http://localhost:8080/), then in the page:

```js
const card = document.querySelector('.c-slider-project__image img[src*="<name>"]')?.closest('a');
const box  = card.querySelector('.c-slider-project__image').getBoundingClientRect();
({
  eyebrow:  card.querySelector('.o-font-small-title')?.textContent.trim(),
  headline: card.querySelector('.o-font-h4')?.textContent.trim(),
  hasHref:  card.hasAttribute('href'),                    // false if inert
  ratio:    +(box.height / box.width * 100).toFixed(1),   // must match --aspect-ratio
  poster:   [...document.images].find(i => i.src.includes('<name>'))?.naturalWidth,
  strays:   [...document.querySelectorAll('.js-c-slider a[href]')]
              .filter(a => a.href.includes('<old-slug>')).length,   // must be 0
})
```

Checklist:

- [ ] Rendered ratio matches `--aspect-ratio` (within ~0.5% for rounding)
- [ ] Poster `naturalWidth` equals the video width — poster and first frame agree
- [ ] Both trees updated (`grep -c '<name>' designbycc-landing/index.html` → **4**: img + source, twice)
- [ ] `strays` is 0; the other card links still work (`.js-c-slider a[href]` count drops by exactly 1 if you made this card inert)
- [ ] No console errors
- [ ] Audio stripped: `ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 <file>` → empty

**Video `readyState` of 0 with `networkState` 2 and no `error` is usually not a bug** — it is occluded-window throttling (see `reference_browser_occluded_window.md`). Confirm the asset itself is fine with a HEAD fetch returning 200 and the full content-length before chasing it.

## 6. Ship it

One card (or one coherent batch) per branch, per `feedback_branch_per_change`. Media swap and copy change are **separate** branches — they were split for card #3 and the split held up.

Avoid stacking the copy PR on the media PR: deleting the base branch on merge **closes** the dependent PR outright, and a closed PR cannot be reopened or re-based once its base is gone. Either merge bottom-up immediately, or base both on `main` from the start.

Add a `docs/devlog.md` entry — newest first, what changed and the non-obvious bit.

## Live SVG media — the no-file variant (`lissajous-c.js`, `pipeline-bottleneck.js`)

A card doesn't need a media file: the ADG-FAD card replaced its GIF with a live SVG animation,
and the pipeline-bottleneck card was added as one from scratch.
What transfers to any future live-media card:

- **Keep the `.a-image` ratio box.** Drop the `<img>`, absolutely fill the wrapper with a panel
  div (`.a-lissajous` pattern: flex-centered, own background). Engine geometry
  (`captureBaseHeights`, `measure()`, the click transition's `dataset.baseHeight`) reads heights
  from the ratio box and never notices the media isn't an image.
- **Script is imported in `site.js` before `main.js`** (one ES module; no `<script>` tags) and builds its DOM at `DOMContentLoaded`, instance-based
  (no ids — the card exists in both trees, so everything mounts per `.js-<name>` container).
- **Gate the rAF loop**: park until `.js-b-loader` is gone (the intro would otherwise play
  invisibly behind the loader), skip DOM writes for the hidden tree (`offsetParent === null`)
  and unchanged frames. Perpetual motion (idle breathing) means the loop runs forever once
  revealed — keep per-frame work trivial.
- **Bind enter/leave/click to the card anchor** (`container.closest("a")`), not the panel — the
  slide is `pointer-events: none`, the item `all`, so the whole card is the hit area. Hover
  and click coexist with the drag engine; clicks on an inert (hrefless) card are free.
- **A cursor-FOLLOWING interaction must NOT live on the anchor.** `SliderEngine.dragTo()` sets
  `pointerEvents: "none"` on every slider `<a>` mid-drag (`main.js:259-260`), so anchor-level
  `pointermove` goes deaf and fires a spurious `pointerleave`. `pipeline-bottleneck.js` instead
  listens on `window` and hit-tests a **fresh** `svg.getBoundingClientRect()` per event — fresh
  because GSAP scales/translates the card continuously; a cached rect maps the cursor wrongly.
  If the panel needs its own cursor (crosshair), re-enable `pointer-events: auto` on it — the
  card image atom is `pointer-events: none` and swallows the cursor style otherwise.
- **`prefers-reduced-motion`**: render one static frame and bind nothing
  (`pipeline-bottleneck.js` does; the Lissajous card predates the convention).
- **Verification differs from §5**: no poster/audio checks. Instead sample the path `d` over
  time (changing = animating; a 2π click-spin must land back in the breathing band) and
  remember rAF freezes entirely while the Chrome window is occluded — a `d` that never moves
  usually means the window is hidden, not that the code is broken (`verify-motion`).
- One `img[src]` leaves the loader gate per tree — the `strays`/link-count checks in §5 still
  apply unchanged. (An *added* live card contributes zero images and needs no loader work.)

### Adding a card (vs swapping one)

The engine hardcodes no card counts — everything is `querySelectorAll`-derived — so adding is
mostly the swap procedure minus the asset pipeline:

- New slide block in **both trees**, same ordinal position in each.
- Width via inline `style="--item-width: Npx"` on the item (the `c-slider-image` precedent);
  height comes from the ratio box. `align-items: end` bottom-aligns odd shapes for free.
- Use the plain `c-slider-card c-slider-card--light` skeleton for a copy-free media panel.
  The `c-slider-project` variant paints a dark title-protection gradient
  (`__inner::before`) and white overlay titles over the media — wrong for a light graphic.
- Inert card: `role="link" aria-disabled="true"`, no `href` (§4).
- Register the +1 slide count per tree in the `parity-check` divergence register, and note in
  the devlog that the conversion count is untouched.

## What this skill does NOT do

- It does NOT hold study media to the designby.cc delivery rules (dual mp4/webm, `.webp` poster, `preload="none"`). See the `public/media/` split-case table in `styleguide-check`.
- It does NOT restyle the study. `designbycc-landing/` is deliberately off-system.
- It does NOT decide whether footage is cleared for public release. Ask.
