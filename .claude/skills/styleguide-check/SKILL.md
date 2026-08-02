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

`designbycc-landing/` is a self-contained interaction study (own CSS/JS/fonts, deliberately off-system — hardcoded hex, non-token type, hotlinked media). It is **exempt from every check in this skill**; exclude it from all greps and finds below (add `:(exclude)designbycc-landing/**` to git commands, `-not -path 'designbycc-landing/*'` to find). The same applies to any future standalone experiment folder under `public/<name>/` that ships its own `index.html` + stylesheet — these pages opt out of the designby.cc token system by design. If unsure whether a new folder qualifies, ask rather than flag.

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
# Inventory video files
ls public/*.mp4 public/*.webm 2>/dev/null

# Find <video> blocks and check attributes
git grep -nA10 '<video' -- 'src/**/*.tsx'
```

For each `<video>` missing `playsInline`/`muted`/`loop`/`preload="none"` or missing one of the two `<source>` tags, flag with the exact attribute that needs adding.

## 5. Image format

From `docs/asset-guidelines.md` §2.

```bash
# Find JPEGs that should be WebP
find public src/assets -type f \( -name '*.jpg' -o -name '*.jpeg' \) 2>/dev/null

# Find PNGs that aren't OG images or favicons
find public src/assets -type f -name '*.png' 2>/dev/null | grep -vE '(og-|favicon)'
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
du -sh public/*.{mp4,webm,webp,png,jpg} 2>/dev/null | sort -h | tail -10
```

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
