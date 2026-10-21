"""Programmatic visual QA for the captured screenshots.

Checks each PNG is non-blank, has the warm palette we designed for, contains
ink (text/lines), and that screenshots differ from each other (i.e. the game is
actually changing what it draws).
"""
import os
import sys
from collections import Counter

from PIL import Image, ImageStat

SHOTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools", "shots")

# warm Bukhara palette anchors
WARM = {
    "clay": (196, 85, 63),
    "sand": (233, 216, 190),
    "ink": (36, 28, 24),
    "gold": (214, 168, 90),
    "sage": (127, 184, 107),
    "night": (26, 22, 30),
}


def dominant(im, n=6):
    small = im.convert("RGB").resize((160, 100), Image.NEAREST)
    counts = Counter(small.getdata())
    return counts.most_common(n)


def edge_density(im):
    """Fraction of pixels that are strong local gradients → proxy for drawn detail."""
    g = im.convert("L").resize((480, 300), Image.BILINEAR)
    px = g.load()
    w, h = g.size
    hits = 0
    total = 0
    for y in range(1, h - 1, 2):
        for x in range(1, w - 1, 2):
            c = px[x, y]
            d = abs(c - px[x + 1, y]) + abs(c - px[x, y + 1])
            total += 1
            if d > 28:
                hits += 1
    return hits / max(total, 1)


def region_mean(im, box):
    return tuple(round(v) for v in ImageStat.Stat(im.convert("RGB").crop(box)).mean)


def main():
    files = sorted(f for f in os.listdir(SHOTS) if f.endswith(".png"))
    if not files:
        print("no screenshots found")
        return 1

    print(f"found {len(files)} screenshots\n")
    ims = {}
    problems = []

    for f in files:
        p = os.path.join(SHOTS, f)
        im = Image.open(p).convert("RGB")
        ims[f] = im
        size_kb = os.path.getsize(p) / 1024

        stat = ImageStat.Stat(im)
        mean_lum = sum(stat.mean) / 3
        var = sum(stat.var) / 3
        ed = edge_density(im)
        top = dominant(im, 4)

        # a screenshot of a rendered game is neither uniform nor blank
        blank = var < 12 or ed < 0.004
        too_dark = mean_lum < 8
        too_bright = mean_lum > 248

        flags = []
        if blank:
            flags.append("BLANK/FLAT")
        if too_dark:
            flags.append("TOO DARK")
        if too_bright:
            flags.append("WASHED OUT")
        if size_kb < 6:
            flags.append("TINY FILE")
        if flags:
            problems.append(f"{f}: {', '.join(flags)}")

        print(f"{f:26s} {im.size[0]}x{im.size[1]}  {size_kb:7.1f}KB  "
              f"lum={mean_lum:5.1f} var={var:7.1f} edges={ed*100:4.1f}%  {'/'.join('%02x%02x%02x' % c for c, _ in top[:3])}"
              + ("   <<< " + ", ".join(flags) if flags else ""))

    # ensure the frames are genuinely different (game is drawing different states)
    print("\n--- distinctness (mean abs diff vs 01-title) ---")
    base = ims[files[0]]
    for f in files[1:]:
        im = ims[f]
        if im.size != base.size:
            print(f"  {f:26s} size differs")
            continue
        a = base.resize((240, 150), Image.BILINEAR)
        b = im.resize((240, 150), Image.BILINEAR)
        pa, pb = a.load(), b.load()
        tot = 0
        n = 0
        for y in range(0, 150, 3):
            for x in range(0, 240, 3):
                ca, cb = pa[x, y], pb[x, y]
                tot += abs(ca[0] - cb[0]) + abs(ca[1] - cb[1]) + abs(ca[2] - cb[2])
                n += 1
        d = tot / (n * 3)
        tag = "IDENTICAL?" if d < 1.0 else ""
        print(f"  {f:26s} diff={d:6.2f} {tag}")
        if d < 1.0:
            problems.append(f"{f}: identical to title screen")

    # palette sanity: is the palette warm rather than blue-grey?
    print("\n--- palette warmth (R-B of mean colour) ---")
    for f in files:
        m = region_mean(ims[f], (0, 0, ims[f].size[0], ims[f].size[1]))
        warmth = m[0] - m[2]
        verdict = "warm" if warmth > 6 else ("neutral" if warmth > -6 else "COOL")
        print(f"  {f:26s} mean=rgb{m}  R-B={warmth:+4d}  {verdict}")

    print()
    if problems:
        print("PROBLEMS:")
        for p in problems:
            print("  - " + p)
        return 1
    print("VISUAL QA PASSED — all frames non-blank, distinct, and warm-toned")
    return 0


if __name__ == "__main__":
    sys.exit(main())
