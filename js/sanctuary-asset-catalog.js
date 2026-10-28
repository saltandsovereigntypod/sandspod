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
  const displayPath = (path) => String(path || "").replace(BACKGROUND_PNG, "$1$2.webp");
  const thumbnailPath = (path) => String(path || "").replace(BACKGROUND_PNG, "$1thumbs/$2.webp");
  const api = {
    // The originals, then the painted backgrounds listed in js/altar-artwork.js.
    getBackgrounds: () => unique([
      ...catalogue.backgrounds,
      ...((typeof window !== "undefined" ? window.AltarArtwork : globalThis.AltarArtwork)?.backgrounds || []).map((item) => ({ ...item, thumbnailPath: thumbnailPath(item.assetPath) }))
    ]).map((item) => ({ ...item })),
    displayPath,
    getForms: (category) => unique(catalogue.forms[category] || []).map((item) => ({ ...item, aliases: [...(item.aliases || [])] }))
  };
  global.SanctuaryAssetCatalog = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
