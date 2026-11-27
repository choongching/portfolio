/* The motion studio (dev only): a design canvas with the real site in a desktop and a phone frame,
   playing the home intro (preloader, opening, logo flies home, cards come in). The inspector and the
   timeline edit SITE_DESIGN (designbycc-landing/site-design.js): the draft lives in localStorage
   ("studio-draft"), which the framed site (?studio) reads when it loads; Save writes the files.
   Served by the dev server at /__studio/ (vite.site.config.ts). */
import { gsap } from "gsap";
import { lookVars } from "/site-look.js";
import { tweaksCss } from "./tweaks.mjs";
import { createPage } from "./page.js";
import { createFolder } from "./folder.js";
import { createDrawer } from "./drawer.js";

const $ = (s, r = document) => r.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
  }
  kids.flat().forEach((c) => c != null && el.append(c));
  return el;
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const store = {
  get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};
const fmt = (v, step) => (step >= 1 ? String(Math.round(v)) : (+v.toFixed(String(step).split(".")[1]?.length || 2)).toString());

/* ---------------- what can be edited ---------------- */
const EASES = ["none", "power1.out", "power2.out", "power3.out", "power4.out", "expo.out", "sine.out", "back.out(1.4)",
  "power1.inOut", "power2.inOut", "power3.inOut", "power4.inOut", "expo.inOut", "sine.inOut",
  "power1.in", "power2.in", "power3.in", "expo.in", "elastic.out(1, 0.5)"];
