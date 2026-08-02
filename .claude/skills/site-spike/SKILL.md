---
name: site-spike
description: Reverse-engineer a live site's interactions, animations, and design tokens before recreating them — bundle fingerprinting, module extraction, token pull, live browser observation, and a mechanics report. Use when the user says "spike this site", "how did they build this", "recreate this page/interaction", or shares a URL asking to study or replicate its motion/UX. Research first, code second: do not start implementing until the mechanics report exists.
---

# site-spike

Turn "recreate this site" into a deterministic research pass. The output is a **mechanics report** (stack, DOM structure, interaction math, tokens, sequencing), not code. Implementation is a separate, later step.

## 1. Static fingerprint (curl, no browser yet)

```bash
curl -sL <url> -o /tmp/spike.html
grep -oE '<script[^>]*src="[^"]*"' /tmp/spike.html   # bundles
grep -oE "href='[^']*\.css[^']*'" /tmp/spike.html    # stylesheets (check both quote styles)
```

**Fetch it again with a mobile user-agent, before assuming anything is responsive CSS.**

```bash
curl -sL -A "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" <url> -o /tmp/spike-mobile.html
grep -oE 'class="[a-z0-9_ -]+' /tmp/spike.html        | sort -u > /tmp/d.txt
grep -oE 'class="[a-z0-9_ -]+' /tmp/spike-mobile.html | sort -u > /tmp/m.txt
diff /tmp/d.txt /tmp/m.txt
```

Server-rendered sites — WordPress especially, via `wp_is_mobile()` — may ship a **different DOM per device** rather than a restyled one: different components entirely, with cards authored natively at phone size instead of on a scaled-down desktop canvas. If the class names diverge, mobile is a second composition and has to be built as one; comparing CSS rules across the two is meaningless because the rules never meet the same elements.

Corollary for the whole spike: **an expected mechanism that is provably absent means the assumption predicting it is wrong** — not that it lives one layer deeper. If you can't find the mobile override, check whether there's a mobile document first. Skipping this cost a full build-and-revert cycle.

Download the main JS bundle and fingerprint libraries by occurrence count:

```bash
grep -oE '(gsap|ScrollTrigger|lenis|barba|swiper|three|framer|anime|lottie|SplitText|Draggable|Observer|Flip|matter-js|pixi)' bundle.js | sort | uniq -c | sort -rn
```

High counts tell you the real stack; a library can be present but only used on other pages — confirm usage per page in step 3.

## 2. Extract the source if it's there

Many production bundles ship **unminified** (webpack dev output, WordPress themes). Check for module keys:

```bash
node -e "const s=require('fs').readFileSync('bundle.js','utf8');const re=/\"([^\"]+\.(js|mjs|css|scss))\":/g;let m;while((m=re.exec(s)))console.log(m.index,m[1])"
```

If module paths appear, slice each module's byte range and unescape the `eval("...")` string wrapper — you get the author's original files. Read the actual component code instead of guessing. Save extracts to `/tmp/<site>-src/`.

For CSS: `npx prettier --parser css` the stylesheet, then pull `:root` custom properties (colors, radii, easings, container widths) and the specific component rules (look for `--item-width`-style per-variant tokens).

## 3. DOM structure

Dump the body's tag/class/data-attribute skeleton (strip svg/script noise) to see the component hierarchy and naming system. Note `data-*` hooks — they reveal the JS wiring (e.g. `data-barba`, `data-offset`).

## 4. Live observation (claude-in-chrome)

Load the page, then capture:
- the **intro sequence** (screenshot immediately, then after 1s/3s)
- each **interaction state** (drag mid-flight, scroll positions, hover)
- breakpoints if relevant

Caveats: an occluded Chrome window freezes rAF/GSAP/video — see the `verify-motion` skill for workarounds.

## 5. Mechanics report

Write up, with exact numbers from the source (durations, delays, eases, clamps, scale ranges, breakpoints):
- stack table (library → role **on this page**)
- each animation/interaction: trigger → math → applied properties
- design tokens
- sequencing diagram of the intro (what overlaps with what — overlap is usually the "feel")

Save via `/research-save` or into the plan file if planning a build.

## Guardrails (non-negotiable)

- Extracted source is **reference only** — write your own implementation from the derived mechanics. Never paste their code into the repo.
- **Fonts**: check the font's EULA before reusing (many are domain-licensed, e.g. Lineto). Find a licensed substitute (Fontshare/Google) and bundle its license file next to the woff2.
- **Media/copy**: if the result will be deployed, use own or free-stock content (verify Pexels URLs with `curl -w '%{http_code}'` — IDs 404 often). Hotlinking the original's assets is for private study only.
