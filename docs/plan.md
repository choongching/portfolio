# Plan — give the project layers real content (title, body, video)

**Spike:** `research/2026-08-02-smlxl-project-page-content.md`
**Touches:** `designbycc-landing/` only. The deployed React site (`src/`, `index.html` at repo root) is
not involved in any part of this.

---

## Context

Our card-click transition already lands correctly — the stage clears, the card centers, the conveyor
carries the destination up, the palette washes. Then it arrives on a stub: each `.page-layer` is a hero
box and one `<h1>`, ~30 lines of CSS. The choreography writes a cheque the destination doesn't cash.

The spike answers the "how" question, and the answer is unusually favourable: **the origin has no
content-reveal animation at all.** No stagger, no fade-up, no SplitText (all four SplitText references
in their bundle are commented-out imports). Every component's `__applyAnims()` is an empty function.
The content is simply at rest when the container mounts; the conveyor is the entire reveal.

So this is a **layout and markup job, not a motion job.** Everything hard is already built.

---

## Is it possible with the code we have?

Yes, and more cheaply than the transition was. Three reasons:

1. **The data contract already matches.** The origin's color wash reads `data-bg-color` / `data-color`
   off `main[data-barba="container"]`. Our `.page-layer` sections carry exactly those attributes and
   `colorWash()` (`main.js:433`) already tweens to them.
2. **The transition is destination-agnostic.** `sliderToLayer()` only ever touches the layer as a
   whole — `showLayer()`, one `position: fixed`, one `y` tween. It never reaches inside. A layer with
   46 blocks animates identically to a layer with 2.
3. **We don't need barba's fetch.** Their content arrives over the network because WordPress renders
   it; ours is static markup we can ship in the page.

**Effort: medium.** Roughly: Parts A + D + E are ~80 lines of edits across three files and are the
fiddly-but-small bits. Part B is ~220 lines of new CSS. Part C is bulk markup — mechanical, and the
only part that scales with how many pages we build out.

---

## The four things in our code that will fight a scrollable page

These must be fixed **before or alongside** the content, not after. Each is small; each breaks
something visible if missed.

| # | Where | What happens if untouched | Fix |
|---|---|---|---|
| 1 | `styles.css:78` — `body { overflow: hidden }` | Content taller than the viewport is simply unreachable. Nothing scrolls. | Part A |
| 2 | `main.js:748` — `loadAllImages()` queries `document` | The home intro is gated on **every layer image** loading. Add 40 project images and the first paint stalls behind all of them. | Scope the query to `main` |
| 3 | `main.js:818` — plays every `video[autoplay]` at boot | All layer videos start decoding on page load. 20+ concurrent streams. | Scope to `main`; layers use the observer from Part D |
| 4 | `main.js:68` — `freezeLineBreaks()` sets `white-space: nowrap` | It is correctly scoped to the slider track today. If it ever runs over layer prose, every paragraph becomes one unwrappable line. | Keep it scoped to `track`; never pass a layer to it |

---

## Part A — Scroll model

**Decision: the active layer is its own scroll container. We do not touch `body { overflow: hidden }`.**

```css
.page-layer.is-active {
  display: block;
  position: fixed;
  inset: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
body.is-changing-page .page-layer { overflow-y: hidden; }  /* no scrolling mid-flight */
```

Why this and not enabling body scroll:

- **Zero blast radius on home.** Body overflow is a global property; flipping it per-route means the
  home slider's layout can be measured while a scrollbar exists and re-measured when it doesn't. On
  any platform with classic (non-overlay) scrollbars that is a ~15px viewport width change, and
  `SliderEngine` derives everything from `window.innerWidth` and the viewport rect
  (`main.js:50`, `main.js:168`). We would be introducing a resize into the middle of a transition.
- **No scrollbar-gutter jump**, so no `scrollbar-gutter: stable` workaround that would itself change
  the home slider's available width.
- Transforms work identically on a fixed element, so the conveyor tween is unaffected.

**Required consequent edit — this one is easy to miss:** `sliderToLayer()`'s `onComplete` currently
runs `gsap.set(layer, { position: "", top: "" })` (`main.js:496`). With the layer permanently fixed,
that line would drop it back to static, and with `body { overflow: hidden }` still in force the content
would become unreachable. **Delete that line**, and the matching `gsap.set(layer, {position:'fixed'…})`
prepare on `main.js:491` becomes redundant (the CSS does it) — keep only the `y` tween.