const BEZIERS = [["Site", [0.83, 0, 0.17, 1]], ["Ease in-out", [0.65, 0, 0.35, 1]], ["Ease out", [0.16, 1, 0.3, 1]], ["Snappy", [0.7, 0, 0.2, 1]], ["Overshoot", [0.34, 1.56, 0.64, 1]]];
const SHADOWS = [
  ["None", { shadowX: 0, shadowY: 0, shadowBlur: 0, shadowSpread: 0, shadowOpacity: 0 }],
  ["Soft", { shadowX: 0, shadowY: 8, shadowBlur: 24, shadowSpread: 0, shadowColor: "#000000", shadowOpacity: 0.08 }],
  ["Lifted", { shadowX: 0, shadowY: 20, shadowBlur: 50, shadowSpread: -10, shadowColor: "#000000", shadowOpacity: 0.18 }],
  ["Tight", { shadowX: 0, shadowY: 1, shadowBlur: 3, shadowSpread: 0, shadowColor: "#000000", shadowOpacity: 0.12 }],
];
// Cards with a box (the clock is a circle and the spiral a cut-out: no outline or shadow for them).
const BOX_CARDS = [".c-slider-text", ".c-slider-card", ".c-slider-project", ".c-slider-responsive-text", ".c-slider-responsive-card", ".c-slider-responsive-project"].join(", ");
const sec = (k, label, min, max, step) => ({ type: "num", k, label, min, max, step, unit: "s" });
const LAYERS = [
  { id: "preloader", name: "Preloader", sel: ".c-preloader", info: true,
    about: "Two block C's stretch while the page loads, then open onto the opening.",
    notes: ['Its motion, colours and timing have their own editor: run <code>pnpm preloader:edit</code> (<a href="http://127.0.0.1:5179/docs/preloader/editor.html" target="_blank">open</a>).'] },
  { id: "opening", name: "Opening", sel: ".c-opening__stage .wm", info: true,
    about: "“designby” comes in, the flower draws, the media cut, the bots meet and the bold cc lands.",
    notes: ['The logo\'s size, place and the flower hold are in the logo tuner (<a href="/?tune" target="_blank">localhost:8080/?tune</a>). The opening\'s own motion is in <code>opening.js</code>.'] },
  { id: "logo", name: "Logo flies home", sel: ".js-b-header__logo", g: "logo",
    about: "The wordmark shrinks into the header corner, while the page comes in.",
    sections: [
      { title: "Desktop", frame: "desktop", rows: [sec("duration", "Duration", 0.2, 3, 0.05), sec("delay", "Delay", 0, 2, 0.05), { type: "bezier", k: "bezier", label: "Curve" }] },
      { title: "Phone", frame: "phone", rows: [sec("phoneDuration", "Duration", 0.2, 3, 0.05), sec("phoneDelay", "Delay", 0, 2, 0.05), { type: "ease", k: "phoneEase", label: "Ease" }] },
    ] },
  { id: "menu", name: "Menu fades in", sel: ".js-b-header__menu", g: "menu",
    about: "The header links fade in. Phones show a menu button instead, so this plays on desktop only.",
    sections: [{ title: "Desktop", frame: "desktop", rows: [sec("duration", "Duration", 0, 2, 0.05), sec("delay", "Delay", 0, 2, 0.05), { type: "ease", k: "ease", label: "Ease" }] }] },
  { id: "cards", name: "Cards come in", sel: ".c-slider__item, .c-slider-responsive__item", g: "cards",
    about: "Desktop: the slider flies in from the right, growing. Phones: the cards rise from below.",
    sections: [
      { title: "Desktop", frame: "desktop", rows: [sec("duration", "Duration", 0.1, 3, 0.05), sec("delay", "Delay", 0, 2, 0.05),
        { type: "num", k: "fromX", label: "Start right", min: 0, max: 150, step: 1, unit: "%" },
        { type: "num", k: "fromScale", label: "Start size", min: 0.1, max: 1, step: 0.05, unit: "×" },
        { type: "ease", k: "ease", label: "Ease" }] },
      { title: "Phone", frame: "phone", g: "cardsPhone", rows: [sec("duration", "Duration", 0.1, 3, 0.05),
        { type: "num", k: "fromY", label: "Start below", min: 0, max: 100, step: 1, unit: "%" },
        { type: "ease", k: "ease", label: "Ease" }] },
    ] },
  { id: "lines", name: "Intro card lines", sel: ".c-intro h1", g: "lines",
    about: "The intro card's sentence rises line by line from behind a mask.",
    sections: [{ title: "Both", rows: [sec("duration", "Duration", 0.1, 3, 0.05), sec("stagger", "Stagger", 0, 0.5, 0.01),
      sec("delay", "Delay", 0, 3, 0.05), sec("phoneDelay", "Phone delay", 0, 3, 0.05), { type: "ease", k: "ease", label: "Ease" }] }] },
  { id: "cardlook", name: "Cards", hint: "Corners, colours, outline, shadow", sel: BOX_CARDS, g: "look", look: true,
    about: "Corners, colours, outline and shadow for every card. The round clock and the spiral keep their own shape. Changes show at once.",
    sections: [
      { title: "Corners", rows: [{ type: "num", k: "radius", label: "Desktop", min: 0, max: 48, step: 1, unit: "px" }, { type: "num", k: "radiusPhone", label: "Phone", min: 0, max: 40, step: 1, unit: "px" }] },
      { title: "Colours", rows: [{ type: "color", k: "surface", label: "Light cards" }, { type: "color", k: "ink", label: "Dark cards, text" }] },
      { title: "Outline", rows: [{ type: "num", k: "borderWidth", label: "Width", min: 0, max: 8, step: 0.5, unit: "px" }, { type: "color", k: "borderColor", label: "Colour" }] },
      { title: "Shadow", presets: SHADOWS, rows: [
        { type: "num", k: "shadowX", label: "X", min: -40, max: 40, step: 1, unit: "px" }, { type: "num", k: "shadowY", label: "Y", min: -40, max: 60, step: 1, unit: "px" },
        { type: "num", k: "shadowBlur", label: "Blur", min: 0, max: 100, step: 1, unit: "px" }, { type: "num", k: "shadowSpread", label: "Spread", min: -30, max: 30, step: 1, unit: "px" },
        { type: "color", k: "shadowColor", label: "Colour" }, { type: "num", k: "shadowOpacity", label: "Opacity", min: 0, max: 1, step: 0.01, unit: "" }] },
      { title: "Space between cards", rows: [{ type: "num", k: "cardGap", label: "Desktop", min: 0, max: 160, step: 1, unit: "px" }, { type: "num", k: "cardGapPhone", label: "Phone", min: 0, max: 80, step: 1, unit: "px" }] },
    ] },
  { id: "intro", name: "Intro card text", hint: "Size, line spacing, padding", sel: ".c-intro", g: "intro", look: true,
    about: "The intro card's text size, line spacing, padding and width. Changes show at once; the frames then reload to re-wrap the lines. Desktop values are at the design size (the cards scale to the window).",
    sections: [
      { title: "Desktop", frame: "desktop", rows: [
        { type: "num", k: "size", label: "Text size", min: 24, max: 140, step: 1, unit: "px" }, { type: "num", k: "leading", label: "Line spacing", min: 0.8, max: 2, step: 0.01, unit: "" },
        { type: "num", k: "width", label: "Width", min: 700, max: 2200, step: 10, unit: "px" }, { type: "num", k: "gap", label: "Space below", min: 0, max: 400, step: 5, unit: "px" },
        { type: "num", k: "padTop", label: "Padding top", min: 0, max: 200, step: 1, unit: "px" }, { type: "num", k: "padRight", label: "Right", min: 0, max: 300, step: 1, unit: "px" },
        { type: "num", k: "padBottom", label: "Bottom", min: 0, max: 200, step: 1, unit: "px" }, { type: "num", k: "padLeft", label: "Left", min: 0, max: 300, step: 1, unit: "px" }] },
      { title: "Phone", frame: "phone", rows: [
        { type: "num", k: "sizePhone", label: "Text size", min: 14, max: 60, step: 1, unit: "px" }, { type: "num", k: "leadingPhone", label: "Line spacing", min: 0.8, max: 2, step: 0.01, unit: "" },
        { type: "num", k: "gapPhone", label: "Space below", min: 0, max: 200, step: 2, unit: "px" },
        { type: "num", k: "padTopPhone", label: "Padding top", min: 0, max: 100, step: 1, unit: "px" }, { type: "num", k: "padRightPhone", label: "Right", min: 0, max: 100, step: 1, unit: "px" },
        { type: "num", k: "padBottomPhone", label: "Bottom", min: 0, max: 100, step: 1, unit: "px" }, { type: "num", k: "padLeftPhone", label: "Left", min: 0, max: 100, step: 1, unit: "px" }] },
    ] },
  { id: "introgo", name: "Intro card arrow", hint: "Size, line, position", sel: ".c-intro__go", g: "intro", look: true,
    about: "The round arrow at the bottom right of the intro card. The space under the text grows with it, so it never covers the words.",
    sections: [
      { title: "Desktop", frame: "desktop", rows: [
        { type: "num", k: "goSize", label: "Size", min: 24, max: 160, step: 1, unit: "px" }, { type: "num", k: "goArrow", label: "Arrow size", min: 10, max: 80, step: 1, unit: "px" },
        { type: "num", k: "goLine", label: "Line width", min: 0, max: 6, step: 0.5, unit: "px" },
        { type: "num", k: "goRight", label: "From right", min: 0, max: 160, step: 1, unit: "px" }, { type: "num", k: "goBottom", label: "From bottom", min: 0, max: 160, step: 1, unit: "px" }] },
      { title: "Phone", frame: "phone", rows: [
        { type: "num", k: "goSizePhone", label: "Size", min: 24, max: 120, step: 1, unit: "px" }, { type: "num", k: "goArrowPhone", label: "Arrow size", min: 10, max: 60, step: 1, unit: "px" },
        { type: "num", k: "goLinePhone", label: "Line width", min: 0, max: 6, step: 0.5, unit: "px" },
        { type: "num", k: "goRightPhone", label: "From right", min: 0, max: 120, step: 1, unit: "px" }, { type: "num", k: "goBottomPhone", label: "From bottom", min: 0, max: 120, step: 1, unit: "px" }] },
      { title: "Hover", rows: [{ type: "num", k: "goNudge", label: "Nudge right", min: 0, max: 20, step: 1, unit: "px" }] },
    ] },
  { id: "headerlogo", name: "Header logo", hint: "Size", sel: ".js-b-header__logo", g: "look", look: true,
    about: "The wordmark's size in the header, where the opening's logo lands. Changes show at once.",
    sections: [{ title: "Size", rows: [{ type: "num", k: "logoSize", label: "Desktop", min: 14, max: 48, step: 1, unit: "px" }, { type: "num", k: "logoSizePhone", label: "Phone", min: 14, max: 48, step: 1, unit: "px" }] }] },
  { id: "page", name: "Page colour", hint: "Background", sel: null, g: "look", look: true,
    about: "The page background. The preloader and the opening use it too, so the doors open seamlessly.",
    sections: [{ title: "Colour", rows: [{ type: "color", k: "bg", label: "Background" }] }] }
];
const byId = Object.fromEntries(LAYERS.map((l) => [l.id, l]));
const MOTION = ["preloader", "opening", "logo", "menu", "cards", "lines"];

