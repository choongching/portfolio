# designbycc — Design & Asset Guidelines

> Reference for type, colour, images and video on designby.cc (the slider site in
> `designbycc-landing/`).

---

## 1. Type and colour

The tokens live on `:root` in `designbycc-landing/styles.css`; that file is the reference.

- **Fonts:** Switzer (variable, `--font-a`) for everything except metadata labels; Geist Mono
  (variable, `--font-mono`) for small titles and metadata. Both are self-hosted in
  `designbycc-landing/fonts/` with their licences.
- **Colours:** `--color-ink` `#141414`, `--color-surface` `#fff`, `--color-secondary` `#737373`,
  `--color-grey-lighter` `#ebebeb`.
- **Exception:** `public/resume.html` still uses the previous system (Space Grotesk from
  `public/fonts/`, beige palette) and is styled on its own.

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

> **Exception — homepage Trustana montage** (`public/trustana-walkthrough.*`, Oct 2026): 2560 × 1604
> at 60 fps, 77 s, ~13–15 MB per file. This is the single hero video, and sharpness on Retina
> screens matters more here than size: the previous 1280 px version was upscaled ~2× and looked
> soft. Each file stays under Cloudflare Pages' 25 MiB per-file limit. The specs above still apply
> to every other clip.

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

The slider's video cards (`designbycc-landing/index.html`) show a WebP poster as an `<img>` and
load the video only when needed: sources carry `data-src`, and `main.js` fills `src` in.

```html
<img src="/clip-poster.webp" class="a-image__image | js-a-image__image" alt="" decoding="async">
<video class="c-slider-project__video js-card-video" loop muted playsinline preload="none">
  <source data-src="/clip.webm" type="video/webm">
  <source data-src="/clip.mp4" type="video/mp4">
</video>
```

Key attributes:
- `playsinline`: prevents fullscreen on iOS
- `muted`: required for autoplay on all browsers
- `preload="none"` plus `data-src`: nothing downloads until the card needs it

---

## 4. GIF — Avoid

| | GIF | Equivalent MP4 |
|-|-----|----------------|
| 5 s animation | ~2–5 MB | **200–500 KB** |
| Quality | 256 colours, dithered | Full colour, sharp |
| Transparency | Binary only | No (use WebM with alpha instead) |

**Rule**: Never use GIF in production. Convert existing GIFs:

```bash
# GIF → MP4
ffmpeg -i animation.gif -c:v libx264 -pix_fmt yuv420p -movflags +faststart output.mp4

# GIF → WebM
ffmpeg -i animation.gif -c:v libvpx-vp9 -crf 30 -b:v 0 output.webm
```

If you need transparency + animation, use **WebM with alpha** or a live SVG (as the Lissajous and LinkedIn spiral cards do).

---

## 5. Best Practices

### Naming Convention

```
{project-slug}-{descriptor}-{index}.{ext}

Examples:
  aura-hero-01.webp
  aura-gallery-02.webp
  aura-loop-01.mp4
  aura-loop-01.webm
```

### Lazy Loading

- **Images**: Use `loading="lazy"` on `<img>` tags, or Intersection Observer for `<picture>`
- **Video**: Set `preload="none"` and load via Intersection Observer

### Page Weight Budget

| Asset Type | Budget per Project | Max Total Page |
|------------|-------------------|----------------|
| Images (3 gallery slots) | ~400 KB | — |
| Video (1 clip) | ~2 MB | — |
| **Total page weight** | — | **≤ 8–10 MB** |

### Performance Checklist

- [ ] All images in WebP (AVIF as progressive enhancement)
- [ ] Videos have `poster` frames and `preload="none"`
- [ ] No GIFs in production
- [ ] Lazy loading on all below-fold media
- [ ] Total page weight under 10 MB
- [ ] `<picture>` with AVIF → WebP → JPG fallback chain where possible

---

*Last updated: 23 November 2026 (React site retired: Tailwind typography and Lottie sections removed)*
