import { defineConfig, transformWithEsbuild, type Plugin } from "vite";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { checkDesign, writeDesign } from "./docs/preloader/write-design.mjs";
import { checkSiteDesign, writeSiteDesign } from "./docs/studio/write-site-design.mjs";
import { checkTweaks, tweaksCss } from "./docs/studio/tweaks.mjs";
import { saveDefaults } from "./docs/studio/write-defaults.mjs";

/* The site: the slider landing (designbycc-landing/) built for designby.cc.
   public/ is copied to the site root as-is (favicon, resume, media, robots,
   sitemap, llms.txt, _headers, _redirects). Scratch files in the landing
   folder (_*.html, _penang/) are never built: only the inputs below ship. */

const SITE = "https://www.designby.cc";
const ROOT = path.resolve(__dirname, "designbycc-landing");
const OUT = path.resolve(__dirname, "dist");

// Pages with their own address. Each gets a copy of the homepage HTML with
// its own canonical URL; main.js opens the page from location.pathname.
const PAGES = ["about", "penang"];

function pageCopies(): Plugin {
  return {
    name: "page-copies",
    apply: "build",
    closeBundle() {
      const html = readFileSync(path.join(OUT, "index.html"), "utf8");
      for (const page of PAGES) {
        const url = `${SITE}/${page}/`;
        const out = html
          .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
          .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`);
        if (html.includes('rel="canonical"') && out === html) {
          throw new Error(`[page-copies] couldn't rewrite the canonical URL for /${page}/`);
        }
        mkdirSync(path.join(OUT, page), { recursive: true });
        writeFileSync(path.join(OUT, page, "index.html"), out);
      }
    },
  };
}

// Source comments are working notes; the shipped HTML leaves them out, as
// minified CSS and JS already do.
function stripHtmlComments(): Plugin {
  return {
    name: "strip-html-comments",
    apply: "build",
    transformIndexHtml: { order: "post", handler: (html) => html.replace(/\s*<!--[\s\S]*?-->/g, "") },
  };
}

// Local dev/preview answer the way Cloudflare Pages does: /resume serves
// resume.html, and /about/ and /penang/ serve the homepage HTML.
function pagesRouting(): Plugin {
  const rewrite = (req: { url?: string }) => {
    const [p, q = ""] = (req.url || "/").split("?");
    if (p === "/resume") req.url = "/resume.html" + (q && "?" + q);
    else if (PAGES.some((page) => p === `/${page}` || p === `/${page}/`)) req.url = "/" + (q && "?" + q);
  };
  return {
    name: "pages-routing",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => { rewrite(req); next(); });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => { rewrite(req); next(); });
    },
  };
}

// The preloader is three plain scripts in designbycc-landing/preloader/ (the motion editor and the
// logo tuner edit them in place), loaded by index.html ahead of the site bundle so it shows while the
// bundle downloads. Dev serves them as they are; the build joins them in that order, minifies them into
// one fingerprinted /assets/preloader-<hash>.js (a year's cache, like the rest of /assets) and swaps
// the three tags for one.
const PRELOADER = ["preloader-design.js", "preloader.js", "site-preloader.js"];
function preloaderBundle(): Plugin {
  const MARK = "<template data-preloader-bundle></template>";   // pre → post: Vite warns on classic <script> tags it can't resolve
  return {
    name: "preloader-bundle",
    apply: "build",
    transformIndexHtml: {
      order: "pre",
      async handler(html, ctx) {
        const tags = PRELOADER.map((f) => `<script defer src="/preloader/${f}"></script>`);
        if (!tags.every((t) => html.includes(t))) {
          if (ctx.filename.endsWith("index.html")) throw new Error("[preloader-bundle] index.html no longer loads the three preloader scripts");
          return html;
        }
        const src = PRELOADER.map((f) => readFileSync(path.join(ROOT, "preloader", f), "utf8")).join("\n;\n");
        const { code } = await transformWithEsbuild(src, "preloader.js", { minify: true, loader: "js", target: "es2020" });
        preloaderOut = { file: `assets/preloader-${createHash("sha256").update(code).digest("hex").slice(0, 8)}.js`, code };
        return tags.reduce((h, t, i) => h.replace(t, i === 0 ? MARK : ""), html);
      },
    },
    generateBundle() {   // runs before the post HTML hook below
      if (preloaderOut) this.emitFile({ type: "asset", fileName: preloaderOut.file, source: preloaderOut.code });
    },
  };
}
function preloaderBundleTag(): Plugin {
  return {
    name: "preloader-bundle-tag",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler: (html) => (preloaderOut ? html.replace("<template data-preloader-bundle></template>", `<script defer src="/${preloaderOut.file}"></script>`) : html),
    },
  };
}
let preloaderOut: { file: string; code: string } | null = null;

