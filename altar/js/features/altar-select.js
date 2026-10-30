/* =========================================================
   ALTAR SELECT
   Choosing several things at once (More → Select pieces, or a long press on
   an object): a bar under the stage says how many are chosen and does to all
   of them at once what the app's Select mode does (SelectionPanel.tsx):
   choose all or none, group, ungroup, bring to the front or send to the
   back, light or snuff the candles among them, lock them, and delete them
   in one step with Undo. Dragging any chosen thing moves them all
   (objects.js moveObjectsTogether); choosing one of a group chooses the
   group (groups.js toggleRitualItem).

   The work is the app's own (js/core/altar.js selection) on the altar as
   the app sees it (AltarApp.doc), written back with AltarApp.applyObjects.
   ========================================================= */

(function initializeAltarSelect(global) {
  "use strict";

  const B = () => global.AltarApp;
  const A = () => global.SaltCore?.altar;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  /* global altarSelectionMode, selectedRitualItems, toggleRitualSelectionMode, setRitualSelection, groupSelectedRitualItems,
     ungroupCurrentItems, deleteObjects, pushAltarUndoSnapshot, undoAltarChange, altarStage, selectedObject */
  const selecting = () => typeof altarSelectionMode !== "undefined" && altarSelectionMode;
  const chosen = () => (typeof selectedRitualItems !== "undefined" ? selectedRitualItems.filter((o) => o.isConnected) : []);
  const allObjects = () => [...(document.querySelector("[data-altar-stage]")?.querySelectorAll(".altar-object") || [])];

  let bar = null;
  let confirming = false;
  // A deletion Undo can take back: the words said, shown with an Undo button until something else happens.
  let undoWords = "";

  function ensureBar() {
    if (bar && bar.isConnected) return bar;
    const stage = document.querySelector("[data-altar-stage]");
    if (!stage) return null;
    bar = document.createElement("section");
    bar.className = "altar-select-bar";
    bar.dataset.altarSelectBar = "";
    bar.setAttribute("aria-label", "Choosing several");
    bar.hidden = true;
    stage.insertAdjacentElement("afterend", bar);
    bar.addEventListener("click", onClick);
    return bar;
  }

  const words = (n) => (n === 1 ? "1 thing" : `${n} things`);
  const L = () => A()?.livingState;

  function render() {
    const el = ensureBar();
    if (!el) return;
    const on = selecting();
    el.hidden = !on && !undoWords;
    if (el.hidden) return;
    const list = chosen();
    const n = list.length;
    const total = allObjects().length;
    if (!on) {
      el.innerHTML = `<p class="app-caption" role="status">${esc(undoWords)}</p><div class="app-chips"><button type="button" class="app-chip" data-select="undo" aria-label="Undo that, and put them back"><span aria-hidden="true">↶</span> Undo</button></div>`;
      return;
    }
    const saved = list.map((o) => B()?.toSaved(o)).filter(Boolean);
    const unlit = saved.filter((o) => L()?.isCandle(o) && !L().isLit(o) && !L().candleLife(o).spent).length;
    const lit = saved.filter((o) => L()?.isLit(o)).length;
    const groups = [...new Set(list.map((o) => o.dataset.groupId).filter(Boolean))];
    const oneGroup = groups.length === 1 && list.every((o) => o.dataset.groupId === groups[0]);
    const locked = n > 0 && list.every((o) => o.dataset.locked === "true");
    const chip = (action, label, symbol = "", extra = "") => `<button type="button" class="app-chip${extra}" data-select="${action}">${symbol ? `<span aria-hidden="true">${symbol}</span> ` : ""}${esc(label)}</button>`;
    el.innerHTML = `
      <div class="altar-select-bar__head">
        <div>
          <p class="app-living__eyebrow">Choosing several</p>
          <p class="altar-select-bar__count" role="status" aria-live="polite">${n ? `${words(n)} chosen` : "Nothing chosen yet"}</p>
          <p class="app-caption">${n ? "Tap to add or leave out. Drag any chosen thing to move them all together." : "Tap things on the altar to choose them. Tap again to leave one out."}</p>
        </div>
        <button type="button" class="app-chip app-chip--primary" data-select="done">Done</button>
      </div>
      ${undoWords ? `<p class="app-caption">${esc(undoWords)} ${chip("undo", "Undo", "↶")}</p>` : ""}
      <div class="app-chips">${n < total ? chip("all", "Choose all", "☑") : chip("none", "Choose none", "☐")}</div>
      ${n ? `<div class="app-chips">
        ${n > 1 && !oneGroup ? chip("group", "Group", "⊕") : ""}
        ${groups.length ? chip("ungroup", "Ungroup", "⊘") : ""}
        ${chip("front", "To front", "⤒")}${chip("back", "To back", "⤓")}
        ${unlit ? chip("light", unlit > 1 ? `Light ${unlit} candles` : "Light the candle", "✺") : ""}
        ${lit ? chip("snuff", lit > 1 ? `Snuff ${lit} candles` : "Snuff the candle", "◌") : ""}
        ${chip(locked ? "unlock" : "lock", locked ? "Unlock" : "Lock", "⚿")}
      </div>
      ${confirming
        ? `<p class="app-caption">${esc(`Delete ${words(n)} from the altar? Undo brings them back.`)}</p><div class="app-chips">${chip("delete-yes", n === 1 ? "Delete it" : `Delete all ${n}`, "", " app-chip--danger")}${chip("delete-no", "Keep them")}</div>`
        : `<div class="app-chips">${chip("delete", n === 1 ? "Delete" : `Delete ${n}`, "", " app-chip--danger")}</div>`}` : ""}`;
  }

  /** Run one of the app's selection functions on what's chosen, as one undo step. */
  function applyToChosen(fn) {
    const core = A()?.selection;
    if (!core || !B()) return;
    const els = allObjects();
    const indices = chosen().map((o) => els.indexOf(o)).filter((i) => i >= 0);
    const doc = B().doc();
    const next = fn(core, doc, indices);
    if (!next || next === doc) return;
    B().applyObjects(doc.objects, next.objects);
  }

  function onClick(event) {
    const button = event.target.closest("[data-select]");
    if (!button) return;
    const action = button.dataset.select;
    const now = new Date().toISOString();
    if (action !== "delete" && action !== "delete-yes") confirming = false;
    if (action !== "undo" && action !== "delete-yes") undoWords = "";
    switch (action) {
      case "done":
        undoWords = "";
        if (selecting()) toggleRitualSelectionMode();
        break;
      case "all":
        setRitualSelection(allObjects());
        break;
      case "none":
        setRitualSelection([]);
        break;
      case "group":
        groupSelectedRitualItems();
        break;
      case "ungroup": {
        const groups = [...new Set(chosen().map((o) => o.dataset.groupId).filter(Boolean))];
        if (groups.length) pushAltarUndoSnapshot();
        groups.forEach((id) => ungroupCurrentItems(id));
        B()?.notice("Ungrouped. Each moves on its own again.");
        break;
      }
      case "front":
      case "back":
        applyToChosen((core, doc, indices) => core.layerTogether(doc, indices, action));
        break;
      case "light":
      case "snuff":
        applyToChosen((core, doc, indices) => core.lightTogether(doc, indices, action === "light", now));
        break;
      case "lock":
      case "unlock":
        applyToChosen((core, doc, indices) => core.lockTogether(doc, indices, action === "lock"));
        break;
      case "delete":
        confirming = true;
        break;
      case "delete-no":
        confirming = false;
        break;
      case "delete-yes": {
        confirming = false;
        const n = deleteObjects(chosen());
        setRitualSelection([]);
        undoWords = n ? `${n === 1 ? "It’s" : `${words(n).replace(/^./, (c) => c.toUpperCase())} are`} off the altar.` : "";
        break;
      }
      case "undo":
        undoWords = "";
        undoAltarChange();
        B()?.notice("Put back.");
        break;
      default:
        break;
    }
    render();
  }

  // Press and hold an object: start choosing several, with it.
  let hold = null;
  function startHold(event) {
    const object = event.target.closest?.(".altar-object");
    if (!object || selecting() || event.button > 0) return;
    const x = event.clientX;
    const y = event.clientY;
    cancelHold();
    hold = {
      x,
      y,
      timer: setTimeout(() => {
        hold = null;
        // Let go of the drag the press began, then choose.
        object.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerId: event.pointerId }));
        toggleRitualSelectionMode(object);
        B()?.notice("Choosing several. Tap others to add them.");
      }, 550)
    };
  }
  function moveHold(event) {
    if (hold && Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > 8) cancelHold();
  }
  function cancelHold() {
    if (hold) clearTimeout(hold.timer);
    hold = null;
  }

  function start() {
    ensureBar();
    document.addEventListener("altar:selection-changed", () => {
      if (!selecting()) confirming = false;
      render();
    });
    document.addEventListener("app-altar:changed", () => { if (selecting()) render(); });
    const stage = document.querySelector("[data-altar-stage]");
    stage?.addEventListener("pointerdown", startHold, true);
    stage?.addEventListener("pointermove", moveHold, true);
    stage?.addEventListener("pointerup", cancelHold, true);
    stage?.addEventListener("pointercancel", cancelHold, true);
    // Escape stops choosing.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && selecting() && !document.querySelector("dialog[open]")) {
        toggleRitualSelectionMode();
        render();
      }
    });
    render();
  }

  global.AltarSelect = { render };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})(typeof window !== "undefined" ? window : globalThis);
