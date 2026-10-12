---
name: drive-headless
description: Drive a local page in headless Chrome with real mouse, wheel, touch and key input, take screenshots, time frames and measure main-thread cost, plus a no-cache local server. Use to verify landing-study work (hover effects, slider moves, page transitions, phone layouts) before showing CC, when the Chrome extension times out or its window is hidden, to emulate an iPhone/iPad, or to check that a change doesn't add browser cost.
---

# drive-headless

Two tools, kept in the repo because the session scratchpad gets wiped (the first versions were
lost that way on 2026-10-12):

| File | What |
|---|---|
| `serve.py` | Static server for the repo root with `Cache-Control: no-store`. Prints the localhost and phone (LAN) URLs. |
| `drive.mjs` | Runs a JSON list of steps in headless Chrome over CDP and prints results. |
| `example-steps.json` | Load the landing page, scroll to the LinkedIn spiral, hover it, time frames, check it halts. |

## Why headless first

- **rAF runs at full rate.** A hidden or occluded real Chrome window freezes rAF, GSAP and video
  (see `verify-motion`); headless never does.
- **Input is real.** `Input.dispatch*` events go through hit-testing, so `:hover`,
  `pointerenter`, the `(hover: hover) and (pointer: fine)` gate, wheel-driven sliders and touch
  behave like a person using the page. Synthetic `new WheelEvent()` in page JS does not.
- **Phones are real enough.** `--device iphone` sets an iPhone user agent, 390×844 at 3×, touch
  and no fine pointer. The UA matters: servers can send phones a different page (SMLXL does;
  see `site-spike`).
- The Chrome extension timed out repeatedly on 2026-10-11; headless never did.

Use the real Chrome (extension) only to see what CC sees in their own tab, e.g. "the page went
blank" reports.

## Run it

```bash
python3 .claude/skills/drive-headless/serve.py 8081 &      # from the repo root, in the background
node .claude/skills/drive-headless/drive.mjs steps.json --out <dir> [--size 1505x880] [--dpr 1] \
     [--device iphone|ipad] [--base http://localhost:8081/] [--throttle slow4g]
```

Write step files and screenshots to the session scratchpad, not the repo. Output: one
`[label] value` line per eval / frames / metrics step, then `errors: [...]` (uncaught exceptions
plus `console.error`). Exit code 1 on any error or failed step. **Look at the screenshots**:
numbers can't see a blank page.

## Steps

The step list is in the header of `drive.mjs`. Targets are `[x, y]` or a CSS selector (its
centre). The ones that do the most work:

- `{ "until": "<expr>", "wheel": [750, 440], "dy": 100 }`: wheel the slider until a card is where
  you want it, e.g. `r.x + r.width / 2 < 800`. Card positions change while the slider eases in,
  so don't hard-code them.
- `{ "move": "<selector>" }` then `{ "frames": "label" }`: hover, then frame time median/p95.
  16.7 ms = 60 fps.
- `{ "metrics": "label", "ms": 4000 }`: main-thread ms per second (busy, script, layout, style).

## Recipes

**Does a change add browser cost?** Compare against a clean copy of `main`, never against memory:

```bash
git worktree add --detach <scratchpad>/base-main origin/main
(cd <scratchpad>/base-main && python3 <repo>/.claude/skills/drive-headless/serve.py 8084 &)
node drive.mjs cost.json --base http://localhost:8084/   # main
node drive.mjs cost.json --base http://localhost:8081/   # the change
git worktree remove --force <scratchpad>/base-main       # kill the 8084 server too
```

Run each side twice: the numbers vary by about ±10 ms/s. Measure idle (card in view, mouse
elsewhere), during the interaction, and after it. Found this way on 2026-10-12: a CSS-animated
SVG `<g>` re-lays out its text every frame, so the LinkedIn disc moved into its own `<svg>`,
rotated as a composited layer.

**Phone load on a slow network:** `--device iphone --throttle slow4g` (150 ms RTT, 1.6 Mbps,
4x CPU). Read FCP/LCP with a buffered `PerformanceObserver` in an eval step after ~12 s. On
2026-10-12 this showed the live hero video was the phone LCP element (6.9 s → 2.6 s once it
stopped autoplay-downloading at load).

**Clean baseline for `check-slider.mjs --save`:** take it from the same clean `main` worktree.
A baseline taken from a dirty checkout made every later compare report false MOVED cards.

**Frame-rate traps already hit:**
- Hit-testing moving SVG text under the cursor cost ~300 ms a frame. Give decorative SVGs
  `pointer-events: none` and let the card link take the hover.
- Re-rasterising hundreds of SVG `<text>` glyphs at a new size each frame ran at ~3 fps. Draw
  them once to a bitmap and transform that.
