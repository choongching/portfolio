/* designbycc landing — private interaction study.
   Own implementation of the mechanics documented in
   research/2026-07-18-smlxl-landing-recreation.md (derived spec:
   timings, eases, clamps, and math measured from the origin site). */

gsap.registerPlugin(CustomEase);
gsap.ticker.lagSmoothing(0);

/* ------------------------------------------------------------
   Constants (all measured from the origin)
   ------------------------------------------------------------ */

const DESIGN_WIDTH = 2048; // canvas width the slides were designed at
const BP_MD = 1300;
const BP_SM = 730;
const BP_MENU = 900; // mobile menu breakpoint

const ENTER_SCALE = 0.3; // scale a slide enters the viewport at
const GAP = 20; // must match .c-slider__container gap
const LEFT_INSET = 30; // focus line rest position
const WHEEL_CLAMP = 70; // max px applied per wheel event
const DRAG_CLAMP = 140; // max px applied per pointer move
const FRICTION = 0.95; // momentum decay per frame

const isMD = () => window.innerWidth <= BP_MD && window.innerWidth > BP_SM;
const isSM = () => window.innerWidth <= BP_SM;
const isMenuBreakpoint = () => window.innerWidth <= BP_MENU;

/* ------------------------------------------------------------
   Slide sizing: each item is authored at design-canvas size and
   scaled with --initial-scale; the inner counter-scales so layout
   stays at authored pixel values. Heights are set explicitly
   because transforms don't affect flow layout.
   ------------------------------------------------------------ */

class SlideSizer {
  constructor(items) {
    this.items = items;
  }

  captureBaseHeights() {
    this.items.forEach((item) => {
      if (!item.dataset.baseHeight) {
        item.dataset.baseHeight = item.offsetHeight;
      }
    });
  }

  apply() {
    let scale = window.innerWidth / DESIGN_WIDTH;
    if (isMD()) scale *= 1.5;
    else if (isSM()) scale *= 2;

    this.items.forEach((item) => {
      item.style.setProperty("--initial-scale", scale);
      item.style.height = `${item.dataset.baseHeight * scale}px`;
    });
  }
}

/* ------------------------------------------------------------
   Line-break freezing: text must never rewrap while a slide
   scales, so detect where each line naturally breaks (via
   word-span offsetTop changes), hard-code <br>s, set nowrap.
   Applied to every text atom + leaf content node, as origin does.
   ------------------------------------------------------------ */

function freezeLineBreaks(scope) {
  const targets = scope.querySelectorAll(
    ".a-text__text, .a-content__content > *:not(:has(*))"
  );
  targets.forEach((el) => {
    const words = el.innerText.split(/\s+/).filter(Boolean);
    if (!words.length) return;
    el.innerHTML = "";
    const spans = words.map((word) => {
      const span = document.createElement("span");
      span.textContent = word + " ";
      el.appendChild(span);
      return span;
    });
    const parts = [];
    let lastTop = null;
    spans.forEach((span) => {
      if (lastTop !== null && span.offsetTop > lastTop) parts.push("<br>");
      parts.push(span.textContent);
      lastTop = span.offsetTop;
    });
    el.innerHTML = parts.join("");
    el.style.whiteSpace = "nowrap";
  });
}

/* ------------------------------------------------------------
   Clock: CSS-variable clock. Hands via --hour-angle/--minute-angle,
   updated every second; timezone via data-offset (hours vs UTC).
   ------------------------------------------------------------ */

class Clock {
  constructor(node) {
    this.node = node;
    const currentOffsetUTC = new Date().getTimezoneOffset() / 60;
    const offsetUTC = parseInt(node.dataset.offset, 10);
    this.totalOffset = (currentOffsetUTC + offsetUTC) * 3600000;
    this.update();
    setInterval(() => this.update(), 1000);
  }

  update() {
    const date = new Date(Date.now() + this.totalOffset);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const hourAngle = (hours % 12) * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6 + seconds * 0.1;
    this.node.style.setProperty("--hour-angle", `${hourAngle}deg`);
    this.node.style.setProperty("--minute-angle", `${minuteAngle}deg`);
  }
}

