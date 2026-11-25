/* The preloader engine: two block "C"s fill their container (sized in %, so it is fluid) and play the
   loop keyframes in PRELOADER_DESIGN with springy easing. No motion blur (CC). When the page
   has loaded, exit(): the gap between the C's bursts open, they slide out of the frame, the
   "designbycc" logo behind them is revealed, then the preloader fades out.
   createPreloader(root, design) → { play, pause, seek(ms), set(design), exitAt(ms|null), exit(),
     duration(), loopDuration(), time(), playing(), valuesAt(ms), destroy, onframe, onexit } */
(() => {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / Math.max(1e-6, b - a), 0, 1); return t * t * (3 - 2 * t); };
  // easings: t in 0..1 → progress (may overshoot past 1 for bouncy ones); b = bounce 0..1
  const EASES = {
    spring: (t, b) => { const n = 0.5 + 1.6 * b, k = 7 - 3.5 * b, f = (x) => 1 - Math.exp(-k * x) * Math.cos(2 * Math.PI * n * x); return f(t) / f(1); },
    back: (t, b) => { const s = 1.2 + 3 * b, u = t - 1; return 1 + (s + 1) * u * u * u + s * u * u; },
    snap: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)) / (1 - Math.pow(2, -10)),
    smooth: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    anticipate: (t, b) => { const s = (1.2 + 3 * b) * 1.525; return t < 0.5 ? (Math.pow(2 * t, 2) * ((s + 1) * 2 * t - s)) / 2 : (Math.pow(2 * t - 2, 2) * ((s + 1) * (t * 2 - 2) + s) + 2) / 2; },
    inBack: (t, b) => { const s = 1.2 + 3 * b; return (s + 1) * t * t * t - s * t * t; },
    linear: (t) => t,
  };
  const ease = (name, t, b) => (EASES[name] || EASES.smooth)(t, b || 0);
  // exit phases: settle (the C's come to rest, even halves) → pause → open (the gap widens, the logo grows out of it,
  // the C's leave the frame) → hold on the logo → fade out
  const EXIT_DEFAULTS = { settleDur: 700, settleEase: "spring", settleBounce: 0.1, settle: 50, pause: 250,
    dur: 1400, ease: "smooth", bounce: 0, logoFirst: "designby", logoSecond: "cc", logoSize: 9, logoWeight: 500, logoWeight2: 800,
    logoTracking: 0, logoColor: "#141414", logoScale: 35, logoGrow: 70, hold: 900, fadeOut: 600,
    minShow: 1600 };   // minShow: on the site, the loop plays at least this long (ms) before the exit
  // cut lines: "fixed" (CC's sketch) starts each cut cutStart % of an even-half C in from the C's left edge,
  // and runs to its open right edge: the start never moves, only the length follows the stretch.
  // "keyframes" uses each key's from1 / from2 (% of the C's current width) instead.
  const LOOK_DEFAULTS = { cutMode: "fixed", cutStart: 23 };
  const NUM = ["share", "h1", "h2", "y1", "y2", "from1", "from2"];
  window.PRELOADER_EASES = Object.keys(EASES);
  window.PRELOADER_EASE = ease;
  window.PRELOADER_EXIT_DEFAULTS = EXIT_DEFAULTS;
  window.PRELOADER_LOOK_DEFAULTS = LOOK_DEFAULTS;
  window.createPreloader = function createPreloader(root, design) {
        let D = design, t = 0, last = 0, raf = 0, playing = false, exitAt = null, exited = false;
    root.innerHTML = `<p data-pl="logo"><span></span><b></b></p><div data-pl="c1"><i></i></div><div data-pl="c2"><i></i></div>`;
    if (getComputedStyle(root).position === "static") root.style.position = "relative";
    root.style.overflow = "hidden";
    const logo = root.querySelector('[data-pl="logo"]'), [t1, t2] = root.querySelectorAll("div[data-pl]"), [s1, s2] = [t1.firstChild, t2.firstChild];
    for (const el of [t1, t2]) el.style.cssText = "position:absolute;overflow:hidden;z-index:1;will-change:left,width";
    for (const el of [s1, s2]) el.style.cssText = "position:absolute;display:block";
    logo.style.cssText = "position:absolute;left:50%;top:50%;margin:0;white-space:nowrap;line-height:1;z-index:0;font-family:Switzer,sans-serif;pointer-events:none";
    const X = () => ({ ...EXIT_DEFAULTS, ...(D.exit || {}) });
    const loopDuration = () => D.keys.reduce((s, k) => s + k.dur + k.hold, 0);
    const exitLength = () => { const x = X(); return x.settleDur + x.pause + x.dur + x.hold + x.fadeOut; };
    const duration = () => (exitAt == null ? loopDuration() : exitAt + exitLength());
    function loopAt(ms) { // keyframe i: transition (dur) from the previous key, then hold
      const K = D.keys, n = K.length, T = loopDuration(), o = {};
      let m = ((ms % T) + T) % T;
      for (let i = 0; i < n; i++) {
        const k = K[i], from = K[(i - 1 + n) % n];
        if (m < k.dur) { const e = ease(k.ease, clamp(m / k.dur, 0, 1), k.bounce); NUM.forEach((p) => (o[p] = lerp(from[p], k[p], e))); o.key = i; return o; }
        m -= k.dur;
        if (m < k.hold) { NUM.forEach((p) => (o[p] = k[p])); o.key = i; return o; }
        m -= k.hold;
      }
      NUM.forEach((p) => (o[p] = K[0][p])); o.key = 0; return o;
    }
    function valuesAt(ms) {
      if (!D.keys.length) return null;
      if (exitAt == null || ms < exitAt) return { ...loopAt(ms), phase: "loop" };
      const x = X(), te = ms - exitAt, base = loopAt(exitAt), o = { ...base }, k0 = D.keys[0];
      // 1. settle: from wherever the loop was, to even halves at rest
      const se = ease(x.settleEase, clamp(te / Math.max(1, x.settleDur), 0, 1), x.settleBounce);
      o.share = lerp(base.share, x.settle, se); o.from1 = lerp(base.from1, k0.from1, se); o.from2 = lerp(base.from2, k0.from2, se);
      o.h1 = lerp(base.h1, 100, se); o.h2 = lerp(base.h2, 100, se); o.y1 = lerp(base.y1, 50, se); o.y2 = lerp(base.y2, 50, se);
      // 2. open: the gap widens from its thin line, the logo grows out of it, the C's leave the frame
      const to = te - x.settleDur - x.pause, lin = clamp(to / x.dur, 0, 1);
      o.open = to <= 0 ? 0 : ease(x.ease, lin, x.bounce);
      o.logo = to <= 0 ? 0 : smooth(0, 0.12, lin);
      o.grow = to <= 0 ? 0 : smooth(0, Math.max(0.05, x.logoGrow / 100), lin);
      // 3. hold, then fade out to the site
      o.fade = 1 - smooth(x.settleDur + x.pause + x.dur + x.hold, exitLength(), te);
      o.phase = te >= exitLength() ? "done" : "exit"; o.te = te;
      return o;
    }
    // style writes go through put(): a value is only written when it changed, so a still frame costs nothing
    const put = (el, k, val) => { const c = el._pl || (el._pl = {}); if (c[k] !== val) { c[k] = val; el.style[k] = val; } };
    const text = (el, val) => { if (el.textContent !== val) el.textContent = val; };
    let W = root.clientWidth, H = root.clientHeight;   // kept current by the ResizeObserver below
    function draw() {
      const L = { ...LOOK_DEFAULTS, ...D.look }, v = valuesAt(t); if (!v) return;
      const u = Math.min(W, H) / 100;
      const m = L.margin * u, g = L.gap * u, r = L.radius * u, th = L.thickness * u;
      const avail = Math.max(0, W - 2 * m - g), share = clamp(v.share, 3, 97) / 100;
      const w1 = avail * share, w2 = avail - w1, ih = H - 2 * m;
      // the doors open around the gap: each C travels out until it has fully left the frame
      const open = v.open || 0, x1 = m - open * (m + w1 + 4 * u), x2 = m + w1 + g + open * (W - (m + w1 + g) + 4 * u);
      put(root, "background", L.bg);
      put(root, "opacity", v.fade == null ? "" : String(v.fade));
      const place = (el, x, w, hPct, fill) => { const h = (ih * clamp(hPct, 5, 100)) / 100;
        put(el, "left", `${x}px`); put(el, "width", `${w}px`); put(el, "top", `${m + (ih - h) / 2}px`); put(el, "height", `${h}px`);
        put(el, "background", fill); put(el, "borderRadius", `${Math.min(r, w / 2, h / 2)}px`); return h; };
      const h1 = place(t1, x1, w1, v.h1, L.c1), h2 = place(t2, x2, w2, v.h2, L.c2);
      const fixedStart = (avail / 2) * (L.cutStart / 100);
      const cut = (el, w, h, y, from) => {
        const x0 = L.cutMode === "keyframes" ? (w * from) / 100 : Math.min(fixedStart, w - 2);
        put(el, "left", `${x0}px`); put(el, "width", `${w - x0 + 2}px`);
        put(el, "top", `${(h * y) / 100 - th / 2}px`); put(el, "height", `${th}px`); put(el, "background", L.slit); };
      cut(s1, w1, h1, v.y1, v.from1); cut(s2, w2, h2, v.y2, v.from2);
      // the logo (the editor's stand-in; the site leaves it empty and shows the real opening) waits behind
      // the C's, centred in the gap, and grows with it from a sliver to full size
      const x = X(), lg = v.logo || 0;
      v.cx = (x1 + w1 + x2) / 2;   // the gap's centre (the site grows the opening from here)
      if (x.logoFirst || x.logoSecond) {
        put(logo, "display", ""); text(logo.firstChild, x.logoFirst); text(logo.lastChild, x.logoSecond);
        put(logo, "color", x.logoColor); put(logo, "fontSize", `${x.logoSize * u}px`); put(logo, "fontWeight", String(x.logoWeight));
        put(logo.lastChild, "fontWeight", String(x.logoWeight2)); put(logo, "letterSpacing", `${x.logoTracking}em`);
        put(logo, "left", `${v.cx}px`); put(logo, "opacity", String(lg));
        put(logo, "transform", `translate(-50%, -50%) scale(${lerp(x.logoScale / 100, 1, v.grow || 0)})`);
      } else put(logo, "display", "none");
      if (v.phase === "done" && !exited) { exited = true; api.onexit && api.onexit(); }
      return v;
    }
    const tick = (now) => { const dt = last ? now - last : 16; last = now; t += dt * (D.look.speed || 1); const v = draw(); api.onframe && api.onframe(t, v); raf = requestAnimationFrame(tick); };
    const ro = new ResizeObserver(() => { W = root.clientWidth; H = root.clientHeight; draw(); }); ro.observe(root);
    const api = {
      play() { if (playing) return; playing = true; last = 0; raf = requestAnimationFrame(tick); },
      pause() { playing = false; cancelAnimationFrame(raf); draw(); },
      seek(ms) { t = Math.max(0, ms); exited = exitAt != null && t >= exitAt + exitLength(); const v = draw(); api.onframe && api.onframe(t, v); },
      set(d) { D = d; if (!playing) draw(); },
      exitAt(ms) { exitAt = ms; exited = false; if (!playing) draw(); },
      exit() { exitAt = t; exited = false; api.play(); },          // the page has loaded: open up from wherever the loop is
      duration, loopDuration, exitLength, time: () => t, playing: () => playing, valuesAt, exitTime: () => exitAt,
      destroy() { cancelAnimationFrame(raf); ro.disconnect(); root.innerHTML = ""; },
      onframe: null, onexit: null,
    };
    draw();
    return api;
  };
})();
