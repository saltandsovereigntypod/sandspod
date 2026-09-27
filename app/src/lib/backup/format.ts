// The Sanctuary backup format, ported line for line from the website's
// js/sanctuary-backup.js (format "salt-and-sovereignty-sanctuary-backup",
// version 1). A file made by either side must validate and restore on the
// other, so keep this file in step with the website's copy.

import { sha256, utf8Bytes } from './sha256.ts';

export const FORMAT = 'salt-and-sovereignty-sanctuary-backup';
export const VERSION = 1;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_ASSET_BYTES = 2 * 1024 * 1024;
export const MAX_ASSETS = 100;
export const PAGE_SIZE = 1000;

const FORBIDDEN_KEYS = new Set([
  '__proto__',
  'prototype',
  'constructor',
  'access_token',
  'refresh_token',
  'password',
  'service_role',
  'service_role_key',
  'supabasePublishableKey',
  'supabaseUrl',
  'moderatorIds',
  'role',
  'roles',
  'app_metadata',
  'user_metadata',
]);
const OWNERSHIP_KEYS = new Set(['user_id', 'owner_id', 'created_by']);

/** Guest data lives under the same storage keys the website uses in localStorage. */
export const GUEST_KEYS = Object.freeze({
  settings: 'saltAndSovereigntyUserSettings',
  altars: 'saltAndSovereigntySavedAltars',
  altarDraft: 'saltAndSovereigntyWorkingAltarDraft',
  livingLibrary: 'saltAndSovereigntyLibrary',
  livingLibraryLayouts: 'saltAndSovereigntyLibraryPageLayouts',
  apothecary: 'saltAndSovereigntyApothecaryItems',
  ritualJournals: 'saltAndSovereigntyUserRituals',
  ritualLifecycle: 'saltAndSovereigntyRitualLifecycle:guest',
  customCabinet: 'saltAndSovereigntyCustomCabinetItems',
  mundaneMode: 'saltAndSovereigntyMundaneMode',
} as const);

export const CLOUD_SECTIONS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  settings: ['user_settings'],
  altars: ['saved_altars', 'custom_altar_backgrounds', 'custom_cabinet_items', 'custom_cabinet_image_overrides'],
  grimoire: ['grimoire_books', 'grimoire_sections', 'grimoire_pages', 'grimoire_blocks', 'grimoire_page_links'],
  livingLibrary: ['living_library_entries', 'library_relations', 'object_instances', 'object_instance_events'],
  apothecary: ['apothecary_items'],
  rituals: [
    'ritual_templates',
    'ritual_template_steps',
    'ritual_sessions',
    'ritual_session_steps',
    'user_rituals',
    'ritual_links',
  ],
  community: ['community_submissions', 'community_submission_messages'],
});

export const RESTORE_ORDER = Object.freeze([
  'user_settings',
  'grimoire_books',
  'grimoire_sections',
  'living_library_entries',
  'grimoire_pages',
  'grimoire_blocks',
  'apothecary_items',
  'ritual_templates',
  'ritual_template_steps',
  'ritual_sessions',
  'ritual_session_steps',
  'user_rituals',
  'saved_altars',
  'custom_cabinet_items',
  'custom_altar_backgrounds',
  'custom_cabinet_image_overrides',
  'object_instances',
  'object_instance_events',
  'grimoire_page_links',
  'library_relations',
  'ritual_links',
  'community_submissions',
]);

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };
export type Row = Record<string, unknown>;

export type BackupAsset = { id: string; source: string; mediaType: string; dataUrl: string };

export type Backup = {
  format: string;
  version: number;
  createdAt: string;
  application: { name: string; environment: string };
  owner: { exportScope: string };
  manifest: {
    sections: string[];
    recordCounts: Record<string, number>;
    assetCount: number;
    complete: boolean;
    warnings: string[];
  };
  data: Record<string, unknown>;
  assets: BackupAsset[];
  integrity: { algorithm: string; digest: string };
};

const clone = <T>(value: T): T => (value == null ? value : JSON.parse(JSON.stringify(value)));

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value) || (!!value && typeof value === 'object' && Object.getPrototypeOf(value) === null);
}