/* ------------------------------------------------------------
   SliderEngine — the core interaction. A virtual "focus line"
   sweeps the viewport with scroll progress: slides right of it
   fan in from the edge (scaled, pinned to their neighbour);
   slides left of it shrink toward their bottom-right corner
   while the row collapses by the width they free up.
   ------------------------------------------------------------ */

class SliderEngine {
  constructor({ viewport, track }) {
    this.viewport = viewport;
    this.track = track;
    // Rightmost slide first: translations accumulate right → left.
    this.slides = [...track.querySelectorAll(".js-c-slider__slide")].reverse();
    this.links = [...viewport.querySelectorAll("a")];
    this.progress = 0;
    this.dragDelta = 0;
    this.dragTravel = 0;
    this.lastPointerX = null;
    this.pointerDown = false;

    this.onWheel = this.onWheel.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
  }

  /** Cache the natural (unscaled) size of every slide. */
  measure() {
    this.sizes = this.slides.map((slide) => {
      const prevScale = slide.style.scale;
      const prevVar = slide.style.getPropertyValue("--scale");
      slide.style.setProperty("--scale", "1");
      slide.style.scale = 1;
      const size = { width: slide.offsetWidth, height: slide.offsetHeight };
      slide.style.scale = prevScale;
      slide.style.setProperty("--scale", prevVar);
      return size;
    });
  }

  /** Reset to progress 0 and lay out the resting composition. */
  layout() {
    this.progress = 0;
    this.viewport.scrollLeft = 0;
    const rect = this.viewport.getBoundingClientRect();
    this.left = rect.left + LEFT_INSET;
    this.width = rect.width;
    // Transforms change measured rects, so run to convergence.
    this.update();
    this.update();
    this.update();
  }

  attach() {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener("wheel", this.onWheel);
    window.addEventListener("mousedown", this.onPointerDown);
    window.addEventListener("mousemove", this.onPointerMove);
    window.addEventListener("mouseup", this.onPointerUp);
    this.viewport.addEventListener("touchstart", this.onTouchStart);
    this.viewport.addEventListener("touchmove", this.onTouchMove, {
      passive: false,
    });
    this.viewport.addEventListener("touchend", this.onPointerUp);
  }

  detach() {
    if (!this.attached) return;
    this.attached = false;
    this.pointerDown = false;
    this.lastPointerX = null;
    this.dragDelta = 0;
    window.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("mousedown", this.onPointerDown);
    window.removeEventListener("mousemove", this.onPointerMove);
    window.removeEventListener("mouseup", this.onPointerUp);
    this.viewport.removeEventListener("touchstart", this.onTouchStart);
    this.viewport.removeEventListener("touchmove", this.onTouchMove);
    this.viewport.removeEventListener("touchend", this.onPointerUp);
  }

  get maxScroll() {
    return this.track.offsetWidth - this.viewport.offsetWidth;
  }

  scrollBy(delta) {
    this.viewport.scrollLeft = Math.max(
      0,
      Math.min(this.maxScroll, this.viewport.scrollLeft + delta)
    );
    // Chrome doesn't fire `scroll` for programmatic scrollLeft on an
    // overflow:hidden box, so sync explicitly instead of via the event.
    this.onScroll();
  }

  onScroll() {
    this.progress = this.viewport.scrollLeft / this.maxScroll;
    this.update();
    this.update();
    this.update();
  }

  onWheel(e) {
    const raw = e.deltaY || e.deltaX;
    this.scrollBy(Math.max(-WHEEL_CLAMP, Math.min(WHEEL_CLAMP, raw)));
  }

  onPointerDown(e) {
    this.pointerDown = true;
    this.lastPointerX = e.clientX;
    this.dragTravel = 0;
  }

  onPointerMove(e) {
    if (!this.pointerDown) return;
    e.preventDefault();
    this.dragTo(e.clientX);
  }

  onTouchStart(e) {
    this.lastPointerX = e.touches[0].clientX;
  }

  onTouchMove(e) {
    e.preventDefault();
    this.dragTo(e.touches[0].clientX);
  }

