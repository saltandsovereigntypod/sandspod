/*
 * The site's main bar, shared by every page, laid out like the app's tabs:
 * Today · Altar · Practice · Coven · More.
 * Practice holds three sections, as in the app: the Grimoire (/grimoire/),
 * Rituals (/rituals/: ritual work) and Craft (/practice/: the tools that
 * aren't rituals, with Cycle & Moon at /rituals/cycle/, divination at
 * /divination/ and the sigil maker at /sigil/, all kept where they were), with
 * a Grimoire | Rituals | Craft switch at the top of those pages; the tab
 * returns to whichever was used last. Coven is /covens/. The podcast is the logo (the home page), as in the app.
 *
 * On computers and iPads it sits in the top header. On phones it moves to the
 * bottom of the screen. More opens the Sanctuary panel; pages without the
 * panel send it to the home page, which opens it on arrival.
 *
 * Back goes to the screen you came from, as in the app. Pages that have their
 * own back link ("‹ Back to Today", "← All rituals") keep it, but it now goes
 * back the way you came while there is somewhere on the site to go back to,
 * and only falls back to its written place when there isn't (a shared link,
 * a fresh tab). Every other page gets a standard "‹ Back" under the header;
 * the tabs' own first pages show it only when there is somewhere to go back to.
 */