/* ---------------- state ---------------- */
let saved = await (await fetch("/__studio/design")).json();
let draft = (() => { const d = store.get("studio-draft", null); const out = clone(saved); if (d) for (const g in out) Object.assign(out[g], d[g] || {}); return out; })();
const ui = Object.assign({ outlines: true, mode: "style", sel: "cardlook", speed: 1, preloader: true, opening: true, frames: { desktop: true, phone: true }, active: "desktop", view: null, interact: false, measured: {} }, store.get("studio-ui", {}));
const saveUi = () => store.set("studio-ui", ui);
const undo = [], redo = [];
let lastCommit = JSON.stringify(draft);

const FRAMES = [
  { id: "desktop", label: "Desktop", w: 1505, h: 880, x: 0, y: 0 },
  { id: "phone", label: "Phone", w: 390, h: 844, x: 1505 + 160, y: 0 },
];
const F = Object.fromEntries(FRAMES.map((f) => [f.id, f]));

/* ---------------- frames on the canvas ---------------- */
const canvas = $("#canvas"), world = $("#world");
let view = ui.view || { x: 40, y: 60, z: 0.5 };
let loads = 0;
// Frames rest on the finished page ("still": no preloader or opening, the intro jumps to its end)
// and play the intro only when CC presses Play (CC: "let user manually start animation").
const frameUrl = (play) => {
  const q = new URLSearchParams({ studio: "" });
  if (!play) { q.set("opening", "0"); q.set("still", ""); }
  else if (!ui.opening) q.set("opening", "0");
  else if (!ui.preloader) q.set("preloader", "0");
  q.set("r", String(++loads));
  return `/?${q.toString().replace("studio=", "studio")}`;
};
for (const f of FRAMES) {
  f.el = h("div", { class: "frame", "data-id": f.id, style: `left:${f.x}px;top:${f.y}px` },
    f.labelEl = h("div", { class: "label" }, h("b", {}, f.label), ` · ${f.w} × ${f.h}`),
    f.box = h("div", { class: "box", style: `width:${f.w}px;height:${f.h}px` },
      f.iframe = h("iframe", { width: f.w, height: f.h, title: `${f.label} preview` }),
      f.hl = h("div", { style: "position:absolute;inset:0;pointer-events:none" })));
  world.append(f.el);
  f.iframe.addEventListener("load", () => onFrameLoad(f));
}
function onFrameLoad(f) {
  applyLook(f);
  const win = f.iframe.contentWindow;
  // the preloader's "gap opens" moment: watch for it while the page boots
  const watch = () => {
    if (f.iframe.contentWindow !== win) return;
    if (win.sitePreloader?.reveal && !f.watched) { f.watched = true; win.sitePreloader.reveal.then(() => { (win.__studio ||= { marks: {} }).marks.reveal = win.performance.now(); }); }
    if (!f.watched && performance.now() - t0 < 3000) requestAnimationFrame(watch);
  };
  const t0 = performance.now(); f.watched = false; watch();
}
function load(play) {
  clearTimeout(replayTimer);
  for (const f of FRAMES) {
    f.mode = play ? "play" : "still"; f.started = performance.now();
    if (ui.frames[f.id]) f.iframe.src = frameUrl(play); else f.iframe.removeAttribute("src");
  }
  drawPlay();
}
const play = () => load(true);
const still = () => load(false);
// Playing until the logo has landed and the intro card's lines are in (3 s after the landing).
const playing = () => FRAMES.some((f) => {
  if (!ui.frames[f.id] || f.mode !== "play") return false;
  const w = win(f), landed = w?.__studio?.marks?.landed;
  return !landed || w.performance.now() - landed < 3000 / ui.speed;
});
let shownPlaying = null;
function drawPlay() {
  const p = playing();
  if (p === shownPlaying) return;
  shownPlaying = p;
  $("#play").firstChild.textContent = p ? "■ Stop " : "▶ Play ";
  $("#play").setAttribute("aria-pressed", String(p));
}
const win = (f) => { try { return f.iframe.contentWindow?.document?.body ? f.iframe.contentWindow : null; } catch { return null; } };

