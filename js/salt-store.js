/*
 * Shared data helpers for the Sanctuary pages that mirror the app.
 *
 * SaltCraft: the practice tools' entries (garden, dreams, readings, stones,
 * journey progress…), one row per entry in `craft_entries`, exactly as the app
 * keeps them: { id, user_id, collection, data, deleted_at, created_at,
 * updated_at }. Deletes are soft; the newest updated_at wins. Guests keep
 * them in this browser (localStorage "salt.craft.<collection>").
 *
 * SaltSettings: read settings, or change some keys without touching the rest
 * (the app keeps its own keys in the same row).
 *
 * Needs: js/supabase-config.js (window.db), js/auth.js (getCurrentSaltUser),
 * js/my-settings.js (getMySettings, saveMySettings).
 */
(function (global) {
  const LOCAL = (collection) => `salt.craft.${collection}`;
  const user = () => (typeof global.getCurrentSaltUser === "function" ? global.getCurrentSaltUser() : null);
  const iso = (at) => (at ? new Date(at).toISOString() : null);
  const uuid = () =>
    global.crypto?.randomUUID
      ? global.crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });

  function readLocal(collection) {
    try {
      const list = JSON.parse(global.localStorage.getItem(LOCAL(collection)) || "[]");
      return Array.isArray(list) ? list.filter((e) => e && typeof e.id === "string") : [];
    } catch {
      return [];
    }
  }
  function writeLocal(collection, list) {
    try {
      global.localStorage.setItem(LOCAL(collection), JSON.stringify(list));
      global.SaltAccountData?.markGuestDataChanged?.(global.localStorage);
    } catch {
      /* storage full or blocked: the page still shows what it has */
    }
  }
  const fromRow = (row) => ({
    id: row.id,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    deletedAt: iso(row.deleted_at),
    data: row.data
  });
  const toRow = (account, collection, entry) => ({
    id: entry.id,
    user_id: account.id,
    collection,
    data: entry.data ?? {},
    deleted_at: entry.deletedAt ?? null,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt
  });
  const live = (list) => list.filter((e) => !e.deletedAt).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  async function all(collection) {
    const account = user();
    if (!account || !global.db) return readLocal(collection);
    const { data, error } = await global.db.from("craft_entries").select("*").eq("user_id", account.id).eq("collection", collection);
    if (error) throw error;
    return (data || []).map(fromRow);
  }

  async function save(collection, entry) {
    const account = user();
    if (!account || !global.db) {
      const list = readLocal(collection).filter((e) => e.id !== entry.id);
      writeLocal(collection, [entry, ...list]);
      return entry;
    }
    const { error } = await global.db.from("craft_entries").upsert(toRow(account, collection, entry), { onConflict: "id" });
    if (error) throw error;
    return entry;
  }

  const SaltCraft = {
    /** The live entries of a collection, newest first: [{ id, createdAt, updatedAt, data }]. */
    async list(collection) {
      return live(await all(collection));
    },
    async add(collection, data) {
      const now = new Date().toISOString();
      return save(collection, { id: uuid(), createdAt: now, updatedAt: now, deletedAt: null, data });
    },
    async update(collection, id, data) {
      const entry = (await all(collection)).find((e) => e.id === id);
      if (!entry) return null;
      return save(collection, { ...entry, data, updatedAt: new Date().toISOString() });
    },
    async remove(collection, id) {
      const entry = (await all(collection)).find((e) => e.id === id);
      if (!entry) return null;
      const now = new Date().toISOString();
      return save(collection, { ...entry, deletedAt: now, updatedAt: now });
    },
    uuid
  };

  const SaltSettings = {
    async get() {
      return typeof global.getMySettings === "function" ? global.getMySettings() : {};
    },
    /** Change some keys, keeping every other setting (the website's and the app's). */
    async patch(changes) {
      const stored = await SaltSettings.get();
      const rowOnly = new Set(["id", "user_id", "created_at", "updated_at", "settings"]);
      const next = {};
      Object.entries(stored || {}).forEach(([key, value]) => {
        if (!rowOnly.has(key)) next[key] = value;
      });
      Object.assign(next, changes);
      await global.saveMySettings(next);
      global.dispatchEvent(new CustomEvent("saltSettingsChanged"));
      return next;
    }
  };

  /** Page helpers: wait for sign-in to resolve, and hear when it changes. */
  let resolved = false;
  const waiting = [];
  global.document.addEventListener("saltAuthReady", () => {
    resolved = true;
    waiting.splice(0).forEach((fn) => fn(user()));
  });
  const SaltPage = {
    /** Resolves with the signed-in user (or null for a guest) once the site knows. */
    ready() {
      if (resolved || global.getSaltCommunityModeratorState?.().resolved) return Promise.resolve(user());
      return new Promise((resolve) => waiting.push(resolve));
    },
    /** Run `fn(user)` whenever someone signs in or out. */
    onUserChange(fn) {
      global.document.addEventListener("saltAuthChanged", (event) => fn(event.detail?.user ?? null));
    },
    /** Escape text for HTML. */
    esc(text) {
      return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    }
  };

  global.SaltPage = SaltPage;
  global.SaltCraft = SaltCraft;
  global.SaltSettings = SaltSettings;
})(window);
