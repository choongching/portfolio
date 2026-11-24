/* ------------------------------------------------------------
   The opening (home, first visit of a session). "designby" comes in, a single-line flower draws in
   the cc slot, the slot hard-cuts through seven media (oil, crayon, glitch, shader, ink, halftone,
   pixels) and a technical-drawing cursor whose click starts two bots: they glare, collide, go
   dizzy and shocked, turn happy, merge with a few confetti pieces, and the bold cc lands. Then the
   wordmark flies into the header with the logo intro's own timing while the site's intro plays
   (main.js waits on window.siteOpening.done and hands the logo to flyHome()).
   Explored in designbycc-landing/_swap-lab.html (local); research/2026-11-23-devday-opening-
   letters-spike.md and docs/devlog.md hold the decisions. Motion language: three eases (ENTER
   expo.out, ACCEL power2.in, SPRING elastic) and a 120 bpm grid for the cuts.
   Who gets it: the inline script in index.html adds .has-opening (home, no #about/#contact, not
   reduced motion, not seen in this tab yet; ?opening=1 / ?opening=0 force it on or off). A click
   or a key skips to the end; any error, or 15 s, falls back to the normal intro.
   ------------------------------------------------------------ */

const ON = document.documentElement.classList.contains("has-opening");
const SEEN_KEY = "dbcc-opening-seen";
const MAX_WAIT = 15000;   // ms: the intro never waits longer than this, whatever happens

