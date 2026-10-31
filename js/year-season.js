/*
 * The season of the year on a page, counted as chosen in Settings → Location
 * & hemisphere (the app's lib/seasons.ts, SaltCore.<bundle>.seasons). Fills,
 * once settings are read:
 *   [data-year-season]       "Autumn until 21 December, by the solstices and
 *                            equinoxes." (after its data-prefix, if any)
 *   [data-festival-season]   where the festival (data-ref, data-name) falls in
 *                            its season; left hidden for other days
 * Used by Cycle & Moon's season card and the holy day pages.
 */
(function (global) {
  "use strict";

  function latitude() {
    try {
      const place = JSON.parse(global.localStorage.getItem("sky.place") || "null");
      return place && Number.isFinite(Number(place.latitude)) ? Number(place.latitude) : null;
    } catch {
      return null;
    }
  }

  async function fill(root, seasons) {
    if (!root || !seasons) return;
    const targets = [...root.querySelectorAll("[data-year-season], [data-festival-season]")];
    if (!targets.length) return;
    const settings = (await global.SaltSettings?.get().catch(() => null)) || {};
    for (const el of targets) {
      const line = el.hasAttribute("data-festival-season")
        ? seasons.festivalSeasonLine(el.dataset.ref || "", el.dataset.name || "", seasons.seasonCounting(settings))
        : `${el.dataset.prefix || ""}${seasons.yearSeasonLine(new Date(), settings, latitude())}`;
      if (!line) continue;
      el.textContent = line;
      el.hidden = false;
    }
  }

  global.SaltYearSeason = { fill };
})(window);
