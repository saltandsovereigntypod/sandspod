"""WebP copies of the altar's object pictures, for the website to show.

The originals in assets/altar/objects/** (and the candle-dressing overlays in
assets/altar/overlays/) are full-size PNGs, about 1.3 MB each. Saved altars,
the app and every lookup keep the .png path; the website shows these instead
(js/sanctuary-asset-catalog.js displayPath and thumbnailPath):

  <name>.webp        on the altar. An object is drawn at most 240 CSS px
                     (80px box, scale up to 3; 256px in "Look closer"), so
                     the long edge is about 768px: three times that, for
                     3x phone screens. The altar cloth can be scaled to 18x
                     and keeps 2400px.
  <name>.thumb.webp  in the cabinet and pickers (tiles at most 88 CSS px),
                     long edge about 264px.

The size keeps the original's exact aspect ratio where a whole-number size
near the target allows it (the flame and the app's geometry use the ratio).
Alpha is kept losslessly (alpha_quality 100). Colour starts at quality 90 and
each copy is checked against the original drawn as the altar draws it, over
black and over white: if SSIM falls below 0.99 at the copy's display size or
below 0.98 at twice that, it is made again at quality 95, then lossless.

Run from the repo root:  python3 scripts/build-altar-object-webp.py [--force] [--report out.tsv]
(needs Pillow with WebP, and numpy). Without --force it only makes copies
that are missing. tests/altar-object-webp.test.js checks every picture has both.
"""
import argparse
import io
import math
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FOLDERS = [ROOT / "assets" / "altar" / "objects", ROOT / "assets" / "altar" / "overlays"]
DISPLAY_EDGE = 768
CLOTH_EDGE = 2400
THUMB_EDGE = 264
QUALITIES = (90, 95, None)  # None: lossless
# (drawn long edge, least SSIM) for each copy: its usual size, then twice that.
CHECKS = {"display": ((240, 0.99), (480, 0.98)), "thumb": ((88, 0.99), (176, 0.98))}


def sized(width, height, edge, slack=1.09):
    """The smallest size of exactly the same shape whose long edge reaches `edge`."""
    longest = max(width, height)
    if longest <= edge:
        return width, height
    g = math.gcd(width, height)
    uw, uh = width // g, height // g
    k = math.ceil(edge / max(uw, uh))
    if k * max(uw, uh) <= edge * slack and k * max(uw, uh) < longest:
        return uw * k, uh * k
    s = edge / longest
    return max(1, round(width * s)), max(1, round(height * s))


def _box(x, r=3):
    """Mean over a (2r+1)^2 window, edges clamped."""
    p = np.pad(x, r, mode="edge")
    c = p.cumsum(0).cumsum(1)
    c = np.pad(c, ((1, 0), (1, 0)))
    n = 2 * r + 1
    return (c[n:, n:] - c[:-n, n:] - c[n:, :-n] + c[:-n, :-n]) / (n * n)


def ssim(a, b):
    a = a.astype(np.float64)
    b = b.astype(np.float64)
    c1, c2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ma, mb = _box(a), _box(b)
    va, vb, cov = _box(a * a) - ma * ma, _box(b * b) - mb * mb, _box(a * b) - ma * mb
    return ((2 * ma * mb + c1) * (2 * cov + c2)) / ((ma * ma + mb * mb + c1) * (va + vb + c2))


def drawn(image, edge):
    w, h = image.size
    s = edge / max(w, h)
    return image.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)


def worst_ssim(original, copy, edge):
    """SSIM of the copy against the original, both drawn `edge` px long, over black and over
    white, across the object and a rim around it (where a halo would show)."""
    o, c = drawn(original, edge), drawn(copy, edge)
    alpha = np.asarray(o)[..., 3]
    mask = _box((alpha > 0).astype(np.float64), 2) > 0
    if not mask.any():
        return 1.0
    scores = []
    for colour in ((0, 0, 0), (255, 255, 255)):
        a, b = Image.new("RGB", o.size, colour), Image.new("RGB", o.size, colour)
        a.paste(o, (0, 0), o)
        b.paste(c, (0, 0), c)
        A, B = np.asarray(a), np.asarray(b)
        score = np.mean([ssim(A[..., k], B[..., k]) for k in range(3)], axis=0)
        scores.append(float(score[mask].mean()))
    return min(scores)


def encode(image, quality):
    out = io.BytesIO()
    if quality is None:
        image.save(out, "WEBP", lossless=True, quality=100, method=6)
    else:
        image.save(out, "WEBP", quality=quality, alpha_quality=100, method=6)
    return out.getvalue()


def make(original, edge, checks):
    """(bytes, quality, scores) of the first quality that passes every check."""
    image = original.resize(sized(*original.size, edge), Image.LANCZOS)
    for quality in QUALITIES:
        data = encode(image, quality)
        copy = Image.open(io.BytesIO(data)).convert("RGBA")
        scores = [worst_ssim(original, copy, min(px, max(image.size))) for px, _ in checks]
        if quality is None or all(s >= least for s, (_, least) in zip(scores, checks)):
            return data, quality, scores


def build(png):
    original = Image.open(png).convert("RGBA")
    edge = CLOTH_EDGE if "/cloths/" in png.as_posix() else DISPLAY_EDGE
    rows = []
    for kind, target, size in (("display", png.with_suffix(".webp"), edge), ("thumb", png.with_name(png.stem + ".thumb.webp"), THUMB_EDGE)):
        data, quality, scores = make(original, size, CHECKS[kind])
        target.write_bytes(data)
        w, h = Image.open(io.BytesIO(data)).size
        rows.append((png.relative_to(ROOT).as_posix(), kind, f"{w}x{h}", "lossless" if quality is None else str(quality), len(data), *(f"{s:.4f}" for s in scores)))
    return png.stat().st_size, rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="remake copies that already exist")
    parser.add_argument("--report", help="write a TSV of each copy's size, quality and SSIM")
    args = parser.parse_args()
    pngs = sorted(p for folder in FOLDERS for p in folder.rglob("*") if p.is_file() and p.suffix.lower() == ".png")
    todo = [p for p in pngs if args.force or not (p.with_suffix(".webp").exists() and p.with_name(p.stem + ".thumb.webp").exists())]
    print(f"{len(pngs)} pictures, {len(todo)} to make", file=sys.stderr)
    report = []
    with ProcessPoolExecutor() as pool:
        for i, (_, rows) in enumerate(pool.map(build, todo, chunksize=4)):
            report.extend(rows)
            if (i + 1) % 50 == 0:
                print(f"  {i + 1}/{len(todo)}", file=sys.stderr)
    if args.report:
        with open(args.report, "w") as f:
            f.write("picture\tcopy\tsize\tquality\tbytes\tssim_1x\tssim_2x\n")
            f.writelines("\t".join(map(str, row)) + "\n" for row in report)


if __name__ == "__main__":
    main()
