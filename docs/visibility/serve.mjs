// node docs/visibility/serve.mjs (pnpm visibility): a local dashboard for designby.cc's visibility.
//   /api/health   live site checks, no setup
//   /api/search   Google Search Console (service-account key)
//   /api/traffic  Cloudflare Web Analytics (read-only API token)
// Keys live OUTSIDE the repo, in ~/.config/designby-visibility/ (see the visibility skill).
// Listens on 127.0.0.1 only. No dependencies.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createHash, createSign } from "node:crypto";
import { exec } from "node:child_process";
import { homedir } from "node:os";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PORT = +(process.env.PORT || 5181);
const SITE = "https://www.designby.cc";
const CONFIG_DIR = join(homedir(), ".config", "designby-visibility");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const UA = "designby-visibility/1.0 (site owner's own dashboard)";

const send = (res, code, body, type = "application/json") => {
  res.writeHead(code, { "content-type": type, "cache-control": "no-store" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};

// ---------- config ----------
async function loadConfig() {
  let c = {};
  try { c = JSON.parse(await readFile(join(CONFIG_DIR, "config.json"), "utf8")); } catch {}
  const cf = c.cloudflare || {};
  const g = c.google || {};
  return {
    cloudflare: {
      accountId: process.env.CF_ACCOUNT_ID || cf.accountId || "",
      apiToken: process.env.CF_API_TOKEN || cf.apiToken || "",
      siteTag: process.env.CF_SITE_TAG || cf.siteTag || "",
    },
    google: {
      keyFile: (process.env.GSC_KEY_FILE || g.keyFile || join(CONFIG_DIR, "google-key.json")).replace(/^~/, homedir()),
      site: process.env.GSC_SITE || g.site || "sc-domain:designby.cc",
    },
  };
}

// Small in-memory cache so reloading the page doesn't spend API quota.
const cache = new Map();
async function cached(key, ms, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < ms) return hit.v;
  const v = await fn();
  cache.set(key, { t: Date.now(), v });
  return v;
}

const isoDay = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d; };

