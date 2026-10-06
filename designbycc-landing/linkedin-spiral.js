/* linkedin-spiral — CC's "connect on LinkedIn" card.
   Re-draws the origin's Instagram sticker as live SVG: a speech bubble,
   an ink disc with CC's intro set on an Archimedean spiral, and an
   orange arrow button (the CC mark's accent). The spiral text auto-fits
   its path once fonts load, so copy edits never need geometry tweaks.
   The disc turns slowly (CSS); hovering the card lifts the bubble and
   turns the arrow. prefers-reduced-motion: static, nothing bound.
   Mounted once per `.js-a-spiral` container (both slider trees). */

(function () {
  const NS = "http://www.w3.org/2000/svg";
  const W = 600;
  const H = 678; // the card's 113% ratio box
  const BUBBLE_TEXT = "Connect with me on LinkedIn";
  const SPIRAL_TEXT =
    "I'm CC Teo. 12 years in product design, 7 of them taking enterprise AI products from zero to one. " +
    "Right now I'm at Trustana, building an AI platform that enriches product data for retailers at scale.";

  const DISC = { cx: 311, cy: 391, r: 274 };
  // Clockwise inward from about 1 o'clock: r(θ) = R0 − B·θ.
  const SPIRAL = { r0: 238, r1: 40, turns: 3.6, start: -Math.PI / 3, samples: 900 };
  const BUTTON = { cx: 514, cy: 584, r: 62, ring: 10 };

  let uid = 0;

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function spiralPath() {
    const { r0, r1, turns, start, samples } = SPIRAL;
    const span = turns * 2 * Math.PI;
    const b = (r0 - r1) / span;
    let d = "";
    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * span;
      const r = r0 - b * t;
      const x = DISC.cx + r * Math.cos(start + t);
      const y = DISC.cy + r * Math.sin(start + t);
      d += (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
    }
    return d;
  }

  function mount(container) {
    const id = "a-spiral-path-" + uid++;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" }, container);

    // Disc + spiral text rotate together around the disc centre.
    const disc = el("g", { class: "a-spiral__disc" }, svg);
    disc.style.transformOrigin = `${DISC.cx}px ${DISC.cy}px`;
    el("circle", { cx: DISC.cx, cy: DISC.cy, r: DISC.r, class: "a-spiral__fill" }, disc);
    el("path", { id, d: spiralPath(), fill: "none" }, disc);
    const text = el("text", { class: "a-spiral__text" }, disc);
    const tp = el("textPath", { href: "#" + id }, text);
    tp.textContent = SPIRAL_TEXT;

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

    let fitted = false;
    function fit() {
      // Text can only be measured while its slider tree is displayed; the
      // hidden tree retries on resize (e.g. rotating across the breakpoint).
      if (fitted || container.offsetParent === null) return;
      fitted = true;
      // Bubble hugs its label.
      const lw = label.getComputedTextLength();
      const pw = lw + 72;
      pill.setAttribute("width", pw.toFixed(1));
      label.setAttribute("x", (30 + pw / 2).toFixed(1));
      // Spiral text fills ~98% of the path.
      const path = svg.querySelector("#" + id);
      const size = parseFloat(getComputedStyle(text).fontSize);
      const tl = text.getComputedTextLength();
      if (tl > 0) text.style.fontSize = ((size * path.getTotalLength() * 0.98) / tl).toFixed(2) + "px";
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
    window.addEventListener("resize", fit);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".js-a-spiral").forEach(mount);
  });
})();
