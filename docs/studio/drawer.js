/* The studio's Drawer tab (2026-11-27): another take on the Case studies card, next to the folder.
   CC's references: flat tabbed dividers (matte, staggered tabs, small mono labels), a file drawer
   pulled out towards you, and a file-drawer view in a direct, centred perspective.
   Closed, it is flat: a plain front panel with the dividers' tabs peeking above it. A click slides the
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
  cardW: 589, ratio: 1.06, phoneW: 350, pageBg: "#f2f2f2", cardBg: "#ffffff", showCard: false, showNeighbours: false, radius: 2.7,
  // drawer
  drawerW: 76, frontH: 40, baseY: 10, corner: 1.2, depth: 66,
  front: "#141414", inside: "#2a2a2a", ink: "#141414", label: true, handle: true,
  // dividers
  count: 3, divH: 40, inset: 1.5, tabW: 30, tabH: 6, tabR: 1.2,
  div1: "#ffffff", div2: "#e4e4e4", div3: "#cdcdcd", div4: "#b8b8b8", div5: "#ffffff", div6: "#e4e4e4",
  // closed: flat, the tabs peek above the front, each one behind a little higher
  peekC: 8, stepC: 9,
  // hover the closed drawer: it nudges out a touch
  nudge: 0.08, hoverDur: 0.4,
  // open: the drawer slides towards you, the view opens into the perspective
  persp: 110, vpUp: 80, slideZ: 12, slideY: 4, gapO: 13, peekO: 3, openDur: 0.55, openEase: "power3.out",
  closeDur: 0.4, closeEase: "power3.inOut",
  // hover a divider: it lifts out, the others wash and drop
  pull: 14, sink: 3, room: true, wash: 0.5, washColor: "#ffffff", pullDur: 0.35, pullEase: "power3.out",
  speed: 1,
};

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
.dr-tabtext { position:absolute; font-family:"Geist Mono", ui-monospace, monospace; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap; }
.dr-face { position:absolute; left:0; right:0; }
.dr-wash { position:absolute; inset:0; opacity:0; pointer-events:none; }
.dr-front { display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box; }
.dr-label { font-family:"Geist Mono", ui-monospace, monospace; letter-spacing:.08em; text-transform:uppercase; }
.dr-handle { align-self:center; }
`;

/* ---------------- one card ---------------- */
export function createDrawerCard(S, width, { touch = false } = {}) {
  const u = width / 100, px = (v) => v * u;
  const W = width, H = Math.round(width * S.ratio);
  const FW = px(S.drawerW), FH = px(S.frontH), R = px(S.corner), D = px(S.depth);
  const left = (W - FW) / 2, top = H - px(S.baseY) - FH;   // the front panel, in card space

  const card = h("div", { class: "dr-card", role: "button", tabindex: "0", "aria-expanded": "false", "aria-label": `Case studies, ${S.count} files`,
    style: `width:${W}px;height:${H}px;background:${S.showCard ? S.cardBg : "transparent"};border-radius:${px(S.radius)}px` });
  const scene = h("div", { class: "dr-scene" });
  const drawer = h("div", { class: "dr-drawer", style: `left:${left}px;top:${top}px;width:${FW}px;height:${FH}px` });
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
  const divs = [], inners = [], washes = [], faces = [];
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
    divs[c] = el; inners[c] = inner; washes[c] = wash; faces[c] = face;
  }

  // the front panel: flat, matte, a small mono label and a handle slot
  const onFront = light(S.front) ? S.ink : "#ffffff";
  const front = h("div", { class: "dr-front", style: `width:${FW}px;height:${FH}px;background:${S.front};border-radius:${R}px;padding:${px(3.5)}px ${px(4)}px;color:${onFront}` },
    S.label ? h("div", { class: "dr-label", style: `font-size:${px(2.2)}px` }, "Case studies") : h("div"),
    S.handle ? h("div", { class: "dr-handle", style: `width:${px(16)}px;height:${px(2.6)}px;border-radius:${px(1.3)}px;background:${onFront};opacity:.85` }) : null,
    h("div"));
  drawer.append(front);

  /* ---- the pose: t = 0 closed (flat), 1 open; it drives everything at once ---- */
  const pose = { t: 0 };
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
    for (let c = 1; c <= S.count; c++) {
      // closed: stepped up like a flat stack; open: one behind the other in depth
      const topC = -px(S.peekC) - (c - 1) * px(S.stepC), topO = -px(S.peekO);
      const z = -lerp(px(0.3) * c, px(S.gapO) * (c - 0.4), t);
      gsap.set(divs[c], { y: lerp(topC, topO, t) - px(S.tabH), z });
    }
  }

  const st = { open: false, pulled: 0, hover: false };
  const sp = () => Math.max(0.05, S.speed);
  function render(kind) {
    const target = st.open ? 1 : st.hover && !touch ? S.nudge : 0;
    const [d, e] = kind === "open" ? [S.openDur, S.openEase] : kind === "close" ? [S.closeDur, S.closeEase] : kind === "hover" ? [S.hoverDur, "power2.out"] : [S.pullDur, S.pullEase];
    gsap.to(pose, { t: target, duration: kind ? d / sp() : 0, ease: e, overwrite: true, onUpdate: place });
    if (!kind) { pose.t = target; place(); }
    card.setAttribute("aria-expanded", String(st.open));
    for (let c = 1; c <= S.count; c++) {
      const lifted = st.pulled === c, other = st.pulled && !lifted;
      // the files behind the lifted one move up with it (they stay reachable), then every other one drops a little
      const y = lifted ? -px(S.pull) : other ? (c > st.pulled && S.room ? -px(S.pull) : 0) + px(S.sink) : 0;
      gsap.to(inners[c], { y, duration: kind ? S.pullDur / sp() : 0, ease: S.pullEase, overwrite: "auto" });
      gsap.to(washes[c], { opacity: other ? S.wash : 0, duration: kind ? S.pullDur / sp() : 0, ease: "power2.out", overwrite: true });
      gsap.to(faces[c], { opacity: lifted ? 1 : 0, duration: kind ? S.pullDur / sp() : 0, ease: "power2.out", overwrite: true });   // its title shows once it's lifted
      divs[c].classList.toggle("on", lifted);
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
    card.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && !api.held) change({ hover: true }, "hover"); });
    card.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !api.held) change({ hover: false, pulled: 0 }, st.open ? "pull" : "hover"); });
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
    kill() { document.removeEventListener("pointerdown", outside); gsap.killTweensOf([pose, ...inners.filter(Boolean), ...washes.filter(Boolean), ...faces.filter(Boolean)]); },
  };
  return api;
}