// ---------- health ----------
async function get(url, opts = {}) {
  const r = await fetch(url, { redirect: opts.redirect || "follow", headers: { "user-agent": UA, accept: "text/html,*/*" }, signal: AbortSignal.timeout(15000) });
  const buf = Buffer.from(await r.arrayBuffer());
  return { status: r.status, headers: r.headers, text: buf.toString("utf8"), buf, url: r.url };
}
const meta = (html, attr, name) => {
  const m = html.match(new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*>`, "i"));
  if (!m) return null;
  const c = m[0].match(/content=(?:"([^"]*)"|'([^']*)')/i) || [];
  return (c[1] ?? c[2] ?? "").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');
};

async function health() {
  const checks = [];
  const add = (group, label, ok, detail = "", level) => checks.push({ group, label, ok, level: level || (ok ? "ok" : "fail"), detail });
  const safe = async (group, label, fn) => { try { await fn(); } catch (e) { add(group, label, false, String(e.message || e)); } };

  await safe("Pages", "pages answer", async () => {
    const paths = ["/", "/about/", "/resume", "/resume.pdf", "/llms.txt", "/sitemap.xml", "/robots.txt", "/og-home.png?v=2"];
    const res = await Promise.all(paths.map((p) => get(SITE + p).then((r) => [p, r.status])));
    for (const [p, s] of res) add("Pages", p, s === 200, `HTTP ${s}`);
    const nf = await get(SITE + "/this-page-does-not-exist");
    add("Pages", "unknown pages get a real 404", nf.status === 404, `HTTP ${nf.status}`);
    const apex = await get("https://designby.cc/", { redirect: "manual" });
    const loc = apex.headers.get("location") || "";
    add("Pages", "designby.cc redirects to www", apex.status >= 300 && apex.status < 400 && loc.startsWith(SITE), `HTTP ${apex.status} → ${loc || "no redirect"}`);
  });

  await safe("Search basics", "homepage meta", async () => {
    const { text: html } = await get(SITE + "/");
    const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
    add("Search basics", "title leads with your name", /^Teo Choong Ching/.test(title), title);
    const desc = meta(html, "name", "description") || "";
    add("Search basics", "description is 120–170 characters", desc.length >= 120 && desc.length <= 170, `${desc.length} chars`);
    add("Search basics", "page can be indexed", /index/.test(meta(html, "name", "robots") || "") && !/noindex/.test(meta(html, "name", "robots") || ""), meta(html, "name", "robots") || "no robots meta");
    const canon = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) || [])[1] || "";
    add("Search basics", "canonical URL", canon === SITE + "/", canon || "missing");
    const og = meta(html, "property", "og:image") || "";
    add("Search basics", "preview image is versioned", /\?v=\d+/.test(og), og);
    let person = null;
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
      try { const j = JSON.parse(m[1]); if (j["@type"] === "Person") person = j; } catch { add("Search basics", "structured data parses", false, "a JSON-LD block is invalid"); }
    }
    add("Search basics", "structured data: Person with name variants", !!person && Array.isArray(person.alternateName), person ? (person.alternateName || []).join(", ") : "no Person block");
    add("Search basics", "Cloudflare Web Analytics script on the page", /cloudflareinsights/.test(html), /cloudflareinsights/.test(html) ? "" : "not enabled yet", /cloudflareinsights/.test(html) ? "ok" : "warn");
  });

  await safe("Search basics", "sitemap and robots", async () => {
    const sm = (await get(SITE + "/sitemap.xml")).text;
    const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const want = [SITE + "/", SITE + "/about/", SITE + "/resume"];
    add("Search basics", "sitemap lists /, /about/ and /resume", want.every((u) => locs.includes(u)), locs.map((u) => u.replace(SITE, "")).join(", "));
    const robots = (await get(SITE + "/robots.txt")).text;
    add("Search basics", "robots.txt points to the sitemap", robots.includes(`Sitemap: ${SITE}/sitemap.xml`));
    const llms = (await get(SITE + "/llms.txt")).text;
    add("Search basics", "llms.txt has an Availability section", /^## Availability/m.test(llms));
  });

  await safe("Resume", "resume PDF", async () => {
    const live = await get(SITE + "/resume.pdf");
    const local = await readFile(join(ROOT, "public/resume.pdf"));
    const h = (b) => createHash("sha1").update(b).digest("hex");
    add("Resume", "live PDF matches the repo copy", h(live.buf) === h(local), h(live.buf) === h(local) ? "" : "live differs: deploy pending or the repo is ahead");
  });

  await safe("Old Webflow site", "webflow", async () => {
    for (const p of ["/", "/about"]) {
      const r = await get("https://choongchingteo.webflow.io" + p);
      add("Old Webflow site", `choongchingteo.webflow.io${p} is gone`, r.status === 404 || r.status === 410, `HTTP ${r.status}`);
    }
  });
  return { checkedAt: new Date().toISOString(), checks };
}

// ---------- Google Search Console ----------
async function googleToken(keyFile) {
  return cached("gtoken:" + keyFile, 50 * 60 * 1000, async () => {
    let key;
    try { key = JSON.parse(await readFile(keyFile, "utf8")); } catch { throw Object.assign(new Error(`No Google key at ${keyFile}`), { setup: true }); }
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: key.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
    const sig = createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
    });
    const j = await r.json();
    if (!j.access_token) throw new Error(`Google sign-in failed: ${j.error_description || j.error || r.status}`);
    return { token: j.access_token, email: key.client_email };
  });
}

async function gsc(token, path, body) {
  const r = await fetch(`https://searchconsole.googleapis.com${path}`, {
    method: body ? "POST" : "GET",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || `Search Console HTTP ${r.status}`);
  return j;
}

const NAME_RE = /teo|choong|ching|cc teo|designby/i;

