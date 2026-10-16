/*
 * Small shared pieces for the guide pages (Closed & living traditions,
 * Sourcing with care, Support, How to, Reminders): escaping, paragraphs,
 * the page header, and in-page navigation between a list and its detail
 * (?id=…) without reloading the app's logic.
 *
 * Needs: js/salt-store.js (SaltPage.esc). Loads before each page's own script.
 */
(function (global) {
  const esc = (text) =>
    global.SaltPage?.esc
      ? global.SaltPage.esc(text)
      : String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /** Paragraphs as the app splits them: blank lines or single line breaks. */
  const split = (text) =>
    String(text || "")
      .split(/\n\s*\n|\n/)
      .map((p) => p.trim())
      .filter(Boolean);

  const paragraphs = (text) => (Array.isArray(text) ? text : split(text)).map((p) => `<p>${esc(p)}</p>`).join("");

  /** The top of a page: a back link, the eyebrow and the title. */
  function header({ title, eyebrow, back, backLabel }) {
    return `${back ? `<a class="sp-back" href="${esc(back)}">← ${esc(backLabel || "Back")}</a>` : ""}
      <header class="gd-header">${eyebrow ? `<p class="sp-eyebrow">${esc(eyebrow)}</p>` : ""}<h1 tabindex="-1">${esc(title)}</h1></header>`;
  }

  /** Lower case, accents and punctuation gone (the app's fold), for search. */
  const fold = (text) =>
    String(text || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  /**
   * In-page routing for a list and its detail views. `render(params)` draws
   * the page for the current query string; links marked data-gd-nav move
   * between views with pushState, and Back works as expected.
   */
  function router(render) {
    const draw = (focus) => {
      render(new URLSearchParams(global.location.search));
      if (focus) {
        global.scrollTo(0, 0);
        global.document.querySelector("[data-page-root] h1")?.focus({ preventScroll: true });
      }
    };
    global.document.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-gd-nav]");
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button) return;
      event.preventDefault();
      global.history.pushState(null, "", link.getAttribute("href"));
      draw(true);
    });
    global.addEventListener("popstate", () => draw(true));
    draw(false);
  }

  /** Shown when the app's logic didn't load (offline, blocked script). */
  function unavailable(root, what) {
    root.innerHTML = `<p class="sp-notice">${esc(what)} couldn’t load just now. Please check your connection and refresh the page.</p>`;
  }

  global.GuidesUI = { esc, split, paragraphs, header, fold, router, unavailable };
})(window);
