/* The logo tuner: a panel on the real page, dev only (localhost:8080/?tune; never in the build, see
   site.js). It sizes and places the opening's "designbycc" wordmark, the part that grows out of
   the preloader's gap, and saves into designbycc-landing/preloader/preloader-design.js ("site", plus the grow settings
   in "exit") through the dev server (vite.site.config.ts).
   - Changes move the wordmark live while the opening plays; "Preview the logo" shows it any time.
   - Drag the dashed box to move it. Replay reloads the page with the unsaved changes kept (a draft).
   - "Hold before it flies home" stops the opening on the finished logo until Continue. */
const SITE_LOGO_DEFAULTS = window.SITE_LOGO_DEFAULTS;   // designbycc-landing/preloader/site-preloader.js

const KEY = "preloader-tune", HOLD = "preloader-tune-hold";
const css = `
.pt{position:fixed;top:12px;right:12px;z-index:2147483646;width:276px;max-height:calc(100vh - 24px);overflow:auto;background:#fff;color:#141414;
  border:1px solid rgba(0,0,0,.14);border-radius:10px;font:12px/1.35 -apple-system,BlinkMacSystemFont,"Switzer",sans-serif;user-select:none}
.pt *{box-sizing:border-box}
.pt header{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #eee;cursor:default}
.pt header b{flex:1;font-weight:600}
.pt header i{font-style:normal;color:#b45309;font-size:11px}
.pt .bd{padding:4px 12px 12px}
.pt.min .bd{display:none}
.pt h4{margin:12px 0 6px;font-size:11px;font-weight:600;color:#737373;text-transform:uppercase;letter-spacing:.04em}
.pt .row{display:grid;grid-template-columns:1fr 54px;gap:4px 8px;align-items:center;margin:6px 0}
.pt .row label{grid-column:1/3;display:flex;justify-content:space-between;color:#404040}
.pt .row label span{color:#a3a3a3}
.pt input[type=range]{width:100%;accent-color:#141414;margin:0}
.pt input[type=number]{width:54px;padding:3px 4px;border:1px solid #ddd;border-radius:5px;font:inherit;text-align:right}
.pt .btns{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}
.pt button{font:inherit;padding:5px 9px;border:1px solid #d4d4d4;background:#fff;border-radius:6px;cursor:pointer;color:#141414}
.pt button:hover{background:#f5f5f5}
.pt button.pri{background:#141414;color:#fff;border-color:#141414}
.pt button.pri:hover{background:#333}
.pt button.icon{padding:2px 7px}
.pt .chk{display:flex;align-items:center;gap:6px;margin:6px 0;color:#404040;cursor:pointer}
.pt .note{color:#737373;font-size:11px;margin:6px 0 0}
.pt .msg{min-height:15px;color:#15803d;font-size:11px;margin-top:6px}
.pt-guides{position:fixed;inset:0;z-index:2147483645;pointer-events:none}
.pt-guides .ax{position:absolute;background:rgba(236,72,153,.55)}
.pt-guides .box{position:absolute;border:1px dashed #ec4899;pointer-events:auto;cursor:move}
.pt-guides .box span{position:absolute;left:-1px;top:-20px;background:#ec4899;color:#fff;font:10px/1 -apple-system,sans-serif;padding:3px 5px;border-radius:3px;white-space:nowrap}
.pt-ghost{position:fixed;z-index:2147483644;inset:0;background:var(--color-bg,#f2f2f2);pointer-events:none}
.pt-ghost .wordmark{position:absolute;left:0;top:0;line-height:1;white-space:nowrap;color:var(--color-text,#141414)}
.pt-ghost .wordmark__cc{font-weight:700}
`;

