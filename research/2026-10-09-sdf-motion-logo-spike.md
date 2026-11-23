# Motion logo spike: Sydney Design Festival 2018

Spike date: 2026-10-09. Reference: the animated GIF at
https://bpando.org/wp-content/uploads/04-Sydney-Design-Festival-2018-Branding-Motion-Logo-ReAgency-Australia-BPO.gif
Goal: work out exactly how this motion logo moves and why it feels crafted, then translate the
mechanics (not the artwork) into the "designby[ ]cc" preloader lab (`designbycc-landing/_cc-lab-2.html`).
Explore mode: research only, nothing implemented.

Context, from the URL only: the file is published on BP&O (bpando.org) and its filename credits
ReAgency, Australia, for the Sydney Design Festival 2018 branding. Nothing else about the project
or agency is claimed here.

Method: GIF downloaded, `ffprobe` + PIL for frame metadata, all 49 frames extracted with ffmpeg,
labelled contact sheets, pixel tracking of glyph and label edges on every frame, and a least-squares
fit of GSAP eases to the tracked positions. All coordinates are in the GIF's own 1350×759 pixels.

## File facts

| Property | Value |
|---|---|
| Size | 1350 × 759 px |
| Frames | 49 |
| Frame delay | 40ms on every frame (checked per frame with both ffprobe and PIL; no variable delays) |
| Loop length | 1960ms |
| Loop flag | infinite (`loop 0`) |
| Palette | 3 flat colours: green `#1CC278` (28, 194, 120), white `#FFFFFF`, black `#000000`; about 30 palette entries in total, the rest are anti-aliasing |
| Not present | no motion blur, no opacity fades, no rotation, no horizontal travel, no overshoot |

## What you see

```
SYDNEY            FESTIVAL           DESIGN             SYDNEY
DESIGN      →     SYDNEY       →     FESTIVAL     →     DESIGN        (hold 928ms)
FESTIVAL          DESIGN             SYDNEY             FESTIVAL
  rest           tick 1 (346ms)     tick 2 (346ms)     tick 3 (346ms)
```

Three words stacked flush left, each on its own white label, in a size ramp: small, medium, large.
The stack is a reel seen through a fixed window. On each tick every word moves down one row **and**
grows to the next size; the bottom word slides out under the window's bottom edge, and the same word
re-enters from the top edge at the small size. Three ticks bring the order back to
SYDNEY / DESIGN / FESTIVAL, which then holds for almost a second. Only that order ever rests.

## Mechanics (measured)

**Window.** A fixed clip rectangle: top edge y = 254, bottom edge y ≈ 475 (221 px tall), left edge
x = 405. At rest the lockup fills it exactly: the top label starts on the top clip line and the
bottom label ends on the bottom one. The window *is* the resting silhouette, so the clip is
invisible until something moves. (At rest the bottom label extends 2 to 4 px past the line seen
during motion, and frame 18 shows 7 px; probably the clip is only active while moving, or an export
artefact. Immaterial to the look.)

**Size ramp.** One word at three sizes, uniform scale, same weight:

| Word | small | medium | large | ratio |
|---|---|---|---|---|
| glyph height (cap + overshoot) | 42 px | 57 px | 76 px | 1.36, 1.33 |
| SYDNEY width | 250 (f25) | 336 (f8) | 449 (f17) | 1.344, 1.336 |
| DESIGN width | 223 (f17) | 299 (f25) | 399 (f8) | 1.341, 1.334 |
| FESTIVAL width | 276 (f8) | 371 (f17) | 494 (f25) | 1.344, 1.332 |

So the ramp is geometric with step **S ≈ 1.34** (within measurement of a 4:3 modular scale; that
reading is my interpretation). The same word is simply scaled, never re-set at a different weight.

**Labels.** Each word sits on a white rectangle: padding ≈ 0.21 × cap height above and below
(12 px on the 57 px row, 16 px on the 76 px row), right padding 11 / 13 / 17 px (scales with the
word), left edge shared at x = 405 for every row. Each label's top edge sits on the baseline of the
row above (label top 305 vs glyph bottom 304; 371 vs 373 with overshoot), so the labels overlap into
one stepped white silhouette with no gaps. Baseline pitch 54 px then 70 px (ratio 1.30).

**One progress drives everything.** In every frame the y position of every row and the width of
every label sit at the *same* fraction of their own move. Beat 1, frames 0 to 6:

| | f0 | f1 | f2 | f3 | f4 | f5 | f6 |
|---|---|---|---|---|---|---|---|
| top row → middle (glyph top, 54 px move) | .02 | .07 | .24 | .67 | .85 | .94 | .98 |
| middle row → bottom (glyph top, 70 px move) | .01 | .07 | .23 | .64 | .84 | .93 | .97 |
| middle → bottom (label width 331 → 434) | .01 | .07 | .23 | .64 | .85 | .94 | .98 |
| bottom row → exit (label top, 104 px move) | .01 | .07 | .23 | .64 | .84 | .93 | .96 |