Costs, stated plainly: no native page scrollbar, `scrollIntoView`/hash-anchors behave against the
container rather than the document, and mobile browsers won't collapse their URL bar on scroll. All
acceptable for a private study; all reversible if we later decide otherwise.

---

## Part B — Grid and component CSS

New CSS in `designbycc-landing/styles.css`, in our own token system (Switzer / Geist Mono,
`#f2f2f2` / `#141414`, radii 8/16, ease `cubic-bezier(.44,0,.56,1)`). The origin's numbers are
*proportions to translate*, not values to paste — same discipline as the July 19 restyle.

**`.o-container`** — flex-wrap, `row-gap: var(--grid-gutter)`, symmetric
`calc(var(--container-padding) - var(--grid-gutter)/2)` padding. Vertical rhythm between blocks is the
row-gap and nothing else; the origin has no inter-component margins on desktop.

**Columns — one class, not 36.** The origin ships `o-col-1@lg` … `o-col-12@sm` plus a parallel set of
`o-col-push-N`. We use a single `.o-col` driven by custom properties:

```css
.o-col { padding-inline: calc(var(--grid-gutter) / 2); width: calc(100% / var(--total-columns) * var(--span-sm, 6)); }
@media (min-width: 731px)  { .o-col { width: calc(100% / var(--total-columns) * var(--span-md, var(--span))); } }
@media (min-width: 1301px) { .o-col { width: calc(100% / var(--total-columns) * var(--span)); } }
```

with `style="--span: 10; --span-sm: 6"` on the element. `--total-columns` / `--grid-gutter` /
`--container-padding` **already exist** in our `:root` (`styles.css:47-66`) — they were carried over in
the restyle and are currently unused. This is a deliberate divergence from the origin, and it's why
Part B is ~220 lines instead of ~600.

**`.c-content`** — flex, `align-items: center` (`.vertical-align--top` modifier), inner capped at
`max-width: 1300px; margin-inline: auto`. Padding modifiers `--pb-40/60/80` and `--pi-0/60` keep the
origin's ÷3 step-down between the ≥1301px and 731–1300px breakpoints. `[data-linebreak]` renders as a
`20px` / `30px` spacer block.

**`.c-video`** — `.c-video__media` gets native `aspect-ratio`, `overflow: hidden`,
`border-radius: var(--border-radius)`, and the skeleton fill
`color-mix(in srgb, var(--color-text) 30%, transparent)`. That fill is worth keeping exactly as-is: it
derives from the washed ink color, so the pre-decode grey always matches whatever palette the
transition just landed on.

> **Naming collision — must not be ignored.** Our `--aspect-ratio` is a **percentage** feeding a
> `padding-bottom` hack (`styles.css:182`, `styles.css:748`). The origin's `c-video` uses
> `--aspect-ratio` as a **unitless ratio** (`1.7777`) feeding the native `aspect-ratio` property. Same
> name, incompatible units, and it *inherits* — a `.c-image` setting `--aspect-ratio: 1.777` would
> reach `.a-image::before` and compute `padding-bottom: 1.777` (invalid → collapses to zero height).
> **New components use a distinct `--ratio`** with the native property; the existing percentage var
> stays untouched.

**`.a-content-h1…h6`** — remapped onto our type scale, not the origin's Supreme sizes.

---

## Part C — Content markup

Per project layer, replacing today's hero + `<h1>` stub:

```html
<section class="page-layer" data-url="…" data-namespace="spatial-2025"
         data-bg-color="#141414" data-color="#f2f2f2">
  <div class="all-components">
    <div class="o-container o-container--full">
      <div class="c-video is-autoplay o-col" style="--span:12; --ratio:1.7778">…</div>
      <div class="c-content o-col vertical-align--center" style="--span:10; --push:1; --span-sm:6">…</div>
      …
    </div>
  </div>
</section>
```

**Decided 2026-08-02:**

- **Scope: `spatial-2025` only.** It is the exemplar that proves the grid, the component CSS, and the
  video observer. The other 20 layers keep today's hero + `<h1>` stub and are untouched. Whether to go
  wide — and whether that means inline markup or fetched fragments — is a decision for after we've seen
  this one land.
