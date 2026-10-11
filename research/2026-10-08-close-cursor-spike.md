# Close cursor spike: tlb.betteroff.studio article pages

Spike date: 2026-10-08. Reference: https://tlb.betteroff.studio/articles/winter-x-games-2026
Goal: understand how their article pages let you "close" back to the index with a cursor-following
**Close** label, and decide whether and how to apply it to the landing study's page layers (e.g.
the Penang page). Source read from their production Nuxt bundle (reference only; nothing copied).

## Stack (role on this page)

| Library | Role |
|---|---|
| Nuxt 3 / Vue | SPA routing; article is a route, "close" is a router navigation |
| GSAP (+ ScrollTrigger) | page transitions and a global `tick` event used for the cursor lerp |
| Tailwind | utility classes; a custom `has-hover:` variant = `@media (hover:hover) and (pointer:fine)` |

## The mechanism (component `Related`, in the article chunk)

```
<div fixed inset-0 overflow-hidden pointer-events-none>        ← full-viewport layer
  <div absolute inset-0 cursor-pointer pointer-events-auto      ← CLICK CATCHER (the "close zone")
       onClick → navigate(page.last || "/")>
    <div ref=curs px-20 overflow-hidden hidden has-hover:block> ← the label, moved by transform
      <div js-t-fade-out><div js-i-slide>Close</div></div>
    </div>
  </div>
  <div … related previous / current / next article links (pointer-events-auto, above the catcher)>
</div>
```

1. **Where it appears ("only certain areas").** The catcher covers the whole viewport, but it
   sits *underneath* the article content and the related-article links. Wherever content
   covers it, the content gets the pointer and the label is hidden behind it. The label shows,
   and a click closes, only on the exposed background: the empty margins around the article
   column. No hit-testing code is involved; the stacking order *is* the zone.
2. **Following the cursor.** On every GSAP `tick`:
   `x = lerp(x, mouse.x, 0.2 × ratio)`, `y = lerp(y, mouse.y, 0.2 × ratio)`, then
   `transform: translate3d(x, y, 0)`. `ratio` normalises for frame rate. The 0.2 factor gives
   the soft, slightly trailing follow. The native cursor stays (`cursor: pointer`); the label
   rides alongside it, offset by its own 20px horizontal padding.
3. **Hover devices only.** The label is `hidden has-hover:block`, i.e. only shown under
   `(hover: hover) and (pointer: fine)`. On touch there's no label; the background tap still
   closes.
4. **Closing.** Click → `navigate(page.last || "/")`: back to wherever you came from, else home.
   The label's wrappers (`js-t-fade-out`, `js-i-slide`) let the page transition fade it out and
   slide it in on entry.
5. **Accessible fallback.** The page also has a visible header link, `aria-label="Close"`, with
   an × icon to the same destination. The cursor label is decoration on top of a real control.
6. **Type:** the label uses their `.label` style: mono, uppercase, ~14px.

## Can we follow it? Yes. Mapping to `designbycc-landing`

Our page layers are already "articles over the index": `.page-layer.is-active` is a fixed,
scrollable full-viewport layer, and `PageTransitions.fadeHome(true)` already returns to the
slider (the logo uses it). So the close action exists; we only need the zone, the label and
the fallback.

| TLB | Ours |
|---|---|
| Full-viewport click catcher under the content | `.page-layer__close-zone`: fixed, inset 0, *behind* the layer's content (`z-index` 0 vs content 1), present only while a layer is active |
| Zone = exposed background | Our layers are hero image + centred text. Proposed zone: the hero photo and the empty space around the text. Text, links and media controls sit above it, so they never close |
| Label lerps to cursor at 0.2 per tick | One fixed `.c-close-cursor` label, moved by `gsap.ticker` with a frame-rate-normalised lerp (`1 − (1 − 0.2)^(dt·60)`) |
| `has-hover:` gate | `@media (hover: hover) and (pointer: fine)`; touch gets no label |
| Close → `navigate(last || "/")` | Close → `fadeHome(true)` (same as the logo), which already restaggers the slider |
| Header × link fallback | A visible "Close" button in the header while a layer is open, plus **Esc** to close |
| `.label` mono uppercase | `.o-font-small-title` (Geist Mono, uppercase), our existing small-title style |

Behaviour details worth copying:
- Label slides in from a mask when the pointer enters the zone and slides out when it leaves
  (over text, or when the layer closes), so it never lingers over content.
- The native cursor stays visible; the label trails it. No `cursor: none`, which avoids losing
  the pointer on slow frames.
- `prefers-reduced-motion`: the label follows without lerp (no trailing motion) and skips the
  slide; closing still works.

Risks and checks:
- The zone must not swallow clicks meant for content (the Penang credit link, future in-page
  links). Content stays above the zone; verify with `elementFromPoint` sweeps.
- `sliderToLayer` / `fadeHome` toggle `main` display and the layer's `is-active`; the label must
  be hidden during transitions (`busy`) so it doesn't float over the conveyor animation.
- The mobile tree uses the default fade; the touch path relies on the visible Close button.
- Rules from `slider-page-transitions` still apply: verify with `check-slider.mjs` plus a
  click-through (card → layer → Close → slider restaggers, input works).

## Estimate

One PR: ~80 lines of JS (a `CloseCursor` class wired into `PageTransitions`), ~30 lines of
CSS, a header button. No changes to the slider engine.

## Outcome (2026-10-08)

Built as proposed (trailing pill, hero close zone with dim, header Close pill, Esc), then CC
redirected twice:
1. The pill looked like a solid button, and the whole hero as a close zone was too broad.
2. A "Close" hint fixed beside the logo was wrong: it should appear beside the mouse cursor.

Shipped direction: **the logo is the only close target.** While a page is open, hovering the logo
brings up a quiet mono "Close" (no fill) beside the cursor, trailing it with TLB's 0.2 lerp and
growing from 0 to full size (shrinking back on leave). Touch: the hint sits beside the logo. Esc also closes. Code:
`CloseHint` in `main.js`; check: `.claude/skills/slider-page-transitions/check-close.mjs`.