// Dev only: the logo tuner on the real page (localhost:8080/?tune, designbycc-landing/preloader-tuner.js)
// saves the preloader settings, designbycc-landing/preloader/preloader-design.js, through this endpoint.
function preloaderTunerSave(): Plugin {
  return {
    name: "preloader-tuner-save",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__preloader/save", async (req, res) => {
        const out = (code: number, body: object) => { res.statusCode = code; res.setHeader("content-type", "application/json"); res.end(JSON.stringify(body)); };
        if (req.method !== "POST") return out(405, { error: "POST only" });
        let body = ""; for await (const c of req) body += c;
        let D; try { D = JSON.parse(body); } catch { return out(400, { error: "not JSON" }); }
        if (!checkDesign(D)) return out(400, { error: "unexpected settings shape" });
        await writeDesign(path.resolve(__dirname, "designbycc-landing/preloader/preloader-design.js"), D);
        server.config.logger.info("saved designbycc-landing/preloader/preloader-design.js (logo tuner)");
        out(200, { ok: true });
      });
    },
  };
}

// Dev only: the motion studio (pnpm studio, localhost:8080/__studio/), a design canvas that plays
// the home intro in a desktop and a phone frame (the site with ?studio) and tweaks its motion and the
// cards' look. GET / is the studio (docs/studio/index.html), GET /design the saved settings, POST
// /save writes site-design.js, site-design.css and the page colour (docs/studio/write-site-design.mjs),
// plus the Page tab's per-object tweaks: site-tweaks.json and site-tweaks.css (docs/studio/tweaks.mjs).
function motionStudio(): Plugin {
  const dir = path.resolve(__dirname, "docs/studio");
  const tweaks = () => JSON.parse(readFileSync(path.join(ROOT, "site-tweaks.json"), "utf8"));
  const saved = () => {
    const src = readFileSync(path.join(ROOT, "site-design.js"), "utf8");
    return JSON.parse(src.slice(src.indexOf("{", src.indexOf("export const SITE_DESIGN")), src.lastIndexOf("}") + 1));
  };
  return {
    name: "motion-studio",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__studio", async (req, res) => {
        const out = (code: number, body: string, type = "application/json") => { res.statusCode = code; res.setHeader("content-type", type); res.setHeader("cache-control", "no-store"); res.end(body); };
        const url = (req.url || "/").split("?")[0];
        if (req.method === "GET" && url === "/") return out(200, readFileSync(path.join(dir, "index.html"), "utf8").replace("%STUDIO%", `/@fs${dir}`), "text/html; charset=utf-8");
        if (req.method === "GET" && url === "/design") return out(200, JSON.stringify({ ...saved(), tweaks: tweaks() }));
        if (req.method === "POST" && url === "/save") {
          let body = ""; for await (const c of req) body += c;
          let D; try { D = JSON.parse(body); } catch { return out(400, JSON.stringify({ error: "not JSON" })); }
          const { tweaks: T = {}, ...design } = D;
          const bad = checkSiteDesign(design, saved()) || (checkTweaks(T) && `tweaks: ${checkTweaks(T)}`);
          if (bad) return out(400, JSON.stringify({ error: `unexpected settings: ${bad}` }));
          try {
            await writeSiteDesign(ROOT, design);
            writeFileSync(path.join(ROOT, "site-tweaks.json"), JSON.stringify(T, null, 2) + "\n");
            writeFileSync(path.join(ROOT, "site-tweaks.css"), tweaksCss(T));
          } catch (err) { return out(500, JSON.stringify({ error: String(err.message || err) })); }
          server.config.logger.info("saved site-design.js and site-design.css (motion studio)");
          return out(200, JSON.stringify({ ok: true }));
        }
        // the Drawer and Folder panels' "Save as defaults": the changed values into the tab's *_DEFAULTS
        // (docs/studio/write-defaults.mjs)
        if (req.method === "POST" && url === "/save-defaults") {
          let body = ""; for await (const c of req) body += c;
          let D; try { D = JSON.parse(body); } catch { return out(400, JSON.stringify({ error: "not JSON" })); }
          try {
            const r = await saveDefaults(__dirname, D.tab, D.changes);
            server.config.logger.info(`saved ${r.saved.length} defaults to ${r.file} (motion studio)${r.skipped.length ? `; skipped ${r.skipped.map(([k]) => k).join(", ")}` : ""}`);
            return out(200, JSON.stringify(r));
          } catch (err) { return out(400, JSON.stringify({ error: String(err.message || err) })); }
        }
        out(404, "not found", "text/plain");
      });
    },
  };
}

export default defineConfig({
  root: ROOT,
  publicDir: path.resolve(__dirname, "public"),
  appType: "mpa",
  server: { host: "::", port: 8080, hmr: { overlay: false } },
  preview: { port: 8080 },
  plugins: [pagesRouting(), stripHtmlComments(), pageCopies(), preloaderTunerSave(), motionStudio(), preloaderBundle(), preloaderBundleTag()],
  build: {
    outDir: OUT,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.join(ROOT, "index.html"),
        404: path.join(ROOT, "404.html"),
      },
    },
  },
});
