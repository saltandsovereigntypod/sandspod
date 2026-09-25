import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import {
  applyCloudMergePlan,
  backupFileName,
  bookOnlyData,
  buildCloudMergePlan,
  buildGuestMergePlan,
  collectGuest,
  countSummary,
  createBackup,
  GUEST_KEYS,
  guestWrites,
  recordCounts,
  sanitize,
  stableStringify,
  stripSignedParams,
  validateBackup,
  type CloudRestoreDb,
  type Row,
} from '../src/lib/backup/format.ts';
import { sha256Sync, utf8Bytes } from '../src/lib/backup/sha256.ts';

// The website's own backup module, so we can prove files cross both ways.
const website = createRequire(import.meta.url)('../../js/sanctuary-backup.js');

const storage = (values: Record<string, string>) => {
  const map = new Map(Object.entries(values));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    map,
  };
};

const accountData = () => ({
  settings: { user_settings: [{ preferred_name: 'Ash', settings: { grimoire_page_font: 'handwritten' } }] },
  grimoire: {
    grimoire_books: [{ id: 'b1', title: 'Book of Shadows', user_id: 'someone' }],
    grimoire_pages: [
      { id: 'p1', book_id: 'b1', title: 'Full moon · Hekate', metadata: { moon: 'Full Moon' } },
      { id: 'p2', book_id: 'b1', title: 'Rosemary & salt', metadata: {} },
    ],
  },
  community: { community_submissions: [], community_submission_messages: [] },
});

