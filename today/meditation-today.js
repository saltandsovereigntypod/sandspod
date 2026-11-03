/*
 * Meditation on Today, as the app's Today has it
 * (app/src/components/meditation/MeditationToday.tsx): the meditation
 * programmes under way, and a Sabbat sit when a festival in your calendars
 * is today, each opening /practice/meditation/programmes/. Reads the sits
 * (meditation.sits, through SaltCraft) with js/core/meditation.js, loaded
 * after Today has drawn; today/today.js redraws this from
 * MeditationToday.html(). Nothing shows when there's nothing on.
 */
(function (global) {
  "use strict";

  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const href = (path) => global.SaltEnvironment?.resolvePath?.(path) || path;
  let html = "";
  let loading = null;

  function core() {
    if (global.SaltCore?.meditation) return Promise.resolve();
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const el = global.document.createElement("script");
        el.src = href("/js/core/meditation.js");
        el.async = true;
        el.onload = () => resolve();
        el.onerror = () => {
          loading = null;
          reject(new Error("Meditation couldn’t load."));
        };
        global.document.head.appendChild(el);
      });
    }
    return loading;
  }

  async function start() {
    try {
      if (!global.SaltCraft) return;
      await core();
      const M = global.SaltCore.meditation;
      const [rows, settings] = await Promise.all([global.SaltCraft.list(M.log.SITS), global.SaltSettings?.get?.().catch(() => ({})) ?? {}]);
      const sits = (rows || []).map((e) => ({ id: e.id, data: M.log.normalizeSit(e.data) }));
      const now = new Date();
      const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const today = M.programmes.yearFestivals(now, M.holidayChoice(settings || {})).filter((f) => f.date === day);
      const list = M.programmes.todayProgrammes(sits, today, now);
      const link = href("/practice/meditation/programmes/");
      html = list.length
        ? `<section class="sp-card td-covens" aria-label="Meditation"><p class="sp-eyebrow td-gold">Meditation</p><ul class="td-tend-list">${list
            .map((r) => `<li><a href="${esc(link)}"><span><strong>${esc(r.title)}</strong><span class="sp-caption"> · ${esc(r.line)}</span></span></a></li>`)
            .join("")}</ul></section>`
        : "";
    } catch (error) {
      html = "";
      console.warn("Couldn’t gather your meditation programmes for Today", error);
    }
    global.document.querySelectorAll("[data-meditation-today]").forEach((el) => (el.innerHTML = html));
  }

  global.MeditationToday = { html: () => html, refresh: start };
  const go = () => (global.SaltPage ? global.SaltPage.ready().then(start) : start());
  if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", () => setTimeout(go, 0));
  else setTimeout(go, 0);
  global.SaltPage?.onUserChange?.(() => start());
})(window);
