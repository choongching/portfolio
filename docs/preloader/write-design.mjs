// Writes the preloader settings back into preloader-design.js, keeping the file's header comment.
// Shared by the motion editor's server (serve.mjs) and the site tuner (vite.site.config.ts, dev only).
import { readFile, writeFile } from "node:fs/promises";

export function checkDesign(D) {
  return !!D && typeof D.look === "object" && Array.isArray(D.keys) && D.keys.length > 0;
}

export async function writeDesign(file, D) {
  const old = await readFile(file, "utf8");
  const head = old.slice(0, old.indexOf("window.PRELOADER_DESIGN"));
  const one = (o) => JSON.stringify(o).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/^\{/, "{ ").replace(/\}$/, " }");
  await writeFile(file, `${head}window.PRELOADER_DESIGN = {\n  "look": ${one(D.look)},\n` +
    `${D.exit ? `  "exit": ${one(D.exit)},\n` : ""}${D.site ? `  "site": ${one(D.site)},\n` : ""}` +
    `  "keys": [\n${D.keys.map((k) => `    ${one(k)}`).join(",\n")}\n  ]\n};\n`);
}
