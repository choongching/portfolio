#!/usr/bin/env bash
# Rebuild the Trustana hero video for designby.cc from the Screen Charm clips.
# Output: lossless master, web MP4, web WebM, WebP poster, then automatic checks.
# Works with macOS's built-in bash 3.2 (no mapfile, no GNU stat).
set -euo pipefail

SRC="${SRC:-$HOME/Downloads/Screen Charm Footages}"   # folder with the clips
OUT="${OUT:-$SRC/montage}"                            # where results go
W="${W:-2560}"                                        # web width in px
MP4_CRF="${MP4_CRF:-20}"                              # lower = sharper + bigger
WEBM_CRF="${WEBM_CRF:-33}"                            # lower = sharper + bigger
MAX_BYTES=26214400                                    # Cloudflare Pages: 25 MiB per file

# Playback order. Edit this list to reorder, add or drop clips.
CLIPS=(
  "Attribute-management-Panel.mp4"
  "Video-Trustana-CustomExport.mp4"
  "Ai-DAM-Thumbnails-Image.mp4"
  "AI-Upscaler-App-toogle.mp4"
  "Image-Enrichment-Review-Step.mp4"
  "PDP-zoomed-in-AEO-Approval-Onhover-UX.mp4"
  "PDP-attribute-approval-review-onhover-zoomed.mp4"
  "QA-agent-simple-walkthrough-demo.mp4"
)

command -v ffmpeg >/dev/null || { echo "ffmpeg not found. Install with: brew install ffmpeg"; exit 1; }
ENCODERS=$(ffmpeg -hide_banner -encoders 2>/dev/null || true)
for enc in libx264 libvpx-vp9; do
  case "$ENCODERS" in *" $enc "*) ;; *) echo "ffmpeg is missing the $enc encoder. Stop and ask CC."; exit 1 ;; esac
done
# Poster: ffmpeg's libwebp if built in, else cwebp (Homebrew's ffmpeg ships without libwebp).
case "$ENCODERS" in
  *" libwebp "*) WEBP=ffmpeg ;;
  *) command -v cwebp >/dev/null && WEBP=cwebp || { echo "No WebP encoder: ffmpeg lacks libwebp and cwebp is missing (brew install webp). Stop and ask CC."; exit 1; } ;;
esac

mkdir -p "$OUT"
LIST="$OUT/.clips.txt"; : > "$LIST"
EXPECTED=0
for c in "${CLIPS[@]}"; do
  [ -f "$SRC/$c" ] || { echo "Missing clip: $c"; exit 1; }
  printf "file '%s'\n" "$SRC/$c" >> "$LIST"
  n=$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of csv=p=0 "$SRC/$c")
  EXPECTED=$((EXPECTED + n))
done

# 1. Every clip must share codec, size, pixel format and frame rate, or the lossless join breaks.
FORMATS=$(for c in "${CLIPS[@]}"; do
  ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate -of csv=p=0 "$SRC/$c"
done | sort -u)
if [ "$(printf '%s\n' "$FORMATS" | wc -l | tr -d ' ')" -ne 1 ]; then
  echo "Clips do not all match. Stop and ask CC. Formats found:"; printf '%s\n' "$FORMATS"; exit 1
fi
SW=$(printf '%s' "$FORMATS" | cut -d, -f3); SH=$(printf '%s' "$FORMATS" | cut -d, -f4)
H=$(( (W * SH + SW) / (2 * SW) * 2 ))   # keep the source shape, rounded to an even height
echo "Source ${SW}x${SH}, web ${W}x${H}, expecting $EXPECTED frames"

# 2. Lossless master: joins the original streams without re-compressing. Archive only, never commit.
ffmpeg -nostdin -v error -y -f concat -safe 0 -i "$LIST" -c copy -an -movflags +faststart "$OUT/trustana-montage-master.mp4"

# 3. Web MP4 (all browsers). Always encode from the master, never from an old web file.
ffmpeg -nostdin -v error -y -i "$OUT/trustana-montage-master.mp4" \
  -vf "scale=${W}:${H}:flags=lanczos" -c:v libx264 -preset slow -crf "$MP4_CRF" \
  -profile:v high -pix_fmt yuv420p -g 120 -an -movflags +faststart "$OUT/trustana-walkthrough.mp4"

# 4. Web WebM (Chrome and Firefox pick this first). Slow: several minutes for 77 s at 2560 px.
ffmpeg -nostdin -v error -y -i "$OUT/trustana-montage-master.mp4" \
  -vf "scale=${W}:${H}:flags=lanczos" -c:v libvpx-vp9 -crf "$WEBM_CRF" -b:v 0 \
  -deadline good -cpu-used 2 -row-mt 1 -tile-columns 2 -g 120 -pix_fmt yuv420p -an "$OUT/trustana-walkthrough.webm"

# 5. Poster: the exact first frame, so there is no jump when playback starts.
if [ "$WEBP" = ffmpeg ]; then
  ffmpeg -nostdin -v error -y -i "$OUT/trustana-montage-master.mp4" -frames:v 1 \
    -vf "scale=${W}:${H}:flags=lanczos" -c:v libwebp -quality 90 -compression_level 6 "$OUT/trustana-poster.webp"
else
  # Same quality 90 and top compression effort (-m 6), via a lossless PNG of the same frame.
  ffmpeg -nostdin -v error -y -i "$OUT/trustana-montage-master.mp4" -frames:v 1 \
    -vf "scale=${W}:${H}:flags=lanczos" "$OUT/.poster-frame.png"
  cwebp -quiet -q 90 -m 6 "$OUT/.poster-frame.png" -o "$OUT/trustana-poster.webp"
  rm -f "$OUT/.poster-frame.png"
fi

# 6. Checks. Any failure means: do not copy into public/, tell CC.
FAIL=0
for f in trustana-montage-master.mp4 trustana-walkthrough.mp4 trustana-walkthrough.webm; do
  frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUT/$f")
  audio=$(ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "$OUT/$f")
  bytes=$(wc -c < "$OUT/$f" | tr -d ' ')
  errs=$(ffmpeg -nostdin -v error -i "$OUT/$f" -f null - 2>&1 | head -1 || true)
  status="ok"
  [ "$frames" -eq "$EXPECTED" ] || { status="FRAME COUNT $frames != $EXPECTED"; FAIL=1; }
  [ -z "$audio" ] || { status="HAS AUDIO"; FAIL=1; }
  [ -z "$errs" ] || { status="DECODE ERROR: $errs"; FAIL=1; }
  if [ "$f" != "trustana-montage-master.mp4" ] && [ "$bytes" -gt "$MAX_BYTES" ]; then status="OVER 25 MiB"; FAIL=1; fi
  echo "$f  $((bytes / 1048576)) MB  $frames frames  $status"
done
rm -f "$LIST"
[ "$FAIL" -eq 0 ] && echo "All checks passed. Next: compare sharpness crops, then copy the 3 web files into public/." || { echo "Checks failed."; exit 1; }
