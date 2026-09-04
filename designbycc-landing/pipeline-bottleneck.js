/* pipeline-bottleneck — dots flowing through a pipe that cinches shut.
   Ported from the standalone demo (pipeline-bottleneck.html): hovering
   pinches the pipe at the cursor and the nearest stage label goes red;
   idle, it runs a free-flow → cinch → hold → release cycle at centre.
   Mounted once per `.js-a-pipeline` container (both slider trees).
   Pointer tracking lives on window, hit-tested against the SVG's live
   rect each event — the drag engine sets pointer-events:none on every
   slider anchor mid-drag, so anchor-level listeners would go deaf and
   fire spurious leaves. The clock starts only after main.js removes
   the loader. */

(function () {
  var THEME = {
    accent: "#C41E3A",
    dot1: "#F4743B",
    dot2: "#2A9D8F",
    dot3: "#4A5BD8",
    dot4: "#9B5DE5",
    textMuted: "#666666",
    pipeFill: "#FFFFFF",
    pipeFillOpacity: 0.45,
    pipeStroke: "#D0D0D0"
  };
  var FONT = '"Geist Mono", ui-monospace, monospace';
  var STAGES = ["GENERATE", "REVIEW", "PUBLISH"];
  var FIRST_X = 220, LAST_X = 780;
  var STAGE_X = STAGES.map(function (_, i) {
    return FIRST_X + ((LAST_X - FIRST_X) / (STAGES.length - 1)) * i;
  });
  var CENTER_X = STAGE_X[Math.floor(STAGES.length / 2)];

  var MAX_CINCH = 0.75;
  var T_FREE = 800, T_CINCH = 600, T_HOLD = 3500, T_RELEASE = 450;
  var LERP = 0.12;
  var SPAWN_EVERY = 300, MAX_DOTS = 60, SEED_DOTS = 20;

  var NS = "http://www.w3.org/2000/svg";
  var instances = [];

  function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  function el(name, attrs, parent) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function mount(container) {
    var svg = el("svg", { viewBox: "100 0 800 240", "aria-hidden": "true" }, container);
    el("rect", { x: 0, y: 0, width: 1000, height: 240, fill: "transparent" }, svg);
    var fillPath = el("path", { fill: THEME.pipeFill, opacity: THEME.pipeFillOpacity }, svg);
    var topPath = el("path", { fill: "none", stroke: THEME.pipeStroke, "stroke-width": 1.5 }, svg);
    var bottomPath = el("path", { fill: "none", stroke: THEME.pipeStroke, "stroke-width": 1.5 }, svg);
    var labelsG = el("g", {}, svg);
    var guide = el("line", {
      y1: 72, y2: 228, stroke: THEME.accent, "stroke-width": 1, "stroke-dasharray": "4,4"
    }, svg);
    guide.style.display = "none";
    var dotsG = el("g", {}, svg);

    var labelEls = STAGES.map(function (name, i) {
      var t = el("text", {
        x: STAGE_X[i], y: 30, "text-anchor": "middle",
        "font-family": FONT, "font-size": 13, "font-weight": 600,
        "letter-spacing": "0.1em", fill: THEME.textMuted
      }, labelsG);
      t.textContent = name;
      return t;
    });

    var inst = {
      container: container,
      svg: svg,
      fillPath: fillPath,
      topPath: topPath,
      bottomPath: bottomPath,
      labelEls: labelEls,
      guide: guide,
      dotsG: dotsG,
      dots: [],
      nextId: 0,
      hovering: false,
      hoverX: CENTER_X,
      phase: "free-flow",
      phaseStart: null, // stamped when the loader is gone
      cinchX: CENTER_X,
      cinchAmount: 0,
      lastSpawn: 0
    };
    for (var i = 0; i < SEED_DOTS; i++) inst.dots.push(makeDot(inst, 1000 * Math.random()));
    instances.push(inst);
    return inst;
  }

  function makeDot(inst, x) {
    inst.nextId++;
    var c = el("circle", { r: 5, opacity: 0.8 }, inst.dotsG);
    c.setAttribute("fill", [THEME.dot1, THEME.dot2, THEME.dot3, THEME.dot4][inst.nextId % 4]);
    return { x: x, baseY: 150 + (Math.random() - 0.5) * 30, renderY: null, el: c };
  }

  function setPipe(inst, p, a) {
    var h = 80 + 70 * a;
    var m = 220 - 70 * a;
    var top = "M 0 80 L " + (p - 120) + " 80 C " + (p - 40) + " 80, " + (p - 40) + " " + h + ", " + p + " " + h +
      " C " + (p + 40) + " " + h + ", " + (p + 40) + " 80, " + (p + 120) + " 80 L 1000 80";
    var bottom = "M 0 220 L " + (p - 120) + " 220 C " + (p - 40) + " 220, " + (p - 40) + " " + m + ", " + p + " " + m +
      " C " + (p + 40) + " " + m + ", " + (p + 40) + " 220, " + (p + 120) + " 220 L 1000 220";
    var fill = top + " L 1000 220 L " + (p + 120) + " 220 C " + (p + 40) + " 220, " + (p + 40) + " " + m + ", " + p + " " + m +
      " C " + (p - 40) + " " + m + ", " + (p - 40) + " 220, " + (p - 120) + " 220 L 0 220 Z";
    inst.topPath.setAttribute("d", top);
    inst.bottomPath.setAttribute("d", bottom);
    inst.fillPath.setAttribute("d", fill);
  }

  function render(inst, cinchX, cinchAmount) {
    setPipe(inst, cinchX, cinchAmount);

    var active = -1;
    if (cinchAmount > 0.1) {
      active = 0;
      for (var i = 1; i < STAGE_X.length; i++) {
        if (Math.abs(STAGE_X[i] - cinchX) < Math.abs(STAGE_X[active] - cinchX)) active = i;
      }
      inst.guide.style.display = "";
      inst.guide.setAttribute("x1", cinchX);
      inst.guide.setAttribute("x2", cinchX);
      inst.guide.setAttribute("opacity", Math.min(cinchAmount / 0.3, 0.5));
    } else {
      inst.guide.style.display = "none";
    }
    inst.labelEls.forEach(function (t, i) {
      t.setAttribute("fill", i === active ? THEME.accent : THEME.textMuted);
    });

    for (var d = 0; d < inst.dots.length; d++) {
      var dot = inst.dots[d];
      dot.el.setAttribute("cx", dot.x);
      dot.el.setAttribute("cy", dot.renderY == null ? dot.baseY : dot.renderY);
    }
  }

  /* Cursor → viewBox X against the SVG's live rect; the card is scaled
     and translated by GSAP continuously, so the rect is fresh per event. */
  function trackPointer(e) {
    for (var i = 0; i < instances.length; i++) {
      var inst = instances[i];
      if (inst.container.offsetParent === null) continue;
      var r = inst.svg.getBoundingClientRect();
      var inside = r.width > 0 &&
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside) {
        inst.hoverX = Math.max(180, Math.min(820, 100 + ((e.clientX - r.left) / r.width) * 800));
        inst.hovering = true;
      } else if (inst.hovering) {
        inst.hovering = false;
        inst.phase = "free-flow";
        inst.phaseStart = performance.now();
      }
    }
  }

  function step(inst, now) {
    if (inst.phaseStart === null) inst.phaseStart = now; // loader just left
    var elapsed = now - inst.phaseStart;
    var targetAmount = 0;
    var targetX = inst.cinchX;

    if (inst.hovering) {
      targetX = inst.hoverX;
      targetAmount = MAX_CINCH;
    } else {
      targetX = CENTER_X;
      if (inst.phase === "free-flow") {
        targetAmount = 0;
        if (elapsed >= T_FREE) { inst.phase = "cinching"; inst.phaseStart = now; }
      } else if (inst.phase === "cinching") {
        var t = Math.min(elapsed / T_CINCH, 1);
        targetAmount = MAX_CINCH * easeInOutQuad(t);
        if (t >= 1) { inst.phase = "holding"; inst.phaseStart = now; }
      } else if (inst.phase === "holding") {
        targetAmount = MAX_CINCH;
        if (elapsed >= T_HOLD) { inst.phase = "releasing"; inst.phaseStart = now; }
      } else if (inst.phase === "releasing") {
        var t2 = Math.min(elapsed / T_RELEASE, 1);
        targetAmount = (1 - easeInOutQuad(t2)) * MAX_CINCH;
        if (t2 >= 1) { inst.phase = "free-flow"; inst.phaseStart = now; }
      }
    }

    inst.cinchX += (targetX - inst.cinchX) * LERP;
    inst.cinchAmount += (targetAmount - inst.cinchAmount) * LERP;
    var c = inst.cinchX, u = inst.cinchAmount;

    if (now - inst.lastSpawn > SPAWN_EVERY && inst.dots.length < MAX_DOTS) {
      inst.lastSpawn = now;
      inst.dots.push(makeDot(inst, 0));
    }

    var kept = [];
    for (var i = 0; i < inst.dots.length; i++) {
      var dot = inst.dots[i];
      var rel = dot.x - c;
      var speed;
      if (u < 0.05) speed = 1.2 + 0.2 * Math.random();
      else if (rel < -80) speed = 1.8 + 0.3 * Math.random();
      else if (rel < 40) speed = 1.2 - (u / 0.75) * 1.1 + 0.1 * Math.random();
      else speed = 0.5 + 0.2 * Math.random();

      var off = dot.baseY - 150;
      if (Math.abs(rel) < 60) off *= 1 - u * (1 - Math.abs(rel) / 60);

      dot.x += speed;
      dot.renderY = 150 + off;

      if (dot.x < 1020) kept.push(dot);
      else inst.dotsG.removeChild(dot.el);
    }
    inst.dots = kept;

    // Skip DOM writes for the hidden tree; state still advances so both
    // trees stay in step.
    if (inst.container.offsetParent !== null) render(inst, c, u);
  }

  function frame(now) {
    if (document.querySelector(".js-b-loader")) {
      requestAnimationFrame(frame); // park behind the loader
      return;
    }
    for (var i = 0; i < instances.length; i++) step(instances[i], now);
    requestAnimationFrame(frame);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".js-a-pipeline").forEach(function (c) { mount(c); });
    if (!instances.length) return;

    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      instances.forEach(function (inst) { render(inst, CENTER_X, 0); });
      return;
    }

    window.addEventListener("pointermove", trackPointer, { passive: true });
    requestAnimationFrame(frame);
  });
})();
