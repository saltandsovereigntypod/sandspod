import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

import { builtInCabinet, overrideKey } from '../src/lib/altar/cabinet.ts';
import { backgroundRow, overrideLabel, overrideRow } from '../src/lib/altar/customImages.ts';
import { GUEST_KEYS } from '../src/lib/backup/format.ts';
import {
  applyPlan,
  buildPlan,
  createPreview,
  deterministicUuid,
  keysToClear,
  movingSummary,
  rowsByTable,
  snapshotFingerprint,
  stripBrowserAssets,
  worthMoving,
  type MigrationDb,
} from '../src/lib/backup/migration.ts';
import {
  beginSave,
  cloudStatus,
  emptySync,
  endSave,
  formatLastSync,
  isOfflineMessage,
  lastSyncKey,
  reportSource,
  statusLabel,
  type CloudStatus,
} from '../src/lib/sync/status.ts';

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------- uploads

/** The website's altar/js/features/custom-images.js, run in a sandbox for its key function. */
function websiteCustomImages() {
  const context: Record<string, unknown> = {};
  vm.runInNewContext(readFileSync(new URL('../../altar/js/features/custom-images.js', import.meta.url), 'utf8'), context);
  return context as { getCabinetImageOverrideKey: (data: Record<string, string>) => string };
}

test('cabinet picture overrides use the website key and row', () => {
  const site = websiteCustomImages();
  const candle = builtInCabinet.find((item) => item.id === 'candles:red-candle')!;
  const taper = candle.forms.find((form) => form.form === 'taper')!;
  const key = (item: typeof candle, form: typeof taper) =>
    site.getCabinetImageOverrideKey({
      label: overrideLabel(item, form),
      type: form.type || '',
      herb: form.herb || '',
      form: form.form || '',
      color: form.color || '',
      crystal: form.crystal || '',
      tool: form.tool || '',
      vessel: form.vessel || '',
      deity: form.deity || '',
    });
  assert.equal(overrideKey(candle, taper), key(candle, taper));
  const athame = builtInCabinet.find((item) => item.name === 'Athame')!;
  assert.equal(overrideKey(athame, athame.forms[0]), key(athame, athame.forms[0]));
  assert.equal(overrideLabel(athame, athame.forms[0]), 'Athame');

  assert.deepEqual(overrideRow('u1', candle, taper, 'https://x/a.png', 'u1/cabinet/a.png', '2026-10-12T00:00:00.000Z'), {
    user_id: 'u1',
    override_key: key(candle, taper),
    image_url: 'https://x/a.png',
    storage_path: 'u1/cabinet/a.png',
    metadata: { label: 'Red Candle Taper Candle', type: 'candle', form: 'taper' },
    updated_at: '2026-10-12T00:00:00.000Z',
  });
});

test('an uploaded background is the row the website inserts', () => {
  assert.deepEqual(backgroundRow('u1', '  Moon Garden ', 'https://x/b.webp', 'u1/backgrounds/b.webp'), {
    user_id: 'u1',
    name: 'Moon Garden',
    icon: '🖼️',
    keywords: ['custom', 'uploaded', 'background'],
    image_url: 'https://x/b.webp',
    storage_path: 'u1/backgrounds/b.webp',
  });
});

// ---------------------------------------------------------------- sync status

function websiteAccountUi() {
  const context: Record<string, unknown> = {};
  vm.runInNewContext(readFileSync(new URL('../../js/account-data-ui.js', import.meta.url), 'utf8'), context);
  return (context as { SaltAccountDataUI: { statusLabel: (s: string) => string; formatSync: (v: string | null) => string } }).SaltAccountDataUI;
}

test('sync wording matches the website', () => {
  const site = websiteAccountUi();
  for (const status of ['connected', 'saving', 'saved', 'offline', 'unavailable', 'guest'] as CloudStatus[])
    assert.equal(statusLabel(status), site.statusLabel(status));
  assert.equal(formatLastSync(null), site.formatSync(null));
  assert.equal(lastSyncKey('abc'), 'saltAndSovereigntyLastCloudSync:abc');
});

test('a save queue finishing counts as a successful sync', () => {
  let model = emptySync('u1');
  assert.equal(cloudStatus(model), 'connected');
  model = reportSource(model, 'altar', 'saving', 't1');
  assert.equal(cloudStatus(model), 'saving');
  model = reportSource(model, 'altar', 'idle', 't2');
  assert.equal(cloudStatus(model), 'saved');
  assert.equal(model.lastSuccess, 't2');
  // Offline then refused: neither is a success.
  model = reportSource(model, 'grimoire', 'saving', 't3');
  model = reportSource(model, 'grimoire', 'offline', 't4');
  assert.equal(cloudStatus(model), 'offline');
  assert.equal(model.lastSuccess, 't2');
  model = reportSource(model, 'grimoire', 'error', 't5');
  assert.equal(cloudStatus(model), 'error');
  assert.equal(cloudStatus(emptySync(null)), 'guest');
});

