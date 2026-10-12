/* Site entry: one module, so Vite minifies and fingerprints the scripts
   (year-long cache under /assets/). Imports run in this order, as the
   seven deferred script tags did: GSAP first, then the live cards, the
   page engine and the resume overlay. */
import "./gsap-globals.js";
import "./lissajous-c.js";
import "./pipeline-bottleneck.js";
import "./linkedin-spiral.js";
import "./main.js";
import "./resume-overlay.js";
