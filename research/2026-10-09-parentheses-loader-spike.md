# Preloader spike: "(Published Tales)" parentheses reel

Spike date: 2026-10-09. Reference: Pinterest pin 837247387005641869 (video, uploader not named on
the pin; nothing about the author is claimed here). Goal: measure the motion exactly, as the model
for a "designbycc" loader where the first word swaps while the page loads. Explore mode: research
only, nothing implemented. File: 1278 × 852, 30 fps, 176 frames (5.87 s), silent audio track.
Method: every frame extracted with ffmpeg; bracket and text extents tracked per frame with PIL
(dark-pixel column runs); zoomed sheets for the fast moments. Frame numbers are 0-based, times at
30 fps. Pixels are the video's own.

## What you see

```
( )   →   ( Published Tales )   →   ( P        Tales )   →   ( Studio Tales )   →   ( Weekly Tales )   →   ( )
pop       brackets fly apart,       first word deleted      typed in, lockup         same again          brackets fly
          text revealed between     letter by letter        re-centres                                    together, pop off
```

One line of black serif type on an off-white field. A pair of parentheses is the device: they pop
in as a closed pair, fly apart to reveal the text between them, stay as the frame while the first
word is deleted and retyped (the second word stays), and fly back together to close. The lockup is
always centred on the frame; only the first word changes.

## Art direction

| Property | Value |
|---|---|
| Field | `#F7F5F2` (warm off-white), flat |
| Type | black `#000`, a transitional serif (Times-like), regular weight, tight tracking |
| Size | glyph box ≈ 122 px tall on an 852 px frame (≈ 14% of frame height); parentheses are the font's own, same size |
| Layout | one line, always centred; gap bracket → word ≈ 0.25 em; word gap ≈ 0.2 em |
| Not present | no colour, no motion blur, no scale, no vertical motion, no cursor/caret |

## Mechanics (measured)

**Brackets.** Closed pair rests at x = 593–615 and 660–682 (45 px apart, centred). Each bracket is
a 22 px wide glyph.

**Open (f17 → f30, 0.47 s).** Both brackets fly apart on one strong ease-out. Left bracket x per
frame: 593, 479, 412, 364, 329, 302, 281, 264, 251, 241, 233, 228, 224, 222, 220. Per-frame travel:
114, 67, 48, 35, 27, 21, 17, 13, 10, 8, 5, 4, 2, 2. Right bracket mirrors it (682 → 1057). That is
`expo.out` (fits within 3 px). The text is already in its final place; the brackets act as a
**mask** (text is only visible between them) and the text **fades in from grey over 3 frames**
(f17 grey, f18 dark, f19 black).

**Pops.** "(" appears with no animation at f4; ")" appears 4 frames later (f8). The pair holds 9
frames before opening. At the end "(" vanishes at f160 and ")" 4 frames later (f164). Pop in,
pop out, left then right, 0.13 s apart.

**Delete (backspace).** The first word is removed from its last letter backwards; the second
word and brackets do not move, so an empty gap opens: `(P        Tales)`.
"Published" (9 letters): removed at f36, 37, 38, 40, 41, 43, 45, 48 → intervals 1, 1, 2, 1, 2, 2, 3
frames (0.4 s total, slightly slowing). "Studio": f91, 92, 93, 96, 98, 102 → 1, 1, 3, 2, 4 (0.37 s).

**Gap.** Empty first slot for 8 frames (0.27 s) and 7 frames (0.23 s).

**Type.** The new word is typed from its first letter, at its final left edge, **slowing down**:
"Studio" at f56, 57, 58, 60, 62, 66 → intervals 1, 1, 2, 2, 4 (0.33 s). "Weekly" f109, 110, 112,
115, 120 → 1, 2, 3, 5 (0.37 s). While it types, the lockup **re-centres for the new width**: the
brackets and the second word slide to their new places on the same `expo.out` (left bracket 220 →
303 over 12 frames: 27, 15, 11, 8, 6, 4, 4, 2, 2, 2, 1, 1), starting on the first typed letter.

