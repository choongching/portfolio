/* The studio's Folder tab: the "Case studies" card (designbycc-landing/case-folder.js, also on the site)
   on its own canvas, with dials to preview changes; CC's chosen values are FOLDER_DEFAULTS there.
   A folder with paper case study sheets inside and a frosted glass front. CC's flow (2026-11-26):
   closed neatly at rest; a click opens it and the papers float up into the air, peeking out (not
   hover: CC changed it); the paper under the pointer lifts higher, as if someone pulled it up; a click
   on the folder or anywhere else closes it.
   Depth without preserve-3d: every layer gets its own perspective() with the same vanishing point, so
   the layers stack in DOM order and the glass front can blur what's behind it (backdrop-filter).
   Sizes are in u = 1% of the card's width, so the desktop and phone cards share one set of dials.
   Settings live in this browser only (localStorage "studio-folder-5"). */
import { gsap } from "gsap";
import { FOLDER_DEFAULTS, FOLDER_CSS, createFolderCard } from "/case-folder.js";

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
const store = {
  get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const EASES = ["power1.out", "power2.out", "power3.out", "power4.out", "expo.out", "sine.out", "back.out(1.2)", "back.out(1.4)", "back.out(1.6)", "back.out(1.7)", "back.out(2)", "back.out(2.5)",
  "power2.inOut", "power3.inOut", "power4.inOut", "sine.inOut", "expo.inOut", "elastic.out(1, 0.6)"];
const COLORS = [["Purple", "#7b68d9"], ["Blue", "#4a8fe7"], ["Ink", "#2a2a2a"], ["Orange", "#f06a2a"], ["Sage", "#7fa58a"]];
const CARDS = [["White", "#ffffff", "#f2f2f2"], ["Black", "#141414", "#f2f2f2"], ["Lilac", "#eeecf8", "#f2f2f2"]];

const CSS = FOLDER_CSS + `
.fo-world { position:absolute; left:0; top:0; transform-origin:0 0; }
.fo-frame { position:absolute; }
.fo-frame .label { position:absolute; left:0; bottom:100%; padding-bottom:6px; white-space:nowrap; color:var(--muted); transform-origin:0 100%; font-size:12px; }
.fo-frame .label b { color:var(--text); font-weight:500; }
.fo-stage { display:flex; align-items:flex-end; gap:20px; padding:60px 0 60px; overflow:hidden; outline:1px solid var(--line-strong); }
.fo-stub { flex:none; background:#fff; opacity:.9; }
.fo-hint { position:absolute; left:12px; bottom:10px; color:var(--muted); background:rgba(255,255,255,.85); padding:4px 8px; border-radius:6px; }
`;
let fontsIn = false;
function loadFonts() {
  if (fontsIn) return; fontsIn = true;
  const st = document.createElement("style");
  st.textContent = `@font-face{font-family:"Switzer";font-weight:100 900;src:url("/fonts/Switzer-Variable.woff2") format("woff2")}
@font-face{font-family:"Geist Mono";font-weight:100 900;src:url("/fonts/GeistMono-Variable.woff2") format("woff2")}${CSS}`;
  document.head.append(st);
}

/* ---------------- the tab: canvas, states and inspector ---------------- */
export function createFolder({ canvas, onZoom }) {
  loadFonts();
  // keep CC's earlier settings, but start the opening's timing from the snappier defaults (2026-11-26)
  const SNAP = ["ajarDur", "ajarEase", "closerDur", "closerEase", "floatDur", "floatEase", "paperDelay", "closeDur", "closeEase", "stagger"];
  const before = store.get("studio-folder-4", {}); SNAP.forEach((k) => delete before[k]);
  let S = { ...FOLDER_DEFAULTS, ...before, ...store.get("studio-folder-5", {}) };
  const world = h("div", { class: "fo-world" });
  const hint = h("div", { class: "fo-hint" }, "Click the folder to open it · hover a paper · click the folder or outside to close · the phone card is to the right: drag or scroll to it · ⌘ + scroll to zoom");
  canvas.append(world, hint);
  let cards = [], frames = [], hold = "live", demo = null;

  const STATES = [
    ["live", "Live", "Hover and click as on the site"],
    ["closed", "Closed", "At rest"],
    ["open", "Open", "After a click: the papers peek out"],
    ...[1, 2, 3, 4, 5, 6].map((c) => [`pull${c}`, `Case study ${c} lifted`, "Hovering that paper"]),
  ];
  const stateOf = (id) => (id === "closed" ? {} : id === "open" ? { open: true } : { open: true, pulled: +id.slice(4) });

  function build() {
    cards.forEach((c) => c.kill());
    world.replaceChildren(); cards = []; frames = [];
    const specs = [["Desktop", S.cardW, false, "design size, before the slider scales it"], ["Phone", S.phoneW, true, "tap instead of hover"]];
    let x = 0;
    for (const [name, w, touch, note] of specs) {
      const c = createFolderCard(S, w, { touch });
      const H = Math.round(w * S.ratio), stubW = S.showNeighbours ? Math.round(w * 0.35) : 0;
      const stub = () => (S.showNeighbours ? h("div", { class: "fo-stub", style: `width:${stubW}px;height:${H}px;border-radius:${(S.radius * w) / 100}px` }) : null);
      const stage = h("div", { class: "fo-stage", style: `background:${S.pageBg};padding-left:${S.showNeighbours ? 0 : 40}px;padding-right:${S.showNeighbours ? 0 : 40}px;width:${(S.showNeighbours ? stubW * 2 + 40 : 80) + w}px` }, stub(), c.el, stub());
      const label = h("div", { class: "label" }, h("b", {}, name), ` · ${w} × ${H} · ${note}`);
      const fr = h("div", { class: "fo-frame", style: `left:${x}px;top:0` }, label, stage);
      world.append(fr); frames.push({ fr, label, w: (S.showNeighbours ? stubW * 2 + 40 : 80) + w, h: H + 120 });
      x += (S.showNeighbours ? stubW * 2 + 40 : 80) + w + 120;
      cards.push(c);
    }
    applyHold(false);
    setView(view);
  }
  function applyHold(animate = true) {
    cards.forEach((c) => { c.held = hold !== "live"; c.to(hold !== "live" ? stateOf(hold) : {}, animate); });
  }

  // pan and zoom, as on the main canvas
  let view = { x: 60, y: 80, z: 0.7 }, drag = null;
  function setView(v) {
    view = v;
    world.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`;
    canvas.style.backgroundSize = `${20 * v.z}px ${20 * v.z}px`;
    canvas.style.backgroundPosition = `${v.x}px ${v.y}px`;
    frames.forEach((f) => (f.label.style.transform = `scale(${1 / v.z})`));
    onZoom?.(v.z);
  }
  // fit: the desktop card fills the canvas, for a close look (CC); the phone card is to its right
  function fit() {
    const r = canvas.getBoundingClientRect(), f = frames[0];
    const z = Math.min(2.5, (r.width - 80) / f.w, (r.height - 60) / f.h);
    setView({ z, x: (r.width - f.w * z) / 2, y: (r.height - f.h * z) / 2 + 10 });
  }
  const zoomAt = (cx, cy, z) => { z = Math.min(4, Math.max(0.1, z)); setView({ z, x: cx - ((cx - view.x) / view.z) * z, y: cy - ((cy - view.y) / view.z) * z }); };
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) zoomAt(e.clientX - r.left, e.clientY - r.top, view.z * Math.exp(-e.deltaY * 0.01));
    else setView({ ...view, x: view.x - e.deltaX, y: view.y - e.deltaY });
  }, { passive: false });
  canvas.addEventListener("pointerdown", (e) => { if (e.target.closest(".fo-card") || e.button > 1) return; drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }; canvas.setPointerCapture(e.pointerId); canvas.classList.add("panning"); });
  canvas.addEventListener("pointermove", (e) => { if (drag) setView({ ...view, x: drag.vx + e.clientX - drag.x, y: drag.vy + e.clientY - drag.y }); });
  canvas.addEventListener("pointerup", () => { drag = null; canvas.classList.remove("panning"); });

  // Play: open, pull each sheet in turn, close
  function play() {
    stopDemo();
    hold = "live"; drawTree.el && drawTree(drawTree.el);
    cards.forEach((c) => (c.held = true));
    const steps = [[{ open: true }, 1.6]];
    for (let c = 1; c <= S.count; c++) steps.push([{ open: true, pulled: c }, 1.2]);
    steps.push([{ open: true }, 1], [{}, 1]);
    let t = 0.2;
    demo = gsap.timeline({ onComplete: stopDemo });
    for (const [s, wait] of steps) { demo.call(() => cards.forEach((c) => c.to(s)), null, t); t += wait / Math.max(0.05, S.speed); }
  }
  function stopDemo() { if (demo) { demo.kill(); demo = null; } cards.forEach((c) => (c.held = hold !== "live")); }

  /* ---- left panel: states, like Figma's variants ---- */
  function drawTree(el) {
    drawTree.el = el;
    el.replaceChildren(...STATES.filter(([id]) => !id.startsWith("pull") || +id.slice(4) <= S.count).map(([id, name, sub]) =>
      h("button", { class: "item two", "aria-selected": String(hold === id), onclick: () => { stopDemo(); hold = id; applyHold(); drawTree(el); } },
        h("span", { class: "dot" }), h("span", { class: "nm" }, name, h("small", {}, sub)))));
  }

  /* ---- inspector ---- */
  let syncers = [];
  function set(k, v, rebuild = true) {
    S[k] = v; store.set("studio-folder-5", S);
    if (rebuild) { build(); }
    syncers.forEach((f) => f());
  }
  const changed = (k) => JSON.stringify(S[k]) !== JSON.stringify(FOLDER_DEFAULTS[k]);
  function num(k, label, min, max, step, unit = "") {
    const range = h("input", { type: "range", min, max, step }), box = h("input", { class: "num", type: "text", inputmode: "decimal" });
    const el = h("div", { class: "row" }, h("label", {}, label), range, box);
    const f = (v) => (step >= 1 ? String(Math.round(v)) : String(+(+v).toFixed(String(step).split(".")[1]?.length || 2)));
    const sync = () => { range.value = S[k]; if (document.activeElement !== box) box.value = f(S[k]) + (unit ? ` ${unit}` : ""); el.classList.toggle("changed", changed(k)); };
    range.addEventListener("input", () => set(k, +range.value));
    box.addEventListener("focus", () => { box.value = f(S[k]); box.select(); });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter") box.blur();
      if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); set(k, +(S[k] + (e.key === "ArrowUp" ? 1 : -1) * step * (e.shiftKey ? 10 : 1)).toFixed(4)); box.value = f(S[k]); }
    });
    box.addEventListener("blur", () => { const v = parseFloat(box.value); if (Number.isFinite(v)) set(k, v); sync(); });
    syncers.push(sync); sync();
    return el;
  }
  function color(k, label) {
    const pick = h("input", { type: "color" }), hex = h("input", { class: "hex", spellcheck: "false" });
    const el = h("div", { class: "row wide" }, h("label", {}, label), h("div", { class: "color" }, pick, hex));
    const sync = () => { pick.value = S[k]; if (document.activeElement !== hex) hex.value = S[k]; el.classList.toggle("changed", changed(k)); };
    pick.addEventListener("input", () => set(k, pick.value));
    hex.addEventListener("keydown", (e) => { if (e.key === "Enter") hex.blur(); });
    hex.addEventListener("blur", () => { let v = hex.value.trim(); if (!v.startsWith("#")) v = `#${v}`; if (/^#[0-9a-f]{6}$/i.test(v)) set(k, v.toLowerCase()); sync(); });
    syncers.push(sync); sync();
    return el;
  }
  function ease(k, label) {
    const sel = h("select", {}, ...EASES.map((e) => h("option", { value: e }, e)));
    const el = h("div", { class: "row wide" }, h("label", {}, label), sel);
    const sync = () => { sel.value = S[k]; el.classList.toggle("changed", changed(k)); };
    sel.addEventListener("change", () => set(k, sel.value, false));
    syncers.push(sync); sync();
    return el;
  }
  function toggle(k, label) {
    const b = h("button", { class: "chip" });
    const sync = () => { b.textContent = `${label}: ${S[k] ? "on" : "off"}`; b.setAttribute("aria-pressed", String(S[k])); };
    b.onclick = () => set(k, !S[k]);
    syncers.push(sync); sync();
    return b;
  }
  const swatches = (items, apply, isOn) => {
    const bs = items.map(([name, ...v]) => h("button", { class: "tile", onclick: () => apply(v) }, h("span", { class: "sq", style: `background:${v[0]}` }), name));
    const sync = () => bs.forEach((b, i) => b.setAttribute("aria-pressed", String(isOn(items[i].slice(1)))));
    syncers.push(sync); sync();
    return h("div", { class: "tiles" }, ...bs);
  };
  const sec = (title, keys, ...rows) => {
    const reset = h("button", { class: "reset", onclick: () => { keys.forEach((k) => (S[k] = FOLDER_DEFAULTS[k])); set(keys[0], S[keys[0]]); } }, "Reset");
    const sync = () => { reset.hidden = !keys.some(changed); };
    syncers.push(sync); sync();
    return h("div", { class: "sec" }, h("h3", {}, title, reset), ...rows);
  };

  function drawInspector(el) {
    syncers = [];
    el.replaceChildren(
      h("h2", {}, "Case studies folder"),
      h("p", { class: "about" }, "The Case studies card on the site. The dials preview changes here only (in this browser); the site uses the saved defaults. The case study names are placeholders."),
      sec("Preview", ["speed"],
        h("div", { class: "chips" }, h("button", { class: "chip", onclick: play }, "▶ Play the sequence"),
          ...[0.25, 0.5, 1].map((v) => { const b = h("button", { class: "chip", onclick: () => set("speed", v, false) }, `${v}×`); syncers.push(() => b.setAttribute("aria-pressed", String(S.speed === v))); return b; }))),
      sec("Folder", ["color", "folderW", "bodyH", "baseY", "tabW", "tabH", "corner"],
        swatches(COLORS, ([c]) => set("color", c), ([c]) => S.color === c),
        color("color", "Colour"), num("folderW", "Width", 40, 95, 1, "%"), num("bodyH", "Height", 30, 80, 1, "%"),
        num("baseY", "From bottom", 0, 40, 1, "%"), num("tabW", "Tab width", 15, 60, 1, "%"), num("tabH", "Tab height", 2, 14, 0.5), num("corner", "Corners", 0, 12, 0.5)),
      sec("Glass front", ["frontH", "glass", "frost", "sheen", "title"],
        num("frontH", "Height", 30, 100, 1, "%"), num("glass", "Tint", 0.2, 1, 0.01), num("frost", "Frost", 0, 40, 1, "px"), num("sheen", "Top light", 0, 1, 0.01),
        h("div", { class: "chips" }, toggle("title", "Title"))),
      sec("Papers", ["count", "sheetColor", "sheetH", "inset"],
        num("count", "How many", 1, 6, 1), color("sheetColor", "Colour"), num("sheetH", "Height", 10, 50, 0.5), num("inset", "Side margin", 0, 15, 0.5)),
      sec("Closed", ["peekC", "stepC"],
        num("peekC", "Papers show", -15, 20, 0.5), num("stepC", "Step", 0, 15, 0.5)),
      sec("Click: the folder opens", ["tilt", "backTilt", "ajarDur", "ajarEase", "closeDur", "closeEase"],
        num("tilt", "Front tips", 0, 40, 0.5, "°"), num("backTilt", "Back tips", -20, 20, 0.5, "°"),
        num("ajarDur", "Open time", 0.1, 2.5, 0.05, "s"), ease("ajarEase", "Open ease"), num("closeDur", "Close time", 0.1, 2, 0.05, "s"), ease("closeEase", "Close ease")),
      sec("Depth and shadow", ["persp", "vp", "shadow", "contact", "shadowShift"],
        num("persp", "Perspective", 60, 600, 5), num("vp", "Look from", -200, 50, 1, "%"),
        num("shadow", "Soft shadow", 0, 0.5, 0.01), num("contact", "Contact shadow", 0, 0.8, 0.01), num("shadowShift", "Moves with mouse", 0, 10, 0.1)),
      sec("Mouse over and press", ["hoverLift", "hoverScale", "hoverDur", "tiltHover", "tiltPress", "pressScale"],
        num("hoverLift", "Lifts on hover", 0, 8, 0.1), num("hoverScale", "Grows on hover", 1, 1.08, 0.005, "×"), num("hoverDur", "Hover time", 0.1, 1.5, 0.05, "s"),
        num("tiltHover", "Tilt on hover", 0, 15, 0.5, "°"), num("tiltPress", "Tilt on press", 0, 20, 0.5, "°"), num("pressScale", "Press sinks to", 0.9, 1, 0.005, "×")),
      sec("…and comes closer to you", ["closer", "closerY", "closerTilt", "closerDur", "closerEase"],
        num("closer", "How close", 1, 1.3, 0.005, "×"), num("closerY", "Rises", -10, 15, 0.5), num("closerTilt", "Tips to you", -10, 15, 0.5, "°"),
        num("closerDur", "Time", 0.2, 4, 0.05, "s"), ease("closerEase", "Ease")),
      sec("…and the papers float up", ["rise", "step", "fanZ", "float", "floatTime", "floatDur", "floatEase", "paperDelay", "stagger"],
        num("rise", "Float up", 0, 50, 0.5), num("step", "Gap between", 0, 25, 0.5), num("fanZ", "Depth between", 0, 20, 0.5),
        num("float", "Mid-air bob", 0, 3, 0.1), num("floatTime", "Bob time", 1, 6, 0.1, "s"),
        num("floatDur", "Float time", 0.1, 2, 0.05, "s"), ease("floatEase", "Float ease"), num("paperDelay", "Start after", 0, 1, 0.05, "s"),
        num("stagger", "Stagger", 0, 0.3, 0.01, "s")),
      sec("Hover a paper: it lifts higher", ["pull", "wash", "washColor", "pullZ", "sink", "room", "twist", "tiltMax", "tiltBack", "pullDur", "pullEase"],
        num("pull", "Lift", 0, 50, 0.5), num("wash", "Others wash", 0, 1, 0.01), color("washColor", "Wash colour"), num("pullZ", "Comes forward", -20, 30, 0.5), num("sink", "Others drop", 0, 20, 0.5),
        h("div", { class: "chips" }, toggle("room", "Papers behind move up too")),
        num("twist", "Tip to the side", 0, 10, 0.1, "°"), num("tiltMax", "Follow the mouse", 0, 20, 0.5, "°"), ease("tiltBack", "Spring back"),
        num("pullDur", "Time", 0.1, 1.5, 0.05, "s"), ease("pullEase", "Ease")),
      sec("Card and page", ["cardBg", "pageBg", "ratio", "radius", "showCard", "showNeighbours", "spill"],
        swatches(CARDS, ([c, p]) => { S.pageBg = p; set("cardBg", c); }, ([c]) => S.cardBg === c),
        color("cardBg", "Card"), color("pageBg", "Page"), num("ratio", "Height", 0.6, 1.6, 0.01, "× width"), num("radius", "Corners", 0, 8, 0.1),
        h("div", { class: "chips" }, toggle("showCard", "Card background"), toggle("showNeighbours", "Cards beside it"), toggle("spill", "Open past the card's edge"))),
      h("div", { class: "sec" }, h("button", { class: "chip", onclick: () => { S = { ...FOLDER_DEFAULTS }; store.set("studio-folder-5", S); build(); drawInspector(el); } }, "Reset everything")),
    );
    syncers.forEach((f) => f());
  }

  build();
  return {
    show(on) { canvas.hidden = !on; if (on) requestAnimationFrame(fit); else stopDemo(); },
    fit, play, drawTree, drawInspector,
    zoomBy(k) { const r = canvas.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, view.z * k); },
  };
}
