---
name: verify-motion
description: Verify GSAP/rAF-driven animation and custom scroll/drag engines via browser automation, working around occluded-window throttling. Use when verifying intro sequences, sliders, scroll-jacked pages, or any animation work in Chrome — especially when tweens appear "frozen", evals time out with "renderer frozen", videos won't play, or synthetic drags silently do nothing.
---

# verify-motion

Browser automation on macOS usually runs against an **occluded** Chrome window. That changes what you can and cannot observe — most "bugs" seen through screenshots are actually throttling artifacts.

## 0. Check the loop before you trust — or build — anything

```js
({innerWidth, outerWidth, hidden: document.hidden, vis: document.visibilityState})
```

`outerWidth: 0` / `visibilityState: "hidden"` means you are flying blind on everything visual. **Say so out loud, up front**, and decide deliberately: get the loop fixed, or scope work to what is genuinely verifiable.

Note the session's tabs can be in a **different window** from the one the user is looking at — the user foregrounding their own Chrome does not un-hide yours. To hand you a working loop they must open the page in a tab *this session* can see (`tabs_context_mcp` lists them).

The failure this prevents: geometry checks confirm layout maths but **cannot detect a blank page**. Building a visual feature against computed values alone means every wrong assumption compounds silently until a human looks. If the loop is broken and the work is visual, ask for the **Console** early — one console error beats several rounds of Elements-panel screenshots.

## The throttling model

When the window is hidden/occluded: `requestAnimationFrame` stops → GSAP tweens freeze mid-flight, momentum loops stall, videos pause. Meanwhile `setTimeout` still fires and screenshots still render on demand. Consequences:

- A 45s CDP timeout ("renderer may be frozen") usually means your eval **awaited rAF** — it's not a real freeze. It can *also* mean a genuinely heavy first layout (40+ blocks with media): split the eval into small batches and cache node lists on `window` between calls.
- A tween stuck at its start pose is not broken; the ticker is paused.
- `videoPlaying: false` with `readyState: 4` is normal in background — nudge-to-play loops succeed once visible.

**More than rAF is suspended — these are silent, and each looks exactly like a bug in your code:**

| Suspended | Looks like | Prove it's the environment |
|---|---|---|
| **IntersectionObserver delivery** | lazy-load / scroll-triggered code "never fires" | build a fresh probe observer on the same target; if it also never fires, it's the window |
| **Media loading** | `video.src = …; load()` sits at `readyState 0` with `error: null` forever | `curl -r 0-1000` the URL — a 206 proves the source is fine |
| **`resize_window`** | reports success, `innerWidth` unchanged | assert `innerWidth` after; `outerWidth: 0` confirms occlusion |

Consequence: **responsive and lazy-load behaviour cannot be verified at all** in this state. Don't report them as working; report them as unverified and name why.

## Verification recipes

**End states, deterministically:**
```js
gsap.globalTimeline.progress(1)  // exactly 1 — 0.999 skips onComplete,
                                 // where listeners often attach
```
Then read `getComputedStyle(...).transform` / opacity to assert final poses.

**Timing structure without watching it:**
```js
gsap.globalTimeline.getChildren(false, true, false)
  .map(t => ({target: t.targets()[0], delay: t.delay(), dur: t.duration()}))
```
Compare delays/durations/overlaps against spec — overlap (what lands together) is the sync that matters.

**Driving a custom scroll/drag engine:** dispatch clamped synthetic input, never teleport:
```js
for (let i = 0; i < N; i++) {
  window.dispatchEvent(new WheelEvent('wheel', {deltaY: 65}));
  await new Promise(r => setTimeout(r, 8));   // setTimeout, NOT rAF
}
```
Engines with per-event clamps + iterative convergence passes break visually if you jump `scrollLeft` by thousands of px in one event — that's a test artifact, not a bug.

## Chrome quirks to remember

- **No `scroll` event fires for programmatic `scrollLeft` on `overflow: hidden`** containers. Engines must sync explicitly after each write, not via the scroll listener.
- `resize_window` can silently not apply (macOS minimums / window state) — assert `window.innerWidth` afterwards before trusting a responsive test.
- Synthetic `left_click_drag` is flaky for continuous drag engines; prefer wheel bursts for progress, and leave drag-feel to the human.
- If measured state changes between your evals with no input from you, the **user is interacting live** — re-baseline before diagnosing.

## Don't let a throw hide the page

If a full-viewport cover (loader, splash, overlay) is removed *after* layout runs, any exception in that layout leaves the cover up — a blank page with no visible cause, no error surfaced, nothing in a screenshot to diagnose. Wrap the layout call and log:

```js
try { engine.measure(); engine.layout(); }
catch (err) { console.error("[slider] layout failed", err); }
```

Order the cover's removal so it cannot be skipped, and check the Console before theorising from screenshots. A blank page plus a full-screen cover is the single most misleading state to debug through automation.

## What still needs human eyes

Report these as explicitly unverified and hand them to the user: animation *feel* (pacing, easing character), drag momentum, hover micro-interactions, real mobile behavior, and anything gated on IntersectionObserver or media load while the window is hidden.
