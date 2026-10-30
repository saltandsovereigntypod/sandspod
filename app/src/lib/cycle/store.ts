// Cycle & Moon on the phone: the encrypted vault kept on the device
// (AsyncStorage), the data key remembered on this device, sync of the vault
// with the account (`cycle_moon_vault`, ciphertext only), the coven status
// (`cycle_moon_status`), reminders, and deleting everything. The website's
// twin is rituals/cycle/cycle-store.js; both write the same shapes.
//
// Where the key is kept: expo-secure-store isn't in this app, and adding it
// would need a new native build, so the data key is remembered in the app's
// own storage (AsyncStorage), which other apps can't read but which isn't the
// phone's keychain. Anyone who can open this phone's apps can open Cycle &
// Moon unless they choose "Ask for my passphrase each time", which keeps the
// key in memory only. Said plainly in Settings and Help.
//
// Before the database migration (20261117000000_cycle_moon.sql) is applied,
// the vault simply stays on the device and sync says it isn't ready yet.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { newId } from '../grimoire/ids';
import { setCycleReminders } from '../reminders/store';
import { supabase } from '../supabase';
import { emptyData, mergeData } from './model';
import { cycleReminders } from './reminders';
import { isMoonStatus, statusRow, type MoonStatus } from './status';
import type { CycleData } from './types';
import {
  changePassphrase as rewrap,
  decryptData,
  deviceVault,
  keyFromText,
  keyToText,
  newDataKey,
  normalizeVault,
  protectVault,
  unlockWithPassphrase,
  unlockWithRecovery,
  VaultError,
  vaultFromRow,
  vaultToRow,
  withData,
  type Vault,
} from './vault';

export type SyncState = 'device' | 'synced' | 'saving' | 'offline' | 'unavailable' | 'signed-out';

export type CycleState = {
  /** 'new': nothing kept yet; 'locked': kept, but the key isn't on this device; 'open': ready. */
  phase: 'loading' | 'new' | 'locked' | 'open';
  data: CycleData | null;
  vault: Vault | null;
  /** Kept with the account (a passphrase is set), rather than on this device only. */
  synced: boolean;
  sync: SyncState;
  /** The key is kept only until the app closes. */
  askEachTime: boolean;
  /** Notes kept on this phone as a guest, before signing in, that could come into the account. */
  guestCopy: boolean;
  userId: string | null;
  error: string | null;
};

export type SharedStatus = { status: MoonStatus; covens: string[]; people: string[]; expiresAt: string } | null;

const k = (what: string, scope: string) => `cycleMoon.${what}.${scope}`;
const DEVICE = 'device';
const MISSING = new Set(['42P01', 'PGRST205', 'PGRST202', '42883']);

let state: CycleState = { phase: 'loading', data: null, vault: null, synced: false, sync: 'device', askEachTime: false, guestCopy: false, userId: null, error: null };
let key: Uint8Array | null = null;
let revision: number | null = null;
let scope: string | null = null;
let wanted: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let chain: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();

function set(patch: Partial<CycleState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  if ('data' in patch || 'phase' in patch) syncReminders();
}

/** Hand the reminders the next notes to ring (none while locked or turned off). */
function syncReminders() {
  try {
    setCycleReminders(state.phase === 'open' && state.data ? cycleReminders(state.data, new Date()) : []);
  } catch {
    // Reminders are best effort.
  }
}

/** One thing at a time, so two quick saves can't cross. */
function serial<T>(work: () => Promise<T>): Promise<T> {
  const next = chain.then(work, work);
  chain = next.catch(() => null);
  return next;
}

async function readLocal(s: string): Promise<{ vault: Vault | null; key: Uint8Array | null; ask: boolean }> {
  try {
    const [[, v], [, kt], [, ask]] = await AsyncStorage.multiGet([k('vault', s), k('key', s), k('ask', s)]);
    return { vault: v ? normalizeVault(JSON.parse(v)) : null, key: keyFromText(kt), ask: ask === '1' };
  } catch {
    return { vault: null, key: null, ask: false };
  }
}

