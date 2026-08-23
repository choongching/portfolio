/* lissajous-c — "CC" drawn as two Lissajous curves.
   Reduced from the cursor.com/compile hero study (7 letters → 2):
   x = cx + ampX·sin(a·t + δ), y = cy + ampY·sin(b·t), with (a=2, b=1)
   picking the C. Each letter's intro untwists δ from δ−π into place
   with a stagger; hovering anywhere on the card morphs δ by +0.3π over
   4s (easeOutQuart), blending mid-flight; a slow sinusoidal idle drift
   keeps the mark breathing forever, phase-offset per letter.
   Mounted once per `.js-a-lissajous` container (both slider trees).
   The intro clock starts only after main.js removes the loader. */

(function () {
  const CELL = 200;
  const SAMPLES = 500;
  const GAP = -110; // second C overlaps the first, as the wordmark does
  // (the flatter letter carries less ink per cell, so the cells overlap
  // further to keep the same visual interlock)

  const BASE = {
    a: 2,
    b: 1,
    delta: Math.PI / 0.3,
    scaleX: 0.55, // flattened bow — variant 3 of the curvature sheet
    scaleY: 1.02,
    stroke: "#F76D18",
  };
  const LETTERS = [
    { x: 0, intro: { amount: Math.PI, duration: 1.8, delay: 0, easing: "easeInOut" }, idlePhase: 0 },
    { x: CELL + GAP, intro: { amount: Math.PI, duration: 2, delay: 0.1, easing: "easeInOut" }, idlePhase: Math.PI },
  ];
  const TOTAL_W = CELL + CELL + GAP;

  const HOVER = { amount: 0.3 * Math.PI, duration: 4, easing: "easeOutQuart" };
  // Idle breathing: a slow sinusoidal phase drift so the card never sits
  // still — subtle enough to read as alive, not animated.
  const IDLE = { amount: 0.05 * Math.PI, period: 7 };
  // Easter egg: a click spins each letter through a full extra revolution
  // of phase (2π ≡ back to rest, so it always lands cleanly) with a
  // squash-and-stretch wobble. Direction alternates; rapid clicks stack.
  const SPIN = { amount: 2 * Math.PI, duration: 1.6, stagger: 0.08, wobble: 0.14 };

  const EASE = {
    easeInOut: (e) => (e < 0.5 ? 2 * e * e : 1 - (-2 * e + 2) ** 2 / 2),
    easeOutQuart: (e) => 1 - (1 - e) ** 4,
    easeOutCubic: (e) => 1 - (1 - e) ** 3,
  };

  function lissajousPath(delta, ampScale = 1) {
    const ampX = (0.9 * CELL) / 2 * BASE.scaleX * ampScale;
    const ampY = (0.9 * CELL) / 2 * BASE.scaleY * ampScale;
    const c = CELL / 2;
    const pts = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const t = (i / SAMPLES) * Math.PI * 2;
      const x = c + ampX * Math.sin(BASE.a * t + delta);
      const y = c + ampY * Math.sin(BASE.b * t);
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return pts.join(" ");
  }

  function eased(spec, s) {
    const p = Math.min(1, Math.max(0, (s - (spec.delay || 0)) / spec.duration));
    return EASE[spec.easing](p);
  }

  const NS = "http://www.w3.org/2000/svg";
  const instances = [];

  function mount(container) {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${TOTAL_W} ${CELL}`);
    svg.setAttribute("fill", "none");

    const paths = LETTERS.map((L) => {
      const g = document.createElementNS(NS, "g");
      g.setAttribute("transform", `translate(${L.x}, 0)`);
      const path = document.createElementNS(NS, "path");
      path.setAttribute("stroke", BASE.stroke);
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("fill", "none");
      g.append(path);
      svg.append(g);
      return path;
    });
    // First C on top where they overlap, as the origin stacks letters.
    [...svg.children].reverse().forEach((g) => svg.append(g));
    container.append(svg);

    const inst = {
      container,
      paths,
      introStart: null, // set when the loader is gone
      hovered: false,
      toggleTime: null,
      from: 0,
      cur: 0,
      spins: [], // {time, dir} per click, pruned when spent
      spinDir: 1,
      lastKeys: LETTERS.map(() => null),
    };

    // Hover anywhere on the card, not just the media panel — the whole
    // card is the hit area (the slide's pointer-events land on the item).
    const hoverTarget = container.closest("a") || container;
    hoverTarget.addEventListener("pointerenter", () => toggleHover(inst, true));
    hoverTarget.addEventListener("pointerleave", () => toggleHover(inst, false));
    hoverTarget.addEventListener("click", () => {
      inst.spins.push({ time: performance.now() / 1000, dir: inst.spinDir });
      inst.spinDir *= -1;
      wake();
    });
    instances.push(inst);
    return inst;
  }

  function toggleHover(inst, on) {
    inst.from = inst.cur;
    inst.hovered = on;
    inst.toggleTime = performance.now() / 1000;
    wake();
  }

  /* One shared loop; parks itself only while waiting on the loader. */
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

      let hover = 0;
      if (inst.toggleTime !== null) {
        const e = eased(HOVER, s - inst.toggleTime);
        inst.cur = inst.from + ((inst.hovered ? 1 : 0) - inst.from) * e;
      }
      hover = inst.cur * HOVER.amount;

      const hidden = inst.container.offsetParent === null;

      // Spent spins fall out; the longest a spin lives is duration + the
      // last letter's stagger.
      inst.spins = inst.spins.filter(
        (sp) => s - sp.time < SPIN.duration + SPIN.stagger * (LETTERS.length - 1)
      );

      LETTERS.forEach((L, i) => {
        let phaseOff = hover;
        let ampScale = 1;
        if (inst.introStart === null) {
          phaseOff -= L.intro.amount; // pre-intro rest state
        } else {
          const t = s - inst.introStart;
          const e = eased(L.intro, t);
          phaseOff += (e - 1) * L.intro.amount;
          // Breathing fades in with the intro and never stops.
          phaseOff +=
            e * IDLE.amount *
            Math.sin((t / IDLE.period) * Math.PI * 2 + L.idlePhase);
          busy = true;
        }

        // Click spins: a decaying full revolution of phase per click,
        // staggered per letter, plus a damped squash-and-stretch.
        inst.spins.forEach((sp) => {
          const t = s - sp.time - SPIN.stagger * i;
          if (t <= 0) return;
          const e = Math.min(1, t / SPIN.duration);
          phaseOff += sp.dir * SPIN.amount * EASE.easeOutCubic(e);
          ampScale += SPIN.wobble * Math.exp(-3 * t) * Math.sin(4 * Math.PI * t);
        });

        // Skip DOM writes for the hidden tree and for unchanged frames.
        const key = `${(BASE.delta + phaseOff).toFixed(5)}|${ampScale.toFixed(4)}`;
        if (key === inst.lastKeys[i] || hidden) return;
        inst.lastKeys[i] = key;
        inst.paths[i].setAttribute("d", lissajousPath(BASE.delta + phaseOff, ampScale));
      });
    });

    if (busy) requestAnimationFrame(frame);
    else running = false;
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".js-a-lissajous").forEach(mount);
    if (instances.length) wake();
  });
})();
