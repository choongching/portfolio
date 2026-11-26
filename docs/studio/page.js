/* The studio's Page tab: the phone home page laid out flat (every card at full size, one long page,
   the site with ?studio&still&flat), its objects as a layer tree, and an inspector that shows each
   object's real properties and tweaks them. Tweaks are { selector: { prop: value } } in the draft's
   "tweaks" group; Save writes site-tweaks.json and site-tweaks.css (phones only). Figma-like, but
   simpler: a click selects a card, a second click (or a double-click) goes into it. */

const W = 390, H = 844;   // the phone frame
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
const hex = (c) => {
  const m = c && c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
  if (!m || m[4] === "0") return null;
  return "#" + [m[1], m[2], m[3]].map((n) => (+n).toString(16).padStart(2, "0")).join("");
};
const round = (v, d = 2) => +(+v).toFixed(d);

// Friendly card names, by the card's classes.
const CARD_NAMES = [
  [/c-intro/, "Intro card"], [/project/, "Video card"], [/card--light/, "Light card"], [/card--black/, "News card"],
  [/responsive-image/, "Spiral card"], [/clock/, "Clock card"], [/text--status/, "Status card"], [/text/, "Text card"],
];
// The element's part of a tweak's selector: its most specific own class (a BEM element like
// c-intro__hello before a shared one like a-content-h1), or its tag.
const part = (el) => {
  const own = [...el.classList].filter((x) => !x.startsWith("js-") && x !== "|");
  const c = own.find((x) => x.includes("__")) || own[0];
  return c ? `.${c}` : el.tagName.toLowerCase();
};