/* ---------------- the tab ---------------- */
export function createDrawer({ canvas, onZoom }) {
  return createProtoTab({
    canvas, onZoom, id: "drawer", css: DRAWER_CSS,
    title: "Case studies drawer",
    about: "A second idea for the Case studies card: flat when closed, a click slides the drawer towards you into a direct perspective. Not on the site; the folder stays there until you choose. Settings stay in this browser. Placeholder names.",
    hint: "Click the drawer to open it · hover a file · click the drawer or outside to close · the phone card is to the right · ⌘ + scroll to zoom",
    defaults: DRAWER_DEFAULTS, storeKey: "studio-drawer-1",
    createCard: createDrawerCard,
    states: [
      ["live", "Live", "Hover and click as on the site"],
      ["closed", "Closed", "Flat, the tabs peek out"],
      ["open", "Open", "After a click: slid out towards you"],
      ...[1, 2, 3, 4, 5, 6].map((c) => [`pull${c}`, `Case study ${c} lifted`, "Hovering that file"]),
    ],
    stateOf: (id) => (id === "closed" ? {} : id === "open" ? { open: true } : { open: true, pulled: +id.slice(4) }),
    playSteps: (S) => [[{ open: true }, 1.4], ...[...Array(S.count).keys()].map((i) => [{ open: true, pulled: i + 1 }, 1.1]), [{ open: true }, 0.9], [{}, 1]],
    sections: ({ S, set, num, color, ease, toggle, swatches, sec, h: hh }) => [
      sec("Drawer", ["front", "inside", "drawerW", "frontH", "baseY", "corner", "depth", "label", "handle"],
        swatches(FRONTS, ([f, i]) => { S.inside = i; set("front", f); }, ([f]) => S.front === f),
        color("front", "Front"), color("inside", "Inside"),
        num("drawerW", "Width", 40, 95, 1, "%"), num("frontH", "Front height", 15, 70, 0.5, "%"), num("baseY", "From bottom", 0, 40, 0.5, "%"),
        num("depth", "Depth", 10, 90, 1), num("corner", "Corners", 0, 6, 0.1),
        hh("div", { class: "chips" }, toggle("label", "Label"), toggle("handle", "Handle"))),
      sec("Files", ["count", "div1", "div2", "div3", "divH", "inset", "tabW", "tabH", "tabR", "ink"],
        swatches(PAPERS, ([a, b, c]) => { S.div1 = a; S.div2 = b; S.div3 = c; set("div1", a); }, ([a, b, c]) => S.div1 === a && S.div2 === b && S.div3 === c),
        num("count", "How many", 1, 6, 1), color("div1", "File 1"), color("div2", "File 2"), color("div3", "File 3"), color("ink", "Text"),
        num("divH", "Height", 15, 70, 0.5), num("inset", "Side margin", 0, 15, 0.5),
        num("tabW", "Tab width", 10, 60, 1, "%"), num("tabH", "Tab height", 2, 12, 0.5), num("tabR", "Tab corners", 0, 4, 0.1)),
      sec("Closed: flat", ["peekC", "stepC", "nudge", "hoverDur"],
        num("peekC", "Tabs show", -10, 20, 0.5), num("stepC", "Step up", 0, 15, 0.5),
        num("nudge", "Hover nudges out", 0, 0.4, 0.01), num("hoverDur", "Hover time", 0.1, 1.5, 0.05, "s")),
      sec("Click: slides out towards you", ["persp", "vpUp", "slideZ", "slideY", "gapO", "peekO", "openDur", "openEase", "closeDur", "closeEase"],
        num("persp", "Perspective", 40, 600, 5), num("vpUp", "Look from above", -20, 120, 1),
        num("slideZ", "Comes towards you", 0, 60, 0.5), num("slideY", "Moves down", -20, 30, 0.5),
        num("gapO", "Space between files", 0, 25, 0.5), num("peekO", "Files show", -10, 30, 0.5),
        num("openDur", "Open time", 0.1, 2.5, 0.05, "s"), ease("openEase", "Open ease"), num("closeDur", "Close time", 0.1, 2, 0.05, "s"), ease("closeEase", "Close ease")),
      sec("Hover a file: it lifts out", ["pull", "sink", "room", "wash", "washColor", "pullDur", "pullEase"],
        num("pull", "Lift", 0, 40, 0.5), num("sink", "Others drop", 0, 15, 0.5), hh("div", { class: "chips" }, toggle("room", "Files behind move up too")), num("wash", "Others wash", 0, 1, 0.01), color("washColor", "Wash colour"),
        num("pullDur", "Time", 0.1, 1.5, 0.05, "s"), ease("pullEase", "Ease")),
      sec("Card and page", ["pageBg", "ratio", "showCard", "showNeighbours"],
        color("pageBg", "Page"), num("ratio", "Height", 0.6, 1.6, 0.01, "× width"),
        hh("div", { class: "chips" }, toggle("showCard", "Card background"), toggle("showNeighbours", "Cards beside it"))),
    ],
  });
}
