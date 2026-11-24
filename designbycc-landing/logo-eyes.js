/* Logo eyes: poke the header logo and its "cc" turns into eyes that react, then morphs back into
   the letters. It arms once the intro has landed (main.js dispatches `site:intro-done`), so never
   during the opening. Explored in _swap-lab.html / _opening-site.html (local).

   Motion (animation-principles, motion-art-direction): a micro-interaction on a 19px mark, so
   short beats: saccades 0.12 s, blink 0.07 s, one reaction 1.5–1.9 s. The lab's two eases:
   ENTER (expo.out) for arrivals and snaps, ACCEL (power2.in) for the blink closing.
   The morph is the swap lab's: each c is a dark eyeball whose light pupil starts as the c's
   counter, pushed out through its mouth, and slides into the middle; back to cc through a blink.

   Pokes escalate (a new hover within ANNOY_WINDOW of the last one is a repeat poke):
     1 "huh?"   looks at the cursor, glances away, back at it, blinks
     2 "again?" heavy flat lids drop, an unimpressed stare at the cursor
     3+ "ugh"   lids down, a full eye roll, a narrow glare, a hard blink
   Mouse only ((hover: hover) and (pointer: fine)); nothing under reduced motion. */

const ENTER = "expo.out", ACCEL = "power2.in";
const ANNOY_WINDOW = 4;          // s: pokes closer than this count up; slower ones start over
const SVGNS = "http://www.w3.org/2000/svg";

const fine = matchMedia("(hover: hover) and (pointer: fine)");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

const logo = document.querySelector(".js-b-header__logo");
const wm = logo?.querySelector(".wordmark");
const cc = wm?.querySelector(".wordmark__cc");

// toC: 1 = the c pose, 0 = the eye; px/py: gaze, -1..1; lid: blink (1 = shut); flat: heavy lids
// (annoyed); narrow: squint; follow: 1 = the gaze tracks the cursor, 0 = scripted
const E = { toC: 1, px: 0, py: 0, lid: 0, flat: 0, narrow: 0, follow: 0 };
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
let svg = null, G = null, tl = null, armed = false, pokes = 0, lastPoke = -1e9;

function measure() {
  const cs = getComputedStyle(cc), size = parseFloat(cs.fontSize);
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
  const m = ctx.measureText("c");
  const fA = m.fontBoundingBoxAscent ?? size * 0.9, fD = m.fontBoundingBoxDescent ?? size * 0.25;
  const lr = logo.getBoundingClientRect(), sc = lr.width / logo.offsetWidth || 1;   // the logo's own scale, if any
  const eyes = [0, 1].map((i) => {
    const r = document.createRange(); r.setStart(cc.firstChild, i); r.setEnd(cc.firstChild, i + 1);
    const b = r.getBoundingClientRect();
    const x = (b.left - lr.left) / sc, top = (b.top - lr.top) / sc, h = b.height / sc;
    const base = top + (h - (fA + fD)) / 2 + fA;
    const l = x - m.actualBoundingBoxLeft, rr = x + m.actualBoundingBoxRight;
    const t = base - m.actualBoundingBoxAscent, bt = base + m.actualBoundingBoxDescent;
    return { cx: (l + rr) / 2, cy: (t + bt) / 2, rx: (rr - l) / 2, ry: (bt - t) / 2 };
  });
  const wgt = parseFloat(cs.fontWeight) || 400;
  const sw = size * (0.035 + 0.11 * Math.min(1, Math.max(0, (wgt - 100) / 800)));
  return { eyes, sw };
}

function build() {
  G = measure();
  svg?.remove();
  svg = document.createElementNS(SVGNS, "svg");
  Object.assign(svg.style, { position: "absolute", left: 0, top: 0, width: `${logo.offsetWidth}px`, height: `${logo.offsetHeight}px`,
    overflow: "visible", pointerEvents: "none", visibility: "hidden" });
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `<defs>${[0, 1].map((i) => `<clipPath id="lid-${i}"><rect class="lid"/></clipPath>`).join("")}</defs>` +
    [0, 1].map((i) => `<g data-eye="${i}" clip-path="url(#lid-${i})"><ellipse class="ball"/><ellipse class="pupil"/></g>`).join("");
  logo.appendChild(svg);
}

function render() {
  if (!svg) return;
  const ink = getComputedStyle(wm).color, bg = getComputedStyle(document.body).backgroundColor;
  const k = 1 - E.toC;                                  // 0 = the c, 1 = the eye
  // gaze: scripted (px, py) mixed with the cursor (each eye looks at it from its own centre)
  svg.querySelectorAll("[data-eye]").forEach((g) => {
    const i = +g.dataset.eye, e = G.eyes[i];
    const lag = i ? 0.94 : 1;                           // the second eye a hair behind: life
    const lr = logo.getBoundingClientRect(), sc = lr.width / logo.offsetWidth || 1;
    const dx = pointer.x - (lr.left + e.cx * sc), dy = pointer.y - (lr.top + e.cy * sc), d = Math.hypot(dx, dy) || 1;
    const reach = Math.min(1, d / 24);                  // close to the eye: a smaller look
    const fx = (dx / d) * reach, fy = (dy / d) * reach;
    const gx = (E.px + (fx - E.px) * E.follow) * lag, gy = (E.py + (fy - E.py) * E.follow) * lag;
    const open = 1 - 0.94 * E.lid, ry = e.ry * open * (1 - 0.22 * E.narrow);
    const counter = e.ry - G.sw, prC = counter * 1.02, prE = counter * 0.78, pr = prC + (prE - prC) * k;
    const travel = [e.rx - prE - G.sw * 0.3, e.ry - prE - G.sw * 0.3];
    const cPose = [e.cx + e.rx * 0.6, e.cy], ePose = [e.cx + gx * travel[0], e.cy + gy * travel[1]];
    const ball = g.querySelector(".ball"), pu = g.querySelector(".pupil");
    ball.setAttribute("fill", ink); pu.setAttribute("fill", bg);
    ball.setAttribute("cx", e.cx); ball.setAttribute("cy", e.cy); ball.setAttribute("rx", e.rx); ball.setAttribute("ry", ry);
    // heavy lids: the top of the eye cut flat, tilted down towards the face's middle (cross, not sad)
    const lid = svg.querySelector(`#lid-${i} .lid`), cut = e.cy - e.ry + 2 * e.ry * 0.42 * E.flat;
    let py = e.cy + (ePose[1] - e.cy) * k * open;
    py += Math.max(0, cut + pr * 0.95 - py) * E.flat;          // the pupil tucks in under the lid, whole
    pu.setAttribute("cx", cPose[0] + (ePose[0] - cPose[0]) * k);
    pu.setAttribute("cy", py);
    pu.setAttribute("rx", pr); pu.setAttribute("ry", pr * Math.max(0, 1 - E.lid * 1.15));
    lid.setAttribute("x", e.cx - e.rx * 2); lid.setAttribute("width", e.rx * 4);
    lid.setAttribute("y", cut); lid.setAttribute("height", e.ry * 4);
    lid.setAttribute("transform", `rotate(${(i ? -1 : 1) * 12 * E.flat} ${e.cx} ${cut})`);
  });
}

