# Preloader spike: noth.in

Spike date: 2026-10-08. Reference: https://www.noth.in/ (Nothin', creative studio, Paris).
Goal: understand why their preloader feels fun and "alive", as input for throwaway preloader
prototypes for the landing study (`designbycc-landing/`). Explore mode: no implementation yet.
Source read from their production bundle (`nothinv1.netlify.app/main.js`, reference only;
nothing copied). Frames captured in headless Chrome at 1440×900.

## Stack (role on this page)

| Library | Role |
|---|---|
| Webflow | markup + CSS (loader DOM is authored in Webflow) |
| GSAP | every loader tween (`power4.inOut` almost everywhere, `back.out` for pops) |
| taxi.js | page transitions; the loader reruns its reset on `NAVIGATE_END` |
| Lenis | smooth scroll, **stopped** while the loader plays, started on `loader:hero-revealed` |
| Three.js | elsewhere on the page, not the loader |

## What you see (≈5s show + ≈2.5s exit)

```
N’   →   N [ object ] ’   →   objects swap, slow → fast → slow   →   N’   →   curtain lifts, NOTHIN’ rises
          counter 100 → 000 bottom-centre
```

Black full-screen layer. The brand mark is split: the **N** on the left, the **apostrophe** on
the right, and between them a box that holds a stack of 12 photographed "inflatable / foil"
objects (bubble-wrap heart, blue foil star, black asterisk balloon, foil smiley, candy wrapper,
pink cream, plastic bag, balloon dog, silver pom-pom, deflated balloon, blue cube, mauve ring
float; the ring is the "eye" in CC's screenshot). The objects flick through like a flipbook
inside the logo. A three-digit counter counts **down** from 100 to 000 at the bottom.

## Mechanics (from source, exact numbers)

**Layout.** `.loader`: fixed, inset 0, z 1001, black, `100svh`. `.loader-anim` is a flex row:
`N` svg (6.25rem wide) · `.loader-img-w` box (starts **1rem** wide, 20rem tall, `margin-top:-25%`)
· apostrophe svg (2.56rem). Each object is an absolutely positioned `<img object-fit:contain>`
at opacity 0, with **per-object size/offset/rotation tweaks** (heart `scale(1.2)`, star
`scale(1.3)`, candy `rotate(120deg)`) so each one sits optically centred. Mobile halves every
size (10rem box, 3rem N).

**Sequence.**
1. **Mark in** (1.0s, power4.inOut): the N rises from a mask (`yPercent 100 → 0`, opacity 0 → 1)
   while the apostrophe scales 0 → 1.
2. **Logo opens** (1.2s, power4.inOut): the image box widens `1rem → 20rem` (10rem mobile),
   pushing N and apostrophe apart. *The logo makes room for the content.*
3. **First object pops** (0.8s, delay 0.5, `back.out(0.9)`): scale 0 → 1 with a 15° rotate.
4. **Flipbook** (5s window, `ef = 5000`): every tick hides the current object and pops the next
   (`opacity 0 → 1`, `scale 0.8 → 1`, 0.32s, `back.out(1.2)`: a small overshoot each swap).
   The tick interval is **eased by a sine**:
   `interval(t) = 100 + 400 · (1 − sin(π · t / 5000))` ms
   → 500ms at the start, accelerating to 100ms at 2.5s, decelerating back to 500ms at 5s. That
   speed-up/slow-down rhythm is most of the "alive" feeling: it breathes rather than ticks.
5. **Counter** (starts with the flipbook): `100 → 0`, zero-padded to 3 digits, over
   `5000/750 ≈ 6.67s`, power2.inOut. It counts down, not up, and is slower than the flipbook,
   so it's still settling (001, 000) as the objects stop.
6. **Exit** (when 5s are up):
   - the last object scales to 0 (0.6s, delay 0.5, power4.inOut);
   - the box closes back to 1rem (0.8s, delay 0.6), N and apostrophe snap back together: `N’`;
   - counter fades (0.5s);
   - the black layer's **height animates to 0** (1.8s, power4.inOut): a curtain lifting, top
     edge fixed, revealing the white page beneath;
   - simultaneously the hero wordmark's letters rise from `yPercent 120` in **random order**
     (stagger 0.07, 1.8s, power4.inOut) and its apostrophe pops (`back.out(0.9)`, delay 1.5).
   The loader's N slides down and its apostrophe scales out as the hero's take over, so the
   small mark hands off to the big one.
7. **Once per session**: `sessionStorage['nothin:loader-played']`; an inline head script hides
   the loader before first paint on repeat visits, and the hero reveal runs immediately.

**It is not a progress bar.** The show runs on a fixed 5s clock regardless of what's loaded; the
counter is theatre. Images are `loading="lazy"` inside an opacity-0 layer. Real loading is
handled separately (`vx()`: waits for images, video metadata and `document.fonts.ready`, only to
refresh ScrollTrigger).

## Why it feels fun and alive

1. **The logo is the stage.** The content appears *inside* the brand mark (N … ’), so the
   loader is branding, not a waiting state.
2. **Variable rhythm.** Sine-eased swap interval: slow, fast, slow. Constant-rate flipping would
   read as a slideshow.
3. **Overshoot on every swap.** `back.out` pops make each object land with a tiny bounce.
4. **Tactile, odd objects.** Shiny, squishy, photographed things (not icons): personality.
5. **Two clocks out of sync.** The counter runs longer than the flipbook, so motion overlaps.
6. **Continuity into the page.** The mark closes, the curtain lifts and the hero wordmark rises
   letter by letter from where the loader was. No cut.

## Our current loader, for contrast

`.b-loader` in `designbycc-landing/index.html`: SMLXL's spinner over everything until images
load, raced against `IMAGE_TIMEOUT = 4000` (#45), then removed instantly (`loader.remove()` in
`main.js`). No branding, no handoff into the slider's intro.

## Directions worth prototyping (throwaway, for CC to react to)

Ideas only; none of these use their objects, code or copy.

- **A. "designby[ ]cc" flipbook.** Split our wordmark: the box opens between `designby` and `cc`
  and flips through CC's own work (Trustana montage frames, the Penang photo, the CC Lissajous,
  the LinkedIn spiral disc) on a sine-eased rhythm, then closes and hands off to the header logo.
- **B. Lissajous loader.** The live "CC" Lissajous card as the loader: the curve draws itself,
  its frequency ratio steps through a few figures, then it settles into "CC" and shrinks into
  the logo position.
- **C. Clock hands.** The Penang clock hands spin (the #57 spin) and land on the real local
  time as the slider staggers in.
- **D. Counter as type.** A large mono count (Geist Mono) that finishes and turns into the intro
  card's "Hello!".

Open questions for CC: once per session like noth.in, or every load? Fixed-length show (theirs
≈7.5s total) or tied to real loading (ours today: ≤4s)?
