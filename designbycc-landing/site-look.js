/* The site's look (SITE_DESIGN.look and .intro in site-design.js) as CSS custom properties. Shared by
   the motion studio (live preview and Save, which writes site-design.css from it) and by main.js (the
   studio's unsaved draft, dev only). The page colour, --color-bg, is set on <body> instead (index.html).
   Desktop values are at the design canvas size (cards are scaled to the window); phone values are
   real pixels. */
const hex = (c, a) => {
  const n = parseInt(c.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${+a.toFixed(3)})`;
};
const px = (v) => `${+(+v).toFixed(3)}px`;

// The variables that differ between phones (up to 730px) and desktop.
function sized(D, phone) {
  const L = D.look, I = D.intro, p = phone ? "Phone" : "";
  return {
    "--border-radius": px(L[`radius${p}`]),
    "--logo-size": px(L[`logoSize${p}`]),
    "--card-gap": px(L[`cardGap${p}`]),
    "--intro-size": px(I[`size${p}`]),
    "--intro-leading": String(+(+I[`leading${p}`]).toFixed(6)),
    "--intro-pad": [I[`padTop${p}`], I[`padRight${p}`], I[`padBottom${p}`], I[`padLeft${p}`]].map(px).join(" "),
    "--intro-gap": px(I[`gap${p}`]),
    "--intro-go-size": px(I[`goSize${p}`]),
    "--intro-go-arrow": px(I[`goArrow${p}`]),
    "--intro-go-line": px(I[`goLine${p}`]),
    "--intro-go-right": px(I[`goRight${p}`]),
    "--intro-go-bottom": px(I[`goBottom${p}`]),
    ...(phone ? {} : { "--intro-width": px(I.width) }),
  };
}

export function lookVars(D, phone) {
  const L = D.look;
  const shadow = L.shadowOpacity > 0 && (L.shadowBlur || L.shadowSpread || L.shadowX || L.shadowY)
    ? `${L.shadowX}px ${L.shadowY}px ${L.shadowBlur}px ${L.shadowSpread}px ${hex(L.shadowColor, L.shadowOpacity)}`
    : "none";
  return {
    "--color-surface": L.surface,
    "--color-ink": L.ink,
    "--card-border": `${L.borderWidth}px`,
    "--card-border-color": L.borderColor,
    "--card-shadow": shadow,
    "--intro-go-nudge": px(D.intro.goNudge),
    ...sized(D, phone),
  };
}

// site-design.css: phones first, then what changes on desktop, as in styles.css.
export function lookCss(D) {
  const decl = (o, pad) => Object.entries(o).map(([k, v]) => `${pad}${k}: ${v};`).join("\n");
  return `/* Written by the motion studio (pnpm studio) from SITE_DESIGN in site-design.js: edit it there.
   Loaded after styles.css, so these win. */\n:root {\n${decl(lookVars(D, true), "  ")}\n}\n` +
    `@media (min-width: 731px) {\n  :root {\n${decl(sized(D, false), "    ")}\n  }\n}\n`;
}