  dragTo(x) {
    this.dragDelta = Math.max(
      -DRAG_CLAMP,
      Math.min(DRAG_CLAMP, this.lastPointerX - x)
    );
    this.dragTravel += Math.abs(this.dragDelta);
    this.lastPointerX = x;
    this.scrollBy(this.dragDelta);
    // Don't let the drag end on a link as a click.
    this.links.forEach((a) => (a.style.pointerEvents = "none"));
  }

  onPointerUp() {
    this.pointerDown = false;
    this.lastPointerX = null;
    this.links.forEach((a) => (a.style.pointerEvents = "auto"));
    if (!this.dragDelta) return;
    // Momentum: keep applying the last delta with friction.
    const glide = () => {
      if (this.lastPointerX !== null) return; // a new drag started
      this.scrollBy(this.dragDelta);
      this.dragDelta *= FRICTION;
      if (Math.abs(this.dragDelta) > 0.5) requestAnimationFrame(glide);
    };
    glide();
  }

  /* --- the focus-line layout --------------------------------- */

  update() {
    const p = this.progress;
    const focusX = this.left + this.width * p;
    let translation = 0;

    this.slides.forEach((slide, i) => {
      gsap.set(slide, { x: translation });
      const rect = slide.getBoundingClientRect();
      // Each slide's reference point slides across its own width
      // with progress, so entry and exit line up with the edges.
      const anchor = rect.left + rect.width * p;

      if (anchor > focusX) {
        // Entering (right of the line): fan in toward the neighbour.
        const scale = Math.max(ENTER_SCALE, this.enterScale(rect, p));
        this.pinToNeighbour(slide, scale);
      } else {
        // Leaving (left of the line): shrink and free up row width.
        const scale = this.exitScale(rect, p);
        translation += this.collapse(slide, scale, this.sizes[i]);
      }
    });
  }

  /** Scale right of the line: 1 at the line, ENTER_SCALE off-edge,
      shaped with the cosine ease-in-out curve. */
  enterScale(rect, p) {
    const l = (rect.left - this.left) / this.width;
    const x = l + (rect.width * p) / this.width;
    const x1 = p; // the line, where scale is 1
    const x2 = 1 + (x - l); // past the right edge, where scale bottoms out
    const t = x1 === x2 ? 1 : 1 + ((ENTER_SCALE - 1) * (x - x1)) / (x2 - x1);
    const clamped = Math.max(ENTER_SCALE, t);
    return -(Math.cos(Math.PI * clamped) - 1) / 2;
  }

  /** Scale left of the line: 1 at the line, exactly 0 when the
      slide's right edge crosses the left inset. */
  exitScale(rect, p) {
    const r = (rect.right - this.left) / this.width;
    const x = (rect.left - this.left + rect.width * p) / this.width;
    const x1 = x - r; // right edge at the inset → scale 0
    const x2 = p; // the line → scale 1
    return x1 === x2 ? 1 : (x - x1) / (x2 - x1);
  }

  /** Entering slides scale on the wrapper, pinned to the previous slide. */
  pinToNeighbour(slide, scale) {
    const prev = slide.previousElementSibling;
    if (!prev) return;
    const dX =
      prev.getBoundingClientRect().right -
      slide.getBoundingClientRect().left +
      GAP;
    gsap.set(slide, { "--scale": 1, scale, x: dX });
  }

  /** Leaving slides scale on the item (via --scale), report freed width. */
  collapse(slide, scale, size) {
    gsap.set(slide, { "--scale": scale, scale: 1 });
    const shrunkWidth = Math.max(0, size.width * scale);
    return size.width - shrunkWidth;
  }
}

/* ------------------------------------------------------------
   PageTransitions — barba-equivalent transitions, per the derived
   spec (research/2026-07-18, "Card-click page transition").

   sliderTransition (click on a slider card, desktop):
     base 1.2s; step1 = 0.84s, step2 = 1.2s starting at 0.6s.
     Step 1: other cards exit sideways (scale-compensated, fading),
     clicked card slides to viewport center (position ease) while
     its scale normalizes to 1 (scale ease). Step 2: card shrinks
     to 0.2, current page conveys up and away, target page conveys
     up from below, body palette washes to the target's colors.

   default transition (back/forward, mobile, logo): current fades
   out 0.5s power3.out, then color wash + target fades in 0.5s
   power2.inOut; returning home the slider re-enters with the
   reverse stagger (0.5s power1.inOut, i×0.05) before input attaches.
   ------------------------------------------------------------ */