async function writeLocal(vault: Vault | null) {
  if (!scope) return;
  try {
    if (vault) await AsyncStorage.setItem(k('vault', scope), JSON.stringify(vault));
    else await AsyncStorage.removeItem(k('vault', scope));
  } catch {
    // Still open for this session.
  }
}

async function rememberKey(value: Uint8Array | null) {
  key = value;
  if (!scope) return;
  try {
    if (value && !state.askEachTime) await AsyncStorage.setItem(k('key', scope), keyToText(value));
    else await AsyncStorage.removeItem(k('key', scope));
  } catch {
    // Kept in memory for now.
  }
}

const missing = (error: { code?: string } | null | undefined) => !!error?.code && MISSING.has(error.code);

async function fetchRemote(): Promise<{ row: (Vault & { revision: number }) | null; sync: SyncState }> {
  if (!state.userId) return { row: null, sync: 'signed-out' };
  const { data, error } = await supabase.from('cycle_moon_vault').select('kdf,pass_key,recovery_key,ciphertext,revision,updated_at').eq('user_id', state.userId).maybeSingle();
  if (error) return { row: null, sync: missing(error) ? 'unavailable' : 'offline' };
  return { row: vaultFromRow(data as Record<string, unknown> | null), sync: 'synced' };
}

/** Load (or reload) this person's Cycle & Moon. */
async function load(userId: string | null) {
  scope = userId ?? DEVICE;
  key = null;
  revision = null;
  const local = await readLocal(scope);
  const guest = userId ? await readLocal(DEVICE) : null;
  key = local.key;
  set({
    userId,
    askEachTime: local.ask,
    vault: local.vault,
    synced: !!local.vault?.kdf,
    guestCopy: !!guest?.vault && !!guest.key,
    error: null,
    sync: local.vault?.kdf ? 'offline' : userId ? 'device' : 'signed-out',
  });
  let data: CycleData | null = null;
  if (local.vault && key) {
    try {
      data = decryptData(key, local.vault.data);
    } catch {
      key = null;
    }
  }
  set({ phase: local.vault ? (data ? 'open' : 'locked') : 'new', data });
  await pull();
}

/** Bring in the account's copy: merge it with this device's, or ask for the passphrase if this device can't open it. */
async function pull() {
  if (!state.userId) return;
  const { row, sync } = await fetchRemote();
  if (sync !== 'synced') {
    set({ sync: state.synced ? sync : sync === 'unavailable' ? 'unavailable' : 'device' });
    return;
  }
  if (!row) {
    revision = null;
    // A synced vault here but none in the account (deleted elsewhere, or never sent): send it.
    if (state.vault?.kdf && key) await push();
    else set({ sync: 'device' });
    return;
  }
  revision = row.revision;
  if (key) {
    try {
      const theirs = decryptData(key, row.data);
      const merged = state.data ? mergeData(theirs, state.data) : theirs;
      const vault = withData({ ...row }, key, merged, new Date());
      await writeLocal(stripRevision(vault));
      set({ vault: stripRevision(vault), data: merged, phase: 'open', synced: true, sync: 'synced' });
      if (state.data && JSON.stringify(merged) !== JSON.stringify(theirs)) await push();
      return;
    } catch {
      // This device's key doesn't open the account's vault (it was made apart): ask for the passphrase, keeping what's here to merge.
    }
  }
  pendingLocal = state.data;
  set({ vault: stripRevision(row), synced: true, phase: 'locked', sync: 'synced' });
}

let pendingLocal: CycleData | null = null;
const stripRevision = (v: Vault & { revision?: number }): Vault => {
  const { revision: _r, ...rest } = v;
  void _r;
  return rest;
};