export function isForbiddenKey(key: string): boolean {
  return (
    FORBIDDEN_KEYS.has(key) ||
    /(?:^|_)(?:access|refresh|auth|id)?token(?:$|_)|password|client_secret|secret_key|service.role|supabase(?:url|key)|moderator(?:id|role)|authorization/i.test(
      key,
    )
  );
}

/**
 * Drops signed query parameters from an http(s) URL. Written by hand rather
 * than with `URL`, whose React Native polyfill has no working `searchParams`.
 */
export function stripSignedParams(url: string): string {
  const hashAt = url.indexOf('#');
  const hash = hashAt >= 0 ? url.slice(hashAt) : '';
  const withoutHash = hashAt >= 0 ? url.slice(0, hashAt) : url;
  const queryAt = withoutHash.indexOf('?');
  if (queryAt < 0) return url;
  const base = withoutHash.slice(0, queryAt);
  const kept = withoutHash
    .slice(queryAt + 1)
    .split('&')
    .filter((pair) => {
      if (!pair) return false;
      const rawKey = pair.split('=')[0];
      let key = rawKey;
      try {
        key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
      } catch {
        // keep the raw key
      }
      return !/token|signature|credential|key/i.test(key);
    });
  return `${base}${kept.length ? `?${kept.join('&')}` : ''}${hash}`;
}

export function sanitize(value: unknown, options: { keepOwnership?: boolean } = {}): unknown {
  if (Array.isArray(value)) return value.map((item) => sanitize(item, options));
  if (!isPlainObject(value)) {
    if (typeof value !== 'string') return value;
    const clean = value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    if (!/^https?:\/\//i.test(clean)) return clean;
    return stripSignedParams(clean);
  }
  const output: Record<string, unknown> = Object.create(null);
  for (const [key, child] of Object.entries(value)) {
    if (isForbiddenKey(key) || (!options.keepOwnership && OWNERSHIP_KEYS.has(key))) continue;
    output[key] = sanitize(child, options);
  }
  return output;
}

export function stableStringify(value: unknown): string {
  const sort = (item: unknown): unknown =>
    Array.isArray(item)
      ? item.map(sort)
      : item && typeof item === 'object' && isRecordLike(item)
        ? Object.keys(item)
            .sort()
            .reduce<Record<string, unknown>>((result, key) => {
              result[key] = sort(item[key]);
              return result;
            }, {})
        : item;
  return JSON.stringify(sort(value));
}

function arraysIn(section: unknown): unknown[][] {
  if (Array.isArray(section)) return [section];
  if (!section || typeof section !== 'object' || !isRecordLike(section)) return [];
  return Object.values(section).flatMap((value) => arraysIn(value));
}

export function recordCounts(data: Record<string, unknown>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(data).map(([section, value]) => [
      section,
      arraysIn(value).reduce((sum, records) => sum + records.length, 0),
    ]),
  );
}

export type CreateOptions = {
  createdAt?: string;
  environment?: string;
  scope?: 'guest-browser' | 'authenticated-user' | string;
  assets?: BackupAsset[];
  complete?: boolean;
  warnings?: string[];
};

export async function createBackup(data: Record<string, unknown>, options: CreateOptions = {}): Promise<Backup> {
  const clean = sanitize(data) as Record<string, unknown>;
  const counts = recordCounts(clean);
  const backup: Backup = {
    format: FORMAT,
    version: VERSION,
    createdAt: options.createdAt || new Date().toISOString(),
    application: { name: 'Salt & Sovereignty', environment: options.environment || 'unknown' },
    owner: { exportScope: options.scope || 'guest-browser' },
    manifest: {
      sections: Object.keys(clean).sort(),
      recordCounts: counts,
      assetCount: (options.assets || []).length,
      complete: options.complete !== false,
      warnings: options.warnings || [],
    },
    data: clean,
    assets: sanitize(options.assets || []) as BackupAsset[],
    integrity: { algorithm: 'SHA-256', digest: '' },
  };
  const unsigned = clone(backup);
  unsigned.integrity.digest = '';
  backup.integrity.digest = await sha256(stableStringify(unsigned));
  return backup;
}

