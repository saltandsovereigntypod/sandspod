/*
 * Hearth & land's links from elsewhere on the website, as the app has them:
 * Today's seasonal nudge, "From the kitchen" on a holy-day page, and the
 * Hearth & land rows on a Living Library herb or tree's page
 * (app/src/components/craft/hearth.tsx HerbHearth). Needs js/core/hearth.js
 * (and js/traditional-library.js before it); your own recipes, notes,
 * patches and harvests are read through SaltCraft when it's on the page.
 *
 *   SaltHearthLinks.siteHref("/rituals/craft/hearth/forage")  → "/practice/hearth/forage/"
 *   SaltHearthLinks.todayLine(practices, now, ctx)            → { label, line, detail, href } | null
 *   SaltHearthLinks.mountHoly(element, ref)                   fills a holy page's slot
 *   SaltHearthLinks.mountHerb(element, herbKey)               fills a Library entry's slot
 */
(function (global) {
  "use strict";
  const H = () => global.SaltCore && global.SaltCore.hearth;
  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /** An app Hearth & land address on the website: /rituals/craft/hearth/x?y → /practice/hearth/x/?y. */
  function siteHref(appHref) {
    const [path, query] = String(appHref || "").split("?");
    const tail = path.replace(/^\/rituals\/craft\/hearth\/?/, "").replace(/\/$/, "");
    return `/practice/hearth/${tail ? `${tail}/` : ""}${query ? `?${query}` : ""}`;
  }

  function todayLine(practices, now, ctx) {
    const h = H();
    if (!h) return null;
    const line = h.hearthToday.hearthToday(practices, now, ctx);
    return line ? { ...line, href: siteHref(line.href) } : null;
  }

  async function mine(collection) {
    try {
      return global.SaltCraft ? await global.SaltCraft.list(collection) : [];
    } catch {
      return [];
    }
  }

  const rows = (items) =>
    `<div class="sp-list">${items
      .map((r) => `<a class="sp-row" href="${esc(r.href)}"><span class="sp-row__text"><span class="sp-row__title">${esc(r.title)}</span>${r.detail ? `<span class="sp-row__detail">${esc(r.detail)}</span>` : ""}</span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`)
      .join("")}</div>`;

  async function mountHoly(element, ref) {
    const h = H();
    if (!element || !h) return;
    const R = h.recipes;
    const recipes = R.recipesForHoly(ref, R.allRecipes(await mine(R.RECIPES)));
    if (!recipes.length) return;
    element.innerHTML = `<section class="sp-section"><h2 class="sp-label">From the kitchen</h2>${rows(
      recipes.map((r) => ({ href: `/practice/hearth/recipes/recipe/?id=${encodeURIComponent(r.id)}`, title: r.recipe.title, detail: R.ORIGIN_LABELS[r.recipe.origin] }))
    )}<p class="sp-caption">Recipes to cook for the day with intent, each marked traditional or modern.</p></section>`;
  }

  async function mountHerb(element, herb) {
    const h = H();
    if (!element || !h || !herb) return;
    const { forage: F, recipes: R, land: L, season: S, garden: G } = h;
    if (!G.herbName(herb)) return;
    let place = null;
    try {
      place = JSON.parse(global.localStorage.getItem("sky.place") || "null");
    } catch {
      place = null;
    }
    const hemisphere = S.hemisphereOf(place && place.latitude);
    const [notes, patches, harvests, own] = await Promise.all([L.LAND_NOTES, F.LAND_GROWING, F.LAND_HARVESTS, R.RECIPES].map(mine));
    const seen = notes.map((e) => L.normalizeNote(e.data)).filter((n) => n.herbs.includes(herb));
    const grows = patches.filter((e) => F.normalizePatch(e.data).herb === herb).length;
    const gathered = harvests.filter((e) => F.normalizeHarvest(e.data).herb === herb).length;
    const season = S.SEASON_PLANTS.find((p) => p.key === herb && p.library);
    const items = [];
    for (const f of F.forageForHerb(herb)) items.push({ href: `/practice/hearth/forage/plant/?key=${encodeURIComponent(f.key)}`, title: `Foraging: ${f.name}`, detail: `${F.forageSpan(f, hemisphere)} · ${F.USE_LABELS[f.use]} · look-alikes and care` });
    if (season) items.push({ href: "/practice/green/season/", title: "In the garden", detail: `Sow ${S.monthSpan(S.localMonths(season.sow, hemisphere))} · gather ${S.monthSpan(S.localMonths(season.harvest, hemisphere))}` });
    if (seen.length) items.push({ href: `/practice/hearth/land/?herb=${encodeURIComponent(herb)}`, title: "In your land journal", detail: `Noted ${seen.length} ${seen.length === 1 ? "time" : "times"}` });
    if (grows || gathered) items.push({ href: "/practice/hearth/forage/", title: "Where it grows for you", detail: [grows ? `${grows} ${grows === 1 ? "patch" : "patches"}` : "", gathered ? `${gathered} ${gathered === 1 ? "harvest" : "harvests"}` : ""].filter(Boolean).join(" · ") });
    for (const r of R.recipesForHerb(herb, R.allRecipes(own)).slice(0, 4)) items.push({ href: `/practice/hearth/recipes/recipe/?id=${encodeURIComponent(r.id)}`, title: `Recipe: ${r.recipe.title}`, detail: "Kitchen witchery" });
    items.push({ href: `/practice/hearth/land/note-edit/?herb=${encodeURIComponent(herb)}`, title: "Note it on the land", detail: "Seen it in bloom, in fruit or growing somewhere?" });
    element.innerHTML = `<section class="sp-section"><h2 class="sp-label">Hearth &amp; land</h2>${rows(items)}</section>`;
  }

  global.SaltHearthLinks = { siteHref, todayLine, mountHoly, mountHerb };
})(window);
