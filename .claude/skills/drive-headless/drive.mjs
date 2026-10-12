// drive.mjs: run a list of steps against a page in headless Chrome over CDP, with REAL input
// (Input.dispatch*), so :hover, pointer events, the `(hover: hover)` gate, wheel-driven engines
// and touch behave like a person using the page. rAF runs at full rate (no occluded window).
//
// Usage (serve the repo root first: `python3 .claude/skills/drive-headless/serve.py 8081 &`):
//   node drive.mjs <steps.json> [--out dir] [--size 1505x880] [--dpr 1] [--device iphone|ipad]
//                               [--base http://localhost:8081/] [--throttle slow4g]
// --block a,b: URL patterns to fail (CDP Network.setBlockedURLs), e.g. --block "*CustomEase*" to
//   test what happens when a script doesn't load.
// --throttle slow4g: 150 ms RTT, 1.6 Mbps down, 0.75 Mbps up, 4x CPU slowdown (Lighthouse's mobile profile).
// Prints `[label] value` for eval/frames/metrics steps, then `errors: [...]` (uncaught exceptions
// and console.error). Exit code 1 if there were errors or a step failed.
//
// Steps file: a JSON array, run in order. Targets ("at") are [x, y] or a CSS selector (its centre).
//   { "nav": "designbycc-landing/index.html", "after": 3000 }   relative to --base; waits `after` ms
//   { "wait": 500 }
//   { "eval": "document.title", "label": "title" }               awaits promises; prints the value
//   { "shot": "home", "clip": ".js-a-spiral" }                   PNG to --out; clip = selector or [x,y,w,h]
//   { "move": ".c-intro" }   { "click": [400, 300] }   { "tap": ".c-intro" }   (tap = touch)
//   { "wheel": [750, 440], "dy": 100, "times": 20, "gap": 80 }   wheel bursts drive the slider
//   { "until": "expr returning true", "wheel": [750, 440], "dy": 100, "max": 120 }  wheel until true
//   { "drag": [[600, 400], [200, 400]], "steps": 12 }            mouse drag;  "swipe": same, touch
//   { "key": "Escape" }
//   { "frames": "hover", "n": 60 }                               rAF frame time median / p95 (ms)
//   { "metrics": "idle", "ms": 4000 }                            main-thread ms per second (busy,
//                                                                script, layout, style) over a window

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; };
const stepsFile = args.find((a) => a.endsWith(".json"));
if (!stepsFile) { console.error("usage: node drive.mjs <steps.json> [--out dir] [--size WxH] [--dpr n] [--device iphone|ipad] [--base url]"); process.exit(2); }
const steps = JSON.parse(readFileSync(stepsFile, "utf8"));
const out = resolve(opt("--out", "."));
mkdirSync(out, { recursive: true });
const base = opt("--base", "http://localhost:8081/");
const device = opt("--device", null);
const DEVICES = {
  iphone: { w: 390, h: 844, dpr: 3, ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" },
  ipad: { w: 820, h: 1180, dpr: 2, ua: "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" },
};
const dev = device ? DEVICES[device] : null;
if (device && !dev) { console.error(`unknown --device ${device} (iphone | ipad)`); process.exit(2); }
const [W, H] = (opt("--size", dev ? `${dev.w}x${dev.h}` : "1505x880")).split("x").map(Number);
const dpr = Number(opt("--dpr", dev ? dev.dpr : 1));
const throttle = opt("--throttle", null);
const block = opt("--block", null);

const port = 9100 + Math.floor(Math.random() * 800);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${port}`, "--no-first-run",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "cdp-"))}`, "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 40 && !ws; i++) {
  try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {}
  if (!ws) await sleep(250);
}
if (!ws) { console.error("could not reach headless Chrome"); chrome.kill(); process.exit(1); }
await new Promise((r) => ws.addEventListener("open", r));