/** Send the vault to the account, merging if another device saved first. */
async function push(): Promise<void> {
  if (!state.userId || !state.vault?.kdf || !key || !state.data) return;
  set({ sync: 'saving' });
  for (let attempt = 0; attempt < 3; attempt++) {
    const row = vaultToRow(state.vault, state.userId);
    const result =
      revision == null
        ? await supabase.from('cycle_moon_vault').insert(row).select('revision').maybeSingle()
        : await supabase.from('cycle_moon_vault').update(row).eq('user_id', state.userId).eq('revision', revision).select('revision').maybeSingle();
    if (!result.error && result.data) {
      revision = Number((result.data as { revision: number }).revision);
      set({ sync: 'synced' });
      return;
    }
    if (result.error && missing(result.error)) {
      set({ sync: 'unavailable' });
      return;
    }
    if (result.error && result.error.code !== '23505') {
      set({ sync: 'offline' });
      return;
    }
    // Someone else saved first: take theirs in and try again.
    const { row: theirs, sync } = await fetchRemote();
    if (sync !== 'synced') {
      set({ sync });
      return;
    }
    revision = theirs?.revision ?? null;
    if (theirs) {
      try {
        const merged = mergeData(decryptData(key, theirs.data), state.data);
        const vault = withData({ ...state.vault, kdf: theirs.kdf, passKey: theirs.passKey, recoveryKey: theirs.recoveryKey }, key, merged, new Date());
        await writeLocal(vault);
        set({ vault, data: merged });
      } catch {
        set({ sync: 'offline', error: 'Your account’s copy was changed with another passphrase. Open it again with that passphrase.' });
        return;
      }
    }
  }
  set({ sync: 'offline' });
}

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void serial(push), 800);
}

// ── What screens call ────────────────────────────────────────────────────

/** Follow the signed-in person (the tabs call this). */
export function setCycleUser(userId: string | null) {
  const next = userId ?? DEVICE;
  if (wanted === next) return;
  wanted = next;
  void serial(() => load(userId));
}

export function refreshCycle(): Promise<void> {
  return serial(pull);
}

/** Begin, kept on this device only. */
export async function startOnDevice(): Promise<void> {
  await serial(async () => {
    const dataKey = newDataKey();
    const data = emptyData();
    const vault = deviceVault(dataKey, data, new Date());
    await writeLocal(vault);
    await rememberKey(dataKey);
    set({ vault, data, phase: 'open', synced: false, sync: state.userId ? 'device' : 'signed-out' });
  });
}

/** Protect with a passphrase and keep with the account (from new, or from this device's notes). Returns the recovery key to show once. */
export async function protectWithPassphrase(passphrase: string, onProgress?: (done: number) => void): Promise<string> {
  return serial(async () => {
    const dataKey = key ?? newDataKey();
    const data = state.data ?? emptyData();
    const { vault, recovery } = await protectVault(dataKey, data, passphrase, new Date(), { onProgress });
    await writeLocal(vault);
    await rememberKey(dataKey);
    set({ vault, data, phase: 'open', synced: true });
    // Starting fresh while the account already has a vault would replace it: look first.
    const { row } = await fetchRemote();
    revision = row?.revision ?? null;
    await push();
    return recovery;
  });
}

async function opened(dataKey: Uint8Array) {
  const vault = state.vault!;
  let data = decryptData(dataKey, vault.data);
  if (pendingLocal) data = mergeData(data, pendingLocal);
  pendingLocal = null;
  await rememberKey(dataKey);
  const next = withData(vault, dataKey, data, new Date());
  await writeLocal(next);
  set({ vault: next, data, phase: 'open', error: null });
  if (state.synced) await push();
}

export async function unlock(passphrase: string, onProgress?: (done: number) => void): Promise<void> {
  if (!state.vault) return;
  const dataKey = await unlockWithPassphrase(state.vault, passphrase, onProgress);
  await serial(() => opened(dataKey));
}

export async function unlockRecovery(code: string): Promise<void> {
  if (!state.vault) return;
  const dataKey = unlockWithRecovery(state.vault, code);
  await serial(() => opened(dataKey));
}

/** Change the notes. */
export function updateCycle(change: (data: CycleData) => CycleData): void {
  if (state.phase !== 'open' || !state.data || !key || !state.vault) return;
  const data = change(state.data);
  const vault = withData(state.vault, key, data, new Date());
  set({ data, vault });
  void writeLocal(vault);
  if (state.synced) schedulePush();
}

