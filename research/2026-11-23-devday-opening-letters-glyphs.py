"""Extract the wordmark's glyphs from Switzer for the opening lab.

Instances the variable font at the wordmark's weights (400 for "designby", 700 for "cc"),
shapes each run with HarfBuzz (kerning included), and writes per glyph: its x position,
its outline as an SVG path, and its on-curve points (what a font editor shows as nodes).
Units are font units (1000 per em), y flipped so the baseline is y = 0 and up is negative.
CSS letter-spacing (0.02em on the site's wordmark) is added after every glyph, as browsers do.
Usage: python glyphs.py <font.woff2> <out.json>
"""
import io
import json
import sys

import uharfbuzz as hb
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SRC, OUT = sys.argv[1], sys.argv[2]
RUNS = [("designby", 400), ("cc", 700)]
TRACKING = 20  # 0.02em in font units

def instance(weight):
    font = TTFont(SRC)
    inst = instantiateVariableFont(font, {"wght": weight})
    buf = io.BytesIO()
    inst.flavor = None
    inst.save(buf)
    return inst, buf.getvalue()

glyphs, pen_x = [], 0
for text, weight in RUNS:
    font, data = instance(weight)
    gs = font.getGlyphSet()
    hb_font = hb.Font(hb.Face(data))
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hb_font, buf, {"kern": True, "liga": False})
    order = font.getGlyphOrder()
    for info, pos, ch in zip(buf.glyph_infos, buf.glyph_positions, text):
        name = order[info.codepoint]
        flip = (1, 0, 0, -1, 0, 0)
        svg = SVGPathPen(gs)
        gs[name].draw(TransformPen(svg, flip))
        rec = RecordingPen()
        gs[name].draw(TransformPen(rec, flip))
        points, contours = [], 0
        for op, args in rec.value:
            if op == "moveTo":
                contours += 1
                points.append(args[0])
            elif op in ("lineTo", "qCurveTo", "curveTo") and args and args[-1] is not None:
                points.append(args[-1])
        # drop the closing point when it repeats the contour's start
        uniq = []
        for p in points:
            p = (round(p[0]), round(p[1]))
            if p not in uniq:
                uniq.append(p)
        glyphs.append({
            "ch": ch, "weight": weight, "x": pen_x + pos.x_offset,
            "adv": pos.x_advance, "d": svg.getCommands(), "points": uniq, "contours": contours,
        })
        pen_x += pos.x_advance + TRACKING

json.dump({"upem": 1000, "ascent": 980, "descent": -250, "cap": 750, "xHeight": 531,
           "width": pen_x - TRACKING, "glyphs": glyphs}, open(OUT, "w"))
print(f"{len(glyphs)} glyphs, width {pen_x - TRACKING} units,",
      ", ".join(f"{g['ch']}:{len(g['points'])}pts/{g['contours']}c" for g in glyphs))
