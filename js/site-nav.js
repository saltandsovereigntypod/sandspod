/*
 * The site's main bar, shared by every page, laid out like the app's tabs:
 * Today · Altar · Grimoire · Rituals · Podcast · More.
 *
 * On computers and iPads it sits in the top header. On phones it moves to the
 * bottom of the screen with five tabs; Podcast is reached from the logo and
 * from More. Today, Rituals and More open the Sanctuary panel or the altar's
 * Ritual Companion; pages without the panel send those tabs to the home page,
 * which opens them on arrival.
 */
(function (global) {
  const ICONS = {
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    altar: '<path d="M12 3c1.6 2 1.6 3.4 0 4.6-1.6-1.2-1.6-2.6 0-4.6Z"/><path d="M9.5 9.5h5V19h-5z"/><path d="M5 21h14"/>',
    grimoire: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="m12 7 .9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3z"/>',
    rituals: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
    podcast: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
    more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>'
  };

  const TABS = [
    { key: "today", label: "Today", view: "dashboard" },
    { key: "altar", label: "Altar", href: "/altar/" },
    { key: "grimoire", label: "Grimoire", href: "/grimoire/" },
    { key: "rituals", label: "Rituals", href: "/altar/?ritual=1" },
    { key: "podcast", label: "Podcast", href: "/" },
    { key: "more", label: "More", view: "more" }
  ];

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

  /** Which tab a page belongs to. */
  function activeTab(pathname, search = "") {
    const path = normalPath(pathname);
    if (path.startsWith("/altar/")) return new URLSearchParams(search).get("ritual") ? "rituals" : "altar";
    if (path === "/grimoire/") return "grimoire";
    if (path === "/" || path.startsWith("/blog/")) return "podcast";
    return "more";
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
    const href = tab.view ? `/?sanctuary=${tab.view}` : tab.href;
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
    document.addEventListener("click", (event) => {
      const viewTab = event.target.closest("[data-site-tab-view]");
      if (viewTab && openView(viewTab.dataset.siteTabView)) {
        event.preventDefault();
        return;
      }
      const ritualTab = event.target.closest('[data-site-tab="rituals"]');
      if (ritualTab && activeTab(location.pathname) === "altar" && openRitualCompanion()) {
        event.preventDefault();
        history.replaceState(null, "", "/altar/?ritual=1");
        return;
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

  const api = { TABS, activeTab, isHome, render, install };
  global.SiteNav = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
    else install();
  }
})(typeof window !== "undefined" ? window : globalThis);
