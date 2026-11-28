/* The studio's Folder tab: the "Case studies" card (designbycc-landing/case-folder.js, also on the site)
   on its own canvas, with dials to preview changes; CC's chosen values are FOLDER_DEFAULTS there.
   A folder with paper case study sheets inside and a frosted glass front. CC's flow (2026-11-26):
   closed neatly at rest; a click opens it and the papers float up into the air, peeking out (not
   hover: CC changed it); the paper under the pointer lifts higher, as if someone pulled it up; a click
   on the folder or anywhere else closes it.
   Depth without preserve-3d: every layer gets its own perspective() with the same vanishing point, so
   the layers stack in DOM order and the glass front can blur what's behind it (backdrop-filter).
   Sizes are in u = 1% of the card's width, so the desktop and phone cards share one set of dials.
   Settings live in this browser only (localStorage "studio-folder-5"). */
import { FOLDER_DEFAULTS, FOLDER_CSS, createFolderCard } from "/case-folder.js";

import { createProtoTab } from "./proto.js";

const COLORS = [["Purple", "#7b68d9"], ["Blue", "#4a8fe7"], ["Ink", "#2a2a2a"], ["Orange", "#f06a2a"], ["Sage", "#7fa58a"]];
const CARDS = [["White", "#ffffff", "#f2f2f2"], ["Black", "#141414", "#f2f2f2"], ["Lilac", "#eeecf8", "#f2f2f2"]];