export async function changePassphrase(passphrase: string, newRecovery: boolean, onProgress?: (done: number) => void): Promise<string | null> {
  return serial(async () => {
    if (!state.vault || !key) throw new VaultError('damaged', 'Open Cycle & Moon first.');
    const { vault, recovery } = await rewrap(state.vault, key, passphrase, new Date(), { newRecovery, onProgress });
    await writeLocal(vault);
    set({ vault, synced: true });
    await push();
    return recovery;
  });
}

/** Stop keeping it with the account: the account's copy is deleted, this device keeps its own. */
export async function keepOnDeviceOnly(): Promise<void> {
  await serial(async () => {
    if (!key || !state.data) return;
    if (state.userId) {
      const { error } = await supabase.from('cycle_moon_vault').delete().eq('user_id', state.userId);
      if (error && !missing(error)) throw new Error('Your account’s copy couldn’t be deleted just now. Try again when you’re online.');
    }
    revision = null;
    const vault = deviceVault(key, state.data, new Date());
    await writeLocal(vault);
    set({ vault, synced: false, sync: state.userId ? 'device' : 'signed-out' });
  });
}

/** Remember the key on this phone, or only until the app closes. */
export async function setAskEachTime(ask: boolean): Promise<void> {
  if (!scope) return;
  try {
    if (ask) await AsyncStorage.setItem(k('ask', scope), '1');
    else await AsyncStorage.removeItem(k('ask', scope));
  } catch {
    // Applies for now.
  }
  set({ askEachTime: ask });
  await rememberKey(key);
}

/** Close it now: the key is forgotten here until the passphrase is entered again. */
export async function lockNow(): Promise<void> {
  if (!state.synced) return;
  await rememberKey(null);
  try {
    if (scope) await AsyncStorage.removeItem(k('key', scope));
  } catch {
    // Forgotten in memory at least.
  }
  set({ phase: 'locked', data: null });
}

/** Notes kept here as a guest, brought into this account's Cycle & Moon. */
export async function bringInGuestNotes(): Promise<number> {
  return serial(async () => {
    const guest = await readLocal(DEVICE);
    if (!guest.vault || !guest.key || !key || !state.data || !state.vault) return 0;
    const theirs = decryptData(guest.key, guest.vault.data);
    const data = mergeData(state.data, theirs);
    const vault = withData(state.vault, key, data, new Date());
    await writeLocal(vault);
    await AsyncStorage.multiRemove([k('vault', DEVICE), k('key', DEVICE), k('ask', DEVICE)]).catch(() => {});
    set({ data, vault, guestCopy: false });
    if (state.synced) await push();
    return theirs.bleeds.length + theirs.notes.length;
  });
}

/** Delete everything: the account's vault and shared status, and every copy and key on this phone. */
export async function deleteAllCycleData(): Promise<void> {
  await serial(async () => {
    if (state.userId) {
      const [v, s] = await Promise.all([
        supabase.from('cycle_moon_vault').delete().eq('user_id', state.userId),
        supabase.from('cycle_moon_status').delete().eq('user_id', state.userId),
      ]);
      const failed = [v.error, s.error].find((e) => e && !missing(e));
      if (failed) throw new Error('Your account’s copy couldn’t be deleted just now, so nothing was deleted. Try again when you’re online.');
    }
    try {
      const keys = (await AsyncStorage.getAllKeys()).filter((x) => x.startsWith('cycleMoon.') && (x.endsWith(`.${scope}`) || x.endsWith(`.${DEVICE}`)));
      if (keys.length) await AsyncStorage.multiRemove(keys);
    } catch {
      // Nothing more can be done here.
    }
    key = null;
    revision = null;
    pendingLocal = null;
    set({ phase: 'new', data: null, vault: null, synced: false, guestCopy: false, askEachTime: false, sync: state.userId ? 'device' : 'signed-out', error: null });
  });
}

// ── The coven status ─────────────────────────────────────────────────────