let id = 0;
const pending = new Map();
const errors = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description?.split("\n")[0] ?? m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push("console.error: " + m.params.args.map((a) => a.value ?? a.description).join(" "));
});
// Every CDP call gives up after 30 s, so a stuck page fails its step instead of hanging the run.
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const i = ++id;
  const t = setTimeout(() => { pending.delete(i); reject(new Error(`${method} timed out after 30 s`)); }, 30000);
  pending.set(i, (m) => { clearTimeout(t); resolve(m); });
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description?.split("\n")[0] ?? "eval failed");
  return r.result?.result?.value;
};
const at = async (target) => {
  if (Array.isArray(target)) return target;
  const p = await ev(`(() => { const e = document.querySelector(${JSON.stringify(target)}); if (!e) return null;
    const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
  if (!p) throw new Error(`no element for ${target}`);
  // Slider cards ease in from off-screen: a click there hits nothing and fails silently.
  if (p[0] < 0 || p[1] < 0 || p[0] > W || p[1] > H) throw new Error(`${target} is off-screen at ${p.map(Math.round)}; wheel it into view first`);
  return p;
};
const mouse = (type, [x, y], extra = {}) => send("Input.dispatchMouseEvent", { type, x, y, ...extra });
const touch = (type, pts) => send("Input.dispatchTouchEvent", { type, touchPoints: pts.map(([x, y]) => ({ x, y })) });
const metrics = async () => Object.fromEntries((await send("Performance.getMetrics")).result.metrics.map((m) => [m.name, m.value]));

await send("Runtime.enable");
await send("Page.enable");
await send("Performance.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: dpr, mobile: !!dev });
if (block) {
  await send("Network.enable");
  await send("Network.setBlockedURLs", { urls: block.split(",") });
}
if (throttle === "slow4g") {
  await send("Network.enable");
  await send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6e6 / 8) * 0.9, uploadThroughput: (0.75e6 / 8) * 0.9 });
  await send("Emulation.setCPUThrottlingRate", { rate: 4 });
} else if (throttle) { console.error(`unknown --throttle ${throttle} (slow4g)`); process.exit(2); }
if (dev) {
  await send("Emulation.setUserAgentOverride", { userAgent: dev.ua });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Emulation.setEmitTouchEventsForMouse", { enabled: true, configuration: "mobile" });
}

let failed = false;
for (const s of steps) {
  try {
    if ("nav" in s) { await send("Page.navigate", { url: new URL(s.nav, base).href }); await sleep(s.after ?? 2500); }
    else if (s.wait) await sleep(s.wait);
    else if (s.eval) console.log(`[${s.label ?? "eval"}]`, JSON.stringify(await ev(s.eval)));
    else if (s.shot) {
      let clip;
      if (typeof s.clip === "string") {
        clip = await ev(`(() => { const r = document.querySelector(${JSON.stringify(s.clip)}).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, scale: 1 }; })()`);
      } else if (Array.isArray(s.clip)) clip = { x: s.clip[0], y: s.clip[1], width: s.clip[2], height: s.clip[3], scale: 1 };
      const r = await send("Page.captureScreenshot", { format: "png", ...(clip ? { clip } : {}) });
      writeFileSync(join(out, s.shot + ".png"), Buffer.from(r.result.data, "base64"));
    }
    else if (s.move) await mouse("mouseMoved", await at(s.move));
    else if (s.click) { const p = await at(s.click); await mouse("mouseMoved", p); await mouse("mousePressed", p, { button: "left", clickCount: 1 }); await mouse("mouseReleased", p, { button: "left", clickCount: 1 }); }
    else if (s.tap) { const p = await at(s.tap); await touch("touchStart", [p]); await sleep(40); await touch("touchEnd", []); }
    else if (s.wheel && s.until) {
      const p = await at(s.wheel);
      let n = 0;
      while (!(await ev(s.until)) && n++ < (s.max ?? 120)) { await mouse("mouseWheel", p, { deltaX: s.dx ?? 0, deltaY: s.dy ?? 100 }); await sleep(s.gap ?? 80); }
      if (!(await ev(s.until))) throw new Error(`until never true: ${s.until}`);
    }
    else if (s.wheel) { const p = await at(s.wheel); for (let i = 0; i < (s.times ?? 1); i++) { await mouse("mouseWheel", p, { deltaX: s.dx ?? 0, deltaY: s.dy ?? 100 }); await sleep(s.gap ?? 80); } }
    else if (s.drag || s.swipe) {
      const [a, b] = s.drag ?? s.swipe, n = s.steps ?? 12;
      const pt = (i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n];
      if (s.drag) { await mouse("mouseMoved", a); await mouse("mousePressed", a, { button: "left", clickCount: 1 }); for (let i = 1; i <= n; i++) { await mouse("mouseMoved", pt(i), { buttons: 1 }); await sleep(16); } await mouse("mouseReleased", b, { button: "left", clickCount: 1 }); }
      else { await touch("touchStart", [a]); for (let i = 1; i <= n; i++) { await touch("touchMove", [pt(i)]); await sleep(16); } await touch("touchEnd", []); }
    }
    else if (s.key) { for (const type of ["keyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key: s.key, code: s.key }); }
    else if (s.frames) {
      const n = s.n ?? 60;
      const r = await ev(`new Promise((res) => { const t = []; let l = performance.now();
        const f = (now) => { t.push(now - l); l = now; if (t.length < ${n}) requestAnimationFrame(f);
          else { t.sort((a, b) => a - b); res({ median: +t[Math.floor(t.length / 2)].toFixed(1), p95: +t[Math.floor(t.length * 0.95)].toFixed(1) }); } };
        requestAnimationFrame(f); })`);
      console.log(`[${s.frames}] frame ms`, JSON.stringify(r));
    }
    else if (s.metrics) {
      const ms = s.ms ?? 4000, a = await metrics(); await sleep(ms); const b = await metrics();
      const d = (k) => +(((b[k] - a[k]) * 1000 * 1000) / ms).toFixed(1);
      console.log(`[${s.metrics}] ms/s`, JSON.stringify({ busy: d("TaskDuration"), script: d("ScriptDuration"), layout: d("LayoutDuration"), style: d("RecalcStyleDuration"), nodes: b.Nodes }));
    }
    else throw new Error("unknown step " + JSON.stringify(s));
  } catch (err) {
    failed = true;
    console.log(`step failed: ${JSON.stringify(s)}: ${err.message}`);
  }
}
console.log("errors:", JSON.stringify(errors));
chrome.kill();
process.exit(failed || errors.length ? 1 : 0);
