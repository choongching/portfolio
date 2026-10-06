// Headless Chrome over CDP: video box fit, poster, autoplay/loop/muted, reduced motion, mobile.
// Usage: node check-video.mjs [url] [screenshot-dir]   (default: http://localhost:8090/, ./shots/)
// Works without the Chrome extension. Serve the build first: pnpm build && pnpm preview --port 8090
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_ = process.argv[2] ?? "http://localhost:8090/";
const OUT = (process.argv[3] ?? "./shots").replace(/\/?$/, "/");
mkdirSync(OUT, { recursive: true });
let failed = false;
const port = 9333;
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${port}`, "--no-first-run",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "cdp-"))}`, "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws;
for (let i = 0; i < 40 && !ws; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    const page = list.find((t) => t.type === "page");
    if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
  } catch {}
  if (!ws) await sleep(250);
}
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;

const probe = `(async () => {
  const v = document.querySelector("video"); const box = v.parentElement.getBoundingClientRect();
  const poster = await fetch(v.poster).then(r => r.status);
  return { viewport: innerWidth + "x" + innerHeight, box: [Math.round(box.width), Math.round(box.height)],
    boxRatio: +(box.width / box.height).toFixed(4), videoRatio: +(v.videoWidth / v.videoHeight).toFixed(4),
    intrinsic: v.videoWidth + "x" + v.videoHeight, currentSrc: v.currentSrc.split("/").pop(),
    paused: v.paused, currentTime: +v.currentTime.toFixed(2), loop: v.loop, muted: v.muted, autoplay: v.autoplay,
    readyState: v.readyState, poster: v.poster.split("/").pop(), posterStatus: poster,
    overflowX: document.documentElement.scrollWidth > innerWidth };
})()`;

async function run(name, { width, height, mobile = false, reduced = false }) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 3 : 2, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }] });
  await send("Page.navigate", { url: URL_ });
  await sleep(4000);
  await evaluate(`document.querySelector("video").scrollIntoView({block: "center"})`);
  await sleep(1500);
  const r = await evaluate(probe);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}${name}.png`, Buffer.from(shot.result.data, "base64"));
  const problems = [];
  if (Math.abs(r.boxRatio - r.videoRatio) > 0.005) problems.push("box ratio != video ratio (bars)");
  if (r.overflowX) problems.push("horizontal overflow");
  if (r.posterStatus !== 200) problems.push("poster not 200");
  if (!r.muted || !r.loop) problems.push("not muted+loop");
  if (reduced ? !r.paused : r.paused) problems.push(reduced ? "plays under reduced motion" : "not autoplaying");
  if (problems.length) failed = true;
  console.log(problems.length ? "FAIL" : "OK  ", name, problems.join("; "), JSON.stringify(r));
}

await send("Page.enable");
await run("desktop", { width: 1440, height: 900 });
await run("mobile", { width: 390, height: 844, mobile: true });
await run("desktop-reduced", { width: 1440, height: 900, reduced: true });
ws.close(); chrome.kill();
process.exit(failed ? 1 : 0);
