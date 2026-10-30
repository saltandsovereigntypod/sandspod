// Cycle & Moon: end-to-end encryption, the same on the phone and the website
// (js/core/cycle.js is built from this file), so what one encrypts the other
// opens.
//
// The notes are encrypted with a random 256-bit data key (XChaCha20-Poly1305,
// a fresh 24-byte nonce every time). The data key itself is kept twice, each
// copy encrypted ("wrapped"): once with a key made from the person's Cycle &
// Moon passphrase by scrypt (slow on purpose, so guessing is slow), and once
// with a recovery key made of 160 random bits that they write down. Only the
// wrapped copies and the encrypted notes are ever sent; the server can't open
// either. Lose both the passphrase and the recovery key and nobody, the
// people who run Salt & Sovereignty included, can open the notes again.
//
// Keeping it on this device only: the data key stays on the device and there
// is no passphrase; the vault simply isn't sent.
//
// Randomness comes from the platform's secure generator: crypto.getRandomValues
// on the web (and Hermes when it has it), else Expo's native UUID v4, which
// iOS and Android make with their system CSPRNGs (122 random bits each). Never
// Math.random: without a secure source this throws.

import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { scrypt, scryptAsync } from '@noble/hashes/scrypt.js';
import { sha256 } from '@noble/hashes/sha2.js';

import { normalizeData } from './model.ts';
import type { CycleData } from './types.ts';

export type KdfParams = { name: 'scrypt'; N: number; r: number; p: number; salt: string };

/** What is stored: on the device, and (with sync) in the account's `cycle_moon_vault` row. Every value is safe to store as it is. */
export type Vault = {
  version: 1;
  /** Null when the vault is kept on this device only (no passphrase). */
  kdf: KdfParams | null;
  /** The data key, wrapped by the passphrase's key. */
  passKey: string | null;
  /** The data key, wrapped by the recovery key's key. */
  recoveryKey: string | null;
  /** The notes, encrypted with the data key. */
  data: string;
  updatedAt: string;
};

/**
 * scrypt N = 2^15, r = 8, p = 1 (32 MiB). Measured in plain JavaScript:
 * about a quarter of a second in a desktop browser; on a phone it runs in
 * the background with a progress bar, once per device (the data key is
 * remembered afterwards). Kept with each vault, so it can be raised later
 * without breaking older ones.
 */
export const KDF_COST = { N: 2 ** 14, r: 8, p: 1 } as const;
/** The most a stored vault may ask for, so a bad row can't hang a phone. */
const KDF_LIMIT = { N: 2 ** 20, r: 16, p: 4 } as const;
export const MIN_PASSPHRASE = 10;

const AAD_DATA = utf8('salt-cycle-moon:data:v1');
const AAD_PASS = utf8('salt-cycle-moon:key:pass:v1');
const AAD_RECOVERY = utf8('salt-cycle-moon:key:recovery:v1');
const RECOVERY_INFO = utf8('salt-cycle-moon:recovery:v1');

export class VaultError extends Error {
  code: 'wrong-passphrase' | 'wrong-recovery' | 'damaged' | 'no-random' | 'no-passphrase';
  constructor(code: VaultError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

// ── Bytes ────────────────────────────────────────────────────────────────

export function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}
function fromUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function toBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (i + 1 < bytes.length ? B64[(n >> 6) & 63] : '=') + (i + 2 < bytes.length ? B64[n & 63] : '=');
  }
  return out;
}

export function fromBase64(text: string): Uint8Array {
  const clean = String(text || '').replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n = (B64.indexOf(clean[i]) << 18) | (B64.indexOf(clean[i + 1]) << 12) | ((B64.indexOf(clean[i + 2] ?? 'A') & 63) << 6) | (B64.indexOf(clean[i + 3] ?? 'A') & 63);
    if (o < out.length) out[o++] = (n >> 16) & 255;
    if (o < out.length) out[o++] = (n >> 8) & 255;
    if (o < out.length) out[o++] = n & 255;
  }
  return out;
}

const concat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
};

type RandomSource = { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array }; expo?: { uuidv4?: () => string } };

/** n secure random bytes (see the note at the top). */
export function randomBytes(n: number): Uint8Array {
  const g = globalThis as RandomSource;
  const out = new Uint8Array(n);
  if (typeof g.crypto?.getRandomValues === 'function') {
    g.crypto.getRandomValues(out);
    return out;
  }
  const uuid = g.expo?.uuidv4;
  if (typeof uuid === 'function') {
    // Enough UUIDs for twice the bits asked for, run through SHA-256 to spread them evenly.
    const count = Math.ceil((n * 8 * 2) / 122) + 1;
    const seed = utf8(Array.from({ length: count }, () => uuid()).join(''));
    for (let block = 0, o = 0; o < n; block++) {
      const chunk = sha256(concat(seed, new Uint8Array([block >> 8, block & 255])));
      out.set(chunk.subarray(0, Math.min(32, n - o)), o);
      o += 32;
    }
    return out;
  }
  throw new VaultError('no-random', 'This device has no secure random generator, so Cycle & Moon can’t encrypt here.');
}

