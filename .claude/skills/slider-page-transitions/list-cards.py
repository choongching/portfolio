"""List the landing slider's cards in order, per tree, with a label and click target.
Usage (repo root): python3 .claude/skills/slider-page-transitions/list-cards.py [--mobile]"""
import re, sys
TREE = "c-slider-responsive" if "--mobile" in sys.argv else "c-slider"
L = open("designbycc-landing/index.html").read().split("\n")
starts = [i for i, l in enumerate(L) if re.search(rf'class="{TREE}__slide \| js-{TREE}__slide"', l)]
MARKERS = [("c-intro", "Intro card"), ("trustana-poster", "Trustana montage video"),
           ("js-a-lissajous", "Lissajous CC (live SVG)"), ("js-a-pipeline", "Pipeline bottleneck (live SVG)"),
           ("js-a-spiral", "LinkedIn spiral (live SVG)"), ("js-a-clock", "Clock")]
def block_end(i):
    # The slide's own closing </div>, by nesting depth (a fixed line count ran
    # past the last slide into the page layers and mislabelled it, 2026-10-12).
    depth = 0
    for j in range(i, len(L)):
        depth += len(re.findall(r"<div\b", L[j])) - len(re.findall(r"</div>", L[j]))
        if depth <= 0: return j + 1
    return len(L)
for k, i in enumerate(starts):
    if L[i].rstrip().endswith("></div>"):
        print(f"{k:>2}  (spacer)"); continue
    blk = "\n".join(L[i:block_end(i)])
    label = next((name for key, name in MARKERS if key in blk), None)
    clock = re.search(r'o-font-h2">([A-Z ]+)<', blk)
    if label == "Clock" and clock: label = f"{clock[1].title()} clock"
    text = re.search(r'<(?:h1|h3)[^>]*>([^<]{3,})<|a-content-h4">([^<]{3,})<|<h2 class="a-text__text[^>]*>([^<]{3,})<', blk)
    if not label: label = next(t for t in text.groups() if t).strip()[:60] if text else "(no title)"
    href = re.search(r'<a [^>]*href="([^"]+)"', blk)
    print(f"{k:>2}  {label:<62} {href[1] if href else '(inert, no href)'}")