const PT_LEAVE = 0.5;
const PT_ENTER = 0.5;
const PT_SLIDER = 1.2;

const positionCurve = CustomEase.create(
  "pt-position",
  "M0,0 C0.197,0 0.418,0.559 0.525,0.763 0.602,0.911 0.699,1 1,1"
);
const scaleCurve = CustomEase.create(
  "pt-scale",
  "M0,0 C0.423,0 0.577,0.155 0.645,0.374 0.72,0.619 0.818,1.001 1,1"
);

class PageTransitions {
  constructor({ engine, header, main, viewport }) {
    this.engine = engine;
    this.header = header;
    this.main = main;
    this.viewport = viewport;
    this.busy = false;
    this.activeLayer = null;
    this.videoObserver = null;
    this.homePalette = {
      bg: getComputedStyle(document.body).getPropertyValue("--color-bg").trim(),
      color: getComputedStyle(document.body).getPropertyValue("--color-text").trim(),
    };
    this.layers = new Map();
    document.querySelectorAll(".page-layer").forEach((layer) => {
      this.layers.set(layer.dataset.url.replace(/\/$/, ""), layer);
    });
    this.bind();
  }

  layerFor(href) {
    const clean = href.split("#")[0].replace(/\/$/, "");
    return this.layers.get(clean) || null;
  }

  bind() {
    // Card clicks inside the slider → sliderTransition.
    document.querySelectorAll(".js-c-slider a[href]").forEach((a) => {
      const layer = this.layerFor(a.href);
      if (!layer) return; // external links navigate normally
      a.addEventListener("click", (e) => {
        e.preventDefault();
        if (this.busy || this.engine.dragTravel > 5) return;
        if (isSM()) this.fadeToLayer(layer); // mobile falls back to default
        else this.sliderToLayer(a, layer);
      });
    });

    // Logo returns home from a layer (always intercepted, as barba does).
    this.header.querySelector(".js-b-header__logo").addEventListener("click", (e) => {
      e.preventDefault();
      if (this.busy || !this.activeLayer) return;
      this.fadeHome(true);
    });

    window.addEventListener("popstate", () => {
      if (this.busy) return;
      const url = location.hash ? location.hash.slice(1) : null;
      const layer = url
        ? [...this.layers.values()].find((l) => l.dataset.namespace === url)
        : null;
      if (layer && !this.activeLayer) this.fadeToLayer(layer, false);
      else if (!layer && this.activeLayer) this.fadeHome(false);
    });
  }

  colorWash(tl, toPalette, duration, at) {
    tl.to(
      document.body,
      {
        "--color-bg": toPalette.bg,
        "--color-text": toPalette.color,
        backgroundColor: toPalette.bg,
        color: toPalette.color,
        duration,
        ease: "power3.inOut",
      },
      at
    );
  }

  showLayer(layer) {
    layer.classList.add("is-active");
    layer.scrollTop = 0; // a re-entered layer must open at the top
    const video = layer.querySelector("video[data-src]");
    if (video && !video.src) {
      video.src = video.dataset.src;
      video.load();
    }
    if (video) video.play().catch(() => {});
    this.observeLayerVideos(layer);
  }

