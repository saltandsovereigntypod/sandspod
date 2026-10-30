(function initializeSanctuaryAssetCatalog(global) {
  const catalogue = Object.freeze({
    backgrounds: Object.freeze([
      { id: "forest-altar", name: "Forest Altar", assetPath: "/assets/altar/backgrounds/forest-scene.png", thumbnailPath: "/assets/altar/backgrounds/thumbs/forest-scene.webp" },
      { id: "deity-shelf-altar", name: "Deity Shelf Altar", assetPath: "/assets/altar/backgrounds/shelf-deity-altar.png", thumbnailPath: "/assets/altar/backgrounds/thumbs/shelf-deity-altar.webp" }
    ]),
    forms: Object.freeze({
      candle: Object.freeze([
        { id: "chime-spell", label: "Chime / Spell Candle", aliases: ["chime", "spell candle"], supportedAsset: true },
        { id: "taper", label: "Taper Candle", aliases: ["taper"], supportedAsset: true },
        { id: "tea-light", label: "Tea Light", aliases: ["tealight", "tea light"], supportedAsset: true },
        { id: "pillar", label: "Pillar Candle", aliases: ["pillar"], supportedAsset: true },
        { id: "vigil", label: "Vigil Candle", aliases: ["seven day", "vigil"], supportedAsset: true }
      ]),
      herb: Object.freeze([
        { id: "loose", label: "Loose", aliases: ["loose herb"] },
        { id: "fresh-sprig", label: "Fresh Sprig", aliases: ["sprig", "fresh"] },
        { id: "bundle", label: "Bundle", aliases: ["herb bundle"], supportedAsset: false },
        { id: "powder", label: "Powder", aliases: ["powdered herb"], supportedAsset: false }
      ]),
      crystal: Object.freeze([
        { id: "tumbled", label: "Tumbled Stone", aliases: ["tumbled"], supportedAsset: false },
        { id: "point", label: "Point", aliases: ["crystal point"] },
        { id: "cluster", label: "Cluster", aliases: ["crystal cluster"] },
        { id: "chips", label: "Chips", aliases: ["crystal chips"] }
      ])
    })
  });
  const unique = (records) => [...new Map(records.map((record) => [record.id, record])).values()];
  // Each background in assets/altar/backgrounds/ has a WebP twin a tenth the
  // size, and a small one in thumbs/ for the pickers. Saved altars keep the
  // .png path (the app reads it); pages show the WebP.
  const BACKGROUND_PNG = /(\/assets\/altar\/backgrounds\/)([\w-]+)\.png$/;
  // Each object picture in assets/altar/objects/ (and the candle-dressing
  // overlays) has two WebP twins beside it, made by
  // scripts/build-altar-object-webp.py: <name>.webp sized for the altar (a
  // twentieth of the PNG) and <name>.thumb.webp for the cabinet and pickers.
  // The .png path stays the object's identity everywhere (saved altars, the
  // app, the flame, lookups): an <img> shown through showImage keeps it in
  // data-asset-path, and assetPath maps a shown src back.
  const OBJECT_PNG = /(assets\/altar\/(?:objects|overlays)\/(?:[\w-]+\/)*[\w-]+)\.png(?=$|[?#])/i;
  const OBJECT_WEBP = /(assets\/altar\/(?:objects|overlays)\/(?:[\w-]+\/)*[\w-]+?)(?:\.thumb)?\.webp(?=$|[?#])/;
  // The two originals whose extension is in capitals.
  const UPPERCASE_PNG = new Set(["assets/altar/objects/candles/black-candle", "assets/altar/objects/candles/white-candle"]);
  const displayPath = (path) => String(path || "").replace(BACKGROUND_PNG, "$1$2.webp").replace(OBJECT_PNG, "$1.webp");
  const thumbnailPath = (path) => String(path || "").replace(BACKGROUND_PNG, "$1thumbs/$2.webp").replace(OBJECT_PNG, "$1.thumb.webp");
  const assetPath = (src) => String(src || "").replace(OBJECT_WEBP, (whole, base) => `${base}${UPPERCASE_PNG.has(base) ? ".PNG" : ".png"}`);
  /** Show an object picture's WebP twin in `img`, keeping its own path as data-asset-path. */
  const showImage = (img, path, { thumbnail = false } = {}) => {
    const value = String(path || "");
    const shown = thumbnail ? thumbnailPath(value) : displayPath(value);
    if (shown !== value) img.dataset.assetPath = value;
    else delete img.dataset.assetPath;
    img.src = shown;
    return img;
  };
  /** The picture's own path (the .png), whichever copy the <img> shows. */
  const imagePath = (img) => (img ? img.dataset?.assetPath || assetPath(img.getAttribute?.("src") || "") : "");
  // Should a twin ever be missing, show the original instead.
  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("error", (event) => {
      const img = event.target;
      if (!img || img.tagName !== "IMG" || img.dataset.webpFallback) return;
      const src = img.getAttribute("src") || "";
      if (assetPath(src) === src) return;
      const original = img.dataset.assetPath || assetPath(src);
      img.dataset.webpFallback = "true";
      img.src = original;
      // Handled: only the original failing too is an error for the page's own handlers.
      event.stopImmediatePropagation();
    }, true);
  }
  const api = {
    // The originals, then the painted backgrounds listed in js/altar-artwork.js.
    getBackgrounds: () => unique([
      ...catalogue.backgrounds,
      ...((typeof window !== "undefined" ? window.AltarArtwork : globalThis.AltarArtwork)?.backgrounds || []).map((item) => ({ ...item, thumbnailPath: thumbnailPath(item.assetPath) }))
    ]).map((item) => ({ ...item })),
    displayPath,
    thumbnailPath,
    assetPath,
    showImage,
    imagePath,
    getForms: (category) => unique(catalogue.forms[category] || []).map((item) => ({ ...item, aliases: [...(item.aliases || [])] }))
  };
  global.SanctuaryAssetCatalog = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
