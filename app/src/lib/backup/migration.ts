// Bringing guest work on this device into the signed-in account, ported from
// the website's js/guest-account-migration.js: the same preview counts, the
// same rows (with the same deterministic ids for guest records that don't
// have a UUID yet), the same stage order, and cloud records always kept when
// they already exist. Keep this file in step with the website's copy.
//
// Two differences, both because guest data here lives in the app: pictures a
// guest added are files on the phone, which the app uploads first (see
// migrate.ts) rather than dropping them as browser-only; and once everything
// is verified in the account, the guest copy of what moved is cleared.

import {
  collectCraft,
  collectGuest,
  CRAFT_SECTION,
  createBackup,
  findAssetReferences,
  GUEST_KEYS,
  ownGuestRecords,
  sanitize,
  scanForbidden,
  stableStringify,
  validateBackup,
  type GuestStorage,
  type Row,
} from './format.ts';
import { sha256 } from './sha256.ts';

export const DISMISS_PREFIX = 'saltAndSovereigntyGuestMigrationDismissed';
export const CHECKPOINT_PREFIX = 'saltAndSovereigntyGuestMigration';

export type CategoryId = 'settings' | 'altars' | 'grimoire' | 'livingLibrary' | 'apothecary' | 'rituals' | 'custom' | 'practice';

export const CATEGORIES: readonly { id: CategoryId; label: string; sections: string[] }[] = Object.freeze([
  { id: 'settings', label: 'Settings and preferences', sections: ['settings', 'mundaneMode'] },
  { id: 'altars', label: 'Digital Altar', sections: ['altars'] },
  { id: 'grimoire', label: 'Book of Shadows', sections: [] },
  { id: 'livingLibrary', label: 'Living Library', sections: ['livingLibrary', 'livingLibraryLayouts'] },
  { id: 'apothecary', label: 'Apothecary', sections: ['apothecary'] },
  { id: 'rituals', label: 'Rituals and templates', sections: ['ritualJournals', 'ritualLifecycle'] },
  { id: 'custom', label: 'Custom images and Cabinet items', sections: ['customCabinet'] },
  // The website moves these itself; the app's own stores send a guest's to the account on sign-in.
  { id: 'practice', label: 'Practice tools and planned rituals', sections: ['craftEntries', 'ritualPlans'] },
]);

export const STAGE_ORDER = Object.freeze([
  'user_settings',
  'living_library_entries',
  'ritual_templates',
  'ritual_template_steps',
  'ritual_sessions',
  'ritual_session_steps',
  'user_rituals',
  'apothecary_items',
  'saved_altars',
  'custom_cabinet_items',
  'library_relations',
]);

export const TABLE_KEYS: Readonly<Record<string, string | null>> = Object.freeze({
  user_settings: 'user_id',
  living_library_entries: 'entity_id',
  library_relations: null,
  saved_altars: 'id',
  apothecary_items: 'id',
  custom_cabinet_items: 'id',
  ritual_templates: 'id',
  ritual_template_steps: 'id',
  ritual_sessions: 'id',
  ritual_session_steps: 'id',
  user_rituals: 'id',
});

const UUID_ID_TABLES = new Set([
  'saved_altars',
  'apothecary_items',
  'custom_cabinet_items',
  'ritual_templates',
  'ritual_template_steps',
  'ritual_sessions',
  'ritual_session_steps',
  'user_rituals',
]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const clone = <T>(value: T): T => (value == null ? value : JSON.parse(JSON.stringify(value)));

type Data = Record<string, unknown>;
type Storage = GuestStorage;

export function hasValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return value !== null && value !== undefined && value !== '' && value !== false;
}

/** The guest keys, parsed and cleaned (readGuestData). */
export const readGuestData = (storage: Storage): Data => collectGuest(storage);

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

export function isPersonalEntity(entity: unknown): boolean {
  const e = asRecord(entity);
  const metadata = asRecord(e.metadata);
  return Boolean(
    e.image ||
      Object.keys(asRecord(e.myPractice)).length ||
      Object.keys(asRecord(e.community)).length ||
      metadata.custom ||
      metadata.ritualId ||
      metadata.ritualTemplateId,
  );
}

