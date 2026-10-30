/*
  Puts a lit candle's flame (and the smoke when it is put out) on its wick.
  altar.css draws them at fixed spots made for the vigil candles; the other
  forms have their wick elsewhere in the picture (a tea light's is down in its
  cup), so for those the same flame is moved onto the wick, using the wick
  positions in window.AltarArtwork.candleWicks. Mirrors the app's
  src/lib/altar/flame.ts. Sets --flame-x, --flame-top, --flame-h, --halo-top,
  --halo-h, --smoke-top and --smoke-h on each candle; without them the CSS
  keeps its fixed spots.
*/
(function (global) {
  const BOX = 80;
  const PAD_X = 6;
  const PAD_Y = 1;
  const INSET_X = PAD_X / BOX;
  const INSET_Y = PAD_Y / BOX;
  const DEFAULT = { flameTop: -5, flameHeight: 18, haloTop: -3, haloHeight: 10, smokeTop: -10, smokeHeight: 22 };

  function boxAspect(ratio) {
    return Math.max(BOX, Math.round((BOX - PAD_X * 2) * ratio + PAD_Y * 2)) / BOX;
  }

  function inBox(point, ratio, aspect) {
    const contentWidth = 1 - INSET_X * 2;
    const contentHeight = aspect - INSET_Y * 2;
    const width = Math.min(contentWidth, contentHeight / ratio);
    const height = width * ratio;
    return {
      x: INSET_X + (contentWidth - width) / 2 + point[0] * width,
      y: INSET_Y + (contentHeight - height) / 2 + point[1] * height
    };
  }

  // The vigil candle the flame was drawn for (red-candle.png, 500 × 1536) and its wick tip.
  const VIGIL_RATIO = 1536 / 500;
  const VIGIL_ASPECT = boxAspect(VIGIL_RATIO);
  const VIGIL_WICK = inBox([0.508, 0.0534], VIGIL_RATIO, VIGIL_ASPECT);
  const unit = (percent) => (percent / 100) * VIGIL_ASPECT;
  const FOOT = DEFAULT.flameTop + DEFAULT.flameHeight;
  const BASE_BELOW_WICK = unit(FOOT) - VIGIL_WICK.y;

  function candleFormOf(src) {
    const match = /candles\/([a-z-]+)\/[^/]+$/i.exec(String(src || "").split("?")[0]);
    return match ? match[1].toLowerCase() : null;
  }

  function flameLayout(src, ratio, wicks) {
    const form = candleFormOf(src);
    const wick = form && wicks ? wicks[form] : null;
    if (!wick || !ratio || !Number.isFinite(ratio) || ratio <= 0) return null;
    const aspect = boxAspect(ratio);
    const tip = inBox(wick, ratio, aspect);
    const base = tip.y + BASE_BELOW_WICK;
    const pct = (widths) => `${((widths / aspect) * 100).toFixed(2)}%`;
    return {
      "--flame-x": `${(tip.x * 100).toFixed(2)}%`,
      "--flame-top": pct(base - unit(DEFAULT.flameHeight)),
      "--flame-h": pct(unit(DEFAULT.flameHeight)),
      "--halo-top": pct(base - unit(FOOT - DEFAULT.haloTop)),
      "--halo-h": pct(unit(DEFAULT.haloHeight)),
      "--smoke-top": pct(base - unit(FOOT - DEFAULT.smokeTop)),
      "--smoke-h": pct(unit(DEFAULT.smokeHeight))
    };
  }

  const VARS = ["--flame-x", "--flame-top", "--flame-h", "--halo-top", "--halo-h", "--smoke-top", "--smoke-h"];

  function placeFlame(object) {
    if (!object || object.dataset.type !== "candle") return;
    const img = object.querySelector("img");
    if (!img) return;
    const apply = () => {
      const ratio = img.naturalWidth ? img.naturalHeight / img.naturalWidth : null;
      // The candle's own .png path, though the altar shows its WebP twin (same shape).
      const layout = flameLayout(global.SanctuaryAssetCatalog?.imagePath?.(img) ?? img.getAttribute("src"), ratio, global.AltarArtwork?.candleWicks);
      VARS.forEach((name) => {
        if (layout) object.style.setProperty(name, layout[name]);
        else object.style.removeProperty(name);
      });
    };
    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener("load", apply, { once: true });
  }

  function placeAll(root) {
    (root || document).querySelectorAll?.('.altar-object[data-type="candle"]').forEach(placeFlame);
  }

  function watch() {
    placeAll(document);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          const object = mutation.target.closest?.(".altar-object");
          if (object) placeFlame(object);
          continue;
        }
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches?.('.altar-object[data-type="candle"]')) placeFlame(node);
          placeAll(node);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "data-type"] });
  }

  global.AltarFlame = { flameLayout, candleFormOf, placeFlame };
  if (typeof module !== "undefined" && module.exports) module.exports = global.AltarFlame;
  if (typeof document !== "undefined" && typeof MutationObserver !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch);
    else watch();
  }
})(typeof window !== "undefined" ? window : globalThis);
