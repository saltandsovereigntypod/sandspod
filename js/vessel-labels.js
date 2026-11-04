/*
  Labelled jars and bottles on the website (app: components/shelves/VesselLabel.tsx).
  The containers are plain pictures; the words are drawn on top here, in the label's
  rect from SaltCore's vesselLabel (app/src/lib/altar/vesselLabel.ts), sized with
  container-query units so they stay in proportion at any size and when zoomed.
  Used by My Shelves (rituals/shelves/shelves.js) and the altar (altar/js/core/storage.js,
  altar/js/features/objects.js). Styles: /css/vessel-labels.css.
*/
(function (global) {
  "use strict";

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const core = () => global.SaltCore?.shelves?.vesselLabel || global.SaltCore?.altar?.vesselLabel || null;
  const pct = (n) => `${Math.round(n * 10000) / 100}%`;

  /**
   * The label's HTML for a container drawn filling its box (the label's rect as
   * percentages of the box). `inset` is the box's padding in px ({ x, y }), when
   * the picture sits in a padded box (the altar's buttons).
   */
  function labelHtml(vessel, label, inset) {
    const V = core();
    const v = V?.VESSELS?.[vessel];
    if (!v || !label || !label.text) return "";
    const r = v.label;
    const across = 100;
    const deep = (100 * r.h * v.ratio) / r.w;
    const size = V.labelFontSize(label.text, across, deep, !!v.vertical);
    const len = (fraction, pad) => (pad ? `calc((100% - ${pad * 2}px) * ${fraction})` : pct(fraction));
    const pos = (fraction, pad) => (pad ? `calc(${pad}px + (100% - ${pad * 2}px) * ${fraction})` : pct(fraction));
    const style = `left:${pos(r.x, inset?.x)};top:${pos(r.y, inset?.y)};width:${len(r.w, inset?.x)};height:${len(r.h, inset?.y)}`;
    // cqw on the words is a share of the label's own width (the label is their size container).
    return `<span class="vl vl--${esc(label.style)} vl--${esc(label.font)}${v.vertical ? " vl--vertical" : ""}" style="${style}" aria-hidden="true"><span style="font-size:${Math.round(size * 100) / 100}cqw">${esc(label.text)}</span></span>`;
  }

  /** A container standing in its box, the herb's own picture filling a jar, and its label. */
  function vesselHtml(vessel, label, src, fillSrc) {
    const V = core();
    const v = V?.VESSELS?.[vessel];
    if (!v) return "";
    const f = v.fill;
    const fill = f && fillSrc ? `<img class="vl-fill" src="${esc(fillSrc)}" alt="" loading="lazy" style="left:${pct(f.x)};top:${pct(f.y + f.h * 0.25)};width:${pct(f.w)};height:${pct(f.h * 0.75)}" />` : "";
    return `<span class="vl-vessel"><img class="vl-glass" src="${esc(src)}" alt="" loading="lazy" />${fill}${labelHtml(vessel, label)}</span>`;
  }

  /** Draw (or redraw) the label on an altar object whose picture is a labelled container. */
  function decorateAltarObject(object) {
    if (!object) return;
    object.querySelector(":scope > .vl")?.remove();
    const V = core();
    let raw = object.dataset.vesselLabel || "";
    if (!raw && object.dataset.appExtra) {
      try {
        raw = JSON.parse(object.dataset.appExtra).vesselLabel || "";
      } catch {
        raw = "";
      }
    }
    const label = V?.cleanVesselLabel?.(raw);
    const path = object.dataset.assetPath || object.querySelector("img")?.dataset?.assetPath || object.querySelector("img")?.getAttribute("src") || "";
    if (!label?.vessel || !label.text) return;
    const image = V.VESSELS[label.vessel].image.replace(/^(\.\.\/)+/, "");
    if (path && !path.replace(/\.webp$/, ".png").replace(/^(\.\.\/|\/)+/, "").endsWith(image)) return;
    object.insertAdjacentHTML("beforeend", labelHtml(label.vessel, label, { x: 6, y: 1 }));
  }

  global.VesselLabels = { labelHtml, vesselHtml, decorateAltarObject };
})(typeof window !== "undefined" ? window : globalThis);
