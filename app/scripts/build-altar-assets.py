"""Build the app's copy of the website's altar artwork.

The website's originals in ../assets/altar are ~86 MB of full-size PNGs. The
app bundles small WebP copies instead (same folder layout, .webp extension) so
the altar works offline and Expo Go / EAS Update downloads stay small, and
writes src/lib/altar/assetManifest.ts mapping each website path to its copy.

An over-the-air update may carry at most 1000 files, so each herb's and each
crystal's forms (sprig, loose, oil...; chips, point, cluster, tumbled), and
each potted plant's stages (young, established, lush), are packed side by
side onto one sheet per item, assets/altar/sheets/<herbs|crystals|plants>/
<id>.webp, at the same scale as the single copies. The manifest
records each form's pixel rect on its sheet; lib/altar/assets.ts altarPicture()
and components/altar/AltarImage.tsx show just that rect. Everything else stays
one file per picture. Rerun it when new pictures land: it packs whatever is
there and clears away copies it no longer writes.

Run from app/:  python3 scripts/build-altar-assets.py   (needs Pillow)
(tests/altar-sheets.test.ts imports it to try packed_group and shelf_layout.)
"""
import itertools
import os
import re
from pathlib import Path

from PIL import Image

APP = Path(__file__).resolve().parent.parent
SRC = APP.parent / "assets" / "altar"
OUT = APP / "assets" / "altar"
SHEETS = OUT / "sheets"
MANIFEST = APP / "src" / "lib" / "altar" / "assetManifest.ts"

# The 13 MB pentagram cloth and wooden-altar2 are not offered by the website's
# cabinet; saves that use them fall back to the website URL.
SKIP = {"objects/cloths/black-pentagram.png", "wooden-altar2.png"}

# objects/<category>/<id>/<prefix>-<form>.png is packed onto that item's sheet.
# The prefix is usually the id (bay-leaf's pictures are bay-sprig.png and so on).
PACKED_FORMS = {
    "herbs": ("sprig", "loose", "oil", "powder"),
    "crystals": ("chips", "point", "cluster", "tumbled"),
    "plants": ("young", "established", "lush"),
}
# Transparent pixels between cells, so filtering at a cell's edge never picks up its neighbour.
PAD = 8
# Keep sheets within every phone's largest texture.
MAX_SIDE = 4096


def packed_group(rel):
    """(category, id, form) when this picture goes on an item's sheet, else None."""
    parts = rel.split("/")
    if len(parts) != 4 or parts[0] != "objects" or parts[1] not in PACKED_FORMS:
        return None
    m = re.match(r"^[a-z0-9-]+-([a-z]+)\.png$", parts[3], re.I)
    if not m or m.group(1).lower() not in PACKED_FORMS[parts[1]]:
        return None
    return parts[1], parts[2], m.group(1).lower()


def shelf_layout(sizes):
    """Cells for pictures of these sizes: every ordering, cut into shelves
    (rows, tops aligned), the smallest sheet wins (then the squarest).
    Returns (sheet width, sheet height, [(x, y)] in the order given)."""
    n = len(sizes)
    best = None
    for order in itertools.permutations(range(n)):
        for cuts in itertools.product((False, True), repeat=n - 1):
            places = [None] * n
            x = y = row_h = sheet_w = 0
            for k, i in enumerate(order):
                if k > 0 and cuts[k - 1]:
                    y += row_h + PAD
                    x = row_h = 0
                w, h = sizes[i]
                places[i] = (x, y)
                x += w + PAD
                row_h = max(row_h, h)
                sheet_w = max(sheet_w, x - PAD)
            sheet_h = y + row_h
            if max(sheet_w, sheet_h) > MAX_SIDE:
                continue
            key = (sheet_w * sheet_h, max(sheet_w, sheet_h), order, cuts)
            if best is None or key < best[0]:
                best = (key, sheet_w, sheet_h, places)
    return best[1], best[2], best[3]


def shrink(path, limit):
    image = Image.open(path)
    original_size = image.size
    image.thumbnail((limit, limit), Image.LANCZOS)
    return image, original_size


