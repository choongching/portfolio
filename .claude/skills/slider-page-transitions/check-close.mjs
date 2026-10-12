// check-close.mjs: verify the page-layer Close hint (CloseHint in main.js) end to end.
// Headless Chrome over CDP with REAL pointer/key input (Input.dispatch*), so :hover, pointermove
// and the `(hover: hover) and (pointer: fine)` gate behave like a mouse (desktop) or touch (--mobile).
//
// Usage (start the site first: `pnpm dev:site`):
//   node check-close.mjs [url] [--mobile] [--shots dir]
//   default url: http://localhost:8080/ (`pnpm dev:site`); `pnpm preview:site` serves the
//   production build the way Cloudflare Pages does, at http://localhost:8788/
// Opens the PENANG clock's page each time. Exit code 1 on any failed assertion or page error.
//
// Desktop asserts: no hint on open · logo hover → hint beside the cursor, following it · hides on
// leave · page clicks don't close · logo click closes · Esc closes.
// Mobile asserts: hint beside the logo on open, stays · menu "+" still there · logo tap closes.

import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i === -1 ? null : args[i + 1] ?? true; };
const url = args.find((a) => /^https?:/.test(a)) ?? "http://localhost:8080/";
const mobile = args.includes("--mobile");
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
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
// Runtime.evaluate has intermittently come back with no result at all (3× on 2026-10-08, never
// reproduced on demand). Retry, and log the raw reply so the cause can be found next time.
const ev = async (x) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) { errors.push("eval: " + r.result.exceptionDetails.exception?.description?.split("\n")[0]); return; }
    if (r.result?.result) return r.result.result.value;
    console.log("empty evaluate reply, retrying:", JSON.stringify(r).slice(0, 300));
    await sleep(300);
  }
};
const move = (x, y) => send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
const click = async (x, y) => {
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
};
const esc = async () => {
  for (const type of ["keyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
};
const shot = async (n) => {
  if (!shots) return;
  const s = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(shots, `close-${mobile ? "mobile" : "desktop"}-${n}.png`), Buffer.from(s.result.data, "base64"));
};
const stateOnce = () => ev(`(() => {
  const shown = (hint) => { const inner = hint.firstElementChild, a = hint.getBoundingClientRect(), b = inner.getBoundingClientRect();
    return getComputedStyle(hint).visibility === "visible" && +getComputedStyle(inner).opacity > 0.95 && Math.abs(b.top - a.top) < 1; };
  const cur = document.querySelector(".c-close-cursor"), r = cur.getBoundingClientRect();
  return { open: ["/about/", "/penang/"].includes(location.pathname), cursor: shown(cur), at: [Math.round(r.left), Math.round(r.top)],
    fixed: shown(document.querySelector(".js-close-hint")),
    menuBtn: getComputedStyle(document.querySelector(".js-toggle-menu")).display !== "none" };
})()`);
const state = stateOnce;
const tree = mobile ? ".js-c-slider-responsive" : ".js-c-slider";
const openPage = async () => { await ev(`document.querySelector('${tree} .js-clock-spin').click()`); await sleep(3800); };
const logoAt = () => ev(`(() => { const r = document.querySelector(".js-b-header__logo .wordmark").getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);

let problems = 0;
const check = (name, ok, s) => { if (!s) ok = false; if (!ok) problems++; console.log(`${ok ? "ok  " : "FAIL"} ${name}  ${JSON.stringify(s)}`); };

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", mobile
  ? { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }
  : { width: 1505, height: 880, deviceScaleFactor: 1, mobile: false });
if (mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.navigate", { url });
await sleep(9000); // intro + loader

let s = await state();
check("home: no hint", s && !s.open && !s.cursor && !s.fixed, s);

if (!mobile) await move(700, 450); // pointer parked over the page, away from the logo
await openPage(); s = await state(); await shot("1-open");
if (!mobile) {
  check("open: no hint until the logo is hovered", s?.open && !s.cursor && !s.fixed, s);
  const [lx, ly] = await logoAt();
  await move(lx - 30, ly); await sleep(800); s = await state(); await shot("2-logo-hover");
  check("logo hover: hint beside the cursor", s?.cursor && Math.abs(s.at[0] - (lx - 30)) < 3 && Math.abs(s.at[1] - ly) < 3, s);
  await move(lx + 30, ly); await sleep(800); s = await state();
  check("move along the logo: hint follows", s?.cursor && Math.abs(s.at[0] - (lx + 30)) < 3, s);
  await move(700, 450); await sleep(600); s = await state();
  check("leave logo: hint hidden", s && !s.cursor, s);
  await click(700, 450); await sleep(1500); s = await state();
  check("page click: stays open", s?.open, s);
  await click(lx, ly); await sleep(3000); s = await state();
  check("logo click: closed, hint hidden", s && !s.open && !s.cursor, s);
  await openPage(); await esc(); await sleep(3000); s = await state();
  check("Esc: closed", s && !s.open, s);
} else {
  await sleep(1000); s = await state();
  check("touch: hint beside the logo, menu + still there", s?.open && s.fixed && !s.cursor && s.menuBtn, s);
  await shot("2-stays");
  const [lx, ly] = await logoAt();
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: lx, y: ly }] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await sleep(3000); s = await state();
  check("logo tap: closed, hint hidden", s && !s.open && !s.fixed, s);
}

if (errors.length) { problems += errors.length; console.log("errors:", errors); }
console.log(problems ? `FAIL (${problems} problem${problems > 1 ? "s" : ""})` : "PASS");
ws.close(); chrome.kill();
process.exit(problems ? 1 : 0);