// ── Sealing ──────────────────────────────────────────────────────────────

export function seal(key: Uint8Array, plain: Uint8Array, aad: Uint8Array): string {
  const nonce = randomBytes(24);
  return toBase64(concat(nonce, xchacha20poly1305(key, nonce, aad).encrypt(plain)));
}

/** Opens what seal made; null if the key is wrong or it was changed. */
export function unseal(key: Uint8Array, sealed: string, aad: Uint8Array): Uint8Array | null {
  const bytes = fromBase64(sealed);
  if (bytes.length < 24 + 16) return null;
  try {
    return xchacha20poly1305(key, bytes.subarray(0, 24), aad).decrypt(bytes.subarray(24));
  } catch {
    return null;
  }
}

export function encryptData(dataKey: Uint8Array, data: CycleData): string {
  return seal(dataKey, utf8(JSON.stringify(data)), AAD_DATA);
}

export function decryptData(dataKey: Uint8Array, sealed: string): CycleData {
  const plain = unseal(dataKey, sealed, AAD_DATA);
  if (!plain) throw new VaultError('damaged', 'These notes couldn’t be opened with this key.');
  try {
    return normalizeData(JSON.parse(fromUtf8(plain)));
  } catch {
    throw new VaultError('damaged', 'These notes couldn’t be read.');
  }
}

// ── Keys ─────────────────────────────────────────────────────────────────

export const newDataKey = () => randomBytes(32);

export function checkKdf(kdf: KdfParams | null | undefined): KdfParams {
  const ok =
    !!kdf &&
    kdf.name === 'scrypt' &&
    Number.isInteger(kdf.N) && kdf.N >= 2 ** 10 && kdf.N <= KDF_LIMIT.N && (kdf.N & (kdf.N - 1)) === 0 &&
    Number.isInteger(kdf.r) && kdf.r >= 1 && kdf.r <= KDF_LIMIT.r &&
    Number.isInteger(kdf.p) && kdf.p >= 1 && kdf.p <= KDF_LIMIT.p &&
    fromBase64(kdf.salt).length >= 16;
  if (!ok) throw new VaultError('damaged', 'This vault’s settings aren’t ones Cycle & Moon can use.');
  return kdf!;
}

const normalizePassphrase = (passphrase: string) => utf8(String(passphrase).normalize('NFKC'));

/** The key a passphrase makes (slow on purpose). `onProgress` gets 0 to 1. */
export async function passphraseKey(passphrase: string, kdf: KdfParams, onProgress?: (done: number) => void): Promise<Uint8Array> {
  const k = checkKdf(kdf);
  return scryptAsync(normalizePassphrase(passphrase), fromBase64(k.salt), { N: k.N, r: k.r, p: k.p, dkLen: 32, asyncTick: 25, onProgress });
}

/** The same, all at once (for tests and timing). */
export function passphraseKeySync(passphrase: string, kdf: KdfParams): Uint8Array {
  const k = checkKdf(kdf);
  return scrypt(normalizePassphrase(passphrase), fromBase64(k.salt), { N: k.N, r: k.r, p: k.p, dkLen: 32 });
}

// Recovery keys: 20 random bytes as 32 characters of Crockford base32, in eight groups of four.
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function formatRecovery(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out.match(/.{1,4}/g)!.join('-');
}

