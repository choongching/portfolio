/* The "Case studies" folder card (CC, 2026-11-26), built in the motion studio's Folder tab
   (docs/studio/folder.js, which imports this file) and mounted on the site on every `.js-a-folder`.
   A folder with paper case study sheets inside and a frosted glass front. Closed, the papers' top
   edges peek; a click (a tap) snaps it open, the folder comes a little closer and the papers float
   up; hovering a paper lifts it, the others drop a little under a light wash; a click on the folder
   or anywhere else closes it. Hover lifts and tilts the closed folder; a press sinks it.
   Depth without preserve-3d: every layer gets its own perspective() with the same vanishing point, so
   the layers stack in DOM order and the glass front can blur what's behind it (backdrop-filter).
   Sizes are in u = 1% of the card's width, so one set of values serves every card size.
   FOLDER_DEFAULTS are CC's chosen values; the studio's dials preview changes (in that browser only).
   The paper titles are placeholders until CC names the case studies. */
import { gsap } from "gsap";

const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "style") el.style.cssText = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
  }
  kids.flat().forEach((c) => c != null && el.append(c));
  return el;
};
const NS = "http://www.w3.org/2000/svg";
const svg = (tag, a = {}) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); return e; };
const rgb = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgba = (c, a) => `rgba(${rgb(c).join(", ")}, ${a})`;
const mix = (c, d, t) => { const a = rgb(c), b = rgb(d); return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(", ")})`; };
const light = (c) => { const [r, g, b] = rgb(c); return 0.299 * r + 0.587 * g + 0.114 * b > 150; };

export const FOLDER_DEFAULTS = {
  // card
  cardW: 589, ratio: 1.06, phoneW: 350, cardBg: "#ffffff", pageBg: "#f2f2f2", radius: 2.7, showCard: false, showNeighbours: false, spill: false,
  // folder
  folderW: 74, bodyH: 54, baseY: 8, tabW: 36, tabH: 7, corner: 5, color: "#4a8fe7",
  // glass front: shut, it covers the folder up to just below the back's top edge
  frontH: 90, glass: 0.72, frost: 14, sheen: 0.45, title: true,
  // sheets
  count: 3, inset: 5, sheetH: 44, sheetColor: "#ffffff",
  // closed: the papers' top edges just show above the front (CC, 2026-11-26)
  peekC: 4, stepC: 0,
  // depth
  persp: 220, vp: -70, shadow: 0.05, contact: 0.32, shadowShift: 3,
  // closed, mouse over it: it lifts a little off the surface
  hoverLift: 2, hoverScale: 1.015, hoverDur: 0.5, tiltHover: 4,
  // pressed: it sinks into the surface, tilting towards where you pressed, then springs back
  tiltPress: 7, pressScale: 0.97,
  // click: the folder opens (the front tips forward)
  tilt: 12, backTilt: 0, ajarDur: 0.3, ajarEase: "back.out(2)",
  // and the whole folder comes closer to you, slowly
  closer: 1.06, closerY: 2, closerTilt: 3, closerDur: 0.7, closerEase: "power3.out",
  // and the papers float up into the air, peeking out
  rise: 12, step: 7, fanZ: 3, float: 0.5, floatTime: 2.4, floatDur: 0.45, floatEase: "back.out(1.4)", paperDelay: 0.06,
  // hover a paper: it lifts higher
  pull: 9, pullZ: 3, sink: 4, room: true, wash: 0.55, washColor: "#ffffff", twist: 2.5, tiltMax: 7, tiltBack: "back.out(1.6)",
  // motion
  closeDur: 0.35, closeEase: "power3.inOut", stagger: 0.04,
  pullDur: 0.4, pullEase: "power3.out", speed: 1,
};
// prefers-reduced-motion: it still opens and closes, without travel, bob, tilt or spring
const CALM = { speed: 40, float: 0, tiltMax: 0, tiltHover: 0, tiltPress: 0, pressScale: 1, twist: 0, shadowShift: 0, hoverLift: 0, hoverScale: 1, closer: 1, closerY: 0, closerTilt: 0 };

/* ---------------- one card ---------------- */
export function createFolderCard(S, width, { touch = false, reduced = false } = {}) {
  if (reduced) S = { ...S, ...CALM };
  const u = width / 100, px = (v) => v * u;
  const W = width, H = Math.round(width * S.ratio);
  const FW = px(S.folderW), TH = px(S.tabH), BH = px(S.bodyH), FH = TH + BH;
  const R = px(S.corner);
  const vpY = (S.vp / 100) * FH;                      // vanishing point, in folder space
  const P = px(S.persp);
  const back = S.color, ink = light(S.color) ? "#141414" : "#ffffff";

  const card = h("div", { class: "fo-card", role: "button", tabindex: "0", "aria-expanded": "false", "aria-label": `Case studies, ${S.count} papers`,
    style: `width:${W}px;height:${H}px;background:${S.showCard ? S.cardBg : "transparent"};border-radius:${px(S.radius)}px;overflow:${S.spill ? "visible" : "hidden"}` });
  // two shadows, as under a real object: a wide soft one (the room's light) and a tight dark one where
  // it touches the surface. Lifting spreads and lightens the first and thins out the second.
  const ell = (w, hgt, below, a) => h("div", { class: "fo-ground", style: `left:${(W - w) / 2}px;width:${w}px;bottom:${px(S.baseY) - below}px;height:${hgt}px;
    background:radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,${a}) 0%, rgba(0,0,0,${a * 0.45}) 45%, rgba(0,0,0,0) 100%)` });
  const ground = ell(FW * 1.2, px(12), px(7), S.shadow);
  const contact = ell(FW * 0.94, px(2.6), px(1.3), S.contact);
  const rig = h("div", { class: "fo-rig", style: `left:${(W - FW) / 2}px;bottom:${px(S.baseY)}px;width:${FW}px;height:${FH}px` });
  // the hand: the whole folder (not its shadows) tilts in perspective under the pointer and sinks when pressed
  const hand = h("div", { class: "fo-hand" }), shadows = h("div", { class: "fo-shadows" }, ground, contact);
  hand.append(rig);
  card.append(shadows, hand);
  const mid = H - px(S.baseY) - FH / 2;   // the folder's centre, in card space
  gsap.set(hand, { transformPerspective: px(S.persp) * 2.2, transformOrigin: `${W / 2}px ${mid}px` });
  gsap.set(shadows, { transformOrigin: `${W / 2}px ${H - px(S.baseY)}px` });

  // a layer: positioned in folder space, projected towards the shared vanishing point
  const layer = (el, x, y) => { el.style.left = `${x}px`; el.style.top = `${y}px`; gsap.set(el, { transformPerspective: P, transformOrigin: `${FW / 2 - x}px ${vpY - y}px` }); return el; };

  // back panel with its tab
  const gid = `g${Math.random().toString(36).slice(2, 8)}`;
  const s = svg("svg", { width: FW, height: FH, viewBox: `0 0 ${FW} ${FH}` });
  const defs = svg("defs"), lg = svg("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
  lg.append(svg("stop", { offset: 0, "stop-color": mix(back, "#ffffff", 0.12) }), svg("stop", { offset: 1, "stop-color": mix(back, "#000000", 0.18) }));
  defs.append(lg); s.append(defs);
  const tw = (S.tabW / 100) * FW, sl = TH * 1.1, r = Math.min(R, TH * 1.2);
  s.append(svg("path", { fill: `url(#${gid})`, d:
    `M0,${r} Q0,0 ${r},0 L${tw - r},0 Q${tw},0 ${tw + sl * 0.35},${TH * 0.35} Q${tw + sl * 0.65},${TH} ${tw + sl},${TH}
     L${FW - R},${TH} Q${FW},${TH} ${FW},${TH + R} L${FW},${FH - R} Q${FW},${FH} ${FW - R},${FH} L${R},${FH} Q0,${FH} 0,${FH - R} Z` }));
  // the pocket's shade, where the sheets sit
  s.append(svg("rect", { x: px(2), y: TH + px(2), width: FW - px(4), height: BH - px(4), rx: R * 0.7, fill: "rgba(0,0,0,0.10)" }));
  const backEl = layer(h("div", { class: "fo-back" }, s), 0, 0);
  rig.append(backEl);

  // the sheets, back to front: case n ... case 1
  const sheets = [], papers = [], washes = [];
  const SW = FW - px(S.inset) * 2, SH = px(S.sheetH);
  for (let c = S.count; c >= 1; c--) {
    const dark = !light(S.sheetColor);
    // the paper: its title along the top (what peeks out), then a picture
    const paper = h("div", { class: "fo-paper", style: `border-radius:${px(2.2)}px;background:${S.sheetColor};color:${dark ? "#fff" : "#141414"};padding:${px(2)}px;gap:${px(1.6)}px` },
      h("div", { class: "fo-head" },
        h("div", { class: "fo-t", style: `font-size:${px(3.6)}px` }, `Case study ${c}`),
        h("div", { class: "fo-m", style: `font-size:${px(2.2)}px` }, String(c).padStart(2, "0"))),
      h("div", { class: "fo-thumb", style: `border-radius:${px(1.4)}px;background:linear-gradient(135deg, ${mix(S.color, "#ffffff", 0.75)}, ${mix(S.color, "#ffffff", 0.45)})` }),
      washes[c] = h("div", { class: "fo-wash", style: `background:${S.washColor}` }));
    const el = h("div", { class: "fo-sheet", style: `width:${SW}px;height:${SH}px` }, paper);
    el.dataset.c = c;
    sheets[c] = el; papers[c] = paper;
    rig.append(el);
  }

  // the glass front
  const FRH = (S.frontH / 100) * BH, frontTop = FH - FRH;
  const glass = h("div", { class: "fo-glass", style: `width:${FW}px;height:${FRH}px;border-radius:${R}px;padding:${px(4)}px ${px(4.5)}px;color:${ink};
    background:linear-gradient(180deg, ${rgba(mix2hex(back, "#ffffff", 0.18), S.glass * 0.9)}, ${rgba(back, S.glass)});
    -webkit-backdrop-filter:blur(${S.frost}px) saturate(1.5);backdrop-filter:blur(${S.frost}px) saturate(1.5);
    box-shadow:inset 0 ${Math.max(1, px(0.25))}px 0 rgba(255,255,255,${S.sheen}), inset 0 -1px 0 rgba(0,0,0,0.08), 0 ${px(1.2)}px ${px(3)}px rgba(0,0,0,${S.shadow * 0.6})` },
    S.title ? h("div", { class: "fo-title", style: `font-size:${px(6)}px` }, "Case studies") : null,
    S.title ? h("div", { class: "fo-count", style: `font-size:${px(3)}px;margin-top:${px(0.6)}px` }, `${S.count} case studies`) : null);
  gsap.set(glass, { transformPerspective: P, transformOrigin: "50% 100%" });
  const front = layer(h("div", { class: "fo-front", style: `width:${FW}px;height:${FRH}px` }, glass), 0, frontTop);
  rig.append(front);
  // every paper sits at the front's top edge; its y says how far it shows above it
  sheets.forEach((el) => el && layer(el, px(S.inset), frontTop));

  /* ---- states (CC, 2026-11-26): closed; a click opens the folder and the papers float up, peeking out;
     hovering a paper lifts it (a tap on phones); a click on the folder or anywhere else closes it ---- */
  const st = { open: false, pulled: 0, hover: false };
  // the light comes from the pointer: the shadows slide away from it, the soft one more than the tight one
  // where the pointer is on the folder, -1 to 1 from its centre
  const at = (e) => { const r = rig.getBoundingClientRect(); const c = (v) => Math.max(-1, Math.min(1, v));
    return [c(((e.clientX - r.left) / r.width - 0.5) * 2), c(((e.clientY - r.top) / r.height - 0.5) * 2)]; };
  let pressing = false, pressedAt = 0;
  // the side under the pointer dips away a little, as if a hand rested on it
  const lean3d = ([dx, dy], deg, extra = {}) => gsap.to(hand, { rotationY: dx * deg, rotationX: -dy * deg * 0.8, overwrite: "auto", ...extra });
  function press(e) {
    if (api.held || sheetAt(e)) return;   // a paper is its own object
    pressing = true; pressedAt = performance.now();
    lean3d(at(e), S.tiltPress, { scale: S.pressScale, duration: 0.14 / sp(), ease: "power2.out" });
    gsap.to(shadows, { scaleX: 0.97, scaleY: 0.85, duration: 0.14 / sp(), ease: "power2.out", overwrite: "auto" });   // pushed down: the shadow tucks in
  }
  function release(e) {
    if (!pressing) return;
    pressing = false;
    const p = e && st.hover && e.pointerType === "mouse" ? at(e) : [0, 0];
    // a quick click still shows the whole press: let it land first, then spring back
    const wait = Math.max(0, 0.14 / sp() - (performance.now() - pressedAt) / 1000);
    gsap.delayedCall(wait, () => {
      if (pressing) return;
      lean3d(p, S.tiltHover, { scale: 1, duration: 0.7 / sp(), ease: "back.out(2.2)" });
      gsap.to(shadows, { scaleX: 1, scaleY: 1, duration: 0.7 / sp(), ease: "back.out(2.2)", overwrite: "auto" });
    });
  }
  function shine(e) {
    if (!S.shadowShift) return;
    const r = card.getBoundingClientRect(), dx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    const L = st.open ? 1 : 0.45;
    gsap.to(ground, { x: -dx * px(S.shadowShift) * (0.5 + L), duration: 0.6 / sp(), ease: "power3.out", overwrite: "auto" });
    gsap.to(contact, { x: -dx * px(S.shadowShift) * 0.25, duration: 0.6 / sp(), ease: "power3.out", overwrite: "auto" });
  }
  const sp = () => Math.max(0.05, S.speed);
  const topAt = (c) => (st.open ? -px(S.rise) - (c - 1) * px(S.step) : -px(S.peekC) - (c - 1) * px(S.stepC));
  function render(kind) {
    // folder parts and papers have their own timing: the folder opens, then the papers rise out of it
    const F = kind === "open" ? [S.ajarDur, S.ajarEase] : kind === "close" ? [S.closeDur, S.closeEase] : [S.pullDur, S.pullEase];
    const Pp = kind === "open" ? [S.floatDur, S.floatEase] : F;
    const dur = (d) => (kind ? d / sp() : 0);
    // overwrite everything on the target: a staggered tween that hasn't started yet must not land later
    const go = (el, o, [d, e], delay = 0) => gsap.to(el, { ...o, duration: dur(d), ease: e, delay: kind ? delay / sp() : 0, overwrite: true });
    const o = st.open;
    // the whole folder comes closer to the viewer, slowly (CC): a little bigger, a touch higher, its
    // top tipping towards you; the shadow spreads and softens as it lifts off the card
    const A = kind === "open" ? [S.closerDur, S.closerEase] : kind === "hover" ? [S.hoverDur, "power2.out"] : F;
    const up = !o && st.hover;   // closed, mouse over it: it lifts a little off the surface
    go(rig, { y: o ? -px(S.closerY) : up ? -px(S.hoverLift) : 0, scale: o ? S.closer : up ? S.hoverScale : 1, rotationX: o ? -S.closerTilt : 0,
      transformPerspective: px(S.persp) * 1.5, transformOrigin: "50% 100%" }, A);
    const L = o ? 1 : up ? 0.45 : 0;   // how far off the surface
    go(ground, { scaleX: 1 + 0.14 * L, scaleY: 1 + 0.7 * L, opacity: 1 - 0.3 * L, y: px(2.5) * L }, A);
    go(contact, { scaleX: 1 - 0.16 * L, opacity: 1 - 0.8 * L }, A);
    go(glass, { rotationX: o ? -S.tilt : 0 }, F);
    go(backEl, { rotationX: o ? S.backTilt : 0 }, F);
    card.classList.toggle("is-open", o);
    card.setAttribute("aria-expanded", String(o));
    for (let c = 1; c <= S.count; c++) {
      const el = sheets[c];
      let y = topAt(c), z = o ? -(c - 1) * px(S.fanZ) : 0;
      if (st.pulled === c) { y -= px(S.pull); z += px(S.pullZ); }
      else if (st.pulled) {
        if (c > st.pulled && S.room) y -= px(S.pull);   // the ones behind make room, so they still peek above it
        y += px(S.sink);                                // and every paper not in focus drops a little (CC)
      }
      el.classList.toggle("on", c === st.pulled);
      // opening: the front paper leads, the ones behind follow, after the folder has started to open
      go(el, { y, z }, Pp, kind === "open" ? S.paperDelay + (c - 1) * S.stagger : 0);
      // one paper in focus: the others get a faint light wash; they stay solid and keep their order (CC)
      gsap.to(washes[c], { opacity: st.pulled && c !== st.pulled ? S.wash : 0, duration: dur(S.pullDur), ease: "power2.out", overwrite: true });
    }
    floating(o && S.float > 0);
    tilting(kind);
  }
  // playful: the paper in focus tips to one side as it lifts (alternating per paper), then follows
  // the pointer in 3D while it's over it; when it lets go it springs back flat
  let tilted = 0;
  papers.forEach((p) => p && gsap.set(p, { transformPerspective: px(S.persp) * 0.7, transformOrigin: "50% 60%" }));
  const lean = (c) => (c % 2 ? 1 : -1) * S.twist;
  function tilting(kind) {
    if (st.pulled === tilted) return;
    const D = kind ? S.pullDur / sp() : 0;
    if (tilted && papers[tilted]) gsap.to(papers[tilted], { rotation: 0, rotationX: 0, rotationY: 0, duration: D * 1.6, ease: S.tiltBack, overwrite: "auto" });
    tilted = st.pulled;
    if (tilted) gsap.to(papers[tilted], { rotation: lean(tilted), duration: D * 1.3, ease: S.tiltBack, overwrite: "auto" });
  }
  function follow(e) {
    if (!tilted || !S.tiltMax) return;
    const r = sheets[tilted].getBoundingClientRect(), shown = Math.min(r.height, r.height * 0.55);
    const dx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    const dy = Math.max(-1, Math.min(1, ((e.clientY - r.top) / shown - 0.5) * 2));
    gsap.to(papers[tilted], { rotationY: dx * S.tiltMax, rotationX: -dy * S.tiltMax * 0.7, rotation: lean(tilted) + dx * S.twist * 0.6,
      duration: 0.5 / sp(), ease: "power3.out", overwrite: "auto" });
  }
  // mid air: each paper bobs gently while they float, out of step with the others
  let bobs = [];
  function floating(on) {
    if (on === bobs.length > 0) return;
    bobs.forEach((b) => b.kill()); bobs = [];
    if (!on) { gsap.to(papers.filter(Boolean), { y: 0, duration: 0.4, ease: "power2.out" }); return; }   // not overwrite: the fade back runs alongside
    for (let c = 1; c <= S.count; c++) {
      gsap.set(papers[c], { y: 0 });
      bobs.push(gsap.to(papers[c], { y: -px(S.float), duration: S.floatTime / 2 / sp(), ease: "sine.inOut", yoyo: true, repeat: -1, delay: (S.floatDur * 0.6 + c * 0.35) / sp() }));
    }
  }
  render();
  const change = (next, kind) => { Object.assign(st, next); render(kind); };

  // input: a click opens and closes (CC: not hover); a mouse hovers a paper to lift it, a finger taps it
  const sheetAt = (e) => e.target.closest?.(".fo-sheet");
  // a drag of the slider that ends on the folder isn't a click
  let downAt = null;
  card.addEventListener("pointerdown", (e) => { downAt = [e.clientX, e.clientY]; }, true);
  card.addEventListener("click", (e) => {
    if (api.held) return;
    if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
    const sh = sheetAt(e);
    if (!st.open) change({ open: true, pulled: 0 }, "open");
    else if (sh) { if (touch) change({ pulled: +sh.dataset.c === st.pulled ? 0 : +sh.dataset.c }, "pull"); }   // on the site: opens that case study
    else change({ open: false, pulled: 0 }, "close");
  });
  card.addEventListener("keydown", (e) => {
    if (api.held || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    change({ open: !st.open, pulled: 0 }, st.open ? "close" : "open");
  });
  card.addEventListener("pointerdown", press);
  card.addEventListener("pointerup", release);
  card.addEventListener("pointercancel", release);
  // a click anywhere else closes it, like a menu
  const outside = (e) => { if (st.open && !api.held && !card.contains(e.target)) change({ open: false, pulled: 0 }, "close"); };
  document.addEventListener("pointerdown", outside);
  if (!touch) {
    card.addEventListener("pointerover", (e) => {
      if (api.held || !st.open) return;
      const sh = sheetAt(e);
      if (sh && +sh.dataset.c !== st.pulled) change({ pulled: +sh.dataset.c }, "pull");
    });
    card.addEventListener("pointermove", (e) => {
      if (api.held || e.pointerType !== "mouse") return;
      follow(e); shine(e);
      if (!pressing) lean3d(at(e), S.tiltHover, { duration: 0.6 / sp(), ease: "power3.out" });
    });
    card.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && !api.held) change({ hover: true }, "hover"); });
    card.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse" || api.held) return;
      change({ hover: false, pulled: 0 }, st.pulled ? "pull" : "hover");
      gsap.to([ground, contact], { x: 0, duration: S.hoverDur / sp(), ease: "power2.out", overwrite: "auto" });
      pressing = false;
      lean3d([0, 0], 0, { scale: 1, duration: 0.8 / sp(), ease: "back.out(1.8)" });
      gsap.to(shadows, { scaleX: 1, scaleY: 1, duration: 0.5 / sp(), overwrite: "auto" });
    });
    card.addEventListener("pointerout", (e) => {
      if (api.held || !st.pulled) return;
      const from = sheetAt(e), to = e.relatedTarget?.closest?.(".fo-sheet");
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
    kill() {
      document.removeEventListener("pointerdown", outside);
      bobs.forEach((b) => b.kill()); gsap.killTweensOf([hand, shadows, rig, ground, contact, backEl, glass, front, ...sheets.filter(Boolean), ...papers.filter(Boolean), ...washes.filter(Boolean)]);
    },
  };
  return api;
}
// rgba() needs a hex; mix() returns rgb(): convert back
function mix2hex(c, d, t) { const m = mix(c, d, t).match(/\d+/g).map(Number); return "#" + m.map((n) => n.toString(16).padStart(2, "0")).join(""); }