**Holds.** `(Published Tales)` ≈ 6 frames after the brackets settle (0.2 s); `(Studio Tales)` 24
frames (0.8 s); `(Weekly Tales)` 20 frames (0.67 s).

**Close (f140 → f155, 0.5 s).** Brackets fly together on `expo.out` (left 272 → 593: 98, 58, 41,
30, 23, 19, 14, 11, 9, 6, 5, 3, 2, 2, 1), masking the text as they go; the text also fades to grey
and out over f140–144. The closed pair holds 16 frames (0.53 s), then pops off.

**Loop.** 4 empty frames at the start + 12 at the end = 0.53 s of empty field at the seam.

## Sequencing (one loop, 5.87 s)

| Time | Frames | Beat | Duration |
|---|---|---|---|
| 0.00 | 0–3 | empty | 0.13 s |
| 0.13 | 4 | "(" pops in | |
| 0.27 | 8 | ")" pops in | hold 0.30 s |
| 0.57 | 17–30 | open: brackets fly apart (expo.out 0.47 s), text fades in 0.1 s, masked | |
| 1.00 | 30–35 | hold "(Published Tales)" | 0.20 s |
| 1.20 | 36–48 | delete "Published" | 0.40 s |
| 1.60 | 48–55 | empty slot | 0.27 s |
| 1.87 | 56–66 | type "Studio" (slowing), lockup re-centres (expo.out 0.4 s) | 0.33 s |
| 2.20 | 66–90 | hold | 0.80 s |
| 3.03 | 91–102 | delete "Studio" | 0.37 s |
| 3.40 | 102–108 | empty slot | 0.23 s |
| 3.63 | 109–120 | type "Weekly", re-centre | 0.37 s |
| 4.00 | 120–139 | hold | 0.67 s |
| 4.67 | 140–155 | close: brackets fly together (expo.out 0.5 s), text fades out, masked | |
| 5.17 | 144–159 | hold "( )" | 0.53 s |
| 5.33 | 160 | "(" pops off; ")" 4 frames later | |
| 5.47 | 164–175 | empty | 0.40 s (+0.13 at the start) |

Duty: about 2.2 s of motion, 3.7 s of holds and empties. Every move is `expo.out`; nothing eases
in, nothing overshoots. Typing and deleting are stepped (no tween), on slightly decelerating
intervals of 1 to 5 frames.

## Why it works

1. **One device.** The parentheses are both the frame and the mask. Nothing else moves.
2. **Snap, then settle.** Every slide covers half its distance in the first two frames and takes
   the rest of 0.4 to 0.5 s to land. No bounce.
3. **The lockup stays centred.** The second word and brackets re-flow for every new first word,
   so the line always sits in the middle and the change reads as the line "breathing".
4. **Stepped text, tweened frame.** Letters appear and vanish in steps (typed), while the frame
   around them glides. The contrast between the two is the texture.
5. **Short holds.** 0.7 to 0.8 s on a word, barely 0.2 s on the first one: it keeps moving.

## Translation to the designbycc loader

Direct mapping: the second word is **bycc** (fixed), the first word is the variable one, resting
on **design**. The lockup is "(design bycc)" or "(designbycc)" (spacing is CC's call). Everything
above transfers one to one: pop in, open, delete the first word, type the next, re-centre, hold,
repeat while loading; when loaded, type "design" last and close (or hand off to the header).

Motion spec in GSAP terms: brackets `x` on `expo.out`, 0.47 s open / 0.5 s close / 0.4 s re-centre;
text reveal = `clip-path: inset(0 R 0 L)` driven by the bracket positions plus `autoAlpha` 0 → 1 in
0.1 s; typing/deleting as stepped `delayedCall`s with intervals `[33, 33, 67, 67, 133] ms`
(typing) and `[33, 33, 67, 33, 67, 67, 100] ms` (deleting); holds 0.8 s; pops 0.13 s apart.

Open for CC: typeface (theirs is a serif; ours is Switzer, with "cc" bold as the wordmark), the
exact first-word list, and whether the parentheses stay (they are the reference's signature, but
also the whole mechanic).