function createOpening(cover) {
  const reduced = false;   // the opening never runs under reduced motion (see the inline script)
  const phase = () => {};
  const dbEl = cover.querySelector(".db");
  const slot = cover.querySelector(".slot");
  const ccEl = slot.querySelector(".cc");
  const art = slot.querySelector(".art");
  const stage = cover.querySelector(".c-opening__stage");
  const rand = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  "designby".split("").forEach((c) => { dbEl.insertAdjacentHTML("beforeend", `<span class="ch"><span>${c}</span></span>`); });

  // the stage: the header wordmark's type, scaled up and centred (wider on phones)
  const logo = document.querySelector(".js-b-header__logo");
  const wm = logo.querySelector(".wordmark");
  function layout() {
    const share = innerWidth <= 730 ? 0.8 : P.size;
    stage.style.setProperty("--track", `${P.track}em`);
    const fs = Math.min((parseFloat(getComputedStyle(wm).fontSize) * innerWidth * share) / logo.offsetWidth, innerHeight * 0.32);
    stage.style.setProperty("--fs", `${fs}px`);
    const w = stage.querySelector(".wm").getBoundingClientRect().width;
    stage.style.left = `${(innerWidth - w) / 2}px`;
    stage.style.top = `${innerHeight / 2 - fs / 2}px`;
  }

  const P = {
    speed: 1,
    intro: 0.55,     // s: "designby" comes in
    doodle: 1,       // s: the thread doodles itself
    doodleWeight: 1, // line weight (× the bold c's stroke)
    doodleWild: 0.6, // hand wobble
    doodleSize: 1,   // flower size
    doodlePetals: 5, // petals on the flower
    doodleHold: 0,    // s: the finished flower, before the first cut
    cursorSize: 1,    // the tech drawing, vs its tile
    cursorHold: 0.55, // s: the drawing assembles, the cursor clicks: the click cuts to the bots
    swap: 0.2,       // s: each medium on screen
    accel: 0.55,     // the last swaps last this share of the first (1 = steady)
    ccHold: 1.2,     // s: the final "cc" before a loop
    size: 0.62,      // wordmark width, share of the stage
    track: -0.02,    // letter spacing, em (the site's wordmark uses +0.02)
    bots: 1,         // the two bots before the final cc (1 = on)
    botLook: 0.2,    // s: each glance (up, then down)
    botStare: 0.4,   // s: staring at each other
    botRush: 0.32,   // s: drifting together until they touch
    botSize: 1.05,   // body radius vs the letter's half-height
    botOffset: 0.35, // one sits higher, the other lower (share of the body radius)
    botApart: 0.18,  // start this far apart (share of the body radius, each side): close, a small clear gap
    botBounce: 0.55, // how far they spring back after the first touch (share of the radius)
    botJelly: 0.22,  // squash / wobble strength
    botMerge: 0.5,   // how far they press together at the end (0 = touch, 1 = fully merged)
    botFoam: 8,      // confetti pieces that burst out of the joint
    botSheen: 1,     // bubble highlight on the bodies (1 = on)
    botImpact: 0.12, // s: the second hit, held before the cut
    botReact: 0.5,   // s: after the first hit, dizzy and shocked eyes before they come back happy
    ccWobble: 1,     // how much each c bounces as it lands (0 = hard cut)
    bpm: 120,        // tempo grid for the cuts and the landing (0 = free timing)
    eyesDelay: 0.35, // s: the landed cc, before it turns into eyes
    eyeLooks: 4,     // glances around the room
    eyeHold: 0.32,   // s: pause on each glance
    eyePupil: 0.85,  // pupil size vs the c's counter
    ccScale: 1,      // the cc's size vs "designby"
    ccShift: 0,      // nudge the cc up (−) or down (+), em
  };
  const botColor = "#f76d18", doodleColor = "#f76d18";
  /* Motion language (audit 2026-11-23, motion-art-direction): three curves for everything, plus
     the doodle, which runs on a linear clock because its hand speed is built into the path.
     ENTER  arrivals, glances, snaps, spring-backs   ACCEL  rushes, presses, pops (accelerating)
     SPRING the bots' jelly and the cc landing */
  const EASE = { ENTER: "expo.out", ACCEL: "power2.in", SPRING: "elastic.out(1.2, 0.3)" };

  /* ======================= the media ======================= */
  // Each medium is a layer in .art: a canvas (drawn once per size) or the shared WebGL canvas.
  const layers = {};
  let box = { w: 0, h: 0, dpr: 1 };
  function sizeBox() {
    const r = art.getBoundingClientRect();
    box = { w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)), dpr: Math.min(2, devicePixelRatio || 1) };
  }
  // pad: extra room around the box (share of its size, each side) for art that flies outside it;
  // drawing coordinates stay the box's own
  function canvasLayer(name, pad = 0) {
    let c = layers[name];
    if (!c) { c = document.createElement("canvas"); art.appendChild(c); layers[name] = c; }
    const px = box.w * pad, py = box.h * pad;
    c.width = (box.w + 2 * px) * box.dpr; c.height = (box.h + 2 * py) * box.dpr;
    Object.assign(c.style, { left: `${-pad * 100}%`, top: `${-pad * 100}%`, width: `${(1 + 2 * pad) * 100}%`, height: `${(1 + 2 * pad) * 100}%` });
    const g = c.getContext("2d"); g.setTransform(box.dpr, 0, 0, box.dpr, px * box.dpr, py * box.dpr); g.clearRect(-px, -py, box.w + 2 * px, box.h + 2 * py);
    return g;
  }
  // The real "cc" in art-box coordinates, measured from whatever face is chosen, so letter-shaped
  // media and the bots match the final cut. Cached per build (measured at buildAll).
  let CCG = null;
  function measureCC() {
    const a = art.getBoundingClientRect();
    const cs = getComputedStyle(ccEl), size = parseFloat(cs.fontSize);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
    const m = ctx.measureText("c");
    const fA = m.fontBoundingBoxAscent ?? size * 0.9, fD = m.fontBoundingBoxDescent ?? size * 0.25;
    const lineH = parseFloat(getComputedStyle(slot).lineHeight) || size;
    const spans = [...ccEl.querySelectorAll(".c")];
    const boxes = spans.map((sp) => {
      gsap.set(sp, { clearProps: "transform" });
      const r = sp.getBoundingClientRect();
      const base = r.top + (r.height - (fA + fD)) / 2 + fA;          // baseline inside the inline box
      return { l: r.left - m.actualBoundingBoxLeft, r: r.left + m.actualBoundingBoxRight, t: base - m.actualBoundingBoxAscent, b: base + m.actualBoundingBoxDescent };
    });
    const wgt = parseFloat(cs.fontWeight) || 400;
    const sw = size * (0.035 + 0.11 * Math.min(1, Math.max(0, (wgt - 100) / 800)));
    const top = boxes[0].t - a.top, bot = boxes[0].b - a.top;
    return {
      cxs: boxes.map((bx) => (bx.l + bx.r) / 2 - a.left),
      cy: (top + bot) / 2,
      rx: (boxes[0].r - boxes[0].l) / 2 - sw / 2,
      ry: (bot - top) / 2 - sw / 2,
      sw, em: size, lineH,
    };
  }
  function ccGeom() { return CCG || (CCG = measureCC()); }
  function ccPath(g) {
    const { cxs, cy, rx, ry } = ccGeom();
    for (const cx of cxs) {
      g.moveTo(cx + rx * Math.cos(-0.75), cy + ry * Math.sin(-0.75));
      g.ellipse(cx, cy, rx, ry, 0, -0.75, 0.75, true);
    }
  }
  const ccStroke = (g, scale = 1) => { g.lineWidth = ccGeom().sw * scale; g.lineCap = "butt"; };

  // --- thread doodle: a simple flower in one continuous hand-drawn line (CC's reference: a stem with
  // a small bud and a five-petal outline). It starts at the bud, runs down the branch to the stem's
  // foot, rises up the stem and traces the petals; the drawing ends as the flower closes. Drawn on canvas with
  // pen pressure (heavier in turns, tapered ends) at hand speed (slower round curves), with an ink
  // blob at the pen tip.
  const DOODLE = { pts: [], w: [], at: [], p: { v: 0 } };
  function buildDoodle() {
    canvasLayer("doodle", 0.8);
    const G = ccGeom(), h = box.h, sw = G.sw, W = P.doodleWild;
    const n1 = (x) => Math.sin(x * 2.1 + 1.3) * 0.5 + Math.sin(x * 5.3 + 0.7) * 0.3 + Math.sin(x * 11.7) * 0.2;   // hand wobble
    const raw = [];
    const push = (x, y) => { const k = raw.length * 0.018; raw.push([x + n1(k) * sw * 0.1 * W, y + n1(k + 7) * sw * 0.1 * W]); };   // a slow hand wobble, not a shake
    const quad = (a, c, b, n) => { for (let i = 1; i <= n; i++) { const u = i / n, v = 1 - u; push(v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]); } };
    // a scalloped outline: petals as bumps on a circle; starts and ends at the angle `from`
    const petals = (c, R, count, from, n, dir = 1) => {
      for (let i = 0; i <= n; i++) {
        const a = from + dir * (i / n) * Math.PI * 2;
        const r = R * (0.5 + 0.5 * Math.abs(Math.sin(((a - from) * count) / 2)));
        push(c[0] + r * Math.cos(a), c[1] + r * Math.sin(a));
      }
    };
    const R = G.ry * 2.1 * P.doodleSize, F = [box.w * 0.66, G.cy - G.ry * 1.6];        // the flower, standing tall
    const D = [box.w * 0.08, G.cy - G.ry * 0.35], r = R * 0.34;                        // the bud
    const foot = [box.w * 0.34, G.cy + G.ry * 1.1];                                     // the stem's foot
    const down = Math.PI / 2;
    // 1. the bud: three small petals, ending at its lower right
    petals(D, r, 3, down - 0.6, 110);
    // 2. down the branch to the stem's foot (a V, like the reference)
    quad(raw[raw.length - 1], [D[0] + r * 1.8, G.cy + G.ry * 0.5], foot, 50);
    // 3. up the stem, bending right, to the flower's lower edge
    const stemTop = [F[0] - R * 0.18, F[1] + R * 0.5];
    quad(foot, [box.w * 0.38, G.cy - G.ry * 0.6], stemTop, 70);
    // 4. the petals: five, all the way round, back to the stem
    petals(F, R, P.doodlePetals, Math.atan2(stemTop[1] - F[1], stemTop[0] - F[0]), 320);
    // pressure and hand speed from curvature: tight turns → slower and heavier
    const curv = raw.map((p, i) => {
      const a = raw[Math.max(0, i - 3)], c = raw[Math.min(raw.length - 1, i + 3)];
      const a1 = Math.atan2(p[1] - a[1], p[0] - a[0]), a2 = Math.atan2(c[1] - p[1], c[0] - p[0]);
      let d = Math.abs(a2 - a1); if (d > Math.PI) d = 2 * Math.PI - d;
      return d;
    });
    const base = sw * 0.68 * P.doodleWeight, L = raw.length;
    DOODLE.pts = raw;
    DOODLE.w = raw.map((_, i) => {
      const taper = Math.min(1, i / 18) * Math.min(1, (L - 1 - i) / 14);
      return base * (0.8 + 0.35 * Math.min(1, curv[i] * 1.4)) * (0.35 + 0.65 * taper);
    });
    for (let pass = 0; pass < 3; pass++)                                // smooth the pressure: swell, don't bead
      DOODLE.w = DOODLE.w.map((x, i, a) => (a[Math.max(0, i - 2)] + a[Math.max(0, i - 1)] + x + a[Math.min(L - 1, i + 1)] + a[Math.min(L - 1, i + 2)]) / 5);
    const t = [0];                                                      // time to reach each point
    for (let i = 1; i < L; i++) {
      const ds = Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]);
      t.push(t[i - 1] + ds * (1 + 2.5 * Math.min(1, curv[i] * 2)));
    }
    DOODLE.at = t.map((x) => x / t[L - 1]);
    drawDoodle(0);
  }
  // p: the pen, 0..1 along the path
  function drawDoodle(p) {
    const g = canvasLayer("doodle", 0.8), { pts, w, at } = DOODLE;
    if (!pts.length) return;
    const index = (v) => { let lo = 0, hi = pts.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (at[m] < v) lo = m; else hi = m; } return lo; };
    const end = p >= 1 ? pts.length - 1 : index(p + 1e-9) + 1, start = 1;
    g.strokeStyle = doodleColor; g.fillStyle = doodleColor; g.lineCap = "round"; g.lineJoin = "round";
    for (let i = start; i <= end; i++) {
      g.lineWidth = w[i];
      g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke();
    }
    if (p > 0 && p < 1) {                                               // ink blob at the pen tip
      g.beginPath(); g.arc(pts[end][0], pts[end][1], w[end] * 0.62, 0, Math.PI * 2); g.fill();
    }
  }

  // --- oil paint: thick bristle strokes in a few pigments, shaded, inside the cc shapes
  function buildOil() {
    const g = canvasLayer("oil");
    const pig = ["#1d3fa8", "#f2c230", "#c8243b", "#f4efe4", "#2f8f5b", "#1b1b2f"];
    // the cc shapes as a mask, applied after the strokes are laid down
    const m = document.createElement("canvas"); m.width = box.w; m.height = box.h; const mg = m.getContext("2d");
    mg.beginPath(); ccPath(mg); ccStroke(mg, 1.5); mg.stroke();
    for (let k = 0; k < 900; k++) {
      const x = rand() * box.w, y = rand() * box.h, a = rand() * Math.PI, L = box.h * (0.08 + rand() * 0.18), wdt = box.h * (0.03 + rand() * 0.05);
      const col = pig[(rand() * pig.length) | 0];
      for (let b = 0; b < 7; b++) {          // bristles
        const off = (b / 6 - 0.5) * wdt;
        g.strokeStyle = col; g.globalAlpha = 0.55 + rand() * 0.45; g.lineWidth = wdt / 5;
        g.beginPath();
        g.moveTo(x - Math.cos(a) * L / 2 - Math.sin(a) * off, y - Math.sin(a) * L / 2 + Math.cos(a) * off);
        g.quadraticCurveTo(x + rand() * 4, y + rand() * 4, x + Math.cos(a) * L / 2 - Math.sin(a) * off, y + Math.sin(a) * L / 2 + Math.cos(a) * off);
        g.stroke();
      }
      g.globalAlpha = 0.35; g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 1;   // impasto highlight
      g.beginPath(); g.moveTo(x - Math.cos(a) * L / 3, y - Math.sin(a) * L / 3 - wdt / 3); g.lineTo(x + Math.cos(a) * L / 3, y + Math.sin(a) * L / 3 - wdt / 3); g.stroke();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = "destination-in"; g.drawImage(m, 0, 0, box.w, box.h); g.globalCompositeOperation = "source-over";
  }

  // --- crayon: each c traced in 3–4 overlapping wax passes of different colours, waxy and broken
  function buildCrayon() {
    const g = canvasLayer("crayon"), G = ccGeom();
    const wax = ["#e0242b", "#1f5fd1", "#f5c400", "#22a33a", "#f47a1f", "#6b2fa6", "#e9549a"];
    G.cxs.forEach((cx, i) => {
      const passes = 3 + (rand() < 0.5 ? 1 : 0);
      const pick = [...wax].sort(() => rand() - 0.5).slice(0, passes);
      pick.forEach((col, k) => {
        // each pass is its own slightly different C: offset, wobble, a bit bigger or smaller
        const ox = (rand() - 0.5) * G.sw * 1.4, oy = (rand() - 0.5) * G.sw * 1.0;
        const grow = 1 + (k - (passes - 1) / 2) * 0.16 + (rand() - 0.5) * 0.04;   // passes sit side by side
        const rx = G.rx * grow, ry = G.ry * grow;
        const a0 = -0.95 + rand() * 0.35, a1 = -2 * Math.PI + 0.9 - rand() * 0.35;
        const steps = 160, width = G.sw * (0.46 + rand() * 0.14);
        g.strokeStyle = col; g.lineCap = "round";
        for (let j = 0; j < steps; j++) {
          const t0 = a0 + (a1 - a0) * (j / steps), t1 = a0 + (a1 - a0) * ((j + 1.6) / steps);
          const wob = Math.sin(j * 0.05 + k * 2) * G.sw * 0.25 + Math.sin(j * 0.13 + k) * G.sw * 0.06;   // a slow hand wobble
          const p0 = [cx + ox + (rx + wob) * Math.cos(t0), G.cy + oy + (ry + wob) * Math.sin(t0)];
          const p1 = [cx + ox + (rx + wob) * Math.cos(t1), G.cy + oy + (ry + wob) * Math.sin(t1)];
          // a crayon mark is many thin waxy lines side by side, some skipping the paper
          for (let l = 0; l < 6; l++) {
            if (rand() < 0.22) continue;              // the paper shows through
            const off = (l / 8 - 0.5) * width, nx = -(p1[1] - p0[1]), ny = p1[0] - p0[0], nl = Math.hypot(nx, ny) || 1;
            g.globalAlpha = 0.45 + rand() * 0.5; g.lineWidth = width / 5 + rand() * 0.8;
            g.beginPath();
            g.moveTo(p0[0] + (nx / nl) * off + (rand() - 0.5) * 0.6, p0[1] + (ny / nl) * off + (rand() - 0.5) * 0.6);
            g.lineTo(p1[0] + (nx / nl) * off + (rand() - 0.5) * 0.6, p1[1] + (ny / nl) * off + (rand() - 0.5) * 0.6);
            g.stroke();
          }
        }
      });
    });
    g.globalAlpha = 1;
    // paper grain: knock small holes through the wax
    g.globalCompositeOperation = "destination-out";
    for (let k = 0; k < 900; k++) { g.globalAlpha = 0.25 + rand() * 0.5; g.fillRect(rand() * box.w, rand() * box.h, 0.6 + rand(), 0.6 + rand() * 0.6); }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    // a few stray specks
    for (let k = 0; k < 6; k++) { g.fillStyle = wax[(rand() * wax.length) | 0]; g.beginPath(); g.arc(box.w * (0.1 + rand() * 0.8), box.h * (0.3 + rand() * 0.6), rand() * G.sw * 0.08 + 0.5, 0, Math.PI * 2); g.fill(); }
  }

  // --- ink: dry brush cc, with splatter
  function buildInk() {
    const g = canvasLayer("ink");
    g.fillStyle = "#0d0d0d"; g.strokeStyle = "#0d0d0d"; g.lineCap = "round";
    const w = box.w, h = box.h, G = ccGeom();
    for (const cx of G.cxs) {
      const cy = G.cy, rx = G.rx, ry = G.ry;
      for (let s = 0; s < 70; s++) {          // dry brush: many thin passes, thinning out
        const a0 = -0.85 + rand() * 0.2, a1 = -2 * Math.PI + 0.75 + rand() * 0.3;
        g.globalAlpha = 0.25 + rand() * 0.5; g.lineWidth = G.sw * (0.15 + rand() * 0.4);
        const jr = (rand() - 0.5) * G.sw * 0.9;
        g.beginPath(); g.ellipse(cx + (rand() - 0.5) * 4, cy + (rand() - 0.5) * 4, rx + jr, ry + jr, -0.06, a0, a1, true); g.stroke();
      }
    }
    g.globalAlpha = 1;
    for (let k = 0; k < 90; k++) {            // splatter
      const r = Math.pow(rand(), 3) * G.sw * 0.9, x = rand() * w, y = rand() * h;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
  }

  // --- halftone: red dots sized by a radial falloff, inside cc
  function buildHalftone() {
    const g = canvasLayer("halftone");
    const step = Math.max(5, box.h * 0.045);
    g.fillStyle = "#e4002b";
    for (let y = 0; y < box.h; y += step) for (let x = (y / step) % 2 ? step / 2 : 0; x < box.w; x += step) {
      const d = Math.hypot(x / box.w - 0.3, y / box.h - 0.35);
      const r = step * 0.55 * Math.max(0.08, 1 - d * 1.2);
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    g.globalCompositeOperation = "destination-in";
    g.beginPath(); ccPath(g); ccStroke(g, 1.6); g.stroke();
    g.globalCompositeOperation = "source-over";
  }

  // --- pixels: an 8-bit cc
  function buildPixel() {
    const g = canvasLayer("pixel"), G = ccGeom();
    const C = ["0111100", "1100110", "1100000", "1100000", "1100000", "1100110", "0111100"];
    const px = (G.ry * 2 + G.sw) / 7;
    g.fillStyle = "#11a84e";
    G.cxs.forEach((cx) => {
      const ox = cx - 3.5 * px, oy = G.cy - 3.5 * px;
      C.forEach((row, r) => [...row].forEach((v, c) => { if (v === "1") g.fillRect(ox + c * px, oy + r * px, px - 1, px - 1); }));
    });
  }

  // --- technical drawing (CC's reference: an exploded CAD view, pale green line art on a dark olive
  // grid, 1-bit and pixel-crisp). The cursor arrow as three plates (base, rim, face): exploded, they
  // assemble, then the face clicks down. Drawn small, snapped to two colours, scaled up unsmoothed.
  const ARROW = [[0, 0], [0, 17.2], [4.1, 13.4], [7, 20], [9.9, 18.8], [7.1, 12.3], [12.6, 12.3]];   // 20 tall, y down
  const TECH = { bg: "#1b1f16", grid: "#2b3222", ink: "#d3eb9f", low: null, face: null };
  // the hinge: m = exploded (1 → 0 assembles), c = s since the click (< 0: not yet); run = driven by
  // the master timeline (shown alone, it loops: assemble, click, explode)
  const CUR = { m: 0, c: -1, run: false };
  let shownAt = 0;
  const EX = gsap.parseEase("expo.out"), IO = gsap.parseEase("power2.inOut");
  function insetPoly(P, d) {                       // miter offset of each edge, inwards by d
    let A = 0; P.forEach((p, i) => { const q = P[(i + 1) % P.length]; A += p[0] * q[1] - q[0] * p[1]; });
    const sg = A > 0 ? 1 : -1;
    const nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [(-dy / l) * sg, (dx / l) * sg]; };
    return P.map((p, i) => {
      const a = P[(i - 1 + P.length) % P.length], b = P[(i + 1) % P.length];
      const n1 = nrm(a, p), n2 = nrm(p, b), k = d / (1 + n1[0] * n2[0] + n1[1] * n2[1]);
      return [p[0] + (n1[0] + n2[0]) * k, p[1] + (n1[1] + n2[1]) * k];
    });
  }
  function buildTech() {
    canvasLayer("cursor");
    TECH.face = insetPoly(ARROW, 1.7);
    TECH.low = TECH.low || document.createElement("canvas");
    TECH.low.width = Math.ceil((box.w * box.dpr) / 2.2); TECH.low.height = Math.ceil((box.h * box.dpr) / 2.2);   // 2.2 device px per drawing px
  }
  function drawTech(t) {
    const c = layers.cursor, low = TECH.low; if (!c || !low) return;
    const g = low.getContext("2d"), W = low.width, H = low.height, k = W / box.w, G = ccGeom();
    let E, click;
    if (CUR.run) { E = CUR.m; click = CUR.c; }
    else {
      const s = reduced ? 1.4 : (t - shownAt) % 2.6;
      E = s < 1.9 ? 1 - EX(Math.min(1, Math.max(0, (s - 0.2) / 0.5))) : IO((s - 1.9) / 0.7);
      click = s - 1.0;
    }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    // the tile and its grid
    const cx = ((G.cxs[0] + G.cxs[1]) / 2) * k, cy = (box.h / 2) * k;
    const S = Math.round(Math.min(box.w * 0.84, box.h * 0.9) * k), x0 = Math.round(cx - S / 2), y0 = Math.round(cy - S / 2);
    g.fillStyle = TECH.bg; g.beginPath(); g.roundRect(x0, y0, S, S, Math.round(S * 0.035)); g.fill();
    g.save(); g.clip();
    g.fillStyle = TECH.grid;
    for (let i = 1; i < 10; i++) { const p = Math.round((i * S) / 10); g.fillRect(x0 + p, y0, 1, S); g.fillRect(x0, y0 + p, S, 1); }
    // projection: the arrow lies flat, turned a little, seen from above at an angle
    const yaw = -0.15 + (reduced ? 0 : 0.08 * Math.sin(t * 0.9)), pitch = 0.82;
    const ca = Math.cos(yaw), sa = Math.sin(yaw), cb = Math.cos(pitch), sb = Math.sin(pitch);
    const u = S * 0.042 * P.cursorSize, gap = 4.2 * E;
    const ox = cx + S * 0.02, oy = cy + S * 0.02 + gap * u * cb;   // the exploded stack stays centred
    const proj = (px, py, h) => {
      const X = px - 6.3, Z = py - 10, X1 = X * ca - Z * sa, Z1 = X * sa + Z * ca;
      return [Math.round(ox + X1 * u) + 0.5, Math.round(oy - (h * cb - Z1 * sb) * u) + 0.5, h * sb + Z1 * cb];   // [x, y, depth: larger = nearer]
    };
    const path = (pts) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); };
    const line = (a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
    const press = click >= 0 ? Math.max(0, 1 - Math.abs(click - 0.05) / 0.08) : 0;   // the click: a quick dip
    const faceY = 1.6 + gap * 2 - press * 0.5;
    const plates = [
      { poly: ARROW, y0: 0, y1: 1 },
      { poly: ARROW, y0: 1 + gap, y1: 1.6 + gap, groove: TECH.face },
      { poly: TECH.face, y0: faceY, y1: faceY + 0.8 },
    ];
    g.lineWidth = 1; g.strokeStyle = TECH.ink; g.fillStyle = TECH.ink;
    // dimension line along the base's long edge (ticks, no numbers)
    const d0 = proj(-2.8, 0, 0), d1 = proj(-2.8, 17.2, 0);
    line(proj(-0.6, 0, 0), proj(-3.6, 0, 0)); line(proj(-0.6, 17.2, 0), proj(-3.6, 17.2, 0)); line(d0, d1);
    for (const p of [d0, d1]) line([p[0] - 2, p[1] + 2], [p[0] + 2, p[1] - 2]);
    // exploded-view axes: dashed, through three corners of the face
    if (E > 0.02) {
      g.save(); g.setLineDash([2, 2]);
      for (const i of [0, 3, 6]) line(proj(TECH.face[i][0], TECH.face[i][1], 0), proj(TECH.face[i][0], TECH.face[i][1], faceY + 0.8));
      g.restore();
    }
    // the plates, bottom up; each one's walls far to near, then its top (filled: hides what's behind)
    for (const L of plates) {
      const bot = L.poly.map((p) => proj(p[0], p[1], L.y0)), top = L.poly.map((p) => proj(p[0], p[1], L.y1));
      bot.map((b, i) => { const j = (i + 1) % bot.length; return { q: [b, bot[j], top[j], top[i]], z: b[2] + bot[j][2] }; })
        .sort((a, b) => a.z - b.z)
        .forEach(({ q }) => { path(q); g.fillStyle = TECH.bg; g.fill(); g.stroke(); });
      path(top); g.fillStyle = TECH.bg; g.fill(); g.stroke();
      if (L.groove) { path(L.groove.map((p) => proj(p[0], p[1], L.y1))); g.stroke(); }
    }
    // CAD handles on the face's corners, a crosshair at the tip
    const ft = TECH.face.map((p) => proj(p[0], p[1], faceY + 0.8));
    g.fillStyle = TECH.bg;
    for (const p of ft) { g.fillRect(p[0] - 2, p[1] - 2, 4, 4); g.strokeRect(p[0] - 2, p[1] - 2, 4, 4); }
    const tp = ft[0], ch = Math.round(S * 0.05);
    line([tp[0] - ch, tp[1]], [tp[0] - 4, tp[1]]); line([tp[0] + 4, tp[1]], [tp[0] + ch, tp[1]]);
    line([tp[0], tp[1] - ch], [tp[0], tp[1] - 4]); line([tp[0], tp[1] + 4], [tp[0], tp[1] + ch]);
    // the click: a ring on the face's plane, round the tip
    if (click >= 0.03 && click < 0.6) {
      const a = (click - 0.03) / 0.57, r = 1 + 7 * (1 - Math.pow(1 - a, 3)), f = TECH.face[0], ring = [];
      for (let i = 0; i < 40; i++) { const th = (i / 40) * Math.PI * 2; ring.push(proj(f[0] + r * Math.cos(th), f[1] + r * Math.sin(th), faceY + 0.8)); }
      if (a < 0.8) { path(ring); g.stroke(); }
    }
    g.restore();
    // 1-bit: line pixels snap to the ink, soft edges to the ground (the grid stays as it is)
    const img = g.getImageData(0, 0, W, H), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      if (d[i + 1] > 133) { d[i] = 0xd3; d[i + 1] = 0xeb; d[i + 2] = 0x9f; }
      else if (d[i + 1] > 55) { d[i] = 0x1b; d[i + 1] = 0x1f; d[i + 2] = 0x16; }
    }
    g.putImageData(img, 0, 0);
    const out = c.getContext("2d");
    out.setTransform(1, 0, 0, 1, 0, 0); out.clearRect(0, 0, c.width, c.height);
    out.imageSmoothingEnabled = false; out.drawImage(low, 0, 0, c.width, c.height);
  }

  // --- WebGL: domain-warp shader, glitch. The canvas has room
  // round the box (GL_PAD) so a 3D pose is never cut at the box edge.
  const GL_PAD = 0.25;
  const glCanvas = document.createElement("canvas");
  art.appendChild(glCanvas); layers.gl = glCanvas;
  const gl = glCanvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
  const FRAG = `
  precision highp float;
  #define PAD_K ${(1 + 2 * GL_PAD).toFixed(3)}
  uniform vec2 res; uniform float time; uniform int mode;
  uniform vec4 cc;   // x: first c centre x, y: second c centre x, z: centre y, w: mouth half-angle (device px, GL y-up)
  uniform vec3 ccr;  // x: radius x, y: radius y, z: stroke width (device px)
  // Signed distance to one c: an elliptical ring (stretched to a circle, scaled back) with the
  // mouth cut away on the right. Negative inside the stroke.
  float sdC(vec2 p, float cx, float grow){
    vec2 q = (p - vec2(cx, cc.z)) / ccr.xy;
    float ring = abs((length(q) - 1.0) * min(ccr.x, ccr.y)) - ccr.z * 0.5 * grow;
    float a = abs(atan(q.y, q.x));
    float mouth = (cc.w - a) * min(ccr.x, ccr.y);          // > 0 inside the mouth wedge
    return max(ring, mouth);
  }
  float sdCC(vec2 p, float grow){ return min(sdC(p, cc.x, grow), sdC(p, cc.y, grow)); }
  float maskCC(vec2 p, float grow){ return smoothstep(1.2, -1.2, sdCC(p, grow)); }   // ~1px AA edge
  vec3 palette(float t){ return .5 + .5*cos(6.28318*(vec3(1.,1.,1.)*t + vec3(.0,.33,.67))); }
  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+1.7; a*=.5; } return v; }
  void main(){
    vec2 uv = (gl_FragCoord.xy - .5*res) / res.y * PAD_K;   // the box's own scale, padding aside
    if (mode == 2) { // domain-warped fbm (noise fed into noise) in a cosine palette, inside the cc
      vec2 p = uv*2.6; float t=time*.7;
      vec2 q = vec2(fbm(p+t), fbm(p+vec2(5.2,1.3)-t));
      vec2 r = vec2(fbm(p + 4.*q + vec2(1.7,9.2)), fbm(p + 4.*q + vec2(8.3,2.8)));
      float f = fbm(p + 4.*r);
      vec3 col = palette(f*1.4 + q.x*.6 + t*.15);
      col *= .75 + .5*f;
      gl_FragColor = vec4(col, maskCC(gl_FragCoord.xy, 1.5)); return;
    }
    if (mode == 4) { // glitch: rows shift on a hashed beat, the channels misregister (chromatic aberration)
      float row = floor(gl_FragCoord.y / (ccr.z * .55));
      float tick = floor(time * 14.);
      float shift = (hash(vec2(row, tick)) - .5) * ccr.z * 2.2 * step(.55, hash(vec2(row * 1.7, tick + 3.)));
      vec2 g = gl_FragCoord.xy + vec2(shift, 0.);
      float off = ccr.z * .28;
      float mr = maskCC(g + vec2(off, 0.), 1.), mk = maskCC(g, 1.), mb = maskCC(g - vec2(off, 0.), 1.);
      vec3 col = vec3(.08) * mk + (1. - mk) * (mr * vec3(1., .12, .22) + mb * vec3(.1, .32, 1.)) / max(mr + mb, 1.);
      gl_FragColor = vec4(col, max(mk, max(mr, mb))); return;
    }
    vec3 ro = vec3(0,0,2.6), rd = normalize(vec3(uv, -1.6));
  }`;
  let prog = null, uRes, uTime, uMode, uCC, uCCR;
  if (gl) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position = vec4(p,0,1); }"));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    uRes = gl.getUniformLocation(prog, "res"); uTime = gl.getUniformLocation(prog, "time"); uMode = gl.getUniformLocation(prog, "mode");
    uCC = gl.getUniformLocation(prog, "cc"); uCCR = gl.getUniformLocation(prog, "ccr");
  }
  const GL_MODE = { warp: 2, glitch: 4 };

  function buildAll() {
    sizeBox();
    CCG = measureCC();
    buildDoodle(); buildOil(); buildCrayon(); buildInk(); buildHalftone(); buildPixel(); buildTech(); buildBots();
    glCanvas.width = box.w * (1 + 2 * GL_PAD) * box.dpr; glCanvas.height = box.h * (1 + 2 * GL_PAD) * box.dpr;
    Object.assign(glCanvas.style, { left: `${-GL_PAD * 100}%`, top: `${-GL_PAD * 100}%`, width: `${(1 + 2 * GL_PAD) * 100}%`, height: `${(1 + 2 * GL_PAD) * 100}%` });
  }

  // --- the bots: two soft bodies with googly eyes, one a little higher than the other. They glance
  // up, down, then stare at each other; drift together like soap bubbles: touch, squash, spring
  // back, press together with a jelly wobble while foam puffs out of the joint; then the cut.
  // Bodies are merged by a "goo" filter (blur + alpha threshold), so they melt where they meet.
  const bot = { gx0: 0, gx1: 0, gy0: -1, gy1: -1, t0: 0, t1: 0, sq0: 0, sq1: 0, e0: 0, e1: 0, x0: 0, x1: 0, w0: 0, w1: 0, l0: 0, l1: 0, h0: 0, h1: 0, z0: 0, z1: 0, spin: 0 };
  // expressions: x = squeezed shut ("> <"), w = wide (shock), l = lids down (determined),
  // h = happy ("^ ^"), z = dizzy (spirals, turned by spin)   // e = eyes lagging on impact   // t = travel along the line between them
  function botGeom() {
    const G = ccGeom(), r = layers.bots.r, off = r * P.botOffset;
    const c0 = [G.cxs[0], G.cy - off], c1 = [G.cxs[1], G.cy + off];
    const dx = c1[0] - c0[0], dy = c1[1] - c0[1], dist = Math.hypot(dx, dy);
    const n = [dx / dist, dy / dist];
    // clearance (logo-animation: keep motion out of the mark's own space): the left bot, at its
    // furthest-out pose (start apart + wind-up + squash), must stay right of "designby"
    const dbRight = dbEl.getBoundingClientRect().right - art.getBoundingClientRect().left + G.em * 0.04;
    const leftmost = c0[0] - r - n[0] * r * (P.botApart + 0.12) - r * 0.06;
    const shift = Math.max(0, dbRight - leftmost);
    c0[0] += shift; c1[0] += shift;
    return { G, r, c0, c1, n, dist };
  }
  function buildBots() {
    let s = layers.bots;
    if (!s) { s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); art.appendChild(s); layers.bots = s; }
    const G = ccGeom(), r = (G.ry + G.sw / 2) * P.botSize;
    s.r = r;
    s.setAttribute("viewBox", `0 0 ${box.w} ${box.h}`);
    s.style.overflow = "visible";
    const eye = (i, k) => `<g class="eye" data-bot="${i}" data-k="${k}"><ellipse class="sclera" fill="#fff"/><ellipse class="pupil" fill="#111"/>` +
      `<path class="lid" style="fill: ${botColor}"/><path class="spiral" fill="none" stroke="#111" stroke-width="${(r * 0.045).toFixed(1)}" stroke-linecap="round"/>` +
      `<path class="squint" fill="none" stroke="#111" stroke-width="${(r * 0.085).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path class="happy" fill="none" stroke="#111" stroke-width="${(r * 0.085).toFixed(1)}" stroke-linecap="round"/></g>`;
    const sheen = (i) => P.botSheen ? `<ellipse class="sheen" data-bot="${i}" fill="#fff" opacity=".35"/>` : "";
    s.innerHTML = `
      <defs><filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${(r * 0.16).toFixed(1)}" result="b"/>
        <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10"/>
      </filter></defs>
      <g filter="url(#goo)" fill="${botColor}"><ellipse class="body" data-bot="0"/><ellipse class="body" data-bot="1"/></g>
      ${sheen(0)}${sheen(1)}
      <g class="foam"></g>
      ${eye(0, 0)}${eye(0, 1)}${eye(1, 0)}${eye(1, 1)}`;
    renderBots();
  }
  function renderBots() {
    const s = layers.bots; if (!s) return;
    const { r, c0, c1, n } = botGeom();
    const ang = Math.atan2(n[1], n[0]) * 180 / Math.PI;
    const pos = (i) => { const c = i ? c1 : c0, t = bot[`t${i}`] * (i ? -1 : 1); return [c[0] + n[0] * t, c[1] + n[1] * t]; };
    s.querySelectorAll(".body").forEach((b) => {
      const i = +b.dataset.bot, [x, y] = pos(i), q = bot[`sq${i}`];
      // squash along the line between them (q > 0 flattens towards the other bot, q < 0 stretches)
      b.setAttribute("cx", x); b.setAttribute("cy", y);
      b.setAttribute("rx", r * (1 - q)); b.setAttribute("ry", r * (1 + q * 0.7));
      b.setAttribute("transform", `rotate(${ang} ${x} ${y})`);
    });
    s.querySelectorAll(".sheen").forEach((e) => {
      const i = +e.dataset.bot, [x, y] = pos(i);
      e.setAttribute("cx", x - r * 0.42); e.setAttribute("cy", y - r * 0.5);
      e.setAttribute("rx", r * 0.2); e.setAttribute("ry", r * 0.11);
      e.setAttribute("transform", `rotate(-35 ${x - r * 0.42} ${y - r * 0.5})`);
    });
    s.querySelectorAll(".eye").forEach((e) => {
      const i = +e.dataset.bot, k = +e.dataset.k, gx = bot[`gx${i}`], gy = bot[`gy${i}`], [x, y] = pos(i);
      // secondary motion: on impact the eyes keep travelling towards the other bot, then spring back
      const lag = bot[`e${i}`] * r * 0.14 * (i ? -1 : 1);
      const cx = x + (k ? 1 : -1) * r * 0.33 + gx * r * 0.1 + n[0] * lag, cy = y - r * 0.18 + gy * r * 0.06 + n[1] * lag;
      const sc = e.querySelector(".sclera"), pu = e.querySelector(".pupil"), sq = e.querySelector(".squint");
      // expressions: x squeezes the eye shut into a "> <" chevron (ouch), w opens it wide with a
      // pinprick pupil (shock), h closes it into a smile arc, z swaps the pupil for a turning spiral
      const X = bot[`x${i}`], W = bot[`w${i}`], H = bot[`h${i}`], Z = bot[`z${i}`], L = bot[`l${i}`];
      const open = Math.max(0, 1 - Math.max(X, H) * 1.6);
      const sr = r * 0.27 * (1 + 0.22 * W), pr = r * 0.17 * (1 - 0.5 * W), len = Math.hypot(gx, gy) || 1;
      sc.setAttribute("cx", cx); sc.setAttribute("cy", cy); sc.setAttribute("rx", sr); sc.setAttribute("ry", sr * open);
      // the pupil sits against the edge it's looking towards (googly-eye look); in shock it jumps to the middle
      const jig = bot[`e${i}`] * (k ? 1 : -1) * sr * 0.12;      // the pupils jiggle a little as they settle
      const reach = (sr - pr) * 0.95 * (1 - 0.7 * W);
      pu.setAttribute("cx", cx + (gx / len) * reach); pu.setAttribute("cy", cy + ((gy / len) * reach + jig) * open);
      pu.setAttribute("rx", pr * (1 - Z)); pu.setAttribute("ry", pr * open * (1 - Z));
      // the lid: a body-coloured cap over the top of the eye, tilted down towards the face's middle
      const lr = sr * 1.1, ly = -lr + (lr + sr * 0.05) * L, lx = Math.sqrt(Math.max(0, lr * lr - ly * ly)), tilt = (k ? -1 : 1) * 14 * L;   // a touch larger than the eye: no white hairline
      e.querySelector(".lid").setAttribute("d", L > 0.01 && open > 0 ? `M${cx - lx} ${cy + ly}A${lr} ${lr} 0 ${ly > 0 ? 1 : 0} 1 ${cx + lx} ${cy + ly}Z` : "");
      e.querySelector(".lid").setAttribute("transform", `rotate(${tilt} ${cx} ${cy})`);
      // dizzy: an Archimedean spiral, turning
      let sp = "";
      if (Z > 0.01) {
        const a0 = (bot.spin + k * 90) * Math.PI / 180, turns = 2.6, steps = 48;
        for (let j = 0; j <= steps; j++) {
          const th = (j / steps) * turns * Math.PI * 2, rr = sr * 0.82 * Z * (j / steps);
          sp += `${j ? "L" : "M"}${(cx + rr * Math.cos(th + a0)).toFixed(1)} ${(cy + rr * Math.sin(th + a0)).toFixed(1)}`;
        }
      }
      e.querySelector(".spiral").setAttribute("d", sp);
      // happy: a "^" arc
      const hw = r * 0.2, hh = r * 0.12;
      e.querySelector(".happy").setAttribute("d", `M${cx - hw} ${cy + hh}Q${cx} ${cy - hh * 2.4} ${cx + hw} ${cy + hh}`);
      e.querySelector(".happy").setAttribute("opacity", Math.max(0, Math.min(1, (H - 0.45) * 4)));
      const cw = r * 0.2 * (0.6 + 0.4 * X), ch = r * 0.17 * (0.6 + 0.4 * X), d = k ? -1 : 1;   // left eye ">", right eye "<"
      sq.setAttribute("d", `M${cx - d * cw} ${cy - ch}L${cx + d * cw} ${cy}L${cx - d * cw} ${cy + ch}`);
      sq.setAttribute("opacity", Math.max(0, Math.min(1, (X - 0.45) * 4)));
    });
  }
  // Confetti: a few flat paper pieces burst up from the joint, spin and flutter, then fall
  // (particle-system: burst + gravity + air drag + rotating flat rects). Seeded and stepped at a
  // fixed 1/120 s from the burst, so any frame (slow motion, seeking) is the same every time.
  const FOAM = { parts: [], clock: { t: 0 }, mid: [0, 0], r: 1 };
  let fx = null;                                   // overlay for the confetti; not a medium, never switched off by show()
  function fxLayer() {
    if (!fx) { fx = document.createElementNS("http://www.w3.org/2000/svg", "svg"); fx.classList.add("fx"); art.appendChild(fx); }
    fx.setAttribute("viewBox", `0 0 ${box.w} ${box.h}`); fx.style.overflow = "visible";
    return fx;
  }
  function foam(tl, at) {
    const host = fxLayer();
    const { r, c0, n, dist } = botGeom();
    FOAM.mid = [c0[0] + n[0] * dist / 2, c0[1] + n[1] * dist / 2]; FOAM.r = r;
    let seed = 4321; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const colors = [botColor, "#f76d18", "#f5c400", "#1f5fd1", "#e9549a", "#22a33a", "#141414"];
    host.innerHTML = "";
    FOAM.parts = Array.from({ length: P.botFoam }, (_, k) => {
      const ang = -Math.PI / 2 + (rnd() - 0.5) * 2.1;                     // an upward cone
      const spd = r * (6 + rnd() * 5);
      const el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      el.setAttribute("fill", colors[k % colors.length]);
      host.appendChild(el);
      return { el, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, w: r * (0.16 + rnd() * 0.1), h: r * (0.08 + rnd() * 0.05),
               rot: rnd() * 360, vr: (rnd() - 0.5) * 900, flip: 8 + rnd() * 10, phase: rnd() * 6.28, delay: rnd() * 0.05 };
    });
    FOAM.clock.t = 0;
    tl.fromTo(FOAM.clock, { t: 0 }, { t: 0.7, duration: 0.7, ease: "none", onUpdate: drawFoam, immediateRender: false }, at);
  }
  function drawFoam() {
    const T = FOAM.clock.t, r = FOAM.r, dt = 1 / 120;
    for (const p of FOAM.parts) {
      const age = T - p.delay;
      if (age <= 0) { p.el.setAttribute("width", 0); continue; }
      let x = FOAM.mid[0], y = FOAM.mid[1], vx = p.vx, vy = p.vy;
      const steps = Math.min(Math.round(age / dt), 240);
      for (let k = 0; k < steps; k++) {           // semi-implicit Euler: forces → velocity → position
        vy += r * 16 * dt;                         // gravity
        vx *= 1 - 2.6 * dt; vy *= 1 - 2.6 * dt;    // air drag (paper)
        x += vx * dt; y += vy * dt;
      }
      const flutter = Math.cos(age * p.flip + p.phase);                  // the paper turning over
      const fade = Math.max(0, Math.min(1, (0.65 - age) / 0.2));   // gone before the cc settles (clear space)
      p.el.setAttribute("x", -p.w / 2); p.el.setAttribute("y", -p.h / 2);
      p.el.setAttribute("width", p.w); p.el.setAttribute("height", p.h);
      p.el.setAttribute("opacity", fade);
      p.el.setAttribute("transform", `translate(${x} ${y}) rotate(${p.rot + p.vr * age}) scale(1 ${flutter.toFixed(3)})`);
    }
  }
  // adds the bot scene to timeline tl at time t; returns the time of the cut
  function botScene(tl, t) {
    const { r, n, dist } = botGeom();
    const touch = (dist - 2 * r) / 2;                     // travel each, to just touch
    const press = touch + r * P.botMerge * 0.5;           // travel each, to press together
    const J = P.botJelly;
    const u = { onUpdate: renderBots };
    const along = (i) => [n[0] * (i ? -1 : 1), n[1] * (i ? -1 : 1)];   // gaze towards the other bot
    fxLayer().innerHTML = "";                            // old foam goes now, at build time (foam() adds the new bubbles below)
    const eyesLag = (at) => {                             // the eyes overshoot the body, then spring back
      tl.to(bot, { e0: 1, e1: 1, duration: 0.05, ease: EASE.ENTER, ...u }, at);
      tl.to(bot, { e0: 0, e1: 0, duration: 0.25, ease: EASE.ENTER, ...u }, at + 0.05);   // settle once, no wobble
    };
    tl.call(() => {
      phase("bots: look up");
      Object.assign(bot, { gx0: 0.15, gx1: -0.1, gy0: -1, gy1: -1, t0: -r * P.botApart, t1: -r * P.botApart, sq0: 0, sq1: 0, e0: 0, e1: 0, x0: 0, x1: 0, w0: 0, w1: 0, l0: 0, l1: 0, h0: 0, h1: 0, z0: 0, z1: 0, spin: 0 });
      renderBots(); show("bots");
    }, null, t);
    t += P.botLook;
    tl.call(() => phase("bots: look down"), null, t);
    tl.to(bot, { gy0: 1, gy1: 1, gx0: -0.1, gx1: 0.12, duration: 0.07, ease: EASE.ENTER, ...u }, t);
    t += P.botLook;
    tl.call(() => phase("bots: stare"), null, t);
    const [ax, ay] = along(0), [bx, by] = along(1);
    tl.to(bot, { gx0: ax, gy0: ay, gx1: bx, gy1: by, duration: 0.06, ease: EASE.ENTER, ...u }, t);
    tl.to(bot, { l0: 1, l1: 1, duration: 0.12, ease: EASE.ENTER, ...u }, t + 0.04);   // determined: lids down, slanted in
    t += P.botStare;
    // 1. wind-up (anticipation): a small pull back, then drift together, light as bubbles
    tl.call(() => phase("bots: wind-up → drift"), null, t);
    tl.to(bot, { t0: -r * (P.botApart + 0.12), t1: -r * (P.botApart + 0.12), duration: 0.08, ease: EASE.ENTER, ...u }, t);
    t += 0.08;
    tl.to(bot, { t0: touch, t1: touch, duration: P.botRush, ease: EASE.ACCEL, ...u }, t);
    t += P.botRush;
    // 2. hit one: squash against each other, the eyes lag, spring back apart
    tl.call(() => phase("bots: boing"), null, t);
    tl.to(bot, { sq0: J, sq1: J, t0: touch + r * J * 0.6, t1: touch + r * J * 0.6, duration: 0.07, ease: EASE.ENTER, ...u }, t);
    eyesLag(t);
    tl.to(bot, { t0: touch - r * P.botBounce, t1: touch - r * P.botBounce, duration: 0.32, ease: EASE.ENTER, ...u }, t + 0.07);
    tl.to(bot, { sq0: 0, sq1: 0, duration: 0.25, ease: EASE.ENTER, ...u }, t + 0.07);   // release once: one hit, not a wobble
    // the expression: squeezed shut "> <" on impact, then the eyes pop open wide in shock while they
    // bounce apart, and calm back to a stare before they come back
    // squeezed shut "> <" on impact; then the left one is dizzy (spiral eyes) and the right one in
    // shock (wide, pinprick pupils); then both light up, happy "^ ^", and come back for more
    tl.to(bot, { x0: 1, x1: 1, l0: 0, l1: 0, duration: 0.04, ease: EASE.ENTER, ...u }, t);
    tl.call(() => phase("bots: dizzy + shock"), null, t + 0.2);
    tl.to(bot, { x0: 0, z0: 1, duration: 0.09, ease: EASE.ENTER, ...u }, t + 0.2);
    tl.to(bot, { x1: 0, w1: 1, duration: 0.09, ease: EASE.ENTER, ...u }, t + 0.24);
    tl.fromTo(bot, { spin: 0 }, { spin: 900, duration: 0.3 + P.botReact, ease: "power1.out", ...u, immediateRender: false }, t + 0.2);
    t += 0.3 + P.botReact;
    tl.call(() => phase("bots: happy"), null, t - 0.14);
    tl.to(bot, { z0: 0, w1: 0, h0: 1, h1: 1, duration: 0.1, ease: EASE.ENTER, ...u }, t - 0.14);
    // 3. hit two: come back and press together, the eyes lag, confetti bursts; then the cut
    tl.call(() => phase("bots: merge + confetti"), null, t);
    tl.to(bot, { t0: press, t1: press, duration: 0.22, ease: EASE.ACCEL, ...u }, t);
    t += 0.22;
    tl.to(bot, { sq0: J * 1.2, sq1: J * 1.2, duration: 0.07, ease: EASE.ENTER, ...u }, t);   // the second hit: squash, then the cut
    eyesLag(t);
    foam(tl, t);
    return t + P.botImpact;
  }

  /* ======================= showing one thing at a time ======================= */
  let current = null;
  function show(name) {
    current = name;
    for (const k in layers) layers[k].classList.remove("is-on");
    ccEl.classList.toggle("is-on", name === "cc");
    if (name !== "cc") gsap.set(ccEl.querySelectorAll(".c"), { clearProps: "transform" });
    if (!name || name === "cc") return;
    if (name in GL_MODE) layers.gl.classList.add("is-on"); else layers[name]?.classList.add("is-on");
    shownAt = performance.now() / 1000; CUR.run = false;
    renderLive(performance.now() / 1000);
  }
  function renderLive(t) {
    if (current === "cursor") drawTech(t);
    if (current in GL_MODE && gl) {
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, glCanvas.width, glCanvas.height); gl.uniform1f(uTime, reduced ? 0 : t); gl.uniform1i(uMode, GL_MODE[current]);
      const G = ccGeom(), d = box.dpr, H = glCanvas.height, ox = box.w * GL_PAD, oy = box.h * GL_PAD;   // the cc, in device px with GL's y-up
      gl.uniform4f(uCC, (G.cxs[0] + ox) * d, (G.cxs[1] + ox) * d, H - (G.cy + oy) * d, 0.75);
      gl.uniform3f(uCCR, G.rx * d, G.ry * d, G.sw * d);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
  /* The final cc lands: each c starts where its bot was (one higher, one lower, tilted and squashed)
     and wobbles into place, ending perfectly set on the baseline (CC: irregular only at the start). */
  function ccLand(tl, t) {
    const cs = ccEl.querySelectorAll(".c");
    const em = parseFloat(getComputedStyle(ccEl).fontSize);
    const off = P.bots ? P.botOffset * 0.25 : 0.12;     // where the bots were, in em
    cs.forEach((c, i) => {
      const sign = i ? 1 : -1, W = P.ccWobble;
      tl.fromTo(c, {
        rotation: sign * 14 * W, y: sign * off * em, x: -sign * 0.04 * W * em,
        scaleX: 1 + 0.22 * W, scaleY: 1 - 0.2 * W,
      }, {
        rotation: 0, y: 0, x: 0, scaleX: 1, scaleY: 1,
        duration: W ? 0.75 : 0.01, ease: EASE.SPRING, immediateRender: false,   // pose only when it lands
      }, t + i * 0.045);
    });
  }

  /* The cc becomes eyes. A bold c is already an eye: a dark disc with a round hole pushed out
     through its right edge. Slide that hole (the pupil) into the disc and the letters are two eyes;
     they glance around the room together, blink shut, and open as the normal cc again. Built on
     the measured letter, so the first frame of the eyes matches the letters. */

  let master = null;
  function run(onDone) {
    layout(); buildAll(); show(null);
    const chars = dbEl.querySelectorAll(".ch > span");
    gsap.set(chars, { yPercent: 110 });
    DOODLE.p.v = 0;
    const order = ["oil", "crayon", "glitch", "warp", "ink", "halftone", "pixel"];

    master = gsap.timeline({ onComplete: onDone });
    master.to(chars, { yPercent: 0, duration: P.intro, ease: EASE.ENTER, stagger: P.intro * 0.06 }, 0.1);
    const t0 = 0.1 + P.intro * 0.75;
    master.call(() => show("doodle"), null, t0);
    // linear clock on purpose: the hand speed is built into the path (slower in turns)
    master.fromTo(DOODLE.p, { v: 0 }, { v: 1, duration: P.doodle, ease: "none", onUpdate: () => drawDoodle(DOODLE.p.v), immediateRender: false }, t0);
    // the flower ends the doodle; the first cut lands as it closes, and every cut lasts a whole
    // number of sixteenths at 120 bpm (a drum roll), counted from that first cut
    const beat = 60 / P.bpm, six = beat / 4;
    let t = t0 + P.doodle + P.doodleHold;
    const downbeat = t, onGrid = (x) => downbeat + Math.ceil((x - downbeat) / beat - 1e-6) * beat;
    order.forEach((name, i) => {
      const d = Math.max(1, Math.round((P.swap * (1 - (1 - P.accel) * (i / (order.length - 1)))) / six)) * six;
      master.call(() => show(name), null, t);
      t += d;
    });
    // the hinge: the exploded drawing assembles, the cursor clicks, the click is the cut to the bots
    const cut = t + Math.max(2, Math.round(P.cursorHold / six)) * six, clickAt = cut - 0.08;
    master.call(() => { show("cursor"); Object.assign(CUR, { run: true, m: 1, c: -1 }); }, null, t);
    master.fromTo(CUR, { m: 1 }, { m: 0, duration: Math.min(0.3, clickAt - t), ease: EASE.ENTER, immediateRender: false }, t);
    master.fromTo(CUR, { c: 0 }, { c: 0.6, duration: 0.6, ease: "none", immediateRender: false }, clickAt);
    t = onGrid(botScene(master, cut));
    master.call(() => show("cc"), null, t);
    ccLand(master, t);
    master.to({}, { duration: 0.8 }, t);   // the cc settles (its landing wobble) before the hand-off
  }

  const tick = () => renderLive(performance.now() / 1000);
  gsap.ticker.add(tick);

  // The wordmark flies into the header with the logo intro's timing and ease, while the page comes
  // in behind it; the real logo takes over when it lands (a 0.2 s crossfade hides the last pixel:
  // the 19px text rounds its advances, the scaled one doesn't). Letter spacing eases from the
  // opening's to the logo's on the way.
  function flyHome({ duration, delay, ease }) {
    return new Promise((resolve) => {
      gsap.set(logo, { clearProps: "transform" });
      logo.style.visibility = "hidden";
      const rg = document.createRange(); rg.setStart(wm.firstChild, 0); rg.setEnd(wm.firstChild, 1);
      const rd = rg.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      const og = document.createRange(); og.selectNodeContents(dbEl.querySelector(".ch > span"));
      const od = og.getBoundingClientRect(), k = rd.height / od.height;
      const track = parseFloat(getComputedStyle(wm).letterSpacing) / parseFloat(getComputedStyle(wm).fontSize) || 0;
      for (const n in layers) layers[n].classList.remove("is-on");
      fxLayer().innerHTML = "";
      Object.assign(cover.style, { background: "transparent", pointerEvents: "none" });
      const v = { track: P.track };
      gsap.to(v, { track, duration, delay, ease, onUpdate: () => stage.style.setProperty("--track", `${v.track}em`) });
      gsap.to(stage, {
        x: rd.left - (sr.left + (od.left - sr.left) * k), y: rd.top - (sr.top + (od.top - sr.top) * k), scale: k, transformOrigin: "0 0",
        duration, delay, ease, force3D: false,
        onComplete: () => {
          logo.style.visibility = "";
          gsap.to(stage, { opacity: 0, duration: 0.2, ease: "none", onComplete: () => { destroy(); resolve(); } });
        },
      });
    });
  }
  function skip() { if (master && master.progress() < 1) master.progress(1); }
  function destroy() {
    gsap.ticker.remove(tick);
    master?.kill();
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    cover.remove();
  }
  return { run, flyHome, skip, destroy };
}

