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
| Converted | **1 of 28** — card #3, `RUN` / run-agent-demo |
| Remaining | 27 cards, ~123 hotlinked assets (44 mp4, 28 webp, 23 jpg, 19 png, 9 gif) |
| Procedure | the `swap-study-media` skill — read it first, it holds the traps |
| Next target | the five heavy GIF/PNG assets (~28MB) that hang the page via `loadAllImages` |

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
- `loadAllImages` has no timeout and gates the whole study page on the remaining hotlinked
  assets. A 3-line fix exists; CC has passed on it three times. Offer only if the page hangs.
- The `spatial-2025` page layer is orphaned — card #3 no longer reaches it. Left in place to
  delete or repurpose when card #3 gets a real destination.

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
