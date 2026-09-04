# The "CC" mark as a living identity — style research (August 24 2026)

**Purpose:** find alternatives to the rotating Lissajous outline currently on the study's
ADG-FAD card, so the mark can be chosen rather than inherited. Three parallel reference sweeps
— typographic/lettering, generative/computational, and real animated identities in the wild.

**Status: RESEARCH ONLY.** Nothing here has been applied. The shipped card is unchanged. CC's
instruction on the day was "nothing to take actions on, just research for now."

**Companion artefacts, both self-contained, no build step and no dependencies:**

| File | What it is |
|---|---|
| `2026-08-24-cc-mark-style-exploration.html` | 14 live treatments of the same mark, side by side, each with a source link |
| `2026-08-24-cc-nib-contact-sheet.html` | The three broad-nib dials (width, floor, angle) varied one at a time |

Both **copy** the mark geometry out of `designbycc-landing/lissajous-c.js` rather than
importing it — that file is an IIFE with no exports. They will drift if the shipped curve or
nib changes. That was the right trade for exploration pages; it would not be for anything kept
in sync.

---

## The finding that matters most

All three sweeps landed on the same critique, from different directions: **in the current mark
the letterform is a coincidence of the math, not a decision.** The "C" appears because
`a=2, b=1` happens to bow that way, and `NIB.angle` is a constant, so the distribution of thick
and thin is a by-product of the parametrisation rather than of how a hand holds a pen. A design
audience reads it as a good generative curve that resembles CC — not as lettering.

That reframes the choice. The question is not "which effect is prettiest" but **how much of the
letterform do we want to be a decision**, and there are three honest answers:

1. **Keep the curve, make the pen honest** — the smallest change (card 14 below).
2. **Keep the silhouette, swap the material** — the mark is a mask; anything can play behind it.
3. **Draw the letters deliberately** — a grid-constructed CC where every module is a decision.

---

## What is on the exploration page

Cards 1–4 and 14 keep the letterform intact. Cards 5–13 re-render it in another material.

