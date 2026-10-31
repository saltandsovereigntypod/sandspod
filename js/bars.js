/*
 * SaltBars: the small bar charts on the website's own-pattern pages
 * (Divination → Your patterns, Grimoire → Your year in review), in the shapes
 * of css/bars.css. The app's twin is app/src/components/charts/Bars.tsx.
 * Every bar's number is written beside it and read out with its label, so the
 * bar is never the only way to read it.
 *
 *   SaltBars.bars(rows, ["reading", "readings"])   rows: { label, count, note?, detail?, url?, moon?: [illumination, waxing] }
 *   SaltBars.meter(done, label)                    0–1, with its words
 *   SaltBars.PHASE_LIGHT                           how lit each phase is
 */
(function (global) {
  "use strict";

  const esc = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const PHASE_LIGHT = {
    "New Moon": [0, true],
    "Waxing Crescent": [0.25, true],
    "First Quarter": [0.5, true],
    "Waxing Gibbous": [0.8, true],
    "Full Moon": [1, true],
    "Waning Gibbous": [0.8, false],
    "Last Quarter": [0.5, false],
    "Waning Crescent": [0.25, false]
  };

  /** The lit part of a small moon (rituals/js/rituals-logic.js moonPath). */
  function moonPath(illumination, waxing, r = 10, c = 12) {
    const k = Math.max(0, Math.min(1, Number(illumination) || 0));
    if (k <= 0.01) return "";
    const top = `${c} ${c - r}`;
    const bottom = `${c} ${c + r}`;
    const rx = Math.abs(1 - 2 * k) * r;
    const outer = waxing ? 1 : 0;
    const inner = k < 0.5 ? (waxing ? 0 : 1) : waxing ? 1 : 0;
    return `M${top} A${r} ${r} 0 0 ${outer} ${bottom} A${rx.toFixed(2)} ${r} 0 0 ${inner} ${top} Z`;
  }

  function moon([illumination, waxing]) {
    const path = moonPath(illumination, waxing);
    return `<svg class="sp-bar__moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" fill="rgba(17,21,18,0.85)" stroke="rgba(226,195,109,0.45)" stroke-width="0.8" />${
      illumination >= 0.99 ? `<circle cx="12" cy="12" r="10" fill="#efe3bf" />` : path ? `<path d="${path}" fill="#efe3bf" />` : ""
    }</svg>`;
  }

  function bars(rows, unit) {
    const most = Math.max(1, ...rows.map((r) => r.count));
    return `<ul class="sp-bars">${rows
      .map((r) => {
        const width = r.count ? Math.max(3, (r.count / most) * 100) : 0;
        const words = `${r.label}${r.note ? ` (${r.note})` : ""}: ${r.count} ${r.count === 1 ? unit[0] : unit[1]}`;
        const inner =
          `${r.moon ? moon(r.moon) : ""}<span class="sp-bar__label" aria-hidden="true">${esc(r.label)}${r.note ? ` <span class="sp-bar__note">${esc(r.note)}</span>` : ""}</span>` +
          `<span class="sp-bar__track" aria-hidden="true"><span style="width:${width.toFixed(1)}%"></span></span>` +
          `<span class="sp-bar__count" aria-hidden="true">${r.count}</span><span class="sr-only">${esc(words)}</span>`;
        const line = r.url ? `<a class="sp-bar__line" href="${esc(r.url)}">${inner}</a>` : `<span class="sp-bar__line">${inner}</span>`;
        return `<li class="sp-bar">${line}${r.detail ? `<span class="sp-bar__detail">${esc(r.detail)}</span>` : ""}</li>`;
      })
      .join("")}</ul>`;
  }

  function meter(done, label) {
    const pct = Math.round(Math.max(0, Math.min(1, done)) * 100);
    return `<div class="sp-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${esc(label)}"><span class="sp-caption">${esc(label)}</span><span class="sp-meter__track" aria-hidden="true"><span style="width:${Math.max(pct ? 4 : 0, pct)}%"></span></span></div>`;
  }

  global.SaltBars = { bars, meter, moon, PHASE_LIGHT, esc };
})(window);
