/* lissajous-c — a single "C" drawn as a Lissajous curve.
   Reduced from the cursor.com/compile hero study (7 letters → 1):
   x = cx + ampX·sin(a·t + δ), y = cy + ampY·sin(b·t), with (a=2, b=1)
   picking the C. The intro untwists δ from δ−π into place; hover
   morphs δ by +0.3π over 4s (easeOutQuart), blending mid-flight.
   Mounted once per `.js-a-lissajous` container (both slider trees).
   The rAF loop idles once intro + hover transitions settle, and the
   intro clock starts only after main.js removes the loader. */

(function () {
  const CELL = 200;
  const SAMPLES = 500;

  const LETTER = {
    a: 2,
    b: 1,
    delta: Math.PI / 0.3,
    scaleX: 0.94,
    scaleY: 1.02,
    stroke: "#F76D18",
    intro: { amount: Math.PI, duration: 1.8, easing: "easeInOut" },
  };
  const HOVER = { amount: 0.3 * Math.PI, duration: 4, easing: "easeOutQuart" };

  const EASE = {
    easeInOut: (e) => (e < 0.5 ? 2 * e * e : 1 - (-2 * e + 2) ** 2 / 2),
    easeOutQuart: (e) => 1 - (1 - e) ** 4,
  };

  function lissajousPath(delta) {
    const ampX = (0.9 * CELL) / 2 * LETTER.scaleX;
    const ampY = (0.9 * CELL) / 2 * LETTER.scaleY;
    const c = CELL / 2;
    const pts = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const t = (i / SAMPLES) * Math.PI * 2;
      const x = c + ampX * Math.sin(LETTER.a * t + delta);
      const y = c + ampY * Math.sin(LETTER.b * t);
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return pts.join(" ");
  }

  function eased(spec, s) {
    const p = Math.min(1, Math.max(0, s / spec.duration));
    return EASE[spec.easing](p);
  }

  const NS = "http://www.w3.org/2000/svg";
  const instances = [];

  function mount(container) {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${CELL} ${CELL}`);
    svg.setAttribute("fill", "none");

    const path = document.createElementNS(NS, "path");
    path.setAttribute("stroke", LETTER.stroke);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "none");
    svg.append(path);
    container.append(svg);

    const inst = {
      container,
      path,
      introStart: null, // set when the loader is gone
      hovered: false,
      toggleTime: null,
      from: 0,
      cur: 0,
      lastDelta: null,
    };

    // Hover anywhere on the card, not just the media panel — the whole
    // card is the hit area (the slide's pointer-events land on the item).
    const hoverTarget = container.closest("a") || container;
    hoverTarget.addEventListener("pointerenter", () => toggleHover(inst, true));
    hoverTarget.addEventListener("pointerleave", () => toggleHover(inst, false));
    instances.push(inst);
    return inst;
  }

  function toggleHover(inst, on) {
    inst.from = inst.cur;
    inst.hovered = on;
    inst.toggleTime = performance.now() / 1000;
    wake();
  }

  /* One shared loop; parks itself when every instance has settled. */
  let running = false;

  function wake() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function frame(now) {
    const s = now / 1000;
    const loaderGone = !document.querySelector(".js-b-loader");
    let busy = !loaderGone; // keep polling until the intro can start

    instances.forEach((inst) => {
      if (loaderGone && inst.introStart === null) inst.introStart = s;

      let phaseOff = 0;
      if (inst.introStart === null) {
        phaseOff -= LETTER.intro.amount; // pre-intro rest state
      } else {
        const e = eased(LETTER.intro, s - inst.introStart);
        phaseOff += (e - 1) * LETTER.intro.amount;
        if (e < 1) busy = true;
      }

      if (inst.toggleTime !== null) {
        const e = eased(HOVER, s - inst.toggleTime);
        inst.cur = inst.from + ((inst.hovered ? 1 : 0) - inst.from) * e;
        if (e < 1) busy = true;
      }
      phaseOff += inst.cur * HOVER.amount;

      // Skip DOM writes for the hidden tree and for unchanged frames.
      const delta = LETTER.delta + phaseOff;
      if (delta === inst.lastDelta || inst.container.offsetParent === null) return;
      inst.lastDelta = delta;
      inst.path.setAttribute("d", lissajousPath(delta));
    });

    if (busy) requestAnimationFrame(frame);
    else running = false;
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".js-a-lissajous").forEach(mount);
    if (instances.length) wake();
  });
})();
