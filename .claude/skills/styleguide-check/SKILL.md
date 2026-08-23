---
name: styleguide-check
description: Scan the working tree (or current diff) for drift from docs/asset-guidelines.md and the /styleguide token system — bundled Tailwind utilities on headings, inline fontFamily duplicates, hardcoded hex colors, asset naming violations, video without dual format/poster, GIFs. Use when the user says "styleguide check" / "check for drift" / "are we still on-system", proactively after adding a new component or asset under src/components, public/, or src/assets, or before shipping a PR that touched typography, color, or media.
---

# styleguide-check

A drift detector. The canonical references are `docs/asset-guidelines.md` (full spec) and `/styleguide` at `src/pages/Styleguide.tsx` (live token specimen). This skill scans for the *inputs* to cascade bugs that `verify-css` catches downstream — and for media that bypasses the asset budget.

Report findings as **FIX** with file:line + the specific guideline section + the corrected form. Do not auto-rewrite. Surface drift; let the user decide which to apply.

## Scope

By default, scan changes since the main branch:

```bash
git diff origin/main...HEAD -- 'src/**' 'public/**' 'index.html' ':(exclude)designbycc-landing/**'
```

If the user says "check the whole repo", widen to a full tree scan. If a specific file is mentioned, scope to that file. Always state the scope at the top of the report.

### Exempt: standalone labs pages

`designbycc-landing/` is a self-contained interaction study (own CSS/JS/fonts, deliberately off-system — hardcoded hex, non-token type). It is **exempt from every check in this skill**; exclude it from all greps and finds below (add `:(exclude)designbycc-landing/**` to git commands, `-not -path 'designbycc-landing/*'` to find). The same applies to any future standalone experiment folder under `public/<name>/` that ships its own `index.html` + stylesheet — these pages opt out of the designby.cc token system by design. If unsure whether a new folder qualifies, ask rather than flag.

### Partly exempt: `public/media/` — study assets that deploy

Study media no longer lives beside the study. `designbycc-landing/` is progressively replacing ~123 hotlinked `smlxl.company` assets with CC's own, and those files live in **`public/media/`** — referenced from the study as `../public/media/…`, which means the study must be served from the **repo root**, not from `designbycc-landing/` as its own web root.

This folder is a genuine split case, and the path-based exemption above does not cover it:

| Section | Applies to `public/media/`? | Why |
|---|---|---|
| §3 naming | **Yes** | Kebab-case costs nothing and keeps callsites greppable |
| §4 video dual-format / poster / `preload` | **No** | Consumed by the study's own `<video>` markup and its `a-image` poster layer, not by any React component. Dual-format and `.webp` posters are a designby.cc delivery rule; the study renders one `<source>` and a `.jpg` poster by design |
| §5 image format | **No** | Posters are `ffmpeg`-extracted JPEG stills, matched frame-for-frame to their video. Converting to WebP gains nothing and breaks the extraction pipeline |
| §7 page weight | **Yes** | These files ship to designby.cc and are publicly fetchable, so they count against the budget even though no page links them |

**The greps below are inconsistent here — fix before trusting them.** §4 uses `ls public/*.mp4`, which is not recursive and silently misses everything in `public/media/` (a false negative that reads as "OK"). §5 and §7 use recursive `find`, so they *do* reach in — §5 over-fires on study posters, §7 correctly reports weight. Always state in the report which of the two you ran.

## 1. Typography drift (highest impact)

The bundled-utility traps that cost an 8-round line-height incident. From `docs/asset-guidelines.md` §1 and `reference_tailwind_gotchas.md`.

### Forbidden on headings / body

```bash
# Bundled font-size tokens that ship hidden line-height
git grep -nE '\btext-(3xl|4xl|5xl|6xl|base)\b' -- 'src/**/*.tsx' 'src/**/*.ts'
```

For each hit:
- `text-3xl/4xl/5xl/6xl` on a heading → propose arbitrary `text-[XXpx]` from the Display lg/md/sm tokens (48/36/30 px) or Logo lg/sm (31/26 px).
- `text-base` on content → propose `text-[16px]` (only on Lede tokens) or `text-sm` (everywhere else).

### Inline fontFamily duplicates

```bash
git grep -n "fontFamily" -- 'src/**/*.tsx'
```

`body` sets Space Grotesk globally in `index.css`. The only sanctioned inline `fontFamily` is `Courier New` on "Made on a Mac" in `Footer.tsx`. All other matches are noise — propose removal.

### Pixel leading at responsive breakpoints

```bash
git grep -nE 'leading-\[[0-9.]+(rem|px)\]' -- 'src/**/*.tsx'
```

Pixel/rem leading doesn't scale across breakpoints. Propose multiplier form (`leading-[1.4]`, `leading-relaxed`).

### Token recognition

When a heading appears with classes, cross-check against the Display/Logo/Lede tokens in `docs/asset-guidelines.md` §1. If it's clearly a Display but doesn't use `text-[30px] md:text-[36px] lg:text-[48px]`, flag the deviation — even if it doesn't trigger the grep above (e.g. someone used `text-[35px]`).

## 2. Color drift

`tailwind.config.ts` defines colors via HSL CSS variables (`hsl(var(--primary))`, etc.). The brand cream is `#e5ddd2` (theme-color in `index.html`). Drift = hex/RGB values bypassing the token system.

