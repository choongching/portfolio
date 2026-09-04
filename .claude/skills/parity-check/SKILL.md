---
name: parity-check
description: Prove a recreation matches its reference site, and prove a change didn't move anything it shouldn't. Geometry diffing block-by-block against the live origin, viewport-independent selector-set equivalence, and baseline signatures that make risky refactors safe. Use when the user asks "does this match the original", "is it faithful", "did I break the desktop", before shipping a replication branch, or when touching shared CSS/JS that another composition also uses.
---

# parity-check

Two different questions, two different techniques. Don't conflate them:

- **Fidelity** — does our build match the reference? (compare against the origin)
- **Regression** — did this change move something it shouldn't? (compare against ourselves, before/after)

Both are cheap, both are objective, and both work even when you cannot see the page.

## Before anything: are you comparing comparable documents?

Rule-level comparison — tokens, breakpoints, selector matches — is **only valid if both sides share a DOM**. Server-rendered sites may ship different markup per device (see `site-spike` step 1). Confirm the structures correspond before trusting any rule diff, or you will verify carefully and conclude wrongly.

## Fidelity has an expiry date on `designbycc-landing/`

The study is no longer trying to match `smlxl.company`. It is being converted, card by card, to CC's own media and copy (`swap-study-media`), so **a geometry or content mismatch against the origin is increasingly the intended result, not a defect.**

Check the divergence register before reporting any slider finding as a failure:

| Card | Diverged | Origin | Ours |
|---|---|---|---|
| #3 (was `SPATIAL`) | 2026-08-23 | `--aspect-ratio: 56.25%`, title "Moving into an immersive identity", href → `/project/spatial-2025/` | `66.58%` (native 1622×1080), `RUN` / "Configuring agents that do the research for you", no href — card inert |
| ADG-FAD Laus NEWS card | 2026-08-23 | `Laus-post_LinkedIn_1-1.gif`, NEWS eyebrow + h5/h4/h6/date copy, href → adg-fad.org | live Lissajous "CC" SVG (`lissajous-c.js`), **no copy at all** — card inner holds only the media panel; no href — card inert. `<img>` count in `main` drops by 1 per tree |
| PIPELINE card (ordinal 3) | 2026-09-04 | **does not exist** — first *added* card, a new divergence category: slide counts are origin+1 per tree (desktop 33 → 34 incl. spacer, mobile 32 → 33, by `querySelectorAll` on the exact slide class) | landscape live-SVG `pipeline-bottleneck.js`, `--item-width: 1339px`, ratio `66.58%` (RUN-card dimensions, SVG centred in the panel), no copy at all (media panel only), no href — card inert |

Keep this table current as cards convert; `docs/devlog.md` is the long-form record.

Practical consequences for a fidelity run:

- **Scope fidelity diffs to unconverted cards.** A converted card's ratio, poster, title, and link are all expected to differ.
- **Card link counts drift downward.** Making a card inert removes it from `.js-c-slider a[href]`, so selector-set equivalence against the origin will show one fewer match per inert card. Expected.
- **Regression diffing is unaffected** and becomes the more useful of the two techniques here — comparing the study against *itself* before/after still catches real breakage, and does not care that the origin has moved away.

When every card has converted, fidelity against `smlxl.company` stops being meaningful for this composition; only the engine math and transition timing remain worth comparing.

## Fidelity: block-by-block geometry diff

Serve our build and open the reference in a second tab at the same viewport width. Run the *same* measurement in both, then diff strings — not eyeballs.

```js
// run in each tab; ours and theirs must use matching selectors
const els = [...document.querySelectorAll('.ps-component')];   // or '.o-col'
JSON.stringify(els.map(e => {
  const r = e.getBoundingClientRect();
  return Math.round(r.left) + ',' + Math.round(r.width);
}))
```

Paste the reference's array into the second eval and report only mismatches:

```js
const origin = [/* pasted */];
origin.map((o, i) => o === mine[i] ? null : `${i+1} origin=${o} ours=${mine[i]}`).filter(Boolean)
```

A two-entry mismatch list is a finding, not a failure — this is how `--push-r` (a right-inset class present on 2 of 46 blocks) was caught after everything else already matched.

## Fidelity: selector-set equivalence (works at any viewport)

When you cannot reach the target viewport — occluded window, no device emulation — you can still prove responsive rules are equivalent. Media queries gate *when* a rule applies; the selector decides *what* it applies to. Compare the **matched sets** instead of pixels:

```js
const all = [...document.querySelectorAll('.ps-component')];   // ours: '.o-col'
const f = s => [...document.querySelectorAll(s)].map(e => all.indexOf(e) + 1).sort((a,b) => a-b);
JSON.stringify({
  image:   f('.ps-component:not(.c-image, .c-video) + .c-image'),
  video:   f('.ps-component:not(.c-video, .c-image) + .c-video'),
  content: f('.ps-component:not(.c-content) + .c-content'),
})
```

Identical index sets on both sites ⇒ the rules will hit the same blocks when the query activates. Viewport-independent, and it caught three missing mobile spacing rules without ever rendering at 412px.

Pair it with a token diff at the breakpoints themselves:

```js
['--total-columns','--grid-gutter','--container-padding','--border-radius']
  .map(k => k + '=' + getComputedStyle(document.documentElement).getPropertyValue(k))
```

## Regression: baseline signatures

Before touching shared code, capture a compact signature of what must not move. After every subsequent change, assert it.

```js
// capture once, keep the literal in your notes
const sig = [...document.querySelectorAll('.js-c-slider__slide')].slice(0, 6)
  .map(s => { const r = s.getBoundingClientRect();
              return [Math.round(r.left), Math.round(r.width), Math.round(r.height)].join(','); });
// assert thereafter
JSON.stringify(sig) === JSON.stringify(["1517,0,0","1522,540,204", /* … */])
```

Six elements is plenty; add one scalar that would catch a global shift (track width, `body` overflow, a container's `position`). This is what made it safe to land eight commits across shared `main.js`/`styles.css` while another composition depended on them.

**Serve both versions at once** — old build on one port, branch on another — so a suspicious result can be checked against the unmodified original in seconds.

## Always run the control before blaming your change

When a measurement looks wrong, reproduce the *exact* sequence against the unmodified build before diagnosing. A post-transition slider geometry that looked like a serious regression turned out to be byte-identical on the untouched version — pre-existing, and not this branch's problem. Without the control that would have been hours chasing a non-bug.

## Reporting

State plainly which of these you ran and what remains unverified. "44 of 46 blocks match to the pixel at 1512px; mobile verified by selector-set equivalence only, never rendered" is a useful, honest report. "Matches the original" is not.
