/*
 * The Living Library (the app's More → Living Library): search and browse
 * every entry, open to everyone. Signed in, your own My Practice notes join
 * the entries they belong to. Logic: library/library-logic.js.
 */
(function (global) {
  "use strict";

  const root = global.document.querySelector("[data-page-root]");
  const core = global.SaltCore?.library;
  const L = global.LibraryLogic;
  const { esc, header, unavailable } = global.GuidesUI;
  const data = typeof TraditionalLibrary !== "undefined" ? TraditionalLibrary : null;
  if (!core || !L || !data) return unavailable(root, "The Living Library");

  const params = new URLSearchParams(global.location.search);
  let query = params.get("q") || "";
  let filter = params.get("show") || "all";
  let state = null;
  let sourcingDetail = "Plants, resins and stones to buy thoughtfully";
  let closedLive = false; // shown once the guides have loaded

  /** Keep the search in the address, so Back from an entry returns to it. */
  function remember() {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (filter !== "all") next.set("show", filter);
    const search = next.toString();
    try {
      global.history.replaceState(null, "", `${global.location.pathname}${search ? `?${search}` : ""}`);
    } catch {
      // An address that can't change is fine.
    }
  }

  const row = ({ href, title, detail }) => `<a class="sp-row" href="${esc(href)}">
      <span class="sp-row__text"><span class="sp-row__title">${esc(title)}</span>${detail ? `<span class="sp-row__detail">${esc(detail)}</span>` : ""}</span>
      <span class="sp-row__chevron" aria-hidden="true">›</span></a>`;

  function guidesHtml() {
    return `<nav class="sp-list" aria-label="Living Library guides">
      ${row({ href: "/library/sourcing/", title: "Sourcing with care", detail: sourcingDetail })}
      ${closedLive ? row({ href: "/library/closed/", title: "Closed & living traditions", detail: "What the app doesn’t teach, and why" }) : ""}
    </nav>`;
  }

  function chipsHtml(model) {
    return model.options
      .map((option) => `<button type="button" class="sp-chip" aria-pressed="${option.value === model.filter ? "true" : "false"}" data-filter="${esc(option.value)}">${esc(option.label)}</button>`)
      .join("");
  }

  function resultsHtml(model) {
    return model.results.length ? `<div class="sp-list lb-results">${model.results.map((r) => row({ href: r.href, title: r.name, detail: r.detail })).join("")}</div>` : "";
  }

  function draw() {
    const model = L.indexModel(core, state.entries, state.settings, { query, filter });
    filter = model.filter;
    root.querySelector("[data-chips]").innerHTML = chipsHtml(model);
    root.querySelector("[data-count]").textContent = model.caption;
    root.querySelector("[data-results]").innerHTML = resultsHtml(model);
  }

  function shell() {
    root.innerHTML = `${header({ title: "Living Library", eyebrow: "Correspondences and lore", back: "/?sanctuary=more", backLabel: "Back to More" })}
      ${global.ResearchNote ? global.ResearchNote.cardHtml() : ""}
      <div data-guides>${guidesHtml()}</div>
      <div class="sp-field lb-search"><label for="lb-search">Search the Library</label>
        <input id="lb-search" type="search" placeholder="Rosemary, protection, Venus…" autocomplete="off" autocapitalize="none" spellcheck="false" value="${esc(query)}" /></div>
      <div class="sp-section"><p class="sp-label" id="lb-show">Show</p><div class="sp-chips" role="group" aria-labelledby="lb-show" data-chips></div></div>
      ${state.user && state.offline ? `<p class="sp-notice">Offline · your My Practice notes may be out of date</p>` : ""}
      <p class="sp-caption" role="status" aria-live="polite" data-count></p>
      <div data-results></div>
      ${state.user ? "" : `<p class="sp-caption lb-center">Sign in to see your own My Practice notes from your Book of Shadows here.</p>`}`;

    global.ResearchNote?.bindCard(root);
    let timer = null;
    root.querySelector("#lb-search").addEventListener("input", (event) => {
      query = event.target.value;
      clearTimeout(timer);
      timer = setTimeout(() => {
        draw();
        remember();
      }, 120);
    });
    root.querySelector("[data-chips]").addEventListener("click", (event) => {
      const chip = event.target.closest("[data-filter]");
      if (!chip) return;
      filter = chip.dataset.filter;
      draw();
      remember();
      root.querySelector(`[data-filter="${CSS.escape(filter)}"]`)?.focus();
    });
    draw();
  }

  async function start(user) {
    state = await L.load({
      core,
      user,
      db: global.db || null,
      traditionalData: data,
      storage: (() => {
        try {
          return global.localStorage;
        } catch {
          return null;
        }
      })(),
      getSettings: () => (typeof global.getMySettings === "function" ? global.getMySettings() : {})
    });
    shell();
  }

  // The guides' notes load with the sourcing notes (js/core/guides.js).
  (typeof LibrarySourcing !== "undefined" ? LibrarySourcing.guides() : Promise.resolve(null)).then((G) => {
    const C = G?.closed;
    if (!C) return;
    const count = (C.SOURCING_NOTES || C.sourcingNotes?.() || []).length;
    if (count) sourcingDetail = `${count} plants, resins and stones to buy thoughtfully`;
    closedLive = true;
    const slot = root.querySelector("[data-guides]");
    if (slot) slot.innerHTML = guidesHtml();
  });

  const ready = global.SaltPage?.ready ? global.SaltPage.ready() : Promise.resolve(null);
  ready.then(start).catch(() => start(null));
  global.SaltPage?.onUserChange?.((user) => start(user));
})(window);
