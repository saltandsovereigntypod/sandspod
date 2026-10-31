/*
 * A Year and a Day on Today, as the app's Today has it
 * (app/src/components/year/YearToday.tsx): "Moon 3 of 13 · Ground and
 * boundary" and the next thing in the moon, only while a year is under way,
 * opening /rituals/year/. The words come from the app's own logic
 * (lib/yearday/progress.ts todayLine, in js/core/yearday.js), which loads only
 * once a year has been begun. today/today.js redraws this from YearToday.html().
 */
(function (global) {
  "use strict";

  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const href = (path) => global.SaltEnvironment?.resolvePath?.(path) || path;
  const COLLECTION = "yearday.progress";
  let html = "";
  let loading = null;

  /** The app's route on the website. */
  function siteUrl(appHref) {
    const moon = /^\/rituals\/year\/moon\/(\d+)$/.exec(appHref);
    if (moon) return `/rituals/year/?moon=${moon[1]}`;
    if (appHref === "/rituals/year/day") return "/rituals/year/?view=day";
    return "/rituals/year/";
  }

  function bundle() {
    if (global.SaltCore?.yearday) return Promise.resolve();
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const el = global.document.createElement("script");
        el.src = href("/js/core/yearday.js");
        el.async = true;
        el.onload = () => resolve();
        el.onerror = () => {
          loading = null;
          reject(new Error("A Year and a Day didn’t load."));
        };
        global.document.head.appendChild(el);
      });
    }
    return loading;
  }

  function paint() {
    global.document.querySelectorAll("[data-year-today]").forEach((el) => (el.innerHTML = html));
  }

  async function start() {
    try {
      const entries = global.SaltCraft ? await global.SaltCraft.list(COLLECTION) : [];
      if (!entries.length) {
        html = "";
        return paint();
      }
      await bundle();
      const Y = global.SaltCore.yearday.year;
      const entry = Y.currentYear(entries);
      const now = new Date();
      const line = entry ? Y.todayLine(entry.data, Y.dayKey(now)) : null;
      if (!line) html = "";
      else {
        const pct = line.position.phase === "moon" ? Math.round(Y.yearFraction(entry.data, Y.dayKey(now)) * 100) : null;
        html =
          `<section class="sp-card td-covens" aria-label="${esc(line.label)}"><p class="sp-eyebrow td-gold">${esc(line.label)}</p>` +
          `<p><a href="${esc(href(siteUrl(line.href)))}">${esc(line.line)} ›</a></p>` +
          (line.detail ? `<p class="sp-caption">${esc(line.detail)}</p>` : "") +
          (pct !== null
            ? `<div role="progressbar" aria-label="How far through the year" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" style="height:6px;border-radius:3px;background:rgba(202,191,157,.18);overflow:hidden"><span style="display:block;height:100%;width:${pct}%;background:var(--gold)"></span></div>`
            : "") +
          `</section>`;
      }
    } catch (error) {
      console.warn("Couldn’t read A Year and a Day for Today", error);
      html = "";
    }
    paint();
  }

  global.YearToday = { html: () => html, refresh: start, siteUrl };
  const go = () => (global.SaltPage ? global.SaltPage.ready().then(start) : start());
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(go, 0));
  else setTimeout(go, 0);
  global.SaltPage?.onUserChange?.(() => start());
})(window);
