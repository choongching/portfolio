# designbycc — Design & Asset Guidelines

> Complete reference for typography, imagery, video, and motion assets.

---

## 1. Typography

### Core Rule: One Decision Per Class

Each typography decision (size, leading, tracking, weight) gets its own
explicit class. **Never use bundled tokens like `text-3xl` / `text-4xl` /
`text-5xl`** — in Tailwind v3, those classes ship a hardcoded `line-height`
alongside `font-size`. That hidden line-height silently overrides any
`leading-*` class you add later, which is exactly the kind of bug that
makes a type scale feel broken.

**Always use arbitrary font-size syntax (`text-[XXpx]`) for headings.**
Arbitrary text values set ONLY `font-size`, leaving `leading-*` free to win.

### Size + Leading Tokens

| Token | Size | Leading | Tracking | Weight | Where |
|---|---|---|---|---|---|
| **Display lg** | `text-[48px]` | `leading-[1.0]` | `tracking-tight` | `font-medium` (500) | Hero h1, viewports ≥ 1024 px |
| **Display md** | `text-[36px]` | `leading-[1.2]` | `tracking-tight` | `font-medium` (500) | Hero h1, viewports 768–1023 px |
| **Display sm** | `text-[30px]` | `leading-[1.4]` | `tracking-tight` | `font-medium` (500) | Hero h1, mobile |
| **Logo lg** | `text-[31px]` | normal (1.5) | `tracking-tight` | `font-medium` (500) | Header logo, desktop. Single-line. |
| **Logo sm** | `text-[26px]` | normal (1.5) | `tracking-tight` | `font-medium` (500) | Header logo, mobile. Single-line. |
| **Body** | `text-sm` (14 px) | `leading-relaxed` (1.625) | normal | `font-normal` (400) | Hero body, nav, project metadata, links, descriptions |
| **Label** | `text-xs` (12 px) | `leading-snug` (1.375) | normal | `font-normal` (400) | Footer category labels, gallery placeholders |
| **Decorative** | `text-[10px]` / `text-[7px]` / `text-lg` | `leading-none` | normal | `font-normal` | "Made on a Mac" (10), badge micro (7), badge smiley (18) |

### Leading Reference

Display leading is responsive and tightens as size grows: **1.0 at lg+**
for editorial display feel, **1.2 at md**, **1.4 at mobile** to keep
smaller multi-line headings readable. Tested with Space Grotesk's deep
descenders (j, g, p, y).

```
Display lg:     1.0 (arbitrary, 48 px → 48 px line)
Display md:     1.2 (arbitrary, 36 px → 43.2 px line)
Display sm:     1.4 (arbitrary, 30 px → 42 px line)
Body:           1.625 (leading-relaxed preset)
Label:          1.375 (leading-snug preset)
Decor:          1.0   (leading-none preset)
```

### Application Example (Hero H1)

```jsx
<h1 className="text-[30px] md:text-[36px] lg:text-[48px] leading-[1.4] md:leading-[1.2] lg:leading-[1.0] tracking-tight font-medium max-w-2xl">
  Enterprise users just want to get the work done and move on.
</h1>
```

Order of utilities reads as: size (responsive) → leading → tracking →
weight → width constraint. Same order anywhere a heading appears.

### Pitfalls to Avoid

| Don't | Why | Do instead |
|---|---|---|
| `text-3xl md:text-4xl lg:text-[48px] leading-[1.4]` | `text-3xl` and `text-4xl` ship their own `line-height` that overrides `leading-[1.4]`. The headline visually ignores your leading change. | `text-[30px] md:text-[36px] lg:text-[48px] leading-[1.4]` |
| Repeating `style={{ fontFamily: "'Space Grotesk', sans-serif" }}` on components | `body` sets the font globally in `index.css`. Inline duplicates are noise. | Remove all inline `fontFamily`. Only exception: `Footer.tsx` "Made on a Mac" uses Courier New intentionally. |
| Using `text-base` (16 px) for content | Competes visually with the 14 px body. Two body sizes is muddy. | `text-sm` for everything that's body-or-smaller. |
| Hardcoding line-height in pixels (`leading-[3.28rem]`) at responsive sizes | Pixel leading at one breakpoint becomes wrong at another (too loose on mobile, too tight on desktop). | Use multiplier leading (`leading-[1.4]` or `leading-relaxed`). Scales correctly with font-size. |

### Font

- **Primary**: Space Grotesk via `@fontsource/space-grotesk`. Globally on `body` in `index.css`.
- **Exception**: "Made on a Mac" in `Footer.tsx` uses Courier New intentionally.
- **Weights loaded**: 400 (normal), 500 (medium), 700 (bold).

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