  /** Content videos load and play on intersection, pause when they leave.
      The root is the layer, not the viewport, because the layer is its own
      scroll container. One observer at a time, disconnected on the way home
      so repeat visits don't accumulate them. */
  observeLayerVideos(layer) {
    this.disconnectLayerVideos();
    const videos = [...layer.querySelectorAll("video[data-video-url]")];
    if (!videos.length) return;
    this.videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) {
            target.pause();
            return;
          }
          if (!target.src) {
            target.src = target.dataset.videoUrl;
            target.load();
          }
          target.play().catch(() => {});
        });
      },
      { root: layer }
    );
    videos.forEach((v) => this.videoObserver.observe(v));
  }

  disconnectLayerVideos() {
    if (!this.videoObserver) return;
    this.videoObserver.disconnect();
    this.videoObserver = null;
  }

  beginChange() {
    this.busy = true;
    document.body.classList.add("is-changing-page");
    this.header.classList.add("is-leaving");
    this.engine.detach();
  }

  endChange(layerOrNull, pushUrl) {
    document.body.classList.remove("is-changing-page");
    this.header.classList.remove("is-leaving");
    this.activeLayer = layerOrNull;
    this.busy = false;
    if (pushUrl !== undefined) {
      history.pushState(null, "", pushUrl);
    }
  }

  /* --- the card-click transition ----------------------------- */

  sliderToLayer(trigger, layer) {
    this.beginChange();
    const clickedSlide = trigger.closest(".js-c-slider__slide");
    const item = clickedSlide.querySelector(".js-c-slider__item");
    const allItems = [...this.main.querySelectorAll(".js-c-slider__item")];
    const clickedIndex = allItems.indexOf(item);

    const step1Time = PT_SLIDER * 0.7;
    const pauseTime = PT_SLIDER * -0.2;
    const step2Time = PT_SLIDER * 1;

    // Prepare: pin page heights and bring the target in from below.
    // The layer is already fixed and full-viewport via `.page-layer.is-active`,
    // so only the conveyor's y is animated here.
    gsap.set(this.main, { height: window.innerHeight });
    this.showLayer(layer);

    const tl = gsap.timeline({
      onComplete: () => {
        this.main.style.display = "none";
        // Deliberately no `position: ""` reset — the layer stays fixed and
        // scrolls internally. Dropping it back to static would put the content
        // behind `body { overflow: hidden }` and make it unreachable.
        this.endChange(layer, "#" + layer.dataset.namespace);
      },
    });

    // Clicked slide above the others, explicit height.
    const initialScale = parseFloat(
      item.style.getPropertyValue("--initial-scale") || 1
    );
    gsap.set([item, clickedSlide], {
      zIndex: 10,
      height: item.dataset.baseHeight * initialScale,
    });

    // STEP 1 — the stage clears sideways.
    for (let i = 0; i < allItems.length; i++) {
      if (i === clickedIndex) continue;
      const other = allItems[i];
      const sign = Math.sign(i - clickedIndex);
      const visualScale = other.getBoundingClientRect().width / other.offsetWidth;
      gsap.set([other, other.closest(".js-c-slider__slide")], {
        height: other.dataset.baseHeight * initialScale,
      });
      tl.to(
        other,
        {
          autoAlpha: 0,
          x: (window.innerWidth * sign) / visualScale,
          duration: step1Time,
          ease: positionCurve,
        },
        0
      );
    }

    // Transfer an exit-side shrink from the item onto the slide.
    let scaleProp = parseFloat(getComputedStyle(item).getPropertyValue("--scale"));
    if (scaleProp && scaleProp !== 1) {
      gsap.set(item, { scale: 1 });
      gsap.set(clickedSlide, { scale: scaleProp, transformOrigin: "bottom right" });
    } else {
      scaleProp = 1;
    }

    // Center the clicked card: position rushes in, scale hangs back.
    const rect = item.getBoundingClientRect();
    const dX =
      window.innerWidth * 0.5 +
      item.offsetWidth * (1 - scaleProp) -
      rect.left -
      item.offsetWidth * 0.5;
    tl.to(item, { x: dX, duration: step1Time, ease: positionCurve }, 0);
    tl.to(
      item,
      { transformOrigin: "bottom 50%", scale: 1, duration: step1Time, ease: scaleCurve },
      0
    );
    tl.to(clickedSlide, { scale: 1, duration: step1Time, ease: scaleCurve }, 0);

    // STEP 2 — the upward conveyor.
    const step2At = step1Time + pauseTime;
    tl.to(item, { scale: 0.2, duration: step2Time, ease: "power3.inOut" }, step2At);
    tl.to(
      this.main,
      { y: -window.innerHeight, duration: step2Time, ease: "power3.inOut" },
      step2At
    );
    tl.fromTo(
      layer,
      { y: window.innerHeight, transformOrigin: "top center" },
      { y: 0, duration: step2Time, ease: "power3.inOut" },
      step2At
    );
    this.colorWash(
      tl,
      { bg: layer.dataset.bgColor, color: layer.dataset.color },
      pauseTime + step2Time,
      step2At
    );
    return tl;
  }

  /* --- default transition into a layer (popstate / mobile) ---- */

  fadeToLayer(layer, push = true) {
    this.beginChange();
    const tl = gsap.timeline({
      onComplete: () => {
        this.main.style.display = "none";
        this.endChange(layer, push ? "#" + layer.dataset.namespace : undefined);
      },
    });
    tl.fromTo(
      this.main,
      { autoAlpha: 1 },
      { autoAlpha: 0, duration: PT_LEAVE, ease: "power3.out" },
      0
    );
    tl.add(() => this.showLayer(layer), PT_LEAVE);
    this.colorWash(
      tl,
      { bg: layer.dataset.bgColor, color: layer.dataset.color },
      PT_ENTER,
      PT_LEAVE
    );
    tl.fromTo(
      layer,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: PT_ENTER, ease: "power2.inOut" },
      PT_LEAVE
    );
    return tl;
  }

  /* --- default transition home + slider stagger re-entry ------ */

  fadeHome(push = true) {
    this.beginChange();
    const layer = this.activeLayer;
    const engine = this.engine;
    const viewport = this.viewport;
    const main = this.main;

    const tl = gsap.timeline();

    // Leave: fade the layer out.
    tl.fromTo(
      layer,
      { autoAlpha: 1 },
      {
        autoAlpha: 0,
        duration: PT_LEAVE,
        ease: "power3.out",
        onComplete: () => {
          layer.classList.remove("is-active");
          gsap.set(layer, { clearProps: "all" });
          layer.scrollTop = 0;
          this.disconnectLayerVideos();
          layer.querySelectorAll("video").forEach((v) => v.pause());
        },
      },
      0
    );

    // Enter: home container returns (slider hidden until it staggers in).
    tl.add(() => {
      main.style.display = "";
      viewport.classList.remove("is-ready");
      gsap.set(main, { clearProps: "height,y" });
      // Rebuild the resting composition at progress 0.
      engine.slides.forEach((slide) => {
        const item = slide.querySelector(".js-c-slider__item");
        gsap.set(slide, { clearProps: "x,y,scale,opacity,visibility,zIndex,height" });
        gsap.set(item, {
          clearProps: "x,y,scale,opacity,visibility,zIndex,height,transformOrigin",
        });
        slide.style.setProperty("--scale", "1");
      });
      sizerRef.apply();
      engine.measure();
      engine.layout();
    }, PT_LEAVE);
    this.colorWash(tl, this.homePalette, PT_ENTER, PT_LEAVE);
    tl.fromTo(
      main,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: PT_ENTER, ease: "power2.inOut" },
      PT_LEAVE
    );

    // Slider re-entry: reverse stagger, input attaches after.
    tl.add(() => {
      viewport.classList.add("is-ready");
      const stagger = gsap.timeline({
        onComplete: () => {
          engine.attach();
          this.endChange(null, push ? location.pathname : undefined);
        },
      });
      engine.slides.forEach((slide, i) => {
        const currentScale = slide.style.getPropertyValue("--scale");
        stagger.fromTo(
          slide,
          { "--scale": 0, xPercent: -50 },
          {
            xPercent: 0,
            "--scale": currentScale,
            delay: i * 0.05,
            duration: 0.5,
            ease: "power1.inOut",
          },
          0
        );
      });
    }, PT_LEAVE + PT_ENTER);
    return tl;
  }
}

