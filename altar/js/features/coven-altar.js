/* =========================================================
   A COVEN ALTAR, SHARED
   /altar/?covenAltar=<id>&c=<coven address> opens one of a coven's
   altars in this editor, as the app's AltarEditor does with `shared`
   (app/src/lib/covens/altarSync.ts): the same whole altar, tended
   together and live.

   The altar's scene (background, groups, other fields) is its
   coven_altars row; every object on it is its own coven_altar_objects
   row keyed by its altarObjectId, so two people moving two candles
   never overwrite each other. Each change you make is sent to the
   others at once over the altar's channel (the app's own
   "coven-altar:<id>" broadcast) and written a moment later; what
   others do arrives the same way and is set on the stage object by
   object. Who may tend it is the database's call
   (coven_altar_can_edit); coven_altar_access says why not, and then
   the altar is view only.

   Your own working altar is never touched: in this mode the page's
   draft saving (storage.js persistWorkingAltarDraft) sends changes to
   the coven instead, and "Save" keeps a copy among your own altars.
   Rows ⇄ document come from the app (js/core/altar.js covenAltar).
   ========================================================= */

(function initializeCovenAltar(global) {
  "use strict";

  const params = new URLSearchParams(global.location.search);
  const altarId = params.get("covenAltar") || "";
  if (!altarId || !/^[0-9a-f-]{36}$/i.test(altarId)) return;
  const slug = params.get("c") || "";

  /* global altarStage, altarGroups, activeGroupId, altarDraftDirty, updateGroupIndicator, syncGroupObjectClasses, saveAltar, setCurrentSavedAltar, showAltarToast */
  const ALTAR_FIELDS = "id,coven_id,name,is_main,edit_mode,locked,background,background_name,groups,active_group_id,extra,archived_at,created_by,updated_by,created_at,updated_at";
  const BROADCAST_MS = 60;
  const WRITE_MS = 400;
  const REFUSED = new Set(["42501", "P0001", "23514"]);

  const db = () => global.db || null;
  const core = () => global.SaltCore?.altar?.covenAltar || null;
  const app = () => global.AltarApp || null;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const covenHref = () => `/covens/coven/?c=${encodeURIComponent(slug)}&tab=altar`;

  let me = null;
  let myName = "A member";
  let altar = null;
  let access = null;
  let ready = false;
  let applying = false;
  let problem = "";
  let sending = false;
  let here = [];
  let channel = null;
  // What the coven is known to hold: each object (normalised JSON) and the scene.
  let saved = new Map();
  let savedScene = "";
  let positions = new Map();
  // Your changes not yet written, and not yet sent to the others.
  const unwritten = new Map();
  const unsent = new Map();
  const timers = { send: null, write: null };

  // ── This page is the coven's altar now, not your working altar ────────
  document.body.classList.add("is-coven-altar");
  global.covenAltarMode = { altarId, slug };
  global.restoreWorkingAltarDraft = function restoreWorkingAltarDraft() {};
  global.clearWorkingAltarDraft = function clearWorkingAltarDraft() {};
  global.persistWorkingAltarDraft = function persistWorkingAltarDraft() {
    try {
      altarDraftDirty = false;
    } catch {
      /* the page's own flag; nothing to clear */
    }
    push();
    return true;
  };

  // ── Rows ⇄ the stage ───────────────────────────────────────────────────
  const round = (n) => Math.round(Number(n) * 1e5) / 1e5;
  /** An object as it's compared and written: positions to five places, so a picture redrawn on another screen isn't a change. */
  function norm(object) {
    const out = { ...object };
    ["leftPercent", "topPercent", "sizePercent"].forEach((field) => {
      if (Number.isFinite(Number(out[field]))) out[field] = round(out[field]);
    });
    return out;
  }
  const keyOf = (object) => String(object?.altarObjectId || "");
  const sceneOf = (doc) => ({ background: doc.background, backgroundName: doc.backgroundName, groups: doc.groups, activeGroupId: doc.activeGroupId, extra: doc.extra });

  /** The stage as the app's AltarDocument, every object keyed and normalised. */
  function stageDocument() {
    app()?.objects().forEach((el) => {
      if (!el.dataset.altarObjectId) el.dataset.altarObjectId = global.crypto?.randomUUID ? global.crypto.randomUUID() : `obj-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    });
    const doc = app().doc();
    return { ...doc, objects: doc.objects.map(norm) };
  }

  function rememberStage() {
    const doc = stageDocument();
    saved = new Map(doc.objects.map((o) => [keyOf(o), JSON.stringify(o)]));
    savedScene = JSON.stringify(sceneOf(doc));
  }

  /** What differs between the stage and what's known to be saved (altarDoc.ts diff, with normalised objects). */
  function changesFrom(doc, known, knownScene) {
    const changes = [];
    const seen = new Set();
    doc.objects.forEach((object) => {
      const key = keyOf(object);
      if (!key) return;
      seen.add(key);
      if (known.get(key) !== JSON.stringify(object)) changes.push({ kind: "object", key, data: object });
    });
    known.forEach((_, key) => {
      if (!seen.has(key)) changes.push({ kind: "object", key, data: null });
    });
    const scene = sceneOf(doc);
    if (JSON.stringify(scene) !== knownScene) changes.push({ kind: "scene", scene });
    return changes;
  }

  /** Lay a whole altar on the stage (on opening, and after a refusal). */
  function setStage(row, rows) {
    const A = core();
    const doc = A.keyed(A.documentFromRows(row, rows || []));
    positions = new Map((rows || []).map((r) => [r.object_key, r.position]));
    unwritten.clear();
    unsent.clear();
    applying = true;
    return Promise.all(doc.objects.map((o) => app().loadRatio(o.imagePath))).finally(() => {
      global.restoreAltarData({ ...(doc.extra || {}), name: row.name, background: doc.background, backgroundName: doc.backgroundName, groups: doc.groups || [], activeGroupId: doc.activeGroupId || null, objects: doc.objects }, { keepDraft: true });
      global.setCurrentSavedAltar?.("");
      global.currentSavedAltarName = row.name;
      rememberStage();
      applying = false;
      ready = true;
      document.dispatchEvent(new CustomEvent("app-altar:changed", { detail: { object: null } }));
    });
  }

  /** Something changed on someone else's screen, or in the database. */
  function receive(key, data) {
    if (!ready || unwritten.has(key)) return; // your own change wins; it's on its way
    const A = app();
    const el = A.findById(key);
    applying = true;
    try {
      if (data == null) {
        if (el) A.removeEl(el, { undo: false });
        saved.delete(key);
      } else {
        const next = { ...data, altarObjectId: key };
        if (el) A.apply(el, next, A.toSaved(el), { quiet: true });
        else A.addSaved(next, { undo: false, select: false });
        const now = A.findById(key);
        saved.set(key, JSON.stringify(norm(now ? A.toSaved(now) : next)));
      }
    } finally {
      applying = false;
    }
  }

  function receiveScene(scene) {
    if (!ready || unwritten.has("scene") || !scene) return;
    applying = true;
    try {
      const stage = altarStage;
      stage.dataset.background = scene.background || "";
      stage.dataset.backgroundName = scene.backgroundName || "";
      stage.style.backgroundImage = scene.background ? `url("${scene.background}")` : "";
      altarGroups = Array.isArray(scene.groups) ? scene.groups : [];
      activeGroupId = scene.activeGroupId || null;
      global.altarExtraFields = scene.extra && typeof scene.extra === "object" ? scene.extra : {};
      if (typeof updateGroupIndicator === "function") updateGroupIndicator();
      if (typeof syncGroupObjectClasses === "function") syncGroupObjectClasses();
      savedScene = JSON.stringify(sceneOf(stageDocument()));
    } finally {
      applying = false;
    }
  }

  // ── Your changes: to the others at once, to the database a moment later ─
  function push() {
    if (!ready || applying || !access?.can_edit) return;
    // Compare with what's saved, counting changes already on their way as saved.
    const known = new Map(saved);
    let knownScene = savedScene;
    unwritten.forEach((change, key) => {
      if (change.kind === "scene") knownScene = JSON.stringify(change.scene);
      else if (change.data == null) known.delete(key);
      else known.set(key, JSON.stringify(change.data));
    });
    const changes = changesFrom(stageDocument(), known, knownScene);
    if (!changes.length) return;
    changes.forEach((change) => {
      const key = change.kind === "scene" ? "scene" : change.key;
      unwritten.set(key, change);
      unsent.set(key, change);
    });
    if (!timers.send) timers.send = global.setTimeout(flushSend, BROADCAST_MS);
    global.clearTimeout(timers.write);
    timers.write = global.setTimeout(flushWrite, WRITE_MS);
    status();
  }

  function flushSend() {
    timers.send = null;
    const list = [...unsent.values()];
    unsent.clear();
    if (!channel) return;
    list.forEach((change) => {
      const payload = change.kind === "scene" ? { from: me.id, scene: change.scene } : { from: me.id, key: change.key, data: change.data };
      channel.send({ type: "broadcast", event: "change", payload }).catch?.(() => {});
    });
  }

  async function write(changes, objects) {
    let top = Math.max(0, ...positions.values());
    for (const change of changes) {
      let result;
      if (change.kind === "scene") {
        const s = change.scene;
        result = await db().from("coven_altars").update({ background: s.background, background_name: s.backgroundName, groups: s.groups, active_group_id: s.activeGroupId, extra: s.extra }).eq("id", altar.id);
      } else if (change.data == null) {
        result = await db().from("coven_altar_objects").delete().eq("altar_id", altar.id).eq("object_key", change.key);
        positions.delete(change.key);
      } else {
        let position = positions.get(change.key);
        if (position == null) {
          // New things go on top of what's there, in the order they sit on the altar.
          const index = objects.findIndex((o) => keyOf(o) === change.key);
          position = Math.max(top + 1, index);
          top = position;
          positions.set(change.key, position);
        }
        result = await db().from("coven_altar_objects").upsert({ altar_id: altar.id, object_key: change.key, coven_id: altar.coven_id, position, data: change.data }, { onConflict: "altar_id,object_key" });
      }
      if (result?.error) throw Object.assign(new Error(result.error.message), { code: result.error.code });
    }
  }

  async function flushWrite() {
    timers.write = null;
    if (!altar || !unwritten.size) return;
    const changes = [...unwritten.values()];
    unwritten.clear();
    sending = true;
    status();
    try {
      await write(changes, stageDocument().objects);
      changes.forEach((change) => {
        if (change.kind === "scene") savedScene = JSON.stringify(change.scene);
        else if (change.data == null) saved.delete(change.key);
        else saved.set(change.key, JSON.stringify(change.data));
      });
      problem = "";
    } catch (error) {
      if (REFUSED.has(error.code)) {
        // Refused (the ritual moved on, the keeper locked it, or it broke a rule): back to how it really is.
        problem = error.message || "That change wasn’t accepted.";
        await checkAccess();
        await load();
      } else {
        // Offline or a hiccup: keep them and try again shortly.
        changes.forEach((change) => {
          const key = change.kind === "scene" ? "scene" : change.key;
          if (!unwritten.has(key)) unwritten.set(key, change);
        });
        problem = "Offline. Your changes will be saved when you’re back.";
        timers.write = global.setTimeout(flushWrite, 4000);
      }
    }
    sending = false;
    status();
  }

  // ── The bar over the altar ─────────────────────────────────────────────
  let bar = null;
  function status() {
    if (!bar) return;
    const line = problem || (sending || unwritten.size ? "Saving…" : access && !access.can_edit ? "View only" : ready ? "Saved ✓" : "Opening…");
    bar.querySelector("[data-coven-altar-status]").textContent = line;
    const others = here.filter((p) => p.user_id !== me?.id).map((p) => p.name).filter(Boolean);
    bar.querySelector("[data-coven-altar-here]").textContent = others.length ? `At the altar: ${others.join(", ")}` : "No one else is here right now.";
    const reason = bar.querySelector("[data-coven-altar-reason]");
    reason.hidden = !(access && !access.can_edit);
    reason.textContent = access?.reason || "You can watch this altar here.";
    document.body.classList.toggle("is-coven-view-only", Boolean(access && !access.can_edit));
  }

  function mountBar() {
    const workspace = document.querySelector(".altar-workspace");
    if (!workspace || bar) return;
    bar = document.createElement("section");
    bar.className = "coven-altar-bar";
    bar.setAttribute("aria-label", "Coven altar");
    bar.innerHTML = `
      <div class="coven-altar-bar__text">
        <p class="eyebrow">Coven altar</p>
        <h2 data-coven-altar-name>Opening the altar…</h2>
        <p class="coven-altar-bar__status" role="status" aria-live="polite" data-coven-altar-status>Opening…</p>
        <p class="coven-altar-bar__here" data-coven-altar-here></p>
        <p class="coven-altar-bar__reason" data-coven-altar-reason hidden></p>
      </div>
      <div class="coven-altar-bar__actions">
        <a class="button button--small button--pill" href="${esc(covenHref())}">← Back to the coven</a>
        <button class="button button--small button--pill" type="button" data-coven-altar-copy>Keep a copy</button>
      </div>`;
    workspace.insertAdjacentElement("beforebegin", bar);
    bar.querySelector("[data-coven-altar-copy]").addEventListener("click", keepCopy);
    const hero = document.querySelector(".altar-hero");
    if (hero) {
      hero.querySelector("h1").textContent = "A Coven Altar";
      hero.querySelector("p:not(.eyebrow)").textContent = "Tended together. Everyone here sees it change as it happens, and changes save for the coven by themselves.";
    }
  }

  async function keepCopy() {
    if (typeof saveAltar !== "function" || !altar) return;
    await saveAltar({ asNew: true, name: altar?.name || "Coven altar" });
    // The coven's altar stays the one open here.
    global.setCurrentSavedAltar?.("");
    if (typeof showAltarToast === "function") showAltarToast("A copy is among your own altars");
  }

  function message(text) {
    mountBar();
    if (!bar) return;
    bar.querySelector("[data-coven-altar-name]").textContent = "Coven altar";
    bar.querySelector("[data-coven-altar-status]").innerHTML = text;
    // Nothing here can be tended (signed out, or no such altar): the stage is for looking only.
    bar.querySelector("[data-coven-altar-copy]").hidden = true;
    document.body.classList.add("is-coven-view-only");
  }

  // The action bar's Save keeps a copy; Library leaves for your own altars.
  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest?.('[data-global-action="save-altar"], [data-global-action="load-altar"]');
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (button.dataset.globalAction === "save-altar") keepCopy();
      else if (global.confirm("Leave the coven’s altar for your own altars?")) global.location.assign("/altar/");
    },
    true
  );

  // ── Loading, access and the live channel ───────────────────────────────
  async function checkAccess() {
    try {
      const { data, error } = await db().rpc("coven_altar_access", { p_altar: altarId });
      if (!error && data) access = Array.isArray(data) ? data[0] : data;
    } catch {
      // Keep what we had; the database still decides each change.
    }
    status();
  }

  async function load() {
    const [{ data: row, error: altarError }, { data: rows, error: rowError }] = await Promise.all([
      db().from("coven_altars").select(ALTAR_FIELDS).eq("id", altarId).maybeSingle(),
      db().from("coven_altar_objects").select("altar_id,object_key,coven_id,position,data,updated_by").eq("altar_id", altarId)
    ]);
    if (altarError || rowError) {
      problem = "The altar couldn’t be loaded. Check your connection and try again.";
      status();
      return false;
    }
    if (!row) {
      message("This altar isn’t here. It may have been cleared away, or it belongs to a coven you’re not in.");
      return false;
    }
    altar = row;
    mountBar();
    bar.querySelector("[data-coven-altar-name]").textContent = row.name;
    document.title = `${row.name} | Salt & Sovereignty`;
    await setStage(row, rows);
    status();
    return true;
  }

  function connect() {
    if (channel || !altar) return;
    channel = db().channel(`coven-altar:${altarId}`, { config: { presence: { key: me.id }, broadcast: { self: false } } });
    channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_altar_objects", filter: `altar_id=eq.${altarId}` }, (payload) => {
      if (payload.eventType === "DELETE" || !payload.new) return;
      positions.set(payload.new.object_key, payload.new.position);
      if (payload.new.updated_by === me.id) return;
      receive(payload.new.object_key, payload.new.data);
    });
    // Deletes can't be filtered; ones for other altars are ignored.
    channel.on("postgres_changes", { event: "DELETE", schema: "public", table: "coven_altar_objects" }, (payload) => {
      if (payload.old?.altar_id !== altarId || !payload.old.object_key) return;
      positions.delete(payload.old.object_key);
      receive(payload.old.object_key, null);
    });
    channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "coven_altars", filter: `id=eq.${altarId}` }, (payload) => {
      altar = payload.new;
      bar?.querySelector("[data-coven-altar-name]") && (bar.querySelector("[data-coven-altar-name]").textContent = altar.name);
      checkAccess();
      if (payload.new.updated_by !== me.id) receiveScene(core().sceneFromAltar(payload.new));
    });
    ["coven_rituals", "coven_ritual_steps", "coven_altar_editors", "coven_members"].forEach((table) =>
      channel.on("postgres_changes", { event: "*", schema: "public", table, filter: `coven_id=eq.${altar.coven_id}` }, () => checkAccess())
    );
    channel.on("broadcast", { event: "change" }, ({ payload }) => {
      if (!payload || payload.from === me.id) return;
      if (payload.scene) receiveScene(payload.scene);
      else if (payload.key) receive(payload.key, payload.data ?? null);
    });
    channel.on("presence", { event: "sync" }, () => {
      here = Object.values(channel.presenceState()).map((list) => list[0]).filter(Boolean);
      status();
    });
    let first = true;
    channel.subscribe((state) => {
      if (state !== "SUBSCRIBED") return;
      channel.track({ user_id: me.id, name: myName }).catch?.(() => {});
      // Coming back after a dropped connection: catch up with what happened meanwhile.
      if (!first && !unwritten.size) load();
      first = false;
    });
  }

  async function start() {
    if (!db() || !core() || !app()) {
      message("The altar couldn’t open here. Please refresh the page.");
      return;
    }
    const { data } = await db().auth.getSession();
    me = data?.session?.user || null;
    if (!me) {
      message(`Sign in to tend your coven’s altars. <button class="button button--small button--pill" type="button" data-coven-altar-signin>Sign in</button>`);
      bar?.querySelector("[data-coven-altar-signin]")?.addEventListener("click", () => (typeof global.openSanctuaryModal === "function" ? global.openSanctuaryModal() : global.location.assign("/?sanctuary=auth")));
      document.addEventListener("saltAuthSuccess", () => global.location.reload(), { once: true });
      return;
    }
    const profile = await db().from("coven_profiles").select("display_name").eq("user_id", me.id).maybeSingle();
    myName = profile?.data?.display_name || "A member";
    await checkAccess();
    if (await load()) connect();
  }

  // Leaving the altar sends anything still waiting.
  global.addEventListener("pagehide", () => {
    if (unwritten.size) flushWrite();
  });

  // Once the page's own scripts have set the stage up (events.js would restore your draft at 500ms; this replaces that).
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => global.setTimeout(start, 50), { once: true });
  else global.setTimeout(start, 50);

  global.CovenAltarPage = { altarId, slug, norm, changesFrom, status: () => ({ ready, access, problem, unwritten: unwritten.size }) };
})(window);