(function (global) {
  const ICONS = {
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    altar: '<path d="M12 3c1.6 2 1.6 3.4 0 4.6-1.6-1.2-1.6-2.6 0-4.6Z"/><path d="M9.5 9.5h5V19h-5z"/><path d="M5 21h14"/>',
    grimoire: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="m12 7 .9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3z"/>',
    rituals: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
    podcast: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
    practice: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M15.5 12.4A3.6 3.6 0 0 1 10.6 7.5a3.6 3.6 0 1 0 4.9 4.9Z"/>',
    coven: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="5.5" r="1.7"/><circle cx="6.2" cy="15.4" r="1.7"/><circle cx="17.8" cy="15.4" r="1.7"/><path d="M12 9.5v2.2l-3.4 2M12 11.7l3.4 2"/>',
    more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>'
  };

  const TABS = [
    { key: "today", label: "Today", href: "/today/" },
    { key: "altar", label: "Altar", href: "/altar/" },
    { key: "practice", label: "Practice", href: "/grimoire/" },
    { key: "coven", label: "Coven", href: "/covens/" },
    { key: "more", label: "More", view: "more" }
  ];

  // The three sections of Practice, switched at the top of their pages (the
  // app's lib/practiceSections.ts PRACTICE_SECTIONS).
  const PRACTICE = [
    { key: "grimoire", label: "Grimoire", href: "/grimoire/" },
    { key: "rituals", label: "Rituals", href: "/rituals/" },
    { key: "craft", label: "Craft", href: "/practice/" }
  ];
  const PRACTICE_KEY = "saltPracticeSection";

  const PHONE_QUERY = "(max-width: 700px)";

  const PODCAST_SECTIONS = [
    ["About", "#about"],
    ["Podcast", "#podcast"],
    ["Books", "#books"],
    ["Blog", "#blog"],
    ["Contact", "#contact"]
  ];

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
    if (path === "/grimoire/" || path.startsWith("/grimoire/dreams/")) return "grimoire";
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

  function renderBack(doc = document, loc = global.location) {
    doc.querySelectorAll(".site-back-bar").forEach((el) => el.remove());
    if (TAB_ROOTS.has(normalPath(loc.pathname)) && !canGoBack(loc, doc)) return;
    const header = doc.querySelector(".site-header");
    if (!header) return;
    header.insertAdjacentHTML("afterend", `<div class="site-back-bar"><a class="site-back" href="${fallbackHref(loc)}">‹ Back</a></div>`);
  }

  function isHome(pathname) {
    return normalPath(pathname) === "/";
  }

  function icon(key) {
    return `<svg class="site-tab-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[key]}</svg>`;
  }

  function tabMarkup(tab, current, hasPanel) {
    const attrs = `class="site-tab" data-site-tab="${tab.key}"${tab.key === current ? ' aria-current="page"' : ""}`;
    const inner = `${icon(tab.key)}<span class="site-tab-label">${tab.label}</span>`;
    if (tab.view && hasPanel) return `<button type="button" ${attrs} data-site-tab-view="${tab.view}">${inner}</button>`;
    let href = tab.view ? `/?sanctuary=${tab.view}` : tab.href;
    if (tab.key === "practice") href = PRACTICE.find((p) => p.key === rememberedPractice()).href;
    return `<a href="${href}" ${attrs}>${inner}</a>`;
  }

  function render(doc = document, loc = global.location) {
    const hasPanel = typeof global.openMySanctuaryPanel === "function";
    const current = activeTab(loc.pathname, loc.search);
    let header = doc.querySelector(".site-header");
    if (!header) {
      header = doc.createElement("header");
      header.className = "site-header";
      header.innerHTML = '<nav class="nav" aria-label="Primary navigation"></nav>';
      doc.body.prepend(header);
    }
    const nav = header.querySelector(".nav") || header;
    const brand = nav.querySelector(".brand");
    if (brand) {
      brand.setAttribute("href", "/");
      brand.setAttribute("aria-label", "Salt & Sovereignty podcast home");
    } else {
      nav.insertAdjacentHTML("afterbegin", '<a class="brand" href="/" aria-label="Salt & Sovereignty podcast home"><span class="brand-mark" aria-hidden="true">S&amp;S</span><span>Salt &amp; Sovereignty</span></a>');
    }
    doc.querySelectorAll(".site-tabs").forEach((tabs) => tabs.remove());
    nav.insertAdjacentHTML("beforeend", `<div class="site-tabs" role="navigation" aria-label="Main">${TABS.map((tab) => tabMarkup(tab, current, hasPanel)).join("")}</div>`);
    placeTabs(doc);

    doc.querySelectorAll(".practice-switch").forEach((el) => el.remove());
    const section = practiceSection(loc.pathname, loc.search);
    if (section) {
      try {
        global.localStorage?.setItem(PRACTICE_KEY, section);
      } catch {
        // Private windows may refuse; the tab then opens the Grimoire.
      }
      header.insertAdjacentHTML(
        "afterend",
        `<nav class="practice-switch" aria-label="Practice">${PRACTICE.map((p) => `<a href="${p.href}"${p.key === section ? ' aria-current="page"' : ""}>${p.label}</a>`).join("")}</nav>`
      );
    }

    renderBack(doc, loc);

    header.querySelector(".site-subnav")?.remove();
    if (isHome(loc.pathname)) {
      header.insertAdjacentHTML("beforeend", `<nav class="site-subnav" aria-label="On this page">${PODCAST_SECTIONS.map(([label, hash]) => `<a href="${hash}">${label}</a>`).join("")}</nav>`);
    }
    doc.body.classList.add("has-site-nav");
  }

  // On phones the tabs sit at the bottom of the screen. The header's blur
  // would pin a fixed bar to the header, so there they live on the page itself.
  function placeTabs(doc = document) {
    const tabs = doc.querySelector(".site-tabs");
    const nav = doc.querySelector(".site-header .nav") || doc.querySelector(".site-header");
    if (!tabs || !nav) return;
    const phone = global.matchMedia?.(PHONE_QUERY).matches;
    if (phone && tabs.parentElement !== doc.body) doc.body.append(tabs);
    if (!phone && tabs.parentElement !== nav) nav.append(tabs);
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

  // The panel opens below the header, so the logo and the tabs stay in reach.
  function measureHeader(doc = document) {
    const header = doc.querySelector(".site-header");
    if (header) doc.documentElement.style.setProperty("--site-header-h", `${header.offsetHeight}px`);
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
    global.matchMedia?.(PHONE_QUERY).addEventListener?.("change", () => placeTabs());
    measureHeader();
    // Once a frame at most while a window is being resized (it reads layout).
    let measuring = 0;
    global.addEventListener("resize", () => {
      if (!measuring) measuring = global.requestAnimationFrame(() => ((measuring = 0), measureHeader()));
    }, { passive: true });
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
      const link = state.open && event.target.closest(".site-tab[href], .site-header .brand");
      if (link) {
        const target = new URL(link.getAttribute("href"), location.href);
        if (normalPath(target.pathname) === normalPath(location.pathname) && target.search === location.search) {
          event.preventDefault();
          global.closeMySanctuaryPanel?.();
          return;
        }
      }
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

  const api = { TABS, PRACTICE, PANEL_TABS, activeTab, practiceSection, rememberedPractice, isHome, isBackLink, fallbackHref, canGoBack, render, install };
  global.SiteNav = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      // Pages load this at the top of <body>, or just after their own
      // .site-header: draw the bar straight away, so the page doesn't jump
      // when it appears after the page's own scripts. install() draws it
      // again once the page is ready (the Sanctuary panel may exist by then).
      // (scripts/validate-static.js checks it never comes before a header.)
      if (document.body) render();
      document.addEventListener("DOMContentLoaded", install);
    } else install();
  }
})(typeof window !== "undefined" ? window : globalThis);