Position and scale are one tween; there is no stagger between rows.

**Entry (top edge).** The incoming word is pushed down from above the clip: 1 px of it at f1, 10 px
of glyph at f2, 33 px at f3, fully inside at f4 (`enter_top_f00-05.png`).

**Exit (bottom edge) and the "underline".** The outgoing word keeps growing past the large size as it
slides under the bottom clip. Because its label is wider than every row above it, the last thing
visible is the label's top padding: a white bar that reads as an underline and thins out:
15 px tall at f4, 6 px at f5, about 3 px at f6, gone at f7, while extending to x = 1045 / 1056 / 1060
(wider than the new large row's label at x = 839). It is not a separate element, just geometry plus
clip, but it gives each tick a crisp "wipe" ending (`exit_underline_f02-07.png`).

## Sequencing (one loop)

Time origin: the GIF's frame 0. The motion of tick 1 actually starts 50 ms before frame 0, so the
loop seam falls inside the first 2% of a move, which is why it loops invisibly.

| Phase | Time (ms) | Frames | What happens | Duration |
|---|---|---|---|---|
| Tick 1 | -50 → 290 | f48 → f7 | FESTIVAL leaves bottom, re-enters top: FESTIVAL / SYDNEY / DESIGN | 340 |
| (gap) | 290 → 296 | f7 ≈ f8 | near-still: last 1 px of settle | 6 |
| Tick 2 | 296 → 636 | f8 → f16 | DESIGN cycles: DESIGN / FESTIVAL / SYDNEY | 340 |
| (gap) | 636 → 642 | f16 ≈ f17 | near-still | 6 |
| Tick 3 | 642 → 982 | f17 → f24 | SYDNEY cycles: SYDNEY / DESIGN / FESTIVAL | 340 |
| Hold | 982 → 1910 | f25 → f48 | 24 pixel-identical frames, correct reading order | 928 |
| Loop | 1960 | 49 frames | | |

Duty cycle: 1032 ms of motion (53%), 928 ms of hold (47%). Tick period 346 ms, tick duration 340 ms:
the ticks are effectively back-to-back. The scrambled orders never truly rest; each gets about one
frame of near-stillness inside the long settle tail, so they read as passing, not as states.

Per-frame travel of the top row in tick 1 (54 px total): 1, 3, 9, **23**, 10, 5, 2, 1 px. Almost
half the distance is covered in a single 40 ms frame (f2 → f3).

## Easing (fitted)

Fit: all three ticks sharing one curve, free start, period and duration, least squares on the
tracked positions (27 samples).

| Ease | RMS error | Start | Period | Duration |
|---|---|---|---|---|
| `cubic-bezier(.7, 0, .2, 1)` | **0.46 px** | -50 ms | 346 ms | 340 ms |
| `cubic-bezier(.6, 0, .1, 1)` | 0.53 px | -30 ms | 348 ms | 340 ms |
| `power3.inOut` | 0.91 px | -74 ms | 346 ms | 365 ms |
| `power2.inOut` | 1.05 px | -34 ms | 346 ms | 285 ms |
| `power4.inOut` | 1.29 px | -80 ms | 346 ms | 375 ms |
| `expo.inOut` | 2.00 px | | | |
| `power3.out` / `expo.out` | 3.9 / 5.7 px | | | |

The three ticks fall on one curve (`ease_fit.png`): same ease, same duration, sampled at different
phases because 346 ms is not a multiple of 40 ms. In GSAP terms:
`CustomEase.create("tick", "M0,0 C0.7,0 0.2,1 1,1")`, duration 0.34, or stock `power3.inOut` at
0.365 as a close fallback.

What the curve does over 340 ms: 5% of the travel by 76 ms (a slow, loaded start), 25% → 75%
between 132 ms and 185 ms (half the move in 53 ms; peak velocity 4.0× the average, at 46% of the
duration), 95% by 252 ms, then an 88 ms settle. It reads as a **snap with a soft landing**: no
overshoot, no bounce. Ease-out-only curves fit badly (4 to 6 px error): the slow start matters.

## Art direction

- **Palette:** one saturated field colour, black type, white labels. Flat, three values, no tints.
- **Type:** a heavy grotesque in caps, tight tracking, set solid. Letterforms are **not abstracted
  at all**; the identity lives in the rule (stacked order, geometric size ramp, stepped labels,
  window), not in drawing the letters.
- **Grid:** one shared left edge; vertical rhythm is the scale ramp itself (each label's top on the
  baseline above). No other construction lines, no ornaments.
- **Construction:** one object (word + label) at three scales of one ratio. Everything that moves is
  that object moving to its neighbour's slot.

## Why it works (principles)

1. **One parameter, one ease.** A single progress value moves and scales every row at once. Nothing
   staggers, so the whole lockup moves as one body and the motion looks inevitable.
2. **Geometric self-similarity.** Because sizes form a 1.34 ramp, "move down one row" and "grow one
   step" are the same thing; every tick lands on a configuration identical in shape to the last.
3. **The window is the resting silhouette.** Entries and exits happen at the lockup's own edges, so
   at rest there is no visible frame or mask, only the mark.
4. **Tick, tick, tick, hold.** Three back-to-back 340 ms snaps, then a 928 ms hold (47% of the loop).
   Fast-in-the-middle eases with a long settle give each tick an ending without adding a pause.
5. **Only the correct reading rests.** Scrambled orders are transit (about one frame of stillness
   each); the true lockup gets all the stillness. The loop reads as "it shuffles and lands", not as
   a slideshow.

## Translation to the CC loader

Our system (from `_cc-lab-2.html`): white on `#141414`, orange `#F76D18` only for the Lissajous;
every frame sized to the wordmark's cap height (`--cap`, Switzer H ascent, about 0.7em of the
`clamp(36px, 6.4vw, 110px)` row); slot items are `cap × 1.4` tall at 2:1; one parametric C
(`C({ R, r, gap, dir, round })`, pair box 200 × 100, centres 54 / 146, `RO = 44`); GSAP power/expo.

