/* The studio's Drawer tab (2026-11-27): another take on the Case studies card, next to the folder.
   CC's references: flat tabbed dividers (matte, staggered tabs, small mono labels), a file drawer
   pulled out towards you, and a file-drawer view in a direct, centred perspective.
   Closed, it is flat and shut: just the front panel, nothing peeking out (CC, 2026-11-27). A click slides the
   whole drawer towards you and the view opens into a one-point perspective (vanishing point centred
   above), so you look into the drawer and the dividers stand one behind the other. Hovering (tapping) a
   divider lifts it; the others get a light wash and drop a little. Flat and matte: no gloss, glass or
   gradients (CC: "move away from the polished 3D look"); the site's own simple palette.
   Real 3D (preserve-3d) for the drawer box; one number t (0 closed, 1 open) drives the slide, the
   spacing and the perspective together, so the move reads as one gesture. Sizes in u = 1% of the
   card's width. Studio only, not on the site. */
import { gsap } from "gsap";
import { createProtoTab, h } from "./proto.js";

export const DRAWER_DEFAULTS = {
  // card
  cardW: 589, ratio: 1.14, phoneW: 350, dribbble: true, pageBg: "#f2f2f2", cardBg: "#ffffff", showCard: false, showNeighbours: false, radius: 2.7,
  // drawer
  // taller, same width (CC, 2026-11-27)
  drawerW: 76, frontH: 54, baseY: 21, corner: 1.2, depth: 18,
  front: "#141414", inside: "#2a2a2a", ink: "#141414", label: true, handle: true,
  // the closed look (CC asked for three to compare, 2026-11-27): "cabinet", "card" or "tab"
  look: "cabinet", compare: true, frame: 2.4, frameColor: "#dcdcdc",
  // colours per look, so the three can be compared side by side (CC, 2026-11-27)
  // greyscale again, but light and crisp: near-whites, and a hairline edge on each file does the separating
  // (CC: the old greys were "so stale"; then "let's revisit greyscale styling")
  cabinetFront: "#141414", cabinetInside: "#2a2a2a", cabinetF1: "#ffffff", cabinetF2: "#f4f4f4", cabinetF3: "#e9e9e9",
  cardFront: "#ffffff", cardInside: "#ffffff", cardF1: "#ffffff", cardF2: "#f4f4f4", cardF3: "#e9e9e9",
  tabFront: "#141414", tabInside: "#2a2a2a", tabF1: "#ffffff", tabF2: "#f4f4f4", tabF3: "#e9e9e9",
  hairline: 0.11,   // the files' edge line (opacity of ink)
  // soft shadows between the layers, per look (CC asked for them on the index-card box; then 30% lighter)
  cabinetShadow: 0, cardShadow: 1, tabShadow: 0,
  // dividers
  // a margin each side, so the box's sloped walls show beside the files
  count: 3, divH: 46, inset: 6, tabW: 27, tabStyle: "index",
  // the tab number's type (CC: "give me a set of controls")
  // numbers centred in the tab (CC)
  numSize: 3.8, numWeight: 450, numTrack: -0.03, dotSize: 1.1, dotGap: 0.8, numPad: 2.4, numAlign: "centre",
  // tabs low and wide, like CC's reference (2026-11-28: "not too high yet visible enough", then "even lower a bit more"; was 7.5, then 5.5)
  tabH: 4.5, tabR: 1.4,
  // the tabs' shape and place, after CC's reference (2026-11-28): "ears" with soft S-curve shoulders,
  // wider, and spread over the middle of the file so neighbours overlap a little, like stacked index cards
  tabShape: "ear", tabShoulder: 3.2, tabSpread: 52,
  // the ear's rounding (CC's close-up, 2026-11-28): a generous round top corner, a soft hollow at the foot
  earTop: 1.7, earFoot: 1.2,
  div1: "#ffffff", div2: "#e4e4e4", div3: "#cdcdcd", div4: "#b8b8b8", div5: "#ffffff", div6: "#e4e4e4",
  // closed: flat and shut, the files sit fully behind the front (no peeking: CC)
  peekC: -7, stepC: 0,
  // hover the closed drawer: it nudges out a touch
  nudge: 0.08, hoverDur: 0.3,
  // and the files' tops peek out a crack (CC): ear tips only, each file behind a clear step higher, so
  // the tops read as a staircase like CC's reference (2026-11-28; was 0.6, a flat row)
  slit: 2, slitStep: 1.7,
  // open: the drawer slides towards you, the view opens into the perspective
  persp: 110, vpUp: 80, slideZ: 12, slideY: 2, gapO: 13, peekO: 3, openDur: 0.4, openEase: "power4.out",
  closeDur: 0.28, closeEase: "power3.inOut",   // quicker and stiffer all round (CC, 2026-11-27)
  knock: 1, frontBounce: 1,   // when it's fully open: a small knock against the stop; the front bounces a hair (CC)
  // the box: sides full height at the front, sloping down to a low back (as shares of the front's height)
  backH: 0.55, sideH: 0.98,
  // hover a divider: it lifts out, the others wash and drop
  // room off: only the hovered file lifts (CC). Soft: it floats up and hangs in the air, bobbing gently
  pull: 14, sink: 3, room: false, reach: true, reachGap: 0.4, lastLift: 8,
  // CC: file 2 swings up to the right, file 3 up to the left
  swing1: 0, swing2: 3, swing3: -3, swingX: 1.2,   // gentle: CC found 6° "way too much"
  wash: 0.5, washColor: "#ffffff", pullDur: 0.28, pullEase: "power4.out", bob: 0, bobTime: 2.6,   // no constant floating once it's up (CC)
  // Claude's additions on top: the lifted file leans after the pointer, its tab turns the accent
  // colour, and a file that's let go settles with a small spring
  // hovering the shut drawer: a speech bubble like the LinkedIn card's (CC, 2026-11-27)
  handleGrow: 0.6,   // hover: the pull thickens by this much (CC)
  bubble: true, bubbleTilt: -3, bubbleGap: 1.5, bubbleColor: "auto", bubbleTail: "trail",   // auto: ink on a white front, white on a dark one
  liftFill: true, liftColor: "#fdf1e8",   // the lifted file's highlight colour, the same for every file (CC)
  follow: 1, accentTab: true, accent: "#f76d18", dropEase: "back.out(1.2)",
  speed: 1,
};

// two ways to lift a file (CC: "soft motion of lifting up in the air" or "a quick fast float")
const FLOATS = [["Stiff", 0.28, "power4.out"], ["Soft float", 0.65, "power2.out"], ["Quick float", 0.3, "back.out(1.7)"]];
// the three closed looks: [id, name, front, inside]
const LOOKS = [["cabinet", "Cabinet drawer", "#141414", "#2a2a2a"], ["card", "Index-card box", "#ffffff", "#c9c9c9"], ["tab", "Drawer with a tab", "#141414", "#2a2a2a"]];
const PAPERS = [["Light greys", "#ffffff", "#f4f4f4", "#e9e9e9"], ["Paper", "#ffffff", "#f6f3ee", "#ece6dc"], ["Soft tints", "#ffffff", "#fbeee5", "#e9eef4"], ["Greys", "#ffffff", "#e4e4e4", "#cdcdcd"], ["White", "#ffffff", "#ffffff", "#ffffff"], ["Ink", "#141414", "#2e2e2e", "#474747"], ["Orange accent", "#ffffff", "#e4e4e4", "#f76d18"]];
const FRONTS = [["Ink", "#141414", "#2a2a2a"], ["White", "#ffffff", "#d9d9d9"], ["Grey", "#d6d6d6", "#bdbdbd"], ["Orange", "#f76d18", "#c4530f"]];

