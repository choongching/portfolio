# designbycc — Design & Asset Guidelines

> Complete reference for typography, imagery, video, and motion assets.

---

## 1. Typography

### Size Inventory

| Size | Where | Notes |
|------|-------|-------|
| `text-[42px]` / `text-4xl` / `text-3xl` | Hero h1 (responsive) | Display size — largest on page |
| `text-2xl` (24 px) | Desktop logo | — |
| `text-xl` (20 px) | Mobile logo | — |
| `text-lg` (18 px) | Badge center smiley | Decorative only |
| `text-base` (16 px) | *(was)* project name, year, services | Removed — competed with hero |
| `text-sm` (14 px) | Nav, location, clock, hero body, email, copyright, project metadata | Primary workhorse size |
| `text-xs` (12 px) | Footer labels, gallery placeholders | Label size |
| `text-[10px]` | "Made on a Mac" | Decorative |
| `text-[7px]` | Badge micro text | Decorative |

### Issues Found & Fixed

1. **Redundant `fontFamily` inline styles** — `body` already sets `font-family: 'Space Grotesk'` globally in `index.css`. Every component was repeating `style={{ fontFamily: "'Space Grotesk', sans-serif" }}`. All removed (except `Footer.tsx` "Made on a Mac" which intentionally uses Courier New).
2. **No font-weight contrast** — Everything was weight 400. Hero headline and logo now use `font-medium` (500).
3. **Project metadata too large** — Name, year, and services were `text-base` (16 px), same as body text. Changed to `text-sm` (14 px).
4. **Oversized scroll-to-top arrow** — Was `text-4xl` (36 px). Changed to `text-2xl`.

### Final Type Scale

```
Display:    42 px / font-medium (500)  — Hero h1 only
Logo:       text-2xl (24 px desktop) / text-xl (20 px mobile) / font-medium (500)
Body:       text-sm (14 px)            — nav, project info, descriptions, links
Label:      text-xs (12 px)            — footer category labels, gallery placeholders
Decorative: 10 px, 7 px, 13.5 px      — badge elements (unchanged)
```

### Font

- **Primary**: Space Grotesk (via `@fontsource/space-grotesk`)
- Applied globally on `body` in `index.css` — no inline `fontFamily` needed in components
- **Exception**: "Made on a Mac" uses `Courier New` intentionally

---

## 2. Static Images

### Dimensions

| Use Case | Dimensions | Aspect Ratio |
|----------|-----------|-------------|
| Standard gallery image | **1800 × 1200 px** | 3 : 2 |
| Hero / full-bleed showcase | **2400 × 1600 px** | 3 : 2 |
| Retina-safe minimum | 2× the rendered CSS size | — |

### Format & Quality

| Format | Quality | Target Size | When to Use |
|--------|---------|-------------|-------------|
| **WebP** | 80–85 % | **80–150 KB** | Default for all images |
| **AVIF** | 60–70 % | 50–120 KB | Progressive enhancement (smaller, slower decode) |
| **JPG** | 82 % | 120–200 KB | Fallback only |
| **PNG** | — | — | Only for images requiring transparency |

### Export Checklist

- [ ] Export at 2× for retina
- [ ] Convert to WebP (use `cwebp -q 82 input.png -o output.webp`)
- [ ] Strip metadata (`exiftool -all= file.webp`)
- [ ] Verify file size is under 150 KB
- [ ] Provide AVIF variant if possible (`avifenc --min 20 --max 30 input.png output.avif`)

---

## 3. Video

### Specs

| Property | Recommendation |
|----------|---------------|
| **Primary format** | **MP4** (H.264, Main profile) |
| **Fallback format** | **WebM** (VP9) |
| **Resolution** | 1280 × 720 (720p) or 1920 × 1080 (1080p) |
| **Frame rate** | 24–30 fps |
| **Duration** | 5–15 seconds for loops |
| **Bitrate** | 2–4 Mbps (720p) / 4–6 Mbps (1080p) |
| **Target file size** | **1–3 MB** per clip |
| **Audio** | Strip entirely (muted playback) |

### Encoding Commands

