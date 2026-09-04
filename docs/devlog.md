# Dev log

What changed, why, and what was decided. Git holds the *titles*; this holds the reasoning —
the things that would otherwise have to be rediscovered.

Newest first. Started at #33; earlier work is in `git log` only.

---

## Where we are — updated 2026-08-23

**Live:** designby.cc (Cloudflare Pages, auto-deploys on merge to `main`). Homepage focuses the
Trustana walkthrough; `/resume` is the second page.

**Active thread — replacing the interaction study's borrowed media.** `designbycc-landing/` is a
private study recreated from `smlxl.company`. It is being converted card by card to CC's own
media and copy, so it stops depending on someone else's assets.

| | |
|---|---|
| Converted | **2 of 28** — card #3 (`RUN` / run-agent-demo), ADG-FAD card (live Lissajous `CC`) |
| Remaining | 26 cards, 121 hotlinked assets (44 mp4, 28 webp, 23 jpg, 19 png, 7 gif) |
| Procedure | the `swap-study-media` skill — read it first, it holds the traps |
| Next target | the remaining heavy GIFs (`Website_low.gif`, `hotdog_Thumbnail-1.gif`) — slowest hotlinks |

**Pick-up checklist:**

1. Serve from the **repo root**, not from `designbycc-landing/`:
   `python3 -m http.server 8081` → `http://localhost:8081/designbycc-landing/index.html`.
   (Study media lives in `public/media/` and is referenced as `../public/media/…`. Serving the
   study folder as its own web root loads the page with silently broken media. Note `pnpm dev`
   already uses :8080.)
2. New change → new branch off `main`, `type/kebab-slug`, one branch = one PR = one devlog entry.
3. Don't stack PRs — merging the base deletes the branch and **closes** the dependent PR.

**Known, unfixed, deliberate:**

- `public/` is ~13MB against the documented 8–10MB budget (mostly `trustana-walkthrough.mp4` at
  7MB). Study media adds ~4MB per converted clip.
- ~~`loadAllImages` has no timeout~~ — fixed (`fix/loader-timeout`): each image probe now races
  a 4s timeout, so the reveal is delayed by at most `IMAGE_TIMEOUT` and slow hotlinks pop in late.
- The `spatial-2025` page layer is orphaned — card #3 no longer reaches it. Left in place to
  delete or repurpose when card #3 gets a real destination.

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