test('one-off saves report saving, saved and failures', () => {
  let model = beginSave(emptySync('u1'));
  assert.equal(cloudStatus(model), 'saving');
  model = endSave(model, 'ok', 't1');
  assert.equal(cloudStatus(model), 'saved');
  model = endSave(beginSave(model), 'unavailable', 't2');
  assert.equal(cloudStatus(model), 'unavailable');
  assert.equal(model.lastSuccess, 't1');
  assert.equal(model.pending, 0);
  assert.ok(isOfflineMessage('TypeError: Network request failed'));
  assert.ok(!isOfflineMessage('new row violates row-level security policy'));
});

// ---------------------------------------------------------------- guest migration

const websiteBackup = require('../../js/sanctuary-backup.js');
(globalThis as Record<string, unknown>).SanctuaryBackup = websiteBackup;
const websiteMigration = require('../../js/guest-account-migration.js');

const storage = (values: Record<string, unknown>) => {
  const map = new Map(Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]));
  return { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => void map.set(key, value), removeItem: (key: string) => void map.delete(key) };
};

const guest = () =>
  storage({
    [GUEST_KEYS.settings]: { preferred_name: 'Ash', default_altar_background: 'Forest Altar', grimoire_page_font: 'handwritten' },
    [GUEST_KEYS.altars]: [
      { id: '1712345678901', name: 'Moon altar', background: '/assets/altar/backgrounds/forest-scene.png', objects: [{ imagePath: 'data:image/png;base64,AAAA', label: 'Mine' }] },
      { id: '6f1c2f9e-1d2b-4c3a-9b8e-7a6d5c4b3a21', name: 'Second', objects: [] },
    ],
    [GUEST_KEYS.altarDraft]: { id: 'working-draft', objects: [] },
    [GUEST_KEYS.livingLibrary]: {
      entities: {
        e1: { id: 'e1', name: 'Rosemary', type: 'herb', myPractice: { Notes: 'Protection' } },
        e2: { id: 'e2', name: 'Plain', type: 'herb' },
        e3: { id: 'e3', name: 'Salt', type: 'mineral', image: 'https://example.com/salt.png' },
      },
      relations: [
        { from: 'e1', relation: 'pairs_with', to: 'e3' },
        { from: 'e2', relation: 'pairs_with', to: 'x' },
      ],
    },
    [GUEST_KEYS.apothecary]: [
      { id: 'apo-1', name: 'Jar', type: 'spell-jar', typeLabel: 'Spell Jar', imagePath: '../assets/x.png', ingredients: [{ name: 'Salt' }], logToGrimoire: true, entityId: 'e1' },
    ],
    [GUEST_KEYS.customCabinet]: [
      {
        id: 'b7e1c0de-0000-4000-8000-000000000001',
        category: 'crystals',
        name: 'Beach stone',
        keywords: ['sea'],
        entityId: 'e1',
        forms: [{ label: 'Tumbled Stone', image: 'https://example.com/u1/custom-cabinet-items/s.jpg', type: 'crystal', form: 'tumbled-stone', storagePath: 'u1/custom-cabinet-items/s.jpg' }],
      },
    ],
  });

const plain = (value: unknown) => JSON.parse(JSON.stringify(value));

test('the preview counts and fingerprint match the website', async () => {
  const ours = await createPreview(guest());
  const theirs = await websiteMigration.createPreview(guest());
  assert.deepEqual(ours.counts, plain(theirs.counts));
  assert.equal(ours.digest, theirs.digest);
  assert.equal(ours.fingerprint, theirs.fingerprint);
  assert.equal(snapshotFingerprint(ours.data), websiteMigration.snapshotFingerprint(theirs.data));
  assert.deepEqual(ours.unsupported, theirs.unsupported);
  assert.ok(worthMoving(ours.counts));
  assert.deepEqual(movingSummary(ours.counts), ['2 altar layouts', '2 Living Library entries', '1 Apothecary item', '1 custom Cabinet item']);
});

test('settings alone are not worth offering to move', async () => {
  const preview = await createPreview(storage({ [GUEST_KEYS.settings]: { preferred_name: 'Ash' } }));
  assert.equal(preview.counts.settings, 1);
  assert.equal(worthMoving(preview.counts), false);
});

test('deterministic ids match the website', async () => {
  for (const id of ['1712345678901', 'apo-1', ''])
    assert.equal(await deterministicUuid('saved_altars', id), await websiteMigration.deterministicUuid('saved_altars', id));
});

