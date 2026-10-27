/*
 * To tend, on the website: everything you tend, loaded from where it lives,
 * gathered by the app's own logic (SaltCore.tend: app/src/lib/tend), and
 * tended by each source's own tending, as the app does (lib/tend/store.ts):
 *
 *  - your altars (saved_altars, or this browser's for guests) and their
 *    petition box (craft `altar.petitions`): candles lit or rested, offerings
 *    refreshed, plants watered and petitions burned, buried or released are
 *    saved into the altar exactly as the altar page saves them;
 *  - your covens: tend_coven_petition (with its altar candle in your name,
 *    from SaltCore.altar.petitionAltar), close_coven_petition,
 *    tend_coven_ritual_contribution (your own rows only),
 *    save_coven_ritual_contribution for what a rite asks of you, and
 *    log_coven_mentor_checkin;
 *  - your journeys (craft `journeys.progress`) and "Did it work?" days
 *    (user_rituals.metadata.lookBack, apothecary_items.metadata.lookBack);
 *  - the list's own rhythms, reminders, words and endings: craft
 *    `tend.rhythms`, with "how did it go?" kept as a Grimoire page.
 *
 * Needs: js/supabase-config.js (window.db), js/auth.js, js/my-settings.js,
 * js/salt-store.js. Loads js/core/tend.js, js/core/journeys.js (and each
 * journey begun), covens/coven-data.js and js/core/altar.js as it needs them.
 */
