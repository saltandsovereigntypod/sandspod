"""Find where the wick is in each candle form's picture, so the flame and the
snuffed smoke sit on it. Every colour of a form is painted from the same
picture, so one colour (red) stands for the form. The vigil candles are the
website's originals and keep the website's fixed flame, so they are left out.

Writes ../assets/altar/objects/candles/wicks.json: { "<form>": [x, y] }, the
wick's tip as fractions of the picture's width and height. Read by
scripts/build-altar-artwork.mjs.

Run from app/:  python3 scripts/find-candle-wicks.py   (needs Pillow, numpy, scipy)
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

APP = Path(__file__).resolve().parent.parent
CANDLES = APP.parent / "assets" / "altar" / "objects" / "candles"
OUT = CANDLES / "wicks.json"


def wick_tip(path):
    a = np.asarray(Image.open(path).convert("RGBA")).astype(float)
    rgb, alpha = a[..., :3], a[..., 3]
    h, w = alpha.shape
    ys, xs = np.where(alpha > 200)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    cx, width = (x0 + x1) / 2, x1 - x0
    lum = rgb @ [0.299, 0.587, 0.114]
    top, low = rgb.max(-1), rgb.min(-1)
    sat = np.where(top > 0, (top - low) / np.maximum(top, 1), 0)
    # The wick: a dark, greyish stroke near the middle of the candle's upper part.
    dark = (alpha > 200) & (lum < 70) & (sat < 0.45)
    band = np.zeros_like(dark)
    band[:, int(cx - 0.12 * width) : int(cx + 0.12 * width) + 1] = True
    dark &= band
    dark[int(y0 + 0.6 * (y1 - y0)) :] = False
    labels, n = ndimage.label(dark)
    if not n:
        return None
    sizes = ndimage.sum(dark, labels, range(1, n + 1))
    best = int(np.argmax(sizes)) + 1
    wy, wx = np.where(labels == best)
    tip = wy.min()
    x = wx[wy <= tip + max(3, (wy.max() - tip) * 0.15)].mean()
    return [round(float(x / w), 4), round(float(tip / h), 4)]


wicks = {}
for folder in sorted(p for p in CANDLES.iterdir() if p.is_dir()):
    sample = folder / f"red-{folder.name}.png"
    if not sample.exists():
        continue
    tip = wick_tip(sample)
    if tip:
        wicks[folder.name] = tip
    else:
        print(f"No wick found in {sample}")

OUT.write_text(json.dumps(wicks, indent=2) + "\n")
print(f"Candle wicks: {wicks}")
