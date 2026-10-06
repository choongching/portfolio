// check-slider.mjs: verify the landing slider's LAYOUT, not just its element counts.
// Headless Chrome over CDP (no Chrome extension needed). Steps through the whole slider with
// small wheel events, records every visible card's rect at each step, and flags overlapping
// cards (the "double layer" pile-up from #58). Optionally saves or compares a baseline.
//
// Usage (serve the repo root first: `python3 -m http.server 8081`):
//   node check-slider.mjs [url] [--save base.json | --compare base.json] [--mobile] [--shots dir]
//   default url: http://localhost:8081/designbycc-landing/index.html
// Typical: run with --save on the last good commit, make the change, run with --compare.
// Exit code 1 on any overlap or (with --compare) any card that moved more than 2px.

import { spawn } from "node:child_process";
import { writeFileSync, readFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i === -1 ? null : args[i + 1] ?? true; };
const url = args.find((a) => /^https?:/.test(a)) ?? "http://localhost:8081/designbycc-landing/index.html";
const mobile = args.includes("--mobile");
const [W, H] = mobile ? [390, 844] : [1505, 880]; // 1505×880 ≈ CC's real browser window
const STEPS = 6, WHEELS_PER_STEP = 25;
const shots = flag("--shots");
if (shots) mkdirSync(shots, { recursive: true });

const port = 9500 + Math.floor(Math.random() * 400);
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
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map(); const errors = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description?.split("\n")[0]);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (x) => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result?.result?.value;

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile });
await send("Page.navigate", { url });
await sleep(9000); // intro + loader

const tree = mobile ? ".js-c-slider-responsive" : ".js-c-slider";
const item = mobile ? ".js-c-slider-responsive__item" : ".js-c-slider__item";
const probe = `(() => [...document.querySelectorAll("${tree} ${item}")].map((a, i) => {
  const r = a.getBoundingClientRect();
  const label = (a.querySelector("h1,h3,.a-content-h4,.o-font-h2")?.textContent || a.getAttribute("href") || "").trim().slice(0, 40);
  return { i, label, r: [r.left, r.top, r.width, r.height].map(Math.round) };
}).filter(c => c.r[2] > 2 && c.r[3] > 2 && c.r[0] < innerWidth && c.r[0] + c.r[2] > 0 && c.r[1] < innerHeight && c.r[1] + c.r[3] > 0))()`;

const run = [];
let problems = 0;
for (let s = 0; s < STEPS; s++) {
  if (s) {
    for (let k = 0; k < WHEELS_PER_STEP; k++) {
      if (mobile) await ev(`window.scrollBy(0, 60)`);
      else await ev(`window.dispatchEvent(new WheelEvent("wheel", {deltaY: 60}))`);
      await sleep(20);
    }
    await sleep(2000);
  }
  const cards = await ev(probe);
  const overlaps = [];
  for (let a = 0; a < cards.length; a++) for (let b = a + 1; b < cards.length; b++) {
    const [ax, ay, aw, ah] = cards[a].r, [bx, by, bw, bh] = cards[b].r;
    const ox = Math.min(ax + aw, bx + bw) - Math.max(ax, bx), oy = Math.min(ay + ah, by + bh) - Math.max(ay, by);
    if (ox > 2 && oy > 2) overlaps.push(`#${cards[a].i} "${cards[a].label}" ∩ #${cards[b].i} "${cards[b].label}" (${ox}×${oy}px)`);
  }
  problems += overlaps.length;
  console.log(`step ${s}: ${cards.length} visible cards${overlaps.length ? `, OVERLAPS:\n  ${overlaps.join("\n  ")}` : ", no overlaps"}`);
  run.push(cards);
  if (shots) { const shot = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(shots, `${mobile ? "mobile" : "desktop"}-step${s}.png`), Buffer.from(shot.result.data, "base64")); }
}

const save = flag("--save"), compare = flag("--compare");
if (save) { writeFileSync(save, JSON.stringify(run)); console.log(`baseline saved: ${save}`); }
if (compare) {
  const base = JSON.parse(readFileSync(compare, "utf8"));
  run.forEach((cards, s) => {
    const byLabel = new Map((base[s] || []).map((c) => [c.label, c.r]));
    cards.forEach((c) => {
      const b = byLabel.get(c.label);
      if (b && c.r.some((v, k) => Math.abs(v - b[k]) > 2)) { problems++; console.log(`step ${s}: MOVED "${c.label}" ${JSON.stringify(b)} → ${JSON.stringify(c.r)}`); }
    });
  });
  console.log(`compared against ${compare}`);
}
if (errors.length) { problems += errors.length; console.log("console errors:", errors); }
console.log(problems ? `FAIL (${problems} problem${problems > 1 ? "s" : ""})` : "PASS");
ws.close(); chrome.kill();
process.exit(problems ? 1 : 0);
