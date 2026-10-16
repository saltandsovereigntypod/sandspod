/*
 * Dedication journeys: reading and writing the same data as the app.
 *
 *  - Progress: one craft entry per begun journey in `craft_entries`,
 *    collection "journeys.progress", data exactly as app/src/lib/journeys/
 *    progress.ts keeps it (window.SaltCraft; guests keep it in this browser).
 *  - Journeys: the catalog is in SaltCore.journeys; each journey's full text is
 *    its own bundle, js/core/journey-<id>.js, loaded when it's opened.
 *  - Reflections: entries in the ritual journal (`user_rituals`, and the
 *    Living Library's My Practice), as the app's saveJournal writes them;
 *    guests keep them with this browser's My Rituals.
 *  - Rites: handed to the altar's Ritual Companion to run, the way the
 *    Rituals pages begin a premade working; when the ritual is finished (or
 *    journaled), the rite is marked done here, as the app's useJourney does.
 *
 * Needs: js/supabase-config.js (window.db), js/auth.js, js/my-settings.js,
 * js/salt-store.js, js/core/journeys.js and rituals/journeys/journeys-logic.js.
 */
(function (global) {
  "use strict";

  const L = global.JourneysLogic;
  const core = () => global.SaltCore.journeys;
  const user = () => (typeof global.getCurrentSaltUser === "function" ? global.getCurrentSaltUser() : null);
  const COLLECTION = "journeys.progress";

  const KEYS = {
    pendingRite: "salt.journeys.pendingRite",
    begin: "saltRitualBegin",
    activeRitual: "saltAndSovereigntyActiveRitualSession",
    guestRituals: "saltAndSovereigntyRitualLifecycle:guest",
    myRituals: "saltAndSovereigntyUserRituals"
  };
  const BEGIN_URL = "/altar/?ritual=1&beginRitual=1";

  function readJson(key, fallback, storage = global.localStorage) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }
  function writeJson(key, value, storage = global.localStorage) {
    try {
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage full or blocked: this visit still has what it read. */
    }
  }
  const list = (value) => (Array.isArray(value) ? value : []);

  // ---------------------------------------------------------------- journeys

  const loaded = new Map();
  /** A journey's full text, loaded once: null if there's no such journey. */
  function loadJourney(id) {
    if (!core().JOURNEY_CATALOG.some((j) => j.id === id)) return Promise.resolve(null);
    if (loaded.has(id)) return loaded.get(id);
    const name = `journey-${id}`;
    const promise = new Promise((resolve, reject) => {
      if (global.SaltCore[name]) return resolve(global.SaltCore[name].journey);
      const script = global.document.createElement("script");
      script.src = `/js/core/${name}.js`;
      script.async = true;
      script.onload = () => resolve(global.SaltCore[name]?.journey || null);
      script.onerror = () => {
        loaded.delete(id);
        reject(new Error("This journey couldn’t be loaded. Please check your connection and try again."));
      };
      global.document.head.append(script);
    });
    loaded.set(id, promise);
    return promise;
  }

  const summary = (id) => core().JOURNEY_CATALOG.find((j) => j.id === id) || null;

  // ---------------------------------------------------------------- progress

  /** Every journey begun, newest first, with old copies filled in (store.ts useJourneyProgress). */
  async function progressEntries() {
    const P = core().progress;
    const entries = await global.SaltCraft.list(COLLECTION);
    return entries.filter((e) => e.data && typeof e.data.journeyId === "string").map((e) => ({ ...e, data: P.normalizeProgress(e.data) }));
  }

  const progressFor = (entries, journeyId) => core().progress.progressFor(entries, journeyId);

  async function startJourney(journeyId) {
    return global.SaltCraft.add(COLLECTION, core().progress.newProgress(journeyId, new Date()));
  }

  /** Change a journey's progress and save it; returns the saved entry. */
  async function change(entry, fn) {
    if (!entry) return null;
    const next = fn(entry.data);
    if (next === entry.data) return entry;
    await global.SaltCraft.update(COLLECTION, entry.id, next);
    return { ...entry, data: next };
  }

  // ---------------------------------------------------------------- settings

  async function settings() {
    try {
      return (await global.SaltSettings.get()) || {};
    } catch {
      return {};
    }
  }

  /** The calendars the person keeps, for holy days and sabbats (store.ts useCadence). */
  function cadence(s) {
    return { choice: core().holidayChoice(s), hidden: core().hiddenTraditions(s) };
  }

  // ---------------------------------------------------------------- journal

  /**
   * Keep a reflection in the ritual journal, as the app's saveJournal does for
   * an entry without a ritual. Returns the saved entry.
   */
  async function saveJournal(values) {
    const C = core();
    const now = new Date();
    const answers = { ...C.blankAnswers(null, now), ...values };
    const account = user();
    const id = global.SaltCraft.uuid();
    const entry = C.journalPayload({ session: null, answers, userId: account ? account.id : null, id, existing: null, now });
    entry.metadata = { ...(entry.metadata || {}), app: "web" };
    if (!account || !global.db) {
      const rituals = list(readJson(KEYS.myRituals, []));
      const saved = { ...entry, ritual_type: "ritual" };
      writeJson(KEYS.myRituals, [saved, ...rituals]);
      global.SaltAccountData?.markGuestDataChanged?.(global.localStorage);
      return saved;
    }
    const saved = await global.db.from("user_rituals").upsert(C.journalRow(entry, account.id)).select("*").single();
    if (saved.error) throw new Error(saved.error.message || "The journal couldn’t be reached.");
    // The website's My Practice lists rituals through the Living Library, as the app keeps it.
    await global.db.from("living_library_entries").upsert(C.journalLibraryEntry(saved.data, account.id, now), { onConflict: "user_id,entity_id" });
    return saved.data;
  }

  // ---------------------------------------------------------------- rites

  /** The ritual running now, if any: its id (localStorage, as the altar keeps it). */
  function activeRitualId() {
    const stored = readJson(KEYS.activeRitual, null);
    const account = user();
    if (stored && stored.id && (account ? stored.scope !== "guest" : stored.scope === "guest")) return stored.id;
    if (!account) {
      const guest = readJson(KEYS.guestRituals, {});
      const active = list(guest.sessions).find((s) => s.id === guest.activeSessionId && ["active", "paused"].includes(s.status));
      return active ? active.id : null;
    }
    return null;
  }

  /**
   * Begin a stage's rite as a guided ritual: hand the altar's Ritual
   * Companion the rite (in the shape the Rituals pages use) and remember which
   * rite it was, so the session it starts can be matched up on return.
   */
  function beginRite(journey, stage) {
    const C = core();
    const draft = C.progress.riteDraft(stage.rite, journey);
    if (!global.RitualsLogic?.beginHandoff) throw new Error("The Ritual Companion couldn’t be reached. Please reload and try again.");
    writeJson(KEYS.begin, global.RitualsLogic.beginHandoff({ kind: "draft", draft }), global.sessionStorage);
    writeJson(KEYS.pendingRite, { journeyId: journey.id, kind: stage.kind, title: draft.title, at: Date.now() });
    global.location.href = BEGIN_URL;
  }

  /** Sessions and journal entries that might be our rites (only the account's own rows). */
  async function ritualRecords({ since = null, ids = [] } = {}) {
    const account = user();
    if (!account || !global.db) {
      const guest = readJson(KEYS.guestRituals, {});
      return {
        sessions: list(guest.sessions),
        journals: [...list(guest.journals), ...list(readJson(KEYS.myRituals, []))]
      };
    }
    const out = { sessions: [], journals: [] };
    if (since) {
      const found = await global.db
        .from("ritual_sessions")
        .select("id,title,status,started_at,ended_at,created_at")
        .eq("user_id", account.id)
        .gte("started_at", new Date(since - 2 * 60 * 1000).toISOString())
        .order("started_at", { ascending: false })
        .limit(20);
      if (!found.error) out.sessions.push(...(found.data || []));
    }
    if (ids.length) {
      const [sessions, journals] = await Promise.all([
        global.db.from("ritual_sessions").select("id,title,status,started_at,ended_at,created_at").eq("user_id", account.id).in("id", ids),
        global.db.from("user_rituals").select("id,session_id,started_at,ritual_date").eq("user_id", account.id).in("session_id", ids)
      ]);
      if (!sessions.error) out.sessions.push(...(sessions.data || []));
      if (!journals.error) out.journals.push(...(journals.data || []));
    }
    return out;
  }

  /**
   * Bring a journey's rites up to date: match a rite begun from here to the
   * session it started, and mark rites done once their ritual is finished or
   * journaled (store.ts useJourney). Returns the entry, saved if it changed.
   */
  async function reconcileRites(entry) {
    if (!entry) return entry;
    const P = core().progress;
    if (P.journeyStatus(entry.data) === "stopped") return entry;
    let next = entry.data;
    const pending = readJson(KEYS.pendingRite, null);
    const mine = pending && pending.journeyId === next.journeyId ? pending : null;
    const waitingIds = L.waitingRites(next).map(([, id]) => id);
    if (!mine && !waitingIds.length) return entry;

    let records;
    try {
      records = await ritualRecords({ since: mine ? Number(mine.at) : null, ids: waitingIds });
    } catch {
      return entry;
    }
    if (mine) {
      const session = L.matchPendingSession(mine, records.sessions);
      if (session) {
        next = P.riteBegun(next, mine.kind, session.id);
        writeJson(KEYS.pendingRite, null);
      } else if (Date.now() - Number(mine.at) > 24 * 60 * 60 * 1000) {
        writeJson(KEYS.pendingRite, null);
      }
    }
    const activeId = activeRitualId();
    for (const [kind, sessionId] of L.waitingRites(next)) {
      const at = L.riteFinishedAt(sessionId, { ...records, activeId });
      if (at) next = P.riteDone(next, kind, new Date(at));
    }
    if (next === entry.data) return entry;
    return change(entry, () => next);
  }

  global.JourneysStore = {
    KEYS,
    loadJourney,
    summary,
    progressEntries,
    progressFor,
    startJourney,
    change,
    settings,
    cadence,
    saveJournal,
    activeRitualId,
    beginRite,
    reconcileRites
  };
})(window);
