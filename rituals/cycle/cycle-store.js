/*
 * Cycle & Moon on the website: the encrypted vault kept in this browser
 * (localStorage), the data key (remembered on this device only if chosen;
 * otherwise kept for this tab), sync with the account's `cycle_moon_vault`
 * row (ciphertext only), the coven status (`cycle_moon_status`) and deleting
 * everything. The app's twin is app/src/lib/cycle/store.ts: the same shapes,
 * the same encryption (js/core/cycle.js is built from the app's code), so a
 * vault made on the phone opens here.
 *
 * Keys are named cycleMoon.<what>.<user id or "device">, never "salt.*", so
 * guest backups and the guest-to-account move leave them alone.
 *
 * Needs: js/supabase-config.js (window.db), js/auth.js, js/salt-store.js,
 * js/core/cycle.js (window.SaltCore.cycle).
 */
(function (global) {
  "use strict";

  const DEVICE = "device";
  const MISSING = new Set(["42P01", "PGRST205", "PGRST202", "42883"]);
  const C = () => global.SaltCore.cycle;
  const k = (what, scope) => `cycleMoon.${what}.${scope}`;
  const missing = (error) => !!error && MISSING.has(error.code);
  const user = () => (typeof global.getCurrentSaltUser === "function" ? global.getCurrentSaltUser() : null);
  const db = () => global.db || null;

  let state = { phase: "loading", data: null, vault: null, synced: false, sync: "device", remember: false, guestCopy: false, userId: null, error: null };
  let key = null;
  let revision = null;
  let scope = null;
  let pendingLocal = null;
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
  const store = (kind) => {
    try {
      return kind === "session" ? global.sessionStorage : global.localStorage;
    } catch {
      return null;
    }
  };
  const read = (name, kind = "local") => {
    try {
      return store(kind)?.getItem(name) ?? null;
    } catch {
      return null;
    }
  };
  const write = (name, value, kind = "local") => {
    try {
      if (value == null) store(kind)?.removeItem(name);
      else store(kind)?.setItem(name, value);
    } catch {
      /* storage full or blocked: still open for this visit */
    }
  };

  function readLocal(s) {
    let vault = null;
    try {
      vault = C().vault.normalizeVault(JSON.parse(read(k("vault", s)) || "null"));
    } catch {
      vault = null;
    }
    const remembered = read(k("key", s));
    return { vault, key: C().vault.keyFromText(remembered || read(k("key", s), "session")), remember: !!remembered };
  }
  const writeVault = (vault) => scope && write(k("vault", scope), vault ? JSON.stringify(vault) : null);
  function rememberKey(value) {
    key = value;
    if (!scope) return;
    const text = value ? C().vault.keyToText(value) : null;
    write(k("key", scope), state.remember ? text : null);
    write(k("key", scope), text, "session");
  }

  async function fetchRemote() {
    if (!state.userId || !db()) return { row: null, sync: "signed-out" };
    const { data, error } = await db().from("cycle_moon_vault").select("kdf,pass_key,recovery_key,ciphertext,revision,updated_at").eq("user_id", state.userId).maybeSingle();
    if (error) return { row: null, sync: missing(error) ? "unavailable" : "offline" };
    return { row: C().vault.vaultFromRow(data), sync: "synced" };
  }
  const strip = (v) => {
    const { revision: _r, ...rest } = v; // eslint-disable-line no-unused-vars
    return rest;
  };

  async function load(userId) {
    scope = userId || DEVICE;
    key = null;
    revision = null;
    pendingLocal = null;
    const local = readLocal(scope);
    const guest = userId ? readLocal(DEVICE) : null;
    key = local.key;
    let data = null;
    if (local.vault && key) {
      try {
        data = C().vault.decryptData(key, local.vault.data);
      } catch {
        key = null;
      }
    }
    set({
      userId: userId || null,
      remember: local.remember,
      vault: local.vault,
      synced: !!local.vault?.kdf,
      guestCopy: !!guest?.vault && !!guest.key,
      error: null,
      sync: local.vault?.kdf ? "offline" : userId ? "device" : "signed-out",
      phase: local.vault ? (data ? "open" : "locked") : "new",
      data,
    });
    await pull();
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
      if (state.vault?.kdf && key) await push();
      else set({ sync: "device" });
      return;
    }
    revision = row.revision;
    if (key) {
      try {
        const theirs = C().vault.decryptData(key, row.data);
        const merged = state.data ? C().model.mergeData(theirs, state.data) : theirs;
        const vault = C().vault.withData(strip(row), key, merged, new Date());
        writeVault(vault);
        set({ vault, data: merged, phase: "open", synced: true, sync: "synced" });
        if (state.data && JSON.stringify(merged) !== JSON.stringify(theirs)) await push();
        return;
      } catch {
        /* made apart from this browser's copy: ask for the passphrase */
      }
    }
    pendingLocal = state.data;
    set({ vault: strip(row), synced: true, phase: "locked", sync: "synced" });
  }

  async function push() {
    if (!state.userId || !state.vault?.kdf || !key || !state.data || !db()) return;
    set({ sync: "saving" });
    for (let attempt = 0; attempt < 3; attempt++) {
      const row = C().vault.vaultToRow(state.vault, state.userId);
      const result =
        revision == null
          ? await db().from("cycle_moon_vault").insert(row).select("revision").maybeSingle()
          : await db().from("cycle_moon_vault").update(row).eq("user_id", state.userId).eq("revision", revision).select("revision").maybeSingle();
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
          const merged = C().model.mergeData(C().vault.decryptData(key, theirs.data), state.data);
          const vault = C().vault.withData({ ...state.vault, kdf: theirs.kdf, passKey: theirs.passKey, recoveryKey: theirs.recoveryKey }, key, merged, new Date());
          writeVault(vault);
          set({ vault, data: merged });
        } catch {
          return set({ sync: "offline", error: "Your account’s copy was changed with another passphrase. Open it again with that passphrase." });
        }
      }
    }
    set({ sync: "offline" });
  }
  function schedulePush() {
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => serial(push), 800);
  }

  async function opened(dataKey, remember) {
    let data = C().vault.decryptData(dataKey, state.vault.data);
    if (pendingLocal) data = C().model.mergeData(data, pendingLocal);
    pendingLocal = null;
    set({ remember: !!remember });
    rememberKey(dataKey);
    const vault = C().vault.withData(state.vault, dataKey, data, new Date());
    writeVault(vault);
    set({ vault, data, phase: "open", error: null });
    if (state.synced) await push();
  }

  const api = {
    get state() {
      return state;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /** Load for this person (or the browser's guest). */
    load(userId) {
      return serial(() => load(userId));
    },
    refresh() {
      return serial(pull);
    },
    startOnDevice() {
      return serial(async () => {
        const dataKey = C().vault.newDataKey();
        const data = C().model.emptyData();
        const vault = C().vault.deviceVault(dataKey, data, new Date());
        writeVault(vault);
        // Kept on this device only: the key has to stay here too, or the notes could never be opened again.
        set({ remember: true });
        rememberKey(dataKey);
        set({ vault, data, phase: "open", synced: false, sync: state.userId ? "device" : "signed-out" });
      });
    },
    protect(passphrase, remember, onProgress) {
      return serial(async () => {
        const dataKey = key || C().vault.newDataKey();
        const data = state.data || C().model.emptyData();
        const { vault, recovery } = await C().vault.protectVault(dataKey, data, passphrase, new Date(), { onProgress });
        writeVault(vault);
        set({ remember: !!remember });
        rememberKey(dataKey);
        set({ vault, data, phase: "open", synced: true });
        const { row } = await fetchRemote();
        revision = row?.revision ?? null;
        await push();
        return recovery;
      });
    },
    async unlock(passphrase, remember, onProgress) {
      const dataKey = await C().vault.unlockWithPassphrase(state.vault, passphrase, onProgress);
      return serial(() => opened(dataKey, remember));
    },
    async unlockRecovery(code, remember) {
      const dataKey = C().vault.unlockWithRecovery(state.vault, code);
      return serial(() => opened(dataKey, remember));
    },
    update(change) {
      if (state.phase !== "open" || !state.data || !key) return;
      const data = change(state.data);
      const vault = C().vault.withData(state.vault, key, data, new Date());
      writeVault(vault);
      set({ data, vault });
      if (state.synced) schedulePush();
    },
    changePassphrase(passphrase, newRecovery, onProgress) {
      return serial(async () => {
        const { vault, recovery } = await C().vault.changePassphrase(state.vault, key, passphrase, new Date(), { newRecovery, onProgress });
        writeVault(vault);
        set({ vault, synced: true });
        await push();
        return recovery;
      });
    },
    keepOnDeviceOnly() {
      return serial(async () => {
        if (!key || !state.data) return;
        if (state.userId && db()) {
          const { error } = await db().from("cycle_moon_vault").delete().eq("user_id", state.userId);
          if (error && !missing(error)) throw new Error("Your account’s copy couldn’t be deleted just now. Try again when you’re online.");
        }
        revision = null;
        const vault = C().vault.deviceVault(key, state.data, new Date());
        writeVault(vault);
        set({ vault, synced: false, remember: true, sync: state.userId ? "device" : "signed-out" });
        rememberKey(key);
      });
    },
    setRemember(remember) {
      set({ remember: !!remember });
      rememberKey(key);
    },
    lockNow() {
      if (!state.synced) return;
      key = null;
      if (scope) {
        write(k("key", scope), null);
        write(k("key", scope), null, "session");
      }
      set({ phase: "locked", data: null });
    },
    bringInGuest() {
      return serial(async () => {
        const guest = readLocal(DEVICE);
        if (!guest.vault || !guest.key || !key || !state.data) return 0;
        const theirs = C().vault.decryptData(guest.key, guest.vault.data);
        const data = C().model.mergeData(state.data, theirs);
        const vault = C().vault.withData(state.vault, key, data, new Date());
        writeVault(vault);
        ["vault", "key"].forEach((what) => {
          write(k(what, DEVICE), null);
          write(k(what, DEVICE), null, "session");
        });
        set({ data, vault, guestCopy: false });
        if (state.synced) await push();
        return theirs.bleeds.length + theirs.notes.length;
      });
    },
    deleteAll() {
      return serial(async () => {
        if (state.userId && db()) {
          const [v, s] = await Promise.all([db().from("cycle_moon_vault").delete().eq("user_id", state.userId), db().from("cycle_moon_status").delete().eq("user_id", state.userId)]);
          const failed = [v.error, s.error].find((e) => e && !missing(e));
          if (failed) throw new Error("Your account’s copy couldn’t be deleted just now, so nothing was deleted. Try again when you’re online.");
        }
        for (const kind of ["local", "session"]) {
          const s = store(kind);
          if (!s) continue;
          const names = [];
          for (let i = 0; i < s.length; i++) {
            const name = s.key(i);
            if (name && name.startsWith("cycleMoon.") && (name.endsWith(`.${scope}`) || name.endsWith(`.${DEVICE}`))) names.push(name);
          }
          names.forEach((name) => write(name, null, kind));
        }
        key = null;
        revision = null;
        pendingLocal = null;
        set({ phase: "new", data: null, vault: null, synced: false, guestCopy: false, remember: false, sync: state.userId ? "device" : "signed-out", error: null });
      });
    },

    // ── The coven status ──
    async loadStatus() {
      if (!state.userId || !db()) return null;
      const { data, error } = await db().from("cycle_moon_status").select("status,shared_covens,shared_people,expires_at").eq("user_id", state.userId).maybeSingle();
      if (error) {
        if (missing(error)) return "unavailable";
        throw new Error("Couldn’t check what you share just now.");
      }
      if (!data || !C().status.isMoonStatus(data.status) || Date.parse(data.expires_at) <= Date.now()) return null;
      return { status: data.status, covens: data.shared_covens || [], people: data.shared_people || [], expiresAt: data.expires_at };
    },
    async shareStatus(status, covens, people, days) {
      if (!state.userId || !db()) throw new Error("Sign in to share with your covens.");
      const { error } = await db().from("cycle_moon_status").upsert(C().status.statusRow(state.userId, status, covens, people, days, new Date()), { onConflict: "user_id" });
      if (error) throw new Error(missing(error) ? "Sharing isn’t ready on the server yet." : "Couldn’t share it just now. Try again in a moment.");
    },
    async stopSharing() {
      if (!state.userId || !db()) return;
      const { error } = await db().from("cycle_moon_status").delete().eq("user_id", state.userId);
      if (error && !missing(error)) throw new Error("Couldn’t stop sharing just now. Try again in a moment.");
    },
    async shareChoices() {
      if (!state.userId || !db()) return { covens: [], people: [] };
      const mine = await db().from("coven_members").select("coven_id,covens!coven_members_coven_id_fkey(name)").eq("user_id", state.userId).eq("status", "active");
      if (mine.error) throw new Error("Couldn’t load your covens just now.");
      const covens = (mine.data || []).map((r) => ({ id: r.coven_id, name: r.covens?.name || "A coven" }));
      if (!covens.length) return { covens, people: [] };
      const members = await db().from("coven_members").select("coven_id,user_id").in("coven_id", covens.map((c) => c.id)).eq("status", "active");
      const rows = (members.data || []).filter((r) => r.user_id !== state.userId);
      const ids = [...new Set(rows.map((r) => r.user_id))];
      const profiles = ids.length ? await db().from("coven_profiles").select("user_id,display_name").in("user_id", ids) : { data: [] };
      const names = new Map((profiles.data || []).map((p) => [p.user_id, p.display_name || "A witch"]));
      const people = ids.map((id) => ({ id, name: names.get(id) || "A witch", covens: rows.filter((r) => r.user_id === id).map((r) => r.coven_id) })).sort((a, b) => a.name.localeCompare(b.name));
      return { covens, people };
    },
    user,
  };

  global.CycleMoonStore = api;
})(window);
