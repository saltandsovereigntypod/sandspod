import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import {
  buildGuestMergePlan,
  CLOUD_SECTIONS,
  collectGuest,
  createBackup,
  CRAFT_PREFIX,
  GUEST_KEYS,
  guestWrites,
  RESTORE_ORDER,
  validateBackup,
  WEBSITE_CRAFT_PREFIX,
} from '../src/lib/backup/format.ts';
import { createPreview } from '../src/lib/backup/migration.ts';

// The website's own modules, so we can prove both sides agree.
const require = createRequire(import.meta.url);
const website = require('../../js/sanctuary-backup.js');
(globalThis as Record<string, unknown>).SanctuaryBackup = website;
const websiteMigration = require('../../js/guest-account-migration.js');

const entry = (id: string, data: unknown, extra: Record<string, unknown> = {}) => ({
  id,
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
  data,
  ...extra,
});

const plans = [
  { id: '7d2f1c3e-0000-4000-8000-000000000001', date: '2026-10-31', time: '21:00', title: 'Samhain', intention: 'remembrance', ingredients: [], createdAt: '2026-10-01T10:00:00.000Z', doneAt: null },
  { id: '7d2f1c3e-0000-4000-8000-000000000002', date: '2026-11-05', time: '20:00', title: 'Already in an account', ingredients: [], syncedTo: 'someone' },
];

/** A storage that can list its keys, as AsyncStorage and localStorage can. */
const storage = (prefix: string) => {
  const map = new Map<string, string>([
    [GUEST_KEYS.settings, JSON.stringify({ preferred_name: 'Ash' })],
    [GUEST_KEYS.ritualPlans, JSON.stringify(plans)],
    [`${prefix}green.plants`, JSON.stringify([entry('11111111-1111-4111-8111-111111111111', { name: 'Rosemary' }), entry('x-synced', { name: 'Theirs' }, { syncedTo: 'acct' })])],
    [`${prefix}hedge.dreams`, JSON.stringify([entry('22222222-2222-4222-8222-222222222222', { text: 'A river' })])],
    ['unrelated', 'keep me out'],
  ]);
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    keys: () => [...map.keys()],
    get length() {
      return map.size;
    },
    key: (index: number) => [...map.keys()][index] ?? null,
  };
};

test('account backups gather craft_entries and ritual_plans, restored after their templates', () => {
  assert.ok(CLOUD_SECTIONS.practice.includes('craft_entries'));
  assert.ok(CLOUD_SECTIONS.rituals.includes('ritual_plans'));
  assert.ok(RESTORE_ORDER.indexOf('ritual_plans') > RESTORE_ORDER.indexOf('ritual_templates'));
  assert.ok(RESTORE_ORDER.includes('craft_entries'));
  assert.deepEqual(website.CLOUD_SECTIONS, JSON.parse(JSON.stringify(CLOUD_SECTIONS)));
  assert.deepEqual([...website.RESTORE_ORDER], [...RESTORE_ORDER]);
  assert.equal(website.GUEST_KEYS.ritualPlans, GUEST_KEYS.ritualPlans);
});

test('a guest backup holds the guest’s own practice entries and plans, the same on both sides', async () => {
  const ours = collectGuest(storage(CRAFT_PREFIX));
  const theirs = website.collectGuest(storage(WEBSITE_CRAFT_PREFIX));
  const craft = ours.craftEntries as Record<string, { id: string }[]>;
  assert.deepEqual(Object.keys(craft), ['green.plants', 'hedge.dreams']);
  assert.deepEqual(craft['green.plants'].map((e) => e.id), ['11111111-1111-4111-8111-111111111111']);
  assert.deepEqual((ours.ritualPlans as { title: string }[]).map((p) => p.title), ['Samhain']);
  const options = { createdAt: '2026-10-16T00:00:00.000Z', scope: 'guest-browser' };
  const a = await createBackup(ours, options);
  const b = await website.createBackup(theirs, options);
  assert.equal(a.integrity.digest, b.integrity.digest);
  assert.deepEqual((await validateBackup(JSON.stringify(b))).errors, []);
  assert.deepEqual((await website.validateBackup(JSON.stringify(a))).errors, []);
});

test('restoring a guest backup merges each collection into its own key and keeps what is there', async () => {
  const backup = await createBackup(collectGuest(storage(CRAFT_PREFIX)), { scope: 'guest-browser' });
  const here = storage(CRAFT_PREFIX);
  here.map.set(`${CRAFT_PREFIX}green.plants`, JSON.stringify([entry('11111111-1111-4111-8111-111111111111', { name: 'Mine already' })]));
  here.map.delete(`${CRAFT_PREFIX}hedge.dreams`);
  const plan = buildGuestMergePlan(backup, here);
  const writes = Object.fromEntries(guestWrites(plan));
  assert.equal(writes[`${CRAFT_PREFIX}green.plants`], undefined, 'nothing new for the plants');
  assert.deepEqual(JSON.parse(writes[`${CRAFT_PREFIX}hedge.dreams`]).map((e: { id: string }) => e.id), ['22222222-2222-4222-8222-222222222222']);
  assert.ok(plan.conflicts.some((c) => c.section === 'craftEntries'));
  // The website writes the same collections under its own prefix.
  const web = website.buildGuestMergePlan(website.sanitize(JSON.parse(JSON.stringify(backup))), storage(WEBSITE_CRAFT_PREFIX));
  assert.ok(web.operations.every((op: { key: string }) => !op.key.startsWith(CRAFT_PREFIX) || op.key.startsWith(WEBSITE_CRAFT_PREFIX)));
});

test('the guest preview counts practice tools and plans the same as the website', async () => {
  const ours = await createPreview(storage(CRAFT_PREFIX));
  const theirs = await websiteMigration.createPreview(storage(WEBSITE_CRAFT_PREFIX));
  assert.equal(ours.counts.practice, 3);
  assert.deepEqual(ours.counts, JSON.parse(JSON.stringify(theirs.counts)));
  assert.equal(ours.digest, theirs.digest);
});