```bash
# MP4 (H.264) — optimised for web
ffmpeg -i input.mov \
  -c:v libx264 -crf 23 -preset slow \
  -movflags +faststart \
  -an -pix_fmt yuv420p \
  -vf "scale=1280:720" \
  output.mp4

# WebM (VP9) — smaller fallback
ffmpeg -i input.mov \
  -c:v libvpx-vp9 -crf 30 -b:v 0 \
  -an -pix_fmt yuv420p \
  -vf "scale=1280:720" \
  output.webm
```

### Implementation Pattern

```html
<video
  autoPlay
  muted
  loop
  playsInline
  poster="project-poster.webp"
  preload="none"
>
  <source src="clip.webm" type="video/webm" />
  <source src="clip.mp4"  type="video/mp4" />
</video>
```

Key attributes:
- `playsInline` — prevents fullscreen on iOS
- `muted` — required for autoplay on all browsers
- `poster` — shows a WebP frame before the video loads
- `preload="none"` — defer loading until in viewport (pair with Intersection Observer)

---

## 4. Lottie Animations

### Specs

| Property | Recommendation |
|----------|---------------|
| **Format** | `.json` (standard) or `.lottie` (dotLottie — compressed) |
| **Target file size** | **50–150 KB** |
| **Frame rate** | 24–30 fps |
| **Duration** | 2–10 seconds for loops |

### Recommended Libraries

| Library | Size | Notes |
|---------|------|-------|
| `lottie-react` | ~50 KB | Simple, React-friendly wrapper |
| `@dotlottie/react-player` | ~40 KB | Supports compressed `.lottie` format |
| `@lottiefiles/react-lottie-player` | ~45 KB | Full-featured, from LottieFiles |

### Optimisation Tips

- Avoid embedded images in Lottie files (rasterised frames bloat the JSON)
- Keep shape complexity low — flatten and merge paths in After Effects / Figma
- Use [LottieFiles Optimizer](https://lottiefiles.com/tools/optimize) to strip unused data
- dotLottie (`.lottie`) compresses JSON by ~60–70 %

### Implementation Pattern

```tsx
import Lottie from "lottie-react";
import animationData from "@/assets/lottie/animation.json";

<Lottie
  animationData={animationData}
  loop
  autoplay
  style={{ width: "100%", height: "100%" }}
/>
```

---

## 5. GIF — Avoid

| | GIF | Equivalent MP4 |
|-|-----|----------------|
| 5 s animation | ~2–5 MB | **200–500 KB** |
| Quality | 256 colours, dithered | Full colour, sharp |
| Transparency | Binary only | No (use Lottie or WebM instead) |

**Rule**: Never use GIF in production. Convert existing GIFs:

```bash
# GIF → MP4
ffmpeg -i animation.gif -c:v libx264 -pix_fmt yuv420p -movflags +faststart output.mp4

# GIF → WebM
ffmpeg -i animation.gif -c:v libvpx-vp9 -crf 30 -b:v 0 output.webm
```

If you need transparency + animation, use **Lottie** or **WebM with alpha**.

---

## 6. Best Practices

### Naming Convention

```
{project-slug}-{descriptor}-{index}.{ext}

Examples:
  aura-hero-01.webp
  aura-gallery-02.webp
  aura-loop-01.mp4
  aura-loop-01.webm
  aura-motion-01.json
```

### Lazy Loading

- **Images**: Use `loading="lazy"` on `<img>` tags, or Intersection Observer for `<picture>`
- **Video**: Set `preload="none"` and load via Intersection Observer
- **Lottie**: Dynamically import the JSON only when the component enters the viewport

### Page Weight Budget

| Asset Type | Budget per Project | Max Total Page |
|------------|-------------------|----------------|
| Images (3 gallery slots) | ~400 KB | — |
| Video (1 clip) | ~2 MB | — |
| Lottie (1 animation) | ~100 KB | — |
| **Total page weight** | — | **≤ 8–10 MB** |

### Performance Checklist

- [ ] All images in WebP (AVIF as progressive enhancement)
- [ ] Videos have `poster` frames and `preload="none"`
- [ ] Lottie files under 150 KB
- [ ] No GIFs in production
- [ ] Lazy loading on all below-fold media
- [ ] Total page weight under 10 MB
- [ ] `<picture>` with AVIF → WebP → JPG fallback chain where possible

---

*Last updated: 14 April 2026*
