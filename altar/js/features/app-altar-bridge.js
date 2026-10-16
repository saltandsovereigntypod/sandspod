/* =========================================================
   APP ALTAR BRIDGE
   The phone app's altar logic (js/core/altar.js, built from app/src/lib/altar)
   works on saved objects: the same JSON this page saves for each object
   (storage.js createAltarSnapshot). This turns an object on the stage into
   that shape, runs the app's pure functions on it, and writes the result
   back to the object (its data-*, its living state, its place), so the app
   and the website keep one shape and read each other's altars.

   Also: the sheet (dialog) and notice the app-altar features share, image
   ratios for the app's geometry, and the open altar's id.
   ========================================================= */

(function initializeAppAltarBridge(global) {
  "use strict";

  const core = () => global.SaltCore?.altar || null;
  // The altar's own state lives in top-level `let`s (state.js), which aren't window properties.
  /* global selectedObject, highestLayer, altarGroups, activeGroupId */
  const lexical = {
    selected: () => (typeof selectedObject !== "undefined" ? selectedObject : null),
    highest: () => (typeof highestLayer !== "undefined" ? highestLayer : 10),
    groups: () => (typeof altarGroups !== "undefined" && Array.isArray(altarGroups) ? altarGroups : []),
    activeGroup: () => (typeof activeGroupId !== "undefined" ? activeGroupId : null)
  };
  const nowIso = () => new Date().toISOString();
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /** The string fields kept in data-* (storage.js createSavedObject). */
  const DATASET_FIELDS = [
    "label", "type", "entityId", "instanceId", "herb", "form", "color", "crystal", "tool", "vessel", "deity",
    "apothecaryItemId", "apothecaryType", "apothecaryIngredients", "apothecaryIntention", "apothecaryNotes",
    "apothecaryLogToGrimoire", "apothecaryGrimoireStatus", "scale", "rotation", "flipped", "locked", "glowing",
    "lit", "ritualIncluded", "plaqueText", "altarObjectId", "groupId"
  ];
  const DEFAULTS = { apothecaryIngredients: "[]", apothecaryLogToGrimoire: "false", scale: "1", rotation: "0", flipped: "false", locked: "false", glowing: "false", lit: "false", ritualIncluded: "false", label: "object" };
  const OWN_FIELDS = new Set([...DATASET_FIELDS, "imagePath", "fallbackSymbol", "livingState", "leftPercent", "topPercent", "sizePercent", "zIndex"]);

  // ── Image ratios, for the app's geometry (box sizes, flames, burn-down) ──
  const ratios = new Map();
  function assetKey(path) {
    let p = String(path || "").trim();
    if (!p) return "";
    try {
      if (/^https?:/i.test(p)) {
        const url = new URL(p);
        if (url.origin !== global.location?.origin) return p;
        p = url.pathname;
      }
    } catch { /* not a URL */ }
    p = p.split(/[?#]/)[0];
    while (p.startsWith("../")) p = p.slice(3);
    return p.replace(/^\.?\//, "");
  }
  function noteRatio(path, width, height) {
    if (path && width > 0 && height > 0) ratios.set(assetKey(path), height / width);
  }
  function ratioOf(path) {
    return ratios.get(assetKey(path)) ?? null;
  }
  /** Load an image's size once, so the app's geometry knows its shape. */
  function loadRatio(path) {
    if (!path || ratioOf(path) != null) return Promise.resolve(ratioOf(path));
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        noteRatio(path, img.naturalWidth, img.naturalHeight);
        resolve(ratioOf(path));
      };
      img.onerror = () => resolve(null);
      img.src = /^(https?:|\/|\.\.\/)/.test(path) ? path : `../${path}`;
    });
  }
  function registerRatioLookup() {
    core()?.geometry?.setImageRatioLookup?.((path) => ratioOf(path));
  }
  registerRatioLookup();
  document.addEventListener("load", (event) => {
    const img = event.target;
    if (img instanceof HTMLImageElement && img.closest?.(".altar-object")) noteRatio(img.getAttribute("src"), img.naturalWidth, img.naturalHeight);
  }, true);

  // ── Objects ⇄ saved objects ──────────────────────────────────────────
  const stage = () => document.querySelector("[data-altar-stage]");
  const objectEls = () => [...(stage()?.querySelectorAll(".altar-object") || [])];
  const mainImage = (object) => object?.querySelector("img:not(.candle-herb-overlay):not(.candle-oil-overlay):not([data-living-art] img)") || null;

  function toSaved(object) {
    if (!object) return null;
    if (!object.dataset.livingState && typeof global.initializeLivingObjectState === "function") global.initializeLivingObjectState(object);
    const img = mainImage(object);
    if (img?.naturalWidth) noteRatio(img.getAttribute("src"), img.naturalWidth, img.naturalHeight);
    const position = typeof global.getStagePositionPercent === "function" && stage()?.clientWidth
      ? global.getStagePositionPercent(object)
      : { leftPercent: Number(object.dataset.leftPercent) || 0.5, topPercent: Number(object.dataset.topPercent) || 0.5, sizePercent: Number(object.dataset.sizePercent) || 0.08 };
    const saved = { ...(typeof global.savedObjectExtras === "function" ? global.savedObjectExtras(object) : {}) };
    saved.imagePath = img ? img.getAttribute("src") || "" : "";
    saved.fallbackSymbol = typeof global.objectFallbackSymbol === "function" ? global.objectFallbackSymbol(object) : object.dataset.fallbackSymbol || "";
    DATASET_FIELDS.forEach((field) => { saved[field] = object.dataset[field] ?? DEFAULTS[field] ?? ""; });
    saved.livingState = object.dataset.livingState || "";
    saved.leftPercent = position.leftPercent;
    saved.topPercent = position.topPercent;
    saved.sizePercent = position.sizePercent;
    saved.zIndex = object.style.zIndex || "10";
    return saved;
  }

  function candleStatus(object) {
    try {
      return JSON.parse(object.dataset.livingState || "{}")?.candle?.status || "";
    } catch {
      return "";
    }
  }

  /** Write a changed saved object back onto its element. */
  function apply(object, next, prev, options = {}) {
    if (!object || !next || next === prev) return object;
    const before = prev || toSaved(object);
    const wasLit = object.dataset.lit === "true";
    DATASET_FIELDS.forEach((field) => {
      const value = next[field] == null ? "" : String(next[field]);
      if ((object.dataset[field] ?? "") !== value) object.dataset[field] = value;
    });
    const extras = {};
    Object.entries(next).forEach(([key, value]) => {
      if (!OWN_FIELDS.has(key) && value !== undefined && !(typeof KNOWN_OBJECT_FIELDS !== "undefined" && KNOWN_OBJECT_FIELDS.has(key))) extras[key] = value;
    });
    if (Object.keys(extras).length) object.dataset.appExtra = JSON.stringify(extras);
    else delete object.dataset.appExtra;

    if (next.imagePath && next.imagePath !== before.imagePath) {
      const img = mainImage(object);
      if (img) img.src = next.imagePath;
    }
    if (next.label !== before.label) {
      object.setAttribute("aria-label", `${next.label || "Object"}. Click to select. Drag to move. Double click to remove.`);
      const img = mainImage(object);
      if (img) img.alt = next.label || "altar object";
    }

    if ((next.livingState || "") !== (before.livingState || "")) {
      object.dataset.livingState = next.livingState || "";
      let state = null;
      try { state = JSON.parse(next.livingState || "null"); } catch { state = null; }
      if (state && typeof global.saveLivingObjectState === "function") {
        global.saveLivingObjectState(object, state, { silent: true });
        document.dispatchEvent(new CustomEvent("living-object-state:changed", { detail: { object, state } }));
      }
    }

    const lit = object.dataset.lit === "true" && object.dataset.type === "candle";
    object.classList.toggle("is-lit", lit);
    object.classList.toggle("is-candle-spent", object.dataset.type === "candle" && candleStatus(object) === "spent");
    if (object.dataset.type === "candle") object.dataset.candleStatus = candleStatus(object) || (lit ? "burning" : "unlit");
    if (lit && !wasLit) global.startFlame?.(object);
    if (!lit && wasLit) {
      global.stopFlame?.(object);
      global.extinguishFlame?.(object);
    }
    object.classList.toggle("has-glow", object.dataset.glowing === "true");
    object.classList.toggle("is-locked", object.dataset.locked === "true");

    const moved = ["leftPercent", "topPercent", "sizePercent"].some((key) => Math.abs((Number(next[key]) || 0) - (Number(before[key]) || 0)) > 1e-6);
    if (moved && typeof global.applyStagePositionPercent === "function") {
      global.applyStagePositionPercent(object, next);
      global.keepObjectInsideStage?.(object);
      global.updateObjectPositionPercent?.(object);
    }
    if (next.zIndex && String(next.zIndex) !== object.style.zIndex) object.style.zIndex = String(next.zIndex);
    global.updateObjectTransform?.(object);
    global.updateCandleDressingVisuals?.(object);
    if (lit !== wasLit) global.renderLighting?.();
    if (!options.quiet) {
      global.saveWorkingAltarDraft?.();
      document.dispatchEvent(new CustomEvent("app-altar:changed", { detail: { object } }));
    }
    return object;
  }

  /** Change one object with an app function: update(el, (saved) => next). */
  function update(object, change, options = {}) {
    if (!object || typeof change !== "function") return null;
    const prev = toSaved(object);
    const next = change(prev);
    if (!next || next === prev) return null;
    if (options.undo !== false) global.pushAltarUndoSnapshot?.();
    apply(object, next, prev, options);
    return next;
  }

  /** Put a saved object (made by an app function) on the altar. */
  function addSaved(saved, options = {}) {
    const root = stage();
    if (!root || !saved || typeof global.createSavedObject !== "function") return null;
    if (options.undo !== false) global.pushAltarUndoSnapshot?.();
    const object = global.createSavedObject({ zIndex: String(lexical.highest() + 1), ...saved });
    root.appendChild(object);
    const position = () => {
      global.applyStagePositionPercent?.(object, saved);
      global.updateObjectTransform?.(object);
      global.keepObjectInsideStage?.(object);
      global.updateObjectPositionPercent?.(object);
      document.dispatchEvent(new CustomEvent("app-altar:changed", { detail: { object } }));
    };
    const img = mainImage(object);
    if (img && !img.complete) img.addEventListener("load", position, { once: true });
    else position();
    global.updateEmptyMessage?.();
    global.renderLighting?.();
    global.saveWorkingAltarDraft?.();
    if (options.select !== false) global.selectObject?.(object);
    return object;
  }

  function removeEl(object, options = {}) {
    if (!object) return;
    if (options.undo !== false) global.pushAltarUndoSnapshot?.();
    if (object === lexical.selected()) global.deselectObject?.();
    global.stopFlame?.(object);
    object.remove();
    global.updateEmptyMessage?.();
    global.renderLighting?.();
    global.saveWorkingAltarDraft?.();
    document.dispatchEvent(new CustomEvent("app-altar:changed", { detail: { object: null } }));
  }

  const findById = (id) => objectEls().find((o) => o.dataset.altarObjectId === id) || null;

  /** The altar as the app's AltarDocument. */
  function doc() {
    const root = stage();
    return {
      background: root?.dataset.background || "",
      backgroundName: root?.dataset.backgroundName || "",
      groups: lexical.groups(),
      activeGroupId: lexical.activeGroup(),
      objects: objectEls().map(toSaved),
      extra: { ...(global.altarExtraFields || {}) }
    };
  }

  /** Apply a whole changed list of saved objects (same order as doc().objects): moves, swaps, new things. */
  function applyObjects(before, after, options = {}) {
    if (options.undo !== false) global.pushAltarUndoSnapshot?.();
    const els = objectEls();
    after.forEach((next, i) => {
      if (i < els.length) {
        if (next !== before[i]) apply(els[i], next, before[i], { quiet: true });
      } else {
        addSaved(next, { undo: false, select: false });
      }
    });
    els.slice(after.length).forEach((el) => removeEl(el, { undo: false }));
    global.saveWorkingAltarDraft?.();
    document.dispatchEvent(new CustomEvent("app-altar:changed", { detail: { object: null } }));
  }

  /** Clear the stage and set out a whole document (tonight's altar, a shrine). */
  function setDocument(document_, name) {
    if (typeof global.restoreAltarData !== "function") return;
    const objects = document_.objects || [];
    Promise.all(objects.map((o) => loadRatio(o.imagePath))).finally(() => {
      global.restoreAltarData({ ...(document_.extra || {}), name, background: document_.background, backgroundName: document_.backgroundName, groups: document_.groups || [], activeGroupId: document_.activeGroupId || null, objects }, { keepDraft: true });
      global.setCurrentSavedAltar?.("");
      document.dispatchEvent(new CustomEvent("app-altar:changed", { detail: { object: null } }));
    });
  }

  // ── The open altar ─────────────────────────────────────────────────────
  const altarId = () => global.currentSavedAltarId || "";
  const altarName = () => global.currentSavedAltarName || "My Altar";

  // ── Notice: what just happened, in a sentence that stays until the next ─
  let noticeEl = null;
  function notice(text) {
    if (!noticeEl) {
      noticeEl = document.createElement("p");
      noticeEl.className = "app-altar-notice";
      noticeEl.setAttribute("role", "status");
      noticeEl.setAttribute("aria-live", "polite");
      noticeEl.title = "Click to dismiss";
      noticeEl.addEventListener("click", () => { noticeEl.hidden = true; });
      const wrap = document.querySelector(".altar-stage-wrap");
      const stage = wrap?.querySelector("[data-altar-stage]");
      if (stage) stage.insertAdjacentElement("afterend", noticeEl);
      else wrap?.appendChild(noticeEl);
    }
    noticeEl.textContent = text || "";
    noticeEl.hidden = !text;
  }

  // ── Sheets: the app's bottom sheets, as dialogs ─────────────────────────
  function openSheet({ eyebrow = "", title = "", html = "", onMount = null, onClose = null, wide = false, label = "" }) {
    const dialog = document.createElement("dialog");
    dialog.className = `app-sheet${wide ? " app-sheet--wide" : ""}`;
    const titleId = `app-sheet-title-${Math.random().toString(36).slice(2, 8)}`;
    dialog.setAttribute("aria-labelledby", titleId);
    dialog.innerHTML = `
      <div class="app-sheet__head">
        <div>
          ${eyebrow ? `<p class="app-sheet__eyebrow">${esc(eyebrow)}</p>` : ""}
          <h2 class="app-sheet__title" id="${titleId}">${esc(title)}</h2>
        </div>
        <button type="button" class="app-sheet__close" data-sheet-close aria-label="Close${label ? ` ${esc(label)}` : ""}">×</button>
      </div>
      <div class="app-sheet__body" data-sheet-body>${html}</div>`;
    document.body.appendChild(dialog);
    const close = () => dialog.open && dialog.close();
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.closest("[data-sheet-close]")) close();
    });
    dialog.addEventListener("close", () => {
      onClose?.();
      dialog.remove();
    });
    dialog.showModal();
    const body = dialog.querySelector("[data-sheet-body]");
    onMount?.(body, dialog, close);
    const first = body.querySelector("input, textarea, select, button");
    (first || dialog.querySelector("[data-sheet-close]"))?.focus();
    return { dialog, body, close, setBody(next) { body.innerHTML = next; } };
  }

  /** Buttons in a row, the app's chips: [{ label, symbol, action, pressed, danger, disabled, hint }], or links ({ label, href }). */
  function chips(list) {
    return `<div class="app-chips">${list.filter(Boolean).map((c) => c.href ? `
      <a class="app-chip" href="${esc(c.href)}"${c.hint ? ` aria-label="${esc(c.hint)}"` : ""}>${c.symbol ? `<span aria-hidden="true">${esc(c.symbol)}</span> ` : ""}${esc(c.label)}</a>` : `
      <button type="button" class="app-chip${c.danger ? " app-chip--danger" : ""}${c.primary ? " app-chip--primary" : ""}" data-app-action="${esc(c.action)}"${c.pressed != null ? ` aria-pressed="${c.pressed ? "true" : "false"}"` : ""}${c.disabled ? " disabled" : ""}${c.hint ? ` aria-label="${esc(c.hint)}"` : ""}${c.data ? Object.entries(c.data).map(([k, v]) => ` data-${k}="${esc(v)}"`).join("") : ""}>${c.symbol ? `<span aria-hidden="true">${esc(c.symbol)}</span> ` : ""}${esc(c.label)}</button>`).join("")}</div>`;
  }

  // ── Your place, for your own sunrise and sunset ─────────────────────────
  // Kept only in this browser, never sent: "sky.place" is the app's own key,
  // which /today/sky/ saves; "salt.sky.place" is the practice pages' copy.
  const PLACE_KEYS = ["sky.place", "salt.sky.place"];
  function place(storage = global.localStorage) {
    for (const key of PLACE_KEYS) {
      try {
        const raw = JSON.parse(storage?.getItem(key) || "null");
        const latitude = Number(raw?.latitude);
        const longitude = Number(raw?.longitude);
        if (raw && Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
          return { latitude, longitude, source: raw.source === "device" ? "device" : "manual" };
        }
      } catch {
        /* nothing saved, or storage blocked */
      }
    }
    return null;
  }

  // ── The Library, with your own My Practice notes (lib/library/store.ts) ─
  // Signed in: living_library_entries; as a guest: this browser's Library.
  // Until it loads (or if it can't), the app's functions use the built-in Library.
  const GUEST_LIBRARY_KEY = "saltAndSovereigntyLibrary";
  let libraryEntries = null;
  let libraryLoading = null;
  async function loadLibrary() {
    const C = core();
    if (!C?.buildLibrary) return null;
    const user = typeof global.getCurrentSaltUser === "function" ? global.getCurrentSaltUser() : null;
    let rows = [];
    try {
      if (user?.id && global.db) {
        const { data, error } = await global.db
          .from("living_library_entries")
          .select("entity_id,name,type,image,my_practice,community,layout,updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });
        if (error) throw error;
        rows = data || [];
      } else {
        const stored = JSON.parse(global.localStorage?.getItem(GUEST_LIBRARY_KEY) || "null");
        rows = stored ? C.guestPracticeRows(stored) : [];
      }
    } catch {
      return libraryEntries;
    }
    let entries = C.buildLibrary(rows);
    try {
      const hidden = C.holidays.hiddenTraditions((await global.SaltSettings?.get?.()) || null);
      if (hidden.length) entries = C.hideTraditions(entries, hidden);
    } catch {
      /* settings unreadable: show every tradition */
    }
    libraryEntries = entries;
    document.dispatchEvent(new CustomEvent("app-altar:library"));
    return entries;
  }
  function reloadLibrary() {
    libraryLoading = loadLibrary().finally(() => { libraryLoading = null; });
    return libraryLoading;
  }
  const library = () => libraryEntries;
  if (typeof document !== "undefined" && typeof global.addEventListener === "function") {
    const startLibrary = () => {
      Promise.resolve(global.SaltPage?.ready?.()).catch(() => null).finally(reloadLibrary);
      global.SaltPage?.onUserChange?.(reloadLibrary);
    };
    if (document.readyState === "complete") startLibrary();
    else global.addEventListener("load", startLibrary, { once: true });
  }

  /** Load a script once (for the parts of the site only some sheets need). */
  const scripts = new Map();
  function loadScript(src) {
    if (!scripts.has(src)) {
      scripts.set(src, new Promise((resolve, reject) => {
        const el = document.createElement("script");
        el.src = src;
        el.onload = () => resolve();
        el.onerror = () => { scripts.delete(src); reject(new Error(`Couldn’t load ${src}`)); };
        document.head.appendChild(el);
      }));
    }
    return scripts.get(src);
  }

  const shortLabel = (label, fallback = "") => core()?.cabinet?.shortLabel?.(label, fallback) || String(label || fallback);
  const dateShort = (at, options = { day: "numeric", month: "short" }) => {
    const d = new Date(at);
    return Number.isFinite(d.getTime()) ? d.toLocaleDateString(undefined, options) : "";
  };

  const api = {
    core, nowIso, esc, selected: lexical.selected, toSaved, apply, update, addSaved, removeEl, findById, doc, applyObjects, setDocument,
    objects: objectEls, mainImage, altarId, altarName, notice, openSheet, chips, shortLabel, dateShort,
    ratioOf, loadRatio, noteRatio, assetKey, registerRatioLookup,
    place, library, reloadLibrary, loadScript
  };
  global.AltarApp = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
