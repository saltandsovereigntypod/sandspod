/*
 * "To tend today" on Today, as the app's Today has it
 * (app/src/components/tend/TendToday.tsx): how many things want tending
 * today, by kind, and the first few, opening the whole list (/today/tend/).
 * What's gathered is today/tend/tend-data.js (the app's lib/tend logic, in
 * js/core/tend.js, loaded after Today has drawn); today/today.js redraws
 * this from TendToday.html().
 */
(function (global) {
  "use strict";

  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const href = (path) => global.SaltEnvironment?.resolvePath?.(path) || path;
  const MARK = { petition: "✉", candle: "🕯", offering: "❦", plant: "❧", "coven-petition": "✦", contribution: "✧", journey: "☽", lookback: "?", "coven-task": "✎", checkin: "☉" };
  let html = "";

  function draw(state) {
    const M = global.SaltCore?.tend?.model;
    if (!state || !M) {
      html = "";
    } else {
      const summary = M.todaySummary(state.list);
      if (!summary.count && !summary.ongoing) html = "";
      else {
        const list = href("/today/tend/");
        html =
          `<section class="sp-card td-covens" aria-label="To tend today"><p class="sp-eyebrow td-gold">To tend today</p><p>${esc(summary.line)}</p>` +
          (summary.top.length
            ? `<ul class="td-tend-list">${summary.top
                .map((i) => `<li><a href="${esc(list)}"><span class="td-coven-icon" aria-hidden="true">${MARK[i.kind] || "✧"}</span><span><strong>${esc(i.title)}</strong><span class="sp-caption"> · ${esc(i.source)}</span></span></a></li>`)
                .join("")}</ul>`
            : "") +
          `<p><a class="sp-back" href="${esc(list)}">${summary.count > summary.top.length || summary.ongoing ? "Open the whole list ›" : "Open the list ›"}</a></p></section>`;
      }
    }
    document.querySelectorAll("[data-tend-today]").forEach((el) => (el.innerHTML = html));
  }

  async function start() {
    if (!global.TendData) return;
    try {
      draw(await global.TendData.load());
    } catch (error) {
      console.warn("Couldn’t gather what you tend for Today", error);
    }
  }

  global.TendToday = { html: () => html, refresh: start };
  const go = () => (global.SaltPage ? global.SaltPage.ready().then(start) : start());
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(go, 0));
  else setTimeout(go, 0);
  global.SaltPage?.onUserChange?.(() => start());
})(window);
