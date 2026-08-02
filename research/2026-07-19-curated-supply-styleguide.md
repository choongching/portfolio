# curated.supply — visual styleguide spike (July 19 2026)

**Source:** https://www.curated.supply/browse, studied live + from served markup on July 19 2026.
**Purpose:** extract the visual token system and apply it to `smlxl-landing/` — a styling
swap with all UX/mechanics locked, the same playbook as the July 16 over-stimulated restyle
of the first (since deleted) study.
**Status: APPLIED to `smlxl-landing/` on July 19 2026** — see "Application record" at the end
for what was adopted, adapted, and skipped.

## Stack

Framer-published site (`framerusercontent.com` bundle, `events.framer.com` analytics).
Implications for the spike: no unminified app bundle to extract — **all styling lives in the
served HTML** (5 inline `<style>` blocks, 158KB) as Framer design tokens
(`--token-<uuid>`) + text-style presets (`.framer-styles-preset-*`). Hover/entrance motion
is Framer Motion (JS springs), not CSS transitions, so motion values below are partly
observed rather than read from source. Dark-scheme media block exists but re-declares the
same light values — the site is **light-only**.

## Palette (semantic roles, from body token declarations + usage counts)

| Role | Value | Evidence |
|---|---|---|
| Page background | `#f2f2f2` | body background token (ae37ed27), computed body bg |
| Surface / card | `#ffffff` | 69× background-color usages (343acf84); nav pill, search circle, newsletter pill |
| Ink (primary text) | `#141414` | text token (3c6ff9e4), headings + card titles, link idle |
| Secondary text | `#737373` | counts, brand attributions, footer column heads, disclaimer, link hover (d9cce017) |
| Hairline / divider tones | `#e2e2e2`, `#ebebeb`, `#e8e8e8` | present in token set; barely used — separation is done by surface tone, **no borders anywhere** |
| Deep ink accents | `#0c0c0c`, `#121212`, `#2e2e2e` | rare (dark buttons/overlays) |
| Focus ring | `0 0 0 3px #14141414` | input focus box-shadow |
| Scrim tones | `#0c0c0c33`, `#e2e2e299`, `#f8f8f800` | overlay/fade tokens |

The whole system is a **neutral light monochrome**: hierarchy comes from `#141414` vs
`#737373`, depth from white surfaces on `#f2f2f2` — zero strokes, zero shadows (the focus
ring is the only exception).

## Typography

Families (all free licenses — bundle license files next to woff2s):
- **Geist / Geist Variable** (Vercel, SIL OFL) — everything
- **Geist Mono Variable** (Vercel, SIL OFL) — mono labels, 14px preset
- **Inter** (SIL OFL) — only as bold-fallback in one preset; skippable
- **Fragment Mono** (Google, SIL OFL) — loaded but unused on /browse; skippable

Measured scale (computed values at 1512px viewport):

| Style | Font | Size/Leading | Weight | Tracking | Used for |
|---|---|---|---|---|---|
| Display | Geist Variable | 40/44 (2.5rem, lh 1.1) → 2.25rem ≤1199px | 400 | −0.02em | page title "Browse" |
| Section head | Geist | 28px / 1.1 (1.75rem) | 500 | 0 | "By category" etc. |
| Body | Geist | 16/24 | 400 | +0.01em | "See all", body copy |
| Label | Geist | 14/20 | 400 | +0.01em (some presets 0) | card titles, nav, footer links, disclaimer |
| Label-medium | Geist | 14/20 | 500 | +0.01em | "Subscribe", emphasis |
| Mono label | Geist Mono | 14/20 | 400 | +0.01em | metadata/labels |

OpenType features on across presets: `cv03 cv04 cv09 cv11 ss02 ss03 …` (Geist alternates —
single-storey a etc. varies by preset; cosmetic, adopt `"cv09","cv03","cv04","cv11"` baseline).
Counts/numerals render in the same Geist 14px, secondary color.

## Shape & space

- **Card radius 16px** (computed on category/list/product cards); **8px** for inner media
  tiles / small elements (238 occurrences); pills/circles fully rounded (27–48px on 36px
  heights; newsletter wrap 40px).
- **Card padding 16px**; label row sits at card bottom: title left (ink), count/brand right (secondary).
- Spacing rhythm: 4 / 8 / 10 (grid gutter) / 12 / 16 / 24 / 32 / 48.
- 4-column card grid at desktop, 10px gutters, full-bleed container with ~69px page margins
  (cards 330px at 1512 viewport); header 68px tall.
- Aspect: category/product cards ≈ square (330×331); image area ≈ 263px + 52px label row.

## Components observed

