// pnpm og:edit: serves the repo locally (no cache) and opens the thumbnail editor.
// POST /save writes docs/og/og-design.js and re-renders public/og-home.png.
// Listens on 127.0.0.1 only. No dependencies.
import { createServer } from "node:http";
import { readFile, writeFile, stat } from "node:fs/promises";
import { execFile, exec } from "node:child_process";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PORT = +(process.env.PORT || 5178);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
const PARTS = ["canvas", "line", "c1", "c2", "slit1", "slit2", "text", "mark"];

const send = (res, code, body, type = "application/json") => { res.writeHead(code, { "content-type": type, "cache-control": "no-store" }); res.end(body); };
createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === "POST" && url.pathname === "/save") {
    let body = ""; for await (const c of req) body += c;
    let D; try { D = JSON.parse(body); } catch { return send(res, 400, JSON.stringify({ error: "not JSON" })); }
    if (!D || PARTS.some((p) => typeof D[p] !== "object")) return send(res, 400, JSON.stringify({ error: "unexpected settings shape" }));
    const file = join(ROOT, "docs/og/og-design.js"), old = await readFile(file, "utf8");
    const head = old.slice(0, old.indexOf("window.OG_DESIGN"));
    const lines = PARTS.map((p) => `  ${JSON.stringify(p)}: ${JSON.stringify(D[p]).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/^\{/, "{ ").replace(/\}$/, " }")}`);
    await writeFile(file, `${head}window.OG_DESIGN = {\n${lines.join(",\n")}\n};\n`);
    execFile("sh", [join(ROOT, "docs/og/build.sh")], { cwd: ROOT }, (err, out, errOut) => {
      if (err) return send(res, 500, JSON.stringify({ error: (errOut || err.message).slice(0, 300) }));
      console.log(`saved og-design.js · ${out.trim().replace(/\n/g, " · ")}`);
      send(res, 200, JSON.stringify({ ok: true }));
    });
    return;
  }
  const path = normalize(join(ROOT, decodeURIComponent(url.pathname)));
  if (!path.startsWith(ROOT)) return send(res, 403, "forbidden", "text/plain");
  try {
    const s = await stat(path); if (!s.isFile()) throw 0;
    send(res, 200, await readFile(path), TYPES[extname(path)] || "application/octet-stream");
  } catch { send(res, 404, "not found", "text/plain"); }
}).listen(PORT, "127.0.0.1", () => {
  const u = `http://127.0.0.1:${PORT}/docs/og/editor.html`;
  console.log(`Thumbnail editor: ${u}  (Ctrl+C to stop)`);
  if (!process.env.NO_OPEN) exec(`open "${u}"`);
});