test('sha256 matches node crypto, including non-ASCII text', () => {
  assert.equal(sha256Sync(utf8Bytes('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  for (const text of ['', 'Salt & Sovereignty ✦ 🌕 moon', 'x'.repeat(1000)]) {
    assert.equal(sha256Sync(utf8Bytes(text)), createHash('sha256').update(text).digest('hex'));
  }
});

test('the app and the website compute the same digest for the same backup', async () => {
  const options = { createdAt: '2026-09-25T20:00:00.000Z', scope: 'authenticated-user', environment: 'dev' };
  const ours = await createBackup(accountData(), options);
  const theirs = await website.createBackup(accountData(), options);
  assert.equal(ours.integrity.digest, theirs.integrity.digest);
  assert.equal(stableStringify(ours), website.stableStringify(theirs));
});

test('a backup made in the app validates on the website', async () => {
  const { settings: _settings, ...withoutSettings } = accountData();
  const backup = await createBackup(withoutSettings, { scope: 'authenticated-user' });
  const result = await website.validateBackup(JSON.stringify(backup, null, 2));
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test('account backups with settings restore in the app (the website refuses its own)', async () => {
  const options = { scope: 'authenticated-user' };
  const fromWebsite = await website.createBackup(accountData(), options);
  // Known website issue: user_settings rows have no id, so its validator blocks them.
  assert.deepEqual((await website.validateBackup(JSON.stringify(fromWebsite))).errors, [
    'data.settings.user_settings[0] has an empty top-level ID.',
  ]);
  const inApp = await validateBackup(JSON.stringify(fromWebsite));
  assert.deepEqual(inApp.errors, []);
});

test('a backup made on the website validates in the app', async () => {
  const guest = storage({
    [GUEST_KEYS.settings]: JSON.stringify({ preferred_name: 'Rowan' }),
    [GUEST_KEYS.ritualJournals]: JSON.stringify([{ id: 'r1', title: 'Dark moon release' }]),
  });
  const backup = await website.createBackup(website.collectGuest(guest), { scope: 'guest-browser' });
  const result = await validateBackup(JSON.stringify(backup, null, 2));
  assert.deepEqual(result.errors, []);
  assert.equal(result.backup?.manifest.recordCounts.ritualJournals, 1);
});

test('ownership fields never leave in a backup', async () => {
  const backup = await createBackup(accountData());
  const books = (backup.data.grimoire as { grimoire_books: Row[] }).grimoire_books;
  assert.equal('user_id' in books[0], false);
  assert.equal(JSON.stringify(backup).includes('someone'), false);
});

test('tampering, partial files and wrong formats are refused', async () => {
  const backup = await createBackup(accountData());
  const tampered = JSON.parse(JSON.stringify(backup));
  tampered.data.grimoire.grimoire_pages[0].title = 'Changed';
  assert.ok((await validateBackup(JSON.stringify(tampered))).errors.includes('Backup integrity check failed.'));

  const partial = await createBackup(accountData(), { complete: false });
  assert.ok((await validateBackup(JSON.stringify(partial))).errors.some((e) => e.includes('partial')));

  assert.deepEqual((await validateBackup('not json')).errors, ['This file is not valid JSON.']);
  assert.ok((await validateBackup('{"format":"other"}')).errors.includes('This is not a Salt & Sovereignty Sanctuary backup.'));
});

test('injected ownership, tokens, scripts and duplicate ids are blocking', async () => {
  const backup = await createBackup(accountData());
  const bad = JSON.parse(JSON.stringify(backup));
  bad.data.grimoire.grimoire_pages[0].user_id = 'attacker';
  bad.data.grimoire.grimoire_pages[1].id = 'p1';
  bad.data.grimoire.grimoire_pages[1].title = '<script>alert(1)</script>';
  bad.data.grimoire.access_token = 'x';
  const { errors, valid } = await validateBackup(JSON.stringify(bad));
  assert.equal(valid, false);
  assert.ok(errors.includes('Forbidden field: grimoire.grimoire_pages.0.user_id'));
  assert.ok(errors.includes('Forbidden field: grimoire.access_token'));
  assert.ok(errors.includes('data.grimoire.grimoire_pages contains duplicate top-level ID p1.'));
  assert.ok(errors.some((e) => e.startsWith('Unsafe active content')));
});

test('record counts follow the website’s rules', () => {
  assert.deepEqual(recordCounts({ grimoire: { grimoire_pages: [1, 2], nested: { rows: [1] } }, settings: { a: 'b' } }), {
    grimoire: 3,
    settings: 0,
  });
});

test('signed links lose their secrets but keep the rest', () => {
  assert.equal(
    stripSignedParams('https://x.supabase.co/img.png?token=abc&width=200&X-Amz-Signature=1#top'),
    'https://x.supabase.co/img.png?width=200#top',
  );
  assert.equal(stripSignedParams('https://example.com/a.png'), 'https://example.com/a.png');
  assert.deepEqual(sanitize({ image: 'https://a.co/i.png?apikey=1' }), Object.assign(Object.create(null), { image: 'https://a.co/i.png' }));
});

test('guest merge keeps what is on the device, like the website', async () => {
  const device = {
    [GUEST_KEYS.ritualJournals]: JSON.stringify([{ id: 'r1', title: 'Mine' }]),
    [GUEST_KEYS.settings]: JSON.stringify({ preferred_name: 'Here' }),
  };
  const backup = await createBackup(
    collectGuest(
      storage({
        [GUEST_KEYS.ritualJournals]: JSON.stringify([
          { id: 'r1', title: 'Theirs' },
          { id: 'r2', title: 'New' },
        ]),
        [GUEST_KEYS.settings]: JSON.stringify({ preferred_name: 'There', pronouns: 'she/her' }),
        [GUEST_KEYS.mundaneMode]: 'true',
      }),
    ),
  );
  const ours = buildGuestMergePlan(backup, storage(device));
  const theirs = website.buildGuestMergePlan(JSON.parse(JSON.stringify(backup)), storage(device));
  assert.deepEqual(JSON.parse(JSON.stringify(ours)), JSON.parse(JSON.stringify(theirs)));
  const writes = Object.fromEntries(guestWrites(ours));
  assert.deepEqual(JSON.parse(writes[GUEST_KEYS.ritualJournals]).map((r: Row) => r.title), ['Mine', 'New']);
  assert.deepEqual(JSON.parse(writes[GUEST_KEYS.settings]), { preferred_name: 'Here', pronouns: 'she/her' });
  assert.equal(writes[GUEST_KEYS.mundaneMode], 'true');
  assert.deepEqual(ours.conflicts, [{ section: 'ritualJournals', id: 'r1', resolution: 'kept-existing' }]);
});

function fakeDb(existing: Record<string, string[]>, settingsExist: boolean, failOn?: string) {
  const inserted: Record<string, Row[]> = {};
  const db: CloudRestoreDb = {
    existingIds: async (table, _user, ids) => ids.filter((id) => existing[table]?.includes(id)),
    hasSettingsRow: async () => settingsExist,
    insert: async (table, rows) => {
      if (table === failOn) return { error: new Error('nope') };
      inserted[table] = rows;
      return { error: null };
    },
  };
  return { db, inserted };
}

test('account restore adds only new rows, owned by the current account, in order', async () => {
  const backup = await createBackup(accountData(), { scope: 'authenticated-user' });
  const { db, inserted } = fakeDb({ grimoire_pages: ['p1'] }, true);
  const plan = await buildCloudMergePlan(backup, db, 'me');
  assert.deepEqual(
    plan.operations.map((o) => [o.table, o.rows.map((r) => r.id ?? null)]),
    [
      ['user_settings', []],
      ['grimoire_books', ['b1']],
      ['grimoire_pages', ['p2']],
    ],
  );
  assert.ok(plan.operations.every((o) => o.rows.every((r) => r.user_id === 'me')));
  assert.deepEqual(
    plan.conflicts.map((c) => c.table),
    ['user_settings', 'grimoire_pages'],
  );
  const stages: string[][] = [];
  const done = await applyCloudMergePlan(plan, db, { onStageComplete: (_t, s) => void stages.push(s) });
  assert.equal(done.error, null);
  assert.deepEqual(Object.keys(inserted), ['grimoire_books', 'grimoire_pages']);
});

test('a first-time account gets the settings from the backup', async () => {
  const backup = await createBackup(accountData());
  const { db } = fakeDb({}, false);
  const plan = await buildCloudMergePlan(backup, db, 'me');
  assert.equal(plan.operations[0].rows[0].preferred_name, 'Ash');
  assert.equal(plan.operations[0].rows[0].user_id, 'me');
});

test('a failed stage stops safely and resumes from its checkpoint', async () => {
  const backup = await createBackup(accountData());
  const first = fakeDb({}, false, 'grimoire_pages');
  const plan = await buildCloudMergePlan(backup, first.db, 'me');
  const stopped = await applyCloudMergePlan(plan, first.db);
  assert.equal(stopped.failedStage, 'grimoire_pages');
  assert.deepEqual(stopped.completedStages, ['user_settings', 'grimoire_books']);

  const retry = fakeDb({}, false);
  const resumed = await applyCloudMergePlan(plan, retry.db, { completedStages: stopped.completedStages });
  assert.equal(resumed.error, null);
  assert.deepEqual(Object.keys(retry.inserted), ['grimoire_pages']);
});

test('file names, summaries and the Book of Shadows subset', async () => {
  assert.equal(backupFileName('salt-and-sovereignty-backup', new Date('2026-09-25T12:00:00Z')), 'salt-and-sovereignty-backup-2026-09-25.json');
  const backup = await createBackup(accountData());
  assert.equal(countSummary(backup), '1 settings · 3 grimoire · 0 community');
  assert.deepEqual(Object.keys(bookOnlyData(accountData(), true)), ['grimoire', 'rituals']);
  assert.deepEqual(bookOnlyData({ ritualJournals: [1] }, false), { ritualJournals: [1], mundaneMode: false });
});
