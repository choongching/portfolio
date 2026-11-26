// The motion studio's Save: writes SITE_DESIGN back into designbycc-landing/site-design.js (keeping
// its header comment), regenerates site-design.css from the look, and sets the page colour on
// index.html's <body>. Used by the dev server (vite.site.config.ts, /__studio/save).
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { lookCss } from "../../designbycc-landing/site-look.js";

const HEX = /^#[0-9a-f]{6}$/i;

// Same groups and keys as the saved file, each value the same type (colours as #rrggbb).
export function checkSiteDesign(D, saved) {
  if (!D || typeof D !== "object") return "not an object";
  for (const [g, keys] of Object.entries(saved)) {
    if (!D[g] || typeof D[g] !== "object") return `missing ${g}`;
    for (const [k, v] of Object.entries(keys)) {
      const n = D[g][k];
      if (Array.isArray(v)) { if (!Array.isArray(n) || n.length !== v.length || !n.every(Number.isFinite)) return `${g}.${k}`; }
      else if (typeof v === "number") { if (!Number.isFinite(n)) return `${g}.${k}`; }
      else if (typeof n !== "string" || !(HEX.test(v) ? HEX.test(n) : /^[\w.(), -]+$/.test(n))) return `${g}.${k}`;   // a colour, or a GSAP ease name
    }
  }
  return null;
}

export async function writeSiteDesign(landing, D) {
  const file = join(landing, "site-design.js");
  const old = await readFile(file, "utf8");
  const head = old.slice(0, old.indexOf("export const SITE_DESIGN"));
  const one = (o) => JSON.stringify(o).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/,(?=\d|-)/g, ", ").replace(/^\{/, "{ ").replace(/\}$/, " }");
  const groups = Object.entries(D).map(([g, o]) => `  "${g}": ${one(o)}`).join(",\n");
  await writeFile(file, `${head}export const SITE_DESIGN = {\n${groups}\n};\n`);
  await writeFile(join(landing, "site-design.css"), lookCss(D));
  const html = join(landing, "index.html");
  const page = await readFile(html, "utf8");
  const next = page.replace(/(<body class="home" style="[^"]*--color-bg: )#[0-9a-fA-F]{6}/, `$1${D.look.bg}`);
  if (next === page && !page.includes(`--color-bg: ${D.look.bg}`)) throw new Error("couldn't find the page colour on index.html's <body>");
  if (next !== page) await writeFile(html, next);
}