const countLibrary = (value: unknown) => Object.values(asRecord(asRecord(value).entities)).filter(isPersonalEntity).length;
const countRituals = (value: unknown, journals: unknown) =>
  (Array.isArray(journals) ? journals.length : 0) + (Array.isArray(asRecord(value).sessions) ? (asRecord(value).sessions as unknown[]).length : 0);
const countPractice = (data: Data) =>
  Object.values(asRecord(data[CRAFT_SECTION])).reduce<number>((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0) +
  (Array.isArray(data.ritualPlans) ? data.ritualPlans.length : 0);
const countAssets = (data: Data) => findAssetReferences(data).filter((url) => /^data:image\//i.test(url)).length;

/** Same as the website's snapshotFingerprint: FNV-1a over the cleaned data. */
export function snapshotFingerprint(data: Data): string {
  const text = stableStringify(sanitize(data));
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${text.length}-${(hash >>> 0).toString(16)}`;
}

export const sourceDigest = (data: Data) => sha256(stableStringify(sanitize(data)));

export type Counts = Record<CategoryId | 'assets', number>;
export type Preview = {
  digest: string;
  fingerprint: string;
  data: Data;
  counts: Counts;
  unsupported: string[];
  categories: { id: CategoryId; label: string; sections: string[]; selected: boolean; supported: boolean }[];
};

/** What the app moves itself. Rituals have their own bring-over (rituals/store.ts). */
export const APP_CATEGORIES: readonly CategoryId[] = ['settings', 'altars', 'livingLibrary', 'apothecary', 'custom'];

export async function createPreview(storage: Storage): Promise<Preview> {
  const raw: Data = {};
  for (const [section, key] of Object.entries(GUEST_KEYS)) {
    const value = storage.getItem(key);
    if (value == null) continue;
    try {
      raw[section] = JSON.parse(value);
    } catch {
      raw[section] = value;
    }
  }
  // Practice tools and planned rituals, as the website reads them: only a guest's own.
  if (Array.isArray(raw.ritualPlans)) raw.ritualPlans = ownGuestRecords(raw.ritualPlans);
  const craft = collectCraft(storage);
  if (Object.keys(craft).length) raw[CRAFT_SECTION] = craft;
  const securityErrors: string[] = [];
  scanForbidden(raw, securityErrors, 'guest');
  if (securityErrors.some((message) => !/\.(?:user_id|owner_id|created_by)$/.test(message)))
    throw new Error('Guest data contains fields that cannot be migrated safely.');
  const data = sanitize(raw) as Data;
  const digest = await sourceDigest(data);
  const counts: Counts = {
    settings: hasValue(data.settings) || hasValue(data.mundaneMode) ? 1 : 0,
    altars: Array.isArray(data.altars) ? data.altars.length : 0,
    grimoire: 0,
    livingLibrary: countLibrary(data.livingLibrary),
    apothecary: Array.isArray(data.apothecary) ? data.apothecary.length : 0,
    rituals: countRituals(data.ritualLifecycle, data.ritualJournals),
    custom: Array.isArray(data.customCabinet) ? data.customCabinet.length : 0,
    practice: countPractice(data),
    assets: countAssets(data),
  };
  const unsupported: string[] = [];
  if (hasValue(data.altarDraft)) unsupported.push('The working Altar draft remains local; migrate a named saved Altar instead.');
  if (counts.grimoire === 0) unsupported.push('This version has no independently restorable guest Book of Shadows table records to migrate.');
  if (counts.assets)
    unsupported.push(`${counts.assets} browser-embedded image${counts.assets === 1 ? '' : 's'} require manual review and are not uploaded automatically.`);
  return {
    digest,
    fingerprint: snapshotFingerprint(data),
    data,
    counts,
    unsupported,
    categories: CATEGORIES.map((category) => ({
      ...category,
      selected: category.id !== 'grimoire' && counts[category.id] > 0,
      supported: category.id !== 'grimoire',
    })),
  };
}

/**
 * Whether to offer the move. Settings alone don't count: on the phone that
 * key also holds a signed-in person's own settings. (The website also counts
 * them when the browser was marked as a guest's.)
 */
export function worthMoving(counts: Counts): boolean {
  return counts.altars + counts.livingLibrary + counts.apothecary + counts.custom > 0;
}

export async function deterministicUuid(namespace: string, id: string): Promise<string> {
  const hex = (await sha256(`${namespace}:${id}`)).slice(0, 32).split('');
  hex[12] = '4';
  hex[16] = ['8', '9', 'a', 'b'][parseInt(hex[16], 16) % 4];
  return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20).join('')}`;
}

/**
 * Drops pictures only this device can open. The website drops data: and blob:
 * URLs; the app also drops file:// ones (pictures it couldn't upload).
 */
export function stripBrowserAssets(value: unknown, warnings: string[], path = 'record'): unknown {
  if (Array.isArray(value)) return value.map((item, index) => stripBrowserAssets(item, warnings, `${path}[${index}]`));
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && (/^data:image\//i.test(value) || /^blob:/i.test(value) || /^file:/i.test(value))) {
      warnings.push(`A browser-only image was omitted at ${path}.`);
      return '';
    }
    return value;
  }
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, stripBrowserAssets(child, warnings, `${path}.${key}`)]));
}

