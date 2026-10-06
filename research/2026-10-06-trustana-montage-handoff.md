# Handoff: new Trustana montage video for the homepage

Prepared in Cowork on 2026-10-06 for Claude Code to build from.

## What changed (plain language)

CC recorded 8 short, polished Screen Charm clips of the Trustana platform. They have been joined into one silent, looping montage (77 seconds). It replaces the current 24-second, 720p walkthrough on the homepage. The new video is much sharper: 2560 px wide instead of 1280.

The video files are finished. The only remaining work is in this repo.

## Source files (already made, do not re-encode)

Folder: `~/Downloads/Screen Charm Footages/montage/`

| File | Use | Specs | Size |
|---|---|---|---|
| `trustana-walkthrough.mp4` | Replaces `public/trustana-walkthrough.mp4` | H.264 High, 2560 x 1604, 60fps, no audio, faststart | 15.2 MB |
| `trustana-walkthrough.webm` | Replaces `public/trustana-walkthrough.webm` | VP9, 2560 x 1604, 60fps, no audio | 13.3 MB |
| `trustana-poster.webp` | Replaces `public/trustana-poster.webp` | 2560 x 1604, first frame of the video | 91 KB |
| `trustana-montage-master.mp4` | Archive only. **Do not commit.** | Lossless join of the originals, 3446 x 2160 | 114 MB |

Already verified: 4,635 frames in every version (no dropped frames), no audio stream, both web files under Cloudflare Pages' 25 MiB per-file limit, small UI text matches the originals in zoomed crops.

## Tasks

Work on a new branch off `main`, e.g. `feat/trustana-montage-video` (one branch, one PR, one devlog entry, per repo convention).

1. **Copy the 3 files** above into `public/`, overwriting the old ones. Same filenames, so `Projects.tsx` paths stay as they are.
2. **Fix the video box shape** in `src/components/GallerySlot.tsx`.
   - The new video is about 16:10, not 16:9. With the current `aspect-video` box, it would show thin empty bars on the sides.
   - Change `aspect-video` in `videoBase` to `aspect-[640/401]` (this is 2560/1604 reduced, so it matches the web file exactly).
   - Update the comment on line 26, which still refers to 16:9 and 1280 x 720.
   - Follows the repo rule: adapt the box to the video, never the video to the box.
3. **Update the video text** in `src/components/Projects.tsx` (`ariaLabel` and `description`). The current text describes the old video. What the new montage shows, in order:
   1. Adding a new product attribute (type, group, category, AI enrichment toggle)
   2. Custom export field mapping
   3. Auto Transform image grid
   4. Image settings with the AI Upscaler toggle
   5. Choosing scraped images in an image enrichment review task
   6. Reviewing AI output on AEO attributes (Approve / Reject / Clear)
   7. A close-up of that review popover
   8. The Product Attribute QA agent: agent list, overview, QA results, files and run log
   - Draft a new description from this list and **show it to CC before committing**. Do not invent features that aren't in the list.
4. **Update the JSON-LD `VideoObject`** in `index.html`:
   - `duration`: `PT24S` to `PT1M17S`
   - `uploadDate`: set to the date this ships
   - `description`: match the new description from step 3
5. **Sitemap:** bump `lastmod` in `public/sitemap.xml` if that's what was done last time the video changed (see the 2026-05-20 devlog entry).
6. **Asset guidelines:** `docs/asset-guidelines.md` section 3 says 720p to 1080p, 1 to 3 MB, 5 to 15 second loops. This video is a deliberate exception (sharpness on Retina screens matters more for this one hero video). Add a short note about the exception rather than rewriting the whole section.
7. **Devlog:** add a newest-first entry in `docs/devlog.md`. Worth noting: the old video was 1280 wide and was being stretched about 2x on Retina screens, which is why it looked soft.

## Things to flag, not change

- **Page weight.** A visitor downloads one of the two files (WebM in Chrome and Firefox, MP4 in Safari), so about 13 to 15 MB. The slot uses `preload="auto"`, so the whole file loads right away. Leave it as is, but mention it to CC as an option to revisit.
- **Repo size.** The two new web files add about 28 MB to `public/`, which is already over the documented 8 to 10 MB budget. Mention it, don't fix it.
- **Public footage.** The QA agent clip shows an internal `portal.qa.trustana.com` URL (first 3 seconds) and a colleague's username. CC reviewed this and chose to keep it as is. No action needed.

## Verify before opening the PR

- `pnpm build` passes.
- In the browser at desktop width: no empty bars around the video, poster shows before playback, video autoplays muted and loops.
- `prefers-reduced-motion` still pauses the video.
- Check on a narrow (mobile) viewport too.
- `ffprobe` on the copied files shows 2560 x 1604 and no audio stream.

## Standing rules

- Do not invent copy, features or numbers. Use only what's in this note or the repo.
- If anything here doesn't match what you find in the repo, stop and ask CC before changing it.