| # | Treatment | Register | Source |
|---|---|---|---|
| 01 | Broad-nib ribbon (**current**) | oscilloscopic | — |
| 02 | Inline — hollow stroke with a hairline spine | sign painting | [Google Fonts glossary](https://fonts.google.com/knowledge/glossary/inline) |
| 03 | Topographic — nested outlines at stepping nib widths | cartographic | [Marching squares — Jamie Wong](http://jamie-wong.com/2014/08/19/metaballs-and-marching-squares/) |
| 04 | Write-on, then flood to solid | lettering craft | [Jake Archibald](https://jakearchibald.com/2013/animated-line-drawing-svg/) |
| 05 | Halftone | newsprint | [Carmen Ansio](https://www.carmenansio.com/articles/halftone-in-the-browser/) |
| 06 | ASCII | terminal | [Codrops / Efecto](https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/) |
| 07 | Particle assembly | matter | [CSS-Tricks](https://css-tricks.com/adding-particle-effects-to-dom-elements-with-canvas/) |
| 08 | Line displacement | *Unknown Pleasures* | [Line moiré](https://en.wikipedia.org/wiki/Line_moir%C3%A9) |
| 09 | Ordered dither | 1-bit print | [Ditherpunk — Surma](https://surma.dev/things/ditherpunk/) |
| 10 | Stipple | engraving | [Voronoi stippling — Bostock](https://observablehq.com/@mbostock/voronoi-stippling) |
| 11 | Flow field | combed field | [Flow fields — Tyler Hobbs](https://www.tylerxhobbs.com/essays/2020/flow-fields) |
| 12 | Moiré interference | op art | [Shape moiré](https://en.wikipedia.org/wiki/Shape_moir%C3%A9) |
| 13 | Modular grid | Swiss / systems | [New Alphabet — Crouwel](https://en.wikipedia.org/wiki/New_Alphabet) |
| 14 | Manipulated nib | calligraphy | [Metafont](https://en.wikipedia.org/wiki/Metafont) |

---

## Traps found while building these

- **Raster-sampled styles need a heavier mark.** The shipped nib is 7.5 units; under a 9px
  halftone grid that leaves almost nothing to sample, and the first pass rendered as a scatter
  of unrelated dots. Cards 05–12 sample the mark at a much fatter nib. **Choosing any texture
  treatment implies a heavier letterform, not just a different surface.**
- **The two C's cannot always overlap.** The curved mark overlaps by 110 units and reads as an
  interlock. At modular-grid weight the second C's stem lands inside the first C's opening and
  the pair reads as a single box. Blocky letterforms need real letterspacing.
- **Trail effects need to opt out of the frame clear**, or the fade they paint is wiped each
  frame and only the newest segment survives.
- **Variable-font axis animation is the one option that requires shipping a font file.** The
  code is ten lines; the asset is 30–80KB even subset, and it needs a licence check. Everything
  else on the page is pure geometry, which is only possible because a C is an arc — this would
  not hold for a longer wordmark.

---

## What the sweeps recommended, and what I would actually pursue

The three sweeps converged on remarkably little overlap, which is itself useful — they are
recommending three different *kinds* of answer.

**Smallest change, largest honesty gain: the manipulated nib (card 14).** `NIB.angle` becomes a
function of position along the curve plus time, so the wrist turns through the stroke the way
real calligraphy does. It keeps everything already built and fixes the "the thick/thin is an
accident" critique directly. This is the one to do if the answer is "improve what we have."

**Mark as aperture.** Repeatedly the strongest and cheapest idea across the identity sweep
(OCAD, City of Melbourne, AOL): keep the CC absolutely fixed as a `clipPath` and let anything
play behind it. Zero risk to legibility, unbounded variety, and it turns every other card on
the exploration page into a *fill* rather than a competing mark. If we want a system rather than
an effect, this is the structural move.

**Idle behaviour beats reactivity.** From Unseen Studio's cursor-tracking eyes: the thing that
sells "alive" is the scheduled **blink**, not the tracking. A mark that only responds to the
cursor is dead whenever the cursor is elsewhere, which on a portfolio card is most of the time.
The current card already gets this right with its breathing — worth not losing.

**A two-channel parametric mapping is the only version with a caption.** Visit Nordkyn's
generator (still live at [visitnordkyn.com/vngenerator](https://visitnordkyn.com/vngenerator/),
though now on manual inputs rather than the original 5-minute weather feed) maps one scalar to a
colour ramp and one angle to geometry deformation. Constrain that with the 2014 MIT Media Lab
rule — build the letters on a fixed module so variation happens *inside* a legible letterform —
and the card becomes a system you can explain in five numbered steps rather than an effect.

**The through-line across every identity that survived.** The variation is always constrained by
an inflexible anchor — MIT's 7×7 grid, the Whitney's locked wordmark, Melbourne's fixed
silhouette, OCAD's immovable frame. Experimental Jetset said it plainly: for the responsive W to
be truly flexible, it also has to contain some inflexibility. Systems that randomise the
*letterform* rather than what happens inside it are not on anyone's list, because they don't
survive as identities. Whatever we pick, something has to be nailed down.

**Only three generators in this whole survey still run in a browser:** the
[Nordkyn generator](https://visitnordkyn.com/vngenerator/) (the genuine article, still hosted by
the client, now on manual inputs), a third-party
[p5.js recreation of the Whitney W](https://www.generativ.design/experiments/whitney-identity),
and Patrik Hübner's
[generative logo synthesizer](https://www.patrik-huebner.com/generative-design/generative-logo-synthesizer/).
Everything else — MIT both eras, Casa da Música, OCAD, Melbourne, Porto, Oi, Intrinsic — is
case-study images and video. Casa da Música's generator is accessioned software in MoMA's
collection and will never run for us. Worth remembering when judging how much of this is
evergreen: almost none of it.

**Explicitly rejected.** Anything needing three.js or WebGPU: the setup cost is large and the
payoff wants a viewport a 400×540 card does not have. Anything gated behind a microphone
permission. Anything needing a full alphabet — we have two glyphs. And the SVG goo filter,
tempting as it is, is the most-copied effect in this space and will read as a Codrops demo to
exactly the audience worth impressing.

---

## Where the sweeps disagreed

Worth recording rather than resolving, because both arguments are good.

**The SVG goo filter.** One sweep called it the single best fit on the list — "CC" is literally
two blobs, so two C's merging into one form and pulling apart again is a narrative *about* the
monogram rather than an effect dropped on top of it. The exact recipe is three nodes:
`feGaussianBlur stdDeviation` → `feColorMatrix` with an alpha row of `0 0 0 15 -8` → `feComposite
atop`; raise `stdDeviation` well above the demo's 1 for 400px type, and keep the filter region
tight or Safari crawls. The other sweep called it the most-copied effect in this space, arguing
it will read as a Codrops demo to exactly the audience worth impressing. Both are right; it
depends whether the card is meant to look bespoke or to look *unfamiliar*.

**One more argument for the parametric route** that nothing else on the list survives: a static
capture of a Nordkyn-style mark is still a real mark, where a screenshot of a particle explosion
is a mess. A portfolio card gets screenshotted, shared and thumbnailed. That's a real constraint
and it quietly disqualifies most of the texture family.

**And a licence on pre-rendering.** &Walsh's identity is famously a new custom ampersand for
every project, but their homepage serves the *same* fixed render on every load — the variety is
produced offline and deployed per application. So a "material wardrobe" system does not require
runtime generation. Cycling a pre-rendered set is a legitimate execution, not a cop-out.

## If we ever build: the sequencing matters more than the pick

The most actionable line across all the sweeps was structural, not visual. **Make CC a render
function of a few parameters — arc sweep, stroke weight, overlap — before choosing any
treatment.** Today it is effectively a fixed path with animation bolted on. If it were a function
instead, every treatment on the exploration page becomes a *consumer* of its output rather than
a rewrite of it, a goo filter or a particle sampler or a colour ramp can all be swapped without
redrawing anything, and the Nordkyn-style parametric binding comes free from the same code.
That is the cheap decision to take first, and it does not commit us to a style.

## Two negative findings, recorded so nobody re-derives them

**Most famous motion studios do not animate their own wordmark.** Checked directly:
basement.studio's `basement.` is static type (its three canvases sit unused at the default
300×150); darkroom.engineering's wordmark is static and the liveness is displaced into glyph-noise
strips in the surrounding chrome; DIA — a studio whose reputation *is* kinetic identity —
redesigned to a plain static serif wordmark and `dia.tv` now redirects to `dia.studio`. The
motion budget goes to the hero scene, not the mark. Which cuts both ways: animating the mark
itself is rarer than the inspiration galleries imply, so doing it well is differentiating — but
the galleries are not evidence that it's normal.

**If we ever build the particle treatment, sample the outline, not the fill.** The best vanilla
reference is Sean Free's pen ([codepen.io/seanfree/pen/bGGyBYE](https://codepen.io/seanfree/pen/bGGyBYE),
~120 lines, no libraries, `getImageData` → spring-return particles). Its `drawType: STROKE`
option is the load-bearing detail: particles tracing the letterform's *outline* keep a two-letter
mark readable at card size, where a filled dot field turns to mush. This is the same lesson the
exploration page taught from the other direction — the raster styles needed a much fatter nib to
have anything to sample. Density versus card size is where all the tuning time goes.

Also: Dinamo's Font Gauntlet moved to [fontgauntlet.com](https://fontgauntlet.com); the old
`abcdinamo.com/tools/font-gauntlet` path 404s.

## Dead or changed since their case studies — do not re-search these

- `kalliculator.com` — cert now serves `beta.robofont.com`.
- `tympanus.net/Development/KineticTypography/` — 404.
- `tympanus.net/codrops/2018/01/17/interactive-particles-text-create-with-three-js/` — 404.
- **darkroom.engineering** — the Studio Freight identity treatment is gone; now a red-on-black
  monospace terminal. (Its density-ramp dingbat strip — solid → outlined → dotted → striped →
  hatched → dithered — is still worth stealing as a way to imply state with no motion at all.)
- **DIA** — `dia.tv` redirects to `dia.studio`, redesigned to a plain serif wordmark; the
  kinetic morphing mark is gone from the live site.
- **MIT Media Lab 2011 generator**, **Oi** (onformative × Wolff Olins), **Amsteldok**
  (`amsteldok.com` does not resolve), **Seagate Living Logo** — all documentation only now.
- **Casa da Música** and **Whitney** never had browser versions; the Whitney recreation at
  `generativ.design` is a third-party p5.js study, not official.
- `moma.org`, `codepen.io`, `surma.dev`, `christophercarlson.com` and `inconvergent.net` are
  live but return 403 to scripted fetches — open them in a browser, do not automate.