export function createPage({ canvas, getDraft, setTweak, applyTo, onSelect, onZoom }) {
  const world = h("div", { class: "world" });
  const label = h("div", { class: "label" }, h("b", {}, "Phone"), " · whole page");
  const iframe = h("iframe", { width: W, height: H, title: "Phone, whole page" });
  const hl = h("div", { style: "position:absolute;inset:0;pointer-events:none" });
  const box = h("div", { class: "box", style: `width:${W}px;height:${H}px` }, iframe, hl);
  const frame = h("div", { class: "frame", style: "left:0;top:0" }, label, box);
  world.append(frame);
  canvas.append(world);

  let view = { x: 80, y: 60, z: 1 }, tree = [], sel = null, hover = null, height = H, loads = 0;
  const doc = () => { try { return iframe.contentDocument?.body ? iframe.contentDocument : null; } catch { return null; } };

  function setView(v) {
    view = v;
    world.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`;
    canvas.style.backgroundSize = `${20 * v.z}px ${20 * v.z}px`;
    canvas.style.backgroundPosition = `${v.x}px ${v.y}px`;
    label.style.transform = `scale(${1 / v.z})`;
    onZoom?.(v.z);
  }
  function fit() {
    const r = canvas.getBoundingClientRect();
    const z = Math.min(0.75, (r.width - 120) / W);   // big enough to read, small enough to see a few cards
    setView({ z, x: (r.width - W * z) / 2, y: 48 });
  }
  function load() {
    tree = []; sel = null; height = H;
    iframe.height = H; box.style.height = `${H}px`;
    iframe.src = `/?studio&still&opening=0&flat&r=${++loads}`;
  }
  iframe.addEventListener("load", () => { tree = []; applyTo(doc(), true); });   // also after Save (the dev server reloads it)

  /* ---------- the layer tree, from the page's DOM ---------- */
  function build() {
    const d = doc();
    if (!d) return [];
    const out = [];
    const header = d.querySelector(".b-header");
    const logo = d.querySelector(".js-b-header__logo .wordmark");
    const menu = [...header.querySelectorAll("button")].find((b) => b.offsetParent);
    out.push({ id: "header", name: "Header", el: header, sel: ".b-header", kids: [
      logo && { id: "header.logo", name: "Logo", el: logo, sel: ".b-header__logo .wordmark" },
      menu && { id: "header.menu", name: "Menu button", el: menu, sel: `.b-header ${part(menu)}` },
    ].filter(Boolean) });
    const items = [...d.querySelectorAll(".js-c-slider-responsive .c-slider-responsive__item")].filter((e) => e.offsetParent);
    items.forEach((item, i) => {
      const cls = [...item.classList].filter((c) => /^c-slider-responsive-|^c-intro$/.test(c) && c !== "c-slider-responsive__item");
      const cardSel = `.c-slider-responsive .${cls.join(".")}`;
      const name = (CARD_NAMES.find(([re]) => re.test(cls.join(" "))) || [, "Card"])[1];
      out.push({ id: `c${i}`, name: `${i + 1} · ${name}`, el: item, sel: cardSel, kids: objects(item, cardSel, `c${i}`) });
    });
    return out;
  }
  // The design objects inside a card: text blocks, images, video, graphics, the arrow, the clock.
  function objects(root, cardSel, pid) {
    const found = [];
    const walk = (el) => {
      for (const c of el.children) {
        if (!c.getClientRects().length) continue;
        const cs = getComputedStyle(c), tag = c.tagName;
        let kind = null;
        if (c.matches(".c-intro__go")) kind = "Arrow button";
        else if (c.matches(".a-clock, .js-a-clock")) kind = "Clock face";
        else if (tag === "IMG") kind = "Image";
        else if (tag === "VIDEO") kind = "Video";
        else if (tag === "svg" || tag === "CANVAS") kind = "Graphic";
        else if (cs.display !== "inline" && isText(c)) kind = "Text";
        if (kind) {
          const text = kind === "Text" ? c.textContent.replace(/\s+/g, " ").trim() : "";
          const name = text ? `“${text.length > 26 ? text.slice(0, 25) + "…" : text}”` : kind;
          found.push({ id: `${pid}.${found.length}`, name, kind, el: c, sel: `${cardSel} ${part(c)}` });
          continue;   // not inside an object
        }
        walk(c);
      }
    };
    walk(root);
    return found;
  }
  const isText = (el) => {
    if (!el.textContent.trim()) return false;
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return true;
    // only inline children (word or line spans), so the element itself is the text block
    return [...el.children].every((c) => getComputedStyle(c).display.startsWith("inline") || c.matches(".c-intro__line"));
  };
  const all = () => tree.flatMap((n) => [n, ...(n.kids || [])]);
  const byId = (id) => all().find((n) => n.id === id);
  const parentOf = (n) => tree.find((t) => t.kids && t.kids.includes(n));

  /* ---------- picking on the canvas ---------- */
  function at(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left - view.x) / view.z, y = (e.clientY - r.top - view.y) / view.z;
    const d = doc();
    if (!d || x < 0 || y < 0 || x > W || y > height) return null;
    const el = d.elementFromPoint(x, y);
    if (!el) return null;
    const card = tree.find((n) => n.el.contains(el));
    const kid = card && card.kids.find((k) => k.el.contains(el));
    return { card, kid };
  }
  let drag = null;
  canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 3) drag.moved = true;
      if (drag.moved) setView({ ...view, x: drag.vx + dx, y: drag.vy + dy });
      return;
    }
    const p = at(e);
    hover = p ? (sel && (sel === p.card || parentOf(sel) === p.card) && p.kid ? p.kid : p.card) : null;
  });
  canvas.addEventListener("pointerup", (e) => {
    if (drag && !drag.moved) {
      const p = at(e);
      // first click: the card; a click inside the selected card: the object under the pointer
      if (!p?.card) select(null);
      else if (p.kid && (sel === p.card || parentOf(sel) === p.card)) select(p.kid);
      else select(p.card);
    }
    drag = null;
  });
  canvas.addEventListener("dblclick", (e) => { const p = at(e); if (p?.kid) select(p.kid); });
  canvas.addEventListener("pointerleave", () => { hover = null; });
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) {
      const cx = e.clientX - r.left, cy = e.clientY - r.top, z = Math.min(3, Math.max(0.15, view.z * Math.exp(-e.deltaY * 0.01)));
      setView({ z, x: cx - ((cx - view.x) / view.z) * z, y: cy - ((cy - view.y) / view.z) * z });
    } else setView({ ...view, x: view.x - e.deltaX, y: view.y - e.deltaY });
  }, { passive: false });

  function select(n) { sel = n; onSelect(); }

  /* ---------- every frame: page height, tree, outlines ---------- */
  let shown = { outlines: true };
  function tick() {
    const d = doc();
    if (d && iframe.contentWindow.__studio?.flat) {
      const sh = d.documentElement.scrollHeight;
      if (Math.abs(sh - height) > 1) { height = sh; iframe.height = sh; box.style.height = `${sh}px`; }
      if (!tree.length) { tree = build(); if (sel) sel = byId(sel.id) || null; onSelect(); }
    }
    const boxes = [];
    if (shown.outlines) {
      if (sel?.el?.isConnected) boxes.push([sel.el.getBoundingClientRect(), "sel", sel.name]);
      if (hover && hover !== sel && hover.el.isConnected) boxes.push([hover.el.getBoundingClientRect(), "hover", hover.name]);
    }
    const key = boxes.map(([b, c]) => `${c}${b.x | 0},${b.y | 0},${b.width | 0},${b.height | 0}`).join(";") + view.z;
    if (key !== hl.dataset.key) {
      hl.dataset.key = key;
      hl.replaceChildren(...boxes.map(([b, c, name]) => h("div", { class: `hl${c === "hover" ? " hover" : ""}`, style: `left:${b.x}px;top:${b.y}px;width:${b.width}px;height:${b.height}px;outline-width:${(c === "hover" ? 1 : 1.5) / view.z}px` },
        h("span", { class: "tag", style: `transform:scale(${1 / view.z})` }, name))));
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---------- the tree panel ---------- */
  function drawTree(el) {
    if (!tree.length) { el.replaceChildren(h("p", { class: "note pad" }, "Laying out the page…")); return; }
    const tw = getDraft().tweaks || {};
    const row = (n, depth) => h("button", { class: `item tree d${depth}`, "aria-selected": String(sel === n), onclick: () => select(n) },
      h("span", { class: "dot" }), h("span", { class: "nm" }, n.name), h("span", { class: "meta" }, tw[n.sel] && Object.keys(tw[n.sel]).length ? "tweaked" : ""));
    el.replaceChildren(...tree.flatMap((n) => [row(n, 0), ...((sel === n || (sel && parentOf(sel) === n)) ? n.kids.map((k) => row(k, 1)) : [])]));
  }

  /* ---------- the inspector ---------- */
  function drawInspector(el) {
    if (!sel) {
      el.replaceChildren(h("h2", {}, "Page"), h("p", { class: "about" }, "The phone home page, laid out flat: every card at full size, top to bottom. Click a card to select it, click again (or double-click) to select something inside it. Tweaks apply to phones only."));
      return;
    }
    const n = sel, e = n.el, cs = getComputedStyle(e), d = doc();
    const tw = (getDraft().tweaks || {})[n.sel] || {};
    const count = d ? d.querySelectorAll(n.sel).length : 0;
    const r = e.getBoundingClientRect(), parent = parentOf(n);
    const kids = [h("h2", {}, n.name),
      h("p", { class: "about" }, parent ? `Inside ${parent.name}. ` : "", count > 1 ? `Same style as ${count - 1} other${count > 2 ? "s" : ""} on the page: a tweak changes all ${count}.` : "A tweak changes only this."),
      h("p", { class: "sel" }, n.sel)];
    const sec = (title, ...rows) => { const s = h("div", { class: "sec" }, h("h3", {}, title, Object.keys(tw).some((p) => rows.some((r) => r?.dataset?.p === p)) ? h("button", { class: "reset", onclick: () => { rows.forEach((r) => r?.dataset?.p && setTweak(n.sel, r.dataset.p, null, true)); } }, "Reset") : null), ...rows.filter(Boolean)); return s; };
    const ro = (label, value) => h("div", { class: "row ro" }, h("label", {}, label), h("span", {}, value));
    const num = (label, p, v, step = 1, min = 0, max = 400) => {
      const cur = p in tw ? tw[p] : v;
      const input = h("input", { class: "num", value: round(cur, step < 1 ? 2 : 0) });
      const range = h("input", { type: "range", min, max, step, value: cur });
      const put = (val, commit) => setTweak(n.sel, p, round(Math.min(max, Math.max(min, val)), 3), commit);
      range.addEventListener("input", () => { input.value = range.value; put(+range.value, false); });
      range.addEventListener("change", () => put(+range.value, true));
      input.addEventListener("keydown", (ev) => { if (ev.key === "Enter") input.blur(); });
      input.addEventListener("change", () => { const val = parseFloat(input.value); if (Number.isFinite(val)) put(val, true); });
      const row = h("div", { class: `row${p in tw ? " changed" : ""}`, "data-p": p }, h("label", {}, label), range, input);
      return row;
    };
    const color = (label, p, v) => {
      const cur = p in tw ? tw[p] : v;
      const pick = h("input", { type: "color", value: cur || "#ffffff" });
      const text = h("input", { class: "hex", value: cur || "none", spellcheck: "false" });
      pick.addEventListener("input", () => { text.value = pick.value; setTweak(n.sel, p, pick.value, false); });
      pick.addEventListener("change", () => setTweak(n.sel, p, pick.value, true));
      text.addEventListener("change", () => { const v2 = text.value.trim(); if (/^#[0-9a-f]{6}$/i.test(v2)) setTweak(n.sel, p, v2.toLowerCase(), true); });
      return h("div", { class: `row wide${p in tw ? " changed" : ""}`, "data-p": p }, h("label", {}, label), h("div", { class: "color" }, pick, text));
    };
    kids.push(sec("Position and size", ro("X", `${round(r.x, 0)}`), ro("Y", `${round(r.y, 0)}`), ro("Width", `${round(r.width, 0)}`), ro("Height", `${round(r.height, 0)}`)));
    const text = n.kind === "Text" || e.matches(".wordmark");
    if (text) {
      const fs = parseFloat(cs.fontSize), lh = cs.lineHeight === "normal" ? 1.2 : parseFloat(cs.lineHeight) / fs;
      kids.push(sec("Text", h("p", { class: "note" }, cs.fontFamily.split(",")[0].replace(/"/g, "")),
        num("Size", "font-size", fs, 1, 8, 120), num("Weight", "font-weight", +cs.fontWeight, 100, 100, 900),
        num("Line height", "line-height", lh, 0.01, 0.8, 2.4), num("Letter spacing", "letter-spacing", parseFloat(cs.letterSpacing) || 0, 0.1, -5, 10),
        color("Colour", "color", hex(cs.color))));
    }
    const flex = /flex|grid/.test(cs.display);
    kids.push(sec("Box",
      color("Fill", "background-color", hex(cs.backgroundColor)),
      num("Corners", "border-radius", parseFloat(cs.borderTopLeftRadius) || 0, 1, 0, 200),
      num("Opacity", "opacity", +cs.opacity, 0.05, 0, 1)));
    kids.push(sec("Spacing",
      num("Padding top", "padding-top", parseFloat(cs.paddingTop), 1, 0, 200), num("Right", "padding-right", parseFloat(cs.paddingRight), 1, 0, 200),
      num("Bottom", "padding-bottom", parseFloat(cs.paddingBottom), 1, 0, 200), num("Left", "padding-left", parseFloat(cs.paddingLeft), 1, 0, 200),
      flex ? num("Gap inside", "gap", parseFloat(cs.rowGap) || 0, 1, 0, 300) : null));
    el.replaceChildren(...kids);
  }

  return {
    show(on) { canvas.hidden = !on; if (on && !iframe.src) { load(); requestAnimationFrame(fit); } },
    reload: load, fit, drawTree, drawInspector,
    get selected() { return sel; },
    set outlines(v) { shown.outlines = v; },
    doc,
  };
}
