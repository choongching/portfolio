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
