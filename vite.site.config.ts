import { defineConfig, type Plugin } from "vite";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

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

export default defineConfig({
  root: ROOT,
  publicDir: path.resolve(__dirname, "public"),
  appType: "mpa",
  server: { host: "::", port: 8080, hmr: { overlay: false } },
  preview: { port: 8080 },
  plugins: [pagesRouting(), stripHtmlComments(), pageCopies()],
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