const str = (value: unknown) => (value == null ? '' : String(value));
const isHttp = (value: unknown) => /^https?:\/\//i.test(str(value));

function libraryRows(library: unknown, userId: string, warnings: string[]) {
  const lib = asRecord(library);
  const entities = Object.values(asRecord(lib.entities))
    .filter(isPersonalEntity)
    .map((value) => {
      const entity = asRecord(value);
      return {
        user_id: userId,
        entity_id: entity.id,
        name: entity.name || 'Untitled',
        type: entity.type || 'note',
        image: isHttp(entity.image) ? entity.image : null,
        my_practice: stripBrowserAssets(entity.myPractice || {}, warnings),
        community: stripBrowserAssets(entity.community || {}, warnings),
        layout: {},
      };
    });
  const migratedIds = new Set(entities.map((entity) => entity.entity_id));
  const relations = (Array.isArray(lib.relations) ? lib.relations : [])
    .map(asRecord)
    .filter((relation) => relation.from && relation.to && relation.relation && (migratedIds.has(relation.from) || migratedIds.has(relation.to)))
    .map((relation) => ({
      user_id: userId,
      from_entity_id: relation.from,
      relation: relation.relation,
      to_entity_id: relation.to,
      metadata: relation.metadata && typeof relation.metadata === 'object' ? relation.metadata : {},
    }));
  return { entities, relations };
}

function apothecaryRow(value: unknown, userId: string, warnings: string[]): Row {
  const item = asRecord(value);
  const image = item.imagePath || item.image_url || '';
  return {
    id: item.id,
    user_id: userId,
    name: item.name || 'Untitled',
    type: item.type || '',
    type_label: item.typeLabel || '',
    image_url: isHttp(image) ? image : '',
    intention: item.intention || '',
    notes: item.notes || '',
    details: stripBrowserAssets(item.details || {}, warnings),
    ingredients: stripBrowserAssets(item.ingredients || [], warnings),
    living_state: item.livingState || item.living_state || {},
    entity_id: item.entityId || item.entity_id || '',
    instance_id: item.instanceId || item.instance_id || '',
    grimoire_entry_id: item.grimoireEntryId || '',
    grimoire_status: item.grimoireStatus || '',
    log_to_grimoire: Boolean(item.logToGrimoire),
    // "Did it work?" (metadata.lookBack) comes along.
    metadata: { ...asRecord(item.metadata), source: 'guest-migration' },
  };
}