const light = (c) => { const n = parseInt(c.slice(1), 16); return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150; };
const lerp = (a, b, t) => a + (b - a) * t;
const NS = "http://www.w3.org/2000/svg";
// a closed outline through [x, y, r] points, each corner rounded by a true-looking circular arc of
// tangent length r (clamped to half of each side), so slopes and flats meet softly (the tab's ears)
const f2 = (n) => +n.toFixed(2);
function roundedPath(pts) {
  const n = pts.length, seg = [];
  for (let i = 0; i < n; i++) {
    const [px, py, r0] = pts[i], [ax, ay] = pts[(i - 1 + n) % n], [bx, by] = pts[(i + 1) % n];
    const li = Math.hypot(px - ax, py - ay), lo = Math.hypot(bx - px, by - py);
    const r = Math.min(r0 || 0, li / 2, lo / 2);
    if (r < 0.01) { seg.push([px, py]); continue; }
    const di = [(px - ax) / li, (py - ay) / li], dd = [(bx - px) / lo, (by - py) / lo];
    const th = Math.acos(Math.max(-1, Math.min(1, di[0] * dd[0] + di[1] * dd[1])));   // how far it turns
    const k = th < 1e-3 ? 0 : ((4 / 3) * Math.tan(th / 4)) / Math.tan(th / 2);
    const A = [px - di[0] * r, py - di[1] * r], B = [px + dd[0] * r, py + dd[1] * r];
    seg.push([A[0], A[1], A[0] + di[0] * r * k, A[1] + di[1] * r * k, B[0] - dd[0] * r * k, B[1] - dd[1] * r * k, B[0], B[1]]);
  }
  return seg.map((q, i) => (q.length === 2 ? `${i ? "L" : "M"}${f2(q[0])},${f2(q[1])}`
    : `${i ? "L" : "M"}${f2(q[0])},${f2(q[1])} C${f2(q[2])},${f2(q[3])} ${f2(q[4])},${f2(q[5])} ${f2(q[6])},${f2(q[7])}`)).join(" ") + " Z";
}

export const DRAWER_CSS = `
.dr-card { position:relative; flex:none; overflow:hidden; cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent; font-family:"Switzer", -apple-system, sans-serif; }
.dr-scene { position:absolute; inset:0; }
.dr-drawer, .dr-drawer * { transform-style:preserve-3d; }
.dr-drawer { position:absolute; }
.dr-drawer > * { position:absolute; left:0; top:0; }
.dr-div svg { display:block; overflow:visible; }
/* only a file's painted shape takes the mouse: the empty strip beside its tab must let the tab behind be hovered */
.dr-div, .dr-div * { pointer-events:none; }
.dr-div svg path { pointer-events:visiblePainted; }
.dr-tabtext { position:absolute; display:flex; align-items:center; white-space:nowrap; box-sizing:border-box; font-variant-numeric:tabular-nums; }
/* Index: a tiny mono N° and the number in Switzer */
/* (CC: "too small, a bit thin and weak": bigger and stronger) */
.dr-tab-index { justify-content:flex-start; gap:var(--dot-gap); padding-left:var(--n-pad); }
.dr-tab-centre { justify-content:center !important; padding-left:0 !important; }
.dr-tab-dot { width:var(--dot); height:var(--dot); border-radius:50%; background:currentColor; flex:none; }
.dr-tab-n { font-family:"Switzer", sans-serif; font-weight:var(--n-weight); font-size:var(--n-size); letter-spacing:var(--n-track); line-height:1; }
/* Fraction: 01/03, the total faded */
.dr-tab-fraction { justify-content:center; font-family:"Geist Mono", ui-monospace, monospace; font-size:calc(var(--n-size) * .66); letter-spacing:var(--n-track); }
.dr-tab-fraction b { font-weight:var(--n-weight); }
.dr-tab-of { opacity:.42; font-weight:500; }
/* Big numeral: a large, light Switzer number filling the tab */
.dr-tab-big { justify-content:flex-start; padding-left:var(--n-pad); font-family:"Switzer", sans-serif; font-weight:var(--n-weight); font-size:calc(var(--n-size) * 1.35); letter-spacing:calc(var(--n-track) - .02em); line-height:1; }
.dr-face { position:absolute; left:0; right:0; }
.dr-wash { position:absolute; inset:0; opacity:0; pointer-events:none; }
.dr-front { display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box; }
.dr-label { font-family:"Geist Mono", ui-monospace, monospace; letter-spacing:.08em; text-transform:uppercase; }
.dr-handle { align-self:center; }
.dr-bubble { position:absolute; pointer-events:none; z-index:2; will-change:transform; }
.dr-pill { border-radius:999px; white-space:nowrap; letter-spacing:-.01em; }
.dr-dot { position:absolute; border-radius:50%; }
`;

