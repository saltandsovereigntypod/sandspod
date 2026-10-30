/*
 * Birth charts on the website: the encrypted chart vault kept in this
 * browser (localStorage), its key remembered here, and, when the person
 * chooses a passphrase, sync of the ciphertext with the account's
 * `astro_vault` row. The app's twin is app/src/lib/astro/store.ts: the same
 * shapes and the same encryption (js/core/astro.js is built from the app's
 * app/src/lib/astro/vault.ts), so a vault sealed on the phone opens here.
 *
 * Charts saved before this, in the plain "cosmic.chart" craft entry, are
 * moved in the first time the vault opens and the old entry is blanked and
 * deleted, as the app does.
 *
 * Keys are astroVault.<what>.<user id or "device">.
 * Needs: js/supabase-config.js (window.db), js/auth.js, js/salt-store.js
 * (window.SaltCraft), js/core/astro.js (window.SaltCore.astro).
 */
(function (global) {
  "use strict";

  const DEVICE = "device";
  const MISSING = new Set(["42P01", "PGRST205", "PGRST202", "42883"]);
  const V = () => global.SaltCore.astro.vault;
  const k = (what, scope) => `astroVault.${what}.${scope}`;
  const missing = (error) => !!error && MISSING.has(error.code);
  const db = () => global.db || null;

  let state = { phase: "loading", data: null, synced: false, sync: "device", userId: null, error: null };
  let vault = null;
  let key = null;
  let revision = null;
  let scope = null;
  let pending = null;
  let chain = Promise.resolve();
  let pushTimer = null;
  const listeners = new Set();

  function set(patch) {
    state = { ...state, ...patch };
    listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (error) {
        console.warn(error);
      }
    });
  }
  function serial(work) {
    const next = chain.then(work, work);
    chain = next.catch(() => null);
    return next;
  }
  const read = (name) => {
    try {
      return global.localStorage.getItem(name);
    } catch {
      return null;
    }
  };
  const write = (name, value) => {
    try {
      if (value == null) global.localStorage.removeItem(name);
      else global.localStorage.setItem(name, value);
    } catch {
      /* storage blocked: open for this visit only */
    }
  };
  const writeVault = (next) => {
    vault = next;
    if (scope) write(k("vault", scope), next ? JSON.stringify(next) : null);
  };
  const rememberKey = (value) => {
    key = value;
    if (scope) write(k("key", scope), value ? V().keyToText(value) : null);
  };
  const strip = (v) => {
    const { revision: _r, ...rest } = v; // eslint-disable-line no-unused-vars
    return rest;
  };

  async function fetchRemote() {
    if (!state.userId || !db()) return { row: null, sync: "signed-out" };
    const { data, error } = await db().from("astro_vault").select("kdf,pass_key,recovery_key,ciphertext,revision,updated_at").eq("user_id", state.userId).maybeSingle();
    if (error) return { row: null, sync: missing(error) ? "unavailable" : "offline" };
    return { row: V().astroVaultFromRow(data), sync: "synced" };
  }

  async function load(userId) {
    scope = userId || DEVICE;
    key = null;
    revision = null;
    pending = null;
    let saved = null;
    try {
      saved = V().normalizeAstroVault(JSON.parse(read(k("vault", scope)) || "null"));
    } catch {
      saved = null;
    }
    vault = saved;
    key = V().keyFromText(read(k("key", scope)));
    let data = null;
    if (vault && key) {
      try {
        data = V().decryptAstro(key, vault.data);
      } catch {
        key = null;
      }
    }
    set({
      userId: userId || null,
      synced: !!vault?.kdf,
      sync: vault?.kdf ? "offline" : userId ? "device" : "signed-out",
      phase: vault ? (data ? "open" : "locked") : "empty",
      data: data || V().emptyAstroData(),
      error: null
    });
    await pull();
    await importLegacy();
  }

  async function pull() {
    if (!state.userId) return;
    const { row, sync } = await fetchRemote();
    if (sync !== "synced") {
      set({ sync: state.synced ? sync : sync === "unavailable" ? "unavailable" : "device" });
      return;
    }
    if (!row) {
      revision = null;
      if (vault?.kdf && key) await push();
      else set({ sync: "device" });
      return;
    }
    revision = row.revision;
    if (key) {
      try {
        const theirs = V().decryptAstro(key, row.data);
        const merged = V().mergeAstroData(theirs, state.data);
        writeVault(V().withAstroData(strip(row), key, merged, new Date()));
        set({ data: merged, phase: "open", synced: true, sync: "synced" });
        if (JSON.stringify(merged) !== JSON.stringify(theirs)) await push();
        return;
      } catch {
        /* this browser's key doesn't open the account's copy */
      }
    }
    pending = state.phase === "open" ? state.data : null;
    writeVault(strip(row));
    set({ synced: true, phase: "locked", sync: "synced" });
  }

  async function push() {
    if (!state.userId || !vault?.kdf || !key || !db()) return;
    set({ sync: "saving" });
    for (let attempt = 0; attempt < 3; attempt++) {
      const row = V().astroVaultToRow(vault, state.userId);
      const result =
        revision == null
          ? await db().from("astro_vault").insert(row).select("revision").maybeSingle()
          : await db().from("astro_vault").update(row).eq("user_id", state.userId).eq("revision", revision).select("revision").maybeSingle();
      if (!result.error && result.data) {
        revision = Number(result.data.revision);
        set({ sync: "synced" });
        return;
      }
      if (result.error && missing(result.error)) return set({ sync: "unavailable" });
      if (result.error && result.error.code !== "23505") return set({ sync: "offline" });
      const { row: theirs, sync } = await fetchRemote();
      if (sync !== "synced") return set({ sync });
      revision = theirs?.revision ?? null;
      if (theirs) {
        try {
          const merged = V().mergeAstroData(V().decryptAstro(key, theirs.data), state.data);
          writeVault(V().withAstroData({ ...vault, kdf: theirs.kdf, passKey: theirs.passKey, recoveryKey: theirs.recoveryKey }, key, merged, new Date()));
          set({ data: merged });
        } catch {
          return set({ sync: "offline", error: "Your account’s charts were changed with another passphrase. Open them again with that passphrase." });
        }
      }
    }
    set({ sync: "offline" });
  }

  function schedulePush() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => serial(push), 800);
  }

  function commit(data) {
    if (!key || !vault) {
      if (!key) rememberKey(V().newAstroKey());
      writeVault(V().deviceAstroVault(key, data, new Date()));
    } else {
      writeVault(V().withAstroData(vault, key, data, new Date()));
    }
    set({ data, phase: "open" });
    if (state.synced) schedulePush();
  }

  async function importLegacy() {
    if (state.phase === "locked" || !global.SaltCraft) return;
    try {
      const entries = await global.SaltCraft.list("cosmic.chart");
      if (!entries.length) return;
      const old = entries[0];
      if (!state.data.charts.some((c) => c.relation === "me") && old.data && typeof old.data.date === "string") {
        const chart = { id: old.id, name: "Me", relation: "me", input: { ...old.data }, updatedAt: new Date().toISOString() };
        commit(V().mergeAstroData(state.data, { version: 1, charts: [chart], removed: [] }));
      }
      // Only once the chart is kept with the account (encrypted) is the old
      // copy removed; kept on one device only, deleting it would lose it elsewhere.
      if (!state.synced) return;
      for (const e of entries) {
        await global.SaltCraft.update("cosmic.chart", e.id, {});
        await global.SaltCraft.remove("cosmic.chart", e.id);
      }
    } catch (error) {
      console.warn("[astro] moving the old chart", error);
    }
  }

  function uuid() {
    if (global.crypto?.randomUUID) return global.crypto.randomUUID();
    const b = global.crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 15) | 64;
    b[8] = (b[8] & 63) | 128;
    const x = [...b].map((n) => n.toString(16).padStart(2, "0")).join("");
    return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
  }

  const api = {
    get state() {
      return state;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /** Load for the signed-in person (or this browser). */
    load(userId) {
      return serial(() => load(userId));
    },
    refresh() {
      return serial(async () => {
        await pull();
        await importLegacy();
      });
    },
    myChart() {
      return state.data?.charts.find((c) => c.relation === "me") || null;
    },
    save(chart) {
      return serial(async () => {
        if (state.phase === "locked") throw new Error("Open your charts with your passphrase first.");
        const id = chart.id || uuid();
        const now = new Date().toISOString();
        const charts = state.data.charts.map((c) => (chart.relation === "me" && c.relation === "me" && c.id !== id ? { ...c, relation: "other", updatedAt: now } : c)).filter((c) => c.id !== id);
        commit(V().mergeAstroData({ ...state.data, charts }, { version: 1, charts: [{ ...chart, id, updatedAt: now }], removed: [] }));
        return id;
      });
    },
    remove(id) {
      return serial(async () => {
        commit({ ...state.data, charts: state.data.charts.filter((c) => c.id !== id), removed: [...state.data.removed, { id, at: new Date().toISOString() }] });
      });
    },
    protect(passphrase, onProgress) {
      return serial(async () => {
        const dataKey = key || V().newAstroKey();
        const { vault: next, recovery } = await V().protectAstroVault(dataKey, state.data, passphrase, new Date(), { onProgress });
        rememberKey(dataKey);
        writeVault(next);
        set({ synced: true, phase: "open" });
        const { row } = await fetchRemote();
        revision = row?.revision ?? null;
        await push();
        return recovery;
      });
    },
    async unlock(passphrase, onProgress) {
      if (!vault) return;
      const dataKey = await V().unlockAstro(vault, passphrase, onProgress);
      await serial(() => opened(dataKey));
    },
    async unlockRecovery(code) {
      if (!vault) return;
      const dataKey = V().unlockAstroRecovery(vault, code);
      await serial(() => opened(dataKey));
    },
    keepOnDevice() {
      return serial(async () => {
        if (!key) return;
        if (state.userId && db()) {
          const { error } = await db().from("astro_vault").delete().eq("user_id", state.userId);
          if (error && !missing(error)) throw new Error("Your account’s copy couldn’t be deleted just now. Try again when you’re online.");
        }
        revision = null;
        writeVault(V().deviceAstroVault(key, state.data, new Date()));
        set({ synced: false, sync: state.userId ? "device" : "signed-out" });
      });
    },
    deleteAll() {
      return serial(async () => {
        if (state.userId && db()) {
          const { error } = await db().from("astro_vault").delete().eq("user_id", state.userId);
          if (error && !missing(error)) throw new Error("Your account’s copy couldn’t be deleted just now, so nothing was deleted. Try again when you’re online.");
        }
        for (const s of [scope, DEVICE]) {
          write(k("vault", s), null);
          write(k("key", s), null);
        }
        key = null;
        vault = null;
        revision = null;
        set({ phase: "empty", data: V().emptyAstroData(), synced: false, sync: state.userId ? "device" : "signed-out", error: null });
      });
    }
  };

  async function opened(dataKey) {
    let data = V().decryptAstro(dataKey, vault.data);
    if (pending) data = V().mergeAstroData(data, pending);
    pending = null;
    rememberKey(dataKey);
    writeVault(V().withAstroData(vault, dataKey, data, new Date()));
    set({ data, phase: "open", error: null });
    if (state.synced) await push();
    await importLegacy();
  }

  global.SaltAstroStore = api;
})(typeof window !== "undefined" ? window : globalThis);
