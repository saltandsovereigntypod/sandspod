/*
 * Rituals pages: reading and writing the same rows the app and the altar's
 * Ritual Companion use.
 *
 *  - Plans: `ritual_plans` when signed in (app/src/lib/rituals/store.ts and
 *    planSync.ts), with this browser's copy under "rituals.plans.v1"; guests
 *    keep them in this browser only.
 *  - Templates: `ritual_templates` + `ritual_template_steps`, saved the way the
 *    app's saveTemplate does (Book of Shadows page, ritual_links, Living Library).
 *  - Journal and the running ritual: read only. The altar's Ritual Companion
 *    runs rituals and keeps the journal; "Begin" hands it what to start.
 *
 * Needs: js/supabase-config.js (window.db), js/auth.js, js/salt-store.js,
 * js/core/rituals.js (SaltCore.rituals) and rituals/js/rituals-logic.js.
 */
(function (global) {
  "use strict";

  const L = global.RitualsLogic;
  const K = L.KEYS;
  const core = () => global.SaltCore.rituals;
  const user = () => (typeof global.getCurrentSaltUser === "function" ? global.getCurrentSaltUser() : null);
  const db = () => global.db;

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
  function throwIf(result) {
    if (result && result.error) throw new Error(result.error.message || "Something went wrong.");
    return result;
  }
  const list = (value) => (Array.isArray(value) ? value : []);

  // ---------------------------------------------------------------- plans

  const localPlans = () => list(readJson(K.plans, [])).filter((p) => p && typeof p.id === "string");
  const writePlans = (plans) => writeJson(K.plans, plans);

  /**
   * Plans for whoever is here. Signed in: send removals and plans not saved
   * yet, then show what the account holds (the app's syncPlans). As a guest:
   * only plans that never reached an account, so a shared browser doesn't show
   * someone else's.
   */
  async function loadPlans() {
    const local = localPlans();
    const account = user();
    if (!account || !db()) return local.filter((p) => !p.syncedTo);
    const sync = core().planSync;
    try {
      const deletes = list(readJson(K.planDeletes, []));
      if (deletes.length) {
        throwIf(await db().from("ritual_plans").delete().in("id", deletes));
        writeJson(K.planDeletes, null);
      }
      const pending = sync.unsyncedPlans(local);
      if (pending.length) throwIf(await db().from("ritual_plans").upsert(pending.map((plan) => sync.planRow(plan, account.id))));
      const remote = throwIf(await db().from("ritual_plans").select("*").eq("user_id", account.id));
      const merged = sync.mergePlans(
        local.map((plan) => (pending.includes(plan) ? { ...plan, syncedTo: account.id } : plan)),
        remote.data || [],
        account.id
      );
      // Other accounts' plans stay in this browser's copy for when they come back.
      writePlans([...local.filter((p) => p.syncedTo && p.syncedTo !== account.id), ...merged]);
      return merged;
    } catch (error) {
      console.warn("Plans could not be synced; showing this browser's copy.", error);
      return local.filter((p) => !p.syncedTo || p.syncedTo === account.id);
    }
  }

  async function savePlan(plan) {
    const account = user();
    const sync = core().planSync;
    let saved = { ...plan, syncedTo: null };
    if (account && db() && sync.isSyncable(plan)) {
      try {
        throwIf(await db().from("ritual_plans").upsert(sync.planRow(plan, account.id)));
        saved = { ...plan, syncedTo: account.id };
      } catch (error) {
        console.warn("Plan kept in this browser until it can reach your account.", error);
      }
    }
    writePlans([...localPlans().filter((p) => p.id !== plan.id), saved]);
    return saved;
  }

  /** Remove a plan, as the app's Delete plan does (its own row in ritual_plans). */
  async function removePlan(plan) {
    writePlans(localPlans().filter((p) => p.id !== plan.id));
    const account = user();
    if (!plan.syncedTo || !account || !db()) return;
    try {
      throwIf(await db().from("ritual_plans").delete().eq("id", plan.id).eq("user_id", account.id));
    } catch {
      const deletes = list(readJson(K.planDeletes, []));
      writeJson(K.planDeletes, [...new Set([...deletes, plan.id])]);
    }
  }

  // ---------------------------------------------------------------- reading

  async function templates() {
    const account = user();
    if (!account || !db()) return [];
    const result = throwIf(
      await db()
        .from("ritual_templates")
        .select("*, ritual_template_steps(*)")
        .eq("user_id", account.id)
        .neq("status", "archived")
        .order("updated_at", { ascending: false })
    );
    return (result.data || []).map((t) => ({
      ...t,
      ritual_template_steps: [...(t.ritual_template_steps || [])].sort((a, b) => a.sort_order - b.sort_order)
    }));
  }

  async function journal() {
    const account = user();
    if (!account || !db()) {
      const device = readJson(K.guestRituals, {});
      return L.mergeGuestJournal(list(device?.journals), list(readJson(K.myRituals, [])));
    }
    const result = throwIf(await db().from("user_rituals").select("*").eq("user_id", account.id).order("created_at", { ascending: false }));
    return result.data || [];
  }

  /**
   * Save a change to a journal entry's metadata alone ("Did it work?" and its
   * look-back day, metadata.lookBack), as the app's saveJournalMetadata does:
   * only that column is written. Guests: both of this browser's journal copies.
   */
  async function saveJournalMetadata(entry) {
    const account = user();
    const updated_at = new Date().toISOString();
    if (!account || !db()) {
      const patch = (item) => (item && item.id === entry.id ? { ...item, metadata: entry.metadata, updated_at } : item);
      const device = readJson(K.guestRituals, null);
      if (device && Array.isArray(device.journals)) writeJson(K.guestRituals, { ...device, journals: device.journals.map(patch) });
      const mine = list(readJson(K.myRituals, []));
      if (mine.some((item) => item && item.id === entry.id)) writeJson(K.myRituals, mine.map(patch));
      global.SaltAccountData?.markGuestDataChanged?.(global.localStorage);
      return { ...entry, updated_at };
    }
    const result = throwIf(
      await db().from("user_rituals").update({ metadata: entry.metadata, updated_at }).eq("id", entry.id).eq("user_id", account.id).select("*").single()
    );
    return result.data;
  }

  /** Your My Apothecary workings (spell jars, sachets, oils…), as the altar normalizes them, for "Did it work?". */
  async function apothecaryItems() {
    const account = user();
    const normalize = (row) => (global.ApothecaryNormalization ? global.ApothecaryNormalization.normalize(row) : row);
    if (!account || !db()) return list(readJson(K.apothecary, [])).filter((x) => x && typeof x === "object" && x.id).map(normalize);
    const result = throwIf(await db().from("apothecary_items").select("*").eq("user_id", account.id).order("created_at", { ascending: false }));
    return (result.data || []).map(normalize);
  }

  /**
   * Save a working's metadata alone ("Did it work?", metadata.lookBack), as the
   * app's saveApothecaryMetadata does: only that column, every other key kept.
   */
  async function saveApothecaryMetadata(item) {
    const account = user();
    const updated_at = new Date().toISOString();
    const metadata = { ...(item.metadata || {}), source: (item.metadata && item.metadata.source) || "altar-apothecary" };
    if (!account || !db()) {
      const items = list(readJson(K.apothecary, []));
      writeJson(K.apothecary, items.map((x) => (x && x.id === item.id ? { ...x, metadata, updatedAt: updated_at } : x)));
      global.SaltAccountData?.markGuestDataChanged?.(global.localStorage);
      return { ...item, metadata };
    }
    throwIf(await db().from("apothecary_items").update({ metadata, updated_at }).eq("id", item.id).eq("user_id", account.id));
    return { ...item, metadata };
  }

  /** The ritual under way, with its steps, or null. */
  async function activeSession() {
    const account = user();
    if (!account || !db()) {
      const device = readJson(K.guestRituals, {});
      const sessions = list(device?.sessions);
      return sessions.find((s) => s && s.id === device.activeSessionId && (s.status === "active" || s.status === "paused")) || null;
    }
    const open = throwIf(
      await db().from("ritual_sessions").select("*").eq("user_id", account.id).in("status", ["active", "paused"]).order("updated_at", { ascending: false }).limit(1)
    );
    const row = (open.data || [])[0];
    if (!row) return null;
    const steps = throwIf(await db().from("ritual_session_steps").select("*").eq("session_id", row.id).eq("user_id", account.id).order("sort_order"));
    return { ...row, session_steps: steps.data || [] };
  }

  /** Your saved altars, newest first: [{ id, name }]. */
  async function altars() {
    const account = user();
    if (!account || !db()) {
      return list(readJson(K.savedAltars, []))
        .filter((a) => a && a.id)
        .map((a) => ({ id: a.id, name: a.name || "My Altar" }));
    }
    const result = throwIf(await db().from("saved_altars").select("id,name").eq("user_id", account.id).order("updated_at", { ascending: false }));
    return (result.data || []).map((a) => ({ id: a.id, name: a.name || "My Altar" }));
  }

  /**
   * Your things, for "You have 6 of the 8": apothecary workings, your own
   * cabinet items, your stones and your garden (app: IngredientCheck).
   */
  async function pantry() {
    const account = user();
    const apothecaryOf = (row) => ({ name: String(row?.name || row?.typeLabel || row?.type_label || "").trim() });
    const customOf = (row) => ({
      id: row.customCabinetItemId || row.id,
      category: String(row.category || ""),
      name: String(row.name || ""),
      keywords: list(row.keywords).map(String),
      forms: list(row.forms).length ? list(row.forms) : [{ type: row.item_type || "" }]
    });
    let apothecary = [];
    let customItems = [];
    if (!account || !db()) {
      apothecary = list(readJson(K.apothecary, [])).filter((x) => x && typeof x === "object").map(apothecaryOf);
      customItems = list(readJson(K.customItems, [])).filter((x) => x && x.name && x.category).map(customOf);
    } else {
      const [items, made] = await Promise.all([
        db().from("custom_cabinet_items").select("*").eq("user_id", account.id),
        db().from("apothecary_items").select("*").eq("user_id", account.id)
      ]);
      customItems = items.error ? [] : (items.data || []).map(customOf);
      apothecary = made.error ? [] : (made.data || []).map(apothecaryOf);
    }
    const craft = async (collection) => {
      try {
        return (await global.SaltCraft.list(collection)).map((e) => e.data || {});
      } catch {
        return [];
      }
    };
    const [stones, plants] = await Promise.all([craft("crystal.stones"), craft("green.plants")]);
    return { objects: [], apothecary, customItems, stones, plants };
  }

  async function settings() {
    try {
      return (await global.SaltSettings.get()) || {};
    } catch {
      return {};
    }
  }

  // ---------------------------------------------------------------- templates

  /** The Book of Shadows page the website keeps for each template (store.ts ensureTemplatePage). */
  async function ensureTemplatePage(userId, template) {
    const metadata = core().rows.templatePageMetadata(template);
    if (template.grimoire_page_id) {
      const updated = throwIf(
        await db()
          .from("grimoire_pages")
          .update({ title: template.title, page_type: "ritual_template", icon: "🌙", metadata })
          .eq("id", template.grimoire_page_id)
          .eq("user_id", userId)
          .select("id")
      );
      if ((updated.data || []).length) return template.grimoire_page_id;
    }
    let book = throwIf(await db().from("grimoire_books").select("id").eq("user_id", userId).order("created_at", { ascending: true }).limit(1).maybeSingle());
    if (!book.data) book = throwIf(await db().from("grimoire_books").insert({ user_id: userId, title: "Book of Shadows" }).select("id").single());
    const bookId = book.data.id;
    let section = throwIf(
      await db().from("grimoire_sections").select("id").eq("book_id", bookId).eq("title", "Ritual Templates").limit(1).maybeSingle()
    );
    if (!section.data) {
      section = throwIf(
        await db().from("grimoire_sections").insert({ user_id: userId, book_id: bookId, title: "Ritual Templates", sort_order: 0 }).select("id").single()
      );
    }
    const page = throwIf(
      await db()
        .from("grimoire_pages")
        .insert({ user_id: userId, book_id: bookId, section_id: section.data.id, title: template.title, icon: "🌙", page_type: "ritual_template", metadata })
        .select("id")
        .single()
    );
    return page.data.id;
  }

  /**
   * Save a spell or premade working as one of your templates, as the app's
   * saveTemplate does. Needs an account. Adds a new template, unless
   * `replace` is set and the draft has an id: then that template of yours is
   * updated in place (the spell builder's "Save changes"), its steps replaced
   * as a whole as the app does, and its other metadata kept.
   */
  async function saveTemplate(draft, { replace = false } = {}) {
    const account = user();
    if (!account || !db()) throw new Error("Sign in to keep ritual templates.");
    const R = core();
    const updating = replace && !!draft.id;
    const id = updating ? draft.id : R.lifecycle.uuid();
    const { template, steps } = R.rows.templatePayload(updating ? draft : { ...draft, id: null }, {
      userId: account.id,
      id,
      stepIds: draft.steps.map(() => R.lifecycle.uuid())
    });
    let row;
    if (updating) {
      const before = throwIf(await db().from("ritual_templates").select("metadata,grimoire_page_id").eq("id", id).eq("user_id", account.id).single()).data || {};
      template.metadata = { ...(before.metadata || {}), ...template.metadata, app: "web" };
      template.grimoire_page_id = template.grimoire_page_id || before.grimoire_page_id || null;
      row = throwIf(await db().from("ritual_templates").update(template).eq("id", id).eq("user_id", account.id).select("*").single()).data;
      throwIf(await db().from("ritual_template_steps").delete().eq("template_id", id).eq("user_id", account.id));
    } else {
      template.metadata = { ...template.metadata, app: "web" };
      row = throwIf(await db().from("ritual_templates").insert(template).select("*").single()).data;
    }

    const pageId = await ensureTemplatePage(account.id, row);
    if (pageId !== row.grimoire_page_id) {
      throwIf(await db().from("ritual_templates").update({ grimoire_page_id: pageId }).eq("id", row.id).eq("user_id", account.id));
      row.grimoire_page_id = pageId;
    }
    if (steps.length) throwIf(await db().from("ritual_template_steps").insert(steps));

    const links = R.rows.templateLinks(row.id, account.id, draft.ingredients || []);
    if (links.length) {
      const known = updating ? throwIf(await db().from("ritual_links").select("*").eq("template_id", row.id).eq("user_id", account.id)).data || [] : [];
      const fresh = R.rows.uniqueLinks(links, known);
      if (fresh.length) await db().from("ritual_links").insert(fresh);
    }
    await db()
      .from("living_library_entries")
      .upsert(R.rows.templateLibraryEntry(row, account.id, new Date()), { onConflict: "user_id,entity_id" });
    return { ...row, ritual_template_steps: steps };
  }

  // ---------------------------------------------------------------- hand-offs

  /** Hand the altar's Ritual Companion something to begin, and go there. */
  function begin(handoff) {
    writeJson(K.begin, handoff, global.sessionStorage);
    global.location.href = L.BEGIN_URL;
  }

  /** A spell from the builder, waiting for the planner (handoff.ts). */
  const handOffDraft = (draft) => writeJson(K.spellDraft, draft, global.sessionStorage);
  const peekDraft = () => readJson(K.spellDraft, null, global.sessionStorage);
  const clearDraft = () => writeJson(K.spellDraft, null, global.sessionStorage);

  global.RitualsStore = {
    user,
    loadPlans,
    savePlan,
    removePlan,
    templates,
    journal,
    saveJournalMetadata,
    apothecaryItems,
    saveApothecaryMetadata,
    activeSession,
    altars,
    pantry,
    settings,
    saveTemplate,
    begin,
    handOffDraft,
    peekDraft,
    clearDraft
  };
})(window);
