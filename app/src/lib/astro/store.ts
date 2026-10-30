// Birth charts on the phone: the encrypted chart vault kept on the device
// (AsyncStorage), its key remembered on this device, and, when the person
// chooses a passphrase, sync of the ciphertext with the account's
// `astro_vault` row. The website's twin is practice/cosmic/astro-store.js;
// both write the same shapes (lib/astro/vault.ts).
//
// Charts saved before this (the single "cosmic.chart" craft entry, kept in
// plain form with the account) are moved in the first time the vault opens
// and the old entry is deleted, so birth details stop being stored in plain
// form. Before the migration is applied, "keep with my account" says it
// isn't ready yet and everything stays on the device.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import type { ChartInput } from '../craft/cosmic/chart';
import { CHART } from '../craft/cosmic/collections';
import { listEntriesOnce, removeEntry, updateEntry } from '../craft/store';
import { uuid } from '../rituals/lifecycle';
import { supabase } from '../supabase';
import { keyFromText, keyToText } from '../cycle/vault';
import {
  astroVaultFromRow,
  astroVaultToRow,
  decryptAstro,
  deviceAstroVault,
  emptyAstroData,
  mergeAstroData,
  newAstroKey,
  normalizeAstroVault,
  protectAstroVault,
  unlockAstro,
  unlockAstroRecovery,
  withAstroData,
  type AstroData,
  type AstroVault,
  type SavedChart,
} from './vault';

export type AstroSync = 'device' | 'synced' | 'saving' | 'offline' | 'unavailable' | 'signed-out';

export type AstroState = {
  /** 'empty': no charts kept yet; 'locked': kept with the account, the key isn't on this device; 'open': ready. */
  phase: 'loading' | 'empty' | 'locked' | 'open';
  data: AstroData;
  synced: boolean;
  sync: AstroSync;
  userId: string | null;
  error: string | null;
};

const k = (what: string, scope: string) => `astroVault.${what}.${scope}`;
const DEVICE = 'device';
const MISSING = new Set(['42P01', 'PGRST205', 'PGRST202', '42883']);
const missing = (e: { code?: string } | null | undefined) => !!e?.code && MISSING.has(e.code);

let state: AstroState = { phase: 'loading', data: emptyAstroData(), synced: false, sync: 'device', userId: null, error: null };
let vault: AstroVault | null = null;
let key: Uint8Array | null = null;
let revision: number | null = null;
let scope: string | null = null;
let wanted: string | null = null;
let chain: Promise<unknown> = Promise.resolve();
let pushTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<AstroState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function serial<T>(work: () => Promise<T>): Promise<T> {
  const next = chain.then(work, work);
  chain = next.catch(() => null);
  return next;
}

async function readLocal(s: string) {
  try {
    const [[, v], [, kt]] = await AsyncStorage.multiGet([k('vault', s), k('key', s)]);
    return { vault: v ? normalizeAstroVault(JSON.parse(v)) : null, key: keyFromText(kt) };
  } catch {
    return { vault: null, key: null };
  }
}

async function writeLocal(next: AstroVault | null) {
  vault = next;
  if (!scope) return;
  try {
    if (next) await AsyncStorage.setItem(k('vault', scope), JSON.stringify(next));
    else await AsyncStorage.removeItem(k('vault', scope));
  } catch {
    // Kept in memory for this session.
  }
}

async function rememberKey(value: Uint8Array | null) {
  key = value;
  if (!scope) return;
  try {
    if (value) await AsyncStorage.setItem(k('key', scope), keyToText(value));
    else await AsyncStorage.removeItem(k('key', scope));
  } catch {
    // Kept in memory.
  }
}

async function fetchRemote(): Promise<{ row: (AstroVault & { revision: number }) | null; sync: AstroSync }> {
  if (!state.userId) return { row: null, sync: 'signed-out' };
  const { data, error } = await supabase.from('astro_vault').select('kdf,pass_key,recovery_key,ciphertext,revision,updated_at').eq('user_id', state.userId).maybeSingle();
  if (error) return { row: null, sync: missing(error) ? 'unavailable' : 'offline' };
  return { row: astroVaultFromRow(data as Record<string, unknown> | null), sync: 'synced' };
}

const strip = (v: AstroVault & { revision?: number }): AstroVault => {
  const { revision: _r, ...rest } = v;
  void _r;
  return rest;
};

async function load(userId: string | null) {
  scope = userId ?? DEVICE;
  key = null;
  revision = null;
  const local = await readLocal(scope);
  vault = local.vault;
  key = local.key;
  let data: AstroData | null = null;
  if (vault && key) {
    try {
      data = decryptAstro(key, vault.data);
    } catch {
      key = null;
    }
  }
  set({
    userId,
    synced: !!vault?.kdf,
    sync: vault?.kdf ? 'offline' : userId ? 'device' : 'signed-out',
    phase: vault ? (data ? 'open' : 'locked') : 'empty',
    data: data ?? emptyAstroData(),
    error: null,
  });
  await pull();
  await importLegacy();
}