function customCabinetRow(value: unknown, userId: string, warnings: string[]): Row {
  const item = asRecord(value);
  const forms = Array.isArray(item.forms) ? item.forms.map(asRecord) : [];
  return {
    id: item.id,
    user_id: userId,
    category: item.category || 'custom',
    name: item.name || 'Untitled',
    icon: item.icon || '✦',
    keywords: item.keywords || [],
    entity_id: item.entityId || '',
    image_url: '',
    item_type: forms[0]?.type || item.category || '',
    form_label: forms[0]?.form || 'standard',
    forms: stripBrowserAssets(item.forms || [], warnings),
    // The app fills this from the forms' uploaded pictures; the website's guests have none.
    storage_paths: forms.map((form) => form.storagePath).filter((path): path is string => typeof path === 'string' && !!path),
    metadata: { source: 'guest-migration' },
  };
}

type IdMaps = Record<string, Map<string, string>>;

async function normalizeIds(table: string, rows: Row[], maps: IdMaps): Promise<Row[]> {
  const key = TABLE_KEYS[table];
  if (!key || key === 'user_id' || !UUID_ID_TABLES.has(table)) return rows;
  maps[table] ||= new Map();
  for (const row of rows) {
    const oldId = str(row[key]);
    if (uuidPattern.test(oldId)) {
      maps[table].set(oldId, oldId);
      continue;
    }
    const next = await deterministicUuid(table, oldId || stableStringify(row));
    if (oldId) maps[table].set(oldId, next);
    row[key] = next;
  }
  return rows;
}

function remapReferences(table: string, row: Row, maps: IdMaps): Row {
  const references: Record<string, string> =
    (
      {
        ritual_template_steps: { template_id: 'ritual_templates' },
        ritual_sessions: { template_id: 'ritual_templates' },
        ritual_session_steps: { session_id: 'ritual_sessions' },
        user_rituals: { template_id: 'ritual_templates', session_id: 'ritual_sessions' },
        saved_altars: {},
        apothecary_items: { instance_id: 'object_instances' },
      } as Record<string, Record<string, string>>
    )[table] || {};
  for (const [field, target] of Object.entries(references))
    if (row[field] && maps[target]?.has(str(row[field]))) row[field] = maps[target].get(str(row[field]));
  return row;
}

/** The rows each table receives (the website's rowsByTable). */
export async function rowsByTable(preview: Pick<Preview, 'data'>, selected: readonly string[], userId: string, now = new Date().toISOString()) {
  const data = preview.data;
  const rows: Record<string, Row[]> = {};
  const warnings: string[] = [];
  const maps: IdMaps = {};
  const settings = asRecord(data.settings);
  if (selected.includes('settings') && hasValue(data.settings))
    rows.user_settings = [
      {
        user_id: userId,
        preferred_name: settings.preferred_name || '',
        pronouns: settings.pronouns || '',
        magical_name: settings.magical_name || '',
        default_mundane_mode: Boolean(settings.default_mundane_mode),
        default_altar_background: settings.default_altar_background || '',
        settings: clone(data.settings),
        updated_at: now,
      },
    ];
  if (selected.includes('livingLibrary')) {
    const library = libraryRows(data.livingLibrary, userId, warnings);
    rows.living_library_entries = library.entities;
    rows.library_relations = library.relations;
  }
  if (selected.includes('altars'))
    rows.saved_altars = (Array.isArray(data.altars) ? data.altars : []).map((value) => {
      const altar = asRecord(value);
      return { id: altar.id, user_id: userId, name: altar.name || 'Guest Altar', altar_data: stripBrowserAssets(altar, warnings) };
    });
  if (selected.includes('apothecary'))
    rows.apothecary_items = (Array.isArray(data.apothecary) ? data.apothecary : []).map((item) => apothecaryRow(item, userId, warnings));
  if (selected.includes('custom'))
    rows.custom_cabinet_items = (Array.isArray(data.customCabinet) ? data.customCabinet : []).map((item) => customCabinetRow(item, userId, warnings));
  if (selected.includes('rituals')) {
    const lifecycle = asRecord(data.ritualLifecycle);
    const list = (value: unknown) => (Array.isArray(value) ? (clone(value) as Row[]) : []);
    rows.ritual_templates = list(lifecycle.templates);
    rows.ritual_template_steps = list(lifecycle.templateSteps || lifecycle.template_steps);
    rows.ritual_sessions = list(lifecycle.sessions);
    rows.ritual_session_steps = list(lifecycle.sessionSteps || lifecycle.session_steps);
    rows.user_rituals = list(data.ritualJournals || lifecycle.journals);
    Object.values(rows)
      .flat()
      .forEach((row) => {
        if (row && typeof row === 'object') {
          delete row.user_id;
          row.user_id = userId;
        }
      });
  }
  for (const table of STAGE_ORDER) if (rows[table]?.length) await normalizeIds(table, rows[table], maps);
  for (const [table, records] of Object.entries(rows)) rows[table] = records.map((record) => remapReferences(table, record, maps));
  return { rows, maps, warnings };
}