export function createFolder({ canvas, onZoom }) {
  // keep CC's earlier settings, but start the opening's timing from the snappier defaults (2026-11-26)
  const SNAP = ["ajarDur", "ajarEase", "closerDur", "closerEase", "floatDur", "floatEase", "paperDelay", "closeDur", "closeEase", "stagger"];
  const before = JSON.parse(localStorage.getItem("studio-folder-4") || "{}"); SNAP.forEach((k) => delete before[k]);
  return createProtoTab({
    canvas, onZoom, id: "folder", css: FOLDER_CSS,
    title: "Case studies folder",
    about: "The Case studies card on the site. The dials preview changes here only (in this browser); the site uses the saved defaults. The case study names are placeholders.",
    hint: "Click the folder to open it · hover a paper · click the folder or outside to close · the phone card is to the right: drag or scroll to it · ⌘ + scroll to zoom",
    defaults: FOLDER_DEFAULTS, initial: before, storeKey: "studio-folder-5", saveTab: "folder",
    createCard: createFolderCard,
    states: [
      ["live", "Live", "Hover and click as on the site"],
      ["closed", "Closed", "At rest"],
      ["open", "Open", "After a click: the papers peek out"],
      ...[1, 2, 3, 4, 5, 6].map((c) => [`pull${c}`, `Case study ${c} lifted`, "Hovering that paper"]),
    ],
    stateOf: (id) => (id === "closed" ? {} : id === "open" ? { open: true } : { open: true, pulled: +id.slice(4) }),
    playSteps: (S) => [[{ open: true }, 1.6], ...[...Array(S.count).keys()].map((i) => [{ open: true, pulled: i + 1 }, 1.2]), [{ open: true }, 1], [{}, 1]],
    sections: ({ S, set, num, color, ease, toggle, swatches, sec, h }) => [
      sec("Folder", ["color", "folderW", "bodyH", "baseY", "tabW", "tabH", "corner"],
        swatches(COLORS, ([c]) => set("color", c), ([c]) => S.color === c),
        color("color", "Colour"), num("folderW", "Width", 40, 95, 1, "%"), num("bodyH", "Height", 30, 80, 1, "%"),
        num("baseY", "From bottom", 0, 40, 1, "%"), num("tabW", "Tab width", 15, 60, 1, "%"), num("tabH", "Tab height", 2, 14, 0.5), num("corner", "Corners", 0, 12, 0.5)),
      sec("Glass front", ["frontH", "glass", "frost", "sheen", "title"],
        num("frontH", "Height", 30, 100, 1, "%"), num("glass", "Tint", 0.2, 1, 0.01), num("frost", "Frost", 0, 40, 1, "px"), num("sheen", "Top light", 0, 1, 0.01),
        h("div", { class: "chips" }, toggle("title", "Title"))),
      sec("Papers", ["count", "sheetColor", "sheetH", "inset"],
        num("count", "How many", 1, 6, 1), color("sheetColor", "Colour"), num("sheetH", "Height", 10, 50, 0.5), num("inset", "Side margin", 0, 15, 0.5)),
      sec("Closed", ["peekC", "stepC"],
        num("peekC", "Papers show", -15, 20, 0.5), num("stepC", "Step", 0, 15, 0.5)),
      sec({ title: "Click: the folder opens", tab: "Motion" }, ["tilt", "backTilt", "ajarDur", "ajarEase", "closeDur", "closeEase"],
        num("tilt", "Front tips", 0, 40, 0.5, "°"), num("backTilt", "Back tips", -20, 20, 0.5, "°"),
        num("ajarDur", "Open time", 0.1, 2.5, 0.05, "s"), ease("ajarEase", "Open ease"), num("closeDur", "Close time", 0.1, 2, 0.05, "s"), ease("closeEase", "Close ease")),
      sec("Depth and shadow", ["persp", "vp", "shadow", "contact", "shadowShift"],
        num("persp", "Perspective", 60, 600, 5), num("vp", "Look from", -200, 50, 1, "%"),
        num("shadow", "Soft shadow", 0, 0.5, 0.01), num("contact", "Contact shadow", 0, 0.8, 0.01), num("shadowShift", "Moves with mouse", 0, 10, 0.1)),
      sec({ title: "Mouse over and press", tab: "Motion" }, ["hoverLift", "hoverScale", "hoverDur", "tiltHover", "tiltPress", "pressScale"],
        num("hoverLift", "Lifts on hover", 0, 8, 0.1), num("hoverScale", "Grows on hover", 1, 1.08, 0.005, "×"), num("hoverDur", "Hover time", 0.1, 1.5, 0.05, "s"),
        num("tiltHover", "Tilt on hover", 0, 15, 0.5, "°"), num("tiltPress", "Tilt on press", 0, 20, 0.5, "°"), num("pressScale", "Press sinks to", 0.9, 1, 0.005, "×")),
      sec({ title: "…and comes closer to you", tab: "Motion" }, ["closer", "closerY", "closerTilt", "closerDur", "closerEase"],
        num("closer", "How close", 1, 1.3, 0.005, "×"), num("closerY", "Rises", -10, 15, 0.5), num("closerTilt", "Tips to you", -10, 15, 0.5, "°"),
        num("closerDur", "Time", 0.2, 4, 0.05, "s"), ease("closerEase", "Ease")),
      sec({ title: "…and the papers float up", tab: "Motion" }, ["rise", "step", "fanZ", "float", "floatTime", "floatDur", "floatEase", "paperDelay", "stagger"],
        num("rise", "Float up", 0, 50, 0.5), num("step", "Gap between", 0, 25, 0.5), num("fanZ", "Depth between", 0, 20, 0.5),
        num("float", "Mid-air bob", 0, 3, 0.1), num("floatTime", "Bob time", 1, 6, 0.1, "s"),
        num("floatDur", "Float time", 0.1, 2, 0.05, "s"), ease("floatEase", "Float ease"), num("paperDelay", "Start after", 0, 1, 0.05, "s"),
        num("stagger", "Stagger", 0, 0.3, 0.01, "s")),
      sec({ title: "Hover a paper: it lifts higher", tab: "Motion" }, ["pull", "wash", "washColor", "pullZ", "sink", "room", "twist", "tiltMax", "tiltBack", "pullDur", "pullEase"],
        num("pull", "Lift", 0, 50, 0.5), num("wash", "Others wash", 0, 1, 0.01), color("washColor", "Wash colour"), num("pullZ", "Comes forward", -20, 30, 0.5), num("sink", "Others drop", 0, 20, 0.5),
        h("div", { class: "chips" }, toggle("room", "Papers behind move up too")),
        num("twist", "Tip to the side", 0, 10, 0.1, "°"), num("tiltMax", "Follow the mouse", 0, 20, 0.5, "°"), ease("tiltBack", "Spring back"),
        num("pullDur", "Time", 0.1, 1.5, 0.05, "s"), ease("pullEase", "Ease")),
      sec({ title: "Card and page", tab: "Canvas" }, ["cardBg", "pageBg", "ratio", "radius", "showCard", "showNeighbours", "spill"],
        swatches(CARDS, ([c, p]) => { S.pageBg = p; set("cardBg", c); }, ([c]) => S.cardBg === c),
        color("cardBg", "Card"), color("pageBg", "Page"), num("ratio", "Height", 0.6, 1.6, 0.01, "× width"), num("radius", "Corners", 0, 8, 0.1),
        h("div", { class: "chips" }, toggle("showCard", "Card background"), toggle("showNeighbours", "Cards beside it"), toggle("spill", "Open past the card's edge"))),
    ],
  });
}