export function parseRecovery(text: string): Uint8Array | null {
  const clean = String(text || '')
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
  if (clean.length !== 32 || [...clean].some((c) => !B32.includes(c))) return null;
  const out = new Uint8Array(20);
  let bits = 0;
  let value = 0;
  let o = 0;
  for (const c of clean) {
    value = (value << 5) | B32.indexOf(c);
    bits += 5;
    if (bits >= 8) {
      out[o++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return out;
}

export function recoveryWrapKey(recovery: Uint8Array, kdf: KdfParams): Uint8Array {
  return hkdf(sha256, recovery, fromBase64(kdf.salt), RECOVERY_INFO, 32);
}

// ── Vaults ───────────────────────────────────────────────────────────────

/** A vault kept on this device only: no passphrase, nothing to send. */
export function deviceVault(dataKey: Uint8Array, data: CycleData, now: Date): Vault {
  return { version: 1, kdf: null, passKey: null, recoveryKey: null, data: encryptData(dataKey, data), updatedAt: now.toISOString() };
}

/**
 * Protect a data key with a passphrase and a new recovery key, ready to sync.
 * Returns the vault and the recovery key to show the person once.
 */
export async function protectVault(
  dataKey: Uint8Array,
  data: CycleData,
  passphrase: string,
  now: Date,
  options: { cost?: { N: number; r: number; p: number }; onProgress?: (done: number) => void } = {},
): Promise<{ vault: Vault; recovery: string }> {
  if (String(passphrase).normalize('NFKC').length < MIN_PASSPHRASE) throw new VaultError('no-passphrase', `Choose a passphrase of at least ${MIN_PASSPHRASE} characters.`);
  const kdf: KdfParams = { name: 'scrypt', ...(options.cost ?? KDF_COST), salt: toBase64(randomBytes(16)) };
  const wrap = await passphraseKey(passphrase, kdf, options.onProgress);
  const recovery = randomBytes(20);
  return {
    vault: {
      version: 1,
      kdf,
      passKey: seal(wrap, dataKey, AAD_PASS),
      recoveryKey: seal(recoveryWrapKey(recovery, kdf), dataKey, AAD_RECOVERY),
      data: encryptData(dataKey, data),
      updatedAt: now.toISOString(),
    },
    recovery: formatRecovery(recovery),
  };
}

/** The data key, from the passphrase. Throws VaultError('wrong-passphrase') if it doesn't fit. */
export async function unlockWithPassphrase(vault: Vault, passphrase: string, onProgress?: (done: number) => void): Promise<Uint8Array> {
  if (!vault.kdf || !vault.passKey) throw new VaultError('damaged', 'This vault has no passphrase.');
  const key = unseal(await passphraseKey(passphrase, vault.kdf, onProgress), vault.passKey, AAD_PASS);
  if (!key || key.length !== 32) throw new VaultError('wrong-passphrase', 'That passphrase didn’t open your Cycle & Moon notes.');
  return key;
}

/** The data key, from the recovery key. Throws VaultError('wrong-recovery') if it doesn't fit. */
export function unlockWithRecovery(vault: Vault, recoveryText: string): Uint8Array {
  if (!vault.kdf || !vault.recoveryKey) throw new VaultError('damaged', 'This vault has no recovery key.');
  const recovery = parseRecovery(recoveryText);
  const key = recovery ? unseal(recoveryWrapKey(recovery, checkKdf(vault.kdf)), vault.recoveryKey, AAD_RECOVERY) : null;
  if (!key || key.length !== 32) throw new VaultError('wrong-recovery', 'That recovery key didn’t open your Cycle & Moon notes. Check each group of four.');
  return key;
}

/** The same notes under a new passphrase (and, if asked, a new recovery key; otherwise the old one still works). */
export async function changePassphrase(
  vault: Vault,
  dataKey: Uint8Array,
  passphrase: string,
  now: Date,
  options: { newRecovery?: boolean; cost?: { N: number; r: number; p: number }; onProgress?: (done: number) => void } = {},
): Promise<{ vault: Vault; recovery: string | null }> {
  if (options.newRecovery || !vault.kdf || !vault.recoveryKey) {
    const fresh = await protectVault(dataKey, decryptData(dataKey, vault.data), passphrase, now, options);
    return fresh;
  }
  if (String(passphrase).normalize('NFKC').length < MIN_PASSPHRASE) throw new VaultError('no-passphrase', `Choose a passphrase of at least ${MIN_PASSPHRASE} characters.`);
  // The recovery key is wrapped with the old salt; keep that salt's copy working by re-wrapping under the same salt.
  const kdf: KdfParams = { ...vault.kdf, ...(options.cost ?? {}) };
  const wrap = await passphraseKey(passphrase, kdf, options.onProgress);
  return { vault: { ...vault, kdf, passKey: seal(wrap, dataKey, AAD_PASS), updatedAt: now.toISOString() }, recovery: null };
}

/** The vault with new notes in it. */
export function withData(vault: Vault, dataKey: Uint8Array, data: CycleData, now: Date): Vault {
  return { ...vault, data: encryptData(dataKey, data), updatedAt: now.toISOString() };
}

export function normalizeVault(raw: unknown): Vault | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.data !== 'string' || !r.data) return null;
  const k = r.kdf as Record<string, unknown> | null;
  const kdf = k && typeof k === 'object' ? ({ name: 'scrypt', N: Number(k.N), r: Number(k.r), p: Number(k.p), salt: String(k.salt ?? '') } as KdfParams) : null;
  return {
    version: 1,
    kdf,
    passKey: typeof r.passKey === 'string' ? r.passKey : null,
    recoveryKey: typeof r.recoveryKey === 'string' ? r.recoveryKey : null,
    data: r.data,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : '',
  };
}

/** The account row for a vault (`cycle_moon_vault`), and back. */
export function vaultToRow(vault: Vault, userId: string) {
  return { user_id: userId, version: vault.version, kdf: vault.kdf, pass_key: vault.passKey, recovery_key: vault.recoveryKey, ciphertext: vault.data };
}

export function vaultFromRow(row: Record<string, unknown> | null | undefined): (Vault & { revision: number }) | null {
  if (!row) return null;
  const vault = normalizeVault({ kdf: row.kdf, passKey: row.pass_key, recoveryKey: row.recovery_key, data: row.ciphertext, updatedAt: row.updated_at });
  return vault ? { ...vault, revision: Number(row.revision) || 0 } : null;
}

export const keyToText = (key: Uint8Array) => toBase64(key);
export const keyFromText = (text: string | null | undefined): Uint8Array | null => {
  if (!text) return null;
  const key = fromBase64(text);
  return key.length === 32 ? key : null;
};
