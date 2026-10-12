/* resume-overlay — every "Resume" link ([data-resume]) opens CC's resume as
   a full-screen overlay over whatever is showing (home or a page), and
   closing it returns to exactly that.

   The overlay frames the real resume page (public/resume.html), so the
   write-up, layout, fonts, print styles and floating download button are
   the live page's own, 1:1, and never drift from it. The page is loaded as
   srcdoc with its root-absolute paths (/fonts, /resume.pdf) pointed at
   public/, which is where Vite serves them from on the real site.

   A frame also isolates input: wheel, drag and touch inside the resume
   never reach the slider underneath.

   Close: the Close button, Esc (inside or outside the frame), or browser
   back (opening pushes one history entry with the same URL). The page
   under the overlay is inert while it's open; focus returns to the link.
   Cmd/Ctrl-click still opens designby.cc/resume in a new tab. */

(function () {
  const SRC = "../public/resume.html";
  const ROOT_PATHS = /(["'(])\/(fonts|resume\.pdf|favicon\.ico)/g;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let overlay, frame, closeBtn, ready = null, loaded = false, open = false, opener = null;

  function build() {
    overlay = document.createElement("div");
    overlay.className = "c-resume";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Resume");
    overlay.hidden = true;

    frame = document.createElement("iframe");
    frame.className = "c-resume__frame";
    frame.title = "CC Teo's resume";

    closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "c-resume__close";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", requestClose);

    overlay.append(frame, closeBtn);
    document.body.appendChild(overlay);
  }

  // Load once (on idle after page load, or on first click if sooner).
  function load() {
    if (ready) return ready;
    ready = fetch(SRC)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status))))
      .then((html) => new Promise((resolve) => {
        frame.addEventListener("load", resolve, { once: true });
        frame.srcdoc = html.replace(ROOT_PATHS, "$1../public/$2");
      }))
      .then(() => {
        loaded = true;
        // Esc pressed while focus is inside the frame.
        frame.contentDocument.addEventListener("keydown", (e) => {
          if (e.key === "Escape") requestClose();
        });
      });
    return ready;
  }

  function setInert(on) {
    for (const node of document.body.children) {
      if (node !== overlay && node.tagName !== "SCRIPT") node.inert = on;
    }
  }

  function show(push) {
    if (open) return;
    open = true;
    // Slide up at once; the frame fades in when the page has loaded.
    overlay.classList.toggle("is-loading", !loaded);
    load().then(() => overlay.classList.remove("is-loading")).catch(() => {
      hide();
      if (opener) window.open(opener.href, "_blank", "noopener");
    });
    if (push) history.pushState({ resume: true }, "", location.href);
    document.body.classList.remove("is-menu-open");
    document.body.classList.add("has-resume");
    overlay.hidden = false;
    setInert(true);
    if (loaded) frame.contentWindow.scrollTo(0, 0);
    overlay.getBoundingClientRect(); // start from the closed pose
    overlay.classList.add("is-open");
    closeBtn.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent("resume:open"));
  }

  function hide() {
    if (!open) return;
    open = false;
    overlay.classList.remove("is-open");
    document.body.classList.remove("has-resume");
    setInert(false);
    const done = () => { if (!open) overlay.hidden = true; };
    if (reduced.matches) done();
    else overlay.addEventListener("transitionend", done, { once: true });
    if (opener) opener.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent("resume:close"));
  }

  // Closing from the UI goes through history, so back/forward stay in step.
  function requestClose() {
    if (!open) return;
    if (history.state && history.state.resume) history.back();
    else hide();
  }

  // Wired up as soon as this script runs (it's last in <body>), not on
  // DOMContentLoaded, which waits for the GSAP scripts from the CDN.
  build();
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("[data-resume]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // new tab etc.
    e.preventDefault();
    opener = a;
    show(true);
  });
  // Hovering a Resume link is intent: start loading.
  document.addEventListener("pointerover", (e) => {
    if (e.target.closest && e.target.closest("[data-resume]")) load().catch(() => {});
  });

  // Capture phase on window: runs before the page's own Esc handler, so
  // Esc closes only the resume and leaves the page under it (e.g. About) open.
  window.addEventListener("keydown", (e) => {
    if (open && e.key === "Escape") {
      e.stopPropagation();
      requestClose();
    }
  }, true);

  window.addEventListener("popstate", (e) => {
    if (e.state && e.state.resume) show(false);
    else hide();
  });

  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
  document.addEventListener("DOMContentLoaded", () => idle(() => load().catch(() => {}), { timeout: 4000 }));
})();
