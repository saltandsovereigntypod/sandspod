/*
 * The site's menu, shared by every page and drawn the way the app draws it:
 * Today · Altar · Practice · Coven · More, then the website's own pages
 * (About · Podcast · Books · Blog · Contact · Submit · Help) and Privacy and
 * Terms in small print (the app's lib/siteLinks.ts, in the same order).
 * Practice holds three sections, as in the app: the Grimoire (/grimoire/),
 * Rituals (/rituals/: ritual work) and Craft (/practice/: the tools that
 * aren't rituals, with Cycle & Moon at /rituals/cycle/, divination at
 * /divination/ and the sigil maker at /sigil/, all kept where they were), with
 * a Grimoire | Rituals | Craft switch at the top of those pages; the tab
 * returns to whichever was used last. Coven is /covens/.
 *
 * On a computer (900px and wider) it is a side bar down the left, which folds
 * to a rail of icons (« / »). On phones and narrow windows it is a bar of five
 * tabs along the bottom, with a grip to tuck it away and a round button in the
 * corner to bring it back; the website's pages are under More there. Both
 * choices are remembered on this device. More opens the Sanctuary panel;
 * pages without the panel send it to the home page, which opens it on arrival.
 * A page needs only this script (at the top of <body>) and css/site-nav.css:
 * no header markup of its own.
 *
 * Back goes to the screen you came from, as in the app. Pages that have their
 * own back link ("‹ Back to Today", "← All rituals") keep it, but it now goes
 * back the way you came while there is somewhere on the site to go back to,
 * and only falls back to its written place when there isn't (a shared link,
 * a fresh tab). Every other page gets a standard "‹ Back" at the top; the
 * tabs' own first pages show it only when there is somewhere to go back to.
 */
