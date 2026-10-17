/*
 * The patron deities guide (app/src/app/(tabs)/rituals/journeys/patron.tsx):
 * what a patron is (and isn't), how to know, how to accept or decline, and
 * what it changes; then your own deities from My deities.
 *
 * Needs: js/salt-store.js, js/core/journeys.js, rituals/journeys/journeys-logic.js.
 */
(function (global) {
  "use strict";

  const L = global.JourneysLogic;
  const core = () => global.SaltCore.journeys;
  const esc = (text) => global.SaltPage.esc(text);
  const root = global.document.querySelector("[data-page-root]");
  const paras = (text) => L.paragraphs(text).map((p) => `<p>${esc(p)}</p>`).join("");
  const row = (title, detail, url) =>
    `<a class="sp-row" href="${esc(url)}"><span class="sp-row__text"><span class="sp-row__title">${esc(title)}</span>${detail ? `<span class="sp-row__detail">${esc(detail)}</span>` : ""}</span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`;

  async function render() {
    root.setAttribute("aria-busy", "true");
    await global.SaltPage.ready();
    let settings = {};
    try {
      settings = (await global.SaltSettings.get()) || {};
    } catch {
      /* Shown as none kept. */
    }
    const { mine: M, PATRON_GUIDE: guide } = core();
    const kept = M.myDeities(settings);
    const yours = kept.length
      ? `<div class="sp-list">${kept
          .map((d) => row(d.name, `${M.levelLabel(d.level)}${d.since ? ` · since ${d.since}` : ""}`, d.key ? L.href.library(`traditional/deity/${d.key}`) : L.href.deities()))
          .join("")}</div>`
      : `<p class="sp-muted">None yet, and none is needed. When you’re ready, keep the gods you’re getting to know in My deities.</p>`;

    root.innerHTML = `
      <a class="sp-back" href="${L.href.home()}">‹ Journeys</a>
      <header class="jr-title"><p class="sp-eyebrow">A guide</p><h1>${esc(guide.title)}</h1></header>
      <p>${esc(guide.intro)}</p>
      <section class="sp-card"><h2 class="jr-label">Your deities</h2>${yours}
        <div class="sp-actions"><a class="button button--ghost" href="${L.href.deities()}">My deities</a></div></section>
      ${guide.sections
        .map(
          (s, i) => `<details class="sp-details"${i === 0 ? " open" : ""}><summary>${esc(s.heading)}</summary><div class="jr-reading">${paras(s.body)}${
            s.points?.length ? `<ul class="jr-bullets">${s.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""
          }</div></details>`
        )
        .join("")}
      <details class="sp-details"><summary>What we know, and what we don’t</summary><div class="jr-reading">
        <h2 class="jr-label">Known</h2>${paras(guide.knowAndDont.known)}
        <h2 class="jr-label">Not known</h2>${paras(guide.knowAndDont.unknown)}</div></details>
      ${guide.further.length ? `<details class="sp-details"><summary>Reading further</summary><div class="jr-reading">${guide.further.map((f) => `<p class="sp-muted">${esc(f)}</p>`).join("")}</div></details>` : ""}
      <div class="sp-actions"><a class="button button--ghost" href="${L.href.home()}">Dedication journeys</a></div>`;
    root.setAttribute("aria-busy", "false");
  }

  global.SaltPage.onUserChange(render);
  global.addEventListener("saltSettingsChanged", render);
  render();
})(window);
