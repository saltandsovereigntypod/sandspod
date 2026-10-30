/*
 * Cycle & Moon on Today, as the app's Today has it
 * (app/src/components/cycle/CycleToday.tsx): one small card, only when it
 * has something to say: the day, season and moon, one suggestion and Log
 * today. Everything else is at /rituals/cycle/.
 *
 * Today stays light: js/core/cycle.js and rituals/cycle/cycle-store.js load
 * only when this browser holds a Cycle & Moon key (remembered on this
 * device, or opened in this tab), since nothing can be shown without one.
 * today/today.js redraws this from CycleToday.html().
 */
(function (global) {
  "use strict";

  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const href = (path) => global.SaltEnvironment?.resolvePath?.(path) || path;
  let html = "";

  function hasKey(scope) {
    const name = `cycleMoon.key.${scope}`;
    try {
      if (global.localStorage.getItem(name)) return true;
    } catch {
      /* blocked */
    }
    try {
      return !!global.sessionStorage.getItem(name);
    } catch {
      return false;
    }
  }

  const scripts = new Map();
  function script(src, ready) {
    if (ready()) return Promise.resolve();
    if (!scripts.has(src)) {
      scripts.set(
        src,
        new Promise((resolve, reject) => {
          const el = global.document.createElement("script");
          el.src = href(src);
          el.async = true;
          el.onload = () => resolve();
          el.onerror = () => {
            scripts.delete(src);
            reject(new Error("Cycle & Moon didn’t load."));
          };
          global.document.head.appendChild(el);
        })
      );
    }
    return scripts.get(src);
  }

  function draw() {
    const S = global.CycleMoonStore;
    const C = global.SaltCore?.cycle;
    const now = new Date();
    if (!S || !C || S.state.phase !== "open" || !S.state.data || !C.model.todayCardRelevant(S.state.data, now)) html = "";
    else {
      const v = C.model.todayView(S.state.data, now);
      const s = C.content.suggestionFor(v.season, v.quarter);
      const first = s.links[0];
      const link = first ? (first.kind === "premade" ? `/rituals/premade/?id=${encodeURIComponent(first.id)}` : first.kind === "library" ? `/library/entry/?entity=${encodeURIComponent(first.id.replace(/:/g, "/"))}` : `/divination/draw/?spread=${encodeURIComponent(first.id)}`) : "";
      html =
        `<section class="sp-card td-covens td-cycle" aria-label="Cycle and Moon"><p class="sp-eyebrow td-gold"><a href="${esc(href("/rituals/cycle/"))}">Cycle &amp; Moon</a></p>` +
        `<h3>${esc(v.line)}</h3>${v.estimate ? `<p class="sp-caption">${esc(v.estimate.line)}</p>` : ""}<p>${esc(s.line)}</p>` +
        `<div class="sp-actions"><a class="button button--ghost" href="${esc(href(`/rituals/cycle/?view=log&date=${C.model.dayKey(now)}`))}">Log today</a>${first ? `<a class="sp-back" href="${esc(href(link))}">${esc(first.label)} ›</a>` : ""}</div></section>`;
    }
    global.document.querySelectorAll("[data-cycle-today]").forEach((el) => (el.innerHTML = html));
  }

  async function start(user) {
    const scope = user?.id || "device";
    if (!hasKey(scope)) {
      html = "";
      draw();
      return;
    }
    try {
      await script("/js/core/cycle.js", () => !!global.SaltCore?.cycle);
      await script("/rituals/cycle/cycle-store.js", () => !!global.CycleMoonStore);
      if (!start.subscribed) {
        global.CycleMoonStore.subscribe(draw);
        start.subscribed = true;
      }
      await global.CycleMoonStore.load(user?.id || null);
      draw();
    } catch (error) {
      console.warn("Cycle & Moon couldn’t open for Today", error);
    }
  }

  global.CycleToday = { html: () => html, refresh: start };
  const go = () => (global.SaltPage ? global.SaltPage.ready().then(start) : start(null));
  if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", () => setTimeout(go, 0));
  else setTimeout(go, 0);
  global.SaltPage?.onUserChange?.((user) => start(user));
})(window);