let sizerRef = null;

/* ------------------------------------------------------------
   Intro choreography (first visit, home):
   1. loader over everything until all images have loaded, then
      removed with duration 0 (home behavior);
   2. logo pre-scaled to span the viewport, shrinks into the
      corner: 1s, delay 0.2, custom ease (position rushes in,
      lands soft) — mobile variant centers vertically instead;
   3. menu fades in 0.7s power3.inOut, delay 0.5 (desktop only);
   4. slider flies in from the right: x = innerWidth, scale 0.5
      → 0/1, 0.7s power1.out, delay 0.5; input attaches after.
   ------------------------------------------------------------ */

const logoEase = CustomEase.create("logo", "M0,0 C0.83,0 0.17,1 1,1");

function prepareHeaderIntro(header) {
  const logo = header.querySelector(".js-b-header__logo");
  const rect = logo.getBoundingClientRect();
  const fullWidth = window.innerWidth - 2 * rect.x;
  const scale = fullWidth / logo.offsetWidth;
  let y = 0;
  let yPercent = 0;
  if (isMenuBreakpoint()) {
    y = window.innerHeight / 2 - rect.top;
    yPercent = -50 * scale;
  }
  gsap.set(logo, { scale, y, yPercent, transformOrigin: "top left" });
  if (!isMenuBreakpoint()) {
    gsap.set(header.querySelector(".js-b-header__menu"), { opacity: 0 });
  }
}