// Each takes the signed-in person's id from the screen, which may know it before Cycle & Moon has loaded.

export async function loadSharedStatus(userId: string): Promise<SharedStatus | 'unavailable'> {
  const { data, error } = await supabase.from('cycle_moon_status').select('status,shared_covens,shared_people,expires_at').eq('user_id', userId).maybeSingle();
  if (error) {
    if (missing(error)) return 'unavailable';
    throw new Error('Couldn’t check what you share just now.');
  }
  const row = data as { status: string; shared_covens: string[]; shared_people: string[]; expires_at: string } | null;
  if (!row || !isMoonStatus(row.status) || Date.parse(row.expires_at) <= Date.now()) return null;
  return { status: row.status, covens: row.shared_covens ?? [], people: row.shared_people ?? [], expiresAt: row.expires_at };
}

export async function shareStatus(userId: string, status: MoonStatus, covens: string[], people: string[], days: number): Promise<void> {
  const { error } = await supabase.from('cycle_moon_status').upsert(statusRow(userId, status, covens, people, days, new Date()), { onConflict: 'user_id' });
  if (error) throw new Error(missing(error) ? 'Sharing isn’t ready on the server yet.' : 'Couldn’t share it just now. Try again in a moment.');
}

export async function stopSharingStatus(userId: string): Promise<void> {
  const { error } = await supabase.from('cycle_moon_status').delete().eq('user_id', userId);
  if (error && !missing(error)) throw new Error('Couldn’t stop sharing just now. Try again in a moment.');
}

/** The statuses shared with this coven (or with you) by its members, for the Members page. Empty when there are none or it isn't ready. */
export async function covenStatuses(covenId: string): Promise<Map<string, MoonStatus>> {
  const { data, error } = await supabase.rpc('cycle_moon_statuses', { p_coven: covenId });
  const out = new Map<string, MoonStatus>();
  if (error || !Array.isArray(data)) return out;
  for (const row of data as { user_id: string; status: string }[]) if (isMoonStatus(row.status)) out.set(row.user_id, row.status);
  return out;
}

/** Your covens, and the people in them, to choose whom to share with. */
export async function shareChoices(userId: string): Promise<{ covens: { id: string; name: string }[]; people: { id: string; name: string; covens: string[] }[] }> {
  const mine = await supabase.from('coven_members').select('coven_id,covens!coven_members_coven_id_fkey(name)').eq('user_id', userId).eq('status', 'active');
  if (mine.error) throw new Error('Couldn’t load your covens just now.');
  const covens = ((mine.data ?? []) as unknown as { coven_id: string; covens: { name: string } | null }[]).map((r) => ({ id: r.coven_id, name: r.covens?.name ?? 'A coven' }));
  if (!covens.length) return { covens, people: [] };
  const members = await supabase.from('coven_members').select('coven_id,user_id').in('coven_id', covens.map((c) => c.id)).eq('status', 'active');
  const rows = ((members.data ?? []) as { coven_id: string; user_id: string }[]).filter((r) => r.user_id !== userId);
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const profiles = ids.length ? await supabase.from('coven_profiles').select('user_id,display_name').in('user_id', ids) : { data: [] };
  const names = new Map(((profiles.data ?? []) as { user_id: string; display_name: string | null }[]).map((p) => [p.user_id, p.display_name || 'A witch']));
  const people = ids
    .map((id) => ({ id, name: names.get(id) ?? 'A witch', covens: rows.filter((r) => r.user_id === id).map((r) => r.coven_id) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { covens, people };
}

// ── Hooks ────────────────────────────────────────────────────────────────

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const snapshot = () => state;

export function useCycle(): CycleState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Keeps Cycle & Moon loaded for the signed-in person from the moment the app opens, so its reminders and Today's card are ready. */
export function useCycleKeeper(userId: string | null | undefined) {
  useEffect(() => {
    // Undefined while sign-in is still being worked out.
    if (userId !== undefined) setCycleUser(userId);
  }, [userId]);
}

export { newId as cycleId };
