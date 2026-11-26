/* The home intro's motion and the cards' look: what plays after the opening (the logo flies into the
   header, the menu fades in, the cards come in, the intro card's lines rise) and how the cards look.
   Times in seconds, eases are GSAP names (the logo's is a cubic-bezier). Edited by the motion studio
   (pnpm studio, http://localhost:8080/__studio/), whose Save rewrites this file, site-design.css and
   the page colour in index.html. The intro card's sizes are at the desktop design canvas (the
   cards are scaled to the window) and in real pixels on phones. The preloader and the opening have their own settings
   (preloader/preloader-design.js, opening.js). */
export const SITE_DESIGN = {
  "logo": { "duration": 1, "delay": 0.2, "bezier": [0.83, 0, 0.17, 1], "phoneDuration": 1, "phoneDelay": 0, "phoneEase": "power3.inOut" },
  "menu": { "duration": 0.7, "delay": 0.5, "ease": "power3.inOut" },
  "cards": { "duration": 0.7, "delay": 0.5, "fromX": 100, "fromScale": 0.5, "ease": "power1.out" },
  "cardsPhone": { "duration": 1, "fromY": 75, "ease": "power3.inOut" },
  "lines": { "duration": 1.1, "stagger": 0.1, "delay": 1, "phoneDelay": 0.6, "ease": "power4.out" },
  "intro": { "size": 72, "leading": 1.2, "padTop": 30, "padRight": 75, "padBottom": 30, "padLeft": 30, "gap": 210, "width": 1463, "goSize": 41, "goArrow": 22, "goLine": 1.5, "goRight": 32, "goBottom": 32, "goNudge": 4, "sizePhone": 29, "leadingPhone": 1.29, "padTopPhone": 21, "padRightPhone": 28, "padBottomPhone": 20, "padLeftPhone": 28, "gapPhone": 40, "goSizePhone": 38, "goArrowPhone": 22, "goLinePhone": 1.5, "goRightPhone": 32, "goBottomPhone": 32 },
  "look": { "bg": "#f2f2f2", "surface": "#ffffff", "ink": "#141414", "radius": 16, "radiusPhone": 8, "logoSize": 19, "logoSizePhone": 28, "cardGap": 20, "cardGapPhone": 20, "borderWidth": 0, "borderColor": "#141414", "shadowX": 0, "shadowY": 0, "shadowBlur": 0, "shadowSpread": 0, "shadowColor": "#000000", "shadowOpacity": 0 }
};