function setView(v) {
  view = v;
  world.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`;
  canvas.style.backgroundSize = `${20 * v.z}px ${20 * v.z}px`;
  canvas.style.backgroundPosition = `${v.x}px ${v.y}px`;
  for (const f of FRAMES) f.labelEl.style.transform = `scale(${1 / v.z})`;
  $("#zoom").textContent = `${Math.round(v.z * 100)}%`;
  ui.view = v; saveUi();
}
function fit() {
  const shown = FRAMES.filter((f) => ui.frames[f.id]);
  if (!shown.length) return;
  const x0 = Math.min(...shown.map((f) => f.x)), x1 = Math.max(...shown.map((f) => f.x + f.w));
  const y0 = Math.min(...shown.map((f) => f.y)), y1 = Math.max(...shown.map((f) => f.y + f.h));
  const r = canvas.getBoundingClientRect(), pad = 56;
  const z = Math.min((r.width - pad * 2) / (x1 - x0), (r.height - pad * 2 - 20) / (y1 - y0), 1);
  setView({ z, x: (r.width - (x1 - x0) * z) / 2 - x0 * z, y: (r.height - (y1 - y0) * z) / 2 - y0 * z + 10 });
}
function zoomAt(cx, cy, z) {
  z = Math.min(4, Math.max(0.1, z));
  setView({ z, x: cx - ((cx - view.x) / view.z) * z, y: cy - ((cy - view.y) / view.z) * z });
}
canvas.addEventListener("wheel", (e) => {
  if (ui.interact && e.target.tagName === "IFRAME") return;
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  if (e.ctrlKey || e.metaKey) zoomAt(e.clientX - r.left, e.clientY - r.top, view.z * Math.exp(-e.deltaY * 0.01));
  else setView({ ...view, x: view.x - e.deltaX, y: view.y - e.deltaY });
}, { passive: false });

// Drag anywhere to move the canvas; a click (no drag) on a frame selects what's under the pointer.
let drag = null;
canvas.addEventListener("pointerdown", (e) => {
  if (e.button > 1 || e.target.closest(".ctx")) return;
  drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", (e) => {
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 3) { drag.moved = true; canvas.classList.add("panning"); }
    if (drag.moved) setView({ ...view, x: drag.vx + dx, y: drag.vy + dy });
    return;
  }
  hover = e.target.closest(".ctx") ? null : pick(e);
});
canvas.addEventListener("pointerup", (e) => {
  canvas.classList.remove("panning");
  if (drag && !drag.moved) {
    const p = pick(e);
    if (p) { ui.active = p.f.id; if (p.layer) select(p.layer); else saveUi(); }
  }
  drag = null;
});
// Like Canva and Figma: a click selects the card (Card style, all cards), a double-click goes into it
// (the intro card's text and spacing, or its arrow).
canvas.addEventListener("dblclick", (e) => {
  if (e.target.closest(".ctx")) return;
  const p = pick(e, true);
  if (p?.layer) { ui.active = p.f.id; select(p.layer); }
});
canvas.addEventListener("pointerleave", () => { hover = null; });

// what's under the pointer in a frame, as one of the sequence's layers
const PICKS = { style: ["introgo", "intro", "headerlogo", "cardlook"], motion: ["preloader", "opening", "logo", "menu", "lines", "cards"] };
let hover = null;
const INSIDE = ["intro", "introgo"];   // layers inside a card: reached with a double-click
function pick(e, deep = false) {
  const r = canvas.getBoundingClientRect();
  const wx = (e.clientX - r.left - view.x) / view.z, wy = (e.clientY - r.top - view.y) / view.z;
  const f = FRAMES.find((f) => ui.frames[f.id] && wx >= f.x && wx < f.x + f.w && wy >= f.y && wy < f.y + f.h);
  if (!f) return null;
  const w = win(f);
  const el = w?.document.elementFromPoint(wx - f.x, wy - f.y);
  let layer = el && PICKS[ui.mode].find((id) => el.closest(byId[id].sel)) || (el ? (ui.mode === "style" ? "page" : null) : null);
  if (!deep && INSIDE.includes(layer)) layer = "cardlook";   // a click on a card always opens Cards: corners and colours
  return { f, layer, el: layer && layer !== "page" ? el.closest(byId[layer].sel) : null };
}

/* ---------------- highlights (selection and hover boxes) ---------------- */
function drawHighlights() {
  for (const f of FRAMES) {
    f.el.classList.toggle("active", ui.outlines && ui.active === f.id && ui.frames.phone && ui.frames.desktop);
    const w = win(f), boxes = [];
    const L = byId[ui.sel];
    if (w && L.sel) {
      [...w.document.querySelectorAll(L.sel)].slice(0, 24).forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width > 1 && b.height > 1 && b.right > 0 && b.left < f.w && b.bottom > 0 && b.top < f.h && getComputedStyle(el).visibility !== "hidden") boxes.push([b, "sel"]);
      });
    }
    f.selRect = boxes[0] ? boxes[0][0] : null;
    if (hover && hover.f === f && hover.el && hover.layer !== ui.sel) boxes.push([hover.el.getBoundingClientRect(), "hover", byId[hover.layer].name]);
    if (!ui.outlines) boxes.length = 0;   // hidden (H): the toolbar still follows the selection
    const key = boxes.map(([b, c]) => `${c}${b.x | 0},${b.y | 0},${b.width | 0},${b.height | 0}`).join(";") + view.z;
    if (key === f.hlKey) continue;
    f.hlKey = key;
    f.hl.replaceChildren(...boxes.map(([b, c, name], i) => {
      const d = h("div", { class: `hl${c === "hover" ? " hover" : ""}`, style: `left:${b.x}px;top:${b.y}px;width:${b.width}px;height:${b.height}px;outline-width:${(c === "hover" ? 1 : 1.5) / view.z}px` });
      if (c === "hover" || i === 0) d.append(h("span", { class: "tag", style: `transform:scale(${1 / view.z})` }, name || L.name));
      return d;
    }));
  }
}

/* ---------------- look: live, no replay ---------------- */
function applyLook(f) { const w = win(f); if (w) applyTo(w.document, f.id === "phone"); }
// The draft's look and the Page tab's tweaks, on one framed page.
function applyTo(doc, phone) {
  if (!doc?.body) return;
  const root = doc.documentElement.style;
  Object.entries(lookVars(draft, phone)).forEach(([k, v]) => root.setProperty(k, v));
  if (!doc.querySelector(".page-layer.is-active")) doc.body.style.setProperty("--color-bg", draft.look.bg);
  let style = doc.getElementById("studio-tweaks");
  if (!style) { style = doc.createElement("style"); style.id = "studio-tweaks"; doc.head.append(style); }
  style.textContent = tweaksCss(draft.tweaks);
}

/* ---------------- draft, undo, save ---------------- */
const get = (g, k) => draft[g][k];
// What a change needs: "live" (CSS variables only), "layout" (the frames reload to re-measure the
// cards and re-wrap the frozen lines; quick, without the opening) or "motion" (a full replay).
const kindOf = (g, k) => (g === "tweaks" ? "live" : g === "intro" || (g === "look" && /^cardGap/.test(k)) ? "layout" : g === "look" ? "live" : "motion");
function set(g, k, v, { commit = false } = {}) {
  if (v == null) delete draft[g][k]; else draft[g][k] = v;
  store.set("studio-draft", draft);
  if (g === "look" || g === "intro" || g === "tweaks") { FRAMES.forEach(applyLook); applyTo(page.doc(), true); }
  refreshStatus(); drawTimeline(); syncRows();
  if (commit) commitChange(kindOf(g, k));
}
function commitChange(kind) {
  const now = JSON.stringify(draft);
  if (now === lastCommit) return;
  undo.push(lastCommit); redo.length = 0; lastCommit = now;
  settle(kind);
}
// After a change: an animation that's playing stops (the frames go still); layout changes reload
// still frames to re-measure; motion changes wait for Play.
let replayTimer;
function settle(kind) {
  if (playing()) return still();
  if (kind === "layout") { clearTimeout(replayTimer); replayTimer = setTimeout(still, 700); }
  if (kind === "motion") flashHint("Changed. Press Play to see it.");
}
let hintTimer;
function flashHint(text) {
  const el = $("#hint"); el.textContent = text; el.classList.add("on");
  clearTimeout(hintTimer); hintTimer = setTimeout(() => { el.classList.remove("on"); drawToggles(); }, 2500);
}
function restore(json) {
  const before = draft; draft = JSON.parse(json); lastCommit = json;
  store.set("studio-draft", draft);
  FRAMES.forEach(applyLook); applyTo(page.doc(), true); refreshStatus(); drawTimeline(); syncRows();
  if (ui.mode === "page") drawInspector();
  const kinds = new Set(Object.keys(draft).flatMap((g) => Object.keys(draft[g]).filter((k) => JSON.stringify(draft[g][k]) !== JSON.stringify(before[g][k])).map((k) => kindOf(g, k))));
  settle(kinds.has("layout") ? "layout" : kinds.has("motion") ? "motion" : "live");
}
const dirty = () => JSON.stringify(draft) !== JSON.stringify(saved);
function refreshStatus() {
  const d = dirty(), st = $("#status");
  st.textContent = d ? "Unsaved changes" : "Saved";
  st.classList.toggle("dirty", d);
  $("#save").disabled = !d; $("#revert").disabled = !d;
}
async function save() {
  if (!dirty()) return;
  const st = $("#status");
  st.textContent = "Saving…";
  try {
    const res = await fetch("/__studio/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    const out = await res.json();
    if (!res.ok) throw new Error(out.error || res.status);
    saved = clone(draft); store.del("studio-draft"); refreshStatus(); syncRows();
    st.textContent = "Saved to site-design.js";
    // the dev server reloads the frames when site-design.js changes
  } catch (err) { st.textContent = `Not saved: ${err.message}`; st.classList.add("dirty"); }
}

/* ---------------- layers panel ---------------- */
// Two modes, like Canva's Design and Animate: Style (how things look) and Motion (the intro sequence).
const modeOf = (l) => (l.look ? "style" : "motion");
const MODE_DEFAULT = { style: "cardlook", motion: "logo" };
function setMode(m) {
  ui.mode = m;
  const own = m === "page" || m in protos;   // tabs with their own canvas
  if (!own && modeOf(byId[ui.sel]) !== m) ui.sel = MODE_DEFAULT[m];
  page.show(m === "page");
  for (const [k, t] of Object.entries(protos)) t.show(m === k);
  if (!own) setView(view);
  saveUi(); drawToggles(); drawLayers(); drawInspector(); still();
  requestAnimationFrame(drawTimeline);
}
function drawLayers() {
  $("#layers-head").textContent = { style: "Style", motion: "Sequence", page: "Layers", folder: "States", drawer: "States" }[ui.mode];
  if (ui.mode === "page") return page.drawTree($("#layers"));
  if (protos[ui.mode]) return protos[ui.mode].drawTree($("#layers"));
  $("#layers").replaceChildren(...LAYERS.filter((l) => modeOf(l) === ui.mode).map((l) => {
    const n = changedCount(l);
    return h("button", { class: `item${l.hint ? " two" : ""}`, "aria-selected": String(ui.sel === l.id), onclick: () => select(l.id) },
      h("span", { class: "dot" }), h("span", { class: "nm" }, l.name, l.hint ? h("small", {}, l.hint) : null), h("span", { class: "meta" }, n ? `${n} changed` : ""));
  }));
}
function changedCount(l) {
  if (!l.sections) return 0;
  return l.sections.reduce((n, s) => n + s.rows.filter((r) => JSON.stringify(draft[s.g || l.g][r.k]) !== JSON.stringify(saved[s.g || l.g][r.k])).length, 0);
}
function select(id) { if (modeOf(byId[id]) !== ui.mode) { setMode(modeOf(byId[id])); } ui.sel = id; saveUi(); drawLayers(); drawInspector(); drawTimeline(); }

/* ---------------- inspector ---------------- */
let syncers = [];
function syncRows() { syncers.forEach((s) => s()); drawLayers(); }
function drawInspector() {
  if (ui.mode === "page") { syncers = []; return page.drawInspector($("#insp")); }
  if (protos[ui.mode]) { syncers = []; return protos[ui.mode].drawInspector($("#insp")); }
  const l = byId[ui.sel], el = $("#insp");
  syncers = [];
  el.replaceChildren(h("h2", {}, l.name), h("p", { class: "about" }, l.about));
  if (l.notes) {
    const s = h("div", { class: "sec" });
    l.notes.forEach((n) => { const p = h("p", { class: "note" }); p.innerHTML = n; s.append(p); });
    const id = l.id, toggle = h("button", { class: "chip", onclick: () => { ui[id] = !ui[id]; saveUi(); drawToggles(); } });
    const sync = () => { toggle.textContent = ui[id] ? `Skip the ${l.name.toLowerCase()} in the preview` : `Play the ${l.name.toLowerCase()} in the preview`; };
    sync(); syncers.push(sync); s.append(h("div", { class: "chips" }, toggle));
    el.append(s);
  }
  for (const s of l.sections || []) {
    const g = s.g || l.g;
    const reset = h("button", { class: "reset", onclick: () => { s.rows.forEach((r) => { draft[g][r.k] = clone(saved[g][r.k]); }); set(g, s.rows[0].k, draft[g][s.rows[0].k], { commit: true }); } }, "Reset");
    const head = h("h3", {}, s.title, reset);
    const box = h("div", { class: "sec" }, head);
    const syncReset = () => { reset.hidden = !s.rows.some((r) => JSON.stringify(draft[g][r.k]) !== JSON.stringify(saved[g][r.k])); };
    syncers.push(syncReset); syncReset();
    s.rows.forEach((r) => box.append(row(g, r)));
    if (s.presets) {
      // shadow presets as tiles that show the shadow
      const css = (v) => (v.shadowOpacity ? `${v.shadowX}px ${v.shadowY}px ${v.shadowBlur}px ${v.shadowSpread}px rgba(0,0,0,${v.shadowOpacity})` : "none");
      const tiles = s.presets.map(([name, vals]) => h("button", { class: "tile", onclick: () => { Object.assign(draft[g], vals); set(g, "shadowX", draft[g].shadowX, { commit: true }); } },
        h("span", { class: "sq", style: `box-shadow:${css(vals)}` }), name));
      const syncTiles = () => tiles.forEach((t, i) => t.setAttribute("aria-pressed", String(Object.entries(s.presets[i][1]).every(([k, x]) => draft[g][k] === x || k === "shadowColor"))));
      syncers.push(syncTiles); syncTiles();
      box.insertBefore(h("div", { class: "tiles" }, ...tiles), box.children[1]);
    }
    if (s.frame) box.addEventListener("pointerenter", () => { if (ui.active !== s.frame) { ui.active = s.frame; drawTimeline(); } });
    el.append(box);
  }
}
function row(g, r) {
  const changed = () => JSON.stringify(draft[g][r.k]) !== JSON.stringify(saved[g][r.k]);
  if (r.type === "num") {
    const range = h("input", { type: "range", min: r.min, max: r.max, step: r.step });
    const num = h("input", { class: "num", type: "text", inputmode: "decimal" });
    const el = h("div", { class: "row" }, h("label", {}, r.label), range, num);
    const sync = () => { range.value = get(g, r.k); if (document.activeElement !== num) num.value = fmt(get(g, r.k), r.step) + (r.unit ? ` ${r.unit}` : ""); el.classList.toggle("changed", changed()); };
    range.addEventListener("input", () => set(g, r.k, +range.value));
    range.addEventListener("change", () => commitChange(kindOf(g, r.k)));
    num.addEventListener("focus", () => { num.value = fmt(get(g, r.k), r.step); num.select(); });
    num.addEventListener("keydown", (e) => {
      if (e.key === "Enter") num.blur();
      if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); const v = get(g, r.k) + (e.key === "ArrowUp" ? 1 : -1) * r.step * (e.shiftKey ? 10 : 1); set(g, r.k, +v.toFixed(4)); num.value = fmt(get(g, r.k), r.step); }
    });
    num.addEventListener("blur", () => { const v = parseFloat(num.value); if (Number.isFinite(v)) set(g, r.k, v, { commit: true }); else commitChange(kindOf(g, r.k)); sync(); });
    syncers.push(sync); sync();
    return el;
  }
  if (r.type === "color") {
    const pick = h("input", { type: "color" }), hex = h("input", { class: "hex", spellcheck: "false" });
    const el = h("div", { class: "row wide" }, h("label", {}, r.label), h("div", { class: "color" }, pick, hex));
    const sync = () => { pick.value = get(g, r.k); if (document.activeElement !== hex) hex.value = get(g, r.k); el.classList.toggle("changed", changed()); };
    pick.addEventListener("input", () => set(g, r.k, pick.value));
    pick.addEventListener("change", () => commitChange(kindOf(g, r.k)));
    hex.addEventListener("keydown", (e) => { if (e.key === "Enter") hex.blur(); });
    hex.addEventListener("blur", () => { let v = hex.value.trim(); if (!v.startsWith("#")) v = `#${v}`; if (/^#[0-9a-f]{3}$/i.test(v)) v = "#" + [...v.slice(1)].map((c) => c + c).join(""); if (/^#[0-9a-f]{6}$/i.test(v)) set(g, r.k, v.toLowerCase(), { commit: true }); sync(); });
    syncers.push(sync); sync();
    return el;
  }
  if (r.type === "ease") {
    const sel = h("select", {}, ...EASES.map((e) => h("option", { value: e }, e)));
    const svg = curveSvg(256, 64);
    const el = h("div", {}, h("div", { class: "row wide" }, h("label", {}, r.label), sel), svg.el);
    const sync = () => {
      if (!EASES.includes(get(g, r.k))) sel.append(h("option", { value: get(g, r.k) }, get(g, r.k)));
      sel.value = get(g, r.k); el.firstChild.classList.toggle("changed", changed());
      svg.draw(gsap.parseEase(get(g, r.k)));
    };
    sel.addEventListener("change", () => set(g, r.k, sel.value, { commit: true }));
    syncers.push(sync); sync();
    return el;
  }
  if (r.type === "bezier") return bezierRow(g, r, changed);
}
function curveSvg(W, H) {
  const NS = "http://www.w3.org/2000/svg";
  const el = document.createElementNS(NS, "svg");
  el.setAttribute("width", W); el.setAttribute("height", H); el.setAttribute("class", "curve");
  const p = document.createElementNS(NS, "path"); p.setAttribute("class", "path"); el.append(p);
  return { el, draw(fn) {
    const pad = 8, pts = [];
    for (let i = 0; i <= 64; i++) { const t = i / 64, v = fn(t); pts.push(`${pad + t * (W - pad * 2)},${H - pad - v * (H - pad * 2) * 0.8 - (H - pad * 2) * 0.1}`); }
    p.setAttribute("d", `M${pts.join("L")}`);
  } };
}
function bezierRow(g, r, changed) {
  const NS = "http://www.w3.org/2000/svg", W = 256, H = 200, pad = 18;
  const lo = -0.4, hi = 1.4;   // value range shown (room for overshoot)
  const X = (x) => pad + x * (W - pad * 2), Y = (y) => H - pad - ((y - lo) / (hi - lo)) * (H - pad * 2);
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", W); svg.setAttribute("height", H); svg.setAttribute("class", "curve");
  const mk = (tag, a) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); svg.append(e); return e; };
  mk("rect", { class: "grid", x: X(0), y: Y(1), width: X(1) - X(0), height: Y(0) - Y(1), fill: "none" });
  const a1 = mk("line", { class: "arm" }), a2 = mk("line", { class: "arm" }), path = mk("path", { class: "path" });
  const h1 = mk("circle", { class: "h", r: 6 }), h2 = mk("circle", { class: "h", r: 6 });
  const label = h("div", { class: "note" });
  const el = h("div", {}, h("div", { class: "row wide" }, h("label", {}, r.label), label), svg,
    h("div", { class: "chips" }, ...BEZIERS.map(([n, b]) => h("button", { class: "chip", onclick: () => set(g, r.k, b.slice(), { commit: true }) }, n))));
  const sync = () => {
    const [x1, y1, x2, y2] = get(g, r.k);
    path.setAttribute("d", `M${X(0)},${Y(0)} C${X(x1)},${Y(y1)} ${X(x2)},${Y(y2)} ${X(1)},${Y(1)}`);
    for (const [ln, x0, y0, x, y] of [[a1, 0, 0, x1, y1], [a2, 1, 1, x2, y2]]) { ln.setAttribute("x1", X(x0)); ln.setAttribute("y1", Y(y0)); ln.setAttribute("x2", X(x)); ln.setAttribute("y2", Y(y)); }
    h1.setAttribute("cx", X(x1)); h1.setAttribute("cy", Y(y1)); h2.setAttribute("cx", X(x2)); h2.setAttribute("cy", Y(y2));
    label.textContent = `cubic-bezier(${get(g, r.k).join(", ")})`;
    el.firstChild.classList.toggle("changed", changed());
  };
  [h1, h2].forEach((c, i) => c.addEventListener("pointerdown", (e) => {
    e.preventDefault(); c.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const b = svg.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (ev.clientX - b.left - pad) / (W - pad * 2)));
      const y = Math.min(hi, Math.max(lo, lo + ((H - pad - (ev.clientY - b.top)) / (H - pad * 2)) * (hi - lo)));
      const v = get(g, r.k).slice(); v[i * 2] = +x.toFixed(2); v[i * 2 + 1] = +y.toFixed(2);
      set(g, r.k, v);
    };
    const up = () => { c.removeEventListener("pointermove", move); c.removeEventListener("pointerup", up); commitChange("motion"); };
    c.addEventListener("pointermove", move); c.addEventListener("pointerup", up);
  }));
  syncers.push(sync); sync();
  return el;
}