export function startTuner() {
  const D = window.PRELOADER_DESIGN;
  // the file as saved (before any draft) is what "Unsaved" and Revert compare against
  let BASE = window.__PRELOADER_FILE || JSON.stringify(D);
  const norm = (o) => JSON.stringify({ ...o, site: { ...SITE_LOGO_DEFAULTS, ...(o.site || {}) }, exit: { ...window.PRELOADER_EXIT_DEFAULTS, ...(o.exit || {}) } });
  const L = window.SITE_LOGO;
  D.site = { ...SITE_LOGO_DEFAULTS, ...(D.site || {}) };
  D.exit = { ...window.PRELOADER_EXIT_DEFAULTS, ...(D.exit || {}) };
  const S = D.site, X = D.exit;

  const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);
  const el = document.createElement("div"); el.className = "pt";
  const guides = document.createElement("div"); guides.className = "pt-guides";
  guides.innerHTML = '<div class="ax" style="left:50%;top:0;bottom:0;width:1px"></div><div class="ax" style="top:50%;left:0;right:0;height:1px"></div><div class="box"><span></span></div>';
  const box = guides.querySelector(".box"), tag = box.firstChild;
  const ghost = document.createElement("div"); ghost.className = "pt-ghost";
  ghost.innerHTML = '<span class="wordmark">designby<span class="wordmark__cc">cc</span></span>';
  document.body.append(ghost, guides, el);
  // clicks and keys in the tuner must not skip the opening (opening.js listens on window)
  for (const t of ["pointerdown", "keydown"]) { el.addEventListener(t, (e) => e.stopPropagation()); box.addEventListener(t, (e) => e.stopPropagation()); }

  const pref = (k, v) => { try { if (v === undefined) return localStorage.getItem(k) === "1"; localStorage.setItem(k, v ? "1" : "0"); } catch {} };
  let showGuides = true, preview = false;
  const row = (obj, k, label, min, max, step, unit) => `<div class="row" data-k="${k}" data-o="${obj}"><label>${label}<span>${unit}</span></label>` +
    `<input type="range" min="${min}" max="${max}" step="${step}"><input type="number" min="${min}" max="${max}" step="${step}"></div>`;
  el.innerHTML = `<header><b>Logo tuner</b><i class="dirty"></i><button class="icon" data-a="min" title="Collapse">–</button></header><div class="bd">
    <h4>Size</h4>
    ${row("S", "size", "Width", 10, 100, 0.5, "% of the screen")}
    ${row("S", "sizePhone", "Width on phones", 10, 100, 0.5, "% (≤ 730 px)")}
    ${row("S", "maxHeight", "No taller than", 5, 80, 0.5, "% of the height")}
    <h4>Position</h4>
    ${row("S", "x", "Left ↔ right", -45, 45, 0.1, "% from centre")}
    ${row("S", "y", "Up ↕ down", -45, 45, 0.1, "% from centre")}
    <div class="btns"><button data-a="centre">Centre it</button></div>
    <h4>Growing out of the gap</h4>
    ${row("X", "logoScale", "Starts at", 5, 100, 1, "% size")}
    ${row("X", "logoGrow", "Full size at", 5, 100, 1, "% of the opening")}
    ${row("X", "minShow", "Preloader plays at least", 0, 8000, 50, "ms")}
    <h4>The opening</h4>
    ${row("S", "doodleHold", "Flower stays after drawing", 0, 3, 0.05, "s")}
    <p class="note">These show on Replay. 0.5 s is one beat: the cuts stay on the beat at 0.25 s steps.</p>
    <h4>See it</h4>
    <label class="chk"><input type="checkbox" data-c="guides"> Guides (drag the box to move)</label>
    <label class="chk"><input type="checkbox" data-c="preview"> Preview the logo (no animation)</label>
    <label class="chk"><input type="checkbox" data-c="hold"> Hold before it flies home</label>
    <div class="btns"><button data-a="replay">↻ Replay</button><button data-a="pause">Pause</button><button data-a="go" hidden>Continue ▸</button></div>
    <h4>Keep it</h4>
    <div class="btns"><button class="pri" data-a="save">Save</button><button data-a="revert">Revert</button></div>
    <p class="note">Saves to designbycc-landing/preloader/preloader-design.js, which the motion editor uses too.</p>
    <div class="msg"></div></div>`;
  const $ = (s) => el.querySelector(s), msg = (t, bad) => { const m = $(".msg"); m.textContent = t; m.style.color = bad ? "#b91c1c" : "#15803d"; };
  const objs = { S, X };

  // ---- the wordmark's place: the opening's own layout, or the same maths for the preview ----
  function place(moved) {
    Object.assign(L, S);
    if (moved) window.siteOpening?.relayout?.();
    const wm = document.querySelector(".c-opening .wm");
    const usePreview = preview || !wm;
    ghost.style.display = preview ? "" : "none";
    if (preview) {   // opening.js layout(), on a static copy of the header wordmark
      const g = ghost.firstChild, share = (innerWidth <= 730 ? S.sizePhone : S.size) / 100;
      Object.assign(g.style, { fontSize: "100px", letterSpacing: "-0.02em" });
      const fs = Math.min((100 * innerWidth * share) / g.offsetWidth, (innerHeight * S.maxHeight) / 100);
      g.style.fontSize = `${fs}px`;
      g.style.left = `${(innerWidth - g.offsetWidth) / 2 + (innerWidth * S.x) / 100}px`;
      g.style.top = `${innerHeight / 2 - fs / 2 + (innerHeight * S.y) / 100}px`;
    }
    const target = usePreview ? (preview ? ghost.firstChild : null) : wm;
    guides.style.display = showGuides && target && !document.querySelector(".c-preloader") ? "" : "none";
    if (target) {
      const r = target.getBoundingClientRect();
      Object.assign(box.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
      tag.textContent = `${Math.round(r.width)} × ${Math.round(r.height)} px · ${((r.width / innerWidth) * 100).toFixed(1)}% wide`;
    }
  }
  // keep the guide box on the wordmark while the opening animates
  (function follow() { if (showGuides) place(); if (document.querySelector(".c-opening, .c-preloader")) requestAnimationFrame(follow); })();

  function sync() {
    el.querySelectorAll(".row").forEach((r) => { const v = objs[r.dataset.o][r.dataset.k]; r.querySelectorAll("input").forEach((i) => { i.value = v; }); });
    const dirty = norm(D) !== norm(JSON.parse(BASE));
    $(".dirty").textContent = dirty ? "Unsaved" : "";
    try { if (dirty) localStorage.setItem(KEY, JSON.stringify({ base: BASE, d: { site: S, exit: X } })); else localStorage.removeItem(KEY); } catch {}
    place(true);
  }
  el.querySelectorAll(".row").forEach((r) => r.querySelectorAll("input").forEach((i) => i.addEventListener("input", () => {
    const v = parseFloat(i.value); if (Number.isNaN(v)) return; objs[r.dataset.o][r.dataset.k] = v; sync();
  })));

  // drag the box to move the wordmark
  box.addEventListener("pointerdown", (e) => {
    box.setPointerCapture(e.pointerId);
    const x0 = e.clientX, y0 = e.clientY, sx = S.x, sy = S.y;
    const move = (ev) => {
      S.x = Math.round((sx + ((ev.clientX - x0) / innerWidth) * 100) * 10) / 10;
      S.y = Math.round((sy + ((ev.clientY - y0) / innerHeight) * 100) * 10) / 10;
      sync();
    };
    const up = () => { box.removeEventListener("pointermove", move); box.removeEventListener("pointerup", up); };
    box.addEventListener("pointermove", move); box.addEventListener("pointerup", up);
  });

  // hold the finished logo before it flies into the header
  let release = null;
  const so = window.siteOpening;
  if (so) {
    const fly = so.flyHome;
    so.flyHome = (opts) => {
      if (!pref(HOLD) || !document.querySelector(".c-opening")) return fly(opts);
      $('[data-a="go"]').hidden = false; msg("Holding on the logo: Continue to let it fly home.");
      return new Promise((res) => { release = res; }).then(() => fly(opts));
    };
  }

  const checks = { guides: () => showGuides, preview: () => preview, hold: () => pref(HOLD) };
  el.querySelectorAll("[data-c]").forEach((c) => {
    c.checked = checks[c.dataset.c]();
    c.addEventListener("change", () => {
      if (c.dataset.c === "guides") showGuides = c.checked;
      if (c.dataset.c === "preview") preview = c.checked;
      if (c.dataset.c === "hold") pref(HOLD, c.checked);
      place(true);
    });
  });
  el.addEventListener("click", async (e) => {
    const a = e.target.closest("[data-a]")?.dataset.a; if (!a) return;
    if (a === "min") { el.classList.toggle("min"); e.target.textContent = el.classList.contains("min") ? "+" : "–"; }
    if (a === "centre") { S.x = 0; S.y = 0; sync(); }
    if (a === "replay") location.reload();
    if (a === "pause") { const tl = window.gsap?.globalTimeline; if (!tl) return; tl.paused(!tl.paused()); e.target.textContent = tl.paused() ? "Play" : "Pause"; }
    if (a === "go") { e.target.hidden = true; msg(""); release?.(); release = null; }
    if (a === "revert") { const s = JSON.parse(BASE); Object.assign(S, SITE_LOGO_DEFAULTS, s.site || {}); Object.assign(X, window.PRELOADER_EXIT_DEFAULTS, s.exit || {}); sync(); msg("Back to the saved version."); }
    if (a === "save") {
      try {
        const r = await fetch("/__preloader/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(D) });
        const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
        BASE = JSON.stringify(D); sync(); msg("Saved to designbycc-landing/preloader/preloader-design.js");
      } catch (err) { msg(`Couldn't save: ${err.message}`, true); }
    }
  });
  addEventListener("resize", () => place(true));
  sync();
}