- **Copy: the origin's.** Consistent with how the study already treats their card copy: private study,
  media hotlinked, folder deliberately outside `public/` so it never deploys. The README's provenance
  note covers this and should be extended to mention the project-page copy explicitly.

Also fix while we're in there: `&amp;#039;` double-escapes at `index.html:777` and `index.html:806`
render as a literal `&#039;`.

---

## Part D — Lazy video

Our own implementation of the origin's `c-video` observer, ~30 lines in `main.js`:

```
for each .js-c-video.is-autoplay inside a layer:
  IntersectionObserver:
    intersecting → video.src = dataset.videoUrl; load(); play().catch(noop)
    leaving      → pause()
```

Wire creation into `showLayer()` (`main.js:448`) and **disconnect in `fadeHome()`'s** existing
`onComplete` (`main.js:629`), which already pauses the hero video — otherwise observers accumulate one
set per layer visit for the life of the session. The existing `data-src` hero video keeps working
unchanged; this generalises it.

---

## Part E — Enter/exit integration

`main.js`, all small:

1. **Scroll reset on enter** — `layer.scrollTop = 0` inside `showLayer()`, before the conveyor starts.
2. **Scroll reset on exit** — `layer.scrollTop = 0` alongside the existing `clearProps` in `fadeHome()`.
   Without it, a re-entered layer opens mid-page.
3. **Delete the `position`/`top` reset** in `sliderToLayer()`'s `onComplete` (per Part A).
4. **Scope `loadAllImages()` and the boot autoplay loop to `main`** (fixes #2 and #3 in the table above).
5. **Header** — no change needed. It's `position: fixed` at `styles.css:255` and takes
   `var(--color-text)`, so the color wash already flips the wordmark to the destination's ink. The
   origin's `has-transform` / `is-alt` scroll classes have **no CSS rules at all** in their stylesheet —
   dead code. We should not recreate them.

**Explicitly out of scope:** `relatedTransition` (~190 lines, needs a related strip and a footer we
don't have), and the `.c-related` block itself.

---

## Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| `--aspect-ratio` unit collision silently collapses images to zero height | **High** — fails quietly | Distinct `--ratio` var for new components (Part B) |
| Forgetting to delete the `position: ""` reset → content unreachable after transition | **High** — looks like a blank page | Called out in Part A and Part E.3; verify by scrolling a layer in-browser |
| Home intro stalls behind layer images | Medium | Scope `loadAllImages()` to `main` |
| 20+ videos decoding at boot | Medium | Scope boot autoplay to `main`; observer for layers |
| Observer leak across repeated layer visits | Low | Disconnect in `fadeHome()` |
| `freezeLineBreaks` reaching layer prose | Low today, high if it ever happens | Keep scoped to `track`; do not generalise the call |
| `index.html` growth | Low | Exemplar-first; fragment files if we go wide |

**Untouched by all of the above:** the slider engine math, the intro choreography, the transition
timings and eases, the clocks, and every existing home behaviour. The engine is detached for the whole
time a layer is open (`beginChange` → `main.js:462`), so layer scrolling cannot reach the wheel handler.

---

## Verification

1. `python3 -m http.server 4173 --directory designbycc-landing`, open `http://localhost:4173/?fresh=1`
   (the cache-bust query matters — Chrome serves stale HTML otherwise).
2. **Home unchanged:** intro timing, slider drag/wheel, momentum, clocks. Confirm first paint is not
   slower than today.
3. **Enter:** click the spatial-2025 card. Transition unchanged; content is at rest and fully opaque on
   arrival — no reveal, per the spike.
4. **Scroll:** the layer scrolls; the home slider does not move behind it; videos start on entry and
   pause on exit (`readyState` and `paused` via `javascript_tool`).
5. **Exit:** logo returns home; slider stagger re-entry plays; re-entering the layer opens at the top.
6. Re-enter and exit 3× and count observers — no growth.
7. `/styleguide-check` for token drift; `/verify-motion` for the animation pass (the window-occlusion
   workaround matters — an occluded Chrome freezes rAF and the origin's own loader never lifts, which
   is exactly what happened during this spike).
