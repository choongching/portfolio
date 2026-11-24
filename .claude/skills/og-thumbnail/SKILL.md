---
name: og-thumbnail
description: The designby.cc link-preview image (public/og-home.png) and its editor. Use when CC wants to change the thumbnail that shows when the site is shared (Google Chat, Slack, iMessage, LinkedIn, X, WhatsApp), adjust its layout, colours or type, check how a shared link looks, add a control to the editor, or when a preview shows the wrong picture.
---

# Link-preview thumbnail (og-home.png) and its editor

One 1200×630 image for every page: `public/og-home.png`. `/` and `/resume` both point at it
(`og:image`, `twitter:image`, JSON-LD `image`). There is no separate resume image (CC,
2026-11-24: "we don't need it at all").

**Keep the editor.** CC asked for it to stay in the repo: it's how the thumbnail gets changed.
Don't delete `docs/og/` or replace the editor with hand-edited values.

## Files (`docs/og/`)

| File | Role |
|---|---|
| `og-design.js` | **The settings** (`window.OG_DESIGN`): every value, px at 1200×630. The only file a design change touches. |
| `og-render.js` | Draws the design from the settings. Shared by the build and the editor, so they always match. Also holds the font list (`OG_FONTS`) and type defaults. |
| `og.html` | The build page: loads the two files above. |
| `build.sh` | `pnpm og:images`: headless Chrome screenshots `og.html` into `public/og-home.png`. |
| `editor.html` | The editor (below). |
| `editor-server.mjs` | `pnpm og:edit`: serves the repo on `127.0.0.1:5178` and opens the editor. `POST /save` writes `og-design.js` and runs `build.sh`. No dependencies. |

## The design (CC's pick, direction 128, tuned by CC in the editor)

The line "Zero-to-one product designer for AI products and enterprise teams" in a tile, then
two "C"s drawn as tiles with a horizontal cut line, inside a frame. Greys, calm and muted.
The wordmark "designby.cc" sits bottom left of the line tile. The current values are in
`og-design.js`; read them there, don't restate them in docs.

How it got here (so nobody re-proposes rejected ideas): many directions on a local board
(stickers, objects between words, giant "cc", bold type, the favicon stagger). CC disliked the
orange ("too Anthropic"), the object/clip-art accents and the pixel squares, and loved the big
block letters (LOBO poster, modular ABCDEF block alphabet), then the slit-tile "CC", the
frame within a frame, and muted greys.

## Editing: `pnpm og:edit`

- **Edit mode:** click a part on the canvas or in Layers (frame, line tile, line text,
  wordmark, first C, its cut line, second C, its cut line). Blue handles: margins and the two
  dividers (frame), corner radii and width (tiles; Alt = all four corners), cut-line move, start,
  end and thickness, the line's right padding. Red labels show margins and gaps in px.
- **Inspector:** every value has its own control. Tiles: fill, width share, four radii (linked or
  separate). Cut lines: colour, height, start, open to the edge or a set end, thickness, end
  rounding. Line and wordmark: text, colours, font (repo, Google Fonts, system), size, weight
  (100–1000), italic, letter spacing, kerning, line spacing, word spacing, case, align, line
  breaks, ligatures, OpenType features, variable axes, opacity, anchor and padding.
- **Preview mode:** the thumbnail inside Google Chat, Slack, iMessage, LinkedIn, X and WhatsApp
  cards plus a Google result, with the real page title, share title, description, site name and
  URL read from `designbycc-landing/index.html` and `public/resume.html`, and character counts
  against the `seo-sweep` ranges. The mock-ups are approximations for judging size and contrast.
- Undo/redo, hold to compare with the last save, Revert, ⌘S Save. Drafts survive a reload
  (localStorage). Opened as a plain file, Save copies the settings instead of writing them.

## Adding a control

1. `og-render.js`: read the new key with a default (`{ ...defaults, ...D.part }`) so older
   `og-design.js` files keep working, and draw it.
2. `editor.html`: add it to the part's section in `inspector()` (`num`, `choice`, `toggleCtl`,
   `textCtl`, `colour`, `quad` builders), and a handle in `overlay()` if it should be draggable.
3. Save once from the editor so `og-design.js` carries the key.

## Checks before shipping

- `file public/og-home.png` → `PNG image data, 1200 x 630`. **Look at the image.**
- `og:image:alt` on both pages matches the image's text (no em dashes).
- System fonts (SF Pro, Helvetica Neue) only render on a Mac; Google Fonts need a connection
  at build time. The PNG is committed, so CI never renders it.
- Chat apps cache previews: existing shares keep the old image for a while; new shares get it.

## Why previews showed Trustana

Google Chat used the `Organization` (Trustana, `alumniOf`) inside the `Person` JSON-LD as the
page picture. The Person blocks carry no company entity and name `og-home.png` as `image`. Keep
it that way (`seo-sweep` checks it).
