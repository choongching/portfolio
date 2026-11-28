/* The studio's Drawer tab (2026-11-27): another take on the Case studies card, next to the folder.
   CC's references: flat tabbed dividers (matte, staggered tabs, small mono labels), a file drawer
   pulled out towards you, and a file-drawer view in a direct, centred perspective.
   Closed, it is flat and shut: just the front panel, nothing peeking out (CC, 2026-11-27). A click slides the
   whole drawer towards you and the view opens into a one-point perspective (vanishing point centred
   above), so you look into the drawer and the dividers stand one behind the other. Hovering (tapping) a
   divider lifts it; the others get a light wash and drop a little. Flat and matte: no gloss, glass or
   gradients (CC: "move away from the polished 3D look"); the site's own simple palette.
   Real 3D (preserve-3d) for the drawer box; one number t (0 closed, 1 open) drives the slide, the
   spacing and the perspective together, so the move reads as one gesture. Sizes in u = 1% of the
   card's width. The card is designbycc-landing/case-drawer.js (on the site since 2026-11-28); this file is the tab. */
import { createProtoTab } from "./proto.js";
import { DRAWER_DEFAULTS, DRAWER_CSS, createDrawerCard } from "../../designbycc-landing/case-drawer.js";

// the card itself (defaults, styles, createDrawerCard) lives in designbycc-landing/case-drawer.js, shared with the site

// two ways to lift a file (CC: "soft motion of lifting up in the air" or "a quick fast float")
const FLOATS = [["Stiff", 0.28, "power4.out"], ["Soft float", 0.65, "power2.out"], ["Quick float", 0.3, "back.out(1.7)"]];
// the three closed looks: [id, name, front, inside]
const LOOKS = [["card", "Index-card box", "#ffffff", "#c9c9c9"], ["tab", "Drawer with a tab", "#141414", "#2a2a2a"]];
const PAPERS = [["Light greys", "#ffffff", "#f4f4f4", "#e9e9e9"], ["Paper", "#ffffff", "#f6f3ee", "#ece6dc"], ["Soft tints", "#ffffff", "#fbeee5", "#e9eef4"], ["Greys", "#ffffff", "#e4e4e4", "#cdcdcd"], ["White", "#ffffff", "#ffffff", "#ffffff"], ["Ink", "#141414", "#2e2e2e", "#474747"], ["Orange accent", "#ffffff", "#e4e4e4", "#f76d18"]];
const FRONTS = [["Ink", "#141414", "#2a2a2a"], ["White", "#ffffff", "#d9d9d9"], ["Grey", "#d6d6d6", "#bdbdbd"], ["Kraft", "#d4b585", "#b99a6a"], ["Orange", "#f76d18", "#c4530f"]];