/* ---------------- timeline ---------------- */
// Seconds since the frame loaded (real time, so slow motion stretches it). Until the frame has played
// once, the preloader and opening lengths are estimates from the last time they played.
const ROWS = ["preloader", "opening", "logo", "menu", "cards", "lines"];
function marks(f) {
  const w = win(f), m = (f.mode === "play" && w?.__studio?.marks) || {}, s = ui.speed;
  const key = `${f.id}-${ui.preloader && ui.opening ? "both" : ui.opening ? "opening" : "none"}`;
  if (m.intro) ui.measured[key] = { reveal: m.reveal ? (m.reveal / 1000) * s : 0, intro: (m.intro / 1000) * s, lines: [...w.document.querySelectorAll(".c-intro__line-inner")].filter((e) => e.offsetParent).length || 4 };
  const est = ui.measured[key] || { reveal: ui.preloader && ui.opening ? 2.6 : 0, intro: ui.opening ? (ui.preloader ? 9.4 : 6.8) : 0.3, lines: 4 };
  return {
    measured: !!m.intro,
    reveal: m.reveal ? m.reveal / 1000 : est.reveal / s,
    intro: m.intro ? m.intro / 1000 : est.intro / s,
    lines: est.lines,
    now: w && f.mode === "play" ? w.performance.now() / 1000 : 0,
  };
}
function bars(f) {
  const m = marks(f), s = ui.speed, phone = f.id === "phone", D = draft;
  const B = {};
  B.preloader = ui.preloader && ui.opening ? { a: 0, d: m.reveal, label: "Loading, then the doors open" } : { off: true };
  B.opening = ui.opening ? { a: ui.preloader ? m.reveal : 0, d: m.intro - (ui.preloader ? m.reveal : 0), label: "designby, the flower, the cuts, the bots, cc" } : { off: true };
  B.logo = phone ? { a: m.intro + D.logo.phoneDelay / s, d: D.logo.phoneDuration / s, g: "logo", dk: "phoneDelay", uk: "phoneDuration" }
    : { a: m.intro + D.logo.delay / s, d: D.logo.duration / s, g: "logo", dk: "delay", uk: "duration" };
  B.menu = phone ? { off: true, label: "Desktop only" } : { a: m.intro + D.menu.delay / s, d: D.menu.duration / s, g: "menu", dk: "delay", uk: "duration" };
  B.cards = phone ? { a: m.intro, d: D.cardsPhone.duration / s, g: "cardsPhone", uk: "duration" } : { a: m.intro + D.cards.delay / s, d: D.cards.duration / s, g: "cards", dk: "delay", uk: "duration" };
  const n = Math.max(1, Math.round(m.lines));
  B.lines = { a: m.intro + (phone ? D.lines.phoneDelay : D.lines.delay) / s, d: (D.lines.duration + D.lines.stagger * (n - 1)) / s, g: "lines", dk: phone ? "phoneDelay" : "delay", uk: "duration", ticks: [...Array(n).keys()].map((i) => (D.lines.stagger * i) / s) };
  return { B, m };
}
let tlScale = 1, tlTotal = 1;
function drawTimeline() {
  const f = F[ui.frames[ui.active] ? ui.active : FRAMES.find((x) => ui.frames[x.id])?.id || "desktop"];
  const { B, m } = bars(f);
  const end = Math.max(...Object.values(B).filter((b) => !b.off).map((b) => b.a + b.d));
  tlTotal = Math.max(2, end) + 0.6 / ui.speed;
  const tracks = $("#tl-tracks"), W = tracks.clientWidth - 24;
  tlScale = W / tlTotal;
  const x = (t) => 12 + t * tlScale;
  $("#tl-names").replaceChildren(h("div", { class: "head" }, `${f.label}${m.measured ? "" : " · estimate"}`, h("span", {}, ui.speed === 1 ? "" : `${ui.speed}×`)),
    ...ROWS.map((id) => h("div", { class: ui.sel === id ? "sel" : "", onclick: () => select(id) }, byId[id].name)));
  const ruler = h("div", { class: "ruler" });
  const step = tlTotal > 20 ? 2 : tlTotal > 8 ? 1 : 0.5;
  for (let t = 0; t <= tlTotal; t += step) ruler.append(h("i", { style: `left:${x(t)}px` }), h("span", { style: `left:${x(t)}px` }, `${+t.toFixed(1)}s`));
  const lanes = ROWS.map((id) => {
    const b = B[id], lane = h("div", { class: "lane" });
    if (b.off) { lane.append(h("div", { class: "bar off", style: `left:${x(0)}px;width:${W}px` }, b.label || "Off in this preview")); return lane; }
    const bar = h("div", { class: `bar${b.g ? " edit" : ""}${ui.sel === id ? " sel" : ""}`, style: `left:${x(b.a)}px;width:${Math.max(4, b.d * tlScale)}px`,
      title: b.g ? "Drag to change the delay, drag the right edge to change the duration" : "" }, b.label || `${fmtS(b.d * ui.speed)}`);
    (b.ticks || []).slice(1).forEach((t) => bar.append(h("span", { class: "tick", style: `left:${t * tlScale}px` })));
    if (b.g) {
      const endEl = h("span", { class: "end" }); bar.append(endEl);
      bar.addEventListener("pointerdown", (e) => barDrag(e, id, b, e.target === endEl ? "uk" : "dk"));
    } else bar.addEventListener("click", () => select(id));
    lane.append(bar);
    return lane;
  });
  tracks.replaceChildren(ruler, ...lanes, playhead, h("div", { class: "foot" }, m.measured ? "Measured in the frame" : "Times before the logo are estimates until it plays"));
}
const fmtS = (v) => `${+v.toFixed(2)}s`;
const playhead = h("div", { class: "playhead" });
function barDrag(e, id, b, which) {
  e.preventDefault(); e.stopPropagation();
  select(id);
  const k = b[which];
  if (!k) return;   // no delay on this one (phones' cards)
  const g = b.g, start = draft[g][k], x0 = e.clientX, el = e.currentTarget;
  el.setPointerCapture(e.pointerId);
  const move = (ev) => {
    const dt = ((ev.clientX - x0) / tlScale) * ui.speed;
    const v = Math.max(which === "uk" ? 0.05 : 0, Math.round((start + dt) * 20) / 20);
    if (v !== draft[g][k]) set(g, k, v);
  };
  const up = () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); commitChange("motion"); };
  el.addEventListener("pointermove", move); el.addEventListener("pointerup", up);
}
function tickPlayhead() {
  const f = F[ui.active] && ui.frames[ui.active] ? F[ui.active] : FRAMES.find((x) => ui.frames[x.id]);
  if (f) {
    const m = marks(f);
    playhead.style.left = `${12 + Math.min(m.now, tlTotal) * tlScale}px`;
    playhead.hidden = f.mode !== "play";
    if (m.measured && !f.drawnMeasured) { f.drawnMeasured = true; drawTimeline(); }
    if (!m.measured) f.drawnMeasured = false;
  }
  drawHighlights(); drawPlay();
  requestAnimationFrame(tickPlayhead);
}