test('the rows match the website’s rowsByTable', async () => {
  const selected = ['settings', 'altars', 'livingLibrary', 'apothecary', 'custom'];
  const ours = await rowsByTable(await createPreview(guest()), selected, 'u1', 'NOW');
  const theirs = await websiteMigration.rowsByTable(await websiteMigration.createPreview(guest()), selected, 'u1');
  const withoutTime = (rows: Record<string, Record<string, unknown>[]>) => {
    const copy = plain(rows);
    for (const row of copy.user_settings ?? []) delete row.updated_at;
    for (const row of copy.custom_cabinet_items ?? []) delete row.storage_paths;
    return copy;
  };
  assert.deepEqual(withoutTime(ours.rows), withoutTime(theirs.rows));
  assert.deepEqual(ours.warnings, theirs.warnings);
  // The one difference: the app keeps the storage paths of pictures it uploaded for the guest.
  assert.deepEqual(theirs.rows.custom_cabinet_items[0].storage_paths, []);
  assert.deepEqual(ours.rows.custom_cabinet_items[0].storage_paths, ['u1/custom-cabinet-items/s.jpg']);
});

test('pictures only the phone can open are dropped', () => {
  const warnings: string[] = [];
  assert.deepEqual(stripBrowserAssets({ a: 'file:///x.png', b: 'https://x/y.png' }, warnings), { a: '', b: 'https://x/y.png' });
  assert.equal(warnings.length, 1);
});

/** A pretend account: rows by table, keyed like Supabase. */
function fakeDb(existing: Record<string, Record<string, unknown>[]> = {}, failOn?: string) {
  const tables: Record<string, Record<string, unknown>[]> = plain(existing);
  const db: MigrationDb = {
    async existingKeys(table, key, userId, values) {
      return (tables[table] ?? []).filter((row) => row.user_id === userId && values.includes(String(row[key]))).map((row) => String(row[key]));
    },
    async relationKeys(userId) {
      return (tables.library_relations ?? []).filter((row) => row.user_id === userId).map((row) => `${row.from_entity_id}|${row.relation}|${row.to_entity_id}`);
    },
    async insert(table, rows) {
      if (table === failOn) return { error: { message: 'nope' } };
      tables[table] = [...(tables[table] ?? []), ...plain(rows)];
      return { error: null };
    },
  };
  return { db, tables };
}

test('a migration keeps what the account already has and verifies what it wrote', async () => {
  const preview = await createPreview(guest());
  const selected = ['settings', 'altars', 'livingLibrary', 'apothecary', 'custom'];
  const { db, tables } = fakeDb({
    user_settings: [{ user_id: 'u1', preferred_name: 'Cloud' }],
    saved_altars: [{ id: '6f1c2f9e-1d2b-4c3a-9b8e-7a6d5c4b3a21', user_id: 'u1', name: 'Already there' }],
  });
  const plan = await buildPlan(preview, selected, db, 'u1');
  assert.deepEqual(
    plan.conflicts.map((c) => c.table),
    ['user_settings', 'saved_altars'],
  );
  const stages: string[][] = [];
  const result = await applyPlan(plan, db, {
    currentDigest: async () => preview.digest,
    currentUserId: () => 'u1',
    onStageComplete: (done) => void stages.push(done),
  });
  assert.equal(result.complete, true);
  assert.equal(tables.user_settings[0].preferred_name, 'Cloud');
  assert.equal(tables.saved_altars.length, 2);
  assert.equal(tables.living_library_entries.length, 2);
  assert.equal(tables.library_relations.length, 1);
  assert.equal(tables.apothecary_items.length, 1);
  assert.equal(tables.custom_cabinet_items.length, 1);
  assert.ok(stages.length > 0);
  assert.deepEqual(keysToClear(selected), [GUEST_KEYS.altars, GUEST_KEYS.apothecary, GUEST_KEYS.customCabinet, GUEST_KEYS.livingLibrary]);
});

test('a failed stage stops the migration and reports it', async () => {
  const preview = await createPreview(guest());
  const { db } = fakeDb({}, 'apothecary_items');
  const plan = await buildPlan(preview, ['altars', 'apothecary'], db, 'u1');
  const result = await applyPlan(plan, db, { currentDigest: async () => preview.digest, currentUserId: () => 'u1' });
  assert.equal(result.complete, false);
  assert.equal(result.failedStage, 'apothecary_items');
  await assert.rejects(
    applyPlan(plan, db, { currentDigest: async () => 'changed', currentUserId: () => 'u1' }),
    /Guest data changed/,
  );
  await assert.rejects(
    applyPlan(plan, db, { currentDigest: async () => preview.digest, currentUserId: () => 'someone-else' }),
    /signed-in account changed/,
  );
});