async function pull() {
  if (!state.userId) return;
  const { row, sync } = await fetchRemote();
  if (sync !== 'synced') {
    set({ sync: state.synced ? sync : sync === 'unavailable' ? 'unavailable' : 'device' });
    return;
  }
  if (!row) {
    revision = null;
    if (vault?.kdf && key) await push();
    else set({ sync: 'device' });
    return;
  }
  revision = row.revision;
  if (key) {
    try {
      const theirs = decryptAstro(key, row.data);
      const merged = mergeAstroData(theirs, state.data);
      const next = withAstroData(strip(row), key, merged, new Date());
      await writeLocal(next);
      set({ data: merged, phase: 'open', synced: true, sync: 'synced' });
      if (JSON.stringify(merged) !== JSON.stringify(theirs)) await push();
      return;
    } catch {
      // This device's key doesn't open the account's copy: ask for the passphrase, keeping what's here to merge.
    }
  }
  pending = state.phase === 'open' ? state.data : null;
  await writeLocal(strip(row));
  set({ synced: true, phase: 'locked', sync: 'synced' });
}

let pending: AstroData | null = null;

async function push(): Promise<void> {
  if (!state.userId || !vault?.kdf || !key) return;
  set({ sync: 'saving' });
  for (let attempt = 0; attempt < 3; attempt++) {
    const row = astroVaultToRow(vault, state.userId);
    const result =
      revision == null
        ? await supabase.from('astro_vault').insert(row).select('revision').maybeSingle()
        : await supabase.from('astro_vault').update(row).eq('user_id', state.userId).eq('revision', revision).select('revision').maybeSingle();
    if (!result.error && result.data) {
      revision = Number((result.data as { revision: number }).revision);
      set({ sync: 'synced' });
      return;
    }
    if (result.error && missing(result.error)) return set({ sync: 'unavailable' });
    if (result.error && result.error.code !== '23505') return set({ sync: 'offline' });
    const { row: theirs, sync } = await fetchRemote();
    if (sync !== 'synced') return set({ sync });
    revision = theirs?.revision ?? null;
    if (theirs) {
      try {
        const merged = mergeAstroData(decryptAstro(key, theirs.data), state.data);
        await writeLocal(withAstroData({ ...vault, kdf: theirs.kdf, passKey: theirs.passKey, recoveryKey: theirs.recoveryKey }, key, merged, new Date()));
        set({ data: merged });
      } catch {
        return set({ sync: 'offline', error: 'Your account’s charts were changed with another passphrase. Open them again with that passphrase.' });
      }
    }
  }
  set({ sync: 'offline' });
}

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void serial(push), 800);
}

/** Write new data into the vault (making a device vault the first time). */
async function commit(data: AstroData) {
  if (!key || !vault) {
    key = key ?? newAstroKey();
    await rememberKey(key);
    await writeLocal(deviceAstroVault(key, data, new Date()));
  } else {
    await writeLocal(withAstroData(vault, key, data, new Date()));
  }
  set({ data, phase: 'open' });
  if (state.synced) schedulePush();
}

/** The old plain-text "cosmic.chart" entry: copied into the vault, and deleted from the account once the vault is kept there too. */
async function importLegacy() {
  if (state.phase === 'locked') return;
  try {
    const entries = await listEntriesOnce<Partial<ChartInput>>(CHART);
    if (!entries.length) return;
    const old = entries[0];
    if (!state.data.charts.some((c) => c.relation === 'me') && typeof old.data?.date === 'string') {
      const chart: SavedChart = { id: old.id, name: 'Me', relation: 'me', input: { ...(old.data as ChartInput) }, updatedAt: new Date().toISOString() };
      await commit(mergeAstroData(state.data, { version: 1, charts: [chart], removed: [] }));
    }
    // Only once the chart is kept with the account (encrypted) is the old copy
    // removed: kept on one device only, deleting it would lose the chart on
    // every other device. Blank the entry before deleting it: deletes are
    // soft, and the birth details shouldn't stay behind in plain form.
    if (!state.synced) return;
    for (const e of entries) {
      await updateEntry(CHART, e.id, {});
      await removeEntry(CHART, e.id);
    }
  } catch {
    // Tried again next time.
  }
}

// ── What screens call ────────────────────────────────────────────────────

export function setAstroUser(userId: string | null) {
  const next = userId ?? DEVICE;
  if (wanted === next) return;
  wanted = next;
  void serial(() => load(userId));
}