- **Header (68px):** 28×28 asterisk-glyph logo left; centered nav — Geist 14/20 +0.14px,
  idle `#737373`, active/hover `#141414`, active item gets a **white pill** (36px tall,
  6/12px padding, fully rounded); white 36px search circle right.
- **Cards (4 variants):** category (product photo on white), brand (black logo on white),
  list (2×2 mini-tile grid), product (title left + brand right in secondary). All identical
  chrome: white, r16, p16, no border/shadow.
- **Footer:** transparent on page bg. Logo + newsletter pill (white, r40: transparent input
  14px + "Subscribe" 14/500 ink) + two-line disclaimer 14px `#737373`; link columns —
  heads `#737373` 14px, links `#141414` 14px (inverted hierarchy: grey heads, ink links).

## Motion

- **Signature ease `cubic-bezier(.44,0,.56,1)`** — symmetric soft in-out.
  Link color transitions `color .4s`; generic `all .3s` on interactive bits.
- Link hover contract: ink ↔ secondary (`#141414` idle → `#737373` hover, inverse for
  secondary links). No underlines anywhere.
- **Card hover: image nudges down 3px** (`translateY(2.97px)` settled, Framer Motion spring,
  ≈0.3s soft) — the only card hover effect; card chrome itself doesn't change.
- No scroll-driven animation on /browse; page is static outside hovers.

## Breakpoints

Framer standard: **≥1200 / 810–1199 / ≤809**. Display drops 2.5rem → 2.25rem below 1200.

## Licensing / assets for reuse

- Geist + Geist Mono: SIL OFL via Vercel (`vercel/geist-font`; also on Google Fonts) —
  **re-download needed**: our woff2 copies were deleted with `public/smlxl/` on 2026-07-19.
- Product/brand imagery and the asterisk logo are curated.supply's — not reused; we only
  take tokens/metrics.

## Extraction artifacts (scratchpad, regenerable)

`curated.html` (767KB served page), `curated-styles.css` (concatenated style blocks).

## Application record (July 19 2026)

Applied to `smlxl-landing/` (`styles.css`, `index.html`, `fonts/`) the same day.
Mechanics, composition, and every animation spec stayed untouched; only the visual
system swapped.

**Amended July 19, evening — display/body font is now Switzer, not Geist.** After the
restyle, the user chose the typography of permanent.is/mentorship as the reference: that
site sets everything in ABC Camera Plain Variable (Dinamo — commercial, non-redistributable,
verified from the font's own name table). Switzer (Fontshare FFL, bundled in `fonts/`) is
the licensed Helvetica-class substitute; a three-way specimen render confirmed it matches
Camera Plain far closer than Geist did. Geist Mono stays on labels/metadata.

**Adopted as measured**
- Full palette with the semantic roles above; radii 8px (≤730px) / 16px; the signature
  ease on all CSS transitions plus the 0.4s ink↔grey link-hover contract.
- Geist + Geist Mono, self-hosted variable woff2s (Google Fonts latin subset) with the
  OFL license file in `smlxl-landing/fonts/`, replacing the Fontshare Supreme CDN link.

**Adapted (user decisions)**
- **Page washes → ink inversion.** All 26 destination palettes (`data-bg-color`/`data-color`)
  normalized to `#141414`/`#f2f2f2` so the transition wash stays dramatic inside the
  monochrome system. The mobile menu overlay uses the same inversion.
- **Labels → Geist Mono.** `.o-font-small-title`/`.a-content-h5` became 14-ish Geist Mono,
  sentence case, +0.01em — smlxl's uppercase 0.1em-tracked labels dropped.
- **Card variants remapped, not recolored:** the blue/green text slides became one ink
  statement card + white cards; `--orange` renamed `--light` (white/ink); clock faces
  ink and `#ebebeb` with contrast-matched hands, red numerals → `#737373`; the slide-37/38
  SVG stand-ins went ink-on-light.

**Deliberately kept from smlxl (composition is UX)**
- The type *scale* (slides are designed on a 2048px canvas and visually scaled — curated's
  literal pixel sizes would hollow out the compositions). Only family, tracking
  (−0.02em display / +0.01em labels), case, and color changed.
- White project-slide titles over the media gradient (they sit on photos, not surfaces).

**Skipped**
- The 3px card-hover image nudge (offered as an optional accent; not requested).
- Active-nav white pill, search circle, newsletter pill — no equivalent components exist
  in the landing study.

Verified post-apply on a hard-reloaded `localhost:4173` load: fonts loaded, computed
tokens correct, forward `sliderTransition` → ink wash → logo return → 38-slide stagger,
all intact. (Reconfirmed gotcha: python http.server serves stale `styles.css` even when
the page URL is cache-busted — hard-reload before judging any styling change.)