/* ---- start, and the handle main.js waits on ---- */
if (ON) {
  let finish;
  const done = new Promise((resolve) => { finish = resolve; });
  let opening = null;
  const bail = (err) => {                        // anything wrong: no opening, the normal intro
    if (err) console.error("[opening]", err);
    opening?.destroy();
    opening = null;
    document.querySelector(".c-opening")?.remove();
    const lg = document.querySelector(".js-b-header__logo");
    if (lg) lg.style.visibility = "";
    document.documentElement.classList.remove("has-opening");
    finish();
  };
  try {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
    const cover = document.createElement("div");
    cover.className = "c-opening";
    cover.setAttribute("aria-hidden", "true");
    cover.innerHTML = '<div class="c-opening__stage"><div class="wm"><span class="db"></span><span class="slot"><span class="cc"><span class="c">c</span><span class="c">c</span></span><span class="art"></span></span></div></div>';
    document.body.prepend(cover);
    opening = createOpening(cover);
    const onSkip = (e) => { if (e.type === "keydown" && e.metaKey) return; opening?.skip(); };
    addEventListener("pointerdown", onSkip); addEventListener("keydown", onSkip);
    done.then(() => { removeEventListener("pointerdown", onSkip); removeEventListener("keydown", onSkip); });
    setTimeout(() => { opening?.skip(); finish(); }, MAX_WAIT);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      try { opening?.run(() => finish()); } catch (err) { bail(err); }
    });
  } catch (err) { bail(err); }
  window.siteOpening = {
    done,
    // main.js hands over the header logo once the page is ready; without an opening (it failed or
    // was cut short), it gets the plain logo intro instead
    flyHome: (opts) => (opening ? opening.flyHome(opts).catch((err) => { bail(err); }) : null),
    cancel: () => bail(),
  };
}
