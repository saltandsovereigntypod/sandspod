/* A short Library card for an ingredient (app: rituals/ingredient/[ref].tsx). */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const L = global.RitualsLogic;
  const { esc } = UI;
  const R = global.SaltCore.rituals;
  const P = R.planner;

  function render() {
    const main = UI.root();
    const param = new URLSearchParams(global.location.search).get("ref");
    const item = param ? P.libraryItem(R.format.paramToRef(param)) : null;
    let back = { href: "/rituals/", label: "Rituals" };
    try {
      const from = new URL(global.document.referrer);
      if (from.origin === global.location.origin && from.pathname !== global.location.pathname) back = { href: from.pathname + from.search, label: "Back" };
    } catch {
      /* No referrer: back to Rituals. */
    }
    if (!item) {
      main.innerHTML = `${UI.header({ back, title: "Library" })}<p>This entry isn't in the Rituals Library yet.</p>`;
      return;
    }
    global.document.title = `${item.name} | Salt & Sovereignty`;
    const goodFor = P.INTENTIONS.filter((intention) => {
      const s = P.suggestIngredients(intention);
      return [...s.herb, ...s.crystal, ...s.candle].some((i) => i.ref === item.ref);
    });
    main.innerHTML = `
      ${UI.header({ back, eyebrow: `Library · ${item.type}`, title: item.name, lead: [item.planet, item.element].filter(Boolean).join(" · ") })}
      <p>${esc(item.uses)}</p>
      ${
        goodFor.length
          ? `<section class="sp-section" aria-labelledby="rt-planwith"><h2 class="sp-label" id="rt-planwith">Plan a working with it</h2>
              <div class="sp-chips">${goodFor
                .map((i) => `<a class="sp-chip" href="/rituals/planner/?intention=${i.key}" aria-label="${esc(`Plan a ${i.label.toLowerCase()} working`)}">${esc(i.label)}</a>`)
                .join("")}</div></section>`
          : ""
      }
      ${item.tip ? `<section class="sp-card" aria-labelledby="rt-tip"><h2 class="sp-label" id="rt-tip">A beginning</h2><p>${esc(item.tip)}</p></section>` : ""}
      ${item.caution ? `<section class="sp-card" aria-labelledby="rt-care"><h2 class="sp-label" id="rt-care">With care</h2><p>${esc(item.caution)}</p></section>` : ""}
      <div class="sp-actions">
        <a class="button button--ghost" href="/rituals/spell/?${esc(new URLSearchParams({ add: item.ref, ...(goodFor[0] ? { intention: goodFor[0].key } : {}) }).toString())}" title="Opens the spell builder with this already chosen">Use in a spell</a>
        <a class="button button--ghost" href="${L.libraryHref(item.ref)}">The full entry in the Library</a>
      </div>`;
  }

  global.SaltPage.ready().then(() => UI.attempt(async () => render(), "This entry couldn't be opened"));
})(window);
