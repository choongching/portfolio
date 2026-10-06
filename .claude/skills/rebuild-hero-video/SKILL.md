---
name: rebuild-hero-video
description: Rebuild the Trustana hero video on designby.cc from CC's Screen Charm clips: lossless master, web MP4 and WebM, WebP poster, automatic checks, then the site updates. Use when CC adds, removes, reorders or re-records clips, or wants the video lighter or sharper.
---

# rebuild-hero-video

The homepage Trustana video is a silent, looping montage of short Screen Charm clips. This skill rebuilds it with ffmpeg. It was first made in Cowork on 2026-10-06 (see `research/2026-10-06-trustana-montage-handoff.md`).

## Rules

- Never re-encode from the web files. Always rebuild from the original clips (the script makes a fresh lossless master first).
- Never commit the master. It is about 114 MB and lives next to the clips.
- If clips don't all share the same size, frame rate and format, the script stops. Stop and ask CC; do not resize to force a match.
- Adapt the site's video box to the video, never the video to the box.
- No em dashes in any copy. Do not invent copy or features.

## Where things are

- Clips: `~/Downloads/Screen Charm Footages/` (3446 x 2160, 60fps, H.264, no audio)
- Script: `.claude/skills/rebuild-hero-video/rebuild-hero-video.sh` (this skill folder)
- Browser check: `.claude/skills/rebuild-hero-video/check-video.mjs` (headless Chrome, no extension needed)
- Output: `~/Downloads/Screen Charm Footages/montage/`

## Steps

1. **Check ffmpeg.** `ffmpeg -version`. If missing: `brew install ffmpeg`. The script also checks for the libx264 and libvpx-vp9 encoders. For the poster it uses ffmpeg's libwebp if present, otherwise `cwebp` (`brew install webp`). Homebrew's ffmpeg has no libwebp, so on CC's Mac the poster goes through `cwebp`.
2. **Set the clip order** in the `CLIPS=( ... )` list at the top of the script.
3. **Run it:**
   ```bash
   bash .claude/skills/rebuild-hero-video/rebuild-hero-video.sh
   ```
   Optional overrides, set before the command: `W=1920` (width), `MP4_CRF=22`, `WEBM_CRF=35` (higher = smaller and softer), `SRC=...`, `OUT=...`.
   The WebM step is slow: about 6 to 7 minutes for 77 s at 2560 px. Run the script in the foreground and let it finish.
4. **Read the check output.** Every line must say `ok`: same frame count as the clips added together, no audio, no decode errors, web files under 25 MiB (Cloudflare Pages limit). Any failure: stop and tell CC.
5. **Sharpness check.** Compare a crop with small UI text, original vs web file, at the same frame:
   ```bash
   N=240   # frame number inside the clip
   ffmpeg -v error -y -i "<clip>.mp4" -vf "select=eq(n\,$N),scale=2560:1604:flags=lanczos,crop=900:300:740:180" -frames:v 1 orig.png
   ffmpeg -v error -y -i trustana-walkthrough.mp4 -vf "select=eq(n\,<frames before this clip + N>),crop=900:300:740:180" -frames:v 1 web.png
   ```
   Look at both images. Text should look the same. Show CC if unsure.
6. **Copy into the repo** (new branch): `trustana-walkthrough.mp4`, `trustana-walkthrough.webm` and `trustana-poster.webp` into `public/`, overwriting. Filenames stay the same, so `Projects.tsx` paths don't change.
7. **Site updates, only if something changed:**
   - Shape changed: update `aspect-[W/H]` in `videoBase` in `src/components/GallerySlot.tsx` (W x H of the web file, reduced; 2560 x 1604 is `aspect-[640/401]`).
   - Length changed: `duration` in the `VideoObject` JSON-LD in `index.html` (ISO 8601, e.g. `PT1M17S`), plus `uploadDate`.
   - Clips changed: update `ariaLabel` and `description` in `src/components/Projects.tsx` and the JSON-LD `description`. Describe only what the clips show. Show CC before committing.
   - Bump `lastmod` for the homepage in `public/sitemap.xml`.
   - Devlog entry in `docs/devlog.md`.
8. **Verify in the browser:** no empty bars around the video, poster shows first, autoplays muted and loops, reduced motion pauses it, mobile width looks right. Run `pnpm build`, serve with `pnpm preview --port 8090 --strictPort` in the background, then `node .claude/skills/rebuild-hero-video/check-video.mjs http://localhost:8090/ <scratchpad>/shots`. It checks desktop, mobile and reduced motion, prints OK/FAIL, and saves screenshots to look at. Safari (MP4) and real phones still need CC.

## Settings that shipped (2026-10-06)

| File | Settings | Result |
|---|---|---|
| Master | concat demuxer, `-c copy` (no re-encode) | 3446 x 2160, 114 MB |
| MP4 | libx264, `-preset slow -crf 20 -profile:v high -g 120`, lanczos scale, `+faststart` | 2560 x 1604, 15.2 MB |
| WebM | libvpx-vp9, `-crf 33 -b:v 0 -deadline good -cpu-used 2 -row-mt 1 -tile-columns 2 -g 120` | 2560 x 1604, 13.3 MB |
| Poster | first frame, libwebp `-quality 90` | 2560 x 1604, 91 KB |

For reference, CRF 18 MP4 / CRF 30 WebM gave 18 MB / 15.6 MB with no visible difference at full size.

## Lighter options if CC asks

- 30fps: add `fps=30,` at the start of both `-vf` filters. About 15% smaller; zooms and cursor slightly less smooth.
- 1920 wide: `W=1920`. Much smaller; may look slightly soft on large Retina screens.

## Gotchas

- Use `-nostdin` on every ffmpeg call inside a loop, or ffmpeg eats the loop's input.
- Height must be even for H.264. The script rounds it for you.
- `preload="auto"` on the video means visitors download the whole file up front (about 13 to 15 MB). Known and accepted for now; raise it with CC if page weight comes up.