/* ---------------- top bar ---------------- */
function drawToggles() {
  $("#t-preloader").setAttribute("aria-pressed", String(ui.preloader && ui.opening));
  $("#t-preloader").disabled = !ui.opening;
  $("#t-opening").setAttribute("aria-pressed", String(ui.opening));
  $("#interact").setAttribute("aria-pressed", String(ui.interact));
  $("#outlines").setAttribute("aria-pressed", String(!ui.outlines));
  $("#outlines").firstChild.textContent = ui.outlines ? "Hide outlines " : "Show outlines ";
  canvas.classList.toggle("interact", ui.interact);
  $("#hint").textContent = ui.interact ? "Interact: the frames take clicks and drags like a browser (a click skips the opening). Press I to go back."
    : ui.mode === "page" ? "Click a card to select it, click again to select what's inside · scroll to move down the page, ⌘ + scroll to zoom"
    : ui.mode === "style" ? "Click a card to change corners, colours, outline and shadow · double-click the intro card for its text · drag to move, ⌘ + scroll to zoom"
    : "Click the logo or the cards to change their motion · drag to move, ⌘ + scroll to zoom";
  document.querySelectorAll("#speed button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.v === ui.speed)));
  document.querySelectorAll("#mode button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === ui.mode)));
  document.querySelector(".app").classList.toggle("style-mode", ui.mode !== "motion");
  document.querySelector(".app").classList.toggle("page-mode", ui.mode === "page");
  for (const k of ["folder", "drawer"]) document.querySelector(".app").classList.toggle(`${k}-mode`, ui.mode === k);
  document.querySelector(".app").classList.toggle("proto-mode", ui.mode === "folder" || ui.mode === "drawer");
  $("#f-desktop").checked = ui.frames.desktop; $("#f-phone").checked = ui.frames.phone;
  FRAMES.forEach((f) => { f.el.hidden = !ui.frames[f.id]; });
  syncers.forEach((s) => s());
}
document.querySelectorAll("#mode button").forEach((b) => (b.onclick = () => setMode(b.dataset.v)));
$("#play").onclick = () => (protos[ui.mode] ? protos[ui.mode].play() : playing() ? still() : play());
document.querySelectorAll("#speed button").forEach((b) => (b.onclick = () => { ui.speed = +b.dataset.v; store.set("studio-speed", ui.speed); saveUi(); drawToggles(); }));
$("#t-preloader").onclick = () => { ui.preloader = !ui.preloader; saveUi(); drawToggles(); };
$("#t-opening").onclick = () => { ui.opening = !ui.opening; saveUi(); drawToggles(); };
// both side panels off: a clean canvas (CC), e.g. to record a frame
function drawPanels() {
  document.querySelector(".app").classList.toggle("panels-off", !!ui.panelsOff);
  $("#panels").setAttribute("aria-pressed", String(!!ui.panelsOff));
  $("#panels").firstChild.textContent = ui.panelsOff ? "Show panels " : "Hide panels ";
}
$("#panels").onclick = () => { ui.panelsOff = !ui.panelsOff; saveUi(); drawPanels(); requestAnimationFrame(() => { drawTimeline(); }); };
drawPanels();
$("#outlines").onclick = () => { ui.outlines = !ui.outlines; page.outlines = ui.outlines; saveUi(); drawToggles(); };
$("#interact").onclick = () => { ui.interact = !ui.interact; saveUi(); drawToggles(); };
const fitMode = () => (ui.mode === "page" ? page.fit() : protos[ui.mode] ? protos[ui.mode].fit() : fit());
$("#zoom").onclick = fitMode;
const zoomBy = (k) => { if (protos[ui.mode]) return protos[ui.mode].zoomBy(k); const r = canvas.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, view.z * k); };
$("#zoom-in").onclick = () => zoomBy(1.25); $("#zoom-out").onclick = () => zoomBy(0.8);
$("#save").onclick = save;
$("#revert").onclick = () => { undo.push(lastCommit); restore(JSON.stringify(saved)); };
for (const id of ["desktop", "phone"]) $(`#f-${id}`).onchange = (e) => {
  ui.frames[id] = e.target.checked; if (!ui.frames[ui.active]) ui.active = ui.frames.desktop ? "desktop" : "phone";
  saveUi(); drawToggles(); drawTimeline();
  if (e.target.checked) { F[id].mode = "still"; F[id].iframe.src = frameUrl(false); } else F[id].iframe.removeAttribute("src");
};
addEventListener("keydown", (e) => {
  const typing = /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName) && document.activeElement.type !== "range";
  if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); save(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === "\\") { e.preventDefault(); $("#panels").click(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !typing) {
    e.preventDefault();
    if (e.shiftKey) { if (redo.length) { undo.push(lastCommit); restore(redo.pop()); } }
    else if (undo.length) { redo.push(lastCommit); restore(undo.pop()); }
    return;
  }
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "r") play();
  else if (e.key === " ") { e.preventDefault(); $("#play").click(); }
  else if (e.key === "i") $("#interact").click();
  else if (e.key === "h") $("#outlines").click();
  else if (e.key === "!" || (e.shiftKey && e.code === "Digit1")) fitMode();
  else if (e.key === "=" || e.key === "+") zoomBy(1.25);
  else if (e.key === "-") zoomBy(0.8);
});
addEventListener("resize", () => drawTimeline());