def main():
    entries = []  # (website path, app file, original size, crop or None)
    groups = {}  # (category, id) -> [(form, rel, path)]
    written = set()
    for path in sorted(SRC.rglob("*")):
        if not path.is_file() or path.suffix.lower() != ".png":
            continue
        rel = path.relative_to(SRC).as_posix()
        if rel in SKIP:
            continue
        group = packed_group(rel)
        if group:
            groups.setdefault(group[:2], []).append((group[2], rel, path))
            continue
        is_background = rel.startswith("backgrounds/")
        # Objects at 1024px stay sharp on 3x screens, even zoomed in on the altar.
        image, original_size = shrink(path, 1600 if is_background else 1024)
        target = OUT / Path(rel).with_suffix(".webp")
        target.parent.mkdir(parents=True, exist_ok=True)
        if is_background:
            image.convert("RGB").save(target, "WEBP", quality=78, method=4)
        else:
            image.save(target, "WEBP", quality=85, method=4)
        written.add(target)
        entries.append((f"assets/altar/{rel}", target.relative_to(APP).as_posix(), original_size, None))

    for (category, item), pictures in sorted(groups.items()):
        order = PACKED_FORMS[category]
        pictures.sort(key=lambda p: (order.index(p[0]), p[1]))
        images = [shrink(path, 1024) for _, _, path in pictures]
        sheet_w, sheet_h, places = shelf_layout([image.size for image, _ in images])
        sheet = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
        target = SHEETS / category / f"{item}.webp"
        target.parent.mkdir(parents=True, exist_ok=True)
        local = target.relative_to(APP).as_posix()
        for (form, rel, _), (image, original_size), (x, y) in zip(pictures, images, places):
            sheet.paste(image.convert("RGBA"), (x, y))
            crop = (x, y, image.size[0], image.size[1], sheet_w, sheet_h)
            entries.append((f"assets/altar/{rel}", local, original_size, crop))
        sheet.save(target, "WEBP", quality=85, method=4)
        written.add(target)

    # Copies from an earlier run that are no longer made (now on a sheet, or gone from the website).
    for stale in OUT.rglob("*.webp"):
        if stale not in written:
            stale.unlink()
    for folder in sorted((p for p in OUT.rglob("*") if p.is_dir()), key=lambda p: -len(p.parts)):
        if not any(folder.iterdir()):
            folder.rmdir()

    entries.sort(key=lambda e: e[0])
    files = sorted({local for _, local, _, _ in entries})
    ids = {local: f"f{i}" for i, local in enumerate(files)}

    lines = [
        "// Generated by scripts/build-altar-assets.py. Do not edit by hand.",
        "// Website asset path (as saved in altar JSON, without ../ or leading /) to",
        "// the app's bundled WebP copy and the website original's pixel size (the",
        "// website sizes each object box from the image's natural aspect ratio).",
        "// Herbs' and crystals' forms, and potted plants' stages, share a sheet per",
        "// item: `crop` is the picture's pixel rect on it and the sheet's size",
        "// (show it with lib/altar/assets altarPicture and AltarImage, never the",
        "// bare source).",
        "",
        "export type BundledAltarCrop = { x: number; y: number; w: number; h: number; sheetW: number; sheetH: number };",
        "",
    ]
    for local in files:
        lines.append(f"const {ids[local]} = require('../../../{local}');")
    lines += [
        "",
        "export const bundledAltarAssets: Record<string, { source: number; width: number; height: number; crop?: BundledAltarCrop }> = {",
    ]
    for web, local, (w, h), crop in entries:
        extra = ""
        if crop:
            x, y, cw, ch, sw, sh = crop
            extra = f", crop: {{ x: {x}, y: {y}, w: {cw}, h: {ch}, sheetW: {sw}, sheetH: {sh} }}"
        lines.append(f"  '{web}': {{ source: {ids[local]}, width: {w}, height: {h}{extra} }},")
    lines += ["};", ""]
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text("\n".join(lines))
    total = sum(os.path.getsize(APP / local) for local in files)
    print(f"{len(entries)} pictures in {len(files)} files ({len(groups)} sheets), {total / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
