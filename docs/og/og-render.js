/* Draws the thumbnail from a settings object (og-design.js). Used by og.html (the build) and
   editor.html (live), so both always match. Every element carries data-part for the editor.
   Missing settings fall back to the defaults below, so older og-design.js files keep working. */
window.OG_FONTS = {
  // name: [CSS family stack, Google Fonts axis spec or null (local/system)]
  "Switzer": ["'Switzer', sans-serif", null],
  "Geist Mono": ["'Geist Mono', monospace", null],
  "Inter": ["'Inter', sans-serif", "ital,wght@0,100..900;1,100..900"],
  "Inter Tight": ["'Inter Tight', sans-serif", "ital,wght@0,100..900;1,100..900"],
  "Geist": ["'Geist', sans-serif", "wght@100..900"],
  "Space Grotesk": ["'Space Grotesk', sans-serif", "wght@300..700"],
  "DM Sans": ["'DM Sans', sans-serif", "ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000"],
  "Manrope": ["'Manrope', sans-serif", "wght@200..800"],
  "Archivo": ["'Archivo', sans-serif", "ital,wght@0,100..900;1,100..900"],
  "Bricolage Grotesque": ["'Bricolage Grotesque', sans-serif", "opsz,wght@12..96,200..800"],
  "Hanken Grotesk": ["'Hanken Grotesk', sans-serif", "ital,wght@0,100..900;1,100..900"],
  "Schibsted Grotesk": ["'Schibsted Grotesk', sans-serif", "ital,wght@0,400..900;1,400..900"],
  "Instrument Sans": ["'Instrument Sans', sans-serif", "ital,wght@0,400..700;1,400..700"],
  "Unbounded": ["'Unbounded', sans-serif", "wght@200..900"],
  "Syne": ["'Syne', sans-serif", "wght@400..800"],
  "Archivo Black": ["'Archivo Black', sans-serif", ""],
  "Anton": ["'Anton', sans-serif", ""],
  "Bebas Neue": ["'Bebas Neue', sans-serif", ""],
  "Instrument Serif": ["'Instrument Serif', serif", "ital@0;1"],
  "Fraunces": ["'Fraunces', serif", "ital,opsz,wght@0,9..144,100..900;1,9..144,100..900"],
  "Newsreader": ["'Newsreader', serif", "ital,opsz,wght@0,6..72,200..800;1,6..72,200..800"],
  "IBM Plex Mono": ["'IBM Plex Mono', monospace", "ital,wght@0,400;0,500;0,700;1,400"],
  "JetBrains Mono": ["'JetBrains Mono', monospace", "ital,wght@0,100..800;1,100..800"],
  "Space Mono": ["'Space Mono', monospace", "ital,wght@0,400;0,700;1,400;1,700"],
  "Helvetica Neue (system)": ["'Helvetica Neue', Helvetica, Arial, sans-serif", null],
  "SF Pro (system)": ['-apple-system, BlinkMacSystemFont, sans-serif', null],
  "Georgia (system)": ["Georgia, serif", null],
  "Times (system)": ["'Times New Roman', Times, serif", null],
};
window.OG_TYPE_DEFAULTS = {
  font: "Switzer", italic: false, kerning: "auto", wordSpacing: 0, transform: "none", align: "left",
  wrap: "wrap", ligatures: true, features: "", variation: "", opacity: 100,
};
window.renderOG = function renderOG(root, D) {
  const c = D.canvas;
  const W = 1200 - c.marginLeft - c.marginRight, H = 630 - c.marginTop - c.marginBottom;
  const avail = W - c.gap1 - c.gap2, sum = D.line.width + D.c1.width + D.c2.width;
  const ws = [D.line.width, D.c1.width, D.c2.width].map((w) => (avail * w) / sum);
  const xs = [c.marginLeft, c.marginLeft + ws[0] + c.gap1, c.marginLeft + ws[0] + c.gap1 + ws[1] + c.gap2];
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m]);
  const loadFont = (name) => {
    const f = window.OG_FONTS[name]; if (!f || f[1] === null) return;
    const id = `gf-${name.replace(/\W+/g, "-")}`; if (document.getElementById(id)) return;
    const l = document.createElement("link"); l.id = id; l.rel = "stylesheet";
    l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, "+")}${f[1] ? `:${f[1]}` : ""}&display=swap`;
    document.head.appendChild(l);
  };
  const typo = (o) => { // shared type settings → CSS
    const t = { ...window.OG_TYPE_DEFAULTS, ...o }; loadFont(t.font);
    const fam = (window.OG_FONTS[t.font] || window.OG_FONTS.Switzer)[0];
    return `font-family:${fam};font-size:${t.size}px;font-weight:${t.weight};font-style:${t.italic ? "italic" : "normal"};` +
      `letter-spacing:${t.tracking}em;word-spacing:${t.wordSpacing}em;font-kerning:${t.kerning};text-transform:${t.transform};` +
      `font-synthesis:none;font-variant-ligatures:${t.ligatures ? "normal" : "none"};${t.features ? `font-feature-settings:${t.features};` : ""}` +
      `${t.variation ? `font-variation-settings:${t.variation};` : ""}opacity:${t.opacity / 100};`;
  };
  const tile = (part, i, inner = "") => {
    const t = D[part];
    return `<div data-part="${part}" style="position:absolute;left:${xs[i]}px;top:${c.marginTop}px;width:${ws[i]}px;height:${H}px;background:${t.fill};border-radius:${t.rTL}px ${t.rTR}px ${t.rBR}px ${t.rBL}px;overflow:hidden">${inner}</div>`;
  };
  const slit = (part, w) => {
    const s = D[part], open = s.to >= 100, x0 = (w * s.from) / 100, x1 = open ? w + 2 : (w * s.to) / 100;
    return `<div data-part="${part}" style="position:absolute;left:${x0}px;top:${(H * s.y) / 100 - s.thickness / 2}px;width:${Math.max(0, x1 - x0)}px;height:${s.thickness}px;background:${s.color};border-radius:${s.radius}px"></div>`;
  };
  const T = { anchor: "top", padBottom: 22, ...D.text }, M = { second2: null, secondColor: null, ...D.mark };
  const vpos = T.anchor === "bottom" ? `bottom:${T.padBottom}px` : T.anchor === "middle" ? `top:calc(50% + ${T.padTop}px);transform:translateY(-50%)` : `top:${T.padTop}px`;
  const text = `<p data-part="text" style="position:absolute;left:${T.padLeft}px;right:${T.padRight}px;${vpos};margin:0;color:${T.color};line-height:${T.leading};text-align:${T.align || "left"};text-wrap:${T.wrap || "wrap"};${typo(T)}">${esc(T.text)}</p>`;
  const mark = `<p data-part="mark" style="position:absolute;left:${M.padLeft}px;bottom:${M.padBottom}px;margin:0;white-space:nowrap;color:${M.color};line-height:1;${typo(M)}">${esc(M.first)}<b style="font-weight:${M.weight2};color:${M.secondColor || "inherit"}">${esc(M.second)}</b></p>`;
  root.style.cssText += `;position:relative;width:1200px;height:630px;overflow:hidden;background:${c.bg};font-family:Switzer,sans-serif`;
  root.dataset.part = "canvas";
  root.innerHTML = tile("line", 0, text + mark) + tile("c1", 1, slit("slit1", ws[1])) + tile("c2", 2, slit("slit2", ws[2]));
  return { xs, ws, H, W };
};