/** Reads the allow-listed guest keys out of a storage snapshot. */
export function collectGuest(storage: Pick<Storage, 'getItem'>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [section, key] of Object.entries(GUEST_KEYS)) {
    const raw = storage.getItem(key);
    if (raw == null) continue;
    try {
      data[section] = JSON.parse(raw);
    } catch {
      data[section] = raw;
    }
  }
  return sanitize(data) as Record<string, unknown>;
}

export function findAssetReferences(value: unknown, found: Set<string> = new Set()): string[] {
  if (typeof value === 'string' && (/^data:image\/(?:png|jpeg|webp);base64,/i.test(value) || /^https?:\/\//i.test(value)))
    found.add(value);
  else if (Array.isArray(value)) value.forEach((item) => findAssetReferences(item, found));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => findAssetReferences(item, found));
  return [...found];
}

function restorableCollections(data: Record<string, unknown>) {
  const collections: { path: string; records: unknown[] }[] = [];
  const cloudTables = new Set(Object.values(CLOUD_SECTIONS).flat());
  for (const [sectionName, section] of Object.entries(data || {})) {
    if (Array.isArray(section)) collections.push({ path: `data.${sectionName}`, records: section });
    if (!section || typeof section !== 'object' || Array.isArray(section)) continue;
    for (const [collectionName, records] of Object.entries(section)) {
      if (!Array.isArray(records)) continue;
      if (cloudTables.has(collectionName) || sectionName === 'ritualLifecycle') {
        collections.push({ path: `data.${sectionName}.${collectionName}`, records });
      }
    }
  }
  return collections;
}

// Tables whose key is the owner, not an `id` column. Their rows have no id
// once `user_id` is stripped, so the id rule can't apply. (The website's
// validator still applies it, and so refuses its own signed-in backups
// whenever they include settings; see the Milestone 6 notes in PLAN.md.)
const KEYED_BY_OWNER = new Set(['user_settings']);

function validateIds(data: Record<string, unknown>, errors: string[]) {
  for (const { path, records } of restorableCollections(data)) {
    if (KEYED_BY_OWNER.has(path.split('.').pop() ?? '')) continue;
    const ids = new Set<string>();
    records.forEach((record, index) => {
      if (!record || typeof record !== 'object') return;
      const id = String((record as Row).id ?? '').trim();
      if (!id) errors.push(`${path}[${index}] has an empty top-level ID.`);
      else if (ids.has(id)) errors.push(`${path} contains duplicate top-level ID ${id}.`);
      else ids.add(id);
    });
  }
}

function scanForbidden(value: unknown, errors: string[], path = '') {
  if (typeof value === 'string') {
    if (/<(?:script|iframe|object|embed)\b|javascript:/i.test(value)) errors.push(`Unsafe active content at ${path}.`);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const next = path ? `${path}.${key}` : key;
    if (isForbiddenKey(key) || OWNERSHIP_KEYS.has(key)) errors.push(`Forbidden field: ${next}`);
    scanForbidden(child, errors, next);
  }
}

export type Validation = { valid: boolean; errors: string[]; warnings: string[]; backup: Backup | null };

export async function validateBackup(text: string): Promise<Validation> {
  const errors: string[] = [];
  if (utf8Bytes(text).length > MAX_FILE_BYTES)
    return { valid: false, errors: ['Backup exceeds the 25 MB JSON limit.'], warnings: [], backup: null };
  let backup: Backup;
  try {
    backup = JSON.parse(text);
  } catch {
    return { valid: false, errors: ['This file is not valid JSON.'], warnings: [], backup: null };
  }
  if (backup?.format !== FORMAT) errors.push('This is not a Salt & Sovereignty Sanctuary backup.');
  if (backup?.version !== VERSION) errors.push(`Backup version ${backup?.version ?? 'unknown'} is not supported.`);
  if (!backup?.createdAt || Number.isNaN(Date.parse(backup.createdAt))) errors.push('Backup creation date is invalid.');
  if (!backup?.data || !backup?.manifest || !backup?.integrity) errors.push('Required backup sections are missing.');
  if (backup?.manifest?.complete !== true) errors.push('This backup is marked partial and cannot be restored safely.');
  scanForbidden(backup?.data, errors);
  validateIds(backup?.data || {}, errors);
  const actualCounts = recordCounts(backup?.data || {});
  for (const [section, count] of Object.entries(backup?.manifest?.recordCounts || {}))
    if (actualCounts[section] !== count) errors.push(`Record count mismatch in ${section}.`);
  for (const asset of backup?.assets || [])
    if (
      !/^data:image\/(?:png|jpeg|webp);base64,/i.test(asset?.dataUrl || '') ||
      String(asset.dataUrl).length > MAX_ASSET_BYTES * 1.4
    )
      errors.push('Backup contains an invalid or oversized asset.');
  if (backup?.integrity?.digest) {
    const unsigned = clone(backup);
    unsigned.integrity.digest = '';
    if ((await sha256(stableStringify(unsigned))) !== backup.integrity.digest) errors.push('Backup integrity check failed.');
  } else errors.push('Backup has no integrity digest.');
  return {
    valid: errors.length === 0,
    errors,
    warnings: backup?.manifest?.warnings || [],
    backup: errors.length ? null : (sanitize(backup) as Backup),
  };
}

// ---- Guest restore (device storage) ----

export type GuestOperation = { section: string; key: string; value: unknown };
export type GuestPlan = {
  strategy: 'merge';
  scope: 'guest';
  operations: GuestOperation[];
  conflicts: { section: string; id: string | null; resolution: 'kept-existing' }[];
  writesApplied: boolean;
};

export function buildGuestMergePlan(backup: Backup, storage: Pick<Storage, 'getItem'>): GuestPlan {
  const operations: GuestOperation[] = [];
  const conflicts: GuestPlan['conflicts'] = [];
  for (const [section, key] of Object.entries(GUEST_KEYS)) {
    if (!(section in (backup.data || {}))) continue;
    let existing: unknown = null;
    try {
      existing = JSON.parse(storage.getItem(key) as string);
    } catch {
      existing = storage.getItem(key);
    }
    const incoming = clone(backup.data[section]);
    if (Array.isArray(existing) && Array.isArray(incoming)) {
      const existingList = existing as Row[];
      const byId = new Map<string, unknown>(existingList.map((record) => [String(record?.id), record]));
      (incoming as Row[]).forEach((record) => {
        const id = String(record?.id || '');
        if (id && byId.has(id)) conflicts.push({ section, id, resolution: 'kept-existing' });
        else if (id) byId.set(id, record);
        else existingList.push(record);
      });
      operations.push({ section, key, value: [...byId.values(), ...existingList.filter((record) => !record?.id)] });
    } else if (existing && isPlainObject(existing) && isPlainObject(incoming))
      operations.push({ section, key, value: { ...incoming, ...existing } });
    else if (existing != null) conflicts.push({ section, id: null, resolution: 'kept-existing' });
    else operations.push({ section, key, value: incoming });
  }
  return { strategy: 'merge', scope: 'guest', operations, conflicts, writesApplied: false };
}

/** The key/value writes a guest plan makes, serialized as the website does. */
export function guestWrites(plan: GuestPlan): [string, string][] {
  return plan.operations.map((operation) => [
    operation.key,
    typeof operation.value === 'string' ? operation.value : JSON.stringify(operation.value),
  ]);
}

// ---- Account restore (Supabase) ----

export function flattenCloudData(data: Record<string, unknown>): Record<string, Row[]> {
  const tables: Record<string, Row[]> = {};
  Object.values(data || {}).forEach((section) => {
    if (section && typeof section === 'object' && !Array.isArray(section))
      Object.entries(section).forEach(([table, rows]) => {
        if (Array.isArray(rows)) tables[table] = rows as Row[];
      });
  });
  return tables;
}

/** The few database calls restore planning and writing need; see cloud.ts. */
export type CloudRestoreDb = {
  existingIds: (table: string, userId: string, ids: string[]) => Promise<string[]>;
  hasSettingsRow: (userId: string) => Promise<boolean>;
  insert: (table: string, rows: Row[]) => Promise<{ error: unknown }>;
};

export type CloudOperation = { table: string; rows: Row[] };
export type CloudPlan = {
  strategy: 'merge';
  scope: 'authenticated-user';
  userId: string;
  operations: CloudOperation[];
  conflicts: { table: string; id: unknown; resolution: 'kept-existing' }[];
  writesApplied: boolean;
  completedStages: string[];
  failedStage?: string | null;
  error?: string | null;
};

export async function buildCloudMergePlan(backup: Backup, db: CloudRestoreDb, userId: string): Promise<CloudPlan> {
  if (!userId) throw new Error('A current account is required for cloud restore.');
  const tables = flattenCloudData(backup.data);
  const operations: CloudOperation[] = [];
  const conflicts: CloudPlan['conflicts'] = [];
  for (const table of RESTORE_ORDER) {
    const rows = tables[table] || [];
    if (!rows.length) continue;
    if (table === 'user_settings') {
      // user_settings is keyed by user_id and has no id column, so the
      // id lookup below can't see an existing row. Keep the current settings
      // when there are any, as every other matching record is kept.
      if (await db.hasSettingsRow(userId)) {
        conflicts.push({ table, id: userId, resolution: 'kept-existing' });
        operations.push({ table, rows: [] });
      } else operations.push({ table, rows: [{ ...(sanitize(rows[0]) as Row), user_id: userId }] });
      continue;
    }
    const ids = rows.map((row) => row.id).filter(Boolean).map(String);
    const existing = new Set<string>();
    for (let index = 0; index < ids.length; index += 200) {
      (await db.existingIds(table, userId, ids.slice(index, index + 200))).forEach((id) => existing.add(String(id)));
    }
    const insert = rows
      .filter((row) => !row.id || !existing.has(String(row.id)))
      .map((row) => ({ ...(sanitize(row) as Row), user_id: userId }));
    rows
      .filter((row) => row.id && existing.has(String(row.id)))
      .forEach((row) => conflicts.push({ table, id: row.id, resolution: 'kept-existing' }));
    operations.push({ table, rows: insert });
  }
  return { strategy: 'merge', scope: 'authenticated-user', userId, operations, conflicts, writesApplied: false, completedStages: [] };
}

export async function applyCloudMergePlan(
  plan: CloudPlan,
  db: CloudRestoreDb,
  options: {
    completedStages?: string[];
    onProgress?: (message: string) => void;
    onStageComplete?: (table: string, stages: string[]) => void | Promise<void>;
  } = {},
): Promise<CloudPlan> {
  const completed = new Set(options.completedStages || plan.completedStages || []);
  for (const operation of plan.operations) {
    if (completed.has(operation.table) || !operation.rows.length) {
      completed.add(operation.table);
      continue;
    }
    options.onProgress?.(`Restoring ${operation.table}…`);
    const { error } = await db.insert(operation.table, operation.rows);
    if (error)
      return {
        ...plan,
        writesApplied: true,
        completedStages: [...completed],
        failedStage: operation.table,
        error: 'Restore stopped safely before the next stage.',
      };
    completed.add(operation.table);
    await options.onStageComplete?.(operation.table, [...completed]);
  }
  return { ...plan, writesApplied: true, completedStages: [...completed], failedStage: null, error: null };
}

// ---- Presentation helpers (from js/sanctuary-backup-ui.js) ----

export function backupFileName(prefix = 'salt-and-sovereignty-backup', now = new Date()): string {
  return `${prefix}-${now.toISOString().slice(0, 10)}.json`;
}

export function countSummary(backup: Pick<Backup, 'manifest'>): string {
  return Object.entries(backup.manifest.recordCounts)
    .map(([name, count]) => `${count} ${name}`)
    .join(' · ');
}

/** The Book of Shadows subset, as the website's "Export Book of Shadows". */
export function bookOnlyData(data: Record<string, unknown>, signedIn: boolean): Record<string, unknown> {
  if (signedIn) {
    const rituals = (data.rituals || {}) as Record<string, unknown>;
    return {
      grimoire: data.grimoire || {},
      rituals: { user_rituals: rituals.user_rituals || [], ritual_links: rituals.ritual_links || [] },
    };
  }
  return { ritualJournals: data.ritualJournals || [], mundaneMode: data.mundaneMode ?? false };
}