/* ---------------- one card ---------------- */
export function createDrawerCard(S, width, { touch = false } = {}) {
  // this look's colours (front, inside, files 1 to 3)
  const L = S.look;
  S = { ...S, front: S[`${L}Front`] ?? S.front, inside: S[`${L}Inside`] ?? S.inside, div1: S[`${L}F1`] ?? S.div1, div2: S[`${L}F2`] ?? S.div2, div3: S[`${L}F3`] ?? S.div3, layerShadow: S[`${L}Shadow`] ?? 0 };
  const u = width / 100, px = (v) => v * u;
  const W = width, H = Math.round(width * S.ratio);
  // the box ends just behind the last file, so in perspective the back stays hidden behind the files (with a deep
  // box the back rose above them as a slab: the "showing too much" CC saw); depth = the space behind the last file
  const FW = px(S.drawerW), FH = px(S.frontH), R = px(S.corner), D = px(S.gapO * (S.count - 0.4) + S.depth);
  const left = (W - FW) / 2, top = H - px(S.baseY) - FH;   // the front panel, in card space

  const card = h("div", { class: "dr-card", role: "button", tabindex: "0", "aria-expanded": "false", "aria-label": `Case studies, ${S.count} files`,
    style: `width:${W}px;height:${H}px;background:${S.showCard ? S.cardBg : "transparent"};border-radius:${px(S.radius)}px` });
  const scene = h("div", { class: "dr-scene" });
  const drawer = h("div", { class: "dr-drawer", style: `left:${left}px;top:${top}px;width:${FW}px;height:${FH}px` });
  // the cabinet look: a frame the drawer slides out of (static, behind the drawer)
  if (S.look === "cabinet") {
    const f = px(S.frame);
    scene.append(h("div", { style: `position:absolute;left:${left - f}px;top:${top - f}px;width:${FW + f * 2}px;height:${FH + f * 2}px;background:${S.frameColor};border-radius:${R + f * 0.6}px` }));
  }
  scene.append(drawer); card.append(scene);

  // the bubble: a pill with a tail of dots, in the LinkedIn card's style. It's blown out of thin air at the
  // pointer, dot by dot, and follows the mouse while it's over the shut drawer (CC). "trail": the dots chain
  // from the pointer to the pill, each lagging the one before, and the pill leans and squashes with speed
  // (CC: "the two smaller bubbles are weak … go wild"). "still": the dots ride with the pill. Mouse only.
  // it sits over the drawer, so it takes the opposite of the front's colour unless one is picked
  // (CC: black was "way too strong": on a white front it's a soft grey pill with a hairline edge)
  const bc = S.bubbleColor === "auto" || !S.bubbleColor ? (light(S.front) ? "#ececec" : "#ffffff") : S.bubbleColor, btext = light(bc) ? S.ink : "#ffffff";
  const edge = light(S.front) && light(bc) ? `box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)` : "";
  const dotSizes = S.bubbleTail === "none" ? [] : [1.8, 3.2, 4.8];   // pointer → pill
  const OFF = [[1.2, -1.6], [2.4, -2.8], [3, -3.4]], PILL_OFF = [1.6, -2.6];   // rest offsets (u), each from the one before
  let pill = null, dots = [];
  if (S.bubble && !touch) {
    pill = h("div", { class: "dr-pill dr-bubble", style: `left:0;top:0;height:${px(9)}px;line-height:${px(9)}px;padding:0 ${px(4)}px;font-size:${px(3.2)}px;background:${bc};color:${btext};${edge}` }, "Browse case studies");
    dots = dotSizes.map((d) => h("div", { class: "dr-dot dr-bubble", style: `left:${-px(d) / 2}px;top:${-px(d) / 2}px;width:${px(d)}px;height:${px(d)}px;background:${bc};${edge}` }));
    card.append(...dots, pill);
    gsap.set(pill, { scale: 0, transformOrigin: "0% 100%" }); gsap.set(dots, { scale: 0 });
  }
  const toCard = (e) => { const r = card.getBoundingClientRect(), k = W / (r.width || W); return [(e.clientX - r.left) * k, (e.clientY - r.top) * k]; };
  // the chain: target (the pointer) → dots → pill anchor (its bottom-left corner)
  const chain = { p: [0, 0], d: dotSizes.map(() => [0, 0]), q: [0, 0], v: [0, 0] };
  const restFrom = (x, y) => {
    let cx = x + px(S.bubbleGap), cy = y - px(S.bubbleGap);
    const d = dotSizes.map((_, i) => { cx += px(OFF[i][0]); cy += px(OFF[i][1]); return [cx, cy]; });
    return { d, q: [cx + px(PILL_OFF[0]), cy + px(PILL_OFF[1])] };
  };
  const ease = (a, dt) => 1 - Math.pow(1 - a, dt / 16.7);   // frame-rate independent lerp
  let shown = false, ticking = false;
  function tick(_, dt) {
    const wild = S.bubbleTail === "trail", [tx, ty] = chain.p;
    chain.d.forEach((d, i) => {
      const prev = i ? chain.d[i - 1] : [tx + px(S.bubbleGap), ty - px(S.bubbleGap)], o = OFF[i];
      const k = wild ? ease([0.55, 0.34, 0.26][i], dt) : 1;
      d[0] += (prev[0] + px(o[0]) - d[0]) * k; d[1] += (prev[1] + px(o[1]) - d[1]) * k;
    });
    const last = chain.d.length ? chain.d[chain.d.length - 1] : [tx + px(S.bubbleGap), ty - px(S.bubbleGap)];
    const k = wild ? ease(0.2, dt) : 1, qx = chain.q[0], qy = chain.q[1];
    chain.q[0] += (last[0] + px(PILL_OFF[0]) - chain.q[0]) * k; chain.q[1] += (last[1] + px(PILL_OFF[1]) - chain.q[1]) * k;
    // keep the pill inside the card
    const pw = pill.offsetWidth, ph = pill.offsetHeight;
    chain.q[0] = Math.max(px(1), Math.min(W - pw - px(1), chain.q[0])); chain.q[1] = Math.max(ph + px(1), chain.q[1]);
    const vx = (chain.q[0] - qx) / Math.max(1, dt / 16.7), vy = (chain.q[1] - qy) / Math.max(1, dt / 16.7), sp_ = Math.hypot(vx, vy) / u;
    chain.v = [vx, vy];
    dots.forEach((el, i) => gsap.set(el, { x: chain.d[i][0], y: chain.d[i][1] }));
    const look = { x: chain.q[0], y: chain.q[1] - ph, rotation: S.bubbleTilt + (wild ? Math.max(-14, Math.min(14, (vx / u) * 2.2)) : 0) };
    // the squash and stretch only while it settles at rest (scale belongs to the grow/pop tweens otherwise)
    if (wild && shown && !gsap.isTweening(pill)) Object.assign(look, { scaleX: 1 + Math.min(0.16, sp_ * 0.05), scaleY: 1 - Math.min(0.1, sp_ * 0.03) });
    gsap.set(pill, look);
    if (!shown && !gsap.isTweening(pill)) { gsap.ticker.remove(tick); ticking = false; }
  }
  const startTicking = () => { if (!ticking) { ticking = true; gsap.ticker.add(tick); } };
  function speak(on, e, pop) {
    if (!pill || on === shown) return;
    shown = on;
    const parts = [...dots, pill];   // pointer outwards
    if (on) {
      if (e) { const [x, y] = toCard(e); chain.p = [x, y]; const r = restFrom(x, y); chain.d = r.d; chain.q = r.q; }
      startTicking();
      // blown out of thin air: the smallest dot first, then each bigger one, then the pill
      gsap.fromTo(parts, { scale: 0 }, { scale: 1, duration: 0.42 / sp(), ease: "back.out(2.6)", stagger: 0.06 / sp(), overwrite: "auto" });
    } else if (pop) {
      // a click: everything pops, the pill first, the dots after it, gone into thin air as the drawer opens (CC)
      gsap.timeline({ overwrite: "auto" })
        .to([...parts].reverse(), { scale: 1.2, duration: 0.08 / sp(), ease: "power2.out", stagger: 0.04 / sp() })
        .to([...parts].reverse(), { scale: 0, duration: 0.14 / sp(), ease: "power3.in", stagger: 0.04 / sp() }, 0.08 / sp());
    } else gsap.to([...parts].reverse(), { scale: 0, duration: 0.22 / sp(), ease: "power2.in", stagger: 0.03 / sp(), overwrite: "auto" });
  }
  function trail(e) { if (pill && shown) { chain.p = toCard(e); startTicking(); } }
  scene.style.perspectiveOrigin = `${W / 2}px ${top - px(S.vpUp)}px`;

  // the box: back, floor, two walls (one colour, the walls a shade lighter so the box reads)
  // the box: back and sides at one height (sides taller than the back stuck up like spikes), low enough that
  // the back shows only a sliver above the files; a fine rim line along their top edges defines the container
  // against the page when the inside is light (CC: "audit and design check"), like the files' edge line
  const backPH = FH * S.backH, wallH = FH * S.sideH;
  // the sides slope down from full height at the front to the back's height (like a desk file organiser), so
  // they read as walls while the back stays low and hidden behind the files, with nothing sticking up
  const slope = `clip-path:polygon(0 0, 100% ${((1 - S.backH / S.sideH) * 100).toFixed(2)}%, 100% 100%, 0 100%)`;
  const rim = light(S.inside) && S.hairline ? `border-top:${Math.max(1, px(0.15))}px solid rgba(0,0,0,${(S.hairline * 0.9).toFixed(3)});box-sizing:border-box` : "";
  const plane = (w, hh, css) => h("div", { style: `width:${w}px;height:${hh}px;${css}` });
  // the box sits inside the front's rounded corners (CC: its edges showed through the corners)
  // one tone for the inside: back and sides the inside colour itself, the floor a whisper darker (CC wanted
  // the back white, not a separate grey block)
  const back = plane(FW - R * 2, backPH, `background:${S.inside};border-radius:${R}px;${rim}`);   // the back is the inside colour itself (CC: white)
  const floor = plane(FW - R * 2, D, `background:${S.inside};filter:brightness(.96)`);
  const wallL = plane(D, wallH, `background:${S.inside};${slope}`);
  const wallR = plane(D, wallH, `background:${S.inside};${slope}`);
  drawer.append(back, floor, wallL, wallR);

  // the dividers, back to front (n … 1): a card with a tab; the tab's place steps across, as in CC's reference
  const divs = [], inners = [], washes = [], faces = [], txs = [], labels = [], inks = [], svgs = [], paths = [], fills = [];
  const DW = FW - px(S.inset) * 2, TH = px(S.tabH), TW = (S.tabW / 100) * DW, DH = px(S.divH), tr = px(S.tabR);
  for (let c = S.count; c >= 1; c--) {
    const fill = S[`div${c}`] || "#ffffff", text = light(fill) ? S.ink : "#ffffff";
    const slots = S.count > 1 ? (c - 1) / (S.count - 1) : 0;
    // front file left, each one behind further right (as in CC's reference), spread over tabSpread % of the width,
    // centred; ears need room for their shoulders at the file's edges
    const ear = S.tabShape === "ear", sh = ear ? px(S.tabShoulder) : 0;
    const centre = (0.5 + (slots - 0.5) * (S.count > 1 ? S.tabSpread / 100 : 0)) * DW;
    const tx = Math.max(tr + sh / 2, Math.min(DW - TW - tr - sh / 2, centre - TW / 2));
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("width", DW); s.setAttribute("height", TH + DH); s.setAttribute("viewBox", `0 0 ${DW} ${TH + DH}`);
    const p = document.createElementNS(NS, "path");
    p.setAttribute("fill", fill);
    // a hairline along the top and the tab: crisp edges separate the light layers
    if (S.hairline) { p.setAttribute("stroke", `rgba(0,0,0,${S.hairline})`); p.setAttribute("stroke-width", Math.max(1, px(0.15))); p.setAttribute("vector-effect", "non-scaling-stroke"); }
    // the file's outline: its top with the tab. Ear (CC's reference): a sloped side with a round top
    // corner (earTop) and a soft hollow where it leaves the file's top (earFoot); TW is the width at half
    // height. Square: straight sides, small corners (tabR)
    const rt = ear ? px(S.earTop) : tr, rf = ear ? px(S.earFoot) : tr;
    p.setAttribute("d", roundedPath([[0, TH + DH, 0], [0, TH, tr],
      [tx - sh / 2, TH, rf], [tx + sh / 2, 0, rt], [tx + TW - sh / 2, 0, rt], [tx + TW + sh / 2, TH, rf],
      [DW, TH, tr], [DW, TH + DH, 0]]));
    s.append(p);
    // a soft shadow along the file's top edge, onto the file behind it (follows the tab's shape).
    // Inner layers only (CC): the back file has nothing behind it, so it casts none onto the page
    // (set per frame in place(): none while it only peeks, CC)
    svgs[c] = s; paths[c] = p; fills[c] = fill;
    // the tab's number, set in one of three styles (CC: "nice typography … re-design how to display them")
    const nn = String(c).padStart(2, "0"), all = String(S.count).padStart(2, "0");
    const label = h("div", { class: `dr-tabtext dr-tab-${S.tabStyle}${S.numAlign === "centre" ? " dr-tab-centre" : ""}`, style: `left:${tx}px;width:${TW}px;top:0;height:${TH}px;color:${text};--u:${u}px;--n-size:${px(S.numSize)}px;--n-weight:${S.numWeight};--n-track:${S.numTrack}em;--dot:${px(S.dotSize)}px;--dot-gap:${px(S.dotGap)}px;--n-pad:${px(S.numPad)}px` },
      ...(S.tabStyle === "fraction" ? [h("b", {}, nn), h("span", { class: "dr-tab-of" }, `/${all}`)]
        : S.tabStyle === "big" ? [h("span", {}, nn)]
        : [h("span", { class: "dr-tab-dot" }), h("span", { class: "dr-tab-n" }, nn)]));   // a dot, not "N°" (CC)
    // what you see when it's lifted: a title and a picture placeholder
    // the picture placeholder fills the face down to the bottom margin (CC: it looked cut short)
    const face = h("div", { class: "dr-face", style: `top:${TH + px(2.5)}px;bottom:${px(3)}px;padding:0 ${px(3)}px;color:${text};opacity:0;display:flex;flex-direction:column` },
      // the title sits on the right: the tabs of the files in front are to the left or the middle
      h("div", { style: `font-size:${px(3.6)}px;font-weight:500;letter-spacing:-.01em;text-align:right` }, `Case study ${c}`),
      h("div", { style: `margin-top:${px(2)}px;flex:1;border-radius:${px(0.8)}px;background:${text};opacity:.08` }));
    const wash = h("div", { class: "dr-wash", style: `background:${S.washColor};clip-path:path('${p.getAttribute("d").replace(/\s+/g, " ")}')` });
    const inner = h("div", { style: `position:relative;width:${DW}px;height:${TH + DH}px` }, s, label, face, wash);
    const el = h("div", { class: "dr-div", style: `left:${px(S.inset)}px;width:${DW}px;height:${TH + DH}px` }, inner);
    el.dataset.c = c;
    drawer.append(el);
    divs[c] = el; inners[c] = inner; washes[c] = wash; faces[c] = face; txs[c] = tx; labels[c] = label; inks[c] = text;
  }

  // the front panel, flat and matte, in one of three looks
  const onFront = light(S.front) ? S.ink : "#ffffff";
  let handleEl = null, handleH = 0;
  const pull = (w, hgt, css) => {
    if (!S.handle) return null;
    handleH = px(hgt);
    return (handleEl = h("div", { class: "dr-handle", style: `width:${px(w)}px;height:${px(hgt)}px;border-radius:${px(Math.max(hgt, 1) / 2)}px;${css}` }));
  };
  let front;
  if (S.look === "card") {
    // index-card box: a mono label, a big count, a thin pull line
    front = h("div", { class: "dr-front", style: `width:${FW}px;height:${FH}px;background:${S.front};border-radius:${R}px;padding:${px(3.5)}px ${px(4)}px;color:${onFront}` },
      h("div", {},
        S.label ? h("div", { class: "dr-label", style: `font-size:${px(2.2)}px` }, "Case studies") : null,
        h("div", { style: `font-size:${px(13)}px;font-weight:400;letter-spacing:-.03em;line-height:1;margin-top:${px(3)}px` }, String(S.count).padStart(2, "0"))),
      pull(18, 0.5, `background:${onFront}`));
  } else if (S.look === "tab") {
    // the drawer's own tab on top carries the label
    const tabH = px(6), tabW = px(26);
    front = h("div", { class: "dr-front", style: `width:${FW}px;height:${FH}px;background:${S.front};border-radius:0 ${R}px ${R}px ${R}px;padding:${px(3.5)}px ${px(4)}px;color:${onFront};justify-content:center` },
      h("div", { style: `position:absolute;left:0;top:${-tabH + 0.5}px;width:${tabW}px;height:${tabH}px;background:${S.front};border-radius:${px(1.6)}px ${px(1.6)}px 0 0;display:flex;align-items:center;padding-left:${px(3)}px;box-sizing:border-box` },
        S.label ? h("div", { class: "dr-label", style: `font-size:${px(2.1)}px` }, "Case studies") : null),
      pull(16, 2.6, `background:${onFront};opacity:.85`));
  } else {
    // cabinet drawer: a white label card in a holder, a recessed pull; the frame is drawn behind (below)
    const deep = light(S.front) ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.2)";
    front = h("div", { class: "dr-front", style: `width:${FW}px;height:${FH}px;background:${S.front};border-radius:${R}px;padding:${px(5)}px ${px(4)}px ${px(6)}px;color:${onFront};align-items:center` },
      S.label ? h("div", { style: `padding:${px(0.8)}px;border:${Math.max(1, px(0.35))}px solid ${deep};border-radius:${px(0.8)}px` },
        h("div", { class: "dr-label", style: `font-size:${px(2.1)}px;background:#ffffff;color:${S.ink};padding:${px(1.1)}px ${px(2.6)}px;border-radius:${px(0.4)}px` }, "Case studies")) : h("div"),
      pull(20, 3.4, `background:${deep};box-shadow:inset 0 ${Math.max(1, px(0.4))}px 0 rgba(0,0,0,.35)`));
  }
  front.style.position = "absolute";
  drawer.append(front);

  /* ---- the pose: t = 0 closed (flat), 1 open; it drives everything at once ---- */
  const pose = { t: 0, slit: 0, fb: 0, ftip: 0 };   // fb, ftip: the front's little nudge and tip at the stop   // slit: 0..1, the hover "opened a crack" peek
  function place() {
    const t = pose.t;
    // perspective: flat when closed (a very long lens), the direct view when open
    scene.style.perspective = `${px(S.persp) / Math.max(t, 0.002)}px`;
    gsap.set(drawer, { x: 0, y: px(S.slideY) * t, z: px(S.slideZ) * t });
    // and it only shows once the drawer really opens: a shut or hovered drawer has nothing behind its corners
    const boxIn = Math.max(0, Math.min(1, (t - S.nudge) / 0.12));   // (t can pass 1 a hair as it knocks)
    gsap.set(back, { x: R, y: FH - backPH - R * 0.5, z: -D, opacity: boxIn });
    gsap.set(floor, { x: R, y: FH - R, z: 0, rotationX: -90, transformOrigin: "50% 0%", opacity: boxIn });
    gsap.set(wallL, { x: R, y: FH - wallH - R * 0.5, z: 0, rotationY: 90, transformOrigin: "0% 50%", opacity: boxIn });
    gsap.set(wallR, { x: FW - R, y: FH - wallH - R * 0.5, z: 0, rotationY: 90, transformOrigin: "0% 50%", opacity: boxIn });
    gsap.set(front, { z: 0.5 + pose.fb, rotationX: pose.ftip, transformOrigin: "50% 100%" });
    // the front's shadow onto the first file: inside the drawer's width (negative spread) and only as it
    // opens, so a shut drawer casts nothing on the page (CC: inner layers only)
    if (S.layerShadow) front.style.boxShadow = t > 0.01 ? `0 ${-px(0.6)}px ${px(1.4)}px ${-px(0.7)}px rgba(0,0,0,${(0.091 * S.layerShadow * Math.min(1, t * 1.5)).toFixed(3)})` : "none";
    for (let c = 1; c <= S.count; c++) {
      // closed: stepped up like a flat stack; open: one behind the other in depth
      // shut (peekC ≤ 0): fully hidden behind the front, whatever the tab height (a taller tab once peeked out)
      const raw = -px(S.peekC) - (c - 1) * px(S.stepC);
      const topC = S.peekC <= 0 ? Math.max(raw, px(S.tabH) + px(1)) : raw, topO = -px(S.peekO);
      // the hover nudge moves only the drawer: the files start to rise once it really opens
      const tf = Math.max(0, (t - S.nudge) / (1 - S.nudge));
      const z = -lerp(px(0.3) * c, px(S.gapO) * (c - 0.4), t);
      // hovering the shut drawer: the files' tops peek out a crack, each one behind a touch higher
      const crack = -(px(S.slit) + (c - 1) * px(S.slitStep)) * pose.slit * (1 - tf);
      gsap.set(divs[c], { y: lerp(topC, topO, tf) - px(S.tabH) + crack, z });
      // while it only peeks, the slivers are plain shapes ("something is inside"); the labels come with the opening
      gsap.set(labels[c], { opacity: Math.min(1, tf * 3) });
      // and they're light: no shadow and a faint edge until it opens (CC: "reduce these shadows … lighter")
      const k = Math.min(1, tf * 1.5);
      svgs[c].style.filter = S.layerShadow && c < S.count && k > 0.01 ? `drop-shadow(0 ${-px(0.35)}px ${px(1)}px rgba(0,0,0,${(0.07 * S.layerShadow * k).toFixed(3)}))` : "none";
      // the edge line stays: a near-white file on the near-white page needs it to be seen (CC: the 2nd tab vanished)
      if (S.hairline) paths[c].setAttribute("stroke", `rgba(0,0,0,${S.hairline})`);
    }
  }

  const st = { open: false, pulled: 0, hover: false };
  let lastPointer = null;
  let bob = null, bobbing = 0;
  const sp = () => Math.max(0.05, S.speed);
  function render(kind) {
    const target = st.open ? 1 : st.hover && !touch ? S.nudge : 0;
    const [d, e] = kind === "open" ? [S.openDur, S.openEase] : kind === "close" ? [S.closeDur, S.closeEase] : kind === "hover" ? [S.hoverDur, "power2.out"] : [S.pullDur, S.pullEase];
    const slit = st.hover && !st.open && !touch ? 1 : 0;
    // opening: the knock is part of the move, with no pause (CC): the drawer runs a hair past fully open, springs
    // straight back, and the files jiggle at that same instant
    gsap.killTweensOf(pose);
    if (kind === "open" && S.knock) {
      const k = S.knock, arrive = (d * 0.8) / sp();
      gsap.timeline({ onUpdate: place })
        .to(pose, { t: 1 + 0.002 * k, slit, duration: arrive, ease: e, onUpdate: place })
        .add(knock, arrive - 0.01 / sp())
        // against the runner's stop: a faint, quick settle
        .to(pose, { t: 1, duration: 0.1 / sp(), ease: "power2.out", onUpdate: place }, arrive);
    } else gsap.to(pose, { t: target, slit, duration: kind ? d / sp() : 0, ease: e, overwrite: true, onUpdate: place });
    if (!kind) { pose.t = target; pose.slit = slit; place(); }
    card.setAttribute("aria-expanded", String(st.open));
    speak(st.hover && !st.open, lastPointer, kind === "open");
    // the pull thickens a little under the mouse, as if inviting a pull (CC)
    if (handleEl) gsap.to(handleEl, { height: handleH + (st.hover && !st.open && !touch ? px(S.handleGrow) : 0), duration: (kind ? 0.3 : 0) / sp(), ease: "power2.out", overwrite: "auto" });
    for (let c = 1; c <= S.count; c++) {
      const lifted = st.pulled === c, other = st.pulled && !lifted;
      // the lifted file rises only up to the tab of the file behind it, so that tab stays in view and
      // can be hovered next (CC, 2026-11-27); files in front of it drop a little, the ones behind stay
      const y = lifted ? -liftFor(c) : other ? (c > st.pulled && S.room ? -px(S.pull) : 0) + (c < st.pulled || !S.reach ? px(S.sink) : 0) : 0;
      // a swing as it lifts (per file, CC: file 2 "sway out to the right, like a lifted right curve swing up"):
      // positive degrees raise the right side, pivoting on the bottom left, and drift it right
      const deg = lifted ? S[`swing${c}`] || 0 : 0;
      const letGo = !lifted && divs[c].classList.contains("on");   // was lifted, now settles back with a little spring
      gsap.to(inners[c], { y, x: px(S.swingX) * deg / 3, rotation: -deg, transformOrigin: deg >= 0 ? "0% 100%" : "100% 100%",
        duration: kind ? (lifted ? S.pullDur * 1.25 : S.pullDur) / sp() : 0, ease: letGo ? S.dropEase : S.pullEase, overwrite: "auto" });
      if (S.accentTab) gsap.to(labels[c], { color: lifted ? S.accent : inks[c], duration: kind ? 0.3 / sp() : 0, ease: "power2.out", overwrite: true });
      // the lifted file takes one highlight colour, whichever file it is, so hover looks the same on all (CC)
      if (S.liftFill) gsap.to(paths[c], { attr: { fill: lifted ? S.liftColor : fills[c] }, duration: kind ? 0.25 / sp() : 0, ease: "power2.out", overwrite: "auto" });
      gsap.to(washes[c], { opacity: other ? S.wash : 0, duration: kind ? S.pullDur / sp() : 0, ease: "power2.out", overwrite: true });
      gsap.to(faces[c], { opacity: lifted ? 1 : 0, duration: kind ? S.pullDur / sp() : 0, ease: "power2.out", overwrite: true });   // its title shows once it's lifted
      divs[c].classList.toggle("on", lifted);
    }
    // mid air: the lifted file bobs gently once it's up (yPercent, so it adds to the lift's y)
    if (bobbing !== st.pulled) {
      if (bob) { bob.kill(); bob = null; }
      if (bobbing && inners[bobbing]) gsap.to(inners[bobbing], { yPercent: 0, duration: 0.4 / sp(), ease: "sine.out" });
      bobbing = st.pulled;
      if (bobbing && kind && S.bob) bob = gsap.to(inners[bobbing], { yPercent: -S.bob, duration: S.bobTime / 2 / sp(), ease: "sine.inOut", yoyo: true, repeat: -1, delay: S.pullDur * 0.8 / sp() });
    }
  }
  // how far file c may lift (in its own px) before it covers the tab of the file behind it
  function liftFor(c) {
    const full = px(S.pull), behind = divs[c + 1];
    if (!S.reach || !st.open) return full;
    if (!behind) return Math.min(full, px(S.lastLift));   // the back file: nothing to stop at, so a lift like the others' (CC)
    const a = divs[c].getBoundingClientRect(), b = behind.getBoundingClientRect();
    const sa = a.height / (TH + DH), sb = b.height / (TH + DH);   // on-screen scale of each (perspective)
    if (!sa) return full;
    const room = (a.top - b.top + TH * (sa - sb)) / sa - px(S.reachGap);
    // a swing raises one side: leave room for it under the next file's tab
    const deg = S[`swing${c}`] || 0, sin = Math.sin((Math.abs(deg) * Math.PI) / 180);
    const reachX = deg > 0 ? txs[c + 1] + TW + px(S.swingX) * deg / 3 : DW - txs[c + 1] - px(S.swingX) * deg / 3;
    const raise = deg ? Math.max(0, reachX) * sin : 0;
    return Math.max(0, Math.min(full, room - raise));
  }
  // fully open: it hits the runner's stop. A small recoil of the drawer, and the files, carried by their
  // momentum, jiggle forward and settle back one after another (CC: "hit the drawer nail")
  function knock() {
    if (!S.knock || !st.open) return;
    const k = S.knock;   // (the drawer's own bounce is in the open move itself)
    // the front cover bounces a hair towards you and back, very very subtly (CC)
    gsap.timeline({ onUpdate: place })
      // with the same quick tip on its bottom edge as the files (CC: "this panel should have the same effect")
      .to(pose, { fb: px(0.05) * k * S.frontBounce, ftip: -0.35 * k * S.frontBounce, duration: 0.03 / sp(), ease: "power2.out" })   // (CC: a very quick tip, barely there)
      .to(pose, { fb: 0, ftip: 0, duration: 0.06 / sp(), ease: "sine.out" });
    // like papers standing in a drawer: momentum tips them forward on their bottom edge, they swing back a
    // little less, and settle; each at a slightly different rate, so they don't move as one block (CC: "more
    // natural"). A damped swing, not an up-down jiggle
    for (let c = 1; c <= S.count; c++) {
      // (CC: "not even noticeable but a hint of a faint bounce, very fast and subtle")
      const a = -0.35 * k * (1 - (c - 1) * 0.12), r = 1 + (c - 1) * 0.08;   // a quick tip and back: no swing
      gsap.set(inners[c], { transformOrigin: "50% 100%" });
      gsap.timeline()
        .to(inners[c], { rotationX: a, duration: 0.03 * r / sp(), ease: "power2.out" })
        .to(inners[c], { rotationX: 0, duration: 0.06 * r / sp(), ease: "sine.out" });
    }
  }
  render();
  const change = (next, kind) => { Object.assign(st, next); render(kind); };

  // input, as with the folder: a click opens and closes; hover (tap) a divider to lift it
  const divAt = (e) => e.target.closest?.(".dr-div");
  let downAt = null;
  card.addEventListener("pointerdown", (e) => { downAt = [e.clientX, e.clientY]; }, true);
  card.addEventListener("click", (e) => {
    if (api.held || (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6)) return;
    const dv = divAt(e);
    if (!st.open) change({ open: true, pulled: 0 }, "open");
    else if (dv) { if (touch) change({ pulled: +dv.dataset.c === st.pulled ? 0 : +dv.dataset.c }, "pull"); }   // on the site: opens that case study
    else change({ open: false, pulled: 0 }, "close");
  });
  card.addEventListener("keydown", (e) => {
    if (api.held || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault(); change({ open: !st.open, pulled: 0 }, st.open ? "close" : "open");
  });
  const outside = (e) => { if (st.open && !api.held && !card.contains(e.target)) change({ open: false, pulled: 0 }, "close"); };
  document.addEventListener("pointerdown", outside);
  if (!touch) {
    card.addEventListener("pointerenter", (e) => { lastPointer = e; if (e.pointerType === "mouse" && !api.held) change({ hover: true }, "hover"); });
    card.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !api.held) change({ hover: false, pulled: 0 }, st.open ? "pull" : "hover"); });
    card.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { lastPointer = e; trail(e); } });
    // the lifted file leans a little after the pointer, on top of its swing
    card.addEventListener("pointermove", (e) => {
      if (api.held || !st.pulled || !S.follow || e.pointerType !== "mouse") return;
      const c = st.pulled, r = divs[c].getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      gsap.to(inners[c], { rotation: -(S[`swing${c}`] || 0) + dx * S.follow, duration: 0.6 / sp(), ease: "power3.out", overwrite: "auto" });
    });
    card.addEventListener("pointerover", (e) => {
      if (api.held || !st.open) return;
      const dv = divAt(e);
      if (dv && +dv.dataset.c !== st.pulled) change({ pulled: +dv.dataset.c }, "pull");
    });
    card.addEventListener("pointerout", (e) => {
      if (api.held || !st.pulled) return;
      const from = divAt(e), to = e.relatedTarget?.closest?.(".dr-div");
      if (from && +from.dataset.c === st.pulled && !to) change({ pulled: 0 }, "pull");
    });
  }

  const api = {
    el: card, held: false,
    to(state, animate = true) {
      const next = { open: false, pulled: 0, hover: false, ...state };
      const kind = next.open !== st.open ? (next.open ? "open" : "close") : "pull";
      change(next, animate ? kind : undefined);
    },
    get state() { return { ...st }; },
    kill() { bob?.kill(); gsap.ticker.remove(tick); gsap.killTweensOf(scene); pill && gsap.killTweensOf([pill, ...dots]); document.removeEventListener("pointerdown", outside); gsap.killTweensOf([pose, ...inners.filter(Boolean), ...washes.filter(Boolean), ...faces.filter(Boolean)]); },
  };
  return api;
}