// the card's own styles, added once
export const FOLDER_CSS = `
.fo-card { position:relative; flex:none; isolation:isolate; font-family:"Switzer", -apple-system, sans-serif; cursor:pointer; outline:none; -webkit-tap-highlight-color:transparent; user-select:none; }
.fo-card:focus-visible { box-shadow:0 0 0 2px var(--color-ink, #141414); }
.fo-ground, .fo-rig { position:absolute; }
.fo-hand, .fo-shadows { position:absolute; inset:0; }
.fo-rig > * { position:absolute; will-change:transform; }
.fo-back svg { display:block; overflow:visible; }
.fo-paper { display:flex; flex-direction:column; height:100%; box-sizing:border-box; box-shadow:0 1px 2px rgba(0,0,0,.08), 0 8px 20px -8px rgba(0,0,0,.22); }
.fo-head { display:flex; align-items:baseline; justify-content:space-between; }
.fo-thumb { flex:1; }
.fo-paper { position:relative; }
.fo-wash { position:absolute; inset:0; border-radius:inherit; opacity:0; pointer-events:none; }
.fo-t { font-weight:600; letter-spacing:-.01em; line-height:1.1; }
.fo-m { font-family:"Geist Mono", ui-monospace, monospace; opacity:.55; letter-spacing:.02em; }
.fo-back { z-index:0; }
.fo-sheet { z-index:2; }
.fo-front { z-index:5; }
.fo-glass { position:relative; box-sizing:border-box; height:100%; }
.fo-title { font-weight:500; letter-spacing:-.02em; line-height:1.05; }
.fo-count { opacity:.75; }
`;
let styled = false;
function addStyles() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = FOLDER_CSS;
  document.head.append(st);
}

/* ---------------- on the site: one folder per `.js-a-folder` (both slider trees) ---------------- */
function mount(box) {
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let card = null, width = 0;
  const build = () => {
    const w = box.clientWidth;
    if (!w || Math.abs(w - width) < 1) return;   // hidden tree, or no real change
    width = w;
    card?.kill(); box.replaceChildren();
    card = createFolderCard(FOLDER_DEFAULTS, w, { touch: !fine, reduced });
    box.append(card.el);
  };
  new ResizeObserver(build).observe(box);
  // out of sight: shut it quietly, so nothing bobs off screen
  new IntersectionObserver(([e]) => { if (!e.isIntersecting && card?.state.open) card.to({}, false); }).observe(box);
}
if (typeof document !== "undefined") {
  const boxes = document.querySelectorAll(".js-a-folder");
  if (boxes.length) { addStyles(); boxes.forEach(mount); }
}