async function search(days) {
  const cfg = (await loadConfig()).google;
  const { token, email } = await googleToken(cfg.keyFile);
  const site = encodeURIComponent(cfg.site);
  const range = { startDate: isoDay(daysAgo(days + 1)), endDate: isoDay(daysAgo(1)) };
  const q = (dimensions, rowLimit = 25) => gsc(token, `/webmasters/v3/sites/${site}/searchAnalytics/query`, { ...range, dimensions, rowLimit, dataState: "all" });
  return cached(`search:${days}`, 30 * 60 * 1000, async () => {
    const [byDate, queries, pages, countries, sitemaps] = await Promise.all([
      q(["date"], 500), q(["query"], 50), q(["page"], 25), q(["country"], 10),
      gsc(token, `/webmasters/v3/sites/${site}/sitemaps`).catch((e) => ({ error: e.message })),
    ]);
    const inspect = await Promise.all(["/", "/about/", "/resume"].map((p) =>
      gsc(token, "/v1/urlInspection/index:inspect", { inspectionUrl: SITE + p, siteUrl: cfg.site })
        .then((j) => ({ path: p, ...j.inspectionResult?.indexStatusResult }))
        .catch((e) => ({ path: p, error: e.message }))));
    const rows = (r) => (r.rows || []).map((x) => ({ key: x.keys[0], clicks: x.clicks, impressions: x.impressions, ctr: x.ctr, position: x.position }));
    const q2 = rows(queries);
    return {
      account: email, site: cfg.site, range,
      byDate: rows(byDate), queries: q2, nameQueries: q2.filter((r) => NAME_RE.test(r.key)),
      pages: rows(pages), countries: rows(countries),
      sitemaps: sitemaps.error ? sitemaps : (sitemaps.sitemap || []).map((s) => ({ path: s.path, lastDownloaded: s.lastDownloaded, lastSubmitted: s.lastSubmitted, errors: +s.errors || 0, warnings: +s.warnings || 0, isPending: s.isPending })),
      inspect,
    };
  });
}

// ---------- Cloudflare Web Analytics ----------
async function cfFetch(token, path, body) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method: body ? "POST" : "GET",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return r.json();
}

