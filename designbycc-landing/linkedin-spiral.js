/* linkedin-spiral — CC's "connect on LinkedIn" card.
   Re-draws the origin's Instagram sticker as live SVG: a speech bubble,
   an ink disc with keywords from CC's resume set on a spiral, and an orange arrow button
   (the CC mark's accent). The disc turns slowly (CSS); hovering the card
   lifts the bubble and turns the arrow.

   Hover motion (mouse only): the keyword list repeats along the spiral and
   streams into the dead centre, endlessly; mouse out or window blur halts
   it in place. Nothing runs while idle (rAF only while moving).
   prefers-reduced-motion: static, nothing bound.
   Mounted once per `.js-a-spiral` container (both slider trees). */

(function () {
  const NS = "http://www.w3.org/2000/svg";
  const W = 600;
  const H = 678; // the card's 113% ratio box
  const BUBBLE_TEXT = "Connect with me on LinkedIn";
  // Keywords from CC's resume (designby.cc/resume), looping like a ticker.
  const KEYWORDS = [
    "Lead Product Designer", "B2B AI Products", "0-to-1 Builder", "AI Product Design",
    "Enterprise Workflows", "Design Systems", "AI Data Enrichment", "Bulk Data Workflows",
    "Claude Code", "Figma", "User Research",
  ];
  const SEP = " \u00b7 ";
  const SPIRAL_TEXT = KEYWORDS.join(SEP);
  const GAP = SEP; // between repeats, so the loop reads as one endless list

  const DISC = { cx: 311, cy: 391, r: 274 };
  // Clockwise inward from about 1 o'clock: r(θ) = R0 − B·θ.
  const SPIRAL = { r0: 238, r1: 40, turns: 3.6, start: -Math.PI / 3, samples: 900 };
  const BUTTON = { cx: 514, cy: 584, r: 62, ring: 10 };

  const SPEED = 130; // path px/s on hover; data-speed overrides (lab tuning)
  const RAMP = 0.4; // s, time constant of speeding up
  const HALT = 0.18; // s, time constant of braking on mouse out / window blur

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let uid = 0;

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  /* Archimedean spiral, extended past both ends so streaming text can
     enter from beyond the rim and run into the centre. Returns the path
     and the arc lengths where the resting section starts and ends, plus
     the points (with their arc length) for drawing sub-paths. */
  function flowPath() {
    const { r0, r1, turns, start, samples } = SPIRAL;
    const span = turns * 2 * Math.PI;
    const b = (r0 - r1) / span;
    const tOut = -(DISC.r + 30 - r0) / b;
    const tIn = span + (r1 - 2) / b;
    const dt = span / samples;
    let d = "", len = 0, px = 0, py = 0, restStart = 0, restEnd = 0;
    const pts = [];
    for (let t = tOut, i = 0; t <= tIn + 1e-9; t += dt, i++) {
      const r = r0 - b * t;
      const x = DISC.cx + r * Math.cos(start + t);
      const y = DISC.cy + r * Math.sin(start + t);
      if (i) len += Math.hypot(x - px, y - py);
      if (t <= 1e-9) restStart = len;
      if (t <= span + 1e-9) restEnd = len;
      d += (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
      pts.push([x, y, len]);
      px = x; py = y;
    }
    return { d, pts, restStart, restLength: restEnd - restStart, length: len, gap: 2 * Math.PI * b };
  }

  function mount(container) {
    const id = "a-spiral-" + uid++;
    // Two stacked layers with the same viewBox: the disc + text, which turns
    // slowly as one composited layer (no SVG re-layout per frame), and the
    // bubble + button on top.
    const discSvg = el("svg", { viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true", class: "a-spiral__disc" }, container);
    discSvg.style.transformOrigin = `${((DISC.cx / W) * 100).toFixed(3)}% ${((DISC.cy / H) * 100).toFixed(3)}%`;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" }, container);

    // Text fades out into the centre.
    const defs = el("defs", {}, discSvg);
    const grad = el("radialGradient", {
      id: id + "-fade", gradientUnits: "userSpaceOnUse", cx: DISC.cx, cy: DISC.cy, r: DISC.r,
    }, defs);
    const stops = [[0, 0], [0.03, 0], [0.15, 1], [1, 1]].map(([o, a]) =>
      el("stop", { offset: o, "stop-color": "#fff", "stop-opacity": a }, grad));
    const mask = el("mask", { id: id + "-mask", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H }, defs);
    el("circle", { cx: DISC.cx, cy: DISC.cy, r: DISC.r, fill: `url(#${id}-fade)` }, mask);

    const disc = el("g", {}, discSvg);
    el("circle", { cx: DISC.cx, cy: DISC.cy, r: DISC.r, class: "a-spiral__fill" }, disc);
    const field = el("g", { mask: `url(#${id}-mask)` }, disc);

    // Speech bubble: pill + two tail dots, sized to its label.
    const bubble = el("g", { class: "a-spiral__bubble" }, svg);
    const pill = el("rect", { x: 30, y: 40, height: 88, rx: 44, class: "a-spiral__paper" }, bubble);
    el("circle", { cx: 150, cy: 138, r: 26, class: "a-spiral__paper" }, bubble);
    el("circle", { cx: 186, cy: 176, r: 9, class: "a-spiral__paper" }, bubble);
    const label = el("text", { x: 30, y: 84, class: "a-spiral__label", "dominant-baseline": "central", "text-anchor": "middle" }, bubble);
    label.textContent = BUBBLE_TEXT;

    // Arrow button, ringed in the page colour so it sits "cut out" of the disc.
    const button = el("g", { class: "a-spiral__button" }, svg);
    button.style.transformOrigin = `${BUTTON.cx}px ${BUTTON.cy}px`;
    el("circle", { cx: BUTTON.cx, cy: BUTTON.cy, r: BUTTON.r + BUTTON.ring, class: "a-spiral__ring" }, button);
    el("circle", { cx: BUTTON.cx, cy: BUTTON.cy, r: BUTTON.r, class: "a-spiral__accent" }, button);
    const a = 20; // arrow half-extent: ↗
    el("path", {
      d: `M${BUTTON.cx - a} ${BUTTON.cy + a}L${BUTTON.cx + a} ${BUTTON.cy - a}M${BUTTON.cx - a * 0.6} ${BUTTON.cy - a}H${BUTTON.cx + a}V${BUTTON.cy + a * 0.6}`,
      class: "a-spiral__arrow",
    }, button);

    // Text can only be measured while its slider tree is displayed; the
    // hidden tree retries on resize (e.g. rotating across the breakpoint).
    let built = null;
    function build() {
      if (built || container.offsetParent === null) return;
      const lw = label.getComputedTextLength();
      const pw = lw + 72;
      pill.setAttribute("width", pw.toFixed(1));
      label.setAttribute("x", (30 + pw / 2).toFixed(1));
      built = buildFlow(discSvg, field, id, stops);
      if (!reduced.matches) bindHover(container, discSvg, built);
      window.removeEventListener("resize", build);
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(build);
    window.addEventListener("resize", build);
  }

  /* One sentence rests on the spiral exactly as before; copies before
     and after it (hidden at rest) stream through on hover. */
  function buildFlow(svg, field, id, stops) {
    const path = flowPath();
    el("path", { id: id + "-path", d: path.d, fill: "none" }, svg.querySelector("defs"));

    // Size the sentence to fill ~98% of the resting section.
    const probe = el("text", { class: "a-spiral__text", visibility: "hidden" }, svg);
    probe.textContent = SPIRAL_TEXT;
    const size0 = parseFloat(getComputedStyle(probe).fontSize);
    const size = (size0 * path.restLength * 0.98) / probe.getComputedTextLength();
    probe.style.fontSize = size + "px";
    probe.textContent = GAP + SPIRAL_TEXT;
    const period = probe.getComputedTextLength();
    probe.remove();

    const before = Math.ceil((path.restStart + period) / period);
    const after = Math.ceil((path.length - path.restStart) / period);
    // Band mask: the text may only show inside the resting spiral's own
    // band (one ring gap wide, so neighbouring rings tile it), so the
    // turn beyond the resting one never shows, and nothing is cut by the
    // rim. Over the quarter turn before the resting start the band fades
    // in, so streaming text arrives gradually instead of popping on.
    const defs = svg.querySelector("defs");
    const band = el("mask", { id: id + "-band", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H }, defs);
    const at = (l) => { // point at arc length l
      const p = path.pts;
      let i = 1;
      while (i < p.length - 1 && p[i][2] < l) i++;
      const [x0, y0, l0] = p[i - 1], [x1, y1, l1] = p[i];
      const u = (l - l0) / (l1 - l0 || 1);
      return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u];
    };
    const sub = (from, to) => {
      const xy = [at(from)];
      for (const [x, y, l] of path.pts) if (l > from && l < to) xy.push([x, y]);
      xy.push(at(to));
      return xy.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2)).join("");
    };
    const stroke = { fill: "none", stroke: "#fff", "stroke-width": path.gap.toFixed(2) };
    el("path", Object.assign({ d: sub(path.restStart, path.length) }, stroke), band);
    const FADE = (Math.PI / 2) * SPIRAL.r0, STEPS = 24;
    for (let i = 0; i < STEPS; i++) {
      const from = path.restStart - FADE + (FADE * i) / STEPS;
      el("path", Object.assign({ d: sub(from, from + FADE / STEPS + 0.5), "stroke-opacity": ((i + 0.5) / STEPS).toFixed(3) }, stroke), band);
    }
    const banded = el("g", { mask: `url(#${id}-band)` }, field);
    const text = el("text", { class: "a-spiral__text" }, banded);
    text.style.fontSize = size.toFixed(2) + "px";
    const tp = el("textPath", { href: `#${id}-path` }, text);
    // Separators are their own tspans, hidden at rest with the repeats, so
    // the resting list has no stray separator before its first keyword.
    for (let i = -before; i <= after; i++) {
      if (i > -before) el("tspan", { class: "a-spiral__echo" }, tp).textContent = GAP;
      el("tspan", i ? { class: "a-spiral__echo" } : {}, tp).textContent = SPIRAL_TEXT;
    }
    // Copy 0's sentence starts where the resting section starts; the
    // copies before it add up to exactly `before` periods (the first has
    // no leading GAP, copy 0 has one).
    const base = path.restStart - before * period;
    // At speed the centre fades wider, where the tight inner turns crowd;
    // at rest it clears the last word, as before.
    let fadeK = -1;
    function apply(s, k) {
      tp.setAttribute("startOffset", (base + s).toFixed(2));
      if (k === fadeK) return; // the mask only re-renders while k moves
      fadeK = k;
      stops[1].setAttribute("offset", (0.03 + 0.07 * k).toFixed(4));
      stops[2].setAttribute("offset", (0.15 + 0.08 * k).toFixed(4));
    }
    apply(0, 0);
    return { period, apply, speed: SPEED };
  }

  /* One phase s ∈ [0, period): 0 is the resting layout. Hover eases the
     phase speed up; mouse out or the window losing focus brakes it to a
     halt where it is (~0.5s). Once moved, the extra copies stay shown so
     the spiral stays full, and the next hover carries on from there. */
  function bindHover(container, svg, motion) {
    const card = container.closest("a") || container;
    let s = 0, v = 0, fade = 0, hovering = false, raf = 0, last = 0;
    const target = () => parseFloat(container.dataset.speed) || motion.speed;

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      if (hovering) {
        v += (target() - v) * (1 - Math.exp(-dt / RAMP));
        // Snapped to 1% steps and to 1 near full speed, so the centre mask
        // stops re-rendering once the stream is up to speed.
        fade = Math.max(fade, v > target() * 0.97 ? 1 : Math.round((100 * v) / target()) / 100);
      } else {
        v *= Math.exp(-dt / HALT);
        if (v < target() * 0.03) v = 0;
      }
      s += v * dt;
      if (s >= motion.period) s -= motion.period;
      motion.apply(s, fade);
      raf = hovering || v ? requestAnimationFrame(frame) : 0;
    }
    function halt() { hovering = false; }
    card.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      hovering = true;
      svg.classList.add("is-live");
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
    card.addEventListener("pointerleave", halt);
    window.addEventListener("blur", halt);
    document.addEventListener("visibilitychange", halt);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".js-a-spiral").forEach(mount);
  });
})();
