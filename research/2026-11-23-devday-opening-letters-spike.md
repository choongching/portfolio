# Motion spike: OpenAI Dev Day opening, letter treatment

**Outcome (2026-11-24):** this letter build stayed in its lab (`_opening-lab.html`, local). The
opening that shipped is a different idea, the swap lab's (a doodle, media cuts, the bots; #94 and
#96, see `docs/devlog.md`). Kept as the record of how the reference builds its letters.

Spike date: 2026-11-23. Reference: CC's screen recording `~/Desktop/OpenAI Dev Day Opening
Animation.mov` (2030 × 1168, 60 fps, 646 frames, 11.3 s, no audio). Goal: understand how each
letter is displayed and built, as the model for a new designby.cc opening (loader, logo and the
moment loading finishes). Explore mode: the lab is `designbycc-landing/_opening-lab.html` (local,
never built). Nothing about the authors or tooling of the reference is claimed here.

Method: contact sheets of every 8th frame (0.133 s per tile), full-resolution crops of frames
4–44 (the "OpenAI" build).

## What you see

Every word is built the way a font editor shows a glyph, in three layers, sweeping left to right:

1. **Points.** The glyph's on-curve points (extremes and corners only, no handles) as solid dots
   in an accent colour (orange for "OpenAI", blue for "DevDay", purple for "2026"). They start
   as one cluster (frame 0: a single blob where the first letter will be) and spread out to their
   places, letter by letter. Dot diameter is about 0.1 of the cap height.
2. **Outline.** A hairline traces every contour, outer and inner, with overlaps left visible (the
   stem of "p" runs through its bowl, as in the source outlines).
3. **Fill.** The letter fills solid (white, or the word's colour). The points stay on top for a
   moment, then drop away.

At any instant the three layers are spread across the word: points at the leading edge, outlines
behind them, fills behind those (frame 44: "Op" filled, "en" outlined, "AI" still points).

Timing, measured per letter (white and orange pixel counts per letter column, every frame;
`layers.py` in the session scratchpad), seconds at 60 fps:

| | O | p | e | n | A | I |
|---|---|---|---|---|---|---|
| points | 0.05 | 0.10 | 0.18 | 0.22 | 0.30 | 0.37 |
| outline | 0.37 | 0.42 | 0.47 | 0.52 | 0.55 | 0.60 |
| fill | 0.65 | 0.68 | 0.72 | 0.75 | 0.78 | 0.80 |

- Each letter runs its own pipeline; letters overlap ("O" is filled while "I" is an outline).
- Points → outline 0.32 s for "O", 0.23 s for "I"; outline → fill 0.28 s, then 0.20 s: later
  letters catch up, so the fills arrive faster than the points did (≈ 0.03 s apart vs 0.065).
- Outline and fill each land in a single frame (no draw-on, no fade).
- Points pop in larger and shrink to size over ~0.2 s; they stay on the filled letter briefly,
  then go; at 0.83 s the whole word cuts to a smaller size in one frame.
- Exit (frames ~620–640): the reverse, fill → outline → points, and the points scatter.

Second scene (not used here): a headline set justified across the width, built line by line with
the same three layers, purple points and orange fill.

## Translation to designby.cc (lab)

- The wordmark's own glyphs: Switzer at 400 ("designby") and 700 ("cc"), outlines and on-curve
  points extracted with fontTools (`research/2026-11-23-devday-opening-letters-glyphs.py`; needs `fonttools brotli uharfbuzz`); layout shaped with HarfBuzz (kerning) plus the site's 0.02em
  tracking, so the built wordmark lands exactly on the 19px header logo. 10 glyphs, 8 KB of data.
- **Points = the loader.** Letter i's points spread once loading passes i / 10. No spinner.
- **Per-letter pipeline** with the measured gaps (0.30 / 0.28 s, catching up to ~72 %), so the
  layers overlap along the word; the last fill lands once loading completes. Then the wordmark
  lands in the header corner and the cards come in.
- **Side panel** in the lab: every timing and look value as a live slider, saved per browser;
  "Copy values" hands the tuned numbers back.
- **Exit (reverse)** is ready for page changes later.

## Stack

SVG paths + GSAP (already on the site). The outlines are drawn with `pathLength="1"` and a dash
offset; the stroke stays a hairline at any size with `vector-effect: non-scaling-stroke`; the
points are `<circle>`s animated by attribute (`cx`, `cy`, `r`). No font parsing at runtime (the
paths are precomputed), no WebGL: the effect is vector by nature, so shaders would only add a
canvas-to-text hand-off and a font-to-texture pipeline for no visual gain.
