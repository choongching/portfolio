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
  cardW: 589, ratio: 1.14, phoneW: 350, pageBg: "#f2f2f2", cardBg: "#ffffff", showCard: false, showNeighbours: false, radius: 2.7,
  // drawer
  drawerW: 76, frontH: 54, baseY: 21,   // taller, same width (CC, 2026-11-27) corner: 1.2, depth: 66,
  front: "#141414", inside: "#2a2a2a", ink: "#141414", label: true, handle: true,
  // the closed look (CC asked for three to compare, 2026-11-27): "cabinet", "card" or "tab"
  look: "cabinet", compare: true, frame: 2.4, frameColor: "#dcdcdc",
  // colours per look, so the three can be compared side by side (CC, 2026-11-27)
  cabinetFront: "#141414", cabinetInside: "#2a2a2a", cabinetF1: "#ffffff", cabinetF2: "#e4e4e4", cabinetF3: "#cdcdcd",
  cardFront: "#ffffff", cardInside: "#c9c9c9", cardF1: "#ffffff", cardF2: "#e4e4e4", cardF3: "#cdcdcd",
  tabFront: "#141414", tabInside: "#2a2a2a", tabF1: "#ffffff", tabF2: "#e4e4e4", tabF3: "#cdcdcd",
  // soft shadows between the layers, per look (CC asked for them on the index-card box)
  cabinetShadow: 0, cardShadow: 1, tabShadow: 0,
  // dividers
  count: 3, divH: 46, inset: 1.5, tabW: 30, tabH: 6, tabR: 1.2,
  div1: "#ffffff", div2: "#e4e4e4", div3: "#cdcdcd", div4: "#b8b8b8", div5: "#ffffff", div6: "#e4e4e4",
  // closed: flat and shut, the files sit fully behind the front (no peeking: CC)
  peekC: -7, stepC: 0,
  // hover the closed drawer: it nudges out a touch
  nudge: 0.08, hoverDur: 0.45, slit: 4.5, slitStep: 1.2,   // and the files' tops peek out a crack (CC)
  // open: the drawer slides towards you, the view opens into the perspective
  persp: 110, vpUp: 80, slideZ: 12, slideY: 2, gapO: 13, peekO: 3, openDur: 0.55, openEase: "power3.out",
  closeDur: 0.4, closeEase: "power3.inOut",
  // hover a divider: it lifts out, the others wash and drop
  // room off: only the hovered file lifts (CC). Soft: it floats up and hangs in the air, bobbing gently
  pull: 14, sink: 3, room: false, reach: true, reachGap: 0.4, lastLift: 8,
  // CC: file 2 swings up to the right, file 3 up to the left
  swing1: 0, swing2: 3, swing3: -3, swingX: 1.2,   // gentle: CC found 6° "way too much"
  wash: 0.5, washColor: "#ffffff", pullDur: 0.65, pullEase: "power2.out", bob: 1.4, bobTime: 2.6,
  // Claude's additions on top: the lifted file leans after the pointer, its tab turns the accent
  // colour, and a file that's let go settles with a small spring
  follow: 1, accentTab: true, accent: "#f76d18", dropEase: "back.out(1.6)",
  speed: 1,
};

// two ways to lift a file (CC: "soft motion of lifting up in the air" or "a quick fast float")
const FLOATS = [["Soft float", 0.65, "power2.out"], ["Quick float", 0.3, "back.out(1.7)"]];
// the three closed looks: [id, name, front, inside]
const LOOKS = [["cabinet", "Cabinet drawer", "#141414", "#2a2a2a"], ["card", "Index-card box", "#ffffff", "#c9c9c9"], ["tab", "Drawer with a tab", "#141414", "#2a2a2a"]];
const PAPERS = [["Greys", "#ffffff", "#e4e4e4", "#cdcdcd"], ["White", "#ffffff", "#ffffff", "#ffffff"], ["Ink", "#141414", "#2e2e2e", "#474747"], ["Orange accent", "#ffffff", "#e4e4e4", "#f76d18"]];
const FRONTS = [["Ink", "#141414", "#2a2a2a"], ["White", "#ffffff", "#d9d9d9"], ["Grey", "#d6d6d6", "#bdbdbd"], ["Orange", "#f76d18", "#c4530f"]];