(function (global) {
  // The app's icons (components/Icon.tsx, components/more/MoreIcon.tsx), on the same 24px grid.
  const ICONS = {
    today: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    altar: '<rect x="9" y="10" width="6" height="11" rx="1"/><path d="M12 3c1.5 2 2 3.5 0 5.5-2-2-1.5-3.5 0-5.5z"/>',
    practice: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    coven: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="5.6" r="1.7"/><circle cx="6.3" cy="15.3" r="1.7"/><circle cx="17.7" cy="15.3" r="1.7"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    about: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.1"/>',
    podcast: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>',
    books: '<path d="M5 19.5V5h4v14.5M9 19.5V7h4v12.5"/><path d="M13.5 7.8l3.4-.9 3.1 11.6M3 20h18"/>',
    blog: '<path d="M20 4c-7 1-11 6-12.5 12.5L6 20"/><path d="M8 16.5c4-.5 7.5-3 9-7.5M11 12.5l3.5-.5"/>',
    contact: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
    submit: '<path d="M12 21c-4-2.5-7-5.5-7-9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 7 3.5c0 4-3 7-7 9.5z"/><path d="M12 3v3"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2.1-2.4 3.6M12 16.9v.1"/>'
  };

  const TABS = [
    { key: "today", label: "Today", href: "/today/" },
    { key: "altar", label: "Altar", href: "/altar/" },
    { key: "practice", label: "Practice", href: "/grimoire/" },
    { key: "coven", label: "Coven", href: "/covens/" },
    { key: "more", label: "More", view: "more" }
  ];

  // The website's own pages, in the app's order (lib/siteLinks.ts SITE_LINKS).
  const SITE_TITLE = "Salt & Sovereignty";
  const SITE_LINKS = [
    { key: "about", label: "About", href: "/#about" },
    { key: "podcast", label: "Podcast", href: "/#podcast" },
    { key: "books", label: "Books", href: "/#books" },
    { key: "blog", label: "Blog", href: "/#blog" },
    { key: "contact", label: "Contact", href: "/#contact" },
    { key: "submit", label: "Submit", href: "/submit/" },
    { key: "help", label: "Help", href: "/help/" }
  ];
  const SMALL_LINKS = [
    { key: "privacy", label: "Privacy", href: "/privacy.html" },
    { key: "terms", label: "Terms", href: "/submission-terms.html" }
  ];

  // The three sections of Practice, switched at the top of their pages (the
  // app's lib/practiceSections.ts PRACTICE_SECTIONS).
  const PRACTICE = [
    { key: "grimoire", label: "Grimoire", href: "/grimoire/" },
    { key: "rituals", label: "Rituals", href: "/rituals/" },
    { key: "craft", label: "Craft", href: "/practice/" }
  ];
  const PRACTICE_KEY = "saltPracticeSection";
  // Remembered on this device, as in the app: the side bar folded to a rail, the bottom bar tucked away.
  const SIDEBAR_KEY = "saltSiteMenu";
  const BOTTOM_BAR_KEY = "saltSiteBottomBar";

  function readKey(key) {
    try {
      return global.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  function writeKey(key, value) {
    try {
      global.localStorage?.setItem(key, value);
    } catch {
      // Private windows may refuse; the choice then lasts for this page only.
    }
  }

  function normalPath(pathname) {
    const path = String(pathname || "/").replace(/index\.html$/, "");
    return path.endsWith("/") || path.includes(".") ? path : `${path}/`;
  }

  /** Which part of Practice a page is: "grimoire", "rituals", "craft", or null. */
  function practiceSection(pathname, search = "") {
    const path = normalPath(pathname);
    if (path.startsWith("/altar/")) return new URLSearchParams(search).get("ritual") ? "rituals" : null;
    // Craft holds the tools that aren't rituals, as in the app: the craft tools and astrology
    // (/practice/), Cycle & Moon, divination and the sigil maker, each at its old address.
    if (path.startsWith("/practice/") || path.startsWith("/rituals/cycle/") || path.startsWith("/divination/") || path.startsWith("/sigil/")) return "craft";
    // Rituals holds ritual work: the planner, premade book, spells, community rituals, journeys and the journal.
    if (path.startsWith("/rituals/")) return "rituals";
    if (path === "/grimoire/" || path.startsWith("/grimoire/dreams/") || path.startsWith("/grimoire/year/")) return "grimoire";
    return null;
  }

  /** Which tab a page belongs to. */
  function activeTab(pathname, search = "") {
    const path = normalPath(pathname);
    if (practiceSection(pathname, search)) return "practice";
    if (path.startsWith("/altar/")) return "altar";
    if (path.startsWith("/today/")) return "today";
    if (path.startsWith("/covens/")) return "coven";
    if (path === "/" || path.startsWith("/blog/")) return "podcast";
    return "more";
  }

  /** Which of the website's own pages a page is (lit in the side bar), or null. */
  function activeSiteLink(pathname) {
    const path = normalPath(pathname);
    if (path.startsWith("/blog/")) return "blog";
    if (path.startsWith("/submit/")) return "submit";
    if (path.startsWith("/help/")) return "help";
    return null;
  }

  function rememberedPractice() {
    try {
      const stored = global.localStorage?.getItem(PRACTICE_KEY);
      return PRACTICE.some((p) => p.key === stored) ? stored : "grimoire";
    } catch {
      return "grimoire";
    }
  }

  // The first page of each tab: no Back of its own unless you came from somewhere.
  const TAB_ROOTS = new Set(["/", "/today/", "/altar/", "/grimoire/", "/rituals/", "/practice/", "/covens/"]);

  /** Whether the previous entry in this tab's history is a page of this site. */
  function canGoBack(loc = global.location, doc = global.document) {
    try {
      const nav = global.navigation;
      if (nav && typeof nav.canGoBack === "boolean") return nav.canGoBack;
    } catch {
      // Fall through to the referrer.
    }
    try {
      return global.history.length > 1 && Boolean(doc?.referrer) && new URL(doc.referrer).origin === loc.origin;
    } catch {
      return false;
    }
  }

  /** A back link: one whose words start with ‹ or ← (not "Open the list ›"). */
  function isBackLink(el) {
    return Boolean(el?.matches?.("a.sp-back, a.site-back")) && /^\s*[‹←]/.test(el.textContent || "");
  }

  /** Where Back goes when there is no history: the page's tab. */
  function fallbackHref(loc = global.location) {
    const tab = activeTab(loc.pathname, loc.search);
    if (tab === "practice") return PRACTICE.find((p) => p.key === practiceSection(loc.pathname, loc.search))?.href || "/grimoire/";
    if (tab === "podcast" || tab === "more") return "/";
    return TABS.find((t) => t.key === tab)?.href || "/";
  }

  function isHome(pathname) {
    return normalPath(pathname) === "/";
  }

  function icon(key, cls = "site-tab-icon") {
    return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[key]}</svg>`;
  }

  const esc = (text) => text.replace(/&/g, "&amp;");

  function tabMarkup(tab, current, hasPanel) {
    const attrs = `class="site-tab" data-site-tab="${tab.key}" data-site-menu-label="${tab.label}"${tab.key === current ? ' aria-current="page"' : ""}`;
    const inner = `${icon(tab.key)}<span class="site-tab-label">${tab.label}</span>`;
    if (tab.view && hasPanel) return `<button type="button" ${attrs} data-site-tab-view="${tab.view}">${inner}</button>`;
    let href = tab.view ? `/?sanctuary=${tab.view}` : tab.href;
    if (tab.key === "practice") href = PRACTICE.find((p) => p.key === rememberedPractice()).href;
    return `<a href="${href}" ${attrs}>${inner}</a>`;
  }

  function menuMarkup(loc, hasPanel) {
    const current = activeTab(loc.pathname, loc.search);
    const site = activeSiteLink(loc.pathname);
    const links = SITE_LINKS.map(
      (link) =>
        `<a class="site-menu-link" href="${link.href}" data-site-link="${link.key}" data-site-menu-label="${link.label}"${link.key === site ? ' aria-current="page"' : ""}>${icon(link.key, "site-menu-icon")}<span class="site-tab-label">${link.label}</span></a>`
    ).join("");
    return (
      `<nav class="site-menu" aria-label="Main">` +
      `<button type="button" class="site-menu-grip" data-site-menu-tuck aria-label="Tuck the menu away"><span aria-hidden="true"></span></button>` +
      `<a class="site-menu-brand" href="/" aria-label="${esc(SITE_TITLE)} home" data-site-menu-label="${esc(SITE_TITLE)}"><span class="site-menu-name">${esc(SITE_TITLE)}</span><span class="site-menu-mark" aria-hidden="true">S&amp;S</span></a>` +
      `<div class="site-tabs">${TABS.map((tab) => tabMarkup(tab, current, hasPanel)).join("")}</div>` +
      `<div class="site-menu-site"><div class="site-menu-divider"></div><p class="site-menu-heading">${esc(SITE_TITLE)}</p>${links}</div>` +
      `<div class="site-menu-grow"></div>` +
      `<button type="button" class="site-menu-fold" data-site-menu-fold></button>` +
      `<p class="site-menu-small">${SMALL_LINKS.map((link) => `<a href="${link.href}">${link.label}</a>`).join(" ")}</p>` +
      `</nav>` +
      `<button type="button" class="site-menu-restore" data-site-menu-restore aria-label="Show the menu">${icon("more")}</button>`
    );
  }

  /** Fold the side bar to a rail (or open it), and tuck the bottom bar away (or bring it back), as remembered. */
  function applyMenuState(doc = document) {
    const root = doc.documentElement;
    const rail = readKey(SIDEBAR_KEY) === "rail";
    root.classList.toggle("site-menu-rail", rail);
    root.classList.toggle("site-menu-tucked", readKey(BOTTOM_BAR_KEY) === "tucked");
    const fold = doc.querySelector("[data-site-menu-fold]");
    if (fold) {
      fold.textContent = rail ? "»" : "«";
      fold.setAttribute("aria-label", rail ? "Expand the menu" : "Fold the menu to icons");
      fold.title = rail ? "Expand the menu" : "Fold the menu";
    }
    // Folded, the bar shows icons only: their names show on hover.
    doc.querySelectorAll(".site-menu [data-site-menu-label]").forEach((el) => {
      if (rail) el.title = el.dataset.siteMenuLabel;
      else el.removeAttribute("title");
    });
  }

  function render(doc = document, loc = global.location) {
    const hasPanel = typeof global.openMySanctuaryPanel === "function";
    doc.querySelectorAll(".site-menu, .site-menu-restore, .practice-switch, .site-back-bar").forEach((el) => el.remove());
    // After the "Skip to content" link, which stays the first thing to tab to.
    const skip = doc.body.querySelector(":scope > .skip-link");
    if (skip) skip.insertAdjacentHTML("afterend", menuMarkup(loc, hasPanel));
    else doc.body.insertAdjacentHTML("afterbegin", menuMarkup(loc, hasPanel));
    let anchor = doc.querySelector(".site-menu-restore");

    if (!TAB_ROOTS.has(normalPath(loc.pathname)) || canGoBack(loc, doc)) {
      anchor.insertAdjacentHTML("afterend", `<div class="site-back-bar"><a class="site-back" href="${fallbackHref(loc)}">‹ Back</a></div>`);
      anchor = anchor.nextElementSibling;
    }

    const section = practiceSection(loc.pathname, loc.search);
    if (section) {
      writeKey(PRACTICE_KEY, section);
      anchor.insertAdjacentHTML(
        "afterend",
        `<nav class="practice-switch" aria-label="Practice">${PRACTICE.map((p) => `<a href="${p.href}"${p.key === section ? ' aria-current="page"' : ""}>${p.label}</a>`).join("")}</nav>`
      );
    }
    applyMenuState(doc);
    doc.body.classList.add("has-site-nav");
  }

  // While the Sanctuary panel is open, the tab for its view is the lit one.
  const PANEL_TABS = { welcome: "today", auth: "today", dashboard: "today", rituals: "practice", more: "more", journey: "more", submissions: "more", settings: "more" };

  function panelState(doc = document) {
    const panel = doc.querySelector("[data-my-sanctuary-panel]");
    const open = Boolean(panel && !panel.hidden && panel.classList.contains("is-visible"));
    const view = panel?.querySelector("[data-sanctuary-view]:not([hidden])")?.dataset.sanctuaryView || "";
    return { panel, open, tab: open ? PANEL_TABS[view] || "more" : null };
  }

  function markCurrent(doc = document, loc = global.location) {
    const current = panelState(doc).tab || activeTab(loc.pathname, loc.search);
    doc.querySelectorAll(".site-tab").forEach((tab) => {
      if (tab.dataset.siteTab === current) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });
  }

  function openView(view) {
    if (typeof global.openMySanctuaryPanel !== "function") return false;
    global.openMySanctuaryPanel(view);
    return true;
  }

  // The altar's Ritual Companion starts from its own "Start Ritual" action.
  function openRitualCompanion(doc = document) {
    const start = doc.querySelector('[data-global-action="start-ritual"]');
    if (!start) return false;
    start.click();
    doc.querySelector(".altar-companion-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }

  function install() {
    render();
    const { panel } = panelState();
    if (panel && typeof MutationObserver !== "undefined") {
      new MutationObserver(() => markCurrent()).observe(panel, { subtree: true, attributes: true, attributeFilter: ["hidden", "class"] });
    }

    // While Back will go back the way you came, a back link says just that,
    // not the place written on it ("‹ Back to Today" from a coven holiday).
    if (canGoBack()) {
      let queued = false;
      const relabel = () => {
        queued = false;
        document.querySelectorAll("a.sp-back:not([data-back-relabelled])").forEach((link) => {
          link.dataset.backRelabelled = "";
          if (!isBackLink(link)) return;
          link.textContent = /^\s*←/.test(link.textContent) ? "← Back" : "‹ Back";
        });
      };
      relabel();
      if (typeof MutationObserver !== "undefined") {
        new MutationObserver(() => {
          if (queued) return;
          queued = true;
          global.requestAnimationFrame(relabel);
        }).observe(document.body, { childList: true, subtree: true });
      }
    }

    // Back links go back the way you came. Capturing runs this before a
    // page's own handler for the link (the coven page's tabs, for one).
    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const back = event.target.closest?.("a");
      if (!isBackLink(back) || !canGoBack()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      global.history.back();
    }, true);

    document.addEventListener("click", (event) => {
      // Fold the side bar, tuck the bottom bar away, bring it back.
      if (event.target.closest("[data-site-menu-fold]")) {
        writeKey(SIDEBAR_KEY, document.documentElement.classList.contains("site-menu-rail") ? "open" : "rail");
        applyMenuState();
        return;
      }
      const tuck = event.target.closest("[data-site-menu-tuck], [data-site-menu-restore]");
      if (tuck) {
        writeKey(BOTTOM_BAR_KEY, tuck.hasAttribute("data-site-menu-tuck") ? "tucked" : "shown");
        applyMenuState();
        return;
      }
      const state = panelState();
      const viewTab = event.target.closest("[data-site-tab-view]");
      if (viewTab) {
        // Tapping the open view's tab again closes the panel.
        if (state.open && state.tab === viewTab.dataset.siteTab) {
          event.preventDefault();
          global.closeMySanctuaryPanel?.();
          return;
        }
        if (openView(viewTab.dataset.siteTabView)) {
          event.preventDefault();
          return;
        }
      }
      // With the panel open, a link back to this same page just closes it.
      const link = state.open && event.target.closest(".site-tab[href], .site-menu-brand");
      if (link) {
        const target = new URL(link.getAttribute("href"), location.href);
        if (normalPath(target.pathname) === normalPath(location.pathname) && target.search === location.search) {
          event.preventDefault();
          global.closeMySanctuaryPanel?.();
          return;
        }
      }
      // A link to a part of the home page, from the home page with the panel open: close it first.
      const siteLink = state.open && event.target.closest(".site-menu-link");
      if (siteLink) global.closeMySanctuaryPanel?.();
      const accessibility = event.target.closest("[data-site-accessibility]");
      if (accessibility) document.querySelector("[data-accessibility-trigger]")?.click();
    });

    const params = new URLSearchParams(location.search);
    const requested = params.get("sanctuary");
    if (requested && openView(requested)) {
      params.delete("sanctuary");
      const query = params.toString();
      history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
    }
    if (params.get("ritual")) {
      // The altar builds its tools after its own scripts load.
      let tries = 0;
      const timer = setInterval(() => {
        if (openRitualCompanion() || ++tries > 40) clearInterval(timer);
      }, 150);
    }
  }

  const api = { TABS, SITE_TITLE, SITE_LINKS, SMALL_LINKS, PRACTICE, PANEL_TABS, activeTab, activeSiteLink, practiceSection, rememberedPractice, isHome, isBackLink, fallbackHref, canGoBack, render, install };
  global.SiteNav = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      // Pages load this at the top of <body>: draw the menu straight away, so
      // the page doesn't jump when it appears after the page's own scripts.
      // install() draws it again once the page is ready (the Sanctuary panel
      // may exist by then).
      if (document.body) render();
      document.addEventListener("DOMContentLoaded", install);
    } else install();
  }
})(typeof window !== "undefined" ? window : globalThis);
