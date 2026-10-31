/* =========================================================
   GRIMOIRE HOME, AS YOU ARRANGE IT
   File: grimoire/js/ui/layout.js

   The table of contents follows your own layout, the same one the app's
   Grimoire home uses (lib/grimoire/layout.ts, through js/core/grimoire.js),
   saved in your settings as `grimoire_layout` so both open the same:
   every part (your loose pages, each of your sections, My Practice, Dreams,
   Traditional Information) opens and closes, and under Customise moves up
   or down, hides and takes a new name. Pages sort newest, oldest, A to Z or
   in your own order, filter by kind, and can be filed in a section.

   The other scripts draw the parts; this arranges them after each drawing.
   ========================================================= */

(function (global) {
  "use strict";

  const G = () => global.SaltCore && global.SaltCore.grimoire;
  let layout = null;
  let customising = false;
  let arranging = false;
  let observer = null;

  const esc = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  let layoutUser = null;
  let loading = null;

  /** The layout for whoever is signed in now (read again when that changes). */
  function currentLayout() {
    const id = typeof getUser === "function" ? getUser()?.id || null : null;
    if (layout && layoutUser === id) return layout;
    if (!loading) {
      loading = (async () => {
        layout = null;
        await loadLayout();
        layoutUser = id;
        loading = null;
        arrange();
      })();
    }
    return null;
  }

  async function loadLayout() {
    if (layout) return layout;
    let raw = "";
    try {
      const settings = typeof getMySettings === "function" ? await getMySettings() : {};
      raw = settings.grimoire_layout || "";
    } catch (error) {
      console.warn("The Grimoire layout could not be read.", error);
    }
    layout = G().layout.parseLayout(raw);
    return layout;
  }

  async function saveLayout(next) {
    layout = next;
    arrange();
    try {
      if (typeof getMySettings !== "function" || typeof saveMySettings !== "function") return;
      const settings = await getMySettings();
      await saveMySettings({ ...settings, grimoire_layout: G().layout.serializeLayout(next) });
    } catch (error) {
      console.warn("The Grimoire layout could not be saved.", error);
    }
  }

  /** Each part of the table of contents, by its layout key. */
  function partElements(toc) {
    const found = new Map();
    const shelf = (key, selector) => {
      const el = toc.querySelector(selector);
      if (el) found.set(key, el);
    };
    shelf("myPractice", "[data-my-practice-shelf]");
    shelf("dreams", "[data-dreams-shelf]");
    // The practice journals kept in the Grimoire (grimoire/js/ui/journals.js).
    toc.querySelectorAll("[data-journal-shelf]").forEach((el) => found.set(el.dataset.journalShelf, el));
    shelf("traditional", "[data-traditional-library-shelf]");
    toc.querySelectorAll(".book-toc-section").forEach((el) => {
      const toggle = el.querySelector(":scope > .book-section-row [data-toggle-section]");
      if (toggle) found.set(`section:${toggle.dataset.toggleSection}`, el);
      else if (el.querySelector(':scope > [data-section-id=""]')) found.set("pages", el);
    });
    return found;
  }

  function titleOf(el) {
    return el.querySelector(".book-section-title span") || el.querySelector(".book-section-title");
  }

  function bodyOf(el) {
    return el.querySelector(":scope > .book-section-pages");
  }

  const SHELF_TITLES = { myPractice: "My Practice", dreams: "Dreams", shadowJournal: "Shadow work", devotionJournal: "Deity & spirit", ancestorJournal: "Ancestors", omenJournal: "Omens & signs", traditional: "Traditional Information" };

  function parts(found) {
    const L = G().layout;
    const sectionList = (typeof sections !== "undefined" ? sections : []).filter((s) => found.has(`section:${s.id}`));
    return L.personalParts({
      sections: sectionList,
      loose: found.has("pages"),
      shelves: ["myPractice", "dreams", "shadowJournal", "devotionJournal", "ancestorJournal", "omenJournal", "traditional"].filter((k) => found.has(k)).map((key) => ({ key, title: SHELF_TITLES[key] }))
    });
  }

  /** Pages of a part, sorted and filtered as the layout says. */
  function arrangePages(el, key) {
    const L = G().layout;
    const body = bodyOf(el);
    if (!body || typeof pages === "undefined") return;
    const sectionId = L.sectionIdOf(key);
    const list = pages.filter((p) => (sectionId ? p.section_id === sectionId : !p.section_id));
    const shown = L.shownPages(list, layout);
    const rows = new Map([...body.querySelectorAll(":scope > .book-page-row")].map((row) => [row.querySelector("[data-page-id]")?.dataset.pageId, row]));
    const custom = layout.sort === "custom" && !layout.kind;
    rows.forEach((row, id) => {
      row.hidden = !shown.some((p) => p.id === id);
      const moves = row.querySelector(".book-toc-move-controls");
      if (moves) moves.hidden = !custom;
      row.querySelector("[data-layout-file]")?.remove();
      if (customising) {
        const select = document.createElement("select");
        select.className = "grimoire-layout-file";
        select.setAttribute("data-layout-file", id);
        select.setAttribute("aria-label", "File this page in a section");
        const page = list.find((p) => p.id === id);
        select.innerHTML = `<option value="">No section</option>${(typeof sections !== "undefined" ? sections : [])
          .map((s) => `<option value="${esc(s.id)}" ${page && page.section_id === s.id ? "selected" : ""}>${esc(s.title)}</option>`)
          .join("")}`;
        row.appendChild(select);
      }
    });
    shown.forEach((p) => {
      const row = rows.get(p.id);
      if (row) body.appendChild(row);
    });
  }

  function controls(item, index, count) {
    const row = document.createElement("div");
    row.className = "grimoire-layout-controls";
    row.setAttribute("data-layout-controls", item.key);
    row.innerHTML = `
      <button type="button" data-layout-move="up" ${index === 0 ? "disabled" : ""} aria-label="Move ${esc(item.title)} up">↑</button>
      <button type="button" data-layout-move="down" ${index === count - 1 ? "disabled" : ""} aria-label="Move ${esc(item.title)} down">↓</button>
      <button type="button" data-layout-rename>Rename</button>
      <button type="button" data-layout-hide>${item.hidden ? "Show" : "Hide"}</button>`;
    return row;
  }

  function bar(toc) {
    let el = toc.querySelector("[data-layout-bar]");
    if (!el) {
      el = document.createElement("div");
      el.className = "grimoire-layout-bar";
      el.setAttribute("data-layout-bar", "");
    }
    const L = G().layout;
    const kinds = typeof pages !== "undefined" ? L.pageKinds(pages) : [];
    el.innerHTML = customising
      ? `<p class="book-note">Move, hide and rename the parts of your book, and choose how pages are sorted. The app’s Grimoire opens the same.</p>
        <label>Pages in order of
          <select data-layout-sort>${L.PAGE_SORTS.map((s) => `<option value="${s.value}" ${layout.sort === s.value ? "selected" : ""}>${esc(s.label)}</option>`).join("")}</select>
        </label>
        ${kinds.length > 1 ? `<label>Show
          <select data-layout-kind><option value="">Every page</option>${kinds.map((k) => `<option value="${esc(k.kind)}" ${layout.kind === k.kind ? "selected" : ""}>${esc(k.label)} (${k.count})</option>`).join("")}</select>
        </label>` : ""}
        <div class="grimoire-layout-actions">
          <button type="button" class="button button--ghost button--small" data-layout-reset>Back to the default</button>
          <button type="button" class="button button--primary button--small" data-layout-done>Done</button>
        </div>`
      : `<div class="grimoire-layout-actions">
          ${layout.sort !== "custom" || layout.kind ? `<span class="book-note">${esc([layout.sort !== "custom" ? `Sorted ${L.PAGE_SORTS.find((s) => s.value === layout.sort).label.toLowerCase()}` : "", layout.kind ? `only ${L.kindLabel(layout.kind).toLowerCase()}` : ""].filter(Boolean).join(" · "))}</span>
            <button type="button" class="button button--ghost button--small" data-layout-clear>Show all</button>` : ""}
          <button type="button" class="button button--ghost button--small" data-layout-customise>Customise</button>
        </div>`;
    return el;
  }

  function arrange() {
    const toc = typeof grimoireShelf !== "undefined" ? grimoireShelf : null;
    if (!toc || !G() || arranging) return;
    if (typeof getUser === "function" && !getUser()) return;
    if (!currentLayout()) return;
    arranging = true;
    try {
      const L = G().layout;
      const found = partElements(toc);
      const homeParts = parts(found);
      const items = L.arrangeHome(layout, homeParts, { withHidden: customising });
      const all = L.arrangeHome(layout, homeParts, { withHidden: true });
      toc.prepend(bar(toc));
      toc.classList.toggle("is-customising", customising);
      const anchor = toc.querySelector("[data-layout-bar]");
      let after = anchor;
      all.forEach((item) => {
        const el = found.get(item.key);
        if (!el) return;
        const shown = items.find((i) => i.key === item.key);
        el.hidden = !shown;
        el.classList.toggle("is-layout-hidden", item.hidden);
        el.setAttribute("data-layout-key", item.key);
        after.insertAdjacentElement("afterend", el);
        after = el;
        const title = titleOf(el);
        if (title) title.textContent = `${item.open ? "▾" : "▸"} ${item.title}`;
        const button = el.querySelector(".book-section-title");
        if (button) button.setAttribute("aria-expanded", String(item.open));
        const body = bodyOf(el);
        if (body) body.hidden = !item.open;
        // The section's own up and down buttons give way to the layout's order.
        const moves = el.querySelector(":scope > .book-section-row > .book-toc-move-controls");
        if (moves) moves.hidden = true;
        el.querySelector(":scope > [data-layout-controls]")?.remove();
        if (customising) el.insertBefore(controls(item, all.indexOf(item), all.length), body || null);
        if (item.key === "pages" || item.key.startsWith("section:")) arrangePages(el, item.key);
      });
    } finally {
      // Its own moves aren't news to it.
      observer?.takeRecords();
      arranging = false;
    }
  }

  function keyOf(target) {
    return target.closest("[data-layout-key]")?.dataset.layoutKey || null;
  }

  function currentParts() {
    return parts(partElements(grimoireShelf));
  }

  async function onClick(event) {
    if (!layout || !G()) return;
    const L = G().layout;
    const t = event.target;
    if (t.closest("[data-layout-customise]")) return (customising = true), arrange();
    if (t.closest("[data-layout-done]")) return (customising = false), arrange();
    if (t.closest("[data-layout-reset]")) return saveLayout(L.resetHome(layout));
    if (t.closest("[data-layout-clear]")) return saveLayout({ ...layout, sort: "custom", kind: null });
    const key = keyOf(t);
    if (!key) return;
    const move = t.closest("[data-layout-move]");
    if (move) return saveLayout(L.moveHomePart(layout, currentParts(), key, move.dataset.layoutMove));
    if (t.closest("[data-layout-hide]")) {
      const hidden = layout.hidden.includes(key);
      return saveLayout(L.setPartHidden(layout, key, !hidden));
    }
    if (t.closest("[data-layout-rename]")) {
      const item = L.arrangeHome(layout, currentParts(), { withHidden: true }).find((i) => i.key === key);
      const name = global.prompt("A new name", item ? item.title : "");
      if (name == null) return;
      const sectionId = L.sectionIdOf(key);
      if (sectionId) return renameSection(sectionId, name);
      return saveLayout(L.renamePart(layout, key, name, item?.defaultTitle));
    }
    // A part's title opens and closes it, remembered in the layout.
    const title = t.closest(".book-section-title");
    const part = t.closest("[data-layout-key]");
    // Only the part's own title (a section's sits in its row), not a group's inside it.
    const own = title && (title.parentElement === part || title.parentElement?.parentElement === part);
    if (own) {
      event.preventDefault();
      event.stopPropagation();
      const item = L.arrangeHome(layout, currentParts()).find((i) => i.key === key);
      if (item) saveLayout(L.setPartOpen(layout, key, !item.open));
    }
  }

  async function renameSection(sectionId, name) {
    const title = String(name || "").trim();
    if (!title) return;
    const { error } = await db.from("grimoire_sections").update({ title, updated_at: new Date().toISOString() }).eq("id", sectionId);
    if (error) return setStatus(error.message);
    if (typeof loadSections === "function") await loadSections();
    if (typeof renderShelf === "function") renderShelf();
  }

  async function onChange(event) {
    if (!layout || !G()) return;
    const t = event.target;
    if (t.matches("[data-layout-sort]")) return saveLayout(G().layout.setPageSort(layout, t.value));
    if (t.matches("[data-layout-kind]")) return saveLayout(G().layout.setPageKind(layout, t.value || null));
    if (t.matches("[data-layout-file]")) {
      const pageId = t.dataset.layoutFile;
      const sectionId = t.value || null;
      const siblings = pages.filter((p) => (p.section_id || null) === sectionId);
      const sortOrder = siblings.length ? Math.max(...siblings.map((p) => p.sort_order || 0)) + 1 : 0;
      const { error } = await db.from("grimoire_pages").update({ section_id: sectionId, sort_order: sortOrder, updated_at: new Date().toISOString() }).eq("id", pageId);
      if (error) return setStatus(error.message);
      if (typeof loadPages === "function") await loadPages();
      if (typeof renderShelf === "function") renderShelf();
      if (typeof flashStatus === "function") flashStatus("Page filed.");
    }
  }

  async function start() {
    const toc = typeof grimoireShelf !== "undefined" ? grimoireShelf : null;
    if (!toc || !G()) return;
    // Capture: a part's title is the layout's to open and close, before the
    // section's own toggle (which would write is_collapsed) or a shelf's.
    toc.addEventListener("click", onClick, true);
    toc.addEventListener("change", onChange);
    observer = new MutationObserver(() => {
      if (!arranging) queueMicrotask(arrange);
    });
    observer.observe(toc, { childList: true });
    arrange();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }

  global.GrimoireLayoutView = { arrange, reload: () => ((layout = null), loadLayout().then(arrange)) };
})(typeof window !== "undefined" ? window : globalThis);
