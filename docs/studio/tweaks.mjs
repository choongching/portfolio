// Per-object tweaks from the studio's Page tab: { selector: { prop: value } }, phones only.
// Shared by the studio (live preview) and the dev server's Save, which writes
// designbycc-landing/site-tweaks.json (the source) and site-tweaks.css (what the site loads).

// What can be tweaked, and how a number becomes CSS.
export const PROPS = {
  "font-size": "px", "font-weight": "", "line-height": "", "letter-spacing": "px", color: "color",
  "background-color": "color", "border-radius": "px", "padding-top": "px", "padding-right": "px",
  "padding-bottom": "px", "padding-left": "px", gap: "px", opacity: "",
};
const SEL = /^[\w\s.-]+$/;   // class and tag selectors, descendant combinator
const HEX = /^#[0-9a-f]{6}$/i;

export function checkTweaks(T) {
  if (!T || typeof T !== "object" || Array.isArray(T)) return "not an object";
  for (const [sel, props] of Object.entries(T)) {
    if (!SEL.test(sel) || sel.length > 200) return `selector ${sel}`;
    if (!props || typeof props !== "object") return `props for ${sel}`;
    for (const [p, v] of Object.entries(props)) {
      if (!(p in PROPS)) return `property ${p}`;
      if (PROPS[p] === "color" ? !HEX.test(v) : !Number.isFinite(v)) return `${sel} ${p}`;
    }
  }
  return null;
}

const value = (p, v) => (PROPS[p] === "px" ? `${+v.toFixed(3)}px` : String(v));

export function tweaksCss(T) {
  const rules = Object.entries(T || {}).filter(([, props]) => Object.keys(props).length)
    .map(([sel, props]) => `  ${sel} {\n${Object.entries(props).map(([p, v]) => `    ${p}: ${value(p, v)};`).join("\n")}\n  }`);
  return `/* Written by the studio's Page tab (pnpm studio) from site-tweaks.json: edit it there. Phones only.
   Loaded after site-design.css, so these win. */\n` + (rules.length ? `@media (max-width: 730px) {\n${rules.join("\n")}\n}\n` : "");
}