/** The few database calls a migration needs (see migrate.ts). */
export type MigrationDb = {
  /** Which of `values` already exist in `table`'s `key` column for this person. */
  existingKeys: (table: string, key: string, userId: string, values: string[]) => Promise<string[]>;
  /** "from|relation|to" for each of this person's library_relations. */
  relationKeys: (userId: string) => Promise<string[]>;
  insert: (table: string, rows: Row[]) => Promise<{ error: unknown }>;
};

export type Stage = { table: string; key: string | null; rows: Row[] };
export type MigrationPlan = {
  operationId: string;
  userId: string;
  digest: string;
  selected: string[];
  stages: Stage[];
  conflicts: { table: string; id: unknown; classification: string; resolution: 'keep-cloud' }[];
  warnings: string[];
};

const relationKey = (row: Row) => `${str(row.from_entity_id)}|${str(row.relation)}|${str(row.to_entity_id)}`;

async function existingFor(db: MigrationDb, table: string, key: string, userId: string, records: Row[]): Promise<Set<string>> {
  const values = [...new Set(records.map((record) => str(record[key])).filter(Boolean))];
  const found = new Set<string>();
  for (let index = 0; index < values.length; index += 200)
    (await db.existingKeys(table, key, userId, values.slice(index, index + 200))).forEach((value) => found.add(str(value)));
  return found;
}

export async function buildPlan(preview: Preview, selected: readonly string[], db: MigrationDb, userId: string): Promise<MigrationPlan> {
  if (!userId) throw new Error('Sign in before planning a guest migration.');
  if (!selected.length) throw new Error('Choose at least one category to migrate.');
  const validation = await validateBackup(JSON.stringify(await createBackup(preview.data, { scope: 'guest-browser', complete: true })));
  if (!validation.valid) throw new Error('Guest data did not pass the Sanctuary safety checks.');
  const transformed = await rowsByTable(preview, selected, userId);
  const conflicts: MigrationPlan['conflicts'] = [];
  const stages: Stage[] = [];
  for (const table of STAGE_ORDER) {
    const records = transformed.rows[table] || [];
    if (!records.length) continue;
    const key = TABLE_KEYS[table];
    let insert = records;
    if (key) {
      const existing = await existingFor(db, table, key, userId, records);
      insert = records.filter((record) => !existing.has(str(record[key])));
      records
        .filter((record) => existing.has(str(record[key])))
        .forEach((record) => conflicts.push({ table, id: record[key], classification: 'cloud-record-already-exists', resolution: 'keep-cloud' }));
    } else if (table === 'library_relations') {
      const cloud = new Set(await db.relationKeys(userId));
      insert = records.filter((record) => !cloud.has(relationKey(record)));
      records
        .filter((record) => cloud.has(relationKey(record)))
        .forEach((record) => conflicts.push({ table, id: relationKey(record), classification: 'exact-match', resolution: 'keep-cloud' }));
    }
    stages.push({ table, key, rows: insert });
  }
  return {
    operationId: `guest-${preview.digest.slice(0, 16)}`,
    userId,
    digest: preview.digest,
    selected: [...selected],
    stages,
    conflicts,
    warnings: [...preview.unsupported, ...transformed.warnings],
  };
}

