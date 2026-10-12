# Spike: LinkedIn spiral card, infinite spiral on hover

Spike date: 2026-10-12. CC's ask: on mouse hover the spiral text should spin as an infinite
spiral, moving in towards the dead centre; it halts on mouse out or when the window loses focus.
Lab: `designbycc-landing/_spiral-lab.html` (local only, excluded from git) ran the real
`linkedin-spiral.js` with both variants side by side, plus a speed slider each (Flow only now).

## Two variants (`data-spiral-motion` on `.js-a-spiral`)

| | A · Flow (default) | B · Vortex |
|---|---|---|
| Rest look | unchanged: one sentence on the Archimedean spiral | new: log spiral, each letter sized ∝ radius, the sentence repeats smaller forever (Droste) |
| Hover | the sentence streams along the same spiral into the centre; copies follow in from the rim | the whole field zooms into the centre |
| How | one `<textPath>` holding repeated copies; animate `startOffset`. Path extended past the rim and to r≈2 | glyphs drawn once to two bitmaps (`<image>`), animate one `rotate + scale` transform |
| Speed | 130 path px/s | 1.2 rad/s along the spiral |

Shared: speed ramps up with a 0.4 s time constant; mouse out, window blur or a hidden tab brake it
to a halt in place (0.18 s time constant, ~0.6 s to stop). Copies that only exist for the motion
(`.a-spiral__echo`) fade in on the first hover and stay, so a halted spiral is never half empty.
A radial mask fades text in at the rim and out at the centre; in Flow the centre fade widens with
speed, where the inner turns crowd. Mouse only (`pointerType === "mouse"`); touch and
`prefers-reduced-motion` get the static card.

## Maths

- Flow: r(θ) = R0 − Bθ, R0 238, R1 40, 3.6 turns. Extended outward to the rim + 30 and inward to
  r 2. The sentence is fitted to 98% of the original section, so the resting layout is identical
  (diffed: settled frame = rest frame, before the halt change).
- Vortex: r(φ) = R0·e^(−Gφ), G 0.0375, glyph size 0.16·r. Each glyph's step in φ is
  advance·M / √(1+G²), the same at every radius, so the sentence period is constant in φ. Moving
  every glyph φ along the spiral = rotate by φ and scale by e^(−Gφ) about the centre: one
  transform animates everything, and the loop is seamless every sentence period.

## Performance (headless Chrome, 1300×900)

| Case | Frame time |
|---|---|
| Either variant with the SVG hit-testable under the cursor | ~300–500 ms |
| Flow, `pointer-events: none` on the svg | 16.7 ms |
| Vortex as ~1,400 SVG `<text>` glyphs, scaled per frame | ~300–500 ms (re-rasterises every glyph at a new size) |
| Vortex as two pre-drawn bitmaps | 16.7 ms |

The bitmap only ever shrinks during the motion, so drawing it at 1.5× DPR keeps it sharp. The real
card's image atom already has `pointer-events: none`; the svg now sets it too.

## Decision and follow-ups (same day)

- CC picked **A · Flow**. The Vortex code was removed; this note keeps its maths.
- Rim cropping (CC's screenshot): the extension turn outside R0 crossed the rim. Fix: a band mask,
  the spiral stroked one ring gap wide from the resting start inwards, plus 24 steps of rising
  opacity over the quarter turn before it. Text only shows on the resting rings and fades in.
- Performance: the slow CSS turn on an SVG `<g>` re-laid out the textPath every frame, and with
  five copies that doubled idle layout vs `main`. The disc is now its own `<svg>` layer, turned as
  a composited element (`will-change: transform`): idle layout 5 ms/s vs `main` 10.
- The spiral copy itself is stale ("12 years", "Right now I'm at Trustana"); not changed here.
