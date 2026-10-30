// Birth charts, kept private: the same end-to-end encryption as Cycle &
// Moon (app/src/lib/cycle/vault.ts: a random data key, XChaCha20-Poly1305,
// the key wrapped by a passphrase through scrypt and by a recovery key),
// with its own labels so a chart vault can never be mistaken for, or
// opened as, a Cycle & Moon one. What is kept: the charts the person
// enters (theirs and other people's), each a name, birth date, time, place
// and time zone. The website builds this file into js/core/astro.js, so a
// vault sealed on the phone opens on the website and the other way round.
//
// Two ways to keep it, chosen by the person:
// * On this device only (the default): the vault is encrypted with a key
//   kept on the device, and never sent.
// * With the account: a passphrase protects the key; only ciphertext goes
//   to the `astro_vault` row (supabase/migrations/20261118000000_astro_vault.sql).

import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';

import type { ChartInput } from '../craft/cosmic/chart.ts';
import {
  checkKdf,
  formatRecovery,
  fromBase64,
  KDF_COST,
  MIN_PASSPHRASE,
  parseRecovery,
  passphraseKey,
  randomBytes,
  seal,
  toBase64,
  unseal,
  utf8,
  VaultError,
  type KdfParams,
} from '../cycle/vault.ts';

export { VaultError, MIN_PASSPHRASE, type KdfParams };

/** One chart the person keeps. */
export type SavedChart = {
  id: string;
  /** "Me", or a name they give. */
  name: string;
  relation: 'me' | 'other';
  input: ChartInput;
  /** A private line about whose chart this is (optional). */
  note?: string;
  updatedAt: string;
};

export type AstroData = {
  version: 1;
  charts: SavedChart[];
  /** Deleted charts, so a deletion on one device isn't undone by another's older copy. */
  removed: { id: string; at: string }[];
};

export type AstroVault = {
  version: 1;
  kdf: KdfParams | null;
  passKey: string | null;
  recoveryKey: string | null;
  data: string;
  updatedAt: string;
};

const AAD_DATA = utf8('salt-astro:data:v1');
const AAD_PASS = utf8('salt-astro:key:pass:v1');
const AAD_RECOVERY = utf8('salt-astro:key:recovery:v1');
const RECOVERY_INFO = utf8('salt-astro:recovery:v1');

export const emptyAstroData = (): AstroData => ({ version: 1, charts: [], removed: [] });

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

export function normalizeChartInput(raw: unknown): ChartInput | null {
  if (!isObj(raw) || typeof raw.date !== 'string') return null;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const str = (v: unknown) => (typeof v === 'string' ? v : null);
  return {
    name: str(raw.name),
    date: raw.date,
    time: str(raw.time) ?? '',
    utcOffsetMinutes: num(raw.utcOffsetMinutes) ?? 0,
    offsetFromDevice: !!raw.offsetFromDevice,
    zone: str(raw.zone),
    offsetOverridden: !!raw.offsetOverridden,
    country: str(raw.country),
    latitude: num(raw.latitude),
    longitude: num(raw.longitude),
    placeLabel: str(raw.placeLabel),
  };
}

export function normalizeAstroData(raw: unknown): AstroData {
  const r = isObj(raw) ? raw : {};
  const charts: SavedChart[] = [];
  for (const c of Array.isArray(r.charts) ? r.charts : []) {
    if (!isObj(c) || typeof c.id !== 'string') continue;
    const input = normalizeChartInput(c.input);
    if (!input) continue;
    charts.push({
      id: c.id,
      name: typeof c.name === 'string' && c.name.trim() ? c.name.slice(0, 80) : 'A chart',
      relation: c.relation === 'me' ? 'me' : 'other',
      input,
      note: typeof c.note === 'string' ? c.note.slice(0, 500) : undefined,
      updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt : '',
    });
  }
  const removed = (Array.isArray(r.removed) ? r.removed : [])
    .filter((x): x is { id: string; at: string } => isObj(x) && typeof x.id === 'string' && typeof x.at === 'string')
    .map((x) => ({ id: x.id, at: x.at }));
  return { version: 1, charts, removed };
}

/** Two copies of the charts made one: the later edit of each chart wins, and a deletion wins over older edits. */
export function mergeAstroData(a: AstroData, b: AstroData): AstroData {
  const removed = new Map<string, string>();
  for (const r of [...a.removed, ...b.removed]) if (!removed.has(r.id) || removed.get(r.id)! < r.at) removed.set(r.id, r.at);
  const charts = new Map<string, SavedChart>();
  for (const c of [...a.charts, ...b.charts]) {
    const have = charts.get(c.id);
    if (!have || have.updatedAt < c.updatedAt) charts.set(c.id, c);
  }
  const kept = [...charts.values()].filter((c) => !removed.has(c.id) || removed.get(c.id)! < c.updatedAt);
  // Only one chart can be "me": the most recently edited.
  const mine = kept.filter((c) => c.relation === 'me').sort((x, y) => (y.updatedAt < x.updatedAt ? -1 : 1));
  for (const extra of mine.slice(1)) extra.relation = 'other';
  return {
    version: 1,
    charts: kept.sort((x, y) => (x.relation === 'me' ? -1 : y.relation === 'me' ? 1 : x.name.localeCompare(y.name))),
    removed: [...removed].map(([id, at]) => ({ id, at })).slice(-200),
  };
}

