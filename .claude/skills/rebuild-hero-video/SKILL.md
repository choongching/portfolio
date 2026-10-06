---
name: rebuild-hero-video
description: Rebuild the homepage Trustana hero video (public/trustana-walkthrough.mp4/.webm + trustana-poster.webp) from CC's Screen Charm clips: join, encode, verify, and wire into the repo (box ratio, aria/description, VideoObject JSON-LD, sitemap, devlog). Use when CC says "rebuild the video", "add a clip to the montage", "re-encode the hero video", "swap the Trustana video", or drops new Screen Charm footage for the homepage.
---

# rebuild-hero-video

The homepage hero is a silent, looping montage of Screen Charm clips of the Trustana product. First built 2026-10-06 in Cowork (handoff: `research/2026-10-06-trustana-montage-handoff.md`, PR #50). This skill lets Claude Code rebuild it end to end.

**Standing rules (also in `CLAUDE.md`):** re-encode from the master only, never from the web files. Never commit the master. Adapt the box to the video. No em dashes in copy. Don't invent copy, features or numbers: anything not recorded below, ask CC.

## Where things live

| What | Path |
|---|---|
| Source clips (H.264 High, 3446x2160, 60fps, no audio) | `~/Downloads/Screen Charm Footages/*.mp4` |
| Lossless master (114 MB, **never commit**) | `~/Downloads/Screen Charm Footages/montage/trustana-montage-master.mp4` |
| Web files | `public/trustana-walkthrough.mp4`, `.webm`, `public/trustana-poster.webp` |
| Video box | `videoBase` in `src/components/GallerySlot.tsx` |
| Copy | `ariaLabel` + `description` in `src/components/Projects.tsx` |
| Structured data | `VideoObject` JSON-LD in `index.html` |

## 1. Master: join the clips (stream copy, no re-encode)

Current order, verified 2026-10-06 by matching packet sizes inside the master (4,635 frames total, no gaps):

| # | Clip | Frames | Shows |
|---|---|---|---|
| 1 | `Attribute-management-Panel.mp4` | 927 | Adding a product attribute |
| 2 | `Video-Trustana-CustomExport.mp4` | 462 | Custom export field mapping |
| 3 | `Ai-DAM-Thumbnails-Image.mp4` | 397 | Auto Transform image grid |
| 4 | `AI-Upscaler-App-toogle.mp4` | 235 | Image settings, AI Upscaler toggle |
| 5 | `Image-Enrichment-Review-Step.mp4` | 863 | Choosing scraped images in an enrichment review |
| 6 | `PDP-zoomed-in-AEO-Approval-Onhover-UX.mp4` | 336 | Reviewing AI output on AEO attributes |
| 7 | `PDP-attribute-approval-review-onhover-zoomed.mp4` | 277 | Close-up of the review popover |
| 8 | `QA-agent-simple-walkthrough-demo.mp4` | 1138 | Product Attribute QA agent |

A stream-copy join only works if every clip matches (codec, profile, 3446x2160, 60fps, yuv420p). Check new clips first:

```bash
cd ~/Downloads/"Screen Charm Footages"
for f in *.mp4; do printf "%s | " "$f"; ffprobe -v error -select_streams v:0 -count_packets \
  -show_entries stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,nb_read_packets -of csv=p=0 "$f"; done
```

If one doesn't match, stop and ask CC (re-export from Screen Charm vs re-encode it). Then join:

```bash
cd ~/Downloads/"Screen Charm Footages"
printf "file '%s'\n" Attribute-management-Panel.mp4 Video-Trustana-CustomExport.mp4 \
  Ai-DAM-Thumbnails-Image.mp4 AI-Upscaler-App-toogle.mp4 Image-Enrichment-Review-Step.mp4 \
  PDP-zoomed-in-AEO-Approval-Onhover-UX.mp4 PDP-attribute-approval-review-onhover-zoomed.mp4 \
  QA-agent-simple-walkthrough-demo.mp4 > montage/concat.txt
ffmpeg -f concat -safe 0 -i montage/concat.txt -c copy -an montage/trustana-montage-master.mp4
```

Frame count of the master must equal the sum of the clips.

## 2. Web files: encode from the master

Target: **2560x1604** (keeps the master's 3446:2160 shape), 60fps, no audio. 2560 wide so it stays sharp on Retina; the old 1280 px video was upscaled ~2x and looked soft. This is a documented exception to `docs/asset-guidelines.md` §3.

**MP4 (H.264).** Settings below were recovered from the shipped file's embedded x264 settings string (the encoder preset name isn't recorded there):

```bash
M=~/Downloads/"Screen Charm Footages"/montage
ffmpeg -i "$M/trustana-montage-master.mp4" -vf scale=2560:1604 -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -g 120 -bf 3 -refs 5 \
  -x264-params me=hex:subme=8:trellis=2:rc-lookahead=50 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -movflags +faststart "$M/trustana-walkthrough.mp4"
```

To re-read the shipped settings: `strings -n 20 public/trustana-walkthrough.mp4 | grep -o "x264 - core.*"`.

**WebM (VP9).** The VP9 quality settings for the 2026-10-06 build were **not recorded** (WebM doesn't embed them). Shipped file: 13.3 MB, ~1.4 Mbps. Ask CC whether settings exist from Cowork; otherwise start from the guidelines' `-crf 30 -b:v 0` and compare size and zoomed text against the shipped file:

```bash
ffmpeg -i "$M/trustana-montage-master.mp4" -vf scale=2560:1604 -an \
  -c:v libvpx-vp9 -crf 30 -b:v 0 -pix_fmt yuv420p "$M/trustana-walkthrough.webm"
```

**Poster (WebP).** First frame of the video, 2560x1604. Shipped file was 91 KB; quality setting not recorded.

The local ffmpeg has no `libwebp` encoder, so extract a lossless PNG frame and convert with `cwebp` (Homebrew):

```bash
ffmpeg -i "$M/trustana-montage-master.mp4" -frames:v 1 -vf scale=2560:1604 "$M/poster-frame.png"
cwebp "$M/poster-frame.png" -o "$M/trustana-poster.webp" && rm "$M/poster-frame.png"
```

`cwebp` defaults (q75) give ~59 KB against the shipped 91 KB, so the original used a higher quality. Compare the two visually before choosing `-q`.

## 3. Verify the files before touching the repo

```bash
for f in "$M"/trustana-walkthrough.{mp4,webm}; do
  ffprobe -v error -count_frames -show_entries stream=codec_type,width,height,r_frame_rate,nb_read_frames:format=duration -of compact "$f"
done
ls -l "$M"/trustana-walkthrough.* "$M"/trustana-poster.webp
```

- Frame count equals the master's in every file (no dropped frames).
- Only a `video` stream, no `audio`.
- Each web file **under 25 MiB** (Cloudflare Pages per-file limit).
- Small UI text survives: extract the same frame from master and web file and compare zoomed crops.

## 4. Wire it into the repo

New branch off `main` (`feat/<slug>`).

1. Copy the three web files into `public/`, overwriting. Same filenames, so `Projects.tsx` paths don't move.
2. **Box ratio:** if the dimensions changed, set `aspect-[W/H]` in `videoBase` to the reduced width/height (2560x1604 → `aspect-[640/401]`) and update the comment above it.
3. **Copy:** update `ariaLabel` and `description` in `Projects.tsx` from the clip list only. **Show the draft to CC before committing.** No em dashes.
4. **JSON-LD `VideoObject`** in `index.html`: `duration` (ISO 8601, e.g. 77s → `PT1M17S`), `uploadDate` = ship date, `description` = the approved description.
5. **Sitemap:** bump the homepage `<lastmod>` in `public/sitemap.xml` (not `/resume`).
6. **Devlog:** newest-first entry in `docs/devlog.md`; update the `public/` size line under "Where we are" if it moved.

## 5. Verify in the browser

Run `pnpm build`, then serve and check the page. The script works headless, so the Chrome extension isn't needed:

```bash
pnpm preview --port 8090 --strictPort   # run in background
node .claude/skills/rebuild-hero-video/check-video.mjs http://localhost:8090/ <scratchpad>/shots
```

It checks desktop (1440x900), mobile (390x844) and `prefers-reduced-motion`, prints OK/FAIL per scenario, and exits non-zero on a failure. Checks: box ratio equals video ratio (no bars), no horizontal overflow, poster returns 200, muted + loop, autoplay (paused under reduced motion). Then open the desktop and mobile screenshots and look at them.

Not covered: Safari/MP4 playback and real devices. List those in the PR test plan for CC.

Then run `styleguide-check` and `seo-sweep`, and `ship` to push and open the PR.

## Flag, don't fix

- **Page weight:** the slot uses `preload="auto"`, so visitors download the whole file (~13–15 MB) up front.
- **Repo size:** `public/` is well over the 8–10 MB budget, mostly this video.
- **Footage content:** the QA agent clip shows an internal `portal.qa.trustana.com` URL and a colleague's username. CC chose to keep it (2026-10-06). Re-confirm if clips change.