function eyesOn(on) {
  svg.style.visibility = on ? "visible" : "hidden";
  cc.style.color = on ? "transparent" : "";
}

// the cursor, eased (frame-rate normalised), so the eyes follow it smoothly
function tick(_, dt) {
  const a = 1 - Math.pow(0.7, dt / 16.67);
  pointer.x += (pointer.tx - pointer.x) * a; pointer.y += (pointer.ty - pointer.y) * a;
  if (tl?.isActive() && E.follow > 0) render();
}

const u = { onUpdate: render };
function morphIn(t, flat = 0) {
  tl.call(() => { Object.assign(E, { toC: 1, px: 0, py: 0, lid: 0, flat: 0, narrow: 0, follow: 0 }); render(); eyesOn(true); }, null, t);
  tl.to(E, { toC: 0, follow: 1, flat, duration: 0.22, ease: ENTER, ...u }, t);
  return t + 0.22;
}
function glance(t, x, y, hold) {
  tl.to(E, { px: x, py: y, follow: 0, duration: 0.12, ease: ENTER, ...u }, t);   // a saccade: fast, then still
  return t + 0.12 + hold;
}
function stare(t, hold) {                                // back on the cursor
  tl.to(E, { follow: 1, duration: 0.12, ease: ENTER, ...u }, t);
  return t + 0.12 + hold;
}
function blinkOut(t) {                                   // blink, and open as the cc
  tl.to(E, { px: 0, py: 0, follow: 0, duration: 0.1, ease: ENTER, ...u }, t);
  tl.to(E, { lid: 1, duration: 0.07, ease: ACCEL, ...u }, t + 0.06);
  t += 0.13;
  tl.call(() => { Object.assign(E, { toC: 1, flat: 0, narrow: 0 }); render(); }, null, t);
  tl.to(E, { lid: 0, duration: 0.16, ease: ENTER, ...u }, t + 0.04);
  tl.call(() => { eyesOn(false); }, null, t + 0.2);
  return t + 0.2;
}

function react(level) {
  tl?.kill();
  tl = gsap.timeline();
  let t = 0;
  if (level === 1) {                                     // "huh?"
    t = morphIn(t);
    t = stare(t, 0.3);
    t = glance(t, -0.9, -0.7, 0.28);
    t = stare(t, 0.22);
  } else if (level === 2) {                              // "again?"
    t = morphIn(t);
    t = stare(t, 0.15);
    tl.to(E, { flat: 1, duration: 0.16, ease: ENTER, ...u }, t);
    t = stare(t + 0.16, 0.55);
  } else {                                               // "ugh": an eye roll
    t = morphIn(t, 0.6);
    t = stare(t, 0.18);
    const roll = { a: 0 };
    tl.to(E, { follow: 0, duration: 0.1, ease: ENTER, ...u }, t);
    tl.fromTo(roll, { a: Math.PI * 0.95 }, { a: Math.PI * 2.05, duration: 0.55, ease: "sine.inOut", immediateRender: false,
      onUpdate: () => { E.px = Math.cos(roll.a); E.py = Math.sin(roll.a) * 0.9 - 0.1; render(); } }, t);   // left, up and over, right
    t += 0.55;
    tl.to(E, { flat: 1, narrow: 1, duration: 0.14, ease: ENTER, ...u }, t);
    t = stare(t, 0.4);
  }
  blinkOut(t);
}

function poke() {
  if (!armed) return;
  const now = performance.now() / 1000;
  if (tl?.isActive()) return;                            // one reaction at a time
  pokes = now - lastPoke < ANNOY_WINDOW ? pokes + 1 : 1;
  lastPoke = now;
  react(Math.min(pokes, 3));
}

function arm() {
  if (armed || !logo || !cc || reduced.matches) return;
  armed = true;
  build(); render();
  gsap.ticker.add(tick);
  addEventListener("pointermove", (e) => { pointer.tx = e.clientX; pointer.ty = e.clientY; }, { passive: true });
  logo.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse" || !fine.matches) return;
    pointer.x = pointer.tx = e.clientX; pointer.y = pointer.ty = e.clientY;
    poke();
  });
  addEventListener("resize", () => { if (!tl?.isActive()) { build(); render(); } });
}

document.addEventListener("site:intro-done", arm);