/** Whether every row the plan wrote is now in the account (verifyPlan). */
export async function verifyPlan(plan: MigrationPlan, db: MigrationDb): Promise<boolean> {
  try {
    for (const stage of plan.stages) {
      if (!stage.rows.length) continue;
      if (stage.table === 'library_relations') {
        const actual = new Set(await db.relationKeys(plan.userId));
        if (!stage.rows.every((row) => actual.has(relationKey(row)))) return false;
      } else if (stage.key) {
        const key = stage.key;
        const actual = await existingFor(db, stage.table, key, plan.userId, stage.rows);
        if (!stage.rows.every((row) => actual.has(str(row[key])))) return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export type MigrationResult = { complete: boolean; verified?: boolean; completedStages: string[]; failedStage?: string; message?: string };

/** Writes each stage in order, picking up after the stages a checkpoint says are done. */
export async function applyPlan(
  plan: MigrationPlan,
  db: MigrationDb,
  options: {
    currentDigest: () => Promise<string>;
    currentUserId: () => string | null;
    completedStages?: string[];
    onStageComplete?: (stages: string[]) => void | Promise<void>;
    onProgress?: (message: string) => void;
  },
): Promise<MigrationResult> {
  if (options.currentUserId() !== plan.userId) throw new Error('The signed-in account changed. Migration stopped before writing.');
  if ((await options.currentDigest()) !== plan.digest) throw new Error('Guest data changed after the safety backup. Review it and download a new backup.');
  const completed = new Set(options.completedStages || []);
  for (const stage of plan.stages) {
    if (completed.has(stage.table) || !stage.rows.length) {
      completed.add(stage.table);
      continue;
    }
    if (options.currentUserId() !== plan.userId) throw new Error('The signed-in account changed. Migration stopped safely.');
    options.onProgress?.(`Migrating ${stage.table.replaceAll('_', ' ')}…`);
    const { error } = await db.insert(stage.table, stage.rows);
    if (error)
      return {
        complete: false,
        completedStages: [...completed],
        failedStage: stage.table,
        message: 'Migration stopped safely. Guest data is unchanged; retry when the cloud is available.',
      };
    completed.add(stage.table);
    await options.onStageComplete?.([...completed]);
  }
  options.onProgress?.('Checking your migrated Sanctuary…');
  const expected = plan.stages.filter((stage) => stage.rows.length).map((stage) => stage.table);
  const verified = expected.every((table) => completed.has(table)) && (await verifyPlan(plan, db));
  if (!verified) return { complete: false, completedStages: [...completed], message: 'Migration verification did not finish. Guest data is unchanged.' };
  return { complete: true, verified: true, completedStages: [...completed] };
}

export const dismissalKey = (userId: string, fingerprint: string) => `${DISMISS_PREFIX}:${userId}:${fingerprint}`;
export const checkpointKey = (plan: Pick<MigrationPlan, 'userId' | 'digest'>) => `${CHECKPOINT_PREFIX}:${plan.userId}:${plan.digest}`;

/**
 * The guest keys to clear once a migration is verified: only those whose
 * every record is now in the account. Settings and Mundane Mode stay (on the
 * phone they are also the signed-in person's own), as do Library page
 * layouts and the working altar draft, which the website doesn't move.
 */
export function keysToClear(selected: readonly string[]): string[] {
  const keys: string[] = [];
  if (selected.includes('altars')) keys.push(GUEST_KEYS.altars);
  if (selected.includes('apothecary')) keys.push(GUEST_KEYS.apothecary);
  if (selected.includes('custom')) keys.push(GUEST_KEYS.customCabinet);
  if (selected.includes('livingLibrary')) keys.push(GUEST_KEYS.livingLibrary);
  return keys;
}

const plural = (count: number, singular: string, many = `${singular}s`) => `${count} ${count === 1 ? singular : many}`;

/** "2 altar layouts, 3 Living Library entries…" for what will move. */
export function movingSummary(counts: Counts): string[] {
  return [
    counts.altars ? plural(counts.altars, 'altar layout') : null,
    counts.livingLibrary ? plural(counts.livingLibrary, 'Living Library entry', 'Living Library entries') : null,
    counts.apothecary ? plural(counts.apothecary, 'Apothecary item') : null,
    counts.custom ? plural(counts.custom, 'custom Cabinet item') : null,
  ].filter((line): line is string => !!line);
}
