// The Drawer and Folder panels' "Save as defaults" (CC, 2026-11-28: tune in the studio, click Save, no need to
// tell Claude what changed). Rewrites only the changed values inside the tab's *_DEFAULTS literal, in
// place, so the file's comments and layout stay. Used by the dev server (vite.site.config.ts,
// POST /__studio/save-defaults).
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// which file and which object each tab saves into
export const DEFAULTS_FILES = {
  drawer: { file: "docs/studio/drawer.js", name: "DRAWER_DEFAULTS" },
  folder: { file: "designbycc-landing/case-folder.js", name: "FOLDER_DEFAULTS" },
};

const LITERAL = /("(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:e-?\d+)?|-?\.\d+|true|false)/;
const SAFE_STRING = /^[#\w.(), %-]*$/;   // a colour, a GSAP ease, a keyword

// changes: { key: value }. Each key must appear once as `key: <literal>` (outside a comment) in the
// object, and keep its type. Returns { saved, skipped: [[key, why]] }.
export async function saveDefaults(root, tab, changes) {
  const target = DEFAULTS_FILES[tab];
  if (!target) throw new Error(`no defaults for "${tab}"`);
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) throw new Error("changes must be an object");
  const path = join(root, target.file);
  let src = await readFile(path, "utf8");
  const start = src.indexOf(`export const ${target.name} = {`);
  if (start < 0) throw new Error(`${target.name} not found in ${target.file}`);
  const end = src.indexOf("\n};", start);
  let block = src.slice(start, end);
  const saved = [], skipped = [];
  for (const [key, value] of Object.entries(changes)) {
    if (!/^\w+$/.test(key)) { skipped.push([key, "bad name"]); continue; }
    const re = new RegExp(`\\b${key}: ${LITERAL.source}`, "g");
    // only matches outside comments
    const hits = [...block.matchAll(re)].filter((m) => !block.slice(block.lastIndexOf("\n", m.index) + 1, m.index).includes("//"));
    if (hits.length !== 1) { skipped.push([key, hits.length ? "found twice" : "not a plain value in the defaults"]); continue; }
    const old = JSON.parse(hits[0][1].startsWith(".") || hits[0][1].startsWith("-.") ? hits[0][1].replace(".", "0.") : hits[0][1]);
    let lit;
    if (typeof old === "number" && typeof value === "number" && Number.isFinite(value)) lit = String(+value.toFixed(4));
    else if (typeof old === "boolean" && typeof value === "boolean") lit = String(value);
    else if (typeof old === "string" && typeof value === "string" && SAFE_STRING.test(value)) lit = JSON.stringify(value);
    else { skipped.push([key, `expected a ${typeof old}`]); continue; }
    const m = hits[0];
    block = block.slice(0, m.index) + `${key}: ${lit}` + block.slice(m.index + m[0].length);
    saved.push(key);
  }
  if (saved.length) { src = src.slice(0, start) + block + src.slice(end); await writeFile(path, src); }
  return { file: target.file, saved, skipped };
}