(function (global) {
  "use strict";

  const user = () => (typeof global.getCurrentSaltUser === "function" ? global.getCurrentSaltUser() : null);
  const href = (path) => global.SaltEnvironment?.resolvePath?.(path) || path;
  const storage = (() => {
    try {
      return global.localStorage;
    } catch {
      return { getItem: () => null, setItem() {}, removeItem() {} };
    }
  })();
  const readJson = (key, fallback) => {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  const writeJson = (key, value) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked */
    }
  };

  const scripts = new Map();
  function script(src, ready) {
    if (ready()) return Promise.resolve();
    if (!scripts.has(src)) {
      scripts.set(
        src,
        new Promise((resolve, reject) => {
          const el = global.document.createElement("script");
          el.src = href(src);
          el.async = true;
          el.onload = () => resolve();
          el.onerror = () => {
            scripts.delete(src);
            reject(new Error("Part of the page didn’t load. Check your connection and try again."));
          };
          global.document.head.appendChild(el);
        })
      );
    }
    return scripts.get(src);
  }
  const core = () => global.SaltCore.tend;
  const ensureCore = () => script("/js/core/tend.js", () => !!global.SaltCore?.tend);

  const GUEST_RITUALS = "saltAndSovereigntyRitualLifecycle:guest";
  const GUEST_APOTHECARY = "saltAndSovereigntyApothecaryItems";

  async function rows(query) {
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
  const quiet = (p) => p.catch(() => []);

  // ── Loading ────────────────────────────────────────────────────────────

  async function loadAltars(account) {
    const S = core().snapshot;
    if (account && global.db) return (await rows(global.db.from("saved_altars").select("id,name,altar_data,created_at,updated_at").eq("user_id", account.id))).map(S.altarFromRow);
    return S.parseLocalAltars(storage.getItem(S.LOCAL_ALTARS_KEY));
  }

  async function craft(collection) {
    try {
      return global.SaltCraft ? await global.SaltCraft.list(collection) : [];
    } catch {
      return [];
    }
  }

  async function loadJournal(account) {
    if (account && global.db) return quiet(rows(global.db.from("user_rituals").select("id,title,intention,metadata,ritual_date,moon_phase").eq("user_id", account.id).limit(1000)));
    const device = readJson(GUEST_RITUALS, {}) || {};
    return Array.isArray(device.journals) ? device.journals : [];
  }

  async function loadApothecary(account) {
    const shape = (r) => ({ id: r.id, name: r.name || "", typeLabel: r.typeLabel || r.type_label || "", intention: r.intention || "", createdAt: r.createdAt || r.created_at || "", metadata: r.metadata || {} });
    if (account && global.db) return (await quiet(rows(global.db.from("apothecary_items").select("id,name,type_label,intention,created_at,metadata").eq("user_id", account.id)))).map(shape);
    const raw = readJson(GUEST_APOTHECARY, []);
    return (Array.isArray(raw) ? raw : []).filter((r) => r && r.id).map(shape);
  }

  /** Your journeys begun, with what's next today (journeys/progress.ts nextSteps), each journey's text loaded as it's needed. */
  async function loadJourneys(entries, settings, now) {
    if (!entries.length) return [];
    await script("/js/core/journeys.js", () => !!global.SaltCore?.journeys);
    const J = global.SaltCore.journeys;
    const cadence = { choice: J.holidayChoice(settings || {}), hidden: J.hiddenTraditions(settings || {}) };
    const out = [];
    for (const e of entries) {
      const id = e.data?.journeyId;
      if (!id || !J.JOURNEY_CATALOG.some((j) => j.id === id)) continue;
      try {
        await script(`/js/core/journey-${id}.js`, () => !!global.SaltCore[`journey-${id}`]);
        const journey = global.SaltCore[`journey-${id}`]?.journey;
        if (!journey) continue;
        const progress = J.progress.normalizeProgress(e.data);
        out.push({ entryId: e.id, journeyId: id, title: journey.title, steps: J.progress.nextSteps(journey, progress, now, cadence), progress });
      } catch {
        /* that journey waits for another visit */
      }
    }
    return out;
  }

  /** Your covens' part, as the app's lib/tend/covens.ts loads it. */
  async function loadCovens(account) {
    const db = global.db;
    if (!account || !db) return null;
    const userId = account.id;
    const memberships = await rows(db.from("coven_members").select("coven_id,user_id,rank_id,status").eq("user_id", userId).eq("status", "active"));
    const ids = memberships.map((m) => m.coven_id);
    if (!ids.length) return null;
    const [covens, tendings, petitions, contributions, upcoming, mentorships, checkins, me] = await Promise.all([
      rows(db.from("covens").select("id,slug,name").in("id", ids).eq("status", "active")),
      quiet(rows(db.from("coven_petition_tendings").select("petition_id,user_id,note,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1000))),
      quiet(rows(db.from("coven_petitions").select("id,coven_id,user_id,title,body,color,status,last_tended_at,altar_id,source_ritual_id,created_at").in("coven_id", ids).eq("status", "open").limit(1000))),
      quiet(rows(db.from("coven_ritual_contributions").select("id,step_id,ritual_id,coven_id,kind,body,private,anonymous,visibility,fate,status,petition_id,updated_at,created_at").eq("user_id", userId).limit(500))),
      quiet(rows(db.from("coven_rituals").select("id,coven_id,title,status,scheduled_for,created_at").in("coven_id", ids).in("status", ["scheduled", "live"]).limit(200))),
      quiet(rows(db.from("coven_mentors").select("coven_id,user_id,mentor_id,assigned_at").eq("mentor_id", userId))),
      quiet(rows(db.from("coven_mentor_checkins").select("coven_id,user_id,mentor_id,met_on").eq("mentor_id", userId).order("met_on", { ascending: false }).limit(1000))),
      quiet(rows(db.from("coven_profiles").select("user_id,display_name").eq("user_id", userId)))
    ]);
    const tended = new Set(tendings.map((t) => t.petition_id));
    const mine = petitions.filter((p) => p.user_id === userId || tended.has(p.id));
    const known = new Set(upcoming.map((r) => r.id));
    const wanted = [...new Set([...contributions.map((c) => c.ritual_id), ...mine.map((p) => p.source_ritual_id || "")])].filter((id) => id && !known.has(id));
    const [earlier, steps] = await Promise.all([
      wanted.length ? quiet(rows(db.from("coven_rituals").select("id,coven_id,title,status,scheduled_for,created_at").in("id", wanted.slice(0, 200)))) : [],
      upcoming.length ? quiet(rows(db.from("coven_ritual_steps").select("id,ritual_id,title,contribution,assignees,assigned_user_id,assigned_rank_id").in("ritual_id", upcoming.map((r) => r.id)))) : []
    ]);
    const people = [...new Set([...mine.map((p) => p.user_id), ...mentorships.map((m) => m.user_id)])].filter((id) => id !== userId);
    const profiles = people.length ? await quiet(rows(db.from("coven_profiles").select("user_id,display_name").in("user_id", people))) : [];
    const names = Object.fromEntries(profiles.map((p) => [p.user_id, p.display_name || "A member"]));
    return {
      userId,
      covens,
      memberships,
      petitions: mine,
      tendings,
      contributions,
      rituals: [...upcoming, ...earlier],
      steps,
      mentorships,
      checkins,
      nameOf: (id) => names[id] || "A member",
      myName: me[0]?.display_name || "A member"
    };
  }

  /** Everything, gathered: { items, list, records, ... } for the page and Today's card. */
  async function load() {
    await ensureCore();
    const C = core();
    const account = user();
    const now = new Date();
    let settings = {};
    try {
      settings = (await global.SaltSettings?.get?.()) || {};
    } catch {
      settings = {};
    }
    const [altars, petitions, recordEntries, journal, apothecary, covens, progress] = await Promise.all([
      loadAltars(account).catch(() => []),
      craft(C.petitions.PETITIONS),
      craft(C.model.TEND_COLLECTION),
      loadJournal(account).catch(() => []),
      loadApothecary(account).catch(() => []),
      loadCovens(account).catch(() => null),
      craft("journeys.progress")
    ]);
    const journeys = await loadJourneys(progress, settings, now).catch(() => []);
    const entries = [];
    for (const e of [...recordEntries].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))) {
      const record = C.model.normalizeRecord(e.data);
      if (record && !entries.some((x) => x.record.key === record.key)) entries.push({ id: e.id, record });
    }
    const records = entries.map((e) => e.record);
    const items = C.gather.gatherTendables({ now, altars: { altars, petitions }, covens, journeys, journal, apothecary });
    return { now, account, settings, altars, petitions, entries, records, journal, apothecary, covens, journeys, items, list: C.model.tendList(items, records, now) };
  }

  // ── Tending ────────────────────────────────────────────────────────────

  async function saveRecord(state, item, change) {
    const C = core();
    const existing = state.entries.find((e) => e.record.key === item.key);
    const base = existing ? existing.record : C.model.newRecord(item);
    const next = change({ ...base, title: item.title, source: item.source, href: item.href });
    if (existing) await global.SaltCraft.update(C.model.TEND_COLLECTION, existing.id, next);
    else await global.SaltCraft.add(C.model.TEND_COLLECTION, next);
  }

  /** Change one of your altars and save it as the altar page does (your account's row, or this browser's copy). */
  async function onAltar(state, altarId, change) {
    const C = core();
    const altar = state.altars.find((a) => a.id === altarId);
    if (!altar) throw new Error("That altar isn’t here any more.");
    const doc = C.snapshot.documentFromAltar(altar);
    const now = new Date().toISOString();
    const next = C.altar.tendAltar(doc, change, now);
    if (next === doc) return;
    const name = altar.name || "My Altar";
    const data = C.snapshot.altarDataFromDocument(next, name, now);
    if (state.account && global.db) {
      const { error } = await global.db.from("saved_altars").update({ name, altar_data: data, updated_at: now }).eq("id", altar.id).eq("user_id", state.account.id);
      if (error) throw error;
    } else {
      const list = C.snapshot.parseLocalAltars(storage.getItem(C.snapshot.LOCAL_ALTARS_KEY));
      const index = list.findIndex((a) => a.id === altar.id);
      if (index < 0) throw new Error("That altar isn’t in this browser any more.");
      list[index] = { ...list[index], ...data, id: list[index].id, name, updatedAt: now };
      writeJson(C.snapshot.LOCAL_ALTARS_KEY, list);
    }
  }

  const rpc = async (name, args) => {
    const { data, error } = await global.db.rpc(name, args);
    if (error) throw error;
    return data;
  };

  /** A coven petition's altar: a candle in your name beside it, as the coven's petitions page sets it. A kindness, not the record. */
  async function petitionCandle(state, petition) {
    if (!petition?.altar_id) return;
    try {
      await Promise.all([script("/covens/coven-data.js", () => !!global.CovenData), script("/js/core/altar.js", () => !!global.SaltCore?.altar?.covenAltar)]);
      await global.CovenData.changeAltarOnce(petition.altar_id, global.SaltCore.altar.petitionAltar.tendWithSeed(petition, state.covens?.myName || "A member", new Date().toISOString(), state.account?.id || ""));
    } catch {
      /* the tending stands */
    }
  }

  async function tend(state, item, action, word) {
    const C = core();
    const ref = item.ref;
    if (item.group === "altar") {
      if (action === "light" || action === "snuff") await onAltar(state, ref.altarId, { kind: action, objectId: item.kind === "petition" ? ref.candleId : ref.objectId });
      if (action === "refresh" || action === "water") await onAltar(state, ref.altarId, { kind: action, objectId: ref.objectId });
      if (word && word.trim() && ref.objectId) await onAltar(state, ref.altarId, { kind: "word", objectId: ref.objectId, text: word });
    } else if (item.kind === "coven-petition" && action === "tend") {
      await rpc("tend_coven_petition", { p_petition: ref.petitionId, p_note: String(word || "").trim() || null });
      await petitionCandle(state, state.covens?.petitions.find((p) => p.id === ref.petitionId));
    } else if (item.kind === "contribution" && action === "tend") {
      await rpc("tend_coven_ritual_contribution", { p_contribution: ref.contributionId, p_status: "held", p_note: null });
    }
    await saveRecord(state, item, (r) => C.model.recordTended(r, new Date(), word || ""));
    return {
      light: "The candle is lit.",
      snuff: "The candle is resting.",
      refresh: "A fresh offering is set out.",
      water: "Watered.",
      tend: item.kind === "coven-petition" ? "You tended it. A candle burns in your name beside it." : "You are holding it still.",
      word: "Your word is kept with it."
    }[action];
  }

  /** "How did it go?" as a page in your Grimoire, written as the holy pages write theirs (grimoire/holyOps.ts). */
  async function keepInGrimoire(state, page) {
    const db = global.db;
    const account = state.account;
    if (!account || !db) return undefined;
    const [books, sections, pages] = await Promise.all([
      db.from("grimoire_books").select("id,title,created_at,updated_at").eq("user_id", account.id).order("created_at"),
      db.from("grimoire_sections").select("id,book_id,title,sort_order,created_at").eq("user_id", account.id),
      db.from("grimoire_pages").select("id,book_id,section_id,title,page_type,sort_order,metadata,created_at,updated_at").eq("user_id", account.id)
    ]);
    const failed = [books, sections, pages].find((r) => r.error);
    if (failed) throw failed.error;
    const snapshot = { fetchedAt: new Date().toISOString(), books: books.data || [], sections: sections.data || [], pages: pages.data || [], blocks: [], links: [] };
    const C = core();
    const { id, ops } = C.holyOps.holyPageOps(snapshot, { userId: account.id, now: new Date().toISOString() }, page, C.newId);
    for (const op of ops) {
      if (op.kind !== "insert") continue;
      const { error } = await db.from(op.table).insert(op.row);
      if (error && error.code !== "23505") throw error;
    }
    return id;
  }

  async function end(state, item, how, note, keep) {
    const C = core();
    const ref = item.ref;
    const now = new Date();
    if (item.kind === "petition" && ["burned", "buried", "released"].includes(how)) {
      const entry = state.petitions.find((e) => e.id === ref.entryId);
      if (entry) {
        await global.SaltCraft.update(C.petitions.PETITIONS, entry.id, C.petitions.finishPetition(entry.data, how, now));
        await onAltar(state, ref.altarId, { kind: "petition", entryId: entry.id, title: entry.data.title, candleId: entry.data.candleId, how });
      }
    } else if (item.kind === "offering" && how === "returned") {
      await onAltar(state, ref.altarId, { kind: "returned", objectId: ref.objectId });
    } else if (item.kind === "coven-petition" && (how === "answered" || how === "closed")) {
      await rpc("close_coven_petition", { p_petition: ref.petitionId, p_status: how, p_note: String(note || "").trim() || null });
    } else if (item.kind === "contribution" && (how === "answered" || how === "closed")) {
      await rpc("tend_coven_ritual_contribution", { p_contribution: ref.contributionId, p_status: how, p_note: String(note || "").trim() || null });
    }
    let pageId;
    if (keep && String(note || "").trim() && state.account) {
      const record = state.entries.find((e) => e.record.key === item.key)?.record || null;
      pageId = await keepInGrimoire(state, C.model.endingPage(item, record, how, note, now)).catch(() => undefined);
    }
    await saveRecord(state, item, (r) => C.model.recordEnded(r, how, note || "", now, pageId));
    const done = how === "answered" ? "Marked answered. Blessed be." : how === "let-go" ? "Let go. It won’t ask to be tended again." : "It’s ended, with thanks.";
    return `${done}${pageId ? " How it went is kept in your Grimoire." : ""}`;
  }

  async function write(state, item, body, isPrivate) {
    await rpc("save_coven_ritual_contribution", { p_step: item.ref.stepId, p_body: String(body || "").trim(), p_items: [], p_private: !!isPrivate, p_anonymous: false });
    return isPrivate ? "Written, and sealed: only you can read it." : "Written. It’s ready for the rite.";
  }

  async function checkin(state, item, note) {
    const C = core();
    await rpc("log_coven_mentor_checkin", { p_coven: item.ref.covenId, p_user: item.ref.userId, p_met_on: C.record.todayIso(), p_note: String(note || "").trim() || null });
    await saveRecord(state, item, (r) => C.model.recordTended(r, new Date()));
    return "The check-in is logged.";
  }

  async function practice(state, item, note) {
    const C = core();
    const journey = state.journeys.find((j) => j.entryId === item.ref.entryId);
    if (!journey) throw new Error("That journey isn’t here any more.");
    const next = global.SaltCore.journeys.progress.logPractice(journey.progress, item.ref.practiceId, new Date(), note);
    await global.SaltCraft.update("journeys.progress", journey.entryId, next);
    await saveRecord(state, item, (r) => C.model.recordTended(r, new Date()));
    return "Done for today. It’s kept with your journey.";
  }

  /** "Did it work?", saved into the entry's metadata.lookBack exactly as the journal saves it. */
  async function answer(state, item, outcome, words) {
    const C = core();
    const checkIn = { answer: outcome, outcome: String(words || "") };
    const updated_at = new Date().toISOString();
    if (item.ref.journalId) {
      const entry = state.journal.find((j) => j.id === item.ref.journalId);
      if (!entry) throw new Error("That journal entry isn’t here any more.");
      const next = C.lookBack.answerLookBack(entry, checkIn, new Date());
      if (state.account && global.db) {
        const { error } = await global.db.from("user_rituals").update({ metadata: next.metadata, updated_at }).eq("id", entry.id);
        if (error) throw error;
      } else {
        const device = readJson(GUEST_RITUALS, {}) || {};
        device.journals = (Array.isArray(device.journals) ? device.journals : []).map((j) => (j.id === entry.id ? { ...j, metadata: next.metadata, updated_at } : j));
        writeJson(GUEST_RITUALS, device);
      }
    } else {
      const made = state.apothecary.find((a) => a.id === item.ref.itemId);
      if (!made) throw new Error("That working isn’t here any more.");
      const next = C.apothecaryLookBack.answerItemLookBack(made, checkIn, new Date());
      const metadata = { ...(next.metadata || {}), source: next.metadata?.source || "altar-apothecary" };
      if (state.account && global.db) {
        const { error } = await global.db.from("apothecary_items").update({ metadata, updated_at }).eq("user_id", state.account.id).eq("id", made.id);
        if (error) throw error;
      } else {
        const list = readJson(GUEST_APOTHECARY, []);
        writeJson(GUEST_APOTHECARY, (Array.isArray(list) ? list : []).map((x) => (x.id === made.id ? { ...x, metadata, updatedAt: updated_at } : x)));
      }
    }
    return outcome === "yes" ? "Kept: it worked. Blessed be." : "Kept with the working.";
  }

  async function setRhythm(state, item, change) {
    await saveRecord(state, item, (r) => ({ ...r, ...change }));
    return change.remind ? "Saved. Its reminder rings on your phone, and joins the calendar file on Reminders." : "Saved.";
  }

  global.TendData = { load, ensureCore, tend, end, write, checkin, practice, answer, setRhythm };
})(window);
