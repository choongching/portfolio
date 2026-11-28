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
/* the inspector (.pi): scoped, so the Style and Page tabs keep their own look */
.pi { padding-bottom:16px; }
.pi-top { padding:14px 14px 8px; }
.pi-top h2 { font-size:13px; font-weight:600; padding:0; }
.pi-about { color:var(--muted); font-size:11px; line-height:1.45; margin-top:3px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.pi-bar { position:sticky; top:0; z-index:2; background:var(--bg); padding:8px 14px 10px; border-bottom:1px solid var(--line); display:flex; flex-direction:column; gap:8px; }
.pi-barrow { display:flex; gap:6px; align-items:center; }
.pi-play { height:28px; padding:0 12px; border-radius:7px; background:var(--text); color:#fff; font-weight:500; }
.pi-play:hover { background:#000; }
.pi-ghost { height:28px; padding:0 8px; border-radius:7px; color:var(--muted); }
.pi-ghost:hover { background:var(--hover); color:var(--text); }
.pi-barrow .pi-ghost { margin-left:auto; }
.pi-search { height:30px; width:100%; box-sizing:border-box; border:1px solid var(--line); border-radius:7px; padding:0 10px; background:#fafafa; }
.pi-search:focus { outline:2px solid var(--accent-soft); border-color:var(--accent); background:#fff; }
.pi-seg { display:flex; background:var(--hover); border-radius:7px; padding:2px; gap:2px; min-width:0; }
.pi-seg button { flex:1 1 0; min-width:0; height:24px; padding:0 6px; border-radius:5px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11.5px; }
.pi-seg button:hover { color:var(--text); }
.pi-seg button[aria-pressed="true"] { background:#fff; color:var(--text); box-shadow:0 0 0 1px var(--line), 0 1px 2px rgba(0,0,0,.06); font-weight:500; }
.pi-speed { flex:none; }
.pi-speed button { flex:none; padding:0 7px; }
.pi-tabs button { height:26px; font-size:12px; }
.pi-tabs[hidden] { display:none; }
.pi-sec { border-bottom:1px solid var(--line); }
.pi-sec[hidden] { display:none; }
.pi-headrow { display:flex; align-items:center; padding:0 10px 0 6px; }
.pi-head { flex:1; display:flex; align-items:center; gap:6px; height:36px; padding:0 4px; text-align:left; font-weight:600; font-size:12px; color:var(--text); }
.pi-chev { width:14px; height:14px; flex:none; position:relative; }
.pi-chev::before { content:""; position:absolute; left:4px; top:3px; width:5px; height:5px; border-right:1.5px solid var(--faint); border-bottom:1.5px solid var(--faint); transform:rotate(-45deg); transition:transform .15s; }
.pi-sec[data-open="true"] .pi-chev::before { transform:translate(0,1px) rotate(45deg); }
.pi-badge { min-width:16px; height:16px; padding:0 5px; border-radius:8px; background:var(--accent-soft); color:var(--accent); font-size:10px; font-weight:600; line-height:16px; text-align:center; box-sizing:border-box; }
.pi-badge[hidden] { display:none; }
.pi-reset { font-size:11px; color:var(--accent); padding:2px 4px; border-radius:4px; }
.pi-reset:hover { background:var(--accent-soft); }
.pi-reset[hidden] { display:none; }
.pi-body { padding:0 14px 12px; display:flex; flex-direction:column; gap:2px; }
.pi-sec:not([data-open="true"]) .pi-body { display:none; }
.pi-body > [hidden] { display:none !important; }
.pi .row { grid-template-columns:104px 1fr 54px; gap:8px; min-height:30px; }
.pi .row > * { min-width:0; }
.pi .row.wide { grid-template-columns:104px 1fr; }
.pi .row label { color:var(--muted); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:default; }
.pi .row.changed label { color:var(--text); font-weight:500; }
.pi .row.changed label::after { content:""; display:inline-block; width:5px; height:5px; border-radius:50%; background:var(--accent); margin-left:5px; vertical-align:middle; }
.pi .num { height:26px; font-size:11.5px; font-variant-numeric:tabular-nums; }
.pi select { height:28px; border-radius:6px; }
.pi-sub { font-size:10.5px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; color:var(--faint); margin:10px 0 2px; }
.pi-body > .pi-sub:first-child { margin-top:2px; }
.pi-sw label { cursor:pointer !important; }
.pi-switch { justify-self:end; width:30px; height:18px; border-radius:9px; background:var(--line-strong); position:relative; transition:background .15s; flex:none; }
.pi-switch span { position:absolute; left:2px; top:2px; width:14px; height:14px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,.2); transition:transform .15s; }
.pi-switch[aria-checked="true"] { background:var(--accent); }
.pi-switch[aria-checked="true"] span { transform:translateX(12px); }
.pi-color { display:flex; align-items:center; gap:0; box-sizing:border-box; width:100%; border:1px solid var(--line); border-radius:6px; height:28px; padding:0 2px 0 3px; background:#fff; }
.pi-color input[type=color] { width:22px; height:22px; border:0; padding:0; background:none; border-radius:4px; flex:none; }
.pi-color input[type=color]::-webkit-color-swatch-wrapper { padding:0; }
.pi-color input[type=color]::-webkit-color-swatch { border:1px solid rgba(0,0,0,.12); border-radius:4px; }
.pi-color .hex { border:0; height:24px; flex:1; min-width:0; width:auto; outline:none; }
.pi-dots { display:flex; align-items:center; gap:4px; flex-wrap:wrap; min-height:30px; padding:3px 0; }
.pi-dot { width:21px; height:21px; flex:none; border-radius:50%; padding:2px; border:1.5px solid transparent; }
.pi-dot span { display:block; width:100%; height:100%; border-radius:50%; box-shadow:inset 0 0 0 1px rgba(0,0,0,.14); }
.pi-dot:hover { border-color:var(--line-strong); }
.pi-dot[aria-pressed="true"] { border-color:var(--accent); }
.pi-cur { font-size:11px; color:var(--faint); margin-left:2px; }
.pi-chips { display:flex; gap:4px; flex-wrap:wrap; }
.pi-chips button { height:24px; padding:0 8px; border:1px solid var(--line); border-radius:6px; color:var(--muted); font-size:11.5px; }
.pi-chips button:hover { color:var(--text); border-color:var(--line-strong); }
.pi .chips { display:contents; }
.pi .chips > .chip { align-self:flex-start; }
.pi-empty { padding:16px 14px; color:var(--muted); }
.pi-empty[hidden] { display:none; }
.pi-foot { display:flex; align-items:center; padding:12px 14px 0; color:var(--faint); font-size:11px; }
.pi-foot .pi-ghost { margin-left:auto; }
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

  /* ---- inspector, in SaaS-inspector patterns (CC, 2026-11-28: "clean up, tidy up, using SaaS UI and UX
     patterns"): a sticky bar (Play, speed, search, Design / Motion / Canvas tabs); collapsible sections that
     remember whether they're open and count the values that differ from the defaults; one row per control,
     label on the left; switches for on/off; a segmented control (up to 4 options) or a menu for a choice;
     colour presets as small swatches. ---- */
  const ui = store.get(`${storeKey}:ui`, { tab: "Design", open: {} });
  const saveUi = () => store.set(`${storeKey}:ui`, ui);
  let query = "", syncers = [], view2 = () => {};
  function set(k, v, rebuild = true) {
    S[k] = v; store.set(storeKey, S);
    if (rebuild) { build(); if (k === "compare" || k === "dribbble") requestAnimationFrame(fit); }
    syncers.forEach((f) => f());
  }
  const changed = (k) => JSON.stringify(S[k]) !== JSON.stringify(defaults[k]);
  const mark = (el, keys) => syncers.push(() => el.classList.toggle("changed", keys.some(changed)));
  function num(k, label, min, max, step, unit = "") {
    const range = h("input", { type: "range", min, max, step, "aria-label": label }), box = h("input", { class: "num", type: "text", inputmode: "decimal", "aria-label": label });
    const el = h("div", { class: "row" }, h("label", { title: label }, label), range, box);
    const f = (v) => (step >= 1 ? String(Math.round(v)) : String(+(+v).toFixed(String(step).split(".")[1]?.length || 2)));
    const sync = () => { range.value = S[k]; if (document.activeElement !== box) box.value = f(S[k]) + (unit ? ` ${unit}` : ""); };
    range.addEventListener("input", () => set(k, +range.value));
    // double-click the label: back to the default
    el.firstChild.addEventListener("dblclick", () => set(k, defaults[k]));
    box.addEventListener("focus", () => { box.value = f(S[k]); box.select(); });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter") box.blur();
      if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); set(k, +(S[k] + (e.key === "ArrowUp" ? 1 : -1) * step * (e.shiftKey ? 10 : 1)).toFixed(4)); box.value = f(S[k]); }
    });
    box.addEventListener("blur", () => { const v = parseFloat(box.value); if (Number.isFinite(v)) set(k, v); sync(); });
    syncers.push(sync); mark(el, [k]);
    return el;
  }
  function color(k, label) {
    const pick = h("input", { type: "color", "aria-label": label }), hex = h("input", { class: "hex", spellcheck: "false", "aria-label": `${label} hex` });
    const el = h("div", { class: "row wide" }, h("label", {}, label), h("div", { class: "pi-color" }, pick, hex));
    const sync = () => { if (/^#[0-9a-f]{6}$/i.test(S[k])) pick.value = S[k]; if (document.activeElement !== hex) hex.value = S[k]; };
    pick.addEventListener("input", () => set(k, pick.value));
    hex.addEventListener("keydown", (e) => { if (e.key === "Enter") hex.blur(); });
    hex.addEventListener("blur", () => { let v = hex.value.trim(); if (!v.startsWith("#")) v = `#${v}`; if (/^#[0-9a-f]{6}$/i.test(v)) set(k, v.toLowerCase()); sync(); });
    syncers.push(sync); mark(el, [k]);
    return el;
  }
  function ease(k, label) {
    const sel = h("select", { "aria-label": label }, ...EASES.map((e) => h("option", { value: e }, e)));
    const el = h("div", { class: "row wide" }, h("label", {}, label), sel);
    sel.addEventListener("change", () => set(k, sel.value, false));
    syncers.push(() => { sel.value = S[k]; }); mark(el, [k]);
    return el;
  }
  // on/off: a switch at the end of the row (the label toggles it too)
  function toggle(k, label) {
    const sw = h("button", { class: "pi-switch", role: "switch", "aria-label": label }, h("span"));
    const el = h("div", { class: "row wide pi-sw" }, h("label", {}, label), sw);
    sw.onclick = () => set(k, !S[k]);
    el.firstChild.onclick = () => set(k, !S[k]);
    syncers.push(() => sw.setAttribute("aria-checked", String(!!S[k]))); mark(el, [k]);
    return el;
  }
  // one of several: a segmented control for up to 4 short options, a menu for more
  function choice(k, label, opts, pick = (v) => set(k, v)) {
    let ctl, sync;
    if (opts.length <= 4) {
      const bs = opts.map(([v, n]) => h("button", { type: "button", onclick: () => pick(v) }, n));
      ctl = h("div", { class: "pi-seg", role: "group", "aria-label": label }, ...bs);
      sync = () => bs.forEach((b, i) => b.setAttribute("aria-pressed", String(S[k] === opts[i][0])));
    } else {
      ctl = h("select", { "aria-label": label }, ...opts.map(([v, n]) => h("option", { value: v }, n)));
      ctl.addEventListener("change", () => pick(ctl.value));
      sync = () => { ctl.value = S[k]; };
    }
    const el = h("div", { class: "row wide" }, h("label", {}, label), ctl);
    syncers.push(sync); mark(el, [k]);
    return el;
  }
  // colour presets: small swatches (a three-colour set shows as stripes), the picked one's name beside them
  const swatches = (items, apply, isOn, label = "Presets") => {
    const fill = (v) => { const c = v.filter((x) => typeof x === "string" && x.startsWith("#")); return c.length >= 3 ? `linear-gradient(90deg, ${c[0]} 0 33%, ${c[1]} 33% 66%, ${c[2]} 66%)` : c[0]; };
    const bs = items.map(([name, ...v]) => h("button", { class: "pi-dot", type: "button", title: name, "aria-label": name, onclick: () => apply(v) }, h("span", { style: `background:${fill(v)}` })));
    syncers.push(() => bs.forEach((b, i) => b.setAttribute("aria-pressed", String(!!isOn(items[i].slice(1))))));
    return h("div", { class: "row wide pi-presets" }, h("label", {}, label), h("div", { class: "pi-dots" }, ...bs));
  };
  // a small heading inside a long section
  const sub = (title) => h("div", { class: "pi-sub" }, title);
  // a section: { title, tab, id } or just a title. Closed sections keep their place; the first section of each
  // tab starts open
  const sec = (meta, keys, ...rows) => {
    const { title, tab = "Design", id: sid = title } = typeof meta === "string" ? { title: meta } : meta;
    const badge = h("span", { class: "pi-badge", title: "Changed from the defaults" });
    const reset = h("button", { class: "pi-reset", type: "button", onclick: () => { keys.forEach((k) => (S[k] = defaults[k])); set(keys[0], S[keys[0]]); } }, "Reset");
    const head = h("button", { class: "pi-head", type: "button", onclick: () => { ui.open[sid] = el.dataset.open !== "true"; saveUi(); view2(); } },
      h("span", { class: "pi-chev", "aria-hidden": "true" }), h("span", { class: "pi-title" }, title), badge);
    const el = h("section", { class: "pi-sec", "data-tab": tab, "data-id": sid }, h("div", { class: "pi-headrow" }, head, reset), h("div", { class: "pi-body" }, ...rows));
    syncers.push(() => { const n = keys.filter(changed).length; badge.textContent = n ? String(n) : ""; badge.hidden = !n; reset.hidden = !n; });
    return el;
  };

  function drawInspector(el) {
    syncers = [];
    const redraw = () => drawInspector(el);
    const ctx = { S, set, num, color, ease, toggle, choice, swatches, sub, sec, h, redraw };
    const secs = sections(ctx).filter(Boolean);
    const tabs = ["Design", "Motion", "Canvas"].filter((t) => secs.some((x) => x.dataset.tab === t));
    if (!tabs.includes(ui.tab)) ui.tab = tabs[0];
    // the bar: play and speed, search, tabs
    const search = h("input", { class: "pi-search", type: "search", placeholder: "Search controls", "aria-label": "Search controls", value: query });
    search.addEventListener("input", () => { query = search.value.trim().toLowerCase(); view2(); });
    search.addEventListener("keydown", (e) => { if (e.key === "Escape") { search.value = ""; query = ""; view2(); search.blur(); } });
    const speeds = [0.25, 0.5, 1].map((v) => { const b = h("button", { type: "button", onclick: () => set("speed", v, false) }, `${v}×`); syncers.push(() => b.setAttribute("aria-pressed", String(S.speed === v))); return b; });
    const tabBs = tabs.map((t) => h("button", { type: "button", onclick: () => { ui.tab = t; saveUi(); view2(); } }, t));
    const total = h("span", { class: "pi-total" });
    syncers.push(() => { const n = Object.keys(defaults).filter(changed).length; total.textContent = n ? `${n} changed` : "All defaults"; });
    const bar = h("div", { class: "pi-bar" },
      h("div", { class: "pi-barrow" },
        h("button", { class: "pi-play", type: "button", onclick: play }, "▶ Play"),
        h("div", { class: "pi-seg pi-speed", role: "group", "aria-label": "Speed" }, ...speeds),
        h("button", { class: "pi-ghost", type: "button", onclick: recordView, title: "The first frame at 800 × 600 on screen: 1600 × 1200 when recorded on a Retina screen (Dribbble's size)" }, "Rec size")),
      search,
      tabs.length > 1 ? h("div", { class: "pi-seg pi-tabs", role: "tablist" }, ...tabBs) : null);
    const empty = h("p", { class: "pi-empty" }, "No controls match.");
    el.replaceChildren(
      h("div", { class: "pi" },
        h("div", { class: "pi-top" }, h("h2", {}, title), h("p", { class: "pi-about", title: about }, about)),
        bar, ...secs, empty,
        h("div", { class: "pi-foot" }, total,
          h("button", { class: "pi-ghost", type: "button", onclick: () => { S = { ...defaults }; store.set(storeKey, S); build(); redraw(); } }, "Reset everything"))));
    view2 = () => {
      tabBs.forEach((b, i) => b.setAttribute("aria-pressed", String(tabs[i] === ui.tab)));
      let any = false;
      const firstOf = {};
      for (const x of secs) {
        const t = x.dataset.tab;
        if (!(t in firstOf)) firstOf[t] = x.dataset.id;
        const rows = [...x.querySelectorAll(".pi-body > *")];
        if (query) {
          // search: every tab; a section whose title matches shows whole, otherwise only the matching rows
          const whole = x.querySelector(".pi-title").textContent.toLowerCase().includes(query);
          let hits = 0;
          rows.forEach((r) => { const ok = whole || (!r.classList.contains("pi-sub") && r.textContent.toLowerCase().includes(query)); r.hidden = !ok; hits += ok; });
          x.hidden = !hits; x.dataset.open = "true"; any ||= hits > 0;
        } else {
          rows.forEach((r) => (r.hidden = false));
          x.hidden = t !== ui.tab;
          x.dataset.open = String(ui.open[x.dataset.id] ?? firstOf[t] === x.dataset.id);
        }
        x.querySelector(".pi-head").setAttribute("aria-expanded", x.dataset.open);
      }
      empty.hidden = !query || any;
      el.querySelector(".pi-tabs")?.toggleAttribute("hidden", !!query);
    };
    view2();
    syncers.forEach((f) => f());
  }

  build();
  return {
    show(on) { canvas.hidden = !on; if (on) requestAnimationFrame(fit); else stopDemo(); },
    fit, play, drawTree, drawInspector,
    zoomBy(k) { const r = canvas.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, view.z * k); },
  };
}