/* ---------------- the tab ---------------- */
export function createDrawer({ canvas, onZoom }) {
  // CC (2026-11-27): only the hovered file lifts, so drop any saved "files behind move up too"
  // and start the lift from the soft timing (its values were missing before, so it jumped)
  try { const k = "studio-drawer-1", v = JSON.parse(localStorage.getItem(k) || "{}"); ["room", "pullDur", "pullEase", "washColor", "frontH", "divH", "baseY", "ratio", "slideY", "swing1", "swing2", "swing3", "swingX", "follow", "wash", "bob", "bobTime", "slit", "slitStep", "bob", "cabinetF2", "cabinetF3", "cardF2", "cardF3", "cardInside", "tabF2", "tabF3", "tabW", "openDur", "openEase", "closeDur", "closeEase", "hoverDur", "dropEase", "knock", "frontBounce", "cabinetF2", "cabinetF3", "cardF2", "cardF3", "cardInside", "tabF2", "tabF3", "tabH", "tabR", "hairline", "cardInside", "backH", "sideH", "depth", "inset", "earTop", "earFoot", "tabShoulder"].forEach((x) => delete v[x]); localStorage.setItem(k, JSON.stringify(v)); } catch {}
  return createProtoTab({
    canvas, onZoom, id: "drawer", css: DRAWER_CSS,
    title: "Case studies drawer",
    about: "A second idea for the Case studies card: flat when closed, a click slides the drawer towards you into a direct perspective. Not on the site; the folder stays there until you choose. Settings stay in this browser. Placeholder names.",
    hint: "Click a drawer to open it · hover a file · click the drawer or outside to close · drag to move, ⌘ + scroll to zoom",
    defaults: DRAWER_DEFAULTS, storeKey: "studio-drawer-1",
    // CC: "design all 3 in the canvas for me to see them side by side"
    // Dribbble's 4:3 (CC: "suitable for Dribbble upload … so that I can record and upload them"), close together
    frameGap: 40,
    frames: (S) => {
      // in a Dribbble frame the card is drawn larger (it fills the frame's height), so the drawer reads in the shot
      const box = S.dribbble ? [1200, 900] : null, note = S.dribbble ? "Dribbble 4:3, click to open" : "click to open";
      const w = S.dribbble ? Math.round(880 / S.ratio) : S.cardW;
      if (S.compare) return LOOKS.map(([look, name]) => ({ name, w, touch: false, note, over: { look }, box }));
      return S.dribbble ? [{ name: LOOKS.find((l) => l[0] === S.look)[1], w, touch: false, note, box }] : null;
    },
    createCard: createDrawerCard,
    states: [
      ["live", "Live", "Hover and click as on the site"],
      ["closed", "Closed", "Flat and shut"],
      ["open", "Open", "After a click: slid out towards you"],
      ...[1, 2, 3, 4, 5, 6].map((c) => [`pull${c}`, `Case study ${c} lifted`, "Hovering that file"]),
    ],
    stateOf: (id) => (id === "closed" ? {} : id === "open" ? { open: true } : { open: true, pulled: +id.slice(4) }),
    playSteps: (S) => [[{ open: true }, 1.4], ...[...Array(S.count).keys()].map((i) => [{ open: true, pulled: i + 1 }, 1.1]), [{ open: true }, 0.9], [{}, 1]],
    sections: ({ S, set, num, color, ease, toggle, swatches, sec, h: hh }) => [
      sec("Closed look", ["look", "compare", "dribbble", "frame"],
        swatches(LOOKS.map(([look, name]) => [name, S[`${look}Front`], look]), ([, look]) => set("look", look), ([, look]) => S.look === look),
        hh("div", { class: "chips" }, toggle("compare", "Show all three side by side"), toggle("dribbble", "Dribbble frames (4:3)")),
        num("frame", "Cabinet frame", 0, 8, 0.1)),
      ...LOOKS.map(([look, name]) => sec(`Colours: ${name}`, [`${look}Front`, `${look}Inside`, `${look}F1`, `${look}F2`, `${look}F3`, `${look}Shadow`, ...(look === "cabinet" ? ["frameColor"] : [])],
        swatches(FRONTS, ([f, i]) => { S[`${look}Inside`] = i; set(`${look}Front`, f); }, ([f]) => S[`${look}Front`] === f),
        color(`${look}Front`, "Front"), color(`${look}Inside`, "Inside"), look === "cabinet" ? color("frameColor", "Frame") : null,
        swatches(PAPERS, ([a, b, c]) => { S[`${look}F1`] = a; S[`${look}F2`] = b; set(`${look}F3`, c); }, ([a, b, c]) => S[`${look}F1`] === a && S[`${look}F2`] === b && S[`${look}F3`] === c),
        color(`${look}F1`, "File 1"), color(`${look}F2`, "File 2"), color(`${look}F3`, "File 3"),
        num(`${look}Shadow`, "Layer shadows", 0, 3, 0.05))),
      sec("Drawer", ["drawerW", "frontH", "baseY", "corner", "depth", "backH", "sideH", "label", "handle", "handleGrow"],
        num("drawerW", "Width", 40, 95, 1, "%"), num("frontH", "Front height", 15, 70, 0.5, "%"), num("baseY", "From bottom", 0, 40, 0.5, "%"),
        num("depth", "Space behind the files", 0, 40, 0.5), num("sideH", "Sides, at the front", 0.4, 1.1, 0.01, "× front"), num("backH", "Back height", 0.2, 1, 0.01, "× front"), num("corner", "Corners", 0, 6, 0.1),
        hh("div", { class: "chips" }, toggle("label", "Label"), toggle("handle", "Handle")), num("handleGrow", "Hover: handle thickens", 0, 3, 0.05)),
      sec("Tabs: shape and place", ["tabShape", "tabW", "tabH", "tabShoulder", "earTop", "earFoot", "tabSpread", "tabR"],
        hh("div", { class: "chips" }, ...[["ear", "Ears (curved)"], ["square", "Square"]].map(([v, n]) => {
          const b = hh("button", { class: "chip", onclick: () => set("tabShape", v) }, n); b.setAttribute("aria-pressed", String(S.tabShape === v)); return b; })),
        num("tabW", "Tab width", 10, 60, 1, "%"), num("tabH", "Tab height", 2, 12, 0.5),
        num("tabShoulder", "Slope of the sides", 0, 8, 0.1), num("earTop", "Top corners", 0, 5, 0.1), num("earFoot", "Hollow at the foot", 0, 5, 0.1),
        num("tabSpread", "Spread across", 0, 100, 1, "%"),
        num("tabR", "File corners", 0, 4, 0.1)),
      sec("Tab number", ["numAlign", "numSize", "numWeight", "numTrack", "dotSize", "dotGap", "numPad"],
        hh("div", { class: "chips" }, ...[["left", "Left"], ["centre", "Centre"]].map(([v, n]) => {
          const b = hh("button", { class: "chip", onclick: () => set("numAlign", v) }, n); b.setAttribute("aria-pressed", String(S.numAlign === v)); return b; })),
        num("numSize", "Size", 1.5, 7, 0.1), num("numWeight", "Weight", 300, 700, 10), num("numTrack", "Letter spacing", -0.1, 0.15, 0.005, "em"),
        num("dotSize", "Dot size", 0, 3, 0.05), num("dotGap", "Dot gap", 0, 3, 0.05), num("numPad", "Left padding", 0, 6, 0.1)),
      sec("Files", ["tabStyle", "hairline", "count", "divH", "inset", "ink"],
        hh("div", { class: "chips" }, ...[["index", "● 01"], ["fraction", "01/03"], ["big", "Big 01"]].map(([v, n]) => {
          const b = hh("button", { class: "chip", onclick: () => set("tabStyle", v) }, n); b.setAttribute("aria-pressed", String(S.tabStyle === v)); return b; })),
        num("count", "How many", 1, 6, 1), color("ink", "Text"), num("hairline", "Edge line", 0, 0.4, 0.01),
        num("divH", "Height", 15, 70, 0.5), num("inset", "Side margin", 0, 15, 0.5),
        hh("div")),
      sec("Hover: the bubble", ["bubble", "bubbleTail", "bubbleTilt", "bubbleGap", "bubbleColor"],
        hh("div", { class: "chips" }, toggle("bubble", "Show “Browse case studies”")),
        hh("div", { class: "chips" }, ...[["trail", "Tail: a lively trail"], ["still", "Tail: still dots"], ["none", "No tail"]].map(([v, n]) => {
          const b = hh("button", { class: "chip", onclick: () => set("bubbleTail", v) }, n); b.setAttribute("aria-pressed", String(S.bubbleTail === v)); return b; })),
        num("bubbleTilt", "Tilt", -15, 15, 0.5, "°"), num("bubbleGap", "Distance from the pointer", 0, 10, 0.1),
        hh("div", { class: "chips" }, hh("button", { class: "chip", onclick: () => set("bubbleColor", "auto") }, "Colour: automatic")), color("bubbleColor", "Colour")),
      sec("Closed: flat and shut", ["peekC", "stepC", "nudge", "slit", "slitStep", "hoverDur"],
        num("peekC", "Files show", -15, 20, 0.5), num("stepC", "Step up", 0, 15, 0.5),
        num("nudge", "Hover nudges out", 0, 0.4, 0.01), num("slit", "Hover: files peek", 0, 15, 0.5), num("slitStep", "Each behind, higher", 0, 5, 0.1),
        num("hoverDur", "Hover time", 0.1, 1.5, 0.05, "s")),
      sec("Click: slides out towards you", ["persp", "vpUp", "slideZ", "slideY", "gapO", "peekO", "openDur", "openEase", "knock", "frontBounce", "closeDur", "closeEase"],
        num("persp", "Perspective", 40, 600, 5), num("vpUp", "Look from above", -20, 120, 1),
        num("slideZ", "Comes towards you", 0, 60, 0.5), num("slideY", "Moves down", -20, 30, 0.5),
        num("gapO", "Space between files", 0, 25, 0.5), num("peekO", "Files show", -10, 30, 0.5),
        num("openDur", "Open time", 0.1, 2.5, 0.05, "s"), ease("openEase", "Open ease"), num("knock", "Hits the stop", 0, 3, 0.05), num("frontBounce", "Front bounces", 0, 4, 0.05), num("closeDur", "Close time", 0.1, 2, 0.05, "s"), ease("closeEase", "Close ease")),
      sec("Hover a file: it lifts out", ["pull", "sink", "reach", "reachGap", "lastLift", "swing1", "swing2", "swing3", "swingX", "follow", "dropEase", "accentTab", "accent", "liftFill", "liftColor", "room", "wash", "washColor", "pullDur", "pullEase", "bob", "bobTime"],
        num("pull", "Lift", 0, 40, 0.5), num("sink", "Others drop", 0, 15, 0.5),
        hh("div", { class: "chips" }, toggle("reach", "Stop below the next tab"), toggle("room", "Files behind move up too")),
        num("reachGap", "Gap to that tab", 0, 4, 0.1), num("lastLift", "Back file lifts", 0, 30, 0.5),
        num("swing1", "File 1 swings", -15, 15, 0.5, "°"), num("swing2", "File 2 swings", -15, 15, 0.5, "°"), num("swing3", "File 3 swings", -15, 15, 0.5, "°"),
        num("swingX", "Swing drifts", 0, 10, 0.1),
        num("follow", "Leans after the mouse", 0, 8, 0.1, "°"), ease("dropEase", "Settles back"),
        hh("div", { class: "chips" }, toggle("accentTab", "Tab turns orange"), toggle("liftFill", "Lifted file highlight")), color("accent", "Tab colour"), color("liftColor", "Highlight colour"), num("wash", "Others wash", 0, 1, 0.01), color("washColor", "Wash colour"),
        hh("div", { class: "chips" }, ...FLOATS.map(([name, d, e]) => { const b = hh("button", { class: "chip", onclick: () => { S.pullEase = e; set("pullDur", d); } }, name); return b; })),
        num("pullDur", "Time", 0.1, 1.5, 0.05, "s"), ease("pullEase", "Ease"),
        num("bob", "Mid-air bob", 0, 5, 0.1, "%"), num("bobTime", "Bob time", 1, 6, 0.1, "s")),
      sec("Card and page", ["pageBg", "ratio", "showCard", "showNeighbours"],
        color("pageBg", "Page"), num("ratio", "Height", 0.6, 1.6, 0.01, "× width"),
        hh("div", { class: "chips" }, toggle("showCard", "Card background"), toggle("showNeighbours", "Cards beside it"))),
    ],
  });
}
