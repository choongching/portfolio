// node docs/preloader/serve.mjs: serves the repo locally (no cache) and opens the preloader motion editor.
// POST /save-preloader writes designbycc-landing/preloader/preloader-design.js (the site loads it from there). Listens on 127.0.0.1 only. No dependencies.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { checkDesign, writeDesign } from "./write-design.mjs";
import { exec } from "node:child_process";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PORT = +(process.env.PORT || 5179);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml" };
const send = (res, code, body, type = "application/json") => { res.writeHead(code, { "content-type": type, "cache-control": "no-store" }); res.end(body); };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === "POST" && url.pathname === "/save-preloader") {
    let body = ""; for await (const c of req) body += c;
    let D; try { D = JSON.parse(body); } catch { return send(res, 400, JSON.stringify({ error: "not JSON" })); }
    if (!checkDesign(D)) return send(res, 400, JSON.stringify({ error: "unexpected settings shape" }));
    await writeDesign(join(ROOT, "designbycc-landing/preloader/preloader-design.js"), D);
    console.log(`saved preloader-design.js (${D.keys.length} keyframes)`);
    return send(res, 200, JSON.stringify({ ok: true }));
  }
  const path = normalize(join(ROOT, decodeURIComponent(url.pathname)));
  if (!path.startsWith(ROOT)) return send(res, 403, "forbidden", "text/plain");
  try { const s = await stat(path); if (!s.isFile()) throw 0; send(res, 200, await readFile(path), TYPES[extname(path)] || "application/octet-stream"); }
  catch { send(res, 404, "not found", "text/plain"); }
}).listen(PORT, "127.0.0.1", () => {
  const u = `http://127.0.0.1:${PORT}/docs/preloader/editor.html`;
  console.log(`Preloader motion editor: ${u}  (Ctrl+C to stop)`);
  if (!process.env.NO_OPEN) exec(`open "${u}"`);
});
