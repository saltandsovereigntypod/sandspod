/*
 * The deity card on a Living Library deity page (the app's
 * components/library/DeityYours.tsx, and LibraryEntryView's journey link):
 * where they stand in your practice (Your patron, Dedicated, Exploring, and
 * since when), "Set a shrine" on the altar, My deities, and their dedication
 * journey when there is one. Reads the `my_deities` setting as the app keeps
 * it; changes are made in My deities.
 *
 * The grimoire's library page leaves <section data-deity-yours> for it and
 * calls SaltDeityYours.hydrate(section). The app's logic
 * (js/core/journeys.js) is loaded the first time it's needed.
 */
(function (global) {
  "use strict";

  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  let loading = null;
  function loadCore() {
    if (global.SaltCore?.journeys) return Promise.resolve(global.SaltCore.journeys);
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const script = global.document.createElement("script");
        script.src = "/js/core/journeys.js";
        script.onload = () => resolve(global.SaltCore?.journeys);
        script.onerror = () => {
          loading = null;
          reject(new Error("The deity card couldn't load."));
        };
        global.document.head.append(script);
      });
    }
    return loading;
  }

  /** The card's markup: pure, for a deity { key, name } and the settings. */
  function markup(core, settings, deity) {
    const M = core.mine;
    const mine = M.findDeity(M.myDeities(settings), deity.key, deity.name);
    const level = mine ? M.LEVELS.find((l) => l.value === mine.level) : null;
    const journey = deity.key ? core.lookup.journeyForDeityRefIn(core.JOURNEY_CATALOG, `traditional/deity/${deity.key}`) : null;
    const head = mine && level
      ? `<p class="deity-yours__badge">${esc(mine.level === "patron" ? "Your patron" : level.label)}</p>${mine.since ? `<p class="deity-yours__since">Since ${esc(mine.since)}</p>` : ""}`
      : `<p>${esc(`Drawn to ${deity.name}? You can keep them in My deities, as someone you’re exploring, dedicated to, or your patron.`)}</p>`;
    return `<div class="deity-yours${mine?.level === "patron" ? " deity-yours--patron" : ""}">
      ${head}
      <div class="deity-yours__actions">
        ${deity.key ? `<a class="button button--small button--ghost" href="/altar/?shrine=${encodeURIComponent(deity.key)}" aria-describedby="deity-yours-shrine-hint">${esc(`Set a shrine for ${deity.name}`)}</a>` : ""}
        <a class="button button--small button--ghost" href="/more/settings/deities/">${mine ? "My deities" : "Add to My deities"}</a>
        ${journey ? `<a class="button button--small button--ghost" href="/rituals/journeys/?id=${encodeURIComponent(journey.id)}" aria-label="${esc(`Begin a dedication journey: ${journey.title}. Study, practice and a rite of self-dedication`)}">Begin a dedication journey</a>` : ""}
      </div>
      ${deity.key ? `<p class="deity-yours__hint" id="deity-yours-shrine-hint">Opens a starter altar with their colours, plants and stones, and their statue where there is one.</p>` : ""}
    </div>`;
  }

  async function hydrate(section) {
    if (!section) return;
    const deity = { key: section.dataset.deityYours || null, name: section.dataset.deityName || "" };
    try {
      const [core, settings] = await Promise.all([loadCore(), typeof global.getMySettings === "function" ? global.getMySettings().catch(() => ({})) : Promise.resolve({})]);
      if (!section.isConnected) return;
      section.innerHTML = markup(core, settings || {}, deity);
    } catch {
      section.remove();
    }
  }

  const api = { hydrate, markup };
  global.SaltDeityYours = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