const light = (c) => { const n = parseInt(c.slice(1), 16); return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150; };
const lerp = (a, b, t) => a + (b - a) * t;
const NS = "http://www.w3.org/2000/svg";

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
.dr-tabtext { position:absolute; font-family:"Geist Mono", ui-monospace, monospace; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap; }
.dr-face { position:absolute; left:0; right:0; }
.dr-wash { position:absolute; inset:0; opacity:0; pointer-events:none; }
.dr-front { display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box; }
.dr-label { font-family:"Geist Mono", ui-monospace, monospace; letter-spacing:.08em; text-transform:uppercase; }
.dr-handle { align-self:center; }
`;

/* ---------------- one card ---------------- */
export function createDrawerCard(S, width, { touch = false } = {}) {
  // this look's colours (front, inside, files 1 to 3)
  const L = S.look;
  S = { ...S, front: S[`${L}Front`] ?? S.front, inside: S[`${L}Inside`] ?? S.inside, div1: S[`${L}F1`] ?? S.div1, div2: S[`${L}F2`] ?? S.div2, div3: S[`${L}F3`] ?? S.div3, layerShadow: S[`${L}Shadow`] ?? 0 };
  const u = width / 100, px = (v) => v * u;
  const W = width, H = Math.round(width * S.ratio);
  const FW = px(S.drawerW), FH = px(S.frontH), R = px(S.corner), D = px(S.depth);
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
  scene.style.perspectiveOrigin = `${W / 2}px ${top - px(S.vpUp)}px`;

  // the box: back, floor, two walls (one colour, the walls a shade lighter so the box reads)
  const wallH = FH * 0.92;
  const plane = (w, hh, css) => h("div", { style: `width:${w}px;height:${hh}px;${css}` });
  const back = plane(FW, wallH, `background:${S.inside};border-radius:${R}px`);
  const floor = plane(FW, D, `background:${S.inside};filter:brightness(.8)`);
  const wallL = plane(D, wallH, `background:${S.inside};filter:brightness(1.15)`);
  const wallR = plane(D, wallH, `background:${S.inside};filter:brightness(1.15)`);
  drawer.append(back, floor, wallL, wallR);

  // the dividers, back to front (n … 1): a card with a tab; the tab's place steps across, as in CC's reference
  const divs = [], inners = [], washes = [], faces = [], txs = [], labels = [], inks = [];
  const DW = FW - px(S.inset) * 2, TH = px(S.tabH), TW = (S.tabW / 100) * DW, DH = px(S.divH), tr = px(S.tabR);
  for (let c = S.count; c >= 1; c--) {
    const fill = S[`div${c}`] || "#ffffff", text = light(fill) ? S.ink : "#ffffff";
    const slots = S.count > 1 ? (c - 1) / (S.count - 1) : 0;
    const tx = tr * 2 + slots * (DW - TW - tr * 4);
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("width", DW); s.setAttribute("height", TH + DH); s.setAttribute("viewBox", `0 0 ${DW} ${TH + DH}`);
    const p = document.createElementNS(NS, "path");
    p.setAttribute("fill", fill);
    p.setAttribute("d", `M0,${TH + tr} Q0,${TH} ${tr},${TH} L${tx - tr},${TH} Q${tx},${TH} ${tx},${TH - tr} L${tx},${tr} Q${tx},0 ${tx + tr},0
      L${tx + TW - tr},0 Q${tx + TW},0 ${tx + TW},${tr} L${tx + TW},${TH - tr} Q${tx + TW},${TH} ${tx + TW + tr},${TH}
      L${DW - tr},${TH} Q${DW},${TH} ${DW},${TH + tr} L${DW},${TH + DH} L0,${TH + DH} Z`);
    s.append(p);
    // a soft shadow along the file's top edge, onto the file behind it (follows the tab's shape).
    // Inner layers only (CC): the back file has nothing behind it, so it casts none onto the page
    if (S.layerShadow && c < S.count) s.style.filter = `drop-shadow(0 ${-px(0.35)}px ${px(1)}px rgba(0,0,0,${(0.10 * S.layerShadow).toFixed(3)}))`;
    const label = h("div", { class: "dr-tabtext", style: `left:${tx}px;width:${TW}px;top:0;height:${TH}px;line-height:${TH}px;text-align:center;font-size:${px(1.9)}px;color:${text}` }, `Case study ${String(c).padStart(2, "0")}`);
    // what you see when it's lifted: a title and a picture placeholder
    const face = h("div", { class: "dr-face", style: `top:${TH + px(2.5)}px;padding:0 ${px(3)}px;color:${text};opacity:0` },
      h("div", { style: `font-size:${px(3.6)}px;font-weight:500;letter-spacing:-.01em` }, `Case study ${c}`),
      h("div", { style: `margin-top:${px(2)}px;height:${px(16)}px;border-radius:${px(0.8)}px;background:${text};opacity:.08` }));
    const wash = h("div", { class: "dr-wash", style: `background:${S.washColor};clip-path:path('${p.getAttribute("d").replace(/\s+/g, " ")}')` });
    const inner = h("div", { style: `position:relative;width:${DW}px;height:${TH + DH}px` }, s, label, face, wash);
    const el = h("div", { class: "dr-div", style: `left:${px(S.inset)}px;width:${DW}px;height:${TH + DH}px` }, inner);
    el.dataset.c = c;
    drawer.append(el);
    divs[c] = el; inners[c] = inner; washes[c] = wash; faces[c] = face; txs[c] = tx; labels[c] = label; inks[c] = text;
  }

  // the front panel, flat and matte, in one of three looks
  const onFront = light(S.front) ? S.ink : "#ffffff";
  const pull = (w, hgt, css) => (S.handle ? h("div", { class: "dr-handle", style: `width:${px(w)}px;height:${px(hgt)}px;border-radius:${px(hgt / 2)}px;${css}` }) : null);
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
  const pose = { t: 0, slit: 0 };   // slit: 0..1, the hover "opened a crack" peek
  function place() {
    const t = pose.t;
    // perspective: flat when closed (a very long lens), the direct view when open
    scene.style.perspective = `${px(S.persp) / Math.max(t, 0.002)}px`;
    gsap.set(drawer, { x: 0, y: px(S.slideY) * t, z: px(S.slideZ) * t });
    gsap.set(back, { x: 0, y: FH - wallH, z: -D });
    gsap.set(floor, { x: 0, y: FH, z: 0, rotationX: -90, transformOrigin: "50% 0%" });
    gsap.set(wallL, { x: 0, y: FH - wallH, z: 0, rotationY: 90, transformOrigin: "0% 50%" });
    gsap.set(wallR, { x: FW, y: FH - wallH, z: 0, rotationY: 90, transformOrigin: "0% 50%" });
    gsap.set(front, { z: 0.5 });
    // the front's shadow onto the first file: inside the drawer's width (negative spread) and only as it
    // opens, so a shut drawer casts nothing on the page (CC: inner layers only)
    if (S.layerShadow) front.style.boxShadow = t > 0.01 ? `0 ${-px(0.6)}px ${px(1.4)}px ${-px(0.7)}px rgba(0,0,0,${(0.13 * S.layerShadow * Math.min(1, t * 1.5)).toFixed(3)})` : "none";
    for (let c = 1; c <= S.count; c++) {
      // closed: stepped up like a flat stack; open: one behind the other in depth
      const topC = -px(S.peekC) - (c - 1) * px(S.stepC), topO = -px(S.peekO);
      // the hover nudge moves only the drawer: the files start to rise once it really opens
      const tf = Math.max(0, (t - S.nudge) / (1 - S.nudge));
      const z = -lerp(px(0.3) * c, px(S.gapO) * (c - 0.4), t);
      // hovering the shut drawer: the files' tops peek out a crack, each one behind a touch higher
      const crack = -(px(S.slit) + (c - 1) * px(S.slitStep)) * pose.slit * (1 - tf);
      gsap.set(divs[c], { y: lerp(topC, topO, tf) - px(S.tabH) + crack, z });
    }
  }

  const st = { open: false, pulled: 0, hover: false };
  let bob = null, bobbing = 0;
  const sp = () => Math.max(0.05, S.speed);
  function render(kind) {
    const target = st.open ? 1 : st.hover && !touch ? S.nudge : 0;
    const [d, e] = kind === "open" ? [S.openDur, S.openEase] : kind === "close" ? [S.closeDur, S.closeEase] : kind === "hover" ? [S.hoverDur, "power2.out"] : [S.pullDur, S.pullEase];
    const slit = st.hover && !st.open && !touch ? 1 : 0;
    gsap.to(pose, { t: target, slit, duration: kind ? d / sp() : 0, ease: e, overwrite: true, onUpdate: place });
    if (!kind) { pose.t = target; pose.slit = slit; place(); }
    card.setAttribute("aria-expanded", String(st.open));
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
    card.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && !api.held) change({ hover: true }, "hover"); });
    card.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !api.held) change({ hover: false, pulled: 0 }, st.open ? "pull" : "hover"); });
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
    kill() { bob?.kill(); document.removeEventListener("pointerdown", outside); gsap.killTweensOf([pose, ...inners.filter(Boolean), ...washes.filter(Boolean), ...faces.filter(Boolean)]); },
  };
  return api;
}

/* ---------------- the tab ---------------- */
export function createDrawer({ canvas, onZoom }) {
  // CC (2026-11-27): only the hovered file lifts, so drop any saved "files behind move up too"
  // and start the lift from the soft timing (its values were missing before, so it jumped)
  try { const k = "studio-drawer-1", v = JSON.parse(localStorage.getItem(k) || "{}"); ["room", "pullDur", "pullEase", "washColor", "frontH", "divH", "baseY", "ratio", "slideY", "swing1", "swing2", "swing3", "swingX", "follow", "wash", "bob", "bobTime"].forEach((x) => delete v[x]); localStorage.setItem(k, JSON.stringify(v)); } catch {}
  return createProtoTab({
    canvas, onZoom, id: "drawer", css: DRAWER_CSS,
    title: "Case studies drawer",
    about: "A second idea for the Case studies card: flat when closed, a click slides the drawer towards you into a direct perspective. Not on the site; the folder stays there until you choose. Settings stay in this browser. Placeholder names.",
    hint: "Click a drawer to open it · hover a file · click the drawer or outside to close · drag to move, ⌘ + scroll to zoom",
    defaults: DRAWER_DEFAULTS, storeKey: "studio-drawer-1",
    // CC: "design all 3 in the canvas for me to see them side by side"
    frames: (S) => (S.compare
      ? LOOKS.map(([look, name, front, inside]) => ({ name, w: S.cardW, touch: false, note: "click to open", over: { look } }))
      : null),
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
      sec("Closed look", ["look", "compare", "frame"],
        swatches(LOOKS.map(([look, name]) => [name, S[`${look}Front`], look]), ([, look]) => set("look", look), ([, look]) => S.look === look),
        hh("div", { class: "chips" }, toggle("compare", "Show all three side by side")),
        num("frame", "Cabinet frame", 0, 8, 0.1)),
      ...LOOKS.map(([look, name]) => sec(`Colours: ${name}`, [`${look}Front`, `${look}Inside`, `${look}F1`, `${look}F2`, `${look}F3`, `${look}Shadow`, ...(look === "cabinet" ? ["frameColor"] : [])],
        swatches(FRONTS, ([f, i]) => { S[`${look}Inside`] = i; set(`${look}Front`, f); }, ([f]) => S[`${look}Front`] === f),
        color(`${look}Front`, "Front"), color(`${look}Inside`, "Inside"), look === "cabinet" ? color("frameColor", "Frame") : null,
        swatches(PAPERS, ([a, b, c]) => { S[`${look}F1`] = a; S[`${look}F2`] = b; set(`${look}F3`, c); }, ([a, b, c]) => S[`${look}F1`] === a && S[`${look}F2`] === b && S[`${look}F3`] === c),
        color(`${look}F1`, "File 1"), color(`${look}F2`, "File 2"), color(`${look}F3`, "File 3"),
        num(`${look}Shadow`, "Layer shadows", 0, 3, 0.05))),
      sec("Drawer", ["drawerW", "frontH", "baseY", "corner", "depth", "label", "handle"],
        num("drawerW", "Width", 40, 95, 1, "%"), num("frontH", "Front height", 15, 70, 0.5, "%"), num("baseY", "From bottom", 0, 40, 0.5, "%"),
        num("depth", "Depth", 10, 90, 1), num("corner", "Corners", 0, 6, 0.1),
        hh("div", { class: "chips" }, toggle("label", "Label"), toggle("handle", "Handle"))),
      sec("Files", ["count", "divH", "inset", "tabW", "tabH", "tabR", "ink"],
        num("count", "How many", 1, 6, 1), color("ink", "Text"),
        num("divH", "Height", 15, 70, 0.5), num("inset", "Side margin", 0, 15, 0.5),
        num("tabW", "Tab width", 10, 60, 1, "%"), num("tabH", "Tab height", 2, 12, 0.5), num("tabR", "Tab corners", 0, 4, 0.1)),
      sec("Closed: flat and shut", ["peekC", "stepC", "nudge", "slit", "slitStep", "hoverDur"],
        num("peekC", "Files show", -15, 20, 0.5), num("stepC", "Step up", 0, 15, 0.5),
        num("nudge", "Hover nudges out", 0, 0.4, 0.01), num("slit", "Hover: files peek", 0, 15, 0.5), num("slitStep", "Each behind, higher", 0, 5, 0.1),
        num("hoverDur", "Hover time", 0.1, 1.5, 0.05, "s")),
      sec("Click: slides out towards you", ["persp", "vpUp", "slideZ", "slideY", "gapO", "peekO", "openDur", "openEase", "closeDur", "closeEase"],
        num("persp", "Perspective", 40, 600, 5), num("vpUp", "Look from above", -20, 120, 1),
        num("slideZ", "Comes towards you", 0, 60, 0.5), num("slideY", "Moves down", -20, 30, 0.5),
        num("gapO", "Space between files", 0, 25, 0.5), num("peekO", "Files show", -10, 30, 0.5),
        num("openDur", "Open time", 0.1, 2.5, 0.05, "s"), ease("openEase", "Open ease"), num("closeDur", "Close time", 0.1, 2, 0.05, "s"), ease("closeEase", "Close ease")),
      sec("Hover a file: it lifts out", ["pull", "sink", "reach", "reachGap", "lastLift", "swing1", "swing2", "swing3", "swingX", "follow", "dropEase", "accentTab", "accent", "room", "wash", "washColor", "pullDur", "pullEase", "bob", "bobTime"],
        num("pull", "Lift", 0, 40, 0.5), num("sink", "Others drop", 0, 15, 0.5),
        hh("div", { class: "chips" }, toggle("reach", "Stop below the next tab"), toggle("room", "Files behind move up too")),
        num("reachGap", "Gap to that tab", 0, 4, 0.1), num("lastLift", "Back file lifts", 0, 30, 0.5),
        num("swing1", "File 1 swings", -15, 15, 0.5, "°"), num("swing2", "File 2 swings", -15, 15, 0.5, "°"), num("swing3", "File 3 swings", -15, 15, 0.5, "°"),
        num("swingX", "Swing drifts", 0, 10, 0.1),
        num("follow", "Leans after the mouse", 0, 8, 0.1, "°"), ease("dropEase", "Settles back"),
        hh("div", { class: "chips" }, toggle("accentTab", "Tab turns orange")), color("accent", "Tab colour"), num("wash", "Others wash", 0, 1, 0.01), color("washColor", "Wash colour"),
        hh("div", { class: "chips" }, ...FLOATS.map(([name, d, e]) => { const b = hh("button", { class: "chip", onclick: () => { S.pullEase = e; set("pullDur", d); } }, name); return b; })),
        num("pullDur", "Time", 0.1, 1.5, 0.05, "s"), ease("pullEase", "Ease"),
        num("bob", "Mid-air bob", 0, 5, 0.1, "%"), num("bobTime", "Bob time", 1, 6, 0.1, "s")),
      sec("Card and page", ["pageBg", "ratio", "showCard", "showNeighbours"],
        color("pageBg", "Page"), num("ratio", "Height", 0.6, 1.6, 0.01, "× width"),
        hh("div", { class: "chips" }, toggle("showCard", "Card background"), toggle("showNeighbours", "Cards beside it"))),
    ],
  });
}
