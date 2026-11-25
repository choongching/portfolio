/* The page preloader's motion settings: two block "C"s (the link-preview design) filling the window.
   Sizes are % of the window's shorter side (vmin) unless noted; keyframe values are %.
   Edited by docs/preloader/editor.html, whose Save rewrites this file. */
window.PRELOADER_DESIGN = {
  "look": { "bg": "#f2f2f2", "c1": "#e4e4e1", "c2": "#e4e4e1", "slit": "#f2f2f2", "margin": 2.2, "gap": 0.8, "radius": 4.5, "thickness": 5.4, "speed": 1 },
  "exit": { "settleDur": 700, "settleEase": "spring", "settleBounce": 0.1, "settle": 50, "pause": 250, "dur": 1400, "ease": "smooth", "bounce": 0, "logoFirst": "designby", "logoSecond": "cc", "logoSize": 9, "logoWeight": 500, "logoWeight2": 800, "logoTracking": 0, "logoColor": "#141414", "logoScale": 19, "logoGrow": 70, "hold": 900, "fadeOut": 600, "minShow": 1550 },
  "site": { "size": 39, "sizePhone": 74, "maxHeight": 32, "x": 0, "y": 0, "doodleHold": 0.35 },
  "keys": [
    { "name": "Left stretches", "share": 74, "h1": 100, "h2": 100, "y1": 50, "y2": 50, "from1": 16, "from2": 44, "dur": 1100, "ease": "spring", "bounce": 0.12, "hold": 500 },
    { "name": "Right stretches", "share": 26, "h1": 100, "h2": 100, "y1": 50, "y2": 50, "from1": 44, "from2": 16, "dur": 1100, "ease": "spring", "bounce": 0.12, "hold": 500 }
  ]
};
