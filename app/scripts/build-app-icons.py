"""Build every app icon from the Salt & Sovereignty podcast artwork.

Source: assets/brand/icon-source.png, the circular artwork on a charcoal
square. Writes the iPhone icon, Android adaptive icon layers, splash image,
favicon and the web app's home-screen icons.

Run from app/:  python3 scripts/build-app-icons.py [path/to/new-source.png]
(needs Pillow). Passing a path first replaces the stored source.
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageOps

APP = Path(__file__).resolve().parent.parent
ASSETS = APP / "assets"
PUBLIC = APP / "public"
SOURCE = ASSETS / "brand" / "icon-source.png"

# The square around the circle, and the near-black at the circle's rim, used
# to fill behind the Android icon so the circle's edge disappears into it.
SQUARE = (28, 26, 24)
RIM = (11, 11, 9)


def find_circle(img: Image.Image) -> tuple[int, int, int, int]:
    """Bounding box of the artwork's circle: everything not the square's colour."""
    diff = ImageChops.difference(img.convert("RGB"), Image.new("RGB", img.size, SQUARE))
    mask = diff.convert("L").point(lambda v: 255 if v > 10 else 0)
    box = mask.getbbox()
    if not box:
        raise SystemExit("Couldn't find the circle in the source image.")
    return box


def flat(img: Image.Image, size: int) -> Image.Image:
    """The whole square artwork, no transparency (iOS rejects alpha in icons)."""
    base = Image.new("RGB", img.size, SQUARE)
    base.paste(img, mask=img.getchannel("A") if img.mode == "RGBA" else None)
    return base.resize((size, size), Image.LANCZOS)


def circle_only(img: Image.Image, box: tuple[int, int, int, int], diameter: int) -> Image.Image:
    """The circle cut out on transparency, `diameter` pixels across."""
    crop = img.convert("RGBA").crop(box).resize((diameter, diameter), Image.LANCZOS)
    # Draw the mask large and shrink it for a smooth edge, inset a hair so no
    # charcoal from the square shows round the rim.
    big = diameter * 4
    mask = Image.new("L", (big, big), 0)
    ImageDraw.Draw(mask).ellipse((6, 6, big - 7, big - 7), fill=255)
    crop.putalpha(ImageChops.multiply(crop.getchannel("A"), mask.resize((diameter, diameter), Image.LANCZOS)))
    return crop


def centred(layer: Image.Image, size: int, fill=(0, 0, 0, 0)) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), fill)
    offset = (size - layer.width) // 2
    canvas.alpha_composite(layer, (offset, offset))
    return canvas


def main() -> None:
    if len(sys.argv) > 1:
        SOURCE.parent.mkdir(parents=True, exist_ok=True)
        src = Image.open(sys.argv[1]).convert("RGBA")
        if src.width > 2048:
            src = src.resize((2048, 2048), Image.LANCZOS)
        src.save(SOURCE, optimize=True)
    img = Image.open(SOURCE).convert("RGBA")
    box = find_circle(img)

    # iPhone: 1024 square; iOS rounds the corners itself.
    flat(img, 1024).save(ASSETS / "icon.png", optimize=True)

    # Android adaptive icon: 1024 canvas, launchers mask it to their own shape
    # and only promise the middle 66% is shown, so the circle sits inside that.
    android = 1024
    circle = circle_only(img, box, round(android * 0.64))
    centred(circle, android).save(ASSETS / "android-icon-foreground.png", optimize=True)
    Image.new("RGB", (android, android), RIM).save(ASSETS / "android-icon-background.png", optimize=True)
    # Themed (single colour) icon: the light in the artwork, the doorway and
    # lettering, as white on transparency.
    glow = ImageOps.autocontrast(circle.convert("L"), cutoff=2).point(lambda v: 0 if v < 70 else min(255, (v - 70) * 2))
    mono = Image.new("RGBA", circle.size, (255, 255, 255, 0))
    mono.putalpha(ImageChops.multiply(glow, circle.getchannel("A")))
    centred(mono, android).save(ASSETS / "android-icon-monochrome.png", optimize=True)

    # Splash: the circle alone on the app's own background (app.json).
    centred(circle_only(img, box, 1024), 1024).save(ASSETS / "splash-icon.png", optimize=True)

    # Web: favicon and the installable web app's icons (public/manifest.json).
    flat(img, 48).save(ASSETS / "favicon.png", optimize=True)
    for name, size in (("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)):
        flat(img, size).save(PUBLIC / name, optimize=True)

    print("circle", box, "-> icons written")


if __name__ == "__main__":
    main()