/* ---------------- the Page tab ---------------- */
const page = createPage({
  canvas: $("#page-canvas"),
  getDraft: () => draft,
  applyTo,
  onSelect: () => { drawLayers(); drawInspector(); },
  onZoom: (z) => { if (ui.mode === "page") $("#zoom").textContent = `${Math.round(z * 100)}%`; },
  setTweak(sel, prop, value, commit) {
    const t = { ...(draft.tweaks[sel] || {}) };
    if (value == null) delete t[prop]; else t[prop] = value;
    set("tweaks", sel, Object.keys(t).length ? t : null, { commit });
    if (commit) drawInspector();
  },
});
page.outlines = ui.outlines;
if (ui.mode === "page") page.show(true);

/* ---------------- the Folder and Drawer tabs (Case studies card prototypes) ---------------- */
const protos = {};
for (const [k, make] of [["folder", createFolder], ["drawer", createDrawer]])
  protos[k] = make({ canvas: $(`#${k}-canvas`), onZoom: (z) => { if (ui.mode === k) $("#zoom").textContent = `${Math.round(z * 100)}%`; } });
if (protos[ui.mode]) protos[ui.mode].show(true);

/* ---------------- start ---------------- */
store.set("studio-speed", ui.speed);
store.set("studio-draft", draft);
drawToggles(); drawLayers(); drawInspector(); refreshStatus();
if (ui.view) setView(ui.view); else requestAnimationFrame(fit);
still();
drawTimeline();
requestAnimationFrame(tickPlayhead);
