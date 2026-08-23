---
name: swap-study-media
description: Replace a hotlinked smlxl.company asset in designbycc-landing/ with CC's own video or image — ffmpeg pipeline, card aspect-ratio adaptation, both DOM trees, card copy, and the verification pass. Use when the user says "swap the media", "replace card N", "put my video in the slider", "use my own footage", or points at one of the remaining hotlinked assets in the interaction study.
---

# swap-study-media

`designbycc-landing/` is progressively replacing its hotlinked `smlxl.company` media with CC's own work. This skill is the per-card procedure. It is implementation, not research — `site-spike` covers the research side and explicitly stops before code.

**Progress:** card #3 done (`RUN` / run-agent-demo, video), ADG-FAD card done (live Lissajous "CC" SVG — see "Live SVG media" below). Remaining: 121 hotlinked assets across 26 cards — 44 mp4, 28 webp, 23 jpg, 19 png, 7 gif. Re-count before quoting a number:

```bash
grep -o 'https://smlxl.company/wp-content/uploads/[^"]*' designbycc-landing/index.html | wc -l
```

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

Media goes in **`public/media/`**, committed. `public/` is the deployed folder, so:

- These files ship to designby.cc and are **publicly fetchable by URL**, even though the study page itself never deploys. Confirm the user is cleared to publish the footage before committing client work.
- The study references them as `../public/media/…`, reaching outside its own folder. **The study must therefore be served from the repo root**, not from `designbycc-landing/` as its own web root:

```bash
python3 -m http.server 8081          # from the repo root
# → http://localhost:8081/designbycc-landing/index.html
```

Serving `designbycc-landing/` directly gives a page that loads with silently broken media.

- Each clip is ~4 MB committed forever. Settle a clip *before* committing it; four exports of one video is four permanent copies. `public/` is already at ~13 MB against a documented 8–10 MB budget, so raise the total when it moves.

## 3. Edit the card — both trees

**Every card exists twice**: once under `.js-c-slider` (desktop) and once under `.js-c-slider-responsive` (mobile). Editing one and not the other is the most common failure here, and desktop-only testing will not catch it.

Per card, four things change:

| | |
|---|---|
| `<img src>` | → `../public/media/<name>-poster.jpg` |
| `<source src>` | → `../public/media/<name>.mp4` |
| `--aspect-ratio` | → the asset's native `N%` from step 1 |
| Copy + `href` | see below — the card still carries SMLXL's title |

## 4. The copy and the link — read this before touching `href`

A swapped card still says what SMLXL said. Leaving it means CC's product walkthrough runs under someone else's project title.

**The `href` is not what it looks like.** It points at `smlxl.company/project/<slug>/`, which reads as an external link. But `main.js:558` binds *every* slider anchor whose href matches a `.page-layer[data-url]`, and most project slugs have one:

```js
const layer = this.layerFor(a.href);
if (!layer) return;           // only genuinely external links navigate
a.addEventListener("click", e => { e.preventDefault(); /* in-page transition */ });
```

So the click was **always** intercepted and stayed in-page. The problem is never "it leaves the site" — it is that the destination layer is still full of SMLXL's content.

Options, in order of preference:

1. **Point at a real destination** once one exists — a CC project layer.
2. **Make the card inert** as a stopgap: *remove the `href` attribute entirely*. `bind()` selects `a[href]`, so a hrefless anchor is never wired up — no dead listener, no transition into a foreign layer. Keep it as `<a role="link" aria-disabled="true">` so the element and its styles survive; no CSS keys on `a[href]` or `:link`, so nothing moves visually.
3. Leave the SMLXL link only if you are deliberately keeping the transition demo working end-to-end.

Setting `href="#"` is the wrong stopgap — it stays bound and transitions to nothing.

The orphaned `.page-layer` stays in the DOM, unreachable. Cheap to delete or repurpose later; note it rather than removing it mid-swap.

## 5. Verify — computed, not eyeballed

Serve from the repo root, then in the page:

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

## Live SVG media — the no-file variant (ADG-FAD card, `lissajous-c.js`)

A card doesn't need a media file: the ADG-FAD card replaced its GIF with a live SVG animation.
What transfers to any future live-media card:

- **Keep the `.a-image` ratio box.** Drop the `<img>`, absolutely fill the wrapper with a panel
  div (`.a-lissajous` pattern: flex-centered, own background). Engine geometry
  (`captureBaseHeights`, `measure()`, the click transition's `dataset.baseHeight`) reads heights
  from the ratio box and never notices the media isn't an image.
- **Script loads before `main.js`** and builds its DOM at `DOMContentLoaded`, instance-based
  (no ids — the card exists in both trees, so everything mounts per `.js-<name>` container).
- **Gate the rAF loop**: park until `.js-b-loader` is gone (the intro would otherwise play
  invisibly behind the loader), skip DOM writes for the hidden tree (`offsetParent === null`)
  and unchanged frames. Perpetual motion (idle breathing) means the loop runs forever once
  revealed — keep per-frame work trivial.
- **Bind interactions to the card anchor** (`container.closest("a")`), not the panel — the
  slide is `pointer-events: none`, the item `all`, so the whole card is the hit area. Hover
  and click coexist with the drag engine; clicks on an inert (hrefless) card are free.
- **Verification differs from §5**: no poster/audio checks. Instead sample the path `d` over
  time (changing = animating; a 2π click-spin must land back in the breathing band) and
  remember rAF freezes entirely while the Chrome window is occluded — a `d` that never moves
  usually means the window is hidden, not that the code is broken (`verify-motion`).
- One `img[src]` leaves the loader gate per tree — the `strays`/link-count checks in §5 still
  apply unchanged.

## What this skill does NOT do

- It does NOT hold study media to the designby.cc delivery rules (dual mp4/webm, `.webp` poster, `preload="none"`). See the `public/media/` split-case table in `styleguide-check`.
- It does NOT restyle the study. `designbycc-landing/` is deliberately off-system.
- It does NOT decide whether footage is cleared for public release. Ask.