// ── Sealing ──────────────────────────────────────────────────────────────

export function encryptAstro(dataKey: Uint8Array, data: AstroData): string {
  return seal(dataKey, utf8(JSON.stringify(data)), AAD_DATA);
}

export function decryptAstro(dataKey: Uint8Array, sealed: string): AstroData {
  const plain = unseal(dataKey, sealed, AAD_DATA);
  if (!plain) throw new VaultError('damaged', 'Your charts couldn’t be opened with this key.');
  try {
    return normalizeAstroData(JSON.parse(new TextDecoder().decode(plain)));
  } catch {
    throw new VaultError('damaged', 'Your charts couldn’t be read.');
  }
}

const recoveryWrap = (recovery: Uint8Array, kdf: KdfParams) => hkdf(sha256, recovery, fromBase64(kdf.salt), RECOVERY_INFO, 32);

export const newAstroKey = () => randomBytes(32);

export function deviceAstroVault(dataKey: Uint8Array, data: AstroData, now: Date): AstroVault {
  return { version: 1, kdf: null, passKey: null, recoveryKey: null, data: encryptAstro(dataKey, data), updatedAt: now.toISOString() };
}

export async function protectAstroVault(
  dataKey: Uint8Array,
  data: AstroData,
  passphrase: string,
  now: Date,
  options: { cost?: { N: number; r: number; p: number }; onProgress?: (done: number) => void } = {},
): Promise<{ vault: AstroVault; recovery: string }> {
  if (String(passphrase).normalize('NFKC').length < MIN_PASSPHRASE) throw new VaultError('no-passphrase', `Choose a passphrase of at least ${MIN_PASSPHRASE} characters.`);
  const kdf: KdfParams = { name: 'scrypt', ...(options.cost ?? KDF_COST), salt: toBase64(randomBytes(16)) };
  const wrap = await passphraseKey(passphrase, kdf, options.onProgress);
  const recovery = randomBytes(20);
  return {
    vault: {
      version: 1,
      kdf,
      passKey: seal(wrap, dataKey, AAD_PASS),
      recoveryKey: seal(recoveryWrap(recovery, kdf), dataKey, AAD_RECOVERY),
      data: encryptAstro(dataKey, data),
      updatedAt: now.toISOString(),
    },
    recovery: formatRecovery(recovery),
  };
}

export async function unlockAstro(vault: AstroVault, passphrase: string, onProgress?: (done: number) => void): Promise<Uint8Array> {
  if (!vault.kdf || !vault.passKey) throw new VaultError('damaged', 'This vault has no passphrase.');
  const key = unseal(await passphraseKey(passphrase, vault.kdf, onProgress), vault.passKey, AAD_PASS);
  if (!key || key.length !== 32) throw new VaultError('wrong-passphrase', 'That passphrase didn’t open your charts.');
  return key;
}

export function unlockAstroRecovery(vault: AstroVault, recoveryText: string): Uint8Array {
  if (!vault.kdf || !vault.recoveryKey) throw new VaultError('damaged', 'This vault has no recovery key.');
  const recovery = parseRecovery(recoveryText);
  const key = recovery ? unseal(recoveryWrap(recovery, checkKdf(vault.kdf)), vault.recoveryKey, AAD_RECOVERY) : null;
  if (!key || key.length !== 32) throw new VaultError('wrong-recovery', 'That recovery key didn’t open your charts. Check each group of four.');
  return key;
}

export function withAstroData(vault: AstroVault, dataKey: Uint8Array, data: AstroData, now: Date): AstroVault {
  return { ...vault, data: encryptAstro(dataKey, data), updatedAt: now.toISOString() };
}

export function normalizeAstroVault(raw: unknown): AstroVault | null {
  if (!isObj(raw) || typeof raw.data !== 'string' || !raw.data) return null;
  const k = isObj(raw.kdf) ? raw.kdf : null;
  return {
    version: 1,
    kdf: k ? { name: 'scrypt', N: Number(k.N), r: Number(k.r), p: Number(k.p), salt: String(k.salt ?? '') } : null,
    passKey: typeof raw.passKey === 'string' ? raw.passKey : null,
    recoveryKey: typeof raw.recoveryKey === 'string' ? raw.recoveryKey : null,
    data: raw.data,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
  };
}

/** The `astro_vault` row, and back. */
export function astroVaultToRow(vault: AstroVault, userId: string) {
  return { user_id: userId, version: 1, kdf: vault.kdf, pass_key: vault.passKey, recovery_key: vault.recoveryKey, ciphertext: vault.data };
}

export function astroVaultFromRow(row: Record<string, unknown> | null | undefined): (AstroVault & { revision: number }) | null {
  if (!row) return null;
  const v = normalizeAstroVault({ kdf: row.kdf, passKey: row.pass_key, recoveryKey: row.recovery_key, data: row.ciphertext, updatedAt: row.updated_at });
  return v ? { ...v, revision: Number(row.revision) || 0 } : null;
}

export { formatRecovery, parseRecovery };
export { keyFromText, keyToText } from '../cycle/vault.ts';
