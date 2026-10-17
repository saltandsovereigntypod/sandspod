/*
 * "Whose land are you on?": the app's LandCard (components/craft/LandCard.tsx),
 * a short, warm prompt to learn the Indigenous history of where you practise.
 *
 * Include it on any page that loads css/sanctuary-pages.css:
 *
 *   <div data-land-card></div>
 *   <script src="/js/land-card.js"></script>
 *
 * Optional: data-land-card-heading="h3" to change the title's heading level
 * (h2 by default). Every [data-land-card] on the page is filled once, and
 * window.SaltLandCard.mount(element) fills one added later.
 *
 * The map opens as a plain link: nothing about the person (place, account,
 * practice) is added to it or sent anywhere.
 */
(function (global) {
  const NATIVE_LAND_URL = "https://native-land.ca";

  function html(level) {
    const h = /^h[2-6]$/.test(level || "") ? level : "h2";
    return `<section class="sp-card land-card" aria-labelledby="land-card-title-${(html.count = (html.count || 0) + 1)}">
      <p class="sp-eyebrow land-card__label">Whose land are you on?</p>
      <${h} class="land-card__title" id="land-card-title-${html.count}">Every place has a longer story</${h}>
      <p>The ground you garden, walk and gather on has Indigenous history, and often living Nations who still care for it. Learning whose land it is, its names and its stories is part of knowing a place well. Where you can, support Indigenous-led land and language work there.</p>
      <p class="sp-muted">Native Land is a map of Indigenous territories, languages and treaties, run by Native Land Digital, an Indigenous-led not-for-profit. Its lines are a starting point, not legal borders; the Nations themselves are the best source. This site sends nothing about you; you search the map yourself.</p>
      <div class="sp-actions"><a class="button button--ghost" href="${NATIVE_LAND_URL}" target="_blank" rel="noopener noreferrer">Open the Native Land map<span class="sr-only"> (opens native-land.ca in a new tab)</span></a></div>
    </section>`;
  }

  function mount(element) {
    if (!element || element.dataset.landCardReady) return;
    element.dataset.landCardReady = "true";
    element.innerHTML = html(element.dataset.landCardHeading);
  }

  function mountAll(doc = global.document) {
    doc.querySelectorAll("[data-land-card]").forEach(mount);
  }

  global.SaltLandCard = { NATIVE_LAND_URL, html, mount, mountAll };
  if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", () => mountAll());
  else mountAll();
})(window);
