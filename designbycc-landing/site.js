/* Site entry: one module, so Vite minifies and fingerprints the scripts
   (year-long cache under /assets/). Imports run in this order, as the
   six deferred script tags did: GSAP first, then the live cards (the case studies folder too), the
   opening, the logo eyes, the page engine and the resume overlay. */
import "./gsap-globals.js";
import "./pipeline-bottleneck.js";
import "./linkedin-spiral.js";
import "./case-folder.js";
import "./opening.js";
import "./logo-eyes.js";
import "./main.js";
import "./resume-overlay.js";

// The logo tuner (localhost:8080/?tune): dev only, never in the build.
if (import.meta.env.DEV && new URLSearchParams(location.search).has("tune")) {
  import("./preloader-tuner.js").then((m) => m.startTuner()).catch((err) => console.error("[tuner]", err));
}
