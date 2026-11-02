/* =========================================================
   ALTAR TENDING SYNC
   Signed in, on one of your saved altars: tending (offerings, candles,
   incense, water, cleansing and charging, petitions, living-state changes)
   is written to your account straight away, as the app does. Only the
   living state of the things you tended is merged into the saved row, by
   altarObjectId, so layout changes you haven't saved stay in your draft.
   Coming back to the page reads the saved row again, so tending done in
   the app shows here.
   ========================================================= */

(function initializeAltarTendSync(global) {
  "use strict";

  /** The fields that make up an object's tending (its living state), as opposed to its layout. */
  const TEND_FIELDS = Object.freeze(["livingState", "lit"]);
  /** Fields that, if they differ, mean the draft has unsaved layout changes. */
  const LAYOUT_FIELDS = Object.freeze([
    "imagePath", "label", "type", "form", "color", "scale", "rotation", "flipped", "locked", "glowing",
    "plaqueText", "groupId", "zIndex"
  ]);
  const POSITION_FIELDS = Object.freeze(["leftPercent", "topPercent", "sizePercent"]);

  const objectId = (object) => String(object?.altarObjectId || "");

  /** A comparable fingerprint of an object's tending. */
  function tendingOf(object) {
    const tending = {};
    TEND_FIELDS.forEach((field) => { tending[field] = object?.[field] == null ? "" : String(object[field]); });
    return JSON.stringify(tending);
  }

  /**
   * Merge the tending of the given draft objects into saved altar data.
   * Only objects already in the saved row (matched by altarObjectId) change,
   * and only their tending fields; everything else in the row is left as it is.
   * `onlyIds` limits the merge to those objects. Returns { data, mergedIds }.
   */
  function mergeTending(savedData, draftObjects, onlyIds = null) {
    const base = savedData && typeof savedData === "object" ? savedData : {};
    const savedObjects = Array.isArray(base.objects) ? base.objects : [];
    const wanted = onlyIds ? new Set(onlyIds) : null;
    const byId = new Map();
    (Array.isArray(draftObjects) ? draftObjects : []).forEach((object) => {
      const id = objectId(object);
      if (id && (!wanted || wanted.has(id))) byId.set(id, object);
    });
    const mergedIds = [];
    const objects = savedObjects.map((saved) => {
      const draft = byId.get(objectId(saved));
      if (!draft || tendingOf(draft) === tendingOf(saved)) return saved;
      const next = { ...saved };
      TEND_FIELDS.forEach((field) => {
        if (draft[field] === undefined) delete next[field];
        else next[field] = draft[field];
      });
      mergedIds.push(objectId(saved));
      return next;
    });
    return { data: { ...base, objects }, mergedIds };
  }

  /** True when the draft differs from the saved row in anything other than tending. */
  function hasLayoutChanges(savedData, draftData) {
    const saved = savedData || {};
    const draft = draftData || {};
    if ((saved.background || "") !== (draft.background || "")) return true;
    const savedObjects = Array.isArray(saved.objects) ? saved.objects : [];
    const draftObjects = Array.isArray(draft.objects) ? draft.objects : [];
    if (savedObjects.length !== draftObjects.length) return true;
    const byId = new Map(savedObjects.map((object) => [objectId(object), object]));
    return draftObjects.some((object) => {
      const before = byId.get(objectId(object));
      if (!before || !objectId(object)) return true;
      if (LAYOUT_FIELDS.some((field) => String(before[field] ?? "") !== String(object[field] ?? ""))) return true;
      return POSITION_FIELDS.some((field) => Math.abs((Number(before[field]) || 0) - (Number(object[field]) || 0)) > 0.002);
    });
  }

  const api = { TEND_FIELDS, tendingOf, mergeTending, hasLayoutChanges };
  global.AltarTendSync = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  // ── In the page ─────────────────────────────────────────────────────────
  if (typeof document === "undefined" || typeof global.addEventListener !== "function") return;
  /* global db, ALTAR_CLOUD_TABLE, ensureAltarUser, createAltarSnapshot, showAltarToast */

  const DEBOUNCE_MS = 1500;
  const BASELINE_PREFIX = "saltAndSovereigntyAltarTendBaseline:";
  let timer = 0;
  let pushing = false;
  let again = false;
  let ready = "";          // the altar id whose saved row has been read since it opened
  let pulling = null;
  let layoutNoticeShown = false;
  let lastLocalTendAt = 0;

  const altarId = () => global.currentSavedAltarId || "";
  const onCoven = () => Boolean(document.body?.classList.contains("is-coven-altar") || global.CovenAltarPage?.altarId);

  /** What was last known to be in the saved row: { [altarObjectId]: tending fingerprint }. */
  function readBaseline(id) {
    try { return JSON.parse(global.localStorage.getItem(BASELINE_PREFIX + id) || "null"); } catch { return null; }
  }
  function writeBaseline(id, baseline) {
    try { global.localStorage.setItem(BASELINE_PREFIX + id, JSON.stringify(baseline)); } catch { /* storage blocked */ }
  }
  function baselineFrom(objects, updatedAt) {
    const tend = {};
    (objects || []).forEach((object) => { if (objectId(object)) tend[objectId(object)] = tendingOf(object); });
    return { updatedAt: updatedAt || "", tend };
  }

  function stageObjects() {
    const bridge = global.AltarApp;
    if (!bridge?.objects || !bridge?.toSaved) return [];
    return bridge.objects().map((el) => bridge.toSaved(el));
  }

  async function signedInUser() {
    if (typeof ensureAltarUser !== "function" || typeof db === "undefined") return null;
    try { return await ensureAltarUser(); } catch { return null; }
  }

  async function readRow(id, user) {
    const { data, error } = await db.from(ALTAR_CLOUD_TABLE).select("altar_data,updated_at").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    return data || null;
  }

  // ── Quiet "Saved" state beside the altar's name ────────────────────────
  let statusEl = null;
  let statusTimer = 0;
  function showStatus(text) {
    if (!statusEl) {
      statusEl = document.createElement("span");
      statusEl.className = "altar-tend-status";
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", "polite");
      statusEl.style.cssText = "font-size:0.75rem;opacity:0.7;margin-left:0.5rem;white-space:nowrap;transition:opacity .4s";
      const picker = document.querySelector("[data-altar-picker]");
      if (picker?.parentNode) picker.parentNode.insertBefore(statusEl, picker.nextSibling);
      else return;
    }
    statusEl.textContent = text;
    statusEl.style.opacity = "0.7";
    global.clearTimeout(statusTimer);
    if (text === "Saved") statusTimer = global.setTimeout(() => { if (statusEl) statusEl.style.opacity = "0"; }, 2500);
  }

  // ── Push: tending done here goes to the saved row ──────────────────────
  function schedule() {
    const id = altarId();
    if (!id || onCoven() || ready !== id) return;
    const baseline = readBaseline(id);
    if (!baseline) return;
    const changed = stageObjects().some((object) => objectId(object) && baseline.tend?.[objectId(object)] !== undefined && baseline.tend[objectId(object)] !== tendingOf(object));
    if (!changed) return;
    lastLocalTendAt = Date.now();
    global.clearTimeout(timer);
    timer = global.setTimeout(push, DEBOUNCE_MS);
  }

  async function push() {
    timer = 0;
    if (pushing) { again = true; return; }
    const id = altarId();
    if (!id || ready !== id) return;
    const user = await signedInUser();
    if (!user) return; // guests: the draft is all there is
    const baseline = readBaseline(id) || { updatedAt: "", tend: {} };
    const objects = stageObjects();
    const changedIds = objects
      .filter((object) => objectId(object) && baseline.tend?.[objectId(object)] !== undefined && baseline.tend[objectId(object)] !== tendingOf(object))
      .map(objectId);
    if (!changedIds.length) return;
    pushing = true;
    showStatus("Saving…");
    try {
      const row = await readRow(id, user);
      if (!row) { showStatus(""); return; }
      const { data } = mergeTending(row.altar_data, objects, changedIds);
      const now = new Date().toISOString();
      const { error } = await db.from(ALTAR_CLOUD_TABLE).update({ altar_data: data, updated_at: now }).eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      if (altarId() === id) {
        const next = { updatedAt: now, tend: { ...baseline.tend } };
        objects.forEach((object) => { if (changedIds.includes(objectId(object))) next.tend[objectId(object)] = tendingOf(object); });
        writeBaseline(id, next);
      }
      showStatus("Saved");
      const snapshot = typeof createAltarSnapshot === "function" ? createAltarSnapshot() : null;
      if (!layoutNoticeShown && snapshot && hasLayoutChanges(data, snapshot)) {
        layoutNoticeShown = true;
        if (typeof showAltarToast === "function") showAltarToast("Tended. Save to keep your other changes too.");
      }
    } catch (error) {
      console.error(error);
      showStatus("");
      if (typeof showAltarToast === "function") showAltarToast("Tending kept here, but not saved to your account yet. It will try again.");
    } finally {
      pushing = false;
      if (again) { again = false; schedule(); }
    }
  }

  // ── Pull: tending done in the app shows here ───────────────────────────
  function adopt(objects) {
    const bridge = global.AltarApp;
    if (!bridge?.findById || !bridge?.update) return 0;
    let count = 0;
    objects.forEach((saved) => {
      const el = bridge.findById(objectId(saved));
      if (!el) return;
      bridge.update(el, (current) => {
        if (tendingOf(current) === tendingOf(saved)) return current;
        const next = { ...current };
        TEND_FIELDS.forEach((field) => { next[field] = saved[field] == null ? "" : saved[field]; });
        count += 1;
        return next;
      }, { undo: false, quiet: true });
    });
    if (count) {
      global.saveWorkingAltarDraft?.();
      document.dispatchEvent(new CustomEvent("app-altar:changed", { detail: { object: null } }));
    }
    return count;
  }

  // The page opens with several reasons to read the row at once (load, sign-in,
  // focus): one read answers them all.
  const PULL_QUIET_MS = 3000;
  let lastPull = { id: "", at: 0 };

  async function pull(options = {}) {
    const id = altarId();
    if (!id || onCoven()) { ready = ""; return; }
    if (pulling) return pulling;
    if (!options.force && ready === id && lastPull.id === id && Date.now() - lastPull.at < PULL_QUIET_MS) return;
    pulling = (async () => {
      // The row storage.js read as the page opened, when it is this altar's.
      const opening = global.takeStartingAltarRow?.(id);
      let row = opening ? await opening : undefined;
      if (row === undefined || row === null) {
        const user = await signedInUser();
        if (!user) return;
        try { row = await readRow(id, user); } catch (error) { console.error(error); return; }
      }
      lastPull = { id, at: Date.now() };
      if (!row || altarId() !== id) return;
      const serverObjects = Array.isArray(row.altar_data?.objects) ? row.altar_data.objects : [];
      const local = new Map(stageObjects().map((object) => [objectId(object), object]));
      const baseline = readBaseline(id);
      const serverTime = Date.parse(row.updated_at || "") || 0;
      const draftTime = Date.parse(global.getWorkingAltarDraft?.()?.savedAt || "") || 0;
      const toAdopt = serverObjects.filter((saved) => {
        const mine = local.get(objectId(saved));
        if (!mine || tendingOf(mine) === tendingOf(saved)) return false;
        const base = baseline?.tend?.[objectId(saved)];
        if (base === undefined) return serverTime > Math.max(draftTime, lastLocalTendAt);
        if (base === tendingOf(saved)) return false;              // only changed here: push keeps it
        if (base === tendingOf(mine)) return true;                // only changed in the app
        return serverTime > lastLocalTendAt;                      // both: the newer wins
      });
      adopt(toAdopt);
      writeBaseline(id, baselineFrom(serverObjects, row.updated_at));
      ready = id;
      schedule();
    })().finally(() => { pulling = null; });
    return pulling;
  }

  function wrapDraftSave() {
    const original = global.saveWorkingAltarDraft;
    if (typeof original !== "function" || original.__tendSync) return;
    const wrapped = function (...args) {
      const result = original.apply(this, args);
      global.setTimeout(schedule, 0);
      return result;
    };
    wrapped.__tendSync = true;
    global.saveWorkingAltarDraft = wrapped;
  }

  wrapDraftSave();
  document.addEventListener("living-object-state:changed", () => global.setTimeout(schedule, 0));
  document.addEventListener("app-altar:changed", () => global.setTimeout(schedule, 0));
  document.addEventListener("altar:current-changed", () => { ready = ""; layoutNoticeShown = false; pull({ force: true }); });
  // A full Save writes everything, tending included.
  document.addEventListener("altar:saved", (event) => {
    const id = event.detail?.id;
    if (!id) return;
    global.clearTimeout(timer);
    writeBaseline(id, baselineFrom(stageObjects(), new Date().toISOString()));
    layoutNoticeShown = false;
    ready = id;
  });
  document.addEventListener("saltAuthReady", () => global.setTimeout(pull, 700));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") pull();
    else if (timer) { global.clearTimeout(timer); push(); }
  });
  global.addEventListener("focus", () => pull());
  // After the working draft is restored (events.js, ~500 ms after load; storage.js
  // waits there for the saved row when signed in).
  global.setTimeout(pull, 900);
})(typeof window !== "undefined" ? window : globalThis);