/** Pull the account's copy, and move in a chart left in the old plain-text place (the chart screens call this on opening). */
export const refreshAstro = () =>
  serial(async () => {
    await pull();
    await importLegacy();
  });

/** Add or change a chart. Returns its id. */
export function saveChart(chart: Omit<SavedChart, 'id' | 'updatedAt'> & { id?: string }): Promise<string> {
  return serial(async () => {
    if (state.phase === 'locked') throw new Error('Open your charts with your passphrase first.');
    const id = chart.id ?? uuid();
    const now = new Date().toISOString();
    const charts = state.data.charts.map((c) => (chart.relation === 'me' && c.relation === 'me' && c.id !== id ? { ...c, relation: 'other' as const, updatedAt: now } : c));
    const without = charts.filter((c) => c.id !== id);
    await commit(mergeAstroData({ ...state.data, charts: without }, { version: 1, charts: [{ ...chart, id, updatedAt: now }], removed: [] }));
    return id;
  });
}

export function deleteChart(id: string): Promise<void> {
  return serial(async () => {
    const now = new Date().toISOString();
    await commit({ ...state.data, charts: state.data.charts.filter((c) => c.id !== id), removed: [...state.data.removed, { id, at: now }] });
  });
}

/** Keep the charts with the account, under a passphrase. Returns the recovery key to show once. */
export function protectCharts(passphrase: string, onProgress?: (done: number) => void): Promise<string> {
  return serial(async () => {
    const dataKey = key ?? newAstroKey();
    const { vault: next, recovery } = await protectAstroVault(dataKey, state.data, passphrase, new Date(), { onProgress });
    await rememberKey(dataKey);
    await writeLocal(next);
    set({ synced: true, phase: 'open' });
    const { row } = await fetchRemote();
    revision = row?.revision ?? null;
    await push();
    return recovery;
  });
}

async function opened(dataKey: Uint8Array) {
  if (!vault) return;
  let data = decryptAstro(dataKey, vault.data);
  if (pending) data = mergeAstroData(data, pending);
  pending = null;
  await rememberKey(dataKey);
  await writeLocal(withAstroData(vault, dataKey, data, new Date()));
  set({ data, phase: 'open', error: null });
  if (state.synced) await push();
  await importLegacy();
}

export async function unlockCharts(passphrase: string, onProgress?: (done: number) => void): Promise<void> {
  if (!vault) return;
  const dataKey = await unlockAstro(vault, passphrase, onProgress);
  await serial(() => opened(dataKey));
}

export async function unlockChartsWithRecovery(code: string): Promise<void> {
  if (!vault) return;
  const dataKey = unlockAstroRecovery(vault, code);
  await serial(() => opened(dataKey));
}

/** Stop keeping them with the account: the account's copy is deleted; this device keeps its own. */
export function keepChartsOnDevice(): Promise<void> {
  return serial(async () => {
    if (!key) return;
    if (state.userId) {
      const { error } = await supabase.from('astro_vault').delete().eq('user_id', state.userId);
      if (error && !missing(error)) throw new Error('Your account’s copy couldn’t be deleted just now. Try again when you’re online.');
    }
    revision = null;
    await writeLocal(deviceAstroVault(key, state.data, new Date()));
    set({ synced: false, sync: state.userId ? 'device' : 'signed-out' });
  });
}

/** Delete every chart, here and in the account. */
export function deleteAllCharts(): Promise<void> {
  return serial(async () => {
    if (state.userId) {
      const { error } = await supabase.from('astro_vault').delete().eq('user_id', state.userId);
      if (error && !missing(error)) throw new Error('Your account’s copy couldn’t be deleted just now, so nothing was deleted. Try again when you’re online.');
    }
    try {
      const keys = (await AsyncStorage.getAllKeys()).filter((x) => x.startsWith('astroVault.') && (x.endsWith(`.${scope}`) || x.endsWith(`.${DEVICE}`)));
      if (keys.length) await AsyncStorage.multiRemove(keys);
    } catch {
      // Nothing more to do.
    }
    key = null;
    vault = null;
    revision = null;
    pending = null;
    set({ phase: 'empty', data: emptyAstroData(), synced: false, sync: state.userId ? 'device' : 'signed-out', error: null });
  });
}

// ── Hooks ────────────────────────────────────────────────────────────────

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const snapshot = () => state;

export function useAstro(): AstroState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** The person's own chart ("me"), if they've entered one. */
export const myChart = (data: AstroData) => data.charts.find((c) => c.relation === 'me') ?? null;

/** Keeps the chart vault loaded for the signed-in person (the tabs call this), so Today can read the chart. */
export function useAstroKeeper(userId: string | null | undefined) {
  useEffect(() => {
    if (userId !== undefined) setAstroUser(userId);
  }, [userId]);
}