async function traffic(days) {
  const cf = (await loadConfig()).cloudflare;
  if (!cf.accountId || !cf.apiToken) throw Object.assign(new Error("No Cloudflare account ID or API token yet"), { setup: true });
  let siteTag = cf.siteTag;
  if (!siteTag) {
    // An Account Analytics: Read token can't list Web Analytics sites, but it can group the
    // analytics by site: pick the one serving www.designby.cc.
    siteTag = await cached("siteTag", 24 * 3600 * 1000, async () => {
      const q = `{ viewer { accounts(filter: { accountTag: "${cf.accountId}" }) { rumPageloadEventsAdaptiveGroups(limit: 20, filter: { datetime_geq: "${daysAgo(30).toISOString()}", datetime_leq: "${new Date().toISOString()}" }) { count dimensions { siteTag requestHost } } } } }`;
      const j = await cfFetch(cf.apiToken, "/graphql", { query: q });
      if (j.errors?.length) throw new Error(`Cloudflare: ${j.errors.map((e) => e.message).join("; ")}`);
      const rows = j.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups || [];
      return rows.find((r) => /(^|\.)designby\.cc$/.test(r.dimensions.requestHost))?.dimensions.siteTag;
    });
    if (!siteTag) { cache.delete("siteTag"); throw Object.assign(new Error("No Web Analytics data for designby.cc yet. Turn on Web Analytics, or add siteTag to the config."), { setup: true }); }
  }
  return cached(`traffic:${days}`, 10 * 60 * 1000, async () => {
    // Cloudflare samples long ranges (28 days came back 1-in-10, rounded to tens), so ask for
    // 7-day windows, which come back exact at this site's volume, and add them up.
    const end = new Date(), start = daysAgo(days);
    const windows = [];
    for (let t = start.getTime(); t < end.getTime(); t += 7 * 864e5) windows.push([new Date(t), new Date(Math.min(t + 7 * 864e5, end.getTime()))]);
    const one = async ([from, to]) => {
      const filter = `{ siteTag: "${siteTag}", datetime_geq: "${from.toISOString()}", datetime_lt: "${to.toISOString()}" }`;
      const group = (alias, dim, order = "count_DESC") =>
        `${alias}: rumPageloadEventsAdaptiveGroups(limit: 500, filter: ${filter}, orderBy: [${order}]) { count sum { visits } avg { sampleInterval } dimensions { ${dim} } }`;
      const query = `{ viewer { accounts(filter: { accountTag: "${cf.accountId}" }) {
        ${group("byDate", "date", "date_ASC")} ${group("pages", "requestPath")} ${group("referers", "refererHost")}
        ${group("countries", "countryName")} ${group("devices", "deviceType")} } } }`;
      const j = await cfFetch(cf.apiToken, "/graphql", { query });
      if (j.errors?.length) throw new Error(`Cloudflare: ${j.errors.map((e) => e.message).join("; ")}`);
      return j.data?.viewer?.accounts?.[0] || {};
    };
    const parts = await Promise.all(windows.map(one));
    let sampled = false;
    const merge = (alias, dim, limit) => {
      const m = new Map();
      for (const a of parts) for (const x of a[alias] || []) {
        if ((x.avg?.sampleInterval || 1) > 1) sampled = true;
        const key = x.dimensions[dim] || "(direct / none)";
        const r = m.get(key) || { key, views: 0, visits: 0 };
        r.views += x.count; r.visits += x.sum?.visits || 0; m.set(key, r);
      }
      const out = [...m.values()];
      return limit ? out.sort((a, b) => b.visits - a.visits || b.views - a.views).slice(0, limit) : out;
    };
    // Every day in the range, with zeros for quiet days, so the chart doesn't skip them.
    const seen = new Map(merge("byDate", "date").map((r) => [r.key, r]));
    const byDate = [];
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) { const k = isoDay(d); byDate.push(seen.get(k) || { key: k, views: 0, visits: 0 }); }
    return {
      range: { from: isoDay(start), to: isoDay(end) }, byDate,
      pages: merge("pages", "requestPath", 15), referers: merge("referers", "refererHost", 15),
      countries: merge("countries", "countryName", 10), devices: merge("devices", "deviceType", 5), sampled,
    };
  });
}

// ---------- server ----------
createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const days = Math.min(Math.max(+(url.searchParams.get("days") || 28), 1), 480);
  const api = { "/api/health": () => cached("health", 60 * 1000, health), "/api/search": () => search(days), "/api/traffic": () => traffic(days) }[url.pathname];
  if (api) {
    if (url.searchParams.has("fresh")) cache.clear();
    try { return send(res, 200, await api()); }
    catch (e) { return send(res, 200, { error: String(e.message || e), setup: !!e.setup }); }
  }
  let p = url.pathname === "/" ? "/docs/visibility/index.html" : url.pathname;
  if (!p.startsWith("/docs/visibility/") && !p.startsWith("/public/fonts/")) return send(res, 404, "not found", "text/plain");
  const path = normalize(join(ROOT, decodeURIComponent(p)));
  if (!path.startsWith(ROOT)) return send(res, 403, "forbidden", "text/plain");
  try { const s = await stat(path); if (!s.isFile()) throw 0; send(res, 200, await readFile(path), TYPES[extname(path)] || "application/octet-stream"); }
  catch { send(res, 404, "not found", "text/plain"); }
}).listen(PORT, "127.0.0.1", () => {
  const u = `http://127.0.0.1:${PORT}/`;
  console.log(`designby.cc visibility: ${u}  (Ctrl+C to stop)\nKeys: ${CONFIG_DIR}/`);
  if (!process.env.NO_OPEN) exec(`open "${u}"`);
});