Shared definitions for all ideas below:

```js
CustomEase.create("tick", "M0,0 C0.7,0 0.2,1 1,1"); // fallback: "power3.inOut", 0.365s
const S = 1.34, TICK = 0.34, PERIOD = 0.346, HOLD = 0.93;
```

### Idea 1: Slot reel (prototype this first)

*Upgrades:* the hand-off between every rendition. Today `show()` hard-cuts (`autoAlpha` swap, then
`scale .9 → 1`, 0.5 s `expo.out`) on noth.in's sine interval, which is what makes the lab read as a
slideshow. No rendition needs redrawing.

*Looks like:* inside the open slot, the CC renditions pass top to bottom like a reel. The incoming
pair pushes down from the slot's top edge at 0.746× (1/S), lands at exactly cap size; the outgoing
pair grows to 1.34× as it slides out under the bottom edge. At rest you see one pair, cap-sized,
and no mask (the window is the item box, exactly the rest silhouette). The "designby" and "cc" text
never move.

*Spec:*
- Window: one wrapper inside `.slot` with `overflow: clip`, sized and placed exactly like a
  `.slot__item` (cap × 1.4 tall, 2:1). Items inside it stacked by index.
- One proxy `reel = { p: 0 }`; each item `k` (offset from the resting one, `k = i − p`) renders with
  `transformOrigin: "50% 0"`, `y = h * (S ** k − 1) / (S − 1)`, `scale = S ** k`. This makes item
  tops form a geometric series with zero gaps, like their labels sitting on the baseline above.
  Only `k ∈ (−1, 1]` is ever visible; keep the rest `visibility: hidden` (the 3D frame's `live()`
  check relies on that).
- Tick: `gsap.to(reel, { p: "+=1", duration: TICK, ease: "tick", onUpdate: render })`, chained at
  `PERIOD` (position `"+=0.006"`).
- Phrase: 3 ticks (1.04 s), then `HOLD` 0.93 s on an **anchor** rendition whose `act()` plays during
  the hold. The two renditions passed on the way are **transit**: seen only in motion, like their
  scrambled word orders. Static renditions (the six typefaces) are natural transit items; renditions
  with an act (eyes, geo, interlock, Lissajous) are natural anchors.
- Suggested length: 3 phrases ≈ 5.9 s of reel, e.g. eyes → (type0, type3) → geo → (type1, outline)
  → interlock → (type4, stripes) → Lissajous. Fewer anchors, each fully played, fits CC's "craft not
  breadth" note.
- Landing: a final tick sends the last rendition out the bottom at 1.34× while the slot closes
  (existing `width → 0`, 0.9 s `power4.inOut`) and the bold `cc` **drops in from above**
  (`.w2` `yPercent −110 → 0`, `TICK`, `"tick"`), replacing today's rise from below (`yPercent 110`,
  0.8 s `power4.out`). Everything enters from above and leaves below, so the landing uses the same
  verb as every tick before it.

### Idea 2: Quarter-turn odometer (the plain C, and the eyes)

*Upgrades:* `F.geo` (today: one continuous 1.2 s `dir 0 → 360` `power4.inOut` with a 0.1 s stagger,
then `gap 66 → 8 → 66`). Works as an anchor act inside Idea 1.

