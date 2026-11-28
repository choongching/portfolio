/* A studio tab for one card prototype (the Folder and the Drawer tabs): both card sizes on a pan/zoom
   canvas, states on the left (like Figma's variants), dials on the right, Play. The card module gives
   createCard(S, width, { touch }) → { el, held, to(state, animate), state, kill }.
   Settings live in this browser only (localStorage[storeKey]). */
import { gsap } from "gsap";

export const h = (tag, attrs = {}, ...kids) => {
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
export const store = {
  get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
export const EASES = ["none", "power1.out", "power2.out", "power3.out", "power4.out", "expo.out", "sine.out", "back.out(1.2)", "back.out(1.4)", "back.out(1.6)", "back.out(1.7)", "back.out(2)", "back.out(2.5)",
  "power1.inOut", "power2.inOut", "power3.inOut", "power4.inOut", "sine.inOut", "expo.inOut", "elastic.out(1, 0.6)"];

const CSS = `
.fo-world { position:absolute; left:0; top:0; transform-origin:0 0; }
.fo-frame { position:absolute; }
.fo-frame .label { position:absolute; left:0; bottom:100%; padding-bottom:6px; white-space:nowrap; color:var(--muted); transform-origin:0 100%; font-size:12px; }
.fo-frame .label b { color:var(--text); font-weight:500; }
.fo-stage { display:flex; align-items:flex-end; gap:20px; padding:60px 0 60px; overflow:hidden; outline:1px solid var(--line-strong); }
.fo-stub { flex:none; background:#fff; opacity:.9; }
.fo-hint { position:absolute; left:12px; bottom:10px; color:var(--muted); background:rgba(255,255,255,.85); padding:4px 8px; border-radius:6px; }
`;
let styled = false;
function addStyles(extra) {
  if (!styled) {
    styled = true;
    const st = document.createElement("style");
    st.textContent = `@font-face{font-family:"Switzer";font-weight:100 900;src:url("/fonts/Switzer-Variable.woff2") format("woff2")}
@font-face{font-family:"Geist Mono";font-weight:100 900;src:url("/fonts/GeistMono-Variable.woff2") format("woff2")}${CSS}`;
    document.head.append(st);
  }
  if (extra && !document.querySelector(`style[data-proto="${extra.id}"]`)) {
    const st = document.createElement("style"); st.dataset.proto = extra.id; st.textContent = extra.css; document.head.append(st);
  }
}

export function createProtoTab({ canvas, onZoom, id, css, title, about, hint, defaults, initial, storeKey, createCard, states, stateOf, playSteps, sections, frames: framesOf, frameGap = 120 }) {
  addStyles({ id, css });
  let S = { ...defaults, ...(initial || {}), ...store.get(storeKey, {}) };
  const world = h("div", { class: "fo-world" });
  canvas.append(world, h("div", { class: "fo-hint" }, hint));
  let cards = [], frames = [], hold = "live", demo = null;
  function build() {
    cards.forEach((c) => c.kill());
    world.replaceChildren(); cards = []; frames = [];
    // the frames: desktop and phone, or the tab's own list (e.g. variants side by side)
    const specs = framesOf?.(S) || [{ name: "Desktop", w: S.cardW, touch: false, note: "design size, before the slider scales it" }, { name: "Phone", w: S.phoneW, touch: true, note: "tap instead of hover" }];
    let x = 0;
    for (const { name, w, touch, note, over, box } of specs) {
      const c = createCard({ ...S, ...over }, w, { touch }); c.el.dataset.card = "";
      const H = Math.round(w * S.ratio), stubW = S.showNeighbours ? Math.round(w * 0.35) : 0;
      let stage, fw, fh, size;
      if (box) {
        // a fixed frame (e.g. Dribbble's 4:3), the card centred in it on the page colour
        [fw, fh] = box;
        stage = h("div", { class: "fo-stage", style: `background:${S.pageBg};width:${fw}px;height:${fh}px;padding:0;align-items:center;justify-content:center;box-sizing:border-box` }, c.el);
        size = `${fw} × ${fh}`;
      } else {
        const stub = () => (S.showNeighbours ? h("div", { class: "fo-stub", style: `width:${stubW}px;height:${H}px;border-radius:${(S.radius * w) / 100}px` }) : null);
        fw = (S.showNeighbours ? stubW * 2 + 40 : 80) + w; fh = H + 120; size = `${w} × ${H}`;
        stage = h("div", { class: "fo-stage", style: `background:${S.pageBg};padding-left:${S.showNeighbours ? 0 : 40}px;padding-right:${S.showNeighbours ? 0 : 40}px;width:${fw}px` }, stub(), c.el, stub());
      }
      // note: null gives a bare one-word label (CC, 2026-11-28: "simple one word label style"); the size
      // moves to its tooltip
      const label = note === null ? h("div", { class: "label", title: size }, h("b", {}, name)) : h("div", { class: "label" }, h("b", {}, name), ` · ${size} · ${note}`);
      const fr = h("div", { class: "fo-frame", style: `left:${x}px;top:0` }, label, stage);
      world.append(fr); frames.push({ fr, label, w: fw, h: fh });
      x += fw + frameGap;
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
  // fit: the desktop card fills the canvas, for a close look (CC); the phone card is to its right.
  // A tab's own frames (variants side by side) all fit.
  function fit() {
    const r = canvas.getBoundingClientRect(), all = !!framesOf?.(S);
    const w = all ? frames.reduce((a, f) => a + f.w, 0) + frameGap * (frames.length - 1) : frames[0].w, hh = Math.max(...frames.map((f) => f.h));
    const z = Math.min(2.5, (r.width - 80) / w, (r.height - 60) / hh);
    setView({ z, x: (r.width - w * z) / 2, y: (r.height - hh * z) / 2 + 10 });
  }
  // for screen recording: the first frame at exactly 800 css px wide (1600 px on a Retina screen), centred
  function recordView() {
    const r = canvas.getBoundingClientRect(), f = frames[0], z = 800 / f.w;
    setView({ z, x: (r.width - f.w * z) / 2, y: (r.height - f.h * z) / 2 });
  }
  const zoomAt = (cx, cy, z) => { z = Math.min(4, Math.max(0.1, z)); setView({ z, x: cx - ((cx - view.x) / view.z) * z, y: cy - ((cy - view.y) / view.z) * z }); };
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) zoomAt(e.clientX - r.left, e.clientY - r.top, view.z * Math.exp(-e.deltaY * 0.01));
    else setView({ ...view, x: view.x - e.deltaX, y: view.y - e.deltaY });
  }, { passive: false });
  canvas.addEventListener("pointerdown", (e) => { if (e.target.closest("[data-card]") || e.button > 1) return; drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }; canvas.setPointerCapture(e.pointerId); canvas.classList.add("panning"); });
  canvas.addEventListener("pointermove", (e) => { if (drag) setView({ ...view, x: drag.vx + e.clientX - drag.x, y: drag.vy + e.clientY - drag.y }); });
  canvas.addEventListener("pointerup", () => { drag = null; canvas.classList.remove("panning"); });

  // Play: open, pull each sheet in turn, close
  function play() {
    stopDemo();
    hold = "live"; drawTree.el && drawTree(drawTree.el);
    cards.forEach((c) => (c.held = true));
    const steps = playSteps(S);
    let t = 0.2;
    demo = gsap.timeline({ onComplete: stopDemo });
    for (const [s, wait] of steps) { demo.call(() => cards.forEach((c) => c.to(s)), null, t); t += wait / Math.max(0.05, S.speed); }
  }
  function stopDemo() { if (demo) { demo.kill(); demo = null; } cards.forEach((c) => (c.held = hold !== "live")); }

  /* ---- left panel: states, like Figma's variants ---- */
  function drawTree(el) {
    drawTree.el = el;
    el.replaceChildren(...states.filter(([id]) => { const m = /^(pull|pick)(\d+)$/.exec(id); return !m || +m[2] <= S.count; }).map(([id, name, sub]) =>
      h("button", { class: "item two", "aria-selected": String(hold === id), onclick: () => { stopDemo(); hold = id; applyHold(); drawTree(el); } },
        h("span", { class: "dot" }), h("span", { class: "nm" }, name, h("small", {}, sub)))));
  }

  /* ---- inspector ---- */
  let syncers = [];
  function set(k, v, rebuild = true) {
    S[k] = v; store.set(storeKey, S);
    if (rebuild) { build(); if (k === "compare" || k === "dribbble") requestAnimationFrame(fit); }
    syncers.forEach((f) => f());
  }
  const changed = (k) => JSON.stringify(S[k]) !== JSON.stringify(defaults[k]);
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
    const reset = h("button", { class: "reset", onclick: () => { keys.forEach((k) => (S[k] = defaults[k])); set(keys[0], S[keys[0]]); } }, "Reset");
    const sync = () => { reset.hidden = !keys.some(changed); };
    syncers.push(sync); sync();
    return h("div", { class: "sec" }, h("h3", {}, title, reset), ...rows);
  };

  function drawInspector(el) {
    syncers = [];
    const ctx = { S, set, num, color, ease, toggle, swatches, sec, h };
    el.replaceChildren(
      h("h2", {}, title),
      h("p", { class: "about" }, about),
      sec("Preview", ["speed"],
        h("div", { class: "chips" }, h("button", { class: "chip", onclick: play }, "▶ Play the sequence"),
          h("button", { class: "chip", onclick: recordView, title: "The first frame at 800 × 600 on screen: 1600 × 1200 when recorded on a Retina screen (Dribbble's size)" }, "Size for recording"),
          ...[0.25, 0.5, 1].map((v) => { const b = h("button", { class: "chip", onclick: () => set("speed", v, false) }, `${v}×`); syncers.push(() => b.setAttribute("aria-pressed", String(S.speed === v))); return b; }))),
      ...sections(ctx),
      h("div", { class: "sec" }, h("button", { class: "chip", onclick: () => { S = { ...defaults }; store.set(storeKey, S); build(); drawInspector(el); } }, "Reset everything")),
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