function animateHeaderIntro(header) {
  const logo = header.querySelector(".js-b-header__logo");
  gsap.to(logo, {
    scale: 1,
    y: 0,
    yPercent: 0,
    duration: 1,
    delay: isMenuBreakpoint() ? 0 : 0.2,
    ease: isMenuBreakpoint() ? "power3.inOut" : logoEase,
    force3D: false, // keeps the wordmark sharp in Safari
  });
  if (!isMenuBreakpoint()) {
    gsap.to(header.querySelector(".js-b-header__menu"), {
      opacity: 1,
      duration: 0.7,
      delay: 0.5,
      ease: "power3.inOut",
    });
  }
}

/* Scoped to the home container on purpose: the intro waits on these, and
   page-layer images must never be able to hold the first paint hostage. */
function loadAllImages(scope) {
  const images = [...scope.querySelectorAll("img[src]")];
  if (!images.length) return Promise.resolve();
  return Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          const probe = new Image();
          probe.src = image.src;
          probe.onload = resolve;
          probe.onerror = resolve; // a missing image must not block the intro
        })
    )
  );
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".js-b-header");
  const loader = document.querySelector(".js-b-loader");
  const viewport = document.querySelector(".js-c-slider__slider");
  const track = document.querySelector(".js-c-slider__container");
  const items = [...document.querySelectorAll(".js-c-slider__item")];

  // Menu toggle (mobile)
  const toggle = header.querySelector(".js-toggle-menu");
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("is-menu-open");
  });

  // Clocks
  document.querySelectorAll(".js-a-clock").forEach((node) => new Clock(node));

  const sizer = new SlideSizer(items);
  sizerRef = sizer;
  const engine = new SliderEngine({ viewport, track });
  const main = document.querySelector("main");
  new PageTransitions({ engine, header, main, viewport });

  const start = () => {
    // Size + freeze text at authored canvas size, then scale down.
    sizer.captureBaseHeights();
    freezeLineBreaks(track);
    sizer.apply();
    engine.measure();
    engine.layout();

    prepareHeaderIntro(header);

    // Home loader-out is instant (duration 0 on the origin).
    loader.remove();

    // Slider fly-in from the right.
    gsap.set(viewport, { x: window.innerWidth, scale: 0.5 });
    viewport.classList.add("is-ready");
    gsap.to(viewport, {
      duration: 0.7,
      x: 0,
      scale: 1,
      ease: "power1.out",
      delay: 0.5,
      onComplete: () => engine.attach(),
    });

    animateHeaderIntro(header);

    // Play the home slider's autoplay videos (some browsers defer until told).
    // Layer videos are deliberately excluded — they load on intersection.
    main.querySelectorAll("video[autoplay]").forEach((vid) => {
      const p = vid.play();
      if (p !== undefined) p.catch(() => {});
    });
  };

  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([fontsReady, loadAllImages(main)]).then(start);

  // Resize: re-derive sizes and re-run the layout at current progress.
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      sizer.apply();
      engine.measure();
      const rect = viewport.getBoundingClientRect();
      engine.left = rect.left + LEFT_INSET;
      engine.width = rect.width;
      engine.onScroll();
    }, 132);
  });
});
