import { defineConfig, type Plugin } from "vite";
import path from "node:path";

/* The site: the slider landing (designbycc-landing/) built for designby.cc.
   public/ is copied to the site root as-is (favicon, resume, media, robots,
   sitemap, llms.txt, _headers, _redirects). Scratch files in the landing
   folder (_*.html, _penang/) are never built: only the inputs below ship. */

const SITE = "https://www.designby.cc";
const ROOT = path.resolve(__dirname, "designbycc-landing");
const OUT = path.resolve(__dirname, "dist");

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
// resume.html.
function pagesRouting(): Plugin {
  const rewrite = (req: { url?: string }) => {
    const [p, q = ""] = (req.url || "/").split("?");
    if (p === "/resume") req.url = "/resume.html" + (q && "?" + q);
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
  plugins: [pagesRouting(), stripHtmlComments()],
  build: {
    outDir: OUT,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.join(ROOT, "index.html"),
      },
    },
  },
});