*Looks like:* both Cs click round in four quarter turns, C → opening down → Ↄ → opening up → C, then
hold. The passing letters flash by; only the correct C rests.

*Spec:* `dir += 90`, four ticks, `TICK` 0.34 s, `"tick"`, chained at `PERIOD`, then `HOLD`.
`R = 44, r = 23, gap = 66`, flat terminals, unchanged. **Both Cs on one tween, no stagger**
(principle 1). Four ticks of 90° beat three of 120° here: 90° states read as letterforms (Ↄ is a
reversed C), 120° states read as random angles.

*Eyes variant* (`F.eyes`): put the pupil on the rim and step its angle θ in the same four quarter
ticks (`gx = cos θ`, `gy = sin θ`, `D = 25`, `PR = 22`, `ER = 44`, so `D + PR > ER` keeps the rim cut
and the eyeball stays a C whose opening turns). Both eyes on one progress. Keep the blink as the one
off-grid gesture during the hold.

### Idea 3: Zoom reel (concentric Cs)

*Upgrades:* `F.stripes` (horizontal slices) and `F.outline`; a self-similar version of the speed
stripes on the mood board, in our construction.

*Looks like:* each C is a set of nested Cs sharing one aperture, so the aperture reads as one notch
cut through all of them. Each tick every ring grows one step; the outer ring slides out past the
window (its last visible moment is a thin rim, the analogue of their underline sliver) and a new
ring is born at the centre. An infinite zoom that clicks.

*Spec:* per C, rings `k = 0..9`: `R_k = 44 * S ** (p − k)`, `r_k = 0.84 * R_k`, `gap = 62`,
`dir = 0`, flat terminals (ring band 0.16 R, dark gap 0.094 R, so bands and gaps keep one rhythm at
every scale). Window: `clipPath` circle at `RO = 44` around each centre. Three ticks on one proxy
`p` (`TICK`, `"tick"`, `PERIOD`), then `HOLD`; reset `p` modulo 1 after each tick. The smallest ring
is about 3 units, so births need no fade. Both Cs one progress.

### Rhythm note (applies to all three)

Today's `interval(i, n) = .09 + .5 · (1 − sin(π i / (n − 1)))` gives a continuously varying flicker.
Their grammar is different: constant tick period inside a phrase, a long hold after it. The two can
coexist (phrase tick period could accelerate across phrases, e.g. 0.40 → 0.346 → 0.30 s), but that is
an untested idea for CC to react to, not something in the reference.

## What not to copy

- **Their mark:** no stacked words in a size ramp, no white knock-out labels behind type, no green
  field, no heavy caps lockup. In particular, do not stack "design / by / cc" in a three-row ramp:
  same word count, same mechanic, it would read as theirs.
- **Their wordmark behaviour as a whole:** we keep our single-line "designby[ ]cc" and the slot; the
  reel lives inside the slot only.
- **The exact numbers as identity:** 340 / 346 / 928 ms and S = 1.34 are measured starting points
  for a generic ease and modular scale; tune them to our cap size and renditions.
- **Take:** one progress for everything, geometric ramp, window = resting silhouette, tick-tick-tick
  then hold, only the true lockup rests, flat colour with no fades or blur.

## Which to prototype first

**Idea 1, the slot reel.** It fixes the weakest part of the lab (the hard-cut swap is what reads as
unpolished), it applies to every existing rendition without redrawing any, it is small (one proxy
tween and a render function), and it carries four of the five principles at once. Idea 2 then slots
in as the geo anchor's act, which tests the tick ease on the C construction itself.

## Evidence (scratchpad, not committed)

Directory: `/private/tmp/claude-501/-Users-ccteo-Documents-Claude-designcc/17adcb5a-468e-4cad-84c2-8739a410dd1f/scratchpad/`

- `sdf/sdf.gif`, `sdf/frames/f001.png … f049.png` (file `fNNN` = frame NNN − 1)
- `sheets/sheet_all.png`: all 49 frames, labelled; shows three ticks and the 24-frame hold
- `sheets/beat1_f00-09.png`, `beat2_f08-17.png`, `beat3_f16-25.png`: each tick at full resolution
- `sheets/exit_underline_f02-07.png`: the outgoing label thinning into an underline
- `sheets/enter_top_f00-05.png`: the incoming word pushed in under the top edge
- `sheets/ease_fit.png`: tracked progress of all three ticks on the fitted curve
- Scripts in `scripts/` (`gifmeta.py`, `diff.py`, `glyphs.py`, `profile.py`, `fit.py`, `plot.py`)

## Open questions for CC

- Reel direction: top to bottom (as the reference, reads as "falling into place") or bottom to top
  (reads as "rising", matching how the slider's text reveals)?
- How many anchors: three fully played renditions, or more with shorter holds?
- Should the tick period stay constant, or accelerate across phrases as noth.in's flicker does?
