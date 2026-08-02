---
name: verify-css
description: Diagnose a CSS / Tailwind change that "isn't visible" by checking computed style and cascade BEFORE iterating on values. Use when the user says "no change", "still the same", "doesn't look different", "the [property] didn't update" after a class or token edit — or proactively after editing Tailwind classes on typography, spacing, shadows, or gradients (the bundled-utility traps in reference_tailwind_gotchas.md). Encodes the rules in feedback_css_debugging.md and feedback_verify_edit_target.md so a known failure mode doesn't repeat.
---

# verify-css

A process-discipline skill. The rule: **do not bump a value a second time without diagnosing first.** Two failed increments without a `getComputedStyle` check is a process failure, not a tuning failure.

## When to run

- User reports a non-effect after a CSS / Tailwind edit ("still the same", "no change", "didn't update").
- I've just edited a `text-*`, `leading-*`, `space-*`, `divide-*`, `shadow-*`, or `bg-gradient-*` class — these silently set multiple properties (see `reference_tailwind_gotchas.md`) and are the classic cascade traps on this project.
- About to make a *second* edit to the same property in the same file. Stop and run this skill first.

## Step 1 — Confirm the edit target (do not skip)

Before touching the cascade, confirm which file the user is actually looking at. This is `feedback_verify_edit_target.md` in action.

- If the user attached a screenshot: **Read the screenshot first.** URL bar, page chrome, or layout is the ground truth.
- Identify the route: `/` (React, components under `src/`) vs `/resume` (static, `public/resume.html`) vs `/styleguide` (`src/pages/Styleguide.tsx`).
- Confirm the file I edited maps to the route shown. If recent conversation context biased me toward a file I touched earlier, treat that pull as a warning, not a default.

Only proceed past this step when the edit target is confirmed. If wrong, switch files before doing anything else.

## Step 2 — Ground-truth check via computed style

Make sure the dev server is running on `http://localhost:8080` (Vite, port set in `vite.config.ts`). If not, start it:

```bash
pnpm dev
```

Then hand the user this snippet to paste in the browser DevTools console, customized for the element + property in question:

```js
// Replace the selector and property with what you actually edited.
const el = document.querySelector('SELECTOR_HERE');
const cs = getComputedStyle(el);
console.log({
  fontSize: cs.fontSize,
  lineHeight: cs.lineHeight,
  marginTop: cs.marginTop,
  marginBottom: cs.marginBottom,
  // add the specific property you edited
});
```

Ask the user to paste the output back. The computed value is the truth — what's in the className attribute is not.

**If the computed value matches your intent** → the change is applied; the visual mismatch is something else (wrong target, viewport, dark/light mode, animation in progress). Re-evaluate.

**If the computed value does NOT match your intent** → cascade is fighting you. Go to Step 3.

## Step 3 — Find what's winning the cascade

Likely causes, in order of frequency on this project:

1. **Bundled Tailwind utility ate the override.** Cross-check the element's class list against the cheatsheet in `reference_tailwind_gotchas.md`:
   - `text-{size}` bundles `font-size` + `line-height`. `leading-*` will tie on specificity and the later rule in compiled CSS wins. **Fix: switch to arbitrary `text-[XXpx]` + `leading-[Y]` on headings.**
   - `space-y-*` / `divide-y-*` set margins/borders on children. Conflicts with explicit child margins.
   - `shadow-*` is a full multi-layer `box-shadow`. Can't override one layer.
   - `bg-gradient-*` is a full `background-image` chain.

2. **Tailwind JIT didn't generate the class.** Arbitrary values (`text-[27px]`) always generate; named utilities sometimes don't if the scan missed the file. Confirm with:

   ```bash
   curl -s http://localhost:8080/src/index.css | grep -F 'CLASSNAME_HERE'
   ```

   No output = the rule was never built. Restart dev server.

3. **Another class on the same element sets the same property.** Two single-class selectors tie on specificity; the later one in compiled CSS wins. Walk the element's full class list and look for siblings setting the same property.

## Step 4 — Test typography changes on `/styleguide` first

If the edit is to a typography token (font-size, line-height, weight, tracking), go to `http://localhost:8080/styleguide` before touching the consuming component. The styleguide renders every token with its class string and computed specs side-by-side — it's the canonical testbed.

Order:
1. Edit the token in `docs/asset-guidelines.md` and in the Styleguide token array.
2. Verify on `/styleguide` that the rendered value matches expectation (re-run Step 2 if not).
3. Only then update the consuming component (`Hero.tsx`, etc.).

If the styleguide row doesn't match what you expect, the cascade is fighting you — diagnose before propagating anywhere else.

## Report format

```
verify-css

Target: <file:line> on route <route>  ← Step 1 confirmation
Intent: <property> = <expected value>
Computed: <property> = <actual value>
Verdict: ✅ applied / ❌ cascade conflict / ❌ not generated / ❌ wrong target

If ❌:
  Cause: <which of the three Step-3 causes>
  Fix: <specific edit, e.g. "swap text-4xl for text-[36px] leading-[1.1]">
```

## What this skill does NOT do

- It does NOT iterate on the value. The whole point is to **stop iterating** until the diagnosis is in.
- It does NOT auto-restart the dev server or apply fixes silently. Surface the cause; let the user (or the next edit) act on it.
- It does NOT cover responsive bugs (wrong breakpoint, viewport-specific layout). Those are a `/responsive-check` concern.
