/* ------------------------------------------------------------
   The preloader (home, with the opening): the two block "C"s stretch while the page loads, then
   settle into even halves, the gap between them opens and the opening (opening.js) grows out of it.
   Three plain deferred scripts in designbycc-landing/preloader/, loaded by index.html ahead of the site
   bundle, so the preloader is on screen while that bundle is still downloading (the build joins and
   minifies them into one /assets/preloader-<hash>.js: vite.site.config.ts): preloader-design.js (CC's
   settings: the motion editor, `node docs/preloader/serve.mjs`, and the logo tuner,
   localhost:8080/?tune), preloader.js (the engine) and this file, which wires it to the site:
   - starts when the opening will play (.has-opening: home, not reduced motion); ?preloader=0 skips it;
   - main.js calls loaded() once fonts and the home images are in (the same gate the intro uses);
     it then plays for at least exit.minShow ms before the exit starts;
   - opening.js waits on `reveal` (the moment the gap starts to open) before it runs, and calls
     cancel() if it bails, so the normal intro is never blocked.
   ------------------------------------------------------------ */
(() => {
// The opening's wordmark: width as % of the screen (desktop / phones up to 730px), capped at
// maxHeight % of its height, moved x % of its width and y % of its height from the centre.
// The defaults keep the size it had before the tuner (62% / 80% of the header link's width).
// doodleHold: seconds the finished flower doodle stays before the first media cut (one beat at 120 bpm = 0.5).
const SITE_LOGO_DEFAULTS = window.SITE_LOGO_DEFAULTS = { size: 57, sizePhone: 74, maxHeight: 32, x: 0, y: 0, doodleHold: 0.5 };
const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
if (local && new URLSearchParams(location.search).has("tune")) {   // the logo tuner's unsaved changes, while they still apply to the saved file
  window.__PRELOADER_FILE = JSON.stringify(window.PRELOADER_DESIGN);
  try {
    const draft = JSON.parse(localStorage.getItem("preloader-tune") || "null");
    if (draft && draft.base === JSON.stringify(window.PRELOADER_DESIGN)) Object.assign(window.PRELOADER_DESIGN, draft.d);
  } catch {}
}
window.SITE_LOGO = { ...SITE_LOGO_DEFAULTS, ...(window.PRELOADER_DESIGN.site || {}) };

const ON = document.documentElement.classList.contains("has-opening") &&
  new URLSearchParams(location.search).get("preloader") !== "0" && !!window.createPreloader;

if (ON) {
  let showReveal, P = null, root = null, cover = null, revealed = false, grown = false, wantExit = false, running = false;
  const reveal = new Promise((resolve) => { showReveal = resolve; });
  const saved = window.PRELOADER_DESIGN;
  const X = { ...window.PRELOADER_EXIT_DEFAULTS, ...(saved.exit || {}) };
  // the real opening replaces the editor's stand-in logo, and takes over from the open doors (no hold, no fade)
  // the background and the cut lines are the page's own colour, so the doors open seamlessly onto the site
  const page = getComputedStyle(document.body).getPropertyValue("--color-bg").trim() || saved.look.bg;
  const design = { ...saved, look: { ...saved.look, bg: page, slit: page }, exit: { ...X, logoFirst: "", logoSecond: "", hold: 0, fadeOut: 0 } };
  const lerp = (a, b, t) => a + (b - a) * t;

  const finish = () => {
    if (cover) cover.style.transform = cover.style.transformOrigin = "";
    P?.destroy(); P = null; root?.remove(); root = null;
    showReveal();
  };
  try {
    root = document.createElement("div");
    root.className = "c-preloader";
    root.setAttribute("aria-hidden", "true");
    root.style.cssText = "position:fixed;inset:0;z-index:10000001;pointer-events:none";
    document.body.prepend(root);
    P = window.createPreloader(root, design);
    P.onframe = (t, v) => {
      if (!v || v.phase === "loop") return;
      if (!revealed && v.open > 0) {
        revealed = true; showReveal();
        // from here the gap shows the opening behind, so the preloader drops its own background
        P.set({ ...design, look: { ...design.look, bg: "transparent" } });
      }
      // the opening grows out of the gap with it, from logoScale to full size; only once it has
      // run, because it measures itself as it starts and a scaled cover would throw it off
      cover = cover || document.querySelector(".c-opening");
      if (cover && running && !grown) {
        cover.style.transformOrigin = `${v.cx}px 50%`;
        cover.style.transform = `scale(${lerp(X.logoScale / 100, 1, v.grow || 0)})`;
        if (v.grow >= 1) { grown = true; cover.style.transform = cover.style.transformOrigin = ""; }
      }
    };
    P.onexit = finish;
    P.play();
    // fail-safe: whatever happens, never hold the site behind the preloader for more than 20 s
    setTimeout(() => { if (P) { console.warn("[preloader] timed out"); finish(); } }, 20000);
  } catch (err) {
    console.error("[preloader]", err);
    finish();
  }

  window.sitePreloader = {
    reveal,
    // the page is ready: start the exit once the loop has had its minimum time on screen
    loaded() {
      if (!P || wantExit) return;
      wantExit = true;
      const wait = Math.max(0, (X.minShow || 0) - P.time() / (saved.look.speed || 1));
      setTimeout(() => P?.exit(), wait);
    },
    started() { running = true; },   // opening.js: run() has measured and started
    cancel: finish,
  };
}

})();
