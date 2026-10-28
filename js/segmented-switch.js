/*
 * The pill-shaped switch between two halves of a page, as the app's
 * SegmentedSwitch (app/src/components/SegmentedSwitch.tsx): Today | Sky & Lore
 * on Today, My covens | Find a coven on Covens. It looks like the Grimoire |
 * Rituals switch (.practice-switch in css/site-nav.css), but switches tabs in
 * the page rather than pages, so it is a tablist: arrow keys move between
 * the tabs, and the chosen one is aria-selected.
 *
 * The last tab used is kept in this browser (localStorage), and a page that
 * can't store it still works: it opens on its first tab.
 */
(function (global) {
  "use strict";

  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /**
   * The switch's markup. `id` names it, so each tab can point at its panel
   * (`${id}-panel`) and the panel back at the chosen tab (`${id}-${key}`).
   */
  function html({ id, label, options, value }) {
    return (
      `<div class="seg-switch" role="tablist" aria-label="${esc(label)}" data-seg-switch="${esc(id)}">` +
      options
        .map((o) => {
          const on = o.key === value;
          return `<button type="button" role="tab" id="${esc(`${id}-${o.key}`)}" aria-selected="${on}" aria-controls="${esc(`${id}-panel`)}" tabindex="${on ? 0 : -1}" data-seg-tab="${esc(o.key)}">${esc(o.label)}</button>`;
        })
        .join("") +
      `</div>`
    );
  }

  /** The panel that holds the chosen tab's content. */
  function panel({ id, value }, inner) {
    return `<div role="tabpanel" id="${esc(`${id}-panel`)}" aria-labelledby="${esc(`${id}-${value}`)}" data-seg-panel="${esc(id)}">${inner}</div>`;
  }

  /**
   * Calls onChange(key) when a tab of switch `id` inside `root` is chosen, by
   * click or by arrow keys (Home and End too). Bound once on `root`, so the
   * page can redraw the switch freely.
   */
  function bind(root, id, onChange) {
    root.addEventListener("click", (event) => {
      const tab = event.target.closest(`[data-seg-switch="${id}"] [data-seg-tab]`);
      if (!tab || tab.getAttribute("aria-selected") === "true") return;
      onChange(tab.dataset.segTab, { focus: false });
    });
    root.addEventListener("keydown", (event) => {
      const tab = event.target.closest(`[data-seg-switch="${id}"] [data-seg-tab]`);
      if (!tab) return;
      const tabs = [...tab.parentElement.querySelectorAll("[data-seg-tab]")];
      const at = tabs.indexOf(tab);
      const to = { ArrowRight: at + 1, ArrowDown: at + 1, ArrowLeft: at - 1, ArrowUp: at - 1, Home: 0, End: tabs.length - 1 }[event.key];
      if (to === undefined) return;
      event.preventDefault();
      const next = tabs[(to + tabs.length) % tabs.length];
      if (next !== tab) onChange(next.dataset.segTab, { focus: true });
    });
  }

  /** After a redraw, put focus back on the chosen tab (for keyboard users). */
  function focus(root, id) {
    root.querySelector(`[data-seg-switch="${id}"] [aria-selected="true"]`)?.focus();
  }

  /** The tab kept under `key`, if `parse` accepts it; null if none or storage is blocked. */
  function remembered(key, parse) {
    try {
      return parse(global.localStorage?.getItem(key) ?? null);
    } catch {
      return null;
    }
  }

  function remember(key, value) {
    try {
      global.localStorage?.setItem(key, value);
    } catch {
      // A private window may refuse; the tab is still used while the page is open.
    }
  }

  const api = { html, panel, bind, focus, remembered, remember };
  global.SaltSwitch = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