```bash
# Arbitrary hex in className
git grep -nE 'text-\[#[0-9a-fA-F]+\]|bg-\[#[0-9a-fA-F]+\]|border-\[#[0-9a-fA-F]+\]' -- 'src/**/*.tsx'

# Inline style color
git grep -nE 'style=\{\{[^}]*color' -- 'src/**/*.tsx'
```

For each, propose a token-based replacement (`text-foreground`, `bg-background`, `text-muted-foreground`, etc.) unless it's a deliberate one-off (e.g. brand cream `#e5ddd2` on a wordmark). Ask before flipping intentional brand colors.

## 3. Asset naming

From `docs/asset-guidelines.md` §6:

```
{project-slug}-{descriptor}-{index}.{ext}
```

Examples on disk: `trustana-walkthrough.mp4`, `og-home.png`, `og-resume.png`. All kebab-case, no spaces, no camelCase, no PascalCase.

```bash
# Find non-kebab-case files in public/ and src/assets/
find public src/assets -type f 2>/dev/null | grep -E '/[^/]*(_| |[A-Z])[^/]*\.(png|jpg|jpeg|webp|avif|svg|mp4|webm|json|lottie)$'
```

For each violation, propose a rename + the callsites that need updating (`git grep -l 'OLDNAME'`).

## 4. Video implementation

From `docs/asset-guidelines.md` §3. Any `.mp4` or `.webm` under `public/` should:

- Have a paired sibling in the other format (mp4 ↔ webm).
- Have a `.webp` poster of the same base name.
- Be referenced from a `<video>` block that includes `playsInline`, `muted`, `loop`, `preload="none"`, and a `<source>` for both formats.
- Have audio stripped (check with `ffprobe -v error -show_streams <file> | grep codec_type=audio` — flag if present).

```bash
# Inventory site video (recursive, excluding study media — see the split-case table above)
find public -type f \( -name '*.mp4' -o -name '*.webm' \) -not -path 'public/media/*' 2>/dev/null

# Study media, reported separately and NOT held to dual-format/poster rules
find public/media -type f \( -name '*.mp4' -o -name '*.webm' \) 2>/dev/null

# Find <video> blocks and check attributes
git grep -nA10 '<video' -- 'src/**/*.tsx'
```

Do not use `ls public/*.mp4` — it is not recursive and will report a clean §4 while missing every file under `public/media/`.

For each `<video>` missing `playsInline`/`muted`/`loop`/`preload="none"` or missing one of the two `<source>` tags, flag with the exact attribute that needs adding.

## 5. Image format

From `docs/asset-guidelines.md` §2.

```bash
# Find JPEGs that should be WebP (study posters exempt — see split-case table)
find public src/assets -type f \( -name '*.jpg' -o -name '*.jpeg' \) -not -path 'public/media/*' 2>/dev/null

# Find PNGs that aren't OG images or favicons
find public src/assets -type f -name '*.png' -not -path 'public/media/*' 2>/dev/null | grep -vE '(og-|favicon)'
```

JPEGs: propose WebP conversion (`cwebp -q 82 input.jpg -o output.webp`). PNGs outside OG/favicon: propose WebP unless transparency is required — ask. Don't touch `og-*.png` (covered by `seo-sweep`).

Files over 150 KB without a documented reason:

```bash
find public src/assets -type f \( -name '*.webp' -o -name '*.png' -o -name '*.jpg' \) -size +150k 2>/dev/null
```

## 6. GIF detection (zero tolerance)

`docs/asset-guidelines.md` §5: "Never use GIF in production."

```bash
find public src/assets -type f -name '*.gif' 2>/dev/null
git grep -nE '\.gif["'\'']' -- 'src/**/*.tsx' 'index.html' 'public/*.html'
```

Any hit → propose MP4/WebM conversion with the `ffmpeg` commands from §5.

## 7. Page weight (optional, on request)

The budget is ≤ 8–10 MB total per `docs/asset-guidelines.md` §6. Skip by default; run only if the user asks or if a single asset over 2 MB is added in the diff.

```bash
find public -type f \( -name '*.mp4' -o -name '*.webm' -o -name '*.webp' -o -name '*.png' -o -name '*.jpg' \) \
  -size +1M 2>/dev/null -exec du -h {} \; | sort -h
```

This one **deliberately includes `public/media/`** — study assets deploy, so they count. Expect the study's per-clip cost (~4 MB of committed MP4 each) to grow as more of the 27 remaining cards are converted; call it out when the total approaches the 8–10 MB budget.

## Report format

```
styleguide-check — scope: <diff vs origin/main | full repo | file:X>

FIX (N):
  1. <file>:<line> — <one-line description>
     Rule: <guidelines section, e.g. "§1 typography — bundled token">
     Found: <verbatim snippet>
     Fix:   <verbatim replacement>

OK:
  - Typography tokens
  - Color tokens
  - Asset naming
  - Video implementation
  - Image format
  - GIFs
```

End with: "Apply any of these? (list numbers, or 'all', or 'none')". Wait for the user.

## What this skill does NOT do

- It does NOT auto-apply fixes. Drift fixes are easy to get wrong (intentional brand colors, intentional decorative tokens) — surface, don't restyle.
- It does NOT cover SEO meta or OG images — `seo-sweep` handles those.
- It does NOT diagnose cascade bugs after the fact — `verify-css` handles that.
- It does NOT check Lighthouse / runtime perf. Budget check (§7) is static-size only.
