/* =========================================================
   ALTAR TOOLBAR & HEADER
   The altar page's one toolbar ([data-altar-tools] in index.html), grouped
   as the app's altar editor groups it (AltarEditor.tsx), and the calm header
   above the stage, as the app's Altar tab has it:

   - line icons for every tool (the same drawing as the site's tabs,
     js/site-nav.js: 24px, 1.6 stroke, round ends), never emoji;
   - the More menu: rituals, Clear, How this works and Search;
   - the altar picker: the open altar's name, or "Choose an altar" when you
     have altars and none is open, or nothing at all when you have none. It
     opens My Altars (storage.js), which has Personal | Coven at its top;
   - Personal | Coven (js/segmented-switch.js): which altars you're among.
     Coven opens My Altars on its Coven tab (altar-tabs.js); Personal, from a
     coven's altar, goes back to your own;
   - the Companion (the selected object's page) shows in the side column only
     while it has something to say: an object chosen, or a ritual under way.

   Each button keeps its own handler where it always was: events.js for
   data-global-action, altar-reading.js for data-app-action="tool:…", and the
   cabinet, apothecary, guide and search openers by their data- attributes.
   ========================================================= */

(function initializeAltarToolbar(global) {
  "use strict";

  const ICONS = {
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
    more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    cabinet: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M4 9h16M4 15h16M11 6h2M11 12h2M11 18h2"/>',
    apothecary: '<path d="M9 3h6M10 3v5.5L5.2 17A2.6 2.6 0 0 0 7.5 21h9a2.6 2.6 0 0 0 2.3-4L14 8.5V3"/><path d="M7.5 15h9"/>',
    background: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.5"/>',
    flame: '<path d="M12 3c2.8 3.2 4.5 5.6 4.5 8.6a4.5 4.5 0 0 1-9 0c0-1.7.8-3.2 2-4.4.2 1.4.9 2.3 1.8 2.8C11 7.6 11.2 5.3 12 3Z"/><path d="M9 20h6"/>',
    snuff: '<path d="M7 13a5 5 0 0 1 10 0z"/><path d="M12 8V4M17 13l4 7"/><path d="M5 20h8"/>',
    petition: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 6.5 8.5 7 8.5-7"/>',
    workings: '<path d="m12 3 2.2 5.6L20 9.3l-4.5 3.8 1.4 5.9L12 15.9 7.1 19l1.4-5.9L4 9.3l5.8-.7z"/>',
    read: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    tonight: '<path d="M18.5 14.5A7.5 7.5 0 0 1 9.5 5.5a7.5 7.5 0 1 0 9 9Z"/><path d="m17 3 .6 1.6 1.6.6-1.6.6L17 7.4l-.6-1.6-1.6-.6 1.6-.6z"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4"/><path d="M12 7.5V12l3 2"/>',
    sky: '<path d="M14 4.5A6 6 0 0 0 19.5 13a6 6 0 1 1-5.5-8.5Z"/><path d="M4 19h7M6 16h4"/>',
    share: '<path d="M12 15V3M7.5 7.5 12 3l4.5 4.5"/><path d="M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12"/>',
    grimoire: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="m12 7 .9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3z"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4"/>',
    delete: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    ritual: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
    journal: '<path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h3"/>',
    select: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    group: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    clear: '<path d="M14 4 20 10l-8.5 8.5H7L4 15.5z"/><path d="m9 9 6 6M11 20.5h9"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6"/><circle cx="12" cy="17" r=".6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'
  };

  function icon(name) {
    const paths = ICONS[name];
    if (!paths) return "";
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  }

  /** Draw every [data-icon] under root that hasn't been drawn yet. */
  function drawIcons(root = document) {
    root.querySelectorAll("[data-icon]:not([data-icon-drawn])").forEach((el) => {
      el.innerHTML = icon(el.dataset.icon);
      el.setAttribute("data-icon-drawn", "");
    });
  }

  const api = { icon, drawIcons, closeMenus, ICONS };
  global.AltarToolbar = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  // ── More ────────────────────────────────────────────────────────────────
  const menuOf = (more) => more?.querySelector("[data-altar-more-menu]") || null;
  const itemsOf = (menu) => [...menu.querySelectorAll('[role="menuitem"]')].filter((el) => !el.disabled && el.offsetParent !== null);

  function setMenu(more, open, { focus = "first" } = {}) {
    const menu = menuOf(more);
    const toggle = more?.querySelector("[data-altar-more-toggle]");
    if (!menu || !toggle) return;
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    more.classList.toggle("is-open", open);
    if (open) {
      const items = itemsOf(menu);
      (focus === "last" ? items[items.length - 1] : items[0])?.focus({ preventScroll: true });
      // The whole menu in view, clear of the phone's tab bar (scroll-margin in altar-page.css).
      menu.scrollIntoView?.({ block: "nearest" });
    }
  }

  function closeMenus(except = null, { returnFocus = false } = {}) {
    document.querySelectorAll("[data-altar-more].is-open").forEach((more) => {
      if (more === except) return;
      setMenu(more, false);
      if (returnFocus) more.querySelector("[data-altar-more-toggle]")?.focus();
    });
  }

  // Capture on window: runs before the page's own handlers, some of which
  // (Start a ritual, Save as a ritual) stop the click from going further.
  global.addEventListener(
    "click",
    (event) => {
      const toggle = event.target.closest?.("[data-altar-more-toggle]");
      if (toggle) {
        const more = toggle.closest("[data-altar-more]");
        const open = !more.classList.contains("is-open");
        closeMenus(more);
        setMenu(more, open);
        return;
      }
      // Choosing anything in the menu, or clicking anywhere else, closes it.
      if (event.target.closest?.('[data-altar-more-menu] [role="menuitem"]') || !event.target.closest?.("[data-altar-more]")) closeMenus();
    },
    true
  );

  document.addEventListener("keydown", (event) => {
    const more = event.target.closest?.("[data-altar-more]");
    if (!more) return;
    const menu = menuOf(more);
    if (event.target.matches("[data-altar-more-toggle]") && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      setMenu(more, true, { focus: event.key === "ArrowUp" ? "last" : "first" });
      return;
    }
    if (!more.classList.contains("is-open") || !menu.contains(event.target)) return;
    const items = itemsOf(menu);
    const at = items.indexOf(event.target);
    const to = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: items.length - 1 }[event.key];
    if (to !== undefined) {
      event.preventDefault();
      items[(to + items.length) % items.length]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenus(null, { returnFocus: true });
    } else if (event.key === "Tab") {
      closeMenus();
    }
  });

  // ── The Companion, only while it has something to show ─────────────────
  function watchCompanion() {
    /* global altarCompanionPanel */
    const panel = typeof altarCompanionPanel !== "undefined" ? altarCompanionPanel : document.querySelector(".altar-companion-panel");
    if (!panel) return;
    const sync = () => {
      const identity = panel.dataset.companionIdentity;
      const empty = !!panel.querySelector("[data-companion-content] .companion-v3-empty-state");
      const open = panel.classList.contains("is-ritual-mode") || (identity !== undefined && !empty);
      document.body.classList.toggle("altar-companion-open", open);
    };
    new MutationObserver(sync).observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "data-companion-identity"] });
    sync();
  }

  // ── Personal | Coven, and the altar picker ─────────────────────────────
  const scopeHost = () => document.querySelector("[data-altar-scope]");
  const picker = () => document.querySelector("[data-altar-picker]");
  const SCOPES = [
    { key: "personal", label: "Personal" },
    { key: "coven", label: "Coven" }
  ];
  const onCovenAltar = () => document.body.classList.contains("is-coven-altar") || !!global.CovenAltarPage?.altarId;
  let saved = null; // your saved altars, once known

  function drawScope() {
    const host = scopeHost();
    const SW = global.SaltSwitch;
    if (!host || !SW) return;
    const value = onCovenAltar() ? "coven" : "personal";
    host.innerHTML = SW.html({ id: "altar-scope", label: "Whose altars", options: SCOPES, value });
  }

  function chooseScope(next, { focus } = {}) {
    if (next === "coven") {
      global.SaltAltarTabs?.open?.("coven");
    } else if (onCovenAltar()) {
      if (global.confirm("Leave the coven’s altar for your own altars?")) {
        global.location.assign(global.SaltEnvironment?.resolvePath?.("/altar/") || "/altar/");
        return;
      }
    }
    // The switch shows where you are; choosing Coven opens the list without moving you yet.
    drawScope();
    if (focus) global.SaltSwitch?.focus(scopeHost(), "altar-scope");
  }

  function drawPicker() {
    const button = picker();
    if (!button) return;
    const labelEl = button.querySelector("[data-altar-picker-label]");
    let text = "";
    if (onCovenAltar()) {
      text = global.currentSavedAltarName || "A coven altar";
    } else if (global.currentSavedAltarId) {
      const known = saved?.find((altar) => altar.id === global.currentSavedAltarId);
      text = known?.name || global.currentSavedAltarName || (saved ? "" : "Your altar");
    }
    if (!text && saved?.some((altar) => altar.archived !== true)) text = "Choose an altar";
    if (!text && saved?.length) text = "Your altars";
    if (labelEl && labelEl.textContent !== text) labelEl.textContent = text;
    button.setAttribute("aria-label", text && text !== "Choose an altar" ? `${text}. Your altars` : "Choose an altar");
    button.hidden = !text;
    if (text) button.classList.remove("is-loading");
  }

  let loading = null;
  function loadSaved() {
    if (typeof global.getSavedAltars !== "function") return Promise.resolve();
    if (!loading) {
      loading = Promise.resolve()
        .then(() => global.getSavedAltars())
        .then((list) => { saved = Array.isArray(list) ? list : []; })
        .catch(() => { saved = saved || []; })
        .finally(() => {
          loading = null;
          drawPicker();
        });
    }
    return loading;
  }

  function startHeader() {
    drawScope();
    drawPicker();
    const SW = global.SaltSwitch;
    if (SW && scopeHost()) SW.bind(scopeHost(), "altar-scope", (next, options) => chooseScope(next, options));
    picker()?.addEventListener("click", () => global.SaltAltarTabs?.open?.(onCovenAltar() ? "coven" : "personal"));
    const later = () => setTimeout(drawPicker, 0);
    document.addEventListener("altar:current-changed", later);
    document.addEventListener("app-altar:changed", () => { drawScope(); later(); });
    document.addEventListener("altar:saved", () => void loadSaved());
    document.addEventListener("saltAuthSuccess", () => void loadSaved());
    global.SaltPage?.onUserChange?.(() => void loadSaved());
    // My Altars closing may follow a rename, archive or delete there.
    const manager = document.querySelector(".saved-altars-modal");
    if (manager) new MutationObserver(() => { if (manager.hidden) void loadSaved(); }).observe(manager, { attributes: true, attributeFilter: ["hidden"] });
    Promise.resolve(global.SaltPage?.ready?.()).catch(() => null).finally(() => void loadSaved());
  }

  drawIcons();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { drawIcons(); watchCompanion(); startHeader(); }, { once: true });
  } else {
    watchCompanion();
    startHeader();
  }
})(typeof window !== "undefined" ? window : globalThis);