/* ---------------- the tab ---------------- */
export function createDrawer({ canvas, onZoom }) {
  // CC (2026-11-27): only the hovered file lifts, so drop any saved "files behind move up too"
  // and start the lift from the soft timing (its values were missing before, so it jumped)
  // Once per update (MIGRATE), not on every load: it used to run each time, so CC's own dials for these
  // keys never survived a reload (2026-11-28). Bump MIGRATE whenever a default here changes.
  const MIGRATE = "2026-11-28i";
  try { if (localStorage.getItem("studio-drawer-migrated") !== MIGRATE) { const k = "studio-drawer-1", v = JSON.parse(localStorage.getItem(k) || "{}"); ["room", "pullDur", "pullEase", "washColor", "frontH", "divH", "baseY", "ratio", "slideY", "swing1", "swing2", "swing3", "swingX", "follow", "wash", "bob", "bobTime", "slit", "slitStep", "bob", "cabinetF2", "cabinetF3", "cardF2", "cardF3", "cardInside", "tabF2", "tabF3", "tabW", "openDur", "openEase", "closeDur", "closeEase", "hoverDur", "dropEase", "knock", "frontBounce", "cabinetF2", "cabinetF3", "cardF2", "cardF3", "cardInside", "tabF2", "tabF3", "tabH", "tabR", "hairline", "cardInside", "backH", "sideH", "depth", "inset", "earTop", "earFoot", "tabShoulder", "peekO", "lastLift", "frontType", "look", "front", "inside", "pageBg", "handle", "cardFront", "titleSize", "noteSize", "tabStyle", "dotGap", "numAlign", "liftColor", "accent", "chooseY", "chooseUp", "chooseDur", "backDur"].forEach((x) => delete v[x]); localStorage.setItem(k, JSON.stringify(v)); localStorage.setItem("studio-drawer-migrated", MIGRATE); } } catch {}
  return createProtoTab({
    canvas, onZoom, id: "drawer", css: DRAWER_CSS,
    title: "Case studies drawer",
    about: "A second idea for the Case studies card: flat when closed, a click slides the drawer towards you into a direct perspective. Not on the site; the folder stays there until you choose. Settings stay in this browser. Placeholder names.",
    hint: "Click a drawer to open it · hover a file · click the drawer or outside to close · drag to move, ⌘ + scroll to zoom",
    defaults: DRAWER_DEFAULTS, storeKey: "studio-drawer-1", saveTab: "drawer",
    // CC: "design all 3 in the canvas for me to see them side by side"
    // Dribbble's 4:3 (CC: "suitable for Dribbble upload … so that I can record and upload them"), close together
    frameGap: 40,
    frames: (S) => {
      // in a Dribbble frame the card is drawn larger (it fills the frame's height), so the drawer reads in the shot
      // canvas titles: one plain word each (CC: "keep them simple one word label style")
      const box = S.dribbble ? [1200, 900] : null, note = null, word = { cabinet: "Cabinet", card: "Index", tab: "Tab" };
      const w = S.dribbble ? Math.round(880 / S.ratio) : S.cardW;
      if (S.compare) return LOOKS.map(([look]) => ({ name: word[look], w, touch: false, note, over: { look }, box }));
      return S.dribbble ? [{ name: word[S.look], w, touch: false, note, box }] : null;
    },
    // every state as a static frame, a row per look, below the two live frames (CC, 2026-11-28)
    gallery: (S) => {
      if (!S.stateFrames) return null;   // (the cover ideas and the states)
      const box = S.dribbble ? [1200, 900] : null, w = S.dribbble ? Math.round(880 / S.ratio) : S.cardW, word = { card: "Index", tab: "Tab" };
      const n = [...Array(S.count).keys()].map((i) => i + 1);
      const list = [["Closed", { chosen: 0 }], ["Open", { open: true }], ...n.map((c) => [`Lifted ${c}`, { open: true, pulled: c }]), ...n.map((c) => [`In front ${c}`, { open: true, pulled: c, chosen: c }])];
      const rows = (S.compare ? LOOKS.map(([l]) => l) : [S.look]).map((look) => ({ title: `${word[look]} states`, frames: list.map(([name, state]) => ({ name, w, touch: false, over: { look }, box, state })) }));
      // Dribbble cover ideas (CC, 2026-11-28: "a nice Dribbble Shot image, as a main Cover … how people can get
      // what this post is all about by only the Cover … maybe an opened and closed state … just the Open state
      // should be enough too"). 4:3 like the shots, the selected look, no words added. A card is drawn at width
      // cw (its height is cw × ratio, the drawer about three quarters of its width), placed by its centre.
      const F = [1200, 900], cw = (hgt) => Math.round(hgt / S.ratio), L = { look: S.look };
      const one = (name, state, hgt) => ({ name, box: F, compose: [{ w: cw(hgt), over: L, state }] });
      const row = (name, size, gap, ...items) => ({ name, box: F, gap, compose: items.map(([state, over = L]) => ({ w: cw(size), over, state })) });
      const covers = [
        one("Open", { open: true }, 1150),
        // bleeds past the top (the back tabs), the title clear of the bottom
        { ...one("Open, close up", { open: true }, 1450), fill: 1.1, fillW: 1.3, dy: -90 },
        one("Lifted", { open: true, pulled: 2 }, 1150),
        one("In front", { open: true, pulled: 2, chosen: 2 }, 1050),
        row("Closed and open", 720, 90, [{}], [{ open: true }]),
        row("Open and in front", 720, 90, [{ open: true }], [{ open: true, pulled: 2, chosen: 2 }]),
        row("Three steps", 500, 60, [{}], [{ open: true, pulled: 2 }], [{ open: true, pulled: 2, chosen: 2 }]),
        row("Both looks", 720, 90, [{ open: true }, { look: "card" }], [{ open: true }, { look: "tab" }]),
      ];
      return [...rows, { title: "Cover", frames: covers }];
    },
    // what's drawn, for centring the covers: the front, its cover tab and the files (not the card's empty room)
    contentOf: (el) => el.querySelectorAll(".dr-front, .dr-scene svg"),
    createCard: createDrawerCard,
    states: [
      ["live", "Live", "Hover and click as on the site"],
      ["closed", "Closed", "Flat and shut"],
      ["open", "Open", "After a click: slid out towards you"],
      ...[1, 2, 3, 4, 5, 6].map((c) => [`pull${c}`, `Case study ${c} lifted`, "Hovering that file"]),
      ...[1, 2, 3, 4, 5, 6].map((c) => [`pick${c}`, `Case study ${c} in front`, "Clicked: out of the drawer"]),
    ],
    // every state says which file is out in front (0: none), so jumping to Open or Closed puts it back
    stateOf: (id) => (id === "closed" ? { chosen: 0 } : id === "open" ? { open: true, chosen: 0 } : id.startsWith("pick") ? { open: true, pulled: +id.slice(4), chosen: +id.slice(4) } : { open: true, pulled: +id.slice(4), chosen: 0 }),
    playSteps: (S) => [[{ open: true }, 1.4], ...[...Array(S.count).keys()].map((i) => [{ open: true, pulled: i + 1 }, 1.1]),
      [{ open: true, pulled: 2 }, 0.8], [{ open: true, pulled: 2, chosen: 2 }, 1.8], [{ open: true }, 1.2], [{}, 1]],
    // the controls, regrouped (CC, 2026-11-28: "review all the long list of controls, and clean up"): what it
    // looks like (Design), how it moves (Motion), the canvas (Canvas). Sections follow the order you meet
    // them: the closed drawer, its tabs and files; then hover, open, hover a file, click a file
    sections: ({ S, set, num, color, ease, toggle, choice, swatches, sub, sec, redraw, h: hh }) => {
      const [look] = LOOKS.find((l) => l[0] === S.look) || LOOKS[0];
      const seg = (k, label, opts) => choice(k, label, opts);
      return [
        // ---- Design ----
        sec({ title: "Look", tab: "Design" }, ["look", "compare", "dribbble"],
          choice("look", "Closed look", LOOKS.map(([v]) => [v, v === "card" ? "Index" : "Tab"]), (v) => { set("look", v); redraw(); }),
          toggle("compare", "Show both"), toggle("dribbble", "Dribbble frames")),
        sec({ title: "Front", tab: "Design" }, ["frontType", "titleSize", "titleWeight", "noteSize", "label", "handle"],
          choice("frontType", "Layout", [["editorial", "Editorial"], ["portfolio", "Portfolio"], ["centred", "Centred"], ["label", "Label"], ["index", "Index card"], ["footer", "Bottom line"], ["original", "Original"]]),
          num("titleSize", "Title size", 4, 16, 0.1), num("titleWeight", "Title weight", 200, 600, 10), num("noteSize", "Small text size", 1, 3.5, 0.05),
          toggle("label", "Small text"), toggle("handle", "Handle")),
        sec({ id: "colours", title: `Colours: ${look === "card" ? "Index" : "Tab"}`, tab: "Design" }, [`${look}Front`, `${look}Inside`, `${look}F1`, `${look}F2`, `${look}F3`, `${look}Shadow`],
          swatches(FRONTS, ([f, i]) => { S[`${look}Inside`] = i; set(`${look}Front`, f); }, ([f]) => S[`${look}Front`] === f, "Drawer"),
          color(`${look}Front`, "Front"), color(`${look}Inside`, "Inside"),
          swatches(PAPERS, ([a, b, c]) => { S[`${look}F1`] = a; S[`${look}F2`] = b; set(`${look}F3`, c); }, ([a, b, c]) => S[`${look}F1`] === a && S[`${look}F2`] === b && S[`${look}F3`] === c, "Files"),
          color(`${look}F1`, "File 1"), color(`${look}F2`, "File 2"), color(`${look}F3`, "File 3"),
          num(`${look}Shadow`, "Layer shadows", 0, 3, 0.05)),
        sec({ title: "Paper texture", tab: "Design" }, ["paper", "paperAmt", "paperScale", "paperMottle", "paperFibres", "paperStrands", "paperGrain", "paperSpecks", "paperTooth", "paperSeed"],
          toggle("paper", "On the front"), num("paperAmt", "Strength", 0, 1, 0.01), num("paperScale", "Size", 20, 200, 1),
          sub("Layers"), num("paperMottle", "Blotches", 0, 3, 0.05), num("paperFibres", "Fibre streaks", 0, 3, 0.05), num("paperStrands", "Loose fibres", 0, 3, 0.05),
          num("paperGrain", "Grain", 0, 3, 0.05), num("paperSpecks", "Specks", 0, 3, 0.05), num("paperTooth", "Tooth (emboss)", 0, 3, 0.05), num("paperSeed", "Variation", 1, 20, 1)),
        sec({ title: "Drawer", tab: "Design" }, ["drawerW", "frontH", "baseY", "corner", "depth", "sideH", "backH"],
          sub("Size"), num("drawerW", "Width", 40, 95, 1, "%"), num("frontH", "Front height", 15, 70, 0.5, "%"), num("baseY", "From bottom", 0, 40, 0.5, "%"), num("corner", "Corners", 0, 6, 0.1),
          sub("Inside"), num("depth", "Space behind", 0, 40, 0.5), num("sideH", "Sides", 0.4, 1.1, 0.01, "× front"), num("backH", "Back height", 0.2, 1, 0.01, "× front")),
        sec({ title: "Files", tab: "Design" }, ["count", "divH", "inset", "ink", "hairline", "tabR", "peekC", "stepC"],
          num("count", "How many", 1, 6, 1), num("divH", "Height", 15, 70, 0.5), num("inset", "Side margin", 0, 15, 0.5), num("tabR", "Corners", 0, 4, 0.1),
          color("ink", "Text"), num("hairline", "Edge line", 0, 0.4, 0.01),
          sub("When closed"), num("peekC", "Files show", -15, 20, 0.5), num("stepC", "Step up", 0, 15, 0.5)),
        sec({ title: "Tabs", tab: "Design" }, ["tabShape", "coverTabW", "tabH", "tabShoulder", "earTop", "earFoot", "tabSpread"],
          seg("tabShape", "Shape", [["ear", "Ears"], ["square", "Square"]]),
          num("coverTabW", "Width", 8, 40, 0.5, "%"), num("tabH", "Height", 2, 12, 0.5), num("tabSpread", "Spread across", 0, 100, 1, "%"),
          sub("Ear shape"), num("tabShoulder", "Slope", 0, 8, 0.1), num("earTop", "Top corners", 0, 5, 0.1), num("earFoot", "Hollow at foot", 0, 5, 0.1)),
        sec({ title: "Tab number", tab: "Design" }, ["tabStyle", "numAlign", "numSize", "numWeight", "numTrack", "dotSize", "dotGap", "numPad"],
          seg("tabStyle", "Style", [["index", "● 01"], ["paren", "( 01 )"], ["fraction", "01/03"], ["big", "Big"]]),
          seg("numAlign", "Align", [["left", "Left"], ["centre", "Centre"]]),
          num("numSize", "Size", 1.5, 7, 0.1), num("numWeight", "Weight", 300, 700, 10), num("numTrack", "Letter spacing", -0.1, 0.15, 0.005, "em"),
          num("dotSize", "Dot size", 0, 3, 0.05), num("dotGap", "Dot gap", 0, 3, 0.05), num("numPad", "Left padding", 0, 6, 0.1)),
        // ---- Motion ----
        sec({ title: "Hover the drawer", tab: "Motion" }, ["nudge", "slit", "slitStep", "hoverDur", "handleGrow", "bubble", "bubbleTail", "bubbleTilt", "bubbleGap", "bubbleColor"],
          num("nudge", "Nudges out", 0, 0.4, 0.01), num("slit", "Files peek", 0, 15, 0.5), num("slitStep", "Each behind higher", 0, 5, 0.1),
          num("handleGrow", "Handle thickens", 0, 3, 0.05), num("hoverDur", "Time", 0.1, 1.5, 0.05, "s"),
          sub("Bubble"), toggle("bubble", "Show bubble"),
          seg("bubbleTail", "Tail", [["trail", "Trail"], ["still", "Dots"], ["none", "None"]]),
          num("bubbleTilt", "Tilt", -15, 15, 0.5, "°"), num("bubbleGap", "From the pointer", 0, 10, 0.1),
          choice("bubbleColor", "Colour", [["auto", "Auto"], ["custom", "Custom"]], (v) => { if (v === "auto") set("bubbleColor", "auto"); else if (S.bubbleColor === "auto") set("bubbleColor", "#141414"); redraw(); }),
          S.bubbleColor === "auto" ? null : color("bubbleColor", "Bubble colour")),
        sec({ title: "Open", tab: "Motion" }, ["persp", "vpUp", "slideZ", "slideY", "gapO", "peekO", "openDur", "openEase", "knock", "frontBounce", "closeDur", "closeEase"],
          sub("Where it ends"), num("slideZ", "Comes forward", 0, 60, 0.5), num("slideY", "Moves down", -20, 30, 0.5),
          num("gapO", "File spacing", 0, 25, 0.5), num("peekO", "Files show", -10, 30, 0.5),
          sub("Camera"), num("persp", "Perspective", 40, 600, 5), num("vpUp", "Look from above", -20, 120, 1),
          sub("Timing"), num("openDur", "Open time", 0.1, 2.5, 0.05, "s"), ease("openEase", "Open ease"),
          num("knock", "Hits the stop", 0, 3, 0.05), num("frontBounce", "Front bounces", 0, 4, 0.05),
          num("closeDur", "Close time", 0.1, 2, 0.05, "s"), ease("closeEase", "Close ease")),
        sec({ title: "Hover a file", tab: "Motion" }, ["pull", "sink", "reach", "reachGap", "lastLift", "room", "swing1", "swing2", "swing3", "swingX", "follow", "dropEase", "accentTab", "accent", "liftFill", "liftColor", "wash", "washColor", "pullDur", "pullEase", "bob", "bobTime"],
          sub("Lift"), num("pull", "Lift", 0, 40, 0.5), num("sink", "Others drop", 0, 15, 0.5), num("lastLift", "Back file lifts", 0, 30, 0.5),
          toggle("reach", "Stop below next tab"), num("reachGap", "Gap to that tab", 0, 4, 0.1), toggle("room", "Files behind move up"),
          sub("Swing"), num("swing1", "File 1", -15, 15, 0.5, "°"), num("swing2", "File 2", -15, 15, 0.5, "°"), num("swing3", "File 3", -15, 15, 0.5, "°"),
          num("swingX", "Drifts", 0, 10, 0.1), num("follow", "Leans to mouse", 0, 8, 0.1, "°"), ease("dropEase", "Settles back"),
          sub("Colour"), toggle("accentTab", "Tab turns orange"), color("accent", "Tab colour"), toggle("liftFill", "Highlight the file"), color("liftColor", "Highlight"),
          num("wash", "Others wash", 0, 1, 0.01), color("washColor", "Wash colour"),
          sub("Timing"), hh("div", { class: "row wide" }, hh("label", {}, "Presets"), hh("div", { class: "pi-chips" }, ...FLOATS.map(([name, d, e]) => hh("button", { type: "button", onclick: () => { S.pullEase = e; set("pullDur", d); } }, name)))),
          num("pullDur", "Time", 0.1, 1.5, 0.05, "s"), ease("pullEase", "Ease"),
          num("bob", "Mid-air bob", 0, 5, 0.1, "%"), num("bobTime", "Bob time", 1, 6, 0.1, "s")),
        sec({ title: "Click a file", tab: "Motion" }, ["chooseW", "chooseY", "chooseUp", "chooseDur", "backDur", "chooseShadow"],
          num("chooseW", "Size in front", 50, 100, 1, "%"), num("chooseY", "Rests at", 30, 70, 1, "% down"), num("chooseShadow", "Shadow", 0, 2, 0.05),
          sub("Timing"), num("chooseUp", "Out of drawer", 0.1, 1, 0.01, "s"), num("chooseDur", "To the front", 0.2, 1.5, 0.01, "s"), num("backDur", "Putting back", 0.2, 1.5, 0.01, "s")),
        // ---- Canvas ----
        sec({ title: "Card and page", tab: "Canvas" }, ["pageBg", "ratio", "showCard", "showNeighbours", "stateFrames"],
          color("pageBg", "Page"), num("ratio", "Card height", 0.6, 1.6, 0.01, "×"),
          toggle("showCard", "Card background"), toggle("showNeighbours", "Cards beside it"), toggle("stateFrames", "Every state below")),
      ];
    },
  });
}
