/*
 * The one search picker, the website's twin of the app's
 * components/covens/SearchPicker.tsx (its search and ranking are the app's
 * own, lib/covens/picker.ts and lib/altar/itemIndex.ts, through js/core):
 * type to find, press to add, and each pick shows as a chip (with a picture,
 * for items) that can be taken away. Search only: with nothing typed it
 * shows a few suggestions, never the whole list.
 *
 *   CovenPicker.create(holder, {
 *     id, label, hint, placeholder, empty, max,
 *     chips: () => [{ key, label, image }],
 *     search: (query, pickedKeys) => [{ key, label, detail, image }],
 *     onAdd: (entry) => {}, onRemove: (key) => {}
 *   }) -> { refresh() }
 */
(function (global) {
  "use strict";

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // An altar object picture's small WebP twin (js/sanctuary-asset-catalog.js thumbnailPath).
  const thumbnail = (path) => String(path || "").replace(/(assets\/altar\/(?:objects|overlays)\/(?:[\w-]+\/)*[\w-]+)\.png$/i, "$1.thumb.webp");
  const picture = (raw) => {
    const path = thumbnail(raw);
    if (!path) return "";
    if (/^https:\/\//.test(path)) return path;
    const clean = String(path).replace(/^(\.\.\/)+/, "/");
    return global.CovenUI?.href ? global.CovenUI.href(clean) : clean;
  };

  function create(holder, options) {
    const id = options.id || `pk-${Math.random().toString(36).slice(2, 8)}`;
    holder.innerHTML = `<div class="cv-search">
        <label class="sp-label" for="${esc(id)}">${esc(options.label)}</label>
        ${options.hint ? `<p class="sp-caption">${esc(options.hint)}</p>` : ""}
        <ul class="cv-search__chips" aria-label="${esc(options.label)}" data-chips></ul>
        <input id="${esc(id)}" type="search" autocomplete="off" spellcheck="false" placeholder="${esc(options.placeholder || "Type to search")}" data-query />
        <div class="cv-search__results" data-results></div>
      </div>`;
    const chipsEl = holder.querySelector("[data-chips]");
    const input = holder.querySelector("[data-query]");
    const results = holder.querySelector("[data-results]");
    let found = [];

    const chips = () => options.chips() || [];
    const full = () => options.max != null && chips().length >= options.max;

    function drawChips() {
      const list = chips();
      chipsEl.innerHTML = list.length
        ? list
            .map(
              (c) => `<li class="cv-search__chip">${c.image ? `<img src="${esc(picture(c.image))}" alt="" loading="lazy" />` : ""}<span>${esc(c.label)}</span>
                <button type="button" class="cv-search__remove" data-remove="${esc(c.key)}" aria-label="Remove ${esc(c.label)}">×</button></li>`
            )
            .join("")
        : options.empty
          ? `<li class="sp-caption">${esc(options.empty)}</li>`
          : "";
      input.hidden = full();
    }

    function drawResults() {
      if (full()) {
        results.innerHTML = "";
        return;
      }
      const query = input.value;
      // Suggestions only while the picker is in use; otherwise just the chips.
      if (!query.trim() && !holder.contains(global.document.activeElement)) {
        found = [];
        results.innerHTML = "";
        return;
      }
      found = options.search(query, chips().map((c) => c.key)) || [];
      if (!found.length) {
        results.innerHTML = query.trim() ? `<p class="sp-caption">Nothing matches that. Try another word.</p>` : "";
        return;
      }
      results.innerHTML = `${query.trim() ? "" : `<p class="sp-caption">Suggestions</p>`}<ul class="cv-search__list">${found
        .map(
          (e, i) => `<li><button type="button" class="cv-search__result" data-pick="${i}">
            ${e.image ? `<img src="${esc(picture(e.image))}" alt="" loading="lazy" />` : `<span class="cv-search__dot" aria-hidden="true"></span>`}
            <span class="cv-search__text"><span>${esc(e.label)}</span>${e.detail ? `<span class="sp-caption">${esc(e.detail)}</span>` : ""}</span>
            <span class="cv-search__add">Add</span></button></li>`
        )
        .join("")}</ul>`;
    }

    function add(entry) {
      if (!entry) return;
      options.onAdd(entry);
      input.value = "";
      drawChips();
      if (!input.hidden) input.focus();
      drawResults();
    }

    input.addEventListener("input", drawResults);
    input.addEventListener("focus", drawResults);
    holder.addEventListener("focusout", (event) => {
      if (!holder.contains(event.relatedTarget)) global.setTimeout(drawResults, 0);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (input.value.trim()) add(found[0]);
      }
    });
    results.addEventListener("click", (event) => {
      const button = event.target.closest("[data-pick]");
      if (button) add(found[Number(button.dataset.pick)]);
    });
    chipsEl.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove]");
      if (!button) return;
      options.onRemove(button.dataset.remove);
      drawChips();
      drawResults();
      input.focus();
    });

    drawChips();
    drawResults();
    return {
      refresh() {
        drawChips();
        drawResults();
      }
    };
  }

  global.CovenPicker = { create };
})(window);
